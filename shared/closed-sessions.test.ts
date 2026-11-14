import { describe, expect, it } from 'vitest'
import type { ChatMessage } from './contracts.js'
import {
  closedSessionContext,
  closedSessionExpiresAt,
  isClosedSessionContext,
} from './closed-sessions.js'

function message(role: ChatMessage['role'], content: string, index: number): ChatMessage {
  return { id: `m${index}`, role, content, createdAt: `2026-11-01T00:00:0${index}.000Z` }
}

describe('closed session context', () => {
  it('keeps the last three prompts oldest first, each on one line and bounded', () => {
    const context = closedSessionContext({
      title: 'Release review',
      cwd: '/home/tester/src/app',
      messages: [
        message('user', 'First prompt', 0),
        message('user', 'Second\n\n  prompt', 1),
        message('assistant', 'Working on it', 2),
        message('user', 'Third prompt', 3),
        message('user', `Fourth ${'x'.repeat(300)}`, 4),
      ],
    })

    expect(context.title).toBe('Release review')
    expect(context.cwd).toBe('/home/tester/src/app')
    expect(context.prompts).toHaveLength(3)
    expect(context.prompts[0]).toBe('Second prompt')
    expect(context.prompts[1]).toBe('Third prompt')
    expect(context.prompts[2]).toHaveLength(200)
    expect(context.prompts[2]).toMatch(/^Fourth x+…$/)
  })

  it('excerpts the latest non-empty reply and ignores activity and notices', () => {
    const context = closedSessionContext({
      title: 'Docs',
      cwd: '/srv/docs',
      messages: [
        message('assistant', `Reply ${'y'.repeat(500)}`, 0),
        message('activity', 'Ran tests', 1),
        message('assistant', '   ', 2),
        message('notice', 'Session restarted', 3),
      ],
    })

    expect(context.prompts).toEqual([])
    expect(context.reply).toHaveLength(400)
    expect(context.reply).toMatch(/^Reply y+…$/)
  })

  it('omits the reply when the session never answered', () => {
    expect(closedSessionContext({ title: 'New', cwd: '/srv', messages: [] }))
      .toEqual({ title: 'New', cwd: '/srv', prompts: [] })
  })

  it('never splits a character made of two code units', () => {
    const context = closedSessionContext({
      title: 'Emoji',
      cwd: '/srv',
      messages: [message('user', '😀'.repeat(250), 0)],
    })

    expect(Array.from(context.prompts[0]!)).toHaveLength(200)
    expect(context.prompts[0]).not.toMatch(/[\uD800-\uDBFF]…$/)
  })

  it('validates a stored context and rejects other shapes', () => {
    expect(isClosedSessionContext({ title: 'A', cwd: '/a', prompts: ['p'], reply: 'r' })).toBe(true)
    expect(isClosedSessionContext({ title: 'A', cwd: '/a', prompts: [] })).toBe(true)
    expect(isClosedSessionContext({ title: 'A', cwd: '/a', prompts: [1] })).toBe(false)
    expect(isClosedSessionContext({ title: 'A', prompts: [] })).toBe(false)
    expect(isClosedSessionContext(null)).toBe(false)
  })

  it('expires fourteen days after closing', () => {
    expect(closedSessionExpiresAt('2026-11-01T00:00:00.000Z'))
      .toBe(Date.parse('2026-11-15T00:00:00.000Z'))
    expect(closedSessionExpiresAt('not a date')).toBeNaN()
  })
})
