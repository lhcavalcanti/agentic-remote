import { execFile, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { chmod, lstat, mkdir, mkdtemp, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it } from 'vitest'

const run = promisify(execFile)
const SETUP = new URL('../bin/agentic-remote-promotion-setup', import.meta.url)
  .pathname
const MONITOR = new URL('../bin/agentic-remote-promotion-monitor', import.meta.url)
  .pathname
const fixtures: string[] = []

afterEach(async () => {
  await Promise.all(
    fixtures.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

async function fixture(enabled: boolean, active: boolean) {
  const root = await mkdtemp(path.join(tmpdir(), 'promotion-setup-'))
  fixtures.push(root)
  const bin = path.join(root, 'bin')
  const config = path.join(root, '.config', 'agentic-remote')
  const systemd = path.join(root, '.config', 'systemd', 'user')
  const install = path.join(root, '.local', 'lib', 'agentic-remote')
  const calls = path.join(root, 'systemctl.log')
  await Promise.all([
    mkdir(bin, { recursive: true }),
    mkdir(config, { recursive: true }),
    mkdir(systemd, { recursive: true }),
    mkdir(install, { recursive: true }),
  ])
  await writeFile(
    path.join(config, 'promotion.env'),
    [
      `AGENTIC_REMOTE_MONITOR_HOME=${root}`,
      `AGENTIC_REMOTE_MONITOR_DEV_ROOT=${path.join(root, 'dev')}`,
      `AGENTIC_REMOTE_MONITOR_PROD_ROOT=${path.join(root, 'runtime')}`,
      `AGENTIC_REMOTE_MONITOR_RELEASE_ROOT=${path.join(root, 'releases')}`,
      'AGENTIC_REMOTE_MONITOR_SERVICE=fixture.service',
      'AGENTIC_REMOTE_MONITOR_HEALTH_URL=http://127.0.0.1:4317/health',
    ].join('\n'),
  )
  await writeFile(
    path.join(systemd, 'agentic-remote-promotion-monitor.service'),
    'TimeoutStartSec=30min\n',
  )
  await writeFile(
    path.join(systemd, 'agentic-remote-promotion-monitor.timer'),
    'OnCalendar=hourly\n',
  )
  await writeFile(
    path.join(install, 'promotion-monitor'),
    '#!/usr/bin/env bash\necho old\n',
  )
  for (const command of ['node', 'corepack']) {
    const executable = path.join(bin, command)
    await writeFile(executable, '#!/usr/bin/env bash\nexit 0\n')
    await chmod(executable, 0o755)
  }
  // Timer state lives in files so commands observe each other's effects, the
  // way a real user manager would. Disarming and arming record whether the
  // pause marker existed at that moment.
  const timer = path.join(root, 'timer-state')
  await mkdir(timer)
  if (enabled) await writeFile(path.join(timer, 'enabled'), '')
  if (active) await writeFile(path.join(timer, 'active'), '')
  const marker = path.join(
    root,
    '.local',
    'state',
    'agentic-remote-monitor',
    'promotion-paused',
  )
  const systemctl = path.join(bin, 'systemctl')
  await writeFile(
    systemctl,
    [
      '#!/usr/bin/env bash',
      'printf "%s\\n" "$*" >>"$SYSTEMCTL_LOG"',
      'pause() { [[ -e "$PAUSE_MARKER" ]] && echo paused || echo unpaused; }',
      'unit=agentic-remote-promotion-monitor',
      'case "$*" in',
      '  *"is-enabled --quiet $unit.timer") [[ -e "$TIMER_STATE/enabled" ]]; exit ;;',
      '  *"is-active --quiet $unit.timer") [[ -e "$TIMER_STATE/active" ]]; exit ;;',
      '  *"is-active --quiet $unit.service") [[ -e "$TIMER_STATE/running" ]]; exit ;;',
      '  *"disable --now $unit.timer")',
      '    printf "disarm while %s\\n" "$(pause)" >>"$SYSTEMCTL_LOG"',
      '    rm -f "$TIMER_STATE/enabled"',
      '    [[ -n "${TIMER_STUCK:-}" ]] || rm -f "$TIMER_STATE/active" ;;',
      '  *"enable --now $unit.timer")',
      '    printf "arm while %s\\n" "$(pause)" >>"$SYSTEMCTL_LOG"',
      '    touch "$TIMER_STATE/enabled" "$TIMER_STATE/active" ;;',
      '  *"enable $unit.timer") touch "$TIMER_STATE/enabled" ;;',
      '  *"restart $unit.timer") touch "$TIMER_STATE/active" ;;',
      '  *" status $unit.timer")',
      '    echo "fixture timer status"',
      '    [[ -e "$TIMER_STATE/active" ]] || exit 3 ;;',
      '  *" show "*) echo "fixture next elapse" ;;',
      'esac',
      'exit 0',
    ].join('\n'),
  )
  await chmod(systemctl, 0o755)
  const curl = path.join(bin, 'curl')
  await writeFile(curl, '#!/usr/bin/env bash\nexit "${CURL_EXIT:-0}"\n')
  await chmod(curl, 0o755)
  return {
    root,
    calls,
    marker,
    timer,
    profile: path.join(config, 'promotion.env'),
    service: path.join(systemd, 'agentic-remote-promotion-monitor.service'),
    installedMonitor: path.join(install, 'promotion-monitor'),
    env: {
      ...process.env,
      AGENTIC_REMOTE_PROMOTION_HOME: root,
      PATH: `${bin}:${process.env.PATH}`,
      SYSTEMCTL_LOG: calls,
      TIMER_STATE: timer,
      PAUSE_MARKER: marker,
    },
  }
}

type Context = Awaited<ReturnType<typeof fixture>>

async function setup(
  context: Context,
  args: string[],
  env: NodeJS.ProcessEnv = {},
): Promise<{ code: number; stdout: string; stderr: string }> {
  try {
    const { stdout, stderr } = await run(SETUP, args, {
      env: { ...context.env, ...env },
    })
    return { code: 0, stdout, stderr }
  } catch (error) {
    const failure = error as { code?: number; stdout?: string; stderr?: string }
    return {
      code: failure.code ?? 1,
      stdout: failure.stdout ?? '',
      stderr: failure.stderr ?? '',
    }
  }
}

async function systemctlCalls(context: Context): Promise<string[]> {
  if (!existsSync(context.calls)) return []
  return (await readFile(context.calls, 'utf8')).split('\n').filter(Boolean)
}

// What an external watchdog does when it finds the timer disabled.
async function rearm(context: Context): Promise<void> {
  await writeFile(path.join(context.timer, 'enabled'), '')
  await writeFile(path.join(context.timer, 'active'), '')
}

function timerArmed(context: Context): boolean {
  return (
    existsSync(path.join(context.timer, 'enabled')) ||
    existsSync(path.join(context.timer, 'active'))
  )
}

describe('promotion setup refresh', () => {
  it.each([
    ['disabled', false, false],
    ['enabled', true, true],
  ] as const)('preserves an %s timer while refreshing installed assets', async (
    _state,
    enabled,
    active,
  ) => {
    const context = await fixture(enabled, active)
    const profile = await readFile(context.profile, 'utf8')

    const result = await run(SETUP, ['refresh'], { env: context.env })

    expect(await readFile(context.profile, 'utf8')).toBe(profile)
    expect(await readFile(context.installedMonitor, 'utf8')).toBe(
      await readFile(MONITOR, 'utf8'),
    )
    expect(await readFile(context.service, 'utf8')).toContain(
      'TimeoutStartSec=60min',
    )
    expect(result.stdout).toContain(
      `timer enabled=${enabled ? 1 : 0} active=${active ? 1 : 0}`,
    )
    const calls = await readFile(context.calls, 'utf8')
    expect(calls).toContain('daemon-reload')
    if (enabled) {
      expect(calls).toContain(
        'enable agentic-remote-promotion-monitor.timer',
      )
    } else {
      expect(calls).not.toContain(
        'enable agentic-remote-promotion-monitor.timer',
      )
    }
    if (active) {
      expect(calls).toContain(
        'restart agentic-remote-promotion-monitor.timer',
      )
    } else {
      expect(calls).not.toContain(
        'restart agentic-remote-promotion-monitor.timer',
      )
    }
  })
})

describe('durable promotion pause', () => {
  it('records the pause before disarming and succeeds only once the timer is inactive', async () => {
    const context = await fixture(true, true)

    const result = await setup(context, [
      'disable',
      '--reason',
      'holding the current release for investigation',
    ])

    expect(result.code).toBe(0)
    expect(result.stdout).toContain('Local promotion monitor paused')
    expect(await readFile(context.marker, 'utf8')).toMatch(
      /^paused_at=\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ\nreason=holding the current release for investigation\n$/,
    )
    expect((await stat(context.marker)).mode & 0o777).toBe(0o600)
    // A timer that fires between disarming and recording must already see
    // the pause.
    expect(await systemctlCalls(context)).toContain('disarm while paused')
    expect(timerArmed(context)).toBe(false)
  })

  it('keeps the pause but fails when the timer is still active', async () => {
    const context = await fixture(true, true)

    const result = await setup(context, ['disable'], { TIMER_STUCK: '1' })

    expect(result.code).not.toBe(0)
    expect(result.stderr).toContain('timer is still active')
    expect(existsSync(context.marker)).toBe(true)
  })

  it('rejects a reason that would not stay on one line', async () => {
    const context = await fixture(true, true)

    const result = await setup(context, ['disable', '--reason', 'one\ntwo'])

    expect(result.code).not.toBe(0)
    expect(result.stderr).toContain('single line')
    expect(existsSync(context.marker)).toBe(false)
    expect(await systemctlCalls(context)).toEqual([])
  })

  it('keeps a pause across refresh and install, disarming a rearmed timer', async () => {
    const context = await fixture(true, true)
    expect((await setup(context, ['disable', '--reason', 'held'])).code).toBe(0)
    const marker = await readFile(context.marker, 'utf8')
    await rearm(context)
    await rm(context.calls, { force: true })

    const refreshed = await setup(context, ['refresh'])

    expect(refreshed.code).toBe(0)
    expect(refreshed.stdout).toContain('Local promotion monitor refreshed; profile preserved')
    expect(refreshed.stdout).toContain('promotion stays paused since')
    expect(await readFile(context.marker, 'utf8')).toBe(marker)
    expect(timerArmed(context)).toBe(false)
    let calls = await systemctlCalls(context)
    expect(calls).toContain('disarm while paused')
    expect(calls.some((line) => line.startsWith('arm while'))).toBe(false)
    expect(calls).not.toContain('--user enable agentic-remote-promotion-monitor.timer')
    expect(calls).not.toContain('--user restart agentic-remote-promotion-monitor.timer')

    // Provisioning may be re-run by automation, so even --enable leaves an
    // explicit pause for the operator's own enable to clear.
    await rearm(context)
    await rm(context.calls, { force: true })
    const installed = await setup(context, ['install', '--enable'])

    expect(installed.code).toBe(0)
    expect(installed.stdout).toContain('promotion stays paused since')
    expect(installed.stdout).toContain('run enable to resume')
    expect(await readFile(context.marker, 'utf8')).toBe(marker)
    expect(timerArmed(context)).toBe(false)
    calls = await systemctlCalls(context)
    expect(calls.some((line) => line.startsWith('arm while'))).toBe(false)
    expect(calls).not.toContain('--user restart agentic-remote-promotion-monitor.timer')
  })

  it('clears the pause only after the health preflight passes', async () => {
    const context = await fixture(true, true)
    expect((await setup(context, ['disable'])).code).toBe(0)

    const refused = await setup(context, ['enable'], { CURL_EXIT: '7' })

    expect(refused.code).not.toBe(0)
    expect(refused.stderr).toContain('health URL did not answer')
    expect(existsSync(context.marker)).toBe(true)
    expect(timerArmed(context)).toBe(false)

    const resumed = await setup(context, ['enable'])

    expect(resumed.code).toBe(0)
    expect(resumed.stdout).toContain('Promotion pause cleared.')
    expect(resumed.stdout).toContain('Local promotion monitor enabled.')
    expect(existsSync(context.marker)).toBe(false)
    expect(await systemctlCalls(context)).toContain('arm while unpaused')
    expect(timerArmed(context)).toBe(true)
  })

  it('reports paused, enabled, and disabled states distinctly', async () => {
    const context = await fixture(false, false)

    const disabled = await setup(context, ['status'])
    expect(disabled.code).not.toBe(0)
    expect(disabled.stdout).toContain('Promotion: disabled')

    expect((await setup(context, ['enable'])).code).toBe(0)
    const enabled = await setup(context, ['status'])
    expect(enabled.code).toBe(0)
    expect(enabled.stdout).toContain('Promotion: enabled')

    expect(
      (await setup(context, ['disable', '--reason', 'release hold'])).code,
    ).toBe(0)
    const paused = await setup(context, ['status'])
    // Intentionally paused is a healthy state for anything that watches it.
    expect(paused.code).toBe(0)
    expect(paused.stdout).toMatch(
      /Promotion: paused since \d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ\nPause reason: release hold\n/,
    )
    expect(paused.stdout).toContain('Timer: enabled=0 active=0')

    await rearm(context)
    const rearmed = await setup(context, ['status'])
    expect(rearmed.code).toBe(0)
    expect(rearmed.stdout).toContain('Promotion: paused since')
    expect(rearmed.stdout).toContain('the timer was rearmed while paused')
  })

  it.each(['a directory', 'a symlink', 'an undecodable file'] as const)(
    'fails closed when the pause marker is %s',
    async (shape) => {
      const context = await fixture(true, true)
      await mkdir(path.dirname(context.marker), { recursive: true })
      if (shape === 'a directory') {
        await mkdir(context.marker)
      } else if (shape === 'a symlink') {
        await writeFile(path.join(context.root, 'elsewhere'), 'paused_at=x\n')
        await symlink(path.join(context.root, 'elsewhere'), context.marker)
      } else {
        await writeFile(context.marker, Buffer.from([0xff, 0xfe, 0x0a]))
      }

      const status = await setup(context, ['status'])
      expect(status.code).not.toBe(0)
      expect(status.stdout).toContain('Promotion: paused (pause state could not be read')

      const refreshed = await setup(context, ['refresh'])
      expect(refreshed.code).toBe(0)
      expect(refreshed.stderr).toContain('pause state could not be read')
      expect(timerArmed(context)).toBe(false)

      // Removing what cannot be read would resume promotion on a guess.
      const enabled = await setup(context, ['enable'])
      expect(enabled.code).not.toBe(0)
      expect(enabled.stderr).toContain('could not clear the promotion pause')
      expect(timerArmed(context)).toBe(false)
      expect(existsSync(context.marker) || shape === 'a symlink').toBe(true)
      if (shape === 'a symlink') {
        expect((await lstat(context.marker)).isSymbolicLink()).toBe(true)
      }
    },
  )

  it('stops the timer when the pause cannot be recorded, and says whether it did', async () => {
    const context = await fixture(true, true)
    await mkdir(context.marker, { recursive: true })

    const stopped = await setup(context, ['disable'])
    expect(stopped.code).not.toBe(0)
    expect(stopped.stderr).toContain('could not record the promotion pause')
    expect(stopped.stderr).toContain('the timer was stopped')
    // Still the safer of the two outcomes, even without a durable pause.
    expect(timerArmed(context)).toBe(false)

    await rearm(context)
    const stuck = await setup(context, ['disable'], { TIMER_STUCK: '1' })
    expect(stuck.code).not.toBe(0)
    expect(stuck.stderr).toContain('could not record the promotion pause')
    expect(stuck.stderr).toContain('timer is still active')
    expect(stuck.stderr).not.toContain('the timer was stopped')
  })

  it('fails a paused refresh or install that cannot disarm a rearmed timer', async () => {
    const context = await fixture(true, true)
    expect((await setup(context, ['disable'])).code).toBe(0)
    await rearm(context)

    for (const command of [['refresh'], ['install']]) {
      const result = await setup(context, command, { TIMER_STUCK: '1' })
      expect(result.code).not.toBe(0)
      expect(result.stderr).toContain('timer could not be disarmed')
      expect(result.stdout).not.toContain('timer left disabled')
      expect(existsSync(context.marker)).toBe(true)
    }
    expect(await readFile(context.installedMonitor, 'utf8')).toBe(
      await readFile(MONITOR, 'utf8'),
    )
  })

  it('reports a promotion that started before the pause was recorded', async () => {
    const context = await fixture(true, true)
    const state = path.dirname(context.marker)
    await mkdir(state, { recursive: true })
    const ready = path.join(context.root, 'checkpoint-held')
    // The monitor's graduation checkpoint: it holds the pause lock from its
    // last pause check until its pending journal exists.
    const checkpoint = spawn(
      'flock',
      [
        path.join(state, 'pause.lock'),
        'bash',
        '-c',
        'touch "$1"; sleep 1; printf "{}\\n" >"$2"',
        '_',
        ready,
        path.join(state, 'pending-promotion'),
      ],
      { stdio: 'ignore' },
    )
    const exited = new Promise((resolve) => checkpoint.once('exit', resolve))
    while (!existsSync(ready)) await new Promise((resolve) => setTimeout(resolve, 20))

    const result = await setup(context, ['disable'])
    await exited

    expect(result.code).toBe(0)
    expect(result.stdout).toContain('A promotion transaction had already started')
  })

  it('makes a forced service start of the monitor exit without changes', async () => {
    const context = await fixture(true, true)
    expect((await setup(context, ['disable', '--reason', 'held'])).code).toBe(0)
    await rearm(context)

    // What `systemctl --user start` of the service runs. The development and
    // runtime roots do not even exist, so any work past the pause would fail.
    const { stdout } = await run(MONITOR, ['run'], {
      env: {
        ...context.env,
        HOME: context.root,
        AGENTIC_REMOTE_MONITOR_PROFILE: context.profile,
      },
    })

    expect(stdout).toMatch(
      /promotion is paused since \d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ: held; skipping this run/,
    )
    expect(existsSync(path.join(context.root, 'dev'))).toBe(false)
  })
})
