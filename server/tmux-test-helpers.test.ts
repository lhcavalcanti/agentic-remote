import { EventEmitter } from 'node:events'
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { Writable } from 'node:stream'
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest'
import { noTmuxServer } from './tmux-errors.js'
import {
  createIsolatedTmuxRoot,
  retireAbandonedTmuxRoot,
  stopIsolatedTmuxServer,
} from './tmux-test-helpers.js'

const { execute, watchdog } = vi.hoisted(() => ({ execute: vi.fn(), watchdog: vi.fn() }))

vi.mock('node:child_process', () => ({
  execFile: Object.assign(vi.fn(), {
    [Symbol.for('nodejs.util.promisify.custom')]: execute,
  }),
  spawn: watchdog,
}))
vi.mock('node:fs/promises', () => ({
  access: vi.fn(),
  mkdtemp: vi.fn(),
  readFile: vi.fn(),
  rm: vi.fn(),
  writeFile: vi.fn(),
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
let fixtures = 0
let lifelines: Array<{ stdin: Writable, written: string[] }>

function processStat(processId = pid, processState = state, started = start, parent = 0, group = 0): string {
  return `${processId} (tmux: server) ${[
    processState, parent, group, ...Array<string>(16).fill('0'), started, '0',
  ].join(' ')}\n`
}

function commands(name: string) {
  return execute.mock.calls.filter(([, args]) => args[0] === name)
}

/** A spawned watchdog whose stdin records each line the fixture reports. */
function fakeWatchdog({ spawnError, writeError }: { spawnError?: Error, writeError?: Error } = {}) {
  const written: string[] = []
  const stdin = new Writable({
    write(chunk, _encoding, callback) {
      if (!writeError) written.push(String(chunk))
      callback(writeError)
    },
  })
  lifelines.push({ stdin, written })
  const child = Object.assign(new EventEmitter(), { stdin, unref: vi.fn() })
  queueMicrotask(() => (spawnError ? child.emit('error', spawnError) : child.emit('spawn')))
  return child
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.useFakeTimers()
  killed = false
  state = 'S'
  start = '100'
  execute.mockImplementation(async (_command, args: string[]) => {
    if (args.includes('start-server')) return { stdout: `${pid} 3.6\noff\n`, stderr: '' }
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
  vi.mocked(access).mockResolvedValue()
  vi.mocked(writeFile).mockResolvedValue()
  vi.mocked(mkdtemp).mockImplementation(async () => `/owned/initialized-${++fixtures}`)
  vi.mocked(noTmuxServer).mockResolvedValue(false)
  lifelines = []
  watchdog.mockImplementation(() => fakeWatchdog())
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

describe('initialized tmux fixture', () => {
  it('starts a server in the isolated namespace that outlives its last session', async () => {
    vi.stubEnv('TMUX', '/unrelated/socket,99,0')
    vi.stubEnv('TMUX_TMPDIR', '/unrelated')
    const created = await createIsolatedTmuxRoot()

    const [[command, args, options]] = execute.mock.calls
    expect(command).toBe('tmux')
    expect(args.slice(0, 3)).toEqual(['-f', '/dev/null', 'start-server'])
    expect(args.join(' ')).toContain('; set-option -g exit-empty off ;')
    expect(args.join(' ')).toContain('; set-option -g update-environment * ;')
    expect(options.env).toMatchObject({ TMUX: '', TMUX_TMPDIR: created })
    expect(commands('kill-server')).toHaveLength(0)
    expect(rm).not.toHaveBeenCalled()
  })

  it('retires its own server without a host-wide absence verdict', async () => {
    const created = await createIsolatedTmuxRoot()
    vi.mocked(readFile).mockImplementation(async () => processStat(pid, killed ? 'Z' : 'S'))
    await stopIsolatedTmuxServer(created)

    expect(commands('kill-server')).toHaveLength(1)
    expect(noTmuxServer).not.toHaveBeenCalled()
    expect(rm).toHaveBeenCalledExactlyOnceWith(created, { recursive: true, force: true })
  })

  it('accepts exact retirement when kill-server loses its connection to the dying server', async () => {
    const created = await createIsolatedTmuxRoot()
    execute.mockImplementation(async (_command, args: string[]) => {
      if (args[0] === 'display-message') return { stdout: `${pid}\n`, stderr: '' }
      killed = true
      throw Object.assign(new Error('server exited unexpectedly'), { code: 1 })
    })
    vi.mocked(readFile).mockImplementation(async () => processStat(pid, killed ? 'Z' : 'S'))
    await stopIsolatedTmuxServer(created)
    expect(rm).toHaveBeenCalledExactlyOnceWith(created, { recursive: true, force: true })
  })

  it('never infers absence when its own server cannot be reached at teardown', async () => {
    const created = await createIsolatedTmuxRoot()
    execute.mockRejectedValue(missing)
    vi.mocked(noTmuxServer).mockResolvedValue(true)
    await expect(stopIsolatedTmuxServer(created)).rejects.toThrow()
    expect(noTmuxServer).not.toHaveBeenCalled()
    expect(commands('kill-server')).toHaveLength(0)
    expect(rm).not.toHaveBeenCalled()
  })

  it('fails closed when its own server exited before teardown', async () => {
    const created = await createIsolatedTmuxRoot()
    state = 'Z'
    await expect(stopIsolatedTmuxServer(created)).rejects.toThrow(/exited before teardown/)
    expect(commands('kill-server')).toHaveLength(0)
    expect(rm).not.toHaveBeenCalled()
  })

  it('refuses to kill when its socket now names a different server', async () => {
    const created = await createIsolatedTmuxRoot()
    execute.mockImplementation(async (_command, args: string[]) => {
      if (args[0] === 'display-message') return { stdout: `${pid + 1}\n`, stderr: '' }
      throw new Error('A replacement server must not be killed')
    })
    await expect(stopIsolatedTmuxServer(created)).rejects.toThrow(/identity/i)
    expect(commands('kill-server')).toHaveLength(0)
    expect(rm).not.toHaveBeenCalled()
  })

  it('refuses to kill a reused PID and preserves the root', async () => {
    const created = await createIsolatedTmuxRoot()
    start = '101'
    await expect(stopIsolatedTmuxServer(created)).rejects.toThrow(/identity/i)
    expect(commands('kill-server')).toHaveLength(0)
    expect(rm).not.toHaveBeenCalled()
  })

  it('explicitly fails a bounded retirement timeout without deleting the root', async () => {
    const created = await createIsolatedTmuxRoot()
    const stopping = stopIsolatedTmuxServer(created).then(
      () => undefined,
      (error: unknown) => error,
    )
    await vi.advanceTimersByTimeAsync(2100)
    expect(String(await stopping)).toMatch(/retir|timed out/i)
    expect(commands('kill-server')).toHaveLength(1)
    expect(rm).not.toHaveBeenCalled()
  })

  it.each([
    ['an empty server may exit', `${pid} 3.6\non\n`],
    ['an invalid server PID', 'not-a-pid 3.6\noff\n'],
    // tmux 3.2-3.3a copy only the first variable a pattern matches, and older
    // releases match it literally, so sessions would keep the stale environment.
    ['tmux 3.3a', `${pid} 3.3a\noff\n`],
    ['tmux 3.2', `${pid} 3.2\noff\n`],
    ['tmux 2.9a', `${pid} 2.9a\noff\n`],
    ['an unversioned build', `${pid} master\noff\n`],
    ['an OpenBSD base build', `${pid} openbsd-7.4\noff\n`],
    ['no reported version', `${pid}\noff\n`],
  ])('retires a server it could not configure and rejects (%s)', async (_case, stdout) => {
    execute.mockImplementation(async (_command, args: string[]) => {
      if (args.includes('start-server')) return { stdout, stderr: '' }
      if (args[0] === 'display-message') return { stdout: `${pid}\n`, stderr: '' }
      if (args[0] === 'kill-server') {
        killed = true
        return { stdout: '', stderr: '' }
      }
      throw new Error(`Unexpected tmux command: ${args.join(' ')}`)
    })
    vi.mocked(readFile).mockImplementation(async () => processStat(pid, killed ? 'Z' : 'S'))
    await expect(createIsolatedTmuxRoot()).rejects.toThrow()
    expect(commands('kill-server')).toHaveLength(1)
    expect(rm).toHaveBeenCalledOnce()
  })

  it.each(['3.4', '3.6', 'next-3.7', '3.10', '4.0'])('accepts tmux %s', async (version) => {
    execute.mockImplementation(async (_command, args: string[]) => {
      if (args.includes('start-server')) return { stdout: `${pid} ${version}\noff\n`, stderr: '' }
      throw new Error(`Unexpected tmux command: ${args.join(' ')}`)
    })
    await expect(createIsolatedTmuxRoot()).resolves.toMatch(/^\/owned\/initialized-/)
  })
})

describe('abandonment watchdog', () => {
  it('is armed before the server starts and told which server it started', async () => {
    const created = await createIsolatedTmuxRoot()

    const [[command, args, options]] = watchdog.mock.calls
    expect(command).toBe(process.execPath)
    expect(args.slice(-2)).toEqual([expect.stringMatching(/tmux-fixture-watchdog\.ts$/), created])
    expect(options).toMatchObject({
      detached: true,
      env: { TMUX: '', TMUX_TMPDIR: created },
      stdio: ['pipe', 'ignore', 'ignore'],
    })
    expect(watchdog.mock.invocationCallOrder[0]).toBeLessThan(execute.mock.invocationCallOrder[0])
    expect(lifelines[0].written.map((line) => JSON.parse(line))).toEqual([{ pid, state: 'S', startTicks: '100' }])
    expect(lifelines[0].stdin.destroyed).toBe(false)
  })

  it('stops watching only once teardown has removed the root', async () => {
    const created = await createIsolatedTmuxRoot()
    const [{ stdin }] = lifelines
    let watchingAtRemoval: boolean | undefined
    vi.mocked(rm).mockImplementation(async () => {
      watchingAtRemoval = !stdin.destroyed
    })
    vi.mocked(readFile).mockImplementation(async () => processStat(pid, killed ? 'Z' : 'S'))
    await stopIsolatedTmuxServer(created)

    expect(watchingAtRemoval).toBe(true)
    expect(stdin.destroyed).toBe(true)
  })

  it('keeps watching when teardown fails', async () => {
    const created = await createIsolatedTmuxRoot()
    state = 'Z'
    await expect(stopIsolatedTmuxServer(created)).rejects.toThrow(/exited before teardown/)
    expect(lifelines[0].stdin.destroyed).toBe(false)
  })

  it('removes the untouched root and rejects when it cannot start', async () => {
    watchdog.mockImplementation(() => fakeWatchdog({ spawnError: errno('EAGAIN') }))
    await expect(createIsolatedTmuxRoot()).rejects.toThrow('EAGAIN')
    expect(execute).not.toHaveBeenCalled()
    expect(rm).toHaveBeenCalledExactlyOnceWith('/owned/initialized-' + fixtures, { recursive: true, force: true })
  })

  it('retires the new server and rejects when it cannot be told which server it is', async () => {
    watchdog.mockImplementation(() => fakeWatchdog({ writeError: errno('EPIPE') }))
    vi.mocked(readFile).mockImplementation(async () => processStat(pid, killed ? 'Z' : 'S'))
    await expect(createIsolatedTmuxRoot()).rejects.toThrow('EPIPE')
    expect(commands('kill-server')).toHaveLength(1)
    expect(rm).toHaveBeenCalledOnce()
  })
})

describe('abandoned tmux fixture retirement', () => {
  const reported = JSON.stringify({ pid, state: 'S', startTicks: '100' })
  let kill: MockInstance<typeof process.kill>

  /** Serves these panes, each [pid, parent, process group, state], from the server. */
  function withPanes(...panes: Array<[number, number, number, string?]>) {
    const serve = execute.getMockImplementation()!
    execute.mockImplementation(async (...call) => call[1][0] === 'list-panes'
      ? { stdout: `${panes.map(([pane]) => pane).join('\n')}\n\n`, stderr: '' }
      : serve(...call))
    vi.mocked(readFile).mockImplementation(async (file) => {
      const pane = panes.find(([id]) => file === `/proc/${id}/stat`)
      return pane
        ? processStat(pane[0], pane[3] ?? 'S', '200', pane[1], pane[2])
        : processStat(pid, killed ? 'Z' : 'S')
    })
  }

  beforeEach(() => {
    kill = vi.spyOn(process, 'kill').mockReturnValue(true)
    withPanes()
  })

  it('leaves a released fixture alone', async () => {
    vi.mocked(access).mockRejectedValue(errno('ENOENT'))
    await retireAbandonedTmuxRoot(root, reported)
    expect(execute).not.toHaveBeenCalled()
    expect(rm).not.toHaveBeenCalled()
  })

  it('stops only the live panes of the reported server, then retires it and removes the root', async () => {
    withPanes([401, pid, 401], [402, pid + 1, 402], [403, pid, 1], [404, pid, 404, 'Z'])
    await retireAbandonedTmuxRoot(root, reported)

    expect(kill).toHaveBeenCalledExactlyOnceWith(-401, 'SIGTERM')
    const shutdown = execute.mock.calls.findIndex(([, args]) => args[0] === 'kill-server')
    expect(kill.mock.invocationCallOrder[0]).toBeLessThan(execute.mock.invocationCallOrder[shutdown])
    expect(rm).toHaveBeenCalledExactlyOnceWith(root, { recursive: true, force: true })
    expect(writeFile).not.toHaveBeenCalled()
  })

  it('finds no panes on a server without sessions', async () => {
    const serve = execute.getMockImplementation()!
    execute.mockImplementation(async (...call) => {
      if (call[1][0] === 'list-panes') throw Object.assign(new Error('no current target'), { code: 1 })
      if (call[1][0] === 'list-sessions') return { stdout: '', stderr: '' }
      return serve(...call)
    })
    await retireAbandonedTmuxRoot(root, reported)
    expect(kill).not.toHaveBeenCalled()
    expect(commands('kill-server')).toHaveLength(1)
    expect(rm).toHaveBeenCalledOnce()
  })

  it('lets a start in flight finish before retiring a server that was never reported', async () => {
    const retiring = retireAbandonedTmuxRoot(root, undefined)
    await vi.advanceTimersByTimeAsync(1_900)
    expect(execute).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(100)
    await retiring
    expect(commands('kill-server')).toHaveLength(1)
    expect(rm).toHaveBeenCalledExactlyOnceWith(root, { recursive: true, force: true })
  })

  it.each([
    ['its socket now names a different server', reported, () => {
      const serve = execute.getMockImplementation()!
      execute.mockImplementation(async (...call) => call[1][0] === 'display-message'
        ? { stdout: `${pid + 1}\n`, stderr: '' }
        : serve(...call))
    }],
    ['the reported server already exited', reported, () => {
      vi.mocked(readFile).mockResolvedValue(processStat(pid, 'Z'))
    }],
    ['the report is malformed', JSON.stringify({ pid: String(pid), state: 'S', startTicks: '100' }), () => {}],
    ['its panes cannot be listed while it has sessions', reported, () => {
      const serve = execute.getMockImplementation()!
      execute.mockImplementation(async (...call) => {
        if (call[1][0] === 'list-panes') throw Object.assign(new Error('lost server'), { code: 1 })
        if (call[1][0] === 'list-sessions') return { stdout: 'abandoned: 1 windows\n', stderr: '' }
        return serve(...call)
      })
    }],
  ])('kills nothing and keeps the root with the reason when %s', async (_case, report, arrange) => {
    arrange()
    await expect(retireAbandonedTmuxRoot(root, report)).rejects.toThrow()
    expect(commands('kill-server')).toHaveLength(0)
    expect(kill).not.toHaveBeenCalled()
    expect(rm).not.toHaveBeenCalled()
    expect(writeFile).toHaveBeenCalledExactlyOnceWith(`${root}/abandoned-retirement-failed`, expect.any(String))
  })
})
