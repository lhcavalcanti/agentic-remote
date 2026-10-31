# Agentic Remote - Graphify code map

Snapshot: `de415875b5a5220f6d6c81b59a99ef6cc4eabfc5e58432a6fcd58241ceaacaa0`

Source checkout: `3340f3381540ac677b2c872a151a440fdecce4b3`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 397 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 397 files · ~773,318 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6606 nodes · 18156 edges · 223 communities (179 shown, 28 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 963 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionDetail
- App.tsx
- App
- App.test.tsx
- oracle-voice-worker.ts
- claude-agent-service.ts
- agent-service.ts
- agent-service.test.ts
- oracle-voice.ts
- multi-node.test.ts
- oracle-voice-soak.ts
- agentic-remote-promotion-monitor
- contracts.ts
- oracle-voice-routes.test.ts
- computer-manager.ts
- oracle-voice-integration.test.ts
- manager-tools.ts
- queued-dispatch.test.ts
- terminal-session.ts
- ManagerStore
- active-sessions.ts
- ManagerAgent
- TmuxTerminalSessionController
- session-presentation.ts
- manager-structured-memory-validation.ts
- send-matrix.integration.test.ts
- RemoteNodeClient
- FakeManager
- ManagedSession
- workspace-fixtures.ts
- FakeVoiceEngine
- app.ts
- ResidentVoiceWorker
- oracle-voice-session.ts
- session-store.ts
- markdown-navigation.ts
- pwa.ts
- agentic-remote
- hub-routes.ts
- VoiceAudioFrame
- terminal-session.test.ts
- OracleVoiceClient
- oracle-voice-benchmark.ts
- bundle
- transcription-service.ts
- manager.ts
- DreamerStore
- manager-agent.ts
- ProviderSessionService
- tmux-test-helpers.ts
- shell.ts
- lib.rs
- oracle-voice-config.ts
- session-resource-providers.test.ts
- SessionService
- VoiceCapture
- agentic-remote-promotion-setup
- DreamerService
- manager-agent.test.ts
- agentic-remote-gate
- config.rs
- ChildVoiceEngine
- dreamer-store.ts
- PushNotificationService
- cleanDialogLine
- knowledge-tree.ts
- real-voice.ts
- capture.ts
- dependencies
- devDependencies
- SessionKnowledgeStore
- manager-structured-memory.ts
- OracleVoiceCoordinator
- oracle-voice-security.test.ts
- react
- node-routes.ts
- shared/settings-profile.ts
- session-resource-clear.test.ts
- oracle-voice-segments.ts
- src/settings-profile.ts
- client.test.ts
- capture-workspace.ts
- dreamer-planner.ts
- push-notification-service.ts
- PromptCards.tsx
- .replyUserInputInternal
- SessionOrderStore
- OracleDreamer.tsx
- ManagerClientDefaults
- VoicePlayback
- session-reply-durability.test.ts
- session-store-providers.test.ts
- manager-structured-memory-search.ts
- HubEvent
- settings-profile-store.ts
- session-patch-browser.ts
- KnowledgeStore
- backgroundTasksFromEvents
- cli-canary.ts
- scripts
- directory-browser.ts
- background-task-adapter.ts
- oracle-voice-coordinator.test.ts
- compilerOptions
- SettingsProfileClient
- ManagerStructuredMemoryStore
- dreamer-service.ts
- startup-phases.test.ts
- oracle-voice-tickets.ts
- full-gate.test.ts
- refusal-metrics.ts
- ManagerAssistant
- compilerOptions
- .askSession
- oracle-voice-coordinator.ts
- session-knowledge-store.ts
- OnlineRecognizer
- ManagerAssistant.tsx
- ManagerAssistant.test.tsx
- compilerOptions
- compilerOptions
- delegated-transcription-service.ts
- .toolHost
- workspace-browser.ts
- normalizeKnowledgeRelativePath
- dreamer-schedule.ts
- ManagerMemory
- use-oracle-settings.ts
- BoundedQueue
- client.ts
- ReaderWorkspace
- ManagerSnapshot
- session-latency-benchmark.ts
- VoiceClientControl
- NewSessionDialog
- use-session-knowledge-root.ts
- background-task-stop.test.ts
- promotion-monitor.test.ts
- recovery-resend-durability.test.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- terminal-form-deadline.test.ts
- scripts
- file-upload-routes.ts
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- registerSessionKnowledgeRoutes
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- Pcm16Resampler
- background-task-tracker.ts
- .initialize
- .handleManagerEvent
- send-policy.test.ts
- BackgroundTasksDialog.tsx
- normalizeBackgroundTask
- DeferredSession
- claude-recovery-admission.test.ts
- session-knowledge-routes.ts
- session-response-order.ts
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- bridge.rs
- transcribeAudio
- KnowledgePosition
- ManagerEvent
- promotion-setup-execution.test.ts
- SessionAdmissions
- settings-profile.test.ts
- vite.config.ts
- package.json
- manager-structured-memory-performance.test.ts
- OracleVoiceClientDependencies
- release-publication.test.ts
- deleteSession
- OracleVoicePlayback
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- .transport
- composer-layout.test.ts
- recovery-context.ts
- dreamer-app.test.ts
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
1. `SessionDetail` - 299 edges
2. `App()` - 275 edges
3. `AgentService` - 265 edges
4. `SessionStore` - 179 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 99 edges
7. `buildApp()` - 92 edges
8. `registerHubRoutes()` - 92 edges
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
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (223 total, 28 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (10): agentMode(), AgentService, isTerminalNotReadyRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, queueConflict(), isRetainedRefusal(), TerminalSessionController (+2 more)

### Community 1 - "SessionDetail"
Cohesion: 0.03
Nodes (34): fixture(), ClaudeAgentService, isMissingClaudeSessionError(), recoveryFixture(), fixture(), fixture(), fixture(), channels (+26 more)

### Community 2 - "App.tsx"
Cohesion: 0.02
Nodes (126): ActivityStatus, configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+118 more)

### Community 3 - "App"
Cohesion: 0.04
Nodes (141): askSession(), clearConversation(), deleteKnowledgeRoot(), recoverConversation(), reorderQueuedPrompts(), replyPermission(), restartSession(), saveSessionVisibility() (+133 more)

### Community 4 - "App.test.tsx"
Cohesion: 0.03
Nodes (83): addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), configureRetention(), createOracleVoiceTicket(), dispatchQueuedPrompt(), fetchSessionOrder() (+75 more)

