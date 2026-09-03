import { useEffect, useId, useRef, useState } from 'react'

/**
 * Renders a Mermaid diagram, falling back to its source when it cannot.
 *
 * Mermaid is large and most documents have no diagram in them, so it is only
 * fetched once one appears. A diagram that fails to parse is shown as the code
 * it was written as: a half-typed diagram in a message that is still streaming
 * is the ordinary case, not an error worth interrupting the page for.
 */
export function MermaidDiagram({ source }: { source: string }) {
  const [svg, setSvg] = useState<string | undefined>(undefined)
  const [failed, setFailed] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  // Mermaid writes its measuring copy into the document under this id, so it
  // has to be unique per diagram on the page.
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  useEffect(() => {
    let active = true
    setFailed(false)
    void (async () => {
      try {
        const { default: mermaid } = await import('mermaid')
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'strict',
          // Mermaid otherwise draws a syntax-error diagram of its own into the
          // document and leaves it there. A half-typed diagram in a message
          // that is still streaming would put one on the page for every
          // keystroke, on top of the source this falls back to.
          suppressErrorRendering: true,
        })
        const rendered = await mermaid.render(id, source)
        if (active) {
          setSvg(rendered.svg)
        }
      } catch {
        // Whatever Mermaid measured in is taken away now rather than at
        // cleanup: a rejection leaves it in the document, and the next
        // keystroke of a streaming diagram renders under a new id.
        document.getElementById(id)?.remove()
        document.getElementById(`d${id}`)?.remove()
        if (active) {
          setFailed(true)
        }
      }
    })()
    return () => {
      active = false
      // Mermaid leaves the element it measured in behind when rendering
      // throws, which would otherwise collect at the bottom of the page.
      document.getElementById(id)?.remove()
      document.getElementById(`d${id}`)?.remove()
    }
  }, [id, source])

  if (failed || !svg) {
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
      dangerouslySetInnerHTML={{ __html: svg }}
      // Deliberately no `role`: an ARIA image is named by its author and its
      // descendants are flattened away, which would hide the title, the
      // description and the text Mermaid puts inside the SVG for exactly this
      // purpose.
      ref={container}
    />
  )
}
