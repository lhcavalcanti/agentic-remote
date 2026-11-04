import { execFile } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { TERMINAL_STARTUP_TIMEOUT_MS } from '../shared/terminal-timing.js'
import { readFile, readlink, realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import {
  findActiveCopilotProcesses,
  isDirectCopilotSessionProcess,
  processStartTimeMs,
} from './active-sessions.js'
import { noTmuxServer, tmuxNotInstalled } from './tmux-errors.js'
import type {
  ConfigureRuntimeInput,
  PendingPermission,
  PendingUserInput,
  SessionRuntimeInfo,
} from '../shared/contracts.js'

const execFileAsync = promisify(execFile)

/**
 * One field of the agent's structured form. Fields are tabs: a select is
 * driven by moving the cursor, a text field by replacing its contents. Moving
 * between text/checklist fields is Tab; a single-choice field needs Enter to
 * save its highlight and advance. Acceptance on the last field submits.
 */
export type TerminalFormStep =
  | { kind: 'select'; optionCount: number; index: number }
  // A checklist is not chosen but toggled, and what it is already showing is
  // the only thing that says which rows have to change. So it carries what was
  // chosen, and the rows to press are worked out against the screen.
  | { kind: 'checklist'; optionCount: number; selected: number[] }
  | { kind: 'text'; value: string }

/**
 * What identifies the form a reply is for. Field titles alone are not enough:
 * two requests can share a schema, so the question the CLI prints above them
 * is carried too.
 */
export interface TerminalFormIdentity {
  question: string
  fields: string[]
}

export interface TerminalFormReplyOptions {
  /**
   * When the reply must have settled, in epoch milliseconds. It covers waiting
   * behind other terminal work as well as the reply itself, so every step of
   * one answer can share it. Defaults to the form's field-scaled budget.
   */
  deadline?: number
}

export interface TerminalSendOptions {
  allowDuringAgentExecution?: boolean
  replaceExistingInput?: boolean
  /** Refuse, under the send lock, unless the agent is idle at its composer. */
  idleOnly?: boolean
}

export interface TerminalCancelOptions {
  /**
   * Whether Copilot's event log has a turn open. Asked only when the pane
   * neither offers the interrupt key nor shows an idle prompt it knows.
   */
  turnOpen?: () => Promise<boolean>
}

export interface TerminalSessionController {
  create?(
    sessionId: string,
    cwd: string,
    title: string,
    allowAllPermissions?: boolean,
    runtime?: SessionRuntimeInfo,
  ): Promise<{ sessionName: string; windowId: string }>
  reopen?(
    sessionId: string,
    cwd: string,
    title: string,
    allowAllPermissions?: boolean,
    runtime?: SessionRuntimeInfo,
  ): Promise<{ sessionName: string; windowId: string }>
  rename?(sessionId: string, title: string): Promise<boolean>
  configure?(
    sessionId: string,
    cwd: string,
    input: ConfigureRuntimeInput,
  ): Promise<boolean>
  reset?(
    sessionId: string,
    replacementId: string,
    cwd: string,
    input: ConfigureRuntimeInput | undefined,
    commitReplacement: () => Promise<void>,
  ): Promise<boolean>
  restart?(sessionId: string, cwd: string): Promise<boolean>
  /** True only when a previously identified owner is confirmed gone. */
  ownerStopped?(sessionId: string): Promise<boolean>
  /** Ends the window running a session without forgetting the session. */
  /**
   * Ends the session's runtime.
   *
   * `confirm` runs immediately before anything is killed, and inside whatever
   * serialization the controller uses, so a caller can refuse a teardown that
   * stopped being safe while the owner was being looked up.
   */
  stop?(
    sessionId: string,
    confirm?: () => void | Promise<void>,
  ): Promise<boolean>
  pendingPermission?(sessionId: string): Promise<PendingPermission | undefined>
  replyPermission?(
    sessionId: string,
    request: PendingPermission,
    optionId: string,
  ): Promise<boolean>
  pendingUserInput?(sessionId: string): Promise<PendingUserInput | undefined>
  replyUserInput?(
    sessionId: string,
    request: PendingUserInput,
    answer: string,
    wasFreeform: boolean,
  ): Promise<boolean>
  updateNotice?(sessionId: string): Promise<string | undefined>
  /**
   * Closes a prompt the agent is still showing. A structured form captures
   * every keystroke, so anything typed while it is open lands in its fields
   * instead of reaching the agent. When field titles are given, a form that
   * does not show them belongs to another request and is left alone.
   */
  dismissUserInput?(
    sessionId: string,
    form?: TerminalFormIdentity,
    action?: 'cancel' | 'decline',
    options?: TerminalFormReplyOptions,
  ): Promise<boolean>
  /**
   * Fills the structured form the agent is showing and submits it, so the
   * agent receives a real tool result instead of a follow-up message. The
   * field titles identify which form may be answered.
   */
  fillUserInputForm?(
    sessionId: string,
    steps: TerminalFormStep[],
    form: TerminalFormIdentity,
    options?: TerminalFormReplyOptions,
  ): Promise<boolean>
  has(sessionId: string): Promise<boolean>
  send(
    sessionId: string,
    content: string,
    enqueue: boolean,
    options?: TerminalSendOptions,
  ): Promise<boolean>
  sendWhenIdle?(sessionId: string, content: string): Promise<boolean>
  cancel(sessionId: string, options?: TerminalCancelOptions): Promise<boolean>
  capture?(sessionId: string): Promise<string | undefined>
  canHandleStartupPrompt?(
    sessionId: string,
    pane: string,
  ): Promise<boolean>
  ownsStartupPrompt?(sessionId: string): boolean
  inputReady?(sessionId: string): Promise<boolean>
  resolveStartupPrompt?(sessionId: string): Promise<boolean>
  /**
   * Whether a prompt is already inside the controller for this session.
   *
   * Sending records itself only after it returns, so the stored status still
   * says idle while one is on its way in. This is the only reading that is
   * true at the moment more keystrokes would be added to the same pane.
   */
  sending?(sessionId: string): boolean
  /**
   * Starts Copilot the way `create` does, in a tmux session of its own at 80
   * columns, and resolves once the app can tell its prompt is ready. Rejects,
   * saying what the terminal showed, when it cannot.
   */
  probeStartup?(sessionId: string, cwd: string, signal?: AbortSignal): Promise<void>
  /**
   * Ends probes a stopped service left running, once their Copilot has
   * exited, and says which sessions they were.
   */
  endLeftoverProbes?(): Promise<string[]>
}

interface TerminalOwner {
  pid: number
  target: string
  rootPid: number
}

interface FormViewport {
  window: string
  pane: string
  pid: number
  width: number
  height: number
  panes: number
  linked: number
  policy: string
  localPolicy: string
  clients: string
}

export class TerminalFormReplyError extends Error {
  readonly statusCode = 409
  readonly uncertainDelivery: boolean

  constructor(
    message: string,
    readonly outcome: 'not-submitted' | 'uncertain' | 'submitted',
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = 'TerminalFormReplyError'
    this.uncertainDelivery = outcome !== 'not-submitted'
  }
}

interface FormReplyProgress {
  readonly deadline: number
  started: boolean
  expired: boolean
  /** A key that can submit or dismiss the form may have reached the pane. */
  committed: boolean
  /** The form was seen to close, so only cleanup can still be running. */
  closed: boolean
}

class FormReplyDeadlineError extends Error {
  constructor() {
    super('The terminal form reply timed out')
    this.name = 'FormReplyDeadlineError'
  }
}

const FORM_REPLY_NOT_SUBMITTED_TIMEOUT =
  'The terminal form reply timed out before it could be submitted. Nothing was submitted; try again.'

/** What a caller is told when a form reply's deadline passes first. */
function formReplyExpired(progress: FormReplyProgress): TerminalFormReplyError {
  if (progress.closed) {
    return new TerminalFormReplyError(
      'The terminal reply was submitted, but its cleanup did not finish within the time limit',
      'submitted',
    )
  }
  if (progress.committed) {
    return new TerminalFormReplyError(
      'The terminal reply timed out after it may have been submitted; do not resend it',
      'uncertain',
    )
  }
  return new TerminalFormReplyError(
    progress.started
      ? FORM_REPLY_NOT_SUBMITTED_TIMEOUT
      : 'The terminal was busy with other work, so this reply timed out before it started. Nothing was submitted; try again.',
    'not-submitted',
  )
}

const terminalDraftConflictMessages = {
  'composer-unreadable': 'The terminal composer could not be read, so its text was not cleared.',
  'changed-before-clear': 'The terminal changed before its text could be cleared. The app draft was not sent.',
  'owner-changed-before-clear': 'The terminal owner changed before its text could be cleared. The app draft was not sent.',
  'owner-changed-after-clear': 'The terminal owner changed after its text was cleared. The app draft was not sent.',
  'clear-unconfirmed': 'The terminal clear was sent, but an empty composer could not be confirmed. The app draft was not sent.',
  'composer-not-ready': 'The terminal did not return to a readable composer before replacement. Nothing was cleared or pasted.',
  'unsent-text': 'The terminal already has unsent text or a pending paste. Review it there before sending another message.',
  'new-text': 'New terminal text appeared before the app draft could be sent. Nothing new was pasted.',
} as const

export type TerminalDraftConflict = keyof typeof terminalDraftConflictMessages

export class TerminalDraftConflictError extends Error {
  readonly statusCode = 409
  readonly uncertainDelivery = false
  readonly terminalDraftConflict = true
  /** Stable refusal reason; each conflict has its own message. */
  readonly reasonCode: `terminal-draft-conflict.${TerminalDraftConflict}`

  constructor(conflict: TerminalDraftConflict) {
    super(terminalDraftConflictMessages[conflict])
    this.name = 'TerminalDraftConflictError'
    this.reasonCode = `terminal-draft-conflict.${conflict}`
  }
}

const MAX_FORM_VIEWPORT_WIDTH = 256
const MAX_FORM_VIEWPORT_HEIGHT = 256
const MIN_FORM_QUESTION_REFLOW_WIDTH = 128
const FORM_QUESTION_REFLOW_WIDTH_STEP = 16
const FORM_VIEWPORT_BASE_TIMEOUT_MS = 15_000
const FORM_VIEWPORT_ADDITIONAL_FIELD_TIMEOUT_MS = 2_500
const MAX_FORM_VIEWPORT_TIMEOUT_MS = 60_000
const REPLACEMENT_COMPOSER_TIMEOUT_MS = 30_000
const REPLACEMENT_READY_FRAMES = 30
// A Copilot running this long is past the dialogs it opens as it starts, so a
// first message to it only needs its prompt seen steady once.
const SETTLED_OWNER_AGE_MS = 30_000
const SETTLED_READY_FRAMES = 2
// A settled Copilot that is working shows its prompt at once or not at all, so
// a steer is refused after this rather than waiting out startup under the lock.
const SETTLED_STEER_READY_TIMEOUT_MS = 5_000
const PROBE_COLUMNS = 80
const PROBE_ROWS = 24
const PROBE_ANSWER_TIMEOUT_MS = 10_000
const PROBE_EXIT_TIMEOUT_MS = 10_000
const PROBE_SESSION_PREFIX = 'agentic-remote-canary-'

/** Whether every process has exited within the probe's exit timeout. */
async function waitForExit(pids: number[]): Promise<boolean> {
  const deadline = Date.now() + PROBE_EXIT_TIMEOUT_MS
  while (pids.some(processAlive)) {
    if (Date.now() >= deadline) return false
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  return true
}

async function tmuxSessionExists(name: string): Promise<boolean> {
  return execFileAsync('tmux', ['has-session', '-t', `=${name}`]).then(() => true, () => false)
}

// Ends a probe's tmux session and waits for its Copilot to go. A probe still
// running afterwards is a failure in its own right, whatever it found.
async function endProbeSession(name: string, pids: number[]): Promise<string | undefined> {
  await execFileAsync('tmux', ['kill-session', '-t', `=${name}`]).catch(() => undefined)
  if (await tmuxSessionExists(name)) return `The probe's tmux session ${name} could not be ended`
  if (!(await waitForExit(pids))) return `The probe's Copilot was still running ${PROBE_EXIT_TIMEOUT_MS / 1000} s after its tmux session ended`
  return undefined
}

function processAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM'
  }
}
// A second Ctrl+C soon after the first can reach a prompt that has just gone
// idle, where it is the first half of quitting.
const INTERRUPT_REPEAT_MS = 5_000

export function terminalFormReplyBudget(fieldCount: number): number {
  return Math.min(
    MAX_FORM_VIEWPORT_TIMEOUT_MS,
    FORM_VIEWPORT_BASE_TIMEOUT_MS +
      Math.max(0, fieldCount - 1) *
        FORM_VIEWPORT_ADDITIONAL_FIELD_TIMEOUT_MS,
  )
}

