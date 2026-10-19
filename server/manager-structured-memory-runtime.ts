import type {
  ManagerStructuredMemoryMode,
  ManagerStructuredMemoryStatus,
} from '../shared/manager-structured-memory.js'
import { ManagerStructuredMemoryStore } from './manager-structured-memory-store.js'

export class ManagerStructuredMemoryRuntime {
  private retrievals = 0
  private lastRetrievalMs?: number
  private lastRetrievalRecords?: number
  private lastPromptCharacters?: number
  private lastRetrievalError?: string

  constructor(
    readonly mode: ManagerStructuredMemoryMode,
    readonly store?: ManagerStructuredMemoryStore,
    private readonly unavailableReason?: string,
  ) {}

  recordRetrieval(input: {
    durationMs: number
    records: number
    promptCharacters: number
  }): void {
    this.retrievals += 1
    this.lastRetrievalMs = Math.max(0, input.durationMs)
    this.lastRetrievalRecords = Math.max(0, input.records)
    this.lastPromptCharacters = Math.max(0, input.promptCharacters)
    this.lastRetrievalError = undefined
  }

  recordRetrievalFailure(durationMs: number): void {
    this.retrievals += 1
    this.lastRetrievalMs = Math.max(0, durationMs)
    this.lastRetrievalRecords = 0
    this.lastPromptCharacters = 0
    this.lastRetrievalError = 'Structured memory retrieval failed.'
  }

  status(): ManagerStructuredMemoryStatus {
    if (this.mode === 'off') {
      return { mode: this.mode, availability: 'disabled' }
    }
    const failure = this.store?.failureReason()
    if (!this.store || failure) {
      return {
        mode: this.mode,
        availability: 'unavailable',
        lastError: failure ?? this.unavailableReason ??
          'Structured memory is unavailable.',
      }
    }
    const snapshot = this.store.snapshot()
    return {
      mode: this.mode,
      availability: 'ready',
      revision: snapshot.revision,
      records: snapshot.records.length,
      tombstones: snapshot.tombstones.length,
      retrievals: this.retrievals,
      ...(this.lastRetrievalMs === undefined
        ? {}
        : { lastRetrievalMs: this.lastRetrievalMs }),
      ...(this.lastRetrievalRecords === undefined
        ? {}
        : { lastRetrievalRecords: this.lastRetrievalRecords }),
      ...(this.lastPromptCharacters === undefined
        ? {}
        : { lastPromptCharacters: this.lastPromptCharacters }),
      ...(this.lastRetrievalError
        ? { lastError: this.lastRetrievalError }
        : {}),
    }
  }
}

export async function initializeManagerStructuredMemory(
  directory: string,
  mode: ManagerStructuredMemoryMode,
): Promise<ManagerStructuredMemoryRuntime> {
  if (mode === 'off') return new ManagerStructuredMemoryRuntime(mode)
  const store = new ManagerStructuredMemoryStore(directory)
  try {
    await store.initialize()
    return new ManagerStructuredMemoryRuntime(mode, store)
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : 'Structured memory initialization failed.'
    return new ManagerStructuredMemoryRuntime(mode, undefined, message)
  }
}
