import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readSessionEvents, sessionEventLogVersion } from './event-log.js'

const directories: string[] = []

afterEach(async () => {
  vi.unstubAllEnvs()
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

describe('readSessionEvents', () => {
  it('reads complete events while ignoring an in-progress final line', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'event-log-test-'))
    directories.push(directory)
    vi.stubEnv('COPILOT_HOME', directory)
    const sessionDirectory = path.join(directory, 'session-state', 'session-1')
    await mkdir(sessionDirectory, { recursive: true })
    await writeFile(
      path.join(sessionDirectory, 'events.jsonl'),
      [
        JSON.stringify({
          type: 'user.message',
          id: 'event-1',
          parentId: null,
          timestamp: '2026-07-22T00:00:00.000Z',
          data: { content: 'hello' },
        }),
        '{"type":"assistant.message"',
      ].join('\n'),
    )

    const events = await readSessionEvents('session-1')

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ type: 'user.message' })
    expect(await sessionEventLogVersion('session-1')).toMatch(/^\d+:\d+/)
  })
})
