import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  joinChunkTexts,
  ParakeetSpeechEngine,
  pcm16WavToFloat32,
  splitForDecode,
} from './parakeet-transcription.js'
import { ParakeetTimeoutError } from './parakeet-worker.js'

const SAMPLE_RATE = 16_000
const directories: string[] = []

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true })))
})

function wave(
  samples: ArrayLike<number>,
  { sampleRate = SAMPLE_RATE, channels = 1 } = {},
): Buffer {
  const pcm = Int16Array.from(samples)
  const data = Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength)
  const format = Buffer.alloc(16)
  format.writeUInt16LE(1, 0)
  format.writeUInt16LE(channels, 2)
  format.writeUInt32LE(sampleRate, 4)
  format.writeUInt32LE(sampleRate * channels * 2, 8)
  format.writeUInt16LE(channels * 2, 12)
  format.writeUInt16LE(16, 14)
  // ffmpeg writes a LIST chunk between the format and the samples.
  const list = Buffer.from('INFOISFT\x0e\x00\x00\x00Lavf61.7.100\x00\x00', 'latin1')
  const chunk = (id: string, body: Buffer) => {
    const header = Buffer.alloc(8)
    header.write(id, 0, 'ascii')
    header.writeUInt32LE(body.length, 4)
    return Buffer.concat([header, body, body.length % 2 ? Buffer.alloc(1) : Buffer.alloc(0)])
  }
  const body = Buffer.concat([
    Buffer.from('WAVE', 'ascii'),
    chunk('fmt ', format),
    chunk('LIST', list),
    chunk('data', data),
  ])
  const header = Buffer.alloc(8)
  header.write('RIFF', 0, 'ascii')
  header.writeUInt32LE(body.length, 4)
  return Buffer.concat([header, body])
}

/** Deterministic speech-like noise with silent stretches, in seconds. */
function speech(seconds: number, silences: Array<[number, number]> = []): Float32Array {
  const samples = new Float32Array(seconds * SAMPLE_RATE)
  let state = 12_345
  for (let index = 0; index < samples.length; index += 1) {
    state = (state * 1_103_515_245 + 12_345) >>> 0
    samples[index] = (state / 0xffff_ffff - 0.5) * 0.8
  }
  for (const [start, end] of silences) {
    samples.fill(0, start * SAMPLE_RATE, end * SAMPLE_RATE)
  }
  return samples
}

/** Whether the chunks, laid end to end, are exactly the input. */
function reassembles(chunks: Float32Array[], samples: Float32Array): boolean {
  const output = new Float32Array(chunks.reduce((total, chunk) => total + chunk.length, 0))
  let offset = 0
  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.length
  }
  return Buffer.from(output.buffer).equals(Buffer.from(samples.buffer))
}

describe('pcm16WavToFloat32', () => {
  it('reads the 16 kHz mono PCM16 WAV that ffmpeg writes', () => {
    expect(pcm16WavToFloat32(wave([0, 16_384, -32_768, 32_767])))
      .toEqual(Float32Array.of(0, 0.5, -1, 32_767 / 32_768))
  })

  it('rejects another sample rate', () => {
    expect(() => pcm16WavToFloat32(wave([0, 1], { sampleRate: 48_000 })))
      .toThrow('Expected 16 kHz mono PCM16 audio')
  })

  it('rejects stereo audio', () => {
    expect(() => pcm16WavToFloat32(wave([0, 1], { channels: 2 })))
      .toThrow('Expected 16 kHz mono PCM16 audio')
  })

  it('rejects anything that is not a RIFF WAVE file', () => {
    expect(() => pcm16WavToFloat32(Buffer.from('not a wave file at all, not even close')))
      .toThrow('Expected a RIFF WAVE file')
  })
})

describe('splitForDecode', () => {
  it('keeps a recording within the window whole', () => {
    const samples = speech(28)

    const chunks = splitForDecode(samples)

    expect(chunks).toHaveLength(1)
    expect(reassembles(chunks, samples)).toBe(true)
  })

  it('returns no chunk for empty audio', () => {
    expect(splitForDecode(new Float32Array(0))).toEqual([])
  })

  it('cuts a long recording inside its quiet stretches', () => {
    const samples = speech(70, [[25, 25.6], [51, 51.6]])

    const chunks = splitForDecode(samples)

    expect(chunks).toHaveLength(3)
    const firstCut = chunks[0].length / SAMPLE_RATE
    const secondCut = (chunks[0].length + chunks[1].length) / SAMPLE_RATE
    expect(firstCut).toBeGreaterThan(25)
    expect(firstCut).toBeLessThan(25.6)
    expect(secondCut).toBeGreaterThan(51)
    expect(secondCut).toBeLessThan(51.6)
    expect(reassembles(chunks, samples)).toBe(true)
  })

  it('bounds every chunk even without a quiet stretch', () => {
    const samples = speech(90)

    const chunks = splitForDecode(samples)

    expect(chunks.length).toBeGreaterThan(3)
    for (const chunk of chunks) {
      expect(chunk.length).toBeGreaterThan(0)
      expect(chunk.length).toBeLessThanOrEqual(28 * SAMPLE_RATE)
    }
    expect(reassembles(chunks, samples)).toBe(true)
  })
})

describe('joinChunkTexts', () => {
  it('trims each text, drops empty ones, and joins with one space', () => {
    expect(joinChunkTexts([' Hello there. ', '', '   ', 'General Kenobi.']))
      .toBe('Hello there. General Kenobi.')
  })
})

describe('ParakeetSpeechEngine', () => {
  async function wavFile(samples: Float32Array): Promise<string> {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'parakeet-engine-test-'))
    directories.push(directory)
    const file = path.join(directory, 'audio.wav')
    const pcm = new Int16Array(samples.length)
    for (let index = 0; index < samples.length; index += 1) {
      pcm[index] = Math.round(samples[index] * 32_767)
    }
    await writeFile(file, wave(pcm))
    return file
  }

  it('decodes each chunk in order, one at a time, and joins the texts', async () => {
    const file = await wavFile(speech(70, [[25, 25.6], [51, 51.6]]))
    const lengths: number[] = []
    let active = 0
    const engine = new ParakeetSpeechEngine({
      decode: async (samples) => {
        active += 1
        expect(active).toBe(1)
        lengths.push(samples.length)
        await new Promise((resolve) => setImmediate(resolve))
        active -= 1
        return { text: ` part ${lengths.length} `, tokens: [], timestamps: [], durations: [] }
      },
    })

    await expect(engine.transcribe(file, new AbortController().signal))
      .resolves.toBe('part 1 part 2 part 3')
    expect(lengths.reduce((total, length) => total + length, 0)).toBe(70 * SAMPLE_RATE)
  })

  it('shares one ten-minute deadline across the chunks and passes the signal on', async () => {
    const file = await wavFile(speech(70, [[25, 25.6], [51, 51.6]]))
    let clock = 0
    const calls: Array<{ timeoutMs: number; signal?: AbortSignal }> = []
    const engine = new ParakeetSpeechEngine({
      decode: async (_samples, options) => {
        calls.push(options)
        clock += 400_000
        return { text: 'part', tokens: [], timestamps: [], durations: [] }
      },
    }, { now: () => clock })
    const controller = new AbortController()

    await expect(engine.transcribe(file, controller.signal))
      .rejects.toBeInstanceOf(ParakeetTimeoutError)

    expect(calls.map(({ timeoutMs }) => timeoutMs)).toEqual([600_000, 200_000])
    expect(calls.every(({ signal }) => signal === controller.signal)).toBe(true)
  })
})
