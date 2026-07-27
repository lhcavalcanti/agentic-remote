import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import webPush, {
  type PushSubscription,
  type RequestOptions,
  type SendResult,
} from 'web-push'
import type { HubEvent, ManagedSession } from '../shared/contracts.js'

interface HubEventSource {
  on(event: 'event', listener: (event: HubEvent) => void): unknown
  off(event: 'event', listener: (event: HubEvent) => void): unknown
}

interface PushState {
  version: 1
  publicKey: string
  privateKey: string
  subscriptions: PushSubscription[]
  mutedSessions: string[]
}

type PushSender = (
  subscription: PushSubscription,
  payload?: string | Buffer | null,
  options?: RequestOptions,
) => Promise<SendResult>

export class PushNotificationService {
  private readonly statePath: string
  private state?: PushState
  private writeQueue: Promise<void> = Promise.resolve()
  private manager?: HubEventSource
  private readonly notifiedQuestions = new Set<string>()

  constructor(
    dataDirectory: string,
    private readonly sender: PushSender = webPush.sendNotification,
    private readonly keyGenerator = webPush.generateVAPIDKeys,
  ) {
    this.statePath = path.join(dataDirectory, 'push-notifications.json')
  }

  async initialize(): Promise<void> {
    await mkdir(path.dirname(this.statePath), { recursive: true, mode: 0o700 })
    try {
      const state = JSON.parse(
        await readFile(this.statePath, 'utf8'),
      ) as Omit<PushState, 'mutedSessions'> & { mutedSessions?: string[] }
      if (
        state.version !== 1 ||
        !state.publicKey ||
        !state.privateKey ||
        !Array.isArray(state.subscriptions)
      ) {
        throw new Error('Unsupported push notification state format')
      }
      this.state = {
        ...state,
        mutedSessions: Array.isArray(state.mutedSessions)
          ? state.mutedSessions
          : [],
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
      const keys = this.keyGenerator()
      this.state = {
        version: 1,
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
        subscriptions: [],
        mutedSessions: [],
      }
      await this.persist()
    }
    webPush.setVapidDetails(
      process.env.AGENTIC_REMOTE_VAPID_SUBJECT?.trim() ||
        'https://github.com/lhcavalcanti/agentic-remote',
      this.requireState().publicKey,
      this.requireState().privateKey,
    )
  }

  attach(manager: HubEventSource): void {
    this.manager = manager
    manager.on('event', this.handleEvent)
  }

  stop(): void {
    this.manager?.off('event', this.handleEvent)
    this.manager = undefined
  }

  publicKey(): string {
    return this.requireState().publicKey
  }

  async subscribe(subscription: PushSubscription): Promise<void> {
    const state = this.requireState()
    const index = state.subscriptions.findIndex(
      (entry) => entry.endpoint === subscription.endpoint,
    )
    if (index >= 0) {
      state.subscriptions[index] = subscription
    } else {
      state.subscriptions.push(subscription)
    }
    await this.persist()
  }

  async unsubscribe(endpoint: string): Promise<void> {
    const state = this.requireState()
    state.subscriptions = state.subscriptions.filter(
      (subscription) => subscription.endpoint !== endpoint,
    )
    await this.persist()
  }

  settings(): { mutedSessions: string[] } {
    return {
      mutedSessions: [...this.requireState().mutedSessions],
    }
  }

  async setSessionMuted(
    computerId: string,
    sessionId: string,
    muted: boolean,
  ): Promise<{ mutedSessions: string[] }> {
    const state = this.requireState()
    const key = this.sessionKey(computerId, sessionId)
    const mutedSessions = new Set(state.mutedSessions)
    if (muted) {
      mutedSessions.add(key)
    } else {
      mutedSessions.delete(key)
    }
    state.mutedSessions = [...mutedSessions].sort()
    await this.persist()
    return this.settings()
  }

  private readonly handleEvent = (event: HubEvent) => {
    if (event.type === 'computer.removed') {
      const prefix = `${event.computerId}:`
      for (const key of this.notifiedQuestions) {
        if (key.startsWith(prefix)) {
          this.notifiedQuestions.delete(key)
        }
      }
      this.removeMutedSessions(prefix, false)
      return
    }
    if (event.type === 'session.removed') {
      this.removeSessionQuestions(event.computerId, event.sessionId)
      this.removeMutedSessions(
        this.sessionKey(event.computerId, event.sessionId),
        true,
      )
      return
    }
    if (event.type !== 'session.upserted') {
      return
    }
    const session = event.session
    const prefix = `${session.computerId}:${session.id}:`
    const requestId = session.pendingUserInput?.requestId
    for (const key of this.notifiedQuestions) {
      if (key.startsWith(prefix) && key !== `${prefix}${requestId}`) {
        this.notifiedQuestions.delete(key)
      }
    }
    if (!requestId) {
      return
    }
    if (
      this.requireState().mutedSessions.includes(
        this.sessionKey(session.computerId, session.id),
      )
    ) {
      return
    }
    const key = `${prefix}${requestId}`
    if (this.notifiedQuestions.has(key)) {
      return
    }
    this.notifiedQuestions.add(key)
    void this.notifyQuestion(session).catch((error: unknown) => {
      console.warn('Unable to send ask-user push notification:', error)
    })
  }

  private removeSessionQuestions(computerId: string, sessionId: string): void {
    const prefix = `${computerId}:${sessionId}:`
    for (const key of this.notifiedQuestions) {
      if (key.startsWith(prefix)) {
        this.notifiedQuestions.delete(key)
      }
    }
  }

  private sessionKey(computerId: string, sessionId: string): string {
    return `${computerId}:${sessionId}`
  }

  private removeMutedSessions(value: string, exact: boolean): void {
    const state = this.requireState()
    const remaining = state.mutedSessions.filter((session) =>
      exact ? session !== value : !session.startsWith(value),
    )
    if (remaining.length === state.mutedSessions.length) {
      return
    }
    state.mutedSessions = remaining
    void this.persist().catch((error: unknown) => {
      console.warn('Unable to persist notification mute cleanup:', error)
    })
  }

  private async notifyQuestion(session: ManagedSession): Promise<void> {
    const state = this.requireState()
    if (state.subscriptions.length === 0) {
      return
    }
    const payload = JSON.stringify({
      title: 'Agent needs your input',
      body: `${session.computerName} · ${session.title}`,
      tag: `agentic-question-${session.computerId}-${session.id}`,
      data: {
        url: `/?computer=${encodeURIComponent(session.computerId)}&session=${encodeURIComponent(session.id)}`,
      },
    })
    const expired = new Set<string>()
    await Promise.all(
      state.subscriptions.map(async (subscription) => {
        try {
          await this.sender(subscription, payload, { TTL: 300 })
        } catch (error) {
          const statusCode = (error as { statusCode?: number }).statusCode
          if (statusCode === 404 || statusCode === 410) {
            expired.add(subscription.endpoint)
            return
          }
          throw error
        }
      }),
    )
    if (expired.size > 0) {
      state.subscriptions = state.subscriptions.filter(
        (subscription) => !expired.has(subscription.endpoint),
      )
      await this.persist()
    }
  }

  private requireState(): PushState {
    if (!this.state) {
      throw new Error('Push notification service is not initialized')
    }
    return this.state
  }

  private persist(): Promise<void> {
    const snapshot = JSON.stringify(this.requireState(), null, 2)
    const task = this.writeQueue.then(async () => {
      const temporaryPath = `${this.statePath}.tmp`
      await writeFile(temporaryPath, snapshot, { mode: 0o600 })
      await rename(temporaryPath, this.statePath)
    })
    this.writeQueue = task.catch(() => undefined)
    return task
  }
}
