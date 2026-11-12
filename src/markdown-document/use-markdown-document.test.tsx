// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import type { Components } from 'react-markdown'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { outlineFromMarkdown } from '../markdown-navigation'
import { renderDocumentTree, splitDocumentTree } from './pipeline'
import type { DocumentRenderEvent } from './pipeline'
import { DocumentRendererContext } from './renderer'
import type { DocumentRenderer } from './renderer'
import { useMarkdownDocument } from './use-markdown-document'

const components: Components = {}
const markdown = '# First\n\nOpening paragraph.\n\n## Second\n\nMiddle paragraph.\n\n## Third\n\nClosing paragraph.\n'

/** Every chunk of `source` split small, then its outline: what a worker would send. */
function eventsFor(source: string): DocumentRenderEvent[] {
  const { tree, outline } = renderDocumentTree(source)
  const chunks = splitDocumentTree(tree, 20)
  return [
    ...chunks.map((tree): DocumentRenderEvent => ({ kind: 'chunk', tree })),
    { kind: 'done', outline },
  ]
}

/** A renderer that answers only when the test says so. */
function controlledRenderer() {
  const calls: { source: string; emit: (event: DocumentRenderEvent) => void; cancelled: boolean }[] = []
  const renderer: DocumentRenderer = {
    render(source, emit) {
      const call = { source, emit, cancelled: false }
      calls.push(call)
      return () => {
        call.cancelled = true
      }
    },
  }
  return { renderer, calls }
}

function Reader({ source, using = components }: { source?: string; using?: Components }) {
  const view = useMarkdownDocument(source, using)
  return (
    <div data-outline={view.outline.map((heading) => heading.id).join(',')} data-ready={String(view.ready)} data-testid="reader">
      {view.content}
    </div>
  )
}

function show(renderer: DocumentRenderer, source?: string) {
  return render(
    <DocumentRendererContext.Provider value={renderer}>
      <Reader source={source} />
    </DocumentRendererContext.Provider>,
  )
}

/** Lets one frame pass: the hook draws at most one chunk in it. */
async function nextFrame() {
  await act(async () => {
    vi.advanceTimersToNextFrame()
    // The fake clock delays a zero-delay timer set during a frame by 1 ms.
    await vi.advanceTimersByTimeAsync(1)
  })
}

const drawnChunks = () => screen.getByTestId('reader').querySelectorAll('.document-chunk').length

/** Lets React draw, then runs the next chunk's timer, until nothing is left to draw. */
async function settle() {
  for (let round = 0; round < 50; round += 1) {
    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })
    if (vi.getTimerCount() === 0) return
  }
}

describe('useMarkdownDocument', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('shows chunks as they arrive and is ready only after the last one', async () => {
    const { renderer, calls } = controlledRenderer()
    show(renderer, markdown)
    const events = eventsFor(markdown)
    expect(events.length).toBeGreaterThan(3)

    act(() => calls[0]!.emit(events[0]!))
    await settle()
    expect(screen.getByRole('heading', { name: 'First' })).toBeInTheDocument()
    expect(screen.queryByText('Closing paragraph.')).not.toBeInTheDocument()
    expect(screen.getByTestId('reader')).toHaveAttribute('data-ready', 'false')

    act(() => events.slice(1).forEach((event) => calls[0]!.emit(event)))
    await settle()
    expect(screen.getByText('Closing paragraph.')).toBeInTheDocument()
    expect(screen.getByTestId('reader')).toHaveAttribute('data-ready', 'true')
    expect(screen.getByTestId('reader')).toHaveAttribute(
      'data-outline', outlineFromMarkdown(markdown).map((heading) => heading.id).join(','),
    )
  })

  it('draws one chunk per frame, however many have arrived', async () => {
    const { renderer, calls } = controlledRenderer()
    show(renderer, markdown)
    act(() => eventsFor(markdown).forEach((event) => calls[0]!.emit(event)))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(drawnChunks()).toBe(0)
    await nextFrame()
    expect(drawnChunks()).toBe(1)
    await nextFrame()
    expect(drawnChunks()).toBe(2)
  })

  it('keeps the opening on the page through a restart until the whole document is drawn over it', async () => {
    const { renderer, calls } = controlledRenderer()
    show(renderer, markdown)
    act(() => eventsFor('# First\n\nOpening paragraph.\n').slice(0, -1).forEach((event) => calls[0]!.emit(event)))
    await settle()
    expect(screen.getByText('Opening paragraph.')).toBeInTheDocument()

    act(() => calls[0]!.emit({ kind: 'restart' }))
    expect(screen.getByText('Opening paragraph.')).toBeInTheDocument()
    expect(screen.queryByText('Rendering document…')).not.toBeInTheDocument()

    act(() => eventsFor(markdown).forEach((event) => calls[0]!.emit(event)))
    await settle()
    expect(screen.getAllByText('Opening paragraph.')).toHaveLength(1)
    expect(screen.getByText('Closing paragraph.')).toBeInTheDocument()
    expect(drawnChunks()).toBe(eventsFor(markdown).length - 1)
    expect(screen.getByTestId('reader')).toHaveAttribute('data-ready', 'true')
  })

  it('keeps the document on the page while new components draw it again', async () => {
    const { renderer, calls } = controlledRenderer()
    const view = show(renderer, markdown)
    act(() => eventsFor(markdown).forEach((event) => calls[0]!.emit(event)))
    await settle()

    const marked: Components = { p: ({ node: _node, ...props }) => <p data-marked="yes" {...props} /> }
    view.rerender(
      <DocumentRendererContext.Provider value={renderer}>
        <Reader source={markdown} using={marked} />
      </DocumentRendererContext.Provider>,
    )
    expect(screen.getByText('Closing paragraph.')).toBeInTheDocument()
    expect(calls).toHaveLength(1)
    await settle()
    expect(screen.getByText('Closing paragraph.')).toHaveAttribute('data-marked', 'yes')
    expect(screen.getByTestId('reader')).toHaveAttribute('data-ready', 'true')
  })

  it('cancels the previous document and never shows its late chunks', async () => {
    const { renderer, calls } = controlledRenderer()
    const view = show(renderer, markdown)
    view.rerender(
      <DocumentRendererContext.Provider value={renderer}>
        <Reader source={'# Replacement\n'} />
      </DocumentRendererContext.Provider>,
    )
    expect(calls[0]!.cancelled).toBe(true)
    act(() => eventsFor(markdown).forEach((event) => calls[0]!.emit(event)))
    act(() => eventsFor('# Replacement\n').forEach((event) => calls[1]!.emit(event)))
    await settle()
    expect(screen.getByRole('heading', { name: 'Replacement' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'First' })).not.toBeInTheDocument()
    expect(screen.getByTestId('reader')).toHaveAttribute('data-ready', 'true')
  })

  it('renders on the page when the worker fails', async () => {
    const { renderer, calls } = controlledRenderer()
    show(renderer, markdown)
    act(() => calls[0]!.emit({ kind: 'error', message: 'The document renderer stopped.' }))
    await settle()
    expect(screen.getByText('Closing paragraph.')).toBeInTheDocument()
    expect(screen.getByTestId('reader')).toHaveAttribute('data-ready', 'true')
  })

  it('shows a synchronous render on the first pass', () => {
    show({ render: () => () => undefined, renderNow: renderDocumentTree }, markdown)
    expect(screen.getByText('Closing paragraph.')).toBeInTheDocument()
    expect(screen.getByTestId('reader')).toHaveAttribute('data-ready', 'true')
  })
})
