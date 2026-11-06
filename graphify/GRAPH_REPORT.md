# Agentic Remote - Graphify code map

Snapshot: `daaeddb5510a5f8f67d1cf0fdd496a084cfe668db2a1900330ee83286d42695c`

Source checkout: `0fa970e135b6455b972474e9e9a8bf8cc8ea37c8`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 401 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 401 files · ~813,229 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6811 nodes · 18819 edges · 216 communities (176 shown, 24 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1014 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- contracts.ts
- SessionStore
- AgentService
- api.ts
- App.tsx
- SessionDetail
- agent-service.ts
- app.ts
- client.ts
- claude-agent-service.ts
- OracleVoiceCoordinator
- .readAfterWrites
- session-store-providers.test.ts
- agentic-remote-promotion-monitor
- ManagedSession
- terminal-session.ts
- oracle-voice-integration.test.ts
- session-knowledge-store.ts
- ManagerAgent
- TmuxTerminalSessionController
- agent-service.test.ts
- manager-tools.ts
- PushNotificationService
- oracle-voice-soak.ts
- transcription-service.ts
- CopilotSessionLike
- FakeVoiceEngine
- session-presentation.ts
- hub-routes.ts
- oracle-voice-benchmark.ts
- manager-structured-memory-validation.ts
- send-matrix.integration.test.ts
- oracle-voice-routes.test.ts
- FakeManager
- oracle-voice-worker.ts
- oracle-voice.ts
- active-sessions.ts
- markdown-navigation.ts
- oracle-voice-session.ts
- tmux-test-helpers.ts
- EnabledOracleVoiceConfig
- manager.ts
- ProviderSessionService
- agentic-remote
- UserInputReplyInput
- dreamer-store.ts
- session-knowledge-routes.test.ts
- bundle
- ResidentVoiceWorker
- oracle-voice-routes.ts
- oracle-voice-child.ts
- DreamerStore
- manager-agent.test.ts
- pwa.ts
- VoicePlayback
- SessionService
- client.test.ts
- shell.ts
- lib.rs
- workspace-fixtures.ts
- normalizeKnowledgeRelativePath
- agentic-remote-promotion-setup
- DreamerService
- ManagerAssistant.tsx
- agentic-remote-gate
- config.rs
- oracle-voice-config.ts
- manager-proactive-inbox.ts
- manager-structured-memory.ts
- FakeSessionService
- oracle-voice-child.test.ts
- oracle-voice-security.test.ts
- dependencies
- devDependencies
- session-patch-routes.test.ts
- dreamer-planner.ts
- ManagerStore
- manager-store.ts
- manager-agent.ts
- oracle-voice-coordinator.test.ts
- node-routes.ts
- cleanDialogLine
- remote-voice-client.ts
- SessionOrderStore
- dreamer-service.ts
- manager-structured-memory-search.ts
- src/settings-profile.ts
- session-patch-browser.ts
- background-task-adapter.ts
- cli-canary.ts
- shared/settings-profile.ts
- scripts
- SettingsProfileClient
- VoiceCapture
- ChatMessage
- react
- manager-routes.ts
- settings-profile-store.ts
- terminal-session.test.ts
- compilerOptions
- .toolHost
- manager-context.ts
- oracle-voice-segments.ts
- .observe
- oracle-voice-tickets.ts
- capture-workspace.ts
- full-gate.test.ts
- ManagerStructuredMemoryStore
- session-reply-durability.test.ts
- workspace-browser.ts
- PromptCards.tsx
- capture.ts
- terminal-form-deadline.test.ts
- compilerOptions
- backgroundTasksFromEvents
- ManagerProactiveInbox
- OnlineRecognizer
- ManagerAssistant.test.tsx
- OracleDreamer.tsx
- compilerOptions
- compilerOptions
- directory-browser.ts
- ManagerMemory
- knowledge-tree.ts
- dreamer-schedule.ts
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- NewSessionDialog
- dreamer-api.ts
- SoakManager
- background-task-stop.test.ts
- promotion-monitor.test.ts
- session-resource-routes.test.ts
- capture-workbench-review.ts
- scripts
- oracle-voice-assets.test.ts
- send-policy.test.ts
- fake-vad.ts
- desktop.json
- eventString
- manager-proactive-inbox.test.ts
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- session-clear-transcript.test.ts
- Pcm16Resampler
- session-response-order.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- DeferredSession
- background-task-tracker.ts
- .initialize
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- VoiceCaptureOptions
- screenshot-stability.test.ts
- KnowledgePosition
- manager-structured-memory-performance.test.ts
- promotion-setup-execution.test.ts
- SessionAdmissions
- capture.test.ts
- VoiceVadOptions
- settings-profile.test.ts
- vite.config.ts
- package.json
- release-publication.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- .transport
- composer-layout.test.ts
- recovery-context.ts
- usePanelWidth
- promotion-setup.test.ts
- removeComputer
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
9. `ManagerAgent` - 90 edges
10. `ComputerManager` - 87 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `FakeVoiceState` --references--> `ManagerMessage`  [EXTRACTED]
  e2e/fixtures/fake-voice.ts → shared/manager.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (216 total, 24 thin omitted)

### Community 0 - "App"
Cohesion: 0.03
Nodes (162): clearConversation(), listKnowledgeEntries(), readKnowledgeFile(), recoverConversation(), removeQueuedPrompt(), reorderQueuedPrompts(), restartSession(), saveSessionVisibility() (+154 more)

### Community 1 - "contracts.ts"
Cohesion: 0.02
Nodes (74): AgentServiceEvents, CreationRuntime, BackgroundTaskUpdate, ClaudeAgentServiceEvents, RemoteResync, RemoteSessionRead, DirectoryScope, efforts (+66 more)

### Community 2 - "SessionStore"
Cohesion: 0.03
Nodes (75): fixture(), fixture(), connect(), createStore(), enqueue(), fixture(), recoveryFixture(), preflight() (+67 more)

### Community 3 - "AgentService"
Cohesion: 0.04
Nodes (11): agentMode(), AgentService, isRuntimeReasoningEffort(), permissionTitle(), restart(), removeCopilotSessionFiles(), RuntimeConfigurationError, suspendedRuntimeConflict() (+3 more)

### Community 4 - "api.ts"
Cohesion: 0.03
Nodes (118): ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, addKnowledgeRoot(), askSession(), bootstrapSessionOrder() (+110 more)

### Community 5 - "App.tsx"
Cohesion: 0.02
Nodes (111): AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+103 more)

