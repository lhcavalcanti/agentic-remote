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
})
