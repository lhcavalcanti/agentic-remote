import type {
  AgentMode,
  AgentProvider,
  ManagedSession,
  PendingPermission,
  RuntimeReasoningEffort,
  UserInputReplyInput,
} from '../shared/contracts.js'
import { deliveryUncertaintyFromError } from '../shared/submission-error.js'
import type { ComputerManager } from './computer-manager.js'
import type { PromptAcceptanceReceipt } from '../shared/launch-identity.js'
import { updateComputerForLaunchIdentity, withSessionCreateBoundary } from './launch-identity.js'

export type SessionLauncherHost = Pick<
  ComputerManager,
  'createSession' | 'renameSession' | 'readSession' | 'sendMessage'
  | 'replyPermission' | 'replyUserInput' | 'cancel'
> & Partial<Pick<ComputerManager, 'reconcileLaunch' | 'cancelWithAck'>>

export type SessionPermissionPolicy = 'ask' | 'allow-all'
export type SessionFolderTrustPolicy = 'ask' | 'auto-approve'
type SessionReference = Pick<ManagedSession, 'computerId' | 'id'>

export interface SessionLaunchInput<Provenance extends object> {
  computerId: string
  launchId?: string
  provider: AgentProvider
  backend: 'sdk' | 'terminal'
  folder: string
  model?: string
  reasoningEffort?: RuntimeReasoningEffort
  contextTier?: 'default' | 'long_context'
  mode?: AgentMode
  title?: string
  permissionPolicy: SessionPermissionPolicy
  folderTrust: SessionFolderTrustPolicy
  provenance: Provenance
}

export interface SessionPromptTarget {
  session: ManagedSession
  folderTrust: SessionFolderTrustPolicy
}

export interface SessionLaunch extends SessionPromptTarget {
  /** The creation response, before best-effort naming. */
  created: ManagedSession
}

export interface SessionPromptDelivery {
  outcome: 'sent' | 'steered' | 'queued'
  delivered: ManagedSession
  receipt?: PromptAcceptanceReceipt
}

interface SessionLauncherOptions<Provenance extends object> {
  /** The caller owns provenance storage and its ownership/journal semantics. */
  recordProvenance(session: ManagedSession, provenance: Provenance): Promise<void>
  onFolderTrusted?(session: ManagedSession, folder: string): void
  pollMs?: number
  trustWaitMs?: number
}

/** Creation succeeded; a provenance failure must never be treated as a creation refusal. */
export class SessionLaunchPreparationError extends Error {
  constructor(readonly created: ManagedSession, cause: unknown) {
    super(cause instanceof Error ? cause.message : String(cause), { cause })
  }
}

const FOLDER_TRUST_PREFIX = 'Trust folder for this session:'
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * The folder a genuine Copilot folder-trust prompt names, joined back where
 * the terminal wrapped it. Anything else that merely starts with the same
 * words, such as a command's permission, is not one.
 */
function trustedFolderOf(permission: PendingPermission): string | undefined {
  if (permission.stale || permission.kind !== 'terminal' || permission.choiceCount !== 3) return undefined
  if (!permission.title.startsWith(FOLDER_TRUST_PREFIX)) return undefined
  const [allow, stop, ...rest] = permission.options
  if (rest.length || allow?.optionId !== 'terminal:allow' || allow.name !== 'Trust for this session'
    || stop?.optionId !== 'terminal:stop') return undefined
  return permission.title.slice(FOLDER_TRUST_PREFIX.length).split('\n').map((part) => part.trim()).join('')
}

function sameFolder(left: string, right: string): boolean {
  return left.replace(/\/+$/, '') === right.replace(/\/+$/, '')
}

function requireFolderTrust(policy: SessionFolderTrustPolicy): void {
  if (policy !== 'ask' && policy !== 'auto-approve') {
    throw new Error('folderTrust must be ask or auto-approve')
  }
}

/** Session operations through the owning computer, without choosing the caller's policy. */
export class SessionLauncher<Provenance extends object> {
  private readonly pollMs: number
  private readonly trustWaitMs: number

  constructor(
    private readonly host: SessionLauncherHost,
    private readonly options: SessionLauncherOptions<Provenance>,
  ) {
    this.pollMs = options.pollMs ?? 250
    this.trustWaitMs = options.trustWaitMs ?? 10_000
  }

  async createSession(input: SessionLaunchInput<Provenance>): Promise<SessionLaunch> {
    return withSessionCreateBoundary(async (beginCreate) => {
      if (input.permissionPolicy !== 'ask' && input.permissionPolicy !== 'allow-all') {
        throw new Error('permissionPolicy must be ask or allow-all')
      }
      requireFolderTrust(input.folderTrust)
      if (!input.provenance) throw new Error('provenance is required')
      beginCreate()
      const created = await this.host.createSession(input.computerId, {
        cwd: input.folder,
        ...(input.launchId !== undefined ? { launchId: input.launchId } : {}),
        provider: input.provider,
        terminalBacked: input.backend === 'terminal',
        allowAllPermissions: input.permissionPolicy === 'allow-all',
        ...(input.mode ? { mode: input.mode } : {}),
        ...(input.model ? { model: input.model } : {}),
        ...(input.reasoningEffort ? { reasoningEffort: input.reasoningEffort } : {}),
        ...(input.contextTier ? { contextTier: input.contextTier } : {}),
      })
      let session = created
      if (input.title !== undefined) {
        try {
          session = await this.host.renameSession(input.computerId, created.id, { title: input.title })
        } catch {
          session = { ...created, title: created.title }
        }
        session = { ...session, title: session.title || input.title }
      }
      try {
        await this.options.recordProvenance(session, input.provenance)
      } catch (error) {
        throw new SessionLaunchPreparationError(created, error)
      }
      return { created, session, folderTrust: input.folderTrust }
    })
  }

