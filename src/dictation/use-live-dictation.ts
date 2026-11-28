import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { DictationCapabilities } from '../../shared/dictation'
import { beginSpan, cancelSpan, rebaseSpan, renderSpan, type DictationSpan, type RenderedSpan } from './draft-span'
import {
  LiveDictationClient,
  LiveDictationStartError,
  fetchDictationCapabilities,
  type LiveDictationCallbacks,
} from './live-dictation-client'

export type LiveDictationStatus = 'idle' | 'connecting' | 'listening' | 'finishing'

export interface LiveDictationClientLike {
  start(): Promise<void>
  stop(): Promise<void>
  cancel(): void
}

export interface LiveDictationDependencies {
  fetchCapabilities(): Promise<DictationCapabilities>
  createClient(callbacks: LiveDictationCallbacks): LiveDictationClientLike
  audioWorkletSupported(): boolean
}

export interface UseLiveDictationOptions {
  textarea: () => HTMLTextAreaElement | null
  /** The stored draft, which dictation starts from. */
  getDraft: () => string
  /** Stores the draft when dictation ends; tentative text never reaches it. */
  setDraft: (draft: string, selection?: [number, number]) => void
  /** Today's record-and-upload dictation. */
  startFallback: () => void
  /** The composer's polite live region. */
  announce: (message: string) => void
  /** Dictation ended, however it ended; called after any `setDraft`. */
  onEnd?: () => void
  dependencies?: Partial<LiveDictationDependencies>
}

export interface LiveDictation {
  status: LiveDictationStatus
  seconds: number
  tentativeWords: number
  /** What the text box shows while dictating: the draft with the dictated words in it. */
  draft: string | undefined
  start(): Promise<void>
  stop(): void
  cancel(): void
  /** The text box changed while dictating; `previous` is the draft it showed. */
  onUserEdit(previous: string, next: string): void
}

interface Stream {
  client?: LiveDictationClientLike
  span?: DictationSpan
  rendered?: RenderedSpan
  text: string
  ended: boolean
}

const defaultDependencies: LiveDictationDependencies = {
  fetchCapabilities: () => fetchDictationCapabilities(),
  createClient: (callbacks) => new LiveDictationClient(callbacks),
  audioWorkletSupported: () => typeof globalThis.AudioWorkletNode === 'function',
}

/**
 * Live dictation into one composer. While it runs, the text box shows the
 * draft with the confirmed and tentative words at the caret; the stored draft
 * changes only when it ends, so tentative words are never saved.
 */
