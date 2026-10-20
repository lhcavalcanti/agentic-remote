import {
  CopilotClient,
  RuntimeConnection,
  type CopilotClientOptions,
  type SessionConfig,
} from '@github/copilot-sdk'

export const COPILOT_SDK_SESSION_DISCOVERY = {
  enableConfigDiscovery: true,
  enableSkills: true,
  enableOnDemandInstructionDiscovery: true,
  enableFileHooks: true,
  enableHostGitOperations: true,
} as const satisfies Partial<SessionConfig>

export function copilotSdkClientOptions(
  environment: NodeJS.ProcessEnv = process.env,
): CopilotClientOptions {
  const executable = environment.COPILOT_SDK_BIN?.trim()
  return {
    ...(executable
      ? { connection: RuntimeConnection.forStdio({ path: executable }) }
      : {}),
    mode: 'copilot-cli',
    logLevel: 'error',
    useLoggedInUser: true,
  }
}

export function createCopilotSdkClient(
  environment: NodeJS.ProcessEnv = process.env,
): CopilotClient {
  return new CopilotClient(copilotSdkClientOptions(environment))
}
