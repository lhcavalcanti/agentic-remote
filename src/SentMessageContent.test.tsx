// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PauseFollowingContext, sentMessageLength } from './sent-message'
import { SentMessageContent } from './SentMessageContent'

const lines = (count: number) => Array.from({ length: count }, (_, index) => `Line ${index + 1}`).join('\n')
const thirteenLines = lines(13)

describe('SentMessageContent', () => {
  afterEach(() => {
    cleanup()
  })

  it.each([
    { size: '600 characters', content: 'x'.repeat(600), length: 'short' },
    { size: '601 characters', content: 'x'.repeat(601), length: 'long' },
    { size: '12 lines', content: lines(12), length: 'short' },
    { size: '13 lines', content: lines(13), length: 'long' },
    { size: '2,000 characters', content: 'x'.repeat(2000), length: 'long' },
    { size: '2,001 characters', content: 'x'.repeat(2001), length: 'very-long' },
    { size: '30 lines', content: lines(30), length: 'long' },
    { size: '31 lines', content: lines(31), length: 'very-long' },
  ])('measures a message of $size as $length', ({ content, length }) => {
    expect(sentMessageLength(content)).toBe(length)
  })

  it('marks how long a collapsible message is, so a desktop collapses only a very long one', () => {
    render(
      <>
        <SentMessageContent className="message__content" content={thirteenLines}>{thirteenLines}</SentMessageContent>
        <SentMessageContent className="message__content" content={lines(31)}>{lines(31)}</SentMessageContent>
      </>,
    )
    const [long, veryLong] = screen.getAllByRole('button', { name: 'Show all' })
    expect(long).toHaveClass('message__expand', 'message__expand--long')
    expect(document.getElementById(long.getAttribute('aria-controls')!))
      .toHaveClass('message__content--long', 'message__content--collapsed')
    expect(veryLong).toHaveClass('message__expand', 'message__expand--very-long')
    expect(document.getElementById(veryLong.getAttribute('aria-controls')!))
      .toHaveClass('message__content--very-long', 'message__content--collapsed')
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
