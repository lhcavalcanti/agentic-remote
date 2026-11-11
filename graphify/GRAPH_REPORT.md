# Agentic Remote - Graphify code map

Snapshot: `79f02e404074ec146414ab021777f8ab15335c60dee6de0389487ae52f654a89`

Source checkout: `3def9eaefae5548b4df658a8069693f54609ff16`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 418 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 418 files · ~896,662 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7279 nodes · 20225 edges · 216 communities (178 shown, 22 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1061 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionDetail
- App
- manager-agent.ts
- contracts.ts
- App.tsx
- agent-service.ts
- ClaudeAgentService
- App.test.tsx
- SessionService
- CopilotClientLike
- app.ts
- claude-agent-service.ts
- node-routes.ts
- oracle-voice.ts
- agentic-remote-promotion-monitor
- oracle-voice-child.ts
- dreamer-store.ts
- oracle-voice-soak.ts
- oracle-voice-coordinator.ts
- ManagedSession
- oracle-voice-session.ts
- ManagerAgent
- workspace-fixtures.ts
- oracle-voice-integration.test.ts
- FakeVoiceEngine
- terminal-session.ts
- markdown-navigation.ts
- queued-dispatch.test.ts
- PushNotificationService
- transcription-service.ts
- oracle-task-store.ts
- OracleVoiceCoordinator
- ManagerAssistant.tsx
- oracle-voice-worker.ts
- session-presentation.ts
- client.ts
- manager-structured-memory-validation.ts
- tmux-test-helpers.ts
- active-sessions.ts
- session-knowledge-routes.test.ts
- TmuxTerminalSessionController
- session-knowledge-store.ts
- OracleDreamer.tsx
- ManagerMessage
- session-directory.ts
- dreamer-progress.ts
- send-matrix.integration.test.ts
- capture.ts
- agentic-remote
- DreamerService
- oracle-voice-benchmark.ts
- TerminalSessionController
- bundle
- .sendInternal
- FakeVoiceController
- shared/settings-profile.ts
- pwa.ts
- src/settings-profile.ts
- oracle-voice-config.ts
- manager-proactive-inbox.ts
- client.test.ts
- VoicePlayback
- api.ts
- shell.ts
- lib.rs
- .toolHost
- VoiceCapture
- agentic-remote-promotion-setup
- hub-routes.ts
- createManagerTools
- knowledge-tree.ts
- agentic-remote-gate
- config.rs
- manager-structured-memory.ts
- FakeSessionService
- dreamer-planner.ts
- KnowledgeStore
- dependencies
- devDependencies
- ManagerStructuredMemoryStore
- oracle-voice-child.test.ts
- EngineVoiceBackendSession
- oracle-voice-segments.ts
- capture-workspace.ts
- background-task-adapter.ts
- ManagerProactiveCoordinator
- VoiceCapabilities
- remote-voice-client.ts
- SessionOrderStore
- terminal-session.test.ts
- session-store-providers.test.ts
- dreamer-service.ts
- oracle-voice-security.test.ts
- manager-structured-memory-search.ts
- manager-tools.ts
- session-patch-browser.ts
- cli-canary.ts
- scripts
- ChatMessage
- registerSessionKnowledgeRoutes
- compilerOptions
- recovery-resend-durability.test.ts
- SettingsProfileClient
- startup-phases.test.ts
- .observe
- ManagerProactiveInbox
- oracle-voice-tickets.ts
- ManagerSnapshot
- compilerOptions
- full-gate.test.ts
- session-reply-durability.test.ts
- .withFormViewport
- compilerOptions
- SessionStatus
- SessionKnowledgeBinding
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- normalizeKnowledgeRelativePath
- react
- backgroundTasksFromEvents
- dreamer-schedule.ts
- promotion-monitor.test.ts
- terminal-startup-queue.test.ts
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- NewSessionDialog
- SettingsProfileStore
- terminal-form-deadline.test.ts
- recordValue
- server/session-patches.ts
- session-resource-routes.test.ts
- scripts
- background-task-stop.test.ts
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- BackgroundTasksDialog.tsx
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- background-task-tracker.ts
- session-resource-clear.test.ts
- OracleSettings.tsx
- session-response-order.ts
- DeferredSession
- dreamer-routes.ts
- dreamer-service.test.ts
- html-preview.ts
- manager-tools.test.ts
- define
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- manager-structured-memory-performance.test.ts
- session-enqueue-clear.test.ts
- bridge.rs
- transcribeAudio
- promotion-setup-execution.test.ts
- SessionAdmissions
- vite.config.ts
- sign-in-expired.pw.ts
- package.json
- resolveSession
- release-publication.test.ts
- UserInputFieldControl
- render-workspace-gifs.ts
- history-projection.test.ts
- recovery-context.ts
- settings-profile-routes.ts
- settings.ts
- .transport
- composer-layout.test.ts
- usePanelWidth
- promotion-setup.test.ts
- SessionKnowledgeLifecycle
- removeComputer
- FakeRecorder
- .pending
- version-policy.test.ts
- MermaidDiagram.test.tsx
- OracleVoiceCapture
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
1. `SessionDetail` - 310 edges
2. `App()` - 306 edges
3. `AgentService` - 290 edges
4. `SessionStore` - 190 edges
5. `ClaudeAgentService` - 126 edges
6. `ManagedSession` - 124 edges
7. `ManagerAgent` - 98 edges
8. `buildApp()` - 96 edges
9. `registerHubRoutes()` - 96 edges
10. `ComputerManager` - 89 edges

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

## Communities (216 total, 22 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (17): agentMode(), AgentService, isTerminalNotReadyRefusal(), isUncertainDelivery(), lifecycleRefusal(), suspendedRuntimeConflict(), suspendRefused(), terminalAnswerRefused() (+9 more)

### Community 1 - "SessionDetail"
Cohesion: 0.03
Nodes (88): fixture(), restart(), PendingClaudeReply, connect(), createStore(), deferred(), disk, enqueue() (+80 more)

### Community 2 - "App"
Cohesion: 0.03
Nodes (169): isManagerEvent(), askSession(), clearConversation(), moveSessionToTmux(), recoverConversation(), reorderQueuedPrompts(), replyPermission(), saveSessionVisibility() (+161 more)

### Community 3 - "manager-agent.ts"
Cohesion: 0.03
Nodes (96): ComputerManagerEvents, DreamerProgressView, DreamerServiceOptions, ManagerAgentOptions, ManagerSdkEvent, ManagerSdkSessionConfig, Rung, Behavior (+88 more)

### Community 4 - "contracts.ts"
Cohesion: 0.03
Nodes (69): ClaudeAgentServiceEvents, RemoteResync, RemoteSessionRead, DirectoryScope, directories, voiceControlQueues, voiceControlWaiters, ProviderSessionServiceEvents (+61 more)

### Community 5 - "App.tsx"
Cohesion: 0.02
Nodes (125): ActivityStatus, SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH, SIDE_QUESTION_EARLIER_LIMIT, SIDE_QUESTION_MAX_LENGTH, configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage() (+117 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.03
Nodes (90): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+82 more)

### Community 7 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (30): ClaudeAgentService, ClaudeSdk, isClaudeAuthenticationError(), isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle() (+22 more)

### Community 8 - "App.test.tsx"
Cohesion: 0.03
Nodes (89): addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), checkHubSignIn(), configureRetention(), createOracleVoiceTicket(), deleteKnowledgeRoot() (+81 more)

