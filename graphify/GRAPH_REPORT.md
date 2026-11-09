# Agentic Remote - Graphify code map

Snapshot: `7a84c15458a207fa7771a0922458e0bca6e56a32368d705e020c9bc7b7d01470`

Source checkout: `131bec3eb52b9c243e8b2a549ff6de3c95d38920`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 411 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 411 files · ~880,691 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7185 nodes · 19979 edges · 215 communities (180 shown, 19 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1058 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionStore
- App
- api.ts
- App.tsx
- .get
- computer-manager.ts
- agent-service.ts
- ClaudeAgentService
- AgentService
- manager-tools.ts
- SessionService
- claude-agent-service.ts
- ManagerAssistant.tsx
- ManagerAgent
- app.ts
- ManagedSession
- agentic-remote-promotion-monitor
- oracle-voice-soak.ts
- dreamer-store.ts
- oracle-voice-child.ts
- CopilotClientLike
- oracle-voice-security.test.ts
- terminal-session.ts
- PushNotificationService
- sessionKey
- transcription-service.ts
- oracle-task-store.ts
- OracleVoiceCoordinator
- oracle-voice-integration.test.ts
- TmuxTerminalSessionController
- manager.ts
- oracle-voice-routes.test.ts
- DreamerService
- manager-structured-memory-validation.ts
- markdown-navigation.ts
- FakeManager
- ManagerEvent
- session-knowledge-store.ts
- workspace-fixtures.ts
- oracle-voice-benchmark.ts
- session-knowledge-routes.test.ts
- manager-agent.ts
- FakeVoiceEngine
- OracleDreamer.tsx
- oracle-voice-session.ts
- contracts.ts
- active-sessions.ts
- session-directory.ts
- tmux-test-helpers.ts
- SessionDetail
- OracleVoiceClient
- agentic-remote
- oracle-voice.ts
- hub-routes.ts
- oracle-voice-coordinator.ts
- ProviderSessionService
- bundle
- ChildVoiceEngine
- oracle-voice-config.ts
- manager-agent.test.ts
- FakeSessionService
- VoicePlayback
- client.test.ts
- pwa.ts
- session-latency-benchmark.ts
- session-resource-clear.test.ts
- manager-store.ts
- oracle-voice-worker.ts
- lib.rs
- KnowledgeStore
- terminal-startup-queue.test.ts
- .sendInternal
- VoiceCapture
- shell.ts
- agentic-remote-promotion-setup
- queued-dispatch.test.ts
- manager-proactive-inbox.ts
- knowledge-tree.ts
- agentic-remote-gate
- config.rs
- DreamerProgress
- capture.ts
- dependencies
- devDependencies
- oracle-voice-child.test.ts
- VoiceClientControl
- manager-structured-memory.ts
- EngineVoiceBackendSession
- dreamer-planner.ts
- AgentProvider
- dreamer-service.ts
- oracle-voice-segments.ts
- .recoverSdkSession
- registerSessionKnowledgeRoutes
- send-matrix.integration.test.ts
- SessionOrderStore
- client.ts
- shared/settings-profile.ts
- .toolHost
- real-voice.ts
- session-patch-browser.ts
- src/settings-profile.ts
- background-task-adapter.ts
- backgroundTasksFromEvents
- cli-canary.ts
- scripts
- manager-structured-memory-search.ts
- settings-profile-store.ts
- compilerOptions
- ManagerStructuredMemoryStore
- SettingsProfileClient
- terminal-session.test.ts
- capture-workspace.ts
- oracle-voice-tickets.ts
- full-gate.test.ts
- startup-phases.test.ts
- .observe
- VoiceAudioFrame
- session-reply-durability.test.ts
- PromptCards.tsx
- terminal-form-deadline.test.ts
- compilerOptions
- normalizeKnowledgeRelativePath
- ManagerProactiveInbox
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- session-store-providers.test.ts
- SettingsProfileSnapshot
- dreamer-schedule.ts
- ManagerMemory
- .withFormViewport
- use-session-knowledge-root.ts
- BoundedQueue
- ReaderWorkspace
- server/session-patches.ts
- NewSessionDialog
- background-task-stop.test.ts
- promotion-monitor.test.ts
- scripts
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- OracleVoiceClientOptions
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- manager-proactive-inbox.test.ts
- Pcm16Resampler
- background-task-tracker.ts
- dreamer-routes.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- DeferredSession
- .initialize
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- manager-structured-memory-performance.test.ts
- promotion-setup-execution.test.ts
- remote-node-client.test.ts
- SessionAdmissions
- FakeRecorder
- vite.config.ts
- package.json
- backgroundHandoff
- recovery-context.ts
- release-publication.test.ts
- askSession
- OracleVoicePlayback
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- VoiceServerControl
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
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

## Communities (215 total, 19 thin omitted)

### Community 0 - "SessionStore"
Cohesion: 0.02
Nodes (86): fixture(), fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture() (+78 more)

### Community 1 - "App"
Cohesion: 0.03
Nodes (153): isManagerEvent(), alertNotification(), terminalSendOptions(), sessionFileValidationError(), getSession(), uploadSessionFile(), activeComposerPastes(), App() (+145 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (128): SettingsChange, SettingsProfileKey, SettingsProfileValues, SettingsUpdateResult, parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder() (+120 more)

### Community 3 - "App.tsx"
Cohesion: 0.02
Nodes (124): addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+116 more)

### Community 4 - ".get"
Cohesion: 0.05
Nodes (16): agentMode(), isTerminalNotReadyRefusal(), sessionInUseConflictMessage(), suspendedRuntimeConflict(), terminalAnswerRefused(), ownsDispatchRecovery(), preflight(), preparePrompt() (+8 more)

### Community 5 - "computer-manager.ts"
Cohesion: 0.03
Nodes (51): ClaudeAgentServiceEvents, ComputerManagerEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, directories, voiceControlQueues (+43 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.03
Nodes (95): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+87 more)

### Community 7 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (20): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), waitForIdle(), claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred() (+12 more)

### Community 8 - "AgentService"
Cohesion: 0.04
Nodes (11): AgentService, lifecycleRefusal(), restart(), RuntimeConfigurationError, suspendRefused(), httpBoundary(), sideQuestionBoundary(), SideQuestionError (+3 more)

### Community 9 - "manager-tools.ts"
Cohesion: 0.04
Nodes (52): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+44 more)

