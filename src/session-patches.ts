import type {
  BackgroundTask,
  BackgroundTasksPatch,
  ChatMessage,
  HubEvent,
  HubResyncRequest,
  HubTasksResyncRequest,
  HubWireEvent,
} from '../shared/contracts.js'

interface Base {
  version: number
  messages: ChatMessage[]
  /** For a windowed session: where `messages` starts, and the rows it carries from before. */
  start?: number
  carried?: ChatMessage[]
}

interface TaskBase {
  version: number
  tasks: BackgroundTask[]
}

/**
 * The list a change produces: new tasks first, then those held, changed ones
 * replaced and removed ones left out. The hub sends a change only when this is
 * the list's published order. Unchanged tasks keep their identity, so what
 * renders them can tell they did not change.
 */
function applyTaskPatch(tasks: readonly BackgroundTask[], patch: BackgroundTasksPatch): BackgroundTask[] {
  const removed = new Set(patch.removed)
  const changed = new Map(patch.tasks.map((task) => [task.id, task]))
  const held = new Set(tasks.map((task) => task.id))
  return [
    ...patch.tasks.filter((task) => !held.has(task.id)),
    ...tasks.filter((task) => !removed.has(task.id)).map((task) => changed.get(task.id) ?? task),
  ]
}

/**
 * Rebuilds whole sessions from the patches one event socket is sent. A patch
 * that does not apply to what this socket holds is dropped, and the session
 * is asked for whole again; nothing is guessed. A new socket starts empty.
 *
 * A windowed session -- one sent with `messagesStart` -- holds only its latest
 * messages. Patches count from the start of the whole transcript, so one that
 * keeps fewer messages than come before the window cannot apply either.
 *
 * Task lists are rebuilt the same way from the changes a socket that asked
 * for them is sent, and handed on as whole lists of summaries.
 */
export class SessionPatchReceiver {
  private readonly bases = new Map<string, Base>()
  private readonly awaiting = new Set<string>()
  private readonly taskBases = new Map<string, TaskBase>()
  private readonly awaitingTasks = new Set<string>()

  private readonly requestResync: (request: HubResyncRequest | HubTasksResyncRequest) => void

  constructor(requestResync: (request: HubResyncRequest | HubTasksResyncRequest) => void) {
    this.requestResync = requestResync
  }

  /** The event to handle, or `undefined` when there is nothing to handle yet. */
  receive(event: HubWireEvent): HubEvent | undefined {
    if (event.type === 'session.upserted') {
      const { patchVersion, ...upserted } = event
      const key = `${event.session.computerId}:${event.session.id}`
      if (patchVersion === undefined) {
        this.bases.delete(key)
      } else {
        const { messages, messagesStart, carriedMessages } = event.session
        this.bases.set(key, messagesStart === undefined
          ? { version: patchVersion, messages }
          : { version: patchVersion, messages, start: messagesStart, carried: carriedMessages ?? [] })
        this.awaiting.delete(key)
      }
      return upserted
    }
    if (event.type === 'session.patched') {
      const { computerId, id: sessionId } = event.session
      const key = `${computerId}:${sessionId}`
      const base = this.bases.get(key)
      const { from, to, keep, count, messages } = event.patch
      const start = base?.start ?? 0
      if (
        !base || base.version !== from || keep < start || keep > start + base.messages.length ||
        keep + messages.length !== count
      ) {
        this.bases.delete(key)
        if (!this.awaiting.has(key)) {
          this.awaiting.add(key)
          this.requestResync({ type: 'session.resync', computerId, sessionId })
        }
        return undefined
      }
      // Unchanged messages keep their identity, so what renders them can tell
      // they did not change.
      const next = keep === start + base.messages.length && !messages.length
        ? base.messages
        : [...base.messages.slice(0, keep - start), ...messages]
      this.bases.set(key, { ...base, version: to, messages: next })
      return {
        type: 'session.upserted',
        session: base.start === undefined
          ? { ...event.session, messages: next }
          : {
              ...event.session,
              messages: next,
              messagesStart: base.start,
              messagesTotal: count,
              carriedMessages: base.carried ?? [],
            },
      }
    }
    if (event.type === 'session.tasks.updated') {
      const { patchVersion, ...updated } = event
      const key = `${event.computerId}:${event.sessionId}`
      if (patchVersion === undefined) {
        this.taskBases.delete(key)
      } else {
        this.taskBases.set(key, { version: patchVersion, tasks: event.tasks })
        this.awaitingTasks.delete(key)
      }
      return updated
    }
    if (event.type === 'session.tasks.patched') {
      const { computerId, sessionId, runningCount, supported, patch } = event
      const key = `${computerId}:${sessionId}`
      const base = this.taskBases.get(key)
      const tasks = base?.version === patch.from ? applyTaskPatch(base.tasks, patch) : undefined
      if (!tasks || tasks.length !== patch.count) {
        this.taskBases.delete(key)
        if (!this.awaitingTasks.has(key)) {
          this.awaitingTasks.add(key)
          this.requestResync({ type: 'session.tasks.resync', computerId, sessionId })
        }
        return undefined
      }
      this.taskBases.set(key, { version: patch.to, tasks })
      return {
        type: 'session.tasks.updated', computerId, sessionId, tasks, runningCount, supported, summary: true,
      }
    }
    if (event.type === 'session.removed') {
      const key = `${event.computerId}:${event.sessionId}`
      for (const held of [this.bases, this.awaiting, this.taskBases, this.awaitingTasks]) held.delete(key)
    } else if (event.type === 'computer.removed') {
      for (const held of [this.bases, this.awaiting, this.taskBases, this.awaitingTasks]) {
        for (const key of [...held.keys()]) {
          if (key.startsWith(`${event.computerId}:`)) held.delete(key)
        }
      }
    }
    return event
  }
}
