import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  cancelBackgroundTask,
  dispatchQueuedPrompt,
  getProviderRuntimeOptions,
  getRuntimeOptions,
  listBackgroundTasks,
  listSessionMcpServers,
  listSessionSkills,
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

  describe('session resource reads', () => {
    const metadata = {
      computerId: 'computer', sessionId: 'session', provider: 'copilot',
      scope: 'session', capturedAt: '2026-09-05T00:00:00.000Z',
    }

    it('uses read-only uncached requests with the caller cancellation signal', async () => {
      const controller = new AbortController()
      const payload = {
        ...metadata, computerId: 'computer/one', sessionId: 'session/one',
        skills: [{ name: 'review', description: 'Review code', source: 'project' }],
      }
      const fetch = vi.fn(async (_url: string, _init?: RequestInit) => Response.json(payload))
      vi.stubGlobal('fetch', fetch)
      await expect(listSessionSkills('computer/one', 'session/one', 'copilot', controller.signal))
        .resolves.toMatchObject(payload)
      expect(fetch).toHaveBeenCalledExactlyOnceWith(
        '/api/computers/computer%2Fone/sessions/session%2Fone/skills',
        expect.objectContaining({ cache: 'no-store', signal: controller.signal }),
      )
      expect(fetch.mock.calls[0][1]?.method).toBeUndefined()
      expect(fetch.mock.calls[0][1]?.body).toBeUndefined()
    })

    it('strips unsolicited MCP configuration and error fields', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => Response.json({
        ...metadata,
        host: { fullConfig: { env: { token: 'DO-NOT-RETURN-CONFIG' } } },
        servers: [{
          name: 'source-control', status: 'failed', source: 'user',
          config: { url: 'https://example.invalid/DO-NOT-RETURN-URL' },
          error: 'DO-NOT-RETURN-ERROR',
        }],
      })))
      const result = await listSessionMcpServers('computer', 'session', 'copilot')
      expect(result.servers).toEqual([expect.objectContaining({ name: 'source-control', status: 'failed' })])
      expect(JSON.stringify(result)).not.toContain('DO-NOT-RETURN')
      expect(result).not.toHaveProperty('host')
    })

    it('does not retain skill instructions or file paths outside the summary', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => Response.json({
        ...metadata,
        skills: [{ name: 'review', description: 'A safe description', instructions: 'PRIVATE-INSTRUCTIONS', path: '/private/skill.md' }],
      })))
      const result = await listSessionSkills('computer', 'session', 'copilot')
      expect(result.skills[0].description).toBe('A safe description')
      expect(JSON.stringify(result)).not.toContain('PRIVATE-INSTRUCTIONS')
      expect(result.skills[0]).not.toHaveProperty('path')
    })

    it.each([
      { ...metadata, computerId: 'other', skills: [] },
      { ...metadata, sessionId: 'other', skills: [] },
      { ...metadata, provider: 'claude', skills: [] },
      { ...metadata, scope: 'invented', skills: [] },
      { ...metadata, capturedAt: 'not a timestamp', skills: [] },
      { ...metadata, skills: [{ name: null }] },
      { ...metadata, scope: 'unavailable', skills: [] },
      { ...metadata, scope: 'unavailable', message: 'Unavailable', skills: [{ name: 'not really unavailable' }] },
    ])('rejects a malformed or foreign skills response %#', async (payload) => {
      vi.stubGlobal('fetch', vi.fn(async () => Response.json(payload)))
      await expect(listSessionSkills('computer', 'session', 'copilot'))
        .rejects.toThrow('invalid skills response')
    })

    it.each([
      { ...metadata, computerId: 'other', servers: [] },
      { ...metadata, servers: [{ name: 'server', status: 'not-a-status' }] },
      { ...metadata, servers: [{ name: 'server', status: 'connected', toolCount: -1 }] },
    ])('rejects a malformed or foreign MCP response %#', async (payload) => {
      vi.stubGlobal('fetch', vi.fn(async () => Response.json(payload)))
      await expect(listSessionMcpServers('computer', 'session', 'copilot'))
        .rejects.toThrow('invalid MCP response')
    })

    it('preserves an explicit unavailable reason instead of turning it into an empty catalog', async () => {
      const payload = { ...metadata, scope: 'unavailable', message: 'The provider has not reported resources.', servers: [] }
      vi.stubGlobal('fetch', vi.fn(async () => Response.json(payload)))
      await expect(listSessionMcpServers('computer', 'session', 'copilot')).resolves.toMatchObject(payload)
    })

    it('does not reflect a malformed JSON body into an error message', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => new Response('PRIVATE-MALFORMED-BODY')))
      await expect(listSessionSkills('computer', 'session', 'copilot'))
        .rejects.toThrow('invalid resource response')
    })
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

