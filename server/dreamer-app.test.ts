import { randomUUID } from 'node:crypto'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildApp } from './app.js'

const directories: string[] = []
const runtimes: Array<Awaited<ReturnType<typeof buildApp>>> = []
const trusted = { host: 'hub.example.test', origin: 'https://hub.example.test' }

async function dataDirectory(): Promise<string> {
  const directory = path.join(process.cwd(), `.dreamer-app-test-${randomUUID()}`)
  await mkdir(directory, { recursive: true })
  directories.push(directory)
  return directory
}

afterEach(async () => {
  await Promise.all(runtimes.splice(0).map((runtime) => runtime.app.close()))
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
  vi.unstubAllEnvs()
})

describe('Dreamer app integration', () => {
  it('registers an available Dreamer route beside the normal hub', async () => {
    vi.stubEnv('AGENTIC_REMOTE_MANAGER', '')
    vi.stubEnv('AGENTIC_REMOTE_MANAGER_STRUCTURED_MEMORY', 'off')
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'https://hub.example.test')
    const runtime = await buildApp({
      dataDirectory: await dataDirectory(),
      logger: false,
      transcriptionService: {
        initialize: async () => undefined,
        stop: async () => undefined,
        transcribe: vi.fn(),
      },
    })
    runtimes.push(runtime)
    const response = await runtime.app.inject({
      url: '/api/manager/dreamer',
      headers: trusted,
    })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      available: true,
      settings: { enabled: false, timeZone: 'UTC' },
      tasks: [],
    })
    expect(runtime.proactiveCoordinator?.isEnabled()).toBe(false)

    const enabled = await runtime.app.inject({
      method: 'PUT',
      url: '/api/manager/dreamer/settings',
      headers: trusted,
      payload: {
        revision: response.json().revision,
        enabled: true,
        timeZone: 'UTC',
      },
    })
    expect(enabled.statusCode).toBe(200)
    expect(runtime.proactiveCoordinator?.isEnabled()).toBe(true)
  })

  it('keeps the hub available when Oracle/Dreamer storage is unavailable', async () => {
    vi.stubEnv('AGENTIC_REMOTE_MANAGER', 'off')
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'https://hub.example.test')
    const runtime = await buildApp({
      dataDirectory: await dataDirectory(),
      logger: false,
      managerAgent: false,
      transcriptionService: {
        initialize: async () => undefined,
        stop: async () => undefined,
        transcribe: vi.fn(),
      },
    })
    runtimes.push(runtime)
    const health = await runtime.app.inject({ url: '/health' })
    expect(health.statusCode).toBe(200)
    const response = await runtime.app.inject({
      url: '/api/manager/dreamer',
      headers: trusted,
    })
    expect(response.statusCode).toBe(503)
  })
})