export class TmuxTerminalSessionController
  implements TerminalSessionController
{
  private readonly operations = new Map<string, Promise<unknown>>()
  private readonly inputReadySessions = new Map<
    string,
    TerminalOwner
  >()
  private readonly automaticStartupSessions = new Map<
    string,
    { pid: number; target: string; rootPid: number }
  >()
  /** Owner identity observed without claiming that its composer is ready. */
  private readonly knownOwners = new Map<string, TerminalOwner>()
  private creationQueue: Promise<void> = Promise.resolve()
  private activeProcessCache?: {
    expiresAt: number
    processes: ReturnType<typeof findActiveCopilotProcesses>
  }
  private readonly replacementComposerTimeoutMs =
    REPLACEMENT_COMPOSER_TIMEOUT_MS
  private readonly startupTimeoutMs = TERMINAL_STARTUP_TIMEOUT_MS
  private readonly settledOwnerAgeMs = SETTLED_OWNER_AGE_MS
  /** When Stop last sent each session Ctrl+C. */
  private readonly interruptedAt = new Map<string, number>()

  async create(
    sessionId: string,
    cwd: string,
    title: string,
    allowAllPermissions = true,
    runtime?: SessionRuntimeInfo,
  ): Promise<{ sessionName: string; windowId: string }> {
    return this.launchWindow(
      sessionId,
      cwd,
      title,
      allowAllPermissions,
      runtime,
      false,
    )
  }

  async reopen(
    sessionId: string,
    cwd: string,
    title: string,
    allowAllPermissions = true,
    runtime?: SessionRuntimeInfo,
  ): Promise<{ sessionName: string; windowId: string }> {
    return this.launchWindow(
      sessionId,
      cwd,
      title,
      allowAllPermissions,
      runtime,
      true,
    )
  }

  private launchWindow(
    sessionId: string,
    cwd: string,
    title: string,
    allowAllPermissions: boolean,
    runtime: SessionRuntimeInfo | undefined,
    resumeExisting: boolean,
  ): Promise<{ sessionName: string; windowId: string }> {
    const creation = this.creationQueue.then(() =>
      this.createWindow(
        sessionId,
        cwd,
        title,
        allowAllPermissions,
        runtime,
        resumeExisting,
      ),
    )
    this.creationQueue = creation.then(
      () => undefined,
      () => undefined,
    )
    return creation
  }

  async has(sessionId: string): Promise<boolean> {
    const owner =
      (await this.owner(sessionId)) ??
      (await this.owner(sessionId, undefined, true))
    if (!owner) return false
    this.knownOwners.set(sessionId, owner)
    return true
  }

  async ownerStopped(sessionId: string): Promise<boolean> {
    return this.serialize(sessionId, async () => {
      const readyOwner = this.inputReadySessions.get(sessionId)
      const automaticOwner = this.automaticStartupSessions.get(sessionId)
      const expected =
        readyOwner ?? automaticOwner ?? this.knownOwners.get(sessionId)
      if (!expected) return false
      const current =
        (await this.owner(sessionId, expected.target, true)) ??
        (await this.owner(sessionId, undefined, true))
      if (current) {
        this.knownOwners.set(sessionId, current)
        if (
          current.target === expected.target &&
          current.rootPid === expected.rootPid
        ) {
          const owners = readyOwner
            ? this.inputReadySessions
            : this.automaticStartupSessions
          owners.set(sessionId, current)
        }
        return false
      }
      if (!(await this.paneStopped(expected))) return false
      this.inputReadySessions.delete(sessionId)
      this.automaticStartupSessions.delete(sessionId)
      this.knownOwners.delete(sessionId)
      return true
    })
  }

  async probeStartup(
    sessionId: string,
    cwd: string,
    signal?: AbortSignal,
  ): Promise<void> {
    // A session of its own, so nothing appears among the windows people use,
    // and at the narrowest width Copilot's footer has broken at before.
    const name = `${PROBE_SESSION_PREFIX}${sessionId.slice(0, 8)}`
    if (signal?.aborted) throw new Error('The probe was cancelled before it started')
    const copilot = process.env.COPILOT_BIN?.trim() || '/usr/local/bin/copilot'
    const [target, panePid] = (await execFileAsync('tmux', [
      'new-session', '-d', '-P', '-F', '#{pane_id}\t#{pane_pid}', '-s', name,
      '-x', String(PROBE_COLUMNS), '-y', String(PROBE_ROWS), '-c', cwd,
      '-e', 'COLORTERM=truecolor',
      copilot, '--yolo', '--session-id', sessionId,
    ])).stdout.trim().split('\t')
    let owner: TerminalOwner | undefined
    let failure: Error | undefined
    try {
      // Cancelling ends the probes it can see, and one launched while it was
      // looking is not among them; this one ends itself instead.
      if (signal?.aborted) throw new Error('The probe was cancelled as it started')
      for (let attempt = 0; attempt < 100 && !owner; attempt += 1) {
        owner = await this.owner(sessionId, target)
        if (!owner) await new Promise((resolve) => setTimeout(resolve, 100))
      }
      if (!owner) throw new Error('Copilot did not start in its tmux session')
      this.automaticStartupSessions.set(sessionId, owner)
      let startup = await waitForTerminalStartup(owner.target, true)
      if (startup === 'action-required') {
        // The probe runs in a folder of its own, which Copilot asks to trust.
        // Answered the way a person would be offered it: for this session.
        const permission = await this.pendingPermission(sessionId)
        if (!permission?.title.startsWith('Trust folder for this session:')) {
          throw new Error(
            permission
              ? `Copilot asked something the probe does not answer: ${permission.title}`
              : 'Copilot is showing a prompt the app does not recognise',
          )
        }
        if (!(await this.replyPermission(sessionId, permission, 'terminal:allow'))) {
          throw new Error('The folder-trust prompt could not be answered')
        }
        // Copilot takes a moment to act on the answer, and until it does the
        // prompt it answered is still on screen.
        const answered = Date.now() + PROBE_ANSWER_TIMEOUT_MS
        while ((await this.pendingPermission(sessionId))?.requestId === permission.requestId) {
          if (Date.now() > answered) throw new Error('The folder-trust prompt stayed open after it was answered')
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
        startup = await waitForTerminalStartup(owner.target, true)
      }
      if (startup !== 'ready') {
        throw new Error('Copilot is showing a prompt after folder trust was answered')
      }
    } catch (error) {
      const pane = await capturePane(target).catch(() => '')
      const shown = pane.split('\n').map((line) => line.trimEnd()).filter(Boolean).slice(-8).join('\n')
      failure = new Error(
        `${error instanceof Error ? error.message : String(error)}${shown ? `\n${shown}` : ''}`,
        { cause: error },
      )
    }
    this.inputReadySessions.delete(sessionId)
    this.automaticStartupSessions.delete(sessionId)
    this.knownOwners.delete(sessionId)
    // Copilot writes its session files as it shuts down, so they are only the
    // caller's to remove once it has gone.
    const pids = [Number(panePid), ...(owner ? [owner.pid, owner.rootPid] : [])]
      .filter((pid) => Number.isInteger(pid) && pid > 0)
    const leftBehind = await endProbeSession(name, pids)
    if (leftBehind) {
      throw new Error(failure ? `${leftBehind}. ${failure.message}` : leftBehind, { cause: failure })
    }
    if (failure) throw failure
  }

  async endLeftoverProbes(): Promise<string[]> {
    let listed = ''
    try {
      listed = (await execFileAsync('tmux', [
        'list-panes', '-a', '-F', '#{session_name}\t#{pane_pid}\t#{pane_start_command}',
      ])).stdout
    } catch (error) {
      if (tmuxNotInstalled(error) || (await noTmuxServer(error))) return []
      throw error
    }
    const probes = new Map<string, { pids: number[]; sessionId?: string }>()
    for (const line of listed.split('\n')) {
      const [name, pid, command = ''] = line.split('\t')
      if (!name?.startsWith(PROBE_SESSION_PREFIX)) continue
      const probe = probes.get(name) ?? { pids: [] }
      probe.pids.push(Number(pid))
      probe.sessionId ??= /--session-id\s+([0-9a-f-]{36})/iu.exec(command)?.[1]
      probes.set(name, probe)
    }
    for (const [name, probe] of probes) {
      const leftBehind = await endProbeSession(name, probe.pids)
      if (leftBehind) throw new Error(leftBehind)
    }
    return [...probes.values()].flatMap((probe) => probe.sessionId ? [probe.sessionId] : [])
  }

  async rename(sessionId: string, title: string): Promise<boolean> {
    return this.serialize(sessionId, async () => {
      const target = await this.boundTarget(sessionId)
      if (!target) {
        return false
      }
      const windowName = safeWindowName(title)
      const currentName = (
        await execFileAsync('tmux', [
          'display-message',
          '-p',
          '-t',
          target,
          '#{window_name}',
        ])
      ).stdout.trim()
      if (currentName === windowName) {
        return true
      }
      await execFileAsync('tmux', [
        'set-option',
        '-w',
        '-t',
        target,
        'automatic-rename',
        'off',
      ])
      await execFileAsync('tmux', ['rename-window', '-t', target, windowName])
      return true
    })
  }

  async configure(
    sessionId: string,
    cwd: string,
    input: ConfigureRuntimeInput,
  ): Promise<boolean> {
    return this.serialize(sessionId, async () => {
      const resolvedCwd = await realpath(cwd)
      if (!(await stat(resolvedCwd)).isDirectory()) {
        throw new Error('Terminal working directory is not a folder')
      }
      const owner = await this.boundOwner(sessionId)
      if (!owner) {
        return false
      }
      const originalCommand = await processCommand(owner.pid)
      const originalCwd = await readlink(`/proc/${owner.pid}/cwd`)
      const command = await copilotCommand(owner.pid, sessionId, input)
      this.inputReadySessions.delete(sessionId)
      this.automaticStartupSessions.delete(sessionId)
      try {
        await execFileAsync('tmux', [
          'respawn-pane',
          '-k',
          '-t',
          owner.target,
          '-c',
          resolvedCwd,
          ...command,
        ])
        const nextOwner = await this.waitForNewOwner(
          sessionId,
          owner.pid,
          owner.target,
        )
        this.automaticStartupSessions.set(sessionId, {
          pid: nextOwner.pid,
          target: nextOwner.target,
          rootPid: nextOwner.rootPid,
        })
      } catch (error) {
        try {
          await execFileAsync('tmux', [
            'respawn-pane',
            '-k',
            '-t',
            owner.target,
            '-c',
            originalCwd,
            ...originalCommand,
          ])
          const restoredOwner = await this.waitForNewOwner(
            sessionId,
            owner.pid,
            owner.target,
          )
          this.automaticStartupSessions.set(sessionId, {
            pid: restoredOwner.pid,
            target: restoredOwner.target,
            rootPid: restoredOwner.rootPid,
          })
        } catch (rollbackError) {
          throw new AggregateError(
            [error, rollbackError],
            'Runtime configuration failed and the terminal session could not be restored',
          )
        }
        throw error
      }
      return true
    })
  }

  async reset(
    sessionId: string,
    replacementId: string,
    cwd: string,
    input: ConfigureRuntimeInput | undefined,
    commitReplacement: () => Promise<void>,
  ): Promise<boolean> {
    return this.serialize(sessionId, async () => {
      const resolvedCwd = await realpath(cwd)
      if (!(await stat(resolvedCwd)).isDirectory()) {
        throw new Error('Terminal working directory is not a folder')
      }
      const owner = await this.boundOwner(sessionId)
      if (!owner) {
        return false
      }
      const originalCommand = await processCommand(owner.pid)
      const originalCwd = await readlink(`/proc/${owner.pid}/cwd`)
      const command = await copilotCommand(owner.pid, replacementId, input)
      this.inputReadySessions.delete(sessionId)
      this.inputReadySessions.delete(replacementId)
      this.automaticStartupSessions.delete(sessionId)
      this.automaticStartupSessions.delete(replacementId)
      try {
        await execFileAsync('tmux', [
          'respawn-pane',
          '-k',
          '-t',
          owner.target,
          '-c',
          resolvedCwd,
          ...command,
        ])
        const nextOwner = await this.waitForNewOwner(
          replacementId,
          owner.pid,
          owner.target,
        )
        // The old provider history must still exist until this commit accepts
        // the replacement; otherwise the original command cannot recover it.
        await commitReplacement()
        this.automaticStartupSessions.set(replacementId, {
          pid: nextOwner.pid,
          target: nextOwner.target,
          rootPid: nextOwner.rootPid,
        })
      } catch (error) {
        this.inputReadySessions.delete(replacementId)
        this.automaticStartupSessions.delete(replacementId)
        try {
          await execFileAsync('tmux', [
            'respawn-pane',
            '-k',
            '-t',
            owner.target,
            '-c',
            originalCwd,
            ...originalCommand,
          ])
          const restoredOwner = await this.waitForNewOwner(
            sessionId,
            owner.pid,
            owner.target,
          )
          this.automaticStartupSessions.set(sessionId, {
            pid: restoredOwner.pid,
            target: restoredOwner.target,
            rootPid: restoredOwner.rootPid,
          })
        } catch (rollbackError) {
          throw new AggregateError(
            [error, rollbackError],
            'Conversation clear failed and the original terminal session could not be restored',
          )
        }
        throw error
      }
      return true
    })
  }

  async stop(
    sessionId: string,
    confirm?: () => void | Promise<void>,
  ): Promise<boolean> {
    return this.serialize(sessionId, async () => {
      const owner = await this.boundOwner(sessionId)
      if (!owner) {
        this.inputReadySessions.delete(sessionId)
        this.automaticStartupSessions.delete(sessionId)
        // Already gone: the caller wanted nothing running for this session,
        // and nothing is.
        //
        // Discovery answers with nothing when it fails as well as when there
        // is nothing, and taking a failed look for proof recorded a session as
        // suspended while its terminal was still running. tmux is asked
        // directly, and only a server that is not there, or a pane list that
        // holds nothing for this session, settles it.
        return this.noPaneRemains()
      }
      // Confirmation is the last thing awaited. Anything after it -- even
      // looking the owner up again -- is another moment in which somebody at
      // the terminal can start a turn or detach a task, and the pane would
      // then go down on the strength of a check that is already out of date.
      await confirm?.()
      // The pane is named by its id, and tmux is asked to compare the process
      // itself before killing it, in one command. Reading the pid here and
      // killing on the strength of it would put the same gap back: a pane
      // respawned in between keeps its id, and the kill would take whatever
      // is running in it now.
      //
      // Killing the window rather than the pane would take any pane beside
      // it, which belongs to whoever split it there.
      // The pane's root is what tmux can compare, but it is not always the
      // session: Copilot can run beneath a persistent shell, exit while
      // confirmation is running, and leave that same shell starting something
      // else. The root would still match and the kill would take work that has
      // nothing to do with this session.
      //
      // Ended by signalling the process that is the session, not by naming a
      // pane. No arrangement of tmux commands is atomic here -- a target is
      // expanded before the condition runs, and the condition finishes before
      // the consequent begins -- so any of them can act on a pane that has
      // been respawned or handed to something else in between.
      //
      // A signal has no such gap. The kernel either delivers it to that exact
      // process or reports that it is gone, and nothing else can inherit its
      // identity. A pane whose root this was ends with it; one that was only
      // hosting it carries on, which is somebody's shell and not ours to
      // close.
      try {
        process.kill(owner.pid, 'SIGTERM')
      } catch (error) {
        // Already gone, which is the outcome being asked for.
        if ((error as NodeJS.ErrnoException).code !== 'ESRCH') {
          throw error
        }
      }
      // The pane is torn down asynchronously, and a resume that raced it would
      // find the old window and take it for the new one.
      //
      // This also answers a kill that tmux declined because the pane had
      // changed hands: the owner is still there, the wait runs out, and the
      // caller is told the window could not be closed rather than being told
      // that somebody else's work was ended.
      for (let attempt = 0; attempt < 50; attempt += 1) {
        if (await this.paneStopped(owner)) {
          this.inputReadySessions.delete(sessionId)
          this.automaticStartupSessions.delete(sessionId)
          return true
        }
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      return false
    })
  }

  /**
   * Whether this exact pane and this exact process are both gone.
   *
   * Asked of the two identities that were resolved before the teardown, not of
   * the world in general. Process discovery answers with nothing when it fails
   * as well as when there is nothing, and a surviving process that has become
   * detached from its pane's ancestry drops out of it too -- either way a
   * suspension was recorded while the runtime was still going, and a resume
   * then started a second owner for the same session.
   */
  private async paneStopped(owner: {
    pid: number
    target: string
  }): Promise<boolean> {
    // The process first, and always. A pane that has gone says nothing about a
    // process that outlived it or was moved out of it, and reporting that as
    // stopped recorded a suspension over a runtime that was still going --
    // after which a resume started a second owner for the same session.
    if (processIsAlive(owner.pid)) {
      return false
    }
    // The process has gone. Whether its pane is still there or not, the
    // session has stopped: a shell that outlives what it ran is not this
    // session running.
    return true
  }

  async restart(sessionId: string, cwd: string): Promise<boolean> {
    return this.serialize(sessionId, async () => {
      const owner = await this.boundOwner(sessionId)
      if (!owner) {
        return false
      }
      const command = await processCommand(owner.pid)
      this.inputReadySessions.delete(sessionId)
      this.automaticStartupSessions.delete(sessionId)
      await execFileAsync('tmux', [
        'respawn-pane',
        '-k',
        '-t',
        owner.target,
        '-c',
        cwd,
        ...command,
      ])
      const nextOwner = await this.waitForNewOwner(
        sessionId,
        owner.pid,
        owner.target,
      )
      this.automaticStartupSessions.set(sessionId, {
        pid: nextOwner.pid,
        target: nextOwner.target,
        rootPid: nextOwner.rootPid,
      })
      return true
    })
  }

  async pendingUserInput(
    sessionId: string,
  ): Promise<PendingUserInput | undefined> {
    const target = await this.boundTarget(sessionId)
    if (!target) {
      return undefined
    }
    const pane = (
      await execFileAsync('tmux', [
        'capture-pane',
        '-J',
        '-p',
        '-t',
        target,
        '-S',
        '-80',
      ])
    ).stdout
    return parseTerminalUserInput(pane)
  }

  async pendingPermission(
    sessionId: string,
  ): Promise<PendingPermission | undefined> {
    const target = await this.boundTarget(sessionId)
    if (!target) {
      return undefined
    }
    const pane = (
      await execFileAsync('tmux', [
        'capture-pane',
        '-J',
        '-p',
        '-t',
        target,
        '-S',
        '-80',
      ])
    ).stdout
    return parseTerminalPermission(pane)
  }

  async updateNotice(sessionId: string): Promise<string | undefined> {
    const target = await this.boundTarget(sessionId)
    if (!target) {
      return undefined
    }
    // Only the visible pane matters; the status bar is repainted at its
    // bottom, so the scrollback would just carry stale notices.
    const pane = (
      await execFileAsync('tmux', ['capture-pane', '-p', '-t', target])
    ).stdout
    return parseTerminalUpdateNotice(pane)
  }

  async replyPermission(
    sessionId: string,
    request: PendingPermission,
    optionId: string,
  ): Promise<boolean> {
    return this.serialize(sessionId, async () => {
      const owner = await this.boundOwner(sessionId)
      if (!owner) {
        return false
      }
      const pane = (
        await execFileAsync('tmux', [
          'capture-pane',
          '-J',
          '-p',
          '-t',
          owner.target,
          '-S',
          '-80',
        ])
      ).stdout
      const current = parseTerminalPermission(pane)
      if (!current || current.requestId !== request.requestId) {
        throw new Error('The terminal permission request is no longer active')
      }
      if (optionId === 'terminal:stop') {
        await execFileAsync('tmux', ['send-keys', '-t', owner.target, 'Escape'])
        return true
      }
      const choiceIndex =
        optionId === 'terminal:allow' || optionId === 'terminal:trust-once'
          ? 0
          : optionId === 'terminal:trust-always'
            ? 1
            : undefined
      if (choiceIndex === undefined) {
        throw new Error('The selected permission option is not available')
      }
      for (let index = 0; index < (current.choiceCount || 2); index += 1) {
        await execFileAsync('tmux', ['send-keys', '-t', owner.target, 'Up'])
        await new Promise((resolve) => setTimeout(resolve, 30))
      }
      for (let index = 0; index < choiceIndex; index += 1) {
        await execFileAsync('tmux', ['send-keys', '-t', owner.target, 'Down'])
        await new Promise((resolve) => setTimeout(resolve, 40))
      }
      await execFileAsync('tmux', ['send-keys', '-t', owner.target, 'Enter'])
      return true
    })
  }

  async replyUserInput(
    sessionId: string,
    request: PendingUserInput,
    answer: string,
    wasFreeform: boolean,
  ): Promise<boolean> {
    return this.serialize(sessionId, async () => {
      const owner = await this.boundOwner(sessionId)
      if (!owner) {
        return false
      }
      const pane = (
        await execFileAsync('tmux', [
          'capture-pane',
          '-J',
          '-p',
          '-t',
          owner.target,
          '-S',
          '-80',
        ])
      ).stdout
      const current = parseTerminalUserInput(pane)
      if (!current || current.requestId !== request.requestId) {
        throw new Error('The terminal question is no longer active')
      }
      const choiceIndex = current.choices.indexOf(answer)
      if (wasFreeform && !current.allowFreeform) {
        throw new Error('This question does not allow a freeform response')
      }
      if (!wasFreeform && choiceIndex < 0) {
        throw new Error('The selected answer is not available')
      }
      const resetCount =
        current.choices.length + (current.allowFreeform ? 1 : 0)
      for (let index = 0; index < resetCount; index += 1) {
        await execFileAsync('tmux', ['send-keys', '-t', owner.target, 'Up'])
        await new Promise((resolve) => setTimeout(resolve, 30))
      }
      const downCount = wasFreeform ? current.choices.length : choiceIndex
      for (let index = 0; index < downCount; index += 1) {
        await execFileAsync('tmux', ['send-keys', '-t', owner.target, 'Down'])
        await new Promise((resolve) => setTimeout(resolve, 40))
      }
      if (wasFreeform) {
        const buffer = `agentic-remote-answer-${randomUUID()}`
        await execFileAsync('tmux', [
          'set-buffer',
          '-b',
          buffer,
          '--',
          answer,
        ])
        await execFileAsync('tmux', [
          'paste-buffer',
          '-p',
          '-d',
          '-b',
          buffer,
          '-t',
          owner.target,
        ])
      }
      await execFileAsync('tmux', ['send-keys', '-t', owner.target, 'Enter'])
      return true
    })
  }

  async capture(sessionId: string): Promise<string | undefined> {
    const readyOwner = this.inputReadySessions.get(sessionId)
    const automaticOwner = this.automaticStartupSessions.get(sessionId)
    const expectedTarget = readyOwner?.target ?? automaticOwner?.target
    const owner = expectedTarget
      ? await this.owner(sessionId, expectedTarget)
      : undefined
    const target =
      owner?.target ?? (expectedTarget ? undefined : await this.target(sessionId))
    if (!target) {
      return undefined
    }
    try {
      return await captureTerminal(target, 200)
    } catch {
      return undefined
    }
  }

  async canHandleStartupPrompt(
    sessionId: string,
    pane: string,
  ): Promise<boolean> {
    const automaticOwner = this.automaticStartupSessions.get(sessionId)
    const owner = await this.owner(sessionId, automaticOwner?.target)
    return (
      owner !== undefined &&
      automaticOwner?.rootPid === owner.rootPid &&
      automaticOwner.target === owner.target &&
      isTerminalDesktopInstallPrompt(pane)
    )
  }

  ownsStartupPrompt(sessionId: string): boolean {
    return this.automaticStartupSessions.has(sessionId)
  }

  async inputReady(sessionId: string): Promise<boolean> {
    const owner = await this.boundOwner(sessionId, true)
    if (!owner) {
      return false
    }
    const pane = await capturePane(owner.target)
    return terminalInputReady(pane)
  }

  async resolveStartupPrompt(sessionId: string): Promise<boolean> {
    return this.serialize(sessionId, async () => {
      const readyOwner = this.inputReadySessions.get(sessionId)
      const automaticOwner = this.automaticStartupSessions.get(sessionId)
      const expectedTarget = automaticOwner?.target ?? readyOwner?.target
      let owner = await this.owner(sessionId, expectedTarget)
      if (
        owner &&
        readyOwner?.pid === owner.pid &&
        readyOwner.target === owner.target
      ) {
        return true
      }
      if (
        !owner &&
        expectedTarget
      ) {
        const freshOwner = await this.owner(sessionId, undefined, true)
        if (
          freshOwner &&
          automaticOwner?.target === freshOwner.target &&
          automaticOwner.rootPid === freshOwner.rootPid
        ) {
          owner = freshOwner
        } else if (freshOwner) {
          this.inputReadySessions.delete(sessionId)
          this.automaticStartupSessions.delete(sessionId)
          throw Object.assign(
            new Error(
              'The terminal session reopened in a different pane. Check it there before continuing startup.',
            ),
            { statusCode: 409 },
          )
        }
      }
      if (
        !owner ||
        automaticOwner?.rootPid !== owner.rootPid ||
        automaticOwner.target !== owner.target
      ) {
        return false
      }
      let validatedOwner = owner
      const validateOwner = async () => {
        const current = await this.owner(sessionId, owner.target, true)
        if (
          !current ||
          current.target !== owner.target ||
          current.rootPid !== owner.rootPid
        ) {
          throw Object.assign(
            new Error(
              'The terminal owner changed while its startup prompt was being resolved.',
            ),
            { statusCode: 409 },
          )
        }
        validatedOwner = current
      }
      const startup = await waitForTerminalStartup(
        owner.target,
        true,
        validateOwner,
      )
      if (startup !== 'ready') {
        return false
      }
      await validateOwner()
      this.inputReadySessions.set(sessionId, {
        pid: validatedOwner.pid,
        target: validatedOwner.target,
        rootPid: validatedOwner.rootPid,
      })
      this.automaticStartupSessions.delete(sessionId)
      return true
    })
  }

  async fillUserInputForm(
    sessionId: string,
    steps: TerminalFormStep[],
    form: TerminalFormIdentity,
    options?: TerminalFormReplyOptions,
  ): Promise<boolean> {
    return this.boundedFormReply(sessionId, form.fields.length, options, async (progress) => {
      const owner = await this.boundOwner(sessionId)
      if (
        !owner ||
        steps.length === 0 ||
        steps.length !== form.fields.length ||
        form.fields.length === 0 ||
        // Repeated titles make the focused field ambiguous, and the answer is
        // written per position, so the message path is used instead.
        new Set(form.fields).size !== form.fields.length
      ) {
        return false
      }
      return this.withFormViewport(sessionId, owner, form, progress, async ({ capture, press, paste }) => {
        let pane = await capture()
        // A form being open says nothing about which request it belongs to. The
        // request that was answered may have closed and another opened in its
        // place, so the fields on screen have to be the ones being answered.
        if (
          !parseTerminalFormPrompt(pane) ||
          !terminalFormShowsFields(pane, form)
        ) {
          return false
        }
        // The steps are written from the first field onwards, but an attached
        // client can leave any field focused. Walking focus back with shift+tab
        // is what stops the answers landing one field over.
        for (let attempt = 0; attempt < form.fields.length; attempt += 1) {
          const active = parseTerminalFormActiveField(pane, form)
          if (active === 0) {
            break
          }
          if (active === undefined) {
            return false
          }
          await press('BTab', active)
          // The CLI repaints on its own schedule, so the move is waited for
          // rather than assumed: reading too early would see the old field and
          // send another shift+tab, overshooting the one being aimed at.
          for (let settle = 0; settle < 20; settle += 1) {
            await new Promise((resolve) => setTimeout(resolve, 100))
            pane = await capture()
            if (parseTerminalFormActiveField(pane, form) !== active) {
              break
            }
          }
        }
        if (parseTerminalFormActiveField(pane, form) !== 0) {
          return false
        }
        const commitKeys = terminalFormCommitKeys(steps.length, steps)
        for (const [position, step] of steps.entries()) {
          if (step.kind === 'checklist') {
            const ticked = terminalChecklistState(await capture(), step.optionCount)
            if (!ticked) {
              // An attached terminal may have changed which rows are ticked.
              return false
            }
            for (let index = 0; index <= step.optionCount; index += 1) {
              await press('Up', position)
              await new Promise((resolve) => setTimeout(resolve, 25))
            }
            const wanted = new Set(step.selected)
            const lastChange = ticked.reduce(
              (furthest, isTicked, index) =>
                wanted.has(index) === isTicked ? furthest : index,
              -1,
            )
            for (let index = 0; index <= lastChange; index += 1) {
              if (wanted.has(index) !== ticked[index]) {
                await press('Space', position)
                await new Promise((resolve) => setTimeout(resolve, 35))
              }
              if (index < lastChange) {
                await press('Down', position)
                await new Promise((resolve) => setTimeout(resolve, 35))
              }
            }
          } else if (step.kind === 'select') {
            // Normalise first so a changed default cannot shift the selection.
            for (let index = 0; index <= step.optionCount; index += 1) {
              await press('Up', position)
              await new Promise((resolve) => setTimeout(resolve, 25))
            }
            for (let index = 0; index < step.index; index += 1) {
              await press('Down', position)
              await new Promise((resolve) => setTimeout(resolve, 35))
            }
          } else {
            // Ctrl+U removes a prefilled default before the new text is pasted.
            await press('C-u', position)
            await new Promise((resolve) => setTimeout(resolve, 35))
            if (step.value) {
              await paste(step.value, position)
              await new Promise((resolve) => setTimeout(resolve, 45))
            }
          }
          // A choice must be accepted before leaving it; text and checklist
          // values are already applied. The final acceptance submits the form.
          await press(commitKeys[position], position)
          await new Promise((resolve) => setTimeout(resolve, 90))
          if (position < steps.length - 1) {
            let arrived = false
            for (let attempt = 0; attempt < 20; attempt += 1) {
              pane = await capture()
              if (parseTerminalFormActiveField(pane, form) === position + 1) {
                arrived = true
                break
              }
              await new Promise((resolve) => setTimeout(resolve, 100))
            }
            if (!arrived) {
              return false
            }
          }
        }
        return submitTerminalForm(capture, (ms) =>
          new Promise((resolve) => setTimeout(resolve, ms)),
        )
      })
    })
  }

  async dismissUserInput(
    sessionId: string,
    form?: TerminalFormIdentity,
    action: 'cancel' | 'decline' = 'cancel',
    options?: TerminalFormReplyOptions,
  ): Promise<boolean> {
    if (form && form.fields.length > 0) {
      return this.boundedFormReply(sessionId, form.fields.length, options, async (progress) => {
        const owner = await this.boundOwner(sessionId)
        if (!owner) {
          return false
        }
        return this.withFormViewport(sessionId, owner, form, progress, async ({ capture, press }) => {
          await press(action === 'decline' ? 'C-d' : 'Escape')
          return submitTerminalForm(capture, (ms) =>
            new Promise((resolve) => setTimeout(resolve, ms)),
          )
        })
      })
    }
    return this.serialize(sessionId, async () => {
      const owner = await this.boundOwner(sessionId)
      if (!owner) {
        return false
      }
      await execFileAsync('tmux', [
        'send-keys',
        '-t',
        owner.target,
        action === 'decline' ? 'C-d' : 'Escape',
      ])
      return true
    })
  }

  /**
   * Runs one form reply against a single deadline that starts before it waits
   * behind other terminal work. The caller is answered by that deadline at the
   * latest, with an outcome taken from how far the reply got. The reply stops
   * sending keys once the deadline passes, and a viewport restoration it has
   * started keeps the session serialized until it finishes.
   */
  private boundedFormReply(
    sessionId: string,
    fieldCount: number,
    options: TerminalFormReplyOptions | undefined,
    operation: (progress: FormReplyProgress) => Promise<boolean>,
  ): Promise<boolean> {
    const progress: FormReplyProgress = {
      // A caller's deadline may shorten this reply's budget, never extend it.
      deadline: Math.min(
        options?.deadline ?? Infinity,
        Date.now() + terminalFormReplyBudget(fieldCount),
      ),
      started: false,
      expired: false,
      committed: false,
      closed: false,
    }
    const reply = this.serialize(sessionId, async () => {
      // A reply whose deadline passed while it was queued must never begin.
      if (progress.expired || Date.now() >= progress.deadline) {
        progress.expired = true
        throw formReplyExpired(progress)
      }
      progress.started = true
      return operation(progress)
    })
    return new Promise<boolean>((resolve, reject) => {
      const timer = setTimeout(() => {
        progress.expired = true
        reject(formReplyExpired(progress))
      }, Math.max(0, progress.deadline - Date.now()))
      reply.then(resolve, reject).finally(() => clearTimeout(timer))
    })
  }

  private async readFormViewport(owner: TerminalOwner): Promise<FormViewport> {
    const [geometry, policy, clients] = await Promise.all([
      execFileAsync('tmux', [
        'display-message', '-p', '-t', owner.target,
        '#{window_id}\t#{pane_id}\t#{pane_pid}\t#{window_width}\t#{window_height}\t#{window_panes}\t#{window_linked}\t#{window-size}',
      ], { timeout: 2_000 }),
      execFileAsync('tmux', ['show-options', '-wqv', '-t', owner.target, 'window-size'], { timeout: 2_000 }),
      execFileAsync('tmux', [
        'list-clients', '-t', owner.target,
        '-F', '#{client_name}\t#{client_created}\t#{client_width}\t#{client_height}',
      ], { timeout: 2_000 }),
    ])
    const [window, pane, pid, width, height, panes, linked, effective] = geometry.stdout.trim().split('\t')
    const localPolicy = policy.stdout.trim()
    if (!/^@\d+$/.test(window) || !/^%\d+$/.test(pane) ||
        ![pid, width, height, panes, linked].every((value) => /^\d+$/.test(value)) ||
        !['manual', 'latest', 'largest', 'smallest'].includes(effective) ||
        !['', 'manual', 'latest', 'largest', 'smallest'].includes(localPolicy)) {
      throw new Error('Unable to identify the terminal window size and policy')
    }
    return {
      window, pane, pid: Number(pid), width: Number(width), height: Number(height),
      panes: Number(panes), linked: Number(linked), policy: effective, localPolicy,
      clients: clients.stdout.trim().split('\n').sort().join('\n'),
    }
  }

  private async changeFormViewport(
    viewport: FormViewport,
    dimensions: Pick<FormViewport, 'width' | 'height'>,
    restore = false,
    policyOnly = false,
  ): Promise<void> {
    const expected = {
      window_id: viewport.window, pane_id: viewport.pane, pane_pid: viewport.pid,
      window_width: viewport.width, window_height: viewport.height,
      window_panes: 1, window_linked: 0, 'window-size': viewport.policy,
    }
    const guard = Object.entries(expected).map(([key, value]) => `#{==:#{${key}},${value}}`)
      .reduce((left, right) => `#{&&:${left},${right}}`)
    const policy = viewport.localPolicy
      ? `set-option -w -t ${viewport.window} window-size ${viewport.localPolicy}`
      : `set-option -wu -t ${viewport.window} window-size`
    const resize =
      `resize-window -t ${viewport.window} -x ${dimensions.width} -y ${dimensions.height}`
    const change = restore && policyOnly ? policy : `${resize}${restore ? ` ; ${policy}` : ''}`
    const result = await execFileAsync('tmux', [
      'if-shell', '-F', '-t', viewport.pane, guard,
      `${change} ; display-message -p resized`,
      'display-message -p changed',
    ], { timeout: 2_000 })
    if (result.stdout.trim() !== 'resized') {
      throw new Error('The terminal window changed before its size could be updated')
    }
  }

  private async withFormViewport(
    sessionId: string,
    owner: TerminalOwner,
    form: TerminalFormIdentity,
    progress: FormReplyProgress,
    operation: (controls: {
      capture: () => Promise<string>
      press: (key: string, field?: number) => Promise<void>
      paste: (value: string, field: number) => Promise<void>
    }) => Promise<boolean>,
  ): Promise<boolean> {
    let original: FormViewport | undefined
    let expanded: FormViewport | undefined
    let attempted = false
    let result = false
    let failure: unknown
    const processStart = async () => {
      const data = await readFile(`/proc/${owner.pid}/stat`, 'utf8')
      return data.slice(data.lastIndexOf(')') + 2).split(' ')[19]
    }
    const started = await processStart()
    // Checked immediately before every capture, resize, and keystroke, so a
    // reply whose deadline has passed can no longer change the terminal.
    const live = () => {
      if (progress.expired || Date.now() >= progress.deadline) throw new FormReplyDeadlineError()
    }
    const validateOwner = async () => {
      const current = await this.formOwner(sessionId, owner)
      if (!current || current.pid !== owner.pid || current.rootPid !== owner.rootPid ||
          await processStart() !== started) {
        throw new Error('The terminal owner changed while answering its form')
      }
    }
    const capture = async () => {
      live()
      await validateOwner()
      if (expanded && !sameViewport(await this.readFormViewport(owner), expanded)) {
        throw new Error('The terminal viewport changed while its form was being inspected')
      }
      return (await execFileAsync('tmux', [
        'capture-pane', '-J', '-p', '-t', owner.target, '-S', '-40',
      ], { timeout: 2_000, maxBuffer: 1024 * 1024 })).stdout
    }
    const sameViewport = (left: FormViewport, right: FormViewport) =>
      Object.keys(left).every((key) => left[key as keyof FormViewport] === right[key as keyof FormViewport])
    const restoreViewport = async (previous: FormViewport, expected: FormViewport) => {
      await validateOwner()
      const current = await this.readFormViewport(owner)
      if (!sameViewport({ ...current, clients: expected.clients }, expected)) {
        throw new Error('Terminal sizing changed externally; the newer size or policy was not overwritten')
      }
      await validateOwner()
      // A newly sized attached client owns automatic dimensions. Relinquish
      // our manual override without forcing the old client dimensions back.
      await this.changeFormViewport(
        { ...expected, localPolicy: previous.localPolicy },
        { width: previous.width, height: previous.height },
        true,
        current.clients !== expected.clients && previous.policy !== 'manual',
      )
    }
    const validateInput = async (field?: number) => {
      if (expanded && !sameViewport(await this.readFormViewport(owner), expanded)) {
        throw new Error('The terminal size, layout, client, or policy changed while answering its form')
      }
      const pane = await capture()
      if (!terminalFormShowsFields(pane, form) ||
          (field !== undefined && parseTerminalFormActiveField(pane, form) !== field)) {
        throw new Error('The terminal is no longer showing the exact question and field being answered')
      }
      await validateOwner()
    }
    const sendInput = async (command: string, committing = false) => {
      const conditions = [
        `#{==:#{pane_id},${owner.target}}`,
        `#{==:#{pane_pid},${owner.rootPid}}`,
        ...(expanded ? [
          `#{==:#{window_id},${expanded.window}}`,
          `#{==:#{window_width},${expanded.width}}`,
          `#{==:#{window_height},${expanded.height}}`,
          '#{==:#{window_panes},1}',
          '#{==:#{window_linked},0}',
          '#{==:#{window-size},manual}',
        ] : []),
      ]
      live()
      if (committing) attempted = progress.committed = true
      const sent = await execFileAsync('tmux', [
        'if-shell', '-F', '-t', owner.target,
        conditions.reduce((left, right) => `#{&&:${left},${right}}`),
        `${command} ; display-message -p sent`, 'display-message -p changed',
      ], { timeout: 2_000 })
      if (sent.stdout.trim() !== 'sent') {
        if (committing) attempted = progress.committed = false
        throw new Error('The terminal owner or viewport changed immediately before keyboard input')
      }
    }
    try {
      let pane = await capture()
      if (!terminalFormShowsFields(pane, form)) {
        const promptVisible = parseTerminalFormPrompt(pane)
        const clippedVertically =
          !promptVisible && hasClippedTerminalFormFooter(pane)
        const clippedHorizontally =
          promptVisible && (
            hasClippedTerminalFormTabs(pane, form) ||
            hasTerminalFormQuestionReflowCandidate(pane, form)
          )
        if (!clippedVertically && !clippedHorizontally) return false
        original = await this.readFormViewport(owner)
        if (
          original.panes !== 1 ||
          original.linked !== 0 ||
          original.pid !== owner.rootPid
        ) {
          return false
        }
        const width =
          clippedHorizontally && original.width < MAX_FORM_VIEWPORT_WIDTH
            ? MAX_FORM_VIEWPORT_WIDTH
            : original.width
        const height =
          clippedVertically && original.height < MAX_FORM_VIEWPORT_HEIGHT
            ? MAX_FORM_VIEWPORT_HEIGHT
            : original.height
        if (width === original.width && height === original.height) return false
        await validateOwner()
        if (!sameViewport(await this.readFormViewport(owner), original)) return false
        await validateOwner()
        live()
        expanded = {
          ...original,
          width,
          height,
          policy: 'manual',
          localPolicy: 'manual',
        }
        await this.changeFormViewport(original, expanded)
        for (let attempt = 0; attempt < 30; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          pane = await capture()
          if (
            terminalFormShowsFields(pane, form) ||
            (expanded.width < MAX_FORM_VIEWPORT_WIDTH &&
              hasTerminalFormQuestionReflowCandidate(pane, form))
          ) break
        }
        const reflowWidths = original.width <= MAX_FORM_VIEWPORT_WIDTH
          ? [MAX_FORM_VIEWPORT_WIDTH]
          : []
        for (
          let width = MAX_FORM_VIEWPORT_WIDTH - FORM_QUESTION_REFLOW_WIDTH_STEP;
          width >= Math.max(MIN_FORM_QUESTION_REFLOW_WIDTH, original.width);
          width -= FORM_QUESTION_REFLOW_WIDTH_STEP
        ) {
          reflowWidths.push(width)
        }
        for (const width of reflowWidths) {
          const previous: FormViewport | undefined = expanded
          if (!previous) throw new Error('The inspected terminal viewport is unavailable')
          if (terminalFormShowsFields(pane, form)) break
          if (width === previous.width) continue
          const questionReflow = hasTerminalFormQuestionReflowCandidate(pane, form)
          if (
            !parseTerminalFormPrompt(pane) ||
            (width === MAX_FORM_VIEWPORT_WIDTH
              ? !questionReflow && !hasClippedTerminalFormTabs(pane, form)
              : !questionReflow)
          ) break
          await validateOwner()
          if (!sameViewport(await this.readFormViewport(owner), previous)) {
            throw new Error(
              'The terminal viewport changed before its form could be widened',
            )
          }
          await validateOwner()
          live()
          const next: FormViewport = { ...previous, width }
          expanded = next
          await this.changeFormViewport(previous, next)
          for (let attempt = 0; attempt < 30; attempt += 1) {
            await new Promise((resolve) => setTimeout(resolve, 100))
            pane = await capture()
            if (
              terminalFormShowsFields(pane, form) ||
              (terminalBoxWrap(terminalControlLines(pane)).width === width &&
                hasTerminalFormQuestionReflowCandidate(pane, form))
            ) break
          }
        }
      }
      if (terminalFormShowsFields(pane, form)) {
        result = await operation({
          capture,
          press: async (key, field) => {
            await validateInput(field)
            await sendInput(
              `send-keys -t ${owner.target} ${key}`,
              key === 'Escape' || key === 'C-d' ||
                (key === 'Enter' && (field === undefined || field === form.fields.length - 1)),
            )
          },
          paste: async (value, field) => {
            live()
            const buffer = `agentic-remote-form-${randomUUID()}`
            await execFileAsync('tmux', ['set-buffer', '-b', buffer, '--', value], { timeout: 2_000 })
            try {
              await validateInput(field)
              await sendInput(`paste-buffer -p -b ${buffer} -t ${owner.target}`)
            } finally {
              await execFileAsync('tmux', ['delete-buffer', '-b', buffer], { timeout: 2_000 })
            }
          },
        })
        progress.closed = result
      }
    } catch (error) {
      failure = error
    } finally {
      if (original && expanded) {
        try {
          await restoreViewport(original, expanded)
        } catch (error) {
          failure = failure
            ? new AggregateError([failure, error], 'Form operation and terminal size restoration both failed')
            : error
        }
      }
    }
    if (failure || (attempted && !result)) {
      const outcome = result ? 'submitted' : attempted ? 'uncertain' : 'not-submitted'
      throw new TerminalFormReplyError(
        outcome === 'not-submitted' && failure instanceof FormReplyDeadlineError
          ? FORM_REPLY_NOT_SUBMITTED_TIMEOUT
          : `${result ? 'The terminal reply was submitted, but cleanup failed'
            : attempted ? 'The terminal reply may have been submitted; do not resend it'
              : 'The terminal form could not be safely answered'}: ${
            failure instanceof Error ? failure.message : 'completion was not confirmed'
          }`,
        outcome,
        failure ? { cause: failure } : undefined,
      )
    }
    return result
  }

  async cancel(
    sessionId: string,
    options: TerminalCancelOptions = {},
  ): Promise<boolean> {
    return this.serialize(sessionId, async () => {
      const target = await this.boundTarget(sessionId)
      if (!target) {
        return false
      }
      const pane = await capturePane(target)
      if (
        isTerminalOverlay(pane) ||
        isTerminalSessionInUsePrompt(pane) ||
        parseTerminalPermission(pane) ||
        parseTerminalUserInput(pane) ||
        parseTerminalFormPrompt(pane)
      ) {
        await execFileAsync('tmux', ['send-keys', '-t', target, 'Escape'])
      } else if (
        !this.interruptedRecently(sessionId) &&
        (isTerminalAgentWorking(pane) ||
          (await this.workingByEventLog(pane, options)))
      ) {
        await execFileAsync('tmux', ['send-keys', '-t', target, '-H', '03'])
        this.interruptedAt.set(sessionId, Date.now())
      }
      return true
    })
  }

  // The footer can still offer the interrupt key for a moment after the
  // first Ctrl+C has ended the turn.
  private interruptedRecently(sessionId: string): boolean {
    const last = this.interruptedAt.get(sessionId)
    return last !== undefined && Date.now() - last < INTERRUPT_REPEAT_MS
  }

  // Copilot can stop offering its interrupt key, or word it differently, in
  // any release. Its event log still says whether a turn is open, so Stop
  // asks it -- but never over a prompt the pane shows idle.
  private async workingByEventLog(
    pane: string,
    options: TerminalCancelOptions,
  ): Promise<boolean> {
    if (
      !options.turnOpen ||
      isTerminalVisiblyIdle(pane) ||
      !(await options.turnOpen().catch(() => false))
    ) {
      return false
    }
    console.warn(
      'Copilot did not offer its interrupt key while its event log had a turn open; interrupting anyway',
    )
    return true
  }

  async send(
    sessionId: string,
    content: string,
    enqueue: boolean,
    options: TerminalSendOptions = {},
  ): Promise<boolean> {
    return this.sendInternal(sessionId, content, enqueue, options.idleOnly === true, options)
  }

  async sendWhenIdle(sessionId: string, content: string): Promise<boolean> {
    return this.sendInternal(sessionId, content, false, true)
  }

  private async clearComposerForReplacement(
    sessionId: string,
    owner: TerminalOwner,
    pane: string,
  ): Promise<string> {
    const readable = composerText(pane)
    if (readable === undefined) {
      throw new TerminalDraftConflictError('composer-unreadable')
    }
    if (!composerHoldsText(pane)) {
      return pane
    }
    if (
      isTerminalOverlay(pane) ||
      parseTerminalPermission(pane) ||
      parseTerminalUserInput(pane) ||
      parseTerminalFormPrompt(pane) ||
      isTerminalAgentWorking(pane)
    ) {
      throw new TerminalDraftConflictError('changed-before-clear')
    }
    const currentOwner = await this.owner(sessionId, owner.target, true)
    if (
      !currentOwner ||
      currentOwner.pid !== owner.pid ||
      currentOwner.rootPid !== owner.rootPid ||
      currentOwner.target !== owner.target
    ) {
      throw new TerminalDraftConflictError('owner-changed-before-clear')
    }
    const currentPane = await capturePane(owner.target)
    if (
      composerText(currentPane) === undefined ||
      !terminalInputReady(currentPane) ||
      isTerminalOverlay(currentPane) ||
      parseTerminalPermission(currentPane) ||
      parseTerminalUserInput(currentPane) ||
      parseTerminalFormPrompt(currentPane) ||
      isTerminalAgentWorking(currentPane)
    ) {
      throw new TerminalDraftConflictError('changed-before-clear')
    }
    if (!composerHoldsText(currentPane)) {
      return currentPane
    }
    const conditions = [
      `#{==:#{pane_id},${owner.target}}`,
      `#{==:#{pane_pid},${owner.rootPid}}`,
    ]
    const cleared = await execFileAsync('tmux', [
      'if-shell',
      '-F',
      '-t',
      owner.target,
      conditions.reduce((left, right) => `#{&&:${left},${right}}`),
      `send-keys -t ${owner.target} C-u ; display-message -p cleared`,
      'display-message -p changed',
    ], { timeout: 2_000 })
    if (cleared.stdout.trim() !== 'cleared') {
      throw new TerminalDraftConflictError('owner-changed-before-clear')
    }
    let previousEmpty: string | undefined
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 50))
      const clearedPane = await capturePane(owner.target, 2_000)
      const text = composerText(clearedPane)
      if (
        text !== undefined &&
        terminalInputReady(clearedPane) &&
        !composerHoldsText(clearedPane)
      ) {
        if (text === previousEmpty) {
          const finalOwner = await this.owner(sessionId, owner.target, true)
          if (
            finalOwner &&
            finalOwner.pid === owner.pid &&
            finalOwner.rootPid === owner.rootPid &&
            finalOwner.target === owner.target
          ) {
            return clearedPane
          }
          throw new TerminalDraftConflictError('owner-changed-after-clear')
        }
        previousEmpty = text
      } else {
        previousEmpty = undefined
      }
    }
    throw new TerminalDraftConflictError('clear-unconfirmed')
  }

  private async sendInternal(
    sessionId: string,
    content: string,
    enqueue: boolean,
    idleOnly: boolean,
    options: TerminalSendOptions = {},
  ): Promise<boolean> {
    return this.serialize(sessionId, async () => {
      const readyOwner = this.inputReadySessions.get(sessionId)
      const automaticOwner = this.automaticStartupSessions.get(sessionId)
      const expectedTarget = readyOwner?.target ?? automaticOwner?.target
      const owner = await this.owner(
        sessionId,
        expectedTarget,
      )
      if (!owner) {
        this.inputReadySessions.delete(sessionId)
        this.automaticStartupSessions.delete(sessionId)
        if (expectedTarget && (await this.owner(sessionId, undefined, true))) {
          throw Object.assign(
            new Error(
              'The terminal session reopened in a different pane. Check it there before sending another message.',
            ),
            { statusCode: 409 },
          )
        }
        return false
      }
      if (
        readyOwner?.pid === owner.pid &&
        readyOwner.target === owner.target
      ) {
        const pane = await capturePane(owner.target)
        if (
          isTerminalOverlay(pane) ||
          parseTerminalPermission(pane) ||
          parseTerminalUserInput(pane) ||
          parseTerminalFormPrompt(pane)
        ) {
          throw Object.assign(
            new Error(
              isTerminalSessionInUsePrompt(pane)
                ? 'Copilot needs confirmation to resume this session. Choose Resume anyway or Go back in the permission card.'
                : 'The terminal is waiting for user input. Answer it before sending a message.',
            ),
            { statusCode: 409 },
          )
        }
      } else {
        // Not seen ready by this process, as after a hub restart. A Copilot
        // that has been running a while has nothing left to open over its
        // prompt, so it is not held to the settling a fresh one needs.
        const settled = await this.ownerSettled(owner.pid)
        // Native-queued commands keep the full wait: Copilot queues them itself.
        const boundedSteer =
          settled &&
          !idleOnly &&
          !enqueue &&
          options.allowDuringAgentExecution === true
        let startup: Awaited<ReturnType<typeof waitForTerminalStartup>>
        try {
          startup = await waitForTerminalStartup(
            owner.target,
            automaticOwner?.pid === owner.pid &&
              automaticOwner.target === owner.target,
            async () => {
              const current = await this.owner(sessionId, owner.target, true)
              if (!current || current.pid !== owner.pid) {
                throw Object.assign(
                  new Error(
                    'The terminal owner changed while it was becoming ready.',
                  ),
                  { statusCode: 409 },
                )
              }
            },
            boundedSteer
              ? SETTLED_STEER_READY_TIMEOUT_MS
              : this.startupTimeoutMs,
            settled ? SETTLED_READY_FRAMES : undefined,
          )
        } catch (error) {
          const notReady =
            error instanceof Error && /did not become ready/i.test(error.message)
          if (idleOnly && notReady) {
            throw Object.assign(
              new Error(
                'The terminal is not ready for this input. Wait for its composer, or queue the message while the agent is working.',
              ),
              {
                statusCode: 409,
                uncertainDelivery: false,
                reasonCode: 'terminal-not-ready.queue',
              },
            )
          }
          if (boundedSteer && notReady && !options.replaceExistingInput) {
            throw Object.assign(
              new Error(
                'The terminal is not ready for this input. Wait for its composer, or queue the message while the agent is working.',
              ),
              {
                statusCode: 409,
                uncertainDelivery: false,
                reasonCode: 'terminal-not-ready.steer',
              },
            )
          }
          if (
            options.replaceExistingInput &&
            error instanceof Error &&
            /did not become ready/i.test(error.message)
          ) {
            throw new TerminalDraftConflictError('composer-not-ready')
          }
          throw error
        }
        if (startup !== 'ready') {
          const pane = await capturePane(owner.target)
          throw Object.assign(
            new Error(
              isTerminalSessionInUsePrompt(pane)
                ? 'Copilot needs confirmation to resume this session. Choose Resume anyway or Go back in the permission card.'
                : 'The terminal is waiting for user input. Answer it before sending a message.',
            ),
            { statusCode: 409 },
          )
        }
      }
      // What the pane already holds is not evidence that this message
      // arrived: the same text may have been sent before, and an earlier
      // large paste leaves a placeholder of its own.
      const confirmation = content.split('\n').at(-1) || content
      let paneBeforePaste = await capturePane(owner.target)
      // The previous submitted/queued prompt may still be awaiting repaint.
      // Wait briefly without typing, but never overwrite a draft that remains.
      for (
        let attempt = 0;
        attempt < 10 &&
        composerText(paneBeforePaste) !== undefined &&
        composerHoldsText(paneBeforePaste);
        attempt += 1
      ) {
        await new Promise((resolve) => setTimeout(resolve, 50))
        paneBeforePaste = await capturePane(owner.target)
      }
      let currentOwner = await this.owner(sessionId, owner.target, true)
      if (!currentOwner || currentOwner.pid !== owner.pid) {
        this.inputReadySessions.delete(sessionId)
        this.automaticStartupSessions.delete(sessionId)
        throw Object.assign(
          new Error(
            'The terminal owner changed while it was becoming ready. Check the terminal before sending this message again.',
          ),
          { statusCode: 409 },
        )
      }
      paneBeforePaste = await capturePane(currentOwner.target)
      const replacementComposerHasText =
        composerText(paneBeforePaste) !== undefined &&
        composerHoldsText(paneBeforePaste)
      if (
        options.replaceExistingInput &&
        (replacementComposerHasText || !terminalInputReady(paneBeforePaste)) &&
        !isTerminalOverlay(paneBeforePaste) &&
        !isTerminalAgentWorking(paneBeforePaste) &&
        !isTerminalSessionInUsePrompt(paneBeforePaste) &&
        !parseTerminalPermission(paneBeforePaste) &&
        !parseTerminalUserInput(paneBeforePaste) &&
        !parseTerminalFormPrompt(paneBeforePaste)
      ) {
        let replacementOwner = currentOwner
        let ready: Awaited<ReturnType<typeof waitForTerminalStartup>>
        try {
          ready = await waitForTerminalStartup(
            currentOwner.target,
            false,
            async () => {
              const latestOwner = await this.owner(
                sessionId,
                replacementOwner.target,
                true,
              )
              if (
                !latestOwner ||
                latestOwner.target !== replacementOwner.target ||
                latestOwner.rootPid !== replacementOwner.rootPid
              ) {
                throw Object.assign(
                  new Error(
                    'The terminal owner changed while replacement waited for its composer.',
                  ),
                  { statusCode: 409 },
                )
              }
              replacementOwner = latestOwner
            },
            isTerminalLoading(paneBeforePaste)
              ? TERMINAL_STARTUP_TIMEOUT_MS
              : this.replacementComposerTimeoutMs,
            REPLACEMENT_READY_FRAMES,
          )
        } catch (error) {
          if (
            error instanceof Error &&
            /did not become ready/i.test(error.message)
          ) {
            throw new TerminalDraftConflictError('composer-not-ready')
          }
          throw error
        }
        if (ready === 'ready') {
          currentOwner = replacementOwner
          paneBeforePaste = await capturePane(currentOwner.target)
        }
      }
      if (isTerminalSessionInUsePrompt(paneBeforePaste)) {
        throw Object.assign(
          new Error(
            'Copilot needs confirmation to resume this session. Choose Resume anyway or Go back in the permission card.',
          ),
          { statusCode: 409 },
        )
      }
      const existingInput =
        composerText(paneBeforePaste) !== undefined &&
        composerHoldsText(paneBeforePaste)
      if (existingInput && !options.replaceExistingInput) {
        throw new TerminalDraftConflictError('unsent-text')
      }
      if (isTerminalOverlay(paneBeforePaste)) {
        throw Object.assign(
          new Error(
            'The terminal is showing a full-screen view. Close it there, then send this again.',
          ),
          { statusCode: 409 },
        )
      }
      if (idleOnly && isTerminalAgentWorking(paneBeforePaste)) {
        throw Object.assign(new Error('The terminal started working before queued delivery; nothing was sent'), { statusCode: 409 })
      }
      const allowWorking =
        !idleOnly &&
        (enqueue || options.allowDuringAgentExecution === true)
      if (!terminalInputReady(paneBeforePaste, allowWorking)) {
        throw Object.assign(
          new Error(
            'The terminal is not ready for this input. Wait for its composer, or queue the message while the agent is working.',
          ),
          {
            statusCode: 409,
            uncertainDelivery: false,
            ...(idleOnly
              ? { reasonCode: 'terminal-not-ready.queue' }
              : allowWorking && !enqueue && !options.replaceExistingInput
                ? { reasonCode: 'terminal-not-ready.steer' }
                : {}),
          },
        )
      }
      this.inputReadySessions.set(sessionId, {
        pid: currentOwner.pid,
        target: currentOwner.target,
        rootPid: currentOwner.rootPid,
      })
      this.automaticStartupSessions.delete(sessionId)
      const buffer = `agentic-remote-${randomUUID()}`
      await execFileAsync('tmux', [
        'set-buffer',
        '-b',
        buffer,
        '--',
        content,
      ])
      try {
        if (existingInput) {
          paneBeforePaste = await this.clearComposerForReplacement(
            sessionId,
            currentOwner,
            paneBeforePaste,
          )
        }
        if (options.replaceExistingInput) {
          // With nothing cleared, the send keeps the working tolerance the
          // first readiness check granted; a cleared composer must be idle.
          const toleratesWorking = allowWorking && !existingInput
          const ownerBeforePaste = await this.owner(
            sessionId,
            currentOwner.target,
            true,
          )
          paneBeforePaste = await capturePane(currentOwner.target)
          if (
            !ownerBeforePaste ||
            ownerBeforePaste.pid !== currentOwner.pid ||
            ownerBeforePaste.rootPid !== currentOwner.rootPid ||
            ownerBeforePaste.target !== currentOwner.target ||
            composerText(paneBeforePaste) === undefined ||
            !terminalInputReady(paneBeforePaste, toleratesWorking) ||
            composerHoldsText(paneBeforePaste) ||
            isTerminalOverlay(paneBeforePaste) ||
            parseTerminalPermission(paneBeforePaste) ||
            parseTerminalUserInput(paneBeforePaste) ||
            parseTerminalFormPrompt(paneBeforePaste) ||
            (!toleratesWorking && isTerminalAgentWorking(paneBeforePaste))
          ) {
            throw new TerminalDraftConflictError('new-text')
          }
        }
        // The paste can reach the pane even if its acknowledgement is lost.
        // Preflight and buffer preparation above have not changed native input.
        let pasteAcknowledged = false
        try {
          await execFileAsync('tmux', [
            'paste-buffer',
            '-p',
            '-d',
            '-b',
            buffer,
            '-t',
            owner.target,
          ])
          pasteAcknowledged = true
          return await this.finishSend(
            owner.target,
            content,
            confirmation,
            paneBeforePaste,
            enqueue,
            idleOnly,
          )
        } catch (error) {
          if (!pasteAcknowledged && error && typeof error === 'object' &&
              'syscall' in error && typeof error.syscall === 'string' &&
              /^spawn(?: |$)/.test(error.syscall)) {
            throw error
          }
          if (
            error &&
            typeof error === 'object' &&
            'uncertainDelivery' in error
          ) {
            throw error
          }
          throw Object.assign(
            new Error(
              'The terminal may not have received the message, and the text may still be in the prompt. Check the terminal before sending it again.',
            ),
            { statusCode: 409, uncertainDelivery: true, cause: error },
          )
        }
      } finally {
        await execFileAsync('tmux', [
          'delete-buffer',
          '-b',
          buffer,
        ], { timeout: 2_000 }).catch(() => undefined)
      }
    })
  }

  private async finishSend(
    target: string,
    content: string,
    confirmation: string,
    paneBeforePaste: string,
    enqueue: boolean,
    idleOnly = false,
  ): Promise<boolean> {
      if (
        !(await waitForComposerPaste(
          target,
          paneBeforePaste,
          confirmation,
          content,
        )) &&
        !(await waitForComposerPaste(
          target,
          paneBeforePaste,
          confirmation,
          content,
          20,
        ))
      ) {
        // The prompt never showed the message, so pressing Enter would send
        // whatever it does hold and still be reported as delivered.
        //
        // Both waits failed. Never clear the composer or repeat the paste:
        // Reading the composer and then clearing it cannot be made one act:
        // whatever is read, a person at the terminal can type between the
        // reading and the keystroke, and Ctrl+U takes the whole composer.
        // Putting their text back is not possible either -- the pane shows a
        // wrapped, marker-prefixed rendering, and a large paste as a
        // placeholder, so what could be typed back is a different message.
        //
        // tmux accepted the paste whether or not it was ever seen to arrive,
        // and a loaded CLI can draw it after this has stopped looking, so the
        // text may well be sitting in the prompt. That is said plainly instead:
        // a message left behind is recoverable by the person looking at it,
        // and their own unsent writing destroyed by us is not.
        throw Object.assign(
          new Error(
            'The terminal did not receive the message, and the text may still be in the prompt. Check the terminal before sending it again.',
          ),
          // Said outright rather than left to be read back out of the wording.
          // Every failure after the buffer was accepted is uncertain in the
          // same way, and matching on the message recognised only this one.
          { statusCode: 409, uncertainDelivery: true },
        )
      }
      let paneTty = ''
      let restoreIxon = false
      if (enqueue) {
        paneTty = (
          await execFileAsync('tmux', [
            'display-message',
            '-p',
            '-t',
            target,
            '#{pane_tty}',
          ])
        ).stdout.trim()
        if (paneTty) {
          const terminalState = (
            await execFileAsync('stty', ['-F', paneTty, '-a'])
          ).stdout
          restoreIxon = /(^|[\s;])ixon([\s;]|$)/.test(terminalState)
          if (restoreIxon) {
            await execFileAsync('stty', ['-F', paneTty, '-ixon'])
          }
        }
      }
      try {
        if (idleOnly) {
          const current = await capturePane(target)
          if (isTerminalAgentWorking(current) || isTerminalOverlay(current)) {
            throw new Error('The terminal changed before queued submission')
          }
        }
        await execFileAsync(
          'tmux',
          enqueue
            ? ['send-keys', '-t', target, '-H', '11']
            : ['send-keys', '-t', target, 'Enter'],
        )
      } finally {
        if (restoreIxon && paneTty) {
          await execFileAsync('stty', ['-F', paneTty, 'ixon'])
        }
      }
      return true
  }

  private async ownerSettled(pid: number): Promise<boolean> {
    try {
      return Date.now() - (await processStartTimeMs(pid)) >= this.settledOwnerAgeMs
    } catch {
      return false
    }
  }

  private async target(
    sessionId: string,
    fresh = false,
  ): Promise<string | undefined> {
    return (await this.owner(sessionId, undefined, fresh))?.target
  }

  /**
   * Whether tmux itself says nothing is left running this session.
   *
   * Process discovery returning nothing is not the same as nothing running:
   * it answers with nothing when it cannot look. This asks the one thing that
   * can say for certain, and refuses when even that cannot be reached.
   */
  private async noPaneRemains(): Promise<boolean> {
    let listed = ''
    try {
      listed = (
        await execFileAsync('tmux', [
          'list-panes',
          '-a',
          '-F',
          '#{pane_pid}',
        ])
      ).stdout
    } catch (error) {
      // A stopped server means no pane; a missing socket alone does not.
      return noTmuxServer(error)
    }
    if (!listed.trim()) {
      return true
    }
    // Panes exist, so the question is whether one of them is this session's.
    // Process discovery answers with nothing when it cannot look, and asking
    // it again here read that as absence: no owner found, so reported stopped,
    // while the pane was still running. The pane list is asked instead, and it
    // has already been read successfully above.
    // Panes are running, and the only thing that could say this session is not
    // among them is process discovery -- which can succeed in part, finding one
    // session while a transient failure hides another. A list that is missing
    // this session is therefore not proof, so nothing here settles it.
    //
    // Refusing costs a suspension that has to be asked for again. Accepting
    // recorded a session as suspended while its terminal carried on, and a
    // resume then started a second owner for it.
    return false
  }

  private async owner(
    sessionId: string,
    expectedTarget?: string,
    fresh = false,
  ): Promise<TerminalOwner | undefined> {
    const candidates = (await this.activeProcesses(fresh)).filter(
      (candidate) => candidate.sessionId === sessionId,
    )
    for (const processInfo of candidates) {
      const pane = await tmuxTargetForPid(processInfo.pid)
      if (pane && (!expectedTarget || pane.target === expectedTarget)) {
        return {
          pid: processInfo.pid,
          target: pane.target,
          rootPid: pane.rootPid,
        }
      }
    }
    return undefined
  }

  private async formOwner(
    sessionId: string,
    expected: TerminalOwner,
  ): Promise<TerminalOwner | undefined> {
    if (!(await isDirectCopilotSessionProcess(expected.pid, sessionId))) {
      return this.owner(sessionId, expected.target, true)
    }
    const { stdout } = await execFileAsync('tmux', [
      'display-message', '-p', '-t', expected.target,
      '#{pane_id}\t#{pane_pid}',
    ], { timeout: 2_000 })
    return stdout.trim() === `${expected.target}\t${expected.rootPid}` &&
      (await processAncestors(expected.pid)).has(expected.rootPid)
      ? expected
      : undefined
  }

  private async boundOwner(
    sessionId: string,
    fresh = false,
  ): Promise<TerminalOwner | undefined> {
    const ready = this.inputReadySessions.get(sessionId)
    const automatic = this.automaticStartupSessions.get(sessionId)
    const expectedTarget = ready?.target ?? automatic?.target
    const owner = await this.owner(
      sessionId,
      expectedTarget,
      fresh,
    )
    if (owner || !expectedTarget) {
      return owner
    }
    if (await this.owner(sessionId, undefined, true)) {
      // The session moved to a pane this controller did not authorize. Refuse
      // the operation that observed the move, but release the dead binding so
      // a later operation can deliberately rediscover the replacement.
      this.inputReadySessions.delete(sessionId)
      this.automaticStartupSessions.delete(sessionId)
    }
    return undefined
  }

  private async boundTarget(
    sessionId: string,
    fresh = false,
  ): Promise<string | undefined> {
    return (await this.boundOwner(sessionId, fresh))?.target
  }

  private activeProcesses(
    fresh = false,
  ): ReturnType<typeof findActiveCopilotProcesses> {
    const now = Date.now()
    if (
      !fresh &&
      this.activeProcessCache &&
      this.activeProcessCache.expiresAt > now
    ) {
      return this.activeProcessCache.processes
    }
    const processes = findActiveCopilotProcesses()
    this.activeProcessCache = {
      expiresAt: now + 500,
      processes,
    }
    return processes
  }

  private async waitForNewOwner(
    sessionId: string,
    previousPid: number,
    expectedTarget: string,
  ): Promise<TerminalOwner> {
    for (let attempt = 0; attempt < 150; attempt += 1) {
      const owner = await this.owner(sessionId, expectedTarget)
      if (owner && owner.pid !== previousPid) {
        return owner
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    throw new Error('Copilot did not restart in the tmux pane')
  }

  private async createWindow(
    sessionId: string,
    cwd: string,
    title: string,
    allowAllPermissions: boolean,
    runtime?: SessionRuntimeInfo,
    resumeExisting = false,
  ): Promise<{ sessionName: string; windowId: string }> {
    const sessions = await listTmuxSessions()
    const configured = process.env.AGENTIC_REMOTE_TMUX_SESSION?.trim()
    const selected = configured
      ? sessions.find((session) => session.name === configured)
      : sessions.toSorted(
          (left, right) =>
            right.attached - left.attached || left.createdAt - right.createdAt,
        )[0]
    if (configured && !selected) {
      throw new Error(`Configured tmux session not found: ${configured}`)
    }
    const copilot = process.env.COPILOT_BIN?.trim() || '/usr/local/bin/copilot'
    const windowName = safeWindowName(title)
    const format = '#{session_name}\t#{window_id}'
    const command = [
      copilot,
      ...(allowAllPermissions ? ['--yolo'] : []),
      resumeExisting ? '--resume' : '--session-id',
      sessionId,
      ...(runtime?.model ? ['--model', runtime.model] : []),
      ...(runtime?.reasoningEffort
        ? ['--effort', runtime.reasoningEffort]
        : []),
      ...(runtime?.contextTier ? ['--context', runtime.contextTier] : []),
      ...(runtime?.mode ? ['--mode', runtime.mode] : []),
    ]
    // Copilot draws its composer with half-block glyphs when the terminal
    // advertises truecolor, and with plain rules when it does not. The frame
    // is what says the composer is live, so a window that inherits no
    // COLORTERM never looks ready and the session times out being created.
    // The window is given the same terminal either way rather than left to
    // whatever started the service.
    const environment = ['-e', 'COLORTERM=truecolor']
    const args = selected
      ? [
          'new-window',
          '-d',
          '-P',
          '-F',
          format,
          '-t',
          `=${selected.name}:`,
          '-n',
          windowName,
          '-c',
          cwd,
          ...environment,
          ...command,
        ]
      : [
          'new-session',
          '-d',
          '-P',
          '-F',
          format,
          '-s',
          'agentic-remote',
          '-n',
          windowName,
          '-c',
          cwd,
          ...environment,
          ...command,
        ]
    const output = (await execFileAsync('tmux', args)).stdout.trim()
    const [sessionName, windowId] = output.split('\t', 2)
    if (!sessionName || !windowId) {
      throw new Error('tmux did not return the created window')
    }
    await execFileAsync('tmux', [
      'set-option',
      '-w',
      '-t',
      windowId,
      'automatic-rename',
      'off',
    ])
    const expectedTarget = (
      await execFileAsync('tmux', [
        'display-message',
        '-p',
        '-t',
        windowId,
        '#{pane_id}',
      ])
    ).stdout.trim()
    if (!expectedTarget) {
      await execFileAsync('tmux', ['kill-window', '-t', windowId]).catch(
        () => undefined,
      )
      throw new Error('tmux did not return the created pane')
    }
    try {
      for (let attempt = 0; attempt < 60; attempt += 1) {
        const owner = await this.owner(sessionId, expectedTarget)
        if (owner) {
          let validatedOwner = owner
          const startup = await waitForTerminalStartup(
            owner.target,
            true,
            async () => {
              const current = await this.owner(
                sessionId,
                validatedOwner.target,
                true,
              )
              if (
                !current ||
                current.target !== validatedOwner.target ||
                current.rootPid !== validatedOwner.rootPid
              ) {
                throw new Error(
                  'The terminal owner changed during startup',
                )
              }
              // The CLI may replace its process while preserving the same
              // tmux pane and session identity during startup.
              validatedOwner = current
            },
          )
          if (startup === 'ready') {
            this.inputReadySessions.set(sessionId, {
              pid: validatedOwner.pid,
              target: validatedOwner.target,
              rootPid: validatedOwner.rootPid,
            })
            this.automaticStartupSessions.delete(sessionId)
          } else {
            this.automaticStartupSessions.set(sessionId, {
              pid: validatedOwner.pid,
              target: validatedOwner.target,
              rootPid: validatedOwner.rootPid,
            })
          }
          return { sessionName, windowId }
        }
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      throw new Error('Copilot did not start in the new tmux window')
    } catch (error) {
      this.inputReadySessions.delete(sessionId)
      this.automaticStartupSessions.delete(sessionId)
      await execFileAsync('tmux', ['kill-window', '-t', windowId]).catch(
        () => undefined,
      )
      throw error
    }
  }

  sending(sessionId: string): boolean {
    return this.operations.has(sessionId)
  }

  private async serialize<T>(
    sessionId: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const previous = this.operations.get(sessionId) || Promise.resolve()
    const current = previous.catch(() => undefined).then(operation)
    this.operations.set(sessionId, current)
    try {
      return await current
    } finally {
      if (this.operations.get(sessionId) === current) {
        this.operations.delete(sessionId)
      }
    }
  }
}

interface TmuxSessionInfo {
  name: string
  attached: number
  createdAt: number
}

export function isTerminalSessionInUsePrompt(pane: string): boolean {
  return Boolean(parseTerminalSessionInUse(pane))
}

export function isTerminalDesktopInstallPrompt(pane: string): boolean {
  const lines = pane.split('\n')
  const cleaned = lines.map(cleanDialogLine)
  const prompt = cleaned.findLastIndex((line) =>
    /^Install it now\?$/i.test(line),
  )
  const frame = activeBottomFrame(lines, prompt)
  if (!frame) {
    return false
  }
  const activeLines = cleaned.slice(frame.start, frame.end + 1)
  const activeView = activeLines.join(' ').replace(/\s+/gu, ' ')
  return (
    activeLines.some((line) => /^THE GITHUB COPILOT APP$/i.test(line)) &&
    /Now generally available!/i.test(activeView) &&
    // The panel always draws a marker against whichever choice is selected.
    // Text that merely says the same words -- pasted into the composer, or
    // recalled into it -- carries no selection, and answering that would send
    // Enter or `n` into somebody's draft. Without the marker this is not a
    // panel being shown, whatever else the frame says.
    activeLines.some((line) =>
      /(?:^|\s)[>❯]\s*(?:Yes,\s*install|No,\s*thanks)/i.test(line),
    ) &&
    /Yes,\s*install/i.test(activeView) &&
    /No,\s*thanks/i.test(activeView) &&
    /←\/→\s+(?:to\s+)?choose/i.test(activeView) &&
    /Enter\s+(?:to\s+)?select/i.test(activeView) &&
    /Y\s*\/\s*N/i.test(activeView)
  )
}

function desktopInstallPromptIdentity(pane: string): string | undefined {
  if (!isTerminalDesktopInstallPrompt(pane)) return undefined
  const lines = pane.split('\n')
  const cleaned = lines.map(cleanDialogLine)
  const prompt = cleaned.findLastIndex((line) => /^Install it now\?$/i.test(line))
  const frame = activeBottomFrame(lines, prompt)
  return frame ? cleaned.slice(frame.start, frame.end + 1).join('\n') : undefined
}

function hasComposerAfter(lines: string[], index: number): boolean {
  return terminalComposerFrame(lines.slice(index + 1), false) !== undefined
}

function activeBottomFrame(
  lines: string[],
  marker: number,
): { start: number; end: number } | undefined {
  if (marker < 0) {
    return undefined
  }
  const frames: number[] = []
  for (let index = 0; index < lines.length; index += 1) {
    if (/^\s*╭[\u2500-\u257f]*╮?\s*$/u.test(lines[index])) {
      frames.push(index)
      continue
    }
    if (!/^\s*╰[\u2500-\u257f]*╯?\s*$/u.test(lines[index])) {
      continue
    }
    const start = frames.pop()
    if (
      start !== undefined &&
      start < marker &&
      marker < index &&
      lines.slice(index + 1).every((line) => !line.trim())
    ) {
      const rawContent = lines.slice(start + 1, index)
      if (rawContent.some((line) => /^\s*┃/u.test(line))) {
        continue
      }
      if (
        containsCopiedInteractiveFrame(
          rawContent.map(stripOuterFrameEdge),
        )
      ) {
        continue
      }
      const content = rawContent.map(cleanDialogLine)
      const firstContent = content.find(Boolean)
      if (firstContent && /^[>❯](?:\s|$)/u.test(firstContent)) {
        continue
      }
      return { start, end: index }
    }
  }
  return undefined
}

function stripOuterFrameEdge(line: string): string {
  return line
    .trim()
    .replace(/^│\s?/u, '')
    .replace(/\s?│$/u, '')
    .trim()
}

function containsCopiedInteractiveFrame(lines: string[]): boolean {
  const frames: number[] = []
  for (let index = 0; index < lines.length; index += 1) {
    if (/^╭[\u2500-\u257f]*╮?$/u.test(lines[index])) {
      frames.push(index)
      continue
    }
    if (!/^╰[\u2500-\u257f]*╯?$/u.test(lines[index])) {
      continue
    }
    const start = frames.pop()
    if (start === undefined) {
      continue
    }
    const copiedLines = lines.slice(start + 1, index)
    const copied = copiedLines.join('\n')
    const normalized = copiedLines
      .map(cleanDialogLine)
      .join(' ')
      .replace(/\s+/gu, ' ')
    const hasSelect = /enter\s+(?:to\s+)?select/i.test(normalized)
    const copiedDesktop =
      /Install it now\?/i.test(normalized) && /Y\s*\/\s*N/i.test(normalized)
    const copiedCancelable =
      /(Session in use|Do you trust the files in this folder\?)/i.test(
        normalized,
      ) && /esc\s+(?:to\s+)?cancel/i.test(normalized)
    const copiedCommand =
      /Do you want to run this command\?/i.test(normalized) &&
      /esc\s+(?:to\s+)?cancel/i.test(normalized)
    const copiedQuestion =
      /\bQuestion\b/i.test(copied) &&
      /enter\s+(?:to\s+)?(?:confirm|submit)/i.test(normalized) &&
      /esc\s+(?:to\s+)?cancel/i.test(normalized)
    if (
      (hasSelect && (copiedDesktop || copiedCancelable || copiedCommand)) ||
      copiedQuestion
    ) {
      return true
    }
  }
  return false
}

const TERMINAL_NOT_READY_MESSAGE = 'Copilot did not become ready for terminal input'

/**
 * Runs a startup capture bounded by the startup deadline. Its timeout is the
 * time left, so on a loaded host the last capture can be cut off just as the
 * deadline passes; that is the deadline expiring, not tmux failing, and must
 * surface as "did not become ready" so callers classify it as such.
 */
async function captureBeforeDeadline<T>(
  deadline: number,
  capture: (timeout: number) => Promise<T>,
): Promise<T> {
  try {
    return await capture(Math.max(1, deadline - Date.now()))
  } catch (error) {
    if (
      error instanceof Error &&
      (error as { killed?: unknown }).killed === true &&
      (error as { code?: unknown }).code !== 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER'
    ) {
      throw new Error(TERMINAL_NOT_READY_MESSAGE)
    }
    throw error
  }
}

async function clearAutomaticStartupPrompts(
  target: string,
  validateOwner: () => Promise<void>,
  deadline: number,
): Promise<void> {
  const capture = () =>
    captureBeforeDeadline(deadline, async (timeout) =>
      (
        await execFileAsync('tmux', ['capture-pane', '-J', '-p', '-t', target], {
          timeout,
        })
      ).stdout,
    )

  const waitUntilClosed = async (
    isOpen: (pane: string) => boolean,
  ): Promise<void> => {
    for (let attempt = 0; attempt < 100 && Date.now() < deadline; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      if (!isOpen(await capture())) {
        return
      }
    }
    throw new Error('Copilot startup prompt did not close')
  }

  // More than one known prompt can appear in sequence. Handle each once, then
  // re-read the screen to decide whether another distinct prompt followed it.
  for (let prompt = 0; prompt < 10 && Date.now() < deadline; prompt += 1) {
    const pane = await capture()
    if (
      hasTerminalCommandPermissionQuestion(pane) ||
      parseTerminalPermission(pane) ||
      parseTerminalUserInput(pane) ||
      parseTerminalFormPrompt(pane)
    ) {
      return
    }
    if (isTerminalDesktopInstallPrompt(pane)) {
      // Agentic Remote already supplies the remote supervision UI. Opening a
      // browser to install a separate desktop app cannot help this headless
      // terminal and keeps the first real prompt from reaching the composer.
      const identity = desktopInstallPromptIdentity(pane)
      await validateOwner()
      const current = await capture()
      if (
        identity === undefined ||
        hasTerminalCommandPermissionQuestion(current) ||
        parseTerminalPermission(current) ||
        parseTerminalUserInput(current) ||
        parseTerminalFormPrompt(current) ||
        desktopInstallPromptIdentity(current) !== identity
      ) {
        return
      }
      await execFileAsync('tmux', ['send-keys', '-t', target, 'n'])
      await waitUntilClosed(isTerminalDesktopInstallPrompt)
    } else {
      return
    }
  }
  throw new Error('Too many Copilot startup prompts appeared in sequence')
}

export async function waitForTerminalStartup(
  target: string,
  handleAutomaticPrompts = true,
  validateOwner: () => Promise<void> = async () => undefined,
  timeoutMs = TERMINAL_STARTUP_TIMEOUT_MS,
  requiredReadyFrames = 30,
): Promise<'ready' | 'action-required'> {
  const deadline = Date.now() + timeoutMs
  let readyFrames = 0
  while (Date.now() < deadline) {
    const pane = await captureBeforeDeadline(deadline, (timeout) =>
      capturePane(target, timeout),
    )
    if (
      hasTerminalCommandPermissionQuestion(pane) ||
      parseTerminalPermission(pane) ||
      parseTerminalUserInput(pane) ||
      parseTerminalFormPrompt(pane)
    ) {
      return 'action-required'
    }
    if (isTerminalDesktopInstallPrompt(pane)) {
      if (!handleAutomaticPrompts) {
        return 'action-required'
      }
      await clearAutomaticStartupPrompts(target, validateOwner, deadline)
      readyFrames = 0
      continue
    }
    if (isTerminalOverlay(pane)) {
      return 'action-required'
    }
    if (hasLiveTerminalComposer(pane)) {
      // Copilot briefly paints an empty composer before opening delayed
      // startup prompts such as the desktop-app promotion. Returning on that
      // first frame lets the first message be pasted into the prompt that
      // replaces it. Require the composer to remain available long enough for
      // those startup prompts to appear and be handled.
      readyFrames += 1
      if (readyFrames >= requiredReadyFrames) {
        await validateOwner()
        return 'ready'
      }
    } else {
      readyFrames = 0
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(TERMINAL_NOT_READY_MESSAGE)
}

function cleanDialogLine(line: string): string {
  return line
    .replace(/^[\s│┃╭╰]+/u, '')
    .replace(/[\s│┃╮╯]+$/u, '')
    .trim()
}

/**
 * The version the CLI is advertising as an update, or undefined when it is not
 * offering one. The notice lives in the status bar the CLI repaints below its
 * composer, so only that region is examined; the transcript above it can quote
 * a notice without one being offered.
 */
const COMPOSER_EDGE = /^\s*[╻╹╭╰][\u2580-\u259f\u2500-\u257f]*\s*$/u

export function parseTerminalUpdateNotice(pane: string): string | undefined {
  const lines = pane.split('\n')
  // A pane can be padded with blank lines below the status bar, which would
  // otherwise push the notice out of the region examined below.
  while (lines.length > 0 && !lines[lines.length - 1].trim()) {
    lines.pop()
  }
  // Anchor below the composer's lower edge rather than its top, so text typed
  // into the composer is not read as an offer either.
  const composer = terminalComposerFrame(lines, false)
  // Without a composer the pane is showing a full-screen view, which covers
  // the status bar. The next poll sees it again once the view closes.
  if (!composer) {
    return undefined
  }
  for (const line of lines.slice(composer.bottom + 1)) {
    const match = /\bv?(\d+\.\d+\.\d+[\w.-]*)\s+available\b/i.exec(line)
    if (match && /\/update\b/.test(line)) {
      return match[1]
    }
  }
  return undefined
}

// The CLI redraws a composer frame and a status footer on every frame, so a
// naive pane diff is mostly chrome. Everything below recognises that chrome so
// only genuine command output is reported.
const TERMINAL_CHROME = [
  /^[╻┃╹╭╰│]*[▄▀─━]*[╸╺╹╻┃]*$/u,
  /^[←↑↓→]/u,
  /commands\s+·\s+/u,
  /^\s*$/u,
  // The startup banner and tip render after the pane is first captured, so
  // without this the first command in a session reports them as its output.
  /^[\u2500-\u259f\s]*Copilot v[\d.]+ uses AI\.$/u,
  /^[\u2500-\u259f\s]*Check for mistakes\.$/u,
  /^[●•]?\s*Tip:\s/u,
]

function isTerminalChrome(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) {
    return true
  }
  if (/^[\u2500-\u257f\u2580-\u259f\s]+$/u.test(trimmed)) {
    return true
  }
  return TERMINAL_CHROME.some((pattern) => pattern.test(trimmed))
}

// The composer always sits below the transcript, and the status footer below
// that. Copilot uses either a bordered box or two horizontal separators around
// the prompt, depending on its version.
const COMPOSER_TOP = /^\s*[╻╭][\u2580-\u259f\u2500-\u257f]*\s*$/u
const FLAT_COMPOSER_EDGE = /^\s*[─━]{8,}\s*$/u
const FLAT_COMPOSER_STATUS = /\bSession:\s+\d+(?:\.\d+)?\s+AIC used\s*$/u

interface TerminalComposerFrame {
  top: number
  bottom: number
  flat: boolean
  // Set only on a frame found by where the cursor was rather than by its
  // glyphs: the character drawn in front of the prompt, or '' for none.
  marker?: string
}

// For the frames found by the cursor. Line and block characters only ever
// draw a frame: a row of them is a rule, one opening every row is a side, and
// a prompt marker is any other single character that is not a letter or digit.
// Read as a marker, a side would make any box with the cursor in it a prompt.
const COMPOSER_RULE = /^\s*[\u2500-\u259f]{8,}\s*$/u
const COMPOSER_SIDE_BAR = /^[\u2500-\u259f]/u
const COMPOSER_MARKER = /^([^\p{L}\p{N}\s\u2500-\u259f])(?:\s|$)/u

function isTerminalContextFooter(line: string): boolean {
  const parts = line.trim().split('·').map((part) => part.trim())
  return (
    parts.length >= 2 &&
    parts.every(Boolean) &&
    /^\d+(?:,\d{3})*(?:\.\d+)?[kKmMgG]?\s+context(?:\s*\(\d+(?:\.\d+)?%\))?$/u
      .test(parts.at(-1) ?? '')
  )
}

function isTerminalModelFooter(line: string, previousLine = ''): boolean {
  const trimmed = line.trim()
  const model = trimmed.replace(/^ctrl\+t\s+show reasoning\s+·\s+/iu, '')
  return (
    trimmed.length > 0 &&
    trimmed.length <= 160 &&
    /(?:open sidebar|\/\s*commands|tab next tab)/iu.test(previousLine) &&
    /^(?:Auto$|Claude\b|Copilot\b|Gemini\b|GPT(?:\b|-)|Grok\b|MAI\b|o\d\b|Raptor\b)/iu
      .test(model)
  )
}

// The hint cells in the order Copilot draws them; each slot appears at most
// once, and only the mode and permission slots have alternatives.
const FOOTER_HINT_SLOTS = [
  ['← open sidebar'],
  ['Interactive', 'Plan', 'Autopilot'],
  ['Allow All', 'Manual Approval'],
  ['/ commands'],
  ['? help'],
  ['tab next tab'],
]
const FOOTER_HINTS = new Set(FOOTER_HINT_SLOTS.flat())
const FOOTER_REASONING = 'ctrl+t show reasoning'

// A row that names any hint cell, or carries the reasoning hint after other
// text, is a hint row and is held to the hint grammar.
function isTerminalHintRow(line: string): boolean {
  return /\S\s+ctrl\+t\b/u.test(line) ||
    line.split('·').some((cell) => FOOTER_HINTS.has(cell.trim().replace(/\s+/gu, ' ')))
}
const FOOTER_MODEL = /^(?:Auto$|Claude\b|Copilot\b|Gemini\b|GPT(?:\b|-)|Grok\b|MAI\b|o\d\b|Raptor\b)/iu
const FOOTER_MODEL_FAMILIES = ['Auto', 'Claude', 'Copilot', 'Gemini', 'GPT', 'Grok', 'MAI', 'o', 'Raptor']
const FOOTER_EFFORTS = ['Low', 'Medium', 'High', 'Extra High', 'Max']
const FOOTER_CONTEXT =
  /^(?:\d+(?:\.\d+)?[KMG]? context(?: \(\d+(?:\.\d+)?%\))?|\(\d+(?:\.\d+)?%\))$/u
const FOOTER_CONTEXT_CUT =
  /^(?:\(\d*(?:\.\d*)?%?|\d+(?:\.\d+)?[KMG]?(?: (?:c(?:o(?:n(?:t(?:e(?:xt?)?)?)?)?)?|context \(\d*(?:\.\d*)?%?))?)$/u

/**
 * Copilot 1.0.98's model hint: the model, then its reasoning effort and the
 * context in use, in that order, each at most once, either later one left out,
 * and only the last cell cut short when the row is narrow.
 */
function isFooterModelHint(text: string): boolean {
  const cells = text.trim().replace(/\s+/gu, ' ').split(' · ')
  if (cells.length > 3 || !isFooterModelCell(cells[0], cells.length === 1)) return false
  let slot = 0
  for (const [index, cell] of cells.entries()) {
    if (index === 0) continue
    const cut = index === cells.length - 1
    if (cut && !cell) return true
    if (slot < 1 && FOOTER_EFFORTS.some((effort) => effort === cell || (cut && effort.startsWith(cell)))) {
      slot = 1
    } else if (slot < 2 && (FOOTER_CONTEXT.test(cell) || (cut && FOOTER_CONTEXT_CUT.test(cell)))) {
      slot = 2
    } else {
      return false
    }
  }
  return true
}

// A model with cells after it is named in full; only a last one is cut short.
function isFooterModelCell(cell: string, cut: boolean): boolean {
  if (cell.length > 60 || cell.includes('?')) return false
  const complete = FOOTER_MODEL.test(cell) && !/[-\s]$/u.test(cell) &&
    !FOOTER_MODEL_FAMILIES.some((family) =>
      family !== 'Auto' && family.toLowerCase() === cell.toLowerCase())
  return complete || (cut && (FOOTER_MODEL.test(cell) || (cell.length < 7 &&
    FOOTER_MODEL_FAMILIES.some((family) => family.toLowerCase().startsWith(cell.toLowerCase())))))
}

// The reasoning hint, cut short, or followed by a model that may itself be cut.
function isFooterReasoningModel(text: string): boolean {
  if (FOOTER_REASONING.startsWith(text)) return text.startsWith('ctrl+t')
  if (!text.startsWith(FOOTER_REASONING)) return false
  const rest = text.slice(FOOTER_REASONING.length)
  if (rest === ' ·') return true
  if (!rest.startsWith(' · ')) return false
  const model = rest.slice(3)
  return FOOTER_MODEL.test(model) ||
    (model.length < 7 && FOOTER_MODEL_FAMILIES.some((family) =>
      family.toLowerCase().startsWith(model.toLowerCase())))
}

/**
 * Whether a footer row is hint cells followed by the model, as Copilot fits
 * them on one row.
 *
 * At narrower widths it drops hint cells, and cuts the last hint and the
 * model mid-word. Every hint must still be a known cell in Copilot's order,
 * each slot at most once, and only the last may be cut short.
 */
function isTerminalCompactHintFooter(line: string): boolean {
  const trimmed = line.trim().replace(/\s+/gu, ' ')
  if (!trimmed || trimmed.length > 240) return false
  const modelAt = trimmed.search(/(?:^|\s)ctrl\+t(?:\s|$)/u)
  if (modelAt >= 0) {
    return isFooterReasoningModel(trimmed.slice(modelAt).trim()) &&
      isFooterHintSequence(trimmed.slice(0, modelAt).trim(), true)
  }
  if (isFooterHintSequence(trimmed, false)) return true
  // Copilot 1.0.98 sets its model hint straight after the hints.
  for (let at = trimmed.indexOf(' '); at > 0; at = trimmed.indexOf(' ', at + 1)) {
    if (isFooterModelHint(trimmed.slice(at + 1)) && isFooterHintSequence(trimmed.slice(0, at), true)) {
      return true
    }
  }
  return false
}

function isFooterHintSequence(hints: string, withModel: boolean): boolean {
  const cells = hints ? hints.split('·').map((cell) => cell.trim()).filter(Boolean) : []
  // Hints alone, without the model beside them, need more than one cell to be
  // told apart from a stray word.
  if (!cells.length || (!withModel && cells.length < 2)) return false
  let slot = -1
  for (const [index, cell] of cells.entries()) {
    const last = index === cells.length - 1
    const next = FOOTER_HINT_SLOTS.findIndex((candidates, position) =>
      position > slot &&
      candidates.some((candidate) => candidate === cell || (last && candidate.startsWith(cell))))
    if (next < 0) return false
    slot = next
  }
  return true
}

function isTerminalWorkspaceFooter(line: string): boolean {
  const trimmed = line.trim()
  return (
    trimmed.length > 0 &&
    trimmed.length <= 240 &&
    /(?:^|\s)@\s+files\b/iu.test(trimmed) &&
    /(?:^|\s)#\s+issues\b/iu.test(trimmed) &&
    /\bctrl\+\S+\s+show reasoning\b/iu.test(trimmed) &&
    /·\s*(?:Auto$|Claude\b|Copilot\b|Gemini\b|GPT(?:\b|-)|Grok\b|MAI\b|o\d\b|Raptor\b)/iu
      .test(trimmed)
  )
}

const DOWNLOADED_UPDATE_VERSION =
  /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/u
const DOWNLOADED_UPDATE_NOTICE = ' downloaded · next launch or /restart'

interface DownloadedUpdateCell {
  optional?: boolean
  /** Whether wrapped text could still complete this cell. Prefix-closed. */
  allows(prefix: string): boolean
  accepts(text: string): boolean
}

const exactCell = (texts: string[], optional = false): DownloadedUpdateCell => ({
  optional,
  allows: (prefix) => texts.some((text) => text.startsWith(prefix)),
  accepts: (text) => texts.includes(text),
})

const DOWNLOADED_UPDATE_NOTICE_CELL: DownloadedUpdateCell = {
  allows: (prefix) => {
    const space = prefix.indexOf(' ')
    const version = space < 0 ? prefix : prefix.slice(0, space)
    return /^(?:v[0-9A-Za-z.+-]*)?$/u.test(version) &&
      (space < 0 || DOWNLOADED_UPDATE_NOTICE.startsWith(prefix.slice(space)))
  },
  accepts: (text) => {
    if (!text.endsWith(DOWNLOADED_UPDATE_NOTICE)) return false
    const match = DOWNLOADED_UPDATE_VERSION.exec(text.slice(0, -DOWNLOADED_UPDATE_NOTICE.length))
    return Boolean(match) && !match![4]?.split('.').some((part) => /^0\d+$/u.test(part))
  },
}

// The hint cells always follow the notice in this order. Mode, permission and
// help are optional; every other word refuses the footer.
const DOWNLOADED_UPDATE_LAYOUTS: DownloadedUpdateCell[][] = [
  [DOWNLOADED_UPDATE_NOTICE_CELL],
  [
    DOWNLOADED_UPDATE_NOTICE_CELL,
    exactCell(['← open sidebar']),
    exactCell(['Interactive', 'Autopilot', 'Plan'], true),
    exactCell(['Allow All'], true),
    exactCell(['/ commands']),
    exactCell(['? help'], true),
    exactCell(['tab next tab']),
  ],
]

/**
 * Whether these rows are Copilot's downloaded-update footer row.
 *
 * The first row holds each cell's start, separated by `·`. Every continuation
 * row holds the wrapped remainders of those same cells, in the same order,
 * though not always under them, and a cell may wrap over any number of rows.
 * A wrap loses the space at its break, so each break may have been a space or
 * the middle of a word. Each cell must reproduce its exact text, so reordered,
 * repeated or unknown words refuse input.
 */
function isDownloadedUpdateFooterRows(rows: string[]): boolean {
  const [first, ...continuations] = rows
  if (!first || !/^\s*v\d/u.test(first)) return false
  const normalize = (text: string) => text.trim().replace(/\s+/gu, ' ')
  const segments = first.split('·').map(normalize)
  const tokens = continuations.map((row) => normalize(row).split(' ').filter(Boolean))
  if (tokens.some((row) => !row.length)) return false
  return DOWNLOADED_UPDATE_LAYOUTS.some((layout) => {
    const failed = new Set<string>()
    const match = (cell: number, segment: number, positions: number[]): boolean => {
      if (cell === layout.length) {
        return segment === segments.length &&
          positions.every((position, row) => position === tokens[row].length)
      }
      const key = `${cell}:${segment}:${positions.join(',')}`
      if (failed.has(key)) return false
      if (layout[cell].optional && match(cell + 1, segment, positions)) return true
      // Only the notice contains a `·` of its own.
      for (const taken of cell ? [1] : [1, 2]) {
        if (segment + taken > segments.length) continue
        const start = segments.slice(segment, segment + taken).join(' · ')
        if (layout[cell].allows(start) && wrap(cell, segment + taken, start, 0, positions)) return true
      }
      failed.add(key)
      return false
    }
    // Extends one cell through the continuation rows. Once a cell has text, it
    // ends at the first row that adds none.
    const wrap = (cell: number, segment: number, text: string, row: number, positions: number[]): boolean => {
      if (text && layout[cell].accepts(text) && match(cell + 1, segment, positions)) return true
      if (row === tokens.length) return false
      for (let end = positions[row] + 1; end <= tokens[row].length; end += 1) {
        const part = tokens[row].slice(positions[row], end).join(' ')
        const next = positions.map((position, index) => index === row ? end : position)
        const candidates = (text ? [`${text} ${part}`, `${text}${part}`] : [part])
          .filter((candidate) => layout[cell].allows(candidate))
        if (!candidates.length) break
        if (candidates.some((candidate) => wrap(cell, segment, candidate, row + 1, next))) return true
      }
      return !text && wrap(cell, segment, text, row + 1, positions)
    }
    return match(0, 0, continuations.map(() => 0))
  })
}

/** The rows of the downloaded-update footer below a composer, if any. */
function downloadedUpdateFooterBlock(lines: string[]): { start: number; end: number } | undefined {
  for (let start = 0; start < lines.length; start += 1) {
    for (let end = lines.length - 1; end >= start; end -= 1) {
      if (isDownloadedUpdateFooterRows(lines.slice(start, end + 1))) return { start, end }
    }
  }
  return undefined
}

/**
 * Whether the rows below a composer are its footer.
 *
 * Known footers are matched exactly. When Copilot itself shows the prompt has
 * the keyboard (see `composerHasFocus`), up to three rows the grammar does not
 * know yet are accepted as long as none could be anything but a footer: a
 * list or picker entry, a question, or keys offered to something else.
 */
function isTerminalComposerFooter(lines: string[], tolerateUnknown = false): boolean {
  const update = downloadedUpdateFooterBlock(lines)
  let unknownRows = 0
  return lines.every((line, index) => {
    if (update && index >= update.start && index <= update.end) return true
    const known = isKnownTerminalFooterRow(lines, index, update)
    if (known || !tolerateUnknown || !isUnrecognizedFooterRow(line)) return known
    unknownRows += 1
    return unknownRows <= UNRECOGNIZED_FOOTER_ROWS
  })
}

function isKnownTerminalFooterRow(
  lines: string[],
  index: number,
  update: { start: number; end: number } | undefined,
): boolean {
  const line = lines[index]
  const availableUpdate =
    /\/update\b/u.test(line) && /\bv?\d+\.\d+\.\d+[\w.-]*\s+available\b/i.test(line)
  // A version-led row that is not an exact update footer is never chrome,
  // even when it also carries familiar command hints.
  if (/^\s*v\d/u.test(line) && !availableUpdate) return false
  // While a turn runs, Copilot 1.0.96 puts its status and the interrupt key
  // ahead of the reasoning/model hint on one row, and cuts the model or its
  // context to fit. Anything after the interrupt key must be that hint.
  // Copilot 1.0.98 offers to edit the prompt before the turn gets going, adds
  // its queue key while the prompt holds text, and draws its own model hint.
  const working = /^(.*?)\besc\s+(?:interrupt|edit\s+prompt)\b(.*)$/iu.exec(line)
  if (working) {
    // The status ahead of the key says what the agent is doing. A question or
    // a choice there is something waiting for an answer, not work going on.
    if (/\?|\[[^\]]*\/[^\]]*\]|\([^)]*\/[^)]*\)|\b(?:y|yes)\s*\/\s*(?:n|no)\b/iu.test(working[1])) {
      return false
    }
    const rest = working[2].trim().replace(/\s+/gu, ' ')
      .replace(/^·\s*ctrl\+q\s+enqueue(?:\s|$)/u, '').trim()
    return !rest || isFooterReasoningModel(rest) || isFooterModelHint(rest)
  }
  // Once a turn hands its work to background agents and ends, Copilot 1.0.101
  // keeps its prompt open and offers only to stop them; a message sent then
  // starts a new turn. Anything after that key must be the model hint.
  const background =
    /^\s*[●○◉◎]\s+Waiting for background agents(?:\s+·\s+\d+(?:\.\d+)?\s?[KMG]?B)?\s+esc\s+esc\s+stop\s+agents\b(.*)$/u.exec(line)
  if (background) {
    const rest = background[1].trim().replace(/\s+/gu, ' ')
    return !rest || isFooterReasoningModel(rest) || isFooterModelHint(rest)
  }
  // Hint rows are judged by the hint grammar alone rather than by the looser
  // patterns below, so reordered or unknown cells refuse input.
  if (isTerminalHintRow(line)) {
    return isTerminalCompactHintFooter(line) ||
      isTerminalWorkspaceFooter(line) ||
      /^\s*\/\s*commands\s*$/u.test(line)
  }
  // Nothing the update footer draws continues below it, so an arrow-led
  // line there is not footer chrome.
  const chrome = isTerminalChrome(line) &&
    !(update && index > update.end && /^\s*[←↑↓→]/u.test(line))
  return chrome ||
    isTerminalContextFooter(line) ||
    isTerminalModelFooter(line, lines[index - 1]) ||
    isTerminalCompactHintFooter(line) ||
    isTerminalWorkspaceFooter(line) ||
    /^\s*Changes\s+\+\d+\s+-\d+\s*$/u.test(line) ||
    /^\s*\/\s*commands(?:\s|$)/u.test(line) ||
    /\besc\s+interrupt\b/i.test(line) ||
    availableUpdate
}

/** The most footer rows that may go unrecognised below a focused composer. */
const UNRECOGNIZED_FOOTER_ROWS = 3

/**
 * Whether a row gives a single letter key a job, written as a shortcut hint:
 * `press y`, `y to keep`, `[y] keep`, or a lone lower-case letter before a
 * word, such as `y keep the file`. Capitalised prose (`A new version`) and the
 * article inside a sentence (`open a file`) are words, not keys.
 */
function hasPlainKeyHint(row: string): boolean {
  if (/\b(?:press|hit|type)\s+\p{L}\b/iu.test(row)) return true
  if (/(?:^|[\s·(])\p{L}\s+to\s+\p{L}/u.test(row)) return true
  if (/[[(<‹`'"]\p{L}[\])>›`'"]/u.test(row)) return true
  return row.split('·').some((cell) => {
    const text = cell.trim()
    return /^\p{Ll}\s+\p{Ll}/u.test(text) ||
      /\s(?!a\s)\p{Ll}\s+\p{Ll}/u.test(text)
  })
}

/**
 * Whether a row the footer grammar does not know could only be footer text.
 *
 * This app gives a composer pasted text, Enter, Ctrl+Q and Ctrl+U. A row is
 * refused if it gives any of those, or any plain key, a job; asks anything;
 * names an action that answers, commits or destroys something; or is an entry
 * in a list, picker or form. What is left is labels, the model, notices and
 * hints for shortcuts this app never sends.
 */
function isUnrecognizedFooterRow(line: string): boolean {
  const trimmed = line.trim().replace(/\s+/gu, ' ')
  if (!trimmed) return true
  if (trimmed.length > 240) return false
  // An entry in a list, picker or form.
  if (/^(?:[❯›>▸▶►●○◉◎◯☐☑☒✓✔✗✘•*+-]|\[.?\]|\(.?\)|\d+[.)])(?:\s|$)/u.test(trimmed)) return false
  // An entry in the command, file or issue picker.
  if (/^[/@#][\p{L}\p{N}_-]/u.test(trimmed)) return false
  // A question anywhere, or a prompt for an answer. A `? help` cell names the
  // key rather than asking.
  if (/:$/u.test(trimmed)) return false
  if (/\?/u.test(trimmed.replace(/(?:^|·)\s*\?\s+\p{L}/gu, ''))) return false
  // Answers to choose between.
  if (/\[[^\]]*\/[^\]]*\]|\([^)]*\/[^)]*\)|\b(?:y|yes)\s*\/\s*(?:n|no)\b/iu.test(trimmed)) return false
  // Moving through a list.
  if (/[↑↓]\s*\/?\s*[↑↓]|[←→]\s*\/?\s*[←→]/u.test(trimmed)) return false
  // A job for a key this app sends, for Escape, or for a plain key.
  if (/(?:^|[\s·(])(?:enter|return|⏎|↵|space|esc|escape|backspace|ctrl\+[qucdjm])(?=[\s·),]|$)/iu.test(trimmed)) return false
  if (hasPlainKeyHint(trimmed)) return false
  // An action that answers, commits or destroys something.
  return !/\b(?:abort|accept|approve|cancel|clear|confirm|continue|decline|delete|deny|deploy|destroy|discard|erase|exit|force|install|kill|merge|no|overwrite|proceed|publish|purge|push|quit|reject|remove|reset|retry|revert|submit|trust|undo|uninstall|wipe|yes)\b/iu
    .test(trimmed)
}

function composerRowText(line: string, frame: TerminalComposerFrame): string {
  if (frame.flat) return line.trim()
  // A frame found by the cursor may draw its sides with any line character.
  const [leading, trailing] = frame.marker === undefined
    ? [/^\s*[\u2502\u2503\u257d\u257f]\s?/u, /[\u2502\u2503\u257d\u257f]\s*$/u]
    : [/^\s*[\u2500-\u259f]\s?/u, /[\u2500-\u259f]\s*$/u]
  return line.replace(leading, '').replace(trailing, '').trim()
}

function composerFrameText(
  lines: string[],
  frame: TerminalComposerFrame,
): string {
  return lines.slice(frame.top + 1, frame.bottom)
    .map((line) => composerRowText(line, frame))
    .join(' ')
    .trim()
}

function flatComposerFrame(
  lines: string[],
  requireLive = true,
  tolerateUnknownFooter = false,
): TerminalComposerFrame | undefined {
  // Free-text form fields share the flat frame and prompt marker, but their
  // accept/cancel controls still own the keyboard.
  if (requireLive && hasTerminalFormFooter(lines)) {
    return undefined
  }
  for (let bottom = lines.length - 1; bottom >= 0; bottom -= 1) {
    if (
      !FLAT_COMPOSER_EDGE.test(lines[bottom]) ||
      (requireLive &&
        !isTerminalComposerFooter(lines.slice(bottom + 1), tolerateUnknownFooter))
    ) {
      continue
    }
    for (let top = bottom - 1; top >= 0; top -= 1) {
      if (!FLAT_COMPOSER_EDGE.test(lines[top])) {
        continue
      }
      const frame = { top, bottom, flat: true }
      if (/^[>❯](?:\s|$)/u.test(composerFrameText(lines, frame))) {
        return frame
      }
    }
  }
  return undefined
}

function boxedComposerFrame(
  lines: string[],
  requireLive = true,
  tolerateUnknownFooter = false,
): TerminalComposerFrame | undefined {
  const top = lines.findLastIndex((line) => COMPOSER_TOP.test(line))
  if (top < 0) {
    return undefined
  }
  const bottom = lines.findIndex(
    (line, index) => index > top && COMPOSER_EDGE.test(line),
  )
  const heavy = lines[top].trimStart().startsWith('╻')
  if (
    bottom < 0 ||
    !lines[bottom].trimStart().startsWith(heavy ? '╹' : '╰') ||
    !lines.slice(top + 1, bottom).some((line) => /^\s*[│┃╽╿]/u.test(line)) ||
    (requireLive &&
      !isTerminalComposerFooter(lines.slice(bottom + 1), tolerateUnknownFooter))
  ) {
    return undefined
  }
  const frame = { top, bottom, flat: false }
  if (requireLive && !heavy) {
    // Rounded frames also surround dialog fields. Only the legacy prompt
    // marker or its exact placeholder identifies one as a composer.
    const text = composerFrameText(lines, frame)
    if (
      !/^[>❯](?:\s|$)/u.test(text) &&
      !COMPOSER_PLACEHOLDERS.some((placeholder) => placeholder.test(text))
    ) {
      return undefined
    }
  }
  return frame
}

/**
 * The composer, however Copilot draws it: the lowest region between two rows
 * of line characters with only benign footer below it, whose first row opens
 * with a prompt marker or shows the empty-composer placeholder.
 *
 * Consulted only for lines the cursor was seen in a prompt for (see
 * `composerFocusedPanes`), so a new rule or marker character does not stop
 * input the way a new footer once did.
 */
function cursorComposerFrame(lines: string[]): TerminalComposerFrame | undefined {
  if (hasTerminalFormFooter(lines)) return undefined
  for (let bottom = lines.length - 1; bottom > 1; bottom -= 1) {
    if (
      !COMPOSER_RULE.test(lines[bottom]) ||
      !isTerminalComposerFooter(lines.slice(bottom + 1), true)
    ) {
      continue
    }
    const top = lines.findLastIndex(
      (line, index) => index < bottom && COMPOSER_RULE.test(line),
    )
    if (top < 0) return undefined
    const inner = lines.slice(top + 1, bottom).filter((line) => line.trim())
    if (!inner.length) continue
    const flat = !inner.every((line) => COMPOSER_SIDE_BAR.test(line.trim()))
    const text = composerFrameText(lines, { top, bottom, flat, marker: '' })
    const marker = COMPOSER_MARKER.exec(text)?.[1]
    if (marker) return { top, bottom, flat, marker }
    if (COMPOSER_PLACEHOLDERS.some((placeholder) => placeholder.test(text))) {
      return { top, bottom, flat, marker: '' }
    }
  }
  return undefined
}

/**
 * The composer frame. `focused` says the cursor was seen in the prompt for
 * exactly these lines, which admits footers and frame glyphs the grammar does
 * not know.
 */
function terminalComposerFrame(
  lines: string[],
  requireLive = true,
  focused = false,
): TerminalComposerFrame | undefined {
  const flat = flatComposerFrame(lines, requireLive, focused)
  const boxed = boxedComposerFrame(lines, requireLive, focused)
  const known = !flat
    ? boxed
    : !boxed || flat.bottom > boxed.bottom
      ? flat
      : boxed
  return known || !focused ? known : cursorComposerFrame(lines)
}

function hasLiveTerminalComposer(pane: string): boolean {
  return terminalComposerFrame(pane.split('\n'), true, composerFocusWitnessed(pane)) !== undefined
}

// Copilot shows the terminal cursor on its prompt row only while the prompt
// has the keyboard; its forms and pickers hide the cursor. That is the CLI's
// own word on who owns input, and it does not change when the footer does.
//
// Captures taken through `capturePane` read the cursor in the same tmux
// command, and a pane whose cursor sat in a composer with a footer or frame
// glyphs the grammar does not know is remembered here, by its exact text. The
// same text with the prompt not focused would have to look different, since
// whatever took the keyboard draws itself. Panes that never came from such a
// capture are judged by the grammar alone.
const composerFocusedPanes = new Set<string>()
const COMPOSER_FOCUS_MEMORY = 64

function composerFocusWitnessed(pane: string): boolean {
  return composerFocusedPanes.has(pane)
}

function rememberComposerFocus(pane: string): void {
  composerFocusedPanes.delete(pane)
  composerFocusedPanes.add(pane)
  while (composerFocusedPanes.size > COMPOSER_FOCUS_MEMORY) {
    composerFocusedPanes.delete(composerFocusedPanes.values().next().value!)
  }
}

const reportedUnknownShapes = new Set<string>()
const REPORTED_SHAPE_MEMORY = 256

// Once per shape (digits aside) for as long as the shape is among the most
// recent ones. Returns whether it was logged.
function reportOnce(shape: string, message: string): boolean {
  const key = shape.replace(/\d+/gu, '#')
  if (reportedUnknownShapes.has(key)) return false
  reportedUnknownShapes.add(key)
  while (reportedUnknownShapes.size > REPORTED_SHAPE_MEMORY) {
    reportedUnknownShapes.delete(reportedUnknownShapes.values().next().value!)
  }
  console.warn(message)
  return true
}

/**
 * Logs a footer that was accepted without being recognised, once per shape
 * (digits aside) for as long as the shape is among the most recent ones.
 * Returns whether it was logged.
 */
export function reportUnrecognisedFooter(footer: string): boolean {
  if (!footer) return false
  return reportOnce(
    `footer ${footer}`,
    `Copilot drew a footer this version does not recognise; input was allowed because the cursor was in its prompt: ${footer}`,
  )
}

/** Logs a composer frame found only by the cursor, once per shape. */
export function reportUnrecognisedComposer(shape: string): boolean {
  return reportOnce(
    `composer ${shape}`,
    `Copilot drew a prompt this version does not recognise; input was allowed because the cursor was in it: ${shape}`,
  )
}

/**
 * Whether the cursor sits inside a composer whose footer, however unfamiliar,
 * holds nothing that could own the keyboard. The composer may be drawn with
 * rule and marker characters the grammar does not know.
 *
 * `rows` is the visible screen, one row per line, so `cursorY` indexes it.
 */
export function composerHasFocus(
  rows: readonly string[],
  cursorVisible: boolean,
  cursorY: number,
): boolean {
  if (!cursorVisible || cursorY < 0 || cursorY >= rows.length) return false
  const lines = [...rows]
  if (hasTerminalFormFooter(lines)) return false
  const frame = terminalComposerFrame(lines, true, true)
  if (!frame || cursorY <= frame.top || cursorY >= frame.bottom) return false
  // A frame found by the cursor alone could be a dialog's text field, which
  // names its keys below the field. A composer holds nothing after the
  // cursor, so anything there is judged as footer, within the same limit.
  return frame.marker === undefined ||
    isTerminalComposerFooter([
      ...lines.slice(cursorY + 1, frame.bottom).map((line) => composerRowText(line, frame)),
      ...lines.slice(frame.bottom + 1),
    ], true)
}

// Logs what about a focused composer the grammar did not know: its frame
// glyphs, its footer, or both.
function reportUnrecognisedComposerParts(rows: readonly string[]): void {
  const lines = [...rows]
  const frame = terminalComposerFrame(lines, true, true)
  if (!frame) return
  if (frame.marker !== undefined) {
    const edge = (line: string) => line.trim()[0] ?? ''
    const sides = frame.flat
      ? ''
      : ` sides ${edge(lines.slice(frame.top + 1, frame.bottom).find((line) => line.trim()) ?? '')}`
    reportUnrecognisedComposer(
      `rules ${edge(lines[frame.top])}/${edge(lines[frame.bottom])}${sides} marker ${frame.marker || '(none)'}`,
    )
  }
  const footer = lines.slice(frame.bottom + 1)
  if (!isTerminalComposerFooter(footer)) {
    reportUnrecognisedFooter(
      footer.map((line) => line.trim()).filter(Boolean).join(' | '),
    )
  }
}

export function terminalInputReady(pane: string, allowWorking = false): boolean {
  return (
    hasLiveTerminalComposer(pane) &&
    (allowWorking || !isTerminalAgentWorking(pane)) &&
    !isTerminalOverlay(pane) &&
    !isTerminalSessionInUsePrompt(pane) &&
    !isTerminalDesktopInstallPrompt(pane) &&
    !parseTerminalPermission(pane) &&
    !parseTerminalUserInput(pane) &&
    !parseTerminalFormPrompt(pane)
  )
}

function stripTerminalStatus(pane: string): string[] {
  const lines = pane.split('\n').map((line) => line.trimEnd())
  const composer = terminalComposerFrame(lines, true, composerFocusWitnessed(pane))
  if (!composer) {
    return lines
  }
  const status = composer.flat && composer.top > 0 &&
    FLAT_COMPOSER_STATUS.test(lines[composer.top - 1])
    ? composer.top - 1
    : composer.top
  return lines.slice(0, status)
}

function terminalControlLines(pane: string): string[] {
  const lines = pane.split('\n')
  while (lines.length > 0 && !lines[lines.length - 1].trim()) {
    lines.pop()
  }
  const liveComposer = terminalComposerFrame(lines, true, composerFocusWitnessed(pane))
  if (liveComposer) {
    return lines.slice(liveComposer.bottom + 1)
  }
  // The bottom of the CLI composer separates transcript/draft text from the
  // controls that own the keyboard. Rounded dialog borders are not composers.
  const composer = lines.findLastIndex((line) =>
    /^\s*╹[\u2580-\u259f\u2500-\u257f]*\s*$/u.test(line),
  )
  const repaint = lines.findLastIndex((line) =>
    /^\s*╻[\u2580-\u259f\u2500-\u257f]*\s*$/u.test(line),
  )
  return lines.slice(Math.max(composer, repaint) + 1)
}

export function hasClippedTerminalFormFooter(pane: string): boolean {
  if (hasLiveTerminalComposer(pane)) return false
  return hasTerminalFormFooter(terminalControlLines(pane))
}

function hasTerminalFormFooter(rawLines: readonly string[]): boolean {
  const lines = rawLines.map(cleanDialogLine)
  while (lines.length && (!lines.at(-1) || /^[─━]+$/u.test(lines.at(-1)!))) lines.pop()
  const trailing: string[] = []
  // Only adjacent control words can belong to the wrapped footer. Blank
  // lines, quotations and transcript text cannot bridge otherwise valid hints.
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index]
    if (!line || !line.split(/[\s·]+/u).filter(Boolean).every((word) =>
      /^(?:↑\/↓|select|space|toggle|enter|accept|tab|next|shift\+tab|prev|ctrl\+d|decline|esc|cancel)$/u.test(word))) break
    trailing.unshift(line)
    if (trailing.length > 6) return false
  }
  const footer = trailing.join(' ').replace(/\s+/gu, ' ')
  if (footer.length > 240) return false
  const controls = footer.split(/\s*·\s*/u)
  return controls.includes('enter accept') && controls.at(-1) === 'esc cancel' &&
    new Set(controls).size === controls.length &&
    controls.every((control) =>
      /^(?:↑\/↓ select|space toggle|enter accept|tab next|shift\+tab prev|ctrl\+d decline|esc cancel)$/u.test(control))
}

// A full-screen view replaces the transcript and is driven by keystrokes, so
// there is nothing useful to copy into the conversation. Its footer advertises
// the keys it accepts, which is the most reliable signal available.
export function isTerminalOverlay(pane: string): boolean {
  const controls = terminalControlLines(pane)
  if (parseTerminalFormPrompt(controls.join('\n'))) {
    return true
  }
  const tail = controls.slice(-6).join(' ')
  // Footers phrase these as either "esc close" or "esc to cancel", so the
  // connecting word is optional.
  const hints = [
    /esc\s+(?:to\s+)?(?:close|cancel|back|exit|dismiss)/i,
    /↑\/↓\s*(?:to\s+)?navigate/i,
    /tab\s+(?:to\s+)?(?:switch|next|context)/i,
    /enter\s+(?:to\s+)?(?:edit|select|confirm|save|apply)/i,
    /←\/→\s*(?:to\s+)?\w+/i,
  ]
  return hints.filter((hint) => hint.test(tail)).length >= 2
}

// The CLI only offers to interrupt while the agent is working, so this marks
// the frames whose new lines belong to a turn rather than to a command. Just
// after a prompt is sent, Copilot 1.0.98 offers to edit it instead.
export function isTerminalAgentWorking(pane: string): boolean {
  return /esc\s+(?:interrupt|edit\s+prompt)/i.test(terminalControlLines(pane).slice(-6).join(' '))
}

/**
 * Whether the pane itself says the agent is idle: a live prompt and footer
 * exactly as the grammar knows them, with no interrupt key offered. Anything
 * else leaves the question to Copilot's event log.
 */
export function isTerminalVisiblyIdle(pane: string): boolean {
  return terminalComposerFrame(pane.split('\n')) !== undefined &&
    !isTerminalAgentWorking(pane)
}

function isTerminalLoading(pane: string): boolean {
  return /[◉◎]\s*Loading:/i.test(
    terminalControlLines(pane).slice(-6).join(' '),
  )
}

/**
 * Output a slash command added to the pane, or undefined when it produced
 * none. Compares against the frame captured before the command was sent so a
 * redraw of existing content is not mistaken for a response.
 */
// Panels draw borders and bullets that shift between frames, so lines are
// compared in this normalised form rather than as captured.
function normaliseOutputLine(line: string): string {
  return cleanDialogLine(line).replace(/^\s*[●•]\s*/u, '').trim()
}

export function terminalCommandOutput(
  before: string,
  after: string,
  command: string,
): string | undefined {
  // Counted rather than a set: running a command twice prints the same text
  // again, and membership alone would discard the second response entirely.
  const seen = new Map<string, number>()
  for (const line of stripTerminalStatus(before)) {
    const key = normaliseOutputLine(line)
    if (key) {
      seen.set(key, (seen.get(key) || 0) + 1)
    }
  }
  const echo = command.trim().toLowerCase()
  const added: string[] = []
  let afterTip = false
  for (const line of stripTerminalStatus(after)) {
    // The startup tip wraps onto an indented continuation line, which is only
    // chrome directly beneath the tip itself.
    if (afterTip && /^\s*└\s/u.test(line)) {
      continue
    }
    if (isTerminalChrome(line)) {
      afterTip = /^\s*[●•]?\s*Tip:\s/u.test(line)
      continue
    }
    afterTip = false
    const cleaned = normaliseOutputLine(line)
    if (!cleaned || cleaned.toLowerCase() === echo) {
      continue
    }
    const remaining = seen.get(cleaned)
    if (remaining) {
      seen.set(cleaned, remaining - 1)
      continue
    }
    added.push(cleaned)
  }
  if (added.length === 0) {
    return undefined
  }
  return added.join('\n')
}

/**
 * True while the agent is showing its structured form. The header is what the
 * CLI prints above the field tabs, and the key hints are what it prints
 * below them.
 */
/**
 * Waits for a filled form to close, activating its Submit row if it has one.
 *
 * Committing the last field closes a form whose fields are all there is, and
 * leaves focus on Submit in a form that ends with one. Nothing on screen says
 * which kind is open, so the form is given time to close on its own and only
 * then offered an Enter. That Enter is sent while the form is still showing,
 * so one that closed itself never receives a stray keystroke into whatever
 * replaced it.
 */
/**
 * The key that ends each field, in order.
 *
 * Enter accepts a single-choice widget and advances it; Tab only navigates
 * away without accepting its highlight. Text and checklist edits are applied
 * before navigation, and the final field acceptance submits the form.
 */
export function terminalFormCommitKeys(
  fieldCount: number,
  steps: readonly TerminalFormStep[] = [],
): string[] {
  return Array.from({ length: fieldCount }, (_, index) =>
    index === fieldCount - 1 || steps[index]?.kind === 'select' ? 'Enter' : 'Tab',
  )
}

/** Waits for a filled form to close, reporting whether it ever did. */
export async function submitTerminalForm(
  capture: () => Promise<string>,
  settle: (ms: number) => Promise<void>,
  attempts = 24,
): Promise<boolean> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (!parseTerminalFormPrompt(await capture())) {
      return true
    }
    await settle(150)
  }
  return false
}

