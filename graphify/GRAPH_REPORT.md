# Agentic Remote - Graphify code map

Snapshot: `e841fedcc1df1bbe745d56d2eebcf975e826d11f129e57b8eaa8bc566517939c`

Source checkout: `63920a30f3f4fd8f819f39a3f6693339cab2a6d8`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 414 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 414 files · ~889,258 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7246 nodes · 20109 edges · 222 communities (179 shown, 27 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1059 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionDetail
- App
- api.ts
- App.tsx
- contracts.ts
- agent-service.ts
- session-store.ts
- ManagedSession
- node-routes.ts
- oracle-voice-soak.ts
- CopilotClientLike
- oracle-voice-child.ts
- manager-agent.ts
- oracle-voice.ts
- claude-agent-service.ts
- dreamer-store.ts
- agentic-remote-promotion-monitor
- oracle-voice-session.ts
- ManagerAgent
- terminal-session.ts
- ManagerMessage
- TerminalSessionController
- oracle-voice-integration.test.ts
- transcription-service.ts
- terminal-session.test.ts
- queued-dispatch.test.ts
- session-presentation.ts
- workspace-fixtures.ts
- oracle-voice-worker.ts
- ManagerStore
- manager-structured-memory-validation.ts
- active-sessions.ts
- SessionService
- createManagerTools
- markdown-navigation.ts
- session-knowledge-routes.test.ts
- oracle-task-store.ts
- FakeVoiceEngine
- TmuxTerminalSessionController
- tmux-test-helpers.ts
- session-resource-clear.test.ts
- app.ts
- RemoteNodeClient
- DreamerService
- session-directory.ts
- agentic-remote
- oracle-voice-benchmark.ts
- pwa.ts
- OracleDreamer.tsx
- hub-routes.ts
- ProviderSessionService
- OracleVoiceClient
- bundle
- shared/settings-profile.ts
- VoicePlayback
- ManagerAssistant.tsx
- FakeVoiceController
- dreamer-planner.ts
- FakeSessionService
- .sendInternal
- VoiceClientControl
- shell.ts
- lib.rs
- dreamer-service.ts
- terminal-startup-queue.test.ts
- agentic-remote-promotion-setup
- manager-proactive-inbox.ts
- oracle-voice-routes.ts
- agentic-remote-gate
- config.rs
- react
- ManagerProactiveCoordinator
- manager-structured-memory-search.ts
- manager-structured-memory.ts
- oracle-voice-config.ts
- DreamerProgress
- KnowledgeStore
- oracle-voice-security.test.ts
- dependencies
- devDependencies
- AgentProvider
- knowledge-tree.ts
- capture.ts
- manager-context.ts
- ManagerStructuredMemoryStore
- EngineVoiceBackendSession
- oracle-voice-child.test.ts
- OracleVoiceCoordinator
- oracle-voice-segments.ts
- PushNotificationService
- SessionKnowledgeStore
- ManagerAssistant.test.tsx
- client.test.ts
- capture-workspace.ts
- push-notification-service.ts
- SessionOrderStore
- session-patch-browser.ts
- backgroundTasksFromEvents
- background-task-stop.test.ts
- cli-canary.ts
- manager-tools.ts
- scripts
- .discoverSessions
- oracle-voice-coordinator.ts
- registerSessionKnowledgeRoutes
- src/settings-profile.ts
- compilerOptions
- oracle-voice-coordinator.test.ts
- session-reply-durability.test.ts
- session-store-providers.test.ts
- SettingsProfileClient
- background-task-adapter.ts
- VoiceTurnState
- oracle-voice-tickets.ts
- refusal-metrics.ts
- session-knowledge-store.ts
- compilerOptions
- full-gate.test.ts
- startup-phases.test.ts
- .observe
- PromptCards.tsx
- use-oracle-conversation.test.tsx
- compilerOptions
- normalizeKnowledgeRelativePath
- ManagerProactiveInbox
- SettingsProfileSnapshot
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- client.ts
- dreamer-schedule.ts
- promotion-monitor.test.ts
- .withFormViewport
- BoundedQueue
- ReaderWorkspace
- settings-profile.test.ts
- session-latency-benchmark.ts
- terminal-form-deadline.test.ts
- .askSession
- scripts
- oracle-voice-assets.test.ts
- session-patch-integration.test.ts
- NewSessionDialog
- fake-vad.ts
- desktop.json
- manager-proactive-inbox.test.ts
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- dreamer-service.test.ts
- Pcm16Resampler
- HubEvent
- file-upload-routes.ts
- ChatMessage
- BackgroundTasksDialog.tsx
- html-preview.ts
- DeferredSession
- .handleManagerEvent
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- ManagerProactiveInboxValidationError
- SessionPublications
- bridge.rs
- DreamerMorningPlan
- dreamer-routes.ts
- OracleVoiceClientDependencies
- promotion-setup-execution.test.ts
- SessionAdmissions
- vite.config.ts
- KnowledgePosition
- package.json
- release-publication.test.ts
- OracleVoicePlayback
- render-workspace-gifs.ts
- backgroundHandoff
- history-projection.test.ts
- settings.ts
- composer-layout.test.ts
- SocketInbox
- manager-structured-memory-intent.ts
- promotion-setup.test.ts
- push-routes.ts
- SessionKnowledgeLifecycle
- settings-profile-routes.test.ts
- BrowserCaptureOptions
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
- `FakeVoiceState` --references--> `ManagerMessage`  [EXTRACTED]
  e2e/fixtures/fake-voice.ts → shared/manager.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (222 total, 27 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (15): AgentService, isTerminalNotReadyRefusal(), isUncertainDelivery(), lifecycleRefusal(), sessionInUseConflictMessage(), suspendedRuntimeConflict(), suspendRefused(), terminalAnswerRefused() (+7 more)

### Community 1 - "SessionDetail"
Cohesion: 0.03
Nodes (20): ClaudeAgentService, isMissingClaudeSessionError(), fixture(), observe(), copilotRequest(), canArchiveSession(), assertSessionNotRetained(), clearRecoverySeedFailure() (+12 more)

### Community 2 - "App"
Cohesion: 0.03
Nodes (174): isManagerEvent(), alertNotification(), terminalSendOptions(), sessionFileValidationError(), SettingsChange, SettingsProfileKey, deleteKnowledgeRoot(), moveSessionToTmux() (+166 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (137): ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, SessionKnowledgeBinding, SessionMcpServerSummary, SessionSkillSummary, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt() (+129 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (132): addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+124 more)

### Community 5 - "contracts.ts"
Cohesion: 0.03
Nodes (69): ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, directories, voiceControlQueues, voiceControlWaiters (+61 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.04
Nodes (84): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+76 more)

### Community 7 - "session-store.ts"
Cohesion: 0.03
Nodes (77): connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite() (+69 more)

### Community 8 - "ManagedSession"
Cohesion: 0.07
Nodes (14): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, ManagerHub, ManagerProactiveCoordinatorOptions (+6 more)

### Community 9 - "node-routes.ts"
Cohesion: 0.03
Nodes (54): ActiveBackendSession, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, execFileAsync, RealVoiceState, AUDIO_FILENAME_HEADER (+46 more)

### Community 10 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (36): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+28 more)

### Community 11 - "CopilotClientLike"
Cohesion: 0.03
Nodes (57): CopilotClientLike, CopilotSessionLike, foregroundTurnOpen(), fixture(), holdProbe(), fixtures, gate(), releases (+49 more)

### Community 12 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (44): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+36 more)

### Community 13 - "manager-agent.ts"
Cohesion: 0.04
Nodes (54): DreamerProgressView, automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent (+46 more)

### Community 14 - "oracle-voice.ts"
Cohesion: 0.06
Nodes (56): AudioReservation, VoiceBackendDisconnectCause, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, closeReason(), exactArrayBuffer() (+48 more)

### Community 15 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (62): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+54 more)

### Community 16 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (46): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+38 more)

### Community 17 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 18 - "oracle-voice-session.ts"
Cohesion: 0.04
Nodes (36): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+28 more)

### Community 19 - "ManagerAgent"
Cohesion: 0.08
Nodes (11): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, uniqueManagerSessionRefs() (+3 more)

### Community 20 - "terminal-session.ts"
Cohesion: 0.05
Nodes (70): composer(), processAdapter, boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus() (+62 more)

### Community 21 - "ManagerMessage"
Cohesion: 0.05
Nodes (28): FakeManager, apps, directories, DreamerServiceOptions, ProactiveManager, FakeAgent, confirmationSchema, defaultsSchema (+20 more)

### Community 22 - "TerminalSessionController"
Cohesion: 0.06
Nodes (10): agentMode(), persistedFormAnswer(), removeCopilotSessionFiles(), RuntimeConfigurationError, TerminalFormContinuation, TerminalFormReplyError, TerminalSessionController, PendingPermission (+2 more)

### Community 23 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (33): ManagerSdkSession, apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+25 more)

### Community 24 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+27 more)

### Community 25 - "terminal-session.test.ts"
Cohesion: 0.05
Nodes (52): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+44 more)

### Community 26 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (37): nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery() (+29 more)

### Community 27 - "session-presentation.ts"
Cohesion: 0.07
Nodes (50): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+42 more)

