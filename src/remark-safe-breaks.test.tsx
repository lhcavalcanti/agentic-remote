// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render } from '@testing-library/react'
import type { Root } from 'mdast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { afterEach, describe, expect, it } from 'vitest'
import { remarkSafeBreaks } from './remark-safe-breaks'

afterEach(cleanup)

function markdown(source: string) {
  return render(<ReactMarkdown remarkPlugins={[remarkGfm, remarkSafeBreaks]}>
    {source}
  </ReactMarkdown>)
}

describe('exact safe Markdown breaks', () => {
  it.each(['<br>', '<br/>', '<br />', '<BR>', '<Br/>', '<bR />'])(
    'renders only the exact %s tag as a hard break',
    (tag) => {
      const { container } = markdown(`first${tag}second`)
      expect(container.querySelector('p')?.innerHTML).toBe('first<br>\nsecond')
      expect(container.querySelector('br')?.attributes).toHaveLength(0)
    },
  )

  it.each(['<br>', '<br/>', '<br />', '<BR>'])('supports a standalone %s node', (tag) => {
    const { container } = markdown(`${tag}\n`)
    expect(container.querySelectorAll('br')).toHaveLength(1)
  })

  it('visits emphasis, links, lists and GFM cells without changing their semantics', () => {
    const { container } = markdown([
      '**first<br>second** [third<br/>fourth](https://example.invalid)',
      '',
      '- fifth<br />sixth',
      '',
      '| Heading |',
      '| --- |',
      '| seventh<br>eighth |',
    ].join('\n'))
    expect(container.querySelectorAll('br')).toHaveLength(4)
    expect(container.querySelector('strong br')).not.toBeNull()
    expect(container.querySelector('a')).toHaveAttribute('href', 'https://example.invalid')
    expect(container.querySelector('li br')).not.toBeNull()
    expect(container.querySelector('td br')).not.toBeNull()
  })

  it('leaves code and escaped tags literal', () => {
    const { container } = markdown('`<br>` and &lt;br&gt;\n\n```html\n<br />\n<script>bad()</script>\n```')
    expect(container.querySelectorAll('br')).toHaveLength(0)
    expect(container.querySelector('pre > code')?.textContent).toBe('<br />\n<script>bad()</script>\n')
    expect(container.querySelector('p')?.textContent).toBe('<br> and <br>')
    expect(container.querySelector('script')).toBeNull()
  })

  it.each([
    '<br >', '<br  />', '<br\t/>', '<br\n/>', '</br>',
    '<br onclick="bad()">', '<br style="display:none">',
    '<br onmouseover=bad()/>', '<br data-x="value"/>',
    '<script>bad()</script>', '<img src=x onerror=bad()>',
    '<svg onload=bad()>', '<iframe srcdoc="<script>bad()</script>">',
  ])('keeps unsupported HTML inert: %s', (html) => {
    const { container } = markdown(`first ${html} second`)
    expect(container.querySelector('br, script, img, svg, iframe, [onclick], [onmouseover], [onerror]')).toBeNull()
    expect(container.textContent).toContain(html)
  })

  it('does not extract a break from a larger raw HTML block', () => {
    const raw = '<br>\n<script>bad()</script>\n<div>other</div>'
    const { container } = markdown(raw)
    expect(container.querySelector('br, script, div')).toBeNull()
    expect(container.textContent).toBe(raw)
  })

  it('preserves native Markdown breaks and retains safe-link handling', () => {
    const { container } = markdown('first  \nsecond<br>third\n\n[unsafe](javascript:bad())')
    expect(container.querySelectorAll('br')).toHaveLength(2)
    expect(container.querySelector('a')?.getAttribute('href')).not.toMatch(/^javascript:/i)
  })

  it('changes only matching HTML nodes and carries their source positions', () => {
    const tree: Root = unified().use(remarkParse).parse('one<br>two <span>three</span>')
    const paragraph = tree.children[0]
    if (paragraph.type !== 'paragraph') throw new Error('Expected a paragraph fixture')
    const before = structuredClone(paragraph.children)
    remarkSafeBreaks()(tree)
    expect(paragraph.children[1]).toEqual({ type: 'break', position: before[1].position })
    expect(paragraph.children.slice(2)).toEqual(before.slice(2))
  })
})
