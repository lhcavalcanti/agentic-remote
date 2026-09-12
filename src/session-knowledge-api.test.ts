import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SessionKnowledgeBinding } from '../shared/contracts'
import {
  getSessionKnowledgeRoot,
  listSessionKnowledgeEntries,
  readSessionKnowledgeFile,
  SessionKnowledgeRequestError,
  updateSessionKnowledgeRoot,
} from './api'

const binding: SessionKnowledgeBinding = {
  computerId: 'computer/id',
  sessionId: 'session/id',
  rootId: null,
  revision: 2,
  available: false,
}

afterEach(() => vi.unstubAllGlobals())

describe('session Knowledge API', () => {
  it('reads the encoded session identity without caching or changing it', async () => {
    const fetchMock = vi.fn(async () => Response.json({ binding }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(getSessionKnowledgeRoot('computer/id', 'session/id')).resolves.toEqual(binding)
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      '/api/computers/computer%2Fid/sessions/session%2Fid/knowledge-root',
      { cache: 'no-store' },
    )
  })

  it.each(['root-id', null])('conditionally saves the explicit %s choice', async (rootId) => {
    const saved = { ...binding, rootId, revision: 3 }
    const fetchMock = vi.fn(async () => Response.json({ binding: saved }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(updateSessionKnowledgeRoot('computer/id', 'session/id', {
      rootId, expectedRevision: 2,
    })).resolves.toEqual(saved)
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      '/api/computers/computer%2Fid/sessions/session%2Fid/knowledge-root',
      {
        cache: 'no-store',
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rootId, expectedRevision: 2 }),
      },
    )
  })

  it('exposes conflict status and the latest binding without retrying a stale save', async () => {
    const fetchMock = vi.fn(async () => Response.json({
      error: 'This session’s Knowledge folder changed in another client. Reload it.',
      binding,
    }, { status: 409 }))
    vi.stubGlobal('fetch', fetchMock)
    const result = updateSessionKnowledgeRoot('computer/id', 'session/id', {
      rootId: 'one', expectedRevision: 1,
    })
    await expect(result).rejects.toBeInstanceOf(SessionKnowledgeRequestError)
    await expect(result).rejects.toMatchObject({ status: 409, binding, message: expect.stringContaining('Reload') })
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('preserves actionable server errors for reads as well as writes', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({
      error: 'The owning computer could not verify this session. Reconnect it and try again.',
    }, { status: 503 })))
    await expect(getSessionKnowledgeRoot('computer/id', 'session/id'))
      .rejects.toMatchObject({ status: 503, message: expect.stringContaining('Reconnect') })
  })

  it('does not expose raw default server errors', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({
      statusCode: 500, error: 'Internal Server Error', message: 'private filesystem path',
    }, { status: 500 })))
    await expect(getSessionKnowledgeRoot('computer/id', 'session/id'))
      .rejects.toMatchObject({ status: 500, message: 'Internal Server Error' })
  })

  it('retains an HTTP status when an error body cannot be decoded', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('not-json', { status: 502 })))
    await expect(getSessionKnowledgeRoot('computer/id', 'session/id'))
      .rejects.toMatchObject({ status: 502, message: 'Request failed (502)' })
  })

  it('does not retry a lost write acknowledgment', async () => {
    const fetchMock = vi.fn(async () => { throw new TypeError('Connection lost') })
    vi.stubGlobal('fetch', fetchMock)
    await expect(updateSessionKnowledgeRoot('computer/id', 'session/id', {
      rootId: null, expectedRevision: 2,
    })).rejects.toThrow('Connection lost')
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('reads entries and files through the session-scoped Knowledge routes', async () => {
    const listing = { path: '.', entries: [] }
    const file = {
      name: 'guide.md',
      path: 'guide.md',
      kind: 'markdown' as const,
      mimeType: 'text/plain',
      size: 4,
      content: 'test',
    }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json(listing))
      .mockResolvedValueOnce(Response.json(file))
    vi.stubGlobal('fetch', fetchMock)
    await expect(listSessionKnowledgeEntries('computer/id', 'session/id', 'nested'))
      .resolves.toEqual(listing)
    await expect(readSessionKnowledgeFile('computer/id', 'session/id', 'guide.md'))
      .resolves.toEqual(file)
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/computers/computer%2Fid/sessions/session%2Fid/knowledge/entries?path=nested',
      expect.objectContaining({ headers: expect.any(Headers) }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/computers/computer%2Fid/sessions/session%2Fid/knowledge/file?path=guide.md',
      expect.objectContaining({ headers: expect.any(Headers) }),
    )
  })
})
