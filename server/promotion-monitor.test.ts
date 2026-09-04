import { execFile } from 'node:child_process'
import { chmod, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it } from 'vitest'

const run = promisify(execFile)
const MONITOR = new URL('../bin/agentic-remote-promotion-monitor', import.meta.url)
  .pathname

const fixtures: string[] = []

afterEach(async () => {
  await Promise.all(
    fixtures.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  )
})

async function git(cwd: string, ...args: string[]): Promise<string> {
  const { stdout } = await run('git', ['-C', cwd, ...args], {
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'Test',
      GIT_AUTHOR_EMAIL: 'test@example.test',
      GIT_COMMITTER_NAME: 'Test',
      GIT_COMMITTER_EMAIL: 'test@example.test',
    },
  })
  return stdout.trim()
}

async function stub(dir: string, name: string, body: string): Promise<void> {
  const file = path.join(dir, name)
  await writeFile(file, `#!/usr/bin/env bash\nprintf '%s\\n' "${name} $*" >>"$CALL_LOG"\n${body}\n`)
  await chmod(file, 0o755)
}

interface Fixture {
  root: string
  dev: string
  remote: string
  runtime: string
  releases: string
  profile: string
  callLog: string
  env: NodeJS.ProcessEnv
}

// A real git history with only the external services stubbed: the script's own
// git, locking, and state handling run for real.
async function fixture(overrides: Record<string, string> = {}): Promise<Fixture> {
  const root = await mkdtemp(path.join(tmpdir(), 'promotion-monitor-'))
  fixtures.push(root)

  const origin = path.join(root, 'origin.git')
  const dev = path.join(root, 'dev')
  const runtime = path.join(root, 'runtime')
  const releases = path.join(root, 'releases')
  const bin = path.join(root, 'bin')
  const state = path.join(root, 'state')
  const callLog = path.join(root, 'calls.log')

  await mkdir(bin, { recursive: true })
  await mkdir(releases, { recursive: true })
  await writeFile(callLog, '')

  await run('git', ['init', '--bare', '-b', 'main', origin])
  await run('git', ['clone', origin, dev])
  await git(dev, 'config', 'user.email', 'test@example.test')
  await git(dev, 'config', 'user.name', 'Test')
  await writeFile(
    path.join(dev, 'package.json'),
    JSON.stringify({ name: 'fixture', packageManager: 'pnpm@10.34.5' }),
  )
  // Committed so it survives the detached checkout the monitor performs.
  await mkdir(path.join(dev, 'bin'), { recursive: true })
  await writeFile(
    path.join(dev, 'bin', 'agentic-remote'),
    [
      '#!/usr/bin/env bash',
      'printf \'%s\\n\' "agentic-remote $*" >>"$CALL_LOG"',
      '[[ "${SETUP_EXIT:-0}" == 0 ]] || exit "$SETUP_EXIT"',
      '[[ -z "${SETUP_CHECKOUT:-}" ]] || git checkout --detach "$SETUP_CHECKOUT" >/dev/null 2>&1',
      'release="$RELEASE_ROOT/$(date -u +%Y%m%dT%H%M%SZ)-$$"',
      'mkdir -p "$release"',
      'ln -sfn "$release" "$RELEASE_ROOT/.tmp-$$"',
      'mv -Tf "$RELEASE_ROOT/.tmp-$$" "$RELEASE_ROOT/current"',
    ].join('\n'),
  )
  await chmod(path.join(dev, 'bin', 'agentic-remote'), 0o755)
  await git(dev, 'add', '-A')
  await git(dev, 'commit', '-m', 'base')
  await git(dev, 'push', 'origin', 'main')

  // A worktree, not a clone: the monitor switches PROD_ROOT to the candidate
  // without fetching there, so it must share DEV_ROOT's object store. This is
  // what `promotion-setup --create-runtime` builds.
  await git(dev, 'worktree', 'add', '--detach', runtime, 'HEAD')

  // A real second checkout standing in for a downstream host.
  const remote = path.join(root, 'remote')
  await run('git', ['clone', origin, remote])

  await stub(
    bin,
    'corepack',
    [
      // Only the last argument names the script, so a directory that happens
      // to contain the word cannot be mistaken for one.
      'for ((i = 1; i <= $#; i++)); do',
      '  if [[ "${!i}" == "--dir" ]]; then',
      '    next=$((i + 1))',
      '    printf "corepack-dir %s %s\\n" "${*: -1}" "${!next}" >>"$CALL_LOG"',
      '  fi',
      'done',
      'if [[ "${*: -1}" == "test" ]]; then exit "${PNPM_TEST_EXIT:-0}"; fi',
      'exit "${COREPACK_EXIT:-0}"',
    ].join('\n'),
  )
  await stub(
    bin,
    'systemctl',
    'case "$*" in *"is-active"*) exit "${SERVICE_ACTIVE:-0}";; esac\nexit 0',
  )
  await stub(bin, 'curl', 'exit "${CURL_EXIT:-0}"')
  // sshd evaluates the command through the remote user's shell. Avoid starting
  // a second login shell here because host profiles may replace the fixture
  // PATH and bypass the stubbed remote tools.
  await stub(
    bin,
    'ssh',
    [
      'shift',
      'command="$*"',
      'command="${command/bash -lc /bash -c }"',
      'exec bash -c "$command"',
    ].join('\n'),
  )

  const settings: Record<string, string> = {
    AGENTIC_REMOTE_MONITOR_HOME: root,
    AGENTIC_REMOTE_MONITOR_DEV_ROOT: dev,
    AGENTIC_REMOTE_MONITOR_PROD_ROOT: runtime,
    AGENTIC_REMOTE_MONITOR_RELEASE_ROOT: releases,
    AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
    AGENTIC_REMOTE_MONITOR_SERVICE: 'fixture.service',
    AGENTIC_REMOTE_MONITOR_HEALTH_URL: 'http://127.0.0.1:1/health',
    AGENTIC_REMOTE_RUNTIME_TOOLS: bin,
    AGENTIC_REMOTE_MONITOR_DOWNSTREAM_SSH: 'ssh',
    AGENTIC_REMOTE_MONITOR_READY_ATTEMPTS: '2',
    AGENTIC_REMOTE_MONITOR_READY_INTERVAL: '1',
    ...overrides,
  }
  const profile = path.join(root, 'profile.env')
  await writeFile(
    profile,
    Object.entries(settings)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n'),
  )

  // run_remote() deliberately hands the remote command to a login shell
  // (`bash -lc`) so a real downstream host's nvm/asdf-managed PATH is
  // available. A login shell also re-sources /etc/profile first, which on a
  // Debian-family host unconditionally *replaces* PATH for non-root users
  // (rather than appending to it), discarding the stub `bin` directory this
  // fixture prepended. Bash then reads `~/.bash_profile` next, so restoring
  // PATH there survives the reset the same way a real login environment
  // (e.g. nvm's shell hook) would.
  await writeFile(
    path.join(root, '.bash_profile'),
    `export PATH="${bin}:$PATH"\n`,
  )

  return {
    root,
    dev,
    remote,
    runtime,
    releases,
    profile,
    callLog,
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH ?? ''}`,
      HOME: root,
      CALL_LOG: callLog,
      RELEASE_ROOT: releases,
      AGENTIC_REMOTE_MONITOR_PROFILE: profile,
    },
  }
}

async function addDownstream(context: Fixture, root: string): Promise<void> {
  const extra = [
    'AGENTIC_REMOTE_MONITOR_DOWNSTREAM_HOSTS=host-a',
    `AGENTIC_REMOTE_MONITOR_DOWNSTREAM_ROOT=${root}`,
    'AGENTIC_REMOTE_MONITOR_DOWNSTREAM_HEALTH_URL=http://127.0.0.1:1/health',
  ].join('\n')
  const current = await readFile(context.profile, 'utf8')
  await writeFile(context.profile, `${current}\n${extra}\n`)
}

async function monitor(
  context: Fixture,
  env: NodeJS.ProcessEnv = {},
): Promise<{ code: number; output: string }> {
  try {
    const { stdout, stderr } = await run(MONITOR, ['run'], {
      env: { ...context.env, ...env },
    })
    return { code: 0, output: stdout + stderr }
  } catch (error) {
    const failure = error as { code?: number; stdout?: string; stderr?: string }
    return {
      code: failure.code ?? 1,
      output: `${failure.stdout ?? ''}${failure.stderr ?? ''}`,
    }
  }
}

// Remote commands are printf %q escaped, so unescape before matching.
async function remoteScripts(context: Fixture): Promise<string[]> {
  return (await calls(context))
    .filter((line) => line.startsWith('ssh '))
    .map((line) => line.replace(/^ssh \S+ /, '').replaceAll('\\', ''))
}

async function calls(context: Fixture): Promise<string[]> {
  return (await readFile(context.callLog, 'utf8')).split('\n').filter(Boolean)
}

async function advanceMain(context: Fixture): Promise<string> {
  await writeFile(path.join(context.dev, 'change.txt'), 'next')
  await git(context.dev, 'add', '-A')
  await git(context.dev, 'commit', '-m', 'next')
  await git(context.dev, 'push', 'origin', 'main')
  return git(context.dev, 'rev-parse', 'HEAD')
}

describe('promotion monitor', () => {
  it('refuses a validation path that names a checkout it would delete', async () => {
    const context = await fixture()
    await advanceMain(context)

    // Cleanup removes that directory outright, so a state directory whose
    // `validate` entry leads to the development checkout would delete it.
    const state = path.join(context.root, 'state-over-dev')
    await mkdir(state, { recursive: true })
    await symlink(context.dev, path.join(state, 'validate'))
    const result = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
    })

    expect(result.code).not.toBe(0)
    expect(result.output).toContain('validation worktree would be')
    expect(existsSync(path.join(context.dev, '.git'))).toBe(true)
  })

  it('refuses to delete a worktree belonging to another repository', async () => {
    const context = await fixture()
    await advanceMain(context)

    // Another repository's linked worktree, parked where validation wants to
    // work. `git worktree remove` cannot remove it, because it belongs to a
    // different repository -- and a linked worktree keeps `.git` as a file, so
    // a check for a directory let it fall through to `rm -rf` along with
    // whatever was not committed in it.
    const state = path.join(context.root, 'state-foreign')
    await mkdir(state, { recursive: true })
    const other = path.join(context.root, 'other-repo')
    await mkdir(other, { recursive: true })
    await git(other, 'init', '--initial-branch=main')
    await git(other, 'config', 'user.email', 'other@example.test')
    await git(other, 'config', 'user.name', 'Other')
    await writeFile(path.join(other, 'kept.txt'), 'committed\n')
    await git(other, 'add', '-A')
    await git(other, 'commit', '-m', 'base')
    await git(other, 'worktree', 'add', '--detach', path.join(state, 'validate'), 'HEAD')
    const unsaved = path.join(state, 'validate', 'unsaved.txt')
    await writeFile(unsaved, 'work nobody has committed\n')

    const result = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
    })

    expect(result.code).not.toBe(0)
    expect(result.output).toContain('belongs to another checkout')
    // Everything that was there is still there.
    expect(existsSync(unsaved)).toBe(true)
    expect(existsSync(path.join(state, 'validate', 'kept.txt'))).toBe(true)
  })

  it('validates somewhere of its own rather than in the development checkout', async () => {
    const context = await fixture()
    const candidate = await advanceMain(context)

    expect((await monitor(context)).code).toBe(0)

    const ranIn = (await calls(context))
      .filter((line) => line.startsWith('corepack-dir test '))
      .map((line) => line.replace('corepack-dir test ', ''))
    expect(ranIn).not.toHaveLength(0)
    // The development checkout is somebody's workspace, and can be on a
    // filesystem chosen for working rather than for running a suite quickly.
    for (const directory of ranIn) {
      expect(directory.startsWith(context.dev)).toBe(false)
    }
    // What passed has to be what is promoted, so it is pinned rather than
    // read from a checkout that can move underneath it.
    expect(await git(context.runtime, 'rev-parse', 'HEAD')).toBe(candidate)
  })

  it('graduates a validated commit and records both identifiers', async () => {
    const context = await fixture()
    const previous = await git(context.runtime, 'rev-parse', 'HEAD')
    const candidate = await advanceMain(context)

    const result = await monitor(context)

    expect(result.code).toBe(0)
    expect(await git(context.runtime, 'rev-parse', 'HEAD')).toBe(candidate)
    const record = await readFile(
      path.join(context.root, 'state', 'promotion-state'),
      'utf8',
    )
    expect(record).toContain(`promoted_commit=${candidate}`)
    expect(record).toContain(`previous_runtime_commit=${previous}`)
  })

  it('inherits the installed identity when the profile sets none', async () => {
    const context = await fixture()
    await advanceMain(context)

    await monitor(context)

    const setup = (await calls(context)).find((line) =>
      line.startsWith('agentic-remote setup'),
    )
    expect(setup).toBe('agentic-remote setup')
  })

  it('passes only the identity flags the profile sets', async () => {
    const context = await fixture({
      AGENTIC_REMOTE_MONITOR_ROLE: 'node',
      AGENTIC_REMOTE_MONITOR_NAME: 'worker',
    })
    await advanceMain(context)

    await monitor(context)

    const setup = (await calls(context)).find((line) =>
      line.startsWith('agentic-remote setup'),
    )
    expect(setup).toBe('agentic-remote setup --role node --name worker')
  })

  it('refuses a local main that is ahead of origin', async () => {
    const context = await fixture()
    await writeFile(path.join(context.dev, 'local.txt'), 'unpushed')
    await git(context.dev, 'add', '-A')
    await git(context.dev, 'commit', '-m', 'unpushed')

    const result = await monitor(context)

    expect(result.code).not.toBe(0)
    expect(result.output).toContain('not at origin/main')
    expect((await calls(context)).some((l) => l.startsWith('agentic-remote'))).toBe(
      false,
    )
  })

  it('does not graduate when the tests fail', async () => {
    const context = await fixture()
    const previous = await git(context.runtime, 'rev-parse', 'HEAD')
    await advanceMain(context)

    // Nothing runs the suite remotely any more, so a failing test has to stop
    // the promotion here or it would reach production unexercised.
    const result = await monitor(context, { PNPM_TEST_EXIT: '1' })

    expect(result.code).not.toBe(0)
    expect(await git(context.runtime, 'rev-parse', 'HEAD')).toBe(previous)
    expect(existsSync(path.join(context.root, 'state', 'promotion-state'))).toBe(
      false,
    )
  })

  it('restores the previous commit and release when health fails', async () => {
    const context = await fixture()
    const previous = await git(context.runtime, 'rev-parse', 'HEAD')
    // Publish a release first so there is a known-good target to restore.
    await run('bash', ['-c', `mkdir -p "${context.releases}/first" && ln -sfn "${context.releases}/first" "${context.releases}/current"`])
    await advanceMain(context)

    const result = await monitor(context, { CURL_EXIT: '7' })

    expect(result.code).not.toBe(0)
    expect(result.output).toContain('health check failed')
    expect(await git(context.runtime, 'rev-parse', 'HEAD')).toBe(previous)
    expect(existsSync(path.join(context.root, 'state', 'promotion-state'))).toBe(
      false,
    )
  })

  it('lets an environment variable override the profile', async () => {
    const context = await fixture()
    await advanceMain(context)

    // Precedence matters for secrecy: a value can be supplied per run instead
    // of being written to a file.
    const result = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_DEV_ROOT: '/tmp/not-a-repository-fixture',
    })

    expect(result.code).not.toBe(0)
    expect(result.output).toContain(
      'not a Git repository: /tmp/not-a-repository-fixture',
    )
  })

  it('exits without touching the service when nothing is ungraduated', async () => {
    const context = await fixture()
    const candidate = await git(context.dev, 'rev-parse', 'HEAD')
    await mkdir(path.join(context.root, 'state'), { recursive: true })
    await writeFile(
      path.join(context.root, 'state', 'promotion-state'),
      `promoted_commit=${candidate}\n`,
    )

    const result = await monitor(context)

    expect(result.code).toBe(0)
    expect(result.output).toContain('no ungraduated commit')
    expect(await calls(context)).toEqual([])
  })

  it('promotes to a downstream host and verifies the commit it landed on', async () => {
    const context = await fixture()
    await addDownstream(context, context.remote)
    const candidate = await advanceMain(context)

    const result = await monitor(context)

    expect(result.code).toBe(0)
    expect(result.output).toContain(`promoted ${candidate} to host-a`)
    // The host really moved to the validated commit.
    expect(await git(context.remote, 'rev-parse', 'HEAD')).toBe(candidate)
    const remote = await remoteScripts(context)
    expect(remote.some((line) => line.includes('git status --porcelain'))).toBe(true)
    // The exact commit is installed. Pulling would take whatever the branch
    // points at now, which is not what was validated.
    expect(
      remote.some((line) => line.includes(`git checkout --detach ${candidate}`)),
    ).toBe(true)
    expect(remote.some((line) => line.includes('git pull'))).toBe(false)
    expect(remote.some((line) => line.includes('agentic-remote update'))).toBe(false)
  })

  it('restores a downstream host that landed on a different commit', async () => {
    const context = await fixture()
    await addDownstream(context, context.remote)
    const base = await git(context.remote, 'rev-parse', 'HEAD')
    await advanceMain(context)

    // Emulate the race the assertion defends against: the host ends up on a
    // different commit than the one that was validated.
    const result = await monitor(context, { SETUP_CHECKOUT: base })

    expect(result.code).not.toBe(0)
    expect(result.output).toContain('not the validated')
    expect(result.output).toContain('downstream promotion failed')
    expect(existsSync(path.join(context.root, 'state', 'promotion-state'))).toBe(
      false,
    )
  })

  it('treats a hostile downstream path as data rather than code', async () => {
    const marker = path.join(tmpdir(), `promotion-injection-${process.pid}`)
    await rm(marker, { force: true })
    const context = await fixture()
    await addDownstream(context, `${context.remote}/$(touch ${marker})`)
    await advanceMain(context)

    const result = await monitor(context)

    // The path is nonsense, so promotion must fail — but the substitution must
    // never have run on the remote shell that evaluated the command.
    expect(result.code).not.toBe(0)
    expect(existsSync(marker)).toBe(false)
  })

  it('rejects an incomplete downstream profile before building anything', async () => {
    const context = await fixture({
      AGENTIC_REMOTE_MONITOR_DOWNSTREAM_HOSTS: 'host-a',
    })
    await advanceMain(context)

    const result = await monitor(context)

    expect(result.code).not.toBe(0)
    expect(result.output).toContain('DOWNSTREAM_ROOT is required')
    expect(await calls(context)).toEqual([])
  })
})
