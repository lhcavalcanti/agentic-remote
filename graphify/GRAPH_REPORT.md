# Agentic Remote - Graphify code map

Snapshot: `81570e780ae2c39d4161d5a532c8403f3dc4817e2f28cffc5ba17d113aa708e9`

Source checkout: `3e4a7a35e08187edda50942d40104cf986ae66e1`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 415 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 415 files · ~892,720 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7252 nodes · 20132 edges · 234 communities (192 shown, 26 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1059 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionStore
- AgentService
- App.tsx
- App
- SessionDetail
- api.ts
- agent-service.ts
- claude-agent-service.ts
- contracts.ts
- ManagerAgent
- OracleVoiceCoordinator
- agentic-remote-promotion-monitor
- dreamer-store.ts
- node-routes.ts
- manager-tools.ts
- ManagedSession
- oracle-voice-soak.ts
- oracle-voice-session.ts
- terminal-session.ts
- session-presentation.ts
- CopilotSessionLike
- oracle-voice-integration.test.ts
- PushNotificationService
- RemoteNodeClient
- ManagerAssistant.tsx
- ManagerMessage
- TmuxTerminalSessionController
- tmux-errors.integration.test.ts
- tmux-test-helpers.ts
- CopilotClientLike
- manager-structured-memory-validation.ts
- FakeVoiceEngine
- session-resource-clear.test.ts
- oracle-task-store.ts
- oracle-voice.ts
- manager-agent.ts
- DreamerService
- workspace-fixtures.ts
- markdown-navigation.ts
- active-sessions.ts
- oracle-voice-benchmark.ts
- ManagerStore
- TerminalSessionController
- UserInputReplyInput
- agentic-remote
- dreamer-progress.ts
- send-matrix.integration.test.ts
- ProviderSessionService
- hub-routes.ts
- OracleVoiceClient
- bundle
- ChildVoiceEngine
- manager-store.ts
- SessionService
- FakeVoiceController
- app.ts
- dreamer-planner.ts
- oracle-voice-routes.ts
- VoicePlayback
- oracle-voice-child.ts
- client.test.ts
- pwa.ts
- OracleDreamer.tsx
- shell.ts
- lib.rs
- VoiceCapture
- agentic-remote-promotion-setup
- manager-proactive-inbox.ts
- FakeSessionService
- ResidentVoiceWorker
- knowledge-tree.ts
- agentic-remote-gate
- config.rs
- manager-context.ts
- oracle-voice-child.test.ts
- oracle-voice-config.ts
- .sendInternal
- KnowledgeStore
- capture.ts
- dependencies
- devDependencies
- session-directory.ts
- background-task-adapter.ts
- shared/settings-profile.ts
- manager-structured-memory.ts
- EngineVoiceBackendSession
- BackgroundTaskSnapshot
- manager-structured-memory-search.ts
- SessionKnowledgeStore
- manager-agent.test.ts
- ChatMessage
- oracle-voice-worker.ts
- remote-voice-client.ts
- SessionOrderStore
- session-patch-browser.ts
- dreamer-service.ts
- VoiceCapabilities
- ManagerStructuredMemoryStore
- terminal-session.test.ts
- src/settings-profile.ts
- capture-workspace.ts
- real-voice.ts
- cli-canary.ts
- scripts
- registerSessionKnowledgeRoutes
- ManagerProactiveCoordinator
- delegated-transcription-service.ts
- compilerOptions
- react
- oracle-voice-segments.ts
- transcription-service.ts
- SettingsProfileClient
- session-reply-durability.test.ts
- oracle-voice-tickets.ts
- session-knowledge-store.ts
- SettingsProfileSnapshot
- compilerOptions
- full-gate.test.ts
- startup-phases.test.ts
- .observe
- oracle-voice-coordinator.test.ts
- refusal-metrics.ts
- session-store-providers.test.ts
- PromptCards.tsx
- HubEvent
- compilerOptions
- normalizeKnowledgeRelativePath
- ManagerProactiveInbox
- OnlineRecognizer
- .withFormViewport
- workspace-browser.ts
- MessageTime.tsx
- compilerOptions
- compilerOptions
- .correct
- SessionKnowledgeBinding
- dreamer-schedule.ts
- ManagerMemory
- promotion-monitor.test.ts
- terminal-startup-queue.test.ts
- BoundedQueue
- client.ts
- ReaderWorkspace
- NewSessionDialog
- session-latency-benchmark.ts
- backgroundTasksFromEvents
- background-task-stop.test.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- capture-workbench-review.ts
- terminal-form-deadline.test.ts
- scripts
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- FakeCopilotClient
- manager-runtime.ts
- theme-contrast.test.ts
- BackgroundTasksDialog.tsx
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- manager-proactive-inbox.test.ts
- TranscriptionError
- OracleSettings.tsx
- session-response-order.ts
- Pcm16Resampler
- background-task-tracker.ts
- dreamer-routes.ts
- dreamer-service.test.ts
- file-upload-routes.ts
- html-preview.ts
- settings-profile.test.ts
- DeferredSession
- dataset
- generate-pwa-icons.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- DreamerMorningPlan
- recordValue
- promotion-setup-execution.test.ts
- SessionAdmissions
- vite.config.ts
- KnowledgePosition
- package.json
- SpeakableSegmenter
- release-publication.test.ts
- OracleVoicePlayback
- oracle-conversation-real.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- .transport
- composer-layout.test.ts
- VoiceServerControl
- usePanelWidth
- api-origin.test.ts
- promotion-setup.test.ts
- SessionKnowledgeLifecycle
- removeComputer
- FakeRecorder
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
1. `SessionDetail` - 310 edges
2. `App()` - 302 edges
3. `AgentService` - 289 edges
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
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (234 total, 26 thin omitted)

### Community 0 - "SessionStore"
Cohesion: 0.02
Nodes (100): storage(), fixture(), restart(), directories, fakeClient(), fixture(), ForkRequest, forkSession() (+92 more)

### Community 1 - "AgentService"
Cohesion: 0.05
Nodes (13): AgentService, isTerminalNotReadyRefusal(), isUncertainDelivery(), lifecycleRefusal(), sessionInUseConflictMessage(), suspendRefused(), terminalAnswerRefused(), queueConflict() (+5 more)

### Community 2 - "App.tsx"
Cohesion: 0.02
Nodes (140): ActivityStatus, isManagerEvent(), extension(), MAX_SESSION_FILE_BYTES, sessionFileValidationError(), supportedExtensions, supportsSessionFile(), AccentTheme (+132 more)

### Community 3 - "App"
Cohesion: 0.03
Nodes (154): terminalSendOptions(), askSession(), getSession(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown() (+146 more)

### Community 4 - "SessionDetail"
Cohesion: 0.04
Nodes (15): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), PendingClaudeReply, toolResultText(), observe(), copilotRequest(), assertSessionNotRetained() (+7 more)

### Community 5 - "api.ts"
Cohesion: 0.03
Nodes (122): AddKnowledgeRootInput, PushSettings, SessionKnowledgeRootMutationInput, SettingsChange, SettingsProfileKey, SettingsProfileValues, SettingsUpdateResult, httpDeliveryUncertain() (+114 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.03
Nodes (91): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+83 more)

### Community 7 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (67): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, RemoteNodeRedirectError (+59 more)

### Community 8 - "contracts.ts"
Cohesion: 0.04
Nodes (55): ClaudeAgentServiceEvents, directories, voiceControlQueues, voiceControlWaiters, ProviderSessionServiceEvents, DEFINITE_DISPATCH_REFUSALS, REDIRECT_STATUSES, RemoteNodeClientEvents (+47 more)

### Community 9 - "ManagerAgent"
Cohesion: 0.06
Nodes (19): DreamerMemoryMetadataRecord, automaticPayload(), checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent (+11 more)

### Community 10 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (20): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+12 more)

### Community 11 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 12 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (45): publicSnapshot(), assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+37 more)

### Community 13 - "node-routes.ts"
Cohesion: 0.03
Nodes (53): ActiveBackendSession, installFakeBrowserVoice(), ScriptedUtterance, Window, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket() (+45 more)

### Community 14 - "manager-tools.ts"
Cohesion: 0.05
Nodes (43): APPROVE_WORDS, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached(), define() (+35 more)

### Community 15 - "ManagedSession"
Cohesion: 0.09
Nodes (14): ComputerManager, managedSession(), mapWithConcurrency(), RemoteSessionListing, sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, normalizeNodeUrl() (+6 more)

### Community 16 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 17 - "oracle-voice-session.ts"
Cohesion: 0.04
Nodes (37): apps, directories, voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngineFactory, VoiceEngineFactory, GatedVoiceEngineFactory, apps (+29 more)

### Community 18 - "terminal-session.ts"
Cohesion: 0.05
Nodes (70): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus(), composerHoldsOtherText(), composerHoldsText() (+62 more)

### Community 19 - "session-presentation.ts"
Cohesion: 0.05
Nodes (57): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+49 more)

