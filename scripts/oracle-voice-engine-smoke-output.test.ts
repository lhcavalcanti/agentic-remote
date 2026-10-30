import { describe, expect, it } from 'vitest'
import { smokeEventLogLine } from './oracle-voice-engine-smoke-output.js'

describe('oracle voice engine smoke logging', () => {
  it('reports STT progress without exposing transcript or model text', () => {
    const partial = smokeEventLogLine({
      type: 'partial',
      streamId: 'smoke-stream',
      generation: 1,
      utteranceId: 'smoke-utterance',
      text: 'private partial transcript',
    })
    const final = smokeEventLogLine({
      type: 'final',
      streamId: 'smoke-stream',
      generation: 1,
      utteranceId: 'smoke-utterance',
      text: 'private final transcript',
    })

    expect(partial).toBe('partial observed')
    expect(final).toBe('final observed')
    expect(`${partial}\n${final}`).not.toContain('private')
  })
})
