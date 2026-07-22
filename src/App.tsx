import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent, ReactNode } from 'react'
import {
  ArrowUp,
  Bot,
  Folder,
  History,
  Menu,
  MessageSquare,
  MonitorCog,
  Plus,
  Server,
  Square,
  Trash2,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type {
  ComputerSummary,
  HubEvent,
  ManagedSession,
  PendingPermission,
} from '../shared/contracts'
import {
  activateSession,
  addComputer,
  cancelSession,
  createSession,
  deleteSession,
  getSession,
  listComputers,
  listHistory,
  listSessions,
  removeComputer,
  replyPermission,
  sendMessage,
} from './api'

function sessionKey(session: Pick<ManagedSession, 'computerId' | 'id'>): string {
  return `${session.computerId}:${session.id}`
}

function computerTone(computerId: string): number {
  let hash = 0
  for (const character of computerId) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }
  return hash % 6
}

function sortSessions(sessions: ManagedSession[]): ManagedSession[] {
  return [...sessions].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  )
}

function upsertSession(
  sessions: ManagedSession[],
  session: ManagedSession,
): ManagedSession[] {
  const key = sessionKey(session)
  return sortSessions([
    session,
    ...sessions.filter((entry) => sessionKey(entry) !== key),
  ])
}

function upsertComputer(
  computers: ComputerSummary[],
  computer: ComputerSummary,
): ComputerSummary[] {
  return [
    computer,
    ...computers.filter((entry) => entry.id !== computer.id),
  ].sort((left, right) => Number(right.isLocal) - Number(left.isLocal))
}

function shortPath(value: string): string {
  if (value.startsWith('/home/')) {
    return `~/${value.split('/').slice(3).join('/')}`
  }
  return value
}

