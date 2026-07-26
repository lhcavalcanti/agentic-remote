import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { findActiveCopilotProcesses } from './active-sessions.js'
import type { ConfigureRuntimeInput } from '../shared/contracts.js'

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
  has(sessionId: string): Promise<boolean>
  send(sessionId: string, content: string, enqueue: boolean): Promise<boolean>
  cancel(sessionId: string): Promise<boolean>
}

export class TmuxTerminalSessionController
  implements TerminalSessionController
{
  private readonly operations = new Map<string, Promise<unknown>>()
  private creationQueue: Promise<void> = Promise.resolve()

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
      const windowName = `${safeWindowName(title)}-${sessionId.slice(0, 8)}`
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
    const processInfo = (await findActiveCopilotProcesses()).find(
      (candidate) => candidate.sessionId === sessionId,
    )
    if (!processInfo) {
      return undefined
    }
    const target = await tmuxTargetForPid(processInfo.pid)
    return target ? { pid: processInfo.pid, target } : undefined
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
    const windowName = `${safeWindowName(title)}-${sessionId.slice(0, 8)}`
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
  return (sanitized || 'copilot').slice(0, 40)
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