### Community 10 - "SessionService"
Cohesion: 0.04
Nodes (42): FileUploadError, registerFileUploadRoutes(), SessionParams, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema (+34 more)

### Community 11 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (62): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+54 more)

### Community 12 - "ManagerAssistant.tsx"
Cohesion: 0.04
Nodes (61): react, editQueuedManagerMessage(), getManager(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage() (+53 more)

### Community 13 - "ManagerAgent"
Cohesion: 0.07
Nodes (16): checkContent(), delay(), discover(), errorMessage(), isNotFound(), isPending(), isQueued(), ManagerAgent (+8 more)

### Community 14 - "app.ts"
Cohesion: 0.04
Nodes (53): prefixes, session, trusted, untrusted, apps, directories, buildApp(), BuildAppOptions (+45 more)

### Community 15 - "ManagedSession"
Cohesion: 0.09
Nodes (12): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, FakeManager (+4 more)

### Community 16 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 17 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 18 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (42): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+34 more)

### Community 19 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (35): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+27 more)

### Community 20 - "CopilotClientLike"
Cohesion: 0.03
Nodes (46): CopilotClientLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), directories (+38 more)

### Community 21 - "oracle-voice-security.test.ts"
Cohesion: 0.04
Nodes (23): openStore(), emptyState(), ManagerStore, open(), FakeManager, createManager(), StoredManager, apps (+15 more)

### Community 22 - "terminal-session.ts"
Cohesion: 0.05
Nodes (64): composer(), processAdapter, boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus() (+56 more)

### Community 23 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 24 - "sessionKey"
Cohesion: 0.06
Nodes (56): saveSessionOrderLane(), failureStampFor(), handleDragEnd(), readSelectionFromLocation(), RenameSessionDialog(), KnowledgeRootSelector(), root, ProgressTime() (+48 more)

### Community 25 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 26 - "oracle-task-store.ts"
Cohesion: 0.08
Nodes (43): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+35 more)

