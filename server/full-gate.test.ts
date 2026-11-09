import { execFile, spawn, spawnSync } from 'node:child_process'
import { existsSync, realpathSync, writeFileSync } from 'node:fs'
import {
  chmod,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises'
import { networkInterfaces, tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { createServer } from 'node:net'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it } from 'vitest'

const run = promisify(execFile)
const GATE = new URL('../bin/agentic-remote-gate', import.meta.url).pathname
const REPO = 'owner/name'
const CONTEXT = 'agentic-remote/full-gate'

const fixtures: string[] = []

// Whether this host can run a real bubblewrap sandbox (unprivileged user
// namespaces can be disabled, for example by AppArmor).
const realSandbox =
  spawnSync('bwrap', ['--ro-bind', '/', '/', '--unshare-all', '--', 'true']).status === 0

afterEach(async () => {
  await Promise.all(
    fixtures.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  )
})

// The operator's shell, minus any git configuration the test runner itself
// injects through the environment (some agents disable core.fsmonitor that
// way), so the gate is tested without hardening it did not provide.
const operatorEnv = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !/^GIT_CONFIG_(COUNT|KEY_|VALUE_|PARAMETERS)/.test(name)),
)

const gitEnv = {
  ...operatorEnv,
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
  home: string
  bin: string
  mainSha: string
  prSha: string
  temp: string
  gates: string
  callLog: string
  statusLog: string
  knobs: string
  sandboxCalls: string
  pwned: string
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
  const home = path.join(root, 'home')
  const sandboxBin = path.join(root, 'sandbox-bin')
  const sandboxCalls = path.join(root, 'sandbox-calls')
  const callLog = path.join(root, 'calls.log')
  const statusLog = path.join(root, 'statuses.log')
  const knobs = path.join(root, 'knobs')
  const sleepMark = path.join(root, 'sleeping')
  const pwned = path.join(root, 'pwned')
  await mkdir(path.dirname(origin), { recursive: true })
  await Promise.all(
    [bin, temp, state, home, sandboxBin, sandboxCalls].map((dir) =>
      mkdir(dir, { recursive: true }),
    ),
  )
  await writeFile(callLog, '')
  await writeFile(statusLog, '')
  await writeFile(knobs, '')

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
      '    [[ "$state" != "${GH_FAIL_STATE:-}" ]] || exit 1',
      '    exit "${GH_STATUS_EXIT:-0}" ;;',
      '  */pulls/7) printf "%s\\n" "$PR_SHA" ;;',
      '  *) exit 1 ;;',
      'esac',
    ].join('\n'),
  )
  // Runs inside the sandbox, where the environment is cleared, so it takes
  // its paths literally and its test knobs from a file.
  await stub(
    bin,
    'corepack',
    [
      `CALL_LOG=${JSON.stringify(callLog)}`,
      `SLEEP_MARK=${JSON.stringify(sleepMark)}`,
      `source ${JSON.stringify(knobs)}`,
      'if [[ "$1" == enable ]]; then',
      '  printf "corepack-enable PATH=%s HOME=%s %s\\n" "$PATH" "$HOME" "$*" >>"$CALL_LOG"',
      '  exit "${ENABLE_EXIT:-0}"',
      'fi',
      'printf "corepack NODE_ENV=%s %s\\n" "${NODE_ENV-unset}" "$*" >>"$CALL_LOG"',
      'echo "ENVIRONMENT BEGIN"',
      'env | sort',
      'echo "ENVIRONMENT END"',
      'dir=""',
      'for ((i = 1; i <= $#; i++)); do',
      '  if [[ "${!i}" == "--dir" ]]; then next=$((i + 1)); dir="${!next}"; fi',
      'done',
      'phase=normal',
      '[[ "${NODE_ENV:-}" != production ]] || phase=production',
      `head="$(${JSON.stringify(realGit)} -C "$dir" rev-parse HEAD)"`,
      'printf "checkout %s %s %s\\n" "$phase" "$head" "$(stat -c %a "$(dirname "$dir")")" >>"$CALL_LOG"',
      // Asks the egress proxy, when there is one, to reach places it must not.
      'if [[ -n "${PROXY_PROBE:-}" && -n "${HTTPS_PROXY:-}" ]]; then',
      '  proxy="${HTTPS_PROXY#http://}"; proxy="${proxy%/}"',
      '  for target in $PROXY_PROBE; do',
      '    reply="$( { exec 3<>"/dev/tcp/${proxy%:*}/${proxy##*:}" &&',
      '      printf "CONNECT %s HTTP/1.1\\r\\nHost: %s\\r\\n\\r\\n" "$target" "$target" >&3 &&',
      '      head -n 1 <&3 | tr -d "\\r"; } 2>&1)"',
      '    printf "proxy %s %s\\n" "$target" "$reply" >>"$CALL_LOG"',
      '  done',
      'fi',
      'if [[ " $* " == *" install "* ]]; then',
      '  echo "installing dependencies"',
      '  exit "${INSTALL_EXIT:-0}"',
      'fi',
      'if [[ " $* " == *" rebuild "* ]]; then',
      '  echo "building dependencies"',
      '  exit "${REBUILD_EXIT:-0}"',
      'fi',
      'printf "check-begin %s\\n" "$head" >>"$CALL_LOG"',
      'if [[ "$phase" == "${SLEEP_PHASE:-}" ]]; then',
      '  printf "%s\\n%s\\n" "$dir" "$$" >"$SLEEP_MARK"',
      '  sleep "${SLEEP_SECONDS:-30}"',
      '  printf "woke %s\\n" "$phase" >>"$CALL_LOG"',
      'fi',
      '[[ "$phase" != "${DIRTY_PHASE:-}" ]] || touch "$dir/stray-output"',
      // Plants git configuration that would run a command for whichever git
      // next looks at the clone: a replacement repository, a redirected .git
      // file, or a symlink to the clone moved elsewhere.
      `pwn="touch ${pwned}"`,
      `realgit=${JSON.stringify(realGit)}`,
      'if [[ "$phase" == "${SWAP_PHASE:-}" ]]; then',
      '  case "$SWAP_MODE" in',
      '    rename)',
      '      mv "$dir" "$dir.moved" && mkdir "$dir" && cp -a "$dir.moved/." "$dir/" && rm -rf "$dir/.git"',
      '      "$realgit" init -q "$dir" && "$realgit" -C "$dir" add -A ;;',
      '    gitfile)',
      '      "$realgit" init -q "$dir.evil" && rm -rf "$dir/.git"',
      '      printf "gitdir: %s/.git\\n" "$dir.evil" >"$dir/.git"',
      '      dir="$dir.evil" ;;',
      '    symlink)',
      '      mv "$dir" "$dir.moved" && ln -s "$dir.moved" "$dir"',
      '      dir="$dir.moved" ;;',
      // Populates a submodule the commit records with a repository whose own
      // configuration names a clean filter, which git status would run for a
      // file whose contents it has to compare.
      '    submodule)',
      '      "$realgit" init -q "$dir/sub" && dir="$dir/sub"',
      '      echo "f filter=pwn" >"$dir/.gitattributes" && echo x >"$dir/f"',
      '      "$realgit" -C "$dir" add . && "$realgit" -C "$dir" -c user.name=x -c user.email=x@x commit -qm x',
      '      "$realgit" -C "$dir" config filter.pwn.clean "$pwn; cat"',
      '      echo y >"$dir/f" && touch -d @1 "$dir/f" ;;',
      '  esac',
      '  "$realgit" -C "$dir" config core.fsmonitor "$pwn"',
      '  printf "#!/bin/sh\\n%s\\n" "$pwn" >"$("$realgit" -C "$dir" rev-parse --git-dir)/hooks/post-index-change"',
      '  chmod +x "$("$realgit" -C "$dir" rev-parse --git-dir)/hooks/post-index-change"',
      'fi',
      'summary_var="${phase^^}_SUMMARY"',
      'summary="${!summary_var:-5099 passed | 1 skipped (5100)}"',
      'echo " RUN  v4.0.0 $dir"',
      '[[ "$summary" == none ]] || printf "      Tests  %s\\n" "$summary"',
      'echo "   Duration  1763.64s"',
      'printf "check-end %s\\n" "$head" >>"$CALL_LOG"',
      'exit_var="${phase^^}_EXIT"',
      'exit "${!exit_var:-0}"',
    ].join('\n'),
  )
  // Stands in for bubblewrap: records each sandbox command line and its own
  // environment, then runs the sandboxed command exactly as given, cleared
  // environment included.
  await stub(
    sandboxBin,
    'bwrap',
    [
      `calls=${JSON.stringify(sandboxCalls)}`,
      `source ${JSON.stringify(knobs)}`,
      'n="$(ls "$calls" | wc -l)"',
      'printf "%s\\0" "$@" >"$calls/$(printf %03d "$n")"',
      'mkdir -p "$calls-env" && env -0 >"$calls-env/$(printf %03d "$n")"',
      '[[ -z "${BWRAP_EXIT:-}" ]] || exit "$BWRAP_EXIT"',
      'while (($#)) && [[ "$1" != -- ]]; do',
      '  if [[ "$1" == --chdir ]]; then cd "$2" || exit 1; fi',
      '  shift',
      'done',
      'shift',
      'exec "$@"',
    ].join('\n'),
  )

  return {
    root,
    home,
    bin,
    mainSha,
    prSha,
    temp,
    gates: path.join(state, 'agentic-remote', 'gates'),
    callLog,
    statusLog,
    knobs,
    sandboxCalls,
    pwned,
    env: {
      ...operatorEnv,
      PATH: `${bin}:${sandboxBin}:${process.env.PATH ?? ''}`,
      HOME: home,
      TMPDIR: temp,
      XDG_STATE_HOME: state,
      NODE_ENV: 'production',
      CALL_LOG: callLog,
      STATUS_LOG: statusLog,
      PR_SHA: prSha,
      SLEEP_MARK: sleepMark,
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
  writeFileSync(
    f.knobs,
    Object.entries(env)
      .map(([key, value]) => `${key}='${value.replaceAll("'", "'\\''")}'\n`)
      .join(''),
  )
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

async function sandboxCommands(f: Fixture): Promise<{ options: string[]; command: string[] }[]> {
  const names = (await readdir(f.sandboxCalls)).sort()
  const lines = await Promise.all(
    names.map(async (name) => (await readFile(path.join(f.sandboxCalls, name), 'utf8')).split('\0').slice(0, -1)),
  )
  return lines.map((args) => {
    const end = args.indexOf('--')
    expect(end, args.join(' ')).toBeGreaterThan(0)
    return { options: args.slice(0, end), command: args.slice(end + 1) }
  })
}

// The `env -i NAME=value ...` assignments that start a sandboxed command.
function clearedEnvironment(command: string[]): Record<string, string> {
  expect(command.slice(0, 2)).toEqual(['env', '-i'])
  const environment: Record<string, string> = {}
  for (const arg of command.slice(2)) {
    const split = arg.indexOf('=')
    if (split <= 0) break
    environment[arg.slice(0, split)] = arg.slice(split + 1)
  }
  return environment
}

function hasSequence(options: string[], ...sequence: string[]): boolean {
  return options.some((_, index) => sequence.every((value, offset) => options[index + offset] === value))
}

function indexOfSequence(options: string[], ...sequence: string[]): number {
  return options.findIndex((_, index) =>
    sequence.every((value, offset) => options[index + offset] === value),
  )
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
        /^corepack NODE_ENV=unset pnpm@10\.34\.5 --dir \S+ install --frozen-lockfile --ignore-scripts --ignore-pnpmfile$/,
      ),
      expect.stringMatching(/^corepack NODE_ENV=unset pnpm@10\.34\.5 --dir \S+ rebuild$/),
      expect.stringMatching(/^corepack NODE_ENV=unset pnpm@10\.34\.5 --dir \S+ check$/),
      expect.stringMatching(/^corepack NODE_ENV=production pnpm@10\.34\.5 --dir \S+ check$/),
    ])
    for (const line of log.filter((entry) => entry.startsWith('checkout '))) {
      expect(line).toMatch(new RegExp(` ${f.mainSha} 700$`))
    }

    const dir = path.join(f.gates, f.mainSha)
    expect((await readdir(dir)).sort()).toEqual(
      expect.arrayContaining([
        'check.log',
        'install.log',
        'production-check.log',
        'rebuild.log',
        'summary',
      ]),
    )
    const summary = await readFile(path.join(dir, 'summary'), 'utf8')
    expect(summary).toContain('result=success')
    expect(summary).toContain('normal_tests=5099 passed, 1 skipped')
    expect(summary).toContain('production_tests=5099 passed, 1 skipped')
    expect(summary).toMatch(/install_seconds=\d+/)
    expect(summary).toMatch(/rebuild_seconds=\d+/)
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
    expect(checkouts).toHaveLength(4)
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
      SLEEP_PHASE: 'normal',
      SLEEP_SECONDS: '2',
    })
    await waitFor(f.env.SLEEP_MARK as string)
    const second = start(f, [f.prSha, '--repo', REPO])
    const [a, b] = await Promise.all([first.done, second.done])
    expect(a.code, a.output).toBe(0)
    expect(b.code, b.output).toBe(0)
    expect(b.output).toMatch(/waiting/i)

    const order = (await calls(f))
      .filter((line) => line.startsWith('check-'))
      .map((line) => line.split(' ')[1])
    expect(order).toEqual([
      ...Array<string>(4).fill(f.mainSha),
      ...Array<string>(4).fill(f.prSha),
    ])
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
    expect(second.output).toMatch(/another gate or a promotion validation is already running/i)
    expect((await first.done).code).toBe(0)
    const list = await statuses(f)
    expect(list.some((s) => s.endpoint.endsWith(f.prSha))).toBe(false)
  })

  it('runs every pull-request command in a credentialless sandbox', async () => {
    const f = await fixture()
    const credentials = {
      GH_TOKEN: 'gh-secret-token',
      GITHUB_TOKEN: 'github-secret-token',
      NPM_TOKEN: 'npm-secret-token',
      SSH_AUTH_SOCK: path.join(f.home, 'agent.sock'),
      GH_CONFIG_DIR: path.join(f.home, '.config', 'gh'),
      XDG_CONFIG_HOME: path.join(f.home, '.config'),
      XDG_RUNTIME_DIR: path.join(f.root, 'runtime'),
      TMUX: '/tmp/tmux-1000/default,1,0',
    }
    const result = await gate(f, [f.mainSha, '--repo', REPO], credentials)
    expect(result.code, result.output).toBe(0)

    const commands = await sandboxCommands(f)
    const corepack = commands.filter(({ command }) => command.includes('--dir'))
    expect(corepack.map(({ command }) => command.slice(command.indexOf('corepack') + 4))).toEqual([
      ['install', '--frozen-lockfile', '--ignore-scripts', '--ignore-pnpmfile'],
      ['rebuild'],
      ['check'],
      ['check'],
    ])
    const allowed = ['CI', 'COREPACK_ENABLE_DOWNLOAD_PROMPT', 'HOME', 'LANG', 'NODE_ENV', 'PATH', 'TERM', 'TMPDIR']
    for (const { options, command } of commands) {
      for (const flag of ['--unshare-all', '--die-with-parent', '--new-session']) {
        expect(options).toContain(flag)
      }
      // No phase shares the host network, which holds the operator's hub.
      expect(options).not.toContain('--share-net')
      expect(hasSequence(options, '--tmpfs', f.home)).toBe(true)
      expect(hasSequence(options, '--tmpfs', '/run')).toBe(true)
      for (let index = 0; index < options.length; index += 1) {
        if (!['--bind', '--ro-bind', '--bind-try', '--ro-bind-try'].includes(options[index])) continue
        const source = options[index + 1]
        expect(source).not.toBe('/')
        expect(source).not.toBe('/home')
        expect(`${source}/`.startsWith(`${f.home}/`)).toBe(false)
        if (options[index].startsWith('--bind')) expect(source.startsWith(`${f.temp}/`)).toBe(true)
      }
      // /tmp is mounted before the work directory, which may live under it.
      const privateTmp = indexOfSequence(options, '--tmpfs', '/tmp')
      expect(privateTmp).toBeGreaterThan(-1)
      expect(privateTmp).toBeLessThan(options.lastIndexOf('--bind'))

      const environment = clearedEnvironment(command)
      expect(Object.keys(environment).every((name) => allowed.includes(name))).toBe(true)
      expect(environment.CI).toBe('1')
      expect(environment.HOME.startsWith(`${f.temp}/`)).toBe(true)
      for (const value of Object.values(environment)) {
        expect(value).not.toContain('secret')
        expect(value).not.toContain(f.home)
      }
    }
    // bwrap itself runs as PID 1 inside the sandbox, where the pull request
    // can read its environment, so it starts from the same scrubbed set.
    const launches = (await readdir(`${f.sandboxCalls}-env`)).sort()
    expect(launches).toHaveLength(commands.length)
    for (const name of launches) {
      const launch = await readFile(path.join(`${f.sandboxCalls}-env`, name), 'utf8')
      // Bash adds PWD, SHLVL, and _ to the stub's own environment.
      const names = launch.split('\0').slice(0, -1).map((entry) => entry.slice(0, entry.indexOf('=')))
      expect(names.filter((name) => !['PWD', 'SHLVL', '_'].includes(name)).sort()).toEqual(
        allowed.filter((name) => name !== 'NODE_ENV'),
      )
      expect(launch).not.toContain('secret')
      expect(launch).not.toContain(`=${f.home}\0`)
    }
    for (const { options, command } of corepack) {
      const clone = command[command.indexOf('--dir') + 1]
      const work = path.dirname(clone)
      const writable = indexOfSequence(options, '--bind', work, work)
      expect(clearedEnvironment(command).HOME.startsWith(`${work}/`)).toBe(true)
      expect(writable).toBeGreaterThan(-1)
      // The repository's git directory lives beside, not inside, the only
      // writable mount, so nothing in the sandbox can replace or edit it.
      const gitDir = path.join(path.dirname(work), 'git')
      expect(hasSequence(options, '--ro-bind', gitDir, gitDir)).toBe(true)
      for (let index = 0; index < options.length; index += 1) {
        if (!['--bind', '--bind-try'].includes(options[index])) continue
        expect(`${gitDir}/`.startsWith(`${options[index + 1]}/`)).toBe(false)
      }
      // Nothing the sandbox can write is ever a mount source again: a
      // replaced directory there could point the next phase's mount anywhere.
      for (let index = 0; index < options.length; index += 1) {
        if (!/^--(ro-)?bind(-try)?$/.test(options[index])) continue
        const source = options[index + 1]
        if (source !== work) expect(source.startsWith(`${work}/`), source).toBe(false)
      }
      expect(hasSequence(options, '--tmpfs', '/tmp')).toBe(true)
    }
    // Only installing and building dependencies get network, and only
    // through the egress proxy, whose socket directory is read-only.
    const [install, rebuild, normal, production] = corepack
    const egressDir = path.join(path.dirname(path.dirname(install.command[install.command.indexOf('--dir') + 1])), 'egress')
    for (const { options, command } of [install, rebuild]) {
      expect(hasSequence(options, '--ro-bind', egressDir, egressDir)).toBe(true)
      expect(command.indexOf('egress')).toBeGreaterThan(-1)
      expect(command.indexOf('egress')).toBeLessThan(command.indexOf('corepack'))
    }
    for (const { options, command } of [normal, production]) {
      expect(options).not.toContain(egressDir)
      expect(command).not.toContain('egress')
    }
    // `pnpm check` runs `pnpm lint` and so on, so Corepack's pnpm shim goes
    // first on the sandbox PATH, installed into the private HOME.
    const sandboxHome = clearedEnvironment(corepack[0].command).HOME
    const enables = (await calls(f)).filter((line) => line.startsWith('corepack-enable '))
    expect(enables).toHaveLength(1)
    expect(enables[0].startsWith(`corepack-enable PATH=${sandboxHome}/bin:`)).toBe(true)
    expect(
      enables[0].endsWith(` HOME=${sandboxHome} enable --install-directory ${sandboxHome}/bin pnpm`),
    ).toBe(true)
    for (const { command } of corepack) {
      expect(clearedEnvironment(command).PATH.startsWith(`${sandboxHome}/bin:`)).toBe(true)
    }
    expect(clearedEnvironment(corepack[0].command).NODE_ENV).toBeUndefined()
    expect(clearedEnvironment(corepack[1].command).NODE_ENV).toBeUndefined()
    expect(clearedEnvironment(corepack[2].command).NODE_ENV).toBeUndefined()
    expect(clearedEnvironment(corepack[3].command).NODE_ENV).toBe('production')

    const proxied = ['install.log', 'rebuild.log']
    for (const name of [...proxied, 'check.log', 'production-check.log']) {
      const log = await readFile(path.join(f.gates, f.mainSha, name), 'utf8')
      expect(/^HTTPS_PROXY=http:\/\/127\.0\.0\.1:\d+$/m.test(log)).toBe(proxied.includes(name))
      const seen = log.slice(log.indexOf('ENVIRONMENT BEGIN'), log.indexOf('ENVIRONMENT END'))
      expect(seen).toMatch(/^HOME=/m)
      expect(seen).not.toMatch(/secret|SSH_AUTH_SOCK|GH_CONFIG_DIR|XDG_|TMUX|CALL_LOG/)
      expect(seen).not.toContain(f.home)
    }
  })

  it('fails closed without running checks when bubblewrap is missing', async () => {
    const f = await fixture()
    const system = path.join(f.root, 'system-bin')
    await mkdir(system)
    await Promise.all(
      (await readdir('/usr/bin'))
        .filter((name) => name !== 'bwrap')
        .map((name) => symlink(path.join('/usr/bin', name), path.join(system, name))),
    )
    const result = await gate(f, [f.mainSha, '--repo', REPO], {
      PATH: `${f.bin}:${path.dirname(process.execPath)}:${system}`,
    })
    expect(result.code).not.toBe(0)

    const list = await statuses(f)
    expectSafe(f, list)
    expect(list.map((s) => s.state)).toEqual(['pending', 'failure'])
    expect(list[1].description).toMatch(/^sandbox unavailable/)
    expect((await calls(f)).filter((line) => line.startsWith('corepack '))).toEqual([])
    await expectNoClone(f)
  })

  it('fails closed without running checks when the sandbox cannot start', async () => {
    const f = await fixture()
    const result = await gate(f, [f.mainSha, '--repo', REPO], { BWRAP_EXIT: '1' })
    expect(result.code).not.toBe(0)

    const list = await statuses(f)
    expectSafe(f, list)
    expect(list.map((s) => s.state)).toEqual(['pending', 'failure'])
    expect(list[1].description).toMatch(/^sandbox unavailable/)
    expect((await calls(f)).filter((line) => line.startsWith('corepack '))).toEqual([])
    await expectNoClone(f)
  })

  it('fails closed without running checks when the pnpm shim cannot be installed', async () => {
    const f = await fixture()
    const result = await gate(f, [f.mainSha, '--repo', REPO], { ENABLE_EXIT: '1' })
    expect(result.code).not.toBe(0)

    const list = await statuses(f)
    expectSafe(f, list)
    expect(list.map((s) => s.state)).toEqual(['pending', 'failure'])
    expect(list[1].description).toMatch(/^sandbox unavailable/)
    expect((await calls(f)).filter((line) => line.startsWith('corepack '))).toEqual([])
    await expectNoClone(f)
  })

  it('falls back to failure when the final status cannot be posted', async () => {
    const f = await fixture()
    const result = await gate(f, [f.mainSha, '--repo', REPO], { GH_FAIL_STATE: 'success' })
    expect(result.code).not.toBe(0)

    const list = await statuses(f)
    expectSafe(f, list)
    expect(list.map((s) => s.state)).toEqual(['pending', 'success', 'failure'])
    expect(list[2].description).toMatch(/^could not record success/)
    const summary = await readFile(path.join(f.gates, f.mainSha, 'summary'), 'utf8')
    expect(summary.trim().split('\n').filter((line) => line.startsWith('result=')).at(-1)).toBe(
      'result=failure',
    )
    await expectNoClone(f)
  })

  it('detects untracked output even when status.showUntrackedFiles is no', async () => {
    const f = await fixture()
    const result = await gate(f, [f.mainSha, '--repo', REPO], {
      DIRTY_PHASE: 'normal',
      GIT_CONFIG_COUNT: '1',
      GIT_CONFIG_KEY_0: 'status.showUntrackedFiles',
      GIT_CONFIG_VALUE_0: 'no',
    })
    expect(result.code).not.toBe(0)

    const list = await statuses(f)
    expectSafe(f, list)
    expect(list.map((s) => s.state)).toEqual(['pending', 'failure'])
    expect(list[1].description).toMatch(/tree changed during normal check/)
  })

  it.each([
    ['normal', 'none'],
    ['production', 'none'],
    ['normal', '5099 ok (5099)'],
    ['production', '5099 ok (5099)'],
    ['normal', '0 passed (0)'],
    ['production', '2 failed | 5097 passed | 1 skipped (5100)'],
  ])('records failure when the %s check reports %s', async (phase, summary) => {
    const f = await fixture()
    const result = await gate(f, [f.mainSha, '--repo', REPO], {
      [`${phase.toUpperCase()}_SUMMARY`]: summary,
    })
    expect(result.code).not.toBe(0)

    const list = await statuses(f)
    expectSafe(f, list)
    expect(list.map((s) => s.state)).toEqual(['pending', 'failure'])
    expect(list[1].description).toMatch(new RegExp(`^${phase} check reported `))
    const production = (await calls(f)).filter((line) =>
      line.startsWith('corepack NODE_ENV=production'),
    )
    expect(production).toHaveLength(phase === 'normal' ? 0 : 1)
  })


  it.each([
    ['rename', 0],
    ['gitfile', 0],
    ['symlink', 1],
  ] as const)(
    'never runs configuration planted by a %s of the clone outside the sandbox',
    async (mode, code) => {
      const f = await fixture()
      const result = await gate(f, [f.mainSha, '--repo', REPO], {
        SWAP_PHASE: 'normal',
        SWAP_MODE: mode,
      })
      await expect(stat(f.pwned)).rejects.toThrow()
      // Neither a .git entry nor a renamed directory holding identical files
      // changes the tree the gate checks; a symlinked clone fails the gate.
      expect(result.code, result.output).toBe(code)
      const list = await statuses(f)
      expectSafe(f, list)
      expect(list.at(-1)?.state).toBe(code === 0 ? 'success' : 'failure')
      if (code !== 0) expect(list.at(-1)?.description).toMatch(/during normal check/)
      await expectNoClone(f)
    },
  )

  it('never enters a submodule the sandbox populated', async () => {
    const f = await fixture()
    const work = path.join(f.root, 'work')
    await git(work, 'update-index', '--add', '--cacheinfo', `160000,${f.mainSha},sub`)
    await git(work, 'commit', '--quiet', '-m', 'submodule')
    await git(work, 'push', '--quiet', 'origin', 'HEAD:refs/heads/other')
    const sha = await git(work, 'rev-parse', 'HEAD')
    const result = await gate(f, [sha, '--repo', REPO], {
      SWAP_PHASE: 'normal',
      SWAP_MODE: 'submodule',
    })
    await expect(stat(f.pwned)).rejects.toThrow()
    expect(result.code, result.output).toBe(0)
    expect((await statuses(f)).at(-1)?.state).toBe('success')
    await expectNoClone(f)
  })

  it('fails closed without running checks when python3 is outside the system directories', async () => {
    const f = await fixture()
    const system = path.join(f.root, 'system-bin')
    const local = path.join(f.root, 'local-bin')
    await mkdir(system)
    await mkdir(local)
    await Promise.all(
      (await readdir('/usr/bin'))
        .filter((name) => !name.startsWith('python3') && name !== 'bwrap')
        .map((name) => symlink(path.join('/usr/bin', name), path.join(system, name))),
    )
    await symlink('/usr/bin/python3', path.join(local, 'python3'))
    const result = await gate(f, [f.mainSha, '--repo', REPO], {
      PATH: `${f.bin}:${path.join(f.root, 'sandbox-bin')}:${path.dirname(process.execPath)}:${local}:${system}`,
    })
    expect(result.code).not.toBe(0)

    const list = await statuses(f)
    expectSafe(f, list)
    expect(list.map((s) => s.state)).toEqual(['pending', 'failure'])
    expect(list[1].description).toMatch(/^sandbox unavailable: python3/)
    expect((await calls(f)).filter((line) => line.startsWith('corepack '))).toEqual([])
    await expectNoClone(f)
  })

  it.runIf(realpathSync('/bin') === '/usr/bin')(
    'accepts a python3 reached through a merged /bin',
    async () => {
      const f = await fixture()
      const result = await gate(f, [f.mainSha, '--repo', REPO], {
        PATH: `${f.bin}:${path.join(f.root, 'sandbox-bin')}:${path.dirname(process.execPath)}:/bin`,
      })
      expect(result.code, result.output).toBe(0)
      expect((await statuses(f)).at(-1)?.state).toBe('success')
    },
  )

  it.each(['pnpm@https://example.com/pnpm.tgz', 'pnpm@latest', 'pnpm@10.34.5 x', 'yarn@4.0.0'])(
    'refuses packageManager %s without running anything in the sandbox',
    async (packageManager) => {
      const f = await fixture()
      const work = path.join(f.root, 'work')
      await writeFile(
        path.join(work, 'package.json'),
        JSON.stringify({ name: 'fixture', packageManager }),
      )
      await git(work, 'commit', '--quiet', '-am', 'package manager')
      await git(work, 'push', '--quiet', 'origin', 'HEAD:refs/heads/other')
      const sha = await git(work, 'rev-parse', 'HEAD')
      const result = await gate(f, [sha, '--repo', REPO])
      expect(result.code).not.toBe(0)

      const list = await statuses(f)
      expectSafe(f, list)
      expect(list.map((s) => s.state)).toEqual(['pending', 'failure'])
      expect(list[1].description).toMatch(/^unsupported packageManager/)
      expect(await readdir(f.sandboxCalls)).toEqual([])
    },
  )

  it('lets dependency installs reach only public addresses through its proxy', async () => {
    const f = await fixture()
    const targets = [
      '127.0.0.1:443',
      'localhost:443',
      '10.0.0.181:443',
      '100.84.216.62:443',
      '[::1]:443',
      '[fd7a:115c:a1e0::1]:443',
      '169.254.169.254:443',
      '140.82.112.3:22',
    ]
    const result = await gate(f, [f.mainSha, '--repo', REPO], { PROXY_PROBE: targets.join(' ') })
    expect(result.code, result.output).toBe(0)

    const replies = (await calls(f)).filter((line) => line.startsWith('proxy '))
    // Asked once from the install and once from the dependency build.
    expect(replies).toHaveLength(targets.length * 2)
    for (const reply of replies) expect(reply).toMatch(/^proxy \S+ HTTP\/1\.1 403 /)
  })

  it.runIf(realSandbox)(
    'cannot reach the host network or write the git directory from a real sandbox',
    async () => {
      const f = await fixture()
      const accepted: string[] = []
      const listener = createServer((socket) => {
        accepted.push(String(socket.remoteAddress))
        socket.destroy()
      })
      await new Promise<void>((resolve) => listener.listen(0, '0.0.0.0', resolve))
      try {
        const port = (listener.address() as { port: number }).port
        const external = Object.values(networkInterfaces())
          .flat()
          .find((entry) => entry && entry.family === 'IPv4' && !entry.internal)?.address
        const addresses = ['127.0.0.1', ...(external ? [external] : [])]
        const toolchain = path.join(f.root, 'toolchain', 'bin')
        await mkdir(toolchain, { recursive: true })
        await stub(toolchain, 'node', `exec ${JSON.stringify(process.execPath)} "$@"`)
        await stub(
          toolchain,
          'corepack',
          [
            '[[ "$1" != enable ]] || exit 0',
            `for address in ${addresses.join(' ')}; do`,
            `  if (exec 3<>"/dev/tcp/$address/${port}") 2>/dev/null; then`,
            '    echo "REACHED $address"',
            '  else',
            '    echo "BLOCKED $address"',
            '  fi',
            'done',
            'gitdir="$(sed -n "s/^gitdir: //p" .git)"',
            'if [[ -n "$gitdir" ]] && ! (: >>"$gitdir/config") 2>/dev/null; then',
            '  echo "GITDIR READONLY"',
            'fi',
            'if [[ -n "${HTTPS_PROXY:-}" ]]; then',
            '  proxy="${HTTPS_PROXY#http://}"; proxy="${proxy%/}"',
            `  for address in ${addresses.join(' ')}; do`,
            '    exec 3<>"/dev/tcp/${proxy%:*}/${proxy##*:}"',
            `    printf "CONNECT %s:${port} HTTP/1.1\\r\\n\\r\\n" "$address" >&3`,
            '    printf "PROXY %s %s\\n" "$address" "$(head -n 1 <&3 | tr -d "\\r")"',
            '    exec 3<&-',
            '  done',
            'fi',
            'echo "      Tests  1 passed (1)"',
          ].join('\n'),
        )
        const result = await gate(f, [f.mainSha, '--repo', REPO], {
          PATH: `${toolchain}:${f.bin}:/usr/bin:/bin`,
        })
        expect(result.code, result.output).toBe(0)

        const proxied = ['install.log', 'rebuild.log']
        for (const name of [...proxied, 'check.log', 'production-check.log']) {
          const log = await readFile(path.join(f.gates, f.mainSha, name), 'utf8')
          for (const address of addresses) {
            expect(log, name).toContain(`BLOCKED ${address}`)
            if (proxied.includes(name)) {
              expect(log, name).toMatch(new RegExp(`^PROXY ${address} HTTP/1\\.1 403 `, 'm'))
            }
          }
          expect(log, name).toContain('GITDIR READONLY')
          expect(log, name).not.toMatch(/^PROXY .* 200 /m)
        }
        expect(accepted).toEqual([])
      } finally {
        listener.close()
      }
    },
  )

  it.runIf(realSandbox)(
    'never mounts or follows what one phase left in the sandbox directory',
    async () => {
      const f = await fixture()
      const outside = path.join(f.root, 'outside')
      await mkdir(outside)
      await writeFile(path.join(outside, 'keep'), 'keep\n')
      const toolchain = path.join(f.root, 'toolchain', 'bin')
      await mkdir(toolchain, { recursive: true })
      await stub(toolchain, 'node', `exec ${JSON.stringify(process.execPath)} "$@"`)
      // Install points the sandbox directory's /tmp source at the git
      // directory and leaves links to places outside the sandbox; the next
      // phase plants a clean filter through /tmp if that took effect and
      // touches a tracked file so the gate's own git status would run it.
      await stub(
        toolchain,
        'corepack',
        [
          '[[ "$1" != enable ]] || exit 0',
          'sandbox="$(dirname "$PWD")"',
          'gitdir="$(sed -n "s/^gitdir: //p" .git)"',
          'if [[ " $* " == *" install "* ]]; then',
          '  mv "$sandbox/tmp" "$sandbox/old-tmp"; ln -s "$gitdir" "$sandbox/tmp"',
          `  ln -s ${JSON.stringify(outside)} "$sandbox/outside"`,
          `  ln -s ${JSON.stringify(outside)} "$sandbox/home/outside"`,
          `  ln -s ${JSON.stringify(f.gates)} "$sandbox/gates"`,
          'elif [[ -f /tmp/HEAD ]]; then',
          '  echo "TMP IS GITDIR"',
          `  printf '[filter "pwn"]\\n\\tclean = touch ${f.pwned}; cat\\n' >>/tmp/config`,
          '  mkdir -p /tmp/info && echo "* filter=pwn" >/tmp/info/attributes',
          'fi',
          'touch -d @1 package.json',
          'echo "      Tests  1 passed (1)"',
        ].join('\n'),
      )
      const result = await gate(f, [f.mainSha, '--repo', REPO], {
        PATH: `${toolchain}:${f.bin}:/usr/bin:/bin`,
      })
      await expect(stat(f.pwned)).rejects.toThrow()
      for (const name of ['rebuild.log', 'check.log', 'production-check.log']) {
        const log = await readFile(path.join(f.gates, f.mainSha, name), 'utf8')
        expect(log, name).not.toContain('TMP IS GITDIR')
      }
      expect(result.code, result.output).toBe(0)
      expect((await statuses(f)).at(-1)?.state).toBe('success')
      expect(await readFile(path.join(outside, 'keep'), 'utf8')).toBe('keep\n')
      expect(await readFile(path.join(f.gates, f.mainSha, 'summary'), 'utf8')).toMatch(
        /^result=success$/m,
      )
      await expectNoClone(f)
    },
  )

  it.runIf(realSandbox)(
    'leaves no inherited secret in any process environment inside a real sandbox',
    async () => {
      const f = await fixture()
      const canary = `canary-${randomUUID()}`
      // A toolchain outside the system directories, which the gate binds back
      // into the sandbox; its corepack is a probe that dumps every process
      // environment it can read, then reports a passing test summary.
      const toolchain = path.join(f.root, 'toolchain', 'bin')
      await mkdir(toolchain, { recursive: true })
      await stub(toolchain, 'node', `exec ${JSON.stringify(process.execPath)} "$@"`)
      await stub(
        toolchain,
        'corepack',
        [
          '[[ "$1" != enable ]] || exit 0',
          'for file in /proc/1/environ /proc/self/environ /proc/[0-9]*/environ; do',
          '  [[ -r "$file" ]] || continue',
          '  printf "== %s\\n" "$file"',
          '  tr "\\0" "\\n" <"$file" 2>/dev/null || true',
          'done',
          'echo "      Tests  1 passed (1)"',
        ].join('\n'),
      )
      const result = await gate(f, [f.mainSha, '--repo', REPO], {
        PATH: `${toolchain}:${f.bin}:/usr/bin:/bin`,
        GH_TOKEN: canary,
        GITHUB_TOKEN: canary,
        AGENTIC_REMOTE_GATE_CANARY: canary,
      })
      expect(result.code, result.output).toBe(0)

      for (const name of ['install.log', 'check.log', 'production-check.log']) {
        const log = await readFile(path.join(f.gates, f.mainSha, name), 'utf8')
        expect(log).toMatch(/^== \/proc\/1\/environ\nPATH=/m)
        expect(log).toMatch(/^== \/proc\/self\/environ\n/m)
        expect(log).not.toContain(canary)
        expect(log).not.toMatch(/^(GH_TOKEN|GITHUB_TOKEN|AGENTIC_REMOTE_GATE_CANARY)=/m)
      }
      expect((await statuses(f)).at(-1)?.state).toBe('success')
    },
  )

})
