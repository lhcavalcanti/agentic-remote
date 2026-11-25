import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useDndContext, useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ChevronDown,
  ChevronRight,
  Ellipsis,
  Eye,
  EyeOff,
  GripVertical,
  History,
  Mail,
  MailOpen,
  Monitor,
  LayersPlus,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import type {
  BackgroundTaskSnapshot,
  ComputerSummary,
  ManagedSession,
} from '../shared/contracts'
import { CLOSED_SESSION_RETENTION_DAYS } from '../shared/closed-sessions'
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
import type {
  SessionCategorySection,
  SessionFilter,
  SessionNavigationView,
} from './session-navigation-view'
import { SessionOriginBadge } from './SessionOriginBadge'
import { SessionOriginRunLink } from './SessionOriginRunLink'
import { sessionOriginDescription } from './session-origin'
import { dragsRow, splitRowListeners } from './session-list-sensors'
import type { ScheduleLink } from './notifications/schedule-link'

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
  onOpenScheduleRun?: (target: ScheduleLink) => void
  onSelectSession: (session: ManagedSession) => void
  onOpenSessionTasks: (session: ManagedSession) => void
  onCloseSession: (session: ManagedSession) => void
  /** `computerId:sessionId` of the sessions whose close is in flight. */
  closingSessions: ReadonlySet<string>
  /** `computerId:sessionId` of the sessions left out of the list. */
  hiddenSessions: ReadonlySet<string>
  /** `computerId:sessionId` of the sessions whose hide or show is being saved. */
  hidingSessions: ReadonlySet<string>
  onToggleSessionHidden: (session: ManagedSession) => void
  /** `computerId:sessionId` of the sessions not read since their last turn ended. */
  unreadSessions: ReadonlySet<string>
  /** `computerId:sessionId` of the sessions whose read state is being saved. */
  markingUnreadSessions: ReadonlySet<string>
  onToggleSessionUnread: (session: ManagedSession) => void
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
      <span className="session-item__text">
        <span className="session-item__badges">
          <em className="provider-badge">
            {creation.provider === 'claude' ? 'Claude' : 'Copilot'}
          </em>
          <em className="provider-badge session-mode-badge">
            {executionModeName(creation.executionMode)}
          </em>
          <span className="session-state session-state--running">
            <span aria-hidden="true" className="session-creation-dots">
              <i className="session-creation-dot" />
              <i className="session-creation-dot" />
              <i className="session-creation-dot" />
            </span>
            Creating
          </span>
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
  onOpenScheduleRun,
  onCloseSession,
  closingSessions,
  hiddenSessions,
  hidingSessions,
  onToggleSessionHidden,
  unreadSessions,
  markingUnreadSessions,
  onToggleSessionUnread,
  recoverableClose,
  showComputer = false,
}: SessionActions & {
  session: ManagedSession
  selected: boolean
  backgroundTasks?: BackgroundTaskSnapshot
  computerName: string
  online: boolean
  reorderDisabled: boolean
  sorting: boolean
  /** The owning computer keeps a closed session to reopen. */
  recoverableClose: boolean
  /** Names its computer, as a category's rows come from several. */
  showComputer?: boolean
}) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `session:${sessionKey(session)}`,
    disabled: reorderDisabled || sorting,
  })
  const { press, keys } = splitRowListeners(listeners)
  const presentation = sessionPresentation(session, backgroundTasks, online)
  const activity = sessionActivityTime(session.updatedAt)
  const runningBackgroundTasks = backgroundTasks?.runningCount || 0
  // Each session waits only for its own close; the owning computer
  // serializes lifecycle work per session, so others can go at the same time.
  const closing = closingSessions.has(sessionKey(session))
  const closeUnavailable = !online || closing
  // The hub keeps this, not the owning computer, so it works offline too.
  const hidden = hiddenSessions.has(sessionKey(session))
  const hiding = hidingSessions.has(sessionKey(session))
  // Hub-owned too, and shared by every browser on it.
  const unread = unreadSessions.has(sessionKey(session))
  const markingUnread = markingUnreadSessions.has(sessionKey(session))
  return (
    <div
      className={`session-item session-item--tone-${computerTone(
        session.computerId,
      )} ${presentation.working && runningBackgroundTasks > 0 ? 'session-item--background-running' : ''} ${
        hidden ? 'session-item--hidden' : ''
      } ${unread ? 'session-item--unread' : ''} ${
        presentation.needsAttention ? 'session-item--attention' : ''
      } ${
        selected ? 'session-item--active' : ''
      } ${closing ? 'session-item--closing' : ''} ${isDragging ? 'sortable-dragging' : ''}`}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...press}
    >
      <span
        aria-label={`Reorder ${session.title}`}
        className="drag-handle"
        ref={setActivatorNodeRef}
        {...attributes}
        {...keys}
        {...dragsRow}
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
            unread ? 'unread' : undefined,
            sessionOriginDescription(session.provenance),
            session.retention?.pinned ? 'kept for review' : undefined,
            hidden ? 'hidden from the list' : undefined,
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
          {...dragsRow}
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
              <SessionOriginBadge provenance={session.provenance} />
              {session.retention?.pinned ? (
                <em className="provider-badge" title="Protected from automatic archival">For review</em>
              ) : null}
              {hidden ? (
                <em
                  className="provider-badge session-hidden-badge"
                  title="Hidden from the list; the session keeps running"
                >
                  <EyeOff aria-hidden="true" size={11} />
                  Hidden
                </em>
              ) : null}
              {presentation.state === 'tasks' && runningBackgroundTasks > 0
                ? null
                : <SessionState presentation={presentation} />}
            </span>
            {unread ? <span aria-hidden="true" className="session-item__unread-dot" /> : null}
            <strong>{session.title}</strong>
            <small className="session-item__where">
              {showComputer ? <span className="session-item__computer">{computerName}</span> : null}
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
        <SessionOriginRunLink provenance={session.provenance} onOpenRun={onOpenScheduleRun} />
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
                : recoverableClose
                  ? 'Close this session; you can reopen it from Recently closed'
                  : 'Permanently delete this session and its history'
          }
          type="button"
        >
          <X aria-hidden="true" size={13} />
        </button>
        <button
          aria-busy={hiding || undefined}
          aria-label={
            hidden ? `Show ${session.title} in the list` : `Hide ${session.title} from the list`
          }
          className="session-item__hide"
          disabled={hiding}
          onClick={() => onToggleSessionHidden(session)}
          title={
            hiding
              ? hidden
                ? 'Showing this session in the list'
                : 'Hiding this session from the list'
              : hidden
                ? 'Show in the list again'
                : 'Hide from the list; the session keeps running'
          }
          type="button"
        >
          {hidden ? <Eye aria-hidden="true" size={13} /> : <EyeOff aria-hidden="true" size={13} />}
        </button>
        <button
          aria-busy={markingUnread || undefined}
          aria-label={
            unread ? `Mark ${session.title} as read` : `Mark ${session.title} as unread`
          }
          className="session-item__unread"
          disabled={markingUnread}
          onClick={() => onToggleSessionUnread(session)}
          title={
            markingUnread
              ? unread
                ? 'Marking this session as unread'
                : 'Marking this session as read'
              : unread
                ? 'Mark as read'
                : 'Mark as unread'
          }
          type="button"
        >
          {unread ? <MailOpen aria-hidden="true" size={13} /> : <Mail aria-hidden="true" size={13} />}
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
  hidden,
  categorized = 0,
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
  /** Sessions left out of the list because they are hidden. */
  hidden: number
  /** Its open sessions in categories, listed there or hidden. */
  categorized?: number
  filtering: boolean
  reorderDisabled: boolean
  sorting: boolean
  backgroundTasks: Record<string, BackgroundTaskSnapshot>
  selectedKey?: string
}) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `computer:${computer.id}`, disabled: reorderDisabled })
  const { press, keys } = splitRowListeners(listeners)
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
      <header className="computer-session-group__header" {...press}>
        <span
          aria-label={`Reorder ${computer.name}`}
          className="drag-handle"
          ref={setActivatorNodeRef}
          {...attributes}
          {...keys}
          {...dragsRow}
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
                recoverableClose={Boolean(computer.providers?.some(
                  (provider) => provider.supportsRecoverableClose === true,
                ))}
                selected={sessionKey(row.session) === selectedKey}
                session={row.session}
              />
            ),
          )}
          {sessions.length === 0 && pendingCreations.length === 0 ? (
            <p className="computer-session-group__empty">
              {filtering
                ? 'No matching sessions'
                : categorized > 0
                  ? `${categorized}${hidden > 0 ? '' : ` session${categorized === 1 ? '' : 's'}`} in ${
                    categorized === 1 ? 'a category' : 'categories'}${hidden > 0 ? `, ${hidden} hidden` : ''}`
                  : hidden > 0
                    ? `${hidden} hidden session${hidden === 1 ? '' : 's'}`
                    : 'No open sessions'}
            </p>
          ) : null}
        </div>
      </SortableContext>
    </section>
  )
}