### Community 28 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (42): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+34 more)

### Community 29 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (24): benchmarkGroup(), VoiceTtsEngine, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent(), isEnabledConfig() (+16 more)

### Community 30 - "ManagerStore"
Cohesion: 0.07
Nodes (23): openStore(), JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), PersistedCursor, emptyState(), JournalDraft (+15 more)

### Community 31 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 32 - "active-sessions.ts"
Cohesion: 0.07
Nodes (49): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+41 more)

### Community 33 - "SessionService"
Cohesion: 0.07
Nodes (10): ActiveClaudeQuery, mapWithConcurrency(), registerNodeRoutes(), releases, session, snapshot, readServiceResources(), ResourceReads (+2 more)

### Community 34 - "createManagerTools"
Cohesion: 0.07
Nodes (17): busyReason(), createManagerTools(), closeCapReached(), define(), deliver(), proactiveSessionAllowed(), requireComputer(), resolveSession() (+9 more)

### Community 35 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (44): executeCommand(), listWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+36 more)

### Community 36 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (30): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+22 more)

### Community 37 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (33): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+25 more)

### Community 38 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (23): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+15 more)

### Community 39 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (12): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+4 more)

### Community 40 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (41): directories, exec, [root], assertSameIdentity(), createIsolatedTmuxRoot(), execFileAsync, abandoned, abandonFixture() (+33 more)

