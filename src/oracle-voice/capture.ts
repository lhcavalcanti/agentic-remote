import type { RealTimeVADOptions } from '@ricky0123/vad-web'
import {
  ORACLE_VOICE_PROTOCOL,
  ORACLE_VOICE_SAMPLE_RATE,
  voiceAudioFrameByteLength,
  type VoiceAudioFrame,
  type VoiceClientControl,
} from '../../shared/oracle-voice'
import { Pcm16Resampler } from './pcm'
import {
  ORACLE_VOICE_ONNX_WASM_BASE_PATH,
  ORACLE_VOICE_VAD_BASE_PATH,
} from './vad-assets'

const DEFAULT_PRE_ROLL_BYTES = ORACLE_VOICE_SAMPLE_RATE * 2 * 3 / 2
const DEFAULT_QUEUE_BYTES = ORACLE_VOICE_SAMPLE_RATE * 2 * 2

export type VoiceCaptureErrorCode =
  | 'permission-denied'
  | 'media-devices-unavailable'
  | 'audio-worklet-unavailable'
  | 'frame-queue-overflow'
  | 'capture-failed'

export class VoiceCaptureError extends Error {
  readonly code: VoiceCaptureErrorCode
  readonly dictationFallback: boolean

  constructor(
    code: VoiceCaptureErrorCode,
    message: string,
    dictationFallback = false,
  ) {
    super(message)
    this.name = 'VoiceCaptureError'
    this.code = code
    this.dictationFallback = dictationFallback
  }
}

export interface VoiceVad {
  destroy(): Promise<void>
}

export interface VoiceVadOptions {
  audioContext: AudioContext
  baseAssetPath: string
  onnxWASMBasePath: string
  model: 'v5'
  processorType: 'AudioWorklet'
  startOnLoad: true
  getStream(): Promise<MediaStream>
  pauseStream(stream: MediaStream): Promise<void>
  resumeStream(stream: MediaStream): Promise<MediaStream>
  onFrameProcessed(probabilities: unknown, frame: Float32Array): void
  onSpeechStart(): void
  onSpeechRealStart(): void
  onSpeechEnd(audio: Float32Array): void
  onVADMisfire(): void
}

export interface VoiceCaptureDependencies {
  mediaDevices?: Pick<MediaDevices, 'getUserMedia'>
  audioWorkletSupported(): boolean
  createAudioContext(): AudioContext
  createVad(options: VoiceVadOptions): Promise<VoiceVad>
  createUtteranceId(): string
}

export interface VoiceCaptureOptions {
  streamId: string
  initialGeneration: number
  inputSampleRate?: number
  maxPreRollBytes?: number
  maxQueueBytes?: number
  dependencies?: Partial<VoiceCaptureDependencies>
  sendControl(control: VoiceClientControl): void
  sendAudio(frame: VoiceAudioFrame): void | Promise<void>
  onTentativeSpeech?(): void
  onSpeechConfirmed?(generation: number): void
  onVadMisfire?(): void
  onError?(error: VoiceCaptureError): void
}

interface BufferedFrame {
  samples: Int16Array
  bytes: number
}

interface QueuedAudio {
  frame: VoiceAudioFrame
  bytes: number
}

export class VoiceCapture {
  private readonly streamId: string
  private readonly inputSampleRate: number
  private readonly maxPreRollBytes: number
  private readonly maxQueueBytes: number
  private readonly dependencies: VoiceCaptureDependencies
  private readonly sendControl: (control: VoiceClientControl) => void
  private readonly sendAudio: (frame: VoiceAudioFrame) => void | Promise<void>
  private readonly onTentativeSpeech: () => void
  private readonly onSpeechConfirmed: (generation: number) => void
  private readonly onVadMisfire: () => void
  private readonly onError: (error: VoiceCaptureError) => void
  private readonly resampler: Pcm16Resampler
  private readonly preRoll: BufferedFrame[] = []
  private readonly audioQueue: QueuedAudio[] = []
  private generation: number
  private sequence = 0
  private preRollBytes = 0
  private pendingAudioBytes = 0
  private utteranceId: string | undefined
  private tentative = false
  private confirmed = false
  private pumping = false
  private wanted = false
  private running = false
  private runId = 0
  private startPromise: Promise<void> | undefined
  private stream: MediaStream | undefined
  private audioContext: AudioContext | undefined
  private vad: VoiceVad | undefined
  private stoppedTracks = new WeakSet<MediaStreamTrack>()
  private reportedFailure = false

