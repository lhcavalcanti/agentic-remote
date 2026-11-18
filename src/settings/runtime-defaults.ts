import type { RuntimeModelOption } from '../../shared/contracts'
import type { DefaultRuntimeSelection } from '../session-setup/types'

export const emptyRuntimeSelection: DefaultRuntimeSelection = {
  model: '',
  reasoningEffort: '',
  contextTier: 'default',
  mode: '',
}

export function defaultAgentMode(value: unknown): DefaultRuntimeSelection['mode'] {
  return value === 'plan' || value === 'autopilot' ? value : ''
}

export function mergeRuntimeModelOptions(
  catalogs: RuntimeModelOption[][],
): RuntimeModelOption[] {
  const merged = new Map<string, RuntimeModelOption>()
  for (const catalog of catalogs) {
    for (const model of catalog) {
      const existing = merged.get(model.id)
      if (!existing) {
        merged.set(model.id, {
          ...model,
          reasoningEfforts: [...model.reasoningEfforts],
          contextTiers: [...model.contextTiers],
          contextTokenLimits: model.contextTokenLimits
            ? { ...model.contextTokenLimits }
            : undefined,
        })
        continue
      }
      merged.set(model.id, {
        ...existing,
        description: existing.description || model.description,
        reasoningEfforts: [
          ...new Set([
            ...existing.reasoningEfforts,
            ...model.reasoningEfforts,
          ]),
        ],
        contextTiers: [
          ...new Set([...existing.contextTiers, ...model.contextTiers]),
        ],
        contextTokenLimits: {
          ...model.contextTokenLimits,
          ...existing.contextTokenLimits,
        },
      })
    }
  }
  return [...merged.values()]
}

export function sameRuntimeSelection(
  left: DefaultRuntimeSelection,
  right: DefaultRuntimeSelection,
): boolean {
  return (
    left.model === right.model &&
    left.reasoningEffort === right.reasoningEffort &&
    left.contextTier === right.contextTier &&
    left.mode === right.mode
  )
}
