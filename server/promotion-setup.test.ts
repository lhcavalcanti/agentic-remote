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

  it('promotes the validated commit to downstream hosts and verifies each', async () => {
    const script = await readFile(
      new URL('../bin/agentic-remote-promotion-monitor', import.meta.url),
      'utf8',
    )

    // Downstream promotion runs before the marker advances, so a failure leaves
    // the commit ungraduated for the next run.
    const downstream = script.indexOf('promote_downstream "$candidate_commit"')
    const marker = script.indexOf('mv -f -- "$temporary_record" "$STATE_RECORD"')
    expect(downstream).toBeGreaterThan(-1)
    expect(downstream).toBeLessThan(marker)

    // The exact validated commit is installed. Pulling a branch would build
    // whatever the tip points at now, which is not what was validated.
    expect(script).toContain('git checkout --detach $commit_q && ./bin/agentic-remote setup')
    expect(script).not.toContain('./bin/agentic-remote update')

    // A failing git must not read as a clean worktree.
    expect(script).toContain('changes=\\$(git status --porcelain) && test -z')

    expect(script).toContain('not the validated $commit')
    expect(script).toContain('restore_promoted')
    expect(script).toContain('downstream promotion failed')
  })

  it('quotes profile values so they cannot execute on a remote host', async () => {
    const script = await readFile(
      new URL('../bin/agentic-remote-promotion-monitor', import.meta.url),
      'utf8',
    )

    expect(script).toContain('"bash -lc $(printf \'%q\' "$script")"')
    for (const value of ['DOWNSTREAM_ROOT', 'DOWNSTREAM_HEALTH_URL']) {
      expect(script).toContain(`printf '%q' "$${value}"`)
    }
  })

  it('waits for downstream readiness and restores an exact commit on failure', async () => {
    const script = await readFile(
      new URL('../bin/agentic-remote-promotion-monitor', import.meta.url),
      'utf8',
    )

    // A single probe would race the restart the install just triggered.
    expect(script).toContain('for attempt in $(seq 1 30); do')
    expect(script).toContain('curl -fsS --max-time 5 $url_q')

    // Recovery rebuilds a captured commit rather than trusting release mtimes.
    expect(script).toContain('restore_downstream "$host" "$previous_head"')
    expect(script).toContain('git checkout --detach $commit_q && ./bin/agentic-remote setup')
  })

  it('validates downstream settings before anything local is mutated', async () => {
    const script = await readFile(
      new URL('../bin/agentic-remote-promotion-monitor', import.meta.url),
      'utf8',
    )

    const validation = script.indexOf('AGENTIC_REMOTE_MONITOR_DOWNSTREAM_ROOT "$DOWNSTREAM_ROOT"')
    const build = script.indexOf('building development release')
    expect(validation).toBeGreaterThan(-1)
    expect(validation).toBeLessThan(build)
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
