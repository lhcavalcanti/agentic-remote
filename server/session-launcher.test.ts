import { EventEmitter } from 'node:events'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  ManagedSession,
  PendingPermission,
} from '../shared/contracts.js'
import { ComputerManager } from './computer-manager.js'
import type { ComputerRegistry } from './computer-registry.js'
import type { NodeIdentityStore } from './node-identity.js'
import { RemoteNodeClient } from './remote-node-client.js'
import type { SessionService } from './session-service.js'
import { createManagerTools, type ManagerToolHost } from './manager-tools.js'
import {
  SessionLauncher,
  SessionLaunchPreparationError,
  type SessionFolderTrustPolicy,
  type SessionLaunchInput,
  type SessionLauncherHost,
  type SessionPermissionPolicy,
} from './session-launcher.js'

interface Provenance {
  source: string
}

function session(change: Partial<ManagedSession> = {}): ManagedSession {
  return {
    id: 'session-1',
    computerId: 'hub',
    computerName: 'Development',
    cwd: '/projects/app',
    title: 'Untitled',
    status: 'idle',
    isOpen: true,
    messages: [],
    updatedAt: '2026-11-13T20:00:00.000Z',
    ...change,
  }
}

function trustPermission(change: Partial<PendingPermission> = {}): PendingPermission {
  return {
    requestId: 'trust-1',
    title: 'Trust folder for this session: /projects/app',
    kind: 'terminal',
    choiceCount: 3,
    options: [
      { optionId: 'terminal:allow', name: 'Trust for this session', kind: 'allow_once' },
      { optionId: 'terminal:stop', name: 'Stop', kind: 'reject_once' },
    ],
    ...change,
  }
}

function launchInput(change: Partial<SessionLaunchInput<Provenance>> = {}): SessionLaunchInput<Provenance> {
  return {
    computerId: 'hub',
    provider: 'copilot',
    backend: 'terminal',
    folder: '/projects/app',
    permissionPolicy: 'ask',
    folderTrust: 'ask',
    provenance: { source: 'test-caller' },
    ...change,
  }
}

