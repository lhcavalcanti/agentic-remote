import { useId } from 'react'
import { ChevronDown, FolderOpen, Link2, LoaderCircle } from 'lucide-react'
import type { KnowledgeRoot } from '../shared/contracts'
import { shortPath } from './session-presentation'

export function KnowledgeRootSelector({
  root,
  status,
  loading = false,
  onChoose,
  emptyLabel = 'Choose a session root',
}: {
  root?: KnowledgeRoot
  status: string
  loading?: boolean
  onChoose: () => void
  emptyLabel?: string
}) {
  const descriptionId = useId()
  return (
    <div className="knowledge-root-picker">
      <button
        aria-describedby={descriptionId}
        aria-label="Choose Knowledge root"
        className="knowledge-root-picker__trigger"
        disabled={loading && !root}
        onClick={onChoose}
        type="button"
      >
        <span className="knowledge-root-picker__icon">
          {loading ? <LoaderCircle aria-hidden="true" size={18} /> : <FolderOpen aria-hidden="true" size={18} />}
        </span>
        <span className="knowledge-root-picker__identity">
          <strong>{loading && !root ? 'Opening session root' : root?.name || emptyLabel}</strong>
          <small title={root ? `${root.computerName}: ${root.path}` : undefined}>
            {root ? `${root.computerName} / ${shortPath(root.path)}` : 'Link a folder from a trusted computer'}
          </small>
        </span>
        <ChevronDown aria-hidden="true" size={14} />
      </button>
      <p className="knowledge-root-picker__scope" id={descriptionId}>
        <Link2 aria-hidden="true" size={12} />
        <span>{status}</span>
        {root ? <span className="visually-hidden"> {root.computerName}: {root.path}</span> : null}
      </p>
    </div>
  )
}
