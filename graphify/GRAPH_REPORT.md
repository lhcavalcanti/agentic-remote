# Agentic Remote - Graphify code map

Snapshot: `59af8da1264042af3e59ba88efe9b0932e6105145c3fd962437b69b605328f30`

Source checkout: `9906e26e3ca2e684214b8186b53b852f23c47c40`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 407 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 407 files · ~847,524 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7027 nodes · 19499 edges · 221 communities (179 shown, 26 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1033 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionDetail
- App
- contracts.ts
- api.ts
- App.tsx
- agent-service.ts
- ClaudeAgentService
- agent-service.test.ts
- app.ts
- claude-agent-service.ts
- client.ts
- FakeVoiceEngine
- SessionService
- ManagedSession
- background-task-adapter.ts
- manager-tools.ts
- agentic-remote-promotion-monitor
- dreamer-store.ts
- ManagerAgent
- VoiceClientControl
- terminal-session.ts
- transcription-service.ts
- oracle-voice-soak.ts
- oracle-task-store.ts
- sessionKey
- hub-routes.ts
- manager-agent.ts
- oracle-voice-integration.test.ts
- ManagerStore
- node-routes.ts
- tmux-errors.integration.test.ts
- RemoteNodeClient
- manager-structured-memory-validation.ts
- session-directory.ts
- markdown-navigation.ts
- workspace-fixtures.ts
- oracle-voice-benchmark.ts
- oracle-voice-session.ts
- TerminalSessionController
- OracleVoiceCoordinator
- DreamerService
- oracle-voice.ts
- TmuxTerminalSessionController
- manager.ts
- oracle-voice-coordinator.ts
- agentic-remote
- send-matrix.integration.test.ts
- bundle
- oracle-voice-routes.ts
- terminal-startup-queue.test.ts
- FakeVoiceController
- ResidentVoiceWorker
- pwa.ts
- VoicePlayback
- normalizeKnowledgeRelativePath
- manager-proactive-inbox.ts
- client.test.ts
- shell.ts
- lib.rs
- dreamer-planner.ts
- oracle-voice-worker.ts
- agentic-remote-promotion-setup
- ChildVoiceEngine
- agentic-remote-gate
- config.rs
- oracle-voice-config.ts
- manager-store.ts
- oracle-voice-child.ts
- execFileAsync
- ManagerEvent
- ManagerAssistant.tsx
- dependencies
- devDependencies
- EnabledOracleVoiceConfig
- ManagerStructuredMemoryStore
- oracle-voice-child.test.ts
- knowledge-tree.ts
- active-sessions.ts
- manager-structured-memory.ts
- oracle-voice-security.test.ts
- shared/settings-profile.ts
- oracle-voice-segments.ts
- OracleDreamer.tsx
- ManagerSnapshot
- remote-voice-client.ts
- HubEvent
- react
- session-store-providers.test.ts
- session-patch-browser.ts
- cli-canary.ts
- PushNotificationService
- src/settings-profile.ts
- scripts
- session-enqueue-clear.test.ts
- manager-routes.ts
- manager-structured-memory-search.ts
- noTmuxServer
- ManagerStructuredMemoryRuntime
- compilerOptions
- .toolHost
- cleanDialogLine
- SettingsProfileClient
- manager-context.ts
- capture-workspace.ts
- oracle-voice-tickets.ts
- terminal-session.test.ts
- ManagerAssistant.test.tsx
- full-gate.test.ts
- session-reply-durability.test.ts
- PromptCards.tsx
- compilerOptions
- session-resource-clear.test.ts
- OnlineRecognizer
- compilerOptions
- compilerOptions
- BackgroundTaskSnapshot
- dreamer-service.ts
- ManagerMemory
- ManagerProactiveInbox
- .observe
- session-knowledge-store.ts
- settings-profile-store.ts
- dreamer-schedule.ts
- KnowledgeStore
- SessionKnowledgeStore
- BoundedQueue
- ReaderWorkspace
- knowledge-store.ts
- session-knowledge-routes.ts
- SoakManager
- session-latency-benchmark.ts
- VoiceTurnState
- promotion-monitor.test.ts
- recovery-resend-durability.test.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- NewSessionDialog
- terminal-form-deadline.test.ts
- scripts
- registerSessionKnowledgeRoutes
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- session-response-order.ts
- Pcm16Resampler
- dreamer-routes.ts
- manager-proactive-inbox.test.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- settings-profile.test.ts
- dataset
- generate-pwa-icons.ts
- ManagerProactiveInboxValidationError
- manager-structured-memory-performance.test.ts
- .persist
- bridge.rs
- DreamerMorningPlan
- screenshot-stability.test.ts
- promotion-setup-execution.test.ts
- SessionAdmissions
- session-knowledge-store.test.ts
- voice-recorder.ts
- vite.config.ts
- KnowledgePosition
- package.json
- recovery-context.ts
- release-publication.test.ts
- render-workspace-gifs.ts
- dreamer-service.test.ts
- history-projection.test.ts
- SessionStatus
- settings-profile-routes.ts
- settings.ts
- .transport
- composer-layout.test.ts
- usePanelWidth
- promotion-setup.test.ts
- HubEventSource
- push-routes.ts
- removeComputer
- FakeRecorder
- dispatchAuthoritativeRefresh
- terminal-send-uncertainty.test.ts
- OracleVoiceBackendConnection
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
- OperationTimeoutError
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 309 edges
2. `AgentService` - 282 edges
3. `App()` - 278 edges
4. `SessionStore` - 189 edges
5. `ClaudeAgentService` - 126 edges
6. `ManagedSession` - 110 edges
7. `ManagerAgent` - 97 edges
8. `registerHubRoutes()` - 96 edges
9. `buildApp()` - 95 edges
10. `ComputerManager` - 89 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (221 total, 26 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (22): agentMode(), AgentService, isTerminalNotReadyRefusal(), isUncertainDelivery(), normalizedTitle(), suspendedRuntimeConflict(), terminalAnswerRefused(), explicitlyRefused() (+14 more)

### Community 1 - "SessionDetail"
Cohesion: 0.03
Nodes (84): storage(), fixture(), restart(), fixture(), connect(), createStore(), enqueue(), fixture() (+76 more)

### Community 2 - "App"
Cohesion: 0.03
Nodes (144): isManagerEvent(), alertNotification(), terminalSendOptions(), askSession(), cancelSession(), clearConversation(), deleteSession(), getSession() (+136 more)

### Community 3 - "contracts.ts"
Cohesion: 0.03
Nodes (69): ClaudeAgentServiceEvents, directories, FakeSessionService, routingFixture(), session(), temporaryDirectory(), voiceControlQueues, voiceControlWaiters (+61 more)

### Community 4 - "api.ts"
Cohesion: 0.03
Nodes (112): SettingsChange, SettingsProfileKey, SettingsProfileValues, addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), configureRetention(), configureRuntime() (+104 more)

### Community 5 - "App.tsx"
Cohesion: 0.02
Nodes (113): AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+105 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.04
Nodes (90): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+82 more)

