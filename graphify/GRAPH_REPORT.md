# Agentic Remote - Graphify code map

Snapshot: `493bd8813b7b3fc0be490c90e1cfc0a475c722969236b6a649eaa29c6a554a1e`

Source checkout: `5c195ffe8370501b9ef5d57d4351fb942fad8e6c`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 327 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 327 files · ~648,031 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 5574 nodes · 15334 edges · 185 communities (144 shown, 26 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 876 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App.tsx
- App
- api.ts
- SessionDetail
- contracts.ts
- manager.ts
- SessionStore
- claude-agent-service.ts
- app.ts
- SessionService
- OracleVoiceCoordinator
- session-store.ts
- oracle-voice-session.ts
- VoiceClientControl
- ManagedSession
- oracle-voice-child.ts
- terminal-session.ts
- agentic-remote-promotion-monitor
- oracle-voice.ts
- oracle-voice-engine.ts
- oracle-voice-soak.ts
- session-presentation.ts
- ManagerAgent
- CopilotSessionLike
- oracle-voice-integration.test.ts
- oracle-voice-worker.ts
- RemoteNodeClient
- manager-agent.ts
- manager-tools.ts
- ManagerAssistant.tsx
- FakeManager
- oracle-voice-benchmark.ts
- agent-service.ts
- session-reply-durability.test.ts
- TmuxTerminalSessionController
- markdown-navigation.ts
- agentic-remote
- bundle
- .sendInternal
- ProviderSessionService
- terminal-startup-queue.test.ts
- pwa.ts
- lib.rs
- PushNotificationService
- ManagerStore
- shell.ts
- agentic-remote-promotion-setup
- config.rs
- session-knowledge-routes.test.ts
- oracle-voice-routes.ts
- knowledge-tree.ts
- hub-routes.ts
- FakeVoiceEngine
- dependencies
- devDependencies
- manager-agent.test.ts
- FakeSessionService
- oracle-voice-child.test.ts
- manager-routes.ts
- active-sessions.ts
- oracle-voice-config.ts
- FakeSocket
- SessionKnowledgeStore
- terminal-session.test.ts
- session-resource-providers.test.ts
- VoiceSessionError
- SessionOrderStore
- oracle-voice-security.test.ts
- tmux-errors.integration.test.ts
- VoicePlayback
- KnowledgeStore
- .isRetiredSession
- background-task-adapter.ts
- cli-canary.ts
- oracle-voice-segments.ts
- scripts
- remote-voice-client.ts
- compilerOptions
- oracle-voice-coordinator.test.ts
- recordValue
- agent-service.test.ts
- PromptCards.tsx
- normalizeKnowledgeRelativePath
- startup-phases.test.ts
- oracle-voice-tickets.ts
- capture-workspace.ts
- session-clear-transcript.test.ts
- session-knowledge-store.ts
- terminal-form-deadline.test.ts
- compilerOptions
- session-store-providers.test.ts
- OnlineRecognizer
- compilerOptions
- compilerOptions
- recordValue
- event-log.ts
- .toolHost
- ManagerMemory
- workspace-browser.ts
- react
- use-session-knowledge-root.ts
- BoundedQueue
- backgroundTasksFromEvents
- directory-browser.ts
- use-oracle-settings.ts
- ReaderWorkspace
- workspace-fixtures.ts
- SoakManager
- session-resource-routes.test.ts
- check-workspace-review-regressions.ts
- background-task-stop.test.ts
- oracle-voice-assets.test.ts
- BackgroundTasksDialog.tsx
- NewSessionDialog
- fake-vad.ts
- desktop.json
- registerSessionKnowledgeRoutes
- capture-workbench-review.ts
- .oxlintrc.json
- settings-local.json
- .askSession
- promotion-monitor.test.ts
- session-resource-clear.test.ts
- session-response-order.ts
- Pcm16Resampler
- scripts
- background-task-tracker.ts
- html-preview.ts
- session-knowledge-routes.ts
- server/side-question.ts
- setupWorkspaceFixture
- dataset
- generate-pwa-icons.ts
- DeferredSession
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- promotion-setup-execution.test.ts
- submission-error.ts
- package.json
- release-publication.test.ts
- UserInputFieldControl
- render-workspace-gifs.ts
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- usePanelWidth
- MarkdownCodeBlock.tsx
- vite.config.ts
- app-build.test.ts
- promotion-setup.test.ts
- hasRunningBackgroundAgent
- FakeRecorder
- terminal-send-uncertainty.test.ts
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- @dnd-kit/utilities
- @fastify/static
- ffmpeg-static
- @github/copilot-sdk
- lucide-react
- onnxruntime-web
- react
- react-markdown
- ws
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 279 edges
2. `App()` - 258 edges
3. `AgentService` - 245 edges
4. `SessionStore` - 162 edges
5. `ClaudeAgentService` - 120 edges
6. `ManagedSession` - 92 edges
7. `ComputerManager` - 83 edges
8. `registerHubRoutes()` - 79 edges
9. `ManagerAgent` - 73 edges
10. `SessionService` - 73 edges

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

## Communities (185 total, 26 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (10): agentMode(), AgentService, isMissingSessionError(), isUncertainDelivery(), removeCopilotSessionFiles(), RuntimeConfigurationError, queueConflict(), fixture() (+2 more)

### Community 1 - "App.tsx"
Cohesion: 0.02
Nodes (120): isManagerEvent(), addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+112 more)

