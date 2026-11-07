import { useId, useState } from 'react'
import type { RuntimeModelOption, RuntimeReasoningEffort } from '../shared/contracts'
import type {
  ManagerCheckCadenceMinutes,
  ManagerProactiveSnapshot,
  ManagerProactiveSettings,
} from '../shared/manager'
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
 * Oracle's model and effort in Oracle's App settings group. `models` is the
 * hub's own Copilot catalog, which App settings already loads; it is
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
  const closePolicyHint = useId()
  const chosen = settings?.model ?? ''
  const choices = models ?? []
  const selectedModel = choices.find((model) => model.id === chosen)
  const defaultLabel = settings?.defaultModel
    ? `Hub default (${settings.defaultModel})`
    : 'Copilot default'

  return (
    <section aria-label="Oracle settings" className="app-settings-section" id="settings-oracle-model">
      <h4 tabIndex={-1}>Model</h4>
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
      {!loading && !unavailable && settings?.sessionClosePolicy ? (
        <>
          <label className="field">
            <span>Closing Oracle&apos;s sessions</span>
            <select
              aria-describedby={closePolicyHint}
              aria-label="Closing Oracle's sessions"
              className="dialog-select"
              disabled={saving}
              onChange={(event) => void oracle.saveClosePolicy(event.target.value === 'oracle-started' ? 'oracle-started' : 'ask')}
              value={settings.sessionClosePolicy}
            >
              <option value="ask">Ask me every time (default)</option>
              <option value="oracle-started">Close idle ones without asking</option>
            </select>
          </label>
          <p className="dialog-message" id={closePolicyHint}>
            Only for a message you type. Oracle still asks for any other session, and for one that is busy, waiting, pinned, or used by an unfinished task.
          </p>
        </>
      ) : null}
      <OracleSettingsStatus oracle={oracle} part="close" />
    </section>
  )
}

const checkCadences: Array<{ value: ManagerCheckCadenceMinutes; label: string }> = [
  { value: 60, label: 'Every hour' },
  { value: 120, label: 'Every 2 hours' },
  { value: 240, label: 'Every 4 hours' },
  { value: 480, label: 'Every 8 hours' },
]

const hourOptions = Array.from({ length: 24 }, (_, hour) => hour)

function editableProactive(proactive: ManagerProactiveSnapshot): ManagerProactiveSettings {
  return {
    enabled: proactive.enabled,
    cadenceMinutes: proactive.cadenceMinutes,
    timeZone: proactive.timeZone,
    quietStartHour: proactive.quietStartHour,
    quietEndHour: proactive.quietEndHour,
  }
}

export function OracleProactiveSettings({ oracle }: { oracle: OracleSettingsState }) {
  const proactive = oracle.settings?.proactive
  if (!proactive) return null
  const formKey = [
    proactive.enabled,
    proactive.cadenceMinutes,
    proactive.timeZone,
    proactive.quietStartHour,
    proactive.quietEndHour,
  ].join(':')
  return <OracleProactiveSettingsForm key={formKey} oracle={oracle} proactive={proactive} />
}

function OracleProactiveSettingsForm({
  oracle,
  proactive,
}: {
  oracle: OracleSettingsState
  proactive: ManagerProactiveSnapshot
}) {
  const [draft, setDraft] = useState<ManagerProactiveSettings>(() => editableProactive(proactive))
  return (
    <section aria-label="Oracle periodic checks" className="app-settings-section" id="settings-oracle-periodic">
      <h4>Periodic checks</h4>
      <p className="dialog-message">
        Oracle can wake on this hub to review current work and status. Scheduled
        checks are read-only and use Oracle notification settings.
      </p>
      <form onSubmit={(event) => {
        event.preventDefault()
        void oracle.saveProactive(draft)
      }}>
        <label className="dreamer-toggle">
          <input
            checked={draft.enabled}
            disabled={oracle.saving}
            onChange={(event) => setDraft((current) => current && ({
              ...current,
              enabled: event.target.checked,
            }))}
            type="checkbox"
          />
          Enable periodic checks
        </label>
        <label className="field">
          <span>Cadence</span>
          <select
            aria-label="Periodic check cadence"
            className="dialog-select"
            disabled={oracle.saving}
            onChange={(event) => setDraft((current) => current && ({
              ...current,
              cadenceMinutes: Number(event.target.value) as ManagerCheckCadenceMinutes,
            }))}
            value={draft.cadenceMinutes}
          >
            {checkCadences.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Timezone</span>
          <input
            aria-label="Periodic check timezone"
            autoCapitalize="none"
            autoComplete="off"
            className="dialog-input"
            disabled={oracle.saving}
            maxLength={100}
            onChange={(event) => setDraft((current) => current && ({
              ...current,
              timeZone: event.target.value,
            }))}
            spellCheck={false}
            value={draft.timeZone}
          />
        </label>
        <div className="runtime-grid">
          <label className="field">
            <span>Quiet hours start</span>
            <select
              aria-label="Quiet hours start"
              className="dialog-select"
              disabled={oracle.saving}
              onChange={(event) => setDraft((current) => current && ({
                ...current,
                quietStartHour: Number(event.target.value),
              }))}
              value={draft.quietStartHour}
            >
              {hourOptions.map((hour) => (
                <option key={hour} value={hour}>{String(hour).padStart(2, '0')}:00</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Quiet hours end</span>
            <select
              aria-label="Quiet hours end"
              className="dialog-select"
              disabled={oracle.saving}
              onChange={(event) => setDraft((current) => current && ({
                ...current,
                quietEndHour: Number(event.target.value),
              }))}
              value={draft.quietEndHour}
            >
              {hourOptions.map((hour) => (
                <option key={hour} value={hour}>{String(hour).padStart(2, '0')}:00</option>
              ))}
            </select>
          </label>
        </div>
        <p className="dialog-message">
          Equal start and end disables quiet hours. Missed intervals coalesce to
          one catch-up check after restart.
        </p>
        {proactive?.nextCheckAt ? (
          <p className="dialog-message">Next check: {proactive.nextCheckAt}</p>
        ) : null}
        {proactive?.latestCheckAt ? (
          <p className="dialog-message">
            Latest check: {proactive.latestCheckAt}
            {proactive.latestCheckState ? ` · ${proactive.latestCheckState}` : ''}
          </p>
        ) : null}
        <button className="primary-button" disabled={oracle.saving} type="submit">
          {oracle.saving ? 'Saving...' : 'Save periodic checks'}
        </button>
      </form>
      <OracleSettingsStatus oracle={oracle} part="proactive" />
    </section>
  )
}
