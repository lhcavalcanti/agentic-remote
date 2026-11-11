# Agentic Remote - Graphify code map

Snapshot: `e9b5982b177655f136b5f9aac3144ba91f7734b0ec073e449abb9cd4a80e0f1d`

Source checkout: `a586d2ed859b823795f3bbf86c1be1786b558a4d`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 426 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 426 files · ~906,699 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7349 nodes · 20451 edges · 214 communities (176 shown, 22 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1070 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- api.ts
- App
- App.tsx
- SessionDetail
- ClaudeAgentService
- agent-service.ts
- contracts.ts
- ManagedSession
- claude-agent-service.ts
- terminal-session.ts
- manager-tools.ts
- oracle-voice-soak.ts
- node-routes.ts
- oracle-voice-child.ts
- app.ts
- oracle-voice-security.test.ts
- agentic-remote-promotion-monitor
- dreamer-store.ts
- ManagerAgent
- VoiceCapture
- OracleVoiceCoordinator
- .sendAdmittedWithBackend
- sessionKey
- oracle-voice-integration.test.ts
- PushNotificationService
- transcription-service.ts
- ManagerStore
- workspace-fixtures.ts
- client.ts
- ManagerMessage
- hub-routes.ts
- CopilotClientLike
- session-store-providers.test.ts
- tmux-errors.integration.test.ts
- RemoteNodeClient
- oracle-voice-session.ts
- session-store.ts
- tmux-test-helpers.ts
- manager-structured-memory-validation.ts
- oracle-voice-worker.ts
- oracle-voice.ts
- oracle-task-store.ts
- oracle-voice-benchmark.ts
- active-sessions.ts
- DreamerService
- TmuxTerminalSessionController
- normalizeKnowledgeRelativePath
- OracleDreamer.tsx
- fake-voice.ts
- EnabledOracleVoiceConfig
- session-directory.ts
- ManagerEvent
- pwa.ts
- markdown-navigation.ts
- SessionService
- ManagerAssistant.tsx
- shared/settings-profile.ts
- session-latency-benchmark.ts
- TerminalSessionController
- oracle-voice-coordinator.ts
- agentic-remote
- manager-agent.ts
- dreamer-progress.ts
- send-matrix.integration.test.ts
- remote-voice-client.ts
- ProviderSessionService
- agentic-remote-gate
- bundle
- dreamer-planner.ts
- FakeSessionService
- VoicePlayback
- client.test.ts
- shell.ts
- lib.rs
- manager-agent.test.ts
- manager-structured-memory.ts
- agentic-remote-promotion-setup
- oracle-voice-config.ts
- manager-proactive-inbox.ts
- config.rs
- dependencies
- devDependencies
- react
- oracle-voice-routes.ts
- oracle-voice-child.test.ts
- knowledge-tree.ts
- manager-context.ts
- ManagerStructuredMemoryStore
- .sendInternal
- capture-workspace.ts
- terminal-session.test.ts
- SessionOrderStore
- session-patch-browser.ts
- session-reply-durability.test.ts
- dreamer-service.ts
- SessionKnowledgeStore
- use-oracle-conversation.test.tsx
- ManagerAssistant.test.tsx
- cli-canary.ts
- scripts
- backgroundTasksFromEvents
- background-task-adapter.ts
- manager-structured-memory-search.ts
- src/settings-profile.ts
- compilerOptions
- oracle-voice-segments.ts
- SettingsProfileClient
- oracle-voice-tickets.ts
- SettingsProfileSnapshot
- compilerOptions
- agent-service.test.ts
- full-gate.test.ts
- .observe
- PromptCards.tsx
- use-oracle-attachments.ts
- compilerOptions
- ManagerProactiveInbox
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- ManagerAttachment
- dreamer-schedule.ts
- KnowledgeStore
- promotion-monitor.test.ts
- session-knowledge-store.ts
- startup-phases.test.ts
- terminal-startup-queue.test.ts
- BoundedQueue
- ReaderWorkspace
- session-knowledge-routes.ts
- session-resource-clear.test.ts
- terminal-form-deadline.test.ts
- knowledge-store.ts
- session-resource-routes.test.ts
- scripts
- background-task-stop.test.ts
- registerSessionKnowledgeRoutes
- oracle-voice-assets.test.ts
- OracleSettings.tsx
- fake-vad.ts
- desktop.json
- queued-provider-dispatch.test.ts
- session-resource-providers.test.ts
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- background-task-tracker.ts
- manager-proactive-inbox.test.ts
- session-response-order.ts
- Pcm16Resampler
- DeferredSession
- dreamer-routes.ts
- dreamer-service.test.ts
- oracle-voice-coordinator.test.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- .transport
- sign-in-expired.pw.ts
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- KnowledgePosition
- boundedText
- promotion-setup-execution.test.ts
- SessionAdmissions
- session-knowledge-store.test.ts
- vite.config.ts
- package.json
- manager-structured-memory-performance.test.ts
- release-publication.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- settings.ts
- composer-layout.test.ts
- promotion-setup.test.ts
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
2. `App()` - 308 edges
3. `AgentService` - 290 edges
4. `SessionStore` - 190 edges
5. `ClaudeAgentService` - 126 edges
6. `ManagedSession` - 124 edges
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

## Communities (214 total, 22 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (11): agentMode(), AgentService, lifecycleRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, suspendedRuntimeConflict(), suspendRefused(), forgetSessionEvents() (+3 more)

### Community 1 - "api.ts"
Cohesion: 0.02
Nodes (137): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), addComputer() (+129 more)

