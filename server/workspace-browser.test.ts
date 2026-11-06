import {
  mkdtemp,
  mkdir,
  rename,
  realpath,
  rm,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  listWorkspace,
  readWorkspaceFile,
  searchWorkspace,
} from './workspace-browser.js'

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>()
  return {
    ...actual,
    realpath: vi.fn(actual.realpath),
    stat: vi.fn(actual.stat),
  }
})

const directories: string[] = []

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
  const actual = await vi.importActual<typeof import('node:fs/promises')>(
    'node:fs/promises',
  )
  vi.mocked(stat).mockImplementation(async (target) => actual.stat(target))
  vi.mocked(realpath).mockImplementation(async (target) =>
    actual.realpath(target),
  )
})

async function fixture() {
  const parent = await mkdtemp(path.join(tmpdir(), 'workspace-browser-test-'))
  directories.push(parent)
  const root = path.join(parent, 'project')
  const outside = path.join(parent, 'outside')
  await mkdir(path.join(root, 'docs'), { recursive: true })
  await mkdir(path.join(root, '.git'))
  await mkdir(outside)
  await writeFile(path.join(root, 'README.md'), '# Guide\nUseful knowledge.\n')
  await writeFile(path.join(root, 'docs', 'notes.txt'), 'Search target line\n')
  await writeFile(path.join(root, '.git', 'config'), 'secret metadata')
  await writeFile(path.join(outside, 'private.md'), 'outside')
  await symlink(path.join(outside, 'private.md'), path.join(root, 'outside.md'))
  await symlink(root, path.join(root, 'docs', 'project-loop'))
  return { root }
}

