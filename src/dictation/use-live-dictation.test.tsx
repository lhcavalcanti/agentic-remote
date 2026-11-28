// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react'
import { useRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { DictationCapabilities } from '../../shared/dictation'
import {
  LiveDictationStartError,
  type LiveDictationCallbacks,
} from './live-dictation-client'
import {
  useLiveDictation,
  type LiveDictation,
  type LiveDictationClientLike,
} from './use-live-dictation'

class FakeClient implements LiveDictationClientLike {
  readonly start = vi.fn(async () => {
    if (this.failure) throw this.failure
  })
  readonly stop = vi.fn(async () => undefined)
  readonly cancel = vi.fn()
  failure: Error | undefined

  readonly callbacks: LiveDictationCallbacks

  constructor(callbacks: LiveDictationCallbacks) {
    this.callbacks = callbacks
  }
}

function setup(options: {
  draft?: string
  caret?: [number, number]
  capabilities?: DictationCapabilities | Error
  audioWorklet?: boolean
  microphone?: boolean
  failure?: Error
} = {}) {
  const clients: FakeClient[] = []
  const stored: Array<{ draft: string; selection?: [number, number] }> = []
  const announcements: string[] = []
  const errors: string[] = []
  const startFallback = vi.fn()
  const onEnd = vi.fn()
  const fetchCapabilities = vi.fn(async () => {
    const capabilities = options.capabilities ?? { live: true, computerName: 'Studio' }
    if (capabilities instanceof Error) throw capabilities
    return capabilities
  })
  const hook = { current: undefined as unknown as LiveDictation }
  let draft = options.draft ?? ''

  /** A composer: the live draft while dictating, else the stored one. */
  function Composer() {
    const [value, setValue] = useState(draft)
    const textarea = useRef<HTMLTextAreaElement>(null)
    hook.current = useLiveDictation({
      textarea: () => textarea.current,
      getDraft: () => draft,
      setDraft: (next, selection) => {
        draft = next
        stored.push({ draft: next, ...(selection ? { selection } : {}) })
        setValue(next)
      },
      startFallback,
      announce: (message) => announcements.push(message),
      onError: (message) => errors.push(message),
      onEnd,
      dependencies: {
        fetchCapabilities,
        audioWorkletSupported: () => options.audioWorklet ?? true,
        microphoneSupported: () => options.microphone ?? true,
        createClient: (callbacks) => {
          const client = new FakeClient(callbacks)
          client.failure = options.failure
          clients.push(client)
          return client
        },
      },
    })
    return <textarea aria-label="Message" onChange={() => undefined} ref={textarea} value={hook.current.draft ?? value} />
  }

  const view = render(<Composer />)
  const textarea = view.getByRole('textbox') as HTMLTextAreaElement
  textarea.setSelectionRange(...(options.caret ?? [draft.length, draft.length]))
  const client = () => clients[0]
  const begin = async () => {
    await act(async () => {
      await hook.current.start()
    })
  }
  const text = (committed: string, tentative = '') => act(() => {
    client().callbacks.onText({ committed, tentative })
  })
  /** The user changes the textarea while dictating, leaving the caret at `caret`. */
  const edit = (next: string, caret: number) => {
    const previous = textarea.value
    textarea.value = next
    textarea.setSelectionRange(caret, caret)
    act(() => hook.current.onUserEdit(previous, next))
  }
  /** Something else writes the stored draft while dictating, as a failed send gives its words back. */
  const writeStored = (next: string) => {
    draft = next
  }
  return {
    hook, textarea, clients, client, stored, announcements, errors, startFallback, onEnd, begin, text, edit, writeStored,
    fetchCapabilities,
  }
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'performance'] })
})

afterEach(() => {
  cleanup()
  document.body.replaceChildren()
  vi.useRealTimers()
})