### Community 9 - "SessionService"
Cohesion: 0.04
Nodes (7): BuildAppOptions, registerNodeRoutes(), ProviderSessionService, SessionService, StartupPhases, WorkspaceFile, WorkspaceListing

### Community 10 - "CopilotClientLike"
Cohesion: 0.03
Nodes (50): CopilotClientLike, CopilotSessionLike, foregroundTurnOpen(), normalizedTitle(), holdProbe(), fixtures, gate(), releases (+42 more)

### Community 11 - "app.ts"
Cohesion: 0.04
Nodes (63): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence (+55 more)

### Community 12 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (65): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, RemoteSessionListing (+57 more)

### Community 13 - "node-routes.ts"
Cohesion: 0.03
Nodes (55): ActiveBackendSession, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, execFileAsync, RealVoiceState, AUDIO_FILENAME_HEADER (+47 more)

### Community 14 - "oracle-voice.ts"
Cohesion: 0.05
Nodes (69): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+61 more)

### Community 15 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 16 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (40): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+32 more)

### Community 17 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (43): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+35 more)

### Community 18 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 19 - "oracle-voice-coordinator.ts"
Cohesion: 0.04
Nodes (44): ManagerEventSource, ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError (+36 more)

### Community 20 - "ManagedSession"
Cohesion: 0.10
Nodes (11): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, ManagerProactiveCoordinatorOptions, FakeManager (+3 more)