### Community 2 - "App"
Cohesion: 0.03
Nodes (153): terminalSendOptions(), sessionFileValidationError(), submissionReceiptFromError(), askSession(), getSession(), activeComposerPastes(), App(), adoptConversationReplacement() (+145 more)

### Community 3 - "App.tsx"
Cohesion: 0.02
Nodes (126): isManagerEvent(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+118 more)

### Community 4 - "SessionDetail"
Cohesion: 0.05
Nodes (39): restart(), fixture(), connect(), createStore(), enqueue(), fixture(), recoveryFixture(), fixture() (+31 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (21): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+13 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.04
Nodes (83): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+75 more)

### Community 7 - "contracts.ts"
Cohesion: 0.03
Nodes (63): AgentServiceEvents, DirectoryScope, directories, voiceControlQueues, voiceControlWaiters, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, ProviderSessionServiceEvents (+55 more)

### Community 8 - "ManagedSession"
Cohesion: 0.06
Nodes (18): ComputerManager, managedSession(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, ManagerHub, normalizeNodeUrl(), FakeManager (+10 more)

### Community 9 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (71): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+63 more)

### Community 10 - "terminal-session.ts"
Cohesion: 0.04
Nodes (93): activeBottomFrame(), afterExit(), boxedComposerFrame(), captureTerminal(), cleanDialogLine(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed() (+85 more)

### Community 11 - "manager-tools.ts"
Cohesion: 0.04
Nodes (54): DreamerMemoryMetadataRecord, APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools() (+46 more)

### Community 12 - "oracle-voice-soak.ts"
Cohesion: 0.04
Nodes (36): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+28 more)

### Community 13 - "node-routes.ts"
Cohesion: 0.03
Nodes (59): ActiveBackendSession, FileUploadError, registerFileUploadRoutes(), SessionParams, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema (+51 more)

### Community 14 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (43): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+35 more)

### Community 15 - "app.ts"
Cohesion: 0.04
Nodes (52): prefixes, session, trusted, untrusted, apps, directories, buildApp(), BuildAppOptions (+44 more)

### Community 16 - "oracle-voice-security.test.ts"
Cohesion: 0.04
Nodes (37): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceStartUtterance, VoiceSttEngine, VoiceTtsEngine (+29 more)

### Community 17 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 18 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (45): publicSnapshot(), assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+37 more)

### Community 19 - "ManagerAgent"
Cohesion: 0.08
Nodes (12): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+4 more)

### Community 20 - "VoiceCapture"
Cohesion: 0.06
Nodes (24): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, harness() (+16 more)

### Community 21 - "OracleVoiceCoordinator"
Cohesion: 0.08
Nodes (7): errorMessage(), OracleVoiceCoordinator, PendingFinalTurn, withTimeout(), SpeakableSegmenter, validateMessageId(), VoiceTurnState

### Community 22 - ".sendAdmittedWithBackend"
Cohesion: 0.05
Nodes (25): commandShortcut(), CopilotSessionLike, isTerminalNotReadyRefusal(), sessionInUseConflictMessage(), stripAnsi(), terminalAnswerRefused(), CopilotTasksApi, acceptanceReceipt() (+17 more)

