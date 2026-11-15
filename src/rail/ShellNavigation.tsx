import { Bell, Plus, Settings, Sparkles } from 'lucide-react'
import { railEntries, type ClientFeature } from '../features/registry'
import { usePreviewFeatures } from '../preview-features'
import { initials, useDisplayName } from './display-name'
import './rail.css'

export function ShellNavigation({ displayName, onNewSession, onSettings, onOracle, onOpen, unreadCount = 0 }: {
  displayName?: string
  onNewSession(): void
  onSettings(): void
  onOracle(): void
  onOpen?(id: string): void
  unreadCount?: number
}) {
  const { effective } = usePreviewFeatures()
  const name = useDisplayName(displayName, effective.desktopRail) || 'User'
  if (!effective.desktopRail && !effective.notificationPanel) return null
  const features: ClientFeature[] = [
    ...(effective.notificationPanel ? [{ id: 'notifications', label: 'Notifications', icon: Bell, railEntry: { order: 20, badge: unreadCount }, open: () => onOpen?.('notifications') }] : []),
    ...(effective.desktopRail ? [{ id: 'settings', label: 'App settings', icon: Settings, railEntry: { order: 100 }, open: onSettings }] : []),
  ]
  return <nav className="shell-rail" aria-label="App navigation">
    {effective.desktopRail && <div className="shell-rail__top">
      <button type="button" aria-label="Open Oracle" title="Open Oracle" className="icon-button" onClick={onOracle}><Sparkles aria-hidden="true" size={24} /></button>
      <button aria-label="New session" title="New session" onClick={onNewSession} className="icon-button"><Plus size={22} /></button>
    </div>}
    <div className="shell-rail__footer">
      {effective.desktopRail && <div className="shell-rail__identity" title={name}>
        <span className="shell-avatar" aria-hidden="true">{initials(name)}</span><span>{name}</span>
      </div>}
      {railEntries(features).map(({ id, label, icon: Icon, railEntry, open }) =>
        <button key={id} type="button" className="shell-rail__entry" aria-label={railEntry?.badge ? `${label}, ${railEntry.badge} unread` : label}
          title={label} onClick={open}>
          <Icon aria-hidden="true" size={20} /><span className="shell-rail__label">{label}</span>
          {!!railEntry?.badge && <span className="shell-badge" aria-label={`${railEntry.badge} unread`}>{railEntry.badge > 99 ? '99+' : railEntry.badge}</span>}
        </button>)}
    </div>
  </nav>
}
