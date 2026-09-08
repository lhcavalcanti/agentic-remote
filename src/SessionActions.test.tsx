// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SessionActions } from './SessionActions'

afterEach(cleanup)

describe('session actions disclosure', () => {
  it('keeps secondary actions out of the header until explicitly opened', () => {
    const rename = vi.fn()
    render(
      <SessionActions>
        <button onClick={rename} type="button">Rename session</button>
      </SessionActions>,
    )
    const trigger = screen.getByRole('button', { name: 'Session actions' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('button', { name: 'Rename session' })).toBeNull()
    fireEvent.click(trigger)
    expect(screen.getByRole('group', { name: 'Session actions' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Rename session' }))
    expect(rename).toHaveBeenCalledOnce()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes only the disclosure on Escape and restores focus to its trigger', () => {
    const parentEscape = vi.fn()
    render(
      <div onKeyDown={parentEscape}>
        <SessionActions><button type="button">Rename session</button></SessionActions>
      </div>,
    )
    const trigger = screen.getByRole('button', { name: 'Session actions' })
    fireEvent.click(trigger)
    const action = screen.getByRole('button', { name: 'Rename session' })
    action.focus()
    fireEvent.keyDown(action, { key: 'Escape' })
    expect(trigger).toHaveFocus()
    expect(parentEscape).not.toHaveBeenCalled()
    expect(screen.queryByRole('group', { name: 'Session actions' })).toBeNull()
  })

  it('dismisses outside without taking focus away from the next control', () => {
    render(
      <>
        <SessionActions><button type="button">Rename session</button></SessionActions>
        <button type="button">Knowledge</button>
      </>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Session actions' }))
    const next = screen.getByRole('button', { name: 'Knowledge' })
    fireEvent.pointerDown(next)
    next.focus()
    expect(next).toHaveFocus()
    expect(screen.queryByRole('group', { name: 'Session actions' })).toBeNull()
  })

  it('does not close or execute a disabled lifecycle action', () => {
    const restart = vi.fn()
    render(
      <SessionActions>
        <button disabled onClick={restart} type="button">Restart session</button>
      </SessionActions>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Session actions' }))
    fireEvent.click(screen.getByRole('button', { name: 'Restart session' }))
    expect(restart).not.toHaveBeenCalled()
    expect(screen.getByRole('group', { name: 'Session actions' })).toBeVisible()
  })
})
