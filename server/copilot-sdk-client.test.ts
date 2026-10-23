import { describe, expect, it, vi } from 'vitest'
import {
  COPILOT_SDK_SESSION_DISCOVERY,
  copilotSdkClientOptions,
  createCopilotSdkClient,
  readCopilotSdkRuntimeDiagnostic,
  retireMissingCopilotSdkSession,
} from './copilot-sdk-client.js'

describe('COPILOT_SDK_SESSION_DISCOVERY', () => {
  it('defines the normal-session CLI configuration discovery options', () => {
    expect(COPILOT_SDK_SESSION_DISCOVERY).toEqual({
      enableConfigDiscovery: true,
      enableSkills: true,
      enableOnDemandInstructionDiscovery: true,
      enableFileHooks: true,
      enableHostGitOperations: true,
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
    expect(client.pluginSkillDirectories).toEqual(expect.any(Function))
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
