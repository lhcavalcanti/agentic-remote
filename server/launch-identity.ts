import { launchIdentitySchema, type TerminationAcknowledgement } from '../shared/launch-identity.js'
import type { SessionDetail } from '../shared/contracts.js'
import type { SessionStore } from './session-store.js'

export function updateComputerForLaunchIdentity(): Error {
  return Object.assign(new Error('Update this computer to use launch identity and termination acknowledgement.'), {
    statusCode: 409, uncertainDelivery: false,
  })
}

export class LaunchCreations {
  private readonly pending = new Map<string, Promise<SessionDetail>>()

  run(store: SessionStore, launchId: string | undefined, create: () => Promise<SessionDetail>): Promise<SessionDetail> {
    if (launchId === undefined) return create()
    launchIdentitySchema.parse(launchId)
    const pending = this.pending.get(launchId)
    if (pending) return pending
    const existing = store.reconcileLaunch(launchId)
    if (existing) {
      const session = store.get(existing.sessionId)
      return session ? Promise.resolve(session) : Promise.reject(Object.assign(
        new Error('This launch session has been deleted; its identity cannot be reused.'), { statusCode: 409 },
      ))
    }
    const result = create().finally(() => this.pending.delete(launchId))
    this.pending.set(launchId, result)
    return result
  }
}

/** Provider waits are bounded; the admission fence must commit first or reject. */
export async function awaitTermination(
  sessionId: string,
  timeoutMs: number,
  stop: () => Promise<void>,
  settled: () => Promise<boolean>,
  fence?: () => Promise<void>,
): Promise<TerminationAcknowledgement> {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 0 || timeoutMs > 30_000) {
    throw Object.assign(new Error('timeoutMs must be between 0 and 30000.'), { statusCode: 400 })
  }
  await fence?.()
  const deadline = Date.now() + timeoutMs
  let expired = false
  let timer: ReturnType<typeof setTimeout> | undefined
  const result = (outcome: 'stopped' | 'unknown', reason?: string): TerminationAcknowledgement => ({
    sessionId, outcome, checkedAt: new Date().toISOString(), scope: 'provider-owned',
    ...(reason ? { reason } : {}),
  })
  try {
    return await Promise.race([
      (async () => {
        await stop()
        do {
          if (expired) break
          if (await settled()) return result('stopped')
          if (Date.now() >= deadline) break
          await new Promise((resolve) => setTimeout(resolve, Math.min(25, deadline - Date.now())))
        } while (!expired)
        return result('unknown', 'The provider has not confirmed that all owned work stopped.')
      })().catch(() => result('unknown', 'The provider could not confirm termination.')),
      new Promise<TerminationAcknowledgement>((resolve) => {
        timer = setTimeout(() => {
          expired = true
          resolve(result('unknown', 'Timed out waiting for provider termination.'))
        }, timeoutMs)
      }),
    ])
  } finally {
    expired = true
    if (timer) clearTimeout(timer)
  }
}
