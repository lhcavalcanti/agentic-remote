import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readDictationAudioFrame, type DictationServerMessage } from '../../shared/dictation'
import { PcmCaptureError, type PcmCapture } from './capture'
import {
  LiveDictationClient,
  LiveDictationStartError,
  fetchDictationCapabilities,
  type DictationSocket,
} from './live-dictation-client'

class FakeSocket implements DictationSocket {
  binaryType: BinaryType = 'blob'
  readyState = 0
  bufferedAmount = 0
  readonly sent: Array<string | ArrayBuffer> = []
  closed: { code?: number; reason?: string } | undefined
  onopen: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null

  readonly url: string

  constructor(url: string) {
    this.url = url
  }

  send(data: string | ArrayBuffer) {
    this.sent.push(data)
  }

  close(code?: number, reason?: string) {
    if (this.readyState === 3) return
    this.readyState = 3
    this.closed = { code, reason }
    this.onclose?.({ code: code ?? 1005, reason: reason ?? '' } as CloseEvent)
  }

  open() {
    this.readyState = 1
    this.onopen?.(new Event('open'))
  }

  receive(message: Partial<DictationServerMessage> & { type: string }) {
    this.onmessage?.({ data: JSON.stringify({ protocol: 1, ...message }) } as MessageEvent)
  }

  serverClose(code = 1000) {
    this.readyState = 3
    this.onclose?.({ code, reason: '' } as CloseEvent)
  }

  controls(): string[] {
    return this.sent.filter((data): data is string => typeof data === 'string')
      .map((data) => (JSON.parse(data) as { type: string }).type)
  }

  frames(): ArrayBuffer[] {
    return this.sent.filter((data): data is ArrayBuffer => data instanceof ArrayBuffer)
  }
}

class FakeCapture implements PcmCapture {
  onFrame: ((pcm16: Int16Array) => void) | undefined
  onInterrupted: ((reason: string) => void) | undefined
  started = false
  stopped = false
  failure: Error | undefined
  leftover: Int16Array | undefined

  async start(onFrame: (pcm16: Int16Array) => void, onInterrupted: (reason: string) => void) {
    if (this.failure) throw this.failure
    this.onFrame = onFrame
    this.onInterrupted = onInterrupted
    this.started = true
  }

