# Agentic Remote - Graphify code map

Snapshot: `67b7cfaeafb3fbade1510d235293f5d74adf2d4e2c0604f36977f1a4f212025b`

Source checkout: `1fffb22379c5300cd055b216d3c9d8c129387e68`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 377 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 377 files · ~735,319 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6311 nodes · 17328 edges · 211 communities (169 shown, 26 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 958 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionStore
- App
- AgentService
- agent-service.ts
- api.ts
- App.tsx
- .get
- claude-agent-service.ts
- ClaudeAgentService
- agentic-remote-promotion-monitor
- oracle-voice-soak.ts
- contracts.ts
- CopilotSessionLike
- terminal-session.ts
- ManagerAgent
- session-store-providers.test.ts
- OracleVoiceCoordinator
- oracle-voice-integration.test.ts
- PushNotificationService
- fake-voice.ts
- oracle-voice-worker.ts
- manager-agent.ts
- VoiceClientControl
- ManagerAssistant.tsx
- CopilotClientLike
- manager-tools.ts
- hub-routes.ts
- manager-structured-memory-validation.ts
- session-presentation.ts
- session-knowledge-store.ts
- tmux-test-helpers.ts
- ManagedSession
- send-matrix.integration.test.ts
- oracle-voice-coordinator.ts
- workspace-fixtures.ts
- oracle-voice-benchmark.ts
- manager-context.ts
- SessionService
- oracle-voice.ts
- oracle-voice-session.ts
- RemoteNodeClient
- FakeVoiceEngine
- TmuxTerminalSessionController
- client.ts
- markdown-navigation.ts
- agentic-remote
- oracle-voice-child.ts
- OracleVoiceClient
- session-knowledge-routes.test.ts
- bundle
- oracle-voice-engine.ts
- pwa.ts
- .sendInternal
- SessionDetail
- FakeSessionService
- ProviderSessionService
- VoicePlayback
- shell.ts
- lib.rs
- node-routes.ts
- ResidentVoiceWorker
- agentic-remote-promotion-setup
- ManagerStore
- agentic-remote-gate
- config.rs
- oracle-voice-routes.ts
- dependencies
- devDependencies
- active-sessions.ts
- oracle-voice-child.test.ts
- oracle-voice-security.test.ts
- background-task-adapter.ts
- session-patch-routes.test.ts
- knowledge-tree.ts
- app.ts
- real-voice.ts
- remote-voice-client.ts
- AgentProvider
- delegated-transcription-service.ts
- manager-structured-memory.ts
- SessionOrderStore
- HubEvent
- backgroundTasksFromEvents
- startup-phases.test.ts
- ManagerStructuredMemoryStore
- session-patch-browser.ts
- cli-canary.ts
- manager-structured-memory-search.ts
- oracle-voice-segments.ts
- terminal-session.test.ts
- src/settings-profile.ts
- scripts
- SettingsProfileClient
- manager-routes.ts
- session-knowledge-routes.ts
- transcription-service.ts
- compilerOptions
- oracle-voice-routes.test.ts
- directory-browser.ts
- client.test.ts
- LocalVoiceBackend
- settings-profile-store.ts
- PromptCards.tsx
- SessionResources.tsx
- capture-workspace.ts
- .toolHost
- oracle-voice-tickets.ts
- SettingsProfileStore
- full-gate.test.ts
- workspace-browser.ts
- shared/settings-profile.ts
- compilerOptions
- refusal-metrics.ts
- session-reply-durability.test.ts
- OnlineRecognizer
- compilerOptions
- compilerOptions
- ComputerSummary
- .correct
- submission-error.ts
- VoiceBackendSession
- ManagerMemory
- BoundedQueue
- session-latency-benchmark.ts
- .withFormViewport
- use-oracle-settings.ts
- ReaderWorkspace
- terminal-form-deadline.test.ts
- promotion-monitor.test.ts
- server/session-patches.ts
- NewSessionDialog
- capture
- scripts
- background-task-stop.test.ts
- oracle-voice-assets.test.ts
- OracleVoiceClientDependencies
- BackgroundTasksDialog.tsx
- fake-vad.ts
- desktop.json
- manager-runtime.ts
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- TranscriptionError
- Pcm16Resampler
- DeferredSession
- background-task-tracker.ts
- session-response-order.ts
- html-preview.ts
- dataset
- generate-pwa-icons.ts
- file-upload-routes.ts
- session-resource-transport.ts
- bridge.rs
- vite.config.ts
- screenshot-stability.test.ts
- KnowledgePosition
- promotion-setup-execution.test.ts
- SessionAdmissions
- tmux-errors.test.ts
- package.json
- recovery-context.ts
- release-publication.test.ts
- UserInputFieldControl
- vad-assets.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- OracleVoicePlayback
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- FakeRecorder
- MemoryStorage
- FakeRecorder
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- MermaidDiagram.tsx
- SessionActions.tsx
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
1. `SessionDetail` - 299 edges
2. `App()` - 269 edges
3. `AgentService` - 264 edges
4. `SessionStore` - 178 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 99 edges
7. `registerHubRoutes()` - 92 edges
8. `buildApp()` - 90 edges
9. `ComputerManager` - 87 edges
10. `ManagerAgent` - 82 edges

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

## Communities (211 total, 26 thin omitted)

### Community 0 - "SessionStore"
Cohesion: 0.03
Nodes (72): fixture(), holdProbe(), fixtures, gate(), releases, restart(), fixture(), connect() (+64 more)

### Community 1 - "App"
Cohesion: 0.03
Nodes (152): isManagerEvent(), alertNotification(), terminalSendOptions(), submissionReceiptFromError(), deleteKnowledgeRoot(), moveSessionToTmux(), replyPermission(), replyUserInput() (+144 more)

### Community 2 - "AgentService"
Cohesion: 0.04
Nodes (6): agentMode(), AgentService, removeCopilotSessionFiles(), RuntimeConfigurationError, fixture(), httpBoundary()

### Community 3 - "agent-service.ts"
Cohesion: 0.03
Nodes (97): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+89 more)

