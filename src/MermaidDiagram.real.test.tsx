// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MermaidDiagram } from './MermaidDiagram.js'

/**
 * Runs against the real Mermaid rather than a stub.
 *
 * The behavior that matters here is Mermaid's own: given a diagram it cannot
 * parse it draws a syntax-error diagram into the document and rejects without
 * taking it away again. A mocked rejection cannot show whether that happened.
 */
describe('MermaidDiagram against the real Mermaid', () => {
  it('leaves no error diagram behind for a diagram it cannot parse', async () => {
    render(<MermaidDiagram source={'graph TD; A--'} />)

    // The source is shown instead, which is the intended fallback.
    expect(await screen.findByText('graph TD; A--')).toBeTruthy()

    await waitFor(() => {
      // Mermaid marks its own error drawing with this class, and parks the
      // element it measured in under an id derived from the diagram id.
      expect(document.querySelector('.error-icon')).toBeNull()
      expect(document.querySelector('[id^="dmermaid-"]')).toBeNull()
      expect(
        [...document.querySelectorAll('svg')].filter(
          (svg) => !svg.closest('.mermaid-diagram'),
        ),
      ).toEqual([])
    })
  })
})
