# Agentic Remote - Graphify code map

Snapshot: `83d708134dc5edee16211969f51841cc2920a7ae8e2ddd7cc08ad14393b41911`

Source checkout: `60456612f04b748a6c309cf554d73679a09b2127`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 377 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 377 files · ~734,762 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6306 nodes · 17307 edges · 215 communities (174 shown, 25 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 958 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- api.ts
- App
- SessionDetail
- App.tsx
- oracle-voice-worker.ts
- agent-service.ts
- ClaudeAgentService
- contracts.ts
- session-store.ts
- node-routes.ts
- claude-agent-service.ts
- agentic-remote-promotion-monitor
- oracle-voice-soak.ts
- terminal-session.ts
- ManagedSession
- oracle-voice.ts
- CopilotSessionLike
- sessionKey
- oracle-voice-integration.test.ts
- OracleVoiceClient
- oracle-voice-coordinator.ts
- VoiceCapture
- PushNotificationService
- OracleVoiceCoordinator
- manager.ts
- CopilotClientLike
- manager-tools.ts
- ManagerAgent
- manager-structured-memory-validation.ts
- ManagerAssistant.tsx
- TmuxTerminalSessionController
- FakeManager
- RemoteNodeClient
- send-matrix.integration.test.ts
- workspace-fixtures.ts
- SessionService
- FakeVoiceEngine
- tmux-test-helpers.ts
- oracle-voice-session.ts
- markdown-navigation.ts
- agentic-remote
- session-knowledge-routes.test.ts
- bundle
- .sendInternal
- active-sessions.ts
- background-task-adapter.ts
- ProviderSessionService
- hub-routes.ts
- pwa.ts
- shell.ts
- lib.rs
- oracle-voice-security.test.ts
- ManagerStore
- manager-context.ts
- agentic-remote-promotion-setup
- agentic-remote-gate
- config.rs
- app.ts
- transcription-service.ts
- knowledge-tree.ts
- oracle-voice-config.ts
- FakeSessionService
- oracle-voice-routes.ts
- dependencies
- devDependencies
- manager-agent.test.ts
- SessionKnowledgeStore
- manager-agent.ts
- capture-workspace.ts
- ManagerStructuredMemoryStore
- manager-structured-memory.ts
- SessionOrderStore
- VoicePlayback
- HubEvent
- terminal-session.test.ts
- real-voice.ts
- session-patch-browser.ts
- oracle-voice-benchmark.ts
- cli-canary.ts
- src/settings-profile.ts
- scripts
- KnowledgeStore
- directory-browser.ts
- manager-structured-memory-search.ts
- SettingsProfileClient
- capture.ts
- manager-routes.ts
- compilerOptions
- delegated-transcription-service.ts
- settings-profile-store.ts
- PromptCards.tsx
- oracle-voice-child.ts
- oracle-voice-tickets.ts
- session-knowledge-store.ts
- session-store-providers.test.ts
- SettingsProfileStore
- UserInputReplyInput
- full-gate.test.ts
- startup-phases.test.ts
- session-reply-durability.test.ts
- shared/settings-profile.ts
- terminal-form-deadline.test.ts
- compilerOptions
- submission-error.ts
- normalizeKnowledgeRelativePath
- refusal-metrics.ts
- OnlineRecognizer
- compilerOptions
- compilerOptions
- server/side-question.ts
- .toolHost
- ManagerMemory
- oracle-voice-segments.ts
- workspace-browser.ts
- react
- .finalizeUtterance
- use-session-knowledge-root.ts
- BoundedQueue
- session-latency-benchmark.ts
- NewSessionDialog
- use-oracle-settings.ts
- ReaderWorkspace
- background-task-stop.test.ts
- ResidentVoiceWorker
- promotion-monitor.test.ts
- recovery-resend-durability.test.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- scripts
- DeferredSession
- file-upload-routes.ts
- registerSessionKnowledgeRoutes
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- recordValue
- manager-runtime.ts
- ManagerStructuredMemoryRuntime
- theme-contrast.test.ts
- BackgroundTasksDialog.tsx
- .oxlintrc.json
- settings-local.json
- session-response-order.ts
- background-task-tracker.ts
- recovery-seed-guards.test.ts
- send-policy.test.ts
- html-preview.ts
- FakePiperProcess
- session-knowledge-routes.ts
- dataset
- generate-pwa-icons.ts
- benchmarkFixture
- bridge.rs
- SpeakableSegmenter
- manager-structured-memory-performance.test.ts
- .synthesize
- promotion-setup-execution.test.ts
- SessionAdmissions
- session-store-durability.test.ts
- tmux-errors.test.ts
- vite.config.ts
- KnowledgePosition
- package.json
- recovery-context.ts
- release-publication.test.ts
- UserInputFieldControl
- oracle-conversation-real.test.ts
- render-workspace-gifs.ts
- oracle-voice-benchmark.test.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- usePanelWidth
- MarkdownCodeBlock.tsx
- oracle-voice-sherpa-import.test.ts
- promotion-setup.test.ts
- removeComputer
- FakeRecorder
- MemoryStorage
- terminal-send-uncertainty.test.ts
- .readBackgroundTasks
- VoiceWorker
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
2. `App()` - 269 edges
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
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (215 total, 25 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (14): agentMode(), AgentService, isRuntimeReasoningEffort(), isUncertainDelivery(), permissionTitle(), removeCopilotSessionFiles(), RuntimeConfigurationError, terminalAnswerRefused() (+6 more)

### Community 1 - "api.ts"
Cohesion: 0.03
Nodes (121): SettingsChange, SettingsProfileKey, SettingsProfileValues, SettingsUpdateResult, parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder() (+113 more)

### Community 2 - "App"
Cohesion: 0.03
Nodes (135): isManagerEvent(), alertNotification(), terminalSendOptions(), askSession(), clearConversation(), recoverConversation(), restartSession(), activeComposerPastes() (+127 more)

### Community 3 - "SessionDetail"
Cohesion: 0.04
Nodes (23): toolResultText(), fixture(), fixture(), channels, directories, fixture(), observe(), canArchiveSession() (+15 more)

### Community 4 - "App.tsx"
Cohesion: 0.03
Nodes (104): AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+96 more)

### Community 5 - "oracle-voice-worker.ts"
Cohesion: 0.04
Nodes (49): benchmarkGroup(), childHarness(), config, FakeChildProcess, fakeSherpa(), FakeSherpaStream, initialize(), InProcessVoiceChild (+41 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.04
Nodes (82): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+74 more)

### Community 7 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (30): ClaudeAgentService, ClaudeSdk, isClaudeAuthenticationError(), isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle() (+22 more)

### Community 8 - "contracts.ts"
Cohesion: 0.04
Nodes (57): ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing, directories, voiceControlQueues, voiceControlWaiters, ProviderSessionServiceEvents, provider() (+49 more)

### Community 9 - "session-store.ts"
Cohesion: 0.03
Nodes (63): connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite() (+55 more)

### Community 10 - "node-routes.ts"
Cohesion: 0.03
Nodes (53): ActiveBackendSession, installFakeBrowserVoice(), ScriptedUtterance, Window, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket() (+45 more)

### Community 11 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (63): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+55 more)

### Community 12 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 13 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 14 - "terminal-session.ts"
Cohesion: 0.05
Nodes (72): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerHoldsOtherText() (+64 more)

### Community 15 - "ManagedSession"
Cohesion: 0.10
Nodes (12): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, FakeManager (+4 more)

### Community 16 - "oracle-voice.ts"
Cohesion: 0.06
Nodes (49): VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), RemoteVoiceClient, RemoteVoiceClientOptions (+41 more)

