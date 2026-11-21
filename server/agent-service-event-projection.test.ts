import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { SessionEvent } from '@github/copilot-sdk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AgentService, messagesFromHistory } from './agent-service.js'
import type { CopilotClientLike } from './agent-service.js'
import { backgroundTasksFromEvents } from './background-task-adapter.js'
import { seededRandom } from './projection-test-helpers.js'
import { SessionStore } from './session-store.js'
import {
  checkedRuntimeInfoFromEvents,
  expectSessionProjectionEquivalence,
} from './transcript-test-helpers.js'

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
      pendingPermission: async () => undefined,
      pendingUserInput: async () => undefined,
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

  it('lists tasks and polls an unchanged log without copying the session', async () => {
    // A copy carries the whole transcript: for a long session it costs more
    // than everything else the list or the poll does.
    const { service, log, refresh } = await terminalService([])
    await refresh([...launch('first', 1), ...finish('first', 2)])
    const copies = vi.spyOn(service.store, 'get')

    const { tasks } = await service.listBackgroundTasks(sessionId)
    await (service as unknown as { syncSessionTranscript(id: string): Promise<void> })
      .syncSessionTranscript(sessionId)

    expect(copies).not.toHaveBeenCalled()
    expect(tasks).toEqual(projected(log.events))
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

describe('session projection', () => {
  /** A soak run sets this to explore new seeds; failures name the seed. */
  const seedOffset = Number(process.env.PROPERTY_SEED_OFFSET ?? 0)
  const emptyReply = 'No response was returned. Send your message again to retry.'

  /**
   * A log mixing lifecycle, agents, shells, runtime and folder changes,
   * compactions and questions, so every answer the projection gives moves.
   */
  function sessionLog(seed: number, length: number): SessionEvent[] {
    const next = seededRandom(seed)
    const pick = <T,>(values: readonly T[]): T => values[Math.floor(next() * values.length)]
    const chance = (probability: number) => next() < probability
    const events: SessionEvent[] = []
    let clock = Date.UTC(2026, 10, 20, 9)
    for (let index = 0; index < length; index += 1) {
      clock += pick([0, 1_000, 1_000, 7_000, -3_000])
      const agentId = chance(0.2) ? pick(['agent-1', 'agent-2']) : undefined
      const onEnvelope = agentId !== undefined && chance(0.5)
      const owner = agentId && !onEnvelope ? { agentId } : {}
      const base = {
        id: `event-${index}`, parentId: null, timestamp: new Date(clock).toISOString(),
        ...(onEnvelope ? { agentId } : {}),
      }
      const callId = pick(['call-1', 'call-2', 'call-3'])
      const model = pick(['model-a', 'model-b', '', undefined])
      const kind = next()
      let event: Record<string, unknown>
      if (kind < 0.12) {
        event = { ...base, type: pick(['assistant.turn_start', 'assistant.turn_end', 'session.idle', 'abort']), data: owner }
      } else if (kind < 0.18) {
        event = {
          ...base, type: 'session.error',
          data: { ...owner, ...(chance(0.7) ? { errorType: 'query', message: emptyReply } : { errorType: 'runtime', message: 'Disconnected' }) },
        }
      } else if (kind < 0.24) {
        event = { ...base, type: pick(['permission.requested', 'permission.completed']), data: { ...owner, requestId: callId } }
      } else if (kind < 0.32) {
        event = {
          ...base, agentId: pick(['agent-1', 'agent-2']),
          type: pick(['subagent.started', 'subagent.completed', 'subagent.failed']),
          data: { toolCallId: callId, agentName: 'explore', agentDisplayName: 'Explore', agentDescription: 'Explore' },
        }
      } else if (kind < 0.42) {
        event = {
          ...base, type: 'tool.execution_start',
          data: {
            ...owner, toolCallId: callId, toolName: pick(['bash', 'ask_user', 'view']),
            ...(model === undefined ? {} : { model }),
            arguments: { command: `run ${index}`, question: `Pick ${index}`, ...(chance(0.4) ? { mode: pick(['sync', 'async']) } : {}) },
          },
        }
      } else if (kind < 0.5) {
        event = {
          ...base, type: 'tool.execution_complete',
          data: {
            ...owner, toolCallId: callId, success: chance(0.8),
            result: {
              content: pick([
                `output ${index}`,
                '<command with shellId: 0 moved to background by the user. You will be automatically notified when it completes.>',
                `<shellId: 0 completed with exit code ${pick([0, 1])}>`,
              ]),
              ...(chance(0.3) ? { structuredContent: { shellId: '0' } } : {}),
            },
          },
        }
      } else if (kind < 0.55) {
        event = { ...base, type: 'system.notification', data: { kind: { type: 'shell_completed', shellId: '0', exitCode: pick([0, 1]) } } }
      } else if (kind < 0.62) {
        event = { ...base, type: 'user.message', data: { ...owner, content: 'x'.repeat(Math.floor(next() * 40)) } }
      } else if (kind < 0.68) {
        event = {
          ...base, type: 'assistant.message',
          data: { ...owner, messageId: `message-${index}`, content: 'y'.repeat(Math.floor(next() * 40)), ...(model === undefined ? {} : { model }) },
        }
      } else if (kind < 0.74) {
        event = {
          ...base, type: pick(['session.start', 'session.resume']),
          data: {
            ...owner,
            ...(model === undefined ? {} : { selectedModel: model }),
            ...(chance(0.5) ? { reasoningEffort: pick(['low', 'high', '']) } : {}),
            ...(chance(0.5) ? { contextTier: pick(['default', 'long_context']) } : {}),
            ...(chance(0.7) ? { context: { cwd: pick(['/work/a', '/work/b', ' ']) } } : {}),
          },
        }
      } else if (kind < 0.8) {
        event = {
          ...base, type: pick(['session.model_change', 'session.mode_changed', 'session.permissions_changed', 'session.context_changed']),
          data: {
            ...owner,
            newModel: model, newMode: pick(['plan', 'autopilot', '']),
            ...(chance(0.7) ? { allowAllPermissions: chance(0.5) } : {}),
            cwd: pick(['/work/c', '', undefined]),
          },
        }
      } else if (kind < 0.86 && seed % 2) {
        // Only odd seeds report usage, so even ones estimate the context.
        event = {
          ...base, type: 'session.usage_info',
          data: { ...owner, currentTokens: pick([0, 120, 900, undefined]), tokenLimit: pick([0, 2_000, undefined]) },
        }
      } else if (kind < 0.93) {
        event = {
          ...base, type: pick(['session.compaction_start', 'session.compaction_complete']),
          data: {
            ...owner,
            systemTokens: pick([0, 40, undefined]), conversationTokens: pick([0, 300]), toolDefinitionsTokens: pick([0, 25]),
            success: chance(0.7), summaryContent: 'z'.repeat(Math.floor(next() * 60)),
          },
        }
      } else {
        event = { ...base, type: 'session.shutdown', data: owner }
      }
      events.push(event as unknown as SessionEvent)
    }
    return events
  }

  it('estimates the context from the last compaction and what was said since', () => {
    const logged = (type: string, data: Record<string, unknown>, second: number) =>
      ({ type, id: `${type}-${second}`, parentId: null, timestamp: at(second), data }) as unknown as SessionEvent
    const events = [
      logged('session.compaction_start', { systemTokens: 100, conversationTokens: 4_000, toolDefinitionsTokens: 50 }, 1),
      logged('user.message', { content: 'x'.repeat(40) }, 2),
      // 100 system and 50 tool tokens from its start, and 80 characters of summary.
      logged('session.compaction_complete', { success: true, summaryContent: 'y'.repeat(80) }, 3),
      logged('assistant.message', { messageId: 'reply', content: 'z'.repeat(12) }, 4),
      logged('tool.execution_complete', { toolCallId: 'call', success: true, result: 'w'.repeat(8) }, 5),
      logged('session.compaction_start', { systemTokens: 999, conversationTokens: 999 }, 6),
      logged('user.message', { content: 'v'.repeat(4) }, 7),
    ]

    expect(checkedRuntimeInfoFromEvents(events, undefined)).toEqual({
      contextTokens: 150 + 20 + 6,
      contextEstimated: true,
    })
  })

  it('answers as the full scans do at every prefix of generated logs', () => {
    const previous = [
      undefined,
      { model: 'model-old', contextTokens: 50, contextEstimated: true },
      { contextTokens: 50, contextTokenLimit: 9_000, contextEstimated: false },
    ]
    for (let seed = seedOffset + 1; seed <= seedOffset + 60; seed += 1) {
      const events = sessionLog(seed, 6 + (seed % 30))
      expectSessionProjectionEquivalence(events, seed % 2 ? '/fallback' : undefined, previous[seed % 3], `seed ${seed}`)
    }
  })
})
