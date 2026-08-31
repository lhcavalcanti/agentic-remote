import type { SessionEvent } from '@github/copilot-sdk'
import type {
  BackgroundTask,
  BackgroundTaskKind,
  BackgroundTaskProgress,
  BackgroundTaskProgressLine,
  BackgroundTaskStatus,
} from '../shared/contracts.js'

export interface CopilotTaskInfo {
  type: BackgroundTaskKind
  id: string
  description?: string
  status: string
  startedAt: string
  completedAt?: string
  activeTimeMs?: number
  activeStartedAt?: string
  error?: string
  agentType?: string
  prompt?: string
  result?: string
  latestResponse?: string
  model?: string
  resolvedModel?: string
  executionMode?: string
  command?: string
  attachmentMode?: string
  logPath?: string
  pid?: number
}

export interface CopilotTaskProgress {
  type: BackgroundTaskKind
  recentActivity?: Array<{
    message: string
    timestamp: string
  }>
  latestIntent?: string
  recentOutput?: string
  pid?: number
}

export interface CopilotTasksApi {
  list: () => Promise<{ tasks: CopilotTaskInfo[] }>
  refresh?: () => Promise<unknown>
  getProgress?: (params: { id: string }) => Promise<{
    progress?: CopilotTaskProgress | null
  }>
  cancel?: (params: { id: string }) => Promise<{ cancelled: boolean }>
}

export const MAX_BACKGROUND_TASKS = 100
export const MAX_TASK_TEXT_LENGTH = 20_000
export const MAX_TASK_ACTIVITY_LINES = 40

function boundedText(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length === 0) {
    return undefined
  }
  return value.length <= MAX_TASK_TEXT_LENGTH
    ? value
    : `${value.slice(0, MAX_TASK_TEXT_LENGTH - 1)}…`
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function statusValue(value: string): BackgroundTaskStatus {
  switch (value) {
    case 'queued':
    case 'running':
    case 'completed':
    case 'failed':
    case 'cancelled':
      return value
    case 'idle':
    case 'pending':
      return 'queued'
    default:
      throw new Error(`Unsupported background task status: ${value}`)
  }
}

function executionModeValue(
  value: string | undefined,
): BackgroundTask['executionMode'] {
  return value === 'sync' || value === 'background' ? value : undefined
}

function attachmentModeValue(
  value: string | undefined,
): BackgroundTask['attachmentMode'] {
  return value === 'attached' || value === 'detached' ? value : undefined
}

function progressValue(
  value: CopilotTaskProgress | null | undefined,
): BackgroundTaskProgress | undefined {
  if (!value || (value.type !== 'agent' && value.type !== 'shell')) {
    return undefined
  }
  const progress: BackgroundTaskProgress = { type: value.type }
  if (value.type === 'agent') {
    const recentActivity = (value.recentActivity || [])
      .flatMap((line): BackgroundTaskProgressLine[] => {
        const message = boundedText(line.message)
        return message && typeof line.timestamp === 'string'
          ? [{ message, timestamp: line.timestamp }]
          : []
      })
      .slice(-MAX_TASK_ACTIVITY_LINES)
    if (recentActivity.length > 0) {
      progress.recentActivity = recentActivity
    }
    progress.latestIntent = boundedText(value.latestIntent)
  } else {
    progress.recentOutput = boundedText(value.recentOutput)
    progress.pid = numberValue(value.pid)
  }
  return progress
}

