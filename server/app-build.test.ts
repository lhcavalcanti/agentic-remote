import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { EventEmitter } from 'node:events'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { FastifyInstance } from 'fastify'
import { build } from 'vite'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { parseAppVersion } from '../shared/app-version.js'
import { ORACLE_VOICE_SAMPLE_RATE } from '../shared/oracle-voice.js'
import { buildApp } from './app.js'
import type { ManagerAgent } from './manager-agent.js'
import { FakeVoiceEngineFactory } from './oracle-voice-engine.js'
import { DEFAULT_VOICE_BACKEND_LIMITS } from './oracle-voice-session.js'

const directories: string[] = []
const apps: FastifyInstance[] = []

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()))
  await Promise.all(directories.splice(0).map((directory) =>
    rm(directory, { recursive: true, force: true }),
  ))
  vi.unstubAllEnvs()
})

describe('production app build identity', () => {
  it('embeds one identity in the client, metadata and worker, and changes it on rebuild', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'app-build-'))
    directories.push(directory)
    await writeFile(path.join(directory, 'index.html'),
      '<html><script type="module" src="/entry.js"></script></html>')
    await writeFile(path.join(directory, 'entry.js'),
      'globalThis.app = { version: __APP_VERSION__, buildId: __APP_BUILD_ID__ }')

    const compile = async () => {
      await build({
        configFile: fileURLToPath(new URL('../vite.config.ts', import.meta.url)),
        configLoader: 'runner',
        root: directory,
        cacheDir: path.join(directory, 'cache'),
        publicDir: fileURLToPath(new URL('../public', import.meta.url)),
        logLevel: 'silent',
        build: { minify: false },
      })
      const output = path.join(directory, 'dist')
      const metadata = JSON.parse(await readFile(path.join(output, 'build-info.json'), 'utf8'))
      const identity = parseAppVersion(metadata)
      expect(Object.keys(metadata).sort()).toEqual(['buildId', 'version'])
      expect(identity.buildId).toMatch(/^[0-9a-f-]{36}$/)
      const scripts = (await readdir(path.join(output, 'assets')))
        .filter((name) => name.endsWith('.js'))
      expect(scripts).toHaveLength(1)
      const client = await readFile(path.join(output, 'assets', scripts[0]), 'utf8')
      expect(client).toContain(JSON.stringify(identity.buildId))
      expect(client).toContain(JSON.stringify(identity.version))
      expect(client).not.toContain('__APP_BUILD_ID__')
      const worker = await readFile(path.join(output, 'sw.js'), 'utf8')
      expect(worker).toBe(
        `self.AGENTIC_REMOTE_BUILD_ID = ${JSON.stringify(identity.buildId)};\n${
          await readFile(new URL('../public/sw.js', import.meta.url), 'utf8')
        }`,
      )
      const voiceNotices = await readFile(
        path.join(output, 'oracle-voice-assets', 'THIRD_PARTY_NOTICES.txt'),
        'utf8',
      )
      expect(voiceNotices).toContain('@ricky0123/vad-web')
      expect(voiceNotices).toContain('Copyright (c) 2022-present ricky0123')
      expect(voiceNotices).toContain('Copyright (c) 2020-present Silero Team')
      expect(voiceNotices).toContain('onnxruntime-web')
      expect(voiceNotices).toContain('Copyright (c) Microsoft Corporation')
      expect(voiceNotices).toContain('THIRD PARTY SOFTWARE NOTICES AND INFORMATION')
      expect(voiceNotices).toContain('protocolbuffers/protobuf')
      return identity
    }

    const first = await compile()
    const second = await compile()
    expect(second.version).toBe(first.version)
    expect(second.buildId).not.toBe(first.buildId)
  }, 20_000)
})

