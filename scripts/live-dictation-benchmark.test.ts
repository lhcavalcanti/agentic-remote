import { describe, expect, it } from 'vitest'
import { median, speechOnsetSeconds, syntheticDictation, type Clip } from './live-dictation-benchmark.js'

const RATE = 16_000
const clip = (name: string, seconds: number): Clip =>
  ({ name, reference: name, samples: new Int16Array(seconds * RATE).fill(1_000) })

describe('live dictation benchmark', () => {
  it('finds speech as the first frame a tenth as loud as the loudest', () => {
    const samples = new Int16Array(RATE)
    // Room noise for half a second, well under a tenth of the speech after it.
    samples.fill(50, 0, RATE / 2)
    for (let index = RATE / 2; index < RATE; index += 1) samples[index] = index % 2 ? 3_000 : -3_000
    expect(speechOnsetSeconds(samples)).toBe(0.5)
    expect(speechOnsetSeconds(new Int16Array(RATE))).toBe(0)
  })

  it('joins clips with pauses until the dictation is long enough', () => {
    const synthetic = syntheticDictation([clip('one', 4), clip('two', 6)], 15)
    // one, pause, two, pause, one: 4 + 0.5 + 6 + 0.5 + 4 seconds.
    expect(synthetic.samples.length).toBe(15 * RATE)
    expect(synthetic.reference).toBe('one two one')
    expect(synthetic.name).toBe('synthetic-15s')
    expect(synthetic.samples[4 * RATE + 10]).toBe(0)
    expect(synthetic.samples[4.5 * RATE + 10]).toBe(1_000)
  })

  it('starts the synthetic dictation\'s speech where its first clip\'s speech starts', () => {
    const quiet = clip('quiet', 2)
    quiet.samples.fill(0, 0, 0.3 * RATE)
    quiet.samples.fill(300, 0.3 * RATE)
    const loud = clip('loud', 2)
    loud.samples.fill(20_000)
    // The quiet clip is under a tenth of the loud one, which comes later.
    expect(syntheticDictation([quiet, loud], 4).onsetSeconds).toBe(0.3)
  })

  it('takes the median of an odd or an even count', () => {
    expect(median([3, 1, 2])).toBe(2)
    expect(median([4, 1, 3, 2])).toBe(2.5)
    expect(median([])).toBeNull()
  })
})
