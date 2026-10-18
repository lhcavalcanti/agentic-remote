import { useState, type FormEvent } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import type { ManagedQueuedBatch } from '../shared/contracts'
import {
  QUEUE_BATCH_MAX_PROMPTS,
  validateQueueBatch,
  type QueueBatchInput,
} from '../shared/queue-batch'
import { DialogFrame } from './components/DialogFrame'

/** Works on a plain-HTTP LAN address too, where `randomUUID` is unavailable. */
function newBatchId(): string {
  const bytes = new Uint8Array(16)
  globalThis.crypto.getRandomValues(bytes)
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

let nextRow = 0
const row = (text = '') => ({ key: (nextRow += 1), text })

/**
 * Writes several prompts to queue at once. Each stays its own queue item and
 * its own turn; the dialog never joins them. One batch ID is kept for the
 * life of the dialog, so retrying an unconfirmed send cannot queue it twice.
 */
export function QueueBatchDialog({
  sessionTitle,
  computerName,
  initialPrompt,
  onClose,
  onQueue,
}: {
  sessionTitle: string
  computerName: string
  initialPrompt: string
  onClose: () => void
  /** Resolves once the hub admitted the batch. */
  onQueue: (input: QueueBatchInput) => Promise<ManagedQueuedBatch>
}) {
  const [rows, setRows] = useState(() => [row(initialPrompt.trim()), row()])
  const [batchId] = useState(newBatchId)
  const [state, setState] = useState<'editing' | 'sending' | 'uncertain'>('editing')
  const [error, setError] = useState<string>()
  const locked = state !== 'editing'
  const prompts = rows.map((entry) => entry.text)
  let problem: string | undefined
  try {
    validateQueueBatch({ batchId, prompts })
  } catch (caught) {
    problem = caught instanceof Error ? caught.message : String(caught)
  }
  const characters = prompts.reduce((total, prompt) => total + prompt.trim().length, 0)

  const update = (change: (current: typeof rows) => typeof rows) => {
    setRows(change)
    setError(undefined)
  }
  const move = (index: number, by: -1 | 1) =>
    update((current) => {
      const next = [...current]
      ;[next[index], next[index + by]] = [next[index + by], next[index]]
      return next
    })

  const submit = async (event?: FormEvent) => {
    event?.preventDefault()
    if (problem || state === 'sending') return
    setState('sending')
    setError(undefined)
    try {
      await onQueue({ batchId, prompts })
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught)
      // The hub answers a batch it already admitted before refusing anything,
      // so a definite refusal, even of a retry, means nothing was queued.
      if ((caught as { uncertainDelivery?: unknown }).uncertainDelivery === true) {
        // Its outcome is unknown, so the prompts must stay exactly as sent
        // for a retry to be recognised rather than queued a second time.
        setState('uncertain')
        setError(
          `Couldn’t confirm the batch reached ${computerName}. Retry sends the same batch, so it can’t be queued twice.`,
        )
        return
      }
      setState('editing')
      setError(`Nothing was queued: ${message.replace(/\s*Nothing was queued\.?$/, '')}`)
    }
  }

  return (
    <DialogFrame
      className="queue-batch-dialog"
      eyebrow={sessionTitle}
      onClose={onClose}
      title="Queue several prompts"
    >
      <form className="queue-batch" onSubmit={(event) => void submit(event)}>
        <p className="dialog-message">
          Each prompt runs as its own turn, in this order, after anything already
          queued. Nothing is combined.
        </p>
        <ol className="queue-batch__list">
          {rows.map((entry, index) => (
            <li className="queue-batch__item" key={entry.key}>
              <span aria-hidden="true" className="queue-batch__label">Prompt {index + 1}</span>
              <textarea
                aria-label={`Prompt ${index + 1}`}
                className="dialog-input queue-batch__text"
                onChange={(event) => {
                  const text = event.target.value
                  update((current) => current.map((candidate) =>
                    candidate.key === entry.key ? { ...candidate, text } : candidate))
                }}
                readOnly={locked}
                rows={3}
                value={entry.text}
              />
              <div className="queue-batch__item-actions">
                <button
                  aria-label={`Move prompt ${index + 1} up`}
                  className="icon-button"
                  disabled={locked || index === 0}
                  onClick={() => move(index, -1)}
                  type="button"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  aria-label={`Move prompt ${index + 1} down`}
                  className="icon-button"
                  disabled={locked || index === rows.length - 1}
                  onClick={() => move(index, 1)}
                  type="button"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  aria-label={`Remove prompt ${index + 1}`}
                  className="icon-button icon-button--danger"
                  disabled={locked || rows.length === 1}
                  onClick={() => update((current) => current.filter((candidate) => candidate.key !== entry.key))}
                  type="button"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ol>
        <div className="queue-batch__footer">
          <button
            className="secondary-button"
            disabled={locked || rows.length >= QUEUE_BATCH_MAX_PROMPTS}
            onClick={() => update((current) => [...current, row()])}
            type="button"
          >
            <Plus size={14} /> Add prompt
          </button>
          <span className="queue-batch__summary">
            {rows.length} {rows.length === 1 ? 'prompt' : 'prompts'} · {characters.toLocaleString('en-US')} characters
          </span>
        </div>
        {rows.length >= QUEUE_BATCH_MAX_PROMPTS ? (
          <p className="dialog-message">{QUEUE_BATCH_MAX_PROMPTS} prompts is the most one batch can hold.</p>
        ) : null}
        {problem && !error ? <p className="dialog-message queue-batch__problem">{problem}</p> : null}
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button
          className="primary-button dialog__submit"
          disabled={Boolean(problem) || state === 'sending'}
          type="submit"
        >
          {state === 'sending'
            ? 'Queueing…'
            : state === 'uncertain'
              ? 'Retry'
              : `Queue ${rows.length} ${rows.length === 1 ? 'prompt' : 'prompts'}`}
        </button>
      </form>
    </DialogFrame>
  )
}
