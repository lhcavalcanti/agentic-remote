import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { KnowledgeRoot } from '../shared/contracts.js'

interface KnowledgeConfinementClaim {
  token: string
  computerId: string
  sessionId: string
  committedRevision: number
  rootPath: string
}

interface KnowledgeState {
  roots: KnowledgeRoot[]
  provisionalRootIds: string[]
  rootConfinements: Record<string, string>
  provisionalRootConfinements: Record<string, {
    path: string
    claims: KnowledgeConfinementClaim[]
  }>
}

/**
 * Releases before session confinement read only `roots` from knowledge.json
 * and serve every root in it unconfined. Confined roots and all confinement
 * metadata live in this file instead, which those releases never open, so a
 * rollback hides a confined root rather than serving it past its session cwd.
 */
const CONFINED_STATE_FILE = 'knowledge-confined.json'

interface PersistedKnowledgeState
  extends Partial<Omit<KnowledgeState, 'provisionalRootConfinements'>> {
  order?: unknown
  provisionalRootConfinements?: Record<string, {
    path?: unknown
    claims?: Array<
      Partial<KnowledgeConfinementClaim> & { expectedRevision?: number }
    >
  }>
}

interface KnowledgeRootReference {
  computerId: string
  sessionId: string
  rootId: string | null
  revision: number
  rootPath?: string
}

interface KnowledgeRootReservationOptions {
  confinementPath?: string
  binding?: {
    computerId: string
    sessionId: string
    expectedRevision: number
    rootPath?: string
    committed?: {
      rootId: string | null
      rootPath: string
      revision: number
    }
  }
}

function committedRevision(expectedRevision: number): number {
  if (
    !Number.isSafeInteger(expectedRevision) ||
    expectedRevision < 0 ||
    expectedRevision >= Number.MAX_SAFE_INTEGER
  ) {
    throw new RangeError('The Knowledge binding revision cannot advance.')
  }
  return expectedRevision + 1
}

export interface KnowledgeRootReservation {
  root: KnowledgeRoot
  created: boolean
  requiresBindingCommit: boolean
  finalize: (guard?: () => boolean) => Promise<boolean>
  rollback: () => Promise<boolean>
}

export class KnowledgeRootConfinementConflictError extends Error {
  readonly statusCode = 409

  constructor() {
    super(
      'This Knowledge root is already confined to a different session working directory.',
    )
    this.name = 'KnowledgeRootConfinementConflictError'
  }
}

function parseMetadata(
  parsed: PersistedKnowledgeState,
): Omit<KnowledgeState, 'roots'> {
  return {
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
                const claims = value.claims.flatMap((claim) => {
                  if (
                    !claim ||
                    typeof claim !== 'object' ||
                    typeof claim.token !== 'string' ||
                    typeof claim.computerId !== 'string' ||
                    typeof claim.sessionId !== 'string'
                  ) {
                    return []
                  }
                  const committedRevision =
                    typeof claim.committedRevision === 'number' &&
                    Number.isSafeInteger(claim.committedRevision) &&
                    claim.committedRevision > 0
                      ? claim.committedRevision
                      : typeof claim.expectedRevision === 'number' &&
                          Number.isSafeInteger(claim.expectedRevision) &&
                          claim.expectedRevision >= 0 &&
                          claim.expectedRevision < Number.MAX_SAFE_INTEGER
                        ? claim.expectedRevision + 1
                        : undefined
                  if (committedRevision === undefined) return []
                  return [{
                    token: claim.token,
                    computerId: claim.computerId,
                    sessionId: claim.sessionId,
                    committedRevision,
                    rootPath:
                      typeof claim.rootPath === 'string'
                        ? claim.rootPath
                        : '.',
                  }]
                })
                return claims.length > 0
                  ? [[rootId, { path: value.path, claims }]]
                  : []
              },
            ),
          )
        : {},
  }
}

