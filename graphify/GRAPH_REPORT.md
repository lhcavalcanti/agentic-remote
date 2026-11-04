# Agentic Remote - Graphify code map

Snapshot: `d519598dee952216368dedf85a6f47cb94be3f3fb9eac1a1596771343990bef5`

Source checkout: `5e9188ab95c914a8c34329ab9b45c517320432df`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 399 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 399 files · ~806,291 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6790 nodes · 18719 edges · 226 communities (185 shown, 25 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1009 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- App.tsx
- api.ts
- SessionDetail
- SessionStore
- agent-service.ts
- agent-service.test.ts
- contracts.ts
- terminal-session.ts
- agentic-remote-promotion-monitor
- ManagerAgent
- ManagedSession
- VoiceClientControl
- node-routes.ts
- session-resources.ts
- oracle-voice-soak.ts
- oracle-voice-integration.test.ts
- PushNotificationService
- multi-node.test.ts
- manager-tools.ts
- client.ts
- ManagerStore
- RemoteNodeClient
- workspace-fixtures.ts
- session-presentation.ts
- manager-agent.ts
- oracle-voice-worker.ts
- manager-structured-memory-validation.ts
- FakeManager
- queueConflict
- markdown-navigation.ts
- tmux-test-helpers.ts
- session-reply-durability.test.ts
- send-matrix.integration.test.ts
- FakeSessionService
- oracle-voice.ts
- oracle-voice-benchmark.ts
- TmuxTerminalSessionController
- agentic-remote
- hub-routes.ts
- session-store.ts
- pwa.ts
- bundle
- SessionService
- ProviderSessionService
- FakeVoiceEngine
- ResidentVoiceWorker
- app.ts
- OracleDreamer.tsx
- DreamerService
- oracle-voice-child.ts
- VoicePlayback
- real-voice.ts
- oracle-voice-routes.ts
- client.test.ts
- shell.ts
- lib.rs
- dreamer-store.ts
- DreamerStore
- manager-proactive-inbox.ts
- VoiceAudioFrame
- ManagerAssistant.tsx
- agentic-remote-promotion-setup
- terminal-session.test.ts
- agentic-remote-gate
- config.rs
- oracle-voice-engine.ts
- dependencies
- devDependencies
- active-sessions.ts
- oracle-voice-child.test.ts
- knowledge-tree.ts
- oracle-voice-security.test.ts
- EngineVoiceBackendSession
- SessionKnowledgeStore
- oracle-voice-session.ts
- session-resource-clear.test.ts
- manager-structured-memory.ts
- manager-routes.ts
- OracleVoiceCoordinator
- oracle-voice-segments.ts
- remote-voice-client.ts
- .sendInternal
- dreamer-service.ts
- shared/settings-profile.ts
- SessionOrderStore
- background-task-adapter.ts
- use-oracle-conversation.test.tsx
- cli-canary.ts
- dreamer-planner.ts
- OracleSettings.tsx
- src/settings-profile.ts
- scripts
- session-patch-browser.ts
- directory-browser.ts
- backgroundTasksFromEvents
- KnowledgeStore
- manager-structured-memory-search.ts
- ChatMessage
- settings-profile-store.ts
- ManagerAssistant.test.tsx
- compilerOptions
- oracle-voice-config.ts
- .toolHost
- ManagerStructuredMemoryStore
- transcription-service.ts
- SettingsProfileClient
- oracle-voice-coordinator.ts
- capture-workspace.ts
- normalizeKnowledgeRelativePath
- manager-context.ts
- oracle-voice-tickets.ts
- refusal-metrics.ts
- session-knowledge-store.ts
- delegated-transcription-service.test.ts
- full-gate.test.ts
- startup-phases.test.ts
- PromptCards.tsx
- compilerOptions
- .observe
- ManagerProactiveInbox
- session-store-providers.test.ts
- OnlineRecognizer
- compilerOptions
- compilerOptions
- ManagerMemory
- workspace-browser.ts
- react
- HubEvent
- TranscriptionError
- BoundedQueue
- ReaderWorkspace
- server/session-patches.ts
- session-latency-benchmark.ts
- dreamer-schedule.ts
- use-session-knowledge-root.ts
- terminal-form-deadline.test.ts
- SoakManager
- background-task-stop.test.ts
- .confirmSpeech
- promotion-monitor.test.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- scripts
- oracle-voice-assets.test.ts
- VoiceTurnState
- registerSessionKnowledgeRoutes
- NewSessionDialog
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- BackgroundTasksDialog.tsx
- pending-echo.ts
- .oxlintrc.json
- node:fs/promises
- settings-local.json
- Pcm16Resampler
- background-task-tracker.ts
- manager-proactive-inbox.test.ts
- .initialize
- session-response-order.ts
- html-preview.ts
- DeferredSession
- settings-profile.test.ts
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- file-upload-routes.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- .transport
- screenshot-stability.test.ts
- boundedText
- promotion-setup-execution.test.ts
- SessionAdmissions
- tmux-errors.test.ts
- vite.config.ts
- package.json
- manager-structured-memory-performance.test.ts
- recovery-context.ts
- release-publication.test.ts
- render-workspace-gifs.ts
- dreamer-store.test.ts
- history-projection.test.ts
- SessionStatus
- settings.ts
- composer-layout.test.ts
- .receive
- usePanelWidth
- MarkdownCodeBlock.tsx
- dreamer-app.test.ts
- promotion-setup.test.ts
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
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
1. `SessionDetail` - 307 edges
2. `App()` - 278 edges
3. `AgentService` - 276 edges
4. `SessionStore` - 189 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 103 edges
7. `registerHubRoutes()` - 93 edges
8. `buildApp()` - 92 edges
9. `ManagerAgent` - 88 edges
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
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (226 total, 25 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (13): agentMode(), AgentService, commandShortcut(), isTerminalNotReadyRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, stripAnsi(), suspendedRuntimeConflict() (+5 more)

### Community 1 - "App"
Cohesion: 0.03
Nodes (149): isManagerEvent(), alertNotification(), terminalSendOptions(), deleteKnowledgeRoot(), moveSessionToTmux(), replyPermission(), replyUserInput(), restartSession() (+141 more)

### Community 2 - "App.tsx"
Cohesion: 0.02
Nodes (123): addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+115 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (116): SettingsChange, SettingsProfileKey, SettingsProfileValues, SettingsUpdateResult, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError (+108 more)

### Community 4 - "SessionDetail"
Cohesion: 0.04
Nodes (26): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), PendingClaudeReply, toolResultText(), observe(), claudeFixture(), ClaudeMcpRead (+18 more)

### Community 5 - "SessionStore"
Cohesion: 0.04
Nodes (46): fixture(), restart(), fixture(), connect(), createStore(), deferred(), disk, enqueue() (+38 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.04
Nodes (82): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+74 more)

### Community 7 - "agent-service.test.ts"
Cohesion: 0.03
Nodes (55): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+47 more)

