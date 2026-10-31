const MIN_SAMPLE_RATE = 8_000
const MAX_SAMPLE_RATE = 192_000

export function floatToPcm16(samples: Float32Array): Int16Array {
  const result = new Int16Array(samples.length)
  for (let index = 0; index < samples.length; index += 1) {
    result[index] = floatSampleToPcm16(samples[index])
  }
  return result
}

export class Pcm16Resampler {
  readonly inputRate: number
  readonly outputRate: number

  private totalInputSamples = 0
  private nextOutputIndex = 0
  private lastInputSample: number | undefined

  constructor(inputRate: number, outputRate = 16_000) {
    validateSampleRate(inputRate, 'inputRate')
    validateSampleRate(outputRate, 'outputRate')
    this.inputRate = inputRate
    this.outputRate = outputRate
  }

  push(samples: Float32Array): Int16Array {
    validateSamples(samples)
    if (samples.length === 0) return new Int16Array()
    if (this.inputRate === this.outputRate) {
      this.totalInputSamples += samples.length
      this.nextOutputIndex += samples.length
      this.lastInputSample = samples[samples.length - 1]
      return floatToPcm16(samples)
    }

    const chunkStart = this.totalInputSamples
    const chunkEnd = chunkStart + samples.length
    const output: number[] = []
    while (true) {
      const position = this.nextOutputIndex * this.inputRate / this.outputRate
      const leftIndex = Math.floor(position)
      if (leftIndex + 1 >= chunkEnd) break

      const fraction = position - leftIndex
      const left = this.sampleAt(leftIndex, chunkStart, samples)
      const right = this.sampleAt(leftIndex + 1, chunkStart, samples)
      output.push(floatSampleToPcm16(left + (right - left) * fraction))
      this.nextOutputIndex += 1
    }

    this.totalInputSamples = chunkEnd
    this.lastInputSample = samples[samples.length - 1]
    return Int16Array.from(output)
  }

  reset(): void {
    this.totalInputSamples = 0
    this.nextOutputIndex = 0
    this.lastInputSample = undefined
  }

  private sampleAt(index: number, chunkStart: number, samples: Float32Array): number {
    if (index === chunkStart - 1 && this.lastInputSample !== undefined) {
      return this.lastInputSample
    }
    const localIndex = index - chunkStart
    if (localIndex < 0 || localIndex >= samples.length) {
      throw new RangeError('resampler interpolation escaped the retained input boundary')
    }
    return samples[localIndex]
  }
}

function floatSampleToPcm16(sample: number): number {
  if (!Number.isFinite(sample)) {
    throw new TypeError('PCM input samples must be finite')
  }
  const clipped = Math.max(-1, Math.min(1, sample))
  return Math.round(clipped < 0 ? clipped * 32768 : clipped * 32767)
}

function validateSamples(samples: Float32Array): void {
  if (!(samples instanceof Float32Array)) {
    throw new TypeError('PCM input must be a Float32Array')
  }
  for (const sample of samples) {
    if (!Number.isFinite(sample)) {
      throw new TypeError('PCM input samples must be finite')
    }
  }
}

function validateSampleRate(rate: number, name: string): void {
  if (!Number.isInteger(rate) || rate < MIN_SAMPLE_RATE || rate > MAX_SAMPLE_RATE) {
    throw new RangeError(`${name} must be an integer from 8000 to 192000 Hz`)
  }
}
