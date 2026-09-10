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
    }],
    dispatchQueuedPrompt: vi.fn(async (_sessionId: string, promptId: string, _content: string) => ({
      outcome: 'sent' as const, promptId, attemptId: '11111111-1111-4111-8111-111111111111', session,
    })),
    removeQueuedPrompt: vi.fn(async () => ({
      session, prompt: { id: 'prompt', content: 'original', createdAt: session.updatedAt },
    })),
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
})
