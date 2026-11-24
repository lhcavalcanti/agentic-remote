import { ListChecks, MessagesSquare, Rocket } from 'lucide-react'
import type { ManagedSession } from '../../shared/contracts'
import { modelFamily, shortModelName } from '../../shared/model-family'
import { ModelFamilyIcon } from '../ModelFamilyIcon'

export function RuntimeStatus({
  session, compactTokens, onOpen,
}: {
  session: ManagedSession
  compactTokens: (tokens: number) => string
  onOpen: () => void
}) {
  const runtime = session.runtime
  const busy = session.status === 'running' || session.status === 'waiting' ||
    Boolean(session.pendingPermission || session.pendingUserInput)
  const description = busy ? 'Session setup · applies when idle' : 'Open session setup'
  const model = runtime?.model || 'Default model'
  const shortModel = shortModelName(model)
  const effort = runtime?.reasoningEffort || 'default'
  const context = runtime?.contextTokenLimit ? compactTokens(runtime.contextTokenLimit) : 'auto'
  const mode = runtime?.mode || 'interactive'
  const ModeIcon = mode === 'autopilot' ? Rocket : mode === 'plan' ? ListChecks :
    mode === 'interactive' ? MessagesSquare : undefined
  // Each detail carries its own separator so a narrow row can drop it whole.
  return (
    <button
      aria-description={`${description}. Model: ${model}. Effort: ${effort}. Context: ${context}. Mode: ${mode}.`}
      aria-label="Configure model, effort, and context"
      className="composer-runtime"
      data-testid="composer-runtime"
      onClick={onOpen}
      title={description}
      type="button"
    >
      <span className="composer-runtime__summary">
        <span className="composer-runtime-model">
          <ModelFamilyIcon family={modelFamily(model)} />
          {shortModel !== model ? (
            <>
              <span className="composer-runtime__model composer-runtime__model--full">{model}</span>
              <span className="composer-runtime__model composer-runtime__model--short">{shortModel}</span>
            </>
          ) : (
            <span className="composer-runtime__model">{model}</span>
          )}
        </span>
        <span className="composer-runtime__detail composer-runtime__detail--effort">
          <span aria-hidden="true">·</span>effort {effort}
        </span>
        <span className="composer-runtime__detail composer-runtime__detail--context">
          <span aria-hidden="true">·</span>
          {context} context
        </span>
        <span className="composer-runtime__detail composer-runtime__detail--mode">
          <span aria-hidden="true">·</span>
          {ModeIcon && <ModeIcon aria-hidden="true" className="composer-runtime__mode-icon" focusable="false" size={12} />}
          <span className="composer-runtime__mode">{mode}</span>
        </span>
        {busy && <span className="composer-runtime__hint">applies when idle</span>}
      </span>
    </button>
  )
}
