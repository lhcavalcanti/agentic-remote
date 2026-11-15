import { useEffect, useState } from 'react'
import type { AgentProvider, RuntimeModelOption } from '../../shared/contracts'
import { getProviderRuntimeOptions, sendTestPushNotification } from '../api'
import { DialogFrame } from '../components/DialogFrame'
import {
  activePushSubscription,
  checkForPwaUpdate,
  disablePushNotifications,
  enablePushNotifications,
  installedAsApp,
  pushNotificationsSupported,
} from '../pwa'
import { providerName } from '../session-presentation'
import { computerProviders, normalizedRuntimeSelection } from '../session-setup/runtime-presentation'
import { useOracleSettings } from '../use-oracle-settings'
import {
  mergeRuntimeModelOptions,
  sameRuntimeSelection,
} from './runtime-defaults'
import { navigableSettingsSections, schedulerSettingsSection, settingsSections } from './sections'
import { SettingsNavigation } from './SettingsNavigation'
import { usePreviewFeature } from '../preview-features'
import type { SettingsSectionProps } from './sections'
import type { AppSettingsDialogProps } from './types'

/**
 * Scrolls App settings, and only App settings, so the element sits just
 * below the jump bar. `scrollIntoView` also scrolls whatever holds the
 * dialog when the element cannot reach the top, such as the last group,
 * which moved the dialog off screen and left the app scrolled behind it.
 */
function scrollSettingsTo(id: string, { focus = false } = {}) {
  const target = document.getElementById(id)
  const container = target?.closest<HTMLElement>('.app-settings-dialog')
  if (!target || !container) return
  const nav = container.querySelector<HTMLElement>('.app-settings-nav')
  const top = Math.max(0, Math.round(
    container.scrollTop
      + target.getBoundingClientRect().top
      - container.getBoundingClientRect().top
      - (nav?.offsetHeight ?? 0)
      - 8,
  ))
  if (typeof container.scrollTo === 'function') container.scrollTo({ top })
  else container.scrollTop = top
  // Moving the focus too takes keyboard and screen reader users there, not
  // just the eye; Tab carries on from the heading into that part.
  if (focus) {
    target.querySelector<HTMLElement>(':scope > h3, :scope > h4')?.focus({ preventScroll: true })
  }
}

/** Anything that shows you have taken over scrolling App settings yourself. */
const settingsTakeoverEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const

