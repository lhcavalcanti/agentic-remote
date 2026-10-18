import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import type { SessionDetail } from '../shared/contracts.js'
import { serializeState, serializeStateChunks, SessionStore } from './session-store.js'

const directories: string[] = []
const timestamp = '2026-09-04T00:00:00.000Z'

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

/** A soak run sets this to explore new seeds; failures name the seed. */
const seedOffset = Number(process.env.PROPERTY_SEED_OFFSET ?? 0)

function random(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

function session(id: string, content = 'Hello'): SessionDetail {
  return {
    id, cwd: '/project', title: id, updatedAt: timestamp, status: 'idle', isOpen: false,
    messages: [{ id: 'assistant', role: 'assistant', content, createdAt: timestamp }],
  }
}

async function open(directory?: string) {
  const root = directory ?? await mkdtemp(path.join(tmpdir(), 'store-serialization-'))
  if (!directory) directories.push(root)
  const store = new SessionStore(root)
  await store.initialize()
  return { root, store }
}

function committed(store: SessionStore): unknown {
  return (store as unknown as { checkpoint: unknown }).checkpoint
}

// The exact bytes `JSON.stringify` would have written.
function expectBytes(actual: Buffer, value: unknown) {
  expect(actual.equals(Buffer.from(JSON.stringify(value), 'utf8'))).toBe(true)
}

describe('serializeState', () => {
  it('is byte-for-byte JSON.stringify for awkward states', () => {
    const states = [
      { version: 1, sessions: {} },
      { version: 1, sessions: {}, retiredSessionIds: ['a'] },
      { version: 1, sessions: { a: session('a') }, retiredSessionIds: undefined },
      {
        sessions: {
          '2': session('2', 'line\nbreak "quoted" \u2028 \u{1f600} \\ \ud800 é'),
          '1': { ...session('1'), runtime: undefined, activity: undefined },
          b: session('b'),
          'quote"key': session('quote"key'),
          gone: undefined,
          nothing: null,
        },
        version: 1,
        retiredSessionIds: [],
        extra: () => undefined,
      },
    ]
    for (const state of states) {
      const parsed = state as unknown as Parameters<typeof serializeState>[0]
      // Twice: the second call is served from the per-session cache.
      expectBytes(serializeState(parsed), state)
      expectBytes(serializeState(parsed), state)
    }
  })

  it('reflects a replaced session and reuses an unchanged one', () => {
    const unchanged = session('unchanged')
    const state = { version: 1 as const, sessions: { unchanged, changed: session('changed') } }
    expectBytes(serializeState(state), state)
    const next = { ...state, sessions: { ...state.sessions, changed: session('changed', 'Updated') } }
    expectBytes(serializeState(next), next)
    expect(serializeState(next).toString('utf8')).toContain('Updated')
  })
})

describe('serializeStateChunks', () => {
  it('writes the same bytes in pieces, joining small sessions and never copying a large one', () => {
    for (let seed = seedOffset + 1; seed <= seedOffset + 40; seed += 1) {
      const next = random(seed)
      const sessions: Record<string, SessionDetail> = {}
      for (let index = 0; index < Math.floor(next() * 300); index += 1) {
        const size = next() < 0.1 ? 40_000 + Math.floor(next() * 200_000) : Math.floor(next() * 3_000)
        sessions[`s${index}`] = session(`s${index}`, 'é\u{1f600}x'.repeat(Math.ceil(size / 4)).slice(0, size))
      }
      const state = { version: 1 as const, sessions, retiredSessionIds: ['gone'] }
      const chunks = serializeStateChunks(state)
      expectBytes(Buffer.concat(chunks), state)
      // Every piece is whole UTF-8 on its own, so no character is split.
      for (const chunk of chunks) expect(Buffer.from(chunk.toString('utf8'), 'utf8').equals(chunk)).toBe(true)
      // A large session is its own piece, the very buffer cached for it.
      const large = Object.values(sessions).filter((entry) => Buffer.byteLength(JSON.stringify(entry)) >= 64 * 1024)
      const own = chunks.filter((chunk) => chunk.subarray(0, 6).toString() === '{"id":')
      expect(own.length).toBe(large.length)
      const again = serializeStateChunks(state)
      for (const chunk of own) expect(again.includes(chunk)).toBe(true)
      expect(chunks.length).toBeLessThanOrEqual(2 * large.length + Math.ceil(Buffer.concat(chunks).length / (64 * 1024)) + 2)
    }
  })
})

describe('session store serialization', () => {
  it('freezes every committed session under test', async () => {
    const { store } = await open()
    await store.create(session('frozen'), { backend: 'sdk' })
    const state = committed(store) as { sessions: Record<string, unknown> }
    expect(Object.isFrozen(state.sessions.frozen)).toBe(true)
    expect(() => store.get('frozen')!.messages.push(session('x').messages[0])).not.toThrow()
  })

  it('writes exactly the committed state and restores it after random operations', async () => {
    for (let seed = 1; seed <= 12; seed += 1) {
      const next = random(seed)
      const { root, store } = await open()
      const ids: string[] = []
      for (let step = 0; step < 60; step += 1) {
        const choice = next()
        const id = ids[Math.floor(next() * ids.length)]
        if (choice < 0.2 || !id) {
          const created = `s${seed}-${step}`
          await store.create(session(created), { backend: next() < 0.5 ? 'sdk' : 'terminal' })
          ids.push(created)
        } else if (choice < 0.4) {
          // Now and then larger than one write, so it is written on its own.
          const content = `step ${step} \u{1f600}`.repeat(next() < 0.2 ? 6_000 : 1)
          await store.addMessage(id, {
            id: `m${step}`, role: next() < 0.5 ? 'user' : 'assistant', content, createdAt: timestamp,
          })
        } else if (choice < 0.55) {
          const streamed = `stream-${step}`
          await store.addMessage(id, { id: streamed, role: 'assistant', content: '', createdAt: timestamp, streaming: true })
          store.streamMessage(id, streamed, 'partial ')
          store.streamMessage(id, streamed, 'reply')
          if (next() < 0.7) await store.finishMessage(id, streamed)
        } else if (choice < 0.7) {
          await store.update(id, (draft) => { draft.title = `title ${step}` })
        } else if (choice < 0.8) {
          await Promise.all(ids.slice(0, 4).map((target, index) =>
            store.update(target, (draft) => { draft.activity = `concurrent ${step}-${index}` })))
        } else if (choice < 0.9) {
          await store.setOpen(id, next() < 0.5)
        } else {
          await store.remove(id)
          ids.splice(ids.indexOf(id), 1)
        }
        if (step % 10 === 9) {
          await store.flush()
          const written = await readFile(path.join(root, 'state.json'), 'utf8')
          expect(written, `seed ${seed} step ${step}`).toBe(JSON.stringify(committed(store)))
        }
      }
      await store.verifyPersistence()
      const expected = store.list().map((entry) => ({
        id: entry.id, title: entry.title,
        messages: entry.messages.map((message) => [message.id, message.content]),
      }))
      await store.close()
      expect(await readFile(path.join(root, 'state.json'), 'utf8')).toBe(JSON.stringify(committed(store)))
      const { store: reopened } = await open(root)
      expect(reopened.list().map((entry) => ({
        id: entry.id, title: entry.title,
        messages: entry.messages.map((message) => [message.id, message.content]),
      })), `seed ${seed}`).toEqual(expected)
      await reopened.close()
    }
  })
})