describe('workspace browser', () => {
  it('lists safe visible files and folders', async () => {
    const { root } = await fixture()
    await expect(listWorkspace(root)).resolves.toEqual({
      path: '.',
      entries: [
        { name: 'docs', path: 'docs', kind: 'directory' },
        {
          name: 'README.md',
          path: 'README.md',
          kind: 'markdown',
          size: 26,
        },
      ],
    })
  })

  it('reads Markdown while rejecting traversal and escaping symlinks', async () => {
    const { root } = await fixture()
    await expect(readWorkspaceFile(root, 'README.md')).resolves.toMatchObject({
      path: 'README.md',
      kind: 'markdown',
      content: '# Guide\nUseful knowledge.\n',
    })
    await expect(readWorkspaceFile(root, '../outside/private.md')).rejects.toThrow(
      'not allowed',
    )
    await expect(readWorkspaceFile(root, 'outside.md')).rejects.toThrow(
      'restricted to the session folder',
    )
  })

  it('maps a deleted legacy unconfined root through folder validation', async () => {
    const { root } = await fixture()
    await rm(root, { recursive: true })

    await expect(listWorkspace(root)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('does not exist'),
    })
  })

  it('maps an unreadable legacy unconfined root through folder validation', async () => {
    const { root } = await fixture()
    const actual = await vi.importActual<typeof import('node:fs/promises')>(
      'node:fs/promises',
    )
    vi.mocked(realpath).mockImplementation(async (target) => {
      if (String(target) === root) {
        throw Object.assign(new Error('PRIVATE_REALPATH_IO'), {
          code: 'EACCES',
        })
      }
      return actual.realpath(target)
    })

    const error = await readWorkspaceFile(root, 'README.md').catch(
      (caught: unknown) => caught,
    )
    expect(error).toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('not readable'),
    })
    expect((error as Error).message).not.toContain('PRIVATE_REALPATH_IO')
  })

  it('refuses a confined read after the root is replaced by a symlink', async () => {
    const parent = await mkdtemp(path.join(tmpdir(), 'knowledge-read-race-'))
    directories.push(parent)
    const cwd = path.join(parent, 'project')
    const root = path.join(cwd, 'knowledge')
    const outside = path.join(parent, 'outside')
    await mkdir(root, { recursive: true })
    await mkdir(outside)
    await writeFile(path.join(root, 'safe.md'), 'safe')
    await writeFile(path.join(outside, 'private.md'), 'private')
    await rename(root, `${root}-original`)
    await symlink(outside, root)

    await expect(
      readWorkspaceFile(root, 'private.md', cwd),
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('refuses a file replaced by an escaping symlink after resolution', async () => {
    const parent = await mkdtemp(path.join(tmpdir(), 'knowledge-file-race-'))
    directories.push(parent)
    const cwd = path.join(parent, 'project')
    const root = path.join(cwd, 'knowledge')
    const outside = path.join(parent, 'outside')
    const file = path.join(root, 'safe.md')
    const privateFile = path.join(outside, 'private.md')
    await mkdir(root, { recursive: true })
    await mkdir(outside)
    await writeFile(file, 'safe')
    await writeFile(privateFile, 'private')
    const actual = await vi.importActual<typeof import('node:fs/promises')>(
      'node:fs/promises',
    )
    let replaced = false
    vi.mocked(stat).mockImplementation(async (target) => {
      const metadata = await actual.stat(target)
      if (!replaced && String(target) === file) {
        replaced = true
        await rename(file, `${file}-original`)
        await symlink(privateFile, file)
      }
      return metadata
    })

    await expect(
      readWorkspaceFile(root, 'safe.md', cwd),
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('refuses an escaping parent swapped after file resolution', async () => {
    const parent = await mkdtemp(path.join(tmpdir(), 'knowledge-parent-race-'))
    directories.push(parent)
    const cwd = path.join(parent, 'project')
    const root = path.join(cwd, 'knowledge')
    const folder = path.join(root, 'docs')
    const outside = path.join(parent, 'outside')
    const file = path.join(folder, 'safe.md')
    await mkdir(folder, { recursive: true })
    await mkdir(outside)
    await writeFile(file, 'safe')
    await writeFile(path.join(outside, 'safe.md'), 'private')
    const actual = await vi.importActual<typeof import('node:fs/promises')>(
      'node:fs/promises',
    )
    let replaced = false
    vi.mocked(realpath).mockImplementation(async (target) => {
      const resolved = await actual.realpath(target)
      if (!replaced && String(target) === file) {
        replaced = true
        await rename(folder, `${folder}-original`)
        await symlink(outside, folder)
      }
      return resolved
    })

    await expect(
      readWorkspaceFile(root, 'docs/safe.md', cwd),
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('searches names and bounded text while skipping hidden metadata', async () => {
    const { root } = await fixture()
    await expect(searchWorkspace(root, 'target')).resolves.toEqual({
      results: [
        {
          name: 'notes.txt',
          path: 'docs/notes.txt',
          kind: 'file',
          line: 1,
          snippet: 'Search target line',
        },
      ],
      truncated: false,
    })
    await expect(searchWorkspace(root, 'secret')).resolves.toEqual({
      results: [],
      truncated: false,
    })
  })
})

describe('workspace images', () => {
  it('reads an image as base64 with its real mime type', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'workspace-image-'))
    directories.push(root)
    await mkdir(path.join(root, 'docs'))
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>'
    await writeFile(path.join(root, 'docs', 'diagram.svg'), svg)
    await writeFile(path.join(root, 'docs', 'shot.png'), Buffer.from([0x89, 0x50]))

    const listing = await listWorkspace(root, 'docs')
    expect(
      listing.entries.map((entry) => [entry.name, entry.kind]),
    ).toEqual(
      expect.arrayContaining([
        ['diagram.svg', 'image'],
        ['shot.png', 'image'],
      ]),
    )

    const file = await readWorkspaceFile(root, 'docs/diagram.svg')
    expect(file.kind).toBe('image')
    expect(file.mimeType).toBe('image/svg+xml')
    expect(file.content).toBeUndefined()
    expect(Buffer.from(file.base64 || '', 'base64').toString('utf8')).toBe(svg)

    expect((await readWorkspaceFile(root, 'docs/shot.png')).mimeType).toBe(
      'image/png',
    )
  })

  describe('workspace HTML', () => {
    it('classifies, reads, and searches .html and .htm as bounded text', async () => {
      const root = await mkdtemp(path.join(tmpdir(), 'workspace-html-'))
      directories.push(root)
      const fullDocument = '<!doctype html><style>p{color:green}</style><p>Searchable page</p>'
      const snippet = '<section>Compact snippet</section>'
      await writeFile(path.join(root, 'page.html'), fullDocument)
      await writeFile(path.join(root, 'snippet.htm'), snippet)

      const listing = await listWorkspace(root)
      expect(
        listing.entries.map((entry) => [entry.name, entry.kind]),
      ).toEqual([
        ['page.html', 'html'],
        ['snippet.htm', 'html'],
      ])
      await expect(readWorkspaceFile(root, 'page.html')).resolves.toMatchObject({
        kind: 'html',
        mimeType: 'text/html; charset=utf-8',
        content: fullDocument,
      })
      await expect(readWorkspaceFile(root, 'snippet.htm')).resolves.toMatchObject({
        kind: 'html',
        mimeType: 'text/html; charset=utf-8',
        content: snippet,
      })
      await expect(searchWorkspace(root, 'searchable')).resolves.toMatchObject({
        results: [
          expect.objectContaining({
            name: 'page.html',
            kind: 'html',
            snippet: fullDocument,
          }),
        ],
      })
    })

    it('applies the 2 MiB text-preview limit to HTML', async () => {
      const root = await mkdtemp(path.join(tmpdir(), 'workspace-html-large-'))
      directories.push(root)
      await writeFile(path.join(root, 'large.html'), 'x'.repeat(2 * 1024 * 1024 + 1))

      await expect(readWorkspaceFile(root, 'large.html')).rejects.toThrow(
        'maximum 2 MiB',
      )
    })
  })

  it('keeps refusing types that are not previewable', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'workspace-image-'))
    directories.push(root)
    await writeFile(path.join(root, 'app.bin'), 'binary')

    await expect(readWorkspaceFile(root, 'app.bin')).rejects.toThrow(
      'This file type cannot be previewed',
    )
  })

  it('refuses an image outside the root', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'workspace-image-'))
    directories.push(root)
    const outside = await mkdtemp(path.join(tmpdir(), 'workspace-outside-'))
    directories.push(outside)
    await writeFile(path.join(outside, 'secret.png'), 'x')
    await mkdir(path.join(root, 'docs'))

    await expect(
      readWorkspaceFile(root, '../' + path.basename(outside) + '/secret.png'),
    ).rejects.toThrow()
  })
})
