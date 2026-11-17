// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ManagedSession } from '../../shared/contracts'
import { foregroundHandoffTimeoutMs, useForegroundHandoff } from './use-foreground-handoff'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const session = (overrides: Partial<ManagedSession> = {}): ManagedSession => ({
  id: 'one', computerId: 'node', computerName: 'Node', cwd: '/project', title: 'Session',
  updatedAt: '2026-11-16T00:00:00Z', status: 'running', revision: 10,
  foregroundTurnActive: false, messages: [], ...overrides,
})

describe('foreground handoff', () => {
  it('covers an accepted write and ignores duplicate revisions until newer server evidence', () => {
    const initial = session()
    const accepted = session({ revision: 11 })
    const { result, rerender } = renderHook(({ current, sequence }) => useForegroundHandoff(current, sequence), {
      initialProps: { current: initial, sequence: 0 },
    })
    act(() => result.current.accepted(accepted, 0))
    expect(result.current.active).toBe(true)
    rerender({ current: accepted, sequence: 1 })
    expect(result.current.active).toBe(true)
    rerender({ current: session({ revision: 12 }), sequence: 2 })
    expect(result.current.active).toBe(false)
    rerender({ current: accepted, sequence: 3 })
    expect(result.current.active).toBe(false)
  })

  it.each(['idle', 'error', 'waiting'] as const)('clears when the session becomes %s', (status) => {
    const { result, rerender } = renderHook((current) => useForegroundHandoff(current, 0), { initialProps: session() })
    act(() => result.current.accepted(session({ revision: 11 }), 0))
    rerender(session({ revision: 11, status }))
    expect(result.current.active).toBe(false)
  })

  it('clears on a failed send or a newly reported failure', () => {
    const { result, rerender } = renderHook((current) => useForegroundHandoff(current, 0), { initialProps: session() })
    act(() => result.current.accepted(session({ revision: 11 }), 0))
    act(() => result.current.clear())
    expect(result.current.active).toBe(false)
    act(() => result.current.accepted(session({ revision: 11 }), 0))
    rerender(session({ failedPrompt: { content: 'Failed prompt', failedAt: 'failure-1' } }))
    expect(result.current.active).toBe(false)
  })

  it('does not resurrect a handoff after switching away and back, even for a late acceptance', () => {
    const { result, rerender } = renderHook((current) => useForegroundHandoff(current, 0), { initialProps: session() })
    const lateAcceptance = result.current.accepted
    act(() => result.current.accepted(session({ revision: 11 }), 0))
    rerender(session({ id: 'two' }))
    expect(result.current.active).toBe(false)
    rerender(session())
    act(() => lateAcceptance(session({ revision: 11 }), 0))
    expect(result.current.active).toBe(false)
  })

  it('does not let stale acceptance or failure callbacks replace the new selection handoff', () => {
    const { result, rerender } = renderHook((current) => useForegroundHandoff(current, 0), { initialProps: session() })
    const oldFailure = result.current.clear
    const oldAcceptance = result.current.accepted
    rerender(session({ id: 'two' }))
    act(() => result.current.accepted(session({ id: 'two', revision: 11 }), 0))
    act(() => oldFailure())
    act(() => oldAcceptance(session({ revision: 12 }), 0))
    expect(result.current.active).toBe(true)
  })

  it('uses the next authoritative session event when a legacy node has no revision', () => {
    const legacy = session({ revision: undefined })
    const { result, rerender } = renderHook((sequence) => useForegroundHandoff(legacy, sequence), { initialProps: 1 })
    act(() => result.current.accepted(legacy, 1))
    expect(result.current.active).toBe(true)
    rerender(2)
    expect(result.current.active).toBe(false)
  })

  it('expires instead of remaining stuck if no authoritative update arrives', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useForegroundHandoff(session(), 0))
    act(() => result.current.accepted(session({ revision: 11 }), 0))
    act(() => vi.advanceTimersByTime(foregroundHandoffTimeoutMs - 1))
    expect(result.current.active).toBe(true)
    act(() => vi.advanceTimersByTime(1))
    expect(result.current.active).toBe(false)
  })
})
