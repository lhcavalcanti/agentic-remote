import { useEffect, useState } from 'react'
import type { ComputerSummary } from '../../shared/contracts'
import type { SkillSettingsSnapshot } from '../../shared/skill-settings'
import { listComputerSkills, toggleComputerSkill } from '../api'

export function SkillsSettings({ computers }: { computers: ComputerSummary[] }) {
  const [selected, setSelected] = useState(computers.find((computer) => computer.isLocal)?.id ?? computers[0]?.id ?? '')
  const computer = computers.find((entry) => entry.id === selected)
  return <div>
    <label className="field"><span>Computer</span><select aria-label="Skills computer" className="dialog-select"
      value={selected} onChange={(event) => setSelected(event.target.value)}>
      {computers.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}{entry.online ? '' : ' · Offline'}</option>)}
    </select></label>
    <p className="dialog-message">Skills are discovered read-only. Changes affect every Copilot CLI session on the selected computer, not just this app. Disabling a name affects every discovered skill with that name.</p>
    {computer ? <ComputerSkills key={computer.id} computer={computer} /> : <p role="status">Choose an available computer.</p>}
  </div>
}

function ComputerSkills({ computer }: { computer: ComputerSummary }) {
  const [snapshot, setSnapshot] = useState<SkillSettingsSnapshot>()
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [query, setQuery] = useState('')
  const [pending, setPending] = useState<{ name: string; enabled: boolean }>()
  useEffect(() => {
    const request = new AbortController()
    setSnapshot(undefined)
    setError(undefined)
    setPending(undefined)
    if (computer.online) void listComputerSkills(computer.id, request.signal).then(
      (value) => { if (!request.signal.aborted) setSnapshot(value) },
      (caught: unknown) => { if (!request.signal.aborted) setError(caught instanceof Error ? caught.message : 'Skills could not be loaded.') },
    )
    return () => request.abort()
  }, [computer.id, computer.online, refresh])
  async function save() {
    if (!pending || !snapshot || !computer.online) return
    setBusy(true)
    setError(undefined)
    try {
      const next = await toggleComputerSkill(computer.id, { ...pending, revision: snapshot.revision, confirmed: true })
      setSnapshot(next)
      setPending(undefined)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Skill settings could not be saved.')
      setPending(undefined)
    } finally { setBusy(false) }
  }
  const skills = snapshot?.skills.filter((skill) => `${skill.name} ${skill.description}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  return <>
    {!computer.online ? <p role="status">This computer is offline. Reconnect it to manage skills.</p> : null}
    {computer.online && !snapshot && !error ? <p role="status">Discovering skills…</p> : null}
    {error ? <p role="alert">{error}</p> : null}
    {snapshot ? <>
      <label className="field"><span>Search skills</span><input aria-label="Search skills" className="dialog-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      {snapshot.warnings.map((warning) => <p className="dialog-message" key={warning}>{warning}</p>)}
      {!skills?.length ? <p role="status">No skills found.</p> : null}
      {!pending ? <ul className="skills-settings__list">{skills?.map((skill) => (
        <li key={`${skill.source}:${skill.location}`}>
          <div><strong>{skill.name}</strong><p>{skill.description || 'No description provided.'}</p>
            <small>{skill.source} · {skill.location}</small>
            {skill.reason ? <p className="dialog-message">{skill.reason}</p> : null}</div>
          <button aria-label={`${skill.enabled ? 'Disable' : 'Enable'} ${skill.name}`} className="secondary-button"
            disabled={skill.manageable === false || busy || Boolean(pending) || !computer.online} onClick={() => setPending({ name: skill.name, enabled: !skill.enabled })} type="button">
            {skill.enabled ? 'Disable' : 'Enable'}
          </button>
        </li>
      ))}</ul> : null}
    </> : null}
    {pending ? <section aria-label="Confirm skill change" className="skills-settings__confirmation" role="group">
      <h4>{pending.enabled ? 'Enable' : 'Disable'} {pending.name}?</h4>
      <p>This changes Copilot CLI settings for every session on {computer.name}. It is not limited to this session or repository. Existing sessions may need to reload skills.</p>
      <button className="primary-button" disabled={busy || !computer.online} onClick={() => void save()} type="button">{busy ? 'Saving…' : 'Confirm change'}</button>
      <button className="secondary-button" disabled={busy} onClick={() => setPending(undefined)} type="button">Cancel</button>
    </section> : null}
    <button className="secondary-button" disabled={busy || !computer.online} onClick={() => setRefresh((value) => value + 1)} type="button">Refresh skills</button>
  </>
}
