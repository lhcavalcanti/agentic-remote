# Agentic Remote - Graphify code map

Snapshot: `571a92fd6d150494689f3994fb0a4077ea93c530fd9f3bfa25d90b0a7ef4b027`

Source checkout: `0ae4fa051992f46b397e5696ea278d630e7619ef`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 407 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 407 files · ~839,925 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6980 nodes · 19384 edges · 222 communities (180 shown, 26 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1020 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionStore
- App
- api.ts
- App.tsx
- ClaudeAgentService
- claude-agent-service.ts
- multi-node.test.ts
- agent-service.ts
- manager-tools.ts
- ManagerAgent
- terminal-session.ts
- agentic-remote-promotion-monitor
- session-store-providers.test.ts
- ManagedSession
- oracle-voice-integration.test.ts
- VoiceClientControl
- sessionKey
- oracle-voice-session.ts
- FakeVoiceEngine
- CopilotSessionLike
- PushNotificationService
- fake-voice.ts
- computer-manager.ts
- ManagerAssistant.tsx
- oracle-voice-soak.ts
- OracleVoiceCoordinator
- oracle-voice-coordinator.ts
- workspace-fixtures.ts
- manager.ts
- manager-agent.ts
- background-task-adapter.ts
- manager-structured-memory-validation.ts
- active-sessions.ts
- markdown-navigation.ts
- oracle-task-store.ts
- oracle-voice-worker.ts
- session-knowledge-routes.test.ts
- oracle-voice-benchmark.ts
- TerminalSessionController
- OracleVoiceClient
- OracleDreamer.tsx
- ManagerStore
- TmuxTerminalSessionController
- SessionDetail
- DreamerService
- terminal-startup-queue.test.ts
- RemoteNodeClient
- oracle-voice.ts
- agentic-remote
- contracts.ts
- bundle
- app.ts
- ResidentVoiceWorker
- ProviderSessionService
- ManagerProactiveCoordinator
- DreamerStore
- client.ts
- VoicePlayback
- oracle-voice-child.ts
- manager-proactive-inbox.ts
- SessionService
- client.test.ts
- .sendInternal
- pwa.ts
- shell.ts
- lib.rs
- dreamer-store.ts
- agentic-remote-promotion-setup
- hub-routes.ts
- oracle-voice-routes.ts
- agentic-remote-gate
- config.rs
- node-routes.ts
- transcription-service.ts
- agent-service.test.ts
- manager-structured-memory.ts
- SessionKnowledgeStore
- dependencies
- devDependencies
- .recoverSdkSession
- oracle-voice-child.test.ts
- terminal-session.test.ts
- remote-voice-client.ts
- oracle-voice-security.test.ts
- EngineVoiceBackendSession
- HubEvent
- dreamer-planner.ts
- oracle-voice-segments.ts
- shared/settings-profile.ts
- real-voice.ts
- SessionOrderStore
- session-patch-browser.ts
- session-reply-durability.test.ts
- manager-structured-memory-search.ts
- background-task-stop.test.ts
- dreamer-service.ts
- cli-canary.ts
- send-matrix.integration.test.ts
- OracleSettings.tsx
- src/settings-profile.ts
- scripts
- KnowledgeStore
- directory-browser.ts
- recovery-resend-durability.test.ts
- delegated-transcription-service.ts
- settings-profile-store.ts
- compilerOptions
- react
- SettingsProfileClient
- capture-workspace.ts
- manager-context.ts
- ManagerStructuredMemoryStore
- oracle-voice-tickets.ts
- refusal-metrics.ts
- full-gate.test.ts
- startup-phases.test.ts
- session-knowledge-store.ts
- PromptCards.tsx
- knowledge-tree.ts
- compilerOptions
- OnlineRecognizer
- compilerOptions
- compilerOptions
- server/side-question.ts
- session-resource-routes.test.ts
- event-log.ts
- ManagerMemory
- ManagerProactiveInbox
- .observe
- oracle-voice-config.ts
- workspace-browser.ts
- normalizeKnowledgeRelativePath
- VoiceEngineEvent
- dreamer-schedule.ts
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- NewSessionDialog
- use-session-knowledge-root.ts
- terminal-form-deadline.test.ts
- SoakManager
- manager-runtime.ts
- promotion-monitor.test.ts
- server/session-patches.ts
- session-response-order.ts
- scripts
- file-upload-routes.ts
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- BackgroundTasksDialog.tsx
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- registerSessionKnowledgeRoutes
- Pcm16Resampler
- dreamer-routes.ts
- manager-proactive-inbox.test.ts
- .initialize
- html-preview.ts
- .createSession
- session-knowledge-routes.ts
- settings-profile.test.ts
- dataset
- generate-pwa-icons.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- .transport
- screenshot-stability.test.ts
- manager-structured-memory-performance.test.ts
- promotion-setup-execution.test.ts
- SessionAdmissions
- vite.config.ts
- package.json
- ManagerStructuredMemoryRuntime
- release-publication.test.ts
- OracleVoicePlayback
- render-workspace-gifs.ts
- history-projection.test.ts
- SessionStatus
- settings.ts
- composer-layout.test.ts
- dreamer-service.test.ts
- dreamer-app.test.ts
- promotion-setup.test.ts
- removeComputer
- FakeRecorder
- .discoverTerminalSessions
- terminal-send-uncertainty.test.ts
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
1. `SessionDetail` - 309 edges
2. `AgentService` - 281 edges
3. `App()` - 278 edges
4. `SessionStore` - 190 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 110 edges
7. `ManagerAgent` - 97 edges
8. `buildApp()` - 95 edges
9. `registerHubRoutes()` - 93 edges
10. `ComputerManager` - 87 edges

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

## Communities (222 total, 26 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (20): agentMode(), AgentService, foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isTerminalNotReadyRefusal(), isUncertainDelivery(), lifecycleRefusal() (+12 more)

### Community 1 - "SessionStore"
Cohesion: 0.03
Nodes (79): fixture(), restart(), connect(), createStore(), enqueue(), fixture(), recoveryFixture(), fixture() (+71 more)

### Community 2 - "App"
Cohesion: 0.03
Nodes (152): isManagerEvent(), alertNotification(), terminalSendOptions(), clearConversation(), listKnowledgeEntries(), readKnowledgeFile(), reorderQueuedPrompts(), restartSession() (+144 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (117): AddKnowledgeRootInput, PushSettings, SettingsChange, SettingsProfileKey, SettingsProfileValues, SettingsUpdateResult, parseSubmissionReceipt(), submissionReceiptFromError() (+109 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (108): ActivityStatus, AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+100 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (22): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+14 more)

### Community 6 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (68): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+60 more)

### Community 7 - "multi-node.test.ts"
Cohesion: 0.04
Nodes (31): directories, FakeSessionService, routingFixture(), session(), temporaryDirectory(), voiceControlQueues, voiceControlWaiters, ProviderSessionServiceEvents (+23 more)

### Community 8 - "agent-service.ts"
Cohesion: 0.05
Nodes (76): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+68 more)

### Community 9 - "manager-tools.ts"
Cohesion: 0.05
Nodes (45): APPROVE_WORDS, computerField, ContextTier, createManagerTools(), define(), deliver(), proactiveSessionAllowed(), requireComputer() (+37 more)

### Community 10 - "ManagerAgent"
Cohesion: 0.08
Nodes (13): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+5 more)

