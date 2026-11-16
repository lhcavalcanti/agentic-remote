import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { AddressInfo } from 'node:net'
import type { Options, Query, SDKMessage } from '@anthropic-ai/claude-agent-sdk'
import type { SessionEvent } from '@github/copilot-sdk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { launchIdentitySchema } from '../shared/launch-identity.js'
import type { SessionDetail } from '../shared/contracts.js'
import { buildApp } from './app.js'
import { AgentService, type CopilotClientLike } from './agent-service.js'
import { ClaudeAgentService, type ClaudeSdk } from './claude-agent-service.js'
import { awaitTermination, LaunchCreations } from './launch-identity.js'
import { SessionStore } from './session-store.js'
import { ProviderSessionService } from './provider-session-service.js'
import type { SessionService } from './session-service.js'

const directories: string[] = []
const stores: SessionStore[] = []
const services: ClaudeAgentService[] = []
const apps: Awaited<ReturnType<typeof buildApp>>[] = []
const syntheticTime = '2026-11-14T06:00:00.000Z'

async function directory() {
  const root = path.resolve(`.launch-identity-test-${randomUUID()}`)
  await mkdir(root, { mode: 0o700 })
  directories.push(root)
  return root
}

async function storeAt(root = '') {
  const location = root || await directory()
  const store = new SessionStore(location)
  stores.push(store)
  await store.initialize()
  return { store, location }
}

function session(id = 'session'): SessionDetail {
  return { id, cwd: process.cwd(), title: 'Synthetic launch', status: 'idle', isOpen: true, updatedAt: syntheticTime, messages: [] }
}

function storedProvider(store: SessionStore) {
  return Object.assign(new EventEmitter(), {
    getSession: (id: string) => store.get(id),
    listHistory: () => store.list(),
    deliveryIdentity: (deliveryId: string) => store.deliveryIdentity(deliveryId),
    sendMessage: vi.fn(async (id: string, content: string, enqueue = false,
      _acknowledgesFailure?: string, _replaceDraft?: boolean, deliveryId?: string) =>
      store.acceptIdentifiedPrompt(id, deliveryId!, content, enqueue)),
  })
}

beforeEach(() => {
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ROOTS', process.cwd())
  vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'http://127.0.0.1')
  vi.stubEnv('AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER', '')
})

