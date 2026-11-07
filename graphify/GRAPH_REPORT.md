# Agentic Remote - Graphify code map

Snapshot: `b0b881785ed6689d6473bfdaa096e5ccfe8bc44c58615b40e0677bcdffc7007d`

Source checkout: `714f07d9e6352a8de8b5f979435d261c422ed0c1`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 410 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 410 files · ~833,814 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6978 nodes · 19345 edges · 227 communities (191 shown, 20 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1020 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- AgentService
- api.ts
- SessionDetail
- App.tsx
- contracts.ts
- oracle-voice-session.ts
- ClaudeAgentService
- claude-agent-service.ts
- oracle-voice-soak.ts
- oracle-voice-child.ts
- agent-service.ts
- agentic-remote-promotion-monitor
- ManagerAgent
- ManagedSession
- .get
- queueConflict
- manager-tools.ts
- session-store.ts
- manager.ts
- oracle-voice-integration.test.ts
- oracle-task-store.ts
- FakeVoiceEngine
- workspace-fixtures.ts
- ManagerStore
- terminal-session.ts
- sessionKey
- ManagerAssistant.tsx
- manager-structured-memory-validation.ts
- oracle-voice-worker.ts
- background-task-adapter.ts
- manager-agent.ts
- FakeManager
- session-knowledge-routes.test.ts
- RemoteNodeClient
- markdown-navigation.ts
- oracle-voice-coordinator.ts
- dreamer-store.ts
- OracleDreamer.tsx
- TmuxTerminalSessionController
- CopilotClientLike
- dreamer-service.ts
- oracle-voice.ts
- DreamerService
- agentic-remote
- oracle-voice-benchmark.ts
- ProviderSessionService
- OracleVoiceClient
- bundle
- SessionService
- terminal-startup-queue.test.ts
- pwa.ts
- TerminalSessionController
- VoicePlayback
- SessionKnowledgeStore
- DreamerStore
- OracleVoiceCoordinator
- ManagerEvent
- client.test.ts
- shell.ts
- lib.rs
- session-enqueue-clear.test.ts
- normalizeKnowledgeRelativePath
- manager-proactive-inbox.ts
- VoiceCapture
- agentic-remote-promotion-setup
- .sendInternal
- transcription-service.ts
- agentic-remote-gate
- config.rs
- PushNotificationService
- knowledge-tree.ts
- app.ts
- agent-service.test.ts
- oracle-voice-routes.ts
- terminal-session.test.ts
- capture.ts
- dependencies
- devDependencies
- hub-routes.ts
- FakeSessionService
- active-sessions.ts
- EngineVoiceBackendSession
- ManagerProactiveCoordinator
- node-routes.ts
- shared/settings-profile.ts
- oracle-voice-child.test.ts
- oracle-voice-segments.ts
- src/settings-profile.ts
- real-voice.ts
- manager-structured-memory-search.ts
- remote-voice-client.ts
- SessionOrderStore
- tmux-errors.integration.test.ts
- ManagerClientDefaults
- manager-structured-memory.ts
- ChatMessage
- session-patch-browser.ts
- background-task-stop.test.ts
- ManagerStructuredMemoryStore
- oracle-voice-security.test.ts
- send-matrix.integration.test.ts
- settings-profile-store.ts
- cli-canary.ts
- OracleSettings.tsx
- scripts
- KnowledgeStore
- client.ts
- directory-browser.ts
- compilerOptions
- delegated-transcription-service.ts
- .toolHost
- oracle-voice-coordinator.test.ts
- SettingsProfileClient
- session-reply-durability.test.ts
- capture-workspace.ts
- .replyUserInputInternal
- manager-context.ts
- oracle-voice-tickets.ts
- submission-error.ts
- full-gate.test.ts
- startup-phases.test.ts
- session-store-providers.test.ts
- PromptCards.tsx
- compilerOptions
- manager-structured-memory-store.ts
- refusal-metrics.ts
- OnlineRecognizer
- .withFormViewport
- compilerOptions
- terminal-form-deadline.test.ts
- compilerOptions
- server/side-question.ts
- session-resource-routes.test.ts
- event-log.ts
- ManagerMemory
- oracle-voice-config.ts
- workspace-browser.ts
- react
- dreamer-schedule.ts
- BoundedQueue
- ReaderWorkspace
- server/session-patches.ts
- session-latency-benchmark.ts
- manager-runtime.ts
- ManagerProactiveInbox
- NewSessionDialog
- session-knowledge-store.ts
- oracle-voice-engine-smoke.ts
- promotion-monitor.test.ts
- recovery-resend-durability.test.ts
- scripts
- file-upload-routes.ts
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- .persist
- manager-proactive-inbox.test.ts
- theme-contrast.test.ts
- BackgroundTasksDialog.tsx
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- SessionAdmissions
- registerSessionKnowledgeRoutes
- session-resource-clear.test.ts
- session-response-order.ts
- Pcm16Resampler
- dreamer-routes.ts
- html-preview.ts
- ManagerStructuredMemoryRuntime
- session-knowledge-routes.ts
- MessageTime.test.tsx
- dataset
- generate-pwa-icons.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- screenshot-stability.test.ts
- promotion-setup-execution.test.ts
- settings-profile.test.ts
- vite.config.ts
- package.json
- ManagerProactiveInboxError
- release-publication.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- .transport
- composer-layout.test.ts
- VoiceServerControl
- usePanelWidth
- MarkdownCodeBlock.tsx
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
1. `SessionDetail` - 309 edges
2. `AgentService` - 280 edges
3. `App()` - 278 edges
4. `SessionStore` - 189 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 110 edges
7. `ManagerAgent` - 96 edges
8. `buildApp()` - 95 edges
9. `registerHubRoutes()` - 93 edges
10. `ComputerManager` - 87 edges

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

## Communities (227 total, 20 thin omitted)

### Community 0 - "App"
Cohesion: 0.03
Nodes (151): message(), sendLikeTheApp(), terminalSendOptions(), askSession(), clearConversation(), recoverConversation(), reorderQueuedPrompts(), saveSessionVisibility() (+143 more)

### Community 1 - "AgentService"
Cohesion: 0.04
Nodes (7): AgentService, isTerminalNotReadyRefusal(), RuntimeConfigurationError, suspendedRuntimeConflict(), terminalAnswerRefused(), recoverAndSeed(), isRetainedRefusal()

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (119): AddKnowledgeRootInput, ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, PushSettings, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, addKnowledgeRoot() (+111 more)

### Community 3 - "SessionDetail"
Cohesion: 0.05
Nodes (38): fixture(), recoveryFixture(), claudeFixture(), copilotFixture(), seed(), fixture(), fixture(), fixture() (+30 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (108): ActivityStatus, addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage() (+100 more)

### Community 5 - "contracts.ts"
Cohesion: 0.04
Nodes (58): ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, directories, voiceControlQueues, voiceControlWaiters, ProviderSessionServiceEvents (+50 more)

### Community 6 - "oracle-voice-session.ts"
Cohesion: 0.03
Nodes (48): ActiveBackendSession, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, execFileAsync, RealVoiceState, apps (+40 more)

### Community 7 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (19): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), waitForIdle(), copilotRequest(), claudeFixture(), ClaudeMcpRead, copilotFixture() (+11 more)

### Community 8 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (66): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+58 more)

### Community 9 - "oracle-voice-soak.ts"
Cohesion: 0.04
Nodes (37): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+29 more)

### Community 10 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (42): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+34 more)

### Community 11 - "agent-service.ts"
Cohesion: 0.04
Nodes (77): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+69 more)

