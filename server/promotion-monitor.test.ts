import { execFile } from 'node:child_process'
import { chmod, mkdir, mkdtemp, readFile, readdir, realpath, rm, symlink, utimes, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it } from 'vitest'

const run = promisify(execFile)
const MONITOR = new URL('../bin/agentic-remote-promotion-monitor', import.meta.url)
  .pathname
const AGENTIC_REMOTE = new URL('../bin/agentic-remote', import.meta.url).pathname

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
  const releases = path.join(root, '.config', 'agentic-remote', 'releases')
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
      'if [[ "${REQUIRE_COPILOT:-0}" == 1 ]]; then copilot_path="$(command -v copilot)" || exit 127; printf \'copilot-path %s\\n\' "$copilot_path" >>"$CALL_LOG"; fi',
      '[[ "${SETUP_EXIT:-0}" == 0 ]] || exit "$SETUP_EXIT"',
      'setup_root="$(cd -- "$(dirname "$0")/.." && pwd -P)"',
      'if [[ -n "${SETUP_CHECKOUT:-}" && ( -z "${SETUP_CHECKOUT_ROOT:-}" || "$SETUP_CHECKOUT_ROOT" == "$setup_root" ) ]]; then git -C "$setup_root" checkout --detach "$SETUP_CHECKOUT" >/dev/null 2>&1; fi',
      'release_id=""',
      'while (($#)); do if [[ "$1" == "--release-id" ]]; then release_id="$2"; shift 2; else shift; fi; done',
      'release="$RELEASE_ROOT/${release_id:-$(date -u +%Y%m%dT%H%M%SZ)-$$}"',
      'mkdir -p "$release"',
      'printf candidate >"$release/fixture-candidate"',
      '[[ "${SETUP_AFTER_PUBLISH_EXIT:-0}" == 0 ]] || exit "$SETUP_AFTER_PUBLISH_EXIT"',
      '[[ "${SETUP_SKIP_ACTIVATION:-0}" == 0 ]] || exit 0',
      'ln -sfn "$release" "$RELEASE_ROOT/.tmp-$$"',
      'mv -Tf "$RELEASE_ROOT/.tmp-$$" "$RELEASE_ROOT/current"',
      'find "$RELEASE_ROOT" -mindepth 1 -maxdepth 1 -type d ! -exec test -e "{}/.promotion-failed" \\; -printf "%T@ %p\\n" | sort -nr | tail -n +4 | cut -d" " -f2- | while IFS= read -r old; do rm -rf -- "$old"; done',
      'if [[ "${SETUP_KILL_AFTER_ACTIVATION:-0}" == 1 ]]; then kill -KILL "$PPID"; exit 137; fi',
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
      // A hard kill: no EXIT trap runs, so whatever the monitor left on disk
      // by then is what the next run has to cope with.
      'if [[ "${*: -1}" == "test" && -n "${PNPM_TEST_KILL:-}" ]]; then',
      '  kill -KILL "$PPID"',
      '  exit 137',
      'fi',
      // Leaves the validation worktree unreadable to git, the way a truncated
      // write or a failing disk would.
      'if [[ "${*: -1}" == "build" && -n "${PNPM_TEST_CORRUPT_INDEX:-}" ]]; then',
      '  for ((j = 1; j <= $#; j++)); do',
      '    if [[ "${!j}" == "--dir" ]]; then',
      '      k=$((j + 1))',
      // A linked worktree keeps its index in the shared git directory, which
      // its own `.git` file names.
      '      target="$(sed -n "s/^gitdir: *//p" "${!k}/.git")"',
      '      printf "not an index" >"$target/index"',
      '    fi',
      '  done',
      'fi',
      // Leaves the worktree clean but standing on a different commit.
      'if [[ "${*: -1}" == "build" && -n "${PNPM_TEST_MOVE_HEAD:-}" ]]; then',
      '  for ((j = 1; j <= $#; j++)); do',
      '    if [[ "${!j}" == "--dir" ]]; then',
      '      k=$((j + 1))',
      '      git -C "${!k}" checkout --detach HEAD~1 >/dev/null 2>&1',
      '    fi',
      '  done',
      'fi',
      'if [[ "${*: -1}" == "test" ]]; then exit "${PNPM_TEST_EXIT:-0}"; fi',
      'exit "${COREPACK_EXIT:-0}"',
    ].join('\n'),
  )
  await stub(
    bin,
    'systemctl',
    'case "$*" in *"is-active"*) exit "${SERVICE_ACTIVE:-0}";; *"restart"*) exit "${SERVICE_RESTART_EXIT:-0}";; esac\nexit 0',
  )
  await stub(
    bin,
    'curl',
    'if [[ "${FAIL_CANDIDATE_HEALTH:-0}" == 1 && -f "$RELEASE_ROOT/current/fixture-candidate" ]]; then exit 7; fi\nexit "${CURL_EXIT:-0}"',
  )
  const realMv = (await run('sh', ['-c', 'command -v mv'])).stdout.trim()
  await stub(
    bin,
    'mv',
    [
      'if [[ "${FAIL_POINTER_RESTORE:-0}" == 1 && "$*" == *".current-rollback-"* ]]; then exit 1; fi',
      'if [[ -n "${FAIL_PENDING_PHASE:-}" && "$*" == *".pending-promotion-${FAIL_PENDING_PHASE}-"* ]]; then exit 1; fi',
      'if [[ -n "${KILL_PENDING_PHASE:-}" && "$*" == *".pending-promotion-${KILL_PENDING_PHASE}-"* ]]; then kill -KILL "$PPID"; exit 137; fi',
      'if [[ "${KILL_BEFORE_STATE_RECORD:-0}" == 1 && "${@: -1}" == */promotion-state ]]; then kill -KILL "$PPID"; exit 137; fi',
      `if [[ "\${KILL_AFTER_STATE_RECORD:-0}" == 1 && "\${@: -1}" == */promotion-state ]]; then ${JSON.stringify(realMv)} "$@" || exit "$?"; kill -KILL "$PPID"; exit 137; fi`,
      `exec ${JSON.stringify(realMv)} "$@"`,
    ].join('\n'),
  )
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

