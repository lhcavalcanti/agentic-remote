import {
  CopilotClient,
  RuntimeConnection,
  type CopilotClientOptions,
  type GetAuthStatusResponse,
  type GetStatusResponse,
  type SessionConfig,
} from '@github/copilot-sdk'

export interface CopilotSdkRuntimeDiagnostic {
  runtimeVersion: string
  protocolVersion: number
  authenticated: boolean
  authType: GetAuthStatusResponse['authType']
}

interface CopilotSdkRuntimeDiagnosticClient {
  getStatus?: () => Promise<GetStatusResponse>
  getAuthStatus?: () => Promise<GetAuthStatusResponse>
}

export const COPILOT_SDK_SESSION_DISCOVERY = {
  enableConfigDiscovery: true,
  enableSkills: true,
  enableOnDemandInstructionDiscovery: true,
  enableFileHooks: true,
  enableHostGitOperations: true,
} as const satisfies Partial<SessionConfig>

export async function readCopilotSdkRuntimeDiagnostic(
  client: CopilotSdkRuntimeDiagnosticClient,
): Promise<CopilotSdkRuntimeDiagnostic | undefined> {
  if (!client.getStatus || !client.getAuthStatus) return undefined
  const [status, auth] = await Promise.all([
    client.getStatus(),
    client.getAuthStatus(),
  ])
  return {
    runtimeVersion: status.version,
    protocolVersion: status.protocolVersion,
    authenticated: auth.isAuthenticated,
    authType: auth.authType,
  }
}

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