### Community 21 - "oracle-voice-session.ts"
Cohesion: 0.04
Nodes (32): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+24 more)

### Community 22 - "ManagerAgent"
Cohesion: 0.08
Nodes (14): automaticPayload(), checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, messagePriority() (+6 more)

### Community 23 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (47): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+39 more)

### Community 24 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (34): ManagerSdkSession, apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+26 more)

### Community 25 - "FakeVoiceEngine"
Cohesion: 0.05
Nodes (30): voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngine, FakeVoiceEngineCall, FakeVoiceEngineFactory, identityKey(), isCancelled(), sameGeneration() (+22 more)

### Community 26 - "terminal-session.ts"
Cohesion: 0.05
Nodes (63): composer(), processAdapter, boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus() (+55 more)

### Community 27 - "markdown-navigation.ts"
Cohesion: 0.05
Nodes (55): UserInputField, UserInputFieldValue, executeCommand(), listWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit() (+47 more)

### Community 28 - "queued-dispatch.test.ts"
Cohesion: 0.04
Nodes (36): sessionInUseConflictMessage(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), QueuedDelivery (+28 more)

### Community 29 - "PushNotificationService"
Cohesion: 0.07
Nodes (29): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+21 more)

### Community 30 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionMultipartOptions (+27 more)

### Community 31 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (44): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+36 more)

### Community 32 - "OracleVoiceCoordinator"
Cohesion: 0.09
Nodes (5): errorMessage(), OracleVoiceCoordinator, withTimeout(), VoiceTurnState, VoiceClientControl

### Community 33 - "ManagerAssistant.tsx"
Cohesion: 0.06
Nodes (46): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline() (+38 more)

### Community 34 - "oracle-voice-worker.ts"
Cohesion: 0.07
Nodes (28): benchmarkGroup(), VoiceEndUtterance, VoiceStartUtterance, BlockingEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine (+20 more)

### Community 35 - "session-presentation.ts"
Cohesion: 0.07
Nodes (50): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+42 more)

### Community 36 - "client.ts"
Cohesion: 0.10
Nodes (19): captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceClient (+11 more)

### Community 37 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 38 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (47): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, [root], assertSameIdentity() (+39 more)

### Community 39 - "active-sessions.ts"
Cohesion: 0.07
Nodes (49): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+41 more)

### Community 40 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (30): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+22 more)

### Community 41 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (15): startAgentAfterClear(), afterExit(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors() (+7 more)

### Community 42 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (28): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+20 more)

### Community 43 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (41): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition (+33 more)

### Community 44 - "ManagerMessage"
Cohesion: 0.07
Nodes (18): FakeManager, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams (+10 more)

### Community 45 - "session-directory.ts"
Cohesion: 0.10
Nodes (36): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+28 more)

