# Agentic Remote - Graphify code map

Snapshot: `5ac316b30742495946e9b85c913112e6982ced92a18107bb52fb4c62df8834df`

Source checkout: `387e2d1c11f9b7dc060587fc5b6a75bcce32299c`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 407 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 407 files · ~837,947 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6989 nodes · 19401 edges · 228 communities (193 shown, 19 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1020 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionDetail
- AgentService
- App
- App.tsx
- ClaudeAgentService
- contracts.ts
- App.test.tsx
- client.ts
- agent-service.ts
- agent-service.test.ts
- OracleVoiceCoordinator
- manager-tools.ts
- .readAfterWrites
- VoiceAudioFrame
- oracle-voice-soak.ts
- oracle-voice-child.ts
- terminal-session.ts
- agentic-remote-promotion-monitor
- node-routes.ts
- claude-agent-service.ts
- ManagedSession
- ManagerAgent
- oracle-voice-integration.test.ts
- PushNotificationService
- oracle-task-store.ts
- oracle-voice.ts
- oracle-voice-engine.ts
- sessionKey
- RemoteNodeClient
- manager-structured-memory-validation.ts
- oracle-voice-worker.ts
- FakeManager
- dreamer-service.ts
- ManagerStore
- SessionService
- queued-dispatch.test.ts
- react
- oracle-voice-benchmark.ts
- FakeVoiceEngine
- session-knowledge-routes.test.ts
- active-sessions.ts
- tmux-errors.integration.test.ts
- TmuxTerminalSessionController
- dreamer-store.ts
- HubEvent
- oracle-voice-session.ts
- .sendInternal
- app.ts
- DreamerService
- pwa.ts
- agentic-remote
- markdown-navigation.ts
- bundle
- session-resource-providers.test.ts
- hub-routes.ts
- ProviderSessionService
- DreamerStore
- VoicePlayback
- manager.ts
- manager-proactive-inbox.ts
- tmux-test-helpers.ts
- manager-agent.test.ts
- client.test.ts
- shell.ts
- lib.rs
- agentic-remote-promotion-setup
- agentic-remote-gate
- config.rs
- FakeSessionService
- oracle-voice-child.test.ts
- ManagerAssistant.tsx
- api.ts
- OracleDreamer.tsx
- dependencies
- devDependencies
- ManagerSnapshot
- oracle-voice-security.test.ts
- shared/settings-profile.ts
- manager-agent.ts
- manager-structured-memory.ts
- knowledge-tree.ts
- background-task-adapter.ts
- oracle-voice-routes.ts
- oracle-voice-segments.ts
- workspace-fixtures.ts
- send-matrix.integration.test.ts
- SessionOrderStore
- UserInputReplyInput
- delegated-transcription-service.ts
- terminal-startup-queue.test.ts
- src/settings-profile.ts
- session-patch-browser.ts
- cli-canary.ts
- VoiceClientControl
- terminal-session.test.ts
- scripts
- oracle-voice-config.ts
- directory-browser.ts
- manager-routes.ts
- manager-structured-memory-search.ts
- SessionKnowledgeStore
- manager-context.ts
- compilerOptions
- capture-workbench-review.ts
- .toolHost
- ManagerStructuredMemoryStore
- oracle-voice-coordinator.test.ts
- transcription-service.ts
- SettingsProfileClient
- ManagerProactiveCoordinator
- startup-phases.test.ts
- ManagerProactiveInbox
- oracle-voice-tickets.ts
- capture-workspace.ts
- TerminalSessionController
- full-gate.test.ts
- session-reply-durability.test.ts
- session-store-providers.test.ts
- settings-profile-store.ts
- ManagerAssistant.test.tsx
- compilerOptions
- SessionKnowledgeBinding
- OnlineRecognizer
- compilerOptions
- compilerOptions
- ManagerMemory
- refusal-metrics.ts
- workspace-browser.ts
- backgroundTasksFromEvents
- dreamer-schedule.ts
- NewSessionDialog
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- normalizeKnowledgeRelativePath
- .observe
- terminal-form-deadline.test.ts
- background-task-stop.test.ts
- promotion-monitor.test.ts
- recovery-resend-durability.test.ts
- submission-error.ts
- session-knowledge-store.ts
- session-resource-routes.test.ts
- scripts
- VoiceEngineEvent
- oracle-voice-assets.test.ts
- capture
- pending-echo.ts
- fake-vad.ts
- desktop.json
- DeferredSession
- manager-proactive-inbox.test.ts
- registerSessionKnowledgeRoutes
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- TranscriptionError
- session-response-order.ts
- Pcm16Resampler
- background-task-tracker.ts
- dreamer-routes.ts
- .initialize
- BackgroundTasksDialog.tsx
- html-preview.ts
- .askSession
- manager-structured-memory-performance.test.ts
- session-knowledge-routes.ts
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- file-upload-routes.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- transcribeAudio
- DreamerMorningPlan
- screenshot-stability.test.ts
- KnowledgePosition
- promotion-setup-execution.test.ts
- SessionAdmissions
- session-knowledge-store.test.ts
- settings-profile.test.ts
- vite.config.ts
- package.json
- release-publication.test.ts
- render-workspace-gifs.ts
- backgroundHandoff
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- .transport
- composer-layout.test.ts
- usePanelWidth
- api-origin.test.ts
- dreamer-app.test.ts
- promotion-setup.test.ts
- appearance.ts
- FakeRecorder
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
6. `ManagedSession` - 112 edges
7. `ManagerAgent` - 99 edges
8. `buildApp()` - 96 edges
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

## Communities (228 total, 19 thin omitted)

### Community 0 - "SessionDetail"
Cohesion: 0.03
Nodes (79): fixture(), restart(), createStore(), recoveryFixture(), fixture(), claudeFixture(), copilotFixture(), seed() (+71 more)

### Community 1 - "AgentService"
Cohesion: 0.04
Nodes (9): agentMode(), AgentService, recoveredPermissionTitle(), removeCopilotSessionFiles(), RuntimeConfigurationError, suspendedRuntimeConflict(), fixture(), TranscriptObservation (+1 more)

### Community 2 - "App"
Cohesion: 0.03
Nodes (151): askSession(), readKnowledgeFile(), recoverConversation(), replyPermission(), saveSessionVisibility(), activeComposerPastes(), App(), adoptConversationReplacement() (+143 more)

### Community 3 - "App.tsx"
Cohesion: 0.03
Nodes (97): ActivityStatus, addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage() (+89 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (15): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+7 more)

### Community 5 - "contracts.ts"
Cohesion: 0.04
Nodes (65): ClaudeAgentServiceEvents, RemoteSessionListing, directories, nextVoiceControl(), voiceControlQueues, voiceControlWaiters, ProviderSessionServiceEvents, DEFINITE_DISPATCH_REFUSALS (+57 more)

### Community 6 - "App.test.tsx"
Cohesion: 0.03
Nodes (82): addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRetention(), createOracleVoiceTicket(), deleteKnowledgeRoot() (+74 more)

### Community 7 - "client.ts"
Cohesion: 0.05
Nodes (37): ManagerClientDefaults, VoiceCapabilities, VoiceServerControl, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason() (+29 more)

### Community 8 - "agent-service.ts"
Cohesion: 0.04
Nodes (84): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+76 more)

