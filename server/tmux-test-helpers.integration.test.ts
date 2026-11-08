import { execFile, spawn } from 'node:child_process'
import { once } from 'node:events'
import { access, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { createInterface } from 'node:readline'
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
const abandoned = new Set<string>()

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

async function isRetired(pid: number): Promise<boolean> {
  try {
    const stat = await readFile(`/proc/${pid}/stat`, 'utf8')
    return ['Z', 'X'].includes(stat.slice(stat.lastIndexOf(')') + 1).trim().split(/\s+/, 1)[0])
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    return true
  }
}

async function expectRetired(pid: number): Promise<void> {
  expect(await isRetired(pid)).toBe(true)
}

async function removed(file: string): Promise<boolean> {
  return access(file).then(() => false, () => true)
}

async function processesReferencing(root: string): Promise<number[]> {
  const pids: number[] = []
  for (const entry of await readdir('/proc')) {
    if (!/^\d+$/.test(entry) || Number(entry) === process.pid) continue
    const evidence = await Promise.all(['cmdline', 'environ'].map((file) =>
      readFile(`/proc/${entry}/${file}`, 'utf8').catch(() => '')))
    if (evidence.some((content) => content.includes(root))) pids.push(Number(entry))
  }
  return pids
}

const helpers = new URL('./tmux-test-helpers.ts', import.meta.url).href

/**
 * Creates a fixture with a pane that ignores SIGHUP, as some fake CLIs do, in
 * a separate process that then ends without teardown: the same as a run whose
 * earlier `afterEach` step threw or timed out, or which was killed.
 */
async function abandonFixture(ending: 'exit' | 'SIGKILL', tmuxClient: string) {
  const script = `
    import { execFileSync } from 'node:child_process'
    const { createIsolatedTmuxRoot, isolatedTmuxEnv } = await import(${JSON.stringify(helpers)})
    const root = await createIsolatedTmuxRoot()
    const tmux = (args) => execFileSync('tmux', args, { env: isolatedTmuxEnv(root), encoding: 'utf8' }).trim()
    tmux(['new-session', '-d', '-s', 'abandoned', 'trap "" HUP; exec sleep 60'])
    console.log(JSON.stringify({
      root,
      server: Number(tmux(['display-message', '-p', '#{pid}'])),
      pane: Number(tmux(['display-message', '-p', '-t', '=abandoned:', '#{pane_pid}'])),
    }))
    ${ending === 'exit' ? 'process.exit(0)' : 'setInterval(() => {}, 1_000)'}
  `
  const creator = spawn(process.execPath, [
    '--import', import.meta.resolve('tsx'), '--input-type=module', '--eval', script,
  ], { env: { ...process.env, TMUX: tmuxClient }, stdio: ['ignore', 'pipe', 'inherit'] })
  const ended = once(creator, 'exit')
  let reportedFixture = false
  try {
    const reported = await Promise.race([
      once(createInterface({ input: creator.stdout }), 'line'),
      ended.then(() => undefined),
    ])
    if (!reported) throw new Error('The creating process ended before reporting its fixture')
    const fixture = JSON.parse(String(reported[0])) as { root: string, server: number, pane: number }
    abandoned.add(fixture.root)
    if (!(fixture.server > 0 && fixture.pane > 0)) {
      throw new Error(`The creating process reported no live server or pane: ${String(reported[0])}`)
    }
    reportedFixture = true
    return fixture
  } finally {
    if (ending === 'SIGKILL' || !reportedFixture) creator.kill('SIGKILL')
    await ended
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
  for (const root of abandoned) {
    try {
      if (!(await removed(root))) await stopIsolatedTmuxServer(root)
    } catch (error) {
      failures.push(new Error(`Unable to clean up abandoned tmux fixture ${root}`, { cause: error }))
    }
  }
  abandoned.clear()
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

describe('abandoned tmux fixture retirement', () => {
  it.each(['exit', 'SIGKILL'] as const)(
    'retires the server and panes of a fixture whose creator ends by %s without teardown',
    async (ending) => {
      // A creator run inside tmux has TMUX naming that server; it must survive.
      const unrelated = await fixture()
      const unrelatedPid = await start(unrelated)
      const client = await tmux(unrelated, ['display-message', '-p', '#{socket_path},#{pid},0'])

      const { root, server, pane } = await abandonFixture(ending, client)

      const retirement = async () => ({
        server: await isRetired(server),
        pane: await isRetired(pane),
        root: await removed(root),
      })
      expect(await eventually(retirement, (state) => Object.values(state).every(Boolean), 5_000))
        .toEqual({ server: true, pane: true, root: true })
      expect(await serverPid(unrelated)).toBe(unrelatedPid)
    },
    15_000,
  )

  it('leaves no process behind after an ordinary teardown', async () => {
    const root = await fixture()
    await start(root)
    await release(root)
    expect(await eventually(() => processesReferencing(root), (pids) => pids.length === 0, 5_000))
      .toEqual([])
  }, 10_000)
})