### Community 23 - "sessionKey"
Cohesion: 0.06
Nodes (56): hasActiveBackgroundTasks(), BackgroundTaskSnapshot, saveSessionOrderLane(), handleDragEnd(), readSelectionFromLocation(), RenameSessionDialog(), KnowledgeRootSelector(), root (+48 more)

### Community 24 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+24 more)

### Community 25 - "PushNotificationService"
Cohesion: 0.07
Nodes (29): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+21 more)

### Community 26 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+27 more)

### Community 27 - "ManagerStore"
Cohesion: 0.07
Nodes (23): openStore(), JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), SessionLifecycle, PersistedCursor, emptyState() (+15 more)

### Community 28 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (42): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+34 more)

### Community 29 - "client.ts"
Cohesion: 0.09
Nodes (21): VoiceServerControl, captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord(), isTicket() (+13 more)

### Community 30 - "ManagerMessage"
Cohesion: 0.05
Nodes (21): FakeManager, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams (+13 more)

### Community 31 - "hub-routes.ts"
Cohesion: 0.04
Nodes (49): WorkspaceFixture, ComputerManagerEvents, addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+41 more)

### Community 32 - "CopilotClientLike"
Cohesion: 0.03
Nodes (39): CopilotClientLike, fixture(), holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+31 more)

### Community 33 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (41): ClaudeSdk, deferred(), disk, fixtures, holdClaimWrite(), releases, build(), trusted (+33 more)

### Community 34 - "tmux-errors.integration.test.ts"
Cohesion: 0.05
Nodes (36): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+28 more)

### Community 35 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (16): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, requestBytes(), client(), servers, session (+8 more)

### Community 36 - "oracle-voice-session.ts"
Cohesion: 0.08
Nodes (25): playbackSequence(), acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), createVoiceBackendSession(), disconnectCause(), EngineVoiceBackendSession (+17 more)

### Community 37 - "session-store.ts"
Cohesion: 0.04
Nodes (46): openNodeVoiceSocket(), waitForEvent(), bootLegacy(), directories, execute, pending, releases, SeedState (+38 more)

### Community 38 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (48): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, deliveryFixture(), [root] (+40 more)

### Community 39 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 40 - "oracle-voice-worker.ts"
Cohesion: 0.09
Nodes (23): benchmarkGroup(), capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent(), isEnabledConfig(), isNonEmptyString() (+15 more)

### Community 41 - "oracle-voice.ts"
Cohesion: 0.07
Nodes (42): VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities, closeServers, exactArrayBuffer(), sockets (+34 more)

### Community 42 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (33): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+25 more)

### Community 43 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (41): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 44 - "active-sessions.ts"
Cohesion: 0.08
Nodes (44): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+36 more)

### Community 45 - "DreamerService"
Cohesion: 0.12
Nodes (12): boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), safeRunError(), unavailableSnapshot(), uniqueSessionRefs() (+4 more)

### Community 46 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (15): startAgentAfterClear(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand() (+7 more)

### Community 47 - "normalizeKnowledgeRelativePath"
Cohesion: 0.07
Nodes (40): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), SessionKnowledgeBinding, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+32 more)

### Community 48 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (41): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition (+33 more)

### Community 49 - "fake-voice.ts"
Cohesion: 0.08
Nodes (10): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance (+2 more)

### Community 50 - "EnabledOracleVoiceConfig"
Cohesion: 0.07
Nodes (18): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+10 more)

### Community 51 - "session-directory.ts"
Cohesion: 0.10
Nodes (38): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+30 more)

### Community 52 - "ManagerEvent"
Cohesion: 0.09
Nodes (17): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, ProactiveManager, directories (+9 more)

### Community 53 - "pwa.ts"
Cohesion: 0.08
Nodes (46): activateSession(), createSession(), deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), listHistory(), savePushSubscription(), applyPwaUpdate() (+38 more)

### Community 54 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (40): executeCommand(), listWorkspace(), readWorkspaceFile(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+32 more)

### Community 55 - "SessionService"
Cohesion: 0.08
Nodes (4): registerNodeRoutes(), SessionService, WorkspaceListing, KnowledgeFolderState

### Community 56 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (37): cancelManager(), editQueuedManagerMessage(), resetManager(), retryManagerMessage(), phoneEnterCreatesNewline(), applyEvent(), boundWidth(), canTakeFocus() (+29 more)