### Community 41 - "session-resource-clear.test.ts"
Cohesion: 0.06
Nodes (43): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), disk (+35 more)

### Community 42 - "app.ts"
Cohesion: 0.06
Nodes (30): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+22 more)

### Community 43 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (11): headerSafe(), RemoteNodeClient, requestBytes(), client(), servers, session, BackgroundTaskSnapshot, NodeInfo (+3 more)

### Community 44 - "DreamerService"
Cohesion: 0.13
Nodes (10): boundedText(), digest(), DreamerService, DreamerUnavailableError, uniqueSessionRefs(), DreamerCompletionCandidate, DreamerSnapshot, hasDreamerSessionIdentity() (+2 more)

### Community 45 - "session-directory.ts"
Cohesion: 0.11
Nodes (35): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+27 more)

### Community 46 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 47 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (39): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, deferred() (+31 more)

### Community 48 - "pwa.ts"
Cohesion: 0.08
Nodes (41): AppVersion, parseAppVersion(), deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart() (+33 more)

### Community 49 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (35): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+27 more)

### Community 50 - "hub-routes.ts"
Cohesion: 0.06
Nodes (42): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+34 more)

### Community 52 - "OracleVoiceClient"
Cohesion: 0.15
Nodes (8): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError(), terminalCloseCode()

### Community 53 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 54 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (39): WorkspaceFixtureState, SettingsProfileState, AccentSetting, appearanceSettings, applySettingsChanges(), applySettingsImport(), isRecord(), isSettingsDeviceId() (+31 more)

### Community 55 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 56 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (34): editQueuedManagerMessage(), resolveManagerConfirmation(), applyEvent(), boundWidth(), canTakeFocus(), conversationStateLabel(), ManagerAssistant(), act() (+26 more)

### Community 57 - "FakeVoiceController"
Cohesion: 0.09
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 58 - "dreamer-planner.ts"
Cohesion: 0.09
Nodes (34): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+26 more)

### Community 59 - "FakeSessionService"
Cohesion: 0.07
Nodes (5): FakeSessionService, routingFixture(), session(), temporaryDirectory(), AgentMode

### Community 60 - ".sendInternal"
Cohesion: 0.15
Nodes (34): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), composerHoldsText(), composerText() (+26 more)

### Community 61 - "VoiceClientControl"
Cohesion: 0.13
Nodes (8): VoiceClientControl, captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 62 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 63 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 64 - "dreamer-service.ts"
Cohesion: 0.08
Nodes (32): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, READ_PRIORITY (+24 more)

### Community 65 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (29): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+21 more)

### Community 66 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 67 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isDisposition(), isEventKind() (+29 more)

### Community 68 - "oracle-voice-routes.ts"
Cohesion: 0.11
Nodes (33): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode() (+25 more)

### Community 69 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 70 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 71 - "react"
Cohesion: 0.08
Nodes (22): react, getManager(), transcribeAudio(), updateManagerSettings(), MarkdownCodeBlock(), originalClipboard, drawDiagram(), drawing (+14 more)

