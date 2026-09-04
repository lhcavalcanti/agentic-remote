import type { DirectoryScope } from './directory-browser.js'
import { EventEmitter } from 'node:events'
import type {
  AddComputerInput,
  AgentProvider,
  AudioTranscription,
  BackgroundTaskSnapshot,
  ConfigureRuntimeInput,
  ComputerSummary,
  CreateSessionInput,
  DirectoryListing,
  ExecuteCommandInput,
  HubEvent,
  ManagedSession,
  ManagedRemovedQueuedPrompt,
  PermissionReplyInput,
  ProviderRuntimeOptions,
  RenameSessionInput,
  SendMessageInput,
  UserInputReplyInput,
  RuntimeOptions,
  SessionFileUpload,
  ServerEvent,
  SessionDetail,
  SlashCommand,
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchResponse,
} from '../shared/contracts.js'
import {
  ComputerRegistry,
  type RegisteredComputer,
} from './computer-registry.js'
import { NodeIdentityStore } from './node-identity.js'
import { normalizeNodeUrl, RemoteNodeClient } from './remote-node-client.js'
import type { SessionService } from './session-service.js'

interface ComputerManagerEvents {
  event: [event: HubEvent]
}

interface RemoteSessionListing {
  sessions: ManagedSession[]
  previous: ManagedSession[]
  authoritative: boolean
  token: symbol
}

interface RemoteSessionRead {
  client: RemoteNodeClient
  changes: Map<string, ManagedSession | undefined>
  promise: Promise<RemoteSessionListing>
}

interface RemoteResync {
  client: RemoteNodeClient
  taskEvents: Set<string>
}

function managedSession(
  session: SessionDetail,
  computer: Pick<ComputerSummary, 'id' | 'name'>,
): ManagedSession {
  return {
    ...session,
    computerId: computer.id,
    computerName: computer.name,
  }
}

export class ComputerManager extends EventEmitter<ComputerManagerEvents> {
  private readonly clients = new Map<string, RemoteNodeClient>()
  private readonly sessionCache = new Map<string, ManagedSession[]>()
  private readonly sessionReads = new Map<string, RemoteSessionRead>()
  private readonly snapshotTokens = new Map<string, symbol>()
  private readonly remoteResyncs = new Map<string, RemoteResync>()

  constructor(
    private readonly localService: SessionService,
    private readonly identity: NodeIdentityStore,
    private readonly registry: ComputerRegistry,
  ) {
    super()
  }

  async initialize(): Promise<void> {
    await this.registry.initialize()
    this.localService.on('event', (event) => {
      this.emitNodeEvent(this.localComputer(), event)
    })
    for (const computer of this.registry.list()) {
      this.addClient(computer)
    }
  }

  stop(): void {
    const clients = [...this.clients.values()]
    this.clients.clear()
    this.sessionReads.clear()
    this.snapshotTokens.clear()
    this.remoteResyncs.clear()
    for (const client of clients) {
      client.stop()
    }
  }

  listComputers(): ComputerSummary[] {
    return [
      this.localComputer(),
      ...this.registry.list().map((computer) => ({
        id: computer.id,
        name: computer.name,
        isLocal: false,
        online: this.clients.get(computer.id)?.online ?? false,
        baseUrl: computer.baseUrl,
        providers: this.clients.get(computer.id)?.providers,
      })),
    ]
  }

  async registerComputer(input: AddComputerInput): Promise<ComputerSummary> {
    const baseUrl = normalizeNodeUrl(input.baseUrl)
    const token = input.token.trim()
    if (!token) {
      throw new Error('Pairing token is required')
    }
    const provisional: RegisteredComputer = {
      id: 'pending',
      name: input.name?.trim() || 'Remote computer',
      baseUrl,
      token,
    }
    const probe = new RemoteNodeClient(provisional)
    const info = await probe.getInfo()
    if (info.id === this.identity.info.id) {
      throw new Error('This computer is already the local hub')
    }
    const computer: RegisteredComputer = {
      id: info.id,
      name: input.name?.trim() || info.name,
      baseUrl,
      token,
    }
    await this.registry.upsert(computer)
    const previous = this.clients.get(computer.id)
    this.clients.delete(computer.id)
    this.invalidateRemoteReads(computer.id)
    previous?.stop()
    this.addClient(computer)
    const summary = this.computerSummary(computer)
    this.emit('event', { type: 'computer.updated', computer: summary })
    return summary
  }

