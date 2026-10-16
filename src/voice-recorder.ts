import { useCallback, useEffect, useRef, useState } from 'react'
import { transcribeAudio } from './api'

/** "1:05" for a recording that has run 65 seconds. */
export function recordingDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

const MAX_SECONDS = 15 * 60

/**
 * Records from the microphone and hands back what was said, transcribed on
 * the hub like the session composer's recordings. Cancelling, or leaving
 * the page, discards the recording and releases the microphone.
 */
export function useVoiceRecorder({
  onTranscript,
  onError,
}: {
  onTranscript: (text: string) => void
  onError: (message: string) => void
}) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [transcribing, setTranscribing] = useState(false)
  const recorderRef = useRef<MediaRecorder | undefined>(undefined)
  const streamRef = useRef<MediaStream | undefined>(undefined)
  const chunksRef = useRef<Blob[]>([])
  const discardRef = useRef(false)
  const timerRef = useRef<number | undefined>(undefined)
  const callbacks = useRef({ onTranscript, onError })
  useEffect(() => {
    callbacks.current = { onTranscript, onError }
  })

  const release = useCallback(() => {
    if (timerRef.current !== undefined) {
      window.clearInterval(timerRef.current)
      timerRef.current = undefined
    }
    for (const track of streamRef.current?.getTracks() ?? []) track.stop()
    streamRef.current = undefined
    recorderRef.current = undefined
    setRecording(false)
    setSeconds(0)
  }, [])

  const transcribe = useCallback(async (file: File) => {
    setTranscribing(true)
    try {
      const result = await transcribeAudio(file)
      if (result.transcript.trim()) callbacks.current.onTranscript(result.transcript.trim())
    } catch (caught) {
      callbacks.current.onError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setTranscribing(false)
    }
  }, [])

  const stop = useCallback((discard = false) => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') {
      release()
      return
    }
    discardRef.current = discard
    recorder.stop()
  }, [release])

  const start = useCallback(async () => {
    if (recorderRef.current || transcribing) return
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      callbacks.current.onError('Microphone recording is not supported in this browser')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const preferredType = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm']
        .find((type) => MediaRecorder.isTypeSupported(type))
      const recorder = new MediaRecorder(stream, preferredType ? { mimeType: preferredType } : undefined)
      streamRef.current = stream
      recorderRef.current = recorder
      chunksRef.current = []
      discardRef.current = false
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      })
      recorder.addEventListener('stop', () => {
        const chunks = chunksRef.current
        const discarded = discardRef.current
        const mimeType = recorder.mimeType || chunks[0]?.type || 'audio/webm'
        chunksRef.current = []
        release()
        if (discarded || chunks.length === 0) return
        const extension = mimeType.includes('mp4') ? 'm4a' : 'webm'
        void transcribe(new File(chunks, `recording.${extension}`, { type: mimeType }))
      })
      recorder.addEventListener('error', () => {
        release()
        callbacks.current.onError('The microphone recording failed')
      })
      recorder.start(1_000)
      const startedAt = Date.now()
      setRecording(true)
      setSeconds(0)
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAt) / 1_000)
        setSeconds(elapsed)
        if (elapsed >= MAX_SECONDS && recorder.state !== 'inactive') recorder.stop()
      }, 250)
    } catch (caught) {
      release()
      callbacks.current.onError(
        caught instanceof DOMException && caught.name === 'NotAllowedError'
          ? 'Microphone permission was denied'
          : caught instanceof Error ? caught.message : String(caught),
      )
    }
  }, [release, transcribe, transcribing])

  // Leaving never keeps the microphone on.
  useEffect(() => () => {
    discardRef.current = true
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') recorder.stop()
    if (timerRef.current !== undefined) window.clearInterval(timerRef.current)
    for (const track of streamRef.current?.getTracks() ?? []) track.stop()
  }, [])

  return { recording, seconds, transcribing, start, stop }
}
