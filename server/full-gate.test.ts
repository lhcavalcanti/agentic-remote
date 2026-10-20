import { execFile, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { chmod, copyFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it } from 'vitest'

const run = promisify(execFile)
const GATE = new URL('../bin/agentic-remote-gate', import.meta.url).pathname
const REPO = 'owner/name'
const CONTEXT = 'agentic-remote/full-gate'

const fixtures: string[] = []

afterEach(async () => {
  await Promise.all(
    fixtures.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  )
})

const gitEnv = {
  ...process.env,
  GIT_AUTHOR_NAME: 'Test',
  GIT_AUTHOR_EMAIL: 'test@example.test',
  GIT_COMMITTER_NAME: 'Test',
  GIT_COMMITTER_EMAIL: 'test@example.test',
}

async function git(cwd: string, ...args: string[]): Promise<string> {
  const { stdout } = await run('git', ['-C', cwd, ...args], { env: gitEnv })
  return stdout.trim()
}

async function stub(dir: string, name: string, body: string): Promise<void> {
  const file = path.join(dir, name)
  await writeFile(file, `#!/usr/bin/env bash\n${body}\n`)
  await chmod(file, 0o755)
}

interface Fixture {
  root: string
  mainSha: string
  prSha: string
  temp: string
  gates: string
  callLog: string
  statusLog: string
  env: NodeJS.ProcessEnv
}

interface Status {
  endpoint: string
  state: string
  context: string
  description: string
}

interface Result {
  code: number | null
  signal: NodeJS.Signals | null
  output: string
}

// A real GitHub-shaped remote on disk. The pull request head is only reachable
// through refs/pull/7/head, which a plain clone does not fetch, so a gate that
// tests anything but the exact SHA it was given cannot pass.
async function fixture(): Promise<Fixture> {
  const root = await mkdtemp(path.join(tmpdir(), 'full-gate-'))
  fixtures.push(root)
  const remotes = path.join(root, 'github')
  const origin = path.join(remotes, 'owner', 'name.git')
  const work = path.join(root, 'work')
  const bin = path.join(root, 'bin')
  const temp = path.join(root, 'tmp')
  const state = path.join(root, 'state')
  const callLog = path.join(root, 'calls.log')
  const statusLog = path.join(root, 'statuses.log')
  await mkdir(path.dirname(origin), { recursive: true })
  await Promise.all([bin, temp, state].map((dir) => mkdir(dir, { recursive: true })))
  await writeFile(callLog, '')
  await writeFile(statusLog, '')

  await run('git', ['init', '--quiet', '--bare', '-b', 'main', origin])
  await run('git', ['clone', '--quiet', origin, work], { env: gitEnv })
  await writeFile(
    path.join(work, 'package.json'),
    JSON.stringify({ name: 'fixture', packageManager: 'pnpm@10.34.5' }),
  )
  await git(work, 'add', '-A')
  await git(work, 'commit', '--quiet', '-m', 'base')
  await git(work, 'push', '--quiet', 'origin', 'main')
  const mainSha = await git(work, 'rev-parse', 'HEAD')
  await writeFile(path.join(work, 'feature.txt'), 'pull request\n')
  await git(work, 'add', '-A')
  await git(work, 'commit', '--quiet', '-m', 'pull request')
  await git(work, 'push', '--quiet', 'origin', 'HEAD:refs/pull/7/head')
  const prSha = await git(work, 'rev-parse', 'HEAD')

  const realGit = (await run('sh', ['-c', 'command -v git'])).stdout.trim()
  await stub(
    bin,
    'git',
    [
      'if [[ -n "${FAKE_HEAD:-}" && "$*" == *"rev-parse HEAD" ]]; then',
      '  printf "%s\\n" "$FAKE_HEAD"',
      '  exit 0',
      'fi',
      `exec ${JSON.stringify(realGit)} "$@"`,
    ].join('\n'),
  )
  await stub(
    bin,
    'gh',
    [
      'printf "gh %s\\n" "$*" >>"$CALL_LOG"',
      'endpoint="" state="" context="" description=""',
      'while (($#)); do',
      '  case "$1" in',
      '    repos/*) endpoint="$1" ;;',
      '    -f) case "$2" in',
      '          state=*) state="${2#state=}" ;;',
      '          context=*) context="${2#context=}" ;;',
      '          description=*) description="${2#description=}" ;;',
      '        esac',
      '        shift ;;',
      '  esac',
      '  shift',
      'done',
      'case "$endpoint" in',
      '  */statuses/*)',
      '    printf "%s\\t%s\\t%s\\t%s\\n" "$endpoint" "$state" "$context" "$description" >>"$STATUS_LOG"',
      '    exit "${GH_STATUS_EXIT:-0}" ;;',
      '  */pulls/7) printf "%s\\n" "$PR_SHA" ;;',
      '  *) exit 1 ;;',
      'esac',
    ].join('\n'),
  )
  await stub(
    bin,
    'corepack',
    [
      'printf "corepack NODE_ENV=%s %s\\n" "${NODE_ENV-unset}" "$*" >>"$CALL_LOG"',
      'dir=""',
      'for ((i = 1; i <= $#; i++)); do',
      '  if [[ "${!i}" == "--dir" ]]; then next=$((i + 1)); dir="${!next}"; fi',
      'done',
      'phase=normal',
      '[[ "${NODE_ENV:-}" != production ]] || phase=production',
      `printf "checkout %s %s %s\\n" "$phase" "$(${JSON.stringify(realGit)} -C "$dir" rev-parse HEAD)" "$(stat -c %a "$(dirname "$dir")")" >>"$CALL_LOG"`,
      'if [[ " $* " == *" install "* ]]; then',
      '  echo "installing dependencies"',
      '  exit "${INSTALL_EXIT:-0}"',
      'fi',
      'printf "check-begin %s\\n" "${GATE_ID:-}" >>"$CALL_LOG"',
      'if [[ "$phase" == "${SLEEP_PHASE:-}" ]]; then',
      '  printf "%s\\n%s\\n" "$dir" "$$" >"$SLEEP_MARK"',
      '  sleep "${SLEEP_SECONDS:-30}"',
      '  printf "woke %s\\n" "$phase" >>"$CALL_LOG"',
      'fi',
      '[[ "$phase" != "${DIRTY_PHASE:-}" ]] || touch "$dir/stray-output"',
      'summary_var="${phase^^}_SUMMARY"',
      'echo " RUN  v4.0.0 $dir"',
      'printf "      Tests  %s\\n" "${!summary_var:-5099 passed | 1 skipped (5100)}"',
      'echo "   Duration  1763.64s"',
      'printf "check-end %s\\n" "${GATE_ID:-}" >>"$CALL_LOG"',
      'exit_var="${phase^^}_EXIT"',
      'exit "${!exit_var:-0}"',
    ].join('\n'),
  )

  return {
    root,
    mainSha,
    prSha,
    temp,
    gates: path.join(state, 'agentic-remote', 'gates'),
    callLog,
    statusLog,
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH ?? ''}`,
      HOME: root,
      TMPDIR: temp,
      XDG_STATE_HOME: state,
      NODE_ENV: 'production',
      CALL_LOG: callLog,
      STATUS_LOG: statusLog,
      PR_SHA: prSha,
      SLEEP_MARK: path.join(root, 'sleeping'),
      // file:// forces a real transfer, so objects only refs/pull reaches are
      // absent until the gate fetches the SHA itself.
      AGENTIC_REMOTE_GATE_CLONE_BASE: `file://${remotes}`,
    },
  }
}

