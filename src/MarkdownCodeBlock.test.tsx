// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MarkdownCodeBlock } from './MarkdownCodeBlock'

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
const source = 'const value = 1;\n\n'
function block(text = source) {
  return <MarkdownCodeBlock source={text} language="typescript">
    <pre><code>{text}</code></pre>
  </MarkdownCodeBlock>
}
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard)
  else Reflect.deleteProperty(navigator, 'clipboard')
})

describe('Markdown code copying', () => {
  it('copies the exact fenced source only after an explicit action', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(block())
    expect(writeText).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }))
    await screen.findByRole('button', { name: 'Code copied' })
    expect(writeText).toHaveBeenCalledWith(source)
  })

  it('explains unavailable clipboard access without pretending to copy', () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
    render(block())
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Clipboard access is unavailable')
    expect(screen.queryByRole('button', { name: 'Code copied' })).toBeNull()
  })

  it('keeps code readable and reports a rejected clipboard request', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('Denied')) },
    })
    const rendered = render(block())
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not copy')
    expect(rendered.container.querySelector('code')?.textContent).toBe(source)
  })

  it('does not leave a feedback timer behind when the document closes during copying', async () => {
    let finish: (() => void) | undefined
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn(() => new Promise<void>((resolve) => { finish = resolve })) },
    })
    const timer = vi.spyOn(globalThis, 'setTimeout')
    const rendered = render(block())
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }))
    rendered.unmount()
    await act(async () => { finish?.() })
    expect(timer).not.toHaveBeenCalledWith(expect.any(Function), 2000)
  })
})
