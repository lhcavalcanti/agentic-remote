/**
 * Session categories: named, ordered, collapsible groups of sessions that the
 * hub keeps for every browser connected to it.
 *
 * A category may hold sessions from any computer, and each session still
 * belongs to its own computer. A session is in at most one category. The
 * changes here are pure, so the hub applies exactly what a browser shows
 * optimistically, and either side can apply one again without harm.
 */

export const SESSION_CATEGORY_NAME_MAX_LENGTH = 60
export const SESSION_CATEGORY_LIMIT = 100
const SESSION_CATEGORY_ID = /^[A-Za-z0-9_-]{1,64}$/
const SESSION_KEY_MAX_LENGTH = 400

export interface SessionCategory {
  id: string
  name: string
  collapsed: boolean
  /** Member keys, `computerId:sessionId`, in the category's own order. */
  sessions: string[]
}

/**
 * Every category on the hub, in display order. `revision` is the hub's
 * authority: a browser applies a snapshot only when it is at least as new as
 * the one it holds, and a write names the revision it was made against.
 */
export interface SessionCategoriesSnapshot {
  revision: number
  categories: SessionCategory[]
}

export type SessionCategoryChange =
  /** Appended last and expanded; its sessions leave any other category. */
  | { type: 'create'; id: string; name: string; sessions?: string[] }
  /** Omitted fields keep their value; `index` is the category's new place. */
  | { type: 'update'; categoryId: string; name?: string; collapsed?: boolean; index?: number }
  /** Its sessions stay, in no category. */
  | { type: 'delete'; categoryId: string }
  /**
   * Into a category at `index`, counted in its list without the moved
   * sessions (last when omitted), or out of every category with `null`.
   */
  | { type: 'move'; sessions: string[]; categoryId: string | null; index?: number }

/** A change the categories as they stand cannot take; `statusCode` is the HTTP answer. */
export class SessionCategoryRefusal extends Error {
  readonly statusCode: 400 | 404 | 409

  constructor(message: string, statusCode: 400 | 404 | 409) {
    super(message)
    this.name = 'SessionCategoryRefusal'
    this.statusCode = statusCode
  }
}

export function isSessionCategoryKey(key: string): boolean {
  const separator = key.indexOf(':')
  return separator > 0 && separator < key.length - 1 && key.length <= SESSION_KEY_MAX_LENGTH
}

/** A name as it is kept: trimmed, with each run of spaces as one. */
export function sessionCategoryName(name: string): string {
  const normalized = name.replace(/\s+/gu, ' ').trim()
  if (!normalized) throw new SessionCategoryRefusal('Name the category', 400)
  if (Array.from(normalized).length > SESSION_CATEGORY_NAME_MAX_LENGTH) {
    throw new SessionCategoryRefusal(
      `Category names are at most ${SESSION_CATEGORY_NAME_MAX_LENGTH} characters`, 400)
  }
  return normalized
}

export function sessionCategoryOf(
  categories: readonly SessionCategory[],
  key: string,
): SessionCategory | undefined {
  return categories.find((category) => category.sessions.includes(key))
}

function sessionKeys(keys: readonly string[]): string[] {
  const unique: string[] = []
  for (const key of keys) {
    if (!isSessionCategoryKey(key)) {
      throw new SessionCategoryRefusal(`${key || 'An empty name'} is not a session`, 400)
    }
    if (!unique.includes(key)) unique.push(key)
  }
  return unique
}

function existing(categories: readonly SessionCategory[], id: string): number {
  const index = categories.findIndex((category) => category.id === id)
  if (index < 0) {
    throw new SessionCategoryRefusal('That category no longer exists; reload the session list', 404)
  }
  return index
}

function unclaimed(categories: readonly SessionCategory[], name: string, except?: string): void {
  const folded = name.toLocaleLowerCase()
  if (categories.some((category) =>
    category.id !== except && category.name.toLocaleLowerCase() === folded)) {
    throw new SessionCategoryRefusal(`A category named ${name} already exists`, 409)
  }
}

function clamp(index: number, length: number): number {
  return Math.min(Math.max(Number.isInteger(index) ? index : length, 0), length)
}

function sameKeys(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((key, index) => key === right[index])
}

/** Every category without the given sessions; untouched categories are shared. */
function without(categories: readonly SessionCategory[], keys: readonly string[]): SessionCategory[] {
  return categories.map((category) => {
    const kept = category.sessions.filter((key) => !keys.includes(key))
    return kept.length === category.sessions.length ? category : { ...category, sessions: kept }
  })
}

/**
 * Applies one change, returning new categories, or the very same array when
 * the change alters nothing. Throws `SessionCategoryRefusal` for a change the
 * categories cannot take. The input is never modified.
 */
export function applySessionCategoryChange(
  categories: readonly SessionCategory[],
  change: SessionCategoryChange,
): SessionCategory[] {
  const current = categories as SessionCategory[]
  switch (change.type) {
    case 'create': {
      if (!SESSION_CATEGORY_ID.test(change.id)) {
        throw new SessionCategoryRefusal('A category id is 1 to 64 letters, digits, - or _', 400)
      }
      const name = sessionCategoryName(change.name)
      const sessions = sessionKeys(change.sessions ?? [])
      if (categories.some((category) => category.id === change.id)) {
        throw new SessionCategoryRefusal('That category already exists', 409)
      }
      unclaimed(categories, name)
      if (categories.length >= SESSION_CATEGORY_LIMIT) {
        throw new SessionCategoryRefusal(`A hub keeps at most ${SESSION_CATEGORY_LIMIT} categories`, 409)
      }
      return [...without(categories, sessions), { id: change.id, name, collapsed: false, sessions }]
    }
    case 'update': {
      const from = existing(categories, change.categoryId)
      const category = categories[from]
      const name = change.name === undefined ? category.name : sessionCategoryName(change.name)
      if (name !== category.name) unclaimed(categories, name, category.id)
      const collapsed = change.collapsed ?? category.collapsed
      const to = change.index === undefined ? from : clamp(change.index, categories.length - 1)
      if (name === category.name && collapsed === category.collapsed && to === from) return current
      const next = categories.filter((_, index) => index !== from)
      next.splice(to, 0, { ...category, name, collapsed })
      return next
    }
    case 'delete': {
      const index = existing(categories, change.categoryId)
      return categories.filter((_, position) => position !== index)
    }
    case 'move': {
      const keys = sessionKeys(change.sessions)
      const target = change.categoryId === null ? -1 : existing(categories, change.categoryId)
      const next = without(categories, keys)
      if (target >= 0) {
        const remaining = next[target].sessions
        const sessions = [...remaining]
        sessions.splice(clamp(change.index ?? remaining.length, remaining.length), 0, ...keys)
        next[target] = { ...next[target], sessions }
      }
      return next.every((category, index) => sameKeys(category.sessions, categories[index].sessions))
        ? current
        : next
    }
  }
}