### Community 9 - "agent-service.test.ts"
Cohesion: 0.03
Nodes (60): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+52 more)

### Community 10 - "OracleVoiceCoordinator"
Cohesion: 0.05
Nodes (26): ManagerEventSource, ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect() (+18 more)

### Community 11 - "manager-tools.ts"
Cohesion: 0.04
Nodes (48): uniqueManagerSessionRefs(), APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, createManagerTools(), closeCapReached() (+40 more)

### Community 12 - ".readAfterWrites"
Cohesion: 0.07
Nodes (6): isTerminalNotReadyRefusal(), terminalAnswerRefused(), queueConflict(), httpBoundary(), isRetainedRefusal(), StartupPhases

### Community 13 - "VoiceAudioFrame"
Cohesion: 0.05
Nodes (28): QueuedAudio, BrowserCaptureOptions, AudioReservation, VoiceAudioFrame, BufferedFrame, captureFailure(), defaultAudioContext(), permissionError() (+20 more)

### Community 14 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 15 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (40): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+32 more)

### Community 16 - "terminal-session.ts"
Cohesion: 0.05
Nodes (75): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerHoldsOtherText() (+67 more)

### Community 17 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 18 - "node-routes.ts"
Cohesion: 0.03
Nodes (49): ActiveBackendSession, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason() (+41 more)