async function readOptional(file: string): Promise<string | undefined> {
  try {
    return await readFile(file, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    throw error
  }
}

export class KnowledgeStore {
  private readonly statePath: string
  private readonly confinedStatePath: string
  private state: KnowledgeState = {
    roots: [],
    provisionalRootIds: [],
    rootConfinements: {},
    provisionalRootConfinements: {},
  }
  private readonly rootReservations = new Map<string, Set<string>>()
  private writeQueue: Promise<void> = Promise.resolve()
  /** The text each file last held, so an unchanged file is not rewritten. */
  private persistedText: { catalog?: string; confined?: string } = {}

  constructor(private readonly directory: string) {
    this.statePath = path.join(directory, 'knowledge.json')
    this.confinedStatePath = path.join(directory, CONFINED_STATE_FILE)
  }

  async initialize(): Promise<void> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 })
    const catalogText = await readOptional(this.statePath)
    const confinedText = await readOptional(this.confinedStatePath)
    // Rebuild from known fields so a file written before roots replaced
    // bookmarks loads, and the obsolete key is not carried forward.
    const catalog = catalogText === undefined
      ? {}
      : JSON.parse(catalogText) as PersistedKnowledgeState
    const confined = confinedText === undefined
      ? {}
      : JSON.parse(confinedText) as PersistedKnowledgeState
    // An earlier build of this feature kept the metadata in the catalog file.
    // Merging it keeps those confinements, and the startup write below moves
    // their roots out of the file earlier releases serve.
    const legacy = parseMetadata(catalog)
    const current = parseMetadata(confined)
    const legacyCatalog = (
      ['provisionalRootIds', 'rootConfinements', 'provisionalRootConfinements']
    ).some((key) => key in catalog)
    const metadata = {
      provisionalRootIds: [
        ...new Set([...current.provisionalRootIds, ...legacy.provisionalRootIds]),
      ],
      rootConfinements: {
        ...legacy.rootConfinements,
        ...current.rootConfinements,
      },
      provisionalRootConfinements: {
        ...legacy.provisionalRootConfinements,
        ...current.provisionalRootConfinements,
      },
    }
    // An interrupted move can leave a root in both files; its confined copy
    // wins. A root the confined file lists without a confinement is dropped.
    const hidden = (confined.roots ?? []).filter(
      (root) => metadata.rootConfinements[root.id] !== undefined,
    )
    const hiddenIds = new Set(hidden.map((root) => root.id))
    const loaded = [
      ...(catalog.roots ?? []).filter((root) => !hiddenIds.has(root.id)),
      ...hidden,
    ]
    const order = new Map(
      (Array.isArray(confined.order) ? confined.order : [])
        .filter((id): id is string => typeof id === 'string')
        .map((id, index) => [id, index] as const),
    )
    this.state = {
      // A root an earlier release added while it ran is the newest.
      roots: [
        ...loaded.filter((root) => !order.has(root.id)),
        ...loaded
          .filter((root) => order.has(root.id))
          .sort((left, right) => order.get(left.id)! - order.get(right.id)!),
      ],
      ...metadata,
    }
    this.persistedText = { catalog: catalogText, confined: confinedText }
    this.rootReservations.clear()
    if (catalogText === undefined || legacyCatalog) await this.persist()
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

  finalizeCommittedBinding(binding: KnowledgeRootReference): Promise<boolean> {
    if (!binding.rootId) return Promise.resolve(false)
    return this.enqueue(async () => {
      const rootId = binding.rootId!
      const pending = this.state.provisionalRootConfinements[rootId]
      const committedClaim = pending?.claims.some(
        (claim) =>
          claim.computerId === binding.computerId &&
          claim.sessionId === binding.sessionId &&
          claim.committedRevision === binding.revision &&
          claim.rootPath === binding.rootPath,
      )
      const provisionalRoot = this.state.provisionalRootIds.includes(rootId)
      if (!committedClaim && (!provisionalRoot || pending)) {
        return false
      }
      const { [rootId]: _finalized, ...provisionalRootConfinements } =
        this.state.provisionalRootConfinements
      const next = {
        ...this.state,
        provisionalRootIds: this.state.provisionalRootIds.filter(
          (id) => id !== rootId,
        ),
        provisionalRootConfinements:
          committedClaim
            ? provisionalRootConfinements
            : this.state.provisionalRootConfinements,
      }
      await this.write(next)
      this.state = next
      this.rootReservations.delete(rootId)
      return true
    })
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
                binding.revision === claim.committedRevision &&
                binding.rootPath === claim.rootPath,
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
        const confinement = this.state.rootConfinements[existing.id]
        if (
          options.confinementPath &&
          confinement &&
          confinement !== options.confinementPath
        ) {
          throw new KnowledgeRootConfinementConflictError()
        }
        if (options.confinementPath && pending) {
          if (!options.binding) {
            throw new Error(
              'Existing-root confinement requires a binding recovery claim',
            )
          }
          const binding = options.binding
          const token = randomUUID()
          const rootPath = binding.rootPath ?? '.'
          const committed = binding.committed
          const alreadyCommitted = pending.claims.some(
            (existingClaim) =>
              existingClaim.computerId === binding.computerId &&
              existingClaim.sessionId === binding.sessionId &&
              existingClaim.rootPath === rootPath &&
              existingClaim.committedRevision === binding.expectedRevision &&
              committed?.rootId === existing.id &&
              committed.rootPath === rootPath &&
              committed.revision === binding.expectedRevision,
          )
          const claim = {
            token,
            computerId: binding.computerId,
            sessionId: binding.sessionId,
            committedRevision: alreadyCommitted
              ? binding.expectedRevision
              : committedRevision(binding.expectedRevision),
            rootPath,
          }
          const next = {
            ...this.state,
            provisionalRootConfinements: {
              ...this.state.provisionalRootConfinements,
              [existing.id]: {
                ...pending,
                claims: [
                  ...pending.claims,
                  claim,
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
          return this.reservation(existing, false, !alreadyCommitted, token)
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
          const claim = {
            token,
            computerId: options.binding.computerId,
            sessionId: options.binding.sessionId,
            committedRevision: committedRevision(
              options.binding.expectedRevision,
            ),
            rootPath: options.binding.rootPath ?? '.',
          }
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
                claims: [claim],
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
          return this.reservation(existing, false, true, token)
        }
        if (!reservations) {
          return this.reservation(existing, false, false)
        }
        const token = randomUUID()
        reservations.add(token)
        return this.reservation(existing, false, false, token)
      }
      const token = randomUUID()
      const pendingConfinement =
        options.confinementPath && options.binding
          ? {
              path: options.confinementPath,
              claims: [{
                token,
                computerId: options.binding.computerId,
                sessionId: options.binding.sessionId,
                committedRevision: committedRevision(
                  options.binding.expectedRevision,
                ),
                rootPath: options.binding.rootPath ?? '.',
              }],
            }
          : undefined
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
          pendingConfinement
            ? {
                ...this.state.provisionalRootConfinements,
                [created.id]: pendingConfinement,
              }
            : this.state.provisionalRootConfinements,
      }
      await this.write(next)
      this.state = next
      this.rootReservations.set(created.id, new Set([token]))
      return this.reservation(
        created,
        true,
        pendingConfinement !== undefined,
        token,
      )
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
    requiresBindingCommit: boolean,
    token?: string,
  ): KnowledgeRootReservation {
    let outcome: boolean | undefined
    return {
      root: structuredClone(root),
      created,
      requiresBindingCommit,
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
        const pending = this.state.provisionalRootConfinements[id]
        const ownsConfinement = pending?.claims.some(
          (claim) => claim.token === token,
        )
        if (ownsConfinement) {
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
          this.rootReservations.delete(id)
        } else if (pending) {
          if (this.state.provisionalRootIds.includes(id)) {
            const next = {
              ...this.state,
              provisionalRootIds: this.state.provisionalRootIds.filter(
                (rootId) => rootId !== id,
              ),
            }
            await this.write(next)
            this.state = next
          }
          reservations.delete(token)
          if (reservations.size === 0) this.rootReservations.delete(id)
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
          this.rootReservations.delete(id)
        } else {
          this.rootReservations.delete(id)
        }
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
      if (claims.length === pending.claims.length) {
        reservations.delete(token)
        if (reservations.size === 0) this.rootReservations.delete(id)
        return false
      }
      reservations.delete(token)
      const { [id]: _confinement, ...rootConfinements } =
        this.state.rootConfinements
      const { [id]: _pending, ...otherPending } =
        this.state.provisionalRootConfinements
      const removeRoot =
        claims.length === 0 &&
        reservations.size === 0 &&
        this.state.provisionalRootIds.includes(id)
      const next = {
        ...this.state,
        roots: removeRoot
          ? this.state.roots.filter((entry) => entry.id !== id)
          : this.state.roots,
        provisionalRootIds: removeRoot
          ? this.state.provisionalRootIds.filter((rootId) => rootId !== id)
          : this.state.provisionalRootIds,
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
      if (reservations.size === 0) this.rootReservations.delete(id)
      return removeRoot
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
    const confined = (root: KnowledgeRoot, from: KnowledgeState) =>
      from.rootConfinements[root.id] !== undefined
    const catalog = JSON.stringify(
      { roots: state.roots.filter((root) => !confined(root, state)) },
      null,
      2,
    )
    const hiddenRoots = state.roots.filter((root) => confined(root, state))
    const metadata = {
      provisionalRootIds: state.provisionalRootIds,
      rootConfinements: state.rootConfinements,
      provisionalRootConfinements: state.provisionalRootConfinements,
    }
    const hidden = JSON.stringify(
      {
        order: state.roots.map((root) => root.id),
        roots: hiddenRoots,
        ...metadata,
      },
      null,
      2,
    )
    // A hub that has never confined or reserved a root needs no second file.
    const unused =
      this.persistedText.confined === undefined &&
      hiddenRoots.length === 0 &&
      Object.values(metadata).every((value) => Object.keys(value).length === 0)
    // The files are replaced one at a time, so the one gaining a root goes
    // first: an interrupted move then leaves the root in both files, where
    // the confined copy wins on load, rather than in neither.
    const revealing = this.state.roots.some(
      (root) =>
        confined(root, this.state) &&
        state.roots.some(
          (entry) => entry.id === root.id && !confined(entry, state),
        ),
    )
    const writeCatalog = () => this.replace('catalog', this.statePath, catalog)
    const writeConfined = () =>
      unused
        ? Promise.resolve()
        : this.replace('confined', this.confinedStatePath, hidden)
    if (revealing) {
      await writeCatalog()
      await writeConfined()
    } else {
      await writeConfined()
      await writeCatalog()
    }
  }

  private async replace(
    key: 'catalog' | 'confined',
    file: string,
    text: string,
  ): Promise<void> {
    if (this.persistedText[key] === text) return
    const temporary = `${file}.tmp`
    await writeFile(temporary, text, { mode: 0o600 })
    await rename(temporary, file)
    this.persistedText[key] = text
  }
}