export function AppSettingsDialog(props: AppSettingsDialogProps) {
  const navigation = usePreviewFeature('settingsNavigation')
  const scheduler = usePreviewFeature('schedulerView')
  const healthCardEnabled = usePreviewFeature('healthCard')
  const navigationSections = scheduler
    ? [...navigableSettingsSections.slice(0, 5), schedulerSettingsSection, ...navigableSettingsSections.slice(5)]
    : navigableSettingsSections
  const {
    open,
    computers,
    onClose,
    onUpdateReady,
    defaultRuntimes,
    onDefaultRuntimesChange,
    initialSection,
  } = props
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<string>()
  const [testingNotification, setTestingNotification] = useState(false)
  const [testMessage, setTestMessage] = useState<string>()
  const [runtimeModels, setRuntimeModels] = useState<
    Partial<Record<AgentProvider, RuntimeModelOption[]>>
  >({})
  const [runtimeCatalogsComplete, setRuntimeCatalogsComplete] = useState<
    Partial<Record<AgentProvider, boolean>>
  >({})
  const [runtimeLoading, setRuntimeLoading] = useState(false)
  const oracle = useOracleSettings(open)
  const [hubCopilotModels, setHubCopilotModels] = useState<RuntimeModelOption[]>()
  const [hubCopilotError, setHubCopilotError] = useState<string>()
  const [runtimeErrors, setRuntimeErrors] = useState<
    Partial<Record<AgentProvider, string>>
  >({})
  const supported = pushNotificationsSupported()
  const ios =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent)
  const requiresInstall = ios && !installedAsApp()
  const permissionBlocked =
    supported &&
    typeof Notification !== 'undefined' &&
    Notification.permission === 'denied'

  useEffect(() => {
    if (!open || !supported || requiresInstall) {
      return
    }
    let active = true
    setLoading(true)
    setError(undefined)
    void activePushSubscription()
      .then((subscription) => {
        if (active) {
          setEnabled(Boolean(subscription))
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          console.warn('Unable to load notification mute settings:', caught)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [open, requiresInstall, supported])

  useEffect(() => {
    if (!open) {
      return
    }
    let active = true
    const providers: AgentProvider[] = ['copilot', 'claude']
    const sources = providers.flatMap((provider) => {
      const providerComputers = computers.filter(
        (candidate) =>
          candidate.online &&
          computerProviders(candidate).some(
            (capability) =>
              capability.id === provider && capability.available,
          ),
      )
      return providerComputers.map((computer) => ({ provider, computer }))
    })
    setRuntimeLoading(true)
    setRuntimeModels({})
    setHubCopilotModels(undefined)
    setHubCopilotError(undefined)
    setRuntimeCatalogsComplete({})
    setRuntimeErrors(
      Object.fromEntries(
        providers
          .filter(
            (provider) =>
              !sources.some((source) => source.provider === provider),
          )
          .map((provider) => [
            provider,
            `${providerName(provider)} is not available on an online computer.`,
          ]),
      ),
    )
    void Promise.allSettled(
      sources.map(async ({ provider, computer }) => ({
        provider,
        options: await getProviderRuntimeOptions(computer.id, provider),
      })),
    ).then((results) => {
      if (!active) {
        return
      }
      const models: Partial<Record<AgentProvider, RuntimeModelOption[]>> = {}
      const complete: Partial<Record<AgentProvider, boolean>> = {}
      const errors: Partial<Record<AgentProvider, string>> = {}
      for (const provider of providers) {
        const hasOfflineProviderComputer = computers.some(
          (computer) => !computer.isLocal && !computer.online,
        )
        // Discovery only asks computers that advertise the provider, and a
        // node can synthesize Copilot-only metadata it never confirmed. Any
        // online computer left unasked is therefore an unknown rather than a
        // no, and a saved model must not be retired on an unknown.
        const queried = new Set(
          sources
            .filter((source) => source.provider === provider)
            .map((source) => source.computer.id),
        )
        const hasUnqueriedProviderComputer = computers.some(
          (computer) => computer.online && !queried.has(computer.id),
        )
        const providerResults = results.filter(
          (_result, index) => sources[index].provider === provider,
        )
        const catalogs = providerResults.flatMap((result) =>
          result.status === 'fulfilled'
            ? [result.value.options.models]
            : [],
        )
        if (catalogs.length > 0) {
          models[provider] = mergeRuntimeModelOptions(catalogs)
          complete[provider] =
            !hasOfflineProviderComputer &&
            !hasUnqueriedProviderComputer &&
            providerResults.every((result) => result.status === 'fulfilled')
        } else if (providerResults.length === 0) {
          errors[provider] =
            `${providerName(provider)} is not available on an online computer.`
        } else {
          const failure = providerResults.find(
            (result) => result.status === 'rejected',
          )
          errors[provider] =
            failure?.status === 'rejected'
              ? failure.reason instanceof Error
                ? failure.reason.message
                : String(failure.reason)
              : `Unable to load ${providerName(provider)} models.`
        }
      }
      // Oracle runs on the hub, so its choices come from the hub's own catalog.
      const hubCatalog = results.find(
        (_result, index) =>
          sources[index].provider === 'copilot' && sources[index].computer.isLocal,
      )
      setHubCopilotModels(
        hubCatalog?.status === 'fulfilled' ? hubCatalog.value.options.models : [],
      )
      setHubCopilotError(
        hubCatalog?.status === 'rejected'
          ? hubCatalog.reason instanceof Error
            ? hubCatalog.reason.message
            : String(hubCatalog.reason)
          : undefined,
      )
      setRuntimeModels(models)
      setRuntimeCatalogsComplete(complete)
      setRuntimeErrors(errors)
      setRuntimeLoading(false)
    })
    return () => {
      active = false
    }
  }, [computers, open])

  useEffect(() => {
    let changed = false
    const next = { ...defaultRuntimes }
    for (const provider of ['copilot', 'claude'] as const) {
      const models = runtimeModels[provider]
      if (!models || !runtimeCatalogsComplete[provider]) {
        continue
      }
      const normalized = normalizedRuntimeSelection(
        defaultRuntimes[provider],
        models,
      )
      if (
        normalized &&
        !sameRuntimeSelection(normalized, defaultRuntimes[provider])
      ) {
        next[provider] = normalized
        changed = true
      }
    }
    if (changed) {
      onDefaultRuntimesChange(next)
    }
  }, [
    defaultRuntimes,
    onDefaultRuntimesChange,
    runtimeCatalogsComplete,
    runtimeModels,
  ])

  // Opened from somewhere in particular, such as Oracle's model, it starts
  // there; otherwise at the top. The catalogs above it load afterwards and,
  // stacked on a phone, would push it away, so it stays with that part as
  // the settings grow until you scroll, tap or type yourself.
  useEffect(() => {
    if (!open || !initialSection || navigation) return
    const section = initialSection
    let observer: ResizeObserver | undefined
    let dialog: HTMLElement | null | undefined
    const stopFollowing = () => {
      observer?.disconnect()
      observer = undefined
    }
    const frame = window.requestAnimationFrame(() => {
      scrollSettingsTo(section, { focus: true })
      dialog = document.getElementById(section)?.closest<HTMLElement>('.app-settings-dialog')
      const sections = dialog?.querySelector('.app-settings-dialog__sections')
      if (!dialog || !sections || typeof ResizeObserver === 'undefined') return
      for (const type of settingsTakeoverEvents) {
        dialog.addEventListener(type, stopFollowing, { passive: true })
      }
      observer = new ResizeObserver(() => scrollSettingsTo(section))
      observer.observe(sections)
    })
    return () => {
      window.cancelAnimationFrame(frame)
      stopFollowing()
      for (const type of settingsTakeoverEvents) dialog?.removeEventListener(type, stopFollowing)
    }
  }, [initialSection, open, navigation])

  if (!open) {
    return null
  }

  async function retryHubCopilotModels() {
    const hub = computers.find((computer) => computer.isLocal)
    if (!hub) {
      return
    }
    setHubCopilotModels(undefined)
    setHubCopilotError(undefined)
    try {
      setHubCopilotModels((await getProviderRuntimeOptions(hub.id, 'copilot')).models)
    } catch (caught) {
      setHubCopilotModels([])
      setHubCopilotError(caught instanceof Error ? caught.message : String(caught))
    }
  }

  async function toggle() {
    setSubmitting(true)
    setError(undefined)
    try {
      if (enabled) {
        await disablePushNotifications()
        setEnabled(false)
      } else {
        await enablePushNotifications()
        setEnabled(true)
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSubmitting(false)
    }
  }

  async function checkForUpdate() {
    setCheckingUpdate(true)
    setUpdateMessage(undefined)
    try {
      const registration = await checkForPwaUpdate()
      if (registration) {
        onUpdateReady(registration.registration)
        setUpdateMessage('An update is ready to install.')
      } else {
        setUpdateMessage('Agentic Remote is up to date.')
      }
    } catch (caught) {
      setUpdateMessage(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setCheckingUpdate(false)
    }
  }

  async function testNotification() {
    setTestingNotification(true)
    setTestMessage(undefined)
    try {
      const result = await sendTestPushNotification()
      setTestMessage(
        result.sent > 0
          ? `Test notification sent to ${result.sent} device${
              result.sent === 1 ? '' : 's'
            }.`
          : 'No active notification subscriptions were found.',
      )
    } catch (caught) {
      setTestMessage(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setTestingNotification(false)
    }
  }

  const sectionProps: SettingsSectionProps = {
    ...props,
    categoryNavigation: navigation,
    healthCardEnabled,
    oracle,
    runtimeErrors,
    runtimeLoading,
    runtimeModels,
    hubCopilotModels,
    hubCopilotError,
    retryHubCopilotModels,
    supported,
    requiresInstall,
    permissionBlocked,
    enabled,
    loading,
    submitting,
    toggle,
    testingNotification,
    testNotification,
    testMessage,
    error,
    checkingUpdate,
    checkForUpdate,
    updateMessage,
  }

  return (
    <DialogFrame
      className={`app-settings-dialog${navigation ? ' app-settings-dialog--navigation' : ''}`}
      eyebrow="Application"
      onClose={onClose}
      title="App settings"
    >
      {navigation ? <SettingsNavigation key={initialSection ?? 'default'} initialSection={initialSection}
        sectionProps={sectionProps} sections={navigationSections} /> : <>
      <nav aria-label="Settings sections" className="app-settings-nav">
        {settingsSections.map((group) => (
          <button
            key={group.id}
            onClick={() => scrollSettingsTo(group.id, { focus: true })}
            type="button"
          >
            {group.title}
          </button>
        ))}
      </nav>
      <div className="app-settings-dialog__sections">
        {settingsSections.map((section) => (
          <section
            aria-labelledby={`${section.id}-heading`}
            className="app-settings-group"
            id={section.id}
            key={section.id}
          >
            <h3 id={`${section.id}-heading`} tabIndex={-1}>{section.title}</h3>
            {section.render(sectionProps)}
          </section>
        ))}
      </div>
      </>}
    </DialogFrame>
  )
}
