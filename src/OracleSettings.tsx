import type { RuntimeModelOption, RuntimeReasoningEffort } from '../shared/contracts'
import type { OracleSettingsPart, OracleSettingsState } from './use-oracle-settings'

const efforts: RuntimeReasoningEffort[] = ['low', 'medium', 'high', 'xhigh', 'max']

function effortFrom(value: string): RuntimeReasoningEffort | undefined {
  return efforts.find((effort) => effort === value)
}

/** The result of the last change made in one part of Oracle's settings. */
export function OracleSettingsStatus({ oracle, part }: { oracle: OracleSettingsState; part: OracleSettingsPart }) {
  return (
    <>
      {oracle.saved?.part === part && !oracle.saving ? (
        <p className="dialog-message" role="status">{oracle.saved.message}</p>
      ) : null}
      {oracle.error?.part === part ? <p className="form-error" role="alert">{oracle.error.message}</p> : null}
    </>
  )
}

/**
 * Oracle's model and effort, beside the models new sessions use. `models` is
 * the hub's own Copilot catalog, which App settings already loads; it is
 * undefined while that catalog is still loading.
 */
export function OracleModelSettings({
  oracle,
  models,
  modelsError,
  onRetryModels,
}: {
  oracle: OracleSettingsState
  models?: RuntimeModelOption[]
  /** Why the hub's catalog could not be read; Retry asks for it again. */
  modelsError?: string
  onRetryModels?: () => void
}) {
  const { settings, unavailable, loading, saving } = oracle
  const chosen = settings?.model ?? ''
  const choices = models ?? []
  const selectedModel = choices.find((model) => model.id === chosen)
  const defaultLabel = settings?.defaultModel
    ? `Hub default (${settings.defaultModel})`
    : 'Copilot default'

  return (
    <section aria-label="Oracle settings" className="app-settings-section" id="settings-oracle">
      <h4 tabIndex={-1}>Oracle</h4>
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
                void oracle.saveModel(event.target.value)
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
                onChange={(event) => void oracle.saveModel(chosen, effortFrom(event.target.value))}
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
        </>
      ) : null}
      <OracleSettingsStatus oracle={oracle} part="model" />
      {!loading && !unavailable && settings && !settings.sessionBackend ? (
        <p className="dialog-message">
          This hub opens Oracle&apos;s sessions in a terminal. Update it to choose the Copilot SDK.
        </p>
      ) : null}
      {!loading && !unavailable && settings?.sessionBackend ? (
        <label className="field">
          <span>Opens new sessions with</span>
          <select
            aria-label="How Oracle opens sessions"
            className="dialog-select"
            disabled={saving}
            onChange={(event) => void oracle.saveBackend(event.target.value === 'terminal' ? 'terminal' : 'sdk')}
            value={settings.sessionBackend}
          >
            <option value="sdk">Copilot SDK (default)</option>
            <option value="terminal">Terminal (tmux)</option>
          </select>
        </label>
      ) : null}
      <OracleSettingsStatus oracle={oracle} part="backend" />
    </section>
  )
}
