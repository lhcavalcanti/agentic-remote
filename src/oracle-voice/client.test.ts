import { describe, expect, it, vi, type Mock } from 'vitest'
import type { ManagerClientDefaults } from '../../shared/manager'
import {
  ORACLE_VOICE_PROTOCOL,
  ORACLE_VOICE_SAMPLE_RATE,
  encodeVoiceAudioFrame,
  type VoiceAudioFrame,
  type VoiceCapabilities,
  type VoiceClientControl,
  type VoiceServerControl,
} from '../../shared/oracle-voice'
import { VoiceCaptureError, type VoiceCaptureOptions } from './capture'
import {
  OracleVoiceClient,
  OracleVoiceClientError,
  type OracleVoiceClientDependencies,
  type OracleVoiceSocket,
} from './client'
import type { VoicePlaybackOptions } from './playback'
import {
  HUB_SIGN_IN_EXPIRED_MESSAGE,
  hubSignInExpired,
  setHubSignInExpired,
} from '../hub-sign-in'

const capabilities: VoiceCapabilities = {
  protocol: ORACLE_VOICE_PROTOCOL,
  available: true,
  computerId: 'hub',
  computerName: 'Hub',
  sampleRate: ORACLE_VOICE_SAMPLE_RATE,
  playbackSampleRate: 24_000,
  languages: ['en', 'pt-BR'],
  sttProfile: 'zipformer',
  ttsVoice: 'lessac',
  resourceClass: 'low',
  limits: {
    maxFrameBytes: 32 * 1024,
    maxQueueBytes: 64 * 1024,
    maxUtteranceMs: 30_000,
  },
}