### Community 4 - "api.ts"
Cohesion: 0.03
Nodes (100): SettingsChange, SettingsProfileKey, SettingsProfileValues, SettingsUpdateResult, parseSubmissionReceipt(), addKnowledgeRoot(), askSession(), bootstrapSessionOrder() (+92 more)

### Community 5 - "App.tsx"
Cohesion: 0.03
Nodes (102): addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+94 more)

### Community 6 - ".get"
Cohesion: 0.05
Nodes (6): terminalAnswerRefused(), isMissingClaudeSessionError(), queueConflict(), isRetainedRefusal(), TerminalSendOptions, TerminalSessionController

### Community 7 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (62): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission (+54 more)

### Community 8 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (25): ClaudeAgentService, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), toolResultText() (+17 more)

### Community 9 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 10 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 11 - "contracts.ts"
Cohesion: 0.05
Nodes (48): RemoteResync, RemoteSessionRead, directories, voiceControlQueues, voiceControlWaiters, ProviderSessionServiceEvents, provider(), DEFINITE_DISPATCH_REFUSALS (+40 more)

### Community 12 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (32): CopilotSessionLike, CopilotTasksApi, isClaudeAuthenticationError(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery() (+24 more)

### Community 13 - "terminal-session.ts"
Cohesion: 0.05
Nodes (69): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus(), composerHoldsOtherText(), composerHoldsText() (+61 more)

### Community 14 - "ManagerAgent"
Cohesion: 0.09
Nodes (14): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), capturePrompt(), start() (+6 more)

### Community 15 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (48): ClaudeSdk, deferred(), disk, fixtures, holdClaimWrite(), releases, deferred(), disk (+40 more)

### Community 16 - "OracleVoiceCoordinator"
Cohesion: 0.08
Nodes (8): ManagerEventSource, ManagerEventSource, errorMessage(), OracleVoiceCoordinator, OracleVoiceCoordinatorOptions, withTimeout(), VoiceTurnState, ManagerEvent

### Community 17 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+24 more)

### Community 18 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 19 - "fake-voice.ts"
Cohesion: 0.05
Nodes (11): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice() (+3 more)

### Community 20 - "oracle-voice-worker.ts"
Cohesion: 0.07
Nodes (25): benchmarkGroup(), VoiceSttEngine, VoiceTtsEngine, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent() (+17 more)

### Community 21 - "manager-agent.ts"
Cohesion: 0.05
Nodes (35): discover(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig (+27 more)

### Community 22 - "VoiceClientControl"
Cohesion: 0.07
Nodes (17): VoiceClientControl, BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), CaptureControl, harness() (+9 more)

### Community 23 - "ManagerAssistant.tsx"
Cohesion: 0.06
Nodes (47): react, ManagerSessionRef, cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage() (+39 more)

### Community 24 - "CopilotClientLike"
Cohesion: 0.03
Nodes (39): CopilotClientLike, directories, fakeClient(), ForkRequest, forkSession(), services, fixtures, recoverAndSeed() (+31 more)

