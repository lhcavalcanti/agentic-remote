import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { KnowledgeRoot } from '../shared/contracts.js'

interface KnowledgeState {
  roots: KnowledgeRoot[]
  provisionalRootIds: string[]
  rootConfinements: Record<string, string>
  provisionalRootConfinements: Record<string, {
    path: string
    claims: Array<{
      token: string
      computerId: string
      sessionId: string
      expectedRevision: number
    }>
  }>
}

interface KnowledgeRootReference {
  computerId: string
  sessionId: string
  rootId: string | null
  revision: number
}

interface KnowledgeRootReservationOptions {
  confinementPath?: string
  binding?: {
    computerId: string
    sessionId: string
    expectedRevision: number
  }
}

export interface KnowledgeRootReservation {
  root: KnowledgeRoot
  created: boolean
  finalize: (guard?: () => boolean) => Promise<boolean>
  rollback: () => Promise<boolean>
}

export class KnowledgeStore {
  private readonly statePath: string
  private state: KnowledgeState = {
    roots: [],
    provisionalRootIds: [],
    rootConfinements: {},
    provisionalRootConfinements: {},
  }
  private readonly rootReservations = new Map<string, Set<string>>()
  private writeQueue: Promise<void> = Promise.resolve()

  constructor(private readonly directory: string) {
    this.statePath = path.join(directory, 'knowledge.json')
  }

