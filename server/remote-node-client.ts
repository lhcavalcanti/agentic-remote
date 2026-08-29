import type { DirectoryScope } from './directory-browser.js'
import { EventEmitter } from 'node:events'
import WebSocket from 'ws'
import type {
  CreateSessionInput,
  ConfigureRuntimeInput,
  DirectoryListing,
  ExecuteCommandInput,
  NodeInfo,
  PermissionReplyInput,
  ProviderRuntimeOptions,
  RenameSessionInput,
  RemovedQueuedPrompt,
  RuntimeOptions,
  SendMessageInput,
  ServerEvent,
  SessionDetail,
  SessionFileUpload,
  SlashCommand,
  UserInputReplyInput,
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchResponse,
} from '../shared/contracts.js'
import type { RegisteredComputer } from './computer-registry.js'

interface RemoteNodeClientEvents {
  event: [event: ServerEvent]
  status: [online: boolean]
}

class RemoteNodeRequestError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message)
    this.name = 'RemoteNodeRequestError'
  }
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

  async getInfo(): Promise<NodeInfo> {
    const info = await this.request<NodeInfo>('/node-api/info')
    this._providers = info.providers
    return info
  }

  async listSessions(): Promise<SessionDetail[]> {
    const response = await this.request<{ sessions: SessionDetail[] }>(
      '/node-api/sessions',
    )
    return response.sessions
  }

  async listHistory(): Promise<SessionDetail[]> {
    const response = await this.request<{ sessions: SessionDetail[] }>(
      '/node-api/history',
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
  ): Promise<RemovedQueuedPrompt> {
    return this.request<RemovedQueuedPrompt>(
      `/node-api/sessions/${encodeURIComponent(sessionId)}/queue/${encodeURIComponent(promptId)}`,
      { method: 'DELETE' },
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
      30_000,
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
      this.setOnline(true)
      void this.getInfo().catch(() => undefined)
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
    timeoutMs = 15_000,
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
        headers,
        signal: AbortSignal.timeout(timeoutMs),
      })
    } catch (error) {
      this.setOnline(false)
      throw error
    }
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null
      throw new RemoteNodeRequestError(
        payload?.error || `${this.computer.name} request failed (${response.status})`,
        response.status,
      )
    }
    this.setOnline(true)
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
