// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MermaidDiagram } from './MermaidDiagram.js'

const render_ = vi.hoisted(() => vi.fn())
vi.mock('mermaid', () => ({
  default: { initialize: vi.fn(), render: render_ },
}))

describe('MermaidDiagram', () => {
  it('shows the diagram once it has been drawn', async () => {
    render_.mockResolvedValue({ svg: '<svg><title>Flow</title></svg>' })

    render(<MermaidDiagram source={'graph TD;\n A-->B;'} />)

    await waitFor(() =>
      expect(document.querySelector('.mermaid-diagram svg')).not.toBeNull(),
    )
  })

  it('shows the source of a diagram it cannot draw', async () => {
    // A diagram still being typed, or streamed in a message, does not parse
    // yet, and is not worth interrupting the page for.
    render_.mockRejectedValue(new Error('Parse error'))

    render(<MermaidDiagram source={'graph TD; A--'} />)

    expect(await screen.findByText('graph TD; A--')).toBeTruthy()
    expect(document.querySelector('.mermaid-source')).not.toBeNull()
  })

  it('leaves the diagram its own accessibility information', async () => {
    // An ARIA image is named by its author and flattens everything inside it,
    // so a role on the wrapper would hide the title and description Mermaid
    // writes into the SVG for screen readers.
    render_.mockResolvedValue({ svg: '<svg><title>Flow</title></svg>' })

    render(<MermaidDiagram source={'graph TD;\n A-->B;'} />)

    const wrapper = await waitFor(() => {
      const found = document.querySelector('.mermaid-diagram')
      expect(found).not.toBeNull()
      return found as HTMLElement
    })
    expect(wrapper.getAttribute('role')).toBeNull()
    // The SVG's own title stays reachable rather than being flattened away.
    expect(wrapper.querySelector('title')?.textContent).toBe('Flow')
  })

})