### Community 11 - "terminal-session.ts"
Cohesion: 0.05
Nodes (73): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerRowText() (+65 more)

### Community 12 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 13 - "session-store-providers.test.ts"
Cohesion: 0.03
Nodes (53): CopilotClientLike, ClaudeSdk, deferred(), disk, fixtures, holdClaimWrite(), releases, deferred() (+45 more)

### Community 14 - "ManagedSession"
Cohesion: 0.09
Nodes (14): ComputerManager, managedSession(), mapWithConcurrency(), registerHubRoutes(), SessionMuteCarrier, TurnContextInput, FakeManager, directories (+6 more)

### Community 15 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (34): ManagerSdkSession, apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback (+26 more)

### Community 16 - "VoiceClientControl"
Cohesion: 0.06
Nodes (24): VoiceClientControl, BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), CaptureControl, harness() (+16 more)

### Community 17 - "sessionKey"
Cohesion: 0.06
Nodes (62): askSession(), saveSessionOrderLane(), askSideQuestion(), closeSideQuestion(), handleDragEnd(), openSideQuestion(), sideQuestionKeyDown(), submitSideQuestion() (+54 more)

### Community 18 - "oracle-voice-session.ts"
Cohesion: 0.04
Nodes (32): voiceBackend(), VoiceEngineFactory, GatedVoiceEngineFactory, ObservedLocalVoiceBackend, openApps, openSockets, RouteManager, RouteVoiceBackend (+24 more)

