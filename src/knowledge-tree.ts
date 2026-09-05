import type { WorkspaceEntry, WorkspaceListing } from '../shared/contracts'

/** Root of every knowledge listing, as the entries API expresses it. */
export const knowledgeRootPath = '.'

/**
 * One folder's fetch state. Folders are loaded lazily as they are expanded and
 * kept afterwards, so re-expanding is instant and collapsing never discards
 * what was already read.
 */
export interface KnowledgeFolderState {
  listing?: WorkspaceListing
  loading?: boolean
  error?: string
}

export type KnowledgeFolders = Record<string, KnowledgeFolderState>

export interface KnowledgeEntryRow {
  type: 'entry'
  /** Path of the entry itself, unique within a root. */
  path: string
  depth: number
  entry: WorkspaceEntry
  expandable: boolean
  expanded: boolean
}

export interface KnowledgeStatusRow {
  type: 'status'
  /** Folder the status belongs to, so keys stay unique per parent. */
  path: string
  depth: number
  variant: 'loading' | 'empty' | 'error'
  message?: string
}

export type KnowledgeRow = KnowledgeEntryRow | KnowledgeStatusRow

export function orderedWorkspaceEntries(entries: readonly WorkspaceEntry[]): WorkspaceEntry[] {
  return [...entries].sort((left, right) =>
    Number(right.kind === 'directory') - Number(left.kind === 'directory') ||
    left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: 'base' }),
  )
}

/**
 * Ancestor folders of a path, outermost first, excluding the root and the path
 * itself. Revealing a folder has to open everything above it or the row would
 * be flattened into a tree that never renders it.
 */
export function knowledgeAncestors(path: string): string[] {
  if (!path || path === knowledgeRootPath) {
    return []
  }
  const segments = path.split('/').filter((segment) => segment.length > 0)
  const ancestors: string[] = []
  let current = ''
  for (const segment of segments.slice(0, -1)) {
    current = current ? `${current}/${segment}` : segment
    ancestors.push(current)
  }
  return ancestors
}

/** Every folder that must be open for `path` to be visible, including itself. */
export function knowledgePathChain(path: string): string[] {
  if (!path || path === knowledgeRootPath) {
    return []
  }
  return [...knowledgeAncestors(path), path]
}

export function isKnowledgeFolderExpanded(
  expanded: string[],
  path: string,
): boolean {
  return path === knowledgeRootPath || expanded.includes(path)
}

/**
 * Collapsing a folder also collapses everything beneath it, so reopening it
 * does not restore a deep branch the reader had already dismissed.
 */
export function collapseKnowledgeFolder(
  expanded: string[],
  path: string,
): string[] {
  const prefix = `${path}/`
  return expanded.filter(
    (entry) => entry !== path && !entry.startsWith(prefix),
  )
}

export function expandKnowledgeFolder(
  expanded: string[],
  path: string,
): string[] {
  const chain = knowledgePathChain(path).filter(
    (entry) => !expanded.includes(entry),
  )
  return chain.length === 0 ? expanded : [...expanded, ...chain]
}

/**
 * Flattens the loaded folders into the rows the sidebar renders. Only expanded
 * folders contribute children, and each expanded folder reports its own
 * loading, empty, or error state so one unreachable branch cannot blank the
 * whole tree.
 */
export function knowledgeTreeRows(
  folders: KnowledgeFolders,
  expanded: string[],
  path: string = knowledgeRootPath,
  depth = 0,
  /**
   * Folders already open above this one. A listing that contains one of its
   * own ancestors would otherwise recurse until the stack is exhausted,
   * taking the whole app down rather than showing one odd branch.
   */
  ancestors: readonly string[] = [],
): KnowledgeRow[] {
  const state = folders[path]
  const listing = state?.listing
  const rows: KnowledgeRow[] = []

  if (!listing) {
    if (state?.error) {
      rows.push({
        type: 'status',
        path,
        depth,
        variant: 'error',
        message: state.error,
      })
    } else if (state?.loading) {
      rows.push({ type: 'status', path, depth, variant: 'loading' })
    }
    return rows
  }

  if (state?.error) {
    rows.push({ type: 'status', path, depth, variant: 'error', message: state.error })
  } else if (state?.loading) {
    rows.push({ type: 'status', path, depth, variant: 'loading', message: 'Refreshing folder...' })
  }

  if (listing.entries.length === 0) {
    rows.push({ type: 'status', path, depth, variant: 'empty' })
    return rows
  }

  // The folders already open at or above this one, so a listing that repeats
  // any of them is not followed a second time.
  const chain = [...ancestors, path]
  for (const entry of orderedWorkspaceEntries(listing.entries)) {
    const expandable = entry.kind === 'directory'
    const isExpanded = expandable && expanded.includes(entry.path)
    rows.push({
      type: 'entry',
      path: entry.path,
      depth,
      entry,
      expandable,
      expanded: isExpanded,
    })
    if (isExpanded && !chain.includes(entry.path)) {
      rows.push(
        ...knowledgeTreeRows(folders, expanded, entry.path, depth + 1, chain),
      )
    }
  }
  return rows
}

export interface KnowledgeCrumb {
  name: string
  path: string
}

/**
 * Breadcrumb for the folder the tree is focused on. The first crumb is the
 * root itself, so returning to the top never depends on a separate control.
 */
export function knowledgeCrumbs(
  path: string,
  rootName: string,
): KnowledgeCrumb[] {
  const crumbs: KnowledgeCrumb[] = [
    { name: rootName, path: knowledgeRootPath },
  ]
  if (!path || path === knowledgeRootPath) {
    return crumbs
  }
  let current = ''
  for (const segment of path.split('/').filter(Boolean)) {
    current = current ? `${current}/${segment}` : segment
    crumbs.push({ name: segment, path: current })
  }
  return crumbs
}
