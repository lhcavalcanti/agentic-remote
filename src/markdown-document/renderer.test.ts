import { describe, expect, it, vi } from 'vitest'
import { outlineFromMarkdown } from '../markdown-navigation'
import { documentRenderEvents } from './pipeline'
import type { DocumentRenderEvent } from './pipeline'
import { createWorkerRenderer, synchronousRenderer } from './renderer'
import type { RendererWorker } from './renderer'
import { handleRenderRequest } from './worker-handler'

const markdown = '# One\n\nText.\n\n## Two\n'

/** A stand-in for the module worker, answering through `reply`. */
class FakeWorker implements RendererWorker {
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: ErrorEvent) => void) | null = null
  posted: unknown[] = []
  terminated = false
  postMessage(message: unknown) {
    this.posted.push(message)
  }
  terminate() {
    this.terminated = true
  }
  reply(data: unknown) {
    this.onmessage?.({ data } as MessageEvent)
  }
  fail(message: string) {
    this.onerror?.({ message, preventDefault() {} } as ErrorEvent)
  }
}

describe('synchronous renderer', () => {
  it('reports every chunk and then the outline before returning', () => {
    const events: DocumentRenderEvent[] = []
    synchronousRenderer.render(markdown, (event) => events.push(event))
    expect(events.map((event) => event.kind)).toEqual(['chunk', 'done'])
    expect(events.at(-1)).toEqual({ kind: 'done', outline: outlineFromMarkdown(markdown) })
    expect(synchronousRenderer.renderNow?.(markdown)?.outline).toEqual(outlineFromMarkdown(markdown))
  })
})

describe('worker renderer', () => {
  const large = `# Large\n\n${'A paragraph of text that keeps going. '.repeat(400)}\n`

  function startWorkers() {
    const workers: FakeWorker[] = []
    const renderer = createWorkerRenderer(() => {
      workers.push(new FakeWorker())
      return workers.at(-1)!
    })
    return { renderer, workers }
  }

  it('renders each document in its own worker and stops it when done', () => {
    const { renderer, workers } = startWorkers()
    const events = vi.fn()
    renderer.render(large, events)
    renderer.render(markdown, vi.fn())
    expect(workers.map((worker) => worker.posted)).toEqual([[large], [markdown]])

    workers[0]!.reply({ kind: 'chunk', tree: { type: 'root', children: [] } })
    workers[0]!.reply({ kind: 'done', outline: [] })
    expect(events.mock.calls.map(([event]) => (event as DocumentRenderEvent).kind)).toEqual(['chunk', 'done'])
    expect(workers.map((worker) => worker.terminated)).toEqual([true, false])
  })

  it('stops the worker when cancelled and ignores anything it still sends', () => {
    const { renderer, workers } = startWorkers()
    const events = vi.fn()
    renderer.render(large, events)()
    expect(workers[0]!.terminated).toBe(true)
    workers[0]!.reply({ kind: 'done', outline: [] })
    expect(events).not.toHaveBeenCalled()
  })

  it('reports a worker that stops or cannot start', () => {
    const { renderer, workers } = startWorkers()
    const stopped = vi.fn()
    renderer.render(large, stopped)
    workers[0]!.fail('out of memory')
    expect(stopped).toHaveBeenCalledWith({ kind: 'error', message: 'out of memory' })
    expect(workers[0]!.terminated).toBe(true)

    const blocked = vi.fn()
    createWorkerRenderer(() => {
      throw new Error('blocked by policy')
    }).render(large, blocked)
    expect(blocked).toHaveBeenCalledWith({ kind: 'error', message: 'blocked by policy' })
  })

  it('renders small documents on the spot instead of starting a worker', () => {
    const start = vi.fn()
    const renderer = createWorkerRenderer(start)
    expect(renderer.renderNow?.(markdown)?.outline).toEqual(outlineFromMarkdown(markdown))
    expect(renderer.renderNow?.(large)).toBeUndefined()
    expect(start).not.toHaveBeenCalled()
  })
})

describe('worker message handling', () => {
  it('posts every render event in order', () => {
    const posted: unknown[] = []
    handleRenderRequest((message) => posted.push(message))(markdown)
    expect(posted).toEqual([...documentRenderEvents(markdown)])
  })
})
