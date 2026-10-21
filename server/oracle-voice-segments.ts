interface ProseBlock {
  text: string
  hasBoundary: boolean
  sourceStart: number
  sourceEnd: number
}

interface SpeakableCandidate {
  text: string
  sourceStart: number
  sourceEnd: number
}

interface ProseSegment {
  text: string
  start: number
  end: number
}

interface EmittedCandidate extends SpeakableCandidate {
  messageId: string
  present: boolean
}

type CandidateAlignment =
  | { type: 'aligned'; emittedIndex: number; candidateIndex: number }
  | { type: 'deleted'; emittedIndex: number }
  | { type: 'inserted'; candidateIndex: number }

const MAX_EXACT_ALIGNMENT_CELLS = 65_536

export class SpeakableSegmenter {
  private messageId: string
  private readonly maxSegmentCharacters: number
  private readonly emittedCandidates: EmittedCandidate[] = []

  constructor(messageId: string, maxSegmentCharacters = 150) {
    validateMessageId(messageId)
    if (!Number.isSafeInteger(maxSegmentCharacters) || maxSegmentCharacters <= 0) {
      throw new Error('maxSegmentCharacters must be a positive integer')
    }
    this.messageId = messageId
    this.maxSegmentCharacters = maxSegmentCharacters
  }

  update(replacementSnapshot: string): string[] {
    return this.consume(replacementSnapshot, false)
  }

  finalize(finalSnapshot: string): string[] {
    return this.consume(finalSnapshot, true)
  }

  reset(messageId: string): void {
    validateMessageId(messageId)
    this.messageId = messageId
    this.emittedCandidates.length = 0
  }

  private consume(snapshot: string, includeUnfinishedSuffix: boolean): string[] {
    const candidates = extractSpeakableSegments(
      snapshot,
      includeUnfinishedSuffix,
      this.maxSegmentCharacters,
    )
    const alignments = alignCandidateSequences(this.emittedCandidates, candidates)
    const freshCandidates: SpeakableCandidate[] = []
    const nextEmittedCandidates: EmittedCandidate[] = []
    for (const alignment of alignments) {
      if (alignment.type === 'inserted') {
        const candidate = candidates[alignment.candidateIndex]
        freshCandidates.push(candidate)
        nextEmittedCandidates.push({
          messageId: this.messageId,
          present: true,
          ...candidate,
        })
      } else if (alignment.type === 'aligned') {
        nextEmittedCandidates.push({
          messageId: this.messageId,
          present: true,
          ...candidates[alignment.candidateIndex],
        })
      } else {
        nextEmittedCandidates.push({
          ...this.emittedCandidates[alignment.emittedIndex],
          present: false,
        })
      }
    }
    this.emittedCandidates.splice(0, this.emittedCandidates.length, ...nextEmittedCandidates)
    return freshCandidates.map(({ text }) => text)
  }
}

function extractSpeakableSegments(
  snapshot: string,
  includeUnfinishedSuffix: boolean,
  maxSegmentCharacters: number,
): SpeakableCandidate[] {
  const blocks = collectProseBlocks(snapshot)
  const segments: SpeakableCandidate[] = []

  for (const [index, block] of blocks.entries()) {
    const isLastBlock = index === blocks.length - 1
    const allowUnfinished = block.hasBoundary || (includeUnfinishedSuffix && isLastBlock)
    let sourceCursor = block.sourceStart
    for (const segment of splitCompletedProse(block.text, allowUnfinished)) {
      if (isActivityOnly(segment.text)) continue
      for (const chunk of capSegment(segment, maxSegmentCharacters)) {
        const sourceRange = locateSourceRange(snapshot, block, chunk.text, sourceCursor)
        sourceCursor = sourceRange.sourceEnd
        segments.push({
          text: chunk.text,
          ...sourceRange,
        })
      }
    }
  }

  return segments
}