  constructor(options: VoiceCaptureOptions) {
    validateIdentity(options.streamId, options.initialGeneration)
    this.streamId = options.streamId
    this.generation = options.initialGeneration
    this.inputSampleRate = options.inputSampleRate ?? ORACLE_VOICE_SAMPLE_RATE
    this.maxPreRollBytes = positiveLimit(
      options.maxPreRollBytes ?? DEFAULT_PRE_ROLL_BYTES,
      'maxPreRollBytes',
    )
    this.maxQueueBytes = positiveLimit(
      options.maxQueueBytes ?? DEFAULT_QUEUE_BYTES,
      'maxQueueBytes',
    )
    this.dependencies = {
      mediaDevices: options.dependencies?.mediaDevices
        ?? globalThis.navigator?.mediaDevices,
      audioWorkletSupported: options.dependencies?.audioWorkletSupported
        ?? (() => typeof globalThis.AudioWorkletNode === 'function'),
      createAudioContext: options.dependencies?.createAudioContext
        ?? defaultAudioContext,
      createVad: options.dependencies?.createVad ?? createMicVad,
      createUtteranceId: options.dependencies?.createUtteranceId
        ?? (() => globalThis.crypto.randomUUID()),
    }
    this.sendControl = options.sendControl
    this.sendAudio = options.sendAudio
    this.onTentativeSpeech = options.onTentativeSpeech ?? (() => undefined)
    this.onSpeechConfirmed = options.onSpeechConfirmed ?? (() => undefined)
    this.onVadMisfire = options.onVadMisfire ?? (() => undefined)
    this.onError = options.onError ?? (() => undefined)
    this.resampler = new Pcm16Resampler(
      this.inputSampleRate,
      ORACLE_VOICE_SAMPLE_RATE,
    )
  }

  get currentGeneration(): number {
    return this.generation
  }

  start(): Promise<void> {
    if (this.running) return Promise.resolve()
    if (this.startPromise) return this.startPromise
    this.wanted = true
    this.reportedFailure = false
    const runId = ++this.runId
    const started = this.startCapture(runId)
    const tracked = started.finally(() => {
      if (this.startPromise === tracked) this.startPromise = undefined
    })
    this.startPromise = tracked
    return tracked
  }

  async stop(): Promise<void> {
    this.wanted = false
    this.running = false
    this.runId += 1
    this.tentative = false
    this.confirmed = false
    this.utteranceId = undefined
    this.sequence = 0
    this.resampler.reset()
    this.clearPreRoll()
    this.clearQueuedAudio()

    const vad = this.vad
    const stream = this.stream
    const audioContext = this.audioContext
    this.vad = undefined
    this.stream = undefined
    this.audioContext = undefined
    if (vad) {
      await vad.destroy().catch(() => undefined)
    }
    if (stream) this.stopTracks(stream)
    if (audioContext && audioContext.state !== 'closed') {
      await audioContext.close().catch(() => undefined)
    }
  }

