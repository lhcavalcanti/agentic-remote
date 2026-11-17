// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { NotificationRecord } from '../../shared/notification-center'
import { request } from '../api'
import { useNotifications } from './use-notifications'

vi.mock('../api', () => ({ request: vi.fn() }))
afterEach(cleanup)
beforeEach(() => { vi.mocked(request).mockReset() })
const notification: NotificationRecord = { id: 'a'.repeat(64), kind: 'session.completed', severity: 'info',
  title: 'Fictional result', body: 'Ready to review.', createdAt: '2026-11-16T18:00:00Z', url: '/',
  computerId: 'studio', sessionId: 'review', coalesceKey: 'review', muted: false }

function deferredMutations() {
  const pending: { resolve(): void; reject(error: Error): void }[] = []
  vi.mocked(request).mockImplementation(async (_path, init) => {
    if (init?.method === 'POST') return new Promise((resolve, reject) => {
      pending.push({ resolve: () => resolve({ ok: true }), reject })
    })
    return { notifications: [notification] }
  })
  return pending
}

it('resets mutation controls on re-enable after an old mutation settles while disabled', async () => {
  const pending = deferredMutations()
  const { result, rerender } = renderHook(({ enabled }) => useNotifications(enabled), { initialProps: { enabled: true } })
  await waitFor(() => expect(result.current.unreadCount).toBe(1))
  let mutation!: Promise<void>
  act(() => { mutation = result.current.mutate([notification.id], 'read') })
  expect(result.current.mutating).toBe(true)
  rerender({ enabled: false })
  await act(async () => { pending[0].resolve(); await mutation })
  rerender({ enabled: true })
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.mutating).toBe(false)
})

it.each(['success', 'failure'] as const)('does not let an old enable generation %s settle the current mutation', async (outcome) => {
  const pending = deferredMutations()
  const { result, rerender } = renderHook(({ enabled }) => useNotifications(enabled), { initialProps: { enabled: true } })
  await waitFor(() => expect(result.current.unreadCount).toBe(1))
  let oldMutation!: Promise<void>
  act(() => { oldMutation = result.current.mutate([notification.id], 'read') })
  rerender({ enabled: false })
  rerender({ enabled: true })
  await waitFor(() => expect(result.current.loading).toBe(false))
  let currentMutation!: Promise<void>
  act(() => { currentMutation = result.current.mutate([notification.id], 'dismiss') })
  expect(result.current.mutating).toBe(true)
  const readsBefore = vi.mocked(request).mock.calls.filter(([, init]) => init?.method !== 'POST').length
  await act(async () => {
    if (outcome === 'success') pending[0].resolve()
    else pending[0].reject(new Error('Old disabled generation failed'))
    await oldMutation
  })
  expect(result.current.mutating).toBe(true)
  expect(result.current.error).toBeUndefined()
  expect(vi.mocked(request).mock.calls.filter(([, init]) => init?.method !== 'POST')).toHaveLength(readsBefore)
  await act(async () => { pending[1].resolve(); await currentMutation })
  expect(result.current.mutating).toBe(false)
  expect(result.current.error).toBeUndefined()
})