export function parseTerminalFormPrompt(pane: string): boolean {
  const rawLines = terminalControlLines(pane)
  const lines = rawLines.map(cleanDialogLine)
  const header = lines.findLastIndex((line) =>
    /^Copilot needs information\.?$/i.test(line),
  )
  if (header < 0) {
    return false
  }
  const footer = lines.findLastIndex(
    (line, index) =>
      index > header &&
      /cancel/i.test(line) &&
      /(?:esc|ctrl\+|enter)/i.test(line),
  )
  if (footer < 0 || hasComposerAfter(rawLines, footer)) {
    return false
  }
  return /enter accept/i.test(lines.slice(header, footer + 1).join(' '))
}

/**
 * Which rows the CLI filled to the edge of its box. Those are the only rows a
 * wrap can run through a token on: a shorter row broke where the text allowed
 * it, so its boundary is the space the question has there.
 */
/**
 * The width of the box the dialog is drawing in, taken from its own rules,
 * and where the text on each row ends. A capture without rules is not a
 * padded terminal read, and reports a width of zero.
 */
function terminalBoxWrap(raw: string[]): { width: number; ends: number[] } {
  const width = Math.max(
    0,
    ...raw
      .map((line) => line.trim())
      .filter((line) => /^[─━]{8,}$/u.test(line))
      .map((line) => line.length),
  )
  return {
    width,
    ends: raw.map((line) => line.replace(/[\s│┃╮╯]+$/u, '').length),
  }
}