### Community 27 - "OracleVoiceCoordinator"
Cohesion: 0.09
Nodes (5): errorMessage(), OracleVoiceCoordinator, PendingFinalTurn, withTimeout(), VoiceTurnState

### Community 28 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+23 more)

### Community 29 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (20): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, parseTerminalUpdateNotice(), processAncestors(), processCommand(), processIsAlive() (+12 more)

### Community 30 - "manager.ts"
Cohesion: 0.05
Nodes (37): FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, confirmationSchema, defaultsSchema, editSchema, effort (+29 more)

### Community 31 - "oracle-voice-routes.test.ts"
Cohesion: 0.04
Nodes (21): voiceBackend(), nodeVoiceCapabilities(), FakeVoiceEngineFactory, GatedVoiceEngineFactory, ObservedLocalVoiceBackend, openApps, openSockets, RouteManager (+13 more)

### Community 32 - "DreamerService"
Cohesion: 0.10
Nodes (16): activeDreamerMemoryIds(), boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), safeRunError(), unavailableSnapshot() (+8 more)

### Community 33 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 34 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (44): executeCommand(), listWorkspace(), readWorkspaceFile(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+36 more)

### Community 35 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 36 - "ManagerEvent"
Cohesion: 0.07
Nodes (18): ManagerEventSource, batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, ProactiveManager (+10 more)

### Community 37 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+22 more)

### Community 38 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (41): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+33 more)

### Community 39 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (41): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 40 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (29): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+21 more)

### Community 41 - "manager-agent.ts"
Cohesion: 0.08
Nodes (41): DreamerProgressEntry, DreamerProgressView, automaticPayload(), ManagerAgentOptions, messagePriority(), Rung, TURN_ACTIVITY, ago() (+33 more)

### Community 42 - "FakeVoiceEngine"
Cohesion: 0.06
Nodes (24): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine, playbackSequence() (+16 more)

### Community 43 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (41): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+33 more)

### Community 44 - "oracle-voice-session.ts"
Cohesion: 0.08
Nodes (43): limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode(), closeReason() (+35 more)

### Community 45 - "contracts.ts"
Cohesion: 0.05
Nodes (37): idleDaysSchema, mergeSessionRetention(), sessionRetentionPatchSchema, sessionRetentionSchema, ActivityStatus, AddKnowledgeRootInput, BackgroundTaskAttachmentMode, BackgroundTaskExecutionMode (+29 more)

### Community 46 - "active-sessions.ts"
Cohesion: 0.08
Nodes (44): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+36 more)

### Community 47 - "session-directory.ts"
Cohesion: 0.10
Nodes (36): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+28 more)

### Community 48 - "tmux-test-helpers.ts"
Cohesion: 0.10
Nodes (37): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+29 more)

### Community 49 - "SessionDetail"
Cohesion: 0.10
Nodes (13): isUncertainDelivery(), persistedFormAnswer(), validateUserInputForm(), Admission, ExclusiveAdmission, PendingQueueAdmission, answer(), claudeRequest() (+5 more)

### Community 50 - "OracleVoiceClient"
Cohesion: 0.14
Nodes (9): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError(), responseMessage() (+1 more)

### Community 51 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 52 - "oracle-voice.ts"
Cohesion: 0.09
Nodes (36): sendNodeVoiceOutput(), capabilities, closeServers, exactArrayBuffer(), sockets, startFields, VoiceNode, decodeVoiceAudioFrame() (+28 more)

### Community 53 - "hub-routes.ts"
Cohesion: 0.06
Nodes (42): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+34 more)

### Community 54 - "oracle-voice-coordinator.ts"
Cohesion: 0.06
Nodes (26): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnector (+18 more)

### Community 56 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 57 - "ChildVoiceEngine"
Cohesion: 0.12
Nodes (9): benchmarkGroup(), VoiceEngineSession, ChildVoiceEngine, errorMessage(), matchesCancelled(), matchesSynthesis(), matchesUtterance(), rememberCancellation() (+1 more)

### Community 58 - "oracle-voice-config.ts"
Cohesion: 0.08
Nodes (29): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+21 more)

### Community 59 - "manager-agent.test.ts"
Cohesion: 0.07
Nodes (20): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+12 more)

