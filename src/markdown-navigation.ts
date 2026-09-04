import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import type { Root, RootContent } from 'mdast'

export interface DocumentHeading {
  id: string
  text: string
  level: number
  /** Position among the document's headings, used to scroll to the right one. */
  index: number
}

export interface BreadcrumbSegment {
  name: string
  path: string
}

/**
 * GitHub-style heading slug: lowercase, punctuation dropped, spaces to dashes.
 * Duplicate slugs get a numeric suffix so every anchor stays unique.
 */
export function headingSlug(text: string, used?: Map<string, number>): string {
  const base =
    text
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'section'
  if (!used) {
    return base
  }
  const seen = used.get(base)
  used.set(base, (seen ?? 0) + 1)
  return seen === undefined ? base : `${base}-${seen}`
}

/** Flattens a React heading child tree to its plain text. */
export function headingText(node: unknown): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return ''
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(headingText).join('')
  }
  const children = (node as { props?: { children?: unknown } }).props?.children
  return children === undefined ? '' : headingText(children)
}

/**
 * Splits a workspace-relative path into navigable ancestors. The root is always
 * first, and the file itself is returned as a trailing, non-navigable segment.
 */
export function breadcrumbSegments(
  path: string,
  rootName = '~',
): BreadcrumbSegment[] {
  const trimmed = path.trim()
  const parts =
    trimmed === '.' || trimmed === ''
      ? []
      : trimmed.split('/').filter((part) => part && part !== '.')
  const segments: BreadcrumbSegment[] = [{ name: rootName, path: '.' }]
  let current = ''
  for (const part of parts) {
    current = current ? `${current}/${part}` : part
    segments.push({ name: part, path: current })
  }
  return segments
}

/**
 * Reduces inline Markdown to the text a reader sees, so an outline entry
 * matches the heading that gets rendered.
 */
export function inlineText(markdown: string): string {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
    .replace(/`+([^`]*)`+/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Collects the document's headings, in the order they are rendered.
 *
 * Parsed with the same grammar the page is rendered with -- remark, plus GFM
 * -- rather than by matching lines. An outline entry is matched to the
 * document by its position among the rendered headings, so anything the
 * renderer calls a heading has to be counted here and nothing else may be.
 * Reading the source by hand kept diverging from that in both directions: it
 * missed underlined headings, and it read front matter and a link reference
 * definition above a rule as headings the renderer never draws.
 */
export function outlineFromMarkdown(content: string): DocumentHeading[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(content)
  const headings: DocumentHeading[] = []
  const visit = (node: RootContent | Root) => {
    if (node.type === 'heading') {
      const text = nodeText(node)
      if (text) {
        headings.push({
          id: headingSlug(text),
          text,
          level: node.depth,
          index: headings.length,
        })
      }
      return
    }
    if ('children' in node) {
      for (const child of node.children as RootContent[]) {
        visit(child)
      }
    }
  }
  visit(tree)
  return headings
}

/** The text a reader sees for a node, matching what the renderer draws. */
function nodeText(node: RootContent): string {
  if (node.type === 'text' || node.type === 'inlineCode') {
    return node.value
  }
  if (node.type === 'image') {
    return node.alt || ''
  }
  if (node.type === 'break') {
    return ' '
  }
  if (node.type === 'html') {
    return ''
  }
  if ('children' in node) {
    return (node.children as RootContent[]).map(nodeText).join('')
  }
  return ''
}

export interface NavigationEntry {
  path: string
  kind: 'file' | 'folder'
  scrollTop?: number
}

/**
 * Pushes an entry onto a back/forward stack, discarding any forward history and
 * collapsing a repeat of the current entry.
 */
export function pushNavigation(
  history: NavigationEntry[],
  index: number,
  entry: NavigationEntry,
): { history: NavigationEntry[]; index: number } {
  const current = history[index]
  if (current && current.path === entry.path && current.kind === entry.kind) {
    return { history, index }
  }
  const next = [...history.slice(0, index + 1), entry]
  return { history: next, index: next.length - 1 }
}

/** Records the scroll offset of the entry currently in view. */
export function rememberScroll(
  history: NavigationEntry[],
  index: number,
  scrollTop: number,
): NavigationEntry[] {
  if (index < 0 || index >= history.length) {
    return history
  }
  const next = [...history]
  next[index] = { ...next[index], scrollTop }
  return next
}

/**
 * Resolves a Markdown image or link source against the document that contains
 * it, keeping the result inside the workspace or knowledge root. Returns
 * undefined for anything that escapes, so the caller can leave it unresolved
 * rather than issuing a request that the server would refuse anyway.
 */
export function resolveDocumentPath(
  documentPath: string,
  source: string,
): string | undefined {
  const raw = source.trim()
  if (!raw || raw.startsWith('#')) {
    return undefined
  }
  const withoutQuery = raw.split(/[?#]/, 1)[0]
  if (!withoutQuery) {
    return undefined
  }
  let decoded = withoutQuery
  try {
    decoded = decodeURIComponent(withoutQuery)
  } catch {
    // A malformed escape is used as written rather than failing outright.
  }
  if (decoded.startsWith('/')) {
    return undefined
  }
  const base = documentPath.includes('/')
    ? documentPath.slice(0, documentPath.lastIndexOf('/'))
    : ''
  const segments = base ? base.split('/') : []
  for (const segment of decoded.split('/')) {
    if (!segment || segment === '.') {
      continue
    }
    if (segment === '..') {
      if (segments.length === 0) {
        return undefined
      }
      segments.pop()
      continue
    }
    segments.push(segment)
  }
  return segments.length > 0 ? segments.join('/') : undefined
}

/** True for sources the browser should load itself rather than the workspace. */
export function isExternalSource(source: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(source.trim())
}
