import { describe, expect, it } from 'vitest'
import {
  COPILOT_SDK_SESSION_DISCOVERY,
  copilotSdkClientOptions,
  readCopilotSdkRuntimeDiagnostic,
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