export function normalizeBackgroundTask(
  task: CopilotTaskInfo,
  progress: CopilotTaskProgress | null | undefined,
  canCancel: boolean,
): BackgroundTask {
  const status = statusValue(task.status)
  const normalized: BackgroundTask = {
    id: task.id,
    type: task.type,
    description:
      boundedText(task.description) ||
      boundedText(task.command) ||
      (task.type === 'agent' ? 'Background agent' : 'Background shell'),
    status,
    startedAt: task.startedAt,
    canCancel: canCancel && (status === 'running' || status === 'queued'),
  }
  const optionalStrings: Array<
    [keyof Pick<
      BackgroundTask,
      | 'completedAt'
      | 'activeStartedAt'
      | 'error'
      | 'agentType'
      | 'prompt'
      | 'result'
      | 'latestResponse'
      | 'model'
      | 'resolvedModel'
      | 'command'
    >, unknown]
  > = [
    ['completedAt', task.completedAt],
    ['activeStartedAt', task.activeStartedAt],
    ['error', task.error],
    ['agentType', task.agentType],
    ['prompt', task.prompt],
    ['result', task.result],
    ['latestResponse', task.latestResponse],
    ['model', task.model],
    ['resolvedModel', task.resolvedModel],
    ['command', task.command],
  ]
  for (const [key, value] of optionalStrings) {
    const bounded = boundedText(value)
    if (bounded) {
      normalized[key] = bounded
    }
  }
  normalized.activeTimeMs = numberValue(task.activeTimeMs)
  normalized.pid = numberValue(task.pid)
  normalized.executionMode = executionModeValue(task.executionMode)
  normalized.attachmentMode = attachmentModeValue(task.attachmentMode)
  normalized.progress = progressValue(progress)
  return normalized
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {}
}

function eventString(data: Record<string, unknown>, key: string): string | undefined {
  return stringValue(data[key])
}

function taskIdForEvent(
  event: SessionEvent,
  data: Record<string, unknown>,
): string | undefined {
  return (
    event.agentId ||
    eventString(data, 'agentId') ||
    eventString(data, 'toolCallId')
  )
}

function eventTask(
  id: string,
  timestamp: string,
  data: Record<string, unknown>,
): BackgroundTask {
  return {
    id,
    type: 'agent',
    description:
      boundedText(eventString(data, 'agentDescription')) ||
      boundedText(eventString(data, 'description')) ||
      boundedText(eventString(data, 'agentName')) ||
      'Background agent',
    status: 'running',
    startedAt: timestamp,
    agentType: eventString(data, 'agentType') || eventString(data, 'agentName'),
    prompt: boundedText(data.prompt),
    model: eventString(data, 'model'),
    executionMode: 'background',
    canCancel: false,
  }
}

function addActivity(
  task: BackgroundTask,
  message: string,
  timestamp: string,
): void {
  const lines = task.progress?.recentActivity || []
  task.progress = {
    type: 'agent',
    ...task.progress,
    recentActivity: [
      ...lines,
      { message: boundedText(message) || 'Background activity', timestamp },
    ].slice(-MAX_TASK_ACTIVITY_LINES),
  }
}

export function backgroundTasksFromEvents(
  events: SessionEvent[],
): BackgroundTask[] {
  const tasks = new Map<string, BackgroundTask>()
  for (const event of events) {
    const data = recordValue(event.data)
    if (
      event.type === 'subagent.started' ||
      event.type === 'subagent.completed' ||
      event.type === 'subagent.failed'
    ) {
      const id = taskIdForEvent(event, data)
      if (!id) {
        continue
      }
      const current = tasks.get(id) || eventTask(id, event.timestamp, data)
      if (event.type === 'subagent.started') {
        current.status = 'running'
        current.description =
          boundedText(eventString(data, 'agentDescription')) ||
          boundedText(eventString(data, 'description')) ||
          current.description
        current.agentType =
          eventString(data, 'agentType') ||
          eventString(data, 'agentName') ||
          current.agentType
        current.model = eventString(data, 'model') || current.model
      } else {
        current.completedAt = event.timestamp
        current.status =
          event.type === 'subagent.completed'
            ? data.cancelled === true
              ? 'cancelled'
              : 'completed'
            : 'failed'
        current.error =
          event.type === 'subagent.failed'
            ? boundedText(data.error)
            : current.error
        current.canCancel = false
      }
      tasks.set(id, current)
      continue
    }
    if (event.type === 'tool.execution_start' && event.agentId) {
      const current =
        tasks.get(event.agentId) ||
        eventTask(event.agentId, event.timestamp, data)
      const toolName = eventString(data, 'toolName') || 'tool'
      addActivity(current, toolName, event.timestamp)
      tasks.set(event.agentId, current)
    }
  }
  return [...tasks.values()]
    .sort(
      (left, right) =>
        Number(
          right.status === 'running' || right.status === 'queued',
        ) -
          Number(
            left.status === 'running' || left.status === 'queued',
          ) ||
        right.startedAt.localeCompare(left.startedAt),
    )
    .slice(0, MAX_BACKGROUND_TASKS)
}
