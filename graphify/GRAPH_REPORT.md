# Agentic Remote - Graphify code map

Snapshot: `a8617be28fa5f562b110582abc96104054c7b575fb77a96863119f82e0c96573`

Source checkout: `7b7fe33a63fecc60b29401dae55c0d3b97c7c681`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 399 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 399 files · ~807,871 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6780 nodes · 18707 edges · 216 communities (177 shown, 23 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1014 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- api.ts
- SessionDetail
- App.tsx
- contracts.ts
- SessionStore
- agent-service.ts
- terminal-session.ts
- claude-agent-service.ts
- hub-routes.ts
- oracle-voice-child.ts
- CopilotClientLike
- ManagedSession
- agentic-remote-promotion-monitor
- oracle-voice-soak.ts
- oracle-voice-engine.ts
- session-knowledge-store.ts
- VoiceCapture
- ManagerAgent
- client.ts
- app.ts
- OracleVoiceCoordinator
- sessionKey
- manager-tools.ts
- oracle-voice-integration.test.ts
- transcription-service.ts
- session-store.ts
- PushNotificationService
- oracle-voice-worker.ts
- manager-agent.ts
- oracle-voice-coordinator.ts
- ManagerStore
- manager-structured-memory-validation.ts
- FakeManager
- markdown-navigation.ts
- tmux-test-helpers.ts
- CopilotSessionLike
- send-matrix.integration.test.ts
- workspace-fixtures.ts
- oracle-voice-benchmark.ts
- TerminalSessionController
- session-knowledge-routes.test.ts
- oracle-voice-session.ts
- TmuxTerminalSessionController
- oracle-voice.ts
- RemoteNodeClient
- SessionService
- agentic-remote
- VoiceClientControl
- dreamer-planner.ts
- bundle
- tmux-errors.integration.test.ts
- ProviderSessionService
- pwa.ts
- normalizeKnowledgeRelativePath
- VoicePlayback
- client.test.ts
- shell.ts
- lib.rs
- background-task-adapter.ts
- DreamerStore
- FakeSessionService
- agentic-remote-promotion-setup
- oracle-voice-routes.ts
- FakeVoiceEngine
- terminal-session.test.ts
- agentic-remote-gate
- config.rs
- fake-voice.ts
- oracle-voice-config.ts
- manager-proactive-inbox.ts
- dependencies
- devDependencies
- active-sessions.ts
- manager-structured-memory.ts
- oracle-voice-child.test.ts
- EngineVoiceBackendSession
- shared/settings-profile.ts
- dreamer-store.ts
- react
- oracle-voice-security.test.ts
- ManagerAssistant.tsx
- SessionOrderStore
- DreamerService
- src/settings-profile.ts
- use-oracle-conversation.test.tsx
- session-patch-browser.ts
- cli-canary.ts
- scripts
- ManagerAssistant
- manager-structured-memory-search.ts
- compilerOptions
- ChatMessage
- manager-context.ts
- ManagerStructuredMemoryStore
- oracle-voice-segments.ts
- SettingsProfileClient
- oracle-voice-routes.test.ts
- capture-workspace.ts
- agent-service.test.ts
- startup-phases.test.ts
- oracle-voice-tickets.ts
- isTerminalComposerFooter
- full-gate.test.ts
- session-reply-durability.test.ts
- settings-profile-store.ts
- PromptCards.tsx
- knowledge-tree.ts
- compilerOptions
- boundedText
- dreamer-service.ts
- session-store-providers.test.ts
- OnlineRecognizer
- OracleDreamer.tsx
- compilerOptions
- compilerOptions
- directory-browser.ts
- ManagerProactiveInbox
- workspace-browser.ts
- dreamer-schedule.ts
- ManagerMemory
- use-oracle-settings.ts
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- NewSessionDialog
- dreamer-api.ts
- terminal-form-deadline.test.ts
- promotion-monitor.test.ts
- recovery-resend-durability.test.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- scripts
- background-task-stop.test.ts
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- DeferredSession
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- .observe
- session-clear-transcript.test.ts
- Pcm16Resampler
- background-task-tracker.ts
- manager-proactive-inbox.test.ts
- recovery-seed-guards.test.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- isRecord
- .initialize
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- dreamer-routes.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- manager-structured-memory-performance.test.ts
- promotion-setup-execution.test.ts
- SessionAdmissions
- settings-profile.test.ts
- vite.config.ts
- package.json
- SpeakableSegmenter
- release-publication.test.ts
- render-workspace-gifs.ts
- RuntimeModelOption
- dreamer-service.test.ts
- dreamer-store.test.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- .transport
- composer-layout.test.ts
- SessionStatus
- recovery-context.ts
- usePanelWidth
- promotion-setup.test.ts
- appearance.ts
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
1. `SessionDetail` - 309 edges
2. `AgentService` - 279 edges
3. `App()` - 278 edges
4. `SessionStore` - 189 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 103 edges
7. `registerHubRoutes()` - 93 edges
8. `buildApp()` - 92 edges
9. `ComputerManager` - 87 edges
10. `ManagerAgent` - 83 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `FakeVoiceState` --references--> `ManagerMessage`  [EXTRACTED]
  e2e/fixtures/fake-voice.ts → shared/manager.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (216 total, 23 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (11): agentMode(), AgentService, isTerminalNotReadyRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, suspendedRuntimeConflict(), terminalAnswerRefused(), fixture() (+3 more)

### Community 1 - "App"
Cohesion: 0.03
Nodes (155): message(), sendLikeTheApp(), isManagerEvent(), terminalSendOptions(), askSession(), clearConversation(), listKnowledgeEntries(), readKnowledgeFile() (+147 more)

### Community 2 - "api.ts"
Cohesion: 0.02
Nodes (135): AddKnowledgeRootInput, PushSettings, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, SideQuestionAnswer, SideQuestionInput, ResolveManagerConfirmationInput (+127 more)

### Community 3 - "SessionDetail"
Cohesion: 0.04
Nodes (17): ClaudeAgentService, isMissingClaudeSessionError(), ownsDispatchRecovery(), preflight(), preparePrompt(), queueConflict(), QueuedDispatches, observe() (+9 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (118): addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+110 more)

### Community 5 - "contracts.ts"
Cohesion: 0.03
Nodes (68): AgentServiceEvents, ClaudeAgentServiceEvents, ComputerManagerEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, directories (+60 more)

### Community 6 - "SessionStore"
Cohesion: 0.05
Nodes (41): recoveredPermissionTitle(), fixture(), restart(), fixture(), connect(), createStore(), enqueue(), fixture() (+33 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.04
Nodes (81): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+73 more)

### Community 8 - "terminal-session.ts"
Cohesion: 0.05
Nodes (82): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed() (+74 more)

### Community 9 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (68): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+60 more)

### Community 10 - "hub-routes.ts"
Cohesion: 0.03
Nodes (76): ClientPresence, PRESENCE_TTL_MS, FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile() (+68 more)

### Community 11 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (42): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+34 more)

### Community 12 - "CopilotClientLike"
Cohesion: 0.03
Nodes (59): CopilotClientLike, ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+51 more)

### Community 13 - "ManagedSession"
Cohesion: 0.09
Nodes (12): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), ManagerHub, TurnContextInput (+4 more)

