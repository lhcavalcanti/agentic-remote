import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Folder, FolderOpen, Plus, Save } from 'lucide-react'
import type { ComputerSummary, KnowledgeRoot, ManagedSession } from '../shared/contracts'
import {
  knowledgeAbsolutePath,
  knowledgeRelativePathFromAbsolute,
  normalizeKnowledgeRelativePath,
} from '../shared/knowledge-path'
import { listDirectories } from './api'
import { shortPath } from './session-presentation'

export type KnowledgeRootChoice =
  | { kind: 'root'; rootId: string; rootPath: string }
  | { kind: 'working-folder'; rootPath: string }
  | { kind: 'none' }

export type KnowledgeRootSession = Pick<
  ManagedSession, 'id' | 'computerId' | 'computerName' | 'title' | 'cwd'
>

export function KnowledgeRootChoices({
  roots,
  computers,
  session,
  currentRootId,
  currentRootPath,
  choice,
  disabled,
  onChoice,
  onBrowse,
  onRemove,
  onSaveRoot,
  savingRoot = false,
}: {
  roots: KnowledgeRoot[]
  computers: ComputerSummary[]
  session?: KnowledgeRootSession
  currentRootId?: string | null
  currentRootPath?: string
  choice?: KnowledgeRootChoice
  disabled: boolean
  onChoice: (choice: KnowledgeRootChoice) => void
  onBrowse: () => void
  onRemove: (root: KnowledgeRoot) => void
  onSaveRoot?: (location: { computerId: string; path: string }) => void
  savingRoot?: boolean
}) {
  const online = (computerId: string) => computers.some((computer) => computer.id === computerId && computer.online)
  const workingRoot = session
    ? roots.find((root) => root.computerId === session.computerId && root.path === session.cwd)
    : undefined
  const selectedLocation = (() => {
    if (!session || !choice || choice.kind === 'none') return undefined
    if (choice.kind === 'working-folder') {
      return {
        computerId: session.computerId,
        basePath: session.cwd,
        rootPath: normalizeKnowledgeRelativePath(choice.rootPath),
      }
    }
    const root = roots.find((candidate) => candidate.id === choice.rootId)
    return root
      ? {
          computerId: root.computerId,
          basePath: root.path,
          rootPath: normalizeKnowledgeRelativePath(choice.rootPath),
        }
      : undefined
  })()
  const [browserState, setBrowserState] = useState<{
    key: string
    listing?: Awaited<ReturnType<typeof listDirectories>>
    error?: string
  }>()
  const directoryRequest = useRef(0)
  const selectedComputerId = selectedLocation?.computerId
  const selectedBasePath = selectedLocation?.basePath
  const selectedRootPath = selectedLocation?.rootPath
  const locationKey = selectedLocation
    ? `${selectedLocation.computerId}:${selectedLocation.basePath}:${selectedLocation.rootPath}`
    : ''

  useEffect(() => {
    if (
      !selectedComputerId ||
      !selectedBasePath ||
      !selectedRootPath ||
      !locationKey
    ) {
      directoryRequest.current += 1
      return
    }
    let active = true
    const request = ++directoryRequest.current
    void listDirectories(
      selectedComputerId,
      knowledgeAbsolutePath(selectedBasePath, selectedRootPath),
      'all',
    )
      .then((next) => {
        if (active && request === directoryRequest.current) {
          knowledgeRelativePathFromAbsolute(selectedBasePath, next.path)
          setBrowserState({ key: locationKey, listing: next })
        }
      })
      .catch((caught: unknown) => {
        if (active && request === directoryRequest.current) {
          setBrowserState({
            key: locationKey,
            error: caught instanceof Error ? caught.message : String(caught),
          })
        }
      })
    return () => {
      active = false
    }
  }, [
    locationKey,
    selectedBasePath,
    selectedComputerId,
    selectedRootPath,
  ])

  const listing = browserState?.key === locationKey
    ? browserState.listing
    : undefined
  const browserError = browserState?.key === locationKey
    ? browserState.error
    : undefined
  const loading = Boolean(locationKey && browserState?.key !== locationKey)

  function choosePath(path: string) {
    if (!selectedLocation || !choice || choice.kind === 'none') return
    try {
      const rootPath = knowledgeRelativePathFromAbsolute(
        selectedLocation.basePath,
        path,
      )
      onChoice({ ...choice, rootPath })
    } catch (caught) {
      setBrowserState({
        key: locationKey,
        error: caught instanceof Error ? caught.message : String(caught),
      })
    }
  }

  const currentPath = listing?.path || (selectedLocation
    ? knowledgeAbsolutePath(selectedLocation.basePath, selectedLocation.rootPath)
    : undefined)
  const currentFolderSaved = Boolean(
    selectedLocation &&
    currentPath &&
    roots.some(
      (root) =>
        root.computerId === selectedLocation.computerId &&
        root.path === currentPath,
    ),
  )
  return (
    <fieldset className="knowledge-root-choices" disabled={disabled}>
      <legend className="visually-hidden">Knowledge folder choices</legend>
      {session ? (
        <>
          <h3>Start from the session folder</h3>
          <label className="knowledge-root-choice">
            <input
              aria-label="Use this session's folder"
              checked={choice?.kind === 'working-folder' || (
                choice?.kind === 'root' && choice.rootId === workingRoot?.id
              )}
              disabled={!online(session.computerId)}
              name="knowledge-root-choice"
              onChange={() => onChoice(workingRoot
                ? { kind: 'root', rootId: workingRoot.id, rootPath: '.' }
                : { kind: 'working-folder', rootPath: '.' })}
              type="radio"
            />
            <FolderOpen aria-hidden="true" size={18} />
            <span>
              <strong>Use this session's folder</strong>
              <small>{session.computerName} / {shortPath(session.cwd)}</small>
            </span>
            {!online(session.computerId) ? <em>Offline</em> : null}
          </label>
        </>
      ) : null}
      <h3>{session ? 'Or choose from Knowledge' : 'Knowledge library'}</h3>
      <div className="knowledge-root-choices__list">
        {roots.filter((root) => root.id !== workingRoot?.id).map((root) => (
          <label className="knowledge-root-choice" key={root.id}>
            <input
              aria-label={`${root.name} on ${root.computerName}: ${root.path}`}
              checked={choice?.kind === 'root' && choice.rootId === root.id}
              disabled={!online(root.computerId)}
              name="knowledge-root-choice"
              onChange={() => onChoice({
                kind: 'root',
                rootId: root.id,
                rootPath:
                  root.id === currentRootId
                    ? normalizeKnowledgeRelativePath(currentRootPath)
                    : '.',
              })}
              type="radio"
            />
            <Folder aria-hidden="true" size={18} />
            <span>
              <strong>{root.name}</strong>
              <small>{root.computerName} / {shortPath(root.path)}</small>
            </span>
            {!online(root.computerId) ? <em>Offline</em> : root.id === currentRootId ? <em>Current</em> : null}
          </label>
        ))}
        {roots.length === 0 ? <p className="dialog-message">No Knowledge folders have been added yet.</p> : null}
      </div>
      {session && selectedLocation && currentPath ? (
        <section
          aria-label="Choose a folder inside the selected root"
          className="knowledge-root-browser"
        >
          <header>
            <span>
              <strong>Root this session here</strong>
              <small>{shortPath(currentPath)}</small>
            </span>
            {!currentFolderSaved && onSaveRoot ? (
              <button
                disabled={disabled || loading || savingRoot || !listing}
                onClick={() => onSaveRoot({
                  computerId: selectedLocation.computerId,
                  path: currentPath,
                })}
                type="button"
              >
                <Save aria-hidden="true" size={14} />
                {savingRoot ? 'Saving…' : 'Save this root folder'}
              </button>
            ) : (
              <em>Saved root</em>
            )}
          </header>
          <p>Browsing only changes this pending session choice.</p>
          <div className="knowledge-root-browser__folders">
            {selectedLocation.rootPath !== '.' && listing?.parent ? (
              <button
                disabled={disabled || loading}
                onClick={() => choosePath(listing.parent!)}
                type="button"
              >
                <ArrowUp aria-hidden="true" size={15} />
                <span>Parent folder</span>
              </button>
            ) : null}
            {listing?.directories.map((directory) => (
              <button
                disabled={disabled || loading}
                key={directory.path}
                onClick={() => choosePath(directory.path)}
                type="button"
              >
                <FolderOpen aria-hidden="true" size={15} />
                <span>{directory.name}</span>
              </button>
            ))}
            {loading ? <span role="status">Loading subfolders…</span> : null}
            {!loading && listing?.directories.length === 0 ? (
              <span>No subfolders here.</span>
            ) : null}
          </div>
          {browserError ? <p className="form-error" role="alert">{browserError}</p> : null}
        </section>
      ) : null}
      {session && currentRootId ? (
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