describe('OracleVoiceClient', () => {
  it('reports an expired hub sign-in instead of an unreachable hub', async () => {
    const gatewayFetch = vi.fn(async (_input: string, _init?: RequestInit) => new Response(null, {
      status: 401,
      headers: { 'www-authenticate': 'Cloudflare-Access resource_metadata="https://hub.test/"' },
    }))
    vi.stubGlobal('fetch', gatewayFetch)
    try {
      const client = harness({ defaultFetch: true })
      await expect(client.instance.start()).rejects.toThrow(HUB_SIGN_IN_EXPIRED_MESSAGE)

      expect(new Headers(gatewayFetch.mock.calls[0]?.[1]?.headers).get('x-requested-with'))
        .toBe('XMLHttpRequest')
      expect(hubSignInExpired()).toBe(true)
      expect(client.errors().map((error) => error.message)).toEqual([HUB_SIGN_IN_EXPIRED_MESSAGE])
    } finally {
      vi.unstubAllGlobals()
      setHubSignInExpired(false)
    }
  })

  it('fetches capability and a ticket, validates hello, then starts capture', async () => {
    const client = harness()
    const starting = client.instance.start()

    await vi.waitFor(() => expect(client.sockets).toHaveLength(1))
    expect(client.captures).toEqual([])
    client.sockets[0].open()
    client.sockets[0].message(hello('stream-1'))
    await starting

    expect(client.requestPaths()).toEqual([
      'GET /api/oracle-voice/capabilities',
      'POST /api/oracle-voice/tickets',
    ])
    expect(client.captures[0].start).toHaveBeenCalledOnce()
    expect(client.captures[0].options.maxUtteranceMs).toBe(30_000)
    expect(client.startControls(0)).toEqual([
      expect.objectContaining({
        type: 'start',
        streamId: 'stream-1',
        generation: 0,
        language: 'en',
      }),
    ])
    expect(client.instance.currentState).toBe('listening')
  })

  it('acknowledges each server heartbeat once to keep an idle stream alive', async () => {
    const client = harness()
    await client.connect('stream-1')
    const heartbeat = control('heartbeat', 'stream-1', 0, {
      timestamp: 123,
    })

    client.sockets[0].message(heartbeat)
    client.sockets[0].message(heartbeat)

    expect(client.sockets[0].jsonMessages().filter(
      (message) => message.type === 'heartbeat',
    )).toEqual([heartbeat])
  })

  it('reports the negotiated utterance limit without replacing live state', async () => {
    const client = harness()
    await client.connect('stream-1')

    client.captures[0].options.onUtteranceLimit?.(30_000)

    expect(client.errors()).toContainEqual(expect.objectContaining({
      code: 'utterance-limit',
      message: 'Conversation submitted the first 30 seconds of speech.',
      fatal: false,
    }))
    expect(client.instance.currentState).toBe('listening')
  })

  it('creates and resumes the separate playback context in the start gesture', async () => {
    const client = harness()
    const starting = client.instance.start()
    const playbackStartedSynchronously =
      client.playbacks.length === 1
      && client.playbacks[0].start.mock.calls.length === 1

    await vi.waitFor(() => expect(client.sockets).toHaveLength(1))
    client.sockets[0].open()
    client.sockets[0].message(hello('stream-1'))
    await starting

    expect(playbackStartedSynchronously).toBe(true)
    expect(client.captures[0].start).toHaveBeenCalledAfter(
      client.playbacks[0].start,
    )
    expect(client.playbacks[0].options.maxQueuedSeconds).toBe(12)
  })

  it('does not report listening until microphone capture is actually ready', async () => {
    const client = harness({ deferCaptureStart: true })
    const starting = client.instance.start()
    await vi.waitFor(() => expect(client.sockets).toHaveLength(1))
    client.sockets[0].open()
    client.sockets[0].message(hello('stream-1'))
    await vi.waitFor(() => expect(client.captures).toHaveLength(1))
    client.sockets[0].message(control('state', 'stream-1', 0, {
      state: 'ready',
    }))

    expect(client.instance.currentState).toBe('starting')
    client.releaseCapture()
    await starting
    expect(client.instance.currentState).toBe('listening')
  })

  it('reconnects as a fresh stream without replaying frames', async () => {
    const client = harness()
    await client.connect('stream-1')
    await client.captures[0].options.sendAudio(microphone(0, 0))
    expect(client.sockets[0].binaryMessages()).toHaveLength(1)

    client.sockets[0].serverClose(1006, 'network lost')
    await vi.waitFor(() => expect(client.instance.currentState).toBe('reconnecting'))
    await client.advanceReconnect()
    await client.openLatest('stream-2')

    expect(client.ticketRequests()).toBe(2)
    expect(client.sockets[1].binaryMessages()).toEqual([])
    expect(client.startControls(1)).toEqual([
      expect.objectContaining({
        type: 'start',
        streamId: 'stream-2',
        generation: 1,
      }),
    ])
    expect(client.captures[0].stop).toHaveBeenCalledOnce()
    expect(client.instance.currentState).toBe('listening')
  })

  it('stops reconnecting when a reconnect socket closes for policy before hello', async () => {
    const client = harness()
    await client.connect('stream-1')

    client.sockets[0].serverClose(1006, 'network lost')
    await vi.waitFor(() => expect(client.instance.currentState).toBe('reconnecting'))
    await client.advanceReconnect()
    await vi.waitFor(() => expect(client.sockets).toHaveLength(2))

    client.sockets[1].serverClose(1008, 'Pairing is no longer valid')

    await vi.waitFor(() => expect(client.instance.currentState).toBe('error'))
    expect(client.errors()).toEqual([
      expect.objectContaining({
        code: 'socket-failed',
        message: 'Pairing is no longer valid',
        fatal: true,
      }),
    ])
    expect(client.ticketRequests()).toBe(2)
    expect(client.scheduler.pending()).toBe(0)
    expect(await client.scheduler.runNext()).toBe(false)
    expect(client.ticketRequests()).toBe(2)
    expect(client.captures[0].stop).toHaveBeenCalledOnce()
    expect(client.playbacks[0].close).toHaveBeenCalledOnce()
    expect(client.playbacks[1].close).toHaveBeenCalledOnce()
  })

  it.each([1006, 1011])(
    'keeps retrying when a reconnect socket closes transiently with %s before hello',
    async (closeCode) => {
      const client = harness()
      await client.connect('stream-1')

      client.sockets[0].serverClose(1006, 'network lost')
      await vi.waitFor(() => expect(client.instance.currentState).toBe('reconnecting'))
      await client.advanceReconnect()
      await vi.waitFor(() => expect(client.sockets).toHaveLength(2))

      client.sockets[1].serverClose(closeCode, 'temporary relay failure')

      await vi.waitFor(() => {
        expect(client.instance.currentState).toBe('reconnecting')
        expect(client.errors()).toContainEqual(expect.objectContaining({
          code: 'socket-failed',
          message: 'temporary relay failure',
          fatal: false,
        }))
      })
      expect(client.scheduler.pending()).toBe(1)

      await client.advanceReconnect()
      await vi.waitFor(() => expect(client.sockets).toHaveLength(3))
      client.sockets[2].open()
      client.sockets[2].message(hello('stream-3'))
      await vi.waitFor(() => expect(client.instance.currentState).toBe('listening'))

      expect(client.ticketRequests()).toBe(3)
      expect(client.instance.currentState).toBe('listening')
    },
  )

  it('keeps reconnecting while the paired voice computer is temporarily unavailable', async () => {
    const client = harness()
    await client.connect('stream-1')
    client.capabilityFailures = 1

    client.sockets[0].serverClose(1006, 'paired node lost')
    await vi.waitFor(() => expect(client.instance.currentState).toBe('reconnecting'))
    await client.advanceReconnect()

    await vi.waitFor(() => {
      expect(client.instance.currentState).toBe('reconnecting')
      expect(client.errors()).toContainEqual(expect.objectContaining({
        code: 'capability-unavailable',
        fatal: false,
      }))
    })
    await client.advanceReconnect()
    await client.openLatest('stream-2')

    expect(client.instance.currentState).toBe('listening')
    expect(client.startControls(1)).toEqual([
      expect.objectContaining({
        streamId: 'stream-2',
        generation: 2,
      }),
    ])
  })

  it('surfaces ticket failure and leaves capture off', async () => {
    const client = harness({ ticketStatus: 503 })

    await expect(client.instance.start()).rejects.toMatchObject({
      code: 'ticket-failed',
    })
    expect(client.captures).toEqual([])
    expect(client.instance.currentState).toBe('error')
    expect(client.errors()).toEqual([
      expect.objectContaining({
        code: 'ticket-failed',
        message: 'Voice compute is unavailable',
      }),
    ])
  })

  it('rejects a mismatched hello protocol before capture starts', async () => {
    const client = harness()
    const starting = client.instance.start()
    await vi.waitFor(() => expect(client.sockets).toHaveLength(1))
    client.sockets[0].open()
    client.sockets[0].message({
      ...hello('stream-1'),
      protocol: ORACLE_VOICE_PROTOCOL + 1,
    })

    await expect(starting).rejects.toMatchObject({ code: 'protocol-mismatch' })
    expect(client.captures).toEqual([])
    expect(isBrowserClientCloseCode(client.sockets[0].closedWith?.code)).toBe(true)
    expect(client.playbacks[0].close).toHaveBeenCalledOnce()
    expect(client.instance.currentState).toBe('error')
  })

  it('reports an initial capture failure once and preserves dictation fallback', async () => {
    const client = harness({
      captureStartError: new VoiceCaptureError(
        'permission-denied',
        'Microphone permission was denied. Dictation is still available.',
        true,
      ),
    })
    const starting = client.instance.start()
    await vi.waitFor(() => expect(client.sockets).toHaveLength(1))
    client.sockets[0].open()
    client.sockets[0].message(hello('stream-1'))

    await expect(starting).rejects.toMatchObject({
      code: 'capture-failed',
      dictationFallback: true,
    })
    expect(client.errors()).toEqual([
      expect.objectContaining({
        code: 'capture-failed',
        dictationFallback: true,
      }),
    ])
    expect(client.instance.currentState).toBe('error')
  })

  it('uses bounded exponential reconnect delays of 0.5, 1, 2, 4, and 8 seconds', async () => {
    const client = harness()
    await client.connect('stream-1')
    client.ticketFailures = 5

    client.sockets[0].serverClose(1006, 'network lost')
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await client.advanceReconnect()
    }
    await vi.waitFor(() => expect(client.scheduledDelays()).toHaveLength(6))

    expect(client.scheduledDelays()).toEqual([
      500,
      1_000,
      2_000,
      4_000,
      8_000,
      8_000,
    ])
    expect(client.instance.currentState).toBe('reconnecting')
  })

  it('manual stop cancels a pending reconnect', async () => {
    const client = harness()
    await client.connect('stream-1')
    client.sockets[0].serverClose(1006, 'network lost')
    await vi.waitFor(() => expect(client.scheduler.pending()).toBe(1))

    await client.instance.stop()
    expect(await client.scheduler.runNext()).toBe(false)

    expect(client.ticketRequests()).toBe(1)
    expect(client.instance.currentState).toBe('off')
    expect(client.captures[0].stop).toHaveBeenCalledOnce()
  })

  it('does not let a stopped pending start tear down a restarted connection', async () => {
    const client = harness({ deferCapabilities: true })
    const firstStart = client.instance.start()
    await client.instance.stop()
    const secondStart = client.instance.start()

    client.releaseCapabilities()
    await vi.waitFor(() => expect(client.sockets).toHaveLength(1))
    client.sockets[0].open()
    client.sockets[0].message(hello('stream-2'))
    await Promise.all([firstStart, secondStart])

    expect(client.instance.currentState).toBe('listening')
    expect(client.errors()).toEqual([])
    expect(client.playbacks).toHaveLength(2)
    expect(client.playbacks[0].close).toHaveBeenCalledOnce()
    expect(client.playbacks[1].close).not.toHaveBeenCalled()
  })

  it('settles a hello wait on stop and permits a clean restart', async () => {
    const client = harness()
    const firstStart = client.instance.start()
    const firstSettled = vi.fn()
    void firstStart.then(firstSettled, firstSettled)
    await vi.waitFor(() => expect(client.sockets).toHaveLength(1))
    client.sockets[0].open()

    await client.instance.stop()
    await vi.waitFor(() => expect(firstSettled).toHaveBeenCalledOnce(), {
      timeout: 100,
    })

    const secondStart = client.instance.start()
    await vi.waitFor(() => expect(client.sockets).toHaveLength(2))
    client.sockets[1].open()
    client.sockets[1].message(hello('stream-2'))
    await secondStart

    expect(client.instance.currentState).toBe('listening')
    expect(client.errors()).toEqual([])
    expect(client.playbacks[0].close).toHaveBeenCalledOnce()
    expect(client.playbacks[1].close).not.toHaveBeenCalled()
  })

  it('bounds the wait for the server hello', async () => {
    const client = harness()
    const starting = client.instance.start()
    await vi.waitFor(() => expect(client.sockets).toHaveLength(1))
    client.sockets[0].open()

    expect(client.scheduledDelays()).toEqual([35_000])
    expect(client.scheduler.pending()).toBe(1)
    expect(await client.scheduler.runNext()).toBe(true)
    await expect(starting).rejects.toMatchObject({
      code: 'socket-failed',
      message: expect.stringContaining('hello'),
    })
    expect(client.playbacks[0].close).toHaveBeenCalledOnce()
    expect(client.instance.currentState).toBe('error')
  })

  it('emits current final transcripts and rejects stale audio and controls', async () => {
    const client = harness()
    await client.connect('stream-1')
    client.captures[0].options.onSpeechConfirmed?.(1)

    client.sockets[0].message(control('final', 'stream-1', 0, {
      utteranceId: 'stale',
      text: 'Old text',
    }))
    client.sockets[0].message(encodeVoiceAudioFrame(playback(0, 0)))
    client.sockets[0].message(control('partial', 'stream-1', 1, {
      utteranceId: 'current',
      text: 'Current par',
    }))
    client.sockets[0].message(control('final', 'stream-1', 1, {
      utteranceId: 'current',
      text: 'Current phrase',
    }))
    client.sockets[0].message(encodeVoiceAudioFrame(playback(1, 0)))

    await vi.waitFor(() => expect(client.finals()).toEqual([{
      generation: 1,
      utteranceId: 'current',
      text: 'Current phrase',
    }]))
    expect(client.partials()).toEqual([{
      generation: 1,
      utteranceId: 'current',
      text: 'Current par',
    }])
    expect(client.playbacks[0].enqueue).toHaveBeenCalledTimes(1)
    expect(client.playbacks[0].enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ generation: 1 }),
    )
    expect(client.instance.currentState).toBe('thinking')
  })

  it('returns to listening only after the current playback segment really drains', async () => {
    const client = harness()
    await client.connect('stream-1')
    client.sockets[0].message(control('state', 'stream-1', 0, {
      state: 'speaking',
    }))
    client.sockets[0].message(encodeVoiceAudioFrame(playback(0, 0, 'segment-a')))
    client.sockets[0].message(control('audio_end', 'stream-1', 0, {
      segmentId: 'segment-a',
    }))

    await vi.waitFor(() => expect(client.playbacks[0].endSegment)
      .toHaveBeenCalledWith(0, 'segment-a'))
    expect(client.instance.currentState).toBe('speaking')

    client.playbacks[0].drain('segment-a')
    await vi.waitFor(() => expect(client.instance.currentState).toBe('listening'))
  })

  it('restores authoritative listening after a tentative VAD misfire', async () => {
    const client = harness()
    await client.connect('stream-1')
    client.sockets[0].message(control('state', 'stream-1', 0, {
      state: 'thinking',
    }))
    client.captures[0].options.onTentativeSpeech?.()
    expect(client.instance.currentState).toBe('speech')

    client.sockets[0].message(control('state', 'stream-1', 0, {
      state: 'listening',
    }))
    expect(client.instance.currentState).toBe('speech')
    client.captures[0].options.onVadMisfire?.()

    expect(client.instance.currentState).toBe('listening')
  })

  it('cancels scheduled playback when the server returns to listening', async () => {
    const client = harness()
    await client.connect('stream-1')
    client.sockets[0].message(control('state', 'stream-1', 0, {
      state: 'speaking',
    }))
    client.sockets[0].message(encodeVoiceAudioFrame(playback(0, 0, 'segment-a')))

    client.sockets[0].message(control('state', 'stream-1', 0, {
      state: 'listening',
    }))

    await vi.waitFor(() => expect(client.playbacks[0].cancelCurrent)
      .toHaveBeenCalledOnce())
    expect(client.instance.currentState).toBe('listening')
  })

  it('restores listening when playback drains during tentative speech', async () => {
    const client = harness()
    await client.connect('stream-1')
    client.sockets[0].message(control('state', 'stream-1', 0, {
      state: 'speaking',
    }))
    client.sockets[0].message(encodeVoiceAudioFrame(playback(0, 0, 'segment-a')))
    client.sockets[0].message(control('audio_end', 'stream-1', 0, {
      segmentId: 'segment-a',
    }))
    await vi.waitFor(() => expect(client.playbacks[0].endSegment)
      .toHaveBeenCalledWith(0, 'segment-a'))
    client.captures[0].options.onTentativeSpeech?.()

    client.playbacks[0].drain('segment-a')
    await Promise.resolve()
    expect(client.instance.currentState).toBe('speech')
    client.captures[0].options.onVadMisfire?.()

    expect(client.instance.currentState).toBe('listening')
  })

  it('returns to listening when successful synthesis emits no audio frames', async () => {
    const client = harness()
    await client.connect('stream-1')
    client.sockets[0].message(control('state', 'stream-1', 0, {
      state: 'speaking',
    }))
    client.sockets[0].message(control('audio_end', 'stream-1', 0, {
      segmentId: 'silent-segment',
    }))

    await vi.waitFor(() => expect(client.playbacks[0].endSegment)
      .toHaveBeenCalledWith(0, 'silent-segment'))
    client.playbacks[0].drain('silent-segment')
    await vi.waitFor(() => expect(client.instance.currentState).toBe('listening'))
  })

  it('drains a zero-frame segment after superseding an older playback drain', async () => {
    const client = harness()
    await client.connect('stream-1')
    client.sockets[0].message(control('state', 'stream-1', 0, {
      state: 'speaking',
    }))
    client.sockets[0].message(encodeVoiceAudioFrame(playback(0, 0, 'older-segment')))
    client.sockets[0].message(control('audio_end', 'stream-1', 0, {
      segmentId: 'older-segment',
    }))
    client.sockets[0].message(control('state', 'stream-1', 0, {
      state: 'speaking',
    }))
    client.sockets[0].message(control('audio_end', 'stream-1', 0, {
      segmentId: 'silent-segment',
    }))

    client.playbacks[0].drain('silent-segment')
    await vi.waitFor(() => expect(client.instance.currentState).toBe('listening'))
    client.playbacks[0].drain('older-segment')
    await Promise.resolve()
    expect(client.instance.currentState).toBe('listening')
  })

  it('ignores drained callbacks superseded by a newer segment, interruption, or close', async () => {
    const client = harness()
    await client.connect('stream-1')
    client.sockets[0].message(control('state', 'stream-1', 0, {
      state: 'speaking',
    }))
    client.sockets[0].message(encodeVoiceAudioFrame(playback(0, 0, 'segment-a')))
    client.sockets[0].message(control('audio_end', 'stream-1', 0, {
      segmentId: 'segment-a',
    }))
    client.sockets[0].message(control('state', 'stream-1', 0, {
      state: 'speaking',
    }))
    client.sockets[0].message(encodeVoiceAudioFrame(playback(0, 0, 'segment-b')))
    client.playbacks[0].drain('segment-a')
    await Promise.resolve()
    expect(client.instance.currentState).toBe('speaking')

    client.captures[0].options.onTentativeSpeech?.()
    client.captures[0].options.onSpeechConfirmed?.(1)
    client.playbacks[0].drain('segment-b')
    await Promise.resolve()
    expect(client.instance.currentState).toBe('interrupted')

    client.sockets[0].message(control('state', 'stream-1', 1, {
      state: 'speaking',
    }))
    client.sockets[0].message(encodeVoiceAudioFrame(playback(1, 0, 'segment-c')))
    client.sockets[0].message(control('audio_end', 'stream-1', 1, {
      segmentId: 'segment-c',
    }))
    await client.instance.stop()
    client.playbacks[0].drain('segment-c')
    await Promise.resolve()
    expect(client.instance.currentState).toBe('off')
  })

  it('treats a slow-consumer close as explicit fatal error instead of reconnecting', async () => {
    const client = harness()
    await client.connect('stream-1')

    client.sockets[0].serverClose(1013, 'Browser voice output queue is full')

    await vi.waitFor(() => expect(client.instance.currentState).toBe('error'))
    expect(client.errors()).toContainEqual(expect.objectContaining({
      code: 'slow-consumer',
      message: 'Browser voice output queue is full',
    }))
    expect(client.scheduler.pending()).toBe(0)
    expect(client.captures[0].stop).toHaveBeenCalledOnce()
    expect(client.playbacks[0].close).toHaveBeenCalledOnce()
  })

  it.each([
    ['oracle_send_failed', 'Could not send to Oracle'],
    ['voice_synthesis_failed', 'Oracle speech synthesis failed'],
  ])('reports nonfatal %s turn failures without replacing the live state', async (code, message) => {
    const client = harness()
    await client.connect('stream-1')
    client.sockets[0].message(control('state', 'stream-1', 0, {
      state: 'thinking',
    }))

    client.sockets[0].message(control('error', 'stream-1', 0, {
      code,
      message,
      fatal: false,
    }))

    await vi.waitFor(() => expect(client.errors()).toHaveLength(1))
    expect(client.instance.currentState).toBe('thinking')
    expect(client.errors()).toContainEqual(expect.objectContaining({
      code: 'server-error',
      message,
      fatal: false,
    }))
    expect(client.captures[0].stop).not.toHaveBeenCalled()
  })

  it('restores a failed earlier final without replacing the current live state', async () => {
    const client = harness()
    await client.connect('stream-1')
    client.captures[0].options.onSpeechConfirmed?.(1)
    client.sockets[0].message(control('state', 'stream-1', 1, {
      state: 'listening',
    }))

    client.sockets[0].message(control('transcript_restore', 'stream-1', 0, {
      utteranceId: 'earlier-final',
      text: 'Restore the earlier transcript.',
    }))

    await vi.waitFor(() => expect(client.restores()).toContainEqual({
      generation: 0,
      utteranceId: 'earlier-final',
      text: 'Restore the earlier transcript.',
    }))
    expect(client.finals()).toEqual([])
    expect(client.instance.currentState).toBe('listening')
  })

  it('treats server stopped as terminal cleanup without a later close error', async () => {
    const client = harness()
    await client.connect('stream-1')

    client.sockets[0].message(control('state', 'stream-1', 0, {
      state: 'stopped',
    }))

    await vi.waitFor(() => expect(client.captures[0].stop).toHaveBeenCalledOnce())
    await vi.waitFor(() => expect(
      isBrowserClientCloseCode(client.sockets[0].closedWith?.code),
    ).toBe(true))
    client.sockets[0].serverClose(1000, 'Voice stream stopped')
    expect(client.playbacks[0].close).toHaveBeenCalledOnce()
    expect(client.instance.currentState).toBe('off')
    expect(client.errors()).toEqual([])
    expect(client.scheduler.pending()).toBe(0)
  })

  it('tears down a fatal error before closing with a UTF-8-safe browser code', async () => {
    const client = harness()
    await client.connect('stream-1')
    const message = `Voice engine stopped: ${'💥'.repeat(40)}`
    let releaseCapture: () => void = () => undefined
    client.captures[0].stop.mockImplementation(() => new Promise<void>((resolve) => {
      releaseCapture = resolve
    }))

    client.sockets[0].message(control('error', 'stream-1', 0, {
      code: 'voice_engine_failed',
      message,
      fatal: true,
    }))

    await vi.waitFor(() => expect(client.errors()).toContainEqual(expect.objectContaining({
      code: 'server-error',
      message,
    })))
    expect(client.instance.currentState).not.toBe('error')
    expect(client.playbacks[0].close).toHaveBeenCalledOnce()

    releaseCapture()
    await vi.waitFor(() => expect(client.instance.currentState).toBe('error'))
    expect(client.captures[0].stop).toHaveBeenCalledOnce()
    await vi.waitFor(() => expect(
      isBrowserClientCloseCode(client.sockets[0].closedWith?.code),
    ).toBe(true))
    expect(new TextEncoder().encode(
      client.sockets[0].closedWith?.reason,
    ).byteLength).toBeLessThanOrEqual(123)
    expect(message.startsWith(client.sockets[0].closedWith?.reason ?? '')).toBe(true)
    expect(client.scheduler.pending()).toBe(0)
  })

  it('makes explicit stop await a fatal teardown already stopping capture', async () => {
    const client = harness()
    await client.connect('stream-1')
    let releaseCapture: () => void = () => undefined
    client.captures[0].stop.mockImplementation(() => new Promise<void>((resolve) => {
      releaseCapture = resolve
    }))

    client.sockets[0].message(control('error', 'stream-1', 0, {
      code: 'voice_engine_failed',
      message: 'Voice engine stopped',
      fatal: true,
    }))
    await vi.waitFor(() => expect(client.captures[0].stop).toHaveBeenCalledOnce())

    const stopping = client.instance.stop()
    const stopped = vi.fn()
    void stopping.then(stopped, stopped)
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(stopped).not.toHaveBeenCalled()
    expect(client.instance.currentState).not.toBe('off')
    expect(client.captures[0].stop).toHaveBeenCalledOnce()

    releaseCapture()
    await stopping

    expect(stopped).toHaveBeenCalledOnce()
    expect(client.instance.currentState).toBe('off')
  })

  it('tears down fresh media after an earlier shared teardown finishes', async () => {
    const client = harness()
    await client.connect('stream-1')
    let releaseCapture: () => void = () => undefined
    client.captures[0].stop.mockImplementation(() => new Promise<void>((resolve) => {
      releaseCapture = resolve
    }))

    client.sockets[0].message(control('error', 'stream-1', 0, {
      code: 'voice_engine_failed',
      message: 'Voice engine stopped',
      fatal: true,
    }))
    await vi.waitFor(() => expect(client.captures[0].stop).toHaveBeenCalledOnce())
    releaseCapture()
    await vi.waitFor(() => expect(client.instance.currentState).toBe('error'))

    const restarting = client.instance.start()
    await client.openLatest('stream-2')
    await restarting
    await client.instance.stop()

    expect(client.captures[1].stop).toHaveBeenCalledOnce()
    expect(client.playbacks[1].close).toHaveBeenCalledOnce()
    expect(client.instance.currentState).toBe('off')
  })
})

