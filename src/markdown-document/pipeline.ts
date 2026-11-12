import type { Root as HastRoot, RootContent as HastContent } from 'hast'
import { urlAttributes } from 'html-url-attributes'
import type { Root as MdastRoot } from 'mdast'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'
import { outlineFromTree, rehypeDocumentHeadings } from '../markdown-navigation'
import type { DocumentHeading } from '../markdown-navigation'
import { remarkSafeBreaks } from '../remark-safe-breaks'

/**
 * The document renderer's work up to, but not including, JSX: exactly what
 * `<ReactMarkdown remarkPlugins={[remarkGfm, remarkSafeBreaks]}
 * rehypePlugins={[rehypeDocumentHeadings]}>` does before `toJsxRuntime`. It
 * imports nothing from React or the DOM, so it runs in a Web Worker.
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkSafeBreaks)
  // As ReactMarkdown: raw HTML survives as `raw` nodes, which become text below.
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeDocumentHeadings)

export interface RenderedDocumentTree {
  tree: HastRoot
  outline: DocumentHeading[]
}

export function renderDocumentTree(source: string): RenderedDocumentTree {
  const mdast = processor.parse(source) as MdastRoot
  const tree = processor.runSync(mdast) as HastRoot
  // `remarkSafeBreaks` changed `mdast` in place, as `outlineFromMarkdown` does.
  const outline = outlineFromTree(mdast)
  visit(tree, (node, index, parent) => {
    if ((node as { type: string }).type === 'raw' && parent && typeof index === 'number') {
      // ReactMarkdown shows raw HTML as its literal text; it never parses it.
      parent.children[index] = { type: 'text', value: (node as unknown as { value: string }).value }
      return index
    }
    if (node.type === 'element') {
      for (const key in urlAttributes) {
        if (Object.hasOwn(urlAttributes, key) && Object.hasOwn(node.properties, key)) {
          const test = urlAttributes[key]
          if (test === null || test.includes(node.tagName)) {
            node.properties[key] = documentUrlTransform(String(node.properties[key] || ''))
          }
        }
      }
    }
    return undefined
  })
  return { tree, outline }
}

const safeProtocol = /^(https?|ircs?|mailto|xmpp)$/i

/** ReactMarkdown's `defaultUrlTransform`: relative URLs and safe protocols only. */
export function documentUrlTransform(value: string): string {
  const colon = value.indexOf(':')
  const questionMark = value.indexOf('?')
  const numberSign = value.indexOf('#')
  const slash = value.indexOf('/')
  if (
    colon === -1 ||
    (slash !== -1 && colon > slash) ||
    (questionMark !== -1 && colon > questionMark) ||
    (numberSign !== -1 && colon > numberSign) ||
    safeProtocol.test(value.slice(0, colon))
  ) {
    return value
  }
  return ''
}

function sourceLength(node: HastContent): number {
  const { start, end } = node.position ?? {}
  if (start?.offset !== undefined && end?.offset !== undefined) return end.offset - start.offset
  return node.type === 'text' ? node.value.length : 0
}

function withoutPositions<T extends { position?: unknown; children?: unknown[] }>(node: T): T {
  delete node.position
  node.children?.forEach((child) => withoutPositions(child as T))
  return node
}

/**
 * Consecutive slices of the document's top-level nodes, each covering about
 * `maxSourceChars` of Markdown, so the page can turn one slice into elements
 * per task. Positions are dropped: they only enlarge what crosses threads.
 */
export function splitDocumentTree(tree: HastRoot, maxSourceChars = 16_384): HastRoot[] {
  const chunks: HastRoot[] = []
  let children: HastContent[] = []
  let size = 0
  for (const node of tree.children) {
    children.push(node)
    size += sourceLength(node)
    if (size >= maxSourceChars) {
      chunks.push({ type: 'root', children })
      children = []
      size = 0
    }
  }
  if (children.length || !chunks.length) chunks.push({ type: 'root', children })
  return chunks.map(withoutPositions)
}

