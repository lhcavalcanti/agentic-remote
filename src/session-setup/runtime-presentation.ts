import type {
  AgentMode,
  AgentProvider,
  AgentProviderCapability,
  ComputerSummary,
  CreateSessionInput,
  RuntimeModelOption,
  RuntimeOptions,
  RuntimeReasoningEffort,
} from '../../shared/contracts'
import type { DefaultRuntimeSelection } from './types'

export function agentModeName(mode: AgentMode, provider: AgentProvider): string {
  return mode === 'plan'
    ? 'Plan'
    : mode === 'autopilot'
      ? provider === 'claude' ? 'Auto' : 'Autopilot'
      : 'Interactive'
}

export function isRuntimeReasoningEffort(
  value: unknown,
): value is RuntimeReasoningEffort {
  return (
    value === 'low' ||
    value === 'medium' ||
    value === 'high' ||
    value === 'xhigh' ||
    value === 'max'
  )
}

export function computerProviders(
  computer: ComputerSummary | undefined,
): AgentProviderCapability[] {
  return (
    computer?.providers || [
      {
        id: 'copilot',
        name: 'GitHub Copilot',
        available: true,
        terminalBacked: true,
      },
    ]
  )
}

export function compactTokens(value: number): string {
  if (value < 1_000) {
    return String(value)
  }
  if (value < 1_000_000) {
    return `${(value / 1_000).toFixed(value < 10_000 ? 1 : 0)}k`
  }
  return `${(value / 1_000_000).toFixed(1)}m`
}

export function contextSizeLabel(
  model: RuntimeOptions['models'][number],
  tier: 'default' | 'long_context',
): string {
  const limit = model.contextTokenLimits?.[tier]
  return limit ? `${compactTokens(limit)} tokens` : 'Automatic'
}

export function normalizedRuntimeSelection(
  selection: DefaultRuntimeSelection,
  models: RuntimeModelOption[],
): DefaultRuntimeSelection | undefined {
  const modelId = selection.model.trim()
  if (!modelId) {
    return undefined
  }

  const model =
    models.find((candidate) => candidate.id === modelId) || models[0]
  if (!model) {
    return undefined
  }

  return {
    model: model.id,
    reasoningEffort:
      selection.reasoningEffort !== '' &&
      model.reasoningEfforts.includes(selection.reasoningEffort)
      ? selection.reasoningEffort
      : model.reasoningEfforts[0] || '',
    contextTier: model.contextTiers.includes(selection.contextTier)
      ? selection.contextTier
      : 'default',
    mode: selection.mode,
  }
}

/**
 * The runtime a new session starts with from a provider's New-session
 * setting: its model, once the provider's own list confirms it, with that
 * model's effort and context size, and its mode.
 */
export function newSessionRuntimeInput(
  selection: DefaultRuntimeSelection,
  models: RuntimeModelOption[] | undefined,
): Pick<CreateSessionInput, 'model' | 'reasoningEffort' | 'contextTier' | 'mode'> {
  const runtime = models ? normalizedRuntimeSelection(selection, models) : undefined
  const model = runtime?.model.trim()
  return {
    ...(model && runtime
      ? {
          model,
          ...(runtime.reasoningEffort ? { reasoningEffort: runtime.reasoningEffort } : {}),
          contextTier: runtime.contextTier,
        }
      : {}),
    ...(selection.mode ? { mode: selection.mode } : {}),
  }
}
