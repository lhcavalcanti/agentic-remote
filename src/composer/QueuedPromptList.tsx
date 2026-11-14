import { closestCenter, DndContext } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, X } from 'lucide-react'
import type { QueuedPrompt } from '../../shared/contracts'
import type { ComposerProps } from './types'

/** One waiting message, draggable so the queue can be put in order. */
function SortableQueuedPrompt({
  prompt,
  index,
  editing,
  busy,
  suspended,
  retained,
  steering,
  onEdit,
  onRemove,
}: {
  prompt: QueuedPrompt
  index: number
  editing: boolean
  busy: boolean
  suspended: boolean
  retained: boolean
  steering: boolean
  onEdit: () => void
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `queued:${prompt.id}`, disabled: retained })
  // A retained session's queue is kept exactly as it was until Reopen.
  const retainedTitle = retained ? 'Reopen this session to change its queue' : undefined
  return (
    <div
      className={`queued-prompt${editing ? ' queued-prompt--editing' : ''}${
        isDragging ? ' sortable-dragging' : ''
      }`}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <span
        aria-label={`Reorder queued prompt ${index + 1}`}
        className="drag-handle"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={13} />
      </span>
      <span>
        {steering && (
          <strong
            className="queued-prompt__steer"
            title="Waits for an empty terminal composer, then joins the running turn at the next safe input point"
          >
            Steer ·{' '}
          </strong>
        )}
        {prompt.content}
      </span>
      <button
        aria-label={`Edit queued prompt ${index + 1}`}
        className={`icon-button${editing ? ' icon-button--active' : ''}`}
        // The composer is closed while a session is put down, so opening a
        // message for rewriting there gave a banner over a box that could not
        // be typed in.
        disabled={busy || suspended || retained}
        onClick={onEdit}
        title={retainedTitle ?? (suspended ? 'Resume this session to rewrite it' : undefined)}
        type="button"
      >
        <Pencil size={14} />
      </button>
      <button
        aria-label={`Remove queued prompt ${index + 1}`}
        className="icon-button icon-button--danger"
        disabled={busy || retained}
        onClick={onRemove}
        title={retainedTitle}
        type="button"
      >
        <X size={15} />
      </button>
    </div>
  )
}

export function QueuedPromptList({
  selected,
  selectedRetained,
  selectedQueueHeadIsSteering,
  queueActionId,
  sending,
  editingQueuedPromptId,
  sensors,
  onQueueDragEnd,
  onEditQueuedPrompt,
  onRemoveQueuedPrompt,
}: Pick<ComposerProps,
  'selected' | 'selectedRetained' | 'selectedQueueHeadIsSteering' | 'queueActionId' |
  'sending' | 'editingQueuedPromptId' | 'sensors' | 'onQueueDragEnd' |
  'onEditQueuedPrompt' | 'onRemoveQueuedPrompt'
>) {
  return (
    <section
      aria-description={
        selectedRetained
          ? 'Messages retained until this session is reopened'
          : selectedQueueHeadIsSteering
            ? 'The next message is waiting for a safe terminal composer to join the running turn'
            : 'Messages waiting for later delivery'
      }
      aria-label={
        selectedRetained
          ? 'Retained prompts'
          : selectedQueueHeadIsSteering ? 'Steering prompts' : 'Queued prompts'
      }
      className="queued-prompts"
    >
      <header>
        <strong>
          {selectedRetained
            ? 'Retained until reopened'
            : selectedQueueHeadIsSteering ? 'Steering when ready' : 'Queued for later'}
        </strong>
        <span>{selected.queuedPrompts!.length}</span>
      </header>
      <DndContext
        collisionDetection={closestCenter}
        id="prompt-queue"
        onDragEnd={onQueueDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={selected.queuedPrompts!.map((prompt) => `queued:${prompt.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="queued-prompts__list">
            {selected.queuedPrompts!.map((prompt, index) => (
              <SortableQueuedPrompt
                busy={Boolean(queueActionId) || sending || Boolean(selected.queuedDispatch)}
                editing={editingQueuedPromptId === prompt.id}
                index={index}
                key={prompt.id}
                onEdit={() => onEditQueuedPrompt(prompt)}
                onRemove={() => onRemoveQueuedPrompt(prompt.id)}
                suspended={selected.suspended === true}
                retained={selectedRetained}
                prompt={prompt}
                steering={index === 0 && selectedQueueHeadIsSteering}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  )
}
