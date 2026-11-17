import type { DirectoryScope } from './directory-browser.js'
import type { SkillSettingsService } from './skill-settings.js'
import type { SkillSettingsTarget } from './skill-settings-routes.js'
import { EventEmitter } from 'node:events'
import { randomUUID } from 'node:crypto'
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
  ManagedSessionSkillsSnapshot,
  ManagedSessionMcpServersSnapshot,
  ManagedRemovedQueuedPrompt,
  ManagedQueuedPromptDispatchResult,
  PermissionReplyInput,
  ProviderRuntimeOptions,
  RenameSessionInput,
  SendMessageInput,
  UserInputReplyInput,
  RuntimeOptions,
  SessionFileUpload,
  SessionRecoveryReason,
  ServerEvent,
  SessionDetail,
  SlashCommand,
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchResponse,
  SideQuestionExchange,
} from '../shared/contracts.js'
import type { SessionKnowledgeBaseLocation } from './session-directory.js'
import {
  ComputerRegistry,
  type RegisteredComputer,
} from './computer-registry.js'
import { NodeIdentityStore } from './node-identity.js'
import { normalizeNodeUrl, RemoteNodeClient } from './remote-node-client.js'
import { RemoteNodeRequestError } from './remote-node-errors.js'
import { launchIdentitySchema, cancellationAckSchema, type TerminationAcknowledgement } from '../shared/launch-identity.js'
import { updateComputerForLaunchIdentity, withSessionCreateBoundary } from './launch-identity.js'
import { updateComputerForScheduleWorktrees, type ScheduleWorktreeInput } from '../shared/schedule-worktrees.js'
import type { ScheduleWorktreeService } from './schedule-worktrees.js'
import type { SessionService } from './session-service.js'
import type { HostTelemetryService, HostTelemetryTarget } from './host-telemetry/service.js'
import {
  readSessionSkills,
  readSessionMcpServers,
  resourceMessages,
  safeResourceError,
  sameResourceOwner,
  sanitizeSkillsSnapshot,
  sanitizeMcpSnapshot,
  SessionResourceError,
  ResourceReads,
  type ResourceRead,
  unavailableSkills,
  unavailableMcp,
} from './session-resources.js'

interface ComputerManagerEvents {
  event: [event: HubEvent]
}

export interface SessionMetadataLookup {
  session?: ManagedSession
  relatedSessions: ManagedSession[]
  activeAuthoritative: boolean
  historyAuthoritative: boolean
}

interface RemoteSessionListing {
  sessions: ManagedSession[]
  previous: ManagedSession[]
  authoritative: boolean
  token: symbol
  /** Sessions read in full; every other entry is a transcript-less summary. */
  detailed?: Set<string>
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

function sessionAtLeastAsNew(
  incoming: ManagedSession,
  current: ManagedSession | undefined,
): boolean {
  return incoming.revision === undefined ||
    current?.revision === undefined ||
    incoming.revision >= current.revision
}

export class ComputerManager extends EventEmitter<ComputerManagerEvents> {
  private readonly clients = new Map<string, RemoteNodeClient>()
  private readonly sessionCache = new Map<string, ManagedSession[]>()
  private readonly sessionReads = new Map<string, RemoteSessionRead>()
  private readonly snapshotTokens = new Map<string, symbol>()
  private readonly remoteResyncs = new Map<string, RemoteResync>()
  private readonly metadataClients = new Map<string, RemoteNodeClient>()
  private resourcesStopped = false
  private resourceEpoch = 0
  private readonly resourceReads = new ResourceReads()
  private readonly localRegistrationId = randomUUID()

  constructor(
    private readonly localService: SessionService,
    private readonly identity: NodeIdentityStore,
    private readonly registry: ComputerRegistry,
    private readonly scheduleWorktrees?: ScheduleWorktreeService,
  ) {
    super()
  }

