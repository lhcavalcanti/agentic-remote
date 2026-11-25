import { useState } from 'react'
import type { FormEvent } from 'react'
import { Check } from 'lucide-react'
import { SESSION_CATEGORY_NAME_MAX_LENGTH, type SessionCategory } from '../shared/session-categories'
import { DialogFrame } from './components/DialogFrame'

/**
 * Takes a category name: answers why it cannot be used, or nothing once the
 * change is under way, which closes the dialog.
 */
export type CategoryNameSubmit = (name: string) => string | undefined

function CategoryNameField({ name, onChange }: { name: string; onChange: (name: string) => void }) {
  return (
    <label className="field">
      <span>Category name</span>
      <input
        autoFocus
        className="dialog-input"
        maxLength={SESSION_CATEGORY_NAME_MAX_LENGTH}
        onChange={(event) => onChange(event.target.value)}
        value={name}
      />
    </label>
  )
}

export function CategoryNameDialog({
  mode,
  initialName = '',
  onSubmit,
  onClose,
}: {
  mode: 'create' | 'rename'
  initialName?: string
  onSubmit: CategoryNameSubmit
  onClose: () => void
}) {
  const [name, setName] = useState(initialName)
  const [error, setError] = useState<string>()
  function submit(event: FormEvent) {
    event.preventDefault()
    setError(onSubmit(name))
  }
  return (
    <DialogFrame
      eyebrow="Sessions"
      onClose={onClose}
      title={mode === 'create' ? 'New category' : 'Rename category'}
    >
      <form onSubmit={submit}>
        <CategoryNameField
          name={name}
          onChange={(next) => {
            setName(next)
            setError(undefined)
          }}
        />
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="primary-button dialog__submit" disabled={!name.trim()} type="submit">
          {mode === 'create' ? 'Create category' : 'Rename category'}
        </button>
      </form>
    </DialogFrame>
  )
}

/**
 * Where the open session goes: one of the categories, none, or a new one it
 * is moved into as the category is made.
 */
export function MoveToCategoryDialog({
  sessionTitle,
  categories,
  current,
  onMove,
  onCreate,
  onClose,
}: {
  sessionTitle: string
  categories: readonly Pick<SessionCategory, 'id' | 'name'>[]
  /** The category it is in now, or `null` for none. */
  current: string | null
  onMove: (categoryId: string | null) => void
  onCreate: CategoryNameSubmit
  onClose: () => void
}) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string>()
  const choices = [
    ...categories.map((category) => ({ id: category.id as string | null, name: category.name })),
    { id: null, name: 'No category' },
  ]
  return (
    <DialogFrame
      className="category-move-dialog"
      eyebrow={sessionTitle}
      onClose={onClose}
      title="Move to category"
    >
      <div aria-label="Categories" className="category-choices" role="group">
        {choices.map((choice) => (
          <button
            aria-current={choice.id === current ? 'true' : undefined}
            autoFocus={!creating && choice.id === current}
            className={`category-choice${choice.id === null ? ' category-choice--none' : ''}`}
            key={choice.id ?? ''}
            onClick={() => onMove(choice.id)}
            type="button"
          >
            <span className="category-choice__name">{choice.name}</span>
            {choice.id === current ? <Check aria-hidden="true" size={15} /> : null}
          </button>
        ))}
      </div>
      {creating ? (
        <form
          className="category-move-dialog__create"
          onSubmit={(event) => {
            event.preventDefault()
            setError(onCreate(name))
          }}
        >
          <CategoryNameField
            name={name}
            onChange={(next) => {
              setName(next)
              setError(undefined)
            }}
          />
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="primary-button dialog__submit" disabled={!name.trim()} type="submit">
            Create and move
          </button>
        </form>
      ) : (
        <button
          className="category-choice category-choice--new"
          onClick={() => setCreating(true)}
          type="button"
        >
          New category…
        </button>
      )}
    </DialogFrame>
  )
}

/** Asked once; the sessions stay listed, under their computers. */
export function DeleteCategoryDialog({
  name,
  sessions,
  onDelete,
  onClose,
}: {
  name: string
  /** How many of its sessions the list shows. */
  sessions: number
  onDelete: () => void
  onClose: () => void
}) {
  return (
    <DialogFrame className="session-root-dialog" eyebrow="Sessions" onClose={onClose} title="Delete category">
      <p className="dialog-message">
        Delete <strong>{name}</strong>?{' '}
        {sessions === 0
          ? 'It holds no sessions.'
          : sessions === 1
            ? 'Its 1 session stays, under its computer.'
            : `Its ${sessions} sessions stay, under their computers.`}
      </p>
      <div className="session-root-dialog__actions">
        <button className="secondary-button" onClick={onClose} type="button">Keep category</button>
        <button className="danger-button" onClick={onDelete} type="button">Delete category</button>
      </div>
    </DialogFrame>
  )
}
