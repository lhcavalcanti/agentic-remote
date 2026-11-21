import {
  Ban,
  CheckCircle2,
  ChevronRight,
  List,
  LoaderCircle,
  MessageSquareText,
  RefreshCw,
  Square,
  XCircle,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import type {
  BackgroundTask,
  BackgroundTaskProgressLine,
  BackgroundTaskSnapshot,
} from '../../../shared/contracts'
import { DialogFrame } from '../../components/DialogFrame'
import { orderTasksForReading } from './task-order'
import { backgroundTaskCountLabel, backgroundTaskCounts } from './task-summary'

const messageTimeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
})

const messageDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

/** Recent activity opens on its latest entries; the rest is one choice away. */
const RECENT_ACTIVITY_SHOWN = 5

function taskStatusLabel(status: BackgroundTask['status']): string {
  return status === 'queued'
    ? 'Queued'
    : status === 'running'
      ? 'Running'
      : status === 'completed'
        ? 'Completed'
        : status === 'failed'
          ? 'Failed'
          : 'Cancelled'
}

function taskDurationLabel(milliseconds: number): string {
  const seconds = Math.max(0, Math.round(milliseconds / 1_000))
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

function taskIsActive(task: BackgroundTask): boolean {
  return task.status === 'running' || task.status === 'queued'
}

function stopUnavailableReason(task: BackgroundTask): string {
  if (task.attachmentMode === 'detached') {
    return 'This detached task has no live stop handle. End it from the provider or terminal that started it.'
  }
  return 'The owning runtime did not expose a live stop handle for this task.'
}

/** Why none of the active tasks can be stopped, said once for all of them. */
function stopUnavailableNote(active: BackgroundTask[]): string {
  if (active.length === 1) {
    return stopUnavailableReason(active[0])
  }
  return active.every((task) => task.attachmentMode === 'detached')
    ? 'These detached tasks have no live stop handle. End them from the provider or terminal that started them.'
    : 'The owning runtime did not expose a live stop handle for these tasks.'
}

function timeOf(value: string | undefined): number | undefined {
  const parsed = value ? Date.parse(value) : Number.NaN
  return Number.isNaN(parsed) ? undefined : parsed
}

/** How long a task has run: until now while it is active, otherwise until it ended. */
function taskElapsedMs(task: BackgroundTask, now: number): number | undefined {
  const started = timeOf(task.startedAt)
  const ended = taskIsActive(task) ? now : timeOf(task.completedAt)
  return started !== undefined && ended !== undefined
    ? Math.max(0, ended - started)
    : task.activeTimeMs
}

function elapsedPrefix(status: BackgroundTask['status']): string {
  return status === 'running'
    ? 'Running for'
    : status === 'queued'
      ? 'Queued for'
      : 'Ran for'
}

function TaskStatusIcon({ status }: { status: BackgroundTask['status'] }) {
  return status === 'failed' ? (
    <XCircle size={14} />
  ) : status === 'completed' ? (
    <CheckCircle2 size={14} />
  ) : status === 'running' ? (
    <LoaderCircle className="activity-message__spinner" size={14} />
  ) : status === 'cancelled' ? (
    <Ban size={14} />
  ) : (
    <List size={14} />
  )
}

/** The time, moving once a second while anything listed is still running. */
function useNow(ticking: boolean): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!ticking) {
      return
    }
    const timer = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(timer)
  }, [ticking])
  return now
}

function RecentActivity({ lines }: { lines: BackgroundTaskProgressLine[] }) {
  const [showAll, setShowAll] = useState(false)
  const headingId = useId()
  const first = showAll ? 0 : Math.max(0, lines.length - RECENT_ACTIVITY_SHOWN)
  return (
    <div className="background-task__progress">
      <strong id={headingId}>Recent activity</strong>
      <ul aria-labelledby={headingId}>
        {lines.slice(first).map((line, index) => (
          <li key={`${line.timestamp}-${first + index}`}>
            <time dateTime={line.timestamp}>
              {messageTimeFormatter.format(new Date(line.timestamp))}
            </time>
            <span>{line.message}</span>
          </li>
        ))}
      </ul>
      {lines.length > RECENT_ACTIVITY_SHOWN ? (
        <button
          aria-expanded={showAll}
          className="background-task__more"
          onClick={() => setShowAll((value) => !value)}
          type="button"
        >
          {showAll
            ? `Show last ${RECENT_ACTIVITY_SHOWN}`
            : `Show all (${lines.length})`}
        </button>
      ) : null}
    </div>
  )
}

