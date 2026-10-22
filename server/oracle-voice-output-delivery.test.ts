import { describe, expect, it, vi } from 'vitest'
import type WebSocket from 'ws'
import {
  ORACLE_VOICE_PROTOCOL,
  VOICE_AUDIO_HEADER_BYTES,
  voiceAudioFrameByteLength,
  type VoiceAudioFrame,
  type VoiceClientControl,
} from '../shared/oracle-voice.js'
import {
  backendOutputRelay,
  localConnector,
  sendBrowserOutput,
  shutdownBackendOutput,
} from './oracle-voice-routes.js'
import {
  sendNodeVoiceOutput,
} from './node-routes.js'
import {
  voiceOutputDeliveryByteLimit,
  type VoiceBackend,
  type VoiceBackendOutput,
  type VoiceBackendSessionOpenOptions,
  type VoiceBackendSessionLimits,
} from './oracle-voice-session.js'

const streamId = 'voice-stream'
const sampleRate = 22_050
const segmentId = 'segment-2'

function limits(): VoiceBackendSessionLimits {
  return {
    maxFrameBytes: 32 * 1024,
    maxQueueBytes: 64 * 1024,
    maxOutputQueueBytes: voiceOutputDeliveryByteLimit(sampleRate, 32 * 1024),
    maxUtteranceMs: 30_000,
    idleTimeoutMs: 30_000,
  }
}

function playbackSequence(sampleCount: number): VoiceBackendOutput[] {
  const maxSamples = Math.floor(
    (32 * 1024 - VOICE_AUDIO_HEADER_BYTES - Buffer.byteLength(segmentId))
      / Int16Array.BYTES_PER_ELEMENT,
  )
  const outputs: VoiceBackendOutput[] = []
  let emitted = 0
  let sequence = 0
  while (emitted < sampleCount) {
    const count = Math.min(maxSamples, sampleCount - emitted)
    outputs.push({
      direction: 'playback',
      generation: 2,
      segmentId,
      sequence,
      sampleRate,
      samples: Int16Array.from(
        { length: count },
        (_, index) => (emitted + index) % 32_767,
      ),
    })
    emitted += count
    sequence += 1
  }
  outputs.push({
    type: 'audio_end',
    protocol: ORACLE_VOICE_PROTOCOL,
    streamId,
    generation: 2,
    segmentId,
  })
  return outputs
}

function outputBytes(output: VoiceBackendOutput): number {
  return 'direction' in output
    ? voiceAudioFrameByteLength(output)
    : Buffer.byteLength(JSON.stringify(output))
}

