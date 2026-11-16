import type { ChatMessage, SessionDetail } from '../../shared/contracts.js'
import type { PromptAcceptanceReceipt } from '../../shared/launch-identity.js'

export type SentHistoryContext = Partial<Pick<SessionDetail,
  'status' | 'failedPrompt' | 'queuedDispatch' | 'terminalQueueDispatchPending'
>>

// Provider transcripts and replies attest delivery. Only local echoes need explicit
// confirmation; legacy rows stay available except known failures or an unfinished trailing turn.
export function filterSentMessages(
  messages: readonly ChatMessage[], query = '', receipts: readonly PromptAcceptanceReceipt[] = [],
  context: SentHistoryContext = {},
): ChatMessage[] {
  const search = query.trim().toLowerCase()
  const confirmedIds = new Set(receipts.filter((receipt) =>
    receipt.state === 'delivered' ||
    (receipt.state === 'accepted' && receipt.handedAt),
  ).map((receipt) => receipt.userMessageId))
  const pendingIds = new Set(receipts.filter((receipt) =>
    !confirmedIds.has(receipt.userMessageId),
  ).map((receipt) => receipt.userMessageId))
  const replied = new Set<string>()
  const failed = new Set<string>()
  const waiting = new Set<string>()
  let latestUser: ChatMessage | undefined
  for (const message of messages) {
    if (message.role === 'user') latestUser = message
    else if (latestUser && message.role === 'assistant') {
      const content = message.content.trim()
      if (message.activityStatus === 'failed' ||
        /^(?:Not sent:|Provider start outcome is uncertain:|Follow-up delivery is uncertain:|Unable to complete the response:)/i.test(content)) {
        failed.add(latestUser.id)
      } else if (content) replied.add(latestUser.id)
      else if (message.streaming) waiting.add(latestUser.id)
    }
  }
  const unfinished = context.status === 'running' || context.status === 'waiting' || context.status === 'error' ||
    context.queuedDispatch || context.terminalQueueDispatchPending
  return messages
    .filter((message) => message.role === 'user' && !message.appGenerated &&
      message.content.trim() &&
      !message.streaming && message.activityStatus !== 'pending' &&
      message.content.toLowerCase().includes(search))
    .filter((message) => {
      if (message.deliveryConfirmed || confirmedIds.has(message.id)) return true
      if (message.deliveryState) return false
      if (replied.has(message.id)) return true
      if (pendingIds.has(message.id) || failed.has(message.id) || waiting.has(message.id)) return false
      return message.id !== latestUser?.id ||
        (!unfinished && message.content !== context.failedPrompt?.content)
    })
    .map((message, index) => ({ message, index, time: Date.parse(message.createdAt) || 0 }))
    .sort((left, right) => right.time - left.time || right.index - left.index)
    .map(({ message }) => message)
}

export type CollapsedPaste = {
  key: string
  id: number
  content: string
  lineCount: number
  start: number
}

export type UnresolvedComposerPaste = Omit<CollapsedPaste, 'start'>

export type ComposerContent = {
  text: string
  pastes: CollapsedPaste[]
}

export type ComposerEdit = {
  content: ComposerContent
  cursor: number
  unresolvedPastes?: UnresolvedComposerPaste[]
}

export type ComposerSubmission = ComposerContent & {
  id: string
  originKey?: string
  acknowledgesFailure?: string
  queuedPromptId?: string
  accepted?: boolean
}

export type ComposerAcceptanceReceipt = { key: string; id: string }

export type ComposerQueuedEdit = {
  promptId: string
  dispatchPending?: boolean
  attachmentIds?: string[]
}

export type ComposerDraft = ComposerContent & {
  pendingSubmission?: ComposerSubmission
  deliveryUncertain?: boolean
  queuedEdit?: ComposerQueuedEdit
  unresolvedPastes?: UnresolvedComposerPaste[]
}

export type ComposerDrafts = Record<string, ComposerDraft>

export const collapsedPasteLineThreshold = 20

export function hasComposerAcceptanceReceipt(
  receipts: ComposerAcceptanceReceipt[],
  key: string,
  submission: ComposerSubmission,
): boolean {
  return receipts.some((receipt) =>
    receipt.key === (submission.originKey || key) && receipt.id === submission.id,
  )
}

