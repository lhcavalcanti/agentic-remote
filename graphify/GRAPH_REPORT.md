# Agentic Remote - Graphify code map

Snapshot: `6be92bd864c33800e7ec7b5ac440b9b92638dbb34afeb2666a51c0155b8c9b63`

Source checkout: `4b49f552accc8adba70bb585b4f4bc9758ec6148`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 415 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 415 files · ~891,630 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7249 nodes · 20126 edges · 214 communities (174 shown, 24 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1059 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- computer-manager.ts
- App
- App.tsx
- SessionDetail
- api.ts
- session-store.ts
- ClaudeAgentService
- contracts.ts
- terminal-session.ts
- agent-service.ts
- ManagedSession
- app.ts
- manager-tools.ts
- claude-agent-service.ts
- ManagerMessage
- oracle-voice.ts
- oracle-voice-soak.ts
- session-store-providers.test.ts
- dreamer-store.ts
- oracle-voice-child.ts
- agentic-remote-promotion-monitor
- ManagerAgent
- SessionService
- oracle-voice-integration.test.ts
- TmuxTerminalSessionController
- transcription-service.ts
- OracleVoiceCoordinator
- terminal-session.test.ts
- FakeVoiceEngine
- workspace-fixtures.ts
- client.ts
- manager-structured-memory-validation.ts
- markdown-navigation.ts
- oracle-voice-worker.ts
- oracle-task-store.ts
- manager-agent.test.ts
- manager-agent.ts
- oracle-voice-benchmark.ts
- tmux-test-helpers.ts
- active-sessions.ts
- EnabledOracleVoiceConfig
- oracle-voice-session.ts
- VoiceAudioFrame
- AgentProvider
- dreamer-progress.ts
- DreamerService
- agentic-remote
- session-directory.ts
- ProviderSessionService
- bundle
- background-task-adapter.ts
- ManagerStore
- recovery-resend-durability.test.ts
- oracle-voice-coordinator.ts
- pwa.ts
- FakeVoiceController
- VoicePlayback
- src/settings-profile.ts
- oracle-voice-config.ts
- UserInputReplyInput
- client.test.ts
- shared/settings-profile.ts
- ManagerAssistant.tsx
- OracleDreamer.tsx
- shell.ts
- lib.rs
- oracle-voice-security.test.ts
- terminal-startup-queue.test.ts
- FakeSessionService
- VoiceCapture
- agentic-remote-promotion-setup
- hub-routes.ts
- manager-proactive-inbox.ts
- agentic-remote-gate
- config.rs
- KnowledgeStore
- dreamer-service.ts
- knowledge-tree.ts
- dependencies
- devDependencies
- dreamer-planner.ts
- manager-structured-memory.ts
- SessionKnowledgeStore
- react
- oracle-voice-child.test.ts
- VoiceCapabilities
- oracle-voice-segments.ts
- remote-voice-client.ts
- capture-workspace.ts
- oracle-voice-routes.test.ts
- push-notification-service.ts
- SessionOrderStore
- session-patch-browser.ts
- ManagerProactiveCoordinator
- ChatMessage
- session-reply-durability.test.ts
- ManagerAssistant.test.tsx
- cli-canary.ts
- manager-structured-memory-search.ts
- PushNotificationService
- scripts
- ManagerStructuredMemoryStore
- SettingsProfileSnapshot
- compilerOptions
- SettingsProfileClient
- agent-service.test.ts
- oracle-voice-tickets.ts
- session-knowledge-store.ts
- compilerOptions
- full-gate.test.ts
- .observe
- PromptCards.tsx
- terminal-form-deadline.test.ts
- compilerOptions
- ManagerProactiveInbox
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- session-resource-routes.test.ts
- .correct
- normalizeKnowledgeRelativePath
- ConfigureRuntimeInput
- dreamer-schedule.ts
- ManagerMemory
- promotion-monitor.test.ts
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- NewSessionDialog
- boundedText
- registerSessionKnowledgeRoutes
- server/session-patches.ts
- scripts
- background-task-stop.test.ts
- oracle-voice-assets.test.ts
- session-knowledge-routes.ts
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- dreamer-service.test.ts
- manager-proactive-inbox.test.ts
- BackgroundTasksDialog.tsx
- OracleSettings.tsx
- session-response-order.ts
- Pcm16Resampler
- pending-echo.ts
- background-task-tracker.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- DeferredSession
- dataset
- generate-pwa-icons.ts
- session-knowledge-routes.test.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- DreamerMorningPlan
- KnowledgePosition
- agent-service-recovery.test.ts
- dreamer-routes.ts
- promotion-setup-execution.test.ts
- remote-node-client.test.ts
- SessionAdmissions
- vite.config.ts
- package.json
- HubEvent
- release-publication.test.ts
- composerTookPaste
- OracleVoicePlayback
- render-workspace-gifs.ts
- history-projection.test.ts
- settings.ts
- .transport
- composer-layout.test.ts
- usePanelWidth
- promotion-setup.test.ts
- push-routes.ts
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
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
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (214 total, 24 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (14): AgentService, isTerminalNotReadyRefusal(), isUncertainDelivery(), lifecycleRefusal(), removeCopilotSessionFiles(), sessionInUseConflictMessage(), suspendedRuntimeConflict(), suspendRefused() (+6 more)

### Community 1 - "computer-manager.ts"
Cohesion: 0.02
Nodes (74): AgentServiceEvents, ClaudeAgentServiceEvents, fixture(), managers, releases, remote, session(), RemoteResync (+66 more)

### Community 2 - "App"
Cohesion: 0.03
Nodes (156): message(), sendLikeTheApp(), terminalSendOptions(), askSession(), clearConversation(), getSession(), recoverConversation(), activeComposerPastes() (+148 more)

### Community 3 - "App.tsx"
Cohesion: 0.02
Nodes (132): isManagerEvent(), addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage() (+124 more)

### Community 4 - "SessionDetail"
Cohesion: 0.04
Nodes (42): fixture(), restart(), fixture(), connect(), createStore(), fixture(), recoveryFixture(), fixture() (+34 more)

### Community 5 - "api.ts"
Cohesion: 0.03
Nodes (118): ResolveManagerConfirmationInput, SendManagerMessageInput, addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), configureRetention(), createOracleVoiceTicket() (+110 more)

### Community 6 - "session-store.ts"
Cohesion: 0.02
Nodes (92): CopilotClientLike, directories, fakeClient(), ForkRequest, forkSession(), services, ClaudeSdk, deferred() (+84 more)

### Community 7 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (25): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+17 more)

### Community 8 - "contracts.ts"
Cohesion: 0.03
Nodes (90): hasActiveBackgroundTasks(), ActivityStatus, AddKnowledgeRootInput, BackgroundTaskAttachmentMode, BackgroundTaskExecutionMode, BackgroundTaskSnapshot, DispatchQueuedPromptInput, ManagedSessionMcpServersSnapshot (+82 more)

### Community 9 - "terminal-session.ts"
Cohesion: 0.05
Nodes (98): activeBottomFrame(), boxedComposerFrame(), captureBeforeDeadline(), captureTerminal(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes (+90 more)

### Community 10 - "agent-service.ts"
Cohesion: 0.04
Nodes (89): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+81 more)

### Community 11 - "ManagedSession"
Cohesion: 0.06
Nodes (15): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), ManagerEventSource, registerHubRoutes(), SessionMuteCarrier, ManagerHub (+7 more)