describe('Oracle voice output delivery', () => {
  it.each([
    ['heartbeat', {
      type: 'heartbeat',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId,
      generation: 2,
      timestamp: 1,
    }],
    ['interruption confirmation', {
      type: 'speech_confirmed',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId,
      generation: 2,
      utteranceId: 'interrupt-2',
    }],
    ['Oracle cancellation', {
      type: 'cancel',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId,
      generation: 2,
    }],
  ] satisfies Array<[string, VoiceClientControl]>)(
    'keeps hub-local controls moving during %s while accepted audio is still delivering',
    async (_label, selectedControl) => {
      let release!: () => void
      const gate = new Promise<void>((resolve) => {
        release = resolve
      })
      let opened!: VoiceBackendSessionOpenOptions
      let outputTail = Promise.resolve()
      const emit = (output: VoiceBackendOutput): Promise<void> => {
        const delivery = outputTail.catch(() => undefined).then(() => opened.send(output))
        outputTail = delivery
        return delivery
      }
      const backend: VoiceBackend = {
        capability: () => ({
          available: true,
          sampleRate: 16_000,
          playbackSampleRate: sampleRate,
          languages: ['en'],
          sttProfile: 'test',
          ttsVoice: 'test',
          resourceClass: 'low',
        }),
        limits,
        busy: () => false,
        open: vi.fn(async (options) => {
          opened = options
          return {
            control: async (message: VoiceClientControl) => emit(
              message.type === 'heartbeat'
                ? {
                    type: 'heartbeat',
                    protocol: ORACLE_VOICE_PROTOCOL,
                    streamId: message.streamId,
                    generation: message.generation,
                    timestamp: message.timestamp,
                  }
                : {
                    type: 'state',
                    protocol: ORACLE_VOICE_PROTOCOL,
                    streamId: message.streamId,
                    generation: message.generation,
                    state: message.type === 'cancel' ? 'ready' : 'listening',
                  },
            ),
            audio: async () => undefined,
            close: async () => undefined,
          }
        }),
        stop: async () => undefined,
      }
      const connector = localConnector(backend, {
        id: 'local',
        name: 'local',
        version: 'test',
      })
      const connection = await connector.connect({
        streamId,
        output: async () => {
          await gate
        },
        disconnect: async () => undefined,
        signal: new AbortController().signal,
      })
      const audio = emit(playbackSequence(1)[0])
      let controlSettled = false
      const control = connection.control(selectedControl).then(() => {
        controlSettled = true
      })

      try {
        await new Promise((resolve) => setImmediate(resolve))
        expect(controlSettled).toBe(true)
      } finally {
        release()
        await Promise.allSettled([audio, control])
        await connection.close('test complete')
      }
    },
  )

  it('returns the actual local delivery promise so backpressure propagates', async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const delivered: VoiceBackendOutput[] = []
    const relay = backendOutputRelay(
      async (output) => {
        await gate
        delivered.push(output)
      },
      async () => undefined,
      limits(),
    )
    const output = playbackSequence(1)[0]
    let settled = false

    const delivery = relay.accept(output).then(() => {
      settled = true
    })
    await new Promise((resolve) => setImmediate(resolve))

    expect(settled).toBe(false)
    expect(relay.pendingBytes()).toBe(outputBytes(output))
    release()
    await delivery
    expect(settled).toBe(true)
    expect(delivered).toEqual([output])
    expect(relay.pendingBytes()).toBe(0)
  })

  it.each([
    ['LJSpeech', 176_469],
    ['Faber', 148_224],
  ])('queues the full measured %s event sequence for a slow paired-node relay', async (
    _voice,
    sampleCount,
  ) => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const delivered: VoiceBackendOutput[] = []
    let first = true
    const disconnect = vi.fn(async () => undefined)
    const selectedLimits = limits()
    const relay = backendOutputRelay(
      async (output) => {
        if (first) {
          first = false
          await gate
        }
        delivered.push(output)
      },
      disconnect,
      selectedLimits,
    )
    const outputs = playbackSequence(sampleCount)

    for (const output of outputs) {
      void relay.accept(output).catch(() => undefined)
    }
    await new Promise((resolve) => setImmediate(resolve))

    expect(disconnect).not.toHaveBeenCalled()
    expect(relay.pendingBytes()).toBe(
      outputs.reduce((total, output) => total + outputBytes(output), 0),
    )
    expect(relay.pendingBytes()).toBeLessThanOrEqual(selectedLimits.maxOutputQueueBytes)
    release()
    await relay.drain()
    expect(delivered).toEqual(outputs)
    expect(relay.pendingBytes()).toBe(0)
  })

  it('fails closed without exceeding the 12-second playback delivery allocation', async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const delivered: VoiceBackendOutput[] = []
    const disconnect = vi.fn(async () => undefined)
    const selectedLimits = limits()
    const relay = backendOutputRelay(
      async (output) => {
        await gate
        delivered.push(output)
      },
      disconnect,
      selectedLimits,
    )

    const outputs = playbackSequence(sampleRate * 15)
    void relay.accept(outputs[0]).catch(() => undefined)
    await new Promise((resolve) => setImmediate(resolve))
    for (const output of outputs.slice(1)) {
      void relay.accept(output).catch(() => undefined)
      if (disconnect.mock.calls.length > 0) break
    }

    expect(disconnect).toHaveBeenCalledWith({
      code: 1013,
      reason: 'Voice backend output queue is full',
      retryable: false,
      cause: 'backpressure',
    })
    expect(relay.pendingBytes()).toBeLessThanOrEqual(selectedLimits.maxOutputQueueBytes)
    release()
    await relay.drain()
    expect(delivered).toEqual([expect.objectContaining({ sequence: 0 })])
    expect(relay.pendingBytes()).toBe(0)
  })

  it('aborts a never-settling delivery, releases queued work, and isolates the next stream', async () => {
    const invoked: VoiceBackendOutput[] = []
    const never = new Promise<void>(() => undefined)
    const relay = backendOutputRelay(
      (output) => {
        invoked.push(output)
        return never
      },
      async () => undefined,
      limits(),
    )
    const [first, second] = playbackSequence(2)
    const firstDelivery = relay.accept(first)
    const queuedDelivery = relay.accept(second)
    await new Promise((resolve) => setImmediate(resolve))

    expect(invoked).toEqual([first])
    expect(relay.pendingBytes()).toBe(outputBytes(first) + outputBytes(second))

    relay.abort(new Error('transport shutdown timed out'))

    await expect(firstDelivery).rejects.toThrow('transport shutdown timed out')
    await expect(queuedDelivery).rejects.toThrow('transport shutdown timed out')
    await expect(relay.drain()).resolves.toBeUndefined()
    expect(relay.pendingBytes()).toBe(0)
    expect(invoked).toEqual([first])

    const nextDelivered: VoiceBackendOutput[] = []
    const next = backendOutputRelay(
      async (output) => {
        nextDelivered.push(output)
      },
      async () => undefined,
      limits(),
    )
    await next.accept(second)
    await next.drain()
    expect(nextDelivered).toEqual([second])
    expect(next.pendingBytes()).toBe(0)
  })

  it('ignores a late in-flight rejection after relay abort', async () => {
    let rejectDelivery!: (error: Error) => void
    const disconnect = vi.fn(async () => undefined)
    const relay = backendOutputRelay(
      () => new Promise<void>((_resolve, reject) => {
        rejectDelivery = reject
      }),
      disconnect,
      limits(),
    )
    const delivery = relay.accept(playbackSequence(1)[0])
    await new Promise((resolve) => setImmediate(resolve))

    relay.abort(new Error('stream replaced'))
    await expect(delivery).rejects.toThrow('stream replaced')
    rejectDelivery(new Error('old socket callback'))
    await new Promise((resolve) => setImmediate(resolve))

    expect(disconnect).not.toHaveBeenCalled()
    expect(relay.pendingBytes()).toBe(0)
    await expect(relay.drain()).resolves.toBeUndefined()
  })

  it('aborts the relay and associated transport when connector drain times out', async () => {
    const relay = backendOutputRelay(
      () => new Promise<void>(() => undefined),
      async () => undefined,
      limits(),
    )
    const delivery = relay.accept(playbackSequence(1)[0])
    const abortTransport = vi.fn(async () => undefined)

    await shutdownBackendOutput(relay, abortTransport, 5)

    await expect(delivery).rejects.toThrow('Voice backend output shutdown timed out')
    await expect(relay.drain()).resolves.toBeUndefined()
    expect(relay.pendingBytes()).toBe(0)
    expect(abortTransport).toHaveBeenCalledOnce()
  })

  it.each([
    ['browser', sendBrowserOutput],
    ['node', sendNodeVoiceOutput],
  ])('keeps the slow %s WebSocket bufferedAmount limit at 64KB', async (
    _path,
    send,
  ) => {
    const output = playbackSequence(1)[0] as VoiceAudioFrame
    const selectedLimits = limits()
    const bytes = voiceAudioFrameByteLength(output)
    const socket = {
      OPEN: 1,
      readyState: 1,
      bufferedAmount: selectedLimits.maxQueueBytes - bytes + 1,
      send: vi.fn(),
    } as unknown as WebSocket

    await expect(send(socket, output, selectedLimits))
      .rejects.toMatchObject({ closeCode: 1013 })
    expect(socket.send).not.toHaveBeenCalled()
  })

  it('times out a browser WebSocket write that never completes', async () => {
    const output = playbackSequence(1)[0] as VoiceAudioFrame
    const socket = {
      OPEN: 1,
      readyState: 1,
      bufferedAmount: 0,
      send: vi.fn(),
      terminate: vi.fn(),
    } as unknown as WebSocket

    await expect(sendBrowserOutput(socket, output, limits(), 5))
      .rejects.toMatchObject({
        closeCode: 1001,
        message: 'Browser voice output timed out',
      })
    expect(socket.send).toHaveBeenCalledOnce()
    expect(socket.terminate).toHaveBeenCalledOnce()
  })
})
