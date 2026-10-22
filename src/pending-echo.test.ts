import { describe, expect, it } from 'vitest'
import type { ChatMessage } from '../shared/contracts'
import {
  PENDING_ECHO_SETTLED_MS,
  createPendingEcho,
  nextPendingEchoDeadline,
  prunePendingEchoMap,
  retainPendingEchoes,
  unloggedPendingEchoes,
} from './pending-echo'

const user = (id: string, content: string): ChatMessage => ({
  id,
  role: 'user',
  content,
  createdAt: '2026-10-22T00:00:00.000Z',
})
const agent = (id: string, content: string): ChatMessage => ({
  id,
  role: 'assistant',
  content,
  createdAt: '2026-10-22T00:00:00.000Z',
})

describe('pending echoes', () => {
  const earlier = [user('u1', 'Write the story'), agent('a1', 'Once upon')]

  it('stays pending until the CLI writes the message to its transcript', () => {
    const echo = createPendingEcho('e1', 'Also end with mango', earlier, 1_000)
    expect(retainPendingEchoes([echo], earlier, 'running', 2_000)).toEqual([echo])
    const echoed = [...earlier, user('u2', 'Also end with mango')]
    expect(retainPendingEchoes([echo], echoed, 'running', 2_000)).toEqual([])
  })

  it('is not confirmed by an identical message that was already there', () => {
    const before = [...earlier, user('u2', 'continue')]
    const echo = createPendingEcho('e1', 'continue', before, 1_000)
    expect(retainPendingEchoes([echo], before, 'running', 2_000)).toEqual([echo])
    const again = [...before, agent('a2', 'ok'), user('u3', 'continue')]
    expect(retainPendingEchoes([echo], again, 'running', 2_000)).toEqual([])
  })

  it('matches across whitespace differences and long or collapsed text', () => {
    const long = `Line one\n\n${'x'.repeat(400)}`
    const echo = createPendingEcho('e1', long, earlier, 1_000)
    const echoed = [...earlier, user('u2', `Line one ${'x'.repeat(400)}  `)]
    expect(retainPendingEchoes([echo], echoed, 'running', 2_000)).toEqual([])
    const shortened = [...earlier, user('u3', `Line one\n${'x'.repeat(200)}`)]
    expect(retainPendingEchoes([echo], shortened, 'running', 2_000)).toEqual([])
  })

  it('pairs each echo with its own transcript message, in order', () => {
    const first = createPendingEcho('e1', 'same', earlier, 1_000)
    const second = createPendingEcho('e2', 'same', earlier, 1_100)
    const once = [...earlier, user('u2', 'same')]
    expect(retainPendingEchoes([first, second], once, 'running', 2_000)).toMatchObject([{ id: 'e2' }])
    const twice = [...once, user('u3', 'same')]
    expect(retainPendingEchoes([first, second], twice, 'running', 2_000)).toEqual([])
  })

  it('keeps the second identical echo pending across later prunes', () => {
    const first = createPendingEcho('e1', 'same', earlier, 1_000)
    const second = createPendingEcho('e2', 'same', earlier, 1_100)
    const once = [...earlier, user('u2', 'same')]
    const kept = retainPendingEchoes([first, second], once, 'running', 2_000)
    expect(retainPendingEchoes(kept, once, 'running', 3_000)).toBe(kept)
    expect(unloggedPendingEchoes(kept, once)).toBe(kept)
    expect(retainPendingEchoes(kept, [...once, user('u3', 'same')], 'running', 4_000)).toEqual([])
  })

  it('is not confirmed by an identical message deep in a long history', () => {
    const long = [
      user('old', 'continue'),
      ...Array.from({ length: 500 }, (_, index) => user(`u${index}`, `step ${index}`)),
    ]
    const echo = createPendingEcho('e1', 'continue', long, 1_000)
    expect(unloggedPendingEchoes([echo], long)).toEqual([echo])
  })

  it('ignores agent replies and other text', () => {
    const echo = createPendingEcho('e1', 'Use mango', earlier, 1_000)
    const other = [...earlier, agent('a2', 'Use mango'), user('u2', 'Something else')]
    expect(retainPendingEchoes([echo], other, 'running', 2_000)).toEqual([echo])
  })

  it('still finds its message when the transcript was replaced or trimmed', () => {
    const echo = createPendingEcho('e1', 'Use mango', earlier, 1_000)
    expect(retainPendingEchoes([echo], [user('u9', 'Use mango')], 'running', 2_000)).toEqual([])
  })

  it('keeps waiting through work and questions however long they take', () => {
    const echo = createPendingEcho('e1', 'Use mango', earlier, 1_000)
    const hourLater = 1_000 + 3_600_000
    expect(retainPendingEchoes([echo], earlier, 'running', hourLater)).toEqual([echo])
    expect(retainPendingEchoes([echo], earlier, 'waiting', hourLater)).toEqual([echo])
  })

  it('lets go only after the session has stayed settled for the grace period', () => {
    const echo = createPendingEcho('e1', 'Use mango', earlier, 1_000)
    // A long turn ends: the grace starts now, not when the message was sent.
    const settledAt = 1_000 + 3_600_000
    const [settling] = retainPendingEchoes([echo], earlier, 'idle', settledAt)
    expect(settling).toMatchObject({ id: 'e1', settledAt })
    const settling2 = retainPendingEchoes([settling], earlier, 'idle', settledAt + 5_000)
    expect(settling2).toEqual([settling])
    expect(retainPendingEchoes(
      [settling], earlier, 'idle', settledAt + PENDING_ECHO_SETTLED_MS,
    )).toEqual([])
    const [errored] = retainPendingEchoes([echo], earlier, 'error', settledAt)
    expect(retainPendingEchoes(
      [errored], earlier, 'error', settledAt + PENDING_ECHO_SETTLED_MS,
    )).toEqual([])
  })

  it('starts the grace over when the session goes back to work', () => {
    const echo = createPendingEcho('e1', 'Use mango', earlier, 1_000)
    const [settling] = retainPendingEchoes([echo], earlier, 'idle', 2_000)
    const [working] = retainPendingEchoes([settling], earlier, 'running', 3_000)
    expect(working.settledAt).toBeUndefined()
    const [again] = retainPendingEchoes([working], earlier, 'idle', 20_000)
    expect(again.settledAt).toBe(20_000)
  })

  it('returns the same array when nothing changed', () => {
    const echoes = [createPendingEcho('e1', 'Use mango', earlier, 1_000)]
    expect(retainPendingEchoes(echoes, earlier, 'running', 2_000)).toBe(echoes)
  })

  it('hides a logged echo for display without touching the grace', () => {
    const echo = createPendingEcho('e1', 'Use mango', earlier, 1_000)
    const echoes = [echo]
    expect(unloggedPendingEchoes(echoes, earlier)).toBe(echoes)
    expect(unloggedPendingEchoes(echoes, [...earlier, user('u2', 'Use mango')])).toEqual([])
  })
})

