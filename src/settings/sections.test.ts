import { describe, expect, it } from 'vitest'
import { navigableSettingsSections } from './sections'

describe('settings section registry', () => {
  it('keeps Oracle before Notifications while Remote machines stays after Folders', () => {
    expect(navigableSettingsSections.map((section) => section.title)).toEqual([
      'Models', 'Folders', 'Remote machines', 'Oracle', 'Notifications', 'Interface', 'App',
    ])
  })

})
