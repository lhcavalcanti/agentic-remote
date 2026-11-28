/**
 * Word agreement for live dictation (LocalAgreement-2). An offline model is
 * decoded again over the unconfirmed audio every pass; the words two
 * consecutive passes agree on become confirmed text, and the rest of the
 * latest pass is shown as tentative. VoiceInk's local Parakeet live text uses
 * the same method; this is an independent implementation.
 *
 * Parakeet drops or garbles a word that starts right at the beginning of its
 * window, so every window also covers the last confirmed word and some audio
 * before it. The pass is lined up with the confirmed text by finding that word
 * again by its text; word end times are not trusted for this, because a
 * word's duration runs on through the pause after it.
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
/** How far before the confirmed end a new word may start and still be new: a frame and a half. */
const BOUNDARY_TOLERANCE_SECONDS = 0.12
/** How far another pass may move the last confirmed word and still have it found again. */
const ANCHOR_SLACK_SECONDS = 0.3

/**
 * Joins sentencepiece tokens into words; punctuation attaches to the word
 * before it. `limitSeconds` is where the audio ends: later words are dropped,
 * and no word ends in the padding after it.
 */
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
    const end = Math.min(
      start + Math.max(result.durations?.[index] ?? 0, MIN_TOKEN_SECONDS),
      Math.max(limitSeconds, start + MIN_TOKEN_SECONDS),
    )
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
  /** The last confirmed word, while the next window still covers it. */
  #anchor: TimedWord | undefined

  get confirmed(): readonly TimedWord[] {
    return this.#confirmed
  }

  get tentative(): readonly TimedWord[] {
    return this.#tentative
  }

  /** Where the unconfirmed audio begins. */
  get confirmedEnd(): number {
    return this.#confirmedEnd
  }

  /**
   * The earliest time the next window has to cover: the last confirmed word,
   * so the pass can be lined up with it, or the confirmed end after a skip.
   */
  get resumeTime(): number {
    return this.#anchor?.start ?? this.#confirmedEnd
  }

  /** The words of a pass that come after the confirmed text; changes nothing. */
  unconfirmed(hypothesis: readonly TimedWord[]): TimedWord[] {
    const anchor = this.#anchor
    if (anchor) {
      const key = normalizeWord(anchor.text)
      let match = -1
      hypothesis.forEach((word, index) => {
        const distance = Math.abs(word.start - anchor.start)
        if (distance > ANCHOR_SLACK_SECONDS || normalizeWord(word.text) !== key) return
        if (match === -1 || distance < Math.abs(hypothesis[match].start - anchor.start)) match = index
      })
      if (match !== -1) return hypothesis.slice(match + 1)
    }
    return hypothesis.filter(
      (word) => word.start >= this.#confirmedEnd - BOUNDARY_TOLERANCE_SECONDS,
    )
  }

  /** Takes the latest pass's words and returns the ones it newly confirmed. */
  ingest(hypothesis: readonly TimedWord[]): TimedWord[] {
    const fresh = this.unconfirmed(hypothesis)
    let agreed = 0
    while (
      agreed < fresh.length
      && agreed < this.#tentative.length
      && normalizeWord(fresh[agreed].text) === normalizeWord(this.#tentative[agreed].text)
    ) agreed += 1
    const confirmed = fresh.slice(0, agreed)
    if (agreed > 0) {
      // Either pass may have run the last word on into the next one; trust the earlier end.
      this.#confirm(confirmed, Math.min(fresh[agreed - 1].end, this.#tentative[agreed - 1].end))
    }
    this.#tentative = fresh.slice(agreed)
    return confirmed
  }

  /** Bounds the window: confirms tentative words that end at or before `time`. */
  forceConfirmThrough(time: number): TimedWord[] {
    const index = this.#tentative.findIndex((word) => word.end > time)
    const forced = this.#tentative.splice(0, index === -1 ? this.#tentative.length : index)
    if (forced.length) this.#confirm(forced, forced.at(-1)!.end)
    return forced
  }

  /** Drops leading silence when a pass found no words. */
  skipSilenceTo(time: number): void {
    if (this.#tentative.length > 0 || time <= this.#confirmedEnd) return
    this.#confirmedEnd = time
    this.#anchor = undefined
  }

  #confirm(words: readonly TimedWord[], end: number): void {
    this.#confirmed.push(...words)
    this.#confirmedEnd = Math.max(this.#confirmedEnd, end)
    this.#anchor = words.at(-1)
  }
}