### Community 14 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 15 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 16 - "oracle-voice-engine.ts"
Cohesion: 0.04
Nodes (31): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+23 more)

### Community 17 - "session-knowledge-store.ts"
Cohesion: 0.05
Nodes (45): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+37 more)

### Community 18 - "VoiceCapture"
Cohesion: 0.06
Nodes (24): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, harness() (+16 more)

### Community 19 - "ManagerAgent"
Cohesion: 0.09
Nodes (13): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), capturePrompt() (+5 more)

### Community 20 - "client.ts"
Cohesion: 0.08
Nodes (22): ORACLE_VOICE_CONNECTION_TIMEOUT_MS, captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord(), isTicket() (+14 more)

### Community 21 - "app.ts"
Cohesion: 0.05
Nodes (47): prefixes, session, trusted, untrusted, apps, directories, buildApp(), BuildAppOptions (+39 more)

### Community 22 - "OracleVoiceCoordinator"
Cohesion: 0.08
Nodes (8): ManagerEventSource, errorMessage(), OracleVoiceCoordinator, OracleVoiceCoordinatorOptions, PendingFinalTurn, withTimeout(), VoiceTurnState, ManagerEvent

### Community 23 - "sessionKey"
Cohesion: 0.06
Nodes (57): BackgroundTaskSnapshot, saveSessionOrderLane(), handleDragEnd(), openSessionResources(), RenameSessionDialog(), SessionResourcesDialog(), KnowledgeRootSelector(), root (+49 more)