function terminalFormQuestionEnd(
  lines: string[],
  header: number,
  question: string,
  wrap: { width: number; ends: number[] },
): number {
  const expected = question.replace(/\s+/gu, ' ').trim()
  if (!expected) {
    return header
  }
  let consumed = 0
  let previous = -1
  for (let index = header + 1; index < lines.length; index += 1) {
    const line = lines[index].replace(/\s+/gu, ' ').trim()
    if (!line) {
      continue
    }
    // Form reads use tmux -J for real soft wraps, but the CLI also wraps
    // inside its own box, where the rows are padded and so never joined.
    let start = consumed
    if (consumed > 0) {
      if (expected[consumed] === ' ') {
        // The question has a space here, so that is what the row break is.
        start = consumed + 1
      } else {
        // The row break falls inside a token. The CLI only breaks one when
        // what follows could not fit on the row it is leaving, so the rest of
        // that token has to be too long for the gap left behind. A shorter
        // continuation would have fitted, which means the break was really a
        // space and these are two identifiers rather than one.
        const rest = line.split(' ')[0].length
        if (wrap.width <= 0 || rest <= wrap.width - wrap.ends[previous]) {
          return -1
        }
      }
    }
    if (!expected.startsWith(line, start)) {
      return -1
    }
    consumed = start + line.length
    previous = index
    if (consumed === expected.length) {
      return index
    }
  }
  return -1
}

