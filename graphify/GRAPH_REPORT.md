# Agentic Remote - Graphify code map

Snapshot: `657a0f24668001d18fcd4ec25d894b0ba978127658e97f5a9ae944c150649066`

Source checkout: `a54b602caa633d0c502e82fe9d94f7d81ae63b7c`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 442 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 442 files · ~920,870 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7492 nodes · 20769 edges · 239 communities (196 shown, 25 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1075 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- api.ts
- App
- SessionStore
- App.tsx
- SessionDetail
- computer-manager.ts
- agent-service.ts
- .sendAdmittedWithBackend
- claude-agent-service.ts
- manager-tools.ts
- background-task-adapter.ts
- CopilotClientLike
- ManagerMessage
- terminal-session.ts
- dreamer-store.ts
- agentic-remote-promotion-monitor
- queued-dispatch.test.ts
- ManagedSession
- ManagerAgent
- oracle-voice-child.ts
- session-presentation.ts
- PushNotificationService
- ManagerStore
- OracleVoiceCoordinator
- oracle-voice-integration.test.ts
- oracle-voice-soak.ts
- RemoteNodeClient
- workspace-fixtures.ts
- active-sessions.ts
- manager-structured-memory-validation.ts
- TmuxTerminalSessionController
- tmux-test-helpers.ts
- .recoverSdkSession
- session-reply-durability.test.ts
- oracle-task-store.ts
- session-knowledge-store.ts
- session-knowledge-routes.test.ts
- oracle-voice-benchmark.ts
- SessionService
- oracle-voice-worker.ts
- DreamerService
- oracle-voice.ts
- OracleDreamer.tsx
- session-directory.ts
- dreamer-progress.ts
- ManagerAssistant.tsx
- OracleVoiceClient
- agentic-remote
- manager-agent.ts
- oracle-voice-coordinator.ts
- agentic-remote-gate
- bundle
- ProviderSessionService
- pwa.ts
- FakeVoiceController
- VoicePlayback
- manager-agent.test.ts
- client.test.ts
- dreamer-planner.ts
- ManagerProactiveCoordinator
- ManagerAttachment
- FakeVoiceEngine
- shell.ts
- lib.rs
- shared/settings-profile.ts
- ChildVoiceEngine
- node-routes.ts
- VoiceCapture
- agentic-remote-promotion-setup
- app.ts
- manager-proactive-inbox.ts
- dependencies
- devDependencies
- config.rs
- terminal-startup-queue.test.ts
- hub-routes.ts
- knowledge-tree.ts
- KnowledgeStore
- capture.ts
- oracle-voice-child.test.ts
- VoiceEngineSession
- oracle-voice-session.ts
- oracle-voice-routes.ts
- EngineVoiceBackendSession
- real-voice.ts
- manager-context.ts
- manager-structured-memory.ts
- oracle-voice-routes.test.ts
- oracle-voice-segments.ts
- remote-voice-client.ts
- capture-workspace.ts
- delegated-transcription-service.ts
- SessionOrderStore
- terminal-session.test.ts
- client.ts
- use-markdown-document.ts
- session-patch-browser.ts
- ManagerAssistant.test.tsx
- oracle-voice-security.test.ts
- send-matrix.integration.test.ts
- HubEvent
- react
- cli-canary.ts
- .toolHost
- manager-structured-memory-search.ts
- scripts
- pipeline.ts
- use-markdown-document.test.tsx
- oracle-voice-config.ts
- registerSessionKnowledgeRoutes
- ManagerStructuredMemoryStore
- src/settings-profile.ts
- VoiceAudioFrame
- compilerOptions
- dreamer-service.ts
- transcription-service.ts
- SettingsProfileClient
- oracle-voice-tickets.ts
- SettingsProfileSnapshot
- parseTerminalFormPrompt
- isTerminalComposerFooter
- compilerOptions
- full-gate.test.ts
- .observe
- session-store-providers.test.ts
- WorkspaceDialog
- PromptCards.tsx
- compilerOptions
- dreamer-service.test.ts
- normalizeKnowledgeRelativePath
- ManagerProactiveInbox
- refusal-metrics.ts
- OnlineRecognizer
- markdown-navigation.ts
- MessageTime.tsx
- compilerOptions
- compilerOptions
- manager-runtime.ts
- ManagerMemory
- .correct
- dreamer-schedule.ts
- promotion-monitor.test.ts
- use-session-knowledge-root.ts
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- server/side-question.ts
- startup-phases.test.ts
- terminal-form-deadline.test.ts
- recovery-resend-durability.test.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- NewSessionDialog
- package.json
- scripts
- VoiceEngineEvent
- oracle-voice-assets.test.ts
- pending-echo.ts
- check-workspace-review-regressions.ts
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- OracleVoiceClientOptions
- .oxlintrc.json
- settings-local.json
- manager-proactive-inbox.test.ts
- TranscriptionError
- OracleSettings.tsx
- Pcm16Resampler
- dreamer-routes.ts
- send-policy.test.ts
- DialogFrame.tsx
- BackgroundTasksDialog.tsx
- html-preview.ts
- document-render.pw.ts
- sign-in-expired.pw.ts
- settings-profile.test.ts
- dataset
- generate-pwa-icons.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- pipeline.test.tsx
- vite.config.ts
- promotion-setup-execution.test.ts
- SessionAdmissions
- KnowledgePosition
- recovery-context.ts
- release-publication.test.ts
- UserInputFieldControl
- OracleVoicePlayback
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- DocumentViewControls.tsx
- .transport
- composer-layout.test.ts
- VoiceServerControl
- MarkdownCodeBlock.tsx
- dreamer-app.test.ts
- promotion-setup.test.ts
- SessionKnowledgeLifecycle
- .discoverTerminalSessions
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- @fastify/multipart
- @fastify/static
- @fastify/websocket
- ffmpeg-static
- hast-util-to-jsx-runtime
- html-url-attributes
- lucide-react
- onnxruntime-web
- mermaid
- pdfjs-dist
- unified
- unist-util-visit
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 310 edges
2. `App()` - 308 edges
3. `AgentService` - 290 edges
4. `SessionStore` - 190 edges
5. `ClaudeAgentService` - 126 edges
6. `ManagedSession` - 125 edges
7. `ManagerAgent` - 98 edges
8. `buildApp()` - 96 edges
9. `registerHubRoutes()` - 96 edges
10. `ComputerManager` - 89 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `DreamerStoreState` --references--> `DreamerSettings`  [EXTRACTED]
  server/dreamer-store.ts → shared/dreamer.ts
- `knowledgeRelativePathSchema` --calls--> `normalizeKnowledgeRelativePath()`  [EXTRACTED]
  server/hub-routes.ts → shared/knowledge-path.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (239 total, 25 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (15): agentMode(), AgentService, isUncertainDelivery(), lifecycleRefusal(), permissionTitle(), persistedFormAnswer(), removeCopilotSessionFiles(), RuntimeConfigurationError (+7 more)

### Community 1 - "api.ts"
Cohesion: 0.03
Nodes (142): SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), addComputer(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask() (+134 more)

### Community 2 - "App"
Cohesion: 0.03
Nodes (158): terminalSendOptions(), submissionReceiptFromError(), askSession(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown() (+150 more)

### Community 3 - "SessionStore"
Cohesion: 0.03
Nodes (78): fixture(), restart(), fixture(), connect(), createStore(), enqueue(), fixture(), recoveryFixture() (+70 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (136): isManagerEvent(), alertNotification(), extension(), MAX_SESSION_FILE_BYTES, sessionFileValidationError(), supportedExtensions, supportsSessionFile(), AccentTheme (+128 more)

### Community 5 - "SessionDetail"
Cohesion: 0.04
Nodes (29): AcceptedSdkReply, ClaudeAgentService, isMissingClaudeSessionError(), PendingClaudeReply, cleanupFixtures(), directories, fixture(), queryHandle() (+21 more)

### Community 6 - "computer-manager.ts"
Cohesion: 0.03
Nodes (44): AgentServiceEvents, ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, directories, FakeSessionService (+36 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.02
Nodes (82): ActivePrompt, ActivityToolStart, ansiSequence, DeliveryBoundary, ElicitationContext, ElicitationHandler, ElicitationReply, foregroundLifecycleEvents (+74 more)

### Community 8 - ".sendAdmittedWithBackend"
Cohesion: 0.05
Nodes (15): commandShortcut(), isTerminalNotReadyRefusal(), normalizedTitle(), sessionInUseConflictMessage(), stripAnsi(), terminalAnswerRefused(), queueConflict(), isRetainedRefusal() (+7 more)

### Community 9 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (62): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, RemoteNodeRedirectError (+54 more)

### Community 10 - "manager-tools.ts"
Cohesion: 0.04
Nodes (49): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+41 more)

### Community 11 - "background-task-adapter.ts"
Cohesion: 0.05
Nodes (74): DeferredSession, addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText() (+66 more)

### Community 12 - "CopilotClientLike"
Cohesion: 0.03
Nodes (51): CopilotClientLike, CopilotSessionLike, foregroundTurnOpen(), holdProbe(), fixtures, gate(), releases, sdkPermissionEvents() (+43 more)

### Community 13 - "ManagerMessage"
Cohesion: 0.04
Nodes (33): FakeManager, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, DreamerServiceOptions, ManagerEventSource, ProactiveManager (+25 more)

### Community 14 - "terminal-session.ts"
Cohesion: 0.06
Nodes (76): activeBottomFrame(), afterExit(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes (+68 more)

### Community 15 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (46): DreamerHistoryEntry, assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+38 more)

### Community 16 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 17 - "queued-dispatch.test.ts"
Cohesion: 0.04
Nodes (39): isClaudeAuthenticationError(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery() (+31 more)

### Community 18 - "ManagedSession"
Cohesion: 0.09
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, FakeManager (+5 more)

### Community 19 - "ManagerAgent"
Cohesion: 0.07
Nodes (14): DreamerProgressView, checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime() (+6 more)

### Community 20 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (36): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+28 more)

### Community 21 - "session-presentation.ts"
Cohesion: 0.06
Nodes (54): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+46 more)

### Community 22 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 23 - "ManagerStore"
Cohesion: 0.07
Nodes (23): DreamerProgressEntry, openStore(), JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), PersistedCursor, emptyState() (+15 more)

### Community 24 - "OracleVoiceCoordinator"
Cohesion: 0.09
Nodes (5): errorMessage(), OracleVoiceCoordinator, PendingFinalTurn, withTimeout(), VoiceTurnState

### Community 25 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): ManagerSdkClient, apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+23 more)

### Community 26 - "oracle-voice-soak.ts"
Cohesion: 0.07
Nodes (33): childCleanupPassed(), childPids(), connectSoakSocket(), delay(), errorText(), GatedStartupRaceObservation, LifecycleCycleObservation, LifecycleCycleResult (+25 more)

### Community 27 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (16): RemoteNodeClient, client(), servers, session, RemoteNodeCapabilityError, RemoteNodeRequestError, RemoteNodeTransportError, NodeInfo (+8 more)

### Community 28 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (37): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, desktop (+29 more)

### Community 29 - "active-sessions.ts"
Cohesion: 0.07
Nodes (50): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+42 more)

### Community 30 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 31 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (15): startAgentAfterClear(), composer(), processAdapter, awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions() (+7 more)

### Community 32 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (47): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, [root], assertSameIdentity() (+39 more)

### Community 33 - ".recoverSdkSession"
Cohesion: 0.08
Nodes (37): activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength() (+29 more)

### Community 34 - "session-reply-durability.test.ts"
Cohesion: 0.05
Nodes (46): ClaudeSdk, deferred(), disk, fixtures, holdClaimWrite(), releases, disk, EnqueueCase (+38 more)

### Community 35 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (35): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+27 more)

### Community 36 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+22 more)

### Community 37 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (29): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+21 more)

### Community 38 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 39 - "SessionService"
Cohesion: 0.07
Nodes (5): registerNodeRoutes(), isSessionResourceRoute(), SessionService, WorkspaceFile, WorkspaceListing

### Community 40 - "oracle-voice-worker.ts"
Cohesion: 0.06
Nodes (29): EnabledOracleVoiceConfig, FakeVoiceEngineCall, FakeVoiceEngineFactory, VoiceEndUtterance, VoiceStartUtterance, VoiceTtsEngine, BlockingEngine, ActiveSynthesisIdentity (+21 more)

### Community 41 - "DreamerService"
Cohesion: 0.13
Nodes (10): boundedText(), digest(), DreamerService, DreamerUnavailableError, unavailableSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate, DreamerSnapshot (+2 more)

### Community 42 - "oracle-voice.ts"
Cohesion: 0.09
Nodes (37): config, capabilities, closeServers, exactArrayBuffer(), sockets, startFields, VoiceNode, decodeVoiceAudioFrame() (+29 more)

### Community 43 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (39): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition, getDreamer() (+31 more)

### Community 44 - "session-directory.ts"
Cohesion: 0.11
Nodes (36): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+28 more)

### Community 45 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 46 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (41): cancelManager(), editQueuedManagerMessage(), resetManager(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent() (+33 more)

### Community 47 - "OracleVoiceClient"
Cohesion: 0.14
Nodes (9): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError(), responseMessage() (+1 more)

### Community 48 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 49 - "manager-agent.ts"
Cohesion: 0.07
Nodes (30): CreationRuntime, automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung, TURN_ACTIVITY (+22 more)

### Community 50 - "oracle-voice-coordinator.ts"
Cohesion: 0.06
Nodes (27): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnector (+19 more)

### Community 51 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 52 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 54 - "pwa.ts"
Cohesion: 0.09
Nodes (38): AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+30 more)

### Community 55 - "FakeVoiceController"
Cohesion: 0.09
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 56 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 57 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (21): ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail(), FakeClient (+13 more)

### Community 58 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 59 - "dreamer-planner.ts"
Cohesion: 0.09
Nodes (33): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+25 more)

