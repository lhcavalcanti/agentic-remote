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
