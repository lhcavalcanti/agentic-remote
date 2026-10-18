import { describe, expect, it, vi } from 'vitest'
import type WebSocket from 'ws'
import {
  ORACLE_VOICE_PROTOCOL,
  VOICE_AUDIO_HEADER_BYTES,
  voiceAudioFrameByteLength,
  type VoiceAudioFrame,
} from '../shared/oracle-voice.js'
import {
  backendOutputRelay,
  sendBrowserOutput,
} from './oracle-voice-routes.js'
import {
  sendNodeVoiceOutput,
} from './node-routes.js'
import {
  voiceOutputDeliveryByteLimit,
  type VoiceBackendOutput,
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
    })
    expect(relay.pendingBytes()).toBeLessThanOrEqual(selectedLimits.maxOutputQueueBytes)
    release()
    await relay.drain()
    expect(delivered).toEqual([expect.objectContaining({ sequence: 0 })])
    expect(relay.pendingBytes()).toBe(0)
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
})
