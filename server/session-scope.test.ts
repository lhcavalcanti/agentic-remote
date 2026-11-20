import { randomUUID } from 'node:crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { sessionLaunchCommand, sessionScopeProbe } from './session-scope.js'
import { TmuxTerminalSessionController } from './terminal-session.js'

const adapter = vi.hoisted(() => ({ run: vi.fn(), readFile: vi.fn() }))
vi.mock('node:child_process', () => {
  const execFile = vi.fn()
  Object.defineProperty(execFile, Symbol.for('nodejs.util.promisify.custom'), { value: adapter.run })
  return { execFile }
})
vi.mock('node:fs/promises', async (importOriginal) => ({
  ...await importOriginal<typeof import('node:fs/promises')>(),
  readFile: adapter.readFile,
}))

// Written out by hand: what tmux has to be asked to run.
const scope = ['systemd-run', '--user', '--scope', '--quiet', '--collect', '-p', 'OOMPolicy=continue', '--']

afterEach(() => {
  vi.restoreAllMocks()
  adapter.run.mockReset()
  adapter.readFile.mockReset()
  vi.unstubAllEnvs()
})

describe('the command a session is launched with', () => {
  const copilot = ['/opt/copilot', '--yolo', '--session-id', 'abc']

  it('runs Copilot in a scope of its own where systemd can create one', async () => {
    expect(await sessionLaunchCommand(copilot, async () => true, {})).toEqual([...scope, ...copilot])
  })

  it('runs Copilot directly where it cannot', async () => {
    expect(await sessionLaunchCommand(copilot, async () => false, {})).toEqual(copilot)
  })

  it('never wraps a command that is already in its scope a second time', async () => {
    expect(await sessionLaunchCommand([...scope, ...copilot], async () => true, {})).toEqual([...scope, ...copilot])
    expect(await sessionLaunchCommand([...scope, ...copilot], async () => false, {})).toEqual(copilot)
  })

  it.each(['off', 'OFF ', 'false', '0', 'no', 'disabled'])(
    'leaves systemd alone when AGENTIC_REMOTE_SESSION_SCOPE is %j',
    async (value) => {
      const available = vi.fn(async () => true)
      expect(await sessionLaunchCommand(copilot, available, { AGENTIC_REMOTE_SESSION_SCOPE: value })).toEqual(copilot)
      expect(available).not.toHaveBeenCalled()
    },
  )

  it('keeps the scope for any other AGENTIC_REMOTE_SESSION_SCOPE', async () => {
    expect(await sessionLaunchCommand(copilot, async () => true, { AGENTIC_REMOTE_SESSION_SCOPE: 'on' }))
      .toEqual([...scope, ...copilot])
  })
})

describe('whether this host can start a session in a scope of its own', () => {
  it('asks once, by starting a throwaway scope exactly as a session is started', async () => {
    const run = vi.fn(async () => ({ stdout: '', stderr: '' }))
    const available = sessionScopeProbe(run, 'linux')

    const answers = await Promise.all([available(), available()])
    expect(answers).toEqual([true, true])
    expect(await available()).toBe(true)

    expect(run).toHaveBeenCalledOnce()
    expect(run).toHaveBeenCalledWith(scope[0], [...scope.slice(1), 'true'], expect.objectContaining({ timeout: expect.any(Number) }))
  })

  it('answers no, once, where systemd-run fails or is missing', async () => {
    const run = vi.fn(async () => {
      throw Object.assign(new Error('Failed to connect to user scope bus via local transport'), { code: 1 })
    })
    const available = sessionScopeProbe(run, 'linux')

    expect(await available()).toBe(false)
    expect(await available()).toBe(false)
    expect(run).toHaveBeenCalledOnce()
  })

  it('does not look for systemd off Linux', async () => {
    const run = vi.fn(async () => ({ stdout: '', stderr: '' }))

    expect(await sessionScopeProbe(run, 'darwin')()).toBe(false)
    expect(run).not.toHaveBeenCalled()
  })
})