### Community 46 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 47 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (42): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+34 more)

### Community 48 - "capture.ts"
Cohesion: 0.06
Nodes (21): BufferedFrame, defaultAudioContext(), positiveLimit(), CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode, VoiceVad (+13 more)

### Community 49 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 50 - "DreamerService"
Cohesion: 0.14
Nodes (6): digest(), DreamerService, DreamerUnavailableError, uniqueSessionRefs(), DreamerSnapshot, OracleTaskAttempt

### Community 51 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (38): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, deferred() (+30 more)

### Community 52 - "TerminalSessionController"
Cohesion: 0.08
Nodes (8): persistedFormAnswer(), removeCopilotSessionFiles(), TerminalFormContinuation, validateUserInputForm(), forgetSessionEvents(), TerminalFormReplyError, TerminalSessionController, PendingUserInput

### Community 53 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 54 - ".sendInternal"
Cohesion: 0.12
Nodes (37): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), composerHoldsOtherText(), composerHoldsText() (+29 more)

### Community 55 - "FakeVoiceController"
Cohesion: 0.09
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 56 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (39): WorkspaceFixtureState, SettingsProfileState, AccentSetting, appearanceSettings, applySettingsChanges(), applySettingsImport(), DEFAULT_SESSION_PROVIDER, isRecord() (+31 more)

### Community 57 - "pwa.ts"
Cohesion: 0.09
Nodes (38): AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+30 more)

### Community 58 - "src/settings-profile.ts"
Cohesion: 0.07
Nodes (30): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileSnapshot, SettingsProfileValues (+22 more)

### Community 59 - "oracle-voice-config.ts"
Cohesion: 0.08
Nodes (29): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+21 more)

### Community 60 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (38): assertExactKeys(), canonicalHash(), DISPOSITIONS, emptyState(), EVENT_KINDS, eventId(), hasExactKeys(), isEventKind() (+30 more)

### Community 61 - "client.test.ts"
Cohesion: 0.07
Nodes (12): defaultDependencies(), HUB_SIGN_IN_EXPIRED_MESSAGE, OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket (+4 more)

### Community 62 - "VoicePlayback"
Cohesion: 0.10
Nodes (11): pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio(), validateGeneration() (+3 more)

### Community 63 - "api.ts"
Cohesion: 0.09
Nodes (34): AddComputerInput, AddKnowledgeRootInput, ManagedQueuedPromptDispatchResult, PushSettings, SessionKnowledgeRootMutationInput, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary (+26 more)

### Community 64 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 65 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 66 - ".toolHost"
Cohesion: 0.07
Nodes (5): ManagerHub, ManagerSdkClient, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 67 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 68 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 69 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 70 - "createManagerTools"
Cohesion: 0.09
Nodes (8): busyReason(), createManagerTools(), closeCapReached(), deliver(), steer(), whyCloseMustAsk(), describeField(), ManagerToolHost

### Community 71 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (35): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+27 more)

### Community 72 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 73 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 74 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (30): ManagerStructuredMemorySearchIndex, ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES (+22 more)

### Community 75 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 76 - "dreamer-planner.ts"
Cohesion: 0.11
Nodes (33): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+25 more)

### Community 77 - "KnowledgeStore"
Cohesion: 0.12
Nodes (14): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+6 more)

