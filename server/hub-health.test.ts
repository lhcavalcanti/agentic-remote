import { randomUUID } from 'node:crypto'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { buildApp } from './app.js'
import { createStartupPhases } from './startup-phases.js'

describe('hub health snapshot', () => {
  it('exposes bounded defensive startup records even when the log sink fails', async () => {
    let clock = 0
    const phases = createStartupPhases({ now: () => clock++, write: () => { throw new Error('sink failed') } })
    for (let count = 0; count < 140; count++) await phases.run('phase', async () => undefined)
    const records = phases.snapshot!()
    expect(records).toHaveLength(256)
    records[0].startupPhase = 'changed'
    expect(phases.snapshot!()[0].startupPhase).toBe('phase')
    await expect(phases.run('failed', async () => { throw new TypeError('secret file path') })).rejects.toThrow()
    expect(phases.snapshot!().at(-1)).toMatchObject({ event: 'fail', error: 'TypeError', durationMs: 1 })
    expect(JSON.stringify(phases.snapshot!())).not.toContain('secret file path')
  })

  it('serves the current start timings, identity and effective flags without starting services', async () => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'https://health.example.test')
    const directory = path.resolve(`.agentic-health-${randomUUID()}`)
    await mkdir(directory, { mode: 0o700 })
    const phases = createStartupPhases({ now: () => 10, write: vi.fn() })
    await phases.run('fixture.start', async () => undefined)
    const runtime = await buildApp({ dataDirectory: directory, logger: false, managerAgent: false, startupPhases: phases })
    try {
      const start = vi.spyOn(runtime.service, 'start')
      const response = await runtime.app.inject({ url: '/api/diagnostics/health', headers: {
        host: 'health.example.test', origin: 'https://health.example.test',
      } })
      expect(response.statusCode).toBe(200)
      expect(response.json()).toMatchObject({
        hub: { id: runtime.identity.info.id, role: 'hub', version: runtime.identity.info.version },
        startup: [{ startupPhase: 'fixture.start', event: 'begin' }, { startupPhase: 'fixture.start', event: 'complete', durationMs: 0 }],
        computers: [{ id: runtime.identity.info.id, online: true, role: 'hub' }],
      })
      expect(start).not.toHaveBeenCalled()
      expect(response.body).not.toContain('token')
    } finally { await runtime.app.close(); await rm(directory, { recursive: true, force: true }); vi.unstubAllEnvs() }
  })
})