### Community 7 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (26): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+18 more)

### Community 8 - "agent-service.test.ts"
Cohesion: 0.02
Nodes (62): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+54 more)

### Community 9 - "app.ts"
Cohesion: 0.03
Nodes (70): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+62 more)

### Community 10 - "claude-agent-service.ts"
Cohesion: 0.05
Nodes (72): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+64 more)

### Community 11 - "client.ts"
Cohesion: 0.05
Nodes (38): ManagerClientDefaults, ORACLE_VOICE_CONNECTION_TIMEOUT_MS, ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, VoiceCapabilities, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError() (+30 more)

### Community 12 - "FakeVoiceEngine"
Cohesion: 0.04
Nodes (41): apps, directories, voiceBackend(), FakeVoiceEngine, FakeVoiceEngineCall, FakeVoiceEngineFactory, identityKey(), isCancelled() (+33 more)

### Community 13 - "SessionService"
Cohesion: 0.04
Nodes (7): nodeVoiceCapabilities(), registerNodeRoutes(), ProviderSessionService, obstructUploads(), SessionService, WorkspaceFile, WorkspaceFileIcon()

### Community 14 - "ManagedSession"
Cohesion: 0.08
Nodes (19): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, ManagerEventSource, registerHubRoutes(), SessionMuteCarrier (+11 more)

