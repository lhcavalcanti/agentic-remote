// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { useRef, useState } from 'react'
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ManagerAttachment, ManagerEvent, ManagerMessage, ManagerSnapshot } from '../shared/manager'
import { formatProactivePrompt } from '../shared/manager-automatic'
import type { VoiceCapabilities } from '../shared/oracle-voice'
import {
  cancelManager,
  editQueuedManagerMessage,
  getManager,
  removeQueuedManagerMessage,
  resetManager,
  resolveManagerConfirmation,
  retryManagerMessage,
  sendManagerMessage,
  transcribeAudio,
  uploadManagerFile,
  removeManagerFile,
} from './api'
import { ManagerAssistant, OracleButton } from './ManagerAssistant'
import type { OracleControl, OracleIndicator } from './ManagerAssistant'
import { sessionLinkTarget } from './manager-links'
import { authoritativeRefresh } from './OracleDreamer'
import { useOracleConversation } from './use-oracle-conversation'
import type { OracleConversation } from './use-oracle-conversation'
import { useOracleAttachments } from './use-oracle-attachments'
import { HubSignInExpiredError } from './hub-sign-in'

vi.mock('./api', () => ({
  getManager: vi.fn(),
  editQueuedManagerMessage: vi.fn(),
  transcribeAudio: vi.fn(),
  sendManagerMessage: vi.fn(),
  retryManagerMessage: vi.fn(),
  resolveManagerConfirmation: vi.fn(),
  removeQueuedManagerMessage: vi.fn(),
  cancelManager: vi.fn(),
  resetManager: vi.fn(),
  uploadManagerFile: vi.fn(),
  removeManagerFile: vi.fn(),
}))

// Live dictation is off unless a test turns it on, so the mic records and
// uploads as before.
const liveDictationFake = vi.hoisted(() => ({
  capabilities: undefined as undefined | { live: boolean; reason?: string; computerName: string },
  clients: [] as Array<{
    callbacks: {
      onText(state: { committed: string; tentative: string }): void
      onFinal(text: string): void
      onError(error: { code: string; message: string; fatal: boolean }): void
      onInterrupted?(reason: string): void
    }
    start: ReturnType<typeof vi.fn>
    stop: ReturnType<typeof vi.fn>
    cancel: ReturnType<typeof vi.fn>
  }>,
}))

vi.mock('./dictation/live-dictation-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./dictation/live-dictation-client')>()
  class FakeLiveDictationClient {
    readonly start = vi.fn(async () => undefined)
    readonly stop = vi.fn(async () => undefined)
    readonly cancel = vi.fn()
    readonly callbacks: (typeof liveDictationFake.clients)[number]['callbacks']

    constructor(callbacks: (typeof liveDictationFake.clients)[number]['callbacks']) {
      this.callbacks = callbacks
      liveDictationFake.clients.push(this)
    }
  }
  return {
    ...actual,
    fetchDictationCapabilities: vi.fn(async () => liveDictationFake.capabilities ?? {
      live: false,
      reason: 'Live dictation needs the Parakeet engine on Development',
      computerName: 'Development',
    }),
    LiveDictationClient: FakeLiveDictationClient,
  }
})

vi.mock('./use-oracle-conversation', () => ({
  useOracleConversation: vi.fn(),
}))

vi.mock('./dreamer-api', async (importOriginal) => ({
  ...await importOriginal<typeof import('./dreamer-api')>(),
  getDreamer: vi.fn(async () => ({
    available: true, revision: 0, settings: { enabled: false, timeZone: 'UTC' },
  })),
}))

// Pass-through wrappers that record what rendered: every conversation row
// shows a MessageTime, and every answer parses its Markdown.
const rendered = vi.hoisted(() => ({ markdown: [] as string[], times: [] as string[] }))

vi.mock('react-markdown', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-markdown')>()
  const { createElement } = await import('react')
  return {
    ...actual,
    default: function CountedMarkdown(props: Parameters<typeof actual.default>[0]) {
      rendered.markdown.push(String(props.children))
      return createElement(actual.default, props)
    },
  }
})

vi.mock('./MessageTime', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./MessageTime')>()
  const { createElement } = await import('react')
  return {
    ...actual,
    MessageTime: function CountedMessageTime(props: Parameters<typeof actual.MessageTime>[0]) {
      if (props.value) rendered.times.push(props.value)
      return createElement(actual.MessageTime, props)
    },
  }
})

type Props = Parameters<typeof ManagerAssistant>[0]