### Community 25 - "manager-tools.ts"
Cohesion: 0.06
Nodes (32): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), structuredTools() (+24 more)

### Community 26 - "hub-routes.ts"
Cohesion: 0.05
Nodes (54): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+46 more)

### Community 27 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 28 - "session-presentation.ts"
Cohesion: 0.07
Nodes (47): KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, computers, first, grouped, hidden (+39 more)

### Community 29 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+22 more)

### Community 30 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (43): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+35 more)

### Community 31 - "ManagedSession"
Cohesion: 0.15
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 32 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (46): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+38 more)

### Community 33 - "oracle-voice-coordinator.ts"
Cohesion: 0.05
Nodes (32): AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnection, OracleVoiceBackendConnector (+24 more)

### Community 34 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (40): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+32 more)

### Community 35 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest (+32 more)

### Community 36 - "manager-context.ts"
Cohesion: 0.08
Nodes (35): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+27 more)

### Community 37 - "SessionService"
Cohesion: 0.07
Nodes (6): nodeVoiceCapabilities(), registerNodeRoutes(), VoiceBackend, SessionService, WorkspaceListing, KnowledgeFolderState

### Community 38 - "oracle-voice.ts"
Cohesion: 0.08
Nodes (38): capabilities, closeServers, exactArrayBuffer(), sockets, startFields, VoiceNode, decodeVoiceAudioFrame(), encodeVoiceAudioFrame() (+30 more)

### Community 39 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (17): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), outputBytes() (+9 more)

### Community 40 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (8): RemoteNodeClient, client(), servers, session, NodeInfo, RemovedQueuedPrompt, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 41 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (22): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+14 more)

### Community 42 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (13): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+5 more)

### Community 43 - "client.ts"
Cohesion: 0.07
Nodes (28): VoiceCapabilities, getOracleVoiceCapabilities(), closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode (+20 more)

### Community 44 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (39): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+31 more)

### Community 45 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 46 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (36): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), float32ToPcm16() (+28 more)

### Community 47 - "OracleVoiceClient"
Cohesion: 0.14
Nodes (7): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, playbackClientError(), terminalCloseCode()

### Community 48 - "session-knowledge-routes.test.ts"
Cohesion: 0.08
Nodes (18): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, SessionMuteCarrier, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories (+10 more)

### Community 49 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 50 - "oracle-voice-engine.ts"
Cohesion: 0.08
Nodes (29): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+21 more)

### Community 51 - "pwa.ts"
Cohesion: 0.09
Nodes (39): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+31 more)

### Community 52 - ".sendInternal"
Cohesion: 0.13
Nodes (31): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity() (+23 more)

### Community 53 - "SessionDetail"
Cohesion: 0.12
Nodes (11): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, Admission, ExclusiveAdmission, PendingQueueAdmission, TerminalFormReplyError, PendingUserInput (+3 more)

### Community 54 - "FakeSessionService"
Cohesion: 0.07
Nodes (5): FakeSessionService, routingFixture(), session(), temporaryDirectory(), AgentMode

### Community 56 - "VoicePlayback"
Cohesion: 0.10
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 57 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 58 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 59 - "node-routes.ts"
Cohesion: 0.06
Nodes (33): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema (+25 more)

### Community 60 - "ResidentVoiceWorker"
Cohesion: 0.13
Nodes (8): matchesCancelled(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceGenerationIdentity, VoiceSynthesisRequest, ActiveSynthesisIdentity, ActiveUtteranceIdentity

### Community 61 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 62 - "ManagerStore"
Cohesion: 0.09
Nodes (8): openStore(), emptyState(), ManagerStore, messageSource(), storedMessage(), open(), createManager(), StoredManager

### Community 63 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 64 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 65 - "oracle-voice-routes.ts"
Cohesion: 0.11
Nodes (32): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+24 more)

### Community 66 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 67 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 68 - "active-sessions.ts"
Cohesion: 0.12
Nodes (32): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+24 more)

### Community 69 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 70 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (20): SocketMessage, apps, config, configFixture(), connect(), createManager(), Inbox, issueTicket() (+12 more)

### Community 71 - "background-task-adapter.ts"
Cohesion: 0.09
Nodes (32): attachmentModeValue(), BackgroundTaskEventOptions, booleanValue(), CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, executionModeValue() (+24 more)

### Community 72 - "session-patch-routes.test.ts"
Cohesion: 0.09
Nodes (14): managers, releases, remote, ComputerRegistry, RegistryState, directories, remoteSnapshotFixture(), NodeIdentityStore (+6 more)

