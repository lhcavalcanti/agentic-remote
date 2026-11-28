import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createParakeetChild,
  normalizeParakeetSherpaModule,
  PARAKEET_MODEL_FILES,
  type ParakeetSherpaModule,
} from './parakeet-child.js'
import type { ParakeetChildMessage } from './parakeet-worker-protocol.js'

const directories: string[] = []

afterEach(async () => {
  vi.useRealTimers()
  await Promise.all(directories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true })))
})

async function modelDirectory(files: readonly string[] = PARAKEET_MODEL_FILES): Promise<{
  configured: string
  real: string
}> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'parakeet-child-test-'))
  directories.push(root)
  const real = path.join(root, 'model')
  await mkdir(real)
  await Promise.all(files.map((file) => writeFile(path.join(real, file), 'model')))
  // voice-install activates a profile through a symbolic link.
  const configured = path.join(root, 'active')
  await symlink(real, configured)
  return { configured, real }
}

interface FakeRecognizer {
  config: object
  decoded: Float32Array[]
}

function fakeSherpa(
  decode: (samples: Float32Array) => Promise<unknown> = async () => ({ text: '' }),
): { module: ParakeetSherpaModule; recognizers: FakeRecognizer[] } {
  const recognizers: FakeRecognizer[] = []
  return {
    recognizers,
    module: {
      OfflineRecognizer: {
        createAsync: async (config: object) => {
          const recognizer: FakeRecognizer = { config, decoded: [] }
          recognizers.push(recognizer)
          return {
            createStream: () => {
              const accepted: Float32Array[] = []
              return {
                accepted,
                acceptWaveform: ({ samples, sampleRate }) => {
                  expect(sampleRate).toBe(16_000)
                  accepted.push(samples)
                },
              }
            },
            decodeAsync: async (stream) => {
              const [samples] = (stream as unknown as { accepted: Float32Array[] }).accepted
              recognizer.decoded.push(samples)
              return decode(samples)
            },
          }
        },
      },
    },
  }
}

function childHarness(
  sherpa: ParakeetSherpaModule,
  heartbeatIntervalMs = 5_000,
) {
  const sent: ParakeetChildMessage[] = []
  const child = createParakeetChild({
    loadSherpa: async () => sherpa,
    send: async (message) => {
      sent.push(message)
    },
    heartbeatIntervalMs,
  })
  return { child, sent }
}

