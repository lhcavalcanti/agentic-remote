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

interface EmittedSourceRange extends SpeakableCandidate {
  messageId: string
}

export class SpeakableSegmenter {
  private messageId: string
  private readonly maxSegmentCharacters: number
  private readonly emittedSourceRanges: EmittedSourceRange[] = []
  private previousSnapshot = ''

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
    this.previousSnapshot = ''
  }

  private consume(snapshot: string, includeUnfinishedSuffix: boolean): string[] {
    const candidates = extractSpeakableSegments(
      snapshot,
      includeUnfinishedSuffix,
      this.maxSegmentCharacters,
    )
    const spokenCount = this.emittedSourceRanges.length
    const sharedPrefix = commonPrefixLength(this.previousSnapshot, snapshot)
    for (let index = 0; index < Math.min(spokenCount, candidates.length); index += 1) {
      if (sharedPrefix < this.emittedSourceRanges[index].sourceEnd) {
        this.emittedSourceRanges[index] = {
          messageId: this.messageId,
          ...candidates[index],
        }
      }
    }
    const freshCandidates = candidates.slice(spokenCount)
    this.emittedSourceRanges.push(...freshCandidates.map((candidate) => ({
      messageId: this.messageId,
      ...candidate,
    })))
    this.previousSnapshot = snapshot
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
    for (const segment of splitCompletedProse(block.text, allowUnfinished)) {
      if (isActivityOnly(segment)) continue
      segments.push(...capSegment(segment, maxSegmentCharacters).map((text) => ({
        text,
        sourceStart: block.sourceStart,
        sourceEnd: block.sourceEnd,
      })))
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

function splitCompletedProse(text: string, allowUnfinished: boolean): string[] {
  const segments: string[] = []
  const sentencePattern = /.+?[.!?]+(?:["')\]]+)?(?=\s|$)/g
  let consumed = 0
  for (const match of text.matchAll(sentencePattern)) {
    const sentence = normalizeProse(match[0])
    if (sentence.length > 0) segments.push(sentence)
    consumed = (match.index ?? 0) + match[0].length
  }

  const remainder = normalizeProse(text.slice(consumed))
  if (allowUnfinished && remainder.length > 0) {
    segments.push(remainder)
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

function capSegment(segment: string, maximum: number): string[] {
  if (segment.length <= maximum) return [segment]

  const chunks: string[] = []
  let chunk = ''
  for (const word of segment.split(' ')) {
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
  return chunks
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
