# Agentic Remote - Graphify code map

Snapshot: `e0fa472c8cc85f53bd29fe7f6887c91258a7868b507de05beb8ac71cd0d2cdc0`

Source checkout: `9e7773b137334716237cc18ac7c79376ba459baf`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 397 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 397 files · ~789,177 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6659 nodes · 18395 edges · 227 communities (186 shown, 25 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1000 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionStore
- api.ts
- App
- App.tsx
- ClaudeAgentService
- agent-service.test.ts
- agent-service.ts
- terminal-session.ts
- claude-agent-service.ts
- OracleVoiceCoordinator
- multi-node.test.ts
- oracle-voice-session.ts
- agentic-remote-promotion-monitor
- oracle-voice-soak.ts
- computer-manager.ts
- ManagedSession
- ManagerAgent
- node-routes.ts
- sessionKey
- manager-tools.ts
- queued-dispatch.test.ts
- oracle-voice-integration.test.ts
- manager-structured-memory-validation.ts
- markdown-navigation.ts
- FakeManager
- SessionDetail
- manager-store.ts
- tmux-test-helpers.ts
- tmux-errors.integration.test.ts
- manager-agent.ts
- FakeVoiceEngine
- oracle-voice-child.ts
- oracle-voice.ts
- dreamer-store.ts
- TmuxTerminalSessionController
- oracle-voice-benchmark.ts
- contracts.ts
- OracleVoiceClient
- agentic-remote
- bundle
- SessionService
- ProviderSessionService
- pwa.ts
- VoicePlayback
- normalizeKnowledgeRelativePath
- oracle-voice-routes.ts
- manager.ts
- ManagerStore
- ResidentVoiceWorker
- shell.ts
- lib.rs
- hub-routes.ts
- VoiceCapture
- agentic-remote-promotion-setup
- app.ts
- terminal-session.test.ts
- knowledge-tree.ts
- agentic-remote-gate
- config.rs
- VoiceAudioFrame
- transcription-service.ts
- ManagerAssistant.tsx
- DreamerStore
- capture.ts
- dependencies
- devDependencies
- active-sessions.ts
- oracle-voice-worker.ts
- VoiceClientControl
- ChildVoiceEngine
- oracle-voice-security.test.ts
- client.ts
- background-task-adapter.ts
- client.test.ts
- workspace-fixtures.ts
- DreamerService
- PushNotificationService
- terminal-startup-queue.test.ts
- dreamer-planner.ts
- manager-structured-memory.ts
- SessionKnowledgeStore
- SessionOrderStore
- settings-profile-store.ts
- session-reply-durability.test.ts
- shared/settings-profile.ts
- OracleDreamer.tsx
- fake-voice.ts
- session-patch-browser.ts
- KnowledgeStore
- cli-canary.ts
- manager-structured-memory-search.ts
- send-matrix.integration.test.ts
- scripts
- directory-browser.ts
- oracle-voice-config.ts
- push-notification-service.ts
- delegated-transcription-service.ts
- compilerOptions
- capture-workbench-review.ts
- ChatMessage
- oracle-voice-segments.ts
- src/settings-profile.ts
- SettingsProfileClient
- dreamer-service.ts
- ManagerStructuredMemoryStore
- oracle-voice-tickets.ts
- session-knowledge-store.ts
- isTerminalComposerFooter
- capture-workspace.ts
- full-gate.test.ts
- startup-phases.test.ts
- oracle-voice-coordinator.test.ts
- PromptCards.tsx
- ManagerAssistant.test.tsx
- compilerOptions
- refusal-metrics.ts
- session-store-providers.test.ts
- OnlineRecognizer
- use-oracle-settings.ts
- compilerOptions
- compilerOptions
- server/side-question.ts
- .toolHost
- ManagerMemory
- submission-error.ts
- workspace-browser.ts
- SettingsProfileSnapshot
- backgroundTasksFromEvents
- dreamer-schedule.ts
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- ManagerStructuredMemoryRuntime
- NewSessionDialog
- terminal-form-deadline.test.ts
- react
- background-task-stop.test.ts
- promotion-monitor.test.ts
- recovery-resend-durability.test.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- scripts
- file-upload-routes.ts
- oracle-voice-assets.test.ts
- VoiceWorkerParentMessage
- fake-vad.ts
- desktop.json
- DeferredSession
- registerSessionKnowledgeRoutes
- theme-contrast.test.ts
- OracleVoiceClientOptions
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- oracle-voice-engine-smoke.ts
- session-knowledge-routes.ts
- Pcm16Resampler
- background-task-tracker.ts
- .initialize
- BackgroundTasksDialog.tsx
- html-preview.ts
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- dreamer-routes.ts
- bridge.rs
- screenshot-stability.test.ts
- promotion-setup-execution.test.ts
- SessionAdmissions
- vite.config.ts
- KnowledgePosition
- package.json
- SpeakableSegmenter
- OracleVoiceClientDependencies
- recovery-context.ts
- release-publication.test.ts
- OracleVoicePlayback
- oracle-conversation-real.test.ts
- render-workspace-gifs.ts
- backgroundHandoff
- HubEvent
- history-projection.test.ts
- manager-structured-memory-performance.test.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- usePanelWidth
- promotion-setup.test.ts
- push-routes.ts
- removeComputer
- FakeRecorder
- DreamerMorningPlan
- FakeRecorder
- terminal-send-uncertainty.test.ts
- MermaidDiagram.tsx
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
2. `App()` - 277 edges
3. `AgentService` - 275 edges
4. `SessionStore` - 189 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 102 edges
7. `registerHubRoutes()` - 93 edges
8. `buildApp()` - 92 edges
9. `ComputerManager` - 87 edges
10. `ManagerAgent` - 83 edges

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

## Communities (227 total, 25 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (17): agentMode(), AgentService, isTerminalNotReadyRefusal(), isUncertainDelivery(), restart(), removeCopilotSessionFiles(), RuntimeConfigurationError, suspendedRuntimeConflict() (+9 more)

### Community 1 - "SessionStore"
Cohesion: 0.03
Nodes (87): fixture(), fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture() (+79 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (128): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, SettingsChange, SettingsProfileKey, SettingsProfileValues, SettingsUpdateResult, parseSubmissionReceipt() (+120 more)

### Community 3 - "App"
Cohesion: 0.03
Nodes (143): isManagerEvent(), alertNotification(), terminalSendOptions(), askSession(), clearConversation(), recoverConversation(), reorderQueuedPrompts(), restartSession() (+135 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (113): configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+105 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (24): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+16 more)

### Community 6 - "agent-service.test.ts"
Cohesion: 0.02
Nodes (78): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+70 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.04
Nodes (78): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+70 more)

### Community 8 - "terminal-session.ts"
Cohesion: 0.05
Nodes (82): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed() (+74 more)

### Community 9 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (67): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+59 more)

### Community 10 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (22): ManagerEventSource, ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect() (+14 more)

### Community 11 - "multi-node.test.ts"
Cohesion: 0.04
Nodes (22): directories, FakeSessionService, routingFixture(), session(), temporaryDirectory(), voiceControlQueues, voiceControlWaiters, ProviderSessionServiceEvents (+14 more)

### Community 12 - "oracle-voice-session.ts"
Cohesion: 0.04
Nodes (39): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+31 more)