function harness({
  ticketStatus = 201,
  captureStartError,
  deferCapabilities = false,
  deferCaptureStart = false,
  defaultFetch = false,
}: {
  ticketStatus?: number
  captureStartError?: VoiceCaptureError
  deferCapabilities?: boolean
  deferCaptureStart?: boolean
  // Leaves the client's own hub transport in place.
  defaultFetch?: boolean
} = {}) {
  const sockets: FakeSocket[] = []
  const captures: FakeCapture[] = []
  const playbacks: FakePlayback[] = []
  const requests: string[] = []
  const errors: OracleVoiceClientError[] = []
  const partials: Array<{ generation: number; utteranceId: string; text: string }> = []
  const finals: Array<{ generation: number; utteranceId: string; text: string }> = []
  const restores: Array<{ generation: number; utteranceId: string; text: string }> = []
  const scheduler = new FakeScheduler()
  let releaseCapabilities: () => void = () => undefined
  const capabilitiesReady = deferCapabilities
    ? new Promise<void>((resolve) => {
        releaseCapabilities = resolve
      })
    : Promise.resolve()
  let releaseCapture: () => void = () => undefined
  const captureReady = deferCaptureStart
    ? new Promise<void>((resolve) => {
        releaseCapture = resolve
      })
    : Promise.resolve()
  let nextTicket = 1
  const state = {
    ticketStatus,
    ticketFailures: 0,
    capabilityFailures: 0,
  }
  const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const path = new URL(String(input), 'http://hub.test').pathname
    const method = init?.method ?? 'GET'
    requests.push(`${method} ${path}`)
    if (path.endsWith('/capabilities')) {
      await capabilitiesReady
      if (state.capabilityFailures > 0) {
        state.capabilityFailures -= 1
        return jsonResponse({
          ...capabilities,
          available: false,
          reason: 'Paired voice computer is offline',
        })
      }
      return jsonResponse(capabilities)
    }
    if (path.endsWith('/tickets')) {
      if (state.ticketFailures > 0) {
        state.ticketFailures -= 1
        return jsonResponse({ error: 'Temporary ticket failure' }, 503)
      }
      if (state.ticketStatus !== 201) {
        return jsonResponse({ error: 'Voice compute is unavailable' }, state.ticketStatus)
      }
      return jsonResponse({
        ticket: `ticket-${nextTicket++}`,
        expiresAt: '2026-10-17T04:10:00.000Z',
      }, 201)
    }
    throw new Error(`Unexpected request ${method} ${path}`)
  })
  const dependencies: OracleVoiceClientDependencies = {
    fetch: fetcher,
    createSocket: (url) => {
      const socket = new FakeSocket(url)
      sockets.push(socket)
      return socket
    },
    createCapture: (options) => {
      const capture = new FakeCapture(options, captureStartError, captureReady)
      captures.push(capture)
      return capture
    },
    createPlayback: (options) => {
      const playback = new FakePlayback(options)
      playbacks.push(playback)
      return playback
    },
    setTimeout: scheduler.setTimeout,
    clearTimeout: scheduler.clearTimeout,
    baseUrl: () => new URL('http://hub.test/'),
  }
  const instance = new OracleVoiceClient({
    language: 'en',
    defaults: {} satisfies ManagerClientDefaults,
    answerOnly: false,
    dependencies: defaultFetch ? { ...dependencies, fetch: undefined } : dependencies,
    onError: (error) => errors.push(error),
    onPartial: (event) => partials.push(event),
    onFinal: (event) => finals.push(event),
    onRestore: (event) => restores.push(event),
  })

  const api = {
    instance,
    sockets,
    captures,
    playbacks,
    scheduler,
    errors: () => errors,
    partials: () => partials,
    finals: () => finals,
    restores: () => restores,
    requestPaths: () => requests,
    ticketRequests: () => requests.filter((request) =>
      request === 'POST /api/oracle-voice/tickets').length,
    scheduledDelays: () => scheduler.scheduledDelays(),
    releaseCapabilities,
    releaseCapture,
    startControls: (socketIndex: number) => sockets[socketIndex].jsonMessages()
      .filter((message): message is VoiceClientControl => message.type === 'start'),
    async connect(streamId: string) {
      const starting = instance.start()
      await vi.waitFor(() => expect(sockets.length).toBeGreaterThan(0))
      const socket = sockets.at(-1)!
      socket.open()
      socket.message(hello(streamId))
      await starting
    },
    async openLatest(streamId: string) {
      await vi.waitFor(() => expect(sockets.length).toBeGreaterThan(1))
      const socket = sockets.at(-1)!
      socket.open()
      socket.message(hello(streamId))
      await vi.waitFor(() => expect(instance.currentState).toBe('listening'))
    },
    async advanceReconnect() {
      await vi.waitFor(() => expect(scheduler.pending()).toBeGreaterThan(0))
      expect(await scheduler.runNext()).toBe(true)
      await Promise.resolve()
    },
    get ticketFailures() {
      return state.ticketFailures
    },
    set ticketFailures(value: number) {
      state.ticketFailures = value
    },
    get capabilityFailures() {
      return state.capabilityFailures
    },
    set capabilityFailures(value: number) {
      state.capabilityFailures = value
    },
  }
  return api
}

