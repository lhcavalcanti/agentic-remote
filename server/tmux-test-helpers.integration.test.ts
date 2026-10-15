import { execFile } from 'node:child_process'
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as tmuxErrors from './tmux-errors.js'
import {
  createIsolatedTmuxRoot,
  eventually,
  isolatedTmuxEnv,
  stopIsolatedTmuxServer,
} from './tmux-test-helpers.js'

const execute = promisify(execFile)
const roots = new Set<string>()

async function fixture(): Promise<string> {
  const root = await createIsolatedTmuxRoot()
  roots.add(root)
  return root
}

async function tmux(root: string, args: string[], env: NodeJS.ProcessEnv = {}): Promise<string> {
  return (await execute('tmux', args, { env: { ...isolatedTmuxEnv(root), ...env } })).stdout.trim()
}

async function serverPid(root: string): Promise<number> {
  return Number(await tmux(root, ['display-message', '-p', '#{pid}']))
}

async function start(root: string): Promise<number> {
  await tmux(root, ['new-session', '-d', '-s', 'retirement-fixture', 'sleep 60'])
  return serverPid(root)
}

async function release(root: string): Promise<void> {
  await stopIsolatedTmuxServer(root)
  roots.delete(root)
}

async function expectRetired(pid: number): Promise<void> {
  try {
    const stat = await readFile(`/proc/${pid}/stat`, 'utf8')
    const state = stat.slice(stat.lastIndexOf(')') + 1).trim().split(/\s+/, 1)[0]
    expect(['Z', 'X']).toContain(state)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
}

afterEach(async () => {
  vi.restoreAllMocks()
  const failures: unknown[] = []
  const remaining = [...roots].reverse()
  roots.clear()
  for (const root of remaining) {
    try {
      await release(root)
    } catch (error) {
      failures.push(new Error(`Unable to clean up owned tmux fixture ${root}`, { cause: error }))
    }
  }
  if (failures.length) throw new AggregateError(failures, 'Owned tmux fixture cleanup failed')
})

describe('isolated tmux fixture retirement integration', () => {
  it('retires the owned server before removing its root and admitting the next fixture', async () => {
    const previous = await fixture()
    const previousPid = await start(previous)
    await release(previous)
    await expectRetired(previousPid)
    await expect(access(previous)).rejects.toMatchObject({ code: 'ENOENT' })

    const next = await fixture()
    const nextPid = await start(next)
    expect(nextPid).toBeGreaterThan(0)
    await release(next)
    await expectRetired(nextPid)
  }, 10_000)

  it('leaves a server in a different owned namespace running', async () => {
    const unrelated = await fixture()
    const unrelatedPid = await start(unrelated)
    const target = await fixture()
    const targetPid = await start(target)
    await release(target)
    await expectRetired(targetPid)
    await expect(access(target)).rejects.toMatchObject({ code: 'ENOENT' })

    expect(await serverPid(unrelated)).toBe(unrelatedPid)
  }, 10_000)
})

describe('initialized tmux fixture lifecycle', () => {
  it('starts a reachable server that is configured to outlive its sessions', async () => {
    const root = await fixture()
    const pid = await serverPid(root)
    expect(pid).toBeGreaterThan(0)
    expect(await tmux(root, ['show-options', '-gv', 'exit-empty'])).toBe('off')
    expect(await tmux(root, ['list-sessions'])).toBe('')
  }, 10_000)

  it('keeps the same server reachable after the last session closes', async () => {
    const root = await fixture()
    const pid = await serverPid(root)
    expect(await start(root)).toBe(pid)
    await tmux(root, ['new-session', '-d', '-s', 'short-lived', 'true'])
    await tmux(root, ['kill-session', '-t', '=retirement-fixture'])
    expect(await eventually(() => tmux(root, ['list-sessions', '-F', '#{session_name}']), (names) => names === ''))
      .toBe('')

    expect(await serverPid(root)).toBe(pid)
    await release(root)
    await expectRetired(pid)
  }, 10_000)

  it('tears down without a host-wide absence verdict, even while that verdict is indeterminate', async () => {
    // A tmux process in another mount namespace (such as a sandboxed suite run)
    // leaves the host-wide verdict indeterminate for as long as it runs.
    const absence = vi.spyOn(tmuxErrors, 'noTmuxServer').mockResolvedValue(false)
    const parserOnly = await fixture()
    const closed = await fixture()
    const closedPid = await start(closed)
    await tmux(closed, ['kill-session', '-t', '=retirement-fixture'])

    await release(parserOnly)
    await release(closed)
    await expectRetired(closedPid)
    await expect(access(parserOnly)).rejects.toMatchObject({ code: 'ENOENT' })
    await expect(access(closed)).rejects.toMatchObject({ code: 'ENOENT' })
    expect(absence).not.toHaveBeenCalled()
  }, 10_000)

  it('gives each new session the environment of the client that created it', async () => {
    const root = await fixture()
    const output = path.join(root, 'environment')
    await tmux(root, [
      'new-session', '-d', '-s', 'environment', `printf '%s' "$FIXTURE_VALUE" > ${output}; sleep 60`,
    ], { FIXTURE_VALUE: 'stubbed after the fixture started' })
    expect(await eventually(() => readFile(output, 'utf8').catch(() => ''), Boolean))
      .toBe('stubbed after the fixture started')
  }, 10_000)
})
