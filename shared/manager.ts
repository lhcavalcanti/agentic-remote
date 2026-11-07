/**
 * Oracle, the session manager agent: one hub-owned conversation that knows
 * every session and delegates work to new ones. Shown to you as "Oracle";
 * the protocol, routes, settings, and data folder keep the "manager" name.
 * See docs/design/session-manager.md.
 */

import type { AgentMode, AgentProvider, RuntimeReasoningEffort } from './contracts.js'

/** The longest message the manager accepts. Anything shorter is queued. */
export const MANAGER_MESSAGE_MAX_LENGTH = 100_000

/** How many recent transcript messages a snapshot carries; every waiting one is added. */
export const MANAGER_SNAPSHOT_MESSAGES = 200

export type ManagerStatus = 'idle' | 'working' | 'recovering' | 'offline'

export type ManagerMessageRole = 'user' | 'assistant' | 'activity' | 'notice'

/** Trusted hub-side provenance for a user message. */
export type ManagerMessageSource =
  | 'typed'
  | 'voice'
  | 'scheduled'
  | 'proactive'
  | 'task'

export interface ManagerAutomaticContext {
  kind: 'proactive' | 'task'
  taskId?: string
  eventIds?: string[]
  sessionRefs?: ManagerSessionRef[]
}

export type ManagerProactiveOutcome =
  | {
      kind: 'task'
      eventIds: string[]
      title: string
      summary: string
      nextAction: string
      owner: 'oracle' | 'user'
      executionPrompt?: string
    }
  | {
      kind: 'no-action'
      eventIds: string[]
      reason: string
    }

export const managerCheckCadences = [60, 120, 240, 480] as const
export type ManagerCheckCadenceMinutes = (typeof managerCheckCadences)[number]

export interface ManagerProactiveSettings {
  enabled: boolean
  cadenceMinutes: ManagerCheckCadenceMinutes
  timeZone: string
  quietStartHour: number
  quietEndHour: number
}

export interface ManagerProactiveSnapshot extends ManagerProactiveSettings {
  nextCheckAt?: string
  latestCheckAt?: string
  latestCheckState?: ManagerMessageState
}

/** Delivery state of a message you sent the manager. */
export type ManagerMessageState =
  | 'queued'
  | 'running'
  | 'done'
  | 'failed'
  | 'interrupted'
  | 'cancelled'

export interface ManagerSessionRef {
  computerId: string
  sessionId: string
  title?: string
  /** Immediate root prompt ID, or the durable queued prompt receipt. */
  promptId?: string
  /** Root user message before a queued delivery was appended. */
  promptAnchorId?: string
  /** One-based FIFO position after the anchor for a queued delivery. */
  promptQueuePosition?: number
  /** SHA-256 of the exact queued prompt content. */
  promptDigest?: string
}

/**
 * Something only you can decide, asked by the manager and answered in the app.
 * The manager cannot answer it for you.
 */
export interface ManagerConfirmation {
  kind: 'close-session'
  computerId: string
  sessionId: string
  title: string
  /** `closing` is recorded before the deletion, so a restart can finish it. */
  state: 'pending' | 'closing' | 'confirmed' | 'declined' | 'failed'
  error?: string
  /**
   * Oracle closed it without asking, as `sessionClosePolicy` allows; such a
   * close is never pending. Absent when the user answered.
   */
  decidedBy?: 'oracle'
}

export interface ManagerMessage {
  id: string
  role: ManagerMessageRole
  content: string
  createdAt: string
  updatedAt?: string
  /** Set on the messages you send. */
  state?: ManagerMessageState
  /**
   * Ask mode: Oracle answers from the current state, reading sessions and
   * asking them side questions, but must not start, message, rename, stop,
   * or close one, so their work carries on undisturbed.
   */
  answerOnly?: boolean
  /**
   * Immutable provenance assigned at the trusted submission boundary. Older
   * persisted user messages without it are treated as typed.
   */
  readonly source?: ManagerMessageSource
  /** Trusted automatic-turn scope, immutable after the message is queued. */
  readonly automatic?: ManagerAutomaticContext
  /**
   * When Oracle first started on it. From then on it is no longer the user's
   * to edit, even if a restart or Retry puts it back in the queue.
   */
  startedAt?: string
  /** Why a message failed, shown beside its Retry. */
  error?: string
  /** Durable retries of the same message after its first terminal result. */
  retryCount?: number
  /** A completed scheduled check inside its quiet window must not alert. */
  suppressNotification?: boolean
  /** The message of yours a reply or activity belongs to. */
  replyTo?: string
  /** The tool behind an activity. */
  tool?: string
  /** Sessions an activity or reply refers to; each opens that session. */
  sessionRefs?: ManagerSessionRef[]
  /** A decision waiting for you, such as closing a session. */
  confirmation?: ManagerConfirmation
}

