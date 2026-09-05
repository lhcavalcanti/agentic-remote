import { readdir, readFile, readlink, realpath } from 'node:fs/promises'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as activeSessions from './active-sessions.js'
import { TmuxTerminalSessionController } from './terminal-session.js'
import { noTmuxServer, tmuxNotInstalled } from './tmux-errors.js'

const { execute } = vi.hoisted(() => ({ execute: vi.fn() }))

vi.mock('node:child_process', () => ({
  execFile: Object.assign(vi.fn(), {
    [Symbol.for('nodejs.util.promisify.custom')]: execute,
  }),
}))
vi.mock('node:fs/promises', () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
  readlink: vi.fn(),
  realpath: vi.fn(),
  stat: vi.fn(),
}))

const socket = '/owned/tmux-1000/work project'
const header = 'Num       RefCount Protocol Flags    Type St Inode Path\n'
const listener = (name = socket, inode = '42') =>
  `0000000000000000: 00000002 00000000 00010000 0001 01 ${inode} ${name}\n`
const missing = (name = socket) =>
  Object.assign(new Error(`error connecting to ${name} (No such file or directory)`), {
    code: 1,
    stderr: `error connecting to ${name} (No such file or directory)\n`,
  })
const errno = (code: string) => Object.assign(new Error(code), { code })
const files = new Map<string, string>()
const directories = new Map<string, string[]>()
const links = new Map<string, string>()