afterEach(async () => {
  await Promise.all(apps.splice(0).map((runtime) => runtime.app.close()))
  await Promise.all(services.splice(0).map((service) => service.stop()))
  await Promise.all(stores.splice(0).map((store) => store.close()))
  await Promise.all(directories.splice(0).map((root) => rm(root, { recursive: true, force: true })))
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('durable launch identity', () => {
  it('reconciles the public interrupted and recovery status rather than the stored idle projection', async () => {
    const { store, location } = await storeAt()
    await store.create({ ...session(), status: 'running', launchId: 'run' }, { backend: 'sdk', managedOpen: true })
    await store.close()
    const restarted = (await storeAt(location)).store
    expect(restarted.get('session')?.status).toBe('error')
    expect(restarted.reconcileLaunch('run')?.sessionStatus).toBe('error')
    const recovery = await restarted.claimSdkRecovery('session')
    await restarted.settleSdkRecovery('session', recovery.generation, { state: 'waiting-permission' })
    await restarted.update('session', (stored) => {
      stored.status = 'idle'
      stored.pendingPermission = { requestId: 'trust', title: 'Synthetic trust request', options: [] }
    })
    expect(restarted.get('session')?.status).toBe('waiting')
    expect(restarted.reconcileLaunch('run')?.sessionStatus).toBe('waiting')
  })

  it('coalesces creation before returning and finds the session after a lost response and restart', async () => {
    const { store, location } = await storeAt()
    const creations = new LaunchCreations()
    const create = vi.fn(async () => store.create({ ...session(), launchId: 'run:one' }))
    const results = await Promise.all(Array.from({ length: 5 }, () => creations.run(store, 'run:one', create)))
    expect(results.map((entry) => entry.id)).toEqual(Array(5).fill('session'))
    expect(create).toHaveBeenCalledOnce()
    // Discard every response; the next owner only knows the caller's token.
    await store.close()
    const restarted = (await storeAt(location)).store
    expect(restarted.reconcileLaunch('run:one')).toMatchObject({
      sessionId: 'session', sessionStatus: 'idle', receipts: [],
    })
    await expect(new LaunchCreations().run(restarted, 'run:one', create)).resolves.toMatchObject({ id: 'session' })
    expect(create).toHaveBeenCalledOnce()
    expect((await stat(path.join(location, 'state.json'))).mode & 0o777).toBe(0o600)
    expect((await stat(location)).mode & 0o777).toBe(0o700)
  })

  it('commits queue acceptance and its receipt together and never repeats acceptance after restart', async () => {
    const { store, location } = await storeAt()
    await store.create({ ...session(), launchId: 'run' })
    const accepted = await Promise.all(Array.from({ length: 5 }, () =>
      store.acceptIdentifiedPrompt('session', 'delivery:one', 'Root prompt', true)))
    const receipt = accepted[0].promptReceipts![0]
    expect(receipt).toMatchObject({ deliveryId: 'delivery:one', sessionId: 'session', state: 'queued' })
    expect(store.get('session')?.queuedPrompts).toHaveLength(1)
    await store.close()
    const restarted = (await storeAt(location)).store
    expect(restarted.reconcileLaunch('run')?.receipts).toEqual([receipt])
    const retry = await restarted.acceptIdentifiedPrompt('session', 'delivery:one', 'Must not replace the first prompt', true)
    expect(retry.promptReceipts).toEqual([receipt])
    expect(retry.queuedPrompts?.map((prompt) => prompt.content)).toEqual(['Root prompt'])
    await restarted.create(session('other'))
    await expect(restarted.acceptIdentifiedPrompt('other', 'delivery:one', 'Wrong session', true))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: false })
    const { reservation } = await restarted.reserveQueuedPrompt('session', () => true)
    await restarted.beginPrompt('session', 'Root prompt', 'assistant-root', () => true, reservation)
    await restarted.settleSdkQueueAdmission('session', 'assistant-root', true)
    await restarted.settlePromptOutcome('session', 'assistant-root', 'succeeded')
    expect(restarted.reconcileLaunch('run')?.receipts[0]).toMatchObject({
      ...receipt, state: 'delivered', rootTurnId: 'assistant-root', outcome: 'succeeded',
    })
  })

  it('keeps a native acceptance uncertain rather than re-enqueuing it after a crash', async () => {
    const { store, location } = await storeAt()
    await store.create({ ...session(), launchId: 'native' }, { managedOpen: true, backend: 'terminal' })
    const accepted = await store.acceptIdentifiedPrompt('session', 'native-prompt', 'Only once', true)
    await store.claimTerminalQueuedPrompt('session', accepted.queuedPrompts![0], () => true, true)
    await store.close()
    const restarted = (await storeAt(location)).store
    const retried = await restarted.acceptIdentifiedPrompt('session', 'native-prompt', 'Only once', true)
    expect(retried.queuedPrompts).toEqual([])
    expect(retried.failedPrompt?.uncertain).toBe(true)
    expect(restarted.reconcileLaunch('native')?.receipts[0]).toMatchObject({ state: 'accepted' })
  })

  it('retains a deleted launch identity instead of creating another session', async () => {
    const { store, location } = await storeAt()
    await store.create({ ...session(), launchId: 'constructor' })
    await store.remove('session')
    await store.close()
    const restarted = (await storeAt(location)).store
    expect(restarted.reconcileLaunch('constructor')).toMatchObject({ sessionId: 'session', deleted: true })
    const create = vi.fn()
    await expect(new LaunchCreations().run(restarted, 'constructor', create)).rejects.toMatchObject({ statusCode: 409 })
    expect(create).not.toHaveBeenCalled()
    expect(restarted.reconcileLaunch('toString')).toBeUndefined()
  })

  it('reserves deleted launch delivery tokens across restart and bounds their tombstone receipts', async () => {
    const { store, location } = await storeAt()
    await store.create({ ...session(), launchId: 'run' })
    await store.acceptIdentifiedPrompt('session', 'delivery', 'Never repeat', true)
    await store.remove('session')
    await store.close()
    const restarted = (await storeAt(location)).store
    await restarted.create({ ...session('other'), launchId: 'other-run' })
    await expect(restarted.acceptIdentifiedPrompt('other', 'delivery', 'Wrong owner', true))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: false })
    await restarted.update('other', (stored) => {
      stored.promptReceipts = Array.from({ length: 1000 }, (_, index) => ({
        deliveryId: `bounded:${index}`, sessionId: 'other', promptId: `prompt:${index}`, state: 'rejected',
        acceptedAt: new Date(Date.now() + index + 1000).toISOString(),
      }))
    })
    await restarted.remove('other')
    expect(restarted.reconcileLaunch('run')).toMatchObject({ deleted: true, receipts: [] })
    expect(restarted.reconcileLaunch('other-run')?.receipts).toHaveLength(1000)
    await restarted.create(session('third'))
    await expect(restarted.acceptIdentifiedPrompt('third', 'bounded:999', 'Wrong owner', true))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: false })
    await expect(restarted.acceptIdentifiedPrompt('third', 'delivery', 'Evicted detail is not reusable', true))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: false })
    await restarted.close()
    const reloaded = (await storeAt(location)).store
    await expect(reloaded.acceptIdentifiedPrompt('third', 'delivery', 'Still reserved after reload', true))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: false })
  })

  it('reserves deliveries on deleted sessions even without a launch identity', async () => {
    const { store, location } = await storeAt()
    await store.create(session())
    await store.acceptIdentifiedPrompt('session', 'delivery', 'Only once', true)
    await store.remove('session')
    await store.create(session('other'))
    await expect(store.acceptIdentifiedPrompt('other', 'delivery', 'Wrong owner', true))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: false })
    await store.close()
    const restarted = (await storeAt(location)).store
    await expect(restarted.acceptIdentifiedPrompt('other', 'delivery', 'Wrong owner after restart', true))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: false })
  })

  it.each(['copilot', 'claude'] as const)('checks deleted %s delivery ownership across provider stores after reload', async (ownerProvider) => {
    const first = await storeAt()
    const second = await storeAt()
    await first.store.create({ ...session('owner'), provider: ownerProvider, launchId: 'run' })
    await first.store.acceptIdentifiedPrompt('owner', 'constructor', 'Synthetic root', true)
    await first.store.remove('owner')
    await second.store.create({ ...session('other'), provider: ownerProvider === 'copilot' ? 'claude' : 'copilot' })
    await first.store.close()
    await second.store.close()
    const owner = storedProvider((await storeAt(first.location)).store)
    const other = storedProvider((await storeAt(second.location)).store)
    const providers = ownerProvider === 'copilot' ? [owner, other] : [other, owner]
    const aggregate = new ProviderSessionService(providers[0] as unknown as SessionService, providers[1] as unknown as SessionService)
    await expect(aggregate.sendMessage('other', 'Must not run', true, undefined, false, 'constructor'))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: false })
    expect(other.sendMessage).not.toHaveBeenCalled()
    await aggregate.sendMessage('other', 'Fresh root', true, undefined, false, 'fresh')
    expect(other.sendMessage).toHaveBeenCalledOnce()
  })

  it.each([true, false])('backfills legacy ownership but blocks unknown tokens when deleted history may already have been trimmed (launches: %s)', async (hasLaunchHistory) => {
    const { store, location } = await storeAt()
    await store.create({ ...session(), launchId: 'run' })
    await store.acceptIdentifiedPrompt('session', 'forgotten', 'Synthetic root', true)
    await store.remove('session')
    await store.create(session('active'))
    await store.acceptIdentifiedPrompt('active', 'known', 'Known retry', true)
    await store.close()
    const filename = path.join(location, 'state.json')
    const legacy = JSON.parse(await readFile(filename, 'utf8'))
    delete legacy.deliveryOwners
    legacy.launches.run.receipts = []
    if (!hasLaunchHistory) delete legacy.launches
    await writeFile(filename, JSON.stringify(legacy), { mode: 0o600 })
    const migrated = (await storeAt(location)).store
    await expect(migrated.acceptIdentifiedPrompt('active', 'known', 'Do not enqueue twice', true))
      .resolves.toMatchObject({ queuedPrompts: [{ content: 'Known retry' }] })
    for (const token of ['forgotten', 'fresh']) {
      await expect(migrated.acceptIdentifiedPrompt('active', token, 'Cannot prove unused', true))
        .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: false })
    }
    await migrated.close()
    const reloaded = (await storeAt(location)).store
    await expect(reloaded.acceptIdentifiedPrompt('active', 'forgotten', 'Still cannot prove unused', true))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: false })
  })

  it('backfills complete legacy receipts without blocking new deliveries', async () => {
    const { store, location } = await storeAt()
    await store.create(session())
    await store.acceptIdentifiedPrompt('session', 'delivery', 'Original root', true)
    await store.close()
    const filename = path.join(location, 'state.json')
    const legacy = JSON.parse(await readFile(filename, 'utf8'))
    delete legacy.deliveryOwners
    await writeFile(filename, JSON.stringify(legacy), { mode: 0o600 })
    const migrated = (await storeAt(location)).store
    await migrated.acceptIdentifiedPrompt('session', 'delivery', 'Not another root', true)
    await migrated.acceptIdentifiedPrompt('session', 'fresh', 'Fresh root', true)
    expect(migrated.get('session')?.queuedPrompts?.map((prompt) => prompt.content)).toEqual(['Original root', 'Fresh root'])
    await migrated.create(session('other'))
    await expect(migrated.acceptIdentifiedPrompt('other', 'delivery', 'Wrong owner', true))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: false })
  })

  it('accepts identified deliveries from main-format stores with retired and replaced sessions', async () => {
    const makeMainFormat = async (id: string) => {
      const location = await directory()
      await writeFile(path.join(location, 'state.json'), JSON.stringify({
        version: 1,
        retiredSessionIds: [`old-${id}`],
        sessions: { [id]: { ...session(id), replacedSessionIds: [`old-${id}`] } },
      }), { mode: 0o600 })
      return storeAt(location)
    }
    const first = await makeMainFormat('copilot-session')
    const second = await makeMainFormat('claude-session')
    expect(first.store.deliveryIdentity('root').historyComplete).toBe(true)
    expect(second.store.deliveryIdentity('root').historyComplete).toBe(true)
    await expect(first.store.acceptIdentifiedPrompt('copilot-session', 'direct', 'Direct synthetic root', true))
      .resolves.toMatchObject({ promptReceipts: [{ deliveryId: 'direct', state: 'queued' }] })
    const aggregate = new ProviderSessionService(
      storedProvider(first.store) as unknown as SessionService,
      storedProvider(second.store) as unknown as SessionService,
    )
    await expect(aggregate.sendMessage('claude-session', 'Aggregated synthetic root', true, undefined, false, 'root'))
      .resolves.toMatchObject({ promptReceipts: [{ deliveryId: 'root', state: 'queued' }] })
    await first.store.close()
    await second.store.close()
    const reloaded = (await storeAt(first.location)).store
    await expect(reloaded.acceptIdentifiedPrompt('copilot-session', 'after-reload', 'Another synthetic root', true))
      .resolves.toMatchObject({ promptReceipts: [{ deliveryId: 'direct' }, { deliveryId: 'after-reload' }] })
  })

  it.each([null, [], { 'bad/token': 'session' }, { delivery: '' }, { delivery: 'wrong-owner' }])(
    'fails closed on invalid or conflicting delivery ownership metadata %j', async (deliveryOwners) => {
      const { store, location } = await storeAt()
      await store.create(session())
      await store.acceptIdentifiedPrompt('session', 'delivery', 'Synthetic root', true)
      await store.close()
      const filename = path.join(location, 'state.json')
      const saved = JSON.parse(await readFile(filename, 'utf8'))
      saved.deliveryOwners = deliveryOwners
      await writeFile(filename, JSON.stringify(saved), { mode: 0o600 })
      await expect(storeAt(location)).rejects.toThrow('Invalid delivery ownership')
    },
  )

  it('keeps ownership when a session record loses its detailed receipts', async () => {
    const { store, location } = await storeAt()
    await store.create(session())
    await store.acceptIdentifiedPrompt('session', 'delivery', 'Only once', true)
    await store.create(session())
    await expect(store.acceptIdentifiedPrompt('session', 'delivery', 'Do not enqueue again', true))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: false })
    await store.close()
    const reloaded = (await storeAt(location)).store
    await expect(reloaded.acceptIdentifiedPrompt('session', 'delivery', 'Still reserved', true))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: false })
  })

  it('carries launch authority through a conversation replacement and preserves its tombstone receipts', async () => {
    const { store, location } = await storeAt()
    await store.create({ ...session(), launchId: 'run' })
    await store.acceptIdentifiedPrompt('session', 'delivery', 'Never dispatched', true)
    await store.replaceWithClearedSession('session', 'replacement')
    expect(store.reconcileLaunch('run')).toMatchObject({
      sessionId: 'replacement', receipts: [{ sessionId: 'replacement', deliveryId: 'delivery', state: 'rejected' }],
    })
    await store.close()
    const restarted = (await storeAt(location)).store
    expect(restarted.reconcileLaunch('run')?.sessionId).toBe('replacement')
    await restarted.remove('replacement')
    expect(restarted.reconcileLaunch('run')).toMatchObject({
      deleted: true, receipts: [{ deliveryId: 'delivery', state: 'rejected' }],
    })
  })

  it('fails closed on corrupt persisted identity rather than forgetting accepted work', async () => {
    const { store, location } = await storeAt()
    await store.create({ ...session(), launchId: 'run' })
    await store.close()
    const filename = path.join(location, 'state.json')
    const state = JSON.parse(await readFile(filename, 'utf8'))
    state.launches.run.sessionId = 42
    await writeFile(filename, JSON.stringify(state), { mode: 0o600 })
    await expect(storeAt(location)).rejects.toThrow('Invalid launch identity')
  })

  it('keeps identified receipts valid when an otherwise legacy session is replaced', async () => {
    const { store, location } = await storeAt()
    await store.create(session())
    await store.acceptIdentifiedPrompt('session', 'delivery', 'Root', true)
    await store.replaceWithClearedSession('session', 'replacement')
    await store.close()
    const restarted = (await storeAt(location)).store
    expect(restarted.get('replacement')?.promptReceipts).toEqual([
      expect.objectContaining({ sessionId: 'replacement', deliveryId: 'delivery', state: 'rejected' }),
    ])
    await expect(restarted.acceptIdentifiedPrompt('replacement', 'delivery', 'Do not repeat', true))
      .resolves.toMatchObject({ promptReceipts: [{ deliveryId: 'delivery', state: 'rejected' }], queuedPrompts: [] })
  })

  it('settles a cleared queue receipt and prevents recovery submissions from crossing a durable stop fence', async () => {
    const { store } = await storeAt()
    await store.create({ ...session(), launchId: 'run' })
    await store.acceptIdentifiedPrompt('session', 'delivery', 'Never dispatched', true)
    await store.clearConversation('session')
    expect(store.reconcileLaunch('run')?.receipts[0]).toMatchObject({ state: 'rejected', outcome: 'stopped' })
    await store.update('session', (stored) => { stored.failedPrompt = { content: 'Recovery', failedAt: 'token' } })
    await store.stopLaunchWork('session')
    const prompt = { id: 'recovery', content: 'Must not restart', createdAt: syntheticTime }
    await expect(store.enqueueAnsweringPrompt('session', prompt, 'token')).rejects.toMatchObject({ statusCode: 409 })
    await expect(store.claimRecoveryPrompt('session', prompt, 'token', () => true)).rejects.toMatchObject({ statusCode: 409 })
    expect(store.get('session')?.queuedPrompts).toEqual([])
    await store.replaceWithRecoveredSession('session', 'replacement', 'provider-error', 0, false, 'Recovery seed')
    await expect(store.claimRecoverySeed('replacement', 'Recovery seed')).rejects.toMatchObject({ statusCode: 409 })
  })

  it.each([false, true])('records known queue rejection separately from uncertain delivery (%s)', async (uncertain) => {
    const { store } = await storeAt()
    await store.create({ ...session(), launchId: 'run' })
    const accepted = await store.acceptIdentifiedPrompt('session', 'delivery', 'Root', true)
    await store.setFailedPrompt('session', accepted.promptReceipts![0].promptId, 'Root', uncertain)
    expect(store.reconcileLaunch('run')?.receipts[0]).toMatchObject({
      state: uncertain ? 'accepted' : 'rejected', outcome: uncertain ? 'unknown' : 'failed',
    })
  })

  it.each(['', '../run', 'has space', 'a/b', 'a\nb', 'x'.repeat(129)])('rejects invalid opaque identity %j', (identity) => {
    expect(launchIdentitySchema.safeParse(identity).success).toBe(false)
  })
})

