import { useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { LoaderCircle, MessageCircleQuestion, X } from 'lucide-react'
import { remarkSafeBreaks } from './remark-safe-breaks'

export interface SideQuestionEntry {
  id: string
  question: string
  status: 'pending' | 'answered' | 'failed'
  answer?: string
  error?: string
}

/**
 * A session's side questions. While it is open the message bar asks here
 * instead of messaging the session, and the draft typed for the session is
 * left as it was.
 */
export interface SideThread {
  open: boolean
  draft: string
  entries: SideQuestionEntry[]
}

/** The thread docked above the message bar while asking aside. */
export function SideQuestionPanel({
  entries,
  unavailableReason,
  markdownComponents,
  onRetry,
  onClear,
  onClose,
}: {
  entries: SideQuestionEntry[]
  unavailableReason?: string
  markdownComponents?: Components
  onRetry: (entry: SideQuestionEntry) => void
  onClear: () => void
  onClose: () => void
}) {
  const listRef = useRef<HTMLOListElement>(null)
  const pending = entries.some((entry) => entry.status === 'pending')

  const latest = entries.at(-1)
  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [latest?.id, latest?.status])

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Escape' || event.nativeEvent.isComposing) return
    event.preventDefault()
    onClose()
  }

  return (
    <section aria-label="Side questions" className="side-thread" onKeyDown={onKeyDown}>
      <header className="side-thread__header">
        <MessageCircleQuestion aria-hidden="true" className="side-thread__icon" size={15} />
        <p className="side-thread__title">
          <strong>Side questions</strong>
          <span>Answered from this conversation. Nothing is sent to the session.</span>
        </p>
        {entries.length && !pending ? (
          <button className="side-thread__clear" onClick={onClear} type="button">
            Clear
          </button>
        ) : null}
        <button
          aria-label="Back to message"
          className="icon-button side-thread__close"
          onClick={onClose}
          title="Back to your message (Esc)"
          type="button"
        >
          <X size={16} />
        </button>
      </header>
      {entries.length ? (
        <ol
          aria-label="Side question thread"
          aria-live="polite"
          className="side-question-list"
          ref={listRef}
        >
          {entries.map((entry) => (
            <li
              aria-busy={entry.status === 'pending'}
              className={`side-question side-question--${entry.status}`}
              key={entry.id}
            >
              <p className="side-question__question">
                <MessageCircleQuestion aria-hidden="true" size={14} />
                <span>{entry.question}</span>
              </p>
              {entry.status === 'pending' ? (
                <p className="side-question__thinking" role="status">
                  <LoaderCircle
                    aria-hidden="true"
                    className="activity-message__spinner"
                    size={14}
                  />
                  Thinking…
                </p>
              ) : entry.status === 'failed' ? (
                <div className="side-question__failure">
                  <p className="form-error" role="alert">{entry.error}</p>
                  <button
                    className="secondary-button"
                    disabled={pending || Boolean(unavailableReason)}
                    onClick={() => onRetry(entry)}
                    type="button"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div className="side-question__answer message__content">
                  <ReactMarkdown
                    components={markdownComponents}
                    remarkPlugins={[remarkGfm, remarkSafeBreaks]}
                  >
                    {entry.answer || ''}
                  </ReactMarkdown>
                </div>
              )}
            </li>
          ))}
        </ol>
      ) : null}
      {unavailableReason ? (
        <p className="side-thread__unavailable" role="status">{unavailableReason}</p>
      ) : null}
    </section>
  )
}
