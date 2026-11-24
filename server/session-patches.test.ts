import { describe, expect, it } from 'vitest'
import type {
  BackgroundTask,
  BackgroundTaskSnapshot,
  ChatMessage,
  HubEvent,
  HubResyncRequest,
  HubTasksResyncRequest,
  HubWireEvent,
  ManagedSession,
} from '../shared/contracts.js'
import { BACKGROUND_TASK_TAIL, summarizeBackgroundTask, summarizeBackgroundTasks } from '../shared/background-tasks.js'
import { SessionPatchReceiver } from '../src/session-patches.js'
import { diffMessages, type PatchSocket, SessionPublications } from './session-patches.js'

/** A soak run sets this to explore new seeds; failures name the seed. */
const seedOffset = Number(process.env.PROPERTY_SEED_OFFSET ?? 0)

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
  readonly taskLists = new Map<string, BackgroundTaskSnapshot>()
  readonly resyncs: Array<HubResyncRequest | HubTasksResyncRequest> = []
  resyncCount = 0
  readonly receiver = new SessionPatchReceiver((request) => {
    this.resyncCount += 1
    this.resyncs.push(request)
  })
  readyState = 1
  dropNext = false
  readonly socket: PatchSocket

  constructor(patches: boolean, window?: number, taskChanges = false) {
    this.socket = {
      readyState: 1,
      send: (payload) => this.deliver(payload),
      ...(patches ? { patchVersions: new Map<string, number>() } : {}),
      ...(window === undefined ? {} : { transcriptWindow: window }),
      ...(taskChanges ? { taskVersions: new Map<string, number>() } : {}),
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
      this.taskLists.delete(`${event.computerId}:${event.sessionId}`)
    } else if (event?.type === 'session.tasks.updated') {
      expect(event).not.toHaveProperty('patchVersion')
      const { type: _type, computerId, sessionId, ...snapshot } = event
      this.taskLists.set(`${computerId}:${sessionId}`, snapshot)
    }
  }

  /** Asks for what it could not apply, as the page does, and is answered in order. */
  resyncWith(publications: SessionPublications): void {
    for (const request of this.resyncs.splice(0)) {
      if (request.type === 'session.tasks.resync') {
        publications.resyncTasks(this.socket, request.computerId, request.sessionId)
      } else {
        publications.resync(this.socket, request.computerId, request.sessionId)
      }
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

  it('keeps a rebuilt task completion that holds the same evidence', () => {
    const evidence = () => ({ source: 'root-task-complete' as const, toolCallId: 'call-1', completedAt: at })
    // A transcript rebuilt from the event log makes new evidence objects for
    // messages that did not change; only the new message is sent.
    const done = (taskCompletion: ChatMessage['taskCompletion']): ChatMessage =>
      ({ id: 'done', role: 'assistant', content: 'Finished', createdAt: at, taskCompletion })
    const later = { id: 'later', role: 'user' as const, content: 'next', createdAt: at }
    expect(diffMessages([done(evidence())], [done(evidence()), later]))
      .toEqual({ keep: 1, messages: [later] })
    // Different evidence is still a change.
    expect(diffMessages([done(evidence())], [done({ ...evidence(), toolCallId: 'call-2' })]).keep).toBe(0)
    expect(diffMessages([done(evidence())], [done(undefined)]).keep).toBe(0)
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

  it('keeps the published transcript when a transcript-less roster summary is upserted', () => {
    const publications = new SessionPublications()
    const holder = new Browser(true)
    publications.add(holder.socket)
    const messages = [{ id: 'm', role: 'assistant' as const, content: 'kept', createdAt: at }]
    publications.broadcast({ type: 'session.upserted', session: session('a', messages) })
    const late = new Browser(true)
    publications.add(late.socket)
    publications.broadcast({
      type: 'session.upserted', summary: true,
      session: session('a', [], { isOpen: false, archivedAt: at, revision: 4 }),
    })
    for (const browser of [holder, late]) {
      expect(browser.seen.get('local:a')).toMatchObject({ archivedAt: at, revision: 4, messages })
    }
    publications.broadcast({ type: 'session.upserted', session: session('a', [...messages, { ...messages[0], id: 'n' }]) })
    expect(holder.seen.get('local:a')!.messages.map((message) => message.id)).toEqual(['m', 'n'])
    expect(holder.resyncCount).toBe(0)
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
    for (let seed = seedOffset + 1; seed <= seedOffset + 150; seed += 1) {
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

describe('windowed session publications', () => {
  const line = (index: number, extra: Partial<ChatMessage> = {}): ChatMessage =>
    ({ id: `m${index}`, role: 'assistant', content: `line ${index}`, createdAt: at, ...extra })
  const lines = (count: number) => Array.from({ length: count }, (_, index) => line(index))
  const ids = (messages: readonly ChatMessage[] | undefined) => messages?.map((message) => message.id)
  const frames = (browser: Browser) => browser.sent.map((payload) => JSON.parse(payload) as HubWireEvent)

  it('sends a windowed socket the latest window first, then patches by absolute index', () => {
    const publications = new SessionPublications()
    const browser = new Browser(true, 3)
    publications.add(browser.socket)
    const ten = lines(10)
    publications.broadcast({ type: 'session.upserted', session: session('a', ten) })
    publications.broadcast({ type: 'session.upserted', session: session('a', [...ten, line(10)]) })

    const [first, patch] = frames(browser)
    expect(first).toMatchObject({
      type: 'session.upserted', patchVersion: 1,
      session: { messagesStart: 7, messagesTotal: 10, carriedMessages: [] },
    })
    expect(first.type === 'session.upserted' && ids(first.session.messages)).toEqual(['m7', 'm8', 'm9'])
    expect(patch).toMatchObject({
      type: 'session.patched', patch: { from: 1, to: 2, keep: 10, count: 11, messages: [line(10)] },
    })
    const seen = browser.seen.get('local:a')!
    expect(seen).toMatchObject({ messagesStart: 7, messagesTotal: 11 })
    expect(ids(seen.messages)).toEqual(['m7', 'm8', 'm9', 'm10'])
  })

  it('sends a fresh window, never the whole tail, when a change reaches back before it', () => {
    const publications = new SessionPublications()
    const browser = new Browser(true, 3)
    publications.add(browser.socket)
    const messages = lines(1_000)
    messages[2] = line(2, { role: 'activity', activityStatus: 'running' })
    publications.broadcast({ type: 'session.upserted', session: session('a', messages) })
    // A long-running activity far back finishes.
    const finished = messages.map((message, index) =>
      index === 2 ? { ...message, activityStatus: 'completed' as const } : message)
    publications.broadcast({ type: 'session.upserted', session: session('a', finished) })
    // A burst longer than the window arrives between two publications.
    publications.broadcast({ type: 'session.upserted', session: session('a', [...finished, ...lines(1_010).slice(1_000)]) })

    const [first, refreshed, burst] = frames(browser)
    expect(first.type === 'session.upserted' && ids(first.session.carriedMessages)).toEqual(['m2'])
    expect(refreshed).toMatchObject({
      type: 'session.upserted', patchVersion: 2,
      session: { messagesStart: 997, messagesTotal: 1_000, carriedMessages: [finished[2]] },
    })
    expect(burst).toMatchObject({
      type: 'session.upserted', patchVersion: 3, session: { messagesStart: 1_007, messagesTotal: 1_010 },
    })
    for (const payload of browser.sent) expect(payload.length).toBeLessThan(1_000)
    expect(ids(browser.seen.get('local:a')!.messages)).toEqual(['m1007', 'm1008', 'm1009'])
    expect(browser.resyncCount).toBe(0)
  })

  it('answers a windowed resync with the window, and sends other sockets what they always had', () => {
    const publications = new SessionPublications()
    const windowed = new Browser(true, 3)
    const patching = new Browser(true)
    const legacy = new Browser(false)
    for (const browser of [windowed, patching, legacy]) publications.add(browser.socket)
    const event: HubEvent = { type: 'session.upserted', session: session('a', lines(10)) }
    publications.broadcast(event)
    publications.resync(windowed.socket, 'local', 'a')

    expect(frames(windowed)[1]).toMatchObject({
      type: 'session.upserted', patchVersion: 1, session: { messagesStart: 7, messagesTotal: 10 },
    })
    expect(patching.sent).toEqual([JSON.stringify({ ...event, patchVersion: 1 })])
    expect(legacy.sent).toEqual([JSON.stringify(event)])
  })

  it('converges every windowed browser on the latest window, in bounded frames, whatever happens', () => {
    let patched = 0
    let refreshed = 0
    for (let seed = seedOffset + 1; seed <= seedOffset + 120; seed += 1) {
      const next = random(seed)
      const publications = new SessionPublications()
      const browsers: Browser[] = []
      const latest = new Map<string, ManagedSession>()
      const join = () => {
        const browser = new Browser(true, 3 + Math.floor(next() * 6))
        browsers.push(browser)
        publications.add(browser.socket)
      }
      join()
      join()
      let made = 0
      for (let step = 0; step < 150; step += 1) {
        const id = `s${Math.floor(next() * 3)}`
        const key = `local:${id}`
        const choice = next()
        if (choice < 0.04) {
          join()
          continue
        }
        if (choice < 0.07) {
          latest.delete(key)
          publications.broadcast({ type: 'session.removed', computerId: 'local', sessionId: id })
          continue
        }
        if (choice < 0.1) browsers[Math.floor(next() * browsers.length)].dropNext = true
        let messages = (latest.get(key)?.messages ?? []).map((message) => ({ ...message }))
        const edit = next()
        if (edit < 0.45) {
          const count = next() < 0.9 ? 1 : 1 + Math.floor(next() * 12)
          for (let added = 0; added < count; added += 1) {
            made += 1
            messages.push(next() < 0.3
              ? { id: `m${made}`, role: 'activity', content: `tool ${made}`, createdAt: at, activityStatus: next() < 0.5 ? 'running' : 'completed' }
              : { id: `m${made}`, role: 'assistant', content: `step ${made}`, createdAt: at })
          }
        } else if (edit < 0.6 && messages.length) {
          messages[messages.length - 1] = { ...messages.at(-1)!, content: `${messages.at(-1)!.content}+` }
        } else if (edit < 0.75 && messages.length) {
          // An activity anywhere finishes, often far before the window.
          const index = Math.floor(next() * messages.length)
          messages[index] = { ...messages[index], role: 'activity', activityStatus: 'completed' }
        } else if (edit < 0.8 && messages.length > 1) {
          messages.splice(Math.floor(next() * messages.length), 1)
        } else if (edit < 0.83) {
          messages = []
        } else if (edit < 0.86) {
          // Rebuilt from its log with a row it did not have before.
          made += 1
          messages.unshift({ id: `m${made}`, role: 'notice', content: 'earlier', createdAt: at })
        } else if (edit < 0.89 && latest.has(key)) {
          // A node's roster after it reconnects: metadata only.
          publications.broadcast({
            type: 'session.upserted', summary: true, session: session(id, [], { revision: step }),
          })
          continue
        }
        const published = session(id, messages, { revision: step })
        latest.set(key, published)
        publications.broadcast({ type: 'session.upserted', session: published })
        for (const browser of browsers) {
          for (const request of browser.resyncs.splice(0)) {
            publications.resync(browser.socket, request.computerId, request.sessionId)
          }
        }
      }
      for (const [key, value] of latest) {
        publications.broadcast({ type: 'session.upserted', session: value })
        for (const browser of browsers) {
          for (const request of browser.resyncs.splice(0)) {
            publications.resync(browser.socket, request.computerId, request.sessionId)
          }
        }
        for (const browser of browsers) {
          const seen = browser.seen.get(key)!
          const whole = JSON.parse(JSON.stringify(value.messages)) as ChatMessage[]
          const start = seen.messagesStart!
          expect(seen.messagesTotal, `seed ${seed} ${key}`).toBe(whole.length)
          expect(seen.messages, `seed ${seed} ${key}`).toEqual(whole.slice(start))
          const before = new Map(whole.slice(0, start).map((message) => [message.id, message]))
          for (const message of whole.slice(0, start)) {
            if (message.role === 'activity' && message.activityStatus === 'running') {
              expect(seen.carriedMessages?.map((carried) => carried.id), `seed ${seed} ${key}`).toContain(message.id)
            }
          }
          for (const carried of seen.carriedMessages ?? []) {
            expect(before.get(carried.id), `seed ${seed} ${key} carried`).toEqual(carried)
          }
        }
      }
      for (const browser of browsers) {
        const size = browser.socket.transcriptWindow!
        for (const frame of browser.sent.map((payload) => JSON.parse(payload) as HubWireEvent)) {
          if (frame.type === 'session.patched') {
            patched += 1
            expect(frame.patch.messages.length).toBeLessThanOrEqual(size)
          } else if (frame.type === 'session.upserted') {
            refreshed += 1
            expect(frame.session.messages.length).toBeLessThanOrEqual(size)
          }
        }
      }
    }
    // Not vacuous: both kinds of frame were sent.
    expect(patched).toBeGreaterThan(5_000)
    expect(refreshed).toBeGreaterThan(1_000)
  })

  it('sends a roster summary that carries a cached transcript as a window', () => {
    const publications = new SessionPublications()
    const browser = new Browser(true, 3)
    publications.add(browser.socket)
    publications.broadcast({ type: 'session.upserted', summary: true, session: session('a', lines(1_000)) })
    expect(frames(browser)[0]).toMatchObject({
      type: 'session.upserted', patchVersion: 1, session: { messagesStart: 997, messagesTotal: 1_000 },
    })
    expect(browser.sent[0].length).toBeLessThan(1_000)
  })

  it('keeps the transcript a windowed socket holds while only roster summaries arrive', () => {
    const publications = new SessionPublications()
    const browser = new Browser(true, 3)
    publications.add(browser.socket)
    publications.broadcast({ type: 'session.upserted', summary: true, session: session('a', [], { revision: 2 }) })
    // Another before the transcript is ever read says nothing about it either.
    publications.broadcast({ type: 'session.upserted', summary: true, session: session('a', [], { revision: 3 }) })
    for (const frame of frames(browser)) {
      expect(frame).toMatchObject({ type: 'session.upserted', summary: true, session: { messages: [] } })
      expect(frame).not.toHaveProperty('session.messagesStart')
    }
    publications.broadcast({ type: 'session.upserted', session: session('a', lines(10)) })
    expect(frames(browser)[2]).toMatchObject({ type: 'session.upserted', session: { messagesStart: 7, messagesTotal: 10 } })
  })
})

describe('task publications', () => {
  const task = (id: string, change: Partial<BackgroundTask> = {}): BackgroundTask => ({
    id, type: 'shell', description: `Task ${id}`, status: 'completed', startedAt: at, completedAt: at,
    executionMode: 'background', attachmentMode: 'detached', canCancel: false,
    command: 'pnpm vitest run '.repeat(60), progress: { type: 'shell', recentOutput: 'PASS '.repeat(400) },
    ...change,
  })
  const running = (id: string, change: Partial<BackgroundTask> = {}) =>
    task(id, { status: 'running', completedAt: undefined, ...change })
  const listed = (tasks: BackgroundTask[], sessionId = 'a'): Extract<HubEvent, { type: 'session.tasks.updated' }> => ({
    type: 'session.tasks.updated', computerId: 'local', sessionId, tasks,
    runningCount: tasks.filter((entry) => entry.status === 'running').length, supported: true,
  })
  const summaries = (event: Extract<HubEvent, { type: 'session.tasks.updated' }>) => {
    const { type: _type, computerId: _computer, sessionId: _session, ...snapshot } = event
    return summarizeBackgroundTasks(snapshot)
  }
  const byId = (snapshot: BackgroundTaskSnapshot | undefined) =>
    snapshot && { ...snapshot, tasks: [...snapshot.tasks].sort((left, right) => left.id.localeCompare(right.id)) }
  const frames = (browser: Browser) => browser.sent.map((payload) => JSON.parse(payload) as HubWireEvent)
  const hundred = () => Array.from({ length: 100 }, (_, index) => index < 10 ? running(`t${index}`) : task(`t${index}`))

  it('sends sockets that did not ask for task changes the whole list, as before', () => {
    const publications = new SessionPublications()
    const legacy = new Browser(false)
    const windowed = new Browser(true, 500)
    const changes = new Browser(true, 500, true)
    for (const browser of [legacy, windowed, changes]) publications.add(browser.socket)
    const first = listed(hundred())
    const second = listed([running('t-new'), ...hundred()])
    publications.broadcast(first)
    publications.broadcast(second)
    expect(legacy.sent).toEqual([JSON.stringify(first), JSON.stringify(second)])
    expect(windowed.sent).toEqual(legacy.sent)
  })

  it('sends a socket that asked the summaries first, then only the tasks that changed or went', () => {
    const publications = new SessionPublications()
    const browser = new Browser(true, 500, true)
    publications.add(browser.socket)
    const tasks = hundred()
    publications.broadcast(listed(tasks))
    // A running task prints another line.
    const printed = tasks.map((entry, index) => index === 3
      ? { ...entry, progress: { type: 'shell' as const, recentOutput: `${entry.progress!.recentOutput}\nPASS one more` } }
      : entry)
    publications.broadcast(listed(printed))
    // The oldest leaves the list as a new one starts.
    const turned = [running('t100'), ...printed.slice(0, 99)]
    publications.broadcast(listed(turned))

    const [first, progress, turnover] = frames(browser)
    expect(first).toEqual({
      type: 'session.tasks.updated', computerId: 'local', sessionId: 'a', ...summaries(listed(tasks)), patchVersion: 1,
    })
    expect(progress).toEqual({
      type: 'session.tasks.patched', computerId: 'local', sessionId: 'a', runningCount: 10, supported: true,
      patch: { from: 1, to: 2, count: 100, tasks: [summarizeBackgroundTask(printed[3])], removed: [] },
    })
    expect(turnover).toEqual({
      type: 'session.tasks.patched', computerId: 'local', sessionId: 'a', runningCount: 11, supported: true,
      patch: { from: 2, to: 3, count: 100, tasks: [summarizeBackgroundTask(turned[0])], removed: ['t99'] },
    })
    // A change to one task costs one summary -- two cut texts and its fields --
    // however long the list.
    expect(browser.sent[0].length).toBeLessThan(30_000)
    expect(browser.sent[1].length).toBeLessThan(2 * BACKGROUND_TASK_TAIL + 600)
    expect(byId(browser.taskLists.get('local:a'))).toEqual(byId(summaries(listed(turned))))
    expect(browser.resyncCount).toBe(0)
  })

  it('sends a task whose whole changed though its summary did not, and nothing when nothing changed', () => {
    const publications = new SessionPublications()
    const browser = new Browser(false, undefined, true)
    publications.add(browser.socket)
    const tasks = [task('done'), running('live')]
    publications.broadcast(listed(tasks))
    publications.broadcast(listed(structuredClone(tasks)))
    expect(browser.sent).toHaveLength(1)
    // Its result arrives after it finished: a reader who has it open reads it again.
    const resulted = [{ ...tasks[0], result: 'All 42 tests passed' }, tasks[1]]
    publications.broadcast(listed(resulted))
    expect(frames(browser)[1]).toMatchObject({
      type: 'session.tasks.patched', patch: { from: 1, to: 2, tasks: [summarizeBackgroundTask(tasks[0])], removed: [] },
    })
    // Counts alone are a change too.
    publications.broadcast({ ...listed(resulted), runningCount: 0 })
    expect(frames(browser)[2]).toMatchObject({
      type: 'session.tasks.patched', runningCount: 0, patch: { from: 2, to: 3, tasks: [], removed: [] },
    })
    expect(browser.taskLists.get('local:a')?.runningCount).toBe(0)
  })

  it('sends the whole list again when every task in it changed', () => {
    const publications = new SessionPublications()
    const browser = new Browser(false, undefined, true)
    publications.add(browser.socket)
    publications.broadcast(listed([running('a'), running('b')]))
    const finished = listed([task('a'), task('b')])
    publications.broadcast(finished)
    expect(frames(browser)[1]).toEqual({
      type: 'session.tasks.updated', computerId: 'local', sessionId: 'a', ...summaries(finished), patchVersion: 2,
    })
  })

  it('answers a task resync with the latest list, and a socket that joins later with the whole list', () => {
    const publications = new SessionPublications()
    const browser = new Browser(true, 500, true)
    publications.add(browser.socket)
    publications.broadcast(listed([running('a'), task('b')]))
    publications.broadcast(listed([running('a', { pid: 7 }), task('b')]))
    publications.resyncTasks(browser.socket, 'local', 'a')
    expect(frames(browser)[2]).toEqual({
      type: 'session.tasks.updated', computerId: 'local', sessionId: 'a',
      ...summaries(listed([running('a', { pid: 7 }), task('b')])), patchVersion: 2,
    })
    const late = new Browser(true, 500, true)
    publications.add(late.socket)
    publications.broadcast(listed([running('a', { pid: 8 }), task('b')]))
    expect(frames(late)).toEqual([{
      type: 'session.tasks.updated', computerId: 'local', sessionId: 'a',
      ...summaries(listed([running('a', { pid: 8 }), task('b')])), patchVersion: 3,
    }])
    expect(frames(browser)[3]).toMatchObject({ type: 'session.tasks.patched', patch: { from: 2, to: 3 } })
    // Nothing is answered for a session never published, or to a socket that did not ask.
    const legacy = new Browser(true)
    publications.add(legacy.socket)
    publications.resyncTasks(browser.socket, 'local', 'missing')
    publications.resyncTasks(legacy.socket, 'local', 'a')
    expect(browser.sent).toHaveLength(4)
    expect(legacy.sent).toHaveLength(0)
  })

  it('forgets task lists with their session, their computer, and the last socket that asked', () => {
    const publications = new SessionPublications()
    const browser = new Browser(false, undefined, true)
    publications.add(browser.socket)
    publications.broadcast(listed([running('a')]))
    publications.broadcast({ type: 'session.removed', computerId: 'local', sessionId: 'a' })
    publications.broadcast(listed([running('a')]))
    publications.broadcast(listed([running('b')], 'b'))
    publications.broadcast({ type: 'computer.removed', computerId: 'local' })
    publications.broadcast(listed([running('b')], 'b'))
    expect(frames(browser).map((frame) => frame.type)).toEqual([
      'session.tasks.updated', 'session.removed', 'session.tasks.updated',
      'session.tasks.updated', 'computer.removed', 'session.tasks.updated',
    ])
    expect(frames(browser).filter((frame) => frame.type === 'session.tasks.updated')
      .map((frame) => 'patchVersion' in frame && frame.patchVersion)).toEqual([1, 1, 1, 1])
    publications.delete(browser.socket)
    expect((publications as unknown as { taskPublications: Map<string, unknown> }).taskPublications.size).toBe(0)
  })

  it('converges every browser on the tasks last published, whatever happens in between', () => {
    let patched = 0
    let resynced = 0
    for (let seed = seedOffset + 1; seed <= seedOffset + 150; seed += 1) {
      const next = random(seed)
      const publications = new SessionPublications()
      const browsers: Browser[] = []
      const latest = new Map<string, Extract<HubEvent, { type: 'session.tasks.updated' }>>()
      const join = () => {
        const browser = new Browser(next() < 0.5, 500, next() < 0.8)
        browsers.push(browser)
        publications.add(browser.socket)
        // A new page lists every session's tasks before it relies on events.
        for (const [key, value] of latest) {
          browser.taskLists.set(key, browser.socket.taskVersions ? summaries(value) : (({ type: _t, computerId: _c, sessionId: _s, ...rest }) => rest)(value))
        }
      }
      join()
      let made = 0
      for (let step = 0; step < 120; step += 1) {
        const choice = next()
        const id = `s${Math.floor(next() * 3)}`
        const key = `local:${id}`
        if (choice < 0.04) {
          join()
          continue
        }
        if (choice < 0.07 && browsers.length > 1) {
          const leaving = browsers.splice(Math.floor(next() * browsers.length), 1)[0]
          leaving.socket.readyState = 3
          publications.delete(leaving.socket)
          continue
        }
        if (choice < 0.1) {
          latest.delete(key)
          publications.broadcast({ type: 'session.removed', computerId: 'local', sessionId: id })
          continue
        }
        if (choice < 0.13) {
          const flagged = browsers.filter((browser) => browser.socket.taskVersions)
          if (flagged.length) flagged[Math.floor(next() * flagged.length)].dropNext = true
        }
        let tasks = structuredClone(latest.get(key)?.tasks ?? [])
        const edit = next()
        if (edit < 0.3 || !tasks.length) {
          made += 1
          tasks.unshift(running(`t${made}`, { command: `run ${made}` }))
          if (tasks.length > 12) tasks = tasks.slice(0, 12)
        } else if (edit < 0.6) {
          const index = Math.floor(next() * tasks.length)
          const progress = tasks[index].progress ?? { type: 'shell' as const }
          tasks[index] = { ...tasks[index], progress: { ...progress, recentOutput: `${progress.recentOutput ?? ''} line ${step}` } }
        } else if (edit < 0.75) {
          const index = Math.floor(next() * tasks.length)
          tasks[index] = { ...tasks[index], status: 'completed', completedAt: at, canCancel: false }
        } else if (edit < 0.85) {
          const index = Math.floor(next() * tasks.length)
          tasks[index] = { ...tasks[index], result: `result ${step}` }
        } else if (edit < 0.92) {
          tasks.splice(Math.floor(next() * tasks.length), 1)
        }
        // Otherwise the same list again, as a node's resync sends it.
        const published = listed(tasks, id)
        latest.set(key, published)
        publications.broadcast(published)
        for (const browser of browsers) browser.resyncWith(publications)
      }
      // One last change everywhere, so a lost frame cannot go unnoticed.
      for (const [key, value] of latest) {
        const settled = listed([running(`settle-${key}`), ...value.tasks], value.sessionId)
        latest.set(key, settled)
        publications.broadcast(settled)
        for (const browser of browsers) browser.resyncWith(publications)
      }
      for (const [key, value] of latest) {
        const { type: _type, computerId: _computer, sessionId: _session, ...whole } = value
        for (const browser of browsers) {
          expect(byId(browser.taskLists.get(key)), `seed ${seed} ${key}`)
            .toEqual(byId(browser.socket.taskVersions ? summaries(value) : JSON.parse(JSON.stringify(whole))))
        }
      }
      for (const browser of browsers) {
        for (const key of browser.taskLists.keys()) expect(latest.has(key), `seed ${seed} removed ${key}`).toBe(true)
        patched += browser.sent.filter((payload) => payload.startsWith('{"type":"session.tasks.patched"')).length
        resynced += browser.resyncCount
      }
    }
    // Not vacuous: most deliveries were changes, and lost frames were recovered.
    expect(patched).toBeGreaterThan(2_000)
    expect(resynced).toBeGreaterThan(50)
  })
})

describe('task patch receiver', () => {
  const task = (id: string, change: Partial<BackgroundTask> = {}): BackgroundTask => ({
    id, type: 'shell', description: id, status: 'running', startedAt: at, canCancel: false, ...change,
  })
  const whole = (tasks: BackgroundTask[], patchVersion?: number): HubWireEvent => ({
    type: 'session.tasks.updated', computerId: 'local', sessionId: 'a', tasks, runningCount: tasks.length,
    supported: true, summary: true, ...(patchVersion === undefined ? {} : { patchVersion }),
  })
  const patch = (from: number, to: number, change: Partial<{ count: number; tasks: BackgroundTask[]; removed: string[] }> = {}): HubWireEvent => ({
    type: 'session.tasks.patched', computerId: 'local', sessionId: 'a', runningCount: 1, supported: true,
    patch: { from, to, count: 2, tasks: [], removed: [], ...change },
  })

  it('applies changed and removed tasks to the list it holds, keeping the unchanged ones as they were', () => {
    const receiver = new SessionPatchReceiver(() => { throw new Error('no resync expected') })
    const held = [task('a'), task('b'), task('c')]
    receiver.receive(whole(held, 4))
    const changed = task('b', { status: 'completed', completedAt: at })
    const event = receiver.receive(patch(4, 5, { count: 3, tasks: [task('d'), changed], removed: ['c'] }))
    expect(event).toEqual({
      type: 'session.tasks.updated', computerId: 'local', sessionId: 'a',
      tasks: [task('d'), held[0], changed], runningCount: 1, supported: true, summary: true,
    })
    // What did not change is the very same task, so an open one is not read again.
    expect(event?.type === 'session.tasks.updated' && event.tasks[1]).toBe(held[0])
    expect(receiver.receive(patch(5, 6, { count: 3 }))).toMatchObject({ type: 'session.tasks.updated', runningCount: 1 })
  })

  it('asks once for a list whose change does not apply, and drops changes until it arrives', () => {
    const requests: Array<HubResyncRequest | HubTasksResyncRequest> = []
    const receiver = new SessionPatchReceiver((request) => requests.push(request))
    expect(receiver.receive(patch(1, 2))).toBeUndefined()
    expect(receiver.receive(patch(2, 3))).toBeUndefined()
    expect(requests).toEqual([{ type: 'session.tasks.resync', computerId: 'local', sessionId: 'a' }])
    expect(receiver.receive(whole([task('a'), task('b')], 7))).toEqual(whole([task('a'), task('b')]))
    expect(receiver.receive(patch(6, 8))).toBeUndefined()
    expect(requests).toHaveLength(2)
  })

  it('rejects a change whose count does not add up', () => {
    const requests: Array<HubResyncRequest | HubTasksResyncRequest> = []
    const receiver = new SessionPatchReceiver((request) => requests.push(request))
    receiver.receive(whole([task('a'), task('b')], 1))
    expect(receiver.receive(patch(1, 2, { count: 3, tasks: [task('a', { pid: 1 })] }))).toBeUndefined()
    expect(requests).toEqual([{ type: 'session.tasks.resync', computerId: 'local', sessionId: 'a' }])
  })

  it('passes a whole list without a version through, and holds no base for it', () => {
    const requests: Array<HubResyncRequest | HubTasksResyncRequest> = []
    const receiver = new SessionPatchReceiver((request) => requests.push(request))
    receiver.receive(whole([task('a')], 1))
    // A hub from before task changes, or one that sent this socket whole lists.
    const old: HubWireEvent = {
      type: 'session.tasks.updated', computerId: 'local', sessionId: 'a', tasks: [task('a')], runningCount: 1, supported: true,
    }
    expect(receiver.receive(old)).toEqual(old)
    expect(receiver.receive(patch(1, 2, { count: 1 }))).toBeUndefined()
    expect(requests).toHaveLength(1)
  })

  it('forgets the lists of a removed session and of a removed computer', () => {
    const requests: Array<HubResyncRequest | HubTasksResyncRequest> = []
    const receiver = new SessionPatchReceiver((request) => requests.push(request))
    receiver.receive(whole([task('a'), task('b')], 1))
    receiver.receive({ type: 'session.removed', computerId: 'local', sessionId: 'a' })
    expect(receiver.receive(patch(1, 2))).toBeUndefined()
    receiver.receive(whole([task('a'), task('b')], 3))
    receiver.receive({ type: 'computer.removed', computerId: 'local' })
    expect(receiver.receive(patch(3, 4))).toBeUndefined()
    expect(requests).toHaveLength(2)
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
