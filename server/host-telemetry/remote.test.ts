import { once } from 'node:events'
import type { AddressInfo } from 'node:net'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { WebSocketServer, type WebSocket } from 'ws'
import { subscribeRemoteHost, HOST_TELEMETRY_STALE_STREAM_MS } from './remote.js'

const servers: WebSocketServer[] = []
const subscriptions: (() => void)[] = []
const empty = { info: null, latest: null, live: [], disk: null }

afterEach(async () => {
  for (const close of subscriptions.splice(0)) close()
  vi.useRealTimers()
  for (const server of servers.splice(0)) {
    for (const socket of server.clients) socket.terminate()
    await new Promise<void>((resolve) => server.close(() => resolve()))
  }
})

async function connect() {
  const server = new WebSocketServer({ host: '127.0.0.1', port: 0 })
  servers.push(server)
  await once(server, 'listening')
  const connected = once(server, 'connection')
  const controller = new AbortController()
  const sample = vi.fn()
  const ended = vi.fn()
  const ready = subscribeRemoteHost({
    id: 'fictional-node', name: 'Fictional node',
    baseUrl: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    token: 'fictional-token',
  }, controller.signal, sample, ended)
  const [peer, request] = await connected as [WebSocket, { headers: Record<string, string>; url: string }]
  const close = await ready
  subscriptions.push(close)
  return { peer, request, close, controller, sample, ended }
}

describe('bounded authenticated remote host stream', () => {
  it('authenticates, validates samples and tears down the remote viewer on registration cancellation', async () => {
    const { peer, request, controller, sample, ended, close } = await connect()
    expect(request.url).toBe('/node-api/host/live')
    expect(request.headers.authorization).toBe('Bearer fictional-token')
    peer.send(JSON.stringify({ type: 'host.snapshot', snapshot: empty }))
    await vi.waitFor(() => expect(sample).toHaveBeenCalledWith(empty))
    const closed = once(peer, 'close')
    controller.abort()
    await closed
    close()
    expect(ended).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['malformed JSON', '{'],
    ['an invalid snapshot', JSON.stringify({ type: 'host.snapshot', snapshot: { live: [] } })],
    ['an unsupported message', JSON.stringify({ type: 'host.future' })],
    ['a binary frame', Buffer.from('not host telemetry')],
    ['an oversized frame', 'x'.repeat(128 * 1024 + 1)],
  ])('disconnects on %s instead of forwarding untrusted peer data', async (_label, payload) => {
    const { peer, sample, ended } = await connect()
    const closed = once(peer, 'close')
    peer.send(payload)
    await closed
    expect(sample).not.toHaveBeenCalled()
    expect(ended).toHaveBeenCalledTimes(1)
    expect(ended).toHaveBeenCalledWith('HOST_TELEMETRY_INVALID')
  })

  it('forwards an explicit incompatible live close from an updated node', async () => {
    const { peer, ended } = await connect()
    peer.close(4002, 'HOST_TELEMETRY_INVALID')
    await vi.waitFor(() => expect(ended).toHaveBeenCalledTimes(1))
    expect(ended).toHaveBeenCalledWith('HOST_TELEMETRY_INVALID')
  })

  it('preserves ordinary transport loss without an incompatibility reason', async () => {
    const { peer, ended } = await connect()
    peer.terminate()
    await vi.waitFor(() => expect(ended).toHaveBeenCalledTimes(1))
    expect(ended.mock.calls[0][0]).toBeUndefined()
  })

  it('does not classify a downstream sample consumer failure as invalid node telemetry', async () => {
    const { peer, sample, ended } = await connect()
    sample.mockImplementation(() => { throw new Error('Fictional consumer failed') })
    peer.send(JSON.stringify({ type: 'host.snapshot', snapshot: empty }))
    await vi.waitFor(() => expect(ended).toHaveBeenCalledTimes(1))
    expect(ended.mock.calls[0][0]).toBeUndefined()
  })

  it('disconnects a stalled owning computer after 20s without samples', async () => {
    vi.useFakeTimers()
    const { peer, ended } = await connect()
    const closed = once(peer, 'close')
    await vi.advanceTimersByTimeAsync(HOST_TELEMETRY_STALE_STREAM_MS)
    await closed
    expect(ended).toHaveBeenCalledTimes(1)
    expect(ended.mock.calls[0][0]).toBeUndefined()
  })
})
