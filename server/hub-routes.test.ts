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

  it('uses the passive session reader when requested', async () => {
    const getSession = vi.fn(async () => ({ id: 'session-1', messages: [] }))
    const readSession = vi.fn(async () => ({ id: 'session-1', messages: [] }))
    const app = Fastify()
    await registerHubRoutes(
      app,
      {
        getSession,
        readSession,
        captureComputerRegistration: () => () => true,
        on: () => undefined,
        off: () => undefined,
      } as unknown as ComputerManager,
      {} as KnowledgeStore,
      muteCarrier([]),
    )

    const response = await app.inject({
      method: 'GET',
      url: '/api/computers/computer-1/sessions/session-1?passive=1',
      headers: { host: 'localhost' },
    })

    expect(response.statusCode).toBe(200)
    expect(readSession).toHaveBeenCalledWith('computer-1', 'session-1')
    expect(getSession).not.toHaveBeenCalled()
    await app.close()
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
        captureComputerRegistration: () => () => true,
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
        captureComputerRegistration: () => () => true,
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

  it('scopes Knowledge list and file responses to a nested session root', async () => {
    const listKnowledge = vi.fn(async () => ({
      path: 'projects/agentic-remote',
      parent: 'projects',
      entries: [
        {
          name: 'docs',
          path: 'projects/agentic-remote/docs',
          kind: 'directory' as const,
        },
        {
          name: 'shared-link',
          path: 'projects/shared',
          kind: 'directory' as const,
        },
      ],
    }))
    const readKnowledgeFile = vi.fn(async () => ({
      name: 'README.md',
      path: 'projects/agentic-remote/README.md',
      kind: 'markdown' as const,
      mimeType: 'text/markdown',
      size: 10,
      content: '# Project',
    }))
    const app = Fastify()
    await registerHubRoutes(
      app,
      {
        listComputers: () => [{ id: 'library', name: 'Library' }],
        captureComputerRegistration: () => () => true,
        listKnowledge,
        readKnowledgeFile,
        on: () => undefined,
        off: () => undefined,
      } as unknown as ComputerManager,
      {
        getRootConfinement: () => undefined,
        getRoot: () => ({
          id: 'projects',
          computerId: 'library',
          computerName: 'Library',
          path: '/home/demo',
          name: 'Projects',
          createdAt: '2026-09-11T00:00:00.000Z',
        }),
      } as unknown as KnowledgeStore,
    )

    const listing = await app.inject({
      url: '/api/knowledge/roots/projects/entries?path=.&basePath=projects%2Fagentic-remote',
      headers: { host: 'localhost' },
    })
    expect(listing.json()).toEqual({
      path: '.',
      entries: [{ name: 'docs', path: 'docs', kind: 'directory' }],
    })
    expect(listKnowledge).toHaveBeenCalledWith(
      'library',
      '/home/demo',
      'projects/agentic-remote',
      undefined,
    )

    const file = await app.inject({
      url: '/api/knowledge/roots/projects/file?path=README.md&basePath=projects%2Fagentic-remote',
      headers: { host: 'localhost' },
    })
    expect(file.json()).toMatchObject({ name: 'README.md', path: 'README.md' })
    expect(readKnowledgeFile).toHaveBeenCalledWith(
      'library',
      '/home/demo',
      'projects/agentic-remote/README.md',
      undefined,
    )

    readKnowledgeFile.mockResolvedValueOnce({
      name: 'shared.md',
      path: 'projects/shared/shared.md',
      kind: 'markdown',
      mimeType: 'text/markdown',
      size: 10,
      content: '# Shared',
    })
    const escaped = await app.inject({
      url: '/api/knowledge/roots/projects/file?path=shared-link%2Fshared.md&basePath=projects%2Fagentic-remote',
      headers: { host: 'localhost' },
    })
    expect(escaped.statusCode).toBe(403)
    await app.close()
  })

  it('carries mute state to a recovered replacement and forwards the reason', async () => {
    const mutes = muteCarrier(['computer-1:session-1'])
    const recoverConversation = vi.fn(async () => {
      mutes.muted = []
      return { id: 'session-1-recovered', computerId: 'computer-1' }
    })
    const app = Fastify()
    await registerHubRoutes(
      app,
      {
        recoverConversation,
        captureComputerRegistration: () => () => true,
        on: () => undefined,
        off: () => undefined,
      } as unknown as ComputerManager,
      {} as KnowledgeStore,
      mutes,
    )

    const response = await app.inject({
      method: 'POST',
      url: '/api/computers/computer-1/sessions/session-1/recover',
      headers: { host: 'localhost' },
      payload: { reason: 'stale-sdk-interaction' },
    })

    expect(response.statusCode).toBe(200)
    expect(recoverConversation).toHaveBeenCalledWith(
      'computer-1',
      'session-1',
      'stale-sdk-interaction',
    )
    expect(mutes.muted).toEqual(['computer-1:session-1-recovered'])
    await app.close()
  })

  it('does not keep a root for a computer unpaired while it was being added', async () => {
    let paired = true
    const stored = new Map<string, { id: string; computerId: string }>()
    const knowledge = {
      addRoot: async (root: { computerId: string }) => {
        const created = { ...root, id: `root-${stored.size + 1}` }
        stored.set(created.id, created)
        return created
      },
      removeRoot: async (id: string) => stored.delete(id),
    } as unknown as KnowledgeStore
    const app = Fastify()
    await registerHubRoutes(
      app,
      {
        listComputers: () =>
          paired ? [{ id: 'worker', name: 'worker-node' }] : [],
        captureComputerRegistration: () => () => paired,
        // Browsing the folder is a round trip to the other computer, and the
        // computer can be unpaired while it is in flight.
        listKnowledge: async () => {
          paired = false
          return { path: '.', entries: [] }
        },
        on: () => undefined,
        off: () => undefined,
      } as unknown as ComputerManager,
      knowledge,
    )

    const response = await app.inject({
      method: 'POST',
      url: '/api/knowledge/roots',
      headers: { host: 'localhost' },
      payload: { computerId: 'worker', path: '/home/tester/docs' },
    })

    expect(response.statusCode).toBe(404)
    expect([...stored.keys()]).toEqual([])
    await app.close()
  })

  it('rejects an old persisted root without removing a fresh pairing root', async () => {
    let registration = Symbol('original')
    let release!: () => void
    let entered!: () => void
    const writing = new Promise<void>((resolve) => { entered = resolve })
    const gate = new Promise<void>((resolve) => { release = resolve })
    const roots = new Map<string, { id: string; computerId: string }>()
    const removeRoot = vi.fn(async (id: string) => roots.delete(id))
    const app = Fastify()
    await registerHubRoutes(app, {
      listComputers: () => [{ id: 'worker', name: 'Worker' }],
      captureComputerRegistration: () => {
        const captured = registration
        return () => captured === registration
      },
      listKnowledge: async () => ({ path: '.', entries: [] }),
      on: () => undefined,
      off: () => undefined,
    } as unknown as ComputerManager, {
      reserveRoot: async (input: { computerId: string }) => {
        const root = { ...input, id: 'old-root' }
        roots.set(root.id, root)
        entered()
        await gate
        return {
          root,
          created: true,
          finalize: async (guard?: () => boolean) => {
            if (guard?.() ?? true) return true
            await removeRoot(root.id)
            return false
          },
          rollback: async () => removeRoot(root.id),
        }
      },
      removeRoot,
    } as unknown as KnowledgeStore)
    try {
      const response = app.inject({
        method: 'POST', url: '/api/knowledge/roots',
        headers: { host: 'localhost' },
        payload: { computerId: 'worker', path: '/home/tester/docs' },
      }).then((value) => value)
      await writing
      roots.clear()
      registration = Symbol('repaired')
      roots.set('fresh-root', { id: 'fresh-root', computerId: 'worker' })
      release()
      const rejected = await response
      expect(rejected.statusCode).toBe(409)
      expect(rejected.json().error).toContain('pairing changed while saving')
      expect([...roots.keys()]).toEqual(['fresh-root'])
      expect(removeRoot).toHaveBeenCalledExactlyOnceWith('old-root')
    } finally {
      release()
      await app.close()
    }
  })

  it('does not remove a reused root when its registration turns stale', async () => {
    let registration = Symbol('original')
    const existing = { id: 'existing', computerId: 'worker' }
    const removeRoot = vi.fn(async () => true)
    const stale = () => {
      registration = Symbol('repaired')
    }
    const app = Fastify()
    await registerHubRoutes(app, {
      listComputers: () => [{ id: 'worker', name: 'Worker' }],
      captureComputerRegistration: () => {
        const captured = registration
        return () => captured === registration
      },
      listKnowledge: async () => ({ path: '.', entries: [] }),
      on: () => undefined,
      off: () => undefined,
    } as unknown as ComputerManager, {
      reserveRoot: async () => {
        stale()
        return {
          root: existing,
          created: false,
          finalize: async (guard?: () => boolean) => guard?.() ?? true,
          rollback: async () => false,
        }
      },
      removeRoot,
    } as unknown as KnowledgeStore)

    const response = await app.inject({
      method: 'POST',
      url: '/api/knowledge/roots',
      headers: { host: 'localhost' },
      payload: { computerId: 'worker', path: '/home/tester/docs' },
    })

    expect(response.statusCode).toBe(409)
    expect(removeRoot).not.toHaveBeenCalled()
    await app.close()
  })

  it('rejects a registration that turns stale while finalization waits', async () => {
    let registration = Symbol('original')
    let release!: () => void
    let entered!: () => void
    const finalizing = new Promise<void>((resolve) => { entered = resolve })
    const gate = new Promise<void>((resolve) => { release = resolve })
    const app = Fastify()
    await registerHubRoutes(app, {
      listComputers: () => [{ id: 'worker', name: 'Worker' }],
      captureComputerRegistration: () => {
        const captured = registration
        return () => captured === registration
      },
      listKnowledge: async () => ({ path: '.', entries: [] }),
      on: () => undefined,
      off: () => undefined,
    } as unknown as ComputerManager, {
      reserveRoot: async () => ({
        root: { id: 'provisional', computerId: 'worker' },
        created: true,
        finalize: async (guard?: () => boolean) => {
          entered()
          await gate
          return guard?.() ?? true
        },
        rollback: async () => true,
      }),
    } as unknown as KnowledgeStore)
    try {
      const response = app.inject({
        method: 'POST',
        url: '/api/knowledge/roots',
        headers: { host: 'localhost' },
        payload: { computerId: 'worker', path: '/home/tester/docs' },
      }).then((value) => value)
      await finalizing
      registration = Symbol('repaired')
      release()

      const rejected = await response
      expect(rejected.statusCode).toBe(409)
      expect(rejected.json().error).toContain('pairing changed while saving')
    } finally {
      release()
      await app.close()
    }
  })
})