describe('Oracle voice app construction', () => {
  const transcriptionService = {
    initialize: async () => undefined,
    stop: async () => undefined,
    transcribe: async () => ({ transcript: 'unchanged', durationSeconds: 1 }),
  }

  async function dataDirectory() {
    const directory = await mkdtemp(path.join(tmpdir(), 'app-voice-'))
    directories.push(directory)
    return directory
  }

  function availableManager(): ManagerAgent {
    return Object.assign(new EventEmitter(), {
      start: async () => undefined,
      stop: async () => undefined,
      cancel: async () => undefined,
      hiddenSessionIds: () => [],
      snapshot: () => ({
        available: true,
        status: 'idle',
        messages: [],
        queued: 0,
        managedSessions: [],
      }),
    }) as unknown as ManagerAgent
  }

  it('bounds WebSocket messages at the text-control limit before route handling', async () => {
    const runtime = await buildApp({
      dataDirectory: await dataDirectory(),
      logger: false,
      managerAgent: availableManager(),
      transcriptionService,
    })
    apps.push(runtime.app)

    await runtime.app.ready()

    expect(runtime.app.websocketServer.options.maxPayload)
      .toBe(DEFAULT_VOICE_BACKEND_LIMITS.maxQueueBytes)
  })

  it('keeps voice disabled unless explicitly enabled without starting an injected engine', async () => {
    vi.stubEnv('AGENTIC_REMOTE_ORACLE_VOICE', 'off')
    const factory = new FakeVoiceEngineFactory(undefined, {
      available: true,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      playbackSampleRate: 22_050,
      languages: ['en'],
      sttProfile: 'zipformer',
      ttsVoice: 'lessac',
      resourceClass: 'low',
    })

    const runtime = await buildApp({
      dataDirectory: await dataDirectory(),
      logger: false,
      managerAgent: availableManager(),
      transcriptionService,
      voiceEngineFactory: factory,
    })
    apps.push(runtime.app)

    expect(runtime.voiceConfig).toEqual({ enabled: false })
    expect(runtime.voiceEngineFactory).toBe(factory)
    expect(runtime.voiceCapability).toEqual({
      available: false,
      reason: 'Oracle voice is disabled (AGENTIC_REMOTE_ORACLE_VOICE=on to enable).',
    })
    expect(factory.initializedWith).toEqual([])
  })

  it('exposes validated enabled configuration without starting the engine', async () => {
    const directory = await dataDirectory()
    await mkdir(path.join(directory, 'stt'), { recursive: true })
    await writeFile(path.join(directory, 'stt', 'encoder.onnx'), 'model')
    await writeFile(path.join(directory, 'piper'), 'binary')
    await writeFile(path.join(directory, 'voice.onnx'), 'voice')
    await writeFile(path.join(directory, 'voice.json'), JSON.stringify({
      audio: {
        sample_rate: 22_050,
      },
    }))
    const environment = {
      AGENTIC_REMOTE_ORACLE_VOICE: 'on',
      AGENTIC_REMOTE_VOICE_STT_MODEL_DIR: 'stt',
      AGENTIC_REMOTE_VOICE_STT_PROFILE: 'zipformer',
      AGENTIC_REMOTE_VOICE_LANGUAGE: 'en',
      AGENTIC_REMOTE_VOICE_THREADS: '2',
      AGENTIC_REMOTE_VOICE_ENDPOINT_MS: '700',
      AGENTIC_REMOTE_VOICE_TTS_BIN: 'piper',
      AGENTIC_REMOTE_VOICE_TTS_MODEL: 'voice.onnx',
      AGENTIC_REMOTE_VOICE_TTS_CONFIG: 'voice.json',
    }
    for (const [name, value] of Object.entries(environment)) vi.stubEnv(name, value)
    const factory = new FakeVoiceEngineFactory(undefined, {
      available: true,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      playbackSampleRate: 22_050,
      languages: ['en'],
      sttProfile: 'zipformer',
      ttsVoice: 'lessac',
      resourceClass: 'low',
    })

    const runtime = await buildApp({
      dataDirectory: directory,
      logger: false,
      managerAgent: availableManager(),
      transcriptionService,
      voiceEngineFactory: factory,
    })
    apps.push(runtime.app)

    expect(runtime.voiceConfig).toMatchObject({
      enabled: true,
      language: 'en',
      threads: 2,
      endpointMs: 700,
      tts: {
        sampleRate: 22_050,
      },
    })
    expect(runtime.voiceCapability).toEqual(factory.capability())
    expect(factory.initializedWith).toEqual([])
    const nodeInfo = await runtime.app.inject({
      url: '/node-api/info',
      headers: {
        authorization: ['Bearer', runtime.identity.token].join(' '),
      },
    })
    expect(nodeInfo.json().voice).toMatchObject({
      available: true,
      sampleRate: ORACLE_VOICE_SAMPLE_RATE,
      ttsVoice: 'voice',
    })
  })

  it('reports invalid enabled configuration as unavailable while core routes stay healthy', async () => {
    vi.stubEnv('AGENTIC_REMOTE_ORACLE_VOICE', 'on')
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'https://hub.test')
    const runtime = await buildApp({
      dataDirectory: await dataDirectory(),
      logger: false,
      managerAgent: availableManager(),
      transcriptionService,
    })
    apps.push(runtime.app)

    expect(runtime.voiceConfig).toEqual({ enabled: false })
    expect(runtime.voiceCapability).toMatchObject({
      available: false,
      reason: expect.stringContaining('AGENTIC_REMOTE_VOICE_STT_PROFILE'),
    })
    expect(await runtime.app.inject({ method: 'GET', url: '/health' }))
      .toMatchObject({ statusCode: 200 })
    const headers = { host: 'hub.test', origin: 'https://hub.test' }
    expect(await runtime.app.inject({ method: 'GET', url: '/api/manager', headers }))
      .toMatchObject({ statusCode: 200 })
    expect((await runtime.app.inject({
      method: 'POST',
      url: '/api/transcriptions',
      headers,
    })).statusCode)
      .not.toBe(404)
  })

  it('routes an enabled hub to a paired voice computer without local model paths', async () => {
    vi.stubEnv('AGENTIC_REMOTE_ORACLE_VOICE', 'on')
    vi.stubEnv('AGENTIC_REMOTE_VOICE_COMPUTER', 'Speech node')
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'https://hub.test')
    const runtime = await buildApp({
      dataDirectory: await dataDirectory(),
      logger: false,
      managerAgent: availableManager(),
      transcriptionService,
    })
    apps.push(runtime.app)
    vi.spyOn(runtime.manager!, 'listComputers').mockReturnValue([
      {
        id: 'hub',
        name: 'Hub',
        isLocal: true,
        online: true,
      },
      {
        id: 'speech-node',
        name: 'Speech node',
        isLocal: false,
        online: true,
        voice: {
          available: true,
          sampleRate: ORACLE_VOICE_SAMPLE_RATE,
          playbackSampleRate: 22_050,
          languages: ['en'],
          sttProfile: 'zipformer',
          ttsVoice: 'ljspeech',
          resourceClass: 'low',
        },
      },
    ])

    expect(runtime.voiceConfig).toEqual({
      enabled: true,
      computerName: 'Speech node',
    })
    const capability = await runtime.app.inject({
      url: '/api/oracle-voice/capabilities',
      headers: { host: 'hub.test', origin: 'https://hub.test' },
    })
    expect(capability.statusCode).toBe(200)
    expect(capability.json()).toMatchObject({
      available: true,
      computerId: 'speech-node',
      computerName: 'Speech node',
      ttsVoice: 'ljspeech',
    })
  })

  it('reports an explicit unavailable capability for a missing selected computer', async () => {
    vi.stubEnv('AGENTIC_REMOTE_ORACLE_VOICE', 'on')
    vi.stubEnv('AGENTIC_REMOTE_VOICE_COMPUTER', 'Missing node')
    vi.stubEnv('AGENTIC_REMOTE_ALLOWED_ORIGINS', 'https://hub.test')
    const runtime = await buildApp({
      dataDirectory: await dataDirectory(),
      logger: false,
      managerAgent: availableManager(),
      transcriptionService,
    })
    apps.push(runtime.app)

    const capability = await runtime.app.inject({
      url: '/api/oracle-voice/capabilities',
      headers: { host: 'hub.test', origin: 'https://hub.test' },
    })
    expect(capability.statusCode).toBe(200)
    expect(capability.json()).toMatchObject({
      available: false,
      reason: 'Configured voice computer "Missing node" is not paired.',
    })
  })
})
