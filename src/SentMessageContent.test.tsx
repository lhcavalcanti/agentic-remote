// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { isLongSentMessage, PauseFollowingContext } from './sent-message'
import { SentMessageContent } from './SentMessageContent'

const thirteenLines = Array.from({ length: 13 }, (_, index) => `Line ${index + 1}`).join('\n')

describe('SentMessageContent', () => {
  afterEach(() => {
    cleanup()
  })

  it('counts a message as long past 12 lines or 600 characters', () => {
    expect(isLongSentMessage('x'.repeat(600))).toBe(false)
    expect(isLongSentMessage('x'.repeat(601))).toBe(true)
    expect(isLongSentMessage(Array.from({ length: 12 }, () => 'x').join('\n'))).toBe(false)
    expect(isLongSentMessage(thirteenLines)).toBe(true)
  })

  it('shows a short message whole, with no toggle', () => {
    render(
      <SentMessageContent className="message__content" content="Run the tests">
        Run the tests
      </SentMessageContent>,
    )
    expect(screen.getByText('Run the tests')).toHaveClass('message__content')
    expect(screen.getByText('Run the tests')).not.toHaveClass('message__content--collapsed')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('starts a long message collapsed and pauses following only to expand it', () => {
    const pauseFollowing = vi.fn()
    render(
      <PauseFollowingContext.Provider value={pauseFollowing}>
        <SentMessageContent className="message__content" content={thirteenLines}>
          <p>{thirteenLines}</p>
        </SentMessageContent>
      </PauseFollowingContext.Provider>,
    )
    const showAll = screen.getByRole('button', { name: 'Show all' })
    const content = document.getElementById(showAll.getAttribute('aria-controls')!)
    expect(showAll).toHaveAttribute('aria-expanded', 'false')
    expect(content).toHaveClass('message__content', 'message__content--collapsed')
    // Collapsing is visual only: the whole message stays in the page.
    expect(content).toHaveTextContent('Line 13')

    fireEvent.click(showAll)
    expect(pauseFollowing).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true')
    expect(content).not.toHaveClass('message__content--collapsed')

    fireEvent.click(screen.getByRole('button', { name: 'Show less' }))
    expect(pauseFollowing).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Show all' })).toHaveAttribute('aria-expanded', 'false')
    expect(content).toHaveClass('message__content--collapsed')
  })
})
