import { createServer, type IncomingMessage } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterEach, describe, expect, it, vi } from 'vitest'
import WebSocket, { WebSocketServer } from 'ws'
import {
  ORACLE_VOICE_PROTOCOL,
  ORACLE_VOICE_SAMPLE_RATE,
  decodeVoiceAudioFrame,
  encodeVoiceAudioFrame,
  type VoiceAudioFrame,
  type VoiceCapabilities,
  type VoiceClientControl,
} from '../shared/oracle-voice.js'
import type { RegisteredComputer } from './computer-registry.js'
import {
  RemoteVoiceClient,
  RemoteVoiceDisconnectError,
} from './remote-voice-client.js'
import { RemoteNodeClient } from './remote-node-client.js'

const sockets = new Set<WebSocket>()
const closeServers: Array<() => Promise<void>> = []

const capabilities: VoiceCapabilities = {
  protocol: ORACLE_VOICE_PROTOCOL,
  available: true,
  computerId: 'node-id',
  computerName: 'Voice node',
  sampleRate: ORACLE_VOICE_SAMPLE_RATE,
  playbackSampleRate: 22_050,
  languages: ['en'],
  sttProfile: 'zipformer',
  ttsVoice: 'lessac',
  resourceClass: 'low',
  limits: {
    maxFrameBytes: 32 * 1024,
    maxQueueBytes: 64 * 1024,
    maxUtteranceMs: 30_000,
  },
}

function control(
  type: VoiceClientControl['type'],
  generation: number,
  streamId = 'stream-1',
  extra: Record<string, unknown> = {},
): VoiceClientControl {
  return {
    type,
    protocol: ORACLE_VOICE_PROTOCOL,
    streamId,
    generation,
    ...extra,
  } as VoiceClientControl
}

function frame(generation: number, sequence: number): VoiceAudioFrame {
  return {
    direction: 'microphone',
    generation,
    sequence,
    sampleRate: ORACLE_VOICE_SAMPLE_RATE,
    samples: Int16Array.of(-1, 2),
  }
}

interface VoiceNode {
  computer: RegisteredComputer
  connections: number
  authorization: string[]
  received: Array<VoiceClientControl | VoiceAudioFrame>
  send(output: string | ArrayBuffer): void
  closeSocket(code?: number, reason?: string): void
}