### Community 12 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 13 - "ManagerAgent"
Cohesion: 0.08
Nodes (11): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, uniqueManagerSessionRefs() (+3 more)

### Community 14 - "ManagedSession"
Cohesion: 0.09
Nodes (15): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, TurnContextInput, ManagerProactiveCoordinatorOptions (+7 more)

### Community 15 - ".get"
Cohesion: 0.08
Nodes (6): agentMode(), foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), TranscriptObservation

### Community 16 - "queueConflict"
Cohesion: 0.05
Nodes (34): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+26 more)

### Community 17 - "manager-tools.ts"
Cohesion: 0.06
Nodes (40): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), proactiveSessionAllowed(), requireComputer(), resolveSession() (+32 more)

### Community 18 - "session-store.ts"
Cohesion: 0.04
Nodes (47): disk, fixtures, gate(), holdTurnWrite(), releases, idleDaysSchema, mergeSessionRetention(), sessionRetentionPatchSchema (+39 more)

### Community 19 - "manager.ts"
Cohesion: 0.05
Nodes (35): ProactiveManager, FakeAgent, confirmationSchema, defaultsSchema, editSchema, effort, managerCadence, managerInputError() (+27 more)

### Community 20 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+24 more)

### Community 21 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (44): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+36 more)

### Community 22 - "FakeVoiceEngine"
Cohesion: 0.05
Nodes (26): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceSttEngine, VoiceTtsEngine, VoiceUtteranceAudioFrame (+18 more)

