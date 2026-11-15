import type { ManagedSession, SessionProvenance } from '../shared/contracts.js'
import type { ManagerStore } from './manager-store.js'

type SessionIdentity = Pick<ManagedSession, 'computerId' | 'id'> & { provenance?: SessionProvenance }

function isSession(value: unknown): value is SessionIdentity {
  return Boolean(value && typeof value === 'object' &&
    typeof (value as SessionIdentity).computerId === 'string' &&
    typeof (value as SessionIdentity).id === 'string')
}

export function sessionProvenanceProjection(
  store?: Pick<ManagerStore, 'sessionProvenance'>,
  schedules?: { get: (id: string) => { name: string } },
) {
  function project<T extends SessionIdentity>(session: T): T {
    const { provenance: _remote, ...identity } = session
    // The registry records launches explicitly and normalizes legacy timing-only user tags.
    const recorded = store?.sessionProvenance(session.computerId, session.id)
    if (!recorded) return identity as T
    const provenance = { ...recorded }
    if (provenance.origin === 'schedule') {
      if (provenance.scheduleId && schedules) {
        try {
          provenance.scheduleName = schedules.get(provenance.scheduleId).name
        } catch {
          // A retained session may outlive its deleted schedule.
        }
      }
    }
    return { ...identity, provenance } as T
  }
  function reply<T>(payload: T): T {
    if (!payload || typeof payload !== 'object') return payload
    const value = payload as Record<string, unknown>
    const session = isSession(value.session) ? project(value.session) : undefined
    const sessions = Array.isArray(value.sessions)
      ? value.sessions.map((entry) => isSession(entry) ? project(entry) : entry)
      : undefined
    return session || sessions
      ? { ...value, ...(session ? { session } : {}), ...(sessions ? { sessions } : {}) } as T
      : payload
  }
  return { project, reply }
}