export function reconcileAcceptedComposerDrafts(
  drafts: ComposerDrafts,
  receipts: ComposerAcceptanceReceipt[],
  retire: boolean,
): ComposerDrafts {
  let result = drafts
  for (const [key, draft] of Object.entries(drafts)) {
    const pending = draft.pendingSubmission
    if (!pending || (!pending.accepted && !hasComposerAcceptanceReceipt(receipts, key, pending))) {
      continue
    }
    if (retire) {
      const { pendingSubmission: _accepted, ...remaining } = draft
      if (pending.queuedPromptId === remaining.queuedEdit?.promptId) {
        delete remaining.queuedEdit
      }
      if (result === drafts) {
        result = { ...drafts }
      }
      if (remaining.text || remaining.queuedEdit) {
        result[key] = remaining
      } else {
        delete result[key]
      }
    } else if (!pending.accepted ||
      (pending.queuedPromptId && pending.queuedPromptId === draft.queuedEdit?.promptId)) {
      const accepted = { ...draft, pendingSubmission: { ...pending, accepted: true } }
      if (pending.queuedPromptId === accepted.queuedEdit?.promptId) {
        delete accepted.queuedEdit
      }
      result = {
        ...result,
        [key]: accepted,
      }
    }
  }
  return result
}

export function collapsedPasteLabel(paste: CollapsedPaste): string {
  return `[Paste #${paste.id} - ${paste.lineCount} lines]`
}

export function pastedLineCount(content: string): number {
  return content.split(/\r\n|\r|\n/).length
}

export function isComposerPastePayload(
  value: unknown,
): value is Pick<CollapsedPaste, 'id' | 'content' | 'lineCount'> {
  if (!value || typeof value !== 'object') {
    return false
  }
  const paste = value as CollapsedPaste
  return Number.isInteger(paste.id) && paste.id > 0 &&
    typeof paste.content === 'string' &&
    Number.isInteger(paste.lineCount) &&
    paste.lineCount > collapsedPasteLineThreshold
}

export function resolveComposerPastes(
  text: string,
  value: unknown,
  namespace: string,
  legacy = false,
): { pastes: CollapsedPaste[]; unresolvedPastes: UnresolvedComposerPaste[] } {
  if (!Array.isArray(value)) {
    return { pastes: [], unresolvedPastes: [] }
  }
  const candidates = value.flatMap((raw, index) => {
    if (!isComposerPastePayload(raw)) {
      return []
    }
    const candidate = raw as CollapsedPaste & { unresolved?: boolean }
    const label = collapsedPasteLabel(candidate)
    const start = legacy ? text.indexOf(label) : candidate.start
    const explicitKey = typeof candidate.key === 'string' && candidate.key.length > 0
      ? candidate.key : undefined
    const paste: CollapsedPaste = {
      id: candidate.id,
      content: candidate.content,
      lineCount: candidate.lineCount,
      key: explicitKey || `legacy:${namespace}:${candidate.id}:${start}`,
      start,
    }
    const placed = Number.isInteger(start) && start >= 0 &&
      text.slice(start, start + label.length) === label &&
      (legacy
        ? candidate.unresolved !== true && text.indexOf(label, start + label.length) < 0
        : explicitKey !== undefined)
    return [{
      paste,
      placed,
      recoveryKey: candidate.unresolved === true && explicitKey
        ? explicitKey : `unresolved:${namespace}:${index}:${explicitKey || candidate.id}`,
    }]
  })
  const placed = candidates.filter((entry) => entry.placed)
  const owned = placed.filter((entry) => !placed.some((other) =>
    other !== entry && (
      other.paste.key === entry.paste.key ||
      (other.paste.start < entry.paste.start + collapsedPasteLabel(entry.paste).length &&
        entry.paste.start < other.paste.start + collapsedPasteLabel(other.paste).length)
    ),
  ))
  return {
    pastes: owned.map((entry) => entry.paste).sort((left, right) => left.start - right.start),
    unresolvedPastes: candidates.filter((entry) => !owned.includes(entry)).map((entry) => ({
      key: entry.recoveryKey,
      id: entry.paste.id,
      content: entry.paste.content,
      lineCount: entry.paste.lineCount,
    })),
  }
}

export function mergeUnresolvedComposerPastes(
  first: UnresolvedComposerPaste[] = [],
  second: UnresolvedComposerPaste[] = [],
): UnresolvedComposerPaste[] {
  return [...first, ...second.filter((paste) =>
    !first.some((entry) => entry.key === paste.key))]
}

