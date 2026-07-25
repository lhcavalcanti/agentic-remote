import { EventEmitter } from 'node:events'
import type {
  AddComputerInput,
  ConfigureRuntimeInput,
  ComputerSummary,
  CreateSessionInput,
  DirectoryListing,
  ExecuteCommandInput,
  HubEvent,
  ManagedSession,
  ManagedRemovedQueuedPrompt,
  PermissionReplyInput,
  RenameSessionInput,
  SendMessageInput,
  RuntimeOptions,
  ServerEvent,
  SessionDetail,
  SlashCommand,
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
    for (const client of this.clients.values()) {
      client.stop()
    }
    this.clients.clear()
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
    this.clients.get(computer.id)?.stop()
    this.addClient(computer)
    const summary = this.computerSummary(computer)
    this.emit('event', { type: 'computer.updated', computer: summary })
    return summary
  }

  async removeComputer(id: string): Promise<void> {
    if (id === this.identity.info.id) {
      throw new Error('The local hub cannot be removed')
    }
    this.clients.get(id)?.stop()
    this.clients.delete(id)
    this.sessionCache.delete(id)
    await this.registry.remove(id)
    this.emit('event', { type: 'computer.removed', computerId: id })
  }

  async listSessions(): Promise<ManagedSession[]> {
    const local = this.localService
      .listSessions()
      .map((session) => managedSession(session, this.localComputer()))
    const remote = await Promise.all(
      this.registry.list().map(async (computer) => {
        const client = this.clients.get(computer.id)
        if (!client) {
          return this.sessionCache.get(computer.id) ?? []
        }
        try {
          const sessions = (await client.listSessions()).map((session) =>
            managedSession(session, computer),
          )
          this.sessionCache.set(computer.id, sessions)
          return sessions
        } catch {
          return this.sessionCache.get(computer.id) ?? []
        }
      }),
    )
    return [...local, ...remote.flat()].sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt),
    )
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
  ): Promise<DirectoryListing> {
    return computerId === this.identity.info.id
      ? this.localService.listDirectories(path)
      : this.requireClient(computerId).listDirectories(path)
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
    const session =
      computerId === this.identity.info.id
        ? await this.localService.createSession(
            input.cwd,
            input.terminalBacked,
          )
        : await this.requireClient(computerId).createSession(input)
    return managedSession(session, computer)
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

  private addClient(computer: RegisteredComputer): RemoteNodeClient {
    const client = new RemoteNodeClient(computer)
    this.clients.set(computer.id, client)
    client.on('event', (event) => this.emitNodeEvent(computer, event))
    client.on('status', () => {
      this.emit('event', {
        type: 'computer.updated',
        computer: this.computerSummary(computer),
      })
    })
    client.connect()
    return client
  }

  private emitNodeEvent(
    computer: Pick<ComputerSummary, 'id' | 'name'>,
    event: ServerEvent,
  ): void {
    if (event.type === 'session.upserted') {
      const session = managedSession(event.session, computer)
      if (computer.id !== this.identity.info.id) {
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
    }
  }

  private computerSummary(computer: RegisteredComputer): ComputerSummary {
    return {
      id: computer.id,
      name: computer.name,
      isLocal: false,
      online: this.clients.get(computer.id)?.online ?? false,
      baseUrl: computer.baseUrl,
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