describe('SessionLauncher', () => {
  let host: SessionLauncherHost
  let recordProvenance: ReturnType<typeof vi.fn<(session: ManagedSession, provenance: Provenance) => Promise<void>>>
  let onFolderTrusted: ReturnType<typeof vi.fn<(session: ManagedSession, folder: string) => void>>
  let launcher: SessionLauncher<Provenance>

  beforeEach(() => {
    host = {
      createSession: vi.fn(async () => session()),
      renameSession: vi.fn(async (_computerId, _sessionId, input) => session({ title: input.title })),
      readSession: vi.fn(async () => session()),
      sendMessage: vi.fn(async () => session()),
      replyPermission: vi.fn(async () => session()),
      replyUserInput: vi.fn(async () => session()),
      cancel: vi.fn(async () => undefined),
    }
    recordProvenance = vi.fn(async () => undefined)
    onFolderTrusted = vi.fn()
    launcher = new SessionLauncher(host, {
      recordProvenance,
      onFolderTrusted,
      pollMs: 1,
      trustWaitMs: 20,
    })
  })

  it('names and records the caller provenance before any delivery or trust action', async () => {
    const launch = await launcher.createSession(launchInput({
      title: 'Review app',
      folderTrust: 'auto-approve',
      provenance: { source: 'another-owner' },
    }))
    expect(launch).toMatchObject({
      created: { title: 'Untitled' },
      session: { title: 'Review app' },
      folderTrust: 'auto-approve',
    })

    expect(recordProvenance).toHaveBeenCalledWith(launch.session, { source: 'another-owner' })
    expect(vi.mocked(host.renameSession).mock.invocationCallOrder[0])
      .toBeLessThan(recordProvenance.mock.invocationCallOrder[0])
    expect(host.readSession).not.toHaveBeenCalled()
    expect(host.replyPermission).not.toHaveBeenCalled()
    expect(host.sendMessage).not.toHaveBeenCalled()
    await launcher.deliverPrompt(launch, 'Review it.')
    expect(recordProvenance.mock.invocationCallOrder[0])
      .toBeLessThan(vi.mocked(host.sendMessage).mock.invocationCallOrder[0])
  })

  it('carries optional launch and root-delivery identity and exposes reconciliation and acknowledged cancellation', async () => {
    const receipt = {
      deliveryId: 'root-delivery', sessionId: 'session-1', promptId: 'queued-root',
      acceptedAt: '2026-11-14T06:00:00.000Z', state: 'queued' as const,
    }
    vi.mocked(host.sendMessage).mockResolvedValue(session({ promptReceipts: [receipt] }))
    host.reconcileLaunch = vi.fn(async () => ({
      launchId: 'run', sessionId: 'session-1', sessionStatus: 'idle' as const, receipts: [receipt],
    }))
    host.cancelWithAck = vi.fn(async () => ({
      sessionId: 'session-1', outcome: 'unknown' as const, checkedAt: receipt.acceptedAt, scope: 'provider-owned' as const,
    }))
    const launch = await launcher.createSession(launchInput({ launchId: 'run' }))
    expect(host.createSession).toHaveBeenCalledWith('hub', expect.objectContaining({ launchId: 'run' }))
    expect((await launcher.deliverPrompt(launch, 'Root', { deliveryId: 'root-delivery' })).receipt).toEqual(receipt)
    expect(host.sendMessage).toHaveBeenCalledWith('hub', 'session-1', { content: 'Root', enqueue: true, deliveryId: 'root-delivery' })
    expect(await launcher.reconcileLaunch('hub', 'run')).toMatchObject({ receipts: [receipt] })
    expect(await launcher.cancelWithAck(launch.session, 123)).toMatchObject({ outcome: 'unknown' })
    expect(host.cancelWithAck).toHaveBeenCalledWith('hub', 'session-1', 123)
  })

  it('keeps the creation response and records its original title when naming fails', async () => {
    vi.mocked(host.renameSession).mockRejectedValue(new Error('Rename unavailable'))
    const launch = await launcher.createSession(launchInput({ title: 'Review app' }))
    expect(launch.session.title).toBe('Untitled')
    expect(recordProvenance).toHaveBeenCalledWith(launch.session, { source: 'test-caller' })
  })

  it('separates a post-creation provenance failure from a creation refusal', async () => {
    const failure = new Error('model is not available in the provenance store')
    recordProvenance.mockRejectedValue(failure)
    const result = launcher.createSession(launchInput())
    await expect(result).rejects.toMatchObject({
      created: { id: 'session-1' },
      cause: failure,
      message: failure.message,
    })
    await expect(result).rejects.toBeInstanceOf(SessionLaunchPreparationError)
    expect(host.createSession).toHaveBeenCalledTimes(1)
    expect(host.sendMessage).not.toHaveBeenCalled()
  })

  it('propagates a creation refusal without recording provenance', async () => {
    const failure = new Error('model is not available')
    vi.mocked(host.createSession).mockRejectedValue(failure)
    await expect(launcher.createSession(launchInput())).rejects.toBe(failure)
    expect(recordProvenance).not.toHaveBeenCalled()
  })

  it('keeps Oracle provenance failures out of model fallback and preserves the original tool error', async () => {
    const failure = new Error('model is not available in the provenance store')
    const computer = {
      id: 'hub', name: 'Development', online: true, isLocal: true,
      providers: [{ id: 'copilot', available: true, terminalBacked: true }],
    }
    const markManaged = vi.fn(async () => { throw failure })
    const onActivity = vi.fn()
    const tools = createManagerTools({
      ...host,
      renameSession: async (_computerId: string, _sessionId: string, title: string) => session({ title }),
      findComputer: () => computer,
      defaults: () => ({ computerId: 'hub' }),
      configuredRuntime: () => ({ model: 'model-a' }),
      providerModels: async () => [{ id: 'model-a', reasoningEfforts: [], contextTiers: ['default'] }],
      sessionFolders: () => ({}),
      sessionBackend: () => 'sdk',
      messageSource: () => 'typed',
      answerOnly: () => false,
      markManaged,
    } as unknown as ManagerToolHost, onActivity)
    const create = tools.find((tool) => tool.name === 'create_session')!
    const args = { title: 'Review app', prompt: 'Review it.' }
    const result = await create.handler(args, {
      sessionId: 'oracle', toolCallId: 'create-1', toolName: 'create_session', arguments: args,
    })
    expect(result).toEqual({
      textResultForLlm: `Error: ${failure.message}`,
      resultType: 'failure',
      error: failure.message,
    })
    expect(host.createSession).toHaveBeenCalledTimes(1)
    expect(markManaged).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ title: 'Review app' }), 'Review it.')
    expect(host.sendMessage).not.toHaveBeenCalled()
    expect(onActivity).not.toHaveBeenCalled()
  })

  it.each([
    ['permissionPolicy', undefined],
    ['permissionPolicy', 'implicit'],
    ['folderTrust', undefined],
    ['folderTrust', 'implicit'],
    ['provenance', undefined],
  ])('refuses missing or invalid %s before creating anything (%s)', async (field, value) => {
    const input = { ...launchInput(), [field]: value } as SessionLaunchInput<Provenance>
    await expect(launcher.createSession(input)).rejects.toThrow(field)
    expect(host.createSession).not.toHaveBeenCalled()
    expect(recordProvenance).not.toHaveBeenCalled()
  })

  it('requires an explicit folder-trust policy when delivering to an existing session', async () => {
    await expect(launcher.deliverPrompt({
      session: session(),
      // @ts-expect-error A delivery cannot inherit the caller's folder-trust policy.
      folderTrust: undefined,
    }, 'Review it.')).rejects.toThrow('folderTrust')
    expect(host.readSession).not.toHaveBeenCalled()
    expect(host.sendMessage).not.toHaveBeenCalled()
  })

  it('does not answer or retry a folder-trust prompt under ask policy', async () => {
    vi.mocked(host.readSession).mockResolvedValue(session({ pendingPermission: trustPermission() }))
    const failure = new Error('Folder trust is waiting')
    vi.mocked(host.sendMessage).mockRejectedValue(failure)
    await expect(launcher.deliverPrompt({ session: session(), folderTrust: 'ask' }, 'Review it.'))
      .rejects.toBe(failure)
    expect(host.sendMessage).toHaveBeenCalledExactlyOnceWith('hub', 'session-1', { content: 'Review it.', enqueue: true })
    expect(host.readSession).not.toHaveBeenCalled()
    expect(host.replyPermission).not.toHaveBeenCalled()
    expect(onFolderTrusted).not.toHaveBeenCalled()
  })

  it('approves only the session folder and waits for trust settlement before sending', async () => {
    vi.mocked(host.readSession)
      .mockResolvedValueOnce(session({ pendingPermission: trustPermission({
        title: 'Trust folder for this session: /projects/\napp/',
      }) }))
      .mockResolvedValueOnce(session({ pendingPermission: trustPermission() }))
    const target = { session: session({ title: 'Review app' }), folderTrust: 'auto-approve' as const }
    await launcher.deliverPrompt(target, 'Review it.')
    expect(host.replyPermission).toHaveBeenCalledExactlyOnceWith('hub', 'session-1', 'trust-1', { optionId: 'terminal:allow' })
    expect(onFolderTrusted).toHaveBeenCalledExactlyOnceWith(target.session, '/projects/app/')
    expect(host.readSession).toHaveBeenCalledTimes(3)
    expect(vi.mocked(host.readSession).mock.invocationCallOrder[2])
      .toBeLessThan(vi.mocked(host.sendMessage).mock.invocationCallOrder[0])
  })

  it.each([
    { stale: true },
    { kind: 'shell' },
    { choiceCount: 2 },
    { title: 'Trust folder for this session: /projects/elsewhere' },
    { options: [{ optionId: 'allow', name: 'Allow', kind: 'allow_once' }] },
    { options: [
      ...trustPermission().options,
      { optionId: 'extra', name: 'Other', kind: 'allow_once' },
    ] },
  ])('leaves a stale, unrelated, or lookalike trust prompt unanswered: %j', async (change) => {
    vi.mocked(host.readSession).mockResolvedValue(session({ pendingPermission: trustPermission(change) }))
    await launcher.deliverPrompt({ session: session(), folderTrust: 'auto-approve' }, 'Review it.')
    expect(host.replyPermission).not.toHaveBeenCalled()
    expect(onFolderTrusted).not.toHaveBeenCalled()
  })

  it('retries once when a genuine folder-trust prompt appears after a failed send', async () => {
    vi.mocked(host.sendMessage).mockRejectedValueOnce(new Error('Prompt is showing'))
    vi.mocked(host.readSession)
      .mockResolvedValueOnce(session())
      .mockResolvedValueOnce(session({ pendingPermission: trustPermission() }))
    await launcher.deliverPrompt({ session: session(), folderTrust: 'auto-approve' }, 'Review it.')
    expect(host.sendMessage).toHaveBeenCalledTimes(2)
    expect(host.replyPermission).toHaveBeenCalledTimes(1)
  })

  it.each([undefined, true])('never retries a steer with uncertainDelivery=%s', async (uncertainDelivery) => {
    const failure = Object.assign(new Error('Steer failed'), { uncertainDelivery })
    vi.mocked(host.sendMessage).mockRejectedValue(failure)
    await expect(launcher.deliverPrompt(
      { session: session({ status: 'running' }), folderTrust: 'auto-approve' },
      'Focus on tests.',
      { steer: true },
    )).rejects.toBe(failure)
    expect(host.sendMessage).toHaveBeenCalledTimes(1)
    expect(host.replyPermission).not.toHaveBeenCalled()
  })

  it('falls back to the queue only after a definitively refused steer', async () => {
    vi.mocked(host.sendMessage).mockRejectedValueOnce(Object.assign(new Error('Not ready'), { uncertainDelivery: false }))
    const delivery = await launcher.deliverPrompt(
      { session: session({ status: 'running' }), folderTrust: 'ask' },
      'Focus on tests.',
      { steer: true },
    )
    expect(delivery.outcome).toBe('queued')
    expect(vi.mocked(host.sendMessage).mock.calls).toEqual([
      ['hub', 'session-1', { content: 'Focus on tests.', enqueue: false }],
      ['hub', 'session-1', { content: 'Focus on tests.', enqueue: true }],
    ])
  })
})

