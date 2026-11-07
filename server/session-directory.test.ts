import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  rename,
  rm,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ensureSessionKnowledgeBase,
  SessionDirectoryError,
  validateKnowledgeRoot,
  validateSessionDirectory,
} from './session-directory.js'

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>()
  return {
    ...actual,
    lstat: vi.fn(actual.lstat),
    mkdir: vi.fn(actual.mkdir),
    stat: vi.fn(actual.stat),
  }
})

const directories: string[] = []

afterEach(async () => {
  vi.unstubAllEnvs()
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
  const actual = await vi.importActual<typeof import('node:fs/promises')>(
    'node:fs/promises',
  )
  vi.mocked(mkdir).mockImplementation(async (target, options) =>
    actual.mkdir(target, options),
  )
  vi.mocked(lstat).mockImplementation(async (target) => actual.lstat(target))
  vi.mocked(stat).mockImplementation(async (target) => actual.stat(target))
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

  it('rechecks a session confinement after the root is replaced by a symlink', async () => {
    const home = await homeFixture()
    const cwd = path.join(home, 'project')
    const root = path.join(cwd, 'knowledge')
    const outside = path.join(home, 'outside')
    await mkdir(root, { recursive: true })
    await mkdir(outside)

    await expect(validateKnowledgeRoot(root, cwd)).resolves.toBe(root)
    await rename(root, `${root}-original`)
    await symlink(outside, root)

    await expect(validateKnowledgeRoot(root, cwd)).rejects.toMatchObject({
      statusCode: 403,
    })
  })
})