### Community 13 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 14 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (33): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+25 more)

### Community 15 - "computer-manager.ts"
Cohesion: 0.04
Nodes (27): RemoteResync, RemoteSessionListing, RemoteSessionRead, DEFINITE_DISPATCH_REFUSALS, headerSafe(), normalizeNodeUrl(), REDIRECT_STATUSES, RemoteNodeClient (+19 more)

### Community 16 - "ManagedSession"
Cohesion: 0.10
Nodes (13): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, TurnContextInput, FakeManager (+5 more)

### Community 17 - "ManagerAgent"
Cohesion: 0.09
Nodes (11): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, withTimeout() (+3 more)

### Community 18 - "node-routes.ts"
Cohesion: 0.04
Nodes (44): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema (+36 more)

### Community 19 - "sessionKey"
Cohesion: 0.06
Nodes (55): saveSessionOrderLane(), handleDragEnd(), stepSession(), readSelectionFromLocation(), RenameSessionDialog(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers() (+47 more)

### Community 20 - "manager-tools.ts"
Cohesion: 0.06
Nodes (34): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), steer() (+26 more)

### Community 21 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (29): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), QueuedDelivery (+21 more)

### Community 22 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (30): apps, BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket, closeSocket() (+22 more)

### Community 23 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 24 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (45): executeCommand(), listWorkspace(), searchWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+37 more)

### Community 25 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 26 - "SessionDetail"
Cohesion: 0.09
Nodes (6): persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, PendingUserInput, SessionDetail, UserInputReplyInput

### Community 27 - "manager-store.ts"
Cohesion: 0.07
Nodes (36): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+28 more)

### Community 28 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (43): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+35 more)