const fenceOpening = /^ {0,3}(`{3,}|~{3,})(.*)$/
const fenceClosing = /^ {0,3}(`{3,}|~{3,})[ \t]*$/
/** HTML blocks that, unlike the others, continue past blank lines (CommonMark types 1–5). */
const htmlBlocks: [start: RegExp, end: RegExp][] = [
  [/^ {0,3}<(?:pre|script|style|textarea)(?:[ \t>]|$)/i, /<\/(?:pre|script|style|textarea)>/i],
  [/^ {0,3}<!--/, /-->/],
  [/^ {0,3}<\?/, /\?>/],
  [/^ {0,3}<![A-Za-z]/, />/],
  [/^ {0,3}<!\[CDATA\[/, /\]\]>/],
]
const topLevelHeading = /^#{1,6}(?:[ \t]|$)/

/**
 * The start of a long document, up to just before a top-level heading within
 * `limit` characters, so a reader can show it while the rest is parsed. Absent
 * for short documents. The cut is only a likely block boundary: whoever shows
 * the opening must check it against the whole document's render.
 */
export function documentOpening(source: string, limit = 16_384): string | undefined {
  if (source.length <= limit * 2) return undefined
  let cut: number | undefined
  let fence: string | undefined
  let htmlEnd: RegExp | undefined
  let previousBlank = true
  for (let offset = 0; offset <= limit;) {
    const newline = source.indexOf('\n', offset)
    const line = source.slice(offset, newline === -1 ? source.length : newline).replace(/\r$/, '')
    if (fence) {
      const closing = fenceClosing.exec(line)?.[1]
      if (closing?.[0] === fence[0] && closing.length >= fence.length) fence = undefined
    } else if (htmlEnd) {
      if (htmlEnd.test(line)) htmlEnd = undefined
    } else if (offset > 0 && previousBlank && topLevelHeading.test(line)) {
      cut = offset
    } else {
      const opening = fenceOpening.exec(line)
      if (opening && !(opening[1]![0] === '`' && opening[2]!.includes('`'))) {
        fence = opening[1]
      } else {
        const block = htmlBlocks.find(([start]) => start.test(line))
        if (block && !block[1].test(line)) htmlEnd = block[1]
      }
    }
    previousBlank = line.trim() === ''
    if (newline === -1) break
    offset = newline + 1
  }
  return cut === undefined ? undefined : source.slice(0, cut)
}

/** What a render reports: chunks in drawing order, then the outline. */
export type DocumentRenderEvent =
  | { kind: 'chunk'; tree: HastRoot }
  /** The chunks so far, a long document's opening, read differently in the whole document. */
  | { kind: 'restart' }
  | { kind: 'done'; outline: DocumentHeading[] }
  | { kind: 'error'; message: string }

/** Equal hast, ignoring source positions. */
function sameNode(left: unknown, right: unknown): boolean {
  if (left === right) return true
  if (typeof left !== 'object' || typeof right !== 'object' || left === null || right === null) return false
  if (Array.isArray(left) !== Array.isArray(right)) return false
  const keys = Object.keys(left).filter((key) => key !== 'position')
  return keys.length === Object.keys(right).filter((key) => key !== 'position').length
    && keys.every((key) => Object.hasOwn(right, key)
      && sameNode((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key]))
}

/**
 * A document's render in the order a reader draws it. A long document's
 * opening comes first, before the whole document is parsed. It stays only if
 * the whole document renders exactly those nodes there -- a definition or
 * footnote further down can change it -- and is otherwise drawn again.
 */
export function* documentRenderEvents(source: string): Generator<DocumentRenderEvent, void, undefined> {
  const opening = documentOpening(source)
  const shown = opening === undefined ? [] : renderDocumentTree(opening).tree.children
  if (shown.length) {
    for (const tree of splitDocumentTree({ type: 'root', children: shown })) yield { kind: 'chunk', tree }
  }
  const { tree, outline } = renderDocumentTree(source)
  let rest = tree.children
  if (shown.length) {
    const end = opening!.length
    const prefix = rest.slice(0, shown.length)
    const next = rest.slice(shown.length).find((node) => node.position)
    const kept = prefix.length === shown.length
      && prefix.every((node, index) => (node.position?.end.offset ?? 0) <= end && sameNode(node, shown[index]))
      && (next?.position?.start.offset ?? end) >= end
    if (kept) rest = rest.slice(shown.length)
    else yield { kind: 'restart' }
  }
  if (rest.length || !shown.length) {
    for (const chunk of splitDocumentTree({ type: 'root', children: rest })) yield { kind: 'chunk', tree: chunk }
  }
  yield { kind: 'done', outline }
}