describe('live dictation in a composer', () => {
  it('shows confirmed and tentative words at the caret, and stores only the final text', async () => {
    const harness = setup({ draft: 'Please the bug', caret: [7, 7] })
    await harness.begin()
    expect(harness.hook.current.status).toBe('listening')
    expect(harness.announcements).toEqual(['Listening'])
    harness.text('', 'fix')
    expect(harness.textarea.value).toBe('Please fix the bug')
    expect(harness.hook.current.tentativeWords).toBe(1)
    harness.text('fix', 'that')
    expect(harness.textarea.value).toBe('Please fix that the bug')
    expect(harness.stored).toEqual([])

    await act(async () => harness.hook.current.stop())
    expect(harness.hook.current.status).toBe('finishing')
    expect(harness.client().stop).toHaveBeenCalled()
    act(() => harness.client().callbacks.onFinal('fix that login'))
    expect(harness.stored).toEqual([{ draft: 'Please fix that login the bug', selection: [21, 21] }])
    expect(harness.textarea.value).toBe('Please fix that login the bug')
    expect(harness.hook.current.status).toBe('idle')
    expect(harness.hook.current.draft).toBeUndefined()
    expect(harness.onEnd).toHaveBeenCalledOnce()
  })

  it('counts the seconds while listening', async () => {
    const harness = setup()
    await harness.begin()
    act(() => {
      vi.advanceTimersByTime(7_100)
    })
    expect(harness.hook.current.seconds).toBe(7)
  })

  it('restores the draft and its selection on Cancel', async () => {
    const harness = setup({ draft: 'Send the old words now', caret: [9, 18] })
    await harness.begin()
    harness.text('new', 'words')
    expect(harness.textarea.value).toBe('Send the new words now')
    act(() => harness.hook.current.cancel())
    expect(harness.client().cancel).toHaveBeenCalled()
    expect(harness.stored).toEqual([{ draft: 'Send the old words now', selection: [9, 18] }])
    expect(harness.hook.current.draft).toBeUndefined()
    expect(harness.announcements.at(-1)).toBe('Dictation cancelled')
  })

  it('keeps an edit made before the dictated words and goes on dictating', async () => {
    const harness = setup({ draft: 'Hi there', caret: [8, 8] })
    await harness.begin()
    harness.text('my friend')
    expect(harness.textarea.value).toBe('Hi there my friend')
    harness.edit('Hi! there my friend', 3)
    harness.text('my friend', 'again')
    expect(harness.textarea.value).toBe('Hi! there my friend again')
    expect(harness.client().cancel).not.toHaveBeenCalled()
    expect(harness.stored).toEqual([])
  })

  it('hands the draft to the user when they edit the dictated words', async () => {
    const harness = setup({ draft: 'Hi there', caret: [8, 8] })
    await harness.begin()
    harness.text('my friend')
    harness.edit('Hi there my fiend', 13)
    expect(harness.client().cancel).toHaveBeenCalled()
    expect(harness.stored).toEqual([{ draft: 'Hi there my fiend', selection: [13, 13] }])
    expect(harness.announcements.at(-1)).toBe('Dictation stopped')
    expect(harness.hook.current.status).toBe('idle')
    act(() => harness.client().callbacks.onFinal('my friend'))
    expect(harness.stored).toHaveLength(1)
  })

  it('stops and keeps the confirmed words when the microphone is interrupted', async () => {
    const harness = setup()
    await harness.begin()
    harness.text('kept', 'maybe')
    await act(async () => harness.client().callbacks.onInterrupted?.('The page went to the background'))
    expect(harness.client().stop).toHaveBeenCalled()
    expect(harness.announcements.at(-1)).toBe('Dictation stopped: the microphone was interrupted')
    act(() => harness.client().callbacks.onFinal('kept'))
    expect(harness.stored.at(-1)?.draft).toBe('kept')
  })

  it('moves the caret with the words only while it sits at their end', async () => {
    const harness = setup({ draft: 'Note:', caret: [5, 5] })
    harness.textarea.focus()
    await harness.begin()
    harness.text('', 'one')
    expect(harness.textarea.selectionStart).toBe(9)
    harness.text('one', 'two')
    expect(harness.textarea.value).toBe('Note: one two')
    expect(harness.textarea.selectionStart).toBe(13)
    harness.textarea.setSelectionRange(2, 2)
    harness.text('one two', 'three')
    expect(harness.textarea.selectionStart).toBe(2)
  })

  it('does not focus a composer that is not focused', async () => {
    const harness = setup({ draft: 'Note:', caret: [5, 5] })
    await harness.begin()
    harness.text('', 'one')
    expect(harness.textarea.value).toBe('Note: one')
    expect(document.activeElement).not.toBe(harness.textarea)
  })
})

