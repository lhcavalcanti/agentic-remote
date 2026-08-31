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

function eventString(
  data: Record<string, unknown>,
  key: string,
): string | undefined {
  return stringValue(data[key])
}

function booleanValue(value: unknown): boolean {
  return value === true
}

function normalizedToolName(data: Record<string, unknown>): string {
  return (eventString(data, 'toolName') || '')
    .toLowerCase()
    .replaceAll('-', '_')
}

function taskArguments(data: Record<string, unknown>): Record<string, unknown> {
  return recordValue(data.arguments)
}

function shellIdFromValue(value: unknown, depth = 0): string | undefined {
  if (depth > 4 || value === null || value === undefined) {
    return undefined
  }
  if (typeof value === 'string') {
    return value.match(
      /\bshell[_ ]?id\b["'\s:=]+([A-Za-z0-9][A-Za-z0-9._:-]*)/i,
    )?.[1]
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const id = shellIdFromValue(entry, depth + 1)
      if (id) {
        return id
      }
    }
    return undefined
  }
  if (typeof value !== 'object') {
    return undefined
  }
  const object = recordValue(value)
  for (const key of ['shellId', 'shell_id']) {
    const id = stringValue(object[key])
    if (id) {
      return id
    }
  }
  for (const key of ['result', 'structuredContent', 'content', 'contents']) {
    const id = shellIdFromValue(object[key], depth + 1)
    if (id) {
      return id
    }
  }
  return undefined
}

function errorValue(data: Record<string, unknown>): string | undefined {
  const error = data.error
  if (typeof error === 'string') {
    return boundedText(error)
  }
  return boundedText(recordValue(error).message)
}

function shellTaskMode(
  data: Record<string, unknown>,
  args: Record<string, unknown>,
): {
  executionMode: BackgroundTask['executionMode']
  attachmentMode: BackgroundTask['attachmentMode']
} | undefined {
  const executionMode = executionModeValue(
    eventString(data, 'executionMode') ||
      eventString(args, 'executionMode') ||
      eventString(args, 'mode'),
  )
  const attachmentMode = attachmentModeValue(
    eventString(data, 'attachmentMode') ||
      eventString(args, 'attachmentMode') ||
      eventString(args, 'attachment'),
  )
  const detached =
    attachmentMode === 'detached' ||
    executionMode === 'background' ||
    booleanValue(args.detach) ||
    booleanValue(args.detached) ||
    booleanValue(args.async) ||
    booleanValue(args.background) ||
    args.mode === 'background' ||
    args.mode === 'detached' ||
    args.mode === 'async'
  if (!detached) {
    return undefined
  }
  return {
    executionMode: 'background',
    attachmentMode: attachmentMode || 'detached',
  }
}

function isShellTool(name: string): boolean {
  return (
    name === 'bash' ||
    name === 'local_shell' ||
    name === 'shell' ||
    name === 'sh' ||
    name === 'zsh' ||
    name === 'powershell' ||
    name === 'pwsh'
  )
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

function taskIdAlias(
  aliases: Map<string, string>,
  id: string,
): string {
  let current = id
  const seen = new Set<string>()
  while (!seen.has(current)) {
    seen.add(current)
    const next = aliases.get(current)
    if (!next || next === current) {
      break
    }
    current = next
  }
  return current
}

function rekeyTask(
  tasks: Map<string, BackgroundTask>,
  aliases: Map<string, string>,
  from: string,
  to: string,
): BackgroundTask | undefined {
  const resolvedFrom = taskIdAlias(aliases, from)
  const current = tasks.get(resolvedFrom)
  if (!current) {
    aliases.set(from, to)
    return tasks.get(taskIdAlias(aliases, to))
  }
  if (resolvedFrom !== to) {
    tasks.delete(resolvedFrom)
    current.id = to
    tasks.set(to, current)
  }
  aliases.set(from, to)
  aliases.set(to, to)
  return current
}

function eventTask(
  id: string,
  timestamp: string,
  data: Record<string, unknown>,
): BackgroundTask {
  const executionMode = executionModeValue(
    eventString(data, 'executionMode'),
  )
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
    ...(executionMode ? { executionMode } : {}),
    canCancel: false,
  }
}

function taskInvocation(
  id: string,
  timestamp: string,
  data: Record<string, unknown>,
): BackgroundTask {
  const args = taskArguments(data)
  return {
    ...eventTask(id, timestamp, {
      agentDescription:
        stringValue(args.description) || stringValue(args.name),
      agentType:
        stringValue(args.agent_type) ||
        stringValue(args.agentType) ||
        'subagent',
      prompt: args.prompt,
      model: args.model,
    }),
    description:
      boundedText(args.description) ||
      boundedText(args.name) ||
      'Background agent',
    executionMode: 'background',
  }
}

