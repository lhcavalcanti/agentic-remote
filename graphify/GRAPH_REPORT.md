# Agentic Remote - Graphify code map

Snapshot: `225524de520d2434763e9ff67b61692fbec6f24c19e0c90dbbbc4fe515509296`

Source checkout: `82dea2e5b88dede43c590cf235b41e231cab117d`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 405 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 405 files · ~818,591 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6924 nodes · 19156 edges · 210 communities (182 shown, 12 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1015 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionStore
- App
- api.ts
- App.tsx
- SessionDetail
- agent-service.ts
- contracts.ts
- agent-service.test.ts
- app.ts
- claude-agent-service.ts
- ManagedSession
- terminal-session.ts
- SessionService
- agentic-remote-promotion-monitor
- oracle-voice-child.ts
- ManagerAgent
- manager-tools.ts
- manager-agent.ts
- PushNotificationService
- OracleVoiceCoordinator
- oracle-voice-integration.test.ts
- oracle-voice-worker.ts
- queued-dispatch.test.ts
- FakeVoiceEngine
- session-presentation.ts
- session-store-providers.test.ts
- ManagerStore
- manager-structured-memory-validation.ts
- ManagerAssistant.tsx
- FakeManager
- tmux-test-helpers.ts
- oracle-voice-routes.test.ts
- session-knowledge-routes.test.ts
- oracle-task-store.ts
- RemoteNodeClient
- oracle-voice-soak.ts
- send-matrix.integration.test.ts
- dependencies
- workspace-fixtures.ts
- TmuxTerminalSessionController
- oracle-voice-benchmark.ts
- oracle-voice-coordinator.ts
- markdown-navigation.ts
- oracle-voice-security.test.ts
- oracle-voice.ts
- OracleDreamer.tsx
- DreamerService
- agentic-remote
- VoiceClientControl
- ManagerEvent
- OracleVoiceClient
- bundle
- pwa.ts
- dreamer-store.ts
- DreamerStore
- VoicePlayback
- ResidentVoiceWorker
- ProviderSessionService
- hub-routes.ts
- client.test.ts
- shell.ts
- lib.rs
- agentic-remote-promotion-setup
- dreamer-planner.ts
- manager-agent.test.ts
- terminal-session.test.ts
- knowledge-tree.ts
- VoiceCapture
- agentic-remote-gate
- config.rs
- manager-proactive-inbox.ts
- manager-structured-memory.ts
- oracle-voice-routes.ts
- capture.ts
- devDependencies
- active-sessions.ts
- manager-structured-memory-search.ts
- VoiceEngineSession
- FakeSessionService
- EngineVoiceBackendSession
- SessionKnowledgeStore
- UserInputReplyInput
- oracle-voice-segments.ts
- .sendInternal
- dreamer-service.ts
- SessionOrderStore
- settings-profile-store.ts
- background-task-adapter.ts
- VoiceCapabilities
- shared/settings-profile.ts
- real-voice.ts
- HubEvent
- delegated-transcription-service.ts
- session-patch-browser.ts
- cli-canary.ts
- session-resource-clear.test.ts
- scripts
- oracle-voice-config.ts
- directory-browser.ts
- backgroundTasksFromEvents
- KnowledgeStore
- transcription-service.ts
- compilerOptions
- .toolHost
- manager-context.ts
- client.ts
- src/settings-profile.ts
- SettingsProfileClient
- ManagerStructuredMemoryStore
- SessionResources.tsx
- capture-workspace.ts
- normalizeKnowledgeRelativePath
- ManagerProactiveInbox
- oracle-voice-tickets.ts
- full-gate.test.ts
- session-reply-durability.test.ts
- PromptCards.tsx
- compilerOptions
- .observe
- session-knowledge-store.ts
- OnlineRecognizer
- compilerOptions
- compilerOptions
- workspace-browser.ts
- SettingsProfileSnapshot
- react
- dreamer-schedule.ts
- SessionStatus
- ManagerMemory
- use-session-knowledge-root.ts
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- terminal-form-deadline.test.ts
- background-task-stop.test.ts
- promotion-monitor.test.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- package.json
- scripts
- VoiceEngineEvent
- oracle-voice-assets.test.ts
- oracle-voice-session.ts
- fake-vad.ts
- desktop.json
- manager-proactive-inbox.test.ts
- registerSessionKnowledgeRoutes
- theme-contrast.test.ts
- use-oracle-settings.ts
- BackgroundTasksDialog.tsx
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- .initialize
- TranscriptionError
- session-response-order.ts
- Pcm16Resampler
- background-task-tracker.ts
- html-preview.ts
- DeferredSession
- session-knowledge-routes.ts
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- boundedText
- dreamer-routes.ts
- promotion-setup-execution.test.ts
- SessionAdmissions
- tmux-errors.test.ts
- vite.config.ts
- recovery-context.ts
- release-publication.test.ts
- OracleVoicePlayback
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- usePanelWidth
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- removeComputer
- FakeRecorder
- terminal-send-uncertainty.test.ts
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 307 edges
2. `App()` - 278 edges
3. `AgentService` - 276 edges
4. `SessionStore` - 189 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 109 edges
7. `buildApp()` - 95 edges
8. `registerHubRoutes()` - 93 edges
9. `ManagerAgent` - 88 edges
10. `ComputerManager` - 87 edges

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

## Communities (210 total, 12 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (19): agentMode(), AgentService, commandShortcut(), isTerminalNotReadyRefusal(), restart(), removeCopilotSessionFiles(), RuntimeConfigurationError, stripAnsi() (+11 more)

### Community 1 - "SessionStore"
Cohesion: 0.03
Nodes (66): fixture(), fixture(), connect(), createStore(), enqueue(), fixture(), recoveryFixture(), fixture() (+58 more)

### Community 2 - "App"
Cohesion: 0.04
Nodes (138): isManagerEvent(), alertNotification(), terminalSendOptions(), askSession(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey() (+130 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (124): SettingsChange, SettingsProfileKey, SettingsProfileValues, SettingsUpdateResult, parseSubmissionReceipt(), submissionReceiptFromError(), activateSession(), addKnowledgeRoot() (+116 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (115): AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+107 more)

### Community 5 - "SessionDetail"
Cohesion: 0.05
Nodes (17): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services (+9 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.04
Nodes (82): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+74 more)

### Community 7 - "contracts.ts"
Cohesion: 0.04
Nodes (53): RemoteResync, RemoteSessionListing, RemoteSessionRead, directories, voiceControlQueues, voiceControlWaiters, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+45 more)

### Community 8 - "agent-service.test.ts"
Cohesion: 0.03
Nodes (63): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+55 more)

### Community 9 - "app.ts"
Cohesion: 0.03
Nodes (61): prefixes, session, trusted, untrusted, apps, directories, buildApp(), BuildAppOptions (+53 more)

### Community 10 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (66): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission (+58 more)

### Community 11 - "ManagedSession"
Cohesion: 0.08
Nodes (14): ClientPresence, PRESENCE_TTL_MS, ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), ManagerEventSource, registerHubRoutes() (+6 more)

