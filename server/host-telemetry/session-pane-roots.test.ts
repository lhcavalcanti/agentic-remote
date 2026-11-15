import { describe, expect, it, vi } from 'vitest'
import { SessionPaneRoots } from './session-pane-roots.js'
import { processStatFixture } from './process-test-fixtures.js'

describe('read-only terminal pane roots', () => {
  it('retains the original observed identity, verifies current tmux bindings, and returns detached values', async () => {
    let startTime = 100
    const readStat = vi.fn(async (pid: number) => processStatFixture({ pid, startTime }))
    const listPanes = vi.fn(async () => '%1\t42\n%2\t99\n')
    const roots = new SessionPaneRoots(readStat, listPanes)
    expect(await roots.listSessionPaneRoots()).toEqual([])
    expect(listPanes).not.toHaveBeenCalled()
    await roots.observe('session-a', { target: '%1', rootPid: 42 }, 42, 100)
    await roots.observe('session-a', { target: '%1', rootPid: 42 }, 42, 100)
    expect(readStat).toHaveBeenCalledOnce()
    const listed = await roots.listSessionPaneRoots()
    expect(listed).toEqual([{ sessionId: 'session-a', panePid: 42, paneStartTime: 100 }])
    listed[0].paneStartTime = 999
    expect((await roots.listSessionPaneRoots())[0].paneStartTime).toBe(100)
    startTime = 200
    await roots.observe('session-a', { target: '%1', rootPid: 42 }, 42, 100)
    expect(await roots.listSessionPaneRoots()).toEqual([])
    listPanes.mockResolvedValue('%1\t43\n')
    expect(await roots.listSessionPaneRoots()).toEqual([])
    await roots.observe('session-a', { target: '%1', rootPid: 43 }, 43, 200)
    expect(await roots.listSessionPaneRoots()).toEqual([{ sessionId: 'session-a', panePid: 43, paneStartTime: 200 }])
    roots.forget('session-a')
    expect(await roots.listSessionPaneRoots()).toEqual([])
  })

  it('does not attribute a surviving shell pane after its session process exits or its PID is reused', async () => {
    let ownerStartTime = 200
    let parentPid = 42
    let gone = false
    const roots = new SessionPaneRoots(async (pid) => {
      if (pid === 43 && gone) throw Object.assign(new Error('gone'), { code: 'ENOENT' })
      return processStatFixture({ pid, ppid: pid === 43 ? parentPid : 1, startTime: pid === 42 ? 100 : ownerStartTime })
    }, async () => '%1\t42\n')
    await roots.observe('session', { target: '%1', rootPid: 42 }, 43, 200)
    expect(await roots.listSessionPaneRoots()).toEqual([{ sessionId: 'session', panePid: 42, paneStartTime: 100 }])
    ownerStartTime = 300
    expect(await roots.listSessionPaneRoots()).toEqual([])
    ownerStartTime = 200
    parentPid = 1
    expect(await roots.listSessionPaneRoots()).toEqual([])
    gone = true
    expect(await roots.listSessionPaneRoots()).toEqual([])
  })

  it('never fabricates an identity or disrupts terminal operations when proc or tmux is unavailable', async () => {
    const roots = new SessionPaneRoots(async () => { throw new Error('gone') }, async () => '')
    await expect(roots.observe('session', { target: '%1', rootPid: 42 }, 42, 42)).resolves.toBeUndefined()
    expect(await roots.listSessionPaneRoots()).toEqual([])
    const missingTmux = new SessionPaneRoots(
      async (pid) => processStatFixture({ pid }),
      async () => { throw new Error('no server') },
    )
    await missingTmux.observe('session', { target: '%1', rootPid: 42 }, 42, 42)
    expect(await missingTmux.listSessionPaneRoots()).toEqual([])
  })

  it('caps total ancestry reads across roots and yields during deep traversals', async () => {
    const parents = new Map<number, number>()
    for (let index = 0; index < 3; index += 1) {
      const ownerPid = 100_000 + index * 10_000
      for (let depth = 0; depth < 1600; depth += 1) {
        parents.set(ownerPid - depth, depth === 1599 ? 10_000 + index : ownerPid - depth - 1)
      }
    }
    const readStat = vi.fn(async (pid: number) => processStatFixture({
      pid, ppid: parents.get(pid) ?? 1, startTime: pid,
    }))
    const readsAtYield: number[] = []
    const roots = new SessionPaneRoots(readStat, async () => '%0\t10000\n%1\t10001\n%2\t10002\n',
      async () => { readsAtYield.push(readStat.mock.calls.length) })
    for (let index = 0; index < 3; index += 1) {
      const ownerPid = 100_000 + index * 10_000
      await roots.observe(`session-${index}`, { target: `%${index}`, rootPid: 10_000 + index }, ownerPid, ownerPid)
    }
    readStat.mockClear()
    const listed = await roots.listSessionPaneRoots()
    expect(readStat.mock.calls.length).toBeLessThanOrEqual(4096)
    expect(listed.map((root) => root.sessionId)).toEqual(['session-0', 'session-1'])
    expect(readsAtYield.length).toBeGreaterThan(0)
    expect(readsAtYield[0]).toBeLessThanOrEqual(32)
    expect(readsAtYield.every((count, index) => count - (readsAtYield[index - 1] ?? 0) <= 32)).toBe(true)
    roots.forget('session-0')
    roots.forget('session-1')
    expect(await roots.listSessionPaneRoots()).toEqual([{
      sessionId: 'session-2', panePid: 10_002, paneStartTime: 10_002,
    }])
  })

  it.each(['pane', 'exited', 'reused', 'detached'])('prunes a retired %s binding instead of retaining it for later scans', async (reason) => {
    let retired = false
    const readStat = vi.fn(async (pid: number) => {
      if (retired && reason === 'exited' && pid === 43) throw Object.assign(new Error('gone'), { code: 'ENOENT' })
      return processStatFixture({
        pid,
        ppid: pid === 43 && !(retired && reason === 'detached') ? 42 : 1,
        startTime: pid === 42 ? 100 : retired && reason === 'reused' ? 300 : 200,
      })
    })
    const listPanes = vi.fn(async () => retired && reason === 'pane' ? '' : '%1\t42\n')
    const roots = new SessionPaneRoots(readStat, listPanes)
    await roots.observe('session', { target: '%1', rootPid: 42 }, 43, 200)
    expect(await roots.listSessionPaneRoots()).toHaveLength(1)
    retired = true
    expect(await roots.listSessionPaneRoots()).toEqual([])
    retired = false
    readStat.mockClear()
    listPanes.mockClear()
    expect(await roots.listSessionPaneRoots()).toEqual([])
    expect(listPanes).not.toHaveBeenCalled()
    expect(readStat).not.toHaveBeenCalled()
  })

  it('bounds retained observations while keeping recently observed session bindings', async () => {
    const readStat = vi.fn(async (pid: number) => processStatFixture({ pid, startTime: pid }))
    const panes = Array.from({ length: 4097 }, (_, index) => `%${index}\t${10_000 + index}`).join('\n')
    const roots = new SessionPaneRoots(readStat, async () => panes, async () => undefined)
    for (let index = 0; index < 4096; index += 1) {
      await roots.observe(`session-${index}`, { target: `%${index}`, rootPid: 10_000 + index }, 10_000 + index, 10_000 + index)
    }
    await roots.observe('session-0', { target: '%0', rootPid: 10_000 }, 10_000, 10_000)
    await roots.observe('session-4096', { target: '%4096', rootPid: 14_096 }, 14_096, 14_096)
    readStat.mockClear()
    const listed = await roots.listSessionPaneRoots()
    expect(listed).toHaveLength(4096)
    expect(listed.some((root) => root.sessionId === 'session-0')).toBe(true)
    expect(listed.some((root) => root.sessionId === 'session-1')).toBe(false)
    expect(listed.some((root) => root.sessionId === 'session-4096')).toBe(true)
    expect(readStat.mock.calls.length).toBeLessThanOrEqual(4096)
  })

  it('does not return a binding retired while its ancestry read is in flight', async () => {
    let block = false
    let enter!: () => void
    let finish!: () => void
    const entered = new Promise<void>((resolve) => { enter = resolve })
    const pending = new Promise<void>((resolve) => { finish = resolve })
    const roots = new SessionPaneRoots(async (pid) => {
      if (block) {
        enter()
        await pending
      }
      return processStatFixture({ pid, startTime: 100 })
    }, async () => '%1\t42\n')
    await roots.observe('session', { target: '%1', rootPid: 42 }, 42, 100)
    block = true
    const listing = roots.listSessionPaneRoots()
    await entered
    roots.forget('session')
    finish()
    expect(await listing).toEqual([])
  })
})
