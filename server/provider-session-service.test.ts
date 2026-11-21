import { EventEmitter } from 'node:events'
import { describe, expect, it, vi } from 'vitest'
import type { AgentProvider, SessionDetail } from '../shared/contracts.js'
import { ProviderSessionService } from './provider-session-service.js'
import type { SessionService } from './session-service.js'

function provider(id: AgentProvider, supported = true) {
  const session: SessionDetail = {
    id: `${id}-session`, provider: id, title: id, cwd: '/fake-provider',
    status: 'idle', updatedAt: '2026-09-05T00:00:00.000Z', isOpen: true, messages: [],
  }
  return Object.assign(new EventEmitter(), {
    getSession: (sessionId: string) => sessionId === session.id ? session : undefined,
    deliveryIdentity: (deliveryId: string) => ({
      sessionId: session.promptReceipts?.some((receipt) => receipt.deliveryId === deliveryId) ? session.id : undefined,
      historyComplete: true,
    }),
    providers: () => [{
      id, name: id, available: true, terminalBacked: false,
      ...(supported ? { supportsQueuedPromptDispatch: true } : {}),
      supportsContextRecovery: id === 'copilot' && supported,
      supportsSideQuestions: id === 'copilot' && supported,
      supportsActivityDetails: id === 'copilot' && supported,
    }],
    dispatchQueuedPrompt: vi.fn(async (_sessionId: string, promptId: string, _content: string) => ({
      outcome: 'sent' as const, promptId, attemptId: '11111111-1111-4111-8111-111111111111', session,
    })),
    removeQueuedPrompt: vi.fn(async () => ({
      session, prompt: { id: 'prompt', content: 'original', createdAt: session.updatedAt },
    })),
    askSession: vi.fn(async (_sessionId: string, question: string) => `Answer: ${question}`),
    readActivityDetail: vi.fn(async (_sessionId: string, toolCallId: string) => ({
      toolCallId, toolName: 'bash', kind: 'tool' as const, status: 'completed' as const,
    })),
    recoverConversation: vi.fn(async () => ({
      ...session,
      id: `${id}-recovered`,
      replacedSessionIds: [session.id],
    })),
  })
}

