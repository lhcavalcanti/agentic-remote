import type {
  AgentMode,
  AgentProvider,
  RuntimeReasoningEffort,
} from '../../shared/contracts'

export type DefaultRuntimeSelection = {
  model: string
  reasoningEffort: RuntimeReasoningEffort | ''
  contextTier: 'default' | 'long_context'
  /** Blank starts Interactive, as a provider does without one. */
  mode: Exclude<AgentMode, 'interactive'> | ''
}

export type DefaultRuntimeSettings = Record<AgentProvider, DefaultRuntimeSelection>

export type DefaultSessionFolders = Record<string, string>

export type SessionCreationHandle = {
  id: string
  intent: number
  selectionIntent: number
  selectedKey?: string
  /** Settles once earlier creations on the same computer have finished. */
  turn: Promise<void>
  /** Lets the next creation on the same computer go ahead. */
  finish: () => void
}