/**
 * Where the CLI prints the row of tabs naming every field, or -1 when the form
 * on screen is not the one these fields describe. Knowing a form is open says
 * nothing about which request it belongs to; the tabs are what distinguish one
 * prompt from the next.
 */
/**
 * Whether a tab on screen is the field of that name.
 *
 * The CLI writes the tab holding focus inside brackets, and a name compared
 * with that mark still on it never matches, so the form is not recognised as
 * the one being answered. A title can also contain brackets of its own, so
 * the name as written is tried first and the mark only taken off when that
 * leaves nothing.
 */
function tabNames(tab: string, field: string): boolean {
  return tab === field || tab.replace(/^\[(.*)\]$/, '$1') === field
}

function terminalFormTabsLine(
  lines: string[],
  form: TerminalFormIdentity,
  wrap: { width: number; ends: number[] },
): number {
  if (form.fields.length === 0) {
    return -1
  }
  const header = lines.findLastIndex((line) =>
    /^Copilot needs information\.?$/i.test(line),
  )
  if (header < 0) {
    return -1
  }
  // The CLI prints the request's own question between the header and the tabs.
  // Two requests can share a schema, so the question is what separates them.
  const questionAt = terminalFormQuestionEnd(lines, header, form.question, wrap)
  if (questionAt < 0) {
    return -1
  }
  // The first content after the complete question must be its tabs (or the
  // lone field heading). Searching further could match a title in a value or
  // accept only a prefix of a longer, different question.
  const index = lines.findIndex(
    (line, position) => position > questionAt && line.trim().length > 0,
  )
  return index
}

