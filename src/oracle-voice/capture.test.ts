import { describe, expect, it, vi } from 'vitest'
import {
  ORACLE_VOICE_SAMPLE_RATE,
  type VoiceAudioFrame,
  type VoiceClientControl,
} from '../../shared/oracle-voice'
import {
  VoiceCapture,
  VoiceCaptureError,
  type VoiceCaptureDependencies,
  type VoiceVad,
  type VoiceVadOptions,
} from './capture'

type CaptureControl = Extract<
  VoiceClientControl,
  { type: 'speech_tentative' | 'speech_confirmed' | 'speech_end' }
>

describe('VoiceCapture', () => {
  it('buffers tentative pre-roll, flushes it once on confirmation, and emits 16 kHz PCM', async () => {
    const capture = harness({ inputRate: 48_000 })
    await capture.start()

    capture.frame(constantFrame(48, 0))
    capture.tentative()
    capture.frame(constantFrame(48, 0.5))
    capture.confirmed()
    capture.frame(constantFrame(48, 0.25))

    await vi.waitFor(() => expect(capture.sentAudio()).toHaveLength(3))
    expect(capture.sentControls()).toEqual([
      expect.objectContaining({ type: 'speech_tentative', generation: 0 }),
      expect.objectContaining({
        type: 'speech_confirmed',
        generation: 1,
        utteranceId: 'utterance-1',
      }),
    ])
    expect(capture.sentAudio().map(({ generation, sequence, sampleRate }) => ({
      generation,
      sequence,
      sampleRate,
    }))).toEqual([
      { generation: 1, sequence: 0, sampleRate: ORACLE_VOICE_SAMPLE_RATE },
      { generation: 1, sequence: 1, sampleRate: ORACLE_VOICE_SAMPLE_RATE },
      { generation: 1, sequence: 2, sampleRate: ORACLE_VOICE_SAMPLE_RATE },
    ])
  })

  it('reports permission denial without loading MicVAD and releases no phantom stream', async () => {
    const capture = harness({
      getUserMedia: vi.fn().mockRejectedValue(
        new DOMException('Permission denied', 'NotAllowedError'),
      ),
    })

    await expect(capture.start()).rejects.toMatchObject({
      code: 'permission-denied',
      dictationFallback: true,
    })
    expect(capture.errors()).toEqual([
      expect.objectContaining({
        code: 'permission-denied',
        message: 'Microphone permission was denied. Dictation is still available.',
      }),
    ])
    expect(capture.createVad).not.toHaveBeenCalled()
  })

  it('reports missing media devices as a dictation fallback', async () => {
    const capture = harness({ mediaDevices: undefined })

    await expect(capture.start()).rejects.toMatchObject({
      code: 'media-devices-unavailable',
      dictationFallback: true,
    })
    expect(capture.getUserMedia).not.toHaveBeenCalled()
    expect(capture.createVad).not.toHaveBeenCalled()
  })

  it('requires AudioWorklet before requesting permission or loading MicVAD', async () => {
    const capture = harness({ audioWorkletSupported: false })

    await expect(capture.start()).rejects.toEqual(expect.objectContaining({
      code: 'audio-worklet-unavailable',
      dictationFallback: true,
      message: 'Conversation requires AudioWorklet. Use dictation in this browser.',
    }))
    expect(capture.getUserMedia).not.toHaveBeenCalled()
    expect(capture.createVad).not.toHaveBeenCalled()
  })

  it('releases microphone and context when AudioContext resume fails', async () => {
    const capture = harness({
      contextState: 'suspended',
      resumeError: new Error('Audio output is blocked'),
    })

    await expect(capture.start()).rejects.toMatchObject({
      code: 'capture-failed',
      message: 'Audio output is blocked',
    })
    expect(capture.track.stop).toHaveBeenCalledOnce()
    expect(capture.context.close).toHaveBeenCalledOnce()
    expect(capture.createVad).not.toHaveBeenCalled()
  })

  it('stops a microphone that resolves after permission is no longer wanted', async () => {
    let resolvePermission!: (stream: MediaStream) => void
    const pending = new Promise<MediaStream>((resolve) => {
      resolvePermission = resolve
    })
    const capture = harness({
      getUserMedia: vi.fn().mockReturnValue(pending),
    })

    const starting = capture.start()
    await capture.stop()
    resolvePermission(capture.stream)
    await starting

    expect(capture.track.stop).toHaveBeenCalledOnce()
    expect(capture.createVad).not.toHaveBeenCalled()
    expect(capture.context.close).not.toHaveBeenCalled()
  })

  it('restores playback after a VAD misfire without sending buffered audio', async () => {
    const capture = harness()
    await capture.start()

    capture.frame(constantFrame(512, 0.25))
    capture.tentative()
    capture.misfire()

    expect(capture.tentativeSpeech).toHaveBeenCalledOnce()
    expect(capture.restorePlayback).toHaveBeenCalledOnce()
    expect(capture.sentAudio()).toEqual([])
    expect(capture.sentControls()).toEqual([
      expect.objectContaining({ type: 'speech_tentative', generation: 0 }),
    ])
  })

  it('caps pre-roll before confirmation', async () => {
    const capture = harness({
      maxPreRollBytes: 8,
      inputRate: ORACLE_VOICE_SAMPLE_RATE,
    })
    await capture.start()

    capture.frame(new Float32Array([0.1, 0.1]))
    capture.frame(new Float32Array([0.2, 0.2]))
    capture.frame(new Float32Array([0.3, 0.3]))
    capture.tentative()
    capture.confirmed()

    await vi.waitFor(() => expect(capture.sentAudio()).toHaveLength(2))
    expect(capture.sentAudio().map((frame) => [...frame.samples])).toEqual([
      [6553, 6553],
      [9830, 9830],
    ])
  })

  it('fails closed when the outbound frame queue overflows', async () => {
    let releaseSend!: () => void
    const blocked = new Promise<void>((resolve) => {
      releaseSend = resolve
    })
    const capture = harness({
      inputRate: ORACLE_VOICE_SAMPLE_RATE,
      maxQueueBytes: 54,
      sendAudio: vi.fn().mockReturnValue(blocked),
    })
    await capture.start()

    capture.frame(new Float32Array([0.25]))
    capture.confirmed()
    capture.frame(new Float32Array([0.5]))
    capture.frame(new Float32Array([0.75]))

    await vi.waitFor(() => expect(capture.errors()).toEqual([
      expect.objectContaining({ code: 'frame-queue-overflow' }),
    ]))
    releaseSend()
    await capture.stop()
    expect(capture.track.stop).toHaveBeenCalledOnce()
  })

  it('submits the bounded prefix when speech exceeds the advertised duration', async () => {
    const capture = harness({
      inputRate: ORACLE_VOICE_SAMPLE_RATE,
      maxUtteranceMs: 1,
    })
    await capture.start()
    capture.confirmed()

    capture.frame(constantFrame(10, 0.25))
    capture.frame(constantFrame(10, 0.5))
    capture.frame(constantFrame(10, 0.75))

    await vi.waitFor(() => expect(capture.sentAudio()).toHaveLength(2))
    expect(capture.sentAudio().map((frame) => frame.samples.length)).toEqual([10, 6])
    expect(capture.sentControls()).toContainEqual(expect.objectContaining({
      type: 'speech_end',
      generation: 1,
      utteranceId: 'utterance-1',
    }))
    expect(capture.utteranceLimit).toHaveBeenCalledWith(1)
    expect(capture.errors()).toEqual([])

    capture.speechEnd()
    capture.tentative()
    capture.confirmed()
    capture.frame(constantFrame(4, 0.5))
    await vi.waitFor(() => expect(capture.sentAudio()).toHaveLength(3))
    expect(capture.sentAudio().at(-1)?.samples).toHaveLength(4)
  })

  it('sends an endpoint for the current utterance and releases every microphone resource', async () => {
    const capture = harness()
    await capture.start()
    capture.frame(constantFrame(512, 0.25))
    capture.confirmed()

    capture.speechEnd()
    await capture.stop()
    await capture.stop()

    expect(capture.sentControls()).toContainEqual(expect.objectContaining({
      type: 'speech_end',
      generation: 1,
      utteranceId: 'utterance-1',
    }))
    expect(capture.vad.destroy).toHaveBeenCalledOnce()
    expect(capture.track.stop).toHaveBeenCalledOnce()
    expect(capture.context.close).toHaveBeenCalledOnce()
  })

  it('passes only local VAD, worklet, and ONNX asset paths to MicVAD', async () => {
    const capture = harness()

    await capture.start()

    const options = capture.createVad.mock.calls[0][0]
    expect(options).toMatchObject({
      audioContext: capture.context,
      model: 'v5',
      processorType: 'AudioWorklet',
      startOnLoad: true,
    })
    expect(options.baseAssetPath).toMatch(/^\/.*\/$/)
    expect(options.onnxWASMBasePath).toMatch(/^\/.*\/$/)
    expect(`${options.baseAssetPath}${options.onnxWASMBasePath}`)
      .not.toMatch(/(?:cdn|unpkg|jsdelivr)/i)
    await expect(options.getStream()).resolves.toBe(capture.stream)
  })
})

