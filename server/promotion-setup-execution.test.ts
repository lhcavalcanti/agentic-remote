import { execFile } from 'node:child_process'
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
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
  const systemctl = path.join(bin, 'systemctl')
  await writeFile(
    systemctl,
    [
      '#!/usr/bin/env bash',
      'printf "%s\\n" "$*" >>"$SYSTEMCTL_LOG"',
      'case "$*" in',
      `  *"is-enabled --quiet"*) exit ${enabled ? 0 : 1} ;;`,
      `  *"is-active --quiet"*) exit ${active ? 0 : 1} ;;`,
      'esac',
      'exit 0',
    ].join('\n'),
  )
  await chmod(systemctl, 0o755)
  return {
    root,
    calls,
    profile: path.join(config, 'promotion.env'),
    service: path.join(systemd, 'agentic-remote-promotion-monitor.service'),
    installedMonitor: path.join(install, 'promotion-monitor'),
    env: {
      ...process.env,
      AGENTIC_REMOTE_PROMOTION_HOME: root,
      PATH: `${bin}:${process.env.PATH}`,
      SYSTEMCTL_LOG: calls,
    },
  }
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
