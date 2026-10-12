import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { LoaderCircle, MessageCircleQuestion } from 'lucide-react'
import { DialogFrame } from './components/DialogFrame'
import { remarkSafeBreaks } from './remark-safe-breaks'
import { SIDE_QUESTION_MAX_LENGTH } from '../shared/side-question'
import { phoneEnterCreatesNewline } from './enter-behavior'

export interface SideQuestionEntry {
  id: string
  question: string
  status: 'pending' | 'answered' | 'failed'
  answer?: string
  error?: string
}

export function SideQuestionDialog({
  sessionTitle,
  entries,
  unavailableReason,
  markdownComponents,
  onAsk,
  onRetry,
  onClose,
}: {
  sessionTitle: string
  entries: SideQuestionEntry[]
  unavailableReason?: string
  markdownComponents?: Components
  onAsk: (question: string) => void
  onRetry: (entry: SideQuestionEntry) => void
  onClose: () => void
}) {
  const [question, setQuestion] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const pending = entries.some((entry) => entry.status === 'pending')
  const trimmed = question.trim()
  const canAsk = Boolean(trimmed) && !pending && !unavailableReason

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const latest = entries.at(-1)
  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [latest?.id, latest?.status])

  function submit(event?: FormEvent) {
    event?.preventDefault()
    if (!canAsk) return
    onAsk(trimmed)
    setQuestion('')
  }

  // Return behaves as it does in the composer: it asks on a desktop and adds a
  // line on a phone, where the Ask button sends.
  const returnAddsLine = phoneEnterCreatesNewline()
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
    if (event.ctrlKey || event.metaKey || (!returnAddsLine && !event.shiftKey)) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <DialogFrame
      className="side-question-dialog"
      eyebrow="Side question"
      onClose={onClose}
      title="Ask about this session"
    >
      <p className="dialog-message side-question-dialog__intro">
        Answered from <strong>{sessionTitle}</strong>’s conversation without
        tools. Nothing is sent to the session, and answers are gone when you
        reload.
      </p>
      {entries.length ? (
        <ol
          aria-label="Side questions"
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
                <MessageCircleQuestion aria-hidden="true" size={15} />
                <span>{entry.question}</span>
              </p>
              {entry.status === 'pending' ? (
                <p className="side-question__thinking" role="status">
                  <LoaderCircle
                    aria-hidden="true"
                    className="activity-message__spinner"
                    size={15}
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
      <form className="side-question-form" onSubmit={submit}>
        <label className="field">
          <span>Question</span>
          <textarea
            aria-label="Side question"
            maxLength={SIDE_QUESTION_MAX_LENGTH}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="What do you want to know about this conversation?"
            ref={inputRef}
            rows={3}
            value={question}
          />
        </label>
        {unavailableReason ? (
          <p className="form-error" role="status">{unavailableReason}</p>
        ) : null}
        <div className="side-question-form__actions">
          <small className="field__hint">
            {returnAddsLine
              ? 'Return adds a new line. Tap Ask to send.'
              : 'Enter to ask, Shift+Enter for a new line.'}
          </small>
          <button className="primary-button" disabled={!canAsk} type="submit">
            {pending ? 'Waiting…' : 'Ask'}
          </button>
        </div>
      </form>
    </DialogFrame>
  )
}
