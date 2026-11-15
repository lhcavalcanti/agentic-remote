import { useCallback, useEffect, useState } from 'react'
import { Activity, Cpu, HardDrive, MemoryStick, Network, Pause, Play } from 'lucide-react'
import type { ComputerSummary } from '../../shared/contracts'
import type { HostMetric } from '../../shared/host-telemetry'
import { DialogFrame } from '../components/DialogFrame'
import { bytes, sparkPath, trend } from './metrics'
import { useHostMonitor } from './use-host-monitor'
import './host-monitor.css'

export function HostMonitorView({ computers, enabled, onClose, onOpenSession }: {
  computers: ComputerSummary[]
  enabled: boolean
  onClose(): void
  onOpenSession(computerId: string, sessionId: string): void
}) {
  const [selected, setSelected] = useState(computers.find((computer) => computer.isLocal)?.id ?? computers[0]?.id ?? '')
  const computer = computers.find((entry) => entry.id === selected)
  const [hostnames, setHostnames] = useState<Record<string, string>>({})
  const reportHostname = useCallback((id: string, name: string) =>
    setHostnames((names) => names[id] === name ? names : { ...names, [id]: name }), [])
  return <DialogFrame title="Host monitor" eyebrow="Computers" onClose={onClose} className="host-monitor">
    {!enabled ? <p className="dialog-message">Host monitor is turned off on this hub.</p> : <>
      <label className="field">Computer<select className="dialog-select" value={selected} onChange={(event) => setSelected(event.target.value)}>
        {computers.map((entry) => <option value={entry.id} key={entry.id}>
          {hostnames[entry.id] ?? entry.name} · {entry.isLocal ? 'Hub' : 'Node'}{entry.online ? '' : ' · Offline'}
        </option>)}
      </select></label>
      {!computer ? <p>No computer is selected.</p> : !computer.online ? <p role="status">This computer is offline. Reconnect it to view live telemetry.</p> :
        <HostComputerView key={computer.id} computer={computer} onHostname={reportHostname}
          onOpenSession={(id) => onOpenSession(computer.id, id)} />}
    </>}
  </DialogFrame>
}

function Sparkline({ label, values, ceiling, range = '60s' }: { label: string; values: { at: number; value: number | null }[]; ceiling?: number; range?: '60s' | '24h' }) {
  const path = sparkPath(values, ceiling, range === '60s' ? 60_000 : 86_400_000)
  const singlePoint = values.filter((point) => point.value !== null).length === 1 ? path.match(/^M([\d.]+),([\d.]+)/) : null
  return <svg className="host-spark" viewBox="0 0 120 34" role="img" aria-label={`${label} trend${path ? '' : ' unavailable'}`}>
    <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
    {singlePoint && <circle cx={singlePoint[1]} cy={singlePoint[2]} r="2" fill="currentColor" />}
    {!path && <text x="60" y="22" textAnchor="middle" fill="currentColor" fontSize="10">No data</text>}
  </svg>
}

