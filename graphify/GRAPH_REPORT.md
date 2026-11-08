# Agentic Remote - Graphify code map

Snapshot: `9054a01b879225889399e736b6ad9573997833de3579b6c29aca7b532e90bd63`

Source checkout: `d29c0513828f06b626664bbea5b2b7e7b07ebfe0`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 410 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 410 files · ~864,998 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7125 nodes · 19798 edges · 211 communities (168 shown, 27 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1053 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionStore
- AgentService
- api.ts
- App.tsx
- App
- ClaudeAgentService
- contracts.ts
- agent-service.ts
- node-routes.ts
- oracle-voice-security.test.ts
- oracle-voice.ts
- app.ts
- CopilotClientLike
- manager-tools.ts
- .sendAdmittedWithBackend
- session-resources.ts
- ManagedSession
- oracle-voice-child.ts
- dreamer-store.ts
- agentic-remote-promotion-monitor
- oracle-voice-soak.ts
- ManagerAgent
- terminal-session.ts
- RemoteNodeClient
- session-presentation.ts
- PushNotificationService
- ManagerAssistant.tsx
- transcription-service.ts
- oracle-task-store.ts
- manager-agent.ts
- ManagerStore
- oracle-voice-worker.ts
- manager-structured-memory-validation.ts
- oracle-voice-integration.test.ts
- oracle-voice-coordinator.ts
- markdown-navigation.ts
- SessionDetail
- FakeManager
- tmux-test-helpers.ts
- send-matrix.integration.test.ts
- workspace-fixtures.ts
- TmuxTerminalSessionController
- OracleDreamer.tsx
- tmux-errors.integration.test.ts
- dreamer-planner.ts
- DreamerService
- ManagerProactiveCoordinator
- .sendInternal
- session-directory.ts
- dreamer-progress.ts
- agentic-remote
- fake-voice.ts
- oracle-voice-benchmark.ts
- hub-routes.ts
- manager-agent.test.ts
- ProviderSessionService
- OracleVoiceClient
- bundle
- FakeSessionService
- session-resource-clear.test.ts
- SessionService
- ManagerMessage
- normalizeKnowledgeRelativePath
- OracleVoiceCoordinator
- shell.ts
- lib.rs
- background-task-adapter.ts
- manager-structured-memory.ts
- pwa.ts
- agentic-remote-promotion-setup
- oracle-voice-config.ts
- agentic-remote-gate
- config.rs
- KnowledgeStore
- manager-proactive-inbox.ts
- knowledge-tree.ts
- active-sessions.ts
- oracle-voice-routes.ts
- dependencies
- devDependencies
- ManagerStructuredMemoryStore
- oracle-voice-child.test.ts
- EngineVoiceBackendSession
- manager-context.ts
- SessionKnowledgeStore
- oracle-voice-segments.ts
- capture-workspace.ts
- shared/settings-profile.ts
- VoicePlayback
- SessionOrderStore
- terminal-session.test.ts
- use-oracle-conversation.test.tsx
- session-patch-browser.ts
- cli-canary.ts
- manager-structured-memory-search.ts
- src/settings-profile.ts
- scripts
- HubEvent
- registerSessionKnowledgeRoutes
- VoiceCapture
- react
- settings-profile-store.ts
- compilerOptions
- SettingsProfileClient
- dreamer-service.ts
- .observe
- oracle-voice-tickets.ts
- session-knowledge-store.ts
- session-reply-durability.test.ts
- full-gate.test.ts
- PromptCards.tsx
- capture.ts
- capture.test.ts
- compilerOptions
- .toolHost
- ManagerProactiveInbox
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- session-store-providers.test.ts
- client.ts
- recordValue
- VoiceTurnState
- BoundedQueue
- FakeSocket
- ReaderWorkspace
- session-latency-benchmark.ts
- dreamer-schedule.ts
- startup-phases.test.ts
- terminal-form-deadline.test.ts
- promotion-monitor.test.ts
- recovery-resend-durability.test.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- NewSessionDialog
- scripts
- DeferredSession
- background-task-stop.test.ts
- oracle-voice-assets.test.ts
- pending-echo.ts
- fake-vad.ts
- desktop.json
- manager-proactive-inbox.test.ts
- .handleManagerEvent
- OracleVoiceClientDependencies
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- background-task-tracker.ts
- session-response-order.ts
- Pcm16Resampler
- BackgroundTasksDialog.tsx
- html-preview.ts
- settings-profile.test.ts
- dataset
- generate-pwa-icons.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- .transport
- KnowledgePosition
- dreamer-routes.ts
- promotion-setup-execution.test.ts
- SessionAdmissions
- vite.config.ts
- package.json
- recovery-context.ts
- release-publication.test.ts
- OracleVoicePlayback
- oracle-conversation-real.test.ts
- render-workspace-gifs.ts
- settings.ts
- VoiceCaptureOptions
- composer-layout.test.ts
- manager-structured-memory-performance.test.ts
- promotion-setup.test.ts
- SessionKnowledgeLifecycle
- FakeRecorder
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
1. `SessionDetail` - 310 edges
2. `AgentService` - 288 edges
3. `App()` - 278 edges
4. `SessionStore` - 190 edges
5. `ClaudeAgentService` - 126 edges
6. `ManagedSession` - 123 edges
7. `ManagerAgent` - 97 edges
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

## Communities (211 total, 27 thin omitted)

### Community 0 - "SessionStore"
Cohesion: 0.02
Nodes (94): fixture(), restart(), fixture(), connect(), createStore(), deferred(), disk, enqueue() (+86 more)

### Community 1 - "AgentService"
Cohesion: 0.04
Nodes (13): agentMode(), AgentService, lifecycleRefusal(), normalizedTitle(), removeCopilotSessionFiles(), RuntimeConfigurationError, suspendedRuntimeConflict(), suspendRefused() (+5 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (125): SettingsChange, SettingsProfileKey, SettingsProfileValues, SettingsUpdateResult, parseSubmissionReceipt(), addComputer(), addKnowledgeRoot(), bootstrapSessionOrder() (+117 more)

### Community 3 - "App.tsx"
Cohesion: 0.02
Nodes (122): isManagerEvent(), alertNotification(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+114 more)

### Community 4 - "App"
Cohesion: 0.04
Nodes (131): terminalSendOptions(), submissionReceiptFromError(), askSession(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown() (+123 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (11): ClaudeAgentService, isMissingClaudeSessionError(), ownsDispatchRecovery(), preflight(), preparePrompt(), queueConflict(), QueuedDispatches, assertSessionNotRetained() (+3 more)

### Community 6 - "contracts.ts"
Cohesion: 0.03
Nodes (84): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+76 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.03
Nodes (93): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+85 more)

### Community 8 - "node-routes.ts"
Cohesion: 0.03
Nodes (62): BuildAppOptions, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema (+54 more)

### Community 9 - "oracle-voice-security.test.ts"
Cohesion: 0.03
Nodes (51): apps, directories, voiceBackend(), FakeVoiceEngine, FakeVoiceEngineCall, FakeVoiceEngineFactory, identityKey(), isCancelled() (+43 more)

### Community 10 - "oracle-voice.ts"
Cohesion: 0.05
Nodes (60): VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient (+52 more)

### Community 11 - "app.ts"
Cohesion: 0.04
Nodes (63): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ServerRole (+55 more)

### Community 12 - "CopilotClientLike"
Cohesion: 0.03
Nodes (61): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+53 more)

### Community 13 - "manager-tools.ts"
Cohesion: 0.04
Nodes (51): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+43 more)

### Community 14 - ".sendAdmittedWithBackend"
Cohesion: 0.03
Nodes (30): commandShortcut(), isTerminalNotReadyRefusal(), stripAnsi(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), QueuedDelivery (+22 more)

### Community 15 - "session-resources.ts"
Cohesion: 0.06
Nodes (58): ActiveClaudeQuery, ClaudeResources, releases, session, snapshot, readClaudeMcp(), readCopilotResource(), copilotTransport() (+50 more)

### Community 16 - "ManagedSession"
Cohesion: 0.08
Nodes (17): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, FakeManager (+9 more)

### Community 17 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (42): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+34 more)

### Community 18 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (44): validateDreamerTimeZone(), assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+36 more)

### Community 19 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 20 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 21 - "ManagerAgent"
Cohesion: 0.07
Nodes (14): automaticPayload(), checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+6 more)

