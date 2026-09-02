import Fastify from 'fastify'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComputerManager } from './computer-manager.js'
import type { KnowledgeStore } from './knowledge-store.js'
import { registerHubRoutes, type SessionMuteCarrier } from './hub-routes.js'

function muteCarrier(initial: string[]): SessionMuteCarrier & {
  muted: string[]
} {
  const carrier = {
    muted: [...initial],
    settings: () => ({ mutedSessions: [...carrier.muted] }),
    setSessionMuted: async (
      computerId: string,
      sessionId: string,
      muted: boolean,
    ) => {
      const key = `${computerId}:${sessionId}`
      carrier.muted = muted
        ? [...new Set([...carrier.muted, key])]
        : carrier.muted.filter((entry) => entry !== key)
      return { mutedSessions: [...carrier.muted] }
    },
  }
  return carrier
}

describe('hub routes', () => {
  beforeEach(() => {
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', '')
  })

  it('keeps a cleared conversation silenced when the node drops the mute', async () => {
    const mutes = muteCarrier(['computer-1:session-1'])
    const clearConversation = vi.fn(async () => {
      // A node that predates the replacement link reports the clear as a
      // plain removal, so the hub has already forgotten the mute by the time
      // the replacement is known.
      mutes.muted = mutes.muted.filter(
        (entry) => entry !== 'computer-1:session-1',
      )
      return { id: 'session-1-cleared', computerId: 'computer-1' }
    })
    const app = Fastify()
    await registerHubRoutes(
      app,
      {
        clearConversation,
        on: () => undefined,
        off: () => undefined,
      } as unknown as ComputerManager,
      {} as KnowledgeStore,
      mutes,
    )

    const response = await app.inject({
      method: 'POST',
      url: '/api/computers/computer-1/sessions/session-1/clear',
      headers: { host: 'localhost' },
    })

    expect(response.statusCode).toBe(200)
    expect(clearConversation).toHaveBeenCalledWith('computer-1', 'session-1')
    expect(mutes.muted).toEqual(['computer-1:session-1-cleared'])
    await app.close()
  })

  it('leaves an unsilenced conversation alone when it is cleared', async () => {
    const mutes = muteCarrier([])
    const app = Fastify()
    await registerHubRoutes(
      app,
      {
        clearConversation: async () => ({
          id: 'session-1-cleared',
          computerId: 'computer-1',
        }),
        on: () => undefined,
        off: () => undefined,
      } as unknown as ComputerManager,
      {} as KnowledgeStore,
      mutes,
    )

    const response = await app.inject({
      method: 'POST',
      url: '/api/computers/computer-1/sessions/session-1/clear',
      headers: { host: 'localhost' },
    })

    expect(response.statusCode).toBe(200)
    expect(mutes.muted).toEqual([])
    await app.close()
  })
})
