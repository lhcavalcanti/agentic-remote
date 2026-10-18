import { describe, expect, it } from 'vitest'
import { normalizeSherpaModule } from './oracle-voice-child.js'

class NamedRecognizer {}
class DefaultRecognizer {}

const namedTts = {
  createAsync: async () => ({
    sampleRate: 22_050,
    generateAsync: async () => ({
      samples: new Float32Array(),
      sampleRate: 22_050,
    }),
  }),
}

const defaultTts = {
  createAsync: namedTts.createAsync,
}

describe('normalizeSherpaModule', () => {
  it.each([
    [
      'named/named',
      { OnlineRecognizer: NamedRecognizer, OfflineTts: namedTts },
      NamedRecognizer,
      namedTts,
    ],
    [
      'named/default',
      { OnlineRecognizer: NamedRecognizer, default: { OfflineTts: defaultTts } },
      NamedRecognizer,
      defaultTts,
    ],
    [
      'default/named',
      { OfflineTts: namedTts, default: { OnlineRecognizer: DefaultRecognizer } },
      DefaultRecognizer,
      namedTts,
    ],
    [
      'default/default',
      { default: { OnlineRecognizer: DefaultRecognizer, OfflineTts: defaultTts } },
      DefaultRecognizer,
      defaultTts,
    ],
  ])('resolves %s constructor exports independently', (
    _shape,
    imported,
    OnlineRecognizer,
    OfflineTts,
  ) => {
    expect(normalizeSherpaModule(imported)).toEqual({
      OnlineRecognizer,
      OfflineTts,
    })
  })

  it.each([
    [{ default: { OfflineTts: defaultTts } }, 'OnlineRecognizer'],
    [{ OnlineRecognizer: NamedRecognizer }, 'OfflineTts'],
  ])('fails explicitly when %s is missing', (imported, missing) => {
    expect(() => normalizeSherpaModule(imported))
      .toThrow(`sherpa-onnx-node ${missing} export is unavailable`)
  })

  it('normalizes the actual pinned sherpa-onnx-node dynamic import shape', async () => {
    const imported: unknown = await import('sherpa-onnx-node')
    const normalized = normalizeSherpaModule(imported)

    expect(typeof normalized.OnlineRecognizer).toBe('function')
    expect(typeof normalized.OfflineTts.createAsync).toBe('function')
  })
})
