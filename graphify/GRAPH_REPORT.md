# Agentic Remote - Graphify code map

Snapshot: `b734d807ae2b616527fc2932b54d6fbec3016e67f2954d6b2feebe9bb70d414d`

Source checkout: `d57cd3b3ca2fc18de4d52cbe67ad1a5abcb50f3c`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 379 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 379 files · ~743,681 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6357 nodes · 17484 edges · 208 communities (167 shown, 25 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 961 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- SessionDetail
- contracts.ts
- App.tsx
- api.ts
- ClaudeAgentService
- agent-service.ts
- terminal-session.ts
- session-knowledge-store.ts
- agentic-remote-promotion-monitor
- oracle-voice-soak.ts
- CopilotClientLike
- VoiceCapture
- claude-agent-service.ts
- OracleVoiceCoordinator
- app.ts
- registerHubRoutes
- transcription-service.ts
- ManagerAgent
- fake-voice.ts
- oracle-voice-integration.test.ts
- queueConflict
- SessionService
- manager-tools.ts
- oracle-voice-coordinator.ts
- session-presentation.ts
- session-store-providers.test.ts
- oracle-voice-worker.ts
- hub-routes.ts
- ManagerAssistant.tsx
- manager-structured-memory-validation.ts
- markdown-navigation.ts
- multi-node.test.ts
- TmuxTerminalSessionController
- oracle-voice-benchmark.ts
- manager-context.ts
- FakeVoiceEngine
- oracle-voice.ts
- agentic-remote
- session-knowledge-routes.test.ts
- oracle-voice-session.ts
- send-matrix.integration.test.ts
- node-routes.ts
- oracle-voice-child.ts
- OracleVoiceClient
- bundle
- pwa.ts
- background-task-adapter.ts
- ResidentVoiceWorker
- terminal-startup-queue.test.ts
- VoicePlayback
- active-sessions.ts
- oracle-voice-routes.ts
- ProviderSessionService
- session-store.ts
- shell.ts
- lib.rs
- manager-agent.test.ts
- agentic-remote-promotion-setup
- UserInputReplyInput
- agentic-remote-gate
- config.rs
- real-voice.ts
- oracle-voice-engine.ts
- oracle-voice-config.ts
- FakeSessionService
- dependencies
- devDependencies
- ManagerStore
- oracle-voice-child.test.ts
- VoiceClientControl
- oracle-voice-routes.test.ts
- knowledge-tree.ts
- manager-routes.ts
- manager-agent.ts
- normalizeKnowledgeRelativePath
- shared/settings-profile.ts
- workspace-fixtures.ts
- manager-structured-memory.ts
- oracle-voice-security.test.ts
- AgentProvider
- SessionOrderStore
- session-patch-browser.ts
- TerminalSessionController
- startup-phases.test.ts
- terminal-session.test.ts
- VoiceCapabilities
- session-reply-durability.test.ts
- cli-canary.ts
- ManagedSession
- PushNotificationService
- .sendInternal
- scripts
- manager-structured-memory-search.ts
- push-notification-service.ts
- noTmuxServer
- src/settings-profile.ts
- ManagerStructuredMemoryStore
- compilerOptions
- oracle-voice-segments.ts
- client.test.ts
- SettingsProfileClient
- session-resource-clear.test.ts
- SessionResources.tsx
- capture-workspace.ts
- ChatMessage
- oracle-voice-tickets.ts
- full-gate.test.ts
- settings-profile-store.ts
- workspace-browser.ts
- PromptCards.tsx
- client.ts
- compilerOptions
- OnlineRecognizer
- compilerOptions
- compilerOptions
- directory-browser.ts
- ManagerMemory
- .correct
- SettingsProfileSnapshot
- recovery-resend-durability.test.ts
- BoundedQueue
- session-latency-benchmark.ts
- use-oracle-settings.ts
- ReaderWorkspace
- terminal-form-deadline.test.ts
- background-task-stop.test.ts
- promotion-monitor.test.ts
- server/session-patches.ts
- scripts
- .askSession
- DeferredSession
- oracle-voice-assets.test.ts
- NewSessionDialog
- fake-vad.ts
- desktop.json
- recordValue
- OracleVoiceClientDependencies
- theme-contrast.test.ts
- BackgroundTasksDialog.tsx
- pending-echo.ts
- capture-workbench-review.ts
- .oxlintrc.json
- settings-local.json
- Pcm16Resampler
- background-task-tracker.ts
- html-preview.ts
- setupWorkspaceFixture
- HubEvent
- dataset
- generate-pwa-icons.ts
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- copilot-sdk-client.ts
- promotion-setup-execution.test.ts
- SessionAdmissions
- vite.config.ts
- package.json
- SpeakableSegmenter
- recovery-context.ts
- release-publication.test.ts
- OracleVoicePlayback
- render-workspace-gifs.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- push-routes.ts
- FakeRecorder
- FakeRecorder
- MockMediaRecorder
- MermaidDiagram.tsx
- SessionActions.tsx
- .readBackgroundTasks
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
1. `SessionDetail` - 299 edges
2. `App()` - 273 edges
3. `AgentService` - 264 edges
4. `SessionStore` - 178 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 99 edges
7. `registerHubRoutes()` - 92 edges
8. `buildApp()` - 90 edges
9. `ComputerManager` - 87 edges
10. `ManagerAgent` - 82 edges

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

## Communities (208 total, 25 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (8): agentMode(), AgentService, commandShortcut(), isTerminalNotReadyRefusal(), RuntimeConfigurationError, httpBoundary(), isRetainedRefusal(), TerminalSendOptions

### Community 1 - "App"
Cohesion: 0.03
Nodes (150): isManagerEvent(), alertNotification(), terminalSendOptions(), deleteKnowledgeRoot(), moveSessionToTmux(), replyPermission(), replyUserInput(), restartSession() (+142 more)

### Community 2 - "SessionDetail"
Cohesion: 0.04
Nodes (36): fixture(), fixture(), isMissingClaudeSessionError(), connect(), createStore(), fixture(), recoveryFixture(), claudeFixture() (+28 more)

### Community 3 - "contracts.ts"
Cohesion: 0.03
Nodes (62): ClaudeAgentServiceEvents, RemoteResync, RemoteSessionRead, DirectoryScope, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, ProviderSessionServiceEvents, provider() (+54 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (116): addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+108 more)

### Community 5 - "api.ts"
Cohesion: 0.03
Nodes (108): SettingsChange, SettingsProfileKey, SettingsUpdateResult, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, submissionReceiptFromError() (+100 more)

### Community 6 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (24): ClaudeAgentService, isClaudeAuthenticationError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+16 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.04
Nodes (81): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+73 more)