export function prependComposerContent(
  submitted: ComposerContent,
  existing: ComposerContent,
): ComposerContent {
  const submittedKeys = new Set(submitted.pastes.map((paste) => paste.key))
  const retained = existing.pastes.filter(
    (paste) => !submittedKeys.has(paste.key),
  )
  const usedIds = new Set(retained.map((paste) => paste.id))
  let nextId = Math.max(0, ...usedIds)
  let cursor = 0
  let text = ''
  const pastes: CollapsedPaste[] = []
  for (const paste of [...submitted.pastes].sort(
    (left, right) => left.start - right.start,
  )) {
    const oldLabel = collapsedPasteLabel(paste)
    if (
      paste.start < cursor ||
      submitted.text.slice(paste.start, paste.start + oldLabel.length) !== oldLabel
    ) {
      continue
    }
    text += submitted.text.slice(cursor, paste.start)
    let id = paste.id
    if (usedIds.has(id)) {
      do {
        nextId += 1
      } while (usedIds.has(nextId))
      id = nextId
    } else {
      nextId = Math.max(nextId, id)
    }
    usedIds.add(id)
    const restored = { ...paste, id, start: text.length }
    text += collapsedPasteLabel(restored)
    pastes.push(restored)
    cursor = paste.start + oldLabel.length
  }
  text += submitted.text.slice(cursor)
  const separator = text && existing.text
    ? text.endsWith('\n') ? '\n' : '\n\n'
    : ''
  const shift = text.length + separator.length
  return {
    text: `${text}${separator}${existing.text}`,
    pastes: [
      ...pastes,
      ...retained.map((paste) => ({ ...paste, start: paste.start + shift })),
    ],
  }
}

export function recoverPendingComposerDraft(
  draft: ComposerDraft,
  deliveryUncertain = true,
): ComposerDraft {
  const { pendingSubmission, ...remaining } = draft
  if (pendingSubmission?.accepted) {
    if (pendingSubmission.queuedPromptId === remaining.queuedEdit?.promptId) {
      delete remaining.queuedEdit
    }
    return remaining
  }
  return pendingSubmission
    ? {
        ...remaining,
        ...prependComposerContent(pendingSubmission, remaining),
        ...(deliveryUncertain ? { deliveryUncertain: true } : {}),
      }
    : draft
}

export function writeComposerContent(
  drafts: ComposerDrafts,
  key: string,
  content: ComposerContent,
): ComposerDrafts {
  const draft = { ...drafts[key], ...content }
  if (!draft.text) {
    if (!draft.unresolvedPastes?.length) {
      delete draft.deliveryUncertain
    }
    if (!draft.pendingSubmission && !draft.queuedEdit &&
        !draft.unresolvedPastes?.length) {
      const { [key]: _removed, ...remaining } = drafts
      return remaining
    }
  }
  return { ...drafts, [key]: draft }
}

export function writeComposerEdit(
  drafts: ComposerDrafts,
  key: string,
  edit: ComposerEdit,
): ComposerDrafts {
  const existing = drafts[key] || { text: '', pastes: [] }
  const updated = edit.unresolvedPastes?.length ? {
    ...drafts,
    [key]: {
      ...existing,
      unresolvedPastes: mergeUnresolvedComposerPastes(
        existing.unresolvedPastes, edit.unresolvedPastes,
      ),
    },
  } : drafts
  return writeComposerContent(updated, key, edit.content)
}

export function queuedEditOwners(drafts: ComposerDrafts, pendingOnly = false): Record<string, string> {
  return Object.fromEntries(Object.entries(drafts).flatMap(([key, draft]) =>
    draft.queuedEdit && (!pendingOnly || draft.queuedEdit.dispatchPending)
      ? [[key, draft.queuedEdit.promptId]]
      : [],
  ))
}

export function activeComposerPastes(
  value: string,
  pastes: CollapsedPaste[],
): CollapsedPaste[] {
  return pastes.filter((paste) => {
    const label = collapsedPasteLabel(paste)
    return value.slice(paste.start, paste.start + label.length) === label
  })
}

export function expandComposerPastes(
  value: string,
  pastes: CollapsedPaste[],
): string {
  let offset = 0
  let expanded = ''
  const ordered = [...pastes].sort((left, right) => left.start - right.start)
  for (const paste of ordered) {
    const label = collapsedPasteLabel(paste)
    if (
      paste.start < offset ||
      value.slice(paste.start, paste.start + label.length) !== label
    ) {
      continue
    }
    expanded += value.slice(offset, paste.start)
    expanded += paste.content
    offset = paste.start + label.length
  }
  // Put back exactly as written. What is typed around a paste is part of the
  // message -- indentation before it, a newline after it -- and trimming the
  // ends quietly rewrote the prompt. Emptiness and whether it is a command are
  // decided from a trimmed copy where they are asked, not here.
  return expanded + value.slice(offset)
}