/**
 * The browser's own defaults for new sessions. They live in the browser, so a
 * message carries them for the sessions the manager starts on your behalf.
 */
export interface ManagerClientDefaults {
  computerId?: string
  mode?: AgentMode
  provider?: AgentProvider
  model?: string
  reasoningEffort?: RuntimeReasoningEffort
  /** Default folder per computer ID. */
  folders?: Record<string, string>
}

/** Internal provenance used to apply trusted submission policy at the hub. */
export type ManagerSubmissionSource = ManagerMessageSource

export interface ManagerSubmissionOptions {
  answerOnly?: boolean
  source?: ManagerSubmissionSource
}

export interface ManagerInternalSubmission {
  id: string
  content: string
  source: 'proactive' | 'task'
  answerOnly: boolean
  automatic: ManagerAutomaticContext
}

/** Oracle's own runtime settings, kept on the hub. */
/** How Oracle opens the sessions it starts: the Copilot SDK, or a terminal (tmux). */
export type ManagerSessionBackend = 'sdk' | 'terminal'

/**
 * `ask` (the default) confirms every close in the app. `oracle-started` lets
 * a typed Delegate message close an idle session Oracle started, named by its
 * full id, that no unfinished Oracle task uses; anything else still asks.
 */
export type ManagerSessionClosePolicy = 'ask' | 'oracle-started'

export interface ManagerSettings {
  /** Unset uses the hub's default: AGENTIC_REMOTE_MANAGER_MODEL, else Copilot's. */
  model?: string
  reasoningEffort?: RuntimeReasoningEffort
}

export interface ManagerSettingsSnapshot extends ManagerSettings {
  /** The hub's default model, from AGENTIC_REMOTE_MANAGER_MODEL, if any. */
  defaultModel?: string
  defaultReasoningEffort?: RuntimeReasoningEffort
  /** The chosen model could not start, so Copilot's default is answering. */
  modelUnavailable?: boolean
  /**
   * Where Oracle starts new sessions, by computer ID. Chosen in App settings
   * or changed by Oracle when you ask; a computer without one uses your
   * default session folder.
   */
  sessionFolders?: Record<string, string>
  /**
   * How Oracle opens the sessions it starts. The Copilot SDK unless set to a
   * terminal; a provider without a terminal always uses its SDK. A hub from
   * before this setting omits it and opens Copilot sessions in a terminal, so
   * a client MUST NOT read its absence as the SDK.
   */
  sessionBackend?: ManagerSessionBackend
  /**
   * Whether Oracle asks before closing a session. A hub from before this
   * setting omits it and always asks.
   */
  sessionClosePolicy?: ManagerSessionClosePolicy
  proactive?: ManagerProactiveSnapshot
}

export interface ManagerSnapshot {
  available: boolean
  /** Why the manager is not available on this hub. */
  unavailableReason?: string
  status: ManagerStatus
  messages: ManagerMessage[]
  queued: number
  /** `computerId:sessionId` of each session the manager started. */
  managedSessions: string[]
  lastError?: string
  /** The reply being written, if any. */
  streaming?: { messageId: string; content: string }
  settings?: ManagerSettingsSnapshot
}

export interface ResolveManagerConfirmationInput {
  accept: boolean
}

export interface SendManagerMessageInput {
  content: string
  defaults?: ManagerClientDefaults
  /** Answer it without starting or steering any session. */
  answerOnly?: boolean
}

export interface UpdateManagerSettingsInput {
  /** Null returns to the hub's default; absent leaves the model as it is. */
  model?: string | null
  /** Applies with `model`. */
  reasoningEffort?: RuntimeReasoningEffort | null
  /** Folders to change, by computer ID; null returns that computer to its default. */
  sessionFolders?: Record<string, string | null>
  /** How Oracle opens the sessions it starts; absent leaves it as it is. */
  sessionBackend?: ManagerSessionBackend
  /** Whether Oracle asks before closing a session; absent leaves it as it is. */
  sessionClosePolicy?: ManagerSessionClosePolicy
  /** Opt-in read-only periodic status checks. */
  proactive?: ManagerProactiveSettings
}

export type ManagerEvent =
  | {
      type: 'manager.status'
      status: ManagerStatus
      queued: number
      lastError?: string
    }
  | { type: 'manager.message'; message: ManagerMessage }
  | { type: 'manager.reorder'; messages: ManagerMessage[] }
  | { type: 'manager.delta'; messageId: string; content: string }
  | { type: 'manager.sessions'; managedSessions: string[] }
  | { type: 'manager.reset'; snapshot: ManagerSnapshot }
  | { type: 'manager.settings'; settings: ManagerSettingsSnapshot }

export function isManagerEvent(event: { type: string }): event is ManagerEvent {
  return event.type.startsWith('manager.')
}
