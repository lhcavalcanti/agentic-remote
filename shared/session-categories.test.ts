import { describe, expect, it, vi } from 'vitest'
import {
  SESSION_CATEGORY_LIMIT,
  SESSION_CATEGORY_NAME_MAX_LENGTH,
  SessionCategoryRefusal,
  applySessionCategoryChange,
  sessionCategoryOf,
  type SessionCategory,
  type SessionCategoryChange,
} from './session-categories.js'

const homelab: SessionCategory = { id: 'homelab', name: 'Homelab', collapsed: false, sessions: ['hub:a', 'node:b'] }
const reviews: SessionCategory = { id: 'reviews', name: 'Reviews', collapsed: true, sessions: ['hub:c'] }

function refusal(categories: readonly SessionCategory[], change: SessionCategoryChange) {
  try {
    applySessionCategoryChange(categories, change)
  } catch (error) {
    if (error instanceof SessionCategoryRefusal) return { status: error.statusCode, message: error.message }
    throw error
  }
  throw new Error('Expected the change to be refused')
}

describe('session category changes', () => {
  it('creates an expanded category last, taking its sessions out of any other category', () => {
    const next = applySessionCategoryChange([homelab, reviews], {
      type: 'create', id: 'urgent', name: '  Urgent   work ', sessions: ['node:b', 'hub:z', 'node:b'],
    })
    expect(next).toEqual([
      { ...homelab, sessions: ['hub:a'] },
      reviews,
      { id: 'urgent', name: 'Urgent work', collapsed: false, sessions: ['node:b', 'hub:z'] },
    ])
  })

  it('creates a category at a place among the others, an index past either end being that end', () => {
    const urgent = { id: 'urgent', name: 'Urgent', collapsed: false, sessions: [] }
    expect(applySessionCategoryChange([homelab, reviews], { type: 'create', id: 'urgent', name: 'Urgent', index: 0 }))
      .toEqual([urgent, homelab, reviews])
    expect(applySessionCategoryChange([homelab, reviews], { type: 'create', id: 'urgent', name: 'Urgent', index: 1 }))
      .toEqual([homelab, urgent, reviews])
    expect(applySessionCategoryChange([homelab, reviews], { type: 'create', id: 'urgent', name: 'Urgent', index: 9 }))
      .toEqual([homelab, reviews, urgent])
    expect(applySessionCategoryChange([homelab, reviews], { type: 'create', id: 'urgent', name: 'Urgent', index: -2 }))
      .toEqual([urgent, homelab, reviews])
  })

  it('refuses a category that is malformed, already exists, or one too many', () => {
    expect(refusal([homelab], { type: 'create', id: 'other', name: '   ' }).status).toBe(400)
    expect(refusal([homelab], {
      type: 'create', id: 'other', name: 'x'.repeat(SESSION_CATEGORY_NAME_MAX_LENGTH + 1),
    }).status).toBe(400)
    expect(refusal([homelab], { type: 'create', id: 'has space', name: 'Other' }).status).toBe(400)
    expect(refusal([homelab], { type: 'create', id: 'homelab', name: 'Other' }).status).toBe(409)
    expect(refusal([homelab], { type: 'create', id: 'other', name: 'HOMELAB' })).toEqual({
      status: 409, message: 'A category named HOMELAB already exists',
    })
    expect(refusal([homelab], { type: 'create', id: 'other', name: 'Other', sessions: ['no-colon'] }).status)
      .toBe(400)
    const full = Array.from({ length: SESSION_CATEGORY_LIMIT }, (_, index) => ({
      id: `c${index}`, name: `Category ${index}`, collapsed: false, sessions: [],
    }))
    expect(refusal(full, { type: 'create', id: 'other', name: 'Other' }).status).toBe(409)
  })

  it('tells names apart in the same way whatever the locale, as the hub and a browser may differ', () => {
    // A Turkish locale lowers I to a dotless ı, so locale folding would let
    // a browser and the hub disagree about whether two names clash.
    const locale = vi.spyOn(String.prototype, 'toLocaleLowerCase').mockImplementation(function (this: string) {
      return this.replace(/I/g, 'ı').toLowerCase()
    })
    try {
      const iris = [{ id: 'iris', name: 'iris', collapsed: false, sessions: [] }]
      expect(refusal(iris, { type: 'create', id: 'other', name: 'IRIS' }).status).toBe(409)
    } finally {
      locale.mockRestore()
    }
  })

  it('renames, collapses and moves a category, leaving its sessions where they are', () => {
    const renamed = applySessionCategoryChange([homelab, reviews], {
      type: 'update', categoryId: 'homelab', name: 'Home lab', collapsed: true,
    })
    expect(renamed).toEqual([{ ...homelab, name: 'Home lab', collapsed: true }, reviews])
    expect(applySessionCategoryChange([homelab, reviews], { type: 'update', categoryId: 'homelab', index: 1 }))
      .toEqual([reviews, homelab])
    // An index past either end is the end it was meant for.
    expect(applySessionCategoryChange([homelab, reviews], { type: 'update', categoryId: 'reviews', index: -4 }))
      .toEqual([reviews, homelab])
    // Its own name in another case is a rename, not a clash.
    expect(applySessionCategoryChange([homelab], { type: 'update', categoryId: 'homelab', name: 'HOMELAB' }))
      .toEqual([{ ...homelab, name: 'HOMELAB' }])
  })

  it('answers a change that changes nothing with the same categories', () => {
    const categories = [homelab, reviews]
    expect(applySessionCategoryChange(categories, {
      type: 'update', categoryId: 'reviews', name: 'Reviews', collapsed: true, index: 1,
    })).toBe(categories)
    expect(applySessionCategoryChange(categories, { type: 'move', sessions: ['hub:a'], categoryId: 'homelab', index: 0 }))
      .toBe(categories)
    expect(applySessionCategoryChange(categories, { type: 'move', sessions: ['hub:unlisted'], categoryId: null }))
      .toBe(categories)
  })

  it('refuses to change a category that does not exist or take another one\'s name', () => {
    expect(refusal([homelab], { type: 'update', categoryId: 'gone', collapsed: true }).status).toBe(404)
    expect(refusal([homelab], { type: 'delete', categoryId: 'gone' }).status).toBe(404)
    expect(refusal([homelab, reviews], { type: 'update', categoryId: 'reviews', name: 'homelab' }).status).toBe(409)
    expect(refusal([homelab], { type: 'move', sessions: ['hub:a'], categoryId: 'gone' }).status).toBe(404)
  })

  it('deletes a category, and its sessions are in no category', () => {
    const next = applySessionCategoryChange([homelab, reviews], { type: 'delete', categoryId: 'homelab' })
    expect(next).toEqual([reviews])
    expect(sessionCategoryOf(next, 'hub:a')).toBeUndefined()
  })

  it('moves sessions into a category at a position counted without them', () => {
    expect(applySessionCategoryChange([homelab, reviews], {
      type: 'move', sessions: ['hub:c', 'hub:new'], categoryId: 'homelab', index: 1,
    })).toEqual([
      { ...homelab, sessions: ['hub:a', 'hub:c', 'hub:new', 'node:b'] },
      { ...reviews, sessions: [] },
    ])
    // Within its own category the same rule reorders it.
    expect(applySessionCategoryChange([homelab], { type: 'move', sessions: ['hub:a'], categoryId: 'homelab', index: 1 }))
      .toEqual([{ ...homelab, sessions: ['node:b', 'hub:a'] }])
    // Without a position it goes last.
    expect(applySessionCategoryChange([homelab, reviews], { type: 'move', sessions: ['hub:a'], categoryId: 'reviews' }))
      .toEqual([{ ...homelab, sessions: ['node:b'] }, { ...reviews, sessions: ['hub:c', 'hub:a'] }])
  })

  it('takes sessions out of their category', () => {
    const next = applySessionCategoryChange([homelab, reviews], {
      type: 'move', sessions: ['node:b', 'hub:c'], categoryId: null,
    })
    expect(next).toEqual([{ ...homelab, sessions: ['hub:a'] }, { ...reviews, sessions: [] }])
    expect(sessionCategoryOf(next, 'node:b')).toBeUndefined()
    expect(sessionCategoryOf(next, 'hub:a')?.id).toBe('homelab')
  })

  it('refuses a session that is not named as computer and session', () => {
    expect(refusal([homelab], { type: 'move', sessions: [':a'], categoryId: 'homelab' }).status).toBe(400)
    expect(refusal([homelab], { type: 'move', sessions: ['hub:'], categoryId: null }).status).toBe(400)
  })

  it('never changes the categories it was given', () => {
    const categories = [structuredClone(homelab), structuredClone(reviews)]
    const before = structuredClone(categories)
    applySessionCategoryChange(categories, { type: 'move', sessions: ['hub:a'], categoryId: 'reviews', index: 0 })
    applySessionCategoryChange(categories, { type: 'update', categoryId: 'homelab', name: 'Lab', index: 1 })
    applySessionCategoryChange(categories, { type: 'delete', categoryId: 'reviews' })
    expect(categories).toEqual(before)
  })
})
