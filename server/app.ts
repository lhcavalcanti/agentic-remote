import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile, realpath } from 'node:fs/promises'
import Fastify, { type FastifyInstance } from 'fastify'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import fastifyWebsocket from '@fastify/websocket'
import { z } from 'zod'
import { parseAppVersion, type AppVersion } from '../shared/app-version.js'
import type { HubEvent } from '../shared/contracts.js'
import {
  deliveryUncertaintyFromError,
  SubmissionError,
  terminalDraftConflictFromError,
} from '../shared/submission-error.js'
import { AgentService } from './agent-service.js'
import { ClaudeAgentService } from './claude-agent-service.js'
import { createCliCanary } from './cli-canary.js'
import { ComputerManager } from './computer-manager.js'
import { ComputerRegistry } from './computer-registry.js'
import { registerHubRoutes } from './hub-routes.js'
import { ManagerAgent } from './manager-agent.js'
import { JournalRecorder } from './manager-journal.js'
import { registerManagerRoutes } from './manager-routes.js'
import { createManagerSdkClient, managerRuntimeSettings } from './manager-runtime.js'
import { ManagerStore } from './manager-store.js'
import { KnowledgeStore } from './knowledge-store.js'
import { NodeIdentityStore } from './node-identity.js'
import { registerNodeRoutes } from './node-routes.js'
import { resolveDataDirectory } from './paths.js'
import { PushNotificationService } from './push-notification-service.js'
import { ProviderSessionService } from './provider-session-service.js'
import { registerPushRoutes } from './push-routes.js'
import { SessionStore } from './session-store.js'
import { SessionKnowledgeStore } from './session-knowledge-store.js'
import { SessionOrderStore } from './session-order-store.js'
import type { SessionService } from './session-service.js'
import {
  LocalTranscriptionService,
  localTranscriptionOptions,
  TranscriptionError,
  type TranscriptionService,
} from './transcription-service.js'
import {
  DelegatedTranscriptionService,
  transcriptionComputerName,
} from './delegated-transcription-service.js'
import {
  FileUploadError,
  registerFileUploadRoutes,
} from './file-upload-routes.js'
import {
  registerTranscriptionRoutes,
  transcriptionMultipartOptions,
} from './transcription-routes.js'

export type ServerRole = 'hub' | 'node'

export interface BuildAppOptions {
  service?: SessionService
  identity?: NodeIdentityStore
  manager?: ComputerManager
  logger?: boolean
  serveStatic?: boolean
  role?: ServerRole
  dataDirectory?: string
  pushService?: PushNotificationService
  transcriptionService?: TranscriptionService
  knowledgeStore?: KnowledgeStore
  sessionKnowledgeStore?: SessionKnowledgeStore
  sessionOrderStore?: SessionOrderStore
  /**
   * The session manager agent. Built on a hub with the built-in session
   * service unless false or turned off with AGENTIC_REMOTE_MANAGER=off.
   */
  managerAgent?: ManagerAgent | false
  /**
   * Checks each Copilot CLI version this computer updates to by starting a
   * disposable terminal session. Only for the built-in session service.
   */
  cliCanary?: boolean
}

function errorStatusCode(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined
  }
  const statusCode = Reflect.get(error, 'statusCode')
  return typeof statusCode === 'number' ? statusCode : undefined
}

