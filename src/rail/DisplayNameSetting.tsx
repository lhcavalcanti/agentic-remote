import { useState } from 'react'
import { parseSettingValue } from '../../shared/settings-profile'
import { usePreviewFeature } from '../preview-features'
import { useDisplayName } from './display-name'

export function DisplayNameSetting({ value, onChange }: { value?: string; onChange?: (name: string) => void }) {
  const enabled = usePreviewFeature('desktopRail')
  const name = useDisplayName(value, enabled)
  const [draft, setDraft] = useState<string>()
  const [error, setError] = useState<string>()
  if (!enabled) return null
  return <section className="app-settings-section">
    <h4>Display name</h4>
    <p className="dialog-message">Hub · every device. A display label, not an account.</p>
    <form onSubmit={(event) => {
      event.preventDefault()
      const parsed = parseSettingValue('displayName', draft ?? name)
      if (!parsed.ok) { setError(parsed.error); return }
      onChange?.(parsed.value)
      setDraft(undefined)
      setError(undefined)
    }}>
      <label>Display name<input maxLength={60} value={draft ?? name}
        onChange={(event) => setDraft(event.target.value)} /></label>
      <button className="secondary-button" type="submit">Save display name</button>
      {error && <p role="alert">{error}</p>}
    </form>
  </section>
}
