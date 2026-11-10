import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  formatBenchmarkMarkdown,
  measureSttPass,
  measureTts,
  normalizeTranscript,
  parsePcm16Wave,
  wordErrorRate,
  type VoiceBenchmarkReport,
} from './oracle-voice-benchmark.js'
import type {
  VoiceEngineEvent,
  VoiceEngineSession,
} from '../server/oracle-voice-engine.js'

describe('Oracle voice benchmark', () => {
  it('normalizes Unicode transcripts and computes word error rate', () => {
    expect(normalizeTranscript('  Olá, MUNDO! Não.  ')).toBe('olá mundo não')
    expect(wordErrorRate('one two three', 'one too three four')).toBeCloseTo(2 / 3)
    expect(wordErrorRate('', '')).toBe(0)
    expect(wordErrorRate('', 'unexpected')).toBe(1)
  })

  it('parses the committed mono PCM16 corpus', async () => {
    const bytes = await readFile(path.resolve('fixtures/voice/en-short-female-clean.wav'))
    const wave = parsePcm16Wave(bytes)
    expect(wave.sampleRate).toBe(16_000)
    expect(wave.channels).toBe(1)
    expect(wave.durationMs).toBeCloseTo(4_140, -1)
    expect(wave.samples.length).toBeGreaterThan(60_000)
  })

  it('aggregates endpoint finals while consuming the complete fixture', async () => {
    const listeners = new Set<(event: VoiceEngineEvent) => void>()
    let activeUtteranceId = ''
    let acceptedSamples = 0
    let acceptCalls = 0
    const acceptedSequences: number[] = []
    const emitFinal = (text: string) => {
      for (const listener of listeners) {
        listener({
          type: 'final',
          streamId: 'stream',
          generation: 1,
          utteranceId: activeUtteranceId,
          text,
        })
      }
    }
    const session = {
      stt: {
        start: async (input: { utteranceId: string }) => {
          activeUtteranceId = input.utteranceId
        },
        accept: async (frame: { samples: Int16Array; sequence: number }) => {
          acceptedSamples += frame.samples.length
          acceptedSequences.push(frame.sequence)
          acceptCalls += 1
          if (acceptCalls === 1) emitFinal('first endpoint')
        },
        end: async () => emitFinal('second endpoint'),
      },
      onEvent(listener: (event: VoiceEngineEvent) => void) {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
    } as unknown as VoiceEngineSession
    const samples = new Int16Array(3_000).fill(2_000)

    const result = await measureSttPass(
      session,
      'stream',
      1,
      'utterance',
      'en',
      {
        channels: 1,
        sampleRate: 16_000,
        samples,
        durationMs: samples.length / 16,
      },
      { paced: false },
    )

    expect(acceptedSamples).toBe(samples.length)
    expect(acceptedSequences).toEqual([0, 0, 1])
    expect(result.transcript).toBe('first endpoint second endpoint')
    expect(result.endpointCount).toBe(2)
    expect(result.consumedAudioMs).toBeCloseTo(samples.length / 16)
  })

  it('measures an early endpoint from its triggering audio instead of clamping it to zero', async () => {
    const listeners = new Set<(event: VoiceEngineEvent) => void>()
    let activeUtteranceId = ''
    let now = 100
    const emitFinal = (text: string) => {
      for (const listener of listeners) {
        listener({
          type: 'final',
          streamId: 'stream',
          generation: 1,
          utteranceId: activeUtteranceId,
          text,
        })
      }
    }
    const session = {
      stt: {
        start: async (input: { utteranceId: string }) => {
          activeUtteranceId = input.utteranceId
        },
        accept: async () => {
          now += 15
          emitFinal('early')
        },
        end: async () => {
          throw new Error('Endpoint final should avoid explicit end')
        },
      },
      onEvent(listener: (event: VoiceEngineEvent) => void) {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
    } as unknown as VoiceEngineSession

    const result = await measureSttPass(
      session,
      'stream',
      1,
      'utterance',
      'en',
      {
        channels: 1,
        sampleRate: 16_000,
        samples: new Int16Array(1_280).fill(2_000),
        durationMs: 80,
      },
      { paced: false, now: () => now },
    )

    expect(result.endpointLatenciesMs).toEqual([15])
    expect(result.finalAfterSpeechMs).toBe(15)
  })

  it('paces latency audio in real time and measures first partial from speech onset', async () => {
    const listeners = new Set<(event: VoiceEngineEvent) => void>()
    let activeUtteranceId = ''
    let now = 0
    let accepts = 0
    const waits: number[] = []
    const session = {
      stt: {
        start: async (input: { utteranceId: string }) => {
          activeUtteranceId = input.utteranceId
        },
        accept: async () => {
          accepts += 1
          if (accepts === 1) {
            now += 5
            return
          }
          now += 25
          for (const listener of listeners) {
            listener({
              type: 'partial',
              streamId: 'stream',
              generation: 1,
              utteranceId: activeUtteranceId,
              text: 'hello',
            })
            listener({
              type: 'final',
              streamId: 'stream',
              generation: 1,
              utteranceId: activeUtteranceId,
              text: 'hello',
            })
          }
        },
        end: async () => {
          throw new Error('Final should arrive at the endpoint')
        },
      },
      onEvent(listener: (event: VoiceEngineEvent) => void) {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
    } as unknown as VoiceEngineSession
    const samples = new Int16Array(2_560)
    samples.fill(100, 1_280)

    const result = await measureSttPass(
      session,
      'stream',
      1,
      'utterance',
      'en',
      {
        channels: 1,
        sampleRate: 16_000,
        samples,
        durationMs: 160,
      },
      {
        paced: true,
        now: () => now,
        sleep: async (milliseconds) => {
          waits.push(milliseconds)
          now += milliseconds
        },
      },
    )

    expect(waits).toEqual([80, 75])
    expect(result.firstPartialMs).toBe(105)
    expect(result.latencyMode).toBe('real-time-paced')
  })

  it.each(['accept', 'end'] as const)(
    'fails the STT pass when the engine reports a fatal error during %s',
    async (stage) => {
      const listeners = new Set<(event: VoiceEngineEvent) => void>()
      let accepts = 0
      const crash = () => {
        for (const listener of listeners) {
          listener({ type: 'fatal_error', message: 'Voice worker exited' })
        }
      }
      const session = {
        stt: {
          start: async () => undefined,
          accept: async () => {
            accepts += 1
            if (stage === 'accept') crash()
          },
          end: async () => {
            if (stage === 'end') crash()
          },
        },
        onEvent(listener: (event: VoiceEngineEvent) => void) {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
      } as unknown as VoiceEngineSession
      const samples = new Int16Array(3_000)

      await expect(measureSttPass(
        session,
        'stream',
        1,
        'utterance',
        'en',
        {
          channels: 1,
          sampleRate: 16_000,
          samples,
          durationMs: samples.length / 16,
        },
        { paced: false },
      )).rejects.toThrow('Voice worker exited')
      expect(accepts).toBe(stage === 'accept' ? 1 : 3)
    },
    5_000,
  )

  it('fails the TTS measurement when the engine reports a fatal error', async () => {
    const listeners = new Set<(event: VoiceEngineEvent) => void>()
    const session = {
      tts: {
        synthesize: async () => {
          for (const listener of listeners) {
            listener({ type: 'fatal_error', message: 'Voice worker exited' })
          }
        },
      },
      onEvent(listener: (event: VoiceEngineEvent) => void) {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
    } as unknown as VoiceEngineSession

    await expect(measureTts(session, 'stream', 1, 'segment', 'Hello.', 22_050))
      .rejects.toThrow('Voice worker exited')
  }, 5_000)

  it('labels measured, derived, and missing values in Markdown', () => {
    const report: VoiceBenchmarkReport = {
      schemaVersion: 2,
      generatedAt: '2026-10-16T00:00:00.000Z',
      host: { platform: 'linux', arch: 'x64', cpuCount: 4 },
      profiles: [{
        name: 'fast-en',
        sttProfile: 'zipformer',
        languages: ['en'],
      }],
      rows: [{
        profile: 'fast-en',
        fixture: 'sample.wav',
        language: 'en',
        transcript: 'hello',
        expectedTranscript: 'hello',
        wer: { value: 0, basis: 'measured' },
        realtimeFirstPartialMs: { value: null, basis: 'missing' },
        realtimeEndpointFinalMs: { value: 12.345, basis: 'measured' },
        sttComputeRtf: { value: 0.12, basis: 'measured' },
        sttConsumedAudioMs: { value: 4_140, basis: 'measured' },
        sttEndpointCount: 2,
        sttLatencyMode: 'real-time-paced',
        sttComputeMode: 'unpaced-full-fixture',
        ttsFirstAudioMs: { value: 610, basis: 'measured' },
        ttsRtf: { value: 0.18, basis: 'measured' },
        peakRssMiB: { value: 250, basis: 'measured' },
        sustainedCpuPercent: { value: 125.5, basis: 'derived' },
      }],
      baselines: [{
        name: 'Whisper small prior',
        note: '11 seconds measured earlier',
        sttRtf: { value: 0.72, basis: 'derived' },
        peakRssMiB: { value: 885, basis: 'derived' },
      }],
    }

    const markdown = formatBenchmarkMarkdown(report)
    expect(markdown).toContain('Real-time first partial ms')
    expect(markdown).toContain('STT compute RTF')
    expect(markdown).toContain(
      '| fast-en | sample.wav | en | 0.000 M | — X | 12.345 M | 0.120 M | 4140.000 M | 2 |',
    )
    expect(markdown).toContain('| Whisper small prior | 0.720 D | 885.000 D |')
    expect(markdown).toContain('M = measured, D = derived from prior measurements, X = missing.')
  })

  it('names the established Whisper small baseline everywhere Task 11 reports it', async () => {
    const files = [
      'scripts/oracle-voice-benchmark.ts',
      'docs/design/oracle-conversation-mode.md',
      'docs/oracle-conversation.md',
      '.superpowers/sdd/2026-10-16-oracle-conversation-mode/task-11-report.md',
    ]
    for (const file of files) {
      const contents = await readFile(path.resolve(file), 'utf8')
      expect(contents, file).not.toMatch(/Whisper tiny(?:\.en)?/i)
      expect(contents, file).toMatch(/Whisper small/i)
    }
  })
})
