import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ChevronLeft,
  Folder,
  FolderOpen,
  History,
  Plus,
} from 'lucide-react'
import type {
  AgentProvider,
  ComputerSummary,
  DirectoryListing,
  ManagedSession,
  RuntimeModelOption,
} from '../../shared/contracts'
import {
  DEFAULT_SESSION_PROVIDER,
  type NewSessionBackendSetting,
} from '../../shared/settings-profile'
import {
  activateSession,
  createSession,
  getProviderRuntimeOptions,
  listDirectories,
  listHistory,
} from '../api'
import { DialogFrame } from '../components/DialogFrame'
import type { PendingSessionCreation } from '../SessionNavigation'
import {
  providerName,
  sessionKey,
  shortPath,
} from '../session-presentation'
import {
  agentModeName,
  computerProviders,
  newSessionRuntimeInput,
  normalizedRuntimeSelection,
} from './runtime-presentation'
import type {
  DefaultRuntimeSettings,
  DefaultSessionFolders,
  SessionCreationHandle,
} from './types'

export function NewSessionDialog({
  open,
  computers,
  defaultComputerId,
  defaultRuntimes,
  defaultSessionFolders,
  defaultBackend,
  creationError,
  onClose,
  onCreating,
  onCreationFailed,
  onCreated,
}: {
  open: boolean
  computers: ComputerSummary[]
  defaultComputerId?: string
  defaultRuntimes: DefaultRuntimeSettings
  defaultSessionFolders: DefaultSessionFolders
  defaultBackend: NewSessionBackendSetting
  creationError?: string
  onClose: () => void
  onCreating: (
    creation: Omit<PendingSessionCreation, 'id'>,
  ) => SessionCreationHandle
  onCreationFailed: (
    creation: SessionCreationHandle,
    message: string,
  ) => void
  onCreated: (
    session: ManagedSession,
    creation?: SessionCreationHandle,
  ) => void
}) {
  const [computerId, setComputerId] = useState('')
  const [provider, setProvider] = useState<AgentProvider>(DEFAULT_SESSION_PROVIDER)
  const [cwd, setCwd] = useState('~')
  const [directoryListing, setDirectoryListing] =
    useState<DirectoryListing>()
  const [loadingDirectories, setLoadingDirectories] = useState(false)
  const [directoryComputerId, setDirectoryComputerId] = useState<string>()
  const directoryRequest = useRef(0)
  const [terminalBacked, setTerminalBacked] = useState(true)
  const [allowAllPermissions, setAllowAllPermissions] = useState(true)
  const [mode, setMode] = useState<'new' | 'previous'>('new')
  const [history, setHistory] = useState<ManagedSession[]>([])
  const [historyKey, setHistoryKey] = useState('')
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>()
  const [runtimeLoading, setRuntimeLoading] = useState(false)
  const [runtimeError, setRuntimeError] = useState<string>()
  const [providerRuntimeModels, setProviderRuntimeModels] =
    useState<RuntimeModelOption[]>()
  const available = useMemo(
    () => computers.filter((computer) => computer.online),
    [computers],
  )
  const initialized = useRef(false)
  const initialSelection = useRef<string | undefined>(undefined)
  const dialogGeneration = useRef(0)

  useEffect(() => {
    if (!open) {
      dialogGeneration.current += 1
      return
    }
    setSubmitting(false)
  }, [open])

  useEffect(() => {
    if (!open) {
      initialized.current = false
      initialSelection.current = undefined
      return
    }
    // Opening the dialog is what fills it in. `available` and the stored
    // folders are rebuilt whenever any computer event arrives -- a node going
    // online, a status refresh on returning to the tab -- and re-running this
    // while the dialog is open threw away the provider, mode, folder, and
    // previous session the reader had already chosen.
    if (initialized.current) {
      return
    }
    const initialComputerId =
      available.find((computer) => computer.id === defaultComputerId)?.id ||
      available[0]?.id || ''
    // Opening before the first computer snapshot has landed leaves nothing to
    // choose. Marking the dialog filled in at that point stranded it: the
    // computers arrived, this returned at the guard above, and Create stayed
    // disabled with no computer selected until the dialog was reopened.
    if (!initialComputerId) {
      return
    }
    initialized.current = true
    initialSelection.current = initialComputerId
    setComputerId(initialComputerId)
    setProvider(DEFAULT_SESSION_PROVIDER)
    setCwd(defaultSessionFolders[initialComputerId]?.trim() || '~')
    setDirectoryComputerId(initialComputerId)
    setDirectoryListing(undefined)
    setTerminalBacked(defaultBackend !== 'sdk')
    setAllowAllPermissions(true)
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
  }, [open, defaultComputerId, defaultSessionFolders, defaultBackend, available])

  // The chosen computer can be unpaired, or go offline, while the dialog is
  // still open. Left alone the selection stays truthy and Create stays
  // enabled, so submitting aimed at a computer that is no longer there. Only
  // the computer and its folder are reconciled; provider and mode remain
  // what the reader chose.
  useEffect(() => {
    if (!open || !initialized.current) {
      return
    }
    if (initialSelection.current !== undefined) {
      if (computerId !== initialSelection.current) return
      initialSelection.current = undefined
    }
    if (available.some((computer) => computer.id === computerId)) {
      return
    }
    const nextComputerId =
      available.find((computer) => computer.id === defaultComputerId)?.id ||
      available[0]?.id || ''
    directoryRequest.current += 1
    setComputerId(nextComputerId)
    setCwd('')
    setDirectoryListing(undefined)
    setDirectoryComputerId(undefined)
    setLoadingDirectories(Boolean(nextComputerId))
    setHistoryKey('')
  }, [open, computerId, available, defaultComputerId])

  useEffect(() => {
    if (!open || mode !== 'new' || !computerId) {
      return
    }
    let active = true
    const request = ++directoryRequest.current
    const initialPath = defaultSessionFolders[computerId]?.trim() || '~'
    setLoadingDirectories(true)
    setError(undefined)
    const listingRequest = initialPath.startsWith('/')
      ? listDirectories(computerId, initialPath, 'all')
      : listDirectories(computerId, initialPath)
    void listingRequest
      .then((listing) => {
        if (active && request === directoryRequest.current) {
          setDirectoryListing(listing)
          setCwd(listing.path)
          setDirectoryComputerId(computerId)
        }
      })
      .catch((caught: unknown) => {
        if (active && request === directoryRequest.current) {
          setError(caught instanceof Error ? caught.message : String(caught))
        }
      })
      .finally(() => {
        if (active && request === directoryRequest.current) {
          setLoadingDirectories(false)
        }
      })
    return () => {
      active = false
    }
  }, [computerId, defaultSessionFolders, mode, open])

  useEffect(() => {
    if (!open || mode !== 'new' || !computerId) {
      return
    }
    let active = true
    setRuntimeLoading(true)
    setRuntimeError(undefined)
    setProviderRuntimeModels(undefined)
    void getProviderRuntimeOptions(computerId, provider)
      .then(({ models }) => {
        if (active) {
          setProviderRuntimeModels(models)
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setRuntimeError(
            caught instanceof Error ? caught.message : String(caught),
          )
        }
      })
      .finally(() => {
        if (active) {
          setRuntimeLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [
    computerId,
    mode,
    open,
    provider,
  ])

  if (!open) {
    return null
  }

  async function browseDirectory(path: string) {
    const request = ++directoryRequest.current
    setLoadingDirectories(true)
    setError(undefined)
    try {
      const listing = await (cwd.startsWith('/')
        ? listDirectories(computerId, path, 'all')
        : listDirectories(computerId, path))
      if (request === directoryRequest.current) {
        setDirectoryListing(listing)
        setCwd(listing.path)
        setDirectoryComputerId(computerId)
      }
    } catch (caught) {
      if (request === directoryRequest.current) {
        setError(caught instanceof Error ? caught.message : String(caught))
      }
    } finally {
      if (request === directoryRequest.current) {
        setLoadingDirectories(false)
      }
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const submittedGeneration = dialogGeneration.current
    setSubmitting(true)
    setError(undefined)
    let pendingCreation: SessionCreationHandle | undefined
    try {
      if (
        !available.some((computer) => computer.id === computerId) ||
        (mode === 'new' && (
          directoryComputerId !== computerId || !cwd.trim()
        ))
      ) {
        throw new Error('Choose an available computer and wait for its folder to load.')
      }
      if (mode === 'new') {
        const createInTmux =
          computerProviders(
            available.find((computer) => computer.id === computerId),
          ).find((entry) => entry.id === provider)?.terminalBacked === true
            ? terminalBacked
            : false
        pendingCreation = onCreating({
          computerId,
          cwd,
          executionMode: createInTmux ? 'tmux' : 'sdk',
          provider,
        })
        setSubmitting(false)
        await pendingCreation.turn
        onCreated(
          await createSession(computerId, {
            cwd,
            provider,
            terminalBacked: createInTmux,
            allowAllPermissions,
            ...newSessionRuntimeInput(defaultRuntimes[provider], providerRuntimeModels),
          }),
          pendingCreation,
        )
        if (dialogGeneration.current === submittedGeneration) {
          setCwd('')
        }
      } else {
        const previous = history.find(
          (session) =>
            sessionKey(session) === historyKey &&
            session.computerId === computerId &&
            available.some((computer) => computer.id === session.computerId) &&
            !session.isOpen,
        )
        if (!previous) {
          throw new Error('Choose a previous session')
        }

        const opened = await activateSession(previous.computerId, previous.id)
        if (dialogGeneration.current === submittedGeneration) {
          onCreated(opened)
        }
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught)
      if (pendingCreation) {
        onCreationFailed(pendingCreation, message)
      } else if (dialogGeneration.current === submittedGeneration) {
        setError(message)
      }
    } finally {
      if (dialogGeneration.current === submittedGeneration) {
        setSubmitting(false)
      }
    }
  }

  const previousSessions = history.filter(
    (session) => session.computerId === computerId && !session.isOpen,
  )
  const selectedComputer = available.find(
    (computer) => computer.id === computerId,
  )
  const providers = computerProviders(selectedComputer)
  const selectedProvider = providers.find((entry) => entry.id === provider)
  const savedDefaultRuntime = defaultRuntimes[provider]
  const defaultRuntime = providerRuntimeModels
    ? normalizedRuntimeSelection(savedDefaultRuntime, providerRuntimeModels)
    : savedDefaultRuntime
  const defaultModel = defaultRuntime?.model.trim() || ''

  return (
    <DialogFrame
      className="new-session-dialog"
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
              const nextComputerId = event.target.value
              directoryRequest.current += 1
              setComputerId(nextComputerId)
              setProvider(DEFAULT_SESSION_PROVIDER)
              setHistoryKey('')
              setCwd(defaultSessionFolders[nextComputerId]?.trim() || '~')
              setDirectoryListing(undefined)
              setDirectoryComputerId(nextComputerId || undefined)
              setLoadingDirectories(Boolean(nextComputerId))
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
            <span>Agent provider</span>
            <select
              aria-label="Agent provider"
              className="dialog-select"
              onChange={(event) =>
                setProvider(event.target.value as AgentProvider)
              }
              value={provider}
            >
              {providers.map((entry) => (
                <option
                  disabled={!entry.available}
                  key={entry.id}
                  value={entry.id}
                >
                  {entry.name}
                  {entry.available ? '' : ' — unavailable'}
                </option>
              ))}
            </select>
            {!selectedProvider?.available && selectedProvider?.unavailableReason ? (
              <small className="field__hint">
                {selectedProvider.unavailableReason}
              </small>
            ) : null}
            {defaultModel ? (
              <small className="field__hint">
                New sessions use <strong>{defaultModel}</strong> with{' '}
                {defaultRuntime?.reasoningEffort ? (
                  <>
                    <strong>{defaultRuntime.reasoningEffort}</strong> effort and{' '}
                  </>
                ) : null}
                <strong>
                  {defaultRuntime?.contextTier.replace('_', ' ')}
                </strong>{' '}
                context.
              </small>
            ) : null}
            {savedDefaultRuntime.mode ? (
              <small className="field__hint">
                New sessions start in{' '}
                <strong>{agentModeName(savedDefaultRuntime.mode, provider)}</strong>{' '}
                mode.
              </small>
            ) : null}
            {runtimeError ? (
              <small className="field__hint">{runtimeError}</small>
            ) : null}
          </label>
        ) : null}
        {mode === 'new' ? (
          <div className="folder-picker">
            <div className="folder-picker__toolbar">
              <button
                aria-label="Parent folder"
                className="icon-button"
                disabled={!directoryListing?.parent || loadingDirectories}
                onClick={() =>
                  void browseDirectory(directoryListing?.parent || '~')
                }
                type="button"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="folder-picker__path">
                <Folder size={15} />
                <strong>{directoryListing?.path || '~'}</strong>
              </div>
            </div>
            <div
              aria-label="Folders"
              className="folder-picker__list"
              role="listbox"
            >
              {loadingDirectories ? (
                <p>Loading folders…</p>
              ) : directoryListing?.directories.length ? (
                directoryListing.directories.map((directory) => (
                  <button
                    key={`${directory.name}:${directory.path}`}
                    onClick={() => void browseDirectory(directory.path)}
                    role="option"
                    type="button"
                  >
                    <FolderOpen size={17} />
                    <span>{directory.name}</span>
                    <ChevronLeft
                      className="folder-picker__chevron"
                      size={15}
                    />
                  </button>
                ))
              ) : (
                <p>No subfolders here.</p>
              )}
            </div>
            <p className="folder-picker__hint">
              The session will start in <strong>{cwd || '~'}</strong>.
            </p>
            {selectedProvider?.terminalBacked ? (
              <label className="tmux-session-option">
                <input
                  checked={terminalBacked}
                  onChange={(event) => setTerminalBacked(event.target.checked)}
                  type="checkbox"
                />
                <span>
                  <strong>Create in tmux</strong>
                  <small>
                    Opens a new window that remains accessible from SSH.
                  </small>
                </span>
              </label>
            ) : null}
            <label className="tmux-session-option">
              <input
                checked={allowAllPermissions}
                onChange={(event) =>
                  setAllowAllPermissions(event.target.checked)
                }
                type="checkbox"
              />
              <span>
                <strong>Allow all permissions</strong>
                <small>
                  Runs tools without asking for individual approval.
                </small>
              </span>
            </label>
          </div>
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
                  {session.title} — {providerName(session.provider)} —{' '}
                  {shortPath(session.cwd)}
                </option>
              ))}
            </select>
          </label>
        )}
        {error || creationError ? (
          <p className="form-error" role="alert">
            {error || creationError}
          </p>
        ) : null}
        <button
          className="primary-button dialog__submit"
          disabled={
            submitting ||
            !selectedComputer ||
            Boolean(defaultModel && runtimeLoading) ||
            Boolean(defaultModel && runtimeError) ||
            (mode === 'new' && (
              !selectedProvider?.available || directoryComputerId !== computerId
            )) ||
            (mode === 'new'
              ? !cwd.trim()
              : !previousSessions.some((session) => sessionKey(session) === historyKey))
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