### Community 8 - "contracts.ts"
Cohesion: 0.05
Nodes (66): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, RemoteSessionListing (+58 more)

### Community 9 - "terminal-session.ts"
Cohesion: 0.05
Nodes (75): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerRowText() (+67 more)

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 11 - "ManagerAgent"
Cohesion: 0.08
Nodes (13): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+5 more)

### Community 12 - "ManagedSession"
Cohesion: 0.10
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), FakeManager, createHub() (+5 more)

### Community 13 - "VoiceClientControl"
Cohesion: 0.06
Nodes (24): VoiceClientControl, BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), CaptureControl, harness() (+16 more)

### Community 14 - "node-routes.ts"
Cohesion: 0.03
Nodes (49): ActiveBackendSession, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason() (+41 more)

### Community 15 - "session-resources.ts"
Cohesion: 0.08
Nodes (50): ActiveClaudeQuery, releases, session, snapshot, CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport() (+42 more)

### Community 16 - "oracle-voice-soak.ts"
Cohesion: 0.06
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 17 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (33): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+25 more)

### Community 18 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 19 - "multi-node.test.ts"
Cohesion: 0.04
Nodes (33): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+25 more)

### Community 20 - "manager-tools.ts"
Cohesion: 0.06
Nodes (35): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), steer() (+27 more)

### Community 21 - "client.ts"
Cohesion: 0.09
Nodes (23): ORACLE_VOICE_CONNECTION_TIMEOUT_MS, ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, VoiceServerControl, captureClientError(), clientError(), closeError(), closeReason(), isCapabilities() (+15 more)

### Community 22 - "ManagerStore"
Cohesion: 0.06
Nodes (22): openStore(), TurnContextInput, JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), emptyState(), JournalDraft (+14 more)

### Community 23 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (14): RemoteResync, RemoteSessionRead, RemoteNodeClient, client(), servers, session, BackgroundTaskSnapshot, NodeInfo (+6 more)

### Community 24 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (45): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+37 more)

### Community 25 - "session-presentation.ts"
Cohesion: 0.07
Nodes (50): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+42 more)