### Community 20 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (36): CopilotSessionLike, CopilotTasksApi, openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery() (+28 more)

### Community 21 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (33): QueuedAudio, apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback (+25 more)

### Community 22 - "PushNotificationService"
Cohesion: 0.07
Nodes (29): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+21 more)

### Community 23 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (16): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, requestBytes(), client(), servers, session (+8 more)

### Community 24 - "ManagerAssistant.tsx"
Cohesion: 0.06
Nodes (46): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline() (+38 more)

### Community 25 - "ManagerMessage"
Cohesion: 0.05
Nodes (26): FakeManager, FakeVoiceState, ManagerEventSource, ProactiveManager, FakeAgent, confirmationSchema, defaultsSchema, editSchema (+18 more)

### Community 26 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (19): findActiveCopilotProcesses(), startAgentAfterClear(), composer(), processAdapter, copilotCommand(), endProbeSession(), execFileAsync, formReplyExpired() (+11 more)

### Community 27 - "tmux-errors.integration.test.ts"
Cohesion: 0.05
Nodes (35): fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry, DurableRegisteredComputer (+27 more)

### Community 28 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (50): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+42 more)

### Community 29 - "CopilotClientLike"
Cohesion: 0.06
Nodes (13): agentMode(), CopilotClientLike, removeCopilotSessionFiles(), RuntimeConfigurationError, TerminalActivationSupersededError, CopilotSdkMissingSessionRetirement, forgetSessionEvents(), CopilotResourceClient (+5 more)

