import { createContext } from 'react'
import { documentRenderEvents, renderDocumentTree } from './pipeline'
import type { DocumentRenderEvent, RenderedDocumentTree } from './pipeline'

export interface DocumentRenderer {
  /** Renders `source`, reporting each chunk and then the outline; returns a cancel. */
  render(source: string, onEvent: (event: DocumentRenderEvent) => void): () => void
  /** Renders `source` on the calling thread when that is quick enough; otherwise undefined. */
  renderNow?(source: string): RenderedDocumentTree | undefined
}

/** Renders on the page's thread; used where Web Workers are unavailable. */
export const synchronousRenderer: DocumentRenderer = {
  render(source, onEvent) {
    let cancelled = false
    try {
      for (const event of documentRenderEvents(source)) {
        if (cancelled) break
        onEvent(event)
      }
    } catch (error) {
      if (!cancelled) onEvent({ kind: 'error', message: error instanceof Error ? error.message : String(error) })
    }
    return () => {
      cancelled = true
    }
  },
  renderNow: renderDocumentTree,
}

export interface RendererWorker {
  onmessage: ((event: MessageEvent) => void) | null
  onerror: ((event: ErrorEvent) => void) | null
  postMessage(message: unknown): void
  terminate(): void
}

function startMarkdownWorker(): RendererWorker {
  return new Worker(new URL('./markdown.worker.ts', import.meta.url), { type: 'module' })
}

/** Documents up to this long render on the page in a few milliseconds, as they always did. */
const renderNowLimit = 8_192

/**
 * Renders each document in a worker of its own, so leaving a long document
 * stops its parse at once instead of holding up the next one. A worker that
 * finished its document is kept, loaded and warmed up, for the next one.
 */
export function createWorkerRenderer(startWorker: () => RendererWorker = startMarkdownWorker): DocumentRenderer {
  let spare: RendererWorker | undefined
  return {
    render(source, onEvent) {
      let worker: RendererWorker | undefined
      let active = true
      const end = (finished: boolean) => {
        active = false
        if (!worker) return
        worker.onmessage = null
        worker.onerror = null
        if (finished && !spare) spare = worker
        else worker.terminate()
        worker = undefined
      }
      const fail = (message: string) => {
        if (!active) return
        end(false)
        onEvent({ kind: 'error', message })
      }
      try {
        worker = spare ?? startWorker()
        spare = undefined
        worker.onmessage = ({ data }) => {
          if (!active) return
          const event = data as DocumentRenderEvent
          if (event.kind === 'done' || event.kind === 'error') end(event.kind === 'done')
          onEvent(event)
        }
        worker.onerror = (error) => {
          error.preventDefault()
          fail(error.message || 'The document renderer stopped.')
        }
        worker.postMessage(source)
      } catch (error) {
        fail(error instanceof Error ? error.message : String(error))
      }
      return () => {
        if (active) end(false)
      }
    },
    renderNow: (source) => (source.length <= renderNowLimit ? renderDocumentTree(source) : undefined),
  }
}

let shared: DocumentRenderer | undefined

/** The worker renderer when the browser has workers, otherwise the synchronous one. */
export function defaultDocumentRenderer(): DocumentRenderer {
  if (typeof Worker !== 'function') return synchronousRenderer
  shared ??= createWorkerRenderer()
  return shared
}

/** Lets tests and embedders choose the renderer; absent means `defaultDocumentRenderer()`. */
export const DocumentRendererContext = createContext<DocumentRenderer | undefined>(undefined)
