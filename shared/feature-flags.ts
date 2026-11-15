export const hubFlagCatalogue = {
  notificationCenter: {
    env: 'AGENTIC_REMOTE_FEATURE_NOTIFICATION_CENTER',
    description: 'Store and serve the hub notification center.',
    default: false,
  },
  hostMonitor: {
    env: 'AGENTIC_REMOTE_FEATURE_HOST_MONITOR',
    description: 'Collect and serve host-monitor telemetry.',
    default: false,
  },
  scheduler: {
    env: 'AGENTIC_REMOTE_FEATURE_SCHEDULER',
    description: 'Run and manage scheduled sessions on the hub.',
    default: false,
  },
} as const

export type HubFeatureFlag = keyof typeof hubFlagCatalogue
export type HubFeatureFlags = Readonly<Record<HubFeatureFlag, boolean>>

export const defaultHubFeatureFlags: HubFeatureFlags = Object.freeze({
  notificationCenter: false,
  hostMonitor: false,
  scheduler: false,
})

export const previewFeatureCatalogue = {
  composerRefresh: {
    label: 'Composer refresh',
    description: 'Try the refreshed composer controls and session status.',
  },
  desktopRail: {
    label: 'Desktop rail',
    description: 'Try compact navigation alongside the session list.',
  },
  settingsNavigation: {
    label: 'Settings navigation',
    description: 'Browse app settings by category.',
  },
  notificationPanel: {
    label: 'Notification panel',
    description: 'Browse and manage notifications from this hub.',
    requires: 'notificationCenter',
  },
  hostMonitorView: {
    label: 'Host monitor',
    description: 'View live resource usage for your computers.',
    requires: 'hostMonitor',
  },
  schedulerView: {
    label: 'Scheduler',
    description: 'Create schedules and review their session runs.',
    requires: 'scheduler',
  },
} as const satisfies Record<string, {
  label: string
  description: string
  requires?: HubFeatureFlag
}>

export type PreviewFeature = keyof typeof previewFeatureCatalogue
export type PreviewFeatures = Partial<Record<PreviewFeature, boolean>>

export const previewFeatureNames = Object.keys(previewFeatureCatalogue) as PreviewFeature[]

/** Unset means default; an explicitly empty or unrecognized value is a startup error. */
export function parseFeatureFlag(
  variable: string,
  value: string | undefined,
  defaultValue = false,
): boolean {
  if (value === undefined) return defaultValue
  switch (value.trim().toLowerCase()) {
    case 'on':
      return true
    case 'off':
      return false
    default:
      throw new Error(`Invalid ${variable}: expected on|off`)
  }
}

export function readHubFeatureFlags(
  env: Readonly<Record<string, string | undefined>>,
): HubFeatureFlags {
  return Object.freeze(Object.fromEntries(
    Object.entries(hubFlagCatalogue).map(([name, flag]) => [
      name, parseFeatureFlag(flag.env, env[flag.env], flag.default),
    ]),
  )) as HubFeatureFlags
}

export function isPreviewAvailable(
  preview: PreviewFeature,
  hubFlags: HubFeatureFlags,
): boolean {
  const feature = previewFeatureCatalogue[preview]
  return !('requires' in feature) || hubFlags[feature.requires] === true
}

/** A stored preference never overrides the hub's authority. */
export function effectivePreviewFeatures(
  preferences: PreviewFeatures | undefined,
  hubFlags: HubFeatureFlags,
): Record<PreviewFeature, boolean> {
  return Object.fromEntries(previewFeatureNames.map((name) => [
    name, preferences?.[name] === true && isPreviewAvailable(name, hubFlags),
  ])) as Record<PreviewFeature, boolean>
}
