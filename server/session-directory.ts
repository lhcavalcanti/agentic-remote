import { realpath, stat } from 'node:fs/promises'
import path from 'node:path'

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
    throw new Error('Folder path is required')
  }
  const home = await homeDirectory()
  const expanded =
    trimmed === '~' || trimmed.startsWith('~/')
      ? path.join(home, trimmed.slice(1))
      : trimmed
  if (!path.isAbsolute(expanded)) {
    throw new Error('Use an absolute folder path')
  }
  const resolved = await realpath(expanded)
  if (!(await stat(resolved)).isDirectory()) {
    throw new Error('Folder path must point to a directory')
  }
  const roots = await allowedRoots(home)
  if (!roots.some((root) => isWithin(root, resolved))) {
    throw new Error('Sessions are restricted to the user home directory')
  }
  return resolved
}
