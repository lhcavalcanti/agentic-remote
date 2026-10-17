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
  readonly stop = vi.fn<() => Promise<void>>(async () => undefined)
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

  final(text: string, utteranceId = 'utterance-1', generation = 3) {
    this.options.onFinal?.(transcript(text, utteranceId, generation))
  }

  error(
    message: string,
    options: { fatal?: boolean; dictationFallback?: boolean } = {},
  ) {
    this.options.onError?.(new OracleVoiceClientError(
      options.fatal === false ? 'server-error' : 'capture-failed',
      message,
      {
        fatal: options.fatal,
        dictationFallback: options.dictationFallback ?? options.fatal !== false,
      },
    ))
  }
}

function transcript(
  text: string,
  utteranceId: string,
  generation = 3,
): OracleVoiceTranscriptEvent {
  return { generation, utteranceId, text }
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

  it('deduplicates failed finals by generation and utterance identity only', async () => {
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
      client.final('where is the docs work', 'utterance-2')
      client.final('where is the docs work', 'utterance-2', 4)
    })
    expect(result.current.partial).toBe('')
    expect(onFinalTranscript).toHaveBeenCalledTimes(3)
    expect(onFinalTranscript).toHaveBeenNthCalledWith(1, 'where is the docs work')
    expect(onFinalTranscript).toHaveBeenNthCalledWith(2, 'where is the docs work')
    expect(onFinalTranscript).toHaveBeenNthCalledWith(3, 'where is the docs work')

    act(() => client.error('Microphone permission was denied. Dictation is still available.'))
    expect(result.current.error).toBe(
      'Microphone permission was denied. Dictation is still available.',
    )
    expect(result.current.state).toBe('stopping')
    expect(result.current.ownsResources).toBe(true)
    expect(onError).toHaveBeenCalledWith(
      'Microphone permission was denied. Dictation is still available.',
    )
  })

  it('keeps ownership until an explicit stop resolves and blocks an immediate restart', async () => {
    vi.mocked(getOracleVoiceCapabilities).mockResolvedValue(availableCapability)
    const { result } = renderConversation()
    await waitFor(() => expect(result.current.capability).toEqual(availableCapability))
    await act(async () => result.current.start())
    const firstClient = clients[0]
    let releaseStop: () => void = () => undefined
    firstClient.stop.mockImplementation(() => new Promise<void>((resolve) => {
      releaseStop = resolve
    }))

    act(() => result.current.stop())

    expect(result.current.state).toBe('stopping')
    expect(result.current.ownsResources).toBe(true)
    await act(async () => result.current.start())
    expect(firstClient.start).toHaveBeenCalledOnce()
    expect(clients).toHaveLength(1)

    await act(async () => releaseStop())
    await waitFor(() => expect(result.current.state).toBe('off'))
    expect(result.current.ownsResources).toBe(false)

    await act(async () => result.current.start())
    expect(clients).toHaveLength(2)
  })

  it('maps manager-send and TTS failures to Error until the live stream recovers', async () => {
    vi.mocked(getOracleVoiceCapabilities).mockResolvedValue(availableCapability)
    const { result, onFinalTranscript } = renderConversation()
    await waitFor(() => expect(result.current.capability).toEqual(availableCapability))
    await act(async () => result.current.start())
    const client = clients[0]

    act(() => {
      client.final('keep this request', 'manager-send')
      client.error('Could not send to Oracle: request failed', { fatal: false })
      client.state('error')
    })
    expect(onFinalTranscript).toHaveBeenCalledOnce()
    expect(result.current.state).toBe('error')
    expect(result.current.error).toBe('Could not send to Oracle: request failed')
    expect(result.current.ownsResources).toBe(true)

    act(() => client.state('listening'))
    expect(result.current.state).toBe('listening')
    expect(result.current.error).toBeUndefined()

    act(() => {
      client.error('Oracle speech synthesis failed', { fatal: false })
      client.state('error')
    })
    expect(result.current.state).toBe('error')
    expect(result.current.error).toBe('Oracle speech synthesis failed')

    act(() => client.state('speech'))
    expect(result.current.state).toBe('speech')
    expect(result.current.error).toBeUndefined()
  })

  it('clears reconnect errors on recovery and clears an error only after stop finishes', async () => {
    vi.mocked(getOracleVoiceCapabilities).mockResolvedValue(availableCapability)
    const { result } = renderConversation()
    await waitFor(() => expect(result.current.capability).toEqual(availableCapability))
    await act(async () => result.current.start())
    const client = clients[0]

    act(() => {
      client.error('Temporary ticket failure', { fatal: false })
      client.state('reconnecting')
    })
    expect(result.current.state).toBe('reconnecting')
    expect(result.current.error).toBe('Temporary ticket failure')

    act(() => client.state('listening'))
    expect(result.current.error).toBeUndefined()

    act(() => {
      client.error('Could not send to Oracle', { fatal: false })
      client.state('error')
    })
    let releaseStop: () => void = () => undefined
    client.stop.mockImplementation(() => new Promise<void>((resolve) => {
      releaseStop = resolve
    }))
    act(() => result.current.stop())

    expect(result.current.state).toBe('stopping')
    expect(result.current.error).toBe('Could not send to Oracle')
    expect(result.current.ownsResources).toBe(true)

    await act(async () => releaseStop())
    await waitFor(() => expect(result.current.state).toBe('off'))
    expect(result.current.error).toBeUndefined()
    expect(result.current.ownsResources).toBe(false)
  })

  it('allows a fresh start after a fatal client error reports completed teardown', async () => {
    vi.mocked(getOracleVoiceCapabilities).mockResolvedValue(availableCapability)
    const { result } = renderConversation()
    await waitFor(() => expect(result.current.capability).toEqual(availableCapability))
    await act(async () => result.current.start())
    const firstClient = clients[0]

    act(() => firstClient.error('Voice engine stopped'))
    expect(result.current.state).toBe('stopping')
    expect(result.current.ownsResources).toBe(true)

    act(() => firstClient.state('error'))
    expect(result.current.state).toBe('error')
    expect(result.current.ownsResources).toBe(false)

    await act(async () => result.current.start())
    expect(clients).toHaveLength(2)
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
    await waitFor(() => expect(result.current.state).toBe('off'))

    rerender({ open: true })
    await waitFor(() => expect(result.current.capability).toEqual(availableCapability))
    await act(async () => result.current.start())
    const secondClient = clients[1]
    unmount()

    await waitFor(() => expect(secondClient.stop).toHaveBeenCalledOnce())
  })
})
