import { useEffect, useRef } from 'react'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, GripVertical, Monitor, Pause, Play, Plus, RefreshCw, Search, X } from 'lucide-react'
import type {
  BackgroundTaskSnapshot,
  ComputerSummary,
  ManagedSession,
} from '../shared/contracts'
import { hasActiveBackgroundTasks } from '../shared/background-tasks'
import {
  computerTone,
  executionModeName,
  providerName,
  sessionActivityTime,
  sessionKey,
  sessionPresentation,
  sessionSortFrom,
  shortPath,
  taskSnapshot,
} from './session-presentation'
import type { SessionPresentation, SessionSort } from './session-presentation'
import type { SessionFilter, SessionNavigationView } from './session-navigation-view'

export type PendingSessionCreation = Pick<
  ManagedSession,
  'computerId' | 'cwd' | 'executionMode' | 'provider'
> & {
  id: string
  /** The shown session the created one will precede; absent when it lands last. */
  before?: string
}

const sessionListScrollStorageKey = 'agentic-remote:session-list-scroll-v1'

type SessionActions = {
  /** `computerId:sessionId` of the sessions Oracle started. */
  managedSessions?: ReadonlySet<string>
  onSelectSession: (session: ManagedSession) => void
  onOpenSessionTasks: (session: ManagedSession) => void
  onCloseSession: (session: ManagedSession) => void
  onToggleSessionSuspended: (session: ManagedSession) => void
  /** `computerId:sessionId` of the sessions whose close is in flight. */
  closingSessions: ReadonlySet<string>
  /** `computerId:sessionId` of the sessions whose suspend or resume is in flight. */
  suspendingSessions: ReadonlySet<string>
}

export function SessionState({ presentation }: {
  presentation: SessionPresentation
}) {
  const dotState = presentation.state === 'question' || presentation.state === 'permission'
    ? 'waiting'
    : presentation.state === 'tasks' ? 'running' : presentation.state
  return (
    <span
      className={`session-state session-state--${presentation.state}`}
      title={presentation.description}
    >
      <span aria-hidden="true" className={`status-dot status-dot--${dotState}`} />
      {presentation.label}
    </span>
  )
}