### Community 26 - "manager-agent.ts"
Cohesion: 0.06
Nodes (34): isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Rung (+26 more)

### Community 27 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (25): benchmarkGroup(), VoiceEndUtterance, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys() (+17 more)

### Community 28 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 29 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 30 - "queueConflict"
Cohesion: 0.06
Nodes (30): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), queueConflict() (+22 more)

### Community 31 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (44): executeCommand(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+36 more)

### Community 32 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (44): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+36 more)

### Community 33 - "session-reply-durability.test.ts"
Cohesion: 0.07
Nodes (27): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), answer(), assistantFixture(), claudeFixture(), claudeQuestions() (+19 more)

### Community 34 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (46): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+38 more)

### Community 35 - "FakeSessionService"
Cohesion: 0.06
Nodes (13): FakeSessionService, AgentMode, AgentProvider, SessionExecutionMode, TerminalSendPolicyInput, TerminalSendRequestOptions, booleans, combinations (+5 more)

### Community 36 - "oracle-voice.ts"
Cohesion: 0.08
Nodes (41): VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities, closeServers, exactArrayBuffer(), sockets (+33 more)

### Community 37 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (41): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 38 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (13): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+5 more)

### Community 39 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 40 - "hub-routes.ts"
Cohesion: 0.05
Nodes (40): PRESENCE_TTL_MS, addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+32 more)

### Community 41 - "session-store.ts"
Cohesion: 0.06
Nodes (34): resolveDataDirectory(), idleDaysSchema, mergeSessionRetention(), sessionRetentionPatchSchema, sessionRetentionSchema, activityDuration(), activityResultPreview(), archivedMessage() (+26 more)

### Community 42 - "pwa.ts"
Cohesion: 0.09
Nodes (40): AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+32 more)

### Community 43 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 44 - "SessionService"
Cohesion: 0.09
Nodes (3): nodeVoiceCapabilities(), registerNodeRoutes(), SessionService

### Community 46 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (17): voiceBackend(), FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine (+9 more)

### Community 47 - "ResidentVoiceWorker"
Cohesion: 0.12
Nodes (10): combinedTranscript(), float32ToPcm16(), matchesCancelled(), pcm16ToFloat32(), readBoundedText(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream (+2 more)

### Community 48 - "app.ts"
Cohesion: 0.08
Nodes (24): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+16 more)

### Community 49 - "OracleDreamer.tsx"
Cohesion: 0.10
Nodes (33): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, getDreamer() (+25 more)

### Community 50 - "DreamerService"
Cohesion: 0.13
Nodes (15): parse(), planSchema, registerDreamerRoutes(), settingsSchema, apps, directories, setup(), DreamerService (+7 more)

### Community 51 - "oracle-voice-child.ts"
Cohesion: 0.07
Nodes (32): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), normalizeSherpaModule() (+24 more)

### Community 52 - "VoicePlayback"
Cohesion: 0.10
Nodes (11): pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio(), validateGeneration() (+3 more)

### Community 53 - "real-voice.ts"
Cohesion: 0.08
Nodes (14): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+6 more)

### Community 54 - "oracle-voice-routes.ts"
Cohesion: 0.10
Nodes (32): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode() (+24 more)

### Community 55 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 56 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 57 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 58 - "dreamer-store.ts"
Cohesion: 0.09
Nodes (33): DreamerHistoryEntry, validateDreamerTimeZone(), assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+25 more)

### Community 59 - "DreamerStore"
Cohesion: 0.14
Nodes (10): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, isMissing(), publicPlan() (+2 more)

### Community 60 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (38): assertExactKeys(), canonicalHash(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isDisposition(), isEventKind() (+30 more)

### Community 61 - "VoiceAudioFrame"
Cohesion: 0.07
Nodes (16): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+8 more)

### Community 62 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (31): editQueuedManagerMessage(), getManager(), removeQueuedManagerMessage(), resetManager(), retryManagerMessage(), phoneEnterCreatesNewline(), applyEvent(), canTakeFocus() (+23 more)

### Community 63 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 64 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (32): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+24 more)

### Community 65 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 66 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 67 - "oracle-voice-engine.ts"
Cohesion: 0.09
Nodes (13): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, EnabledOracleVoiceConfig, FakeVoiceEngineFactory (+5 more)

### Community 68 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 69 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 70 - "active-sessions.ts"
Cohesion: 0.12
Nodes (32): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+24 more)

### Community 71 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 72 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+24 more)

