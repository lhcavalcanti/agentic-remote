import { useEffect, useId, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ChatMessage } from '../../shared/contracts'
import type { PromptAcceptanceReceipt } from '../../shared/launch-identity'
import { DialogFrame } from '../components/DialogFrame'
import { filterSentMessages, type SentHistoryContext } from './composer-state'

export function SentMessages({
  messages, receipts, sessionState, onChoose, onCancel, onUse,
}: {
  messages: readonly ChatMessage[]
  receipts?: readonly PromptAcceptanceReceipt[]
  sessionState?: SentHistoryContext
  onChoose: (id: string) => void
  onCancel: () => void
  onUse: () => void
}) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(-1)
  const [chosen, setChosen] = useState<string>()
  const listId = useId()
  const matches = useMemo(
    () => filterSentMessages(messages, query, receipts, sessionState),
    [messages, query, receipts, sessionState],
  )
  const activeId = active >= 0 && matches[active] ? `${listId}-${matches[active].id}` : undefined
  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView?.({ block: 'nearest' })
  }, [activeId])
  const choose = (message: ChatMessage) => {
    setChosen(message.id)
    onChoose(message.id)
  }
  const nextIndex = (key: string, index: number) => !matches.length ? -1 : index < 0
    ? key === 'ArrowDown' ? 0 : matches.length - 1
    : (index + (key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length
  return createPortal(
    <div style={{ display: 'contents' }} onKeyDown={(event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onCancel()
      }
    }}>
      <DialogFrame title="Sent messages" eyebrow="This session" className="composer-history" onClose={onCancel}>
        <input
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded="true"
          aria-label="Search sent messages"
          autoFocus={!window.matchMedia?.('(pointer: coarse), (max-width: 600px)').matches}
          className="composer-history__search"
          onChange={(event) => { setQuery(event.target.value); setActive(-1) }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault()
              setActive((index) => nextIndex(event.key, index))
            } else if (event.key === 'Enter' && matches.length) {
              event.preventDefault()
              choose(matches[Math.max(0, Math.min(active, matches.length - 1))])
            }
          }}
          placeholder="Search full message text…"
          role="combobox"
          type="search"
          value={query}
        />
        <div
          aria-label="Sent messages" className="composer-history__list" id={listId} role="listbox"
          onKeyDown={(event) => {
            if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && matches.length) {
              event.preventDefault()
              const next = nextIndex(event.key, active)
              setActive(next)
              document.getElementById(`${listId}-${matches[next].id}`)?.focus()
            }
          }}
        >
          {matches.map((message, index) => (
            <button
              aria-selected={message.id === chosen}
              className={`composer-history__message${active === index ? ' composer-history__message--active' : ''}`}
              id={`${listId}-${message.id}`}
              key={message.id}
              onClick={() => choose(message)}
              onFocus={() => setActive(index)}
              role="option"
              tabIndex={index === Math.max(0, active) ? 0 : -1}
              type="button"
            >
              <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString(undefined, {
                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
              })}</time>
              <span>{message.content}</span>
            </button>
          ))}
          {!matches.length ? <p role="status">{query.trim() ? 'No matching sent messages.' : 'No sent messages yet.'}</p> : null}
        </div>
        <p className="composer-history__hint" role="status">
          {chosen ? 'Loaded into the composer, not sent. Cancel restores your draft.' : 'Choose a message to preview it. Your unsent draft stays parked.'}
        </p>
        <div className="composer-history__actions">
          <button className="secondary-button" onClick={onCancel} type="button">Cancel</button>
          <button className="primary-button" disabled={!chosen} onClick={onUse} type="button">Use message</button>
        </div>
      </DialogFrame>
    </div>,
    // Inherit visual-viewport geometry without entering the composer's containing block.
    document.querySelector('.app-shell') ?? document.body,
  )
}