### Community 12 - "terminal-session.ts"
Cohesion: 0.05
Nodes (75): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerRowText() (+67 more)

### Community 13 - "SessionService"
Cohesion: 0.04
Nodes (45): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), closeReason(), closeVoiceSocket() (+37 more)

### Community 14 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 15 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (46): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, createVoiceWorker(), defaultSpawnPiper(), errorMessage() (+38 more)

### Community 16 - "ManagerAgent"
Cohesion: 0.08
Nodes (14): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+6 more)

### Community 17 - "manager-tools.ts"
Cohesion: 0.05
Nodes (40): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), proactiveSessionAllowed(), requireComputer(), resolveSession() (+32 more)

### Community 18 - "manager-agent.ts"
Cohesion: 0.05
Nodes (43): FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, automaticPayload(), isPending(), isQueued(), ManagerAgentOptions (+35 more)

### Community 19 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 20 - "OracleVoiceCoordinator"
Cohesion: 0.09
Nodes (5): errorMessage(), OracleVoiceCoordinator, PendingFinalTurn, withTimeout(), VoiceTurnState

### Community 21 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+23 more)

### Community 22 - "oracle-voice-worker.ts"
Cohesion: 0.07
Nodes (28): benchmarkGroup(), VoiceEndUtterance, VoiceStartUtterance, BlockingEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine (+20 more)

### Community 23 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (29): acceptanceReceipt(), errorMessage(), ownsDispatchRecovery(), preflight(), preparePrompt(), QueuedDelivery, QueuedDispatches, accept() (+21 more)

