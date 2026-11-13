import { handleRenderRequest } from './worker-handler'
import type { RenderRequest } from './worker-handler'

// Parses one Markdown document off the page's thread; see renderer.ts.
const scope = globalThis as unknown as {
  onmessage: ((event: MessageEvent<RenderRequest>) => void) | null
  postMessage(message: unknown): void
}
const render = handleRenderRequest((event) => scope.postMessage(event))
scope.onmessage = (event) => render(event.data)
