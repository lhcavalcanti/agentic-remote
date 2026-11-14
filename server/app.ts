import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile, realpath } from 'node:fs/promises'
import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify'
import fastifyMultipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import fastifyWebsocket from '@fastify/websocket'
import { z } from 'zod'
import { parseAppVersion, type AppVersion } from '../shared/app-version.js'
import { parseFeatureFlag, readHubFeatureFlags } from '../shared/feature-flags.js'
import type {
  HubEvent,
  VoiceBackendCapability,
} from '../shared/contracts.js'
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
import { ManagerProactiveCoordinator } from './manager-proactive-coordinator.js'
import { ManagerProactiveInbox } from './manager-proactive-inbox.js'
import { OracleTaskStore, unfinishedOracleTaskSessions } from './oracle-task-store.js'
import {
  initializeManagerStructuredMemory,
  ManagerStructuredMemoryRuntime,
} from './manager-structured-memory-runtime.js'
import { KnowledgeStore } from './knowledge-store.js'
import { NodeIdentityStore } from './node-identity.js'
import { registerNodeRoutes } from './node-routes.js'
import { resolveDataDirectory } from './paths.js'
import { PushNotificationService } from './push-notification-service.js'
import { NotificationStore } from './notification-store.js'
import { NotificationCenterService } from './notification-center-service.js'
import { registerNotificationRoutes } from './notification-routes.js'
import { ProviderSessionService } from './provider-session-service.js'
import { registerPushRoutes } from './push-routes.js'
import {
  noteRefusalReason,
  RefusalCounter,
  refusalReasonFromError,
  registerRefusalMetrics,
} from './refusal-metrics.js'
import { SessionStore } from './session-store.js'
import { SessionKnowledgeStore } from './session-knowledge-store.js'
import { SessionOrderStore } from './session-order-store.js'
import { SettingsProfileStore } from './settings-profile-store.js'
import { ClientPresence } from './client-presence.js'
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
  readOracleVoiceConfig,
  readOracleVoiceSelection,
  type OracleVoiceConfig,
} from './oracle-voice-config.js'
import type { VoiceEngineFactory } from './oracle-voice-engine.js'
import {
  DEFAULT_VOICE_BACKEND_LIMITS,
  LocalVoiceBackend,
  type VoiceBackend,
} from './oracle-voice-session.js'
import { ChildVoiceEngine } from './oracle-voice-worker.js'
import {
  registerTranscriptionRoutes,
  transcriptionMultipartOptions,
} from './transcription-routes.js'
import { silentStartupPhases, type StartupPhases } from './startup-phases.js'
import { registerDreamerRoutes } from './dreamer-routes.js'
import { DreamerService } from './dreamer-service.js'
import { HostTelemetrySampler } from './host-telemetry/sampler.js'
import { HostTelemetryService } from './host-telemetry/service.js'
import { HostAlertMonitor } from './host-telemetry/alerts.js'
import type { ProcessScanContext } from './host-telemetry/processes.js'
import { registerHostTelemetryRoutes } from './host-telemetry/routes.js'
import { SchedulerStore } from './scheduler-store.js'
import { SchedulerDispatcher, type ScheduleLauncher } from './scheduler-dispatcher.js'
import { registerSchedulerRoutes } from './scheduler-routes.js'
import { SessionScheduleLauncher } from './schedule-launcher.js'
import { configuredScheduleWorktreeRoots, ScheduleWorktreeService } from './schedule-worktrees.js'

export type ServerRole = 'hub' | 'node'