function DialogFrame({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string
  eyebrow: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-label={title}
        aria-modal="true"
        className="dialog"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="dialog__header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <button
            aria-label="Close"
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

function NewSessionDialog({
  open,
  computers,
  defaultComputerId,
  onClose,
  onCreated,
}: {
  open: boolean
  computers: ComputerSummary[]
  defaultComputerId?: string
  onClose: () => void
  onCreated: (session: ManagedSession) => void
}) {
  const [computerId, setComputerId] = useState('')
  const [cwd, setCwd] = useState('')
  const [mode, setMode] = useState<'new' | 'previous'>('new')
  const [history, setHistory] = useState<ManagedSession[]>([])
  const [historyKey, setHistoryKey] = useState('')
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()
  const available = useMemo(
    () => computers.filter((computer) => computer.online),
    [computers],
  )

  useEffect(() => {
    if (open) {
      setComputerId(defaultComputerId || available[0]?.id || '')
      setMode('new')
      setHistoryKey('')
      setError(undefined)
      setLoadingHistory(true)
      void listHistory()
        .then(setHistory)
        .catch((caught: unknown) => {
          setError(caught instanceof Error ? caught.message : String(caught))
        })
        .finally(() => setLoadingHistory(false))
    }
  }, [open, defaultComputerId, available])

  if (!open) {
    return null
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(undefined)
    try {
      if (mode === 'new') {
        onCreated(await createSession(computerId, { cwd }))
        setCwd('')
      } else {
        const previous = history.find(
          (session) => sessionKey(session) === historyKey,
        )
        if (!previous) {
          throw new Error('Choose a previous session')
        }
        onCreated(await activateSession(previous.computerId, previous.id))
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSubmitting(false)
    }
  }

  const previousSessions = history.filter(
    (session) => session.computerId === computerId && !session.isOpen,
  )

  return (
    <DialogFrame
      eyebrow="Conversation"
      onClose={onClose}
      title={mode === 'new' ? 'Choose a folder' : 'Open previous session'}
    >
      <form onSubmit={submit}>
        <div className="dialog-tabs" role="tablist" aria-label="Session type">
          <button
            aria-selected={mode === 'new'}
            className={mode === 'new' ? 'dialog-tab dialog-tab--active' : 'dialog-tab'}
            onClick={() => setMode('new')}
            role="tab"
            type="button"
          >
            <Plus size={15} />
            New session
          </button>
          <button
            aria-selected={mode === 'previous'}
            className={
              mode === 'previous' ? 'dialog-tab dialog-tab--active' : 'dialog-tab'
            }
            onClick={() => setMode('previous')}
            role="tab"
            type="button"
          >
            <History size={15} />
            Open previous
          </button>
        </div>
        <label className="field">
          <span>Computer</span>
          <select
            className="dialog-select"
            onChange={(event) => {
              setComputerId(event.target.value)
              setHistoryKey('')
            }}
            value={computerId}
          >
            {available.map((computer) => (
              <option key={computer.id} value={computer.id}>
                {computer.name}
              </option>
            ))}
          </select>
        </label>
        {mode === 'new' ? (
          <label className="field">
            <span>Absolute folder path on that computer</span>
            <div className="path-input">
              <Folder aria-hidden="true" size={18} />
              <input
                autoFocus
                onChange={(event) => setCwd(event.target.value)}
                placeholder="/home/you/src/project"
                spellCheck={false}
                value={cwd}
              />
            </div>
          </label>
        ) : (
          <label className="field">
            <span>Previous session</span>
            <select
              className="dialog-select history-select"
              disabled={loadingHistory || previousSessions.length === 0}
              onChange={(event) => setHistoryKey(event.target.value)}
              value={historyKey}
            >
              <option value="">
                {loadingHistory
                  ? 'Loading sessions…'
                  : previousSessions.length === 0
                    ? 'No closed sessions on this computer'
                    : 'Choose a session'}
              </option>
              {previousSessions.map((session) => (
                <option key={sessionKey(session)} value={sessionKey(session)}>
                  {session.title} — {shortPath(session.cwd)}
                </option>
              ))}
            </select>
          </label>
        )}
        {error ? <p className="form-error">{error}</p> : null}
        <button
          className="primary-button dialog__submit"
          disabled={
            submitting ||
            !computerId ||
            (mode === 'new' ? !cwd.trim() : !historyKey)
          }
          type="submit"
        >
          {submitting
            ? mode === 'new'
              ? 'Creating…'
              : 'Opening…'
            : mode === 'new'
              ? 'Create session'
              : 'Open session'}
        </button>
      </form>
    </DialogFrame>
  )
}

function ComputersDialog({
  open,
  computers,
  onClose,
  onAdded,
  onRemoved,
}: {
  open: boolean
  computers: ComputerSummary[]
  onClose: () => void
  onAdded: (computer: ComputerSummary) => void
  onRemoved: (computerId: string) => void
}) {
  const [name, setName] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [token, setToken] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()

  if (!open) {
    return null
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(undefined)
    try {
      const computer = await addComputer({
        baseUrl,
        token,
        name: name.trim() || undefined,
      })
      onAdded(computer)
      setName('')
      setBaseUrl('')
      setToken('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Remove this computer from the hub? Its sessions are not deleted.')) {
      return
    }
    setError(undefined)
    try {
      await removeComputer(id)
      onRemoved(id)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    }
  }

  return (
    <DialogFrame eyebrow="Hub settings" onClose={onClose} title="Computers">
      <div className="computer-list">
        {computers.map((computer) => (
          <div className="computer-row" key={computer.id}>
            {computer.online ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>
              <strong>{computer.name}</strong>
              <small>{computer.isLocal ? 'This computer' : computer.baseUrl}</small>
            </span>
            {!computer.isLocal ? (
              <button
                aria-label={`Remove ${computer.name}`}
                className="icon-button icon-button--danger"
                onClick={() => void remove(computer.id)}
                type="button"
              >
                <Trash2 size={16} />
              </button>
            ) : null}
          </div>
        ))}
      </div>
      <form className="computer-form" onSubmit={submit}>
        <label className="field">
          <span>Name (optional)</span>
          <input
            className="dialog-input"
            onChange={(event) => setName(event.target.value)}
            placeholder="homelab-prod"
            value={name}
          />
        </label>
        <label className="field">
          <span>Node URL</span>
          <input
            className="dialog-input"
            onChange={(event) => setBaseUrl(event.target.value)}
            placeholder="http://10.0.0.233:4317"
            spellCheck={false}
            value={baseUrl}
          />
        </label>
        <label className="field">
          <span>Pairing token</span>
          <input
            className="dialog-input"
            onChange={(event) => setToken(event.target.value)}
            placeholder="Paste from agentic-remote pair-info"
            spellCheck={false}
            type="password"
            value={token}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button
          className="primary-button dialog__submit"
          disabled={submitting || !baseUrl.trim() || !token.trim()}
          type="submit"
        >
          {submitting ? 'Connecting…' : 'Add computer'}
        </button>
      </form>
    </DialogFrame>
  )
}

function PermissionCard({
  permission,
  disabled,
  onReply,
}: {
  permission: PendingPermission
  disabled: boolean
  onReply: (optionId: string) => void
}) {
  return (
    <section className="permission-card">
      <p className="eyebrow">Permission needed</p>
      <h3>{permission.title}</h3>
      <div className="permission-card__actions">
        {permission.options.map((option) => (
          <button
            className={
              option.kind.startsWith('allow')
                ? 'primary-button'
                : 'secondary-button'
            }
            disabled={disabled}
            key={option.optionId}
            onClick={() => onReply(option.optionId)}
            type="button"
          >
            {option.name}
          </button>
        ))}
      </div>
    </section>
  )
}

function EmptyConversation({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">
        <MessageSquare size={26} />
      </span>
      <h2>Your agents, within reach.</h2>
      <p>Choose a computer and continue any local Copilot conversation.</p>
      <button className="primary-button" onClick={onCreate} type="button">
        <Plus size={17} />
        New session
      </button>
    </div>
  )
}

function App() {
  const [sessions, setSessions] = useState<ManagedSession[]>([])
  const [computers, setComputers] = useState<ComputerSummary[]>([])
  const [computerFilter, setComputerFilter] = useState('all')
  const [selectedKey, setSelectedKey] = useState<string>()
  const [composer, setComposer] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [permissionBusy, setPermissionBusy] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loadingTranscript, setLoadingTranscript] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newSessionOpen, setNewSessionOpen] = useState(false)
  const [computersOpen, setComputersOpen] = useState(false)
  const [error, setError] = useState<string>()
  const timelineRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<ManagedSession | undefined>(undefined)

  const visibleSessions = useMemo(
    () =>
      computerFilter === 'all'
        ? sessions
        : sessions.filter((session) => session.computerId === computerFilter),
    [computerFilter, sessions],
  )
  const selected = useMemo(
    () => sessions.find((session) => sessionKey(session) === selectedKey),
    [selectedKey, sessions],
  )
  selectedRef.current = selected
  const selectedComputerId = selected?.computerId
  const selectedSessionId = selected?.id
  const defaultComputerId =
    (computerFilter !== 'all' &&
    computers.some(
      (computer) => computer.id === computerFilter && computer.online,
    )
      ? computerFilter
      : computers.find((computer) => computer.isLocal)?.id) ||
    computers.find((computer) => computer.online)?.id

  useEffect(() => {
    let active = true
    void Promise.all([listSessions(), listComputers()])
      .then(([loadedSessions, loadedComputers]) => {
        if (!active) {
          return
        }
        setSessions(sortSessions(loadedSessions))
        setComputers(loadedComputers)
        setSelectedKey(
          (current) =>
            current || (loadedSessions[0] ? sessionKey(loadedSessions[0]) : undefined),
        )
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : String(caught))
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedComputerId || !selectedSessionId) {
      return
    }
    let active = true
    setLoadingTranscript(true)
    void getSession(selectedComputerId, selectedSessionId)
      .then((session) => {
        if (active) {
          setSessions((current) => upsertSession(current, session))
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : String(caught))
        }
      })
      .finally(() => {
        if (active) {
          setLoadingTranscript(false)
        }
      })
    return () => {
      active = false
    }
  }, [selectedComputerId, selectedSessionId])

  useEffect(() => {
    if (
      selected &&
      computerFilter !== 'all' &&
      selected.computerId !== computerFilter
    ) {
      setSelectedKey(visibleSessions[0] ? sessionKey(visibleSessions[0]) : undefined)
    }
  }, [computerFilter, selected, visibleSessions])

  useEffect(() => {
    let socket: WebSocket | undefined
    let retry: number | undefined
    let stopped = false
    let reconnectDelay = 1_000

    const refreshSnapshot = async () => {
      const [loadedSessions, loadedComputers] = await Promise.all([
        listSessions(),
        listComputers(),
      ])
      setSessions((current) =>
        sortSessions(
          loadedSessions.map((summary) => {
            const existing = current.find(
              (session) => sessionKey(session) === sessionKey(summary),
            )
            return existing
              ? { ...summary, messages: existing.messages }
              : summary
          }),
        ),
      )
      setComputers(loadedComputers)
      const selectedAtRefresh = selectedRef.current
      const selectedStillExists =
        selectedAtRefresh &&
        loadedSessions.some(
          (session) => sessionKey(session) === sessionKey(selectedAtRefresh),
        )
      if (selectedAtRefresh && selectedStillExists) {
        const detail = await getSession(
          selectedAtRefresh.computerId,
          selectedAtRefresh.id,
        )
        setSessions((current) => upsertSession(current, detail))
      } else if (selectedAtRefresh) {
        setSelectedKey(
          loadedSessions[0] ? sessionKey(loadedSessions[0]) : undefined,
        )
      }
    }

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      socket = new WebSocket(`${protocol}//${window.location.host}/api/events`)
      socket.onopen = () => {
        reconnectDelay = 1_000
        void refreshSnapshot().catch((caught: unknown) => {
          setError(caught instanceof Error ? caught.message : String(caught))
        })
      }
      socket.onmessage = (message) => {
        const event = JSON.parse(message.data as string) as HubEvent
        if (event.type === 'session.upserted') {
          setSessions((current) => upsertSession(current, event.session))
        } else if (event.type === 'session.removed') {
          setSessions((current) =>
            current.filter(
              (session) =>
                session.id !== event.sessionId ||
                session.computerId !== event.computerId,
            ),
          )
        } else if (event.type === 'computer.updated') {
          setComputers((current) => upsertComputer(current, event.computer))
        } else if (event.type === 'computer.removed') {
          setComputers((current) =>
            current.filter((computer) => computer.id !== event.computerId),
          )
          setSessions((current) =>
            current.filter((session) => session.computerId !== event.computerId),
          )
          setComputerFilter((current) =>
            current === event.computerId ? 'all' : current,
          )
        } else {
          setError(event.message)
        }
      }
      socket.onclose = () => {
        if (!stopped) {
          const delay = reconnectDelay
          reconnectDelay = Math.min(reconnectDelay * 2, 30_000)
          retry = window.setTimeout(connect, delay)
        }
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refreshSnapshot().catch((caught: unknown) => {
          setError(caught instanceof Error ? caught.message : String(caught))
        })
      }
    }

    connect()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      stopped = true
      document.removeEventListener('visibilitychange', handleVisibility)
      if (retry !== undefined) {
        window.clearTimeout(retry)
      }
      socket?.close()
    }
  }, [])

  const latestContent = selected?.messages.at(-1)?.content
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ block: 'end' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [selectedKey, selected?.messages.length, latestContent])

  function selectSession(session: ManagedSession) {
    setSelectedKey(sessionKey(session))
    setSidebarOpen(false)
    setError(undefined)
  }

  function created(session: ManagedSession) {
    setSessions((current) => upsertSession(current, session))
    setSelectedKey(sessionKey(session))
    setComputerFilter(session.computerId)
    setNewSessionOpen(false)
    setSidebarOpen(false)
  }

  async function submitMessage() {
    const content = composer.trim()
    if (!selected || !content || sending || selected.status === 'running') {
      return
    }
    setSending(true)
    setError(undefined)
    setComposer('')
    try {
      const updated = await sendMessage(selected.computerId, selected.id, {
        content,
      })
      setSessions((current) => upsertSession(current, updated))
    } catch (caught) {
      setComposer(content)
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSending(false)
    }
  }

  function composerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      void submitMessage()
    }
  }

  async function replyToPermission(optionId: string) {
    if (!selected?.pendingPermission) {
      return
    }
    setPermissionBusy(true)
    setError(undefined)
    try {
      const updated = await replyPermission(
        selected.computerId,
        selected.id,
        selected.pendingPermission.requestId,
        { optionId },
      )
      setSessions((current) => upsertSession(current, updated))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setPermissionBusy(false)
    }
  }

  async function closeSelectedSession() {
    if (
      !selected ||
      !window.confirm(
        `Close "${selected.title}" on ${selected.computerName}?\n\nThis permanently deletes the Copilot session and its history from that computer.`,
      )
    ) {
      return
    }
    setDeleting(true)
    setError(undefined)
    try {
      await deleteSession(selected.computerId, selected.id)
      const remaining = sessions.filter(
        (session) => sessionKey(session) !== sessionKey(selected),
      )
      setSessions(remaining)
      const next = remaining.find(
        (session) =>
          computerFilter === 'all' || session.computerId === computerFilter,
      )
      setSelectedKey(next ? sessionKey(next) : undefined)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="brand">
          <span className="brand__mark">
            <Bot size={19} />
          </span>
          <div>
            <strong>Agentic Remote</strong>
            <span>Multi-computer agent hub</span>
          </div>
          <button
            aria-label="Close sessions"
            className="icon-button sidebar__close"
            onClick={() => setSidebarOpen(false)}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-actions">
          <button
            className="new-session-button"
            onClick={() => setNewSessionOpen(true)}
            type="button"
          >
            <Plus size={18} />
            New session
          </button>
          <button
            aria-label="Manage computers"
            className="manage-computers-button"
            onClick={() => setComputersOpen(true)}
            type="button"
          >
            <MonitorCog size={18} />
          </button>
        </div>

        <label className="computer-filter">
          <Server size={15} />
          <select
            aria-label="Computer"
            onChange={(event) => setComputerFilter(event.target.value)}
            value={computerFilter}
          >
            <option value="all">All computers</option>
            {computers.map((computer) => (
              <option key={computer.id} value={computer.id}>
                {computer.name}{computer.online ? '' : ' (offline)'}
              </option>
            ))}
          </select>
        </label>

        <nav aria-label="Sessions" className="session-list">
          <p className="sidebar-label">Recent</p>
          {loading ? <p className="sidebar-message">Loading sessions…</p> : null}
          {!loading && visibleSessions.length === 0 ? (
            <p className="sidebar-message">No sessions here.</p>
          ) : null}
          {visibleSessions.map((session) => (
            <button
              aria-current={sessionKey(session) === selectedKey ? 'page' : undefined}
              className={`session-item session-item--tone-${computerTone(
                session.computerId,
              )} ${
                sessionKey(session) === selectedKey ? 'session-item--active' : ''
              }`}
              key={sessionKey(session)}
              onClick={() => selectSession(session)}
              type="button"
            >
              <span className={`status-dot status-dot--${session.status}`} />
              <span className="session-item__text">
                <strong>{session.title}</strong>
                <small>
                  {session.computerName} · {shortPath(session.cwd)}
                </small>
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {sidebarOpen ? (
        <button
          aria-label="Close sessions"
          className="sidebar-scrim"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      ) : null}

      <main className="conversation">
        <header className="conversation-header">
          <button
            aria-label="Open sessions"
            className="icon-button mobile-menu"
            onClick={() => setSidebarOpen(true)}
            type="button"
          >
            <Menu size={21} />
          </button>
          <div className="conversation-header__title">
            <strong>{selected?.title || 'Agentic Remote'}</strong>
            <span>
              {selected
                ? `${selected.computerName} · ${shortPath(selected.cwd)}`
                : 'Ready when you are'}
            </span>
          </div>
          {selected ? (
            <button
              aria-label="Close session"
              className="icon-button icon-button--danger"
              disabled={deleting}
              onClick={() => void closeSelectedSession()}
              type="button"
            >
              <Trash2 size={18} />
            </button>
          ) : null}
          <button
            aria-label="New session"
            className="icon-button"
            onClick={() => setNewSessionOpen(true)}
            type="button"
          >
            <Plus size={21} />
          </button>
        </header>

        {error ? (
          <div className="error-banner">
            <span>{error}</span>
            <button aria-label="Dismiss error" onClick={() => setError(undefined)}>
              <X size={16} />
            </button>
          </div>
        ) : null}

        <div className="timeline" ref={timelineRef}>
          {!selected ? (
            <EmptyConversation onCreate={() => setNewSessionOpen(true)} />
          ) : loadingTranscript && selected.messages.length === 0 ? (
            <div className="empty-chat">
              <span className="typing-indicator" aria-label="Loading conversation">
                <i />
                <i />
                <i />
              </span>
            </div>
          ) : selected.messages.length === 0 ? (
            <div className="empty-chat">
              <span className="empty-chat__icon">
                <Bot size={24} />
              </span>
              <h2>What should we work on?</h2>
              <p>
                This agent runs on <strong>{selected.computerName}</strong> in{' '}
                <code>{shortPath(selected.cwd)}</code>.
              </p>
            </div>
          ) : (
            <div className="message-stack">
              {selected.messages.map((message) => (
                <article
                  className={`message message--${message.role}`}
                  key={message.id}
                >
                  <div className="message__label">
                    {message.role === 'user' ? 'You' : 'Agent'}
                  </div>
                  <div className="message__content">
                    {message.content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <span className="typing-indicator">
                        <i />
                        <i />
                        <i />
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
          {selected?.pendingPermission ? (
            <PermissionCard
              disabled={permissionBusy}
              onReply={(optionId) => void replyToPermission(optionId)}
              permission={selected.pendingPermission}
            />
          ) : null}
          {selected?.activity && !selected.pendingPermission ? (
            <div className="activity-line">
              <span className="activity-pulse" />
              {selected.activity}
            </div>
          ) : null}
          <div aria-hidden="true" className="timeline-bottom" ref={bottomRef} />
        </div>

        {selected ? (
          <footer className="composer-area">
            <div className="composer">
              <textarea
                aria-label="Message"
                disabled={sending}
                onChange={(event) => setComposer(event.target.value)}
                onKeyDown={composerKeyDown}
                placeholder={`Message agent on ${selected.computerName}…`}
                rows={1}
                value={composer}
              />
              {selected.status === 'running' ? (
                <button
                  aria-label="Stop response"
                  className="send-button send-button--stop"
                  onClick={() =>
                    void cancelSession(selected.computerId, selected.id)
                  }
                  type="button"
                >
                  <Square fill="currentColor" size={15} />
                </button>
              ) : (
                <button
                  aria-label="Send message"
                  className="send-button"
                  disabled={!composer.trim() || sending}
                  onClick={() => void submitMessage()}
                  type="button"
                >
                  <ArrowUp size={19} strokeWidth={2.4} />
                </button>
              )}
            </div>
            <p className="composer-hint">Ctrl or ⌘ + Enter to send</p>
          </footer>
        ) : null}
      </main>

      <NewSessionDialog
        computers={computers}
        defaultComputerId={defaultComputerId}
        onClose={() => setNewSessionOpen(false)}
        onCreated={created}
        open={newSessionOpen}
      />
      <ComputersDialog
        computers={computers}
        onAdded={(computer) =>
          setComputers((current) => upsertComputer(current, computer))
        }
        onClose={() => setComputersOpen(false)}
        onRemoved={(computerId) => {
          setComputers((current) =>
            current.filter((computer) => computer.id !== computerId),
          )
          setSessions((current) =>
            current.filter((session) => session.computerId !== computerId),
          )
          if (computerFilter === computerId) {
            setComputerFilter('all')
          }
        }}
        open={computersOpen}
      />
    </div>
  )
}

export default App