### Community 17 - "CopilotSessionLike"
Cohesion: 0.04
Nodes (37): CopilotSessionLike, configurableModel(), FakeCopilotClient, probeService(), startupFifoFixture(), terminalService(), CopilotTasksApi, acceptanceReceipt() (+29 more)

### Community 18 - "sessionKey"
Cohesion: 0.06
Nodes (61): saveSessionOrderLane(), failureStampFor(), handleDragEnd(), readSelectionFromLocation(), RenameSessionDialog(), SessionResourcesDialog(), KnowledgeRootSelector(), root (+53 more)

### Community 19 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (35): FakeVoiceEngineCall, apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+27 more)

### Community 20 - "OracleVoiceClient"
Cohesion: 0.07
Nodes (19): captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceClient (+11 more)

### Community 21 - "oracle-voice-coordinator.ts"
Cohesion: 0.04
Nodes (34): ManagerEventSource, ManagerEventSource, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OracleVoiceBackendConnection, OracleVoiceBackendConnector, OracleVoiceBackendDisconnect (+26 more)

### Community 22 - "VoiceCapture"
Cohesion: 0.06
Nodes (16): defaultDependencies(), captureFailure(), defaultAudioContext(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions (+8 more)

### Community 23 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 24 - "OracleVoiceCoordinator"
Cohesion: 0.08
Nodes (10): AudioCompletion, AudioGate, errorMessage(), OperationTimeoutError, OracleVoiceCoordinator, resolvedAudioGate(), terminalStartupCloseCode(), withTimeout() (+2 more)

### Community 25 - "manager.ts"
Cohesion: 0.05
Nodes (33): ManagerClientDefaults, ManagerConfirmation, ManagerMessageRole, ManagerMessageState, ManagerSubmissionSource, ResolveManagerConfirmationInput, SendManagerMessageInput, ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS (+25 more)

### Community 26 - "CopilotClientLike"
Cohesion: 0.05
Nodes (39): CopilotClientLike, normalizedTitle(), fixture(), holdProbe(), fixtures, gate(), releases, restart() (+31 more)

### Community 27 - "manager-tools.ts"
Cohesion: 0.06
Nodes (32): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), structuredTools() (+24 more)

