import { spawn } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { stopActiveCopilotSession } from './active-sessions.js'

describe('stopActiveCopilotSession', () => {
  it('terminates only the process carrying the matching session id', async () => {
    const sessionId = '12345678-1234-1234-1234-123456789abc'
    const child = spawn(
      process.execPath,
      ['-e', 'setTimeout(() => {}, 60_000)', '--', '--session-id', sessionId],
      { stdio: 'ignore' },
    )
    await new Promise((resolve) => setTimeout(resolve, 100))
    const exited = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>(
      (resolve) => {
        child.once('exit', (code, signal) => resolve({ code, signal }))
      },
    )

    await stopActiveCopilotSession(sessionId)

    await expect(exited).resolves.toMatchObject({
      signal: 'SIGTERM',
    })
  })
})
