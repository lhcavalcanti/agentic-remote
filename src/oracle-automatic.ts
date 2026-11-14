import type { ManagerMessage } from '../shared/manager'
import {
  MANAGER_PROACTIVE_EVENT_KINDS,
  durableTaskTitle,
  proactivePromptEvents,
} from '../shared/manager-automatic'

export interface AutomaticTurnSummary {
  label: string
  detail?: string
}

/** A turn the hub queued for Oracle itself, rather than a message you sent. */
export function isAutomaticTurn(message: ManagerMessage): boolean {
  return message.role === 'user' && (message.source === 'proactive' || message.source === 'task')
}

/** What prompted one of Oracle's own turns; undefined for a message you sent. */
export function automaticTurnSummary(message: ManagerMessage): AutomaticTurnSummary | undefined {
  if (!isAutomaticTurn(message)) return undefined
  if (message.source === 'task') {
    return { label: 'Task follow-up', detail: durableTaskTitle(message.content) }
  }
  if (message.source !== 'proactive') return undefined
  const admitted = message.automatic?.eventIds
  const events = proactivePromptEvents(message.content, admitted)
  const count = events.length || admitted?.length || 1
  const label = count === 1 ? 'Session update' : 'Session updates'
  if (events.length === 1) return { label, detail: events[0].kind }
  if (events.length) {
    const detail = MANAGER_PROACTIVE_EVENT_KINDS
      .map((kind) => [kind, events.filter((event) => event.kind === kind).length] as const)
      .filter(([, total]) => total > 0)
      .map(([kind, total]) => `${total} ${kind}`)
      .join(', ')
    return { label, detail }
  }
  return count > 1 ? { label, detail: `${count} events` } : { label }
}

export function automaticTurnText({ label, detail }: AutomaticTurnSummary): string {
  return detail ? `${label} · ${detail}` : label
}
