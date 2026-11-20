import { Bell, CalendarClock, Monitor, Plus, Settings } from 'lucide-react'
import { OracleIcon } from '../oracle-icon'
import { railEntries, type ClientFeature } from '../features/registry'
import { usePreviewFeatures } from '../preview-features'
import { initials, useDisplayName } from './display-name'
import './rail.css'

export function ShellNavigation({ displayName, onNewSession, onSettings, onOracle, onOpen, unreadCount = 0, offscreen = false, oracleAvailable = false }: {
  displayName?: string
  onNewSession(): void
  onSettings(): void
  onOracle(): void
  onOpen?(id: string): void
  unreadCount?: number
  offscreen?: boolean
  oracleAvailable?: boolean
}) {
  const { effective } = usePreviewFeatures()
  const name = useDisplayName(displayName, effective.desktopRail) || 'User'
  const features: ClientFeature[] = [
    ...(effective.hostMonitorView ? [{ id: 'host', label: 'Host monitor', icon: Monitor, railEntry: { order: 10 }, open: () => onOpen?.('host') }] : []),
    ...(effective.notificationPanel ? [{ id: 'notifications', label: 'Notifications', icon: Bell, railEntry: { order: 20, badge: unreadCount }, open: () => onOpen?.('notifications') }] : []),
    ...(effective.schedulerView ? [{ id: 'scheduler', label: 'Scheduler', icon: CalendarClock, railEntry: { order: 30 }, open: () => onOpen?.('scheduler') }] : []),
    ...(effective.desktopRail ? [{ id: 'settings', label: 'App settings', icon: Settings, railEntry: { order: 100 }, open: onSettings }] : []),
  ]
  const entries = railEntries(features)
  if (!entries.length) return null
  return <nav className="shell-rail" aria-label="App navigation" inert={offscreen} aria-hidden={offscreen || undefined}>
    {effective.desktopRail && <div className="shell-rail__top">
      {oracleAvailable && <button type="button" aria-label="Open Oracle" title="Open Oracle" className="icon-button" onClick={onOracle}><OracleIcon aria-hidden="true" size={24} strokeWidth={1.8} /></button>}
      <button aria-label="New session" title="New session" onClick={onNewSession} className="icon-button"><Plus size={22} /></button>
    </div>}
    <div className="shell-rail__footer">
      {effective.desktopRail && <div className="shell-rail__identity" title={name}>
        <span className="shell-avatar" aria-hidden="true">{initials(name)}</span><span>{name}</span>
      </div>}
      {entries.map(({ id, label, icon: Icon, railEntry, open }) =>
        <button key={id} type="button" className="shell-rail__entry" aria-label={railEntry?.badge ? `${label}, ${railEntry.badge} unread` : label}
          title={label} onClick={open}>
          <Icon aria-hidden="true" size={20} /><span className="shell-rail__label">{label}</span>
          {!!railEntry?.badge && <span className="shell-badge" aria-label={`${railEntry.badge} unread`}>{railEntry.badge > 99 ? '99+' : railEntry.badge}</span>}
        </button>)}
    </div>
  </nav>
}