### Community 72 - "ManagerProactiveCoordinator"
Cohesion: 0.12
Nodes (10): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, SessionLifecycle, directories, fixture() (+2 more)

### Community 73 - "manager-structured-memory-search.ts"
Cohesion: 0.10
Nodes (29): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+21 more)

### Community 74 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (30): isMissing(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES (+22 more)

### Community 75 - "oracle-voice-config.ts"
Cohesion: 0.10
Nodes (25): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+17 more)

### Community 76 - "DreamerProgress"
Cohesion: 0.11
Nodes (10): DreamerProgress, DreamerProgressSource, keyOf(), notOlder(), progressExcerpt(), Detail, FakeSource, setup() (+2 more)

### Community 77 - "KnowledgeStore"
Cohesion: 0.12
Nodes (14): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+6 more)

### Community 78 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (22): FakeVoiceEngineCall, VoiceStartUtterance, SocketMessage, apps, BlockingEngine, config, configFixture(), connect() (+14 more)

### Community 79 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 80 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 81 - "AgentProvider"
Cohesion: 0.08
Nodes (20): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+12 more)

### Community 82 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+24 more)

### Community 83 - "capture.ts"
Cohesion: 0.07
Nodes (16): BufferedFrame, defaultAudioContext(), positiveLimit(), CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode, VoiceVad (+8 more)

### Community 84 - "manager-context.ts"
Cohesion: 0.13
Nodes (27): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+19 more)

### Community 85 - "ManagerStructuredMemoryStore"
Cohesion: 0.16
Nodes (9): digest(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput (+1 more)

### Community 86 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 87 - "oracle-voice-child.test.ts"
Cohesion: 0.09
Nodes (12): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+4 more)

### Community 88 - "OracleVoiceCoordinator"
Cohesion: 0.15
Nodes (3): OracleVoiceCoordinator, resolvedAudioGate(), ActiveConversation

### Community 89 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 90 - "PushNotificationService"
Cohesion: 0.16
Nodes (4): HubEventSource, PushNotificationService, scoped(), registerPushRoutes()

### Community 91 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (9): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+1 more)

### Community 92 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (17): removeQueuedManagerMessage(), retryManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability, empty (+9 more)

### Community 93 - "client.test.ts"
Cohesion: 0.09
Nodes (9): OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse() (+1 more)

### Community 94 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 95 - "push-notification-service.ts"
Cohesion: 0.12
Nodes (20): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+12 more)

### Community 96 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 97 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 98 - "backgroundTasksFromEvents"
Cohesion: 0.18
Nodes (28): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventString(), eventTask(), executionModeValue(), lastForegroundCompletionAt() (+20 more)

### Community 99 - "background-task-stop.test.ts"
Cohesion: 0.13
Nodes (18): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot(), started() (+10 more)

### Community 100 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 101 - "manager-tools.ts"
Cohesion: 0.08
Nodes (26): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, computerField, ContextTier, trustFolder(), CreationRefusal, DECLINE_WORDS (+18 more)

### Community 102 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 104 - "oracle-voice-coordinator.ts"
Cohesion: 0.10
Nodes (16): ManagerEventSource, ManagerEventSource, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnection (+8 more)

### Community 105 - "registerSessionKnowledgeRoutes"
Cohesion: 0.14
Nodes (21): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+13 more)

### Community 106 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (21): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+13 more)

### Community 107 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 108 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 109 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+11 more)

### Community 110 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (12): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+4 more)

### Community 111 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 112 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (21): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isLiveTaskStatus(), isOlderExecution(), isShellObserverTool() (+13 more)

### Community 113 - "VoiceTurnState"
Cohesion: 0.15
Nodes (3): AudioCompletion, errorMessage(), VoiceTurnState

### Community 114 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 115 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 116 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 117 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 118 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 119 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 120 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 121 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 122 - "use-oracle-conversation.test.tsx"
Cohesion: 0.15
Nodes (9): OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, availableCapability, defaults, FakeVoiceClient, renderConversation(), transcript() (+1 more)

### Community 123 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 124 - "normalizeKnowledgeRelativePath"
Cohesion: 0.21
Nodes (16): knowledgeRelativePathSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot() (+8 more)

### Community 125 - "ManagerProactiveInbox"
Cohesion: 0.22
Nodes (4): isAlreadyExists(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 126 - "SettingsProfileSnapshot"
Cohesion: 0.16
Nodes (11): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), profileStore(), updateSchema, SettingsProfileStore, directories (+3 more)