describe('termination acknowledgement', () => {
  it.each(['copilot', 'claude'] as const)('blocks %s queue admissions after a refused fence write until a durable retry', async (provider) => {
    const { store } = await storeAt()
    await store.create({ ...session(), launchId: 'run' })
    const accepted = await store.acceptIdentifiedPrompt('session', 'waiting', 'Synthetic follower', true)
    const service = provider === 'copilot'
      ? new AgentService(store, {} as CopilotClientLike)
      : new ClaudeAgentService(store, '/bin/true', {} as ClaudeSdk)
    if (service instanceof AgentService) {
      vi.spyOn(service, 'listBackgroundTasks').mockResolvedValue({ supported: false, tasks: [], runningCount: 0 })
    }
    vi.spyOn(store, 'stopLaunchWork').mockRejectedValueOnce(new Error('Synthetic refused fence'))
    await expect(service.cancelWithAck('session', 1)).rejects.toThrow('Synthetic refused fence')
    await expect(service.sendMessage('session', 'Must not start', true, undefined, false, 'new'))
      .rejects.toMatchObject({ statusCode: 409 })
    await expect(service.dispatchQueuedPrompt('session', accepted.queuedPrompts![0].id, 'Must not start'))
      .rejects.toMatchObject({ statusCode: 409 })
    await expect(service.sendMessage('session', 'Existing receipt only', true, undefined, false, 'waiting'))
      .resolves.toMatchObject({ promptReceipts: [{ deliveryId: 'waiting', state: 'queued' }] })
    expect(store.get('session')?.queuedPrompts).toHaveLength(1)
    await expect(service.cancelWithAck('session', 1)).resolves.toMatchObject({ outcome: 'unknown' })
    expect(store.get('session')).toMatchObject({ launchStopping: true, queuedPrompts: [] })
  })

  it.each(['copilot', 'claude'] as const)('commits the %s fence before starting the provider timeout and rejects failed fence writes', async (provider) => {
    const { store, location } = await storeAt()
    await store.create({ ...session(), launchId: 'run' })
    const service = provider === 'copilot'
      ? new AgentService(store, {} as CopilotClientLike)
      : new ClaudeAgentService(store, '/bin/true', {} as ClaudeSdk)
    if (service instanceof AgentService) {
      vi.spyOn(service, 'listBackgroundTasks').mockResolvedValue({ supported: false, tasks: [], runningCount: 0 })
    }
    let release = () => {}
    const gate = new Promise<void>((resolve) => { release = resolve })
    const stop = store.stopLaunchWork.bind(store)
    vi.spyOn(store, 'stopLaunchWork').mockImplementationOnce(async (id) => {
      await gate
      return stop(id)
    })
    let resolved = false
    const pending = service.cancelWithAck('session', 1).finally(() => { resolved = true })
    await new Promise((resolve) => setTimeout(resolve, 20))
    const returnedBeforeFence = resolved
    release()
    await expect(pending).resolves.toMatchObject({ outcome: 'unknown' })
    expect(returnedBeforeFence).toBe(false)
    vi.mocked(store.stopLaunchWork).mockRejectedValueOnce(new Error('Synthetic fence write failed'))
    await expect(service.cancelWithAck('session', 1)).rejects.toThrow('Synthetic fence write failed')
    await store.close()
    const restarted = (await storeAt(location)).store
    await expect(restarted.acceptIdentifiedPrompt('session', 'late', 'Never admit', true)).rejects.toMatchObject({ statusCode: 409 })
  })

  it('does not use an idle event between acceptance and terminal handoff as termination proof', async () => {
    const { store, location } = await storeAt()
    await store.create({ ...session(), launchId: 'run' }, { backend: 'terminal', managedOpen: true })
    const accepted = await store.acceptIdentifiedPrompt('session', 'root', 'Synthetic root', true)
    const acceptanceTime = Date.parse(accepted.promptReceipts![0].acceptedAt)
    const handedAt = new Date(acceptanceTime + 2000).toISOString()
    const claimed = await store.claimTerminalQueuedPrompt('session', accepted.queuedPrompts![0], () => true, true)
    await store.settleTerminalQueuedPrompt('session', claimed.dispatch.id, {
      kind: 'accepted', startedTurn: true, handedAt,
    })
    await store.close()
    const restarted = (await storeAt(location)).store
    let events = [{
      id: 'old-idle', type: 'session.idle', timestamp: new Date(acceptanceTime + 1000).toISOString(), parentId: null, data: {},
    } as SessionEvent]
    const service = new AgentService(restarted, {} as CopilotClientLike,
      async () => [], async () => undefined, async () => events, undefined,
      { has: async () => false, send: async () => false, cancel: async () => true })
    vi.spyOn(service, 'listBackgroundTasks').mockResolvedValue({ supported: true, tasks: [], runningCount: 0 })
    expect(await service.cancelWithAck('session', 10)).toMatchObject({ outcome: 'unknown' })
    events = [{ ...events[0], id: 'new-idle', timestamp: new Date(acceptanceTime + 3000).toISOString() }]
    expect(await service.cancelWithAck('session', 100)).toMatchObject({ outcome: 'stopped' })
  })

  it('waits for provider evidence, not the abort return, and bounds hung aborts and probes', async () => {
    let stopped = false
    const pending = awaitTermination('session', 1000, async () => {}, async () => stopped)
    let resolved = false
    void pending.then(() => { resolved = true })
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(resolved).toBe(false)
    stopped = true
    await expect(pending).resolves.toMatchObject({ outcome: 'stopped' })
    await expect(awaitTermination('session', 10, () => new Promise(() => {}), async () => true))
      .resolves.toMatchObject({ outcome: 'unknown' })
    await expect(awaitTermination('session', 10, async () => {}, () => new Promise(() => {})))
      .resolves.toMatchObject({ outcome: 'unknown' })
  })

  it.each(['sdk', 'terminal'] as const)('requires foreground and background proof for %s and durably rejects queued followers', async (backend) => {
    const { store } = await storeAt()
    await store.create({ ...session(), launchId: 'run' }, { backend, managedOpen: true })
    await store.acceptIdentifiedPrompt('session', 'waiting', 'Never run', true)
    let events: SessionEvent[] = []
    const service = new AgentService(store, {} as CopilotClientLike,
      async () => [], async () => undefined, async () => events, undefined,
      { has: async () => false, send: async () => false, cancel: async () => backend === 'terminal' })
    const tasks = vi.spyOn(service, 'listBackgroundTasks').mockResolvedValue({
      supported: true, tasks: [], runningCount: 0,
    })
    expect((await service.cancelWithAck('session', 10)).outcome).toBe('unknown')
    events = [{ id: 'idle', type: 'session.idle', timestamp: syntheticTime, parentId: null, data: {} } as SessionEvent]
    expect((await service.cancelWithAck('session', 100)).outcome).toBe('stopped')
    expect(store.reconcileLaunch('run')?.termination).toMatchObject({ outcome: 'stopped', scope: 'provider-owned' })
    expect(store.reconcileLaunch('run')?.receipts[0]).toMatchObject({ state: 'rejected', outcome: 'stopped' })
    events = [{ id: 'failed', type: 'session.error', timestamp: syntheticTime, parentId: null, data: { message: 'Synthetic terminal error' } } as SessionEvent]
    expect((await service.cancelWithAck('session', 100)).outcome).toBe('stopped')
    tasks.mockResolvedValue({ supported: false, tasks: [], runningCount: 0 })
    expect((await service.cancelWithAck('session', 10)).outcome).toBe('unknown')
    await expect(store.acceptIdentifiedPrompt('session', 'new', 'No new work', true))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(store.get('session')?.queuedPrompts).toEqual([])
  })
})

