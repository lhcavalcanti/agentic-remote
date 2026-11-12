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

/** What a render reports: every chunk in order, then the outline. */
export type DocumentRenderEvent =
  | { kind: 'chunk'; index: number; count: number; tree: HastRoot }
  | { kind: 'done'; outline: DocumentHeading[] }
  | { kind: 'error'; message: string }

export function renderDocumentEvents(source: string): DocumentRenderEvent[] {
  const { tree, outline } = renderDocumentTree(source)
  const chunks = splitDocumentTree(tree)
  return [
    ...chunks.map((chunk, index): DocumentRenderEvent => ({ kind: 'chunk', index, count: chunks.length, tree: chunk })),
    { kind: 'done', outline },
  ]
}