### Community 60 - "FakeSessionService"
Cohesion: 0.07
Nodes (5): FakeSessionService, routingFixture(), session(), temporaryDirectory(), AgentMode

### Community 61 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 62 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 63 - "pwa.ts"
Cohesion: 0.10
Nodes (37): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle() (+29 more)

### Community 64 - "session-latency-benchmark.ts"
Cohesion: 0.10
Nodes (26): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+18 more)

### Community 65 - "session-resource-clear.test.ts"
Cohesion: 0.07
Nodes (32): ClaudeSdk, directories, fixture(), queryHandle(), services, deferred(), disk, fixtures (+24 more)

### Community 66 - "manager-store.ts"
Cohesion: 0.08
Nodes (26): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, READ_PRIORITY, Versioned (+18 more)

### Community 67 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (28): FakeVoiceEngineCall, VoiceEndUtterance, VoiceEngineEvent, VoiceGenerationIdentity, VoiceStartUtterance, VoiceSttEngine, VoiceSynthesisRequest, VoiceTtsEngine (+20 more)

### Community 68 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 69 - "KnowledgeStore"
Cohesion: 0.11
Nodes (16): WorkspaceFixtureState, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState (+8 more)

### Community 70 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (29): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+21 more)

### Community 71 - ".sendInternal"
Cohesion: 0.15
Nodes (32): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), composerHoldsText(), composerText() (+24 more)

### Community 72 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 73 - "shell.ts"
Cohesion: 0.10
Nodes (33): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+25 more)

### Community 74 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 75 - "queued-dispatch.test.ts"
Cohesion: 0.06
Nodes (19): QueuedDispatches, accept(), deferred(), disk, fixtures, holdWrite(), prompt(), releases (+11 more)

### Community 76 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isAlreadyExists(), isDisposition() (+29 more)

### Community 77 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (35): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+27 more)

### Community 78 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 79 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 80 - "DreamerProgress"
Cohesion: 0.11
Nodes (10): DreamerProgress, DreamerProgressSource, keyOf(), notOlder(), progressExcerpt(), Detail, FakeSource, setup() (+2 more)

### Community 81 - "capture.ts"
Cohesion: 0.07
Nodes (17): BufferedFrame, defaultAudioContext(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode (+9 more)

### Community 82 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 83 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 84 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 85 - "VoiceClientControl"
Cohesion: 0.15
Nodes (16): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError() (+8 more)

### Community 86 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 87 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 88 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (29): activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem(), digest() (+21 more)

### Community 89 - "AgentProvider"
Cohesion: 0.08
Nodes (20): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+12 more)

### Community 90 - "dreamer-service.ts"
Cohesion: 0.09
Nodes (20): DreamerMemoryMetadata, DreamerMemoryMetadataRecord, DreamerPlanDraft, DreamerPlannerInput, DreamerProgressLimits, DreamerPlannerExecutionInput, DreamerServiceOptions, publicSnapshot() (+12 more)

### Community 91 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 92 - ".recoverSdkSession"
Cohesion: 0.12
Nodes (6): foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), recoveredPermissionTitle(), removeCopilotSessionFiles(), statusFromEvents()

### Community 93 - "registerSessionKnowledgeRoutes"
Cohesion: 0.11
Nodes (22): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+14 more)

### Community 94 - "send-matrix.integration.test.ts"
Cohesion: 0.07
Nodes (25): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+17 more)

### Community 95 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 96 - "client.ts"
Cohesion: 0.10
Nodes (22): VoiceCapabilities, getOracleVoiceCapabilities(), closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode (+14 more)

### Community 97 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (28): AccentSetting, appearanceSettings, applySettingsChanges(), DEFAULT_SESSION_PROVIDER, isRecord(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting (+20 more)

### Community 98 - ".toolHost"
Cohesion: 0.10
Nodes (5): ManagerHub, CreateSessionInput, PermissionReplyInput, RenameSessionInput, SendMessageInput

### Community 99 - "real-voice.ts"
Cohesion: 0.12
Nodes (11): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+3 more)

### Community 100 - "session-patch-browser.ts"
Cohesion: 0.12
Nodes (26): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+18 more)

### Community 101 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (23): AppearanceSetting, isSettingsDeviceId(), isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, statuslineItems, Appearance (+15 more)

