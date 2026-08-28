import { open, readFile, stat } from 'node:fs/promises'
import type { FileHandle } from 'node:fs/promises'
import path from 'node:path'
import type { SessionEvent } from '@github/copilot-sdk'

function copilotHome(): string {
  return (
    process.env.COPILOT_HOME?.trim() ||
    path.join(process.env.HOME || process.cwd(), '.copilot')
  )
}

function eventLogPath(sessionId: string): string {
  return path.join(
    copilotHome(),
    'session-state',
    sessionId,
    'events.jsonl',
  )
}

type ParsedLog = {
  /** Bytes of the file already folded into `events` and `remainder`. */
  consumed: number
  mtimeMs: number
  ino: number
  /** Start of the file, used to detect a rewrite that also grew the file. */
  head: Buffer
  events: SessionEvent[]
  /** Trailing bytes that do not yet form a complete line. */
  remainder: Buffer
}

const headSampleBytes = 256

/**
 * Parsed tails are retained so an appended event log costs only the appended
 * bytes instead of re-parsing the whole file on every poll. Only a handful of
 * sessions append concurrently, so the cache is bounded and evicts the least
 * recently used entry.
 */
const parsedLogs = new Map<string, ParsedLog>()
const maxCachedLogs = 16

function cacheKey(sessionId: string): string {
  return `${copilotHome()}\u0000${sessionId}`
}

function takeCached(key: string): ParsedLog | undefined {
  const cached = parsedLogs.get(key)
  if (cached) {
    parsedLogs.delete(key)
  }
  return cached
}

function storeCached(key: string, log: ParsedLog): void {
  parsedLogs.set(key, log)
  while (parsedLogs.size > maxCachedLogs) {
    const oldest = parsedLogs.keys().next()
    if (oldest.done) {
      break
    }
    parsedLogs.delete(oldest.value)
  }
}

export function forgetSessionEvents(sessionId: string): void {
  parsedLogs.delete(cacheKey(sessionId))
}

function appendLines(log: ParsedLog, chunk: Buffer): void {
  let buffer = log.remainder.length > 0
    ? Buffer.concat([log.remainder, chunk])
    : chunk
  let start = 0
  for (
    let newline = buffer.indexOf(0x0a, start);
    newline !== -1;
    newline = buffer.indexOf(0x0a, start)
  ) {
    const line = buffer.toString('utf8', start, newline).trim()
    start = newline + 1
    if (!line) {
      continue
    }
    try {
      log.events.push(JSON.parse(line) as SessionEvent)
    } catch {
      // A truncated line is skipped; the writer rewrites it as it flushes.
    }
  }
  // `subarray` would keep the whole read buffer alive, so copy the few
  // trailing bytes instead of retaining a multi-megabyte allocation.
  log.remainder =
    start < buffer.length
      ? Buffer.from(buffer.subarray(start))
      : Buffer.alloc(0)
}

async function readAt(
  handle: FileHandle,
  position: number,
  length: number,
): Promise<Buffer> {
  if (length <= 0) {
    return Buffer.alloc(0)
  }
  const buffer = Buffer.allocUnsafe(length)
  const { bytesRead } = await handle.read(buffer, 0, length, position)
  return bytesRead === length ? buffer : Buffer.from(buffer.subarray(0, bytesRead))
}

export async function readSessionEvents(
  sessionId: string,
): Promise<SessionEvent[]> {
  const filePath = eventLogPath(sessionId)
  const key = cacheKey(sessionId)
  let size: number
  let mtimeMs: number
  let ino: number
  try {
    const metadata = await stat(filePath)
    size = metadata.size
    mtimeMs = metadata.mtimeMs
    ino = Number(metadata.ino)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      parsedLogs.delete(key)
      return []
    }
    throw error
  }

  const cached = takeCached(key)
  const handle = await open(filePath, 'r')
  try {
    const head = await readAt(handle, 0, Math.min(headSampleBytes, size))
    // Reuse the parsed prefix only for the same file growing by appending. A
    // shrunken file was rotated, an unchanged size with a new mtime was
    // rewritten in place, and a changed head means the file was rewritten even
    // if it also grew.
    const reusable =
      cached &&
      cached.ino === ino &&
      cached.consumed <= size &&
      cached.head.equals(head) &&
      (cached.consumed < size || cached.mtimeMs === mtimeMs)
    const log: ParsedLog = reusable
      ? cached
      : {
          consumed: 0,
          mtimeMs,
          ino,
          head,
          events: [],
          remainder: Buffer.alloc(0),
        }
    log.mtimeMs = mtimeMs
    log.head = head

    if (size > log.consumed) {
      const chunk = await readAt(handle, log.consumed, size - log.consumed)
      appendLines(log, chunk)
      log.consumed += chunk.length
    }

    storeCached(key, log)
    // The parsed events are cached, so hand back a copy callers cannot mutate.
    const events = [...log.events]
    // A final line with no newline yet is still returned when it already
    // parses, matching the previous whole-file read. It stays in `remainder` so
    // it is not counted twice once its newline arrives.
    const trailing = log.remainder.toString('utf8').trim()
    if (trailing) {
      try {
        events.push(JSON.parse(trailing) as SessionEvent)
      } catch {
        // Still mid-flush; it is picked up once the writer completes the line.
      }
    }
    return events
  } finally {
    await handle.close()
  }
}

export async function sessionEventLogVersion(
  sessionId: string,
): Promise<string | undefined> {
  const filePath = path.join(
    copilotHome(),
    'session-state',
    sessionId,
    'events.jsonl',
  )
  try {
    const metadata = await stat(filePath)
    return `${metadata.size}:${metadata.mtimeMs}`
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined
    }
    throw error
  }
}

export interface SessionWorkspaceMetadata {
  cwd?: string
  title?: string
  updatedAt?: string
}

function yamlScalar(value: string): string {
  const trimmed = value.trim()
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed) as string
    } catch {
      return trimmed.slice(1, -1)
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replaceAll("''", "'")
  }
  return trimmed
}

export async function readSessionWorkspaceMetadata(
  sessionId: string,
): Promise<SessionWorkspaceMetadata | undefined> {
  const filePath = path.join(
    copilotHome(),
    'session-state',
    sessionId,
    'workspace.yaml',
  )
  try {
    const content = await readFile(filePath, 'utf8')
    const values = new Map<string, string>()
    for (const line of content.split('\n')) {
      const match = line.match(/^([a-z_]+):\s*(.*)$/)
      if (match) {
        values.set(match[1], yamlScalar(match[2]))
      }
    }
    return {
      cwd: values.get('cwd') || undefined,
      title: values.get('name') || undefined,
      updatedAt: values.get('updated_at') || undefined,
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined
    }
    throw error
  }
}

export async function sessionWorkspaceVersion(
  sessionId: string,
): Promise<string | undefined> {
  const filePath = path.join(
    copilotHome(),
    'session-state',
    sessionId,
    'workspace.yaml',
  )
  try {
    const metadata = await stat(filePath)
    return `${metadata.size}:${metadata.mtimeMs}`
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined
    }
    throw error
  }
}