### Community 29 - "tmux-errors.integration.test.ts"
Cohesion: 0.06
Nodes (31): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+23 more)

### Community 30 - "manager-agent.ts"
Cohesion: 0.06
Nodes (26): discover(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig (+18 more)

### Community 31 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (25): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine (+17 more)

### Community 32 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (40): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, createVoiceWorker(), defaultSpawnPiper(), errorMessage() (+32 more)

### Community 33 - "oracle-voice.ts"
Cohesion: 0.08
Nodes (40): VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities, closeServers, exactArrayBuffer(), sockets (+32 more)

### Community 34 - "dreamer-store.ts"
Cohesion: 0.07
Nodes (41): DreamerHistoryEntry, assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES (+33 more)

### Community 35 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (13): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+5 more)

### Community 36 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (40): benchmarkFixture(), benchmarkGroup(), BenchmarkMetric, BenchmarkProfile, buildConfig(), CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 37 - "contracts.ts"
Cohesion: 0.06
Nodes (35): ActivityStatus, AddKnowledgeRootInput, AgentProvider, BackgroundTaskAttachmentMode, BackgroundTaskExecutionMode, DispatchQueuedPromptInput, ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot (+27 more)

### Community 38 - "OracleVoiceClient"
Cohesion: 0.14
Nodes (9): VoiceServerControl, captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError() (+1 more)

### Community 39 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 40 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 41 - "SessionService"
Cohesion: 0.09
Nodes (3): registerNodeRoutes(), SessionService, WorkspaceListing

### Community 43 - "pwa.ts"
Cohesion: 0.09
Nodes (38): AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+30 more)

### Community 44 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 45 - "normalizeKnowledgeRelativePath"
Cohesion: 0.10
Nodes (31): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), SessionKnowledgeBinding, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+23 more)

### Community 46 - "oracle-voice-routes.ts"
Cohesion: 0.10
Nodes (34): sendNodeVoiceOutput(), OracleVoiceBackendConnector, OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes() (+26 more)

### Community 47 - "manager.ts"
Cohesion: 0.08
Nodes (27): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+19 more)

### Community 48 - "ManagerStore"
Cohesion: 0.09
Nodes (8): openStore(), emptyState(), ManagerStore, open(), FakeManager, createManager(), StoredManager, ManagerSnapshot

### Community 49 - "ResidentVoiceWorker"
Cohesion: 0.13
Nodes (6): combinedTranscript(), matchesCancelled(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceSynthesisRequest

### Community 50 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 51 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 52 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 53 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 54 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 55 - "app.ts"
Cohesion: 0.08
Nodes (22): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence (+14 more)

### Community 56 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (32): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+24 more)

### Community 57 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (35): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+27 more)

### Community 58 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 59 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 60 - "VoiceAudioFrame"
Cohesion: 0.13
Nodes (16): QueuedAudio, BrowserCaptureOptions, AudioReservation, VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES (+8 more)

### Community 61 - "transcription-service.ts"
Cohesion: 0.09
Nodes (22): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+14 more)

### Community 62 - "ManagerAssistant.tsx"
Cohesion: 0.10
Nodes (29): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), phoneEnterCreatesNewline(), applyEvent(), canTakeFocus() (+21 more)

### Community 63 - "DreamerStore"
Cohesion: 0.14
Nodes (9): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerRecoveryError, DreamerStore, isMissing(), publicPlan(), toPersistedPlan() (+1 more)

### Community 64 - "capture.ts"
Cohesion: 0.07
Nodes (17): BufferedFrame, defaultAudioContext(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode (+9 more)

### Community 65 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 66 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 67 - "active-sessions.ts"
Cohesion: 0.12
Nodes (30): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+22 more)

### Community 68 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (21): VoiceGenerationIdentity, VoiceSttEngine, VoiceTtsEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), exactKeys(), isCancelledEvent() (+13 more)

### Community 69 - "VoiceClientControl"
Cohesion: 0.19
Nodes (4): asSessionError(), EngineVoiceBackendSession, VoiceSessionError, VoiceClientControl

### Community 70 - "ChildVoiceEngine"
Cohesion: 0.15
Nodes (5): ChildVoiceEngine, errorMessage(), matchesSynthesis(), matchesUtterance(), VoiceChildProcess

### Community 71 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (18): apps, config, configFixture(), connect(), createManager(), Inbox, issueTicket(), localRuntime() (+10 more)

### Community 72 - "client.ts"
Cohesion: 0.10
Nodes (23): VoiceCapabilities, getOracleVoiceCapabilities(), closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode (+15 more)