### Community 19 - "FakeVoiceEngine"
Cohesion: 0.05
Nodes (29): EnabledOracleVoiceConfig, FakeVoiceEngine, FakeVoiceEngineCall, FakeVoiceEngineFactory, identityKey(), isCancelled(), sameGeneration(), config (+21 more)

### Community 20 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (35): CopilotSessionLike, CopilotTasksApi, nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused() (+27 more)

### Community 21 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 22 - "fake-voice.ts"
Cohesion: 0.06
Nodes (11): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice() (+3 more)

### Community 23 - "computer-manager.ts"
Cohesion: 0.04
Nodes (30): TerminalFormContinuation, RemoteResync, RemoteSessionListing, sessionAtLeastAsNew(), ManagerHub, DEFINITE_DISPATCH_REFUSALS, normalizeNodeUrl(), REDIRECT_STATUSES (+22 more)

### Community 24 - "ManagerAssistant.tsx"
Cohesion: 0.06
Nodes (49): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline() (+41 more)

### Community 25 - "oracle-voice-soak.ts"
Cohesion: 0.07
Nodes (33): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+25 more)

### Community 26 - "OracleVoiceCoordinator"
Cohesion: 0.09
Nodes (5): errorMessage(), OracleVoiceCoordinator, PendingFinalTurn, withTimeout(), VoiceTurnState

### Community 27 - "oracle-voice-coordinator.ts"
Cohesion: 0.05
Nodes (37): ManagerEventSource, ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError (+29 more)

### Community 28 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (44): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+36 more)

### Community 29 - "manager.ts"
Cohesion: 0.05
Nodes (31): confirmationSchema, defaultsSchema, editSchema, effort, managerCadence, managerInputError(), ManagerRouteAgent, messageParams (+23 more)

### Community 30 - "manager-agent.ts"
Cohesion: 0.06
Nodes (33): automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSessionConfig, messagePriority() (+25 more)

### Community 31 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (57): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), CopilotClientTaskInfo (+49 more)

### Community 32 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 33 - "active-sessions.ts"
Cohesion: 0.07
Nodes (49): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+41 more)

### Community 34 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (45): executeCommand(), listWorkspace(), readWorkspaceFile(), searchWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink() (+37 more)

### Community 35 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (35): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+27 more)

### Community 36 - "oracle-voice-worker.ts"
Cohesion: 0.09
Nodes (22): benchmarkGroup(), capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent(), isEnabledConfig(), isNonEmptyString() (+14 more)

### Community 37 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (29): fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry, DurableRegisteredComputer (+21 more)

### Community 38 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (41): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 39 - "TerminalSessionController"
Cohesion: 0.04
Nodes (22): holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), fixtures, recoverAndSeed() (+14 more)

### Community 40 - "OracleVoiceClient"
Cohesion: 0.12
Nodes (13): VoiceServerControl, captureClientError(), clientError(), closeError(), isCapabilities(), isRecord(), isTicket(), OracleVoiceClient (+5 more)

### Community 41 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (42): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+34 more)

### Community 42 - "ManagerStore"
Cohesion: 0.08
Nodes (19): openStore(), JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), emptyState(), JournalDraft, JournalEntry (+11 more)

