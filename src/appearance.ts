export type Appearance = 'graphite' | 'light'

export const appearanceStorageKey = 'agentic-remote:appearance'

export function appearanceFrom(value: unknown): Appearance {
  return value === 'light' ? 'light' : 'graphite'
}
