// @vitest-environment jsdom
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { describe, expect, it } from 'vitest'
import { outlineFromMarkdown, rehypeDocumentHeadings } from '../markdown-navigation'
import { remarkSafeBreaks } from '../remark-safe-breaks'
import { documentJsx } from './document-jsx'
import { drawStep, emptyDrawing } from './draw'
import type { DocumentDrawing } from './draw'
import {
  documentOpening,
  documentParts,
  documentRenderEvents,
  documentUrlTransform,
  renderDocumentTree,
} from './pipeline'
import type { DocumentRenderEvent, DrawStep } from './pipeline'

const fixtures: Record<string, string> = {
  headings: '# Title\n\n## Repeat\n\ntext\n\n## Repeat\n\n#\n\n## ![](logo.png)\n\n## Repeat!\n\n### Café *déjà* vu\n',
  rawHtml: 'Before <script>alert(1)</script> after <b>bold</b>\n\n<div onclick="steal()">block</div>\n\n<!-- hidden -->\n',
  breaks: 'one<br>two<br/>three<br />four<br class="x">five<BR>six\n',
  links: '[rel](./doc.md) [js](javascript:alert(1)) [mail](mailto:a@b.c) [web](https://example.com)\n\n![img](images/a.png) ![bad](javascript:x) [frag](#repeat-1)\n',
  gfm: '| a | b |\n| - | - |\n| 1 | 2 |\n\n- [x] done\n- [ ] todo\n\n~~gone~~ https://auto.link\n\nNote[^1]\n\n[^1]: The note.\n',
  code: '```ts\nconst x = 1 < 2\n```\n\n```mermaid\ngraph TD; A-->B\n```\n\n    indented\n\n`inline <b>`\n',
  references: 'See [the guide][guide] and ![logo][logo].\n\n[guide]: ./guide.md "Guide"\n[logo]: ./logo.png\n',
}

// Components exercise the same override path the readers use.
const components: Components = {
  pre({ node: _node, children, ...rest }) {
    return <pre data-overridden="pre" {...rest}>{children}</pre>
  },
  img({ node: _node, ...rest }) {
    return <img data-overridden="img" {...rest} />
  },
  a({ node: _node, children, ...rest }) {
    return <a data-overridden="a" {...rest}>{children}</a>
  },
}

function html(node: ReactNode): string {
  const { container, unmount } = render(<div>{node}</div>)
  const result = container.innerHTML
  unmount()
  return result
}

function today(markdown: string): string {
  return html(
    <ReactMarkdown
      components={components}
      rehypePlugins={[rehypeDocumentHeadings]}
      remarkPlugins={[remarkGfm, remarkSafeBreaks]}
    >
      {markdown}
    </ReactMarkdown>,
  )
}

function hasPosition(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false
  if ('position' in node) return true
  const children = (node as { children?: unknown[] }).children
  return Array.isArray(children) && children.some(hasPosition)
}

describe('document pipeline', () => {
  it.each(Object.entries(fixtures))('renders %s exactly as ReactMarkdown does', (_name, markdown) => {
    expect(html(documentJsx(renderDocumentTree(markdown).tree, components))).toBe(today(markdown))
  })

  it.each(Object.entries(fixtures))('outlines %s exactly as outlineFromMarkdown does', (_name, markdown) => {
    expect(renderDocumentTree(markdown).outline).toEqual(outlineFromMarkdown(markdown))
  })

  it('filters URLs exactly as ReactMarkdown does', () => {
    const urls = [
      '', './a', '/a', '#x', '?q', 'a:b', 'http://x', 'HTTPS://x', 'mailto:x', 'javascript:x',
      'JAVASCRIPT:x', 'data:text/html,x', 'vbscript:x', 'ircs://x', 'xmpp:x', 'a/b:c', 'a?b:c',
      'a#b:c', ' javascript:x', 'java\nscript:x',
    ]
    for (const url of urls) expect(documentUrlTransform(url)).toBe(defaultUrlTransform(url))
  })

})

/** The page drawn from `parts`, its blocks' contents in order: what the reader sees. */
function drawnPage(parts: DrawStep[][]): string {
  const drawing = parts.flat().reduce<DocumentDrawing>((sofar, step) => drawStep(sofar, step, components), emptyDrawing)
  const { container, unmount } = render(<div>{drawing.blocks}</div>)
  const result = [...container.querySelectorAll(':scope > div > .document-chunk')].map((block) => block.innerHTML).join('')
  unmount()
  return result
}

/** The page a whole-document render makes. */
function wholePage(markdown: string): string {
  const { container, unmount } = render(<div>{documentJsx(renderDocumentTree(markdown).tree, components)}</div>)
  const result = container.firstElementChild!.innerHTML
  unmount()
  return result
}

