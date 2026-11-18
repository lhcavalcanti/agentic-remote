import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { lstat, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import Fastify from 'fastify'
import websocket from '@fastify/websocket'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SCHEDULE_WORKTREE_VERSION } from '../shared/schedule-worktrees.js'
import type { RegisteredComputer } from './computer-registry.js'
import type { NodeIdentityStore } from './node-identity.js'
import { registerNodeRoutes } from './node-routes.js'
import { RemoteNodeClient } from './remote-node-client.js'
import { ScheduleWorktreeService } from './schedule-worktrees.js'
import type { SessionService } from './session-service.js'
import type { TranscriptionService } from './transcription-service.js'

const execute = promisify(execFile)
let directory: string
let repository: string
let root: string
let service: ScheduleWorktreeService
const launchId = 'fictional-run'
async function git(folder: string, ...args: string[]) {
  return (await execute('git', ['-C', folder, ...args])).stdout.trim()
}

beforeEach(async () => {
  // Fixtures live in the checkout; allow it explicitly instead of relying on the host's environment.
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ROOTS', process.cwd())
  directory = path.join(process.cwd(), `.schedule-worktrees-${randomUUID()}`)
  repository = path.join(directory, 'repo')
  root = path.join(directory, 'allowed')
  await Promise.all([mkdir(repository, { recursive: true }), mkdir(root, { recursive: true })])
  await git(repository, 'init', '--quiet')
  await git(repository, 'config', 'user.email', 'fixture@example.test')
  await git(repository, 'config', 'user.name', 'Fictional Developer')
  await writeFile(path.join(repository, 'guide.txt'), 'Fictional guide\n')
  await git(repository, 'add', 'guide.txt')
  await git(repository, 'commit', '--quiet', '-m', 'Create fictional guide')
  // Remote reachability, not an actual push or any network operation.
  await git(repository, 'update-ref', 'refs/remotes/fixture/main', 'HEAD')
  service = new ScheduleWorktreeService(directory, [root])
})
afterEach(async () => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  await rm(directory, { recursive: true, force: true })
})

describe('owned schedule worktrees', () => {
  it('allocates only under an explicitly allowed root, with durable idempotent ownership and owner-only state', async () => {
    const record = await service.allocate({ launchId, folder: repository, root })
    expect(record).toMatchObject({ launchId, root, repository, state: 'ready' })
    expect(path.dirname(record.path)).toBe(root)
    expect(await git(record.path, 'rev-parse', '--show-toplevel')).toBe(record.path)
    expect(await git(record.path, 'rev-parse', '--abbrev-ref', 'HEAD')).toBe('HEAD')
    const reopened = new ScheduleWorktreeService(directory, [root])
    expect(await reopened.allocate({ launchId, folder: repository })).toEqual(record)
    expect(await reopened.read(launchId)).toEqual(record)
    const stateDirectory = path.join(directory, 'schedule-worktrees')
    expect((await lstat(stateDirectory)).mode & 0o777).toBe(0o700)
    const files = await readdir(stateDirectory)
    expect(files).toHaveLength(1)
    expect((await lstat(path.join(stateDirectory, files[0]))).mode & 0o777).toBe(0o600)
  })

  it('refuses outside, nested-unapproved, symlink and unconfigured roots without creating worktrees', async () => {
    const outside = path.join(directory, 'outside')
    await mkdir(outside)
    await mkdir(path.join(root, 'nested'))
    await symlink(outside, path.join(directory, 'linked-root'))
    for (const candidate of [outside, path.join(root, 'nested'), path.join(directory, 'linked-root')]) {
      await expect(service.allocate({ launchId, folder: repository, root: candidate })).rejects.toThrow()
    }
    await expect(new ScheduleWorktreeService(directory, []).allocate({ launchId, folder: repository }))
      .rejects.toThrow('explicitly allowed')
    expect(await readdir(outside)).toEqual([])
    expect((await git(repository, 'worktree', 'list', '--porcelain')).match(/worktree /g)).toHaveLength(1)
  })

  it.each(['modified', 'untracked', 'ignored', 'unpushed', 'no-remote'])('defers cleanup with %s work and preserves the ownership record', async (kind) => {
    const record = await service.allocate({ launchId, folder: repository })
    if (kind === 'modified') await writeFile(path.join(record.path, 'guide.txt'), 'Changed guide\n')
    if (kind === 'untracked') await writeFile(path.join(record.path, 'local.txt'), 'Uncommitted draft\n')
    if (kind === 'ignored') {
      await writeFile(path.join(repository, '.git', 'info', 'exclude'), 'local.secret\n')
      await writeFile(path.join(record.path, 'local.secret'), 'Fictional uncommitted private draft\n')
    }
    if (kind === 'unpushed') {
      await writeFile(path.join(record.path, 'guide.txt'), 'New committed guide\n')
      await git(record.path, 'add', 'guide.txt')
      await git(record.path, 'commit', '--quiet', '-m', 'Revise fictional guide')
    }
    if (kind === 'no-remote') await git(repository, 'update-ref', '-d', 'refs/remotes/fixture/main')
    const result = await service.cleanup(launchId)
    expect(result).toMatchObject({ state: 'deferred', reason: expect.stringMatching(['modified', 'untracked', 'ignored'].includes(kind) ? /Uncommitted/ : /Unpushed/) })
    expect(await git(record.path, 'rev-parse', '--show-toplevel')).toBe(record.path)
    expect(await new ScheduleWorktreeService(directory, [root]).read(launchId)).toEqual(result)
  })

  it('refuses the real target of a symlinked configured root', async () => {
    const linked = path.join(directory, 'configured-link')
    await symlink(root, linked)
    const linkedService = new ScheduleWorktreeService(directory, [linked])
    await expect(linkedService.allocate({ launchId, folder: repository, root })).rejects.toThrow('without symbolic links')
    expect(await readdir(root)).toEqual([])
  })

  it('removes clean pushed work without force and retains a durable tombstone', async () => {
    const record = await service.allocate({ launchId, folder: repository })
    expect(await service.cleanup(launchId)).toMatchObject({ state: 'removed' })
    await expect(lstat(record.path)).rejects.toMatchObject({ code: 'ENOENT' })
    expect(await service.cleanup(launchId)).toMatchObject({ state: 'removed' })
    await expect(service.allocate({ launchId, folder: repository })).rejects.toThrow('removed worktree')
  })

  it('fails closed on a replaced root, an unowned destination or corrupted ownership state', async () => {
    const record = await service.allocate({ launchId, folder: repository })
    const other = path.join(directory, 'other')
    await mkdir(other)
    expect(await new ScheduleWorktreeService(directory, [other]).cleanup(launchId)).toMatchObject({ state: 'deferred' })
    expect(await lstat(record.path)).toBeTruthy()
    const ownershipDirectory = path.join(directory, 'schedule-worktrees')
    const [file] = await readdir(ownershipDirectory)
    const saved = await readFile(path.join(ownershipDirectory, file), 'utf8')
    await rm(path.join(ownershipDirectory, file))
    await expect(service.allocate({ launchId, folder: repository })).rejects.toThrow('without an ownership record')
    await writeFile(path.join(ownershipDirectory, file), saved.replace(record.path, outsidePath()))
    await expect(service.cleanup(launchId)).rejects.toThrow('Mismatched worktree')
  })
})