### Community 2 - "App"
Cohesion: 0.04
Nodes (129): submissionReceiptFromError(), askSession(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot() (+121 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (109): parseSubmissionReceipt(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRuntime(), createOracleVoiceTicket() (+101 more)

### Community 4 - "SessionDetail"
Cohesion: 0.04
Nodes (11): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), observe(), clearRecoverySeedFailure(), grantTerminalRecovery(), ownsRecoverySeedFailure(), QueuedPromptReservation (+3 more)

### Community 5 - "contracts.ts"
Cohesion: 0.04
Nodes (57): ComputerManagerEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, directories, voiceControlQueues, voiceControlWaiters (+49 more)

### Community 6 - "manager.ts"
Cohesion: 0.05
Nodes (39): ManagerClientDefaults, ManagerConfirmation, ManagerMessageRole, ManagerMessageState, ManagerSubmissionSource, ResolveManagerConfirmationInput, SendManagerMessageInput, VoiceCapabilities (+31 more)

### Community 7 - "SessionStore"
Cohesion: 0.05
Nodes (48): fixture(), holdProbe(), fixtures, gate(), releases, restart(), fixture(), connect() (+40 more)

### Community 8 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (65): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+57 more)

### Community 9 - "app.ts"
Cohesion: 0.05
Nodes (50): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), collect() (+42 more)

### Community 10 - "SessionService"
Cohesion: 0.04
Nodes (36): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), closeReason(), closeVoiceSocket() (+28 more)

### Community 11 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (21): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+13 more)

### Community 12 - "session-store.ts"
Cohesion: 0.03
Nodes (56): CopilotClientLike, directories, fakeClient(), ForkRequest, forkSession(), services, fixtures, recoverAndSeed() (+48 more)

### Community 13 - "oracle-voice-session.ts"
Cohesion: 0.04
Nodes (46): ActiveBackendSession, installFakeBrowserVoice(), ScriptedUtterance, Window, exactArrayBuffer(), rawDataBuffer(), receiveNodeVoiceMessage(), playbackSequence() (+38 more)

### Community 14 - "VoiceClientControl"
Cohesion: 0.05
Nodes (26): BrowserCaptureOptions, VoiceClientControl, BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio (+18 more)

### Community 15 - "ManagedSession"
Cohesion: 0.09
Nodes (12): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, FakeManager, ComputerSummary (+4 more)

### Community 16 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (37): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), float32ToPcm16() (+29 more)

### Community 17 - "terminal-session.ts"
Cohesion: 0.05
Nodes (67): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame() (+59 more)

### Community 18 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (71): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+63 more)

### Community 19 - "oracle-voice.ts"
Cohesion: 0.06
Nodes (49): VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities, closeServers, exactArrayBuffer(), sockets (+41 more)

### Community 20 - "oracle-voice-engine.ts"
Cohesion: 0.05
Nodes (23): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+15 more)

### Community 21 - "oracle-voice-soak.ts"
Cohesion: 0.06
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 22 - "session-presentation.ts"
Cohesion: 0.06
Nodes (56): SessionExecutionMode, saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView (+48 more)

### Community 23 - "ManagerAgent"
Cohesion: 0.09
Nodes (14): FakeVoiceState, checkContent(), delay(), errorMessage(), isNotFound(), isPending(), isQueued(), ManagerAgent (+6 more)

### Community 24 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (31): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+23 more)

### Community 25 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+23 more)

### Community 26 - "oracle-voice-worker.ts"
Cohesion: 0.07
Nodes (28): VoiceEndUtterance, VoiceStartUtterance, BlockingEngine, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent() (+20 more)

### Community 27 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (14): headerSafe(), RemoteNodeClient, client(), servers, session, BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt (+6 more)

### Community 28 - "manager-agent.ts"
Cohesion: 0.07
Nodes (35): discover(), Rung, TURN_ACTIVITY, ago(), attentionRank(), buildTurnContext(), changeLines(), clock() (+27 more)

### Community 29 - "manager-tools.ts"
Cohesion: 0.07
Nodes (30): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), trustFolder() (+22 more)

