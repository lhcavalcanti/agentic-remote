import { describe, expect, it } from 'vitest'
import { parseProcessParameters, parseProcessStat } from './process-proc.js'
import { processStatFixture } from './process-test-fixtures.js'

describe('process proc parsers', () => {
  it('extracts stat counters around spaces and closing parentheses in comm', () => {
    expect(parseProcessStat(processStatFixture({
      pid: 42, ppid: 12, comm: 'awk (worker))', startTime: 5678, utime: 100, stime: 25, rssPages: 8,
    }))).toEqual({ pid: 42, ppid: 12, startTime: 5678, cpuTicks: 125, rssPages: 8 })
    for (const text of ['', '42 no-comm', '42 (name) S 1', processStatFixture({ pid: 42, startTime: -1 })]) {
      expect(parseProcessStat(text)).toBeUndefined()
    }
  })

  it.each([4, 8] as const)('reads native %i-byte auxv page size and clock ticks without retaining pointers', (wordBytes) => {
    for (const littleEndian of [true, false]) {
      const values = [6, 65536, 17, 100, 25, 123456, 0, 0]
      const buffer = Buffer.alloc(values.length * wordBytes)
      values.forEach((value, index) => {
        const offset = index * wordBytes
        if (wordBytes === 8) {
          if (littleEndian) buffer.writeBigUInt64LE(BigInt(value), offset)
          else buffer.writeBigUInt64BE(BigInt(value), offset)
        } else if (littleEndian) buffer.writeUInt32LE(value, offset)
        else buffer.writeUInt32BE(value, offset)
      })
      expect(parseProcessParameters(buffer, wordBytes, littleEndian)).toEqual({
        clockTicksPerSecond: 100, pageSizeBytes: 65536,
      })
    }
    expect(() => parseProcessParameters(Buffer.alloc(2), wordBytes, true)).toThrow('unavailable')
  })
})
