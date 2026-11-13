import { documentRenderEvents } from './pipeline'
import type { DocumentRenderEvent } from './pipeline'

/** A document to render, and the tags of elements to draw whole. */
export interface RenderRequest {
  source: string
  whole?: string[]
}

/** Renders one document, posting each event as soon as it is ready. */
export function handleRenderRequest(post: (event: DocumentRenderEvent) => void) {
  return ({ source, whole }: RenderRequest) => {
    try {
      for (const event of documentRenderEvents(source, whole)) post(event)
    } catch (error) {
      post({ kind: 'error', message: error instanceof Error ? error.message : String(error) })
    }
  }
}