### Community 73 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (31): readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+23 more)

### Community 74 - "app.ts"
Cohesion: 0.10
Nodes (19): prefixes, session, trusted, untrusted, apps, directories, buildApp(), errorStatusCode() (+11 more)

### Community 75 - "real-voice.ts"
Cohesion: 0.11
Nodes (13): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+5 more)

### Community 76 - "remote-voice-client.ts"
Cohesion: 0.17
Nodes (13): VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+5 more)

### Community 77 - "AgentProvider"
Cohesion: 0.09
Nodes (19): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+11 more)

### Community 78 - "delegated-transcription-service.ts"
Cohesion: 0.10
Nodes (15): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+7 more)

### Community 79 - "manager-structured-memory.ts"
Cohesion: 0.09
Nodes (25): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+17 more)

### Community 80 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 81 - "HubEvent"
Cohesion: 0.12
Nodes (15): Connection, WorkspaceFixture, ComputerManagerEvents, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset (+7 more)

### Community 82 - "backgroundTasksFromEvents"
Cohesion: 0.18
Nodes (28): addActivity(), backgroundHandoff(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventString(), eventTask(), lastForegroundCompletionAt() (+20 more)

### Community 83 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (14): phases, port, createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, StartupPhases (+6 more)

### Community 84 - "ManagerStructuredMemoryStore"
Cohesion: 0.13
Nodes (10): benchmarkState(), now(), openFixture(), searchSamples(), initializeManagerStructuredMemory(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore (+2 more)

### Community 85 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 86 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 87 - "manager-structured-memory-search.ts"
Cohesion: 0.13
Nodes (23): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+15 more)

### Community 88 - "oracle-voice-segments.ts"
Cohesion: 0.13
Nodes (20): alignCandidateSequences(), AlignmentCost, CandidateAlignment, candidateSubstitutionCost(), capSegment(), collectProseBlocks(), EmittedCandidate, extractSpeakableSegments() (+12 more)

### Community 89 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (21): parseTerminalUpdateNotice(), bracketedTabPane, clearFixture(), deliveryFixture(), desktopInstallPane, directories, downloadedUpdateFooter, execFileAsync (+13 more)

### Community 90 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (22): AppearanceSetting, isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, statuslineItems, Appearance, appearanceFrom() (+14 more)

### Community 91 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 92 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 93 - "manager-routes.ts"
Cohesion: 0.12
Nodes (16): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+8 more)

### Community 94 - "session-knowledge-routes.ts"
Cohesion: 0.13
Nodes (17): Lineage, registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+9 more)

### Community 95 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 96 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 97 - "oracle-voice-routes.test.ts"
Cohesion: 0.11
Nodes (10): FakeManager, openApps, openSockets, RouteManager, runtime(), testRoot(), testRoots, trusted (+2 more)

### Community 98 - "directory-browser.ts"
Cohesion: 0.18
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 99 - "client.test.ts"
Cohesion: 0.11
Nodes (6): capabilities, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse()

### Community 100 - "LocalVoiceBackend"
Cohesion: 0.09
Nodes (5): voiceBackend(), GatedVoiceEngineFactory, ObservedLocalVoiceBackend, LocalVoiceBackend, VoiceBackendCapability

### Community 101 - "settings-profile-store.ts"
Cohesion: 0.18
Nodes (12): SettingsProfileState, applySettingsChanges(), applySettingsImport(), isSettingsProfileKey(), SettingsProfileRecord, SettingsRequestError, sizeChecked(), validateSettingsChanges() (+4 more)

### Community 102 - "PromptCards.tsx"
Cohesion: 0.13
Nodes (16): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+8 more)

### Community 103 - "SessionResources.tsx"
Cohesion: 0.14
Nodes (19): isMcpSummary(), isRecord(), isSkillSummary(), listSessionMcpServers(), listSessionSkills(), optionalBoolean(), optionalCount(), optionalText() (+11 more)

### Community 104 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 106 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 107 - "SettingsProfileStore"
Cohesion: 0.14
Nodes (11): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileStore, directories, store() (+3 more)

### Community 108 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 109 - "workspace-browser.ts"
Cohesion: 0.19
Nodes (17): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+9 more)

### Community 110 - "shared/settings-profile.ts"
Cohesion: 0.13
Nodes (20): AccentSetting, appearanceSettings, isRecord(), NewSessionFoldersSetting, NewSessionRuntimesSetting, oneOf(), oracleResponseStyles, parseRuntime() (+12 more)