function outsidePath() { return path.join(directory, 'not-owned') }

describe('authenticated worktree node transport', () => {
  async function node() {
    const app = Fastify()
    await app.register(websocket)
    await registerNodeRoutes(app, Object.assign(new EventEmitter(), { providers: () => [] }) as unknown as SessionService,
      { token: 'fictional-node-token', info: { id: 'worker', name: 'Fictional worker', version: 'fixture' } } as NodeIdentityStore,
      {} as TranscriptionService, undefined, undefined, undefined, service)
    await app.ready()
    return app
  }

  it('authenticates allocation, reads and cleanup before touching owner state', async () => {
    const app = await node()
    try {
      for (const [method, url, payload] of [
        ['POST', '/node-api/schedule-worktrees', { launchId, folder: repository }],
        ['GET', `/node-api/schedule-worktrees/${launchId}`, undefined],
        ['POST', `/node-api/schedule-worktrees/${launchId}/cleanup`, {}],
      ] as const) {
        expect((await app.inject({ method, url, ...(payload ? { payload } : {}) })).statusCode).toBe(401)
      }
      expect(await readdir(root)).toEqual([])
      const headers = { authorization: 'Bearer fictional-node-token' }
      expect((await app.inject({ url: '/node-api/info', headers })).json().scheduleWorktrees)
        .toEqual({ version: SCHEDULE_WORKTREE_VERSION, enabled: true })
      const result = await app.inject({ method: 'POST', url: '/node-api/schedule-worktrees', headers, payload: { launchId, folder: repository } })
      expect(result.statusCode).toBe(200)
      const record = result.json().worktree
      expect((await app.inject({ url: `/node-api/schedule-worktrees/${launchId}`, headers })).json().worktree).toEqual(record)
      const cleanup = await app.inject({ method: 'POST', url: `/node-api/schedule-worktrees/${launchId}/cleanup`, headers, payload: {} })
      expect(cleanup.json().worktree.state).toBe('removed')
    } finally { await app.close() }
  })

  it('uses the owner node client for allocation/restart/cleanup and rejects old nodes explicitly', async () => {
    const app = await node()
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
      const response = await app.inject({
        method: (init?.method ?? 'GET') as 'GET' | 'POST', url: new URL(url).pathname,
        headers: Object.fromEntries(new Headers(init?.headers).entries()),
        ...(init?.body ? { payload: String(init.body) } : {}),
      })
      return new Response(response.body, { status: response.statusCode, headers: { 'content-type': 'application/json' } })
    }))
    const client = new RemoteNodeClient({
      id: 'worker', name: 'Fictional worker', baseUrl: 'http://worker.test', token: 'fictional-node-token',
    } as RegisteredComputer)
    try {
      const record = await client.allocateScheduleWorktree({ launchId, folder: repository, root })
      expect(record.root).toBe(root)
      expect(await client.readScheduleWorktree(launchId)).toEqual(record)
      expect(await client.cleanupScheduleWorktree(launchId)).toMatchObject({ state: 'removed' })
      vi.mocked(fetch).mockClear()
      vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ id: 'old', name: 'Old node', version: 'old' }))))
      await expect(client.allocateScheduleWorktree({ launchId: 'old-run', folder: repository })).rejects.toThrow('Update this computer')
      expect(fetch).toHaveBeenCalledTimes(1)
    } finally { client.stop(); await app.close() }
  })
})