function HostComputerView({ computer, onHostname, onOpenSession }: {
  computer: ComputerSummary
  onHostname(computerId: string, name: string): void
  onOpenSession(sessionId: string): void
}) {
  const [tab, setTab] = useState<'Overview' | 'Processes'>('Overview')
  const [filter, setFilter] = useState<'All' | 'Agentic Remote' | 'Agent sessions'>('All')
  const [range, setRange] = useState<'60s' | '24h'>('60s')
  const monitor = useHostMonitor(computer.id, computer.online, tab === 'Processes', range === '24h')
  const [frozen, setFrozen] = useState<typeof monitor>()
  const [paused, setPaused] = useState(false)
  const shown = paused && frozen ? frozen : monitor
  const { snapshot, history, processes } = shown
  const latest = snapshot?.latest
  const info = snapshot?.info
  const liveHostname = monitor.snapshot?.info?.hostname
  useEffect(() => {
    if (liveHostname) onHostname(computer.id, liveHostname)
  }, [liveHostname, computer.id, onHostname])
  const rows: { label: string; icon: typeof Cpu; value: string; metrics: HostMetric[]; ceiling?: number }[] = [
    { label: 'CPU', icon: Cpu, value: latest?.cpuPercent == null ? 'Unavailable' : `${latest.cpuPercent.toFixed(1)}%`, metrics: ['cpuPercent'], ceiling: 100 },
    { label: 'Memory', icon: MemoryStick, value: `${bytes(latest?.memoryUsedBytes)} / ${bytes(info?.totalMemoryBytes)}`, metrics: ['memoryUsedBytes'], ceiling: info?.totalMemoryBytes },
    { label: 'Network', icon: Network, value: `↓ ${bytes(latest?.netRxBytesPerSec)}/s · ↑ ${bytes(latest?.netTxBytesPerSec)}/s`, metrics: ['netRxBytesPerSec', 'netTxBytesPerSec'] },
    { label: 'Disk I/O', icon: Activity, value: `Read ${bytes(latest?.diskReadBytesPerSec)}/s · Write ${bytes(latest?.diskWriteBytesPerSec)}/s`, metrics: ['diskReadBytesPerSec', 'diskWriteBytesPerSec'] },
    ...(['load1', 'load5', 'load15'] as const).map((metric, index) => ({
      label: `Load · ${[1, 5, 15][index]} min`, icon: Activity,
      value: latest?.[metric] == null ? 'Unavailable' : (latest[metric] === 0 ? 0 : Math.max(0.01, latest[metric])).toFixed(2),
      metrics: [metric], ceiling: info?.logicalCpus,
    })),
  ]
  const inventory = (processes?.rows ?? []).filter((row) => filter === 'All' ||
    (filter === 'Agentic Remote' ? row.owner === 'agentic-remote' || row.owner === 'shared-runtime' : row.owner === 'session' || row.owner === 'shared-runtime'))
  return <div>
    <div className="host-heading">
      <div><strong>{info?.hostname ?? computer.name}</strong><p className="host-caption">{paused ? 'Paused' : monitor.error ? 'Unavailable' : 'Live'} · last sampled {latest ? new Date(latest.at).toLocaleTimeString(undefined, { hour12: false }) : 'waiting for a sample'}</p></div>
      <button type="button" className="secondary-button" aria-pressed={paused} onClick={() => {
        if (!paused) setFrozen(monitor)
        setPaused(!paused)
      }}>{paused ? <Play size={16} /> : <Pause size={16} />}{paused ? 'Resume' : 'Pause'}</button>
    </div>
    {info?.isWsl && <p className="host-notice">WSL VM, not the Windows host{info.wslDistro ? ` · ${info.wslDistro}` : ''}</p>}
    {monitor.error && <p className="host-notice" role="alert">{monitor.error}</p>}
    <div role="tablist" aria-label="Host monitor views" className="host-tabs">
      {(['Overview', 'Processes'] as const).map((name) => <button type="button" key={name} role="tab" aria-selected={tab === name} onClick={() => setTab(name)}>{name}</button>)}
    </div>
    {tab === 'Overview' ? <>
      <div className="host-range" role="group" aria-label="History range">
        {(['60s', '24h'] as const).map((value) => <button type="button" key={value} aria-pressed={range === value} onClick={() => setRange(value)}>{value === '60s' ? 'Live · 60 s' : '24 h · minute averages'}</button>)}
      </div>
      {monitor.historyError && range === '24h' && <p role="alert">{monitor.historyError}</p>}
      <dl className="host-metrics">{rows.map(({ label, icon: Icon, value, metrics, ceiling }) =>
        <div className="host-metric" key={label}><dt><Icon size={18} aria-hidden="true" />{label}</dt><dd><strong>{value}</strong><Sparkline label={label} values={trend(snapshot, history, range, metrics)} ceiling={ceiling} range={range} /></dd></div>)}
        <div className="host-metric"><dt><HardDrive size={18} aria-hidden="true" />Disk space</dt><dd>
          <strong>{snapshot?.disk ? `${bytes(snapshot.disk.freeBytes)} free / ${bytes(snapshot.disk.totalBytes)}` : 'Unavailable'}</strong>
          <Sparkline label="Disk space" values={range === '60s' ? shown.diskSamples.map((sample) => ({ at: Date.parse(sample.at), value: sample.free })) : []} ceiling={snapshot?.disk?.totalBytes} range={range} />
        </dd></div>
      </dl>
      <p className="host-caption">Disk space history starts when this view opens; 24 h disk-capacity history is not collected.</p>
      <p className="host-caption">{range === '24h' ? `${history.length} minute aggregates · retained in memory until this computer restarts.` : '60-second rolling window. Gaps mean unavailable readings.'} Pause freezes presentation only.</p>
    </> : <>
      <div className="host-range" role="group" aria-label="Process filters">
        {(['All', 'Agentic Remote', 'Agent sessions'] as const).map((value) => <button type="button" aria-pressed={filter === value} key={value} onClick={() => setFilter(value)}>{value}</button>)}
      </div>
      <p className="host-caption">Executable names only · refreshed at most every 5 s · shared runtimes are not attributed to one session.</p>
      {monitor.processError && <p role="alert">{monitor.processError}</p>}
      <ul className="host-processes">{inventory.map((row) => <li key={`${row.pid}:${row.startTime}`}>
        <div><strong>{row.executable.split(/[\\/]/).at(-1)}</strong><small>PID {row.pid} · {row.label ?? row.owner}</small></div>
        <span>{row.cpuPercent.toFixed(1)}% · {bytes(row.rssBytes)}</span>
        {row.owner === 'session' && row.sessionId && <button className="secondary-button" onClick={() => onOpenSession(row.sessionId!)}>Open session</button>}
      </li>)}</ul>
      {!inventory.length && <p>No processes in this view.</p>}
      {processes?.truncated && <p role="status">Partial inventory: the scan limit was reached.</p>}
      {!!processes?.othersCount && <p className="host-caption">{processes.othersCount} other-user entries omitted.</p>}
    </>}
  </div>
}
