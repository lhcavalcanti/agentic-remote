import { Folder, FolderOpen, Plus } from 'lucide-react'
import type { ComputerSummary, KnowledgeRoot, ManagedSession } from '../shared/contracts'
import { shortPath } from './session-presentation'

export type KnowledgeRootChoice =
  | { kind: 'root'; rootId: string }
  | { kind: 'working-folder' }
  | { kind: 'none' }

export type KnowledgeRootSession = Pick<
  ManagedSession, 'id' | 'computerId' | 'computerName' | 'title' | 'cwd'
>

export function KnowledgeRootChoices({
  roots,
  computers,
  session,
  currentRootId,
  choice,
  disabled,
  onChoice,
  onBrowse,
  onRemove,
}: {
  roots: KnowledgeRoot[]
  computers: ComputerSummary[]
  session?: KnowledgeRootSession
  currentRootId?: string | null
  choice?: KnowledgeRootChoice
  disabled: boolean
  onChoice: (choice: KnowledgeRootChoice) => void
  onBrowse: () => void
  onRemove: (root: KnowledgeRoot) => void
}) {
  const online = (computerId: string) => computers.some((computer) => computer.id === computerId && computer.online)
  const workingRoot = session
    ? roots.find((root) => root.computerId === session.computerId && root.path === session.cwd)
    : undefined
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
                ? { kind: 'root', rootId: workingRoot.id }
                : { kind: 'working-folder' })}
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
              onChange={() => onChoice({ kind: 'root', rootId: root.id })}
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