function shellTask(
  id: string,
  timestamp: string,
  data: Record<string, unknown>,
  mode: {
    executionMode: BackgroundTask['executionMode']
    attachmentMode: BackgroundTask['attachmentMode']
  },
): BackgroundTask {
  const args = taskArguments(data)
  const command =
    boundedText(args.command) ||
    boundedText(data.command) ||
    ''
  return {
    id,
    type: 'shell',
    description:
      boundedText(args.description) ||
      boundedText(data.description) ||
      command ||
      'Background shell',
    status: 'running',
    startedAt: timestamp,
    command,
    executionMode: mode.executionMode,
    attachmentMode: mode.attachmentMode,
    pid: numberValue(args.pid) || numberValue(data.pid),
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
  const aliases = new Map<string, string>()
  for (const event of events) {
    const data = recordValue(event.data)
    if (event.type === 'system.notification') {
      const kind = recordValue(data.kind)
      const kindType = eventString(kind, 'type')
      if (
        kindType === 'shell_detached_completed' ||
        kindType === 'shell_completed'
      ) {
        const shellId = eventString(kind, 'shellId')
        if (shellId) {
          const id = taskIdAlias(aliases, shellId)
          const current = tasks.get(id)
          if (current?.type === 'shell') {
            current.status =
              kindType === 'shell_completed' &&
              numberValue(kind.exitCode) !== undefined &&
              numberValue(kind.exitCode) !== 0
                ? 'failed'
                : 'completed'
            current.completedAt = event.timestamp
            if (current.status === 'failed') {
              current.error = `Shell exited with status ${numberValue(
                kind.exitCode,
              )}`
            }
            current.canCancel = false
          } else if (kindType === 'shell_detached_completed') {
            tasks.set(shellId, {
              type: 'shell',
              id: shellId,
              description:
                boundedText(eventString(kind, 'description')) ||
                'Background shell',
              status: 'completed',
              startedAt: event.timestamp,
              completedAt: event.timestamp,
              executionMode: 'background',
              attachmentMode: 'detached',
              canCancel: false,
            })
            aliases.set(shellId, shellId)
          }
        }
      }
      continue
    }
    if (event.type === 'tool.execution_start') {
      const toolName = normalizedToolName(data)
      if (toolName === 'task') {
        const id = eventString(data, 'toolCallId')
        if (id) {
          const resolvedId = taskIdAlias(aliases, id)
          const current = tasks.get(resolvedId)
          tasks.set(
            id,
            current?.type === 'agent'
              ? current
              : taskInvocation(id, event.timestamp, data),
          )
          aliases.set(id, id)
        }
        continue
      }
      const args = taskArguments(data)
      const mode = isShellTool(toolName)
        ? shellTaskMode(data, args)
        : undefined
      if (mode) {
        const toolCallId = eventString(data, 'toolCallId')
        const id =
          shellIdFromValue(data) ||
          shellIdFromValue(args) ||
          toolCallId
        if (id) {
          const current = shellTask(id, event.timestamp, data, mode)
          tasks.set(id, current)
          if (toolCallId) {
            aliases.set(toolCallId, id)
          }
          aliases.set(id, id)
        }
        continue
      }
    }
    if (
      event.type === 'subagent.started' ||
      event.type === 'subagent.completed' ||
      event.type === 'subagent.failed'
    ) {
      const toolCallId = eventString(data, 'toolCallId')
      const eventAgentId =
        event.agentId || eventString(data, 'agentId')
      const id = toolCallId
        ? taskIdAlias(aliases, toolCallId)
        : eventAgentId
          ? taskIdAlias(aliases, eventAgentId)
          : taskIdForEvent(event, data)
      if (!id) {
        continue
      }
      const current = tasks.get(id) || eventTask(id, event.timestamp, data)
      if (eventAgentId) {
        aliases.set(eventAgentId, id)
      }
      if (toolCallId) {
        aliases.set(toolCallId, id)
      }
      const executionMode = executionModeValue(
        eventString(data, 'executionMode'),
      )
      if (executionMode) {
        current.executionMode = executionMode
      }
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
            ? errorValue(data)
            : current.error
        current.result = boundedText(data.result) || current.result
        current.canCancel = false
      }
      tasks.set(id, current)
      continue
    }
    if (event.type === 'tool.execution_complete') {
      const toolCallId = eventString(data, 'toolCallId')
      if (!toolCallId) {
        continue
      }
      const shellId = shellIdFromValue(data)
      const id = taskIdAlias(aliases, toolCallId)
      const current = tasks.get(id)
      if (current?.type === 'shell') {
        if (shellId && current.id !== shellId) {
          rekeyTask(tasks, aliases, current.id, shellId)
        }
        if (!data.success) {
          current.status = data.cancelled === true ? 'cancelled' : 'failed'
          current.completedAt = event.timestamp
          current.error =
            current.status === 'failed'
              ? errorValue(data) || 'Shell task failed to start'
              : undefined
          current.canCancel = false
        }
        continue
      }
    }
    if (event.type === 'tool.execution_start' && event.agentId) {
      const id = taskIdAlias(aliases, event.agentId)
      const current =
        tasks.get(id) ||
        eventTask(id, event.timestamp, data)
      const toolName = eventString(data, 'toolName') || 'tool'
      addActivity(current, toolName, event.timestamp)
      tasks.set(id, current)
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
