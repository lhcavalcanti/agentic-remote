import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ManagerMessage } from '../shared/manager.js'
import { buildApp } from './app.js'

const trusted = { host: 'hub.example.test', origin: 'https://hub.example.test' }
let directory: string
let runtime: Awaited<ReturnType<typeof buildApp>> | undefined

async function build() {
  runtime = await buildApp({
    dataDirectory: directory,
    logger: false,
    transcriptionService: {
      initialize: async () => undefined,
      stop: async () => undefined,
      transcribe: vi.fn(),
    },
  })
  return runtime
}

beforeEach(async () => {
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'https://hub.example.test')
  vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', '')
  vi.stubEnv('AGENTIC_REMOTE_MANAGER', '')
  directory = await mkdtemp(path.join(tmpdir(), 'agentic-manager-routes-'))
})

afterEach(async () => {
  await runtime?.app.close()
  runtime = undefined
  if (directory) await rm(directory, { recursive: true, force: true })
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('manager routes', () => {
  it('serves the manager snapshot and keeps its files under the data folder', async () => {
    const { app } = await build()
    const response = await app.inject({ url: '/api/manager', headers: trusted })
    expect(response.statusCode).toBe(200)
    expect(response.headers['cache-control']).toBe('no-store')
    expect(response.json()).toMatchObject({ available: true, status: 'idle', messages: [], queued: 0, managedSessions: [] })
    expect((await stat(path.join(directory, 'manager', 'memory'))).isDirectory()).toBe(true)
  })

  it('accepts a message for the queue with the browser defaults', async () => {
    const { app, managerAgent } = await build()
    const queued: ManagerMessage = { id: 'm1', role: 'user', content: 'What is running?', createdAt: 't', state: 'queued' }
    const send = vi.spyOn(managerAgent!, 'send').mockResolvedValue(queued)
    const response = await app.inject({
      method: 'POST',
      url: '/api/manager/messages',
      headers: trusted,
      payload: {
        content: 'What is running?',
        defaults: { computerId: 'hub', mode: 'autopilot', folders: { hub: '~/src' }, ignored: true },
      },
    })
    expect(response.statusCode).toBe(202)
    expect(response.json()).toEqual({ message: queued })
    expect(send).toHaveBeenCalledWith('What is running?', { computerId: 'hub', mode: 'autopilot', folders: { hub: '~/src' } })
  })

  it('refuses a blank message and malformed defaults without queueing', async () => {
    const { app } = await build()
    const blank = await app.inject({ method: 'POST', url: '/api/manager/messages', headers: trusted, payload: { content: '  ' } })
    expect(blank.statusCode).toBe(400)
    expect(blank.json().error).toBe('Type a message first.')
    const malformed = await app.inject({
      method: 'POST', url: '/api/manager/messages', headers: trusted,
      payload: { content: 'hi', defaults: { mode: 'yolo' } },
    })
    expect(malformed.statusCode).toBe(400)
  })

  it('applies the hub origin policy', async () => {
    const { app, managerAgent } = await build()
    const send = vi.spyOn(managerAgent!, 'send')
    const response = await app.inject({
      method: 'POST', url: '/api/manager/messages',
      headers: { host: 'hub.example.test', origin: 'https://attacker.example.test' },
      payload: { content: 'hi' },
    })
    expect(response.statusCode).toBe(403)
    expect(send).not.toHaveBeenCalled()
  })

  it('retries, cancels, and resets', async () => {
    const { app, managerAgent } = await build()
    const retry = vi.spyOn(managerAgent!, 'retry').mockResolvedValue({ id: 'm1', role: 'user', content: 'x', createdAt: 't', state: 'queued' })
    const cancel = vi.spyOn(managerAgent!, 'cancel').mockResolvedValue()
    const reset = vi.spyOn(managerAgent!, 'reset').mockResolvedValue()
    expect((await app.inject({ method: 'POST', url: '/api/manager/messages/m1/retry', headers: trusted })).statusCode).toBe(200)
    expect(retry).toHaveBeenCalledWith('m1')
    expect((await app.inject({ method: 'POST', url: '/api/manager/cancel', headers: trusted })).statusCode).toBe(204)
    expect(cancel).toHaveBeenCalled()
    const resetResponse = await app.inject({ method: 'POST', url: '/api/manager/reset', headers: trusted })
    expect(resetResponse.statusCode).toBe(200)
    expect(resetResponse.json()).toMatchObject({ available: true })
    expect(reset).toHaveBeenCalled()
  })

  it('takes your answer to a confirmation', async () => {
    const { app, managerAgent } = await build()
    const resolve = vi.spyOn(managerAgent!, 'resolveConfirmation').mockResolvedValue({
      id: 'a1', role: 'activity', content: 'Close?', createdAt: 't',
      confirmation: { kind: 'close-session', computerId: 'hub', sessionId: 's1', title: 'S', state: 'declined' },
    })
    const response = await app.inject({
      method: 'POST', url: '/api/manager/messages/a1/confirmation', headers: trusted, payload: { accept: false },
    })
    expect(response.statusCode).toBe(200)
    expect(resolve).toHaveBeenCalledWith('a1', false)
    const invalid = await app.inject({
      method: 'POST', url: '/api/manager/messages/a1/confirmation', headers: trusted, payload: { accept: 'yes' },
    })
    expect(invalid.statusCode).toBe(400)
  })

  it('keeps the hub running when the manager cannot start', async () => {
    await writeFile(path.join(directory, 'manager'), 'not a folder')
    const { app, managerAgent } = await build()
    expect(managerAgent).toBeUndefined()
    const snapshot = await app.inject({ url: '/api/manager', headers: trusted })
    expect(snapshot.json()).toMatchObject({ available: false, unavailableReason: expect.stringContaining('could not start') })
    expect((await app.inject({ url: '/api/computers', headers: trusted })).statusCode).toBe(200)
  })

  it('reports a missing message to retry as not found', async () => {
    const { app } = await build()
    await app.ready()
    const response = await app.inject({ method: 'POST', url: '/api/manager/messages/nope/retry', headers: trusted })
    expect(response.statusCode).toBe(404)
  })

  it('carries manager events on the hub event socket', async () => {
    const { app, managerAgent } = await build()
    await app.ready()
    const socket = await app.injectWS('/api/events', { headers: trusted })
    const received = new Promise<unknown>((resolve) => {
      socket.on('message', (data: Buffer) => resolve(JSON.parse(data.toString())))
    })
    managerAgent!.emit('event', { type: 'manager.delta', messageId: 'r1', content: 'Hel' })
    expect(await received).toEqual({ type: 'manager.delta', messageId: 'r1', content: 'Hel' })
    socket.terminate()
  })

  it('says why when the manager is turned off', async () => {
    vi.stubEnv('AGENTIC_REMOTE_MANAGER', 'off')
    const { app, managerAgent } = await build()
    expect(managerAgent).toBeUndefined()
    const snapshot = await app.inject({ url: '/api/manager', headers: trusted })
    expect(snapshot.json()).toMatchObject({ available: false, unavailableReason: expect.stringContaining('AGENTIC_REMOTE_MANAGER=off') })
    const send = await app.inject({ method: 'POST', url: '/api/manager/messages', headers: trusted, payload: { content: 'hi' } })
    expect(send.statusCode).toBe(503)
  })
})
