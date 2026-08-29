import { readdir, realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import type { DirectoryListing } from '../shared/contracts.js'
import {
  SessionDirectoryError,
  homeDirectory,
  isWithin,
} from './session-directory.js'

/**
 * `home` keeps browsing inside the user's home directory, which is what a
 * session working directory is allowed to be. `all` walks the whole filesystem
 * so a knowledge root can be any folder the user can read.
 */
export type DirectoryScope = 'home' | 'all'

export async function listHomeDirectories(
  requestedPath = '~',
  scope: DirectoryScope = 'home',
): Promise<DirectoryListing> {
  const home = await homeDirectory()
  const confined = scope === 'home'
  const resolved = await resolveRequestedPath(home, requestedPath, confined)
  const metadata = await stat(resolved)
  if (!metadata.isDirectory()) {
    throw new SessionDirectoryError('Folder path must point to a directory')
  }

  const entries = await readdir(resolved, { withFileTypes: true })
  const directories: DirectoryListing['directories'] = []
  for (const entry of entries) {
    if (
      (!entry.isDirectory() && !entry.isSymbolicLink()) ||
      entry.name.startsWith('.')
    ) {
      continue
    }
    const candidate = path.join(resolved, entry.name)
    let realCandidate = ''
    try {
      realCandidate = await realpath(candidate)
    } catch {
      continue
    }
    if (confined && !isWithin(home, realCandidate)) {
      continue
    }
    try {
      if (!(await stat(realCandidate)).isDirectory()) {
        continue
      }
    } catch {
      continue
    }
    directories.push({
      name: entry.name,
      path: displayPath(home, realCandidate, confined),
    })
  }
  directories.sort((left, right) =>
    left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }),
  )

  const atTop = confined ? resolved === home : resolved === path.parse(resolved).root
  return {
    path: displayPath(home, resolved, confined),
    parent: atTop
      ? undefined
      : displayPath(home, path.dirname(resolved), confined),
    directories,
  }
}

async function resolveRequestedPath(
  home: string,
  requestedPath: string,
  confined: boolean,
): Promise<string> {
  const value = requestedPath.trim() || (confined ? '~' : home)
  const candidate =
    value === '~'
      ? home
      : value.startsWith('~/')
        ? path.join(home, value.slice(2))
        : path.isAbsolute(value)
          ? value
          : path.join(home, value)
  const resolved = await realpath(candidate)
  if (confined && !isWithin(home, resolved)) {
    throw new SessionDirectoryError(
      'Folder browsing is restricted to the user home directory',
    )
  }
  return resolved
}

function displayPath(
  home: string,
  candidate: string,
  confined: boolean,
): string {
  if (!confined) {
    return candidate
  }
  const relative = path.relative(home, candidate)
  return relative ? `~/${relative}` : '~'
}
