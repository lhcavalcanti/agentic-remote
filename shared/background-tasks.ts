import type {
  BackgroundTask,
  BackgroundTaskProgress,
  BackgroundTaskProgressLine,
  BackgroundTaskSnapshot,
  SessionDetail,
} from './contracts.js'

export function hasForegroundTurn(
  session: Pick<SessionDetail, 'status' | 'foregroundTurnActive' | 'messages' | 'pendingPermission' | 'pendingUserInput'>,
  snapshot?: BackgroundTaskSnapshot,
): boolean {
  if (session.status !== 'running') return false
  if (session.foregroundTurnActive !== undefined) return session.foregroundTurnActive
  if (!hasActiveBackgroundTasks(snapshot) && !snapshot?.runningCount) return true
  // Legacy nodes have no independent foreground bit. Background work alone
  // must not replace their valid direct-send path with an unavailable steer.
  return Boolean(session.pendingPermission || session.pendingUserInput ||
    session.messages.findLast((message) => message.role === 'assistant')?.streaming ||
    snapshot?.tasks.some((task) => task.status === 'running' && task.executionMode === 'sync'))
}

export function hasActiveBackgroundTasks(
  snapshot: BackgroundTaskSnapshot | undefined,
): boolean {
  return Boolean(
    snapshot?.tasks.some(
      (task) => task.status === 'queued' || task.status === 'running',
    ),
  )
}

export function hasRunningBackgroundAgent(
  snapshot: BackgroundTaskSnapshot | undefined,
): boolean {
  return Boolean(
    snapshot?.tasks.some(
      (task) =>
        task.type === 'agent' &&
        task.status === 'running' &&
        task.executionMode === 'background',
    ),
  )
}

/** How many characters of each long text a task summary keeps. */
export const BACKGROUND_TASK_TAIL = 300
/** As many activity lines as the tasks sheet first shows. */
const SUMMARY_ACTIVITY_LINES = 5

const isLowSurrogate = (code: number) => code >= 0xdc00 && code <= 0xdfff

/** The end of `text`, with '…' in front of it when it had to be cut. */
function tail(text: string): string {
  if (text.length <= BACKGROUND_TASK_TAIL) return text
  let start = text.length - (BACKGROUND_TASK_TAIL - 1)
  if (isLowSurrogate(text.charCodeAt(start))) start += 1
  return `…${text.slice(start)}`
}

/** The start of `text`, with '…' after it when it had to be cut. */
function head(text: string): string {
  if (text.length <= BACKGROUND_TASK_TAIL) return text
  let end = BACKGROUND_TASK_TAIL - 1
  if (isLowSurrogate(text.charCodeAt(end))) end -= 1
  return `${text.slice(0, end)}…`
}

/** The latest activity lines, as many as the sheet first shows while they fit. */
function latestActivity(lines: readonly BackgroundTaskProgressLine[]): BackgroundTaskProgressLine[] {
  const kept: BackgroundTaskProgressLine[] = []
  let length = 0
  for (let index = lines.length - 1; index >= 0 && kept.length < SUMMARY_ACTIVITY_LINES; index -= 1) {
    const message = tail(lines[index].message)
    if (kept.length && length + message.length > BACKGROUND_TASK_TAIL) break
    length += message.length
    kept.unshift({ message, timestamp: lines[index].timestamp })
  }
  return kept
}

function summarizeProgress(progress: BackgroundTaskProgress): BackgroundTaskProgress {
  const summary: BackgroundTaskProgress = { type: progress.type }
  if (progress.recentActivity?.length) summary.recentActivity = latestActivity(progress.recentActivity)
  if (progress.latestIntent) summary.latestIntent = tail(progress.latestIntent)
  if (progress.recentOutput) summary.recentOutput = tail(progress.recentOutput)
  if (progress.pid !== undefined) summary.pid = progress.pid
  return summary
}

/**
 * A task as a list carries it: what its row, the counts and its actions use.
 * A live task also keeps how it runs and the end of its command and progress.
 * Anything else -- the prompt, result, response, error, and a finished task's
 * command and progress -- is read whole when the task is opened. Summarizing
 * a summary changes nothing.
 */
export function summarizeBackgroundTask(task: BackgroundTask): BackgroundTask {
  const summary: BackgroundTask = {
    id: task.id,
    type: task.type,
    description: head(task.description),
    status: task.status,
    startedAt: task.startedAt,
    canCancel: task.canCancel,
  }
  if (task.completedAt !== undefined) summary.completedAt = task.completedAt
  if (task.activeTimeMs !== undefined) summary.activeTimeMs = task.activeTimeMs
  if (task.agentType) summary.agentType = head(task.agentType)
  if (task.status !== 'running' && task.status !== 'queued') return summary
  if (task.executionMode) summary.executionMode = task.executionMode
  if (task.attachmentMode) summary.attachmentMode = task.attachmentMode
  if (task.pid !== undefined) summary.pid = task.pid
  if (task.command) summary.command = tail(task.command)
  if (task.progress) summary.progress = summarizeProgress(task.progress)
  return summary
}

/** A task list as summaries; see `BackgroundTaskSnapshot.summary`. */
export function summarizeBackgroundTasks(snapshot: BackgroundTaskSnapshot): BackgroundTaskSnapshot {
  return {
    tasks: snapshot.tasks.map(summarizeBackgroundTask),
    runningCount: snapshot.runningCount,
    supported: snapshot.supported,
    summary: true,
  }
}
