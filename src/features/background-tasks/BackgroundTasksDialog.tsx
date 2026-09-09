import {
  CheckCircle2,
  List,
  LoaderCircle,
  RefreshCw,
  Square,
  XCircle,
} from 'lucide-react'
import type {
  BackgroundTask,
  BackgroundTaskSnapshot,
} from '../../../shared/contracts'
import { DialogFrame } from '../../components/DialogFrame'
import { orderTasksForReading } from './task-order'

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
  return `${minutes}m ${seconds % 60}s`
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

function BackgroundTaskCard({
  task,
  cancelling,
  onCancel,
}: {
  task: BackgroundTask
  cancelling: boolean
  onCancel: () => void
}) {
  const statusIcon =
    task.status === 'failed' ? (
      <XCircle size={14} />
    ) : task.status === 'completed' ? (
      <CheckCircle2 size={14} />
    ) : task.status === 'running' ? (
      <LoaderCircle className="activity-message__spinner" size={14} />
    ) : (
      <List size={14} />
    )
  const progress = task.progress
  return (
    <article className={`background-task background-task--${task.status}`}>
      <header className="background-task__header">
        <div className="background-task__title">
          <span className="background-task__status-icon">{statusIcon}</span>
          <span>
            <strong>{task.description}</strong>
            <small>
              {task.type === 'agent'
                ? task.agentType || 'Background agent'
                : task.command || 'Background shell'}
            </small>
          </span>
        </div>
        <span className="background-task__status">
          {taskStatusLabel(task.status)}
        </span>
      </header>
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
        <details className="background-task__details">
          <summary>Prompt</summary>
          <pre>{task.prompt}</pre>
        </details>
      ) : null}
      {progress?.latestIntent ? (
        <p className="background-task__intent">{progress.latestIntent}</p>
      ) : null}
      {progress?.recentActivity?.length ? (
        <div className="background-task__progress">
          <strong>Recent activity</strong>
          <ul>
            {progress.recentActivity.map((line, index) => (
              <li key={`${line.timestamp}-${index}`}>
                <time dateTime={line.timestamp}>
                  {messageTimeFormatter.format(new Date(line.timestamp))}
                </time>
                <span>{line.message}</span>
              </li>
            ))}
          </ul>
        </div>
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
      {taskIsActive(task) ? (
        <section
          aria-label={`Manage ${task.description}`}
          className="background-task__management"
        >
          <strong>Manage task</strong>
          {task.canCancel ? (
            <>
              <p>Requests a clean stop from the owning runtime.</p>
              <button
                aria-label={`Stop ${task.description}`}
                className="secondary-button background-task__stop"
                disabled={cancelling}
                onClick={onCancel}
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
                {cancelling ? 'Stopping…' : 'Stop task'}
              </button>
            </>
          ) : (
            <p className="background-task__stop-unavailable">
              <strong>Stop unavailable.</strong>{' '}
              {stopUnavailableReason(task)}
            </p>
          )}
        </section>
      ) : null}
    </article>
  )
}

export function BackgroundTasksDialog({
  open,
  sessionTitle,
  snapshot,
  loading,
  cancellingTaskId,
  onClose,
  onRefresh,
  onCancel,
}: {
  open: boolean
  sessionTitle: string
  snapshot: BackgroundTaskSnapshot
  loading: boolean
  cancellingTaskId?: string
  onClose: () => void
  onRefresh: () => void
  onCancel: (taskId: string) => void
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
        <p>
          <strong>{snapshot.runningCount}</strong>{' '}
          {snapshot.runningCount === 1
            ? 'background task is running'
            : 'background tasks are running'}
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
        <div aria-label="Background task list" className="background-task-list">
          {orderTasksForReading(snapshot.tasks).map((task) => (
            <BackgroundTaskCard
              cancelling={cancellingTaskId === task.id}
              key={task.id}
              onCancel={() => onCancel(task.id)}
              task={task}
            />
          ))}
        </div>
      )}
    </DialogFrame>
  )
}
