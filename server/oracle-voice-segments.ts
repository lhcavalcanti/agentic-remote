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

interface EmittedSourceRange extends SpeakableCandidate {
  messageId: string
  sourceSnapshot: string
}

export class SpeakableSegmenter {
  private messageId: string
  private readonly maxSegmentCharacters: number
  private readonly emittedSourceRanges: EmittedSourceRange[] = []

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
    this.emittedSourceRanges.length = 0
  }

  private consume(snapshot: string, includeUnfinishedSuffix: boolean): string[] {
    const candidates = extractSpeakableSegments(
      snapshot,
      includeUnfinishedSuffix,
      this.maxSegmentCharacters,
    )
    const matchedCandidates = new Set<number>()
    const matchedEmitted = new Set<number>()
    for (const [emittedIndex, emitted] of this.emittedSourceRanges.entries()) {
      const mappedRange = mapSourceRange(emitted, emitted.sourceSnapshot, snapshot)
      if (mappedRange === undefined) continue
      const candidateIndex = candidates.findIndex((candidate, index) =>
        !matchedCandidates.has(index)
        && candidate.text === emitted.text
        && candidate.sourceStart === mappedRange.sourceStart
        && candidate.sourceEnd === mappedRange.sourceEnd
      )
      if (candidateIndex === -1) continue
      matchedCandidates.add(candidateIndex)
      matchedEmitted.add(emittedIndex)
      updateEmittedRange(emitted, candidates[candidateIndex], snapshot)
    }
    for (const [emittedIndex, emitted] of this.emittedSourceRanges.entries()) {
      if (matchedEmitted.has(emittedIndex)) continue
      const candidateIndex = findOverlappingCandidate(emitted, candidates, matchedCandidates)
      if (candidateIndex === -1) continue
      matchedCandidates.add(candidateIndex)
      updateEmittedRange(emitted, candidates[candidateIndex], snapshot)
    }
    const freshCandidates = candidates.filter((_, index) => !matchedCandidates.has(index))
    this.emittedSourceRanges.push(...freshCandidates.map((candidate) => ({
      messageId: this.messageId,
      sourceSnapshot: snapshot,
      ...candidate,
    })))
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

function commonPrefixLength(left: string, right: string): number {
  const maximum = Math.min(left.length, right.length)
  let index = 0
  while (index < maximum && left[index] === right[index]) index += 1
  return index
}

function commonSuffixLength(left: string, right: string, prefixLength: number): number {
  const maximum = Math.min(left.length, right.length) - prefixLength
  let length = 0
  while (
    length < maximum
    && left[left.length - length - 1] === right[right.length - length - 1]
  ) {
    length += 1
  }
  return length
}

function mapSourceRange(
  range: SpeakableCandidate,
  previousSnapshot: string,
  snapshot: string,
): Pick<SpeakableCandidate, 'sourceStart' | 'sourceEnd'> | undefined {
  const prefixLength = commonPrefixLength(previousSnapshot, snapshot)
  if (range.sourceEnd <= prefixLength) {
    return { sourceStart: range.sourceStart, sourceEnd: range.sourceEnd }
  }

  const suffixLength = commonSuffixLength(previousSnapshot, snapshot, prefixLength)
  const previousSuffixStart = previousSnapshot.length - suffixLength
  if (range.sourceStart < previousSuffixStart) return undefined

  const offset = snapshot.length - previousSnapshot.length
  return {
    sourceStart: range.sourceStart + offset,
    sourceEnd: range.sourceEnd + offset,
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

function findOverlappingCandidate(
  emitted: EmittedSourceRange,
  candidates: SpeakableCandidate[],
  matchedCandidates: Set<number>,
): number {
  let bestIndex = -1
  let bestOverlap = 0
  for (const [index, candidate] of candidates.entries()) {
    if (matchedCandidates.has(index)) continue
    const overlap = Math.min(emitted.sourceEnd, candidate.sourceEnd)
      - Math.max(emitted.sourceStart, candidate.sourceStart)
    if (overlap > bestOverlap) {
      bestIndex = index
      bestOverlap = overlap
    }
  }
  return bestIndex
}

function updateEmittedRange(
  emitted: EmittedSourceRange,
  candidate: SpeakableCandidate,
  snapshot: string,
): void {
  emitted.text = candidate.text
  emitted.sourceStart = candidate.sourceStart
  emitted.sourceEnd = candidate.sourceEnd
  emitted.sourceSnapshot = snapshot
}
