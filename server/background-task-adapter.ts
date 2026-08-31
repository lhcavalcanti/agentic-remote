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

function textFromValue(value: unknown, depth = 0): string | undefined {
  if (depth > 4 || value === null || value === undefined) {
    return undefined
  }
  if (typeof value === 'string') {
    return boundedText(value)
  }
  if (Array.isArray(value)) {
    const text = value
      .map((entry) => textFromValue(entry, depth + 1))
      .filter((entry): entry is string => Boolean(entry))
      .join('\n')
    return boundedText(text)
  }
  if (typeof value !== 'object') {
    return undefined
  }
  const object = recordValue(value)
  for (const key of [
    'detailedContent',
    'content',
    'output',
    'stdout',
    'stderr',
    'outputPreview',
    'text',
    'message',
  ]) {
    const text = textFromValue(object[key], depth + 1)
    if (text) {
      return text
    }
  }
  return undefined
}

function eventString(
  data: Record<string, unknown>,
  key: string,
): string | undefined {
  return stringValue(data[key])
}

function booleanValue(value: unknown): boolean {
  return value === true || value === 'true'
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
  for (const key of ['shellId', 'shell_id', 'shell-id']) {
    const id = stringValue(object[key])
    if (id) {
      return id
    }
  }
  for (const key of [
    'result',
    'structuredContent',
    'content',
    'contents',
    'output',
    'stdout',
    'stderr',
    'text',
    'message',
  ]) {
    const id = shellIdFromValue(object[key], depth + 1)
    if (id) {
      return id
    }
  }
  for (const entry of Object.values(object)) {
    const id = shellIdFromValue(entry, depth + 1)
    if (id) {
      return id
    }
  }
  return undefined
}

function shellExitFromValue(
  value: unknown,
  depth = 0,
):
  | {
      shellId: string
      exitCode: number
      outputPreview?: string
    }
  | undefined {
  if (depth > 5 || value === null || value === undefined) {
    return undefined
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const exit = shellExitFromValue(entry, depth + 1)
      if (exit) {
        return exit
      }
    }
    return undefined
  }
  if (typeof value !== 'object') {
    return undefined
  }
  const object = recordValue(value)
  if (object.type === 'shell_exit') {
    const shellId = stringValue(object.shellId) || stringValue(object.shell_id)
    const exitCode = numberValue(object.exitCode)
    if (shellId && exitCode !== undefined) {
      return {
        shellId,
        exitCode,
        outputPreview: boundedText(object.outputPreview),
      }
    }
  }
  for (const entry of Object.values(object)) {
    const exit = shellExitFromValue(entry, depth + 1)
    if (exit) {
      return exit
    }
  }
  return undefined
}

function errorValue(data: Record<string, unknown>): string | undefined {
  const error = data.error
  if (typeof error === 'string') {
    return boundedText(error)
  }
  return (
    boundedText(recordValue(error).message) ||
    textFromValue(recordValue(data).error)
  )
}

