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
    providers: () => [{
      id, name: id, available: true, terminalBacked: false,
      ...(supported ? { supportsQueuedPromptDispatch: true } : {}),
      supportsContextRecovery: id === 'copilot' && supported,
      supportsSideQuestions: id === 'copilot' && supported,
    }],
    dispatchQueuedPrompt: vi.fn(async (_sessionId: string, promptId: string, _content: string) => ({
      outcome: 'sent' as const, promptId, attemptId: '11111111-1111-4111-8111-111111111111', session,
    })),
    removeQueuedPrompt: vi.fn(async () => ({
      session, prompt: { id: 'prompt', content: 'original', createdAt: session.updatedAt },
    })),
    askSession: vi.fn(async (_sessionId: string, question: string) => `Answer: ${question}`),
    recoverConversation: vi.fn(async () => ({
      ...session,
      id: `${id}-recovered`,
      replacedSessionIds: [session.id],
    })),
  })
}

describe('provider queued dispatch aggregation', () => {
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