  async initialize(): Promise<void> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 })
    try {
      const parsed = JSON.parse(
        await readFile(this.statePath, 'utf8'),
      ) as Partial<KnowledgeState>
      // Rebuild from known fields so a file written before roots replaced
      // bookmarks loads, and the obsolete key is not carried forward.
      this.state = {
        roots: parsed.roots ?? [],
        provisionalRootIds: Array.isArray(parsed.provisionalRootIds)
          ? parsed.provisionalRootIds.filter(
              (id): id is string => typeof id === 'string',
            )
          : [],
        rootConfinements:
          parsed.rootConfinements &&
          typeof parsed.rootConfinements === 'object'
            ? Object.fromEntries(
                Object.entries(parsed.rootConfinements).filter(
                  (entry): entry is [string, string] =>
                    typeof entry[1] === 'string',
                ),
              )
            : {},
        provisionalRootConfinements:
          parsed.provisionalRootConfinements &&
          typeof parsed.provisionalRootConfinements === 'object'
            ? Object.fromEntries(
                Object.entries(parsed.provisionalRootConfinements).flatMap(
                  ([rootId, value]) => {
                    if (
                      !value ||
                      typeof value !== 'object' ||
                      typeof value.path !== 'string' ||
                      !Array.isArray(value.claims)
                    ) {
                      return []
                    }
                    const claims = value.claims.filter((claim) =>
                      claim &&
                      typeof claim === 'object' &&
                      typeof claim.token === 'string' &&
                      typeof claim.computerId === 'string' &&
                      typeof claim.sessionId === 'string' &&
                      Number.isSafeInteger(claim.expectedRevision) &&
                      claim.expectedRevision >= 0,
                    )
                    return claims.length > 0
                      ? [[rootId, { path: value.path, claims }]]
                      : []
                  },
                ),
              )
            : {},
      }
      this.rootReservations.clear()
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
      await this.persist()
    }
  }

  listRoots(): KnowledgeRoot[] {
    return structuredClone(this.state.roots)
  }

  getRoot(id: string): KnowledgeRoot | undefined {
    const root = this.state.roots.find((entry) => entry.id === id)
    return root ? structuredClone(root) : undefined
  }

  getRootConfinement(id: string): string | undefined {
    return this.state.rootConfinements[id]
  }

  recoverProvisionalRoots(
    references: Iterable<string | KnowledgeRootReference>,
  ): Promise<number> {
    const referenced = new Set<string>()
    const bindings: KnowledgeRootReference[] = []
    for (const reference of references) {
      if (typeof reference === 'string') {
        referenced.add(reference)
      } else {
        bindings.push(reference)
        if (reference.rootId) referenced.add(reference.rootId)
      }
    }
    return this.enqueue(async () => {
      if (
        this.state.provisionalRootIds.length === 0 &&
        Object.keys(this.state.provisionalRootConfinements).length === 0
      ) {
        return 0
      }
      const provisional = new Set(this.state.provisionalRootIds)
      const roots = this.state.roots.filter(
        (root) => !provisional.has(root.id) || referenced.has(root.id),
      )
      const removed = this.state.roots.length - roots.length
      const keptIds = new Set(roots.map((root) => root.id))
      const committedConfinements = new Set(
        Object.entries(this.state.provisionalRootConfinements)
          .filter(([rootId, pending]) =>
            pending.claims.some((claim) =>
              bindings.some((binding) =>
                binding.rootId === rootId &&
                binding.computerId === claim.computerId &&
                binding.sessionId === claim.sessionId &&
                (
                  binding.revision === claim.expectedRevision ||
                  (
                    claim.expectedRevision < Number.MAX_SAFE_INTEGER &&
                    binding.revision === claim.expectedRevision + 1
                  )
                ),
              ),
            ),
          )
          .map(([rootId]) => rootId),
      )
      const next = {
        roots,
        provisionalRootIds: [],
        rootConfinements: Object.fromEntries(
          Object.entries(this.state.rootConfinements).filter(
            ([rootId]) =>
              keptIds.has(rootId) &&
              (
                !this.state.provisionalRootConfinements[rootId] ||
                committedConfinements.has(rootId)
              ),
          ),
        ),
        provisionalRootConfinements: {},
      }
      await this.write(next)
      this.state = next
      this.rootReservations.clear()
      return removed
    })
  }

  async addRoot(
    root: Omit<KnowledgeRoot, 'id' | 'createdAt'>,
  ): Promise<KnowledgeRoot> {
    const reservation = await this.reserveRoot(root)
    await reservation.finalize()
    return reservation.root
  }

  reserveRoot(
    root: Omit<KnowledgeRoot, 'id' | 'createdAt'>,
    options: KnowledgeRootReservationOptions = {},
  ): Promise<KnowledgeRootReservation> {
    return this.enqueue(async () => {
      const existing = this.state.roots.find(
        (entry) =>
          entry.computerId === root.computerId && entry.path === root.path,
      )
      if (existing) {
        const reservations = this.rootReservations.get(existing.id)
        const pending = this.state.provisionalRootConfinements[existing.id]
        if (options.confinementPath && pending) {
          if (!options.binding) {
            throw new Error(
              'Existing-root confinement requires a binding recovery claim',
            )
          }
          const token = randomUUID()
          const next = {
            ...this.state,
            provisionalRootConfinements: {
              ...this.state.provisionalRootConfinements,
              [existing.id]: {
                ...pending,
                claims: [
                  ...pending.claims,
                  { token, ...options.binding },
                ],
              },
            },
          }
          await this.write(next)
          this.state = next
          if (reservations) {
            reservations.add(token)
          } else {
            this.rootReservations.set(existing.id, new Set([token]))
          }
          return this.reservation(existing, false, token)
        }
        if (
          options.confinementPath &&
          !this.state.rootConfinements[existing.id]
        ) {
          if (!options.binding) {
            throw new Error(
              'Existing-root confinement requires a binding recovery claim',
            )
          }
          const token = randomUUID()
          const next = {
            ...this.state,
            rootConfinements: {
              ...this.state.rootConfinements,
              [existing.id]: options.confinementPath,
            },
            provisionalRootConfinements: {
              ...this.state.provisionalRootConfinements,
              [existing.id]: {
                path: options.confinementPath,
                claims: [{ token, ...options.binding }],
              },
            },
          }
          await this.write(next)
          this.state = next
          if (reservations) {
            reservations.add(token)
          } else {
            this.rootReservations.set(existing.id, new Set([token]))
          }
          return this.reservation(existing, false, token)
        }
        if (!reservations) {
          return this.reservation(existing, false)
        }
        const token = randomUUID()
        reservations.add(token)
        return this.reservation(existing, false, token)
      }
      const created: KnowledgeRoot = {
        ...root,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
      }
      const next = {
        roots: [created, ...this.state.roots],
        provisionalRootIds: [created.id, ...this.state.provisionalRootIds],
        rootConfinements: {
          ...this.state.rootConfinements,
          ...(options.confinementPath
            ? { [created.id]: options.confinementPath }
            : {}),
        },
        provisionalRootConfinements:
          this.state.provisionalRootConfinements,
      }
      await this.write(next)
      this.state = next
      const token = randomUUID()
      this.rootReservations.set(created.id, new Set([token]))
      return this.reservation(created, true, token)
    })
  }

  removeRoot(id: string): Promise<boolean> {
    return this.enqueue(async () => {
      const remaining = this.state.roots.filter((entry) => entry.id !== id)
      if (remaining.length === this.state.roots.length) return false
      const next = {
        roots: remaining,
        provisionalRootIds: this.state.provisionalRootIds.filter(
          (rootId) => rootId !== id,
        ),
        rootConfinements: Object.fromEntries(
          Object.entries(this.state.rootConfinements).filter(
            ([rootId]) => rootId !== id,
          ),
        ),
        provisionalRootConfinements: Object.fromEntries(
          Object.entries(this.state.provisionalRootConfinements).filter(
            ([rootId]) => rootId !== id,
          ),
        ),
      }
      await this.write(next)
      this.state = next
      this.rootReservations.delete(id)
      return true
    })
  }

  /**
   * Drops the roots that named folders on a computer that is no longer
   * paired. A root is only a computer and a path, so once the computer is
   * gone the root can never answer anything but "not found" -- and it stays
   * in the list offering to try.
   */
  removeRootsForComputer(computerId: string): Promise<number> {
    return this.enqueue(async () => {
      const removedIds = this.state.roots
        .filter((entry) => entry.computerId === computerId)
        .map((entry) => entry.id)
      const remaining = this.state.roots.filter(
        (entry) => entry.computerId !== computerId,
      )
      const removed = this.state.roots.length - remaining.length
      if (removed === 0) return 0
      const removedIdSet = new Set(removedIds)
      const next = {
        roots: remaining,
        provisionalRootIds: this.state.provisionalRootIds.filter(
          (rootId) => !removedIdSet.has(rootId),
        ),
        rootConfinements: Object.fromEntries(
          Object.entries(this.state.rootConfinements).filter(
            ([rootId]) => !removedIdSet.has(rootId),
          ),
        ),
        provisionalRootConfinements: Object.fromEntries(
          Object.entries(this.state.provisionalRootConfinements).filter(
            ([rootId]) => !removedIdSet.has(rootId),
          ),
        ),
      }
      await this.write(next)
      this.state = next
      for (const id of removedIds) this.rootReservations.delete(id)
      return removed
    })
  }

  private persist(): Promise<void> {
    return this.enqueue(() => this.write(this.state))
  }

  private reservation(
    root: KnowledgeRoot,
    created: boolean,
    token?: string,
  ): KnowledgeRootReservation {
    let outcome: boolean | undefined
    return {
      root: structuredClone(root),
      created,
      finalize: async (guard) => {
        if (outcome !== undefined) return outcome
        const finalized = token
          ? await this.finalizeReservation(root.id, token, guard)
          : await this.enqueue(async () => guard?.() ?? true)
        outcome = finalized
        return finalized
      },
      rollback: async () => {
        if (outcome !== undefined) return false
        const removed = token
          ? await this.rollbackReservation(root.id, token)
          : false
        outcome = false
        return removed
      },
    }
  }

  private finalizeReservation(
    id: string,
    token: string,
    guard?: () => boolean,
  ): Promise<boolean> {
    return this.enqueue(async () => {
      if (guard && !guard()) {
        await this.rollbackReservationNow(id, token)
        return false
      }
      const reservations = this.rootReservations.get(id)
      if (reservations?.has(token)) {
        if (this.state.provisionalRootConfinements[id]) {
          const { [id]: _finalized, ...provisionalRootConfinements } =
            this.state.provisionalRootConfinements
          const next = {
            ...this.state,
            provisionalRootIds: this.state.provisionalRootIds.filter(
              (rootId) => rootId !== id,
            ),
            provisionalRootConfinements,
          }
          await this.write(next)
          this.state = next
        } else if (this.state.provisionalRootIds.includes(id)) {
          const next = {
            roots: this.state.roots,
            provisionalRootIds: this.state.provisionalRootIds.filter(
              (rootId) => rootId !== id,
            ),
            rootConfinements: this.state.rootConfinements,
            provisionalRootConfinements:
              this.state.provisionalRootConfinements,
          }
          await this.write(next)
          this.state = next
        }
        this.rootReservations.delete(id)
      }
      return true
    })
  }

  private rollbackReservation(id: string, token: string): Promise<boolean> {
    return this.enqueue(() => this.rollbackReservationNow(id, token))
  }

  private async rollbackReservationNow(
    id: string,
    token: string,
  ): Promise<boolean> {
    const reservations = this.rootReservations.get(id)
    if (!reservations?.has(token)) return false
    const pending = this.state.provisionalRootConfinements[id]
    if (pending) {
      const claims = pending.claims.filter((claim) => claim.token !== token)
      const { [id]: _confinement, ...rootConfinements } =
        this.state.rootConfinements
      const { [id]: _pending, ...otherPending } =
        this.state.provisionalRootConfinements
      const next = {
        ...this.state,
        rootConfinements:
          claims.length > 0 ? this.state.rootConfinements : rootConfinements,
        provisionalRootConfinements:
          claims.length > 0
            ? {
                ...otherPending,
                [id]: { ...pending, claims },
              }
            : otherPending,
      }
      await this.write(next)
      this.state = next
      reservations.delete(token)
      if (reservations.size === 0) this.rootReservations.delete(id)
      return false
    }
    if (reservations.size > 1) {
      reservations.delete(token)
      return false
    }
    const remaining = this.state.roots.filter((entry) => entry.id !== id)
    if (remaining.length === this.state.roots.length) {
      this.rootReservations.delete(id)
      return false
    }
    const next = {
      roots: remaining,
      provisionalRootIds: this.state.provisionalRootIds.filter(
        (rootId) => rootId !== id,
      ),
      rootConfinements: Object.fromEntries(
        Object.entries(this.state.rootConfinements).filter(
          ([rootId]) => rootId !== id,
        ),
      ),
      provisionalRootConfinements: Object.fromEntries(
        Object.entries(this.state.provisionalRootConfinements).filter(
          ([rootId]) => rootId !== id,
        ),
      ),
    }
    await this.write(next)
    this.state = next
    this.rootReservations.delete(id)
    return true
  }

  private enqueue<TResult>(
    operation: () => Promise<TResult>,
  ): Promise<TResult> {
    const task = this.writeQueue.then(operation)
    this.writeQueue = task.then(() => undefined, () => undefined)
    return task
  }

  private async write(state: KnowledgeState): Promise<void> {
    const temporary = `${this.statePath}.tmp`
    await writeFile(temporary, JSON.stringify(state, null, 2), { mode: 0o600 })
    await rename(temporary, this.statePath)
  }
}
