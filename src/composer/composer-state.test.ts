import { describe, expect, it } from 'vitest'
import {
  applyComposerEdit,
  expandComposerPastes,
  hasComposerAcceptanceReceipt,
  prependComposerContent,
  queuedEditOwners,
  reconcileAcceptedComposerDrafts,
  reconcileComposerEdit,
  recoverPendingComposerDraft,
  resolveComposerPastes,
  writeComposerContent,
  writeComposerEdit,
} from './composer-state'
import type { CollapsedPaste, ComposerDraft, ComposerDrafts } from './composer-state'

const key = 'computer-1:original'
const replacementKey = 'computer-1:replacement'
const label = '[Paste #1 - 21 lines]'

function paste(overrides: Partial<CollapsedPaste> = {}): CollapsedPaste {
  return {
    key: 'paste-1', id: 1, lineCount: 21, start: 0,
    content: Array.from({ length: 21 }, (_, index) => `line ${index}`).join('\n'),
    ...overrides,
  }
}

describe('composer draft and queue reconciliation', () => {
  it('scopes an acceptance receipt to its origin even after replacement', () => {
    const submission = { id: 'submission-1', originKey: key, text: 'sent', pastes: [] }
    expect(hasComposerAcceptanceReceipt([{ key, id: submission.id }], replacementKey, submission)).toBe(true)
    expect(hasComposerAcceptanceReceipt([
      { key: replacementKey, id: submission.id },
      { key, id: 'different-submission' },
    ], replacementKey, submission)).toBe(false)
  })

  it('marks an accepted queued rewrite without consuming newer text or another session', () => {
    const drafts: ComposerDrafts = {
      [replacementKey]: {
        text: 'newer draft', pastes: [],
        queuedEdit: { promptId: 'q2', dispatchPending: true, attachmentIds: ['attachment-1'] },
        pendingSubmission: { id: 'accepted-1', originKey: key, text: 'rewrite', pastes: [], queuedPromptId: 'q2' },
      },
      other: { text: 'other session', pastes: [] },
    }
    const before = structuredClone(drafts)
    const marked = reconcileAcceptedComposerDrafts(drafts, [{ key, id: 'accepted-1' }], false)
    expect(marked[replacementKey]).toEqual({
      text: 'newer draft', pastes: [],
      pendingSubmission: { ...drafts[replacementKey].pendingSubmission, accepted: true },
    })
    expect(queuedEditOwners(marked, true)).toEqual({})
    expect(marked.other).toBe(drafts.other)
    expect(drafts).toEqual(before)
    const retired = reconcileAcceptedComposerDrafts(marked, [], true)
    expect(retired[replacementKey]).toEqual({ text: 'newer draft', pastes: [] })
  })

  it('retires only the accepted queue target and leaves unmatched receipts untouched', () => {
    const drafts: ComposerDrafts = {
      [key]: {
        text: '', pastes: [], queuedEdit: { promptId: 'q3', attachmentIds: ['attachment-2'] },
        pendingSubmission: { id: 'accepted-2', text: 'previous rewrite', pastes: [], queuedPromptId: 'q2' },
      },
    }
    expect(reconcileAcceptedComposerDrafts(drafts, [{ key: replacementKey, id: 'accepted-2' }], true)).toBe(drafts)
    expect(reconcileAcceptedComposerDrafts(drafts, [{ key, id: 'accepted-2' }], true)).toEqual({
      [key]: { text: '', pastes: [], queuedEdit: { promptId: 'q3', attachmentIds: ['attachment-2'] } },
    })
    expect(reconcileAcceptedComposerDrafts({
      [key]: { text: '', pastes: [], pendingSubmission: { id: 'accepted-2', text: 'sent', pastes: [] } },
    }, [{ key, id: 'accepted-2' }], true)).toEqual({})
  })

  it('restores a pending payload before newer text without colliding paste identities', () => {
    const submitted = paste({ key: 'submitted', content: 'submitted payload' })
    const newer = paste({ key: 'newer', content: 'newer payload' })
    const draft: ComposerDraft = {
      text: label, pastes: [newer],
      queuedEdit: { promptId: 'q2', dispatchPending: true, attachmentIds: ['attachment-1'] },
      pendingSubmission: {
        id: 'pending-1', text: label, pastes: [submitted], queuedPromptId: 'q2',
      },
    }
    const before = structuredClone(draft)
    const restored = recoverPendingComposerDraft(draft)
    expect(restored.text).toBe(`[Paste #2 - 21 lines]\n\n${label}`)
    expect(restored.pastes.map(({ key, id }) => ({ key, id }))).toEqual([
      { key: 'submitted', id: 2 }, { key: 'newer', id: 1 },
    ])
    expect(expandComposerPastes(restored.text, restored.pastes)).toBe('submitted payload\n\nnewer payload')
    expect(restored.queuedEdit).toEqual(draft.queuedEdit)
    expect(restored.deliveryUncertain).toBe(true)
    expect(draft).toEqual(before)
  })

  it('never restores an accepted submission or releases a different queued rewrite', () => {
    const draft: ComposerDraft = {
      text: 'newer', pastes: [], queuedEdit: { promptId: 'q3' },
      pendingSubmission: { id: 'accepted', text: 'already delivered', pastes: [], accepted: true, queuedPromptId: 'q2' },
    }
    expect(recoverPendingComposerDraft(draft)).toEqual({
      text: 'newer', pastes: [], queuedEdit: { promptId: 'q3' },
    })
    expect(recoverPendingComposerDraft({
      ...draft, queuedEdit: { promptId: 'q2' },
    })).toEqual({ text: 'newer', pastes: [] })
  })

  it('keeps acceptance and unresolved recovery records when the editor is emptied', () => {
    const pending = { id: 'pending', text: 'in flight', pastes: [] }
    const unresolved = { ...paste(), key: 'unresolved' }
    const drafts: ComposerDrafts = {
      [key]: { text: 'plain draft', pastes: [], deliveryUncertain: true },
      pending: { text: 'newer', pastes: [], pendingSubmission: pending },
      unresolved: { text: 'newer', pastes: [], unresolvedPastes: [unresolved], deliveryUncertain: true },
      queued: { text: 'rewrite', pastes: [], queuedEdit: { promptId: 'q1', attachmentIds: ['attachment-1'] } },
    }
    const empty = { text: '', pastes: [] }
    expect(writeComposerContent(drafts, key, empty)[key]).toBeUndefined()
    expect(writeComposerContent(drafts, 'pending', empty).pending.pendingSubmission).toEqual(pending)
    expect(writeComposerContent(drafts, 'unresolved', empty).unresolved.deliveryUncertain).toBe(true)
    expect(writeComposerContent(drafts, 'queued', empty).queued.queuedEdit).toEqual(drafts.queued.queuedEdit)
  })

  it('keeps unresolved payloads distinct by ownership key when editing', () => {
    const first = paste({ key: 'first' })
    const second = paste({ key: 'second' })
    const drafts: ComposerDrafts = {
      [key]: { text: 'before', pastes: [], unresolvedPastes: [first] },
    }
    const updated = writeComposerEdit(drafts, key, {
      content: { text: 'after', pastes: [] }, cursor: 5, unresolvedPastes: [first, second],
    })
    expect(updated[key].text).toBe('after')
    expect(updated[key].unresolvedPastes?.map((entry) => entry.key)).toEqual(['first', 'second'])
    expect(drafts[key].text).toBe('before')
  })

  it('projects only pending queue owners without changing settlement order', () => {
    const drafts: ComposerDrafts = {
      [key]: { text: 'rewrite', pastes: [], queuedEdit: { promptId: 'q2' } },
      [replacementKey]: { text: '', pastes: [], queuedEdit: { promptId: 'q1', dispatchPending: true } },
    }
    expect(queuedEditOwners(drafts)).toEqual({ [key]: 'q2', [replacementKey]: 'q1' })
    expect(queuedEditOwners(drafts, true)).toEqual({ [replacementKey]: 'q1' })
  })
})