### Community 73 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (30): addActivity(), BackgroundTaskEventOptions, boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, errorValue(), MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH (+22 more)

### Community 74 - "client.test.ts"
Cohesion: 0.09
Nodes (9): OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse() (+1 more)

### Community 75 - "workspace-fixtures.ts"
Cohesion: 0.09
Nodes (26): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+18 more)

### Community 76 - "DreamerService"
Cohesion: 0.20
Nodes (5): DreamerMemoryMetadata, setup(), DreamerService, publicSnapshot(), DreamerSnapshot

### Community 77 - "PushNotificationService"
Cohesion: 0.16
Nodes (6): OracleEventSource, PushNotificationService, scoped(), registerPushRoutes(), NotificationCategory, NotificationPayload

### Community 78 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (26): findActiveCopilotSessions(), appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs (+18 more)

### Community 79 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (26): activeDreamerMemoryIds(), activeMemoryRecord(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), digest(), DREAMER_DEFAULT_STALE_AFTER_MS (+18 more)

### Community 80 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (26): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_QUERY_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_RECORDS, MANAGER_STRUCTURED_MEMORY_MAX_REQUEST_ID_CHARS (+18 more)

### Community 81 - "SessionKnowledgeStore"
Cohesion: 0.14
Nodes (8): bindingKey(), SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases, root()

### Community 82 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 83 - "settings-profile-store.ts"
Cohesion: 0.13
Nodes (19): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+11 more)

### Community 84 - "session-reply-durability.test.ts"
Cohesion: 0.12
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 85 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (27): AccentSetting, appearanceSettings, applySettingsChanges(), isRecord(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting, NewSessionRuntimesSetting (+19 more)

### Community 86 - "OracleDreamer.tsx"
Cohesion: 0.14
Nodes (19): DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, getDreamer(), request(), saveDreamerSettings(), snapshot, updateDreamerPlan() (+11 more)

### Community 87 - "fake-voice.ts"
Cohesion: 0.08
Nodes (11): ActiveBackendSession, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, config, FakeSherpaStream, VoiceBackendOutput (+3 more)

### Community 88 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 89 - "KnowledgeStore"
Cohesion: 0.16
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 90 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 91 - "manager-structured-memory-search.ts"
Cohesion: 0.13
Nodes (23): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+15 more)

### Community 92 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (23): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+15 more)

### Community 93 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 94 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 95 - "oracle-voice-config.ts"
Cohesion: 0.14
Nodes (22): boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger(), optionalValue() (+14 more)

### Community 96 - "push-notification-service.ts"
Cohesion: 0.14
Nodes (17): brief(), PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030, notificationAllowed() (+9 more)

### Community 97 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (13): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+5 more)

### Community 98 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 99 - "capture-workbench-review.ts"
Cohesion: 0.11
Nodes (16): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, createWorkspaceFixtureState() (+8 more)

### Community 100 - "ChatMessage"
Cohesion: 0.15
Nodes (11): Connection, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset, ChatMessage, HubResyncRequest (+3 more)

### Community 101 - "oracle-voice-segments.ts"
Cohesion: 0.14
Nodes (22): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+14 more)

### Community 102 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (19): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+11 more)

### Community 103 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 104 - "dreamer-service.ts"
Cohesion: 0.11
Nodes (15): DREAMER_MAX_ITEMS, DreamerMemoryMetadataRecord, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), digest(), DreamerPlannerExecutionInput, DreamerServiceOptions (+7 more)

### Community 105 - "ManagerStructuredMemoryStore"
Cohesion: 0.26
Nodes (5): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState

### Community 106 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 107 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 108 - "isTerminalComposerFooter"
Cohesion: 0.13
Nodes (20): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+12 more)

### Community 109 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 110 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 111 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 112 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.13
Nodes (10): OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend, Harness (+2 more)

### Community 113 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 114 - "ManagerAssistant.test.tsx"
Cohesion: 0.10
Nodes (13): ManagerSessionRef, retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+5 more)

