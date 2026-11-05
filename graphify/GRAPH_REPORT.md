# Agentic Remote - Graphify code map

Snapshot: `ee19552a0d4a1e23ae9fe485f9725fd8830326ecf78008cb074b203cdf62709e`

Source checkout: `44e981d86384f793389c582781bcc3eafa6e424e`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 399 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 399 files · ~805,332 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6789 nodes · 18709 edges · 218 communities (178 shown, 24 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1014 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- AgentService
- api.ts
- App.tsx
- SessionDetail
- ClaudeAgentService
- agent-service.ts
- agent-service.test.ts
- claude-agent-service.ts
- contracts.ts
- terminal-session.ts
- ManagedSession
- agentic-remote-promotion-monitor
- oracle-voice-soak.ts
- .readAfterWrites
- oracle-voice-child.ts
- session-presentation.ts
- OracleVoiceCoordinator
- oracle-voice-integration.test.ts
- ManagerAgent
- oracle-voice-engine.ts
- manager-tools.ts
- PushNotificationService
- fake-voice.ts
- oracle-voice-worker.ts
- oracle-voice-coordinator.ts
- TmuxTerminalSessionController
- manager-structured-memory-validation.ts
- RemoteNodeClient
- oracle-voice.ts
- active-sessions.ts
- session-store.ts
- SessionService
- markdown-navigation.ts
- queued-dispatch.test.ts
- send-matrix.integration.test.ts
- workspace-fixtures.ts
- oracle-voice-benchmark.ts
- manager-agent.ts
- FakeVoiceEngine
- manager.ts
- agentic-remote
- session-knowledge-routes.test.ts
- node-routes.ts
- manager-context.ts
- OracleVoiceClient
- bundle
- hub-routes.ts
- ResidentVoiceWorker
- ProviderSessionService
- transcription-service.ts
- VoicePlayback
- session-latency-benchmark.ts
- OracleDreamer.tsx
- ManagerStore
- tmux-test-helpers.ts
- oracle-voice-session.ts
- DreamerStore
- pwa.ts
- shell.ts
- lib.rs
- DreamerService
- manager-structured-memory.ts
- VoiceCapture
- agentic-remote-promotion-setup
- app.ts
- dreamer-store.ts
- FakeSessionService
- ManagerAssistant.tsx
- agentic-remote-gate
- config.rs
- oracle-voice-config.ts
- manager-proactive-inbox.ts
- terminal-session.test.ts
- capture.ts
- dependencies
- devDependencies
- dreamer-service.ts
- SessionKnowledgeStore
- background-task-adapter.ts
- manager-structured-memory-search.ts
- oracle-voice-security.test.ts
- EngineVoiceBackendSession
- oracle-voice-segments.ts
- client.test.ts
- capture-workspace.ts
- dreamer-planner.ts
- shared/settings-profile.ts
- sessionKey
- SessionOrderStore
- session-patch-browser.ts
- oracle-voice-routes.ts
- VoiceCapabilities
- backgroundTasksFromEvents
- KnowledgeStore
- .replyUserInputInternal
- cli-canary.ts
- src/settings-profile.ts
- scripts
- node:fs/promises
- VoiceClientControl
- compilerOptions
- delegated-transcription-service.ts
- ManagerStructuredMemoryStore
- ManagerAssistant.test.tsx
- SettingsProfileClient
- directory-browser.ts
- normalizeKnowledgeRelativePath
- ManagerProactiveInbox
- oracle-voice-tickets.ts
- isTerminalComposerFooter
- oracle-voice-routes.test.ts
- full-gate.test.ts
- startup-phases.test.ts
- session-reply-durability.test.ts
- session-store-providers.test.ts
- PromptCards.tsx
- knowledge-tree.ts
- compilerOptions
- .observe
- session-knowledge-store.ts
- OnlineRecognizer
- compilerOptions
- HubEvent
- compilerOptions
- refusal-metrics.ts
- submission-error.ts
- settings-profile-store.ts
- workspace-browser.ts
- react
- dreamer-schedule.ts
- .toolHost
- ManagerMemory
- BoundedQueue
- client.ts
- ReaderWorkspace
- SessionStatus
- promotion-monitor.test.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- use-oracle-settings.ts
- scripts
- background-task-stop.test.ts
- manager-runtime.ts
- oracle-voice-assets.test.ts
- BackgroundTasksDialog.tsx
- fake-vad.ts
- desktop.json
- manager-proactive-inbox.test.ts
- session-knowledge-routes.ts
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- registerSessionKnowledgeRoutes
- Pcm16Resampler
- DeferredSession
- background-task-tracker.ts
- session-response-order.ts
- html-preview.ts
- .initialize
- settings-profile.test.ts
- dataset
- generate-pwa-icons.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- .transport
- promotion-setup-execution.test.ts
- SessionAdmissions
- vite.config.ts
- KnowledgePosition
- package.json
- OracleVoiceClientDependencies
- recovery-context.ts
- release-publication.test.ts
- OracleVoicePlayback
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- usePanelWidth
- MarkdownCodeBlock.tsx
- dreamer-app.test.ts
- promotion-setup.test.ts
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- @fastify/static
- ffprobe-static
- lucide-react
- mermaid
- react-dom
- react-markdown
- remark-parse
- web-push
- zod
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 307 edges
2. `App()` - 278 edges
3. `AgentService` - 277 edges
4. `SessionStore` - 189 edges
5. `ClaudeAgentService` - 125 edges
6. `ManagedSession` - 103 edges
7. `registerHubRoutes()` - 93 edges
8. `buildApp()` - 92 edges
9. `ComputerManager` - 88 edges
10. `ManagerAgent` - 83 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `FakeVoiceState` --references--> `ManagerMessage`  [EXTRACTED]
  e2e/fixtures/fake-voice.ts → shared/manager.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (218 total, 24 thin omitted)

### Community 0 - "App"
Cohesion: 0.03
Nodes (161): isManagerEvent(), terminalSendOptions(), clearConversation(), listKnowledgeEntries(), readKnowledgeFile(), recoverConversation(), reorderQueuedPrompts(), replyPermission() (+153 more)

### Community 1 - "AgentService"
Cohesion: 0.04
Nodes (10): agentMode(), AgentService, normalizedTitle(), restart(), removeCopilotSessionFiles(), RuntimeConfigurationError, suspendedRuntimeConflict(), preparePrompt() (+2 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (129): provider(), AddKnowledgeRootInput, PushSettings, SessionKnowledgeRootMutationInput, parseSubmissionReceipt(), submissionReceiptFromError(), activateSession(), addKnowledgeRoot() (+121 more)

### Community 3 - "App.tsx"
Cohesion: 0.02
Nodes (116): ActivityStatus, SettingsChange, SettingsProfileKey, SettingsProfileValues, addComputer(), removeComputer(), AccentTheme, accentThemes (+108 more)

### Community 4 - "SessionDetail"
Cohesion: 0.05
Nodes (36): fixture(), fixture(), connect(), createStore(), enqueue(), fixture(), recoveryFixture(), fixture() (+28 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (21): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services (+13 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.04
Nodes (81): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+73 more)

### Community 7 - "agent-service.test.ts"
Cohesion: 0.02
Nodes (82): CopilotClientLike, CopilotSessionLike, foregroundTurnOpen(), holdProbe(), fixtures, gate(), releases, sdkPermissionEvents() (+74 more)

### Community 8 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (66): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+58 more)

### Community 9 - "contracts.ts"
Cohesion: 0.04
Nodes (53): ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, directories, voiceControlQueues, voiceControlWaiters (+45 more)

### Community 10 - "terminal-session.ts"
Cohesion: 0.06
Nodes (77): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed() (+69 more)

### Community 11 - "ManagedSession"
Cohesion: 0.09
Nodes (17): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, normalizeNodeUrl() (+9 more)

### Community 12 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 13 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 14 - ".readAfterWrites"
Cohesion: 0.06
Nodes (10): commandShortcut(), isTerminalNotReadyRefusal(), isUncertainDelivery(), stripAnsi(), terminalAnswerRefused(), queueConflict(), isRetainedRefusal(), TerminalSessionController (+2 more)

### Community 15 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (47): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, createVoiceWorker(), defaultSpawnPiper(), errorMessage() (+39 more)

### Community 16 - "session-presentation.ts"
Cohesion: 0.05
Nodes (57): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+49 more)

### Community 17 - "OracleVoiceCoordinator"
Cohesion: 0.08
Nodes (10): errorMessage(), OracleVoiceCoordinator, PendingFinalTurn, resolvedAudioGate(), withTimeout(), VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase (+2 more)

### Community 18 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (33): ManagerSdkSession, apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+25 more)

### Community 19 - "ManagerAgent"
Cohesion: 0.09
Nodes (11): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, withTimeout() (+3 more)

### Community 20 - "oracle-voice-engine.ts"
Cohesion: 0.05
Nodes (22): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+14 more)

### Community 21 - "manager-tools.ts"
Cohesion: 0.06
Nodes (37): DreamerMemoryMetadataRecord, APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession() (+29 more)

### Community 22 - "PushNotificationService"
Cohesion: 0.07
Nodes (29): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+21 more)