describe('ending beside other changes', () => {
  it('keeps words the stored draft gained while dictating, and adds the dictated words after them', async () => {
    const harness = setup()
    await harness.begin()
    harness.text('spoken words')
    harness.writeStored('Sent first')
    act(() => harness.client().callbacks.onFinal('spoken words.'))
    expect(harness.stored).toEqual([{ draft: 'Sent first\n\nspoken words.', selection: [25, 25] }])
  })

  it('leaves a stored draft that changed while dictating as it is on Cancel', async () => {
    const harness = setup({ draft: 'Mine' })
    await harness.begin()
    harness.text('spoken')
    harness.writeStored('Restored')
    act(() => harness.hook.current.cancel())
    expect(harness.stored).toEqual([{ draft: 'Restored' }])
  })

  it('shows why a stream failed, keeps its confirmed words and says it stopped', async () => {
    const harness = setup({ draft: 'Note:' })
    await harness.begin()
    harness.text('kept words', 'maybe')
    act(() => {
      const { callbacks } = harness.client()
      callbacks.onError({ code: 'engine_failed', message: 'Live dictation could not decode three times in a row', fatal: true })
      callbacks.onError({ code: 'unavailable', message: 'The dictation connection closed', fatal: true })
      callbacks.onFinal('kept words')
    })
    expect(harness.errors).toEqual(['Live dictation could not decode three times in a row'])
    expect(harness.stored.at(-1)?.draft).toBe('Note: kept words')
    expect(harness.announcements).toEqual(['Listening', 'Dictation stopped'])
  })
})

describe('falling back to recording', () => {
  it.each([
    ['live dictation is unavailable', { capabilities: { live: false, reason: 'Studio is offline', computerName: 'Studio' } },
      'Recording instead. Studio is offline'],
    ['the capabilities cannot be read', { capabilities: new Error('offline') }, 'Recording instead'],
    ['the browser has no AudioWorklet', { audioWorklet: false }, 'Recording instead. This browser cannot stream audio'],
    ['the page cannot use the microphone', { microphone: false }, 'Recording instead. This page cannot use the microphone'],
    ['the transcription computer is busy', { failure: new LiveDictationStartError('busy', 'Live dictation is already in use on Studio', true) },
      'Recording instead. Live dictation is already in use on Studio'],
  ])('records and uploads when %s', async (_label, options, announcement) => {
    const harness = setup(options)
    await harness.begin()
    expect(harness.startFallback).toHaveBeenCalledTimes(1)
    expect(harness.onEnd).toHaveBeenCalledOnce()
    expect(harness.announcements).toEqual([announcement])
    expect(harness.hook.current.status).toBe('idle')
    expect(harness.hook.current.draft).toBeUndefined()
  })

  it('asks the hub nothing when the page cannot use the microphone', async () => {
    const harness = setup({ microphone: false })
    await harness.begin()
    expect(harness.fetchCapabilities).not.toHaveBeenCalled()
    expect(harness.clients).toEqual([])
  })

  it('shows a start failure that recording cannot fix', async () => {
    const harness = setup({ failure: new LiveDictationStartError('permission-denied', 'Microphone permission was denied', false) })
    await harness.begin()
    expect(harness.startFallback).not.toHaveBeenCalled()
    expect(harness.errors).toEqual(['Microphone permission was denied'])
    expect(harness.announcements).toEqual([])
    expect(harness.hook.current.status).toBe('idle')
  })
})