### Community 60 - "ManagerProactiveCoordinator"
Cohesion: 0.11
Nodes (13): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, SessionLifecycle, directories (+5 more)

### Community 61 - "ManagerAttachment"
Cohesion: 0.11
Nodes (27): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+19 more)

### Community 62 - "FakeVoiceEngine"
Cohesion: 0.08
Nodes (16): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+8 more)

### Community 63 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 64 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 65 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (36): WorkspaceFixtureState, SettingsProfileState, AccentSetting, appearanceSettings, applySettingsImport(), DEFAULT_SESSION_PROVIDER, isRecord(), isSettingsDeviceId() (+28 more)

### Community 66 - "ChildVoiceEngine"
Cohesion: 0.13
Nodes (8): benchmarkGroup(), ChildVoiceEngine, errorMessage(), matchesCancelled(), matchesSynthesis(), matchesUtterance(), rememberCancellation(), VoiceChildProcess

### Community 67 - "node-routes.ts"
Cohesion: 0.06
Nodes (33): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema (+25 more)

### Community 68 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 69 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 70 - "app.ts"
Cohesion: 0.08
Nodes (22): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+14 more)

### Community 71 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isAlreadyExists(), isDisposition() (+29 more)

### Community 72 - "dependencies"
Cohesion: 0.05
Nodes (37): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, ffprobe-static, @github/copilot-sdk, dependencies (+29 more)