### Community 23 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (46): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+38 more)

### Community 24 - "ManagerStore"
Cohesion: 0.06
Nodes (25): openStore(), JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), PersistedCursor, emptyState(), JournalDraft (+17 more)

### Community 25 - "terminal-session.ts"
Cohesion: 0.06
Nodes (58): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame() (+50 more)

### Community 26 - "sessionKey"
Cohesion: 0.07
Nodes (52): saveSessionOrderLane(), handleDragEnd(), RenameSessionDialog(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView (+44 more)

### Community 27 - "ManagerAssistant.tsx"
Cohesion: 0.06
Nodes (44): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline() (+36 more)

### Community 28 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 29 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (25): benchmarkGroup(), ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent() (+17 more)

### Community 30 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (55): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), CopilotClientTaskInfo (+47 more)

### Community 31 - "manager-agent.ts"
Cohesion: 0.06
Nodes (30): automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession (+22 more)

### Community 32 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 33 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (30): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+22 more)

### Community 34 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (11): headerSafe(), RemoteNodeClient, client(), servers, session, BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt (+3 more)

### Community 35 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (43): executeCommand(), listWorkspace(), searchWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink() (+35 more)

### Community 36 - "oracle-voice-coordinator.ts"
Cohesion: 0.06
Nodes (25): AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnection (+17 more)

### Community 37 - "dreamer-store.ts"
Cohesion: 0.07
Nodes (43): DreamerHistoryEntry, assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES (+35 more)

### Community 38 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (41): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+33 more)

### Community 39 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (14): copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), tmuxSessionExists() (+6 more)

### Community 40 - "CopilotClientLike"
Cohesion: 0.06
Nodes (18): CopilotClientLike, holdProbe(), fixtures, gate(), releases, restart(), sdkPermissionEvents(), sdkRecoveryEvents() (+10 more)

### Community 41 - "dreamer-service.ts"
Cohesion: 0.08
Nodes (39): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+31 more)

### Community 42 - "oracle-voice.ts"
Cohesion: 0.09
Nodes (37): capabilities, closeServers, exactArrayBuffer(), sockets, startFields, VoiceNode, decodeVoiceAudioFrame(), encodeVoiceAudioFrame() (+29 more)

### Community 43 - "DreamerService"
Cohesion: 0.14
Nodes (9): digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate, DreamerSnapshot (+1 more)

### Community 44 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 45 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (39): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, deferred() (+31 more)

### Community 47 - "OracleVoiceClient"
Cohesion: 0.15
Nodes (8): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError(), terminalCloseCode()

### Community 48 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 49 - "SessionService"
Cohesion: 0.09
Nodes (3): registerNodeRoutes(), SessionService, WorkspaceFile

### Community 50 - "terminal-startup-queue.test.ts"
Cohesion: 0.11
Nodes (36): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, deliveryFixture(), client() (+28 more)

