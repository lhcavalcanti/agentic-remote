import { ChevronDown, ChevronRight, Folder, FolderOpen, LoaderCircle, Plus } from 'lucide-react'
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import type {
  ComputerSummary,
  KnowledgeRoot,
  ManagedSession,
  SessionKnowledgeSourceInput,
  WorkspaceListing,
} from '../shared/contracts'
import { shortPath } from './session-presentation'

export type KnowledgeRootChoice =
  | { kind: 'location'; source: SessionKnowledgeSourceInput; path: string }
  | { kind: 'none' }

export type KnowledgeRootSession = Pick<
  ManagedSession, 'id' | 'computerId' | 'computerName' | 'title' | 'cwd'
>

export function KnowledgeRootChoices({
  roots,
  computers,
  session,
  currentRootId,
  hasCurrentBinding = Boolean(currentRootId),
  choice,
  disabled,
  onList,
  onChoice,
  onBrowse,
  onRemove,
}: {
  roots: KnowledgeRoot[]
  computers: ComputerSummary[]
  session?: KnowledgeRootSession
  currentRootId?: string | null
  hasCurrentBinding?: boolean
  choice?: KnowledgeRootChoice
  disabled: boolean
  onList: (source: SessionKnowledgeSourceInput, path: string) => Promise<WorkspaceListing>
  onChoice: (choice: KnowledgeRootChoice) => void
  onBrowse: () => void
  onRemove: (root: KnowledgeRoot) => void
}) {
  const online = (computerId: string) => computers.some((computer) => computer.id === computerId && computer.online)
  const workingSource: SessionKnowledgeSourceInput | undefined = session
    ? { kind: 'session-folder', path: session.cwd }
    : undefined
  return (
    <fieldset className="knowledge-root-choices" disabled={disabled}>
      <legend className="visually-hidden">Knowledge folder choices</legend>
      {session ? (
        <>
          <h3>Start from the session folder</h3>
          <KnowledgeLocationChoice
            choice={choice}
            disabled={!online(session.computerId)}
            key={`session-folder:${session.computerId}:${session.id}:${session.cwd}`}
            label="This session's folder"
            location={`${session.computerName} / ${shortPath(session.cwd)}`}
            accessibleLocation={`${session.computerName}: ${session.cwd}`}
            onChoice={onChoice}
            onList={onList}
            source={workingSource!}
          />
        </>
      ) : null}
      <h3>{session ? 'Or choose from Knowledge' : 'Knowledge library'}</h3>
      <div className="knowledge-root-choices__list">
        {roots.map((root) => (
          <KnowledgeLocationChoice
            badge={!online(root.computerId) ? 'Offline' : root.id === currentRootId ? 'Current' : undefined}
            choice={choice}
            disabled={!online(root.computerId)}
            key={root.id}
            label={root.name}
            location={`${root.computerName} / ${shortPath(root.path)}`}
            accessibleLocation={`${root.computerName}: ${root.path}`}
            onChoice={onChoice}
            onList={onList}
            source={{ kind: 'catalog-root', rootId: root.id }}
          />
        ))}
        {roots.length === 0 ? <p className="dialog-message">No Knowledge folders have been added yet.</p> : null}
      </div>
      {session && hasCurrentBinding ? (
        <label className="knowledge-root-choice knowledge-root-choice--unlink">
          <input
            aria-label="No root for this session"
            checked={choice?.kind === 'none'}
            name="knowledge-root-choice"
            onChange={() => onChoice({ kind: 'none' })}
            type="radio"
          />
          <span>
            <strong>No root for this session</strong>
            <small>Unlink this session. Keep the shared folder and its files.</small>
          </span>
        </label>
      ) : null}
      <button className="knowledge-root-choices__browse" onClick={onBrowse} type="button">
        <Plus aria-hidden="true" size={15} />
        Browse another folder
      </button>
      {roots.length > 0 ? (
        <details className="knowledge-root-management">
          <summary>Manage shared folders</summary>
          <p className="dialog-message">Removing a root affects every session using it, but never deletes the files.</p>
          {roots.map((root) => (
            <div className="knowledge-root-management__row" key={root.id}>
              <span><strong>{root.name}</strong><small>{root.computerName} / {shortPath(root.path)}</small></span>
              <button
                aria-label={`Review removal of ${root.name} on ${root.computerName}`}
                onClick={() => onRemove(root)}
                type="button"
              >
                Remove...
              </button>
            </div>
          ))}
        </details>
      ) : null}
    </fieldset>
  )
}

function sourceKey(source: SessionKnowledgeSourceInput): string {
  return source.kind === 'catalog-root' ? `root:${source.rootId}` : 'session-folder'
}

