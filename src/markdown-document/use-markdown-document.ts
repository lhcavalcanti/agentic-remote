import { createElement, Fragment, useContext, useEffect, useMemo, useState } from 'react'
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
  trees: Root[]
  outline: DocumentHeading[]
  done: boolean
  failed: boolean
}

interface Drawn {
  token?: object
  components?: Components
  elements: ReactElement[]
}

const noElements: ReactElement[] = []

/**
 * A Markdown document as ReactMarkdown would draw it, without freezing the
 * page: it is parsed off the page's thread and drawn one chunk per task.
 */
export function useMarkdownDocument(source: string | undefined, components: Components): MarkdownDocumentView {
  const renderer = useContext(DocumentRendererContext) ?? defaultDocumentRenderer()
  const [progress, setProgress] = useState<Progress>({ trees: [], outline: [], done: false, failed: false })
  const [drawn, setDrawn] = useState<Drawn>({ elements: noElements })

  // Without a worker the whole document is drawn on the first pass.
  const immediate = useMemo(
    () => (source !== undefined && renderer.renderNow ? renderer.renderNow(source) : undefined),
    [renderer, source],
  )

  useEffect(() => {
    if (source === undefined || renderer.renderNow) return undefined
    const token = {}
    return renderer.render(source, (event) => {
      setProgress((previous) => {
        const current: Progress = previous.token === token
          ? previous
          : { token, source, trees: [], outline: [], done: false, failed: false }
        if (event.kind === 'chunk') return { ...current, trees: [...current.trees, event.tree] }
        if (event.kind === 'done') return { ...current, outline: event.outline, done: true }
        return { ...current, failed: true }
      })
    })
  }, [renderer, source])

  const current = progress.source === source && !immediate ? progress : undefined
  const elements = current && drawn.token === current.token && drawn.components === components
    ? drawn.elements
    : noElements

  // One chunk per task keeps every task short, however long the document.
  useEffect(() => {
    if (!current || current.failed || elements.length >= current.trees.length) return undefined
    const { token } = current
    const index = elements.length
    const tree = current.trees[index]!
    const timer = setTimeout(() => {
      setDrawn((previous) => {
        const base = previous.token === token && previous.components === components ? previous.elements : noElements
        if (base.length !== index) return previous
        return {
          token,
          components,
          elements: [...base, createElement(Fragment, { key: index }, documentJsx(tree, components))],
        }
      })
    }, 0)
    return () => clearTimeout(timer)
  }, [current, elements, components])

  // A worker that fails leaves the document to be drawn here, as before.
  const recovered = useMemo(
    () => (current?.failed && source !== undefined ? renderDocumentTree(source) : undefined),
    [current?.failed, source],
  )
  const whole = immediate ?? recovered
  const wholeContent = useMemo(() => (whole ? documentJsx(whole.tree, components) : undefined), [whole, components])

  if (source === undefined) return { content: null, outline: [], ready: false }
  if (whole) return { content: wholeContent, outline: whole.outline, ready: true }
  const ready = Boolean(current?.done) && elements.length === current!.trees.length
  return {
    content: elements.length
      ? elements
      : createElement('p', { className: 'document-rendering', role: 'status' }, 'Rendering document…'),
    outline: ready ? current!.outline : [],
    ready,
  }
}
