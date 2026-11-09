# Agentic Remote - Graphify code map

Snapshot: `51df218c2b506048b56421053e4915a920f563f5ade1de30bd0650e89b061703`

Source checkout: `c2011849fcada4efb942b9a78df280d2ef04aca6`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 411 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 411 files · ~882,838 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7191 nodes · 19995 edges · 216 communities (176 shown, 24 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1058 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- SessionDetail
- api.ts
- App.tsx
- ClaudeAgentService
- agent-service.ts
- CopilotClientLike
- claude-agent-service.ts
- contracts.ts
- terminal-session.ts
- oracle-voice-session.ts
- dreamer-store.ts
- manager-tools.ts
- OracleVoiceCoordinator
- agentic-remote-promotion-monitor
- oracle-voice-soak.ts
- ManagedSession
- ManagerAgent
- oracle-voice-child.ts
- RemoteNodeClient
- ManagerStore
- VoiceClientControl
- oracle-voice-worker.ts
- workspace-fixtures.ts
- active-sessions.ts
- queued-dispatch.test.ts
- oracle-voice-integration.test.ts
- client.ts
- session-reply-durability.test.ts
- hub-routes.ts
- session-presentation.ts
- ManagerMessage
- manager-structured-memory-validation.ts
- session-knowledge-store.ts
- markdown-navigation.ts
- ManagerEvent
- manager-agent.ts
- oracle-voice-routes.ts
- oracle-task-store.ts
- session-knowledge-routes.test.ts
- FakeVoiceEngine
- SessionService
- oracle-voice.ts
- oracle-voice-benchmark.ts
- app.ts
- session-latency-benchmark.ts
- session-directory.ts
- dreamer-progress.ts
- TmuxTerminalSessionController
- DreamerService
- agentic-remote
- ProviderSessionService
- bundle
- FakeSessionService
- pwa.ts
- shared/settings-profile.ts
- node-routes.ts
- terminal-session.test.ts
- VoicePlayback
- FakeVoiceController
- PushNotificationService
- client.test.ts
- ManagerAssistant.tsx
- OracleDreamer.tsx
- shell.ts
- lib.rs
- oracle-voice-config.ts
- agentic-remote-promotion-setup
- dreamer-planner.ts
- manager-proactive-inbox.ts
- agentic-remote-gate
- config.rs
- real-voice.ts
- KnowledgeStore
- manager-agent.test.ts
- oracle-voice-child.test.ts
- tmux-test-helpers.ts
- dependencies
- devDependencies
- manager-structured-memory.ts
- EngineVoiceBackendSession
- react
- manager-context.ts
- oracle-voice-security.test.ts
- oracle-voice-segments.ts
- registerSessionKnowledgeRoutes
- delegated-transcription-service.ts
- remote-voice-client.ts
- SessionOrderStore
- send-matrix.integration.test.ts
- use-oracle-conversation.test.tsx
- session-patch-browser.ts
- cli-canary.ts
- scripts
- dreamer-service.ts
- manager-structured-memory-search.ts
- push-notification-service.ts
- src/settings-profile.ts
- SettingsProfileClient
- transcription-service.ts
- compilerOptions
- event-log.ts
- background-task-adapter.ts
- ManagerStructuredMemoryStore
- server/side-question.ts
- SettingsProfileStore
- backgroundTasksFromEvents
- oracle-voice-tickets.ts
- .sendInternal
- ManagerAssistant.test.tsx
- full-gate.test.ts
- startup-phases.test.ts
- .observe
- PromptCards.tsx
- compilerOptions
- dreamer-service.test.ts
- .toolHost
- ManagerProactiveInbox
- session-store-providers.test.ts
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- phone
- compilerOptions
- ManagerMemory
- refusal-metrics.ts
- normalizeKnowledgeRelativePath
- dreamer-schedule.ts
- terminal-startup-queue.test.ts
- knowledge-tree.ts
- BoundedQueue
- ReaderWorkspace
- recordValue
- VoiceAudioFrame
- terminal-form-deadline.test.ts
- promotion-monitor.test.ts
- session-resource-routes.test.ts
- NewSessionDialog
- scripts
- background-task-stop.test.ts
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- manager-proactive-inbox.test.ts
- TranscriptionError
- BackgroundTasksDialog.tsx
- OracleSettings.tsx
- Pcm16Resampler
- DeferredSession
- background-task-tracker.ts
- oracle-voice-coordinator.test.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- dreamer-routes.ts
- .initialize
- submission-error.ts
- dataset
- generate-pwa-icons.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- DreamerMorningPlan
- KnowledgePosition
- manager-structured-memory-performance.test.ts
- promotion-setup-execution.test.ts
- SessionAdmissions
- FakeRecorder
- vite.config.ts
- package.json
- release-publication.test.ts
- render-workspace-gifs.ts
- settings.ts
- .transport
- composer-layout.test.ts
- usePanelWidth
- dreamer-app.test.ts
- promotion-setup.test.ts
- FakeRecorder
- MemoryStorage
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
1. `SessionDetail` - 310 edges
2. `App()` - 301 edges
3. `AgentService` - 289 edges
4. `SessionStore` - 190 edges
5. `ClaudeAgentService` - 126 edges
6. `ManagedSession` - 123 edges
7. `ManagerAgent` - 98 edges
8. `buildApp()` - 96 edges
9. `registerHubRoutes()` - 96 edges
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

## Communities (216 total, 24 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (17): agentMode(), AgentService, commandShortcut(), isTerminalNotReadyRefusal(), lifecycleRefusal(), normalizedTitle(), RuntimeConfigurationError, sessionInUseConflictMessage() (+9 more)

### Community 1 - "App"
Cohesion: 0.02
Nodes (204): isManagerEvent(), alertNotification(), terminalSendOptions(), sessionFileValidationError(), submissionReceiptFromError(), deleteKnowledgeRoot(), moveSessionToTmux(), readKnowledgeFile() (+196 more)

### Community 2 - "SessionDetail"
Cohesion: 0.03
Nodes (84): fixture(), restart(), fixture(), connect(), createStore(), enqueue(), fixture(), recoveryFixture() (+76 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (119): SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), addKnowledgeRoot(), askSession(), bootstrapSessionOrder(), cancelBackgroundTask() (+111 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (114): addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+106 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (37): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+29 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.03
Nodes (89): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+81 more)

### Community 7 - "CopilotClientLike"
Cohesion: 0.02
Nodes (73): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+65 more)