export interface SessionCategoryActions {
  /** Collapses or expands a category for every browser on the hub. */
  onToggleCategory: (categoryId: string, collapsed: boolean) => void
  onMarkCategoryRead: (categoryId: string) => void
  onRenameCategory: (categoryId: string) => void
  /** Moves a category one place up (-1) or down (1). */
  onMoveCategory: (categoryId: string, direction: -1 | 1) => void
  onDeleteCategory: (categoryId: string) => void
  onNewCategory: () => void
}

interface CategoryMenuItem {
  label: string
  onSelect: () => void
  disabled?: boolean
  danger?: boolean
}

/**
 * A category's own actions. The menu takes the focus when it opens, the arrow
 * keys, Home and End move it between the actions, and Escape or choosing one
 * gives it back to the button; Tab or a press elsewhere just closes it.
 */
function CategoryMenu({ name, items }: { name: string; items: CategoryMenuItem[] }) {
  const [open, setOpen] = useState(false)
  // Opens upward when the list has no room for it below the button.
  const [upward, setUpward] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const label = `Category actions for ${name}`
  const enabled = () => [...(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [])]
    .filter((item) => !item.disabled)

  useEffect(() => {
    if (!open) return
    enabled()[0]?.focus()
    function dismissOutside(event: PointerEvent | FocusEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', dismissOutside)
    document.addEventListener('focusin', dismissOutside)
    return () => {
      document.removeEventListener('pointerdown', dismissOutside)
      document.removeEventListener('focusin', dismissOutside)
    }
  }, [open])

  function moveFocus(event: ReactKeyboardEvent) {
    const items = enabled()
    const current = items.indexOf(document.activeElement as HTMLButtonElement)
    const next = event.key === 'ArrowDown' ? (current + 1) % items.length
      : event.key === 'ArrowUp' ? (current - 1 + items.length) % items.length
        : event.key === 'Home' ? 0
          : event.key === 'End' ? items.length - 1
            : undefined
    if (next === undefined) {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        setOpen(false)
        triggerRef.current?.focus()
      } else if (event.key === 'Tab') {
        setOpen(false)
      }
      return
    }
    event.preventDefault()
    items[next]?.focus()
  }

  return (
    <div className="session-category__menu" ref={rootRef}>
      <button
        aria-controls={open ? menuId : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        className="session-category__menu-button"
        onClick={() => {
          const button = triggerRef.current?.getBoundingClientRect()
          const list = triggerRef.current?.closest('.session-list__scroll')?.getBoundingClientRect()
          setUpward(Boolean(button && list && list.bottom - button.bottom < 220 && button.top - list.top > list.bottom - button.bottom))
          setOpen(!open)
        }}
        ref={triggerRef}
        title={label}
        type="button"
      >
        <Ellipsis aria-hidden="true" size={15} />
      </button>
      {open ? (
        <div
          aria-label={label}
          className={`session-category__menu-panel${upward ? ' session-category__menu-panel--upward' : ''}`}
          id={menuId}
          onKeyDown={moveFocus}
          ref={menuRef}
          role="menu"
        >
          {items.map((item) => (
            <button
              className={`session-category__menu-item${item.danger ? ' session-category__menu-item--danger' : ''}`}
              disabled={item.disabled}
              key={item.label}
              onClick={() => {
                setOpen(false)
                // Back on the button before the action runs, so a dialog it
                // opens returns the focus there when it closes.
                triggerRef.current?.focus()
                item.onSelect()
              }}
              role="menuitem"
              tabIndex={-1}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

/** What a category's header says to a screen reader; the visible counts are hidden from it. */
function categoryHeaderLabel(section: SessionCategorySection, filtering: boolean): string {
  const parts = [section.category.name]
  if (filtering) {
    parts.push(`${section.sessions.length} of ${plural(section.total, 'session')}`)
  } else if (section.collapsed) {
    if (section.attention > 0) parts.push(`${section.attention} need${section.attention === 1 ? 's' : ''} you`)
    if (section.unread > 0) parts.push(`${section.unread} unread`)
    if (section.working) parts.push('working')
    parts.push(plural(section.total, 'session'))
  } else {
    parts.push(plural(section.total, 'session'))
  }
  return parts.join(', ')
}

function SessionCategorySectionView({
  section,
  position,
  count,
  computers,
  backgroundTasks,
  selectedKey,
  filtering,
  reorderDisabled,
  sorting,
  categoryActions,
  ...actions
}: SessionActions & {
  section: SessionCategorySection
  position: number
  count: number
  computers: ReadonlyMap<string, ComputerSummary>
  backgroundTasks: Record<string, BackgroundTaskSnapshot>
  selectedKey?: string
  filtering: boolean
  reorderDisabled: boolean
  sorting: boolean
  categoryActions: SessionCategoryActions
}) {
  const { category } = section
  const listId = useId()
  // A session dropped anywhere on the category, header included, goes into it.
  const { setNodeRef } = useDroppable({ id: `category:${category.id}` })
  const { active, over } = useDndContext()
  const rowIds = section.sessions.map((session) => `session:${sessionKey(session)}`)
  const dropping = Boolean(active && String(active.id).startsWith('session:') && over &&
    (over.id === `category:${category.id}` || rowIds.includes(String(over.id))))
  return (
    <section
      aria-label={`Category ${category.name}`}
      className={`session-category${section.collapsed ? ' session-category--collapsed' : ''}${
        dropping ? ' session-category--drop-target' : ''}`}
      ref={setNodeRef}
    >
      <header className="session-category__header">
        <button
          aria-controls={listId}
          aria-expanded={!section.collapsed}
          aria-label={categoryHeaderLabel(section, filtering)}
          className="session-category__toggle"
          disabled={filtering}
          onClick={() => categoryActions.onToggleCategory(category.id, !section.collapsed)}
          title={filtering ? 'Clear the search and filters to close it' : undefined}
          type="button"
        >
          <ChevronRight aria-hidden="true" className="session-category__chevron" size={14} />
          <strong className="session-category__name">{category.name}</strong>
          <span aria-hidden="true" className="session-category__summary">
            {filtering ? (
              <small>{`${section.sessions.length}/${section.total}`}</small>
            ) : section.collapsed ? (
              <>
                {section.attention > 0 ? (
                  <span className="session-category__signal session-category__signal--attention">
                    <span className="session-category__glyph">◆</span>
                    {section.attention}
                  </span>
                ) : null}
                {section.unread > 0 ? (
                  <span className="session-category__signal session-category__signal--unread">
                    <span className="session-category__glyph">●</span>
                    {section.unread}
                  </span>
                ) : null}
                {section.working ? <span className="session-category__ring" /> : null}
              </>
            ) : (
              <small>{section.total}</small>
            )}
          </span>
        </button>
        <CategoryMenu
          items={[
            {
              label: 'Mark all as read',
              disabled: section.unread === 0,
              onSelect: () => categoryActions.onMarkCategoryRead(category.id),
            },
            { label: 'Rename…', onSelect: () => categoryActions.onRenameCategory(category.id) },
            {
              label: 'Move up',
              // Filtering lists only some categories, so places among them mean nothing.
              disabled: reorderDisabled || position === 0,
              onSelect: () => categoryActions.onMoveCategory(category.id, -1),
            },
            {
              label: 'Move down',
              disabled: reorderDisabled || position === count - 1,
              onSelect: () => categoryActions.onMoveCategory(category.id, 1),
            },
            {
              label: 'Delete category…',
              danger: true,
              onSelect: () => categoryActions.onDeleteCategory(category.id),
            },
          ]}
          name={category.name}
        />
      </header>
      <div className="session-category__sessions" id={listId}>
        <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
          {section.sessions.map((session) => {
            const computer = computers.get(session.computerId)
            return (
              <SortableSessionItem
                {...actions}
                backgroundTasks={taskSnapshot(backgroundTasks, session)}
                computerName={computer?.name ?? session.computerName}
                key={sessionKey(session)}
                online={computer?.online ?? false}
                recoverableClose={Boolean(computer?.providers?.some(
                  (provider) => provider.supportsRecoverableClose === true,
                ))}
                reorderDisabled={reorderDisabled}
                selected={sessionKey(session) === selectedKey}
                session={session}
                showComputer={computers.size > 1}
                sorting={sorting}
              />
            )
          })}
        </SortableContext>
        {section.collapsed && section.more > 0 ? (
          <button
            aria-label={`Show ${plural(section.more, 'more session')} in ${category.name}`}
            className="session-category__more"
            onClick={() => categoryActions.onToggleCategory(category.id, false)}
            type="button"
          >
            {section.more} more
          </button>
        ) : null}
        {!section.collapsed && section.sessions.length === 0 ? (
          <p className="session-category__empty">
            {sorting
              ? "Use Move to category in a session's actions"
              : "Drag sessions here, or use Move to category in a session's actions"}
          </p>
        ) : null}
      </div>
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
  showHidden,
  showHiddenSaving,
  creationError,
  loadingError,
  onDismissCreationError,
  onQueryChange: setQuery,
  onFilterChange: setFilter,
  onShowHiddenChange: setShowHidden,
  pendingCreations = [],
  onRefresh,
  refreshState = 'fresh',
  refreshMessage,
  signInExpired,
  recentlyClosedCount,
  onOpenRecentlyClosed,
  categoryActions,
  ...actions
}: SessionActions & {
  view: SessionNavigationView
  /** Absent on a hub that keeps no categories. */
  categoryActions?: SessionCategoryActions
  backgroundTasks: Record<string, BackgroundTaskSnapshot>
  selectedKey?: string
  loading: boolean
  sort: SessionSort
  onSortChange: (sort: SessionSort) => void
  onNewSession: () => void
  query: string
  filter: SessionFilter
  showHidden: boolean
  showHiddenSaving: boolean
  creationError?: string
  loadingError?: string
  onDismissCreationError?: () => void
  pendingCreations?: PendingSessionCreation[]
  onRefresh?: () => void
  refreshState?: 'fresh' | 'refreshing' | 'stale'
  refreshMessage?: string
  /**
   * Set while the sign-in gateway refuses requests, which every connection and
   * refresh failure would then only repeat.
   */
  signInExpired?: boolean
  /** How many closed sessions can still be reopened, once known. */
  recentlyClosedCount?: number
  onOpenRecentlyClosed?: () => void
  onQueryChange: (query: string) => void
  onFilterChange: (filter: SessionFilter) => void
  onShowHiddenChange: (show: boolean) => void
}) {
  const searchRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const restoredScrollRef = useRef(false)
  const { groups, counts, shown, filtering, reorderDisabled } = view
  const computers = new Map(groups.map(({ computer }) => [computer.id, computer]))
  const filters: { id: SessionFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'attention', label: 'Needs you', count: counts.attention },
    { id: 'working', label: 'Working', count: counts.working },
    { id: 'unread', label: 'Unread', count: counts.unread },
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
            {signInExpired
              ? 'Sign-in expired'
              : loading
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
          <div className="session-list__actions">
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
            {onOpenRecentlyClosed ? (
              <button
                aria-label={recentlyClosedCount
                  ? `Recently closed, ${recentlyClosedCount} session${recentlyClosedCount === 1 ? '' : 's'}`
                  : 'Recently closed'}
                className="icon-button session-list__recently-closed"
                onClick={onOpenRecentlyClosed}
                title={`Reopen a session closed in the last ${CLOSED_SESSION_RETENTION_DAYS} days`}
                type="button"
              >
                <History aria-hidden="true" size={15} />
                {recentlyClosedCount ? (
                  <span aria-hidden="true" className="session-list__recently-closed-count">
                    {recentlyClosedCount > 99 ? '99+' : recentlyClosedCount}
                  </span>
                ) : null}
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
          {/* Decides what the list includes rather than narrowing it. Offered
              once something is hidden, and while hidden sessions are shown so
              that can be undone. */}
          {counts.hidden > 0 || showHidden ? (
            <button
              aria-label="Include hidden sessions"
              aria-busy={showHiddenSaving}
              aria-pressed={showHidden}
              className="session-filter session-filter--hidden"
              disabled={showHiddenSaving}
              onClick={() => setShowHidden(!showHidden)}
              title={showHiddenSaving
                ? 'Saving hidden-session visibility'
                : showHidden
                  ? 'Leave hidden sessions out of the list'
                  : 'Show hidden sessions in the list'}
              type="button"
            >
              <EyeOff aria-hidden="true" size={11} />
              Hidden
              {counts.hidden > 0 ? <span aria-hidden="true">{counts.hidden}</span> : null}
            </button>
          ) : null}
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
        {onRefresh && refreshState !== 'fresh' && !signInExpired ? (
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
        {!loading && !loadingError && counts.all === 0 && counts.hidden === 0 &&
          pendingCreations.length === 0 ? (
          <p className="sidebar-message">No sessions here.</p>
        ) : null}
        {categoryActions && !loading ? (
          <div className="session-categories">
            {view.categories.map((section, position) => (
              <SessionCategorySectionView
                {...actions}
                backgroundTasks={backgroundTasks}
                categoryActions={categoryActions}
                computers={computers}
                count={view.categories.length}
                filtering={filtering}
                key={section.category.id}
                position={position}
                reorderDisabled={reorderDisabled}
                section={section}
                selectedKey={selectedKey}
                sorting={sort !== 'custom'}
              />
            ))}
            {/* Where a new category appears, and taking no room in the header,
                which stays one row on a phone. */}
            {!filtering ? (
              <button
                className="session-categories__new"
                onClick={categoryActions.onNewCategory}
                type="button"
              >
                <LayersPlus aria-hidden="true" size={14} />
                New category
              </button>
            ) : null}
          </div>
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
                hidden={group.hidden}
                categorized={group.categorized}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </nav>
  )
}