async function healthyReleaseFixture(withLegacyCli = false): Promise<{
  context: Fixture
  previous: string
  fallback: string
  state: string
  record: string
}> {
  const context = await fixture({ AGENTIC_REMOTE_MONITOR_READY_INTERVAL: '0' })
  if (withLegacyCli) {
    const source = path.join(context.dev, 'bin', 'agentic-remote')
    const setup = await readFile(source, 'utf8')
    const cliSource = await readFile(AGENTIC_REMOTE, 'utf8')
    const current = ['quarantine_inactive_rejected_releases', 'rollback_service'].map((name) => {
      const body = cliSource.match(new RegExp(`^${name}\\(\\) \\{[\\s\\S]*?^\\}`, 'm'))?.[0]
      if (!body) throw new Error(`Missing ${name} function`)
      return body
    }).join('\n')
    const cli = (version: string, rollback: string, setup: string) => [
      '#!/usr/bin/env bash',
      'set -Eeuo pipefail',
      'CONFIG_DIR="$HOME/.config/agentic-remote"',
      'SERVICE_NAME=fixture.service',
      'die() { printf "%s\\n" "$*" >&2; exit 1; }',
      `printf 'cli-version ${version}\\n' >>"$CALL_LOG"`,
      rollback,
      'if [[ "${1:-}" == rollback ]]; then rollback_service; exit; fi',
      setup,
    ].join('\n')
    // The actual rollback implementation before failed-release markers existed.
    // Keep it independent of today's function so a source checkout really does
    // change what the installed command understands.
    const legacy = String.raw`rollback_service() {
  local releases_dir current_release previous_release temporary_link
  releases_dir="$CONFIG_DIR/releases"
  [[ -d "$releases_dir" ]] || die "no previous release is available"
  current_release="$(readlink -f "$releases_dir/current" 2>/dev/null || true)"
  previous_release="$(
    find "$releases_dir" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' |
      sort -nr |
      cut -d' ' -f2- |
      while IFS= read -r release; do
        release="$(readlink -f "$release")"
        if [[ "$release" != "$current_release" ]]; then
          printf '%s\n' "$release"
          break
        fi
      done
  )"
  [[ -n "$previous_release" ]] || die "no previous release is available"
  temporary_link="$releases_dir/.current-$$"
  ln -s "$previous_release" "$temporary_link"
  mv -Tf "$temporary_link" "$releases_dir/current"
  systemctl --user restart "$SERVICE_NAME"
  printf 'Rolled back to %s\n' "$(basename "$previous_release")"
}`
    await writeFile(source, cli('legacy', legacy, 'die "legacy setup is not used by this fixture"'))
    await git(context.dev, 'add', 'bin/agentic-remote')
    await git(context.dev, 'commit', '-m', 'legacy rollback CLI')
    await git(context.runtime, 'switch', '--detach', await git(context.dev, 'rev-parse', 'HEAD'))
    const installed = path.join(context.root, '.local', 'bin', 'agentic-remote')
    await mkdir(path.dirname(installed), { recursive: true })
    await symlink(path.join(context.runtime, 'bin', 'agentic-remote'), installed)
    expect(await readFile(installed, 'utf8')).not.toContain('.promotion-failed')
    await writeFile(source, cli('marker-aware', current, setup))
  }
  const previous = path.join(context.releases, 'previous-healthy')
  const fallback = path.join(context.releases, 'older-healthy')
  await mkdir(previous)
  await mkdir(fallback)
  await writeFile(path.join(previous, 'identity'), 'previous healthy release')
  await writeFile(path.join(fallback, 'identity'), 'older healthy release')
  await utimes(fallback, 1, 1)
  await utimes(previous, 2, 2)
  await symlink(previous, path.join(context.releases, 'current'))
  const commit = await git(context.runtime, 'rev-parse', 'HEAD')
  const state = `${commit}\n`
  const record = `promoted_commit=${commit}\nprevious_release=${fallback}\n`
  await mkdir(path.join(context.root, 'state'), { recursive: true })
  await writeFile(path.join(context.root, 'state', 'last-graduated-commit'), state)
  await writeFile(path.join(context.root, 'state', 'promotion-state'), record)
  await advanceMain(context)
  return { context, previous, fallback, state, record }
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
    expect(result.output).toContain('not a validation worktree this monitor created')
    // Everything that was there is still there.
    expect(existsSync(unsaved)).toBe(true)
    expect(existsSync(path.join(state, 'validate', 'kept.txt'))).toBe(true)
  })

  it('refuses to force-remove a worktree of its own repository that holds work', async () => {
    const context = await fixture()
    await advanceMain(context)

    // A worktree of the same repository, made by hand, with work in it that
    // was never committed. `git worktree remove --force` deletes exactly that,
    // so asking whether the path was safe to remove only after removing it
    // asks about something already gone.
    const state = path.join(context.root, 'state-owned-dirty')
    await mkdir(state, { recursive: true })
    const validate = path.join(state, 'validate')
    await git(context.dev, 'worktree', 'add', '--detach', validate, 'HEAD')
    const unsaved = path.join(validate, 'unsaved.txt')
    await writeFile(unsaved, 'work nobody has committed\n')

    const result = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
    })

    expect(result.code).not.toBe(0)
    expect(result.output).toContain('not a validation worktree this monitor created')
    expect(existsSync(unsaved)).toBe(true)

    await git(context.dev, 'worktree', 'remove', '--force', validate)
  })

  it('clears its validation worktree whether the run passed or failed', async () => {
    const context = await fixture()
    await advanceMain(context)
    const state = path.join(context.root, 'state-lifecycle')
    await mkdir(state, { recursive: true })

    // A passing run leaves nothing behind.
    expect(
      (await monitor(context, { AGENTIC_REMOTE_MONITOR_STATE_DIR: state })).code,
    ).toBe(0)
    expect(existsSync(path.join(state, 'validate'))).toBe(false)
    expect(existsSync(path.join(state, 'validate.owned'))).toBe(false)
    // Nothing registered either, or the next run could not create it again.
    expect(await git(context.dev, 'worktree', 'list')).not.toContain(
      path.join(state, 'validate'),
    )

    // ...and so does a failing one. The trap runs after the function that
    // named these paths has been unwound, so holding them in that scope made
    // every failed validation abort before it cleaned anything up.
    await writeFile(path.join(context.dev, 'change.txt'), 'again')
    await git(context.dev, 'add', '-A')
    await git(context.dev, 'commit', '-m', 'again')
    await git(context.dev, 'push', 'origin', 'main')

    const failed = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
      PNPM_TEST_EXIT: '1',
    })
    expect(failed.code).not.toBe(0)
    expect(existsSync(path.join(state, 'validate'))).toBe(false)
    expect(existsSync(path.join(state, 'validate.owned'))).toBe(false)
  })

  it('refuses a worktree made at its path after an interrupted run', async () => {
    const context = await fixture()
    await advanceMain(context)

    // An interrupted run leaves the marker claiming the path. Somebody then
    // makes a worktree of this same repository there. The marker cannot vouch
    // for it: it was never the one this monitor created.
    const state = path.join(context.root, 'state-stale-marker')
    await mkdir(state, { recursive: true })
    const validate = path.join(state, 'validate')
    // Exactly what an interrupted run of the previous revision left behind.
    await writeFile(path.join(state, 'validate.owned'), `${validate}\n`)
    await git(context.dev, 'worktree', 'add', '--detach', validate, 'HEAD')
    await writeFile(path.join(validate, 'theirs.txt'), 'not ours\n')

    const result = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
    })

    expect(result.code).not.toBe(0)
    expect(result.output).toContain('not a validation worktree this monitor created')
    expect(existsSync(path.join(validate, 'theirs.txt'))).toBe(true)

    await git(context.dev, 'worktree', 'remove', '--force', validate)
  })

  it('leaves the records of unrelated worktrees alone', async () => {
    const context = await fixture()
    await advanceMain(context)

    // A worktree of this repository that is not reachable right now -- an
    // unmounted drive, a directory moved aside. Git keeps its record for three
    // months so it can be restored. Clearing the monitor's own leftovers used
    // to prune the whole repository, which threw this record away in passing;
    // for a detached worktree that can be the last reachable name a commit
    // has.
    const state = path.join(context.root, 'state-unrelated-record')
    await mkdir(state, { recursive: true })
    const elsewhere = path.join(context.root, 'someone-elses-worktree')
    await git(context.dev, 'worktree', 'add', '--detach', elsewhere, 'HEAD')
    await writeFile(path.join(elsewhere, 'only-here.txt'), 'unique\n')
    await git(elsewhere, 'add', '-A')
    await git(elsewhere, 'commit', '-m', 'only reachable from this worktree')
    const orphan = (await git(elsewhere, 'rev-parse', 'HEAD')).trim()
    await rm(elsewhere, { recursive: true, force: true })

    expect(
      (await monitor(context, { AGENTIC_REMOTE_MONITOR_STATE_DIR: state })).code,
    ).toBe(0)

    // Still registered, so it can be put back...
    expect(await git(context.dev, 'worktree', 'list')).toContain(elsewhere)
    // ...and its commit still has a name.
    expect((await git(context.dev, 'cat-file', '-t', orphan)).trim()).toBe('commit')
  })

  it('clears away a validation worktree an interrupted run left registered', async () => {
    const context = await fixture()
    await advanceMain(context)

    // Killed after the worktree was made. Whatever says the worktree is the
    // monitor's has to be in place by then, or every later run refuses to
    // touch it and promotion stops until somebody clears it by hand.
    const state = path.join(context.root, 'state-interrupted')
    await mkdir(state, { recursive: true })
    const validate = path.join(state, 'validate')
    const interrupted = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
      PNPM_TEST_KILL: '1',
    })
    expect(interrupted.code).not.toBe(0)
    expect(existsSync(validate)).toBe(true)
    // What git itself holds is enough to recognise it. Taking the marker away
    // stands for the run that was killed before writing one, and for a state
    // directory cleared out since: with ownership resting on anything written
    // after the worktree was made, both leave a worktree no run will touch.
    await rm(path.join(state, 'validate.owned'), { force: true })

    // The next run gets past it rather than being wedged by it.
    await writeFile(path.join(context.dev, 'change.txt'), 'again')
    await git(context.dev, 'add', '-A')
    await git(context.dev, 'commit', '-m', 'again')
    await git(context.dev, 'push', 'origin', 'main')

    const next = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
    })
    expect(next.output).not.toContain('not a validation worktree')
    expect(next.code).toBe(0)
    expect(existsSync(validate)).toBe(false)
  })

  it('deregisters a relatively recorded worktree whose directory has gone', async () => {
    const context = await fixture()
    await advanceMain(context)

    // The pair that used to wedge promotion for good: relative records, and a
    // validation directory already deleted while its record still points at
    // where it used to be. Resolving that pointer through the filesystem gives
    // nothing once the directory is missing, so the record was never matched,
    // never removed, and every later `worktree add` at that path failed.
    await git(context.dev, 'config', 'worktree.useRelativePaths', 'true')
    const state = path.join(context.root, 'state-relative-missing')
    await mkdir(state, { recursive: true })
    const validate = path.join(state, 'validate')

    const interrupted = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
      PNPM_TEST_KILL: '1',
    })
    expect(interrupted.code).not.toBe(0)
    await rm(validate, { recursive: true, force: true })
    expect(await git(context.dev, 'worktree', 'list')).toContain(validate)

    await writeFile(path.join(context.dev, 'change.txt'), 'again')
    await git(context.dev, 'add', '-A')
    await git(context.dev, 'commit', '-m', 'again')
    await git(context.dev, 'push', 'origin', 'main')

    const next = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
    })
    expect(next.code).toBe(0)
    expect(await git(context.dev, 'worktree', 'list')).not.toContain(validate)
  })

  it('owns its worktree when git records worktree paths relatively', async () => {
    const context = await fixture()
    await advanceMain(context)

    // With `worktree.useRelativePaths` the pointer git writes is relative. Read
    // as though it were relative to wherever the monitor happens to be
    // running, it names some other path entirely, and the monitor then refuses
    // to clean up after itself.
    await git(context.dev, 'config', 'worktree.useRelativePaths', 'true')
    const state = path.join(context.root, 'state-relative-paths')
    await mkdir(state, { recursive: true })

    const result = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
    })

    expect(result.output).not.toContain('not a validation worktree')
    expect(result.code).toBe(0)
    expect(existsSync(path.join(state, 'validate'))).toBe(false)
    expect(await git(context.dev, 'worktree', 'list')).not.toContain(
      path.join(state, 'validate'),
    )
  })

  it('will not promote a commit other than the one it validated', async () => {
    const context = await fixture()
    const candidate = await advanceMain(context)
    const state = path.join(context.root, 'state-moved-head')
    await mkdir(state, { recursive: true })

    // Clean is not the same as unchanged. Something moved the validation
    // worktree to another commit and left it perfectly tidy, so cleanliness
    // alone said everything was in order while a different revision had been
    // tested.
    const result = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
      PNPM_TEST_MOVE_HEAD: '1',
    })

    expect(result.code).not.toBe(0)
    expect(result.output).toContain('moved to')
    expect((await git(context.runtime, 'rev-parse', 'HEAD')).trim()).not.toBe(
      candidate,
    )
  })

  it('refuses a repository of its own standing where its worktree was', async () => {
    const context = await fixture()
    await advanceMain(context)

    // A checkout of its own keeps `.git` as a directory, not the file a linked
    // worktree leaves. Testing only for the file sent it down the
    // partial-removal path, where it was deleted outright.
    const state = path.join(context.root, 'state-foreign-repo')
    await mkdir(state, { recursive: true })
    const validate = path.join(state, 'validate')
    const interrupted = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
      PNPM_TEST_KILL: '1',
    })
    expect(interrupted.code).not.toBe(0)
    await rm(validate, { recursive: true, force: true })
    await writeFile(
      path.join(state, 'validate.owned'),
      (await readFile(path.join(state, 'validate.owned'), 'utf8')) + 'removing\n',
    )

    // Somebody puts a repository of their own at that path.
    await mkdir(validate, { recursive: true })
    await git(validate, 'init', '--initial-branch=main')
    const theirs = path.join(validate, 'theirs.txt')
    await writeFile(theirs, 'work nobody has committed\n')

    const result = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
    })

    expect(result.code).not.toBe(0)
    expect(result.output).toContain('not a validation worktree this monitor created')
    expect(existsSync(theirs)).toBe(true)
  })

  it('finds its own record when the state directory is reached through a link', async () => {
    const context = await fixture()
    await advanceMain(context)

    // Git writes down the real path. Spelling it the way the profile does left
    // the two never matching, so the monitor could not find the record it had
    // just made.
    const real = path.join(context.root, 'state-real')
    await mkdir(real, { recursive: true })
    const linked = path.join(context.root, 'state-linked')
    await symlink(real, linked)

    const result = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: linked,
    })

    expect(result.output).not.toContain('not a validation worktree')
    expect(result.code).toBe(0)
    expect(await git(context.dev, 'worktree', 'list')).not.toContain(
      path.join(real, 'validate'),
    )
  })

  it('finishes a removal of its own worktree that was interrupted partway', async () => {
    const context = await fixture()
    await advanceMain(context)

    // `git worktree remove` takes the worktree's own pointer away before it
    // has finished deleting. Ownership is read from that pointer while the
    // directory still stands, so a run killed inside that window left a
    // directory that no later run would agree to finish -- promotion wedged
    // until somebody cleared it by hand.
    const state = path.join(context.root, 'state-partial-removal')
    await mkdir(state, { recursive: true })
    const validate = path.join(state, 'validate')
    const interrupted = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
      PNPM_TEST_KILL: '1',
    })
    expect(interrupted.code).not.toBe(0)

    // Exactly what a removal killed partway through leaves: files still here,
    // the pointer already gone.
    await rm(path.join(validate, '.git'), { force: true })
    await writeFile(path.join(state, 'validate.owned'), (await readFile(path.join(state, 'validate.owned'), 'utf8')) + 'removing\n')

    await writeFile(path.join(context.dev, 'change.txt'), 'again')
    await git(context.dev, 'add', '-A')
    await git(context.dev, 'commit', '-m', 'again')
    await git(context.dev, 'push', 'origin', 'main')

    const next = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
    })
    expect(next.output).not.toContain('not a validation worktree')
    expect(next.code).toBe(0)
    expect(existsSync(validate)).toBe(false)
  })

  it('refuses a replacement checkout standing where its worktree was', async () => {
    const context = await fixture()
    await advanceMain(context)

    // A record left behind says the monitor owned this path. Somebody has put
    // a checkout there since. Matching the record's stored path alone lets it
    // vouch for whatever occupies the path now, and cleanup deletes outright.
    const state = path.join(context.root, 'state-replacement')
    await mkdir(state, { recursive: true })
    const validate = path.join(state, 'validate')
    const interrupted = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
      PNPM_TEST_KILL: '1',
    })
    expect(interrupted.code).not.toBe(0)

    // The worktree goes; its record stays, which is what an interrupted run
    // leaves behind.
    await rm(validate, { recursive: true, force: true })
    await mkdir(validate, { recursive: true })
    const theirs = path.join(validate, 'work.txt')
    await writeFile(theirs, 'somebody put this here\n')
    await writeFile(path.join(validate, '.git'), 'gitdir: /somewhere/else\n')

    const result = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
    })

    expect(result.code).not.toBe(0)
    expect(result.output).toContain('not a validation worktree this monitor created')
    expect(existsSync(theirs)).toBe(true)
  })

  it('will not promote a validation worktree it could not read', async () => {
    const context = await fixture()
    const candidate = await advanceMain(context)
    const state = path.join(context.root, 'state-unreadable')
    await mkdir(state, { recursive: true })

    // The gate that says the tested worktree is still the commit being
    // promoted. Reading only git's output treated a worktree it could not read
    // at all as a clean one, and the candidate went out unproven.
    const result = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
      PNPM_TEST_CORRUPT_INDEX: '1',
    })

    expect(result.code).not.toBe(0)
    expect(result.output).toContain('could not be read')
    expect((await git(context.runtime, 'rev-parse', 'HEAD')).trim()).not.toBe(
      candidate,
    )
  })

  it('refuses to remove a clean worktree it did not create', async () => {
    const context = await fixture()
    await advanceMain(context)

    // Clean, registered to this repository, and still not the monitor's: a
    // detached worktree somebody made by hand can be the only reference to a
    // commit, and removing it takes that commit's last reachable name with it.
    const state = path.join(context.root, 'state-unowned-clean')
    await mkdir(state, { recursive: true })
    const validate = path.join(state, 'validate')
    await git(context.dev, 'worktree', 'add', '--detach', validate, 'HEAD')
    await writeFile(path.join(validate, 'only-here.txt'), 'unique\n')
    await git(validate, 'add', '-A')
    await git(validate, 'commit', '-m', 'only reachable from this worktree')
    const orphan = (await git(validate, 'rev-parse', 'HEAD')).trim()

    const result = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_STATE_DIR: state,
    })

    expect(result.code).not.toBe(0)
    expect(result.output).toContain('not a validation worktree this monitor created')
    // The commit is still reachable, because its worktree is still there.
    expect((await git(validate, 'rev-parse', 'HEAD')).trim()).toBe(orphan)

    await git(context.dev, 'worktree', 'remove', '--force', validate)
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
    expect(setup).toMatch(/^agentic-remote setup --release-id [A-Za-z0-9-]+$/)
  })

  it('includes the user-local bin directory when installing a candidate', async () => {
    const context = await fixture()
    const userBin = path.join(context.root, '.local', 'bin')
    await mkdir(userBin, { recursive: true })
    await stub(userBin, 'copilot', 'exit 0')
    await advanceMain(context)

    const result = await monitor(context, { REQUIRE_COPILOT: '1' })

    expect(result.code).toBe(0)
    expect(await calls(context)).toContain(
      `copilot-path ${path.join(userBin, 'copilot')}`,
    )
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
    expect(setup).toMatch(/^agentic-remote setup --role node --name worker --release-id [A-Za-z0-9-]+$/)
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

  it('removes only the failed candidate after healthy restoration and preserves ordinary rollback', async () => {
    const { context, previous, fallback, state, record } = await healthyReleaseFixture()
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const result = await monitor(context, { FAIL_CANDIDATE_HEALTH: '1' })
      expect(result.code).not.toBe(0)
      expect(await realpath(path.join(context.releases, 'current'))).toBe(previous)
      expect(await readFile(path.join(fallback, 'identity'), 'utf8')).toBe('older healthy release')
      const inventory = (await readdir(context.releases, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort()
      expect(inventory).toEqual(['older-healthy', 'previous-healthy'])
    }
    expect(await readFile(path.join(context.root, 'state', 'last-graduated-commit'), 'utf8')).toBe(state)
    expect(await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8')).toBe(record)
    await run(AGENTIC_REMOTE, ['rollback'], { env: context.env })
    expect(await realpath(path.join(context.releases, 'current'))).toBe(fallback)
    expect(await readFile(path.join(previous, 'identity'), 'utf8')).toBe('previous healthy release')
  })

  it('recovers the recorded known-good baseline after a crash following candidate activation', async () => {
    const { context, previous, fallback, state, record } = await healthyReleaseFixture(true)
    const previousCommit = await git(context.runtime, 'rev-parse', 'HEAD')
    const candidate = await git(context.dev, 'rev-parse', 'HEAD')
    const current = path.join(context.releases, 'current')
    const pendingPath = path.join(context.root, 'state', 'pending-promotion')
    const interrupted = await monitor(context, { SETUP_KILL_AFTER_ACTIVATION: '1' })
    expect(interrupted.code).not.toBe(0)
    const unverified = await realpath(current)
    expect(unverified).not.toBe(previous)
    expect(existsSync(path.join(unverified, 'fixture-candidate'))).toBe(true)
    const pending = existsSync(pendingPath)
      ? JSON.parse(await readFile(pendingPath, 'utf8'))
      : undefined

    const recovery = await monitor(context, { FAIL_CANDIDATE_HEALTH: '1' })
    expect(recovery.code).not.toBe(0)
    const restored = await realpath(current)
    const restoredSource = await git(context.runtime, 'rev-parse', 'HEAD')
    const installed = path.join(context.root, '.local', 'bin', 'agentic-remote')
    const manual: string[] = []
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await run(installed, ['rollback'], { env: context.env })
      manual.push(await realpath(current))
    }

    expect.soft(pending).toMatchObject({
      phase: 'prepared',
      candidate_commit: candidate,
      candidate_release: unverified,
      previous_commit: previousCommit,
      previous_release: previous,
    })
    expect.soft(restored).toBe(previous)
    expect.soft(restoredSource).toBe(previousCommit)
    expect.soft(manual).toEqual([fallback, previous])
    expect((await calls(context)).filter((line) => line.startsWith('agentic-remote setup'))).toHaveLength(1)
    expect(await readFile(path.join(context.root, 'state', 'last-graduated-commit'), 'utf8')).toBe(state)
    expect(await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8')).toBe(record)
    expect(await readFile(path.join(previous, 'identity'), 'utf8')).toBe('previous healthy release')
    expect(await readFile(path.join(fallback, 'identity'), 'utf8')).toBe('older healthy release')
    expect(existsSync(pendingPath)).toBe(false)
  })

  it('does not adopt an unrecorded runtime from an older monitor that left no journal', async () => {
    const { context, previous, state, record } = await healthyReleaseFixture(true)
    const candidate = await git(context.dev, 'rev-parse', 'HEAD')
    await git(context.runtime, 'switch', '--detach', candidate)
    await run(path.join(context.runtime, 'bin', 'agentic-remote'), ['setup'], { env: context.env })
    const unrecorded = await realpath(path.join(context.releases, 'current'))
    expect(unrecorded).not.toBe(previous)
    const result = await monitor(context, { FAIL_CANDIDATE_HEALTH: '1' })
    expect(result.code).not.toBe(0)
    expect(result.output).toContain('unrecorded runtime source has no pending promotion')
    expect(await realpath(path.join(context.releases, 'current'))).toBe(unrecorded)
    expect(await git(context.runtime, 'rev-parse', 'HEAD')).toBe(candidate)
    expect((await calls(context)).filter((line) => line.startsWith('agentic-remote setup'))).toHaveLength(1)
    expect(existsSync(path.join(context.root, 'state', 'pending-promotion'))).toBe(false)
    expect(await readFile(path.join(previous, 'identity'), 'utf8')).toBe('previous healthy release')
    expect(await readFile(path.join(context.root, 'state', 'last-graduated-commit'), 'utf8')).toBe(state)
    expect(await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8')).toBe(record)
  })

  it.each([
    ['refused', { FAIL_PENDING_PHASE: 'prepared' }],
    ['interrupted', { KILL_PENDING_PHASE: 'prepared' }],
  ])('does not activate before a %s initial journal commit', async (_reason, failure) => {
    const { context, previous, state, record } = await healthyReleaseFixture(true)
    const pending = path.join(context.root, 'state', 'pending-promotion')
    const result = await monitor(context, failure)
    expect(result.code).not.toBe(0)
    expect(await realpath(path.join(context.releases, 'current'))).toBe(previous)
    expect(await git(context.runtime, 'rev-parse', 'HEAD')).toBe(state.trim())
    expect(existsSync(pending)).toBe(false)
    expect((await calls(context)).some((line) => line.startsWith('agentic-remote setup'))).toBe(false)
    expect((await readdir(path.join(context.root, 'state')))
      .filter((name) => name.startsWith('.pending-promotion-prepared-'))).toHaveLength(1)
    expect(await readFile(path.join(context.root, 'state', 'last-graduated-commit'), 'utf8')).toBe(state)
    expect(await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8')).toBe(record)

    const retry = await monitor(context, { SETUP_EXIT: '1' })
    expect(retry.code).not.toBe(0)
    expect(await realpath(path.join(context.releases, 'current'))).toBe(previous)
    expect(await git(context.runtime, 'rev-parse', 'HEAD')).toBe(state.trim())
    expect(existsSync(pending)).toBe(false)
    expect(await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8')).toBe(record)
  })

  it.each(['local-verified', 'verified'])(
    'uses only the last durable phase after a refused %s checkpoint',
    async (phase) => {
      const { context, previous, state, record } = await healthyReleaseFixture(true)
      const candidate = await git(context.dev, 'rev-parse', 'HEAD')
      const pending = path.join(context.root, 'state', 'pending-promotion')
      const first = await monitor(context, { FAIL_PENDING_PHASE: phase })
      expect(first.code).not.toBe(0)
      const active = await realpath(path.join(context.releases, 'current'))
      expect(active).not.toBe(previous)
      expect(JSON.parse(await readFile(pending, 'utf8')).phase)
        .toBe(phase === 'local-verified' ? 'prepared' : 'local-verified')
      expect(await readFile(path.join(context.root, 'state', 'last-graduated-commit'), 'utf8')).toBe(state)
      expect(await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8')).toBe(record)
      const recovered = await monitor(context)
      expect(recovered.code === 0).toBe(phase === 'verified')
      expect(await realpath(path.join(context.releases, 'current')))
        .toBe(phase === 'verified' ? active : previous)
      expect(await readFile(path.join(previous, 'identity'), 'utf8')).toBe('previous healthy release')
      expect(await readFile(path.join(context.root, 'state', 'last-graduated-commit'), 'utf8'))
        .toBe(phase === 'verified' ? `${candidate}\n` : state)
      expect((await calls(context)).filter((line) => line.startsWith('agentic-remote setup'))).toHaveLength(1)
      expect(existsSync(pending)).toBe(false)
    },
  )

  it('resumes a locally verified downstream promotion without republishing the healthy local release', async () => {
    const { context, previous, state, record } = await healthyReleaseFixture(true)
    const candidate = await git(context.dev, 'rev-parse', 'HEAD')
    await addDownstream(context, context.remote)
    const remoteHome = path.join(context.root, 'downstream-home')
    const remoteReleases = path.join(remoteHome, '.config', 'agentic-remote', 'releases')
    await mkdir(remoteReleases, { recursive: true })
    await stub(path.join(context.root, 'bin'), 'ssh', [
      'shift',
      'command="$*"',
      'command="${command/bash -lc /bash -c }"',
      `export HOME=${JSON.stringify(remoteHome)}`,
      `export RELEASE_ROOT=${JSON.stringify(remoteReleases)}`,
      'export SETUP_EXIT="${REMOTE_SETUP_EXIT:-0}"',
      'exec bash -c "$command"',
    ].join('\n'))
    const pending = path.join(context.root, 'state', 'pending-promotion')
    const first = await monitor(context, { REMOTE_SETUP_EXIT: '1' })
    expect(first.code).not.toBe(0)
    expect(first.output).toContain('downstream promotion failed')
    const healthy = await realpath(path.join(context.releases, 'current'))
    expect(healthy).not.toBe(previous)
    expect(JSON.parse(await readFile(pending, 'utf8')).phase).toBe('local-verified')
    expect(await readFile(path.join(context.root, 'state', 'last-graduated-commit'), 'utf8')).toBe(state)
    expect(await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8')).toBe(record)
    const resumed = await monitor(context)
    expect(resumed.code).toBe(0)
    expect(await realpath(path.join(context.releases, 'current'))).toBe(healthy)
    expect(existsSync(path.join(healthy, '.promotion-failed'))).toBe(false)
    expect(await git(context.remote, 'rev-parse', 'HEAD')).toBe(candidate)
    expect((await calls(context)).filter((line) => line.startsWith('agentic-remote setup --release-id'))).toHaveLength(1)
    expect(await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8'))
      .toContain(`promoted_release=${healthy}\n`)
    expect(await readFile(path.join(previous, 'identity'), 'utf8')).toBe('previous healthy release')
    expect(existsSync(pending)).toBe(false)
  })

  it.each([
    ['before the state record', false, { KILL_BEFORE_STATE_RECORD: '1' }],
    ['after the state record', false, { KILL_AFTER_STATE_RECORD: '1' }],
    ['before the state record', true, { KILL_BEFORE_STATE_RECORD: '1' }],
    ['after the state record', true, { KILL_AFTER_STATE_RECORD: '1' }],
  ] as const)('finishes a verified promotion interrupted %s (manual rollback=%s)', async (_stage, manuallyRolledBack, failure) => {
    const { context, previous, state, record } = await healthyReleaseFixture(true)
    const candidate = await git(context.dev, 'rev-parse', 'HEAD')
    const pending = path.join(context.root, 'state', 'pending-promotion')
    const first = await monitor(context, failure)
    expect(first.code).not.toBe(0)
    const published = await realpath(path.join(context.releases, 'current'))
    expect(published).not.toBe(previous)
    expect(JSON.parse(await readFile(pending, 'utf8')).phase).toBe('verified')
    expect(await readFile(path.join(context.root, 'state', 'last-graduated-commit'), 'utf8')).toBe(state)
    const interruptedRecord = await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8')
    if ('KILL_BEFORE_STATE_RECORD' in failure) expect(interruptedRecord).toBe(record)
    else expect(interruptedRecord).toContain(`promoted_commit=${candidate}\n`)
    if (manuallyRolledBack) {
      await run(path.join(context.root, '.local', 'bin', 'agentic-remote'), ['rollback'], { env: context.env })
    }
    const restartCount = (await calls(context)).filter((line) => line === 'systemctl --user restart fixture.service').length
    const recovered = await monitor(context)
    expect(recovered.code).toBe(0)
    expect(await realpath(path.join(context.releases, 'current'))).toBe(manuallyRolledBack ? previous : published)
    expect(existsSync(path.join(published, '.promotion-failed'))).toBe(false)
    expect(await readFile(path.join(previous, 'identity'), 'utf8')).toBe('previous healthy release')
    expect(await readFile(path.join(context.root, 'state', 'last-graduated-commit'), 'utf8')).toBe(`${candidate}\n`)
    if ('KILL_AFTER_STATE_RECORD' in failure) {
      expect(await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8')).toBe(interruptedRecord)
    }
    expect((await calls(context)).filter((line) => line.startsWith('agentic-remote setup'))).toHaveLength(1)
    expect((await calls(context)).filter((line) => line === 'systemctl --user restart fixture.service')).toHaveLength(restartCount)
    expect(existsSync(pending)).toBe(false)
  })

  it('keeps the same journal and marker-aware source through repeated recovery failures', async () => {
    const { context, previous, fallback, state, record } = await healthyReleaseFixture(true)
    const candidate = await git(context.dev, 'rev-parse', 'HEAD')
    const pending = path.join(context.root, 'state', 'pending-promotion')
    expect((await monitor(context, { SETUP_KILL_AFTER_ACTIVATION: '1' })).code).not.toBe(0)
    const journal = await readFile(pending, 'utf8')
    const failed = await realpath(path.join(context.releases, 'current'))
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const result = await monitor(context, { FAIL_POINTER_RESTORE: '1' })
      expect(result.code).not.toBe(0)
      expect(await realpath(path.join(context.releases, 'current'))).toBe(failed)
      expect(await readFile(pending, 'utf8')).toBe(journal)
      expect(await git(context.runtime, 'rev-parse', 'HEAD')).toBe(candidate)
      expect(await readFile(path.join(failed, '.promotion-failed'), 'utf8')).toBe(`${candidate}\n`)
    }
    const unrelated = path.join(context.root, 'operator-state')
    await mkdir(unrelated)
    await writeFile(path.join(unrelated, 'keep.txt'), 'do not remove')
    await symlink(unrelated, `${context.releases}.rejected`)
    for (let attempt = 0; attempt < 2; attempt += 1) {
      expect((await monitor(context)).code).not.toBe(0)
      expect(await realpath(path.join(context.releases, 'current'))).toBe(previous)
      expect(await git(context.runtime, 'rev-parse', 'HEAD')).toBe(candidate)
      expect(await readFile(pending, 'utf8')).toBe(journal)
    }
    await rm(`${context.releases}.rejected`)
    expect((await monitor(context)).code).not.toBe(0)
    expect(await realpath(path.join(context.releases, 'current'))).toBe(previous)
    expect(await git(context.runtime, 'rev-parse', 'HEAD')).toBe(state.trim())
    expect(existsSync(failed)).toBe(false)
    expect(existsSync(path.join(`${context.releases}.rejected`, path.basename(failed), '.promotion-failed'))).toBe(true)
    expect(existsSync(pending)).toBe(false)
    expect(await readFile(path.join(unrelated, 'keep.txt'), 'utf8')).toBe('do not remove')
    expect(await readFile(path.join(fallback, 'identity'), 'utf8')).toBe('older healthy release')
    expect(await readFile(path.join(context.root, 'state', 'last-graduated-commit'), 'utf8')).toBe(state)
    expect(await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8')).toBe(record)
    expect((await calls(context)).filter((line) => line.startsWith('agentic-remote setup'))).toHaveLength(1)
  }, 15000)

  it('reconciles an unverified promotion after manual rollback already restored the known-good pointer', async () => {
    const { context, previous, state, record } = await healthyReleaseFixture(true)
    expect((await monitor(context, { SETUP_KILL_AFTER_ACTIVATION: '1' })).code).not.toBe(0)
    const failed = await realpath(path.join(context.releases, 'current'))
    await run(path.join(context.root, '.local', 'bin', 'agentic-remote'), ['rollback'], { env: context.env })
    expect(await realpath(path.join(context.releases, 'current'))).toBe(previous)
    expect((await monitor(context)).code).not.toBe(0)
    expect(await realpath(path.join(context.releases, 'current'))).toBe(previous)
    expect(await git(context.runtime, 'rev-parse', 'HEAD')).toBe(state.trim())
    expect(existsSync(failed)).toBe(false)
    expect(existsSync(path.join(`${context.releases}.rejected`, path.basename(failed), '.promotion-failed'))).toBe(true)
    expect(await readFile(path.join(previous, 'identity'), 'utf8')).toBe('previous healthy release')
    expect(await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8')).toBe(record)
  })

  it.each(['truncated', 'foreign-runtime', 'self-baseline'] as const)(
    'refuses a %s committed journal without changing release or source',
    async (kind) => {
      const { context, previous, state, record } = await healthyReleaseFixture(true)
      const pending = path.join(context.root, 'state', 'pending-promotion')
      const candidate = await git(context.dev, 'rev-parse', 'HEAD')
      const release = path.join(context.releases, 'pending-candidate')
      const contents = kind === 'truncated' ? '{"version":1,' : JSON.stringify({
        version: 1, phase: 'prepared',
        candidate_commit: candidate, previous_commit: state.trim(),
        candidate_release: release,
        previous_release: kind === 'self-baseline' ? release : previous,
        runtime_root: kind === 'foreign-runtime' ? context.dev : context.runtime,
        release_root: context.releases,
      })
      await writeFile(pending, contents)
      const result = await monitor(context)
      expect(result.code).not.toBe(0)
      expect(result.output).toContain('could not read the pending promotion')
      expect(await readFile(pending, 'utf8')).toBe(contents)
      expect(await realpath(path.join(context.releases, 'current'))).toBe(previous)
      expect(await git(context.runtime, 'rev-parse', 'HEAD')).toBe(state.trim())
      expect(await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8')).toBe(record)
      expect(await calls(context)).toEqual([])
    },
  )

  it('preserves a healthy current release selected outside the pending operation', async () => {
    const { context, previous, fallback, state, record } = await healthyReleaseFixture(true)
    expect((await monitor(context, { SETUP_KILL_AFTER_ACTIVATION: '1' })).code).not.toBe(0)
    const failed = await realpath(path.join(context.releases, 'current'))
    const pending = path.join(context.root, 'state', 'pending-promotion')
    const journal = await readFile(pending, 'utf8')
    await rm(path.join(context.releases, 'current'))
    await symlink(fallback, path.join(context.releases, 'current'))
    const result = await monitor(context)
    expect(result.code).not.toBe(0)
    expect(result.output).toContain('current release changed outside the pending promotion')
    expect(await realpath(path.join(context.releases, 'current'))).toBe(fallback)
    expect(await readFile(path.join(fallback, 'identity'), 'utf8')).toBe('older healthy release')
    expect(await readFile(path.join(previous, 'identity'), 'utf8')).toBe('previous healthy release')
    expect(existsSync(failed)).toBe(false)
    expect(await readFile(pending, 'utf8')).toBe(journal)
    expect(await readFile(path.join(context.root, 'state', 'last-graduated-commit'), 'utf8')).toBe(state)
    expect(await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8')).toBe(record)
  })

  it('preserves an unrelated clean source commit while a promotion is pending', async () => {
    const { context, state } = await healthyReleaseFixture(true)
    expect((await monitor(context, { SETUP_KILL_AFTER_ACTIVATION: '1' })).code).not.toBe(0)
    const active = await realpath(path.join(context.releases, 'current'))
    const pending = path.join(context.root, 'state', 'pending-promotion')
    const journal = await readFile(pending, 'utf8')
    await writeFile(path.join(context.runtime, 'operator.txt'), 'unrelated operator work')
    await git(context.runtime, 'add', 'operator.txt')
    await git(context.runtime, 'commit', '-m', 'operator work')
    const operatorCommit = await git(context.runtime, 'rev-parse', 'HEAD')
    const result = await monitor(context)
    expect(result.code).not.toBe(0)
    expect(result.output).toContain('runtime source changed outside the pending promotion')
    expect(await git(context.runtime, 'rev-parse', 'HEAD')).toBe(operatorCommit)
    expect(await realpath(path.join(context.releases, 'current'))).toBe(active)
    expect(await readFile(path.join(context.runtime, 'operator.txt'), 'utf8')).toBe('unrelated operator work')
    expect(await readFile(pending, 'utf8')).toBe(journal)
    expect(await readFile(path.join(context.root, 'state', 'last-graduated-commit'), 'utf8')).toBe(state)
  })

  it('does not follow a rejected-marker symlink while recovering a pending candidate', async () => {
    const { context, previous, state } = await healthyReleaseFixture(true)
    expect((await monitor(context, { SETUP_KILL_AFTER_ACTIVATION: '1' })).code).not.toBe(0)
    const candidate = await realpath(path.join(context.releases, 'current'))
    const pending = path.join(context.root, 'state', 'pending-promotion')
    const journal = await readFile(pending, 'utf8')
    const unrelated = path.join(context.root, 'operator-state.txt')
    await writeFile(unrelated, 'unrelated state')
    await symlink(unrelated, path.join(candidate, '.promotion-failed'))
    const result = await monitor(context)
    expect(result.code).not.toBe(0)
    expect(result.output).toContain('could not mark the pending candidate')
    expect(await realpath(path.join(context.releases, 'current'))).toBe(candidate)
    expect(await readFile(unrelated, 'utf8')).toBe('unrelated state')
    expect(await readFile(pending, 'utf8')).toBe(journal)
    expect(await readFile(path.join(previous, 'identity'), 'utf8')).toBe('previous healthy release')
    expect(await readFile(path.join(context.root, 'state', 'last-graduated-commit'), 'utf8')).toBe(state)
  })

  it('quarantines a rejected candidate after manual rollback restores a healthy current release', async () => {
    const { context, previous, fallback, state, record } = await healthyReleaseFixture(true)
    const candidate = await git(context.dev, 'rev-parse', 'HEAD')
    const result = await monitor(context, { FAIL_CANDIDATE_HEALTH: '1', FAIL_POINTER_RESTORE: '1' })
    expect(result.code).not.toBe(0)
    const current = path.join(context.releases, 'current')
    const failed = await realpath(current)
    expect(await readFile(path.join(failed, '.promotion-failed'), 'utf8')).toBe(`${candidate}\n`)
    const installed = path.join(context.root, '.local', 'bin', 'agentic-remote')
    await run(installed, ['rollback'], { env: context.env })
    expect(await realpath(current)).toBe(previous)
    expect(existsSync(failed)).toBe(false)
    expect(await readFile(path.join(`${context.releases}.rejected`, path.basename(failed), '.promotion-failed'), 'utf8'))
      .toBe(`${candidate}\n`)
    await git(context.runtime, 'switch', '--detach', state.trim())
    await run(installed, ['rollback'], { env: context.env })
    expect(await realpath(current)).toBe(fallback)
    expect(await readFile(path.join(previous, 'identity'), 'utf8')).toBe('previous healthy release')
    expect(await readFile(path.join(context.root, 'state', 'last-graduated-commit'), 'utf8')).toBe(state)
    expect(await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8')).toBe(record)
  })

  it('keeps the installed marker-aware CLI when pointer restoration fails before repeated manual rollback', async () => {
    const { context, previous, fallback, state, record } = await healthyReleaseFixture(true)
    const candidate = await git(context.dev, 'rev-parse', 'HEAD')
    const installed = path.join(context.root, '.local', 'bin', 'agentic-remote')
    const current = path.join(context.releases, 'current')
    const result = await monitor(context, { FAIL_CANDIDATE_HEALTH: '1', FAIL_POINTER_RESTORE: '1' })

    expect(result.code).not.toBe(0)
    expect(result.output).toContain('could not restore the previous release pointer')
    expect(result.output).toContain('could not fully restore the previous runtime')
    const failed = await realpath(current)
    expect(await readFile(path.join(failed, '.promotion-failed'), 'utf8')).toBe(`${candidate}\n`)
    expect(await readFile(path.join(failed, 'fixture-candidate'), 'utf8')).toBe('candidate')
    const sourceAfterFailure = await git(context.runtime, 'rev-parse', 'HEAD')
    const activations: string[] = []
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await run(installed, ['rollback'], { env: context.env })
      activations.push(await realpath(current))
    }

    expect.soft(sourceAfterFailure).toBe(candidate)
    expect.soft(activations).toEqual([previous, fallback, previous])
    expect((await calls(context)).filter((line) => line.startsWith('cli-version ')))
      .toEqual(Array(4).fill('cli-version marker-aware'))
    expect(await readFile(path.join(previous, 'identity'), 'utf8')).toBe('previous healthy release')
    expect(await readFile(path.join(fallback, 'identity'), 'utf8')).toBe('older healthy release')
    expect(existsSync(failed)).toBe(false)
    expect(await readFile(path.join(`${context.releases}.rejected`, path.basename(failed), '.promotion-failed'), 'utf8'))
      .toBe(`${candidate}\n`)
    expect(await readFile(path.join(context.root, 'state', 'last-graduated-commit'), 'utf8')).toBe(state)
    expect(await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8')).toBe(record)
  })

  it.each([
    ['restored health fails', { CURL_EXIT: '7' }],
    ['candidate removal fails', { FAIL_CANDIDATE_HEALTH: '1' }],
  ])('keeps the installed marker-aware CLI when %s and inactive quarantine is unsafe', async (_reason, failure) => {
    const { context, previous, fallback, state, record } = await healthyReleaseFixture(true)
    const candidate = await git(context.dev, 'rev-parse', 'HEAD')
    const unrelated = path.join(context.root, 'unrelated')
    await mkdir(unrelated)
    await writeFile(path.join(unrelated, 'keep.txt'), 'unrelated user state')
    await symlink(unrelated, `${context.releases}.rejected`)
    const realRm = (await run('sh', ['-c', 'command -v rm'])).stdout.trim()
    await stub(path.join(context.root, 'bin'), 'rm', [
      'if [[ -f "${@: -1}/.promotion-failed" ]]; then exit 1; fi',
      `exec ${JSON.stringify(realRm)} "$@"`,
    ].join('\n'))

    const result = await monitor(context, failure)
    expect(result.code).not.toBe(0)
    const current = path.join(context.releases, 'current')
    expect(await realpath(current)).toBe(previous)
    const inventory = (await readdir(context.releases, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(context.releases, entry.name))
    const failed = inventory.find((release) => release !== previous && release !== fallback)
    expect(failed).toBeDefined()
    expect(await readFile(path.join(failed!, '.promotion-failed'), 'utf8')).toBe(`${candidate}\n`)
    const sourceAfterFailure = await git(context.runtime, 'rev-parse', 'HEAD')
    const installed = path.join(context.root, '.local', 'bin', 'agentic-remote')
    const activations: string[] = []
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await expect(run(installed, ['rollback'], { env: context.env })).rejects.toThrow('could not quarantine')
      activations.push(await realpath(current))
    }

    expect.soft(sourceAfterFailure).toBe(candidate)
    expect.soft(activations).toEqual([previous, previous, previous])
    expect(await realpath(`${context.releases}.rejected`)).toBe(unrelated)
    expect(await readFile(path.join(unrelated, 'keep.txt'), 'utf8')).toBe('unrelated user state')
    expect(await readFile(path.join(previous, 'identity'), 'utf8')).toBe('previous healthy release')
    expect(await readFile(path.join(fallback, 'identity'), 'utf8')).toBe('older healthy release')
    expect(await readFile(path.join(context.root, 'state', 'last-graduated-commit'), 'utf8')).toBe(state)
    expect(await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8')).toBe(record)
  })

  it.each([
    ['pointer restoration fails', { FAIL_CANDIDATE_HEALTH: '1', FAIL_POINTER_RESTORE: '1' }],
    ['restored health cannot be verified', { CURL_EXIT: '7' }],
    ['the restored service cannot restart', { FAIL_CANDIDATE_HEALTH: '1', SERVICE_RESTART_EXIT: '1' }],
  ])('retains and excludes the failed candidate when %s', async (_reason, failure) => {
    const { context, previous, fallback, state, record } = await healthyReleaseFixture(true)
    const result = await monitor(context, failure)
    expect(result.code).not.toBe(0)
    const inventory = (await readdir(context.releases, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(context.releases, entry.name))
    const retained = inventory.find((release) => release !== previous && release !== fallback)
    const quarantined = 'FAIL_POINTER_RESTORE' in failure
      ? []
      : (await readdir(`${context.releases}.rejected`))
        .map((name) => path.join(`${context.releases}.rejected`, name))
    const failed = retained || quarantined[0]
    expect(failed).toBeDefined()
    expect(existsSync(path.join(failed!, 'fixture-candidate'))).toBe(true)
    expect(existsSync(path.join(failed!, '.promotion-failed'))).toBe(true)
    expect(await realpath(path.join(context.releases, 'current'))).toBe(
      'FAIL_POINTER_RESTORE' in failure ? failed : previous,
    )
    expect(result.output).toContain('could not fully restore the previous runtime')
    expect(await readFile(path.join(context.root, 'state', 'last-graduated-commit'), 'utf8')).toBe(state)
    expect(await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8')).toBe(record)
    const installed = path.join(context.root, '.local', 'bin', 'agentic-remote')
    await run(installed, ['rollback'], { env: context.env })
    if ('FAIL_POINTER_RESTORE' in failure) {
      expect(await realpath(path.join(context.releases, 'current'))).toBe(previous)
      await run(installed, ['rollback'], { env: context.env })
    }
    expect(await realpath(path.join(context.releases, 'current'))).toBe(fallback)
    expect(existsSync('FAIL_POINTER_RESTORE' in failure
      ? path.join(`${context.releases}.rejected`, path.basename(failed!))
      : failed!)).toBe(true)
  })

  it.each([
    ['fails after publication', { SETUP_AFTER_PUBLISH_EXIT: '1' }],
    ['returns success without activating its candidate', { SETUP_SKIP_ACTIVATION: '1' }],
  ])('removes its unactivated candidate when setup %s', async (_name, failure) => {
    const { context, previous, fallback, state, record } = await healthyReleaseFixture()
    const result = await monitor(context, failure)
    expect(result.code).not.toBe(0)
    expect(await realpath(path.join(context.releases, 'current'))).toBe(previous)
    const inventory = (await readdir(context.releases, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
    expect(inventory).toEqual(['older-healthy', 'previous-healthy'])
    expect(await readFile(path.join(context.root, 'state', 'last-graduated-commit'), 'utf8')).toBe(state)
    expect(await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8')).toBe(record)
    await run(AGENTIC_REMOTE, ['rollback'], { env: context.env })
    expect(await realpath(path.join(context.releases, 'current'))).toBe(fallback)
  })

  it('does not mark or remove a healthy release when setup fails before publication', async () => {
    const { context, previous, fallback, state, record } = await healthyReleaseFixture()
    const result = await monitor(context, { SETUP_EXIT: '1' })
    expect(result.code).not.toBe(0)
    expect(await realpath(path.join(context.releases, 'current'))).toBe(previous)
    expect(existsSync(path.join(previous, '.promotion-failed'))).toBe(false)
    expect(existsSync(path.join(fallback, '.promotion-failed'))).toBe(false)
    expect(await readFile(path.join(previous, 'identity'), 'utf8')).toBe('previous healthy release')
    expect(await readFile(path.join(fallback, 'identity'), 'utf8')).toBe('older healthy release')
    expect(await readFile(path.join(context.root, 'state', 'last-graduated-commit'), 'utf8')).toBe(state)
    expect(await readFile(path.join(context.root, 'state', 'promotion-state'), 'utf8')).toBe(record)
  })

  it('lets an environment variable override the profile', async () => {
    const context = await fixture()
    await advanceMain(context)

    // Precedence matters for secrecy: a value can be supplied per run instead
    // of being written to a file.
    const missing = path.join(context.root, 'not-a-repository')
    const result = await monitor(context, {
      AGENTIC_REMOTE_MONITOR_DEV_ROOT: missing,
    })

    expect(result.code).not.toBe(0)
    expect(result.output).toContain(
      `not a Git repository: ${missing}`,
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
    const result = await monitor(context, {
      SETUP_CHECKOUT: base,
      SETUP_CHECKOUT_ROOT: context.remote,
    })

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
