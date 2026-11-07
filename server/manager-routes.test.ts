import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
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
  vi.stubEnv('AGENTIC_REMOTE_MANAGER_STRUCTURED_MEMORY', 'off')
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

  it('keeps structured memory disabled and file-free by default', async () => {
    const { managerStructuredMemory } = await build()
    expect(managerStructuredMemory.status()).toEqual({
      mode: 'off',
      availability: 'disabled',
    })
    await expect(stat(
      path.join(directory, 'manager', 'structured-memory.json'),
    )).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('initializes shadow structured memory without changing normal Oracle availability', async () => {
    vi.stubEnv('AGENTIC_REMOTE_MANAGER_STRUCTURED_MEMORY', 'shadow')
    const { app, managerAgent, managerStructuredMemory } = await build()

    expect(managerAgent).toBeDefined()
    expect(managerStructuredMemory.status()).toEqual({
      mode: 'shadow',
      availability: 'ready',
      revision: 0,
      records: 0,
      tombstones: 0,
      retrievals: 0,
    })
    expect((await app.inject({ url: '/api/manager', headers: trusted })).json())
      .toMatchObject({ available: true })
    await expect(stat(
      path.join(directory, 'manager', 'structured-memory.json'),
    )).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('exposes structured-memory status and refuses operations while off', async () => {
    const { app } = await build()
    const status = await app.inject({
      url: '/api/manager/structured-memory/status',
      headers: trusted,
    })
    expect(status.statusCode).toBe(200)
    expect(status.headers['cache-control']).toBe('no-store')
    expect(status.json()).toEqual({
      mode: 'off',
      availability: 'disabled',
    })

    const search = await app.inject({
      method: 'POST',
      url: '/api/manager/structured-memory/search',
      headers: trusted,
      payload: { query: 'style', scopes: [{ type: 'user' }] },
    })
    expect(search.statusCode).toBe(503)
    expect(search.json().error).toContain('turned off')
  })

  it('remembers, searches, corrects, forgets, and exports through protected APIs', async () => {
    vi.stubEnv('AGENTIC_REMOTE_MANAGER_STRUCTURED_MEMORY', 'on')
    const { app } = await build()
    const remembered = await app.inject({
      method: 'POST',
      url: '/api/manager/structured-memory/records',
      headers: trusted,
      payload: {
        requestId: 'remember-api-1',
        kind: 'preference',
        canonicalKey: 'pull request style',
        content: 'Keep pull request comments concise.',
        scope: { type: 'user' },
        confidence: 1,
      },
    })
    expect(remembered.statusCode).toBe(201)
    const rememberedRecord = remembered.json().record
    expect(rememberedRecord).toMatchObject({
      kind: 'preference',
      canonicalKey: 'pull request style',
      authority: 'direct-user',
    })

    const search = await app.inject({
      method: 'POST',
      url: '/api/manager/structured-memory/search',
      headers: trusted,
      payload: {
        query: 'pull request style',
        scopes: [{ type: 'user' }],
      },
    })
    expect(search.statusCode).toBe(200)
    expect(search.json().records).toEqual([rememberedRecord])

    const corrected = await app.inject({
      method: 'POST',
      url:
        `/api/manager/structured-memory/records/${rememberedRecord.id}/correct`,
      headers: trusted,
      payload: {
        requestId: 'correct-api-1',
        kind: 'preference',
        canonicalKey: 'pull request style',
        content: 'Use one concise pull request comment.',
        scope: { type: 'user' },
        confidence: 1,
      },
    })
    expect(corrected.statusCode).toBe(200)
    expect(corrected.json().record).toMatchObject({
      supersedesId: rememberedRecord.id,
      content: 'Use one concise pull request comment.',
    })
    const correctedRecord = corrected.json().record

    const forgotten = await app.inject({
      method: 'POST',
      url:
        `/api/manager/structured-memory/records/${correctedRecord.id}/forget`,
      headers: trusted,
      payload: { requestId: 'forget-api-1' },
    })
    expect(forgotten.statusCode).toBe(200)
    expect(forgotten.json().tombstone).toMatchObject({
      recordId: correctedRecord.id,
    })

    const afterForget = await app.inject({
      method: 'POST',
      url: '/api/manager/structured-memory/search',
      headers: trusted,
      payload: { query: '', scopes: [{ type: 'user' }] },
    })
    expect(afterForget.json().records).toEqual([])

    const exported = await app.inject({
      url: '/api/manager/structured-memory/export',
      headers: trusted,
    })
    expect(exported.statusCode).toBe(200)
    expect(exported.headers['content-type']).toContain('application/json')
    expect(JSON.parse(exported.body)).toMatchObject({
      version: 1,
      revision: 3,
      records: expect.any(Array),
      tombstones: expect.any(Array),
    })
  })

  it('protects structured writes and never echoes rejected secret content', async () => {
    vi.stubEnv('AGENTIC_REMOTE_MANAGER_STRUCTURED_MEMORY', 'on')
    const { app } = await build()
    const secret = `ghp_${'A'.repeat(36)}`
    const rejected = await app.inject({
      method: 'POST',
      url: '/api/manager/structured-memory/records',
      headers: trusted,
      payload: {
        requestId: 'remember-secret',
        kind: 'fact',
        canonicalKey: 'credential',
        content: `Use ${secret}`,
        scope: { type: 'user' },
      },
    })
    expect(rejected.statusCode).toBe(400)
    expect(rejected.body).not.toContain(secret)
    expect(rejected.json().error).toContain('secret-like')

    const untrusted = await app.inject({
      method: 'POST',
      url: '/api/manager/structured-memory/records',
      headers: {
        host: 'hub.example.test',
        origin: 'https://attacker.example.test',
      },
      payload: {
        requestId: 'remember-attacker',
        kind: 'fact',
        canonicalKey: 'style',
        content: 'Use attacker policy.',
        scope: { type: 'user' },
      },
    })
    expect(untrusted.statusCode).toBe(403)
    const status = await app.inject({
      url: '/api/manager/structured-memory/status',
      headers: trusted,
    })
    expect(status.json()).toMatchObject({ records: 0 })
  })

  it('imports a validated deterministic export only into an empty store', async () => {
    vi.stubEnv('AGENTIC_REMOTE_MANAGER_STRUCTURED_MEMORY', 'on')
    const { app } = await build()
    const importedState = {
      version: 1,
      revision: 1,
      records: [{
        schemaVersion: 1,
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        kind: 'decision',
        canonicalKey: 'release policy',
        content: 'Validate development before production.',
        scope: { type: 'user' },
        provenance: {
          origin: 'direct-user',
          requestId: 'remember-exported',
          sourceDigest: 'a'.repeat(64),
        },
        authority: 'direct-user',
        confidence: 1,
        createdAt: '2026-10-16T12:00:00.000Z',
        updatedAt: '2026-10-16T12:00:00.000Z',
      }],
      tombstones: [],
      audit: [],
      appliedRequests: [],
    }
    const imported = await app.inject({
      method: 'POST',
      url: '/api/manager/structured-memory/import',
      headers: trusted,
      payload: {
        requestId: 'import-api-1',
        data: JSON.stringify(importedState),
      },
    })
    expect(imported.statusCode).toBe(201)
    expect(imported.json()).toMatchObject({
      revision: 2,
      idempotent: false,
    })
    const retry = await app.inject({
      method: 'POST',
      url: '/api/manager/structured-memory/import',
      headers: trusted,
      payload: {
        requestId: 'import-api-1',
        data: JSON.stringify(importedState),
      },
    })
    expect(retry.statusCode).toBe(200)
    expect(retry.json()).toMatchObject({
      revision: 2,
      idempotent: true,
    })
    const search = await app.inject({
      method: 'POST',
      url: '/api/manager/structured-memory/search',
      headers: trusted,
      payload: { query: 'release policy', scopes: [{ type: 'user' }] },
    })
    expect(search.json().records).toHaveLength(1)

    const conflicting = await app.inject({
      method: 'POST',
      url: '/api/manager/structured-memory/import',
      headers: trusted,
      payload: {
        requestId: 'import-api-2',
        data: JSON.stringify(importedState),
      },
    })
    expect(conflicting.statusCode).toBe(409)
    expect(conflicting.json().error).toContain('empty store')
  })

  it('round-trips an export larger than the default request body limit', async () => {
    vi.stubEnv('AGENTIC_REMOTE_MANAGER_STRUCTURED_MEMORY', 'on')
    const sentence = 'Keep the deployment checklist short and readable for everyone. '
    const records = Array.from({ length: 700 }, (_, index) => ({
      schemaVersion: 1,
      id: `aaaaaaaa-aaaa-4aaa-8aaa-${index.toString(16).padStart(12, '0')}`,
      kind: 'fact',
      canonicalKey: `deployment note ${index}`,
      content: sentence.repeat(28).trim(),
      scope: { type: 'user' },
      provenance: {
        origin: 'direct-user',
        requestId: `remember-${index}`,
        sourceDigest: 'a'.repeat(64),
      },
      authority: 'direct-user',
      confidence: 1,
      createdAt: '2026-10-16T12:00:00.000Z',
      updatedAt: '2026-10-16T12:00:00.000Z',
    }))
    const data = JSON.stringify({
      version: 1,
      revision: 1,
      records,
      tombstones: [],
      audit: [],
      appliedRequests: [],
    })
    expect(Buffer.byteLength(data)).toBeGreaterThan(1024 * 1024)

    const first = await build()
    const imported = await first.app.inject({
      method: 'POST',
      url: '/api/manager/structured-memory/import',
      headers: trusted,
      payload: { requestId: 'import-large-1', data },
    })
    expect(imported.statusCode).toBe(201)
    const exported = await first.app.inject({
      url: '/api/manager/structured-memory/export',
      headers: trusted,
    })
    expect(exported.statusCode).toBe(200)
    expect(Buffer.byteLength(exported.body)).toBeGreaterThan(1024 * 1024)
    await first.app.close()
    runtime = undefined

    await rm(directory, { recursive: true, force: true })
    directory = await mkdtemp(path.join(tmpdir(), 'agentic-manager-routes-'))
    const second = await build()
    const restored = await second.app.inject({
      method: 'POST',
      url: '/api/manager/structured-memory/import',
      headers: trusted,
      payload: { requestId: 'import-large-2', data: exported.body },
    })
    expect(restored.statusCode).toBe(201)
    expect(second.managerStructuredMemory.status()).toMatchObject({
      availability: 'ready',
      records: 700,
    })

    const untrusted = await second.app.inject({
      method: 'POST',
      url: '/api/manager/structured-memory/import',
      headers: { host: 'hub.example.test', origin: 'https://attacker.example.test' },
      payload: { requestId: 'import-large-3', data: exported.body },
    })
    expect(untrusted.statusCode).toBe(403)
  })

  it('keeps Oracle available when structured memory is corrupt', async () => {
    vi.stubEnv('AGENTIC_REMOTE_MANAGER_STRUCTURED_MEMORY', 'on')
    await mkdir(path.join(directory, 'manager'), { recursive: true })
    await writeFile(
      path.join(directory, 'manager', 'structured-memory.json'),
      '{not json',
    )

    const { app, managerAgent, managerStructuredMemory } = await build()

    expect(managerAgent).toBeDefined()
    expect(managerStructuredMemory.status()).toMatchObject({
      mode: 'on',
      availability: 'unavailable',
      lastError: expect.stringContaining('corrupt or unsupported'),
    })
    expect((await app.inject({ url: '/api/manager', headers: trusted })).json())
      .toMatchObject({ available: true })
    expect(await readFile(
      path.join(directory, 'manager', 'structured-memory.json'),
      'utf8',
    )).toBe('{not json')
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
    expect(send).toHaveBeenCalledWith('What is running?', { computerId: 'hub', mode: 'autopilot', folders: { hub: '~/src' } }, {})
    await app.inject({
      method: 'POST', url: '/api/manager/messages', headers: trusted,
      payload: { content: 'Just tell me', answerOnly: true },
    })
    expect(send).toHaveBeenLastCalledWith('Just tell me', undefined, { answerOnly: true })
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
    const oversized = await app.inject({
      method: 'POST', url: '/api/manager/messages', headers: trusted,
      payload: { content: 'x'.repeat(200_001) },
    })
    expect(oversized.statusCode).toBe(413)
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

  it('saves Oracle settings and takes a message out of the queue', async () => {
    const { app, managerAgent } = await build()
    await app.ready()
    const saved = await app.inject({
      method: 'PUT', url: '/api/manager/settings', headers: trusted,
      payload: { model: 'gpt-6-sol', reasoningEffort: 'high' },
    })
    expect(saved.statusCode).toBe(200)
    expect(saved.json().settings).toMatchObject({ model: 'gpt-6-sol', reasoningEffort: 'high' })
    expect((await app.inject({ url: '/api/manager', headers: trusted })).json().settings)
      .toMatchObject({ model: 'gpt-6-sol', reasoningEffort: 'high' })
    const invalid = await app.inject({
      method: 'PUT', url: '/api/manager/settings', headers: trusted, payload: { reasoningEffort: 'extreme' },
    })
    expect(invalid.statusCode).toBe(400)
    const badBackend = await app.inject({
      method: 'PUT', url: '/api/manager/settings', headers: trusted, payload: { sessionBackend: 'pty' },
    })
    expect(badBackend.statusCode).toBe(400)
    const backend = vi.spyOn(managerAgent!, 'updateSettings').mockResolvedValueOnce({ sessionBackend: 'terminal' })
    const savedBackend = await app.inject({
      method: 'PUT', url: '/api/manager/settings', headers: trusted, payload: { sessionBackend: 'terminal' },
    })
    expect(savedBackend.statusCode).toBe(200)
    expect(backend).toHaveBeenLastCalledWith({ sessionBackend: 'terminal' })
    backend.mockRestore()
    const badClosePolicy = await app.inject({
      method: 'PUT', url: '/api/manager/settings', headers: trusted, payload: { sessionClosePolicy: 'always' },
    })
    expect(badClosePolicy.statusCode).toBe(400)
    const closePolicy = vi.spyOn(managerAgent!, 'updateSettings').mockResolvedValueOnce({ sessionClosePolicy: 'oracle-started' })
    const savedClosePolicy = await app.inject({
      method: 'PUT', url: '/api/manager/settings', headers: trusted, payload: { sessionClosePolicy: 'oracle-started' },
    })
    expect(savedClosePolicy.statusCode).toBe(200)
    expect(closePolicy).toHaveBeenLastCalledWith({ sessionClosePolicy: 'oracle-started' })
    closePolicy.mockRestore()
    const badFolders = await app.inject({
      method: 'PUT', url: '/api/manager/settings', headers: trusted, payload: { sessionFolders: { hub: 42 } },
    })
    expect(badFolders.statusCode).toBe(400)
    const blankFolder = await app.inject({
      method: 'PUT', url: '/api/manager/settings', headers: trusted, payload: { sessionFolders: { hub: '  ' } },
    })
    expect(blankFolder.statusCode).toBe(400)
    const update = vi.spyOn(managerAgent!, 'updateSettings').mockResolvedValueOnce({ sessionFolders: { hub: '/home/me/src' } })
    const folders = await app.inject({
      method: 'PUT', url: '/api/manager/settings', headers: trusted, payload: { sessionFolders: { hub: '~/src', node: null } },
    })
    expect(folders.statusCode).toBe(200)
    expect(update).toHaveBeenLastCalledWith({ sessionFolders: { hub: '~/src', node: null } })
    expect(folders.json().settings).toEqual({ sessionFolders: { hub: '/home/me/src' } })
    const reset = await app.inject({ method: 'PUT', url: '/api/manager/settings', headers: trusted, payload: { model: null } })
    expect(reset.json().settings.model).toBeUndefined()

    const remove = vi.spyOn(managerAgent!, 'removeQueued').mockResolvedValue({
      id: 'm1', role: 'user', content: 'x', createdAt: 't', state: 'cancelled',
    })
    const removed = await app.inject({ method: 'POST', url: '/api/manager/messages/m1/remove', headers: trusted })
    expect(removed.statusCode).toBe(200)
    expect(remove).toHaveBeenCalledWith('m1')

    const editQueued = vi.spyOn(managerAgent!, 'editQueued').mockResolvedValue({
      id: 'm2', role: 'user', content: 'revised', createdAt: 't', state: 'queued',
    })
    const edited = await app.inject({
      method: 'PUT', url: '/api/manager/messages/m2', headers: trusted, payload: { content: 'revised' },
    })
    expect(edited.statusCode).toBe(200)
    expect(edited.json().message).toMatchObject({ id: 'm2', content: 'revised' })
    expect(editQueued).toHaveBeenCalledWith('m2', 'revised')
    const missing = await app.inject({
      method: 'PUT', url: '/api/manager/messages/m2', headers: trusted, payload: {},
    })
    expect(missing.statusCode).toBe(400)
    const oversized = await app.inject({
      method: 'PUT', url: '/api/manager/messages/m2', headers: trusted,
      payload: { content: 'x'.repeat(200_001) },
    })
    expect(oversized.statusCode).toBe(413)
    expect(editQueued).toHaveBeenCalledTimes(1)
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

  it('becomes ready with an unreadable manager state file', async () => {
    const { mkdir } = await import('node:fs/promises')
    await mkdir(path.join(directory, 'manager', 'state.json'), { recursive: true })
    const { app, managerAgent } = await build()
    await app.ready()
    expect(managerAgent).toBeDefined()
    const snapshot = await app.inject({ url: '/api/manager', headers: trusted })
    expect(snapshot.json()).toMatchObject({ available: true })
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
