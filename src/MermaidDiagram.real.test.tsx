// @vitest-environment jsdom
import { render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MermaidDiagram } from './MermaidDiagram.js'

/**
 * Runs against the real Mermaid rather than a stub.
 *
 * The behavior that matters here is Mermaid's own: given a diagram it cannot
 * parse it draws a syntax-error diagram into the document and rejects without
 * taking it away again. A mocked rejection cannot show whether that happened.
 */
describe('MermaidDiagram against the real Mermaid', () => {
  it('leaves no error diagram behind once the render has been attempted', async () => {
    // The source fallback is on screen before Mermaid is even imported, so it
    // is no evidence that anything was rendered. The real implementation is
    // counted through rather than replaced, so the assertions below run only
    // once Mermaid itself has finished with the diagram.
    const mermaid = (await import('mermaid')).default
    const real = mermaid.render.bind(mermaid)
    let settled = 0
    vi.spyOn(mermaid, 'render').mockImplementation(async (id, source) => {
      try {
        return await real(id, source)
      } finally {
        settled += 1
      }
    })

    const { container } = render(<MermaidDiagram source={'graph TD; A--'} />)
    await waitFor(() => expect(settled).toBe(1), { timeout: 10_000 })

    // Mermaid marks its own error drawing with this class, and parks the
    // element it measured in under an id derived from the diagram id.
    expect(document.querySelector('.error-icon')).toBeNull()
    expect(document.querySelector('[id^="dmermaid-"]')).toBeNull()
    expect(document.querySelector('[id^="mermaid-"]')).toBeNull()
    // The diagram it could not draw is shown as the code it was written as.
    expect(container.querySelector('.mermaid-source')?.textContent).toContain(
      'graph TD; A--',
    )
    vi.restoreAllMocks()
  })
})
