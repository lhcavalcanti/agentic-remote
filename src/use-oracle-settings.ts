import { useCallback, useEffect, useState } from 'react'
import type { RuntimeReasoningEffort } from '../shared/contracts'
import type {
  ManagerProactiveSettings,
  ManagerSessionBackend,
  ManagerSettingsSnapshot,
} from '../shared/manager'
import { getManager, updateManagerSettings } from './api'

/** Which part of App settings a change came from, so its result shows there. */
export type OracleSettingsPart = 'model' | 'folders' | 'backend' | 'proactive'

export interface OracleSettingsState {
  settings?: ManagerSettingsSnapshot
  /** Why Oracle cannot be configured on this hub, if it cannot. */
  unavailable?: string
  loading: boolean
  saving: boolean
  saved?: { part: OracleSettingsPart; message: string }
  error?: { part: OracleSettingsPart; message: string }
  saveModel(model: string, reasoningEffort?: RuntimeReasoningEffort): Promise<void>
  saveFolder(computerId: string, path?: string): Promise<void>
  saveBackend(backend: ManagerSessionBackend): Promise<void>
  saveProactive(settings: ManagerProactiveSettings): Promise<void>
}

/**
 * Oracle's settings, kept on the hub since Oracle runs there, so every
 * browser sees the same choices. App settings shows its model with the other
 * models and its folders with the other folders; this is the one copy both
 * read and change.
 */
export function useOracleSettings(active = true): OracleSettingsState {
  const [settings, setSettings] = useState<ManagerSettingsSnapshot>()
  const [unavailable, setUnavailable] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<OracleSettingsState['saved']>()
  const [error, setError] = useState<OracleSettingsState['error']>()

  // Read afresh each time App settings opens, as the settings may have
  // changed elsewhere, including by Oracle when you asked it to.
  useEffect(() => {
    if (!active) return
    let current = true
    void Promise.resolve()
      .then(() => {
        if (!current) return undefined
        setLoading(true)
        setSaved(undefined)
        setError(undefined)
        return getManager()
      })
      .then((snapshot) => {
        if (!current) return
        if (!snapshot?.available) {
          setUnavailable(snapshot?.unavailableReason || 'Oracle is not available on this hub.')
        } else {
          setUnavailable(undefined)
          setSettings(snapshot.settings ?? {})
        }
      })
      .catch((caught: unknown) => {
        if (current) setError({ part: 'model', message: caught instanceof Error ? caught.message : String(caught) })
      })
      .finally(() => {
        if (current) setLoading(false)
      })
    return () => {
      current = false
    }
  }, [active])

  const update = useCallback(async (
    input: Parameters<typeof updateManagerSettings>[0],
    part: OracleSettingsPart,
    confirmation: string,
    /** Why the hub's answer shows the change did not take, if it does. */
    refused?: (next: ManagerSettingsSnapshot) => string | undefined,
  ) => {
    setSaving(true)
    setSaved(undefined)
    setError(undefined)
    try {
      const next = await updateManagerSettings(input)
      setSettings(next)
      const reason = refused?.(next)
      if (reason) setError({ part, message: reason })
      else setSaved({ part, message: confirmation })
    } catch (caught) {
      setError({ part, message: caught instanceof Error ? caught.message : String(caught) })
    } finally {
      setSaving(false)
    }
  }, [])

  const saveModel = useCallback((model: string, reasoningEffort?: RuntimeReasoningEffort) => update({
    model: model || null,
    reasoningEffort: model && reasoningEffort ? reasoningEffort : null,
  }, 'model', 'Saved. Oracle uses it from its next answer.'), [update])

  const saveFolder = useCallback((computerId: string, path?: string) => update(
    { sessionFolders: { [computerId]: path ?? null } },
    'folders',
    path ? 'Saved. Oracle starts new sessions there.' : 'Saved. Oracle uses your folder for new sessions there.',
  ), [update])

  const saveBackend = useCallback((backend: ManagerSessionBackend) => update(
    { sessionBackend: backend },
    'backend',
    backend === 'terminal'
      ? 'Saved. Oracle opens its next sessions in a terminal.'
      : 'Saved. Oracle opens its next sessions with the Copilot SDK.',
    // A hub from before this setting ignores it and keeps opening terminals.
    (next) => next.sessionBackend === backend ? undefined : 'This hub did not keep that choice; update it to choose how Oracle opens sessions.',
  ), [update])

  const saveProactive = useCallback((settings: ManagerProactiveSettings) => update(
    { proactive: settings },
    'proactive',
    settings.enabled ? 'Periodic checks saved.' : 'Periodic checks paused.',
  ), [update])

  return {
    settings,
    unavailable,
    loading,
    saving,
    saved,
    error,
    saveModel,
    saveFolder,
    saveBackend,
    saveProactive,
  }
}
