import { renderDocumentEvents } from './pipeline'

export type RenderRequest = { type: 'render'; id: number; source: string } | { type: 'cancel'; id: number }

/**
 * The worker's message loop. Requests wait one task before rendering, so a
 * cancellation that arrives right behind its request (the reader moved to
 * another file) skips work that would only be thrown away.
 */
export function handleRenderRequests(post: (message: unknown) => void) {
  const pending = new Map<number, string>()
  let scheduled = false

  function drain() {
    scheduled = false
    for (const [id, source] of [...pending]) {
      pending.delete(id)
      try {
        for (const event of renderDocumentEvents(source)) post({ id, ...event })
      } catch (error) {
        post({ id, kind: 'error', message: error instanceof Error ? error.message : String(error) })
      }
    }
  }

  return (request: RenderRequest) => {
    if (request.type === 'cancel') pending.delete(request.id)
    else pending.set(request.id, request.source)
    if (!scheduled) {
      scheduled = true
      setTimeout(drain, 0)
    }
  }
}