describe('ensureSessionKnowledgeBase', () => {
  it('returns the canonical owner cwd with the selected folder', async () => {
    const parent = await mkdtemp(path.join(tmpdir(), 'knowledge-cwd-'))
    directories.push(parent)
    const cwd = path.join(parent, 'project')
    const alias = path.join(parent, 'project-alias')
    await mkdir(cwd)
    await symlink(cwd, alias)

    await expect(
      ensureSessionKnowledgeBase(alias, 'knowledge', true),
    ).resolves.toEqual({
      path: path.join(cwd, 'knowledge'),
      confinementPath: cwd,
    })
  })

  it('creates a private dedicated folder and reuses it idempotently', async () => {
    const cwd = await homeFixture()
    const expected = path.join(cwd, 'docs', 'knowledge')

    await expect(
      ensureSessionKnowledgeBase(cwd, 'docs/knowledge', true),
    ).resolves.toEqual({ path: expected, confinementPath: cwd })
    expect((await stat(expected)).mode & 0o777).toBe(0o700)
    await expect(
      ensureSessionKnowledgeBase(cwd, 'docs/knowledge', true),
    ).resolves.toEqual({ path: expected, confinementPath: cwd })
  })

  it('uses an existing readable folder without creating it', async () => {
    const cwd = await homeFixture()
    const existing = path.join(cwd, 'knowledge')
    await mkdir(existing)

    await expect(
      ensureSessionKnowledgeBase(cwd, 'knowledge', false),
    ).resolves.toEqual({ path: existing, confinementPath: cwd })
  })

  it('reports an execute-only component as an unreadable path', async () => {
    const cwd = await homeFixture()
    const existing = path.join(cwd, 'knowledge')
    await mkdir(existing, { mode: 0o100 })

    const error = await ensureSessionKnowledgeBase(
      cwd,
      'knowledge',
      false,
    ).catch((caught: unknown) => caught)
    await chmod(existing, 0o700)

    expect(error).toBeInstanceOf(SessionDirectoryError)
    expect((error as SessionDirectoryError).statusCode).toBe(400)
    expect((error as Error).message).toContain('not readable')
  })

  it('reports a missing non-created folder as not found', async () => {
    const cwd = await homeFixture()
    await expect(
      ensureSessionKnowledgeBase(cwd, 'knowledge', false),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: expect.stringContaining('does not exist'),
    })
  })

  it.each([
    ['', 400],
    ['.', 400],
    ['/tmp/knowledge', 400],
    ['C:/knowledge', 400],
    ['../knowledge', 403],
    ['docs/../knowledge', 403],
    ['.knowledge', 403],
    ['docs/.private', 403],
    ['.env.production', 403],
    ['credentials', 403],
    ['credential_store', 403],
    ['credentials-store', 403],
    ['keychains/project', 403],
    ['browser profiles/project', 403],
    ['browser-profile', 403],
    ['id_ed25519', 403],
    ['private.key', 403],
    ['private-key', 403],
    ['private_key', 403],
    ['private key', 403],
    ['private.p12', 403],
    ['C:knowledge', 400],
  ])('refuses unsafe path %j', async (relativePath, statusCode) => {
    const cwd = await homeFixture()
    await expect(
      ensureSessionKnowledgeBase(cwd, relativePath, true),
    ).rejects.toMatchObject({ statusCode })
  })

  it('refuses an existing symlink component before creating descendants', async () => {
    const cwd = await homeFixture()
    const outside = await mkdtemp(path.join(tmpdir(), 'knowledge-outside-'))
    directories.push(outside)
    await symlink(outside, path.join(cwd, 'linked'))

    await expect(
      ensureSessionKnowledgeBase(cwd, 'linked/notes', true),
    ).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining('symbolic link'),
    })
    await expect(stat(path.join(outside, 'notes'))).rejects.toMatchObject({
      code: 'ENOENT',
    })
  })

  it('does not create outside cwd when cwd becomes a symlink after validation', async () => {
    const parent = await mkdtemp(path.join(tmpdir(), 'knowledge-create-race-'))
    directories.push(parent)
    const cwd = path.join(parent, 'project')
    const outside = path.join(parent, 'outside')
    await mkdir(cwd)
    await mkdir(outside)
    const actual = await vi.importActual<typeof import('node:fs/promises')>(
      'node:fs/promises',
    )
    let replaced = false
    vi.mocked(stat).mockImplementation(async (target) => {
      const metadata = await actual.stat(target)
      if (!replaced && String(target) === cwd) {
        replaced = true
        await rename(cwd, `${cwd}-original`)
        await symlink(outside, cwd)
      }
      return metadata
    })

    await expect(
      ensureSessionKnowledgeBase(cwd, 'docs/knowledge', true),
    ).rejects.toMatchObject({ statusCode: 403 })
    await expect(stat(path.join(outside, 'docs'))).rejects.toMatchObject({
      code: 'ENOENT',
    })
  })

  it('rolls back a segment if its opened parent moves outside cwd during mkdir', async () => {
    const parent = await mkdtemp(path.join(tmpdir(), 'knowledge-mkdir-race-'))
    directories.push(parent)
    const cwd = path.join(parent, 'project')
    const moved = path.join(parent, 'project-moved')
    const outside = path.join(parent, 'outside')
    await mkdir(cwd)
    await mkdir(outside)
    const actual = await vi.importActual<typeof import('node:fs/promises')>(
      'node:fs/promises',
    )
    let replaced = false
    vi.mocked(mkdir).mockImplementation(async (target, options) => {
      if (
        !replaced &&
        String(target).startsWith('/proc/self/fd/') &&
        path.basename(String(target)) === 'docs'
      ) {
        replaced = true
        await rename(cwd, moved)
        await symlink(outside, cwd)
      }
      return actual.mkdir(target, options)
    })

    await expect(
      ensureSessionKnowledgeBase(cwd, 'docs/knowledge', true),
    ).rejects.toMatchObject({ statusCode: 403 })
    await expect(stat(path.join(moved, 'docs'))).rejects.toMatchObject({
      code: 'ENOENT',
    })
    await expect(stat(path.join(outside, 'docs'))).rejects.toMatchObject({
      code: 'ENOENT',
    })
  })

  it('does not delete a replacement quarantine directory during rollback', async () => {
    const parent = await mkdtemp(path.join(tmpdir(), 'knowledge-rollback-race-'))
    directories.push(parent)
    const cwd = path.join(parent, 'project')
    const moved = path.join(parent, 'project-moved')
    const outside = path.join(parent, 'outside')
    await mkdir(cwd)
    await mkdir(outside)
    const actual = await vi.importActual<typeof import('node:fs/promises')>(
      'node:fs/promises',
    )
    let relocated = false
    vi.mocked(mkdir).mockImplementation(async (target, options) => {
      if (
        !relocated &&
        String(target).startsWith('/proc/self/fd/') &&
        path.basename(String(target)) === 'docs'
      ) {
        relocated = true
        await rename(cwd, moved)
        await symlink(outside, cwd)
      }
      return actual.mkdir(target, options)
    })
    let replacementPath: string | undefined
    vi.mocked(lstat).mockImplementation(async (target) => {
      const metadata = await actual.lstat(target)
      if (
        !replacementPath &&
        path.basename(String(target)).startsWith(
          '.agentic-remote-rollback-',
        )
      ) {
        replacementPath = path.join(moved, path.basename(String(target)))
        await actual.rename(target, `${String(target)}-original`)
        await actual.mkdir(target)
      }
      return metadata
    })

    await expect(
      ensureSessionKnowledgeBase(cwd, 'docs/knowledge', true),
    ).rejects.toMatchObject({ statusCode: 403 })
    expect(replacementPath).toBeDefined()
    await expect(stat(replacementPath!)).resolves.toMatchObject({
      mode: expect.any(Number),
    })
    await expect(stat(path.join(outside, 'docs'))).rejects.toMatchObject({
      code: 'ENOENT',
    })
  })

  it('refuses a symlink target that resolves to a hidden folder', async () => {
    const cwd = await homeFixture()
    const hidden = path.join(cwd, '.private')
    await mkdir(hidden)
    await symlink(hidden, path.join(cwd, 'notes'))

    await expect(
      ensureSessionKnowledgeBase(cwd, 'notes', false),
    ).rejects.toMatchObject({ statusCode: 403 })
  })
})