### Community 127 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 128 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 129 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 130 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 131 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 132 - "client.ts"
Cohesion: 0.13
Nodes (13): ORACLE_VOICE_CONNECTION_TIMEOUT_MS, closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, PendingHello (+5 more)

### Community 133 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 134 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 135 - ".withFormViewport"
Cohesion: 0.18
Nodes (13): FormReplyDeadlineError, hasClippedTerminalFormTabs(), parseTerminalFormActiveField(), submitTerminalForm(), tabNames(), terminalBoxWrap(), terminalChecklistState(), terminalFormCommitKeys() (+5 more)

### Community 136 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 137 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 138 - "settings-profile.test.ts"
Cohesion: 0.16
Nodes (5): settingsProfileCacheKey, SettingsProfileTransport, cached(), FakeHub, MemoryStorage

### Community 139 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 140 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 141 - ".askSession"
Cohesion: 0.22
Nodes (4): sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout()

### Community 142 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 143 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 144 - "session-patch-integration.test.ts"
Cohesion: 0.23
Nodes (5): Client, Browser, HubResyncRequest, HubWireEvent, SessionPatchReceiver

### Community 145 - "NewSessionDialog"
Cohesion: 0.22
Nodes (15): activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession(), computerProviders() (+7 more)

### Community 146 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 147 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 148 - "manager-proactive-inbox.test.ts"
Cohesion: 0.16
Nodes (9): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState() (+1 more)

### Community 149 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 150 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 151 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 152 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 153 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 154 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 155 - "HubEvent"
Cohesion: 0.21
Nodes (8): ComputerManagerEvents, diffMessages(), Publication, sameMessage(), SessionUpserted, seedOffset, HubEvent, SessionMessagesPatch

### Community 156 - "file-upload-routes.ts"
Cohesion: 0.27
Nodes (7): FileUploadError, registerFileUploadRoutes(), SessionParams, extension(), MAX_SESSION_FILE_BYTES, supportedExtensions, supportsSessionFile()

### Community 157 - "ChatMessage"
Cohesion: 0.21
Nodes (10): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp(), StoredSession, ChatMessage (+2 more)

### Community 158 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 159 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

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

### Community 167 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 168 - "DreamerMorningPlan"
Cohesion: 0.38
Nodes (10): DreamerMorningPlan(), confirmCompletion(), confirmTaskCompletion(), dispatchTask(), disposition(), edit(), investigate(), move() (+2 more)

### Community 169 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 171 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 173 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 174 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 175 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 176 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 178 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 179 - "backgroundHandoff"
Cohesion: 0.38
Nodes (7): attachmentModeValue(), backgroundHandoff(), booleanValue(), rawTailText(), shellStopAcknowledged(), shellTaskMode(), toolTelemetryProperties()

### Community 180 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 181 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 182 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 184 - "manager-structured-memory-intent.ts"
Cohesion: 0.50
Nodes (3): hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 185 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 186 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 188 - "settings-profile-routes.test.ts"
Cohesion: 0.50
Nodes (4): directories, fakeManager(), hub(), local

## Knowledge Gaps
- **1203 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1198 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2019 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `contracts.ts`, `agent-service.ts`, `.discoverSessions`, `CopilotClientLike`, `.askSession`, `session-directory.ts`, `claude-agent-service.ts`, `TerminalSessionController`, `queued-dispatch.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionDetail`, `ManagedSession`, `oracle-voice-soak.ts`, `manager-agent.ts`, `ManagerAgent`, `ManagerMessage`, `transcription-service.ts`, `file-upload-routes.ts`, `oracle-voice-worker.ts`, `ManagerStore`, `SessionService`, `session-knowledge-routes.test.ts`, `oracle-task-store.ts`, `dreamer-routes.ts`, `DreamerService`, `pwa.ts`, `ProviderSessionService`, `ManagerProactiveCoordinator`, `oracle-voice-config.ts`, `KnowledgeStore`, `ManagerStructuredMemoryStore`, `PushNotificationService`, `SessionKnowledgeStore`, `SessionOrderStore`, `cli-canary.ts`, `refusal-metrics.ts`, `ManagerProactiveInbox`, `SettingsProfileSnapshot`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ClaudeAgentService` connect `SessionDetail` to `SessionService`, `contracts.ts`, `.discoverSessions`, `session-resource-clear.test.ts`, `session-directory.ts`, `claude-agent-service.ts`, `queued-dispatch.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1203 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03896990684290104 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.032684139645706 - nodes in this community are weakly interconnected._
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
