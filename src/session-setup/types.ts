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