### Community 30 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 31 - "FakeVoiceEngine"
Cohesion: 0.06
Nodes (26): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), config, VoiceEngineEvent, VoiceUtteranceAudioFrame (+18 more)

### Community 32 - "session-resource-clear.test.ts"
Cohesion: 0.05
Nodes (47): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), deferred() (+39 more)

### Community 33 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (33): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+25 more)

### Community 34 - "oracle-voice.ts"
Cohesion: 0.08
Nodes (41): VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities, closeServers, exactArrayBuffer(), sockets (+33 more)

### Community 35 - "manager-agent.ts"
Cohesion: 0.06
Nodes (33): isPending(), isQueued(), ManagerAgentOptions, Rung, TURN_ACTIVITY, ManagerState, hasExplicitStructuredMemoryIntent(), memoryObject (+25 more)

### Community 36 - "DreamerService"
Cohesion: 0.12
Nodes (12): boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), safeRunError(), unavailableSnapshot(), uniqueSessionRefs() (+4 more)

### Community 37 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (34): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+26 more)

### Community 38 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (40): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+32 more)

### Community 39 - "active-sessions.ts"
Cohesion: 0.08
Nodes (40): ActiveProcess, execFileAsync, findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+32 more)

### Community 40 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (40): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, deferred() (+32 more)

### Community 41 - "ManagerStore"
Cohesion: 0.07
Nodes (13): openStore(), emptyState(), ManagerStore, messageSource(), storedMessage(), open(), createManager(), createRealManager() (+5 more)