### Community 15 - "background-task-adapter.ts"
Cohesion: 0.05
Nodes (74): DeferredSession, addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText() (+66 more)

### Community 16 - "manager-tools.ts"
Cohesion: 0.05
Nodes (45): uniqueManagerSessionRefs(), APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), proactiveSessionAllowed(), requireComputer() (+37 more)

### Community 17 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 18 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (41): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+33 more)

### Community 19 - "ManagerAgent"
Cohesion: 0.08
Nodes (12): FakeVoiceState, checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+4 more)

### Community 20 - "VoiceClientControl"
Cohesion: 0.06
Nodes (25): VoiceClientControl, BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl (+17 more)

### Community 21 - "terminal-session.ts"
Cohesion: 0.05
Nodes (69): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerHoldsOtherText() (+61 more)

### Community 22 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 23 - "oracle-voice-soak.ts"
Cohesion: 0.06
Nodes (33): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+25 more)

### Community 24 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (44): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+36 more)

### Community 25 - "sessionKey"
Cohesion: 0.06
Nodes (55): saveSessionOrderLane(), failureStampFor(), handleDragEnd(), readSelectionFromLocation(), RenameSessionDialog(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers() (+47 more)

### Community 26 - "hub-routes.ts"
Cohesion: 0.05
Nodes (46): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+38 more)

### Community 27 - "manager-agent.ts"
Cohesion: 0.05
Nodes (33): automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession (+25 more)

### Community 28 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+23 more)

### Community 29 - "ManagerStore"
Cohesion: 0.06
Nodes (16): openStore(), JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), emptyState(), JournalDraft, JournalEntry (+8 more)

### Community 30 - "node-routes.ts"
Cohesion: 0.04
Nodes (44): ActiveBackendSession, installFakeBrowserVoice(), ScriptedUtterance, Window, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket() (+36 more)

### Community 31 - "tmux-errors.integration.test.ts"
Cohesion: 0.05
Nodes (36): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+28 more)

### Community 32 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (15): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, client(), servers, session, RemoteNodeCapabilityError (+7 more)

### Community 33 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 34 - "session-directory.ts"
Cohesion: 0.08
Nodes (40): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath() (+32 more)

### Community 35 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (43): executeCommand(), listWorkspace(), readWorkspaceFile(), searchWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit() (+35 more)

### Community 36 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (40): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+32 more)

### Community 37 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (41): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 38 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (16): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), QueuedOutput (+8 more)

### Community 39 - "TerminalSessionController"
Cohesion: 0.08
Nodes (10): persistedFormAnswer(), removeCopilotSessionFiles(), TerminalFormContinuation, validateUserInputForm(), forgetSessionEvents(), TerminalFormReplyError, TerminalSessionController, PendingPermission (+2 more)

### Community 40 - "OracleVoiceCoordinator"
Cohesion: 0.12
Nodes (3): errorMessage(), OracleVoiceCoordinator, withTimeout()

### Community 41 - "DreamerService"
Cohesion: 0.13
Nodes (10): DreamerMemoryMetadata, digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate (+2 more)

### Community 42 - "oracle-voice.ts"
Cohesion: 0.09
Nodes (36): capabilities, closeServers, exactArrayBuffer(), sockets, startFields, VoiceNode, decodeVoiceAudioFrame(), encodeVoiceAudioFrame() (+28 more)

### Community 43 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (17): startAgentAfterClear(), copilotCommand(), formReplyExpired(), processAncestors(), processCommand(), processIsAlive(), safeWindowName(), terminalFormReplyBudget() (+9 more)

