import { mkdir, mkdtemp, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { listHomeDirectories } from './directory-browser.js'

const directories: string[] = []

afterEach(async () => {
  vi.unstubAllEnvs()
  await Promise.all(
    directories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})

describe('listHomeDirectories', () => {
  it('starts at home and lists visible directories alphabetically', async () => {
    const home = await mkdtemp(path.join(tmpdir(), 'folder-browser-test-'))
    directories.push(home)
    await mkdir(path.join(home, 'zeta'))
    await mkdir(path.join(home, 'Alpha'))
    await mkdir(path.join(home, '.hidden'))
    vi.stubEnv('HOME', home)

    const listing = await listHomeDirectories('~')

    expect(listing).toEqual({
      path: '~',
      parent: undefined,
      directories: [
        { name: 'Alpha', path: '~/Alpha' },
        { name: 'zeta', path: '~/zeta' },
      ],
    })
  })

  it('navigates within home and rejects traversal outside it', async () => {
    const home = await mkdtemp(path.join(tmpdir(), 'folder-browser-test-'))
    directories.push(home)
    await mkdir(path.join(home, 'src', 'project'), { recursive: true })
    vi.stubEnv('HOME', home)

    await expect(listHomeDirectories('~/src')).resolves.toMatchObject({
      path: '~/src',
      parent: '~',
      directories: [{ name: 'project', path: '~/src/project' }],
    })
    await expect(listHomeDirectories('/tmp')).rejects.toThrow(
      'restricted to the user home',
    )
  })

  it('shows safe in-home directory symlinks and hides escaping ones', async () => {
    const home = await mkdtemp(path.join(tmpdir(), 'folder-browser-test-'))
    const outside = await mkdtemp(path.join(tmpdir(), 'folder-browser-outside-'))
    directories.push(home, outside)
    await mkdir(path.join(home, 'projects'))
    await symlink(path.join(home, 'projects'), path.join(home, 'work'))
    await symlink(outside, path.join(home, 'escape'))
    vi.stubEnv('HOME', home)

    const listing = await listHomeDirectories('~')

    expect(listing.directories).toEqual([
      { name: 'projects', path: '~/projects' },
      { name: 'work', path: '~/projects' },
    ])
  })
})
