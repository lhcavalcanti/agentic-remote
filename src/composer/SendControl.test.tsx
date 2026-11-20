// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SendControl } from './SendControl'

afterEach(cleanup)

describe('busy send choices', () => {
  function show(enabled = true, reason?: string) {
    const onSubmit = vi.fn()
    render(
      <SendControl enabled={enabled} disabled={false} steerUnavailableReason={reason} onSubmit={onSubmit}>
        {(props) => <button {...props} type="button">Send</button>}
      </SendControl>,
    )
    return onSubmit
  }
  it('leaves default delivery untouched outside the busy preview', () => {
    const onSubmit = show(false)
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith()
    expect(screen.queryByRole('button', { name: 'Send options' })).not.toBeInTheDocument()
  })
  it('opens instead of sending and dispatches the explicit steering choice', () => {
    const onSubmit = show()
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(onSubmit).not.toHaveBeenCalled()
    const steer = screen.getByRole('menuitem', { name: 'Steer — guide the active turn' })
    expect(steer).toHaveFocus()
    fireEvent.click(steer)
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(false)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
  it.each([
    { choice: 'Steer — guide the active turn', enqueue: false },
    { choice: 'Queue — run after this turn', enqueue: true },
  ])('delivers $choice when a touch blurs with no related target before click', ({ choice, enqueue }) => {
    const onSubmit = show()
    fireEvent.click(screen.getByRole('button', { name: 'Send options' }))
    const focused = screen.getByRole('menuitem', { name: /Steer —/ })
    const item = screen.getByRole('menuitem', { name: new RegExp(`^${choice}`) })
    fireEvent.pointerDown(item, { pointerType: 'touch' })
    fireEvent.blur(focused, { relatedTarget: null })
    expect(item).toBeInTheDocument()
    fireEvent.pointerUp(item, { pointerType: 'touch' })
    fireEvent.click(item)
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(enqueue)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
  it('still dismisses on outside pointerdown after a null-target blur', () => {
    const onSubmit = show()
    fireEvent.click(screen.getByRole('button', { name: 'Send options' }))
    fireEvent.blur(screen.getByRole('menuitem', { name: /Steer —/ }), { relatedTarget: null })
    expect(screen.getByRole('menu')).toBeInTheDocument()
    fireEvent.pointerDown(document.body, { pointerType: 'touch' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
  it('explains disabled steering but keeps automatic queue delivery available', () => {
    const onSubmit = show(true, 'This runtime does not support steering.')
    fireEvent.click(screen.getByRole('button', { name: 'Send options' }))
    const steer = screen.getByRole('menuitem', { name: /Steer —/ })
    expect(steer).toHaveAttribute('aria-disabled', 'true')
    expect(steer).toHaveAccessibleDescription('This runtime does not support steering.')
    fireEvent.click(steer)
    expect(onSubmit).not.toHaveBeenCalled()
    fireEvent.keyDown(steer, { key: 'ArrowDown' })
    expect(screen.getByRole('menuitem', { name: /Queue —/ })).toHaveFocus()
    fireEvent.click(screen.getByRole('menuitem', { name: /Queue —/ }))
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(true)
  })
  it('supports context menu and keyboard open/dismiss with focus restored', () => {
    show()
    const send = screen.getByRole('button', { name: 'Send' })
    fireEvent.contextMenu(send)
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    expect(send).toHaveFocus()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    fireEvent.keyDown(send, { key: 'F10', shiftKey: true })
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })
  // Narrow composers leave the arrow out, so Send alone has to announce the menu.
  it('announces Send itself as the button for the menu it controls', () => {
    show()
    const send = screen.getByRole('button', { name: 'Send' })
    expect(send).toHaveAttribute('aria-haspopup', 'menu')
    expect(send).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(send)
    const menu = screen.getByRole('menu', { name: 'Message delivery' })
    expect(send).toHaveAttribute('aria-expanded', 'true')
    expect(send).toHaveAttribute('aria-controls', menu.id)
    fireEvent.keyDown(menu, { key: 'Escape' })
    expect(send).toHaveFocus()
    expect(send).toHaveAttribute('aria-expanded', 'false')
  })
  it('restores Escape focus to the chevron that actually opened the menu', () => {
    show()
    const options = screen.getByRole('button', { name: 'Send options' })
    fireEvent.click(options)
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(options).toHaveFocus()
  })
  it.each([false, true])('preserves native Tab navigation and closes on leaving (shift: %s)', (shiftKey) => {
    render(<>
      <SendControl enabled disabled={false} onSubmit={vi.fn()}>
        {(props) => <button {...props} type="button">Send</button>}
      </SendControl>
      <button type="button">After</button>
    </>)
    fireEvent.click(screen.getByRole('button', { name: 'Send options' }))
    const menu = screen.getByRole('menu')
    expect(fireEvent.keyDown(menu, { key: 'Tab', shiftKey })).toBe(true)
    const next = screen.getByRole('button', { name: shiftKey ? 'Send options' : 'After' })
    fireEvent.blur(menu, { relatedTarget: next })
    next.focus()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(next).toHaveFocus()
  })
})