### Community 22 - "terminal-session.ts"
Cohesion: 0.05
Nodes (70): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerHoldsOtherText() (+62 more)

### Community 23 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (15): headerSafe(), RemoteNodeClient, client(), servers, session, RemoteNodeCapabilityError, RemoteNodeTransportError, BackgroundTaskSnapshot (+7 more)

### Community 24 - "session-presentation.ts"
Cohesion: 0.06
Nodes (55): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, ProgressTime(), reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView (+47 more)

### Community 25 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 26 - "ManagerAssistant.tsx"
Cohesion: 0.06
Nodes (51): cancelManager(), editQueuedManagerMessage(), getManager(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage() (+43 more)

### Community 27 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 28 - "oracle-task-store.ts"
Cohesion: 0.08
Nodes (42): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+34 more)

### Community 29 - "manager-agent.ts"
Cohesion: 0.06
Nodes (43): DreamerProgressView, discover(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung, TURN_ACTIVITY (+35 more)

### Community 30 - "ManagerStore"
Cohesion: 0.06
Nodes (25): DreamerProgressEntry, openStore(), JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), PersistedCursor, emptyState() (+17 more)

### Community 31 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (26): benchmarkGroup(), EnabledOracleVoiceConfig, VoiceEngineSession, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage() (+18 more)

