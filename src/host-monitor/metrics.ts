import type { HostMetric, HostMinuteAggregate, HostSnapshot } from '../../shared/host-telemetry'

export function bytes(value: number | null | undefined): string {
  if (value == null) return 'Unavailable'
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let unit = 0
  while (Math.abs(value) >= 1000 && unit < units.length - 1) { value /= 1000; unit++ }
  return `${value === 0 ? '0' : Math.max(0.01, value).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${units[unit]}`
}

export interface TrendPoint { at: number; value: number | null }

export function trend(snapshot: HostSnapshot | undefined, history: HostMinuteAggregate[], range: '60s' | '24h', metrics: HostMetric[]): TrendPoint[] {
  const sum = (values: (number | null)[]) => values.some((value) => value === null) ? null : values.reduce<number>((total, value) => total + value!, 0)
  const points = range === '24h'
    ? history.map((sample) => ({ at: Date.parse(sample.at), value: sum(metrics.map((metric) => sample[metric]?.avg ?? null)) }))
    : (snapshot?.live ?? []).map((sample) => ({ at: Date.parse(sample.at), value: sum(metrics.map((metric) => sample[metric])) }))
  const end = snapshot?.latest ? Date.parse(snapshot.latest.at) : points.at(-1)?.at
  return end === undefined ? points : [...points, { at: end, value: null }]
}

export function sparkPath(points: readonly TrendPoint[], ceiling?: number, windowMs = 60_000): string {
  const timed = points.filter((point) => Number.isFinite(point.at)).sort((left, right) => left.at - right.at)
  if (!timed.length) return ''
  const end = timed.at(-1)!.at
  const start = end - windowMs
  const visible = timed.filter((point) => point.at >= start)
  const finite = visible.map((point) => point.value).filter((value): value is number => value !== null && Number.isFinite(value))
  if (!finite.length) return ''
  const max = Math.max(ceiling ?? 0, ...finite, 1)
  let connected = false
  let previousAt = start
  const maxGap = windowMs === 60_000 ? 1500 : 90_000
  return visible.map(({ at, value }) => {
    if (value == null || !Number.isFinite(value)) { connected = false; return '' }
    const command = connected && at - previousAt <= maxGap ? 'L' : 'M'
    connected = true
    previousAt = at
    return `${command}${((at - start) / windowMs * 116 + 2).toFixed(1)},${(30 - value / max * 28).toFixed(1)}`
  }).join(' ')
}