  async stop() {
    if (this.leftover) this.onFrame?.(this.leftover)
    this.leftover = undefined
    this.stopped = true
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

function setup() {
  const sockets: FakeSocket[] = []
  const capture = new FakeCapture()
  const fetch = vi.fn(async (input: string, _init?: RequestInit) =>
    input === '/api/dictation/tickets' ? json({ ticket: 't/1', expiresAt: '2026-11-28T00:00:30.000Z' }, 201) : json({}, 404))
  const texts: Array<{ committed: string; tentative: string }> = []
  const finals: string[] = []
  const errors: Array<{ code: string; message: string; fatal: boolean }> = []
  const interruptions: string[] = []
  const client = new LiveDictationClient({
    onText: (state) => texts.push(state),
    onFinal: (text) => finals.push(text),
    onError: (error) => errors.push(error),
    onInterrupted: (reason) => interruptions.push(reason),
  }, {
    fetch,
    createSocket: (url) => {
      const socket = new FakeSocket(url)
      sockets.push(socket)
      return socket
    },
    createCapture: () => capture,
    baseUrl: () => new URL('https://hub.test/app/'),
    streamId: () => 'stream-1',
  })
  const socket = () => sockets[0]
  const ready = async () => {
    const starting = client.start()
    await vi.advanceTimersByTimeAsync(0)
    socket().open()
    socket().receive({ type: 'ready' })
    await starting
  }
  return { client, capture, fetch, socket, sockets, texts, finals, errors, interruptions, ready }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('live dictation client', () => {
  it('starts with a ticket, streams numbered frames, and finishes with the final text', async () => {
    const harness = setup()
    await harness.ready()
    const socket = harness.socket()
    expect(socket.url).toBe('wss://hub.test/api/dictation?ticket=t%2F1')
    expect(socket.binaryType).toBe('arraybuffer')
    expect(socket.controls()).toEqual(['start'])
    expect(JSON.parse(socket.sent[0] as string)).toEqual({ protocol: 1, type: 'start', streamId: 'stream-1' })
    expect(harness.capture.started).toBe(true)

    harness.capture.onFrame!(new Int16Array(1_600).fill(7))
    socket.receive({ type: 'text', seq: 1, committedAppend: '', tentative: 'hel' })
    socket.receive({ type: 'text', seq: 2, committedAppend: 'hello', tentative: 'wor' })
    socket.receive({ type: 'text', seq: 3, committedAppend: ' world', tentative: '' })
    expect(harness.texts).toEqual([
      { committed: '', tentative: 'hel' },
      { committed: 'hello', tentative: 'wor' },
      { committed: 'hello world', tentative: '' },
    ])

    harness.capture.leftover = new Int16Array(400).fill(9)
    const stopping = harness.client.stop()
    await vi.advanceTimersByTimeAsync(0)
    expect(socket.controls()).toEqual(['start', 'stop'])
    const frames = socket.frames()
    expect(readDictationAudioFrame(frames[0], 1)).toHaveLength(1_600)
    expect(readDictationAudioFrame(frames[1], 2)).toEqual(new Int16Array(400).fill(9))
    // The last frame went out before Stop.
    expect(socket.sent.indexOf(frames[1])).toBeLessThan(socket.sent.length - 1)
    socket.receive({ type: 'final', text: 'Hello world.', reason: 'stop' })
    await stopping
    expect(harness.finals).toEqual(['Hello world.'])
    // A finished stream has nothing to cancel.
    expect(socket.controls()).toEqual(['start', 'stop'])
    expect(harness.capture.stopped).toBe(true)
    expect(socket.closed).toBeDefined()
  })

  it.each([
    ['busy', true],
    ['unavailable', true],
    ['node_offline', true],
    ['node_outdated', true],
    ['protocol', false],
  ])('rejects the start on %s, with record-and-upload fallback %s', async (code, fallback) => {
    const harness = setup()
    const starting = harness.client.start().catch((error: unknown) => error)
    await vi.advanceTimersByTimeAsync(0)
    harness.socket().open()
    harness.socket().receive({ type: 'error', code: code as never, message: 'No', fatal: true })
    const error = await starting
    expect(error).toBeInstanceOf(LiveDictationStartError)
    expect(error).toMatchObject({ code, fallback, message: 'No' })
    expect(harness.capture.started).toBe(false)
  })

  it('falls back when the ticket cannot be issued', async () => {
    const harness = setup()
    harness.fetch.mockResolvedValueOnce(json({ error: 'Origin is not allowed' }, 403))
    await expect(harness.client.start()).rejects.toMatchObject({ fallback: true, message: 'Origin is not allowed' })
    expect(harness.sockets).toEqual([])
  })

  it('waits out the engine\'s warm-up, then gives up on a stream that is still not ready', async () => {
    const harness = setup()
    const starting = harness.client.start().catch((error: unknown) => error)
    await vi.advanceTimersByTimeAsync(0)
    harness.socket().open()
    // The hub may take 10 s to reach the node, and the node a minute to load Parakeet.
    await vi.advanceTimersByTimeAsync(74_999)
    expect(harness.socket().closed).toBeUndefined()
    await vi.advanceTimersByTimeAsync(1)
    expect(await starting).toMatchObject({ code: 'unavailable', fallback: true })
    expect(harness.socket().closed).toBeDefined()
  })

  it('keeps the committed text when the final text does not arrive in 35 seconds', async () => {
    const harness = setup()
    await harness.ready()
    harness.socket().receive({ type: 'text', seq: 1, committedAppend: 'kept words', tentative: 'maybe' })
    const stopping = harness.client.stop()
    // The server is alive, sending heartbeats, but its final text never comes.
    for (let second = 5; second < 35; second += 5) {
      await vi.advanceTimersByTimeAsync(5_000)
      harness.socket().receive({ type: 'heartbeat' })
    }
    expect(harness.finals).toEqual([])
    await vi.advanceTimersByTimeAsync(5_000)
    await stopping
    expect(harness.errors).toEqual([expect.objectContaining({ code: 'final_timeout', fatal: true })])
    expect(harness.finals).toEqual(['kept words'])
  })

  it('cancels with a cancel message and ignores anything after it', async () => {
    const harness = setup()
    await harness.ready()
    harness.client.cancel()
    expect(harness.socket().controls()).toEqual(['start', 'cancel'])
    expect(harness.socket().closed).toBeDefined()
    expect(harness.capture.stopped).toBe(true)
    harness.socket().receive({ type: 'text', seq: 1, committedAppend: 'late', tentative: '' })
    harness.socket().receive({ type: 'final', text: 'late' })
    expect(harness.texts).toEqual([])
    expect(harness.finals).toEqual([])
  })

  it('sends heartbeats and ends a stream the server stops answering', async () => {
    const harness = setup()
    await harness.ready()
    harness.socket().receive({ type: 'text', seq: 1, committedAppend: 'so far', tentative: '' })
    await vi.advanceTimersByTimeAsync(14_999)
    expect(harness.socket().controls().filter((type) => type === 'heartbeat')).toHaveLength(2)
    expect(harness.finals).toEqual([])
    await vi.advanceTimersByTimeAsync(1)
    expect(harness.errors).toEqual([expect.objectContaining({ code: 'stalled', fatal: true })])
    expect(harness.finals).toEqual(['so far'])
    expect(harness.capture.stopped).toBe(true)
  })

  it('keeps the committed text when the connection drops', async () => {
    const harness = setup()
    await harness.ready()
    harness.socket().receive({ type: 'text', seq: 1, committedAppend: 'before', tentative: 'the drop' })
    harness.socket().serverClose(1006)
    expect(harness.errors).toEqual([expect.objectContaining({ fatal: true })])
    expect(harness.finals).toEqual(['before'])
  })

  it('uses the final text the server sends after a fatal engine error', async () => {
    const harness = setup()
    await harness.ready()
    harness.socket().receive({ type: 'error', code: 'engine_failed', message: 'Parakeet stopped', fatal: true })
    harness.socket().receive({ type: 'final', text: 'confirmed only' })
    harness.socket().serverClose(1011)
    expect(harness.errors).toEqual([{ code: 'engine_failed', message: 'Parakeet stopped', fatal: true }])
    expect(harness.finals).toEqual(['confirmed only'])
  })

  it('reports a microphone interruption to its owner', async () => {
    const harness = setup()
    await harness.ready()
    harness.capture.onInterrupted!('The page went to the background')
    expect(harness.interruptions).toEqual(['The page went to the background'])
  })

  it('ends a stream whose audio stops leaving the browser', async () => {
    const harness = setup()
    await harness.ready()
    harness.socket().bufferedAmount = 384_000
    harness.capture.onFrame!(new Int16Array(1_600))
    expect(harness.errors).toEqual([expect.objectContaining({ code: 'backpressure', fatal: true })])
    expect(harness.socket().controls()).toContain('cancel')
    expect(harness.finals).toEqual([''])
  })

  it.each([
    [new PcmCaptureError('audio-worklet-unavailable', 'No worklet'), true],
    [new PcmCaptureError('audio-suspended', 'The browser did not start microphone audio'), true],
    [new PcmCaptureError('permission-denied', 'Microphone permission was denied'), false],
  ])('cancels the stream when the microphone cannot start: %s', async (failure, fallback) => {
    const harness = setup()
    harness.capture.failure = failure
    const starting = harness.client.start().catch((error: unknown) => error)
    await vi.advanceTimersByTimeAsync(0)
    harness.socket().open()
    harness.socket().receive({ type: 'ready' })
    expect(await starting).toMatchObject({ code: failure.code, fallback, message: failure.message })
    expect(harness.socket().controls()).toEqual(['start', 'cancel'])
  })
})

describe('dictation capabilities', () => {
  it('reads what the transcription computer can do', async () => {
    const fetch = vi.fn(async () => json({ live: false, reason: 'Studio is offline', computerName: 'Studio' }))
    await expect(fetchDictationCapabilities(undefined, fetch))
      .resolves.toEqual({ live: false, reason: 'Studio is offline', computerName: 'Studio' })
    expect(fetch).toHaveBeenCalledWith('/api/dictation/capabilities', expect.objectContaining({ cache: 'no-store' }))
    fetch.mockResolvedValueOnce(json({ live: 'yes' }))
    await expect(fetchDictationCapabilities(undefined, fetch)).rejects.toThrow()
  })
})
