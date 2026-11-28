import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { readTranscriptionEngineConfig } from './transcription-engine-config.js'

const dataDirectory = '/srv/agentic-remote'
const installedModelDirectory = path.join(
  dataDirectory,
  'models/oracle-voice/active/parakeet-ultra',
  'sherpa-onnx-nemo-parakeet-tdt-0.6b-ultra-int8',
)

describe('transcription engine configuration', () => {
  it.each([undefined, '', '   '])('selects Whisper when the engine is %j', (engine) => {
    expect(readTranscriptionEngineConfig(
      { AGENTIC_REMOTE_TRANSCRIPTION_ENGINE: engine },
      dataDirectory,
      8,
    )).toEqual({ engine: 'whisper' })
  })

  it('accepts either engine name in any case', () => {
    expect(readTranscriptionEngineConfig(
      { AGENTIC_REMOTE_TRANSCRIPTION_ENGINE: 'WHISPER' },
      dataDirectory,
      8,
    )).toEqual({ engine: 'whisper' })
    expect(readTranscriptionEngineConfig(
      { AGENTIC_REMOTE_TRANSCRIPTION_ENGINE: ' Parakeet ' },
      dataDirectory,
      8,
    )).toEqual({
      engine: 'parakeet',
      parakeet: { modelDirectory: installedModelDirectory, threads: 4 },
    })
  })

  it('defaults Parakeet to at most four threads', () => {
    expect(readTranscriptionEngineConfig(
      { AGENTIC_REMOTE_TRANSCRIPTION_ENGINE: 'parakeet' },
      dataDirectory,
      2,
    )).toMatchObject({ parakeet: { threads: 2 } })
  })

  it('rejects any other engine at startup', () => {
    expect(() => readTranscriptionEngineConfig(
      { AGENTIC_REMOTE_TRANSCRIPTION_ENGINE: 'gpu' },
      dataDirectory,
      8,
    )).toThrow('AGENTIC_REMOTE_TRANSCRIPTION_ENGINE must be whisper or parakeet')
  })

  it.each(['0', '17', 'x', '2.5'])('rejects %j Parakeet threads', (threads) => {
    expect(() => readTranscriptionEngineConfig(
      {
        AGENTIC_REMOTE_TRANSCRIPTION_ENGINE: 'parakeet',
        AGENTIC_REMOTE_PARAKEET_THREADS: threads,
      },
      dataDirectory,
      8,
    )).toThrow('AGENTIC_REMOTE_PARAKEET_THREADS must be an integer from 1 to 16')
  })

  it('uses configured threads and an absolute model directory as given', () => {
    expect(readTranscriptionEngineConfig(
      {
        AGENTIC_REMOTE_TRANSCRIPTION_ENGINE: 'parakeet',
        AGENTIC_REMOTE_PARAKEET_THREADS: ' 16 ',
        AGENTIC_REMOTE_PARAKEET_MODEL_DIR: '  /opt/models/parakeet  ',
      },
      dataDirectory,
      2,
    )).toEqual({
      engine: 'parakeet',
      parakeet: { modelDirectory: '/opt/models/parakeet', threads: 16 },
    })
  })

  it('resolves a relative model directory against the data directory', () => {
    expect(readTranscriptionEngineConfig(
      {
        AGENTIC_REMOTE_TRANSCRIPTION_ENGINE: 'parakeet',
        AGENTIC_REMOTE_PARAKEET_MODEL_DIR: 'models/parakeet',
      },
      dataDirectory,
      8,
    )).toMatchObject({
      parakeet: { modelDirectory: path.join(dataDirectory, 'models/parakeet') },
    })
  })

  it('ignores Parakeet settings while Whisper is selected', () => {
    expect(readTranscriptionEngineConfig(
      { AGENTIC_REMOTE_PARAKEET_THREADS: 'x' },
      dataDirectory,
      8,
    )).toEqual({ engine: 'whisper' })
  })
})
