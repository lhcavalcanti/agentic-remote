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

/** How much Markdown `node` stands for; an element made by the renderer itself (footnotes) counts its children. */
function sourceLength(node: HastContent): number {
  const { start, end } = node.position ?? {}
  if (start?.offset !== undefined && end?.offset !== undefined) return end.offset - start.offset
  if (node.type === 'text') return node.value.length
  return 'children' in node ? node.children.reduce((sum, child) => sum + sourceLength(child), 0) : 0
}

function withoutPositions<T extends { position?: unknown; children?: unknown[] }>(node: T): T {
  delete node.position
  node.children?.forEach((child) => withoutPositions(child as T))
  return node
}

/** One step of drawing: `nodes` added, in order, to the element `depth` levels down the page's last one (0: the page itself). */
export interface DrawStep {
  depth: number
  nodes: HastContent[]
}

/**
 * Elements a reader may draw a part at a time. No reader replaces one with a
 * component, and children added to one leave those drawn before as they were.
 */
const growable = new Set(['blockquote', 'li', 'ol', 'p', 'section', 'table', 'tbody', 'tfoot', 'thead', 'ul'])

/** The steps that draw `children` into the element `depth` levels down, about `budget` characters of source each. */
function* drawSteps(
  children: HastContent[],
  depth: number,
  budget: number,
  whole: ReadonlySet<string>,
): Generator<DrawStep & { size: number }, void, undefined> {
  let nodes: HastContent[] = []
  let size = 0
  for (const node of children) {
    const length = sourceLength(node)
    if (
      length > budget && node.type === 'element' && growable.has(node.tagName) &&
      !whole.has(node.tagName) && node.children.length > 1
    ) {
      // Too large to draw at once: drawn empty, then filled.
      nodes.push({ ...node, children: [] })
      yield { depth, nodes, size }
      nodes = []
      size = 0
      yield* drawSteps(node.children, depth + 1, budget, whole)
      continue
    }
    nodes.push(node)
    size += length
    if (size >= budget) {
      yield { depth, nodes, size }
      nodes = []
      size = 0
    }
  }
  if (nodes.length) yield { depth, nodes, size }
}

/**
 * How a reader draws a document's top-level `nodes`: in parts of about
 * `budget` characters of Markdown, one a frame. An element too large for one
 * part -- a long table, list, quote, or paragraph -- is filled over several,
 * unless its tag is in `whole`. Positions are taken off the nodes as they go:
 * they would only enlarge what crosses threads.
 */
export function* documentParts(
  nodes: HastContent[],
  options: { budget?: number; whole?: Iterable<string> } = {},
): Generator<DrawStep[], void, undefined> {
  const budget = options.budget ?? 16_384
  let part: DrawStep[] = []
  let size = 0
  for (const step of drawSteps(nodes, 0, budget, new Set(options.whole))) {
    part.push({ depth: step.depth, nodes: step.nodes.map(withoutPositions) })
    size += step.size
    if (size >= budget) {
      yield part
      part = []
      size = 0
    }
  }
  if (part.length) yield part
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
// A line that changes how the one before it reads: a setext underline or a table's delimiter row.
const changesLineBefore = /^ {0,3}(?:=+|-+)[ \t]*$|^ {0,3}\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/

/**
 * The start of a long document, within `limit` characters, so a reader can
 * show it while the rest is parsed; absent for short documents. It ends just
 * before a top-level heading if it can, else before a block, else at a line,
 * never inside a code fence or a preformatted HTML block. The cut is only
 * likely to fall between blocks: whoever shows the opening must check it
 * against the whole document's render.
 */
export function documentOpening(source: string, limit = 16_384): string | undefined {
  if (source.length <= limit * 2) return undefined
  let heading: number | undefined
  let block: number | undefined
  let line: number | undefined
  let fence: string | undefined
  let htmlEnd: RegExp | undefined
  let previousBlank = true
  for (let offset = 0; offset <= limit;) {
    const newline = source.indexOf('\n', offset)
    const text = source.slice(offset, newline === -1 ? source.length : newline).replace(/\r$/, '')
    const blank = text.trim() === ''
    if (fence) {
      const closing = fenceClosing.exec(text)?.[1]
      if (closing?.[0] === fence[0] && closing.length >= fence.length) fence = undefined
    } else if (htmlEnd) {
      if (htmlEnd.test(text)) htmlEnd = undefined
    } else {
      if (offset > 0 && !blank) {
        if (previousBlank && topLevelHeading.test(text)) heading = offset
        else if (previousBlank) block = offset
        else if (!changesLineBefore.test(text)) line = offset
      }
      const opening = fenceOpening.exec(text)
      if (opening && !(opening[1]![0] === '`' && opening[2]!.includes('`'))) {
        fence = opening[1]
      } else {
        const html = htmlBlocks.find(([start]) => start.test(text))
        if (html && !html[1].test(text)) htmlEnd = html[1]
      }
    }
    previousBlank = blank
    if (newline === -1) break
    offset = newline + 1
  }
  const cut = heading ?? block ?? line
  return cut === undefined ? undefined : source.slice(0, cut)
}

/** What a render reports: the parts to draw, in order, then the outline. */
export type DocumentRenderEvent =
  | { kind: 'part'; steps: DrawStep[] }
  /** The parts so far, a long document's opening, read differently in the whole document. */
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
export function* documentRenderEvents(
  source: string,
  whole: Iterable<string> = [],
): Generator<DocumentRenderEvent, void, undefined> {
  const options = { whole: [...whole] }
  const opening = documentOpening(source)
  const shown = opening === undefined ? [] : renderDocumentTree(opening).tree.children
  for (const steps of documentParts(shown, options)) yield { kind: 'part', steps }
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
  for (const steps of documentParts(rest, options)) yield { kind: 'part', steps }
  yield { kind: 'done', outline }
}
