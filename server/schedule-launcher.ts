import type { HubEvent, ManagedSession } from '../shared/contracts.js'
import { chmod, lstat } from 'node:fs/promises'
import type { LaunchReconciliation, PromptAcceptanceReceipt } from '../shared/launch-identity.js'
import type { Schedule, ScheduleRun } from '../shared/schedules.js'
import { deliveryUncertaintyFromError } from '../shared/submission-error.js'
import type { ComputerManager } from './computer-manager.js'
import { registryKey, type ManagerStore } from './manager-store.js'
import {
  ScheduleLaunchRefusedError, ScheduleTargetUnavailableError,
  type ScheduleLauncher, type ScheduleReconciliation, type ScheduleStopAcknowledgement,
} from './scheduler-dispatcher.js'
import { isInFlight, type SchedulerStore } from './scheduler-store.js'
import { SessionLauncher, type SessionLauncherHost } from './session-launcher.js'
import { RemoteNodeTransportError } from './remote-node-errors.js'

export interface ScheduleProvenance {
  origin: 'schedule'
  scheduleId: string
  scheduleRunId: string
  task: string
}
export type ScheduleLauncherHost = SessionLauncherHost & Pick<ComputerManager,
  'listComputers' | 'validateSessionDirectory' | 'listBackgroundTasks' | 'providerRuntimeOptions'
  | 'allocateScheduleWorktree' | 'readScheduleWorktree' | 'cleanupScheduleWorktree'>
type LaunchPrimitives = Pick<SessionLauncher<ScheduleProvenance>,
  'createSession' | 'deliverPrompt' | 'observeSession' | 'reconcileLaunch' | 'cancelWithAck'>

export async function recordScheduleProvenance(
  store: ManagerStore, session: ManagedSession, provenance: ScheduleProvenance,
): Promise<void> {
  const directory = await lstat(store.directory)
  if (!directory.isDirectory() || (process.getuid && directory.uid !== process.getuid())) {
    throw new Error('Session provenance requires an owner-only real directory')
  }
  await chmod(store.directory, 0o700)
  await store.updateRegistry((registry) => {
    const key = registryKey(session.computerId, session.id)
    registry[key] = {
      ...registry[key], computerId: session.computerId, sessionId: session.id,
      computerName: session.computerName, cwd: session.cwd, provider: session.provider,
      title: session.title, firstSeenAt: registry[key]?.firstSeenAt ?? new Date().toISOString(),
      lastStatus: session.status, lastSeenAt: session.updatedAt,
      origin: 'schedule', scheduleId: provenance.scheduleId, scheduleRunId: provenance.scheduleRunId,
      task: provenance.task.slice(0, 400),
    }
  })
}

export function recordScheduleReplacement(store: ManagerStore, event: HubEvent): Promise<void> {
  if (event.type !== 'session.removed' || !event.replacedBy) return Promise.resolve()
  const previous = store.registry()[registryKey(event.computerId, event.sessionId)]
  if (previous?.origin !== 'schedule') return Promise.resolve()
  const successorId = event.replacedBy
  const now = new Date().toISOString()
  return store.updateRegistry((registry) => {
    registry[registryKey(event.computerId, event.sessionId)] = { ...previous, removedAt: now, replacedBy: successorId }
    const key = registryKey(event.computerId, successorId)
    registry[key] = {
      ...previous, ...registry[key], sessionId: successorId, origin: 'schedule',
      scheduleId: previous.scheduleId, scheduleRunId: previous.scheduleRunId, task: previous.task,
      firstSeenAt: registry[key]?.firstSeenAt ?? now,
    }
    delete registry[key].removedAt
    delete registry[key].replacedBy
  })
}

function provenance(run: ScheduleRun, schedule: Schedule): ScheduleProvenance {
  return { origin: 'schedule', scheduleId: schedule.id, scheduleRunId: run.id, task: schedule.prompt }
}