### Community 51 - "pwa.ts"
Cohesion: 0.09
Nodes (40): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+32 more)

### Community 52 - "TerminalSessionController"
Cohesion: 0.05
Nodes (15): removeCopilotSessionFiles(), fixtures, releases, bootLegacy(), directories, execute, pending, releases (+7 more)

### Community 53 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 54 - "SessionKnowledgeStore"
Cohesion: 0.10
Nodes (15): WorkspaceFixtureState, bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeEvents, SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateSchema (+7 more)

### Community 55 - "DreamerStore"
Cohesion: 0.13
Nodes (11): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, emptyState(), isMissing() (+3 more)

### Community 57 - "ManagerEvent"
Cohesion: 0.09
Nodes (25): ManagerEventSource, ManagerEventSource, OracleVoiceCoordinatorOptions, brief(), OracleEventSource, PushPolicy, PushSender, PushState (+17 more)

### Community 58 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 59 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 60 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 61 - "session-enqueue-clear.test.ts"
Cohesion: 0.07
Nodes (31): ClaudeSdk, directories, fixture(), queryHandle(), services, connect(), createStore(), deferred() (+23 more)

### Community 62 - "normalizeKnowledgeRelativePath"
Cohesion: 0.10
Nodes (30): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+22 more)

### Community 63 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isDisposition() (+29 more)

### Community 64 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 65 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 66 - ".sendInternal"
Cohesion: 0.15
Nodes (28): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), composerHoldsText(), composerText() (+20 more)

### Community 67 - "transcription-service.ts"
Cohesion: 0.09
Nodes (23): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+15 more)

### Community 68 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 69 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 70 - "PushNotificationService"
Cohesion: 0.12
Nodes (8): HubEventSource, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 71 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+26 more)

### Community 72 - "app.ts"
Cohesion: 0.08
Nodes (21): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence (+13 more)

### Community 73 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (16): terminalFormSteps(), busyTerminal(), configurableModel(), DeferredSession, directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+8 more)

### Community 74 - "oracle-voice-routes.ts"
Cohesion: 0.12
Nodes (32): sendNodeVoiceOutput(), limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode() (+24 more)

### Community 75 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (30): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse(), pastedPlaceholderCount() (+22 more)

### Community 76 - "capture.ts"
Cohesion: 0.07
Nodes (17): BufferedFrame, defaultAudioContext(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode (+9 more)

### Community 77 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 78 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 79 - "hub-routes.ts"
Cohesion: 0.07
Nodes (34): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+26 more)

### Community 80 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 81 - "active-sessions.ts"
Cohesion: 0.12
Nodes (30): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+22 more)

### Community 82 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 83 - "ManagerProactiveCoordinator"
Cohesion: 0.13
Nodes (10): ComputerManagerEvents, batchMessageId(), isTerminal(), ManagerProactiveCoordinator, directories, fixture(), managed(), ManagerProactiveInboxEvent (+2 more)

### Community 84 - "node-routes.ts"
Cohesion: 0.07
Nodes (30): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema (+22 more)

### Community 85 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (31): AccentSetting, appearanceSettings, applySettingsChanges(), isRecord(), isSettingsRevision(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting (+23 more)

### Community 86 - "oracle-voice-child.test.ts"
Cohesion: 0.09
Nodes (12): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+4 more)

### Community 87 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 88 - "src/settings-profile.ts"
Cohesion: 0.09
Nodes (24): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, statuslineItems (+16 more)

### Community 89 - "real-voice.ts"
Cohesion: 0.11
Nodes (12): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+4 more)

### Community 90 - "manager-structured-memory-search.ts"
Cohesion: 0.11
Nodes (25): DreamerMemoryMetadataRecord, authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord() (+17 more)

### Community 91 - "remote-voice-client.ts"
Cohesion: 0.17
Nodes (12): VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient (+4 more)

### Community 92 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 93 - "tmux-errors.integration.test.ts"
Cohesion: 0.09
Nodes (21): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer(), noTmuxServer() (+13 more)

