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
import { documentUrlTransform, renderDocumentTree, splitDocumentTree } from './pipeline'

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