  async initialize(): Promise<void> {
    this.resourceReads.start()
    this.resourceEpoch += 1
    this.resourcesStopped = false
    await this.registry.initialize()
    this.localService.on('event', (event) => {
      this.emitNodeEvent(this.localComputer(), event)
    })
    for (const computer of this.registry.list()) {
      this.addClient(computer)
    }
  }

  stop(): void {
    this.resourceReads.stop()
    this.resourceEpoch += 1
    this.resourcesStopped = true
    const clients = [...this.clients.values()]
    this.clients.clear()
    this.sessionReads.clear()
    this.snapshotTokens.clear()
    this.remoteResyncs.clear()
    this.metadataClients.clear()
    for (const client of clients) {
      client.stop()
    }
  }

  listComputers(): ComputerSummary[] {
    return [
      this.localComputer(),
      ...this.registry.list().map((computer) => this.computerSummary(computer)),
    ]
  }

  async skillSettingsTarget(computerId: string, local: SkillSettingsService): Promise<SkillSettingsTarget> {
    this.requireComputer(computerId)
    return computerId === this.identity.info.id ? local : this.requireClient(computerId).skillSettingsTarget()
  }

  async hostTelemetryTarget(computerId: string, local: HostTelemetryService): Promise<HostTelemetryTarget> {
    this.requireComputer(computerId)
    return computerId === this.identity.info.id
      ? local
      : this.requireClient(computerId).hostTelemetryTarget()
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
      lifecycleGeneration: 'pending',
    }
    const probe = new RemoteNodeClient(provisional)
    const info = await probe.getInfo()
    if (info.id === this.identity.info.id) {
      throw new Error('This computer is already the local hub')
    }
    const previousPairing = this.registry.list().find(({ id }) => id === info.id)
    const computer: RegisteredComputer = {
      id: info.id,
      name: input.name?.trim() || info.name,
      baseUrl,
      token,
      lifecycleGeneration:
        previousPairing?.lifecycleGeneration ?? randomUUID(),
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
    this.metadataClients.delete(id)
    await this.registry.remove(id)
    this.emit('event', { type: 'computer.removed', computerId: id })
  }

  async listSessions(): Promise<ManagedSession[]> {
    return (await this.listSessionsWithAuthority()).sessions
  }