### Community 6 - "SessionDetail"
Cohesion: 0.04
Nodes (21): ClaudeAgentService, isMissingClaudeSessionError(), answer(), claudeRequest(), copilotRequest(), claudeFixture(), ClaudeMcpRead, copilotFixture() (+13 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.04
Nodes (78): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+70 more)

### Community 8 - "app.ts"
Cohesion: 0.03
Nodes (64): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+56 more)

### Community 9 - "client.ts"
Cohesion: 0.05
Nodes (37): ManagerClientDefaults, ORACLE_VOICE_CONNECTION_TIMEOUT_MS, VoiceCapabilities, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason() (+29 more)

### Community 10 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (67): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+59 more)

### Community 11 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (23): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+15 more)

### Community 12 - ".readAfterWrites"
Cohesion: 0.06
Nodes (10): commandShortcut(), isTerminalNotReadyRefusal(), stripAnsi(), terminalAnswerRefused(), preparePrompt(), queueConflict(), isRetainedRefusal(), QueuedPromptReservation (+2 more)

### Community 13 - "session-store-providers.test.ts"
Cohesion: 0.03
Nodes (59): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), deferred() (+51 more)

### Community 14 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 15 - "ManagedSession"
Cohesion: 0.09
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, ManagerEventSource, registerHubRoutes(), SessionMuteCarrier (+5 more)

