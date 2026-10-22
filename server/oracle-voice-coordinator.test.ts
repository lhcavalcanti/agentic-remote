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
  readonly cancelMessage = vi.fn(async (messageId: string) => {
    this.calls.push(`manager.cancelMessage:${messageId}`)
    this.timeline.push(`manager.cancelMessage:${messageId}`)
    return managerMessage(messageId, { state: 'cancelled', source: 'voice' })
  })
  readonly removeQueued = vi.fn(async (messageId: string) => {
    this.calls.push(`manager.removeQueued:${messageId}`)
    this.timeline.push(`manager.removeQueued:${messageId}`)
    return managerMessage(messageId, { state: 'cancelled' })
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
  readonly closeStarted: Promise<void>
  readonly deliveryTimeline: string[] = []
  readonly cancelControl = vi.fn(async (): Promise<void> => undefined)
  readonly confirmationControl = vi.fn(async (): Promise<void> => undefined)
  readonly audioDelivery = vi.fn(async (_frame: VoiceAudioFrame): Promise<void> => undefined)
  private output:
    | ((message: OracleVoiceBackendOutput) => Promise<void>)
    | undefined
  private disconnect:
    | ((failure: OracleVoiceBackendDisconnect) => Promise<void>)
    | undefined
  private readonly resolveCloseStarted: () => void
  private deliveryTail: Promise<void> = Promise.resolve()

  constructor(private readonly timeline: string[] = []) {
    let resolveCloseStarted!: () => void
    this.closeStarted = new Promise<void>((resolve) => {
      resolveCloseStarted = resolve
    })
    this.resolveCloseStarted = resolveCloseStarted
  }

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
          await this.cancelControl()
        } else if (message.type === 'speech_confirmed') {
          this.calls.push(`stt.confirm:${message.generation}`)
          this.timeline.push(`stt.confirm:${message.generation}`)
          await this.confirmationControl()
        } else if (message.type === 'synthesize') {
          this.calls.push(`tts.synthesize:${message.text}`)
          this.timeline.push(`tts.synthesize:${message.text}`)
        }
      },
      audio: async (frame: VoiceAudioFrame) => {
        this.audio.push(frame)
        this.timeline.push(`stt.audio:${frame.generation}:${frame.sequence}`)
        await this.audioDelivery(frame)
      },
      close: async (reason: string) => {
        this.deliveryTimeline.push(`backend.close.start:${reason}`)
        this.resolveCloseStarted()
        await this.deliveryTail
        this.closed.push(reason)
        this.deliveryTimeline.push(`backend.close.done:${reason}`)
      },
    }
  }

  emit(message: OracleVoiceBackendOutput): Promise<void> {
    if (!this.output) throw new Error('backend is not connected')
    let finishDelivery!: () => void
    const delivery = new Promise<void>((resolve) => {
      finishDelivery = resolve
    })
    this.deliveryTail = this.deliveryTail.then(() => delivery)
    this.deliveryTimeline.push('backend.output.start')
    const delivered = this.output(message)
    void delivered.then(
      () => {
        this.deliveryTimeline.push('backend.output.done')
        finishDelivery()
      },
      () => {
        this.deliveryTimeline.push('backend.output.done')
        finishDelivery()
      },
    )
    return delivered
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
  observeSend?: (message: OracleVoiceBackendOutput) => void | Promise<void>,
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
      await observeSend?.(message)
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
  segmentId: string,
  sequence: number,
): VoiceAudioFrame & { segmentId: string } {
  return {
    direction: 'playback',
    generation,
    segmentId,
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
  it('submits Delegate-started voice finals as Ask only with voice provenance', async () => {
    const test = harness()
    await test.start(0, false)
    await test.coordinator.receive(confirm(1, 'delegate-voice'))

    await test.backend.emit(final(
      1,
      'delegate-voice',
      'Do not let nearby speech delegate work.',
    ))

    expect(test.manager.send).toHaveBeenCalledWith(
      'Do not let nearby speech delegate work.',
      defaults,
      { answerOnly: true, source: 'voice' },
    )
  })

  it('does not cancel an unrelated typed manager turn when speech is confirmed', async () => {
    const running = managerMessage('external', { state: 'running' })
    const test = harness(snapshot({
      status: 'recovering',
      messages: [running],
    }))
    await test.start(4, true)

    await test.coordinator.receive(confirm(5, 'u5'))
    expect(test.manager.cancel).not.toHaveBeenCalled()
    expect(test.manager.removeQueued).not.toHaveBeenCalled()
    expect(test.backend.calls).not.toContain('tts.cancel:4')
  })

  it('submits one final once after confirmed interruption cancels owned voice work', async () => {
    const test = harness()
    test.manager.send.mockResolvedValueOnce(managerMessage('voice-running', {
      state: 'running',
      source: 'voice',
    }))
    await test.start(4, true)
    await test.coordinator.receive(confirm(5, 'u5'))
    await test.backend.emit(final(5, 'u5', 'First request.'))
    test.manager.setSnapshot(snapshot({
      status: 'working',
      messages: [managerMessage('voice-running', {
        state: 'running',
        source: 'voice',
      })],
    }))
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('voice-running', {
        state: 'running',
        source: 'voice',
      }),
    })

    await test.coordinator.receive(confirm(6, 'u6'))
    let finishSend!: (message: ManagerMessage) => void
    test.manager.send.mockImplementationOnce(async (content: string) => {
      test.manager.calls.push(`manager.send:${content}`)
      test.timeline.push(`manager.send:${content}`)
      return new Promise((resolve) => {
        finishSend = resolve
      })
    })
    const first = test.backend.emit(final(6, 'u6', 'Please stop and check tests.'))
    await vi.waitFor(() => expect(test.manager.send).toHaveBeenCalledTimes(2))
    const duplicate = test.backend.emit(final(6, 'u6', 'Please stop and check tests.'))

    expect(test.timeline).toContain('tts.cancel:5')
    expect(test.timeline).toContain('manager.cancelMessage:voice-running')
    expect(test.timeline.slice(-2)).toEqual([
      'manager.cancelMessage:voice-running',
      'manager.send:Please stop and check tests.',
    ])
    expect(test.manager.cancelMessage).toHaveBeenCalledTimes(1)
    expect(test.manager.cancel).not.toHaveBeenCalled()
    expect(test.manager.send).toHaveBeenCalledTimes(2)
    expect(test.manager.send).toHaveBeenLastCalledWith(
      'Please stop and check tests.',
      defaults,
      { answerOnly: true, source: 'voice' },
    )

    finishSend(managerMessage('voice-user'))
    await Promise.all([first, duplicate])
    expect(test.manager.send).toHaveBeenCalledTimes(2)
  })

  it('preserves an endpoint-pending final when the next utterance starts first', async () => {
    const test = harness()
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'u1'))
    await test.coordinator.receive(control('speech_end', 1, {
      utteranceId: 'u1',
    }))
    await test.coordinator.receive(confirm(2, 'u2'))

    await test.backend.emit(final(1, 'u1', 'First request.'))
    await test.coordinator.receive(control('speech_end', 2, {
      utteranceId: 'u2',
    }))
    await test.backend.emit(final(2, 'u2', 'Second request.'))
    await test.backend.emit(final(1, 'u1', 'First request.'))

    expect(test.manager.send.mock.calls.map(([content]) => content)).toEqual([
      'First request.',
      'Second request.',
    ])
    expect(test.manager.cancelMessage).toHaveBeenCalledWith('user-1')
  })

  it('expires a superseded endpoint-pending final explicitly', async () => {
    const test = harness(snapshot(), 10)
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'u1'))
    await test.coordinator.receive(control('speech_end', 1, {
      utteranceId: 'u1',
    }))
    vi.useFakeTimers()
    await test.coordinator.receive(confirm(2, 'u2'))

    await vi.advanceTimersByTimeAsync(10)
    await test.backend.emit(final(1, 'u1', 'Too late.'))

    expect(test.browser).toContainEqual(expect.objectContaining({
      type: 'error',
      generation: 2,
      code: 'stt_final_timeout',
      fatal: false,
    }))
    expect(test.manager.send).not.toHaveBeenCalled()
  })

  it('speaks a completed terminal sentence when Oracle starts a tool call', async () => {
    const test = harness()
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'u1'))
    await test.backend.emit(final(1, 'u1', 'Check the service.'))
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('user-1', { state: 'running', source: 'voice' }),
    })
    await test.coordinator.managerEvent({
      type: 'manager.delta',
      messageId: 'assistant-1',
      content: 'I will check that now.',
    })
    expect(test.backend.calls).not.toContain('tts.synthesize:I will check that now.')

    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('activity-1', {
        role: 'activity',
        content: 'Running health check',
      }),
    })

    expect(test.backend.calls).toContain('tts.synthesize:I will check that now.')
  })

  it('cancels stale queued voice work by ID before accepting the next utterance', async () => {
    const test = harness()
    test.manager.send.mockResolvedValueOnce(managerMessage('voice-queued', {
      state: 'queued',
      source: 'voice',
    }))
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'u1'))
    await test.backend.emit(final(1, 'u1', 'Queued voice request.'))
    test.manager.setSnapshot(snapshot({
      status: 'working',
      queued: 1,
      messages: [managerMessage('voice-queued', {
        state: 'queued',
        source: 'voice',
      })],
    }))

    await test.coordinator.receive(confirm(2, 'u2'))

    expect(test.manager.cancelMessage).toHaveBeenCalledWith('voice-queued')
    expect(test.manager.removeQueued).not.toHaveBeenCalled()
    expect(test.manager.cancel).not.toHaveBeenCalled()
  })

  it('cancels a captured queued voice ID after it becomes running during backend confirmation', async () => {
    const test = harness()
    test.manager.send.mockResolvedValueOnce(managerMessage('voice-transition', {
      state: 'queued',
      source: 'voice',
    }))
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'u1'))
    await test.backend.emit(final(1, 'u1', 'Queued voice request.'))
    test.manager.setSnapshot(snapshot({
      status: 'working',
      queued: 1,
      messages: [managerMessage('voice-transition', {
        state: 'queued',
        source: 'voice',
      })],
    }))
    let releaseConfirmation!: () => void
    test.backend.confirmationControl.mockImplementationOnce(() =>
      new Promise<void>((resolve) => {
        releaseConfirmation = resolve
      }))

    const interrupted = test.coordinator.receive(confirm(2, 'u2'))
    await vi.waitFor(() => expect(test.backend.confirmationControl).toHaveBeenCalledTimes(2))
    test.manager.setSnapshot(snapshot({
      status: 'working',
      messages: [managerMessage('voice-transition', {
        state: 'running',
        source: 'voice',
      })],
    }))
    releaseConfirmation()
    await interrupted

    expect(test.manager.cancelMessage).toHaveBeenCalledTimes(1)
    expect(test.manager.cancelMessage).toHaveBeenCalledWith('voice-transition')
    expect(test.manager.cancel).not.toHaveBeenCalled()
    expect(test.manager.removeQueued).not.toHaveBeenCalled()
  })

  it('forwards partials for display without submitting them', async () => {
    const test = harness()
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'u1'))

    await test.backend.emit(partial(1, 'u1', 'display only'))

    expect(test.browser).toContainEqual(partial(1, 'u1', 'display only'))
    expect(test.manager.send).not.toHaveBeenCalled()
  })

  it('returns to listening when a completed assistant reply has no speakable segments', async () => {
    const test = harness()
    test.manager.send.mockResolvedValueOnce(managerMessage('silent-user', {
      state: 'running',
      source: 'voice',
    }))
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'silent-1'))
    await test.backend.emit(final(1, 'silent-1', 'Show code only.'))
    test.manager.setSnapshot(snapshot({
      status: 'working',
      messages: [managerMessage('silent-user', {
        state: 'running',
        source: 'voice',
      })],
    }))
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('silent-user', {
        state: 'running',
        source: 'voice',
      }),
    })

    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('silent-assistant', {
        role: 'assistant',
        replyTo: 'silent-user',
        content: '```ts\nconst answer = 42\n```',
        state: undefined,
      }),
    })

    expect(test.backend.calls.filter((call) => call.startsWith('tts.synthesize:')))
      .toEqual([])
    expect(test.browser).toContainEqual(expect.objectContaining({
      type: 'state',
      generation: 1,
      state: 'listening',
    }))
  })

  it('returns to listening at idle when a successful voice turn has no assistant row', async () => {
    const test = harness()
    test.manager.send.mockResolvedValueOnce(managerMessage('empty-user', {
      state: 'running',
      source: 'voice',
    }))
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'empty-1'))
    await test.backend.emit(final(1, 'empty-1', 'Return nothing.'))
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('empty-user', {
        state: 'done',
        source: 'voice',
      }),
    })
    await test.coordinator.managerEvent({
      type: 'manager.status',
      status: 'idle',
      queued: 0,
    })
    await test.coordinator.managerEvent({
      type: 'manager.status',
      status: 'idle',
      queued: 0,
    })

    expect(test.browser.filter((message) =>
      !('direction' in message)
      && message.type === 'state'
      && message.generation === 1
      && message.state === 'listening')).toHaveLength(1)
  })

  it.each([
    ['', 'empty'],
    ['```ts\nconst answer = 42\n```', 'filtered'],
  ])('keeps a done voice association for a late %s assistant row', async (
    content,
  ) => {
    const test = harness()
    test.manager.send.mockResolvedValueOnce(managerMessage('late-user', {
      state: 'running',
      source: 'voice',
    }))
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'late-1'))
    await test.backend.emit(final(1, 'late-1', 'Answer later.'))
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('late-user', {
        state: 'done',
        source: 'voice',
      }),
    })
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('late-assistant', {
        role: 'assistant',
        replyTo: 'late-user',
        content,
        state: undefined,
      }),
    })
    await test.coordinator.managerEvent({
      type: 'manager.status',
      status: 'idle',
      queued: 0,
    })

    expect(test.backend.calls.filter((call) => call.startsWith('tts.synthesize:')))
      .toEqual([])
    expect(test.browser.filter((message) =>
      !('direction' in message)
      && message.type === 'state'
      && message.generation === 1
      && message.state === 'listening')).toHaveLength(1)
  })

  it('speaks a late assistant row emitted after the successful user completion', async () => {
    const test = harness()
    test.manager.send.mockResolvedValueOnce(managerMessage('late-user', {
      state: 'running',
      source: 'voice',
    }))
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'late-1'))
    await test.backend.emit(final(1, 'late-1', 'Answer later.'))
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('late-user', {
        state: 'done',
        source: 'voice',
      }),
    })
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('late-assistant', {
        role: 'assistant',
        replyTo: 'late-user',
        content: 'Late answer.',
        state: undefined,
      }),
    })

    expect(test.backend.calls).toContain('tts.synthesize:Late answer.')
  })

  it('does not speak typed deltas after an assistantless voice turn completes', async () => {
    const test = harness()
    test.manager.send.mockResolvedValueOnce(managerMessage('voice-user', {
      state: 'running',
      source: 'voice',
    }))
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'voice-utterance'))
    await test.backend.emit(final(1, 'voice-utterance', 'Answer briefly.'))
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('voice-user', {
        state: 'done',
        source: 'voice',
      }),
    })
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('typed-user', {
        state: 'running',
        source: 'typed',
      }),
    })
    await test.coordinator.managerEvent({
      type: 'manager.delta',
      messageId: 'typed-assistant',
      content: 'Typed work must stay silent.',
    })

    expect(test.backend.calls.filter((call) => call.startsWith('tts.synthesize:')))
      .toEqual([])
    expect(test.browser.filter((message) =>
      !('direction' in message)
      && message.type === 'state'
      && message.generation === 1
      && message.state === 'listening')).toHaveLength(1)
  })

  it.each(['failed', 'cancelled', 'interrupted'] as const)(
    'does not report listening for an assistantless %s voice turn',
    async (state) => {
      const test = harness()
      test.manager.send.mockResolvedValueOnce(managerMessage('terminal-user', {
        state: 'running',
        source: 'voice',
      }))
      await test.start(0)
      await test.coordinator.receive(confirm(1, 'terminal-1'))
      await test.backend.emit(final(1, 'terminal-1', 'Do not complete.'))
      await test.coordinator.managerEvent({
        type: 'manager.message',
        message: managerMessage('terminal-user', {
          state,
          source: 'voice',
        }),
      })
      await test.coordinator.managerEvent({
        type: 'manager.status',
        status: 'idle',
        queued: 0,
      })

      expect(test.browser.some((message) =>
        !('direction' in message)
        && message.type === 'state'
        && message.generation === 1
        && message.state === 'listening')).toBe(false)
    },
  )

  it('does not let an older assistantless completion reset a newer generation', async () => {
    const test = harness()
    test.manager.send.mockResolvedValueOnce(managerMessage('old-empty-user', {
      state: 'running',
      source: 'voice',
    }))
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'old-empty'))
    await test.backend.emit(final(1, 'old-empty', 'Old empty response.'))
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('old-empty-user', {
        state: 'done',
        source: 'voice',
      }),
    })
    await test.coordinator.receive(confirm(2, 'new-utterance'))
    await test.coordinator.managerEvent({
      type: 'manager.status',
      status: 'idle',
      queued: 0,
    })

    expect(test.browser.some((message) =>
      !('direction' in message)
      && message.type === 'state'
      && message.generation === 2
      && message.state === 'listening')).toBe(false)
  })

  it('finishes a fatal backend callback before draining and closing it', async () => {
    const test = harness()
    await test.start(0)

    const delivery = test.backend.emit({
      type: 'error',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: 'stream-1',
      generation: 0,
      code: 'voice_backend_failed',
      message: 'Voice worker failed',
      fatal: true,
    })
    await test.backend.closeStarted

    const deliveryDone = test.backend.deliveryTimeline.indexOf('backend.output.done')
    const closeStarted = test.backend.deliveryTimeline.indexOf(
      'backend.close.start:Voice worker failed',
    )
    expect(deliveryDone).toBeGreaterThanOrEqual(0)
    expect(deliveryDone).toBeLessThan(closeStarted)

    await delivery
    await test.coordinator.close('Voice worker failed')
    expect(test.backend.closed).toEqual(['Voice worker failed'])
  })

  it('does not treat a working status before browser start as voice-owned work', async () => {
    const test = harness()
    await test.coordinator.start()
    test.manager.emit('event', {
      type: 'manager.status',
      status: 'working',
      queued: 0,
    })

    await test.start(2)
    await test.coordinator.receive(confirm(3, 'u3'))

    expect(test.backend.calls).not.toContain('tts.cancel:2')
    expect(test.manager.cancel).not.toHaveBeenCalled()
  })

  it('does not treat a typed running message before browser start as voice-owned work', async () => {
    const test = harness()
    await test.coordinator.start()
    test.manager.emit('event', {
      type: 'manager.message',
      message: managerMessage('started-before-browser', { state: 'running' }),
    })

    await test.start(2)
    await test.coordinator.receive(confirm(3, 'u3'))

    expect(test.backend.calls).not.toContain('tts.cancel:2')
    expect(test.manager.cancel).not.toHaveBeenCalled()
  })

  it('rejects speech end for a different same-generation utterance', async () => {
    const test = harness()
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'active-utterance'))

    await expect(test.coordinator.receive(control('speech_end', 1, {
      utteranceId: 'stale-utterance',
    }))).rejects.toThrow('active utterance')
  })

  it('drops partials and finals for a different same-generation utterance', async () => {
    const test = harness()
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'active-utterance'))

    await test.backend.emit(partial(1, 'stale-utterance', 'Stale partial'))
    await test.backend.emit(final(1, 'stale-utterance', 'Stale final'))

    expect(test.browser).not.toContainEqual(
      partial(1, 'stale-utterance', 'Stale partial'),
    )
    expect(test.manager.send).not.toHaveBeenCalled()

    await test.backend.emit(partial(1, 'active-utterance', 'Current partial'))
    await test.backend.emit(final(1, 'active-utterance', 'Current final'))
    expect(test.browser).toContainEqual(
      partial(1, 'active-utterance', 'Current partial'),
    )
    expect(test.manager.send).toHaveBeenCalledWith(
      'Current final',
      defaults,
      { answerOnly: true, source: 'voice' },
    )
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

  it('does not cancel a pre-existing running Oracle turn owned outside voice', async () => {
    const test = harness(snapshot({
      status: 'idle',
      messages: [managerMessage('running-user', { state: 'running' })],
    }))
    await test.start(2)

    await test.coordinator.receive(confirm(3, 'u3'))

    expect(test.backend.calls).not.toContain('tts.cancel:2')
    expect(test.manager.cancel).not.toHaveBeenCalled()
  })

  it('scopes cancellation to voice when a typed turn replaces it while TTS cancellation waits', async () => {
    const test = harness()
    test.manager.send.mockResolvedValueOnce(managerMessage('voice-running', {
      state: 'running',
      source: 'voice',
    }))
    await test.start(1)
    await test.coordinator.receive(confirm(2, 'u2'))
    await test.backend.emit(final(2, 'u2', 'Running voice request.'))
    test.manager.setSnapshot(snapshot({
      status: 'working',
      messages: [managerMessage('voice-running', {
        state: 'running',
        source: 'voice',
      })],
    }))
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('voice-running', {
        state: 'running',
        source: 'voice',
      }),
    })
    let releaseCancel!: () => void
    const cancelGate = new Promise<void>((resolve) => {
      releaseCancel = resolve
    })
    test.backend.cancelControl.mockImplementationOnce(() => cancelGate)

    const interrupted = test.coordinator.receive(confirm(3, 'u3'))
    await vi.waitFor(() => expect(test.backend.cancelControl).toHaveBeenCalledOnce())
    test.manager.setSnapshot(snapshot({
      status: 'working',
      messages: [
        managerMessage('voice-running', {
          state: 'done',
          source: 'voice',
        }),
        managerMessage('typed-running', { state: 'running' }),
      ],
    }))
    releaseCancel()
    await interrupted

    expect(test.manager.cancelMessage).toHaveBeenCalledWith('voice-running')
    expect(test.manager.cancel).not.toHaveBeenCalled()
  })

  it('drains confirmed current microphone frames in order while barge-in cancellation waits', async () => {
    const test = harness()
    test.manager.send.mockResolvedValueOnce(managerMessage('voice-running', {
      state: 'running',
      source: 'voice',
    }))
    await test.start(1)
    await test.coordinator.receive(confirm(2, 'u2'))
    await test.backend.emit(final(2, 'u2', 'Running voice request.'))
    test.manager.setSnapshot(snapshot({
      status: 'working',
      messages: [managerMessage('voice-running', {
        state: 'running',
        source: 'voice',
      })],
    }))
    let releaseCancel!: () => void
    const cancelGate = new Promise<void>((resolve) => {
      releaseCancel = resolve
    })
    test.backend.cancelControl.mockImplementationOnce(() => cancelGate)
    let releaseConfirmation!: () => void
    const confirmationGate = new Promise<void>((resolve) => {
      releaseConfirmation = resolve
    })
    test.backend.confirmationControl.mockImplementationOnce(() => confirmationGate)

    const interrupted = test.coordinator.receive(confirm(3, 'u3'))
    await vi.waitFor(() => expect(test.backend.cancelControl).toHaveBeenCalledOnce())
    await vi.waitFor(() => expect(test.backend.confirmationControl).toHaveBeenCalledTimes(2))
    const accepted = Promise.all(Array.from({ length: 30 }, (_, sequence) =>
      test.coordinator.receive({
        direction: 'microphone',
        generation: 3,
        sequence,
        sampleRate: ORACLE_VOICE_SAMPLE_RATE,
        samples: new Int16Array(1_280),
      }),
    ))
    await accepted
    await new Promise((resolve) => setImmediate(resolve))

    expect(test.terminated).toEqual([])
    expect(test.backend.audio).toEqual([])
    releaseConfirmation()
    await vi.waitFor(() => expect(test.backend.audio).toHaveLength(30))
    expect(test.backend.audio.map((frame) => frame.sequence))
      .toEqual(Array.from({ length: 30 }, (_, sequence) => sequence))
    expect(test.timeline.indexOf('stt.confirm:3'))
      .toBeLessThan(test.timeline.indexOf('stt.audio:3:0'))
    releaseCancel()
    await interrupted
  })

  it('serializes retained microphone delivery without allowing sequence bypass', async () => {
    const test = harness()
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'u1'))
    let releaseFirst!: () => void
    const firstGate = new Promise<void>((resolve) => {
      releaseFirst = resolve
    })
    test.backend.audioDelivery.mockImplementationOnce(() => firstGate)

    await test.coordinator.receive({
      direction: 'microphone',
      generation: 1,
      sequence: 0,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples: new Int16Array(1_280),
    })
    await test.coordinator.receive({
      direction: 'microphone',
      generation: 1,
      sequence: 1,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples: new Int16Array(1_280),
    })
    await vi.waitFor(() => expect(test.backend.audio).toHaveLength(1))

    releaseFirst()
    await vi.waitFor(() => expect(test.backend.audio).toHaveLength(2))
    expect(test.backend.audio.map((frame) => frame.sequence)).toEqual([0, 1])
  })

  it('waits for every previously accepted microphone frame before speech end', async () => {
    const test = harness()
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'u1'))
    let releaseAudio!: () => void
    const audioGate = new Promise<void>((resolve) => {
      releaseAudio = resolve
    })
    test.backend.audioDelivery.mockImplementationOnce(() => audioGate)
    await test.coordinator.receive({
      direction: 'microphone',
      generation: 1,
      sequence: 0,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples: new Int16Array(1_280),
    })
    await vi.waitFor(() => expect(test.backend.audio).toHaveLength(1))

    const ending = test.coordinator.receive(control('speech_end', 1, {
      utteranceId: 'u1',
    }))
    await new Promise((resolve) => setImmediate(resolve))

    expect(test.backend.controls.some((message) => message.type === 'speech_end'))
      .toBe(false)
    releaseAudio()
    await ending
    expect(test.backend.controls.at(-1)).toMatchObject({
      type: 'speech_end',
      generation: 1,
      utteranceId: 'u1',
    })
  })

  it('releases a pending speech-end barrier when the coordinator closes', async () => {
    const test = harness()
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'u1'))
    let releaseAudio!: () => void
    test.backend.audioDelivery.mockImplementationOnce(() =>
      new Promise<void>((resolve) => {
        releaseAudio = resolve
      }),
    )
    await test.coordinator.receive({
      direction: 'microphone',
      generation: 1,
      sequence: 0,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples: new Int16Array(1_280),
    })
    await vi.waitFor(() => expect(test.backend.audio).toHaveLength(1))
    const ending = test.coordinator.receive(control('speech_end', 1, {
      utteranceId: 'u1',
    }))

    const closing = test.coordinator.close('Browser voice socket closed')
    await expect(Promise.race([
      closing.then(() => 'closed'),
      new Promise<'timed-out'>((resolve) => {
        setTimeout(() => resolve('timed-out'), 100)
      }),
    ])).resolves.toBe('closed')

    releaseAudio()
    await ending
    expect(test.backend.closed).toEqual(['Browser voice socket closed'])
  })

  it('does not include future-generation audio in the current speech-end barrier', async () => {
    const test = harness()
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'u1'))
    let releaseAudio!: () => void
    test.backend.audioDelivery.mockImplementationOnce(() =>
      new Promise<void>((resolve) => {
        releaseAudio = resolve
      }),
    )
    await test.coordinator.receive({
      direction: 'microphone',
      generation: 1,
      sequence: 0,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples: new Int16Array(1_280),
    })
    await vi.waitFor(() => expect(test.backend.audio).toHaveLength(1))

    const ending = test.coordinator.receive(control('speech_end', 1, {
      utteranceId: 'u1',
    }))
    const confirming = test.coordinator.receive(confirm(2, 'u2'))
    await test.coordinator.receive({
      direction: 'microphone',
      generation: 2,
      sequence: 0,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples: new Int16Array(1_280),
    })

    releaseAudio()
    await Promise.all([ending, confirming])
    await vi.waitFor(() => expect(test.backend.audio).toHaveLength(2))
    expect(test.backend.controls.filter((message) =>
      message.type === 'speech_end' || message.type === 'speech_confirmed')
      .map((message) => `${message.type}:${message.generation}`)).toEqual([
      'speech_confirmed:1',
      'speech_end:1',
      'speech_confirmed:2',
    ])
    expect(test.backend.audio.map((frame) => frame.generation)).toEqual([1, 2])
  })

  it('fails retained microphone backpressure once at the bounded utterance limit', async () => {
    const test = harness(snapshot(), 10_000)
    await test.start(0)
    let releaseConfirmation!: () => void
    test.backend.confirmationControl.mockImplementationOnce(() =>
      new Promise<void>((resolve) => {
        releaseConfirmation = resolve
      }),
    )
    const confirming = test.coordinator.receive(confirm(1, 'u1'))
    await vi.waitFor(() => expect(test.backend.confirmationControl).toHaveBeenCalledOnce())

    await Promise.all(Array.from({ length: 33 }, (_, sequence) =>
      test.coordinator.receive({
        direction: 'microphone',
        generation: 1,
        sequence,
        sampleRate: ORACLE_VOICE_SAMPLE_RATE,
        samples: new Int16Array(16_000),
      }),
    ))
    await vi.waitFor(() => expect(test.terminated).toEqual([{
      code: 1013,
      reason: 'Voice input queue is full',
    }]))

    expect(test.browser.filter(
      (message) => !('direction' in message)
        && message.type === 'error'
        && message.code === 'voice_input_backpressure',
    )).toHaveLength(1)
    releaseConfirmation()
    await confirming.catch(() => undefined)
  })

  it('drops stale microphone frames but fails future and out-of-order frames', async () => {
    const stale = harness()
    await stale.start(1)
    await stale.coordinator.receive(confirm(2, 'u2'))
    await stale.coordinator.receive({
      direction: 'microphone',
      generation: 1,
      sequence: 0,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples: new Int16Array(100),
    })
    await new Promise((resolve) => setImmediate(resolve))
    expect(stale.backend.audio).toEqual([])
    expect(stale.terminated).toEqual([])

    for (const frame of [
      {
        direction: 'microphone',
        generation: 3,
        sequence: 0,
        sampleRate: ORACLE_VOICE_SAMPLE_RATE,
        samples: new Int16Array(100),
      },
      {
        direction: 'microphone',
        generation: 2,
        sequence: 1,
        sampleRate: ORACLE_VOICE_SAMPLE_RATE,
        samples: new Int16Array(100),
      },
    ] satisfies VoiceAudioFrame[]) {
      const invalid = harness()
      await invalid.start(1)
      await invalid.coordinator.receive(confirm(2, 'u2'))
      await invalid.coordinator.receive(frame)
      await vi.waitFor(() => expect(invalid.terminated).toEqual([{
        code: 1008,
        reason: expect.stringMatching(/generation|sequence/),
      }]))
      expect(invalid.backend.audio).toEqual([])
    }
  })

  it('closes without delivering audio retained behind a pending confirmation gate', async () => {
    const test = harness(snapshot(), 1_000)
    await test.start(0)
    let releaseConfirmation!: () => void
    test.backend.confirmationControl.mockImplementationOnce(() =>
      new Promise<void>((resolve) => {
        releaseConfirmation = resolve
      }),
    )
    const confirming = test.coordinator.receive(confirm(1, 'u1'))
    await vi.waitFor(() => expect(test.backend.confirmationControl).toHaveBeenCalledOnce())
    await test.coordinator.receive({
      direction: 'microphone',
      generation: 1,
      sequence: 0,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      samples: new Int16Array(1_280),
    })

    const closing = test.coordinator.close('Browser voice socket closed')
    const outcome = await Promise.race([
      closing.then(() => 'closed'),
      new Promise<'timed-out'>((resolve) => setTimeout(() => resolve('timed-out'), 100)),
    ])
    releaseConfirmation()
    await confirming.catch(() => undefined)
    await closing

    expect(outcome).toBe('closed')
    expect(test.backend.audio).toEqual([])
    expect(test.backend.closed).toEqual(['Browser voice socket closed'])
  })

  it('fails closed when backend speech confirmation fails', async () => {
    const test = harness()
    await test.start(0)
    test.backend.confirmationControl.mockRejectedValueOnce(
      new Error('STT confirmation failed'),
    )

    await expect(test.coordinator.receive(confirm(1, 'u1')))
      .rejects.toThrow('STT confirmation failed')
    expect(test.browser).toContainEqual(expect.objectContaining({
      type: 'error',
      code: 'voice_backend_confirmation_failed',
      message: 'STT confirmation failed',
      fatal: true,
    }))
    expect(test.terminated).toEqual([{
      code: 1011,
      reason: 'STT confirmation failed',
    }])
  })

  it('fails closed when backend cancellation fails after confirmation', async () => {
    const test = harness()
    test.manager.send.mockResolvedValueOnce(managerMessage('voice-running', {
      state: 'running',
      source: 'voice',
    }))
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'u1'))
    await test.backend.emit(final(1, 'u1', 'Running voice request.'))
    test.manager.setSnapshot(snapshot({
      status: 'working',
      messages: [managerMessage('voice-running', {
        state: 'running',
        source: 'voice',
      })],
    }))
    test.backend.cancelControl.mockRejectedValueOnce(new Error('TTS cancel failed'))

    await expect(test.coordinator.receive(confirm(2, 'u2')))
      .rejects.toThrow('TTS cancel failed')
    expect(test.backend.confirmationControl).toHaveBeenCalled()
    expect(test.browser).toContainEqual(expect.objectContaining({
      type: 'error',
      code: 'oracle_cancel_failed',
      message: 'TTS cancel failed',
      fatal: true,
    }))
    expect(test.terminated).toEqual([{
      code: 1011,
      reason: 'TTS cancel failed',
    }])
  })

  it('recovers queued and running voice ownership after a browser reconnect', async () => {
    const test = harness(snapshot({
      status: 'working',
      messages: [
        managerMessage('old-voice-queued', {
          state: 'queued',
          source: 'voice',
        }),
        managerMessage('old-voice-running', {
          state: 'running',
          source: 'voice',
        }),
      ],
    }))
    await test.start(4)

    await test.coordinator.receive(confirm(5, 'u5'))

    expect(test.manager.cancelMessage).toHaveBeenCalledWith('old-voice-queued')
    expect(test.manager.cancelMessage).toHaveBeenCalledWith('old-voice-running')
    expect(test.manager.cancelMessage).toHaveBeenCalledTimes(2)
    expect(test.manager.removeQueued).not.toHaveBeenCalled()
    expect(test.manager.cancel).not.toHaveBeenCalled()
    expect(test.backend.calls).toContain('tts.cancel:4')
  })

  it('closes instead of submitting when Oracle cancellation times out', async () => {
    vi.useFakeTimers()
    const test = harness(snapshot(), 25)
    test.manager.send.mockResolvedValueOnce(managerMessage('voice-running', {
      state: 'running',
      source: 'voice',
    }))
    await test.start(1)
    await test.coordinator.receive(confirm(2, 'u2'))
    await test.backend.emit(final(2, 'u2', 'Running voice request.'))
    test.manager.setSnapshot(snapshot({
      status: 'working',
      messages: [managerMessage('voice-running', {
        state: 'running',
        source: 'voice',
      })],
    }))
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('voice-running', {
        state: 'running',
        source: 'voice',
      }),
    })
    test.manager.cancelMessage.mockImplementationOnce(() => new Promise(() => undefined))

    const interrupted = test.coordinator.receive(confirm(3, 'u3'))
    await vi.advanceTimersByTimeAsync(25)

    await expect(interrupted).rejects.toThrow('timed out')
    await test.backend.emit(final(3, 'u3', 'Must not send.'))
    expect(test.manager.send).toHaveBeenCalledOnce()
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
      { answerOnly: true, source: 'voice' },
    )
    expect(test.browser).toContainEqual({
      ...final(1, 'u1', 'Keep this request.'),
      type: 'transcript_restore',
    })
    expect(test.browser).toContainEqual(expect.objectContaining({
      type: 'error',
      code: 'oracle_send_failed',
      fatal: false,
    }))
    expect(test.browser).toContainEqual(expect.objectContaining({
      type: 'state',
      generation: 1,
      state: 'listening',
    }))
  })

  it('returns a failed superseded final without changing the current turn state', async () => {
    const test = harness()
    test.manager.send.mockRejectedValueOnce(new Error('queue unavailable'))
    await test.start(0, false)
    await test.coordinator.receive(confirm(1, 'u1'))
    await test.coordinator.receive(control('speech_end', 1, {
      utteranceId: 'u1',
    }))
    await test.coordinator.receive(confirm(2, 'u2'))

    await test.backend.emit(final(1, 'u1', 'Restore the earlier request.'))

    expect(test.manager.send).toHaveBeenCalledOnce()
    expect(test.browser).toContainEqual({
      ...final(1, 'u1', 'Restore the earlier request.'),
      type: 'transcript_restore',
    })
    expect(test.browser).toContainEqual(expect.objectContaining({
      type: 'error',
      generation: 2,
      code: 'oracle_send_failed',
      fatal: false,
    }))
    expect(test.browser).not.toContainEqual(expect.objectContaining({
      type: 'state',
      generation: 2,
      state: 'listening',
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

  it('paces a second sentence until twelve seconds of forwarded audio is consumed', async () => {
    vi.useFakeTimers()
    let browserPlaybackThrough = Date.now()
    let maximumBrowserQueueMs = 0
    const test = harness(snapshot(), 1_000, undefined, (message) => {
      if (!('direction' in message) || message.direction !== 'playback') return
      const forwardedAt = Date.now()
      browserPlaybackThrough = Math.max(browserPlaybackThrough, forwardedAt)
        + message.samples.length / message.sampleRate * 1_000
      maximumBrowserQueueMs = Math.max(
        maximumBrowserQueueMs,
        browserPlaybackThrough - forwardedAt,
      )
    })
    test.manager.send.mockResolvedValueOnce(managerMessage('voice-user', {
      state: 'queued',
    }))
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'u1'))
    await test.backend.emit(final(1, 'u1', 'Tell me the result.'))
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('voice-user', { state: 'running' }),
    })
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('voice-reply', {
        role: 'assistant',
        replyTo: 'voice-user',
        content: 'First sentence. Second sentence.',
        state: undefined,
      }),
    })
    const first = test.backend.controls.find(
      (message): message is Extract<VoiceClientControl, { type: 'synthesize' }> =>
        message.type === 'synthesize',
    )!
    for (let sequence = 0; sequence < 24; sequence += 1) {
      await test.backend.emit({
        ...audio(1, first.segmentId, sequence),
        samples: new Int16Array(11_025),
      })
    }

    await test.backend.emit(audioEnd(1, first.segmentId))

    expect(maximumBrowserQueueMs).toBe(12_000)
    expect(test.backend.controls.filter((message) => message.type === 'synthesize'))
      .toHaveLength(1)
    await vi.advanceTimersByTimeAsync(11_999)
    expect(test.backend.controls.filter((message) => message.type === 'synthesize'))
      .toHaveLength(1)
    await vi.advanceTimersByTimeAsync(1)
    const second = test.backend.controls.filter(
      (message): message is Extract<VoiceClientControl, { type: 'synthesize' }> =>
        message.type === 'synthesize',
    )[1]
    expect(second).toMatchObject({ text: 'Second sentence.' })
    expect(browserPlaybackThrough - Date.now()).toBe(0)
    for (let sequence = 0; sequence < 4; sequence += 1) {
      await test.backend.emit({
        ...audio(1, second.segmentId, sequence),
        samples: new Int16Array(11_025),
      })
    }
    await test.backend.emit(audioEnd(1, second.segmentId))
    expect(maximumBrowserQueueMs).toBe(12_000)
    expect(test.backend.controls.filter(
      (message) => message.type === 'synthesize',
    ).map((message) => 'text' in message ? message.text : undefined)).toEqual([
      'First sentence.',
      'Second sentence.',
    ])
  })

  it('accounts for playback consumed between forwarded audio frames', async () => {
    vi.useFakeTimers()
    const test = harness()
    test.manager.send.mockResolvedValueOnce(managerMessage('voice-user', {
      state: 'queued',
    }))
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'u1'))
    await test.backend.emit(final(1, 'u1', 'Tell me the result.'))
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('voice-user', { state: 'running' }),
    })
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('voice-reply', {
        role: 'assistant',
        replyTo: 'voice-user',
        content: 'First sentence. Second sentence.',
        state: undefined,
      }),
    })
    const first = test.backend.controls.find(
      (message): message is Extract<VoiceClientControl, { type: 'synthesize' }> =>
        message.type === 'synthesize',
    )!
    await test.backend.emit({
      ...audio(1, first.segmentId, 0),
      samples: new Int16Array(22_050),
    })
    await vi.advanceTimersByTimeAsync(1_500)
    await test.backend.emit({
      ...audio(1, first.segmentId, 1),
      samples: new Int16Array(22_050),
    })
    await test.backend.emit(audioEnd(1, first.segmentId))

    await vi.advanceTimersByTimeAsync(999)
    expect(test.backend.controls.filter((message) => message.type === 'synthesize'))
      .toHaveLength(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(test.backend.controls.filter((message) => message.type === 'synthesize')[1])
      .toMatchObject({ text: 'Second sentence.' })
  })

  it.each(['barge-in', 'close'] as const)(
    'cancels a pending speech pacing timer on %s',
    async (action) => {
      vi.useFakeTimers()
      const test = harness()
      test.manager.send.mockResolvedValueOnce(managerMessage('voice-user', {
        state: 'queued',
      }))
      await test.start(0)
      await test.coordinator.receive(confirm(1, 'u1'))
      await test.backend.emit(final(1, 'u1', 'Tell me the result.'))
      await test.coordinator.managerEvent({
        type: 'manager.message',
        message: managerMessage('voice-user', { state: 'running' }),
      })
      await test.coordinator.managerEvent({
        type: 'manager.message',
        message: managerMessage('voice-reply', {
          role: 'assistant',
          replyTo: 'voice-user',
          content: 'First sentence. Second sentence.',
          state: undefined,
        }),
      })
      const first = test.backend.controls.find(
        (message): message is Extract<VoiceClientControl, { type: 'synthesize' }> =>
          message.type === 'synthesize',
      )!
      await test.backend.emit({
        ...audio(1, first.segmentId, 0),
        samples: new Int16Array(22_050 * 12),
      })
      await test.backend.emit(audioEnd(1, first.segmentId))

      if (action === 'barge-in') {
        await test.coordinator.receive(confirm(2, 'u2'))
      } else {
        await test.coordinator.close('Browser voice socket closed')
      }
      await vi.advanceTimersByTimeAsync(12_000)

      expect(test.backend.controls.filter((message) => message.type === 'synthesize'))
        .toHaveLength(1)
    },
  )

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
      content: 'Old spoken sentence. Pending',
    })
    const oldSegment = test.backend.controls.find(
      (message): message is Extract<VoiceClientControl, { type: 'synthesize' }> =>
        message.type === 'synthesize',
    )!

    await test.coordinator.receive(confirm(2, 'new-utterance'))
    const browserCount = test.browser.length
    await test.backend.emit(audio(1, oldSegment.segmentId, 0))
    await test.backend.emit(audioEnd(1, oldSegment.segmentId))
    await test.coordinator.managerEvent({
      type: 'manager.delta',
      messageId: 'old-reply',
      content: 'Old spoken sentence. More stale text. Pending',
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

  it('forwards playback only for the active same-generation segment', async () => {
    const test = harness()
    test.manager.send.mockResolvedValueOnce(managerMessage('voice-user'))
    await test.start(0)
    await test.coordinator.receive(confirm(1, 'u1'))
    await test.backend.emit(final(1, 'u1', 'Speak the result.'))
    await test.coordinator.managerEvent({
      type: 'manager.message',
      message: managerMessage('voice-user', { state: 'running' }),
    })
    await test.coordinator.managerEvent({
      type: 'manager.delta',
      messageId: 'voice-reply',
      content: 'Current sentence. Pending',
    })
    const active = test.backend.controls.find(
      (message): message is Extract<VoiceClientControl, { type: 'synthesize' }> =>
        message.type === 'synthesize',
    )!
    const staleAudio = audio(1, 'stale-segment', 0)
    const activeAudio = audio(1, active.segmentId, 0)

    await test.backend.emit(staleAudio)
    await test.backend.emit(audioEnd(1, 'stale-segment'))
    expect(test.browser).not.toContainEqual(staleAudio)

    await test.backend.emit(activeAudio)
    await test.backend.emit(audioEnd(1, active.segmentId))
    expect(test.browser).toContainEqual(activeAudio)
    expect(test.browser).toContainEqual(audioEnd(1, active.segmentId))
  })

  it.each(['failed', 'cancelled', 'interrupted'] as const)(
    'clears and cancels speech when the manager turn is %s',
    async (state) => {
      const test = harness()
      test.manager.send.mockResolvedValueOnce(managerMessage('voice-user'))
      await test.start(0)
      await test.coordinator.receive(confirm(1, 'u1'))
      await test.backend.emit(final(1, 'u1', 'Speak the result.'))
      await test.coordinator.managerEvent({
        type: 'manager.message',
        message: managerMessage('voice-user', { state: 'running' }),
      })
      await test.coordinator.managerEvent({
        type: 'manager.delta',
        messageId: 'voice-reply',
        content: 'First sentence. Second sentence.',
      })
      const active = test.backend.controls.find(
        (message): message is Extract<VoiceClientControl, { type: 'synthesize' }> =>
          message.type === 'synthesize',
      )!

      await test.coordinator.managerEvent({
        type: 'manager.message',
        message: managerMessage('voice-user', { state }),
      })

      expect(test.backend.calls).toContain('tts.cancel:1')
      const browserCount = test.browser.length
      await test.backend.emit(audio(1, active.segmentId, 0))
      await test.backend.emit(audioEnd(1, active.segmentId))
      expect(test.browser).toHaveLength(browserCount)
      expect(test.backend.calls).not.toContain('tts.synthesize:Second sentence.')
    },
  )

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
      content: 'Current sentence. Pending',
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

  it.each([1000, 1006, 1011])(
    'honors explicit retryable transport metadata for close %s',
    async (code) => {
      const test = harness()
      await test.start()

      await test.backend.lose({
        code,
        reason: 'Paired node transport was lost',
        retryable: true,
        cause: 'transport',
      } as OracleVoiceBackendDisconnect)

      expect(test.browser).toContainEqual(expect.objectContaining({
        type: 'error',
        code: 'voice_backend_disconnected',
        message: expect.stringContaining('transport was lost'),
        fatal: false,
      }))
      expect(test.terminated).toEqual([{
        code,
        reason: 'Paired node transport was lost',
      }])
      expect(test.backend.closed).toHaveLength(1)
    },
  )

  it.each([1000, 1002, 1003, 1007, 1008, 1009, 1011, 1013])(
    'honors explicit terminal metadata for backend close %s',
    async (code) => {
      const test = harness()
      await test.start()

      await test.backend.lose({
        code,
        reason: 'Voice backend rejected the stream',
        retryable: false,
        cause: code === 1011 ? 'internal' : 'protocol',
      } as OracleVoiceBackendDisconnect)

      expect(test.browser).toContainEqual(expect.objectContaining({
        type: 'error',
        code: 'voice_backend_disconnected',
        fatal: true,
      }))
      expect(test.terminated).toEqual([{
        code,
        reason: 'Voice backend rejected the stream',
      }])
    },
  )

  it('keeps selected paired-node registration loss terminal', async () => {
    const test = harness()
    await test.start()

    await test.backend.lose({
      code: 1001,
      reason: 'Paired node registration changed during the voice stream',
      retryable: false,
      cause: 'registration',
    } as OracleVoiceBackendDisconnect)

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

  it('does not double-report an explicit worker fatal error when its terminal close arrives', async () => {
    const test = harness()
    await test.start()

    await test.backend.emit({
      type: 'error',
      protocol: ORACLE_VOICE_PROTOCOL,
      streamId: 'stream-1',
      generation: 0,
      code: 'voice_backend_failed',
      message: 'Worker crashed',
      fatal: true,
    })
    await test.backend.lose({
      code: 1011,
      reason: 'Worker crashed',
      retryable: false,
      cause: 'worker',
    } as OracleVoiceBackendDisconnect)

    expect(test.browser.filter(
      (message) => !('direction' in message) && message.type === 'error',
    )).toEqual([
      expect.objectContaining({
        code: 'voice_backend_failed',
        message: 'Worker crashed',
        fatal: true,
      }),
    ])
  })
})
