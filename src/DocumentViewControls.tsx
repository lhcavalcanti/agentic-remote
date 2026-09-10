import { useEffect, useId, useRef, useState } from 'react'
import { List, X } from 'lucide-react'
import type { DocumentHeading } from './markdown-navigation'

export function DocumentViewControls({
  previewable,
  markdown,
  raw,
  onRawChange,
  outline,
  onSelectHeading,
}: {
  previewable: boolean
  markdown: boolean
  raw: boolean
  onRawChange: (raw: boolean) => void
  outline: DocumentHeading[]
  onSelectHeading: (heading: DocumentHeading) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const outlineButtonRef = useRef<HTMLButtonElement>(null)
  const outlineId = useId()

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

  if (!previewable) return null

  function closeOutline() {
    setOpen(false)
    outlineButtonRef.current?.focus()
  }

  return (
    <div
      className="document-view-controls"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          event.stopPropagation()
          closeOutline()
        }
      }}
      ref={rootRef}
    >
      <div aria-label="Document view" className="document-view-switch" role="group">
        <button
          aria-pressed={!raw}
          onClick={() => { setOpen(false); onRawChange(false) }}
          type="button"
        >
          Preview
        </button>
        <button
          aria-pressed={raw}
          onClick={() => { setOpen(false); onRawChange(true) }}
          type="button"
        >
          Source
        </button>
      </div>
      {markdown ? (
        <div className="document-outline-control">
          <button
            aria-controls={outlineId}
            aria-expanded={open}
            aria-label="Document outline"
            className="document-outline-button"
            disabled={raw || outline.length === 0}
            onClick={() => setOpen(!open)}
            ref={outlineButtonRef}
            title={raw ? 'Outline is available in Preview' : 'On this page'}
            type="button"
          >
            <List aria-hidden="true" size={16} />
          </button>
          {open && !raw && outline.length > 0 ? (
            <nav
              aria-label="Document outline"
              className="document-outline"
              id={outlineId}
            >
              <div className="document-outline__header">
                <strong>On this page</strong>
                <button
                  aria-label="Close document outline"
                  onClick={closeOutline}
                  type="button"
                >
                  <X aria-hidden="true" size={15} />
                </button>
              </div>
              <div className="document-outline__items">
                {outline.map((heading) => (
                  <button
                    className={`document-outline__item document-outline__item--${Math.min(heading.level, 3)}`}
                    key={heading.id}
                    onClick={() => {
                      setOpen(false)
                      onSelectHeading(heading)
                    }}
                    type="button"
                  >
                    {heading.text}
                  </button>
                ))}
              </div>
            </nav>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
