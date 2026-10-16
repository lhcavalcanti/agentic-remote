// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { transcribeAudio } from './api'
import { recordingDuration, useVoiceRecorder } from './voice-recorder'

vi.mock('./api', () => ({ transcribeAudio: vi.fn() }))

class FakeRecorder extends EventTarget {
  static isTypeSupported = (type: string) => type === 'audio/mp4'
  static last: FakeRecorder | undefined
  state: 'inactive' | 'recording' = 'inactive'
  readonly mimeType: string
  constructor(_stream: unknown, options?: { mimeType?: string }) {
    super()
    this.mimeType = options?.mimeType ?? ''
    FakeRecorder.last = this
  }
  start() {
    this.state = 'recording'
  }
  stop() {
    this.state = 'inactive'
    this.dispatchEvent(Object.assign(new Event('dataavailable'), { data: new Blob(['audio'], { type: 'audio/mp4' }) }))
    this.dispatchEvent(new Event('stop'))
  }
}

describe('useVoiceRecorder', () => {
  let track: { stop: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    vi.useFakeTimers()
    track = { stop: vi.fn() }
    vi.stubGlobal('MediaRecorder', FakeRecorder)
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: vi.fn(async () => ({ getTracks: () => [track] })) },
    })
    vi.mocked(transcribeAudio).mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    Reflect.deleteProperty(navigator, 'mediaDevices')
  })

  it('counts the time recorded and stops by itself at 15 minutes', async () => {
    vi.mocked(transcribeAudio).mockResolvedValue({ transcript: ' long note ' } as Awaited<ReturnType<typeof transcribeAudio>>)
    const onTranscript = vi.fn()
    const { result } = renderHook(() => useVoiceRecorder({ onTranscript, onError: vi.fn() }))
    await act(() => result.current.start())
    expect(result.current.recording).toBe(true)
    act(() => vi.advanceTimersByTime(65_000))
    expect(recordingDuration(result.current.seconds)).toBe('1:05')
    await act(async () => {
      vi.advanceTimersByTime(14 * 60_000)
    })
    expect(result.current.recording).toBe(false)
    expect(FakeRecorder.last?.state).toBe('inactive')
    expect(track.stop).toHaveBeenCalled()
    await act(async () => undefined)
    expect(transcribeAudio).toHaveBeenCalledWith(expect.objectContaining({ name: 'recording.m4a', type: 'audio/mp4' }))
    expect(onTranscript).toHaveBeenCalledWith('long note')
  })

  it('releases the microphone when the page goes away mid-recording', async () => {
    const { result, unmount } = renderHook(() => useVoiceRecorder({ onTranscript: vi.fn(), onError: vi.fn() }))
    await act(() => result.current.start())
    unmount()
    expect(track.stop).toHaveBeenCalled()
    await act(async () => undefined)
    expect(transcribeAudio).not.toHaveBeenCalled()
  })

  it('reports a transcription that fails', async () => {
    vi.mocked(transcribeAudio).mockRejectedValue(new Error('Whisper is not installed on this computer'))
    const onError = vi.fn()
    const { result } = renderHook(() => useVoiceRecorder({ onTranscript: vi.fn(), onError }))
    await act(() => result.current.start())
    await act(async () => {
      result.current.stop()
    })
    await act(async () => undefined)
    expect(onError).toHaveBeenCalledWith('Whisper is not installed on this computer')
    expect(result.current.transcribing).toBe(false)
  })
})
