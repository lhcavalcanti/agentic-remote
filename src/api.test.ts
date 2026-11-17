import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  cancelBackgroundTask,
  checkHubSignIn,
  createOracleVoiceTicket,
  dispatchQueuedPrompt,
  fetchSettingsProfile,
  fetchHubFeatureFlags,
  getOracleVoiceCapabilities,
  importSettingsProfile,
  saveSettingsChanges,
  getProviderRuntimeOptions,
  getSession,
  getSessionKnowledgeRoot,
  getRuntimeOptions,
  HUB_SNAPSHOT_TIMEOUT_MS,
  listBackgroundTasks,
  listComputers,
  listHistory,
  listKnowledgeEntries,
  listSessionListing,
  listSessionMcpServers,
  listSessionSkills,
  removeComputer,
  removeQueuedPrompt,
  removeManagerFile,
  readKnowledgeFile,
  request,
  sendMessage,
  sendTestPushNotification,
  transcribeAudio,
  uploadSessionFile,
  validateSessionDirectory,
} from './api'
import {
  HubSignInExpiredError,
  hubSignInExpired,
  setHubSignInExpired,
} from './hub-sign-in'
import {
  currentSessionEventSequence,
  nextSessionEventSequence,
  sessionResponseStartedAt,
} from './session-response-order'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('API request headers', () => {
  it('reads authoritative hub feature booleans without caching', async () => {
    const flags = { notificationCenter: true, hostMonitor: false, scheduler: false }
    const fetchMock = vi.fn(async () => Response.json({ hubFlags: flags }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchHubFeatureFlags()).resolves.toEqual(flags)
    expect(fetchMock).toHaveBeenCalledWith('/api/features', expect.objectContaining({ cache: 'no-store' }))
  })

  it.each([undefined, null, {}, { notificationCenter: 'on', hostMonitor: false, scheduler: false }])(
    'rejects malformed hub feature state %j instead of enabling a preview',
    async (hubFlags) => {
      vi.stubGlobal('fetch', vi.fn(async () => Response.json({ hubFlags })))
      await expect(fetchHubFeatureFlags()).rejects.toThrow('invalid feature flags')
    },
  )

  it('removes an Oracle upload successfully with an empty 204 response', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(removeManagerFile('upload-id')).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/manager/files/upload-id',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('bounds a stalled Oracle upload DELETE while preserving sign-in expiry errors', async () => {
    vi.useFakeTimers()
    let signal: AbortSignal | undefined
    const fetchMock = vi.fn((_path: string, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      signal = init?.signal ?? undefined
      signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
    }))
    vi.stubGlobal('fetch', fetchMock)
    const outcome = removeManagerFile('stalled').catch((error: unknown) => error)
    await vi.advanceTimersByTimeAsync(15_000)
    expect(signal?.aborted).toBe(true)
    expect(await outcome).toMatchObject({ message: expect.stringMatching(/timed out/i) })
    expect(vi.getTimerCount()).toBe(0)

    fetchMock.mockResolvedValueOnce(new Response(null, {
      status: 401, headers: { 'www-authenticate': 'Bearer' },
    }))
    try {
      await expect(removeManagerFile('expired')).rejects.toBeInstanceOf(HubSignInExpiredError)
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      setHubSignInExpired(false)
    }
  })

  it('requests passive session detail without activating it', async () => {
    const fetchMock = vi.fn(async () => Response.json({
      session: { id: 'session' },
    }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(getSession(
      'computer',
      'session',
      undefined,
      { passive: true },
    )).resolves.toEqual({ id: 'session' })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/computers/computer/sessions/session?passive=1',
      expect.objectContaining({ cache: 'no-store' }),
    )
  })

  it('requests no-store Oracle voice capabilities', async () => {
    const capability = {
      protocol: 2,
      available: true,
      computerId: 'development',
      computerName: 'Development',
      sampleRate: 16_000,
      playbackSampleRate: 22_050,
      languages: ['en'],
      sttProfile: 'sherpa-streaming',
      ttsVoice: 'kitten-nano',
      resourceClass: 'low',
      limits: {
        maxFrameBytes: 64_000,
        maxQueueBytes: 256_000,
        maxUtteranceMs: 60_000,
      },
    }
    const fetchMock = vi.fn(async () => Response.json(capability))
    vi.stubGlobal('fetch', fetchMock)

    await expect(getOracleVoiceCapabilities()).resolves.toEqual(capability)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/oracle-voice/capabilities',
      expect.objectContaining({ cache: 'no-store' }),
    )
  })

  it('requests a no-store Oracle voice ticket', async () => {
    const ticket = {
      ticket: 'voice-ticket',
      expiresAt: '2026-10-16T00:00:30Z',
    }
    const fetchMock = vi.fn(async () => Response.json(ticket))
    vi.stubGlobal('fetch', fetchMock)

    await expect(createOracleVoiceTicket()).resolves.toEqual(ticket)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/oracle-voice/tickets',
      expect.objectContaining({ method: 'POST', cache: 'no-store' }),
    )
  })

  it('turns a non-JSON gateway response into an actionable hub error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('upstream unavailable', { status: 502 })),
    )

    await expect(listComputers()).rejects.toMatchObject({
      statusCode: 502,
      message: 'The gateway could not reach Agentic Remote (502). Check the hub service and tunnel, then retry.',
    })
  })

  it.each([
    ['HOST_TELEMETRY_INVALID', 'HOST_TELEMETRY_INVALID'],
    [undefined, undefined],
    [502, undefined],
    [null, undefined],
  ])('preserves only string error codes from HTTP responses (%j)', async (code, expectedCode) => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({
      error: 'This computer returned invalid host telemetry', code, uncertainDelivery: false,
    }, { status: 502 })))
    await expect(request('/api/computers/studio/host')).rejects.toMatchObject({
      statusCode: 502, message: 'This computer returned invalid host telemetry',
      code: expectedCode, uncertainDelivery: false,
    })
  })

  it('bounds the initial hub snapshot instead of loading forever', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn((_path: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(init.signal?.reason),
            { once: true },
          )
        })),
    )

    const result = expect(listSessionListing()).rejects.toThrow(
      'Agentic Remote did not answer within 15 seconds. Check the hub service and tunnel, then retry.',
    )
    await vi.advanceTimersByTimeAsync(HUB_SNAPSHOT_TIMEOUT_MS)
    await result
  })

  it('does not advise retrying a non-JSON write with an unknown outcome', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('upstream unavailable', { status: 502 })),
    )

    await expect(sendMessage('computer', 'session', { content: 'hello' }))
      .rejects.toMatchObject({
        statusCode: 502,
        uncertainDelivery: true,
        message: expect.stringContaining('the request outcome is unknown'),
      })
  })

  it.each(['detail', 'listing', 'history', 'queue envelope'] as const)(
    'retains request-start provenance through serialized %s responses without wire changes',
    async (surface) => {
      const session = { id: 'session', computerId: 'computer', revision: 6, messages: [] }
      const body = surface === 'listing' || surface === 'history'
        ? { sessions: [session], answeredComputerIds: ['computer'] }
        : { session, prompt: { id: 'queue', content: 'Queued work', createdAt: '' } }
      const bytes = JSON.stringify(body)
      let release!: (response: Response) => void
      vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => { release = resolve })))
      const startedAt = currentSessionEventSequence()
      const pending = surface === 'detail' ? getSession('computer', 'session')
        : surface === 'listing' ? listSessionListing()
        : surface === 'history' ? listHistory()
        : removeQueuedPrompt('computer', 'session', 'queue')
      const eventAt = nextSessionEventSequence()
      release(new Response(bytes, { status: 200 }))
      const result = await pending
      const entries = Array.isArray(result) ? result
        : 'sessions' in result ? result.sessions
        : 'session' in result ? [result.session]
        : [result]
      expect(entries).toHaveLength(1)
      expect(entries[0]).toEqual(session)
      expect(sessionResponseStartedAt(entries[0])).toBe(startedAt)
      expect(startedAt).toBeLessThan(eventAt)
      expect(Object.keys(entries[0])).toEqual(Object.keys(session))
    },
  )

  it.each([false, true])('preserves the submission token and accepted=%s receipt from HTTP errors', async (accepted) => {
    const submission = { sessionId: 'replacement', failedAt: 'resend:current-token', accepted }
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({
      error: accepted ? 'Already delivered; bookkeeping failed' : 'Check the current recovery',
      submission,
    }, { status: 409 })))
    await expect(sendMessage('computer', 'session', { content: 'recovered', acknowledgesFailure: 'old' }))
      .rejects.toMatchObject({ statusCode: 409, submission })
  })

  it.each([
    [409, false],
    [409, true],
    [500, false],
    [500, true],
  ] as const)('preserves explicit HTTP %i delivery uncertainty=%s', async (status, uncertainDelivery) => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({
      error: 'Synthetic request failure',
      uncertainDelivery,
    }, { status })))
    await expect(sendMessage('computer', 'session', { content: 'hello' }))
      .rejects.toMatchObject({ statusCode: status, uncertainDelivery })
  })

  it('preserves a typed terminal draft conflict from HTTP errors', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({
      error: 'Terminal text is blocking this message',
      terminalDraftConflict: true,
      uncertainDelivery: false,
    }, { status: 409 })))

    await expect(sendMessage('computer', 'session', { content: 'hello' }))
      .rejects.toMatchObject({
        statusCode: 409,
        terminalDraftConflict: true,
        uncertainDelivery: false,
      })
  })

  it.each([
    [400, false],
    [409, true],
    [500, true],
  ] as const)('infers legacy HTTP %i delivery uncertainty=%s', async (status, uncertainDelivery) => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({
      error: 'Legacy request failure',
    }, { status })))
    await expect(sendMessage('computer', 'session', { content: 'hello' }))
      .rejects.toMatchObject({ statusCode: status, uncertainDelivery })
  })

  it('does not trust malformed receipt fields or expose an internal server message', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({
      statusCode: 500, error: 'Internal Server Error', message: 'private exception details',
      submission: { sessionId: 'session', failedAt: 'token', accepted: 'true' },
    }, { status: 500 })))
    await expect(sendMessage('computer', 'session', { content: 'recovered' }))
      .rejects.toMatchObject({ message: 'Internal Server Error', statusCode: 500, submission: undefined })
  })

  it('forwards a bounded queue-check signal without using a cached session snapshot', async () => {
    const controller = new AbortController()
    const fetchMock = vi.fn(async (_path: string, init?: RequestInit) => {
      expect(init?.signal).toBe(controller.signal)
      expect(init?.cache).toBe('no-store')
      return Response.json({ session: { id: 'session' } })
    })
    vi.stubGlobal('fetch', fetchMock)
    await expect(getSession('computer', 'session', controller.signal)).resolves.toEqual({ id: 'session' })
    expect(fetchMock).toHaveBeenCalledOnce()
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

  it('adds a nested base only to scoped Knowledge reads', async () => {
    const fetchMock = vi.fn(async (_url: RequestInfo | URL) => Response.json({
      path: '.',
      entries: [],
      name: 'README.md',
      kind: 'markdown',
      mimeType: 'text/markdown',
      size: 0,
    }))
    vi.stubGlobal('fetch', fetchMock)

    await listKnowledgeEntries('projects', '.', 'agentic-remote/docs')
    await readKnowledgeFile('projects', 'README.md', 'agentic-remote/docs')
    await listKnowledgeEntries('projects')

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/knowledge/roots/projects/entries?path=.&basePath=agentic-remote%2Fdocs',
      '/api/knowledge/roots/projects/file?path=README.md&basePath=agentic-remote%2Fdocs',
      '/api/knowledge/roots/projects/entries?path=.',
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

  it('treats a bare 409 refusal from this route as definite', async () => {
    // Doubt about this route is answered in the body, as an uncertain outcome.
    // A 409 is the queue refusing before anything was handed over, so the
    // rewrite it refused is still safe to send again.
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'Queue refused' }, { status: 409 })))
    await expect(dispatchQueuedPrompt('computer', 'session', 'queued', 'text'))
      .rejects.toMatchObject({ uncertainDelivery: false })
  })

  it('still believes a 409 that says delivery was uncertain', async () => {
    vi.stubGlobal('fetch', vi.fn(async () =>
      Response.json({ error: 'Refused after paste', uncertainDelivery: true }, { status: 409 })))
    await expect(dispatchQueuedPrompt('computer', 'session', 'queued', 'text'))
      .rejects.toMatchObject({ uncertainDelivery: true })
  })

  it.each([400, 401, 403, 404, 422, 429])('recognizes an HTTP %i admission refusal', async (status) => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'Not admitted' }, { status })))
    await expect(dispatchQueuedPrompt('computer', 'session', 'queued', 'text'))
      .rejects.toMatchObject({ uncertainDelivery: false })
  })

  it('preserves an explicit uncertain HTTP 409 queued delivery', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({
      error: 'The request crossed the delivery boundary',
      uncertainDelivery: true,
    }, { status: 409 })))
    await expect(dispatchQueuedPrompt('computer', 'session', 'queued', 'text'))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: true })
  })

  it('recognizes an explicit definitive HTTP 409 queued refusal', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({
      error: 'The terminal is busy',
      uncertainDelivery: false,
    }, { status: 409 })))
    await expect(dispatchQueuedPrompt('computer', 'session', 'queued', 'text'))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: false })
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

  it('retains the HTTP status for definitive submission handling', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ error: 'Prompt is too long' }, { status: 400 })),
    )
    await expect(
      sendMessage('computer', 'session', { content: 'hello' }),
    ).rejects.toMatchObject({ message: 'Prompt is too long', statusCode: 400 })
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