### Community 8 - "terminal-session.ts"
Cohesion: 0.05
Nodes (87): activeBottomFrame(), boxedComposerFrame(), captureBeforeDeadline(), captureTerminal(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes (+79 more)

### Community 9 - "session-knowledge-store.ts"
Cohesion: 0.05
Nodes (47): Lineage, registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+39 more)

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 11 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 12 - "CopilotClientLike"
Cohesion: 0.03
Nodes (42): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, restart(), directories (+34 more)

### Community 13 - "VoiceCapture"
Cohesion: 0.06
Nodes (24): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, harness() (+16 more)

### Community 14 - "claude-agent-service.ts"
Cohesion: 0.08
Nodes (49): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply, QueuedDispatchTarget (+41 more)

### Community 15 - "OracleVoiceCoordinator"
Cohesion: 0.08
Nodes (8): ManagerEventSource, errorMessage(), OracleVoiceCoordinator, OracleVoiceCoordinatorOptions, PendingFinalTurn, withTimeout(), VoiceTurnState, ManagerEvent

### Community 16 - "app.ts"
Cohesion: 0.05
Nodes (45): prefixes, session, trusted, untrusted, apps, directories, buildApp(), BuildAppOptions (+37 more)

### Community 17 - "registerHubRoutes"
Cohesion: 0.11
Nodes (9): ComputerManager, managedSession(), mapWithConcurrency(), fixture(), session(), sessionAtLeastAsNew(), registerHubRoutes(), ComputerSummary (+1 more)

### Community 18 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 19 - "ManagerAgent"
Cohesion: 0.09
Nodes (12): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+4 more)

### Community 20 - "fake-voice.ts"
Cohesion: 0.05
Nodes (11): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice() (+3 more)

### Community 21 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+23 more)

### Community 22 - "queueConflict"
Cohesion: 0.06
Nodes (30): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), queueConflict() (+22 more)

### Community 23 - "SessionService"
Cohesion: 0.06
Nodes (12): ActiveClaudeQuery, nodeVoiceCapabilities(), registerNodeRoutes(), releases, session, snapshot, readServiceResources(), readSessionMcpServers() (+4 more)

