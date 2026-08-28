import { appendFile, mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  forgetSessionEvents,
  readSessionEvents,
  readSessionWorkspaceMetadata,
  sessionEventLogVersion,
  sessionWorkspaceVersion,
} from './event-log.js'

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

  it('reads current cwd and title from workspace metadata', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'event-log-test-'))
    directories.push(directory)
    vi.stubEnv('COPILOT_HOME', directory)
    const sessionDirectory = path.join(directory, 'session-state', 'session-1')
    await mkdir(sessionDirectory, { recursive: true })
    await writeFile(
      path.join(sessionDirectory, 'workspace.yaml'),
      [
        'id: session-1',
        'cwd: "/tmp/project with spaces"',
        "name: 'Current project'",
        'updated_at: 2026-07-26T04:00:00.000Z',
      ].join('\n'),
    )

    await expect(readSessionWorkspaceMetadata('session-1')).resolves.toEqual({
      cwd: '/tmp/project with spaces',
      title: 'Current project',
      updatedAt: '2026-07-26T04:00:00.000Z',
    })
    await expect(sessionWorkspaceVersion('session-1')).resolves.toMatch(
      /^\d+:\d+/,
    )
  })

  it('parses only appended events and completes a partial line', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'event-log-test-'))
    directories.push(directory)
    vi.stubEnv('COPILOT_HOME', directory)
    const sessionDirectory = path.join(directory, 'session-state', 'session-1')
    await mkdir(sessionDirectory, { recursive: true })
    const logPath = path.join(sessionDirectory, 'events.jsonl')
    const event = (id: string) =>
      JSON.stringify({
        type: 'user.message',
        id,
        parentId: null,
        timestamp: '2026-07-22T00:00:00.000Z',
        data: { content: `hello ${id}` },
      })

    await writeFile(logPath, `${event('event-1')}\n`)
    expect(await readSessionEvents('session-1')).toHaveLength(1)

    // A half-written line is withheld until its newline arrives.
    const second = event('event-2')
    await appendFile(logPath, second.slice(0, 10))
    expect(await readSessionEvents('session-1')).toHaveLength(1)

    await appendFile(logPath, `${second.slice(10)}\n${event('event-3')}\n`)
    const events = await readSessionEvents('session-1')
    expect(events.map((entry) => entry.id)).toEqual([
      'event-1',
      'event-2',
      'event-3',
    ])
  })

  it('returns a complete final line that has no trailing newline', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'event-log-test-'))
    directories.push(directory)
    vi.stubEnv('COPILOT_HOME', directory)
    const sessionDirectory = path.join(directory, 'session-state', 'session-4')
    await mkdir(sessionDirectory, { recursive: true })
    const logPath = path.join(sessionDirectory, 'events.jsonl')
    const event = (id: string) =>
      JSON.stringify({
        type: 'user.message',
        id,
        parentId: null,
        timestamp: '2026-07-22T00:00:00.000Z',
        data: { content: 'hello' },
      })

    await writeFile(logPath, `${event('event-1')}\n${event('event-2')}`)
    expect(
      (await readSessionEvents('session-4')).map((entry) => entry.id),
    ).toEqual(['event-1', 'event-2'])

    // The same event must not be counted twice once its newline arrives.
    await appendFile(logPath, '\n')
    expect(
      (await readSessionEvents('session-4')).map((entry) => entry.id),
    ).toEqual(['event-1', 'event-2'])
  })

  it('re-reads a rotated or rewritten event log', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'event-log-test-'))
    directories.push(directory)
    vi.stubEnv('COPILOT_HOME', directory)
    const sessionDirectory = path.join(directory, 'session-state', 'session-2')
    await mkdir(sessionDirectory, { recursive: true })
    const logPath = path.join(sessionDirectory, 'events.jsonl')
    const event = (id: string) =>
      JSON.stringify({
        type: 'user.message',
        id,
        parentId: null,
        timestamp: '2026-07-22T00:00:00.000Z',
        data: { content: 'hello' },
      })

    await writeFile(logPath, `${event('event-1')}\n${event('event-2')}\n`)
    expect(await readSessionEvents('session-2')).toHaveLength(2)

    // Rotation shrinks the file, so the cached prefix must be discarded.
    await writeFile(logPath, `${event('event-9')}\n`)
    const rotated = await readSessionEvents('session-2')
    expect(rotated.map((entry) => entry.id)).toEqual(['event-9'])

    // An in-place rewrite keeps the size but changes the content.
    await writeFile(logPath, `${event('event-8')}\n`)
    const rewritten = await readSessionEvents('session-2')
    expect(rewritten.map((entry) => entry.id)).toEqual(['event-8'])

    // A rewrite that also grows the file must not reuse the cached prefix.
    await writeFile(
      logPath,
      `${event('event-a')}\n${event('event-b')}\n${event('event-c')}\n`,
    )
    const regrown = await readSessionEvents('session-2')
    expect(regrown.map((entry) => entry.id)).toEqual([
      'event-a',
      'event-b',
      'event-c',
    ])
  })

  it('forgets a cached log so a reused session id re-reads from disk', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'event-log-test-'))
    directories.push(directory)
    vi.stubEnv('COPILOT_HOME', directory)
    const sessionDirectory = path.join(directory, 'session-state', 'session-3')
    await mkdir(sessionDirectory, { recursive: true })
    const logPath = path.join(sessionDirectory, 'events.jsonl')
    await writeFile(
      logPath,
      `${JSON.stringify({
        type: 'user.message',
        id: 'event-1',
        parentId: null,
        timestamp: '2026-07-22T00:00:00.000Z',
        data: { content: 'hello' },
      })}\n`,
    )

    expect(await readSessionEvents('session-3')).toHaveLength(1)
    forgetSessionEvents('session-3')
    expect(await readSessionEvents('session-3')).toHaveLength(1)
  })
})
