import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  listWorkspace,
  readWorkspaceFile,
  searchWorkspace,
} from './workspace-browser.js'

const directories: string[] = []

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
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