### Community 5 - "oracle-voice-worker.ts"
Cohesion: 0.03
Nodes (67): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, createVoiceWorker(), defaultSpawnPiper(), errorMessage() (+59 more)

### Community 6 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (66): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+58 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.04
Nodes (78): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+70 more)

### Community 8 - "agent-service.test.ts"
Cohesion: 0.03
Nodes (52): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, directories, fakeClient() (+44 more)

### Community 9 - "oracle-voice.ts"
Cohesion: 0.05
Nodes (72): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+64 more)

### Community 10 - "multi-node.test.ts"
Cohesion: 0.04
Nodes (21): directories, FakeSessionService, routingFixture(), session(), temporaryDirectory(), voiceControlQueues, voiceControlWaiters, AgentMode (+13 more)

### Community 11 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (35): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+27 more)

### Community 12 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 13 - "contracts.ts"
Cohesion: 0.04
Nodes (58): DEFINITE_DISPATCH_REFUSALS, REDIRECT_STATUSES, client(), servers, session, RemoteNodeRedirectError, RemoteNodeRequestError, AddComputerInput (+50 more)

### Community 14 - "oracle-voice-routes.test.ts"
Cohesion: 0.03
Nodes (27): ActiveBackendSession, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, execFileAsync, RealVoiceState, apps (+19 more)

