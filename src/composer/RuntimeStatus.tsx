import type { ManagedSession } from '../../shared/contracts'
import { modelFamily } from '../../shared/model-family'
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
  // Each detail carries its own separator so a narrow row can drop it whole.
  return (
    <button
      aria-description={description}
      aria-label="Configure model, effort, and context"
      className="composer-runtime"
      data-testid="composer-runtime"
      onClick={onOpen}
      title={description}
      type="button"
    >
      <span className="composer-runtime__summary">
        <span className="composer-runtime-model">
          <ModelFamilyIcon family={modelFamily(runtime?.model ?? '')} />
          <span className="composer-runtime__model">{runtime?.model || 'Default model'}</span>
        </span>
        <span className="composer-runtime__detail composer-runtime__detail--effort">
          <span aria-hidden="true">·</span>effort {runtime?.reasoningEffort || 'default'}
        </span>
        <span className="composer-runtime__detail composer-runtime__detail--context">
          <span aria-hidden="true">·</span>
          {runtime?.contextTokenLimit ? compactTokens(runtime.contextTokenLimit) : 'auto'} context
        </span>
        <span className="composer-runtime__detail composer-runtime__detail--mode">
          <span aria-hidden="true">·</span>
          <span className="composer-runtime__mode">{runtime?.mode || 'interactive'}</span>
        </span>
        {busy && <span className="composer-runtime__hint">applies when idle</span>}
      </span>
    </button>
  )
}
