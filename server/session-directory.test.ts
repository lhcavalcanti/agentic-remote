import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { validateSessionDirectory } from './session-directory.js'

const directories: string[] = []

afterEach(async () => {
  vi.unstubAllEnvs()
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

async function homeFixture(): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), 'session-directory-'))
  directories.push(directory)
  vi.stubEnv('HOME', directory)
  return directory
}

describe('validateSessionDirectory', () => {
  it('accepts directories inside the home directory', async () => {
    const home = await homeFixture()
    await expect(validateSessionDirectory(home)).resolves.toBe(home)
    await expect(validateSessionDirectory('~')).resolves.toBe(home)
  })

  it('rejects directories outside the home directory', async () => {
    await homeFixture()
    await expect(validateSessionDirectory('/')).rejects.toThrow(
      'Sessions are restricted to the user home directory',
    )
    await expect(validateSessionDirectory('/etc')).rejects.toThrow(
      'Sessions are restricted to the user home directory',
    )
  })

  it('rejects relative and empty folder paths', async () => {
    await homeFixture()
    await expect(validateSessionDirectory('   ')).rejects.toThrow(
      'Folder path is required',
    )
    await expect(validateSessionDirectory('src')).rejects.toThrow(
      'Use an absolute folder path',
    )
  })

  it('allows explicitly configured roots outside the home directory', async () => {
    await homeFixture()
    const outside = await mkdtemp(path.join(tmpdir(), 'session-outside-'))
    directories.push(outside)

    await expect(validateSessionDirectory(outside)).rejects.toThrow(
      'Sessions are restricted to the user home directory',
    )

    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ROOTS', outside)
    await expect(validateSessionDirectory(outside)).resolves.toBe(outside)
  })
})