describe('settings profile requests', () => {
  const settings = { profileId: 'p', revision: 2, values: { accent: 'teal' } }

  it('reads, changes, and imports the hub profile without browser caching', async () => {
    const fetchMock = vi.fn(async (path: string, _init?: RequestInit) =>
      Response.json(path === '/api/settings' ? { settings, conflicts: ['accent'] } : { settings }),
    )
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchSettingsProfile()).resolves.toEqual(settings)
    await expect(
      saveSettingsChanges({ accent: { value: 'rose', baseRevision: 1 } }, 'device-1'),
    ).resolves.toEqual({ settings, conflicts: ['accent'] })
    await expect(importSettingsProfile({ sessionSort: 'name' }, 'device-1')).resolves.toEqual(settings)
    expect(fetchMock.mock.calls.map(([path, init]) => [path, init?.method, init?.cache, init?.body]))
      .toEqual([
        ['/api/settings', undefined, 'no-store', undefined],
        [
          '/api/settings', 'PATCH', 'no-store',
          JSON.stringify({ deviceId: 'device-1', changes: { accent: { value: 'rose', baseRevision: 1 } } }),
        ],
        [
          '/api/settings/import', 'POST', 'no-store',
          JSON.stringify({ deviceId: 'device-1', values: { sessionSort: 'name' } }),
        ],
      ])
  })

  it('reports a refused change with its status so it is not retried', async () => {
    vi.stubGlobal('fetch', vi.fn(async () =>
      Response.json({ error: 'Setting accent is not a known accent' }, { status: 400 })))
    await expect(saveSettingsChanges({ accent: { value: 'x', baseRevision: 0 } }))
      .rejects.toMatchObject({ statusCode: 400, message: 'Setting accent is not a known accent' })
  })
})