### Community 23 - "fake-voice.ts"
Cohesion: 0.05
Nodes (11): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice() (+3 more)

### Community 24 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (24): benchmarkGroup(), VoiceTtsEngine, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent(), isEnabledConfig() (+16 more)

### Community 25 - "oracle-voice-coordinator.ts"
Cohesion: 0.05
Nodes (33): ManagerEventSource, ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError (+25 more)

### Community 26 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (17): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), parseTerminalUpdateNotice(), processAncestors(), processCommand() (+9 more)

### Community 27 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 28 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (12): headerSafe(), RemoteNodeClient, client(), servers, session, BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt (+4 more)

### Community 29 - "oracle-voice.ts"
Cohesion: 0.08
Nodes (45): sendNodeVoiceOutput(), outputBytes(), sendBrowserOutput(), VoiceBackendOutput, REDIRECT_STATUSES, RemoteVoiceClientEvents, capabilities, closeServers (+37 more)

### Community 30 - "active-sessions.ts"
Cohesion: 0.07
Nodes (50): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+42 more)

### Community 31 - "session-store.ts"
Cohesion: 0.04
Nodes (41): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores (+33 more)

### Community 32 - "SessionService"
Cohesion: 0.07
Nodes (8): BuildAppOptions, closeReason(), closeVoiceSocket(), nodeVoiceCapabilities(), registerNodeRoutes(), VoiceBackend, SessionService, StartupPhases

