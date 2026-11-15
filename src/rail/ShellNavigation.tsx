import { Plus, Settings, Sparkles } from 'lucide-react'
import { usePreviewFeatures } from '../preview-features'
import { initials, useDisplayName } from './display-name'
import './rail.css'

export function ShellNavigation({ displayName, onNewSession, onSettings, onOracle }: {
  displayName?: string
  onNewSession(): void
  onSettings(): void
  onOracle(): void
}) {
  const { effective } = usePreviewFeatures()
  const name = useDisplayName(displayName, effective.desktopRail) || 'User'
  if (!effective.desktopRail) return null
  return <nav className="shell-rail" aria-label="App navigation">
    <div className="shell-rail__top">
      <button type="button" aria-label="Open Oracle" title="Open Oracle" className="icon-button" onClick={onOracle}><Sparkles aria-hidden="true" size={24} /></button>
      <button aria-label="New session" title="New session" onClick={onNewSession} className="icon-button"><Plus size={22} /></button>
    </div>
    <div className="shell-rail__footer">
      <div className="shell-rail__identity" title={name}>
        <span className="shell-avatar" aria-hidden="true">{initials(name)}</span><span>{name}</span>
      </div>
      <button type="button" className="shell-rail__entry" aria-label="App settings" title="App settings" onClick={onSettings}>
        <Settings aria-hidden="true" size={20} /><span className="shell-rail__label">App settings</span>
      </button>
    </div>
  </nav>
}