describe('provider queued dispatch aggregation', () => {
  it('forwards only observed pane roots without starting either provider', async () => {
    const root = { sessionId: 'copilot-session', panePid: 123, paneStartTime: 456 }
    const copilot = Object.assign(provider('copilot'), {
      start: vi.fn(), listSessionPaneRoots: vi.fn(async () => [root]),
    })
    const claude = Object.assign(provider('claude'), { start: vi.fn() })
    const aggregate = new ProviderSessionService(copilot as unknown as SessionService, claude as unknown as SessionService)
    expect(await aggregate.listSessionPaneRoots()).toEqual([root])
    expect(copilot.start).not.toHaveBeenCalled()
    expect(claude.start).not.toHaveBeenCalled()
  })

  it('does not use a live-history scan when a provider lacks durable delivery lookup', async () => {
    const copilot = provider('copilot')
    const claude = provider('claude')
    const owner = Object.assign(copilot, { sendMessage: vi.fn() })
    const legacy = Object.assign(claude, { deliveryIdentity: undefined })
    const aggregate = new ProviderSessionService(owner as unknown as SessionService, legacy as unknown as SessionService)
    await expect(aggregate.sendMessage('copilot-session', 'Root', true, undefined, false, 'delivery'))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: false })
    expect(owner.sendMessage).not.toHaveBeenCalled()
  })

  it('blocks new identities across providers with incomplete history while preserving known receipt retries', async () => {
    const copilot = Object.assign(provider('copilot'), { sendMessage: vi.fn(async () => provider('copilot').getSession('copilot-session')!) })
    const claude = provider('claude')
    vi.spyOn(claude, 'deliveryIdentity').mockReturnValue({ sessionId: undefined, historyComplete: false })
    const aggregate = new ProviderSessionService(copilot as unknown as SessionService, claude as unknown as SessionService)
    await expect(aggregate.sendMessage('copilot-session', 'Unknown root', true, undefined, false, 'delivery'))
      .rejects.toMatchObject({ statusCode: 409, uncertainDelivery: false })
    expect(copilot.sendMessage).not.toHaveBeenCalled()
    copilot.getSession('copilot-session')!.promptReceipts = [{
      deliveryId: 'known', sessionId: 'copilot-session', promptId: 'prompt', acceptedAt: '2026-11-14T06:00:00Z', state: 'queued',
    }]
    await aggregate.sendMessage('copilot-session', 'Known retry', true, undefined, false, 'known')
    expect(copilot.sendMessage).toHaveBeenCalledOnce()
  })

  it('refuses a delivery token concurrently reused by a different provider session', async () => {
    const copilot = provider('copilot')
    const claude = provider('claude')
    const copilotSession = copilot.getSession('copilot-session')!
    const claudeSession = claude.getSession('claude-session')!
    const owner = Object.assign(copilot, {
      listHistory: () => [copilotSession],
      sendMessage: vi.fn(async () => {
        await Promise.resolve()
        copilotSession.promptReceipts = [{
          deliveryId: 'shared-delivery', sessionId: copilotSession.id, promptId: 'root',
          acceptedAt: '2026-11-14T06:00:00Z', state: 'queued',
        }]
        return copilotSession
      }),
    })
    const other = Object.assign(claude, {
      listHistory: () => [claudeSession],
      sendMessage: vi.fn(async () => claudeSession),
    })
    const aggregate = new ProviderSessionService(owner as unknown as SessionService, other as unknown as SessionService)
    const first = aggregate.sendMessage(copilotSession.id, 'Root', true, undefined, false, 'shared-delivery')
    const retry = aggregate.sendMessage(copilotSession.id, 'Root', true, undefined, false, 'shared-delivery')
    await expect(aggregate.sendMessage(claudeSession.id, 'Other', true, undefined, false, 'shared-delivery'))
      .rejects.toMatchObject({ statusCode: 409 })
    await Promise.all([first, retry])
    await expect(aggregate.sendMessage(claudeSession.id, 'Other', true, undefined, false, 'shared-delivery'))
      .rejects.toMatchObject({ statusCode: 409 })
    expect(owner.sendMessage).toHaveBeenCalledOnce()
    expect(other.sendMessage).not.toHaveBeenCalled()
  })

  it('arbitrates one launch token across providers instead of creating a session on each', async () => {
    const copilot = Object.assign(provider('copilot'), {
      reconcileLaunch: vi.fn(async () => undefined),
      createSession: vi.fn(async () => provider('copilot').getSession('copilot-session')!),
    })
    const claude = Object.assign(provider('claude'), {
      reconcileLaunch: vi.fn(async () => undefined),
      createSession: vi.fn(async () => provider('claude').getSession('claude-session')!),
    })
    const aggregate = new ProviderSessionService(copilot as unknown as SessionService, claude as unknown as SessionService)
    const [first, retry] = await Promise.all([
      aggregate.createSession('/fake-provider', false, false, 'copilot', undefined, undefined, undefined, undefined, 'shared-launch'),
      aggregate.createSession('/fake-provider', false, false, 'claude', undefined, undefined, undefined, undefined, 'shared-launch'),
    ])
    expect(first.id).toBe('copilot-session')
    expect(retry.id).toBe(first.id)
    expect(copilot.createSession).toHaveBeenCalledOnce()
    expect(claude.createSession).not.toHaveBeenCalled()
  })

  it.each(['copilot', 'claude'] as const)('keeps %s delivery and discard acknowledgement on the owning provider', async (id) => {
    const copilot = provider('copilot')
    const claude = provider('claude')
    const aggregate = new ProviderSessionService(
      copilot as unknown as SessionService, claude as unknown as SessionService,
    )
    const owner = id === 'copilot' ? copilot : claude
    const other = id === 'copilot' ? claude : copilot
    const result = await aggregate.dispatchQueuedPrompt(`${id}-session`, 'prompt', '  exact rewrite\n')
    expect(result).toMatchObject({ outcome: 'sent', promptId: 'prompt', session: { provider: id } })
    expect(owner.dispatchQueuedPrompt).toHaveBeenCalledExactlyOnceWith(`${id}-session`, 'prompt', '  exact rewrite\n')
    expect(other.dispatchQueuedPrompt).not.toHaveBeenCalled()
    await aggregate.removeQueuedPrompt(`${id}-session`, 'prompt', result.attemptId)
    expect(owner.removeQueuedPrompt).toHaveBeenCalledExactlyOnceWith(`${id}-session`, 'prompt', result.attemptId)
    expect(other.removeQueuedPrompt).not.toHaveBeenCalled()
  })

  it('fails closed when a provider has a method but has not advertised support', async () => {
    const copilot = provider('copilot', false)
    const aggregate = new ProviderSessionService(
      copilot as unknown as SessionService, provider('claude') as unknown as SessionService,
    )
    expect(() => aggregate.dispatchQueuedPrompt('copilot-session', 'prompt', 'rewrite'))
      .toThrow('Update the owning runtime')
    expect(copilot.dispatchQueuedPrompt).not.toHaveBeenCalled()
  })

  it('routes recovery only to a provider that advertises support', async () => {
    const copilot = provider('copilot')
    const claude = provider('claude')
    const aggregate = new ProviderSessionService(
      copilot as unknown as SessionService,
      claude as unknown as SessionService,
    )

    await expect(aggregate.recoverConversation(
      'copilot-session',
      'provider-error',
    )).resolves.toMatchObject({ id: 'copilot-recovered' })
    expect(copilot.recoverConversation).toHaveBeenCalledWith(
      'copilot-session',
      'provider-error',
    )
    expect(() => aggregate.recoverConversation('claude-session', 'manual'))
      .toThrow('does not support conversation recovery')
  })

  it('routes side questions only to a provider that advertises them', async () => {
    const copilot = provider('copilot')
    const claude = provider('claude')
    const aggregate = new ProviderSessionService(
      copilot as unknown as SessionService,
      claude as unknown as SessionService,
    )

    await expect(aggregate.askSession('copilot-session', 'Why?')).resolves.toBe('Answer: Why?')
    expect(copilot.askSession).toHaveBeenCalledExactlyOnceWith('copilot-session', 'Why?', undefined)
    const earlier = [{ question: 'What?', answer: 'This.' }]
    await aggregate.askSession('copilot-session', 'Why that?', earlier)
    expect(copilot.askSession).toHaveBeenLastCalledWith('copilot-session', 'Why that?', earlier)
    await expect(aggregate.askSession('claude-session', 'Why?')).rejects.toMatchObject({
      statusCode: 400,
      message: 'Side questions are available for GitHub Copilot sessions only.',
    })
    expect(claude.askSession).not.toHaveBeenCalled()

    const unadvertised = provider('copilot', false)
    await expect(new ProviderSessionService(
      unadvertised as unknown as SessionService,
      claude as unknown as SessionService,
    ).askSession('copilot-session', 'Why?')).rejects.toMatchObject({ statusCode: 400 })
    expect(unadvertised.askSession).not.toHaveBeenCalled()
  })

  it('reads tool call details only from a provider that advertises them', async () => {
    const copilot = provider('copilot')
    const claude = provider('claude')
    const aggregate = new ProviderSessionService(
      copilot as unknown as SessionService,
      claude as unknown as SessionService,
    )

    await expect(aggregate.readActivityDetail('copilot-session', 'call_bash'))
      .resolves.toMatchObject({ toolCallId: 'call_bash' })
    expect(copilot.readActivityDetail).toHaveBeenCalledExactlyOnceWith('copilot-session', 'call_bash')
    await expect(aggregate.readActivityDetail('claude-session', 'toolu_bash')).rejects.toMatchObject({
      statusCode: 501,
      message: 'Tool call details are unavailable for this provider.',
    })
    expect(claude.readActivityDetail).not.toHaveBeenCalled()
    await expect(aggregate.readActivityDetail('missing-session', 'call_bash')).rejects.toThrow('Session not found')

    const unadvertised = provider('copilot', false)
    await expect(new ProviderSessionService(
      unadvertised as unknown as SessionService,
      claude as unknown as SessionService,
    ).readActivityDetail('copilot-session', 'call_bash')).rejects.toMatchObject({ statusCode: 501 })
    expect(unadvertised.readActivityDetail).not.toHaveBeenCalled()
  })
})