### Community 16 - "terminal-session.ts"
Cohesion: 0.05
Nodes (70): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerHoldsOtherText() (+62 more)

### Community 17 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (36): QueuedAudio, apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback (+28 more)

### Community 18 - "session-knowledge-store.ts"
Cohesion: 0.06
Nodes (41): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+33 more)

### Community 19 - "ManagerAgent"
Cohesion: 0.09
Nodes (11): delay(), errorMessage(), isPending(), isQueued(), ManagerAgent, sameRuntime(), TurnError, withTimeout() (+3 more)

### Community 20 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (28): startAgentAfterClear(), captureBeforeDeadline(), capturePane(), clearAutomaticStartupPrompts(), copilotCommand(), endProbeSession(), execFileAsync, hasLiveTerminalComposer() (+20 more)

### Community 21 - "agent-service.test.ts"
Cohesion: 0.03
Nodes (41): CopilotClientLike, foregroundTurnOpen(), holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+33 more)

### Community 22 - "manager-tools.ts"
Cohesion: 0.06
Nodes (36): TurnContextInput, APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession() (+28 more)

### Community 23 - "PushNotificationService"
Cohesion: 0.07
Nodes (29): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+21 more)

### Community 24 - "oracle-voice-soak.ts"
Cohesion: 0.06
Nodes (33): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+25 more)

### Community 25 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+28 more)

### Community 26 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (30): CopilotSessionLike, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), QueuedDelivery, QueuedDispatches (+22 more)

### Community 27 - "FakeVoiceEngine"
Cohesion: 0.05
Nodes (29): apps, directories, voiceBackend(), FakeVoiceEngine, FakeVoiceEngineCall, FakeVoiceEngineFactory, identityKey(), isCancelled() (+21 more)

### Community 28 - "session-presentation.ts"
Cohesion: 0.06
Nodes (52): saveSessionOrderLane(), handleDragEnd(), stepSession(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView (+44 more)

### Community 29 - "hub-routes.ts"
Cohesion: 0.05
Nodes (49): WorkspaceFixture, ComputerManagerEvents, addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+41 more)

### Community 30 - "oracle-voice-benchmark.ts"
Cohesion: 0.06
Nodes (43): execFileAsync, RealVoiceState, benchmarkFixture(), benchmarkGroup(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond() (+35 more)

### Community 31 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 32 - "send-matrix.integration.test.ts"
Cohesion: 0.05
Nodes (47): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+39 more)

### Community 33 - "oracle-voice-routes.test.ts"
Cohesion: 0.05
Nodes (22): ActiveBackendSession, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, ObservedLocalVoiceBackend, openApps, openSockets (+14 more)

### Community 34 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 35 - "oracle-voice-worker.ts"
Cohesion: 0.09
Nodes (23): VoiceGenerationIdentity, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent() (+15 more)

### Community 36 - "oracle-voice.ts"
Cohesion: 0.08
Nodes (41): VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities, closeServers, exactArrayBuffer(), sockets (+33 more)

### Community 37 - "active-sessions.ts"
Cohesion: 0.08
Nodes (45): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+37 more)

### Community 38 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (40): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+32 more)

### Community 39 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (16): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), QueuedOutput (+8 more)

### Community 40 - "tmux-test-helpers.ts"
Cohesion: 0.10
Nodes (37): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+29 more)

### Community 41 - "EnabledOracleVoiceConfig"
Cohesion: 0.06
Nodes (17): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+9 more)

### Community 42 - "manager.ts"
Cohesion: 0.07
Nodes (36): ManagerState, ManagerToolActivity, trusted, isManagerEvent(), MANAGER_SNAPSHOT_MESSAGES, ManagerCheckCadenceMinutes, managerCheckCadences, ManagerConfirmation (+28 more)

### Community 44 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 45 - "UserInputReplyInput"
Cohesion: 0.08
Nodes (17): isUncertainDelivery(), persistedFormAnswer(), directories, disk, fixture(), gate(), gates, initialize() (+9 more)