function terminalFormTabsIndex(
  lines: string[],
  form: TerminalFormIdentity,
  wrap: { width: number; ends: number[] },
): number {
  const index = terminalFormTabsLine(lines, form, wrap)
  if (index < 0) {
    return -1
  }
  return terminalFormTabsMatch(lines[index], form) ? index : -1
}

function terminalFormTabsMatch(line: string, form: TerminalFormIdentity): boolean {
  const tabs = line.split(/\s{2,}/).filter(Boolean)
  if (form.fields.length === 1) {
    return tabs.length === 1 && tabs[0].replace(/:$/, '') === form.fields[0]
  }
  return tabs.length === form.fields.length &&
    tabs.every((tab, slot) => tabNames(tab, form.fields[slot]))
}

function hasTerminalFormQuestionReflowCandidate(
  pane: string,
  form: TerminalFormIdentity,
): boolean {
  if (form.fields.length === 0 || !form.question.trim() || !parseTerminalFormPrompt(pane)) {
    return false
  }
  const lines = terminalControlLines(pane).map(cleanDialogLine)
  const header = lines.findLastIndex((line) => /^Copilot needs information\.?$/i.test(line))
  const tabs = lines.findLastIndex(
    (line, index) => index > header && terminalFormTabsMatch(line, form),
  )
  if (header < 0 || tabs <= header) return false
  // This qualifies read-only reflow, never input. The enlarged pane must still
  // pass the complete identity matcher, including its word-boundary checks.
  return lines.slice(header + 1, tabs).join('').replace(/\s/gu, '') ===
    form.question.replace(/\s/gu, '')
}