describe('closed sessions across providers', () => {
  function closable(id: AgentProvider) {
    const owner = provider(id)
    const closedAt = '2020-01-01T00:00:00.000Z'
    return Object.assign(owner, {
      start: vi.fn(async () => undefined),
      stop: vi.fn(async () => undefined),
      closeSession: vi.fn(async (sessionId: string) => ({
        ...owner.getSession(sessionId)!, isOpen: false, closedAt,
      })),
      listClosedSessions: () => [{ ...owner.getSession(`${id}-session`)!, isOpen: false, closedAt }],
      deleteExpiredClosedSession: vi.fn(async () => true),
    })
  }

  it('closes on the owning provider and sweeps every provider once started', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const copilot = closable('copilot')
    const claude = closable('claude')
    const aggregate = new ProviderSessionService(
      copilot as unknown as SessionService, claude as unknown as SessionService,
    )

    await expect(aggregate.closeSession('claude-session')).resolves.toMatchObject({ closedAt: expect.any(String) })
    expect(claude.closeSession).toHaveBeenCalledExactlyOnceWith('claude-session')
    expect(copilot.closeSession).not.toHaveBeenCalled()
    expect(aggregate.listClosedSessions().map((session) => session.id).sort())
      .toEqual(['claude-session', 'copilot-session'])

    await aggregate.start()
    await vi.waitFor(() => {
      expect(copilot.deleteExpiredClosedSession).toHaveBeenCalledWith('copilot-session', expect.any(Number))
      expect(claude.deleteExpiredClosedSession).toHaveBeenCalledWith('claude-session', expect.any(Number))
    })
    await aggregate.stop()
  })
})

describe('provider routing', () => {
  it('finds the provider that owns a session without copying the session', async () => {
    // A copy carries the whole transcript, and the background task list is
    // asked for every session as the app loads.
    const tasks = { tasks: [], runningCount: 0, supported: true }
    const copilot = Object.assign(provider('copilot'), {
      hasSession: (sessionId: string) => sessionId === 'copilot-session',
      listBackgroundTasks: vi.fn(async () => tasks),
    })
    const claude = Object.assign(provider('claude'), {
      hasSession: (sessionId: string) => sessionId === 'claude-session',
      listBackgroundTasks: vi.fn(async () => tasks),
    })
    const copies = [vi.spyOn(copilot, 'getSession'), vi.spyOn(claude, 'getSession')]
    const aggregate = new ProviderSessionService(
      copilot as unknown as SessionService, claude as unknown as SessionService,
    )

    await aggregate.listBackgroundTasks('claude-session')

    expect(claude.listBackgroundTasks).toHaveBeenCalledWith('claude-session')
    expect(copilot.listBackgroundTasks).not.toHaveBeenCalled()
    for (const copy of copies) expect(copy).not.toHaveBeenCalled()
  })
})
