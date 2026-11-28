import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  WordAgreement,
  joinWords,
  wordsFromTokens,
  type DecodedTokens,
  type TimedWord,
} from './dictation-agreement.js'

const fixture = JSON.parse(readFileSync(
  path.resolve('fixtures/voice/parakeet-result-pt-BR-short.json'),
  'utf8',
)) as DecodedTokens & { text: string }

const word = (text: string, start: number, end: number): TimedWord => ({ text, start, end })
const texts = (words: readonly TimedWord[]) => words.map((entry) => entry.text)

describe('wordsFromTokens', () => {
  it('joins a real Parakeet result into timed words with punctuation attached', () => {
    const words = wordsFromTokens(fixture, 0)
    expect(texts(words)).toEqual([
      'Aquí', 'não', 'pareceu', 'fazer', 'sentido', 'para', 'mim.',
      'Certamente', 'não', 'foi', 'justo.',
    ])
    expect(joinWords(words)).toBe(fixture.text)
    // "Aquí" is " A" at 0.32 s through "í", a zero-length token at 0.80 s.
    expect(words[0]).toMatchObject({ text: 'Aquí', start: 0.32 })
    expect(words[0].end).toBeCloseTo(0.84, 6)
    // "mim." ends with the full stop, 0.24 s from 2.88 s.
    expect(words[6].start).toBe(2.64)
    expect(words[6].end).toBeCloseTo(3.12, 6)
    for (let index = 1; index < words.length; index += 1) {
      expect(words[index].start).toBeGreaterThanOrEqual(words[index - 1].start)
      expect(words[index].end).toBeGreaterThan(words[index].start)
    }
  })

  it('places words at the window offset and drops those starting past the limit', () => {
    const words = wordsFromTokens(fixture, 10, 13)
    expect(texts(words)).toEqual(['Aquí', 'não', 'pareceu', 'fazer', 'sentido', 'para', 'mim.'])
    expect(words[0].start).toBeCloseTo(10.32, 6)
  })

  it('starts a new word for a leading fragment and skips empty tokens', () => {
    const words = wordsFromTokens({
      tokens: ['do', ' ', ' bem', ' ,', ' \u2581sim'],
      timestamps: [0, 0.2, 0.4, 0.6, 0.8],
      durations: [0.16, 0.08, 0.16, 0.08, 0.24],
    }, 0)
    expect(texts(words)).toEqual(['do', 'bem,', 'sim'])
  })
})

describe('WordAgreement', () => {
  const first = [word('Hello', 0, 0.4), word('world', 0.5, 0.9), word('again', 1.0, 1.3)]

  it('keeps a first hypothesis tentative', () => {
    const agreement = new WordAgreement()
    expect(agreement.ingest(first)).toEqual([])
    expect(texts(agreement.tentative)).toEqual(['Hello', 'world', 'again'])
    expect(agreement.confirmed).toEqual([])
  })

  it('confirms every word of two identical hypotheses', () => {
    const agreement = new WordAgreement()
    agreement.ingest(first)
    expect(texts(agreement.ingest(first))).toEqual(['Hello', 'world', 'again'])
    expect(agreement.tentative).toEqual([])
    expect(agreement.confirmedEnd).toBe(1.3)
  })

  it('confirms only the common prefix of a divergent tail', () => {
    const agreement = new WordAgreement()
    agreement.ingest(first)
    const confirmed = agreement.ingest([word('Hello', 0, 0.4), word('world', 0.5, 0.9), word('a', 1.0, 1.1), word('gain', 1.1, 1.3)])
    expect(texts(confirmed)).toEqual(['Hello', 'world'])
    expect(texts(agreement.tentative)).toEqual(['a', 'gain'])
    expect(agreement.confirmedEnd).toBe(0.9)
  })

  it('stops agreeing at the first different word', () => {
    const agreement = new WordAgreement()
    agreement.ingest(first)
    expect(agreement.ingest([word('Yellow', 0, 0.4), word('world', 0.5, 0.9)])).toEqual([])
    expect(texts(agreement.tentative)).toEqual(['Yellow', 'world'])
  })

  it('agrees across case and punctuation and keeps the newest spelling', () => {
    const agreement = new WordAgreement()
    agreement.ingest([word('hello', 0, 0.4), word('world', 0.5, 0.9)])
    expect(texts(agreement.ingest([word('Hello,', 0, 0.4), word('world.', 0.5, 0.95)])))
      .toEqual(['Hello,', 'world.'])
    expect(agreement.confirmedEnd).toBe(0.95)
  })

  it('ignores hypothesis words that start before the confirmed text ends', () => {
    const agreement = new WordAgreement()
    agreement.ingest(first.slice(0, 2))
    agreement.ingest(first.slice(0, 2))
    // Confirmed through 0.9 s: "world" again at 0.5 s is old, "again" at 0.85 s is within 80 ms.
    agreement.ingest([word('world', 0.5, 0.9), word('again', 0.85, 1.3)])
    expect(texts(agreement.tentative)).toEqual(['again'])
    // An old "world" at 0.81 s would otherwise stand before "again" and block it.
    expect(texts(agreement.ingest([word('world', 0.81, 0.9), word('again', 0.85, 1.3)])))
      .toEqual(['again'])
    expect(texts(agreement.confirmed)).toEqual(['Hello', 'world', 'again'])
  })

  it('seeks from the first tentative word, else from the end of the confirmed text', () => {
    const agreement = new WordAgreement()
    expect(agreement.seekTime).toBe(0)
    agreement.ingest(first)
    expect(agreement.seekTime).toBe(0)
    agreement.ingest([word('Hello', 0, 0.4), word('world', 0.5, 0.9), word('there', 1.1, 1.4)])
    expect(agreement.seekTime).toBe(1.1)
    agreement.ingest([word('there', 1.1, 1.4)])
    expect(agreement.seekTime).toBe(1.4)
  })

  it('force-confirms tentative words that end by the given time', () => {
    const agreement = new WordAgreement()
    agreement.ingest([word('one', 1, 1.4), word('two', 1.5, 2), word('three', 2.1, 2.5)])
    expect(texts(agreement.forceConfirmThrough(2))).toEqual(['one', 'two'])
    expect(texts(agreement.confirmed)).toEqual(['one', 'two'])
    expect(texts(agreement.tentative)).toEqual(['three'])
    expect(agreement.confirmedEnd).toBe(2)
    expect(texts(agreement.forceConfirmThrough(9))).toEqual(['three'])
    expect(agreement.tentative).toEqual([])
    expect(agreement.forceConfirmThrough(10)).toEqual([])
  })

  it('skips silence only when nothing is tentative', () => {
    const agreement = new WordAgreement()
    agreement.ingest([word('one', 1, 1.4)])
    agreement.skipSilenceTo(3)
    expect(agreement.confirmedEnd).toBe(0)
    expect(agreement.seekTime).toBe(1)
    agreement.ingest([])
    agreement.skipSilenceTo(3)
    expect(agreement.confirmedEnd).toBe(3)
    agreement.skipSilenceTo(2)
    expect(agreement.confirmedEnd).toBe(3)
  })
})
