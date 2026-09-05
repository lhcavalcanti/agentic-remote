import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Ellipsis } from 'lucide-react'

export function SessionActions({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    function dismissOutside(event: PointerEvent | FocusEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', dismissOutside)
    document.addEventListener('focusin', dismissOutside)
    return () => {
      document.removeEventListener('pointerdown', dismissOutside)
      document.removeEventListener('focusin', dismissOutside)
    }
  }, [open])

  return (
    <div
      className="session-actions"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          event.stopPropagation()
          setOpen(false)
          triggerRef.current?.focus()
        }
      }}
      ref={rootRef}
    >
      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-label="Session actions"
        className={`icon-button ${open ? 'icon-button--active' : ''}`}
        onClick={() => setOpen(!open)}
        ref={triggerRef}
        title="Session actions"
        type="button"
      >
        <Ellipsis size={20} />
      </button>
      {open ? (
        <div
          aria-label="Session actions"
          className="session-actions__panel"
          id={panelId}
          onClick={(event) => {
            const button = event.target instanceof Element
              ? event.target.closest('button')
              : null
            if (button && !button.disabled) {
              setOpen(false)
              // A dialog opened by the action owns focus; don't pull it back.
              if (rootRef.current?.contains(document.activeElement)) {
                triggerRef.current?.focus()
              }
            }
          }}
          role="group"
        >
          <p>Manage this session</p>
          {children}
        </div>
      ) : null}
    </div>
  )
}
