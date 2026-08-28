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

describe('API error messages', () => {
  async function failWith(
    status: number,
    body: Record<string, unknown>,
  ): Promise<string> {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json(body, { status })),
    )
    return sendMessage('computer', 'session', { content: 'hello' }).then(
      () => 'no error thrown',
      (error: Error) => error.message,
    )
  }

  it('surfaces the reason from the app error shape', async () => {
    await expect(
      failWith(400, { error: 'Sessions are restricted to the user home directory' }),
    ).resolves.toBe('Sessions are restricted to the user home directory')
  })

  it("surfaces the reason from Fastify's default client-error shape", async () => {
    await expect(
      failWith(400, { statusCode: 400, error: 'Bad Request', message: 'Folder does not exist' }),
    ).resolves.toBe('Folder does not exist')
  })

  it('never surfaces an internal 5xx message', async () => {
    await expect(
      failWith(500, {
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'database on fire',
      }),
    ).resolves.toBe('Internal Server Error')
  })

  it('falls back to the status when there is no body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 503 })),
    )
    await expect(
      sendMessage('computer', 'session', { content: 'hello' }).then(
        () => 'no error thrown',
        (error: Error) => error.message,
      ),
    ).resolves.toBe('Request failed (503)')
  })
})