class FakeCapture {
  readonly start: Mock<() => Promise<void>>
  readonly stop = vi.fn().mockResolvedValue(undefined)
  readonly options: VoiceCaptureOptions

  constructor(
    options: VoiceCaptureOptions,
    startError?: VoiceCaptureError,
    startReady: Promise<void> = Promise.resolve(),
  ) {
    this.options = options
    this.start = startError
      ? vi.fn<() => Promise<void>>(async () => {
          options.onError?.(startError)
          throw startError
        })
      : vi.fn<() => Promise<void>>(async () => {
          await startReady
        })
  }
}

class FakePlayback {
  readonly start = vi.fn().mockResolvedValue(undefined)
  readonly enqueue = vi.fn().mockReturnValue(true)
  readonly tentativeSpeech = vi.fn()
  readonly restoreAfterMisfire = vi.fn()
  readonly cancelCurrent = vi.fn()
  readonly confirmSpeech = vi.fn().mockReturnValue(true)
  readonly endSegment = vi.fn((generation: number, segmentId: string) => {
    if (generation !== this.options.initialGeneration) return Promise.resolve(false)
    return this.drainPromise(segmentId)
  })
  readonly close = vi.fn().mockResolvedValue(undefined)
  readonly options: VoicePlaybackOptions
  private readonly drains = new Map<string, {
    promise: Promise<boolean>
    resolve: (drained: boolean) => void
  }>()

