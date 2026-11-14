import { describe, expect, it } from 'vitest'
import {
  defaultHubFeatureFlags,
  effectivePreviewFeatures,
  hubFlagCatalogue,
  isPreviewAvailable,
  parseFeatureFlag,
  previewFeatureNames,
  readHubFeatureFlags,
} from './feature-flags.js'
import { parseSettingValue, settingsValuesFrom } from './settings-profile.js'

describe('hub feature flags', () => {
  it.each(['on', 'true', '1', ' ON ', 'TrUe'])('accepts enabled value %s', (value) => {
    expect(parseFeatureFlag('AGENTIC_REMOTE_FEATURE_SCHEDULER', value)).toBe(true)
  })

  it.each(['off', 'false', '0', ' OFF ', 'FaLsE'])('accepts disabled value %s', (value) => {
    expect(parseFeatureFlag('AGENTIC_REMOTE_FEATURE_SCHEDULER', value)).toBe(false)
  })

  it.each(['', ' ', 'yes', 'enabled', '2', 'on,off'])('rejects invalid value %j with its variable name', (value) => {
    expect(() => parseFeatureFlag('AGENTIC_REMOTE_FEATURE_SCHEDULER', value))
      .toThrow('Invalid AGENTIC_REMOTE_FEATURE_SCHEDULER')
  })

  it('defaults every unset flag off and reads each declared environment variable', () => {
    expect(readHubFeatureFlags({})).toEqual(defaultHubFeatureFlags)
    expect(readHubFeatureFlags({
      AGENTIC_REMOTE_FEATURE_NOTIFICATION_CENTER: 'on',
      AGENTIC_REMOTE_FEATURE_HOST_MONITOR: 'true',
      AGENTIC_REMOTE_FEATURE_SCHEDULER: '1',
    })).toEqual({ notificationCenter: true, hostMonitor: true, scheduler: true })
  })

  it.each(Object.values(hubFlagCatalogue))('names $env when its value is invalid', (flag) => {
    expect(() => readHubFeatureFlags({ [flag.env]: 'sometimes' })).toThrow(`Invalid ${flag.env}`)
  })
})

describe('preview feature authority', () => {
  it('defaults off even when every hub feature is enabled', () => {
    expect(Object.values(effectivePreviewFeatures(undefined, {
      notificationCenter: true, hostMonitor: true, scheduler: true,
    }))).toEqual(previewFeatureNames.map(() => false))
  })

  it('allows independent previews but masks dependent preferences without changing them', () => {
    const preferences = {
      composerRefresh: true, desktopRail: true, settingsNavigation: true,
      notificationPanel: true, hostMonitorView: true, schedulerView: true,
      healthCard: true,
    }
    expect(effectivePreviewFeatures(preferences, defaultHubFeatureFlags)).toEqual({
      composerRefresh: true, desktopRail: true, settingsNavigation: true,
      notificationPanel: false, hostMonitorView: false, schedulerView: false, healthCard: true,
    })
    expect(preferences.notificationPanel).toBe(true)
    expect(effectivePreviewFeatures(preferences, {
      notificationCenter: true, hostMonitor: true, scheduler: true,
    })).toEqual(preferences)
  })

  it('checks each dependency independently', () => {
    const flags = { notificationCenter: true, hostMonitor: false, scheduler: false }
    expect(isPreviewAvailable('notificationPanel', flags)).toBe(true)
    expect(isPreviewAvailable('hostMonitorView', flags)).toBe(false)
    expect(isPreviewAvailable('schedulerView', flags)).toBe(false)
    expect(isPreviewAvailable('composerRefresh', flags)).toBe(true)
  })

  it('validates partial boolean preferences and drops malformed cached settings', () => {
    expect(parseSettingValue('previewFeatures', { composerRefresh: true, schedulerView: false }))
      .toEqual({ ok: true, value: { composerRefresh: true, schedulerView: false } })
    for (const invalid of [null, [], true, { unknown: true }, { composerRefresh: 'on' }]) {
      expect(parseSettingValue('previewFeatures', invalid).ok).toBe(false)
      expect(settingsValuesFrom({ previewFeatures: invalid })).toEqual({})
    }
  })
})
