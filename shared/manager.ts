/**
 * The session manager agent: one hub-owned conversation that knows every
 * session and delegates work to new ones. See docs/design/session-manager.md.
 */

import type { AgentMode, AgentProvider, RuntimeReasoningEffort } from './contracts.js'

/** The longest message the manager accepts. Anything shorter is queued. */
export const MANAGER_MESSAGE_MAX_LENGTH = 100_000

/** How many transcript messages a snapshot carries. */
export const MANAGER_SNAPSHOT_MESSAGES = 200

export type ManagerStatus = 'idle' | 'working' | 'recovering' | 'offline'

export type ManagerMessageRole = 'user' | 'assistant' | 'activity' | 'notice'

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
}

export interface ManagerMessage {
  id: string
  role: ManagerMessageRole
  content: string
  createdAt: string
  updatedAt?: string
  /** Set on the messages you send. */
  state?: ManagerMessageState
  /** Why a message failed, shown beside its Retry. */
  error?: string
  /** The message of yours a reply or activity belongs to. */
  replyTo?: string
  /** The tool behind an activity. */
  tool?: string
  /** Sessions an activity or reply refers to; each opens that session. */
  sessionRefs?: ManagerSessionRef[]
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
}

export interface SendManagerMessageInput {
  content: string
  defaults?: ManagerClientDefaults
}

export type ManagerEvent =
  | {
      type: 'manager.status'
      status: ManagerStatus
      queued: number
      lastError?: string
    }
  | { type: 'manager.message'; message: ManagerMessage }
  | { type: 'manager.delta'; messageId: string; content: string }
  | { type: 'manager.sessions'; managedSessions: string[] }
  | { type: 'manager.reset'; snapshot: ManagerSnapshot }