export function scheduleSessionTitle(schedule: Schedule, at: string): string {
  const date = new Intl.DateTimeFormat('en-US', {
    timeZone: schedule.timezone, year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(new Date(at))
  const suffix = ` · ${date}`
  const name = [...schedule.name].map((character) => {
    const code = character.charCodeAt(0)
    return code < 32 || code === 127 || character === '"' ? ' ' : character
  }).join('').replace(/\s+/g, ' ').trim()
  return `⏱ ${name.slice(0, Math.max(1, 100 - suffix.length - 2))}${suffix}`
}

/** The dispatcher is the only hub authority; all execution stays on the owner. */
export class SessionScheduleLauncher implements ScheduleLauncher {
  private readonly sessions: LaunchPrimitives

  constructor(
    private readonly host: ScheduleLauncherHost,
    private readonly store: SchedulerStore,
    private readonly registry: ManagerStore,
    sessions?: LaunchPrimitives,
  ) {
    this.sessions = sessions ?? new SessionLauncher(host, {
      recordProvenance: (session, origin) => recordScheduleProvenance(registry, session, origin),
    })
  }

  async launch(run: ScheduleRun, schedule: Schedule): Promise<void> {
    const computer = this.host.listComputers().find((entry) => entry.id === run.computerId)
    if (!computer?.online) throw new ScheduleTargetUnavailableError('Target computer is offline')
    const capability = computer.providers?.find((entry) => entry.id === schedule.target.provider)
    if (!capability?.supportsLaunchIdentity) {
      throw new ScheduleLaunchRefusedError('Update this computer to run schedules with launch identity and termination acknowledgement.')
    }
    if (!capability.available) throw new ScheduleLaunchRefusedError(capability.unavailableReason ?? 'The scheduled provider is unavailable')
    let folder: string
    try {
      const { model, effort, context } = schedule.target
      if (schedule.target.provider === 'copilot' && !model && (effort || context)) {
        throw new Error('A model is required when setting effort or context')
      }
      if (model) {
        const options = await this.host.providerRuntimeOptions(run.computerId, schedule.target.provider)
        const selected = options.models.find((entry) => entry.id === model)
        if (!selected) throw new Error('Selected model is not available')
        if (effort && !selected.reasoningEfforts.includes(effort)) throw new Error('Selected reasoning effort is not supported by this model')
        if (context && !selected.contextTiers.includes(context)) throw new Error('Selected context tier is not supported by this model')
      }
      folder = await this.host.validateSessionDirectory(run.computerId, schedule.target.folder)
      if (schedule.workspace === 'worktree') {
        const intent = {
          launchId: run.launchId, folder, root: schedule.target.worktreeRoot,
        }
        await this.store.changeRun(run.id, { worktreeIntent: intent })
        const worktree = await this.host.allocateScheduleWorktree(run.computerId, intent)
        await this.store.changeRun(run.id, { worktree })
        folder = worktree.path
      }
    } catch (error) {
      if (this.store.getRun(run.id).worktreeIntent) {
        const owned = await this.host.readScheduleWorktree(run.computerId, run.launchId).catch(() => undefined)
        if (owned) await this.store.changeRun(run.id, { worktree: {
          ...owned, state: 'deferred', reason: 'Workspace preparation did not complete; retained for retry or manual review',
        } })
      }
      const status = error && typeof error === 'object' && 'statusCode' in error ? Number(error.statusCode) : undefined
      if (error instanceof RemoteNodeTransportError || (status !== undefined && status >= 500) ||
          (!computer.isLocal && !(status !== undefined && status >= 400 && status < 500))) {
        throw new ScheduleTargetUnavailableError('Target computer became unavailable while preparing the schedule workspace')
      }
      throw new ScheduleLaunchRefusedError(error instanceof Error ? error.message : 'The schedule workspace could not be prepared')
    }
    const launch = await this.sessions.createSession({
      computerId: run.computerId, launchId: run.launchId, folder,
      provider: schedule.target.provider, backend: 'sdk', model: schedule.target.model,
      reasoningEffort: schedule.target.effort, contextTier: schedule.target.context,
      mode: schedule.target.mode ?? 'autopilot',
      permissionPolicy: schedule.target.permissionPolicy ?? 'ask',
      folderTrust: schedule.target.folderTrust ?? 'ask',
      title: scheduleSessionTitle(schedule, run.occurrenceAt), provenance: provenance(run, schedule),
    }).catch((error: unknown) => {
      const status = error && typeof error === 'object' && 'statusCode' in error ? Number(error.statusCode) : undefined
      const uncertainty = deliveryUncertaintyFromError(error)
      const prelaunch = uncertainty === false ||
        (uncertainty !== true && error instanceof Error && error.name === 'RuntimeConfigurationError')
      if (prelaunch && status !== undefined && (status >= 500 || status === 408 || status === 429)) {
        throw new ScheduleTargetUnavailableError('Runtime models are temporarily unavailable. Try again.')
      }
      if (prelaunch && status !== undefined && status >= 400 && status < 500 && error instanceof Error) {
        throw new ScheduleLaunchRefusedError(error.message)
      }
      throw error
    })
    await this.store.changeRun(run.id, { sessionId: launch.session.id })
    const current = this.store.getRun(run.id)
    if (current.status === 'stopping' || !isInFlight(current)) return
    await this.deliver(run, schedule, launch.session)
  }

  private async deliver(run: ScheduleRun, schedule: Schedule, session: ManagedSession): Promise<PromptAcceptanceReceipt> {
    const delivery = await this.sessions.deliverPrompt({
      session, folderTrust: schedule.target.folderTrust ?? 'ask',
    }, schedule.prompt, { deliveryId: `${run.launchId}:root` })
    if (!delivery.receipt || delivery.receipt.deliveryId !== `${run.launchId}:root` ||
        delivery.receipt.sessionId !== session.id) throw new Error('Missing or mismatched scheduled root-prompt receipt')
    await this.store.changeRun(run.id, {
      sessionId: session.id, rootPromptReceipt: delivery.receipt.promptId, rootPromptAcceptance: delivery.receipt,
    })
    return delivery.receipt
  }

  async reconcile(run: ScheduleRun): Promise<ScheduleReconciliation> {
    const schedule = this.store.scheduleForRun(run.id)
    const computer = this.host.listComputers().find((entry) => entry.id === run.computerId)
    if (run.status === 'pending' && !run.startedAt && computer?.online &&
        !computer.providers?.some((provider) => provider.id === schedule.target.provider && provider.supportsLaunchIdentity)) {
      return { state: 'terminated', outcome: 'failed', error: 'Update this computer to run schedules with launch identity and termination acknowledgement.' }
    }
    let launch: LaunchReconciliation | undefined
    try { launch = await this.sessions.reconcileLaunch(run.computerId, run.launchId) }
    catch (error) {
      const current = this.store.getRun(run.id)
      if (run.status === 'pending' && !run.startedAt && !current.startedAt && !current.sessionId && !current.rootPromptReceipt) {
        return { state: 'absent' }
      }
      return { state: 'unknown', error: error instanceof Error && error.message.startsWith('Update this computer')
        ? error.message : 'Owning computer could not reconcile this launch; its slot remains reserved' }
    }
    // A negative lookup cannot disprove a creation still in transit. Only a
    // never-launched pending intent is safe to dispatch after restart.
    if (!launch) return { state: run.status === 'pending' ? 'absent' : 'unknown' }
    if (launch.launchId !== run.launchId) return { state: 'unknown', error: 'Mismatched launch evidence' }
    let receipt = launch.receipts.find((entry) => entry.deliveryId === `${run.launchId}:root` && entry.sessionId === launch.sessionId)
    if (receipt && run.rootPromptReceipt && receipt.promptId !== run.rootPromptReceipt) {
      return { state: 'unknown', error: 'Mismatched root-prompt evidence' }
    }
    if (!receipt && run.rootPromptReceipt && launch.termination?.outcome !== 'stopped') {
      return { state: 'unknown', sessionId: launch.sessionId, error: 'Owning computer no longer reports the accepted root; its slot remains reserved' }
    }
    const details: ScheduleReconciliation = {
      state: 'launching', sessionId: launch.sessionId,
      ...(receipt ? { rootPromptReceipt: receipt.promptId, rootPromptAcceptance: receipt } : {}),
    }
    if (launch.termination?.outcome === 'stopped' && launch.termination.sessionId === launch.sessionId) {
      return this.terminal(run, { ...details, state: 'terminated', outcome: 'stopped' })
    }
    if (launch.deleted) return { ...details, state: 'unknown', error: 'Launch session was deleted without termination acknowledgement' }
    const session = await this.sessions.observeSession({ computerId: run.computerId, id: launch.sessionId })
    if (session.id !== launch.sessionId || session.computerId !== run.computerId) {
      return { ...details, state: 'unknown', error: 'Mismatched session evidence' }
    }
    await recordScheduleProvenance(this.registry, session, provenance(run, schedule))
    if (run.status === 'stopping' || launch.stopping) return { ...details, state: 'stopping' }
    if (this.needsInput(session)) return { ...details, state: 'needs-input' }
    if (!receipt) {
      // A positive owner binding permits idempotent root acceptance after a
      // crash between creation and delivery, never a second session launch.
      receipt = await this.deliver(run, schedule, session)
      return {
        ...details, rootPromptReceipt: receipt.promptId, rootPromptAcceptance: receipt,
        state: this.needsInput(session) ? 'needs-input' : 'running',
      }
    }
    const summary = session.messages.findLast((message) => message.role === 'assistant' && !message.streaming)
      ?.content.replace(/\s+/g, ' ').trim().slice(0, 280)
    const result = { ...details, ...(summary ? { summary } : {}) }
    const outcome = receipt.outcome
    if (outcome && outcome !== 'unknown' && session.status !== 'running' && session.status !== 'waiting' &&
        !session.queuedCount && !session.queuedPrompts?.length && !session.queuedDispatch &&
        !session.terminalQueueDispatchPending && !session.recoveryAcknowledgementPending &&
        !session.recoverySeedState && !session.queueState && !session.restartRecovery && !session.recovery) {
      const tasks = await this.host.listBackgroundTasks(run.computerId, launch.sessionId)
      if (tasks.supported && tasks.runningCount === 0 && !tasks.tasks.some((task) => ['running', 'queued'].includes(task.status))) {
        // The open session can accept a user follow-up immediately after this
        // snapshot. Only an acknowledged stop fences future sends safely.
        return this.terminal(run, { ...result, state: 'terminated', outcome }, false)
      }
    }
    return { ...result, state: 'running' }
  }

  private needsInput(session: ManagedSession): boolean {
    return Boolean((session.pendingPermission && !session.pendingPermission.stale) || session.pendingUserInput)
  }

  private async terminal(run: ScheduleRun, result: ScheduleReconciliation, fenced = true): Promise<ScheduleReconciliation> {
    if (this.store.scheduleForRun(run.id).workspace !== 'worktree') return result
    let owned = this.store.getRun(run.id).worktree
    if (!owned) {
      try { owned = await this.host.readScheduleWorktree(run.computerId, run.launchId) }
      catch { /* Missing owner evidence never authorizes removal. */ }
    }
    const deferred = () => ({
      ...result,
      ...(owned ? { worktree: {
        ...owned, state: 'deferred' as const, reason: 'Owning computer did not confirm cleanup; manual review required',
      } } : { error: 'Worktree cleanup is deferred because ownership or removal could not be verified' }),
    })
    if (!fenced) return {
      ...result,
      ...(owned ? { worktree: {
        ...owned, state: 'deferred' as const, reason: 'The session remains open for follow-up work; cleanup requires manual review',
      } } : { error: 'The session remains open; worktree cleanup requires manual review' }),
    }
    try {
      const worktree = await this.host.cleanupScheduleWorktree(run.computerId, run.launchId)
      return worktree ? { ...result, worktree } : deferred()
    } catch { return deferred() }
  }

  async stop(run: ScheduleRun): Promise<ScheduleStopAcknowledgement> {
    const launch = await this.sessions.reconcileLaunch(run.computerId, run.launchId)
    if (!launch || launch.launchId !== run.launchId) return { outcome: 'unknown' }
    await this.store.changeRun(run.id, { sessionId: launch.sessionId })
    const ack = await this.sessions.cancelWithAck({ computerId: run.computerId, id: launch.sessionId })
    if (ack.sessionId !== launch.sessionId || ack.outcome !== 'stopped') return { outcome: 'unknown', sessionId: launch.sessionId }
    const result = await this.terminal(run, { state: 'terminated', outcome: 'stopped' })
    if (result.worktree) await this.store.changeRun(run.id, { worktree: result.worktree })
    return { outcome: 'stopped', sessionId: launch.sessionId }
  }
}