/** About `bytes` of Markdown made of `unit` repeated. */
function repeated(bytes: number, unit: (index: number) => string): string {
  let body = ''
  for (let index = 1; body.length < bytes; index += 1) body += unit(index)
  return body
}

describe('document parts', () => {
  it('draws a long document in bounded parts that make the same page', () => {
    const markdown = Array.from({ length: 60 }, (_, index) =>
      `## Part ${index}\n\n${'Words in a paragraph. '.repeat(20)}\n\n- one\n- two\n`).join('\n')
    const parts = [...documentParts(renderDocumentTree(markdown).tree.children, { budget: 2_000 })]
    expect(parts.length).toBeGreaterThan(5)
    expect(parts.some((part) => part.some((step) => step.nodes.some(hasPosition)))).toBe(false)
    expect(drawnPage(parts)).toBe(wholePage(markdown))
  })

  it.each([
    ['table', `| Check | Result |\n| --- | :-: |\n${repeated(6_000, (index) => `| check ${index} | **passed** |\n`)}`],
    ['list', repeated(6_000, (index) => `- Change ${index} with [a link](plans/${index}.md)\n`)],
    ['numbered list', repeated(6_000, (index) => `${index}. Step ${index}\n`)],
    ['nested list', `- Everything\n${repeated(6_000, (index) => `  - Item ${index}\n`)}\nAfter the list.\n`],
    ['quote', repeated(6_000, (index) => `> Quoted line ${index}\n>\n`)],
    ['paragraph', repeated(6_000, (index) => `word${index} *em${index}* `)],
    ['footnotes', `${Array.from({ length: 400 }, (_, index) => `Note[^${index}]`).join(' ')}\n\n${
      Array.from({ length: 400 }, (_, index) => `[^${index}]: Note ${index}.\n`).join('')}`],
    ['plain paragraph', repeated(30_000, (index) => `plain words ${index}${index % 8 === 0 ? '\n' : ' '}`)],
    ['fence', `\`\`\`text\n${repeated(30_000, (index) => `line ${index} of the log\n`)}\`\`\`\n`],
  ])('fills one long %s over several parts, ending with the same page', (_name, markdown) => {
    const parts = [...documentParts(renderDocumentTree(markdown).tree.children, { budget: 1_000 })]
    expect(parts.length).toBeGreaterThan(3)
    expect(Math.max(...parts.flat().map((step) => step.depth))).toBeGreaterThan(0)
    expect(drawnPage(parts)).toBe(wholePage(markdown))
  })

  it('ends the pieces of a long run of text at line ends', () => {
    const markdown = `\`\`\`text\n${repeated(30_000, (index) => `line ${index} of the log\n`)}\`\`\`\n`
    const pieces = [...documentParts(renderDocumentTree(markdown).tree.children, { budget: 1_000 })]
      .flat()
      .flatMap((step) => step.nodes)
      .filter((node) => node.type === 'text')
      .map((node) => (node as { value: string }).value)
    expect(pieces.length).toBeGreaterThan(2)
    expect(pieces.slice(0, -1).every((piece) => piece.endsWith('\n') && piece.length <= 8_000)).toBe(true)
  })

  it('draws a diagram fence in one part', () => {
    const markdown = `\`\`\`mermaid\ngraph TD\n${repeated(30_000, (index) => `  A${index} --> B${index}\n`)}\`\`\`\n`
    const parts = [...documentParts(renderDocumentTree(markdown).tree.children, { budget: 1_000 })]
    expect(parts.flat().every((step) => step.depth === 0)).toBe(true)
  })

  it('draws an element some reader draws with a component in one part', () => {
    const markdown = `| a |\n| - |\n${repeated(6_000, (index) => `| ${index} |\n`)}`
    const parts = [...documentParts(renderDocumentTree(markdown).tree.children, { budget: 1_000, whole: ['table'] })]
    expect(parts.flat().every((step) => step.depth === 0)).toBe(true)
    expect(drawnPage(parts)).toBe(wholePage(markdown))
  })
})

