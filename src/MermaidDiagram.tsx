import { useEffect, useId, useRef, useState } from 'react'

/**
 * How long a source has to stop changing before it is worth drawing.
 *
 * A diagram inside a streaming message arrives a few characters at a time, and
 * Mermaid renders one request after another, so drawing every draft puts the
 * finished diagram at the back of a queue of its own discarded revisions.
 */
const SETTLE_MS = 120

/**
 * Mermaid's configuration is global and its renders are serial.
 *
 * Configuring it while another diagram is between its own configuration and
 * its layout resets settings that diagram is still relying on, so the two are
 * done together and one diagram at a time.
 */
let drawing: Promise<unknown> = Promise.resolve()

function drawDiagram(
  id: string,
  source: string,
): Promise<{ svg: string; bindFunctions?: (element: Element) => void }> {
  const next = drawing.catch(() => undefined).then(async () => {
    const { default: mermaid } = await import('mermaid')
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'strict',
      // Mermaid otherwise draws a syntax-error diagram of its own into the
      // document and leaves it there, once per revision of a diagram that is
      // still being typed.
      suppressErrorRendering: true,
    })
    return mermaid.render(id, source)
  })
  drawing = next.catch(() => undefined)
  return next
}

/**
 * Renders a Mermaid diagram, falling back to its source when it cannot.
 *
 * Mermaid is large and most documents have no diagram in them, so it is only
 * fetched once one appears. A diagram that fails to parse is shown as the code
 * it was written as: a half-typed diagram in a message that is still streaming
 * is the ordinary case, not an error worth interrupting the page for.
 */
export function MermaidDiagram({ source }: { source: string }) {
  // The source is kept with the drawing it produced. Without it, a diagram
  // that has already been drawn stays on screen while a newer source is still
  // parsing, showing one revision of a streaming diagram under another's text.
  const [drawn, setDrawn] = useState<
    {
      source: string
      svg: string
      bind?: (element: Element) => void
    }
    | undefined
  >(undefined)
  const host = useRef<HTMLDivElement>(null)
  const base = useId().replace(/[^a-zA-Z0-9]/g, '')
  const attempt = useRef(0)

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      void (async () => {
        // Every attempt draws under an id of its own. Mermaid runs renders one
        // after another and can begin the next before the previous rejection
        // is handled, so cleaning up by a shared id takes away the newer
        // render's work and leaves a valid diagram showing source for good.
        attempt.current += 1
        const id = `mermaid-${base}-${attempt.current}`
        try {
          const result = await drawDiagram(id, source)
          if (active) {
            // Mermaid attaches whatever interactions a diagram declared -- the
            // links a `click ... href ...` line asks for, for instance -- once
            // the markup is in the document. Dropping the callback left those
            // diagrams drawn but inert.
            setDrawn({ source, svg: result.svg, bind: result.bindFunctions })
          }
        } catch {
          // Only this attempt's own elements, and now rather than at cleanup:
          // a rejection leaves them in the document.
          document.getElementById(id)?.remove()
          document.getElementById(`d${id}`)?.remove()
        }
      })()
    }, SETTLE_MS)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [base, source])

  // Run once the markup is in the document, and only for the drawing it came
  // with, so a diagram's own links and handlers work.
  useEffect(() => {
    if (drawn?.source !== source || !host.current || !drawn.bind) {
      return
    }
    drawn.bind(host.current)
  }, [drawn, source])

  // Shown only for the source that produced it, so a diagram never appears
  // under text it does not belong to.
  if (drawn?.source !== source) {
    return (
      <pre className="mermaid-source">
        <code>{source}</code>
      </pre>
    )
  }

  return (
    <div
      className="mermaid-diagram"
      // Mermaid returns SVG markup, and it is rendered with `securityLevel`
      // strict, which strips scripts and foreign content from it.
      dangerouslySetInnerHTML={{ __html: drawn.svg }}
      ref={host}
      // Deliberately no `role`: an ARIA image is named by its author and its
      // descendants are flattened away, which would hide the title, the
      // description and the text Mermaid puts inside the SVG for exactly this
      // purpose.
    />
  )
}
