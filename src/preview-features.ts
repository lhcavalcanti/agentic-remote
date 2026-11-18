import { createContext, useContext } from 'react'
import {
  defaultHubFeatureFlags,
  effectivePreviewFeatures,
  type HubFeatureFlags,
  type PreviewFeature,
  type PreviewFeatures,
} from '../shared/feature-flags'

export interface PreviewFeatureState {
  hubFlags: HubFeatureFlags
  preferences: PreviewFeatures | undefined
  effective: Record<PreviewFeature, boolean>
  set: (name: PreviewFeature, enabled: boolean) => void
}

export const PreviewFeaturesContext = createContext<PreviewFeatureState>({
  hubFlags: defaultHubFeatureFlags,
  preferences: undefined,
  effective: effectivePreviewFeatures(undefined, defaultHubFeatureFlags),
  set: () => undefined,
})

export function usePreviewFeatures(): PreviewFeatureState {
  return useContext(PreviewFeaturesContext)
}

/** True only after the user opts in and the authoritative hub allows it. */
export function usePreviewFeature(name: PreviewFeature): boolean {
  return usePreviewFeatures().effective[name]
}
