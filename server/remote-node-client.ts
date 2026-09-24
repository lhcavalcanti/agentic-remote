import type { DirectoryScope } from './directory-browser.js'
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
  SubmitTerminalDraftInput,
  ServerEvent,
  SessionDetail,
  SessionFileUpload,
  SessionSkillsSnapshot,
  SessionMcpServersSnapshot,
  SlashCommand,
  UserInputReplyInput,
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchResponse,
} from '../shared/contracts.js'
import type { RegisteredComputer } from './computer-registry.js'
import { AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER } from './node-routes.js'
import {
  parseSubmissionReceipt,
  parseTerminalDraftRecovery,
} from '../shared/submission-error.js'
import { TERMINAL_REQUEST_TIMEOUT_MS } from '../shared/terminal-timing.js'
import { RemoteNodeRedirectError, RemoteNodeRequestError } from './remote-node-errors.js'
import {
  safeResourceError,
  sanitizeSkillsSnapshot,
  sanitizeMcpSnapshot,
  SessionResourceError,
  ResourceReads,
} from './session-resources.js'

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
  private _online = false
  private _providers: NodeInfo['providers']

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
        },
      ]
    )
  }

  async getInfo(signal?: AbortSignal): Promise<NodeInfo> {
    const info = await this.request<NodeInfo>(
      '/node-api/info',
      { signal: signal ? AbortSignal.any([signal, this.resourceLifetime.signal]) : undefined },
      signal ? 0 : 15_000,
      false,
    )
    this._providers = info.providers
    this.setOnline(true)
    return info
  }

  async listSessions(): Promise<SessionDetail[]> {
    const response = await this.request<{ sessions: SessionDetail[] }>(
      '/node-api/sessions',
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

  async listKnowledge(root: string, path = '.'): Promise<WorkspaceListing> {
    return this.request<WorkspaceListing>(
      `/node-api/knowledge/entries?root=${encodeURIComponent(root)}&path=${encodeURIComponent(path)}`,
    )
  }

  async readKnowledgeFile(
    root: string,
    path: string,
  ): Promise<WorkspaceFile> {
    return this.request<WorkspaceFile>(
      `/node-api/knowledge/file?root=${encodeURIComponent(root)}&path=${encodeURIComponent(path)}`,
    )
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

  async getSession(sessionId: string): Promise<SessionDetail> {
    const response = await this.request<{ session: SessionDetail }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}`,
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
        body: data,
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
        body: data,
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
    return response.session
  }

  async submitTerminalDraft(
    sessionId: string,
    input: SubmitTerminalDraftInput,
  ): Promise<SessionDetail> {
    const response = await this.request<{ session: SessionDetail }>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/terminal-draft`,
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
    )
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
            terminalDraftRecovery?: unknown
            uncertainDelivery?: boolean
          }
        | null
      throw new RemoteNodeRequestError(
        payload?.error || `${this.computer.name} request failed (${response.status})`,
        response.status,
        parseSubmissionReceipt(payload?.submission),
        payload?.uncertainDelivery,
        payload?.terminalDraftConflict,
        parseTerminalDraftRecovery(payload?.terminalDraftRecovery),
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
