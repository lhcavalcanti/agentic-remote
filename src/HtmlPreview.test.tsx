// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { HtmlPreview } from './HtmlPreview'
import {
  createHtmlPreviewDocument,
  HTML_PREVIEW_CSP,
} from './html-preview'

afterEach(cleanup)

describe('HTML preview', () => {
  it.each([
    '<audio controls src="data:audio/wav;base64,AAAA">Audio fallback</audio>',
    '<video controls src="data:video/mp4;base64,AAAA" poster="data:image/png;base64,AAAA"></video>',
    '<audio controls><source src="data:audio/wav;base64,AAAA"><track src="data:text/vtt,WEBVTT"></audio>',
    '<video controls><source src="data:video/mp4;base64,AAAA"><track src="data:text/vtt,WEBVTT"></video>',
    '<AUDIO CONTROLS SRC="data:audio/wav;base64,AAAA"></AUDIO>',
    '<source src="data:audio/wav;base64,AAAA"><track src="data:text/vtt,WEBVTT">',
  ])('removes interactive media rather than rendering it: %s', (media) => {
    const source = `<h1>Static example</h1>${media}<p>After</p>`
    const document = new DOMParser().parseFromString(createHtmlPreviewDocument(source), 'text/html')
    expect(document.querySelector('audio, video, source, track')).toBeNull()
    expect(document.querySelector('h1')?.textContent).toBe('Static example')
    expect(document.querySelector('p')?.textContent).toBe('After')
    expect(HTML_PREVIEW_CSP).toContain("media-src 'none'")
  })

  it('removes media inside nested inert templates without blocking data images or inline CSS', () => {
    const source = `
      <style>.still-image { width: 20px }</style>
      <img class="still-image" src="data:image/png;base64,AAAA">
      <template id="outer">
        <audio controls src="data:audio/wav;base64,AAAA"></audio>
        <template id="inner">
          <video controls><source src="data:video/mp4;base64,AAAA"><track src="data:text/vtt,WEBVTT"></video>
          <p>Inert template text</p>
        </template>
      </template>`
    const document = new DOMParser().parseFromString(createHtmlPreviewDocument(source), 'text/html')
    const outer = document.querySelector<HTMLTemplateElement>('#outer')!
    const inner = outer.content.querySelector<HTMLTemplateElement>('#inner')!
    expect(outer.content.querySelector('audio, video, source, track')).toBeNull()
    expect(inner.content.querySelector('audio, video, source, track')).toBeNull()
    expect(inner.content.querySelector('p')?.textContent).toBe('Inert template text')
    expect(document.querySelector('img')?.getAttribute('src')).toBe('data:image/png;base64,AAAA')
    expect(document.querySelector('style')?.textContent).toContain('width: 20px')
  })

  it('uses an opaque, permissionless iframe with loading and error states', () => {
    render(<HtmlPreview name="fixture.html" source="<p>Safe</p>" />)

    const frame = screen.getByTitle('Preview of fixture.html')
    expect(frame).toHaveAttribute('sandbox', '')
    expect(frame).toHaveAttribute('allow', '')
    expect(frame).toHaveAttribute('referrerpolicy', 'no-referrer')
    expect(frame).toHaveAttribute('loading', 'eager')
    expect(screen.getByRole('status')).toHaveTextContent('Loading HTML preview')

    fireEvent.load(frame)
    expect(screen.queryByRole('status')).toBeNull()

    fireEvent.error(frame)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'HTML preview could not be displayed',
    )
    expect(screen.getByText('Use Source to read the file.')).toBeInTheDocument()
  })

  it('places a restrictive CSP before sanitized untrusted content', () => {
    const preview = createHtmlPreviewDocument(`
      <html>
        <head>
          <title>Example</title>
          <meta http-equiv="refresh" content="0;url=https://example.com">
          <link rel="stylesheet" href="https://example.com/site.css">
          <style>.card { color: green; background: url(https://example.com/a.png) }</style>
        </head>
        <body style="margin: 2rem" onload="parent.compromised = true">
          <script>parent.compromised = true</script>
          <a href="https://example.com" target="_top" download ping="/track">Leave</a>
          <form action="https://example.com" target="_top">
            <input name="secret">
            <button formaction="https://example.com">Submit</button>
          </form>
          <img id="data-image" src="data:image/png;base64,AAAA">
          <img id="external-image" src="https://example.com/image.png" srcset="https://example.com/2x.png 2x">
          <video autoplay src="https://example.com/video.mp4"></video>
          <iframe src="https://example.com"></iframe>
          <object data="https://example.com/plugin"></object>
          <svg><a><animate attributeName="href" to="https://example.com"/></a></svg>
        </body>
      </html>
    `)
    const document = new DOMParser().parseFromString(preview, 'text/html')
    const headChildren = Array.from(document.head.children)
    const csp = headChildren.find(
      (element) =>
        element.getAttribute('http-equiv') === 'Content-Security-Policy',
    )

    expect(csp).toBe(headChildren[1])
    expect(csp?.getAttribute('content')).toBe(HTML_PREVIEW_CSP)
    expect(HTML_PREVIEW_CSP).toContain("default-src 'none'")
    expect(HTML_PREVIEW_CSP).toContain("script-src 'none'")
    expect(HTML_PREVIEW_CSP).toContain("connect-src 'none'")
    expect(HTML_PREVIEW_CSP).toContain("style-src 'unsafe-inline'")
    expect(HTML_PREVIEW_CSP).toContain('img-src data:')
    expect(HTML_PREVIEW_CSP).toContain('font-src data:')
    expect(HTML_PREVIEW_CSP).toContain("media-src 'none'")
    expect(HTML_PREVIEW_CSP).toContain("object-src 'none'")
    expect(HTML_PREVIEW_CSP).toContain("frame-src 'none'")
    expect(HTML_PREVIEW_CSP).toContain("child-src 'none'")
    expect(HTML_PREVIEW_CSP).toContain("base-uri 'none'")
    expect(HTML_PREVIEW_CSP).toContain("form-action 'none'")

    expect(document.querySelector('style')?.textContent).toContain('color: green')
    expect(document.body.getAttribute('style')).toBe('margin: 2rem')
    expect(document.querySelector('#data-image')?.getAttribute('src')).toBe(
      'data:image/png;base64,AAAA',
    )
    expect(document.querySelector('#external-image')?.hasAttribute('src')).toBe(
      false,
    )
    expect(
      document.querySelector('#external-image')?.hasAttribute('srcset'),
    ).toBe(false)
    expect(document.querySelector('script, meta[http-equiv="refresh"], link, iframe, object, animate'))
      .toBeNull()
    expect(document.querySelector('form')).toBeNull()
    expect(document.body.hasAttribute('onload')).toBe(false)
    expect(document.querySelector('video')).toBeNull()

    const link = screenless(document, 'a')
    expect(link.hasAttribute('href')).toBe(false)
    expect(link.hasAttribute('target')).toBe(false)
    expect(link.hasAttribute('download')).toBe(false)
    expect(link.getAttribute('aria-disabled')).toBe('true')
    expect(link.getAttribute('tabindex')).toBe('-1')
    expect(document.querySelector('input')?.hasAttribute('disabled')).toBe(true)
    expect(document.querySelector('button')?.hasAttribute('disabled')).toBe(true)
  })
})

function screenless(document: Document, selector: string): Element {
  const element = document.querySelector(selector)
  if (!element) throw new Error(`Expected ${selector} in sanitized document`)
  return element
}