function KnowledgeLocationChoice({
  source,
  label,
  location,
  accessibleLocation,
  badge,
  choice,
  disabled,
  onList,
  onChoice,
}: {
  source: SessionKnowledgeSourceInput
  label: string
  location: string
  accessibleLocation: string
  badge?: string
  choice?: KnowledgeRootChoice
  disabled: boolean
  onList: (source: SessionKnowledgeSourceInput, path: string) => Promise<WorkspaceListing>
  onChoice: (choice: KnowledgeRootChoice) => void
}) {
  const treeId = useId()
  const key = sourceKey(source)
  const selected = choice?.kind === 'location' && sourceKey(choice.source) === key
  const selectedPath = selected ? choice.path : undefined
  const [expandedOverride, setExpandedOverride] = useState<boolean>()
  const expanded = expandedOverride ?? Boolean(selectedPath && selectedPath !== '.')
  const [folders, setFolders] = useState<Record<string, WorkspaceListing>>({})
  const attempted = useRef(new Set<string>())
  const onListRef = useRef(onList)
  const sourceRef = useRef(source)
  const [loading, setLoading] = useState<string>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    onListRef.current = onList
    sourceRef.current = source
  }, [onList, source])

  useEffect(() => {
    if (!expanded) return
    const ancestors = selectedPath && selectedPath !== '.'
      ? selectedPath.split('/').slice(0, -1).reduce<string[]>(
          (paths, segment) => [...paths, paths.at(-1) === '.' ? segment : `${paths.at(-1)}/${segment}`],
          ['.'],
        )
      : ['.']
    const folder = ancestors.find((candidate) => {
      const requestKey = `${key}:${candidate}`
      return !folders[candidate] && !attempted.current.has(requestKey)
    })
    if (!folder) return
    const attemptedRequests = attempted.current
    let cancelled = false
    const requestKey = `${key}:${folder}`
    attemptedRequests.add(requestKey)
    setLoading(folder)
    setError(undefined)
    let settled = false
    void onListRef.current(sourceRef.current, folder).then((listing) => {
      if (!cancelled) {
        settled = true
        setFolders((current) => ({ ...current, [folder]: listing }))
      }
    }).catch((caught: unknown) => {
      if (!cancelled) {
        settled = true
        setError(caught instanceof Error ? caught.message : String(caught))
      }
    }).finally(() => {
      if (!cancelled) setLoading(undefined)
    })
    return () => {
      cancelled = true
      if (!settled) attemptedRequests.delete(requestKey)
    }
  }, [expanded, folders, key, selectedPath])

  const toggle = (path: string) => {
    if (folders[path]) {
      setFolders((current) => {
        const next = { ...current }
        for (const savedPath of Object.keys(next)) {
          if (savedPath === path || savedPath.startsWith(`${path}/`)) delete next[savedPath]
        }
        return next
      })
      return
    }
    setLoading(path)
    setError(undefined)
    void onList(source, path).then((listing) => {
      setFolders((current) => ({ ...current, [path]: listing }))
    }).catch((caught: unknown) => {
      setError(caught instanceof Error ? caught.message : String(caught))
    }).finally(() => setLoading(undefined))
  }

  return (
    <div className={`knowledge-root-choice${selected ? ' knowledge-root-choice--selected' : ''}`}>
      <button
        aria-controls={treeId}
        aria-expanded={expanded}
        aria-label={`Browse ${label}`}
        className="knowledge-root-choice__expand"
        disabled={disabled}
        onClick={() => setExpandedOverride(() => {
          if (expanded) {
            for (const attemptedKey of attempted.current) {
              if (attemptedKey.startsWith(`${key}:`)) attempted.current.delete(attemptedKey)
            }
            setError(undefined)
          }
          return !expanded
        })}
        type="button"
      >
        {expanded ? <ChevronDown aria-hidden="true" size={16} /> : <ChevronRight aria-hidden="true" size={16} />}
      </button>
      <button
        aria-label={`${label} on ${accessibleLocation}`}
        aria-pressed={selected && choice.path === '.'}
        className="knowledge-root-choice__location"
        disabled={disabled}
        onClick={() => onChoice({ kind: 'location', source, path: '.' })}
        type="button"
      >
        {source.kind === 'session-folder'
          ? <FolderOpen aria-hidden="true" size={18} />
          : <Folder aria-hidden="true" size={18} />}
        <span>
          <strong>{label}</strong>
          <small>{location}{selectedPath && selectedPath !== '.' ? ` / ${selectedPath}` : ''}</small>
        </span>
        {badge ? <em>{badge}</em> : null}
      </button>
      {expanded ? (
        <div className="knowledge-root-choice__tree" id={treeId} role="tree">
          <FolderRows
            choice={choice}
            folders={folders}
            loading={loading}
            onChoice={onChoice}
            onToggle={toggle}
            source={source}
          />
          {loading === '.' ? <span className="knowledge-root-choice__status"><LoaderCircle aria-hidden="true" size={14} /> Loading folders...</span> : null}
          {error ? <span className="form-error" role="alert">{error}</span> : null}
        </div>
      ) : null}
    </div>
  )
}

function FolderRows({
  source,
  choice,
  folders,
  loading,
  onChoice,
  onToggle,
  parent = '.',
  depth = 1,
}: {
  source: SessionKnowledgeSourceInput
  choice?: KnowledgeRootChoice
  folders: Record<string, WorkspaceListing>
  loading?: string
  onChoice: (choice: KnowledgeRootChoice) => void
  onToggle: (path: string) => void
  parent?: string
  depth?: number
}) {
  return folders[parent]?.entries.filter((entry) => entry.kind === 'directory').map((entry) => {
    const expanded = Boolean(folders[entry.path])
    const selected = choice?.kind === 'location' &&
      sourceKey(choice.source) === sourceKey(source) &&
      choice.path === entry.path
    return (
      <div className="knowledge-root-choice__branch" key={entry.path}>
        <div className="knowledge-root-choice__folder" style={{ '--knowledge-choice-depth': depth } as CSSProperties}>
          <button
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${entry.name}`}
            onClick={() => onToggle(entry.path)}
            type="button"
          >
            {loading === entry.path
              ? <LoaderCircle aria-hidden="true" size={14} />
              : expanded
                ? <ChevronDown aria-hidden="true" size={14} />
                : <ChevronRight aria-hidden="true" size={14} />}
          </button>
          <button
            aria-pressed={selected}
            onClick={() => onChoice({ kind: 'location', source, path: entry.path })}
            role="treeitem"
            type="button"
          >
            <Folder aria-hidden="true" size={16} />
            <span>{entry.name}</span>
          </button>
        </div>
        {expanded ? <FolderRows {...{
          source, choice, folders, loading, onChoice, onToggle,
          parent: entry.path, depth: depth + 1,
        }} /> : null}
      </div>
    )
  }) ?? null
}
