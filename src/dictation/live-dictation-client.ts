import {
  DICTATION_CLIENT_TIMEOUT_MS,
  DICTATION_LIMITS,
  DICTATION_PROTOCOL,
  encodeDictationAudioFrame,
  parseDictationServerMessage,
  type DictationCapabilities,
  type DictationClientMessage,
  type DictationServerMessage,
} from '../../shared/dictation'
import { hubFetch } from '../hub-sign-in'
import { createPcmCapture, PcmCaptureError, type PcmCapture } from './capture'

export interface DictationTextState {
  committed: string
  tentative: string
}

export interface DictationClientError {
  code: string
  message: string
  fatal: boolean
}

export interface LiveDictationCallbacks {
  onText(state: DictationTextState): void
  /** Called once per stream that became ready, unless it was cancelled. */
  onFinal(text: string): void
  onError(error: DictationClientError): void
  /** The microphone was lost; the owner decides whether to stop. */
  onInterrupted?(reason: string): void
}

/** The part of a browser WebSocket the client uses. */
export interface DictationSocket {
  binaryType: BinaryType
  readonly readyState: number
  readonly bufferedAmount: number
  send(data: string | ArrayBuffer): void
  close(code?: number, reason?: string): void
  onopen: ((event: Event) => void) | null
  onmessage: ((event: MessageEvent) => void) | null
  onclose: ((event: CloseEvent) => void) | null
  onerror: ((event: Event) => void) | null
}

export interface ClientDeps {
  fetch(input: string, init?: RequestInit): Promise<Response>
  createSocket(url: string): DictationSocket
  createCapture(): PcmCapture
  baseUrl(): URL
  streamId(): string
}

/** Why a stream could not start, and whether recording and uploading would still work. */
export class LiveDictationStartError extends Error {
  readonly code: string
  readonly fallback: boolean

  constructor(code: string, message: string, fallback: boolean) {
    super(message)
    this.name = 'LiveDictationStartError'
    this.code = code
    this.fallback = fallback
  }
}

/** Codes after which the record-and-upload path can still transcribe. */
const FALLBACK_CODES = new Set([
  'busy',
  'unavailable',
  'node_offline',
  'node_outdated',
  'audio-worklet-unavailable',
  'media-devices-unavailable',
  'audio-suspended',
])
const OPEN = 1

export async function fetchDictationCapabilities(
  signal?: AbortSignal,
  fetch: ClientDeps['fetch'] = hubFetch,
): Promise<DictationCapabilities> {
  const response = await fetch('/api/dictation/capabilities', {
    cache: 'no-store',
    headers: { accept: 'application/json' },
    signal,
  })
  const payload = await response.json().catch(() => undefined) as Partial<DictationCapabilities> | undefined
  if (!response.ok || typeof payload?.live !== 'boolean' || typeof payload.computerName !== 'string') {
    throw new Error(`Live dictation capabilities failed (${response.status})`)
  }
  return {
    live: payload.live,
    computerName: payload.computerName,
    ...(typeof payload.reason === 'string' ? { reason: payload.reason } : {}),
  }
}

type ClientState = 'idle' | 'connecting' | 'live' | 'stopping' | 'ended'

/**
 * One live dictation stream from this browser: microphone frames go out,
 * committed and tentative text come back. A stream that became ready always
 * ends in `onFinal`, with the server's final text or, if the stream broke,
 * the text it had committed; only `cancel` ends it without one.
 */
export class LiveDictationClient {
  readonly #callbacks: LiveDictationCallbacks
  readonly #deps: ClientDeps
  #state: ClientState = 'idle'
  #socket: DictationSocket | undefined
  #capture: PcmCapture | undefined
  #sequence = 1
  #committed = ''
  #tentative = ''
  #heartbeat: ReturnType<typeof setInterval> | undefined
  #stall: ReturnType<typeof setTimeout> | undefined
  #finalTimer: ReturnType<typeof setTimeout> | undefined
  #rejectStart: ((error: LiveDictationStartError) => void) | undefined
  #finished: Promise<void> | undefined
  #resolveFinished: (() => void) | undefined

