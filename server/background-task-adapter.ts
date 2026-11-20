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

/** Tasks registered by SDK clients rather than started by the agent. */
export interface CopilotClientTaskInfo {
  type: 'client'
  id: string
}

export interface CopilotClientTaskProgress {
  type: 'client'
}

export function isBackgroundTaskInfo(
  task: CopilotTaskInfo | CopilotClientTaskInfo,
): task is CopilotTaskInfo {
  return task.type === 'agent' || task.type === 'shell'
}

export function isBackgroundTaskProgress(
  progress: CopilotTaskProgress | CopilotClientTaskProgress | null | undefined,
): progress is CopilotTaskProgress {
  return progress?.type === 'agent' || progress?.type === 'shell'
}

export interface CopilotTasksApi {
  list: () => Promise<{ tasks: Array<CopilotTaskInfo | CopilotClientTaskInfo> }>
  refresh?: () => Promise<unknown>
  getProgress?: (params: { id: string }) => Promise<{
    progress?: CopilotTaskProgress | CopilotClientTaskProgress | null
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
  compareExecutions: (left: BackgroundTask, right: BackgroundTask) => number,
  assumed?: { flags: Set<string>; owners: Map<string, string> },
): BackgroundTask | undefined {
  const from = current.id
  if (tasks.get(from) !== current) return undefined
  const destination = tasks.get(to)
  if (
    destination && destination !== current &&
    (isLiveTaskStatus(destination.status) || !(compareExecutions(current, destination) > 0))
  ) {
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

function isOlderExecution(startedAt: string, current: BackgroundTask): boolean {
  return Date.parse(startedAt) < Date.parse(current.startedAt)
}

function sameExecutionStart(left: string, right: string): boolean {
  if (left === right) return true
  const instant = Date.parse(left)
  return Number.isFinite(instant) && instant === Date.parse(right)
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
  reported.attachmentMode ??= previous.attachmentMode
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
 * Whether the agent finished a turn of its own here. Work that belongs to a
 * turn cannot still be running after one ended.
 */
function endsForegroundTurn(
  event: SessionEvent,
  data: Record<string, unknown>,
): boolean {
  // The owning agent can be named on the envelope or in the payload, and
  // reading only the envelope took an agent's own completion for the
  // foreground turn ending.
  if (event.agentId || eventString(data, 'agentId')) {
    return false
  }
  return (
    event.type === 'assistant.turn_end' ||
    event.type === 'session.idle' ||
    event.type === 'abort' ||
    event.type === 'session.error' ||
    event.type === 'session.shutdown'
  )
}

/** A task that shares nothing with the one it copies. */
function copyTask(task: BackgroundTask): BackgroundTask {
  const copy = { ...task }
  if (task.progress) {
    copy.progress = { ...task.progress }
    if (task.progress.recentActivity) {
      copy.progress.recentActivity = task.progress.recentActivity.map(
        (line) => ({ ...line }),
      )
    }
  }
  return copy
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

/** A background-task projection that takes in its log a few events at a time. */
export interface BackgroundTaskProjector {
  /** Takes in events that follow every event applied so far. */
  apply(events: readonly SessionEvent[]): void
  /**
   * The tasks as of the events applied so far, as fresh copies a caller can
   * keep or change without affecting the projector.
   */
  tasks(): BackgroundTask[]
}

/** Projects a whole log at once. */
export function backgroundTasksFromEvents(
  events: readonly SessionEvent[],
  options: BackgroundTaskEventOptions = {},
): BackgroundTask[] {
  const projector = createBackgroundTaskProjector(options)
  projector.apply(events)
  return projector.tasks()
}

/**
 * The projection as state that persists between calls, so a growing log costs
 * only its new events. Applying a log in any number of pieces gives the same
 * tasks as applying it whole.
 */
export function createBackgroundTaskProjector(
  options: BackgroundTaskEventOptions = {},
): BackgroundTaskProjector {
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
  const aliases = new Map<string, string>()
  // Multi-turn agents that finished processing and wait, idle, for another
  // message. Only these can start working again after ending.
  const idleAgents = new Set<string>()
  // Idle agents a message woke. Copilot announces idling again only to a
  // parent that is not already waiting for the reply, so a woken agent's run
  // ends, like the foreground's, with a turn end no turn start follows.
  const wokenAgents = new Set<string>()
  // Log position at which each agent last stopped working. Positions, not
  // timestamps: events written in the same millisecond still have an order.
  const agentEndedOrder = new Map<string, number>()
  let eventOrder = -1
  type ShellIdentity = {
    startedAt: string
    creationOrder: number
    toolCallId?: string
    start?: {
      id: string
      timestamp: string
      data: Record<string, unknown>
      mode?: ReturnType<typeof shellTaskMode>
    }
    materialized: boolean
    exitCode?: number
    completion?: Pick<BackgroundTask, 'status' | 'completedAt' | 'error' | 'progress'>
    ids: Set<string>
    /** The subagent that started the shell, when one did. */
    owner?: string
    /** Log position and time of the latest event that showed it running. */
    seenRunningOrder?: number
    seenRunningAt?: string
  }
  // A per-execution handle that stays with a shell through metadata refreshes,
  // provider-id rekeys and native handoffs, even before a synchronous launch
  // has a background row. Pending controls and observations bind to this
  // handle, never to the mutable alias that another execution may reuse.
  const shellInstances = new WeakMap<BackgroundTask, ShellIdentity>()
  const shellTasksByIdentity = new Map<ShellIdentity, BackgroundTask>()
  const shellIdentitiesById = new Map<string, ShellIdentity>()
  const shellIdentitiesByStart = new Map<string, Map<string | number, ShellIdentity | null>>()
  const reusedShellIds = new Set<string>()
  let shellCreationOrder = 0
  const startKey = (startedAt: string): string | number => {
    const instant = Date.parse(startedAt)
    return Number.isFinite(instant) ? instant : startedAt
  }
  const claimShellId = (id: string, identity: ShellIdentity): void => {
    const previous = shellIdentitiesById.get(id)
    if (previous && previous !== identity) reusedShellIds.add(id)
    shellIdentitiesById.set(id, identity)
    const starts = shellIdentitiesByStart.get(id) || new Map<string | number, ShellIdentity | null>()
    const key = startKey(identity.startedAt)
    // Explicit launches with tied clocks still have different identities.
    // Such a timestamp alone can no longer identify a native completion.
    starts.set(key, starts.has(key) && starts.get(key) !== identity ? null : identity)
    shellIdentitiesByStart.set(id, starts)
    identity.ids.add(id)
  }
  const bindShellIdentity = (
    task: BackgroundTask,
    identity: ShellIdentity,
    claimId = true,
  ): void => {
    identity.materialized = true
    shellInstances.set(task, identity)
    shellTasksByIdentity.set(identity, task)
    if (claimId) claimShellId(task.id, identity)
  }
  // Which execution a launching call created, kept by the call's own id so a
  // late handoff for that call can find its original execution even after the
  // id it once held has been reused by a newer launch.
  const launchIdentity = new Map<string, ShellIdentity>()
  const shellObserverTargets = new Map<
    string,
    { identity?: ShellIdentity; requestedId: string }
  >()
  const shellIdentityOf = (task: BackgroundTask): ShellIdentity => {
    const existing = shellInstances.get(task)
    if (existing) {
      return existing
    }
    const identity: ShellIdentity = {
      startedAt: task.startedAt, creationOrder: shellCreationOrder++,
      materialized: false, ids: new Set(),
    }
    bindShellIdentity(task, identity)
    return identity
  }
  const shellByIdentity = (identity: ShellIdentity): BackgroundTask | undefined => {
    const task = shellTasksByIdentity.get(identity)
    return task?.type === 'shell' && tasks.get(task.id) === task &&
      shellInstances.get(task) === identity ? task : undefined
  }
  const assumed = { flags: assumedBackground, owners: assumedOwners }
  const shellIdentityAt = (id: string): ShellIdentity | undefined =>
    shellIdentitiesById.get(id) ||
    shellIdentitiesById.get(taskIdAlias(aliases, id))
  const compareShellExecutions = (
    left: ShellIdentity | BackgroundTask,
    right: ShellIdentity | BackgroundTask,
  ): number => {
    const leftIdentity = 'creationOrder' in left ? left : shellInstances.get(left)
    const rightIdentity = 'creationOrder' in right ? right : shellInstances.get(right)
    const leftStart = (leftIdentity || left).startedAt
    const rightStart = (rightIdentity || right).startedAt
    const difference = Date.parse(leftStart) - Date.parse(rightStart)
    if (Number.isFinite(difference) && difference !== 0) return difference
    // Tied or unparseable clocks need retained execution order, not the
    // arrival of a refresh or delayed handoff. Without both identities,
    // callers must reject an unordered comparison rather than fail open.
    if (leftIdentity && rightIdentity) {
      return leftIdentity.creationOrder - rightIdentity.creationOrder
    }
    return difference
  }
  const isStaleUnboundShellStart = (
    id: string,
    startedAt: string,
    distinctCall = false,
  ): boolean => {
    const owner = shellIdentitiesById.get(id)
    // An explicit sync launch owns its id before it has a task row. Unbound
    // reports must respect that owner, and tied starts need call provenance.
    return Boolean(owner && Date.parse(startedAt) < Date.parse(owner.startedAt)) ||
      (!distinctCall && shellIdentitiesByStart.get(id)?.get(startKey(startedAt)) === null)
  }
  const rekeyShellTask = (
    current: BackgroundTask,
    to: string,
  ): BackgroundTask | undefined => {
    const destination = shellIdentitiesById.get(to)
    if (
      destination && !destination.materialized &&
      !(compareShellExecutions(current, destination) > 0)
    ) return undefined
    const moved = rekeyTask(tasks, aliases, current, to, compareShellExecutions, assumed)
    if (moved) claimShellId(to, shellIdentityOf(moved))
    return moved
  }
  const materializeShell = (
    identity: ShellIdentity,
    id: string,
    mode: NonNullable<ReturnType<typeof shellTaskMode>>,
  ): BackgroundTask | undefined => {
    if (identity.materialized) return shellByIdentity(identity)
    const start = identity.start
    if (!start || shellIdentitiesById.get(start.id) !== identity) return undefined
    const destination = tasks.get(id)
    const destinationIdentity = shellIdentitiesById.get(id)
    if (
      // An admitted new launch may already own the requested id while the
      // prior execution's row is waiting for its stop acknowledgement.
      destination && destinationIdentity !== identity &&
      (isLiveTaskStatus(destination.status) ||
        !(compareShellExecutions(identity, destination) > 0))
    ) return undefined
    if (
      destinationIdentity && destinationIdentity !== identity &&
      !(compareShellExecutions(identity, destinationIdentity) > 0)
    ) return undefined
    const current = {
      ...shellTask(id, start.timestamp, start.data, {
        ...mode,
        attachmentMode: mode.attachmentMode ?? start.mode?.attachmentMode ?? 'attached',
      }),
      ...identity.completion,
    }
    bindShellIdentity(current, identity)
    tasks.set(id, current)
    aliases.set(start.id, id)
    if (identity.toolCallId) aliases.set(identity.toolCallId, id)
    aliases.set(id, id)
    return current
  }

  const finishShellTask = (
    shellId: string,
    timestamp: string,
    data: Record<string, unknown>,
  ): void => {
    const toolCallId = eventString(data, 'toolCallId')
    const startedAt = eventString(data, 'startedAt') || eventString(data, 'started_at')
    const byCall = toolCallId ? launchIdentity.get(toolCallId) : undefined
    const byStart = startedAt
      ? shellIdentitiesByStart.get(shellId)?.get(startKey(startedAt))
      : undefined
    if (!byCall && byStart === null) return
    const identity = byCall || byStart || shellIdentityAt(shellId)
    if (identity) {
      if (startedAt && !sameExecutionStart(identity.startedAt, startedAt)) return
      if (
        toolCallId && toolCallId !== identity.toolCallId &&
        (identity.toolCallId || !startedAt)
      ) return
      // A bare native shell id is sufficient only until that id has denoted
      // multiple executions. Otherwise a delayed legacy exit is ambiguous.
      if (!toolCallId && !startedAt && reusedShellIds.has(shellId)) return
    }
    let current = identity ? shellByIdentity(identity) : undefined
    if (identity && !current) {
      current = materializeShell(
        identity,
        shellId,
        identity.start?.mode || {
          executionMode: 'background',
          attachmentMode:
            data.type === 'shell_detached_completed' ? 'detached' : 'attached',
          assumed: false,
        },
      )
      if (!current) return
    }
    if (!current) {
      if (tasks.has(shellId)) return
      current = {
        type: 'shell',
        id: shellId,
        description: 'Background shell',
        status: 'running',
        startedAt:
          startedAt || timestamp,
        executionMode: 'background',
        attachmentMode: 'detached',
        canCancel: false,
      }
      const createdIdentity = shellIdentityOf(current)
      if (toolCallId) {
        createdIdentity.toolCallId = toolCallId
        launchIdentity.set(toolCallId, createdIdentity)
      }
      tasks.set(shellId, current)
      aliases.set(shellId, shellId)
    }
    if (current.id !== shellId && !identity?.ids.has(shellId)) {
      const moved = rekeyShellTask(current, shellId)
      if (!moved) return
      current = moved
    }
    if (identity?.completion) return
    const exitCode = numberValue(data.exitCode)
    const currentIdentity = shellIdentityOf(current)
    if (currentIdentity.exitCode !== undefined) {
      if (currentIdentity.exitCode === exitCode) shellTaskOutput(current, data)
      return
    }
    currentIdentity.exitCode = exitCode
    current.status =
      data.cancelled === true
        ? 'cancelled'
        : exitCode !== undefined && exitCode !== 0
          ? 'failed'
          : current.status === 'cancelled' || (exitCode === undefined && current.status === 'failed')
            ? current.status
            : 'completed'
    current.completedAt ??= timestamp
    current.description =
      boundedText(eventString(data, 'description')) || current.description
    if (current.status === 'failed') {
      current.error =
        errorValue(data) ||
        (exitCode === undefined
          ? current.error || 'Shell task failed'
          : `Shell exited with status ${exitCode}`)
    } else {
      current.error = undefined
    }
    shellTaskOutput(current, data)
    current.canCancel = false
  }

  // What only the end of the log decides, kept up as the log goes by: when
  // the agent last finished a turn of its own, and when the session last shut
  // down. Only the session shutting down ends everything in it, agents
  // included. An abort stops the turn and an error ends it, but neither
  // disconnects the session, and background work explicitly put there is
  // meant to outlive both -- which is why the foreground status treats them
  // the same way.
  let lastTurnEndAt: string | undefined
  let sessionEndedAt: string | undefined
  const apply = (events: readonly SessionEvent[]): void => {
    for (const event of events) {
      eventOrder += 1
      const data = recordValue(event.data)
      if (endsForegroundTurn(event, data)) {
        lastTurnEndAt = event.timestamp
      }
      if (event.type === 'session.shutdown') {
        sessionEndedAt = event.timestamp
      }
      if (
        event.type === 'session.start' ||
        event.type === 'session.resume' ||
        event.type === 'session.shutdown'
      ) {
        for (const task of tasks.values()) {
          if (
            (task.status === 'running' || task.status === 'queued') &&
            task.attachmentMode !== 'detached'
          ) {
            task.status = 'failed'
            task.completedAt = event.timestamp
            task.error = task.error || 'Ended without reporting completion'
            task.canCancel = false
          }
        }
        // A restarted process has none of its old agents left to wake.
        idleAgents.clear()
        wokenAgents.clear()
      }
      if (
        event.agentId &&
        (event.type === 'user.message' ||
          event.type === 'assistant.turn_start' ||
          event.type === 'assistant.turn_end')
      ) {
        const id = taskIdAlias(aliases, event.agentId)
        const current = tasks.get(id)
        if (current?.type === 'agent') {
          if (event.type === 'assistant.turn_end') {
            if (wokenAgents.delete(id) && current.status === 'running') {
              current.status = 'completed'
              current.completedAt = event.timestamp
              idleAgents.add(id)
              agentEndedOrder.set(id, eventOrder)
            }
          } else if (idleAgents.delete(id) && current.status === 'completed') {
            // A message woke an idle agent: it works until it idles again.
            current.status = 'running'
            current.completedAt = undefined
            wokenAgents.add(id)
            agentEndedOrder.delete(id)
          }
        }
      }
      const completingCallId = event.type === 'tool.execution_complete'
        ? eventString(data, 'toolCallId')
        : undefined
      const observerTarget = completingCallId ? shellObserverTargets.get(completingCallId) : undefined
      const completingIdentity = completingCallId ? launchIdentity.get(completingCallId) : undefined
      const listedTasks = [
        ...taskInfoListFromValue(data),
        ...taskInfoListFromValue(data.result),
      ]
      for (const listedTask of listedTasks) {
        let previous = tasks.get(listedTask.id)
        const reported = normalizeBackgroundTask(listedTask, undefined, false)
        if (observerTarget || completingIdentity) {
          const identity = observerTarget?.identity || completingIdentity
          if (
            !identity || reported.type !== 'shell' || data.success !== true ||
            (observerTarget && identity.completion) ||
            !sameExecutionStart(identity.startedAt, reported.startedAt) ||
            (observerTarget && reported.id !== observerTarget.requestedId && !identity.ids.has(reported.id))
          ) continue
          previous = shellByIdentity(identity) ||
            materializeShell(identity, reported.id, {
              executionMode: 'background', attachmentMode: reported.attachmentMode, assumed: false,
            })
          if (!previous) continue
          // Bound metadata refreshes the captured execution at its current id,
          // not a replacement now occupying the requested alias.
          reported.id = previous.id
        } else if (reported.type === 'shell') {
          const identity = shellIdentitiesByStart.get(reported.id)?.get(startKey(reported.startedAt))
          if (identity === null) continue
          if (identity?.materialized) {
            // Inventory may still name a historical alias after a provider
            // rekey. Refresh the indexed execution at its current id, never
            // reclaim that alias or re-create an execution that was replaced.
            previous = shellByIdentity(identity)
            if (!previous) continue
            reported.id = previous.id
          }
          if (isStaleUnboundShellStart(reported.id, reported.startedAt)) continue
        }
        if (
          previous?.type === 'shell' && reported.type === 'shell' &&
          isOlderExecution(reported.startedAt, previous)
        ) continue
        const sameExecution =
          previous?.type === 'shell' &&
          reported.type === 'shell' &&
          sameExecutionStart(previous.startedAt, reported.startedAt)
        let current = reported
        if (sameExecution && previous) {
          // Refreshing the same runtime record is not a new execution, so its
          // identity, and any pending stop bound to it, must carry across.
          current = mergeShellRefresh(previous, reported)
          bindShellIdentity(current, shellIdentityOf(previous), false)
        } else if (reported.type === 'shell') {
          // A reported shell that does not continue a known one is a distinct
          // execution and gets its own identity, so a stop meant for the shell
          // it replaced can never land on it.
          const pending = shellIdentitiesById.get(reported.id)
          if (
            pending?.start && !pending.materialized &&
            sameExecutionStart(pending.startedAt, reported.startedAt)
          ) {
            const materialized = materializeShell(pending, reported.id, {
              executionMode: 'background', attachmentMode: reported.attachmentMode, assumed: false,
            })
            if (!materialized) continue
            current = mergeShellRefresh(materialized, reported)
            bindShellIdentity(current, pending)
          } else {
            shellIdentityOf(current)
          }
        }
        if (current.type === 'agent') {
          if (!isTerminalTaskStatus(current.status)) {
            agentEndedOrder.delete(current.id)
          } else if (!previous || !isTerminalTaskStatus(previous.status)) {
            agentEndedOrder.set(current.id, eventOrder)
          }
        }
        tasks.set(current.id, current)
        aliases.set(current.id, current.id)
        // The CLI has reported this task itself, so nothing about it is being
        // assumed any more and the turn ending must not end it.
        assumedBackground.delete(current.id)
        assumedOwners.delete(current.id)
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
            const reportedStartedAt = eventString(kind, 'startedAt')
            const byCall = startedBy ? launchIdentity.get(startedBy) : undefined
            if (
              !byCall &&
              isStaleUnboundShellStart(shellId, reportedStartedAt || event.timestamp, Boolean(startedBy))
            ) continue
            const pending = shellIdentitiesById.get(shellId)
            const matchesPending = pending?.start && !pending.materialized &&
              reportedStartedAt && sameExecutionStart(pending.startedAt, reportedStartedAt)
            const knownIdentity = startedBy
              ? byCall
              : matchesPending ? pending : undefined
            const known = knownIdentity
              ? shellByIdentity(knownIdentity) ||
                materializeShell(knownIdentity, shellId, {
                  executionMode: 'background', attachmentMode, assumed: false,
                })
              : undefined
            if (knownIdentity) {
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
                const replacesNewerExecution =
                  destination !== undefined && destination !== known &&
                  !(compareShellExecutions(known, destination) > 0)
                if (!stealsLiveSlot && !replacesNewerExecution) {
                  const moved =
                    known.id === shellId
                      ? known
                      : rekeyShellTask(known, shellId) || known
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
                  if (startedBy) aliases.set(startedBy, moved.id)
                  aliases.set(moved.id, moved.id)
                  assumedBackground.delete(moved.id)
                  assumedOwners.delete(moved.id)
                }
              }
            } else {
              const destination = tasks.get(shellId)
              if (
                destination && reportedStartedAt &&
                isOlderExecution(reportedStartedAt, destination)
              ) continue
              const sameExecution =
                !startedBy && destination?.type === 'shell' &&
                reportedStartedAt !== undefined &&
                sameExecutionStart(destination.startedAt, reportedStartedAt)
              if (sameExecution && destination) {
                destination.executionMode = 'background'
                if (attachmentMode === 'detached') destination.attachmentMode = 'detached'
                if (!isTerminalTaskStatus(destination.status)) destination.status = reportedStatus
                assumedBackground.delete(shellId)
                assumedOwners.delete(shellId)
              } else if (
                !destination || destination.type === 'shell' ||
                !isLiveTaskStatus(destination.status)
              ) {
                // A new native execution may reuse an id before the prior stop
                // reply arrives. Give it a new identity so that old reply cannot
                // close it. Never replace an unrelated live task kind.
                const current = shellTask(
                  shellId,
                  reportedStartedAt || event.timestamp,
                  kind,
                  {
                    executionMode: 'background',
                    attachmentMode,
                    assumed: false,
                  },
                )
                current.status = reportedStatus
                shellIdentityOf(current)
                if (startedBy) {
                  aliases.set(startedBy, shellId)
                  const identity = shellIdentityOf(current)
                  identity.toolCallId = startedBy
                  launchIdentity.set(startedBy, identity)
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
            finishShellTask(shellId, event.timestamp, {
              ...kind,
              toolCallId: eventString(kind, 'toolCallId') || eventString(data, 'toolCallId'),
              startedAt: eventString(kind, 'startedAt') || eventString(kind, 'started_at') ||
                eventString(data, 'startedAt') || eventString(data, 'started_at'),
            })
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
              // Idle is finished processing, not waiting to start: the agent
              // only waits for another message, which wakes it above. Keeping it
              // live left every multi-turn agent a session ever ran listed as
              // work until its process restarted.
              current.status = 'completed'
              current.completedAt = event.timestamp
              current.result = textFromValue(kind.result) || current.result
              current.latestResponse =
                textFromValue(kind.latestResponse) || current.latestResponse
              current.canCancel = false
              idleAgents.add(id)
              wokenAgents.delete(id)
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
            agentEndedOrder.set(id, eventOrder)
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
          if (isShellObserverTool(toolName) && !isShellTool(toolName)) {
            const shellId = shellIdFromValue(args)
            if (shellId) {
              // An unknown target is captured too: a shell that appears after
              // this request started cannot be what the request observed.
              shellObserverTargets.set(startedCallId, {
                identity: shellIdentityAt(shellId),
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
          const identity: ShellIdentity = {
            startedAt: event.timestamp, creationOrder: shellCreationOrder++,
            toolCallId, materialized: false, ids: new Set(),
            owner: event.agentId || eventString(data, 'agentId'),
            seenRunningOrder: eventOrder,
            seenRunningAt: event.timestamp,
          }
          if (toolCallId && shellId) {
            identity.start = {
              id: shellId,
              timestamp: event.timestamp,
              data,
              mode,
            }
            launchIdentity.set(toolCallId, identity)
          }
          if (shellId) claimShellId(shellId, identity)
          if (mode && shellId) {
            const current = shellTask(shellId, event.timestamp, data, mode)
            // A launch is always a distinct execution, even when it reuses an id
            // at the same instant a previous one ended, so it gets a fresh
            // identity and a stop meant for the earlier shell cannot follow.
            bindShellIdentity(current, identity)
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
        const previous = tasks.get(id)
        const current =
          event.type === 'subagent.started' &&
            previous &&
            isTerminalTaskStatus(previous.status)
            ? eventTask(id, event.timestamp, data, assumeBackground)
            : previous || eventTask(id, event.timestamp, data, assumeBackground)
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
          agentEndedOrder.delete(id)
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
          agentEndedOrder.set(id, eventOrder)
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
        const ownsShellStart = launchIdentity.has(toolCallId)
        // ...and only a tool that reads shells. Any other tool can return
        // content that happens to end with a completion footer -- a file being
        // read, an agent quoting a transcript -- and matching on the id would
        // close whichever live shell holds that recycled number.
        const toolName = toolNames.get(toolCallId) || normalizedToolName(data)
        const observesShells = isShellObserverTool(toolName)
        const ownedIdentity = launchIdentity.get(toolCallId)
        let current = ownedIdentity ? shellByIdentity(ownedIdentity) : tasks.get(id)
        if (ownedIdentity?.materialized && !current) continue
        const target = shellObserverTargets.get(toolCallId)
        if (isShellStopTool(toolName) && data.success !== true) continue
        if (target?.identity?.completion) continue
        if (target?.identity?.start && !target.identity.materialized) {
          const start = target.identity.start
          const matchesTarget = !namedShellId ||
            namedShellId === target.requestedId || namedShellId === start.id
          const hasOutcome = shellExit || (isShellStopTool(toolName)
            ? shellStopAcknowledged(data, target.requestedId, start.id)
            : data.success === true)
          if (matchesTarget && hasOutcome) {
            // An observer can finish or read a sync execution before its launch
            // result arrives. Keep that evidence on the captured execution, but
            // do not count it as background until a real handoff says so.
            materializeShell(target.identity, start.id, start.mode || {
              executionMode: 'sync', attachmentMode: 'attached', assumed: false,
            })
          }
        }
        if (isShellStopTool(toolName)) {
          // A stop answers for the execution it addressed, wherever that
          // execution now lives, and never for a later shell that reused the
          // same id while the control request was in flight. Resolving it by
          // identity rather than by id is what keeps the two apart.
          const addressed = target?.identity
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
              shellTaskOutput(current, data.result)
            }
            continue
          }
          if (
            shellExit.shellId !== target.requestedId &&
            shellExit.shellId !== current.id
          ) continue
        } else if (target) {
          const addressed = target.identity ? shellByIdentity(target.identity) : undefined
          if (!addressed || (!isLiveTaskStatus(addressed.status) && !shellExit)) continue
          if (
            namedShellId &&
            namedShellId !== target.requestedId &&
            namedShellId !== addressed.id
          ) continue
          current = addressed
        }
        if (!current && !ownsShellStart && observesShells && namedShellId) {
          if (!reusedShellIds.has(namedShellId)) {
            const observedIdentity = shellIdentityAt(namedShellId)
            current = observedIdentity ? shellByIdentity(observedIdentity) : undefined
          }
        }
        if (observesShells && !isShellTool(toolName) && !shellExit) {
          // Reading an attached shell does not complete it; a failed read is
          // likewise not evidence that the process failed. Only explicit exit
          // evidence (handled below) may change the observed lifecycle.
          if (current?.type === 'shell' && isLiveTaskStatus(current.status) && data.success === true) {
            shellTaskOutput(current, data.result)
            const observed = shellInstances.get(current)
            if (observed) {
              observed.seenRunningOrder = eventOrder
              observed.seenRunningAt = event.timestamp
            }
          }
          continue
        }
        const handoffMode = backgroundHandoff(data)
        if (!current && ownedIdentity?.start && handoffMode) {
          current = materializeShell(
            ownedIdentity,
            shellId || ownedIdentity.start.id,
            handoffMode,
          )
        }
        if (!current && ownedIdentity?.start && !handoffMode) {
          // Ordinary foreground completion is retained on the identity, not in
          // the task map. A later observer cannot expose it as still running;
          // an actual handoff can expose the already terminal execution.
          current = {
            ...shellTask(ownedIdentity.start.id, ownedIdentity.startedAt, ownedIdentity.start.data, {
              executionMode: 'sync', attachmentMode: 'attached', assumed: false,
            }),
            ...ownedIdentity.completion,
          }
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
            const handedOff = shellInstances.get(current)
            if (handedOff) {
              handedOff.seenRunningOrder = eventOrder
              handedOff.seenRunningAt = event.timestamp
            }
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
              rekeyShellTask(current, handoffShellId) || current
            if (isShellTool(toolName)) aliases.set(toolCallId, current.id)
          }
          if (isTerminalTaskStatus(current.status) && !(target && shellExit)) continue
          if (shellExit) {
            const identity = shellIdentityOf(current)
            if (identity.exitCode !== undefined && identity.exitCode !== shellExit.exitCode) continue
            if (identity.exitCode === undefined) {
              // A bound read may finish after inventory or a stop closed the
              // row. Explicit exit evidence outranks inventory, while a clean
              // exit does not undo cancellation. The first known exit stands.
              current.status = shellExit.exitCode !== 0
                ? 'failed'
                : current.status === 'cancelled' ? 'cancelled' : 'completed'
              current.completedAt ??= event.timestamp
              current.error =
                current.status === 'failed'
                  ? `Shell exited with status ${shellExit.exitCode}`
                  : undefined
              identity.exitCode = shellExit.exitCode
            }
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
          if (!shellExit && (!handoffMode || !current.progress?.recentOutput)) {
            shellTaskOutput(current, data.result)
          }
          if (ownedIdentity && current.executionMode === 'sync' && isTerminalTaskStatus(current.status)) {
            ownedIdentity.completion = {
              status: current.status,
              completedAt: current.completedAt,
              error: current.error,
              progress: current.progress,
            }
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
  }
  /**
   * The tasks as of the events applied so far. What the end of the log decides
   * is settled on copies, never in the projection, so a later event still finds
   * a swept shell running, exactly as a scan of the longer log would.
   */
  const tasksAsOfNow = (): BackgroundTask[] => {
    // Only a live shell is ever swept, so only those are copied to sweep.
    const swept = new Map<BackgroundTask, BackgroundTask>()
    for (const task of tasks.values()) {
      if (task.type === 'shell' && isLiveTaskStatus(task.status) && !swept.has(task)) {
        swept.set(task, { ...task })
      }
    }
    const settled = (task: BackgroundTask): BackgroundTask => swept.get(task) || task
    const settledAt = (id: string): BackgroundTask | undefined => {
      const task = tasks.get(id)
      return task && settled(task)
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
    for (const original of tasks.values()) {
      const task = settled(original)
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
        const owner = settledAt(taskIdAlias(aliases, ownerId))
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
    // Copilot reports a subagent's shell finishing only to that subagent, never
    // in this log, so nothing here can close it. The subagent waits on its own
    // shells, though: once it has stopped working since anything last showed
    // the shell running, it is not waiting on that shell any more. A detached
    // shell is meant to outlive it and is left alone.
    for (const original of tasks.values()) {
      const task = settled(original)
      if (
        task.type !== 'shell' ||
        !isLiveTaskStatus(task.status) ||
        task.attachmentMode === 'detached'
      ) {
        continue
      }
      const identity = shellInstances.get(original)
      if (!identity?.owner) continue
      const ownerId = taskIdAlias(aliases, identity.owner)
      const owner = settledAt(ownerId)
      if (
        owner?.type !== 'agent' ||
        !isTerminalTaskStatus(owner.status) ||
        !owner.completedAt ||
        identity.seenRunningOrder === undefined ||
        !identity.seenRunningAt
      ) {
        continue
      }
      const ownerEnded = agentEndedOrder.get(ownerId)
      const stoppedSinceSeen = ownerEnded !== undefined
        ? ownerEnded > identity.seenRunningOrder
        // Ended where no position is kept: the clock is all there is, and a tie
        // counts as after, since any later sighting of the shell undoes it
        // while the other way round nothing would.
        : Date.parse(owner.completedAt) >= Date.parse(identity.seenRunningAt)
      if (!stoppedSinceSeen) continue
      task.status = 'failed'
      task.completedAt = owner.completedAt
      task.error = task.error || 'Ended without reporting completion'
      task.canCancel = false
    }
    return [...tasks.values()]
      .map(settled)
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
      .map(copyTask)
  }

  return { apply, tasks: tasksAsOfNow }
}
