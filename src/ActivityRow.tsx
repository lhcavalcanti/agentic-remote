import { ChevronRight } from 'lucide-react'
import { memo, useContext, useId, useLayoutEffect, useRef } from 'react'
import type { ChatMessage } from '../shared/contracts'
import { toolCallIdFromActivityId } from '../shared/activity-details'
import { ActivityDetailsPanel } from './ActivityDetails'
import {
  activityPresentation,
  activityStatusFromMessage,
  activityStatusGlyph,
  activityStatusLabel,
  compactActivityText,
  formatActivityDuration,
} from './activity-presentation'
import { PauseFollowingContext } from './sent-message'

interface ActivityRowProps {
  message: ChatMessage
  computerId: string
  sessionId: string
  /** The tool the session is running now. */
  current: boolean
  expanded: boolean
  /** Stable for the whole transcript, so an unchanged row is not drawn again. */
  onToggle: (messageId: string) => void
}

/**
 * One tool call in the transcript. A row for a call the session logged opens
 * in place onto the complete call; the rest stay a one-line summary.
 */
function ActivityRowView({ message, computerId, sessionId, current, expanded, onToggle }: ActivityRowProps) {
  const pauseFollowing = useContext(PauseFollowingContext)
  const panelId = useId()
  const articleRef = useRef<HTMLElement>(null)
  const collapsedByReader = useRef(false)
  const toolCallId = toolCallIdFromActivityId(message.id)
  const presentation = activityPresentation(message)
  const status = activityStatusFromMessage(message)
  const isMcp = message.content.startsWith('MCP ·')
  const isAgent = presentation.kind === 'agent'
  const isHeading = presentation.kind === 'skill' || presentation.kind === 'agent'

  useLayoutEffect(() => {
    if (expanded || !collapsedByReader.current) return
    collapsedByReader.current = false
    // Closing pulls everything below up, which can leave the row above the
    // view; bring it back to where the reader is.
    articleRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [expanded])

  const result =
    message.activityResult ||
    (status === 'failed'
      ? 'Error: tool failed; inspect the session log'
      : isAgent && status !== 'completed'
        ? 'still working'
        : undefined)
  const legacyTitle = presentation.title
  const duration = formatActivityDuration(message.activityDurationMs)
  const accessibleDetails = [
    `${activityStatusLabel(status)}: ${legacyTitle}`,
    result,
    message.activityDurationMs === undefined ? undefined : `${duration} duration`,
  ]
    .filter(Boolean)
    .join('; ')
  const className = `activity-message activity-message--${status}${
    isMcp ? ' activity-message--mcp' : ''
  }${isAgent ? ' activity-message--agent' : ''}${
    isHeading ? ' activity-message--heading' : ''
  }${toolCallId ? ' activity-message--toggle' : ''}`
  const summary = (
    <>
      <span aria-hidden="true" className="activity-message__glyph">
        {activityStatusGlyph(status)}
      </span>
      <span className="activity-message__body">
        <strong className="activity-message__name">{presentation.name}</strong>
        {presentation.origin ? (
          <span className="activity-message__origin">
            {' '}
            {presentation.origin}
          </span>
        ) : null}
        {presentation.summary ? (
          <>
            <span className="activity-message__separator"> · </span>
            <span className="activity-message__summary">
              {compactActivityText(presentation.summary)}
            </span>
          </>
        ) : null}
        {presentation.arguments ? (
          <>
            <span className="activity-message__separator"> · </span>
            <span className="activity-message__arguments">
              {presentation.arguments}
            </span>
          </>
        ) : null}
        {result ? (
          <>
            <span className="activity-message__separator"> · </span>
            <span className="activity-message__result" title={result}>
              {compactActivityText(result)}
            </span>
          </>
        ) : null}
      </span>
      <span
        aria-label={
          message.activityDurationMs === undefined
            ? 'No duration recorded'
            : `${duration} duration`
        }
        className="activity-message__duration"
      >
        {duration}
      </span>
      {toolCallId ? (
        <ChevronRight aria-hidden="true" className="activity-message__chevron" size={12} />
      ) : null}
      {legacyTitle !== presentation.name ? (
        <span aria-hidden="true" className="activity-message__legacy-title">
          {legacyTitle}
        </span>
      ) : null}
    </>
  )
  const line = toolCallId ? (
    <button
      aria-controls={expanded ? panelId : undefined}
      aria-expanded={expanded}
      aria-label={accessibleDetails}
      className={className}
      onClick={() => {
        if (expanded) collapsedByReader.current = true
        // Opening is the reader going somewhere, as scrolling up would be.
        else pauseFollowing()
        onToggle(message.id)
      }}
      title={legacyTitle}
      type="button"
    >
      {summary}
    </button>
  ) : (
    <div aria-label={accessibleDetails} className={className} title={legacyTitle}>
      {summary}
    </div>
  )
  return (
    <article
      className={`message message--activity ${
        current ? 'tool-activity-slot' : 'tool-activity-history'
      }${expanded && toolCallId ? ' message--activity-expanded' : ''}`}
      ref={articleRef}
    >
      {isHeading ? (
        <div aria-level={3} className="activity-message__heading" role="heading">
          {line}
        </div>
      ) : line}
      {expanded && toolCallId ? (
        <ActivityDetailsPanel
          computerId={computerId}
          id={panelId}
          sessionId={sessionId}
          status={status}
          toolCallId={toolCallId}
        />
      ) : null}
    </article>
  )
}

function sameActivityRow(previous: ActivityRowProps, next: ActivityRowProps): boolean {
  const left = previous.message
  const right = next.message
  return (
    previous.computerId === next.computerId &&
    previous.sessionId === next.sessionId &&
    previous.current === next.current &&
    previous.expanded === next.expanded &&
    previous.onToggle === next.onToggle &&
    left.id === right.id &&
    left.content === right.content &&
    left.createdAt === right.createdAt &&
    left.activityStatus === right.activityStatus &&
    left.activityKind === right.activityKind &&
    left.activityResult === right.activityResult &&
    left.activityDurationMs === right.activityDurationMs
  )
}

/** Transcript rows arrive as fresh objects on every update; only a change redraws one. */
export const ActivityRow = memo(ActivityRowView, sameActivityRow)
