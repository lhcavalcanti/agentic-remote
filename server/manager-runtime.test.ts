import { describe, expect, it } from 'vitest'
import { managerRuntimeSettings } from './manager-runtime.js'

describe('managerRuntimeSettings', () => {
  it('defaults structured memory off', () => {
    expect(managerRuntimeSettings({})).toEqual({
      enabled: true,
      model: undefined,
      reasoningEffort: undefined,
      structuredMemory: 'off',
    })
  })

  it.each([
    ['off', 'off'],
    [' SHADOW ', 'shadow'],
    ['On', 'on'],
  ] as const)('accepts the structured-memory mode %j', (value, expected) => {
    expect(managerRuntimeSettings({
      AGENTIC_REMOTE_MANAGER_STRUCTURED_MEMORY: value,
    }).structuredMemory).toBe(expected)
  })

  it('refuses an invalid structured-memory mode', () => {
    expect(() => managerRuntimeSettings({
      AGENTIC_REMOTE_MANAGER_STRUCTURED_MEMORY: 'enabled',
    })).toThrow(
      'AGENTIC_REMOTE_MANAGER_STRUCTURED_MEMORY must be off, shadow, or on',
    )
  })
})