### Community 73 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 74 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 75 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (27): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+19 more)

### Community 76 - "hub-routes.ts"
Cohesion: 0.06
Nodes (36): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+28 more)

### Community 77 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+26 more)

### Community 78 - "KnowledgeStore"
Cohesion: 0.12
Nodes (14): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+6 more)

### Community 79 - "capture.ts"
Cohesion: 0.07
Nodes (17): BufferedFrame, defaultAudioContext(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode (+9 more)

### Community 80 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 81 - "VoiceEngineSession"
Cohesion: 0.07
Nodes (5): ControlledAcquisitionGate, ControlledSoakEngine, SoakManager, VoiceEngineSession, GatedVoiceEngineFactory

### Community 82 - "oracle-voice-session.ts"
Cohesion: 0.08
Nodes (24): apps, directories, playbackSequence(), acquisitionCancelled(), ActiveUtterance, capabilityFromConfig(), createVoiceBackendSession(), DEFAULT_VOICE_BACKEND_LIMITS (+16 more)

### Community 83 - "oracle-voice-routes.ts"
Cohesion: 0.13
Nodes (30): sendNodeVoiceOutput(), limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode() (+22 more)

### Community 84 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 85 - "real-voice.ts"
Cohesion: 0.09
Nodes (12): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+4 more)