### Community 44 - "manager.ts"
Cohesion: 0.07
Nodes (34): ManagerState, RuntimeModelOption, ManagerCheckCadenceMinutes, managerCheckCadences, ManagerConfirmation, ManagerMessageRole, ManagerMessageState, ManagerProactiveSettings (+26 more)

### Community 45 - "oracle-voice-coordinator.ts"
Cohesion: 0.06
Nodes (29): AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput (+21 more)

### Community 46 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 47 - "send-matrix.integration.test.ts"
Cohesion: 0.07
Nodes (39): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+31 more)

### Community 48 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 49 - "oracle-voice-routes.ts"
Cohesion: 0.09
Nodes (35): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+27 more)

### Community 50 - "terminal-startup-queue.test.ts"
Cohesion: 0.11
Nodes (35): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, client(), disk (+27 more)

### Community 51 - "FakeVoiceController"
Cohesion: 0.09
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 52 - "ResidentVoiceWorker"
Cohesion: 0.13
Nodes (9): combinedTranscript(), matchesCancelled(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceGenerationIdentity, VoiceSynthesisRequest, ActiveSynthesisIdentity (+1 more)

### Community 53 - "pwa.ts"
Cohesion: 0.09
Nodes (38): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+30 more)

### Community 54 - "VoicePlayback"
Cohesion: 0.10
Nodes (11): pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio(), validateGeneration() (+3 more)

### Community 55 - "normalizeKnowledgeRelativePath"
Cohesion: 0.09
Nodes (30): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+22 more)

### Community 56 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (39): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isAlreadyExists() (+31 more)

### Community 57 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 58 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 59 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 60 - "dreamer-planner.ts"
Cohesion: 0.10
Nodes (35): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+27 more)

### Community 61 - "oracle-voice-worker.ts"
Cohesion: 0.07
Nodes (26): VoiceEndUtterance, VoiceStartUtterance, VoiceSttEngine, VoiceTtsEngine, VoiceUtteranceAudioFrame, BlockingEngine, BlockingEngine, capabilityFromConfig() (+18 more)

### Community 62 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 63 - "ChildVoiceEngine"
Cohesion: 0.13
Nodes (6): benchmarkGroup(), ChildVoiceEngine, errorMessage(), matchesSynthesis(), matchesUtterance(), VoiceChildProcess

### Community 64 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 65 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 66 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (26): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+18 more)

### Community 67 - "manager-store.ts"
Cohesion: 0.11
Nodes (14): DreamerServiceOptions, batchMessageId(), isTerminal(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, directories, fixture(), managed() (+6 more)

### Community 68 - "oracle-voice-child.ts"
Cohesion: 0.08
Nodes (29): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), float32ToPcm16() (+21 more)

### Community 69 - "execFileAsync"
Cohesion: 0.15
Nodes (24): activeBottomFrame(), captureBeforeDeadline(), capturePane(), clearAutomaticStartupPrompts(), desktopInstallPromptIdentity(), endProbeSession(), execFileAsync, findTerminalWrappedText() (+16 more)

### Community 70 - "ManagerEvent"
Cohesion: 0.10
Nodes (23): ManagerEventSource, OracleVoiceCoordinatorOptions, brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories (+15 more)

### Community 71 - "ManagerAssistant.tsx"
Cohesion: 0.10
Nodes (28): cancelManager(), editQueuedManagerMessage(), resetManager(), phoneEnterCreatesNewline(), applyEvent(), canTakeFocus(), conversationStateLabel(), ManagerAssistant() (+20 more)

### Community 72 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 73 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 74 - "EnabledOracleVoiceConfig"
Cohesion: 0.09
Nodes (14): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+6 more)

### Community 75 - "ManagerStructuredMemoryStore"
Cohesion: 0.15
Nodes (11): capturePrompt(), digest(), isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, open() (+3 more)

### Community 76 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 77 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+24 more)

