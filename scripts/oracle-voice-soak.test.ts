import { describe, expect, it } from 'vitest'
import {
  childCleanupPassed,
  linearSlopePerMinute,
  parseSoakOptions,
  runLifecycleCycles,
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

  it('derives gated startup race counters from observed lifecycle evidence', async () => {
    let race = 0
    const result = await runLifecycleCycles(5, {
      startupStopEvery: 2,
      runGatedStartupRace: async () => {
        race += 1
        return {
          socketConnections: 2,
          closedSockets: 2,
          oldAcquisitionUnresolvedAtClose: true,
          replacementAttemptStartedBeforeOldRelease: true,
          oldHelloCount: 0,
          oldStreamMessageCount: 0,
          oldAcquisitionCancelled: true,
          replacementHelloCount: 1,
          replacementSessionCount: 1,
          backendCleaned: true,
          workerStarted: true,
          workerCleaned: true,
        }
      },
      startAndStop: async () => {
        return {
          socketConnections: 1,
          closedSockets: 1,
          backendCleaned: true,
        }
      },
    })

    expect(result).toMatchObject({
      requested: 5,
      completed: 5,
      socketConnections: 8,
      startupStops: 3,
      immediateRestarts: 3,
      cleanupChecks: 8,
      oldAcquisitionCancellations: 3,
      oldHelloLeakages: 0,
      oldStreamLeakages: 0,
      replacementHellos: 3,
      replacementSessions: 3,
      workerCleanupChecks: 3,
    })
    expect(result.gatedStartupRaces).toHaveLength(3)
    expect(result.gatedStartupRaces.map((observation) => observation.cycle))
      .toEqual([1, 3, 5])
  })

  it('fails child cleanup evidence while the fixture-owned process remains', () => {
    expect(childCleanupPassed(123, [123], [])).toBe(true)
    expect(childCleanupPassed(123, [123], [123])).toBe(false)
    expect(childCleanupPassed(123, [], [])).toBe(false)
  })
})