describe('Hub sign-in', () => {
  // Cloudflare Access's answer to an app request after its session lapsed.
  const gatewayChallenge = () => new Response(null, {
    status: 401,
    headers: {
      'www-authenticate': 'Cloudflare-Access resource_metadata="https://hub.example/.well-known/cloudflare-access-protected-resource/api/computers"',
    },
  })
  // What `fetch` resolves with when a `redirect: 'manual'` request is redirected.
  const redirected = () =>
    ({ type: 'opaqueredirect', status: 0, ok: false, headers: new Headers() }) as Response

  afterEach(() => setHubSignInExpired(false))

  it.each([
    ['a JSON request', () => listComputers()],
    ['a bodyless request', () => removeComputer('computer')],
    ['a Knowledge-root request', () => getSessionKnowledgeRoot('computer', 'session')],
    ['a queued-prompt dispatch', () => dispatchQueuedPrompt('computer', 'session', 'queued', 'edit me')],
  ])('reports a gateway challenge to %s as an expired sign-in that delivered nothing', async (_name, call) => {
    const fetchMock = vi.fn(async (_path: string, _init?: RequestInit) => gatewayChallenge())
    vi.stubGlobal('fetch', fetchMock)

    const caught = await call().then(() => undefined, (error: unknown) => error)

    const init = fetchMock.mock.calls[0]?.[1]
    // Access answers an app request with a readable 401 instead of a
    // cross-origin login redirect that `fetch` can only report as a failure.
    expect(new Headers(init?.headers).get('x-requested-with')).toBe('XMLHttpRequest')
    expect(init?.redirect).toBe('manual')
    expect(caught).toBeInstanceOf(HubSignInExpiredError)
    expect(caught).toHaveProperty('uncertainDelivery', false)
    expect(hubSignInExpired()).toBe(true)
  })

  it('reports a redirected request as an expired sign-in', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => redirected()))

    await expect(sendMessage('computer', 'session', { content: 'hello' }))
      .rejects.toBeInstanceOf(HubSignInExpiredError)
    expect(hubSignInExpired()).toBe(true)
  })

  it('leaves the hub\'s own 401 an ordinary error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(
      { error: 'Oracle voice ticket is invalid or expired' },
      { status: 401 },
    )))

    await expect(listComputers()).rejects.toThrow('Oracle voice ticket is invalid or expired')
    expect(hubSignInExpired()).toBe(false)
  })

  it('clears an expired sign-in once the gateway lets a request through, even one the hub fails', async () => {
    setHubSignInExpired(true)
    vi.stubGlobal('fetch', vi.fn(async () => new Response('upstream unavailable', { status: 502 })))

    await expect(listComputers()).rejects.toMatchObject({ statusCode: 502 })
    expect(hubSignInExpired()).toBe(false)
  })

  it('ignores a late answer to a request sent before the latest refused one', async () => {
    let answerEarlier: (response: Response) => void = () => undefined
    vi.stubGlobal('fetch', vi.fn()
      .mockImplementationOnce(() => new Promise<Response>((resolve) => { answerEarlier = resolve }))
      .mockImplementationOnce(async () => gatewayChallenge())
      .mockImplementationOnce(async () => Response.json({ computers: [] })))

    const earlier = listComputers()
    await expect(listComputers()).rejects.toBeInstanceOf(HubSignInExpiredError)
    answerEarlier(Response.json({ computers: [] }))
    await earlier
    // Sent before the refusal, its answer says nothing about the sign-in since.
    expect(hubSignInExpired()).toBe(true)

    await listComputers()
    expect(hubSignInExpired()).toBe(false)
  })

  it('lets a request sent after a refused one clear it, whichever is answered first', async () => {
    let refuseEarlier: (response: Response) => void = () => undefined
    let answerLater: (response: Response) => void = () => undefined
    vi.stubGlobal('fetch', vi.fn()
      .mockImplementationOnce(() => new Promise<Response>((resolve) => { refuseEarlier = resolve }))
      .mockImplementationOnce(() => new Promise<Response>((resolve) => { answerLater = resolve })))

    const earlier = listComputers().catch((error: unknown) => error)
    const later = listComputers()
    refuseEarlier(gatewayChallenge())
    expect(await earlier).toBeInstanceOf(HubSignInExpiredError)
    answerLater(Response.json({ computers: [] }))
    await later
    // Sent after the refused one, its answer is the newer word on the sign-in.
    expect(hubSignInExpired()).toBe(false)
  })

  it('checks the sign-in without failing on the answer', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => gatewayChallenge()))
    await expect(checkHubSignIn()).resolves.toBeUndefined()
    expect(hubSignInExpired()).toBe(true)

    // An unreachable hub says nothing about the sign-in either way.
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch') }))
    await expect(checkHubSignIn()).resolves.toBeUndefined()
    expect(hubSignInExpired()).toBe(true)
  })
})
