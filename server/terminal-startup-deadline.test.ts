import { chmod, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { waitForTerminalStartup } from './terminal-session.js'

// A tmux that never answers stands in for one too slow to answer before the
// startup deadline, which is what a loaded host produces at the last capture.
describe('terminal startup deadline', () => {
  let directory: string
  let originalPath: string | undefined

  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), 'startup-deadline-test-'))
    const tmux = path.join(directory, 'tmux')
    await writeFile(tmux, '#!/bin/sh\nexec sleep 30\n')
    await chmod(tmux, 0o755)
    originalPath = process.env.PATH
    process.env.PATH = `${directory}${path.delimiter}${originalPath ?? ''}`
  })

  afterEach(async () => {
    process.env.PATH = originalPath
    await rm(directory, { recursive: true, force: true })
  })

  it('reports a capture cut off by the deadline as not ready', async () => {
    await expect(
      waitForTerminalStartup('%0', false, async () => undefined, 200),
    ).rejects.toThrow('Copilot did not become ready for terminal input')
  })

  it('still reports a capture that fails for another reason', async () => {
    const tmux = path.join(directory, 'tmux')
    await writeFile(tmux, '#!/bin/sh\necho "no server running" >&2\nexit 1\n')
    await expect(
      waitForTerminalStartup('%0', false, async () => undefined, 5_000),
    ).rejects.toThrow(/no server running/)
  })
})