export function reconcileComposerEdit(
  before: ComposerContent,
  after: string,
): ComposerEdit {
  if (before.text === after) {
    return { content: before, cursor: after.length }
  }
  const beforeInput = composerInputValue(before.text)
  const afterInput = composerInputValue(after)
  if (beforeInput === afterInput) {
    return { content: before, cursor: before.text.length }
  }
  let prefix = 0
  while (
    prefix < beforeInput.length &&
    prefix < afterInput.length &&
    beforeInput[prefix] === afterInput[prefix]
  ) {
    prefix += 1
  }
  let suffix = 0
  while (
    suffix < beforeInput.length - prefix &&
    suffix < afterInput.length - prefix &&
    beforeInput[beforeInput.length - suffix - 1] ===
      afterInput[afterInput.length - suffix - 1]
  ) {
    suffix += 1
  }
  const removedLength = beforeInput.length - prefix - suffix
  let completeSuffix = suffix
  while (
    completeSuffix < Math.min(beforeInput.length, afterInput.length) &&
    beforeInput[beforeInput.length - completeSuffix - 1] ===
      afterInput[afterInput.length - completeSuffix - 1]
  ) {
    completeSuffix += 1
  }
  const earliest = Math.max(
    0, beforeInput.length - completeSuffix - removedLength,
  )
  const ambiguous = earliest < prefix
    ? activeComposerPastes(before.text, before.pastes).filter((paste) => {
        const start = composerInputValue(before.text.slice(0, paste.start)).length
        const end = start + collapsedPasteLabel(paste).length
        const alwaysBefore = earliest >= end
        const alwaysAfter = prefix + removedLength <= start
        const alwaysRemoved =
          prefix <= start && earliest + removedLength >= end
        return !alwaysBefore && !alwaysAfter && !alwaysRemoved
      })
    : []
  const ambiguousKeys = new Set(ambiguous.map((paste) => paste.key))
  const edited = applyComposerEdit(
    {
      ...before,
      pastes: before.pastes.filter((paste) => !ambiguousKeys.has(paste.key)),
    },
    composerTextPosition(before.text, prefix),
    composerTextPosition(before.text, beforeInput.length - suffix),
    {
      text: after.slice(
        composerTextPosition(after, prefix),
        composerTextPosition(after, afterInput.length - suffix),
      ),
      pastes: [],
    },
  )
  return ambiguous.length ? {
    ...edited,
    unresolvedPastes: ambiguous.map(({ start: _start, ...paste }) => paste),
  } : edited
}

export function composerInputValue(text: string): string {
  return text.replace(/\r\n|\r/g, '\n')
}

export function composerTextPosition(text: string, inputPosition: number): number {
  let position = 0
  for (
    let input = 0;
    input < inputPosition && position < text.length;
    input += 1
  ) {
    position +=
      text[position] === '\r' && text[position + 1] === '\n' ? 2 : 1
  }
  return position
}

export function applyComposerEdit(
  before: ComposerContent,
  start: number,
  end: number,
  inserted: ComposerContent,
): ComposerEdit {
  const partial = activeComposerPastes(before.text, before.pastes).filter(
    (paste) => {
      const pasteEnd = paste.start + collapsedPasteLabel(paste).length
      return start === end
        ? start > paste.start && start < pasteEnd
        : start < pasteEnd && end > paste.start &&
            !(start <= paste.start && end >= pasteEnd)
    },
  )
  let from = start
  let to = end
  for (const paste of partial) {
    const pasteEnd = paste.start + collapsedPasteLabel(paste).length
    if (start > paste.start && start < pasteEnd) {
      from = pasteEnd
    }
    if (end > paste.start && end < pasteEnd) {
      to = paste.start
    }
  }
  to = Math.max(from, to)
  const position = (offset: number) => offset + partial.reduce(
    (shift, paste) =>
      paste.start + collapsedPasteLabel(paste).length <= offset
        ? shift + paste.content.length - collapsedPasteLabel(paste).length
        : shift,
    0,
  )
  const expanded = expandComposerPastes(before.text, partial)
  const partialKeys = new Set(partial.map((paste) => paste.key))
  const retained = before.pastes
    .filter((paste) => !partialKeys.has(paste.key))
    .map((paste) => ({ ...paste, start: position(paste.start) }))
  const fromExpanded = position(from)
  const toExpanded = position(to)
  return {
    content: {
      text: expanded.slice(0, fromExpanded) +
        inserted.text +
        expanded.slice(toExpanded),
      pastes: [
        ...composerPastesAfterRangeEdit(
          retained, fromExpanded, toExpanded, inserted.text.length,
        ),
        ...inserted.pastes.map((paste) => ({
          ...paste, start: paste.start + fromExpanded,
        })),
      ],
    },
    cursor: fromExpanded + inserted.text.length,
  }
}

function composerPastesAfterRangeEdit(
  pastes: CollapsedPaste[],
  start: number,
  end: number,
  insertedLength: number,
): CollapsedPaste[] {
  const delta = insertedLength - (end - start)
  return pastes.flatMap((paste) => {
    const pasteEnd = paste.start + collapsedPasteLabel(paste).length
    if (pasteEnd <= start) {
      return [paste]
    }
    if (paste.start >= end) {
      return [{ ...paste, start: paste.start + delta }]
    }
    return []
  })
}
