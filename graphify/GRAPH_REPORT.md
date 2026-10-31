# Agentic Remote - Graphify code map

Snapshot: `4783b6c47f62c2cbae0e0e623bfd559694b19932e795f36c61689e335880e2be`

Source checkout: `79f89f5e38a54266a71d42627eeb432a47f7a70b`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 397 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 397 files · ~789,734 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6660 nodes · 18405 edges · 221 communities (179 shown, 26 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1004 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- api.ts
- SessionDetail
- App.tsx
- contracts.ts
- SessionStore
- claude-agent-service.ts
- .sendAdmittedWithBackend
- ManagedSession
- agentic-remote-promotion-monitor
- oracle-voice-soak.ts
- oracle-voice-child.ts
- SessionService
- terminal-session.ts
- client.ts
- OracleVoiceCoordinator
- oracle-voice-integration.test.ts
- app.ts
- oracle-voice-session.ts
- transcription-service.ts
- manager-tools.ts
- PushNotificationService
- ManagerAgent
- active-sessions.ts
- manager-structured-memory-validation.ts
- session-presentation.ts
- oracle-voice-worker.ts
- RemoteNodeClient
- oracle-voice.ts
- background-task-adapter.ts
- FakeManager
- TerminalSessionController
- agent-service.ts
- session-store.ts
- workspace-fixtures.ts
- oracle-voice-benchmark.ts
- markdown-navigation.ts
- session-resource-clear.test.ts
- VoiceAudioFrame
- manager.ts
- oracle-voice-engine.ts
- TmuxTerminalSessionController
- agentic-remote
- oracle-voice-routes.test.ts
- session-knowledge-routes.test.ts
- bundle
- ProviderSessionService
- pwa.ts
- oracle-voice-coordinator.ts
- terminal-startup-queue.test.ts
- manager-agent.ts
- VoicePlayback
- real-voice.ts
- oracle-voice-routes.ts
- FakeVoiceEngine
- client.test.ts
- shell.ts
- lib.rs
- agentic-remote-promotion-setup
- DreamerStore
- agentic-remote-gate
- config.rs
- oracle-voice-security.test.ts
- knowledge-tree.ts
- dreamer-store.ts
- hub-routes.ts
- ManagerStructuredMemoryStore
- dependencies
- devDependencies
- manager-structured-memory.ts
- UserInputReplyInput
- ManagerStore
- FakeSessionService
- .sendInternal
- OracleDreamer.tsx
- dreamer-planner.ts
- manager-store.ts
- SessionKnowledgeStore
- oracle-voice-child.test.ts
- oracle-voice-segments.ts
- capture-workspace.ts
- DreamerService
- SessionOrderStore
- settings-profile-store.ts
- ManagerClientDefaults
- shared/settings-profile.ts
- HubEvent
- session-reply-durability.test.ts
- send-matrix.integration.test.ts
- terminal-session.test.ts
- session-patch-browser.ts
- cli-canary.ts
- scripts
- directory-browser.ts
- dreamer-service.ts
- manager-structured-memory-search.ts
- ManagerAssistant
- VoiceCapture
- recordValue
- compilerOptions
- KnowledgeStore
- agent-service.test.ts
- .toolHost
- src/settings-profile.ts
- SettingsProfileClient
- recovery-resend-durability.test.ts
- .startAdmitted
- oracle-voice-config.ts
- .withFormViewport
- normalizeKnowledgeRelativePath
- manager-context.ts
- oracle-voice-tickets.ts
- session-clear-transcript.test.ts
- session-store-providers.test.ts
- full-gate.test.ts
- startup-phases.test.ts
- session-knowledge-store.ts
- capture.ts
- compilerOptions
- OnlineRecognizer
- ManagerAssistant.tsx
- compilerOptions
- compilerOptions
- .recoverSdkSession
- event-log.ts
- ManagerMemory
- workspace-browser.ts
- SettingsProfileSnapshot
- dreamer-schedule.ts
- use-oracle-settings.ts
- use-session-knowledge-root.ts
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- server/side-question.ts
- NewSessionDialog
- ManagerAssistant.test.tsx
- terminal-form-deadline.test.ts
- react
- promotion-monitor.test.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- scripts
- background-task-stop.test.ts
- registerSessionKnowledgeRoutes
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- PromptCards.tsx
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- background-task-tracker.ts
- Pcm16Resampler
- DeferredSession
- copilot-sdk-client.ts
- session-enqueue-clear.test.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- session-knowledge-routes.ts
- dataset
- generate-pwa-icons.ts
- dreamer-routes.ts
- bridge.rs
- VoiceCaptureOptions
- promotion-setup-execution.test.ts
- FakeRecorder
- capture.test.ts
- VoiceVadOptions
- vite.config.ts
- KnowledgePosition
- package.json
- recovery-context.ts
- release-publication.test.ts
- UserInputFieldControl
- render-workspace-gifs.ts
- dreamer-service.test.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- api-origin.test.ts
- promotion-setup.test.ts
- hasActiveBackgroundTasks
- FakeRecorder
- terminal-send-uncertainty.test.ts
- .readBackgroundTasks
- version-policy.test.ts
- OracleControl
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
2. `App()` - 277 edges
3. `AgentService` - 276 edges
4. `SessionStore` - 189 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 102 edges
7. `registerHubRoutes()` - 93 edges
8. `buildApp()` - 92 edges
9. `ComputerManager` - 87 edges
10. `ManagerAgent` - 83 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `FakeVoiceState` --references--> `ManagerMessage`  [EXTRACTED]
  e2e/fixtures/fake-voice.ts → shared/manager.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (221 total, 26 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (8): agentMode(), AgentService, isTerminalNotReadyRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, suspendedRuntimeConflict(), isRetainedRefusal(), TranscriptObservation

### Community 1 - "App"
Cohesion: 0.03
Nodes (158): isManagerEvent(), alertNotification(), terminalSendOptions(), askSession(), saveSessionOrderLane(), saveSessionVisibility(), uploadSessionFile(), activeComposerPastes() (+150 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (128): SettingsChange, SettingsProfileKey, SettingsProfileValues, SettingsUpdateResult, parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder() (+120 more)

### Community 3 - "SessionDetail"
Cohesion: 0.04
Nodes (13): ClaudeAgentService, isMissingClaudeSessionError(), ownsDispatchRecovery(), QueuedDispatches, observe(), assertSessionNotRetained(), clearRecoverySeedFailure(), grantTerminalRecovery() (+5 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (107): addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+99 more)

### Community 5 - "contracts.ts"
Cohesion: 0.03
Nodes (64): ClaudeAgentServiceEvents, directories, voiceControlQueues, voiceControlWaiters, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, ProviderSessionServiceEvents, provider() (+56 more)

### Community 6 - "SessionStore"
Cohesion: 0.05
Nodes (50): fixture(), restart(), directories, fakeClient(), fixture(), ForkRequest, forkSession(), services (+42 more)

### Community 7 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (70): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+62 more)

### Community 8 - ".sendAdmittedWithBackend"
Cohesion: 0.05
Nodes (26): CopilotSessionLike, terminalAnswerRefused(), CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), preflight() (+18 more)

### Community 9 - "ManagedSession"
Cohesion: 0.09
Nodes (16): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, TurnContextInput (+8 more)

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 11 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 12 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (36): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+28 more)

### Community 13 - "SessionService"
Cohesion: 0.04
Nodes (33): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), closeReason(), closeVoiceSocket() (+25 more)

