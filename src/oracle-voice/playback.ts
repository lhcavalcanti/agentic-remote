import {
  ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS,
  type VoiceAudioFrame,
} from '../../shared/oracle-voice'

const TENTATIVE_GAIN = 0.12
const TENTATIVE_RAMP_SECONDS = 0.02
const MISFIRE_RAMP_SECONDS = 0.08
const DEFAULT_MAX_SCHEDULED_SOURCES = 512

export class VoicePlaybackSequenceError extends Error {
  constructor(message = 'Voice playback audio sequence is out of order') {
    super(message)
    this.name = 'VoicePlaybackSequenceError'
  }
}

export class VoicePlaybackQueueError extends Error {
  constructor(
    message = `Voice playback queue exceeds ${ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS} seconds`,
  ) {
    super(message)
    this.name = 'VoicePlaybackQueueError'
  }
}

export interface VoicePlaybackOptions {
  initialGeneration: number
  maxQueuedSeconds?: number
  maxScheduledSources?: number
  createAudioContext?: () => AudioContext
}

interface ScheduledSource {
  source: AudioBufferSourceNode
  generation: number
  segmentId: string
  endTime: number
}

interface SegmentDrain {
  promise: Promise<boolean>
  resolve(drained: boolean): void
}

export class VoicePlayback {
  private readonly context: AudioContext
  private readonly gainNode: GainNode
  private readonly maxQueuedSeconds: number
  private readonly maxScheduledSources: number
  private readonly sources = new Set<ScheduledSource>()
  private readonly nextSequenceBySegment = new Map<string, number>()
  private readonly endedSegments = new Set<string>()
  private readonly segmentDrains = new Map<string, SegmentDrain>()
  private generation: number
  private nextStartTime: number
  private closed = false
  private closePromise: Promise<void> | undefined

  constructor(options: VoicePlaybackOptions) {
    validateGeneration(options.initialGeneration)
    const maxQueuedSeconds = options.maxQueuedSeconds
      ?? ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS
    if (!Number.isFinite(maxQueuedSeconds) || maxQueuedSeconds <= 0) {
      throw new RangeError('maxQueuedSeconds must be positive')
    }
    const maxScheduledSources =
      options.maxScheduledSources ?? DEFAULT_MAX_SCHEDULED_SOURCES
    if (!Number.isSafeInteger(maxScheduledSources) || maxScheduledSources <= 0) {
      throw new RangeError('maxScheduledSources must be a positive safe integer')
    }
    this.generation = options.initialGeneration
    this.maxQueuedSeconds = maxQueuedSeconds
    this.maxScheduledSources = maxScheduledSources
    this.context = (options.createAudioContext ?? defaultAudioContext)()
    this.gainNode = this.context.createGain()
    this.gainNode.connect(this.context.destination)
    this.nextStartTime = this.context.currentTime
  }

  get currentGeneration(): number {
    return this.generation
  }

  get queuedSeconds(): number {
    if (this.sources.size === 0) return 0
    return Math.max(0, this.nextStartTime - this.context.currentTime)
  }

  get activeSourceCount(): number {
    return this.sources.size
  }

  async start(): Promise<void> {
    this.requireOpen()
    if (this.context.state === 'suspended') await this.context.resume()
  }

  enqueue(frame: VoiceAudioFrame): boolean {
    this.requireOpen()
    if (frame.direction !== 'playback') {
      throw new TypeError('VoicePlayback accepts playback audio only')
    }
    if (frame.generation < this.generation) return false
    if (frame.generation > this.generation) {
      throw new Error('Voice playback generation is ahead of the active generation')
    }
    if (frame.samples.length === 0) {
      throw new VoicePlaybackSequenceError('Voice playback frame must not be empty')
    }

    const segmentKey = this.segmentKey(frame.generation, frame.segmentId)
    if (this.endedSegments.has(segmentKey)) {
      throw new VoicePlaybackSequenceError('Voice playback segment has already ended')
    }
    const expectedSequence = this.nextSequenceBySegment.get(segmentKey) ?? 0
    if (frame.sequence !== expectedSequence) {
      throw new VoicePlaybackSequenceError()
    }
    if (this.sources.size >= this.maxScheduledSources) {
      throw new VoicePlaybackQueueError('Voice playback scheduled-source limit exceeded')
    }

    const duration = frame.samples.length / frame.sampleRate
    const startTime = Math.max(this.context.currentTime, this.nextStartTime)
    const endTime = startTime + duration
    if (endTime - this.context.currentTime > this.maxQueuedSeconds) {
      throw new VoicePlaybackQueueError(
        `Voice playback queue exceeds ${this.maxQueuedSeconds} seconds`,
      )
    }

    const buffer = this.context.createBuffer(
      1,
      frame.samples.length,
      frame.sampleRate,
    )
    buffer.copyToChannel(pcm16ToFloat(frame.samples), 0)
    const source = this.context.createBufferSource()
    source.buffer = buffer
    source.connect(this.gainNode)
    const scheduled: ScheduledSource = {
      source,
      generation: frame.generation,
      segmentId: frame.segmentId,
      endTime,
    }
    source.onended = () => this.removeSource(scheduled)
    this.sources.add(scheduled)
    this.nextSequenceBySegment.set(segmentKey, expectedSequence + 1)
    this.nextStartTime = endTime
    source.start(startTime)
    return true
  }