### Community 32 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 33 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (29): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+21 more)

### Community 34 - "oracle-voice-coordinator.ts"
Cohesion: 0.05
Nodes (31): ManagerEventSource, ManagerEventSource, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OracleVoiceBackendConnection, OracleVoiceBackendConnector, OracleVoiceBackendDisconnect (+23 more)

### Community 35 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (44): executeCommand(), listWorkspace(), readWorkspaceFile(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+36 more)

### Community 36 - "SessionDetail"
Cohesion: 0.07
Nodes (16): isUncertainDelivery(), persistedFormAnswer(), terminalAnswerRefused(), TerminalFormContinuation, validateUserInputForm(), Admission, ExclusiveAdmission, PendingQueueAdmission (+8 more)

### Community 37 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 38 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (43): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+35 more)

### Community 39 - "send-matrix.integration.test.ts"
Cohesion: 0.05
Nodes (46): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+38 more)

### Community 40 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (40): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+32 more)

### Community 41 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (13): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+5 more)

### Community 42 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (41): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+33 more)

### Community 43 - "tmux-errors.integration.test.ts"
Cohesion: 0.06
Nodes (27): fixture(), managers, releases, remote, session(), ComputerRegistry, DurableRegisteredComputer, LegacyRegisteredComputer (+19 more)

### Community 44 - "dreamer-planner.ts"
Cohesion: 0.07
Nodes (34): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+26 more)

### Community 45 - "DreamerService"
Cohesion: 0.13
Nodes (9): DreamerService, DreamerUnavailableError, publicSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate, DreamerSnapshot, hasDreamerSessionIdentity(), isDreamerSessionItem() (+1 more)

### Community 46 - "ManagerProactiveCoordinator"
Cohesion: 0.08
Nodes (14): DreamerServiceOptions, batchMessageId(), isTerminal(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, ProactiveManager, directories, FakeAgent (+6 more)

### Community 47 - ".sendInternal"
Cohesion: 0.12
Nodes (39): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+31 more)

### Community 48 - "session-directory.ts"
Cohesion: 0.10
Nodes (36): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+28 more)

### Community 49 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 50 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 51 - "fake-voice.ts"
Cohesion: 0.06
Nodes (18): ActiveBackendSession, BrowserTestSessionService, installFakeBrowserVoice(), ScriptedUtterance, Window, clockTicksPerSecond(), execFileAsync, GenerationMetrics (+10 more)

### Community 52 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (39): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, deferred() (+31 more)

### Community 53 - "hub-routes.ts"
Cohesion: 0.06
Nodes (42): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+34 more)

### Community 54 - "manager-agent.test.ts"
Cohesion: 0.07
Nodes (21): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+13 more)

### Community 56 - "OracleVoiceClient"
Cohesion: 0.14
Nodes (8): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, playbackClientError(), responseMessage(), terminalCloseCode()

