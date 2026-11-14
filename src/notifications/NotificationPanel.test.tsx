// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { NotificationRecord } from '../../shared/notification-center'
import { request } from '../api'
import { publishFeatureEvent } from '../features/events'
import { notificationGroups } from './grouping'
import { NotificationPanel } from './NotificationPanel'
import { useNotifications } from './use-notifications'

vi.mock('../api', () => ({ request: vi.fn() }))
afterEach(cleanup)
const record = (id: string, extra: Partial<NotificationRecord> = {}): NotificationRecord => ({
  id, kind: 'session.completed', severity: 'info', title: `Record ${id}`, body: 'Fictional details', createdAt: '2026-11-14T18:00:00Z',
  url: '/', coalesceKey: id, computerId: 'studio', sessionId: 'one', muted: false, ...extra,
})
beforeEach(() => vi.mocked(request).mockReset())

it('groups by computer and session, excludes dismissed records and applies filters', () => {
  const records = [record('old'), record('new', { createdAt: '2026-11-14T18:01:00Z' }),
    record('other', { computerId: 'node' }), record('dismissed', { dismissedAt: 'now' }),
    record('oracle', { kind: 'oracle.message', sessionId: undefined, severity: 'error' })]
  expect(notificationGroups(records, 'All', '')[0].records).toHaveLength(2)
  expect(notificationGroups(records, 'All', '')[0].latest.id).toBe('new')
  expect(notificationGroups(records, 'Failed', '').map((group) => group.latest.id)).toEqual(['oracle'])
  expect(notificationGroups(records, 'Oracle', 'FICTIONAL')).toHaveLength(1)
  expect(notificationGroups([record('read', { readAt: 'now' })], 'Unread', '')).toEqual([])
})

it('does no work while disabled and refreshes on live invalidation and reconnect', async () => {
  vi.mocked(request).mockResolvedValue({ notifications: [record('first')] })
  const { result, rerender, unmount } = renderHook(({ enabled }) => useNotifications(enabled), { initialProps: { enabled: false } })
  expect(request).not.toHaveBeenCalled()
  rerender({ enabled: true })
  await waitFor(() => expect(result.current.unreadCount).toBe(1))
  vi.mocked(request).mockResolvedValue({ notifications: [record('second'), record('third')] })
  act(() => publishFeatureEvent({ type: 'notifications.changed', revision: 1, unreadCount: 2 }))
  await waitFor(() => expect(result.current.unreadCount).toBe(2))
  act(() => publishFeatureEvent({ type: 'hub.connected' }))
  await waitFor(() => expect(request).toHaveBeenCalledTimes(3))
  unmount()
  act(() => publishFeatureEvent({ type: 'notifications.changed', revision: 2, unreadCount: 0 }))
  expect(request).toHaveBeenCalledTimes(3)
})

it('marks only records in a search read and uses server filters for a scoped tab', () => {
  const mutate = vi.fn()
  const onOpen = vi.fn()
  render(<NotificationPanel enabled onClose={vi.fn()} onOpen={onOpen} notifications={{
    records: [record('a'), record('b', { kind: 'oracle.message', sessionId: undefined })],
    mutate, mutating: false, loading: false, error: undefined, unreadCount: 2,
  }} />)
  fireEvent.click(screen.getByRole('tab', { name: 'Oracle' }))
  fireEvent.click(screen.getByRole('button', { name: /Mark all read in Oracle/ }))
  expect(mutate).toHaveBeenLastCalledWith(['b'], 'read', '?kind=oracle.message')
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Record b' } })
  fireEvent.click(screen.getByRole('button', { name: /Mark all read in search/ }))
  expect(mutate).toHaveBeenLastCalledWith(['b'], 'read', undefined)
  fireEvent.click(screen.getByRole('button', { name: 'Record b' }))
  expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'b' }))
  fireEvent.click(screen.getByRole('button', { name: 'Dismiss Record b' }))
  expect(mutate).toHaveBeenLastCalledWith(['b'], 'dismiss')
})

it('presents disabled and empty states without inventing records', () => {
  const props = { onClose: vi.fn(), onOpen: vi.fn(), notifications: {
    records: [], mutate: vi.fn(), mutating: false, loading: false, error: undefined, unreadCount: 0,
  } }
  const { rerender } = render(<NotificationPanel {...props} enabled={false} />)
  expect(screen.getByText('Notification center is turned off on this hub.')).toBeTruthy()
  rerender(<NotificationPanel {...props} enabled />)
  expect(screen.getByText(/You’re all caught up/)).toBeTruthy()
})