### Community 15 - "computer-manager.ts"
Cohesion: 0.05
Nodes (36): ServerRole, ClaudeAgentServiceEvents, fixture(), managers, releases, remote, session(), RemoteSessionListing (+28 more)

### Community 16 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+24 more)

### Community 17 - "manager-tools.ts"
Cohesion: 0.06
Nodes (35): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), steer() (+27 more)

### Community 18 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (33): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), QueuedDelivery (+25 more)

### Community 19 - "terminal-session.ts"
Cohesion: 0.06
Nodes (59): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerRowText() (+51 more)

### Community 20 - "ManagerStore"
Cohesion: 0.06
Nodes (24): openStore(), JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), emptyState(), JournalDraft, JournalEntry (+16 more)

### Community 21 - "active-sessions.ts"
Cohesion: 0.06
Nodes (51): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+43 more)

### Community 22 - "ManagerAgent"
Cohesion: 0.10
Nodes (9): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, withTimeout() (+1 more)

### Community 23 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (22): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, formReplyExpired(), parseTerminalUpdateNotice(), processAncestors(), processCommand() (+14 more)

### Community 24 - "session-presentation.ts"
Cohesion: 0.07
Nodes (50): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+42 more)

### Community 25 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 26 - "send-matrix.integration.test.ts"
Cohesion: 0.05
Nodes (49): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+41 more)

### Community 27 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (9): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt, WorkspaceFile (+1 more)

### Community 28 - "FakeManager"
Cohesion: 0.07
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 29 - "ManagedSession"
Cohesion: 0.15
Nodes (6): ComputerManager, managedSession(), registerHubRoutes(), SessionMuteCarrier, ManagedRemovedQueuedPrompt, ManagedSession

### Community 30 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (40): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+32 more)

### Community 31 - "FakeVoiceEngine"
Cohesion: 0.06
Nodes (24): voiceBackend(), FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+16 more)

### Community 32 - "app.ts"
Cohesion: 0.07
Nodes (29): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+21 more)

### Community 33 - "ResidentVoiceWorker"
Cohesion: 0.09
Nodes (13): combinedTranscript(), matchesCancelled(), pcm16ToFloat32(), PiperProcess, ResidentVoiceWorker, SherpaRecognizer, SherpaStream, SherpaTts (+5 more)

### Community 34 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (17): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), createVoiceBackendSession(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled() (+9 more)

### Community 35 - "session-store.ts"
Cohesion: 0.05
Nodes (36): idleDaysSchema, mergeSessionRetention(), sessionRetentionPatchSchema, sessionRetentionSchema, activityDuration(), activityResultPreview(), archivedMessage(), disk (+28 more)

### Community 36 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (40): executeCommand(), listWorkspace(), searchWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+32 more)

### Community 37 - "pwa.ts"
Cohesion: 0.08
Nodes (42): AppVersion, parseAppVersion(), deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate() (+34 more)

### Community 38 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 39 - "hub-routes.ts"
Cohesion: 0.05
Nodes (43): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+35 more)

### Community 40 - "VoiceAudioFrame"
Cohesion: 0.10
Nodes (23): AudioReservation, VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError() (+15 more)

### Community 41 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (34): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), isTerminalAgentWorking(), isTerminalLoading(), isTerminalOverlay() (+26 more)

### Community 42 - "OracleVoiceClient"
Cohesion: 0.14
Nodes (7): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, playbackClientError(), terminalCloseCode()

### Community 43 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (38): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, deferred() (+30 more)

### Community 44 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 45 - "transcription-service.ts"
Cohesion: 0.08
Nodes (26): collect(), oversized(), statusCodeOf(), CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner() (+18 more)

### Community 46 - "manager.ts"
Cohesion: 0.07
Nodes (25): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+17 more)

### Community 47 - "DreamerStore"
Cohesion: 0.13
Nodes (11): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, emptyState(), isMissing() (+3 more)

