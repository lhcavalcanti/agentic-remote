export type ModelFamily = 'anthropic' | 'openai' | 'google' | 'xai' | 'meta' | 'mistral' | 'generic'

const families: ReadonlyArray<readonly [Exclude<ModelFamily, 'generic'>, RegExp]> = [
  ['anthropic', /(?:^|[^a-z0-9])(?:claude|anthropic|opus|sonnet|haiku)(?![a-z])/i],
  ['openai', /(?:^|[^a-z0-9])(?:(?:gpt|openai|codex|chatgpt)(?![a-z])|o[134](?![a-z0-9]))/i],
  ['google', /(?:^|[^a-z0-9])(?:gemini|google)(?![a-z])/i],
  ['xai', /(?:^|[^a-z0-9])(?:grok|xai)(?![a-z])/i],
  ['meta', /(?:^|[^a-z0-9])(?:llama|meta)(?![a-z])/i],
  ['mistral', /(?:^|[^a-z0-9])(?:mistral|mixtral|codestral)(?![a-z])/i],
]

/** Classify the model, not its provider or execution backend. A recognized ID wins. */
export function modelFamily(modelId: string, displayName?: string): ModelFamily {
  for (const value of [modelId, displayName]) {
    if (!value) continue
    const family = families.find(([, pattern]) => pattern.test(value))
    if (family) return family[0]
  }
  return 'generic'
}

const vendorPrefix = /^(?:claude|anthropic|gpt|openai)[-_\s]+/i

/**
 * The model's own name, for a narrow row where the family glyph already says
 * whose it is: claude-opus-5.5 is Opus 5.5 and gpt-6.2-sol is 6.2 Sol. An
 * unrecognized model, or one that is only a version once its vendor is gone,
 * keeps its ID.
 */
export function shortModelName(modelId: string): string {
  const id = modelId.trim()
  if (modelFamily(id) === 'generic') return id
  const words = (id.split('/').pop() ?? id)
    .replace(/\[(\d+)m\]$/i, '-$1M')
    .replace(/[-_]\d{8}$/, '')
    .replace(vendorPrefix, '')
    .split(/[-_\s]+/)
    .filter(Boolean)
  if (!words.some((word) => /^[a-z]+$/i.test(word))) return id
  const named: string[] = []
  for (const word of words) {
    const previous = named.at(-1)
    // Anthropic spells versions with hyphens: claude-opus-4-1 is Opus 4.1.
    if (/^\d+$/.test(word) && previous && /^\d+$/.test(previous)) {
      named[named.length - 1] = `${previous}.${word}`
    } else {
      named.push(/^[a-z]+$/i.test(word) ? word[0].toUpperCase() + word.slice(1) : word)
    }
  }
  return named.join(' ')
}