describe('pending echoes across sessions', () => {
  const earlier = [user('u1', 'Write the story')]
  const lookup = (sessions: Record<string, { messages: ChatMessage[], status: 'idle' | 'running' }>) =>
    (key: string) => sessions[key]

  it('keeps an unknown session’s echoes and drops emptied sessions', () => {
    const a = createPendingEcho('e1', 'Use mango', earlier, 1_000)
    const b = createPendingEcho('e2', 'Use kiwi', earlier, 1_000)
    const map = { one: [a], two: [b] }
    const next = prunePendingEchoMap(map, lookup({
      one: { messages: [...earlier, user('u2', 'Use mango')], status: 'running' },
    }), 2_000)
    expect(next).toEqual({ two: [b] })
    expect(prunePendingEchoMap(next, lookup({}), 3_000)).toBe(next)
  })

  it('settles on repeated prunes once the second identical echo is alone', () => {
    const first = createPendingEcho('e1', 'same', earlier, 1_000)
    const second = createPendingEcho('e2', 'same', earlier, 1_100)
    const once = lookup({ one: { messages: [...earlier, user('u2', 'same')], status: 'running' } })
    const next = prunePendingEchoMap({ one: [first, second] }, once, 2_000)
    expect(next.one).toMatchObject([{ id: 'e2' }])
    expect(prunePendingEchoMap(next, once, 3_000)).toBe(next)
  })

  it('reports when the next settled echo is due to go', () => {
    const echo = createPendingEcho('e1', 'Use mango', earlier, 1_000)
    expect(nextPendingEchoDeadline({ one: [echo] })).toBeUndefined()
    const [settling] = retainPendingEchoes([echo], earlier, 'idle', 5_000)
    expect(nextPendingEchoDeadline({ one: [settling] })).toBe(5_000 + PENDING_ECHO_SETTLED_MS)
  })
})
