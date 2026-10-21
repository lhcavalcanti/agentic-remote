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

export interface CopilotSdkMissingSessionRetirement {
  retireMissingSession(sessionId: string): Promise<void>
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

export async function retireMissingCopilotSdkSession(
  client: unknown,
  sessionId: string,
): Promise<void> {
  if ((typeof client !== 'object' && typeof client !== 'function') || client === null) {
    throw new Error('Copilot SDK local session registry is unavailable')
  }
  const sessions = Reflect.get(client, 'sessions')
  if (!(sessions instanceof Map)) {
    throw new Error('Copilot SDK local session registry is unavailable')
  }
  if (!sessions.has(sessionId)) return
  const session = sessions.get(sessionId)
  if ((typeof session !== 'object' && typeof session !== 'function') || session === null) {
    throw new Error('Copilot SDK local session cleanup is unavailable')
  }
  const cleanup = Reflect.get(session, '_runOnDisconnected')
  if (typeof cleanup !== 'function') {
    throw new Error('Copilot SDK local session cleanup is unavailable')
  }

  sessions.delete(sessionId)
  try {
    await Reflect.apply(cleanup, session, [])
  } catch (cause) {
    sessions.set(sessionId, session)
    throw new Error('Copilot SDK local session cleanup failed', { cause })
  }
}

export function createCopilotSdkClient(
  environment: NodeJS.ProcessEnv = process.env,
): CopilotClient & CopilotSdkMissingSessionRetirement {
  const client = new CopilotClient(copilotSdkClientOptions(environment))
  Object.defineProperty(client, 'retireMissingSession', {
    value: (sessionId: string) =>
      retireMissingCopilotSdkSession(client, sessionId),
  })
  return client as CopilotClient & CopilotSdkMissingSessionRetirement
}
