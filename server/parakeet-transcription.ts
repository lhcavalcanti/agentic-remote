import { readFile } from 'node:fs/promises'
import {
  ParakeetTimeoutError,
  type ParakeetWorker,
} from './parakeet-worker.js'
import { PARAKEET_SAMPLE_RATE } from './parakeet-worker-protocol.js'

/** The part of the worker an engine needs, so tests can stand in for it. */
export type ParakeetDecoder = Pick<ParakeetWorker, 'decode'>

/** A whole recording, however many windows it takes, gets this long. */
export const PARAKEET_TRANSCRIPTION_TIMEOUT_MS = 600_000

const FRAME_SECONDS = 0.1

/** Reads ffmpeg's conversion output: RIFF, PCM s16le, mono, 16 kHz. */
export function pcm16WavToFloat32(wav: Buffer): Float32Array {
  if (
    wav.length < 12
    || wav.toString('ascii', 0, 4) !== 'RIFF'
    || wav.toString('ascii', 8, 12) !== 'WAVE'
  ) {
    throw new Error('Expected a RIFF WAVE file')
  }
  let offset = 12
  let format: { code: number; channels: number; sampleRate: number; bits: number } | undefined
  let data: Buffer | undefined
  while (offset + 8 <= wav.length && !data) {
    const id = wav.toString('ascii', offset, offset + 4)
    const size = wav.readUInt32LE(offset + 4)
    const start = offset + 8
    if (id === 'fmt ') {
      if (size < 16 || start + 16 > wav.length) throw new Error('Expected a RIFF WAVE file')
      format = {
        code: wav.readUInt16LE(start),
        channels: wav.readUInt16LE(start + 2),
        sampleRate: wav.readUInt32LE(start + 4),
        bits: wav.readUInt16LE(start + 14),
      }
    } else if (id === 'data') {
      data = wav.subarray(start, Math.min(start + size, wav.length))
    }
    offset = start + size + (size % 2)
  }
  if (
    !format
    || !data
    || format.code !== 1
    || format.channels !== 1
    || format.sampleRate !== PARAKEET_SAMPLE_RATE
    || format.bits !== 16
  ) {
    throw new Error('Expected 16 kHz mono PCM16 audio')
  }
  const samples = new Float32Array(Math.floor(data.length / 2))
  const view = new DataView(data.buffer, data.byteOffset, samples.length * 2)
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = view.getInt16(index * 2, true) / 32_768
  }
  return samples
}

/**
 * Splits audio into windows the worker accepts. Each cut falls in the
 * quietest 100 ms frame of the window's last `searchSeconds`, so a word is
 * rarely split between two decodes.
 */
export function splitForDecode(
  samples: Float32Array,
  options: { maxSeconds?: number; searchSeconds?: number; sampleRate?: number } = {},
): Float32Array[] {
  const sampleRate = options.sampleRate ?? PARAKEET_SAMPLE_RATE
  const maxSamples = Math.round((options.maxSeconds ?? 28) * sampleRate)
  const searchSamples = Math.min(Math.round((options.searchSeconds ?? 4) * sampleRate), maxSamples)
  const frame = Math.max(1, Math.round(FRAME_SECONDS * sampleRate))
  const chunks: Float32Array[] = []
  let start = 0
  while (samples.length - start > maxSamples) {
    const end = start + maxSamples
    let cut = end
    let quietest = Number.POSITIVE_INFINITY
    for (let frameStart = end - searchSamples; frameStart + frame <= end; frameStart += frame) {
      const energy = meanSquare(samples, frameStart, frameStart + frame)
      // Ties go to the later frame, which keeps windows long.
      if (energy <= quietest) {
        quietest = energy
        cut = frameStart + Math.floor(frame / 2)
      }
    }
    chunks.push(samples.subarray(start, cut))
    start = cut
  }
  if (start < samples.length) chunks.push(samples.subarray(start))
  return chunks
}

export function joinChunkTexts(texts: readonly string[]): string {
  return texts.map((text) => text.trim()).filter(Boolean).join(' ')
}

export class ParakeetSpeechEngine {
  readonly #worker: ParakeetDecoder
  readonly #timeoutMs: number
  readonly #now: () => number

  constructor(
    worker: ParakeetDecoder,
    options: { timeoutMs?: number; now?: () => number } = {},
  ) {
    this.#worker = worker
    this.#timeoutMs = options.timeoutMs ?? PARAKEET_TRANSCRIPTION_TIMEOUT_MS
    this.#now = options.now ?? Date.now
  }

  /** Decodes a converted recording window by window, within one deadline. */
  async transcribe(wavPath: string, signal: AbortSignal): Promise<string> {
    const deadline = this.#now() + this.#timeoutMs
    const samples = pcm16WavToFloat32(await readFile(wavPath))
    const texts: string[] = []
    for (const chunk of splitForDecode(samples)) {
      const remaining = deadline - this.#now()
      if (remaining <= 0) {
        throw new ParakeetTimeoutError(
          `transcription took longer than ${Math.round(this.#timeoutMs / 60_000)} min`,
        )
      }
      const result = await this.#worker.decode(chunk, { timeoutMs: remaining, signal })
      texts.push(result.text)
    }
    return joinChunkTexts(texts)
  }
}

function meanSquare(samples: Float32Array, start: number, end: number): number {
  let total = 0
  for (let index = start; index < end; index += 1) total += samples[index] * samples[index]
  return total / (end - start)
}