### Community 48 - "manager-agent.ts"
Cohesion: 0.09
Nodes (29): discover(), isPending(), isQueued(), ManagerAgentOptions, Rung, TURN_ACTIVITY, ago(), attentionRank() (+21 more)

### Community 50 - "tmux-test-helpers.ts"
Cohesion: 0.12
Nodes (31): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, assertSameIdentity(), createIsolatedTmuxRoot() (+23 more)

### Community 51 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 52 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 53 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (28): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+20 more)

### Community 54 - "session-resource-providers.test.ts"
Cohesion: 0.07
Nodes (30): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), disk (+22 more)

### Community 56 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 57 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 58 - "DreamerService"
Cohesion: 0.14
Nodes (11): parse(), planSchema, registerDreamerRoutes(), settingsSchema, apps, directories, setup(), DreamerService (+3 more)

### Community 59 - "manager-agent.test.ts"
Cohesion: 0.07
Nodes (16): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+8 more)

### Community 60 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 61 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 62 - "ChildVoiceEngine"
Cohesion: 0.14
Nodes (6): benchmarkGroup(), ChildVoiceEngine, errorMessage(), matchesSynthesis(), matchesUtterance(), VoiceChildProcess

### Community 63 - "dreamer-store.ts"
Cohesion: 0.08
Nodes (31): assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES, DREAMER_STAGING_PREFIX (+23 more)

### Community 64 - "PushNotificationService"
Cohesion: 0.12
Nodes (8): HubEventSource, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 65 - "cleanDialogLine"
Cohesion: 0.13
Nodes (31): activeBottomFrame(), captureBeforeDeadline(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), FormReplyDeadlineError (+23 more)

### Community 66 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+26 more)

### Community 67 - "real-voice.ts"
Cohesion: 0.09
Nodes (13): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+5 more)

### Community 68 - "capture.ts"
Cohesion: 0.07
Nodes (17): BufferedFrame, defaultAudioContext(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode (+9 more)

### Community 69 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 70 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 71 - "SessionKnowledgeStore"
Cohesion: 0.12
Nodes (11): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateWithPaths(), disk, fixture(), fixtures (+3 more)

### Community 72 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+20 more)

### Community 74 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (20): FakeVoiceEngineCall, SocketMessage, apps, BlockingEngine, config, configFixture(), connect(), Inbox (+12 more)

### Community 75 - "react"
Cohesion: 0.09
Nodes (18): react, SessionRetention, blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource() (+10 more)

### Community 76 - "node-routes.ts"
Cohesion: 0.07
Nodes (30): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema (+22 more)

### Community 77 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (31): AccentSetting, appearanceSettings, applySettingsChanges(), isRecord(), isSettingsRevision(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting (+23 more)

### Community 78 - "session-resource-clear.test.ts"
Cohesion: 0.10
Nodes (17): normalizedTitle(), restart(), fixture(), httpBoundary(), apps, directories, directory(), obstructUploads() (+9 more)

### Community 79 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 80 - "src/settings-profile.ts"
Cohesion: 0.09
Nodes (24): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, statuslineItems (+16 more)

### Community 81 - "client.test.ts"
Cohesion: 0.09
Nodes (9): OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse() (+1 more)

### Community 82 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 83 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (27): activeDreamerMemoryIds(), activeMemoryRecord(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), digest(), DREAMER_DEFAULT_STALE_AFTER_MS (+19 more)

### Community 84 - "push-notification-service.ts"
Cohesion: 0.12
Nodes (21): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+13 more)

### Community 85 - "PromptCards.tsx"
Cohesion: 0.11
Nodes (24): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+16 more)

### Community 86 - ".replyUserInputInternal"
Cohesion: 0.14
Nodes (6): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, PendingUserInput, deliveryUncertaintyFromError()

### Community 87 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 88 - "OracleDreamer.tsx"
Cohesion: 0.14
Nodes (21): DreamerPlanItem, DreamerPlanItemSource, DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, getDreamer(), request(), saveDreamerSettings() (+13 more)