### Community 42 - "TerminalSessionController"
Cohesion: 0.04
Nodes (22): holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), fixtures, recoverAndSeed() (+14 more)

### Community 43 - "UserInputReplyInput"
Cohesion: 0.09
Nodes (7): persistedFormAnswer(), suspendedRuntimeConflict(), TerminalFormContinuation, fixture(), TerminalFormReplyError, PendingUserInput, UserInputReplyInput

### Community 44 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 45 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, DreamerProgressSource (+11 more)

### Community 46 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (40): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+32 more)

### Community 48 - "hub-routes.ts"
Cohesion: 0.06
Nodes (42): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+34 more)

### Community 49 - "OracleVoiceClient"
Cohesion: 0.15
Nodes (8): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError(), terminalCloseCode()

### Community 50 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 51 - "ChildVoiceEngine"
Cohesion: 0.10
Nodes (14): benchmarkGroup(), VoiceEndUtterance, VoiceStartUtterance, VoiceSynthesisRequest, BlockingEngine, capabilityFromConfig(), ChildVoiceEngine, errorMessage() (+6 more)

### Community 52 - "manager-store.ts"
Cohesion: 0.09
Nodes (26): DreamerProgressEntry, TurnContextInput, JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), batchMessageId(), ComputerGenerations (+18 more)

### Community 53 - "SessionService"
Cohesion: 0.09
Nodes (3): registerNodeRoutes(), isSessionResourceRoute(), SessionService

### Community 54 - "FakeVoiceController"
Cohesion: 0.09
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 55 - "app.ts"
Cohesion: 0.07
Nodes (26): buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ServerRole, ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), directories (+18 more)

### Community 56 - "dreamer-planner.ts"
Cohesion: 0.09
Nodes (35): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+27 more)

### Community 57 - "oracle-voice-routes.ts"
Cohesion: 0.10
Nodes (34): sendNodeVoiceOutput(), OracleVoiceBackendConnector, OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes() (+26 more)

### Community 58 - "VoicePlayback"
Cohesion: 0.10
Nodes (11): pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio(), validateGeneration() (+3 more)

### Community 59 - "oracle-voice-child.ts"
Cohesion: 0.07
Nodes (32): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), float32ToPcm16() (+24 more)

### Community 60 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 61 - "pwa.ts"
Cohesion: 0.10
Nodes (36): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle() (+28 more)

### Community 62 - "OracleDreamer.tsx"
Cohesion: 0.11
Nodes (30): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition (+22 more)

### Community 63 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 64 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 65 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 66 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 67 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isAlreadyExists(), isDisposition() (+29 more)

### Community 68 - "FakeSessionService"
Cohesion: 0.07
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 69 - "ResidentVoiceWorker"
Cohesion: 0.14
Nodes (5): combinedTranscript(), matchesCancelled(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream

### Community 70 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (35): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+27 more)

### Community 71 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 72 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 73 - "manager-context.ts"
Cohesion: 0.12
Nodes (27): DreamerProgressView, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+19 more)

### Community 74 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (14): createVoiceWorker(), PiperProcess, childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream (+6 more)

### Community 75 - "oracle-voice-config.ts"
Cohesion: 0.10
Nodes (25): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+17 more)

### Community 76 - ".sendInternal"
Cohesion: 0.16
Nodes (28): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity() (+20 more)

### Community 77 - "KnowledgeStore"
Cohesion: 0.12
Nodes (14): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+6 more)

### Community 78 - "capture.ts"
Cohesion: 0.07
Nodes (17): BufferedFrame, defaultAudioContext(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode (+9 more)

### Community 79 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 80 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 81 - "session-directory.ts"
Cohesion: 0.14
Nodes (22): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath() (+14 more)

### Community 82 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (32): addActivity(), attachmentModeValue(), BackgroundTaskEventOptions, booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, eventTask() (+24 more)

### Community 83 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (32): AccentSetting, appearanceSettings, applySettingsChanges(), applySettingsImport(), DEFAULT_SESSION_PROVIDER, isRecord(), isSettingsProfileKey(), NewSessionBackendSetting (+24 more)

### Community 84 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (29): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+21 more)

### Community 85 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 86 - "BackgroundTaskSnapshot"
Cohesion: 0.08
Nodes (6): ManagerHub, BackgroundTaskSnapshot, CreateSessionInput, PermissionReplyInput, RenameSessionInput, SendMessageInput

### Community 87 - "manager-structured-memory-search.ts"
Cohesion: 0.11
Nodes (26): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+18 more)

