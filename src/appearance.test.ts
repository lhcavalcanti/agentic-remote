import { describe, expect, it } from 'vitest'
import { appearanceFrom } from './appearance'

describe('workbench appearance', () => {
  it('keeps graphite as the default instead of silently switching existing users to light', () => {
    for (const value of [undefined, null, '', 'system', {}, 'graphite']) {
      expect(appearanceFrom(value)).toBe('graphite')
    }
  })

  it('restores an explicitly chosen light appearance', () => {
    expect(appearanceFrom('light')).toBe('light')
  })
})