### Community 78 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 79 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 80 - "ManagerStructuredMemoryStore"
Cohesion: 0.15
Nodes (10): digest(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult (+2 more)

### Community 81 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 82 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 83 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 84 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 85 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (27): attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, booleanValue(), CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress (+19 more)

### Community 86 - "ManagerProactiveCoordinator"
Cohesion: 0.16
Nodes (7): batchMessageId(), isTerminal(), lifecycles(), ManagerProactiveCoordinator, fixture(), managed(), ManagerProactiveInboxEvent

### Community 87 - "VoiceCapabilities"
Cohesion: 0.11
Nodes (14): VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability (+6 more)

### Community 88 - "remote-voice-client.ts"
Cohesion: 0.17
Nodes (12): VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient (+4 more)

### Community 89 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 90 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (24): parseTerminalUpdateNotice(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), deliveryFixture(), desktopInstallPane, directories (+16 more)

### Community 91 - "session-store-providers.test.ts"
Cohesion: 0.09
Nodes (12): RuntimeConfigurationError, claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures (+4 more)

### Community 92 - "dreamer-service.ts"
Cohesion: 0.12
Nodes (23): DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), boundedText(), DreamerPlannerExecutionInput, planWithFingerprints(), publicSnapshot() (+15 more)

### Community 93 - "oracle-voice-security.test.ts"
Cohesion: 0.09
Nodes (16): apps, config, configFixture(), createManager(), issueTicket(), localRuntime(), otherAllowed, requestJson() (+8 more)

### Community 94 - "manager-structured-memory-search.ts"
Cohesion: 0.13
Nodes (23): DreamerMemoryMetadataRecord, authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord() (+15 more)

### Community 95 - "manager-tools.ts"
Cohesion: 0.08
Nodes (26): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, computerField, ContextTier, trustFolder(), CreationRefusal, DECLINE_WORDS (+18 more)

### Community 96 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 97 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 98 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 99 - "ChatMessage"
Cohesion: 0.14
Nodes (12): Connection, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset, StoredSession, ChatMessage (+4 more)

### Community 100 - "registerSessionKnowledgeRoutes"
Cohesion: 0.14
Nodes (21): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+13 more)

### Community 101 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 102 - "recovery-resend-durability.test.ts"
Cohesion: 0.09
Nodes (18): directories, fakeClient(), fixture(), ForkRequest, forkSession(), services, directories, disk (+10 more)

### Community 103 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 104 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (13): phases, port, createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address (+5 more)

### Community 105 - ".observe"
Cohesion: 0.16
Nodes (9): cloneState(), isDisposition(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId() (+1 more)

### Community 106 - "ManagerProactiveInbox"
Cohesion: 0.20
Nodes (6): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 107 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 108 - "ManagerSnapshot"
Cohesion: 0.11
Nodes (5): isPending(), isQueued(), ProactiveManager, FakeManager, ManagerSnapshot

### Community 109 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 110 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 111 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 112 - ".withFormViewport"
Cohesion: 0.17
Nodes (15): FormReplyDeadlineError, hasClippedTerminalFormFooter(), hasClippedTerminalFormTabs(), hasTerminalFormQuestionReflowCandidate(), isTerminalLoading(), parseTerminalFormActiveField(), submitTerminalForm(), tabNames() (+7 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 114 - "SessionStatus"
Cohesion: 0.11
Nodes (15): DreamerProgressEntry, Seen, ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, PersistedCursor, fsHooks, ReadGate, readState() (+7 more)

### Community 115 - "SessionKnowledgeBinding"
Cohesion: 0.18
Nodes (14): SessionKnowledgeEvents, SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey() (+6 more)

### Community 116 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 117 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 118 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 119 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 120 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 121 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 122 - "react"
Cohesion: 0.15
Nodes (10): react, SessionRetention, SessionRetentionPatch, MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram(), drawing (+2 more)

### Community 123 - "backgroundTasksFromEvents"
Cohesion: 0.18
Nodes (18): backgroundTasksFromEvents(), eventString(), eventTask(), executionModeValue(), isLiveTaskStatus(), isOlderExecution(), isShellObserverTool(), isShellStopTool() (+10 more)

### Community 124 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 125 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 126 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (10): client(), delayQueueWrite(), disk, exec, gate(), holdQueueCommit(), NativeFixture, NativeRuntime (+2 more)

### Community 127 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 128 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 129 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 130 - "NewSessionDialog"
Cohesion: 0.18
Nodes (17): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+9 more)

### Community 131 - "SettingsProfileStore"
Cohesion: 0.18
Nodes (8): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileStore, directories, store()

### Community 132 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 133 - "recordValue"
Cohesion: 0.22
Nodes (16): addActivity(), boundedText(), errorValue(), notificationKind(), parsedValue(), recordValue(), shellExitFromValue(), shellIdFromValue() (+8 more)

### Community 134 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 135 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 136 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 137 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 138 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 139 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 140 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 141 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 142 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 143 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 144 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 145 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 146 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (7): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 147 - "session-resource-clear.test.ts"
Cohesion: 0.21
Nodes (12): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+4 more)