### Community 8 - "claude-agent-service.ts"
Cohesion: 0.05
Nodes (72): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+64 more)

### Community 9 - "contracts.ts"
Cohesion: 0.04
Nodes (71): ClaudeAgentServiceEvents, RemoteSessionListing, DirectoryScope, directories, openNodeVoiceSocket(), voiceControlQueues, voiceControlWaiters, waitForEvent() (+63 more)

### Community 10 - "terminal-session.ts"
Cohesion: 0.05
Nodes (89): activeBottomFrame(), boxedComposerFrame(), captureTerminal(), cleanDialogLine(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText() (+81 more)

### Community 11 - "oracle-voice-session.ts"
Cohesion: 0.04
Nodes (38): apps, directories, voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngineFactory, config, VoiceEngineEvent, VoiceEngineFactory (+30 more)

### Community 12 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (46): DreamerHistoryEntry, assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+38 more)

### Community 13 - "manager-tools.ts"
Cohesion: 0.05
Nodes (43): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+35 more)

### Community 14 - "OracleVoiceCoordinator"
Cohesion: 0.07
Nodes (18): AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnection (+10 more)

### Community 15 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 16 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 17 - "ManagedSession"
Cohesion: 0.09
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, FakeManager (+5 more)

### Community 18 - "ManagerAgent"
Cohesion: 0.07
Nodes (13): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, uniqueManagerSessionRefs() (+5 more)

### Community 19 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (35): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+27 more)

### Community 20 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (18): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, requestBytes(), client(), servers, session (+10 more)

### Community 21 - "ManagerStore"
Cohesion: 0.05
Nodes (28): DreamerProgressEntry, capturePrompt(), openStore(), JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), PersistedCursor (+20 more)

### Community 22 - "VoiceClientControl"
Cohesion: 0.06
Nodes (24): VoiceClientControl, BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), CaptureControl, harness() (+16 more)

