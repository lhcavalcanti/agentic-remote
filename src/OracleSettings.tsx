import { useEffect, useState } from 'react'
import type { RuntimeModelOption, RuntimeReasoningEffort } from '../shared/contracts'
import type { ManagerSettingsSnapshot } from '../shared/manager'
import { getManager, getProviderRuntimeOptions, updateManagerSettings } from './api'

const efforts: RuntimeReasoningEffort[] = ['low', 'medium', 'high', 'xhigh', 'max']

function effortFrom(value: string): RuntimeReasoningEffort | undefined {
  return efforts.find((effort) => effort === value)
}

/**
 * Oracle's model and effort, in App settings. Kept on the hub, since Oracle
 * runs there, so every browser sees the same choice; it applies from Oracle's
 * next answer.
 */
export function OracleSettings({ computerId }: { computerId?: string }) {
  const [settings, setSettings] = useState<ManagerSettingsSnapshot>()
  const [unavailable, setUnavailable] = useState<string>()
  const [models, setModels] = useState<RuntimeModelOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    void Promise.all([
      Promise.resolve().then(() => getManager()),
      computerId
        ? Promise.resolve().then(() => getProviderRuntimeOptions(computerId, 'copilot')).catch(() => undefined)
        : Promise.resolve(undefined),
    ])
      .then(([snapshot, options]) => {
        if (!active) return
        if (!snapshot?.available) {
          setUnavailable(snapshot?.unavailableReason || 'Oracle is not available on this hub.')
        } else {
          setUnavailable(undefined)
          setSettings(snapshot.settings ?? {})
        }
        setModels(options?.models ?? [])
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : String(caught))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [computerId])

  async function save(model: string, reasoningEffort?: RuntimeReasoningEffort) {
    setSaving(true)
    setSaved(false)
    setError(undefined)
    try {
      setSettings(await updateManagerSettings({
        model: model || null,
        reasoningEffort: model && reasoningEffort ? reasoningEffort : null,
      }))
      setSaved(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSaving(false)
    }
  }

  const chosen = settings?.model ?? ''
  const selectedModel = models.find((model) => model.id === chosen)
  const defaultLabel = settings?.defaultModel
    ? `Hub default (${settings.defaultModel})`
    : 'Copilot default'

  return (
    <section aria-label="Oracle settings" className="app-settings-section">
      <h3>Oracle</h3>
      <p className="dialog-message">
        The model Oracle answers with. It is kept on this hub for every browser and
        applies from Oracle&apos;s next answer.
      </p>
      {loading ? <p className="dialog-message">Loading…</p> : null}
      {unavailable ? <p className="dialog-message">{unavailable}</p> : null}
      {!loading && !unavailable && settings ? (
        <>
          <label className="field">
            <span>Model</span>
            <select
              aria-label="Oracle model"
              className="dialog-select"
              disabled={saving}
              onChange={(event) => {
                void save(event.target.value)
              }}
              value={chosen}
            >
              <option value="">{defaultLabel}</option>
              {chosen && !selectedModel ? <option value={chosen}>{chosen}</option> : null}
              {models.map((model) => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
          </label>
          {selectedModel && selectedModel.reasoningEfforts.length > 0 ? (
            <label className="field">
              <span>Reasoning effort</span>
              <select
                aria-label="Oracle reasoning effort"
                className="dialog-select"
                disabled={saving}
                onChange={(event) => void save(chosen, effortFrom(event.target.value))}
                value={settings.reasoningEffort ?? ''}
              >
                <option value="">Model default</option>
                {selectedModel.reasoningEfforts.map((effort) => (
                  <option key={effort} value={effort}>{effort}</option>
                ))}
              </select>
            </label>
          ) : null}
          {settings.modelUnavailable ? (
            <p className="form-error" role="status">
              {settings.model} could not start, so Copilot&apos;s default model is answering.
            </p>
          ) : null}
          {saved && !saving ? (
            <p className="dialog-message" role="status">Saved. Oracle uses it from its next answer.</p>
          ) : null}
        </>
      ) : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </section>
  )
}