  constructor(options: VoicePlaybackOptions) {
    this.options = options
  }

  drain(segmentId: string, drained = true): void {
    this.drainPromise(segmentId)
    this.drains.get(segmentId)!.resolve(drained)
  }

  private drainPromise(segmentId: string): Promise<boolean> {
    const existing = this.drains.get(segmentId)
    if (existing) return existing.promise
    let resolve!: (drained: boolean) => void
    const promise = new Promise<boolean>((settle) => {
      resolve = settle
    })
    this.drains.set(segmentId, { promise, resolve })
    return promise
  }
}

class FakeSocket implements OracleVoiceSocket {
  readonly CONNECTING = 0
  readonly OPEN = 1
  readonly CLOSING = 2
  readonly CLOSED = 3
  readyState = this.CONNECTING
  bufferedAmount = 0
  binaryType: BinaryType = 'blob'
  onopen: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  readonly sent: Array<string | ArrayBuffer> = []
  closedWith: { code?: number; reason?: string } | undefined
  readonly url: string

  constructor(url: string) {
    this.url = url
  }

  open(): void {
    this.readyState = this.OPEN
    this.onopen?.(new Event('open'))
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (typeof data === 'string') {
      this.sent.push(data)
      return
    }
    if (data instanceof ArrayBuffer) {
      this.sent.push(data)
      return
    }
    if (ArrayBuffer.isView(data)) {
      this.sent.push(data.buffer.slice(
        data.byteOffset,
        data.byteOffset + data.byteLength,
      ) as ArrayBuffer)
      return
    }
    throw new Error('Unexpected Blob in voice client test')
  }

