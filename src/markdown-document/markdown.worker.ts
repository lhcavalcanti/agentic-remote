import { handleRenderRequests } from './worker-handler'
import type { RenderRequest } from './worker-handler'

// Parses Markdown documents off the page's thread; see renderer.ts.
const scope = globalThis as unknown as {
  onmessage: ((event: MessageEvent<RenderRequest>) => void) | null
  postMessage(message: unknown): void
}
const handle = handleRenderRequests((message) => scope.postMessage(message))
scope.onmessage = (event) => handle(event.data)