/** The header button and the panel, wired the way App wires them. */
function Harness(props: Omit<Props, 'open' | 'onOpenChange' | 'onIndicatorChange' | 'controlRef'> & {
  onControl?: (control: OracleControl | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const [indicator, setIndicator] = useState<OracleIndicator>({ available: false, status: 'idle', unread: false, queued: 0 })
  const controlRef = useRef<OracleControl | undefined>(undefined)
  return (
    <>
      <button onClick={() => props.onControl?.(controlRef.current)} type="button">Expose control</button>
      <OracleButton indicator={indicator} onToggle={() => setOpen((current) => !current)} open={open} />
      <ManagerAssistant
        {...props}
        controlRef={controlRef}
        onIndicatorChange={setIndicator}
        onOpenChange={setOpen}
        open={open}
      />
    </>
  )
}

const conversationCapability: VoiceCapabilities = {
  protocol: 2,
  available: true,
  computerId: 'development',
  computerName: 'Development',
  sampleRate: 16_000,
  playbackSampleRate: 22_050,
  languages: ['en'],
  sttProfile: 'sherpa-streaming',
  ttsVoice: 'kitten-nano',
  resourceClass: 'low',
  limits: {
    maxFrameBytes: 64_000,
    maxQueueBytes: 256_000,
    maxUtteranceMs: 60_000,
  },
}

const startConversation = vi.fn(async () => undefined)
const stopConversation = vi.fn()

function conversationState(
  state: OracleConversation['state'] = 'off',
  overrides: Partial<OracleConversation> = {},
): OracleConversation {
  return {
    capability: conversationCapability,
    state,
    partial: '',
    ownsResources: state !== 'off' && state !== 'error',
    start: startConversation,
    stop: stopConversation,
    ...overrides,
  }
}

const empty: ManagerSnapshot = {
  available: true,
  status: 'idle',
  messages: [],
  queued: 0,
  managedSessions: [],
}

function setup(snapshot: ManagerSnapshot = empty, overrides: Partial<Parameters<typeof Harness>[0]> = {}) {
  vi.mocked(getManager).mockResolvedValue(snapshot)
  const listeners = new Set<(event: ManagerEvent) => void>()
  const onOpenSession = vi.fn(() => true)
  const onOpenSettings = vi.fn()
  const props = {
    connectionEpoch: 1,
    subscribe: (listener: (event: ManagerEvent) => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    defaults: { computerId: 'hub', mode: 'autopilot' as const },
    openSessions: 3,
    onOpenSession,
    onOpenSettings,
    ...overrides,
  }
  const view = render(<Harness {...props} />)
  const emit = (event: ManagerEvent) => act(() => {
    for (const listener of listeners) listener(event)
  })
  return {
    ...view,
    emit,
    props,
    onOpenSession,
    onOpenSettings,
  }
}

async function openPanel() {
  fireEvent.click(await screen.findByRole('button', { name: /^Oracle/ }))
  return screen.getByRole('dialog', { name: 'Oracle' })
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

describe('ManagerAssistant', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.mocked(getManager).mockReset()
    vi.mocked(uploadManagerFile).mockReset()
    vi.mocked(removeManagerFile).mockReset()
    vi.mocked(removeManagerFile).mockResolvedValue(undefined)
    vi.mocked(sendManagerMessage).mockReset()
    vi.mocked(retryManagerMessage).mockReset()
    vi.mocked(cancelManager).mockReset()
    vi.mocked(resetManager).mockReset()
    vi.mocked(removeQueuedManagerMessage).mockReset()
    vi.mocked(editQueuedManagerMessage).mockReset()
    vi.mocked(transcribeAudio).mockReset()
    vi.mocked(useOracleConversation).mockReset()
    vi.mocked(useOracleConversation).mockReturnValue(conversationState())
    startConversation.mockClear()
    stopConversation.mockClear()
    localStorage.clear()
  })

  it('does not take focus when the page loads', async () => {
    setup()
    await screen.findByRole('button', { name: 'Oracle' })
    await act(async () => undefined)
    expect(screen.getByRole('button', { name: 'Oracle' })).not.toHaveFocus()
  })

  it('keeps picker attachment order while uploads finish out of order and never auto-sends', async () => {
    let finishFirst!: (file: { id: string; name: string; size: number; mimeType: string }) => void
    vi.mocked(uploadManagerFile)
      .mockImplementationOnce(() => new Promise((resolve) => { finishFirst = resolve }))
      .mockResolvedValueOnce({ id: 'second', name: 'diagram.png', size: 3, mimeType: 'image/png' })
    vi.mocked(sendManagerMessage).mockResolvedValue({ id: 'queued', role: 'user', content: 'Compare', state: 'queued', createdAt: 't' })
    setup()
    await openPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Ask' }))
    fireEvent.change(screen.getByLabelText('Oracle attachments'), { target: { files: [
      new File(['one'], 'notes.md'), new File(['two'], 'diagram.png'),
    ] } })
    fireEvent.change(screen.getByRole('textbox', { name: 'Message Oracle' }), { target: { value: 'Compare' } })
    expect(await screen.findByText('diagram.png')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
    fireEvent.submit(screen.getByRole('textbox', { name: 'Message Oracle' }).closest('form')!)
    expect(sendManagerMessage).not.toHaveBeenCalled()
    await act(async () => finishFirst({ id: 'first', name: 'notes.md', size: 3, mimeType: 'text/markdown' }))
    const chips = within(screen.getByRole('list', { name: 'Oracle attachments to send' })).getAllByRole('listitem')
    expect(chips.map((chip) => within(chip).getByRole('strong').textContent)).toEqual(['notes.md', 'diagram.png'])
    expect(chips[0]).toHaveTextContent('3 B')
    expect(chips[0]).toHaveTextContent('Uploaded')
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendManagerMessage).toHaveBeenCalledWith('Compare', expect.anything(), { answerOnly: true, attachmentIds: ['first', 'second'] }))
    await waitFor(() => expect(screen.queryByRole('list', { name: 'Oracle attachments to send' })).not.toBeInTheDocument())
    expect(removeManagerFile).not.toHaveBeenCalled()
  })

  it('preserves paste and drop source order, retries failures and removes uploads', async () => {
    vi.mocked(uploadManagerFile)
      .mockRejectedValueOnce(new Error('Connection lost'))
      .mockResolvedValueOnce({ id: 'second', name: 'second.txt', size: 1, mimeType: 'text/plain' })
      .mockResolvedValueOnce({ id: 'third', name: 'third.txt', size: 1, mimeType: 'text/plain' })
      .mockResolvedValueOnce({ id: 'first', name: 'first.txt', size: 1, mimeType: 'text/plain' })
    setup()
    await openPanel()
    const first = new File(['1'], 'first.txt')
    const second = new File(['2'], 'second.txt')
    fireEvent.paste(screen.getByRole('textbox', { name: 'Message Oracle' }), {
      clipboardData: { items: [first, second].map((file) => ({ kind: 'file', getAsFile: () => file })) },
    })
    fireEvent.drop(screen.getByRole('textbox', { name: 'Message Oracle' }), {
      dataTransfer: { files: [new File(['3'], 'third.txt')] },
    })
    expect(await screen.findByText(/Connection lost/)).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Retry first.txt' }))
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Retry first.txt' })).not.toBeInTheDocument())
    const chips = within(screen.getByRole('list', { name: 'Oracle attachments to send' })).getAllByRole('listitem')
    expect(chips.map((chip) => chip.querySelector('strong')?.textContent)).toEqual(['first.txt', 'second.txt', 'third.txt'])
    fireEvent.click(screen.getByRole('button', { name: 'Remove second.txt' }))
    await waitFor(() => expect(removeManagerFile).toHaveBeenCalledWith('second'))
    expect(screen.queryByText('second.txt')).not.toBeInTheDocument()
    expect(sendManagerMessage).not.toHaveBeenCalled()
  })

  it('rejects unsupported and oversized files locally and cleans late removed uploads', async () => {
    let finish!: (file: { id: string; name: string; size: number; mimeType: string }) => void
    vi.mocked(uploadManagerFile).mockImplementation(() => new Promise((resolve) => { finish = resolve }))
    vi.mocked(sendManagerMessage).mockResolvedValue({
      id: 'sent', role: 'user', content: 'Text only after removal.', state: 'queued', createdAt: 't',
    })
    setup()
    await openPanel()
    fireEvent.change(screen.getByLabelText('Oracle attachments'), { target: { files: [
      new File(['binary'], 'archive.zip'),
      new File([new Uint8Array(1024 * 1024 + 1)], 'big.ts'),
      new File(['a'], 'pending.txt'),
    ] } })
    expect(await screen.findByText(/This file type is not supported/)).toBeVisible()
    expect(screen.getByText(/The file exceeds the 1 MiB limit/)).toBeVisible()
    expect(uploadManagerFile).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Remove archive.zip' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove big.ts' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove pending.txt' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Message Oracle' }), { target: { value: 'Text only after removal.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendManagerMessage).toHaveBeenCalledTimes(1))
    expect(vi.mocked(sendManagerMessage).mock.calls[0][2]).not.toHaveProperty('attachmentIds')
    await act(async () => finish({ id: 'late', name: 'pending.txt', size: 1, mimeType: 'text/plain' }))
    await waitFor(() => expect(removeManagerFile).toHaveBeenCalledWith('late'))
    expect(screen.queryByText('pending.txt')).not.toBeInTheDocument()
    expect(sendManagerMessage).toHaveBeenCalledTimes(1)
  })

  it('recovers uploaded references with the draft after remount without uploading again', async () => {
    vi.mocked(uploadManagerFile).mockResolvedValue({ id: 'saved', name: 'note.txt', size: 3, mimeType: 'text/plain' })
    const first = setup()
    await openPanel()
    fireEvent.change(screen.getByLabelText('Oracle attachments'), { target: { files: [new File(['abc'], 'note.txt')] } })
    await screen.findByText(/Uploaded/)
    first.unmount()
    setup()
    await openPanel()
    expect(screen.getByText('note.txt')).toBeVisible()
    expect(uploadManagerFile).toHaveBeenCalledTimes(1)
  })

  it('detaches a restored draft chip on 409 while keeping the message-owned attachment', async () => {
    const file = { id: 'owned', name: 'owned.txt', size: 3, mimeType: 'text/plain' }
    localStorage.setItem('agentic-remote:oracle-draft-v1', JSON.stringify({
      version: 1, draft: 'Accepted delivery whose response was lost', attachments: [file],
    }))
    vi.mocked(removeManagerFile).mockRejectedValue(Object.assign(new Error('This attachment belongs to an Oracle message.'), { statusCode: 409 }))
    setup({ ...empty, messages: [{
      id: 'accepted', role: 'user', content: 'Accepted delivery whose response was lost',
      state: 'done', createdAt: 't', attachments: [file],
    }] })
    await openPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Remove owned.txt' }))

    await waitFor(() => expect(screen.queryByRole('list', { name: 'Oracle attachments to send' })).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Send message' })).toBeEnabled()
    expect(screen.queryByText('Could not remove the upload. Try Remove again.')).not.toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: 'Attached files' })).getByText('owned.txt')).toBeVisible()
    expect(removeManagerFile).toHaveBeenCalledTimes(1)
    expect(JSON.parse(localStorage.getItem('agentic-remote:oracle-draft-v1')!)).not.toHaveProperty('attachments')
  })

  it.each([204, 404, 409, 503])('never submits a removing reference while DELETE %s is pending', async (statusCode) => {
    const remove = { id: 'remove', name: 'remove.txt', size: 3, mimeType: 'text/plain' }
    const keep = { id: 'keep', name: 'keep.txt', size: 3, mimeType: 'text/plain' }
    const pending = deferred<void>()
    let persistedAtDelete: unknown
    localStorage.setItem('agentic-remote:oracle-draft-v1', JSON.stringify({
      version: 1, draft: 'Only the remaining file.', attachments: [remove, keep],
    }))
    vi.mocked(removeManagerFile).mockImplementation(() => {
      persistedAtDelete = JSON.parse(localStorage.getItem('agentic-remote:oracle-draft-v1')!)
      return pending.promise
    })
    vi.mocked(sendManagerMessage).mockResolvedValue({
      id: 'sent', role: 'user', content: 'Only the remaining file.', state: 'queued', createdAt: 't', attachments: [keep],
    })
    setup()
    await openPanel()
    const input = screen.getByRole('textbox', { name: 'Message Oracle' })
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Remove remove.txt' }))
      fireEvent.submit(input.closest('form')!)
    })

    expect(sendManagerMessage).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Remove remove.txt' })).toBeDisabled()
    expect(screen.getByText(/Removing…/)).toBeVisible()
    expect(persistedAtDelete).toMatchObject({ attachments: [keep] })
    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true })
    expect(sendManagerMessage).not.toHaveBeenCalled()

    await act(async () => {
      if (statusCode === 204) pending.resolve(undefined)
      else pending.reject(Object.assign(new Error('Removal failed'), { statusCode }))
    })
    if (statusCode === 503) {
      expect(screen.getByText(/Could not remove the upload/)).toBeVisible()
      expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
      fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true })
      expect(sendManagerMessage).not.toHaveBeenCalled()
      expect(JSON.parse(localStorage.getItem('agentic-remote:oracle-draft-v1')!)).toMatchObject({ attachments: [keep] })
      vi.mocked(removeManagerFile).mockResolvedValueOnce(undefined)
      fireEvent.click(screen.getByRole('button', { name: 'Remove remove.txt' }))
      await waitFor(() => expect(screen.queryByRole('button', { name: 'Remove remove.txt' })).not.toBeInTheDocument())
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() => expect(sendManagerMessage).toHaveBeenCalledWith(
        'Only the remaining file.', expect.anything(), expect.objectContaining({ attachmentIds: ['keep'] }),
      ))
    } else {
      expect(screen.queryByRole('button', { name: 'Remove remove.txt' })).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() => expect(sendManagerMessage).toHaveBeenCalledWith(
        'Only the remaining file.', expect.anything(), expect.objectContaining({ attachmentIds: ['keep'] }),
      ))
    }
  })

  it('does not recover a removing reference or restore it after a remounted composer sends', async () => {
    const pending = deferred<void>()
    localStorage.setItem('agentic-remote:oracle-draft-v1', JSON.stringify({
      version: 1, draft: 'Send without the removed file.',
      attachments: [{ id: 'removed', name: 'removed.txt', size: 1, mimeType: 'text/plain' }],
    }))
    vi.mocked(removeManagerFile).mockReturnValue(pending.promise)
    vi.mocked(sendManagerMessage).mockResolvedValue({
      id: 'sent', role: 'user', content: 'Send without the removed file.', state: 'queued', createdAt: 't',
    })
    const first = setup()
    await openPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Remove removed.txt' }))
    first.unmount()
    setup()
    await openPanel()

    expect(screen.queryByText('removed.txt')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendManagerMessage).toHaveBeenCalledTimes(1))
    expect(vi.mocked(sendManagerMessage).mock.calls[0][2]).not.toHaveProperty('attachmentIds')
    await waitFor(() => expect(localStorage.getItem('agentic-remote:oracle-draft-v1')).toBeNull())
    await act(async () => pending.reject(Object.assign(new Error('Late removal failure'), { statusCode: 503 })))
    expect(screen.queryByText('removed.txt')).not.toBeInTheDocument()
    expect(localStorage.getItem('agentic-remote:oracle-draft-v1')).toBeNull()
  })

  it('makes a stalled or sign-in-expired removal actionable without reattaching it to Send', async () => {
    const actual = await vi.importActual<typeof import('./api')>('./api')
    vi.mocked(removeManagerFile).mockImplementation(actual.removeManagerFile)
    localStorage.setItem('agentic-remote:oracle-draft-v1', JSON.stringify({
      version: 1, draft: 'Keep my draft.',
      attachments: [{ id: 'stalled', name: 'stalled.txt', size: 1, mimeType: 'text/plain' }],
    }))
    setup()
    await openPanel()
    vi.stubGlobal('fetch', vi.fn((_path: string, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
    })))
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      fireEvent.click(screen.getByRole('button', { name: 'Remove stalled.txt' }))
      await act(async () => vi.advanceTimersByTimeAsync(15_000))
      expect(screen.getByRole('button', { name: 'Remove stalled.txt' })).toBeEnabled()
      expect(screen.queryByText(/Removing…/)).not.toBeInTheDocument()
      expect(screen.getByText(/Could not remove the upload/)).toBeVisible()
      expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
      expect(JSON.parse(localStorage.getItem('agentic-remote:oracle-draft-v1')!)).not.toHaveProperty('attachments')

      vi.mocked(removeManagerFile).mockRejectedValueOnce(new HubSignInExpiredError())
      fireEvent.click(screen.getByRole('button', { name: 'Remove stalled.txt' }))
      await act(async () => undefined)
      expect(screen.getByRole('button', { name: 'Remove stalled.txt' })).toBeEnabled()
      expect(screen.queryByText(/Removing…/)).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
      expect(sendManagerMessage).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
      vi.unstubAllGlobals()
    }
  })

  it('does not delete an uploaded file when durable detachment fails or storage is already blocked', async () => {
    const key = 'agentic-remote:oracle-draft-v1'
    localStorage.setItem(key, JSON.stringify({
      version: 1, draft: 'Keep this file until removal is saved.',
      attachments: [{ id: 'saved', name: 'saved.txt', size: 1, mimeType: 'text/plain' }],
    }))
    const first = setup()
    await openPanel()
    const saved = localStorage.getItem(key)
    const originalSetItem = Storage.prototype.setItem
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, name: string, value: string) {
      if (name === key) throw new Error('Storage is full')
      return originalSetItem.call(this, name, value)
    })
    try {
      fireEvent.click(screen.getByRole('button', { name: 'Remove saved.txt' }))
      await act(async () => undefined)
      expect(removeManagerFile).not.toHaveBeenCalled()
      expect(screen.getByText('saved.txt')).toBeVisible()
      expect(screen.getByRole('button', { name: 'Remove saved.txt' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
      expect(screen.getByRole('alert')).toHaveTextContent('Oracle could not save this draft')
      expect(localStorage.getItem(key)).toBe(saved)
      fireEvent.click(screen.getByRole('button', { name: 'Remove saved.txt' }))
      expect(removeManagerFile).not.toHaveBeenCalled()
    } finally {
      setItem.mockRestore()
    }

    first.unmount()
    setup()
    await openPanel()
    expect(screen.getByText('saved.txt')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Remove saved.txt' }))
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Remove saved.txt' })).not.toBeInTheDocument())
    expect(removeManagerFile).toHaveBeenCalledTimes(1)
  })

  it('keeps the file and an actionable error when detachment acknowledgement throws', async () => {
    const file = { id: 'saved', name: 'saved.txt', size: 1, mimeType: 'text/plain' }
    const { result } = renderHook(() => useOracleAttachments([file], () => { throw new Error('Storage failed') }))
    let failure: unknown
    await act(async () => {
      failure = await result.current.remove(result.current.files[0].key).catch((error: unknown) => error)
    })
    expect(failure).toBeUndefined()
    expect(removeManagerFile).not.toHaveBeenCalled()
    expect(result.current.files[0]).toMatchObject({ state: 'uploaded', reference: file, error: expect.any(String) })
    expect(result.current.forSubmission()).toBeUndefined()
  })

  it('coalesces repeated upload Retry actions and discards completion after Remove', async () => {
    const pending = deferred<ManagerAttachment>()
    vi.mocked(uploadManagerFile).mockRejectedValueOnce(new Error('Offline')).mockReturnValue(pending.promise)
    const { result } = renderHook(() => useOracleAttachments())
    act(() => result.current.intake([new File(['a'], 'retry.txt')]))
    await waitFor(() => expect(result.current.files[0].state).toBe('failed'))
    act(() => {
      result.current.retry(result.current.files[0].key)
      result.current.retry(result.current.files[0].key)
    })
    expect(uploadManagerFile).toHaveBeenCalledTimes(2)
    act(() => { void result.current.remove(result.current.files[0].key) })
    await act(async () => pending.resolve({ id: 'retried', name: 'retry.txt', size: 1, mimeType: 'text/plain' }))
    expect(result.current.files).toEqual([])
    expect(removeManagerFile).toHaveBeenCalledWith('retried')
  })

  it('shows stored attachments on queued edits and completed user messages', async () => {
    const file = { id: 'stored', name: 'report.pdf', size: 2048, mimeType: 'application/pdf' }
    setup({ ...empty, queued: 1, messages: [
      { id: 'queued', role: 'user', content: 'Waiting', createdAt: 't', state: 'queued', attachments: [file] },
      { id: 'done', role: 'user', content: 'Finished', createdAt: 't', state: 'done', attachments: [file] },
    ] })
    await openPanel()
    expect(screen.getAllByText('report.pdf')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Edit queued message: Waiting' }))
    expect(screen.getAllByText('report.pdf')).toHaveLength(2)
  })

  it('clears unsent attachments on Start over and cleans uploads that finish afterwards', async () => {
    let finish!: (file: { id: string; name: string; size: number; mimeType: string }) => void
    vi.mocked(uploadManagerFile).mockImplementation(() => new Promise((resolve) => { finish = resolve }))
    vi.mocked(resetManager).mockResolvedValue(empty)
    setup({ ...empty, messages: [{ id: 'old', role: 'assistant', content: 'Earlier', createdAt: 't' }] })
    await openPanel()
    fireEvent.change(screen.getByLabelText('Oracle attachments'), { target: { files: [new File(['a'], 'pending.txt')] } })
    fireEvent.click(screen.getByRole('button', { name: 'Start a new conversation' }))
    fireEvent.click(screen.getByRole('button', { name: 'Start over' }))
    await waitFor(() => expect(screen.queryByText('pending.txt')).not.toBeInTheDocument())
    await act(async () => finish({ id: 'late', name: 'pending.txt', size: 1, mimeType: 'text/plain' }))
    await waitFor(() => expect(removeManagerFile).toHaveBeenCalledWith('late'))
  })

  it('does not upload waiting files after unmount and retires only the in-flight uploads', async () => {
    const finishes: Array<(file: { id: string; name: string; size: number; mimeType: string }) => void> = []
    vi.mocked(uploadManagerFile).mockImplementation(() => new Promise((resolve) => { finishes.push(resolve) }))
    const view = setup()
    await openPanel()
    fireEvent.change(screen.getByLabelText('Oracle attachments'), { target: { files: ['one', 'two', 'three'].map((name) => new File(['a'], `${name}.txt`)) } })
    expect(uploadManagerFile).toHaveBeenCalledTimes(2)
    view.unmount()
    await act(async () => {
      finishes[0]({ id: 'one', name: 'one.txt', size: 1, mimeType: 'text/plain' })
      finishes[1]({ id: 'two', name: 'two.txt', size: 1, mimeType: 'text/plain' })
    })
    await waitFor(() => expect(removeManagerFile).toHaveBeenCalledTimes(2))
    expect(uploadManagerFile).toHaveBeenCalledTimes(2)
  })

  it('keeps the file-count limit enforced when a rejected chip is retried', async () => {
    vi.mocked(uploadManagerFile).mockImplementation(async (file) => ({ id: file.name, name: file.name, size: file.size, mimeType: 'text/plain' }))
    setup()
    await openPanel()
    fireEvent.change(screen.getByLabelText('Oracle attachments'), { target: { files: Array.from({ length: 21 }, (_, index) => new File(['a'], `${index}.txt`)) } })
    await waitFor(() => expect(uploadManagerFile).toHaveBeenCalledTimes(20))
    fireEvent.click(screen.getByRole('button', { name: 'Retry 20.txt' }))
    await act(async () => undefined)
    expect(uploadManagerFile).toHaveBeenCalledTimes(20)
    expect(screen.getByText(/Attach at most 20 files/)).toBeVisible()
  })

  it('offers no Oracle button when the hub has no Oracle', async () => {
    setup({ ...empty, available: false, unavailableReason: 'off' })
    await waitFor(() => expect(getManager).toHaveBeenCalled())
    expect(screen.queryByRole('button', { name: /^Oracle/ })).not.toBeInTheDocument()
  })

  it('offers no Oracle button, without breaking the page, when the snapshot cannot be read', async () => {
    vi.mocked(getManager).mockRejectedValueOnce(new Error('offline'))
    setup()
    await waitFor(() => expect(getManager).toHaveBeenCalled())
    await act(async () => undefined)
    expect(screen.queryByRole('button', { name: /^Oracle/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens from the header button and asks a suggestion as Ask only', async () => {
    vi.mocked(sendManagerMessage).mockResolvedValue({ id: 'm1', role: 'user', content: 'What is running right now?', createdAt: 't', state: 'queued', answerOnly: true })
    setup()
    const button = await screen.findByRole('button', { name: 'Oracle' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    await openPanel()
    expect(screen.getByRole('button', { name: 'Oracle' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Keeping track of 3 open sessions')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'What is running right now?' }))
    await waitFor(() => expect(sendManagerMessage).toHaveBeenCalledWith(
      'What is running right now?', { computerId: 'hub', mode: 'autopilot' }, { answerOnly: true },
    ))
    const queue = await screen.findByRole('region', { name: 'Queued for Oracle' })
    expect(queue).toHaveTextContent('What is running right now?')
    expect(queue).toHaveTextContent('Ask')
  })

  it('shows waiting messages in order, outside the conversation, and removes one on request', async () => {
    vi.mocked(removeQueuedManagerMessage).mockResolvedValue({
      id: 'q1', role: 'user', content: 'first waiting', createdAt: 't', updatedAt: '2026-10-15T00:00:09.000Z', state: 'cancelled',
    })

    setup({
      ...empty,
      status: 'working',
      queued: 2,
      messages: [
        { id: 'r0', role: 'user', content: 'being answered', createdAt: 't', state: 'running' },
        { id: 'q1', role: 'user', content: 'first waiting', createdAt: 't', updatedAt: '2026-10-15T00:00:01.000Z', state: 'queued' },
        { id: 'q2', role: 'user', content: 'second waiting', createdAt: 't', updatedAt: '2026-10-15T00:00:02.000Z', state: 'queued', answerOnly: true },
      ],
    })
    await openPanel()
    expect(screen.getByText('Working · 2 waiting')).toBeInTheDocument()
    const queue = screen.getByRole('region', { name: 'Queued for Oracle' })
    expect(queue).toHaveTextContent('2 waiting · answered in this order')
    const items = within(queue).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringMatching(/^1Number 1: first waiting/),
      expect.stringMatching(/^2Number 2: second waitingAsk$/),
    ])
    expect(within(screen.getByRole('list', { name: 'Oracle conversation' })).queryByText('first waiting')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Remove from the queue: first waiting' }))
    await waitFor(() => expect(removeQueuedManagerMessage).toHaveBeenCalledWith('q1'))
    await waitFor(() => expect(within(screen.getByRole('region', { name: 'Queued for Oracle' })).getAllByRole('listitem')).toHaveLength(1))
  })

  it('switches between Ask and Delegate, remembers it, and sends with it', async () => {
    vi.mocked(sendManagerMessage).mockResolvedValue({ id: 'm1', role: 'user', content: 'x', createdAt: 't', state: 'queued' })
    setup()
    await openPanel()
    const mode = screen.getByRole('group', { name: 'Oracle mode' })
    const ask = within(mode).getByRole('button', { name: 'Ask' })
    const delegate = within(mode).getByRole('button', { name: 'Delegate' })
    expect(ask).toHaveAttribute('aria-pressed', 'false')
    expect(delegate).toHaveAttribute('aria-pressed', 'true')
    expect(mode).toHaveAccessibleDescription('Can start and steer sessions')
    fireEvent.click(ask)
    expect(ask).toHaveAttribute('aria-pressed', 'true')
    expect(delegate).toHaveAttribute('aria-pressed', 'false')
    expect(mode).toHaveAccessibleDescription('Running work is left alone')
    expect(localStorage.getItem('agentic-remote:oracle-answer-only')).toBe('true')
    const input = screen.getByRole('textbox', { name: 'Message Oracle' })
    expect(input).toHaveAttribute('placeholder', 'Ask me anything')
    fireEvent.change(input, { target: { value: 'Just tell me' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendManagerMessage).toHaveBeenCalledWith('Just tell me', expect.anything(), { answerOnly: true }))
    cleanup()
    setup()
    await openPanel()
    expect(screen.getByRole('button', { name: 'Ask', pressed: true })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Delegate' }))
    expect(localStorage.getItem('agentic-remote:oracle-answer-only')).toBe('false')
  })

  it('queues an Ask only question while Oracle is busy, without stopping anything', async () => {
    localStorage.setItem('agentic-remote:oracle-answer-only', 'true')
    vi.mocked(sendManagerMessage).mockResolvedValue({ id: 'q9', role: 'user', content: 'How is the docs work going?', createdAt: 't', updatedAt: '2026-10-15T00:00:09.000Z', state: 'queued', answerOnly: true })
    setup({
      ...empty,
      status: 'working',
      messages: [{ id: 'r0', role: 'user', content: 'Start the docs work', createdAt: 't', state: 'running' }],
    })
    await openPanel()
    const input = screen.getByRole('textbox', { name: 'Message Oracle' })
    // The field invites a question; that it will wait is said beside it.
    expect(input).toHaveAttribute('placeholder', 'Ask me anything')
    expect(screen.getByText('Oracle is answering; anything you send now waits its turn.')).toBeInTheDocument()
    fireEvent.change(input, { target: { value: 'How is the docs work going?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Queue message' }))
    await waitFor(() => expect(sendManagerMessage).toHaveBeenCalledWith(
      'How is the docs work going?', expect.anything(), { answerOnly: true },
    ))
    const queue = await screen.findByRole('region', { name: 'Queued for Oracle' })
    expect(within(queue).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      expect.stringMatching(/^1Number 1: How is the docs work going\?Ask$/),
    ])
    expect(cancelManager).not.toHaveBeenCalled()
  })

  it('shows the model and opens App settings to change it', async () => {
    const { onOpenSettings } = setup({ ...empty, settings: { model: 'gpt-6-sol', reasoningEffort: 'high', defaultModel: 'hub-default' } })
    await openPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Oracle model: gpt-6-sol · high. Change it in App settings' }))
    expect(onOpenSettings).toHaveBeenCalled()
  })

  it('says when the chosen model could not start', async () => {
    setup({ ...empty, settings: { model: 'missing', modelUnavailable: true } })
    await openPanel()
    expect(screen.getByText(/missing could not start, so Copilot’s default model is answering/)).toBeInTheDocument()
  })

  it('takes a prompt from elsewhere in the app, opening the panel', async () => {
    vi.mocked(sendManagerMessage).mockResolvedValue({ id: 'm1', role: 'user', content: 'From /oracle', createdAt: 't', state: 'queued', answerOnly: true })
    let control: OracleControl | undefined
    setup(empty, { onControl: (value) => { control = value } })
    await screen.findByRole('button', { name: 'Oracle' })
    fireEvent.click(screen.getByRole('button', { name: 'Expose control' }))
    await act(async () => control!.ask('From /oracle', { answerOnly: true }))
    expect(screen.getByRole('dialog', { name: 'Oracle' })).toBeInTheDocument()
    expect(sendManagerMessage).toHaveBeenCalledWith('From /oracle', expect.anything(), { answerOnly: true })
  })

  it('sends on Return at a desk, queues while working, and clears the draft only once accepted', async () => {
    let accept!: (value: Awaited<ReturnType<typeof sendManagerMessage>>) => void
    vi.mocked(sendManagerMessage).mockReturnValue(new Promise((resolve) => { accept = resolve }))
    setup({ ...empty, status: 'working' })
    await openPanel()
    const input = screen.getByRole('textbox', { name: 'Message Oracle' })
    expect(screen.getByRole('button', { name: 'Queue message' })).toBeDisabled()
    fireEvent.change(input, { target: { value: 'Also check the tests' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(sendManagerMessage).toHaveBeenCalledWith('Also check the tests', expect.anything(), { answerOnly: false })
    expect(input).toHaveValue('Also check the tests')
    await act(async () => accept({ id: 'm2', role: 'user', content: 'Also check the tests', createdAt: 't', state: 'queued' }))
    expect(input).toHaveValue('')
    expect(localStorage.getItem('agentic-remote:oracle-draft-v1')).toBeNull()

    fireEvent.change(input, { target: { value: 'line one' } })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
    expect(sendManagerMessage).toHaveBeenCalledTimes(1)
  })

  it('keeps visible text and reports when browser storage cannot save it', async () => {
    const originalSetItem = Storage.prototype.setItem
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
      function (this: Storage, key, value) {
        if (key === 'agentic-remote:oracle-draft-v1') {
          throw new DOMException('Quota exceeded', 'QuotaExceededError')
        }
        return originalSetItem.call(this, key, value)
      },
    )
    try {
      setup()
      await openPanel()
      const input = screen.getByRole('textbox', { name: 'Message Oracle' })
      fireEvent.change(input, { target: { value: 'Do not lose this' } })
      expect(input).toHaveValue('Do not lose this')
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Oracle could not save this draft on this device',
      )
    } finally {
      setItem.mockRestore()
    }
  })

  it.each([
    ['corrupt', '{"version":'],
    ['future-version', JSON.stringify({ version: 2, draft: 'Do not replace these bytes' })],
  ])('does not overwrite %s saved Oracle draft bytes after typing', async (_kind, stored) => {
    localStorage.setItem('agentic-remote:oracle-draft-v1', stored)
    setup()
    await openPanel()

    const input = screen.getByRole('textbox', { name: 'Message Oracle' })
    fireEvent.change(input, { target: { value: 'New visible text' } })

    expect(input).toHaveValue('New visible text')
    expect(localStorage.getItem('agentic-remote:oracle-draft-v1')).toBe(stored)
    expect(screen.getByRole('alert')).toHaveTextContent(
      /saved Oracle draft|access saved drafts/,
    )
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
  })

  it('does not make an accepted message silently resendable when its saved copy cannot clear', async () => {
    vi.mocked(sendManagerMessage).mockResolvedValue({
      id: 'm1',
      role: 'user',
      content: 'Accepted once',
      createdAt: 't',
      state: 'queued',
    })
    setup()
    await openPanel()
    const input = screen.getByRole('textbox', { name: 'Message Oracle' })
    fireEvent.change(input, { target: { value: 'Accepted once' } })
    const originalRemoveItem = Storage.prototype.removeItem
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(
      function (this: Storage, key) {
        if (key === 'agentic-remote:oracle-draft-v1') {
          throw new DOMException('Storage unavailable', 'SecurityError')
        }
        return originalRemoveItem.call(this, key)
      },
    )
    try {
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() => expect(sendManagerMessage).toHaveBeenCalledTimes(1))
      expect(input).toHaveValue('Accepted once')
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Oracle could not save this draft on this device',
      )
      expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
    } finally {
      removeItem.mockRestore()
    }
  })

  it('keeps a newer update when the send response arrives after it', async () => {
    let accept!: (value: Awaited<ReturnType<typeof sendManagerMessage>>) => void
    vi.mocked(sendManagerMessage).mockReturnValue(new Promise((resolve) => { accept = resolve }))
    const { emit } = setup()
    await openPanel()
    fireEvent.change(screen.getByRole('textbox', { name: 'Message Oracle' }), { target: { value: 'status?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    emit({ type: 'manager.message', message: { id: 'm1', role: 'user', content: 'status?', createdAt: '2026-10-15T00:00:00.000Z', updatedAt: '2026-10-15T00:00:00.050Z', state: 'running' } })
    await act(async () => accept({ id: 'm1', role: 'user', content: 'status?', createdAt: '2026-10-15T00:00:00.000Z', updatedAt: '2026-10-15T00:00:00.000Z', state: 'queued' }))
    expect(screen.queryByRole('region', { name: 'Queued for Oracle' })).not.toBeInTheDocument()
    expect(screen.getByText('status?')).toBeInTheDocument()
  })

  it('keeps the draft and says why when sending fails', async () => {
    vi.mocked(sendManagerMessage).mockRejectedValue(new Error('Messages are limited to 100,000 characters.'))
    setup()
    await openPanel()
    const input = screen.getByRole('textbox', { name: 'Message Oracle' })
    fireEvent.change(input, { target: { value: 'hello' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Messages are limited')
    expect(input).toHaveValue('hello')
  })

  it('restores a saved Oracle draft after a remount without sending it', async () => {
    const first = setup()
    await openPanel()
    fireEvent.change(screen.getByRole('textbox', { name: 'Message Oracle' }), {
      target: { value: 'Keep this Oracle draft' },
    })
    expect(screen.queryByText('Saved on this device')).not.toBeInTheDocument()
    first.unmount()

    setup()
    await openPanel()
    expect(screen.getByRole('textbox', { name: 'Message Oracle' }))
      .toHaveValue('Keep this Oracle draft')
    expect(screen.getByText('Recovered saved draft')).toBeInTheDocument()
    expect(sendManagerMessage).not.toHaveBeenCalled()
  })

  it('streams a reply, then shows the stored one and marks it unread while closed', async () => {
    const { emit } = setup({ ...empty, status: 'working', messages: [{ id: 'u1', role: 'user', content: 'status?', createdAt: 't', state: 'running' }] })
    await openPanel()
    expect(screen.getByText('Thinking…')).toBeInTheDocument()
    emit({ type: 'manager.delta', messageId: 'r1', content: 'Two sessions are' })
    expect(screen.getByText('Two sessions are')).toBeInTheDocument()
    emit({ type: 'manager.message', message: { id: 'r1', role: 'assistant', content: 'Two sessions are running.', createdAt: 't' } })
    expect(screen.getByText('Two sessions are running.')).toBeInTheDocument()
    expect(screen.queryByText('Two sessions are')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close Oracle' }))
    emit({ type: 'manager.message', message: { id: 'r2', role: 'assistant', content: 'Another', createdAt: 't' } })
    // Both states hold at once, so both are announced.
    expect(screen.getByRole('button', { name: 'Oracle, working, new reply' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Oracle, working, new reply' }))
    expect(screen.getByRole('button', { name: 'Oracle, working' })).toBeInTheDocument()
  })

  it('re-renders only the rows that changed while a reply streams or a message is typed', async () => {
    const at = (second: number) => `2026-11-12T01:00:0${second}.000Z`
    const history: ManagerMessage[] = [
      { id: 'u1', role: 'user', content: 'What is running?', createdAt: at(0), state: 'done' },
      {
        id: 'a1', role: 'activity', content: 'Started a session', createdAt: at(1),
        sessionRefs: [{ computerId: 'hub', sessionId: 's1', title: 'Build' }],
      },
      { id: 'r1', role: 'assistant', content: 'Two sessions are **running**.', createdAt: at(2) },
      {
        id: 'c1', role: 'activity', content: 'Close Build?', createdAt: at(3),
        confirmation: { kind: 'close-session', computerId: 'hub', sessionId: 's1', title: 'Build', state: 'pending' },
      },
      { id: 'u2', role: 'user', content: 'And the tests?', createdAt: at(4), state: 'running' },
    ]
    const { emit } = setup({ ...empty, status: 'working', messages: history })
    const panel = await openPanel()
    expect(within(panel).getByText('running')).toBeInTheDocument()
    rendered.markdown.length = 0
    rendered.times.length = 0

    emit({ type: 'manager.delta', messageId: 'r2', content: 'Checking' })
    emit({ type: 'manager.delta', messageId: 'r2', content: 'Checking the tests' })
    fireEvent.change(within(panel).getByRole('textbox', { name: 'Message Oracle' }), { target: { value: 'Also the docs' } })
    expect(within(panel).getByText('Checking the tests')).toBeInTheDocument()
    expect(rendered.markdown).toEqual(['Checking', 'Checking the tests'])
    expect(rendered.times).toEqual([])

    emit({ type: 'manager.message', message: { ...history[2], content: 'Three sessions are **running**.', updatedAt: at(5) } })
    expect(within(panel).getByText(/Three sessions are/)).toBeInTheDocument()
    expect(rendered.markdown).toEqual(['Checking', 'Checking the tests', 'Three sessions are **running**.'])
    expect(rendered.times).toEqual([at(2)])
  })

  it('keeps rows and their session links current when the app re-renders', async () => {
    const view = setup({
      ...empty,
      messages: [
        { id: 'r1', role: 'assistant', content: 'See [Build](?computer=hub&session=s1).', createdAt: '2026-11-12T01:00:00.000Z' },
        {
          id: 'a1', role: 'activity', content: 'Started a session', createdAt: '2026-11-12T01:00:01.000Z',
          sessionRefs: [{ computerId: 'hub', sessionId: 's1', title: 'Build' }],
        },
      ],
    })
    const panel = await openPanel()
    rendered.markdown.length = 0
    rendered.times.length = 0

    const onOpenSession = vi.fn<Props['onOpenSession']>(() => true)
    view.rerender(<Harness {...view.props} onOpenSession={onOpenSession} />)
    expect(rendered.markdown).toEqual([])
    expect(rendered.times).toEqual([])

    fireEvent.click(within(panel).getByRole('link', { name: 'Build' }))
    fireEvent.click(within(panel).getByRole('button', { name: 'Open Build' }))
    expect(onOpenSession.mock.calls.map(([ref]) => `${ref.computerId}:${ref.sessionId}`)).toEqual(['hub:s1', 'hub:s1'])
    expect(view.onOpenSession).not.toHaveBeenCalled()
  })

  it('keeps a /oracle question in Oracle when it cannot be sent', async () => {
    vi.mocked(sendManagerMessage).mockRejectedValue(new Error('Origin is not allowed.'))
    let control: OracleControl | undefined
    setup(empty, { onControl: (value) => { control = value } })
    await screen.findByRole('button', { name: 'Oracle' })
    fireEvent.click(screen.getByRole('button', { name: 'Expose control' }))
    await act(async () => control!.ask('What is riskiest?', { answerOnly: true }))
    expect(screen.getByRole('dialog', { name: 'Oracle' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Could not send to Oracle: Origin is not allowed. Your question is in the message bar to send again.',
    )
    expect(screen.getByRole('textbox', { name: 'Message Oracle' })).toHaveValue('What is riskiest?')
    expect(screen.getByRole('button', { name: 'Ask', pressed: true })).toBeInTheDocument()
  })

  it('renders cumulative real ManagerAgent deltas and replaces them with the stored assistant', async () => {
    const { emit } = setup({
      ...empty,
      status: 'working',
      messages: [{
        id: 'voice-user',
        role: 'user',
        content: 'Run the focused tests.',
        createdAt: 't',
        state: 'running',
      }],
    })
    await openPanel()
    const messageId = 'real-manager-reply'
    const snapshots = [
      'First stable sentence.',
      'First stable sentence. Second stable sentence.',
      'First stable sentence. Second stable sentence. Final stored suffix.',
    ]

    for (const content of snapshots) {
      emit({ type: 'manager.delta', messageId, content })
      expect(screen.getByText(content)).toBeInTheDocument()
    }
    emit({
      type: 'manager.message',
      message: {
        id: messageId,
        role: 'assistant',
        replyTo: 'voice-user',
        content: snapshots.at(-1)!,
        createdAt: 't2',
      },
    })

    expect(screen.getAllByText(snapshots.at(-1)!)).toHaveLength(1)
    expect(screen.queryByText(snapshots[1])).not.toBeInTheDocument()
  })

  it('tells the app why Oracle cannot take a message', async () => {
    const onIndicatorChange = vi.fn()
    vi.mocked(getManager).mockRejectedValueOnce(new Error('offline'))
    const props = {
      connectionEpoch: 1, subscribe: () => () => undefined, defaults: {}, openSessions: 0,
      open: false, onOpenChange: vi.fn(), onIndicatorChange, onOpenSession: vi.fn(() => true),
      onOpenSettings: vi.fn(),
    }
    const view = render(<ManagerAssistant {...props} />)
    await waitFor(() => expect(onIndicatorChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ available: false, unavailableReason: 'Oracle could not be reached: offline' }),
    ))
    vi.mocked(getManager).mockResolvedValueOnce({ ...empty, available: false, unavailableReason: 'Oracle is turned off.' })
    view.rerender(<ManagerAssistant {...props} connectionEpoch={2} />)
    await waitFor(() => expect(onIndicatorChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ available: false, unavailableReason: 'Oracle is turned off.' }),
    ))
  })

  it('keeps the previous Oracle snapshot visible when an authoritative refresh fails', async () => {
    const snapshot = {
      ...empty,
      messages: [{
        id: 'existing',
        role: 'assistant' as const,
        content: 'Authoritative Oracle state',
        createdAt: 't',
      }],
    }
    const view = setup(snapshot)
    await openPanel()
    vi.mocked(getManager).mockRejectedValueOnce(new Error('offline'))

    view.rerender(<Harness {...view.props} connectionEpoch={2} />)

    expect(await screen.findByRole('alert', { name: 'Oracle freshness' }))
      .toHaveTextContent('Oracle refresh failed: offline')
    expect(screen.getByText('Authoritative Oracle state')).toBeInTheDocument()
    vi.mocked(getManager).mockResolvedValueOnce(snapshot)
    fireEvent.click(screen.getByRole('button', { name: 'Retry Oracle refresh' }))
    await waitFor(() =>
      expect(screen.queryByRole('alert', { name: 'Oracle freshness' }))
        .not.toBeInTheDocument(),
    )
  })

  it('does not let an older refresh erase a newer Oracle socket event', async () => {
    let finishRefresh!: (value: ManagerSnapshot) => void
    const view = setup()
    await openPanel()
    vi.mocked(getManager).mockImplementationOnce(() => new Promise((resolve) => {
      finishRefresh = resolve
    }))

    window.dispatchEvent(new Event(authoritativeRefresh))
    await waitFor(() => expect(getManager).toHaveBeenCalledTimes(2))
    view.emit({
      type: 'manager.message',
      message: {
        id: 'new-reply',
        role: 'assistant',
        content: 'Newer socket reply',
        createdAt: '2026-10-31T09:00:00.000Z',
      },
    })
    expect(screen.getByText('Newer socket reply')).toBeInTheDocument()

    await act(async () => finishRefresh(empty))

    expect(screen.getByText('Newer socket reply')).toBeInTheDocument()
  })

  it('does not let an older refresh erase a newly accepted Oracle send', async () => {
    let finishRefresh!: (value: ManagerSnapshot) => void
    vi.mocked(sendManagerMessage).mockResolvedValue({
      id: 'accepted-send',
      role: 'user',
      content: 'Keep accepted send',
      createdAt: '2026-10-31T09:00:00.000Z',
      state: 'queued',
    })
    setup()
    await openPanel()
    vi.mocked(getManager).mockImplementationOnce(() => new Promise((resolve) => {
      finishRefresh = resolve
    }))
    window.dispatchEvent(new Event(authoritativeRefresh))
    await waitFor(() => expect(getManager).toHaveBeenCalledTimes(2))

    fireEvent.change(screen.getByRole('textbox', { name: 'Message Oracle' }), {
      target: { value: 'Keep accepted send' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await screen.findByText('Keep accepted send')

    await act(async () => finishRefresh(empty))

    expect(screen.getByText('Keep accepted send')).toBeInTheDocument()
  })

  it('keeps Oracle text across close, dock, and responsive overlay transitions', async () => {
    const onPlacementChange = vi.fn()
    const view = setup(empty, {
      placement: 'overlay',
      preferredPlacement: 'overlay',
      onPlacementChange,
    })
    await openPanel()
    const composer = screen.getByRole('textbox', { name: 'Message Oracle' })
    fireEvent.change(composer, { target: { value: 'Keep this Oracle draft' } })

    fireEvent.click(screen.getByRole('button', { name: 'Dock Oracle' }))
    expect(onPlacementChange).toHaveBeenCalledWith('docked')
    view.rerender(
      <Harness
        {...view.props}
        onPlacementChange={onPlacementChange}
        placement="docked"
        preferredPlacement="docked"
      />,
    )
    expect(screen.getByRole('textbox', { name: 'Message Oracle' }))
      .toHaveValue('Keep this Oracle draft')

    view.rerender(
      <Harness
        {...view.props}
        onPlacementChange={onPlacementChange}
        placement="overlay"
        preferredPlacement="docked"
      />,
    )
    expect(screen.getByRole('textbox', { name: 'Message Oracle' }))
      .toHaveValue('Keep this Oracle draft')
    fireEvent.click(screen.getByRole('button', { name: 'Close Oracle' }))
    fireEvent.click(screen.getByRole('button', { name: /^Oracle/ }))
    expect(screen.getByRole('textbox', { name: 'Message Oracle' }))
      .toHaveValue('Keep this Oracle draft')
  })

  it("names the hub's default model when it is the one that could not start", async () => {
    setup({ ...empty, settings: { defaultModel: 'env-model', modelUnavailable: true } })
    await openPanel()
    expect(screen.getByText(/env-model could not start/)).toBeInTheDocument()
  })

  it('never returns focus to a trigger that has slid out of view', async () => {
    vi.mocked(getManager).mockResolvedValue(empty)
    function Drawer() {
      const [open, setOpen] = useState(false)
      const [drawerOpen, setDrawerOpen] = useState(true)
      const [indicator, setIndicator] = useState<OracleIndicator>({ available: false, status: 'idle', unread: false, queued: 0 })
      return (
        <>
          <div data-testid="drawer">
            <OracleButton indicator={indicator} offscreen={!drawerOpen} onToggle={() => setOpen((current) => !current)} open={open} />
          </div>
          <div data-testid="header">
            <OracleButton indicator={indicator} onToggle={() => setOpen((current) => !current)} open={open} />
          </div>
          {/* Following a session link closes the drawer and Oracle together. */}
          <button onClick={() => { setDrawerOpen(false); setOpen(false) }} type="button">Follow link</button>
          <ManagerAssistant
            connectionEpoch={1}
            defaults={{}}
            onIndicatorChange={setIndicator}
            onOpenChange={setOpen}
            onOpenSession={vi.fn(() => true)}
            onOpenSettings={vi.fn()}
            open={open}
            openSessions={0}
            subscribe={() => () => undefined}
          />
        </>
      )
    }
    render(<Drawer />)
    const fromDrawer = await within(screen.getByTestId('drawer')).findByRole('button', { name: 'Oracle' })
    // Chrome focuses a button it clicks.
    fromDrawer.focus()
    fireEvent.click(fromDrawer)
    await screen.findByRole('dialog', { name: 'Oracle' })
    fireEvent.click(screen.getByRole('button', { name: 'Follow link' }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Oracle' })).not.toBeInTheDocument())
    expect(within(screen.getByTestId('header')).getByRole('button', { name: 'Oracle' })).toHaveFocus()
  })

  it('tells the app how wide the open panel is, so what it covers can move beside it', async () => {
    const onWidthChange = vi.fn()
    setup(empty, { onWidthChange })
    await screen.findByRole('button', { name: 'Oracle' })
    expect(onWidthChange).toHaveBeenLastCalledWith(undefined)
    await openPanel()
    expect(onWidthChange).toHaveBeenLastCalledWith(440)
    fireEvent.keyDown(screen.getByRole('separator', { name: 'Resize Oracle' }), { key: 'ArrowLeft', shiftKey: true })
    expect(onWidthChange).toHaveBeenLastCalledWith(472)
    fireEvent.click(screen.getByRole('button', { name: 'Close Oracle' }))
    expect(onWidthChange).toHaveBeenLastCalledWith(undefined)
  })

  it('resizes the desktop panel from its left edge and remembers the width', async () => {
    setup(empty, { placement: 'docked' })
    const panel = await openPanel()
    expect(panel).toHaveAttribute('data-placement', 'docked')
    const edge = screen.getByRole('separator', { name: 'Resize Oracle' })
    expect(edge).toHaveAttribute('aria-valuenow', '440')
    expect(panel.style.getPropertyValue('--oracle-width')).toBe('440px')
    fireEvent.keyDown(edge, { key: 'ArrowLeft' })
    expect(edge).toHaveAttribute('aria-valuenow', '448')
    fireEvent.keyDown(edge, { key: 'ArrowLeft', shiftKey: true })
    expect(edge).toHaveAttribute('aria-valuenow', '480')
    fireEvent.keyDown(edge, { key: 'ArrowRight' })
    expect(edge).toHaveAttribute('aria-valuenow', '472')
    expect(panel.style.getPropertyValue('--oracle-width')).toBe('472px')
    expect(localStorage.getItem('agentic-remote:oracle-width')).toBe('472')
    // Never narrower than the minimum, nor so wide the conversation disappears.
    for (let step = 0; step < 20; step += 1) fireEvent.keyDown(edge, { key: 'ArrowRight', shiftKey: true })
    expect(edge).toHaveAttribute('aria-valuenow', '340')
    for (let step = 0; step < 40; step += 1) fireEvent.keyDown(edge, { key: 'ArrowLeft', shiftKey: true })
    expect(edge).toHaveAttribute('aria-valuenow', String(Math.min(960, window.innerWidth - 360)))
    fireEvent.keyDown(edge, { key: 'Home' })
    expect(edge).toHaveAttribute('aria-valuenow', '440')
    expect(localStorage.getItem('agentic-remote:oracle-width')).toBeNull()
    // Escape on the edge still closes the panel.
    fireEvent.keyDown(edge, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Oracle' })).not.toBeInTheDocument()
  })

  it('offers the dock action in the Oracle header with its shortcut', async () => {
    const onPlacementChange = vi.fn()
    setup(empty, {
      onPlacementChange,
      placementShortcutLabel: 'Ctrl+Alt+P',
      preferredPlacement: 'overlay',
    })
    await openPanel()

    const dock = screen.getByRole('button', { name: 'Dock Oracle' })
    expect(dock).toHaveAttribute('title', 'Dock Oracle (Ctrl+Alt+P)')
    fireEvent.click(dock)
    expect(onPlacementChange).toHaveBeenCalledWith('docked')
  })

  it('offers the undock action when docked mode is preferred', async () => {
    setup(empty, {
      onPlacementChange: vi.fn(),
      placement: 'docked',
      placementShortcutLabel: 'Ctrl+Alt+P',
      preferredPlacement: 'docked',
    })
    await openPanel()

    expect(screen.getByRole('button', { name: 'Undock Oracle' })).toHaveAttribute(
      'title',
      'Undock Oracle (Ctrl+Alt+P)',
    )
  })

  it('keeps the conversation beside the sessions list wide enough', async () => {
    const width = window.innerWidth
    try {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 })
      localStorage.setItem('agentic-remote:oracle-width', '900')
      setup(empty, { reservedLeft: 320 })
      await openPanel()
      const edge = screen.getByRole('separator', { name: 'Resize Oracle' })
      // 1440 - 320 for the sessions list - 360 for the conversation.
      expect(edge).toHaveAttribute('aria-valuemax', '760')
      expect(edge).toHaveAttribute('aria-valuenow', '760')
      act(() => {
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 })
        window.dispatchEvent(new Event('resize'))
      })
      expect(edge).toHaveAttribute('aria-valuenow', '520')
      // The width chosen is kept for when there is room again.
      act(() => {
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1920 })
        window.dispatchEvent(new Event('resize'))
      })
      expect(edge).toHaveAttribute('aria-valuenow', '900')
      // A window with no room for both keeps the panel usable: its minimum
      // wins, and it overlays more of the conversation, as on a phone.
      act(() => {
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 980 })
        window.dispatchEvent(new Event('resize'))
      })
      expect(edge).toHaveAttribute('aria-valuemax', '340')
      expect(edge).toHaveAttribute('aria-valuenow', '340')
      fireEvent.keyDown(edge, { key: 'ArrowLeft', shiftKey: true })
      expect(edge).toHaveAttribute('aria-valuenow', '340')
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
    }
  })

  it('reopens at the width it was given', async () => {
    localStorage.setItem('agentic-remote:oracle-width', '520')
    setup()
    await openPanel()
    expect(screen.getByRole('separator', { name: 'Resize Oracle' })).toHaveAttribute('aria-valuenow', '520')
  })

  describe('editing a waiting message', () => {
    const waiting: ManagerSnapshot = {
      ...empty,
      status: 'working',
      queued: 2,
      messages: [
        { id: 'r0', role: 'user', content: 'being answered', createdAt: 't', state: 'running' },
        { id: 'q1', role: 'user', content: 'first waiting', createdAt: 't1', updatedAt: '2026-10-15T00:00:01.000Z', state: 'queued' },
        { id: 'q2', role: 'user', content: 'second waiting', createdAt: 't2', updatedAt: '2026-10-15T00:00:02.000Z', state: 'queued', answerOnly: true },
      ],
    }
    const items = () => within(screen.getByRole('region', { name: 'Queued for Oracle' })).getAllByRole('listitem')

    it('rewrites it in place, keeping its place in the queue', async () => {
      vi.mocked(editQueuedManagerMessage).mockResolvedValue({
        id: 'q1', role: 'user', content: 'first waiting, with everything I meant', createdAt: 't1',
        updatedAt: '2026-10-15T00:00:05.000Z', state: 'queued',
      })
      setup(waiting)
      await openPanel()
      const editButton = screen.getByRole('button', { name: 'Edit queued message: first waiting' })
      fireEvent.click(editButton)
      const editor = screen.getByRole('textbox', { name: 'Edit queued message 1' })
      await waitFor(() => expect(editor).toHaveFocus())
      expect(editor).toHaveValue('first waiting')
      expect(editor).toHaveAccessibleDescription(/Keeps its place/)
      // Unchanged, there is nothing to save; one edit at a time.
      expect(screen.getByRole('button', { name: 'Save edit' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Edit queued message: second waiting' })).toBeDisabled()
      fireEvent.change(editor, { target: { value: 'first waiting, with everything I meant' } })
      fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true })
      await waitFor(() => expect(editQueuedManagerMessage).toHaveBeenCalledWith('q1', 'first waiting, with everything I meant'))
      await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Edit queued message 1' })).not.toBeInTheDocument())
      expect(items().map((item) => item.textContent)).toEqual([
        expect.stringMatching(/^1Number 1: first waiting, with everything I meant/),
        expect.stringMatching(/^2Number 2: second waitingAsk/),
      ])
      await waitFor(() => expect(screen.getByRole('button', { name: /^Edit queued message: first waiting, with/ })).toHaveFocus())
      expect(screen.getByText('Saved your edit. It keeps its place in the queue.')).toBeInTheDocument()
      // Nothing new was queued in its place.
      expect(sendManagerMessage).not.toHaveBeenCalled()
    })

    it('keeps an accepted edit visible and blocked when its saved copy cannot clear', async () => {
      vi.mocked(editQueuedManagerMessage).mockResolvedValue({
        ...waiting.messages[1],
        content: 'accepted queue edit',
        updatedAt: '2026-10-15T00:00:05.000Z',
      })
      setup(waiting)
      await openPanel()
      fireEvent.click(screen.getByRole('button', {
        name: 'Edit queued message: first waiting',
      }))
      const editor = screen.getByRole('textbox', { name: 'Edit queued message 1' })
      fireEvent.change(editor, { target: { value: 'accepted queue edit' } })
      await waitFor(() => expect(localStorage.getItem(
        'agentic-remote:oracle-draft-v1',
      )).toContain('accepted queue edit'))

      const originalRemoveItem = Storage.prototype.removeItem
      const removeItem = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(
        function (this: Storage, key) {
          if (key === 'agentic-remote:oracle-draft-v1') {
            throw new DOMException('Storage unavailable', 'SecurityError')
          }
          return originalRemoveItem.call(this, key)
        },
      )
      try {
        fireEvent.click(screen.getByRole('button', { name: 'Save edit' }))
        await waitFor(() => expect(editQueuedManagerMessage).toHaveBeenCalledOnce())
        expect(screen.getByRole('textbox', { name: 'Edit queued message 1' }))
          .toHaveValue('accepted queue edit')
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Oracle could not save this draft on this device',
        )
        expect(screen.getByRole('button', { name: 'Save edit' })).toBeDisabled()
        expect(localStorage.getItem('agentic-remote:oracle-draft-v1'))
          .toContain('accepted queue edit')
      } finally {
        removeItem.mockRestore()
      }
    })

    it('restores an unsaved queued-message edit after a remount', async () => {
      const first = setup(waiting)
      await openPanel()
      fireEvent.click(screen.getByRole('button', {
        name: 'Edit queued message: first waiting',
      }))
      fireEvent.change(screen.getByRole('textbox', {
        name: 'Edit queued message 1',
      }), {
        target: { value: 'first waiting with an unfinished edit' },
      })
      first.unmount()

      setup(waiting)
      await openPanel()
      expect(screen.getByRole('textbox', { name: 'Edit queued message 1' }))
        .toHaveValue('first waiting with an unfinished edit')
      expect(screen.getByText('Recovered saved edit')).toBeInTheDocument()
      expect(editQueuedManagerMessage).not.toHaveBeenCalled()
    })

    it('moves a recovered edit into the composer when the queued message is gone', async () => {
      localStorage.setItem('agentic-remote:oracle-draft-v1', JSON.stringify({
        version: 1,
        draft: '',
        editing: {
          id: 'q1',
          text: 'Recovered words from a message Oracle already started',
        },
      }))
      setup(empty)
      await openPanel()

      expect(screen.getByRole('textbox', { name: 'Message Oracle' })).toHaveValue(
        'Recovered words from a message Oracle already started',
      )
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Oracle started on that message before your edit was saved',
      )
      expect(screen.queryByRole('textbox', { name: 'Edit queued message 1' }))
        .not.toBeInTheDocument()
    })

    it('cancels with Escape or Cancel, leaving it as it was and the panel open', async () => {
      setup(waiting)
      await openPanel()
      fireEvent.click(screen.getByRole('button', { name: 'Edit queued message: second waiting' }))
      const editor = screen.getByRole('textbox', { name: 'Edit queued message 2' })
      fireEvent.change(editor, { target: { value: 'something else' } })
      fireEvent.keyDown(editor, { key: 'Escape' })
      expect(screen.queryByRole('textbox', { name: 'Edit queued message 2' })).not.toBeInTheDocument()
      expect(screen.getByRole('dialog', { name: 'Oracle' })).toBeInTheDocument()
      expect(items()[1]).toHaveTextContent('second waiting')
      fireEvent.click(screen.getByRole('button', { name: 'Edit queued message: second waiting' }))
      fireEvent.click(screen.getByRole('button', { name: 'Cancel edit' }))
      expect(editQueuedManagerMessage).not.toHaveBeenCalled()
    })

    it('keeps an edit Oracle started on before it was saved in the message bar', async () => {
      vi.mocked(editQueuedManagerMessage).mockRejectedValue(Object.assign(
        new Error('Oracle has already started on this message, so it can no longer be edited.'),
        { statusCode: 409 },
      ))
      // The queue still shows it waiting, as for a message a restart
      // interrupted; the hub's refusal is what counts.
      setup(waiting)
      await openPanel()
      fireEvent.click(screen.getByRole('button', { name: 'Edit queued message: first waiting' }))
      fireEvent.change(screen.getByRole('textbox', { name: 'Edit queued message 1' }), { target: { value: 'my late change' } })
      fireEvent.click(screen.getByRole('button', { name: 'Save edit' }))
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Oracle has already started on this message, so it can no longer be edited. Your edit is in the message bar to send.',
      )
      expect(screen.queryByRole('textbox', { name: 'Edit queued message 1' })).not.toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: 'Message Oracle' })).toHaveValue('my late change')
    })

    it('hands the edit back when Oracle starts on the message while it is open', async () => {
      const { emit } = setup(waiting)
      await openPanel()
      fireEvent.click(screen.getByRole('button', { name: 'Edit queued message: first waiting' }))
      fireEvent.change(screen.getByRole('textbox', { name: 'Edit queued message 1' }), { target: { value: 'half typed' } })
      emit({ type: 'manager.message', message: { ...waiting.messages[1], state: 'running', updatedAt: '2026-10-15T00:00:09.000Z' } })
      expect(screen.queryByRole('textbox', { name: 'Edit queued message 1' })).not.toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('Oracle started on that message before your edit was saved.')
      expect(screen.getByRole('textbox', { name: 'Message Oracle' })).toHaveValue('half typed')
      expect(editQueuedManagerMessage).not.toHaveBeenCalled()
    })

    it('does not copy back an edit that was saved before Oracle took the message', async () => {
      let resolve: (message: ManagerSnapshot['messages'][number]) => void = () => undefined
      vi.mocked(editQueuedManagerMessage).mockImplementation(() => new Promise((done) => {
        resolve = done
      }))
      const { emit } = setup(waiting)
      await openPanel()
      fireEvent.click(screen.getByRole('button', { name: 'Edit queued message: first waiting' }))
      fireEvent.change(screen.getByRole('textbox', { name: 'Edit queued message 1' }), { target: { value: 'revised in time' } })
      fireEvent.click(screen.getByRole('button', { name: 'Save edit' }))
      const saved = { ...waiting.messages[1], content: 'revised in time', updatedAt: '2026-10-15T00:00:05.000Z' }
      emit({ type: 'manager.message', message: { ...saved, state: 'running', updatedAt: '2026-10-15T00:00:06.000Z' } })
      await act(async () => resolve(saved))
      expect(screen.queryByRole('textbox', { name: 'Edit queued message 1' })).not.toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: 'Message Oracle' })).toHaveValue('')
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('does not resurrect an accepted edit when Oracle starts it before failed cleanup', async () => {
      let resolve: (message: ManagerSnapshot['messages'][number]) => void = () => undefined
      vi.mocked(editQueuedManagerMessage).mockImplementation(() => new Promise((done) => {
        resolve = done
      }))
      const first = setup(waiting)
      await openPanel()
      fireEvent.click(screen.getByRole('button', {
        name: 'Edit queued message: first waiting',
      }))
      fireEvent.change(screen.getByRole('textbox', {
        name: 'Edit queued message 1',
      }), {
        target: { value: 'accepted before cleanup failed' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Save edit' }))
      const accepted = {
        ...waiting.messages[1],
        content: 'accepted before cleanup failed',
        state: 'running' as const,
        updatedAt: '2026-10-15T00:00:06.000Z',
      }
      first.emit({ type: 'manager.message', message: accepted })

      const originalRemoveItem = Storage.prototype.removeItem
      const removeItem = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(
        function (this: Storage, key) {
          if (key === 'agentic-remote:oracle-draft-v1') {
            throw new DOMException('Storage unavailable', 'SecurityError')
          }
          return originalRemoveItem.call(this, key)
        },
      )
      try {
        await act(async () => resolve(accepted))
        expect(screen.getByText(
          'Oracle could not save this draft on this device',
          { exact: false },
        )).toBeInTheDocument()
        expect(screen.getByRole('textbox', { name: 'Message Oracle' })).toHaveValue('')
        expect(localStorage.getItem('agentic-remote:oracle-draft-v1'))
          .toContain('accepted before cleanup failed')

        first.unmount()
        setup({
          ...waiting,
          queued: 1,
          messages: [waiting.messages[0], accepted, waiting.messages[2]],
        })
        await openPanel()
        expect(screen.getByRole('textbox', { name: 'Message Oracle' })).toHaveValue('')
        expect(screen.queryByRole('textbox', {
          name: 'Edit queued message 1',
        })).not.toBeInTheDocument()
      } finally {
        removeItem.mockRestore()
      }
    })

    it('checks Ctrl+Enter like Save, and announces every save', async () => {
      vi.mocked(editQueuedManagerMessage).mockImplementation(async (id, content) => ({
        ...waiting.messages.find((message) => message.id === id)!, content, updatedAt: new Date().toISOString(),
      }))
      setup(waiting)
      await openPanel()
      fireEvent.click(screen.getByRole('button', { name: 'Edit queued message: first waiting' }))
      const editor = screen.getByRole('textbox', { name: 'Edit queued message 1' })
      fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true })
      fireEvent.change(editor, { target: { value: '   ' } })
      fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true })
      expect(editQueuedManagerMessage).not.toHaveBeenCalled()
      const live = () => [...document.querySelectorAll('[aria-live="polite"]')].map((element) => element.textContent).join('|')
      fireEvent.change(editor, { target: { value: 'first change' } })
      fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true })
      await waitFor(() => expect(live()).toContain('Saved your edit.'))
      const firstAnnouncement = live()
      fireEvent.click(await screen.findByRole('button', { name: 'Edit queued message: second waiting' }))
      fireEvent.change(screen.getByRole('textbox', { name: 'Edit queued message 2' }), { target: { value: 'second change' } })
      fireEvent.click(screen.getByRole('button', { name: 'Save edit' }))
      await waitFor(() => expect(live()).not.toBe(firstAnnouncement))
      expect(live()).toContain('Saved your edit.')
    })

    it('stays open with the reason when saving fails for another reason', async () => {
      vi.mocked(editQueuedManagerMessage).mockRejectedValue(new Error('Origin is not allowed'))
      setup(waiting)
      await openPanel()
      fireEvent.click(screen.getByRole('button', { name: 'Edit queued message: first waiting' }))
      fireEvent.change(screen.getByRole('textbox', { name: 'Edit queued message 1' }), { target: { value: 'changed' } })
      fireEvent.click(screen.getByRole('button', { name: 'Save edit' }))
      expect(await screen.findByRole('alert')).toHaveTextContent('Origin is not allowed')
      expect(screen.getByRole('textbox', { name: 'Edit queued message 1' })).toHaveValue('changed')
    })
  })

  describe('voice', () => {
    let track: { stop: ReturnType<typeof vi.fn> }
    class FakeRecorder extends EventTarget {
      static isTypeSupported = (type: string) => type === 'audio/webm'
      state: 'inactive' | 'recording' = 'inactive'
      readonly mimeType: string
      constructor(_stream: unknown, options?: { mimeType?: string }) {
        super()
        this.mimeType = options?.mimeType ?? ''
      }
      start() {
        this.state = 'recording'
      }
      stop() {
        this.state = 'inactive'
        this.dispatchEvent(Object.assign(new Event('dataavailable'), { data: new Blob(['audio'], { type: 'audio/webm' }) }))
        this.dispatchEvent(new Event('stop'))
      }
    }

    beforeEach(() => {
      track = { stop: vi.fn() }
      vi.stubGlobal('MediaRecorder', FakeRecorder)
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: { getUserMedia: vi.fn(async () => ({ getTracks: () => [track] })) },
      })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
      Reflect.deleteProperty(navigator, 'mediaDevices')
    })

    it('records, transcribes on the hub, and adds what was said to the message', async () => {
      vi.mocked(transcribeAudio).mockResolvedValue({ transcript: 'what is running right now' } as Awaited<ReturnType<typeof transcribeAudio>>)
      setup()
      await openPanel()
      const input = screen.getByRole('textbox', { name: 'Message Oracle' })
      fireEvent.change(input, { target: { value: 'Quick one:' } })
      fireEvent.click(screen.getByRole('button', { name: 'Dictate to Oracle' }))
      expect(await screen.findByText(/Recording 0:00/)).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /Stop & transcribe/ }))
      await waitFor(() => expect(transcribeAudio).toHaveBeenCalledTimes(1))
      const file = vi.mocked(transcribeAudio).mock.calls[0][0]
      expect(file.type).toBe('audio/webm')
      expect(file.name).toBe('recording.webm')
      await waitFor(() => expect(input).toHaveValue('Quick one: what is running right now'))
      expect(track.stop).toHaveBeenCalled()
      expect(sendManagerMessage).not.toHaveBeenCalled()
    })

    describe('live', () => {
      beforeEach(() => {
        liveDictationFake.capabilities = { live: true, computerName: 'Development' }
        liveDictationFake.clients.length = 0
        vi.stubGlobal('AudioWorkletNode', class {})
      })

      afterEach(() => {
        liveDictationFake.capabilities = undefined
      })

      it('shows words in the Oracle message while speaking and keeps the final text', async () => {
        setup()
        await openPanel()
        const input = screen.getByRole('textbox', { name: 'Message Oracle' })
        fireEvent.change(input, { target: { value: 'Quick one:' } })
        fireEvent.click(screen.getByRole('button', { name: 'Dictate to Oracle' }))
        await waitFor(() => expect(liveDictationFake.clients).toHaveLength(1))
        const client = liveDictationFake.clients[0]
        expect(await screen.findByText('Listening · 0:00')).toBeVisible()
        act(() => client.callbacks.onText({ committed: '', tentative: 'what is running' }))
        expect(input).toHaveValue('Quick one: what is running')
        const send = screen.getByRole('button', { name: 'Send message' })
        expect(send).toBeDisabled()
        expect(send).toHaveAttribute('title', 'Finish dictation first')

        fireEvent.click(screen.getByRole('button', { name: 'Stop dictation' }))
        expect(client.stop).toHaveBeenCalledOnce()
        act(() => client.callbacks.onFinal('what is running now'))
        await waitFor(() => expect(input).toHaveValue('Quick one: what is running now'))
        expect(screen.getByRole('button', { name: 'Dictate to Oracle' })).toBeEnabled()
        expect(sendManagerMessage).not.toHaveBeenCalled()
        expect(transcribeAudio).not.toHaveBeenCalled()
      })

      it('restores the Oracle message on Cancel', async () => {
        setup()
        await openPanel()
        const input = screen.getByRole('textbox', { name: 'Message Oracle' })
        fireEvent.change(input, { target: { value: 'Keep this' } })
        fireEvent.click(screen.getByRole('button', { name: 'Dictate to Oracle' }))
        await waitFor(() => expect(liveDictationFake.clients).toHaveLength(1))
        await screen.findByText('Listening · 0:00')
        act(() => liveDictationFake.clients[0].callbacks.onText({ committed: 'not this', tentative: '' }))
        expect(input).toHaveValue('Keep this not this')
        fireEvent.click(screen.getByRole('button', { name: 'Cancel dictation' }))
        await waitFor(() => expect(input).toHaveValue('Keep this'))
        expect(liveDictationFake.clients[0].cancel).toHaveBeenCalledOnce()
      })

      it('shows why dictation stopped and keeps its confirmed words', async () => {
        setup()
        await openPanel()
        const input = screen.getByRole('textbox', { name: 'Message Oracle' })
        fireEvent.click(screen.getByRole('button', { name: 'Dictate to Oracle' }))
        await waitFor(() => expect(liveDictationFake.clients).toHaveLength(1))
        await screen.findByText('Listening · 0:00')
        const client = liveDictationFake.clients[0]
        act(() => client.callbacks.onText({ committed: 'kept words', tentative: 'maybe' }))
        act(() => {
          client.callbacks.onError({ code: 'stalled', message: 'The dictation connection stopped responding', fatal: true })
          client.callbacks.onFinal('kept words')
        })
        await waitFor(() => expect(input).toHaveValue('kept words'))
        expect(screen.getByRole('alert')).toHaveTextContent('The dictation connection stopped responding')
      })
    })

    it('discards a cancelled recording, and one left running when the panel closes', async () => {
      setup()
      await openPanel()
      fireEvent.click(screen.getByRole('button', { name: 'Dictate to Oracle' }))
      fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
      await waitFor(() => expect(screen.queryByText(/Recording \d/)).not.toBeInTheDocument())
      expect(track.stop).toHaveBeenCalledTimes(1)
      fireEvent.click(screen.getByRole('button', { name: 'Dictate to Oracle' }))
      await screen.findByText(/Recording 0:00/)
      fireEvent.click(screen.getByRole('button', { name: 'Close Oracle' }))
      await waitFor(() => expect(track.stop).toHaveBeenCalledTimes(2))
      expect(transcribeAudio).not.toHaveBeenCalled()
    })

    it('says so when the browser cannot record or the microphone is refused', async () => {
      vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(new DOMException('no', 'NotAllowedError'))
      setup()
      await openPanel()
      fireEvent.click(screen.getByRole('button', { name: 'Dictate to Oracle' }))
      expect(await screen.findByRole('alert')).toHaveTextContent('Microphone permission was denied')
      vi.unstubAllGlobals()
      fireEvent.click(screen.getByRole('button', { name: 'Dictate to Oracle' }))
      await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Microphone recording is not supported in this browser'))
    })

    it.each([
      ['listening', 'Listening'],
      ['speech', 'Speech detected'],
      ['transcribing', 'Transcribing'],
      ['thinking', 'Oracle is thinking'],
      ['speaking', 'Speaking'],
      ['interrupted', 'Interrupted'],
      ['reconnecting', 'Reconnecting'],
    ] as const)('shows %s Conversation state as visible text', async (state, label) => {
      vi.mocked(useOracleConversation).mockReturnValue(conversationState(state))
      setup()
      await openPanel()

      expect(screen.getByText(label)).toBeVisible()
    })

    it('keeps partial speech out of the draft and explains the local and remote boundary', async () => {
      vi.mocked(useOracleConversation).mockReturnValue(conversationState(
        'transcribing',
        { partial: 'where is the docs work' },
      ))
      setup()
      await openPanel()
      const input = screen.getByRole('textbox', { name: 'Message Oracle' })
      fireEvent.change(input, { target: { value: 'Keep this draft' } })

      expect(screen.getByText('where is the docs work')).toBeVisible()
      expect(input).toHaveValue('Keep this draft')
      expect(screen.getByText(
        'Speech processing stays on your selected computer; Oracle uses remote Copilot. Final messages stay in Oracle history.',
      )).toBeVisible()
    })

    it('keeps Conversation voice Ask-only when the panel default is Delegate', async () => {
      localStorage.setItem('agentic-remote:oracle-answer-only', 'false')
      vi.mocked(sendManagerMessage).mockResolvedValue({
        id: 'typed-delegate',
        role: 'user',
        content: 'Typed delegation stays enabled',
        createdAt: 't',
        state: 'queued',
      })
      setup()
      await openPanel()

      expect(useOracleConversation).toHaveBeenLastCalledWith(
        expect.objectContaining({ answerOnly: true }),
      )
      expect(screen.getByText(
        'Conversation voice is Ask-only and cannot delegate. The mode switch still controls typed messages.',
      )).toBeVisible()

      const input = screen.getByRole('textbox', { name: 'Message Oracle' })
      fireEvent.change(input, { target: { value: 'Typed delegation stays enabled' } })
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() => expect(sendManagerMessage).toHaveBeenCalledWith(
        'Typed delegation stays enabled',
        expect.anything(),
        { answerOnly: false },
      ))
    })

    it('warns before start and while active that voice has no verified speaker boundary', async () => {
      const warning = 'Speaker identity is not verified. Nearby or replayed audio may be submitted. Ask can read session information. Finalized text is sent to remote Copilot.'
      setup()
      await openPanel()

      expect(screen.getByRole('note', {
        name: 'Conversation security notice',
      })).toHaveTextContent(warning)
      expect(screen.getByRole('button', {
        name: 'Start conversation',
      })).toBeVisible()

      cleanup()
      vi.mocked(useOracleConversation).mockReturnValue(
        conversationState('listening'),
      )
      setup()
      await openPanel()

      expect(screen.getByRole('group', {
        name: 'Conversation status',
      })).toHaveTextContent(
        'Speaker identity is not verified. Nearby or replayed audio may be submitted. Conversation is Ask-only and can read session information. Finalized text is sent to remote Copilot.',
      )
    })

    it('restores every failed final delivered by the identity-deduplicating hook', async () => {
      vi.mocked(useOracleConversation).mockReturnValue(conversationState('thinking'))
      setup()
      await openPanel()
      const input = screen.getByRole('textbox', { name: 'Message Oracle' })
      fireEvent.change(input, { target: { value: 'Keep this draft' } })
      const hookOptions = vi.mocked(useOracleConversation).mock.calls.at(-1)?.[0]

      act(() => {
        hookOptions?.onFinalTranscript('where is the docs work')
        hookOptions?.onFinalTranscript('where is the docs work')
      })

      expect(input).toHaveValue(
        'Keep this draft\n\nwhere is the docs work\n\nwhere is the docs work',
      )
    })

    it('preserves a failed voice final restored while a typed send is pending', async () => {
      let resolveSend!: (message: ManagerSnapshot['messages'][number]) => void
      vi.mocked(sendManagerMessage).mockReturnValue(new Promise((resolve) => {
        resolveSend = resolve
      }))
      setup()
      await openPanel()
      const input = screen.getByRole('textbox', { name: 'Message Oracle' })
      fireEvent.change(input, { target: { value: 'Typed request' } })
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() => expect(sendManagerMessage).toHaveBeenCalledOnce())
      const hookOptions = vi.mocked(useOracleConversation).mock.calls.at(-1)?.[0]

      act(() => {
        hookOptions?.onFinalTranscript('Restored voice request')
      })
      expect(input).toHaveValue('Typed request\n\nRestored voice request')

      await act(async () => {
        resolveSend({
          id: 'typed-request',
          role: 'user',
          content: 'Typed request',
          createdAt: 't',
          state: 'queued',
        })
      })
      expect(input).toHaveValue('Typed request\n\nRestored voice request')
    })

    it('offers explicit Start and Stop controls with keyboard focus', async () => {
      setup()
      await openPanel()
      const start = screen.getByRole('button', { name: 'Start conversation' })
      start.focus()
      expect(start).toHaveFocus()
      fireEvent.click(start)
      expect(startConversation).toHaveBeenCalledOnce()

      cleanup()
      vi.mocked(useOracleConversation).mockReturnValue(conversationState('listening'))
      setup()
      await openPanel()
      const stop = screen.getByRole('button', { name: 'Stop conversation' })
      stop.focus()
      expect(stop).toHaveFocus()
      fireEvent.click(stop)
      expect(stopConversation).toHaveBeenCalledOnce()
    })

    it('leaves dictation unchanged when Conversation is unavailable', async () => {
      vi.mocked(useOracleConversation).mockReturnValue(conversationState('off', {
        capability: { ...conversationCapability, available: false, reason: 'Disabled' },
      }))
      setup()
      await openPanel()

      expect(screen.queryByRole('button', { name: 'Start conversation' })).not.toBeInTheDocument()
      expect(screen.queryByText(/Speech processing stays/)).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Dictate to Oracle' })).toBeEnabled()
    })

    it.each([
      'Microphone permission was denied. Dictation is still available.',
      'Conversation requires AudioWorklet. Use dictation in this browser.',
    ])('shows the Conversation failure and leaves dictation available: %s', async (message) => {
      vi.mocked(useOracleConversation).mockReturnValue(conversationState(
        'error',
        { error: message, ownsResources: false },
      ))
      setup()
      await openPanel()

      expect(screen.getByText('Error')).toBeVisible()
      expect(screen.getByRole('alert')).toHaveTextContent(message)
      fireEvent.click(screen.getByRole('button', { name: 'Dictate to Oracle' }))
      expect(await screen.findByText(/Recording 0:00/)).toBeVisible()
      expect(screen.getByRole('button', { name: /Stop & transcribe/ })).toBeEnabled()
    })

    it('keeps the typed mode visible and switchable while voice remains Ask-only', async () => {
      localStorage.setItem('agentic-remote:oracle-answer-only', 'false')
      let current = conversationState('listening', { ownsResources: true })
      vi.mocked(useOracleConversation).mockImplementation(() => current)
      const view = setup()
      await openPanel()

      const ask = screen.getByRole('button', { name: 'Ask' })
      const delegate = screen.getByRole('button', { name: 'Delegate' })
      expect(ask).toBeEnabled()
      expect(ask).toHaveAttribute('aria-pressed', 'false')
      expect(delegate).toBeEnabled()
      expect(delegate).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByText('Conversation voice is Ask-only; typed messages use Delegate')).toBeVisible()
      fireEvent.click(ask)
      expect(ask).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: 'Dictate to Oracle' })).toBeDisabled()

      fireEvent.click(screen.getByRole('button', { name: 'Stop conversation' }))
      current = conversationState('off')
      view.rerender(<Harness {...view.props} />)

      expect(screen.getByRole('button', { name: 'Delegate' })).toBeEnabled()
      fireEvent.click(screen.getByRole('button', { name: 'Delegate' }))
      expect(screen.getByRole('button', { name: 'Delegate' })).toHaveAttribute('aria-pressed', 'true')
      const dictate = screen.getByRole('button', { name: 'Dictate to Oracle' })
      expect(dictate).toBeEnabled()
      fireEvent.click(dictate)
      expect(await screen.findByText(/Recording 0:00/)).toBeVisible()
    })

    it('keeps typed send errors independent from recovering Conversation errors', async () => {
      vi.mocked(sendManagerMessage).mockRejectedValue(new Error('Typed send failed'))
      let current = conversationState('off')
      vi.mocked(useOracleConversation).mockImplementation(() => current)
      const view = setup()
      await openPanel()
      const input = screen.getByRole('textbox', { name: 'Message Oracle' })
      fireEvent.change(input, { target: { value: 'Typed request' } })
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await screen.findByText('Typed send failed')

      current = conversationState('error', {
        error: 'Oracle speech synthesis failed',
        ownsResources: true,
      })
      view.rerender(<Harness {...view.props} />)
      expect(screen.getByText('Typed send failed')).toBeVisible()
      expect(screen.getByText('Oracle speech synthesis failed')).toBeVisible()

      current = conversationState('listening', {
        error: undefined,
        ownsResources: true,
      })
      view.rerender(<Harness {...view.props} />)
      expect(screen.getByText('Typed send failed')).toBeVisible()
      expect(screen.queryByText('Oracle speech synthesis failed')).not.toBeInTheDocument()
    })

    it('hands panel close to the Conversation lifecycle and keeps controls usable at 390px', async () => {
      vi.stubGlobal('innerWidth', 390)
      setup()
      await openPanel()

      expect(screen.getByRole('button', { name: 'Start conversation' })).toBeVisible()
      expect(screen.getByRole('button', { name: 'Dictate to Oracle' })).toBeVisible()
      expect(screen.getByRole('textbox', { name: 'Message Oracle' })).toBeVisible()
      fireEvent.click(screen.getByRole('button', { name: 'Close Oracle' }))

      await waitFor(() => expect(useOracleConversation).toHaveBeenLastCalledWith(
        expect.objectContaining({ open: false }),
      ))
    })
  })

  it('offers Retry on a failed message', async () => {
    vi.mocked(retryManagerMessage).mockResolvedValue({ id: 'u1', role: 'user', content: 'hi', createdAt: 't', updatedAt: '2026-10-15T00:00:02.000Z', state: 'queued' })
    setup({
      ...empty,
      status: 'offline',
      messages: [{ id: 'u1', role: 'user', content: 'hi', createdAt: 't', updatedAt: '2026-10-15T00:00:01.000Z', state: 'failed', error: 'The manager could not answer: down.' }],
    })
    await openPanel()
    expect(screen.getByText("Couldn't answer the last message")).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('could not answer: down')
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(retryManagerMessage).toHaveBeenCalledWith('u1'))
    expect(await screen.findByRole('region', { name: 'Queued for Oracle' })).toHaveTextContent('hi')
  })

  it('explains removed attachments without Retry while keeping Retry for a text-only removed message', async () => {
    vi.mocked(retryManagerMessage).mockResolvedValue({
      id: 'text-only', role: 'user', content: 'Removed text only', createdAt: 't', state: 'queued',
    })
    setup({
      ...empty,
      messages: [
        {
          id: 'files-removed', role: 'user', content: 'Removed with files', createdAt: 't',
          state: 'cancelled', removedAttachmentNames: ['notes.md', 'chart.png'],
        },
        { id: 'text-only', role: 'user', content: 'Removed text only', createdAt: 't', state: 'cancelled' },
      ],
    })
    await openPanel()
    const removed = screen.getByText('Removed with files').closest('li')!
    expect(within(removed).queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
    expect(within(removed).getByRole('note')).toHaveTextContent('notes.md')
    expect(within(removed).getByRole('note')).toHaveTextContent('chart.png')
    expect(within(removed).getByRole('note')).toHaveTextContent('send it again with the files')

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(retryManagerMessage).toHaveBeenCalledWith('text-only'))
    expect(retryManagerMessage).toHaveBeenCalledTimes(1)
  })

  it('opens sessions from activity and from links in a reply', async () => {
    const { onOpenSession } = setup({
      ...empty,
      messages: [
        { id: 'u1', role: 'user', content: 'start docs', createdAt: 't', state: 'done' },
        { id: 'a1', role: 'activity', content: 'Started "Docs" on development', createdAt: 't', tool: 'create_session', sessionRefs: [{ computerId: 'hub', sessionId: 's1', title: 'Docs' }] },
        { id: 'r1', role: 'assistant', content: 'Started [Docs](?computer=hub&session=s1).', createdAt: 't' },
      ],
    })
    await openPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Open Docs' }))
    expect(onOpenSession).toHaveBeenLastCalledWith({ computerId: 'hub', sessionId: 's1', title: 'Docs' })
    fireEvent.click(screen.getByRole('link', { name: 'Docs' }))
    expect(onOpenSession).toHaveBeenLastCalledWith({ computerId: 'hub', sessionId: 's1' })
  })

  it('stamps every stored prompt, answer, and action with its server time, but not a reply in progress', async () => {
    const ref = { computerId: 'hub', sessionId: 's1', title: 'Docs' }
    const stored = [
      { id: 'u1', role: 'user', content: 'start docs', createdAt: '2026-11-07T09:00:00.000Z', state: 'done' },
      { id: 'a1', role: 'activity', content: 'Started "Docs"', createdAt: '2026-11-07T09:00:05.000Z', tool: 'create_session', sessionRefs: [ref] },
      {
        id: 'c1', role: 'activity', content: 'Close "Docs"? It finished.', createdAt: '2026-11-07T09:00:06.000Z', tool: 'close_session', sessionRefs: [ref],
        confirmation: { kind: 'close-session', computerId: 'hub', sessionId: 's1', title: 'Docs', state: 'pending' },
      },
      { id: 'r1', role: 'assistant', content: 'Started Docs.', createdAt: '2026-11-07T09:00:09.000Z', replyTo: 'u1' },
      { id: 'q1', role: 'user', content: 'which is busy?', createdAt: '2026-11-07T09:01:00.000Z', state: 'done', answerOnly: true },
      { id: 'v1', role: 'user', content: 'spoken request', createdAt: '2026-11-07T09:01:30.000Z', state: 'done', source: 'voice' },
      { id: 'k1', role: 'user', content: 'Durable task: Ship docs', createdAt: '2026-11-07T09:02:00.000Z', state: 'done', source: 'task' },
      { id: 'p1', role: 'user', content: 'Docs finished', createdAt: '2026-11-07T09:03:00.000Z', state: 'done', source: 'proactive' },
      { id: 's2', role: 'user', content: 'which is busy now?', createdAt: '2026-11-07T10:00:00.000Z', state: 'running', answerOnly: true },
    ] satisfies ManagerMessage[]
    const { emit } = setup({
      ...empty,
      status: 'working',
      messages: [...stored, { id: 'u2', role: 'user', content: 'from an older hub', createdAt: 't', state: 'done' }],
    })
    const panel = await openPanel()
    const rows = () => within(within(panel).getByRole('list', { name: 'Oracle conversation' })).getAllByRole('listitem')
    const times = () => rows().map((row) => row.querySelector('time')?.getAttribute('datetime'))
    const storedTimes = stored.map((message) => message.createdAt)

    expect(times()).toEqual([...storedTimes, undefined, undefined])
    expect(rows().at(-1)).toHaveTextContent('Thinking…')

    emit({ type: 'manager.delta', messageId: 'r2', content: 'Looking' })
    expect(times()).toEqual([...storedTimes, undefined, undefined])
    expect(rows().at(-1)).toHaveAttribute('aria-busy', 'true')

    emit({ type: 'manager.status', status: 'idle', queued: 0 })
    emit({ type: 'manager.message', message: { id: 'r2', role: 'assistant', content: 'Docs is busy.', createdAt: '2026-11-07T10:00:04.000Z', replyTo: 's2' } })
    expect(times()).toEqual([...storedTimes, undefined, '2026-11-07T10:00:04.000Z'])
  })

  it('keeps the stored time on every waiting prompt, including the one being edited', async () => {
    const queued = [
      { id: 'q1', role: 'user', content: 'typed while busy', createdAt: '2026-11-07T09:01:00.000Z', state: 'queued', source: 'typed' },
      { id: 'q2', role: 'user', content: 'quick question', createdAt: '2026-11-07T09:02:00.000Z', state: 'queued', answerOnly: true },
      { id: 'q3', role: 'user', content: 'spoken while busy', createdAt: '2026-11-07T09:03:00.000Z', state: 'queued', source: 'voice' },
      { id: 'q4', role: 'user', content: 'Durable task: Ship docs', createdAt: '2026-11-07T09:04:00.000Z', state: 'queued', source: 'task' },
      { id: 'q5', role: 'user', content: 'Docs finished', createdAt: '2026-11-07T09:05:00.000Z', state: 'queued', source: 'proactive' },
    ] satisfies ManagerMessage[]
    setup({
      ...empty,
      status: 'working',
      queued: queued.length,
      messages: [{ id: 'r0', role: 'user', content: 'being answered', createdAt: '2026-11-07T09:00:00.000Z', state: 'running' }, ...queued],
    })
    await openPanel()
    const queue = screen.getByRole('region', { name: 'Queued for Oracle' })
    const times = () => within(queue).getAllByRole('listitem').map((item) => item.querySelector('time')?.getAttribute('datetime'))
    expect(times()).toEqual(queued.map((message) => message.createdAt))

    fireEvent.click(within(queue).getByRole('button', { name: 'Edit queued message: typed while busy' }))
    const editor = within(queue).getByRole('textbox', { name: 'Edit queued message 1' })
    expect(times()).toEqual(queued.map((message) => message.createdAt))
    // The time stays out of the editor's description.
    expect(editor).toHaveAccessibleDescription(/^Keeps its place/)
  })

  describe("Oracle's automatic turns", () => {
    const docs = { computerId: 'hub', sessionId: 's1' }
    const tests = { computerId: 'hub', sessionId: 's2' }
    const finished = { id: 'a'.repeat(64), kind: 'finished', ...docs, taskGeneration: 2, revision: 7 } as const
    const failed = { id: 'b'.repeat(64), kind: 'failed', ...tests, taskGeneration: 1, revision: 3 } as const
    const sessionUpdate = (id: string, overrides: Partial<ManagerMessage> = {}): ManagerMessage => ({
      id,
      role: 'user',
      content: formatProactivePrompt([finished]),
      createdAt: '2026-11-07T09:01:00.000Z',
      state: 'done',
      source: 'proactive',
      answerOnly: true,
      automatic: { kind: 'proactive', eventIds: [finished.id], sessionRefs: [docs] },
      ...overrides,
    })
    const taskFollowUp = (id: string, overrides: Partial<ManagerMessage> = {}): ManagerMessage => ({
      id,
      role: 'user',
      // The prompt carries free text; only the recorded title names the row.
      content: [
        'Investigate the gate',
        '',
        'Durable task: Ship',
        'docs',
        'Next action: Review the draft',
        'Durable task: not the title',
      ].join('\n'),
      createdAt: '2026-11-07T09:02:00.000Z',
      state: 'done',
      source: 'task',
      automatic: { kind: 'task', taskId: 't1', title: 'Ship\ndocs', sessionRefs: [] },
      ...overrides,
    })
    const rowWith = (scope: HTMLElement, label: string) => within(scope).getByText(label).closest('li')!

    it('shows them as thin rows, not as messages from you', async () => {
      const { onOpenSession } = setup({
        ...empty,
        messages: [
          { id: 'u1', role: 'user', content: 'start docs', createdAt: '2026-11-07T09:00:00.000Z', state: 'done' },
          sessionUpdate('p1'),
          sessionUpdate('p2', {
            content: formatProactivePrompt([{ ...finished, id: 'c'.repeat(64) }, failed]),
            automatic: { kind: 'proactive', eventIds: ['c'.repeat(64), failed.id], sessionRefs: [docs, tests] },
          }),
          taskFollowUp('k1'),
        ],
      })
      const panel = await openPanel()
      const conversation = within(panel).getByRole('list', { name: 'Oracle conversation' })

      expect(within(conversation).getByText('start docs').closest('li')).toHaveClass('manager-message--user')
      const update = rowWith(conversation, 'Session update')
      expect(update).toHaveClass('manager-activity')
      expect(update).not.toHaveClass('manager-message--user')
      expect(update).toHaveTextContent('Session update · finished')
      expect(update.querySelector('time')).toHaveAttribute('datetime', '2026-11-07T09:01:00.000Z')
      expect(within(update).queryByText('Ask')).not.toBeInTheDocument()
      expect(within(conversation).queryByText(/Review these durable/)).not.toBeInTheDocument()

      fireEvent.click(within(update).getByRole('button', { name: 'Open session' }))
      expect(onOpenSession).toHaveBeenLastCalledWith(docs)

      const details = within(update).getByRole('button', { name: 'Details', expanded: false })
      fireEvent.click(details)
      expect(details).toHaveAttribute('aria-expanded', 'true')
      expect(within(update).getByText(/Review these durable manager-owned lifecycle events/)).toBeInTheDocument()

      // More than one session keeps the row to one line: their Open buttons
      // wait under Details.
      const updates = rowWith(conversation, 'Session updates')
      expect(updates).toHaveTextContent('Session updates · 1 failed, 1 finished')
      expect(within(updates).queryAllByRole('button', { name: /^Open session/ })).toHaveLength(0)
      fireEvent.click(within(updates).getByRole('button', { name: 'Details' }))
      fireEvent.click(within(updates).getByRole('button', { name: 'Open session 2 of 2' }))
      expect(onOpenSession).toHaveBeenLastCalledWith(tests)

      const task = rowWith(conversation, 'Task follow-up')
      expect(task).toHaveTextContent('Task follow-up · Ship docs')
      expect(within(task).queryByRole('button', { name: /^Open/ })).not.toBeInTheDocument()
    })

    it('names an update it cannot read by its event count, and an untitled task plainly', async () => {
      setup({
        ...empty,
        messages: [
          sessionUpdate('p1', {
            content: 'Docs finished',
            automatic: { kind: 'proactive', eventIds: [finished.id, failed.id], sessionRefs: [] },
          }),
          { id: 'p2', role: 'user', content: 'from an older hub', createdAt: 't', state: 'done', source: 'proactive' },
          // Queued before titles were recorded: its prompt text is not read for one.
          taskFollowUp('k1', { automatic: { kind: 'task', taskId: 't1', sessionRefs: [] } }),
        ],
      })
      const panel = await openPanel()
      const rows = within(within(panel).getByRole('list', { name: 'Oracle conversation' })).getAllByRole('listitem')
      expect(rows.map((row) => row.querySelector('.manager-activity__summary')?.textContent)).toEqual([
        'Session updates · 2 events',
        'Session update',
        'Task follow-up',
      ])
    })

    it('keeps a failed session update retryable but leaves a failed task to its card', async () => {
      vi.mocked(retryManagerMessage).mockResolvedValue(sessionUpdate('p1', { state: 'queued', updatedAt: '2026-11-07T09:05:00.000Z' }))
      setup({
        ...empty,
        messages: [
          sessionUpdate('p1', { state: 'failed', error: 'Oracle could not answer: timeout.', updatedAt: '2026-11-07T09:04:00.000Z' }),
          taskFollowUp('k1', { state: 'failed', error: 'Oracle could not answer: down.' }),
        ],
      })
      const panel = await openPanel()
      const conversation = within(panel).getByRole('list', { name: 'Oracle conversation' })
      const task = rowWith(conversation, 'Task follow-up')
      expect(within(task).getByRole('alert')).toHaveTextContent('could not answer: down')
      expect(task).toHaveTextContent('Retry it from its task card.')
      expect(within(task).queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()

      const update = rowWith(conversation, 'Session update')
      expect(within(update).getByRole('alert')).toHaveTextContent('could not answer: timeout')
      fireEvent.click(within(update).getByRole('button', { name: 'Retry' }))
      await waitFor(() => expect(retryManagerMessage).toHaveBeenCalledWith('p1'))
    })

    it('lists a waiting one by its summary, without the controls the hub refuses', async () => {
      setup({
        ...empty,
        status: 'working',
        queued: 3,
        messages: [
          { id: 'r0', role: 'user', content: 'being answered', createdAt: 't', state: 'running' },
          { id: 'q1', role: 'user', content: 'typed while busy', createdAt: 't', state: 'queued' },
          sessionUpdate('q2', { state: 'queued' }),
          taskFollowUp('q3', { state: 'queued' }),
        ],
      })
      await openPanel()
      const queue = screen.getByRole('region', { name: 'Queued for Oracle' })
      const [typed, update, task] = within(queue).getAllByRole('listitem')
      expect(within(typed).getByRole('button', { name: 'Edit queued message: typed while busy' })).toBeInTheDocument()

      expect(update).toHaveTextContent('Session update · finished')
      expect(update).not.toHaveTextContent('Review these durable')
      expect(within(update).queryByRole('button', { name: /^Edit queued message/ })).not.toBeInTheDocument()
      expect(within(update).getByRole('button', { name: 'Remove from the queue: Session update · finished' })).toBeInTheDocument()

      expect(task).toHaveTextContent('Task follow-up · Ship docs')
      expect(within(task).queryByRole('button')).not.toBeInTheDocument()
    })

    for (const state of ['queued', 'done'] as const) {
      it(`drops an edit an older version saved for a ${state} one instead of reopening its prompt`, async () => {
        localStorage.setItem('agentic-remote:oracle-draft-v1', JSON.stringify({
          version: 1,
          draft: '',
          editing: { id: 'p1', text: 'Review these durable manager-owned lifecycle events, edited' },
        }))
        setup({
          ...empty,
          status: state === 'queued' ? 'working' : 'idle',
          queued: state === 'queued' ? 1 : 0,
          messages: [
            { id: 'r0', role: 'user', content: 'being answered', createdAt: 't', state: state === 'queued' ? 'running' : 'done' },
            sessionUpdate('p1', { state }),
          ],
        })
        const panel = await openPanel()
        expect(within(panel).queryByRole('textbox', { name: /^Edit queued message/ })).not.toBeInTheDocument()
        expect(within(panel).queryByText('Recovered saved edit')).not.toBeInTheDocument()
        expect(within(panel).queryByText(/before your edit was saved/)).not.toBeInTheDocument()
        expect(within(panel).queryByText(/Review these durable/)).not.toBeInTheDocument()
        expect(within(panel).getByRole('textbox', { name: 'Message Oracle' })).toHaveValue('')
        await waitFor(() => expect(localStorage.getItem('agentic-remote:oracle-draft-v1')).toBeNull())
      })
    }
  })

  it('closes a session only when you confirm the request', async () => {
    const request = {
      id: 'c1', role: 'activity' as const, content: 'Close "Docs"? It finished.', createdAt: 't', updatedAt: '2026-10-15T00:00:01.000Z',
      tool: 'close_session', sessionRefs: [{ computerId: 'hub', sessionId: 's1', title: 'Docs' }],
      confirmation: { kind: 'close-session' as const, computerId: 'hub', sessionId: 's1', title: 'Docs', state: 'pending' as const },
    }
    vi.mocked(resolveManagerConfirmation).mockResolvedValue({
      ...request, updatedAt: '2026-10-15T00:00:02.000Z',
      confirmation: { ...request.confirmation, state: 'confirmed', recoverable: true },
    })
    setup({ ...empty, messages: [request] })
    await openPanel()
    expect(screen.getByText('Close "Docs"? It finished.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close session' }))
    await waitFor(() => expect(resolveManagerConfirmation).toHaveBeenCalledWith('c1', true))
    expect(await screen.findByText('Closed. You can reopen it from Recently closed for 14 days.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Close session' })).not.toBeInTheDocument()
  })

  it('shows a session Oracle closed without asking as done, with nothing to answer', async () => {
    setup({
      ...empty,
      messages: [{
        id: 'c1', role: 'activity', content: 'Close "Docs": Its PR merged.', createdAt: 't', tool: 'close_session',
        sessionRefs: [{ computerId: 'hub', sessionId: 's1', title: 'Docs' }],
        confirmation: {
          kind: 'close-session', computerId: 'hub', sessionId: 's1', title: 'Docs', state: 'confirmed', decidedBy: 'oracle', recoverable: true,
        },
      }, {
        // Closed by an earlier release, when closing deleted for good.
        id: 'c0', role: 'activity', content: 'Close "Old notes"?', createdAt: 't', tool: 'close_session',
        sessionRefs: [{ computerId: 'hub', sessionId: 's0', title: 'Old notes' }],
        confirmation: { kind: 'close-session', computerId: 'hub', sessionId: 's0', title: 'Old notes', state: 'confirmed' },
      }],
    })
    await openPanel()
    expect(screen.getByText('Close "Docs": Its PR merged.')).toBeInTheDocument()
    expect(screen.getByText('Closed by Oracle without asking, as your setting allows. You can reopen it from Recently closed for 14 days.')).toBeInTheDocument()
    expect(screen.getByText('Closed. It is permanently deleted.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Close session' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Keep it' })).not.toBeInTheDocument()
  })

  it('stops the current reply', async () => {
    vi.mocked(cancelManager).mockResolvedValue()
    setup({ ...empty, status: 'working' })
    await openPanel()
    fireEvent.click(screen.getByRole('button', { name: "Stop Oracle's reply" }))
    expect(cancelManager).toHaveBeenCalled()
  })

  it('starts a new conversation after confirmation', async () => {
    vi.mocked(resetManager).mockResolvedValue(empty)
    setup({ ...empty, messages: [{ id: 'u1', role: 'user', content: 'hi', createdAt: 't', state: 'done' }] })
    await openPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Start a new conversation' }))
    expect(resetManager).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Start over' }))
    await waitFor(() => expect(resetManager).toHaveBeenCalled())
    expect(await screen.findByText('Ask about your sessions')).toBeInTheDocument()
  })

  it('closes on Escape and returns focus to the bubble', async () => {
    setup()
    await openPanel()
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Message Oracle' }), { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Oracle' })).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Oracle' })).toHaveFocus())
  })

  it('folds a long message of yours until you ask to see it all', async () => {
    setup({ ...empty, messages: [{ id: 'u1', role: 'user', content: 'word '.repeat(300), createdAt: 't', state: 'done' }] })
    await openPanel()
    const toggle = screen.getByRole('button', { name: 'Show all' })
    expect(document.querySelector('.manager-message__text--clamped')).not.toBeNull()
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Show less' })).toBeInTheDocument()
    expect(document.querySelector('.manager-message__text--clamped')).toBeNull()
  })

  describe('following the conversation', () => {
    const docs = { computerId: 'hub', sessionId: 's1', title: 'Docs' }
    const conversation: ManagerSnapshot = {
      ...empty,
      status: 'working',
      messages: [
        { id: 'u1', role: 'user', content: 'What changed overnight?', createdAt: 't', state: 'done' },
        {
          id: 'c0', role: 'activity', content: 'Close "Docs"? It finished.', createdAt: 't', tool: 'close_session', sessionRefs: [docs],
          confirmation: { kind: 'close-session', ...docs, state: 'pending' },
        },
        { id: 'a1', role: 'assistant', content: 'Three sessions finished.', createdAt: 't', replyTo: 'u1' },
        { id: 'u2', role: 'user', content: 'Which is riskiest?', createdAt: 't', state: 'running' },
      ],
    }

    /** Gives the transcript a size, since jsdom lays nothing out. */
    function measure(list: HTMLElement, scrollHeight: number, scrollTop: number) {
      Object.defineProperties(list, {
        clientHeight: { configurable: true, value: 400 },
        scrollHeight: { configurable: true, value: scrollHeight },
        scrollTop: { configurable: true, value: scrollTop, writable: true },
      })
    }

    function scrollTo(list: HTMLElement, scrollTop: number, scrollHeight = 2000) {
      measure(list, scrollHeight, scrollTop)
      fireEvent.scroll(list)
    }

    it('leaves a reader who scrolled up where they are, and follows again at the end', async () => {
      const { emit } = setup(conversation)
      await openPanel()
      const list = screen.getByRole('list', { name: 'Oracle conversation' })
      scrollTo(list, 600)

      emit({ type: 'manager.delta', messageId: 'r2', content: 'The migration' })
      emit({ type: 'manager.message', message: { id: 'r2', role: 'assistant', content: 'The migration.', createdAt: 't', replyTo: 'u2' } })
      expect(list.scrollTop).toBe(600)

      // A few lines short of the end counts as the end.
      scrollTo(list, 1560)
      measure(list, 2400, 1560)
      emit({ type: 'manager.delta', messageId: 'r3', content: 'More' })
      expect(list.scrollTop).toBe(2400)
    })

    it('offers Scroll to latest away from the end until you return there or reopen Oracle', async () => {
      const { emit } = setup(conversation)
      await openPanel()
      let list = screen.getByRole('list', { name: 'Oracle conversation' })
      scrollTo(list, 1600)
      expect(screen.queryByRole('button', { name: 'Scroll to latest' })).not.toBeInTheDocument()

      scrollTo(list, 600)
      fireEvent.click(screen.getByRole('button', { name: 'Scroll to latest' }))
      expect(list.scrollTop).toBe(2000)
      expect(screen.queryByRole('button', { name: 'Scroll to latest' })).not.toBeInTheDocument()
      measure(list, 2400, 2000)
      emit({ type: 'manager.delta', messageId: 'r2', content: 'Still going' })
      expect(list.scrollTop).toBe(2400)

      scrollTo(list, 600, 2400)
      fireEvent.click(screen.getByRole('button', { name: 'Close Oracle' }))
      await openPanel()
      list = screen.getByRole('list', { name: 'Oracle conversation' })
      expect(screen.queryByRole('button', { name: 'Scroll to latest' })).not.toBeInTheDocument()
      measure(list, 2800, 0)
      emit({ type: 'manager.delta', messageId: 'r2', content: 'Still going, reopened' })
      expect(list.scrollTop).toBe(2800)
    })

    it('follows again when you send', async () => {
      vi.mocked(sendManagerMessage).mockResolvedValue({ id: 'u3', role: 'user', content: 'And the tests?', createdAt: 't', state: 'queued' })
      setup(conversation)
      await openPanel()
      const list = screen.getByRole('list', { name: 'Oracle conversation' })
      scrollTo(list, 600)
      const input = screen.getByRole('textbox', { name: 'Message Oracle' })
      fireEvent.change(input, { target: { value: 'And the tests?' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      await waitFor(() => expect(input).toHaveValue(''))
      expect(list.scrollTop).toBe(2000)
      expect(screen.queryByRole('button', { name: 'Scroll to latest' })).not.toBeInTheDocument()
    })

    it('brings a new confirmation into view because it needs an answer, but not an older one', async () => {
      const { emit } = setup(conversation)
      await openPanel()
      const list = screen.getByRole('list', { name: 'Oracle conversation' })
      scrollTo(list, 600)
      emit({ type: 'manager.message', message: { id: 'n1', role: 'activity', content: 'Started "Docs"', createdAt: 't', tool: 'create_session', sessionRefs: [docs] } })
      expect(list.scrollTop).toBe(600)

      const request: ManagerMessage = {
        id: 'c1', role: 'activity', content: 'Close "Docs"? Its PR merged.', createdAt: 't', tool: 'close_session', sessionRefs: [docs],
        confirmation: { kind: 'close-session', ...docs, state: 'pending' },
      }
      emit({ type: 'manager.message', message: request })
      expect(list.scrollTop).toBe(2000)

      // Answering it leaves the older request the newest one waiting, which is not new.
      scrollTo(list, 600)
      emit({ type: 'manager.message', message: { ...request, confirmation: { ...request.confirmation!, state: 'declined' } } })
      expect(list.scrollTop).toBe(600)
    })

    it('keeps a reader it brought to a new confirmation paused, so later text leaves it in view', async () => {
      const { emit } = setup(conversation)
      await openPanel()
      const list = screen.getByRole('list', { name: 'Oracle conversation' })
      scrollTo(list, 600)
      emit({
        type: 'manager.message',
        message: {
          id: 'c1', role: 'activity', content: 'Close "Docs"? Its PR merged.', createdAt: 't', tool: 'close_session', sessionRefs: [docs],
          confirmation: { kind: 'close-session', ...docs, state: 'pending' },
        },
      })
      expect(list.scrollTop).toBe(2000)
      // The browser reports the scroll that bringing it into view caused.
      fireEvent.scroll(list)

      measure(list, 2400, 2000)
      emit({ type: 'manager.delta', messageId: 'r2', content: 'Meanwhile' })
      expect(list.scrollTop).toBe(2000)
      expect(screen.getByRole('button', { name: 'Scroll to latest' })).toBeInTheDocument()

      scrollTo(list, 2000, 2400)
      measure(list, 2600, 2000)
      emit({ type: 'manager.delta', messageId: 'r2', content: 'Meanwhile, more' })
      expect(list.scrollTop).toBe(2600)
    })

    it('keeps a following reader at the end as a queued message starts and Oracle starts thinking', async () => {
      const queued: ManagerMessage = { id: 'u3', role: 'user', content: 'And the tests?', createdAt: 't', state: 'queued' }
      const { emit } = setup({ ...conversation, status: 'idle', messages: [...conversation.messages, queued] })
      await openPanel()
      const list = screen.getByRole('list', { name: 'Oracle conversation' })
      scrollTo(list, 1600)

      measure(list, 2400, 1600)
      emit({ type: 'manager.message', message: { ...queued, state: 'running' } })
      expect(list.scrollTop).toBe(2400)

      measure(list, 2600, 2400)
      emit({ type: 'manager.status', status: 'working', queued: 0 })
      expect(list.scrollTop).toBe(2600)
    })

    it('follows a prompt spoken in this conversation like a sent one, but not one spoken elsewhere', async () => {
      const spoken = (id: string): ManagerMessage => ({
        id, role: 'user', content: 'Where is the docs work?', createdAt: 't', state: 'queued', answerOnly: true, source: 'voice',
      })
      const { emit } = setup(conversation)
      await openPanel()
      const list = screen.getByRole('list', { name: 'Oracle conversation' })
      scrollTo(list, 600)
      emit({ type: 'manager.message', message: spoken('v1') })
      expect(list.scrollTop).toBe(600)

      vi.mocked(useOracleConversation).mockReturnValue(conversationState('thinking'))
      emit({ type: 'manager.message', message: spoken('v2') })
      expect(list.scrollTop).toBe(2000)
      expect(screen.queryByRole('button', { name: 'Scroll to latest' })).not.toBeInTheDocument()

      // Its later updates are not a new prompt.
      scrollTo(list, 600)
      emit({ type: 'manager.message', message: { ...spoken('v2'), state: 'running' } })
      expect(list.scrollTop).toBe(600)
    })
  })

  it('recognises only same-origin session links', () => {
    expect(sessionLinkTarget('?computer=hub&session=s1')).toEqual({ computerId: 'hub', sessionId: 's1' })
    expect(sessionLinkTarget('https://elsewhere.example/?computer=hub&session=s1')).toBeUndefined()
    expect(sessionLinkTarget('?computer=hub')).toBeUndefined()
  })
})
