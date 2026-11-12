import { createElement, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import type { Root } from 'hast'
import type { Components } from 'react-markdown'
import type { DocumentHeading } from '../markdown-navigation'
import { documentJsx } from './document-jsx'
import { renderDocumentTree } from './pipeline'
import { defaultDocumentRenderer, DocumentRendererContext } from './renderer'

export interface MarkdownDocumentView {
  content: ReactNode
  /** Empty until `ready`: an entry is found by its position among drawn headings. */
  outline: DocumentHeading[]
  /** Every chunk is on the page, so anchors and headings can be resolved. */
  ready: boolean
}

interface Progress {
  /** Identifies one render, so a late event from an earlier one is never mixed in. */
  token?: object
  source?: string
  /** Counts the renderer's restarts: each one delivers the document again. */
  pass: number
  trees: Root[]
  outline: DocumentHeading[]
  done: boolean
  failed: boolean
}

interface Drawn {
  token?: object
  pass: number
  components?: Components
  elements: ReactElement[]
  /** What the page showed before a restart or new components; it stays until drawn over. */
  behind: ReactElement[]
}

const nothing: ReactElement[] = []
const notStarted: Progress = { pass: 0, trees: [], outline: [], done: false, failed: false }

function onPage(drawn: Drawn): ReactElement[] {
  return drawn.behind.length > drawn.elements.length
    ? [...drawn.elements, ...drawn.behind.slice(drawn.elements.length)]
    : drawn.elements
}

// Each chunk is a block of its own, so laying out a new one leaves the rest alone.
function chunkElement(tree: Root, index: number, components: Components): ReactElement {
  return createElement('div', { key: index, className: 'document-chunk' }, documentJsx(tree, components))
}

/** Calls `callback` once the page has drawn its next frame. */
function afterNextFrame(callback: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined
  if (typeof requestAnimationFrame !== 'function') {
    timer = setTimeout(callback, 16)
    return () => clearTimeout(timer)
  }
  const frame = requestAnimationFrame(() => {
    timer = setTimeout(callback, 0)
  })
  return () => {
    cancelAnimationFrame(frame)
    clearTimeout(timer)
  }
}

/**
 * A Markdown document as ReactMarkdown would draw it, without freezing the
 * page: a long one is parsed off the page's thread and drawn a chunk a frame.
 */
export function useMarkdownDocument(source: string | undefined, components: Components): MarkdownDocumentView {
  const renderer = useContext(DocumentRendererContext) ?? defaultDocumentRenderer()
  const [progress, setProgress] = useState<Progress>(notStarted)
  const [drawn, setDrawn] = useState<Drawn>({ pass: 0, elements: nothing, behind: nothing })

  // A short document is drawn on the first pass, as is any without a worker.
  const immediate = useMemo(
    () => (source === undefined ? undefined : renderer.renderNow?.(source)),
    [renderer, source],
  )

  useEffect(() => {
    if (source === undefined || immediate) return undefined
    const token = {}
    return renderer.render(source, (event) => {
      setProgress((previous) => {
        const current: Progress = previous.token === token ? previous : { ...notStarted, token, source }
        switch (event.kind) {
          case 'chunk':
            return { ...current, trees: [...current.trees, event.tree] }
          case 'restart':
            return { ...current, pass: current.pass + 1, trees: [] }
          case 'done':
            return { ...current, outline: event.outline, done: true }
          case 'error':
            return { ...current, failed: true }
        }
      })
    })
  }, [renderer, source, immediate])

  const current = progress.token && progress.source === source && !immediate ? progress : undefined
  const sameRender = current !== undefined && drawn.token === current.token
  const fresh = sameRender && drawn.pass === current.pass && drawn.components === components
  const own = fresh ? drawn.elements : nothing
  const behind = fresh ? drawn.behind : sameRender ? onPage(drawn) : nothing

  // Scheduled as the chunk before is committed, so its frame is the one waited for.
  useLayoutEffect(() => {
    if (!current || current.failed || own.length >= current.trees.length) return undefined
    const { token, pass } = current
    const index = own.length
    const tree = current.trees[index]!
    return afterNextFrame(() => {
      setDrawn((previous) => {
        if (previous.token === token && previous.pass === pass && previous.components === components) {
          if (previous.elements.length !== index) return previous
          return { ...previous, elements: [...previous.elements, chunkElement(tree, index, components)] }
        }
        if (index !== 0) return previous
        return {
          token,
          pass,
          components,
          elements: [chunkElement(tree, 0, components)],
          behind: previous.token === token ? onPage(previous) : nothing,
        }
      })
    })
  }, [current, own, components])

  // A worker that fails leaves the document to be drawn here, as before.
  const recovered = useMemo(
    () => (current?.failed && source !== undefined ? renderDocumentTree(source) : undefined),
    [current?.failed, source],
  )
  const whole = immediate ?? recovered
  const wholeContent = useMemo(() => (whole ? documentJsx(whole.tree, components) : undefined), [whole, components])

  if (source === undefined) return { content: null, outline: [], ready: false }
  if (whole) return { content: wholeContent, outline: whole.outline, ready: true }
  const ready = Boolean(current?.done) && own.length === current!.trees.length
  const shown = ready || behind.length <= own.length ? own : [...own, ...behind.slice(own.length)]
  return {
    content: shown.length || ready
      ? shown
      : createElement('p', { className: 'document-rendering', role: 'status' }, 'Rendering document…'),
    outline: ready ? current!.outline : [],
    ready,
  }
}
