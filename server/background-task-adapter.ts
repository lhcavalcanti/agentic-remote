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

function isShellStopTool(name: string): boolean {
  return name === 'stop_bash' || name === 'stop_shell'
}

function shellStopAcknowledged(
  data: Record<string, unknown>,
  requestedId: string,
  currentId: string,
): boolean {
  if (data.success !== true) return false
  const status = toolTelemetryProperties(data).shell_status
  if (status !== undefined) return status === 'stopped'
  const last = rawTailText(data.result)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .at(-1)
  return last === `<command with id: ${requestedId} stopped>` ||
    last === `<command with id: ${currentId} stopped>`
}

/** Tools that report on a shell somebody else started. */
function isShellObserverTool(name: string | undefined): boolean {
  if (!name) {
    // A completion that does not say what produced it is not taken as
    // speaking for a shell it never opened.
    return false
  }
  const tool = name.toLowerCase()
  return (
    tool === 'read_bash' ||
    tool === 'read_shell' ||
    isShellStopTool(tool) ||
    tool === 'list_bash' ||
    tool === 'bash_output' ||
    isShellTool(tool)
  )
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
  current: BackgroundTask,
  to: string,
  assumed?: { flags: Set<string>; owners: Map<string, string> },
): BackgroundTask | undefined {
  const from = current.id
  if (tasks.get(from) !== current) return undefined
  const destination = tasks.get(to)
  if (destination && destination !== current && isLiveTaskStatus(destination.status)) {
    return undefined
  }
  const ownsAlias = taskIdAlias(aliases, from) === from
  if (from !== to) {
    tasks.delete(from)
    current.id = to
    tasks.set(to, current)
    // A task carries its identity, so what was recorded against the old one
    // has to follow it. Leaving it behind records the assumption against an id
    // no task answers to, and the sweep never recognizes the task again.
    if (assumed?.flags.delete(from)) {
      assumed.flags.add(to)
    }
    const owner = assumed?.owners.get(from)
    if (owner !== undefined) {
      assumed?.owners.delete(from)
      assumed?.owners.set(to, owner)
    }
  }
  if (ownsAlias) aliases.set(from, to)
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
    textFromValue(record.outputPreview) ||
    // The plain shapes too: a result that is just a string, or carries its
    // text under `content`, is how a completion reported as a footer arrives,
    // and reading neither left the finished task with no output at all.
    textFromValue(record.content) ||
    (typeof value === 'string' ? value : '')
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

function isLiveTaskStatus(status: BackgroundTaskStatus): boolean {
  return status === 'running' || status === 'queued'
}

function isTerminalTaskStatus(status: BackgroundTaskStatus): boolean {
  return (
    status === 'completed' || status === 'failed' || status === 'cancelled'
  )
}

/**
 * Fold a fresh inventory row into the shell it refreshes.
 *
 * A confirmed terminal state is the record of how a shell actually ended, and
 * a later running or queued snapshot is stale by the time it arrives. Letting
 * it overwrite the task resurrects a cancelled shell or erases a real exit
 * before a pending stop is even read. So a terminal task keeps its status,
 * completion time, error, result and output, and only borrows the metadata it
 * still lacks -- and only from a refresh that agrees the shell has ended. A
 * live task takes the newer snapshot but keeps the launch command and last
 * output the CLI leaves out of an inventory row.
 */
function mergeShellRefresh(
  previous: BackgroundTask,
  reported: BackgroundTask,
): BackgroundTask {
  if (isTerminalTaskStatus(previous.status)) {
    if (isTerminalTaskStatus(reported.status)) {
      previous.completedAt ??= reported.completedAt
      if (previous.status === reported.status) previous.error ??= reported.error
      previous.result ??= reported.result
      previous.latestResponse ??= reported.latestResponse
      previous.activeTimeMs ??= reported.activeTimeMs
      previous.pid ??= reported.pid
      previous.model ??= reported.model
      previous.resolvedModel ??= reported.resolvedModel
      previous.agentType ??= reported.agentType
    }
    previous.canCancel = false
    return previous
  }
  if (!reported.command && previous.command) {
    reported.command = previous.command
  }
  if (!reported.progress && previous.progress) {
    reported.progress = previous.progress
  }
  return reported
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
  // The raw tail, for the same reason completions use it: the text prepared
  // for display is truncated and prefers a summary field, so a command that
  // printed enough before its footer loses the footer itself.
  const message =
    rawTailText(result) ||
    rawTailText(recordValue(result.structuredContent)) ||
    rawTailText(data)
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
    // The owning agent can be named on the envelope or in the payload, and
    // reading only the envelope took an agent's own completion for the
    // foreground turn ending.
    if (event.agentId || eventString(recordValue(event.data), 'agentId')) {
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
  // Which tool a call belongs to. Only the start event says so, and the
  // completion has to know whether it came from something that reads shells.
  const toolNames = new Map<string, string>()
  // A per-execution handle that stays with a shell through metadata refreshes,
  // provider-id rekeys and native handoffs. It, and not whatever id or alias
  // currently points at a task, is what a pending stop is bound to, so a reused
  // id can never redirect one execution's stop onto another's job.
  const shellInstances = new WeakMap<BackgroundTask, object>()
  const shellTasksByIdentity = new Map<object, BackgroundTask>()
  const bindShellIdentity = (task: BackgroundTask, identity: object): void => {
    shellInstances.set(task, identity)
    shellTasksByIdentity.set(identity, task)
  }
  // Which execution a launching call created, kept by the call's own id so a
  // late handoff for that call can find its original execution even after the
  // id it once held has been reused by a newer launch.
  const launchIdentity = new Map<string, object>()
  const shellStopTargets = new Map<
    string,
    { identity: object; requestedId: string }
  >()
  const shellIdentityOf = (task: BackgroundTask): object => {
    const existing = shellInstances.get(task)
    if (existing) {
      return existing
    }
    const identity = {}
    bindShellIdentity(task, identity)
    return identity
  }
  const shellByIdentity = (identity: object): BackgroundTask | undefined => {
    const task = shellTasksByIdentity.get(identity)
    return task?.type === 'shell' && tasks.get(task.id) === task &&
      shellInstances.get(task) === identity ? task : undefined
  }
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
      shellIdentityOf(current)
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
      shellIdentityOf(current)
      tasks.set(shellId, current)
      aliases.set(shellId, shellId)
    }
    if (current.id !== shellId) {
      current =
        rekeyTask(tasks, aliases, current, shellId, assumed) || current
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
      const previous = tasks.get(listedTask.id)
      const reported = normalizeBackgroundTask(listedTask, undefined, false)
      const sameExecution =
        previous?.type === 'shell' &&
        reported.type === 'shell' &&
        previous.startedAt === reported.startedAt
      let current = reported
      if (sameExecution && previous) {
        // Refreshing the same runtime record is not a new execution, so its
        // identity, and any pending stop bound to it, must carry across.
        current = mergeShellRefresh(previous, reported)
        bindShellIdentity(current, shellIdentityOf(previous))
      } else if (reported.type === 'shell') {
        // A reported shell that does not continue a known one is a distinct
        // execution and gets its own identity, so a stop meant for the shell
        // it replaced can never land on it.
        shellIdentityOf(current)
      }
      tasks.set(listedTask.id, current)
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
          const attachmentMode =
            kindType === 'shell_detached_started'
              ? ('detached' as const)
              : ('attached' as const)
          const reportedStatus =
            eventString(kind, 'status') === 'queued' ? 'queued' : 'running'
          const startedBy =
            eventString(kind, 'toolCallId') || eventString(data, 'toolCallId')
          const knownIdentity = startedBy
            ? launchIdentity.get(startedBy)
            : undefined
          const known = knownIdentity
            ? shellByIdentity(knownIdentity)
            : undefined
          if (startedBy && knownIdentity) {
            // This notification renames a call's own shell to the provider id.
            // It is bound to the execution the call launched, not to whatever
            // id it once held: after that id is reused by a newer launch the
            // original execution may be gone (a stale late handoff, ignored) or
            // living under a different id (rekeyed here to follow it).
            if (known && known.type === 'shell') {
              const destination = tasks.get(shellId)
              const stealsLiveSlot =
                destination !== undefined &&
                destination !== known &&
                shellInstances.get(destination) !== knownIdentity &&
                isLiveTaskStatus(destination.status)
              if (!stealsLiveSlot) {
                const moved =
                  known.id === shellId
                    ? known
                    : rekeyTask(
                        tasks,
                        aliases,
                        known,
                        shellId,
                        assumed,
                      ) || known
                moved.executionMode = 'background'
                if (attachmentMode === 'detached') {
                  moved.attachmentMode = 'detached'
                }
                // A stop already recorded against this execution stands: the
                // handoff renames the shell, it does not restart it.
                if (!isTerminalTaskStatus(moved.status)) {
                  moved.status = reportedStatus
                }
                tasks.set(moved.id, moved)
                aliases.set(startedBy, moved.id)
                aliases.set(moved.id, moved.id)
                assumedBackground.delete(moved.id)
                assumedOwners.delete(moved.id)
              }
            }
          } else {
            // A genuine native launch with no tracked originating call. It only
            // claims the reported id when no other live shell already holds it,
            // so a confused report can never displace a running job.
            const destination = tasks.get(shellId)
            const occupiedByLive =
              destination !== undefined && isLiveTaskStatus(destination.status)
            if (!occupiedByLive) {
              const current = shellTask(
                shellId,
                eventString(kind, 'startedAt') || event.timestamp,
                kind,
                {
                  executionMode: 'background',
                  attachmentMode,
                  assumed: false,
                },
              )
              current.status = reportedStatus
              shellIdentityOf(current)
              // The call that started this shell may already have a task of its
              // own, projected before any shell id was known. Left alone it
              // stays beside the reported one, so the same command is counted
              // twice and the older half never finishes.
              if (startedBy) {
                const existing = taskIdAlias(aliases, startedBy)
                if (existing !== shellId && tasks.has(existing)) {
                  tasks.delete(existing)
                  assumedBackground.delete(existing)
                  assumedOwners.delete(existing)
                }
                aliases.set(startedBy, shellId)
                launchIdentity.set(startedBy, shellIdentityOf(current))
              }
              tasks.set(shellId, current)
              aliases.set(shellId, shellId)
              // Reported by the CLI itself, so nothing about this shell is
              // being assumed any more. Left set, a turn ending could close a
              // shell the CLI had just described.
              assumedBackground.delete(shellId)
              assumedOwners.delete(shellId)
            }
          }
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
      const startedCallId = eventString(data, 'toolCallId')
      if (startedCallId) {
        toolNames.set(startedCallId, toolName)
        if (isShellStopTool(toolName)) {
          const shellId = shellIdFromValue(args)
          const task = shellId
            ? tasks.get(taskIdAlias(aliases, shellId))
            : undefined
          if (shellId && task?.type === 'shell') {
            // Bind the stop to the execution it addresses, not to the id or
            // alias. Whatever reuses that id later is a different execution and
            // this acknowledgement must never reach it.
            shellStopTargets.set(startedCallId, {
              identity: shellIdentityOf(task),
              requestedId: shellId,
            })
          }
        }
      }
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
          // A launch is always a distinct execution, even when it reuses an id
          // at the same instant a previous one ended, so it gets a fresh
          // identity and a stop meant for the earlier shell cannot follow.
          const identity = shellIdentityOf(current)
          if (mode?.assumed) {
            assumedBackground.add(current.id)
            // The owning agent can be named on the envelope or in the payload,
            // and a persisted event uses the second. Reading only the first
            // left the shell with no owner, so a foreground turn ending closed
            // work a background agent was still doing.
            const owner = event.agentId || eventString(data, 'agentId')
            if (owner) {
              assumedOwners.set(current.id, owner)
            }
          }
          tasks.set(shellId, current)
          if (toolCallId) {
            aliases.set(toolCallId, shellId)
            // Remember which execution this call launched so a later native
            // handoff for it finds the right shell even after the id is reused.
            launchIdentity.set(toolCallId, identity)
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
      // ...and only a tool that reads shells. Any other tool can return
      // content that happens to end with a completion footer -- a file being
      // read, an agent quoting a transcript -- and matching on the id would
      // close whichever live shell holds that recycled number.
      const toolName = toolNames.get(toolCallId) || normalizedToolName(data)
      const observesShells = isShellObserverTool(toolName)
      const ownedIdentity = launchIdentity.get(toolCallId)
      let current = ownedIdentity ? shellByIdentity(ownedIdentity) : tasks.get(id)
      if (ownedIdentity && !current) continue
      if (isShellStopTool(toolName)) {
        const target = shellStopTargets.get(toolCallId)
        shellStopTargets.delete(toolCallId)
        // A stop answers for the execution it addressed, wherever that
        // execution now lives, and never for a later shell that reused the
        // same id while the control request was in flight. Resolving it by
        // identity rather than by id is what keeps the two apart.
        const addressed = target
          ? shellByIdentity(target.identity)
          : undefined
        if (
          !target ||
          !addressed ||
          addressed.type !== 'shell' ||
          !isLiveTaskStatus(addressed.status)
        ) continue
        current = addressed
        if (!shellExit) {
          if (shellStopAcknowledged(data, target.requestedId, current.id)) {
            current.status = 'cancelled'
            current.completedAt = event.timestamp
            current.error = undefined
            current.canCancel = false
          }
          continue
        }
        if (taskIdAlias(aliases, shellExit.shellId) !== current.id) continue
      }
      if (!current && !ownsShellStart && observesShells && namedShellId) {
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
        const identity = shellIdentityOf(current)
        const originatingCallId = eventString(start.data, 'toolCallId') || toolCallId
        launchIdentity.set(originatingCallId, identity)
        tasks.set(backgroundId, current)
        aliases.set(originatingCallId, backgroundId)
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
              current,
              handoffShellId,
              assumed,
            ) || current
          if (isShellTool(toolName)) aliases.set(toolCallId, current.id)
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
  // Only the session shutting down ends everything in it, agents included. An
  // abort stops the turn and an error ends it, but neither disconnects the
  // session, and background work explicitly put there is meant to outlive
  // both -- which is why the foreground status treats them the same way.
  const sessionEndedAt = events.findLast(
    (event) => event.type === 'session.shutdown',
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
        // A detached shell is deliberately not the session's to end: it was
        // put outside it precisely so it would carry on, and its own process
        // may still be running long after the session has gone.
        task.attachmentMode !== 'detached' &&
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