### Community 148 - "OracleSettings.tsx"
Cohesion: 0.23
Nodes (11): getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps, models (+3 more)

### Community 149 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 151 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 153 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 154 - "manager-tools.test.ts"
Cohesion: 0.20
Nodes (5): ManagerTool, claudeModels, computers, copilotModels, RuntimeModelOption

### Community 155 - "define"
Cohesion: 0.20
Nodes (7): define(), requireComputer(), structuredTools(), errorMessage(), failure(), localComputer(), ToolFailure

### Community 156 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 157 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 158 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 159 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.27
Nodes (7): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemorySearchResult, searchWorkspace(), submitSearch()

### Community 160 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 161 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 162 - "transcribeAudio"
Cohesion: 0.29
Nodes (4): transcribeAudio(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 163 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 165 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 166 - "sign-in-expired.pw.ts"
Cohesion: 0.25
Nodes (4): desktop, Layout, layouts, phone

### Community 167 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 168 - "resolveSession"
Cohesion: 0.32
Nodes (3): proactiveSessionAllowed(), resolveSession(), taskSessionAllowed()

### Community 169 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 170 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 171 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 172 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 173 - "recovery-context.ts"
Cohesion: 0.38
Nodes (5): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message()

### Community 174 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 175 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 177 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 178 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 179 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 181 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 184 - ".pending"
Cohesion: 0.50
Nodes (3): publicEvent(), validateLimit(), rejectBeforeHello()

## Knowledge Gaps
- **1209 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1204 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2030 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionDetail`, `manager-agent.ts`, `SettingsProfileStore`, `ClaudeAgentService`, `SessionService`, `ManagedSession`, `oracle-voice-session.ts`, `ManagerAgent`, `dreamer-routes.ts`, `PushNotificationService`, `transcription-service.ts`, `oracle-task-store.ts`, `oracle-voice-worker.ts`, `session-knowledge-routes.test.ts`, `session-knowledge-store.ts`, `ManagerMessage`, `DreamerService`, `pwa.ts`, `oracle-voice-config.ts`, `KnowledgeStore`, `ManagerStructuredMemoryStore`, `ManagerProactiveCoordinator`, `SessionOrderStore`, `cli-canary.ts`, `ManagerProactiveInbox`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `contracts.ts`, `agent-service.ts`, `recovery-resend-durability.test.ts`, `CopilotClientLike`, `claude-agent-service.ts`, `session-directory.ts`, `TerminalSessionController`, `background-task-adapter.ts`, `session-store-providers.test.ts`, `queued-dispatch.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `agent-service.ts`, `ClaudeAgentService`, `CopilotClientLike`, `claude-agent-service.ts`, `TerminalSessionController`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1209 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03673557278208441 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.026142552687662798 - nodes in this community are weakly interconnected._
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
- `docs/superpowers/plans/2026-11-07-dreamer-periodic-refresh.md`
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-17-oracle-proactive-lifecycle-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
- `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`
- `docs/superpowers/specs/2026-11-04-oracle-periodic-checks-design.md`
- `docs/superpowers/specs/2026-11-05-session-knowledge-api-design.md`
- `docs/superpowers/specs/2026-11-06-oracle-actionable-morning-plan-design.md`
- `docs/superpowers/specs/2026-11-07-dreamer-periodic-refresh-design.md`
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