  constructor(callbacks: LiveDictationCallbacks, deps: Partial<ClientDeps> = {}) {
    this.#callbacks = callbacks
    this.#deps = {
      fetch: deps.fetch ?? hubFetch,
      createSocket: deps.createSocket ?? ((url) => new WebSocket(url)),
      createCapture: deps.createCapture ?? (() => createPcmCapture()),
      baseUrl: deps.baseUrl ?? (() => new URL(globalThis.location.href)),
      streamId: deps.streamId ?? (() => globalThis.crypto.randomUUID()),
    }
  }

  /** Resolves once the transcription computer is ready and the microphone is on. */
  async start(): Promise<void> {
    if (this.#state !== 'idle') throw new Error('Live dictation already started')
    this.#state = 'connecting'
    const ticket = await this.#ticket()
    if (this.#state !== 'connecting') throw cancelled()
    await this.#connect(ticket)
    const capture = this.#deps.createCapture()
    this.#capture = capture
    try {
      await capture.start(
        (pcm16) => this.#sendAudio(pcm16),
        (reason) => {
          if (this.#state === 'live') this.#callbacks.onInterrupted?.(reason)
        },
      )
    } catch (error) {
      if (this.#current() === 'ended') throw cancelled()
      this.#state = 'ended'
      this.#abandon()
      if (error instanceof PcmCaptureError) {
        throw new LiveDictationStartError(error.code, error.message, FALLBACK_CODES.has(error.code))
      }
      throw new LiveDictationStartError('capture-failed', errorMessage(error, 'The microphone could not start'), false)
    }
    if (this.#current() !== 'live') {
      await capture.stop()
      throw cancelled()
    }
  }

  /** Sends the rest of the audio and resolves once the final text arrived or was given up on. */
  async stop(): Promise<void> {
    if (this.#state === 'connecting') {
      this.cancel()
      return
    }
    if (this.#state !== 'live') return this.#finished
    this.#state = 'stopping'
    this.#finished = new Promise((resolve) => {
      this.#resolveFinished = resolve
    })
    await this.#capture?.stop()
    if (this.#state !== 'stopping') return this.#finished
    this.#send({ protocol: DICTATION_PROTOCOL, type: 'stop' })
    this.#finalTimer = setTimeout(() => {
      this.#fail({ code: 'final_timeout', message: 'The final dictation text did not arrive', fatal: true })
    }, DICTATION_CLIENT_TIMEOUT_MS)
    return this.#finished
  }

  /** Ends the stream without a final text; the owner restores the draft. */
  cancel(): void {
    if (this.#state === 'ended') return
    this.#state = 'ended'
    this.#rejectStart?.(cancelled())
    this.#abandon()
  }

  async #ticket(): Promise<string> {
    let response: Response
    try {
      response = await this.#deps.fetch('/api/dictation/tickets', {
        method: 'POST',
        cache: 'no-store',
        headers: { accept: 'application/json' },
      })
    } catch (error) {
      throw new LiveDictationStartError('unavailable', errorMessage(error, 'The hub could not be reached'), true)
    }
    const payload = await response.json().catch(() => undefined) as { ticket?: unknown; error?: unknown } | undefined
    if (!response.ok || typeof payload?.ticket !== 'string') {
      throw new LiveDictationStartError(
        'unavailable',
        typeof payload?.error === 'string' ? payload.error : `Live dictation could not start (${response.status})`,
        true,
      )
    }
    return payload.ticket
  }

  #connect(ticket: string): Promise<void> {
    const url = new URL('/api/dictation', this.#deps.baseUrl())
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    url.search = ''
    url.searchParams.set('ticket', ticket)
    url.hash = ''
    const socket = this.#deps.createSocket(url.toString())
    socket.binaryType = 'arraybuffer'
    this.#socket = socket
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        fail(new LiveDictationStartError('unavailable', 'Live dictation did not start in time', true))
      }, DICTATION_CLIENT_TIMEOUT_MS)
      const fail = (error: LiveDictationStartError) => {
        clearTimeout(timer)
        this.#rejectStart = undefined
        if (this.#state === 'connecting') {
          this.#state = 'ended'
          this.#abandon()
        }
        reject(error)
      }
      this.#rejectStart = fail
      socket.onopen = () => {
        this.#send({ protocol: DICTATION_PROTOCOL, type: 'start', streamId: this.#deps.streamId() })
        this.#heartbeat = setInterval(() => {
          this.#send({ protocol: DICTATION_PROTOCOL, type: 'heartbeat' })
        }, DICTATION_LIMITS.heartbeatMs)
      }
      socket.onmessage = (event) => {
        let message: DictationServerMessage
        try {
          message = parseDictationServerMessage(String(event.data))
        } catch {
          if (this.#state === 'connecting') {
            fail(new LiveDictationStartError('protocol', 'The hub sent an invalid dictation message', false))
          } else {
            this.#fail({ code: 'protocol', message: 'The hub sent an invalid dictation message', fatal: true })
          }
          return
        }
        if (this.#state === 'connecting') {
          if (message.type === 'ready') {
            clearTimeout(timer)
            this.#rejectStart = undefined
            this.#state = 'live'
            this.#armStall()
            resolve()
          } else if (message.type === 'error') {
            fail(new LiveDictationStartError(message.code, message.message, FALLBACK_CODES.has(message.code)))
          }
          return
        }
        this.#receive(message)
      }
      socket.onclose = () => {
        if (this.#state === 'connecting') {
          fail(new LiveDictationStartError('unavailable', 'The dictation connection closed', true))
        } else {
          this.#fail({ code: 'unavailable', message: 'The dictation connection closed', fatal: true })
        }
      }
      socket.onerror = () => undefined
    })
  }

  #receive(message: DictationServerMessage): void {
    if (this.#state !== 'live' && this.#state !== 'stopping') return
    this.#armStall()
    switch (message.type) {
      case 'text':
        this.#committed += message.committedAppend
        this.#tentative = message.tentative
        this.#callbacks.onText({ committed: this.#committed, tentative: this.#tentative })
        return
      case 'final':
        this.#finish(message.text, false)
        return
      case 'error':
        this.#callbacks.onError({ code: message.code, message: message.message, fatal: message.fatal })
        // A final text with what was confirmed follows a fatal engine error.
        return
      case 'ready':
      case 'heartbeat':
        return
    }
  }

  #sendAudio(pcm16: Int16Array): void {
    if (this.#state !== 'live' && this.#state !== 'stopping') return
    const frame = encodeDictationAudioFrame(this.#sequence, pcm16)
    if ((this.#socket?.bufferedAmount ?? 0) + frame.byteLength > DICTATION_LIMITS.maxBacklogBytes) {
      this.#fail({ code: 'backpressure', message: 'The connection is too slow for live dictation', fatal: true })
      return
    }
    this.#sequence += 1
    if (this.#socket?.readyState === OPEN) this.#socket.send(frame)
  }

  /** Ends a ready stream that broke; the committed text is its final text. */
  #fail(error: DictationClientError): void {
    if (this.#state !== 'live' && this.#state !== 'stopping') return
    this.#callbacks.onError(error)
    this.#finish(this.#committed)
  }

  /** `cancel` tells a server that has not finished the stream to drop it. */
  #finish(text: string, cancel = true): void {
    if (this.#state !== 'live' && this.#state !== 'stopping') return
    this.#state = 'ended'
    this.#abandon(cancel)
    this.#callbacks.onFinal(text)
    this.#resolveFinished?.()
  }

  /** Releases the microphone and the connection. */
  #abandon(cancel = true): void {
    if (this.#heartbeat !== undefined) clearInterval(this.#heartbeat)
    if (this.#stall !== undefined) clearTimeout(this.#stall)
    if (this.#finalTimer !== undefined) clearTimeout(this.#finalTimer)
    this.#heartbeat = undefined
    this.#stall = undefined
    this.#finalTimer = undefined
    const capture = this.#capture
    this.#capture = undefined
    void capture?.stop().catch(() => undefined)
    const socket = this.#socket
    if (!socket) return
    socket.onmessage = null
    socket.onclose = null
    if (socket.readyState === OPEN) {
      if (cancel) this.#send({ protocol: DICTATION_PROTOCOL, type: 'cancel' })
      socket.close(1000, 'Dictation ended')
    } else if (socket.readyState === 0) {
      socket.close(1000, 'Dictation ended')
    }
    this.#resolveFinished?.()
  }

  /** The state now; awaits in between can change what a check before them saw. */
  #current(): ClientState {
    return this.#state
  }

  #armStall(): void {
    if (this.#stall !== undefined) clearTimeout(this.#stall)
    this.#stall = setTimeout(() => {
      this.#fail({ code: 'stalled', message: 'The dictation connection stopped responding', fatal: true })
    }, DICTATION_LIMITS.stallMs)
  }

  #send(message: DictationClientMessage): void {
    if (this.#socket?.readyState === OPEN) this.#socket.send(JSON.stringify(message))
  }
}

function cancelled(): LiveDictationStartError {
  return new LiveDictationStartError('cancelled', 'Live dictation was cancelled', false)
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}