describe('SessionLauncher owning-computer routing', () => {
  let manager: ComputerManager
  const providers = [
    { id: 'copilot' as const, name: 'Copilot', available: true, terminalBacked: true },
    { id: 'claude' as const, name: 'Claude Agent', available: true, terminalBacked: false },
  ]
  let local: {
    createSession: ReturnType<typeof vi.fn>
    getSession: ReturnType<typeof vi.fn>
    openSession: ReturnType<typeof vi.fn>
    sendMessage: ReturnType<typeof vi.fn>
    replyPermission: ReturnType<typeof vi.fn>
    replyUserInput: ReturnType<typeof vi.fn>
    cancel: ReturnType<typeof vi.fn>
  }

  beforeEach(async () => {
    vi.spyOn(RemoteNodeClient.prototype, 'connect').mockImplementation(() => {})
    vi.spyOn(RemoteNodeClient.prototype, 'providers', 'get').mockReturnValue(providers)
    vi.spyOn(RemoteNodeClient.prototype, 'stop').mockImplementation(() => {})
    vi.spyOn(RemoteNodeClient.prototype, 'getInfo').mockRejectedValue(new Error('No background discovery in this fixture'))
    vi.spyOn(RemoteNodeClient.prototype, 'createSession').mockResolvedValue(session())
    vi.spyOn(RemoteNodeClient.prototype, 'getSession').mockResolvedValue(session())
    vi.spyOn(RemoteNodeClient.prototype, 'sendMessage').mockResolvedValue(session())
    vi.spyOn(RemoteNodeClient.prototype, 'replyPermission').mockResolvedValue(session())
    vi.spyOn(RemoteNodeClient.prototype, 'replyUserInput').mockResolvedValue(session())
    vi.spyOn(RemoteNodeClient.prototype, 'cancel').mockResolvedValue()
    local = {
      createSession: vi.fn(async () => session()),
      getSession: vi.fn(() => session()),
      openSession: vi.fn(),
      sendMessage: vi.fn(async () => session()),
      replyPermission: vi.fn(async () => session()),
      replyUserInput: vi.fn(async () => session()),
      cancel: vi.fn(async () => undefined),
    }
    manager = new ComputerManager(
      Object.assign(new EventEmitter(), { providers: () => providers, ...local }) as unknown as SessionService,
      { info: { id: 'hub', name: 'Development', version: 'fixture' } } as NodeIdentityStore,
      {
        initialize: async () => undefined,
        list: () => [{ id: 'worker', name: 'Worker', baseUrl: 'http://worker.example.test', token: 'synthetic-test-token' }],
      } as unknown as ComputerRegistry,
    )
    await manager.initialize()
  })

  afterEach(() => {
    manager.stop()
    vi.restoreAllMocks()
  })

  const creationCases = ['hub', 'worker'].flatMap((computerId) =>
    (['ask', 'allow-all'] as SessionPermissionPolicy[]).flatMap((permissionPolicy) =>
      (['ask', 'auto-approve'] as SessionFolderTrustPolicy[]).flatMap((folderTrust) =>
        ([
          { provider: 'copilot', backend: 'terminal' },
          { provider: 'claude', backend: 'sdk' },
        ] as const).map(({ provider, backend }) => ({
          computerId, permissionPolicy, folderTrust, provider, backend,
        })),
      ),
    ),
  )

  it.each(creationCases)(
    'passes $permissionPolicy / $folderTrust to $computerId ($provider / $backend) without changing ownership',
    async ({ computerId, permissionPolicy, folderTrust, provider, backend }) => {
      const recordProvenance = vi.fn(async () => undefined)
      const launcher = new SessionLauncher<Provenance>(manager, { recordProvenance })
      const launch = await launcher.createSession(launchInput({
        computerId, permissionPolicy, folderTrust, provider, backend,
        model: 'model-a', reasoningEffort: 'high', contextTier: 'long_context', mode: 'autopilot',
      }))
      expect(launch.session.computerId).toBe(computerId)
      expect(launch.folderTrust).toBe(folderTrust)
      expect(recordProvenance).toHaveBeenCalledWith(launch.session, { source: 'test-caller' })
      if (computerId === 'hub') {
        expect(local.createSession).toHaveBeenCalledExactlyOnceWith(
          '/projects/app', backend === 'terminal', permissionPolicy === 'allow-all',
          provider, 'model-a', 'high', 'long_context', 'autopilot',
        )
        expect(RemoteNodeClient.prototype.createSession).not.toHaveBeenCalled()
      } else {
        expect(RemoteNodeClient.prototype.createSession).toHaveBeenCalledExactlyOnceWith({
          cwd: '/projects/app', provider, terminalBacked: backend === 'terminal',
          allowAllPermissions: permissionPolicy === 'allow-all',
          model: 'model-a', reasoningEffort: 'high', contextTier: 'long_context', mode: 'autopilot',
        })
        expect(local.createSession).not.toHaveBeenCalled()
      }
    },
  )

  it.each(['hub', 'worker'])('observes, delivers, answers and cancels through %s without opening a runtime', async (computerId) => {
    const launcher = new SessionLauncher<Provenance>(manager, { recordProvenance: async () => undefined })
    const target = session({ computerId })
    expect(await launcher.observeSession(target)).toMatchObject({ computerId, id: 'session-1' })
    expect(local.openSession).not.toHaveBeenCalled()
    await launcher.deliverPrompt({ session: target, folderTrust: 'ask' }, 'Review it.')
    await launcher.answerPermission(target, 'permission-1', 'allow-once')
    const reply = { answer: 'Yes', wasFreeform: false }
    await launcher.answerUserInput(target, 'question-1', reply)
    await launcher.cancel(target)
    if (computerId === 'hub') {
      expect(local.getSession).toHaveBeenCalledExactlyOnceWith('session-1')
      expect(local.sendMessage).toHaveBeenCalledExactlyOnceWith('session-1', 'Review it.', true, undefined, undefined)
      expect(local.replyPermission).toHaveBeenCalledExactlyOnceWith('session-1', 'permission-1', 'allow-once')
      expect(local.replyUserInput).toHaveBeenCalledExactlyOnceWith('session-1', 'question-1', reply)
      expect(local.cancel).toHaveBeenCalledExactlyOnceWith('session-1')
      expect(RemoteNodeClient.prototype.getSession).not.toHaveBeenCalled()
      expect(RemoteNodeClient.prototype.sendMessage).not.toHaveBeenCalled()
      expect(RemoteNodeClient.prototype.cancel).not.toHaveBeenCalled()
    } else {
      expect(RemoteNodeClient.prototype.getSession).toHaveBeenCalledExactlyOnceWith('session-1', { passive: true })
      expect(RemoteNodeClient.prototype.sendMessage).toHaveBeenCalledExactlyOnceWith('session-1', { content: 'Review it.', enqueue: true })
      expect(RemoteNodeClient.prototype.replyPermission).toHaveBeenCalledExactlyOnceWith('session-1', 'permission-1', { optionId: 'allow-once' })
      expect(RemoteNodeClient.prototype.replyUserInput).toHaveBeenCalledExactlyOnceWith('session-1', 'question-1', reply)
      expect(RemoteNodeClient.prototype.cancel).toHaveBeenCalledExactlyOnceWith('session-1')
      expect(local.getSession).not.toHaveBeenCalled()
      expect(local.sendMessage).not.toHaveBeenCalled()
      expect(local.cancel).not.toHaveBeenCalled()
    }
  })

  it.each(['hub', 'worker'].flatMap((computerId) =>
    (['ask', 'auto-approve'] as const).map((folderTrust) => ({ computerId, folderTrust })),
  ))('applies $folderTrust folder trust on $computerId during delivery', async ({ computerId, folderTrust }) => {
    local.getSession.mockReturnValueOnce(session({ pendingPermission: trustPermission() }))
    vi.mocked(RemoteNodeClient.prototype.getSession)
      .mockResolvedValueOnce(session({ pendingPermission: trustPermission() }))
    const onFolderTrusted = vi.fn()
    const launcher = new SessionLauncher<Provenance>(manager, {
      recordProvenance: async () => undefined,
      onFolderTrusted,
    })
    await launcher.deliverPrompt({ session: session({ computerId }), folderTrust }, 'Review it.')
    if (folderTrust === 'ask') {
      expect(local.replyPermission).not.toHaveBeenCalled()
      expect(RemoteNodeClient.prototype.replyPermission).not.toHaveBeenCalled()
      expect(onFolderTrusted).not.toHaveBeenCalled()
    } else {
      expect(onFolderTrusted).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ computerId }), '/projects/app',
      )
      if (computerId === 'hub') {
        expect(local.replyPermission).toHaveBeenCalledExactlyOnceWith('session-1', 'trust-1', 'terminal:allow')
        expect(RemoteNodeClient.prototype.replyPermission).not.toHaveBeenCalled()
      } else {
        expect(RemoteNodeClient.prototype.replyPermission).toHaveBeenCalledExactlyOnceWith('session-1', 'trust-1', { optionId: 'terminal:allow' })
        expect(local.replyPermission).not.toHaveBeenCalled()
      }
    }
  })
})