### Community 19 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (54): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+46 more)

### Community 20 - "ManagedSession"
Cohesion: 0.10
Nodes (12): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), TurnContextInput, ManagerProactiveCoordinatorOptions (+4 more)

### Community 21 - "ManagerAgent"
Cohesion: 0.09
Nodes (13): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+5 more)

### Community 22 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (33): voiceBackend(), apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+25 more)

### Community 23 - "PushNotificationService"
Cohesion: 0.07
Nodes (29): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+21 more)

### Community 24 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (44): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+36 more)

### Community 25 - "oracle-voice.ts"
Cohesion: 0.07
Nodes (48): apps, directories, sendNodeVoiceOutput(), outputBytes(), sendBrowserOutput(), DEFAULT_VOICE_BACKEND_LIMITS, VoiceBackendOutput, REDIRECT_STATUSES (+40 more)

### Community 26 - "oracle-voice-engine.ts"
Cohesion: 0.05
Nodes (21): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+13 more)

### Community 27 - "sessionKey"
Cohesion: 0.07
Nodes (53): saveSessionOrderLane(), handleDragEnd(), RenameSessionDialog(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView (+45 more)

### Community 28 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (14): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, client(), servers, session, BackgroundTaskSnapshot (+6 more)

### Community 29 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 30 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (25): benchmarkGroup(), ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent() (+17 more)

### Community 31 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 32 - "dreamer-service.ts"
Cohesion: 0.07
Nodes (45): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+37 more)

### Community 33 - "ManagerStore"
Cohesion: 0.07
Nodes (20): capturePrompt(), openStore(), JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), emptyState(), JournalDraft (+12 more)

### Community 34 - "SessionService"
Cohesion: 0.07
Nodes (10): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, readServiceResources(), readSessionSkills(), ResourceReads (+2 more)

### Community 35 - "queued-dispatch.test.ts"
Cohesion: 0.06
Nodes (28): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), QueuedDelivery (+20 more)

### Community 36 - "react"
Cohesion: 0.06
Nodes (35): react, SessionRetention, SessionRetentionPatch, UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading() (+27 more)

### Community 37 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 38 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (23): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+15 more)

### Community 39 - "session-knowledge-routes.test.ts"
Cohesion: 0.07
Nodes (24): WorkspaceFixtureState, SessionMetadataLookup, SessionMuteCarrier, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, disk (+16 more)

### Community 40 - "active-sessions.ts"
Cohesion: 0.08
Nodes (43): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+35 more)

### Community 41 - "tmux-errors.integration.test.ts"
Cohesion: 0.06
Nodes (28): fixture(), managers, releases, remote, session(), ComputerRegistry, DurableRegisteredComputer, LegacyRegisteredComputer (+20 more)

### Community 42 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (14): startAgentAfterClear(), composer(), processAdapter, copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors() (+6 more)

### Community 43 - "dreamer-store.ts"
Cohesion: 0.07
Nodes (43): DreamerHistoryEntry, assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES (+35 more)

### Community 44 - "HubEvent"
Cohesion: 0.07
Nodes (25): Connection, ComputerManagerEvents, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), Client (+17 more)

### Community 45 - "oracle-voice-session.ts"
Cohesion: 0.12
Nodes (16): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), outputBytes() (+8 more)

### Community 46 - ".sendInternal"
Cohesion: 0.12
Nodes (36): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+28 more)

