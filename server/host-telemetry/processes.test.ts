import { describe, expect, it, vi } from 'vitest'
import { ProcessRowSchema } from '../../shared/host-telemetry.js'
import { MAX_PROCESS_SCAN, scanProcesses, type ProcessScanContext } from './processes.js'
import { processStatFixture, processTreeFixture } from './process-test-fixtures.js'

function contextFor(fixture: ReturnType<typeof processTreeFixture>, extra: Partial<ProcessScanContext> = {}): ProcessScanContext {
  return {
    reader: fixture.reader,
    uid: 1000,
    servicePid: 10,
    now: () => Date.parse('2026-11-14T07:00:00Z'),
    ...extra,
  }
}

describe('on-demand process inventory', () => {
  it('walks out-of-order ancestry, separating terminal sessions and shared runtime subtrees', async () => {
    const fixture = processTreeFixture([
      { pid: 10, startTime: 1, executable: '/usr/bin/node' },
      { pid: 3, ppid: 20, startTime: 4, executable: '/usr/bin/git' },
      { pid: 20, ppid: 10, startTime: 2, executable: '/usr/bin/copilot' },
      { pid: 21, ppid: 10, startTime: 2, executable: '/opt/claude' },
      { pid: 22, ppid: 21, startTime: 3 },
      { pid: 23, ppid: 10, startTime: 2 },
      { pid: 24, ppid: 10, startTime: 2, executable: '/opt/sdk/prebuilds/linux-x64/copilot-runtime' },
      { pid: 25, ppid: 24, startTime: 3, executable: '/usr/bin/node' },
      { pid: 30, ppid: 10, startTime: 2, executable: '/usr/bin/copilot' },
      { pid: 31, ppid: 30, startTime: 3, executable: '/usr/bin/node' },
      { pid: 40, executable: '/opt/unrelated/copilot' },
      { pid: 41, executable: '/opt/unrelated/claude' },
    ])
    const listSessionPaneRoots = vi.fn(async () => [{ sessionId: 'terminal-session', panePid: 30, paneStartTime: 2 }])
    const context = contextFor(fixture, { listSessionPaneRoots })
    expect(fixture.reader.readdir).not.toHaveBeenCalled()
    expect(listSessionPaneRoots).not.toHaveBeenCalled()
    const result = await scanProcesses(context)
    const rows = new Map(result.rows.map((row) => [row.pid, row]))
    expect(rows.get(10)).toMatchObject({ owner: 'agentic-remote' })
    expect(rows.get(23)).toMatchObject({ owner: 'agentic-remote' })
    for (const pid of [3, 20, 24, 25]) expect(rows.get(pid)).toMatchObject({
      owner: 'shared-runtime', label: 'Shared Copilot runtime',
    })
    for (const pid of [21, 22]) expect(rows.get(pid)).toMatchObject({
      owner: 'shared-runtime', label: 'Claude runtime',
    })
    for (const pid of [30, 31]) expect(rows.get(pid)).toMatchObject({
      owner: 'session', sessionId: 'terminal-session',
    })
    for (const pid of [40, 41]) expect(rows.get(pid)).toMatchObject({ owner: 'other' })
    expect(result).toMatchObject({ truncated: false, othersCount: 0, scannedAt: '2026-11-14T07:00:00.000Z' })
    expect(result.rows.every((row) => ProcessRowSchema.safeParse(row).success)).toBe(true)
    expect(result.rows.filter((row) => row.owner === 'shared-runtime').every((row) => !row.sessionId)).toBe(true)
    expect(fixture.calls.some((path) => /cmdline|environ/u.test(path))).toBe(false)
  })

  it('does not infer terminal ownership from a name, missing start time, or reused pane PID', async () => {
    const fixture = processTreeFixture([
      { pid: 30, startTime: 200, executable: '/usr/bin/copilot' },
      { pid: 31, ppid: 30, startTime: 201 },
      { pid: 40, startTime: 2 },
    ])
    const result = await scanProcesses(contextFor(fixture, {
      listSessionPaneRoots: async () => [
        { sessionId: 'old-session', panePid: 30, paneStartTime: 100 },
        { sessionId: 'unverified', panePid: 40 },
      ],
    }))
    expect(result.rows.map((row) => row.owner)).toEqual(['other', 'other', 'other'])
  })

  it('rejects a root replaced after inventory and a service PID replaced during the scan', async () => {
    const fixture = processTreeFixture([
      { pid: 10, startTime: 1 },
      { pid: 20, ppid: 10, startTime: 2 },
      { pid: 30, startTime: 3 },
      { pid: 31, ppid: 30, startTime: 4 },
    ])
    const readText = fixture.reader.readText
    const reads = new Map<string, number>()
    fixture.reader.readText = async (path) => {
      const count = (reads.get(path) ?? 0) + 1
      reads.set(path, count)
      if (path === '/proc/10/stat' && count >= 4) return processStatFixture({ pid: 10, startTime: 100 })
      if (path === '/proc/30/stat' && count >= 3) return processStatFixture({ pid: 30, startTime: 100 })
      return readText(path)
    }
    const result = await scanProcesses(contextFor(fixture, {
      listSessionPaneRoots: async () => [{ sessionId: 'replaced', panePid: 30, paneStartTime: 3 }],
    }))
    expect(result.rows.every((row) => row.owner === 'other')).toBe(true)
  })

  it('breaks cycles, missing parents, and parent edges newer than their children', async () => {
    const fixture = processTreeFixture([
      { pid: 10, startTime: 10 },
      { pid: 20, ppid: 10, startTime: 5 },
      { pid: 30, ppid: 31, startTime: 1 },
      { pid: 31, ppid: 30, startTime: 1 },
      { pid: 40, ppid: 404 },
    ])
    const result = await scanProcesses(contextFor(fixture))
    expect(result.rows.filter((row) => row.pid !== 10).every((row) => row.owner === 'other')).toBe(true)
  })

  it('fails closed on conflicting session roots and unreadable tmux state', async () => {
    const fixture = processTreeFixture([{ pid: 30 }])
    const result = await scanProcesses(contextFor(fixture, {
      listSessionPaneRoots: async () => [
        { sessionId: 'a', panePid: 30, paneStartTime: 30 },
        { sessionId: 'b', panePid: 30, paneStartTime: 30 },
      ],
    }))
    expect(result.rows[0].owner).toBe('other')
    const unavailable = await scanProcesses(contextFor(fixture, {
      listSessionPaneRoots: async () => { throw fixture.failure() },
    }))
    expect(unavailable.rows[0].owner).toBe('other')
  })

  it('filters other UIDs before reading details and emits only sanitized executable basenames', async () => {
    const fixture = processTreeFixture([
      { pid: 10, executable: '/secret/build/path/node (deleted)', rssPages: 12 },
      { pid: 20, uid: 2000, executable: '/secret/other/command' },
      { pid: 30, comm: 'copilot' },
    ])
    fixture.reader.readlink = async (path) => {
      if (path === '/proc/30/exe') throw fixture.failure('EACCES')
      return fixture.tree.get(Number(path.split('/')[2]))!.executable!
    }
    const result = await scanProcesses(contextFor(fixture))
    expect(result.othersCount).toBe(1)
    expect(result.rows.map((row) => row.executable)).toEqual(['node', 'copilot'])
    expect(result.rows[0].rssBytes).toBe(49_152)
    expect(fixture.calls.filter((path) => path.startsWith('/proc/20'))).toEqual(['/proc/20'])
    expect(JSON.stringify(result)).not.toContain('/secret')
    expect(fixture.calls.every((path) => !/cmdline|environ/u.test(path))).toBe(true)
  })

  it('never promotes a mutable comm name or generic interpreter to a shared runtime', async () => {
    const fixture = processTreeFixture([
      { pid: 10, startTime: 1 },
      { pid: 20, ppid: 10, comm: 'copilot', executable: '/usr/bin/node' },
      { pid: 30, ppid: 10, comm: 'claude' },
    ])
    const readlink = fixture.reader.readlink
    fixture.reader.readlink = async (path) => {
      if (path === '/proc/30/exe') throw fixture.failure()
      return readlink(path)
    }
    expect((await scanProcesses(contextFor(fixture))).rows.every((row) => row.owner === 'agentic-remote')).toBe(true)
  })

  it.each(['ENOENT', 'ESRCH', 'EACCES', 'EPERM'])('skips %s races and rejects a process replaced while reading', async (code) => {
    const fixture = processTreeFixture([{ pid: 10 }, { pid: 20 }, { pid: 30 }])
    const readText = fixture.reader.readText
    fixture.reader.readlink = async (path) => {
      const pid = Number(path.split('/')[2])
      if (pid === 20) throw fixture.failure(code)
      if (pid === 30) fixture.tree.set(30, { pid: 30, startTime: 99 })
      return '/usr/bin/sleep'
    }
    fixture.reader.readText = async (path) => {
      if (path.startsWith('/proc/20/')) throw fixture.failure(code)
      return readText(path)
    }
    expect((await scanProcesses(contextFor(fixture))).rows.map((row) => row.pid)).toEqual([10])
  })

  it('caps work at 4096 numeric entries and reports truncation, including filtered UIDs', async () => {
    const fixture = processTreeFixture(Array.from({ length: MAX_PROCESS_SCAN + 3 }, (_, index) => ({
      pid: index + 1, uid: index % 2 ? 2000 : 1000,
    })))
    const result = await scanProcesses(contextFor(fixture, { servicePid: MAX_PROCESS_SCAN + 1 }))
    expect(result.truncated).toBe(true)
    expect(result.rows).toHaveLength(MAX_PROCESS_SCAN / 2)
    expect(result.othersCount).toBe(MAX_PROCESS_SCAN / 2)
    expect(fixture.calls.some((path) => path.startsWith(`/proc/${MAX_PROCESS_SCAN + 1}`))).toBe(false)
    fixture.tree.delete(MAX_PROCESS_SCAN + 1)
    fixture.tree.delete(MAX_PROCESS_SCAN + 2)
    fixture.tree.delete(MAX_PROCESS_SCAN + 3)
    expect((await scanProcesses(contextFor(fixture, { servicePid: 1 }))).truncated).toBe(false)
  })

  it('yields between bounded batches so an open process view cannot monopolize the event loop', async () => {
    const fixture = processTreeFixture(Array.from({ length: 64 }, (_, index) => ({ pid: index + 1 })))
    let yielded = false
    setImmediate(() => { yielded = true })
    await scanProcesses(contextFor(fixture))
    expect(yielded).toBe(true)
  })

  it('uses utime + stime deltas, preserves multicore CPU, and resets on PID reuse, counter reset, or time reversal', async () => {
    const fixture = processTreeFixture([{ pid: 20, startTime: 2, utime: 100, stime: 100 }])
    let time = 0
    const context = contextFor(fixture, { monotonicNow: () => time })
    expect((await scanProcesses(context)).rows[0].cpuPercent).toBe(0)
    fixture.tree.set(20, { pid: 20, startTime: 2, utime: 400, stime: 300 })
    time = 2000
    expect((await scanProcesses(context)).rows[0].cpuPercent).toBe(250)
    fixture.tree.set(20, { pid: 20, startTime: 3, utime: 1000 })
    time = 3000
    expect((await scanProcesses(context)).rows[0].cpuPercent).toBe(0)
    fixture.tree.set(20, { pid: 20, startTime: 3, utime: 1 })
    time = 4000
    expect((await scanProcesses(context)).rows[0].cpuPercent).toBe(0)
    fixture.tree.set(20, { pid: 20, startTime: 3, utime: 200 })
    expect((await scanProcesses(context)).rows[0].cpuPercent).toBe(0)
    time = 3000
    expect((await scanProcesses(context)).rows[0].cpuPercent).toBe(0)
    expect((await scanProcesses(contextFor(fixture))).rows[0].cpuPercent).toBe(0)
  })
})
