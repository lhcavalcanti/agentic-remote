import { execFile } from 'node:child_process'
import { access, readFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it } from 'vitest'
import {
  createIsolatedTmuxRoot,
  isolatedTmuxEnv,
  stopIsolatedTmuxServer,
} from './tmux-test-helpers.js'

const execute = promisify(execFile)
const roots = new Set<string>()

async function fixture(): Promise<string> {
  const root = await createIsolatedTmuxRoot()
  roots.add(root)
  return root
}

async function start(root: string): Promise<number> {
  await execute('tmux', ['new-session', '-d', '-s', 'retirement-fixture', 'sleep 60'], {
    env: isolatedTmuxEnv(root),
  })
  const { stdout } = await execute('tmux', ['display-message', '-p', '#{pid}'], {
    env: isolatedTmuxEnv(root),
  })
  return Number(stdout.trim())
}

async function release(root: string): Promise<void> {
  await stopIsolatedTmuxServer(root)
  roots.delete(root)
}

async function expectRetired(pid: number): Promise<void> {
  try {
    const stat = await readFile(`/proc/${pid}/stat`, 'utf8')
    const state = stat.slice(stat.lastIndexOf(')') + 1).trim().split(/\s+/, 1)[0]
    expect(['Z', 'X']).toContain(state)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
}

afterEach(async () => {
  const failures: unknown[] = []
  for (const root of [...roots].reverse()) {
    try {
      await release(root)
    } catch (error) {
      failures.push(new Error(`Unable to clean up owned tmux fixture ${root}`, { cause: error }))
    }
  }
  if (failures.length) throw new AggregateError(failures, 'Owned tmux fixture cleanup failed')
})

describe('isolated tmux fixture retirement integration', () => {
  it('removes a proven cold namespace where no server was created', async () => {
    const root = await fixture()
    await release(root)
    await expect(access(root)).rejects.toMatchObject({ code: 'ENOENT' })
  }, 10_000)

  it('retires the owned server before removing its root and admitting the next fixture', async () => {
    const previous = await fixture()
    const previousPid = await start(previous)
    await release(previous)
    await expectRetired(previousPid)
    await expect(access(previous)).rejects.toMatchObject({ code: 'ENOENT' })

    const next = await fixture()
    const nextPid = await start(next)
    expect(nextPid).toBeGreaterThan(0)
    await release(next)
    await expectRetired(nextPid)
  }, 10_000)

  it('leaves a server in a different owned namespace running', async () => {
    const unrelated = await fixture()
    const unrelatedPid = await start(unrelated)
    const target = await fixture()
    const targetPid = await start(target)
    await release(target)
    await expectRetired(targetPid)
    await expect(access(target)).rejects.toMatchObject({ code: 'ENOENT' })

    const { stdout } = await execute('tmux', ['display-message', '-p', '#{pid}'], {
      env: isolatedTmuxEnv(unrelated),
    })
    expect(Number(stdout.trim())).toBe(unrelatedPid)
  }, 10_000)
})