### Community 47 - "app.ts"
Cohesion: 0.07
Nodes (28): buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe(), ServerRole, ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName() (+20 more)

### Community 48 - "DreamerService"
Cohesion: 0.14
Nodes (9): digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate, DreamerSnapshot (+1 more)

### Community 49 - "pwa.ts"
Cohesion: 0.08
Nodes (42): AppVersion, parseAppVersion(), deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate() (+34 more)

### Community 50 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 51 - "markdown-navigation.ts"
Cohesion: 0.09
Nodes (38): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+30 more)

### Community 52 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 53 - "session-resource-providers.test.ts"
Cohesion: 0.06
Nodes (38): ClaudeSdk, connect(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite() (+30 more)

### Community 54 - "hub-routes.ts"
Cohesion: 0.06
Nodes (41): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+33 more)

### Community 56 - "DreamerStore"
Cohesion: 0.13
Nodes (11): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, emptyState(), isMissing() (+3 more)

### Community 57 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 58 - "manager.ts"
Cohesion: 0.08
Nodes (31): ManagerState, isManagerEvent(), ManagerAutomaticContext, ManagerCheckCadenceMinutes, managerCheckCadences, ManagerMessageRole, ManagerMessageState, ManagerProactiveSettings (+23 more)

### Community 59 - "manager-proactive-inbox.ts"
Cohesion: 0.07
Nodes (39): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isDisposition() (+31 more)

### Community 60 - "tmux-test-helpers.ts"
Cohesion: 0.12
Nodes (32): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, deliveryFixture(), assertSameIdentity() (+24 more)

### Community 61 - "manager-agent.test.ts"
Cohesion: 0.07
Nodes (16): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail(), FakeClient (+8 more)

### Community 62 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 63 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 64 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 65 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 66 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 67 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 68 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 69 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (14): createVoiceWorker(), PiperProcess, childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream (+6 more)

### Community 70 - "ManagerAssistant.tsx"
Cohesion: 0.10
Nodes (29): editQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), phoneEnterCreatesNewline(), applyEvent(), canTakeFocus(), conversationStateLabel(), ManagerAssistant() (+21 more)

### Community 71 - "api.ts"
Cohesion: 0.10
Nodes (30): ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, definiteDispatchRefusals, isMcpSummary(), isRecord(), isSkillSummary() (+22 more)

### Community 72 - "OracleDreamer.tsx"
Cohesion: 0.12
Nodes (27): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition, getDreamer() (+19 more)

### Community 73 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 74 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 75 - "ManagerSnapshot"
Cohesion: 0.08
Nodes (8): ProactiveManager, directories, FakeAgent, FakeManager, StoredManager, SecurityManager, ManagerSnapshot, ManagerSubmissionOptions

### Community 76 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (21): FakeVoiceEngineCall, VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), connect(), createManager() (+13 more)

### Community 77 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (32): AccentSetting, appearanceSettings, applySettingsChanges(), applySettingsImport(), isRecord(), isSettingsProfileKey(), NewSessionBackendSetting, newSessionBackendSettings (+24 more)

### Community 78 - "manager-agent.ts"
Cohesion: 0.13
Nodes (19): automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung, SCHEDULE_RETRY_DELAYS_MS, TURN_ACTIVITY (+11 more)

### Community 79 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (27): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+19 more)

### Community 80 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (30): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+22 more)

### Community 81 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (30): addActivity(), BackgroundTaskEventOptions, boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, errorValue(), MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH (+22 more)

### Community 82 - "oracle-voice-routes.ts"
Cohesion: 0.11
Nodes (28): OracleVoiceManager, limits(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode(), closeReason() (+20 more)

### Community 83 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 84 - "workspace-fixtures.ts"
Cohesion: 0.09
Nodes (26): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+18 more)

### Community 85 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (26): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+18 more)

### Community 86 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 87 - "UserInputReplyInput"
Cohesion: 0.17
Nodes (6): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, UserInputReplyInput, deliveryUncertaintyFromError()

