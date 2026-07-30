import { execFile } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { findActiveCopilotProcesses } from './active-sessions.js'
import type {
  ConfigureRuntimeInput,
  PendingPermission,
  PendingUserInput,
} from '../shared/contracts.js'

const execFileAsync = promisify(execFile)

export interface TerminalSessionController {
  create?(
    sessionId: string,
    cwd: string,
    title: string,
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
  has(sessionId: string): Promise<boolean>
  send(sessionId: string, content: string, enqueue: boolean): Promise<boolean>
  cancel(sessionId: string): Promise<boolean>
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
  ): Promise<{ sessionName: string; windowId: string }> {
    const creation = this.creationQueue.then(() =>
      this.createWindow(sessionId, cwd, title),
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
      const owner = await this.owner(sessionId)
      if (!owner) {
        return false
      }
      const command = await copilotCommand(owner.pid, sessionId, input)
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

  async replyPermission(
    sessionId: string,
    request: PendingPermission,
    optionId: string,
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
      await waitForPaneText(target, content.split('\n').at(-1) || content)
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
            : ['send-keys', '-t', target, '-H', '0d'],
        )
      } finally {
        if (restoreIxon && paneTty) {
          await execFileAsync('stty', ['-F', paneTty, 'ixon'])
        }
      }
      return true
    })
  }

  private async target(sessionId: string): Promise<string | undefined> {
    return (await this.owner(sessionId))?.target
  }

  private async owner(
    sessionId: string,
  ): Promise<{ pid: number; target: string } | undefined> {
    const processInfo = (await this.activeProcesses()).find(
      (candidate) => candidate.sessionId === sessionId,
    )
    if (!processInfo) {
      return undefined
    }
    const target = await tmuxTargetForPid(processInfo.pid)
    return target ? { pid: processInfo.pid, target } : undefined
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
          copilot,
          '--session-id',
          sessionId,
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
          copilot,
          '--session-id',
          sessionId,
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

function cleanDialogLine(line: string): string {
  return line
    .replace(/^[\s│┃╭╰]+/u, '')
    .replace(/[\s│┃╮╯]+$/u, '')
    .trim()
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
  ])
  const runtimeOptions = new Set([
    '--model',
    '--effort',
    '--reasoning-effort',
    '--context',
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
      '--effort',
      runtime.reasoningEffort,
      '--context',
      runtime.contextTier,
    )
  }
  return result
}

async function waitForPaneText(target: string, expected: string): Promise<void> {
  const normalizedExpected = expected.replace(/\s+/g, ' ').trim()
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const pane = (
      await execFileAsync('tmux', [
        'capture-pane',
        '-p',
        '-t',
        target,
        '-S',
        '-30',
      ])
    ).stdout
    if (
      pane.replace(/\s+/g, ' ').includes(normalizedExpected) ||
      pane.includes('[Pasted text')
    ) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}

async function tmuxTargetForPid(pid: number): Promise<string | undefined> {
  let output = ''
  try {
    output = (
      await execFileAsync('tmux', [
        'list-panes',
        '-a',
        '-F',
        '#{pane_pid}\t#{session_name}:#{window_index}.#{pane_index}',
      ])
    ).stdout
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined
    }
    throw error
  }
  const ancestors = await processAncestors(pid)
  for (const line of output.split('\n')) {
    const [panePid, target] = line.split('\t', 2)
    if (target && ancestors.has(Number.parseInt(panePid, 10))) {
      return target
    }
  }
  return undefined
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
