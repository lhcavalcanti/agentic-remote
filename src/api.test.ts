import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  cancelBackgroundTask,
  getProviderRuntimeOptions,
  getRuntimeOptions,
  listBackgroundTasks,
  removeQueuedPrompt,
  sendMessage,
  sendTestPushNotification,
  transcribeAudio,
  uploadSessionFile,
  validateSessionDirectory,
} from './api'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('API request headers', () => {
  it.each([false, true])('preserves the submission token and accepted=%s receipt from HTTP errors', async (accepted) => {
    const submission = { sessionId: 'replacement', failedAt: 'resend:current-token', accepted }
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({
      error: accepted ? 'Already delivered; bookkeeping failed' : 'Check the current recovery',
      submission,
    }, { status: 409 })))
    await expect(sendMessage('computer', 'session', { content: 'recovered', acknowledgesFailure: 'old' }))
      .rejects.toMatchObject({ statusCode: 409, submission })
  })

  it('does not trust malformed receipt fields or expose an internal server message', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({
      statusCode: 500, error: 'Internal Server Error', message: 'private exception details',
      submission: { sessionId: 'session', failedAt: 'token', accepted: 'true' },
    }, { status: 500 })))
    await expect(sendMessage('computer', 'session', { content: 'recovered' }))
      .rejects.toMatchObject({ message: 'Internal Server Error', statusCode: 500, submission: undefined })
  })

  it('requests fresh provider and session model catalogs without browser caching', async () => {
    const fetchMock = vi.fn(async () => Response.json({ models: [] }))
    vi.stubGlobal('fetch', fetchMock)

    await getProviderRuntimeOptions('computer', 'copilot')
    await getRuntimeOptions('computer', 'session')

    expect(fetchMock.mock.calls).toEqual([
      [
        '/api/computers/computer/providers/copilot/runtime',
        expect.objectContaining({ cache: 'no-store' }),
      ],
      [
        '/api/computers/computer/sessions/session/runtime',
        expect.objectContaining({ cache: 'no-store' }),
      ],
    ])
  })

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

  it('lists background tasks for one owning session', async () => {
    const fetchMock = vi.fn(async (path: string, init?: RequestInit) => {
      expect(path).toBe('/api/computers/computer/sessions/session/tasks')
      expect(init?.method).toBeUndefined()
      return Response.json({
        tasks: [],
        runningCount: 0,
        supported: true,
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(listBackgroundTasks('computer', 'session')).resolves.toEqual({
      tasks: [],
      runningCount: 0,
      supported: true,
    })
  })

  it('cancels a background task through its owning session', async () => {
    const fetchMock = vi.fn(async (path: string, init?: RequestInit) => {
      expect(path).toBe(
        '/api/computers/computer/sessions/session/tasks/task%2Fid/cancel',
      )
      expect(init?.method).toBe('POST')
      expect(init?.body).toBe('{}')
      return Response.json({
        tasks: [],
        runningCount: 0,
        supported: true,
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    await cancelBackgroundTask('computer', 'session', 'task/id')
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

  it('validates a session folder on its owning computer', async () => {
    const fetchMock = vi.fn(async (path: string, init?: RequestInit) => {
      expect(path).toBe(
        '/api/computers/computer/directories/validate',
      )
      expect(init?.method).toBe('POST')
      expect(init?.body).toBe(JSON.stringify({ path: '~/src' }))
      return Response.json({ path: '/home/tester/src' })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      validateSessionDirectory('computer', '~/src'),
    ).resolves.toBe('/home/tester/src')
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