### Community 73 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (19): FakeVoiceEngineCall, apps, config, configFixture(), connect(), createManager(), Inbox, issueTicket() (+11 more)

### Community 74 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 75 - "SessionKnowledgeStore"
Cohesion: 0.12
Nodes (11): WorkspaceFixtureState, SessionKnowledgeConflictError, SessionKnowledgeEvents, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures (+3 more)

### Community 76 - "oracle-voice-session.ts"
Cohesion: 0.09
Nodes (24): apps, directories, playbackSequence(), acquisitionCancelled(), ActiveUtterance, capabilityFromConfig(), createVoiceBackendSession(), DEFAULT_VOICE_BACKEND_LIMITS (+16 more)

### Community 77 - "session-resource-clear.test.ts"
Cohesion: 0.08
Nodes (28): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), disk (+20 more)

### Community 78 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (27): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+19 more)

### Community 79 - "manager-routes.ts"
Cohesion: 0.09
Nodes (17): confirmationSchema, defaultsSchema, editSchema, effort, managerCadence, managerInputError(), ManagerRouteAgent, messageParams (+9 more)

### Community 80 - "OracleVoiceCoordinator"
Cohesion: 0.15
Nodes (3): OracleVoiceCoordinator, terminalStartupCloseCode(), ActiveConversation

### Community 81 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 82 - "remote-voice-client.ts"
Cohesion: 0.16
Nodes (14): VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+6 more)

### Community 83 - ".sendInternal"
Cohesion: 0.18
Nodes (26): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+18 more)

### Community 84 - "dreamer-service.ts"
Cohesion: 0.09
Nodes (21): DREAMER_MAX_ITEMS, DreamerMemoryMetadata, DreamerMemoryMetadataRecord, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), projectDreamerRegistry(), projectRegistryEntry() (+13 more)

### Community 85 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (29): AccentSetting, appearanceSettings, applySettingsImport(), isRecord(), isSettingsProfileKey(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting (+21 more)

### Community 86 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 87 - "background-task-adapter.ts"
Cohesion: 0.09
Nodes (26): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, CopilotTasksApi, isBackgroundTaskInfo(), isBackgroundTaskProgress() (+18 more)

### Community 88 - "use-oracle-conversation.test.tsx"
Cohesion: 0.12
Nodes (13): getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability, defaults (+5 more)

### Community 89 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 90 - "dreamer-planner.ts"
Cohesion: 0.16
Nodes (23): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+15 more)

### Community 91 - "OracleSettings.tsx"
Cohesion: 0.12
Nodes (20): ManagerState, ManagerCheckCadenceMinutes, ManagerProactiveSettings, ManagerProactiveSnapshot, updateManagerSettings(), checkCadences, editableProactive(), effortFrom() (+12 more)

### Community 92 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (22): AppearanceSetting, isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, statuslineItems, Appearance, appearanceFrom() (+14 more)

### Community 93 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 94 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (24): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+16 more)

### Community 95 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 96 - "backgroundTasksFromEvents"
Cohesion: 0.18
Nodes (26): backgroundHandoff(), backgroundTasksFromEvents(), booleanValue(), errorValue(), eventString(), eventTask(), executionModeValue(), lastForegroundCompletionAt() (+18 more)

### Community 97 - "KnowledgeStore"
Cohesion: 0.17
Nodes (6): KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 98 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 99 - "ChatMessage"
Cohesion: 0.14
Nodes (12): Connection, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset, StoredSession, ChatMessage (+4 more)

### Community 100 - "settings-profile-store.ts"
Cohesion: 0.14
Nodes (14): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), profileStore(), updateSchema, SettingsProfileState, SettingsProfileStore (+6 more)

### Community 101 - "ManagerAssistant.test.tsx"
Cohesion: 0.08
Nodes (13): cancelManager(), resolveManagerConfirmation(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+5 more)

### Community 102 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 103 - "oracle-voice-config.ts"
Cohesion: 0.15
Nodes (20): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+12 more)

### Community 104 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 105 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (8): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMetadataSnapshot, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 106 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 107 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 108 - "oracle-voice-coordinator.ts"
Cohesion: 0.11
Nodes (14): ManagerEventSource, ManagerEventSource, AudioCompletion, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnection (+6 more)

### Community 109 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 110 - "normalizeKnowledgeRelativePath"
Cohesion: 0.17
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), pathRecordSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+10 more)

### Community 111 - "manager-context.ts"
Cohesion: 0.17
Nodes (18): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+10 more)

### Community 112 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 113 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 114 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema (+11 more)

