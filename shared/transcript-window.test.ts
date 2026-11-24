import { describe, expect, it } from 'vitest'
import type { ChatMessage, SessionDetail } from './contracts.js'
import {
  pageTranscript,
  windowSession,
  windowTranscript,
  type TranscriptReader,
} from './transcript-window.js'

const at = '2026-11-24T00:00:00.000Z'

function row(id: string, extra: Partial<ChatMessage> = {}): ChatMessage {
  return { id, role: 'assistant', content: id, createdAt: at, ...extra }
}

function reader(messages: readonly ChatMessage[]): TranscriptReader {
  return { length: messages.length, at: (index) => messages[index] }
}

const ids = (messages: readonly ChatMessage[]) => messages.map((message) => message.id)

describe('windowTranscript', () => {
  it('keeps the latest rows and says where they start', () => {
    const messages = Array.from({ length: 10 }, (_, index) => row(`m${index}`))
    expect(windowTranscript(reader(messages), 4)).toMatchObject({
      messagesStart: 6, messagesTotal: 10, carriedMessages: [],
    })
    expect(ids(windowTranscript(reader(messages), 4).messages)).toEqual(['m6', 'm7', 'm8', 'm9'])
    expect(windowTranscript(reader(messages.slice(0, 3)), 4)).toMatchObject({
      messages: messages.slice(0, 3), messagesStart: 0, messagesTotal: 3,
    })
  })

  it('carries running activities and the parents of the window activity, oldest first', () => {
    const messages = [
      row('grandparent', { role: 'activity', activityStatus: 'completed' }),
      row('running', { role: 'activity', activityStatus: 'running' }),
      row('parent', { role: 'activity', activityStatus: 'completed', activityGroupId: 'grandparent' }),
      row('done', { role: 'activity', activityStatus: 'completed' }),
      row('said'),
      row('child', { role: 'activity', activityStatus: 'completed', activityGroupId: 'parent' }),
      row('latest'),
    ]
    const window = windowTranscript(reader(messages), 2)
    expect(ids(window.messages)).toEqual(['child', 'latest'])
    expect(ids(window.carriedMessages)).toEqual(['grandparent', 'running', 'parent'])
  })

  it('carries at most one window of rows from before it, the latest ones', () => {
    const messages = Array.from({ length: 1_200 }, (_, index) =>
      row(`r${index}`, { role: 'activity', activityStatus: 'running' }))
    const window = windowTranscript(reader(messages), 2)
    expect(window.carriedMessages).toHaveLength(500)
    expect(window.carriedMessages[0].id).toBe('r698')
    expect(window.carriedMessages.at(-1)?.id).toBe('r1197')
  })
})

describe('pageTranscript', () => {
  const messages = Array.from({ length: 10 }, (_, index) => row(`m${index}`))

  it('returns the rows before a boundary that is still in place', () => {
    expect(pageTranscript(reader(messages), { before: 6, beforeId: 'm6', limit: 4 })).toEqual({
      messages: messages.slice(2, 6), messagesStart: 2, messagesTotal: 10,
    })
    expect(pageTranscript(reader(messages), { before: 3, beforeId: 'm3', limit: 4 }))
      .toMatchObject({ messagesStart: 0, messages: messages.slice(0, 3) })
    expect(pageTranscript(reader(messages), { before: 0, beforeId: 'm0', limit: 4 }))
      .toMatchObject({ messagesStart: 0, messages: [] })
  })

  it('refuses a boundary that moved instead of splicing other rows', () => {
    expect(pageTranscript(reader(messages), { before: 6, beforeId: 'm5', limit: 4 })).toBeUndefined()
    expect(pageTranscript(reader(messages), { before: 10, beforeId: 'm9', limit: 4 })).toBeUndefined()
  })
})

describe('windowSession', () => {
  const session: SessionDetail = {
    id: 's', cwd: '/project', title: 'Long', updatedAt: at, status: 'idle',
    messages: Array.from({ length: 5 }, (_, index) => row(`m${index}`)),
  }

  it('windows a whole transcript once, and leaves it whole when no window is asked for', () => {
    const windowed = windowSession(session, 2)
    expect(windowed).toMatchObject({ messagesStart: 3, messagesTotal: 5, carriedMessages: [] })
    expect(ids(windowed.messages)).toEqual(['m3', 'm4'])
    expect(windowSession(windowed, 1)).toBe(windowed)
    expect(windowSession(session, undefined)).toBe(session)
  })
})