describe.each([
  { host: 'with a user systemd manager', available: true, prefix: scope },
  { host: 'without one', available: false, prefix: [] },
])('every tmux launch of Copilot $host', ({ available, prefix }) => {
  const sessionId = randomUUID()
  const launched = (args: string[]) => args.slice(args.indexOf('COLORTERM=truecolor') + 1)
  const stopAt = (command: string) => {
    const calls: string[][] = []
    adapter.run.mockImplementation(async (file: string, args: string[]) => {
      expect(file).toBe('tmux')
      calls.push(args)
      if (args[0] === command) throw new Error('stopped at the launch')
      // A window joins the first tmux session; with none, it starts one.
      if (args[0] === 'list-sessions') return { stdout: command === 'new-window' ? 'main\t1\t100\n' : '', stderr: '' }
      return { stdout: '', stderr: '' }
    })
    return () => calls.find((args) => args[0] === command) ?? []
  }

  it('creates a session window', async () => {
    vi.stubEnv('COPILOT_BIN', '/opt/copilot')
    vi.stubEnv('AGENTIC_REMOTE_TMUX_SESSION', '')
    const launch = stopAt('new-window')
    const controller = new TmuxTerminalSessionController({ sessionScope: async () => available })

    await expect(controller.create(sessionId, '/work', 'Window', true)).rejects.toThrow('stopped at the launch')

    expect(launched(launch())).toEqual([...prefix, '/opt/copilot', '--yolo', '--session-id', sessionId])
  })

  it('reopens a session as the first tmux session', async () => {
    vi.stubEnv('COPILOT_BIN', '/opt/copilot')
    vi.stubEnv('AGENTIC_REMOTE_TMUX_SESSION', '')
    const launch = stopAt('new-session')
    const controller = new TmuxTerminalSessionController({ sessionScope: async () => available })

    await expect(controller.reopen(sessionId, '/work', 'Session', false, { model: 'fixture' }))
      .rejects.toThrow('stopped at the launch')

    expect(launched(launch())).toEqual([...prefix, '/opt/copilot', '--resume', sessionId, '--model', 'fixture'])
  })

  it('relaunches a session in its pane once the old Copilot has gone', async () => {
    const launch = stopAt('respawn-pane')
    const controller = new TmuxTerminalSessionController({ sessionScope: async () => available })
    vi.spyOn(controller as unknown as {
      boundOwner(id: string): Promise<{ pid: number; target: string; rootPid: number }>
    }, 'boundOwner').mockResolvedValue({ pid: 42, target: '%7', rootPid: 42 })
    adapter.readFile.mockImplementation(async (file: string) => {
      if (file === '/proc/42/cmdline') return `/opt/copilot\0--yolo\0--session-id\0${sessionId}\0`
      throw new Error(`Unexpected read: ${file}`)
    })

    await expect(controller.restart(sessionId, '/work')).rejects.toThrow('stopped at the launch')

    const respawn = launch()
    expect(respawn.slice(0, 6)).toEqual(['respawn-pane', '-k', '-t', '%7', '-c', '/work'])
    // The wait for the old Copilot comes first, and starts the session after.
    expect(respawn[6]).toBe('/bin/sh')
    expect(respawn.slice(respawn.indexOf('agentic-remote-relaunch') + 1)).toEqual([
      '42', ...prefix, '/opt/copilot', '--yolo', '--session-id', sessionId,
    ])
  })

  it('probes Copilot startup', async () => {
    vi.stubEnv('COPILOT_BIN', '/opt/copilot')
    const launch = stopAt('new-session')
    const controller = new TmuxTerminalSessionController({ sessionScope: async () => available })

    await expect(controller.probeStartup(sessionId, '/work')).rejects.toThrow('stopped at the launch')

    expect(launched(launch())).toEqual([...prefix, '/opt/copilot', '--yolo', '--session-id', sessionId])
  })
})

describe('owners of sessions started in a scope', () => {
  const sessionId = randomUUID()
  const copilot = `/opt/copilot\0--yolo\0--session-id\0${sessionId}\0`

  it('takes a relaunched session as running only once its scope has become Copilot', async () => {
    const controller = new TmuxTerminalSessionController({ sessionScope: async () => true })
    const inspectable = controller as unknown as {
      boundOwner(id: string): Promise<{ pid: number; target: string; rootPid: number }>
      owner(id: string, target?: string): Promise<{ pid: number; target: string; rootPid: number }>
    }
    vi.spyOn(inspectable, 'boundOwner').mockResolvedValue({ pid: 42, target: '%7', rootPid: 42 })
    // systemd-run keeps its PID when it becomes Copilot, so discovery finds
    // the replacement in the pane while it is still creating the scope.
    vi.spyOn(inspectable, 'owner').mockResolvedValue({ pid: 43, target: '%7', rootPid: 43 })
    let phase: 'scope' | 'copilot' = 'scope'
    adapter.readFile.mockImplementation(async (file: string) => {
      if (file === '/proc/42/cmdline') return copilot
      if (file === '/proc/43/cmdline') return phase === 'scope' ? `${scope.join('\0')}\0${copilot}` : copilot
      throw new Error(`Unexpected read: ${file}`)
    })
    adapter.run.mockResolvedValue({ stdout: '', stderr: '' })
    vi.useFakeTimers()
    try {
      let restarted: boolean | undefined
      const restarting = controller.restart(sessionId, '/work').then((result) => {
        restarted = result
      })

      await vi.advanceTimersByTimeAsync(1_000)
      expect(restarted).toBeUndefined()

      phase = 'copilot'
      await vi.advanceTimersByTimeAsync(100)
      await restarting
      expect(restarted).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it('ends a leftover probe whose pane was started in a scope', async () => {
    const leftover = randomUUID()
    vi.spyOn(process, 'kill').mockImplementation(() => {
      throw Object.assign(new Error('No such process'), { code: 'ESRCH' })
    })
    adapter.run.mockImplementation(async (file: string, args: string[]) => {
      expect(file).toBe('tmux')
      if (args[0] === 'list-panes') {
        return {
          stdout: `agentic-remote-canary-${leftover.slice(0, 8)}\t4242\t${[...scope, '/opt/copilot', '--yolo', '--session-id', leftover].join(' ')}\n`,
          stderr: '',
        }
      }
      if (args[0] === 'has-session') throw new Error(`can't find session: ${args.at(-1)}`)
      return { stdout: '', stderr: '' }
    })

    await expect(new TmuxTerminalSessionController().endLeftoverProbes()).resolves.toEqual([leftover])
  })
})
