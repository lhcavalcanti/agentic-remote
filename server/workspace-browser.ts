import { readFile, readdir, realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import type {
  WorkspaceEntry,
  WorkspaceEntryKind,
  WorkspaceFile,
  WorkspaceListing,
  WorkspaceSearchResponse,
  WorkspaceSearchResult,
} from '../shared/contracts.js'

const MAX_DIRECTORY_ENTRIES = 2_000
const MAX_TEXT_BYTES = 2 * 1024 * 1024
const MAX_PDF_BYTES = 25 * 1024 * 1024
const MAX_SEARCH_FILES = 5_000
const MAX_SEARCH_RESULTS = 50
const MAX_SEARCH_TEXT_BYTES = 20 * 1024 * 1024
const searchableExtensions = new Set([
  '.csv',
  '.json',
  '.log',
  '.md',
  '.markdown',
  '.tsv',
  '.txt',
  '.yaml',
  '.yml',
])
const skippedSearchDirectories = new Set([
  'build',
  'coverage',
  'dist',
  'node_modules',
])

export class WorkspaceBrowserError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message)
  }
}

export async function listWorkspace(
  rootPath: string,
  requestedPath = '.',
): Promise<WorkspaceListing> {
  const root = await realpath(rootPath)
  const resolved = await resolveWorkspacePath(root, requestedPath)
  if (!(await stat(resolved)).isDirectory()) {
    throw new WorkspaceBrowserError('Workspace path must be a folder', 400)
  }

  const entries: WorkspaceEntry[] = []
  for (const entry of await readdir(resolved, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entries.length >= MAX_DIRECTORY_ENTRIES) {
      continue
    }
    const candidate = path.join(resolved, entry.name)
    let realCandidate: string
    try {
      realCandidate = await realpath(candidate)
    } catch {
      continue
    }
    if (!isWithin(root, realCandidate)) {
      continue
    }
    let metadata
    try {
      metadata = await stat(realCandidate)
    } catch {
      continue
    }
    if (!metadata.isDirectory() && !metadata.isFile()) {
      continue
    }
    entries.push({
      name: entry.name,
      path: relativePath(root, realCandidate),
      kind: metadata.isDirectory() ? 'directory' : fileKind(entry.name),
      size: metadata.isFile() ? metadata.size : undefined,
    })
  }
  entries.sort((left, right) => {
    if (left.kind === 'directory' && right.kind !== 'directory') return -1
    if (left.kind !== 'directory' && right.kind === 'directory') return 1
    return left.name.localeCompare(right.name, undefined, {
      sensitivity: 'base',
    })
  })

  const currentPath = relativePath(root, resolved)
  return {
    path: currentPath,
    parent:
      resolved === root ? undefined : relativePath(root, path.dirname(resolved)),
    entries,
  }
}

export async function readWorkspaceFile(
  rootPath: string,
  requestedPath: string,
): Promise<WorkspaceFile> {
  const root = await realpath(rootPath)
  const resolved = await resolveWorkspacePath(root, requestedPath)
  const metadata = await stat(resolved)
  if (!metadata.isFile()) {
    throw new WorkspaceBrowserError('Workspace path must be a file', 400)
  }
  const kind = fileKind(resolved)
  const limit = kind === 'pdf' ? MAX_PDF_BYTES : MAX_TEXT_BYTES
  if (metadata.size > limit) {
    throw new WorkspaceBrowserError(
      `File is too large to preview (maximum ${Math.floor(limit / 1024 / 1024)} MiB)`,
      413,
    )
  }
  if (kind === 'file' && !searchableExtensions.has(path.extname(resolved).toLowerCase())) {
    throw new WorkspaceBrowserError('This file type cannot be previewed', 415)
  }
  const data = await readFile(resolved)
  return {
    name: path.basename(resolved),
    path: relativePath(root, resolved),
    kind,
    mimeType: kind === 'pdf' ? 'application/pdf' : 'text/plain; charset=utf-8',
    size: metadata.size,
    ...(kind === 'pdf'
      ? { base64: data.toString('base64') }
      : { content: data.toString('utf8') }),
  }
}