### Community 78 - "active-sessions.ts"
Cohesion: 0.12
Nodes (30): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+22 more)

### Community 79 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+20 more)

### Community 80 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (20): SocketMessage, apps, config, configFixture(), connect(), createManager(), Inbox, issueTicket() (+12 more)

### Community 81 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (31): AccentSetting, appearanceSettings, applySettingsChanges(), applySettingsImport(), isRecord(), isSettingsProfileKey(), NewSessionBackendSetting, newSessionBackendSettings (+23 more)

### Community 82 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 83 - "OracleDreamer.tsx"
Cohesion: 0.14
Nodes (23): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition, getDreamer() (+15 more)

### Community 84 - "ManagerSnapshot"
Cohesion: 0.08
Nodes (5): FakeManager, ProactiveManager, FakeAgent, FakeManager, ManagerSnapshot

### Community 85 - "remote-voice-client.ts"
Cohesion: 0.18
Nodes (11): VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient (+3 more)

### Community 86 - "HubEvent"
Cohesion: 0.12
Nodes (15): Connection, WorkspaceFixture, ComputerManagerEvents, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset (+7 more)

### Community 87 - "react"
Cohesion: 0.10
Nodes (17): react, DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel() (+9 more)

### Community 88 - "session-store-providers.test.ts"
Cohesion: 0.09
Nodes (10): RuntimeConfigurationError, claude(), clearFixture(), copilot(), disk, event(), fixtures, releases (+2 more)

### Community 89 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 90 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 91 - "PushNotificationService"
Cohesion: 0.20
Nodes (3): PushNotificationService, scoped(), registerPushRoutes()

### Community 92 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (22): AppearanceSetting, isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, statuslineItems, Appearance, appearanceFrom() (+14 more)

### Community 93 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 94 - "session-enqueue-clear.test.ts"
Cohesion: 0.10
Nodes (21): ClaudeSdk, deferred(), disk, fixtures, holdClaimWrite(), releases, deferred(), disk (+13 more)

### Community 95 - "manager-routes.ts"
Cohesion: 0.11
Nodes (17): confirmationSchema, defaultsSchema, editSchema, effort, managerCadence, managerInputError(), ManagerRouteAgent, messageParams (+9 more)

### Community 96 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 97 - "noTmuxServer"
Cohesion: 0.11
Nodes (16): listTmuxSessions(), noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files (+8 more)

### Community 98 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.13
Nodes (14): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+6 more)

### Community 99 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 100 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 101 - "cleanDialogLine"
Cohesion: 0.17
Nodes (20): cleanDialogLine(), containsCopiedInteractiveFrame(), FormReplyDeadlineError, hasClippedTerminalFormFooter(), hasClippedTerminalFormTabs(), hasComposerAfter(), hasTerminalFormQuestionReflowCandidate(), isTerminalLoading() (+12 more)

### Community 102 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 103 - "manager-context.ts"
Cohesion: 0.16
Nodes (19): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+11 more)

### Community 104 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 105 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 106 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (16): parseTerminalUpdateNotice(), terminalFormCommitKeys(), bracketedTabPane, desktopInstallPane, directories, downloadedUpdateFooter, folderTrustPane, formPaneFirstField (+8 more)

### Community 107 - "ManagerAssistant.test.tsx"
Cohesion: 0.10
Nodes (14): removeQueuedManagerMessage(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator (+6 more)

### Community 108 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 109 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 110 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 111 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 112 - "session-resource-clear.test.ts"
Cohesion: 0.13
Nodes (12): apps, directories, directory(), pairedFixture(), providerFixture(), providers, seed(), sockets (+4 more)

### Community 113 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 114 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 115 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 116 - "BackgroundTaskSnapshot"
Cohesion: 0.18
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 117 - "dreamer-service.ts"
Cohesion: 0.16
Nodes (17): DreamerPlanDraft, DreamerPlannerInput, boundedText(), DreamerPlannerExecutionInput, safeRunError(), unavailableSnapshot(), DreamerCoverageIncrement, DreamerPlanWithFingerprints (+9 more)

### Community 118 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 119 - "ManagerProactiveInbox"
Cohesion: 0.24
Nodes (3): ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 120 - ".observe"
Cohesion: 0.19
Nodes (7): ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 121 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (18): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+10 more)