function BackgroundTaskDetails({
  id,
  task,
  stopReason,
}: {
  id: string
  task: BackgroundTask
  stopReason?: string
}) {
  const progress = task.progress
  return (
    <div className="background-task__panel" id={id}>
      {task.type === 'agent' ? (
        <p className="background-task__source">
          {task.agentType || 'Background agent'}
        </p>
      ) : task.command ? (
        <pre className="background-task__command">
          <code>{task.command}</code>
        </pre>
      ) : null}
      <dl className="background-task__metadata">
        <div>
          <dt>Started</dt>
          <dd>
            <time dateTime={task.startedAt}>
              {messageDateTimeFormatter.format(new Date(task.startedAt))}
            </time>
          </dd>
        </div>
        {task.completedAt ? (
          <div>
            <dt>Finished</dt>
            <dd>
              <time dateTime={task.completedAt}>
                {messageDateTimeFormatter.format(new Date(task.completedAt))}
              </time>
            </dd>
          </div>
        ) : null}
        {task.activeTimeMs !== undefined ? (
          <div>
            <dt>Active time</dt>
            <dd>{taskDurationLabel(task.activeTimeMs)}</dd>
          </div>
        ) : null}
        {task.pid !== undefined || progress?.pid !== undefined ? (
          <div>
            <dt>PID</dt>
            <dd>{task.pid || progress?.pid}</dd>
          </div>
        ) : null}
      </dl>
      {task.prompt ? (
        <details className="background-task__prompt">
          <summary>Prompt</summary>
          <pre>{task.prompt}</pre>
        </details>
      ) : null}
      {progress?.latestIntent ? (
        <p className="background-task__intent">{progress.latestIntent}</p>
      ) : null}
      {progress?.recentActivity?.length ? (
        <RecentActivity lines={progress.recentActivity} />
      ) : null}
      {progress?.recentOutput ? (
        <div className="background-task__output">
          <strong>Output</strong>
          <pre>{progress.recentOutput}</pre>
        </div>
      ) : null}
      {task.result || task.latestResponse ? (
        <div className="background-task__output">
          <strong>Result</strong>
          <pre>{task.result || task.latestResponse}</pre>
        </div>
      ) : null}
      {task.error ? (
        <div className="background-task__error" role="alert">
          <strong>Error</strong>
          <pre>{task.error}</pre>
        </div>
      ) : null}
      {stopReason ? (
        <p className="background-task__stop-unavailable">
          <strong>Stop unavailable.</strong> {stopReason}
        </p>
      ) : null}
    </div>
  )
}

function BackgroundTaskRow({
  task,
  now,
  expanded,
  cancelling,
  stopDisabled,
  stopReason,
  onToggle,
  onCancel,
  onAskToStop,
}: {
  task: BackgroundTask
  now: number
  expanded: boolean
  cancelling: boolean
  stopDisabled: boolean
  /** Why this task cannot be stopped, when the sheet does not already say so. */
  stopReason?: string
  onToggle: (taskId: string) => void
  onCancel: (taskId: string) => void
  onAskToStop: (task: BackgroundTask) => void
}) {
  const panelId = useId()
  const elapsedId = useId()
  const row = useRef<HTMLLIElement>(null)
  const collapsedByReader = useRef(false)

  useLayoutEffect(() => {
    if (expanded || !collapsedByReader.current) {
      return
    }
    collapsedByReader.current = false
    // Closing pulls the rows below up, which can leave this one above the
    // view; bring it back to where the reader is.
    row.current?.scrollIntoView?.({ block: 'nearest' })
  }, [expanded])

  const kind = task.type === 'agent' ? 'Subagent' : 'Shell'
  const status = taskStatusLabel(task.status)
  const elapsed = taskElapsedMs(task, now)
  const active = taskIsActive(task)
  return (
    <li
      className={`background-task background-task--${task.status} background-task--${task.type}${
        expanded ? ' background-task--expanded' : ''
      }`}
      ref={row}
    >
      <div className="background-task__row">
        <button
          aria-controls={expanded ? panelId : undefined}
          aria-describedby={elapsed === undefined ? undefined : elapsedId}
          aria-expanded={expanded}
          aria-label={`${status} ${kind.toLowerCase()}: ${task.description}`}
          className="background-task__toggle"
          onClick={() => {
            if (expanded) {
              collapsedByReader.current = true
            }
            onToggle(task.id)
          }}
          type="button"
        >
          <span
            aria-hidden="true"
            className="background-task__status-icon"
            title={status}
          >
            <TaskStatusIcon status={task.status} />
          </span>
          <span className="background-task__title" title={task.description}>
            {task.description}
          </span>
          <span className="background-task__meta">
            <span className="background-task__kind">{kind}</span>
            {elapsed === undefined ? null : (
              <span className="background-task__elapsed" id={elapsedId}>
                <span className="visually-hidden">
                  {elapsedPrefix(task.status)}
                </span>{' '}
                {taskDurationLabel(elapsed)}
              </span>
            )}
          </span>
          <ChevronRight
            aria-hidden="true"
            className="background-task__chevron"
            size={14}
          />
        </button>
        {active && task.canCancel ? (
          <button
            aria-label={
              cancelling
                ? `Stopping task: ${task.description}`
                : `Stop task: ${task.description}`
            }
            className="secondary-button background-task__action background-task__stop"
            disabled={stopDisabled}
            onClick={() => onCancel(task.id)}
            title="Requests a clean stop from the owning runtime."
            type="button"
          >
            {cancelling ? (
              <LoaderCircle
                aria-hidden="true"
                className="activity-message__spinner"
                size={13}
              />
            ) : (
              <Square aria-hidden="true" size={12} />
            )}
            {cancelling ? 'Stopping task…' : 'Stop task'}
          </button>
        ) : active ? (
          <button
            aria-label={`Ask to stop: ${task.description}`}
            className="secondary-button background-task__action background-task__ask"
            onClick={() => onAskToStop(task)}
            title="Puts a stop request for the agent in the message box, without sending it."
            type="button"
          >
            <MessageSquareText aria-hidden="true" size={12} />
            Ask to stop
          </button>
        ) : null}
      </div>
      {expanded ? (
        <BackgroundTaskDetails id={panelId} stopReason={stopReason} task={task} />
      ) : null}
    </li>
  )
}

