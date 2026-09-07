import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function DialogFrame({
  title,
  eyebrow,
  onClose,
  children,
  className,
}: {
  title: string
  eyebrow: string
  onClose: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-label={title}
        aria-modal="true"
        className={`dialog ${className || ''}`}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="dialog__header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <button
            aria-label="Close"
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
