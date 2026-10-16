import { Fragment, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { ComputerSummary, RuntimeModelOption, RuntimeReasoningEffort } from '../shared/contracts'
import type { ManagerSettingsSnapshot } from '../shared/manager'
import { getManager, updateManagerSettings } from './api'

const efforts: RuntimeReasoningEffort[] = ['low', 'medium', 'high', 'xhigh', 'max']

function effortFrom(value: string): RuntimeReasoningEffort | undefined {
  return efforts.find((effort) => effort === value)
}

/**
 * Oracle's model and effort, in App settings. Kept on the hub, since Oracle
 * runs there, so every browser sees the same choice; it applies from Oracle's
 * next answer. `models` is the hub's own Copilot catalog, which App settings
 * already loads; it is undefined while that catalog is still loading.
 */
export function OracleSettings({
  models,
  modelsError,
  onRetryModels,
  computers = [],
  renderFolderControl,
}: {
  models?: RuntimeModelOption[]
  /** Why the hub's catalog could not be read; Retry asks for it again. */
  modelsError?: string
  onRetryModels?: () => void
  computers?: Pick<ComputerSummary, 'id' | 'name' | 'isLocal' | 'online'>[]
  /** The app's folder picker; it hands back a folder already checked on that computer. */
  renderFolderControl?: (
    computer: Pick<ComputerSummary, 'id' | 'name' | 'isLocal' | 'online'>,
    value: string | undefined,
    onChange: (path?: string) => void,
  ) => ReactNode
}) {
  const [settings, setSettings] = useState<ManagerSettingsSnapshot>()
  const [unavailable, setUnavailable] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<string>()

  useEffect(() => {
    let active = true
    void Promise.resolve()
      .then(() => getManager())
      .then((snapshot) => {
        if (!active) return
        if (!snapshot?.available) {
          setUnavailable(snapshot?.unavailableReason || 'Oracle is not available on this hub.')
        } else {
          setUnavailable(undefined)
          setSettings(snapshot.settings ?? {})
        }
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
  }, [])

  async function update(
    input: Parameters<typeof updateManagerSettings>[0],
    confirmation: string,
  ) {
    setSaving(true)
    setSaved(undefined)
    setError(undefined)
    try {
      setSettings(await updateManagerSettings(input))
      setSaved(confirmation)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSaving(false)
    }
  }

  function save(model: string, reasoningEffort?: RuntimeReasoningEffort) {
    return update({
      model: model || null,
      reasoningEffort: model && reasoningEffort ? reasoningEffort : null,
    }, 'Saved. Oracle uses it from its next answer.')
  }

  function saveFolder(computerId: string, path?: string) {
    return update(
      { sessionFolders: { [computerId]: path ?? null } },
      path ? 'Saved. Oracle starts new sessions there.' : 'Saved. Oracle uses your default folder there.',
    )
  }

  const chosen = settings?.model ?? ''
  const choices = models ?? []
  const selectedModel = choices.find((model) => model.id === chosen)
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
              {choices.map((model) => (
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
          {models === undefined && !modelsError ? (
            <p className="dialog-message">Loading the hub&apos;s models…</p>
          ) : null}
          {modelsError ? (
            <div className="form-error oracle-settings__catalog-error" role="alert">
              <span>Could not load the hub&apos;s models: {modelsError}</span>
              {onRetryModels ? (
                <button className="secondary-button" onClick={onRetryModels} type="button">
                  Retry
                </button>
              ) : null}
            </div>
          ) : null}
          {settings.modelUnavailable ? (
            <p className="form-error" role="status">
              {settings.model ?? settings.defaultModel ?? 'The chosen model'} could not start, so Copilot&apos;s default model is answering.
            </p>
          ) : null}
          {renderFolderControl && computers.length ? (
            <div className="oracle-settings__folders">
              <h4>Session folders</h4>
              <p className="dialog-message">
                Where Oracle starts new sessions on each computer. Oracle can change
                these when you ask; a computer left blank uses your default session
                folder.
              </p>
              <div className="default-session-folder-list">
                {computers.map((computer) => (
                  <Fragment key={computer.id}>
                    {renderFolderControl(
                      computer,
                      settings.sessionFolders?.[computer.id],
                      (path) => void saveFolder(computer.id, path),
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          ) : null}
          {saved && !saving ? (
            <p className="dialog-message" role="status">{saved}</p>
          ) : null}
        </>
      ) : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </section>
  )
}