### Community 57 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 58 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 59 - "session-resource-clear.test.ts"
Cohesion: 0.07
Nodes (34): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), apps (+26 more)

### Community 60 - "SessionService"
Cohesion: 0.09
Nodes (3): registerNodeRoutes(), isSessionResourceRoute(), SessionService

### Community 61 - "ManagerMessage"
Cohesion: 0.08
Nodes (21): FakeVoiceState, apps, directories, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError() (+13 more)

### Community 62 - "normalizeKnowledgeRelativePath"
Cohesion: 0.09
Nodes (30): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+22 more)

### Community 63 - "OracleVoiceCoordinator"
Cohesion: 0.11
Nodes (6): AudioCompletion, AudioGate, OracleVoiceCoordinator, resolvedAudioGate(), terminalStartupCloseCode(), ActiveConversation

### Community 64 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 65 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 66 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (37): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, eventString(), eventTask() (+29 more)

### Community 67 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (32): ManagerStructuredMemorySearchIndex, ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES (+24 more)

### Community 68 - "pwa.ts"
Cohesion: 0.10
Nodes (35): getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle(), currentAppViewportGeometry() (+27 more)

### Community 69 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 70 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (26): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+18 more)

### Community 71 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 72 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 73 - "KnowledgeStore"
Cohesion: 0.11
Nodes (15): WorkspaceFixtureState, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState (+7 more)

### Community 74 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (36): assertExactKeys(), DISPOSITIONS, EVENT_KINDS, hasExactKeys(), isAlreadyExists(), isDisposition(), isEventKind(), isId() (+28 more)

### Community 75 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 76 - "active-sessions.ts"
Cohesion: 0.11
Nodes (31): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+23 more)

### Community 77 - "oracle-voice-routes.ts"
Cohesion: 0.12
Nodes (32): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode() (+24 more)

### Community 78 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 79 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 80 - "ManagerStructuredMemoryStore"
Cohesion: 0.16
Nodes (9): initializeManagerStructuredMemory(), digest(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMutationResult (+1 more)

### Community 81 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (12): childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize(), InProcessVoiceChild (+4 more)

### Community 82 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 83 - "manager-context.ts"
Cohesion: 0.13
Nodes (26): ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine(), followUpLine() (+18 more)

### Community 84 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 85 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 86 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 87 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (29): AccentSetting, appearanceSettings, applySettingsImport(), DEFAULT_SESSION_PROVIDER, isRecord(), isSettingsProfileKey(), NewSessionBackendSetting, newSessionBackendSettings (+21 more)

### Community 88 - "VoicePlayback"
Cohesion: 0.13
Nodes (6): pcm16ToFloat(), SegmentDrain, FakeSource, harness(), validateGeneration(), VoicePlayback

### Community 89 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 90 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (23): isTerminalVisiblyIdle(), parseTerminalUpdateNotice(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), deliveryFixture(), desktopInstallPane, directories (+15 more)

### Community 91 - "use-oracle-conversation.test.tsx"
Cohesion: 0.12
Nodes (13): getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability, defaults (+5 more)

### Community 92 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 93 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 94 - "manager-structured-memory-search.ts"
Cohesion: 0.13
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 95 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (22): AppearanceSetting, isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, statuslineItems, Appearance, appearanceFrom() (+14 more)

### Community 96 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 97 - "HubEvent"
Cohesion: 0.14
Nodes (13): Connection, WorkspaceFixture, ComputerManagerEvents, Client, PatchSocket, Browser, seedOffset, ChatMessage (+5 more)

### Community 98 - "registerSessionKnowledgeRoutes"
Cohesion: 0.14
Nodes (21): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+13 more)

### Community 100 - "react"
Cohesion: 0.11
Nodes (12): react, transcribeAudio(), MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram(), drawing, MermaidDiagram() (+4 more)

### Community 101 - "settings-profile-store.ts"
Cohesion: 0.14
Nodes (14): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), profileStore(), updateSchema, SettingsProfileState, SettingsProfileStore (+6 more)

### Community 102 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 103 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 104 - "dreamer-service.ts"
Cohesion: 0.14
Nodes (20): DreamerPlanDraft, DreamerPlannerInput, boundedText(), digest(), DreamerPlannerExecutionInput, planWithFingerprints(), safeRunError(), unavailableSnapshot() (+12 more)

