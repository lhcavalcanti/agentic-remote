import { readdir, realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import type { DirectoryListing } from '../shared/contracts.js'
import { homeDirectory, isWithin } from './session-directory.js'

export async function listHomeDirectories(
  requestedPath = '~',
): Promise<DirectoryListing> {
  const home = await homeDirectory()
  const resolved = await resolveRequestedPath(home, requestedPath)
  const metadata = await stat(resolved)
  if (!metadata.isDirectory()) {
    throw new Error('Folder path must point to a directory')
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
    if (!isWithin(home, realCandidate)) {
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
      path: displayPath(home, realCandidate),
    })
  }
  directories.sort((left, right) =>
    left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }),
  )

  return {
    path: displayPath(home, resolved),
    parent:
      resolved === home
        ? undefined
        : displayPath(home, path.dirname(resolved)),
    directories,
  }
}

async function resolveRequestedPath(
  home: string,
  requestedPath: string,
): Promise<string> {
  const value = requestedPath.trim() || '~'
  const candidate =
    value === '~'
      ? home
      : value.startsWith('~/')
        ? path.join(home, value.slice(2))
        : path.isAbsolute(value)
          ? value
          : path.join(home, value)
  const resolved = await realpath(candidate)
  if (!isWithin(home, resolved)) {
    throw new Error('Folder browsing is restricted to the user home directory')
  }
  return resolved
}

function displayPath(home: string, candidate: string): string {
  const relative = path.relative(home, candidate)
  return relative ? `~/${relative}` : '~'
}
