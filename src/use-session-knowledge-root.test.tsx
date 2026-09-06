// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { KnowledgeRoot, SessionKnowledgeBinding } from '../shared/contracts'
import { getSessionKnowledgeRoot, updateSessionKnowledgeRoot } from './api'
import { knowledgePositionForBinding, useSessionKnowledgeRoot } from './use-session-knowledge-root'

vi.mock('./api', async (importOriginal) => ({
  ...await importOriginal<typeof import('./api')>(),
  getSessionKnowledgeRoot: vi.fn(),
  updateSessionKnowledgeRoot: vi.fn(),
}))

const first = { computerId: 'studio', id: 'one' }
const second = { computerId: 'build', id: 'two' }
const root: KnowledgeRoot = {
  id: 'atlas', name: 'Atlas handbook', computerId: 'studio', computerName: 'Studio',
  path: '/home/demo/atlas/docs', createdAt: '2026-09-01T00:00:00Z',
}
function binding(
  owner = first,
  overrides: Partial<SessionKnowledgeBinding> = {},
): SessionKnowledgeBinding {
  return {
    computerId: owner.computerId, sessionId: owner.id,
    rootId: root.id, root, revision: 1, available: true, ...overrides,
  }
}
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: Error) => void
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail })
  return { promise, resolve, reject }
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getSessionKnowledgeRoot).mockImplementation(async (computerId, id) =>
    binding({ computerId, id }))
  vi.mocked(updateSessionKnowledgeRoot).mockResolvedValue(binding())
})
afterEach(cleanup)

