import { access, realpath, stat } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'

/**
 * A rejected folder path is a user mistake, not a server fault, so it carries a
 * status the API error handler can surface with its reason intact.
 */
export class SessionDirectoryError extends Error {
  constructor(
    message: string,
    readonly statusCode: number = 400,
  ) {
    super(message)
    this.name = 'SessionDirectoryError'
  }
}

export function isWithin(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate)
  return (
    relative === '' ||
    (!relative.startsWith('..') && !path.isAbsolute(relative))
  )
}

export function homeDirectory(): Promise<string> {
  return realpath(process.env.HOME || process.cwd())
}

async function allowedRoots(home: string): Promise<string[]> {
  const roots = [home]
  for (const entry of (process.env.AGENTIC_REMOTE_ALLOWED_ROOTS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)) {
    try {
      roots.push(await realpath(entry))
    } catch {
      continue
    }
  }
  return roots
}

/**
 * Resolves a session working directory and confines it to the same roots the
 * folder browser exposes, so the API cannot start an agent outside them.
 */
export async function validateSessionDirectory(
  inputPath: string,
): Promise<string> {
  const trimmed = inputPath.trim()
  if (!trimmed) {
    throw new SessionDirectoryError('Folder path is required')
  }
  const home = await homeDirectory()
  const expanded =
    trimmed === '~' || trimmed.startsWith('~/')
      ? path.join(home, trimmed.slice(1))
      : trimmed
  if (!path.isAbsolute(expanded)) {
    throw new SessionDirectoryError('Use an absolute folder path')
  }
  let resolved: string
  let isDirectory: boolean
  try {
    resolved = await realpath(expanded)
    isDirectory = (await stat(resolved)).isDirectory()
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code === 'ENOENT' || code === 'ENOTDIR') {
      throw new SessionDirectoryError(`Folder does not exist: ${expanded}`)
    }
    if (code === 'EACCES' || code === 'EPERM') {
      throw new SessionDirectoryError(`Folder is not readable: ${expanded}`)
    }
    throw error
  }
  if (!isDirectory) {
    throw new SessionDirectoryError('Folder path must point to a directory')
  }
  try {
    // `stat` succeeds on a directory the agent could not actually list, which
    // would otherwise fail later as an opaque server error.
    await access(resolved, constants.R_OK | constants.X_OK)
  } catch {
    throw new SessionDirectoryError(`Folder is not readable: ${expanded}`)
  }
  const roots = await allowedRoots(home)
  if (!roots.some((root) => isWithin(root, resolved))) {
    throw new SessionDirectoryError(
      'Sessions are restricted to the user home directory',
    )
  }
  return resolved
}
