import type { ComputerSummary } from '../../shared/contracts.js'
import type { HostProcesses, HostSnapshot, ProcessRow } from '../../shared/host-telemetry.js'
import type { HostTelemetryTarget } from './service.js'

export const HOST_STATUS_MAX_COMPUTERS = 8
export const HOST_STATUS_MAX_LENGTH = 16_000
const FIELD_LIMIT = 100

function text(value: string): string {
  return value.replace(/\p{Cc}|[`[\]<>]/gu, ' ').slice(0, FIELD_LIMIT)
}

function number(value: number | null | undefined, suffix = ''): string {
  return value == null || !Number.isFinite(value) ? 'unavailable' : `${Number(value.toFixed(2))}${suffix}`
}

function bytes(value: number | null | undefined): string {
  if (value == null) return 'unavailable'
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let unit = 0
  while (value >= 1000 && unit < units.length - 1) { value /= 1000; unit += 1 }
  return `${number(value > 0 && value < 0.01 ? 0.01 : value)} ${units[unit]}`
}

function owner(row: ProcessRow, computer: ComputerSummary): string {
  if (row.owner === 'session' && row.sessionId && row.sessionId.length <= 200 && computer.id.length <= 200) {
    return `session [${text(row.sessionId)}](/?computer=${encodeURIComponent(computer.id)}&session=${encodeURIComponent(row.sessionId)})`
  }
  if (row.owner === 'shared-runtime') {
    return row.label === 'Claude runtime' ? 'Claude runtime'
      : row.label === 'Shared Copilot runtime' ? 'shared Copilot runtime' : 'shared runtime (session ownership unproven)'
  }
  return row.owner === 'agentic-remote' ? 'Agentic Remote' : row.owner === 'session' ? 'session (link unavailable)' : 'other'
}

function summary(computer: ComputerSummary, snapshot: HostSnapshot, now: number): string[] {
  const { info, latest, disk } = snapshot
  const age = latest ? snapshot.sampleAgeMs !== undefined ? snapshot.sampleAgeMs / 1000
    : computer.isLocal ? Math.max(0, (now - Date.parse(latest.at)) / 1000) : undefined : undefined
  const unknownAge = Boolean(latest && age === undefined)
  return [
    `## ${text(info?.hostname ?? computer.name)} · ${computer.isLocal ? 'hub' : 'node'} (${text(computer.id)})`,
    ...(info?.isWsl ? [`WSL VM, not the Windows host${info.wslDistro ? ` · ${text(info.wslDistro)}` : ''}`] : []),
    `CPU ${number(latest?.cpuPercent, '%')} · memory used ${bytes(latest?.memoryUsedBytes)}, available ${bytes(latest?.memoryAvailableBytes)}`,
    `Data mount ${disk ? text(disk.mount) : 'unavailable'} · disk free ${bytes(disk?.freeBytes)}${disk?.totalBytes ? ` (${number(disk.freeBytes / disk.totalBytes * 100, '%')})` : ''}`,
    `Load 1/5/15m ${number(latest?.load1)}/${number(latest?.load5)}/${number(latest?.load15)} · sample age ${unknownAge ? 'unknown' : number(age, 's')}`,
    ...(unknownAge ? ['Sample freshness is unknown; current host health is unknown. Update this computer to report sample age.'] : []),
    ...(age !== undefined && age > 30 ? ['Stale sample; current host health is unknown.'] : []),
  ]
}

function processes(computer: ComputerSummary, inventory: HostProcesses, now: number): string[] {
  return [
    `Top 5 processes by CPU (one core = 100%; ${computer.isLocal
      ? `inventory age ${number(Math.max(0, (now - Date.parse(inventory.scannedAt)) / 1000), 's')}`
      : 'inventory received just now'}):`,
    'CPU uses scan deltas; the first scan has no baseline and reports 0%.',
    ...inventory.rows.slice().sort((left, right) => right.cpuPercent - left.cpuPercent || left.pid - right.pid)
      .slice(0, 5).map((row) => `- ${text(row.executable)} · PID ${row.pid} · ${number(row.cpuPercent, '%')} CPU · ${bytes(row.rssBytes)} RSS · ${owner(row, computer)}`),
    ...(!inventory.rows.length ? ['No visible processes.'] : []),
    ...(inventory.truncated ? ['Process inventory truncated at the owning computer; ranking covers scanned rows only.'] : []),
    ...(inventory.othersCount ? [`${inventory.othersCount} other-user processes excluded.`] : []),
  ]
}

/** Reads only through the same local/remote target used by the hub API. */
export async function oracleHostStatus(
  computers: ComputerSummary[],
  resolve: (computerId: string) => Promise<HostTelemetryTarget | undefined>,
  now: () => number,
): Promise<string> {
  const sections = await Promise.all(computers.slice(0, HOST_STATUS_MAX_COMPUTERS).map(async (computer) => {
    const unavailable = `${text(computer.name)} (${text(computer.id)}): not available on this computer`
    try {
      const target = await resolve(computer.id)
      if (!target) return `${unavailable}; host monitoring is turned off.`
      const snapshot = await target.snapshot()
      const lines = summary(computer, snapshot, now())
      try {
        lines.push(...processes(computer, await target.processes(), now()))
      } catch {
        lines.push('Processes not available on this computer right now; inventory may be rate limited. Try again after 5 seconds.')
      }
      return lines.join('\n')
    } catch (error) {
      const status = error && typeof error === 'object' && 'statusCode' in error ? error.statusCode : undefined
      return `${unavailable}; ${status === 409
        ? 'update this computer or enable its host monitoring.'
        : 'it may be offline or host monitoring is unavailable.'}`
    }
  }))
  if (computers.length > HOST_STATUS_MAX_COMPUTERS) {
    sections.push(`${computers.length - HOST_STATUS_MAX_COMPUTERS} computers omitted; pass computerId for a specific computer.`)
  }
  const result = sections.join('\n\n') || 'Host status: not available on this computer.'
  const notice = '\n[Host status truncated; pass computerId for a specific computer.]'
  const end = result.lastIndexOf('\n', HOST_STATUS_MAX_LENGTH - notice.length)
  return result.length <= HOST_STATUS_MAX_LENGTH ? result : result.slice(0, Math.max(0, end)) + notice
}