### Community 33 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (42): executeCommand(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage() (+34 more)

### Community 34 - "queued-dispatch.test.ts"
Cohesion: 0.06
Nodes (28): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), preflight(), QueuedDelivery, terminalRefused(), accept() (+20 more)

### Community 35 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (46): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+38 more)

### Community 36 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (40): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+32 more)

### Community 37 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (41): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 38 - "manager-agent.ts"
Cohesion: 0.06
Nodes (25): discover(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSessionConfig, Rung (+17 more)

### Community 39 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (23): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+15 more)

### Community 40 - "manager.ts"
Cohesion: 0.07
Nodes (33): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+25 more)

### Community 41 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 42 - "session-knowledge-routes.test.ts"
Cohesion: 0.06
Nodes (24): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+16 more)

### Community 43 - "node-routes.ts"
Cohesion: 0.06
Nodes (36): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), configureRuntimeSchema, createSessionSchema (+28 more)

### Community 44 - "manager-context.ts"
Cohesion: 0.09
Nodes (27): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+19 more)

### Community 45 - "OracleVoiceClient"
Cohesion: 0.14
Nodes (9): VoiceServerControl, captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError() (+1 more)

### Community 46 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 47 - "hub-routes.ts"
Cohesion: 0.06
Nodes (41): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+33 more)