### Community 115 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 116 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 117 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 118 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 119 - "use-oracle-settings.ts"
Cohesion: 0.16
Nodes (14): getManager(), updateManagerSettings(), act(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus() (+6 more)

### Community 120 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 121 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 122 - "server/side-question.ts"
Cohesion: 0.19
Nodes (7): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout()

### Community 124 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 125 - "submission-error.ts"
Cohesion: 0.17
Nodes (10): directories, runtimes, start(), trusted, RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals (+2 more)

### Community 126 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 127 - "SettingsProfileSnapshot"
Cohesion: 0.17
Nodes (6): SettingsProfileSnapshot, settingsProfileCacheKey, SettingsProfileTransport, cached(), FakeHub, MemoryStorage

### Community 128 - "backgroundTasksFromEvents"
Cohesion: 0.18
Nodes (18): backgroundTasksFromEvents(), eventString(), eventTask(), executionModeValue(), isLiveTaskStatus(), isOlderExecution(), isShellObserverTool(), isShellStopTool() (+10 more)

### Community 129 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 130 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 131 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 132 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 133 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.16
Nodes (8): capturePrompt(), initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, ManagerStructuredMemoryMode, ManagerStructuredMemoryStatus

### Community 134 - "NewSessionDialog"
Cohesion: 0.18
Nodes (17): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+9 more)

### Community 135 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 136 - "react"
Cohesion: 0.18
Nodes (8): react, transcribeAudio(), MarkdownCodeBlock(), copy(), originalClipboard, SessionActions(), recordingDuration(), useVoiceRecorder()

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

### Community 142 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 143 - "file-upload-routes.ts"
Cohesion: 0.20
Nodes (8): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), registerTranscriptionRoutes(), transcriptionMultipartOptions

### Community 144 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 145 - "VoiceWorkerParentMessage"
Cohesion: 0.19
Nodes (6): FakeChildProcess, initialize(), InProcessVoiceChild, parentHarness(), VoiceWorker, VoiceWorkerParentMessage

### Community 146 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 147 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 148 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 149 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 150 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 151 - "OracleVoiceClientOptions"
Cohesion: 0.23
Nodes (3): OracleVoiceClientOptions, FakeVoiceClient, transcript()

### Community 152 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 153 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 154 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 155 - "oracle-voice-engine-smoke.ts"
Cohesion: 0.21
Nodes (6): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave

### Community 156 - "session-knowledge-routes.ts"
Cohesion: 0.15
Nodes (7): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema, SessionKnowledgeConflictError

### Community 157 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 158 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 159 - ".initialize"
Cohesion: 0.24
Nodes (4): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, open()

### Community 160 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 161 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 162 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 163 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 164 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 165 - "dreamer-routes.ts"
Cohesion: 0.27
Nodes (7): parse(), planSchema, registerDreamerRoutes(), settingsSchema, apps, directories, DreamerUnavailableError

### Community 166 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 167 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 168 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 170 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 171 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 172 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 175 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 176 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 179 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 180 - "backgroundHandoff"
Cohesion: 0.38
Nodes (7): attachmentModeValue(), backgroundHandoff(), booleanValue(), rawTailText(), shellStopAcknowledged(), shellTaskMode(), toolTelemetryProperties()

### Community 181 - "HubEvent"
Cohesion: 0.33
Nodes (3): ComputerManagerEvents, HubEventSource, HubEvent

### Community 182 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 183 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.43
Nodes (5): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES

### Community 184 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 185 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 186 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 187 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 188 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 189 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 190 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 192 - "DreamerMorningPlan"
Cohesion: 0.70
Nodes (5): DreamerMorningPlan(), confirmCompletion(), disposition(), edit(), move()

### Community 196 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **1098 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1093 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1859 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionStore`, `server/side-question.ts`, `agent-service.ts`, `claude-agent-service.ts`, `multi-node.test.ts`, `queued-dispatch.test.ts`, `SessionDetail`, `directory-browser.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionStore`, `ClaudeAgentService`, `ManagerStructuredMemoryRuntime`, `oracle-voice-session.ts`, `file-upload-routes.ts`, `ManagedSession`, `ManagerAgent`, `manager-store.ts`, `tmux-errors.integration.test.ts`, `dreamer-routes.ts`, `SessionService`, `ProviderSessionService`, `pwa.ts`, `manager.ts`, `ManagerStore`, `transcription-service.ts`, `ChildVoiceEngine`, `DreamerService`, `PushNotificationService`, `SessionKnowledgeStore`, `SessionOrderStore`, `settings-profile-store.ts`, `KnowledgeStore`, `cli-canary.ts`, `oracle-voice-config.ts`, `delegated-transcription-service.ts`, `refusal-metrics.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `ClaudeAgentService`, `agent-service.ts`, `claude-agent-service.ts`, `queued-dispatch.test.ts`, `SessionDetail`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1098 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.034686439612919444 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.025941271842911187 - nodes in this community are weakly interconnected._
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