### Community 30 - "ManagerAssistant.tsx"
Cohesion: 0.06
Nodes (41): ManagerSessionRef, cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage() (+33 more)

### Community 31 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 32 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (41): RealVoiceState, benchmarkFixture(), benchmarkGroup(), BenchmarkMetric, BenchmarkProfile, buildConfig(), CliOptions, clockTicksPerSecond() (+33 more)

### Community 33 - "agent-service.ts"
Cohesion: 0.04
Nodes (48): AcceptedSdkReply, ActivePrompt, ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime, DeliveryBoundary (+40 more)

### Community 34 - "session-reply-durability.test.ts"
Cohesion: 0.08
Nodes (21): persistedFormAnswer(), TerminalFormContinuation, answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture() (+13 more)

### Community 35 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (12): copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), tmuxSessionExists() (+4 more)

### Community 36 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (39): executeCommand(), listWorkspace(), readWorkspaceFile(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+31 more)

### Community 37 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 38 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 39 - ".sendInternal"
Cohesion: 0.12
Nodes (34): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), composerHoldsOtherText(), composerHoldsText(), composerText() (+26 more)

### Community 41 - "terminal-startup-queue.test.ts"
Cohesion: 0.11
Nodes (35): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, client(), disk (+27 more)

### Community 42 - "pwa.ts"
Cohesion: 0.09
Nodes (37): AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+29 more)

### Community 43 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 44 - "PushNotificationService"
Cohesion: 0.11
Nodes (13): brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, RFC-8030, RFC-8030 (+5 more)

### Community 45 - "ManagerStore"
Cohesion: 0.09
Nodes (10): openStore(), emptyState(), ManagerStore, messageSource(), storedMessage(), open(), createManager(), StoredManager (+2 more)

### Community 46 - "shell.ts"
Cohesion: 0.10
Nodes (33): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+25 more)

### Community 47 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 48 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 49 - "session-knowledge-routes.test.ts"
Cohesion: 0.08
Nodes (19): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+11 more)

### Community 50 - "oracle-voice-routes.ts"
Cohesion: 0.11
Nodes (33): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+25 more)

### Community 51 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 52 - "hub-routes.ts"
Cohesion: 0.07
Nodes (35): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+27 more)

### Community 53 - "FakeVoiceEngine"
Cohesion: 0.09
Nodes (15): voiceBackend(), FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine (+7 more)

### Community 54 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, fastify, @fastify/multipart, @fastify/websocket, ffprobe-static, dependencies (+27 more)

### Community 55 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 56 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (15): ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail() (+7 more)

### Community 57 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 58 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 59 - "manager-routes.ts"
Cohesion: 0.09
Nodes (17): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+9 more)

### Community 60 - "active-sessions.ts"
Cohesion: 0.12
Nodes (31): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+23 more)

### Community 61 - "oracle-voice-config.ts"
Cohesion: 0.10
Nodes (24): engine, integerEnvironment(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger(), canonicalPath(), ExternalPiperVoiceConfig (+16 more)

### Community 62 - "FakeSocket"
Cohesion: 0.07
Nodes (9): defaultDependencies(), OracleVoiceClientDependencies, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse() (+1 more)

### Community 63 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 64 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (25): paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), submitTerminalForm(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture() (+17 more)

### Community 65 - "session-resource-providers.test.ts"
Cohesion: 0.08
Nodes (27): ClaudeSdk, directories, fixture(), queryHandle(), services, waitForIdle(), disk, EnqueueCase (+19 more)

### Community 66 - "VoiceSessionError"
Cohesion: 0.20
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 67 - "SessionOrderStore"
Cohesion: 0.15
Nodes (13): start(), directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey() (+5 more)

### Community 68 - "oracle-voice-security.test.ts"
Cohesion: 0.09
Nodes (18): FakeVoiceEngineCall, apps, config, configFixture(), connect(), Inbox, issueTicket(), localRuntime() (+10 more)

### Community 69 - "tmux-errors.integration.test.ts"
Cohesion: 0.09
Nodes (21): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer(), noTmuxServer() (+13 more)

### Community 70 - "VoicePlayback"
Cohesion: 0.13
Nodes (6): pcm16ToFloat(), SegmentDrain, FakeSource, harness(), validateGeneration(), VoicePlayback

### Community 71 - "KnowledgeStore"
Cohesion: 0.16
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 73 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (24): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus() (+16 more)

### Community 74 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 75 - "oracle-voice-segments.ts"
Cohesion: 0.13
Nodes (20): alignCandidateSequences(), AlignmentCost, CandidateAlignment, candidateSubstitutionCost(), capSegment(), collectProseBlocks(), EmittedCandidate, extractSpeakableSegments() (+12 more)

### Community 76 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 77 - "remote-voice-client.ts"
Cohesion: 0.19
Nodes (10): VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), RemoteVoiceClient, RemoteVoiceClientOptions (+2 more)