### Community 94 - "ManagerClientDefaults"
Cohesion: 0.12
Nodes (15): ManagerClientDefaults, VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState (+7 more)

### Community 95 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (26): openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_QUERY_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_RECORDS (+18 more)

### Community 96 - "ChatMessage"
Cohesion: 0.12
Nodes (14): nextVoiceControl(), BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, Client, Browser, seedOffset (+6 more)

### Community 97 - "session-patch-browser.ts"
Cohesion: 0.12
Nodes (26): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+18 more)

### Community 98 - "background-task-stop.test.ts"
Cohesion: 0.13
Nodes (19): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+11 more)

### Community 99 - "ManagerStructuredMemoryStore"
Cohesion: 0.15
Nodes (10): capturePrompt(), benchmarkState(), now(), openFixture(), searchSamples(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore (+2 more)

### Community 100 - "oracle-voice-security.test.ts"
Cohesion: 0.09
Nodes (16): VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), issueTicket(), localRuntime(), otherAllowed (+8 more)

### Community 101 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (24): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+16 more)

### Community 102 - "settings-profile-store.ts"
Cohesion: 0.13
Nodes (17): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+9 more)

### Community 103 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 104 - "OracleSettings.tsx"
Cohesion: 0.12
Nodes (20): ManagerCheckCadenceMinutes, ManagerProactiveSettings, ManagerProactiveSnapshot, getManager(), updateManagerSettings(), checkCadences, editableProactive(), effortFrom() (+12 more)

### Community 105 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 106 - "KnowledgeStore"
Cohesion: 0.17
Nodes (7): KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 107 - "client.ts"
Cohesion: 0.09
Nodes (13): closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, OracleVoicePlayback, PendingHello (+5 more)

### Community 108 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 109 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 110 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (12): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+4 more)

### Community 111 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 112 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 113 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 114 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+10 more)

### Community 115 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 116 - ".replyUserInputInternal"
Cohesion: 0.19
Nodes (4): isUncertainDelivery(), persistedFormAnswer(), fixture(), deliveryUncertaintyFromError()

### Community 117 - "manager-context.ts"
Cohesion: 0.17
Nodes (18): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+10 more)

### Community 118 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 119 - "submission-error.ts"
Cohesion: 0.14
Nodes (13): directories, runtimes, start(), trusted, RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals (+5 more)

### Community 120 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 121 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 122 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession() (+1 more)

### Community 123 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 124 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 125 - "manager-structured-memory-store.ts"
Cohesion: 0.21
Nodes (8): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStoreOptions, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput

### Community 126 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 127 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 128 - ".withFormViewport"
Cohesion: 0.18
Nodes (15): FormReplyDeadlineError, hasClippedTerminalFormFooter(), hasClippedTerminalFormTabs(), hasTerminalFormQuestionReflowCandidate(), isTerminalLoading(), parseTerminalFormActiveField(), submitTerminalForm(), tabNames() (+7 more)

### Community 129 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 130 - "terminal-form-deadline.test.ts"
Cohesion: 0.12
Nodes (14): TerminalFormContinuation, actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+6 more)

### Community 131 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 132 - "server/side-question.ts"
Cohesion: 0.20
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 133 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 134 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 135 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 136 - "oracle-voice-config.ts"
Cohesion: 0.20
Nodes (15): boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), nonNegativeInteger(), optionalValue(), parseInteger() (+7 more)

### Community 137 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 138 - "react"
Cohesion: 0.14
Nodes (8): react, drawDiagram(), drawing, MermaidDiagram(), SessionActions(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 139 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 140 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 141 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 142 - "server/session-patches.ts"
Cohesion: 0.20
Nodes (8): publish(), diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 143 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 144 - "manager-runtime.ts"
Cohesion: 0.20
Nodes (12): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkMissingSessionRetirement, CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic() (+4 more)

### Community 145 - "ManagerProactiveInbox"
Cohesion: 0.25
Nodes (4): ManagerProactiveInbox, ManagerProactiveInboxCapacityError, nowIso(), openInbox()

### Community 146 - "NewSessionDialog"
Cohesion: 0.18
Nodes (17): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+9 more)

