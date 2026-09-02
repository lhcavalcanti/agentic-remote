import { Readable } from 'node:stream'
import { describe, expect, it, vi } from 'vitest'
import type { AudioTranscription, ComputerSummary } from '../shared/contracts.js'
import type { ComputerManager } from './computer-manager.js'
import { DelegatedTranscriptionService } from './delegated-transcription-service.js'
import {
  MAX_AUDIO_BYTES,
  TranscriptionError,
  type AudioUpload,
  type TranscriptionService,
} from './transcription-service.js'

function audio(
  content: Buffer | string = 'audio data',
  filename = 'idea.m4a',
  mimeType = 'audio/x-m4a',
): AudioUpload {
  return {
    filename,
    mimeType,
    stream: Readable.from([Buffer.from(content)]),
    truncated: () => false,
  }
}

function localService(
  transcript = 'Local transcript',
): TranscriptionService & { transcribe: ReturnType<typeof vi.fn> } {
  return {
    initialize: vi.fn(async () => undefined),
    stop: vi.fn(async () => undefined),
    transcribe: vi.fn(async () => ({ transcript, durationSeconds: 1 })),
  }
}

function manager(
  computers: ComputerSummary[],
  transcribeAudio: (
    computerId: string,
    filename: string,
    mimeType: string,
    data: Buffer,
    signal?: AbortSignal,
  ) => Promise<AudioTranscription> = async () => ({
    transcript: 'Remote transcript',
    durationSeconds: 3,
  }),
): ComputerManager {
  return {
    findComputer: (nameOrId: string) =>
      computers.find(
        (computer) =>
          computer.id.toLowerCase() === nameOrId.trim().toLowerCase() ||
          computer.name.toLowerCase() === nameOrId.trim().toLowerCase(),
      ),
    transcribeAudio: vi.fn(transcribeAudio),
  } as unknown as ComputerManager
}

const workstation: ComputerSummary = {
  id: 'computer-1',
  name: 'workstation',
  isLocal: false,
  online: true,
}

const hubComputer: ComputerSummary = {
  id: 'computer-hub',
  name: 'hub-host',
  isLocal: true,
  online: true,
}