function hasClippedTerminalFormTabs(
  pane: string,
  form: TerminalFormIdentity,
): boolean {
  if (form.fields.length < 2) {
    return false
  }
  const raw = terminalControlLines(pane)
  const lines = raw.map(cleanDialogLine)
  const index = terminalFormTabsLine(lines, form, terminalBoxWrap(raw))
  if (index < 0) {
    return false
  }
  const row = lines[index]
  const clippedLeft = /^←\s+/u.test(row)
  const clippedRight = /\s+→$/u.test(row)
  if (!clippedLeft && !clippedRight) {
    return false
  }
  const visible = row
    .replace(/^←\s+/u, '')
    .replace(/\s+→$/u, '')
    .split(/\s{2,}/)
    .filter(Boolean)
  if (visible.length === 0 || visible.length >= form.fields.length) {
    return false
  }
  const starts = clippedLeft
    ? clippedRight
      ? Array.from(
          { length: form.fields.length - visible.length + 1 },
          (_, start) => start,
        )
      : [form.fields.length - visible.length]
    : [0]
  return starts.some((start) =>
    visible.every((tab, slot) => tabNames(tab, form.fields[start + slot])),
  )
}

/**
 * Whether the form on screen is the one these fields describe.
 */
/**
 * Which rows of the checklist on screen are ticked, or undefined when the
 * screen does not show a checklist of that size.
 *
 * The CLI marks a ticked row with a check and an unticked one with a bullet,
 * and the cursor sits to the left of either. What the reader chose in the app
 * says nothing about what the list is showing: an attached terminal can have
 * changed any of it since, and the schema's defaults describe how the list
 * opened rather than how it stands.
 */
export function terminalChecklistState(
  pane: string,
  optionCount: number,
): boolean[] | undefined {
  const marks: boolean[] = []
  for (const raw of pane.split('\n').map(cleanDialogLine)) {
    const marked = /^(?:❯\s*)?([✓✔•·])\s+\S/u.exec(raw)
    if (marked) {
      marks.push(marked[1] === '✓' || marked[1] === '✔')
      continue
    }
    if (marks.length > 0 && marks.length !== optionCount) {
      // A run that does not match the list being answered says the screen is
      // showing something else, so the next run is looked at instead.
      marks.length = 0
    }
  }
  return marks.length === optionCount ? marks : undefined
}

export function terminalFormShowsFields(
  pane: string,
  form: TerminalFormIdentity,
): boolean {
  const raw = terminalControlLines(pane)
  return terminalFormTabsIndex(
    raw.map(cleanDialogLine), form, terminalBoxWrap(raw),
  ) >= 0
}

/**
 * The field the form currently has focused. An attached terminal can move it,
 * and answers are written from the first field onwards, so it has to be read
 * rather than assumed. The CLI repeats the focused field's title below the
 * tabs, followed by a colon when that field is a list.
 */
export function parseTerminalFormActiveField(
  pane: string,
  form: TerminalFormIdentity,
): number | undefined {
  // A repeated title would make the focused field ambiguous, and guessing
  // which one it is would shift every answer, so it is not attempted.
  if (new Set(form.fields).size !== form.fields.length) {
    return undefined
  }
  const raw = terminalControlLines(pane)
  const lines = raw.map(cleanDialogLine)
  const tabs = terminalFormTabsIndex(lines, form, terminalBoxWrap(raw))
  if (tabs < 0) {
    return undefined
  }
  for (let index = tabs + 1; index < lines.length; index += 1) {
    const position = form.fields.indexOf(lines[index].replace(/:$/, ''))
    if (position >= 0) {
      return position
    }
  }
  // A form of one field prints its heading once, and that heading is the row
  // the tabs were read from, so there is nothing below it to find. There is
  // also nowhere else the focus could be.
  return form.fields.length === 1 ? 0 : undefined
}

export function parseTerminalUserInput(
  pane: string,
): PendingUserInput | undefined {
  const rawLines = pane.split('\n')
  const lines = rawLines.map(cleanDialogLine)
  const questionHeader = lines.findLastIndex((line) => line === 'Question')
  if (questionHeader < 0) {
    return undefined
  }
  const frame = activeBottomFrame(rawLines, questionHeader)
  if (!frame) {
    return undefined
  }
  const activeLines = lines.slice(frame.start, frame.end + 1)
  const activeHeader = activeLines.findIndex((line) => line === 'Question')
  if (activeHeader < 0) {
    return undefined
  }

  const questionLines: string[] = []
  const choices: string[] = []
  let allowFreeform = false
  let hasFooter = false
  for (const line of activeLines.slice(activeHeader + 1)) {
    if (!line || /^[─━]+$/u.test(line)) {
      continue
    }
    if (/^(?:❯\s*)?type your answer/i.test(line)) {
      allowFreeform = true
      continue
    }
    const choice = line.match(/^(?:❯\s*)?(\d+)\.\s+(.+)$/u)
    if (choice) {
      const label = choice[2].trim()
      if (/type your answer/i.test(label)) {
        allowFreeform = true
      } else {
        choices.push(label)
      }
      continue
    }
    if (choices.length > 0 || allowFreeform) {
      if (
        /select|confirm|cancel|submit/i.test(line) &&
        /enter|esc|↑|↓/i.test(line)
      ) {
        hasFooter = true
        break
      }
      continue
    }
    questionLines.push(line)
  }
  const question = questionLines.join(' ').trim()
  if (
    !question ||
    !hasFooter ||
    (choices.length === 0 && !allowFreeform)
  ) {
    return undefined
  }
  const fingerprint = createHash('sha256')
    .update(JSON.stringify({ question, choices, allowFreeform }))
    .digest('hex')
    .slice(0, 24)
  return {
    requestId: `terminal:${fingerprint}`,
    question,
    choices,
    allowFreeform,
  }
}

export function parseTerminalPermission(
  pane: string,
): PendingPermission | undefined {
  const sessionInUse = parseTerminalSessionInUse(pane)
  if (sessionInUse) {
    return sessionInUse
  }
  const folderTrust = parseTerminalFolderTrust(pane)
  if (folderTrust) {
    return folderTrust
  }
  const rawLines = terminalControlLines(pane)
  const lines = rawLines.map(cleanDialogLine)
  const commandQuestion = findTerminalWrappedText(
    lines,
    'Do you want to run this command?',
  )
  if (!commandQuestion) {
    return undefined
  }
  const commandFrame = activeBottomFrame(rawLines, commandQuestion.start)
  if (!commandFrame) {
    const footer = lines.findIndex(
      (line, index) =>
        index > commandQuestion.end &&
        /to navigate/i.test(line) &&
        /enter to select/i.test(line) &&
        /esc to cancel/i.test(line),
    )
    if (
      footer < 0 ||
      lines.slice(footer + 1).some((line) => Boolean(line))
    ) {
      return undefined
    }
  }
  const commandLines = commandFrame
    ? lines.slice(commandFrame.start, commandFrame.end + 1)
    : lines
  const framedQuestion = findTerminalWrappedText(
    commandLines,
    'Do you want to run this command?',
  )
  if (!framedQuestion) {
    return undefined
  }
  const questionIndex = framedQuestion.start
  const nonemptyBeforeQuestion = commandLines
    .slice(Math.max(0, questionIndex - 40), questionIndex)
    .flatMap((line, offset) =>
      line ? [{ line, index: Math.max(0, questionIndex - 40) + offset }] : [],
    )
  let title: string | undefined
  let dialogStart = Math.max(0, questionIndex - 40)
  for (let index = 0; index < nonemptyBeforeQuestion.length - 2; index += 1) {
    const first = nonemptyBeforeQuestion[index]
    const second = nonemptyBeforeQuestion[index + 1]
    const third = nonemptyBeforeQuestion[index + 2]
    if (
      first &&
      second &&
      third &&
      /^[─━]+$/u.test(first.line) &&
      !/^[─━]+$/u.test(second.line) &&
      /^[─━]+$/u.test(third.line)
    ) {
      title = second.line
      dialogStart = first.index
    }
  }
  if (!title) {
    return undefined
  }
  const dialog = commandLines.slice(dialogStart)
  const choices = terminalDialogChoices(dialog)
  const hasYes = choices.some(
    (choice) => choice.index === 1 && /^Yes\b/i.test(choice.label),
  )
  const hasNo = choices.some((choice) => /^No\b/i.test(choice.label))
  if (!hasYes || !hasNo) {
    return undefined
  }
  const fingerprint = createHash('sha256')
    .update(
      dialog
        .filter(
          (line) =>
            line &&
            !(
              /to navigate/i.test(line) &&
              /enter to select/i.test(line)
            ),
        )
        .join('\n'),
    )
    .digest('hex')
    .slice(0, 24)
  return {
    requestId: `terminal-permission:${fingerprint}`,
    title,
    kind: 'terminal',
    choiceCount: Math.max(...choices.map((choice) => choice.index)),
    options: [
      { optionId: 'terminal:allow', name: 'Yes', kind: 'allow_once' },
      { optionId: 'terminal:stop', name: 'Stop', kind: 'reject_once' },
    ],
  }
}

function hasTerminalCommandPermissionQuestion(pane: string): boolean {
  const rawLines = pane.split('\n')
  const lines = rawLines.map(cleanDialogLine)
  const question = findTerminalWrappedText(
    lines,
    'Do you want to run this command?',
  )
  return Boolean(question && activeBottomFrame(rawLines, question.start))
}

function terminalDialogChoices(
  lines: string[],
): Array<{ index: number; label: string }> {
  const choices: Array<{ index: number; label: string }> = []
  let current: { index: number; label: string } | undefined
  for (const line of lines) {
    const choice = line.match(/^(?:❯\s*)?(\d+)\.\s+(.+)$/u)
    if (choice) {
      current = {
        index: Number.parseInt(choice[1], 10),
        label: choice[2].trim(),
      }
      choices.push(current)
      continue
    }
    if (!current || !line) {
      continue
    }
    if (
      /(?:navigate|select|confirm|cancel|decline|toggle)/i.test(line) &&
      /(?:enter|esc|↑|↓|←|→|tab|ctrl)/i.test(line)
    ) {
      break
    }
    current.label = `${current.label} ${line}`.replace(/\s+/gu, ' ').trim()
  }
  return choices
}

function findTerminalWrappedText(
  lines: string[],
  expected: string,
): { start: number; end: number } | undefined {
  const normalizedExpected = expected.replace(/\s+/gu, ' ').trim()
  let found: { start: number; end: number } | undefined
  for (let start = 0; start < lines.length; start += 1) {
    if (!lines[start]) {
      continue
    }
    for (
      let end = start;
      end < Math.min(lines.length, start + 5);
      end += 1
    ) {
      const candidate = lines
        .slice(start, end + 1)
        .join(' ')
        .replace(/\s+/gu, ' ')
        .trim()
      if (candidate === normalizedExpected) {
        found = { start, end }
      }
      if (candidate.length > normalizedExpected.length) {
        break
      }
    }
  }
  return found
}

function parseTerminalSessionInUse(pane: string): PendingPermission | undefined {
  if (hasTerminalCommandPermissionQuestion(pane)) return undefined
  const rawLines = terminalControlLines(pane)
  const lines = rawLines.map(cleanDialogLine)
  const header = lines.findLastIndex((line) => line === 'Session in use')
  if (header < 0) {
    return undefined
  }
  const frame = activeBottomFrame(rawLines, header)
  if (!frame && lines.slice(0, header).some((line) => !isTerminalChrome(line))) {
    return undefined
  }
  const dialog = lines.slice(header + 1, frame ? frame.end + 1 : undefined)
  const footer = dialog.findIndex((line) => /^↑\/↓/u.test(line))
  const footerText = dialog.slice(footer).filter(
    (line) => line && !/^[\u2500-\u257f\u2580-\u259f\s]+$/u.test(line),
  ).join(' ').replace(/\s+/gu, ' ').trim()
  if (
    footer < 0 ||
    !/^↑\/↓\s+(?:to\s+)?navigate\s*·\s*enter\s+(?:to\s+)?select\s*·\s*esc\s+(?:to\s+)?cancel$/iu.test(footerText) ||
    !dialog.some((line) => /^[>❯]\s*(?:1\.\s+Resume anyway|2\.\s+Go back)/i.test(line))
  ) {
    return undefined
  }
  const choices = dialog.flatMap((line) => {
    const choice = /^(?:❯\s*)?(\d+)\.\s+(.+)$/u.exec(line)
    return choice ? [{ index: Number(choice[1]), label: choice[2] }] : []
  })
  if (
    (!frame && !/in use by another CLI or application/.test(dialog.join(' '))) ||
    choices.length !== 2 ||
    choices[0].index !== 1 || choices[0].label !== 'Resume anyway' ||
    choices[1].index !== 2 || choices[1].label !== 'Go back (Esc)'
  ) {
    return undefined
  }
  // Relative activity times and the highlighted row can change while the
  // reader decides. The session-scoped action and option order stay the same.
  const fingerprint = createHash('sha256')
    .update(JSON.stringify({ kind: 'session-in-use', choices }))
    .digest('hex')
    .slice(0, 24)
  return {
    requestId: `terminal-permission:${fingerprint}`,
    title: 'Session in use. Resuming here may conflict with another CLI or application.',
    kind: 'terminal',
    choiceCount: 2,
    options: [
      { optionId: 'terminal:allow', name: 'Resume anyway', kind: 'allow_once' },
      { optionId: 'terminal:stop', name: 'Go back', kind: 'reject_once' },
    ],
  }
}