### Community 57 - "shared/settings-profile.ts"
Cohesion: 0.08
Nodes (41): WorkspaceFixtureState, profileStore(), SettingsProfileState, AccentSetting, appearanceSettings, applySettingsChanges(), applySettingsImport(), DEFAULT_SESSION_PROVIDER (+33 more)

### Community 58 - "session-latency-benchmark.ts"
Cohesion: 0.08
Nodes (33): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+25 more)

### Community 59 - "TerminalSessionController"
Cohesion: 0.08
Nodes (7): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, TerminalSessionController, UserInputReplyInput, deliveryUncertaintyFromError()

### Community 60 - "oracle-voice-coordinator.ts"
Cohesion: 0.06
Nodes (26): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnection (+18 more)

### Community 61 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 62 - "manager-agent.ts"
Cohesion: 0.07
Nodes (30): DreamerProgressView, automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung, TURN_ACTIVITY (+22 more)

### Community 63 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, DreamerProgressSource (+11 more)

### Community 64 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (40): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+32 more)

### Community 65 - "remote-voice-client.ts"
Cohesion: 0.11
Nodes (21): VoiceBackendDisconnectCause, VoiceBackendOutput, RemoteNodeRedirectError, RemoteNodeRequestError, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES (+13 more)

### Community 67 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 68 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 69 - "dreamer-planner.ts"
Cohesion: 0.09
Nodes (35): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+27 more)

### Community 70 - "FakeSessionService"
Cohesion: 0.07
Nodes (5): FakeSessionService, routingFixture(), session(), temporaryDirectory(), AgentMode

### Community 71 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 72 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 73 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 74 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 75 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (19): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail(), FakeClient (+11 more)

### Community 76 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (32): ManagerStructuredMemorySearchIndex, ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES (+24 more)

### Community 77 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 78 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (26): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+18 more)

### Community 79 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isAlreadyExists(), isDisposition() (+29 more)

### Community 80 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 81 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 82 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 83 - "react"
Cohesion: 0.08
Nodes (21): react, changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame() (+13 more)

### Community 84 - "oracle-voice-routes.ts"
Cohesion: 0.12
Nodes (31): sendNodeVoiceOutput(), limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode() (+23 more)

### Community 85 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 86 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+24 more)

### Community 87 - "manager-context.ts"
Cohesion: 0.13
Nodes (27): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+19 more)

### Community 88 - "ManagerStructuredMemoryStore"
Cohesion: 0.16
Nodes (9): capturePrompt(), digest(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMutationResult (+1 more)

### Community 89 - ".sendInternal"
Cohesion: 0.14
Nodes (22): captureBeforeDeadline(), capturePane(), clearAutomaticStartupPrompts(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), isTerminalAgentWorking() (+14 more)

### Community 90 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 91 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (24): paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), desktopInstallPane, directories (+16 more)

### Community 92 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 93 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 94 - "session-reply-durability.test.ts"
Cohesion: 0.12
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 95 - "dreamer-service.ts"
Cohesion: 0.13
Nodes (26): DreamerPlanDraft, DreamerPlannerInput, DreamerProgressLimits, DreamerFollowUp, DreamerPlannerExecutionInput, DreamerServiceOptions, DreamerStoreSnapshot, OracleTaskFindingInput (+18 more)

### Community 96 - "SessionKnowledgeStore"
Cohesion: 0.14
Nodes (6): bindingKey(), SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateWithPaths(), UpdateSessionKnowledgeRootInput

### Community 97 - "use-oracle-conversation.test.tsx"
Cohesion: 0.12
Nodes (13): getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability, defaults (+5 more)

### Community 98 - "ManagerAssistant.test.tsx"
Cohesion: 0.08
Nodes (15): removeQueuedManagerMessage(), resolveManagerConfirmation(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+7 more)

### Community 99 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 100 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 101 - "backgroundTasksFromEvents"
Cohesion: 0.18
Nodes (26): backgroundHandoff(), backgroundTasksFromEvents(), booleanValue(), errorValue(), eventString(), eventTask(), executionModeValue(), lastForegroundCompletionAt() (+18 more)

### Community 102 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (22): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus() (+14 more)

### Community 103 - "manager-structured-memory-search.ts"
Cohesion: 0.15
Nodes (21): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+13 more)

### Community 104 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (20): AppearanceSetting, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+12 more)

### Community 105 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 106 - "oracle-voice-segments.ts"
Cohesion: 0.14
Nodes (22): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+14 more)