### Community 14 - "terminal-session.ts"
Cohesion: 0.05
Nodes (70): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerHoldsOtherText() (+62 more)

### Community 15 - "client.ts"
Cohesion: 0.08
Nodes (22): VoiceServerControl, captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord(), isTicket() (+14 more)

### Community 16 - "OracleVoiceCoordinator"
Cohesion: 0.08
Nodes (8): ManagerEventSource, errorMessage(), OracleVoiceCoordinator, PendingFinalTurn, withTimeout(), VoiceTurnState, ManagerEvent, VoiceClientControl

### Community 17 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+24 more)

### Community 18 - "app.ts"
Cohesion: 0.05
Nodes (44): buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), directories (+36 more)

### Community 19 - "oracle-voice-session.ts"
Cohesion: 0.07
Nodes (28): apps, directories, playbackSequence(), acquisitionCancelled(), ActiveUtterance, asSessionError(), AudioReservation, capabilityFromConfig() (+20 more)

### Community 20 - "transcription-service.ts"
Cohesion: 0.06
Nodes (37): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, headerSafe() (+29 more)

### Community 21 - "manager-tools.ts"
Cohesion: 0.06
Nodes (34): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), steer() (+26 more)

### Community 22 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 23 - "ManagerAgent"
Cohesion: 0.09
Nodes (11): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, withTimeout() (+3 more)

### Community 24 - "active-sessions.ts"
Cohesion: 0.06
Nodes (52): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+44 more)

### Community 25 - "manager-structured-memory-validation.ts"
Cohesion: 0.05
Nodes (59): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+51 more)

### Community 26 - "session-presentation.ts"
Cohesion: 0.06
Nodes (51): KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, computers, first, grouped, hidden (+43 more)

