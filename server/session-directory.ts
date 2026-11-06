import { access, lstat, mkdir, realpath, stat } from 'node:fs/promises'
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

const sensitiveKnowledgeSegment =
  /^(?:credentials?(?:[ _-]+stores?)?|keychains?|browser[ _-]+profiles?|login[ _-]+data|private[ ._-]+keys?|id_(?:rsa|dsa|ecdsa|ed25519)|.+\.(?:pem|p12|pfx))$/i

function knowledgePathSegments(inputPath: string): string[] {
  const normalized = inputPath.trim().replaceAll('\\', '/')
  if (!normalized || normalized === '.') {
    throw new SessionDirectoryError(
      'Choose a dedicated Knowledge folder under the session working directory',
    )
  }
  if (normalized.startsWith('/') || /^[A-Za-z]:/.test(normalized)) {
    throw new SessionDirectoryError(
      'Knowledge base path must be relative to the session working directory',
    )
  }
  const segments = normalized.split('/')
  if (segments.some((segment) => segment === '..')) {
    throw new SessionDirectoryError(
      'Knowledge base path must stay inside the session working directory',
      403,
    )
  }
  if (segments.some((segment) => !segment || segment === '.')) {
    throw new SessionDirectoryError('Knowledge base path contains an invalid segment')
  }
  if (
    segments.some((segment) =>
      segment.startsWith('.') || sensitiveKnowledgeSegment.test(segment))
  ) {
    throw new SessionDirectoryError(
      'Knowledge base path cannot use hidden or sensitive folders',
      403,
    )
  }
  return segments
}

function assertSafeResolvedKnowledgePath(root: string, candidate: string): void {
  if (!isWithin(root, candidate)) {
    throw new SessionDirectoryError(
      'Knowledge base path must stay inside the session working directory',
      403,
    )
  }
  const relative = path.relative(root, candidate)
  if (!relative) {
    throw new SessionDirectoryError(
      'Choose a dedicated Knowledge folder under the session working directory',
    )
  }
  const segments = relative.split(path.sep)
  if (
    segments.some((segment) =>
      segment.startsWith('.') || sensitiveKnowledgeSegment.test(segment))
  ) {
    throw new SessionDirectoryError(
      'Knowledge base path cannot resolve through hidden or sensitive folders',
      403,
    )
  }
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

/**
 * A knowledge root is read-only browsing, so it may be any directory the user
 * can actually read. Session working directories stay confined, because that is
 * where an agent executes.
 */
export async function validateKnowledgeRoot(
  inputPath: string,
  confinementPath?: string,
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
  try {
    resolved = await realpath(expanded)
    if (!(await stat(resolved)).isDirectory()) {
      throw new SessionDirectoryError('Folder path must point to a directory')
    }
    await access(resolved, constants.R_OK | constants.X_OK)
  } catch (error) {
    if (error instanceof SessionDirectoryError) {
      throw error
    }
    const code = (error as NodeJS.ErrnoException).code
    if (code === 'ENOENT' || code === 'ENOTDIR') {
      throw new SessionDirectoryError(`Folder does not exist: ${expanded}`)
    }
    throw new SessionDirectoryError(`Folder is not readable: ${expanded}`)
  }
  if (confinementPath) {
    let confinement: string
    try {
      confinement = await realpath(confinementPath)
    } catch {
      throw new SessionDirectoryError(
        'Session Knowledge confinement is not available',
        503,
      )
    }
    if (
      resolved !== path.resolve(expanded) ||
      confinement !== path.resolve(confinementPath) ||
      !isWithin(confinement, resolved)
    ) {
      throw new SessionDirectoryError(
        'Knowledge root no longer stays inside the session working directory',
        403,
      )
    }
  }
  return resolved
}

/**
 * Resolves or creates a dedicated Knowledge folder beneath a session's current
 * working directory without following a caller-selected symbolic link.
 */
export async function ensureSessionKnowledgeBase(
  cwd: string,
  inputPath: string,
  create: boolean,
): Promise<string> {
  const segments = knowledgePathSegments(inputPath)
  let root: string
  try {
    root = await realpath(cwd)
    if (!(await stat(root)).isDirectory()) {
      throw new SessionDirectoryError(
        'Session working directory must point to a directory',
      )
    }
  } catch (error) {
    if (error instanceof SessionDirectoryError) throw error
    throw new SessionDirectoryError('Session working directory is not available')
  }

  let current = root
  for (const segment of segments) {
    const candidate = path.join(current, segment)
    let metadata
    try {
      metadata = await lstat(candidate)
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (code !== 'ENOENT') {
        throw new SessionDirectoryError(`Knowledge folder is not readable: ${inputPath}`)
      }
      if (!create) {
        throw new SessionDirectoryError(
          `Knowledge folder does not exist: ${inputPath}`,
          404,
        )
      }
      try {
        await mkdir(candidate, { mode: 0o700 })
      } catch (mkdirError) {
        if ((mkdirError as NodeJS.ErrnoException).code !== 'EEXIST') {
          throw new SessionDirectoryError(
            `Knowledge folder could not be created: ${inputPath}`,
          )
        }
      }
      metadata = await lstat(candidate)
    }
    if (metadata.isSymbolicLink()) {
      throw new SessionDirectoryError(
        'Knowledge base path cannot include a symbolic link',
        403,
      )
    }
    if (!metadata.isDirectory()) {
      throw new SessionDirectoryError('Knowledge base path must point to a directory')
    }
    current = await realpath(candidate)
    assertSafeResolvedKnowledgePath(root, current)
  }

  try {
    await access(current, constants.R_OK | constants.X_OK)
  } catch {
    throw new SessionDirectoryError(`Knowledge folder is not readable: ${inputPath}`)
  }
  return current
}
