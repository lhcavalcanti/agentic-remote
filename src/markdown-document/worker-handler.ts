import { documentRenderEvents } from './pipeline'
import type { DocumentRenderEvent } from './pipeline'

/** Renders one document, posting each event as soon as it is ready. */
export function handleRenderRequest(post: (event: DocumentRenderEvent) => void) {
  return (source: string) => {
    try {
      for (const event of documentRenderEvents(source)) post(event)
    } catch (error) {
      post({ kind: 'error', message: error instanceof Error ? error.message : String(error) })
    }
  }
}