### Community 12 - "app.ts"
Cohesion: 0.03
Nodes (68): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+60 more)

### Community 13 - "manager-tools.ts"
Cohesion: 0.04
Nodes (53): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+45 more)

### Community 14 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (66): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+58 more)

### Community 15 - "ManagerMessage"
Cohesion: 0.04
Nodes (46): FakeManager, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, apps, directories, DreamerServiceOptions (+38 more)

### Community 16 - "oracle-voice.ts"
Cohesion: 0.05
Nodes (71): nodeVoiceCapabilities(), sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes() (+63 more)

### Community 17 - "oracle-voice-soak.ts"
Cohesion: 0.04
Nodes (36): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+28 more)

### Community 18 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (45): CopilotSessionLike, CopilotTasksApi, openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery() (+37 more)

### Community 19 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (48): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+40 more)

### Community 20 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (42): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+34 more)

### Community 21 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 22 - "ManagerAgent"
Cohesion: 0.08
Nodes (12): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, uniqueManagerSessionRefs() (+4 more)

### Community 23 - "SessionService"
Cohesion: 0.04
Nodes (34): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema (+26 more)

### Community 24 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (33): ManagerSdkSession, apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+25 more)

### Community 25 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (24): startAgentAfterClear(), capturePane(), composerHoldsText(), composerText(), copilotCommand(), endProbeSession(), execFileAsync, isTerminalAgentWorking() (+16 more)

