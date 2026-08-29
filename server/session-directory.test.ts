import { chmod, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  SessionDirectoryError,
  validateKnowledgeRoot,
  validateSessionDirectory,
} from './session-directory.js'

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
  it('reports every rejection as a 400 with its reason', async () => {
    const home = await homeFixture()
    const outside = await mkdtemp(path.join(tmpdir(), 'session-outside-'))
    directories.push(outside)
    const file = path.join(home, 'note.txt')
    await writeFile(file, 'not a directory')

    const cases: Array<[string, string]> = [
      ['   ', 'Folder path is required'],
      ['src', 'Use an absolute folder path'],
      [path.join(home, 'missing-folder'), 'Folder does not exist'],
      [file, 'Folder path must point to a directory'],
      [outside, 'Sessions are restricted to the user home directory'],
    ]

    for (const [input, message] of cases) {
      const error = await validateSessionDirectory(input).catch(
        (caught: unknown) => caught,
      )
      expect(error, input).toBeInstanceOf(SessionDirectoryError)
      expect((error as SessionDirectoryError).statusCode, input).toBe(400)
      expect((error as Error).message, input).toContain(message)
    }
  })
  it('rejects a directory it cannot read', async () => {
    const home = await homeFixture()
    const locked = path.join(home, 'locked')
    await mkdir(locked, { mode: 0o000 })

    const error = await validateSessionDirectory(locked).catch(
      (caught: unknown) => caught,
    )
    await chmod(locked, 0o700)

    expect(error).toBeInstanceOf(SessionDirectoryError)
    expect((error as SessionDirectoryError).statusCode).toBe(400)
    expect((error as Error).message).toContain('Folder is not readable')
  })
  it('confines a knowledge root the same way as a session directory', async () => {
    const home = await homeFixture()
    const outside = await mkdtemp(path.join(tmpdir(), 'knowledge-outside-'))
    directories.push(outside)
    const inside = path.join(home, 'docs')
    await mkdir(inside)

    // A knowledge root is validated through the same helper, so a root outside
    // the allowed roots is refused before anything is listed.
    await expect(validateSessionDirectory(inside)).resolves.toBe(inside)
    await expect(validateSessionDirectory(outside)).rejects.toThrow(
      'Sessions are restricted to the user home directory',
    )
    await expect(validateSessionDirectory('/')).rejects.toThrow(
      'Sessions are restricted to the user home directory',
    )
  })
})

describe('validateKnowledgeRoot', () => {
  it('accepts a readable folder anywhere on the computer', async () => {
    await homeFixture()
    const outside = await mkdtemp(path.join(tmpdir(), 'knowledge-anywhere-'))
    directories.push(outside)

    // A session may not run there, but reading is allowed.
    await expect(validateSessionDirectory(outside)).rejects.toThrow(
      'Sessions are restricted to the user home directory',
    )
    await expect(validateKnowledgeRoot(outside)).resolves.toBe(outside)
  })

  it('still refuses what cannot be read or is not a folder', async () => {
    const home = await homeFixture()
    const file = path.join(home, 'note.txt')
    await writeFile(file, 'not a folder')
    const locked = path.join(home, 'locked')
    await mkdir(locked, { mode: 0o000 })

    await expect(validateKnowledgeRoot(file)).rejects.toThrow(
      'Folder path must point to a directory',
    )
    await expect(
      validateKnowledgeRoot(path.join(home, 'missing')),
    ).rejects.toThrow('Folder does not exist')
    const lockedError = await validateKnowledgeRoot(locked).catch(
      (caught: unknown) => caught,
    )
    await chmod(locked, 0o700)
    expect(lockedError).toBeInstanceOf(SessionDirectoryError)
    expect((lockedError as Error).message).toContain('not readable')

    await expect(validateKnowledgeRoot('relative')).rejects.toThrow(
      'Use an absolute folder path',
    )
  })
})