  observeSession(session: SessionReference): Promise<ManagedSession> {
    return this.host.readSession(session.computerId, session.id)
  }

  async deliverPrompt(
    target: SessionPromptTarget,
    content: string,
    options: { steer?: boolean; deliveryId?: string } = {},
  ): Promise<SessionPromptDelivery> {
    requireFolderTrust(target.folderTrust)
    const { session } = target
    if (options.deliveryId !== undefined) {
      if (options.steer) throw new Error('Identified root prompts use durable queue acceptance, not steering.')
      await this.trustFolder(target)
      const delivered = await this.host.sendMessage(session.computerId, session.id, {
        content, enqueue: true, deliveryId: options.deliveryId,
      })
      const receipt = delivered.promptReceipts?.find((entry) => entry.deliveryId === options.deliveryId)
      if (!receipt) throw new Error('The owning computer did not return a prompt acceptance receipt. Reconcile before retrying.')
      if (receipt.state === 'rejected') {
        throw Object.assign(new Error('The owning computer rejected this prompt; it was not delivered.'), {
          statusCode: 409, uncertainDelivery: false, receipt,
        })
      }
      return { outcome: receipt.state === 'queued' ? 'queued' : 'sent', delivered, receipt }
    }
    if (options.steer) {
      try {
        const delivered = await this.host.sendMessage(session.computerId, session.id, { content, enqueue: false })
        return { outcome: 'steered', delivered }
      } catch (error) {
        // A possibly-delivered steer must never be sent a second time.
        if (deliveryUncertaintyFromError(error) !== false) throw error
        const delivered = await this.host.sendMessage(session.computerId, session.id, { content, enqueue: true })
        return { outcome: 'queued', delivered }
      }
    }
    await this.trustFolder(target)
    let delivered: ManagedSession
    try {
      delivered = await this.host.sendMessage(session.computerId, session.id, { content, enqueue: true })
    } catch (error) {
      if (!(await this.trustFolder(target, this.trustWaitMs))) throw error
      delivered = await this.host.sendMessage(session.computerId, session.id, { content, enqueue: true })
    }
    return { outcome: session.status === 'running' ? 'queued' : 'sent', delivered }
  }

  answerPermission(session: SessionReference, requestId: string, optionId: string): Promise<ManagedSession> {
    return this.host.replyPermission(session.computerId, session.id, requestId, { optionId })
  }

  answerUserInput(session: SessionReference, requestId: string, input: UserInputReplyInput): Promise<ManagedSession> {
    return this.host.replyUserInput(session.computerId, session.id, requestId, input)
  }

  /** Signals cancellation; it does not acknowledge termination of queued or background work. */
  cancel(session: SessionReference): Promise<void> {
    return this.host.cancel(session.computerId, session.id)
  }

  reconcileLaunch(computerId: string, launchId: string) {
    if (!this.host.reconcileLaunch) throw updateComputerForLaunchIdentity()
    return this.host.reconcileLaunch(computerId, launchId)
  }

  cancelWithAck(session: SessionReference, timeoutMs?: number) {
    if (!this.host.cancelWithAck) throw updateComputerForLaunchIdentity()
    return this.host.cancelWithAck(session.computerId, session.id, timeoutMs)
  }

  /**
   * Without waitMs, look once. Explicit delivery or recovery may apply the
   * caller's trust policy; passive observation never approves anything.
   */
  async trustFolder(target: SessionPromptTarget, waitMs = 0): Promise<boolean> {
    if (target.folderTrust === 'ask') return false
    const { session } = target
    const deadline = Date.now() + waitMs
    for (;;) {
      const detail = await this.observeSession(session).catch(() => undefined)
      const permission = detail?.pendingPermission
      const folder = permission && trustedFolderOf(permission)
      // Only the session's own folder; all other permissions need an explicit answer.
      if (permission && folder && sameFolder(folder, detail.cwd || session.cwd)) {
        await this.answerPermission(session, permission.requestId, 'terminal:allow')
        this.options.onFolderTrusted?.(session, folder)
        const settled = Date.now() + this.trustWaitMs
        while (Date.now() < settled) {
          const next = await this.observeSession(session).catch(() => undefined)
          if (next?.pendingPermission?.requestId !== permission.requestId) break
          await delay(this.pollMs)
        }
        return true
      }
      if (Date.now() >= deadline) return false
      await delay(this.pollMs)
    }
  }
}