### Community 26 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+27 more)

### Community 27 - "OracleVoiceCoordinator"
Cohesion: 0.09
Nodes (6): errorMessage(), OracleVoiceCoordinator, PendingFinalTurn, withTimeout(), VoiceTurnState, VoiceClientControl

### Community 28 - "terminal-session.test.ts"
Cohesion: 0.05
Nodes (52): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+44 more)

### Community 29 - "FakeVoiceEngine"
Cohesion: 0.06
Nodes (26): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceSttEngine, VoiceTtsEngine, VoiceUtteranceAudioFrame (+18 more)

### Community 30 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (43): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+35 more)

### Community 31 - "client.ts"
Cohesion: 0.10
Nodes (20): VoiceServerControl, captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord(), isTicket() (+12 more)

### Community 32 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 33 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (46): executeCommand(), listWorkspace(), searchWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink() (+38 more)

### Community 34 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (24): benchmarkGroup(), ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent() (+16 more)

### Community 35 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (35): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+27 more)

### Community 36 - "manager-agent.test.ts"
Cohesion: 0.06
Nodes (25): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail(), FakeClient (+17 more)

### Community 37 - "manager-agent.ts"
Cohesion: 0.08
Nodes (41): DreamerProgressEntry, DreamerProgressView, automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions, messagePriority() (+33 more)

### Community 38 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 39 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (41): directories, exec, [root], assertSameIdentity(), createIsolatedTmuxRoot(), execFileAsync, abandoned, abandonFixture() (+33 more)

### Community 40 - "active-sessions.ts"
Cohesion: 0.08
Nodes (44): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+36 more)

### Community 41 - "EnabledOracleVoiceConfig"
Cohesion: 0.07
Nodes (18): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+10 more)

### Community 42 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (16): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), outputBytes() (+8 more)

### Community 43 - "VoiceAudioFrame"
Cohesion: 0.05
Nodes (25): BrowserCaptureOptions, SocketMessage, AudioReservation, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, VoiceAudioFrame (+17 more)

### Community 44 - "AgentProvider"
Cohesion: 0.07
Nodes (33): JournalRecorderOptions, Seen, PersistedCursor, JournalDraft, JournalEntry, JournalKind, ManagerState, ManagerStoreOptions (+25 more)

### Community 45 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 46 - "DreamerService"
Cohesion: 0.14
Nodes (7): digest(), DreamerService, DreamerUnavailableError, uniqueSessionRefs(), DreamerCompletionCandidate, DreamerSnapshot, OracleTaskAttempt

### Community 47 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 48 - "session-directory.ts"
Cohesion: 0.11
Nodes (36): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+28 more)

### Community 50 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 51 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (42): backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, errorValue() (+34 more)

### Community 52 - "ManagerStore"
Cohesion: 0.08
Nodes (8): openStore(), emptyState(), ManagerStore, open(), createManager(), StoredManager, createManager(), SecurityManager

### Community 53 - "recovery-resend-durability.test.ts"
Cohesion: 0.07
Nodes (23): directories, disk, gate(), gates, httpBoundary(), initialize(), PublicSessionValue, runtimes (+15 more)

### Community 54 - "oracle-voice-coordinator.ts"
Cohesion: 0.07
Nodes (25): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnector (+17 more)

### Community 55 - "pwa.ts"
Cohesion: 0.09
Nodes (38): AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+30 more)

### Community 56 - "FakeVoiceController"
Cohesion: 0.09
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 57 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 58 - "src/settings-profile.ts"
Cohesion: 0.07
Nodes (29): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, SettingsUpdateResult (+21 more)

### Community 59 - "oracle-voice-config.ts"
Cohesion: 0.08
Nodes (29): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+21 more)