### Community 24 - "FakeVoiceEngine"
Cohesion: 0.06
Nodes (26): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceSttEngine, VoiceTtsEngine, VoiceUtteranceAudioFrame (+18 more)

### Community 25 - "session-presentation.ts"
Cohesion: 0.07
Nodes (50): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+42 more)

### Community 26 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (37): ClaudeSdk, deferred(), disk, fixtures, holdClaimWrite(), releases, deferred(), disk (+29 more)

### Community 27 - "ManagerStore"
Cohesion: 0.07
Nodes (17): openStore(), JournalRecorder, JournalRecorderOptions, sessionTask(), emptyState(), JournalDraft, JournalEntry, JournalKind (+9 more)

### Community 28 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 29 - "ManagerAssistant.tsx"
Cohesion: 0.06
Nodes (42): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline() (+34 more)

### Community 30 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 31 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (44): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+36 more)

### Community 32 - "oracle-voice-routes.test.ts"
Cohesion: 0.05
Nodes (20): voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngineFactory, config, ObservedLocalVoiceBackend, openApps, openSockets, RouteManager (+12 more)

### Community 33 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (30): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+22 more)

### Community 34 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (34): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+26 more)

### Community 35 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (11): RemoteNodeClient, client(), servers, session, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing (+3 more)

### Community 36 - "oracle-voice-soak.ts"
Cohesion: 0.08
Nodes (31): childCleanupPassed(), childPids(), connectSoakSocket(), delay(), errorText(), GatedStartupRaceObservation, LifecycleCycleObservation, LifecycleCycleResult (+23 more)

### Community 37 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (46): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+38 more)

### Community 38 - "dependencies"
Cohesion: 0.04
Nodes (53): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+45 more)

### Community 39 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (40): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+32 more)

### Community 40 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (13): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+5 more)

### Community 41 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 42 - "oracle-voice-coordinator.ts"
Cohesion: 0.05
Nodes (31): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnection (+23 more)

### Community 43 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (41): executeCommand(), readWorkspaceFile(), searchWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), submit(), followMarkdownLink(), KnowledgeReader() (+33 more)

### Community 44 - "oracle-voice-security.test.ts"
Cohesion: 0.05
Nodes (24): capabilities, confirm(), control(), defaults, FakeManager, startControl(), apps, config (+16 more)

### Community 45 - "oracle-voice.ts"
Cohesion: 0.09
Nodes (37): capabilities, closeServers, exactArrayBuffer(), sockets, startFields, VoiceNode, decodeVoiceAudioFrame(), encodeVoiceAudioFrame() (+29 more)

### Community 46 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (39): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition (+31 more)

### Community 47 - "DreamerService"
Cohesion: 0.14
Nodes (10): DreamerMemoryMetadata, digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate (+2 more)

### Community 48 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 49 - "VoiceClientControl"
Cohesion: 0.10
Nodes (21): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, RemoteNodeRedirectError, RemoteNodeRequestError, closeReason(), exactArrayBuffer(), rawDataBuffer() (+13 more)

### Community 50 - "ManagerEvent"
Cohesion: 0.09
Nodes (16): apps, directories, batchMessageId(), isTerminal(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, oneLine(), ProactiveManager (+8 more)

### Community 51 - "OracleVoiceClient"
Cohesion: 0.15
Nodes (8): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError(), terminalCloseCode()

### Community 52 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 53 - "pwa.ts"
Cohesion: 0.09
Nodes (38): AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+30 more)

### Community 54 - "dreamer-store.ts"
Cohesion: 0.07
Nodes (31): DreamerMemoryMetadataRecord, directories, assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+23 more)

### Community 55 - "DreamerStore"
Cohesion: 0.13
Nodes (11): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, emptyState(), isMissing() (+3 more)

### Community 56 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 57 - "ResidentVoiceWorker"
Cohesion: 0.13
Nodes (7): combinedTranscript(), matchesCancelled(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceGenerationIdentity, VoiceSynthesisRequest

### Community 59 - "hub-routes.ts"
Cohesion: 0.06
Nodes (38): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+30 more)

### Community 60 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 61 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 62 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 63 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 64 - "dreamer-planner.ts"
Cohesion: 0.10
Nodes (34): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+26 more)

