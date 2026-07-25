import { afterEach, describe, expect, it, vi } from 'vitest'
import { removeQueuedPrompt, sendMessage } from './api'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('API request headers', () => {
  it('does not mark a bodyless queue DELETE as JSON', async () => {
    const fetchMock = vi.fn(async (_path: string, init?: RequestInit) => {
      expect(init?.method).toBe('DELETE')
      expect(new Headers(init?.headers).has('content-type')).toBe(false)
      return Response.json({
        session: {},
        prompt: { id: 'queued', content: 'edit me', createdAt: '' },
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    await removeQueuedPrompt('computer', 'session', 'queued')

    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('marks requests with JSON bodies as JSON', async () => {
    const fetchMock = vi.fn(async (_path: string, init?: RequestInit) => {
      expect(new Headers(init?.headers).get('content-type')).toBe(
        'application/json',
      )
      return Response.json({ session: {} })
    })
    vi.stubGlobal('fetch', fetchMock)

    await sendMessage('computer', 'session', { content: 'hello' })

    expect(fetchMock).toHaveBeenCalledOnce()
  })
})
