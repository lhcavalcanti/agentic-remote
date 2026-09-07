import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent, ReactNode } from 'react'

const WIDTH_KEY = 'agentic-remote:reader-width'
const WIDTH_MIN = 320
const WIDTH_MAX = 960
const CONVERSATION_MIN = 360

function readWidth(): number | undefined {
  try {
    const value = Number(localStorage.getItem(WIDTH_KEY))
    return Number.isFinite(value) && value > 0
      ? Math.min(WIDTH_MAX, Math.max(WIDTH_MIN, Math.round(value)))
      : undefined
  } catch {
    return undefined
  }
}

function storeWidth(width: number | undefined) {
  try {
    if (width === undefined) localStorage.removeItem(WIDTH_KEY)
    else localStorage.setItem(WIDTH_KEY, String(width))
  } catch {
    // Resizing still works when browser storage is unavailable.
  }
}

export default function ReaderWorkspace({
  mode,
  children,
}: {
  mode: 'hidden' | 'docked' | 'expanded'
  children: ReactNode
}) {
  const workspaceRef = useRef<HTMLDivElement>(null)
  const [workspaceWidth, setWorkspaceWidth] = useState(0)
  const [preferredWidth, setPreferredWidth] = useState(readWidth)
  const [resizing, setResizing] = useState(false)
  const gestureRef = useRef<{
    target: HTMLDivElement
    pointerId: number
    startX: number
    startWidth: number
    preferredWidth: number | undefined
    width: number
    delta: number
  } | undefined>(undefined)

  // Preserve 360px for chat where possible. With a wide sidebar on a small
  // desktop, the reader may take at most half the remaining workspace.
  const maximum = workspaceWidth > 0
    ? Math.min(WIDTH_MAX, Math.floor(
      workspaceWidth - Math.min(CONVERSATION_MIN, workspaceWidth / 2),
    ))
    : WIDTH_MAX
  const minimum = Math.min(WIDTH_MIN, maximum)
  const clamp = (value: number) =>
    Math.min(maximum, Math.max(minimum, Math.round(value)))
  const defaultWidth = workspaceWidth > 0 ? workspaceWidth / 2 : WIDTH_MIN
  const width = clamp(preferredWidth ?? defaultWidth)

  const finishResize = useCallback(() => {
    const gesture = gestureRef.current
    if (!gesture) return
    gestureRef.current = undefined
    setResizing(false)
    if (gesture.delta !== 0 && gesture.width !== gesture.startWidth) {
      setPreferredWidth(gesture.width)
      storeWidth(gesture.width)
    } else {
      setPreferredWidth(gesture.preferredWidth)
    }
    if (gesture.target.hasPointerCapture?.(gesture.pointerId)) {
      gesture.target.releasePointerCapture?.(gesture.pointerId)
    }
  }, [])

  useLayoutEffect(() => {
    const workspace = workspaceRef.current
    if (!workspace) return
    const measure = () => setWorkspaceWidth(workspace.getBoundingClientRect().width)
    measure()
    const observer = typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(measure)
    observer?.observe(workspace)
    window.addEventListener('resize', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
      finishResize()
    }
  }, [mode, finishResize])

  function commitWidth(next: number | undefined) {
    const value = next === undefined ? undefined : clamp(next)
    if (next !== undefined && value === width) return
    setPreferredWidth(value)
    storeWidth(value)
  }

  function resizeStart(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || gestureRef.current) return
    event.preventDefault()
    gestureRef.current = {
      target: event.currentTarget,
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: width,
      preferredWidth,
      width,
      delta: 0,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setResizing(true)
  }

  function resizeMove(event: PointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return
    gesture.delta = gesture.startX - event.clientX
    const next = clamp(gesture.startWidth + gesture.delta)
    // Keep the release correct even when React batches the final pointer move.
    gesture.width = next
    setPreferredWidth(next)
  }

  function resizeEnd(event: PointerEvent<HTMLDivElement>) {
    if (gestureRef.current?.pointerId !== event.pointerId) return
    if (event.type === 'pointerup') resizeMove(event)
    finishResize()
  }

  function resizeKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 32 : 8
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      commitWidth(width + step)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      commitWidth(width - step)
    } else if (event.key === 'Home') {
      event.preventDefault()
      commitWidth(undefined)
    }
  }

  return (
    <div
      className={`workspace workspace--${mode}`}
      data-resizing-reader={resizing}
      ref={workspaceRef}
      style={{ '--knowledge-width': `${width}px` } as CSSProperties}
    >
      {children}
      {mode === 'docked' ? (
        <div
          aria-controls="knowledge-panel"
          aria-label="Resize reader"
          aria-orientation="vertical"
          aria-valuemax={maximum}
          aria-valuemin={minimum}
          aria-valuenow={width}
          className="reader-resizer"
          data-resizing={resizing}
          onDoubleClick={() => commitWidth(undefined)}
          onKeyDown={resizeKeyDown}
          onLostPointerCapture={resizeEnd}
          onPointerCancel={resizeEnd}
          onPointerDown={resizeStart}
          onPointerMove={resizeMove}
          onPointerUp={resizeEnd}
          role="separator"
          tabIndex={0}
          title="Drag or use arrow keys to resize · Shift for larger steps · Home or double-click to reset"
        />
      ) : null}
    </div>
  )
}
