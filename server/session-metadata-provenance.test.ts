import { mkdir, mkdtemp, readFile, rm, rmdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { SessionStore } from './session-store.js'

const directories: string[] = []
const timestamp = '2026-09-06T00:00:00.000Z'

async function fixture() {
  const directory = await mkdtemp(path.join(tmpdir(), 'metadata-provenance-'))
  directories.push(directory)
  const store = new SessionStore(directory)
  await store.initialize()
  await store.create({
    id: 'session', cwd: '/project', title: 'Project', updatedAt: timestamp,
    status: 'idle', isOpen: true, messages: [],
  }, { backend: 'sdk', managedOpen: true })
  return {
    store, directory,
    persisted: async () => JSON.parse(await readFile(path.join(directory, 'state.json'), 'utf8')).sessions.session,
  }
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

const channels = ['cwd', 'title', 'workspace'] as const
function observe(store: SessionStore, channel: typeof channels[number], at: string) {
  if (channel === 'cwd') return store.updateWorkingDirectory('session', '/project', at)
  if (channel === 'title') return store.updateAutomaticTitle('session', 'Project', at)
  return store.syncWorkspaceMetadata('session', { cwd: '/project', title: 'Project', updatedAt: at })
}

describe('Authoritative metadata provenance', () => {
  it.each(channels)('records equal-text %s authority before stale discovery', async (channel) => {
    const { store, directory, persisted } = await fixture()
    await observe(store, channel, timestamp)
    const disk = await persisted()
    if (channel !== 'title') expect(disk.contextCwd).toBe(true)
    if (channel !== 'cwd') expect(disk.workspaceTitle).toBe(true)
    const reloaded = new SessionStore(directory)
    await reloaded.initialize()
    await reloaded.syncDiscovered([{
      id: 'session', cwd: '/stale-index', title: 'Stale indexed title',
      updatedAt: '2026-09-06T01:00:00.000Z',
    }])
    if (channel !== 'title') expect(reloaded.get('session')?.cwd).toBe('/project')
    if (channel !== 'cwd') expect(reloaded.get('session')?.title).toBe('Project')
  })

  it.each(channels)('retains %s recency without requiring a text change', async (channel) => {
    const { store } = await fixture()
    await observe(store, channel, timestamp)
    await observe(store, channel, '2026-09-06T01:00:00.000Z')
    expect(store.get('session')?.updatedAt).toBe('2026-09-06T01:00:00.000Z')
  })

  it.each(channels)('does not regress recency when equal-text %s authority arrives late', async (channel) => {
    const { store, persisted } = await fixture()
    await observe(store, channel, '2026-09-05T23:00:00.000Z')
    expect(store.get('session')?.updatedAt).toBe(timestamp)
    const disk = await persisted()
    if (channel !== 'title') expect(disk.contextCwd).toBe(true)
    if (channel !== 'cwd') expect(disk.workspaceTitle).toBe(true)
  })

  it.each(channels)('does not leak refused %s provenance into later discovery', async (channel) => {
    const { store, directory } = await fixture()
    const blocked = path.join(directory, 'state.json.tmp')
    await mkdir(blocked)
    await expect(observe(store, channel, timestamp)).rejects.toMatchObject({ code: 'EISDIR' })
    await rmdir(blocked)
    await store.syncDiscovered([{
      id: 'session', cwd: '/indexed', title: 'Indexed title', updatedAt: timestamp,
    }])
    expect(store.get('session')).toMatchObject({ cwd: '/indexed', title: 'Indexed title' })
  })

  it('does not use automatic metadata to claim or replace a custom title', async () => {
    const { store, persisted } = await fixture()
    await store.renameSession('session', 'My title')
    const before = store.get('session')
    await store.updateAutomaticTitle('session', 'My title', '2099-01-01T00:00:00.000Z')
    await store.syncWorkspaceMetadata('session', { title: 'Ignored automatic title' })
    expect(store.get('session')).toEqual(before)
    expect((await persisted()).workspaceTitle).not.toBe(true)
  })

  it('does not persist an empty workspace observation', async () => {
    const { store, persisted } = await fixture()
    const before = await persisted()
    await store.syncWorkspaceMetadata('session', {})
    expect(await persisted()).toEqual(before)
  })
})
