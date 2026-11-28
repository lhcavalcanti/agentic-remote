/**
 * Where dictated text sits in a draft. The text around the span is the
 * user's; the span is replaced whole on every update, so tentative words can
 * change, and only the user's own edits around it are kept.
 */
export interface DictationSpan {
  /** The draft before the span, as the user has it now. */
  before: string
  /** The draft after the span, as the user has it now. */
  after: string
  /** The draft when dictation started. */
  original: string
  /** The selection dictation replaced; Cancel puts that text back. */
  originalSelection: [number, number]
}

export interface RenderedSpan {
  draft: string
  start: number
  end: number
}

const OPENING = /[\s([{]$/u
const CLOSING = /^[\s.,;:!?)\]}…]/u

export function beginSpan(draft: string, selectionStart: number, selectionEnd: number): DictationSpan {
  const start = clamp(Math.min(selectionStart, selectionEnd), draft.length)
  const end = clamp(Math.max(selectionStart, selectionEnd), draft.length)
  return {
    before: draft.slice(0, start),
    after: draft.slice(end),
    original: draft,
    originalSelection: [start, end],
  }
}

/** The draft with `text` in the span, spaced from the words around it. */
export function renderSpan(span: DictationSpan, text: string): RenderedSpan {
  const separatorBefore = separatorBeforeText(span, text)
  const separatorAfter = separatorAfterText(span, text)
  const start = span.before.length + separatorBefore.length
  return {
    draft: `${span.before}${separatorBefore}${text}${separatorAfter}${span.after}`,
    start,
    end: start + text.length,
  }
}

/** Removes the span and restores what it replaced, keeping edits made around it. */
export function cancelSpan(span: DictationSpan): { draft: string; selectionStart: number; selectionEnd: number } {
  const replaced = span.original.slice(...span.originalSelection)
  return {
    draft: `${span.before}${replaced}${span.after}`,
    selectionStart: span.before.length,
    selectionEnd: span.before.length + replaced.length,
  }
}

/**
 * The user edited the draft while dictating. The edit is the difference
 * between the drafts; `caret`, where the textarea's caret is after it, places
 * an edit that is ambiguous by text alone, like a letter typed beside the
 * same letter. An edit beside the span keeps the dictation going; one that
 * touches the dictated words hands the text over to the user.
 */
export function rebaseSpan(
  span: DictationSpan,
  rendered: { start: number; end: number },
  previousDraft: string,
  nextDraft: string,
  caret?: number,
): DictationSpan | 'takeover' {
  const edit = changedRange(previousDraft, nextDraft, caret)
  if (!edit) return span
  const delta = nextDraft.length - previousDraft.length
  // The spaces renderSpan adds belong to neither side, unless the user edits them.
  const userAfterStart = previousDraft.length - span.after.length
  if (edit.end <= rendered.start) {
    const cut = edit.end <= span.before.length ? span.before.length : rendered.start
    return { ...span, before: nextDraft.slice(0, cut + delta) }
  }
  if (edit.start >= rendered.end) {
    return { ...span, after: nextDraft.slice(edit.start >= userAfterStart ? userAfterStart : rendered.end) }
  }
  return 'takeover'
}

/** The replaced range of `previous`, or undefined when the drafts are equal. */
function changedRange(previous: string, next: string, caret?: number): { start: number; end: number } | undefined {
  if (previous === next) return undefined
  const shorter = Math.min(previous.length, next.length)
  const suffixLimit = caret === undefined ? shorter : Math.min(shorter, Math.max(0, next.length - caret))
  let suffix = 0
  while (
    suffix < suffixLimit
    && previous[previous.length - 1 - suffix] === next[next.length - 1 - suffix]
  ) suffix += 1
  let prefix = 0
  while (prefix < shorter - suffix && previous[prefix] === next[prefix]) prefix += 1
  return { start: prefix, end: previous.length - suffix }
}

function separatorBeforeText(span: DictationSpan, text: string): string {
  return text && span.before && !OPENING.test(span.before) && !/^\s/u.test(text) ? ' ' : ''
}

function separatorAfterText(span: DictationSpan, text: string): string {
  return text && span.after && !CLOSING.test(span.after) && !/\s$/u.test(text) ? ' ' : ''
}

function clamp(value: number, length: number): number {
  return Math.max(0, Math.min(length, Number.isFinite(value) ? Math.floor(value) : length))
}