function parseTerminalFolderTrust(pane: string): PendingPermission | undefined {
  const rawLines = terminalControlLines(pane)
  const cleaned = rawLines.map(cleanDialogLine)
  const trustQuestion = findTerminalWrappedText(
    cleaned,
    'Do you trust the files in this folder?',
  )
  const frame = trustQuestion && activeBottomFrame(rawLines, trustQuestion.start)
  if (!frame) {
    return undefined
  }
  const lines = cleaned.slice(frame.start, frame.end + 1)
  // A command may quote the entire trust dialog, even across wrapped lines.
  // Never treat that command's confirmation as permission to trust a folder.
  if (findTerminalWrappedText(lines, 'Do you want to run this command?')) {
    return undefined
  }
  const header = lines.findLastIndex((line) => line === 'Confirm folder trust')
  const question = findTerminalWrappedText(
    lines,
    'Do you trust the files in this folder?',
  )
  if (header < 0 || !question || question.start <= header) {
    return undefined
  }
  const folderStart = lines.findIndex(
    (line, index) =>
      index > header && index < question.start && /^(?:\/|[a-z]:[\\/]|\\\\)/i.test(line),
  )
  if (folderStart < 0) {
    return undefined
  }
  const folderEnd = lines.findIndex(
    (line, index) => index > folderStart && /^[─━]+$/u.test(line),
  )
  if (folderEnd < 0 || folderEnd >= question.start) {
    return undefined
  }
  const folder = lines.slice(folderStart, folderEnd).join('\n')
  const dialog = lines.slice(question.end + 1)
  const choices = terminalDialogChoices(dialog)
  const normalizedDialog = dialog.join(' ').replace(/\s+/gu, ' ')
  if (
    !dialog.some((line) => /^[>❯]\s*\d+\.\s/u.test(line)) ||
    !/↑\/↓\s+(?:to\s+)?navigate/i.test(normalizedDialog) ||
    !/enter\s+(?:to\s+)?select/i.test(normalizedDialog) ||
    !/esc\s+(?:to\s+)?cancel/i.test(normalizedDialog) ||
    choices.length !== 3 ||
    choices[0].index !== 1 || choices[0].label !== 'Yes' ||
    choices[1].index !== 2 || choices[1].label !== 'Yes, and remember this folder for future sessions' ||
    choices[2].index !== 3 || choices[2].label !== 'No (Esc)'
  ) {
    return undefined
  }
  const fingerprint = createHash('sha256')
    .update(JSON.stringify({ folder, choices }))
    .digest('hex')
    .slice(0, 24)
  return {
    requestId: `terminal-permission:${fingerprint}`,
    title: `Trust folder for this session: ${folder}`,
    kind: 'terminal',
    choiceCount: 3,
    options: [
      { optionId: 'terminal:allow', name: 'Trust for this session', kind: 'allow_once' },
      { optionId: 'terminal:stop', name: 'Stop', kind: 'reject_once' },
    ],
  }
}

async function listTmuxSessions(): Promise<TmuxSessionInfo[]> {
  try {
    const output = (
      await execFileAsync('tmux', [
        'list-sessions',
        '-F',
        '#{session_name}\t#{session_attached}\t#{session_created}',
      ])
    ).stdout
    return output
      .trim()
      .split('\n')
      .flatMap((line) => {
        const [name, attached, createdAt] = line.split('\t', 3)
        return name
          ? [
              {
                name,
                attached: Number.parseInt(attached, 10) || 0,
                createdAt: Number.parseInt(createdAt, 10) || 0,
              },
            ]
          : []
      })
  } catch (error) {
    if (tmuxNotInstalled(error) || (await noTmuxServer(error))) {
      return []
    }
    throw error
  }
}

function safeWindowName(title: string): string {
  const sanitized = [...path.basename(title)]
    .filter((character) => {
      const code = character.charCodeAt(0)
      return code >= 32 && code !== 127
    })
    .join('')
    .trim()
  return (sanitized || 'copilot').slice(0, 80)
}

async function processCommand(pid: number): Promise<string[]> {
  const command = (await readFile(`/proc/${pid}/cmdline`, 'utf8'))
    .split('\0')
    .filter(Boolean)
  if (command.length === 0) {
    throw new Error(`Unable to read command line for Copilot PID ${pid}`)
  }
  return command
}

async function copilotCommand(
  pid: number,
  sessionId: string,
  runtime?: ConfigureRuntimeInput,
): Promise<string[]> {
  const original = await processCommand(pid)
  const result = [original[0]]
  const optionsWithValues = new Set([
    '--session-id',
    '--model',
    '--effort',
    '--reasoning-effort',
    '--context',
    '--mode',
  ])
  const runtimeOptions = new Set([
    '--model',
    '--effort',
    '--reasoning-effort',
    '--context',
    '--mode',
  ])
  for (let index = 1; index < original.length; index += 1) {
    const argument = original[index]
    const option = argument.split('=', 1)[0]
    if (
      option === '--session-id' ||
      option === '--resume' ||
      option === '-r' ||
      option === '--continue'
    ) {
      if (
        !argument.includes('=') &&
        (option === '--session-id' ||
          ((option === '--resume' || option === '-r') &&
            original[index + 1] &&
            !original[index + 1].startsWith('-')))
      ) {
        index += 1
      }
      continue
    }
    if (runtime && runtimeOptions.has(option)) {
      if (!argument.includes('=') && optionsWithValues.has(option)) {
        index += 1
      }
      continue
    }
    result.push(argument)
  }
  result.push('--session-id', sessionId)
  if (runtime) {
    result.push(
      '--model',
      runtime.model,
      '--context',
      runtime.contextTier,
      ...(runtime.reasoningEffort
        ? ['--effort', runtime.reasoningEffort]
        : []),
      ...(runtime.mode ? ['--mode', runtime.mode] : []),
    )
  }
  return result
}

/**
 * Whether a pane is already showing text that was pasted into it.
 *
 * A pane wraps a long line at whatever column it ends on, and the break can
 * fall inside a word. The composer also adds a border to each wrapped line.
 * Strip those line edges and whitespace before comparing the visible text.
 */
export function paneEvidenceCount(
  pane: string,
  expected: string,
  pasted = expected,
): number {
  const compact = (value: string) => value.replace(/\s+/g, '')
  const wanted = compact(expected)
  if (!wanted) {
    return 0
  }
  let found = 0
  let index = 0
  const rendered = compact(
    pane.split('\n').map(cleanDialogLine).join(''),
  )
  const haystack = rendered.replace(PASTED_PLACEHOLDERS, '')
  for (;;) {
    const at = haystack.indexOf(wanted, index)
    if (at < 0) {
      break
    }
    found += 1
    index = at + wanted.length
  }
  // Copilot collapses a large paste into a placeholder instead of echoing it,
  // so one is evidence only for a send big enough to have produced one.
  // Counting them for every send let an attached user's own paste stand in for
  // this one, and Enter would then submit whatever they had written.
  //
  // Measured against the whole send rather than the line being matched. Only
  // the final line is looked for on the pane, and a long multi-line paste can
  // end in a short one: judged by that line alone, the placeholder it really
  // did produce went unrecognised and the paste was left behind to be sent
  // twice.
  return found + qualifyingPasteCount(rendered, pasted)
}

/**
 * Whether a pane has gained the text that was just pasted into it.
 *
 * The same message can be sent twice, and the pane keeps the scrollback of
 * everything before it, so its mere presence proves nothing. Only one more
 * occurrence than the pane already had does.
 */
export function paneShowsText(
  pane: string,
  expected: string,
  before = 0,
  pasted = expected,
): boolean {
  if (!expected.replace(/\s+/g, '')) {
    return true
  }
  return paneEvidenceCount(pane, expected, pasted) > before
}

/**
 * Waits for pasted text to reach the pane, reporting whether it ever did.
 * A caller that pressed Enter without knowing would submit whatever the
 * prompt happened to hold, and report a message as delivered that the
 * terminal never received.
 */

/**
 * Whether the composer is holding anything of its own.
 *
 * Ctrl+U takes the whole composer, so it may only be used once the composer is
 * known to have been empty before the paste. Anything unreadable counts as
 * holding text: leaving a paste behind is recoverable, and typing over
 * someone's unsent message is not.
 */
/**
 * What the CLI writes into an empty composer.
 *
 * Only these exact forms count as empty. Anything else is someone's message.
 */
const COMPOSER_PLACEHOLDERS = [
  /^Message agent on .+(?:\u2026|\.\.\.)$/iu,
  /^Type a message(?:\u2026|\.\.\.)$/iu,
  // What the CLI writes into an empty composer instead of a placeholder: a
  // reminder of what the prefixes do. Read as somebody's message, it stopped
  // a paste ever being taken back.
  /^Type @ to mention files, # for issues\/PRs, \/ for commands$/iu,
]

/**
 * Whether the composer is holding anything other than the paste being taken
 * back.
 *
 * Ctrl+U takes the whole composer, so the only safe moment to use it is when
 * nothing has arrived beside the text it is meant to remove.
 */
export function composerHoldsOtherText(
  paneBefore: string,
  paneAfter: string,
  pasted: string,
): boolean {
  if (!composerHoldsText(paneAfter)) {
    return false
  }
  // Compared the way the evidence count compares: the composer wraps inside
  // words, so `deployment-orches` / `tration-controller` is one line rendered
  // as two, and a line-by-line comparison never finds what was pasted.
  const compact = (value: string) => value.replace(/\s+/gu, '')
  const after = composerText(paneAfter)
  if (after === undefined) {
    // The same rule as before the paste: a composer that cannot be read is
    // treated as holding somebody's message, because Ctrl+U takes all of it.
    return true
  }
  const before = compact(composerText(paneBefore) || '')
  let remainder = compact(after)
  // A paste too large to echo is shown as `[Pasted text #3]` rather than its
  // own text, so removing the lines that were sent leaves the placeholder
  // behind and reads as somebody else's writing.
  //
  // Exactly one placeholder is discounted, and only if exactly one appeared.
  // Someone pasting at the terminal during the wait adds one too, and there
  // is no way to tell which is which, so nothing is taken back in that case.
  // A placeholder is this paste's only if the paste is large enough to have
  // produced one. A short send that never landed, beside a terminal user's own
  // large paste, was being credited with their placeholder and taking it away.
  // The raw payload, not the compacted rendering. The CLI decides by what it
  // received, and compaction removes every space and newline: hundreds of
  // one-character lines are a large paste that measures small once joined, and
  // the placeholder it produced was then refused as evidence.
  const couldHavePlaceholder = pasteCouldCollapse(pasted)
  if (
    couldHavePlaceholder &&
    pastedPlaceholderCount(remainder) - pastedPlaceholderCount(before) === 1 &&
    qualifyingPasteCount(remainder, pasted) - qualifyingPasteCount(before, pasted) === 1
  ) {
    remainder = remainder.replace(PASTED_PLACEHOLDER, ' ')
  }
  // Likewise for the text itself, and at most once per line. This paste put
  // each line there once, so a second copy is somebody else typing the same
  // thing and is not this paste's to take away.
  for (const line of pasted.split('\n').map((entry) => compact(entry))) {
    if (!line) {
      continue
    }
    if (occurrences(remainder, line) > occurrences(before, line)) {
      remainder = remainder.replace(line, ' ')
    }
  }
  // Only the prompt marker and the placeholder are discounted here. Stray
  // punctuation is somebody's writing: a composer holding nothing but `...`
  // is still holding something, and Ctrl+U would take it.
  // Only the composer's own leading marker is dropped. Removing every one of
  // these characters read a quote marker somebody typed as nothing at all.
  return remainder.replace(/^[>\u276f]/u, '').replace(/\s/gu, '').length > 0
}

// Matched against composer text with its whitespace removed, because the
// composer wraps inside words and the placeholder is no exception.
// Legacy CLIs collapse long text; the current CLI also collapses more than ten
// logical lines, even when those lines contain only a few characters.
const PASTE_ECHO_LIMIT = 800
const PASTE_LINE_LIMIT = 10

const PASTED_PLACEHOLDER = /\[(?:Pastedtext[^\]]*|Paste#\d+-(\d+)lines?)\]/u
const PASTED_PLACEHOLDERS = new RegExp(PASTED_PLACEHOLDER.source, 'gu')

function pasteCouldCollapse(pasted: string): boolean {
  return pasted.length > PASTE_ECHO_LIMIT ||
    pasted.trimEnd().split('\n').length > PASTE_LINE_LIMIT
}

function qualifyingPasteCount(text: string, pasted: string): number {
  if (!pasteCouldCollapse(pasted)) {
    return 0
  }
  const lineCounts = new Set([
    pasted.split('\n').length,
    pasted.trimEnd().split('\n').length,
    pasted.trim().split('\n').length,
  ])
  return [...text.matchAll(PASTED_PLACEHOLDERS)].filter(
    (match) => match[1] === undefined
      ? pasted.length > PASTE_ECHO_LIMIT
      : lineCounts.has(Number(match[1])),
  ).length
}

function occurrences(text: string, needle: string): number {
  if (!needle) {
    return 0
  }
  return text.split(needle).length - 1
}

function pastedPlaceholderCount(text: string): number {
  return (text.match(PASTED_PLACEHOLDERS) || []).length
}

/** The composer's contents, or nothing when the pane cannot be read. */
function composerText(pane: string): string | undefined {
  const lines = pane.split('\n').map((line) => line.trimEnd())
  const frame = terminalComposerFrame(lines, false, composerFocusWitnessed(pane))
  if (!frame) return undefined
  const text = composerFrameText(lines, frame)
  // An unfamiliar marker is read as the familiar one, so the checks below
  // still tell the prompt's own marker from somebody's writing.
  return frame.marker && text.startsWith(frame.marker)
    ? `\u276f${text.slice(frame.marker.length)}`
    : text
}

export function composerHoldsText(pane: string): boolean {
  const text = composerText(pane)
  if (text === undefined) {
    return true
  }
  if (!text) {
    return false
  }
  // An empty composer still draws its prompt marker and the placeholder the
  // CLI writes into it. Matched exactly: treating anything that opens with
  // "Message" as empty reads a real message about to be sent -- "Message the
  // team about the deploy" -- as nothing at all, and Ctrl+U then takes it.
  const bare = text.replace(/^[>\u276f]\s*/u, '').trim()
  if (!bare) {
    return false
  }
  return !COMPOSER_PLACEHOLDERS.some((pattern) => pattern.test(bare))
}

async function capturePane(target: string, timeout?: number): Promise<string> {
  return captureTerminal(target, 30, timeout)
}

/**
 * Captures a pane with `history` lines of scrollback, and in the same tmux
 * command reads the cursor and the visible screen, so whether the prompt had
 * the keyboard is known for exactly this frame (see `composerFocusedPanes`).
 */
async function captureTerminal(
  target: string,
  history: number,
  timeout?: number,
): Promise<string> {
  const marker = `agentic-remote-cursor-${randomUUID()}`
  const { stdout } = await execFileAsync('tmux', [
    'capture-pane', '-J', '-p', '-t', target, '-S', `-${history}`,
    ';', 'display-message', '-p', '-t', target, `${marker} #{cursor_flag} #{cursor_y}`,
    ';', 'capture-pane', '-p', '-t', target,
  ], { timeout })
  const at = stdout.lastIndexOf(`${marker} `)
  if (at < 0) return stdout
  const pane = stdout.slice(0, at)
  const rest = stdout.slice(at)
  const end = rest.indexOf('\n')
  const [, flag, row] = (end < 0 ? rest : rest.slice(0, end)).split(' ')
  const visible = end < 0 ? [] : rest.slice(end + 1).replace(/\n$/u, '').split('\n')
  if (terminalComposerFrame(pane.split('\n')) !== undefined) return pane
  if (composerHasFocus(visible, flag === '1', Number(row))) {
    rememberComposerFocus(pane)
    reportUnrecognisedComposerParts(visible)
  } else {
    composerFocusedPanes.delete(pane)
  }
  return pane
}

/**
 * Whether the composer has taken this paste, judged by what changed in it.
 *
 * Counting occurrences across the whole pane credits chrome the CLI was
 * already drawing. The empty-composer hint names files and commands, so a
 * prompt sharing a word with it was found before it had arrived -- and
 * replacing that hint with the paste left the count where it was, so the send
 * was reported as never landing while the text sat in the prompt.
 */
export function composerTookPaste(
  paneBefore: string,
  paneAfter: string,
  expected: string,
  pasted = expected,
): boolean {
  const compact = (value: string) => value.replace(/\s+/gu, '')
  const wanted = compact(expected)
  if (!wanted) {
    return true
  }
  const drawnAfter = composerText(paneAfter)
  const drawnBefore = composerText(paneBefore)
  if (drawnAfter === undefined && drawnBefore === undefined) {
    // No composer to read. Not every pane draws one -- an agent mid-dialog, or
    // something that is not the CLI at all -- and the pane itself is then the
    // only evidence there is.
    const compactAfter = compact(paneAfter)
    const compactBefore = compact(paneBefore)
    const allAdded =
      pastedPlaceholderCount(compactAfter) -
      pastedPlaceholderCount(compactBefore)
    if (allAdded > 0) {
      return (
        allAdded === 1 &&
        qualifyingPasteCount(compactAfter, pasted) -
          qualifyingPasteCount(compactBefore, pasted) ===
          1
      )
    }
    return (
      paneEvidenceCount(paneAfter, expected, pasted) >
      paneEvidenceCount(paneBefore, expected, pasted)
    )
  }
  // The CLI's own hint is not anybody's text, on either side of the paste.
  // Read as content it made a composer that is empty look like one holding
  // the very words being waited for.
  const after = composerHoldsText(paneAfter) ? compact(drawnAfter || '') : ''
  if (!after) {
    return false
  }
  // A composer holding only the CLI's own hint is holding nothing of anyone's,
  // and the hint names files and commands. Counted as text that was already
  // there, a paste of exactly one of those words looked like no change at all,
  // and the send was reported as never landing.
  const before = composerHoldsText(paneBefore) ? compact(drawnBefore || '') : ''
  // A paste too large to echo is shown as a placeholder instead of its text,
  // and only a send big enough to have produced one may claim it.
  const plainAfter = after.replace(PASTED_PLACEHOLDERS, '').replace(/^[>\u276f]/u, '')
  const plainBefore = before.replace(PASTED_PLACEHOLDERS, '').replace(/^[>\u276f]/u, '')
  const newPlaceholders = pastedPlaceholderCount(after) - pastedPlaceholderCount(before)
  if (newPlaceholders > 0) {
    return newPlaceholders === 1 &&
      qualifyingPasteCount(after, pasted) - qualifyingPasteCount(before, pasted) === 1 &&
      plainAfter === plainBefore
  }
  const occurrences = (haystack: string, needle: string) => {
    let found = 0
    let index = 0
    for (;;) {
      const at = haystack.indexOf(needle, index)
      if (at < 0) {
        return found
      }
      found += 1
      index = at + needle.length
    }
  }
  // One more than the composer already held. The same text may have been
  // typed there and left, and its mere presence would prove nothing.
  if (occurrences(plainAfter, wanted) > occurrences(plainBefore, wanted)) {
    return true
  }
  // Long logical lines scroll within the CLI's bounded composer. An empty
  // composer gaining a substantial suffix of the paste is still evidence;
  // the caller waits for this rendering to settle before pressing Enter.
  return drawnBefore !== undefined &&
    !before &&
    plainAfter.length >= 64 &&
    plainAfter.length < wanted.length &&
    wanted.endsWith(plainAfter)
}

async function waitForComposerPaste(
  target: string,
  paneBefore: string,
  expected: string,
  pasted: string,
  attempts = 40,
): Promise<boolean> {
  let previousMatch: string | undefined
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const pane = await capturePane(target)
    if (
      composerTookPaste(paneBefore, pane, expected, pasted)
    ) {
      const rendered = composerText(pane) ?? pane
      if (rendered === previousMatch) {
        return true
      }
      previousMatch = rendered
    } else {
      previousMatch = undefined
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  return false
}

/** Whether a tmux command failed because there is no server left to ask. */

async function tmuxTargetForPid(
  pid: number,
): Promise<{ target: string; rootPid: number } | undefined> {
  let output = ''
  try {
    output = (
      await execFileAsync('tmux', [
        'list-panes',
        '-a',
        '-F',
        // The pane id rather than `session:window.pane`. The index form is
        // recomputed whenever panes are moved, closed, or renumbered, so a
        // target resolved before an await could name a different pane by the
        // time it is used -- and killing it would take somebody else's work.
        // A pane id belongs to one pane for as long as it exists.
        '#{pane_pid}\t#{pane_id}',
      ])
    ).stdout
  } catch (error) {
    if (tmuxNotInstalled(error)) {
      return undefined
    }
    // Killing the last pane in the last session ends tmux itself, and the
    // next lookup then fails rather than reporting nothing. That is the
    // ordinary way a suspension finishes, so it reads as absence: raising here
    // reported failure for work that had already succeeded, leaving the
    // session never recorded as suspended.
    if (await noTmuxServer(error)) {
      return undefined
    }
    throw error
  }
  const ancestors = await processAncestors(pid)
  for (const line of output.split('\n')) {
    const [panePid, target] = line.split('\t', 2)
    const root = Number.parseInt(panePid, 10)
    if (target && ancestors.has(root)) {
      // Both: the pane is named by its id, and the process tmux compares
      // against is the pane's own root. A session started beneath a shell or a
      // wrapper is an ancestor away from that root, and comparing the Copilot
      // process instead made tmux decline every kill.
      return { target, rootPid: root }
    }
  }
  return undefined
}

/**
 * Whether a process is still there to be ended.
 *
 * Signal 0 asks the kernel directly and returns without waiting, so this adds
 * no moment between the last check and the teardown. Reading `/proc` here
 * instead put an await after confirmation, and a turn started at the terminal
 * inside it went down with the pane.
 */
function processIsAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    // Alive but not ours to signal is still alive.
    return (error as NodeJS.ErrnoException).code === 'EPERM'
  }
}

async function processAncestors(pid: number): Promise<Set<number>> {
  const ancestors = new Set<number>()
  let current = pid
  while (current > 1 && !ancestors.has(current)) {
    ancestors.add(current)
    try {
      const stat = await readFile(`/proc/${current}/stat`, 'utf8')
      const fields = stat.slice(stat.lastIndexOf(')') + 1).trim().split(/\s+/)
      current = Number.parseInt(fields[1], 10)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        break
      }
      throw error
    }
  }
  return ancestors
}
