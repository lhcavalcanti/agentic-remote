import { useCallback, useEffect, useRef, useState } from 'react'
import type { ManagerClientDefaults } from '../shared/manager'
import type { VoiceCapabilities } from '../shared/oracle-voice'
import { getOracleVoiceCapabilities } from './api'
import {
  OracleVoiceClient,
  type OracleVoiceClientError,
  type OracleVoiceUiState,
} from './oracle-voice/client'

const MAX_REMEMBERED_FINALS = 128

export interface OracleConversation {
  capability?: VoiceCapabilities
  state: OracleVoiceUiState
  partial: string
  error?: string
  start(): Promise<void>
  stop(): void
}

export function useOracleConversation(options: {
  defaults: ManagerClientDefaults
  answerOnly: boolean
  open: boolean
  onFinalTranscript: (text: string) => void
  onError: (message: string) => void
}): OracleConversation {
  const [capability, setCapability] = useState<VoiceCapabilities>()
  const [state, setState] = useState<OracleVoiceUiState>('off')
  const [partial, setPartial] = useState('')
  const [error, setError] = useState<string>()
  const clientRef = useRef<OracleVoiceClient | undefined>(undefined)
  const disposedRef = useRef(false)
  const seenFinalsRef = useRef(new Set<string>())
  const callbacksRef = useRef({
    defaults: options.defaults,
    answerOnly: options.answerOnly,
    onFinalTranscript: options.onFinalTranscript,
    onError: options.onError,
  })

  useEffect(() => {
    callbacksRef.current = {
      defaults: options.defaults,
      answerOnly: options.answerOnly,
      onFinalTranscript: options.onFinalTranscript,
      onError: options.onError,
    }
  })

  const reportError = useCallback((message: string) => {
    if (disposedRef.current) return
    setError(message)
    callbacksRef.current.onError(message)
  }, [])

  const stop = useCallback(() => {
    const client = clientRef.current
    clientRef.current = undefined
    seenFinalsRef.current.clear()
    if (!disposedRef.current) {
      setState('off')
      setPartial('')
      setError(undefined)
    }
    void client?.stop()
  }, [])

  useEffect(() => {
    if (!options.open) stop()
  }, [options.open, stop])

  useEffect(() => {
    let current = true
    if (options.open) {
      void getOracleVoiceCapabilities()
        .then((next) => {
          if (current && !disposedRef.current) setCapability(next)
        })
        .catch(() => {
          if (current && !disposedRef.current) setCapability(undefined)
        })
    }
    return () => {
      current = false
    }
  }, [options.open])

  useEffect(() => {
    disposedRef.current = false
    return () => {
      disposedRef.current = true
      stop()
    }
  }, [stop])

  const start = useCallback(async () => {
    if (!capability?.available || disposedRef.current) return
    setPartial('')
    setError(undefined)

    let client = clientRef.current
    if (!client) {
      const current = callbacksRef.current
      client = new OracleVoiceClient({
        language: capability.languages[0] ?? 'auto',
        defaults: current.defaults,
        answerOnly: current.answerOnly,
        onState: (next) => {
          if (clientRef.current !== client || disposedRef.current) return
          setState(next)
          if (
            next === 'listening'
            || next === 'thinking'
            || next === 'speaking'
            || next === 'off'
          ) {
            setPartial('')
          }
          if (next !== 'error' && next !== 'reconnecting') setError(undefined)
        },
        onPartial: (event) => {
          if (clientRef.current !== client || disposedRef.current) return
          setPartial(event.text)
        },
        onFinal: (event) => {
          if (clientRef.current !== client || disposedRef.current) return
          setPartial('')
          const text = event.text.trim()
          const key = `${event.generation}:${event.utteranceId}`
          if (!text || seenFinalsRef.current.has(key)) return
          if (seenFinalsRef.current.size >= MAX_REMEMBERED_FINALS) {
            const oldest = seenFinalsRef.current.values().next().value
            if (oldest) seenFinalsRef.current.delete(oldest)
          }
          seenFinalsRef.current.add(key)
          callbacksRef.current.onFinalTranscript(text)
        },
        onError: (failure: OracleVoiceClientError) => {
          if (clientRef.current !== client || disposedRef.current) return
          reportError(failure.message)
        },
      })
      clientRef.current = client
    }

    try {
      await client.start()
    } catch (caught) {
      if (clientRef.current !== client || disposedRef.current) return
      const message = caught instanceof Error ? caught.message : String(caught)
      setState('error')
      setError((current) => {
        if (current !== message) callbacksRef.current.onError(message)
        return message
      })
    }
  }, [capability, reportError])

  return {
    capability,
    state,
    partial,
    error,
    start,
    stop,
  }
}
