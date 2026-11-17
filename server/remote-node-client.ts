import type { DirectoryScope } from './directory-browser.js'
import {
  cancellationAckSchema, launchReconciliationSchema, promptAcceptanceReceiptSchema, terminationAcknowledgementSchema,
  type LaunchReconciliation, type TerminationAcknowledgement,
} from '../shared/launch-identity.js'
import { EventEmitter } from 'node:events'
import { randomUUID } from 'node:crypto'
import WebSocket from 'ws'
import type {
  AgentProvider,
  AudioTranscription,
  CreateSessionInput,
  ConfigureRuntimeInput,
  BackgroundTaskSnapshot,
  DirectoryListing,
  ExecuteCommandInput,
  NodeInfo,
  PermissionReplyInput,
  ProviderRuntimeOptions,
  RenameSessionInput,
  RemovedQueuedPrompt,
  QueuedPromptDispatchResult,
  RuntimeOptions,
  SessionRecoveryReason,
  SendMessageInput,
  ServerEvent,
  SessionDetail,
  SessionFileUpload,
  SessionSkillsSnapshot,
  SessionMcpServersSnapshot,
  SideQuestionAnswer,
  SideQuestionInput,
  SlashCommand,
  UserInputReplyInput,
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchResponse,
  SideQuestionExchange,
} from '../shared/contracts.js'
import type { RegisteredComputer } from './computer-registry.js'
import {
  RemoteVoiceClient,
  type RemoteVoiceClientOptions,
} from './remote-voice-client.js'
import { AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER } from './node-routes.js'
import { parseSubmissionReceipt } from '../shared/submission-error.js'
import { TERMINAL_REQUEST_TIMEOUT_MS } from '../shared/terminal-timing.js'
import {
  RemoteNodeCapabilityError,
  RemoteNodeRedirectError,
  RemoteNodeRequestError,
  RemoteNodeTransportError,
} from './remote-node-errors.js'
import {
  safeResourceError,
  sanitizeSkillsSnapshot,
  sanitizeMcpSnapshot,
  SessionResourceError,
  ResourceReads,
} from './session-resources.js'
import type { SessionKnowledgeBaseLocation } from './session-directory.js'
import {
  HOST_TELEMETRY_CAPABILITY_VERSION, HostSnapshotSchema, HostHistorySchema, HostProcessesSchema,
} from '../shared/host-telemetry.js'
import { hostTelemetryError, type HostTelemetryTarget } from './host-telemetry/service.js'
import { subscribeRemoteHost, HOST_TELEMETRY_REMOTE_TIMEOUT_MS } from './host-telemetry/remote.js'

/**
 * Conversion, whisper, and probing each carry their own timeout on the owning
 * computer, so the caller waits slightly longer than their sum before giving up.
 */
const TRANSCRIPTION_TIMEOUT_MS = 13 * 60_000
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])

const DEFINITE_DISPATCH_REFUSALS = new Set([
  400, 401, 403, 404, 405, 409, 410, 413, 415, 422, 429,
])

function headerSafe(value: string): string {
  return value.replace(/[^\x20-\x7e]/g, '').slice(0, 200)
}

/**
 * Fetch's DOM typing accepts only ArrayBuffer-backed bytes. View the buffer's
 * memory directly, copying only the rare buffer over shared memory.
 */
function requestBytes(data: Buffer): Uint8Array<ArrayBuffer> {
  return data.buffer instanceof ArrayBuffer
    ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
    : new Uint8Array(data)
}

interface RemoteNodeClientEvents {
  event: [event: ServerEvent]
  status: [online: boolean]
}

export function normalizeNodeUrl(value: string): string {
  const url = new URL(value.trim())
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Computer URL must use http or https')
  }
  if (url.username || url.password || (url.pathname !== '/' && url.pathname !== '')) {
    throw new Error('Computer URL must contain only scheme, host, and port')
  }
  url.pathname = ''
  url.search = ''
  url.hash = ''
  return url.toString().replace(/\/$/, '')
}