### Community 46 - "dreamer-store.ts"
Cohesion: 0.07
Nodes (38): DreamerHistoryEntry, assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES (+30 more)

### Community 47 - "session-knowledge-routes.test.ts"
Cohesion: 0.08
Nodes (21): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, Lineage (+13 more)

### Community 48 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 49 - "ResidentVoiceWorker"
Cohesion: 0.12
Nodes (8): combinedTranscript(), matchesCancelled(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, waitForActivePiperExit(), waitForPiperExit(), VoiceSynthesisRequest

### Community 50 - "oracle-voice-routes.ts"
Cohesion: 0.09
Nodes (35): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+27 more)

### Community 51 - "oracle-voice-child.ts"
Cohesion: 0.07
Nodes (35): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), float32ToPcm16() (+27 more)

### Community 52 - "DreamerStore"
Cohesion: 0.13
Nodes (11): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, emptyState(), isMissing() (+3 more)

### Community 53 - "manager-agent.test.ts"
Cohesion: 0.06
Nodes (14): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, Behavior, computers, fail(), FakeClient, FakeSdk (+6 more)

### Community 54 - "pwa.ts"
Cohesion: 0.09
Nodes (37): AppVersion, parseAppVersion(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+29 more)

### Community 55 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 56 - "SessionService"
Cohesion: 0.09
Nodes (3): nodeVoiceCapabilities(), registerNodeRoutes(), SessionService

### Community 57 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 58 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 59 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 60 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (30): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+22 more)

### Community 61 - "normalizeKnowledgeRelativePath"
Cohesion: 0.10
Nodes (30): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+22 more)

### Community 62 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 63 - "DreamerService"
Cohesion: 0.14
Nodes (13): parse(), planSchema, registerDreamerRoutes(), settingsSchema, apps, directories, setup(), DreamerService (+5 more)

### Community 64 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (30): editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), phoneEnterCreatesNewline(), applyEvent(), canTakeFocus(), conversationStateLabel() (+22 more)

### Community 65 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 66 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 67 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (26): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+18 more)

### Community 68 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (36): assertExactKeys(), DISPOSITIONS, EVENT_KINDS, hasExactKeys(), isAlreadyExists(), isDisposition(), isEventKind(), isId() (+28 more)

### Community 69 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (31): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+23 more)

### Community 70 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 71 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (14): createVoiceWorker(), PiperProcess, childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream (+6 more)

### Community 72 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (21): SocketMessage, apps, config, configFixture(), connect(), createManager(), Inbox, issueTicket() (+13 more)

### Community 73 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 74 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 75 - "session-patch-routes.test.ts"
Cohesion: 0.09
Nodes (15): fixture(), managers, releases, remote, session(), ComputerRegistry, directories, remoteSnapshotFixture() (+7 more)

### Community 76 - "dreamer-planner.ts"
Cohesion: 0.11
Nodes (29): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+21 more)

### Community 77 - "ManagerStore"
Cohesion: 0.11
Nodes (7): capturePrompt(), openStore(), ManagerStore, open(), createManager(), StoredManager, ManagerSubmissionOptions

### Community 78 - "manager-store.ts"
Cohesion: 0.11
Nodes (18): JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), PersistedCursor, emptyState(), JournalDraft, JournalEntry (+10 more)

### Community 79 - "manager-agent.ts"
Cohesion: 0.12
Nodes (19): checkContent(), discover(), isNotFound(), ManagerAgentOptions, ManagerSdkSessionConfig, Rung, SCHEDULE_RETRY_DELAYS_MS, TURN_ACTIVITY (+11 more)

### Community 80 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.09
Nodes (13): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+5 more)

### Community 81 - "node-routes.ts"
Cohesion: 0.07
Nodes (30): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema (+22 more)

### Community 82 - "cleanDialogLine"
Cohesion: 0.14
Nodes (26): activeBottomFrame(), cleanDialogLine(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), FormReplyDeadlineError, hasClippedTerminalFormFooter(), hasClippedTerminalFormTabs() (+18 more)

