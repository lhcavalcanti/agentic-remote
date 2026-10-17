// @vitest-environment jsdom
import { StrictMode, type PropsWithChildren } from 'react'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ManagerClientDefaults } from '../shared/manager'
import type { VoiceCapabilities } from '../shared/oracle-voice'
import { getOracleVoiceCapabilities } from './api'
import type {
  OracleVoiceClientOptions,
  OracleVoiceTranscriptEvent,
  OracleVoiceUiState,
} from './oracle-voice/client'
import { OracleVoiceClientError } from './oracle-voice/client'
import { useOracleConversation } from './use-oracle-conversation'

const voiceClientConstructor = vi.hoisted(() => vi.fn())

vi.mock('./api', async () => {
  const actual = await vi.importActual<typeof import('./api')>('./api')
  return {
    ...actual,
    getOracleVoiceCapabilities: vi.fn(),
  }
})

vi.mock('./oracle-voice/client', async () => {
  const actual = await vi.importActual<typeof import('./oracle-voice/client')>(
    './oracle-voice/client',
  )
  return {
    ...actual,
    OracleVoiceClient: voiceClientConstructor,
  }
})

const availableCapability: VoiceCapabilities = {
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

const defaults: ManagerClientDefaults = {
  computerId: 'hub',
  mode: 'autopilot',
}

class FakeVoiceClient {
  readonly start = vi.fn(async () => undefined)
  readonly stop = vi.fn(async () => undefined)
  readonly options: OracleVoiceClientOptions

  constructor(options: OracleVoiceClientOptions) {
    this.options = options
  }

  state(state: OracleVoiceUiState) {
    this.options.onState?.(state)
  }

  partial(text: string, utteranceId = 'utterance-1') {
    this.options.onPartial?.(transcript(text, utteranceId))
  }

  final(text: string, utteranceId = 'utterance-1') {
    this.options.onFinal?.(transcript(text, utteranceId))
  }

  error(message: string) {
    this.options.onError?.(new OracleVoiceClientError(
      'capture-failed',
      message,
      { dictationFallback: true },
    ))
  }
}

function transcript(
  text: string,
  utteranceId: string,
): OracleVoiceTranscriptEvent {
  return { generation: 3, utteranceId, text }
}

function renderConversation(
  options: Partial<Parameters<typeof useOracleConversation>[0]> = {},
  wrapper?: (props: PropsWithChildren) => React.ReactNode,
) {
  const { open: initialOpen = true, ...hookOptions } = options
  const onFinalTranscript = vi.fn()
  const onError = vi.fn()
  const hook = renderHook(
    ({ open }) => useOracleConversation({
      defaults,
      answerOnly: false,
      open,
      onFinalTranscript,
      onError,
      ...hookOptions,
    }),
    {
      initialProps: { open: initialOpen },
      ...(wrapper ? { wrapper } : {}),
    },
  )
  return { ...hook, onFinalTranscript, onError }
}

describe('useOracleConversation', () => {
  const clients: FakeVoiceClient[] = []

  beforeEach(() => {
    clients.length = 0
    vi.mocked(getOracleVoiceCapabilities).mockReset()
    voiceClientConstructor.mockReset()
    voiceClientConstructor.mockImplementation(function (
      options: OracleVoiceClientOptions,
    ) {
      const client = new FakeVoiceClient(options)
      clients.push(client)
      return client
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('loads capability only for an open panel and leaves unavailable voice off', async () => {
    vi.mocked(getOracleVoiceCapabilities).mockResolvedValue({
      ...availableCapability,
      available: false,
      reason: 'Conversation mode is disabled',
    })
    const { result, rerender, onError } = renderConversation({ open: false })

    expect(getOracleVoiceCapabilities).not.toHaveBeenCalled()
    rerender({ open: true })

    await waitFor(() => expect(result.current.capability?.available).toBe(false))
    expect(result.current.state).toBe('off')
    expect(clients).toHaveLength(0)
    expect(onError).not.toHaveBeenCalled()
  })

  it('keeps a capability lookup failure out of the normal composer', async () => {
    vi.mocked(getOracleVoiceCapabilities).mockRejectedValue(
      new Error('Voice routes are disabled'),
    )
    const { result, onError } = renderConversation()

    await waitFor(() => expect(getOracleVoiceCapabilities).toHaveBeenCalled())
    await act(async () => undefined)

    expect(result.current.capability).toBeUndefined()
    expect(result.current.state).toBe('off')
    expect(result.current.error).toBeUndefined()
    expect(onError).not.toHaveBeenCalled()
  })

  it('projects client state and partials without duplicating a failed final', async () => {
    vi.mocked(getOracleVoiceCapabilities).mockResolvedValue(availableCapability)
    const { result, onFinalTranscript, onError } = renderConversation({
      answerOnly: true,
    })
    await waitFor(() => expect(result.current.capability).toEqual(availableCapability))

    await act(async () => result.current.start())
    const client = clients[0]
    expect(client.options.language).toBe('en')
    expect(client.options.defaults).toEqual(defaults)
    expect(client.options.answerOnly).toBe(true)

    act(() => client.state('listening'))
    expect(result.current.state).toBe('listening')

    act(() => client.partial('where is the docs work'))
    expect(result.current.partial).toBe('where is the docs work')

    act(() => {
      client.final('where is the docs work')
      client.final('where is the docs work')
    })
    expect(result.current.partial).toBe('')
    expect(onFinalTranscript).toHaveBeenCalledOnce()
    expect(onFinalTranscript).toHaveBeenCalledWith('where is the docs work')

    act(() => client.error('Microphone permission was denied. Dictation is still available.'))
    expect(result.current.error).toBe(
      'Microphone permission was denied. Dictation is still available.',
    )
    expect(onError).toHaveBeenCalledWith(
      'Microphone permission was denied. Dictation is still available.',
    )
  })

  it('stops the client when the panel closes and on StrictMode unmount', async () => {
    vi.mocked(getOracleVoiceCapabilities).mockResolvedValue(availableCapability)
    const wrapper = ({ children }: PropsWithChildren) => (
      <StrictMode>{children}</StrictMode>
    )
    const { result, rerender, unmount } = renderConversation({}, wrapper)
    await waitFor(() => expect(result.current.capability).toEqual(availableCapability))
    await act(async () => result.current.start())
    const firstClient = clients[0]

    rerender({ open: false })
    await waitFor(() => expect(firstClient.stop).toHaveBeenCalledOnce())
    expect(result.current.state).toBe('off')

    rerender({ open: true })
    await waitFor(() => expect(result.current.capability).toEqual(availableCapability))
    await act(async () => result.current.start())
    const secondClient = clients[1]
    unmount()

    await waitFor(() => expect(secondClient.stop).toHaveBeenCalledOnce())
  })
})
