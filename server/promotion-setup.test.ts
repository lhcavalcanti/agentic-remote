import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

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
    expect(script).toContain('git -C "$DEV_ROOT" pull --ff-only')
    expect(script).toContain('running development tests')
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
    expect(script).toContain('TimeoutStartSec=30min')
    expect(script).toContain('Environment=$(systemd_quote "AGENTIC_REMOTE_MONITOR_PROFILE=$PROFILE_DEST")')
    expect(script).toContain('--create-runtime')
    expect(script).toContain('git -C "$dev_root" worktree add --detach "$prod_root" HEAD')
    expect(script).toContain('replace the placeholders in the profile before installing it')
    expect(script).toContain('preserving profile and state')

    // systemctl show prints Environment= entries, so the units must not be
    // more readable than the profile they point at.
    expect(script).toContain('install -m 0600 "$temporary" "$SERVICE_FILE"')
    expect(script).toContain('install -m 0600 "$temporary" "$TIMER_FILE"')
    expect(script).not.toContain('install -m 0644')
  })
})
