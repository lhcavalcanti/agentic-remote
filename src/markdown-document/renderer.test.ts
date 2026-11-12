import { afterEach, describe, expect, it, vi } from 'vitest'
import { outlineFromMarkdown } from '../markdown-navigation'
import { renderDocumentEvents } from './pipeline'
import type { DocumentRenderEvent } from './pipeline'
import { createWorkerRenderer, synchronousRenderer } from './renderer'
import type { RendererWorker } from './renderer'
import { handleRenderRequests } from './worker-handler'

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
    expect(synchronousRenderer.renderNow?.(markdown).outline).toEqual(outlineFromMarkdown(markdown))
  })
})

describe('worker renderer', () => {
  it('routes replies to their render and drops them once cancelled', () => {
    const worker = new FakeWorker()
    const renderer = createWorkerRenderer(() => worker)
    const first = vi.fn()
    const second = vi.fn()
    const cancelFirst = renderer.render('# a', first)
    renderer.render('# b', second)
    expect(worker.posted).toEqual([{ type: 'render', id: 1, source: '# a' }, { type: 'render', id: 2, source: '# b' }])

    worker.reply({ id: 2, kind: 'done', outline: [] })
    cancelFirst()
    expect(worker.posted.at(-1)).toEqual({ type: 'cancel', id: 1 })
    worker.reply({ id: 1, kind: 'done', outline: [] })
    worker.reply({ id: 2, kind: 'done', outline: [] })
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledOnce()
  })

  it('fails pending renders when the worker stops, and starts a fresh one next time', () => {
    const workers: FakeWorker[] = []
    const renderer = createWorkerRenderer(() => {
      workers.push(new FakeWorker())
      return workers.at(-1)!
    })
    const pending = vi.fn()
    renderer.render('# a', pending)
    workers[0]!.fail('out of memory')
    expect(pending).toHaveBeenCalledWith({ kind: 'error', message: 'out of memory' })
    expect(workers[0]!.terminated).toBe(true)

    renderer.render('# b', vi.fn())
    expect(workers).toHaveLength(2)
    expect(workers[1]!.posted).toEqual([{ type: 'render', id: 2, source: '# b' }])
  })
})

describe('worker message handling', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders queued requests in order and skips one cancelled before its turn', () => {
    vi.useFakeTimers()
    const posted: unknown[] = []
    const handle = handleRenderRequests((message) => posted.push(message))
    handle({ type: 'render', id: 1, source: '# a' })
    handle({ type: 'render', id: 2, source: markdown })
    handle({ type: 'cancel', id: 1 })
    expect(posted).toEqual([])
    vi.runAllTimers()
    expect(posted).toEqual(renderDocumentEvents(markdown).map((event) => ({ id: 2, ...event })))
  })
})