### Community 115 - "delegated-transcription-service.test.ts"
Cohesion: 0.12
Nodes (8): DelegatedTranscriptionOptions, DelegatedTranscriptionService, hubComputer, workstation, registerTranscriptionRoutes(), transcriptionMultipartOptions, MAX_AUDIO_BYTES, TranscriptionService

### Community 116 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 117 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 118 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 119 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 120 - ".observe"
Cohesion: 0.18
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 121 - "ManagerProactiveInbox"
Cohesion: 0.22
Nodes (4): isAlreadyExists(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 122 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 123 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 124 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 125 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 126 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 127 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 128 - "react"
Cohesion: 0.14
Nodes (8): react, drawDiagram(), drawing, MermaidDiagram(), SessionActions(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 129 - "HubEvent"
Cohesion: 0.12
Nodes (12): ComputerManagerEvents, Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema, directories (+4 more)

### Community 130 - "TranscriptionError"
Cohesion: 0.20
Nodes (7): collect(), oversized(), statusCodeOf(), LocalTranscriptionService, supportsAudioUpload(), fixture(), TranscriptionError

### Community 131 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 132 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 133 - "server/session-patches.ts"
Cohesion: 0.20
Nodes (8): publish(), diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 134 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 135 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (15): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+7 more)

### Community 136 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 137 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 139 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 141 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 142 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 143 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 144 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 145 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 147 - "registerSessionKnowledgeRoutes"
Cohesion: 0.28
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 148 - "NewSessionDialog"
Cohesion: 0.22
Nodes (15): activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession(), computerProviders() (+7 more)

### Community 149 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 150 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 151 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 152 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 153 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 154 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 155 - "node:fs/promises"
Cohesion: 0.19
Nodes (9): build(), trusted, disk, fixture(), fixtures, prompt(), ready(), releases (+1 more)

### Community 156 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 157 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 158 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 159 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 160 - ".initialize"
Cohesion: 0.24
Nodes (4): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, open()

### Community 161 - "session-response-order.ts"
Cohesion: 0.29
Nodes (10): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+2 more)

### Community 162 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 164 - "settings-profile.test.ts"
Cohesion: 0.20
Nodes (6): applySettingsChanges(), sameSettingValue(), samePending(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 165 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 166 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 167 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 168 - "file-upload-routes.ts"
Cohesion: 0.29
Nodes (6): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile()

### Community 169 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 170 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 172 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 173 - "boundedText"
Cohesion: 0.33
Nodes (9): addActivity(), attachmentModeValue(), boundedText(), normalizeBackgroundTask(), numberValue(), progressValue(), shellExitFromValue(), shellTask() (+1 more)

### Community 174 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 176 - "tmux-errors.test.ts"
Cohesion: 0.25
Nodes (6): directories, { execute }, files, links, listener(), server()

### Community 177 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 178 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 179 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.36
Nodes (5): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemorySearchResult

### Community 180 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 181 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 182 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 183 - "dreamer-store.test.ts"
Cohesion: 0.29
Nodes (4): DREAMER_MAX_ZONES, DREAMER_STATE_VERSION, directories, plan

### Community 184 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 185 - "SessionStatus"
Cohesion: 0.29
Nodes (7): ManagerProactiveInboxObservation, PersistedCursor, SessionOrigin, Row, SdkRestartRecovery, SessionStatus, PendingEchoOwner

### Community 186 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 187 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 189 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 190 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 191 - "dreamer-app.test.ts"
Cohesion: 0.40
Nodes (3): directories, runtimes, trusted

### Community 192 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1127 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1122 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1900 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `session-reply-durability.test.ts`, `SessionStore`, `agent-service.ts`, `agent-service.test.ts`, `contracts.ts`, `session-resources.ts`, `background-task-adapter.ts`, `queueConflict`, `directory-browser.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `session-reply-durability.test.ts`, `SessionDetail`, `agent-service.ts`, `session-store.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `registerHubRoutes()` connect `ManagedSession` to `KnowledgeStore`, `settings-profile-store.ts`, `server/session-patches.ts`, `contracts.ts`, `hub-routes.ts`, `SessionKnowledgeStore`, `oracle-voice-coordinator.ts`, `normalizeKnowledgeRelativePath`, `session-resources.ts`, `app.ts`, `refusal-metrics.ts`, `node-routes.ts`, `registerSessionKnowledgeRoutes`, `oracle-voice-routes.ts`, `SessionOrderStore`, `directory-browser.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1127 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03294261855512143 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03160576387230316 - nodes in this community are weakly interconnected._
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