### Community 105 - ".observe"
Cohesion: 0.16
Nodes (10): canonicalHash(), cloneState(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError (+2 more)

### Community 106 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 107 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 108 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (17): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+9 more)

### Community 109 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 110 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 111 - "capture.ts"
Cohesion: 0.13
Nodes (15): BufferedFrame, defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, validateIdentity(), VoiceCaptureError, VoiceCaptureErrorCode (+7 more)

### Community 112 - "capture.test.ts"
Cohesion: 0.10
Nodes (5): CaptureControl, harness(), VoiceCaptureDependencies, VoiceVad, VoiceVadOptions

### Community 113 - "compilerOptions"
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

### Community 120 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 121 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (8): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession()

### Community 122 - "client.ts"
Cohesion: 0.12
Nodes (13): closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, OracleVoiceSocket, parseHello() (+5 more)

### Community 123 - "recordValue"
Cohesion: 0.18
Nodes (18): attachmentModeValue(), backgroundHandoff(), booleanValue(), errorValue(), notificationKind(), parsedValue(), rawTailText(), recordValue() (+10 more)

### Community 124 - "VoiceTurnState"
Cohesion: 0.18
Nodes (3): errorMessage(), PendingFinalTurn, VoiceTurnState

### Community 125 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 126 - "FakeSocket"
Cohesion: 0.13
Nodes (5): FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse()

### Community 127 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 128 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 129 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (15): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+7 more)

### Community 130 - "startup-phases.test.ts"
Cohesion: 0.13
Nodes (11): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseRecord, address, directories, recorder() (+3 more)

### Community 131 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 132 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 133 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 134 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 135 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 136 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession() (+8 more)

### Community 137 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 138 - "DeferredSession"
Cohesion: 0.15
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 139 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 140 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 141 - "pending-echo.ts"
Cohesion: 0.24
Nodes (11): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, PendingEchoOwner, prunePendingEchoMap() (+3 more)

### Community 142 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 143 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 144 - "manager-proactive-inbox.test.ts"
Cohesion: 0.16
Nodes (9): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState() (+1 more)

### Community 146 - "OracleVoiceClientDependencies"
Cohesion: 0.19
Nodes (4): defaultDependencies(), OracleVoiceClientDependencies, FakePlayback, VoicePlaybackOptions

### Community 147 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 148 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 149 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 150 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (7): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 151 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 152 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 153 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 154 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 155 - "settings-profile.test.ts"
Cohesion: 0.20
Nodes (6): applySettingsChanges(), sameSettingValue(), samePending(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 156 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 157 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 158 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 159 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 161 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 162 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 163 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 165 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 166 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 167 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 168 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 171 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 172 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 174 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 175 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.53
Nodes (4): benchmarkState(), now(), openFixture(), searchSamples()

### Community 176 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1176 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1171 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1978 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `SessionStore`, `AgentService`, `ClaudeAgentService`, `node-routes.ts`, `ManagedSession`, `ManagerAgent`, `PushNotificationService`, `transcription-service.ts`, `oracle-task-store.ts`, `manager-agent.ts`, `ManagerStore`, `oracle-voice-worker.ts`, `dreamer-routes.ts`, `SessionDetail`, `tmux-errors.integration.test.ts`, `DreamerService`, `ManagerProactiveCoordinator`, `manager-agent.test.ts`, `ProviderSessionService`, `SessionService`, `ManagerMessage`, `oracle-voice-config.ts`, `KnowledgeStore`, `ManagerStructuredMemoryStore`, `SessionKnowledgeStore`, `SessionOrderStore`, `cli-canary.ts`, `settings-profile-store.ts`, `ManagerProactiveInbox`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `SessionDetail`, `ClaudeAgentService`, `contracts.ts`, `agent-service.ts`, `.sendAdmittedWithBackend`, `session-resources.ts`, `session-directory.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `SessionDetail`, `ClaudeAgentService`, `agent-service.ts`, `.sendAdmittedWithBackend`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1176 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.02295552367288379 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.036361589553078916 - nodes in this community are weakly interconnected._
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
