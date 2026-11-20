import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { SessionEvent } from '@github/copilot-sdk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AgentService, messagesFromHistory } from './agent-service.js'
import type { CopilotClientLike } from './agent-service.js'
import { backgroundTasksFromEvents } from './background-task-adapter.js'
import { SessionStore } from './session-store.js'

const sessionId = '6b1f8c2e-3d4a-4e5f-8a9b-0c1d2e3f4a5b'
const services: AgentService[] = []
const directories: string[] = []

beforeEach(() => {
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ROOTS', tmpdir())
})

afterEach(async () => {
  for (const service of services.splice(0)) await service.stop()
  for (const directory of directories.splice(0)) {
    await rm(directory, { recursive: true, force: true })
  }
  vi.unstubAllEnvs()
})

const at = (second: number) => new Date(Date.UTC(2026, 10, 20, 9, 0, second)).toISOString()

/** A shell launched with no mode, which a tmux session projects as background. */
function launch(name: string, second: number): SessionEvent[] {
  return [
    {
      type: 'tool.execution_start', id: `${name}-start`, parentId: null, timestamp: at(second),
      data: { toolCallId: `${name}-call`, toolName: 'bash', arguments: { command: `run ${name}` } },
    },
    {
      type: 'assistant.message', id: `${name}-said`, parentId: null, timestamp: at(second),
      data: { messageId: `${name}-message`, content: `Started ${name}` },
    },
  ] as SessionEvent[]
}

function finish(name: string, second: number): SessionEvent[] {
  return [{
    type: 'tool.execution_complete', id: `${name}-done`, parentId: null, timestamp: at(second),
    data: { toolCallId: `${name}-call`, success: true, result: { content: `${name} finished` } },
  }] as SessionEvent[]
}

/**
 * Events whose payload counts how often it is read, so a test can tell which
 * events a projection went back over.
 */
function counted(events: SessionEvent[], reads: Map<string, number>): SessionEvent[] {
  return events.map((event) => {
    const { data, ...envelope } = event as SessionEvent & { data: unknown }
    return Object.defineProperty({ ...envelope }, 'data', {
      enumerable: true,
      get: () => {
        reads.set(event.id, (reads.get(event.id) ?? 0) + 1)
        return data
      },
    }) as SessionEvent
  })
}

async function terminalService(initial: SessionEvent[]) {
  const directory = await mkdtemp(path.join(tmpdir(), 'agent-service-projection-'))
  directories.push(directory)
  // Deleting a terminal session removes its Copilot state from here.
  vi.stubEnv('COPILOT_HOME', directory)
  const log = { events: initial, version: 1 }
  const client = {
    start: async () => undefined,
    stop: async () => [],
    createSession: async () => { throw new Error('No SDK sessions in this fixture') },
    resumeSession: async () => { throw new Error('No SDK sessions in this fixture') },
    listSessions: async () => [],
    deleteSession: async () => undefined,
    rpc: {
      commands: { list: async () => ({ commands: [] }) },
      models: { list: async () => ({ models: [] }) },
    },
  }
  const service = new AgentService(
    new SessionStore(path.join(directory, 'state')),
    client as unknown as CopilotClientLike,
    async () => [{ id: sessionId, cwd: directory, title: 'Terminal session', updatedAt: at(0) }],
    async () => undefined,
    async () => [...log.events],
    async () => `${log.version}`,
    {
      has: async () => true,
      send: async () => true,
      cancel: async () => true,
      capture: async () => '',
      inputReady: async () => true,
    },
    async () => undefined,
    async () => undefined,
  )
  services.push(service)
  await service.start()
  // Only the calls a test makes read the log.
  const timers = service as unknown as Record<string, NodeJS.Timeout | undefined>
  for (const timer of ['transcriptTimer', 'transcriptWakeTimer', 'discoveryTimer']) clearInterval(timers[timer])
  const refresh = async (events: SessionEvent[]) => {
    log.events = events
    log.version += 1
    await (service as unknown as { syncSessionTranscript(id: string): Promise<void> })
      .syncSessionTranscript(sessionId)
  }
  return { service, log, refresh }
}

const projected = (events: SessionEvent[]) => backgroundTasksFromEvents(events, { assumeBackground: true })

describe('tmux session event projection', () => {
  it('takes in only the events appended since the last read', async () => {
    const reads = new Map<string, number>()
    const events = counted([...launch('first', 1), ...launch('second', 2)], reads)
    const { service, log } = await terminalService(events)
    await service.listBackgroundTasks(sessionId)
    const readBefore = new Map(reads)

    const appended = counted([...finish('first', 3), ...launch('third', 4)], reads)
    log.events = [...events, ...appended]
    const { tasks } = await service.listBackgroundTasks(sessionId)

    for (const event of events) expect(reads.get(event.id), event.id).toBe(readBefore.get(event.id))
    expect(tasks).toEqual(projected(log.events))
  })

  it('shares one projection between the transcript refresh and /tasks', async () => {
    const reads = new Map<string, number>()
    const events = counted(launch('first', 1), reads)
    const { service, refresh } = await terminalService([])
    await refresh(events)
    const readBefore = new Map(reads)

    const { tasks } = await service.listBackgroundTasks(sessionId)

    for (const event of events) expect(reads.get(event.id), event.id).toBe(readBefore.get(event.id))
    expect(tasks).toEqual(projected(events))
    expect(service.store.get(sessionId)?.messages).toEqual(messagesFromHistory(events))
  })

  it.each([
    [
      'rewritten at the last event it took in',
      [...launch('first', 1), ...launch('second', 2)],
      [...launch('first', 1), ...launch('replacement', 2), ...launch('third', 3)],
    ],
    [
      'shrunk',
      [...launch('first', 1), ...finish('first', 2), ...launch('second', 3)],
      [...launch('first', 1)],
    ],
    [
      // Its last event taken in is still where it was; only the first changed.
      'replaced by another log',
      [...launch('first', 1)],
      [launch('other', 1)[0], launch('first', 1)[1], ...launch('third', 3)],
    ],
  ])('starts over when the log was %s', async (_case, before, after) => {
    const { service, log, refresh } = await terminalService([])
    await refresh(before)
    await service.listBackgroundTasks(sessionId)

    await refresh(after)

    expect((await service.listBackgroundTasks(sessionId)).tasks).toEqual(projected(after))
    expect(service.store.get(sessionId)?.messages).toEqual(messagesFromHistory(log.events))
  })

  it.each([
    ['closed', (service: AgentService) => service.closeSession(sessionId)],
    ['deleted', (service: AgentService) => service.deleteSession(sessionId)],
  ])('forgets the projection when the session is %s', async (_case, end) => {
    const { service } = await terminalService(launch('first', 1))
    await service.listBackgroundTasks(sessionId)
    const projections = (service as unknown as { eventProjections: Map<string, unknown> }).eventProjections
    expect(projections.has(sessionId)).toBe(true)

    await end(service)

    expect(projections.has(sessionId)).toBe(false)
  })
})
