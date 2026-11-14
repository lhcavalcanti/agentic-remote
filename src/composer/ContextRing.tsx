import type { SessionRuntimeInfo } from '../../shared/contracts'

export function ContextRing({ runtime, onOpen }: { runtime?: SessionRuntimeInfo; onOpen: () => void }) {
  const known = typeof runtime?.contextTokens === 'number' && runtime.contextTokenLimit &&
    runtime.contextTokenLimit > 0
  const percent = known
    ? Math.max(0, Math.min(100, Math.round(runtime.contextTokens! / runtime.contextTokenLimit! * 100)))
    : undefined
  const label = percent === undefined ? 'Context: usage unavailable' : `Context: ${percent}% used`
  return (
    <button
      aria-description={percent === undefined ? 'The runtime has not reported context usage' :
        `${runtime?.contextEstimated ? 'Estimated' : 'Measured'} context usage; not plan usage`}
      aria-label={label}
      className="composer-tool composer-context-ring"
      onClick={onOpen}
      title={`${label}${runtime?.contextEstimated && percent !== undefined ? ' (estimated)' : ''}`}
      type="button"
    >
      <svg aria-hidden="true" height="24" viewBox="0 0 24 24" width="24">
        <circle className="composer-context-ring__track" cx="12" cy="12" fill="none" r="9" strokeWidth="2" />
        {percent !== undefined ? (
          <circle
            cx="12" cy="12" fill="none" pathLength="100" r="9"
            stroke="currentColor" strokeDasharray={`${percent} 100`} strokeWidth="2"
            transform="rotate(-90 12 12)"
          />
        ) : null}
      </svg>
    </button>
  )
}