### Community 89 - "ManagerClientDefaults"
Cohesion: 0.12
Nodes (15): ManagerClientDefaults, VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState (+7 more)

### Community 90 - "VoicePlayback"
Cohesion: 0.13
Nodes (5): SegmentDrain, FakeSource, harness(), validateGeneration(), VoicePlayback

### Community 91 - "session-reply-durability.test.ts"
Cohesion: 0.12
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 92 - "session-store-providers.test.ts"
Cohesion: 0.09
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession() (+2 more)

### Community 93 - "manager-structured-memory-search.ts"
Cohesion: 0.12
Nodes (24): DreamerMemoryMetadataRecord, authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord() (+16 more)

### Community 94 - "HubEvent"
Cohesion: 0.12
Nodes (15): Connection, WorkspaceFixture, ComputerManagerEvents, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset (+7 more)

### Community 95 - "settings-profile-store.ts"
Cohesion: 0.13
Nodes (17): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+9 more)

### Community 96 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 97 - "KnowledgeStore"
Cohesion: 0.16
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 98 - "backgroundTasksFromEvents"
Cohesion: 0.19
Nodes (27): addActivity(), backgroundHandoff(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventString(), eventTask(), lastForegroundCompletionAt() (+19 more)

### Community 99 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 100 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 101 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 102 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (23): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isLiveTaskStatus(), isOlderExecution(), isShellObserverTool() (+15 more)

### Community 103 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.11
Nodes (12): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+4 more)

### Community 104 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 105 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 106 - "ManagerStructuredMemoryStore"
Cohesion: 0.25
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 107 - "dreamer-service.ts"
Cohesion: 0.13
Nodes (16): DREAMER_MAX_ITEMS, DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), digest(), DreamerPlannerExecutionInput, DreamerServiceOptions (+8 more)

### Community 108 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (13): phases, port, createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address (+5 more)

### Community 109 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 110 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 111 - "refusal-metrics.ts"
Cohesion: 0.16
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+7 more)

### Community 112 - "ManagerAssistant"
Cohesion: 0.14
Nodes (18): editQueuedManagerMessage(), retryManagerMessage(), sendManagerMessage(), applyEvent(), conversationStateLabel(), ManagerAssistant(), act(), announce() (+10 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 114 - ".askSession"
Cohesion: 0.16
Nodes (5): forgetSessionEvents(), sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout()

### Community 115 - "oracle-voice-coordinator.ts"
Cohesion: 0.11
Nodes (14): AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnection, PendingFinalTurn (+6 more)

### Community 116 - "session-knowledge-store.ts"
Cohesion: 0.11
Nodes (18): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+10 more)

### Community 117 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 118 - "ManagerAssistant.tsx"
Cohesion: 0.14
Nodes (15): ManagerStatus, phoneEnterCreatesNewline(), boundWidth(), canTakeFocus(), ORACLE_CONVERSATION_WIDTH_MIN, ORACLE_PANEL_WIDTH_MIN, OracleIndicator, readWidth() (+7 more)

### Community 119 - "ManagerAssistant.test.tsx"
Cohesion: 0.11
Nodes (12): removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), sessionLinkTarget(), startOver(), OracleButton(), OracleControl, conversationCapability (+4 more)

### Community 120 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 121 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 122 - "delegated-transcription-service.ts"
Cohesion: 0.15
Nodes (8): DelegatedTranscriptionOptions, DelegatedTranscriptionService, hubComputer, workstation, AudioUpload, MAX_AUDIO_BYTES, TranscriptionService, AudioTranscription

### Community 124 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 125 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 126 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 127 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 128 - "use-oracle-settings.ts"
Cohesion: 0.19
Nodes (12): getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps, models (+4 more)

### Community 129 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 130 - "client.ts"
Cohesion: 0.14
Nodes (13): closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, parseHello(), PendingHello (+5 more)