### Community 27 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (27): benchmarkGroup(), VoiceEndUtterance, VoiceGenerationIdentity, VoiceStartUtterance, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine (+19 more)

### Community 28 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (15): RemoteResync, RemoteSessionRead, RemoteNodeClient, client(), servers, session, BackgroundTaskSnapshot, NodeInfo (+7 more)

### Community 29 - "oracle-voice.ts"
Cohesion: 0.07
Nodes (45): buildConfig(), isRecord(), readPiperSampleRate(), VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities (+37 more)

### Community 30 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (55): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), CopilotClientTaskInfo (+47 more)

### Community 31 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 32 - "TerminalSessionController"
Cohesion: 0.04
Nodes (22): CopilotClientLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), fixtures (+14 more)

### Community 33 - "agent-service.ts"
Cohesion: 0.04
Nodes (50): AcceptedSdkReply, ActivePrompt, activityDuration(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+42 more)

### Community 34 - "session-store.ts"
Cohesion: 0.05
Nodes (40): deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, idleDaysSchema, mergeSessionRetention() (+32 more)

### Community 35 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (40): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+32 more)

### Community 36 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 37 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (40): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+32 more)

### Community 38 - "session-resource-clear.test.ts"
Cohesion: 0.05
Nodes (38): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), copilotSession() (+30 more)

### Community 39 - "VoiceAudioFrame"
Cohesion: 0.09
Nodes (23): OracleVoiceBackendConnection, SocketMessage, VoiceBackendDisconnectCause, VoiceBackendOutput, RemoteNodeRedirectError, RemoteNodeRequestError, closeReason(), exactArrayBuffer() (+15 more)

### Community 40 - "manager.ts"
Cohesion: 0.07
Nodes (27): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+19 more)

### Community 41 - "oracle-voice-engine.ts"
Cohesion: 0.06
Nodes (20): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, voiceBackend(), EnabledOracleVoiceConfig (+12 more)

### Community 42 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (11): copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), tmuxSessionExists() (+3 more)

### Community 43 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 44 - "oracle-voice-routes.test.ts"
Cohesion: 0.06
Nodes (22): ActiveBackendSession, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, exactArrayBuffer(), rawDataBuffer(), rawDataByteLength() (+14 more)

### Community 45 - "session-knowledge-routes.test.ts"
Cohesion: 0.06
Nodes (24): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+16 more)

### Community 46 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 48 - "pwa.ts"
Cohesion: 0.09
Nodes (40): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+32 more)

### Community 49 - "oracle-voice-coordinator.ts"
Cohesion: 0.07
Nodes (25): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnector (+17 more)

### Community 50 - "terminal-startup-queue.test.ts"
Cohesion: 0.11
Nodes (36): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, deliveryFixture(), client() (+28 more)

### Community 51 - "manager-agent.ts"
Cohesion: 0.07
Nodes (21): discover(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig (+13 more)

### Community 52 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 53 - "real-voice.ts"
Cohesion: 0.07
Nodes (15): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+7 more)

### Community 54 - "oracle-voice-routes.ts"
Cohesion: 0.10
Nodes (33): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+25 more)

### Community 55 - "FakeVoiceEngine"
Cohesion: 0.08
Nodes (15): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+7 more)

### Community 56 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 57 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 58 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 59 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 60 - "DreamerStore"
Cohesion: 0.15
Nodes (8): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, isMissing(), publicPlan()

### Community 61 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 62 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 63 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (21): FakeVoiceEngineCall, apps, BlockingEngine, config, configFixture(), connect(), createManager(), Inbox (+13 more)

### Community 64 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 65 - "dreamer-store.ts"
Cohesion: 0.09
Nodes (30): assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES, DREAMER_STAGING_PREFIX (+22 more)

### Community 66 - "hub-routes.ts"
Cohesion: 0.07
Nodes (35): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+27 more)

### Community 67 - "ManagerStructuredMemoryStore"
Cohesion: 0.14
Nodes (9): capturePrompt(), digest(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMutationResult (+1 more)

### Community 68 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 69 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 70 - "manager-structured-memory.ts"
Cohesion: 0.09
Nodes (27): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_RECORDS (+19 more)

### Community 71 - "UserInputReplyInput"
Cohesion: 0.13
Nodes (7): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, PendingUserInput, UserInputReplyInput, deliveryUncertaintyFromError()

### Community 72 - "ManagerStore"
Cohesion: 0.11
Nodes (5): openStore(), ManagerStore, open(), createManager(), StoredManager

### Community 73 - "FakeSessionService"
Cohesion: 0.09
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 74 - ".sendInternal"
Cohesion: 0.16
Nodes (24): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), hasComposerAfter() (+16 more)