async function claudeOwner(root: string, run?: (options?: Options) => AsyncGenerator<SDKMessage>) {
  const prompts: string[] = []
  const sdk: ClaudeSdk = {
    query: (({ prompt, options }: { prompt: unknown; options?: Options }) => {
      const generator = (async function* (): AsyncGenerator<SDKMessage> {
        if (typeof prompt !== 'string') return
        prompts.push(prompt)
        if (run) {
          yield* run(options)
          return
        }
        yield {
          type: 'result', subtype: 'success', is_error: false, session_id: options?.sessionId,
        } as SDKMessage
      })()
      return Object.assign(generator, { supportedModels: async () => [] }) as unknown as Query
    }) as ClaudeSdk['query'],
    getSessionInfo: async () => undefined,
    renameSession: async () => {},
    deleteSession: async () => {},
  }
  const service = new ClaudeAgentService(new SessionStore(path.join(root, 'state')), '/bin/true', sdk, async () => ({ loggedIn: true }))
  services.push(service)
  await service.start()
  return { service, prompts }
}

describe('Claude termination evidence', () => {
  it('keeps cancellation unknown before and after foreground teardown without background-task proof', async () => {
    let release = () => {}
    const gate = new Promise<void>((resolve) => { release = resolve })
    const root = await directory()
    const owner = await claudeOwner(root, async function* (options) {
      await gate
      if (options?.abortController?.signal.aborted) throw new Error('Synthetic abort completed')
    })
    const created = await owner.service.createSession(root, false, false, 'claude', undefined, undefined, undefined, undefined, 'run')
    await owner.service.sendMessage(created.id, 'Root', true, undefined, false, 'root')
    await vi.waitFor(() => expect(owner.prompts).toEqual(['Root']))
    await owner.service.sendMessage(created.id, 'Never start', true, undefined, false, 'follower')
    expect(await owner.service.cancelWithAck(created.id, 10)).toMatchObject({ outcome: 'unknown' })
    release()
    await vi.waitFor(() => expect(owner.service.getSession(created.id)?.status).toBe('idle'))
    expect(await owner.service.cancelWithAck(created.id, 10)).toMatchObject({ outcome: 'unknown' })
    expect((await owner.service.reconcileLaunch('run'))?.termination).toBeUndefined()
    expect((await owner.service.reconcileLaunch('run'))?.receipts).toEqual([
      expect.objectContaining({ deliveryId: 'root', outcome: 'stopped' }),
      expect.objectContaining({ deliveryId: 'follower', state: 'rejected', outcome: 'stopped' }),
    ])
    expect(owner.prompts).toEqual(['Root'])
  })
})

