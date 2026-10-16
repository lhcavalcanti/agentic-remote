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

interface AlignmentCost {
  cost: number
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
  const costs: AlignmentCost[][] = Array.from(
    { length: emitted.length + 1 },
    () => Array.from({ length: candidates.length + 1 }, () => ({ cost: 0 })),
  )
  for (let emittedIndex = emitted.length; emittedIndex >= 0; emittedIndex -= 1) {
    costs[emittedIndex][candidates.length].cost = emitted.length - emittedIndex
  }
  for (let candidateIndex = candidates.length; candidateIndex >= 0; candidateIndex -= 1) {
    costs[emitted.length][candidateIndex].cost = candidates.length - candidateIndex
  }
  for (let emittedIndex = emitted.length - 1; emittedIndex >= 0; emittedIndex -= 1) {
    for (
      let candidateIndex = candidates.length - 1;
      candidateIndex >= 0;
      candidateIndex -= 1
    ) {
      const substitutionCost = candidateSubstitutionCost(
        emitted[emittedIndex],
        candidates[candidateIndex],
      )
      costs[emittedIndex][candidateIndex].cost = Math.min(
        substitutionCost + costs[emittedIndex + 1][candidateIndex + 1].cost,
        1 + costs[emittedIndex + 1][candidateIndex].cost,
        1 + costs[emittedIndex][candidateIndex + 1].cost,
      )
    }
  }

  const alignments: CandidateAlignment[] = []
  let emittedIndex = 0
  let candidateIndex = 0
  while (emittedIndex < emitted.length || candidateIndex < candidates.length) {
    if (emittedIndex === emitted.length) {
      alignments.push({ type: 'inserted', candidateIndex })
      candidateIndex += 1
      continue
    }
    if (candidateIndex === candidates.length) {
      alignments.push({ type: 'deleted', emittedIndex })
      emittedIndex += 1
      continue
    }

    const substitutionCost = candidateSubstitutionCost(
      emitted[emittedIndex],
      candidates[candidateIndex],
    )
    if (
      costs[emittedIndex][candidateIndex].cost
      === substitutionCost + costs[emittedIndex + 1][candidateIndex + 1].cost
    ) {
      alignments.push({ type: 'aligned', emittedIndex, candidateIndex })
      emittedIndex += 1
      candidateIndex += 1
    } else if (
      costs[emittedIndex][candidateIndex].cost
      === 1 + costs[emittedIndex][candidateIndex + 1].cost
    ) {
      alignments.push({ type: 'inserted', candidateIndex })
      candidateIndex += 1
    } else {
      alignments.push({ type: 'deleted', emittedIndex })
      emittedIndex += 1
    }
  }
  return alignments
}

function candidateSubstitutionCost(
  emitted: EmittedCandidate,
  candidate: SpeakableCandidate,
): number {
  if (emitted.text === candidate.text) return 0
  return emitted.present ? 2 : 3
}
