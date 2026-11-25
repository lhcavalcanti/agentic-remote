// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  applySessionCategoryChange,
  type SessionCategoriesSnapshot,
  type SessionCategoryChange,
} from '../shared/session-categories'
import { SubmissionError } from '../shared/submission-error'
import { fetchSessionCategories, saveSessionCategoryChange } from './api'
import { useSessionCategories } from './use-session-categories'

vi.mock('./api', () => ({
  fetchSessionCategories: vi.fn(),
  saveSessionCategoryChange: vi.fn(),
}))

let hub: SessionCategoriesSnapshot

/** The hub's rules: a change against another revision is refused. */
async function commit(revision: number, change: SessionCategoryChange) {
  if (revision !== hub.revision) throw new SubmissionError('Categories changed on another device', 409)
  const categories = applySessionCategoryChange(hub.categories, change)
  if (categories !== hub.categories) hub = { revision: hub.revision + 1, categories }
  return structuredClone(hub)
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

const lab = { id: 'lab', name: 'Homelab', collapsed: false, sessions: ['hub:a'] }

async function loaded(onError = vi.fn()) {
  const hook = renderHook(() => useSessionCategories({ onError }))
  await act(async () => { await hook.result.current.sync() })
  return { hook, onError }
}

beforeEach(() => {
  vi.mocked(fetchSessionCategories).mockReset()
  vi.mocked(saveSessionCategoryChange).mockReset()
  hub = { revision: 4, categories: [structuredClone(lab)] }
  vi.mocked(fetchSessionCategories).mockImplementation(async () => structuredClone(hub))
  vi.mocked(saveSessionCategoryChange).mockImplementation(commit)
})

describe('useSessionCategories', () => {
  it('loads the hub\'s categories and follows newer snapshots, ignoring older ones', async () => {
    const { hook } = await loaded()
    expect(hook.result.current).toMatchObject({ available: true, categories: [lab] })

    act(() => hook.result.current.apply({ revision: 6, categories: [] }))
    expect(hook.result.current.categories).toEqual([])
    act(() => hook.result.current.apply({ revision: 5, categories: [lab] }))
    expect(hook.result.current.categories).toEqual([])
  })

  it('shows a change at once, and keeps it when the hub commits it', async () => {
    const { hook } = await loaded()
    const answer = deferred<SessionCategoriesSnapshot>()
    vi.mocked(saveSessionCategoryChange).mockImplementationOnce(async (revision, change) => {
      const committed = await commit(revision, change)
      return answer.promise.then(() => committed)
    })

    let saved: Promise<boolean> | undefined
    act(() => { saved = hook.result.current.change({ type: 'update', categoryId: 'lab', collapsed: true }, 'Could not collapse Homelab') })
    expect(hook.result.current.categories).toEqual([{ ...lab, collapsed: true }])
    await act(async () => {
      answer.resolve(hub)
      expect(await saved).toBe(true)
    })
    expect(hook.result.current.categories).toEqual([{ ...lab, collapsed: true }])
    expect(saveSessionCategoryChange).toHaveBeenCalledWith(4, { type: 'update', categoryId: 'lab', collapsed: true })
  })

  it('sends changes one at a time, each against the revision the one before produced', async () => {
    const { hook } = await loaded()
    const first = deferred<void>()
    vi.mocked(saveSessionCategoryChange).mockImplementationOnce(async (revision, change) => {
      await first.promise
      return commit(revision, change)
    })

    let second: Promise<boolean> | undefined
    act(() => {
      void hook.result.current.change({ type: 'update', categoryId: 'lab', name: 'Lab' }, 'Could not rename')
      second = hook.result.current.change({ type: 'move', sessions: ['hub:b'], categoryId: 'lab' }, 'Could not move')
    })
    // Both show while the first is still on its way.
    expect(hook.result.current.categories).toEqual([{ ...lab, name: 'Lab', sessions: ['hub:a', 'hub:b'] }])
    await waitFor(() => expect(saveSessionCategoryChange).toHaveBeenCalledTimes(1))
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(saveSessionCategoryChange).toHaveBeenCalledTimes(1)
    await act(async () => {
      first.resolve()
      expect(await second).toBe(true)
    })
    expect(vi.mocked(saveSessionCategoryChange).mock.calls.map(([revision]) => revision)).toEqual([4, 5])
    expect(hook.result.current.categories).toEqual(hub.categories)
  })

  it('keeps its own changes shown over another browser\'s that arrives meanwhile', async () => {
    const { hook } = await loaded()
    const answer = deferred<void>()
    vi.mocked(saveSessionCategoryChange).mockImplementationOnce(async (revision, change) => {
      await answer.promise
      return commit(revision, change)
    })

    act(() => { void hook.result.current.change({ type: 'update', categoryId: 'lab', collapsed: true }, 'Could not collapse') })
    act(() => hook.result.current.apply({
      revision: 4, categories: [lab, { id: 'other', name: 'Other', collapsed: false, sessions: [] }],
    }))
    expect(hook.result.current.categories).toEqual([
      { ...lab, collapsed: true }, { id: 'other', name: 'Other', collapsed: false, sessions: [] },
    ])
    await act(async () => { answer.resolve() })
  })

  it('puts back what the hub committed when it refuses a change, and reports it once', async () => {
    const { hook, onError } = await loaded()
    // Another device moved the hub on.
    hub = { revision: 5, categories: [{ ...lab, name: 'Their lab' }] }

    let first: Promise<boolean> | undefined
    let second: Promise<boolean> | undefined
    act(() => {
      first = hook.result.current.change({ type: 'update', categoryId: 'lab', collapsed: true }, 'Could not collapse Homelab')
      second = hook.result.current.change({ type: 'delete', categoryId: 'lab' }, 'Could not delete Homelab')
    })
    expect(hook.result.current.categories).toEqual([])
    await act(async () => {
      expect(await first).toBe(false)
      expect(await second).toBe(false)
    })
    // Only the refused change went out; the one queued behind it was dropped.
    expect(saveSessionCategoryChange).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith('Could not collapse Homelab: Categories changed on another device')
    await waitFor(() => expect(hook.result.current.categories).toEqual([{ ...lab, name: 'Their lab' }]))
  })

  it('reports a change the categories cannot take without sending it', async () => {
    const { hook, onError } = await loaded()
    let saved: Promise<boolean> | undefined
    act(() => { saved = hook.result.current.change({ type: 'create', id: 'x', name: 'HOMELAB' }, 'Could not create HOMELAB') })
    expect(await saved).toBe(false)
    expect(onError).toHaveBeenCalledWith('Could not create HOMELAB: A category named HOMELAB already exists')
    expect(saveSessionCategoryChange).not.toHaveBeenCalled()
    expect(hook.result.current.categories).toEqual([lab])
  })

  it('is unavailable on a hub without categories', async () => {
    for (const status of [404, 503]) {
      vi.mocked(fetchSessionCategories).mockRejectedValueOnce(new SubmissionError('Unavailable', status))
      const onError = vi.fn()
      const hook = renderHook(() => useSessionCategories({ onError }))
      await act(async () => { await hook.result.current.sync() })
      expect(hook.result.current.available).toBe(false)
      let saved: Promise<boolean> | undefined
      act(() => { saved = hook.result.current.change({ type: 'create', id: 'x', name: 'X' }, 'Could not create X') })
      expect(await saved).toBe(false)
      expect(saveSessionCategoryChange).not.toHaveBeenCalled()
    }
  })

  it('lets go of the categories it showed once the hub stops keeping them', async () => {
    for (const status of [404, 503]) {
      const { hook, onError } = await loaded()
      expect(hook.result.current.categories).toEqual([lab])
      vi.mocked(saveSessionCategoryChange).mockRejectedValueOnce(new SubmissionError('Unavailable', status))
      vi.mocked(fetchSessionCategories).mockRejectedValueOnce(new SubmissionError('Unavailable', status))
      let saved: Promise<boolean> | undefined
      act(() => { saved = hook.result.current.change({ type: 'update', categoryId: 'lab', collapsed: true }, 'Could not collapse Homelab') })
      await act(async () => { expect(await saved).toBe(false) })
      await waitFor(() => expect(hook.result.current.available).toBe(false))
      // Its sessions go back under their computers rather than out of sight.
      expect(hook.result.current.categories).toEqual([])

      vi.mocked(saveSessionCategoryChange).mockClear()
      let later: Promise<boolean> | undefined
      act(() => { later = hook.result.current.change({ type: 'create', id: 'x', name: 'X' }, 'Could not create X') })
      expect(await later).toBe(false)
      expect(saveSessionCategoryChange).not.toHaveBeenCalled()
      // Said, rather than dropped, from a dialog still open when it happened.
      expect(onError).toHaveBeenLastCalledWith('Could not create X: This hub is not keeping categories')
      hook.unmount()
    }
  })
})
