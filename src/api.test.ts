import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  removeQueuedPrompt,
  sendMessage,
  sendTestPushNotification,
  transcribeAudio,
  uploadSessionFile,
} from './api'

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

  it('lets the browser set the multipart boundary for audio uploads', async () => {
    const fetchMock = vi.fn(async (_path: string, init?: RequestInit) => {
      expect(init?.method).toBe('POST')
      expect(init?.body).toBeInstanceOf(FormData)
      expect(new Headers(init?.headers).has('content-type')).toBe(false)
      return Response.json({ transcript: 'An idea', durationSeconds: 3 })
    })

    vi.stubGlobal('fetch', fetchMock)
    const file = new File(['audio'], 'idea.m4a', { type: 'audio/x-m4a' })

    await expect(transcribeAudio(file)).resolves.toEqual({
      transcript: 'An idea',
      durationSeconds: 3,
    })
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('uploads session files as browser multipart data', async () => {
    const fetchMock = vi.fn(async (path: string, init?: RequestInit) => {
      expect(path).toBe('/api/computers/computer/sessions/session/files')
      expect(init?.method).toBe('POST')
      expect(init?.body).toBeInstanceOf(FormData)
      expect(new Headers(init?.headers).has('content-type')).toBe(false)
      return Response.json({
        file: {
          name: 'statement.pdf',
          path: '/private/statement.pdf',
          size: 4,
        },
      })
    })
    vi.stubGlobal('fetch', fetchMock)
    const file = new File(['data'], 'statement.pdf', {
      type: 'application/pdf',
    })

    await expect(
      uploadSessionFile('computer', 'session', file),
    ).resolves.toEqual({
      name: 'statement.pdf',
      path: '/private/statement.pdf',
      size: 4,
    })
  })

  it('requires a JSON confirmation for push test requests', async () => {
    const fetchMock = vi.fn(async (_path: string, init?: RequestInit) => {
      expect(init?.method).toBe('POST')
      expect(init?.body).toBe(JSON.stringify({ confirm: true }))
      expect(new Headers(init?.headers).get('content-type')).toBe(
        'application/json',
      )
      return Response.json({ sent: 1 })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(sendTestPushNotification()).resolves.toEqual({ sent: 1 })
    expect(fetchMock).toHaveBeenCalledOnce()
  })
})