### Community 65 - "manager-agent.test.ts"
Cohesion: 0.07
Nodes (17): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+9 more)

### Community 66 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (32): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+24 more)

### Community 67 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (35): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+27 more)

### Community 68 - "VoiceCapture"
Cohesion: 0.14
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 69 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 70 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 71 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (35): assertExactKeys(), canonicalHash(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isDisposition(), isEventKind() (+27 more)

### Community 72 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (30): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+22 more)

### Community 73 - "oracle-voice-routes.ts"
Cohesion: 0.12
Nodes (32): sendNodeVoiceOutput(), limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode() (+24 more)

### Community 74 - "capture.ts"
Cohesion: 0.07
Nodes (17): BufferedFrame, defaultAudioContext(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode (+9 more)

### Community 75 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 76 - "active-sessions.ts"
Cohesion: 0.12
Nodes (32): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+24 more)

### Community 77 - "manager-structured-memory-search.ts"
Cohesion: 0.10
Nodes (28): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+20 more)

### Community 78 - "VoiceEngineSession"
Cohesion: 0.07
Nodes (5): ControlledAcquisitionGate, ControlledSoakEngine, SoakManager, VoiceEngineSession, GatedVoiceEngineFactory

### Community 79 - "FakeSessionService"
Cohesion: 0.09
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 80 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 81 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (11): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateWithPaths(), disk, fixture(), fixtures (+3 more)

### Community 82 - "UserInputReplyInput"
Cohesion: 0.13
Nodes (8): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), TerminalFormReplyError, PendingUserInput, UserInputReplyInput, deliveryUncertaintyFromError()

### Community 83 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 84 - ".sendInternal"
Cohesion: 0.18
Nodes (26): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+18 more)

### Community 85 - "dreamer-service.ts"
Cohesion: 0.10
Nodes (27): DreamerPlanDraft, DreamerPlannerInput, boundedText(), DreamerPlannerExecutionInput, DreamerServiceOptions, safeRunError(), unavailableSnapshot(), DreamerCoverageIncrement (+19 more)

### Community 86 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 87 - "settings-profile-store.ts"
Cohesion: 0.13
Nodes (19): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+11 more)

### Community 88 - "background-task-adapter.ts"
Cohesion: 0.09
Nodes (26): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, CopilotTasksApi, isBackgroundTaskInfo(), isBackgroundTaskProgress() (+18 more)

### Community 89 - "VoiceCapabilities"
Cohesion: 0.12
Nodes (14): VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability (+6 more)

### Community 90 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (27): AccentSetting, appearanceSettings, applySettingsChanges(), isRecord(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting, NewSessionRuntimesSetting (+19 more)

### Community 91 - "real-voice.ts"
Cohesion: 0.12
Nodes (11): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+3 more)

### Community 92 - "HubEvent"
Cohesion: 0.12
Nodes (15): Connection, WorkspaceFixture, ComputerManagerEvents, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset (+7 more)

### Community 93 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (13): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+5 more)

### Community 94 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 95 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 96 - "session-resource-clear.test.ts"
Cohesion: 0.09
Nodes (25): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+17 more)

### Community 97 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 98 - "oracle-voice-config.ts"
Cohesion: 0.14
Nodes (22): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+14 more)

### Community 99 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 100 - "backgroundTasksFromEvents"
Cohesion: 0.18
Nodes (26): backgroundHandoff(), backgroundTasksFromEvents(), booleanValue(), errorValue(), eventString(), eventTask(), executionModeValue(), lastForegroundCompletionAt() (+18 more)

### Community 101 - "KnowledgeStore"
Cohesion: 0.18
Nodes (7): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 102 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 103 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 104 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, PermissionReplyInput, RenameSessionInput, SendMessageInput

### Community 105 - "manager-context.ts"
Cohesion: 0.16
Nodes (20): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+12 more)

### Community 106 - "client.ts"
Cohesion: 0.11
Nodes (16): connect(), Inbox, rawBuffer(), VoiceServerControl, closeReason(), isCapabilities(), isRecord(), isTicket() (+8 more)

### Community 107 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (19): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+11 more)

### Community 108 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 109 - "ManagerStructuredMemoryStore"
Cohesion: 0.24
Nodes (5): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState

### Community 110 - "SessionResources.tsx"
Cohesion: 0.14
Nodes (19): isMcpSummary(), isRecord(), isSkillSummary(), listSessionMcpServers(), listSessionSkills(), optionalBoolean(), optionalCount(), optionalText() (+11 more)

