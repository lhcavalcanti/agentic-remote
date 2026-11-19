import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
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
    expect(order.snapshot()).toEqual({
      revision: 0, bootstrapped: false, showSuspended: true, showHidden: false, hidden: [], unread: [], order: {},
    })
    expect(order.isBootstrapped()).toBe(false)

    const first = await order.appendSession('pc', 'a')
    expect(first).toEqual({
      revision: 1,
      bootstrapped: false,
      showSuspended: true,
      showHidden: false,
      hidden: [],
      unread: [],
      order: { pc: ['pc:a'] },
    })

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
    expect(reloaded.snapshot()).toEqual({
      revision: 3,
      bootstrapped: false,
      showSuspended: true,
      showHidden: false,
      hidden: [],
      unread: [],
      order: { pc: ['pc:b', 'pc:a'] },
    })
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
        hidden: ['pc:b', 'pc:b', 7, ''],
        unread: ['pc:a', 'pc:a', 7, ''],
        order: { pc: ['pc:a', 'pc:a', 7, '', 'pc:b'], empty: [] },
      }),
    )
    const order = new SessionOrderStore(directory)
    await order.initialize()
    expect(order.snapshot()).toEqual({
      revision: 4,
      bootstrapped: false,
      showSuspended: true,
      showHidden: false,
      hidden: ['pc:b'],
      unread: ['pc:a'],
      order: { pc: ['pc:a', 'pc:b'] },
    })
  })

  it('shares suspended visibility durably and advances only on a change', async () => {
    const { store: order, directory } = await store()
    const hidden = await order.setVisibility({ showSuspended: false })
    expect(hidden).toMatchObject({ revision: 1, showSuspended: false })
    expect((await order.setVisibility({ showSuspended: false })).revision).toBe(1)

    const reloaded = new SessionOrderStore(directory)
    await reloaded.initialize()
    expect(reloaded.snapshot()).toEqual(hidden)
  })

  it('hides a session and shows hidden sessions durably, advancing only on a change', async () => {
    const { store: order, directory } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')

    const hidden = await order.setSessionHidden('pc', 'b', true)
    expect(hidden).toMatchObject({ revision: 3, hidden: ['pc:b'], showHidden: false })
    expect((await order.setSessionHidden('pc', 'b', true)).revision).toBe(3)

    const shown = await order.setVisibility({ showHidden: true })
    expect(shown).toMatchObject({ revision: 4, showHidden: true, showSuspended: true })
    expect((await order.setVisibility({ showHidden: true })).revision).toBe(4)
    // Hiding never reorders: the lane keeps the hidden session where it was.
    expect(shown.order).toEqual({ pc: ['pc:a', 'pc:b'] })

    const reloaded = new SessionOrderStore(directory)
    await reloaded.initialize()
    expect(reloaded.snapshot()).toEqual(shown)

    const unhidden = await reloaded.setSessionHidden('pc', 'b', false)
    expect(unhidden).toMatchObject({ revision: 5, hidden: [] })
    expect((await reloaded.setSessionHidden('pc', 'b', false)).revision).toBe(5)
  })

  it('applies both visibility preferences in one commit', async () => {
    const { store: order } = await store()
    const committed = await order.setVisibility({ showSuspended: false, showHidden: true })
    expect(committed).toMatchObject({ revision: 1, showSuspended: false, showHidden: true })
  })

  it('refuses to hide a session its lane does not hold, but unhides one freely', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')

    await expect(order.setSessionHidden('pc', 'missing', true)).rejects.toMatchObject({
      statusCode: 409,
    })
    await expect(order.setSessionHidden('laptop', 'a', true)).rejects.toMatchObject({
      statusCode: 409,
    })
    expect(order.snapshot()).toMatchObject({ revision: 1, hidden: [] })

    // Unhiding something never hidden is not news, and never an error.
    expect((await order.setSessionHidden('pc', 'missing', false)).revision).toBe(1)
  })

  it('forgets a hidden session when it is deleted or its computer is unpaired', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')
    await order.appendSession('laptop', 'x')
    await order.setSessionHidden('pc', 'a', true)
    await order.setSessionHidden('pc', 'b', true)
    await order.setSessionHidden('laptop', 'x', true)

    expect((await order.removeSession('pc', 'a')).hidden).toEqual(['pc:b', 'laptop:x'])
    const unpaired = await order.removeComputer('laptop')
    expect(unpaired.hidden).toEqual(['pc:b'])
    expect(unpaired.order).toEqual({ pc: ['pc:b'] })
  })

  it('keeps a cleared session hidden under its replacement identity', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')
    await order.setSessionHidden('pc', 'a', true)

    const replaced = await order.replaceSession('pc', 'a', 'a2')
    expect(replaced.hidden).toEqual(['pc:a2'])
    expect(replaced.order).toEqual({ pc: ['pc:a2', 'pc:b'] })
  })

  it('restores hidden onto a replacement after a plain removal retired the predecessor', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')
    await order.setSessionHidden('pc', 'a', true)
    const slot = order.indexOf('pc', 'a')

    // A legacy node reports the clear as a plain removal first.
    expect((await order.removeSession('pc', 'a')).hidden).toEqual([])
    const restored = await order.replaceSession('pc', 'a', 'a2', slot)
    expect(restored.hidden).toEqual(['pc:a2'])
    expect(restored.order).toEqual({ pc: ['pc:a2', 'pc:b'] })

    // Reported again, the same clear changes nothing.
    expect((await order.replaceSession('pc', 'a', 'a2', slot)).revision)
      .toBe(restored.revision)
  })

  it('keeps what a removal retired for a retry when saving its replacement fails', async () => {
    const { store: order, directory } = await store()
    await order.appendSession('pc', 'a')
    await order.setSessionHidden('pc', 'a', true)
    await order.setSessionUnread('pc', 'a', true)
    await order.removeSession('pc', 'a')

    // Replacing the directory with a file makes the temporary write fail.
    await rm(directory, { recursive: true, force: true })
    await writeFile(directory, 'blocked')
    await expect(order.replaceSession('pc', 'a', 'a2', 0)).rejects.toThrow()
    await rm(directory, { force: true })
    await mkdir(directory)

    expect(await order.replaceSession('pc', 'a', 'a2', 0)).toMatchObject({
      hidden: ['pc:a2'],
      unread: ['pc:a2'],
    })
  })

  it('does not hide a replacement whose predecessor was shown again before it was replaced', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')
    await order.setSessionHidden('pc', 'a', true)
    await order.setSessionHidden('pc', 'b', true)

    // Shown after a legacy node's plain removal already retired it.
    await order.removeSession('pc', 'a')
    await order.setSessionHidden('pc', 'a', false)
    expect((await order.replaceSession('pc', 'a', 'a2', 0)).hidden).toEqual(['pc:b'])

    // Shown before the clear's link arrives.
    await order.setSessionHidden('pc', 'b', false)
    expect((await order.replaceSession('pc', 'b', 'b2')).hidden).toEqual([])
  })

  it('marks a session unread and read durably, advancing only on a change', async () => {
    const { store: order, directory } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')

    const unread = await order.setSessionUnread('pc', 'b', true)
    expect(unread).toMatchObject({ revision: 3, unread: ['pc:b'], hidden: [] })
    expect((await order.setSessionUnread('pc', 'b', true)).revision).toBe(3)
    // Unread never reorders.
    expect(unread.order).toEqual({ pc: ['pc:a', 'pc:b'] })

    const reloaded = new SessionOrderStore(directory)
    await reloaded.initialize()
    expect(reloaded.snapshot()).toEqual(unread)

    const read = await reloaded.setSessionUnread('pc', 'b', false)
    expect(read).toMatchObject({ revision: 4, unread: [] })
    expect((await reloaded.setSessionUnread('pc', 'b', false)).revision).toBe(4)
  })

  it('refuses to mark unread a session its lane does not hold, but marks one read freely', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')

    await expect(order.setSessionUnread('pc', 'missing', true)).rejects.toMatchObject({
      statusCode: 409,
    })
    await expect(order.setSessionUnread('laptop', 'a', true)).rejects.toMatchObject({
      statusCode: 409,
    })
    // A turn that ends for a session the list no longer holds is not news.
    expect((await order.setSessionUnread('pc', 'missing', true, { ifListed: true })).revision)
      .toBe(1)
    expect(order.snapshot()).toMatchObject({ revision: 1, unread: [] })
    expect((await order.setSessionUnread('pc', 'missing', false)).revision).toBe(1)
  })

  it('keeps unread and hidden independent of each other', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.setSessionHidden('pc', 'a', true)

    expect(await order.setSessionUnread('pc', 'a', true)).toMatchObject({
      hidden: ['pc:a'],
      unread: ['pc:a'],
    })
    expect(await order.setSessionHidden('pc', 'a', false)).toMatchObject({
      hidden: [],
      unread: ['pc:a'],
    })
  })

  it('forgets an unread session when it is closed or deleted, or its computer is unpaired', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')
    await order.appendSession('laptop', 'x')
    await order.setSessionUnread('pc', 'a', true)
    await order.setSessionUnread('pc', 'b', true)
    await order.setSessionUnread('laptop', 'x', true)

    expect((await order.removeSession('pc', 'a')).unread).toEqual(['pc:b', 'laptop:x'])
    const unpaired = await order.removeComputer('laptop')
    expect(unpaired.unread).toEqual(['pc:b'])
    expect(unpaired.order).toEqual({ pc: ['pc:b'] })
  })

  it('keeps a cleared session unread under its replacement identity', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')
    await order.setSessionUnread('pc', 'a', true)

    const replaced = await order.replaceSession('pc', 'a', 'a2')
    expect(replaced.unread).toEqual(['pc:a2'])
    expect(replaced.order).toEqual({ pc: ['pc:a2', 'pc:b'] })
  })

  it('restores unread onto a replacement after a plain removal retired the predecessor', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')
    await order.setSessionUnread('pc', 'a', true)
    const slot = order.indexOf('pc', 'a')

    // A legacy node reports the clear as a plain removal first.
    expect((await order.removeSession('pc', 'a')).unread).toEqual([])
    const restored = await order.replaceSession('pc', 'a', 'a2', slot)
    expect(restored.unread).toEqual(['pc:a2'])

    // Reported again, the same clear changes nothing.
    expect((await order.replaceSession('pc', 'a', 'a2', slot)).revision)
      .toBe(restored.revision)
  })

  it('does not mark a replacement unread whose predecessor was read before it was replaced', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')
    await order.setSessionUnread('pc', 'a', true)
    await order.setSessionUnread('pc', 'b', true)

    // Read after a legacy node's plain removal already retired it.
    await order.removeSession('pc', 'a')
    await order.setSessionUnread('pc', 'a', false)
    expect((await order.replaceSession('pc', 'a', 'a2', 0)).unread).toEqual(['pc:b'])

    // Read before the clear's link arrives.
    await order.setSessionUnread('pc', 'b', false)
    expect((await order.replaceSession('pc', 'b', 'b2')).unread).toEqual([])
  })

  it('does not bring back marks a closed session had once it is reopened and later cleared', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.setSessionHidden('pc', 'a', true)
    await order.setSessionUnread('pc', 'a', true)

    // Closing drops both marks, and reopening lists it again without them.
    await order.removeSession('pc', 'a')
    expect(await order.appendSession('pc', 'a')).toMatchObject({ hidden: [], unread: [] })

    // Only a clear reported as a plain removal may hand its marks on.
    expect(await order.replaceSession('pc', 'a', 'a2')).toMatchObject({
      hidden: [],
      unread: [],
      order: { pc: ['pc:a2'] },
    })
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

  it('refuses a lane arranged from a view that has moved on', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')

    // Silently dropping the retired key would move the live successor last,
    // so the whole lane is refused and the client resynchronizes.
    await expect(
      order.replaceLane('pc', ['pc:retired', 'pc:b', 'pc:a']),
    ).rejects.toMatchObject({ statusCode: 409 })
    expect(order.snapshot().order.pc).toEqual(['pc:a', 'pc:b'])
  })

  it('refuses a reorder queued behind the clear that retired its key', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.appendSession('pc', 'b')
    await order.appendSession('pc', 'c')

    // Both are in flight together: the lane was arranged while 'b' still
    // existed, and the clear commits first.
    const cleared = order.replaceSession('pc', 'b', 'b2')
    const stale = order.replaceLane('pc', ['pc:c', 'pc:b', 'pc:a'])

    await cleared
    await expect(stale).rejects.toMatchObject({ statusCode: 409 })
    // The successor keeps the slot rather than being pushed to the end.
    expect(order.snapshot().order.pc).toEqual(['pc:a', 'pc:b2', 'pc:c'])
  })

  it('keeps committing after a refused lane', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await expect(order.replaceLane('pc', ['pc:ghost'])).rejects.toMatchObject({
      statusCode: 409,
    })
    const after = await order.appendSession('pc', 'b')
    expect(after.order.pc).toEqual(['pc:a', 'pc:b'])
  })

  it('does not resurrect a lane that was removed', async () => {
    const { store: order } = await store()
    await order.appendSession('pc', 'a')
    await order.removeComputer('pc')

    await expect(order.replaceLane('pc', ['pc:a'])).rejects.toMatchObject({
      statusCode: 409,
    })
    expect(order.snapshot().order).toEqual({})
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
    await order.appendSession('pc', 'b')
    await order.setSessionHidden('pc', 'a', true)
    const committed = order.snapshot()

    // Replacing the directory with a file makes the temporary write fail.
    await rm(directory, { recursive: true, force: true })
    await writeFile(directory, 'blocked')

    await expect(order.appendSession('pc', 'c')).rejects.toThrow()
    await expect(order.setSessionHidden('pc', 'b', true)).rejects.toThrow()
    await expect(order.setSessionHidden('pc', 'a', false)).rejects.toThrow()
    await expect(order.setSessionUnread('pc', 'b', true)).rejects.toThrow()
    await expect(order.setVisibility({ showHidden: true })).rejects.toThrow()
    expect(order.snapshot()).toEqual(committed)

    await rm(directory, { force: true })
  })

  it('persists the on-disk shape it documents', async () => {
    const { store: order, directory } = await store()
    await order.appendSession('pc', 'a')
    const written = JSON.parse(
      await readFile(path.join(directory, 'session-order.json'), 'utf8'),
    ) as Record<string, unknown>
    expect(written).toEqual({
      version: 1,
      revision: 1,
      bootstrapped: false,
      showSuspended: true,
      showHidden: false,
      hidden: [],
      unread: [],
      order: { pc: ['pc:a'] },
    })
  })
})
