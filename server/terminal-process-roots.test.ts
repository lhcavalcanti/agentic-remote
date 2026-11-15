import { afterEach, describe, expect, it, vi } from 'vitest'
import { TmuxTerminalSessionController } from './terminal-session.js'
import { findActiveCopilotProcesses } from './active-sessions.js'
import { processStatFixture } from './host-telemetry/process-test-fixtures.js'

const adapter = vi.hoisted(() => ({ run: vi.fn(), readFileSync: vi.fn(), readFile: vi.fn(), readdir: vi.fn() }))
vi.mock('node:child_process', () => {
  const execFile = vi.fn()
  Object.defineProperty(execFile, Symbol.for('nodejs.util.promisify.custom'), { value: adapter.run })
  return { execFile }
})
vi.mock('node:fs/promises', async (importOriginal) => ({
  ...await importOriginal<typeof import('node:fs/promises')>(),
  readFile: adapter.readFile,
  readdir: adapter.readdir,
}))
vi.mock('node:fs', async (importOriginal) => ({
  ...await importOriginal<typeof import('node:fs')>(),
  readFileSync: adapter.readFileSync,
}))

afterEach(() => {
  vi.restoreAllMocks()
  adapter.run.mockReset()
  adapter.readFile.mockReset()
  adapter.readFileSync.mockReset()
  adapter.readdir.mockReset()
  vi.unstubAllEnvs()
})

describe('terminal process attribution accessor', () => {
  it('exposes an already-proven binding without rediscovery, provider startup, or argument/environment reads', async () => {
    const controller = new TmuxTerminalSessionController()
    const discovery = vi.spyOn(controller as unknown as {
      activeProcesses(): ReturnType<typeof findActiveCopilotProcesses>
    }, 'activeProcesses').mockResolvedValue([{ pid: 42, sessionId: 'session', source: 'argument', startTime: 123 }])
    adapter.readFile.mockImplementation(async (path: string) => {
      expect(path).toBe('/proc/42/stat')
      return processStatFixture({ pid: 42, ppid: 1, startTime: 123 })
    })
    adapter.readFileSync.mockImplementation((path: string) => {
      expect(path).toBe('/proc/42/stat')
      return processStatFixture({ pid: 42, ppid: 1, startTime: 123 })
    })
    adapter.run.mockImplementation(async (file: string, args: string[]) => {
      expect(file).toBe('tmux')
      expect(args.slice(0, 3)).toEqual(['list-panes', '-a', '-F'])
      expect(args[3]).toMatch(/^#\{(?:pane_pid|pane_id)\}\t#\{(?:pane_pid|pane_id)\}$/u)
      return { stdout: args[3].startsWith('#{pane_pid}') ? '42\t%7\n' : '%7\t42\n', stderr: '' }
    })
    expect(await controller.listSessionPaneRoots()).toEqual([])
    expect(discovery).not.toHaveBeenCalled()
    expect(await controller.has('session')).toBe(true)
    discovery.mockClear()
    adapter.readFile.mockClear()
    adapter.readFileSync.mockClear()
    adapter.run.mockClear()
    expect(await controller.listSessionPaneRoots()).toEqual([
      { sessionId: 'session', panePid: 42, paneStartTime: 123 },
    ])
    expect(discovery).not.toHaveBeenCalled()
    expect(adapter.readFile).not.toHaveBeenCalled()
    expect(adapter.readFileSync).toHaveBeenCalledExactlyOnceWith('/proc/42/stat', 'utf8')
    expect(adapter.run).toHaveBeenCalledOnce()
  })

  it('does not turn a telemetry identity failure into a terminal ownership failure', async () => {
    const controller = new TmuxTerminalSessionController()
    vi.spyOn(controller as unknown as {
      activeProcesses(): ReturnType<typeof findActiveCopilotProcesses>
    }, 'activeProcesses').mockResolvedValue([{ pid: 42, sessionId: 'session', source: 'argument', startTime: 42 }])
    adapter.readFile.mockResolvedValueOnce(processStatFixture({ pid: 42, ppid: 1 }))
    adapter.readFileSync.mockImplementation(() => { throw Object.assign(new Error('gone'), { code: 'ENOENT' }) })
    adapter.run.mockResolvedValue({ stdout: '42\t%7\n', stderr: '' })
    expect(await controller.has('session')).toBe(true)
    expect(await controller.listSessionPaneRoots()).toEqual([])
  })

  it('does not trust a PID reused after the cached session identity proof', async () => {
    const sessionId = '12345678-1234-1234-1234-123456789abc'
    vi.stubEnv('COPILOT_HOME', '/fixture/copilot')
    let startTime = 123
    adapter.readdir.mockRejectedValue(Object.assign(new Error('no sessions'), { code: 'ENOENT' }))
    adapter.readFile.mockImplementation(async (path: string) => {
      if (path === '/proc/42/stat') return processStatFixture({ pid: 42, startTime })
      if (path === '/proc/42/environ') return 'COPILOT_HOME=/fixture/copilot\0'
      if (path === '/proc/42/cmdline') return `copilot\0--session-id\0${sessionId}\0`
      throw new Error(`Unexpected read: ${path}`)
    })
    adapter.readFileSync.mockImplementation(() => processStatFixture({ pid: 42, startTime }))
    adapter.run.mockImplementation(async (file: string, args: string[]) => {
      if (file === 'ps') return { stdout: `42 1 copilot --session-id ${sessionId}\n`, stderr: '' }
      if (args[3] === '#{pane_pid}') return { stdout: '42\n', stderr: '' }
      return { stdout: args[3].startsWith('#{pane_pid}') ? '42\t%7\n' : '%7\t42\n', stderr: '' }
    })
    const proven = await findActiveCopilotProcesses()
    const controller = new TmuxTerminalSessionController()
    vi.spyOn(controller as unknown as {
      activeProcesses(): ReturnType<typeof findActiveCopilotProcesses>
    }, 'activeProcesses').mockResolvedValue(proven)
    startTime = 456
    expect(await controller.has(sessionId)).toBe(true)
    expect(await controller.listSessionPaneRoots()).toEqual([])
    expect(proven).toEqual([{ pid: 42, sessionId, source: 'argument', startTime: 123 }])
  })
})
