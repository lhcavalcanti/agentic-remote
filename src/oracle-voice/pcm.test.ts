import { describe, expect, it } from 'vitest'
import { Pcm16Resampler, floatToPcm16 } from './pcm'

describe('floatToPcm16', () => {
  it('clips floats and maps endpoints to signed PCM16', () => {
    expect([...floatToPcm16(new Float32Array([-2, -1, 0, 0.5, 1, 2]))])
      .toEqual([-32768, -32768, 0, 16384, 32767, 32767])
  })

  it('rejects non-finite samples', () => {
    expect(() => floatToPcm16(new Float32Array([Number.NaN]))).toThrow(TypeError)
    expect(() => floatToPcm16(new Float32Array([Number.POSITIVE_INFINITY]))).toThrow(TypeError)
  })
})

describe('Pcm16Resampler', () => {
  it('resamples split 48 kHz input without a boundary discontinuity', () => {
    const input = sineWave(48_000, 440, 0.2)
    const whole = new Pcm16Resampler(48_000, 16_000).push(input)
    const split = new Pcm16Resampler(48_000, 16_000)
    const pieces = concatInt16([
      split.push(input.subarray(0, 3_111)),
      split.push(input.subarray(3_111)),
    ])

    expect([...pieces]).toEqual([...whole])
  })

  it('preserves interpolation phase for a non-integral rate ratio', () => {
    const input = sineWave(44_100, 997, 0.1)
    const whole = new Pcm16Resampler(44_100, 16_000).push(input)
    const split = new Pcm16Resampler(44_100, 16_000)
    const pieces = concatInt16([
      split.push(input.subarray(0, 777)),
      split.push(input.subarray(777, 2_345)),
      split.push(input.subarray(2_345)),
    ])

    expect([...pieces]).toEqual([...whole])
  })

  it('reset discards the retained sample and phase', () => {
    const input = sineWave(48_000, 440, 0.05)
    const resampler = new Pcm16Resampler(48_000, 16_000)
    resampler.push(input.subarray(0, 101))
    resampler.reset()

    expect([...resampler.push(input)]).toEqual([
      ...new Pcm16Resampler(48_000, 16_000).push(input),
    ])
  })

  it('rejects invalid rates and non-finite input', () => {
    expect(() => new Pcm16Resampler(7_999, 16_000)).toThrow(RangeError)
    expect(() => new Pcm16Resampler(48_000, 192_001)).toThrow(RangeError)
    expect(() => new Pcm16Resampler(48_000, 16_000)
      .push(new Float32Array([Number.NaN]))).toThrow(TypeError)
  })
})

function sineWave(sampleRate: number, frequency: number, seconds: number): Float32Array {
  return Float32Array.from(
    { length: Math.floor(sampleRate * seconds) },
    (_, index) => Math.sin(2 * Math.PI * frequency * index / sampleRate),
  )
}

function concatInt16(chunks: Int16Array[]): Int16Array {
  const result = new Int16Array(chunks.reduce((length, chunk) => length + chunk.length, 0))
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  return result
}