### Community 48 - "ResidentVoiceWorker"
Cohesion: 0.12
Nodes (9): combinedTranscript(), matchesCancelled(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceGenerationIdentity, VoiceSynthesisRequest, ActiveSynthesisIdentity (+1 more)

### Community 50 - "transcription-service.ts"
Cohesion: 0.08
Nodes (24): registerTranscriptionRoutes(), transcriptionMultipartOptions, CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync (+16 more)

### Community 51 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 52 - "session-latency-benchmark.ts"
Cohesion: 0.10
Nodes (27): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+19 more)

### Community 53 - "OracleDreamer.tsx"
Cohesion: 0.10
Nodes (32): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, getDreamer() (+24 more)

### Community 54 - "ManagerStore"
Cohesion: 0.09
Nodes (8): openStore(), emptyState(), ManagerStore, open(), createManager(), StoredManager, createManager(), SecurityManager

### Community 55 - "tmux-test-helpers.ts"
Cohesion: 0.12
Nodes (32): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, deliveryFixture(), assertSameIdentity() (+24 more)

### Community 56 - "oracle-voice-session.ts"
Cohesion: 0.07
Nodes (24): ActiveBackendSession, exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), ObservedLocalVoiceBackend, RouteVoiceBackend, acquisitionCancelled() (+16 more)

### Community 57 - "DreamerStore"
Cohesion: 0.14
Nodes (9): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, isMissing(), toPersistedPlan() (+1 more)

### Community 58 - "pwa.ts"
Cohesion: 0.10
Nodes (36): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle() (+28 more)

### Community 59 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 60 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 61 - "DreamerService"
Cohesion: 0.14
Nodes (12): projectDreamerMemory(), parse(), planSchema, registerDreamerRoutes(), settingsSchema, apps, directories, setup() (+4 more)

### Community 62 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (32): initializeManagerStructuredMemory(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES (+24 more)

### Community 63 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 64 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 65 - "app.ts"
Cohesion: 0.09
Nodes (23): prefixes, session, trusted, untrusted, apps, directories, buildApp(), errorStatusCode() (+15 more)

### Community 66 - "dreamer-store.ts"
Cohesion: 0.08
Nodes (31): assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES, DREAMER_STAGING_PREFIX (+23 more)

### Community 67 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 68 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (29): editQueuedManagerMessage(), resetManager(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline(), sessionLinkTarget(), applyEvent(), canTakeFocus() (+21 more)

### Community 69 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 70 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 71 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (26): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+18 more)

### Community 72 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (36): assertExactKeys(), canonicalHash(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isDisposition(), isEventKind() (+28 more)

### Community 73 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (30): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse() (+22 more)

### Community 74 - "capture.ts"
Cohesion: 0.07
Nodes (17): BufferedFrame, defaultAudioContext(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode (+9 more)

### Community 75 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 76 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 77 - "dreamer-service.ts"
Cohesion: 0.09
Nodes (25): DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, projectDreamerRegistry(), projectRegistryEntry(), digest(), DreamerPlannerExecutionInput, DreamerServiceOptions (+17 more)

### Community 78 - "SessionKnowledgeStore"
Cohesion: 0.12
Nodes (11): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateWithPaths(), disk, fixture(), fixtures (+3 more)

### Community 79 - "background-task-adapter.ts"
Cohesion: 0.09
Nodes (32): attachmentModeValue(), BackgroundTaskEventOptions, booleanValue(), CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, executionModeValue() (+24 more)

### Community 80 - "manager-structured-memory-search.ts"
Cohesion: 0.11
Nodes (27): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+19 more)

### Community 81 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (20): FakeVoiceEngineCall, VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), connect(), Inbox (+12 more)

### Community 82 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 83 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 84 - "client.test.ts"
Cohesion: 0.09
Nodes (9): OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse() (+1 more)