### Community 88 - "delegated-transcription-service.ts"
Cohesion: 0.12
Nodes (13): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionMultipartOptions (+5 more)

### Community 89 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (23): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+15 more)

### Community 90 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (22): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, SettingsUpdateResult (+14 more)

### Community 91 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 92 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 93 - "VoiceClientControl"
Cohesion: 0.18
Nodes (11): VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient, RemoteVoiceClientOptions (+3 more)

### Community 94 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (20): isTerminalVisiblyIdle(), parseTerminalUpdateNotice(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), desktopInstallPane, directories, downloadedUpdateFooter (+12 more)

### Community 95 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 96 - "oracle-voice-config.ts"
Cohesion: 0.14
Nodes (22): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+14 more)

### Community 97 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 98 - "manager-routes.ts"
Cohesion: 0.11
Nodes (16): confirmationSchema, defaultsSchema, editSchema, effort, managerCadence, managerInputError(), ManagerRouteAgent, messageParams (+8 more)

### Community 99 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 100 - "SessionKnowledgeStore"
Cohesion: 0.16
Nodes (6): bindingKey(), RootCatalog, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateSchema, stateWithPaths()

### Community 101 - "manager-context.ts"
Cohesion: 0.15
Nodes (18): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+10 more)

### Community 102 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 103 - "capture-workbench-review.ts"
Cohesion: 0.11
Nodes (16): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, createWorkspaceFixtureState() (+8 more)

### Community 104 - ".toolHost"
Cohesion: 0.13
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 105 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 106 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 107 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 108 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 109 - "ManagerProactiveCoordinator"
Cohesion: 0.19
Nodes (5): batchMessageId(), isTerminal(), ManagerProactiveCoordinator, fixture(), managed()

### Community 110 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (13): phases, port, createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address (+5 more)

### Community 111 - "ManagerProactiveInbox"
Cohesion: 0.20
Nodes (6): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 112 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 113 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 114 - "TerminalSessionController"
Cohesion: 0.11
Nodes (3): TerminalSessionController, PendingPermission, PendingUserInput

### Community 115 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 116 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 117 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+2 more)

### Community 118 - "settings-profile-store.ts"
Cohesion: 0.18
Nodes (11): profileStore(), SettingsProfileState, SettingsProfileStore, directories, store(), isSettingsDeviceId(), isSettingsRevision(), SettingsProfileRecord (+3 more)

### Community 119 - "ManagerAssistant.test.tsx"
Cohesion: 0.10
Nodes (13): cancelManager(), removeQueuedManagerMessage(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator (+5 more)

### Community 120 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 121 - "SessionKnowledgeBinding"
Cohesion: 0.18
Nodes (14): SessionKnowledgeEvents, SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey() (+6 more)

### Community 122 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 123 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 124 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 125 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 126 - "refusal-metrics.ts"
Cohesion: 0.16
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+7 more)

### Community 127 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 128 - "backgroundTasksFromEvents"
Cohesion: 0.18
Nodes (18): backgroundTasksFromEvents(), eventString(), eventTask(), executionModeValue(), isLiveTaskStatus(), isOlderExecution(), isShellObserverTool(), isShellStopTool() (+10 more)

### Community 129 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 130 - "NewSessionDialog"
Cohesion: 0.17
Nodes (18): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+10 more)

### Community 131 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 132 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 133 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 134 - "normalizeKnowledgeRelativePath"
Cohesion: 0.24
Nodes (14): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), pathRecordSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+6 more)

### Community 135 - ".observe"
Cohesion: 0.21
Nodes (6): ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, nowIso()

### Community 136 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 137 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 138 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 139 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 140 - "submission-error.ts"
Cohesion: 0.23
Nodes (9): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, SubmissionReceipt, submissionReceiptFromError() (+1 more)

### Community 141 - "session-knowledge-store.ts"
Cohesion: 0.14
Nodes (14): bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema, PersistedBinding (+6 more)

### Community 142 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 143 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 144 - "VoiceEngineEvent"
Cohesion: 0.18
Nodes (7): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, VoiceEngineEvent

