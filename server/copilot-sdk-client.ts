import {
  CopilotClient,
  RuntimeConnection,
  type CopilotClientOptions,
} from '@github/copilot-sdk'

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
