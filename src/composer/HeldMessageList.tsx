import { Pencil, X } from 'lucide-react'
import { waitsForEditedMessage, type HeldQueue } from '../held-messages'

/**
 * Messages sent before their session could take them. They go to it in this
 * order once it can; until one is being handed over it can be edited, which
 * takes it back to the composer, or removed.
 */
export function HeldMessageList({
  queue,
  starting,
  onEdit,
  onRemove,
  onRetry,
}: {
  queue: HeldQueue
  /** The session does not exist yet. */
  starting: boolean
  onEdit: (id: string) => void
  onRemove: (id: string) => void
  onRetry: () => void
}) {
  const failure = queue.failure
  return (
    <section aria-label="Held messages" className="queued-prompts held-messages">
      <header>
        <strong>
          {starting
            ? 'Will send when the session starts'
            : failure ? 'Not sent yet'
              : !queue.sending && waitsForEditedMessage(queue)
                ? 'Waiting for the message you are editing'
                : 'Sending to the session'}
        </strong>
        <span>{queue.messages.length}</span>
      </header>
      {failure ? (
        <div className="held-messages__failure" role="alert">
          <span>
            {failure.message}
            {failure.uncertain
              ? ' It may already have been sent: check the conversation before trying again.'
              : ''}
          </span>
          <button className="queued-edit-banner__save" onClick={onRetry} type="button">
            Try again
          </button>
        </div>
      ) : null}
      <ol className="queued-prompts__list held-messages__list">
        {queue.messages.map((message, index) => {
          const sending = queue.sending === message.id
          return (
            <li
              className={`queued-prompt queued-prompt--held${sending ? ' queued-prompt--sending' : ''}`}
              key={message.id}
            >
              <span className="queued-prompt__text">{message.text}</span>
              <button
                aria-label={`Edit held message ${index + 1}`}
                className="icon-button"
                disabled={sending}
                onClick={() => onEdit(message.id)}
                title={sending ? 'Being sent now' : 'Edit in the message bar'}
                type="button"
              >
                <Pencil size={14} />
              </button>
              <button
                aria-label={`Remove held message ${index + 1}`}
                className="icon-button icon-button--danger"
                disabled={sending}
                onClick={() => onRemove(message.id)}
                title={sending ? 'Being sent now' : 'Remove without sending'}
                type="button"
              >
                <X size={15} />
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
