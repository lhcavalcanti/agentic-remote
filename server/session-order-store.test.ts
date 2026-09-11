import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SessionOrderStore } from './session-order-store.js'

const directories: string[] = []

async function store(): Promise<{ store: SessionOrderStore; directory: string }> {
  const directory = await mkdtemp(path.join(tmpdir(), 'session-order-test-'))
  directories.push(directory)
  const created = new SessionOrderStore(directory)
  await created.initialize()
  return { store: created, directory }
}

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

describe('SessionOrderStore', () => {
  it('starts empty and advances a revision only when something changes', async () => {
    const { store: order } = await store()
    expect(order.snapshot()).toEqual({ revision: 0, bootstrapped: false, order: {} })
    expect(order.isBootstrapped()).toBe(false)

    const first = await order.appendSession('pc', 'a')
    expect(first).toEqual({ revision: 1, bootstrapped: false, order: { pc: ['pc:a'] } })

    // Discovering the same session again is not news.
    const repeat = await order.appendSession('pc', 'a')
    expect(repeat.revision).toBe(1)
  })

  it('reloads the committed order and revision from disk', async () => {
    const { store: order, directory } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')
    await order.replaceLane('pc', ['pc:b', 'pc:a'])

    const reloaded = new SessionOrderStore(directory)
    await reloaded.initialize()
    expect(reloaded.snapshot()).toEqual({ revision: 3, bootstrapped: false, order: { pc: ['pc:b', 'pc:a'] } })
  })

  it('writes the state file privately', async () => {
    const { store: order, directory } = await store()
    await order.appendSession('pc', 'a')
    const { mode } = await import('node:fs/promises').then((fs) =>
      fs.stat(path.join(directory, 'session-order.json')),
    )
    expect(mode & 0o777).toBe(0o600)
  })

  it('refuses to start on malformed or unsupported state instead of resetting it', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'session-order-test-'))
    directories.push(directory)
    const statePath = path.join(directory, 'session-order.json')

    await writeFile(statePath, 'not json')
    await expect(new SessionOrderStore(directory).initialize()).rejects.toThrow(
      /not readable JSON/,
    )

    await writeFile(statePath, JSON.stringify({ version: 99, revision: 1, order: {} }))
    await expect(new SessionOrderStore(directory).initialize()).rejects.toThrow(
      /unsupported version 99/,
    )
  })

  it('drops duplicate and malformed entries when loading a lane', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'session-order-test-'))
    directories.push(directory)
    await writeFile(
      path.join(directory, 'session-order.json'),
      JSON.stringify({
        version: 1,
        revision: 4,
        order: { pc: ['pc:a', 'pc:a', 7, '', 'pc:b'], empty: [] },
      }),
    )
    const order = new SessionOrderStore(directory)
    await order.initialize()
    expect(order.snapshot()).toEqual({ revision: 4, bootstrapped: false, order: { pc: ['pc:a', 'pc:b'] } })
  })

  it('reorders one lane without touching another', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')
    await order.appendSession('laptop', 'x')

    const committed = await order.replaceLane('pc', ['pc:b', 'pc:a'])
    expect(committed.order).toEqual({ pc: ['pc:b', 'pc:a'], laptop: ['laptop:x'] })
  })

  it('keeps entries the submitted lane never mentioned', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')
    await order.appendSession('pc', 'c')

    // A client that had filtered 'c' out of view submits only what it saw.
    const committed = await order.replaceLane('pc', ['pc:b', 'pc:a'])
    expect(committed.order.pc).toEqual(['pc:b', 'pc:a', 'pc:c'])
  })

  it('rejects a lane holding another computer\'s session', async () => {
    const { store: order } = await store()
    await expect(order.replaceLane('pc', ['pc:a', 'laptop:x'])).rejects.toThrow(
      /does not belong to pc/,
    )
    await expect(
      order.replaceLane('pc', 'nope' as unknown as string[]),
    ).rejects.toThrow(/list of keys/)
  })

  it('puts a replacement in the predecessor\'s exact slot, repeatedly', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')
    await order.appendSession('pc', 'c')
    await order.replaceLane('pc', ['pc:c', 'pc:a', 'pc:b'])

    const once = await order.replaceSession('pc', 'a', 'a2')
    expect(once.order.pc).toEqual(['pc:c', 'pc:a2', 'pc:b'])

    const twice = await order.replaceSession('pc', 'a2', 'a3')
    expect(twice.order.pc).toEqual(['pc:c', 'pc:a3', 'pc:b'])
  })

  it('is idempotent when a clear is reported twice', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')

    const first = await order.replaceSession('pc', 'a', 'a2')
    const second = await order.replaceSession('pc', 'a', 'a2')
    expect(second.revision).toBe(first.revision)
    expect(second.order.pc).toEqual(['pc:a2', 'pc:b'])
  })

  it('does not leave a replacement listed twice', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')

    const committed = await order.replaceSession('pc', 'a', 'b')
    expect(committed.order.pc).toEqual(['pc:b'])
  })

  it('appends a replacement whose predecessor was never recorded', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    const committed = await order.replaceSession('pc', 'unknown', 'new')
    expect(committed.order.pc).toEqual(['pc:a', 'pc:new'])
  })

  it('prunes a deleted session and an unpaired computer', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')
    await order.appendSession('laptop', 'x')

    const removed = await order.removeSession('pc', 'a')
    expect(removed.order.pc).toEqual(['pc:b'])

    // The last session leaving takes its empty lane with it.
    const emptied = await order.removeSession('pc', 'b')
    expect(emptied.order).toEqual({ laptop: ['laptop:x'] })

    const unpaired = await order.removeComputer('laptop')
    expect(unpaired.order).toEqual({})

    const again = await order.removeComputer('laptop')
    expect(again.revision).toBe(unpaired.revision)
  })

  it('seeds an empty hub from a legacy local order, once', async () => {
    const { store: order } = await store()
    const seeded = await order.bootstrap({ pc: ['pc:b', 'pc:a'], laptop: ['laptop:x'] })
    expect(seeded.order).toEqual({ pc: ['pc:b', 'pc:a'], laptop: ['laptop:x'] })

    // A second device arriving with its own order must not win.
    const later = await order.bootstrap({ pc: ['pc:a', 'pc:b'] })
    expect(later.revision).toBe(seeded.revision)
    expect(later.order.pc).toEqual(['pc:b', 'pc:a'])
  })

  it('ignores legacy entries that name the wrong computer', async () => {
    const { store: order } = await store()
    const seeded = await order.bootstrap({ pc: ['laptop:x', 'pc:a'], empty: [] })
    expect(seeded.order).toEqual({ pc: ['pc:a'] })
  })

  it('only rearranges what the lane already holds', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')

    // A client still showing a cleared session must not bring it back, nor
    // push the live successor down the list with it.
    const committed = await order.replaceLane('pc', ['pc:retired', 'pc:b', 'pc:a'])
    expect(committed.order.pc).toEqual(['pc:b', 'pc:a'])
  })

  it('does not resurrect a lane that was removed', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.removeComputer('pc')

    const committed = await order.replaceLane('pc', ['pc:a'])
    expect(committed.order).toEqual({})
  })

  it('restores a replacement into a slot a plain removal already retired', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')
    await order.appendSession('pc', 'c')
    const slot = order.indexOf('pc', 'b')
    expect(slot).toBe(1)

    // The legacy node's removal lands before the clear response names the heir.
    await order.removeSession('pc', 'b')
    const committed = await order.replaceSession('pc', 'b', 'b2', slot)
    expect(committed.order.pc).toEqual(['pc:a', 'pc:b2', 'pc:c'])
  })

  it('moves an already appended successor back into the remembered slot', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')
    await order.appendSession('pc', 'c')
    await order.removeSession('pc', 'b')
    // A reconnect appended the successor at the end before the lineage arrived.
    await order.appendSession('pc', 'b2')
    expect(order.snapshot().order.pc).toEqual(['pc:a', 'pc:c', 'pc:b2'])

    const committed = await order.replaceSession('pc', 'b', 'b2', 1)
    expect(committed.order.pc).toEqual(['pc:a', 'pc:b2', 'pc:c'])
  })

  it('keeps concurrent commits consistent and durable', async () => {
    const { store: order, directory } = await store()
    await Promise.all([
      order.appendSession('pc', 'a'),
      order.appendSession('pc', 'b'),
      order.appendSession('pc', 'c'),
    ])
    expect(order.snapshot().order.pc).toHaveLength(3)

    // Every acknowledged revision has to survive a reload.
    const reloaded = new SessionOrderStore(directory)
    await reloaded.initialize()
    expect(reloaded.snapshot()).toEqual(order.snapshot())
  })

  it('takes a bootstrap after discovery already appended sessions', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')
    expect(order.isBootstrapped()).toBe(false)

    // Discovery moved the revision, but the browser's arrangement is still owed.
    const seeded = await order.bootstrap({ pc: ['pc:b', 'pc:a'] })
    expect(seeded.order.pc).toEqual(['pc:b', 'pc:a'])
    expect(seeded.bootstrapped).toBe(true)

    const later = await order.bootstrap({ pc: ['pc:a', 'pc:b'] })
    expect(later.order.pc).toEqual(['pc:b', 'pc:a'])
  })

  it('keeps sessions a legacy order never mentioned', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'fresh')
    const seeded = await order.bootstrap({ pc: ['pc:a'] })
    expect(seeded.order.pc).toEqual(['pc:a', 'pc:fresh'])
  })

  it('keeps the last committed order when a write fails', async () => {
    const { store: order, directory } = await store()
    await order.appendSession('pc', 'a')
    const committed = order.snapshot()

    // Replacing the directory with a file makes the temporary write fail.
    await rm(directory, { recursive: true, force: true })
    await writeFile(directory, 'blocked')

    await expect(order.appendSession('pc', 'b')).rejects.toThrow()
    expect(order.snapshot()).toEqual(committed)

    await rm(directory, { force: true })
  })

  it('persists the on-disk shape it documents', async () => {
    const { store: order, directory } = await store()
    await order.appendSession('pc', 'a')
    const written = JSON.parse(
      await readFile(path.join(directory, 'session-order.json'), 'utf8'),
    ) as Record<string, unknown>
    expect(written).toEqual({ version: 1, revision: 1, bootstrapped: false, order: { pc: ['pc:a'] } })
  })
})
