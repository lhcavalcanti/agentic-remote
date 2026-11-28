/**
 * Word agreement for live dictation (LocalAgreement-2). An offline model is
 * decoded again over the unconfirmed audio every pass; the words two
 * consecutive passes agree on become confirmed text, and the rest of the
 * latest pass is shown as tentative. VoiceInk's local Parakeet live text uses
 * the same method; this is an independent implementation.
 */

/** A word with its absolute start and end in seconds from the start of the stream. */
export interface TimedWord {
  text: string
  start: number
  end: number
}

/** The per-token output of an offline decode, in seconds from the window start. */
export interface DecodedTokens {
  tokens: readonly string[]
  timestamps: readonly number[]
  durations?: readonly number[]
}

const WORD_START = /^[ \u2581]/
const PUNCTUATION_ONLY = /^[\p{P}\p{S}]+$/u
/** Parakeet frames are 80 ms; a zero-length token still occupies a sliver of one. */
const MIN_TOKEN_SECONDS = 0.04
/** How far before the confirmed end a new word may start and still be new. */
const CONFIRMED_OVERLAP_SECONDS = 0.08

/** Joins sentencepiece tokens into words; punctuation attaches to the word before it. */
export function wordsFromTokens(
  result: DecodedTokens,
  offsetSeconds: number,
  limitSeconds = Number.POSITIVE_INFINITY,
): TimedWord[] {
  const words: TimedWord[] = []
  result.tokens.forEach((token, index) => {
    const text = token.replace(/^[ \u2581]+/, '')
    if (!text) return
    const start = offsetSeconds + (result.timestamps[index] ?? 0)
    const end = start + Math.max(result.durations?.[index] ?? 0, MIN_TOKEN_SECONDS)
    const last = words.at(-1)
    if (last && (!WORD_START.test(token) || PUNCTUATION_ONLY.test(text))) {
      last.text += text
      last.end = Math.max(last.end, end)
    } else {
      words.push({ text, start, end })
    }
  })
  return words.filter((word) => word.start < limitSeconds)
}

export const normalizeWord = (text: string): string =>
  text.toLocaleLowerCase().replace(/[^\p{L}\p{N}']+/gu, '')

export const joinWords = (words: readonly TimedWord[]): string =>
  words.map((word) => word.text).join(' ')

/** LocalAgreement-2: confirm the longest common prefix of the two latest hypotheses. */
export class WordAgreement {
  #confirmed: TimedWord[] = []
  #tentative: TimedWord[] = []
  #confirmedEnd = 0

  get confirmed(): readonly TimedWord[] {
    return this.#confirmed
  }

  get tentative(): readonly TimedWord[] {
    return this.#tentative
  }

  get confirmedEnd(): number {
    return this.#confirmedEnd
  }

  /** Where the next pass's window starts: the first tentative word, else the end of the confirmed text. */
  get seekTime(): number {
    return this.#tentative[0]?.start ?? this.#confirmedEnd
  }

  /** Takes the latest pass's words and returns the ones it newly confirmed. */
  ingest(hypothesis: readonly TimedWord[]): TimedWord[] {
    const fresh = hypothesis.filter(
      (word) => word.start >= this.#confirmedEnd - CONFIRMED_OVERLAP_SECONDS,
    )
    let agreed = 0
    while (
      agreed < fresh.length
      && agreed < this.#tentative.length
      && normalizeWord(fresh[agreed].text) === normalizeWord(this.#tentative[agreed].text)
    ) agreed += 1
    const confirmed = fresh.slice(0, agreed)
    this.#confirm(confirmed)
    this.#tentative = fresh.slice(agreed)
    return confirmed
  }

  /** Bounds the window: confirms tentative words that end at or before `time`. */
  forceConfirmThrough(time: number): TimedWord[] {
    const index = this.#tentative.findIndex((word) => word.end > time)
    const forced = this.#tentative.splice(0, index === -1 ? this.#tentative.length : index)
    this.#confirm(forced)
    return forced
  }

  /** Drops leading silence when a pass found no words. */
  skipSilenceTo(time: number): void {
    if (this.#tentative.length === 0) this.#confirmedEnd = Math.max(this.#confirmedEnd, time)
  }

  #confirm(words: readonly TimedWord[]): void {
    if (!words.length) return
    this.#confirmed.push(...words)
    this.#confirmedEnd = words.at(-1)!.end
  }
}