### Community 24 - "manager-tools.ts"
Cohesion: 0.06
Nodes (36): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), steer() (+28 more)

### Community 25 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+24 more)

### Community 26 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 27 - "session-store.ts"
Cohesion: 0.04
Nodes (45): holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), directories, fakeClient() (+37 more)

### Community 28 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories, scoped() (+20 more)

### Community 29 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (27): benchmarkGroup(), VoiceEndUtterance, VoiceGenerationIdentity, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage() (+19 more)

### Community 30 - "manager-agent.ts"
Cohesion: 0.05
Nodes (34): isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Rung (+26 more)

### Community 31 - "oracle-voice-coordinator.ts"
Cohesion: 0.05
Nodes (36): AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnection, OracleVoiceBackendConnector (+28 more)

### Community 32 - "ManagerStore"
Cohesion: 0.07
Nodes (16): openStore(), JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), emptyState(), JournalKind, ManagerStore (+8 more)

### Community 33 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 34 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 35 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (44): executeCommand(), listWorkspace(), readWorkspaceFile(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+36 more)

### Community 36 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (43): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+35 more)

### Community 37 - "CopilotSessionLike"
Cohesion: 0.06
Nodes (26): CopilotSessionLike, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), QueuedDelivery, terminalRefused(), accept() (+18 more)

### Community 38 - "send-matrix.integration.test.ts"
Cohesion: 0.05
Nodes (46): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+38 more)

### Community 39 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (41): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+33 more)

### Community 40 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (41): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 41 - "TerminalSessionController"
Cohesion: 0.07
Nodes (9): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, TerminalSessionController, ConfigureRuntimeInput, PendingUserInput, UserInputReplyInput (+1 more)

### Community 42 - "session-knowledge-routes.test.ts"
Cohesion: 0.07
Nodes (25): WorkspaceFixtureState, SessionMetadataLookup, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, Lineage, RegistrationGeneration (+17 more)

### Community 43 - "oracle-voice-session.ts"
Cohesion: 0.05
Nodes (27): ActiveBackendSession, voiceBackend(), exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), ObservedLocalVoiceBackend, RouteVoiceBackend (+19 more)

### Community 44 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (13): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+5 more)

### Community 45 - "oracle-voice.ts"
Cohesion: 0.09
Nodes (37): capabilities, closeServers, exactArrayBuffer(), sockets, startFields, VoiceNode, decodeVoiceAudioFrame(), encodeVoiceAudioFrame() (+29 more)

### Community 46 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (7): RemoteNodeClient, client(), servers, session, NodeInfo, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 47 - "SessionService"
Cohesion: 0.08
Nodes (4): nodeVoiceCapabilities(), registerNodeRoutes(), SessionService, WorkspaceListing

### Community 48 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 49 - "VoiceClientControl"
Cohesion: 0.11
Nodes (22): VoiceBackendDisconnectCause, RemoteNodeRedirectError, RemoteNodeRequestError, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError() (+14 more)

### Community 50 - "dreamer-planner.ts"
Cohesion: 0.08
Nodes (38): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+30 more)

### Community 51 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 52 - "tmux-errors.integration.test.ts"
Cohesion: 0.07
Nodes (23): fixture(), managers, releases, remote, session(), ComputerRegistry, RegistryState, directories (+15 more)

### Community 54 - "pwa.ts"
Cohesion: 0.09
Nodes (38): AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+30 more)

### Community 55 - "normalizeKnowledgeRelativePath"
Cohesion: 0.09
Nodes (32): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), pathRecordSchema, SessionKnowledgeEvents, SessionKnowledgeBinding, joinKnowledgeRelativePath(), knowledgeAbsolutePath() (+24 more)

### Community 56 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 57 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 58 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 59 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 60 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (37): backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTasksApi, errorValue(), eventString() (+29 more)

### Community 61 - "DreamerStore"
Cohesion: 0.15
Nodes (8): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, isMissing(), publicPlan()