### Community 85 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 86 - "dreamer-planner.ts"
Cohesion: 0.13
Nodes (27): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+19 more)

### Community 87 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (29): AccentSetting, appearanceSettings, applySettingsImport(), isRecord(), isSettingsProfileKey(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting (+21 more)

### Community 88 - "sessionKey"
Cohesion: 0.11
Nodes (23): askSession(), getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), askSideQuestion(), closeSideQuestion(), openSideQuestion() (+15 more)

### Community 89 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 90 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 91 - "oracle-voice-routes.ts"
Cohesion: 0.13
Nodes (26): limits(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode(), closeReason(), disconnectCause() (+18 more)

### Community 92 - "VoiceCapabilities"
Cohesion: 0.12
Nodes (14): VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability (+6 more)

### Community 93 - "backgroundTasksFromEvents"
Cohesion: 0.18
Nodes (28): addActivity(), backgroundHandoff(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventString(), eventTask(), lastForegroundCompletionAt() (+20 more)

### Community 94 - "KnowledgeStore"
Cohesion: 0.16
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 95 - ".replyUserInputInternal"
Cohesion: 0.16
Nodes (6): persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), formReplyExpired(), TerminalFormReplyError, PendingUserInput

### Community 96 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 97 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (22): AppearanceSetting, isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, statuslineItems, Appearance, appearanceFrom() (+14 more)

### Community 98 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 99 - "node:fs/promises"
Cohesion: 0.10
Nodes (19): question(), disk, fixture(), fixtures, prompt(), ready(), releases, session() (+11 more)

### Community 100 - "VoiceClientControl"
Cohesion: 0.21
Nodes (10): closeReason(), exactArrayBuffer(), rawDataBuffer(), remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient, RemoteVoiceClientOptions, RemoteVoiceDisconnectError (+2 more)

### Community 101 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 102 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (12): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload (+4 more)

### Community 103 - "ManagerStructuredMemoryStore"
Cohesion: 0.22
Nodes (6): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState, ManagerStructuredMemoryStatus

### Community 104 - "ManagerAssistant.test.tsx"
Cohesion: 0.08
Nodes (13): cancelManager(), removeQueuedManagerMessage(), resolveManagerConfirmation(), OracleButton(), OracleControl, OracleIndicator, conversationCapability, empty (+5 more)

### Community 105 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 106 - "directory-browser.ts"
Cohesion: 0.22
Nodes (14): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertSafeResolvedKnowledgePath(), ensureSessionKnowledgeBase(), homeDirectory() (+6 more)

### Community 107 - "normalizeKnowledgeRelativePath"
Cohesion: 0.17
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), pathRecordSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+10 more)

### Community 108 - "ManagerProactiveInbox"
Cohesion: 0.20
Nodes (6): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 109 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 110 - "isTerminalComposerFooter"
Cohesion: 0.13
Nodes (20): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+12 more)

### Community 111 - "oracle-voice-routes.test.ts"
Cohesion: 0.12
Nodes (10): FakeManager, openApps, openSockets, RouteManager, runtime(), testRoot(), testRoots, trusted (+2 more)

### Community 112 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 113 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 114 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 115 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+2 more)

### Community 116 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 117 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 118 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 119 - ".observe"
Cohesion: 0.18
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 120 - "session-knowledge-store.ts"
Cohesion: 0.11
Nodes (18): bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema, PersistedBinding (+10 more)

### Community 121 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 122 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 123 - "HubEvent"
Cohesion: 0.18
Nodes (10): WorkspaceFixture, ComputerManagerEvents, diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted (+2 more)

### Community 124 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 125 - "refusal-metrics.ts"
Cohesion: 0.16
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+7 more)

### Community 126 - "submission-error.ts"
Cohesion: 0.17
Nodes (10): directories, runtimes, start(), trusted, RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals (+2 more)