describe('Parakeet worker child', () => {
  it('loads the pinned recognizer configuration and warms it before reporting ready', async () => {
    const model = await modelDirectory()
    const sherpa = fakeSherpa()
    const { child, sent } = childHarness(sherpa.module)

    await expect(child.load({ modelDirectory: model.configured, threads: 3 })).resolves.toBe(true)

    expect(sherpa.recognizers).toHaveLength(1)
    expect(sherpa.recognizers[0].config).toEqual({
      featConfig: { sampleRate: 16_000, featureDim: 128 },
      modelConfig: {
        transducer: {
          encoder: path.join(model.real, 'encoder.int8.onnx'),
          decoder: path.join(model.real, 'decoder.int8.onnx'),
          joiner: path.join(model.real, 'joiner.int8.onnx'),
        },
        tokens: path.join(model.real, 'tokens.txt'),
        numThreads: 3,
        provider: 'cpu',
        modelType: 'nemo_transducer',
        debug: 0,
      },
      decodingMethod: 'greedy_search',
    })
    expect(sherpa.recognizers[0].decoded).toHaveLength(1)
    expect(sherpa.recognizers[0].decoded[0]).toEqual(new Float32Array(16_000))
    expect(sent).toEqual([{ type: 'ready' }])
    child.close()
  })

  it('reports a missing model file by name without loading the recognizer', async () => {
    const model = await modelDirectory(
      PARAKEET_MODEL_FILES.filter((file) => file !== 'decoder.int8.onnx'),
    )
    const sherpa = fakeSherpa()
    const { child, sent } = childHarness(sherpa.module)

    await expect(child.load({ modelDirectory: model.configured, threads: 1 })).resolves.toBe(false)

    expect(sent).toEqual([{ type: 'failed', message: 'model file is missing: decoder.int8.onnx' }])
    expect(sherpa.recognizers).toEqual([])
  })

  it('reports a missing model directory', async () => {
    const { child, sent } = childHarness(fakeSherpa().module)

    await child.load({ modelDirectory: path.join(os.tmpdir(), 'parakeet-missing-model'), threads: 1 })

    expect(sent).toEqual([{ type: 'failed', message: 'model directory is missing' }])
  })

  it('answers a decode with the text and per-token timing only', async () => {
    const model = await modelDirectory()
    const sherpa = fakeSherpa(async (samples) => samples.length === 16_000
      ? { text: '' }
      : {
          lang: '',
          text: 'Aquilo não',
          tokens: [' A', 'qu', 'ilo', ' não'],
          timestamps: [0.32, 0.56, 0.8, 1.04],
          durations: [0.24, 0.24, 0, 0.16],
          ys_log_probs: [-0.1, -0.2, -0.3, -0.4],
          words: [],
        })
    const { child, sent } = childHarness(sherpa.module)
    await child.load({ modelDirectory: model.configured, threads: 1 })
    const samples = Float32Array.of(0.25, -0.5, 0.125)

    await child.handle({ type: 'decode', id: 7, samples })

    expect(sherpa.recognizers[0].decoded.at(-1)).toEqual(samples)
    expect(sent.at(-1)).toEqual({
      type: 'result',
      id: 7,
      result: {
        text: 'Aquilo não',
        tokens: [' A', 'qu', 'ilo', ' não'],
        timestamps: [0.32, 0.56, 0.8, 1.04],
        durations: [0.24, 0.24, 0, 0.16],
      },
    })
    child.close()
  })

  it('reports a failed decode against its request', async () => {
    const model = await modelDirectory()
    const sherpa = fakeSherpa(async (samples) => {
      if (samples.length === 16_000) return { text: '' }
      throw new Error('Invalid input shape: {0,128}')
    })
    const { child, sent } = childHarness(sherpa.module)
    await child.load({ modelDirectory: model.configured, threads: 1 })

    await child.handle({ type: 'decode', id: 3, samples: Float32Array.of(0) })

    expect(sent.at(-1)).toEqual({
      type: 'error',
      id: 3,
      message: 'Invalid input shape: {0,128}',
    })
    child.close()
  })

  it('sends a heartbeat every interval once ready', async () => {
    vi.useFakeTimers()
    const model = await modelDirectory()
    const { child, sent } = childHarness(fakeSherpa().module, 5_000)
    await child.load({ modelDirectory: model.configured, threads: 1 })

    await vi.advanceTimersByTimeAsync(10_000)

    expect(sent).toEqual([{ type: 'ready' }, { type: 'heartbeat' }, { type: 'heartbeat' }])
    child.close()
    await vi.advanceTimersByTimeAsync(10_000)
    expect(sent).toHaveLength(3)
  })
})

describe('normalizeParakeetSherpaModule', () => {
  const OfflineRecognizer = { createAsync: async () => ({}) }

  it.each([
    ['named', { OfflineRecognizer }],
    ['default', { default: { OfflineRecognizer } }],
  ])('resolves a %s OfflineRecognizer export', (_shape, imported) => {
    expect(normalizeParakeetSherpaModule(imported).OfflineRecognizer).toBe(OfflineRecognizer)
  })

  it('fails explicitly when OfflineRecognizer is missing', () => {
    expect(() => normalizeParakeetSherpaModule({ OnlineRecognizer: class {} }))
      .toThrow('sherpa-onnx-node OfflineRecognizer export is unavailable')
  })

  it('normalizes the actual pinned sherpa-onnx-node dynamic import shape', async () => {
    const imported: unknown = await import('sherpa-onnx-node')

    expect(typeof normalizeParakeetSherpaModule(imported).OfflineRecognizer.createAsync)
      .toBe('function')
  })
})
