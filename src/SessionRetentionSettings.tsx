import { useRef, useState } from 'react'
import type { SessionRetention, SessionRetentionPatch } from '../shared/contracts'

export function SessionRetentionSettings({ value, disabled, save }: {
  value?: SessionRetention
  disabled: boolean
  /** Receives only the edited field, so a stale view cannot revert another device's edit. */
  save: (patch: SessionRetentionPatch) => Promise<void>
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>()
  const inFlight = useRef(false)
  async function change(next: SessionRetentionPatch) {
    if (inFlight.current) return
    inFlight.current = true
    setSaving(true)
    setError(undefined)
    try {
      await save(next)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      inFlight.current = false
      setSaving(false)
    }
  }
  return (
    <div className="session-retention">
      <label className="session-retention__pin">
        <input
          checked={value?.pinned ?? false}
          disabled={disabled || saving}
          onChange={(event) => void change({ pinned: event.target.checked })}
          type="checkbox"
        />
        Keep for review
      </label>
      <label>
        Archive inactive session
        <select
          disabled={disabled || saving}
          onChange={(event) => void change({
            idleDays: event.target.value ? Number(event.target.value) : null,
          })}
          value={value?.idleDays ?? ''}
        >
          <option value="">Never (default)</option>
          {[...new Set([7, 30, 90, ...(value?.idleDays ? [value.idleDays] : [])])].sort((a, b) => a - b).map((days) =>
            <option key={days} value={days}>After {days} days</option>)}
        </select>
      </label>
      <p>Only archives an idle session after its process has stopped. Queued work, pending requests, and review pins are protected. Never deletes history or worktrees.</p>
      {value?.idleDays ? <p>Already older than {value.idleDays} days? An eligible session may leave the list on the next cleanup pass. Reopen it from session history.</p> : null}
      {value?.pinned ? <p>Kept for review on all devices, regardless of the archive age.</p> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </div>
  )
}