### Community 83 - "remote-voice-client.ts"
Cohesion: 0.17
Nodes (12): RegistryState, VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+4 more)

### Community 84 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 85 - "dreamer-service.ts"
Cohesion: 0.11
Nodes (19): DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), projectDreamerRegistry(), projectRegistryEntry(), digest(), DreamerPlannerExecutionInput (+11 more)

### Community 86 - "manager-structured-memory-search.ts"
Cohesion: 0.12
Nodes (24): DreamerMemoryMetadataRecord, authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord() (+16 more)

### Community 87 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (22): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, SettingsUpdateResult (+14 more)

### Community 88 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 89 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (24): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, CopilotTasksApi, isBackgroundTaskInfo(), isBackgroundTaskProgress() (+16 more)

### Community 90 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 91 - "shared/settings-profile.ts"
Cohesion: 0.11
Nodes (26): AccentSetting, appearanceSettings, isRecord(), isSettingsRevision(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting, NewSessionRuntimesSetting (+18 more)

### Community 92 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 93 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 94 - "VoiceCapture"
Cohesion: 0.21
Nodes (3): captureFailure(), harness(), VoiceCapture

### Community 95 - "ChatMessage"
Cohesion: 0.14
Nodes (12): Connection, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset, StoredSession, ChatMessage (+4 more)

### Community 96 - "react"
Cohesion: 0.11
Nodes (12): react, transcribeAudio(), MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram(), drawing, MermaidDiagram() (+4 more)

### Community 97 - "manager-routes.ts"
Cohesion: 0.11
Nodes (16): confirmationSchema, defaultsSchema, editSchema, effort, managerCadence, managerInputError(), ManagerRouteAgent, messageParams (+8 more)

### Community 98 - "settings-profile-store.ts"
Cohesion: 0.15
Nodes (14): SettingsProfileState, SettingsProfileStore, directories, store(), applySettingsChanges(), applySettingsImport(), isSettingsDeviceId(), isSettingsProfileKey() (+6 more)

### Community 99 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (20): parseTerminalUpdateNotice(), terminalFormCommitKeys(), bracketedTabPane, deliveryFixture(), desktopInstallPane, directories, downloadedUpdateFooter, execFileAsync (+12 more)

### Community 100 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 101 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, PermissionReplyInput, RenameSessionInput, SendMessageInput

### Community 102 - "manager-context.ts"
Cohesion: 0.15
Nodes (19): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+11 more)

### Community 103 - "oracle-voice-segments.ts"
Cohesion: 0.14
Nodes (22): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+14 more)

### Community 104 - ".observe"
Cohesion: 0.16
Nodes (10): canonicalHash(), cloneState(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError (+2 more)

### Community 105 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 106 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 107 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 108 - "ManagerStructuredMemoryStore"
Cohesion: 0.28
Nodes (5): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState

### Community 109 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 110 - "workspace-browser.ts"
Cohesion: 0.19
Nodes (17): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+9 more)

### Community 111 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 112 - "capture.ts"
Cohesion: 0.13
Nodes (15): BufferedFrame, defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, validateIdentity(), VoiceCaptureError, VoiceCaptureErrorCode (+7 more)

### Community 113 - "terminal-form-deadline.test.ts"
Cohesion: 0.12
Nodes (14): TerminalFormContinuation, actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+6 more)

### Community 114 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 115 - "backgroundTasksFromEvents"
Cohesion: 0.26
Nodes (20): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventTask(), executionModeValue(), normalizeBackgroundTask(), notificationKind() (+12 more)

### Community 116 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 117 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 118 - "ManagerAssistant.test.tsx"
Cohesion: 0.11
Nodes (12): cancelManager(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+4 more)

### Community 119 - "OracleDreamer.tsx"
Cohesion: 0.19
Nodes (17): authoritativeRefresh, AuthoritativeRefreshRequest, coordinatedAuthoritativeRefresh, dispatchAuthoritativeRefresh(), DreamerMorningPlan(), confirmCompletion(), disposition(), edit() (+9 more)