### Community 24 - "manager-tools.ts"
Cohesion: 0.06
Nodes (32): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), structuredTools() (+24 more)

### Community 25 - "oracle-voice-coordinator.ts"
Cohesion: 0.05
Nodes (36): AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnection, OracleVoiceBackendConnector (+28 more)

### Community 26 - "session-presentation.ts"
Cohesion: 0.07
Nodes (50): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+42 more)

### Community 27 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (41): ClaudeSdk, deferred(), disk, enqueue(), fixtures, holdClaimWrite(), releases, deferred() (+33 more)

### Community 28 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (24): benchmarkGroup(), VoiceTtsEngine, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent(), isEnabledConfig() (+16 more)

### Community 29 - "hub-routes.ts"
Cohesion: 0.04
Nodes (47): ClientPresence, PRESENCE_TTL_MS, addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+39 more)

### Community 30 - "ManagerAssistant.tsx"
Cohesion: 0.06
Nodes (43): react, ManagerStatus, editQueuedManagerMessage(), removeQueuedManagerMessage(), resolveManagerConfirmation(), retryManagerMessage(), sessionLinkTarget(), applyEvent() (+35 more)

### Community 31 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 32 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (44): executeCommand(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+36 more)

### Community 33 - "multi-node.test.ts"
Cohesion: 0.05
Nodes (24): managers, releases, remote, ComputerRegistry, RegisteredComputer, RegistryState, directories, directories (+16 more)

### Community 34 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (16): startAgentAfterClear(), composer(), processAdapter, copilotCommand(), endProbeSession(), execFileAsync, parseTerminalUpdateNotice(), processAncestors() (+8 more)

### Community 35 - "oracle-voice-benchmark.ts"
Cohesion: 0.06
Nodes (42): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, buildConfig(), CliOptions, clockTicksPerSecond() (+34 more)

### Community 36 - "manager-context.ts"
Cohesion: 0.08
Nodes (36): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+28 more)

### Community 37 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (24): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+16 more)

### Community 38 - "oracle-voice.ts"
Cohesion: 0.09
Nodes (37): capabilities, closeServers, exactArrayBuffer(), sockets, startFields, VoiceNode, decodeVoiceAudioFrame(), encodeVoiceAudioFrame() (+29 more)

### Community 39 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 40 - "session-knowledge-routes.test.ts"
Cohesion: 0.08
Nodes (21): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, disk (+13 more)

### Community 41 - "oracle-voice-session.ts"
Cohesion: 0.13
Nodes (14): acquisitionCancelled(), ActiveUtterance, asSessionError(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), outputBytes(), QueuedOutput (+6 more)

### Community 42 - "send-matrix.integration.test.ts"
Cohesion: 0.07
Nodes (39): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+31 more)

### Community 43 - "node-routes.ts"
Cohesion: 0.06
Nodes (37): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), closeReason(), closeVoiceSocket() (+29 more)

### Community 44 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (36): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), float32ToPcm16() (+28 more)

### Community 45 - "OracleVoiceClient"
Cohesion: 0.15
Nodes (7): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, playbackClientError(), terminalCloseCode()

### Community 46 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 47 - "pwa.ts"
Cohesion: 0.09
Nodes (39): AppVersion, parseAppVersion(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+31 more)

### Community 48 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (41): addActivity(), attachmentModeValue(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, eventString() (+33 more)

### Community 49 - "ResidentVoiceWorker"
Cohesion: 0.12
Nodes (9): combinedTranscript(), matchesCancelled(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceGenerationIdentity, VoiceSynthesisRequest, ActiveSynthesisIdentity (+1 more)

### Community 50 - "terminal-startup-queue.test.ts"
Cohesion: 0.11
Nodes (35): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, client(), disk (+27 more)

### Community 51 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 52 - "active-sessions.ts"
Cohesion: 0.10
Nodes (37): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+29 more)

### Community 53 - "oracle-voice-routes.ts"
Cohesion: 0.10
Nodes (33): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+25 more)

### Community 55 - "session-store.ts"
Cohesion: 0.06
Nodes (30): activityDuration(), activityResultPreview(), archivedMessage(), DiscoveredSession, emptyRetirements, encode(), freezeCommitted(), freezeDeep() (+22 more)

### Community 56 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 57 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 58 - "manager-agent.test.ts"
Cohesion: 0.07
Nodes (17): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+9 more)

### Community 59 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 60 - "UserInputReplyInput"
Cohesion: 0.11
Nodes (10): isUncertainDelivery(), persistedFormAnswer(), terminalAnswerRefused(), TerminalFormContinuation, validateUserInputForm(), formReplyExpired(), TerminalFormReplyError, PendingUserInput (+2 more)