  close(code?: number, reason?: string): void {
    if (this.readyState === this.CLOSED) return
    if (code !== undefined && !isBrowserClientCloseCode(code)) {
      throw new DOMException('Invalid WebSocket close code', 'InvalidAccessError')
    }
    if (new TextEncoder().encode(reason ?? '').byteLength > 123) {
      throw new DOMException('WebSocket close reason is too long', 'SyntaxError')
    }
    this.closedWith = { code, reason }
    this.serverClose(code ?? 1000, reason ?? '')
  }

  message(data: unknown): void {
    const payload = data instanceof ArrayBuffer
      ? data
      : JSON.stringify(data)
    this.onmessage?.(new MessageEvent('message', { data: payload }))
  }

  serverClose(code: number, reason: string): void {
    if (this.readyState === this.CLOSED) return
    this.readyState = this.CLOSED
    this.onclose?.({
      code,
      reason,
      wasClean: code === 1000,
    } as CloseEvent)
  }

  binaryMessages(): ArrayBuffer[] {
    return this.sent.filter((message): message is ArrayBuffer =>
      message instanceof ArrayBuffer)
  }

  jsonMessages(): Array<VoiceClientControl & { type: string }> {
    return this.sent
      .filter((message): message is string => typeof message === 'string')
      .map((message) => JSON.parse(message) as VoiceClientControl & { type: string })
  }
}

