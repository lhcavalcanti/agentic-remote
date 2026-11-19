// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ComposerActions } from './ComposerActions'
import { ContextRing } from './ContextRing'

vi.mock('../preview-features', () => ({ usePreviewFeature: () => true }))
afterEach(cleanup)

const props = (): ComponentProps<typeof ComposerActions> => ({
  selected: { id: 'one', computerId: 'studio', computerName: 'Studio', status: 'running' } as ComponentProps<typeof ComposerActions>['selected'],
  selectedComputerOnline: true, selectedQueueAvailable: true, foregroundTurnActive: true, supportsQueuedPromptDispatch: true,
  recording: false, recordingSeconds: 0, askingAside: false, sideQuestionPending: false, phoneEnterCreatesNewline: false,
  cancelling: false, transcribing: false, uploadingFile: false, composer: 'Draft', expandedComposer: 'Draft',
  sending: false, queuedEditUnconfirmed: false, recordingDuration: String,
  onStopRecording: vi.fn(), onSubmitSideQuestion: vi.fn(), onStopSession: vi.fn(),
  onOpenAttachmentInput: vi.fn(), onStartRecording: vi.fn(), onSubmitMessage: vi.fn(),
  onOpenRuntime: vi.fn(), sessionActions: [{ label: 'Skills', onClick: vi.fn() }],
  onRecallSentMessage: vi.fn(), onCancelSentMessage: vi.fn(),
  providerCapability: { id: 'copilot', name: 'Copilot', available: true, terminalBacked: true, supportsSteering: true },
  onUseSentMessage: vi.fn(() => true),
})

describe('refreshed composer actions', () => {
  it.each([undefined, false, true])('sends a new prompt directly when only background work remains (steering: %s)', (supportsSteering) => {
    const callbacks = {
      ...props(), foregroundTurnActive: false,
      providerCapability: { ...props().providerCapability!, supportsSteering },
    }
    render(<ComposerActions {...callbacks} />)
    const send = screen.getByRole('button', { name: 'Send message' })
    expect(send).toBeEnabled()
    expect(send).toHaveAttribute('title', 'Send immediately (Enter)')
    expect(screen.queryByRole('button', { name: 'Send options' })).not.toBeInTheDocument()
    fireEvent.click(send)
    expect(callbacks.onSubmitMessage).toHaveBeenCalledExactlyOnceWith()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('keeps Enter out of the busy choice tooltip, because Enter steers instead of offering the choice', () => {
    render(<ComposerActions {...props()} />)
    expect(screen.getByRole('button', { name: 'Send message' })).toHaveAttribute('title', 'Choose Steer or Queue')
    expect(screen.getByRole('button', { name: 'Queue message' }))
      .toHaveAttribute('title', 'Queue for later delivery (Ctrl/⌘+Enter)')
  })

  it('sends an expanded multiline slash command without offering delivery choices', () => {
    const callbacks = {
      ...props(),
      composer: '[Paste #1 - 22 lines]',
      expandedComposer: ['/review', ...Array.from({ length: 21 }, () => 'Review detail')].join('\n'),
    }
    render(<ComposerActions {...callbacks} />)
    expect(screen.queryByRole('button', { name: 'Send options' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    expect(callbacks.onSubmitMessage).toHaveBeenCalledExactlyOnceWith()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it.each([false, true])('closes history only after committing Use message (saved=%s)', (saved) => {
    const callbacks = props()
    callbacks.selected = { ...callbacks.selected, messages: [{
      id: 'sent', role: 'user', content: 'A chosen prompt', deliveryConfirmed: true, createdAt: '2026-11-14T12:00:00Z',
    }] }
    callbacks.onUseSentMessage = vi.fn(() => saved)
    render(<ComposerActions {...callbacks} />)
    fireEvent.click(screen.getByRole('button', { name: 'Sent messages' }))
    fireEvent.click(screen.getByRole('option'))
    fireEvent.click(screen.getByRole('button', { name: 'Use message' }))
    expect(callbacks.onUseSentMessage).toHaveBeenCalledOnce()
    expect(callbacks.onCancelSentMessage).not.toHaveBeenCalled()
    expect(Boolean(screen.queryByRole('dialog', { name: 'Sent messages' }))).toBe(!saved)
  })
  it('reuses attachment, microphone, setup, queue, send and stop handlers', () => {
    const callbacks = props()
    render(<ComposerActions {...callbacks} />)
    for (const [label, handler] of [
      ['Attach file or audio recording', callbacks.onOpenAttachmentInput],
      ['Start microphone recording', callbacks.onStartRecording],
      ['Session setup', callbacks.onOpenRuntime],
      ['Stop response', callbacks.onStopSession],
    ] as const) {
      fireEvent.click(screen.getByRole('button', { name: label }))
      expect(handler).toHaveBeenCalledOnce()
    }
    fireEvent.click(screen.getByRole('button', { name: 'Queue message' }))
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    expect(vi.mocked(callbacks.onSubmitMessage).mock.calls).toEqual([[true]])
    fireEvent.click(screen.getByRole('menuitem', { name: 'Steer — guide the active turn' }))
    expect(vi.mocked(callbacks.onSubmitMessage).mock.calls).toEqual([[true], [false]])
  })

  it('opens the session panel and keeps its existing action callbacks', () => {
    const callbacks = props()
    render(<ComposerActions {...callbacks} />)
    const trigger = screen.getByRole('button', { name: 'Session panel' })
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Skills' }))
    expect(callbacks.sessionActions![0].onClick).toHaveBeenCalledOnce()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)
    fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(trigger).toHaveFocus()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('context usage ring', () => {
  it.each([false, true])('labels actual context usage (estimated: %s)', (contextEstimated) => {
    render(<ContextRing runtime={{ contextTokens: 25, contextTokenLimit: 100, contextEstimated }} onOpen={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAccessibleName('Context: 25% used')
    expect(screen.getByRole('button')).toHaveAccessibleDescription(contextEstimated
      ? 'Estimated context usage; not plan usage' : 'Measured context usage; not plan usage')
  })

  it('does not present missing context as zero usage', () => {
    const { rerender } = render(<ContextRing onOpen={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAccessibleName('Context: usage unavailable')
    expect(screen.getByText('?')).toBeVisible()
    rerender(<ContextRing runtime={{ contextTokens: 0, contextTokenLimit: 100 }} onOpen={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAccessibleName('Context: 0% used')
    expect(screen.queryByText('?')).not.toBeInTheDocument()
  })
})