export class RemoteNodeClient extends EventEmitter<RemoteNodeClientEvents> {
  readonly registrationId = randomUUID()
  private readonly resourceReads = new ResourceReads()
  private readonly resourceLifetime = new AbortController()
  private socket?: WebSocket
  private reconnectTimer?: NodeJS.Timeout
  private reconnectDelay = 1_000
  private stopped = false
  private readonly stoppingLaunches = new Set<string>()
  private _online = false
  private _providers: NodeInfo['providers']
  private _voice: NodeInfo['voice']

  constructor(readonly computer: RegisteredComputer) {
    super()
  }

  get online(): boolean {
    return this._online
  }

  get providers(): NonNullable<NodeInfo['providers']> {
    return (
      this._providers || [
        {
          id: 'copilot',
          name: 'GitHub Copilot',
          available: true,
          terminalBacked: true,
          supportsTmuxMigration: false,
          supportsSideQuestions: false,
        },
      ]
    )
  }

  get voice(): NodeInfo['voice'] {
    return this._voice
  }

  async getInfo(signal?: AbortSignal): Promise<NodeInfo> {
    const info = await this.request<NodeInfo>(
      '/node-api/info',
      { signal: signal ? AbortSignal.any([signal, this.resourceLifetime.signal]) : undefined },
      signal ? 0 : 15_000,
      false,
    )
    this._providers = info.providers
    this._voice = info.voice
    this.setOnline(true)
    return info
  }

  async hostTelemetryTarget(): Promise<HostTelemetryTarget> {
    const signal = this.resourceLifetime.signal
    let info: NodeInfo
    try {
      info = await this.getInfo(AbortSignal.any([signal, AbortSignal.timeout(HOST_TELEMETRY_REMOTE_TIMEOUT_MS)]))
    } catch (error) {
      if (error instanceof SyntaxError) throw hostTelemetryError('This computer returned invalid host telemetry', 502, 'HOST_TELEMETRY_INVALID')
      if (error instanceof RemoteNodeRequestError) throw error
      throw new RemoteNodeTransportError(this.computer.name, error)
    }
    if (info.hostTelemetry?.version !== HOST_TELEMETRY_CAPABILITY_VERSION) {
      throw hostTelemetryError(`Update this computer (${this.computer.name}) to use host monitoring.`, 409)
    }
    if (info.hostTelemetry.enabled !== true) {
      throw hostTelemetryError(`Host monitoring is turned off on this computer (${this.computer.name}).`, 409)
    }
    const read = async <T>(path: string, schema: { safeParse(value: unknown): { success: true; data: T } | { success: false } }): Promise<T> => {
      let payload: unknown
      try {
        payload = await this.request(path, { signal }, HOST_TELEMETRY_REMOTE_TIMEOUT_MS, false)
      } catch (error) {
        if (error instanceof SyntaxError) throw hostTelemetryError('This computer returned invalid host telemetry', 502, 'HOST_TELEMETRY_INVALID')
        if (error instanceof RemoteNodeRequestError) throw error
        throw new RemoteNodeTransportError(this.computer.name, error)
      }
      const parsed = schema.safeParse(payload)
      if (!parsed.success) throw hostTelemetryError('This computer returned invalid host telemetry', 502, 'HOST_TELEMETRY_INVALID')
      return parsed.data
    }
    return {
      snapshot: () => read('/node-api/host', HostSnapshotSchema),
      history: () => read('/node-api/host/history?range=24h', HostHistorySchema),
      processes: () => read('/node-api/host/processes', HostProcessesSchema),
      subscribe: (sample, ended) => subscribeRemoteHost(this.computer, signal, sample, ended),
    }
  }

