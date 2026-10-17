import { EventEmitter } from 'node:events'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ORACLE_VOICE_PROTOCOL,
  ORACLE_VOICE_SAMPLE_RATE,
  type VoiceAudioFrame,
  type VoiceCapabilities,
  type VoiceClientControl,
  type VoiceServerControl,
} from '../shared/oracle-voice.js'
import type {
  ManagerClientDefaults,
  ManagerEvent,
  ManagerMessage,
  ManagerSnapshot,
} from '../shared/manager.js'
import {
  OracleVoiceCoordinator,
  type OracleVoiceBackendConnector,
  type OracleVoiceBackendDisconnect,
  type OracleVoiceBackendOutput,
} from './oracle-voice-coordinator.js'

const defaults: ManagerClientDefaults = {
  computerId: 'hub',
  mode: 'autopilot',
  provider: 'copilot',
  model: 'gpt-6-sol',
  reasoningEffort: 'high',
  folders: { hub: '/home/me/src' },
}

const capabilities: VoiceCapabilities = {
  protocol: ORACLE_VOICE_PROTOCOL,
  available: true,
  computerId: 'voice-computer',
  computerName: 'Speech node',
  sampleRate: ORACLE_VOICE_SAMPLE_RATE,
  playbackSampleRate: 22_050,
  languages: ['en'],
  sttProfile: 'zipformer',
  ttsVoice: 'lessac-medium',
  resourceClass: 'low',
  limits: {
    maxFrameBytes: 32 * 1024,
    maxQueueBytes: 64 * 1024,
    maxUtteranceMs: 30_000,
  },
}

function snapshot(
  changes: Partial<ManagerSnapshot> = {},
): ManagerSnapshot {
  return {
    available: true,
    status: 'idle',
    messages: [],
    queued: 0,
    managedSessions: [],
    ...changes,
  }
}

function managerMessage(
  id: string,
  changes: Partial<ManagerMessage> = {},
): ManagerMessage {
  return {
    id,
    role: 'user',
    content: 'Voice request',
    createdAt: '2026-10-17T00:00:00.000Z',
    state: 'queued',
    ...changes,
  }
}

class FakeManager extends EventEmitter<{ event: [event: ManagerEvent] }> {
  readonly calls: string[] = []
  readonly send = vi.fn(async (content: string) => {
    this.calls.push(`manager.send:${content}`)
    this.timeline.push(`manager.send:${content}`)
    return managerMessage(`user-${this.send.mock.calls.length}`)
  })
  readonly cancel = vi.fn(async () => {
    this.calls.push('manager.cancel')
    this.timeline.push('manager.cancel')
  })

  constructor(
    private currentSnapshot: ManagerSnapshot = snapshot(),
    private readonly timeline: string[] = [],
  ) {
    super()
  }

  snapshot(): ManagerSnapshot {
    return structuredClone(this.currentSnapshot)
  }

  setSnapshot(next: ManagerSnapshot): void {
    this.currentSnapshot = next
  }
}

class FakeBackend implements OracleVoiceBackendConnector {
  readonly calls: string[] = []
  readonly controls: VoiceClientControl[] = []
  readonly audio: VoiceAudioFrame[] = []
  readonly closed: string[] = []
  private output:
    | ((message: OracleVoiceBackendOutput) => Promise<void>)
    | undefined
  private disconnect:
    | ((failure: OracleVoiceBackendDisconnect) => Promise<void>)
    | undefined

  constructor(private readonly timeline: string[] = []) {}

  async connect(options: Parameters<OracleVoiceBackendConnector['connect']>[0]) {
    this.output = options.output
    this.disconnect = options.disconnect
    return {
      capabilities,
      control: async (message: VoiceClientControl) => {
        this.controls.push(structuredClone(message))
        if (message.type === 'cancel') {
          this.calls.push(`tts.cancel:${message.generation}`)
          this.timeline.push(`tts.cancel:${message.generation}`)
        } else if (message.type === 'synthesize') {
          this.calls.push(`tts.synthesize:${message.text}`)
          this.timeline.push(`tts.synthesize:${message.text}`)
        }
      },
      audio: async (frame: VoiceAudioFrame) => {
        this.audio.push(frame)
      },
      close: async (reason: string) => {
        this.closed.push(reason)
      },
    }
  }