function BackgroundTaskList({
  tasks,
  cancellingTaskId,
  stopActionsDisabled,
  onCancel,
  onAskToStop,
}: {
  tasks: BackgroundTask[]
  cancellingTaskId?: string
  stopActionsDisabled: boolean
  onCancel: (taskId: string) => void
  onAskToStop: (task: BackgroundTask) => void
}) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set())
  const toggle = useCallback((taskId: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (!next.delete(taskId)) {
        next.add(taskId)
      }
      return next
    })
  }, [])
  const ordered = orderTasksForReading(tasks)
  const active = ordered.filter(taskIsActive)
  const now = useNow(active.length > 0)
  const stopNote =
    active.length > 0 && active.every((task) => !task.canCancel)
      ? stopUnavailableNote(active)
      : undefined
  return (
    <>
      {stopNote ? (
        <p className="background-tasks-dialog__note" role="note">
          <strong>Stop unavailable.</strong> {stopNote} Ask to stop drafts a
          request to the agent instead.
        </p>
      ) : null}
      <ul aria-label="Background task list" className="background-task-list">
        {ordered.map((task) => (
          <BackgroundTaskRow
            cancelling={cancellingTaskId === task.id}
            expanded={expanded.has(task.id)}
            key={task.id}
            now={now}
            onAskToStop={onAskToStop}
            onCancel={onCancel}
            onToggle={toggle}
            stopDisabled={stopActionsDisabled}
            stopReason={
              !stopNote && taskIsActive(task) && !task.canCancel
                ? stopUnavailableReason(task)
                : undefined
            }
            task={task}
          />
        ))}
      </ul>
    </>
  )
}

export function BackgroundTasksDialog({
  open,
  ownerKey,
  sessionTitle,
  snapshot,
  loading,
  cancellingTaskId,
  stopActionsDisabled,
  onClose,
  onRefresh,
  onCancel,
  onAskToStop,
}: {
  open: boolean
  /** The session the tasks belong to; which rows are open is kept per session. */
  ownerKey: string
  sessionTitle: string
  snapshot: BackgroundTaskSnapshot
  loading: boolean
  cancellingTaskId?: string
  stopActionsDisabled: boolean
  onClose: () => void
  onRefresh: () => void
  onCancel: (taskId: string) => void
  onAskToStop: (task: BackgroundTask) => void
}) {
  if (!open) {
    return null
  }
  return (
    <DialogFrame
      className="background-tasks-dialog"
      eyebrow="Tasks"
      onClose={onClose}
      title={`Background tasks · ${sessionTitle}`}
    >
      <div className="background-tasks-dialog__toolbar">
        <p role="status">
          {backgroundTaskCountLabel(backgroundTaskCounts(snapshot))}
        </p>
        <button
          aria-label="Refresh background tasks"
          className="icon-button"
          disabled={loading}
          onClick={onRefresh}
          type="button"
        >
          <RefreshCw
            className={loading ? 'activity-message__spinner' : ''}
            size={16}
          />
        </button>
      </div>
      {!snapshot.supported ? (
        <p className="dialog-message">
          This Copilot runtime does not expose background task monitoring.
        </p>
      ) : snapshot.tasks.length === 0 ? (
        <p className="background-tasks-dialog__empty">
          No background tasks are currently tracked.
        </p>
      ) : (
        <BackgroundTaskList
          cancellingTaskId={cancellingTaskId}
          key={ownerKey}
          onAskToStop={onAskToStop}
          onCancel={onCancel}
          stopActionsDisabled={stopActionsDisabled}
          tasks={snapshot.tasks}
        />
      )}
    </DialogFrame>
  )
}
