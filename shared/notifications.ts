import type { ManagerEvent, ManagerMessage } from './manager.js'

/**
 * Which notifications reach your devices. A synced setting: the hub applies
 * it to everything it sends, on every device. Whether a device can receive
 * them at all (its browser permission and push subscription) stays with that
 * device. See docs/app-spec.md §10.
 */
export const notificationScopes = ['all', 'oracle', 'off'] as const
export type NotificationScope = (typeof notificationScopes)[number]

/**
 * What a notification is about.
 * - `session`: a session's question, permission request, or finish. Any
 *   session, including those Oracle started.
 * - `alert`: the hub's own health, such as a Copilot CLI that failed its
 *   startup check.
 * - `oracle`: Oracle's reply to your message, its failure to answer, or its
 *   request that you confirm something. Notifications Oracle decides to send
 *   on its own belong here too.
 */
export type NotificationCategory = 'session' | 'alert' | 'oracle'

/** Unset, or a value this build does not know, sends everything, as before. */
export function notificationAllowed(
  scope: NotificationScope | undefined,
  category: NotificationCategory,
): boolean {
  if (scope === 'off') return false
  if (scope === 'oracle') return category === 'oracle'
  return true
}

export interface NotificationPayload {
  title: string
  body: string
  tag: string
  priority: 'high' | 'normal' | 'low'
  data: { url: string }
}

/** Opens the app with Oracle's panel open. */
export const ORACLE_NOTIFICATION_URL = '/?oracle=open'

const ORACLE_REPLY_TAG = 'agentic-oracle-reply'
const ORACLE_CONFIRM_TAG = 'agentic-oracle-confirm'
/** Every tag Oracle notifications use, so opening Oracle can clear them. */
export const oracleNotificationTags = [ORACLE_REPLY_TAG, ORACLE_CONFIRM_TAG] as const

const BRIEF_LIMIT = 140
const REMEMBERED_REPLIES = 50

/** One line of at most 140 characters, for a notification body. */
export function notificationBrief(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized.length > BRIEF_LIMIT
    ? `${normalized.slice(0, BRIEF_LIMIT - 1).trimEnd()}…`
    : normalized
}

/** Markdown read aloud as text: links keep their words, emphasis its letters. */
function plainText(markdown: string): string {
  return markdown
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/(\*\*|__|`)/g, '')
}

/**
 * Turns Oracle's events into the notifications they warrant, each at most
 * once. Both the hub (Web Push) and the native shell use it, so a reply is
 * announced the same way wherever it reaches you.
 */
export class OracleNotifier {
  /** Reply text by the message it answers, until that message is done. */
  private readonly replies = new Map<string, string>()
  private readonly announced = new Set<string>()

  next(event: ManagerEvent): NotificationPayload | undefined {
    if (event.type === 'manager.reset') {
      this.replies.clear()
      this.announced.clear()
      return undefined
    }
    if (event.type !== 'manager.message') return undefined
    const message = event.message
    if (message.role === 'assistant') {
      if (message.replyTo && message.content.trim()) this.remember(message.replyTo, message.content)
      return undefined
    }
    if (message.role === 'activity') {
      if (message.confirmation?.state !== 'pending') return undefined
      return this.once(`${message.id}:confirm`, {
        title: 'Oracle needs your OK',
        body: notificationBrief(message.content),
        tag: ORACLE_CONFIRM_TAG,
        priority: 'high',
        data: { url: ORACLE_NOTIFICATION_URL },
      })
    }
    if (message.role !== 'user') return undefined
    return this.forYourMessage(message)
  }

  private forYourMessage(message: ManagerMessage): NotificationPayload | undefined {
    if (message.state === 'queued' || message.state === 'running') {
      // A retry is a new attempt, whose outcome is news again.
      this.announced.delete(`${message.id}:failed`)
      return undefined
    }
    if (message.state === 'failed') {
      return this.once(`${message.id}:failed`, {
        title: 'Oracle couldn’t answer',
        body: notificationBrief(message.error || 'Your message is kept; press Retry.'),
        tag: ORACLE_REPLY_TAG,
        priority: 'normal',
        data: { url: ORACLE_NOTIFICATION_URL },
      })
    }
    if (message.state !== 'done') return undefined
    const reply = this.replies.get(message.id)
    this.replies.delete(message.id)
    const brief = reply ? notificationBrief(plainText(reply)) : ''
    return this.once(`${message.id}:done`, {
      title: 'Oracle replied',
      body: brief || 'Open Oracle to see what it did.',
      tag: ORACLE_REPLY_TAG,
      priority: 'normal',
      data: { url: ORACLE_NOTIFICATION_URL },
    })
  }

  private once(key: string, payload: NotificationPayload): NotificationPayload | undefined {
    if (this.announced.has(key)) return undefined
    this.announced.add(key)
    if (this.announced.size > REMEMBERED_REPLIES * 4) {
      this.announced.delete(this.announced.values().next().value!)
    }
    return payload
  }

  private remember(replyTo: string, content: string): void {
    this.replies.delete(replyTo)
    this.replies.set(replyTo, content)
    if (this.replies.size > REMEMBERED_REPLIES) {
      this.replies.delete(this.replies.keys().next().value!)
    }
  }
}