function shellTaskMode(
  data: Record<string, unknown>,
  args: Record<string, unknown>,
): {
  executionMode: BackgroundTask['executionMode']
  attachmentMode: BackgroundTask['attachmentMode']
} | undefined {
  const requestedMode = stringValue(args.mode)?.toLowerCase()
  const executionMode = executionModeValue(
    eventString(data, 'executionMode') ||
      eventString(args, 'executionMode') ||
      requestedMode,
  )
  const attachmentMode = attachmentModeValue(
    eventString(data, 'attachmentMode') ||
      eventString(args, 'attachmentMode') ||
      eventString(args, 'attachment'),
  )
  const detached =
    attachmentMode === 'detached' ||
    booleanValue(args.detach) ||
    booleanValue(args.detached) ||
    requestedMode === 'detached'
  const background =
    executionMode === 'background' ||
    booleanValue(args.async) ||
    booleanValue(args.background) ||
    requestedMode === 'background' ||
    requestedMode === 'async' ||
    detached
  if (!background) {
    return undefined
  }
  return {
    executionMode: 'background',
    attachmentMode: attachmentMode || (detached ? 'detached' : 'attached'),
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

function shellTaskOutput(
  task: BackgroundTask,
  value: unknown,
): void {
  const record = recordValue(value)
  const output =
    textFromValue(record.recentOutput) ||
    textFromValue(record.output) ||
    textFromValue(record.stdout) ||
    textFromValue(record.stderr) ||
    textFromValue(record.detailedContent) ||
    textFromValue(record.outputPreview)
  if (!output) {
    return
  }
  task.progress = {
    type: 'shell',
    recentOutput: output,
    pid: task.pid,
  }
}

function notificationKind(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const kind = recordValue(data.kind)
  return Object.keys(kind).length > 0 ? kind : data
}

function backgroundHandoff(
  data: Record<string, unknown>,
):
  | {
      executionMode: BackgroundTask['executionMode']
      attachmentMode: BackgroundTask['attachmentMode']
    }
  | undefined {
  const result = recordValue(data.result)
  const executionMode =
    eventString(data, 'executionMode') ||
    eventString(result, 'executionMode') ||
    eventString(data, 'mode') ||
    eventString(result, 'mode')
  const attachmentMode =
    eventString(data, 'attachmentMode') ||
    eventString(result, 'attachmentMode')
  if (
    executionMode === 'background' ||
    executionMode === 'async' ||
    attachmentMode === 'detached'
  ) {
    return {
      executionMode: 'background',
      attachmentMode:
        attachmentMode === 'detached' ? 'detached' : 'attached',
    }
  }
  if (
    booleanValue(data.background) ||
    booleanValue(data.detached) ||
    booleanValue(result.background) ||
    booleanValue(result.detached)
  ) {
    return {
      executionMode: 'background',
      attachmentMode:
        booleanValue(data.detached) || booleanValue(result.detached)
          ? 'detached'
          : 'attached',
    }
  }
  const message = textFromValue(result) || textFromValue(data)
  if (
    message &&
    /(?:background|detached|still running|moved)/i.test(message) &&
    /(?:shell|task|command)/i.test(message)
  ) {
    return {
      executionMode: 'background',
      attachmentMode: /detached/i.test(message) ? 'detached' : 'attached',
    }
  }
  return undefined
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
  const shellStarts = new Map<
    string,
    {
      id: string
      timestamp: string
      data: Record<string, unknown>
      mode?: ReturnType<typeof shellTaskMode>
    }
  >()

  const shellStartFor = (
    id: string | undefined,
  ):
    | {
        id: string
        timestamp: string
        data: Record<string, unknown>
        mode?: ReturnType<typeof shellTaskMode>
      }
    | undefined => {
    if (!id) {
      return undefined
    }
    const direct = shellStarts.get(id)
    if (direct) {
      return direct
    }
    const resolved = taskIdAlias(aliases, id)
    return [...shellStarts.values()].find(
      (start) => taskIdAlias(aliases, start.id) === resolved,
    )
  }

  const finishShellTask = (
    shellId: string,
    timestamp: string,
    data: Record<string, unknown>,
  ): void => {
    const resolvedId = taskIdAlias(aliases, shellId)
    const start = shellStartFor(shellId)
    let current = tasks.get(resolvedId)
    if (current?.type !== 'shell') {
      current = undefined
    }
    if (!current && start) {
      current = shellTask(
        start.id,
        start.timestamp,
        start.data,
        start.mode || {
          executionMode: 'background',
          attachmentMode:
            data.type === 'shell_detached_completed' ? 'detached' : 'attached',
        },
      )
      tasks.set(start.id, current)
      aliases.set(start.id, start.id)
    }
    if (!current) {
      current = {
        type: 'shell',
        id: shellId,
        description: 'Background shell',
        status: 'running',
        startedAt:
          eventString(data, 'startedAt') ||
          eventString(data, 'started_at') ||
          timestamp,
        executionMode: 'background',
        attachmentMode: 'detached',
        canCancel: false,
      }
      tasks.set(shellId, current)
      aliases.set(shellId, shellId)
    }
    if (current.id !== shellId) {
      current = rekeyTask(tasks, aliases, current.id, shellId) || current
    }
    const exitCode = numberValue(data.exitCode)
    current.status =
      data.cancelled === true
        ? 'cancelled'
        : exitCode !== undefined && exitCode !== 0
          ? 'failed'
          : current.status === 'failed' || current.status === 'cancelled'
            ? current.status
            : 'completed'
    current.completedAt = timestamp
    current.description =
      boundedText(eventString(data, 'description')) || current.description
    if (current.status === 'failed') {
      current.error =
        errorValue(data) ||
        current.error ||
        (exitCode === undefined
          ? 'Shell task failed'
          : `Shell exited with status ${exitCode}`)
    } else {
      current.error = undefined
    }
    shellTaskOutput(current, data)
    current.canCancel = false
    for (const [toolCallId, pending] of shellStarts) {
      if (
        pending.id === shellId ||
        taskIdAlias(aliases, pending.id) === taskIdAlias(aliases, shellId)
      ) {
        shellStarts.delete(toolCallId)
      }
    }
  }

  for (const event of events) {
    const data = recordValue(event.data)
    const eventType = String(event.type)
    if (
      eventType === 'system.notification' ||
      eventType === 'shell_started' ||
      eventType === 'shell_detached_started' ||
      eventType === 'shell_completed' ||
      eventType === 'shell_detached_completed'
    ) {
      const kind = notificationKind(data)
      const kindType = eventString(kind, 'type') || eventType
      if (
        kindType === 'shell_started' ||
        kindType === 'shell_detached_started'
      ) {
        const shellId =
          eventString(kind, 'shellId') ||
          eventString(kind, 'shell_id') ||
          shellIdFromValue(kind)
        if (shellId) {
          const mode = {
            executionMode: 'background' as const,
            attachmentMode:
              kindType === 'shell_detached_started'
                ? ('detached' as const)
                : ('attached' as const),
          }
          const current = shellTask(
            shellId,
            eventString(kind, 'startedAt') || event.timestamp,
            kind,
            mode,
          )
          current.status =
            eventString(kind, 'status') === 'queued' ? 'queued' : 'running'
          tasks.set(shellId, current)
          aliases.set(shellId, shellId)
        }
      }
      if (
        kindType === 'shell_detached_completed' ||
        kindType === 'shell_completed'
      ) {
        const shellId =
          eventString(kind, 'shellId') ||
          eventString(kind, 'shell_id') ||
          shellIdFromValue(kind)
        if (shellId) {
          finishShellTask(shellId, event.timestamp, kind)
        }
      }
      if (kindType === 'agent_idle' || kindType === 'agent_completed') {
        const agentId = eventString(kind, 'agentId') || event.agentId
        if (agentId) {
          const id = taskIdAlias(aliases, agentId)
          const current = tasks.get(id) || eventTask(agentId, event.timestamp, kind)
          current.executionMode = 'background'
          current.description =
            boundedText(eventString(kind, 'description')) ||
            current.description
          current.agentType =
            eventString(kind, 'agentType') || current.agentType
          current.prompt = boundedText(kind.prompt) || current.prompt
          if (kindType === 'agent_idle') {
            current.status = 'queued'
            current.canCancel = true
          } else {
            const status = eventString(kind, 'status')
            current.status =
              status === 'cancelled'
                ? 'cancelled'
                : status === 'failed'
                  ? 'failed'
                  : 'completed'
            current.completedAt = event.timestamp
            current.error = errorValue(kind)
            current.result = textFromValue(kind.result) || current.result
            current.latestResponse =
              textFromValue(kind.latestResponse) || current.latestResponse
            current.canCancel = false
          }
          tasks.set(id, current)
          aliases.set(agentId, id)
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
      if (isShellTool(toolName)) {
        const mode = shellTaskMode(data, args)
        const toolCallId = eventString(data, 'toolCallId')
        const shellId =
          shellIdFromValue(data) || shellIdFromValue(args) || toolCallId
        if (toolCallId && shellId) {
          shellStarts.set(toolCallId, {
            id: shellId,
            timestamp: event.timestamp,
            data,
            mode,
          })
        }
        if (mode && shellId) {
          const current = shellTask(shellId, event.timestamp, data, mode)
          tasks.set(shellId, current)
          if (toolCallId) {
            aliases.set(toolCallId, shellId)
          }
          aliases.set(shellId, shellId)
        }
        if (event.agentId && !mode) {
          const agentId = taskIdAlias(aliases, event.agentId)
          const current =
            tasks.get(agentId) ||
            eventTask(agentId, event.timestamp, data)
          addActivity(
            current,
            eventString(data, 'toolName') || 'shell',
            event.timestamp,
          )
          tasks.set(agentId, current)
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
        current.result = textFromValue(data.result) || current.result
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
      let current = tasks.get(id)
      const start = shellStartFor(toolCallId) || shellStartFor(shellId)
      const handoffMode = backgroundHandoff(data)
      if (!current && start && handoffMode) {
        const backgroundId = shellId || start.id
        current = shellTask(
          backgroundId,
          start.timestamp,
          start.data,
          handoffMode,
        )
        tasks.set(backgroundId, current)
        aliases.set(toolCallId, backgroundId)
        aliases.set(backgroundId, backgroundId)
      }
      if (current?.type === 'shell') {
        const shellExit = shellExitFromValue(data)
        const resolvedShellId = shellExit?.shellId || shellId
        if (resolvedShellId && current.id !== resolvedShellId) {
          current =
            rekeyTask(tasks, aliases, current.id, resolvedShellId) || current
        }
        if (shellExit) {
          current.status = shellExit.exitCode === 0 ? 'completed' : 'failed'
          current.completedAt = event.timestamp
          current.error =
            current.status === 'failed'
              ? `Shell exited with status ${shellExit.exitCode}`
              : undefined
          shellTaskOutput(current, shellExit)
          current.canCancel = false
        } else if (!data.success) {
          current.status = data.cancelled === true ? 'cancelled' : 'failed'
          current.completedAt = event.timestamp
          current.error =
            current.status === 'failed'
              ? errorValue(data) || 'Shell task failed to start'
              : undefined
          current.canCancel = false
        }
        if (!shellExit) {
          shellTaskOutput(current, data.result)
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