function start(
  f: Fixture,
  args: string[],
  env: Record<string, string> = {},
  script = GATE,
): { pid: number; done: Promise<Result> } {
  const child = spawn(script, args, {
    env: { ...f.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let output = ''
  child.stdout.on('data', (chunk) => (output += chunk))
  child.stderr.on('data', (chunk) => (output += chunk))
  const done = new Promise<Result>((resolve) => {
    child.on('error', (error) => resolve({ code: -1, signal: null, output: String(error) }))
    child.on('close', (code, signal) => resolve({ code, signal, output }))
  })
  return { pid: child.pid ?? 0, done }
}

function gate(f: Fixture, args: string[], env: Record<string, string> = {}): Promise<Result> {
  return start(f, args, env).done
}

async function statuses(f: Fixture): Promise<Status[]> {
  return (await readFile(f.statusLog, 'utf8'))
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [endpoint, state, context, description] = line.split('\t')
      return { endpoint, state, context, description }
    })
}

async function calls(f: Fixture): Promise<string[]> {
  return (await readFile(f.callLog, 'utf8')).split('\n').filter(Boolean)
}

async function waitFor(file: string): Promise<string> {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (existsSync(file)) {
      const text = await readFile(file, 'utf8')
      if (text.endsWith('\n')) return text
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  throw new Error(`timed out waiting for ${file}`)
}

function expectSafe(f: Fixture, list: Status[]): void {
  expect(list.length).toBeGreaterThan(0)
  for (const status of list) {
    expect(status.context).toBe(CONTEXT)
    expect(status.description.length).toBeGreaterThan(0)
    expect(status.description.length).toBeLessThan(140)
    expect(status.description).not.toContain('/')
    expect(status.description).not.toContain(f.root)
  }
}

async function expectNoClone(f: Fixture): Promise<void> {
  expect(await readdir(f.temp)).toEqual([])
}

describe('agentic-remote-gate', () => {
  it('passes both checks on the exact SHA and records success with counts', async () => {
    const f = await fixture()
    const result = await gate(f, [f.mainSha, '--repo', REPO])
    expect(result.code, result.output).toBe(0)

    const list = await statuses(f)
    expectSafe(f, list)
    expect(list.map((s) => s.state)).toEqual(['pending', 'success'])
    for (const status of list) {
      expect(status.endpoint).toBe(`repos/${REPO}/statuses/${f.mainSha}`)
    }
    expect(list[1].description).toMatch(
      /^normal\+production: 5099 passed, 1 skipped \(\d+[sm]\)$/,
    )

    const log = await calls(f)
    const corepack = log.filter((line) => line.startsWith('corepack '))
    expect(corepack).toEqual([
      expect.stringMatching(
        /^corepack NODE_ENV=unset pnpm@10\.34\.5 --dir \S+ install --frozen-lockfile$/,
      ),
      expect.stringMatching(/^corepack NODE_ENV=unset pnpm@10\.34\.5 --dir \S+ check$/),
      expect.stringMatching(/^corepack NODE_ENV=production pnpm@10\.34\.5 --dir \S+ check$/),
    ])
    for (const line of log.filter((entry) => entry.startsWith('checkout '))) {
      expect(line).toMatch(new RegExp(` ${f.mainSha} 700$`))
    }

    const dir = path.join(f.gates, f.mainSha)
    expect((await readdir(dir)).sort()).toEqual(
      expect.arrayContaining(['check.log', 'install.log', 'production-check.log', 'summary']),
    )
    const summary = await readFile(path.join(dir, 'summary'), 'utf8')
    expect(summary).toContain('result=success')
    expect(summary).toContain('normal_tests=5099 passed, 1 skipped')
    expect(summary).toContain('production_tests=5099 passed, 1 skipped')
    expect(summary).toMatch(/install_seconds=\d+/)
    expect(summary).toMatch(/normal_check_seconds=\d+/)
    expect(summary).toMatch(/production_check_seconds=\d+/)
    expect(await readFile(path.join(dir, 'check.log'), 'utf8')).toContain('Tests  5099 passed')
    await expectNoClone(f)
  })

  it('resolves a pull request number to its head SHA and tests that commit', async () => {
    const f = await fixture()
    const result = await gate(f, ['7', '--repo', REPO])
    expect(result.code, result.output).toBe(0)

    expect(await calls(f)).toContain(`gh api repos/${REPO}/pulls/7 --jq .head.sha`)
    const list = await statuses(f)
    expect(list.map((s) => s.endpoint)).toEqual([
      `repos/${REPO}/statuses/${f.prSha}`,
      `repos/${REPO}/statuses/${f.prSha}`,
    ])
    expect(list.at(-1)?.state).toBe('success')
    const checkouts = (await calls(f)).filter((line) => line.startsWith('checkout '))
    expect(checkouts).toHaveLength(3)
    for (const line of checkouts) expect(line).toContain(` ${f.prSha} `)
    await expectNoClone(f)
  })

  it('derives the repository from its own checkout when --repo is omitted', async () => {
    const f = await fixture()
    const checkout = path.join(f.root, 'checkout')
    await mkdir(path.join(checkout, 'bin'), { recursive: true })
    await run('git', ['init', '--quiet', checkout])
    await git(checkout, 'remote', 'add', 'origin', `https://github.com/${REPO}.git`)
    const script = path.join(checkout, 'bin', 'agentic-remote-gate')
    await copyFile(GATE, script)
    await chmod(script, 0o755)

    const result = await start(f, [f.mainSha], {}, script).done
    expect(result.code, result.output).toBe(0)
    expect((await statuses(f)).at(-1)?.endpoint).toBe(`repos/${REPO}/statuses/${f.mainSha}`)
  })

  it.each([
    ['abc123'],
    ['0123456789abcdef0123456789abcdef0123456'],
    ['0123456789abcdef0123456789abcdef0123456g'],
    ['--repo'],
  ])('rejects %s before contacting GitHub', async (target) => {
    const f = await fixture()
    const result = await gate(f, [target, '--repo', REPO])
    expect(result.code).not.toBe(0)
    expect(result.output).toMatch(/full 40-character SHA or a pull request number|usage/i)
    expect(await calls(f)).toEqual([])
    expect(await statuses(f)).toEqual([])
  })

  it('rejects a malformed --repo', async () => {
    const f = await fixture()
    const result = await gate(f, [f.mainSha, '--repo', '../escape'])
    expect(result.code).not.toBe(0)
    expect(await calls(f)).toEqual([])
  })

  it('fails without running checks when the checkout is not the requested SHA', async () => {
    const f = await fixture()
    const result = await gate(f, [f.mainSha, '--repo', REPO], { FAKE_HEAD: f.prSha })
    expect(result.code).not.toBe(0)
    expect(result.output).toContain('HEAD')

    const list = await statuses(f)
    expectSafe(f, list)
    expect(list.map((s) => s.state)).toEqual(['pending', 'failure'])
    expect(list[1].description).toMatch(/checkout did not match/)
    expect((await calls(f)).filter((line) => line.startsWith('corepack '))).toEqual([])
    await expectNoClone(f)
  })

  it('fails when the SHA cannot be fetched', async () => {
    const f = await fixture()
    const missing = 'f'.repeat(40)
    const result = await gate(f, [missing, '--repo', REPO])
    expect(result.code).not.toBe(0)
    const list = await statuses(f)
    expectSafe(f, list)
    expect(list.map((s) => s.state)).toEqual(['pending', 'failure'])
    expect((await calls(f)).filter((line) => line.startsWith('corepack '))).toEqual([])
    await expectNoClone(f)
  })

  it('records failure when dependency installation fails', async () => {
    const f = await fixture()
    const result = await gate(f, [f.mainSha, '--repo', REPO], { INSTALL_EXIT: '1' })
    expect(result.code).not.toBe(0)

    const list = await statuses(f)
    expectSafe(f, list)
    expect(list.map((s) => s.state)).toEqual(['pending', 'failure'])
    expect(list[1].description).toMatch(/install failed/)
    expect((await calls(f)).some((line) => line.startsWith('check-begin'))).toBe(false)
    expect(await readFile(path.join(f.gates, f.mainSha, 'summary'), 'utf8')).toContain(
      'result=failure',
    )
    await expectNoClone(f)
  })

  it('records failure when the production check fails after a normal pass', async () => {
    const f = await fixture()
    const result = await gate(f, [f.mainSha, '--repo', REPO], {
      PRODUCTION_EXIT: '1',
      PRODUCTION_SUMMARY: '2 failed | 5097 passed | 1 skipped (5100)',
    })
    expect(result.code).not.toBe(0)

    const list = await statuses(f)
    expectSafe(f, list)
    expect(list.map((s) => s.state)).toEqual(['pending', 'failure'])
    expect(list[1].description).toMatch(
      /^production check failed: 2 failed, 5097 passed, 1 skipped \(\d+[sm]\)$/,
    )
    await expectNoClone(f)
  })

  it('records failure without the production check when the normal check fails', async () => {
    const f = await fixture()
    const result = await gate(f, [f.mainSha, '--repo', REPO], { NORMAL_EXIT: '1' })
    expect(result.code).not.toBe(0)
    expect((await statuses(f)).at(-1)?.description).toMatch(/^normal check failed/)
    expect(
      (await calls(f)).filter((line) => line.startsWith('corepack NODE_ENV=production')),
    ).toEqual([])
  })

  it('records failure when a check leaves the tree dirty', async () => {
    const f = await fixture()
    const result = await gate(f, [f.mainSha, '--repo', REPO], { DIRTY_PHASE: 'normal' })
    expect(result.code).not.toBe(0)

    const list = await statuses(f)
    expectSafe(f, list)
    expect(list.map((s) => s.state)).toEqual(['pending', 'failure'])
    expect(list[1].description).toMatch(/tree changed during normal check/)
    expect(
      (await calls(f)).filter((line) => line.startsWith('corepack NODE_ENV=production')),
    ).toEqual([])
    await expectNoClone(f)
  })

  it.each(['SIGINT', 'SIGTERM'] as const)(
    'records failure, stops the check, and removes the clone on %s',
    async (signal) => {
      const f = await fixture()
      const running = start(f, [f.mainSha, '--repo', REPO], {
        SLEEP_PHASE: 'production',
        SLEEP_SECONDS: '30',
      })
      const [clone, childPid] = (await waitFor(f.env.SLEEP_MARK as string)).trim().split('\n')
      expect(existsSync(clone)).toBe(true)
      process.kill(running.pid, signal)
      const result = await running.done
      expect(result.code).not.toBe(0)

      const list = await statuses(f)
      expectSafe(f, list)
      expect(list.map((s) => s.state)).toEqual(['pending', 'failure'])
      expect(list[1].description).toMatch(/^interrupted during production check/)
      expect(existsSync(clone)).toBe(false)
      await expectNoClone(f)
      expect(() => process.kill(Number(childPid), 0)).toThrow()
      expect(await calls(f)).not.toContain('woke production')
    },
  )

  it('posts no status with --no-status', async () => {
    const f = await fixture()
    const result = await gate(f, [f.mainSha, '--repo', REPO, '--no-status'])
    expect(result.code, result.output).toBe(0)
    expect(await statuses(f)).toEqual([])
    expect((await calls(f)).filter((line) => line.startsWith('gh '))).toEqual([])
    expect(await readFile(path.join(f.gates, f.mainSha, 'summary'), 'utf8')).toContain(
      'result=success',
    )
  })

  it('serializes concurrent gates on one host', async () => {
    const f = await fixture()
    const first = start(f, [f.mainSha, '--repo', REPO], {
      GATE_ID: 'first',
      SLEEP_PHASE: 'normal',
      SLEEP_SECONDS: '2',
    })
    await waitFor(f.env.SLEEP_MARK as string)
    const second = start(f, [f.prSha, '--repo', REPO], { GATE_ID: 'second' })
    const [a, b] = await Promise.all([first.done, second.done])
    expect(a.code, a.output).toBe(0)
    expect(b.code, b.output).toBe(0)
    expect(b.output).toMatch(/waiting/i)

    const order = (await calls(f))
      .filter((line) => line.startsWith('check-'))
      .map((line) => line.split(' ')[1])
    expect(order).toEqual(['first', 'first', 'first', 'first', 'second', 'second', 'second', 'second'])
    const finals = (await statuses(f)).filter((s) => s.state !== 'pending')
    expect(finals.map((s) => s.state)).toEqual(['success', 'success'])
  })

  it('fails fast under --no-wait while another gate holds the lock', async () => {
    const f = await fixture()
    const first = start(f, [f.mainSha, '--repo', REPO], {
      SLEEP_PHASE: 'normal',
      SLEEP_SECONDS: '2',
    })
    await waitFor(f.env.SLEEP_MARK as string)
    const second = await gate(f, [f.prSha, '--repo', REPO, '--no-wait'])
    expect(second.code).not.toBe(0)
    expect(second.output).toMatch(/another gate is already running/i)
    expect((await first.done).code).toBe(0)
    const list = await statuses(f)
    expect(list.some((s) => s.endpoint.endsWith(f.prSha))).toBe(false)
  })
})
