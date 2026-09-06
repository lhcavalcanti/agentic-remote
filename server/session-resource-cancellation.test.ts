import { EventEmitter, getEventListeners } from 'node:events'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessionDetail, SessionSkillsSnapshot } from '../shared/contracts.js'
import type { SessionService } from './session-service.js'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { readSessionSkills, resourceRequestHandler } from './session-resources.js'

const session: SessionDetail = {
  id: 'session', provider: 'copilot', cwd: '/fixture', executionMode: 'sdk',
  title: 'Fixture', status: 'idle', updatedAt: '2026-09-05T00:00:00Z', messages: [],
}
const snapshot: SessionSkillsSnapshot = {
  sessionId: session.id, provider: 'copilot', scope: 'session',
  capturedAt: session.updatedAt, skills: [],
}
const releases: (() => void)[] = []

function fixture() {
  const events = new EventEmitter()
  const pending = new Set<symbol>()
  let providerSignal: AbortSignal | undefined
  const listSkills = vi.fn((_id: string, signal?: AbortSignal) => {
    providerSignal = signal
    const id = Symbol()
    pending.add(id)
    return new Promise<SessionSkillsSnapshot>((resolve, reject) => {
      const cleanup = () => {
        pending.delete(id)
        signal?.removeEventListener('abort', abort)
      }
      const abort = () => { cleanup(); reject(signal?.reason) }
      releases.push(() => { cleanup(); resolve(snapshot) })
      if (signal?.aborted) abort()
      else signal?.addEventListener('abort', abort, { once: true })
    })
  })
  const service = Object.assign(events, {
    getSession: () => structuredClone(session),
    providers: () => [{ id: 'copilot', supportsSessionResources: true }],
    listSkills,
  }) as unknown as SessionService
  return { events, pending, listSkills, service, signal: () => providerSignal }
}

afterEach(() => {
  releases.splice(0).forEach((release) => release())
  vi.useRealTimers()
})

describe('resource read cancellation', () => {
  it('redacts reader failures at the HTTP boundary and still removes request listeners', async () => {
    const request = new EventEmitter()
    const response = new EventEmitter()
    const handler = resourceRequestHandler({ addHook: vi.fn() } as unknown as FastifyInstance)
    await expect(handler(
      { raw: request } as unknown as FastifyRequest,
      { raw: response } as unknown as FastifyReply,
      async () => { throw new Error('PRIVATE_IDENTITY_READ_FAILURE') },
    )).rejects.toMatchObject({ statusCode: 502, message: 'Unable to read session resource metadata.' })
    expect(request.listenerCount('aborted')).toBe(0)
    expect(response.listenerCount('close')).toBe(0)
  })

  it.each(['aborted', 'closed'] as const)('does not admit HTTP work after the request is already %s', async (state) => {
    const request = new EventEmitter()
    const response = new EventEmitter()
    const read = vi.fn(async () => snapshot)
    const handler = resourceRequestHandler({ addHook: vi.fn() } as unknown as FastifyInstance)
    await expect(handler(
      { raw: Object.assign(request, { aborted: state === 'aborted' }) } as unknown as FastifyRequest,
      { raw: Object.assign(response, { destroyed: state === 'closed' }) } as unknown as FastifyReply,
      read,
    )).rejects.toMatchObject({ statusCode: 499 })
    expect(read).not.toHaveBeenCalled()
    expect(request.listenerCount('aborted')).toBe(0)
    expect(response.listenerCount('close')).toBe(0)
  })

  it.each(['success', 'failure'] as const)('removes observers after provider %s', async (outcome) => {
    vi.useFakeTimers()
    const { service, listSkills, events } = fixture()
    let signal!: AbortSignal
    listSkills.mockImplementationOnce(async (_id, received) => {
      signal = received!
      if (outcome === 'failure') throw new Error('PRIVATE_PROVIDER_DIAGNOSTIC')
      return snapshot
    })
    const controller = new AbortController()
    const reading = readSessionSkills(service, 'session', controller.signal)
    if (outcome === 'success') expect(await reading).toMatchObject(snapshot)
    else await expect(reading).rejects.toMatchObject({ message: 'Unable to read session resource metadata.', statusCode: 502 })
    expect(signal.aborted).toBe(false)
    expect(events.listenerCount('event')).toBe(0)
    expect(getEventListeners(signal, 'abort')).toHaveLength(0)
    expect(getEventListeners(controller.signal, 'abort')).toHaveLength(0)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('does not admit a provider read for an already-aborted request', async () => {
    const { service, listSkills, events } = fixture()
    const controller = new AbortController()
    controller.abort()
    let settled = false
    void readSessionSkills(service, 'session', controller.signal).then(
      () => { settled = true },
      () => { settled = true },
    )
    for (let i = 0; i < 8; i += 1) await Promise.resolve()
    expect(listSkills).not.toHaveBeenCalled()
    expect(events.listenerCount('event')).toBe(0)
    expect(settled).toBe(true)
  })

  it.each(['abort', 'timeout', 'owner'] as const)('settles the provider read and removes every observer after %s', async (reason) => {
    vi.useFakeTimers()
    const { service, events, pending, signal } = fixture()
    const controller = new AbortController()
    let result: unknown
    const reading = readSessionSkills(service, 'session', controller.signal).catch((error: unknown) => { result = error })
    expect(pending.size).toBe(1)
    if (reason === 'abort') controller.abort()
    else if (reason === 'owner') {
      events.emit('event', { type: 'session.upserted', session: { ...session, cwd: '/other' } })
    } else await vi.advanceTimersByTimeAsync(10_001)
    for (let i = 0; i < 8; i += 1) await Promise.resolve()
    expect(pending.size).toBe(0)
    expect(events.listenerCount('event')).toBe(0)
    expect(signal()?.aborted).toBe(true)
    expect(getEventListeners(controller.signal, 'abort')).toHaveLength(0)
    expect(getEventListeners(signal()!, 'abort')).toHaveLength(0)
    expect(result).toMatchObject({ statusCode: reason === 'timeout' ? 504 : reason === 'owner' ? 409 : 499 })
    await reading
    expect(vi.getTimerCount()).toBe(0)
  })
})