export function useLiveDictation(options: UseLiveDictationOptions): LiveDictation {
  const optionsRef = useRef(options)
  useLayoutEffect(() => {
    optionsRef.current = options
  })
  const [status, setStatus] = useState<LiveDictationStatus>('idle')
  const [seconds, setSeconds] = useState(0)
  const [view, setView] = useState<{ draft: string; tentativeWords: number }>()
  const streamRef = useRef<Stream | undefined>(undefined)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const selectionRef = useRef<[number, number] | undefined>(undefined)

  const stopTimer = useCallback(() => {
    if (timerRef.current !== undefined) clearInterval(timerRef.current)
    timerRef.current = undefined
  }, [])

  /** Ends the stream in this composer and stores `draft`. */
  const settle = useCallback((stream: Stream, draft?: string, selection?: [number, number]) => {
    stream.ended = true
    if (streamRef.current === stream) streamRef.current = undefined
    stopTimer()
    setView(undefined)
    setStatus('idle')
    setSeconds(0)
    if (draft !== undefined) optionsRef.current.setDraft(draft, selection)
    optionsRef.current.onEnd?.()
  }, [stopTimer])

  const ensureSpan = (stream: Stream): void => {
    if (stream.span) return
    const draft = optionsRef.current.getDraft()
    const textarea = optionsRef.current.textarea()
    const start = textarea?.selectionStart ?? draft.length
    const end = textarea?.selectionEnd ?? start
    stream.span = beginSpan(draft, start, end)
    stream.rendered = renderSpan(stream.span, '')
  }

  /** Shows `text` in the span, keeping the caret where the user left it. */
  const show = useCallback((stream: Stream, text: string, tentativeWords: number) => {
    ensureSpan(stream)
    const previous = stream.rendered!
    const next = renderSpan(stream.span!, text)
    const textarea = optionsRef.current.textarea()
    selectionRef.current = undefined
    if (textarea && textarea === globalThis.document?.activeElement) {
      const caret = textarea.selectionStart
      const caretEnd = textarea.selectionEnd
      const shift = next.draft.length - previous.draft.length
      const place = (position: number) => position === previous.end
        ? next.end
        : position > previous.end ? position + shift : Math.min(position, next.end)
      selectionRef.current = [place(caret), caretEnd === caret ? place(caret) : place(caretEnd)]
    }
    stream.rendered = next
    stream.text = text
    setView({ draft: next.draft, tentativeWords })
  }, [])

  useLayoutEffect(() => {
    const selection = selectionRef.current
    selectionRef.current = undefined
    if (!selection) return
    optionsRef.current.textarea()?.setSelectionRange(selection[0], selection[1])
  }, [view])

  const finish = useCallback((stream: Stream, text: string) => {
    if (stream.ended) return
    ensureSpan(stream)
    const rendered = renderSpan(stream.span!, text)
    settle(stream, rendered.draft, [rendered.end, rendered.end])
    optionsRef.current.announce('Dictation finished')
  }, [settle])

  const stop = useCallback(() => {
    const stream = streamRef.current
    if (!stream || stream.ended) return
    if (!stream.span) {
      // Still connecting: nothing was dictated yet.
      stream.client?.cancel()
      settle(stream)
      return
    }
    setStatus('finishing')
    stopTimer()
    void stream.client?.stop()
  }, [settle, stopTimer])

  const cancel = useCallback(() => {
    const stream = streamRef.current
    if (!stream || stream.ended) return
    stream.client?.cancel()
    if (stream.span) {
      const restored = cancelSpan(stream.span)
      settle(stream, restored.draft, [restored.selectionStart, restored.selectionEnd])
    } else {
      settle(stream)
    }
    optionsRef.current.announce('Dictation cancelled')
  }, [settle])

  const start = useCallback(async () => {
    if (streamRef.current) return
    const stream: Stream = { text: '', ended: false }
    streamRef.current = stream
    setStatus('connecting')
    const fallback = (reason?: string) => {
      settle(stream)
      optionsRef.current.startFallback()
      optionsRef.current.announce(reason ? `Recording instead. ${reason}` : 'Recording instead')
    }
    const deps: LiveDictationDependencies = { ...defaultDependencies, ...optionsRef.current.dependencies }
    let capabilities: DictationCapabilities | undefined
    try {
      capabilities = await deps.fetchCapabilities()
    } catch {
      capabilities = undefined
    }
    if (stream.ended) return
    if (!capabilities) return fallback()
    if (!capabilities.live) return fallback(capabilities.reason)
    if (!deps.audioWorkletSupported()) return fallback('This browser cannot stream audio')

    const client = deps.createClient({
      onText: ({ committed, tentative }) => {
        if (stream.ended) return
        const text = [committed, tentative].filter(Boolean).join(' ')
        show(stream, text, tentative ? tentative.split(/\s+/u).length : 0)
      },
      onFinal: (text) => finish(stream, text),
      onError: (error) => {
        if (!stream.ended && error.fatal) optionsRef.current.announce(error.message)
      },
      onInterrupted: () => {
        if (stream.ended) return
        optionsRef.current.announce('Dictation stopped: the microphone was interrupted')
        stop()
      },
    })
    stream.client = client
    try {
      await client.start()
    } catch (error) {
      if (stream.ended) return
      if (error instanceof LiveDictationStartError && error.fallback) return fallback(error.message)
      settle(stream)
      optionsRef.current.announce(error instanceof Error ? error.message : 'Live dictation could not start')
      return
    }
    if (stream.ended) return
    ensureSpan(stream)
    setView({ draft: stream.rendered!.draft, tentativeWords: 0 })
    setStatus('listening')
    const startedAt = performance.now()
    setSeconds(0)
    timerRef.current = setInterval(() => {
      setSeconds(Math.floor((performance.now() - startedAt) / 1_000))
    }, 250)
    optionsRef.current.announce('Listening')
  }, [finish, settle, show, stop])

  const onUserEdit = useCallback((previous: string, next: string) => {
    const stream = streamRef.current
    if (!stream?.span || !stream.rendered || stream.ended) return
    const textarea = optionsRef.current.textarea()
    const caret = textarea?.selectionStart ?? next.length
    const rebased = rebaseSpan(stream.span, stream.rendered, previous, next, caret)
    if (rebased === 'takeover') {
      stream.client?.cancel()
      settle(stream, next, [caret, caret])
      optionsRef.current.announce('Dictation stopped')
      return
    }
    stream.span = rebased
    const rendered = renderSpan(rebased, stream.text)
    stream.rendered = rendered
    const shift = rendered.draft.length - next.length
    selectionRef.current = textarea && textarea === globalThis.document?.activeElement
      ? [caret > rendered.start ? caret + shift : caret, caret > rendered.start ? caret + shift : caret]
      : undefined
    setView((current) => ({ draft: rendered.draft, tentativeWords: current?.tentativeWords ?? 0 }))
  }, [settle])

  // Leaving keeps what was confirmed and releases the microphone.
  useEffect(() => () => {
    const stream = streamRef.current
    if (!stream || stream.ended) return
    stream.ended = true
    stream.client?.cancel()
    stopTimer()
  }, [stopTimer])

  return {
    status,
    seconds,
    tentativeWords: view?.tentativeWords ?? 0,
    draft: view?.draft,
    start,
    stop,
    cancel,
    onUserEdit,
  }
}