### Community 111 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 112 - "normalizeKnowledgeRelativePath"
Cohesion: 0.17
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), pathRecordSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+10 more)

### Community 113 - "ManagerProactiveInbox"
Cohesion: 0.20
Nodes (6): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 114 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 115 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 116 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 117 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

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

### Community 123 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 124 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 125 - "SettingsProfileSnapshot"
Cohesion: 0.17
Nodes (6): SettingsProfileSnapshot, settingsProfileCacheKey, SettingsProfileTransport, cached(), FakeHub, MemoryStorage

### Community 126 - "react"
Cohesion: 0.14
Nodes (8): react, drawDiagram(), drawing, MermaidDiagram(), SessionActions(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 127 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 128 - "SessionStatus"
Cohesion: 0.14
Nodes (16): Seen, PersistedCursor, Row, SdkRestartRecovery, SessionExecutionMode, SessionStatus, TerminalSendPolicyInput, TerminalSendRequestOptions (+8 more)

### Community 129 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 130 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 131 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 132 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 133 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 134 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 135 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 136 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 137 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 138 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 139 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 140 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 141 - "VoiceEngineEvent"
Cohesion: 0.18
Nodes (7): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, VoiceEngineEvent

### Community 142 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 143 - "oracle-voice-session.ts"
Cohesion: 0.18
Nodes (11): acquisitionCancelled(), ActiveUtterance, capabilityFromConfig(), isAcquisitionCancelled(), QueuedOutput, sameUtterance(), Timer, validateLimits() (+3 more)

### Community 144 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 145 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 146 - "manager-proactive-inbox.test.ts"
Cohesion: 0.16
Nodes (9): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState() (+1 more)

### Community 147 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 148 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 149 - "use-oracle-settings.ts"
Cohesion: 0.26
Nodes (11): getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps, models (+3 more)

### Community 150 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 151 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 152 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 153 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 154 - ".initialize"
Cohesion: 0.22
Nodes (5): initializeManagerStructuredMemory(), isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, open()

### Community 155 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 156 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 157 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 158 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 159 - "html-preview.ts"
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

### Community 164 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 165 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 166 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 167 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 168 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 169 - "boundedText"
Cohesion: 0.33
Nodes (9): addActivity(), attachmentModeValue(), boundedText(), normalizeBackgroundTask(), numberValue(), progressValue(), shellExitFromValue(), shellTask() (+1 more)

### Community 170 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 171 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 173 - "tmux-errors.test.ts"
Cohesion: 0.25
Nodes (6): directories, { execute }, files, links, listener(), server()

### Community 174 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 175 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 176 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 178 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 179 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 180 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 181 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 182 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 183 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 184 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 185 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **1145 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1140 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1927 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionStore`, `SessionDetail`, `ManagedSession`, `SessionService`, `ManagerAgent`, `manager-agent.ts`, `PushNotificationService`, `oracle-voice-worker.ts`, `.initialize`, `ManagerStore`, `TranscriptionError`, `oracle-voice-routes.test.ts`, `session-knowledge-routes.test.ts`, `oracle-task-store.ts`, `dreamer-routes.ts`, `DreamerService`, `ManagerEvent`, `pwa.ts`, `ProviderSessionService`, `SessionKnowledgeStore`, `UserInputReplyInput`, `SessionOrderStore`, `settings-profile-store.ts`, `delegated-transcription-service.ts`, `cli-canary.ts`, `oracle-voice-config.ts`, `KnowledgeStore`, `transcription-service.ts`, `ManagerStructuredMemoryStore`, `ManagerProactiveInbox`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `directory-browser.ts`, `SessionDetail`, `agent-service.ts`, `contracts.ts`, `claude-agent-service.ts`, `UserInputReplyInput`, `queued-dispatch.test.ts`, `background-task-adapter.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `SessionDetail`, `agent-service.ts`, `agent-service.test.ts`, `claude-agent-service.ts`, `UserInputReplyInput`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1145 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.031109898249580912 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.02937447168216399 - nodes in this community are weakly interconnected._
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
- `docs/superpowers/plans/2026-11-06-oracle-actionable-morning-plan.md`
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-17-oracle-proactive-lifecycle-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
- `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`
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