### Community 61 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 62 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 63 - "real-voice.ts"
Cohesion: 0.08
Nodes (14): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+6 more)

### Community 64 - "oracle-voice-engine.ts"
Cohesion: 0.08
Nodes (12): voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngineFactory, config, VoiceEngineEvent, VoiceEngineFactory, GatedVoiceEngineFactory, voiceBackend() (+4 more)

### Community 65 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (26): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger(), canonicalPath() (+18 more)

### Community 67 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 68 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 69 - "ManagerStore"
Cohesion: 0.10
Nodes (6): openStore(), emptyState(), ManagerStore, open(), createManager(), StoredManager

### Community 70 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 71 - "VoiceClientControl"
Cohesion: 0.15
Nodes (16): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError() (+8 more)

### Community 72 - "oracle-voice-routes.test.ts"
Cohesion: 0.08
Nodes (16): exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), ObservedLocalVoiceBackend, openApps, openSockets, RouteManager (+8 more)

### Community 73 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (31): applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+23 more)

### Community 74 - "manager-routes.ts"
Cohesion: 0.09
Nodes (16): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+8 more)

### Community 75 - "manager-agent.ts"
Cohesion: 0.10
Nodes (22): isPending(), isQueued(), ManagerAgentOptions, Rung, TURN_ACTIVITY, ManagerState, hasExplicitStructuredMemoryIntent(), memoryObject (+14 more)

### Community 76 - "normalizeKnowledgeRelativePath"
Cohesion: 0.14
Nodes (23): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), getSessionKnowledgeRoot(), requestSessionKnowledgeRoot() (+15 more)

### Community 77 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (29): AccentSetting, appearanceSettings, applySettingsChanges(), isRecord(), isSettingsRevision(), NewSessionFoldersSetting, NewSessionRuntimesSetting, oneOf() (+21 more)

### Community 78 - "workspace-fixtures.ts"
Cohesion: 0.09
Nodes (25): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+17 more)

### Community 79 - "manager-structured-memory.ts"
Cohesion: 0.09
Nodes (25): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+17 more)

### Community 80 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (16): FakeVoiceEngineCall, apps, config, configFixture(), createManager(), issueTicket(), localRuntime(), otherAllowed (+8 more)

### Community 81 - "AgentProvider"
Cohesion: 0.09
Nodes (19): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+11 more)

### Community 82 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 83 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 84 - "TerminalSessionController"
Cohesion: 0.08
Nodes (7): removeCopilotSessionFiles(), forgetSessionEvents(), boots, [directory, backend, resultPath, phase = 'idle'], fixtureRoot, TerminalSessionController, PendingPermission

### Community 85 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (14): phases, port, createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, StartupPhases (+6 more)

### Community 86 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (22): paneEvidenceCount(), paneShowsText(), terminalFormCommitKeys(), bracketedTabPane, deliveryFixture(), desktopInstallPane, directories, downloadedUpdateFooter (+14 more)

### Community 87 - "VoiceCapabilities"
Cohesion: 0.12
Nodes (13): VoiceCapabilities, OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability, defaults (+5 more)

### Community 88 - "session-reply-durability.test.ts"
Cohesion: 0.13
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 89 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 90 - "ManagedSession"
Cohesion: 0.13
Nodes (8): RemoteSessionListing, ManagerHub, ManagedSession, SessionListing, actions, computers, root, session

### Community 91 - "PushNotificationService"
Cohesion: 0.20
Nodes (3): PushNotificationService, scoped(), registerPushRoutes()

### Community 92 - ".sendInternal"
Cohesion: 0.17
Nodes (20): capturePane(), composerFocusWitnessed(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasLiveTerminalComposer(), isTerminalAgentWorking() (+12 more)

### Community 93 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 94 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 95 - "push-notification-service.ts"
Cohesion: 0.14
Nodes (18): brief(), OracleEventSource, PushPolicy, PushSender, PushState, RFC-8030, notificationAllowed(), notificationBrief() (+10 more)

### Community 96 - "noTmuxServer"
Cohesion: 0.11
Nodes (16): listTmuxSessions(), noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files (+8 more)

### Community 97 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (21): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+13 more)

### Community 98 - "ManagerStructuredMemoryStore"
Cohesion: 0.15
Nodes (9): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open() (+1 more)

### Community 99 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 100 - "oracle-voice-segments.ts"
Cohesion: 0.14
Nodes (22): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+14 more)