### Community 111 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 112 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 113 - "session-reply-durability.test.ts"
Cohesion: 0.16
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 114 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 115 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 116 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 117 - "ComputerSummary"
Cohesion: 0.18
Nodes (7): mapWithConcurrency(), fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, TurnContextInput, ComputerSummary

### Community 118 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 119 - "submission-error.ts"
Cohesion: 0.17
Nodes (10): directories, runtimes, start(), trusted, RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals (+2 more)

### Community 120 - "VoiceBackendSession"
Cohesion: 0.14
Nodes (8): ActiveBackendSession, exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), RouteVoiceBackend, VoiceBackendSession, VoiceBackendSessionOpenOptions

### Community 121 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 122 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 123 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 124 - ".withFormViewport"
Cohesion: 0.19
Nodes (12): FormReplyDeadlineError, hasClippedTerminalFormTabs(), parseTerminalFormActiveField(), submitTerminalForm(), tabNames(), terminalBoxWrap(), terminalFormCommitKeys(), terminalFormQuestionEnd() (+4 more)

### Community 125 - "use-oracle-settings.ts"
Cohesion: 0.21
Nodes (12): getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps, models (+4 more)

### Community 126 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 127 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 128 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 129 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 130 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder(), reopenInterruptedSession() (+8 more)

### Community 131 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 132 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 133 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 134 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 135 - "OracleVoiceClientDependencies"
Cohesion: 0.17
Nodes (4): defaultDependencies(), OracleVoiceClientDependencies, FakePlayback, VoicePlaybackOptions

### Community 136 - "BackgroundTasksDialog.tsx"
Cohesion: 0.22
Nodes (11): BackgroundTask, DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel() (+3 more)

### Community 137 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 138 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 139 - "manager-runtime.ts"
Cohesion: 0.25
Nodes (10): COPILOT_SDK_SESSION_DISCOVERY, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession(), createManagerSdkClient() (+2 more)

### Community 140 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 141 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 142 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 143 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 144 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 146 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 147 - "session-response-order.ts"
Cohesion: 0.29
Nodes (10): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+2 more)

### Community 148 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 149 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 150 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 151 - "file-upload-routes.ts"
Cohesion: 0.29
Nodes (6): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile()

### Community 152 - "session-resource-transport.ts"
Cohesion: 0.31
Nodes (8): CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 153 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 154 - "vite.config.ts"
Cohesion: 0.20
Nodes (6): canaryTests, oracleVoiceAssetNames, oracleVoiceThirdPartyNotices, packageVersion, slowTests, tmuxTests

### Community 155 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 156 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 157 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 159 - "tmux-errors.test.ts"
Cohesion: 0.25
Nodes (6): directories, { execute }, files, links, listener(), server()

### Community 160 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 161 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 162 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 163 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 164 - "vad-assets.ts"
Cohesion: 0.32
Nodes (7): browserBaseUrl(), directory(), localAssetUrl(), ORACLE_VOICE_ONNX_WASM_BASE_PATH, ORACLE_VOICE_VAD_ASSETS, ORACLE_VOICE_VAD_BASE_PATH, sharedAssetDirectory()

### Community 165 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 166 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 167 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 168 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 170 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 171 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 172 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 179 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **1054 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1049 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1788 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `SessionStore`, `AgentService`, `ClaudeAgentService`, `manager-runtime.ts`, `ManagerAgent`, `TranscriptionError`, `PushNotificationService`, `oracle-voice-worker.ts`, `manager-agent.ts`, `file-upload-routes.ts`, `session-knowledge-store.ts`, `ManagedSession`, `manager-context.ts`, `SessionService`, `session-knowledge-routes.test.ts`, `oracle-voice-engine.ts`, `SessionDetail`, `ProviderSessionService`, `ManagerStore`, `session-patch-routes.test.ts`, `delegated-transcription-service.ts`, `SessionOrderStore`, `ManagerStructuredMemoryStore`, `cli-canary.ts`, `manager-routes.ts`, `transcription-service.ts`, `LocalVoiceBackend`, `SettingsProfileStore`, `refusal-metrics.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `directory-browser.ts`, `agent-service.ts`, `.get`, `claude-agent-service.ts`, `contracts.ts`, `CopilotSessionLike`, `SessionDetail`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `agent-service.ts`, `.get`, `ClaudeAgentService`, `CopilotSessionLike`, `SessionDetail`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1054 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.02844311377245509 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.030135725787899702 - nodes in this community are weakly interconnected._
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
- `docs/design/session-manager.md`
- `docs/design/settings-profile.md`
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
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
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
- `src/index.css`
- `config/oracle-voice-profiles.json`
