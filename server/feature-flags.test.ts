import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultHubFeatureFlags, hubFlagCatalogue } from '../shared/feature-flags.js'
import { buildApp } from './app.js'

let runtime: Awaited<ReturnType<typeof buildApp>> | undefined
let directory: string | undefined

beforeEach(() => {
  for (const flag of Object.values(hubFlagCatalogue)) vi.stubEnv(flag.env, 'off')
  vi.stubEnv('AGENTIC_REMOTE_ORACLE_VOICE', 'off')
  vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', '')
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
})

afterEach(async () => {
  await runtime?.app.close()
  if (directory) await rm(directory, { recursive: true, force: true })
  runtime = undefined
  directory = undefined
  vi.unstubAllEnvs()
})

async function hub(role: 'hub' | 'node' = 'hub') {
  const parent = path.join(process.cwd(), '.agentic-remote')
  await mkdir(parent, { recursive: true })
  directory = await mkdtemp(path.join(parent, 'feature-flags-test-'))
  runtime = await buildApp({
    role,
    dataDirectory: directory,
    logger: false,
    managerAgent: false,
    transcriptionService: {
      initialize: async () => undefined,
      stop: async () => undefined,
      transcribe: vi.fn(),
    },
  })
  return runtime.app
}

describe('effective hub feature state', () => {
  it('serves default-off flags without caching', async () => {
    const app = await hub()
    await runtime!.settingsProfileStore!.update({
      previewFeatures: {
        value: { notificationPanel: true, hostMonitorView: true, schedulerView: true },
        baseRevision: 0,
      },
    })
    const response = await app.inject({ url: '/api/features', headers: { host: 'localhost' } })
    expect(response.statusCode).toBe(200)
    expect(response.headers['cache-control']).toBe('no-store')
    expect(response.json()).toEqual({ hubFlags: defaultHubFeatureFlags })
  })

  it('captures environment flags once, not on each request or from client preferences', async () => {
    vi.stubEnv('AGENTIC_REMOTE_FEATURE_NOTIFICATION_CENTER', 'on')
    vi.stubEnv('AGENTIC_REMOTE_FEATURE_HOST_MONITOR', ' ON ')
    vi.stubEnv('AGENTIC_REMOTE_FEATURE_SCHEDULER', 'On')
    const app = await hub()
    for (const flag of Object.values(hubFlagCatalogue)) vi.stubEnv(flag.env, 'off')
    const response = await app.inject({ url: '/api/features', headers: { host: 'localhost' } })
    expect(response.json()).toEqual({
      hubFlags: { notificationCenter: true, hostMonitor: true, scheduler: true },
    })
  })

  it.each(Object.values(hubFlagCatalogue).flatMap(({ env }) =>
    ['enabled', 'true', 'false', '1', '0'].map((value) => ({ env, value })),
  ))('refuses startup for malformed $env=$value', async ({ env, value }) => {
    vi.stubEnv(env, value)
    await expect(hub()).rejects.toThrow(`Invalid ${env}: expected on|off`)
  })

  it('does not advertise hub-owned rollout flags on a node', async () => {
    const app = await hub('node')
    expect((await app.inject({ url: '/api/features', headers: { host: 'localhost' } })).statusCode)
      .toBe(404)
  })
})