### Community 23 - "oracle-voice-worker.ts"
Cohesion: 0.06
Nodes (34): benchmarkGroup(), VoiceWorkerOptions, VoiceEndUtterance, VoiceEngineSession, VoiceStartUtterance, BlockingEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity (+26 more)

### Community 24 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (52): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, audit (+44 more)

### Community 25 - "active-sessions.ts"
Cohesion: 0.06
Nodes (52): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+44 more)

### Community 26 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (32): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), QueuedDelivery (+24 more)

### Community 27 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+23 more)

### Community 28 - "client.ts"
Cohesion: 0.09
Nodes (21): ORACLE_VOICE_CONNECTION_TIMEOUT_MS, captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord(), isTicket() (+13 more)

### Community 29 - "session-reply-durability.test.ts"
Cohesion: 0.07
Nodes (28): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), answer(), assistantFixture(), claudeFixture(), claudeQuestions() (+20 more)

### Community 30 - "hub-routes.ts"
Cohesion: 0.04
Nodes (49): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+41 more)

### Community 31 - "session-presentation.ts"
Cohesion: 0.07
Nodes (50): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+42 more)

### Community 32 - "ManagerMessage"
Cohesion: 0.06
Nodes (24): FakeManager, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, confirmationSchema, defaultsSchema, editSchema (+16 more)

### Community 33 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 34 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+22 more)

### Community 35 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (43): executeCommand(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage() (+35 more)

### Community 36 - "ManagerEvent"
Cohesion: 0.08
Nodes (19): apps, directories, batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions (+11 more)

### Community 37 - "manager-agent.ts"
Cohesion: 0.06
Nodes (37): DreamerProgressView, automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung (+29 more)

### Community 38 - "oracle-voice-routes.ts"
Cohesion: 0.07
Nodes (41): ManagerEventSource, sendNodeVoiceOutput(), OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, OracleVoiceManager, FakeBackend, Harness (+33 more)

### Community 39 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (34): attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp(), LEGACY_STATE_VERSION (+26 more)

### Community 40 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (29): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+21 more)

### Community 41 - "FakeVoiceEngine"
Cohesion: 0.06
Nodes (24): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+16 more)

### Community 42 - "SessionService"
Cohesion: 0.07
Nodes (5): nodeVoiceCapabilities(), registerNodeRoutes(), SessionService, WorkspaceFile, WorkspaceFileIcon()

### Community 43 - "oracle-voice.ts"
Cohesion: 0.08
Nodes (40): VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities, closeServers, exactArrayBuffer(), sockets (+32 more)

### Community 44 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 45 - "app.ts"
Cohesion: 0.07
Nodes (31): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+23 more)

### Community 46 - "session-latency-benchmark.ts"
Cohesion: 0.07
Nodes (34): Connection, count, historyEvents(), message(), normal(), now(), Pending, percentile() (+26 more)

### Community 47 - "session-directory.ts"
Cohesion: 0.10
Nodes (38): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+30 more)

### Community 48 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (21): ComputerManagerEvents, DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+13 more)

### Community 49 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (13): copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm() (+5 more)

### Community 50 - "DreamerService"
Cohesion: 0.13
Nodes (10): boundedText(), digest(), DreamerService, DreamerUnavailableError, unavailableSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate, DreamerSnapshot (+2 more)

### Community 51 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 53 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 54 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 55 - "pwa.ts"
Cohesion: 0.09
Nodes (39): AppVersion, parseAppVersion(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+31 more)

### Community 56 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (37): SettingsProfileState, AccentSetting, appearanceSettings, applySettingsChanges(), applySettingsImport(), DEFAULT_SESSION_PROVIDER, isRecord(), isSettingsDeviceId() (+29 more)

### Community 57 - "node-routes.ts"
Cohesion: 0.06
Nodes (37): SessionParams, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema (+29 more)

### Community 58 - "terminal-session.test.ts"
Cohesion: 0.07
Nodes (34): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), isTerminalVisiblyIdle(), occurrences(), paneEvidenceCount(), paneShowsText() (+26 more)