function isAppleTouchIconProbe(url: string): boolean {
  const pathname = url.split(/[?#]/, 1)[0]
  const name = pathname.slice(pathname.lastIndexOf('/') + 1)
  return /^apple-touch-icon(?:-\d+x\d+)?(?:-precomposed)?\.png$/i.test(name)
}

export async function buildApp(
  options: BuildAppOptions = {},
): Promise<{
  app: FastifyInstance
  service: SessionService
  identity: NodeIdentityStore
  manager?: ComputerManager
  pushService?: PushNotificationService
  transcriptionService?: TranscriptionService
  knowledgeStore?: KnowledgeStore
  sessionKnowledgeStore?: SessionKnowledgeStore
  sessionOrderStore?: SessionOrderStore
  managerAgent?: ManagerAgent
}> {
  const role = options.role ?? 'hub'
  let publicDirectory: string | undefined
  let appVersion: AppVersion | undefined
  if (role === 'hub' && options.serveStatic) {
    const serverDirectory = path.dirname(fileURLToPath(import.meta.url))
    const configuredDirectory = process.env.AGENTIC_REMOTE_RELEASE_DIR?.trim()
      ? path.resolve(process.env.AGENTIC_REMOTE_RELEASE_DIR)
      : path.resolve(serverDirectory, '../dist')
    publicDirectory = await realpath(configuredDirectory)
    appVersion = parseAppVersion(
      JSON.parse(await readFile(path.join(publicDirectory, 'build-info.json'), 'utf8')),
    )
    if (!appVersion.buildId) {
      throw new Error('The static app build identity is missing; rebuild the app')
    }
  }
  const app = Fastify({ logger: options.logger ?? true })
  const dataDirectory = options.dataDirectory ?? resolveDataDirectory()
  const agent = options.service
    ? undefined
    : new AgentService(new SessionStore(dataDirectory))
  const service =
    options.service ??
    new ProviderSessionService(
      agent!,
      new ClaudeAgentService(
        new SessionStore(path.join(dataDirectory, 'claude')),
      ),
    )
  const identity = options.identity ?? new NodeIdentityStore(dataDirectory)
  await identity.initialize()

  // Registered before any routes: route plugins capture the error handler
  // present when their scope is created, so a later call would leave them
  // on Fastify's default serialization.
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        error: error.issues[0]?.message || 'Invalid request',
      })
    }
    app.log.error(error)
    const submission = error instanceof SubmissionError ? error.submission : undefined
    const explicitUncertainty = deliveryUncertaintyFromError(error)
    const terminalDraftConflict = terminalDraftConflictFromError(error)
    if (error instanceof TranscriptionError || error instanceof FileUploadError) {
      return reply.code(error.statusCode).send({ error: error.message })
    }
    const explicitStatusCode = errorStatusCode(error)
    if (
      explicitStatusCode !== undefined &&
      explicitStatusCode >= 400 &&
      explicitStatusCode < 600
    ) {
      return reply.code(explicitStatusCode).send({
        error: error instanceof Error ? error.message : 'Request failed',
        ...(submission ? { submission } : {}),
        ...(explicitUncertainty === undefined
          ? {}
          : { uncertainDelivery: explicitUncertainty }),
        ...(terminalDraftConflict ? { terminalDraftConflict: true } : {}),
      })
    }
    const message = error instanceof Error ? error.message : 'Unexpected server error'
    const lower = message.toLowerCase()
    const statusCode = lower.includes('not found')
      ? 404
      : lower.includes('not registered')
        ? 400
        : 500
    return reply.code(statusCode).send({
      error: statusCode === 500 ? 'Unexpected server error' : message,
      ...(submission ? { submission } : {}),
      ...(explicitUncertainty === undefined
        ? {}
        : { uncertainDelivery: explicitUncertainty }),
      ...(terminalDraftConflict ? { terminalDraftConflict: true } : {}),
    })
  })

  await app.register(fastifyWebsocket)
  const localTranscription =
    options.transcriptionService ??
    new LocalTranscriptionService(localTranscriptionOptions(dataDirectory))
  await localTranscription.initialize()
  await registerNodeRoutes(app, service, identity, localTranscription)

  let manager: ComputerManager | undefined
  let pushService: PushNotificationService | undefined
  let transcriptionService: TranscriptionService | undefined
  let knowledgeStore: KnowledgeStore | undefined
  let sessionKnowledgeStore: SessionKnowledgeStore | undefined
  let sessionOrderStore: SessionOrderStore | undefined
  let managerAgent: ManagerAgent | undefined
  let managerUnavailable: string | undefined
  let forwardToJournal: ((event: HubEvent) => void) | undefined
  if (role === 'hub') {
    manager =
      options.manager ??
      new ComputerManager(
        service,
        identity,
        new ComputerRegistry(dataDirectory),
      )
    await manager.initialize()
    knowledgeStore = options.knowledgeStore ?? new KnowledgeStore(dataDirectory)
    await knowledgeStore.initialize()
    sessionKnowledgeStore = options.sessionKnowledgeStore ??
      new SessionKnowledgeStore(dataDirectory, knowledgeStore)
    await sessionKnowledgeStore.initialize()
    // Hub-only: a node serves no UI, so it has no ordering to remember.
    sessionOrderStore = options.sessionOrderStore ?? new SessionOrderStore(dataDirectory)
    await sessionOrderStore.initialize()
    pushService =
      options.pushService ?? new PushNotificationService(dataDirectory)
    await pushService.initialize()
    pushService.attach(manager)
    const managerSettings = managerRuntimeSettings()
    if (options.managerAgent) {
      managerAgent = options.managerAgent
    } else if (options.managerAgent === false || !managerSettings.enabled) {
      managerUnavailable = 'The manager agent is turned off on this hub (AGENTIC_REMOTE_MANAGER=off).'
    } else if (!agent) {
      managerUnavailable = 'The manager agent needs the built-in Copilot session service.'
    } else {
      const managerStore = new ManagerStore(path.join(dataDirectory, 'manager'))
      await managerStore.initialize()
      const recorder = new JournalRecorder(managerStore)
      forwardToJournal = (event) => recorder.handle(event)
      manager.on('event', forwardToJournal)
      managerAgent = new ManagerAgent({
        store: managerStore,
        recorder,
        hub: manager,
        clientFactory: createManagerSdkClient,
        excludeFromDiscovery: (ids) => agent.excludeFromDiscovery(ids),
        model: managerSettings.model,
        reasoningEffort: managerSettings.reasoningEffort,
      })
      // Before the session service starts, so its first discovery already
      // leaves the manager's own conversations out.
      agent.excludeFromDiscovery(managerAgent.hiddenSessionIds())
    }
    await registerHubRoutes(
      app,
      manager,
      knowledgeStore,
      pushService,
      sessionKnowledgeStore,
      sessionOrderStore,
      managerAgent,
    )
    await registerManagerRoutes(app, managerAgent, managerUnavailable)
    await registerPushRoutes(app, pushService)
    const delegate = transcriptionComputerName()
    transcriptionService = delegate
      ? new DelegatedTranscriptionService({
          manager,
          computerName: delegate,
          local: localTranscription,
        })
      : localTranscription
    await app.register(fastifyMultipart, transcriptionMultipartOptions)
    await registerTranscriptionRoutes(app, transcriptionService)
    await registerFileUploadRoutes(app, manager)
    app.get('/api/version', async (_request, reply) => {
      reply.header('cache-control', 'no-store')
      return appVersion ?? { version: identity.info.version }
    })
  }

  app.get('/health', async () => ({
    ok: true,
    role,
    node: identity.info,
  }))

  if (publicDirectory) {
    await app.register(fastifyStatic, {
      root: publicDirectory,
      wildcard: false,
    })
    app.setNotFoundHandler((request, reply) => {
      if (
        request.url.startsWith('/api/') ||
        request.url.startsWith('/node-api/') ||
        request.url.startsWith('/assets/') ||
        isAppleTouchIconProbe(request.url)
      ) {
        return reply.code(404).send({ error: 'Not found' })
      }
      return reply.sendFile('index.html')
    })
  }

  const cliCanary = agent && options.cliCanary
    ? createCliCanary({
        dataDirectory,
        copilotBin: process.env.COPILOT_BIN?.trim() || '/usr/local/bin/copilot',
        probe: (cwd, signal) => agent.probeTerminalStartup(cwd, signal),
        alert: (message) => agent.publishAlert(message),
        cancel: () => agent.endTerminalProbes(),
      })
    : undefined
  // Ready only once the service has started, so the probe never races the
  // recovery of sessions that were open before a restart.
  app.addHook('onReady', async () => {
    cliCanary?.start()
    await managerAgent?.start()
  })

  app.addHook('onClose', async () => {
    await cliCanary?.stop()
    if (forwardToJournal) manager?.off('event', forwardToJournal)
    await managerAgent?.stop()
    manager?.stop()
    pushService?.stop()
    await (transcriptionService ?? localTranscription).stop()
    await service.stop()
  })

  return {
    app,
    service,
    identity,
    manager,
    pushService,
    transcriptionService: transcriptionService ?? localTranscription,
    knowledgeStore,
    sessionKnowledgeStore,
    sessionOrderStore,
    managerAgent,
  }
}