### Community 88 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (9): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+1 more)

### Community 89 - "manager-agent.test.ts"
Cohesion: 0.10
Nodes (16): ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail(), FakeClient (+8 more)

### Community 90 - "ChatMessage"
Cohesion: 0.11
Nodes (16): nextVoiceControl(), BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp(), Client (+8 more)

### Community 91 - "oracle-voice-worker.ts"
Cohesion: 0.09
Nodes (17): VoiceGenerationIdentity, VoiceSttEngine, VoiceTtsEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, exactKeys(), isEnabledConfig(), isNonEmptyString() (+9 more)

### Community 92 - "remote-voice-client.ts"
Cohesion: 0.17
Nodes (12): VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient (+4 more)

### Community 93 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 94 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 95 - "dreamer-service.ts"
Cohesion: 0.13
Nodes (26): DreamerPlanDraft, DreamerPlannerInput, DreamerProgressLimits, DreamerFollowUp, DreamerPlannerExecutionInput, DreamerServiceOptions, DreamerStoreSnapshot, OracleTaskFindingInput (+18 more)

### Community 96 - "VoiceCapabilities"
Cohesion: 0.12
Nodes (14): VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability (+6 more)

### Community 97 - "ManagerStructuredMemoryStore"
Cohesion: 0.13
Nodes (8): initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMode, ManagerStructuredMemoryStatus

### Community 98 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (22): terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), desktopInstallPane, directories, downloadedUpdateFooter, execFileAsync (+14 more)

### Community 99 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (23): AppearanceSetting, isSettingsDeviceId(), isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, statuslineItems, Appearance (+15 more)

### Community 100 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 101 - "real-voice.ts"
Cohesion: 0.13
Nodes (11): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+3 more)

### Community 102 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 103 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 104 - "registerSessionKnowledgeRoutes"
Cohesion: 0.14
Nodes (21): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+13 more)

### Community 105 - "ManagerProactiveCoordinator"
Cohesion: 0.20
Nodes (4): isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveInboxEvent

### Community 106 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (13): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+5 more)

### Community 107 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 108 - "react"
Cohesion: 0.11
Nodes (11): react, MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram(), drawing, MermaidDiagram(), SessionActions() (+3 more)

### Community 109 - "oracle-voice-segments.ts"
Cohesion: 0.14
Nodes (22): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+14 more)

### Community 110 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 111 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 112 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+10 more)

### Community 113 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 114 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 115 - "SettingsProfileSnapshot"
Cohesion: 0.15
Nodes (10): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileStore, directories, store() (+2 more)

### Community 116 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 117 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 118 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 119 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 120 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.13
Nodes (10): OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend, Harness (+2 more)

### Community 121 - "refusal-metrics.ts"
Cohesion: 0.16
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+7 more)

### Community 122 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 123 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 124 - "HubEvent"
Cohesion: 0.16
Nodes (10): WorkspaceFixture, ComputerManagerEvents, diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted (+2 more)

### Community 125 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 126 - "normalizeKnowledgeRelativePath"
Cohesion: 0.21
Nodes (16): knowledgeRelativePathSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot() (+8 more)

### Community 127 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 128 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 129 - ".withFormViewport"
Cohesion: 0.18
Nodes (15): FormReplyDeadlineError, hasClippedTerminalFormFooter(), hasClippedTerminalFormTabs(), hasTerminalFormQuestionReflowCandidate(), isTerminalLoading(), parseTerminalFormActiveField(), submitTerminalForm(), tabNames() (+7 more)

