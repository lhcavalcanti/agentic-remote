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
 * Runs transcription on a paired computer instead of the hub, so the computer
 * that owns the microphone-facing UI does not have to own Whisper, its model,
 * or the hardware that makes it fast.
 */
export class DelegatedTranscriptionService implements TranscriptionService {
  private readonly manager: ComputerManager
  private readonly local: TranscriptionService
  private busy = false
  private activeAbortController?: AbortController

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
    if (this.busy) {
      throw new TranscriptionError(
        'Another audio recording is already being transcribed',
        429,
      )
    }
    if (!supportsAudioUpload(upload.filename, upload.mimeType)) {
      throw new TranscriptionError('Unsupported audio file type', 415)
    }

    this.busy = true
    const controller = new AbortController()
    this.activeAbortController = controller
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
      throw new TranscriptionError(
        `${computer.name} could not transcribe the audio: ${
          error instanceof Error ? error.message : 'request failed'
        }`,
        statusCodeOf(error) ?? 502,
      )
    } finally {
      signal?.removeEventListener('abort', abort)
      this.activeAbortController = undefined
      this.busy = false
    }
  }

  async stop(): Promise<void> {
    this.activeAbortController?.abort()
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