### Community 86 - "manager-context.ts"
Cohesion: 0.13
Nodes (26): ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine(), followUpLine() (+18 more)

### Community 87 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (28): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+20 more)

### Community 88 - "oracle-voice-routes.test.ts"
Cohesion: 0.08
Nodes (14): ActiveBackendSession, ObservedLocalVoiceBackend, openApps, openSockets, RouteManager, RouteVoiceBackend, runtime(), testRoot() (+6 more)

### Community 89 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 90 - "remote-voice-client.ts"
Cohesion: 0.16
Nodes (14): VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+6 more)

### Community 91 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 92 - "delegated-transcription-service.ts"
Cohesion: 0.10
Nodes (14): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+6 more)

### Community 93 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 94 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (24): parseTerminalUpdateNotice(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), deliveryFixture(), desktopInstallPane, directories (+16 more)

### Community 95 - "client.ts"
Cohesion: 0.10
Nodes (22): VoiceCapabilities, getOracleVoiceCapabilities(), closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode (+14 more)

### Community 96 - "use-markdown-document.ts"
Cohesion: 0.13
Nodes (23): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+15 more)

### Community 97 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 98 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (16): removeQueuedManagerMessage(), resolveManagerConfirmation(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability, empty (+8 more)

### Community 99 - "oracle-voice-security.test.ts"
Cohesion: 0.09
Nodes (15): apps, config, configFixture(), createManager(), issueTicket(), localRuntime(), otherAllowed, requestJson() (+7 more)