### Community 75 - "OracleDreamer.tsx"
Cohesion: 0.12
Nodes (25): DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, getDreamer(), request(), saveDreamerSettings(), snapshot, updateDreamerPlan() (+17 more)

### Community 76 - "dreamer-planner.ts"
Cohesion: 0.11
Nodes (29): activeDreamerMemoryIds(), activeMemoryRecord(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), digest(), DREAMER_DEFAULT_STALE_AFTER_MS (+21 more)

### Community 77 - "manager-store.ts"
Cohesion: 0.11
Nodes (20): JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), emptyState(), JournalDraft, JournalEntry, JournalKind (+12 more)

### Community 78 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 79 - "oracle-voice-child.test.ts"
Cohesion: 0.09
Nodes (12): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+4 more)

### Community 80 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 81 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 82 - "DreamerService"
Cohesion: 0.20
Nodes (5): DreamerMemoryMetadata, setup(), DreamerService, publicSnapshot(), DreamerSnapshot

### Community 83 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 84 - "settings-profile-store.ts"
Cohesion: 0.13
Nodes (19): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+11 more)

### Community 85 - "ManagerClientDefaults"
Cohesion: 0.12
Nodes (14): ManagerClientDefaults, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability (+6 more)

### Community 86 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (27): AccentSetting, appearanceSettings, applySettingsChanges(), isRecord(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting, NewSessionRuntimesSetting (+19 more)

### Community 87 - "HubEvent"
Cohesion: 0.12
Nodes (15): Connection, WorkspaceFixture, ComputerManagerEvents, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset (+7 more)

### Community 88 - "session-reply-durability.test.ts"
Cohesion: 0.12
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 89 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (24): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+16 more)

### Community 90 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (21): isTerminalVisiblyIdle(), parseTerminalUpdateNotice(), bracketedTabPane, clearFixture(), desktopInstallPane, directories, downloadedUpdateFooter, execFileAsync (+13 more)

### Community 91 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 92 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 93 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 94 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 95 - "dreamer-service.ts"
Cohesion: 0.12
Nodes (23): DREAMER_MAX_ITEMS, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), digest(), DreamerPlannerExecutionInput, DreamerServiceOptions, planWithFingerprints() (+15 more)

### Community 96 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 97 - "ManagerAssistant"
Cohesion: 0.11
Nodes (22): editQueuedManagerMessage(), resolveManagerConfirmation(), sendManagerMessage(), phoneEnterCreatesNewline(), applyEvent(), conversationStateLabel(), ManagerAssistant(), act() (+14 more)

### Community 98 - "VoiceCapture"
Cohesion: 0.21
Nodes (3): captureFailure(), harness(), VoiceCapture

### Community 99 - "recordValue"
Cohesion: 0.19
Nodes (22): activityGroupIdFor(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), hasUnresolvedPermissionEvent() (+14 more)

### Community 100 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 101 - "KnowledgeStore"
Cohesion: 0.18
Nodes (7): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 102 - "agent-service.test.ts"
Cohesion: 0.12
Nodes (15): terminalFormSteps(), busyTerminal(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService(), services (+7 more)

### Community 103 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 104 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (19): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+11 more)

### Community 105 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 106 - "recovery-resend-durability.test.ts"
Cohesion: 0.10
Nodes (16): benchmarkState(), now(), openFixture(), searchSamples(), directories, disk, gate(), gates (+8 more)

### Community 108 - "oracle-voice-config.ts"
Cohesion: 0.15
Nodes (19): boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), nonNegativeInteger(), optionalValue(), OracleVoiceConfig (+11 more)

### Community 109 - ".withFormViewport"
Cohesion: 0.15
Nodes (18): captureBeforeDeadline(), FormReplyDeadlineError, hasClippedTerminalFormFooter(), hasClippedTerminalFormTabs(), hasTerminalFormQuestionReflowCandidate(), isTerminalLoading(), parseTerminalFormActiveField(), submitTerminalForm() (+10 more)

### Community 110 - "normalizeKnowledgeRelativePath"
Cohesion: 0.17
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), pathRecordSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+10 more)

### Community 111 - "manager-context.ts"
Cohesion: 0.17
Nodes (18): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+10 more)

### Community 112 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 113 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 114 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+3 more)

### Community 115 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 116 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 117 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema, PersistedBinding (+11 more)

### Community 118 - "capture.ts"
Cohesion: 0.13
Nodes (15): BufferedFrame, defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, validateIdentity(), VoiceCaptureError, VoiceCaptureErrorCode (+7 more)