### Community 102 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (25): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus() (+17 more)

### Community 103 - "backgroundTasksFromEvents"
Cohesion: 0.19
Nodes (27): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventString(), eventTask(), executionModeValue(), lastForegroundCompletionAt() (+19 more)

### Community 104 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 105 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 106 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 107 - "settings-profile-store.ts"
Cohesion: 0.14
Nodes (14): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+6 more)

### Community 108 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 109 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 110 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 111 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (18): paneEvidenceCount(), paneShowsText(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, desktopInstallPane, directories, downloadedUpdateFooter (+10 more)

### Community 112 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 113 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 114 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 115 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 116 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 117 - "VoiceAudioFrame"
Cohesion: 0.10
Nodes (11): OracleVoiceBackendConnection, QueuedAudio, BrowserCaptureOptions, SocketMessage, AudioReservation, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase (+3 more)

### Community 118 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 119 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 120 - "terminal-form-deadline.test.ts"
Cohesion: 0.12
Nodes (15): TerminalFormContinuation, question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture() (+7 more)

### Community 121 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 122 - "normalizeKnowledgeRelativePath"
Cohesion: 0.21
Nodes (16): knowledgeRelativePathSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot() (+8 more)

### Community 123 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 124 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 125 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 126 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 127 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 128 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (8): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession()

### Community 129 - "SettingsProfileSnapshot"
Cohesion: 0.17
Nodes (6): SettingsProfileSnapshot, settingsProfileCacheKey, SettingsProfileTransport, cached(), FakeHub, MemoryStorage

### Community 130 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 131 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 132 - ".withFormViewport"
Cohesion: 0.20
Nodes (14): FormReplyDeadlineError, hasClippedTerminalFormFooter(), hasClippedTerminalFormTabs(), hasTerminalFormQuestionReflowCandidate(), isTerminalLoading(), parseTerminalFormActiveField(), tabNames(), terminalBoxWrap() (+6 more)

### Community 133 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 134 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 135 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 136 - "server/session-patches.ts"
Cohesion: 0.20
Nodes (8): publish(), diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 137 - "NewSessionDialog"
Cohesion: 0.18
Nodes (17): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+9 more)

### Community 138 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 139 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 140 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

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

### Community 145 - "OracleVoiceClientOptions"
Cohesion: 0.23
Nodes (3): OracleVoiceClientOptions, FakeVoiceClient, transcript()

### Community 146 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 147 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 148 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 149 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 150 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 151 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 152 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 153 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 154 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 156 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 157 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 158 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 159 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 160 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 161 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 162 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 163 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 164 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.31
Nodes (6): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult

### Community 165 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 166 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 168 - "FakeRecorder"
Cohesion: 0.22
Nodes (4): drawDiagram(), drawing, MermaidDiagram(), FakeRecorder

### Community 169 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 170 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 171 - "backgroundHandoff"
Cohesion: 0.32
Nodes (8): attachmentModeValue(), backgroundHandoff(), booleanValue(), rawTailText(), shellIdFromFooter(), shellStopAcknowledged(), shellTaskMode(), toolTelemetryProperties()

### Community 172 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 173 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 174 - "askSession"
Cohesion: 0.36
Nodes (6): askSession(), askSideQuestion(), openSideQuestion(), submitSideQuestion(), updateSideThread(), sideQuestionCommand()

### Community 176 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 177 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 178 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 179 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 180 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 181 - "VoiceServerControl"
Cohesion: 0.40
Nodes (4): connect(), Inbox, rawBuffer(), VoiceServerControl

### Community 182 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 183 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1184 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1179 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1993 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionStore`, `.get`, `agent-service.ts`, `queued-dispatch.test.ts`, `claude-agent-service.ts`, `session-directory.ts`, `SessionDetail`, `AgentProvider`, `.recoverSdkSession`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `session-resource-clear.test.ts`, `.get`, `agent-service.ts`, `ClaudeAgentService`, `AgentService`, `claude-agent-service.ts`, `SessionDetail`, `.recoverSdkSession`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `ProviderSessionService`, `claude-agent-service.ts`, `computer-manager.ts`, `ClaudeAgentService`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1184 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.02448497129348193 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.031132581857219538 - nodes in this community are weakly interconnected._
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
