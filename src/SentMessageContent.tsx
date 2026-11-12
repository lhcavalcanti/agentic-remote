import { useContext, useId, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { isLongSentMessage, PauseFollowingContext } from './sent-message'

/**
 * The text of a message the user sent. A long one starts collapsed behind
 * Show all; the stylesheet confines collapsing to phones and touch devices,
 * and the whole text always stays in the page for copying and screen readers.
 */
export function SentMessageContent({
  content,
  className,
  children,
}: {
  content: string
  className: string
  children: ReactNode
}) {
  const [expanded, setExpanded] = useState(false)
  const pauseFollowing = useContext(PauseFollowingContext)
  const id = useId()
  const contentRef = useRef<HTMLDivElement>(null)
  const collapsedByReader = useRef(false)

  useLayoutEffect(() => {
    if (expanded || !collapsedByReader.current) return
    collapsedByReader.current = false
    // Collapsing pulls everything below it up, which can leave the message
    // above the view; bring it back to where the reader is.
    contentRef.current?.closest('.message')?.scrollIntoView?.({ block: 'nearest' })
  }, [expanded])

  if (!isLongSentMessage(content)) return <div className={className}>{children}</div>
  return (
    <>
      <div
        className={expanded ? className : `${className} message__content--collapsed`}
        id={id}
        ref={contentRef}
      >
        {children}
      </div>
      <button
        aria-controls={id}
        aria-expanded={expanded}
        className="message__expand"
        onClick={() => {
          if (expanded) collapsedByReader.current = true
          else pauseFollowing()
          setExpanded(!expanded)
        }}
        type="button"
      >
        {expanded ? 'Show less' : 'Show all'}
      </button>
    </>
  )
}