### Community 59 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 60 - "FakeVoiceController"
Cohesion: 0.09
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 61 - "PushNotificationService"
Cohesion: 0.11
Nodes (10): HubEventSource, PushNotificationService, directories, scoped(), RFC-8030, registerPushRoutes(), sessionMuteSchema, subscriptionSchema (+2 more)

### Community 62 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 63 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (31): editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), retryManagerMessage(), phoneEnterCreatesNewline(), applyEvent(), canTakeFocus(), conversationStateLabel() (+23 more)

### Community 64 - "OracleDreamer.tsx"
Cohesion: 0.10
Nodes (30): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition (+22 more)

### Community 65 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 66 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 67 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (28): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+20 more)

### Community 68 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 69 - "dreamer-planner.ts"
Cohesion: 0.10
Nodes (32): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+24 more)

### Community 70 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isAlreadyExists(), isDisposition() (+29 more)

### Community 71 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 72 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 73 - "real-voice.ts"
Cohesion: 0.08
Nodes (13): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+5 more)

### Community 74 - "KnowledgeStore"
Cohesion: 0.11
Nodes (15): WorkspaceFixtureState, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState (+7 more)

### Community 75 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (18): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail(), FakeClient (+10 more)

### Community 76 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (15): ActiveBackendSession, createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream (+7 more)

### Community 77 - "tmux-test-helpers.ts"
Cohesion: 0.14
Nodes (31): startAgentAfterClear(), exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, deliveryFixture() (+23 more)

### Community 78 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 79 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 80 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 81 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 82 - "react"
Cohesion: 0.10
Nodes (20): react, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, transcribeAudio(), updateSessionKnowledgeRoot(), MarkdownCodeBlock(), copy() (+12 more)

### Community 83 - "manager-context.ts"
Cohesion: 0.13
Nodes (26): ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine(), followUpLine() (+18 more)

### Community 84 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (19): FakeVoiceEngineCall, SocketMessage, apps, config, configFixture(), connect(), Inbox, issueTicket() (+11 more)

### Community 85 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 86 - "registerSessionKnowledgeRoutes"
Cohesion: 0.11
Nodes (22): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+14 more)

### Community 87 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (13): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+5 more)

### Community 88 - "remote-voice-client.ts"
Cohesion: 0.18
Nodes (12): VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient (+4 more)

### Community 89 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 90 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (24): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+16 more)

### Community 91 - "use-oracle-conversation.test.tsx"
Cohesion: 0.12
Nodes (13): getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability, defaults (+5 more)

### Community 92 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 93 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 94 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 95 - "dreamer-service.ts"
Cohesion: 0.15
Nodes (23): DreamerMemoryMetadata, DreamerPlanDraft, DreamerProgressLimits, DreamerFollowUp, DreamerPlannerExecutionInput, DreamerServiceOptions, DreamerStoreSnapshot, OracleTaskFindingInput (+15 more)

### Community 96 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 97 - "push-notification-service.ts"
Cohesion: 0.14
Nodes (18): brief(), OracleEventSource, PushPolicy, PushSender, PushState, RFC-8030, notificationAllowed(), notificationBrief() (+10 more)

### Community 98 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (21): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+13 more)

### Community 99 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 100 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 101 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 102 - "event-log.ts"
Cohesion: 0.15
Nodes (18): removeCopilotSessionFiles(), appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs (+10 more)

### Community 103 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (21): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isShellObserverTool() (+13 more)

### Community 104 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 105 - "server/side-question.ts"
Cohesion: 0.16
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 106 - "SettingsProfileStore"
Cohesion: 0.13
Nodes (12): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), profileStore(), updateSchema, SettingsProfileStore, directories (+4 more)

### Community 107 - "backgroundTasksFromEvents"
Cohesion: 0.17
Nodes (22): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventString(), eventTask(), isLiveTaskStatus(), isOlderExecution() (+14 more)

### Community 108 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 109 - ".sendInternal"
Cohesion: 0.22
Nodes (12): captureBeforeDeadline(), capturePane(), clearAutomaticStartupPrompts(), hasComposerAfter(), isTerminalAgentWorking(), isTerminalOverlay(), isTerminalSessionInUseConflict(), parseTerminalFormPrompt() (+4 more)

