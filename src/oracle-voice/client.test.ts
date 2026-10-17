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
    expect(client.sockets[0].closedWith).toMatchObject({ code: 1002 })
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

  it('stops immediately on an explicit fatal server error', async () => {
    const client = harness()
    await client.connect('stream-1')

    client.sockets[0].message(control('error', 'stream-1', 0, {
      code: 'voice_engine_failed',
      message: 'Voice engine stopped',
      fatal: true,
    }))

    await vi.waitFor(() => expect(client.instance.currentState).toBe('error'))
    expect(client.errors()).toContainEqual(expect.objectContaining({
      code: 'server-error',
      message: 'Voice engine stopped',
    }))
    expect(client.sockets[0].closedWith).toMatchObject({ code: 1011 })
    expect(client.scheduler.pending()).toBe(0)
  })
})

function harness({
  ticketStatus = 201,
  captureStartError,
  deferCapabilities = false,
  deferCaptureStart = false,
}: {
  ticketStatus?: number
  captureStartError?: VoiceCaptureError
  deferCapabilities?: boolean
  deferCaptureStart?: boolean
} = {}) {
  const sockets: FakeSocket[] = []
  const captures: FakeCapture[] = []
  const playbacks: FakePlayback[] = []
  const requests: string[] = []
  const errors: OracleVoiceClientError[] = []
  const partials: Array<{ generation: number; utteranceId: string; text: string }> = []
  const finals: Array<{ generation: number; utteranceId: string; text: string }> = []
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
  }
  const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const path = new URL(String(input), 'http://hub.test').pathname
    const method = init?.method ?? 'GET'
    requests.push(`${method} ${path}`)
    if (path.endsWith('/capabilities')) {
      await capabilitiesReady
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
    dependencies,
    onError: (error) => errors.push(error),
    onPartial: (event) => partials.push(event),
    onFinal: (event) => finals.push(event),
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
    requestPaths: () => requests,
    ticketRequests: () => requests.filter((request) =>
      request === 'POST /api/oracle-voice/tickets').length,
    scheduledDelays: () => scheduler.delays,
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
  readonly confirmSpeech = vi.fn().mockReturnValue(true)
  readonly endSegment = vi.fn()
  readonly close = vi.fn().mockResolvedValue(undefined)
  readonly options: VoicePlaybackOptions

  constructor(options: VoicePlaybackOptions) {
    this.options = options
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
  readonly delays: number[] = []
  private timers: Array<{
    callback: () => void
    cancelled: boolean
  }> = []

  readonly setTimeout = (callback: () => void, delay: number) => {
    this.delays.push(delay)
    const timer = { callback, cancelled: false }
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

  async runNext(): Promise<boolean> {
    const timer = this.timers.shift()
    if (!timer || timer.cancelled) return false
    timer.callback()
    await Promise.resolve()
    return true
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
  type: 'partial' | 'final',
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
  type: 'partial' | 'final' | 'error' | 'state',
  streamId: string,
  generation: number,
  rest:
    | { utteranceId: string; text: string }
    | { code: string; message: string; fatal: boolean }
    | { state: Extract<VoiceServerControl, { type: 'state' }>['state'] },
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

function playback(generation: number, sequence: number): VoiceAudioFrame {
  return {
    direction: 'playback',
    generation,
    segmentId: 'segment-a',
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