export interface BuildAppOptions {
  service?: SessionService
  identity?: NodeIdentityStore
  manager?: ComputerManager
  logger?: FastifyServerOptions['logger']
  serveStatic?: boolean
  role?: ServerRole
  dataDirectory?: string
  pushService?: PushNotificationService
  transcriptionService?: TranscriptionService
  knowledgeStore?: KnowledgeStore
  sessionKnowledgeStore?: SessionKnowledgeStore
  sessionOrderStore?: SessionOrderStore
  settingsProfileStore?: SettingsProfileStore
  /** Injected speech-engine construction seam; buildApp never starts it. */
  voiceEngineFactory?: VoiceEngineFactory
  /** Injected voice transport seam; Task 6 constructs the runtime backend. */
  voiceBackend?: VoiceBackend
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
  /** Records the startup work that runs while the server becomes ready. */
  startupPhases?: StartupPhases
  hostTelemetryFactory?: (dataDirectory: string, processContext: ProcessScanContext) => HostTelemetryService
  /** Runner integration seam; ignored without the hub scheduler flag. */
  scheduleLauncher?: ScheduleLauncher
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
  notificationCenter?: NotificationCenterService
  transcriptionService?: TranscriptionService
  knowledgeStore?: KnowledgeStore
  sessionKnowledgeStore?: SessionKnowledgeStore
  sessionOrderStore?: SessionOrderStore
  settingsProfileStore?: SettingsProfileStore
  managerAgent?: ManagerAgent
  managerStructuredMemory: ManagerStructuredMemoryRuntime
  voiceConfig: OracleVoiceConfig
  voiceEngineFactory?: VoiceEngineFactory
  voiceCapability: VoiceBackendCapability
  dreamerService?: DreamerService
  scheduler?: SchedulerDispatcher
  proactiveCoordinator?: ManagerProactiveCoordinator
  hostTelemetry?: HostTelemetryService
  hostAlerts?: HostAlertMonitor
}> {
  const role = options.role ?? 'hub'
  const hubFlags = role === 'hub' ? readHubFeatureFlags(process.env) : undefined
  const hostMonitorEnabled = hubFlags?.hostMonitor ??
    parseFeatureFlag('AGENTIC_REMOTE_FEATURE_HOST_MONITOR', process.env.AGENTIC_REMOTE_FEATURE_HOST_MONITOR)
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
  if (hubFlags) app.log.info({ hubFlags }, 'Hub feature flags')
  const dataDirectory = options.dataDirectory ?? resolveDataDirectory()
  const startupPhases = options.startupPhases ?? silentStartupPhases
  const voiceSelection = readOracleVoiceSelection()
  let voiceConfig: OracleVoiceConfig = { enabled: false }
  let voiceConfigurationError: string | undefined
  try {
    voiceConfig = await readOracleVoiceConfig(dataDirectory, process.env, {
      requireLocal: role === 'node' || !voiceSelection.enabled || !voiceSelection.computerName,
    })
  } catch (error) {
    voiceConfigurationError = error instanceof Error ? error.message : String(error)
  }
  const localVoiceConfig = voiceConfig.enabled && 'stt' in voiceConfig
    ? voiceConfig
    : undefined
  let voiceEngineFactory = options.voiceEngineFactory
  if (
    !options.voiceBackend
    && !voiceConfigurationError
    && localVoiceConfig
    && !voiceEngineFactory
  ) {
    voiceEngineFactory = new ChildVoiceEngine(localVoiceConfig)
  }
  const voiceService = options.voiceBackend ?? (
    !voiceConfigurationError && localVoiceConfig && voiceEngineFactory
      ? new LocalVoiceBackend(voiceEngineFactory, localVoiceConfig)
      : undefined
  )
  const voiceCapability: VoiceBackendCapability =
    options.voiceBackend?.capability() ?? (
      voiceConfigurationError
        ? {
            available: false,
            reason: `Oracle voice configuration is invalid: ${voiceConfigurationError}`,
          }
        : !voiceConfig.enabled
          ? {
              available: false,
              reason: 'Oracle voice is disabled (AGENTIC_REMOTE_ORACLE_VOICE=on to enable).',
            }
          : !localVoiceConfig
            ? {
                available: false,
                reason: 'Oracle voice uses the configured paired computer; no local engine is loaded.',
              }
          : voiceEngineFactory?.capability() ?? {
              available: false,
              reason: 'Oracle voice engine is unavailable.',
            }
    )
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
  const processContext: ProcessScanContext = {
    listSessionPaneRoots: () => service.listSessionPaneRoots?.() ?? Promise.resolve([]),
  }
  const hostTelemetry = hostMonitorEnabled
    ? options.hostTelemetryFactory?.(dataDirectory, processContext) ??
      new HostTelemetryService(new HostTelemetrySampler({ dataDirectory }), processContext)
    : undefined
  const hostTelemetryLifetime = hostTelemetry ? new AbortController() : undefined
  const scheduleWorktrees = new ScheduleWorktreeService(dataDirectory, configuredScheduleWorktreeRoots())

  // Registered before any routes: route plugins capture the error handler
  // present when their scope is created, so a later call would leave them
  // on Fastify's default serialization.
  const refusals = new RefusalCounter()
  registerRefusalMetrics(app, refusals)
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof z.ZodError) {
      noteRefusalReason(request, refusalReasonFromError(error, 400))
      return reply.code(400).send({
        error: error.issues[0]?.message || 'Invalid request',
      })
    }
    app.log.error(error)
    const submission = error instanceof SubmissionError ? error.submission : undefined
    const explicitUncertainty = deliveryUncertaintyFromError(error)
    const terminalDraftConflict = terminalDraftConflictFromError(error)
    if (error instanceof TranscriptionError || error instanceof FileUploadError) {
      noteRefusalReason(request, refusalReasonFromError(error, error.statusCode))
      return reply.code(error.statusCode).send({ error: error.message })
    }
    const explicitStatusCode = errorStatusCode(error)
    if (
      explicitStatusCode !== undefined &&
      explicitStatusCode >= 400 &&
      explicitStatusCode < 600
    ) {
      noteRefusalReason(request, refusalReasonFromError(error, explicitStatusCode))
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
    if (statusCode !== 500) noteRefusalReason(request, statusCode === 404 ? 'not-found' : 'not-registered')
    return reply.code(statusCode).send({
      error: statusCode === 500 ? 'Unexpected server error' : message,
      ...(submission ? { submission } : {}),
      ...(explicitUncertainty === undefined
        ? {}
        : { uncertainDelivery: explicitUncertainty }),
      ...(terminalDraftConflict ? { terminalDraftConflict: true } : {}),
    })
  })

  if (hostTelemetryLifetime) {
    // Terminate host streams before the generic WebSocket closer waits on unread peers.
    app.addHook('preClose', async () => hostTelemetryLifetime.abort())
  }
  await app.register(fastifyWebsocket, {
    options: {
      maxPayload: DEFAULT_VOICE_BACKEND_LIMITS.maxQueueBytes,
    },
  })
  const localTranscription =
    options.transcriptionService ??
    new LocalTranscriptionService(localTranscriptionOptions(dataDirectory))
  await localTranscription.initialize()
  await registerNodeRoutes(
    app,
    service,
    identity,
    localTranscription,
    voiceService,
    hostTelemetry,
    hostTelemetryLifetime?.signal,
    scheduleWorktrees,
  )

  let manager: ComputerManager | undefined
  let pushService: PushNotificationService | undefined
  let notificationCenter: NotificationCenterService | undefined
  let hostAlerts: HostAlertMonitor | undefined
  let transcriptionService: TranscriptionService | undefined
  let knowledgeStore: KnowledgeStore | undefined
  let sessionKnowledgeStore: SessionKnowledgeStore | undefined
  let sessionOrderStore: SessionOrderStore | undefined
  let settingsProfileStore: SettingsProfileStore | undefined
  let managerAgent: ManagerAgent | undefined
  let managerStore: ManagerStore | undefined
  let managerStoreReady = false
  let dreamerService: DreamerService | undefined
  let scheduler: SchedulerDispatcher | undefined
  let proactiveCoordinator: ManagerProactiveCoordinator | undefined
  let proactiveInbox: ManagerProactiveInbox | undefined
  let oracleTaskStore: OracleTaskStore | undefined
  let dreamerUnavailable: string | undefined
  let managerStructuredMemory = new ManagerStructuredMemoryRuntime('off')
  let managerUnavailable: string | undefined
  let forwardToJournal: ((event: HubEvent) => void) | undefined
  let forwardToProactive: ((event: HubEvent) => void) | undefined
  let forwardHubToDreamer: ((event: HubEvent) => void) | undefined
  let forwardManagerToDreamer: (() => void) | undefined
  if (role === 'hub') {
    manager =
      options.manager ??
      new ComputerManager(
        service,
        identity,
        new ComputerRegistry(dataDirectory),
        scheduleWorktrees,
      )
    await manager.initialize()
    knowledgeStore = options.knowledgeStore ?? new KnowledgeStore(dataDirectory)
    await knowledgeStore.initialize()
    sessionKnowledgeStore = options.sessionKnowledgeStore ??
      new SessionKnowledgeStore(dataDirectory, knowledgeStore)
    await sessionKnowledgeStore.initialize()
    await knowledgeStore.recoverProvisionalRoots(
      sessionKnowledgeStore.listBindings(),
    )
    // Hub-only: a node serves no UI, so it has no ordering to remember.
    sessionOrderStore = options.sessionOrderStore ?? new SessionOrderStore(dataDirectory)
    await sessionOrderStore.initialize()
    settingsProfileStore = options.settingsProfileStore ?? new SettingsProfileStore(dataDirectory)
    await settingsProfileStore.initialize()
    pushService =
      options.pushService ?? new PushNotificationService(dataDirectory)
    await pushService.initialize()
    if (hubFlags?.notificationCenter) {
      const store = new NotificationStore(dataDirectory, {
        warn: (message) => app.log.warn(message),
      })
      await startupPhases.run('notifications.initialize', () => store.initialize())
      notificationCenter = new NotificationCenterService(store, {
        mutedSessions: () => pushService!.settings().mutedSessions,
        readSession: (computerId, sessionId) => manager!.readSession(computerId, sessionId),
      })
      for (const computer of manager.listComputers()) {
        await notificationCenter.hub({ type: 'computer.updated', computer }, true)
      }
      if (hostTelemetry) {
        const localTelemetry = hostTelemetry
        hostAlerts = new HostAlertMonitor({
          computers: () => manager!.listComputers(),
          resolve: (computerId) => manager!.hostTelemetryTarget(computerId, localTelemetry),
          notifications: notificationCenter,
          warn: () => app.log.warn('Host resource alert observation failed'),
        })
      }
    }
    if (notificationCenter) pushService.setRecorder(notificationCenter)
    else pushService.setRecorder?.(undefined)
    pushService.attach(manager)
    const presence = new ClientPresence()
    const profile = settingsProfileStore
    pushService.setPolicy({
      scope: () => profile.snapshot().values.notificationScope,
      oracleWatched: () => presence.oracleWatched(),
    })
    const managerSettings = managerRuntimeSettings()
    managerStructuredMemory = await initializeManagerStructuredMemory(
      path.join(dataDirectory, 'manager'),
      managerSettings.structuredMemory,
    )
    const memoryStatus = managerStructuredMemory.status()
    if (memoryStatus.availability === 'unavailable') {
      app.log.error(
        { reason: memoryStatus.lastError },
        'Oracle structured memory is unavailable',
      )
    }
    if (options.managerAgent) {
      managerAgent = options.managerAgent
    } else if (options.managerAgent === false || !managerSettings.enabled) {
      managerUnavailable = 'Oracle is turned off on this hub (AGENTIC_REMOTE_MANAGER=off).'
    } else if (!agent) {
      managerUnavailable = 'Oracle needs the built-in Copilot session service.'
    } else {
      managerStore = new ManagerStore(path.join(dataDirectory, 'manager'))
      // The manager is an addition to the hub; a hub whose manager cannot
      // start still serves everything else.
      const initialized = await managerStore.initialize().then(() => true, (error: unknown) => {
        app.log.error({ err: error }, 'The manager agent could not start')
        managerUnavailable = `Oracle could not start: ${error instanceof Error ? error.message : String(error)}`
        return false
      })
      managerStoreReady = initialized
      const recorder = initialized ? new JournalRecorder(managerStore) : undefined
      if (initialized) {
        const dreamerDirectory = path.join(
          dataDirectory,
          'manager',
          'dreamer',
        )
        oracleTaskStore = new OracleTaskStore(dreamerDirectory, {
          hubId: identity.info.id,
        })
        proactiveInbox = new ManagerProactiveInbox(
          path.join(dataDirectory, 'manager', 'proactive'),
          {
            enabled: true,
            hubId: identity.info.id,
          },
        )
      }
      if (recorder) {
        forwardToJournal = (event) => recorder.handle(event)
        manager.on('event', forwardToJournal)
      }
      managerAgent = recorder && new ManagerAgent({
        store: managerStore,
        recorder,
        hub: manager,
        hostTelemetryTarget: async (computerId) => hostTelemetry
          ? manager!.hostTelemetryTarget(computerId, hostTelemetry)
          : undefined,
        clientFactory: createManagerSdkClient,
        excludeFromDiscovery: (ids) => agent.excludeFromDiscovery(ids),
        model: managerSettings.model,
        reasoningEffort: managerSettings.reasoningEffort,
        // The synced settings profile on this same hub, read per turn.
        responseStyle: () => settingsProfileStore?.snapshot().values.oracleResponseStyle,
        // Unset until Dreamer starts, and while it is off.
        progressContext: () => dreamerService?.progressView(),
        // App settings → Models, read as each Oracle session starts.
        newSessionRuntimes: () => settingsProfileStore?.snapshot().values.newSessionRuntimes,
        structuredMemory: managerStructuredMemory,
        recordProactiveOutcomes: (input) => {
          if (!proactiveCoordinator) {
            throw Object.assign(
              new Error('Oracle proactive task storage is unavailable.'),
              { statusCode: 503 },
            )
          }
          return proactiveCoordinator.recordProactiveOutcomes(input)
        },
        // Unreadable tasks throw, so Oracle asks before closing anything.
        unfinishedTaskSessions: (messages) => {
          if (!oracleTaskStore) throw new Error('Oracle tasks are unavailable.')
          return unfinishedOracleTaskSessions(oracleTaskStore.snapshot().tasks, messages)
        },
      })
      // Before the session service starts, so its first discovery already
      // leaves the manager's own conversations out.
      if (managerAgent) agent.excludeFromDiscovery(managerAgent.hiddenSessionIds())
    }
    if (
      managerStoreReady &&
      managerStore &&
      manager &&
      managerAgent &&
      oracleTaskStore &&
      proactiveInbox
    ) {
      const dreamerManager = manager
      const dreamerAgent = managerAgent
      dreamerService = new DreamerService(
        path.join(dataDirectory, 'manager', 'dreamer'),
        {
          registry: () => managerStore!.registry(),
          structuredMemory: managerStructuredMemory,
          readSession: (computerId, sessionId) =>
            dreamerManager.readSession(computerId, sessionId),
          taskStore: oracleTaskStore,
          enqueueManagerTask: (input) => dreamerAgent.enqueueInternal(input),
          managerMessages: () => dreamerAgent.snapshot().messages,
          managerMessage: (id) => dreamerAgent.message(id),
          setProactiveEnabled: async (enabled) => {
            await proactiveCoordinator?.setEnabled(enabled)
          },
          progressSource: dreamerManager,
          sweepLifecycle: async (sessions, generations) => {
            await proactiveCoordinator?.sweep(sessions, generations).catch((error: unknown) => {
              app.log.warn({ err: error }, 'Dreamer lifecycle sweep failed')
            })
          },
        },
      )
      try {
        await dreamerService.initialize()
        proactiveCoordinator = new ManagerProactiveCoordinator({
          inbox: proactiveInbox,
          taskStore: oracleTaskStore,
          agent: dreamerAgent,
          computers: () => dreamerManager.listComputers(),
          registry: () => managerStore!.registry(),
          listSessions: () => dreamerManager.listSessions(),
        })
        await proactiveCoordinator.initialize()
        await proactiveCoordinator.setEnabled(
          dreamerService.snapshot().settings.enabled,
        )
        forwardToProactive = (event) => proactiveCoordinator?.handle(event)
        manager.on('event', forwardToProactive)
        forwardHubToDreamer = (event) => {
          dreamerService?.handleHubEvent(event)
          void dreamerService?.reconcileTasks().catch((error: unknown) => {
            app.log.warn({ err: error }, 'Dreamer task reconciliation failed')
          })
        }
        forwardManagerToDreamer = () => {
          void dreamerService?.reconcileTasks().catch((error: unknown) => {
            app.log.warn({ err: error }, 'Dreamer task reconciliation failed')
          })
        }
        manager.on('event', forwardHubToDreamer)
        dreamerAgent.on('event', forwardManagerToDreamer)
      } catch (error) {
        app.log.error({ err: error }, 'Dreamer could not initialize')
        await proactiveCoordinator?.stop().catch(() => undefined)
        proactiveCoordinator = undefined
        dreamerService = undefined
        dreamerUnavailable = 'Dreamer storage is unavailable on this hub.'
      }
    } else {
      dreamerUnavailable = 'Dreamer is unavailable because Oracle is not running on this hub.'
    }
    if (hubFlags?.scheduler) {
      if (!managerStoreReady) {
        managerStore = new ManagerStore(path.join(dataDirectory, 'manager'))
        await startupPhases.run('scheduler.provenance', () => managerStore!.initialize())
        managerStoreReady = true
      }
      const scheduleStore = new SchedulerStore(dataDirectory, {
        warn: (message) => app.log.warn(message),
      })
      scheduler = new SchedulerDispatcher(scheduleStore,
        options.scheduleLauncher ?? new SessionScheduleLauncher(manager, scheduleStore, managerStore!), {
        targetOnline: (computerId) => manager!.listComputers().some((computer) => computer.id === computerId && computer.online),
        warn: (message) => app.log.warn(message),
      })
    }
    if (notificationCenter && managerAgent) pushService.attachOracle(managerAgent)
    await registerHubRoutes(
      app,
      manager,
      knowledgeStore,
      pushService,
      sessionKnowledgeStore,
      sessionOrderStore,
      managerAgent,
      settingsProfileStore,
      presence,
      {
        identity,
        computers: manager,
        manager: managerAgent,
        managerEvents: managerAgent,
        localBackend: voiceService,
        ...(voiceSelection.enabled && voiceSelection.computerName
          ? { selectedComputerName: voiceSelection.computerName }
          : {}),
        unavailableReason: voiceCapability.available
          ? 'Oracle voice is unavailable.'
          : voiceCapability.reason,
      },
      notificationCenter,
      scheduler?.store,
    )
    if (!notificationCenter && managerAgent) pushService.attachOracle(managerAgent)
    app.get('/api/features', async (_request, reply) => {
      reply.header('cache-control', 'no-store')
      return { hubFlags }
    })
    await registerManagerRoutes(
      app,
      managerAgent,
      managerUnavailable,
      managerStructuredMemory,
      managerStoreReady ? managerStore : undefined,
    )
    await registerDreamerRoutes(
      app,
      dreamerService,
      dreamerUnavailable ?? 'Dreamer is unavailable on this hub.',
    )
    await registerPushRoutes(app, pushService)
    if (hostTelemetry) {
      const localTelemetry = hostTelemetry
      const computers = manager
      registerHostTelemetryRoutes(app, '/api/computers/:computerId/host', (id) =>
        computers.hostTelemetryTarget(id!, localTelemetry), hostTelemetryLifetime?.signal)
    }
    await registerNotificationRoutes(app, notificationCenter)
    if (scheduler) await registerSchedulerRoutes(app, scheduler,
      () => settingsProfileStore?.snapshot().values.schedulerAllowAllForOracle === true)
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
    // Hub-local: browsers reach only the hub, so it sees every browser-facing
    // refusal, including those a node returned through it.
    app.get('/api/diagnostics/refusals', async (_request, reply) => {
      reply.header('cache-control', 'no-store')
      return refusals.snapshot()
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
    if (hostTelemetry) {
      await startupPhases.run('hostTelemetry.start', async () => hostTelemetry.start())
    }
    if (hostAlerts) await startupPhases.run('hostAlerts.start', async () => hostAlerts.start())
    if (scheduler) await startupPhases.run('scheduler.start', () => scheduler!.start())
    cliCanary?.start()
    // The manager never keeps the hub from becoming ready.
    const starting = managerAgent
    if (starting) {
      await startupPhases.run('manager.start', () => starting.start()).catch((error: unknown) => {
        app.log.error({ err: error }, 'The manager agent could not start')
      })
    }
    if (dreamerService) {
      await dreamerService.start().catch((error: unknown) => {
        app.log.error({ err: error }, 'Dreamer could not start')
      })
    }
  })

  app.addHook('onClose', async () => {
    await hostAlerts?.stop()
    hostTelemetry?.stop()
    await scheduler?.stop()
    await cliCanary?.stop()
    if (forwardToJournal) manager?.off('event', forwardToJournal)
    if (forwardToProactive) manager?.off('event', forwardToProactive)
    if (forwardHubToDreamer) manager?.off('event', forwardHubToDreamer)
    if (forwardManagerToDreamer) managerAgent?.off('event', forwardManagerToDreamer)
    await voiceService?.stop()
    await proactiveCoordinator?.stop()
    await dreamerService?.stop()
    await managerAgent?.stop()
    manager?.stop()
    pushService?.stop()
    await notificationCenter?.flush()
    await (transcriptionService ?? localTranscription).stop()
    await service.stop()
  })

  return {
    app,
    service,
    identity,
    manager,
    pushService,
    notificationCenter,
    transcriptionService: transcriptionService ?? localTranscription,
    knowledgeStore,
    sessionKnowledgeStore,
    sessionOrderStore,
    settingsProfileStore,
    managerAgent,
    managerStructuredMemory,
    voiceConfig,
    voiceEngineFactory,
    voiceCapability,
    dreamerService,
    scheduler,
    proactiveCoordinator,
    hostTelemetry,
    hostAlerts,
  }
}