### Community 100 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (24): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+16 more)

### Community 101 - "HubEvent"
Cohesion: 0.13
Nodes (13): WorkspaceFixture, ComputerManagerEvents, nextVoiceControl(), Client, Browser, seedOffset, StoredSession, ChatMessage (+5 more)

### Community 102 - "react"
Cohesion: 0.11
Nodes (13): react, UserMessage, drawDiagram(), drawing, MermaidDiagram(), PauseFollowingContext, sentMessageLength, SentMessageContent() (+5 more)

### Community 103 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 104 - ".toolHost"
Cohesion: 0.10
Nodes (5): ManagerHub, CreateSessionInput, PermissionReplyInput, RenameSessionInput, SendMessageInput

### Community 105 - "manager-structured-memory-search.ts"
Cohesion: 0.13
Nodes (23): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+15 more)

### Community 106 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 107 - "pipeline.ts"
Cohesion: 0.13
Nodes (24): holdingRenderer(), openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), render, scope, documentOpening() (+16 more)

### Community 108 - "use-markdown-document.test.tsx"
Cohesion: 0.11
Nodes (11): DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), DocumentRenderer, DocumentRendererContext, RendererWorker, synchronousRenderer, FakeWorker (+3 more)

### Community 109 - "oracle-voice-config.ts"
Cohesion: 0.14
Nodes (22): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+14 more)

### Community 110 - "registerSessionKnowledgeRoutes"
Cohesion: 0.14
Nodes (21): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+13 more)

### Community 111 - "ManagerStructuredMemoryStore"
Cohesion: 0.15
Nodes (8): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open()

### Community 112 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (21): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+13 more)

### Community 113 - "VoiceAudioFrame"
Cohesion: 0.10
Nodes (11): OracleVoiceBackendConnection, QueuedAudio, BrowserCaptureOptions, SocketInbox, SocketMessage, AudioReservation, VoiceFinalTranscript, VoiceFrameAcceptance (+3 more)

### Community 114 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 115 - "dreamer-service.ts"
Cohesion: 0.16
Nodes (21): DreamerPlanDraft, DreamerPlannerInput, DreamerFollowUp, DreamerPlannerExecutionInput, DreamerStoreSnapshot, OracleTaskFindingInput, DREAMER_PROGRESS_REFRESH_MS, DreamerPlan (+13 more)

### Community 116 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 117 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 118 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 119 - "SettingsProfileSnapshot"
Cohesion: 0.15
Nodes (10): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileStore, directories, store() (+2 more)

### Community 120 - "parseTerminalFormPrompt"
Cohesion: 0.18
Nodes (17): FormReplyDeadlineError, hasClippedTerminalFormFooter(), hasClippedTerminalFormTabs(), hasComposerAfter(), hasTerminalFormQuestionReflowCandidate(), isTerminalLoading(), parseTerminalFormActiveField(), parseTerminalFormPrompt() (+9 more)

### Community 121 - "isTerminalComposerFooter"
Cohesion: 0.13
Nodes (20): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+12 more)

### Community 122 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 123 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 124 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 125 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 126 - "WorkspaceDialog"
Cohesion: 0.16
Nodes (19): executeCommand(), listWorkspace(), searchWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+11 more)

