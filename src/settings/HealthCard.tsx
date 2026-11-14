import { useEffect, useState } from 'react'
import type { HubHealth } from '../../shared/hub-health'
import { getHubHealth } from '../api'
import { usePreviewFeature } from '../preview-features'

export function HealthCard() {
  const enabled = usePreviewFeature('healthCard')
  return enabled ? <HealthDetails /> : null
}

function HealthDetails() {
  const [health, setHealth] = useState<HubHealth>()
  const [error, setError] = useState<string>()
  const [refresh, setRefresh] = useState(0)
  useEffect(() => {
    const request = new AbortController()
    setError(undefined)
    setHealth(undefined)
    void getHubHealth(request.signal).then(
      (value) => { if (!request.signal.aborted) setHealth(value) },
      () => { if (!request.signal.aborted) setError('Health information could not be loaded from this hub.') },
    )
    return () => request.abort()
  }, [refresh])
  const phases = health?.startup.filter((phase) => phase.event !== 'begin')
  return (
    <section aria-label="Health" className="app-settings-section app-settings-section--wide">
      <h4>Health</h4>
      <p className="dialog-message">Read-only information reported by the hub. No diagnostic commands are run.</p>
      {!health && !error ? <p role="status">Loading health…</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {health ? <>
        <p><strong>{health.hub.name}</strong> · {health.hub.role} · Version {health.hub.version}</p>
        <p className="dialog-message">Release: {health.release?.buildId ?? 'Not reported'}</p>
        <h5>Last startup in this process</h5>
        {phases?.length ? <dl className="health-card__facts">{phases.map((phase, index) => (
          <div key={`${phase.startupPhase}-${index}`}><dt>{phase.startupPhase}</dt><dd>
            {phase.durationMs === undefined ? 'Duration not reported' : `${phase.durationMs} ms`}
            {phase.event === 'fail' ? ` · Failed (${phase.error ?? 'unknown'})` : ''}
          </dd></div>
        ))}</dl> : <p className="dialog-message">Startup timings are not available.</p>}
        <h5>Computers</h5>
        <ul className="health-card__computers">{health.computers.map((computer) => (
          <li key={computer.id}><strong>{computer.name}</strong> · {computer.role} · {computer.online ? 'Online' : 'Offline'} · Version {computer.version ?? 'not reported'}</li>
        ))}</ul>
        <h5>Effective hub flags</h5>
        <dl className="health-card__facts">{Object.entries(health.hubFlags).map(([name, value]) => (
          <div key={name}><dt>{name}</dt><dd>{value ? 'On' : 'Off'}</dd></div>
        ))}</dl>
      </> : null}
      <p className="dialog-message">For deeper checks, use <code>agentic-remote doctor</code> or <code>agentic-remote logs --why</code>.</p>
      <button className="secondary-button" onClick={() => setRefresh((value) => value + 1)} type="button">Refresh health</button>
    </section>
  )
}
