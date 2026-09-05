import { useMemo, useRef, useState } from 'react'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pause, Play, Search, X } from 'lucide-react'
import type {
  BackgroundTaskSnapshot,
  ComputerSummary,
  ManagedSession,
} from '../shared/contracts'
import {
  computerTone,
  executionModeName,
  matchesSessionSearch,
  providerName,
  sessionKey,
  sessionPresentation,
  shortPath,
  taskSnapshot,
} from './session-presentation'
import type { SessionPresentation } from './session-presentation'

type SessionFilter = 'all' | 'attention' | 'working'

type SessionActions = {
  onSelectSession: (session: ManagedSession) => void
  onOpenSessionTasks: (session: ManagedSession) => void
  onToggleSessionSuspended: (session: ManagedSession) => void
  suspending: boolean
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

function SortableSessionItem({
  session,
  selected,
  backgroundTasks,
  online,
  filtering,
  onSelectSession,
  onOpenSessionTasks,
  onToggleSessionSuspended,
  suspending,
}: SessionActions & {
  session: ManagedSession
  selected: boolean
  backgroundTasks?: BackgroundTaskSnapshot
  online: boolean
  filtering: boolean
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
    disabled: filtering,
  })
  const presentation = sessionPresentation(session, backgroundTasks, online)
  const runningBackgroundTasks = backgroundTasks?.runningCount || 0
  const suspendUnavailable =
    !online || suspending || (!session.suspended && session.status !== 'idle')
  return (
    <div
      className={`session-item session-item--tone-${computerTone(
        session.computerId,
      )} ${presentation.state === 'tasks' ? 'session-item--background-running' : ''} ${
        session.suspended ? 'session-item--suspended' : ''
      } ${presentation.needsAttention ? 'session-item--attention' : ''} ${
        selected ? 'session-item--active' : ''
      } ${isDragging ? 'sortable-dragging' : ''}`}
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
      <button
        aria-current={selected ? 'page' : undefined}
        aria-label={[
          session.title,
          providerName(session.provider),
          executionModeName(session.executionMode),
          presentation.description,
          session.computerName,
          shortPath(session.cwd),
        ].filter(Boolean).join(', ')}
        className="session-item__open"
        onClick={() => onSelectSession(session)}
        title={`${session.title}\n${session.computerName} · ${session.cwd}\n${presentation.description}`}
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
            <SessionState presentation={presentation} />
          </span>
          <strong>{session.title}</strong>
          <small className="session-item__where">
            <span className="session-item__cwd">{shortPath(session.cwd)}</span>
          </small>
        </span>
      </button>
      {runningBackgroundTasks > 0 ? (
        <button
          aria-label={`View background tasks for ${session.title}`}
          className="session-item__tasks session-item__tasks--interactive"
          onClick={() => onOpenSessionTasks(session)}
          type="button"
        >
          {runningBackgroundTasks} task{runningBackgroundTasks === 1 ? '' : 's'}
        </button>
      ) : null}
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
            ? `Reconnect ${session.computerName} to manage this session`
            : session.suspended
            ? 'Start this session up again'
            : suspendUnavailable
              ? 'Wait for the session to finish before suspending it'
              : 'Keep this session but stop what is running for it'
        }
        type="button"
      >
        {session.suspended ? <Play size={13} /> : <Pause size={13} />}
      </button>
    </div>
  )
}

function SortableComputerGroup({
  computer,
  sessions,
  total,
  filtering,
  backgroundTasks,
  selectedKey,
  ...actions
}: SessionActions & {
  computer: ComputerSummary
  sessions: ManagedSession[]
  total: number
  filtering: boolean
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
  } = useSortable({ id: `computer:${computer.id}`, disabled: filtering })
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
          {sessions.map((session) => (
            <SortableSessionItem
              {...actions}
              backgroundTasks={taskSnapshot(backgroundTasks, session)}
              filtering={filtering}
              key={sessionKey(session)}
              online={computer.online}
              selected={sessionKey(session) === selectedKey}
              session={session}
            />
          ))}
          {sessions.length === 0 ? (
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
  computers,
  sessionsByComputer,
  backgroundTasks,
  selectedKey,
  loading,
  ...actions
}: SessionActions & {
  computers: ComputerSummary[]
  sessionsByComputer: Map<string, ManagedSession[]>
  backgroundTasks: Record<string, BackgroundTaskSnapshot>
  selectedKey?: string
  loading: boolean
}) {
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const [filter, setFilter] = useState<SessionFilter>('all')
  const filtering = query.trim().length > 0 || filter !== 'all'
  const { groups, counts, shown } = useMemo(() => {
    const groups = computers.map((computer) => {
      const sessions = sessionsByComputer.get(computer.id) || []
      const classified = sessions.map((session) => ({
        session,
        state: sessionPresentation(
          session,
          taskSnapshot(backgroundTasks, session),
          computer.online,
        ),
      }))
      const visible = classified.filter(({ session, state }) =>
        matchesSessionSearch(session, query) &&
          (filter === 'all' ||
            (filter === 'attention' && state.needsAttention) ||
            (filter === 'working' && state.working)),
      ).map(({ session }) => session)
      return {
        computer,
        sessions: visible,
        total: sessions.length,
        attention: classified.filter(({ state }) => state.needsAttention).length,
        working: classified.filter(({ state }) => state.working).length,
      }
    })
    const counts = groups.reduce((counts, group) => ({
      all: counts.all + group.total,
      attention: counts.attention + group.attention,
      working: counts.working + group.working,
    }), { all: 0, attention: 0, working: 0 })
    return {
      groups,
      counts,
      shown: groups.reduce((total, group) => total + group.sessions.length, 0),
    }
  }, [computers, sessionsByComputer, backgroundTasks, query, filter])
  const filters: { id: SessionFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'attention', label: 'Needs you', count: counts.attention },
    { id: 'working', label: 'Working', count: counts.working },
  ]

  return (
    <nav aria-label="Sessions" className="session-list">
      <div className="session-list__controls">
        <div className="session-list__heading">
          <h2>Sessions</h2>
          <span>
            {loading
              ? 'Connecting...'
              : `${computers.filter((computer) => computer.online).length}/${computers.length} online`}
          </span>
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
            placeholder="Find a session..."
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
        </div>
        {filtering ? (
          <div className="session-list__results">
            <span aria-label="Session filter results" role="status">
              {shown} of {counts.all} sessions
            </span>
            <button
              onClick={() => {
                setQuery('')
                setFilter('all')
              }}
              type="button"
            >
              Clear filters
            </button>
          </div>
        ) : null}
      </div>
      <div className="session-list__scroll">
        {loading ? <p className="sidebar-message">Loading sessions...</p> : null}
        {!loading && counts.all === 0 ? (
          <p className="sidebar-message">No sessions here.</p>
        ) : null}
        <SortableContext
          items={computers.map((computer) => `computer:${computer.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="computer-session-groups">
            {groups.map((group) => (
              <SortableComputerGroup
                {...actions}
                computer={group.computer}
                backgroundTasks={backgroundTasks}
                filtering={filtering}
                key={group.computer.id}
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