### Community 101 - "client.test.ts"
Cohesion: 0.11
Nodes (6): capabilities, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse()

### Community 102 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 103 - "session-resource-clear.test.ts"
Cohesion: 0.13
Nodes (20): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+12 more)

### Community 104 - "SessionResources.tsx"
Cohesion: 0.14
Nodes (19): isMcpSummary(), isRecord(), isSkillSummary(), listSessionMcpServers(), listSessionSkills(), optionalBoolean(), optionalCount(), optionalText() (+11 more)

### Community 105 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 106 - "ChatMessage"
Cohesion: 0.16
Nodes (9): nextVoiceControl(), Client, Browser, seedOffset, ChatMessage, HubResyncRequest, HubWireEvent, Base (+1 more)

### Community 107 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 108 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 109 - "settings-profile-store.ts"
Cohesion: 0.18
Nodes (11): profileStore(), SettingsProfileState, SettingsProfileStore, directories, store(), applySettingsImport(), isSettingsDeviceId(), isSettingsProfileKey() (+3 more)

### Community 110 - "workspace-browser.ts"
Cohesion: 0.19
Nodes (17): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+9 more)

### Community 111 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 112 - "client.ts"
Cohesion: 0.12
Nodes (14): closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, OracleVoiceSocket, parseHello() (+6 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 114 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 115 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 116 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 117 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 118 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 119 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 120 - "SettingsProfileSnapshot"
Cohesion: 0.17
Nodes (6): SettingsProfileSnapshot, settingsProfileCacheKey, SettingsProfileTransport, cached(), FakeHub, MemoryStorage

### Community 121 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (13): directories, disk, fixture(), gate(), gates, initialize(), PublicSessionValue, runtimes (+5 more)

### Community 122 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 123 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 124 - "use-oracle-settings.ts"
Cohesion: 0.21
Nodes (12): getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps, models (+4 more)

### Community 125 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 126 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 127 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 128 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 129 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 130 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 131 - ".askSession"
Cohesion: 0.24
Nodes (4): sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout()

### Community 132 - "DeferredSession"
Cohesion: 0.15
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 133 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 134 - "NewSessionDialog"
Cohesion: 0.22
Nodes (15): activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession(), computerProviders() (+7 more)

### Community 135 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 136 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 137 - "recordValue"
Cohesion: 0.22
Nodes (14): backgroundHandoff(), booleanValue(), errorValue(), notificationKind(), parsedValue(), rawTailText(), recordValue(), shellIdFromFooter() (+6 more)

### Community 138 - "OracleVoiceClientDependencies"
Cohesion: 0.19
Nodes (4): defaultDependencies(), OracleVoiceClientDependencies, FakePlayback, VoicePlaybackOptions

### Community 139 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 140 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 141 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 142 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 143 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 144 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 145 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 146 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 147 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 148 - "setupWorkspaceFixture"
Cohesion: 0.22
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 149 - "HubEvent"
Cohesion: 0.20
Nodes (5): ComputerManagerEvents, HubEventSource, directories, RFC-8030, HubEvent

### Community 150 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 151 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 152 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 153 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 154 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 155 - "copilot-sdk-client.ts"
Cohesion: 0.42
Nodes (7): COPILOT_SDK_SESSION_DISCOVERY, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 156 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 158 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 159 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 161 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 162 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 164 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 165 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 166 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 167 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 168 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 169 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 170 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 175 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **1054 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1049 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1793 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `OracleVoiceClient` connect `OracleVoiceClient` to `client.ts`, `OracleVoiceClientDependencies`, `manager-agent.ts`, `VoiceCapabilities`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `App()` connect `App` to `markdown-navigation.ts`, `App.tsx`, `api.ts`, `NewSessionDialog`, `agent-service.ts`, `KnowledgePosition`, `knowledge-tree.ts`, `ChatMessage`, `normalizeKnowledgeRelativePath`, `pending-echo.ts`, `pwa.ts`, `shell.ts`, `session-presentation.ts`, `UserInputReplyInput`, `push-notification-service.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `VoiceCapture` connect `VoiceCapture` to `oracle-voice-coordinator.ts`, `Pcm16Resampler`, `VoiceClientControl`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1054 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.04170888213441405 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03097826086956522 - nodes in this community are weakly interconnected._
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
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
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
- `src/index.css`
- `config/oracle-voice-profiles.json`
