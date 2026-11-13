import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import type { Root, RootContent } from 'mdast'
import { remarkSafeBreaks } from './remark-safe-breaks'

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
  let suffix = used.get(base) ?? 0
  let slug = base
  while (used.has(slug)) {
    suffix += 1
    slug = `${base}-${suffix}`
  }
  used.set(base, suffix)
  used.set(slug, 0)
  return slug
}

interface MarkdownNode {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: MarkdownNode[]
}

function markdownNodeText(node: MarkdownNode): string {
  if (node.type === 'text') {
    return node.value || ''
  }
  if (node.tagName === 'br') {
    return ' '
  }
  if (node.tagName === 'img' && typeof node.properties?.alt === 'string') {
    return node.properties.alt
  }
  return node.children?.map(markdownNodeText).join('') || ''
}

export function rehypeDocumentHeadings() {
  return (tree: MarkdownNode) => {
    const used = new Map<string, number>()
    function visit(node: MarkdownNode) {
      if (node.type === 'element' && /^h[1-6]$/.test(node.tagName || '')) {
        node.properties = {
          ...node.properties,
          id: headingSlug(markdownNodeText(node), used),
          tabIndex: -1,
        }
      }
      node.children?.forEach(visit)
    }
    visit(tree)
  }
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
  remarkSafeBreaks()(tree)
  return outlineFromTree(tree)
}

/** The outline of an already parsed document, after `remarkSafeBreaks`. */
export function outlineFromTree(tree: Root): DocumentHeading[] {
  const headings: DocumentHeading[] = []
  const used = new Map<string, number>()
  // Counted separately from the entries. An outline entry is found in the
  // document by its position among the rendered headings, and a heading with
  // nothing to show -- `#` on its own, or one made only of an image with no
  // alt text -- is still drawn. Leaving it out of the count as well as out of
  // the list sent every later entry to the heading before its own.
  let rendered = 0
  const visit = (node: RootContent | Root) => {
    if (node.type === 'heading') {
      const text = nodeText(node)
      const id = headingSlug(text, used)
      const index = rendered
      rendered += 1
      if (text) {
        headings.push({
          id,
          text,
          level: node.depth,
          index,
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
  if (node.type === 'image' || node.type === 'imageReference') {
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

export type DocumentLink =
  | { kind: 'external' }
  | { kind: 'invalid'; error: string }
  | { kind: 'document'; path: string; fragment?: string }

export function resolveDocumentLink(documentPath: string, href: string): DocumentLink {
  const source = href.trim()
  if (isExternalSource(source)) {
    return { kind: 'external' }
  }
  const hash = source.indexOf('#')
  let fragment: string | undefined
  if (hash >= 0) {
    try {
      fragment = decodeURIComponent(source.slice(hash + 1))
    } catch {
      return { kind: 'invalid', error: 'This link contains an invalid section anchor.' }
    }
  }
  const path = !source || source.startsWith('#') || source.startsWith('?')
    ? documentPath
    : resolveDocumentPath(documentPath, source)
  return path
    ? { kind: 'document', path, fragment }
    : { kind: 'invalid', error: 'This link points outside the document root.' }
}

const scrollKeys = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '])

/**
 * Whether an input event on a scrolling document is the reader moving it
 * themselves: a wheel, a swipe, a scrolling key, or a press on its scroll bar.
 */
export function isReaderScroll(event: {
  type: string
  key?: string
  target: unknown
  currentTarget: unknown
}): boolean {
  switch (event.type) {
    case 'wheel':
    case 'touchmove':
      return true
    case 'keydown':
      return scrollKeys.has(event.key ?? '')
    case 'pointerdown':
      return event.target === event.currentTarget
    default:
      return false
  }
}

export function scrollToDocumentFragment(
  container: HTMLElement | null,
  fragment: string,
): boolean {
  if (!container) {
    return false
  }
  if (!fragment) {
    container.scrollTop = 0
    return true
  }
  const heading = Array.from(
    container.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6'),
  ).find((candidate) => candidate.id === fragment)
  if (!heading) {
    return false
  }
  heading.focus({ preventScroll: true })
  heading.scrollIntoView({ block: 'start' })
  return true
}

export function scrollToDocumentHeading(
  container: HTMLElement | null,
  index: number,
): boolean {
  const heading = container
    ?.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6')[index]
  if (!heading) return false
  heading.focus({ preventScroll: true })
  heading.scrollIntoView({ block: 'start' })
  return true
}
