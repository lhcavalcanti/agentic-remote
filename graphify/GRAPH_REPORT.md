# Agentic Remote - Graphify code map

Snapshot: `183a6ee46b82548f91c8e59701be969ae6cc968b1a814e7614c8ceae67c1c2e8`

Source checkout: `c2011849fcada4efb942b9a78df280d2ef04aca6`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 411 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 411 files · ~883,615 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7195 nodes · 19997 edges · 224 communities (176 shown, 32 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1058 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- SessionStore
- SessionDetail
- App.tsx
- agent-service.ts
- api.ts
- app.ts
- oracle-voice-worker.ts
- background-task-adapter.ts
- oracle-voice.ts
- terminal-session.ts
- contracts.ts
- ManagedSession
- CopilotSessionLike
- node-routes.ts
- claude-agent-service.ts
- ManagerAgent
- manager-tools.ts
- agentic-remote-promotion-monitor
- oracle-voice-child.ts
- oracle-voice-soak.ts
- oracle-voice-integration.test.ts
- dreamer-store.ts
- CopilotClientLike
- session-presentation.ts
- ManagerAssistant.tsx
- transcription-service.ts
- oracle-task-store.ts
- oracle-voice-engine.ts
- SessionService
- session-directory.ts
- RemoteNodeClient
- manager-structured-memory-validation.ts
- ManagerEvent
- FakeManager
- active-sessions.ts
- TmuxTerminalSessionController
- manager-agent.ts
- oracle-voice-benchmark.ts
- DreamerService
- manager-agent.test.ts
- ManagerStore
- multi-node.test.ts
- markdown-navigation.ts
- session-knowledge-routes.test.ts
- FakeVoiceEngine
- oracle-voice-session.ts
- OracleDreamer.tsx
- session-store-providers.test.ts
- agentic-remote
- dreamer-progress.ts
- ProviderSessionService
- bundle
- hub-routes.ts
- oracle-voice-routes.ts
- OracleVoiceClient
- tmux-test-helpers.ts
- pwa.ts
- FakeSessionService
- shell.ts
- lib.rs
- terminal-session.test.ts
- agentic-remote-promotion-setup
- dreamer-planner.ts
- terminal-startup-queue.test.ts
- agentic-remote-gate
- config.rs
- KnowledgeStore
- dependencies
- devDependencies
- manager-proactive-inbox.ts
- OracleVoiceCoordinator
- knowledge-tree.ts
- workspace-fixtures.ts
- manager-context.ts
- manager-structured-memory.ts
- UserInputReplyInput
- normalizeKnowledgeRelativePath
- manager-structured-memory-search.ts
- oracle-voice-segments.ts
- SessionKnowledgeStore
- oracle-voice-coordinator.ts
- VoicePlayback
- manager-routes.ts
- push-notification-service.ts
- SessionOrderStore
- ReaderWorkspace
- settings-profile-store.ts
- shared/settings-profile.ts
- dreamer-service.ts
- ManagerStructuredMemoryStore
- send-matrix.integration.test.ts
- session-patch-browser.ts
- session-latency-benchmark.ts
- cli-canary.ts
- .toolHost
- PushNotificationService
- scripts
- client.ts
- use-oracle-conversation.test.tsx
- registerSessionKnowledgeRoutes
- SettingsProfileClient
- session-patches.test.ts
- src/settings-profile.ts
- compilerOptions
- oracle-voice-coordinator.test.ts
- VoiceCapture
- capture-workspace.ts
- oracle-voice-tickets.ts
- session-reply-durability.test.ts
- isTerminalComposerFooter
- full-gate.test.ts
- session-knowledge-store.ts
- PromptCards.tsx
- use-oracle-settings.ts
- compilerOptions
- ManagerProactiveInbox
- OnlineRecognizer
- MessageTime.tsx
- FakeSocket
- compilerOptions
- compilerOptions
- ManagerMemory
- .correct
- SettingsProfileSnapshot
- dreamer-schedule.ts
- SessionStatus
- .confirmSpeech
- promotion-monitor.test.ts
- startup-phases.test.ts
- SessionKnowledgeBinding
- BoundedQueue
- ChatMessage
- session-resource-routes.test.ts
- capture.ts
- terminal-form-deadline.test.ts
- scripts
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- OracleVoiceClientDependencies
- theme-contrast.test.ts
- capture-workbench-review.ts
- .oxlintrc.json
- settings-local.json
- oracle-voice-engine-smoke.ts
- dreamer-service.test.ts
- .observe
- session-clear-transcript.test.ts
- session-response-order.ts
- Pcm16Resampler
- DeferredSession
- manager-proactive-inbox.test.ts
- recovery-seed-guards.test.ts
- setupWorkspaceFixture
- isRecord
- VoiceVadOptions
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- screenshot-stability.test.ts
- dreamer-routes.ts
- promotion-setup-execution.test.ts
- SessionAdmissions
- VoiceCaptureOptions
- vite.config.ts
- KnowledgePosition
- package.json
- HubEvent
- recovery-context.ts
- release-publication.test.ts
- vad-assets.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- ManagerEventSource
- promotion-setup.test.ts
- push-routes.ts
- SessionKnowledgeLifecycle
- FakeRecorder
- VoiceCaptureDependencies
- FakeRecorder
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- MermaidDiagram.tsx
- SessionActions.tsx
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
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (224 total, 32 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (15): agentMode(), AgentService, isTerminalNotReadyRefusal(), lifecycleRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, sessionInUseConflictMessage(), suspendedRuntimeConflict() (+7 more)

### Community 1 - "App"
Cohesion: 0.03
Nodes (173): isManagerEvent(), alertNotification(), terminalSendOptions(), sessionFileValidationError(), submissionReceiptFromError(), replyPermission(), saveSessionVisibility(), activeComposerPastes() (+165 more)

### Community 2 - "SessionStore"
Cohesion: 0.03
Nodes (89): normalizedTitle(), fixture(), holdProbe(), fixtures, gate(), releases, restart(), sdkPermissionEvents() (+81 more)

### Community 3 - "SessionDetail"
Cohesion: 0.03
Nodes (27): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), toolResultText(), observe(), answer(), claudeRequest(), copilotRequest() (+19 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (128): addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+120 more)

### Community 5 - "agent-service.ts"
Cohesion: 0.03
Nodes (95): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+87 more)

