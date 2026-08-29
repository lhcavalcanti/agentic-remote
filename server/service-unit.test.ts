import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

describe('managed service unit', () => {
  it('restarts the server without terminating tmux sessions', async () => {
    const script = await readFile(
      new URL('../bin/agentic-remote', import.meta.url),
      'utf8',
    )

    expect(script).toContain(
      'ExecStart=$(systemd_quote "$node_bin") --import tsx server/index.ts',
    )
    expect(script).toContain('KillMode=process')
  })

  it('derives an origin allowlist that still permits loopback browsing', async () => {
    const script = await readFile(
      new URL('../bin/agentic-remote', import.meta.url),
      'utf8',
    )

    // An explicit list disables the server's derived loopback allowance, so the
    // value setup writes has to include the loopback origins itself.
    expect(script).toContain(
      "printf 'http://%s:%s,http://localhost:%s,http://127.0.0.1:%s'",
    )
    // A derived allowlist is regenerated when --host/--port change, while a
    // user-supplied one is preserved.
    expect(script).toContain(
      '"$previous_origins" != "$(derived_origins "$previous_host" "$previous_port")"',
    )
    // Extra session roots survive a re-run of setup.
    expect(script).toContain(
      "printf 'AGENTIC_REMOTE_ALLOWED_ROOTS=%s\\n' \"$allowed_roots\"",
    )
  })

  it('defines a persistent two-hour main-branch update timer', async () => {
    const script = await readFile(
      new URL('../bin/agentic-remote', import.meta.url),
      'utf8',
    )

    expect(script).toContain('OnUnitActiveSec=2h')
    expect(script).toContain('Persistent=true')
    expect(script).toContain('auto-update-run')
    expect(script).toContain(
      'automatic updates require the repository to be on main',
    )
    expect(script).toContain(
      'automatic updates require a clean main worktree',
    )
  })
})
