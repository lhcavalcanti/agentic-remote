import { useEffect, useMemo, useRef, useState } from 'react'
import { LoaderCircle, TriangleAlert } from 'lucide-react'
import { createHtmlPreviewDocument } from './html-preview'

export function HtmlPreview({
  name,
  source,
}: {
  name: string
  source: string
}) {
  const document = useMemo(() => createHtmlPreviewDocument(source), [source])
  const [loadedDocument, setLoadedDocument] = useState<string>()
  const [failedDocument, setFailedDocument] = useState<string>()
  const frameRef = useRef<HTMLIFrameElement>(null)
  const state =
    failedDocument === document
      ? 'error'
      : loadedDocument === document
        ? 'ready'
        : 'loading'

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const handleError = () => {
      setLoadedDocument(undefined)
      setFailedDocument(document)
    }
    frame.addEventListener('error', handleError)
    return () => frame.removeEventListener('error', handleError)
  }, [document])

  return (
    <div
      aria-busy={state === 'loading'}
      className="html-preview"
      data-state={state}
    >
      {state === 'loading' ? (
        <p aria-live="polite" className="html-preview__status" role="status">
          <LoaderCircle
            aria-hidden="true"
            className="activity-message__spinner"
            size={18}
          />
          Loading HTML preview
        </p>
      ) : null}
      {state === 'error' ? (
        <div className="html-preview__error" role="alert">
          <TriangleAlert aria-hidden="true" size={20} />
          <div>
            <strong>HTML preview could not be displayed</strong>
            <p>Use Source to read the file.</p>
          </div>
        </div>
      ) : null}
      <iframe
        allow=""
        loading="eager"
        onLoad={() => {
          setFailedDocument(undefined)
          setLoadedDocument(document)
        }}
        ref={frameRef}
        referrerPolicy="no-referrer"
        sandbox=""
        srcDoc={document}
        title={`Preview of ${name}`}
      />
    </div>
  )
}
