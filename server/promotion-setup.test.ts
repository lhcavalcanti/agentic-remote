import { execFile } from 'node:child_process'
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it } from 'vitest'

const exec = promisify(execFile)
const fixtures: string[] = []

afterEach(async () => {
  await Promise.all(
    fixtures.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

function shellFunction(script: string, name: string): string {
  return script.match(new RegExp(`^${name}\\(\\) \\{[\\s\\S]*?^\\}`, 'm'))?.[0] ?? ''
}

async function setupFixture() {
  const parent = path.join(process.cwd(), '.agentic-remote')
  await mkdir(parent, { recursive: true })
  const root = await mkdtemp(path.join(parent, 'voice-setup-test-'))
  fixtures.push(root)
  const repository = path.join(root, 'repository')
  const config = path.join(root, 'config')
  const environment = path.join(config, 'environment')
  await Promise.all([
    mkdir(repository, { recursive: true }),
    mkdir(config, { recursive: true }),
  ])
  await writeFile(
    environment,
    [
      'HOST=127.0.0.1',
      'PORT=4317',
      'AGENTIC_REMOTE_ROLE=hub',
      'AGENTIC_REMOTE_NODE_NAME=fixture',
      'AGENTIC_REMOTE_DEVTUNNEL_ID=fixture.usw2',
      'AGENTIC_REMOTE_ORACLE_VOICE=on',
      'AGENTIC_REMOTE_VOICE_COMPUTER=',
      'AGENTIC_REMOTE_VOICE_STT_PROFILE=nemotron',
      'AGENTIC_REMOTE_VOICE_LANGUAGE=pt-BR',
      'AGENTIC_REMOTE_VOICE_THREADS=4',
      'AGENTIC_REMOTE_VOICE_ENDPOINT_MS=900',
      'AGENTIC_REMOTE_VOICE_STT_MODEL_DIR=models/stt',
      'AGENTIC_REMOTE_VOICE_TTS_ENGINE=sherpa-vits',
      'AGENTIC_REMOTE_VOICE_TTS_MODEL=models/voice.onnx',
      'AGENTIC_REMOTE_VOICE_TTS_CONFIG=models/voice.onnx.json',
      'AGENTIC_REMOTE_VOICE_TTS_TOKENS=models/tokens.txt',
      'AGENTIC_REMOTE_VOICE_TTS_DATA_DIR=models/espeak-ng-data',
      'AGENTIC_REMOTE_VOICE_TRANSCRIPT=private words',
      'AGENTIC_REMOTE_NODE_TOKEN=do-not-print',
    ].join('\n') + '\n',
  )
  await chmod(environment, 0o600)
  const script = await readFile(
    new URL('../bin/agentic-remote', import.meta.url),
    'utf8',
  )
  const functions = [
    'config_value',
    'validate_host',
    'validate_port',
    'validate_role',
    'validate_name',
    'derived_origins',
    'append_preserved_voice_configuration',
    'setup_service',
  ].map((name) => shellFunction(script, name)).filter(Boolean).join('\n')
  const curlMarker = path.join(root, 'curl-called')
  const runner = path.join(root, 'run-setup')
  await writeFile(
    runner,
    [
      '#!/usr/bin/env bash',
      'set -Eeuo pipefail',
      'die() { printf "agentic-remote: %s\\n" "$*" >&2; exit 1; }',
      'require_command() { :; }',
      'pnpm() { :; }',
      'publish_release() { :; }',
      'write_service() { :; }',
      'refresh_promotion_lifecycle_if_installed() { :; }',
      'enable_linger() { :; }',
      'quarantine_inactive_rejected_releases() { :; }',
      'systemctl() { :; }',
      'curl() { touch "$CURL_MARKER"; return 99; }',
      functions,
      'setup_service --name fixture',
    ].join('\n'),
  )
  await chmod(runner, 0o755)
  const run = () => exec(runner, {
    env: {
      ...process.env,
      HOME: root,
      REPO_ROOT: repository,
      CONFIG_DIR: config,
      ENV_FILE: environment,
      SYSTEMD_DIR: path.join(root, 'systemd'),
      COMMAND_LINK: path.join(root, 'agentic-remote'),
      SERVICE_NAME: 'fixture.service',
      CURL_MARKER: curlMarker,
    },
  })
  return { environment, curlMarker, run }
}

// Behavior of the monitor is covered by executing it in
// server/promotion-monitor.test.ts. What remains here are assertions about
// shipped artifacts that are not executed: the profile template, the systemd
// units, and the absence of installation-specific values.
describe('reproducible promotion setup', () => {
  it('keeps the promotion runner profile-driven and validation-gated', async () => {
    const script = await readFile(
      new URL('../bin/agentic-remote-promotion-monitor', import.meta.url),
      'utf8',
    )

    expect(script).toContain('AGENTIC_REMOTE_MONITOR_PROFILE')
    // A private remote authenticates through the GitHub CLI's credential
    // helper, which is Git authentication and not hosted CI.
    expect(script).toContain('AGENTIC_REMOTE_MONITOR_GH_CONFIG_DIR')
    expect(script).not.toContain('gh run')
    expect(script).toContain('git -C "$DEV_ROOT" pull --ff-only')
    expect(script).toContain('running validation tests')
    const testConfig = await readFile(
      new URL('../vite.config.ts', import.meta.url),
      'utf8',
    )
    expect(testConfig).toContain('maxWorkers: 1')
    expect(testConfig).toContain('testTimeout: 30_000')
    // Validation belongs somewhere of its own: the development checkout can
    // sit on a filesystem chosen for working rather than for running a suite.
    expect(script).toContain('git -C "$DEV_ROOT" worktree add --detach')
    expect(script).toContain('git -C "$PROD_ROOT" switch --detach "$candidate_commit"')
    expect(script).toContain('"$RELEASE_ROOT/current"')
    expect(script).toContain('production runtime health check failed after graduation')
  })

  it('stays single-machine when no downstream host is configured', async () => {
    const script = await readFile(
      new URL('../bin/agentic-remote-promotion-monitor', import.meta.url),
      'utf8',
    )
    const example = await readFile(
      new URL('../config/agentic-remote-promotion.env.example', import.meta.url),
      'utf8',
    )

    expect(script).toContain('[[ -n "$DOWNSTREAM_HOSTS" ]] || return 0')
    expect(script).toContain('[[ -z "$DOWNSTREAM_HOSTS" ]] || require_command ssh')

    const settings = example
      .split('\n')
      .filter((line) => line.trim() && !line.trimStart().startsWith('#'))
    expect(settings).toContain('AGENTIC_REMOTE_MONITOR_DOWNSTREAM_HOSTS=')
    expect(settings).toContain('AGENTIC_REMOTE_MONITOR_DOWNSTREAM_ROOT=')
  })

  it('requires only the tools promotion actually runs', async () => {
    const script = await readFile(
      new URL('../bin/agentic-remote-promotion-monitor', import.meta.url),
      'utf8',
    )

    // Validation moved into this script when hosted CI was dropped, so nothing
    // calls the GitHub CLI any more. Requiring it would fail an otherwise
    // healthy run on a host that has no reason to install it.
    expect(script).not.toContain('require_command gh')
    expect(script).not.toMatch(/\bgh (run|api|workflow|pr)\b/)
  })

  it('keeps machine-specific hosts and accounts out of the repository', async () => {
    const tracked = [
      '../bin/agentic-remote-promotion-monitor',
      '../bin/agentic-remote-promotion-setup',
      '../config/agentic-remote-promotion.env.example',
      '../docs/deployment-promotion.md',
      '../.github/copilot-instructions.md',
      '../.github/skills/agentic-remote-navigation/SKILL.md',
      '../README.md',
    ]

    for (const relative of tracked) {
      const contents = await readFile(new URL(relative, import.meta.url), 'utf8')
      // A private address, hostname, or operator SSH alias here would make the
      // repository describe one installation instead of any installation.
      expect(contents).not.toMatch(/\b10\.0\.0\.\d{1,3}\b/)
      expect(contents).not.toMatch(/lcavalcanti/i)
      expect(contents).not.toMatch(/homelab/i)
    }
  })

  it('refuses to arm the timer until the health URL answers', async () => {
    const script = await readFile(
      new URL('../bin/agentic-remote-promotion-setup', import.meta.url),
      'utf8',
    )

    expect(script).toContain('AGENTIC_REMOTE_MONITOR_HEALTH_URL in $PROFILE_DEST before enabling')
    expect(script).toContain('health URL did not answer: $health_url')
    // An already-active timer keeps its original schedule, so enabling must
    // restart it or a changed unit silently does not take effect.
    expect(script).toContain('systemctl --user restart "$TIMER_NAME"')
  })

  it('ships a profile that must be completed before it can be armed', async () => {
    const example = await readFile(
      new URL('../config/agentic-remote-promotion.env.example', import.meta.url),
      'utf8',
    )

    const settings = example
      .split('\n')
      .filter((line) => line.trim() && !line.trimStart().startsWith('#'))

    expect(settings).toContain('AGENTIC_REMOTE_MONITOR_HEALTH_URL=')
    expect(settings.some((line) => line.includes('/api/health'))).toBe(false)

    for (const key of ['HOST', 'PORT', 'ROLE', 'NAME']) {
      expect(settings).toContain(`AGENTIC_REMOTE_MONITOR_${key}=`)
    }
  })

  it('installs an opt-in persistent local systemd timer', async () => {
    const script = await readFile(
      new URL('../bin/agentic-remote-promotion-setup', import.meta.url),
      'utf8',
    )

    expect(script).toContain('Local promotion monitor installed and disabled by default.')
    // A monotonic-only schedule can leave an enabled timer with no next
    // elapse, so it must be a calendar schedule for Persistent= to apply.
    expect(script).toContain('OnCalendar=*-*-* 0/2:00:00')
    expect(script).toContain('Persistent=true')
    expect(script).not.toContain('OnUnitActiveSec=')
    expect(script).not.toContain('OnBootSec=')
    // Validation plus graduation measured 39 minutes and keeps growing, and a
    // timeout can kill the unit after setup replaced the service, so the
    // budget keeps several times that cost in reserve.
    expect(script).toContain('TimeoutStartSec=180min')
    expect(script).toContain('Local promotion monitor refreshed; profile preserved')
    expect(script).toContain('systemctl --user is-enabled --quiet "$TIMER_NAME"')
    expect(script).toContain('systemctl --user is-active --quiet "$TIMER_NAME"')
    expect(script).toContain('install_monitor_binary')
    expect(script).toContain('Environment=$(systemd_quote "AGENTIC_REMOTE_MONITOR_PROFILE=$PROFILE_DEST")')
    expect(script).toContain('--create-runtime')
    expect(script).toContain('git -C "$dev_root" worktree add --detach "$prod_root" HEAD')
    expect(script).toContain('replace the placeholders in the profile before installing it')
    expect(script).toContain('preserving profile and state')

    // systemctl show prints Environment= entries, so the units must not be
    // more readable than the profile they point at.
    expect(script).toContain('chmod 0600 "$service_temporary" "$timer_temporary"')
    expect(script).toContain('mv -f -- "$service_temporary" "$SERVICE_FILE"')
    expect(script).toContain('mv -f -- "$timer_temporary" "$TIMER_FILE"')
    expect(script).not.toContain('install -m 0600 "$temporary" "$SERVICE_FILE"')
    expect(script).not.toContain('install -m 0600 "$temporary" "$TIMER_FILE"')
    expect(script).not.toContain('install -m 0644')
  })

  it('refreshes lifecycle assets before a verified promotion is recorded complete', async () => {
    const cli = await readFile(
      new URL('../bin/agentic-remote', import.meta.url),
      'utf8',
    )

    const setup = cli.indexOf('setup_service()')
    const refresh = cli.indexOf(
      '\n  refresh_promotion_lifecycle_if_installed\n',
      setup,
    )
    const restart = cli.indexOf(
      '\n  systemctl --user restart "$SERVICE_NAME"\n',
      setup,
    )
    expect(refresh).toBeGreaterThan(0)
    expect(refresh).toBeLessThan(restart)
  })

  it('preserves every Oracle voice value without printing private configuration', async () => {
    const fixture = await setupFixture()

    const result = await fixture.run()

    const environment = await readFile(fixture.environment, 'utf8')
    for (const preserved of [
      'AGENTIC_REMOTE_ORACLE_VOICE=on',
      'AGENTIC_REMOTE_VOICE_COMPUTER=',
      'AGENTIC_REMOTE_VOICE_STT_PROFILE=nemotron',
      'AGENTIC_REMOTE_VOICE_LANGUAGE=pt-BR',
      'AGENTIC_REMOTE_VOICE_THREADS=4',
      'AGENTIC_REMOTE_VOICE_ENDPOINT_MS=900',
      'AGENTIC_REMOTE_VOICE_STT_MODEL_DIR=models/stt',
      'AGENTIC_REMOTE_VOICE_TTS_ENGINE=sherpa-vits',
      'AGENTIC_REMOTE_VOICE_TTS_MODEL=models/voice.onnx',
      'AGENTIC_REMOTE_VOICE_TTS_CONFIG=models/voice.onnx.json',
      'AGENTIC_REMOTE_VOICE_TTS_TOKENS=models/tokens.txt',
      'AGENTIC_REMOTE_VOICE_TTS_DATA_DIR=models/espeak-ng-data',
      'AGENTIC_REMOTE_VOICE_TRANSCRIPT=private words',
    ]) {
      expect(environment).toContain(`${preserved}\n`)
    }
    expect((await stat(fixture.environment)).mode & 0o777).toBe(0o600)
    expect(`${result.stdout}${result.stderr}`).not.toContain('private words')
    expect(`${result.stdout}${result.stderr}`).not.toContain('do-not-print')
  })

  it('preserves the diagnostic tunnel selection across setup without querying it', async () => {
    const fixture = await setupFixture()
    const result = await fixture.run()
    expect(await readFile(fixture.environment, 'utf8')).toContain('AGENTIC_REMOTE_DEVTUNNEL_ID=fixture.usw2\n')
    expect(result.stdout).not.toContain('fixture.usw2')
  })

  it('never downloads voice models during setup', async () => {
    const fixture = await setupFixture()

    await fixture.run()

    await expect(stat(fixture.curlMarker)).rejects.toMatchObject({ code: 'ENOENT' })
  })
})