function PendingSessionItem({
  creation,
  computerName,
  position,
}: {
  creation: PendingSessionCreation
  computerName: string
  position: number
}) {
  const description = `Creating ${providerName(creation.provider)} session on ${computerName} in ${creation.cwd}`
  const rowRef = useRef<HTMLDivElement>(null)
  // Its place can be below the visible part of a long list, and a new sort or
  // another session arriving can move it there.
  useEffect(() => {
    rowRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [position])
  return (
    <div
      ref={rowRef}
      aria-label={description}
      className={`session-item session-item--creating session-item--tone-${computerTone(
        creation.computerId,
      )}`}
      role="status"
      title={description}
    >
      <span aria-hidden="true" className="session-item__creating-mark">
        <span className="session-creation-dots">
          <i className="session-creation-dot" />
          <i className="session-creation-dot" />
          <i className="session-creation-dot" />
        </span>
      </span>
      <span className="session-item__text">
        <span className="session-item__badges">
          <em className="provider-badge">
            {creation.provider === 'claude' ? 'Claude' : 'Copilot'}
          </em>
          <em className="provider-badge session-mode-badge">
            {executionModeName(creation.executionMode)}
          </em>
          <span className="session-state session-state--running">Creating</span>
        </span>
        <strong>Creating session</strong>
        <small className="session-item__where">
          <span className="session-item__cwd">{shortPath(creation.cwd)}</span>
        </small>
      </span>
    </div>
  )
}

function SortableSessionItem({
  session,
  selected,
  backgroundTasks,
  computerName,
  online,
  reorderDisabled,
  sorting,
  onSelectSession,
  onOpenSessionTasks,
  onCloseSession,
  onToggleSessionSuspended,
  closingSessions,
  suspendingSessions,
  managedSessions,
}: SessionActions & {
  session: ManagedSession
  selected: boolean
  backgroundTasks?: BackgroundTaskSnapshot
  computerName: string
  online: boolean
  reorderDisabled: boolean
  sorting: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `session:${sessionKey(session)}`,
    disabled: reorderDisabled || sorting,
  })
  const presentation = sessionPresentation(session, backgroundTasks, online)
  const activity = sessionActivityTime(session.updatedAt)
  const runningBackgroundTasks = backgroundTasks?.runningCount || 0
  // Each session waits only for its own close or suspend; the owning computer
  // serializes lifecycle work per session, so others can go at the same time.
  const closing = closingSessions.has(sessionKey(session))
  const suspending = suspendingSessions.has(sessionKey(session))
  const closeUnavailable = !online || closing
  // The owning computer refuses on any of these, so offering the button only
  // led to an error. Queued work counts although runningCount leaves it out.
  const retained = Boolean(session.interruption || session.archivedAt)
  const busy = session.status !== 'idle' ||
    Boolean(session.pendingUserInput || session.pendingPermission)
  const ownsTasks = runningBackgroundTasks > 0 || hasActiveBackgroundTasks(backgroundTasks)
  const suspendUnavailable =
    !online || suspending || (!session.suspended && (retained || busy || ownsTasks))
  return (
    <div
      className={`session-item session-item--tone-${computerTone(
        session.computerId,
      )} ${presentation.working && runningBackgroundTasks > 0 ? 'session-item--background-running' : ''} ${
        session.suspended ? 'session-item--suspended' : ''
      } ${presentation.needsAttention ? 'session-item--attention' : ''} ${
        selected ? 'session-item--active' : ''
      } ${closing ? 'session-item--closing' : ''} ${isDragging ? 'sortable-dragging' : ''}`}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <span
        aria-label={`Reorder ${session.title}`}
        className="drag-handle"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </span>
      <div
        className={`session-item__body${
          runningBackgroundTasks > 0 ? ' session-item__body--task-status' : ''
        }`}
      >
        <button
          aria-current={selected ? 'page' : undefined}
          aria-label={[
            session.title,
            managedSessions?.has(sessionKey(session)) ? 'started by Oracle' : undefined,
            session.retention?.pinned ? 'kept for review' : undefined,
            providerName(session.provider),
            executionModeName(session.executionMode),
            presentation.description,
            computerName,
            shortPath(session.cwd),
          ].filter(Boolean).join(', ')}
          className="session-item__open"
          onClick={() => onSelectSession(session)}
          title={`${session.title}\n${computerName} · ${session.cwd}\n${presentation.description}`}
          type="button"
        >
          <span className="session-item__text">
            <span className="session-item__badges">
              <em className="provider-badge">
                {session.provider === 'claude' ? 'Claude' : 'Copilot'}
              </em>
              {executionModeName(session.executionMode) ? (
                <em className="provider-badge session-mode-badge">
                  {executionModeName(session.executionMode)}
                </em>
              ) : null}
              {managedSessions?.has(sessionKey(session)) ? (
                <em className="provider-badge manager-badge" title="Started by Oracle">
                  Oracle
                </em>
              ) : null}
              {session.retention?.pinned ? (
                <em className="provider-badge" title="Protected from automatic archival">For review</em>
              ) : null}
              {presentation.state === 'tasks' && runningBackgroundTasks > 0
                ? null
                : <SessionState presentation={presentation} />}
            </span>
            <strong>{session.title}</strong>
            <small className="session-item__where">
              <span className="session-item__cwd">{shortPath(session.cwd)}</span>
              <time
                className="session-item__time"
                dateTime={activity.dateTime}
                title={activity.title}
              >
                {activity.label}
              </time>
            </small>
          </span>
        </button>
        {runningBackgroundTasks > 0 ? (
          <button
            aria-label={`View background tasks for ${session.title}`}
            className={`session-item__tasks session-state session-state--tasks${online ? '' : ' session-item__tasks--offline'}`}
            onClick={() => onOpenSessionTasks(session)}
            title={online ? undefined : 'Last known background tasks; reconnect to refresh their state'}
            type="button"
          >
            <span aria-hidden="true" className="status-dot status-dot--running" />
            Tasks
          </button>
        ) : null}
      </div>
      <div className="session-item__controls">
        <button
          aria-label={`Close ${session.title}`}
          className="session-item__close"
          disabled={closeUnavailable}
          onClick={() => onCloseSession(session)}
          title={
            !online
              ? `Reconnect ${computerName} to manage this session`
              : closing
                ? 'Closing this session'
                : 'Permanently delete this session and its history'
          }
          type="button"
        >
          <X aria-hidden="true" size={13} />
        </button>
        <button
          aria-label={
            session.suspended ? `Resume ${session.title}` : `Suspend ${session.title}`
          }
          aria-pressed={session.suspended ? true : undefined}
          className={`session-item__suspend${
            session.suspended ? ' session-item__suspend--active' : ''
          }`}
          disabled={suspendUnavailable}
          onClick={() => onToggleSessionSuspended(session)}
          title={
            !online
              ? `Reconnect ${computerName} to manage this session`
              : suspending
              ? 'Wait for this suspend or resume to finish'
              : session.suspended
              ? 'Start this session up again'
              : retained
              ? 'Reopen this session before suspending it'
              : busy
              ? 'Wait for the session to finish before suspending it'
              : ownsTasks
              ? 'Wait for its background tasks to finish before suspending it'
              : 'Keep this session but stop what is running for it'
          }
          type="button"
        >
          {session.suspended ? <Play aria-hidden="true" size={13} /> : <Pause aria-hidden="true" size={13} />}
        </button>
      </div>
    </div>
  )
}

