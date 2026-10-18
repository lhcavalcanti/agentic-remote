import { describe, expect, it } from 'vitest'
import {
  linearSlopePerMinute,
  parseSoakOptions,
} from './oracle-voice-soak.js'

describe('Oracle voice soak tooling', () => {
  it('parses the documented command line', () => {
    expect(parseSoakOptions([
      '--minutes', '30',
      '--turns-per-minute', '6',
      '--rapid-start-stop', '500',
      '--output', 'results/soak.json',
    ])).toMatchObject({
      minutes: 30,
      turnsPerMinute: 6,
      rapidStartStop: 500,
    })
  })

  it('computes a final RSS slope in MiB per minute', () => {
    expect(linearSlopePerMinute([
      { elapsedMs: 0, rssMiB: 100 },
      { elapsedMs: 60_000, rssMiB: 100.5 },
      { elapsedMs: 120_000, rssMiB: 101 },
    ])).toBeCloseTo(0.5)
    expect(linearSlopePerMinute([{ elapsedMs: 0, rssMiB: 100 }])).toBe(0)
  })
})