  emit(message: OracleVoiceBackendOutput): Promise<void> {
    if (!this.output) throw new Error('backend is not connected')
    return this.output(message)
  }

  lose(failure: OracleVoiceBackendDisconnect): Promise<void> {
    if (!this.disconnect) throw new Error('backend is not connected')
    return this.disconnect(failure)
  }
}

interface Harness {
  coordinator: OracleVoiceCoordinator
  manager: FakeManager
  backend: FakeBackend
  browser: OracleVoiceBackendOutput[]
  terminated: Array<{ code: number; reason: string }>
  timeline: string[]
  start(generation?: number, answerOnly?: boolean): Promise<void>
}

function harness(
  managerSnapshot = snapshot(),
  cancelTimeoutMs = 1_000,
  sendFailure?: (message: OracleVoiceBackendOutput) => Error | undefined,
): Harness {
  const timeline: string[] = []
  const manager = new FakeManager(managerSnapshot, timeline)
  const backend = new FakeBackend(timeline)
  const browser: OracleVoiceBackendOutput[] = []
  const terminated: Array<{ code: number; reason: string }> = []
  const coordinator = new OracleVoiceCoordinator({
    streamId: 'stream-1',
    manager,
    managerEvents: manager,
    backend,
    send: async (message) => {
      const failure = sendFailure?.(message)
      if (failure) throw failure
      browser.push(message)
    },
    terminate: (code, reason) => terminated.push({ code, reason }),
    cancelTimeoutMs,
  })
  return {
    coordinator,
    manager,
    backend,
    browser,
    terminated,
    timeline,
    async start(generation = 4, answerOnly = true) {
      await coordinator.start()
      await coordinator.receive(startControl(generation, answerOnly))
    },
  }
}

function control<T extends VoiceClientControl['type']>(
  type: T,
  generation: number,
  fields: Omit<
    Extract<VoiceClientControl, { type: T }>,
    'type' | 'protocol' | 'streamId' | 'generation'
  >,
): Extract<VoiceClientControl, { type: T }> {
  return {
    type,
    protocol: ORACLE_VOICE_PROTOCOL,
    streamId: 'stream-1',
    generation,
    ...fields,
  } as Extract<VoiceClientControl, { type: T }>
}

function startControl(generation: number, answerOnly = true): VoiceClientControl {
  return control('start', generation, {
    language: 'en',
    defaults,
    answerOnly,
  })
}

function confirm(generation: number, utteranceId: string): VoiceClientControl {
  return control('speech_confirmed', generation, { utteranceId })
}

function partial(
  generation: number,
  utteranceId: string,
  text: string,
): Extract<VoiceServerControl, { type: 'partial' | 'final' }> & {
  type: 'partial'
} {
  return {
    type: 'partial',
    protocol: ORACLE_VOICE_PROTOCOL,
    streamId: 'stream-1',
    generation,
    utteranceId,
    text,
  }
}

function final(
  generation: number,
  utteranceId: string,
  text: string,
): Extract<VoiceServerControl, { type: 'partial' | 'final' }> & {
  type: 'final'
} {
  return {
    type: 'final',
    protocol: ORACLE_VOICE_PROTOCOL,
    streamId: 'stream-1',
    generation,
    utteranceId,
    text,
  }
}

function audio(
  generation: number,
  sequence: number,
): VoiceAudioFrame {
  return {
    direction: 'playback',
    generation,
    sequence,
    sampleRate: 22_050,
    samples: new Int16Array([1, -1]),
  }
}