### Community 6 - "api.ts"
Cohesion: 0.04
Nodes (111): SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), addKnowledgeRoot(), askSession(), bootstrapSessionOrder(), cancelBackgroundTask() (+103 more)

### Community 7 - "app.ts"
Cohesion: 0.04
Nodes (70): buildConfig(), prefixes, session, trusted, untrusted, apps, directories, buildApp() (+62 more)

### Community 8 - "oracle-voice-worker.ts"
Cohesion: 0.04
Nodes (47): benchmarkGroup(), createVoiceWorker(), childHarness(), config, FakeChildProcess, fakeSherpa(), FakeSherpaStream, initialize() (+39 more)

### Community 9 - "background-task-adapter.ts"
Cohesion: 0.05
Nodes (81): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), CopilotClientTaskInfo (+73 more)

### Community 10 - "oracle-voice.ts"
Cohesion: 0.05
Nodes (57): LegacyRegisteredComputer, LegacyRegistryState, RegistryState, VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES (+49 more)

### Community 11 - "terminal-session.ts"
Cohesion: 0.05
Nodes (80): activeBottomFrame(), captureBeforeDeadline(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), containsCopiedInteractiveFrame() (+72 more)

### Community 12 - "contracts.ts"
Cohesion: 0.04
Nodes (52): AgentServiceEvents, ClaudeAgentServiceEvents, DirectoryScope, ProviderSessionServiceEvents, provider(), DEFINITE_DISPATCH_REFUSALS, normalizeNodeUrl(), REDIRECT_STATUSES (+44 more)

### Community 13 - "ManagedSession"
Cohesion: 0.08
Nodes (15): ClientPresence, PRESENCE_TTL_MS, ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), DurableRegisteredComputer, RegisteredComputer (+7 more)

### Community 14 - "CopilotSessionLike"
Cohesion: 0.04
Nodes (39): CopilotSessionLike, CopilotTasksApi, isClaudeAuthenticationError(), nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage() (+31 more)

### Community 15 - "node-routes.ts"
Cohesion: 0.03
Nodes (56): ActiveBackendSession, installFakeBrowserVoice(), ScriptedUtterance, Window, FileUploadError, registerFileUploadRoutes(), SessionParams, AUDIO_FILENAME_HEADER (+48 more)

### Community 16 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (61): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply, RemoteSessionListing (+53 more)

### Community 17 - "ManagerAgent"
Cohesion: 0.07
Nodes (17): FakeVoiceState, checkContent(), delay(), discover(), errorMessage(), isNotFound(), isPending(), isQueued() (+9 more)

### Community 18 - "manager-tools.ts"
Cohesion: 0.05
Nodes (44): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+36 more)

### Community 19 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 20 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (36): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+28 more)

