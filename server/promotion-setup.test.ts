import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

describe('reproducible promotion setup', () => {
  it('keeps the promotion runner profile-driven and validation-gated', async () => {
    const script = await readFile(
      new URL('../bin/agentic-remote-promotion-monitor', import.meta.url),
      'utf8',
    )

    expect(script).toContain('AGENTIC_REMOTE_MONITOR_PROFILE')
    expect(script).toContain('git -C "$DEV_ROOT" pull --ff-only')
    expect(script).toContain('GitHub CI passed for $candidate_commit')
    expect(script).toContain('git -C "$PROD_ROOT" switch --detach "$candidate_commit"')
    expect(script).toContain('"$RELEASE_ROOT/current"')
    expect(script).toContain('production runtime health check failed after graduation')
  })

  it('inherits the installed runtime identity unless the profile overrides it', async () => {
    const script = await readFile(
      new URL('../bin/agentic-remote-promotion-monitor', import.meta.url),
      'utf8',
    )

    for (const key of ['HOST', 'PORT', 'ROLE', 'NAME']) {
      expect(script).toContain(`profile_value AGENTIC_REMOTE_MONITOR_${key} ''`)
    }

    expect(script).toContain('[[ -z "$PRODUCTION_ROLE" ]] || setup_arguments+=(--role "$PRODUCTION_ROLE")')
    expect(script).toContain('[[ -z "$PRODUCTION_NAME" ]] || setup_arguments+=(--name "$PRODUCTION_NAME")')
    expect(script).toContain('[[ -z "$PRODUCTION_HOST" ]] || setup_arguments+=(--host "$PRODUCTION_HOST")')
    expect(script).toContain('[[ -z "$PRODUCTION_PORT" ]] || setup_arguments+=(--port "$PRODUCTION_PORT")')
    expect(script).toContain('setup "${setup_arguments[@]}"')
    expect(script).not.toContain('--role "$PRODUCTION_ROLE" \\')
  })

  it('graduates only what origin/main already contains', async () => {
    const script = await readFile(
      new URL('../bin/agentic-remote-promotion-monitor', import.meta.url),
      'utf8',
    )

    expect(script).toContain('git -C "$DEV_ROOT" rev-parse refs/remotes/origin/main')
    expect(script).toContain('development main is not at origin/main')
  })

  it('restores the previous runtime when graduation fails after the switch', async () => {
    const script = await readFile(
      new URL('../bin/agentic-remote-promotion-monitor', import.meta.url),
      'utf8',
    )

    expect(script).toContain('rollback_runtime()')
    expect(script).toContain('rollback_runtime "$prod_commit" "$previous_release"')
    expect(script).toContain('graduation failed and the previous runtime was restored')

    // Every post-switch check must record a failure and fall through to the
    // rollback rather than exiting and leaving the candidate active.
    for (const message of [
      'setup failed for $candidate_commit',
      'production runtime health check failed after graduation',
      'production release pointer is missing: $RELEASE_ROOT/current',
      'external access check failed: $EXTERNAL_URL',
    ]) {
      expect(script).toContain(`failure="${message}"`)
    }

    const stateOrder = script.indexOf('mv -f -- "$temporary_record" "$STATE_RECORD"')
    const markerOrder = script.indexOf('mv -f -- "$temporary_state" "$STATE_FILE"')
    expect(stateOrder).toBeGreaterThan(-1)
    expect(stateOrder).toBeLessThan(markerOrder)
  })

  it('refuses to arm the timer until the health URL answers', async () => {
    const script = await readFile(
      new URL('../bin/agentic-remote-promotion-setup', import.meta.url),
      'utf8',
    )

    expect(script).toContain('AGENTIC_REMOTE_MONITOR_HEALTH_URL in $PROFILE_DEST before enabling')
    expect(script).toContain('health URL did not answer: $health_url')
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
    expect(script).toContain('OnUnitActiveSec=2h')
    expect(script).toContain('Persistent=true')
    expect(script).toContain('TimeoutStartSec=30min')
    expect(script).toContain('Environment=$(systemd_quote "AGENTIC_REMOTE_MONITOR_PROFILE=$PROFILE_DEST")')
    expect(script).toContain('--create-runtime')
    expect(script).toContain('git -C "$dev_root" worktree add --detach "$prod_root" HEAD')
    expect(script).toContain('replace the placeholders in the profile before installing it')
    expect(script).toContain('preserving profile and state')
  })
})
