import { describe, expect, it } from 'vitest'
import type {
  ChatMessage,
  HubEvent,
  HubResyncRequest,
  HubWireEvent,
  ManagedSession,
} from '../shared/contracts.js'
import { SessionPatchReceiver } from '../src/session-patches.js'
import { diffMessages, type PatchSocket, SessionPublications } from './session-patches.js'

function random(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

const at = '2026-01-01T00:00:00.000Z'

function session(id: string, messages: ChatMessage[], extra: Partial<ManagedSession> = {}): ManagedSession {
  return {
    id, computerId: 'local', computerName: 'Local', cwd: '/project', title: id,
    updatedAt: at, status: 'idle', isOpen: true, messages, ...extra,
  }
}

/** A browser socket: what it was sent, and what it made of it. */
class Browser {
  readonly sent: string[] = []
  readonly seen = new Map<string, ManagedSession>()
  readonly resyncs: HubResyncRequest[] = []
  resyncCount = 0
  readonly receiver = new SessionPatchReceiver((request) => {
    this.resyncCount += 1
    this.resyncs.push(request)
  })
  readyState = 1
  dropNext = false
  readonly socket: PatchSocket

  constructor(patches: boolean) {
    this.socket = {
      readyState: 1,
      send: (payload) => this.deliver(payload),
      ...(patches ? { patchVersions: new Map<string, number>() } : {}),
    }
  }

  deliver(payload: string): void {
    this.sent.push(payload)
    if (this.dropNext) {
      // A frame lost between the hub and the page's handler.
      this.dropNext = false
      return
    }
    const event = this.receiver.receive(JSON.parse(payload) as HubWireEvent)
    if (event?.type === 'session.upserted') {
      expect(event).not.toHaveProperty('patchVersion')
      this.seen.set(`${event.session.computerId}:${event.session.id}`, event.session)
    } else if (event?.type === 'session.removed') {
      this.seen.delete(`${event.computerId}:${event.sessionId}`)
    }
  }
}

describe('diffMessages', () => {
  it('keeps the shared prefix and sends the rest', () => {
    const a = { id: 'a', role: 'user' as const, content: 'one', createdAt: at }
    const b = { id: 'b', role: 'assistant' as const, content: 'two', createdAt: at }
    expect(diffMessages([a, b], [a, b])).toEqual({ keep: 2, messages: [] })
    expect(diffMessages([a, b], [a, { ...b, content: 'two!' }])).toEqual({ keep: 1, messages: [{ ...b, content: 'two!' }] })
    expect(diffMessages([a, b], [b])).toEqual({ keep: 0, messages: [b] })
    expect(diffMessages([a], [{ ...a, streaming: undefined }]).keep).toBe(0)
    expect(diffMessages([], [a]).keep).toBe(0)
  })
})

describe('session publications', () => {
  it('sends a socket that did not ask for patches whole sessions, unchanged', () => {
    const publications = new SessionPublications()
    const legacy = new Browser(false)
    publications.add(legacy.socket)
    const event: HubEvent = { type: 'session.upserted', session: session('a', []) }
    publications.broadcast(event)
    publications.broadcast(event)
    expect(legacy.sent).toEqual([JSON.stringify(event), JSON.stringify(event)])
  })

  it('serializes each payload once however many sockets receive it', () => {
    const publications = new SessionPublications()
    const browsers = [new Browser(true), new Browser(true), new Browser(false)]
    for (const browser of browsers) publications.add(browser.socket)
    const messages = [{ id: 'm', role: 'user' as const, content: 'x', createdAt: at }]
    publications.broadcast({ type: 'session.upserted', session: session('a', messages) })
    const original = JSON.stringify
    let calls = 0
    JSON.stringify = ((...args: Parameters<typeof JSON.stringify>) => {
      calls += 1
      return original(...args)
    }) as typeof JSON.stringify
    try {
      publications.broadcast({ type: 'session.upserted', session: session('a', [...messages, { ...messages[0], id: 'n' }]) })
    } finally {
      JSON.stringify = original
    }
    // One patch for both patching sockets, one whole session for the other.
    expect(calls).toBe(2)
    expect(JSON.parse(browsers[0].sent[1]).type).toBe('session.patched')
    expect(browsers[0].sent[1]).toBe(browsers[1].sent[1])
  })

  it('is not changed by a listener altering the event after it was sent', () => {
    const publications = new SessionPublications()
    const browser = new Browser(true)
    publications.add(browser.socket)
    const first = session('a', [{ id: 'm', role: 'assistant', content: 'one', createdAt: at }])
    publications.broadcast({ type: 'session.upserted', session: first })
    first.messages[0].content = 'altered in place'
    publications.broadcast({ type: 'session.upserted', session: session('a', [{ id: 'm', role: 'assistant', content: 'one', createdAt: at }, { id: 'n', role: 'user', content: 'two', createdAt: at }]) })
    expect(browser.seen.get('local:a')!.messages.map((message) => message.content)).toEqual(['one', 'two'])
  })

  it('ignores a resync for a session it never published, and from a socket without patches', () => {
    const publications = new SessionPublications()
    const browser = new Browser(true)
    const legacy = new Browser(false)
    publications.add(browser.socket)
    publications.add(legacy.socket)
    publications.resync(browser.socket, 'local', 'missing')
    publications.resync(legacy.socket, 'local', 'missing')
    expect(browser.sent).toEqual([])
    expect(legacy.sent).toEqual([])
  })

  it('forgets publications when no patching socket remains', () => {
    const publications = new SessionPublications()
    const browser = new Browser(true)
    publications.add(browser.socket)
    publications.broadcast({ type: 'session.upserted', session: session('a', []) })
    publications.delete(browser.socket)
    expect((publications as unknown as { publications: Map<string, unknown> }).publications.size).toBe(0)
  })

  it('converges every browser on exactly what was published, whatever happens in between', () => {
    let patched = 0
    let resynced = 0
    for (let seed = 1; seed <= 150; seed += 1) {
      const next = random(seed)
      const publications = new SessionPublications()
      const browsers: Browser[] = []
      const latest = new Map<string, ManagedSession>()
      const join = () => {
        const browser = new Browser(next() < 0.8)
        browsers.push(browser)
        publications.add(browser.socket)
        // A new socket's page lists sessions before it relies on events.
        for (const [key, value] of latest) browser.seen.set(key, JSON.parse(JSON.stringify(value)))
      }
      join()
      for (let step = 0; step < 120; step += 1) {
        const choice = next()
        const id = `s${Math.floor(next() * 4)}`
        const key = `local:${id}`
        const previous = latest.get(key)?.messages ?? []
        if (choice < 0.05) {
          join()
          continue
        }
        if (choice < 0.08 && browsers.length > 1) {
          const leaving = browsers.splice(Math.floor(next() * browsers.length), 1)[0]
          leaving.socket.readyState = 3
          publications.delete(leaving.socket)
          continue
        }
        if (choice < 0.12) {
          latest.delete(key)
          publications.broadcast({ type: 'session.removed', computerId: 'local', sessionId: id })
          continue
        }
        if (choice < 0.14) {
          // A frame is lost on one patching socket; it must resync, not diverge.
          const patching = browsers.filter((browser) => browser.socket.patchVersions)
          if (patching.length) patching[Math.floor(next() * patching.length)].dropNext = true
        }
        let messages = previous.map((message) => ({ ...message }))
        const edit = next()
        if (edit < 0.45) {
          messages.push({ id: `m${step}`, role: next() < 0.5 ? 'user' : 'assistant', content: `step ${step}`, createdAt: at })
        } else if (edit < 0.6 && messages.length) {
          messages[messages.length - 1] = { ...messages.at(-1)!, content: `${messages.at(-1)!.content}+`, streaming: next() < 0.5 }
        } else if (edit < 0.7 && messages.length) {
          const index = Math.floor(next() * messages.length)
          messages[index] = { ...messages[index], activityStatus: 'completed' }
        } else if (edit < 0.75) {
          messages = []
        } else if (edit < 0.82 && messages.length > 1) {
          messages.splice(Math.floor(next() * messages.length), 1)
        } else if (edit < 0.86) {
          messages.unshift({ id: `notice${step}`, role: 'notice', content: 'earlier', createdAt: at })
        }
        const published = session(id, messages, { status: next() < 0.5 ? 'running' : 'idle', revision: step })
        latest.set(key, published)
        publications.broadcast({ type: 'session.upserted', session: published })
        // A resync is answered in order, after whatever was already sent.
        for (const browser of browsers) {
          for (const request of browser.resyncs.splice(0)) {
            publications.resync(browser.socket, request.computerId, request.sessionId)
          }
        }
      }
      // Settle any socket still waiting on a resync before it was answered.
      for (const [key, value] of latest) {
        publications.broadcast({ type: 'session.upserted', session: value })
        for (const browser of browsers) {
          for (const request of browser.resyncs.splice(0)) {
            publications.resync(browser.socket, request.computerId, request.sessionId)
          }
        }
        for (const browser of browsers) {
          expect(browser.seen.get(key), `seed ${seed} ${key}`).toEqual(JSON.parse(JSON.stringify(value)))
        }
      }
      for (const browser of browsers) {
        for (const key of browser.seen.keys()) expect(latest.has(key), `seed ${seed} removed ${key}`).toBe(true)
        patched += browser.sent.filter((payload) => payload.startsWith('{"type":"session.patched"')).length
      }
      resynced += browsers.reduce((total, browser) => total + browser.resyncCount, 0)
    }
    // Not vacuous: most deliveries were patches, and lost frames were recovered.
    expect(patched).toBeGreaterThan(5_000)
    expect(resynced).toBeGreaterThan(50)
  })
})

describe('session patch receiver', () => {
  it('asks once for a session whose patch does not apply, and drops patches until it arrives', () => {
    const requests: HubResyncRequest[] = []
    const receiver = new SessionPatchReceiver((request) => requests.push(request))
    const { messages: _messages, ...summary } = session('a', [])
    const patch = (from: number, to: number): HubWireEvent => ({
      type: 'session.patched', session: summary, patch: { from, to, keep: 0, count: 0, messages: [] },
    })
    expect(receiver.receive(patch(1, 2))).toBeUndefined()
    expect(receiver.receive(patch(2, 3))).toBeUndefined()
    expect(requests).toEqual([{ type: 'session.resync', computerId: 'local', sessionId: 'a' }])
    expect(receiver.receive({ type: 'session.upserted', session: session('a', []), patchVersion: 5 }))
      .toEqual({ type: 'session.upserted', session: session('a', []) })
    expect(receiver.receive(patch(5, 6))).toEqual({ type: 'session.upserted', session: session('a', []) })
    expect(receiver.receive(patch(5, 6))).toBeUndefined()
    expect(requests).toHaveLength(2)
  })

  it('rejects a patch whose counts do not add up', () => {
    const requests: HubResyncRequest[] = []
    const receiver = new SessionPatchReceiver((request) => requests.push(request))
    receiver.receive({ type: 'session.upserted', session: session('a', []), patchVersion: 1 })
    const { messages: _messages, ...summary } = session('a', [])
    expect(receiver.receive({
      type: 'session.patched', session: summary, patch: { from: 1, to: 2, keep: 1, count: 1, messages: [] },
    })).toBeUndefined()
    expect(requests).toHaveLength(1)
  })

  it('treats a whole session without a version as having no base', () => {
    const requests: HubResyncRequest[] = []
    const receiver = new SessionPatchReceiver((request) => requests.push(request))
    receiver.receive({ type: 'session.upserted', session: session('a', []), patchVersion: 1 })
    receiver.receive({ type: 'session.upserted', session: session('a', []) })
    const { messages: _messages, ...summary } = session('a', [])
    expect(receiver.receive({
      type: 'session.patched', session: summary, patch: { from: 1, to: 2, keep: 0, count: 0, messages: [] },
    })).toBeUndefined()
    expect(requests).toHaveLength(1)
  })
})
