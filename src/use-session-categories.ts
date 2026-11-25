import { useCallback, useEffect, useRef, useState } from 'react'
import {
  applySessionCategoryChange,
  type SessionCategoriesSnapshot,
  type SessionCategory,
  type SessionCategoryChange,
} from '../shared/session-categories'
import { fetchSessionCategories, saveSessionCategoryChange } from './api'

export interface SessionCategoriesState {
  /** What the hub committed, with this browser's changes still on their way applied on top. */
  categories: readonly SessionCategory[]
  /** Whether the hub keeps categories; an older or unusable one does not. */
  available: boolean
  /** Takes a snapshot from the hub; an older revision is a late delivery and is ignored. */
  apply: (snapshot: SessionCategoriesSnapshot) => void
  /** Reads the hub's categories again, as after a reconnect. */
  sync: () => Promise<void>
  /**
   * Shows a change at once and sends it. A refused change puts back what the
   * hub committed and reports `failure` with the reason; it resolves whether
   * the hub committed it.
   */
  change: (change: SessionCategoryChange, failure: string) => Promise<boolean>
}

const nothing: SessionCategoriesSnapshot = { revision: -1, categories: [] }

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * The hub-owned session categories, as custom order is: changes show
 * optimistically and are sent one at a time, each against the revision the
 * one before produced, and the hub refuses one made against a revision it
 * has moved past. Changes are re-applied over every newer snapshot until the
 * hub answers for them, which is safe because each one sets a value rather
 * than toggling it.
 */
export function useSessionCategories({ onError }: {
  onError: (message: string) => void
}): SessionCategoriesState {
  const [categories, setCategories] = useState<readonly SessionCategory[]>([])
  const [available, setAvailable] = useState(false)
  const acknowledged = useRef(nothing)
  const pending = useRef<{ change: SessionCategoryChange }[]>([])
  const shown = useRef<readonly SessionCategory[]>([])
  const writes = useRef<Promise<unknown>>(Promise.resolve())
  // Moves on with every refusal, which drops the changes queued behind it:
  // each was made on top of the one the hub refused.
  const generation = useRef(0)
  const onErrorRef = useRef(onError)
  useEffect(() => { onErrorRef.current = onError }, [onError])

  const render = useCallback(() => {
    let next = acknowledged.current.categories
    for (const { change } of pending.current) {
      try {
        next = applySessionCategoryChange(next, change)
      } catch {
        // Overtaken by a change from elsewhere; the hub's answer will say so.
      }
    }
    shown.current = next
    setCategories(next)
  }, [])

  const apply = useCallback((snapshot: SessionCategoriesSnapshot) => {
    if (snapshot.revision < acknowledged.current.revision) return
    acknowledged.current = snapshot
    setAvailable(true)
    render()
  }, [render])

  const sync = useCallback(async () => {
    try {
      apply(await fetchSessionCategories())
    } catch (error) {
      const status = (error as { statusCode?: unknown }).statusCode
      // A hub from before categories, or one that cannot use its file.
      if (status === 404 || status === 503) setAvailable(false)
    }
  }, [apply])

  const change = useCallback((update: SessionCategoryChange, failure: string): Promise<boolean> => {
    if (acknowledged.current.revision < 0) return Promise.resolve(false)
    try {
      applySessionCategoryChange(shown.current, update)
    } catch (error) {
      onErrorRef.current(`${failure}: ${message(error)}`)
      return Promise.resolve(false)
    }
    const entry = { change: update }
    pending.current = [...pending.current, entry]
    render()
    const queuedIn = generation.current
    const settled = writes.current.then(async () => {
      if (generation.current !== queuedIn) return false
      try {
        const snapshot = await saveSessionCategoryChange(acknowledged.current.revision, update)
        pending.current = pending.current.filter((candidate) => candidate !== entry)
        apply(snapshot)
        render()
        return true
      } catch (error) {
        generation.current += 1
        pending.current = []
        render()
        void sync()
        onErrorRef.current(`${failure}: ${message(error)}`)
        return false
      }
    })
    writes.current = settled
    return settled
  }, [apply, render, sync])

  return { categories, available, apply, sync, change }
}