### Community 62 - "FakeSessionService"
Cohesion: 0.07
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 63 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 64 - "oracle-voice-routes.ts"
Cohesion: 0.11
Nodes (33): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+25 more)

### Community 65 - "FakeVoiceEngine"
Cohesion: 0.08
Nodes (14): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine, Runtime (+6 more)

### Community 66 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (32): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+24 more)

### Community 67 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 68 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 69 - "fake-voice.ts"
Cohesion: 0.08
Nodes (20): FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, confirmationSchema, defaultsSchema, editSchema, effort (+12 more)

### Community 70 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (26): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+18 more)

### Community 71 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (35): assertExactKeys(), cloneState(), DISPOSITIONS, EVENT_KINDS, hasExactKeys(), isDisposition(), isEventKind(), isId() (+27 more)

### Community 72 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 73 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 74 - "active-sessions.ts"
Cohesion: 0.12
Nodes (31): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+23 more)

### Community 75 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 76 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (12): childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize(), InProcessVoiceChild (+4 more)

### Community 77 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 78 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (32): AccentSetting, appearanceSettings, applySettingsChanges(), applySettingsImport(), isRecord(), isSettingsProfileKey(), NewSessionBackendSetting, newSessionBackendSettings (+24 more)

### Community 79 - "dreamer-store.ts"
Cohesion: 0.10
Nodes (30): DreamerHistoryEntry, assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_STAGING_PREFIX (+22 more)

### Community 80 - "react"
Cohesion: 0.09
Nodes (15): react, SessionRetention, SessionRetentionPatch, transcribeAudio(), MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram() (+7 more)

### Community 81 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (17): FakeVoiceEngineCall, apps, config, configFixture(), createManager(), issueTicket(), localRuntime(), otherAllowed (+9 more)

### Community 82 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (19): removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), startOver(), ORACLE_CONVERSATION_WIDTH_MIN (+11 more)

### Community 83 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 84 - "DreamerService"
Cohesion: 0.21
Nodes (7): setup(), DreamerService, publicSnapshot(), safeRunError(), DreamerRunClaim, dreamerRunKey(), DreamerSnapshot

### Community 85 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (22): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, SettingsUpdateResult (+14 more)

### Community 86 - "use-oracle-conversation.test.tsx"
Cohesion: 0.12
Nodes (13): getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability, defaults (+5 more)

### Community 87 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 88 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 89 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 90 - "ManagerAssistant"
Cohesion: 0.11
Nodes (23): cancelManager(), editQueuedManagerMessage(), phoneEnterCreatesNewline(), applyEvent(), canTakeFocus(), conversationStateLabel(), ManagerAssistant(), act() (+15 more)

### Community 91 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 92 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 93 - "ChatMessage"
Cohesion: 0.13
Nodes (13): Connection, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset, StoredSession, ChatMessage (+5 more)

### Community 94 - "manager-context.ts"
Cohesion: 0.16
Nodes (20): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+12 more)

### Community 95 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 96 - "oracle-voice-segments.ts"
Cohesion: 0.14
Nodes (22): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+14 more)

### Community 97 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 98 - "oracle-voice-routes.test.ts"
Cohesion: 0.11
Nodes (10): FakeManager, openApps, openSockets, RouteManager, runtime(), testRoot(), testRoots, trusted (+2 more)

### Community 99 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 100 - "agent-service.test.ts"
Cohesion: 0.13
Nodes (12): terminalFormSteps(), busyTerminal(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService(), services (+4 more)

### Community 101 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (13): phases, port, createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address (+5 more)

### Community 102 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 103 - "isTerminalComposerFooter"
Cohesion: 0.13
Nodes (20): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+12 more)

### Community 104 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 105 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 106 - "settings-profile-store.ts"
Cohesion: 0.18
Nodes (11): profileStore(), SettingsProfileState, SettingsProfileStore, directories, store(), isSettingsDeviceId(), isSettingsRevision(), SettingsProfileRecord (+3 more)

### Community 107 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 108 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 109 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 110 - "boundedText"
Cohesion: 0.16
Nodes (19): addActivity(), attachmentModeValue(), booleanValue(), boundedText(), eventTask(), executionModeValue(), isBackgroundTaskInfo(), isBackgroundTaskProgress() (+11 more)