async function runtime(role: 'hub' | 'node', root?: string) {
  const location = root || await directory()
  const owner = await claudeOwner(location)
  const app = await buildApp({
    role, dataDirectory: location, logger: false, service: owner.service,
    transcriptionService: { initialize: async () => {}, stop: async () => {}, transcribe: vi.fn() },
  })
  apps.push(app)
  return { ...app, ...owner, location }
}

describe('owning-computer launch transport', () => {
  it('keeps both ends blocked when cancellation times out during the node fence write', async () => {
    const hub = await runtime('hub')
    const node = await runtime('node')
    await node.app.listen({ host: '127.0.0.1', port: 0 })
    const port = (node.app.server.address() as AddressInfo).port
    const computerId = node.identity.info.id
    await hub.manager!.registerComputer({ baseUrl: `http://127.0.0.1:${port}`, token: node.identity.token })
    await vi.waitFor(() => expect(hub.manager!.listComputers().find((computer) => computer.id === computerId)
      ?.providers?.find((provider) => provider.id === 'claude')?.supportsLaunchIdentity).toBe(true))
    const created = await hub.manager!.createSession(computerId, { cwd: node.location, provider: 'claude', launchId: 'run' })
    await node.service.store.update(created.id, (stored) => { stored.status = 'running' })
    await hub.manager!.sendMessage(computerId, created.id, { content: 'Synthetic follower', enqueue: true, deliveryId: 'follower' })
    let release = () => {}
    let entered = () => {}
    const waiting = new Promise<void>((resolve) => { entered = resolve })
    const gate = new Promise<void>((resolve) => { release = resolve })
    const persistFence = node.service.store.stopLaunchWork.bind(node.service.store)
    vi.spyOn(node.service.store, 'stopLaunchWork').mockImplementationOnce(async (id) => {
      entered()
      await gate
      return persistFence(id)
    })
    const timeout = new AbortController()
    const fetch = globalThis.fetch
    let response: Promise<Response> | undefined
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      if (!String(input).endsWith('/cancel-with-ack')) return fetch(input, init)
      response = fetch(input, init)
      return Promise.race([response, new Promise<Response>((_resolve, reject) => {
        timeout.signal.addEventListener('abort', () => reject(timeout.signal.reason), { once: true })
      })])
    })
    try {
      const cancellation = hub.manager!.cancelWithAck(computerId, created.id, 1)
      await waiting
      timeout.abort(new DOMException('Synthetic transport timeout', 'TimeoutError'))
      await expect(cancellation).resolves.toMatchObject({ outcome: 'unknown' })
      await node.service.store.update(created.id, (stored) => { stored.status = 'idle' })
      await expect(node.service.sendMessage(created.id, 'No resumed work', true)).rejects.toMatchObject({ statusCode: 409 })
      await expect(hub.manager!.sendMessage(computerId, created.id, { content: 'No remote work', enqueue: true }))
        .rejects.toMatchObject({ statusCode: 409 })
      await new Promise((resolve) => setTimeout(resolve, 30))
      expect(node.prompts).toEqual([])
      expect(node.service.store.get(created.id)?.queuedPrompts).toHaveLength(1)
    } finally {
      timeout.abort()
      release()
      fetchSpy.mockRestore()
      await response?.then((received) => received.body?.cancel())
    }
    await vi.waitFor(() => expect(node.service.store.get(created.id)).toMatchObject({ launchStopping: true, queuedPrompts: [] }))
    expect(node.prompts).toEqual([])
  })

  it('returns a hub HTTP failure for a node fence-write failure and never drains its queued follower', async () => {
    const hub = await runtime('hub')
    const node = await runtime('node')
    await node.app.listen({ host: '127.0.0.1', port: 0 })
    const port = (node.app.server.address() as AddressInfo).port
    await hub.manager!.registerComputer({ baseUrl: `http://127.0.0.1:${port}`, token: node.identity.token })
    const computerId = node.identity.info.id
    await vi.waitFor(() => expect(hub.manager!.listComputers().find((computer) => computer.id === computerId)
      ?.providers?.find((provider) => provider.id === 'claude')?.supportsLaunchIdentity).toBe(true))
    const created = await hub.manager!.createSession(computerId, { cwd: node.location, provider: 'claude', launchId: 'run' })
    await node.service.store.update(created.id, (stored) => { stored.status = 'running' })
    await hub.manager!.sendMessage(computerId, created.id, { content: 'Synthetic queued follower', enqueue: true, deliveryId: 'follower' })
    const fence = vi.spyOn(node.service.store, 'stopLaunchWork').mockRejectedValueOnce(new Error('Synthetic fence write failed'))
    const response = await hub.app.inject({
      method: 'POST', url: `/api/computers/${computerId}/sessions/${created.id}/cancel-with-ack`, payload: { timeoutMs: 1 },
      headers: { host: '127.0.0.1', origin: 'http://127.0.0.1' },
    })
    expect(response.statusCode).toBe(500)
    await node.service.store.update(created.id, (stored) => { stored.status = 'idle' })
    await expect(node.service.sendMessage(created.id, 'No resumed work', true, undefined, false, 'new'))
      .rejects.toMatchObject({ statusCode: 409 })
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(node.prompts).toEqual([])
    expect(node.service.store.get(created.id)?.queuedPrompts).toHaveLength(1)
    fence.mockRestore()
    await expect(hub.manager!.cancelWithAck(computerId, created.id, 1)).resolves.toMatchObject({ outcome: 'unknown' })
    expect(node.service.store.get(created.id)?.queuedPrompts).toEqual([])
    expect(node.prompts).toEqual([])
  })

  it('reconciles hub-local creation and acceptance after lost responses and a restart', async () => {
    const hub = await runtime('hub')
    const computerId = hub.identity.info.id
    const create = hub.service.createSession.bind(hub.service)
    vi.spyOn(hub.service, 'createSession').mockImplementationOnce(async (...args) => {
      await create(...args)
      throw new Error('Simulated lost creation response')
    })
    await expect(hub.manager!.createSession(computerId, { cwd: hub.location, provider: 'claude', launchId: 'run' })).rejects.toThrow('lost')
    const initial = await hub.manager!.reconcileLaunch(computerId, 'run')
    expect(initial).toMatchObject({ sessionStatus: 'idle', receipts: [] })
    await hub.service.store.update(initial!.sessionId, (stored) => { stored.status = 'running' })
    const send = hub.service.sendMessage.bind(hub.service)
    vi.spyOn(hub.service, 'sendMessage').mockImplementationOnce(async (...args) => {
      await send(...args)
      throw new Error('Simulated lost acceptance response')
    })
    await expect(hub.manager!.sendMessage(computerId, initial!.sessionId, {
      content: 'Root', enqueue: true, deliveryId: 'delivery',
    })).rejects.toThrow('lost acceptance')
    await hub.app.close()
    const restarted = await runtime('hub', hub.location)
    const reconciled = await restarted.manager!.reconcileLaunch(computerId, 'run')
    expect(reconciled).toMatchObject({ sessionId: initial!.sessionId, receipts: [{ deliveryId: 'delivery', state: 'queued' }] })
    const retry = await restarted.manager!.createSession(computerId, { cwd: hub.location, provider: 'claude', launchId: 'run' })
    expect(retry.id).toBe(initial!.sessionId)
    await restarted.manager!.sendMessage(computerId, retry.id, { content: 'Root', enqueue: true, deliveryId: 'delivery' })
    expect(restarted.service.store.get(retry.id)?.queuedPrompts).toHaveLength(1)
    expect(hub.prompts).toEqual([])
    expect(restarted.prompts).toEqual([])
  })

  it('keeps identity and receipt authority on each remote node and refuses an older node explicitly', async () => {
    const hub = await runtime('hub')
    const nodes = [await runtime('node'), await runtime('node')]
    for (const node of nodes) {
      await node.app.listen({ host: '127.0.0.1', port: 0 })
      const port = (node.app.server.address() as AddressInfo).port
      await hub.manager!.registerComputer({ baseUrl: `http://127.0.0.1:${port}`, token: node.identity.token })
    }
    await vi.waitFor(() => expect(hub.manager!.listComputers().filter((computer) => computer.online)).toHaveLength(3))
    for (const node of nodes) {
      const id = node.identity.info.id
      const input = { cwd: node.location, provider: 'claude' as const, launchId: 'same-token-on-distinct-computers' }
      const created = await Promise.all([hub.manager!.createSession(id, input), hub.manager!.createSession(id, input)])
      expect(created[0].id).toBe(created[1].id)
      await hub.manager!.sendMessage(id, created[0].id, { content: 'Only once', enqueue: true, deliveryId: 'root' })
      await hub.manager!.sendMessage(id, created[0].id, { content: 'Only once', enqueue: true, deliveryId: 'root' })
      await vi.waitFor(() => expect(node.prompts).toEqual(['Only once']))
      await vi.waitFor(async () => expect((await hub.manager!.reconcileLaunch(id, input.launchId))?.receipts[0])
        .toMatchObject({ deliveryId: 'root', state: 'delivered', outcome: 'succeeded' }))
      expect((await node.app.inject({ url: `/node-api/launches/${input.launchId}` })).statusCode).toBe(401)
      expect((await node.app.inject({ method: 'POST', url: `/node-api/sessions/${created[0].id}/cancel-with-ack`, payload: {} })).statusCode).toBe(401)
      expect(await hub.manager!.cancelWithAck(id, created[0].id, 10)).toMatchObject({ outcome: 'unknown' })
    }
    expect(nodes[0].service.listHistory()[0].id).not.toBe(nodes[1].service.listHistory()[0].id)
    expect(hub.service.listHistory()).toEqual([])
    const old = nodes[0]
    const providers = old.service.providers.bind(old.service)
    vi.spyOn(old.service, 'providers').mockImplementation(() => providers().map((entry) => ({ ...entry, supportsLaunchIdentity: undefined })))
    // Re-pair to refresh the old capability snapshot instead of trusting version strings.
    const port = (old.app.server.address() as AddressInfo).port
    await hub.manager!.registerComputer({ baseUrl: `http://127.0.0.1:${port}`, token: old.identity.token })
    await vi.waitFor(() => {
      const provider = hub.manager!.listComputers().find((computer) => computer.id === old.identity.info.id)
        ?.providers?.find((provider) => provider.id === 'claude')
      expect(provider).toMatchObject({ available: true })
      expect(provider?.supportsLaunchIdentity).toBeUndefined()
    })
    await expect(hub.manager!.createSession(old.identity.info.id, { cwd: old.location, provider: 'claude', launchId: 'unsupported' }))
      .rejects.toMatchObject({ statusCode: 409, message: expect.stringContaining('Update this computer') })
    await expect(hub.manager!.reconcileLaunch(old.identity.info.id, 'unsupported')).rejects.toMatchObject({ statusCode: 409 })
    // Existing UI/Oracle calls, without identity, keep working.
    await expect(hub.manager!.createSession(old.identity.info.id, { cwd: old.location, provider: 'claude' }))
      .resolves.toMatchObject({ provider: 'claude' })
    const oldSession = old.service.listHistory()[0]
    await expect(hub.manager!.sendMessage(old.identity.info.id, oldSession.id, { content: 'No silent downgrade', deliveryId: 'unsupported' }))
      .rejects.toMatchObject({ statusCode: 409 })
    await expect(hub.manager!.cancelWithAck(old.identity.info.id, oldSession.id, 100)).rejects.toMatchObject({ statusCode: 409 })
  })

  it('recovers a remote creation and acceptance whose responses were lost, without resubmitting after restart', async () => {
    const hub = await runtime('hub')
    const node = await runtime('node')
    const pair = async (target: typeof node) => {
      await target.app.listen({ host: '127.0.0.1', port: 0 })
      const port = (target.app.server.address() as AddressInfo).port
      await hub.manager!.registerComputer({ baseUrl: `http://127.0.0.1:${port}`, token: target.identity.token })
      await vi.waitFor(() => expect(hub.manager!.listComputers().find((computer) => computer.id === target.identity.info.id)
        ?.providers?.find((provider) => provider.id === 'claude')?.supportsLaunchIdentity).toBe(true))
    }
    await pair(node)
    const computerId = node.identity.info.id
    const create = node.service.createSession.bind(node.service)
    vi.spyOn(node.service, 'createSession').mockImplementationOnce(async (...args) => {
      await create(...args)
      throw new Error('Simulated lost remote creation response')
    })
    const input = { cwd: node.location, provider: 'claude' as const, launchId: 'remote-run' }
    await expect(hub.manager!.createSession(computerId, input)).rejects.toMatchObject({ statusCode: 500 })
    const reconciled = await hub.manager!.reconcileLaunch(computerId, input.launchId)
    const sessionId = reconciled!.sessionId
    await node.service.store.update(sessionId, (stored) => { stored.status = 'running' })
    const send = node.service.sendMessage.bind(node.service)
    vi.spyOn(node.service, 'sendMessage').mockImplementationOnce(async (...args) => {
      await send(...args)
      throw new Error('Simulated lost remote acceptance response')
    })
    const prompt = { content: 'Run only once', enqueue: true, deliveryId: 'remote-delivery' }
    await expect(hub.manager!.sendMessage(computerId, sessionId, prompt)).rejects.toMatchObject({ statusCode: 500 })
    expect((await hub.manager!.reconcileLaunch(computerId, input.launchId))?.receipts[0])
      .toMatchObject({ deliveryId: prompt.deliveryId, state: 'queued' })
    await hub.manager!.removeComputer(computerId)
    await node.app.close()
    const restarted = await runtime('node', node.location)
    await pair(restarted)
    expect((await hub.manager!.createSession(computerId, input)).id).toBe(sessionId)
    await hub.manager!.sendMessage(computerId, sessionId, prompt)
    expect(restarted.service.store.get(sessionId)?.queuedPrompts).toHaveLength(1)
    expect(restarted.prompts).toEqual([])
  })
})