### Community 127 - "settings-profile-store.ts"
Cohesion: 0.20
Nodes (9): profileStore(), SettingsProfileState, SettingsProfileStore, directories, store(), isSettingsDeviceId(), SettingsProfileRecord, SettingsProfileSnapshot (+1 more)

### Community 128 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 129 - "react"
Cohesion: 0.14
Nodes (8): react, drawDiagram(), drawing, MermaidDiagram(), SessionActions(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 130 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 132 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 133 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 134 - "client.ts"
Cohesion: 0.14
Nodes (12): closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, PendingHello, RECONNECT_DELAYS_MS (+4 more)

### Community 135 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 136 - "SessionStatus"
Cohesion: 0.15
Nodes (15): Seen, PersistedCursor, Row, SdkRestartRecovery, SessionExecutionMode, SessionStatus, TerminalSendPolicyInput, TerminalSendRequestOptions (+7 more)

### Community 137 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 138 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 139 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 140 - "use-oracle-settings.ts"
Cohesion: 0.22
Nodes (13): getManager(), updateManagerSettings(), act(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus() (+5 more)

### Community 141 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 142 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 143 - "manager-runtime.ts"
Cohesion: 0.24
Nodes (11): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+3 more)

### Community 144 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 145 - "BackgroundTasksDialog.tsx"
Cohesion: 0.22
Nodes (11): BackgroundTask, DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel() (+3 more)

### Community 146 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 147 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 148 - "manager-proactive-inbox.test.ts"
Cohesion: 0.16
Nodes (9): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState() (+1 more)

### Community 149 - "session-knowledge-routes.ts"
Cohesion: 0.14
Nodes (9): knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema, SessionKnowledgeLifecycle, sessionParams (+1 more)

### Community 150 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 151 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 152 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 153 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 154 - "registerSessionKnowledgeRoutes"
Cohesion: 0.33
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 155 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 157 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 158 - "session-response-order.ts"
Cohesion: 0.29
Nodes (10): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+2 more)

