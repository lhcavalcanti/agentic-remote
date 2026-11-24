import { describe, expect, it } from 'vitest'
import type { ChatMessage, ManagedSession } from '../shared/contracts'
import { mergeTranscriptWindow, prependTranscriptPage } from './session-transcript'

const at = '2026-11-24T00:00:00.000Z'
const line = (index: number, extra: Partial<ChatMessage> = {}): ChatMessage =>
  ({ id: `m${index}`, role: 'assistant', content: `line ${index}`, createdAt: at, ...extra })
const range = (from: number, to: number) => Array.from({ length: to - from }, (_, index) => line(from + index))
const ids = (messages: readonly ChatMessage[] | undefined) => messages?.map((message) => message.id)

function windowed(start: number, messages: ChatMessage[], carriedMessages: ChatMessage[] = []): ManagedSession {
  return {
    id: 'long', computerId: 'computer', computerName: 'Computer', cwd: '/project', title: 'Long',
    updatedAt: at, status: 'idle', messages, messagesStart: start,
    messagesTotal: start + messages.length, carriedMessages,
  }
}

describe('mergeTranscriptWindow', () => {
  it('keeps earlier rows the reader paged in when a later window lines up with them', () => {
    const merged = mergeTranscriptWindow(windowed(2, range(2, 10)), windowed(6, range(6, 11)))
    expect(merged).toMatchObject({ messagesStart: 2, messagesTotal: 11 })
    expect(ids(merged.messages)).toEqual(ids(range(2, 11)))
  })

  it('takes a window that no longer lines up with what is held as it is', () => {
    const rebuilt = windowed(6, [line(6, { id: 'other' }), ...range(7, 11)])
    expect(mergeTranscriptWindow(windowed(2, range(2, 10)), rebuilt)).toBe(rebuilt)
    // Nothing to line up with: an answer that starts where the held rows end.
    const after = windowed(10, range(10, 12))
    expect(mergeTranscriptWindow(windowed(2, range(2, 10)), after)).toBe(after)
  })

  it('does not put a settled held row back to running from an older carried copy', () => {
    const running = line(2, { role: 'activity', activityStatus: 'running' })
    const done = line(2, { role: 'activity', activityStatus: 'completed' })
    // A finished root task is read again as the agent's message, under the same id.
    const reported = line(2, {
      taskCompletion: { source: 'root-task-complete', toolCallId: 'call-2', completedAt: at },
    })
    for (const settled of [done, reported]) {
      const held = windowed(0, [line(0), line(1), settled, ...range(3, 10)])
      const merged = mergeTranscriptWindow(held, windowed(5, range(5, 10), [running]))
      expect(merged.messagesStart).toBe(0)
      expect(merged.messages[2]).toEqual(settled)
    }
  })

  it('updates held rows from what the window carries, and lets go of a stale running one', () => {
    const held = windowed(0, [line(0, { role: 'activity', activityStatus: 'running' }), line(1),
      line(2, { role: 'activity', activityStatus: 'running' }), ...range(3, 10)])
    const finished = line(2, { role: 'activity', activityStatus: 'completed' })
    const merged = mergeTranscriptWindow(held, windowed(5, range(5, 10), [finished]))
    // m0 is no longer running, and the window does not say how it ended.
    expect(merged.messagesStart).toBe(1)
    expect(merged.messages.slice(0, 2)).toEqual([line(1), finished])
    expect(ids(merged.messages)).toEqual(ids(range(1, 10)))
    expect(merged.carriedMessages).toEqual([])
  })

  it('takes a whole transcript, or a different session, as it is', () => {
    const whole: ManagedSession = { ...windowed(0, range(0, 4)), messagesStart: undefined, messagesTotal: undefined, carriedMessages: undefined }
    expect(mergeTranscriptWindow(windowed(2, range(2, 10)), whole)).toBe(whole)
    const other = { ...windowed(6, range(6, 11)), id: 'other' }
    expect(mergeTranscriptWindow(windowed(2, range(2, 10)), other)).toBe(other)
  })
})

describe('prependTranscriptPage', () => {
  it('prepends a page only where the window still starts', () => {
    const session = windowed(5, range(5, 8), [line(3, { role: 'activity', activityStatus: 'running' })])
    const page = { messages: range(2, 5), messagesStart: 2, messagesTotal: 8 }
    const grown = prependTranscriptPage(session, page, 'm5')!
    expect(grown).toMatchObject({ messagesStart: 2, messagesTotal: 8, carriedMessages: [] })
    expect(ids(grown.messages)).toEqual(ids(range(2, 8)))
    expect(prependTranscriptPage(windowed(6, range(6, 8)), page, 'm5')).toBeUndefined()
    expect(prependTranscriptPage(windowed(5, [line(5, { id: 'moved' })]), page, 'm5')).toBeUndefined()
  })

  it('keeps a finished task the page reads over an older running copy the window carried', () => {
    const reported = line(3, {
      taskCompletion: { source: 'root-task-complete', toolCallId: 'call-3', completedAt: at },
    })
    const page = { messages: [line(2), reported, line(4)], messagesStart: 2, messagesTotal: 8 }
    const carried = [line(3, { role: 'activity', activityStatus: 'running' })]
    const grown = prependTranscriptPage(windowed(5, range(5, 8), carried), page, 'm5')!
    expect(grown.messages[1]).toEqual(reported)
    expect(grown).toMatchObject({ messagesStart: 2, carriedMessages: [] })
  })

  it('keeps a completion the window carried over the running copy a late page holds', () => {
    const finished = line(3, { role: 'activity', activityStatus: 'completed' })
    const page = {
      messages: [line(2), line(3, { role: 'activity', activityStatus: 'running' }), line(4)],
      messagesStart: 2, messagesTotal: 8,
    }
    const grown = prependTranscriptPage(windowed(5, range(5, 8), [finished]), page, 'm5')!
    expect(grown.messages[1]).toEqual(finished)
    expect(grown).toMatchObject({ messagesStart: 2, carriedMessages: [] })
  })

  it('leaves out a page row still running that the window no longer carries, with every row before it', () => {
    const page = {
      messages: [line(2), line(3, { role: 'activity', activityStatus: 'running' }), line(4)],
      messagesStart: 2, messagesTotal: 8,
    }
    const grown = prependTranscriptPage(windowed(5, range(5, 8)), page, 'm5')!
    expect(grown.messagesStart).toBe(4)
    expect(ids(grown.messages)).toEqual(ids(range(4, 8)))
    // Nothing left to join: the session stays as it is and can be paged again.
    const stale = { messages: [line(4, { role: 'activity', activityStatus: 'running' })], messagesStart: 4, messagesTotal: 8 }
    expect(prependTranscriptPage(windowed(5, range(5, 8)), stale, 'm5')).toBeUndefined()
  })
})