### Community 28 - "ManagerAgent"
Cohesion: 0.10
Nodes (12): FakeVoiceState, checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, TurnError (+4 more)

### Community 29 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 30 - "ManagerAssistant.tsx"
Cohesion: 0.06
Nodes (41): ManagerSessionRef, cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage() (+33 more)

### Community 31 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (15): copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm() (+7 more)

### Community 32 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 33 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (13): RemoteSessionRead, headerSafe(), RemoteNodeClient, client(), servers, session, BackgroundTaskSnapshot, NodeInfo (+5 more)

### Community 34 - "send-matrix.integration.test.ts"
Cohesion: 0.05
Nodes (47): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+39 more)

### Community 35 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (40): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+32 more)

### Community 36 - "SessionService"
Cohesion: 0.07
Nodes (5): registerNodeRoutes(), isSessionResourceRoute(), SessionService, WorkspaceFile, WorkspaceFileIcon()

### Community 37 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (22): voiceBackend(), FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine (+14 more)

### Community 38 - "tmux-test-helpers.ts"
Cohesion: 0.10
Nodes (38): startAgentAfterClear(), exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, noTmuxServer() (+30 more)

### Community 39 - "oracle-voice-session.ts"
Cohesion: 0.12
Nodes (16): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), createVoiceBackendSession(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled() (+8 more)

### Community 40 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (39): executeCommand(), listWorkspace(), readWorkspaceFile(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+31 more)

### Community 41 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 42 - "session-knowledge-routes.test.ts"
Cohesion: 0.06
Nodes (24): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+16 more)

### Community 43 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 44 - ".sendInternal"
Cohesion: 0.13
Nodes (36): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+28 more)

### Community 45 - "active-sessions.ts"
Cohesion: 0.09
Nodes (38): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+30 more)

### Community 46 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (41): addActivity(), attachmentModeValue(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, eventString() (+33 more)

### Community 48 - "hub-routes.ts"
Cohesion: 0.06
Nodes (39): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+31 more)

### Community 49 - "pwa.ts"
Cohesion: 0.10
Nodes (36): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle() (+28 more)

### Community 50 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 51 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 52 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (20): apps, config, configFixture(), connect(), createManager(), Inbox, issueTicket(), localRuntime() (+12 more)

### Community 53 - "ManagerStore"
Cohesion: 0.10
Nodes (6): openStore(), JournalRecorder, emptyState(), ManagerStore, registryKey(), open()

### Community 54 - "manager-context.ts"
Cohesion: 0.10
Nodes (33): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+25 more)

### Community 55 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 56 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 57 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 58 - "app.ts"
Cohesion: 0.09
Nodes (22): prefixes, session, trusted, untrusted, apps, directories, buildApp(), errorStatusCode() (+14 more)

### Community 59 - "transcription-service.ts"
Cohesion: 0.09
Nodes (22): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+14 more)

### Community 60 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 61 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (25): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+17 more)

### Community 62 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 63 - "oracle-voice-routes.ts"
Cohesion: 0.12
Nodes (32): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode() (+24 more)

### Community 64 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 65 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 66 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (14): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail(), FakeClient (+6 more)