  connectVoice(
    streamId: string,
    options: Omit<RemoteVoiceClientOptions, 'registrationSignal'> = {},
  ): Promise<RemoteVoiceClient> {
    return RemoteVoiceClient.connect(this.computer, streamId, {
      ...options,
      registrationSignal: this.resourceLifetime.signal,
    })
  }

  async listSessions(): Promise<SessionDetail[]> {
    const includeArchived = this.providers.some((provider) => provider.supportsSessionRetention === true)
    const response = await this.request<{ sessions: SessionDetail[] }>(
      `/node-api/sessions${includeArchived ? '?includeArchived=1' : ''}`,
    )
    return response.sessions
  }

  async listHistory(signal?: AbortSignal): Promise<SessionDetail[]> {
    const response = await this.request<{ sessions: SessionDetail[] }>(
      '/node-api/history',
      { signal: signal ? AbortSignal.any([signal, this.resourceLifetime.signal]) : undefined },
      signal ? 0 : 15_000,
    )
    return response.sessions
  }

  async listDirectories(
    path = '~',
    scope: DirectoryScope = 'home',
  ): Promise<DirectoryListing> {
    return this.request<DirectoryListing>(
      `/node-api/directories?path=${encodeURIComponent(path)}&scope=${encodeURIComponent(scope)}`,
    )
  }

  async validateSessionDirectory(inputPath: string): Promise<string> {
    const response = await this.request<{ path: string }>(
      '/node-api/directories/validate',
      {
        method: 'POST',
        body: JSON.stringify({ path: inputPath }),
      },
    )
    return response.path
  }

  async validateKnowledgeRoot(
    inputPath: string,
    confinementPath?: string,
  ): Promise<string> {
    const response = await this.request<{ path: string }>(
      '/node-api/knowledge/validate',
      {
        method: 'POST',
        body: JSON.stringify({
          path: inputPath,
          ...(confinementPath ? { confinement: confinementPath } : {}),
        }),
      },
    )
    return response.path
  }

  async ensureSessionKnowledgeBase(
    sessionId: string,
    relativePath: string,
    create: boolean,
  ): Promise<SessionKnowledgeBaseLocation> {
    try {
      const response = await this.request<SessionKnowledgeBaseLocation>(
        `/node-api/sessions/${encodeURIComponent(sessionId)}/knowledge-base`,
        {
          method: 'PUT',
          body: JSON.stringify({ path: relativePath, create }),
        },
      )
      if (!response.confinementPath) {
        throw new RemoteNodeCapabilityError(this.computer.name)
      }
      return response
    } catch (error) {
      if (
        error instanceof RemoteNodeRequestError &&
        error.statusCode >= 500
      ) {
        throw new RemoteNodeTransportError(this.computer.name, error)
      }
      if (typeof Reflect.get(error as object, 'statusCode') === 'number') {
        throw error
      }
      throw new RemoteNodeTransportError(this.computer.name, error)
    }
  }

  async listKnowledge(
    root: string,
    path = '.',
    confinementPath?: string,
  ): Promise<WorkspaceListing> {
    const confinement = confinementPath
      ? `&confinement=${encodeURIComponent(confinementPath)}`
      : ''
    const response = await this.request<
      WorkspaceListing & { confinementApplied?: boolean }
    >(
      `/node-api/knowledge/entries?root=${encodeURIComponent(root)}&path=${encodeURIComponent(path)}${confinement}`,
    )
    if (confinementPath && response.confinementApplied !== true) {
      throw new RemoteNodeCapabilityError(this.computer.name)
    }
    const { confinementApplied: _confinementApplied, ...listing } = response
    return listing
  }