### Community 43 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (14): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+6 more)

### Community 44 - "SessionDetail"
Cohesion: 0.10
Nodes (3): persistedFormAnswer(), TerminalFormReplyError, SessionDetail

### Community 45 - "DreamerService"
Cohesion: 0.12
Nodes (12): DreamerMemoryMetadata, digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), safeRunError(), uniqueSessionRefs() (+4 more)

### Community 46 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (38): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, deliveryFixture(), client() (+30 more)

### Community 47 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (8): RemoteSessionRead, headerSafe(), RemoteNodeClient, BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing

### Community 48 - "oracle-voice.ts"
Cohesion: 0.09
Nodes (37): capabilities, closeServers, exactArrayBuffer(), sockets, startFields, VoiceNode, decodeVoiceAudioFrame(), encodeVoiceAudioFrame() (+29 more)

### Community 49 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 50 - "contracts.ts"
Cohesion: 0.06
Nodes (30): Admission, ExclusiveAdmission, PendingQueueAdmission, BackgroundTaskAttachmentMode, BackgroundTaskExecutionMode, DispatchQueuedPromptInput, ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot (+22 more)

### Community 51 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 52 - "app.ts"
Cohesion: 0.07
Nodes (27): prefixes, session, trusted, untrusted, apps, directories, buildApp(), errorStatusCode() (+19 more)

### Community 53 - "ResidentVoiceWorker"
Cohesion: 0.12
Nodes (10): combinedTranscript(), matchesCancelled(), pcm16ToFloat32(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceGenerationIdentity, VoiceSynthesisRequest (+2 more)

### Community 55 - "ManagerProactiveCoordinator"
Cohesion: 0.09
Nodes (13): batchMessageId(), isTerminal(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, ProactiveManager, directories, FakeAgent, fixture() (+5 more)

### Community 56 - "DreamerStore"
Cohesion: 0.13
Nodes (11): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, emptyState(), isMissing() (+3 more)

### Community 57 - "client.ts"
Cohesion: 0.08
Nodes (23): ManagerClientDefaults, VoiceCapabilities, getOracleVoiceCapabilities(), closeReason(), OracleVoiceCapture, OracleVoiceClientErrorCode, OracleVoiceClientOptions, OracleVoiceTranscriptEvent (+15 more)

### Community 58 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 59 - "oracle-voice-child.ts"
Cohesion: 0.07
Nodes (33): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), float32ToPcm16() (+25 more)

### Community 60 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (39): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isAlreadyExists() (+31 more)

### Community 61 - "SessionService"
Cohesion: 0.10
Nodes (3): registerNodeRoutes(), isSessionResourceRoute(), SessionService

### Community 62 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 63 - ".sendInternal"
Cohesion: 0.13
Nodes (29): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerHoldsText(), composerText(), containsCopiedInteractiveFrame() (+21 more)

### Community 64 - "pwa.ts"
Cohesion: 0.10
Nodes (36): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle() (+28 more)

### Community 65 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 66 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 67 - "dreamer-store.ts"
Cohesion: 0.08
Nodes (32): assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES, DREAMER_STAGING_PREFIX (+24 more)

### Community 68 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 69 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 70 - "oracle-voice-routes.ts"
Cohesion: 0.11
Nodes (33): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+25 more)

### Community 71 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 72 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 73 - "node-routes.ts"
Cohesion: 0.06
Nodes (31): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema (+23 more)

### Community 74 - "transcription-service.ts"
Cohesion: 0.09
Nodes (22): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+14 more)

### Community 75 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (16): terminalFormSteps(), busyTerminal(), configurableModel(), DeferredSession, directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+8 more)

### Community 76 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (30): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+22 more)

### Community 77 - "SessionKnowledgeStore"
Cohesion: 0.12
Nodes (11): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateWithPaths(), disk, fixture(), fixtures (+3 more)

### Community 78 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 79 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 81 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 82 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (29): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse(), pastedPlaceholderCount() (+21 more)