function harness({
  inputRate = ORACLE_VOICE_SAMPLE_RATE,
  maxPreRollBytes = 64 * 1024,
  maxQueueBytes = 256 * 1024,
  maxUtteranceMs = 30_000,
  audioWorkletSupported = true,
  mediaDevices,
  getUserMedia,
  sendAudio,
  contextState = 'running',
  resumeError,
}: {
  inputRate?: number
  maxPreRollBytes?: number
  maxQueueBytes?: number
  maxUtteranceMs?: number
  audioWorkletSupported?: boolean
  mediaDevices?: Pick<MediaDevices, 'getUserMedia'>
  getUserMedia?: ReturnType<typeof vi.fn>
  sendAudio?: (frame: VoiceAudioFrame) => void | Promise<void>
  contextState?: AudioContextState
  resumeError?: Error
} = {}) {
  const track = { stop: vi.fn() }
  const stream = {
    getTracks: () => [track],
  } as unknown as MediaStream
  const request = getUserMedia ?? vi.fn().mockResolvedValue(stream)
  const selectedMediaDevices = arguments[0] && 'mediaDevices' in arguments[0]
    ? mediaDevices
    : { getUserMedia: request as MediaDevices['getUserMedia'] }
  const context = {
    audioWorklet: { addModule: vi.fn() },
    close: vi.fn().mockResolvedValue(undefined),
    resume: resumeError
      ? vi.fn().mockRejectedValue(resumeError)
      : vi.fn().mockResolvedValue(undefined),
    sampleRate: inputRate,
    state: contextState,
  } as unknown as AudioContext
  let vadOptions: VoiceVadOptions | undefined
  const vad: VoiceVad = {
    destroy: vi.fn().mockResolvedValue(undefined),
  }
  const createVad = vi.fn(async (options: VoiceVadOptions) => {
    vadOptions = options
    await options.getStream()
    return vad
  })
  const controls: CaptureControl[] = []
  const audio: VoiceAudioFrame[] = []
  const errors: VoiceCaptureError[] = []
  const tentativeSpeech = vi.fn()
  const restorePlayback = vi.fn()
  const utteranceLimit = vi.fn()
  const audioSink = sendAudio ?? vi.fn(async (frame: VoiceAudioFrame) => {
    audio.push(frame)
  })
  const dependencies: VoiceCaptureDependencies = {
    mediaDevices: selectedMediaDevices,
    audioWorkletSupported: () => audioWorkletSupported,
    createAudioContext: () => context,
    createVad,
    createUtteranceId: () => 'utterance-1',
  }
  const instance = new VoiceCapture({
    streamId: 'stream-1',
    initialGeneration: 0,
    inputSampleRate: inputRate,
    maxPreRollBytes,
    maxQueueBytes,
    maxUtteranceMs,
    dependencies,
    sendControl: (control) => controls.push(control as CaptureControl),
    sendAudio: audioSink,
    onTentativeSpeech: tentativeSpeech,
    onVadMisfire: restorePlayback,
    onUtteranceLimit: utteranceLimit,
    onError: (error) => errors.push(error),
  })

  return {
    instance,
    start: () => instance.start(),
    stop: () => instance.stop(),
    frame: (frame: Float32Array) => vadOptions?.onFrameProcessed({}, frame),
    tentative: () => vadOptions?.onSpeechStart(),
    confirmed: () => vadOptions?.onSpeechRealStart(),
    misfire: () => vadOptions?.onVADMisfire(),
    speechEnd: () => vadOptions?.onSpeechEnd(new Float32Array()),
    sentControls: () => controls,
    sentAudio: () => audio,
    errors: () => errors,
    track,
    stream,
    context,
    vad,
    createVad,
    getUserMedia: request,
    tentativeSpeech,
    restorePlayback,
    utteranceLimit,
  }
}

function constantFrame(length: number, value: number): Float32Array {
  return Float32Array.from({ length }, () => value)
}
