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

export type OracleConversationState = OracleVoiceUiState | 'stopping'

export interface OracleConversation {
  capability?: VoiceCapabilities
  state: OracleConversationState
  partial: string
  error?: string
  ownsResources: boolean
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
  const [state, setState] = useState<OracleConversationState>('off')
  const [partial, setPartial] = useState('')
  const [error, setError] = useState<string>()
  const [ownsResources, setOwnsResources] = useState(false)
  const clientRef = useRef<OracleVoiceClient | undefined>(undefined)
  const disposedRef = useRef(false)
  const errorRef = useRef<string | undefined>(undefined)
  const stoppingRef = useRef(false)
  const fatalErrorRef = useRef(false)
  const operationRef = useRef(0)
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
    if (errorRef.current !== message) callbacksRef.current.onError(message)
    errorRef.current = message
    setError(message)
  }, [])

  const clearError = useCallback(() => {
    errorRef.current = undefined
    if (!disposedRef.current) setError(undefined)
  }, [])

  const stop = useCallback(() => {
    const client = clientRef.current
    if (!client) {
      if (!disposedRef.current) {
        setState('off')
        setPartial('')
        clearError()
        setOwnsResources(false)
      }
      return
    }
    if (stoppingRef.current) return
    const operation = ++operationRef.current
    stoppingRef.current = true
    if (!disposedRef.current) {
      setState('stopping')
      setPartial('')
      setOwnsResources(true)
    }
    const finish = () => {
      if (operationRef.current !== operation) return
      stoppingRef.current = false
      fatalErrorRef.current = false
      if (clientRef.current === client) clientRef.current = undefined
      seenFinalsRef.current.clear()
      if (!disposedRef.current) {
        setState('off')
        setPartial('')
        clearError()
        setOwnsResources(false)
      }
    }
    void client.stop().then(finish, finish)
  }, [clearError])

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
    if (
      !capability?.available
      || disposedRef.current
      || clientRef.current
      || stoppingRef.current
    ) return
    const operation = ++operationRef.current
    setPartial('')
    clearError()
    setState('starting')
    setOwnsResources(true)
    fatalErrorRef.current = false
    seenFinalsRef.current.clear()

    const current = callbacksRef.current
    const client = new OracleVoiceClient({
      language: capability.languages[0] ?? 'auto',
      defaults: current.defaults,
      answerOnly: current.answerOnly,
      onState: (next) => {
        if (
          clientRef.current !== client
          || disposedRef.current
          || stoppingRef.current
        ) return
        if (next === 'off') {
          clientRef.current = undefined
          fatalErrorRef.current = false
          seenFinalsRef.current.clear()
          setOwnsResources(false)
        } else if (next === 'error' && fatalErrorRef.current) {
          clientRef.current = undefined
          fatalErrorRef.current = false
          seenFinalsRef.current.clear()
          setOwnsResources(false)
        }
        setState(next)
        if (
          next === 'listening'
          || next === 'thinking'
          || next === 'speaking'
          || next === 'off'
        ) {
          setPartial('')
        }
        if (next !== 'error' && next !== 'reconnecting') clearError()
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
        if (failure.fatal) {
          fatalErrorRef.current = true
          setState('stopping')
        }
        reportError(failure.message)
      },
    })
    clientRef.current = client

    try {
      await client.start()
    } catch (caught) {
      if (
        operationRef.current !== operation
        || clientRef.current !== client
        || disposedRef.current
        || stoppingRef.current
      ) return
      clientRef.current = undefined
      fatalErrorRef.current = false
      setOwnsResources(false)
      const message = caught instanceof Error ? caught.message : String(caught)
      setState('error')
      reportError(message)
    }
  }, [capability, clearError, reportError])

  return {
    capability,
    state,
    partial,
    error,
    ownsResources,
    start,
    stop,
  }
}