### Community 83 - "remote-voice-client.ts"
Cohesion: 0.14
Nodes (15): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError() (+7 more)

### Community 84 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (20): VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), connect(), createManager(), Inbox (+12 more)

### Community 85 - "EngineVoiceBackendSession"
Cohesion: 0.20
Nodes (3): asSessionError(), EngineVoiceBackendSession, VoiceSessionError

### Community 86 - "HubEvent"
Cohesion: 0.11
Nodes (17): WorkspaceFixture, ComputerManagerEvents, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp() (+9 more)

### Community 87 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (28): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+20 more)

### Community 88 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 89 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (29): AccentSetting, appearanceSettings, applySettingsImport(), DEFAULT_SESSION_PROVIDER, isRecord(), isSettingsProfileKey(), NewSessionBackendSetting, newSessionBackendSettings (+21 more)

### Community 90 - "real-voice.ts"
Cohesion: 0.11
Nodes (12): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+4 more)

### Community 91 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 92 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 93 - "session-reply-durability.test.ts"
Cohesion: 0.12
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 94 - "manager-structured-memory-search.ts"
Cohesion: 0.12
Nodes (24): DreamerMemoryMetadataRecord, authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord() (+16 more)

### Community 95 - "background-task-stop.test.ts"
Cohesion: 0.13
Nodes (19): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+11 more)

### Community 96 - "dreamer-service.ts"
Cohesion: 0.12
Nodes (25): DREAMER_MAX_ITEMS, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), boundedText(), DreamerPlannerExecutionInput, DreamerServiceOptions, unavailableSnapshot() (+17 more)

### Community 97 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 98 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (23): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+15 more)

### Community 99 - "OracleSettings.tsx"
Cohesion: 0.12
Nodes (20): ManagerCheckCadenceMinutes, ManagerProactiveSettings, ManagerProactiveSnapshot, getManager(), updateManagerSettings(), checkCadences, editableProactive(), effortFrom() (+12 more)

### Community 100 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (22): AppearanceSetting, isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, statuslineItems, Appearance, appearanceFrom() (+14 more)

### Community 101 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 102 - "KnowledgeStore"
Cohesion: 0.16
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 103 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 104 - "recovery-resend-durability.test.ts"
Cohesion: 0.10
Nodes (20): directories, fakeClient(), fixture(), ForkRequest, forkSession(), services, directories, disk (+12 more)

### Community 105 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (13): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+5 more)

### Community 106 - "settings-profile-store.ts"
Cohesion: 0.14
Nodes (14): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), profileStore(), updateSchema, SettingsProfileState, SettingsProfileStore (+6 more)

### Community 107 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 108 - "react"
Cohesion: 0.11
Nodes (11): react, MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram(), drawing, MermaidDiagram(), SessionActions() (+3 more)

### Community 109 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 110 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 111 - "manager-context.ts"
Cohesion: 0.17
Nodes (18): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+10 more)

### Community 112 - "ManagerStructuredMemoryStore"
Cohesion: 0.26
Nodes (5): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState

### Community 113 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 114 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 115 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 116 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 117 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+11 more)

### Community 118 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 119 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 120 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 121 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 122 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 123 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 124 - "server/side-question.ts"
Cohesion: 0.20
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 125 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 126 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 127 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 128 - "ManagerProactiveInbox"
Cohesion: 0.24
Nodes (3): ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 129 - ".observe"
Cohesion: 0.19
Nodes (7): ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 130 - "oracle-voice-config.ts"
Cohesion: 0.20
Nodes (15): boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), nonNegativeInteger(), optionalValue(), parseInteger() (+7 more)

### Community 131 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 132 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 133 - "VoiceEngineEvent"
Cohesion: 0.15
Nodes (10): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, isRecord() (+2 more)

### Community 134 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 135 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 136 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 137 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 138 - "NewSessionDialog"
Cohesion: 0.18
Nodes (17): provider(), activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+9 more)