  async removeComputer(id: string): Promise<void> {
    if (id === this.identity.info.id) {
      throw new Error('The local hub cannot be removed')
    }
    const client = this.clients.get(id)
    this.clients.delete(id)
    this.invalidateRemoteReads(id)
    client?.stop()
    this.sessionCache.delete(id)
    await this.registry.remove(id)
    this.emit('event', { type: 'computer.removed', computerId: id })
  }

  async listSessions(): Promise<ManagedSession[]> {
    return (await this.listSessionsWithAuthority()).sessions
  }

  /**
   * Sessions, and which computers actually answered for their own.
   *
   * A node that does not reply is answered for out of this cache, and such an
   * answer has not looked at the node at all. A caller cannot tell the two
   * apart from the list alone, and reading a cached answer as the whole truth
   * makes a session that is merely unreported look deleted.
   */
  async listSessionsWithAuthority(): Promise<{
    sessions: ManagedSession[]
    answeredComputerIds: string[]
  }> {
    const localComputer = this.localComputer()
    const local = this.localService
      .listSessions()
      .map((session) => managedSession(session, localComputer))
    const answered = [localComputer.id]
    const remote = await Promise.all(
      this.registry.list().map(async (computer) => {
        const client = this.clients.get(computer.id)
        if (!client) {
          return this.sessionCache.get(computer.id) ?? []
        }
        try {
          const listing = await this.readRemoteSessions(computer, client)
          if (listing.authoritative) {
            answered.push(computer.id)
          }
          return listing.sessions
        } catch {
          return this.sessionCache.get(computer.id) ?? []
        }
      }),
    )
    return {
      sessions: [...local, ...remote.flat()].sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt),
      ),
      answeredComputerIds: answered,
    }
  }

  async listHistory(): Promise<ManagedSession[]> {
    const local = this.localService
      .listHistory()
      .map((session) => managedSession(session, this.localComputer()))
    const remote = await Promise.all(
      this.registry.list().map(async (computer) => {
        try {
          return (await this.requireClient(computer.id).listHistory()).map(
            (session) => managedSession(session, computer),
          )
        } catch {
          return []
        }
      }),
    )
    return [...local, ...remote.flat()].sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt),
    )
  }

  async listDirectories(
    computerId: string,
    path?: string,
    scope?: DirectoryScope,
  ): Promise<DirectoryListing> {
    return computerId === this.identity.info.id
      ? this.localService.listDirectories(path, scope)
      : this.requireClient(computerId).listDirectories(path, scope)
  }

  async validateSessionDirectory(
    computerId: string,
    inputPath: string,
  ): Promise<string> {
    this.requireComputer(computerId)
    return computerId === this.identity.info.id
      ? this.localService.validateSessionDirectory(inputPath)
      : this.requireClient(computerId).validateSessionDirectory(inputPath)
  }

  async listKnowledge(
    computerId: string,
    root: string,
    path?: string,
  ): Promise<WorkspaceListing> {
    this.requireComputer(computerId)
    return computerId === this.identity.info.id
      ? this.localService.listKnowledge(root, path)
      : this.requireClient(computerId).listKnowledge(root, path)
  }

  async readKnowledgeFile(
    computerId: string,
    root: string,
    path: string,
  ): Promise<WorkspaceFile> {
    this.requireComputer(computerId)
    return computerId === this.identity.info.id
      ? this.localService.readKnowledgeFile(root, path)
      : this.requireClient(computerId).readKnowledgeFile(root, path)
  }

  async listWorkspace(
    computerId: string,
    sessionId: string,
    path?: string,
  ): Promise<WorkspaceListing> {
    this.requireComputer(computerId)
    return computerId === this.identity.info.id
      ? this.localService.listWorkspace(sessionId, path)
      : this.requireClient(computerId).listWorkspace(sessionId, path)
  }

  async readWorkspaceFile(
    computerId: string,
    sessionId: string,
    path: string,
  ): Promise<WorkspaceFile> {
    this.requireComputer(computerId)
    return computerId === this.identity.info.id
      ? this.localService.readWorkspaceFile(sessionId, path)
      : this.requireClient(computerId).readWorkspaceFile(sessionId, path)
  }

  async searchWorkspace(
    computerId: string,
    sessionId: string,
    query: string,
    path?: string,
  ): Promise<WorkspaceSearchResponse> {
    this.requireComputer(computerId)
    return computerId === this.identity.info.id
      ? this.localService.searchWorkspace(sessionId, query, path)
      : this.requireClient(computerId).searchWorkspace(sessionId, query, path)
  }

  async getSession(computerId: string, sessionId: string): Promise<ManagedSession> {
    const computer = this.requireComputer(computerId)
    const session =
      computerId === this.identity.info.id
        ? await this.localService.openSession(sessionId)
        : await this.requireClient(computerId).getSession(sessionId)
    return managedSession(session, computer)
  }

  async listCommands(
    computerId: string,
    sessionId: string,
  ): Promise<SlashCommand[]> {
    return computerId === this.identity.info.id
      ? this.localService.listCommands(sessionId)
      : this.requireClient(computerId).listCommands(sessionId)
  }

  async createSession(
    computerId: string,
    input: CreateSessionInput,
  ): Promise<ManagedSession> {
    const computer = this.requireComputer(computerId)
    const provider = input.provider || 'copilot'
    const capability = computer.providers?.find(
      (candidate) => candidate.id === provider,
    )
    if (!capability?.available) {
      throw new Error(
        capability?.unavailableReason ||
          `${provider === 'claude' ? 'Claude Agent' : 'GitHub Copilot'} is not available on ${computer.name}`,
      )
    }
    const session =
      computerId === this.identity.info.id
        ? await this.localService.createSession(
            input.cwd,
            input.terminalBacked,
            input.allowAllPermissions,
            input.provider,
            input.model,
            input.reasoningEffort,
            input.contextTier,
          )
        : await this.requireClient(computerId).createSession(input)
    return managedSession(session, computer)
  }

  async providerRuntimeOptions(
    computerId: string,
    provider: AgentProvider,
  ): Promise<ProviderRuntimeOptions> {
    this.requireComputer(computerId)
    if (computerId === this.identity.info.id) {
      const before = this.requireComputer(computerId).providers
      const options = await this.localService.providerRuntimeOptions(provider)
      const after = this.requireComputer(computerId).providers
      // Discovery can succeed after a provider was recorded unavailable, and
      // the UI keeps it disabled until it hears otherwise.
      if (
        JSON.stringify(before ?? []) !== JSON.stringify(after ?? [])
      ) {
        this.emit('event', {
          type: 'computer.updated',
          computer: this.requireComputer(computerId),
        })
      }
      return options
    }
    const client = this.requireClient(computerId)
    const options = await client.providerRuntimeOptions(provider)
    const advertised = client.providers.some(
      (capability) => capability.id === provider && capability.available,
    )
    if (!advertised) {
      // The node answered for a provider its cached capabilities call
      // unavailable, so that cache was taken before the provider existed
      // there. Refreshing it now keeps the recovered provider from staying
      // hidden until the node happens to reconnect.
      await client.getInfo().catch(() => undefined)
      this.emit('event', {
        type: 'computer.updated',
        computer: this.requireComputer(computerId),
      })
    }
    return options
  }

  async uploadFile(
    computerId: string,
    sessionId: string,
    filename: string,
    data: Buffer,
  ): Promise<SessionFileUpload> {
    this.requireComputer(computerId)
    return computerId === this.identity.info.id
      ? this.localService.uploadFile(sessionId, filename, data)
      : this.requireClient(computerId).uploadFile(sessionId, filename, data)
  }

  findComputer(nameOrId: string): ComputerSummary | undefined {
    const wanted = nameOrId.trim().toLowerCase()
    return this.listComputers().find(
      (computer) =>
        computer.id.toLowerCase() === wanted ||
        computer.name.toLowerCase() === wanted,
    )
  }

  async transcribeAudio(
    computerId: string,
    filename: string,
    mimeType: string,
    data: Buffer,
    signal?: AbortSignal,
  ): Promise<AudioTranscription> {
    this.requireComputer(computerId)
    return this.requireClient(computerId).transcribe(
      filename,
      mimeType,
      data,
      signal,
    )
  }

  async activateSession(
    computerId: string,
    sessionId: string,
  ): Promise<ManagedSession> {
    const computer = this.requireComputer(computerId)
    const session =
      computerId === this.identity.info.id
        ? await this.localService.activateSession(sessionId)
        : await this.requireClient(computerId).activateSession(sessionId)
    return managedSession(session, computer)
  }

  async renameSession(
    computerId: string,
    sessionId: string,
    input: RenameSessionInput,
  ): Promise<ManagedSession> {
    const computer = this.requireComputer(computerId)
    const session =
      computerId === this.identity.info.id
        ? await this.localService.renameSession(sessionId, input.title)
        : await this.requireClient(computerId).renameSession(sessionId, input)
    return managedSession(session, computer)
  }

  async removeQueuedPrompt(
    computerId: string,
    sessionId: string,
    promptId: string,
  ): Promise<ManagedRemovedQueuedPrompt> {
    const computer = this.requireComputer(computerId)
    const result =
      computerId === this.identity.info.id
        ? await this.localService.removeQueuedPrompt(sessionId, promptId)
        : await this.requireClient(computerId).removeQueuedPrompt(
            sessionId,
            promptId,
          )
    return {
      session: managedSession(result.session, computer),
      prompt: result.prompt,
    }
  }

  async runtimeOptions(
    computerId: string,
    sessionId: string,
  ): Promise<RuntimeOptions> {
    return computerId === this.identity.info.id
      ? this.localService.runtimeOptions(sessionId)
      : this.requireClient(computerId).runtimeOptions(sessionId)
  }

  async configureRuntime(
    computerId: string,
    sessionId: string,
    input: ConfigureRuntimeInput,
  ): Promise<ManagedSession> {
    const computer = this.requireComputer(computerId)
    const session =
      computerId === this.identity.info.id
        ? await this.localService.configureRuntime(sessionId, input)
        : await this.requireClient(computerId).configureRuntime(sessionId, input)
    return managedSession(session, computer)
  }

  async clearConversation(
    computerId: string,
    sessionId: string,
  ): Promise<ManagedSession> {
    const computer = this.requireComputer(computerId)
    const session =
      computerId === this.identity.info.id
        ? await this.localService.clearConversation(sessionId)
        : await this.requireClient(computerId).clearConversation(sessionId)
    return managedSession(session, computer)
  }

  async suspendSession(
    computerId: string,
    sessionId: string,
  ): Promise<ManagedSession> {
    const computer = this.requireComputer(computerId)
    const session =
      computerId === this.identity.info.id
        ? await this.localService.suspendSession(sessionId)
        : await this.requireClient(computerId).suspendSession(sessionId)
    return managedSession(session, computer)
  }

  async resumeSession(
    computerId: string,
    sessionId: string,
  ): Promise<ManagedSession> {
    const computer = this.requireComputer(computerId)
    const session =
      computerId === this.identity.info.id
        ? await this.localService.resumeSession(sessionId)
        : await this.requireClient(computerId).resumeSession(sessionId)
    return managedSession(session, computer)
  }

  async restartSession(
    computerId: string,
    sessionId: string,
  ): Promise<ManagedSession> {
    const computer = this.requireComputer(computerId)
    const session =
      computerId === this.identity.info.id
        ? await this.localService.restartSession(sessionId)
        : await this.requireClient(computerId).restartSession(sessionId)
    return managedSession(session, computer)
  }

  async moveToTerminal(
    computerId: string,
    sessionId: string,
  ): Promise<ManagedSession> {
    const computer = this.requireComputer(computerId)
    const session =
      computerId === this.identity.info.id
        ? await this.localService.moveToTerminal(sessionId)
        : await this.requireClient(computerId).moveToTerminal(sessionId)
    return managedSession(session, computer)
  }

  async sendMessage(
    computerId: string,
    sessionId: string,
    input: SendMessageInput,
  ): Promise<ManagedSession> {
    const computer = this.requireComputer(computerId)
    const session =
      computerId === this.identity.info.id
        ? await this.localService.sendMessage(
            sessionId,
            input.content,
            input.enqueue,
            input.acknowledgesFailure,
          )
        : await this.requireClient(computerId).sendMessage(sessionId, input)
    return managedSession(session, computer)
  }

  async executeCommand(
    computerId: string,
    sessionId: string,
    input: ExecuteCommandInput,
  ): Promise<ManagedSession> {
    const computer = this.requireComputer(computerId)
    const session =
      computerId === this.identity.info.id
        ? await this.localService.executeCommand(
            sessionId,
            input.command,
            input.enqueue,
            input.acknowledgesFailure,
          )
        : await this.requireClient(computerId).executeCommand(sessionId, input)
    return managedSession(session, computer)
  }

  async cancel(computerId: string, sessionId: string): Promise<void> {
    if (computerId === this.identity.info.id) {
      await this.localService.cancel(sessionId)
      return
    }
    await this.requireClient(computerId).cancel(sessionId)
  }

  async listBackgroundTasks(
    computerId: string,
    sessionId: string,
  ): Promise<BackgroundTaskSnapshot> {
    this.requireComputer(computerId)
    this.remoteResyncs.get(computerId)?.taskEvents.add(sessionId)
    return computerId === this.identity.info.id
      ? this.localService.listBackgroundTasks(sessionId)
      : this.requireClient(computerId).listBackgroundTasks(sessionId)
  }

  async cancelBackgroundTask(
    computerId: string,
    sessionId: string,
    taskId: string,
  ): Promise<BackgroundTaskSnapshot> {
    this.requireComputer(computerId)
    this.remoteResyncs.get(computerId)?.taskEvents.add(sessionId)
    return computerId === this.identity.info.id
      ? this.localService.cancelBackgroundTask(sessionId, taskId)
      : this.requireClient(computerId).cancelBackgroundTask(sessionId, taskId)
  }

  async deleteSession(computerId: string, sessionId: string): Promise<void> {
    if (computerId === this.identity.info.id) {
      await this.localService.deleteSession(sessionId)
      return
    }
    await this.requireClient(computerId).deleteSession(sessionId)
  }

  async replyPermission(
    computerId: string,
    sessionId: string,
    requestId: string,
    input: PermissionReplyInput,
  ): Promise<ManagedSession> {
    const computer = this.requireComputer(computerId)
    const session =
      computerId === this.identity.info.id
        ? await this.localService.replyPermission(
            sessionId,
            requestId,
            input.optionId,
          )
        : await this.requireClient(computerId).replyPermission(
            sessionId,
            requestId,
            input,
          )
    return managedSession(session, computer)
  }

  async replyUserInput(
    computerId: string,
    sessionId: string,
    requestId: string,
    input: UserInputReplyInput,
  ): Promise<ManagedSession> {
    const computer = this.requireComputer(computerId)
    const session =
      computerId === this.identity.info.id
        ? await this.localService.replyUserInput(sessionId, requestId, input)
        : await this.requireClient(computerId).replyUserInput(
            sessionId,
            requestId,
            input,
          )
    return managedSession(session, computer)
  }

  private addClient(computer: RegisteredComputer): RemoteNodeClient {
    const client = new RemoteNodeClient(computer)
    this.clients.set(computer.id, client)
    const reportError = (error: unknown) => {
      if (this.clients.get(computer.id) === client) {
        this.emit('event', {
          type: 'error',
          computerId: computer.id,
          message: error instanceof Error ? error.message : String(error),
        })
      }
    }
    client.on('event', (event) => {
      if (this.clients.get(computer.id) === client) {
        this.emitNodeEvent(computer, event)
      }
    })
    client.on('status', (online) => {
      if (this.clients.get(computer.id) !== client) {
        return
      }
      if (!online) {
        this.invalidateRemoteReads(computer.id)
      }
      this.emit('event', {
        type: 'computer.updated',
        computer: this.computerSummary(computer),
      })
      if (online) {
        void this.resyncRemoteComputer(computer, client).catch(reportError)
      }
    })
    client.connect()
    void client.getInfo().then(() => {
      if (this.clients.get(computer.id) !== client) {
        return
      }
      this.emit('event', {
        type: 'computer.updated',
        computer: this.computerSummary(computer),
      })
      return this.resyncRemoteComputer(computer, client).catch(reportError)
    }).catch(() => undefined)
    return client
  }

  private invalidateRemoteReads(computerId: string): void {
    this.sessionReads.delete(computerId)
    this.snapshotTokens.delete(computerId)
    this.remoteResyncs.delete(computerId)
  }

  private readRemoteSessions(
    computer: RegisteredComputer,
    client: RemoteNodeClient,
  ): Promise<RemoteSessionListing> {
    const pending = this.sessionReads.get(computer.id)
    if (pending?.client === client) {
      return pending.promise
    }
    const token = Symbol()
    const read: RemoteSessionRead = {
      client,
      changes: new Map(),
      promise: Promise.resolve().then(async () => {
        const sessions = await client.listSessions()
        if (
          this.clients.get(computer.id) !== client ||
          this.sessionReads.get(computer.id) !== read
        ) {
          return {
            sessions: this.sessionCache.get(computer.id) ?? [],
            previous: [],
            authoritative: false,
            token,
          }
        }
        const merged = new Map(
          sessions.map((session) => [session.id, managedSession(session, computer)]),
        )
        // WebSocket events observed after this read began are newer than its
        // snapshot, including removals that must not be resurrected.
        for (const [id, session] of read.changes) {
          if (session) {
            merged.set(id, session)
          } else {
            merged.delete(id)
          }
        }
        const previous = this.sessionCache.get(computer.id) ?? []
        const latest = [...merged.values()]
        this.sessionCache.set(computer.id, latest)
        this.snapshotTokens.set(computer.id, token)
        return { sessions: latest, previous, authoritative: true, token }
      }).finally(() => {
        if (this.sessionReads.get(computer.id) === read) {
          this.sessionReads.delete(computer.id)
        }
      }),
    }
    this.sessionReads.set(computer.id, read)
    return read.promise
  }

  private async resyncRemoteComputer(
    computer: RegisteredComputer,
    client: RemoteNodeClient,
  ): Promise<void> {
    const resync: RemoteResync = { client, taskEvents: new Set() }
    this.remoteResyncs.set(computer.id, resync)
    try {
      const listing = await this.readRemoteSessions(computer, client)
      const current = () =>
        this.clients.get(computer.id) === client &&
        this.remoteResyncs.get(computer.id) === resync &&
        this.snapshotTokens.get(computer.id) === listing.token
      if (!listing.authoritative || !current()) {
        return
      }
      for (const session of listing.sessions) {
        this.emit('event', { type: 'session.upserted', session })
      }
      const live = new Set(listing.sessions.map((session) => session.id))
      for (const session of listing.previous) {
        if (!live.has(session.id)) {
          this.emit('event', {
            type: 'session.removed',
            computerId: computer.id,
            sessionId: session.id,
          })
        }
      }
      if (!client.providers.some((provider) => provider.supportsBackgroundTasks === true)) {
        for (const session of listing.sessions) {
          this.emit('event', {
            type: 'session.tasks.updated',
            computerId: computer.id,
            sessionId: session.id,
            tasks: [],
            runningCount: 0,
            supported: false,
          })
        }
        return
      }
      await Promise.all(listing.sessions.map(async (session) => {
        const snapshot = await client.listBackgroundTasks(session.id)
        if (
          !current() || resync.taskEvents.has(session.id) ||
          !this.sessionCache.get(computer.id)?.some((entry) => entry.id === session.id)
        ) {
          return
        }
        this.emit('event', {
          type: 'session.tasks.updated',
          computerId: computer.id,
          sessionId: session.id,
          ...snapshot,
        })
      }))
    } finally {
      if (this.remoteResyncs.get(computer.id) === resync) {
        this.remoteResyncs.delete(computer.id)
      }
    }
  }

  private emitNodeEvent(
    computer: Pick<ComputerSummary, 'id' | 'name'>,
    event: ServerEvent,
  ): void {
    if (event.type === 'session.upserted') {
      const session = managedSession(event.session, computer)
      if (computer.id !== this.identity.info.id) {
        this.sessionReads.get(computer.id)?.changes.set(session.id, session)
        const cached = this.sessionCache.get(computer.id) ?? []
        this.sessionCache.set(computer.id, [
          session,
          ...cached.filter((entry) => entry.id !== session.id),
        ])
      }
      this.emit('event', {
        type: 'session.upserted',
        session,
      })
      return
    }
    if (event.type === 'session.removed') {
      if (computer.id !== this.identity.info.id) {
        this.sessionReads.get(computer.id)?.changes.set(event.sessionId, undefined)
        this.remoteResyncs.get(computer.id)?.taskEvents.add(event.sessionId)
        this.sessionCache.set(
          computer.id,
          (this.sessionCache.get(computer.id) ?? []).filter(
            (session) => session.id !== event.sessionId,
          ),
        )
      }
      this.emit('event', {
        type: 'session.removed',
        computerId: computer.id,
        sessionId: event.sessionId,
        replacedBy: event.replacedBy,
      })
      return
    }
    if (event.type === 'session.tasks.updated') {
      this.remoteResyncs.get(computer.id)?.taskEvents.add(event.sessionId)
      this.emit('event', {
        ...event,
        computerId: computer.id,
      })
      return
    }
    this.emit('event', {
      ...event,
      computerId: computer.id,
    })
  }

  private localComputer(): ComputerSummary {
    return {
      id: this.identity.info.id,
      name: this.identity.info.name,
      isLocal: true,
      online: true,
      providers: this.localService.providers(),
    }
  }

  private computerSummary(computer: RegisteredComputer): ComputerSummary {
    return {
      id: computer.id,
      name: computer.name,
      isLocal: false,
      online: this.clients.get(computer.id)?.online ?? false,
      baseUrl: computer.baseUrl,
      providers: this.clients.get(computer.id)?.providers,
    }
  }

  private requireComputer(id: string): ComputerSummary {
    const computer = this.listComputers().find((entry) => entry.id === id)
    if (!computer) {
      throw new Error('Computer not found')
    }
    return computer
  }

  private requireClient(id: string): RemoteNodeClient {
    const client = this.clients.get(id)
    if (!client) {
      throw new Error('Remote computer is not registered')
    }
    return client
  }
}