### Community 119 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 120 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 121 - "ManagerAssistant.tsx"
Cohesion: 0.14
Nodes (15): ManagerSessionRef, removeQueuedManagerMessage(), sessionLinkTarget(), boundWidth(), canTakeFocus(), ORACLE_CONVERSATION_WIDTH_MIN, ORACLE_PANEL_WIDTH_MIN, readWidth() (+7 more)

### Community 122 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 123 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 124 - ".recoverSdkSession"
Cohesion: 0.22
Nodes (4): foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents()

### Community 125 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 126 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 127 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 128 - "SettingsProfileSnapshot"
Cohesion: 0.17
Nodes (6): SettingsProfileSnapshot, settingsProfileCacheKey, SettingsProfileTransport, cached(), FakeHub, MemoryStorage

### Community 129 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 130 - "use-oracle-settings.ts"
Cohesion: 0.19
Nodes (12): getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps, models (+4 more)

### Community 131 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 132 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 133 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 134 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 135 - "server/side-question.ts"
Cohesion: 0.22
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 136 - "NewSessionDialog"
Cohesion: 0.18
Nodes (17): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+9 more)

### Community 137 - "ManagerAssistant.test.tsx"
Cohesion: 0.12
Nodes (12): cancelManager(), resetManager(), retryManagerMessage(), startOver(), OracleButton(), OracleIndicator, conversationCapability, empty (+4 more)

### Community 138 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 139 - "react"
Cohesion: 0.18
Nodes (8): react, transcribeAudio(), MarkdownCodeBlock(), copy(), originalClipboard, SessionActions(), recordingDuration(), useVoiceRecorder()

### Community 140 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 141 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 142 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 143 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 144 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 145 - "registerSessionKnowledgeRoutes"
Cohesion: 0.27
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 146 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 147 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 148 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 149 - "PromptCards.tsx"
Cohesion: 0.19
Nodes (12): PendingPermission, UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question (+4 more)

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

### Community 154 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (7): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 155 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 157 - "copilot-sdk-client.ts"
Cohesion: 0.29
Nodes (9): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkMissingSessionRetirement, CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic() (+1 more)

### Community 158 - "session-enqueue-clear.test.ts"
Cohesion: 0.26
Nodes (10): disk, EnqueueCase, fixture(), fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet() (+2 more)

### Community 159 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 160 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 161 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 162 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 163 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 164 - "dreamer-routes.ts"
Cohesion: 0.27
Nodes (7): parse(), planSchema, registerDreamerRoutes(), settingsSchema, apps, directories, DreamerUnavailableError

### Community 165 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 167 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 168 - "FakeRecorder"
Cohesion: 0.22
Nodes (4): drawDiagram(), drawing, MermaidDiagram(), FakeRecorder

### Community 169 - "capture.test.ts"
Cohesion: 0.22
Nodes (3): CaptureControl, VoiceCaptureDependencies, VoiceVad

### Community 171 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 172 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 173 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 174 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 175 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 176 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 177 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 179 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 180 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 181 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 182 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 183 - "api-origin.test.ts"
Cohesion: 0.40
Nodes (4): prefixes, session, trusted, untrusted

### Community 184 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1098 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1093 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1859 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `TerminalSessionController`, `session-store.ts`, `SessionDetail`, `recordValue`, `contracts.ts`, `SessionStore`, `server/side-question.ts`, `.sendAdmittedWithBackend`, `UserInputReplyInput`, `claude-agent-service.ts`, `.startAdmitted`, `.readBackgroundTasks`, `.recoverSdkSession`, `directory-browser.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `session-store.ts`, `SessionDetail`, `UserInputReplyInput`, `.sendAdmittedWithBackend`, `claude-agent-service.ts`, `.startAdmitted`, `.recoverSdkSession`, `session-enqueue-clear.test.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `contracts.ts`, `UserInputReplyInput`, `claude-agent-service.ts`, `VoiceAudioFrame`, `transcription-service.ts`, `directory-browser.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1098 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.04441350504698921 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.029726261762189905 - nodes in this community are weakly interconnected._
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
- `docs/session-retention.md`
- `docs/slash-command-feedback.md`
- `docs/superpowers/plans/2026-10-16-oracle-conversation-mode.md`
- `docs/superpowers/plans/2026-10-16-oracle-structured-memory.md`
- `docs/superpowers/plans/2026-10-20-copilot-sdk-cli-parity.md`
- `docs/superpowers/plans/2026-10-24-copilot-sdk-restart-recovery.md`
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
- `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`
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
