/**
 * The text of Oracle's automatic turns. The hub writes these prompts; the
 * panel reads back what prompted each turn to show it as one thin row rather
 * than as a message from you.
 */

export const MANAGER_PROACTIVE_EVENT_KINDS = ['failed', 'blocked', 'finished'] as const
export type ManagerProactiveEventKind = (typeof MANAGER_PROACTIVE_EVENT_KINDS)[number]

export interface ProactivePromptEvent {
  id: string
  kind: ManagerProactiveEventKind
  computerId: string
  sessionId: string
  taskGeneration: number
  revision: number
}

const PROACTIVE_PROMPT_HEADER =
  'Review these durable manager-owned lifecycle events. Read state only, then record exactly one outcome for every event.'
const PROACTIVE_EVENT_LINE = /^Event ([a-f0-9]{64}): kind=([a-z]+); /

export function formatProactivePrompt(events: readonly ProactivePromptEvent[]): string {
  return [
    PROACTIVE_PROMPT_HEADER,
    ...events.map((event) =>
      `Event ${event.id}: kind=${event.kind}; computer=${event.computerId}; session=${event.sessionId}; taskGeneration=${event.taskGeneration}; revision=${event.revision}.`),
  ].join('\n')
}

/** The events a proactive prompt names, limited to `admitted` IDs when given. */
export function proactivePromptEvents(
  content: string,
  admitted?: readonly string[],
): Array<{ id: string; kind: ManagerProactiveEventKind }> {
  const allowed = admitted ? new Set(admitted) : undefined
  const events: Array<{ id: string; kind: ManagerProactiveEventKind }> = []
  for (const line of content.split('\n')) {
    const [, id, kind] = PROACTIVE_EVENT_LINE.exec(line) ?? []
    if (!id || (allowed && !allowed.has(id))) continue
    if (!(MANAGER_PROACTIVE_EVENT_KINDS as readonly string[]).includes(kind)) continue
    events.push({ id, kind: kind as ManagerProactiveEventKind })
  }
  return events
}

export const DURABLE_TASK_LINE_PREFIX = 'Durable task: '

/** The task title the hub appends after a task's execution prompt. */
export function durableTaskTitle(content: string): string | undefined {
  const line = content.split('\n').findLast((candidate) => candidate.startsWith(DURABLE_TASK_LINE_PREFIX))
  return line?.slice(DURABLE_TASK_LINE_PREFIX.length).trim() || undefined
}