function collectProseBlocks(snapshot: string): ProseBlock[] {
  const blocks: ProseBlock[] = []
  const currentLines: string[] = []
  let inFence = false
  let blockStart = 0
  let blockEnd = 0

  const flush = (hasBoundary: boolean) => {
    const text = normalizeProse(currentLines.join(' '))
    currentLines.length = 0
    if (text.length > 0) {
      blocks.push({
        text,
        hasBoundary,
        sourceStart: blockStart,
        sourceEnd: blockEnd,
      })
    }
  }

  for (const match of snapshot.matchAll(/[^\r\n]*(?:\r?\n|$)/g)) {
    const matchedLine = match[0]
    const hasLineBreak = /\r?\n$/.test(matchedLine)
    const rawLine = matchedLine.replace(/\r?\n$/, '')
    if (rawLine.length === 0 && (match.index ?? 0) === snapshot.length) break
    const lineStart = match.index ?? 0
    const lineEnd = lineStart + rawLine.length
    const trimmed = rawLine.trim()
    if (/^(```|~~~)/.test(trimmed)) {
      flush(true)
      inFence = !inFence
      continue
    }
    if (inFence) continue
    if (trimmed.length === 0) {
      flush(true)
      continue
    }
    if (isTableLine(trimmed) || isActivityMarkup(trimmed)) {
      flush(true)
      continue
    }
    const listLine = /^(?:[-+*]|\d+[.)])\s+/.test(trimmed)
    const prose = stripMarkdown(trimmed)
    if (/https?:\/\/|www\./i.test(prose)) {
      flush(true)
      continue
    }

    if (prose.length > 0) {
      if (listLine) {
        flush(true)
        blocks.push({
          text: prose,
          hasBoundary: hasLineBreak,
          sourceStart: lineStart,
          sourceEnd: lineEnd,
        })
        continue
      }
      if (currentLines.length === 0) blockStart = lineStart
      blockEnd = lineEnd
      currentLines.push(prose)
    }
  }
  flush(false)
  return blocks
}

function splitCompletedProse(text: string, allowUnfinished: boolean): ProseSegment[] {
  const segments: ProseSegment[] = []
  let consumed = 0
  let tokenStart = 0
  for (let index = 0; index < text.length; index += 1) {
    if (/\s/.test(text[index])) {
      tokenStart = index + 1
      continue
    }
    if (!/[.!?]/.test(text[index])) continue

    let boundaryEnd = index + 1
    while (boundaryEnd < text.length && /[.!?]/.test(text[boundaryEnd])) {
      boundaryEnd += 1
    }
    while (boundaryEnd < text.length && /["')\]]/.test(text[boundaryEnd])) {
      boundaryEnd += 1
    }
    const followedByWhitespace = (
      boundaryEnd < text.length && /\s/.test(text[boundaryEnd])
    )
    if (!followedByWhitespace && !(allowUnfinished && boundaryEnd === text.length)) {
      index = boundaryEnd - 1
      continue
    }
    if (
      text[index] === '.'
      && isNonTerminalAbbreviation(text.slice(tokenStart, index + 1))
    ) {
      index = boundaryEnd - 1
      continue
    }

    const sentence = normalizeProse(text.slice(consumed, boundaryEnd))
    if (sentence.length > 0) {
      segments.push({ text: sentence, start: consumed, end: boundaryEnd })
    }
    consumed = boundaryEnd
    index = boundaryEnd - 1
  }

  const remainder = normalizeProse(text.slice(consumed))
  if (allowUnfinished && remainder.length > 0) {
    segments.push({ text: remainder, start: consumed, end: text.length })
  }
  return segments
}

function isNonTerminalAbbreviation(token: string): boolean {
  const normalized = token.replace(/^["'([{\s]+/, '').toLowerCase()
  return /^(?:[a-z]\.){2,}$/.test(normalized)
    || /^(?:mr|mrs|ms|dr|prof|sr|jr|st|vs|etc)\.$/.test(normalized)
}

function stripMarkdown(line: string): string {
  return line
    .replace(/^#{1,6}\s+/, '')
    .replace(/^(?:>\s*)+/, '')
    .replace(/^(?:[-+*]|\d+[.)])\s+/, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/`[^`]*`/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_~]+/g, '')
}

function normalizeProse(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim()
}

function capSegment(segment: ProseSegment, maximum: number): ProseSegment[] {
  if (segment.text.length <= maximum) return [segment]

  const chunks: string[] = []
  let chunk = ''
  for (const word of segment.text.split(' ')) {
    if (word.length > maximum) {
      if (chunk.length > 0) {
        chunks.push(chunk)
        chunk = ''
      }
      for (let offset = 0; offset < word.length; offset += maximum) {
        chunks.push(word.slice(offset, offset + maximum))
      }
      continue
    }
    const candidate = chunk.length === 0 ? word : `${chunk} ${word}`
    if (candidate.length <= maximum) {
      chunk = candidate
    } else {
      chunks.push(chunk)
      chunk = word
    }
  }
  if (chunk.length > 0) chunks.push(chunk)

  let cursor = 0
  return chunks.map((text) => {
    const start = segment.text.indexOf(text, cursor)
    cursor = start + text.length
    return {
      text,
      start: segment.start + start,
      end: segment.start + cursor,
    }
  })
}

function isTableLine(line: string): boolean {
  return line.includes('|')
}

function isActivityMarkup(line: string): boolean {
  return /^<(?:activity|tool|status)\b/i.test(line) || /^<!--/.test(line)
}

function isActivityOnly(text: string): boolean {
  return /^(?:thinking|working|searching|reading|running|executing)\b.*(?:…|\.\.\.)$/i
    .test(text)
}

function validateMessageId(messageId: string): void {
  if (messageId.length === 0) {
    throw new Error('message ID must not be empty')
  }
}

function locateSourceRange(
  snapshot: string,
  block: ProseBlock,
  text: string,
  sourceCursor: number,
): Pick<SpeakableCandidate, 'sourceStart' | 'sourceEnd'> {
  const exactStart = snapshot.indexOf(text, sourceCursor)
  if (exactStart >= block.sourceStart && exactStart + text.length <= block.sourceEnd) {
    return { sourceStart: exactStart, sourceEnd: exactStart + text.length }
  }

  const firstWord = text.split(' ')[0]
  const lastWord = text.split(' ').at(-1) ?? firstWord
  const firstStart = snapshot.indexOf(firstWord, sourceCursor)
  const lastStart = snapshot.indexOf(lastWord, Math.max(firstStart, sourceCursor))
  if (
    firstStart >= block.sourceStart
    && lastStart >= firstStart
    && lastStart + lastWord.length <= block.sourceEnd
  ) {
    return { sourceStart: firstStart, sourceEnd: lastStart + lastWord.length }
  }

  return { sourceStart: block.sourceStart, sourceEnd: block.sourceEnd }
}

function alignCandidateSequences(
  emitted: EmittedCandidate[],
  candidates: SpeakableCandidate[],
): CandidateAlignment[] {
  // A deletion destroys positional identity. Treat later unmatched prose as
  // fresh rather than silently dropping text whose intent cannot be inferred.
  const allowPositionalRewrite = emitted.every(({ present }) => present)
  return alignCandidateRanges(
    emitted,
    0,
    emitted.length,
    candidates,
    0,
    candidates.length,
    allowPositionalRewrite,
  )
}

function alignCandidateRanges(
  emitted: EmittedCandidate[],
  emittedStart: number,
  emittedEnd: number,
  candidates: SpeakableCandidate[],
  candidateStart: number,
  candidateEnd: number,
  allowPositionalRewrite: boolean,
): CandidateAlignment[] {
  const emittedLength = emittedEnd - emittedStart
  const candidateLength = candidateEnd - candidateStart
  if (emittedLength === 0) {
    return Array.from(
      { length: candidateLength },
      (_, offset): CandidateAlignment => ({
        type: 'inserted',
        candidateIndex: candidateStart + offset,
      }),
    )
  }
  if (candidateLength === 0) {
    return Array.from(
      { length: emittedLength },
      (_, offset): CandidateAlignment => ({
        type: 'deleted',
        emittedIndex: emittedStart + offset,
      }),
    )
  }
  if (
    emittedLength === 1
    || candidateLength === 1
    || emittedLength <= MAX_EXACT_ALIGNMENT_CELLS / candidateLength
  ) {
    return alignSmallCandidateRanges(
      emitted,
      emittedStart,
      emittedEnd,
      candidates,
      candidateStart,
      candidateEnd,
      allowPositionalRewrite,
    )
  }

  const emittedMiddle = emittedStart + Math.floor(emittedLength / 2)
  const forward = candidatePrefixScores(
    emitted,
    emittedStart,
    emittedMiddle,
    candidates,
    candidateStart,
    candidateEnd,
    false,
    allowPositionalRewrite,
  )
  const backward = candidatePrefixScores(
    emitted,
    emittedMiddle,
    emittedEnd,
    candidates,
    candidateStart,
    candidateEnd,
    true,
    allowPositionalRewrite,
  )
  let candidateOffset = 0
  let bestCost = Number.POSITIVE_INFINITY
  let bestDistance = Number.POSITIVE_INFINITY
  const proportionalOffset = (
    candidateLength * (emittedMiddle - emittedStart) / emittedLength
  )
  for (let offset = 0; offset <= candidateLength; offset += 1) {
    const cost = forward[offset] + backward[candidateLength - offset]
    const distance = Math.abs(offset - proportionalOffset)
    if (cost < bestCost || (cost === bestCost && distance < bestDistance)) {
      candidateOffset = offset
      bestCost = cost
      bestDistance = distance
    }
  }
  const candidateMiddle = candidateStart + candidateOffset

  return [
    ...alignCandidateRanges(
      emitted,
      emittedStart,
      emittedMiddle,
      candidates,
      candidateStart,
      candidateMiddle,
      allowPositionalRewrite,
    ),
    ...alignCandidateRanges(
      emitted,
      emittedMiddle,
      emittedEnd,
      candidates,
      candidateMiddle,
      candidateEnd,
      allowPositionalRewrite,
    ),
  ]
}

function alignSmallCandidateRanges(
  emitted: EmittedCandidate[],
  emittedStart: number,
  emittedEnd: number,
  candidates: SpeakableCandidate[],
  candidateStart: number,
  candidateEnd: number,
  allowPositionalRewrite: boolean,
): CandidateAlignment[] {
  const emittedLength = emittedEnd - emittedStart
  const candidateLength = candidateEnd - candidateStart
  const primary = Array.from(
    { length: emittedLength + 1 },
    () => new Float64Array(candidateLength + 1),
  )
  for (let emittedOffset = emittedLength; emittedOffset >= 0; emittedOffset -= 1) {
    primary[emittedOffset][candidateLength] = emittedLength - emittedOffset
  }
  for (let candidateOffset = candidateLength; candidateOffset >= 0; candidateOffset -= 1) {
    primary[emittedLength][candidateOffset] = candidateLength - candidateOffset
  }
  for (let emittedOffset = emittedLength - 1; emittedOffset >= 0; emittedOffset -= 1) {
    for (
      let candidateOffset = candidateLength - 1;
      candidateOffset >= 0;
      candidateOffset -= 1
    ) {
      const substitutionPrimary = candidateSubstitutionCost(
        emitted[emittedStart + emittedOffset],
        candidates[candidateStart + candidateOffset],
        allowPositionalRewrite,
      ) + primary[emittedOffset + 1][candidateOffset + 1]
      const insertionPrimary = 1 + primary[emittedOffset][candidateOffset + 1]
      const deletionPrimary = 1 + primary[emittedOffset + 1][candidateOffset]
      primary[emittedOffset][candidateOffset] = Math.min(
        substitutionPrimary,
        insertionPrimary,
        deletionPrimary,
      )
    }
  }

  const alignments: CandidateAlignment[] = []
  let emittedOffset = 0
  let candidateOffset = 0
  while (emittedOffset < emittedLength || candidateOffset < candidateLength) {
    if (emittedOffset === emittedLength) {
      alignments.push({
        type: 'inserted',
        candidateIndex: candidateStart + candidateOffset,
      })
      candidateOffset += 1
      continue
    }
    if (candidateOffset === candidateLength) {
      alignments.push({
        type: 'deleted',
        emittedIndex: emittedStart + emittedOffset,
      })
      emittedOffset += 1
      continue
    }

    const substitutionPrimary = candidateSubstitutionCost(
      emitted[emittedStart + emittedOffset],
      candidates[candidateStart + candidateOffset],
      allowPositionalRewrite,
    ) + primary[emittedOffset + 1][candidateOffset + 1]
    if (primary[emittedOffset][candidateOffset] === substitutionPrimary) {
      alignments.push({
        type: 'aligned',
        emittedIndex: emittedStart + emittedOffset,
        candidateIndex: candidateStart + candidateOffset,
      })
      emittedOffset += 1
      candidateOffset += 1
    } else if (
      primary[emittedOffset][candidateOffset]
      === 1 + primary[emittedOffset][candidateOffset + 1]
    ) {
      alignments.push({
        type: 'inserted',
        candidateIndex: candidateStart + candidateOffset,
      })
      candidateOffset += 1
    } else {
      alignments.push({
        type: 'deleted',
        emittedIndex: emittedStart + emittedOffset,
      })
      emittedOffset += 1
    }
  }
  return alignments
}

function candidatePrefixScores(
  emitted: EmittedCandidate[],
  emittedStart: number,
  emittedEnd: number,
  candidates: SpeakableCandidate[],
  candidateStart: number,
  candidateEnd: number,
  reverse: boolean,
  allowPositionalRewrite: boolean,
): Float64Array {
  const emittedLength = emittedEnd - emittedStart
  const candidateLength = candidateEnd - candidateStart
  let previousPrimary = new Float64Array(candidateLength + 1)
  for (let candidateOffset = 1; candidateOffset <= candidateLength; candidateOffset += 1) {
    previousPrimary[candidateOffset] = candidateOffset
  }

  for (let emittedOffset = 1; emittedOffset <= emittedLength; emittedOffset += 1) {
    const currentPrimary = new Float64Array(candidateLength + 1)
    currentPrimary[0] = emittedOffset
    const emittedIndex = reverse
      ? emittedEnd - emittedOffset
      : emittedStart + emittedOffset - 1
    for (
      let candidateOffset = 1;
      candidateOffset <= candidateLength;
      candidateOffset += 1
    ) {
      const candidateIndex = reverse
        ? candidateEnd - candidateOffset
        : candidateStart + candidateOffset - 1
      const substitutionPrimary = candidateSubstitutionCost(
        emitted[emittedIndex],
        candidates[candidateIndex],
        allowPositionalRewrite,
      ) + previousPrimary[candidateOffset - 1]
      const insertionPrimary = 1 + currentPrimary[candidateOffset - 1]
      const deletionPrimary = 1 + previousPrimary[candidateOffset]
      currentPrimary[candidateOffset] = Math.min(
        substitutionPrimary,
        insertionPrimary,
        deletionPrimary,
      )
    }
    previousPrimary = currentPrimary
  }

  return previousPrimary
}

function candidateSubstitutionCost(
  emitted: EmittedCandidate,
  candidate: SpeakableCandidate,
  allowPositionalRewrite: boolean,
): number {
  if (emitted.text === candidate.text) return emitted.present ? 0 : 1
  if (!emitted.present) return 3
  return allowPositionalRewrite ? 2 : 4
}
