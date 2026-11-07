// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { messageTimeParts } from './message-time'
import { MessageTime } from './MessageTime'

const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
const dayTime = new Intl.DateTimeFormat(undefined, {
  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
})
const full = new Intl.DateTimeFormat(undefined, {
  year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
})

describe('message time', () => {
  const sent = new Date(2026, 10, 7, 9, 5)
  const stamp = sent.toISOString()

  it('shows the time today, adds the day on other days, and the year in other years', () => {
    expect(messageTimeParts(stamp, new Date(2026, 10, 7, 23, 59))).toEqual({
      label: time.format(sent),
      title: full.format(sent),
    })
    expect(messageTimeParts(stamp, new Date(2026, 10, 8, 0, 1))?.label).toBe(dayTime.format(sent))
    expect(messageTimeParts(stamp, new Date(2027, 0, 1, 0, 1))?.label).toBe(full.format(sent))
  })

  it('shows nothing for a missing or unreadable time', () => {
    expect(messageTimeParts(undefined)).toBeUndefined()
    expect(messageTimeParts('t')).toBeUndefined()
    const { container } = render(<MessageTime value="t" />)
    expect(container).toBeEmptyDOMElement()
  })

  it("keeps the server's exact value as machine-readable time with the full date as its title", () => {
    const { container } = render(<MessageTime value={stamp} />)
    const element = container.querySelector('time')
    expect(element).toHaveAttribute('datetime', stamp)
    expect(element).toHaveAttribute('title', full.format(sent))
  })
})