### Community 127 - "PromptCards.tsx"
Cohesion: 0.14
Nodes (14): initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request, UserInputCard(), userInputFieldHasValue() (+6 more)

### Community 128 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 129 - "dreamer-service.test.ts"
Cohesion: 0.11
Nodes (8): DreamerMemoryMetadataRecord, planWithFingerprints(), publicSnapshot(), safeRunError(), directories, enabledSettings(), DreamerRunClaim, dreamerRunKey()

### Community 130 - "normalizeKnowledgeRelativePath"
Cohesion: 0.21
Nodes (16): scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot() (+8 more)

### Community 131 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 132 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 133 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 134 - "markdown-navigation.ts"
Cohesion: 0.19
Nodes (18): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+10 more)

### Community 135 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 136 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 137 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 138 - "manager-runtime.ts"
Cohesion: 0.18
Nodes (13): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkMissingSessionRetirement, CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic() (+5 more)

### Community 139 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 140 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 141 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 142 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 143 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 144 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 145 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 146 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 147 - "server/side-question.ts"
Cohesion: 0.22
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 148 - "startup-phases.test.ts"
Cohesion: 0.13
Nodes (11): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseRecord, address, directories, recorder() (+3 more)

### Community 149 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 150 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 151 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 152 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 153 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession() (+8 more)

### Community 154 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 155 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 156 - "VoiceEngineEvent"
Cohesion: 0.18
Nodes (7): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, VoiceEngineEvent

### Community 157 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 158 - "pending-echo.ts"
Cohesion: 0.24
Nodes (11): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, PendingEchoOwner, prunePendingEchoMap() (+3 more)

### Community 159 - "check-workspace-review-regressions.ts"
Cohesion: 0.15
Nodes (11): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+3 more)

### Community 160 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 161 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 162 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 163 - "OracleVoiceClientOptions"
Cohesion: 0.23
Nodes (3): OracleVoiceClientOptions, FakeVoiceClient, transcript()

### Community 164 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 165 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 166 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 167 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 168 - "OracleSettings.tsx"
Cohesion: 0.23
Nodes (11): getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps, models (+3 more)

### Community 169 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 170 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 171 - "send-policy.test.ts"
Cohesion: 0.20
Nodes (10): SessionExecutionMode, TerminalSendPolicyInput, TerminalSendRequestOptions, booleans, combinations, executionModes, providers, replacing (+2 more)

### Community 172 - "DialogFrame.tsx"
Cohesion: 0.30
Nodes (9): changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame(), subscribeHubSignIn() (+1 more)

### Community 173 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 174 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 176 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 177 - "settings-profile.test.ts"
Cohesion: 0.20
Nodes (6): applySettingsChanges(), sameSettingValue(), samePending(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 178 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 179 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 180 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 181 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 182 - "pipeline.test.tsx"
Cohesion: 0.27
Nodes (7): components, drawn(), drawnPage(), fixtures, html(), today(), rehypeDocumentHeadings()

### Community 183 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 184 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 186 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 187 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 188 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 189 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 191 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 192 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 193 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 194 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 196 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 197 - "VoiceServerControl"
Cohesion: 0.40
Nodes (4): connect(), Inbox, rawBuffer(), VoiceServerControl

### Community 198 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 199 - "dreamer-app.test.ts"
Cohesion: 0.40
Nodes (3): directories, runtimes, trusted

### Community 200 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1247 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1242 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2106 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `terminal()` connect `send-matrix.integration.test.ts` to `AgentService`, `tmux-test-helpers.ts`, `SessionStore`, `terminal-startup-queue.test.ts`, `terminal-session.test.ts`, `TmuxTerminalSessionController`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `.recoverSdkSession`, `SessionStore`, `SessionDetail`, `computer-manager.ts`, `.sendAdmittedWithBackend`, `claude-agent-service.ts`, `.discoverTerminalSessions`, `background-task-adapter.ts`, `CopilotClientLike`, `queued-dispatch.test.ts`, `server/side-question.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `.recoverSdkSession`, `SessionDetail`, `.sendAdmittedWithBackend`, `queued-dispatch.test.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1247 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03590944574551132 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.025937392500859992 - nodes in this community are weakly interconnected._
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
