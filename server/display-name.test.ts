import { expect, it } from 'vitest'
import { parseSettingValue } from '../shared/settings-profile.js'
import { resolveHubDisplayName } from './display-name.js'

it('validates display names without controls and trims surrounding whitespace', () => {
  expect(parseSettingValue('displayName', ' Alex Morgan ')).toEqual({ ok: true, value: 'Alex Morgan' })
  for (const value of ['', ' ', 'a'.repeat(61), 'Alex\nMorgan', 'Alex\u0085Morgan', 3]) {
    expect(parseSettingValue('displayName', value).ok).toBe(false)
  }
})
it('resolves only the global Git name, then USER, without returning invalid data', async () => {
  expect(await resolveHubDisplayName(async () => 'Alex Morgan\n', 'demo')).toBe('Alex Morgan')
  expect(await resolveHubDisplayName(async () => { throw new Error('not configured') }, 'demo')).toBe('demo')
  expect(await resolveHubDisplayName(async () => '\0', '')).toBe('User')
})