### Community 145 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 146 - "capture"
Cohesion: 0.21
Nodes (14): shortcutKeys(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode(), keyLabel(), readStoredShortcuts() (+6 more)

### Community 147 - "pending-echo.ts"
Cohesion: 0.24
Nodes (11): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, PendingEchoOwner, prunePendingEchoMap() (+3 more)

### Community 148 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 149 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 150 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 151 - "manager-proactive-inbox.test.ts"
Cohesion: 0.16
Nodes (9): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState() (+1 more)

### Community 152 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 153 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 154 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 155 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 156 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 157 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 158 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 159 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 160 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 161 - ".initialize"
Cohesion: 0.24
Nodes (4): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, open()

### Community 162 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 163 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 164 - ".askSession"
Cohesion: 0.35
Nodes (4): sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout()

### Community 165 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.24
Nodes (8): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult, searchWorkspace(), submitSearch()

### Community 166 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 167 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 168 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 169 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 170 - "file-upload-routes.ts"
Cohesion: 0.29
Nodes (6): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile()

### Community 171 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 172 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 173 - "transcribeAudio"
Cohesion: 0.29
Nodes (4): transcribeAudio(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 174 - "DreamerMorningPlan"
Cohesion: 0.38
Nodes (10): DreamerMorningPlan(), confirmCompletion(), confirmTaskCompletion(), dispatchTask(), disposition(), edit(), investigate(), move() (+2 more)

### Community 175 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 176 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 177 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 179 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 180 - "settings-profile.test.ts"
Cohesion: 0.25
Nodes (4): resolveAppearance(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 181 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 182 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 183 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 184 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 185 - "backgroundHandoff"
Cohesion: 0.38
Nodes (7): attachmentModeValue(), backgroundHandoff(), booleanValue(), rawTailText(), shellStopAcknowledged(), shellTaskMode(), toolTelemetryProperties()

### Community 186 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 187 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 188 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 190 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 191 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 192 - "api-origin.test.ts"
Cohesion: 0.40
Nodes (4): prefixes, session, trusted, untrusted

### Community 193 - "dreamer-app.test.ts"
Cohesion: 0.40
Nodes (3): directories, runtimes, trusted

### Community 194 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 195 - "appearance.ts"
Cohesion: 0.50
Nodes (3): Appearance, appearanceFrom(), appearanceStorageKey

## Knowledge Gaps
- **1151 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1146 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1939 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `SessionDetail`, `AgentService`, `ClaudeAgentService`, `ManagedSession`, `ManagerAgent`, `oracle-voice-integration.test.ts`, `PushNotificationService`, `oracle-task-store.ts`, `TranscriptionError`, `oracle-voice-worker.ts`, `dreamer-routes.ts`, `ManagerStore`, `SessionService`, `session-knowledge-routes.test.ts`, `tmux-errors.integration.test.ts`, `file-upload-routes.ts`, `DreamerService`, `pwa.ts`, `ProviderSessionService`, `SessionOrderStore`, `UserInputReplyInput`, `delegated-transcription-service.ts`, `cli-canary.ts`, `oracle-voice-config.ts`, `manager-routes.ts`, `SessionKnowledgeStore`, `transcription-service.ts`, `ManagerProactiveCoordinator`, `ManagerProactiveInbox`, `settings-profile-store.ts`, `refusal-metrics.ts`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `directory-browser.ts`, `queued-dispatch.test.ts`, `.askSession`, `contracts.ts`, `agent-service.ts`, `.readAfterWrites`, `TerminalSessionController`, `claude-agent-service.ts`, `UserInputReplyInput`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `ManagerAgent` connect `ManagerAgent` to `ManagerStore`, `manager-context.ts`, `FakeVoiceEngine`, `contracts.ts`, `.toolHost`, `manager-tools.ts`, `manager-agent.ts`, `app.ts`, `manager.ts`, `manager-agent.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1151 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.029127318238707477 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03887738670347366 - nodes in this community are weakly interconnected._
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