### Community 122 - "settings-profile-store.ts"
Cohesion: 0.20
Nodes (9): profileStore(), SettingsProfileState, SettingsProfileStore, directories, store(), isSettingsDeviceId(), SettingsProfileRecord, SettingsProfileSnapshot (+1 more)

### Community 123 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 125 - "SessionKnowledgeStore"
Cohesion: 0.26
Nodes (3): bindingKey(), SessionKnowledgeStore, SessionKnowledgeBinding

### Community 126 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 127 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 128 - "knowledge-store.ts"
Cohesion: 0.13
Nodes (12): WorkspaceFixtureState, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, parseMetadata() (+4 more)

### Community 129 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 131 - "session-latency-benchmark.ts"
Cohesion: 0.23
Nodes (15): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+7 more)

### Community 133 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 134 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 135 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 136 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 137 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession() (+8 more)

### Community 138 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 139 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 140 - "registerSessionKnowledgeRoutes"
Cohesion: 0.29
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 141 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 142 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 143 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 144 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 145 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 146 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 147 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 148 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 149 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 150 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 151 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 152 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 153 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 154 - "settings-profile.test.ts"
Cohesion: 0.20
Nodes (4): settingsProfileCacheKey, SettingsProfileTransport, cached(), MemoryStorage

### Community 155 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 156 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 157 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 158 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.27
Nodes (7): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult, submitSearch()

### Community 159 - ".persist"
Cohesion: 0.24
Nodes (3): SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, stateWithPaths()

### Community 160 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 161 - "DreamerMorningPlan"
Cohesion: 0.38
Nodes (10): DreamerMorningPlan(), confirmCompletion(), confirmTaskCompletion(), dispatchTask(), disposition(), edit(), investigate(), move() (+2 more)

### Community 162 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 163 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 165 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 166 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 167 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 168 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 169 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 170 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 171 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 172 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 174 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 175 - "SessionStatus"
Cohesion: 0.29
Nodes (7): ManagerProactiveInboxObservation, PersistedCursor, SessionOrigin, Row, SdkRestartRecovery, SessionStatus, PendingEchoOwner

### Community 176 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 177 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 179 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 180 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 181 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 183 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 184 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 186 - "dispatchAuthoritativeRefresh"
Cohesion: 0.60
Nodes (4): AuthoritativeRefreshRequest, dispatchAuthoritativeRefresh(), requestCoordinatedAuthoritativeRefresh(), settleAuthoritativeRefresh()

## Knowledge Gaps
- **1163 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1158 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1959 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `session-directory.ts`, `contracts.ts`, `agent-service.ts`, `TerminalSessionController`, `agent-service.test.ts`, `claude-agent-service.ts`, `background-task-adapter.ts`, `session-store-providers.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ManagerAgent` connect `ManagerAgent` to `ManagerStructuredMemoryRuntime`, `contracts.ts`, `.toolHost`, `FakeVoiceEngine`, `manager.ts`, `manager-tools.ts`, `manager-agent.ts`, `ManagerStore`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `claude-agent-service.ts`, `agent-service.ts`, `TerminalSessionController`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1163 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.033191519285538484 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.02873778110143689 - nodes in this community are weakly interconnected._
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
- `docs/superpowers/plans/2026-11-04-oracle-periodic-checks.md`
- `docs/superpowers/plans/2026-11-05-session-knowledge-api.md`
- `docs/superpowers/plans/2026-11-06-oracle-actionable-morning-plan.md`
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-17-oracle-proactive-lifecycle-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
- `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`
- `docs/superpowers/specs/2026-11-04-oracle-periodic-checks-design.md`
- `docs/superpowers/specs/2026-11-05-session-knowledge-api-design.md`
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