describe('composer paste reconciliation', () => {
  it('expands only the owned anchor and preserves surrounding whitespace and literal copies', () => {
    const owned = paste({ start: 2 })
    const text = `  ${label}\r\n${label}  `
    expect(expandComposerPastes(text, [owned])).toBe(`  ${owned.content}\r\n${label}  `)
  })

  it('expands a partially edited paste rather than discarding its payload', () => {
    const owned = paste()
    const edited = applyComposerEdit({ text: label, pastes: [owned] }, 8, 8, { text: ' suffix', pastes: [] })
    expect(edited.content).toEqual({ text: `${owned.content} suffix`, pastes: [] })
    expect(edited.cursor).toBe(owned.content.length + ' suffix'.length)
  })

  it('removes a fully selected paste without reviving its payload', () => {
    expect(applyComposerEdit(
      { text: `${label} later`, pastes: [paste()] }, 0, label.length, { text: '', pastes: [] },
    ).content).toEqual({ text: ' later', pastes: [] })
  })

  it('reconciles textarea newline normalization without changing saved CRLF content', () => {
    const before = { text: `before\r\n${label}`, pastes: [paste({ start: 8 })] }
    const normalized = `before\n${label}`
    expect(reconcileComposerEdit(before, normalized).content).toBe(before)
    const edited = reconcileComposerEdit(before, `new ${normalized}`)
    expect(edited.content.text).toBe(`new before\r\n${label}`)
    expect(edited.content.pastes[0].start).toBe(12)
  })

  it('keeps duplicate legacy labels unresolved instead of borrowing a payload', () => {
    const decoded = resolveComposerPastes(`${label}\n${label}`, [paste()], key, true)
    expect(decoded.pastes).toEqual([])
    expect(decoded.unresolvedPastes).toEqual([expect.objectContaining({ content: paste().content })])
    expect(resolveComposerPastes(label, [paste()], key).pastes).toEqual([paste()])
  })

  it('does not duplicate the same paste ownership when restoring before newer content', () => {
    const owned = paste()
    const restored = prependComposerContent(
      { text: label, pastes: [owned] }, { text: `${label} newer`, pastes: [owned] },
    )
    expect(restored.pastes).toHaveLength(1)
    expect(expandComposerPastes(restored.text, restored.pastes)).toBe(`${owned.content}\n\n${label} newer`)
  })
})
