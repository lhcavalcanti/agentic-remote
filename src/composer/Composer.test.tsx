// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Composer } from './Composer'
import type { ComposerProps } from './types'

afterEach(cleanup)

const props = (overrides: Partial<ComposerProps> = {}): ComposerProps => ({
  selected: {
    id: 'one', computerId: 'studio', computerName: 'Studio', provider: 'copilot', status: 'idle', messages: [],
    cwd: '/home/demo/field-notes', title: 'Synthetic session', updatedAt: '2026-11-19T12:02:00Z',
    queuedCount: 2,
    queuedPrompts: [
      { id: 'first', content: 'Check the notes.', createdAt: '2026-11-19T12:00:00Z' },
      { id: 'second', content: 'Then check the links.', createdAt: '2026-11-19T12:01:00Z' },
    ],
  },
  selectedRetained: false, selectedQueueHeadIsSteering: false, selectedQueueAvailable: true,
  foregroundTurnActive: false, selectedComputerOnline: true, supportsQueuedPromptDispatch: false,
  sending: false, queuedEditUnconfirmed: false, composer: 'Draft', expandedComposer: 'Draft',
  uploadingFile: false, transcribing: false, deliveryUncertain: false, acceptanceReceiptMissing: false,
  missingAcceptanceOwners: [], askingAside: false, sideQuestionPanel: null, sideQuestionHasEntries: false,
  sideQuestionPending: false, showCommandMenu: false, commandSuggestions: [], selectedCommandIndex: 0,
  selectedAttachments: [], recording: false, recordingSeconds: 0, cancelling: false,
  composerDraftRecovered: false,
  statusline: {
    enabled: false, computer: false, provider: false, path: false, status: false, queue: false,
    backgroundTasks: false, sessionId: false, model: false, effort: false, contextTier: false,
    contextUsage: false, mode: false, permissions: false, update: false,
  },
  phoneEnterCreatesNewline: false, composerRef: createRef(), audioInputRef: createRef(), sensors: undefined,
  attachmentSize: String, recordingDuration: (seconds) => `0:${String(seconds).padStart(2, '0')}`,
  compactTokens: String, onQueueDragEnd: vi.fn(), onEditQueuedPrompt: vi.fn(), onRemoveQueuedPrompt: vi.fn(),
  onDiscardUnconfirmed: vi.fn(), onSaveQueuedPromptEdit: vi.fn(), onCancelQueuedPromptEdit: vi.fn(),
  onDragOver: vi.fn(), onDrop: vi.fn(), onSelectCommand: vi.fn(), onRetryAttachment: vi.fn(),
  onRemoveAttachment: vi.fn(), onBeforeInput: vi.fn(), onCut: vi.fn(), onChange: vi.fn(), onKeyDown: vi.fn(),
  onPaste: vi.fn(), onFileChange: vi.fn(), onStopRecording: vi.fn(), onSubmitSideQuestion: vi.fn(),
  onStopSession: vi.fn(), onOpenAttachmentInput: vi.fn(), onStartRecording: vi.fn(), onSubmitMessage: vi.fn(),
  onOpenRuntime: vi.fn(), onRecallSentMessage: vi.fn(), onCancelSentMessage: vi.fn(),
  onUseSentMessage: vi.fn(() => true),
  ...overrides,
})

// The stylesheet shows one variant of the line per pointer; read it the same way.
function line(container: HTMLElement) {
  const element = container.querySelector('.composer-hint')
  if (!element) return null
  const showing = (hidden: string) => {
    const copy = element.cloneNode(true) as HTMLElement
    copy.querySelectorAll(hidden).forEach((variant) => variant.remove())
    return copy.textContent
  }
  return { desktop: showing('.composer-hint__mobile'), phone: showing('.composer-hint__desktop') }
}

describe('line below the composer', () => {
  it.each([false, true])('is not shown while idle, even with queued messages (phone Enter newline: %s)', (phoneEnterCreatesNewline) => {
    const { container } = render(<Composer {...props({ phoneEnterCreatesNewline })} />)
    expect(line(container)).toBeNull()
  })

  it.each([
    { state: 'recording', overrides: { recording: true, recordingSeconds: 7 },
      desktop: 'Recording 0:07…', phone: 'Recording 0:07…' },
    { state: 'transcribing', overrides: { transcribing: true },
      desktop: 'Transcribing audio…', phone: 'Transcribing audio…' },
    { state: 'uploading a file', overrides: { uploadingFile: true },
      desktop: 'Uploading file…', phone: 'Uploading file…' },
    { state: 'asking aside', overrides: { askingAside: true, sideQuestionDraft: '' },
      desktop: 'Enter asks · Shift+Enter newline · Esc back to your message', phone: 'Tap Ask · Return adds a line' },
    { state: 'a side question is answered', overrides: { askingAside: true, sideQuestionDraft: '', sideQuestionPending: true },
      desktop: 'Answering… you can type your follow-up · Esc back to your message',
      phone: 'Answering… you can type your follow-up' },
    { state: 'editing a queued message', overrides: { editingQueuedPromptId: 'first' },
      desktop: 'Enter saves it back · Shift+Enter newline · Esc leaves it as it was',
      phone: 'Tap Save to put it back · Return adds a line' },
    { state: 'editing a queued message that can be sent now',
      overrides: { editingQueuedPromptId: 'first', supportsQueuedPromptDispatch: true },
      desktop: 'Enter saves it back · ↑ sends this queued edit now · Esc leaves it as it was',
      phone: 'Save keeps its place · ↑ sends this queued edit now · Return adds a line' },
  ])('explains the state while $state, without a queued count', ({ overrides, desktop, phone }) => {
    const { container } = render(<Composer {...props(overrides)} />)
    expect(line(container)).toEqual({ desktop, phone })
  })
})

describe('send and queue tooltips', () => {
  it.each([
    { phoneEnterCreatesNewline: false, foregroundTurnActive: false,
      send: 'Send immediately (Enter)', queue: 'Queue for later delivery (Ctrl/⌘+Enter)' },
    { phoneEnterCreatesNewline: false, foregroundTurnActive: true,
      send: 'Send into the current response (Enter)', queue: 'Queue for later delivery (Ctrl/⌘+Enter)' },
    { phoneEnterCreatesNewline: true, foregroundTurnActive: false,
      send: 'Send immediately', queue: 'Queue for later delivery' },
    { phoneEnterCreatesNewline: true, foregroundTurnActive: true,
      send: 'Send into the current response', queue: 'Queue for later delivery' },
  ])('name shortcuts only where Enter sends (phone Enter newline: $phoneEnterCreatesNewline, busy: $foregroundTurnActive)',
    ({ phoneEnterCreatesNewline, foregroundTurnActive, send, queue }) => {
      render(<Composer {...props({ phoneEnterCreatesNewline, foregroundTurnActive })} />)
      expect(screen.getByRole('button', { name: 'Send message' })).toHaveAttribute('title', send)
      expect(screen.getByRole('button', { name: 'Queue message' })).toHaveAttribute('title', queue)
    })
})
