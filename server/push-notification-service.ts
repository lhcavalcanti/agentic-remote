import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { PushSubscription, RequestOptions, SendResult } from 'web-push'
import * as webPush from 'web-push'
import type { HubEvent, ManagedSession } from '../shared/contracts.js'
import type { ManagerEvent } from '../shared/manager.js'
import type { NotificationRecorder } from './notification-center-service.js'
import {
  alertNotification,
  notificationAllowed,
  notificationBrief,
  OracleNotifier,
  type NotificationCategory,
  type NotificationPayload,
  type NotificationScope,
} from '../shared/notifications.js'

interface HubEventSource {
  on(event: 'event', listener: (event: HubEvent) => void): unknown
  off(event: 'event', listener: (event: HubEvent) => void): unknown
  listSessions?(): Promise<ManagedSession[]>
}

interface OracleEventSource {
  on(event: 'event', listener: (event: ManagerEvent) => void): unknown
  off(event: 'event', listener: (event: ManagerEvent) => void): unknown
}

/** What the hub may send, read afresh for every notification. */
export interface PushPolicy {
  /** The settings profile's notification scope; unset sends everything. */
  scope?: () => NotificationScope | undefined
  /** Whether an open app is showing Oracle, which then needs no push. */
  oracleWatched?: () => boolean
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
  private oracleSource?: OracleEventSource
  private readonly oracle = new OracleNotifier()
  private policy: PushPolicy = {}
  private recorder?: NotificationRecorder
  private readonly notifiedActions = new Set<string>()
  private readonly sessionStatuses = new Map<string, ManagedSession['status']>()

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
        'https://example.com/agentic-remote',
      this.requireState().publicKey,
      this.requireState().privateKey,
    )
  }

  attach(manager: HubEventSource): void {
    this.manager = manager
    manager.on('event', this.handleEvent)
    void manager
      .listSessions?.()
      .then((sessions) => {
        for (const session of sessions) {
          if (this.recorder && !session.pendingPermission && !session.pendingUserInput) {
            void this.recorder.hub({ type: 'session.upserted', session }, true).catch((error: unknown) => {
              console.warn('Unable to seed notification center session state:', error)
            })
          }
          const key = this.sessionKey(session.computerId, session.id)
          if (!this.sessionStatuses.has(key)) {
            this.sessionStatuses.set(key, session.status)
          }
          if (session.pendingPermission || session.pendingUserInput) {
            this.handleEvent({ type: 'session.upserted', session })
          }
        }
      })
      .catch((error: unknown) => {
        console.warn('Unable to seed push notification session state:', error)
      })
  }

  setPolicy(policy: PushPolicy): void {
    this.policy = policy
  }

  setRecorder(recorder: NotificationRecorder | undefined): void {
    this.recorder = recorder
  }

  /** Notifies Oracle's replies, failures, and requests for your OK. */
  attachOracle(source: OracleEventSource): void {
    this.oracleSource = source
    source.on('event', this.handleOracleEvent)
  }

  stop(): void {
    this.manager?.off('event', this.handleEvent)
    this.manager = undefined
    this.oracleSource?.off('event', this.handleOracleEvent)
    this.oracleSource = undefined
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

  /** Sent whatever the scope: you asked for it, to check this device. */
  async sendTestNotification(): Promise<{ sent: number }> {
    const sent = await this.sendPayload({
      title: 'Agentic Remote notifications work',
      body: 'High priority for actions; low priority when work finishes.',
      tag: 'agentic-remote-test',
      priority: 'normal',
      data: { url: '/' },
    })
    return { sent }
  }

  private readonly handleOracleEvent = (event: ManagerEvent) => {
    const persisted = this.recorder?.oracle(event)
    if (persisted) {
      void persisted.catch((error: unknown) => {
        console.warn('Unable to persist Oracle notification:', error)
      })
    }
    this.deliverOracleEvent(event, persisted)
  }

  private readonly deliverOracleEvent = (event: ManagerEvent, persisted?: Promise<void>) => {
    // Classified even when it will not be sent, so a notification held while
    // you watched Oracle is not sent later.
    const payload = this.oracle.next(event)
    if (!payload || this.policy.oracleWatched?.()) return
    void this.sendPayload(payload, 'oracle', persisted).catch((error: unknown) => {
      console.warn('Unable to send Oracle push notification:', error)
    })
  }

  private readonly handleEvent = (event: HubEvent) => {
    const persisted = this.recorder?.hub(event)
    if (persisted) {
      void persisted.catch((error: unknown) => {
        console.warn('Unable to persist hub notification:', error)
      })
    }
    this.deliverEvent(event, persisted)
  }

  private readonly deliverEvent = (event: HubEvent, persisted?: Promise<void>) => {
    if (event.type === 'computer.removed') {
      const prefix = `${event.computerId}:`
      for (const key of this.notifiedActions) {
        if (key.startsWith(prefix)) {
          this.notifiedActions.delete(key)
        }
      }
      for (const key of this.sessionStatuses.keys()) {
        if (key.startsWith(prefix)) {
          this.sessionStatuses.delete(key)
        }
      }
      this.removeMutedSessions(prefix, false)
      return
    }
    if (event.type === 'session.removed') {
      const removedKey = this.sessionKey(event.computerId, event.sessionId)
      this.removeSessionQuestions(event.computerId, event.sessionId)
      this.sessionStatuses.delete(removedKey)
      if (event.replacedBy) {
        // Clearing replaces a session rather than ending it. The mute belongs
        // to the conversation, so silencing it must survive being cleared.
        this.moveMutedSession(
          removedKey,
          this.sessionKey(event.computerId, event.replacedBy),
        )
      } else {
        this.removeMutedSessions(removedKey, true)
      }
      return
    }
    if (event.type === 'error') {
      if (event.notify) {
        void this.notifyAlert(event.computerId, event.message, persisted).catch((error: unknown) => {
          console.warn('Unable to send alert push notification:', error)
        })
      }
      return
    }
    if (event.type !== 'session.upserted') {
      return
    }
    const session = event.session
    const sessionKey = this.sessionKey(session.computerId, session.id)
    const previousStatus = this.sessionStatuses.get(sessionKey)
    this.sessionStatuses.set(sessionKey, session.status)
    const prefix = `${session.computerId}:${session.id}:`
    const action = session.pendingPermission
      ? {
          key: `${prefix}permission:${session.pendingPermission.requestId}`,
          brief: session.pendingPermission.title,
        }
      : session.pendingUserInput
        ? {
            key: `${prefix}question:${session.pendingUserInput.requestId}`,
            brief: session.pendingUserInput.question,
          }
        : undefined
    for (const key of this.notifiedActions) {
      if (key.startsWith(prefix) && key !== action?.key) {
        this.notifiedActions.delete(key)
      }
    }
    const muted = this.requireState().mutedSessions.includes(sessionKey)
    if (action && !muted) {
      if (!this.notifiedActions.has(action.key)) {
        this.notifiedActions.add(action.key)
        void this.notifyAction(session, action.brief, persisted).catch((error: unknown) => {
          console.warn('Unable to send action-needed push notification:', error)
        })
      }
    }
    if (
      !muted &&
      previousStatus === 'running' &&
      session.status === 'idle' &&
      !session.pendingPermission &&
      !session.pendingUserInput &&
      !session.queuedCount
    ) {
      void this.notifyCompletion(session, persisted).catch((error: unknown) => {
        console.warn('Unable to send completion push notification:', error)
      })
    }
  }

  private removeSessionQuestions(computerId: string, sessionId: string): void {
    const prefix = `${computerId}:${sessionId}:`
    for (const key of this.notifiedActions) {
      if (key.startsWith(prefix)) {
        this.notifiedActions.delete(key)
      }
    }
  }

  private sessionKey(computerId: string, sessionId: string): string {
    return `${computerId}:${sessionId}`
  }

  private moveMutedSession(fromKey: string, toKey: string): void {
    const state = this.requireState()
    if (!state.mutedSessions.includes(fromKey)) {
      return
    }
    state.mutedSessions = [
      ...state.mutedSessions.filter((session) => session !== fromKey),
      toKey,
    ]
    void this.persist().catch((error: unknown) => {
      console.warn('Unable to persist notification mute transfer:', error)
    })
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

  private async notifyAction(
    session: ManagedSession,
    action: string,
    persisted?: Promise<void>,
  ): Promise<void> {
    await this.sendPayload({
      title: `Action needed · ${session.title}`,
      body: `${session.computerName} · ${brief(action)}`,
      tag: `agentic-action-${session.computerId}-${session.id}`,
      priority: 'high',
      data: {
        url: `/?computer=${encodeURIComponent(session.computerId)}&session=${encodeURIComponent(session.id)}`,
      },
    }, 'session', persisted)
  }

  private async notifyAlert(
    computerId: string | undefined,
    message: string,
    persisted?: Promise<void>,
  ): Promise<void> {
    await this.sendPayload(alertNotification(computerId, message), 'alert', persisted)
  }

  private async notifyCompletion(session: ManagedSession, persisted?: Promise<void>): Promise<void> {
    await this.sendPayload({
      title: `Finished · ${session.title}`,
      body: `${session.computerName} · No action needed`,
      tag: `agentic-finished-${session.computerId}-${session.id}`,
      priority: 'low',
      data: {
        url: `/?computer=${encodeURIComponent(session.computerId)}&session=${encodeURIComponent(session.id)}`,
      },
    }, 'session', persisted)
  }

  /** Without a category, as for a test, the scope does not apply. */
  private async sendPayload(
    payload: NotificationPayload,
    category?: NotificationCategory,
    persisted?: Promise<void>,
  ): Promise<number> {
    if (category && !notificationAllowed(this.policy.scope?.(), category)) {
      return 0
    }
    const state = this.requireState()
    if (state.subscriptions.length === 0) {
      return 0
    }
    const subscriptions = persisted ? [...state.subscriptions] : state.subscriptions
    // Admission starts before policy checks. Only external delivery waits for
    // durability; event-time mute/presence/scope and clear-transfer semantics
    // remain exactly the same even if disk I/O is slow.
    if (persisted) await persisted
    const expired = new Set<string>()
    const failures: unknown[] = []
    let sent = 0
    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await this.sender(subscription, JSON.stringify(payload), {
            TTL: payload.priority === 'high' ? 3_600 : 900,
            // FCM rejects RFC 8030's `very-low`, so the lowest portable
            // urgency is `low`.
            urgency:
              payload.priority === 'high'
                ? 'high'
                : payload.priority === 'low'
                  ? 'low'
                  : 'normal',
          })
          sent += 1
        } catch (error) {
          const statusCode = (error as { statusCode?: number }).statusCode
          if (statusCode === 404 || statusCode === 410) {
            expired.add(subscription.endpoint)
            return
          }

          failures.push(error)
        }
      }),
    )
    if (expired.size > 0) {
      state.subscriptions = state.subscriptions.filter(
        (subscription) => !expired.has(subscription.endpoint),
      )
      await this.persist()
    }
    if (failures.length > 0) {
      throw new AggregateError(
        failures,
        'Some push notifications could not be delivered',
      )
    }
    return sent
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

function brief(value: string): string {
  return notificationBrief(value)
}
