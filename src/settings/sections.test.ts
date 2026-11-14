import { describe, expect, it } from 'vitest'
import { settingsSections } from './sections'

describe('settings section registry', () => {
  it('keeps the existing jump-bar order and storage ownership', () => {
    expect(settingsSections.map(({ id, title, scope }) => ({ id, title, scope }))).toEqual([
      { id: 'settings-models', title: 'Models', scope: 'hub' },
      { id: 'settings-folders', title: 'Folders', scope: 'hub' },
      { id: 'settings-oracle', title: 'Oracle', scope: 'hub' },
      { id: 'settings-notifications', title: 'Notifications', scope: 'device' },
      { id: 'settings-interface', title: 'Interface', scope: 'hub' },
      { id: 'settings-app', title: 'App', scope: 'device' },
    ])
  })
})
