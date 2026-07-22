import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import {
  ArrowUp,
  Bot,
  Folder,
  Menu,
  MessageSquare,
  Plus,
  Square,
  X,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type {
  PendingPermission,
  ServerEvent,
  SessionDetail,
} from '../shared/contracts'
import {
  cancelSession,
  createSession,
  listSessions,
  replyPermission,
  sendMessage,
} from './api'

function sortSessions(sessions: SessionDetail[]): SessionDetail[] {
  return [...sessions].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  )
}

function upsertSession(
  sessions: SessionDetail[],
  session: SessionDetail,
): SessionDetail[] {
  return sortSessions([
    session,
    ...sessions.filter((entry) => entry.id !== session.id),
  ])
}

function shortPath(value: string): string {
  const home = '/home/'
  if (value.startsWith(home)) {
    const parts = value.split('/')
    return `~/${parts.slice(3).join('/')}`
  }
  return value
}

function NewSessionDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (session: SessionDetail) => void
}) {
  const [cwd, setCwd] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (open) {
      setError(undefined)
    }
  }, [open])

  if (!open) {
    return null
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(undefined)
    try {
      onCreated(await createSession({ cwd }))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-labelledby="new-session-title"
        aria-modal="true"
        className="dialog"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="dialog__header">
          <div>
            <p className="eyebrow">New conversation</p>
            <h2 id="new-session-title">Choose a folder</h2>
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
        <form onSubmit={submit}>
          <label className="field">
            <span>Absolute folder path</span>
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
          {error ? <p className="form-error">{error}</p> : null}
          <button
            className="primary-button dialog__submit"
            disabled={submitting || !cwd.trim()}
            type="submit"
          >
            {submitting ? 'Creating…' : 'Create session'}
          </button>
        </form>
      </section>
    </div>
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
      <p>
        Start a session in any local folder, then read and reply without the
        terminal noise.
      </p>
      <button className="primary-button" onClick={onCreate} type="button">
        <Plus size={17} />
        New session
      </button>
    </div>
  )
}

function App() {
  const [sessions, setSessions] = useState<SessionDetail[]>([])
  const [selectedId, setSelectedId] = useState<string>()
  const [composer, setComposer] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [permissionBusy, setPermissionBusy] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newSessionOpen, setNewSessionOpen] = useState(false)
  const [error, setError] = useState<string>()
  const timelineRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(
    () => sessions.find((session) => session.id === selectedId),
    [selectedId, sessions],
  )

  useEffect(() => {
    let active = true
    void listSessions()
      .then((loaded) => {
        if (!active) {
          return
        }
        setSessions(sortSessions(loaded))
        setSelectedId((current) => current || loaded[0]?.id)
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
    let socket: WebSocket | undefined
    let retry: number | undefined
    let stopped = false

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      socket = new WebSocket(`${protocol}//${window.location.host}/api/events`)
      socket.onmessage = (message) => {
        const event = JSON.parse(message.data as string) as ServerEvent
        if (event.type === 'session.upserted') {
          setSessions((current) => upsertSession(current, event.session))
        } else if (event.type === 'session.removed') {
          setSessions((current) =>
            current.filter((session) => session.id !== event.sessionId),
          )
        } else {
          setError(event.message)
        }
      }
      socket.onclose = () => {
        if (!stopped) {
          retry = window.setTimeout(connect, 1_000)
        }
      }
    }

    connect()
    return () => {
      stopped = true
      if (retry !== undefined) {
        window.clearTimeout(retry)
      }
      socket?.close()
    }
  }, [])

  const latestContent = selected?.messages.at(-1)?.content
  useEffect(() => {
    const timeline = timelineRef.current
    if (timeline) {
      timeline.scrollTo({ top: timeline.scrollHeight, behavior: 'smooth' })
    }
  }, [selectedId, selected?.messages.length, latestContent])

  function selectSession(id: string) {
    setSelectedId(id)
    setSidebarOpen(false)
    setError(undefined)
  }

  function created(session: SessionDetail) {
    setSessions((current) => upsertSession(current, session))
    setSelectedId(session.id)
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
      const updated = await sendMessage(selected.id, { content })
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

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="brand">
          <span className="brand__mark">
            <Bot size={19} />
          </span>
          <div>
            <strong>Agentic Remote</strong>
            <span>Local agent console</span>
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

        <button
          className="new-session-button"
          onClick={() => setNewSessionOpen(true)}
          type="button"
        >
          <Plus size={18} />
          New session
        </button>

        <nav aria-label="Sessions" className="session-list">
          <p className="sidebar-label">Recent</p>
          {loading ? <p className="sidebar-message">Loading sessions…</p> : null}
          {!loading && sessions.length === 0 ? (
            <p className="sidebar-message">No sessions yet.</p>
          ) : null}
          {sessions.map((session) => (
            <button
              aria-current={session.id === selectedId ? 'page' : undefined}
              className={`session-item ${
                session.id === selectedId ? 'session-item--active' : ''
              }`}
              key={session.id}
              onClick={() => selectSession(session.id)}
              type="button"
            >
              <span className={`status-dot status-dot--${session.status}`} />
              <span className="session-item__text">
                <strong>{session.title}</strong>
                <small>{shortPath(session.cwd)}</small>
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
            <span>{selected ? shortPath(selected.cwd) : 'Ready when you are'}</span>
          </div>
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
          ) : selected.messages.length === 0 ? (
            <div className="empty-chat">
              <span className="empty-chat__icon">
                <Bot size={24} />
              </span>
              <h2>What should we work on?</h2>
              <p>
                This agent is scoped to <code>{shortPath(selected.cwd)}</code>.
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
        </div>

        {selected ? (
          <footer className="composer-area">
            <div className="composer">
              <textarea
                aria-label="Message"
                disabled={sending}
                onChange={(event) => setComposer(event.target.value)}
                onKeyDown={composerKeyDown}
                placeholder="Message your agent…"
                rows={1}
                value={composer}
              />
              {selected.status === 'running' ? (
                <button
                  aria-label="Stop response"
                  className="send-button send-button--stop"
                  onClick={() => void cancelSession(selected.id)}
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
        onClose={() => setNewSessionOpen(false)}
        onCreated={created}
        open={newSessionOpen}
      />
    </div>
  )
}

export default App