describe('document opening', () => {
  const section = (index: number) => `## Section ${index}\n\n${'A sentence of body text. '.repeat(40)}\n\n`

  it('leaves short documents to render whole', () => {
    expect(documentOpening(section(1), 4_096)).toBeUndefined()
  })

  it('ends just before a heading, within the limit', () => {
    const source = Array.from({ length: 40 }, (_, index) => section(index)).join('')
    const opening = documentOpening(source, 4_096)!
    expect(opening.length).toBeLessThanOrEqual(4_096)
    expect(source.slice(opening.length)).toMatch(/^## Section \d+\n/)
    expect(source.startsWith(opening)).toBe(true)
  })

  it('without headings, ends before a block, or else at a line', () => {
    const paragraphs = repeated(40_000, (index) => `Paragraph ${index} has a sentence.\n\n`)
    const opening = documentOpening(paragraphs, 4_096)!
    expect(opening.length).toBeLessThanOrEqual(4_096)
    expect(opening.endsWith('\n\n')).toBe(true)

    const list = repeated(40_000, (index) => `- Item ${index}\n`)
    const listOpening = documentOpening(list, 4_096)!
    expect(listOpening.length).toBeLessThanOrEqual(4_096)
    expect(list.slice(listOpening.length)).toMatch(/^- Item \d+\n/)
  })

  it('never ends before a line that changes how the one before it reads', () => {
    const table = `| a | b |\n${repeated(40_000, (index) => `| ${index} | x |\n|---|---|\n`)}`
    const opening = documentOpening(table, 4_096)!
    expect(table.slice(opening.length)).not.toMatch(/^\|---/)
    const setext = repeated(40_000, (index) => `Title ${index}\n===\n`)
    expect(setext.slice(documentOpening(setext, 4_096)!.length)).not.toMatch(/^===/)
  })

  it('never ends inside a code fence or a preformatted HTML block', () => {
    const fenced = '```md\n' + Array.from({ length: 200 }, (_, index) => `# not a heading ${index}`).join('\n') + '\n```\n\n'
    const pre = '<pre>\n' + Array.from({ length: 200 }, (_, index) => `# inside pre ${index}`).join('\n') + '\n</pre>\n\n'
    const source = section(0) + fenced + pre + Array.from({ length: 40 }, (_, index) => section(index + 1)).join('')
    const opening = documentOpening(source, 12_288)
    if (opening !== undefined) {
      expect(opening).not.toMatch(/```md\n(?![\s\S]*```\n)/)
      expect(opening.split('<pre>').length).toBe(opening.split('</pre>').length)
      expect(source.slice(opening.length)).toMatch(/^## Section \d+\n/)
    }
  })
})

describe('document render events', () => {
  const part = (index: number) => `## Part ${index}\n\n${'Words in a paragraph. '.repeat(30)}\n\n- one\n- two\n\n`
  const long = (extra = '') => Array.from({ length: 200 }, (_, index) => part(index)).join('') + extra

  /** The page a reader ends with: every part since the last restart, in order. */
  function drawn(events: DocumentRenderEvent[]): string {
    let parts: DrawStep[][] = []
    for (const event of events) {
      if (event.kind === 'restart') parts = []
      else if (event.kind === 'part') parts = [...parts, event.steps]
    }
    return drawnPage(parts)
  }

  const whole = wholePage

  it('sends a short document whole, then its outline', () => {
    const events = [...documentRenderEvents(fixtures.headings!)]
    expect(events.map((event) => event.kind)).toEqual(['part', 'done'])
    expect(drawn(events)).toBe(whole(fixtures.headings!))
    expect(events.at(-1)).toEqual({ kind: 'done', outline: outlineFromMarkdown(fixtures.headings!) })
  })

  it("sends a long document's opening first and keeps it when the whole document agrees", () => {
    const source = long()
    const events = [...documentRenderEvents(source)]
    const opening = [...documentParts(renderDocumentTree(documentOpening(source)!).tree.children)]
    expect(events.slice(0, opening.length)).toEqual(opening.map((steps) => ({ kind: 'part', steps })))
    expect(events.map((event) => event.kind)).not.toContain('restart')
    expect(drawn(events)).toBe(whole(source))
    expect(events.at(-1)).toEqual({ kind: 'done', outline: outlineFromMarkdown(source) })
  })

  it('starts over when the rest of the document changes how the opening reads', () => {
    const source = `See [the guide][later] and a note[^1].\n\n${long('[later]: ./guide.md\n\n[^1]: Defined at the end.\n')}`
    const events = [...documentRenderEvents(source)]
    expect(events.filter((event) => event.kind === 'restart')).toHaveLength(1)
    expect(drawn(events)).toBe(whole(source))
  })

  it('shows the start of a long document without headings, then starts over with the whole of it', () => {
    const source = repeated(80_000, (index) => `- Change ${index}\n`)
    const events = [...documentRenderEvents(source)]
    expect(events[0]!.kind).toBe('part')
    expect(events.filter((event) => event.kind === 'restart')).toHaveLength(1)
    expect(drawn(events)).toBe(whole(source))
  })

  it('passes on which elements to draw whole', () => {
    const source = `${'Intro paragraph.\n\n'.repeat(3_000)}| a |\n| - |\n${repeated(40_000, (index) => `| ${index} |\n`)}`
    const steps = [...documentRenderEvents(source, ['table'])]
      .flatMap((event) => (event.kind === 'part' ? event.steps : []))
    expect(steps.every((step) => step.depth === 0)).toBe(true)
  })
})
