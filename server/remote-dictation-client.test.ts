import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterEach, describe, expect, it, vi } from 'vitest'
import WebSocket, { WebSocketServer } from 'ws'
import { openNodeDictationSocket } from './remote-dictation-client.js'

const closers: Array<() => Promise<void>> = []

afterEach(async () => {
  await Promise.all(closers.splice(0).map((close) => close()))
})

/** A node's dictation route that accepts every upgrade, calling `onConnection` as it does. */
async function dictationNode(onConnection?: (socket: WebSocket) => void) {
  const server = createServer()
  const websocket = new WebSocketServer({ noServer: true })
  const node = { connections: 0, open: 0 }
  server.on('upgrade', (request, socket, head) => {
    websocket.handleUpgrade(request, socket, head, (upgraded) => {
      node.connections += 1
      node.open += 1
      upgraded.once('close', () => {
        node.open -= 1
      })
      onConnection?.(upgraded)
    })
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  closers.push(() => new Promise<void>((resolve) => {
    for (const socket of websocket.clients) socket.terminate()
    websocket.close(() => server.close(() => resolve()))
  }))
  const { port } = server.address() as AddressInfo
  return {
    node,
    computer: { id: 'node-id', name: 'Speech node', baseUrl: `http://127.0.0.1:${port}`, token: 'node-token' },
  }
}

describe('a paired node\'s dictation socket', () => {
  it('is refused when the pairing changes while it connects', async () => {
    const registration = new AbortController()
    const { node, computer } = await dictationNode(() => registration.abort())
    await expect(openNodeDictationSocket(computer, { registrationSignal: registration.signal }))
      .rejects.toThrow('Speech node was paired again')
    expect(node.connections).toBe(1)
    await vi.waitFor(() => expect(node.open).toBe(0))
  })

  it('closes when the pairing changes after it opened', async () => {
    const registration = new AbortController()
    const { computer } = await dictationNode()
    const socket = await openNodeDictationSocket(computer, { registrationSignal: registration.signal })
    const closed = new Promise<number>((resolve) => socket.once('close', (code) => resolve(code)))
    registration.abort()
    expect(await closed).toBe(1001)
  })
})