### Community 147 - "session-knowledge-store.ts"
Cohesion: 0.13
Nodes (16): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+8 more)

### Community 148 - "oracle-voice-engine-smoke.ts"
Cohesion: 0.17
Nodes (9): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, isRecord() (+1 more)

### Community 149 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 150 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 151 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 152 - "file-upload-routes.ts"
Cohesion: 0.20
Nodes (8): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), registerTranscriptionRoutes(), transcriptionMultipartOptions

### Community 153 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 154 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 155 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 156 - ".persist"
Cohesion: 0.23
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 157 - "manager-proactive-inbox.test.ts"
Cohesion: 0.16
Nodes (9): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState() (+1 more)

### Community 158 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 159 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 160 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 161 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 162 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 163 - "SessionAdmissions"
Cohesion: 0.18
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 164 - "registerSessionKnowledgeRoutes"
Cohesion: 0.33
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 165 - "session-resource-clear.test.ts"
Cohesion: 0.17
Nodes (12): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+4 more)

### Community 166 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 167 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 168 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 169 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 170 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.24
Nodes (4): initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, ManagerStructuredMemoryMode, ManagerStructuredMemoryStatus

### Community 171 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 172 - "MessageTime.test.tsx"
Cohesion: 0.27
Nodes (8): dayTime, full, messageTimeParts(), time, MessageTime(), dayTime, full, time

### Community 173 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 174 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 175 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 176 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 177 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 178 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 179 - "settings-profile.test.ts"
Cohesion: 0.25
Nodes (4): resolveAppearance(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 180 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 181 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 182 - "ManagerProactiveInboxError"
Cohesion: 0.25
Nodes (4): ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError

### Community 183 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 184 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 185 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 186 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 187 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 189 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 190 - "VoiceServerControl"
Cohesion: 0.40
Nodes (4): connect(), Inbox, rawBuffer(), VoiceServerControl

### Community 191 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 192 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 193 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1155 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1150 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1943 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionDetail`, `ClaudeAgentService`, `oracle-voice-config.ts`, `oracle-voice-soak.ts`, `ManagerAgent`, `ManagedSession`, `manager-runtime.ts`, `ManagerProactiveInbox`, `manager.ts`, `oracle-task-store.ts`, `file-upload-routes.ts`, `ManagerStore`, `oracle-voice-worker.ts`, `session-knowledge-routes.test.ts`, `dreamer-routes.ts`, `ManagerStructuredMemoryRuntime`, `DreamerService`, `ProviderSessionService`, `SessionService`, `SessionKnowledgeStore`, `transcription-service.ts`, `PushNotificationService`, `ManagerProactiveCoordinator`, `SessionOrderStore`, `settings-profile-store.ts`, `cli-canary.ts`, `KnowledgeStore`, `delegated-transcription-service.ts`, `.replyUserInputInternal`, `submission-error.ts`, `refusal-metrics.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `server/side-question.ts`, `session-resource-routes.test.ts`, `CopilotClientLike`, `claude-agent-service.ts`, `agent-service.ts`, `directory-browser.ts`, `.get`, `queueConflict`, `session-store.ts`, `.replyUserInputInternal`, `TerminalSessionController`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `claude-agent-service.ts`, `CopilotClientLike`, `.get`, `queueConflict`, `session-store.ts`, `.replyUserInputInternal`, `session-store-providers.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1155 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.029425465838509315 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.04182754182754183 - nodes in this community are weakly interconnected._
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
- `docs/superpowers/plans/2026-11-04-oracle-periodic-checks.md`
- `docs/superpowers/plans/2026-11-06-oracle-actionable-morning-plan.md`
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-17-oracle-proactive-lifecycle-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
- `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`
- `docs/superpowers/specs/2026-11-04-oracle-periodic-checks-design.md`
- `docs/superpowers/specs/2026-11-06-oracle-actionable-morning-plan-design.md`
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
