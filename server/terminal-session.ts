import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import { findActiveCopilotProcesses } from './active-sessions.js'

const execFileAsync = promisify(execFile)

export interface TerminalSessionController {
  has(sessionId: string): Promise<boolean>
  send(sessionId: string, content: string, enqueue: boolean): Promise<boolean>
  cancel(sessionId: string): Promise<boolean>
}

export class TmuxTerminalSessionController
  implements TerminalSessionController
{
  private readonly operations = new Map<string, Promise<unknown>>()

  async has(sessionId: string): Promise<boolean> {
    return Boolean(await this.target(sessionId))
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
    const processInfo = (await findActiveCopilotProcesses()).find(
      (candidate) => candidate.sessionId === sessionId,
    )
    return processInfo
      ? tmuxTargetForPid(processInfo.pid)
      : undefined
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
