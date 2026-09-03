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

export interface BackgroundTaskEventOptions {
  assumeBackground?: boolean
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
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
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
    case 'waiting':
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
  const executionMode =
    executionModeValue(task.executionMode) ||
    (task.type === 'shell' ? 'background' : undefined)
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
    ...(executionMode ? { executionMode } : {}),
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
  normalized.attachmentMode = attachmentModeValue(task.attachmentMode)
  normalized.progress = progressValue(progress)
  return normalized
}

function parsedValue(value: unknown): unknown {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }
  return value
}

function recordValue(value: unknown): Record<string, unknown> {
  const parsed = parsedValue(value)
  return value &&
    parsed &&
    typeof parsed === 'object' &&
    !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
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

function taskInfoFromValue(value: unknown): CopilotTaskInfo | undefined {
  const object = recordValue(value)
  const type = object.type
  const id = stringValue(object.id)
  const status = stringValue(object.status)
  const startedAt = stringValue(object.startedAt)
  if (
    (type !== 'agent' && type !== 'shell') ||
    !id ||
    !status ||
    !startedAt
  ) {
    return undefined
  }
  const task: CopilotTaskInfo = {
    type,
    id,
    status,
    startedAt,
  }
  const stringFields: Array<keyof Omit<
    CopilotTaskInfo,
    'type' | 'id' | 'status' | 'startedAt' | 'activeTimeMs' | 'pid'
  >> = [
    'description',
    'completedAt',
    'activeStartedAt',
    'error',
    'agentType',
    'prompt',
    'result',
    'latestResponse',
    'model',
    'resolvedModel',
    'executionMode',
    'command',
    'attachmentMode',
  ]
  for (const field of stringFields) {
    const value = stringValue(object[field])
    if (value) {
      task[field] = value
    }
  }
  const activeTimeMs = numberValue(object.activeTimeMs)
  const pid = numberValue(object.pid)
  if (activeTimeMs !== undefined) {
    task.activeTimeMs = activeTimeMs
  }
  if (pid !== undefined) {
    task.pid = pid
  }
  return task
}

function taskInfoListFromValue(value: unknown): CopilotTaskInfo[] {
  const object = recordValue(value)
  const candidates: unknown[] = [
    ...(['tasks', 'backgroundTasks', 'taskList'] as const).flatMap((key) => {
      const candidate = parsedValue(object[key])
      return Array.isArray(candidate) ? candidate : [candidate]
    }),
    parsedValue(object.task),
  ]
  const direct = taskInfoFromValue(value)
  if (direct) {
    candidates.push(direct)
  }
  const unique = new Map<string, CopilotTaskInfo>()
  for (const candidate of candidates) {
    const task = taskInfoFromValue(candidate)
    if (task) {
      unique.set(task.id, task)
    }
  }
  return [...unique.values()]
}

function toolTelemetryProperties(
  data: Record<string, unknown>,
): Record<string, unknown> {
  return recordValue(recordValue(data.toolTelemetry).properties)
}

/**
 * The transport's own footer, as it writes it and nowhere else.
 *
 * A shell id read out of ordinary output is not a shell id. Command text,
 * file contents and an agent's own prose all quote these words, and taking
 * them at face value hands a completion to whatever unrelated task happens to
 * hold the number that was quoted. Only a complete marker on the last line
 * counts.
 */
const SHELL_FOOTERS = [
  // `<command started in detached background with shellId: 9>`
  /^<[^<>]*\bshell[_ ]?id\s*[:=]\s*([A-Za-z0-9][A-Za-z0-9._:-]*)[^<>]*>$/i,
  // `Started background shell (shellId: shell-1)`
  /^[^()<>]*\(\s*shell[_ ]?id\s*[:=]\s*([A-Za-z0-9][A-Za-z0-9._:-]*)\s*\)$/i,
]

/**
 * A completion reported as text rather than structure.
 *
 * `<shellId: 9 completed with exit code 1>` is the transport saying the shell
 * is over and how it ended. Reading only the id from it left a detached shell
 * running for good, and a command that failed recorded as having succeeded.
 */
const COMPLETION_FOOTER =
  /^<[^<>]*\bshell[_ ]?id\s*[:=]\s*([A-Za-z0-9][A-Za-z0-9._:-]*)[^<>]*\bexit code\s+(-?\d+)[^<>]*>$/i

/**
 * The end of whatever text a value carries, without display limits.
 *
 * The transport writes its footer last, and the text used for display is
 * truncated and prefers a summary field, so the one place the footer reliably
 * is happens to be the one place that reading never reaches.
 */
function rawTailText(value: unknown, depth = 0): string {
  if (depth > 4 || value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'string') {
    return value
  }
  if (Array.isArray(value)) {
    return value.map((entry) => rawTailText(entry, depth + 1)).join('\n')
  }
  if (typeof value !== 'object') {
    return ''
  }
  const object = recordValue(value)
  return (
    ['content', 'detailedContent', 'text', 'output', 'stdout', 'result']
      .map((key) => rawTailText(object[key], depth + 1))
      .filter(Boolean)
      .join('\n')
  )
}

function shellExitFromFooter(
  text: string,
): { shellId: string; exitCode: number } | undefined {
  const last = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .at(-1)
  const match = last?.match(COMPLETION_FOOTER)
  if (!match) {
    return undefined
  }
  return { shellId: match[1], exitCode: Number.parseInt(match[2], 10) }
}

function shellIdFromFooter(text: string): string | undefined {
  const last = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .at(-1)
  if (!last) {
    return undefined
  }
  for (const pattern of SHELL_FOOTERS) {
    const match = last.match(pattern)
    if (match) {
      return match[1]
    }
  }
  return undefined
}

function shellIdFromValue(value: unknown, depth = 0): string | undefined {
  if (depth > 4 || value === null || value === undefined) {
    return undefined
  }
  if (typeof value === 'string') {
    return shellIdFromFooter(value)
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
  for (const key of [
    'shellId',
    'shell_id',
    'shell-id',
    'processId',
    'process_id',
    'process-id',
  ]) {
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
  // Deliberately no sweep over every remaining value: that is what turned a
  // function name printed by a grep into a shell id.
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
    const shellId =
      stringValue(object.shellId) ||
      stringValue(object.shell_id) ||
      stringValue(object.processId) ||
      stringValue(object.process_id) ||
      stringValue(object['process-id'])
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
  assumeBackground = false,
): {
  executionMode: BackgroundTask['executionMode']
  attachmentMode: BackgroundTask['attachmentMode']
  assumed: boolean
} | undefined {
  const telemetry = toolTelemetryProperties(data)
  const requestedMode = (
    stringValue(args.mode) ||
    stringValue(args.executionMode) ||
    stringValue(telemetry.executionMode)
  )?.toLowerCase()
  const executionMode = executionModeValue(
    eventString(data, 'executionMode') ||
      eventString(args, 'executionMode') ||
      eventString(telemetry, 'executionMode') ||
      requestedMode,
  )
  const attachmentMode = attachmentModeValue(
    eventString(data, 'attachmentMode') ||
      eventString(args, 'attachmentMode') ||
      eventString(telemetry, 'attachmentMode') ||
      eventString(args, 'attachment'),
  )
  const detached =
    attachmentMode === 'detached' ||
    booleanValue(args.detach) ||
    booleanValue(args.detached) ||
    booleanValue(telemetry.detached) ||
    requestedMode === 'detached'
  const background =
    executionMode === 'background' ||
    booleanValue(args.async) ||
    booleanValue(args.background) ||
    booleanValue(telemetry.background) ||
    requestedMode === 'background' ||
    requestedMode === 'async' ||
    detached
  // assumeBackground is a fallback for transports that omit the mode, so it
  // must not override an execution that said it was synchronous.
  const explicitlySync =
    executionMode === 'sync' ||
    requestedMode === 'sync' ||
    requestedMode === 'synchronous' ||
    requestedMode === 'foreground' ||
    args.async === false ||
    args.background === false ||
    telemetry.background === false
  if (explicitlySync && !background) {
    return undefined
  }
  if (!background && !assumeBackground) {
    return undefined
  }
  return {
    executionMode: 'background',
    attachmentMode: attachmentMode || (detached ? 'detached' : 'attached'),
    // Nothing said this was in the background; it is only being treated that
    // way because the transport left the mode out.
    assumed: !background,
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
  assumed?: { flags: Set<string>; owners: Map<string, string> },
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
    // A task carries its identity, so what was recorded against the old one
    // has to follow it. Leaving it behind records the assumption against an id
    // no task answers to, and the sweep never recognizes the task again.
    if (assumed?.flags.delete(resolvedFrom)) {
      assumed.flags.add(to)
    }
    const owner = assumed?.owners.get(resolvedFrom)
    if (owner !== undefined) {
      assumed?.owners.delete(resolvedFrom)
      assumed?.owners.set(to, owner)
    }
  }
  aliases.set(from, to)
  aliases.set(to, to)
  return current
}

function eventTask(
  id: string,
  timestamp: string,
  data: Record<string, unknown>,
  assumeBackground = false,
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
    ...(executionMode || assumeBackground
      ? { executionMode: executionMode || 'background' }
      : {}),
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
    // A task asked to run synchronously holds the turn open rather than going
    // to the background, and counting it as background inflates the running
    // count and colours the session for work the user is already waiting on.
    executionMode:
      stringValue(args.mode) === 'sync' ? 'sync' : 'background',
  }
}

function shellTask(
  id: string,
  timestamp: string,
  data: Record<string, unknown>,
  mode: {
    executionMode: BackgroundTask['executionMode']
    attachmentMode: BackgroundTask['attachmentMode']
    assumed: boolean
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
      // A handoff is the shell saying outright that it went to the
      // background, which is the opposite of being assumed to be there.
      assumed: false
    }
  | undefined {
  const result = recordValue(data.result)
  const telemetry = toolTelemetryProperties(data)
  const executionMode = (
    eventString(data, 'executionMode') ||
    eventString(result, 'executionMode') ||
    eventString(telemetry, 'executionMode') ||
    eventString(data, 'mode') ||
    eventString(result, 'mode')
  )?.toLowerCase()
  const attachmentMode = (
    eventString(data, 'attachmentMode') ||
    eventString(result, 'attachmentMode') ||
    eventString(telemetry, 'attachmentMode')
  )?.toLowerCase()
  const detached =
    attachmentMode === 'detached' || booleanValue(telemetry.detached)
  if (
    executionMode === 'background' ||
    executionMode === 'async' ||
    detached
  ) {
    return {
      assumed: false,
      executionMode: 'background',
      attachmentMode:
        detached ? 'detached' : 'attached',
    }
  }
  if (
    booleanValue(data.background) ||
    booleanValue(data.detached) ||
    booleanValue(result.background) ||
    booleanValue(result.detached) ||
    booleanValue(telemetry.background)
  ) {
    return {
      assumed: false,
      executionMode: 'background',
      attachmentMode:
        booleanValue(data.detached) ||
        booleanValue(result.detached) ||
        booleanValue(telemetry.detached)
          ? 'detached'
          : 'attached',
    }
  }
  const message =
    textFromValue(result) ||
    textFromValue(recordValue(result.structuredContent)) ||
    textFromValue(data)
  // Ordinary output can describe a background command without one existing,
  // and an agent quoting the transport's own wording would otherwise promote
  // a task out of reach of the turn-end sweep. Only the footer counts, and
  // only when it names the shell it created.
  const footerLine = message
    ? message
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .at(-1)
    : undefined
  if (
    footerLine &&
    shellIdFromFooter(footerLine) &&
    // `still running after 30 seconds` is how a synchronous command that
    // timed out reports that it carried on without its caller. That is a
    // promotion, and not recognising it left the shell to be ended by the
    // turn it had already outlived.
    /(?:background|detached|async|still running)/i.test(footerLine)
  ) {
    return {
      assumed: false,
      executionMode: 'background',
      attachmentMode: /detached/i.test(footerLine) ? 'detached' : 'attached',
    }
  }
  return undefined
}

/**
 * When the agent last finished a turn of its own. Work that belongs to a turn
 * cannot still be running after one ended.
 */
function lastForegroundCompletionAt(events: SessionEvent[]): string | undefined {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index]
    if (event.agentId) {
      continue
    }
    if (
      event.type === 'assistant.turn_end' ||
      event.type === 'session.idle' ||
      event.type === 'abort' ||
      event.type === 'session.error' ||
      event.type === 'session.shutdown'
    ) {
      return event.timestamp
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
  options: BackgroundTaskEventOptions = {},
): BackgroundTask[] {
  const assumeBackground = options.assumeBackground === true
  const tasks = new Map<string, BackgroundTask>()
  // Shells that never said they were in the background, and are only being
  // treated as such because the transport left the mode out. They are the
  // only ones a finished turn can be said to have taken with it.
  const assumedBackground = new Set<string>()
  // Which background agent, if any, started an assumed shell. A background
  // agent outlives the foreground turn, so work it owns cannot be ended by
  // one; only its own agent finishing can.
  const assumedOwners = new Map<string, string>()
  const assumed = { flags: assumedBackground, owners: assumedOwners }
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
          assumed: false,
        },
      )
      if (start.mode?.assumed) {
        assumedBackground.add(current.id)
      }
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
      current =
        rekeyTask(tasks, aliases, current.id, shellId, assumed) || current
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
    const listedTasks = [
      ...taskInfoListFromValue(data),
      ...taskInfoListFromValue(data.result),
    ]
    for (const listedTask of listedTasks) {
      tasks.set(
        listedTask.id,
        normalizeBackgroundTask(listedTask, undefined, false),
      )
      aliases.set(listedTask.id, listedTask.id)
      // The CLI has reported this task itself, so nothing about it is being
      // assumed any more and the turn ending must not end it.
      assumedBackground.delete(listedTask.id)
      assumedOwners.delete(listedTask.id)
    }
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
            assumed: false,
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
          const current =
            tasks.get(id) ||
            eventTask(agentId, event.timestamp, kind, assumeBackground)
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
        const mode = shellTaskMode(data, args, assumeBackground)
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
          if (mode?.assumed) {
            assumedBackground.add(current.id)
            if (event.agentId) {
              assumedOwners.set(current.id, event.agentId)
            }
          }
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
            eventTask(agentId, event.timestamp, data, assumeBackground)
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
      const current =
        tasks.get(id) || eventTask(id, event.timestamp, data, assumeBackground)
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
      } else if (assumeBackground && !current.executionMode) {
        current.executionMode = 'background'
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
      const shellExit =
        shellExitFromValue(data) ||
        // The transport can report the exit as its footer rather than as
        // structure, and that carries the code as well as the id.
        //
        // Read from the raw tail rather than through the display text, which
        // is truncated and prefers a summary field: a long `read_bash` result
        // loses its footer to that limit, and with it the fact that the shell
        // is over and how it ended.
        shellExitFromFooter(rawTailText(data.result)) ||
        shellExitFromFooter(rawTailText(data))
      // A detached shell reports its exit through whichever call observed it,
      // and a follow-up read_bash/read_shell carries its own tool call id, so
      // the shell it names is consulted when the call itself owns no task.
      // The call comes first: a shell id is a small per-run counter that comes
      // round again, and preferring it lands one command's completion on an
      // unrelated task that then never finishes.
      const namedShellId = shellExit?.shellId || shellId
      const id = taskIdAlias(aliases, toolCallId)
      // A call that opened a shell of its own answers only for that shell. A
      // command that ran in the foreground is deliberately not projected as a
      // task, so it has none to find, and letting it match by shell id hands
      // its completion to whichever live task holds that number — the very
      // collision this is meant to remove. Only an observer such as
      // `read_bash`, which owns no start, may resolve one that way.
      const ownsShellStart = Boolean(shellStartFor(toolCallId))
      let current = tasks.get(id)
      if (!current && !ownsShellStart && namedShellId) {
        current = tasks.get(taskIdAlias(aliases, namedShellId))
      }
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
        if (handoffMode) {
          // The task already exists when a session projects every tool as
          // background, so the handoff has to be applied to it rather than
          // only used to create one. Without this a detached shell stays
          // recorded as attached and is treated as part of its turn.
          current.executionMode = handoffMode.executionMode
          // Detachment only ever becomes known: a later report that says
          // nothing about it must not take it back.
          if (handoffMode.attachmentMode === 'detached') {
            current.attachmentMode = 'detached'
          }
          // The shell said outright that it went to the background, so it is
          // no longer only assumed to be there and the turn that started it
          // can no longer end it.
          assumedBackground.delete(current.id)
          assumedOwners.delete(current.id)
        }
        // Only a real handoff renames the task after the shell it created. An
        // ordinary command reports the same id when it finishes, and taking
        // that as its identity hands the completion to whichever unrelated
        // task already holds the id, which then never finishes.
        // A direct exit is this call's own completion and stays under it. Only
        // a handoff creates a new shell worth renaming the task after, and
        // renaming on an exit hands the task whatever recycled id the shell
        // happened to be given.
        const handoffShellId = handoffMode && !shellExit ? shellId : undefined
        if (handoffShellId && current.id !== handoffShellId) {
          current =
            rekeyTask(
              tasks,
              aliases,
              current.id,
              handoffShellId,
              assumed,
            ) || current
        }
        if (shellExit) {
          current.status = shellExit.exitCode === 0 ? 'completed' : 'failed'
          current.completedAt = event.timestamp
          current.error =
            current.status === 'failed'
              ? `Shell exited with status ${shellExit.exitCode}`
              : undefined
          // The footer form carries only an id and a code, so the command's
          // own output is taken from the result it arrived with. Reading the
          // synthesized exit alone threw away everything the task printed.
          shellTaskOutput(current, shellExit)
          if (data.result !== undefined) {
            shellTaskOutput(current, data.result)
          }
          current.canCancel = false
        } else if (!data.success) {
          current.status = data.cancelled === true ? 'cancelled' : 'failed'
          current.completedAt = event.timestamp
          current.error =
            current.status === 'failed'
              ? errorValue(data) || 'Shell task failed to start'
              : undefined
          current.canCancel = false
        } else if (
          !handoffMode &&
          current.attachmentMode === 'attached'
        ) {
          current.status = 'completed'
          current.completedAt = event.timestamp
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
        eventTask(id, event.timestamp, data, assumeBackground)
      const toolName = eventString(data, 'toolName') || 'tool'
      addActivity(current, toolName, event.timestamp)
      tasks.set(id, current)
    }
  }
  // A shell that only ever ran inside the turn cannot outlive it. One that
  // started before the agent last finished and never reported is not still
  // going: the turn ended and took it along, and leaving it running fills the
  // panel with work that stopped hours ago.
  //
  // Only a shell that never reached the background is swept. Going async or
  // being promoted mid-command is precisely how a shell comes to outlive the
  // turn that started it, so those are still running exactly when they say
  // they are, and each has its own completion to close it. What is left is a
  // shell whose mode the transport never reported, which is treated as
  // background on the chance that it is.
  const lastTurnEndAt = lastForegroundCompletionAt(events)
  // The session itself stopping is the end of everything in it, agents
  // included.
  const sessionEndedAt = events.findLast(
    (event) =>
      event.type === 'session.shutdown' ||
      event.type === 'abort' ||
      event.type === 'session.error',
  )?.timestamp
  for (const task of tasks.values()) {
    if (
      task.status !== 'running' ||
      task.type !== 'shell' ||
      !assumedBackground.has(task.id) ||
      task.attachmentMode === 'detached'
    ) {
      continue
    }
    // Work is over when whatever started it is over. For a foreground shell
    // that is the turn ending; for one a background agent started it is that
    // agent finishing, which can happen long after any turn and is the only
    // thing that can speak for it.
    const ownerId = assumedOwners.get(task.id)
    let endedAt: string | undefined
    if (!ownerId) {
      endedAt = lastTurnEndAt
    } else {
      const owner = tasks.get(taskIdAlias(aliases, ownerId))
      if (
        !owner ||
        owner.status === 'running' ||
        owner.status === 'queued'
      ) {
        // The session ending ends its agents too, whether or not each one
        // reported finishing. Without this a missing completion leaves the
        // agent and everything it started running for good.
        if (!sessionEndedAt) {
          // Either the agent is still going or its lifecycle was never seen,
          // and neither is evidence that the work it started has stopped.
          continue
        }
        endedAt = sessionEndedAt
      } else {
        endedAt = owner.completedAt
      }
    }
    if (!endedAt || task.startedAt >= endedAt) {
      continue
    }
    task.status = 'failed'
    task.completedAt = endedAt
    task.error = task.error || 'Ended without reporting completion'
    task.canCancel = false
  }
  if (sessionEndedAt) {
    // The session stopping ends everything it was running, agents included.
    // Leaving an agent running because its completion was never reported also
    // keeps alive every shell that is waiting on it.
    for (const task of tasks.values()) {
      if (
        (task.status === 'running' || task.status === 'queued') &&
        task.startedAt < sessionEndedAt
      ) {
        task.status = 'failed'
        task.completedAt = sessionEndedAt
        task.error = task.error || 'Ended without reporting completion'
        task.canCancel = false
      }
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
