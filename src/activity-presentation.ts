import type { ActivityKind, ActivityStatus, ChatMessage } from '../shared/contracts'

export function activityKindFromMessage(message: ChatMessage): ActivityKind {
  if (message.activityKind) {
    return message.activityKind
  }
  const title = message.content.split('\n', 1)[0] || ''
  if (/^Skill \(/.test(title)) {
    return 'skill'
  }
  if (/^Agent \(/.test(title)) {
    return 'agent'
  }
  return 'tool'
}

export function activityStatusFromMessage(message: ChatMessage): ActivityStatus {
  return message.activityStatus || 'running'
}

export function compactActivityText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

export function activityPresentation(message: ChatMessage): {
  title: string
  kind: ActivityKind
  name: string
  origin?: string
  summary?: string
  arguments?: string
} {
  const [title = '', ...detailLines] = message.content.split('\n')
  const detail = compactActivityText(detailLines.join('\n'))
  const kind = activityKindFromMessage(message)
  if (kind === 'skill') {
    const match = title.match(/^Skill \((.+)\)$/)
    return {
      title,
      kind,
      name: match ? `skill(${match[1]})` : 'skill',
      arguments: detail || undefined,
    }
  }
  if (kind === 'agent') {
    const match = title.match(/^Agent \(([^)]+)\)(?: · (.*))?$/)
    return {
      title,
      kind,
      name: match ? `agent(${match[1]})` : 'agent',
      summary: match?.[2],
      arguments: detail || undefined,
    }
  }
  if (title.startsWith('MCP ·')) {
    const parts = title.split(' · ')
    const hasServer = parts.length > 2
    const server = hasServer ? parts[1] || '' : ''
    const operation = hasServer ? parts[2] || 'tool' : parts[1] || 'tool'
    return {
      title,
      kind,
      name: operation,
      origin: server ? `(MCP: ${server})` : '(MCP)',
      summary: parts.slice(3).join(' · ') || undefined,
      arguments: detail || undefined,
    }
  }
  const [name = 'tool', ...summaryParts] = title.split(' · ')
  return {
    title,
    kind,
    name,
    summary: summaryParts.join(' · ') || undefined,
    arguments: detail || undefined,
  }
}

export function formatActivityDuration(durationMs?: number): string {
  if (
    durationMs === undefined ||
    !Number.isFinite(durationMs) ||
    durationMs < 0
  ) {
    return '—'
  }
  const seconds = durationMs / 1_000
  if (seconds < 1) {
    return `${Math.round(durationMs)}ms`
  }
  if (seconds < 10) {
    return `${seconds.toFixed(1)}s`
  }
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${String(remainingSeconds).padStart(2, '0')}s`
}

export function activityStatusGlyph(status: ActivityStatus): string {
  switch (status) {
    case 'completed':
      return '●'
    case 'failed':
      return '×'
    case 'pending':
      return '·'
    case 'running':
      return '○'
  }
}

export function activityStatusLabel(status: ActivityStatus): string {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'failed':
      return 'Failed'
    case 'pending':
      return 'Pending'
    case 'running':
      return 'Running'
  }
}
