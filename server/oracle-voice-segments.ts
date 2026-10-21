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

interface AlignmentScores {
  primary: Float64Array
  secondary: Float64Array
}

export class SpeakableSegmenter {
  private messageId: string
  private readonly maxSegmentCharacters: number
  private readonly emittedCandidates: EmittedCandidate[] = []

  constructor(messageId: string, maxSegmentCharacters = 320) {
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
    const rawLine = match[0].replace(/\r?\n$/, '')
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
    const prose = stripMarkdown(trimmed)
    if (/https?:\/\/|www\./i.test(prose)) {
      flush(true)
      continue
    }

    if (prose.length > 0) {
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
  const sentencePattern = /.+?[.!?]+(?:["')\]]+)?(?=\s|$)/g
  let consumed = 0
  for (const match of text.matchAll(sentencePattern)) {
    const sentence = normalizeProse(match[0])
    if (sentence.length > 0) {
      const start = match.index ?? 0
      segments.push({ text: sentence, start, end: start + match[0].length })
    }
    consumed = (match.index ?? 0) + match[0].length
  }

  const remainder = normalizeProse(text.slice(consumed))
  if (allowUnfinished && remainder.length > 0) {
    segments.push({ text: remainder, start: consumed, end: text.length })
  }
  return segments
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
  return alignCandidateRanges(
    emitted,
    0,
    emitted.length,
    candidates,
    0,
    candidates.length,
  )
}

function alignCandidateRanges(
  emitted: EmittedCandidate[],
  emittedStart: number,
  emittedEnd: number,
  candidates: SpeakableCandidate[],
  candidateStart: number,
  candidateEnd: number,
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
  if (emittedLength === 1 || candidateLength === 1) {
    return alignSmallCandidateRanges(
      emitted,
      emittedStart,
      emittedEnd,
      candidates,
      candidateStart,
      candidateEnd,
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
  )
  const backward = candidatePrefixScores(
    emitted,
    emittedMiddle,
    emittedEnd,
    candidates,
    candidateStart,
    candidateEnd,
    true,
  )
  let candidateOffset = 0
  let bestPrimary = Number.POSITIVE_INFINITY
  let bestSecondary = Number.POSITIVE_INFINITY
  for (let offset = 0; offset <= candidateLength; offset += 1) {
    const primary = forward.primary[offset] + backward.primary[candidateLength - offset]
    const secondary = (
      forward.secondary[offset] + backward.secondary[candidateLength - offset]
    )
    if (scoreIsLess(primary, secondary, bestPrimary, bestSecondary)) {
      candidateOffset = offset
      bestPrimary = primary
      bestSecondary = secondary
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
    ),
    ...alignCandidateRanges(
      emitted,
      emittedMiddle,
      emittedEnd,
      candidates,
      candidateMiddle,
      candidateEnd,
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
): CandidateAlignment[] {
  const emittedLength = emittedEnd - emittedStart
  const candidateLength = candidateEnd - candidateStart
  const primary = Array.from(
    { length: emittedLength + 1 },
    () => new Float64Array(candidateLength + 1),
  )
  const secondary = Array.from(
    { length: emittedLength + 1 },
    () => new Float64Array(candidateLength + 1),
  )
  for (let emittedOffset = emittedLength; emittedOffset >= 0; emittedOffset -= 1) {
    primary[emittedOffset][candidateLength] = emittedLength - emittedOffset
    secondary[emittedOffset][candidateLength] = 2 * (emittedLength - emittedOffset)
  }
  for (let candidateOffset = candidateLength; candidateOffset >= 0; candidateOffset -= 1) {
    primary[emittedLength][candidateOffset] = candidateLength - candidateOffset
    secondary[emittedLength][candidateOffset] = candidateLength - candidateOffset
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
      ) + primary[emittedOffset + 1][candidateOffset + 1]
      const substitutionSecondary = secondary[emittedOffset + 1][candidateOffset + 1]
      const insertionPrimary = 1 + primary[emittedOffset][candidateOffset + 1]
      const insertionSecondary = 1 + secondary[emittedOffset][candidateOffset + 1]
      const deletionPrimary = 1 + primary[emittedOffset + 1][candidateOffset]
      const deletionSecondary = 2 + secondary[emittedOffset + 1][candidateOffset]

      primary[emittedOffset][candidateOffset] = substitutionPrimary
      secondary[emittedOffset][candidateOffset] = substitutionSecondary
      if (scoreIsLess(
        insertionPrimary,
        insertionSecondary,
        primary[emittedOffset][candidateOffset],
        secondary[emittedOffset][candidateOffset],
      )) {
        primary[emittedOffset][candidateOffset] = insertionPrimary
        secondary[emittedOffset][candidateOffset] = insertionSecondary
      }
      if (scoreIsLess(
        deletionPrimary,
        deletionSecondary,
        primary[emittedOffset][candidateOffset],
        secondary[emittedOffset][candidateOffset],
      )) {
        primary[emittedOffset][candidateOffset] = deletionPrimary
        secondary[emittedOffset][candidateOffset] = deletionSecondary
      }
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
    ) + primary[emittedOffset + 1][candidateOffset + 1]
    const substitutionSecondary = secondary[emittedOffset + 1][candidateOffset + 1]
    if (scoresEqual(
      primary[emittedOffset][candidateOffset],
      secondary[emittedOffset][candidateOffset],
      substitutionPrimary,
      substitutionSecondary,
    )) {
      alignments.push({
        type: 'aligned',
        emittedIndex: emittedStart + emittedOffset,
        candidateIndex: candidateStart + candidateOffset,
      })
      emittedOffset += 1
      candidateOffset += 1
    } else if (
      scoresEqual(
        primary[emittedOffset][candidateOffset],
        secondary[emittedOffset][candidateOffset],
        1 + primary[emittedOffset][candidateOffset + 1],
        1 + secondary[emittedOffset][candidateOffset + 1],
      )
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
): AlignmentScores {
  const emittedLength = emittedEnd - emittedStart
  const candidateLength = candidateEnd - candidateStart
  let previousPrimary = new Float64Array(candidateLength + 1)
  let previousSecondary = new Float64Array(candidateLength + 1)
  for (let candidateOffset = 1; candidateOffset <= candidateLength; candidateOffset += 1) {
    previousPrimary[candidateOffset] = candidateOffset
    previousSecondary[candidateOffset] = candidateOffset
  }

  for (let emittedOffset = 1; emittedOffset <= emittedLength; emittedOffset += 1) {
    const currentPrimary = new Float64Array(candidateLength + 1)
    const currentSecondary = new Float64Array(candidateLength + 1)
    currentPrimary[0] = emittedOffset
    currentSecondary[0] = 2 * emittedOffset
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
      ) + previousPrimary[candidateOffset - 1]
      const substitutionSecondary = previousSecondary[candidateOffset - 1]
      const insertionPrimary = 1 + currentPrimary[candidateOffset - 1]
      const insertionSecondary = 1 + currentSecondary[candidateOffset - 1]
      const deletionPrimary = 1 + previousPrimary[candidateOffset]
      const deletionSecondary = 2 + previousSecondary[candidateOffset]

      currentPrimary[candidateOffset] = substitutionPrimary
      currentSecondary[candidateOffset] = substitutionSecondary
      if (scoreIsLess(
        insertionPrimary,
        insertionSecondary,
        currentPrimary[candidateOffset],
        currentSecondary[candidateOffset],
      )) {
        currentPrimary[candidateOffset] = insertionPrimary
        currentSecondary[candidateOffset] = insertionSecondary
      }
      if (scoreIsLess(
        deletionPrimary,
        deletionSecondary,
        currentPrimary[candidateOffset],
        currentSecondary[candidateOffset],
      )) {
        currentPrimary[candidateOffset] = deletionPrimary
        currentSecondary[candidateOffset] = deletionSecondary
      }
    }
    previousPrimary = currentPrimary
    previousSecondary = currentSecondary
  }

  return { primary: previousPrimary, secondary: previousSecondary }
}

function scoreIsLess(
  primary: number,
  secondary: number,
  otherPrimary: number,
  otherSecondary: number,
): boolean {
  return primary < otherPrimary || (primary === otherPrimary && secondary < otherSecondary)
}

function scoresEqual(
  primary: number,
  secondary: number,
  otherPrimary: number,
  otherSecondary: number,
): boolean {
  return primary === otherPrimary && secondary === otherSecondary
}

function candidateSubstitutionCost(
  emitted: EmittedCandidate,
  candidate: SpeakableCandidate,
): number {
  if (emitted.text === candidate.text) return emitted.present ? 0 : 1
  return emitted.present ? 2 : 3
}
