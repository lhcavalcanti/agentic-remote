import { readFile, rm } from 'node:fs/promises'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { noTmuxServer } from './tmux-errors.js'
import { stopIsolatedTmuxServer } from './tmux-test-helpers.js'

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }))

vi.mock('node:child_process', () => ({
  execFile: Object.assign(vi.fn(), {
    [Symbol.for('nodejs.util.promisify.custom')]: execute,
  }),
}))
vi.mock('node:fs/promises', () => ({
  mkdtemp: vi.fn(),
  readFile: vi.fn(),
  rm: vi.fn(),
}))
vi.mock('./tmux-errors.js', () => ({ noTmuxServer: vi.fn() }))

const root = '/owned/tmux-fixture'
const pid = 321
const errno = (code: string) => Object.assign(new Error(code), { code })
const missing = Object.assign(new Error('No server at the owned socket'), {
  code: 1,
  stderr: `no server running on ${root}/tmux-1000/default\n`,
})
let killed: boolean
let state: string
let start: string

function processStat(processId = pid, processState = state, started = start): string {
  return `${processId} (tmux: server) ${[
    processState, ...Array<string>(18).fill('0'), started, '0',
  ].join(' ')}\n`
}

function commands(name: string) {
  return execute.mock.calls.filter(([, args]) => args[0] === name)
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.useFakeTimers()
  killed = false
  state = 'S'
  start = '100'
  execute.mockImplementation(async (_command, args: string[]) => {
    if (args[0] === 'display-message') return { stdout: `${pid}\n`, stderr: '' }
    if (args[0] === 'kill-server') {
      killed = true
      return { stdout: '', stderr: '' }
    }
    throw new Error(`Unexpected tmux command: ${args.join(' ')}`)
  })
  vi.mocked(readFile).mockImplementation(async (file) => {
    expect(file).toBe(`/proc/${pid}/stat`)
    return processStat()
  })
  vi.mocked(rm).mockResolvedValue()
  vi.mocked(noTmuxServer).mockResolvedValue(false)
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('owned tmux fixture retirement', () => {
  it('keeps teardown pending and the root intact until the killed server retires', async () => {
    let nextFixtureAdmitted = false
    const stopping = stopIsolatedTmuxServer(root).then(() => {
      nextFixtureAdmitted = true
    })
    await vi.advanceTimersByTimeAsync(0)

    expect(killed).toBe(true)
    expect(nextFixtureAdmitted).toBe(false)
    expect(rm).not.toHaveBeenCalled()

    state = 'Z'
    await vi.advanceTimersByTimeAsync(100)
    await stopping
    expect(nextFixtureAdmitted).toBe(true)
    expect(rm).toHaveBeenCalledExactlyOnceWith(root, { recursive: true, force: true })
    expect(commands('kill-server')).toHaveLength(1)
  })

  it.each(['Z', 'X'])('removes the root after exact-process retirement to %s', async (retired) => {
    vi.mocked(readFile).mockImplementation(async () => processStat(pid, killed ? retired : 'S'))
    await stopIsolatedTmuxServer(root)
    expect(rm).toHaveBeenCalledExactlyOnceWith(root, { recursive: true, force: true })
  })

  it.each(['ENOENT', 'ESRCH'])('accepts a captured process disappearing with %s', async (code) => {
    vi.mocked(readFile).mockImplementation(async () => {
      if (killed) throw errno(code)
      return processStat()
    })
    await stopIsolatedTmuxServer(root)
    expect(rm).toHaveBeenCalledExactlyOnceWith(root, { recursive: true, force: true })
  })

  it('only addresses the isolated namespace, never an ambient tmux server or process PID', async () => {
    vi.stubEnv('TMUX', '/unrelated/socket,99,0')
    vi.stubEnv('TMUX_TMPDIR', '/unrelated')
    const kill = vi.spyOn(process, 'kill')
    vi.mocked(readFile).mockImplementation(async () => processStat(pid, killed ? 'Z' : 'S'))
    await stopIsolatedTmuxServer(root)

    expect(commands('display-message').length).toBeGreaterThanOrEqual(2)
    for (const [command, , options] of execute.mock.calls) {
      expect(command).toBe('tmux')
      expect(options.env).toMatchObject({ TMUX: '', TMUX_TMPDIR: root })
    }
    expect(kill).not.toHaveBeenCalled()
  })

  it('handles a fixture where no server was ever created only after absence is established', async () => {
    execute.mockRejectedValue(missing)
    vi.mocked(noTmuxServer).mockResolvedValue(true)
    await stopIsolatedTmuxServer(root)

    expect(noTmuxServer).toHaveBeenCalledWith(missing)
    expect(commands('kill-server')).toHaveLength(0)
    expect(readFile).not.toHaveBeenCalled()
    expect(rm).toHaveBeenCalledExactlyOnceWith(root, { recursive: true, force: true })
  })

  it('preserves the root when server discovery is indeterminate', async () => {
    execute.mockRejectedValue(missing)
    const stopping = stopIsolatedTmuxServer(root).catch((error: unknown) => error)
    await vi.advanceTimersByTimeAsync(2100)
    expect(await stopping).toBeInstanceOf(Error)
    expect(noTmuxServer).toHaveBeenCalledWith(missing)
    expect(commands('kill-server')).toHaveLength(0)
    expect(rm).not.toHaveBeenCalled()
  })

  it('waits for conclusive absence after a transient process-retirement probe', async () => {
    execute.mockRejectedValue(missing)
    vi.mocked(noTmuxServer).mockResolvedValueOnce(false).mockResolvedValueOnce(false).mockResolvedValue(true)
    const stopping = stopIsolatedTmuxServer(root).catch((error: unknown) => error)
    await vi.advanceTimersByTimeAsync(0)
    expect(rm).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(100)
    expect(await stopping).toBeUndefined()
    expect(noTmuxServer).toHaveBeenCalledTimes(3)
    expect(commands('kill-server')).toHaveLength(0)
    expect(rm).toHaveBeenCalledExactlyOnceWith(root, { recursive: true, force: true })
  })

  it('preserves the root when the absence probe itself fails', async () => {
    execute.mockRejectedValue(missing)
    vi.mocked(noTmuxServer).mockRejectedValue(errno('EIO'))
    await expect(stopIsolatedTmuxServer(root)).rejects.toThrow('EIO')
    expect(rm).not.toHaveBeenCalled()
  })

  it.each(['0', '-1', '321other', 'NaN'])('rejects an invalid owned server PID %s before killing', async (invalid) => {
    execute.mockResolvedValue({ stdout: invalid, stderr: '' })
    await expect(stopIsolatedTmuxServer(root)).rejects.toThrow()
    expect(commands('kill-server')).toHaveLength(0)
    expect(rm).not.toHaveBeenCalled()
  })

  it.each(['EACCES', 'ENOENT'])('preserves the root when initial identity cannot be captured: %s', async (code) => {
    vi.mocked(readFile).mockRejectedValue(errno(code))
    await expect(stopIsolatedTmuxServer(root)).rejects.toThrow()
    expect(commands('kill-server')).toHaveLength(0)
    expect(rm).not.toHaveBeenCalled()
  })

  it.each([
    'unrecognized process stat',
    processStat(pid, 'S', 'not-a-start-time'),
    processStat(999, 'S', '100'),
  ])('rejects malformed or mismatched process identity (%s)', async (stat) => {
    vi.mocked(readFile).mockResolvedValue(stat)
    await expect(stopIsolatedTmuxServer(root)).rejects.toThrow()
    expect(commands('kill-server')).toHaveLength(0)
    expect(rm).not.toHaveBeenCalled()
  })

  it('refuses to kill when the owned socket now identifies a different server', async () => {
    let queries = 0
    execute.mockImplementation(async (_command, args: string[]) => {
      if (args[0] === 'display-message') {
        return { stdout: `${++queries === 1 ? pid : pid + 1}\n`, stderr: '' }
      }
      throw new Error('A replacement server must not be killed')
    })
    await expect(stopIsolatedTmuxServer(root)).rejects.toThrow()
    expect(commands('kill-server')).toHaveLength(0)
    expect(rm).not.toHaveBeenCalled()
  })

  it('refuses to kill when the start identity changes before shutdown', async () => {
    vi.mocked(readFile)
      .mockResolvedValueOnce(processStat(pid, 'S', '100'))
      .mockResolvedValue(processStat(pid, 'S', '101'))
    await expect(stopIsolatedTmuxServer(root)).rejects.toThrow(/identity/i)
    expect(commands('kill-server')).toHaveLength(0)
    expect(rm).not.toHaveBeenCalled()
  })

  it('preserves the root and never kills a reused PID after shutdown', async () => {
    vi.mocked(readFile).mockImplementation(async () =>
      processStat(pid, killed ? 'Z' : 'S', killed ? '101' : '100'),
    )
    await expect(stopIsolatedTmuxServer(root)).rejects.toThrow(/identity/i)
    expect(commands('kill-server')).toHaveLength(1)
    expect(rm).not.toHaveBeenCalled()
  })

  it.each(['EACCES', 'EIO'])('preserves the root on unreadable retirement evidence: %s', async (code) => {
    vi.mocked(readFile).mockImplementation(async () => {
      if (killed) throw errno(code)
      return processStat()
    })
    await expect(stopIsolatedTmuxServer(root)).rejects.toThrow()
    expect(rm).not.toHaveBeenCalled()
  })

  it('preserves the root when shutdown fails with unknown evidence', async () => {
    execute.mockImplementation(async (_command, args: string[]) => {
      if (args[0] === 'display-message') return { stdout: `${pid}\n`, stderr: '' }
      throw errno('EIO')
    })
    await expect(stopIsolatedTmuxServer(root)).rejects.toThrow()
    expect(rm).not.toHaveBeenCalled()
  })

  it('explicitly fails a bounded retirement timeout without deleting the root', async () => {
    const stopping = stopIsolatedTmuxServer(root).then(
      () => undefined,
      (error: unknown) => error,
    )
    await vi.advanceTimersByTimeAsync(2100)
    expect(await stopping).toBeInstanceOf(Error)
    expect(String(await stopping)).toMatch(/retir|timed out/i)
    expect(commands('kill-server')).toHaveLength(1)
    expect(rm).not.toHaveBeenCalled()
  })
})
