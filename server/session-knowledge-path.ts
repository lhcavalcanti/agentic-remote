import path from 'node:path'
import type {
  SessionKnowledgeBinding,
  SessionKnowledgeSource,
  WorkspaceFile,
  WorkspaceListing,
} from '../shared/contracts.js'
import { WorkspaceBrowserError } from './workspace-browser.js'

export function normalizeSessionKnowledgePath(value = '.'): string {
  const trimmed = value.trim() || '.'
  if (path.posix.isAbsolute(trimmed) || path.win32.isAbsolute(trimmed)) {
    throw new WorkspaceBrowserError('Knowledge path is not allowed', 400)
  }
  const segments = trimmed.split(/[\\/]+/)
  if (segments.some((segment) =>
    segment === '..' || (segment.startsWith('.') && segment !== '.'))) {
    throw new WorkspaceBrowserError('Knowledge path is not allowed', 400)
  }
  return segments.filter((segment) => segment !== '' && segment !== '.').join('/') || '.'
}

export function sourceComputerId(source: SessionKnowledgeSource): string {
  return source.kind === 'catalog-root' ? source.root.computerId : source.computerId
}

export function sourceComputerName(source: SessionKnowledgeSource): string {
  return source.kind === 'catalog-root' ? source.root.computerName : source.computerName
}

export function sourcePath(source: SessionKnowledgeSource): string {
  return source.kind === 'catalog-root' ? source.root.path : source.path
}

export function scopedKnowledgePath(bindingPath: string, requestedPath = '.'): string {
  const base = normalizeSessionKnowledgePath(bindingPath)
  const requested = normalizeSessionKnowledgePath(requestedPath)
  return requested === '.' ? base : base === '.' ? requested : `${base}/${requested}`
}

function rebasePath(bindingPath: string, value: string): string {
  const base = normalizeSessionKnowledgePath(bindingPath)
  const normalized = normalizeSessionKnowledgePath(value)
  if (base === '.') return normalized
  if (normalized === base) return '.'
  if (!normalized.startsWith(`${base}/`)) {
    throw new WorkspaceBrowserError('Knowledge response escaped the selected folder', 403)
  }
  return normalized.slice(base.length + 1)
}

export function rebaseKnowledgeListing(
  binding: SessionKnowledgeBinding,
  listing: WorkspaceListing,
): WorkspaceListing {
  const bindingPath = binding.path ?? '.'
  const current = rebasePath(bindingPath, listing.path)
  return {
    path: current,
    ...(current === '.' ? {} : {
      parent: listing.parent ? rebasePath(bindingPath, listing.parent) : '.',
    }),
    entries: listing.entries.flatMap((entry) => {
      try {
        return [{ ...entry, path: rebasePath(bindingPath, entry.path) }]
      } catch (error) {
        if (error instanceof WorkspaceBrowserError && error.statusCode === 403) return []
        throw error
      }
    }),
  }
}

export function rebaseKnowledgeFile(
  binding: SessionKnowledgeBinding,
  file: WorkspaceFile,
): WorkspaceFile {
  return { ...file, path: rebasePath(binding.path ?? '.', file.path) }
}