### Community 21 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 22 - "oracle-voice-integration.test.ts"
Cohesion: 0.03
Nodes (38): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+30 more)

### Community 23 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (40): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+32 more)

### Community 24 - "CopilotClientLike"
Cohesion: 0.03
Nodes (41): CopilotClientLike, fixtures, recoverAndSeed(), releases, CopilotSdkMissingSessionRetirement, forgetSessionEvents(), directories, disk (+33 more)

### Community 25 - "session-presentation.ts"
Cohesion: 0.05
Nodes (59): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter (+51 more)

### Community 26 - "ManagerAssistant.tsx"
Cohesion: 0.05
Nodes (54): react, cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage() (+46 more)

### Community 27 - "transcription-service.ts"
Cohesion: 0.05
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+28 more)

### Community 28 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (45): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+37 more)

### Community 29 - "oracle-voice-engine.ts"
Cohesion: 0.06
Nodes (22): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+14 more)

### Community 30 - "SessionService"
Cohesion: 0.06
Nodes (12): ActiveClaudeQuery, closeReason(), closeVoiceSocket(), registerNodeRoutes(), releases, session, snapshot, readServiceResources() (+4 more)

### Community 31 - "session-directory.ts"
Cohesion: 0.08
Nodes (45): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, build(), trusted, allowedRoots(), assertOpenedDirectory() (+37 more)

### Community 32 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (17): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, client(), servers, session, RemoteNodeCapabilityError (+9 more)

### Community 33 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 34 - "ManagerEvent"
Cohesion: 0.07
Nodes (20): apps, directories, ManagerEventSource, batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator (+12 more)

### Community 35 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 36 - "active-sessions.ts"
Cohesion: 0.07
Nodes (45): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+37 more)

### Community 37 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (13): capturePane(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+5 more)

### Community 38 - "manager-agent.ts"
Cohesion: 0.06
Nodes (39): CreationRuntime, DreamerProgressView, automaticPayload(), ManagerAgentOptions, ManagerSdkSessionConfig, messagePriority(), Rung, TURN_ACTIVITY (+31 more)

### Community 39 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (41): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 40 - "DreamerService"
Cohesion: 0.12
Nodes (9): DreamerMemoryMetadata, digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate (+1 more)

### Community 41 - "manager-agent.test.ts"
Cohesion: 0.07
Nodes (21): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, Behavior, capturePrompt(), computers, fail(), FakeClient (+13 more)

### Community 42 - "ManagerStore"
Cohesion: 0.06
Nodes (14): openStore(), emptyState(), ManagerStore, messageSource(), storedMessage(), open(), createManager(), createRealManager() (+6 more)

### Community 43 - "multi-node.test.ts"
Cohesion: 0.05
Nodes (26): directories, routingFixture(), session(), temporaryDirectory(), voiceBackend(), voiceControlQueues, voiceControlWaiters, SocketMessage (+18 more)

### Community 44 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (40): executeCommand(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage() (+32 more)

### Community 45 - "session-knowledge-routes.test.ts"
Cohesion: 0.06
Nodes (26): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+18 more)

### Community 46 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (21): FakeVoiceEngine, sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine, playbackSequence(), beginUtterance() (+13 more)

### Community 47 - "oracle-voice-session.ts"
Cohesion: 0.12
Nodes (16): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), createVoiceBackendSession(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled() (+8 more)

### Community 48 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (39): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition (+31 more)

### Community 49 - "session-store-providers.test.ts"
Cohesion: 0.05
Nodes (30): ClaudeSdk, directories, fixture(), queryHandle(), services, waitForIdle(), deferred(), disk (+22 more)

### Community 50 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 51 - "dreamer-progress.ts"
Cohesion: 0.09
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, DreamerProgressSource (+11 more)

### Community 53 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 54 - "hub-routes.ts"
Cohesion: 0.06
Nodes (41): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+33 more)

### Community 55 - "oracle-voice-routes.ts"
Cohesion: 0.09
Nodes (35): nodeVoiceCapabilities(), sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes() (+27 more)

### Community 56 - "OracleVoiceClient"
Cohesion: 0.15
Nodes (7): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, playbackClientError(), terminalCloseCode()

### Community 57 - "tmux-test-helpers.ts"
Cohesion: 0.11
Nodes (36): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), startAgentAfterClear(), exec (+28 more)

### Community 58 - "pwa.ts"
Cohesion: 0.09
Nodes (38): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), retryHubCopilotModels() (+30 more)

### Community 59 - "FakeSessionService"
Cohesion: 0.07
Nodes (3): FakeSessionService, safeUploadName(), SessionFileUpload

