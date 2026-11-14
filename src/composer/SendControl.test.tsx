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
})
