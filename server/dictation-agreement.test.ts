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

  it('ends the last word where the audio ends, not in the padding after it', () => {
    // A final full stop's duration runs on into the zeros appended to the window.
    const words = wordsFromTokens({
      tokens: [' one', ' two', '.'],
      timestamps: [0.25, 0.5, 0.75],
      durations: [0.25, 0.25, 1.5],
    }, 5, 6.5)
    expect(words.map((entry) => [entry.text, entry.start, entry.end])).toEqual([
      ['one', 5.25, 5.5],
      ['two.', 5.5, 6.5],
    ])
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
    // The confirmed text ends where the earlier of the two passes ended it.
    expect(agreement.confirmedEnd).toBe(0.9)
  })

  it('finds the last confirmed word again by its text, so a late start does not repeat it', () => {
    const agreement = new WordAgreement()
    agreement.ingest([word('animais', 1.84, 2.32), word('a', 2.32, 2.4)])
    agreement.ingest([word('animais', 1.84, 2.32), word('a', 2.32, 2.4), word('irem', 2.48, 2.8)])
    expect(texts(agreement.confirmed)).toEqual(['animais', 'a'])
    // The next window hears "a" a frame later, past the confirmed end.
    expect(texts(agreement.ingest([word('animais', 1.92, 2.4), word('a', 2.4, 2.48), word('irem', 2.48, 2.8)])))
      .toEqual(['irem'])
    expect(texts(agreement.confirmed)).toEqual(['animais', 'a', 'irem'])
  })

  it('keeps a new word that starts inside the last confirmed word\'s trailing silence', () => {
    const agreement = new WordAgreement()
    // Both passes ended on "refreshing", whose duration ran on through the pause after it.
    agreement.ingest([word('and', 6.24, 6.32), word('refreshing.', 6.32, 7.6)])
    agreement.ingest([word('and', 6.24, 6.32), word('refreshing.', 6.32, 7.6)])
    expect(agreement.confirmedEnd).toBe(7.6)
    const hypothesis = [word('refreshing.', 6.32, 7.28), word('The', 7.28, 7.52), word('other', 7.52, 7.68)]
    agreement.ingest(hypothesis)
    expect(texts(agreement.tentative)).toEqual(['The', 'other'])
    expect(texts(agreement.ingest(hypothesis))).toEqual(['The', 'other'])
  })

  it('falls back to the confirmed end when the last confirmed word is heard differently', () => {
    const agreement = new WordAgreement()
    agreement.ingest(first.slice(0, 2))
    agreement.ingest(first.slice(0, 2))
    // "world" comes back as "word": what starts well before 0.9 s is old, "again" just before it is new.
    agreement.ingest([word('Hello', 0, 0.4), word('word', 0.52, 0.9), word('again', 0.82, 1.3)])
    expect(texts(agreement.tentative)).toEqual(['again'])
  })

  it('does not take a later repeat of the word for the last confirmed one', () => {
    const agreement = new WordAgreement()
    agreement.ingest([word('no', 1, 1.2)])
    agreement.ingest([word('no', 1, 1.2)])
    agreement.ingest([word('no', 1.02, 1.2), word('no', 1.6, 1.8)])
    expect(texts(agreement.tentative)).toEqual(['no'])
    expect(agreement.tentative[0].start).toBe(1.6)
  })

  it('resumes at the last confirmed word, so the next window hears it again', () => {
    const agreement = new WordAgreement()
    expect(agreement.resumeTime).toBe(0)
    agreement.ingest(first)
    expect(agreement.resumeTime).toBe(0)
    agreement.ingest([word('Hello', 0, 0.4), word('world', 0.5, 0.9), word('there', 1.1, 1.4)])
    expect(agreement.resumeTime).toBe(0.5)
    agreement.ingest([word('world', 0.5, 0.9), word('there', 1.1, 1.4)])
    expect(agreement.resumeTime).toBe(1.1)
  })

  it('force-confirms tentative words that end by the given time', () => {
    const agreement = new WordAgreement()
    agreement.ingest([word('one', 1, 1.4), word('two', 1.5, 2), word('three', 2.1, 2.5)])
    expect(texts(agreement.forceConfirmThrough(2))).toEqual(['one', 'two'])
    expect(texts(agreement.confirmed)).toEqual(['one', 'two'])
    expect(texts(agreement.tentative)).toEqual(['three'])
    expect(agreement.confirmedEnd).toBe(2)
    expect(agreement.resumeTime).toBe(1.5)
    expect(texts(agreement.forceConfirmThrough(9))).toEqual(['three'])
    expect(agreement.tentative).toEqual([])
    expect(agreement.forceConfirmThrough(10)).toEqual([])
  })

  it('skips silence only when nothing is tentative, and resumes after it', () => {
    const agreement = new WordAgreement()
    agreement.ingest([word('one', 1, 1.4)])
    agreement.skipSilenceTo(3)
    expect(agreement.confirmedEnd).toBe(0)
    expect(agreement.resumeTime).toBe(0)
    agreement.ingest([])
    agreement.skipSilenceTo(3)
    expect(agreement.confirmedEnd).toBe(3)
    expect(agreement.resumeTime).toBe(3)
    agreement.skipSilenceTo(2)
    expect(agreement.confirmedEnd).toBe(3)
    // With no confirmed word left to find, only the time decides what is new.
    agreement.ingest([word('one', 2.5, 2.8), word('two', 2.9, 3.2)])
    expect(texts(agreement.tentative)).toEqual(['two'])
  })

  it('reports the words of a pass that come after the confirmed text, without changing state', () => {
    const agreement = new WordAgreement()
    agreement.ingest(first)
    agreement.ingest(first.slice(0, 2))
    const tail = [word('world', 0.55, 0.9), word('again', 1.0, 1.3), word('later', 1.4, 1.7)]
    expect(texts(agreement.unconfirmed(tail))).toEqual(['again', 'later'])
    expect(texts(agreement.tentative)).toEqual([])
    expect(texts(agreement.confirmed)).toEqual(['Hello', 'world'])
  })
})