describe('delegated transcription service', () => {
  it('sends the recording to the assigned computer', async () => {
    const local = localService()
    const hub = manager([hubComputer, workstation])
    const service = new DelegatedTranscriptionService({
      manager: hub,
      computerName: 'workstation',
      local,
    })

    await expect(service.transcribe(audio())).resolves.toEqual({
      transcript: 'Remote transcript',
      durationSeconds: 3,
    })
    expect(local.transcribe).not.toHaveBeenCalled()
    expect(hub.transcribeAudio).toHaveBeenCalledWith(
      'computer-1',
      'idea.m4a',
      'audio/x-m4a',
      Buffer.from('audio data'),
      expect.any(AbortSignal),
    )
  })

  it('matches the assigned computer by identifier and ignores case', async () => {
    const hub = manager([hubComputer, workstation])
    const service = new DelegatedTranscriptionService({
      manager: hub,
      computerName: ' COMPUTER-1 ',
      local: localService(),
    })

    await expect(service.transcribe(audio())).resolves.toMatchObject({
      transcript: 'Remote transcript',
    })
  })

  it('transcribes on the hub when it is the assigned computer', async () => {
    const local = localService()
    const hub = manager([hubComputer, workstation])
    const service = new DelegatedTranscriptionService({
      manager: hub,
      computerName: 'hub-host',
      local,
    })

    await expect(service.transcribe(audio())).resolves.toEqual({
      transcript: 'Local transcript',
      durationSeconds: 1,
    })
    expect(hub.transcribeAudio).not.toHaveBeenCalled()
  })

  it('reports an assignment that is not a paired computer', async () => {
    const service = new DelegatedTranscriptionService({
      manager: manager([hubComputer]),
      computerName: 'workstation',
      local: localService(),
    })

    await expect(service.transcribe(audio())).rejects.toMatchObject({
      statusCode: 503,
      message: expect.stringContaining('not a paired computer'),
    })
  })

  it('reports an assigned computer that is offline', async () => {
    const service = new DelegatedTranscriptionService({
      manager: manager([hubComputer, { ...workstation, online: false }]),
      computerName: 'workstation',
      local: localService(),
    })

    await expect(service.transcribe(audio())).rejects.toMatchObject({
      statusCode: 503,
      message: expect.stringContaining('offline'),
    })
  })

  it('rejects an unsupported audio type before it crosses the network', async () => {
    const hub = manager([hubComputer, workstation])
    const service = new DelegatedTranscriptionService({
      manager: hub,
      computerName: 'workstation',
      local: localService(),
    })

    await expect(
      service.transcribe(audio('data', 'notes.pdf', 'application/pdf')),
    ).rejects.toMatchObject({ statusCode: 415 })
    expect(hub.transcribeAudio).not.toHaveBeenCalled()
  })

  it('rejects a recording larger than the shared limit', async () => {
    const hub = manager([hubComputer, workstation])
    const service = new DelegatedTranscriptionService({
      manager: hub,
      computerName: 'workstation',
      local: localService(),
    })
    const oversized: AudioUpload = {
      filename: 'long.m4a',
      mimeType: 'audio/x-m4a',
      stream: Readable.from([
        Buffer.alloc(MAX_AUDIO_BYTES),
        Buffer.alloc(1024),
      ]),
      truncated: () => false,
    }

    await expect(service.transcribe(oversized)).rejects.toMatchObject({
      statusCode: 413,
    })
    expect(hub.transcribeAudio).not.toHaveBeenCalled()
  })

  it('rejects a truncated recording', async () => {
    const service = new DelegatedTranscriptionService({
      manager: manager([hubComputer, workstation]),
      computerName: 'workstation',
      local: localService(),
    })

    await expect(
      service.transcribe({ ...audio(), truncated: () => true }),
    ).rejects.toMatchObject({ statusCode: 413 })
  })

  it('keeps the status code the assigned computer reported', async () => {
    const hub = manager([hubComputer, workstation], async () => {
      throw Object.assign(new Error('Whisper is not installed'), {
        statusCode: 503,
      })
    })
    const service = new DelegatedTranscriptionService({
      manager: hub,
      computerName: 'workstation',
      local: localService(),
    })

    await expect(service.transcribe(audio())).rejects.toMatchObject({
      statusCode: 503,
      message: expect.stringContaining('Whisper is not installed'),
    })
  })

  it('reports an unreachable computer as a gateway failure', async () => {
    const hub = manager([hubComputer, workstation], async () => {
      throw new Error('fetch failed')
    })
    const service = new DelegatedTranscriptionService({
      manager: hub,
      computerName: 'workstation',
      local: localService(),
    })

    await expect(service.transcribe(audio())).rejects.toMatchObject({
      statusCode: 502,
    })
  })

  it('refuses a second recording while one is in flight', async () => {
    let release: (() => void) | undefined
    const hub = manager([hubComputer, workstation], async () => {
      await new Promise<void>((resolve) => {
        release = resolve
      })
      return { transcript: 'Remote transcript', durationSeconds: 3 }
    })
    const service = new DelegatedTranscriptionService({
      manager: hub,
      computerName: 'workstation',
      local: localService(),
    })

    const first = service.transcribe(audio())
    await vi.waitFor(() => expect(release).toBeDefined())
    await expect(service.transcribe(audio())).rejects.toMatchObject({
      statusCode: 429,
    })
    release?.()
    await expect(first).resolves.toMatchObject({
      transcript: 'Remote transcript',
    })
  })

  it('cancels the in-flight request when the caller aborts', async () => {
    const observed: AbortSignal[] = []
    const hub = manager([hubComputer, workstation], async (
      _computerId,
      _filename,
      _mimeType,
      _data,
      signal,
    ) => {
      if (signal) {
        observed.push(signal)
      }
      await new Promise((resolve) => setTimeout(resolve, 50))
      throw new TranscriptionError('Audio transcription was cancelled', 499)
    })
    const service = new DelegatedTranscriptionService({
      manager: hub,
      computerName: 'workstation',
      local: localService(),
    })
    const controller = new AbortController()

    const pending = service.transcribe(audio(), controller.signal)
    await vi.waitFor(() => expect(observed).toHaveLength(1))
    controller.abort()
    await expect(pending).rejects.toMatchObject({ statusCode: 499 })
    expect(observed[0]?.aborted).toBe(true)
  })

  it('stops the local service it wraps', async () => {
    const local = localService()
    const service = new DelegatedTranscriptionService({
      manager: manager([hubComputer, workstation]),
      computerName: 'workstation',
      local,
    })

    await service.initialize()
    await service.stop()
    expect(local.initialize).toHaveBeenCalled()
    expect(local.stop).toHaveBeenCalled()
  })
})
