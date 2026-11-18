import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type {
  ConfigureRuntimeInput,
  ManagedSession,
  RuntimeOptions,
} from '../../shared/contracts'
import { configureRuntime, getRuntimeOptions } from '../api'
import { DialogFrame } from '../components/DialogFrame'
import { providerName } from '../session-presentation'
import {
  contextSizeLabel,
  isRuntimeReasoningEffort,
} from './runtime-presentation'

export function RuntimeDialog({
  open,
  session,
  onClose,
  onConfigured,
}: {
  open: boolean
  session?: ManagedSession
  onClose: () => void
  onConfigured: (session: ManagedSession) => void
}) {
  const [options, setOptions] = useState<RuntimeOptions>()
  const [configuration, setConfiguration] = useState<ConfigureRuntimeInput>()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()
  const [runtimeStatus, setRuntimeStatus] =
    useState<ManagedSession['status']>()
  const computerId = session?.computerId
  const sessionId = session?.id
  const sessionStatus = session?.status

  useEffect(() => {
    if (!open || !computerId || !sessionId) {
      return
    }
    let active = true
    setLoading(true)
    setOptions(undefined)
    setConfiguration(undefined)
    setRuntimeStatus(sessionStatus)
    setError(undefined)
    void getRuntimeOptions(computerId, sessionId)
      .then((loaded) => {
        if (!active) {
          return
        }
        const model =
          loaded.models.find((entry) => entry.id === loaded.current.model) ||
          loaded.models[0]
        setOptions(loaded)
        setRuntimeStatus(loaded.status || sessionStatus)
        if (model) {
          setConfiguration({
            model: model.id,
            reasoningEffort:
              isRuntimeReasoningEffort(loaded.current.reasoningEffort) &&
              model.reasoningEfforts.includes(
                loaded.current.reasoningEffort,
              )
                ? loaded.current.reasoningEffort
                : model.reasoningEfforts[0],
            contextTier:
              loaded.current.contextTier === 'long_context' &&
              model.contextTiers.includes('long_context')
                ? 'long_context'
                : 'default',
            mode:
              loaded.current.mode === 'plan' ||
              loaded.current.mode === 'autopilot'
                ? loaded.current.mode
                : 'interactive',
          })
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : String(caught))
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
  }, [computerId, open, sessionId, sessionStatus])

  if (!open || !session) {
    return null
  }
  const targetSession = session

  const selectedModel = options?.models.find(
    (model) => model.id === configuration?.model,
  )

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!configuration) {
      return
    }
    if (runtimeStatus !== 'idle') {
      setError('Runtime settings can only change while the session is idle')
      return
    }
    setSubmitting(true)
    setError(undefined)
    try {
      onConfigured(
        await configureRuntime(
          targetSession.computerId,
          targetSession.id,
          configuration,
        ),
      )
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DialogFrame
      eyebrow={`${providerName(session.provider)} runtime`}
      onClose={onClose}
      title="Model and context"
    >
      {loading ? <p className="dialog-message">Loading runtime options…</p> : null}
      {!loading && options?.models.length === 0 ? (
        <p className="form-error">No runtime models are available.</p>
      ) : null}
      {configuration && selectedModel ? (
        <form onSubmit={submit}>
          <label className="field">
            <span>Model</span>
            <select
              className="dialog-select"
              onChange={(event) => {
                const model = options?.models.find(
                  (entry) => entry.id === event.target.value,
                )
                if (!model) {
                  return
                }
                setConfiguration({
                  model: model.id,
                  reasoningEffort: model.reasoningEfforts[0],
                  contextTier: model.contextTiers.includes('long_context')
                    ? configuration.contextTier
                    : 'default',
                  mode: configuration.mode,
                })
              }}
              value={configuration.model}
            >
              {options?.models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </label>
          {selectedModel.reasoningEfforts.length > 0 ? (
            <label className="field">
              <span>Reasoning effort</span>
              <select
                className="dialog-select"
                onChange={(event) => {
                  if (isRuntimeReasoningEffort(event.target.value)) {
                    setConfiguration({
                      ...configuration,
                      reasoningEffort: event.target.value,
                    })
                  }
                }}
                value={configuration.reasoningEffort}
              >
                {selectedModel.reasoningEfforts.map((effort) => (
                  <option key={effort} value={effort}>
                    {effort}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="field">
            <span>Context size</span>
            <select
              className="dialog-select"
              onChange={(event) =>
                setConfiguration({
                  ...configuration,
                  contextTier: event.target.value as
                    | 'default'
                    | 'long_context',
                })
              }
              value={configuration.contextTier}
            >
              {selectedModel.contextTiers.map((tier) => (
                <option key={tier} value={tier}>
                  {contextSizeLabel(selectedModel, tier)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Agent mode</span>
            <select
              className="dialog-select"
              onChange={(event) =>
                setConfiguration({
                  ...configuration,
                  mode: event.target.value as
                    | 'interactive'
                    | 'plan'
                    | 'autopilot',
                })
              }
              value={configuration.mode || 'interactive'}
            >
              <option value="interactive">Interactive</option>
              <option value="plan">Plan</option>
              <option value="autopilot">
                {session.provider === 'claude' ? 'Auto' : 'Autopilot'}
              </option>
            </select>
          </label>
          <p className="runtime-dialog__hint">
            {session.provider === 'claude'
              ? 'Claude settings apply to the next turn. Change settings only while the agent is idle.'
              : 'Tmux sessions restart their Copilot pane with the same session ID. Change settings only while the agent is idle.'}
          </p>
          {runtimeStatus !== 'idle' ? (
            <p className="form-error" role="status">
              Finish or stop the current response before changing runtime
              settings.
            </p>
          ) : null}
          {error ? <p className="form-error">{error}</p> : null}
          <button
            className="primary-button dialog__submit"
            disabled={submitting || runtimeStatus !== 'idle'}
            type="submit"
          >
            {submitting ? 'Applying…' : 'Apply runtime settings'}
          </button>
        </form>
      ) : null}
      {!loading && error && !configuration ? (
        <p className="form-error">{error}</p>
      ) : null}
    </DialogFrame>
  )
}