function audioEnd(generation: number, segmentId: string): VoiceServerControl {
  return {
    type: 'audio_end',
    protocol: ORACLE_VOICE_PROTOCOL,
    streamId: 'stream-1',
    generation,
    segmentId,
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('OracleVoiceCoordinator', () => {
  it('submits one final once after confirmed interruption cancels Oracle', async () => {
    const running = managerMessage('external', { state: 'running' })
    const test = harness(snapshot({
      status: 'recovering',
      messages: [running],
    }))
    await test.start(4, true)

    await test.coordinator.receive(confirm(5, 'u5'))
    let finishSend!: (message: ManagerMessage) => void
    test.manager.send.mockImplementationOnce(async (content: string) => {
      test.manager.calls.push(`manager.send:${content}`)
      test.timeline.push(`manager.send:${content}`)
      return new Promise((resolve) => {
        finishSend = resolve
      })
    })
    const first = test.backend.emit(final(5, 'u5', 'Please stop and check tests.'))
    await vi.waitFor(() => expect(test.manager.send).toHaveBeenCalledTimes(1))
    const duplicate = test.backend.emit(final(5, 'u5', 'Please stop and check tests.'))

    expect(test.timeline.slice(0, 3)).toEqual([
      'tts.cancel:4',
      'manager.cancel',
      'manager.send:Please stop and check tests.',
    ])
    expect(test.manager.cancel).toHaveBeenCalledTimes(1)
    expect(test.manager.send).toHaveBeenCalledTimes(1)
    expect(test.manager.send).toHaveBeenCalledWith(
      'Please stop and check tests.',
      defaults,
      { answerOnly: true },
    )

    finishSend(managerMessage('voice-user'))
    await Promise.all([first, duplicate])
    expect(test.manager.send).toHaveBeenCalledTimes(1)
  })

  it('forwards partials for display without submitting them', async () => {
    const test = harness()
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'u1'))

    await test.backend.emit(partial(1, 'u1', 'display only'))

    expect(test.browser).toContainEqual(partial(1, 'u1', 'display only'))
    expect(test.manager.send).not.toHaveBeenCalled()
  })

  it('releases an opened backend when the browser cannot receive hello', async () => {
    const test = harness(snapshot(), 1_000, (message) =>
      !('direction' in message) && message.type === 'hello'
        ? new Error('browser left during startup')
        : undefined)

    await expect(test.coordinator.start())
      .rejects.toThrow('browser left during startup')

    expect(test.backend.closed).toEqual(['Oracle voice failed to start'])
    expect(test.manager.listenerCount('event')).toBe(0)
  })

  it('cancels a known running Oracle turn even before a working status arrives', async () => {
    const test = harness(snapshot({
      status: 'idle',
      messages: [managerMessage('running-user', { state: 'running' })],
    }))
    await test.start(2)

    await test.coordinator.receive(confirm(3, 'u3'))

    expect(test.backend.calls).toContain('tts.cancel:2')
    expect(test.manager.cancel).toHaveBeenCalledOnce()
  })

  it('closes instead of submitting when Oracle cancellation times out', async () => {
    vi.useFakeTimers()
    const test = harness(snapshot({ status: 'working' }), 25)
    test.manager.cancel.mockImplementationOnce(() => new Promise(() => undefined))
    await test.start(2)

    const interrupted = test.coordinator.receive(confirm(3, 'u3'))
    await vi.advanceTimersByTimeAsync(25)

    await expect(interrupted).rejects.toThrow('timed out')
    await test.backend.emit(final(3, 'u3', 'Must not send.'))
    expect(test.manager.send).not.toHaveBeenCalled()
    expect(test.browser).toContainEqual(expect.objectContaining({
      type: 'error',
      code: 'oracle_cancel_timeout',
      fatal: true,
    }))
    expect(test.terminated).toHaveLength(1)
  })

  it('returns a failed exact-once final to the composer without retrying it', async () => {
    const test = harness()
    test.manager.send.mockRejectedValueOnce(new Error('queue unavailable'))
    await test.start(0, false)
    await test.coordinator.receive(confirm(1, 'u1'))

    await test.backend.emit(final(1, 'u1', 'Keep this request.'))
    await test.backend.emit(final(1, 'u1', 'Keep this request.'))

    expect(test.manager.send).toHaveBeenCalledTimes(1)
    expect(test.manager.send).toHaveBeenCalledWith(
      'Keep this request.',
      defaults,
      { answerOnly: false },
    )
    expect(test.browser).toContainEqual(final(1, 'u1', 'Keep this request.'))
    expect(test.browser).toContainEqual(expect.objectContaining({
      type: 'error',
      code: 'oracle_send_failed',
      fatal: false,
    }))
  })

  it('does not call a delivered Oracle message failed when browser state delivery fails', async () => {
    const test = harness(snapshot(), 1_000, (message) =>
      !('direction' in message)
      && message.type === 'state'
      && message.state === 'thinking'
        ? new Error('browser disconnected')
        : undefined)
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'u1'))

    await expect(test.backend.emit(final(1, 'u1', 'Already delivered.')))
      .rejects.toThrow('browser disconnected')

    expect(test.manager.send).toHaveBeenCalledTimes(1)
    expect(test.browser).not.toContainEqual(
      final(1, 'u1', 'Already delivered.'),
    )
    expect(test.browser).not.toContainEqual(expect.objectContaining({
      code: 'oracle_send_failed',
    }))
  })

  it('waits for its queued manager message and speaks replacement snapshots in order', async () => {
    const test = harness()
    test.manager.send.mockResolvedValueOnce(managerMessage('voice-user', {
      content: 'Tell me the result.',
      state: 'queued',
    }))
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'u1'))
    await test.backend.emit(final(1, 'u1', 'Tell me the result.'))

    await test.coordinator.managerEvent({
      type: 'manager.delta',
      messageId: 'external-reply',
      content: 'This must stay silent.',
    })
    expect(test.backend.calls).not.toContain('tts.synthesize:This must stay silent.')

    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('voice-user', { state: 'running' }),
    })
    await test.coordinator.managerEvent({
      type: 'manager.delta',
      messageId: 'voice-reply',
      content: 'First sentence. Second',
    })
    await test.coordinator.managerEvent({
      type: 'manager.delta',
      messageId: 'voice-reply',
      content: 'First sentence. Second sentence.',
    })
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('voice-reply', {
        role: 'assistant',
        replyTo: 'voice-user',
        content: 'First sentence. Second sentence. Final suffix',
        state: undefined,
      }),
    })

    expect(test.backend.calls).toContain('tts.synthesize:First sentence.')
    const syntheses = test.backend.controls.filter(
      (message): message is Extract<VoiceClientControl, { type: 'synthesize' }> =>
        message.type === 'synthesize',
    )
    expect(syntheses).toHaveLength(1)

    await test.backend.emit(audioEnd(1, syntheses[0].segmentId))
    const second = test.backend.controls.filter((message) => message.type === 'synthesize')[1]
    expect(second).toMatchObject({ text: 'Second sentence.' })
    await test.backend.emit(audioEnd(1, second.segmentId))
    const third = test.backend.controls.filter((message) => message.type === 'synthesize')[2]
    expect(third).toMatchObject({ text: 'Final suffix' })
  })

  it('drops stale manager events and TTS audio after a newer interruption', async () => {
    const test = harness()
    test.manager.send
      .mockResolvedValueOnce(managerMessage('old-user'))
      .mockResolvedValueOnce(managerMessage('new-user'))
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'old-utterance'))
    await test.backend.emit(final(1, 'old-utterance', 'Old request.'))
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('old-user', { state: 'running' }),
    })
    await test.coordinator.managerEvent({
      type: 'manager.delta',
      messageId: 'old-reply',
      content: 'Old spoken sentence.',
    })
    const oldSegment = test.backend.controls.find(
      (message): message is Extract<VoiceClientControl, { type: 'synthesize' }> =>
        message.type === 'synthesize',
    )!

    await test.coordinator.receive(confirm(2, 'new-utterance'))
    const browserCount = test.browser.length
    await test.backend.emit(audio(1, 0))
    await test.backend.emit(audioEnd(1, oldSegment.segmentId))
    await test.coordinator.managerEvent({
      type: 'manager.delta',
      messageId: 'old-reply',
      content: 'Old spoken sentence. More stale text.',
    })
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('old-reply', {
        role: 'assistant',
        replyTo: 'old-user',
        content: 'Old spoken sentence. More stale text.',
        state: undefined,
      }),
    })

    expect(test.browser).toHaveLength(browserCount)
    expect(test.backend.calls).not.toContain('tts.synthesize:More stale text.')

    await test.backend.emit(final(2, 'new-utterance', 'New request.'))
    expect(test.manager.send).toHaveBeenCalledTimes(2)
  })

  it('does not speak a late assistant message for a cancelled queued turn', async () => {
    const test = harness()
    test.manager.send.mockResolvedValueOnce(managerMessage('cancelled-user'))
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'u1'))
    await test.backend.emit(final(1, 'u1', 'Queued request.'))
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('cancelled-user', { state: 'running' }),
    })
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('cancelled-user', { state: 'cancelled' }),
    })

    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('late-reply', {
        role: 'assistant',
        replyTo: 'cancelled-user',
        content: 'This stale reply must remain silent.',
        state: undefined,
      }),
    })

    expect(test.backend.calls).not.toContain(
      'tts.synthesize:This stale reply must remain silent.',
    )
  })

  it('ignores a stale assistant ID without consuming the current queued reply', async () => {
    const test = harness()
    test.manager.send.mockResolvedValueOnce(managerMessage('voice-user'))
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'u1'))
    await test.backend.emit(final(1, 'u1', 'Current request.'))
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('voice-user', { state: 'running' }),
    })
    await test.coordinator.managerEvent({
      type: 'manager.delta',
      messageId: 'current-reply',
      content: 'Current sentence.',
    })
    const first = test.backend.controls.find(
      (message): message is Extract<VoiceClientControl, { type: 'synthesize' }> =>
        message.type === 'synthesize',
    )!

    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('stale-reply', {
        role: 'assistant',
        replyTo: 'voice-user',
        content: 'Stale sentence.',
        state: undefined,
      }),
    })
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('current-reply', {
        role: 'assistant',
        replyTo: 'voice-user',
        content: 'Current sentence. Final suffix',
        state: undefined,
      }),
    })
    await test.backend.emit(audioEnd(1, first.segmentId))

    expect(test.backend.calls).toContain('tts.synthesize:Final suffix')
    expect(test.backend.calls).not.toContain('tts.synthesize:Stale sentence.')
  })

  it('releases the backend and event subscription on browser disconnect', async () => {
    const test = harness()
    await test.start()
    expect(test.manager.listenerCount('event')).toBe(1)

    await test.coordinator.close('Browser voice socket closed')
    await test.coordinator.close('Duplicate close')

    expect(test.backend.closed).toEqual(['Browser voice socket closed'])
    expect(test.manager.listenerCount('event')).toBe(0)
  })

  it('ends the transport cleanly when the browser sends stop', async () => {
    const test = harness()
    await test.start(3)

    await test.coordinator.receive(control('stop', 3, {
      reason: 'Conversation stopped',
    }))

    expect(test.terminated).toEqual([{
      code: 1000,
      reason: 'Conversation stopped',
    }])
    expect(test.backend.closed).toEqual(['Conversation stopped'])
  })

  it('reports selected paired-node loss and terminates the browser stream', async () => {
    const test = harness()
    await test.start()

    await test.backend.lose({
      code: 1001,
      reason: 'Paired node registration changed during the voice stream',
    })

    expect(test.browser).toContainEqual(expect.objectContaining({
      type: 'error',
      code: 'voice_backend_disconnected',
      message: expect.stringContaining('Paired node registration changed'),
      fatal: true,
    }))
    expect(test.terminated).toEqual([{
      code: 1001,
      reason: 'Paired node registration changed during the voice stream',
    }])
    expect(test.backend.closed).toHaveLength(1)
  })
})
