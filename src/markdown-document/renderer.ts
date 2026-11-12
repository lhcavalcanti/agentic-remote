import { createContext } from 'react'
import { renderDocumentEvents, renderDocumentTree } from './pipeline'
import type { DocumentRenderEvent, RenderedDocumentTree } from './pipeline'

export interface DocumentRenderer {
  /** Renders `source`, reporting each chunk and then the outline; returns a cancel. */
  render(source: string, onEvent: (event: DocumentRenderEvent) => void): () => void
  /** Present when rendering happens on the calling thread, before it returns. */
  renderNow?(source: string): RenderedDocumentTree
}

/** Renders on the page's thread; used where Web Workers are unavailable. */
export const synchronousRenderer: DocumentRenderer = {
  render(source, onEvent) {
    let cancelled = false
    try {
      for (const event of renderDocumentEvents(source)) {
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

/**
 * Renders in one shared Web Worker. Replies are matched to their request, a
 * cancelled request's replies are dropped, and a worker that stops fails its
 * pending renders and is replaced on the next one.
 */
export function createWorkerRenderer(startWorker: () => RendererWorker = startMarkdownWorker): DocumentRenderer {
  let worker: RendererWorker | undefined
  let nextId = 0
  const listeners = new Map<number, (event: DocumentRenderEvent) => void>()

  function running(): RendererWorker {
    if (worker) return worker
    const started = startWorker()
    started.onmessage = ({ data }) => {
      const { id, ...event } = data as { id: number } & DocumentRenderEvent
      const listener = listeners.get(id)
      if (!listener) return
      if (event.kind !== 'chunk') listeners.delete(id)
      listener(event as DocumentRenderEvent)
    }
    started.onerror = (error) => {
      error.preventDefault()
      started.terminate()
      if (worker === started) worker = undefined
      const pending = [...listeners.values()]
      listeners.clear()
      for (const listener of pending) {
        listener({ kind: 'error', message: error.message || 'The document renderer stopped.' })
      }
    }
    worker = started
    return started
  }

  return {
    render(source, onEvent) {
      const id = ++nextId
      listeners.set(id, onEvent)
      try {
        running().postMessage({ type: 'render', id, source })
      } catch (error) {
        listeners.delete(id)
        onEvent({ kind: 'error', message: error instanceof Error ? error.message : String(error) })
      }
      return () => {
        if (listeners.delete(id)) worker?.postMessage({ type: 'cancel', id })
      }
    },
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