describe('Queued dispatch confirmations', () => {
  const session = {
    id: 'session', computerId: 'computer', computerName: 'Fixture',
    title: 'Queued fixture', cwd: '/tmp/fixture', updatedAt: '2026-09-05T00:00:00Z',
    isOpen: true, status: 'idle', messages: [],
  }
  const accepted = {
    outcome: 'sent', promptId: 'queued', attemptId: 'attempt-1', session,
  }

  it('dispatches exactly one named item with unchanged prompt whitespace', async () => {
    const fetchMock = vi.fn(async (_path: string, _init?: RequestInit) => Response.json(accepted))
    vi.stubGlobal('fetch', fetchMock)
    await expect(dispatchQueuedPrompt('computer', 'session', 'queued', '  rewritten\n'))
      .resolves.toEqual(accepted)
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      '/api/computers/computer/sessions/session/queue/queued/dispatch',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ content: '  rewritten\n' }),
        signal: expect.any(AbortSignal),
      }),
    )
  })

  it.each([408, 499, 500, 502, 504])('keeps HTTP %i delivery uncertain', async (status) => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'Unconfirmed' }, { status })))
    await expect(dispatchQueuedPrompt('computer', 'session', 'queued', 'text'))
      .rejects.toMatchObject({ uncertainDelivery: true })
  })

  it.each([400, 401, 403, 404, 409, 422, 429])('recognizes an HTTP %i admission refusal', async (status) => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'Not admitted' }, { status })))
    await expect(dispatchQueuedPrompt('computer', 'session', 'queued', 'text'))
      .rejects.toMatchObject({ uncertainDelivery: false })
  })

  it('never retries a lost transport acknowledgment', async () => {
    const fetchMock = vi.fn(async () => { throw new TypeError('Connection lost') })
    vi.stubGlobal('fetch', fetchMock)
    await expect(dispatchQueuedPrompt('computer', 'session', 'queued', 'text'))
      .rejects.toMatchObject({ uncertainDelivery: true })
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('preserves a remote transport uncertainty without inventing an attempt ID', async () => {
    const result = {
      outcome: 'uncertain', promptId: 'queued', delivery: 'unknown',
      message: 'The owning computer did not confirm dispatch. No automatic retry was made.',
    }
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(result)))
    await expect(dispatchQueuedPrompt('computer', 'session', 'queued', 'text'))
      .resolves.toEqual(result)
  })

  it.each([
    null,
    { ...accepted, promptId: 'another-queued-item' },
    { ...accepted, attemptId: undefined },
    { ...accepted, session: undefined },
    { ...accepted, session: { ...session, computerId: 'another-computer' } },
    { ...accepted, session: { ...session, id: 'another-session' } },
    { ...accepted, session: { ...session, messages: undefined } },
    { ...accepted, outcome: 'refused', restored: undefined },
    { ...accepted, outcome: 'uncertain', delivery: undefined },
    { outcome: 'uncertain', promptId: 'queued', delivery: 'accepted' },
  ])('does not release ownership for an incomplete or mismatched response %#', async (result) => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(result)))
    await expect(dispatchQueuedPrompt('computer', 'session', 'queued', 'text'))
      .rejects.toMatchObject({ uncertainDelivery: true })
  })

  it('keeps a response whose body was lost uncertain', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('incomplete')))
    await expect(dispatchQueuedPrompt('computer', 'session', 'queued', 'text'))
      .rejects.toMatchObject({ uncertainDelivery: true })
  })

  it('sends the exact unconfirmed attempt acknowledgment with a queue discard', async () => {
    const fetchMock = vi.fn(async () => Response.json({ session, prompt: { id: 'queued' } }))
    vi.stubGlobal('fetch', fetchMock)
    await removeQueuedPrompt('computer', 'session', 'queued', 'attempt-1')
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      '/api/computers/computer/sessions/session/queue/queued',
      expect.objectContaining({
        method: 'DELETE', body: JSON.stringify({ acknowledgesDispatch: 'attempt-1' }),
      }),
    )
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