### Community 67 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 68 - "manager-agent.ts"
Cohesion: 0.11
Nodes (15): isPending(), isQueued(), ManagerAgentOptions, Rung, sameRuntime(), TURN_ACTIVITY, ManagerState, hasExplicitStructuredMemoryIntent() (+7 more)

### Community 69 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 70 - "ManagerStructuredMemoryStore"
Cohesion: 0.18
Nodes (9): capturePrompt(), digest(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMutationResult (+1 more)

### Community 71 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (25): ManagerStructuredMemorySearchIndex, ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_QUERY_CHARS (+17 more)

### Community 72 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 73 - "VoicePlayback"
Cohesion: 0.13
Nodes (6): pcm16ToFloat(), SegmentDrain, FakeSource, harness(), validateGeneration(), VoicePlayback

### Community 74 - "HubEvent"
Cohesion: 0.12
Nodes (15): Connection, WorkspaceFixture, ComputerManagerEvents, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset (+7 more)

### Community 75 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (22): parseTerminalUpdateNotice(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, deliveryFixture(), desktopInstallPane, directories, downloadedUpdateFooter (+14 more)

### Community 76 - "real-voice.ts"
Cohesion: 0.12
Nodes (11): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+3 more)

### Community 77 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 78 - "oracle-voice-benchmark.ts"
Cohesion: 0.11
Nodes (24): BenchmarkMetric, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, derived(), execFileAsync, formatBenchmarkMarkdown() (+16 more)

### Community 79 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 80 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (22): AppearanceSetting, isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, statuslineItems, Appearance, appearanceFrom() (+14 more)

### Community 81 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 82 - "KnowledgeStore"
Cohesion: 0.17
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 83 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 84 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 85 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 86 - "capture.ts"
Cohesion: 0.10
Nodes (15): BufferedFrame, positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode, VoiceVad (+7 more)

### Community 87 - "manager-routes.ts"
Cohesion: 0.12
Nodes (15): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+7 more)

### Community 88 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 89 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (12): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload (+4 more)

### Community 90 - "settings-profile-store.ts"
Cohesion: 0.18
Nodes (12): SettingsProfileState, applySettingsChanges(), applySettingsImport(), isSettingsProfileKey(), SettingsProfileRecord, SettingsRequestError, sizeChecked(), validateSettingsChanges() (+4 more)

### Community 91 - "PromptCards.tsx"
Cohesion: 0.13
Nodes (16): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+8 more)

### Community 92 - "oracle-voice-child.ts"
Cohesion: 0.13
Nodes (20): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, createVoiceWorker(), defaultSpawnPiper(), errorMessage() (+12 more)

### Community 93 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 94 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 95 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+3 more)

### Community 96 - "SettingsProfileStore"
Cohesion: 0.14
Nodes (11): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileStore, directories, store() (+3 more)

### Community 97 - "UserInputReplyInput"
Cohesion: 0.22
Nodes (3): persistedFormAnswer(), validateUserInputForm(), UserInputReplyInput

### Community 98 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 99 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 100 - "session-reply-durability.test.ts"
Cohesion: 0.16
Nodes (17): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+9 more)

### Community 101 - "shared/settings-profile.ts"
Cohesion: 0.13
Nodes (20): AccentSetting, appearanceSettings, isRecord(), NewSessionFoldersSetting, NewSessionRuntimesSetting, oneOf(), oracleResponseStyles, parseRuntime() (+12 more)

### Community 102 - "terminal-form-deadline.test.ts"
Cohesion: 0.12
Nodes (15): TerminalFormContinuation, question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture() (+7 more)

### Community 103 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 104 - "submission-error.ts"
Cohesion: 0.16
Nodes (11): BuildAppOptions, directories, runtimes, start(), trusted, RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain() (+3 more)

### Community 105 - "normalizeKnowledgeRelativePath"
Cohesion: 0.21
Nodes (16): knowledgeFileSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot() (+8 more)

### Community 106 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 107 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 108 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 109 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 110 - "server/side-question.ts"
Cohesion: 0.19
Nodes (7): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout()

### Community 112 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 113 - "oracle-voice-segments.ts"
Cohesion: 0.18
Nodes (18): alignCandidateSequences(), AlignmentCost, CandidateAlignment, candidateSubstitutionCost(), capSegment(), collectProseBlocks(), EmittedCandidate, extractSpeakableSegments() (+10 more)

