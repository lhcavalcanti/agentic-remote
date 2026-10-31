import { CopilotSession, type SessionEvent } from '@github/copilot-sdk'
import { describe, expect, it, vi } from 'vitest'
import {
  COPILOT_SDK_SESSION_DISCOVERY,
  COPILOT_SDK_SESSION_INTERACTION,
  copilotSdkClientOptions,
  createCopilotSdkClient,
  readCopilotSdkRuntimeDiagnostic,
  retireMissingCopilotSdkSession,
} from './copilot-sdk-client.js'

describe('COPILOT_SDK_SESSION_DISCOVERY', () => {
  it('defines normal-session CLI configuration discovery', () => {
    expect(COPILOT_SDK_SESSION_DISCOVERY).toEqual({
      enableConfigDiscovery: true,
      enableSkills: true,
      enableOnDemandInstructionDiscovery: true,
      enableFileHooks: true,
      enableHostGitOperations: true,
    })
  })
})

describe('COPILOT_SDK_SESSION_INTERACTION', () => {
  it('selects structured questions for sessions with an elicitation handler', () => {
    expect(COPILOT_SDK_SESSION_INTERACTION).toEqual({
      askUserVariant: 'elicitation',
    })
  })
})

describe('copilotSdkClientOptions', () => {
  it('uses the SDK-bundled runtime by default', () => {
    const options = copilotSdkClientOptions({ COPILOT_BIN: '/interactive/copilot' })
    expect(options.connection).toBeUndefined()
    expect(options).toMatchObject({
      mode: 'copilot-cli',
      logLevel: 'error',
      useLoggedInUser: true,
    })
  })

  it('uses only the dedicated SDK executable override', () => {
    const options = copilotSdkClientOptions({
      COPILOT_BIN: '/interactive/copilot',
      COPILOT_SDK_BIN: '/sdk/copilot',
    })
    expect(options.connection).toBeDefined()
  })
})

describe('retireMissingCopilotSdkSession', () => {
  it('retires the local owner so SDK shutdown cannot detach it', async () => {
    const disconnect = vi.fn(async () => {})
    const cleanup = vi.fn()
    const session = {
      disconnect,
      _runOnDisconnected: cleanup,
    }
    const sessions = new Map([['missing-session', session]])

    await retireMissingCopilotSdkSession({ sessions }, 'missing-session')
    for (const remaining of sessions.values()) {
      await remaining.disconnect()
    }

    expect(sessions.has('missing-session')).toBe(false)
    expect(cleanup).toHaveBeenCalledOnce()
    expect(disconnect).not.toHaveBeenCalled()
  })

  it('rejects an unknown SDK local registry shape', async () => {
    await expect(
      retireMissingCopilotSdkSession({ sessions: {} }, 'missing-session'),
    ).rejects.toThrow('Copilot SDK local session registry is unavailable')
  })

  it('preserves the local owner when disconnection cleanup is unavailable', async () => {
    const session = {}
    const sessions = new Map([['missing-session', session]])

    await expect(
      retireMissingCopilotSdkSession({ sessions }, 'missing-session'),
    ).rejects.toThrow('Copilot SDK local session cleanup is unavailable')

    expect(sessions.get('missing-session')).toBe(session)
  })

  it('adds the missing-session retirement capability to concrete SDK clients', () => {
    const client = createCopilotSdkClient({})
    expect(client.retireMissingSession).toEqual(expect.any(Function))
    expect(client.retireMissingSession).toEqual(expect.any(Function))
  })
})

describe('readCopilotSdkRuntimeDiagnostic', () => {
  it('returns only the sanitized runtime diagnostic fields', async () => {
    const diagnostic = await readCopilotSdkRuntimeDiagnostic({
      getStatus: async () => ({
        version: '1.0.98',
        protocolVersion: 3,
      }),
      getAuthStatus: async () => ({
        isAuthenticated: true,
        authType: 'gh-cli',
        login: 'sensitive-login',
        host: 'https://sensitive.example',
        statusMessage: 'sensitive provider detail',
      }),
    })

    expect(diagnostic).toEqual({
      runtimeVersion: '1.0.98',
      protocolVersion: 3,
      authenticated: true,
      authType: 'gh-cli',
    })
  })

  it('returns undefined when optional diagnostic methods are absent', async () => {
    const getStatus = async (): Promise<never> => {
      throw new Error('Status must not be requested without auth status')
    }
    const getAuthStatus = async (): Promise<never> => {
      throw new Error('Auth status must not be requested without runtime status')
    }

    await expect(
      readCopilotSdkRuntimeDiagnostic({ getStatus }),
    ).resolves.toBeUndefined()
    await expect(
      readCopilotSdkRuntimeDiagnostic({ getAuthStatus }),
    ).resolves.toBeUndefined()
    await expect(
      readCopilotSdkRuntimeDiagnostic({}),
    ).resolves.toBeUndefined()
  })
})

describe('Copilot SDK completion', () => {
  it('settles an autopilot request without waiting for a later session-wide idle', async () => {
    let session!: CopilotSession
    const response = {
      id: 'assistant',
      type: 'assistant.message',
      timestamp: '2026-10-30T00:00:00.000Z',
      parentId: 'request',
      data: {
        messageId: 'assistant',
        originatingMessageId: 'request',
        content: 'Finished before return',
      },
    } as SessionEvent
    const idle = {
      id: 'completion',
      type: 'session.idle',
      timestamp: '2026-10-30T00:00:01.000Z',
      parentId: 'assistant',
      ephemeral: true,
      data: { mode: 'autopilot' },
    } as SessionEvent
    const dispatch = (event: SessionEvent) => {
      const handler = Reflect.get(session, '_dispatchEvent')
      Reflect.apply(handler, session, [event])
    }
    const connection = {
      sendRequest: vi.fn(async (method: string) => {
        if (method === 'session.sendAndWait') {
          queueMicrotask(() => dispatch(idle))
          return {
            response,
            aborted: false,
            completionEventId: idle.id,
          }
        }
        if (method === 'session.send') {
          queueMicrotask(() => {
            dispatch(response)
            dispatch(idle)
          })
          return { messageId: 'request' }
        }
        throw new Error(`Unexpected SDK request: ${method}`)
      }),
    }
    session = Reflect.construct(CopilotSession, [
      'session',
      connection,
      undefined,
      undefined,
      {},
    ]) as CopilotSession

    await expect(session.sendAndWait('Finish the task', 25)).resolves.toMatchObject({
      type: 'assistant.message',
      data: { content: 'Finished before return' },
    })
  })

  it('still rejects when request-scoped completion never arrives', async () => {
    const connection = {
      sendRequest: vi.fn(() => new Promise(() => {})),
    }
    const session = Reflect.construct(CopilotSession, [
      'session',
      connection,
      undefined,
      undefined,
      {},
    ]) as CopilotSession

    await expect(session.sendAndWait('Never finishes', 25)).rejects.toThrow(
      'Timeout after 25ms waiting for session.idle',
    )
  })
})