### Community 107 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 108 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 109 - "SettingsProfileSnapshot"
Cohesion: 0.13
Nodes (11): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SettingsProfileStore, directories, store() (+3 more)

### Community 110 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 111 - "agent-service.test.ts"
Cohesion: 0.14
Nodes (12): terminalFormSteps(), busyTerminal(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService(), services (+4 more)

### Community 112 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 113 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 114 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 115 - "use-oracle-attachments.ts"
Cohesion: 0.19
Nodes (18): codeExtensions, fileTypes, managerFileValidationError(), MAX_MANAGER_FILE_BYTES, MAX_MANAGER_TEXT_BYTES, textTypes, uploadManagerFile(), attachmentSize() (+10 more)

### Community 116 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 117 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 118 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 119 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 120 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 121 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 122 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 123 - "ManagerAttachment"
Cohesion: 0.23
Nodes (9): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), managerFileType(), ManagerAttachment (+1 more)

### Community 124 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 126 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 127 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (17): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+9 more)

### Community 128 - "startup-phases.test.ts"
Cohesion: 0.14
Nodes (11): createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories, recorder() (+3 more)

### Community 129 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (10): client(), delayQueueWrite(), disk, exec, gate(), holdQueueCommit(), NativeFixture, NativeRuntime (+2 more)

### Community 130 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 131 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 132 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 133 - "session-resource-clear.test.ts"
Cohesion: 0.16
Nodes (13): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+5 more)

### Community 134 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 135 - "knowledge-store.ts"
Cohesion: 0.14
Nodes (11): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, parseMetadata(), PersistedKnowledgeState (+3 more)

### Community 136 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 137 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 138 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 139 - "registerSessionKnowledgeRoutes"
Cohesion: 0.29
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 140 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 141 - "OracleSettings.tsx"
Cohesion: 0.19
Nodes (13): getManager(), updateManagerSettings(), act(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus() (+5 more)

### Community 142 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 143 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 144 - "queued-provider-dispatch.test.ts"
Cohesion: 0.18
Nodes (8): copilotFixture(), copilotSession(), fixtures, gate(), originalQueue, pause(), releases, seed()

### Community 145 - "session-resource-providers.test.ts"
Cohesion: 0.22
Nodes (13): claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures (+5 more)

### Community 146 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 147 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 148 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 149 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 150 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (7): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 151 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 152 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 153 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 155 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 157 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.20
Nodes (5): capabilities, confirm(), control(), defaults, startControl()

### Community 158 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 159 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 160 - ".transport"
Cohesion: 0.24
Nodes (3): cached(), FakeHub, MemoryStorage

### Community 161 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

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

### Community 167 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 168 - "boundedText"
Cohesion: 0.33
Nodes (9): addActivity(), attachmentModeValue(), boundedText(), normalizeBackgroundTask(), numberValue(), progressValue(), shellExitFromValue(), shellTask() (+1 more)

### Community 169 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 171 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 172 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 173 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 174 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.36
Nodes (5): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemorySearchResult

### Community 175 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 176 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 177 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 178 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 179 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 180 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1217 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1212 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2048 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionDetail`, `ClaudeAgentService`, `ManagedSession`, `oracle-voice-soak.ts`, `node-routes.ts`, `ManagerAgent`, `PushNotificationService`, `transcription-service.ts`, `ManagerStore`, `dreamer-routes.ts`, `ManagerMessage`, `tmux-errors.integration.test.ts`, `oracle-voice-worker.ts`, `oracle-task-store.ts`, `DreamerService`, `ManagerEvent`, `SessionService`, `TerminalSessionController`, `ProviderSessionService`, `oracle-voice-config.ts`, `SessionOrderStore`, `SessionKnowledgeStore`, `cli-canary.ts`, `SettingsProfileSnapshot`, `ManagerProactiveInbox`, `KnowledgeStore`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `ClaudeAgentService`, `agent-service.ts`, `contracts.ts`, `background-task-adapter.ts`, `claude-agent-service.ts`, `session-directory.ts`, `.sendAdmittedWithBackend`, `TerminalSessionController`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `ClaudeAgentService`, `session-store.ts`, `agent-service.ts`, `contracts.ts`, `claude-agent-service.ts`, `TerminalSessionController`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1217 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03738693467336683 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0248899790779886 - nodes in this community are weakly interconnected._
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