  private async startCapture(runId: number): Promise<void> {
    const mediaDevices = this.dependencies.mediaDevices
    if (!mediaDevices?.getUserMedia) {
      throw this.report(new VoiceCaptureError(
        'media-devices-unavailable',
        'Conversation microphone capture is not supported. Dictation is still available.',
        true,
      ))
    }
    if (!this.dependencies.audioWorkletSupported()) {
      throw this.report(new VoiceCaptureError(
        'audio-worklet-unavailable',
        'Conversation requires AudioWorklet. Use dictation in this browser.',
        true,
      ))
    }

    let stream: MediaStream
    try {
      stream = await mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: true,
        },
      })
    } catch (error) {
      if (!this.isCurrentRun(runId)) return
      throw this.report(permissionError(error))
    }
    if (!this.isCurrentRun(runId)) {
      this.stopTracks(stream)
      return
    }
    this.stream = stream

    let audioContext: AudioContext
    try {
      audioContext = this.dependencies.createAudioContext()
    } catch (error) {
      this.stopTracks(stream)
      this.stream = undefined
      throw this.report(captureFailure(error))
    }
    this.audioContext = audioContext
    if (!audioContext.audioWorklet?.addModule) {
      await this.releaseRunResources(stream, audioContext)
      if (!this.isCurrentRun(runId)) return
      throw this.report(new VoiceCaptureError(
        'audio-worklet-unavailable',
        'Conversation requires AudioWorklet. Use dictation in this browser.',
        true,
      ))
    }
    try {
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }
    } catch (error) {
      await this.releaseRunResources(stream, audioContext)
      if (!this.isCurrentRun(runId)) return
      throw this.report(captureFailure(error))
    }

    try {
      const vad = await this.dependencies.createVad({
        audioContext,
        baseAssetPath: ORACLE_VOICE_VAD_BASE_PATH,
        onnxWASMBasePath: ORACLE_VOICE_ONNX_WASM_BASE_PATH,
        model: 'v5',
        processorType: 'AudioWorklet',
        startOnLoad: true,
        getStream: async () => stream,
        pauseStream: async () => undefined,
        resumeStream: async () => stream,
        onFrameProcessed: (_probabilities, frame) => this.processFrame(frame),
        onSpeechStart: () => this.speechTentative(),
        onSpeechRealStart: () => this.speechConfirmed(),
        onSpeechEnd: () => this.speechEnded(),
        onVADMisfire: () => this.vadMisfire(),
      })
      if (!this.isCurrentRun(runId)) {
        await vad.destroy().catch(() => undefined)
        await this.releaseRunResources(stream, audioContext)
        return
      }
      this.vad = vad
      this.running = true
    } catch (error) {
      await this.releaseRunResources(stream, audioContext)
      if (!this.isCurrentRun(runId)) return
      throw this.report(captureFailure(error))
    }
  }

  private processFrame(frame: Float32Array): void {
    if (!this.wanted) return
    try {
      const samples = this.resampler.push(frame)
      if (samples.length === 0) return
      if (this.confirmed) {
        this.enqueueAudio(samples)
      } else {
        this.bufferPreRoll(samples)
      }
    } catch (error) {
      this.fail(captureFailure(error))
    }
  }

  private speechTentative(): void {
    if (!this.wanted || this.tentative || this.confirmed) return
    this.tentative = true
    try {
      this.onTentativeSpeech()
      this.sendControl(this.control('speech_tentative', this.generation, {}))
    } catch (error) {
      this.fail(captureFailure(error))
    }
  }

  private speechConfirmed(): void {
    if (!this.wanted || this.confirmed) return
    if (this.generation === 0xffff_ffff) {
      this.fail(new VoiceCaptureError(
        'capture-failed',
        'Oracle voice generation limit was reached',
      ))
      return
    }
    this.generation += 1
    this.sequence = 0
    this.confirmed = true
    this.tentative = false
    this.utteranceId = this.dependencies.createUtteranceId()
    this.dropStaleQueuedAudio()
    try {
      this.onSpeechConfirmed(this.generation)
      this.sendControl(this.control('speech_confirmed', this.generation, {
        utteranceId: this.utteranceId,
      }))
      for (const frame of this.preRoll.splice(0)) {
        this.preRollBytes -= frame.bytes
        this.enqueueAudio(frame.samples)
      }
    } catch (error) {
      this.fail(captureFailure(error))
    }
  }

  private vadMisfire(): void {
    if (!this.wanted || this.confirmed || !this.tentative) return
    this.tentative = false
    this.clearPreRoll()
    try {
      this.onVadMisfire()
    } catch (error) {
      this.fail(captureFailure(error))
    }
  }

  private speechEnded(): void {
    if (!this.wanted || !this.confirmed || !this.utteranceId) return
    try {
      this.sendControl(this.control('speech_end', this.generation, {
        utteranceId: this.utteranceId,
      }))
    } catch (error) {
      this.fail(captureFailure(error))
      return
    }
    this.confirmed = false
    this.tentative = false
    this.utteranceId = undefined
    this.clearPreRoll()
  }

  private bufferPreRoll(samples: Int16Array): void {
    const bytes = samples.byteLength
    if (bytes > this.maxPreRollBytes) {
      const retained = samples.slice(samples.length - Math.floor(this.maxPreRollBytes / 2))
      this.clearPreRoll()
      this.preRoll.push({ samples: retained, bytes: retained.byteLength })
      this.preRollBytes = retained.byteLength
      return
    }
    while (
      this.preRoll.length > 0
      && this.preRollBytes > this.maxPreRollBytes - bytes
    ) {
      const dropped = this.preRoll.shift()
      if (dropped) this.preRollBytes -= dropped.bytes
    }
    this.preRoll.push({ samples, bytes })
    this.preRollBytes += bytes
  }

  private enqueueAudio(samples: Int16Array): void {
    const frame: VoiceAudioFrame = {
      direction: 'microphone',
      generation: this.generation,
      sequence: this.sequence,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples,
    }
    const bytes = voiceAudioFrameByteLength(frame)
    if (bytes > this.maxQueueBytes || this.pendingAudioBytes > this.maxQueueBytes - bytes) {
      this.fail(new VoiceCaptureError(
        'frame-queue-overflow',
        'Microphone audio could not be sent fast enough. Conversation stopped.',
      ))
      return
    }
    this.sequence += 1
    this.audioQueue.push({ frame, bytes })
    this.pendingAudioBytes += bytes
    void this.pumpAudio()
  }

  private async pumpAudio(): Promise<void> {
    if (this.pumping) return
    this.pumping = true
    try {
      while (this.audioQueue.length > 0) {
        const queued = this.audioQueue.shift()
        if (!queued) continue
        if (!this.wanted || queued.frame.generation !== this.generation) {
          this.pendingAudioBytes -= queued.bytes
          continue
        }
        try {
          await this.sendAudio(queued.frame)
        } finally {
          this.pendingAudioBytes -= queued.bytes
        }
      }
    } catch (error) {
      this.fail(captureFailure(error))
    } finally {
      this.pumping = false
      if (this.audioQueue.length > 0 && this.wanted) void this.pumpAudio()
    }
  }

  private dropStaleQueuedAudio(): void {
    for (let index = this.audioQueue.length - 1; index >= 0; index -= 1) {
      const queued = this.audioQueue[index]
      if (queued.frame.generation === this.generation) continue
      this.audioQueue.splice(index, 1)
      this.pendingAudioBytes -= queued.bytes
    }
  }

  private clearQueuedAudio(): void {
    for (const queued of this.audioQueue.splice(0)) {
      this.pendingAudioBytes -= queued.bytes
    }
  }

  private clearPreRoll(): void {
    this.preRoll.length = 0
    this.preRollBytes = 0
  }

  private control<TType extends VoiceClientControl['type']>(
    type: TType,
    generation: number,
    rest: Omit<
      Extract<VoiceClientControl, { type: TType }>,
      'type' | 'protocol' | 'streamId' | 'generation'
    >,
  ): Extract<VoiceClientControl, { type: TType }> {
    return {
      type,
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: this.streamId,
      generation,
      ...rest,
    } as Extract<VoiceClientControl, { type: TType }>
  }

  private fail(error: VoiceCaptureError): void {
    this.report(error)
    void this.stop()
  }

  private report(error: VoiceCaptureError): VoiceCaptureError {
    if (!this.reportedFailure) {
      this.reportedFailure = true
      this.onError(error)
    }
    return error
  }

  private isCurrentRun(runId: number): boolean {
    return this.wanted && this.runId === runId
  }

  private async releaseRunResources(
    stream: MediaStream,
    audioContext: AudioContext,
  ): Promise<void> {
    if (this.stream === stream) this.stream = undefined
    if (this.audioContext === audioContext) this.audioContext = undefined
    this.stopTracks(stream)
    if (audioContext.state !== 'closed') {
      await audioContext.close().catch(() => undefined)
    }
  }

  private stopTracks(stream: MediaStream): void {
    for (const track of stream.getTracks()) {
      if (this.stoppedTracks.has(track)) continue
      this.stoppedTracks.add(track)
      track.stop()
    }
  }
}