### Community 60 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 61 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 62 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (33): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+25 more)

### Community 63 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 64 - "dreamer-planner.ts"
Cohesion: 0.10
Nodes (34): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+26 more)

### Community 65 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (28): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+20 more)

### Community 66 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 67 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 68 - "KnowledgeStore"
Cohesion: 0.11
Nodes (15): WorkspaceFixtureState, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState (+7 more)

### Community 69 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 70 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 71 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (34): assertExactKeys(), cloneState(), DISPOSITIONS, EVENT_KINDS, hasExactKeys(), isDisposition(), isEventKind(), isId() (+26 more)

### Community 73 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+24 more)

### Community 74 - "workspace-fixtures.ts"
Cohesion: 0.09
Nodes (27): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+19 more)

### Community 75 - "manager-context.ts"
Cohesion: 0.13
Nodes (27): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+19 more)

### Community 76 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (29): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+21 more)

### Community 77 - "UserInputReplyInput"
Cohesion: 0.14
Nodes (7): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, PendingUserInput, UserInputReplyInput, deliveryUncertaintyFromError()

### Community 78 - "normalizeKnowledgeRelativePath"
Cohesion: 0.10
Nodes (31): knowledgeFileSchema, knowledgeRelativePathSchema, pathRecordSchema, knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), slashPath(), activateSession() (+23 more)

### Community 79 - "manager-structured-memory-search.ts"
Cohesion: 0.11
Nodes (26): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+18 more)

### Community 80 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 81 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (9): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+1 more)

### Community 82 - "oracle-voice-coordinator.ts"
Cohesion: 0.08
Nodes (17): AudioCompletion, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, PendingFinalTurn, QueuedAudio, QueuedSpeech (+9 more)

### Community 83 - "VoicePlayback"
Cohesion: 0.13
Nodes (6): pcm16ToFloat(), SegmentDrain, FakeSource, harness(), validateGeneration(), VoicePlayback

### Community 84 - "manager-routes.ts"
Cohesion: 0.10
Nodes (17): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+9 more)

### Community 85 - "push-notification-service.ts"
Cohesion: 0.12
Nodes (20): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+12 more)

### Community 86 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 87 - "ReaderWorkspace"
Cohesion: 0.10
Nodes (17): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview() (+9 more)

### Community 88 - "settings-profile-store.ts"
Cohesion: 0.12
Nodes (17): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+9 more)

### Community 89 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (28): AccentSetting, appearanceSettings, DEFAULT_SESSION_PROVIDER, isRecord(), isSettingsDeviceId(), isSettingsRevision(), NewSessionBackendSetting, newSessionBackendSettings (+20 more)

### Community 90 - "dreamer-service.ts"
Cohesion: 0.12
Nodes (25): DreamerPlanDraft, DreamerPlannerInput, DreamerProgressLimits, boundedText(), DreamerPlannerExecutionInput, DreamerServiceOptions, safeRunError(), unavailableSnapshot() (+17 more)

### Community 91 - "ManagerStructuredMemoryStore"
Cohesion: 0.13
Nodes (8): initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMode, ManagerStructuredMemoryStatus

### Community 92 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (24): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+16 more)

### Community 93 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 94 - "session-latency-benchmark.ts"
Cohesion: 0.15
Nodes (20): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+12 more)

### Community 95 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 96 - ".toolHost"
Cohesion: 0.11
Nodes (4): ManagerHub, CreateSessionInput, RenameSessionInput, SendMessageInput

### Community 97 - "PushNotificationService"
Cohesion: 0.20
Nodes (3): PushNotificationService, scoped(), registerPushRoutes()

### Community 98 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 99 - "client.ts"
Cohesion: 0.09
Nodes (14): closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, OracleVoicePlayback, parseHello() (+6 more)

### Community 100 - "use-oracle-conversation.test.tsx"
Cohesion: 0.12
Nodes (12): OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability, defaults, FakeVoiceClient (+4 more)

### Community 101 - "registerSessionKnowledgeRoutes"
Cohesion: 0.14
Nodes (21): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+13 more)

### Community 102 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 103 - "session-patches.test.ts"
Cohesion: 0.13
Nodes (11): Connection, diffMessages(), PatchSocket, Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted (+3 more)

### Community 104 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (20): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+12 more)

### Community 105 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 106 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 108 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 109 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 110 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (17): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+9 more)

### Community 111 - "isTerminalComposerFooter"
Cohesion: 0.13
Nodes (20): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+12 more)

### Community 112 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 113 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema, PersistedBinding (+11 more)