describe('session Knowledge root controller', () => {
  it('supports a sessionless library before any session has loaded', () => {
    const { result } = renderHook(() => useSessionKnowledgeRoot(undefined, true))
    expect(result.current.binding).toBeUndefined()
    expect(result.current.error).toBeUndefined()
    expect(result.current.loading).toBe(false)
    expect(getSessionKnowledgeRoot).not.toHaveBeenCalled()
  })

  it('loads only for an enabled session, not for every transcript or render', async () => {
    const rendered = renderHook(({ enabled }) => useSessionKnowledgeRoot(first, enabled), {
      initialProps: { enabled: false },
    })
    expect(getSessionKnowledgeRoot).not.toHaveBeenCalled()
    rendered.rerender({ enabled: true })
    await waitFor(() => expect(rendered.result.current.binding?.rootId).toBe('atlas'))
    rendered.rerender({ enabled: true })
    expect(getSessionKnowledgeRoot).toHaveBeenCalledTimes(1)
  })

  it('does not let a late lookup for another session replace the visible root', async () => {
    const old = deferred<SessionKnowledgeBinding>()
    vi.mocked(getSessionKnowledgeRoot).mockReturnValueOnce(old.promise)
    const rendered = renderHook(({ owner }) => useSessionKnowledgeRoot(owner, true), {
      initialProps: { owner: first },
    })
    rendered.rerender({ owner: second })
    await waitFor(() => expect(rendered.result.current.binding?.sessionId).toBe(second.id))
    await act(async () => old.resolve(binding(first, { rootId: 'other', revision: 7 })))
    expect(rendered.result.current.binding?.sessionId).toBe(second.id)
    expect(rendered.result.current.binding?.rootId).toBe('atlas')
  })

  it('keeps a newer event when an older response arrives, including availability-only changes', async () => {
    const pending = deferred<SessionKnowledgeBinding>()
    const accepted = vi.fn()
    vi.mocked(getSessionKnowledgeRoot).mockReturnValueOnce(pending.promise)
    const rendered = renderHook(() => useSessionKnowledgeRoot(first, true, accepted))
    act(() => rendered.result.current.applyUpdate(binding(first, { available: false })))
    await act(async () => pending.resolve(binding()))
    expect(rendered.result.current.binding?.available).toBe(false)
    expect(accepted).toHaveBeenCalledExactlyOnceWith(binding(first, { available: false }))
    act(() => rendered.result.current.applyUpdate(binding(first, { rootId: 'platform', revision: 3 })))
    act(() => rendered.result.current.applyUpdate(binding(first, { rootId: 'atlas', revision: 2 })))
    expect(rendered.result.current.binding?.rootId).toBe('platform')
    expect(accepted).toHaveBeenCalledTimes(2)
    expect(accepted).toHaveBeenLastCalledWith(binding(first, { rootId: 'platform', revision: 3 }))
  })

  it('does not teach the catalog from a lookup after its view unmounts', async () => {
    const pending = deferred<SessionKnowledgeBinding>()
    const accepted = vi.fn()
    vi.mocked(getSessionKnowledgeRoot).mockReturnValueOnce(pending.promise)
    const rendered = renderHook(() => useSessionKnowledgeRoot(first, true, accepted))
    rendered.unmount()
    await act(async () => pending.resolve(binding()))
    expect(accepted).not.toHaveBeenCalled()
  })

  it('waits for persistence and uses the current revision without changing another session', async () => {
    const write = deferred<SessionKnowledgeBinding>()
    vi.mocked(updateSessionKnowledgeRoot).mockReturnValueOnce(write.promise)
    const rendered = renderHook(({ owner }) => useSessionKnowledgeRoot(owner, true), {
      initialProps: { owner: first },
    })
    await waitFor(() => expect(rendered.result.current.binding?.rootId).toBe('atlas'))
    let saved!: Promise<SessionKnowledgeBinding>
    act(() => { saved = rendered.result.current.saveRoot('platform') })
    expect(rendered.result.current.binding?.rootId).toBe('atlas')
    expect(rendered.result.current.saving).toBe(true)
    expect(updateSessionKnowledgeRoot).toHaveBeenCalledWith('studio', 'one', {
      rootId: 'platform', expectedRevision: 1,
    })
    rendered.rerender({ owner: second })
    await waitFor(() => expect(rendered.result.current.binding?.sessionId).toBe(second.id))
    await act(async () => { write.resolve(binding(first, { rootId: 'platform', revision: 2 })); await saved })
    expect(rendered.result.current.binding?.sessionId).toBe(second.id)
    expect(rendered.result.current.binding?.rootId).toBe('atlas')
  })

  it('surfaces a failed save, retains the last confirmed root, and refreshes before a retry', async () => {
    vi.mocked(updateSessionKnowledgeRoot).mockRejectedValueOnce(new Error('Root changed in another client'))
    const rendered = renderHook(() => useSessionKnowledgeRoot(first, true))
    await waitFor(() => expect(rendered.result.current.binding?.rootId).toBe('atlas'))
    await act(async () => {
      await expect(rendered.result.current.saveRoot('platform')).rejects.toThrow('another client')
    })
    expect(rendered.result.current.binding?.rootId).toBe('atlas')
    await waitFor(() => expect(getSessionKnowledgeRoot).toHaveBeenCalledTimes(2))
    vi.mocked(updateSessionKnowledgeRoot).mockResolvedValueOnce(binding(first, { rootId: 'platform', revision: 2 }))
    await act(async () => { await rendered.result.current.saveRoot('platform') })
    expect(rendered.result.current.binding?.rootId).toBe('platform')
  })

  it('does not accept a response naming a different owner and exposes a retryable error', async () => {
    vi.mocked(getSessionKnowledgeRoot).mockResolvedValueOnce(binding(second))
    const rendered = renderHook(() => useSessionKnowledgeRoot(first, true))
    await waitFor(() => expect(rendered.result.current.error).toContain('different session'))
    expect(rendered.result.current.binding).toBeUndefined()
    act(() => rendered.result.current.refresh())
    await waitFor(() => expect(rendered.result.current.binding?.sessionId).toBe(first.id))
  })

  it('retains a named unavailable reference when its root computer is unpaired', async () => {
    const rendered = renderHook(() => useSessionKnowledgeRoot(second, true))
    await waitFor(() => expect(rendered.result.current.binding?.available).toBe(true))
    vi.mocked(getSessionKnowledgeRoot).mockResolvedValue(binding(second, { available: false }))
    act(() => rendered.result.current.forgetComputer('studio'))
    expect(rendered.result.current.binding?.root?.name).toBe('Atlas handbook')
    expect(rendered.result.current.binding?.available).toBe(false)
  })

  it('uses the revision of a multi-step user decision instead of overwriting a newer event', async () => {
    const rendered = renderHook(() => useSessionKnowledgeRoot(first, true))
    await waitFor(() => expect(rendered.result.current.binding?.revision).toBe(1))
    act(() => rendered.result.current.applyUpdate(binding(first, { revision: 2 })))
    vi.mocked(updateSessionKnowledgeRoot).mockRejectedValueOnce(new Error('Revision conflict'))
    await act(async () => {
      await expect(rendered.result.current.saveRoot('platform', 1)).rejects.toThrow('Revision conflict')
    })
    expect(updateSessionKnowledgeRoot).toHaveBeenCalledWith('studio', 'one', {
      rootId: 'platform', expectedRevision: 1,
    })
  })

  it('does not retain an old revision when a deleted session ID is reopened', async () => {
    const rendered = renderHook(() => useSessionKnowledgeRoot(first, true))
    await waitFor(() => expect(rendered.result.current.binding?.revision).toBe(1))
    vi.mocked(getSessionKnowledgeRoot).mockResolvedValue(binding(first, {
      rootId: null, root: undefined, revision: 0, available: false,
    }))
    act(() => rendered.result.current.forgetSession(first.computerId, first.id))
    await waitFor(() => expect(rendered.result.current.binding?.revision).toBe(0))
    expect(rendered.result.current.binding?.rootId).toBeNull()
  })
})

describe('reading position and root binding ownership', () => {
  const remembered = { rootId: 'atlas', path: 'handbook', file: 'handbook/recovery.md' }

  it('uses legacy per-session reading position only before an explicit root decision', () => {
    expect(knowledgePositionForBinding(binding(first, {
      rootId: null, root: undefined, revision: 0, available: false,
    }), remembered)).toEqual(remembered)
    expect(knowledgePositionForBinding(binding(first, {
      rootId: null, root: undefined, revision: 2, available: false,
    }), remembered)).toBeUndefined()
  })

  it('never reuses a document from another root', () => {
    expect(knowledgePositionForBinding(binding(), remembered)).toEqual(remembered)
    expect(knowledgePositionForBinding(binding(first, { rootId: 'platform' }), remembered))
      .toEqual({ rootId: 'platform', path: '.' })
  })
})
