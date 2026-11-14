import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import {
  defaultHubFeatureFlags,
  effectivePreviewFeatures,
  isPreviewAvailable,
} from '../shared/feature-flags'
import { fetchHubFeatureFlags } from './api'
import type { SettingsProfileClient } from './settings-profile'
import { PreviewFeaturesContext, type PreviewFeatureState } from './preview-features'

export function PreviewFeaturesProvider({
  settingsClient,
  children,
}: {
  settingsClient: SettingsProfileClient
  children: ReactNode
}) {
  const profile = useSyncExternalStore(settingsClient.subscribe, settingsClient.getState)
  const preferences = profile.values.previewFeatures
  const [hubFlags, setHubFlags] = useState(defaultHubFeatureFlags)
  useEffect(() => {
    let active = true
    let controller: AbortController | undefined
    const refresh = () => {
      controller?.abort()
      const request = new AbortController()
      controller = request
      void fetchHubFeatureFlags(request.signal).then(
        (flags) => {
          if (active && !request.signal.aborted) setHubFlags(flags)
        },
        () => {
          // Old or unreachable hubs cannot grant a server-dependent preview.
          if (active && !request.signal.aborted) setHubFlags(defaultHubFeatureFlags)
        },
      )
    }
    refresh()
    window.addEventListener('online', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      active = false
      controller?.abort()
      window.removeEventListener('online', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])
  const value = useMemo<PreviewFeatureState>(() => ({
    hubFlags,
    preferences,
    effective: effectivePreviewFeatures(preferences, hubFlags),
    set: (name, enabled) => {
      if (!isPreviewAvailable(name, hubFlags)) return
      settingsClient.set('previewFeatures', {
        ...settingsClient.getState().values.previewFeatures,
        [name]: enabled,
      })
    },
  }), [hubFlags, preferences, settingsClient])
  return <PreviewFeaturesContext.Provider value={value}>{children}</PreviewFeaturesContext.Provider>
}