class FakeScheduler {
  private readonly elapsedDelays: number[] = []
  private timers: Array<{
    callback: () => void
    delay: number
    cancelled: boolean
  }> = []

  readonly setTimeout = (callback: () => void, delay: number) => {
    const timer = { callback, delay, cancelled: false }
    this.timers.push(timer)
    return timer as unknown as ReturnType<typeof setTimeout>
  }

  readonly clearTimeout = (timerId: ReturnType<typeof setTimeout>) => {
    const timer = timerId as unknown as { cancelled: boolean }
    timer.cancelled = true
  }

  pending(): number {
    return this.timers.filter((timer) => !timer.cancelled).length
  }

  scheduledDelays(): number[] {
    return [
      ...this.elapsedDelays,
      ...this.timers
        .filter((timer) => !timer.cancelled)
        .map((timer) => timer.delay),
    ]
  }

  async runNext(): Promise<boolean> {
    while (this.timers.length > 0) {
      const timer = this.timers.shift()!
      if (timer.cancelled) continue
      this.elapsedDelays.push(timer.delay)
      timer.callback()
      await Promise.resolve()
      return true
    }
    return false
  }
}

function hello(streamId: string): VoiceServerControl {
  return {
    type: 'hello',
    protocol: ORACLE_VOICE_PROTOCOL,
    streamId,
    generation: 0,
    capabilities,
  }
}