### Community 60 - "UserInputReplyInput"
Cohesion: 0.11
Nodes (7): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), persistedFormAnswer(), statusFromEvents(), terminalAnswerRefused(), validateUserInputForm(), UserInputReplyInput

### Community 61 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 62 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (37): SettingsProfileState, AccentSetting, appearanceSettings, applySettingsChanges(), applySettingsImport(), isRecord(), isSettingsDeviceId(), isSettingsProfileKey() (+29 more)

### Community 63 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (31): editQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), phoneEnterCreatesNewline(), applyEvent(), canTakeFocus(), conversationStateLabel() (+23 more)

### Community 64 - "OracleDreamer.tsx"
Cohesion: 0.11
Nodes (30): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition (+22 more)

### Community 65 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 66 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 67 - "oracle-voice-security.test.ts"
Cohesion: 0.06
Nodes (22): apps, directories, VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), connect() (+14 more)

### Community 68 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (29): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+21 more)

### Community 70 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 71 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 72 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 73 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isAlreadyExists(), isDisposition() (+29 more)

### Community 74 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 75 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 76 - "KnowledgeStore"
Cohesion: 0.11
Nodes (15): WorkspaceFixtureState, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState (+7 more)

### Community 77 - "dreamer-service.ts"
Cohesion: 0.10
Nodes (29): DREAMER_MAX_ITEMS, DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), projectDreamerRegistry(), projectRegistryEntry(), boundedText() (+21 more)

### Community 78 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (33): WorkspaceEntry, listKnowledgeEntries(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+25 more)

### Community 79 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 80 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 81 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (30): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+22 more)

### Community 82 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (28): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+20 more)

### Community 83 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 84 - "react"
Cohesion: 0.09
Nodes (15): react, SessionRetention, SessionRetentionPatch, transcribeAudio(), MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram() (+7 more)

### Community 85 - "oracle-voice-child.test.ts"
Cohesion: 0.09
Nodes (12): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+4 more)

### Community 86 - "VoiceCapabilities"
Cohesion: 0.10
Nodes (15): OracleVoiceBackendConnection, VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState (+7 more)

### Community 87 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 88 - "remote-voice-client.ts"
Cohesion: 0.16
Nodes (14): VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+6 more)

### Community 89 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 90 - "oracle-voice-routes.test.ts"
Cohesion: 0.08
Nodes (14): ActiveBackendSession, ObservedLocalVoiceBackend, openApps, openSockets, RouteManager, RouteVoiceBackend, runtime(), testRoot() (+6 more)

### Community 91 - "push-notification-service.ts"
Cohesion: 0.12
Nodes (21): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+13 more)

### Community 92 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 93 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 94 - "ManagerProactiveCoordinator"
Cohesion: 0.17
Nodes (6): isTerminal(), lifecycles(), ManagerProactiveCoordinator, fixture(), managed(), ManagerProactiveInboxEvent

### Community 95 - "ChatMessage"
Cohesion: 0.12
Nodes (14): nextVoiceControl(), BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, Client, Browser, seedOffset (+6 more)

### Community 96 - "session-reply-durability.test.ts"
Cohesion: 0.12
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 97 - "ManagerAssistant.test.tsx"
Cohesion: 0.08
Nodes (16): cancelManager(), removeQueuedManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+8 more)

### Community 98 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 99 - "manager-structured-memory-search.ts"
Cohesion: 0.13
Nodes (23): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+15 more)

### Community 100 - "PushNotificationService"
Cohesion: 0.20
Nodes (3): PushNotificationService, scoped(), registerPushRoutes()

### Community 101 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 102 - "ManagerStructuredMemoryStore"
Cohesion: 0.15
Nodes (8): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open()

### Community 103 - "SettingsProfileSnapshot"
Cohesion: 0.12
Nodes (15): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), directories, fakeManager(), hub(), local (+7 more)

### Community 104 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 105 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 106 - "agent-service.test.ts"
Cohesion: 0.12
Nodes (13): foregroundTurnOpen(), terminalFormSteps(), busyTerminal(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+5 more)