function SortableComputerGroup({
  computer,
  sessions,
  pendingCreations = [],
  total,
  filtering,
  reorderDisabled,
  sorting,
  backgroundTasks,
  selectedKey,
  ...actions
}: SessionActions & {
  computer: ComputerSummary
  sessions: ManagedSession[]
  pendingCreations?: PendingSessionCreation[]
  total: number
  filtering: boolean
  reorderDisabled: boolean
  sorting: boolean
  backgroundTasks: Record<string, BackgroundTaskSnapshot>
  selectedKey?: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `computer:${computer.id}`, disabled: reorderDisabled })
  const shownKeys = new Set(sessions.map(sessionKey))
  const rows: ({ session: ManagedSession } | { creation: PendingSessionCreation })[] = [
    ...sessions.flatMap((session) => [
      ...pendingCreations
        .filter((creation) => creation.before === sessionKey(session))
        .map((creation) => ({ creation })),
      { session },
    ]),
    ...pendingCreations
      .filter((creation) => !creation.before || !shownKeys.has(creation.before))
      .map((creation) => ({ creation })),
  ]
  return (
    <section
      aria-label={computer.name}
      className={`computer-session-group computer-session-group--tone-${computerTone(
        computer.id,
      )} ${isDragging ? 'sortable-dragging' : ''}`}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <header className="computer-session-group__header">
        <span
          aria-label={`Reorder ${computer.name}`}
          className="drag-handle"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </span>
        <span
          aria-label={computer.online ? 'Online' : 'Offline'}
          className={`computer-session-group__status ${
            computer.online ? 'computer-session-group__status--online' : ''
          }`}
          title={computer.online ? 'Online' : 'Offline'}
        />
        <Monitor aria-hidden="true" className="computer-session-group__icon" size={14} />
        <strong>{computer.name}</strong>
        {!computer.online ? <span className="computer-offline">Offline</span> : null}
        <small aria-label={`${sessions.length} of ${total} sessions`}>
          {filtering ? `${sessions.length}/${total}` : total}
        </small>
      </header>
      <SortableContext
        items={sessions.map((session) => `session:${sessionKey(session)}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="computer-session-group__sessions">
          {rows.map((row, position) =>
            'creation' in row ? (
              <PendingSessionItem
                computerName={computer.name}
                creation={row.creation}
                key={row.creation.id}
                position={position}
              />
            ) : (
              <SortableSessionItem
                {...actions}
                backgroundTasks={taskSnapshot(backgroundTasks, row.session)}
                computerName={computer.name}
                reorderDisabled={reorderDisabled}
                sorting={sorting}
                key={sessionKey(row.session)}
                online={computer.online}
                selected={sessionKey(row.session) === selectedKey}
                session={row.session}
              />
            ),
          )}
          {sessions.length === 0 && pendingCreations.length === 0 ? (
            <p className="computer-session-group__empty">
              {filtering ? 'No matching sessions' : 'No open sessions'}
            </p>
          ) : null}
        </div>
      </SortableContext>
    </section>
  )
}

export function SessionNavigation({
  view,
  backgroundTasks,
  selectedKey,
  loading,
  sort,
  onSortChange,
  onNewSession,
  query,
  filter,
  showSuspended,
  showSuspendedSaving,
  creationError,
  loadingError,
  onDismissCreationError,
  onQueryChange: setQuery,
  onFilterChange: setFilter,
  onShowSuspendedChange: setShowSuspended,
  pendingCreations = [],
  onRefresh,
  refreshState = 'fresh',
  refreshMessage,
  ...actions
}: SessionActions & {
  view: SessionNavigationView
  backgroundTasks: Record<string, BackgroundTaskSnapshot>
  selectedKey?: string
  loading: boolean
  sort: SessionSort
  onSortChange: (sort: SessionSort) => void
  onNewSession: () => void
  query: string
  filter: SessionFilter
  showSuspended: boolean
  showSuspendedSaving: boolean
  creationError?: string
  loadingError?: string
  onDismissCreationError?: () => void
  pendingCreations?: PendingSessionCreation[]
  onRefresh?: () => void
  refreshState?: 'fresh' | 'refreshing' | 'stale'
  refreshMessage?: string
  onQueryChange: (query: string) => void
  onFilterChange: (filter: SessionFilter) => void
  onShowSuspendedChange: (show: boolean) => void
}) {
  const searchRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const restoredScrollRef = useRef(false)
  const { groups, counts, shown, filtering, reorderDisabled } = view
  const filters: { id: SessionFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'attention', label: 'Needs you', count: counts.attention },
    { id: 'working', label: 'Working', count: counts.working },
  ]
  useEffect(() => {
    if (loading || counts.all === 0 || restoredScrollRef.current) return
    try {
      const saved = Number(window.localStorage.getItem(sessionListScrollStorageKey))
      if (Number.isFinite(saved) && saved > 0 && scrollRef.current) {
        scrollRef.current.scrollTop = saved
      }
      restoredScrollRef.current = true
    } catch {
      // Scroll position is a convenience; the session list remains usable.
    }
  }, [counts.all, loading])

  return (
    <nav aria-label="Sessions" className="session-list">
      <div className="session-list__controls">
        <div className="session-list__heading">
          <div className="session-list__title">
            <h2>Sessions <span>{counts.all}</span></h2>
            <small>
            {loading
              ? 'Connecting...'
              : loadingError
                ? 'Connection failed'
              : `${groups.filter(({ computer }) => computer.online).length}/${groups.length} online`}
            </small>
          </div>
          <label className="session-sort">
            <select
              aria-label="Session order"
              onChange={(event) => onSortChange(sessionSortFrom(event.target.value))}
              value={sort}
            >
              <option value="custom">Custom order</option>
              <option value="recent">Recent activity</option>
              <option value="attention">Attention first</option>
              <option value="name">Name (A-Z)</option>
            </select>
            <ChevronDown aria-hidden="true" size={13} />
          </label>
          {onRefresh ? (
            <button
              aria-busy={refreshState === 'refreshing'}
              aria-label={refreshState === 'stale'
                ? 'Retry refreshing sessions and Oracle'
                : 'Refresh sessions and Oracle'}
              className="icon-button session-list__refresh"
              disabled={refreshState === 'refreshing'}
              onClick={onRefresh}
              title="Reload sessions, Oracle and review state"
              type="button"
            >
              <RefreshCw aria-hidden="true" size={15} />
            </button>
          ) : null}
          <button
            aria-label="New session"
            className="icon-button session-list__new"
            onClick={onNewSession}
            type="button"
          >
            <Plus aria-hidden="true" size={17} />
          </button>
        </div>
        <div className="session-search">
          <Search aria-hidden="true" size={15} />
          <input
            aria-label="Search sessions"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && query) {
                event.preventDefault()
                event.stopPropagation()
                setQuery('')
              }
            }}
            placeholder="Search sessions"
            ref={searchRef}
            type="search"
            value={query}
          />
          {query ? (
            <button
              aria-label="Clear session search"
              onClick={() => {
                setQuery('')
                searchRef.current?.focus()
              }}
              type="button"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
        <div aria-label="Filter sessions" className="session-filters" role="group">
          {filters.map((entry) => (
            <button
              aria-label={entry.label}
              aria-pressed={filter === entry.id}
              className={`session-filter session-filter--${entry.id}`}
              key={entry.id}
              onClick={() => setFilter(entry.id)}
              type="button"
            >
              {entry.label}
              <span aria-hidden="true">{entry.count}</span>
            </button>
          ))}
          <button
            aria-label="Include suspended sessions"
            aria-busy={showSuspendedSaving}
            aria-pressed={showSuspended}
            className="session-filter session-filter--suspended"
            disabled={showSuspendedSaving}
            onClick={() => setShowSuspended(!showSuspended)}
            title={showSuspendedSaving
              ? 'Saving suspended-session visibility'
              : showSuspended ? 'Hide suspended sessions' : 'Show suspended sessions'}
            type="button"
          >
            <Pause aria-hidden="true" size={11} />
            Suspended
            <span aria-hidden="true">{counts.suspended}</span>
          </button>
        </div>
        {filtering ? (
          <div className="session-list__results">
            <span aria-label="Session filter results" role="status">
              {shown} of {counts.all} sessions
            </span>
            <button
              disabled={showSuspendedSaving}
              onClick={() => {
                setQuery('')
                setFilter('all')
                setShowSuspended(true)
              }}
              title={showSuspendedSaving
                ? 'Wait for suspended-session visibility to finish saving'
                : undefined}
              type="button"
            >
              Clear filters
            </button>
          </div>
        ) : null}
        {onRefresh && refreshState !== 'fresh' ? (
          <p
            aria-label="Session data freshness"
            className={`session-list__freshness session-list__freshness--${refreshState}`}
            role="status"
          >
            {refreshState === 'refreshing' ? 'Refreshing authoritative data...' : 'Data may be stale'}
            {refreshMessage ? `: ${refreshMessage}` : ''}
          </p>
        ) : null}
      </div>
      {creationError ? (
        <div className="error-banner session-list__error" role="alert">
          <span>{creationError}</span>
          {onDismissCreationError ? (
            <button
              aria-label="Dismiss session creation error"
              onClick={onDismissCreationError}
              type="button"
            >
              <X aria-hidden="true" size={16} />
            </button>
          ) : null}
        </div>
      ) : null}
      <div
        className="session-list__scroll"
        onScroll={(event) => {
          try {
            window.localStorage.setItem(
              sessionListScrollStorageKey,
              String(event.currentTarget.scrollTop),
            )
          } catch {
            // Scroll position is a convenience; the session list remains usable.
          }
        }}
        ref={scrollRef}
      >
        {loading ? <p className="sidebar-message">Loading sessions...</p> : null}
        {!loading && !loadingError && counts.all === 0 && pendingCreations.length === 0 ? (
          <p className="sidebar-message">No sessions here.</p>
        ) : null}
        <SortableContext
          items={groups.map(({ computer }) => `computer:${computer.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="computer-session-groups">
            {groups.map((group) => (
              <SortableComputerGroup
                {...actions}
                computer={group.computer}
                backgroundTasks={backgroundTasks}
                filtering={filtering}
                reorderDisabled={reorderDisabled}
                sorting={sort !== 'custom'}
                key={group.computer.id}
                pendingCreations={pendingCreations.filter(
                  (creation) => creation.computerId === group.computer.id,
                )}
                selectedKey={selectedKey}
                sessions={group.sessions}
                total={group.total}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </nav>
  )
}
