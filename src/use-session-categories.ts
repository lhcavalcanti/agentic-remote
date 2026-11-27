import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_COLLAPSED_CATEGORY_SHOWS,
  applySessionCategoryChange,
  type CollapsedCategoryShows,
  type SessionCategoriesSnapshot,
  type SessionCategory,
  type SessionCategoryChange,
} from '../shared/session-categories'
import { fetchSessionCategories, saveCollapsedCategoryShows, saveSessionCategoryChange } from './api'

export interface SessionCategoriesState {
  /** What the hub committed, with this browser's changes still on their way applied on top. */
  categories: readonly SessionCategory[]
  /** What a collapsed category keeps in sight, the hub's choice with this browser's on its way. */
  collapsedShows: CollapsedCategoryShows
  /** Whether the hub keeps categories; an older or unusable one does not. */
  available: boolean
  /** Why the hub keeps no categories, once it has said so. */
  unavailable?: string
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
  /** Chooses what a collapsed category keeps in sight, shown and sent as `change` is. */
  changeCollapsedShows: (collapsedShows: CollapsedCategoryShows, failure: string) => Promise<boolean>
}

const nothing: SessionCategoriesSnapshot = { revision: -1, categories: [] }

type PendingChange = { change: SessionCategoryChange } | { collapsedShows: CollapsedCategoryShows }

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * The hub-owned session categories, and what a collapsed one keeps in sight,
 * as custom order is: changes show optimistically and are sent one at a time,
 * each against the revision the one before produced, and the hub refuses one
 * made against a revision it has moved past. Changes are re-applied over
 * every newer snapshot until the hub answers for them, which is safe because
 * each one sets a value rather than toggling it.
 */
export function useSessionCategories({ onError }: {
  onError: (message: string) => void
}): SessionCategoriesState {
  const [categories, setCategories] = useState<readonly SessionCategory[]>([])
  const [collapsedShows, setCollapsedShows] = useState(DEFAULT_COLLAPSED_CATEGORY_SHOWS)
  const [available, setAvailable] = useState(false)
  const [unavailable, setUnavailable] = useState<string>()
  const acknowledged = useRef(nothing)
  const pending = useRef<PendingChange[]>([])
  const shown = useRef<readonly SessionCategory[]>([])
  const writes = useRef<Promise<unknown>>(Promise.resolve())
  // Moves on with every refusal, which drops the changes queued behind it:
  // each was made on top of the one the hub refused.
  const generation = useRef(0)
  const onErrorRef = useRef(onError)
  useEffect(() => { onErrorRef.current = onError }, [onError])

  const render = useCallback(() => {
    let next = acknowledged.current.categories
    let shows = acknowledged.current.collapsedShows ?? DEFAULT_COLLAPSED_CATEGORY_SHOWS
    for (const entry of pending.current) {
      if ('collapsedShows' in entry) {
        shows = entry.collapsedShows
        continue
      }
      try {
        next = applySessionCategoryChange(next, entry.change)
      } catch {
        // Overtaken by a change from elsewhere; the hub's answer will say so.
      }
    }
    shown.current = next
    setCategories(next)
    setCollapsedShows(shows)
  }, [])

  const apply = useCallback((snapshot: SessionCategoriesSnapshot) => {
    if (snapshot.revision < acknowledged.current.revision) return
    acknowledged.current = snapshot
    setAvailable(true)
    setUnavailable(undefined)
    render()
  }, [render])

  const sync = useCallback(async () => {
    try {
      apply(await fetchSessionCategories())
    } catch (error) {
      const status = (error as { statusCode?: unknown }).statusCode
      // A hub from before categories, or one that cannot use its file: no
      // session is in a category there, and nothing queued can be sent.
      if (status === 404 || status === 503) {
        generation.current += 1
        pending.current = []
        acknowledged.current = nothing
        setAvailable(false)
        setUnavailable(status === 404 ? 'This hub does not keep categories' : message(error))
        render()
      }
    }
  }, [apply, render])

  /** Shows `entry` at once and sends it with `save`, after every change queued before it. */
  const send = useCallback((
    entry: PendingChange,
    save: (revision: number) => Promise<SessionCategoriesSnapshot>,
    failure: string,
  ): Promise<boolean> => {
    pending.current = [...pending.current, entry]
    render()
    const queuedIn = generation.current
    const settled = writes.current.then(async () => {
      if (generation.current !== queuedIn) return false
      try {
        const snapshot = await save(acknowledged.current.revision)
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

  /** Whether the hub keeps categories to change; says so when it does not. */
  const kept = useCallback((failure: string) => {
    if (acknowledged.current.revision >= 0) return true
    onErrorRef.current(`${failure}: This hub is not keeping categories`)
    return false
  }, [])

  const change = useCallback((update: SessionCategoryChange, failure: string): Promise<boolean> => {
    if (!kept(failure)) return Promise.resolve(false)
    try {
      applySessionCategoryChange(shown.current, update)
    } catch (error) {
      onErrorRef.current(`${failure}: ${message(error)}`)
      return Promise.resolve(false)
    }
    return send({ change: update }, (revision) => saveSessionCategoryChange(revision, update), failure)
  }, [kept, send])

  const changeCollapsedShows = useCallback((shows: CollapsedCategoryShows, failure: string): Promise<boolean> => {
    if (!kept(failure)) return Promise.resolve(false)
    return send({ collapsedShows: shows }, (revision) => saveCollapsedCategoryShows(revision, shows), failure)
  }, [kept, send])

  return { categories, collapsedShows, available, unavailable, apply, sync, change, changeCollapsedShows }
}