async function voiceNode(
  onConnection?: (socket: WebSocket, request: IncomingMessage) => void,
): Promise<VoiceNode> {
  const received: Array<VoiceClientControl | VoiceAudioFrame> = []
  const authorization: string[] = []
  const server = createServer()
  const websocket = new WebSocketServer({ noServer: true })
  let connections = 0
  let active: WebSocket | undefined
  server.on('upgrade', (request, socket, head) => {
    authorization.push(request.headers.authorization || '')
    websocket.handleUpgrade(request, socket, head, (upgraded) => {
      connections += 1
      active = upgraded
      sockets.add(upgraded)
      upgraded.once('close', () => sockets.delete(upgraded))
      onConnection?.(upgraded, request)
      upgraded.send(JSON.stringify({
        type: 'hello',
        protocol: ORACLE_VOICE_PROTOCOL,
        streamId: new URL(request.url!, 'http://node.test').searchParams.get('streamId'),
        generation: 0,
        capabilities,
      }))
      upgraded.on('message', (data, isBinary) => {
        received.push(isBinary
          ? decodeVoiceAudioFrame(exactArrayBuffer(data))
          : JSON.parse(data.toString()) as VoiceClientControl)
      })
    })
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  closeServers.push(async () => {
    for (const socket of websocket.clients) socket.terminate()
    await new Promise<void>((resolve, reject) => {
      websocket.close(() => {
        server.close((error) => {
          if (error) reject(error)
          else resolve()
        })
      })
    })
  })
  const address = server.address() as AddressInfo
  return {
    computer: {
      id: 'node-id',
      name: 'Voice node',
      baseUrl: `http://127.0.0.1:${address.port}`,
      token: 'pairing-token',
    },
    get connections() {
      return connections
    },
    authorization,
    received,
    send(output) {
      active?.send(typeof output === 'string' ? output : Buffer.from(output))
    },
    closeSocket(code, reason) {
      active?.close(code, reason)
    },
  }
}

afterEach(async () => {
  vi.useRealTimers()
  for (const socket of sockets) socket.terminate()
  sockets.clear()
  await Promise.all(closeServers.splice(0).map((close) => close()))
})

describe('RemoteVoiceClient', () => {
  it('authenticates once and forwards controls plus binary microphone audio in order', async () => {
    const node = await voiceNode()
    const remote = await RemoteVoiceClient.connect(node.computer, 'stream-1')
    try {
      await remote.send(control('start', 1, 'stream-1', { language: 'en' }))
      await remote.send(control('speech_confirmed', 1, 'stream-1', {
        utteranceId: 'u1',
      }))
      await remote.send(frame(1, 0))

      await vi.waitFor(() => {
        expect(node.received).toHaveLength(3)
      })
      expect(node.authorization).toEqual(['Bearer pairing-token'])
      expect(node.received).toEqual([
        control('start', 1, 'stream-1', { language: 'en' }),
        control('speech_confirmed', 1, 'stream-1', { utteranceId: 'u1' }),
        frame(1, 0),
      ])
      expect(remote.capabilities).toEqual(capabilities)
    } finally {
      await remote.stop('test complete')
    }
  })

  it('validates and exposes ordered node controls plus native-rate playback frames', async () => {
    const node = await voiceNode()
    const remote = await RemoteVoiceClient.connect(node.computer, 'stream-1')
    const seen: unknown[] = []
    remote.on('event', (event) => seen.push(event))

    node.send(JSON.stringify({
      type: 'partial',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: 'stream-1',
      generation: 2,
      utteranceId: 'u2',
      text: 'Hel',
    }))
    node.send(encodeVoiceAudioFrame({
      direction: 'playback',
      generation: 2,
      sequence: 0,
      sampleRate: 22_050,
      samples: Int16Array.of(-2, 2),
    }))

    await vi.waitFor(() => expect(seen).toHaveLength(2))
    expect(seen).toEqual([
      expect.objectContaining({ type: 'partial', text: 'Hel' }),
      {
        direction: 'playback',
        generation: 2,
        sequence: 0,
        sampleRate: 22_050,
        samples: Int16Array.of(-2, 2),
      },
    ])
    await remote.stop('test complete')
  })

  it('refuses redirects without following them', async () => {
    let redirected = 0
    const target = createServer((_request, response) => {
      redirected += 1
      response.end()
    })
    await new Promise<void>((resolve) => target.listen(0, '127.0.0.1', resolve))
    const targetAddress = target.address() as AddressInfo
    const redirect = createServer()
    redirect.on('upgrade', (_request, socket) => {
      socket.end(
        'HTTP/1.1 307 Temporary Redirect\r\n'
        + `Location: http://127.0.0.1:${targetAddress.port}/secret\r\n`
        + '\r\n',
      )
    })
    await new Promise<void>((resolve) => redirect.listen(0, '127.0.0.1', resolve))
    const address = redirect.address() as AddressInfo
    closeServers.push(async () => {
      await Promise.all([
        new Promise<void>((resolve) => redirect.close(() => resolve())),
        new Promise<void>((resolve) => target.close(() => resolve())),
      ])
    })

    await expect(RemoteVoiceClient.connect({
      id: 'redirect',
      name: 'Redirecting node',
      baseUrl: `http://127.0.0.1:${address.port}`,
      token: 'secret-token',
    }, 'stream-1')).rejects.toMatchObject({
      name: 'RemoteNodeRedirectError',
      statusCode: 502,
    })
    expect(redirected).toBe(0)
  })

  it('times out a stalled upgrade', async () => {
    const server = createServer()
    let stalledSocket: { destroy(): void } | undefined
    server.on('upgrade', (_request, socket) => {
      stalledSocket = socket
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address() as AddressInfo
    closeServers.push(async () => {
      stalledSocket?.destroy()
      await new Promise<void>((resolve) => server.close(() => resolve()))
    })

    await expect(RemoteVoiceClient.connect({
      id: 'stalled',
      name: 'Stalled node',
      baseUrl: `http://127.0.0.1:${address.port}`,
      token: 'secret-token',
    }, 'stream-1', {
      connectTimeoutMs: 25,
    })).rejects.toThrow('timed out')
  })

  it('aborts a connection immediately when the node registration changes during upgrade', async () => {
    const registration = new AbortController()
    const node = await voiceNode(() => registration.abort())

    await expect(RemoteVoiceClient.connect(node.computer, 'stream-1', {
      connectTimeoutMs: 5_000,
      registrationSignal: registration.signal,
    })).rejects.toThrow('registration changed')
    expect(node.connections).toBe(1)
  })

  it('reports node disconnect once and never reconnects or replays queued audio', async () => {
    const node = await voiceNode()
    const remote = await RemoteVoiceClient.connect(node.computer, 'stream-1')
    const disconnected = vi.fn()
    remote.on('disconnect', disconnected)

    node.closeSocket(1011, 'node stopped')
    await vi.waitFor(() => expect(disconnected).toHaveBeenCalledOnce())
    expect(disconnected.mock.calls[0][0]).toBeInstanceOf(RemoteVoiceDisconnectError)
    await expect(remote.send(frame(1, 0))).rejects.toThrow('disconnected')
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(node.connections).toBe(1)
    expect(node.received).toEqual([])
  })

  it('fails closed on outbound backpressure and does not send the rejected payload', async () => {
    const node = await voiceNode()
    const remote = await RemoteVoiceClient.connect(node.computer, 'stream-1', {
      maxBufferedBytes: 8,
    })
    const disconnected = vi.fn()
    remote.on('disconnect', disconnected)

    await expect(remote.send(control('start', 1, 'stream-1', {
      language: 'en',
    }))).rejects.toMatchObject({ closeCode: 1013 })
    await vi.waitFor(() => expect(disconnected).toHaveBeenCalledOnce())
    expect(node.received).toEqual([])
  })

  it('stops explicitly and aborts immediately with its RemoteNodeClient registration', async () => {
    const firstNode = await voiceNode()
    const direct = await RemoteVoiceClient.connect(firstNode.computer, 'stream-1')
    const directDisconnect = vi.fn()
    direct.on('disconnect', directDisconnect)
    await direct.stop('user stopped')
    expect(directDisconnect).not.toHaveBeenCalled()
    await expect(direct.send(frame(1, 0))).rejects.toThrow('stopped')

    const secondNode = await voiceNode()
    const owner = new RemoteNodeClient(secondNode.computer)
    const owned = await owner.connectVoice('stream-2')
    const ownedDisconnect = vi.fn()
    owned.on('disconnect', ownedDisconnect)
    owner.stop()

    await vi.waitFor(() => expect(ownedDisconnect).toHaveBeenCalledOnce())
    await expect(owned.send(frame(1, 0))).rejects.toThrow('registration')
    expect(secondNode.connections).toBe(1)
  })

  it('disconnects explicitly on malformed or wrong-stream node payloads', async () => {
    const node = await voiceNode()
    const remote = await RemoteVoiceClient.connect(node.computer, 'stream-1')
    const disconnected = vi.fn()
    remote.on('disconnect', disconnected)

    node.send(JSON.stringify({
      type: 'partial',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: 'other-stream',
      generation: 1,
      utteranceId: 'u1',
      text: 'wrong stream',
    }))

    await vi.waitFor(() => expect(disconnected).toHaveBeenCalledOnce())
    expect(disconnected.mock.calls[0][0]).toMatchObject({
      message: expect.stringContaining('invalid'),
    })
  })
})

function exactArrayBuffer(data: WebSocket.RawData): ArrayBuffer {
  const buffer = Array.isArray(data)
    ? Buffer.concat(data)
    : data instanceof ArrayBuffer
      ? Buffer.from(data)
      : Buffer.from(data.buffer, data.byteOffset, data.byteLength)
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer
}