### Community 159 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 160 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 161 - "settings-profile.test.ts"
Cohesion: 0.20
Nodes (6): applySettingsChanges(), sameSettingValue(), samePending(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 162 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 163 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 164 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 165 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 167 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 169 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 170 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 171 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 173 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 174 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 176 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 177 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 178 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 179 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 180 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 181 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 182 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 183 - "dreamer-app.test.ts"
Cohesion: 0.40
Nodes (3): directories, runtimes, trusted

### Community 184 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1126 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1121 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1900 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `queued-dispatch.test.ts`, `SessionDetail`, `ClaudeAgentService`, `agent-service.ts`, `claude-agent-service.ts`, `contracts.ts`, `directory-browser.ts`, `.readAfterWrites`, `.replyUserInputInternal`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `ClaudeAgentService`, `agent-service.ts`, `claude-agent-service.ts`, `.readAfterWrites`, `.replyUserInputInternal`, `session-store.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `TmuxTerminalSessionController` connect `TmuxTerminalSessionController` to `terminal-session.ts`, `active-sessions.ts`, `.readAfterWrites`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.027965624119470272 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.04025804344275682 - nodes in this community are weakly interconnected._
## Non-code inventory (not semantically extracted)

- `.github/copilot-instructions.md`
- `.github/dependabot.yml`
- `.github/skills/agentic-remote-navigation/SKILL.md`
- `.github/skills/frontend-design/LICENSE.txt`
- `.github/skills/frontend-design/SKILL.md`
- `.github/skills/frontend-design/SOURCE.md`
- `.github/skills/frontend-design/UI-SKILLS.md`
- `.github/skills/frontend-design/licenses/antfu-skills-MIT.txt`
- `.github/skills/frontend-design/licenses/better-ui-MIT.txt`
- `.github/skills/frontend-design/licenses/frontend-ui-engineering-MIT.txt`
- `.github/skills/frontend-design/licenses/improve-ui-MIT.txt`
- `.github/skills/frontend-design/licenses/interface-design-MIT.txt`
- `.github/skills/frontend-design/licenses/vercel-guidelines-MIT.txt`
- `.github/skills/frontend-design/references/accessibility-and-input.md`
- `.github/skills/frontend-design/references/agentic-remote.md`
- `.github/skills/frontend-design/references/evidence-and-review.md`
- `.github/skills/frontend-design/references/motion-and-performance.md`
- `.github/skills/frontend-design/references/product-workspaces.md`
- `.github/workflows/light-check.yml`
- `.gitignore`
- `.superpowers/sdd/2026-10-16-oracle-conversation-mode/task-10-report.md`
- `.superpowers/sdd/2026-10-16-oracle-conversation-mode/task-11-report.md`
- `.superpowers/sdd/2026-10-16-oracle-conversation-mode/task-12-report.md`
- `.superpowers/sdd/2026-10-16-oracle-conversation-mode/task-9-report.md`
- `LICENSE`
- `README.md`
- `SECURITY.md`
- `config/agentic-remote-promotion.env.example`
- `docs/activity-display.md`
- `docs/app-spec.md`
- `docs/architecture.md`
- `docs/background-tasks-empty.svg`
- `docs/background-tasks-failed.svg`
- `docs/background-tasks-running.svg`
- `docs/background-tasks.md`
- `docs/deployment-promotion.md`
- `docs/design/agent-workspace.md`
- `docs/design/oracle-conversation-mode.md`
- `docs/design/oracle-dreamer.md`
- `docs/design/oracle-durable-ux.md`
- `docs/design/oracle-proactive-inbox.md`
- `docs/design/session-manager.md`
- `docs/design/settings-profile.md`
- `docs/licenses/onnxruntime-1.24.2-third-party-notices.txt`
- `docs/licenses/oracle-voice-browser.txt`
- `docs/licenses/oracle-voice.md`
- `docs/mockups/activity-view.html`
- `docs/mockups/brand-logo.html`
- `docs/native-shell.md`
- `docs/oracle-conversation.md`
- `docs/provider-compatibility.md`
- `docs/sdk-architecture-roadmap.md`
- `docs/session-knowledge-api.md`
- `docs/session-retention.md`
- `docs/slash-command-feedback.md`
- `docs/superpowers/plans/2026-10-16-oracle-conversation-mode.md`
- `docs/superpowers/plans/2026-10-16-oracle-structured-memory.md`
- `docs/superpowers/plans/2026-10-20-copilot-sdk-cli-parity.md`
- `docs/superpowers/plans/2026-10-24-copilot-sdk-restart-recovery.md`
- `docs/superpowers/plans/2026-11-05-session-knowledge-api.md`
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-17-oracle-proactive-lifecycle-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
- `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`
- `docs/superpowers/specs/2026-11-05-session-knowledge-api-design.md`
- `fixtures/voice/README.md`
- `fixtures/voice/en-false-start.wav`
- `fixtures/voice/en-long-male-clean.wav`
- `fixtures/voice/en-short-background-speech.wav`
- `fixtures/voice/en-short-female-clean.wav`
- `fixtures/voice/en-short-female-noisy.wav`
- `fixtures/voice/pt-BR-long-male-clean.wav`
- `fixtures/voice/pt-BR-short-male-clean.wav`
- `fixtures/voice/pt-BR-short-male-noisy.wav`
- `fixtures/voice/silence-2s.wav`
- `index.html`
- `public/fonts/MonaSans.woff2`
- `public/fonts/OFL.txt`
- `public/icon.svg`
- `public/icons/icon-192.png`
- `public/icons/icon-512-maskable.png`
- `public/icons/icon-512.png`
- `public/icons/relay-icon-1024.png`
- `public/icons/relay-icon-192.png`
- `public/icons/relay-icon-512.png`
- `public/manifest.webmanifest`
- `shell/README.md`
- `shell/index.html`
- `shell/src/settings.css`
- `src/dreamer.css`
- `src/index.css`
- `config/oracle-voice-profiles.json`