beforeEach(() => {
  vi.resetAllMocks()
  files.clear()
  directories.clear()
  links.clear()
  links.set('/proc/self/ns/mnt', 'mnt:[1]')
  files.set('/proc/net/unix', header)
  files.set('/proc/self/mountinfo', '1 0 0:1 / /proc rw - proc proc rw\n')
  directories.set('/proc', [])
  vi.mocked(readFile).mockImplementation(async (file) => {
    const contents = files.get(String(file))
    if (contents === undefined) {
      throw errno('ENOENT')
    }
    return contents
  })
  vi.mocked(readdir).mockImplementation(async (directory) => {
    const entries = directories.get(String(directory))
    if (!entries) {
      throw errno('ENOENT')
    }
    return entries as never
  })
  vi.mocked(readlink).mockImplementation(async (file) => {
    const target = links.get(String(file))
    if (!target) {
      throw errno('ENOENT')
    }
    return target
  })
  vi.mocked(realpath).mockImplementation(async (file) => String(file))
  execute.mockImplementation(async (command) => {
    if (command === 'ps') {
      return { stdout: '', stderr: '' }
    }
    throw missing()
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

function server(name = socket, state = 'S'): void {
  directories.set('/proc', ['123'])
  files.set('/proc/123/status', `Name:\ttmux: server\nState:\t${state} (state)\n`)
  files.set('/proc/123/net/unix', header + listener(name))
  directories.set('/proc/123/fd', ['6'])
  links.set('/proc/123/fd/6', 'socket:[42]')
  links.set('/proc/123/ns/mnt', 'mnt:[1]')
}

describe('tmux absence evidence', () => {
  it.each([
    missing(),
    { stderr: `no server running on ${socket}\n` },
  ])('does not mistake a live server with a missing socket for absence (%j)', async (failure) => {
    files.set('/proc/net/unix', header + listener())

    expect(await noTmuxServer(failure)).toBe(false)
  })

  it.each([
    missing(),
    { stderr: `no server running on ${socket}\n` },
  ])('accepts a genuinely absent server (%j)', async (failure) => {
    expect(await noTmuxServer(failure)).toBe(true)
  })

  it('uses the failed socket name, not the default socket or ambient TMUX', async () => {
    vi.stubEnv('TMUX', '/unrelated/socket,999,0')
    files.set('/proc/net/unix', header + listener())
    expect(await noTmuxServer(missing())).toBe(false)
  })

  it.each([`${socket} `, `${socket} (another name)`])('preserves unusual socket names (%j)', async (name) => {
    files.set('/proc/net/unix', header + listener(name))
    expect(await noTmuxServer(missing(name))).toBe(false)
    expect(await noTmuxServer({ stderr: `no server running on ${name}\n` })).toBe(false)
  })

  it('allows a cold socket alongside a server proven to use a different socket', async () => {
    const other = '/owned/tmux-1000/other'
    files.set('/proc/net/unix', header + listener(other))
    server(other)
    expect(await noTmuxServer(missing())).toBe(true)
  })

  it('checks a live server in another network namespace', async () => {
    server()
    expect(await noTmuxServer(missing())).toBe(false)
  })

  it('does not compare pathnames from a different mount namespace', async () => {
    server('/owned/other')
    links.set('/proc/123/ns/mnt', 'mnt:[2]')
    expect(await noTmuxServer(missing())).toBe(false)
  })

  it('rechecks sockets after inspecting processes', async () => {
    let reads = 0
    vi.mocked(readFile).mockImplementation(async (file) => {
      if (file === '/proc/net/unix') {
        reads += 1
        return reads === 1 ? header : header + listener()
      }
      return files.get(String(file)) ?? ''
    })
    expect(await noTmuxServer(missing())).toBe(false)
  })

  it('recognizes directory aliases for a live server socket', async () => {
    server('/alias/work project')
    vi.mocked(realpath).mockImplementation(async (file) =>
      String(file).replace('/alias', '/owned/tmux-1000'),
    )
    expect(await noTmuxServer(missing())).toBe(false)
  })

  it('refuses a live tmux process without an identifiable listening socket', async () => {
    server()
    files.set('/proc/123/net/unix', header)
    expect(await noTmuxServer(missing())).toBe(false)
  })

  it('does not treat a retired zombie server as running', async () => {
    server(socket, 'Z')
    expect(await noTmuxServer(missing())).toBe(true)
  })

  it.each(['EACCES', 'EPERM', 'ENOENT', 'EIO'])('fails closed when socket evidence is unreadable: %s', async (code) => {
    vi.mocked(readFile).mockRejectedValue(errno(code))
    expect(await noTmuxServer(missing())).toBe(false)
  })

  it.each([
    '',
    'not a socket table\n',
    header + 'truncated entry\n',
    (header + listener()).trimEnd(),
  ])('fails closed on incomplete socket evidence (%j)', async (table) => {
    files.set('/proc/net/unix', table)
    expect(await noTmuxServer(missing())).toBe(false)
  })

  it('fails closed when process enumeration is denied', async () => {
    vi.mocked(readdir).mockRejectedValue(errno('EACCES'))
    expect(await noTmuxServer(missing())).toBe(false)
  })

  it.each(['hidepid=1', 'hidepid=2', 'hidepid=4', 'hidepid=invisible'])('fails closed on a filtered process table: %s', async (option) => {
    files.set('/proc/self/mountinfo', `1 0 0:1 / /proc rw - proc proc rw,${option}\n`)
    expect(await noTmuxServer(missing())).toBe(false)
  })

  it('fails closed when process table visibility is unknown', async () => {
    files.delete('/proc/self/mountinfo')
    expect(await noTmuxServer(missing())).toBe(false)
  })

  it('fails closed when process identity cannot be read', async () => {
    server()
    files.set('/proc/123/status', 'unrecognized status')
    expect(await noTmuxServer(missing())).toBe(false)
  })

  it('fails closed when a live server descriptor cannot be read', async () => {
    server('/owned/other')
    vi.mocked(readlink).mockImplementation(async (file) => {
      if (String(file).includes('/fd/')) {
        throw errno('EACCES')
      }
      return links.get(String(file)) ?? ''
    })
    expect(await noTmuxServer(missing())).toBe(false)
  })

  it('fails closed when socket aliases cannot be resolved', async () => {
    server('/owned/other')
    vi.mocked(realpath).mockRejectedValue(errno('EACCES'))
    expect(await noTmuxServer(missing())).toBe(false)
  })

  it.each([
    null,
    undefined,
    new Error('unclassified failure'),
    { stderr: 'no server running' },
    { stderr: 'no server running on relative/socket' },
    { stderr: `warning\nno server running on ${socket}` },
    { stderr: `error connecting to ${socket} (Permission denied)` },
    { stderr: `error connecting to ${socket} (Connection refused)` },
  ])('does not infer absence from unknown or ambiguous errors (%j)', async (failure) => {
    expect(await noTmuxServer(failure)).toBe(false)
    expect(readFile).not.toHaveBeenCalled()
    expect(readdir).not.toHaveBeenCalled()
  })

  it('keeps executable availability separate from server absence', async () => {
    const failure = errno('ENOENT')
    expect(tmuxNotInstalled(failure)).toBe(true)
    expect(await noTmuxServer(failure)).toBe(false)
    expect(tmuxNotInstalled(missing())).toBe(false)
    expect(tmuxNotInstalled(null)).toBe(false)
    expect(readFile).not.toHaveBeenCalled()
  })
})

describe('tmux absence callers', () => {
  it('retries then rejects discovery of a live server with a missing socket', async () => {
    const failure = missing()
    files.set('/proc/net/unix', header + listener())
    execute.mockImplementation(async (command) => {
      if (command === 'ps') {
        return { stdout: '', stderr: '' }
      }
      throw failure
    })

    await expect(activeSessions.findActiveCopilotProcesses()).rejects.toBe(failure)
    expect(execute.mock.calls.filter(([command]) => command === 'tmux')).toHaveLength(3)
  })

  it('does not report a stopped session when its server socket is lost', async () => {
    files.set('/proc/net/unix', header + listener())
    const kill = vi.spyOn(process, 'kill')

    await expect(activeSessions.stopActiveCopilotSession('owned-session')).rejects.toThrow(
      'No such file or directory',
    )
    expect(kill).not.toHaveBeenCalled()
  })

  it('keeps the original error and retries when the absence probe fails', async () => {
    vi.mocked(readFile).mockRejectedValue(errno('EACCES'))
    await expect(activeSessions.findActiveCopilotProcesses()).rejects.toThrow(
      'No such file or directory',
    )
    expect(execute.mock.calls.filter(([command]) => command === 'tmux')).toHaveLength(3)
  })

  it('can recover through the existing retry loop', async () => {
    files.set('/proc/net/unix', header + listener())
    execute
      .mockResolvedValueOnce({ stdout: '', stderr: '' })
      .mockRejectedValueOnce(missing())
      .mockResolvedValueOnce({ stdout: '', stderr: '' })

    await expect(activeSessions.findActiveCopilotProcesses()).resolves.toEqual([])
    expect(execute.mock.calls.filter(([command]) => command === 'tmux')).toHaveLength(2)
  })

  it('allows discovery on a genuinely cold machine', async () => {
    await expect(activeSessions.findActiveCopilotProcesses()).resolves.toEqual([])
  })

  it('keeps a missing executable an availability condition', async () => {
    execute.mockImplementation(async (command) => {
      if (command === 'ps') {
        return { stdout: '', stderr: '' }
      }
      throw errno('ENOENT')
    })
    await expect(activeSessions.findActiveCopilotProcesses()).resolves.toEqual([])
    expect(readFile).not.toHaveBeenCalled()
  })

  it('does not add evidence probes to successful polling', async () => {
    execute.mockResolvedValue({ stdout: '', stderr: '' })
    await expect(activeSessions.findActiveCopilotProcesses()).resolves.toEqual([])
    expect(readFile).not.toHaveBeenCalled()
    expect(readdir).not.toHaveBeenCalledWith('/proc')
  })

  it('refuses terminal creation instead of starting a second server', async () => {
    files.set('/proc/net/unix', header + listener())
    const controller = new TmuxTerminalSessionController()
    await expect(controller.create('owned-session', '/owned', 'test')).rejects.toThrow(
      'No such file or directory',
    )
    expect(execute).toHaveBeenCalledTimes(1)
    expect(execute.mock.calls[0][1][0]).toBe('list-sessions')
  })

  it('refuses terminal stop before confirming any teardown', async () => {
    files.set('/proc/net/unix', header + listener())
    const controller = new TmuxTerminalSessionController()
    const confirm = vi.fn()
    await expect(controller.stop('owned-session', confirm)).rejects.toThrow(
      'No such file or directory',
    )
    expect(confirm).not.toHaveBeenCalled()
  })

  it('does not accept a lost socket as proof that no panes remain', async () => {
    execute.mockResolvedValue({ stdout: '', stderr: '' })
    const controller = new TmuxTerminalSessionController()
    expect(await controller.has('owned-session')).toBe(false)
    execute.mockRejectedValue(missing())
    files.set('/proc/net/unix', header + listener())

    await expect(controller.stop('owned-session')).resolves.toBe(false)
  })

  it('propagates lost socket failures when looking up a known pane owner', async () => {
    vi.spyOn(activeSessions, 'findActiveCopilotProcesses').mockResolvedValue([
      { pid: 456, sessionId: 'owned-session', source: 'argument' },
    ])
    files.set('/proc/net/unix', header + listener())
    const controller = new TmuxTerminalSessionController()

    await expect(controller.has('owned-session')).rejects.toThrow(
      'No such file or directory',
    )
  })
})
