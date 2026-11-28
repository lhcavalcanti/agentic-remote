import type { AudioTranscription } from '../shared/contracts.js'
import type { ComputerManager } from './computer-manager.js'
import {
  MAX_AUDIO_BYTES,
  supportsAudioUpload,
  TranscriptionError,
  type AudioUpload,
  type TranscriptionService,
} from './transcription-service.js'

export interface DelegatedTranscriptionOptions {
  manager: ComputerManager
  computerName: string
  local: TranscriptionService
}

/**
 * The assigned computer admits as many as its engine allows (Parakeet queues
 * one recording behind the active one; Whisper takes one) and refuses the
 * rest with 429, so the hub forwards no more than the larger of the two.
 */
const MAX_FORWARDED_RECORDINGS = 2

/**
 * Runs transcription on a paired computer instead of the hub, so the computer
 * that owns the microphone-facing UI does not have to own Whisper, its model,
 * or the hardware that makes it fast.
 */
export class DelegatedTranscriptionService implements TranscriptionService {
  private readonly manager: ComputerManager
  private readonly local: TranscriptionService
  private readonly active = new Set<AbortController>()

  readonly computerName: string

  constructor(options: DelegatedTranscriptionOptions) {
    this.manager = options.manager
    this.computerName = options.computerName
    this.local = options.local
  }

  async initialize(): Promise<void> {
    await this.local.initialize()
  }

  async transcribe(
    upload: AudioUpload,
    signal?: AbortSignal,
  ): Promise<AudioTranscription> {
    const computer = this.manager.findComputer(this.computerName)
    if (!computer) {
      throw new TranscriptionError(
        `Audio transcription is assigned to "${this.computerName}", which is not a paired computer`,
        503,
      )
    }
    if (computer.isLocal) {
      return this.local.transcribe(upload, signal)
    }
    if (!computer.online) {
      throw new TranscriptionError(
        `${computer.name} transcribes audio for this hub and is offline`,
        503,
      )
    }
    if (this.active.size >= MAX_FORWARDED_RECORDINGS) {
      throw new TranscriptionError(
        'Another audio recording is already being transcribed',
        429,
      )
    }
    if (!supportsAudioUpload(upload.filename, upload.mimeType)) {
      throw new TranscriptionError('Unsupported audio file type', 415)
    }

    const controller = new AbortController()
    this.active.add(controller)
    const abort = () => controller.abort(signal?.reason)
    signal?.addEventListener('abort', abort, { once: true })
    if (signal?.aborted) {
      abort()
    }
    try {
      const audio = await collect(upload, controller.signal)
      return await this.manager.transcribeAudio(
        computer.id,
        upload.filename,
        upload.mimeType,
        audio,
        controller.signal,
      )
    } catch (error) {
      if (error instanceof TranscriptionError) {
        throw error
      }
      if (controller.signal.aborted) {
        throw new TranscriptionError('Audio transcription was cancelled', 499)
      }
      // A computer released before this route has no such endpoint, which would
      // otherwise surface as a bare "Not found" against a healthy computer.
      if (statusCodeOf(error) === 404) {
        throw new TranscriptionError(
          `${computer.name} does not transcribe audio yet. Update it to the latest release.`,
          409,
        )
      }
      throw new TranscriptionError(
        `${computer.name} could not transcribe the audio: ${
          error instanceof Error ? error.message : 'request failed'
        }`,
        statusCodeOf(error) ?? 502,
      )
    } finally {
      signal?.removeEventListener('abort', abort)
      this.active.delete(controller)
    }
  }

  async stop(): Promise<void> {
    for (const controller of this.active) controller.abort()
    await this.local.stop()
  }
}

/**
 * Reads a hub-selected recording that is bounded by the same limit the owning
 * computer enforces, so an oversized upload fails before it crosses the network.
 */
async function collect(
  upload: AudioUpload,
  signal: AbortSignal,
): Promise<Buffer> {
  const chunks: Buffer[] = []
  let total = 0
  for await (const chunk of upload.stream) {
    if (signal.aborted) {
      upload.stream.destroy()
      throw new TranscriptionError('Audio transcription was cancelled', 499)
    }
    const buffer = Buffer.from(chunk)
    total += buffer.length
    if (total > MAX_AUDIO_BYTES) {
      upload.stream.destroy()
      throw oversized()
    }
    chunks.push(buffer)
  }
  if (upload.truncated()) {
    throw oversized()
  }
  if (total === 0) {
    throw new TranscriptionError('An audio file is required', 400)
  }
  return Buffer.concat(chunks)
}

function oversized(): TranscriptionError {
  return new TranscriptionError(
    `Audio files must be no larger than ${MAX_AUDIO_BYTES / 1024 / 1024} MB`,
    413,
  )
}

function statusCodeOf(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined
  }
  const statusCode = Reflect.get(error, 'statusCode')
  return typeof statusCode === 'number' && statusCode >= 400 && statusCode < 600
    ? statusCode
    : undefined
}

export function transcriptionComputerName(): string | undefined {
  return process.env.AGENTIC_REMOTE_TRANSCRIPTION_COMPUTER?.trim() || undefined
}