### Community 114 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 115 - "use-oracle-settings.ts"
Cohesion: 0.16
Nodes (14): ManagerSessionClosePolicy, getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus() (+6 more)

### Community 116 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 117 - "ManagerProactiveInbox"
Cohesion: 0.22
Nodes (4): ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, nowIso(), openInbox()

### Community 118 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 119 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 120 - "FakeSocket"
Cohesion: 0.12
Nodes (6): OracleVoiceSocket, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse()

### Community 121 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 122 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 123 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 124 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 125 - "SettingsProfileSnapshot"
Cohesion: 0.17
Nodes (6): SettingsProfileSnapshot, settingsProfileCacheKey, SettingsProfileTransport, cached(), FakeHub, MemoryStorage

### Community 126 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 127 - "SessionStatus"
Cohesion: 0.14
Nodes (16): Seen, ManagerProactiveInboxObservation, PersistedCursor, Row, SdkRestartRecovery, SessionExecutionMode, SessionStatus, TerminalSendPolicyInput (+8 more)

### Community 129 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 130 - "startup-phases.test.ts"
Cohesion: 0.14
Nodes (11): createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories, recorder() (+3 more)

### Community 131 - "SessionKnowledgeBinding"
Cohesion: 0.20
Nodes (12): SessionKnowledgeBinding, getSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 132 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 133 - "ChatMessage"
Cohesion: 0.21
Nodes (13): StoredSession, ChatMessage, nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, PendingEchoOwner (+5 more)

### Community 134 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 135 - "capture.ts"
Cohesion: 0.17
Nodes (10): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, validateIdentity(), VoiceCaptureError (+2 more)

### Community 136 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 137 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 138 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 139 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 140 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 141 - "OracleVoiceClientDependencies"
Cohesion: 0.19
Nodes (4): defaultDependencies(), OracleVoiceClientDependencies, FakePlayback, VoicePlaybackOptions

### Community 142 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 143 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 144 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 145 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 146 - "oracle-voice-engine-smoke.ts"
Cohesion: 0.21
Nodes (6): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave

### Community 147 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 148 - ".observe"
Cohesion: 0.21
Nodes (7): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId()

### Community 149 - "session-clear-transcript.test.ts"
Cohesion: 0.17
Nodes (8): Admission, ExclusiveAdmission, PendingQueueAdmission, disk, fixtures, gate(), holdTurnWrite(), releases

### Community 150 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 151 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 153 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 154 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 155 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), joinKnowledgeRelativePath(), rebaseKnowledgeRelativePath()

### Community 156 - "isRecord"
Cohesion: 0.29
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 158 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 159 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 160 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 161 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 162 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 163 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 164 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 165 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 168 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 169 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 170 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 171 - "HubEvent"
Cohesion: 0.29
Nodes (3): ComputerManagerEvents, HubEventSource, HubEvent

### Community 172 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 173 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 174 - "vad-assets.ts"
Cohesion: 0.32
Nodes (7): browserBaseUrl(), directory(), localAssetUrl(), ORACLE_VOICE_ONNX_WASM_BASE_PATH, ORACLE_VOICE_VAD_ASSETS, ORACLE_VOICE_VAD_BASE_PATH, sharedAssetDirectory()

### Community 175 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 176 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 177 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 178 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 179 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 180 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 182 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 183 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 191 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **1184 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1179 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1997 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionStore`, `SessionDetail`, `oracle-voice-worker.ts`, `ManagedSession`, `node-routes.ts`, `ManagerAgent`, `transcription-service.ts`, `oracle-task-store.ts`, `SessionService`, `ManagerEvent`, `dreamer-routes.ts`, `DreamerService`, `manager-agent.test.ts`, `ManagerStore`, `multi-node.test.ts`, `session-knowledge-routes.test.ts`, `ProviderSessionService`, `KnowledgeStore`, `UserInputReplyInput`, `SessionKnowledgeStore`, `manager-routes.ts`, `SessionOrderStore`, `settings-profile-store.ts`, `ManagerStructuredMemoryStore`, `cli-canary.ts`, `PushNotificationService`, `ManagerProactiveInbox`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `SessionDetail`, `agent-service.ts`, `contracts.ts`, `UserInputReplyInput`, `CopilotSessionLike`, `claude-agent-service.ts`, `CopilotClientLike`, `FakeSessionService`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `SessionDetail`, `agent-service.ts`, `UserInputReplyInput`, `CopilotSessionLike`, `claude-agent-service.ts`, `FakeSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1184 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.036311657279399216 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.028391541933951058 - nodes in this community are weakly interconnected._
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