### Community 78 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 79 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 80 - "recordValue"
Cohesion: 0.21
Nodes (20): activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength() (+12 more)

### Community 81 - "agent-service.test.ts"
Cohesion: 0.12
Nodes (14): foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), terminalFormSteps(), configurableModel(), directories, FakeCopilotClient (+6 more)

### Community 82 - "PromptCards.tsx"
Cohesion: 0.13
Nodes (16): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+8 more)

### Community 83 - "normalizeKnowledgeRelativePath"
Cohesion: 0.17
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), pathRecordSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+10 more)

### Community 84 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (13): phases, port, createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address (+5 more)

### Community 85 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 86 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 87 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 88 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema, PersistedBinding (+11 more)

### Community 89 - "terminal-form-deadline.test.ts"
Cohesion: 0.12
Nodes (14): build(), trusted, question(), actions, clippedPane(), closedPane, commitKeys, committed (+6 more)

### Community 90 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 91 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 92 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 93 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 94 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 95 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 96 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 98 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 99 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 100 - "react"
Cohesion: 0.14
Nodes (8): react, drawDiagram(), drawing, MermaidDiagram(), SessionActions(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 101 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 102 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 103 - "backgroundTasksFromEvents"
Cohesion: 0.27
Nodes (17): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventTask(), executionModeValue(), isTerminalTaskStatus(), mergeShellRefresh() (+9 more)

### Community 104 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 105 - "use-oracle-settings.ts"
Cohesion: 0.21
Nodes (12): getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps, models (+4 more)

### Community 106 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 107 - "workspace-fixtures.ts"
Cohesion: 0.16
Nodes (14): CONTEXT_EXAMPLE, documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureKnowledgeRoots (+6 more)

### Community 109 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 110 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 111 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 112 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 113 - "BackgroundTasksDialog.tsx"
Cohesion: 0.22
Nodes (11): BackgroundTask, DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel() (+3 more)

### Community 114 - "NewSessionDialog"
Cohesion: 0.22
Nodes (15): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), computerProviders() (+7 more)

### Community 115 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 116 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 117 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 118 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 119 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 120 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 122 - "promotion-monitor.test.ts"
Cohesion: 0.27
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 123 - "session-resource-clear.test.ts"
Cohesion: 0.17
Nodes (12): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+4 more)

### Community 124 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 125 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 126 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 127 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 128 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 129 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 130 - "server/side-question.ts"
Cohesion: 0.27
Nodes (8): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), sideQuestionPrompt(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH, SIDE_QUESTION_EARLIER_LIMIT, SIDE_QUESTION_MAX_LENGTH

### Community 131 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 132 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 133 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 135 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 136 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 137 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 138 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 139 - "submission-error.ts"
Cohesion: 0.39
Nodes (5): RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, SubmissionError, SubmissionReceipt

### Community 140 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 141 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 142 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 143 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 144 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 145 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 146 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 147 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 148 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 151 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **885 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+880 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1545 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `session-reply-durability.test.ts`, `contracts.ts`, `claude-agent-service.ts`, `remote-voice-client.ts`, `ManagedSession`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `session-reply-durability.test.ts`, `SessionDetail`, `contracts.ts`, `.isRetiredSession`, `session-store.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `contracts.ts`, `ProviderSessionService`, `claude-agent-service.ts`, `.isRetiredSession`, `RemoteNodeClient`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _885 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03694056358039308 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.023227132579650565 - nodes in this community are weakly interconnected._
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
- `.gitignore`
- `.superpowers/sdd/2026-10-16-oracle-conversation-mode/task-10-report.md`
- `.superpowers/sdd/2026-10-16-oracle-conversation-mode/task-11-report.md`
- `.superpowers/sdd/2026-10-16-oracle-conversation-mode/task-12-report.md`
- `.superpowers/sdd/2026-10-16-oracle-conversation-mode/task-9-report.md`
- `LICENSE`
- `README.md`
- `SECURITY.md`
- `config/agentic-remote-promotion.env.example`
- `config/oracle-voice-profiles.json`
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
- `docs/licenses/oracle-voice.md`
- `docs/mockups/activity-view.html`
- `docs/mockups/brand-logo.html`
- `docs/native-shell.md`
- `docs/oracle-conversation.md`
- `docs/provider-compatibility.md`
- `docs/sdk-architecture-roadmap.md`
- `docs/slash-command-feedback.md`
- `docs/superpowers/plans/2026-10-16-oracle-conversation-mode.md`
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
