import { createElement, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import type { Components } from 'react-markdown'
import type { DocumentHeading } from '../markdown-navigation'
import { documentJsx } from './document-jsx'
import { drawStep, emptyDrawing } from './draw'
import type { DocumentDrawing } from './draw'
import { renderDocumentTree } from './pipeline'
import type { DrawStep } from './pipeline'
import { defaultDocumentRenderer, DocumentRendererContext } from './renderer'

export interface MarkdownDocumentView {
  content: ReactNode
  /** Empty until `ready`: an entry is found by its position among drawn headings. */
  outline: DocumentHeading[]
  /** Every part is on the page, so anchors and headings can be resolved. */
  ready: boolean
}

interface Progress {
  /** Identifies one render, so a late event from an earlier one is never mixed in. */
  token?: object
  source?: string
  /** Counts the renderer's restarts: each one delivers the document again. */
  pass: number
  parts: DrawStep[][]
  outline: DocumentHeading[]
  done: boolean
  failed: boolean
}

interface Drawn {
  token?: object
  pass: number
  components?: Components
  /** How many parts are drawn. */
  count: number
  drawing: DocumentDrawing
  /** What the page showed before a restart or new components; it stays until drawn over. */
  behind: ReactElement[]
}

const nothing: ReactElement[] = []
const notStarted: Progress = { pass: 0, parts: [], outline: [], done: false, failed: false }

function onPage(drawn: Drawn): ReactElement[] {
  const { blocks } = drawn.drawing
  return drawn.behind.length > blocks.length ? [...blocks, ...drawn.behind.slice(blocks.length)] : blocks
}

function soon(callback: () => void): () => void {
  const timer = setTimeout(callback, 0)
  return () => clearTimeout(timer)
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
 * page: a long one is parsed off the page's thread and drawn a part a frame.
 */
export function useMarkdownDocument(source: string | undefined, components: Components): MarkdownDocumentView {
  const renderer = useContext(DocumentRendererContext) ?? defaultDocumentRenderer()
  const [progress, setProgress] = useState<Progress>(notStarted)
  const [drawn, setDrawn] = useState<Drawn>({ pass: 0, count: 0, drawing: emptyDrawing, behind: nothing })
  // Elements a component draws are never drawn a part at a time.
  const whole = useMemo(() => Object.keys(components).sort().join(' '), [components])

  // A short document is drawn on the first pass, as is any without a worker.
  const immediate = useMemo(
    () => (source === undefined ? undefined : renderer.renderNow?.(source)),
    [renderer, source],
  )

  useEffect(() => {
    if (source === undefined || immediate) return undefined
    const token = {}
    let active = true
    const cancel = renderer.render(source, (event) => {
      // Whatever a cancelled render still sends is not this document's.
      if (!active) return
      setProgress((previous) => {
        const current: Progress = previous.token === token ? previous : { ...notStarted, token, source }
        switch (event.kind) {
          case 'part':
            return { ...current, parts: [...current.parts, event.steps] }
          case 'restart':
            return { ...current, pass: current.pass + 1, parts: [] }
          case 'done':
            return { ...current, outline: event.outline, done: true }
          case 'error':
            return { ...current, failed: true }
        }
      })
    }, whole ? whole.split(' ') : [])
    return () => {
      active = false
      cancel()
    }
  }, [renderer, source, immediate, whole])

  const current = progress.token && progress.source === source && !immediate ? progress : undefined
  const sameRender = current !== undefined && drawn.token === current.token
  const fresh = sameRender && drawn.pass === current.pass && drawn.components === components
  const own = fresh ? drawn.drawing.blocks : nothing
  const count = fresh ? drawn.count : 0
  const behind = fresh ? drawn.behind : sameRender ? onPage(drawn) : nothing

  // Scheduled as the part before is committed, so its frame is the one waited for.
  useLayoutEffect(() => {
    if (!current || current.failed || count >= current.parts.length) return undefined
    const { token, pass } = current
    const index = count
    const part = current.parts[index]!
    const base = fresh ? drawn.drawing : emptyDrawing
    // An empty page gets its first part at once; after that, one a frame.
    const schedule = index === 0 && !behind.length ? soon : afterNextFrame
    return schedule(() => {
      let drawing: DocumentDrawing
      try {
        drawing = part.reduce((sofar, step) => drawStep(sofar, step, components), base)
      } catch {
        setProgress((previous) => (previous.token === token ? { ...previous, failed: true } : previous))
        return
      }
      setDrawn((previous) => {
        if (previous.token === token && previous.pass === pass && previous.components === components) {
          return previous.count === index ? { ...previous, count: index + 1, drawing } : previous
        }
        if (index !== 0) return previous
        return { token, pass, components, count: 1, drawing, behind: previous.token === token ? onPage(previous) : nothing }
      })
    })
  }, [current, count, fresh, drawn, behind.length, components])

  // A worker that fails leaves the document to be drawn here, as before.
  const recovered = useMemo(
    () => (current?.failed && source !== undefined ? renderDocumentTree(source) : undefined),
    [current?.failed, source],
  )
  const wholeDocument = immediate ?? recovered
  const wholeContent = useMemo(
    () => (wholeDocument ? documentJsx(wholeDocument.tree, components) : undefined),
    [wholeDocument, components],
  )

  if (source === undefined) return { content: null, outline: [], ready: false }
  if (wholeDocument) return { content: wholeContent, outline: wholeDocument.outline, ready: true }
  const ready = Boolean(current?.done) && count === current!.parts.length
  const shown = ready || behind.length <= own.length ? own : [...own, ...behind.slice(own.length)]
  return {
    content: shown.length || ready
      ? shown
      : createElement('p', { className: 'document-rendering', role: 'status' }, 'Rendering document…'),
    outline: ready ? current!.outline : [],
    ready,
  }
}