  /** Already-known open sessions only; never waits for a node or starts a read. */
  listCachedSessions(): ManagedSession[] {
    const local = this.localService.listSessions()
      .map((session) => managedSession(session, this.localComputer()))
    const remote = this.registry.list().flatMap((computer) => this.sessionCache.get(computer.id) ?? [])
    return [...local, ...remote].filter((session) => session.isOpen !== false)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
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
      sessions: [...local, ...remote.flat()].filter((session) => session.isOpen !== false).sort((left, right) =>
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

  /** Passive identity/lineage lookup; never hydrates or activates an agent. */
  async lookupSessionMetadata(
    computerId: string,
    sessionId: string,
  ): Promise<SessionMetadataLookup> {
    const computer = this.requireComputer(computerId)
    const registrationIsCurrent = this.captureComputerRegistration(computerId)
    const assertCurrent = () => {
      if (!registrationIsCurrent()) {
        throw Object.assign(new Error('Computer pairing changed while reading session metadata. Reload and retry.'), {
          statusCode: 409,
        })
      }
    }
    let active: ManagedSession[] = []
    let history: ManagedSession[] = []
    let activeAuthoritative = false
    let historyAuthoritative = false
    const local = computerId === this.identity.info.id
    const client = local ? undefined : this.requireClient(computerId)
    try {
      if (local) {
        active = this.localService.listSessions().map((session) => managedSession(session, computer))
        activeAuthoritative = true
      } else {
        const registered = this.registry.list().find((entry) => entry.id === computerId)!
        const listing = await this.readRemoteSessions(registered, client!)
        active = listing.authoritative || this.metadataClients.get(computerId) === client
          ? listing.sessions : []
        activeAuthoritative = listing.authoritative
        if (listing.authoritative) this.metadataClients.set(computerId, client!)
      }
    } catch {
      active = !local && this.metadataClients.get(computerId) === client
        ? this.sessionCache.get(computerId) ?? [] : []
    }
    assertCurrent()
    if (!active.some((session) => session.id === sessionId)) {
      try {
        history = (local ? this.localService.listHistory() : await client!.listHistory())
          .map((session) => managedSession(session, computer))
        historyAuthoritative = true
      } catch {
        // Failure to read history must not turn an empty active list into a
        // claim that a suspended/historical session has been deleted.
      }
    }
    assertCurrent()
    const related = new Map<string, ManagedSession>()
    for (const session of [...history, ...active]) {
      if (session.id === sessionId || session.replacedSessionIds?.includes(sessionId)) {
        related.set(session.id, session)
      }
    }
    return {
      session: active.find((session) => session.id === sessionId) ??
        history.find((session) => session.id === sessionId),
      relatedSessions: [...related.values()],
      activeAuthoritative,
      historyAuthoritative,
    }
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

  async validateKnowledgeRoot(
    computerId: string,
    inputPath: string,
    confinementPath?: string,
  ): Promise<string> {
    this.requireComputer(computerId)
    return computerId === this.identity.info.id
      ? this.localService.validateKnowledgeRoot(inputPath, confinementPath)
      : this.requireClient(computerId).validateKnowledgeRoot(
          inputPath,
          confinementPath,
        )
  }

  async ensureSessionKnowledgeBase(
    computerId: string,
    sessionId: string,
    relativePath: string,
    create: boolean,
  ): Promise<SessionKnowledgeBaseLocation> {
    this.requireComputer(computerId)
    return computerId === this.identity.info.id
      ? this.localService.ensureSessionKnowledgeBase(
        sessionId,
        relativePath,
        create,
      )
      : this.requireClient(computerId).ensureSessionKnowledgeBase(
        sessionId,
        relativePath,
        create,
      )
  }

  async listKnowledge(
    computerId: string,
    root: string,
    path?: string,
    confinementPath?: string,
  ): Promise<WorkspaceListing> {
    this.requireComputer(computerId)
    return computerId === this.identity.info.id
      ? this.localService.listKnowledge(root, path, confinementPath)
      : this.requireClient(computerId).listKnowledge(
        root,
        path,
        confinementPath,
      )
  }

  captureComputerRegistration(computerId: string): () => boolean {
    this.requireComputer(computerId)
    if (computerId === this.identity.info.id) {
      return () => true
    }
    const client = this.requireClient(computerId)
    return () => this.clients.get(computerId) === client
  }

  async readKnowledgeFile(
    computerId: string,
    root: string,
    path: string,
    confinementPath?: string,
  ): Promise<WorkspaceFile> {
    this.requireComputer(computerId)
    return computerId === this.identity.info.id
      ? this.localService.readKnowledgeFile(root, path, confinementPath)
      : this.requireClient(computerId).readKnowledgeFile(
        root,
        path,
        confinementPath,
      )
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

  /**
   * A session as it is recorded, without loading, resuming, or reconciling
   * it, so that reading it, as Oracle does, can never change it.
   */
  async readSession(computerId: string, sessionId: string): Promise<ManagedSession> {
    const computer = this.requireComputer(computerId)
    if (computerId !== this.identity.info.id) {
      return managedSession(
        await this.requireClient(computerId).getSession(sessionId, { passive: true }),
        computer,
      )
    }
    const session = this.localService.getSession(sessionId)
    if (!session) {
      throw Object.assign(new Error('Session not found'), { statusCode: 404 })
    }
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

  async listSkills(computerId: string, sessionId: string, signal?: AbortSignal): Promise<ManagedSessionSkillsSnapshot> {
    const snapshot = await this.resourceReads.run(signal, (request) => this.readResources(computerId, sessionId, request, {
      local: readSessionSkills,
      remote: (client, provider) => client.listSkills(sessionId, provider, request.signal),
      normalize: sanitizeSkillsSnapshot,
      unavailable: unavailableSkills,
    }))
    return { ...snapshot, computerId }
  }

  async listMcpServers(computerId: string, sessionId: string, signal?: AbortSignal): Promise<ManagedSessionMcpServersSnapshot> {
    const snapshot = await this.resourceReads.run(signal, (request) => this.readResources(computerId, sessionId, request, {
      local: readSessionMcpServers,
      remote: (client, provider) => client.listMcpServers(sessionId, provider, request.signal),
      normalize: sanitizeMcpSnapshot,
      unavailable: unavailableMcp,
    }))
    return { ...snapshot, computerId }
  }

  private async readResources<T>(
    computerId: string,
    sessionId: string,
    request: ResourceRead,
    readers: {
      local: (service: SessionService, sessionId: string, signal: AbortSignal) => Promise<T>
      remote: (client: RemoteNodeClient, provider: AgentProvider) => Promise<T>
      normalize: (raw: unknown, sessionId: string, provider: AgentProvider) => T
      unavailable: (sessionId: string, provider: AgentProvider, message: string) => T
    },
  ): Promise<T> {
    if (this.resourcesStopped) throw new SessionResourceError('stopped')
    if (!this.listComputers().some((computer) => computer.id === computerId)) {
      throw new SessionResourceError('computer')
    }
    const epoch = this.resourceEpoch
    const registrationIsCurrent = this.captureComputerRegistration(computerId)
    const assertRegistration = () => {
      if (this.resourcesStopped || this.resourceEpoch !== epoch) throw new SessionResourceError('stopped')
      if (!registrationIsCurrent()) {
        throw new SessionResourceError(
          this.listComputers().some((computer) => computer.id === computerId) ? 'pairing' : 'computer',
        )
      }
    }
    try {
      if (computerId === this.identity.info.id) {
        const session = this.localService.getSession(sessionId)
        if (!session) throw new SessionResourceError('missing')
        const result = await readers.local(this.localService, sessionId, request.signal)
        assertRegistration()
        return readers.normalize(result, sessionId, session.provider ?? 'copilot')
      }
      const client = this.requireClient(computerId)
      let owner: SessionDetail | undefined
      let lastEvent: SessionDetail | undefined
      const listener = (event: ServerEvent) => {
        if (event.type === 'session.removed' && event.sessionId === sessionId) request.cancel(new SessionResourceError('changed'))
        if (event.type === 'session.upserted' && event.session.id === sessionId) {
          lastEvent = event.session
          if (owner && !sameResourceOwner(owner, event.session)) request.cancel(new SessionResourceError('changed'))
        }
      }
      const assertCurrent = () => {
        assertRegistration()
        request.assertActive()
      }
      client.on('event', listener)
      try {
        const info = await client.getInfo(request.signal)
        assertCurrent()
        if (info.id !== computerId) throw new SessionResourceError('pairing')
        // The session detail route hydrates/opens an SDK session. History is a
        // pure identity read and also includes suspended and closed sessions.
        const history = await client.listHistory(request.signal)
        assertCurrent()
        if (!Array.isArray(history)) throw new SessionResourceError('invalid')
        owner = history.find((session) => session?.id === sessionId)
        if (!owner) throw new SessionResourceError('missing')
        if (lastEvent && !sameResourceOwner(owner, lastEvent)) throw new SessionResourceError('changed')
        const provider = owner.provider ?? 'copilot'
        if (provider !== 'copilot' && provider !== 'claude') throw new SessionResourceError('invalid')
        const supported = Array.isArray(info.providers) && info.providers.some((entry) =>
          entry.id === provider && entry.supportsSessionResources === true)
        const result = supported
          ? await readers.remote(client, provider)
          : readers.unavailable(sessionId, provider, resourceMessages.update)
        assertCurrent()
        const currentHistory = await client.listHistory(request.signal)
        assertCurrent()
        if (!Array.isArray(currentHistory)) throw new SessionResourceError('invalid')
        if (!sameResourceOwner(owner, currentHistory.find((session) => session?.id === sessionId))) {
          throw new SessionResourceError('changed')
        }
        return readers.normalize(result, sessionId, provider)
      } catch (error) {
        assertCurrent()
        throw error
      } finally {
        client.off('event', listener)
      }
    } catch (error) {
      assertRegistration()
      throw safeResourceError(error)
    }
  }

  async createSession(
    computerId: string,
    input: CreateSessionInput,
  ): Promise<ManagedSession> {
    return withSessionCreateBoundary(async (beginCreate) => {
      const computer = this.requireComputer(computerId)
      const provider = input.provider || 'copilot'
      const capability = computer.providers?.find(
        (candidate) => candidate.id === provider,
      )
      if (input.launchId !== undefined) {
        launchIdentitySchema.parse(input.launchId)
        if (!capability?.supportsLaunchIdentity) throw updateComputerForLaunchIdentity()
      }
      if (!capability?.available) {
        throw new Error(
          capability?.unavailableReason ||
            `${provider === 'claude' ? 'Claude Agent' : 'GitHub Copilot'} is not available on ${computer.name}`,
        )
      }
      const client = computerId === this.identity.info.id ? undefined : this.requireClient(computerId)
      beginCreate()
      const session = client
        ? await client.createSession(input)
        : await this.localService.createSession(
            input.cwd,
            input.terminalBacked,
            input.allowAllPermissions,
            input.provider,
            input.model,
            input.reasoningEffort,
            input.contextTier,
            input.mode,
            ...(input.launchId !== undefined ? [input.launchId] : []),
          )
      return managedSession(session, computer)
    })
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

  connectVoice(computerId: string, streamId: string, signal?: AbortSignal) {
    const computer = this.requireComputer(computerId)
    if (computer.isLocal) {
      throw new Error('The local voice backend does not use a remote connection')
    }
    return this.requireClient(computerId).connectVoice(streamId, { signal })
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

  async configureRetention(
    computerId: string,
    sessionId: string,
    input: import('../shared/contracts.js').SessionRetentionPatch,
  ): Promise<ManagedSession> {
    const computer = this.requireComputer(computerId)
    let session: SessionDetail
    if (computerId === this.identity.info.id) {
      if (!this.localService.configureRetention) {
        throw Object.assign(new Error('Session retention is not supported by this computer'), { statusCode: 409 })
      }
      session = await this.localService.configureRetention(sessionId, input)
    } else {
      session = await this.requireClient(computerId).configureRetention(sessionId, input)
    }
    return managedSession(session, computer)
  }

  async removeQueuedPrompt(
    computerId: string,
    sessionId: string,
    promptId: string,
    acknowledgesDispatch?: string,
  ): Promise<ManagedRemovedQueuedPrompt> {
    const computer = this.requireComputer(computerId)
    const result =
      computerId === this.identity.info.id
        ? await this.localService.removeQueuedPrompt(sessionId, promptId, acknowledgesDispatch)
        : await this.requireClient(computerId).removeQueuedPrompt(
            sessionId,
            promptId,
            acknowledgesDispatch,
          )
    return {
      session: managedSession(result.session, computer),
      prompt: result.prompt,
    }
  }

  async dispatchQueuedPrompt(
    computerId: string,
    sessionId: string,
    promptId: string,
    content: string,
  ): Promise<ManagedQueuedPromptDispatchResult> {
    const computer = this.requireComputer(computerId)
    const service = computerId === this.identity.info.id
      ? this.localService
      : this.requireClient(computerId)
    if (!service.dispatchQueuedPrompt || !computer.providers?.some((provider) =>
      provider.supportsQueuedPromptDispatch === true)) {
      throw Object.assign(new Error('Update the owning runtime to dispatch queued edits.'), { statusCode: 409 })
    }
    const result = await service.dispatchQueuedPrompt(sessionId, promptId, content)
    return {
      ...result,
      session: result.session ? managedSession(result.session, computer) : undefined,
    }
  }

  async updateQueuedPrompt(
    computerId: string,
    sessionId: string,
    promptId: string,
    content: string,
  ): Promise<ManagedRemovedQueuedPrompt> {
    const computer = this.requireComputer(computerId)
    const result =
      computerId === this.identity.info.id
        ? await this.localService.updateQueuedPrompt(sessionId, promptId, content)
        : await this.requireClient(computerId).updateQueuedPrompt(
            sessionId,
            promptId,
            content,
          )
    return {
      session: managedSession(result.session, computer),
      prompt: result.prompt,
    }
  }

  async reorderQueuedPrompts(
    computerId: string,
    sessionId: string,
    order: string[],
  ): Promise<ManagedSession> {
    const computer = this.requireComputer(computerId)
    const session =
      computerId === this.identity.info.id
        ? await this.localService.reorderQueuedPrompts(sessionId, order)
        : await this.requireClient(computerId).reorderQueuedPrompts(
            sessionId,
            order,
          )
    return managedSession(session, computer)
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

  async recoverConversation(
    computerId: string,
    sessionId: string,
    reason: SessionRecoveryReason,
  ): Promise<ManagedSession> {
    const computer = this.requireComputer(computerId)
    if (!computer.providers?.some((provider) =>
      provider.id === 'copilot' && provider.supportsContextRecovery === true)) {
      throw Object.assign(
        new Error(`${computer.name} does not support conversation recovery yet. Update it to the latest release.`),
        { statusCode: 409 },
      )
    }
    const session =
      computerId === this.identity.info.id
        ? await this.localService.recoverConversation(sessionId, reason)
        : await this.requireClient(computerId).recoverConversation(sessionId, reason)
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
    if (input.deliveryId !== undefined) {
      launchIdentitySchema.parse(input.deliveryId)
      if (!computer.providers?.some((provider) => provider.supportsLaunchIdentity)) throw updateComputerForLaunchIdentity()
      const owner = await this.readSession(computerId, sessionId)
      if (!computer.providers?.some((provider) => provider.id === (owner.provider || 'copilot') &&
          provider.supportsLaunchIdentity)) throw updateComputerForLaunchIdentity()
    }
    const session =
      computerId === this.identity.info.id
        ? await this.localService.sendMessage(
            sessionId,
            input.content,
            input.enqueue,
            input.acknowledgesFailure,
            input.replaceTerminalDraft,
            ...(input.deliveryId !== undefined ? [input.deliveryId] : []),
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
            input.replaceTerminalDraft,
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

  async reconcileLaunch(computerId: string, launchId: string) {
    launchIdentitySchema.parse(launchId)
    const computer = this.requireComputer(computerId)
    if (!computer.providers?.some((provider) => provider.supportsLaunchIdentity)) throw updateComputerForLaunchIdentity()
    if (computerId !== this.identity.info.id) return this.requireClient(computerId).reconcileLaunch(launchId)
    if (!this.localService.reconcileLaunch) throw updateComputerForLaunchIdentity()
    return this.localService.reconcileLaunch(launchId)
  }

  async allocateScheduleWorktree(computerId: string, input: ScheduleWorktreeInput) {
    this.requireComputer(computerId)
    if (computerId !== this.identity.info.id) return this.requireClient(computerId).allocateScheduleWorktree(input)
    if (!this.scheduleWorktrees) throw updateComputerForScheduleWorktrees()
    return this.scheduleWorktrees.allocate(input)
  }

  async readScheduleWorktree(computerId: string, launchId: string) {
    this.requireComputer(computerId)
    if (computerId !== this.identity.info.id) return this.requireClient(computerId).readScheduleWorktree(launchId)
    if (!this.scheduleWorktrees) throw updateComputerForScheduleWorktrees()
    return this.scheduleWorktrees.read(launchId)
  }

  async cleanupScheduleWorktree(computerId: string, launchId: string) {
    this.requireComputer(computerId)
    if (computerId !== this.identity.info.id) return this.requireClient(computerId).cleanupScheduleWorktree(launchId)
    if (!this.scheduleWorktrees) throw updateComputerForScheduleWorktrees()
    return this.scheduleWorktrees.cleanup(launchId)
  }

  async cancelWithAck(computerId: string, sessionId: string, timeoutMs = 10_000): Promise<TerminationAcknowledgement> {
    cancellationAckSchema.parse({ timeoutMs })
    const computer = this.requireComputer(computerId)
    if (!computer.providers?.some((provider) => provider.supportsLaunchIdentity)) throw updateComputerForLaunchIdentity()
    if (computerId !== this.identity.info.id) return this.requireClient(computerId).cancelWithAck(sessionId, timeoutMs)
    const owner = this.localService.getSession(sessionId)
    if (!owner) throw Object.assign(new Error('Session not found'), { statusCode: 404 })
    if (!computer.providers?.some((provider) => provider.id === (owner.provider || 'copilot') &&
        provider.supportsLaunchIdentity)) throw updateComputerForLaunchIdentity()
    if (!this.localService.cancelWithAck) throw updateComputerForLaunchIdentity()
    return this.localService.cancelWithAck(sessionId, timeoutMs)
  }

  async askSession(
    computerId: string,
    sessionId: string,
    question: string,
    earlier?: readonly SideQuestionExchange[],
  ): Promise<string> {
    if (computerId === this.identity.info.id) {
      if (!this.localService.askSession) {
        throw Object.assign(
          new Error('Side questions are not available on this computer.'),
          { statusCode: 501 },
        )
      }
      return this.localService.askSession(sessionId, question, earlier)
    }
    return this.requireClient(computerId).askSession(sessionId, question, earlier)
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

  /** Stops a session on its own computer but keeps it, for 14 days, to reopen. */
  async closeSession(computerId: string, sessionId: string): Promise<ManagedSession> {
    const computer = this.requireComputer(computerId)
    const local = computerId === this.identity.info.id
    if (
      (local && !this.localService.closeSession) ||
      !computer.providers?.some((provider) => provider.supportsRecoverableClose === true)
    ) {
      throw Object.assign(
        new Error(`${computer.name} cannot keep closed sessions to reopen yet. Update it, or delete the session permanently.`),
        { statusCode: 409 },
      )
    }
    const session = local
      ? await this.localService.closeSession!(sessionId)
      : await this.requireClient(computerId).closeSession(sessionId)
    return managedSession(session, computer)
  }

  /**
   * Closed sessions every reachable computer still keeps, newest closure
   * first. A computer that cannot keep them, or does not answer, adds none.
   */
  async listClosedSessions(): Promise<ManagedSession[]> {
    const localComputer = this.localComputer()
    const local = (this.localService.listClosedSessions?.() ?? [])
      .map((session) => managedSession(session, localComputer))
    const remote = await Promise.all(
      this.registry.list().map(async (computer) => {
        const client = this.clients.get(computer.id)
        if (!client?.providers.some((provider) => provider.supportsRecoverableClose === true)) return []
        try {
          return (await client.listClosedSessions()).map((session) => managedSession(session, computer))
        } catch {
          return []
        }
      }),
    )
    return [...local, ...remote.flat()].sort((left, right) =>
      (right.closedAt ?? '').localeCompare(left.closedAt ?? ''))
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
        const detailed = new Set<string>()
        const previous = this.sessionCache.get(computer.id) ?? []
        const supportsRetention = client.providers.some((provider) => provider.supportsSessionRetention === true)
        const unlisted = previous.filter((session) => !merged.has(session.id) && !read.changes.has(session.id))
        if (!supportsRetention) {
          for (const session of unlisted) {
            if (session.archivedAt) merged.set(session.id, session)
          }
        } else {
          // The listing already carries every open and archived record, so an
          // unlisted entry is only probed when it was last seen open or
          // archived; a closed, unarchived one is history, not roster, and is
          // dropped without a round trip so it cannot be re-fetched forever.
          await mapWithConcurrency(
            unlisted.filter((session) => session.isOpen !== false || session.archivedAt),
            REMOTE_RETENTION_PROBE_CONCURRENCY,
            async (session) => {
              try {
                const retained = await client.getSession(session.id, { passive: true })
                // Archived, or reopened after the roster was read: both are
                // still on the roster. Only a closed, unarchived record leaves.
                if (retained.archivedAt || retained.isOpen !== false) {
                  merged.set(session.id, managedSession(retained, computer))
                  detailed.add(session.id)
                }
              } catch (error) {
                // One unreadable record must not fail the whole roster or
                // stall deletion reconciliation for every other session.
                if (!(error instanceof RemoteNodeRequestError && error.statusCode === 404)) {
                  merged.set(session.id, session)
                }
              }
            },
          )
        }
        if (this.clients.get(computer.id) !== client || this.sessionReads.get(computer.id) !== read) {
          return { sessions: this.sessionCache.get(computer.id) ?? [], previous: [], authoritative: false, token }
        }
        // Reconcile in-flight events without erasing deletions. An explicitly
        // newer snapshot revision still wins over an earlier event.
        for (const [id, session] of read.changes) {
          if (session) {
            if (sessionAtLeastAsNew(session, merged.get(id))) {
              merged.set(id, session)
              detailed.add(id)
            }
          } else {
            merged.delete(id)
          }
        }
        const latest = [...merged.values()].filter((session) =>
          !supportsRetention || session.isOpen !== false || session.archivedAt)
        this.sessionCache.set(computer.id, latest)
        this.snapshotTokens.set(computer.id, token)
        return { sessions: latest, previous, authoritative: true, token, detailed }
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
        this.emit('event', listing.detailed?.has(session.id)
          ? { type: 'session.upserted', session }
          : { type: 'session.upserted', session, summary: true })
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
      // An archived or closed session has no running work to report, and a
      // large roster must not fan out one unbounded read per entry.
      await mapWithConcurrency(listing.sessions.filter((session) =>
        session.isOpen !== false && !session.archivedAt,
      ), REMOTE_RETENTION_PROBE_CONCURRENCY, async (session) => {
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
      })
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
        const cached = this.sessionCache.get(computer.id) ?? []
        if (!sessionAtLeastAsNew(session, cached.find((entry) => entry.id === session.id))) {
          return
        }
        this.sessionReads.get(computer.id)?.changes.set(session.id, session)
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
        ...(event.closed ? { closed: true } : {}),
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
      version: this.identity.info.version,
      lifecycleGeneration: this.identity.lifecycleGeneration,
      registrationId: this.localRegistrationId,
      providers: this.localService.providers(),
    }
  }

  private computerSummary(computer: RegisteredComputer): ComputerSummary {
    return {
      id: computer.id,
      name: computer.name,
      isLocal: false,
      online: this.clients.get(computer.id)?.online ?? false,
      version: this.clients.get(computer.id)?.version,
      baseUrl: computer.baseUrl,
      lifecycleGeneration: computer.lifecycleGeneration,
      registrationId: this.clients.get(computer.id)?.registrationId,
      providers: this.clients.get(computer.id)?.providers,
      voice: this.clients.get(computer.id)?.voice,
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

const REMOTE_RETENTION_PROBE_CONCURRENCY = 6

export async function mapWithConcurrency<T>(
  items: readonly T[],
  limit: number,
  run: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next]
      next += 1
      await run(item)
    }
  }))
}
