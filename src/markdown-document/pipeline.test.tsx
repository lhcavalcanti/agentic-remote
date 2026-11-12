// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { Fragment } from 'react'
import type { ReactNode } from 'react'
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { describe, expect, it } from 'vitest'
import { outlineFromMarkdown, rehypeDocumentHeadings } from '../markdown-navigation'
import { remarkSafeBreaks } from '../remark-safe-breaks'
import { documentJsx } from './document-jsx'
import { documentOpening, documentRenderEvents, documentUrlTransform, renderDocumentTree, splitDocumentTree } from './pipeline'
import type { DocumentRenderEvent } from './pipeline'

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

  it('splits a long document into bounded chunks that render the same document', () => {
    const markdown = Array.from({ length: 60 }, (_, index) =>
      `## Part ${index}\n\n${'Words in a paragraph. '.repeat(20)}\n\n- one\n- two\n`).join('\n')
    const whole = renderDocumentTree(markdown).tree
    const chunks = splitDocumentTree(renderDocumentTree(markdown).tree, 2_000)
    expect(chunks.length).toBeGreaterThan(5)
    expect(chunks.some(hasPosition)).toBe(false)
    expect(html(chunks.map((chunk, index) => <Fragment key={index}>{documentJsx(chunk, components)}</Fragment>)))
      .toBe(html(documentJsx(whole, components)))
  })

  it('keeps a short document in one chunk', () => {
    expect(splitDocumentTree(renderDocumentTree('# One\n\nShort.\n').tree)).toHaveLength(1)
    expect(splitDocumentTree(renderDocumentTree('').tree)).toHaveLength(1)
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

  /** The page a reader ends with: every chunk since the last restart, in order. */
  function drawn(events: DocumentRenderEvent[]): string {
    let trees: DocumentRenderEvent[] = []
    for (const event of events) trees = event.kind === 'restart' ? [] : [...trees, event]
    return html(trees.map((event, index) => (
      event.kind === 'chunk' ? <Fragment key={index}>{documentJsx(event.tree, components)}</Fragment> : null
    )))
  }

  const whole = (source: string) => html(documentJsx(renderDocumentTree(source).tree, components))

  it('sends a short document whole, then its outline', () => {
    const events = [...documentRenderEvents(fixtures.headings!)]
    expect(events.map((event) => event.kind)).toEqual(['chunk', 'done'])
    expect(drawn(events)).toBe(whole(fixtures.headings!))
    expect(events.at(-1)).toEqual({ kind: 'done', outline: outlineFromMarkdown(fixtures.headings!) })
  })

  it("sends a long document's opening first and keeps it when the whole document agrees", () => {
    const source = long()
    const events = [...documentRenderEvents(source)]
    const opening = splitDocumentTree(renderDocumentTree(documentOpening(source)!).tree)
    expect(events.slice(0, opening.length)).toEqual(opening.map((tree) => ({ kind: 'chunk', tree })))
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
})