### Community 114 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 115 - "react"
Cohesion: 0.14
Nodes (8): react, drawDiagram(), drawing, MermaidDiagram(), SessionActions(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 116 - ".finalizeUtterance"
Cohesion: 0.19
Nodes (3): pcm16ToFloat32(), SherpaRecognizer, SherpaStream

### Community 117 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 118 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 119 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 120 - "NewSessionDialog"
Cohesion: 0.18
Nodes (17): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+9 more)

### Community 121 - "use-oracle-settings.ts"
Cohesion: 0.21
Nodes (12): getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps, models (+4 more)

### Community 122 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 123 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 124 - "ResidentVoiceWorker"
Cohesion: 0.24
Nodes (5): matchesCancelled(), ResidentVoiceWorker, VoiceGenerationIdentity, ActiveSynthesisIdentity, ActiveUtteranceIdentity

### Community 125 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 126 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 127 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 128 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 129 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 130 - "DeferredSession"
Cohesion: 0.15
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 131 - "file-upload-routes.ts"
Cohesion: 0.20
Nodes (8): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), registerTranscriptionRoutes(), transcriptionMultipartOptions

### Community 132 - "registerSessionKnowledgeRoutes"
Cohesion: 0.27
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 133 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 134 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 135 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 136 - "recordValue"
Cohesion: 0.22
Nodes (14): backgroundHandoff(), booleanValue(), errorValue(), notificationKind(), parsedValue(), rawTailText(), recordValue(), shellIdFromFooter() (+6 more)

### Community 137 - "manager-runtime.ts"
Cohesion: 0.25
Nodes (10): COPILOT_SDK_SESSION_DISCOVERY, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession(), efforts (+2 more)

### Community 138 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.18
Nodes (5): ManagerStructuredMemoryRuntime, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, ManagerStructuredMemoryStatus

### Community 139 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 140 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 141 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 142 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 143 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 144 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 145 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 146 - "send-policy.test.ts"
Cohesion: 0.20
Nodes (10): SessionExecutionMode, TerminalSendPolicyInput, TerminalSendRequestOptions, booleans, combinations, executionModes, providers, replacing (+2 more)

### Community 147 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 148 - "FakePiperProcess"
Cohesion: 0.20
Nodes (4): PiperProcess, FakePiperProcess, waitForActivePiperExit(), waitForPiperExit()

### Community 149 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 150 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 151 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 152 - "benchmarkFixture"
Cohesion: 0.29
Nodes (8): benchmarkFixture(), deferred(), maybeMeasured(), measured(), measureSttPass(), measureTts(), missing(), readProcessSample()

### Community 153 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 154 - "SpeakableSegmenter"
Cohesion: 0.31
Nodes (3): firstTtsSegment(), SpeakableSegmenter, validateMessageId()

### Community 155 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.31
Nodes (6): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult

### Community 157 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 159 - "session-store-durability.test.ts"
Cohesion: 0.31
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 160 - "tmux-errors.test.ts"
Cohesion: 0.25
Nodes (6): directories, { execute }, files, links, listener(), server()

### Community 161 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 162 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 163 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 164 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 165 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 166 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 168 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 169 - "oracle-voice-benchmark.test.ts"
Cohesion: 0.33
Nodes (5): BenchmarkProfile, normalizeTranscript(), VoiceBenchmarkReport, wordErrorRate(), OracleVoiceSttProfile

### Community 170 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 171 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 172 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 173 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 174 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 175 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 176 - "oracle-voice-sherpa-import.test.ts"
Cohesion: 0.40
Nodes (4): DefaultRecognizer, defaultTts, NamedRecognizer, namedTts

### Community 177 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 178 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **1053 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1048 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1787 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SessionService` connect `SessionService` to `RemoteNodeClient`, `contracts.ts`, `claude-agent-service.ts`, `ProviderSessionService`, `directory-browser.ts`, `CopilotClientLike`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `ComputerManager` connect `ManagedSession` to `contracts.ts`, `claude-agent-service.ts`, `session-knowledge-routes.test.ts`, `directory-browser.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `FakeVoiceEngine` connect `FakeVoiceEngine` to `oracle-voice-worker.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1053 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03459481694775812 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.02834199338686821 - nodes in this community are weakly interconnected._
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