### Community 130 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (16): assertOpenedFilePath(), fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath() (+8 more)

### Community 131 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 132 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 133 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 134 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 135 - "SessionKnowledgeBinding"
Cohesion: 0.20
Nodes (13): SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding() (+5 more)

### Community 136 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 137 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 138 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 139 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (10): client(), delayQueueWrite(), disk, exec, gate(), holdQueueCommit(), NativeFixture, NativeRuntime (+2 more)

### Community 140 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 141 - "client.ts"
Cohesion: 0.14
Nodes (12): closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, PendingHello, RECONNECT_DELAYS_MS (+4 more)

### Community 142 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 143 - "NewSessionDialog"
Cohesion: 0.18
Nodes (17): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+9 more)

### Community 144 - "session-latency-benchmark.ts"
Cohesion: 0.23
Nodes (15): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+7 more)

### Community 145 - "backgroundTasksFromEvents"
Cohesion: 0.19
Nodes (16): backgroundTasksFromEvents(), eventString(), isLiveTaskStatus(), isOlderExecution(), isShellObserverTool(), isShellStopTool(), isShellTool(), isTerminalTaskStatus() (+8 more)

### Community 146 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 147 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 148 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 149 - "capture-workbench-review.ts"
Cohesion: 0.14
Nodes (11): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, fixtureSessions (+3 more)

### Community 150 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 151 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 152 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 153 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 154 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 155 - "FakeCopilotClient"
Cohesion: 0.19
Nodes (6): busyTerminal(), configurableModel(), FakeCopilotClient, probeService(), startupFifoFixture(), terminalService()

### Community 156 - "manager-runtime.ts"
Cohesion: 0.25
Nodes (10): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+2 more)

### Community 157 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 158 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 159 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 160 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 161 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 162 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 163 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 164 - "OracleSettings.tsx"
Cohesion: 0.23
Nodes (11): getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps, models (+3 more)

### Community 165 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 166 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 167 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 168 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 170 - "file-upload-routes.ts"
Cohesion: 0.24
Nodes (5): FileUploadError, registerFileUploadRoutes(), SessionParams, registerTranscriptionRoutes(), transcriptionMultipartOptions

### Community 171 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 172 - "settings-profile.test.ts"
Cohesion: 0.20
Nodes (6): WorkspaceFixtureState, SettingsProfileState, SettingsProfileRecord, settingsProfileCacheKey, cached(), MemoryStorage

### Community 174 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 175 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 176 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 177 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 178 - "DreamerMorningPlan"
Cohesion: 0.38
Nodes (10): DreamerMorningPlan(), confirmCompletion(), confirmTaskCompletion(), dispatchTask(), disposition(), edit(), investigate(), move() (+2 more)

### Community 179 - "recordValue"
Cohesion: 0.36
Nodes (9): backgroundHandoff(), errorValue(), notificationKind(), rawTailText(), recordValue(), shellStopAcknowledged(), shellTaskOutput(), textFromValue() (+1 more)

### Community 180 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 182 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 183 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 184 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 186 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 189 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 190 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 191 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 192 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 194 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 195 - "VoiceServerControl"
Cohesion: 0.40
Nodes (4): connect(), Inbox, rawBuffer(), VoiceServerControl

### Community 196 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 197 - "api-origin.test.ts"
Cohesion: 0.40
Nodes (4): prefixes, session, trusted, untrusted

### Community 198 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 200 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **1204 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1199 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2021 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionStore`, `SessionDetail`, `agent-service.ts`, `claude-agent-service.ts`, `TerminalSessionController`, `UserInputReplyInput`, `.sendInternal`, `session-directory.ts`, `background-task-adapter.ts`, `CopilotSessionLike`, `CopilotClientLike`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `SessionDetail`, `agent-service.ts`, `UserInputReplyInput`, `CopilotClientLike`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `backgroundTasksFromEvents()` connect `backgroundTasksFromEvents` to `background-task-adapter.ts`, `recordValue`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1204 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.024041177578306448 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.04623963008295934 - nodes in this community are weakly interconnected._
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