### Community 131 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 132 - "ManagerSnapshot"
Cohesion: 0.16
Nodes (4): FakeManager, createManager(), StoredManager, ManagerSnapshot

### Community 133 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 135 - "NewSessionDialog"
Cohesion: 0.18
Nodes (17): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+9 more)

### Community 136 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 137 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 138 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 139 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 140 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 141 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 142 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 143 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 144 - "file-upload-routes.ts"
Cohesion: 0.20
Nodes (8): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), registerTranscriptionRoutes(), transcriptionMultipartOptions

### Community 145 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 146 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 147 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 148 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

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

### Community 153 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 154 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 155 - ".initialize"
Cohesion: 0.24
Nodes (4): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, open()

### Community 157 - "send-policy.test.ts"
Cohesion: 0.20
Nodes (10): SessionExecutionMode, TerminalSendPolicyInput, TerminalSendRequestOptions, booleans, combinations, executionModes, providers, replacing (+2 more)

### Community 158 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 159 - "normalizeBackgroundTask"
Cohesion: 0.22
Nodes (10): attachmentModeValue(), booleanValue(), executionModeValue(), isBackgroundTaskInfo(), isBackgroundTaskProgress(), normalizeBackgroundTask(), numberValue(), progressValue() (+2 more)

### Community 161 - "claude-recovery-admission.test.ts"
Cohesion: 0.25
Nodes (9): connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite() (+1 more)

### Community 162 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 163 - "session-response-order.ts"
Cohesion: 0.33
Nodes (9): carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt(), failure (+1 more)

### Community 164 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 165 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 166 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 167 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 168 - "transcribeAudio"
Cohesion: 0.29
Nodes (4): transcribeAudio(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 169 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 170 - "ManagerEvent"
Cohesion: 0.28
Nodes (4): ManagerEventSource, ManagerEventSource, OracleVoiceCoordinatorOptions, ManagerEvent

### Community 171 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 173 - "settings-profile.test.ts"
Cohesion: 0.25
Nodes (4): resolveAppearance(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 174 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 175 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 176 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.36
Nodes (5): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemorySearchResult

### Community 178 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 179 - "deleteSession"
Cohesion: 0.32
Nodes (8): addComputer(), cancelManager(), deleteSession(), removeComputer(), requestVoid(), ComputersDialog(), remove(), submit()

### Community 181 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 182 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 183 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 184 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 186 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 187 - "recovery-context.ts"
Cohesion: 0.47
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 188 - "dreamer-app.test.ts"
Cohesion: 0.40
Nodes (3): directories, runtimes, trusted

### Community 189 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1095 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1090 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1854 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionDetail`, `oracle-voice-soak.ts`, `computer-manager.ts`, `file-upload-routes.ts`, `ManagerStore`, `ManagerAgent`, `ManagedSession`, `pwa.ts`, `transcription-service.ts`, `manager.ts`, `ProviderSessionService`, `oracle-voice-config.ts`, `SessionService`, `DreamerService`, `ChildVoiceEngine`, `PushNotificationService`, `SessionKnowledgeStore`, `.replyUserInputInternal`, `SessionOrderStore`, `settings-profile-store.ts`, `KnowledgeStore`, `cli-canary.ts`, `refusal-metrics.ts`, `delegated-transcription-service.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `directory-browser.ts`, `claude-agent-service.ts`, `agent-service.ts`, `multi-node.test.ts`, `session-resource-clear.test.ts`, `.askSession`, `queued-dispatch.test.ts`, `.replyUserInputInternal`, `normalizeBackgroundTask`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `claude-agent-service.ts`, `agent-service.ts`, `session-resource-clear.test.ts`, `.replyUserInputInternal`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1095 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.039597989949748745 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.031557788944723615 - nodes in this community are weakly interconnected._
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
- `src/dreamer.css`
- `src/index.css`
- `config/oracle-voice-profiles.json`