### Community 111 - "dreamer-service.ts"
Cohesion: 0.16
Nodes (15): digest(), planWithFingerprints(), unavailableSnapshot(), DreamerCoverageIncrement, DreamerPersistenceError, DreamerPlanWithFingerprints, DreamerStoreSnapshot, DreamerStoreState (+7 more)

### Community 112 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 113 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 114 - "OracleDreamer.tsx"
Cohesion: 0.19
Nodes (17): authoritativeRefresh, AuthoritativeRefreshRequest, coordinatedAuthoritativeRefresh, dispatchAuthoritativeRefresh(), DreamerMorningPlan(), confirmCompletion(), disposition(), edit() (+9 more)

### Community 115 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 116 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 117 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 118 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, nowIso(), openInbox()

### Community 119 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 120 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 121 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 122 - "use-oracle-settings.ts"
Cohesion: 0.19
Nodes (12): getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps, models (+4 more)

### Community 123 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 124 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 125 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 126 - "NewSessionDialog"
Cohesion: 0.18
Nodes (17): provider(), activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+9 more)

### Community 127 - "dreamer-api.ts"
Cohesion: 0.20
Nodes (11): DreamerApiError, DreamerSettingsEdit, getDreamer(), request(), saveDreamerSettings(), snapshot, updateDreamerPlan(), completionCandidate (+3 more)

### Community 128 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 129 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 130 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 131 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 132 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 133 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 134 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 135 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 136 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 137 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 138 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 139 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 140 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 141 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 142 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 143 - ".observe"
Cohesion: 0.21
Nodes (7): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId()

### Community 144 - "session-clear-transcript.test.ts"
Cohesion: 0.17
Nodes (8): Admission, ExclusiveAdmission, PendingQueueAdmission, disk, fixtures, gate(), holdTurnWrite(), releases

### Community 145 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 146 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 147 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 148 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 149 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 150 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 151 - "isRecord"
Cohesion: 0.29
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 152 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 153 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 154 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 155 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 156 - "dreamer-routes.ts"
Cohesion: 0.27
Nodes (7): parse(), planSchema, registerDreamerRoutes(), settingsSchema, apps, directories, DreamerUnavailableError

### Community 157 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 158 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 159 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 160 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 161 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.31
Nodes (6): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult

### Community 162 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 164 - "settings-profile.test.ts"
Cohesion: 0.25
Nodes (4): resolveAppearance(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 165 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 166 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 168 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 169 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 172 - "dreamer-store.test.ts"
Cohesion: 0.29
Nodes (4): DREAMER_MAX_ZONES, DREAMER_STATE_VERSION, directories, plan

### Community 173 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 174 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 175 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 177 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 178 - "SessionStatus"
Cohesion: 0.33
Nodes (6): ManagerProactiveInboxObservation, PersistedCursor, SessionOrigin, Row, SdkRestartRecovery, SessionStatus

### Community 179 - "recovery-context.ts"
Cohesion: 0.47
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 180 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 181 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 182 - "appearance.ts"
Cohesion: 0.50
Nodes (3): Appearance, appearanceFrom(), appearanceStorageKey

## Knowledge Gaps
- **1122 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1117 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1895 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `CopilotSessionLike`, `SessionStore`, `agent-service.ts`, `contracts.ts`, `TerminalSessionController`, `claude-agent-service.ts`, `boundedText`, `directory-browser.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `SessionDetail`, `contracts.ts`, `agent-service.ts`, `claude-agent-service.ts`, `TerminalSessionController`, `CopilotClientLike`, `session-store.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `fixture()` connect `session-knowledge-store.ts` to `SessionStore`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1122 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.0380041011619959 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.028381374722838137 - nodes in this community are weakly interconnected._
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
- `docs/session-retention.md`
- `docs/slash-command-feedback.md`
- `docs/superpowers/plans/2026-10-16-oracle-conversation-mode.md`
- `docs/superpowers/plans/2026-10-16-oracle-structured-memory.md`
- `docs/superpowers/plans/2026-10-20-copilot-sdk-cli-parity.md`
- `docs/superpowers/plans/2026-10-24-copilot-sdk-restart-recovery.md`
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-17-oracle-proactive-lifecycle-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
- `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`
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
