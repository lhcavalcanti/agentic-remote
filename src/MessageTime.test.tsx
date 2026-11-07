// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
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

  it("turns the day and year where the viewer's calendar does", async () => {
    const Native = Intl.DateTimeFormat
    const persian = 'en-US-u-ca-persian'
    const viewer = vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(function (
      locale?: string | string[],
      options?: Intl.DateTimeFormatOptions,
    ) {
      return new Native(locale ?? persian, options)
    } as typeof Intl.DateTimeFormat)
    vi.resetModules()
    const { messageTimeParts: persianTimeParts } = await import('./message-time')
    viewer.mockRestore()
    const persianDayTime = new Native(persian, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    const persianFull = new Native(persian, {
      year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    })

    // Esfand 1404 read in Farvardin 1405: the same Gregorian year, a new Persian one.
    const beforeNowruz = new Date(2026, 2, 15, 9, 5)
    expect(persianTimeParts(beforeNowruz.toISOString(), new Date(2026, 3, 1, 9, 0))?.label)
      .toBe(persianFull.format(beforeNowruz))
    // Azar read in Dey, both 1404: a new Gregorian year, the same Persian one.
    const december = new Date(2025, 11, 20, 9, 5)
    expect(persianTimeParts(december.toISOString(), new Date(2026, 0, 5, 9, 0))?.label)
      .toBe(persianDayTime.format(december))
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
