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
})