### Community 110 - "ManagerAssistant.test.tsx"
Cohesion: 0.10
Nodes (14): cancelManager(), resolveManagerConfirmation(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+6 more)

### Community 111 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 112 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 113 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 114 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 115 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 116 - "dreamer-service.test.ts"
Cohesion: 0.11
Nodes (8): DreamerMemoryMetadataRecord, planWithFingerprints(), publicSnapshot(), safeRunError(), directories, enabledSettings(), DreamerRunClaim, dreamerRunKey()

### Community 118 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 119 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession() (+1 more)

### Community 120 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 121 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 122 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 123 - "phone"
Cohesion: 0.19
Nodes (15): assertConversation(), assertLayout(), capture(), desktop(), documentHeading(), expect, openGuide(), phone() (+7 more)

### Community 124 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 125 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 126 - "refusal-metrics.ts"
Cohesion: 0.16
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+7 more)

### Community 127 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 128 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 129 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (10): client(), delayQueueWrite(), disk, exec, gate(), holdQueueCommit(), NativeFixture, NativeRuntime (+2 more)

### Community 130 - "knowledge-tree.ts"
Cohesion: 0.20
Nodes (15): knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs(), KnowledgeFolders (+7 more)

### Community 131 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 132 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 133 - "recordValue"
Cohesion: 0.19
Nodes (17): attachmentModeValue(), backgroundHandoff(), booleanValue(), executionModeValue(), notificationKind(), parsedValue(), rawTailText(), recordValue() (+9 more)

### Community 134 - "VoiceAudioFrame"
Cohesion: 0.12
Nodes (6): QueuedAudio, BrowserCaptureOptions, AudioReservation, VoiceAudioFrame, QueuedAudio, OracleVoicePlayback

### Community 135 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 136 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 137 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 138 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder(), reopenInterruptedSession() (+8 more)

### Community 139 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 140 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

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

### Community 148 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 149 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 150 - "BackgroundTasksDialog.tsx"
Cohesion: 0.26
Nodes (10): BackgroundTask, BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 151 - "OracleSettings.tsx"
Cohesion: 0.23
Nodes (11): getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps, models (+3 more)

### Community 152 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 154 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 155 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.20
Nodes (5): capabilities, confirm(), control(), defaults, startControl()

### Community 156 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 157 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 158 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (9): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+1 more)

### Community 159 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 160 - "submission-error.ts"
Cohesion: 0.35
Nodes (5): RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, SubmissionError, SubmissionReceipt

### Community 161 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 162 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 163 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 164 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 165 - "DreamerMorningPlan"
Cohesion: 0.38
Nodes (10): DreamerMorningPlan(), confirmCompletion(), confirmTaskCompletion(), dispatchTask(), disposition(), edit(), investigate(), move() (+2 more)

### Community 166 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 167 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.31
Nodes (6): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult

### Community 168 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 170 - "FakeRecorder"
Cohesion: 0.22
Nodes (4): drawDiagram(), drawing, MermaidDiagram(), FakeRecorder

### Community 171 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 172 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 173 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 174 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 175 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 177 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 178 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 179 - "dreamer-app.test.ts"
Cohesion: 0.40
Nodes (3): directories, runtimes, trusted

### Community 180 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1184 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1179 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1990 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `event-log.ts`, `agent-service.ts`, `claude-agent-service.ts`, `server/side-question.ts`, `contracts.ts`, `background-task-adapter.ts`, `CopilotClientLike`, `session-directory.ts`, `queued-dispatch.test.ts`, `session-reply-durability.test.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `session-reply-durability.test.ts`, `agent-service.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `App()` connect `App` to `AgentService`, `knowledge-tree.ts`, `api.ts`, `App.tsx`, `NewSessionDialog`, `pending-echo.ts`, `RemoteNodeClient`, `session-reply-durability.test.ts`, `session-presentation.ts`, `markdown-navigation.ts`, `KnowledgePosition`, `session-latency-benchmark.ts`, `pwa.ts`, `ManagerAssistant.tsx`, `OracleDreamer.tsx`, `shell.ts`, `react`, `push-notification-service.ts`, `normalizeKnowledgeRelativePath`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1184 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03371799495131626 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.023961378332890425 - nodes in this community are weakly interconnected._
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
