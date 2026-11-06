import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  dispatchDreamerTask,
  getDreamer,
  saveDreamerSettings,
  updateDreamerPlan,
} from './dreamer-api'

afterEach(() => vi.unstubAllGlobals())

const snapshot = { available: true, revision: 1, settings: { enabled: false, timeZone: 'UTC' } }

describe('Dreamer API', () => {
  it('reads with no-store and submits versioned review edits to the hub', async () => {
    const fetch = vi.fn().mockImplementation(async () => new Response(JSON.stringify(snapshot)))
    vi.stubGlobal('fetch', fetch)
    expect(await getDreamer()).toEqual(snapshot)
    expect(fetch).toHaveBeenLastCalledWith('/api/manager/dreamer', expect.objectContaining({ cache: 'no-store' }))
    await saveDreamerSettings({ revision: 1, enabled: true, timeZone: 'UTC' })
    expect(fetch).toHaveBeenLastCalledWith('/api/manager/dreamer/settings', expect.objectContaining({
      method: 'PUT', body: JSON.stringify({ revision: 1, enabled: true, timeZone: 'UTC' }),
    }))
    await updateDreamerPlan({ revision: 1, planId: 'plan', item: { id: 'item', status: 'done' } })
    expect(fetch).toHaveBeenLastCalledWith('/api/manager/dreamer/plan', expect.objectContaining({
      method: 'PUT', body: JSON.stringify({ revision: 1, planId: 'plan', item: { id: 'item', status: 'done' } }),
    }))
    await dispatchDreamerTask('task/a', { revision: 2, requestId: 'request-a' })
    expect(fetch).toHaveBeenLastCalledWith(
      '/api/manager/dreamer/tasks/task%2Fa/dispatch',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ revision: 2, requestId: 'request-a' }),
      }),
    )
  })

  it('preserves conflict status without leaking raw server exception text', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('private failure text', { status: 409 })))
    await expect(getDreamer()).rejects.toMatchObject({ status: 409 })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('private failure text', { status: 500 })))
    await expect(getDreamer()).rejects.toThrow('Dreamer is unavailable. Try refreshing later.')
  })

  it('rejects unsupported hub responses rather than displaying a fake empty plan', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}')))
    await expect(getDreamer()).rejects.toThrow('This hub returned an unreadable Dreamer response.')
  })
})