  tentativeSpeech(): void {
    this.requireOpen()
    this.rampGain(TENTATIVE_GAIN, TENTATIVE_RAMP_SECONDS)
  }

  restoreAfterMisfire(): void {
    this.requireOpen()
    this.rampGain(1, MISFIRE_RAMP_SECONDS)
  }

  confirmSpeech(generation: number): boolean {
    this.requireOpen()
    validateGeneration(generation)
    if (generation <= this.generation) return false
    this.cancelCurrent()
    this.generation = generation
    return true
  }

  cancelCurrent(): void {
    this.requireOpen()
    this.settleSegmentDrains(false)
    this.stopAllSources()
    this.nextSequenceBySegment.clear()
    this.endedSegments.clear()
    this.nextStartTime = this.context.currentTime
    this.setGainImmediately(1)
  }

  endSegment(generation: number, segmentId: string): Promise<boolean> {
    if (generation !== this.generation) return Promise.resolve(false)
    const segmentKey = this.segmentKey(generation, segmentId)
    this.nextSequenceBySegment.delete(segmentKey)
    this.endedSegments.add(segmentKey)
    if (!this.hasSourcesForSegment(generation, segmentId)) {
      return Promise.resolve(true)
    }
    const existing = this.segmentDrains.get(segmentKey)
    if (existing) return existing.promise
    let resolve!: (drained: boolean) => void
    const promise = new Promise<boolean>((settle) => {
      resolve = settle
    })
    this.segmentDrains.set(segmentKey, { promise, resolve })
    return promise
  }

  close(): Promise<void> {
    this.closePromise ??= this.finishClose()
    return this.closePromise
  }

  private async finishClose(): Promise<void> {
    if (this.closed) return
    this.closed = true
    this.settleSegmentDrains(false)
    this.stopAllSources()
    this.nextSequenceBySegment.clear()
    this.endedSegments.clear()
    this.gainNode.disconnect()
    if (this.context.state !== 'closed') await this.context.close()
  }

  private rampGain(value: number, duration: number): void {
    const now = this.context.currentTime
    this.gainNode.gain.cancelScheduledValues(now)
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now)
    this.gainNode.gain.linearRampToValueAtTime(value, now + duration)
  }

  private setGainImmediately(value: number): void {
    const now = this.context.currentTime
    this.gainNode.gain.cancelScheduledValues(now)
    this.gainNode.gain.setValueAtTime(value, now)
  }

  private stopAllSources(): void {
    for (const scheduled of [...this.sources]) {
      this.sources.delete(scheduled)
      scheduled.source.onended = null
      try {
        scheduled.source.stop()
      } catch {
        // A source that ended between the snapshot and stop is already clean.
      }
      scheduled.source.disconnect()
    }
    this.nextStartTime = this.context.currentTime
  }

  private removeSource(scheduled: ScheduledSource): void {
    if (!this.sources.delete(scheduled)) return
    scheduled.source.onended = null
    scheduled.source.disconnect()
    const segmentKey = this.segmentKey(scheduled.generation, scheduled.segmentId)
    if (
      this.endedSegments.has(segmentKey)
      && !this.hasSourcesForSegment(scheduled.generation, scheduled.segmentId)
    ) {
      const drain = this.segmentDrains.get(segmentKey)
      this.segmentDrains.delete(segmentKey)
      drain?.resolve(true)
    }
    if (this.sources.size === 0) this.nextStartTime = this.context.currentTime
  }

  private hasSourcesForSegment(generation: number, segmentId: string): boolean {
    for (const scheduled of this.sources) {
      if (
        scheduled.generation === generation
        && scheduled.segmentId === segmentId
      ) {
        return true
      }
    }
    return false
  }

  private settleSegmentDrains(drained: boolean): void {
    for (const drain of this.segmentDrains.values()) drain.resolve(drained)
    this.segmentDrains.clear()
  }

  private segmentKey(generation: number, segmentId: string): string {
    return `${generation}:${segmentId}`
  }

  private requireOpen(): void {
    if (this.closed) throw new Error('Voice playback is closed')
  }
}

function pcm16ToFloat(samples: Int16Array): Float32Array<ArrayBuffer> {
  const floats = new Float32Array(new ArrayBuffer(samples.length * 4))
  for (let index = 0; index < samples.length; index += 1) {
    floats[index] = samples[index] < 0
      ? samples[index] / 32768
      : samples[index] / 32767
  }
  return floats
}

function defaultAudioContext(): AudioContext {
  const AudioContextConstructor = globalThis.AudioContext
  if (!AudioContextConstructor) {
    throw new Error('Streaming voice playback requires Web Audio')
  }
  return new AudioContextConstructor()
}

function validateGeneration(generation: number): void {
  if (
    !Number.isInteger(generation)
    || generation < 0
    || generation > 0xffff_ffff
  ) {
    throw new RangeError('Voice generation must be a uint32')
  }
}
