// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MermaidDiagram } from './MermaidDiagram.js'

const render_ = vi.hoisted(() => vi.fn())
const mermaidModule = vi.hoisted(() => ({
  default: { initialize: vi.fn(), render: render_ },
}))
vi.mock('mermaid', () => mermaidModule)

describe('MermaidDiagram', () => {
  beforeEach(() => {
    render_.mockReset()
  })

  // Vitest globals are off, so React Testing Library cannot install this
  // itself. Without it, nodes and timers from one test survive into the next
  // and document-wide queries match what an earlier render left behind.
  afterEach(() => {
    cleanup()
  })

  it('shows the diagram once it has been drawn', async () => {
    render_.mockResolvedValue({ svg: '<svg><title>Flow</title></svg>' })

    const { container } = render(<MermaidDiagram source={'graph TD;\n A-->B;'} />)

    await waitFor(() =>
      expect(container.querySelector('.mermaid-diagram svg')).not.toBeNull(),
    )
  })

  it('shows the source of a diagram it cannot draw', async () => {
    // A diagram still being typed, or streamed in a message, does not parse
    // yet, and is not worth interrupting the page for.
    render_.mockRejectedValue(new Error('Parse error'))

    const { container } = render(<MermaidDiagram source={'graph TD; A--'} />)

    expect(await screen.findByText('graph TD; A--')).toBeTruthy()
    expect(container.querySelector('.mermaid-source')).not.toBeNull()
  })

  it('leaves the diagram its own accessibility information', async () => {
    // An ARIA image is named by its author and flattens everything inside it,
    // so a role on the wrapper would hide the title and description Mermaid
    // writes into the SVG for screen readers.
    render_.mockResolvedValue({ svg: '<svg><title>Flow</title></svg>' })

    const { container } = render(<MermaidDiagram source={'graph TD;\n A-->B;'} />)

    const wrapper = await waitFor(() => {
      const found = container.querySelector('.mermaid-diagram')
      expect(found).not.toBeNull()
      return found as HTMLElement
    })
    expect(wrapper.getAttribute('role')).toBeNull()
    // The SVG's own title stays reachable rather than being flattened away.
    expect(wrapper.querySelector('title')?.textContent).toBe('Flow')
  })


  it('does not show a drawn diagram under a newer source', async () => {
    // A diagram streamed in a message is redrawn as it grows. Leaving the
    // previous drawing up while the newer source is still parsing shows one
    // revision of the diagram under another revision's text.
    render_.mockResolvedValue({ svg: '<svg><title>First</title></svg>' })
    const { container, rerender, unmount } = render(
      <MermaidDiagram source={'graph TD; A-->B;'} />,
    )
    await waitFor(() =>
      expect(container.querySelector('.mermaid-diagram')).not.toBeNull(),
    )

    // The next revision never settles.
    render_.mockReturnValue(new Promise(() => {}))
    rerender(<MermaidDiagram source={'graph TD; A-->B; B-->C;'} />)

    expect(container.querySelector('.mermaid-diagram')).toBeNull()
    expect(container.querySelector('.mermaid-source')?.textContent).toContain(
      'B-->C',
    )
    // The revision that never settles has a timer waiting on it.
    unmount()
  })

  it('draws only the source a streaming diagram settles on', async () => {
    // Mermaid renders one request after another, so a diagram arriving a few
    // characters at a time would put the finished drawing at the back of a
    // queue of its own discarded drafts.
    render_.mockResolvedValue({ svg: '<svg><title>Settled</title></svg>' })
    const { rerender } = render(<MermaidDiagram source={'graph TD;'} />)
    rerender(<MermaidDiagram source={'graph TD; A'} />)
    rerender(<MermaidDiagram source={'graph TD; A--'} />)
    rerender(<MermaidDiagram source={'graph TD; A-->B;'} />)

    await waitFor(() => expect(render_).toHaveBeenCalled())
    expect(render_).toHaveBeenCalledTimes(1)
    expect(render_.mock.calls[0]?.[1]).toBe('graph TD; A-->B;')
  })

  it('gives every attempt an id of its own', async () => {
    // Cleaning up after a failed render must not reach the render that
    // followed it, which a shared id would.
    render_.mockResolvedValue({ svg: '<svg></svg>' })
    const { rerender } = render(<MermaidDiagram source={'graph TD; A-->B;'} />)
    await waitFor(() => expect(render_).toHaveBeenCalledTimes(1))
    rerender(<MermaidDiagram source={'graph TD; A-->C;'} />)
    await waitFor(() => expect(render_).toHaveBeenCalledTimes(2))

    const [first, second] = render_.mock.calls.map((call) => call[0])
    expect(first).not.toBe(second)
  })


  it('does not reconfigure Mermaid while another diagram is drawing', async () => {
    // Mermaid's configuration is global and its renders are serial, so
    // configuring one diagram while another is between its own configuration
    // and its layout takes away settings that one is still relying on.
    const order: string[] = []
    const initialize = vi.fn(() => {
      order.push('init')
    })
    render_.mockImplementation(async () => {
      order.push('render')
      await new Promise((resolve) => setTimeout(resolve, 20))
      order.push('done')
      return { svg: '<svg></svg>' }
    })
    mermaidModule.default.initialize = initialize

    render(
      <>
        <MermaidDiagram source={'graph TD; A-->B;'} />
        <MermaidDiagram source={'graph TD; C-->D;'} />
      </>,
    )

    await waitFor(() => expect(render_).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(order.filter((e) => e === 'done')).toHaveLength(2))

    // Each diagram is configured and drawn before the next is configured.
    expect(order).toEqual([
      'init',
      'render',
      'done',
      'init',
      'render',
      'done',
    ])
  })


  it('attaches the interactions the diagram declared', async () => {
    // Mermaid hands back a callback that wires up whatever a diagram asked
    // for, such as the links a `click ... href ...` line declares, once the
    // markup is in the document. Dropped, those diagrams draw but do nothing.
    const bindFunctions = vi.fn()
    render_.mockResolvedValue({ svg: '<svg></svg>', bindFunctions })

    const { container } = render(<MermaidDiagram source={'graph TD; A-->B;'} />)

    await waitFor(() => expect(bindFunctions).toHaveBeenCalledTimes(1))
    expect(bindFunctions).toHaveBeenCalledWith(
      container.querySelector('.mermaid-diagram'),
    )
  })

})