### Community 139 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 140 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 142 - "manager-runtime.ts"
Cohesion: 0.23
Nodes (12): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+4 more)

### Community 143 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 144 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 145 - "session-response-order.ts"
Cohesion: 0.20
Nodes (14): recoverConversation(), adoptConversationReplacement(), recoverSelectedConversation(), sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence() (+6 more)

### Community 146 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 147 - "file-upload-routes.ts"
Cohesion: 0.20
Nodes (8): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), registerTranscriptionRoutes(), transcriptionMultipartOptions

### Community 148 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 149 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 150 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 151 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 152 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 153 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 154 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 155 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 156 - "registerSessionKnowledgeRoutes"
Cohesion: 0.33
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 157 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 158 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 159 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 160 - ".initialize"
Cohesion: 0.24
Nodes (4): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, open()

### Community 161 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 163 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 164 - "settings-profile.test.ts"
Cohesion: 0.20
Nodes (6): applySettingsChanges(), sameSettingValue(), samePending(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 165 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 166 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 167 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 168 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 170 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 171 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.31
Nodes (6): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemorySearchResult, submitSearch()

### Community 172 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 174 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 175 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 176 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.32
Nodes (3): initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, ManagerStructuredMemoryStatus

### Community 177 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 179 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 180 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 181 - "SessionStatus"
Cohesion: 0.29
Nodes (7): ManagerProactiveInboxObservation, PersistedCursor, SessionOrigin, Row, SdkRestartRecovery, SessionStatus, PendingEchoOwner

### Community 182 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 183 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 185 - "dreamer-app.test.ts"
Cohesion: 0.40
Nodes (3): directories, runtimes, trusted

### Community 186 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 187 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **1155 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1150 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1941 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `ManagerProactiveInbox`, `oracle-voice-config.ts`, `SessionStore`, `ClaudeAgentService`, `ManagerAgent`, `ManagedSession`, `manager-runtime.ts`, `oracle-voice-session.ts`, `file-upload-routes.ts`, `PushNotificationService`, `manager.ts`, `dreamer-routes.ts`, `oracle-task-store.ts`, `oracle-voice-worker.ts`, `session-knowledge-routes.test.ts`, `ManagerStore`, `DreamerService`, `ManagerStructuredMemoryRuntime`, `ProviderSessionService`, `ManagerProactiveCoordinator`, `SessionService`, `transcription-service.ts`, `SessionKnowledgeStore`, `SessionOrderStore`, `cli-canary.ts`, `KnowledgeStore`, `delegated-transcription-service.ts`, `settings-profile-store.ts`, `refusal-metrics.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `.createSession`, `claude-agent-service.ts`, `TerminalSessionController`, `directory-browser.ts`, `agent-service.ts`, `recovery-resend-durability.test.ts`, `SessionDetail`, `.recoverSdkSession`, `CopilotSessionLike`, `server/side-question.ts`, `session-resource-routes.test.ts`, `.discoverTerminalSessions`, `background-task-adapter.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `ClaudeAgentService`, `claude-agent-service.ts`, `SessionDetail`, `.recoverSdkSession`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1155 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.04193403129573342 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.027077894481209397 - nodes in this community are weakly interconnected._
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
- `docs/session-retention.md`
- `docs/slash-command-feedback.md`
- `docs/superpowers/plans/2026-10-16-oracle-conversation-mode.md`
- `docs/superpowers/plans/2026-10-16-oracle-structured-memory.md`
- `docs/superpowers/plans/2026-10-20-copilot-sdk-cli-parity.md`
- `docs/superpowers/plans/2026-10-24-copilot-sdk-restart-recovery.md`
- `docs/superpowers/plans/2026-11-04-oracle-periodic-checks.md`
- `docs/superpowers/plans/2026-11-06-oracle-actionable-morning-plan.md`
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-17-oracle-proactive-lifecycle-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
- `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`
- `docs/superpowers/specs/2026-11-04-oracle-periodic-checks-design.md`
- `docs/superpowers/specs/2026-11-06-oracle-actionable-morning-plan-design.md`
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
