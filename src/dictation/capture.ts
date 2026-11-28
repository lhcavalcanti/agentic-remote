import { DICTATION_LIMITS } from '../../shared/dictation'
import { Pcm16Resampler } from '../oracle-voice/pcm'

/** 100 ms of 16 kHz audio. */
export const DICTATION_FRAME_SAMPLES = DICTATION_LIMITS.sampleRate / 10
export const PCM_CAPTURE_PROCESSOR = 'agentic-remote-pcm-capture'

export type PcmCaptureErrorCode =
  | 'audio-worklet-unavailable'
  | 'media-devices-unavailable'
  | 'permission-denied'
  | 'capture-failed'

export class PcmCaptureError extends Error {
  readonly code: PcmCaptureErrorCode

  constructor(code: PcmCaptureErrorCode, message: string) {
    super(message)
    this.name = 'PcmCaptureError'
    this.code = code
  }
}

export interface PcmCapture {
  start(onFrame: (pcm16: Int16Array) => void, onInterrupted: (reason: string) => void): Promise<void>
  /** Sends the last partial frame, then releases the microphone. */
  stop(): Promise<void>
}

type PageVisibility = Pick<Document, 'visibilityState'> & Pick<EventTarget, 'addEventListener' | 'removeEventListener'>

export interface CaptureDeps {
  mediaDevices?: Pick<MediaDevices, 'getUserMedia'>
  audioWorkletSupported(): boolean
  createAudioContext(): AudioContext
  createWorkletNode(context: AudioContext): AudioWorkletNode
  workletUrl: string
  document?: PageVisibility
}

function defaultDeps(): CaptureDeps {
  return {
    mediaDevices: globalThis.navigator?.mediaDevices,
    audioWorkletSupported: () => typeof globalThis.AudioWorkletNode === 'function'
      && typeof globalThis.AudioContext === 'function',
    createAudioContext: () => new AudioContext(),
    createWorkletNode: (context) => new AudioWorkletNode(context, PCM_CAPTURE_PROCESSOR, {
      numberOfInputs: 1,
      channelCount: 1,
      channelCountMode: 'explicit',
    }),
    workletUrl: new URL('./pcm-capture-worklet.js', import.meta.url).href,
    document: globalThis.document,
  }
}

/**
 * Microphone capture for live dictation: 16 kHz PCM16 in 100 ms frames.
 * Losing the microphone, the page going to the background, or the audio
 * session being interrupted (an iPhone call or lock) ends capture through
 * `onInterrupted`, once.
 */
export function createPcmCapture(overrides: Partial<CaptureDeps> = {}): PcmCapture {
  const deps = { ...defaultDeps(), ...overrides }
  let run = 0
  let release: (() => Promise<void>) | undefined
  let flush: (() => void) | undefined

  return {
    async start(onFrame, onInterrupted) {
      const current = ++run
      if (!deps.audioWorkletSupported()) {
        throw new PcmCaptureError('audio-worklet-unavailable', 'This browser cannot stream microphone audio')
      }
      if (!deps.mediaDevices?.getUserMedia) {
        throw new PcmCaptureError('media-devices-unavailable', 'Microphone recording is not supported in this browser')
      }
      let stream: MediaStream
      try {
        stream = await deps.mediaDevices.getUserMedia({
          audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
        })
      } catch (error) {
        throw error instanceof DOMException && error.name === 'NotAllowedError'
          ? new PcmCaptureError('permission-denied', 'Microphone permission was denied')
          : new PcmCaptureError('capture-failed', errorMessage(error))
      }
      const tracks = stream.getTracks()
      let context: AudioContext | undefined
      let node: AudioWorkletNode | undefined
      let source: MediaStreamAudioSourceNode | undefined
      let interrupted = false
      const interrupt = (reason: string) => {
        if (interrupted || release === undefined) return
        interrupted = true
        onInterrupted(reason)
      }
      const ended = () => interrupt('The microphone was disconnected')
      const muted = () => interrupt('The microphone was interrupted')
      const visibility = () => {
        if (deps.document?.visibilityState === 'hidden') interrupt('The page went to the background')
      }
      const statechange = () => {
        const state = context?.state as string | undefined
        if (state === 'interrupted' || state === 'suspended') interrupt('The microphone was interrupted')
      }
      const cleanup = async () => {
        for (const track of tracks) {
          track.removeEventListener('ended', ended)
          track.removeEventListener('mute', muted)
          track.stop()
        }
        deps.document?.removeEventListener('visibilitychange', visibility)
        context?.removeEventListener('statechange', statechange)
        if (node) node.port.onmessage = null
        source?.disconnect()
        node?.disconnect()
        if (context && context.state !== 'closed') await context.close().catch(() => undefined)
      }
      try {
        context = deps.createAudioContext()
        if (context.state === 'suspended') await context.resume()
        await context.audioWorklet.addModule(deps.workletUrl)
        if (current !== run) throw new PcmCaptureError('capture-failed', 'Capture was stopped')
        source = context.createMediaStreamSource(stream)
        node = deps.createWorkletNode(context)
        source.connect(node)
      } catch (error) {
        await cleanup()
        throw error instanceof PcmCaptureError ? error : new PcmCaptureError('capture-failed', errorMessage(error))
      }

      const resampler = new Pcm16Resampler(context.sampleRate, DICTATION_LIMITS.sampleRate)
      let pending = new Int16Array(0)
      node.port.onmessage = (event: MessageEvent<Float32Array>) => {
        const samples = resampler.push(event.data)
        if (samples.length === 0) return
        const joined = new Int16Array(pending.length + samples.length)
        joined.set(pending)
        joined.set(samples, pending.length)
        let offset = 0
        while (joined.length - offset >= DICTATION_FRAME_SAMPLES) {
          onFrame(joined.slice(offset, offset + DICTATION_FRAME_SAMPLES))
          offset += DICTATION_FRAME_SAMPLES
        }
        pending = joined.slice(offset)
      }
      flush = () => {
        if (pending.length > 0) onFrame(pending)
        pending = new Int16Array(0)
      }
      for (const track of tracks) {
        track.addEventListener('ended', ended)
        track.addEventListener('mute', muted)
      }
      deps.document?.addEventListener('visibilitychange', visibility)
      context.addEventListener('statechange', statechange)
      release = cleanup
    },

    async stop() {
      run += 1
      const releasing = release
      release = undefined
      flush?.()
      flush = undefined
      await releasing?.()
    },
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'The microphone could not start'
}