export async function searchWorkspace(
  rootPath: string,
  query: string,
  requestedPath = '.',
): Promise<WorkspaceSearchResponse> {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  if (normalizedQuery.length < 2) {
    throw new WorkspaceBrowserError(
      'Search needs at least two characters',
      400,
    )
  }
  const root = await realpath(rootPath)
  const searchRoot = await resolveWorkspacePath(root, requestedPath)
  if (!(await stat(searchRoot)).isDirectory()) {
    throw new WorkspaceBrowserError('Search path must be a folder', 400)
  }
  const results: WorkspaceSearchResult[] = []
  const visitedDirectories = new Set<string>()
  let visitedFiles = 0
  let searchedTextBytes = 0
  let truncated = false

  async function visit(directory: string): Promise<void> {
    if (visitedDirectories.has(directory)) {
      return
    }
    visitedDirectories.add(directory)
    if (
      truncated ||
      visitedFiles >= MAX_SEARCH_FILES ||
      results.length >= MAX_SEARCH_RESULTS
    ) {
      truncated = true
      return
    }
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (
        entry.name.startsWith('.') ||
        (entry.isDirectory() && skippedSearchDirectories.has(entry.name))
      ) {
        continue
      }
      let candidate: string
      try {
        candidate = await realpath(path.join(directory, entry.name))
      } catch {
        continue
      }
      if (!isWithin(root, candidate)) {
        continue
      }
      const metadata = await stat(candidate).catch(() => undefined)
      if (metadata?.isDirectory()) {
        await visit(candidate)
        continue
      }
      if (!metadata?.isFile()) {
        continue
      }
      visitedFiles += 1
      const kind = fileKind(entry.name)
      const result: WorkspaceSearchResult = {
        name: entry.name,
        path: relativePath(root, candidate),
        kind,
      }
      if (entry.name.toLocaleLowerCase().includes(normalizedQuery)) {
        results.push(result)
      } else if (
        searchableExtensions.has(path.extname(entry.name).toLowerCase()) &&
        metadata.size <= MAX_TEXT_BYTES
      ) {
        if (searchedTextBytes + metadata.size > MAX_SEARCH_TEXT_BYTES) {
          truncated = true
          return
        }
        searchedTextBytes += metadata.size
        const content = await readFile(candidate, 'utf8')
        const lines = content.split(/\r?\n/)
        const lineIndex = lines.findIndex((line) =>
          line.toLocaleLowerCase().includes(normalizedQuery),
        )
        if (lineIndex >= 0) {
          results.push({
            ...result,
            line: lineIndex + 1,
            snippet: lines[lineIndex].trim().slice(0, 240),
          })
        }
      }
      if (
        visitedFiles >= MAX_SEARCH_FILES ||
        results.length >= MAX_SEARCH_RESULTS
      ) {
        truncated = true
        return
      }
    }
  }

  await visit(searchRoot)
  return { results, truncated }
}

async function resolveWorkspacePath(
  root: string,
  requestedPath: string,
): Promise<string> {
  const value = requestedPath.trim() || '.'
  if (
    path.isAbsolute(value) ||
    value
      .split(/[\\/]+/)
      .some((segment) => segment.startsWith('.') && segment !== '.')
  ) {
    throw new WorkspaceBrowserError('Workspace path is not allowed', 400)
  }
  let resolved: string
  try {
    resolved = await realpath(path.resolve(root, value))
  } catch {
    throw new WorkspaceBrowserError('Workspace path was not found', 404)
  }
  if (!isWithin(root, resolved)) {
    throw new WorkspaceBrowserError(
      'Workspace browsing is restricted to the session folder',
      403,
    )
  }
  return resolved
}

function fileKind(filename: string): Exclude<WorkspaceEntryKind, 'directory'> {
  const extension = path.extname(filename).toLowerCase()
  if (extension === '.md' || extension === '.markdown') return 'markdown'
  if (extension === '.pdf') return 'pdf'
  return 'file'
}

function isWithin(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate)
  return (
    relative === '' ||
    (!relative.startsWith('..') && !path.isAbsolute(relative))
  )
}

function relativePath(root: string, candidate: string): string {
  return path.relative(root, candidate).split(path.sep).join('/') || '.'
}
