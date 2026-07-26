import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import type { SessionEvent } from '@github/copilot-sdk'

function copilotHome(): string {
  return (
    process.env.COPILOT_HOME?.trim() ||
    path.join(process.env.HOME || process.cwd(), '.copilot')
  )
}

export async function readSessionEvents(
  sessionId: string,
): Promise<SessionEvent[]> {
  const filePath = path.join(
    copilotHome(),
    'session-state',
    sessionId,
    'events.jsonl',
  )
  let content = ''
  try {
    content = await readFile(filePath, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }

  const events: SessionEvent[] = []
  for (const line of content.split('\n')) {
    if (!line.trim()) {
      continue
    }
    try {
      events.push(JSON.parse(line) as SessionEvent)
    } catch {
      // The writer may leave the final line incomplete while a chunk is flushed.
    }
  }
  return events
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
