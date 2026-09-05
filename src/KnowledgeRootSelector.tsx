import { ChevronDown, FolderOpen, Trash2 } from 'lucide-react'
import type { KnowledgeRoot } from '../shared/contracts'

export function KnowledgeRootSelector({
  roots,
  activeId,
  onSelect,
  onRemove,
}: {
  roots: KnowledgeRoot[]
  activeId?: string
  onSelect: (id: string) => void
  onRemove: (id: string) => void
}) {
  const selected = roots.find((root) => root.id === activeId)
  return (
    <div className="knowledge-root-picker">
      <div className="knowledge-root-picker__controls">
        <label className="knowledge-root-picker__select">
          <FolderOpen aria-hidden="true" size={16} />
          <select
            aria-label="Knowledge root"
            onChange={(event) => onSelect(event.target.value)}
            title={selected ? `${selected.computerName}: ${selected.path}` : 'Choose a knowledge folder'}
            value={selected?.id || ''}
          >
            {!selected ? <option disabled value="">Choose a folder</option> : null}
            {roots.map((root) => (
              <option key={root.id} value={root.id}>
                {root.name} · {root.computerName}
                {roots.some((other) => other.id !== root.id &&
                  other.name === root.name && other.computerName === root.computerName)
                  ? ` · ${root.path}` : ''}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" size={13} />
        </label>
        {selected ? (
          <button
            aria-label={`Remove ${selected.name} root`}
            className="icon-button icon-button--danger"
            onClick={() => onRemove(selected.id)}
            type="button"
          >
            <Trash2 aria-hidden="true" size={14} />
          </button>
        ) : null}
      </div>
      {selected ? (
        <p className="knowledge-root-picker__path" title={selected.path}>{selected.path}</p>
      ) : null}
    </div>
  )
}