async function createMicVad(options: VoiceVadOptions): Promise<VoiceVad> {
  const { MicVAD } = await import('@ricky0123/vad-web')
  return MicVAD.new(options as Partial<RealTimeVADOptions>)
}

function defaultAudioContext(): AudioContext {
  const AudioContextConstructor = globalThis.AudioContext
  if (!AudioContextConstructor) {
    throw new VoiceCaptureError(
      'audio-worklet-unavailable',
      'Conversation requires AudioWorklet. Use dictation in this browser.',
      true,
    )
  }
  return new AudioContextConstructor()
}

function permissionError(error: unknown): VoiceCaptureError {
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return new VoiceCaptureError(
      'permission-denied',
      'Microphone permission was denied. Dictation is still available.',
      true,
    )
  }
  return captureFailure(error)
}

function captureFailure(error: unknown): VoiceCaptureError {
  if (error instanceof VoiceCaptureError) return error
  return new VoiceCaptureError(
    'capture-failed',
    error instanceof Error ? error.message : String(error),
  )
}

function positiveLimit(value: number, name: string): number {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive safe integer`)
  }
  return value
}

function validateIdentity(streamId: string, generation: number): void {
  if (!streamId) throw new Error('streamId is required')
  if (
    !Number.isInteger(generation)
    || generation < 0
    || generation > 0xffff_ffff
  ) {
    throw new RangeError('initialGeneration must be a uint32')
  }
}
