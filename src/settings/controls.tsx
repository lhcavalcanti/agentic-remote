import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { ChevronLeft, Folder, FolderOpen, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { AgentProvider, ComputerSummary, DirectoryListing, RuntimeModelOption } from '../../shared/contracts'
import { listDirectories, validateSessionDirectory } from '../api'
import {
  binding,
  bindingLabel,
  capturableCode,
  isModifierCode,
  sameBinding,
  shortcutAcceptsBinding,
  shortcutDefaults,
} from '../app-shortcuts'
import type { ShortcutBinding, ShortcutDefinition, ShortcutId } from '../app-shortcuts'
import { remarkSafeBreaks } from '../remark-safe-breaks'
import { providerName, shortPath } from '../session-presentation'
import { agentModeName, contextSizeLabel, isRuntimeReasoningEffort } from '../session-setup/runtime-presentation'
import type { DefaultRuntimeSelection } from '../session-setup/types'
import {
  defaultAgentMode,
  emptyRuntimeSelection,
} from './runtime-defaults'

export function SettingScope({ synced }: { synced: boolean }) {
  return (
    <span className={`settings-scope${synced ? ' settings-scope--synced' : ''}`}>
      {synced ? 'Synced' : 'This device'}
    </span>
  )
}

export function DefaultRuntimeControls({
  error,
  loading,
  models,
  onChange,
  provider,
  selection,
}: {
  error?: string
  loading: boolean
  models: RuntimeModelOption[]
  onChange: (selection: DefaultRuntimeSelection) => void
  provider: AgentProvider
  selection: DefaultRuntimeSelection
}) {
  const name = providerName(provider)
  const selectedModel = models.find((model) => model.id === selection.model)
  const unavailableModel = selection.model.trim() && !selectedModel

  return (
    <div className="default-runtime">
      <h4>{name}</h4>
      {loading ? <p className="dialog-message">Loading models…</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {!loading && !error && models.length === 0 ? (
        <p className="dialog-message">No models are available.</p>
      ) : null}
      {models.length > 0 ? (
        <>
          <label className="field">
            <span>Model</span>
            <select
              aria-label={`${name} default model`}
              className="dialog-select"
              onChange={(event) => {
                if (!event.target.value) {
                  onChange({ ...emptyRuntimeSelection, mode: selection.mode })
                  return
                }
                const model = models.find(
                  (candidate) => candidate.id === event.target.value,
                )
                if (!model) {
                  return
                }
                onChange({
                  model: model.id,
                  reasoningEffort: model.reasoningEfforts[0] || '',
                  contextTier: model.contextTiers.includes(selection.contextTier)
                    ? selection.contextTier
                    : 'default',
                  mode: selection.mode,
                })
              }}
              value={selection.model.trim()}
            >
              <option value="">Provider default</option>
              {unavailableModel ? (
                <option value={selection.model.trim()}>
                  {selection.model.trim()} (unavailable)
                </option>
              ) : null}
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </label>
          {selectedModel?.description ? (
            <div className="default-runtime__description">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkSafeBreaks]}>
                {selectedModel.description}
              </ReactMarkdown>
            </div>
          ) : null}
          {selectedModel && selectedModel.reasoningEfforts.length > 0 ? (
            <label className="field">
              <span>Reasoning effort</span>
              <select
                aria-label={`${name} default reasoning effort`}
                className="dialog-select"
                onChange={(event) =>
                  isRuntimeReasoningEffort(event.target.value)
                    ? onChange({
                        ...selection,
                        reasoningEffort: event.target.value,
                      })
                    : undefined
                }
                value={selection.reasoningEffort}
              >
                {selectedModel.reasoningEfforts.map((effort) => (
                  <option key={effort} value={effort}>
                    {effort}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {selectedModel ? (
            <label className="field">
              <span>Context size</span>
              <select
                aria-label={`${name} default context size`}
                className="dialog-select"
                onChange={(event) =>
                  onChange({
                    ...selection,
                    contextTier: event.target.value as
                      | 'default'
                      | 'long_context',
                  })
                }
                value={selection.contextTier}
              >
                {selectedModel.contextTiers.map((tier) => (
                  <option key={tier} value={tier}>
                    {contextSizeLabel(selectedModel, tier)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </>
      ) : null}
      <label className="field">
        <span>Agent mode</span>
        <select
          aria-label={`${name} default agent mode`}
          className="dialog-select"
          onChange={(event) =>
            onChange({ ...selection, mode: defaultAgentMode(event.target.value) })
          }
          value={selection.mode}
        >
          {(['interactive', 'plan', 'autopilot'] as const).map((mode) => (
            <option key={mode} value={mode === 'interactive' ? '' : mode}>
              {agentModeName(mode, provider)}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export function DefaultSessionFolderControl({
  computer,
  value,
  onChange,
  label = 'default session folder',
  blankLabel = 'Home directory (blank)',
  selectHint = 'the default for new sessions',
  title,
  purpose,
  offlineNote = true,
}: {
  computer: Pick<ComputerSummary, 'id' | 'name' | 'online'>
  value?: string
  onChange: (path?: string) => void
  /** What the folder is for, as in "Browse <label> for <computer>". */
  label?: string
  /** Shown when no folder is chosen. */
  blankLabel?: string
  /** Completes "Select <folder> as …". */
  selectHint?: string
  /** The row's name; the computer's when it stands alone. */
  title?: string
  /** Tells apart two pickers for the same computer, as in "Folders on <computer> for <purpose>". */
  purpose?: string
  /** Whether to say the computer is offline; off where the computer's card says it once. */
  offlineNote?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [listing, setListing] = useState<DirectoryListing>()
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string>()
  const requestRef = useRef(0)

  useEffect(() => {
    if (!open || !computer.online) {
      return
    }
    let active = true
    const request = ++requestRef.current
    const path = value?.trim() || '~'
    setLoading(true)
    setError(undefined)
    void listDirectories(computer.id, path, 'all')
      .then((nextListing) => {
        if (active && request === requestRef.current) {
          setListing(nextListing)
        }
      })
      .catch((caught: unknown) => {
        if (active && request === requestRef.current) {
          setListing(undefined)
          setError(caught instanceof Error ? caught.message : String(caught))
        }
      })
      .finally(() => {
        if (active && request === requestRef.current) {
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [computer.id, computer.online, open, value])

  async function browse(path: string) {
    const request = ++requestRef.current
    setLoading(true)
    setError(undefined)
    try {
      const nextListing = await listDirectories(computer.id, path, 'all')
      if (request === requestRef.current) {
        setListing(nextListing)
      }
    } catch (caught) {
      if (request === requestRef.current) {
        setError(caught instanceof Error ? caught.message : String(caught))
      }
    } finally {
      if (request === requestRef.current) {
        setLoading(false)
      }
    }
  }

  async function chooseFolder() {
    if (!listing) {
      return
    }
    setValidating(true)
    setError(undefined)
    try {
      const normalized = (await validateSessionDirectory(
        computer.id,
        listing.path,
      )).trim()
      if (!normalized) {
        throw new Error('The selected folder could not be validated')
      }
      onChange(normalized)
      setOpen(false)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setValidating(false)
    }
  }

  return (
    <div className="default-session-folder">
      <div className="default-session-folder__header">
        <span>
          <strong>{title ?? computer.name}</strong>
          <small>{value ? shortPath(value) : blankLabel}</small>
        </span>
        <div className="default-session-folder__actions">
          <button
            aria-expanded={open}
            aria-label={`Browse ${label} for ${computer.name}`}
            className="secondary-button"
            disabled={!computer.online}
            onClick={() => {
              setOpen((current) => !current)
              setError(undefined)
            }}
            type="button"
          >
            {open ? 'Close' : 'Browse'}
          </button>
          {value ? (
            <button
              aria-label={`Remove ${label} for ${computer.name}`}
              className="icon-button icon-button--danger"
              disabled={validating}
              onClick={() => {
                setOpen(false)
                setError(undefined)
                onChange()
              }}
              type="button"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      </div>
      {offlineNote && !computer.online ? (
        <small className="default-session-folder__offline">
          Connect to browse this computer.
        </small>
      ) : null}
      {open ? (
        <div className="folder-picker default-session-folder__picker">
          <div className="folder-picker__toolbar">
            <button
              aria-label={`Parent folder for ${computer.name}${purpose ? ` for ${purpose}` : ''}`}
              className="icon-button"
              disabled={!listing?.parent || loading || validating}
              onClick={() => void browse(listing?.parent || '~')}
              type="button"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="folder-picker__path">
              <Folder size={15} />
              <strong>{listing?.path || value || '~'}</strong>
            </div>
          </div>
          <div
            aria-label={`Folders on ${computer.name}${purpose ? ` for ${purpose}` : ''}`}
            className="folder-picker__list"
            role="listbox"
          >
            {loading ? (
              <p>Loading folders…</p>
            ) : listing?.directories.length ? (
              listing.directories.map((directory) => (
                <button
                  disabled={validating}
                  key={directory.path}
                  onClick={() => void browse(directory.path)}
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
              <p>{listing ? 'No subfolders here.' : 'Folder unavailable.'}</p>
            )}
          </div>
          <p className="folder-picker__hint">
            Select <strong>{listing?.path || value || '~'}</strong> as{' '}
            {selectHint}. The folder is checked against this computer’s
            session roots before it is saved.
          </p>
          {error ? <p className="form-error">{error}</p> : null}
          <button
            className="primary-button app-settings-section__action"
            disabled={!listing || loading || validating}
            onClick={() => void chooseFolder()}
            type="button"
          >
            {validating ? 'Validating…' : 'Use this folder'}
          </button>
        </div>
      ) : null}
    </div>
  )
}

/** The shortcut list, with each row open to being given different keys. */
export function ShortcutEditor({
  shortcuts,
  overrides,
  onChange,
}: {
  shortcuts: ShortcutDefinition[]
  overrides: Partial<Record<ShortcutId, ShortcutBinding>>
  onChange: (overrides: Partial<Record<ShortcutId, ShortcutBinding>>) => void
}) {
  const [recording, setRecording] = useState<ShortcutId>()
  const [refused, setRefused] = useState<string>()

  function stopRecording() {
    setRecording(undefined)
    setRefused(undefined)
  }

  function capture(id: ShortcutId, event: KeyboardEvent<HTMLButtonElement>) {
    // Before anything is prevented, so Tab still moves on as it always does.
    // Stopping capture and swallowing the press left the reader recording on a
    // control they could not leave by keyboard.
    if (event.key === 'Tab') {
      stopRecording()
      return
    }
    event.preventDefault()
    event.stopPropagation()
    if (event.key === 'Escape') {
      stopRecording()
      return
    }
    // Held on their own they are only half a shortcut. Waiting for the key
    // they are held with is what lets Alt+Shift+K be typed at all.
    if (isModifierCode(event.code)) {
      return
    }
    const chosen = binding(event.code, {
      alt: event.altKey,
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      meta: event.metaKey,
    })
    // The same rule the stored ones are held to. Accepting a key here that a
    // reload would throw away meant a shortcut that worked until the page was
    // opened again.
    if (!capturableCode(chosen.code)) {
      setRefused('That key cannot be used for a shortcut.')
      return
    }
    if (!shortcutAcceptsBinding(id, chosen)) {
      setRefused('Enter sends from a composer, so Oracle needs another key.')
      return
    }
    // A bare letter would be swallowed the moment it was typed anywhere
    // outside a text box, so the shortcut has to be held with something.
    if (!chosen.alt && !chosen.ctrl && !chosen.meta) {
      setRefused('Hold Alt, Ctrl or Cmd as well, or this would fire while you type.')
      return
    }
    const taken = shortcuts.find(
      (entry) => entry.id !== id && sameBinding(entry.binding, chosen),
    )
    if (taken) {
      setRefused(`${bindingLabel(chosen)} already does "${taken.label}".`)
      return
    }
    onChange({ ...overrides, [id]: chosen })
    stopRecording()
  }

  function reset(id: ShortcutId) {
    const restored = shortcutDefaults.find((entry) => entry.id === id)?.binding
    // Its default can have been given to another row in the meantime, and
    // putting it back regardless left two rows answering to the same keys --
    // only the first of which is ever reached, so this one could not be
    // pressed at all.
    const taken = restored
      ? shortcuts.find(
          (entry) => entry.id !== id && sameBinding(entry.binding, restored),
        )
      : undefined
    if (taken && restored) {
      setRefused(
        `${bindingLabel(restored)} now does "${taken.label}", so this cannot be put back until that changes.`,
      )
      return
    }
    const { [id]: _removed, ...rest } = overrides
    onChange(rest)
    stopRecording()
  }

  return (
    <>
      <ul className="shortcut-list shortcut-list--editable">
        {shortcuts.map((entry) => {
          const isRecording = recording === entry.id
          const changed = Boolean(overrides[entry.id])
          return (
            <li key={entry.id}>
              <span>{entry.label}</span>
              <span className="shortcut-list__controls">
                <button
                  aria-label={
                    isRecording
                      ? `Press the new keys for ${entry.label}`
                      : `Change the keys for ${entry.label}`
                  }
                  className={`shortcut-key ${
                    isRecording ? 'shortcut-key--recording' : ''
                  }`}
                  onBlur={stopRecording}
                  onClick={() => {
                    setRefused(undefined)
                    setRecording(isRecording ? undefined : entry.id)
                  }}
                  onKeyDown={(event) =>
                    isRecording ? capture(entry.id, event) : undefined
                  }
                  type="button"
                >
                  {isRecording ? (
                    'Press keys\u2026'
                  ) : (
                    <kbd>{bindingLabel(entry.binding)}</kbd>
                  )}
                </button>
                {changed ? (
                  <button
                    aria-label={`Reset the keys for ${entry.label}`}
                    className="shortcut-reset"
                    onClick={() => reset(entry.id)}
                    type="button"
                  >
                    Reset
                  </button>
                ) : null}
              </span>
            </li>
          )
        })}
      </ul>
      {refused ? (
        <p className="dialog-message shortcut-refused" role="alert">
          {refused}
        </p>
      ) : null}
    </>
  )
}