  async readKnowledgeFile(
    root: string,
    path: string,
    confinementPath?: string,
  ): Promise<WorkspaceFile> {
    const confinement = confinementPath
      ? `&confinement=${encodeURIComponent(confinementPath)}`
      : ''
    const response = await this.request<
      WorkspaceFile & { confinementApplied?: boolean }
    >(
      `/node-api/knowledge/file?root=${encodeURIComponent(root)}&path=${encodeURIComponent(path)}${confinement}`,
    )
    if (confinementPath && response.confinementApplied !== true) {
      throw new RemoteNodeCapabilityError(this.computer.name)
    }
    const { confinementApplied: _confinementApplied, ...file } = response
    return file
  }

  async listWorkspace(
    sessionId: string,
    path = '.',
  ): Promise<WorkspaceListing> {
    return this.request<WorkspaceListing>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/workspace?path=${encodeURIComponent(path)}`,
    )
  }

  async readWorkspaceFile(
    sessionId: string,
    path: string,
  ): Promise<WorkspaceFile> {
    return this.request<WorkspaceFile>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/workspace/file?path=${encodeURIComponent(path)}`,
    )
  }

  async searchWorkspace(
    sessionId: string,
    query: string,
    path = '.',
  ): Promise<WorkspaceSearchResponse> {
    return this.request<WorkspaceSearchResponse>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/workspace/search?query=${encodeURIComponent(query)}&path=${encodeURIComponent(path)}`,
      {},
      30_000,
    )
  }

  /**
   * `passive` reads the session as recorded, without opening it. A node from
   * before passive reads ignores it and opens the session, as it always did.
   */
  async getSession(sessionId: string, options: { passive?: boolean } = {}): Promise<SessionDetail> {
    const response = await this.request<{ session: SessionDetail }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}${options.passive ? '?passive=1' : ''}`,
    )
    return response.session
  }

  async listCommands(sessionId: string): Promise<SlashCommand[]> {
    const response = await this.request<{ commands: SlashCommand[] }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/commands`,
    )
    return response.commands
  }

  private async readResource<T>(
    sessionId: string,
    endpoint: 'skills' | 'mcp',
    normalize: (raw: unknown) => T,
    signal: AbortSignal,
  ): Promise<T> {
    if (this.stopped) throw new SessionResourceError('stopped')
    try {
      const raw = await this.request<unknown>(
        `/node-api/sessions/${encodeURIComponent(sessionId)}/${endpoint}`,
        { cache: 'no-store', signal },
        0,
      )
      if (this.stopped) throw new SessionResourceError('stopped')
      return normalize(raw)
    } catch (error) {
      if (error instanceof RemoteNodeRedirectError) throw error
      if (error instanceof RemoteNodeRequestError) {
        throw new SessionResourceError(
          error.statusCode === 404 ? 'missing' :
            error.statusCode === 409 ? 'changed' :
              error.statusCode === 503 ? 'stopped' :
                error.statusCode === 504 ? 'timeout' :
                  error.statusCode === 499 ? 'cancelled' : 'failed',
        )
      }
      throw safeResourceError(error)
    }
  }

  listSkills(sessionId: string, provider: AgentProvider, signal?: AbortSignal): Promise<SessionSkillsSnapshot> {
    return this.resourceReads.run(signal, (request) =>
      this.readResource(sessionId, 'skills', (raw) =>
        sanitizeSkillsSnapshot(raw, sessionId, provider), request.signal))
  }

  listMcpServers(sessionId: string, provider: AgentProvider, signal?: AbortSignal): Promise<SessionMcpServersSnapshot> {
    return this.resourceReads.run(signal, (request) =>
      this.readResource(sessionId, 'mcp', (raw) =>
        sanitizeMcpSnapshot(raw, sessionId, provider), request.signal))
  }

  async createSession(input: CreateSessionInput): Promise<SessionDetail> {
    const response = await this.request<{ session: SessionDetail }>(
      '/node-api/sessions',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
    )
    if (input.launchId !== undefined && response?.session?.launchId !== input.launchId) {
      throw new RemoteNodeRequestError('The owning computer did not confirm launch identity. Reconcile before retrying.', 502, undefined, true)
    }
    return response.session
  }

  async providerRuntimeOptions(
    provider: 'copilot' | 'claude',
  ): Promise<ProviderRuntimeOptions> {
    return this.request<ProviderRuntimeOptions>(
      `/node-api/providers/${encodeURIComponent(provider)}/runtime`,
    )
  }

  async uploadFile(
    sessionId: string,
    filename: string,
    data: Buffer,
  ): Promise<SessionFileUpload> {
    const response = await this.request<{ file: SessionFileUpload }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/files`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/octet-stream',
          'x-agentic-filename': Buffer.from(filename).toString('base64url'),
        },
        body: requestBytes(data),
      },
      120_000,
    )
    return response.file
  }

  async transcribe(
    filename: string,
    mimeType: string,
    data: Buffer,
    signal?: AbortSignal,
  ): Promise<AudioTranscription> {
    return this.request<AudioTranscription>(
      '/node-api/transcriptions',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/octet-stream',
          [AUDIO_FILENAME_HEADER]: Buffer.from(filename).toString('base64url'),
          [AUDIO_TYPE_HEADER]: headerSafe(mimeType),
        },
        body: requestBytes(data),
        signal,
      },
      TRANSCRIPTION_TIMEOUT_MS,
    )
  }

  async activateSession(sessionId: string): Promise<SessionDetail> {
    const response = await this.request<{ session: SessionDetail }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/open`,
      {
        method: 'POST',
        body: '{}',
      },
    )
    return response.session
  }

  async renameSession(
    sessionId: string,
    input: RenameSessionInput,
  ): Promise<SessionDetail> {
    const response = await this.request<{ session: SessionDetail }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      },
    )
    return response.session
  }

  async configureRetention(
    sessionId: string,
    input: import('../shared/contracts.js').SessionRetentionPatch,
  ): Promise<SessionDetail> {
    const response = await this.request<{ session: SessionDetail }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/retention`,
      { method: 'PATCH', body: JSON.stringify(input) },
    )
    return response.session
  }

  async removeQueuedPrompt(
    sessionId: string,
    promptId: string,
    acknowledgesDispatch?: string,
  ): Promise<RemovedQueuedPrompt> {
    return this.request<RemovedQueuedPrompt>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/queue/${encodeURIComponent(promptId)}`,
      {
        method: 'DELETE',
        ...(acknowledgesDispatch ? { body: JSON.stringify({ acknowledgesDispatch }) } : {}),
      },
    )
  }

  async dispatchQueuedPrompt(
    sessionId: string,
    promptId: string,
    content: string,
  ): Promise<QueuedPromptDispatchResult> {
    try {
      const result = await this.request<QueuedPromptDispatchResult>(
        `/node-api/sessions/${encodeURIComponent(sessionId)}/queue/${encodeURIComponent(promptId)}/dispatch`,
        { method: 'POST', body: JSON.stringify({ content }) },
        30_000,
      )
      if (
        !result || result.promptId !== promptId ||
        !['sent', 'refused', 'uncertain'].includes(result.outcome) ||
        (result.session && result.session.id !== sessionId) ||
        (result.outcome === 'sent' && (
          typeof result.attemptId !== 'string' ||
          !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(result.attemptId)
        ))
      ) throw new Error('The owning computer returned an invalid dispatch receipt.')
      return result
    } catch (error) {
      if (error instanceof RemoteNodeRequestError && DEFINITE_DISPATCH_REFUSALS.has(error.statusCode)) {
        throw error
      }
      return {
        outcome: 'uncertain', promptId, delivery: 'unknown',
        message: 'The owning computer did not confirm dispatch. Check its queue and provider before retrying; no automatic retry was made.',
      }
    }
  }

  async updateQueuedPrompt(
    sessionId: string,
    promptId: string,
    content: string,
  ): Promise<RemovedQueuedPrompt> {
    return this.request<RemovedQueuedPrompt>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/queue/${encodeURIComponent(promptId)}`,
      { method: 'PATCH', body: JSON.stringify({ content }) },
    )
  }

  async reorderQueuedPrompts(
    sessionId: string,
    order: string[],
  ): Promise<SessionDetail> {
    return this.request<SessionDetail>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/queue`,
      { method: 'PUT', body: JSON.stringify({ order }) },
    )
  }

  async runtimeOptions(sessionId: string): Promise<RuntimeOptions> {
    return this.request<RuntimeOptions>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/runtime`,
    )
  }

  async configureRuntime(
    sessionId: string,
    input: ConfigureRuntimeInput,
  ): Promise<SessionDetail> {
    const response = await this.request<{ session: SessionDetail }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/runtime`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      },
    )
    return response.session
  }

  async clearConversation(sessionId: string): Promise<SessionDetail> {
    const response = await this.request<{ session: SessionDetail }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/clear`,
      {
        method: 'POST',
        body: '{}',
      },
    )
    return response.session
  }

  async recoverConversation(
    sessionId: string,
    reason: SessionRecoveryReason,
  ): Promise<SessionDetail> {
    const response = await this.request<{ session: SessionDetail }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/recover`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      },
    )
    return response.session
  }

  async suspendSession(sessionId: string): Promise<SessionDetail> {
    const response = await this.request<{ session: SessionDetail }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/suspend`,
      {
        method: 'POST',
        body: '{}',
      },
    )
    return response.session
  }

  async resumeSession(sessionId: string): Promise<SessionDetail> {
    const response = await this.request<{ session: SessionDetail }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/resume`,
      {
        method: 'POST',
        body: '{}',
      },
    )
    return response.session
  }

  async restartSession(sessionId: string): Promise<SessionDetail> {
    const response = await this.request<{ session: SessionDetail }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/restart`,
      {
        method: 'POST',
        body: '{}',
      },
    )
    return response.session
  }

  async moveToTerminal(sessionId: string): Promise<SessionDetail> {
    const response = await this.request<{ session: SessionDetail }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/tmux`,
      {
        method: 'POST',
        body: '{}',
      },
      TERMINAL_REQUEST_TIMEOUT_MS,
    )
    return response.session
  }

  async sendMessage(
    sessionId: string,
    input: SendMessageInput,
  ): Promise<SessionDetail> {
    const response = await this.request<{ session: SessionDetail }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
    )
    if (input.deliveryId !== undefined) {
      const receipt = response?.session?.promptReceipts?.find((entry) => entry.deliveryId === input.deliveryId)
      if (!promptAcceptanceReceiptSchema.safeParse(receipt).success || receipt?.sessionId !== sessionId) {
        throw new RemoteNodeRequestError('The owning computer did not confirm prompt acceptance. Reconcile before retrying.', 502, undefined, true)
      }
    }
    return response.session
  }

  async executeCommand(
    sessionId: string,
    input: ExecuteCommandInput,
  ): Promise<SessionDetail> {
    const response = await this.request<{ session: SessionDetail }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/commands`,
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
    )
    return response.session
  }

  async cancel(sessionId: string): Promise<void> {
    await this.request(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/cancel`,
      {
        method: 'POST',
        body: '{}',
      },
    )
  }

  async reconcileLaunch(launchId: string): Promise<LaunchReconciliation | undefined> {
    const response = await this.request<{ launch: LaunchReconciliation | null }>(
      `/node-api/launches/${encodeURIComponent(launchId)}`,
    )
    if (response?.launch === null) return undefined
    const parsed = launchReconciliationSchema.safeParse(response?.launch)
    if (!parsed.success) throw new RemoteNodeRequestError('The owning computer returned invalid launch evidence.', 502)
    const launch = parsed.data
    if (launch.launchId !== launchId || launch.receipts.some((receipt) => receipt.sessionId !== launch.sessionId) ||
        (launch.termination && launch.termination.sessionId !== launch.sessionId)) {
      throw new RemoteNodeRequestError('The owning computer returned a mismatched launch identity.', 502)
    }
    return launch
  }

  async cancelWithAck(sessionId: string, timeoutMs: number): Promise<TerminationAcknowledgement> {
    cancellationAckSchema.parse({ timeoutMs })
    this.stoppingLaunches.add(sessionId)
    try {
      const parsed = terminationAcknowledgementSchema.safeParse(await this.request<TerminationAcknowledgement>(
        `/node-api/sessions/${encodeURIComponent(sessionId)}/cancel-with-ack`,
        { method: 'POST', body: JSON.stringify({ timeoutMs }) },
        timeoutMs + 5_000,
      ))
      if (!parsed.success || parsed.data.sessionId !== sessionId) {
        throw new RemoteNodeRequestError('The owning computer returned invalid termination evidence.', 502)
      }
      return parsed.data
    } catch (error) {
      if (error instanceof RemoteNodeRequestError) throw error
      if (error instanceof SyntaxError) throw new RemoteNodeRequestError('The owning computer returned invalid termination evidence.', 502)
      if (!(error instanceof TypeError || (error instanceof Error && ['AbortError', 'TimeoutError'].includes(error.name)))) throw error
      return {
        sessionId, outcome: 'unknown', checkedAt: new Date().toISOString(), scope: 'provider-owned',
        reason: 'The owning computer did not confirm termination.',
      }
    }
  }

  async askSession(
    sessionId: string,
    question: string,
    earlier?: readonly SideQuestionExchange[],
  ): Promise<string> {
    const response = await this.request<SideQuestionAnswer>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/ask`,
      {
        method: 'POST',
        body: JSON.stringify({
          question,
          ...(earlier?.length ? { earlier: [...earlier] } : {}),
        } satisfies SideQuestionInput),
      },
    )
    return response.answer
  }

  async listBackgroundTasks(
    sessionId: string,
  ): Promise<BackgroundTaskSnapshot> {
    return this.request<BackgroundTaskSnapshot>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/tasks`,
    )
  }

  async cancelBackgroundTask(
    sessionId: string,
    taskId: string,
  ): Promise<BackgroundTaskSnapshot> {
    return this.request<BackgroundTaskSnapshot>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/tasks/${encodeURIComponent(taskId)}/cancel`,
      {
        method: 'POST',
        body: '{}',
      },
    )
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.request(
      `/node-api/sessions/${encodeURIComponent(sessionId)}`,
      { method: 'DELETE' },
    )
  }

  async closeSession(sessionId: string): Promise<SessionDetail> {
    const response = await this.request<{ session: SessionDetail }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/close`,
      { method: 'POST', body: '{}' },
    )
    return response.session
  }

  async listClosedSessions(): Promise<SessionDetail[]> {
    const response = await this.request<{ sessions: SessionDetail[] }>('/node-api/closed-sessions')
    return response.sessions
  }

  async replyPermission(
    sessionId: string,
    requestId: string,
    input: PermissionReplyInput,
  ): Promise<SessionDetail> {
    const response = await this.request<{ session: SessionDetail }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/permissions/${encodeURIComponent(requestId)}`,
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
    )
    return response.session
  }

  async replyUserInput(
    sessionId: string,
    requestId: string,
    input: UserInputReplyInput,
  ): Promise<SessionDetail> {
    const response = await this.request<{ session: SessionDetail }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/user-input/${encodeURIComponent(requestId)}`,
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
    )
    return response.session
  }

  connect(): void {
    if (this.socket || this.stopped) {
      return
    }
    const url = new URL(this.computer.baseUrl)
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    url.pathname = '/node-api/events'
    const socket = new WebSocket(url, {
      headers: {
        authorization: `Bearer ${this.computer.token}`,
      },
    })
    this.socket = socket
    socket.on('open', () => {
      this.reconnectDelay = 1_000
      void this.getInfo().catch(() => socket.close())
    })
    socket.on('message', (data) => {
      try {
        this.emit('event', JSON.parse(data.toString()) as ServerEvent)
      } catch {
        socket.close(1003, 'Invalid event payload')
      }
    })
    socket.on('error', () => {
      socket.close()
    })
    socket.on('close', () => {
      this.socket = undefined
      this.setOnline(false)
      if (!this.stopped) {
        const delay = this.reconnectDelay
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30_000)
        this.reconnectTimer = setTimeout(() => this.connect(), delay)
      }
    })
  }

  stop(): void {
    this.resourceReads.stop()
    this.resourceLifetime.abort(new SessionResourceError('stopped'))
    this.stopped = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }
    this.socket?.close()
    this.socket = undefined
    this.setOnline(false)
  }

  private async request<TResult = unknown>(
    path: string,
    init: RequestInit = {},
    timeoutMs = init.method && init.method !== 'GET' && path.startsWith('/node-api/sessions')
      ? TERMINAL_REQUEST_TIMEOUT_MS
      : 15_000,
    markOnline = true,
  ): Promise<TResult> {
    const session = /^\/node-api\/sessions\/([^/]+)(?:\/(.*))?$/.exec(path)
    if (session && init.method && init.method !== 'GET' && this.stoppingLaunches.has(decodeURIComponent(session[1]))) {
      // Stop intent remains authoritative even if the request/response was lost.
      // Only reads, metadata-only rename, and further teardown may cross it.
      const teardown = ['cancel', 'cancel-with-ack', 'close', 'suspend'].includes(session[2] || '')
      const metadataOrDelete = !session[2] && ['PATCH', 'DELETE'].includes(init.method)
      if (!teardown && !metadataOrDelete) {
        throw new RemoteNodeRequestError('The launch is stopping; no work may dispatch until cancellation is resolved.', 409, undefined, false)
      }
    }
    const headers = new Headers(init.headers)
    headers.set('authorization', `Bearer ${this.computer.token}`)
    if (init.body != null && !headers.has('content-type')) {
      headers.set('content-type', 'application/json')
    }
    let response: Response
    try {
      response = await fetch(`${this.computer.baseUrl}${path}`, {
        ...init,
        redirect: 'manual',
        headers,
        signal: timeoutMs === 0 ? init.signal : init.signal
          ? AbortSignal.any([init.signal, AbortSignal.timeout(timeoutMs)])
          : AbortSignal.timeout(timeoutMs),
      })
      if (REDIRECT_STATUSES.has(response.status)) {
        const refusal = new RemoteNodeRedirectError(this.computer.name, response.status)
        try {
          await response.body?.cancel()
        } catch (error) {
          // Keep the actionable refusal primary without hiding cleanup failure.
          throw Object.assign(refusal, { cause: error })
        }
        throw refusal
      }
    } catch (error) {
      // A poll that must not flap the online state, and a request the caller
      // abandoned, are both failures that say nothing about the node.
      if (markOnline && !init.signal?.aborted) {
        this.setOnline(false)
      }
      throw error
    }
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | {
            error?: string
            submission?: unknown
            terminalDraftConflict?: boolean
            uncertainDelivery?: boolean
          }
        | null
      throw new RemoteNodeRequestError(
        payload?.error || `${this.computer.name} request failed (${response.status})`,
        response.status,
        parseSubmissionReceipt(payload?.submission),
        payload?.uncertainDelivery,
        payload?.terminalDraftConflict,
      )
    }
    if (markOnline) {
      this.setOnline(true)
    }
    if (response.status === 204) {
      return undefined as TResult
    }
    return response.json() as Promise<TResult>
  }

  private setOnline(online: boolean): void {
    if (this._online === online) {
      return
    }
    this._online = online
    this.emit('status', online)
  }
}