### Community 107 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 108 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 109 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 110 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 111 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 112 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 113 - "terminal-form-deadline.test.ts"
Cohesion: 0.12
Nodes (15): TerminalFormContinuation, question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture() (+7 more)

### Community 114 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 115 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

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

### Community 120 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 121 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 122 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 123 - "ConfigureRuntimeInput"
Cohesion: 0.16
Nodes (3): agentMode(), RuntimeConfigurationError, ConfigureRuntimeInput

### Community 124 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 125 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 126 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

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

### Community 131 - "boundedText"
Cohesion: 0.21
Nodes (16): addActivity(), attachmentModeValue(), booleanValue(), boundedText(), eventTask(), executionModeValue(), normalizeBackgroundTask(), numberValue() (+8 more)

### Community 132 - "registerSessionKnowledgeRoutes"
Cohesion: 0.26
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 133 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 134 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 135 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 136 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 137 - "session-knowledge-routes.ts"
Cohesion: 0.13
Nodes (10): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema, SessionKnowledgeLifecycle (+2 more)

### Community 138 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 139 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 140 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 141 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 142 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 143 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 144 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 145 - "BackgroundTasksDialog.tsx"
Cohesion: 0.26
Nodes (10): BackgroundTask, BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 146 - "OracleSettings.tsx"
Cohesion: 0.23
Nodes (11): getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps, models (+3 more)

### Community 147 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 148 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 149 - "pending-echo.ts"
Cohesion: 0.28
Nodes (9): nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes(), sameText() (+1 more)

### Community 150 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 151 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 152 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 154 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 155 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 156 - "session-knowledge-routes.test.ts"
Cohesion: 0.22
Nodes (8): ServerRole, SessionMetadataLookup, disk, fixtures, gate(), holdWrite(), releases, trusted

### Community 157 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 158 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 159 - "DreamerMorningPlan"
Cohesion: 0.38
Nodes (10): DreamerMorningPlan(), confirmCompletion(), confirmTaskCompletion(), dispatchTask(), disposition(), edit(), investigate(), move() (+2 more)

### Community 160 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 161 - "agent-service-recovery.test.ts"
Cohesion: 0.25
Nodes (6): holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents()

### Community 162 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 163 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 164 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 166 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 167 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 168 - "HubEvent"
Cohesion: 0.29
Nodes (3): ComputerManagerEvents, HubEventSource, HubEvent

### Community 169 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 170 - "composerTookPaste"
Cohesion: 0.39
Nodes (8): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse(), pastedPlaceholderCount(), qualifyingPasteCount()

### Community 172 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 173 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 174 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 176 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 177 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 178 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 179 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

## Knowledge Gaps
- **1204 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1199 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2019 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `computer-manager.ts`, `SessionDetail`, `agent-service.ts`, `claude-agent-service.ts`, `session-store-providers.test.ts`, `recovery-resend-durability.test.ts`, `session-resource-routes.test.ts`, `ConfigureRuntimeInput`, `UserInputReplyInput`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `AgentService`, `computer-manager.ts`, `SessionDetail`, `ClaudeAgentService`, `ManagedSession`, `ManagerMessage`, `oracle-voice-soak.ts`, `ManagerAgent`, `SessionService`, `transcription-service.ts`, `dreamer-routes.ts`, `oracle-task-store.ts`, `manager-agent.test.ts`, `oracle-voice-worker.ts`, `DreamerService`, `ProviderSessionService`, `ManagerStore`, `pwa.ts`, `oracle-voice-config.ts`, `KnowledgeStore`, `SessionKnowledgeStore`, `SessionOrderStore`, `ManagerProactiveCoordinator`, `cli-canary.ts`, `PushNotificationService`, `ManagerStructuredMemoryStore`, `SettingsProfileSnapshot`, `ManagerProactiveInbox`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ClaudeAgentService` connect `ClaudeAgentService` to `session-reply-durability.test.ts`, `computer-manager.ts`, `SessionDetail`, `claude-agent-service.ts`, `session-store-providers.test.ts`, `SessionService`, `session-resource-routes.test.ts`, `UserInputReplyInput`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1204 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03611076201248377 - nodes in this community are weakly interconnected._
- **Should `computer-manager.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.023754494093477144 - nodes in this community are weakly interconnected._
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