### Community 120 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 121 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 122 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 123 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 124 - "knowledge-tree.ts"
Cohesion: 0.19
Nodes (16): knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs(), KnowledgeFolders (+8 more)

### Community 125 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 126 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 127 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 128 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 129 - "NewSessionDialog"
Cohesion: 0.18
Nodes (17): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+9 more)

### Community 130 - "dreamer-api.ts"
Cohesion: 0.20
Nodes (11): DreamerApiError, DreamerSettingsEdit, getDreamer(), request(), saveDreamerSettings(), snapshot, updateDreamerPlan(), completionCandidate (+3 more)

### Community 132 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 133 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 134 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 135 - "capture-workbench-review.ts"
Cohesion: 0.14
Nodes (11): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, fixtureSessions (+3 more)

### Community 136 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 137 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 138 - "send-policy.test.ts"
Cohesion: 0.16
Nodes (13): message(), sendLikeTheApp(), SessionExecutionMode, terminalSendOptions(), TerminalSendPolicyInput, TerminalSendRequestOptions, booleans, combinations (+5 more)

### Community 139 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 140 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 141 - "eventString"
Cohesion: 0.20
Nodes (14): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), rawTailText(), shellIdFromFooter() (+6 more)

### Community 142 - "manager-proactive-inbox.test.ts"
Cohesion: 0.16
Nodes (9): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState() (+1 more)

### Community 143 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 144 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 145 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 146 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 147 - "session-clear-transcript.test.ts"
Cohesion: 0.17
Nodes (8): Admission, ExclusiveAdmission, PendingQueueAdmission, disk, fixtures, gate(), holdTurnWrite(), releases

### Community 148 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 149 - "session-response-order.ts"
Cohesion: 0.29
Nodes (10): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+2 more)

### Community 150 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 151 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 153 - "background-task-tracker.ts"
Cohesion: 0.35
Nodes (5): backgroundTaskSnapshot(), BackgroundTaskTracker, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 154 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 155 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 156 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 157 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 158 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 159 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 161 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 162 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 163 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.31
Nodes (6): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemorySearchResult, submitSearch()

### Community 164 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 166 - "capture.test.ts"
Cohesion: 0.22
Nodes (3): CaptureControl, VoiceCaptureDependencies, VoiceVad

### Community 168 - "settings-profile.test.ts"
Cohesion: 0.25
Nodes (4): resolveAppearance(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 169 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 170 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 171 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 172 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

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

### Community 178 - "recovery-context.ts"
Cohesion: 0.47
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 179 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 180 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 181 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 182 - "appearance.ts"
Cohesion: 0.50
Nodes (3): Appearance, appearanceFrom(), appearanceStorageKey

## Knowledge Gaps
- **1126 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1121 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1903 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `contracts.ts`, `SessionStore`, `SessionDetail`, `agent-service.ts`, `directory-browser.ts`, `claude-agent-service.ts`, `.readAfterWrites`, `UserInputReplyInput`, `background-task-adapter.ts`, `CopilotSessionLike`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `contracts.ts`, `AgentService`, `SessionDetail`, `agent-service.ts`, `claude-agent-service.ts`, `.readAfterWrites`, `UserInputReplyInput`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ManagerAgent` connect `ManagerAgent` to `contracts.ts`, `.toolHost`, `manager-context.ts`, `ManagerStore`, `manager-store.ts`, `manager-agent.ts`, `manager-agent.test.ts`, `manager-structured-memory-search.ts`, `FakeVoiceEngine`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.029647762817897456 - nodes in this community are weakly interconnected._
- **Should `contracts.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.023391812865497075 - nodes in this community are weakly interconnected._
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
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-17-oracle-proactive-lifecycle-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
- `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`
- `docs/superpowers/specs/2026-11-04-oracle-periodic-checks-design.md`
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
