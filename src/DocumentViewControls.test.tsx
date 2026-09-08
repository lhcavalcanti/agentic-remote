// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DocumentViewControls } from './DocumentViewControls'

const outline = [
  { id: 'guide', text: 'Guide', level: 1, index: 0 },
  { id: 'details', text: 'Details', level: 2, index: 1 },
]
const actions = { onRawChange: vi.fn(), onSelectHeading: vi.fn() }
afterEach(() => { cleanup(); vi.clearAllMocks() })

describe('document controls', () => {
  it('makes preview/source explicit and keeps the outline out of document flow until opened', () => {
    render(<DocumentViewControls {...actions} markdown outline={outline} raw={false} />)
    expect(screen.getByRole('button', { name: 'Preview' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByRole('navigation', { name: 'Document outline' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Source' }))
    expect(actions.onRawChange).toHaveBeenCalledWith(true)
    fireEvent.click(screen.getByRole('button', { name: 'Document outline' }))
    const list = screen.getByRole('navigation', { name: 'Document outline' })
    fireEvent.click(within(list).getByRole('button', { name: 'Details' }))
    expect(actions.onSelectHeading).toHaveBeenCalledWith(outline[1])
    expect(screen.queryByRole('navigation', { name: 'Document outline' })).toBeNull()
  })

  it('consumes Escape and restores the outline trigger without dismissing the workspace', () => {
    const parent = vi.fn()
    render(<div onKeyDown={parent}>
      <DocumentViewControls {...actions} markdown outline={outline} raw={false} />
    </div>)
    const trigger = screen.getByRole('button', { name: 'Document outline' })
    fireEvent.click(trigger)
    fireEvent.keyDown(screen.getByRole('button', { name: 'Details' }), { key: 'Escape' })
    expect(parent).not.toHaveBeenCalled()
    expect(trigger).toHaveFocus()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes on outside interaction and disables the outline in source mode', () => {
    const rendered = render(<DocumentViewControls {...actions} markdown outline={outline} raw={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Document outline' }))
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('navigation', { name: 'Document outline' })).toBeNull()
    rendered.rerender(<DocumentViewControls {...actions} markdown outline={outline} raw />)
    expect(screen.getByRole('button', { name: 'Source' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Document outline' })).toBeDisabled()
  })

  it('does not pretend non-Markdown files have a source/preview mode', () => {
    render(<DocumentViewControls {...actions} markdown={false} outline={[]} raw={false} />)
    expect(screen.queryByRole('group', { name: 'Document view' })).toBeNull()
  })
})
