import type { SessionEvent } from '@github/copilot-sdk'
import { expect } from 'vitest'
import type { BackgroundTask } from '../shared/contracts.js'
import {
  backgroundTasksFromEvents,
  createBackgroundTaskProjector,
  type BackgroundTaskEventOptions,
} from './background-task-adapter.js'

/** Deterministic PRNG, so every failure can be replayed from its seed. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

/** A projection that takes in a log's events a few at a time. */
export interface IncrementalProjection<T> {
  apply(events: readonly SessionEvent[]): void
  snapshot(): T
}

/**
 * Ways to feed `length` events: one at a time, all at once, and seeded random
 * splits. Each plan lists its chunk sizes.
 */
export function chunkings(length: number, seeds: readonly number[] = [1, 2, 3]): number[][] {
  const plans = [Array.from({ length }, () => 1), [length]]
  for (const seed of seeds) {
    const next = seededRandom(seed * 7_919 + length)
    const sizes: number[] = []
    for (let left = length; left > 0;) {
      const size = Math.min(left, 1 + Math.floor(next() * Math.max(1, Math.ceil(length / 3))))
      sizes.push(size)
      left -= size
    }
    plans.push(sizes)
  }
  return plans
}

/**
 * Feeds `events` to a fresh projection in every chunking and expects its
 * snapshot after each chunk -- taken twice, so one may come from a cache -- to
 * equal `full` over the same prefix. Each snapshot is then handed to
 * `received`, which may vandalize it: a projection that shares state with what
 * it handed out shows it in a later snapshot.
 */
export function expectIncrementalEquivalence<T>(
  events: readonly SessionEvent[],
  create: () => IncrementalProjection<T>,
  full: (prefix: SessionEvent[]) => T,
  received: (snapshot: T) => void = () => undefined,
  label = '',
): void {
  for (const sizes of chunkings(events.length)) {
    const projection = create()
    let applied = 0
    for (const size of sizes) {
      projection.apply(events.slice(applied, applied + size))
      applied += size
      const expected = full(events.slice(0, applied))
      for (const attempt of ['first', 'repeated']) {
        const snapshot = projection.snapshot()
        expect(snapshot, `${label} ${attempt} snapshot of ${applied} of ${events.length} events in chunks of ${sizes.join(',')}`)
          .toStrictEqual(expected)
        received(snapshot)
      }
    }
  }
}

/**
 * `backgroundTasksFromEvents`, after proving that a projector taking the same
 * events in a few at a time agrees with it at every prefix.
 */
export function checkedBackgroundTasks(
  events: SessionEvent[],
  options: BackgroundTaskEventOptions = {},
  label = '',
): BackgroundTask[] {
  expectIncrementalEquivalence(
    events,
    () => {
      const projector = createBackgroundTaskProjector(options)
      return { apply: (chunk) => projector.apply(chunk), snapshot: () => projector.tasks() }
    },
    (prefix) => backgroundTasksFromEvents(prefix, options),
    vandalize,
    label,
  )
  return backgroundTasksFromEvents(events, options)
}

/**
 * Overwrites every field and grows every array it can reach, so anything a
 * snapshot shares with its projection stops matching a fresh projection.
 */
export function vandalize(value: unknown, seen = new Set<object>()): void {
  if (!value || typeof value !== 'object' || seen.has(value) || Object.isFrozen(value)) return
  seen.add(value)
  if (Array.isArray(value)) {
    for (const entry of value) vandalize(entry, seen)
    value.push('vandalized')
    return
  }
  const record = value as Record<string, unknown>
  for (const key of Object.keys(record)) {
    const entry = record[key]
    if (entry && typeof entry === 'object') vandalize(entry, seen)
    else record[key] = 'vandalized'
  }
  record.vandalized = true
}
