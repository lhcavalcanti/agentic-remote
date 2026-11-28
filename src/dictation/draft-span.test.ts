import { describe, expect, it } from 'vitest'
import { beginSpan, cancelSpan, rebaseSpan, renderSpan, type DictationSpan } from './draft-span'

describe('draft span rendering', () => {
  it('starts at the caret and spaces dictated text from the words around it', () => {
    const span = beginSpan('Fix the bug today', 7, 7)
    expect(renderSpan(span, 'login')).toEqual({ draft: 'Fix the login bug today', start: 8, end: 13 })
  })

  it('adds no space at the start of an empty draft or next to existing spaces', () => {
    expect(renderSpan(beginSpan('', 0, 0), 'hello')).toEqual({ draft: 'hello', start: 0, end: 5 })
    expect(renderSpan(beginSpan('Note: ', 6, 6), 'hello')).toEqual({ draft: 'Note: hello', start: 6, end: 11 })
    expect(renderSpan(beginSpan('a  b', 2, 2), 'x')).toEqual({ draft: 'a x b', start: 2, end: 3 })
  })

  it('keeps punctuation and brackets against the dictated words', () => {
    expect(renderSpan(beginSpan('Say .', 4, 4), 'hello').draft).toBe('Say hello.')
    expect(renderSpan(beginSpan('Call ()', 6, 6), 'me').draft).toBe('Call (me)')
  })

  it('renders nothing extra while there is no text yet', () => {
    expect(renderSpan(beginSpan('ab', 1, 1), '')).toEqual({ draft: 'ab', start: 1, end: 1 })
  })

  it('replaces a selection, and Cancel restores it with its selection', () => {
    const span = beginSpan('Send the old words now', 9, 18)
    expect(renderSpan(span, 'new').draft).toBe('Send the new now')
    expect(cancelSpan(span)).toEqual({ draft: 'Send the old words now', selectionStart: 9, selectionEnd: 18 })
  })
})

describe('rebasing a span on edits made while dictating', () => {
  // The caret is after "there ", so the dictated words need a space only after them.
  const span = beginSpan('Hi there friend', 9, 9)
  const rendered = renderSpan(span, 'my good')
  const rebased = (next: string, caret: number) => rebaseSpan(span, rendered, rendered.draft, next, caret)

  it('keeps an edit made before the dictated text', () => {
    expect(rendered.draft).toBe('Hi there my good friend')
    const next = rebased('Hello there my good friend', 5)
    expect(next).toMatchObject({ before: 'Hello there ', after: 'friend' })
    expect(renderSpan(next as DictationSpan, 'my good friends').draft).toBe('Hello there my good friends friend')
  })

  it('keeps an edit made after the dictated text', () => {
    const draft = 'Hi there my good friend!'
    expect(rebased(draft, draft.length)).toMatchObject({ before: 'Hi there ', after: 'friend!' })
  })

  it('hands the text over when an edit touches the dictated words', () => {
    expect(rebased('Hi there my food friend', 13)).toBe('takeover')
    expect(rebased('Hi there friend', 9)).toBe('takeover')
  })

  it('reads typing at either edge of the dictated words from the caret', () => {
    // "m" typed before "my", the same letter as the first dictated one.
    expect(rebased('Hi there mmy good friend', 10)).toMatchObject({ before: 'Hi there m', after: 'friend' })
    // "d" typed after "good", the same letter as the last dictated one.
    expect(rebased('Hi there my goodd friend', 17)).toMatchObject({ before: 'Hi there ', after: 'd friend' })
  })

  it('treats a deleted space beside the dictated words as an edit beside them', () => {
    expect(rebased('Hi theremy good friend', 8)).toMatchObject({ before: 'Hi there', after: 'friend' })
    expect(rebased('Hi there my goodfriend', 16)).toMatchObject({ before: 'Hi there ', after: 'friend' })
  })

  it('keeps edits made beside the dictated words when it is cancelled', () => {
    const next = rebased('Hello there my good friend', 5) as DictationSpan
    expect(cancelSpan(next)).toEqual({ draft: 'Hello there friend', selectionStart: 12, selectionEnd: 12 })
    const replacing = beginSpan('Send the old words now', 9, 18)
    const shown = renderSpan(replacing, 'new')
    const edited = rebaseSpan(replacing, shown, shown.draft, 'Please Send the new now', 7) as DictationSpan
    expect(cancelSpan(edited)).toEqual({ draft: 'Please Send the old words now', selectionStart: 16, selectionEnd: 25 })
  })
})