function control(
  type: 'partial' | 'final' | 'transcript_restore',
  streamId: string,
  generation: number,
  rest: { utteranceId: string; text: string },
): VoiceServerControl
function control(
  type: 'error',
  streamId: string,
  generation: number,
  rest: { code: string; message: string; fatal: boolean },
): VoiceServerControl
function control(
  type: 'state',
  streamId: string,
  generation: number,
  rest: { state: Extract<VoiceServerControl, { type: 'state' }>['state'] },
): VoiceServerControl
function control(
  type: 'heartbeat',
  streamId: string,
  generation: number,
  rest: { timestamp: number },
): VoiceServerControl
function control(
  type: 'audio_end',
  streamId: string,
  generation: number,
  rest: { segmentId: string },
): VoiceServerControl
function control(
  type: 'partial' | 'final' | 'transcript_restore' | 'error' | 'state' | 'heartbeat' | 'audio_end',
  streamId: string,
  generation: number,
  rest:
    | { utteranceId: string; text: string }
    | { code: string; message: string; fatal: boolean }
    | { state: Extract<VoiceServerControl, { type: 'state' }>['state'] }
    | { timestamp: number }
    | { segmentId: string },
): VoiceServerControl {
  return {
    type,
    protocol: ORACLE_VOICE_PROTOCOL,
    streamId,
    generation,
    ...rest,
  } as unknown as VoiceServerControl
}

function microphone(generation: number, sequence: number): VoiceAudioFrame {
  return {
    direction: 'microphone',
    generation,
    sequence,
    sampleRate: ORACLE_VOICE_SAMPLE_RATE,
    samples: new Int16Array([1, 2, 3]),
  }
}

function playback(
  generation: number,
  sequence: number,
  segmentId = 'segment-a',
): VoiceAudioFrame {
  return {
    direction: 'playback',
    generation,
    segmentId,
    sequence,
    sampleRate: 24_000,
    samples: new Int16Array([1, 2, 3]),
  }
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function isBrowserClientCloseCode(code: number | undefined): code is number {
  return code === 1000
    || (
      Number.isInteger(code)
      && code !== undefined
      && code >= 3000
      && code <= 4999
    )
}
