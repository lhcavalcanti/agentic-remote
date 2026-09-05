import { execFile } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { readFile, readlink, realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { findActiveCopilotProcesses } from './active-sessions.js'
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
 * between them is Tab, and Enter accepts the whole form, so Enter is pressed
 * once, at the end.
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

export interface TerminalSessionController {
  create?(
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
    clearState: () => Promise<void>,
  ): Promise<boolean>
  restart?(sessionId: string, cwd: string): Promise<boolean>
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
  ): Promise<boolean>
  has(sessionId: string): Promise<boolean>
  send(sessionId: string, content: string, enqueue: boolean): Promise<boolean>
  cancel(sessionId: string): Promise<boolean>
  capture?(sessionId: string): Promise<string | undefined>
  /**
   * Whether a prompt is already inside the controller for this session.
   *
   * Sending records itself only after it returns, so the stored status still
   * says idle while one is on its way in. This is the only reading that is
   * true at the moment more keystrokes would be added to the same pane.
   */
  sending?(sessionId: string): boolean
}

export class TmuxTerminalSessionController
  implements TerminalSessionController
{
  private readonly operations = new Map<string, Promise<unknown>>()
  private creationQueue: Promise<void> = Promise.resolve()
  private activeProcessCache?: {
    expiresAt: number
    processes: ReturnType<typeof findActiveCopilotProcesses>
  }

  async create(
    sessionId: string,
    cwd: string,
    title: string,
    allowAllPermissions = true,
    runtime?: SessionRuntimeInfo,
  ): Promise<{ sessionName: string; windowId: string }> {
    const creation = this.creationQueue.then(() =>
      this.createWindow(
        sessionId,
        cwd,
        title,
        allowAllPermissions,
        runtime,
      ),
    )
    this.creationQueue = creation.then(
      () => undefined,
      () => undefined,
    )
    return creation
  }

  async has(sessionId: string): Promise<boolean> {
    return Boolean(await this.target(sessionId))
  }

  async rename(sessionId: string, title: string): Promise<boolean> {
    return this.serialize(sessionId, async () => {
      const target = await this.target(sessionId)
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
      const owner = await this.owner(sessionId)
      if (!owner) {
        return false
      }
      const originalCommand = await processCommand(owner.pid)
      const originalCwd = await readlink(`/proc/${owner.pid}/cwd`)
      const command = await copilotCommand(owner.pid, sessionId, input)
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
        await this.waitForNewOwner(sessionId, owner.pid)
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
          await this.waitForNewOwner(sessionId, owner.pid)
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
    clearState: () => Promise<void>,
  ): Promise<boolean> {
    return this.serialize(sessionId, async () => {
      const owner = await this.owner(sessionId)
      if (!owner) {
        return false
      }
      const originalCommand = await processCommand(owner.pid)
      const command = await copilotCommand(owner.pid, replacementId, input)
      await execFileAsync('tmux', [
        'respawn-pane',
        '-k',
        '-t',
        owner.target,
        '/usr/bin/sleep',
        '300',
      ])
      try {
        await clearState()
        await execFileAsync('tmux', [
          'respawn-pane',
          '-k',
          '-t',
          owner.target,
          '-c',
          cwd,
          ...command,
        ])
        await this.waitForNewOwner(replacementId, owner.pid)
      } catch (error) {
        await execFileAsync('tmux', [
          'respawn-pane',
          '-k',
          '-t',
          owner.target,
          '-c',
          cwd,
          ...originalCommand,
        ]).catch(() => undefined)
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
      const owner = await this.owner(sessionId)
      if (!owner) {
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
      const owner = await this.owner(sessionId)
      if (!owner) {
        return false
      }
      const command = await processCommand(owner.pid)
      await execFileAsync('tmux', [
        'respawn-pane',
        '-k',
        '-t',
        owner.target,
        '-c',
        cwd,
        ...command,
      ])
      await this.waitForNewOwner(sessionId, owner.pid)
      return true
    })
  }

  async pendingUserInput(
    sessionId: string,
  ): Promise<PendingUserInput | undefined> {
    const target = await this.target(sessionId)
    if (!target) {
      return undefined
    }
    const pane = (
      await execFileAsync('tmux', [
        'capture-pane',
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
    const target = await this.target(sessionId)
    if (!target) {
      return undefined
    }
    const pane = (
      await execFileAsync('tmux', [
        'capture-pane',
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
    const target = await this.target(sessionId)
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
  ): Promise<boolean> {    return this.serialize(sessionId, async () => {
      const owner = await this.owner(sessionId)
      if (!owner) {
        return false
      }
      const pane = (
        await execFileAsync('tmux', [
          'capture-pane',
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
      if (optionId !== 'terminal:allow') {
        throw new Error('The selected permission option is not available')
      }
      for (let index = 0; index < (current.choiceCount || 2); index += 1) {
        await execFileAsync('tmux', ['send-keys', '-t', owner.target, 'Up'])
        await new Promise((resolve) => setTimeout(resolve, 30))
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
      const owner = await this.owner(sessionId)
      if (!owner) {
        return false
      }
      const pane = (
        await execFileAsync('tmux', [
          'capture-pane',
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
    const target = await this.target(sessionId)
    if (!target) {
      return undefined
    }
    try {
      return (
        await execFileAsync('tmux', [
          'capture-pane',
          '-p',
          '-t',
          target,
          '-S',
          '-200',
        ])
      ).stdout
    } catch {
      return undefined
    }
  }

  async fillUserInputForm(
    sessionId: string,
    steps: TerminalFormStep[],
    form: TerminalFormIdentity,
  ): Promise<boolean> {
    return this.serialize(sessionId, async () => {
      const owner = await this.owner(sessionId)
      if (
        !owner ||
        steps.length === 0 ||
        form.fields.length === 0 ||
        // Repeated titles make the focused field ambiguous, and the answer is
        // written per position, so the message path is used instead.
        new Set(form.fields).size !== form.fields.length
      ) {
        return false
      }
      const capture = async () =>
        (
          await execFileAsync('tmux', [
            'capture-pane',
            '-p',
            '-t',
            owner.target,
            '-S',
            '-40',
          ])
        ).stdout
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
        await execFileAsync('tmux', ['send-keys', '-t', owner.target, 'BTab'])
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
      const commitKeys = terminalFormCommitKeys(steps.length)
      for (const [position, step] of steps.entries()) {
        if (step.kind === 'checklist') {
          const ticked = terminalChecklistState(await capture(), step.optionCount)
          if (!ticked) {
            // Without knowing what the checklist is showing, pressing space
            // over it would turn the wrong rows on and off. An attached
            // terminal can have changed any of them since the reader chose.
            return false
          }
          // Normalising to the top makes the walk independent of wherever the
          // cursor happens to be sitting.
          for (let index = 0; index <= step.optionCount; index += 1) {
            await execFileAsync('tmux', ['send-keys', '-t', owner.target, 'Up'])
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
              await execFileAsync('tmux', [
                'send-keys',
                '-t',
                owner.target,
                'Space',
              ])
              await new Promise((resolve) => setTimeout(resolve, 35))
            }
            if (index < lastChange) {
              await execFileAsync('tmux', [
                'send-keys',
                '-t',
                owner.target,
                'Down',
              ])
              await new Promise((resolve) => setTimeout(resolve, 35))
            }
          }
        } else if (step.kind === 'select') {
          // Normalising to the top first makes the move independent of
          // whichever option the field currently holds.
          for (let index = 0; index <= step.optionCount; index += 1) {
            await execFileAsync('tmux', [
              'send-keys',
              '-t',
              owner.target,
              'Up',
            ])
            await new Promise((resolve) => setTimeout(resolve, 25))
          }
          for (let index = 0; index < step.index; index += 1) {
            await execFileAsync('tmux', [
              'send-keys',
              '-t',
              owner.target,
              'Down',
            ])
            await new Promise((resolve) => setTimeout(resolve, 35))
          }
        } else {
          // Ctrl+U clears the default the field was prefilled with, which
          // would otherwise keep the typed value appended to it.
          await execFileAsync('tmux', ['send-keys', '-t', owner.target, 'C-u'])
          await new Promise((resolve) => setTimeout(resolve, 35))
          if (step.value) {
            const buffer = `agentic-remote-form-${randomUUID()}`
            await execFileAsync('tmux', [
              'set-buffer',
              '-b',
              buffer,
              '--',
              step.value,
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
            await new Promise((resolve) => setTimeout(resolve, 45))
          }
        }
        // Tab moves to the next field. Enter does not: it accepts the whole
        // form, leaving every field after this one at whatever it opened with,
        // so it is pressed once and only when there is nothing left to fill.
        await execFileAsync('tmux', [
          'send-keys',
          '-t',
          owner.target,
          commitKeys[position],
        ])
        await new Promise((resolve) => setTimeout(resolve, 90))
        if (commitKeys[position] === 'Tab') {
          // The next field is filled from what is on screen, so waiting a
          // fixed moment for the repaint is not enough: a slow one leaves the
          // field just left still showing, and it would be answered again with
          // the next field's values.
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
  }

  async dismissUserInput(
    sessionId: string,
    form?: TerminalFormIdentity,
    action: 'cancel' | 'decline' = 'cancel',
  ): Promise<boolean> {
    return this.serialize(sessionId, async () => {
      const owner = await this.owner(sessionId)
      if (!owner) {
        return false
      }
      if (form && form.fields.length > 0) {
        const pane = (
          await execFileAsync('tmux', [
            'capture-pane',
            '-p',
            '-t',
            owner.target,
            '-S',
            '-40',
          ])
        ).stdout
        // Escape cancels whatever is open, which may be a permission dialog or
        // another request's prompt rather than this form. Only a positive
        // match is closed, so unrelated work is never cancelled.
        if (!terminalFormShowsFields(pane, form)) {
          return false
        }
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

  async cancel(sessionId: string): Promise<boolean> {
    return this.serialize(sessionId, async () => {
      const target = await this.target(sessionId)
      if (!target) {
        return false
      }
      await execFileAsync('tmux', ['send-keys', '-t', target, '-H', '03'])
      return true
    })
  }

  async send(
    sessionId: string,
    content: string,
    enqueue: boolean,
  ): Promise<boolean> {
    return this.serialize(sessionId, async () => {
      const target = await this.target(sessionId)
      if (!target) {
        return false
      }
      // What the pane already holds is not evidence that this message
      // arrived: the same text may have been sent before, and an earlier
      // large paste leaves a placeholder of its own.
      const confirmation = content.split('\n').at(-1) || content
      let paneBeforePaste = await capturePane(target)
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
        paneBeforePaste = await capturePane(target)
      }
      if (isTerminalSessionInUsePrompt(paneBeforePaste)) {
        throw Object.assign(
          new Error(
            'Copilot needs confirmation to resume this session. Choose Resume anyway or Go back in the permission card.',
          ),
          { statusCode: 409 },
        )
      }
      if (
        composerText(paneBeforePaste) !== undefined &&
        composerHoldsText(paneBeforePaste)
      ) {
        throw Object.assign(
          new Error(
            'The terminal already has unsent text or a pending paste. Review it there before sending another message.',
          ),
          { statusCode: 409 },
        )
      }
      if (isTerminalOverlay(paneBeforePaste)) {
        throw Object.assign(
          new Error(
            'The terminal is showing a full-screen view. Close it there, then send this again.',
          ),
          { statusCode: 409 },
        )
      }
      const buffer = `agentic-remote-${randomUUID()}`
      await execFileAsync('tmux', [
        'set-buffer',
        '-b',
        buffer,
        '--',
        content,
      ])
      await execFileAsync('tmux', [
        'paste-buffer',
        '-p',
        '-d',
        '-b',
        buffer,
        '-t',
        target,
      ])
      // From here on tmux has the text. Anything that goes wrong afterwards --
      // reading the pane, the tty, the terminal settings, or the Enter itself
      // -- leaves a send that may well have arrived, so it is reported as
      // uncertain rather than as a plain failure the reader should simply
      // retry.
      try {
        return await this.finishSend(
          target,
          content,
          confirmation,
          paneBeforePaste,
          enqueue,
        )
      } catch (error) {
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
    })
  }

  private async finishSend(
    target: string,
    content: string,
    confirmation: string,
    paneBeforePaste: string,
    enqueue: boolean,
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

  private async target(sessionId: string): Promise<string | undefined> {
    return (await this.owner(sessionId))?.target
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
      // No server at all means no pane, which is the ordinary way a
      // suspension finishes. Anything else is a look that failed.
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
  ): Promise<{ pid: number; target: string; rootPid: number } | undefined> {
    const processInfo = (await this.activeProcesses()).find(
      (candidate) => candidate.sessionId === sessionId,
    )
    if (!processInfo) {
      return undefined
    }
    const pane = await tmuxTargetForPid(processInfo.pid)
    return pane
      ? { pid: processInfo.pid, target: pane.target, rootPid: pane.rootPid }
      : undefined
  }

  private activeProcesses(): ReturnType<typeof findActiveCopilotProcesses> {
    const now = Date.now()
    if (this.activeProcessCache && this.activeProcessCache.expiresAt > now) {
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
  ): Promise<void> {
    for (let attempt = 0; attempt < 150; attempt += 1) {
      const owner = await this.owner(sessionId)
      if (owner && owner.pid !== previousPid) {
        return
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
      '--session-id',
      sessionId,
      ...(runtime?.model ? ['--model', runtime.model] : []),
      ...(runtime?.reasoningEffort
        ? ['--effort', runtime.reasoningEffort]
        : []),
      ...(runtime?.contextTier ? ['--context', runtime.contextTier] : []),
      ...(runtime?.mode ? ['--mode', runtime.mode] : []),
    ]
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
    for (let attempt = 0; attempt < 60; attempt += 1) {
      if (await this.target(sessionId)) {
        return { sessionName, windowId }
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    await execFileAsync('tmux', ['kill-window', '-t', windowId]).catch(
      () => undefined,
    )
    throw new Error('Copilot did not start in the new tmux window')
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
  const composer = lines.findLastIndex((line) => COMPOSER_EDGE.test(line))
  // Without a composer the pane is showing a full-screen view, which covers
  // the status bar. The next poll sees it again once the view closes.
  if (composer < 0) {
    return undefined
  }
  for (const line of lines.slice(composer + 1)) {
    const match = /\bv?(\d+\.\d+\.\d+[\w.-]*)\s+available\b/i.exec(line)
    if (match && /\/update\b/.test(line)) {
      return match[1]
    }
  }
  return undefined
}

// The CLI redraws a composer box and a status footer on every frame, so a
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

// The composer box always sits below the transcript, and the status footer
// below that. Both redraw with changing values -- token counts, diff stats --
// so matching each variant is futile; drop the whole region instead. The top
// border of the composer marks where it begins.
const COMPOSER_TOP = /^\s*[╻╭][\u2580-\u259f\u2500-\u257f]*\s*$/u

function stripTerminalStatus(pane: string): string[] {
  const lines = pane.split('\n').map((line) => line.trimEnd())
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (COMPOSER_TOP.test(lines[index])) {
      return lines.slice(0, index)
    }
  }
  return lines
}

function terminalControlLines(pane: string): string[] {
  const lines = pane.split('\n')
  while (lines.length > 0 && !lines[lines.length - 1].trim()) {
    lines.pop()
  }
  // The bottom of the CLI composer separates transcript/draft text from the
  // controls that own the keyboard. Rounded dialog borders are not composers.
  const composer = lines.findLastIndex((line) =>
    /^\s*╹[\u2580-\u259f\u2500-\u257f]*\s*$/u.test(line),
  )
  return lines.slice(composer + 1)
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
// the frames whose new lines belong to a turn rather than to a command.
export function isTerminalAgentWorking(pane: string): boolean {
  return /esc\s+interrupt/i.test(pane.split('\n').slice(-6).join(' '))
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
 * The CLI prints its own contract along the bottom of the form — `enter
 * accept · tab next` — so Enter is not a way of moving on. Sending it between
 * fields submits the form with every field after it at whatever it opened
 * with, which is how a confirmation nobody agreed to gets answered.
 */
export function terminalFormCommitKeys(fieldCount: number): string[] {
  return Array.from({ length: fieldCount }, (_, index) =>
    index === fieldCount - 1 ? 'Enter' : 'Tab',
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
  const lines = terminalControlLines(pane).map(cleanDialogLine)
  const header = lines.findLastIndex((line) =>
    /^Copilot needs information\.?$/i.test(line),
  )
  if (header < 0) {
    return false
  }
  return lines
    .slice(header)
    .some((line) => /enter accept/i.test(line) && /cancel/i.test(line))
}

function terminalFormQuestionEnd(
  lines: string[],
  header: number,
  question: string,
): number {
  const expected = question.replace(/\s+/gu, ' ').trim()
  if (!expected) {
    return header
  }
  let offset = 0
  for (let index = header + 1; index < lines.length; index += 1) {
    const line = lines[index].replace(/\s+/gu, ' ').trim()
    if (!line) {
      continue
    }
    // Wrapping may split at whitespace or inside a word. Only the break is
    // flexible; spaces within each rendered line remain part of its identity.
    if (expected[offset] === ' ') {
      offset += 1
    }
    if (!expected.startsWith(line, offset)) {
      return -1
    }
    offset += line.length
    if (offset === expected.length) {
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

function terminalFormTabsIndex(
  lines: string[],
  form: TerminalFormIdentity,
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
  const questionAt = terminalFormQuestionEnd(lines, header, form.question)
  if (questionAt < 0) {
    return -1
  }
  // The first content after the complete question must be its tabs (or the
  // lone field heading). Searching further could match a title in a value or
  // accept only a prefix of a longer, different question.
  const index = lines.findIndex(
    (line, position) => position > questionAt && line.trim().length > 0,
  )
  if (index < 0) {
    return -1
  }
  const tabs = lines[index].split(/\s{2,}/).filter(Boolean)
  if (form.fields.length === 1) {
    return tabs.length === 1 && tabs[0].replace(/:$/, '') === form.fields[0]
      ? index
      : -1
  }
  return tabs.length === form.fields.length &&
    tabs.every((tab, slot) => tabNames(tab, form.fields[slot]))
    ? index
    : -1
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
  return terminalFormTabsIndex(terminalControlLines(pane).map(cleanDialogLine), form) >= 0
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
  const lines = terminalControlLines(pane).map(cleanDialogLine)
  const tabs = terminalFormTabsIndex(lines, form)
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
  const lines = pane.split('\n').map(cleanDialogLine)
  const questionHeader = lines.findLastIndex((line) => line === 'Question')
  if (questionHeader < 0) {
    return undefined
  }

  const questionLines: string[] = []
  const choices: string[] = []
  let allowFreeform = false
  for (const line of lines.slice(questionHeader + 1)) {
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
      if (/select|confirm|cancel/i.test(line)) {
        break
      }
      continue
    }
    questionLines.push(line)
  }
  const question = questionLines.join(' ').trim()
  if (!question || (choices.length === 0 && !allowFreeform)) {
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
  const lines = pane.split('\n').map(cleanDialogLine)
  const questionIndex = lines.findLastIndex((line) =>
    /^Do you want to run this command\?/i.test(line),
  )
  if (questionIndex < 0) {
    return undefined
  }
  const nonemptyBeforeQuestion = lines
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
  const dialog = lines.slice(dialogStart)
  const choices = dialog.flatMap((line) => {
    const choice = line.match(/^(?:❯\s*)?(\d+)\.\s+(.+)$/u)
    return choice
      ? [{ index: Number.parseInt(choice[1], 10), label: choice[2].trim() }]
      : []
  })
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

function parseTerminalSessionInUse(pane: string): PendingPermission | undefined {
  const lines = terminalControlLines(pane).map(cleanDialogLine)
  const header = lines.findLastIndex((line) => line === 'Session in use')
  if (header < 0) {
    return undefined
  }
  const dialog = lines.slice(header + 1)
  const choices = dialog.flatMap((line) => {
    const choice = /^(?:❯\s*)?(\d+)\.\s+(.+)$/u.exec(line)
    return choice ? [{ index: Number(choice[1]), label: choice[2] }] : []
  })
  if (
    !/in use by another CLI or application/.test(dialog.join(' ')) ||
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
  const lines = terminalControlLines(pane).map(cleanDialogLine)
  const header = lines.findLastIndex((line) => line === 'Confirm folder trust')
  const question = lines.findIndex(
    (line, index) => index > header && line === 'Do you trust the files in this folder?',
  )
  if (header < 0 || question < 0) {
    return undefined
  }
  const folderStart = lines.findIndex(
    (line, index) =>
      index > header && index < question && /^(?:\/|[a-z]:[\\/]|\\\\)/i.test(line),
  )
  if (folderStart < 0) {
    return undefined
  }
  const folderEnd = lines.findIndex(
    (line, index) => index > folderStart && /^[─━]+$/u.test(line),
  )
  if (folderEnd < 0 || folderEnd >= question) {
    return undefined
  }
  const folder = lines.slice(folderStart, folderEnd).join('\n')
  const choices = lines.slice(question + 1).flatMap((line) => {
    const choice = /^(?:❯\s*)?(\d+)\.\s+(.+)$/u.exec(line)
    return choice ? [{ index: Number(choice[1]), label: choice[2] }] : []
  })
  if (
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
    if (
      (error as NodeJS.ErrnoException).code === 'ENOENT' ||
      String((error as { stderr?: string }).stderr).includes(
        'no server running',
      ) ||
      String((error as { stderr?: string }).stderr).includes(
        'error connecting to',
      )
    ) {
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
    (match) => match[1] === undefined || lineCounts.has(Number(match[1])),
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
  const top = lines.findLastIndex((line) => COMPOSER_TOP.test(line))
  if (top < 0) {
    return undefined
  }
  const body: string[] = []
  for (const line of lines.slice(top + 1)) {
    if (COMPOSER_EDGE.test(line)) {
      break
    }
    body.push(
      line
        .replace(/^\s*[\u2502\u2503\u257d\u257f]\s?/u, '')
        .replace(/[\u2502\u2503\u257d\u257f]\s*$/u, '')
        .trim(),
    )
  }
  return body.join(' ').trim()
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

async function capturePane(target: string): Promise<string> {
  return (
    await execFileAsync('tmux', ['capture-pane', '-p', '-t', target, '-S', '-30'])
  ).stdout
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

function noTmuxServer(error: unknown): boolean {
  const failure = error as { stderr?: unknown }
  // Only tmux's own "there is nothing to ask" diagnostics. Treating every
  // exit status of 1 as absence also swallowed a socket that could not be
  // reached or read, and stopping then reported success without having killed
  // anything, while the process it was meant to end carried on.
  return (
    typeof failure.stderr === 'string' &&
    // tmux uses "error connecting to" for a socket it cannot reach at all and
    // for one it is not allowed to open, and only the first means there is
    // nothing there. Reading both as absence let `stop` report success
    // without killing anything.
    (/no server running/i.test(failure.stderr) ||
      /error connecting to .*\(no such file or directory\)/i.test(
        failure.stderr,
      ))
  )
}

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
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined
    }
    // Killing the last pane in the last session ends tmux itself, and the
    // next lookup then fails rather than reporting nothing. That is the
    // ordinary way a suspension finishes, so it reads as absence: raising here
    // reported failure for work that had already succeeded, leaving the
    // session never recorded as suspended.
    if (noTmuxServer(error)) {
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
