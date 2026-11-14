import type { HostMetric, HostMinuteAggregate, HostSnapshot } from '../../shared/host-telemetry'

export function bytes(value: number | null | undefined): string {
  if (value == null) return 'Unavailable'
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let unit = 0
  while (Math.abs(value) >= 1000 && unit < units.length - 1) { value /= 1000; unit++ }
  return `${value === 0 ? '0' : Math.max(0.01, value).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${units[unit]}`
}

export function trend(snapshot: HostSnapshot | undefined, history: HostMinuteAggregate[], range: '60s' | '24h', metrics: HostMetric[]): (number | null)[] {
  const sum = (values: (number | null)[]) => values.some((value) => value === null) ? null : values.reduce<number>((total, value) => total + value!, 0)
  return range === '24h'
    ? history.map((sample) => sum(metrics.map((metric) => sample[metric]?.avg ?? null)))
    : (snapshot?.live ?? []).map((sample) => sum(metrics.map((metric) => sample[metric])))
}

export function sparkPath(values: readonly (number | null)[], ceiling?: number): string {
  const finite = values.filter((value): value is number => value !== null && Number.isFinite(value))
  if (!finite.length) return ''
  const max = Math.max(ceiling ?? 0, ...finite, 1)
  let connected = false
  return values.map((value, index) => {
    if (value == null || !Number.isFinite(value)) { connected = false; return '' }
    const command = connected ? 'L' : 'M'
    connected = true
    return `${command}${(index / Math.max(1, values.length - 1) * 116 + 2).toFixed(1)},${(30 - value / max * 28).toFixed(1)}`
  }).join(' ')
}
