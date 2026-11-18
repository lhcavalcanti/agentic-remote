import type { HubEvent, ManagedSession } from '../shared/contracts.js'
import { chmod, lstat } from 'node:fs/promises'
import type { LaunchReconciliation, PromptAcceptanceReceipt } from '../shared/launch-identity.js'
import { SCHEDULE_ABANDONED_REASON, SCHEDULE_DELETED_SESSION_REASON, scheduleProviderUnavailableReason, type Schedule, type ScheduleRun } from '../shared/schedules.js'
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
  'createSession' | 'deliverPrompt' | 'observeSession' | 'reconcileLaunch' | 'cancelWithAck' | 'trustFolder'>

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
      origin: 'schedule', originEvidence: 'launch', scheduleId: provenance.scheduleId, scheduleRunId: provenance.scheduleRunId,
      task: provenance.task.slice(0, 400),
    }
  })
}

export function recordScheduleReplacement(store: ManagerStore, event: HubEvent): Promise<void> {
  if (event.type !== 'session.removed' || !event.replacedBy) return Promise.resolve()
  if (store.sessionOrigin(event.computerId, event.sessionId) !== 'schedule') return Promise.resolve()
  return store.recordSessionReplacement(event.computerId, event.sessionId, event.replacedBy)
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
      recordProvenance: (session, origin) => this.store.isRunAbandoned(origin.scheduleRunId)
        ? Promise.resolve() : recordScheduleProvenance(registry, session, origin),
    })
  }

  async launch(run: ScheduleRun, schedule: Schedule): Promise<void> {
    this.assertNotAbandoned(run)
    const providerReason = scheduleProviderUnavailableReason(schedule.target.provider)
    if (providerReason) throw new ScheduleLaunchRefusedError(providerReason)
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
        throw new ScheduleLaunchRefusedError('A model is required when setting effort or context')
      }
      if (model || context === 'long_context') {
        const options = await this.host.providerRuntimeOptions(run.computerId, schedule.target.provider).catch((error: unknown) => {
          if (error instanceof ScheduleLaunchRefusedError) throw error
          const status = error && typeof error === 'object'
            ? Number('statusCode' in error ? error.statusCode : 'status' in error ? error.status : undefined) : undefined
          if (status !== undefined && status >= 400 && status < 500 && status !== 408 && status !== 429) {
            throw new ScheduleLaunchRefusedError(error instanceof Error ? error.message : 'The owner refused runtime catalog access')
          }
          throw new ScheduleTargetUnavailableError('Runtime models are temporarily unavailable. Try again.')
        })
        if (!model) {
          if (!options.models.some((entry) => entry.contextTiers.includes('long_context'))) {
            throw new ScheduleLaunchRefusedError('Long context is not supported by this provider on this computer')
          }
          throw new ScheduleLaunchRefusedError('Select an explicit model to validate long-context support on this computer')
        }
        const selected = options.models.find((entry) => entry.id === model)
        if (!selected) throw new ScheduleLaunchRefusedError('Selected model is not available')
        if (effort && !selected.reasoningEfforts.includes(effort)) throw new ScheduleLaunchRefusedError('Selected reasoning effort is not supported by this model')
        if (context && !selected.contextTiers.includes(context)) throw new ScheduleLaunchRefusedError('Selected context tier is not supported by this model')
      }
      this.assertNotAbandoned(run)
      folder = await this.host.validateSessionDirectory(run.computerId, schedule.target.folder)
      this.assertNotAbandoned(run)
      if (schedule.workspace === 'worktree') {
        const intent = {
          launchId: run.launchId, folder, root: schedule.target.worktreeRoot,
        }
        await this.store.changeRun(run.id, { worktreeIntent: intent })
        this.assertNotAbandoned(run)
        const worktree = await this.host.allocateScheduleWorktree(run.computerId, intent)
        this.assertNotAbandoned(run)
        await this.store.changeRun(run.id, { worktree })
        folder = worktree.path
      }
    } catch (error) {
      if (this.store.isLaunchAbandoned(run.launchId)) return
      if (this.store.getRun(run.id).worktreeIntent) {
        const owned = await this.host.readScheduleWorktree(run.computerId, run.launchId).catch(() => undefined)
        if (this.store.isLaunchAbandoned(run.launchId)) return
        if (owned) await this.store.changeRun(run.id, { worktree: {
          ...owned, state: 'deferred', reason: 'Workspace preparation did not complete; retained for retry or manual review',
        } })
      }
      if (error instanceof ScheduleLaunchRefusedError || error instanceof ScheduleTargetUnavailableError) throw error
      const status = error && typeof error === 'object' && 'statusCode' in error ? Number(error.statusCode) : undefined
      if (error instanceof RemoteNodeTransportError || (status !== undefined && status >= 500) ||
          (!computer.isLocal && !(status !== undefined && status >= 400 && status < 500))) {
        throw new ScheduleTargetUnavailableError('Target computer became unavailable while preparing the schedule workspace')
      }
      throw new ScheduleLaunchRefusedError(error instanceof Error ? error.message : 'The schedule workspace could not be prepared')
    }
    this.assertNotAbandoned(run)
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
      const prelaunch = uncertainty === false
      if (prelaunch && status !== undefined && (status >= 500 || status === 408 || status === 429)) {
        throw new ScheduleTargetUnavailableError('Runtime models are temporarily unavailable. Try again.')
      }
      if (prelaunch) {
        throw new ScheduleLaunchRefusedError(error instanceof Error ? error.message : 'The owner refused session creation')
      }
      throw error
    })
    if (this.store.isLaunchAbandoned(run.launchId)) return
    await this.store.changeRun(run.id, { sessionId: launch.session.id })
    if (this.store.isLaunchAbandoned(run.launchId)) return
    const current = this.store.getRun(run.id)
    if (current.status === 'stopping' || !isInFlight(current)) return
    await this.deliver(run, schedule, launch.session)
  }

  private async deliver(run: ScheduleRun, schedule: Schedule, session: ManagedSession): Promise<PromptAcceptanceReceipt> {
    this.assertNotAbandoned(run)
    const delivery = await this.sessions.deliverPrompt({
      session, folderTrust: schedule.target.folderTrust ?? 'ask', assertActive: () => this.assertNotAbandoned(run),
    }, schedule.prompt, { deliveryId: `${run.launchId}:root` })
    if (!delivery.receipt || delivery.receipt.deliveryId !== `${run.launchId}:root` ||
        delivery.receipt.sessionId !== session.id) throw new Error('Missing or mismatched scheduled root-prompt receipt')
    if (this.store.isLaunchAbandoned(run.launchId)) return delivery.receipt
    await this.store.changeRun(run.id, {
      sessionId: session.id, rootPromptReceipt: delivery.receipt.promptId, rootPromptAcceptance: delivery.receipt,
    })
    return delivery.receipt
  }

  async reconcile(run: ScheduleRun): Promise<ScheduleReconciliation> {
    if (this.store.isLaunchAbandoned(run.launchId)) return { state: 'terminated', outcome: 'interrupted', error: SCHEDULE_ABANDONED_REASON }
    const schedule = this.store.scheduleForRun(run.id)
    const providerReason = scheduleProviderUnavailableReason(schedule.target.provider)
    if (providerReason && run.status === 'pending' && !run.startedAt && !run.sessionId && !run.rootPromptReceipt) {
      return { state: 'terminated', outcome: 'failed', error: providerReason }
    }
    const computer = this.host.listComputers().find((entry) => entry.id === run.computerId)
    if (run.status === 'pending' && !run.startedAt && computer?.online &&
        !computer.providers?.some((provider) => provider.id === schedule.target.provider && provider.supportsLaunchIdentity)) {
      return { state: 'terminated', outcome: 'failed', error: 'Update this computer to run schedules with launch identity and termination acknowledgement.' }
    }
    let launch: LaunchReconciliation | undefined
    try { launch = await this.sessions.reconcileLaunch(run.computerId, run.launchId) }
    catch (error) {
      if (this.store.isLaunchAbandoned(run.launchId)) return { state: 'terminated', outcome: 'interrupted', error: SCHEDULE_ABANDONED_REASON }
      const current = this.store.getRun(run.id)
      if (run.status === 'pending' && !run.startedAt && !current.startedAt && !current.sessionId && !current.rootPromptReceipt) {
        return { state: 'absent' }
      }
      return { state: 'unknown', error: error instanceof Error && error.message.startsWith('Update this computer')
        ? error.message : 'Owning computer could not reconcile this launch; its slot remains reserved' }
    }
    if (this.store.isLaunchAbandoned(run.launchId)) return { state: 'terminated', outcome: 'interrupted', error: SCHEDULE_ABANDONED_REASON }
    // A negative lookup cannot disprove a creation still in transit. Only a
    // never-launched pending intent is safe to dispatch after restart.
    if (!launch) return { state: run.status === 'pending' ? 'absent' : 'unknown' }
    if (launch.launchId !== run.launchId) return { state: 'unknown', error: 'Mismatched launch evidence' }
    const expectedSession = run.sessionId ?? run.rootPromptAcceptance?.sessionId
    if (expectedSession && expectedSession !== launch.sessionId && !await this.followsReplacement(run, expectedSession, launch)) {
      return { state: 'unknown', error: 'Mismatched session evidence' }
    }
    if (this.store.isLaunchAbandoned(run.launchId)) return { state: 'terminated', outcome: 'interrupted', error: SCHEDULE_ABANDONED_REASON }
    if (launch.deleted) {
      // Deleting the session record does not prove its provider work stopped.
      if (launch.termination?.outcome === 'stopped' && launch.termination.sessionId === launch.sessionId) {
        return this.terminal(run, { state: 'terminated', outcome: 'stopped', sessionId: launch.sessionId })
      }
      return { state: 'unknown', sessionId: launch.sessionId, error: SCHEDULE_DELETED_SESSION_REASON }
    }
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
    if (providerReason) return { ...details, state: 'unknown', error: providerReason }
    let session = await this.sessions.observeSession({ computerId: run.computerId, id: launch.sessionId })
    this.assertNotAbandoned(run)
    if (session.id !== launch.sessionId || session.computerId !== run.computerId) {
      return { ...details, state: 'unknown', error: 'Mismatched session evidence' }
    }
    await recordScheduleProvenance(this.registry, session, provenance(run, schedule))
    if (run.status === 'stopping' || launch.stopping) return { ...details, state: 'stopping' }
    if (schedule.target.folderTrust === 'auto-approve' && session.pendingPermission && !session.pendingPermission.stale &&
        await this.sessions.trustFolder({ session, folderTrust: 'auto-approve', assertActive: () => this.assertNotAbandoned(run) })) {
      this.assertNotAbandoned(run)
      session = await this.sessions.observeSession({ computerId: run.computerId, id: launch.sessionId })
      if (session.id !== launch.sessionId || session.computerId !== run.computerId) {
        return { ...details, state: 'unknown', error: 'Mismatched session evidence' }
      }
    }
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
    return Boolean((session.pendingPermission && !session.pendingPermission.stale) ||
      (session.pendingUserInput && !session.pendingUserInput.stale))
  }

  private assertNotAbandoned(run: ScheduleRun): void {
    if (this.store.isLaunchAbandoned(run.launchId)) throw new ScheduleLaunchRefusedError(SCHEDULE_ABANDONED_REASON)
  }

  private async terminal(run: ScheduleRun, result: ScheduleReconciliation, fenced = true, cleanupReason?: string): Promise<ScheduleReconciliation> {
    if (this.store.isLaunchAbandoned(run.launchId)) return { state: 'terminated', outcome: 'interrupted', error: SCHEDULE_ABANDONED_REASON }
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
        ...owned, state: 'deferred' as const, reason: cleanupReason ?? 'The session remains open for follow-up work; cleanup requires manual review',
      } } : { error: result.error ?? cleanupReason ?? 'The session remains open; worktree cleanup requires manual review' }),
    }
    if (this.store.isLaunchAbandoned(run.launchId)) return { state: 'terminated', outcome: 'interrupted', error: SCHEDULE_ABANDONED_REASON }
    try {
      const worktree = await this.host.cleanupScheduleWorktree(run.computerId, run.launchId)
      return worktree ? { ...result, worktree } : deferred()
    } catch { return deferred() }
  }

  /**
   * Clear and Recover move a launch to the replacement session. Follow it only when the
   * owner's replacement lineage names the run's session; anything else stays unknown.
   */
  private async followsReplacement(run: ScheduleRun, expected: string, launch: LaunchReconciliation): Promise<boolean> {
    if (launch.deleted) return false
    try {
      const session = await this.sessions.observeSession({ computerId: run.computerId, id: launch.sessionId })
      return session.id === launch.sessionId && session.computerId === run.computerId &&
        Boolean(session.replacedSessionIds?.includes(expected))
    } catch {
      return false
    }
  }

  async stop(run: ScheduleRun): Promise<ScheduleStopAcknowledgement> {
    if (this.store.isLaunchAbandoned(run.launchId)) return { outcome: 'unknown' }
    const launch = await this.sessions.reconcileLaunch(run.computerId, run.launchId)
    if (this.store.isLaunchAbandoned(run.launchId)) return { outcome: 'unknown' }
    if (!launch || launch.launchId !== run.launchId) return { outcome: 'unknown' }
    const expectedSession = run.sessionId ?? run.rootPromptAcceptance?.sessionId
    if (expectedSession && expectedSession !== launch.sessionId && !await this.followsReplacement(run, expectedSession, launch)) {
      return { outcome: 'unknown' }
    }
    if (this.store.isLaunchAbandoned(run.launchId)) return { outcome: 'unknown' }
    if (launch.deleted) {
      if (launch.termination?.outcome !== 'stopped' || launch.termination.sessionId !== launch.sessionId) {
        return { outcome: 'unknown', sessionId: launch.sessionId }
      }
      const result = await this.terminal(run, { state: 'terminated', outcome: 'stopped' })
      if (this.store.isLaunchAbandoned(run.launchId)) return { outcome: 'unknown' }
      if (result.worktree) await this.store.changeRun(run.id, { worktree: result.worktree })
      return { outcome: 'stopped', sessionId: launch.sessionId }
    }
    await this.store.changeRun(run.id, { sessionId: launch.sessionId })
    const ack = await this.sessions.cancelWithAck({ computerId: run.computerId, id: launch.sessionId })
    if (this.store.isLaunchAbandoned(run.launchId)) return { outcome: 'unknown' }
    if (ack.sessionId !== launch.sessionId || ack.outcome !== 'stopped') return { outcome: 'unknown', sessionId: launch.sessionId }
    const result = await this.terminal(run, { state: 'terminated', outcome: 'stopped' })
    if (this.store.isLaunchAbandoned(run.launchId)) return { outcome: 'unknown' }
    if (result.worktree) await this.store.changeRun(run.id, { worktree: result.worktree })
    return { outcome: 'stopped', sessionId: launch.sessionId }
  }
}
