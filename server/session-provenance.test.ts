import { describe, expect, it, vi } from 'vitest'
import type { ManagedSession, SessionProvenance } from '../shared/contracts.js'
import { sessionProvenanceProjection } from './session-provenance.js'
import { SessionPublications } from './session-patches.js'

const session: ManagedSession = {
  id: 'one', computerId: 'studio', computerName: 'Studio', title: 'Untitled', cwd: '/fictional',
  status: 'idle', messages: [], updatedAt: '2026-11-14T20:00:00Z',
}

describe('hub session provenance projection', () => {
  it.each(['user', 'manager', 'discovered', 'schedule'] as const)('projects only authoritative %s provenance', (origin) => {
    const source: SessionProvenance = origin === 'schedule'
      ? { origin, scheduleId: 'morning', scheduleRunId: 'run' } : { origin }
    const store = { sessionProvenance: vi.fn(() => source) }
    const projection = sessionProvenanceProjection(store, { get: () => ({ name: 'Morning review' }) })
    const input = { ...session, provenance: { origin: 'manager' as const, scheduleName: 'Untrusted node title' } }
    const output = projection.project(input)
    expect(store.sessionProvenance).toHaveBeenCalledWith('studio', 'one')
    expect(output.provenance).toEqual(origin === 'schedule' ? { ...source, scheduleName: 'Morning review' } : { origin })
    expect(input.provenance.scheduleName).toBe('Untrusted node title')
    expect(source).not.toHaveProperty('scheduleName')
  })

  it('does not guess provenance or retain a node-supplied claim when the hub has no record', () => {
    const projection = sessionProvenanceProjection()
    expect(projection.project({ ...session, title: 'Oracle schedule review', provenance: { origin: 'manager' } }))
      .not.toHaveProperty('provenance')
  })

  it('keeps schedule identity when the schedule is deleted and reflects current names on each read', () => {
    const store = { sessionProvenance: () => ({ origin: 'schedule' as const, scheduleId: 'morning', scheduleRunId: 'run' }) }
    const get = vi.fn().mockReturnValueOnce({ name: 'First name' }).mockReturnValueOnce({ name: 'Renamed' })
      .mockImplementationOnce(() => { throw new Error('Deleted') })
    const projection = sessionProvenanceProjection(store, { get })
    expect(projection.project(session).provenance?.scheduleName).toBe('First name')
    expect(projection.project(session).provenance?.scheduleName).toBe('Renamed')
    expect(projection.project(session).provenance).toEqual({ origin: 'schedule', scheduleId: 'morning', scheduleRunId: 'run' })
  })

  it('projects lists, mutation replies and patched socket metadata without changing transcripts or receipts', () => {
    const project = sessionProvenanceProjection({ sessionProvenance: () => ({ origin: 'user' }) })
    const receipt = { deliveryId: 'root' }
    expect(project.reply({ session, receipt })).toMatchObject({ session: { provenance: { origin: 'user' } }, receipt })
    expect(project.reply({ sessions: [session], answeredComputerIds: ['studio'] }))
      .toMatchObject({ sessions: [{ provenance: { origin: 'user' } }], answeredComputerIds: ['studio'] })
    const payloads: string[] = []
    const socket = { readyState: 1, send: (payload: string) => payloads.push(payload), patchVersions: new Map<string, number>() }
    const publications = new SessionPublications()
    publications.add(socket)
    publications.broadcast(project.reply({ type: 'session.upserted', session }))
    publications.broadcast(project.reply({ type: 'session.upserted', session: { ...session, title: 'Renamed' } }))
    expect(JSON.parse(payloads[0]).session.provenance).toEqual({ origin: 'user' })
    expect(JSON.parse(payloads[1])).toMatchObject({ type: 'session.patched', session: { provenance: { origin: 'user' } } })
    expect(session).not.toHaveProperty('provenance')
  })
})
