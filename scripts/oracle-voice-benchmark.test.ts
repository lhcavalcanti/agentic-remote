import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  formatBenchmarkMarkdown,
  normalizeTranscript,
  parsePcm16Wave,
  wordErrorRate,
  type VoiceBenchmarkReport,
} from './oracle-voice-benchmark.js'

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

  it('labels measured, derived, and missing values in Markdown', () => {
    const report: VoiceBenchmarkReport = {
      schemaVersion: 1,
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
        firstPartialMs: { value: null, basis: 'missing' },
        finalAfterSpeechMs: { value: 12.345, basis: 'measured' },
        sttRtf: { value: 0.12, basis: 'measured' },
        ttsFirstAudioMs: { value: 610, basis: 'measured' },
        ttsRtf: { value: 0.18, basis: 'measured' },
        peakRssMiB: { value: 250, basis: 'measured' },
        sustainedCpuPercent: { value: 125.5, basis: 'derived' },
      }],
      baselines: [{
        name: 'Whisper tiny.en prior',
        note: '11 seconds measured earlier',
        sttRtf: { value: 0.72, basis: 'derived' },
        peakRssMiB: { value: 885, basis: 'derived' },
      }],
    }

    const markdown = formatBenchmarkMarkdown(report)
    expect(markdown).toContain('| fast-en | sample.wav | en | 0.000 M | — X | 12.345 M |')
    expect(markdown).toContain('| Whisper tiny.en prior | 0.720 D | 885.000 D |')
    expect(markdown).toContain('M = measured, D = derived from prior measurements, X = missing.')
  })
})
