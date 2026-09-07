import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'

export function MarkdownCodeBlock({
  source,
  language,
  children,
}: {
  source: string
  language?: string
  children: ReactNode
}) {
  const [feedback, setFeedback] = useState<{ source: string; error?: string }>()
  const [copying, setCopying] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const active = useRef(false)
  const current = feedback?.source === source ? feedback : undefined
  const copied = Boolean(current && !current.error)

  useEffect(() => {
    active.current = true
    return () => {
      active.current = false
      clearTimeout(timeout.current)
    }
  }, [])

  async function copy() {
    clearTimeout(timeout.current)
    setFeedback(undefined)
    if (!navigator.clipboard?.writeText) {
      setFeedback({ source, error: 'Clipboard access is unavailable. Select the code to copy it.' })
      return
    }
    setCopying(true)
    try {
      await navigator.clipboard.writeText(source)
      if (!active.current) return
      setFeedback({ source })
      timeout.current = setTimeout(() => setFeedback(undefined), 2000)
    } catch {
      if (active.current) {
        setFeedback({ source, error: 'Could not copy the code. Select it and use your browser copy action.' })
      }
    } finally {
      if (active.current) setCopying(false)
    }
  }

  return (
    <figure className="document-code">
      <figcaption>
        <span>{language || 'Code'}</span>
        <button
          aria-label={copied ? 'Code copied' : 'Copy code'}
          disabled={copying}
          onClick={() => void copy()}
          type="button"
        >
          {copied ? <Check aria-hidden="true" size={14} /> : <Copy aria-hidden="true" size={14} />}
          <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </figcaption>
      {children}
      {current?.error ? <p className="document-code__error" role="alert">{current.error}</p> : null}
    </figure>
  )
}
