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
