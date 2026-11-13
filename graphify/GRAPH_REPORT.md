# Agentic Remote - Graphify code map

Snapshot: `617f3c2c04b4ccbf39e6281afa52e3ae350d19e96e4cd63670af394cce721970`

Source checkout: `ab8a21d1e3005d75499b93f1efe7f7781b97b86b`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 442 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 442 files · ~919,869 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7485 nodes · 20758 edges · 230 communities (184 shown, 28 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1075 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- contracts.ts
- api.ts
- .get
- App.tsx
- SessionStore
- oracle-voice-session.ts
- ClaudeAgentService
- AgentService
- app.ts
- manager-tools.ts
- claude-agent-service.ts
- manager.ts
- background-task-adapter.ts
- SessionDetail
- oracle-voice-soak.ts
- oracle-voice-child.ts
- agentic-remote-promotion-monitor
- dreamer-store.ts
- ManagedSession
- workspace-fixtures.ts
- CopilotSessionLike
- session-store.ts
- sessionKey
- agent-service.ts
- oracle-voice-worker.ts
- ManagerAgent
- transcription-service.ts
- terminal-session.ts
- oracle-voice-security.test.ts
- oracle-voice-integration.test.ts
- pwa.ts
- manager-agent.ts
- tmux-test-helpers.ts
- HubEvent
- .recoverSdkSession
- manager-structured-memory-validation.ts
- oracle-task-store.ts
- SessionService
- PushNotificationService
- shared/settings-profile.ts
- DreamerService
- oracle-voice.ts
- active-sessions.ts
- oracle-voice-coordinator.ts
- TmuxTerminalSessionController
- session-directory.ts
- dreamer-progress.ts
- .sendInternal
- OracleDreamer.tsx
- agentic-remote
- dreamer-planner.ts
- send-matrix.integration.test.ts
- node-routes.ts
- agentic-remote-gate
- oracle-voice-benchmark.ts
- manager-agent.test.ts
- ManagerStore
- ManagerAssistant.tsx
- OracleVoiceClient
- bundle
- FakeSessionService
- oracle-voice-routes.ts
- ProviderSessionService
- tmux-errors.integration.test.ts
- VoicePlayback
- settings-profile-store.ts
- session-store-providers.test.ts
- ManagerProactiveCoordinator
- FakeVoiceController
- VoiceClientControl
- shell.ts
- lib.rs
- agentic-remote-promotion-setup
- hub-routes.ts
- manager-proactive-inbox.ts
- pipeline.test.tsx
- dependencies
- devDependencies
- config.rs
- manager-structured-memory.ts
- KnowledgeStore
- capture.ts
- manager-store.ts
- EngineVoiceBackendSession
- terminal-session.test.ts
- ManagerStructuredMemoryStore
- oracle-voice-child.test.ts
- remote-voice-client.ts
- SessionKnowledgeStore
- client.test.ts
- capture-workspace.ts
- SessionOrderStore
- session-patch-browser.ts
- session-reply-durability.test.ts
- VoiceCapabilities
- ManagerAssistant.test.tsx
- OracleVoiceCoordinator
- use-markdown-document.test.tsx
- cli-canary.ts
- .toolHost
- scripts
- session-knowledge-routes.test.ts
- oracle-voice-config.ts
- registerSessionKnowledgeRoutes
- SettingsProfileClient
- client.ts
- fake-voice.ts
- manager-structured-memory-search.ts
- compilerOptions
- pipeline.ts
- PromptCards.tsx
- oracle-voice-segments.ts
- oracle-voice-tickets.ts
- session-knowledge-store.ts
- use-oracle-attachments.ts
- compilerOptions
- react
- agent-service.test.ts
- dreamer-service.ts
- full-gate.test.ts
- .observe
- knowledge-tree.ts
- WorkspaceDialog
- compilerOptions
- ManagerProactiveInbox
- OnlineRecognizer
- SessionKnowledgeBinding
- markdown-navigation.ts
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- ManagerAttachment
- .withFormViewport
- normalizeKnowledgeRelativePath
- dreamer-schedule.ts
- promotion-monitor.test.ts
- NewSessionDialog
- terminal-startup-queue.test.ts
- BoundedQueue
- ReaderWorkspace
- .correct
- .confirmSpeech
- terminal-form-deadline.test.ts
- session-latency-benchmark.ts
- session-resource-routes.test.ts
- package.json
- scripts
- oracle-voice-assets.test.ts
- .handleBackendOutput
- use-oracle-settings.ts
- pending-echo.ts
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- dreamer-service.test.ts
- manager-proactive-inbox.test.ts
- Pcm16Resampler
- document-render.pw.ts
- VoiceTurnState
- recovery-seed-guards.test.ts
- session-response-order.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- sign-in-expired.pw.ts
- dataset
- generate-pwa-icons.ts
- ManagerProactiveInboxValidationError
- SpeakableSegmenter
- bridge.rs
- askSession
- vite.config.ts
- dreamer-routes.ts
- promotion-setup-execution.test.ts
- SessionAdmissions
- OracleVoiceClientDependencies
- recovery-context.ts
- release-publication.test.ts
- UserInputFieldControl
- sent-message.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- DocumentViewControls.tsx
- composer-layout.test.ts
- VoiceServerControl
- usePanelWidth
- promotion-setup.test.ts
- SessionKnowledgeLifecycle
- FakeRecorder
- terminal-send-uncertainty.test.ts
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- @fastify/multipart
- @fastify/static
- @fastify/websocket
- ffmpeg-static
- hast-util-to-jsx-runtime
- html-url-attributes
- lucide-react
- onnxruntime-web
- mermaid
- pdfjs-dist
- unified
- unist-util-visit
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 310 edges
2. `App()` - 308 edges
3. `AgentService` - 290 edges
4. `SessionStore` - 190 edges
5. `ClaudeAgentService` - 126 edges
6. `ManagedSession` - 125 edges
7. `ManagerAgent` - 98 edges
8. `buildApp()` - 96 edges
9. `registerHubRoutes()` - 96 edges
10. `ComputerManager` - 89 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `FakeVoiceState` --references--> `ManagerMessage`  [EXTRACTED]
  e2e/fixtures/fake-voice.ts → shared/manager.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `DreamerStoreState` --references--> `DreamerSettings`  [EXTRACTED]
  server/dreamer-store.ts → shared/dreamer.ts
- `knowledgeRelativePathSchema` --calls--> `normalizeKnowledgeRelativePath()`  [EXTRACTED]
  server/hub-routes.ts → shared/knowledge-path.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (230 total, 28 thin omitted)

### Community 0 - "App"
Cohesion: 0.03
Nodes (172): isManagerEvent(), alertNotification(), terminalSendOptions(), sessionFileValidationError(), SettingsChange, clearConversation(), readKnowledgeFile(), recoverConversation() (+164 more)

### Community 1 - "contracts.ts"
Cohesion: 0.02
Nodes (92): AgentServiceEvents, CreationRuntime, ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, directories (+84 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (133): AddKnowledgeRootInput, PushSettings, SessionKnowledgeRootMutationInput, parseSubmissionReceipt(), submissionReceiptFromError(), addComputer(), addKnowledgeRoot(), bootstrapSessionOrder() (+125 more)

### Community 3 - ".get"
Cohesion: 0.04
Nodes (16): agentMode(), commandShortcut(), isTerminalNotReadyRefusal(), lifecycleRefusal(), normalizedTitle(), permissionTitle(), sessionInUseConflictMessage(), stripAnsi() (+8 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (122): PushPolicy, ActivityStatus, NotificationScope, SettingsProfileKey, SettingsProfileValues, AccentTheme, accentThemes, activityKindFromMessage() (+114 more)

### Community 5 - "SessionStore"
Cohesion: 0.04
Nodes (61): storage(), fixture(), holdProbe(), fixtures, gate(), releases, restart(), sdkPermissionEvents() (+53 more)

### Community 6 - "oracle-voice-session.ts"
Cohesion: 0.03
Nodes (63): clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics, registerControlRoutes() (+55 more)

### Community 7 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (23): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services (+15 more)

### Community 8 - "AgentService"
Cohesion: 0.05
Nodes (16): AgentService, foregroundTurnOpen(), isUncertainDelivery(), persistedFormAnswer(), removeCopilotSessionFiles(), RuntimeConfigurationError, suspendedRuntimeConflict(), TerminalFormContinuation (+8 more)

### Community 9 - "app.ts"
Cohesion: 0.03
Nodes (62): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+54 more)

### Community 10 - "manager-tools.ts"
Cohesion: 0.04
Nodes (53): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+45 more)

### Community 11 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (63): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, releases (+55 more)

### Community 12 - "manager.ts"
Cohesion: 0.04
Nodes (38): FakeManager, apps, directories, ManagerEventSource, ProactiveManager, FakeAgent, confirmationSchema, defaultsSchema (+30 more)

### Community 13 - "background-task-adapter.ts"
Cohesion: 0.05
Nodes (74): DeferredSession, addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText() (+66 more)

### Community 14 - "SessionDetail"
Cohesion: 0.06
Nodes (8): AcceptedSdkReply, PendingClaudeReply, observe(), assertSessionNotRetained(), clearRecoverySeedFailure(), QueuedPrompt, SessionDetail, SessionSummary

### Community 15 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 16 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (42): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+34 more)

### Community 17 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 18 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (45): publicSnapshot(), assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+37 more)

### Community 19 - "ManagedSession"
Cohesion: 0.09
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, FakeManager (+5 more)

### Community 20 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (50): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+42 more)

### Community 21 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (36): CopilotSessionLike, CopilotTasksApi, openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery() (+28 more)

### Community 22 - "session-store.ts"
Cohesion: 0.03
Nodes (53): directories, fakeClient(), ForkRequest, forkSession(), services, TerminalDiscoveryError, fixtures, recoverAndSeed() (+45 more)

### Community 23 - "sessionKey"
Cohesion: 0.06
Nodes (61): saveSessionOrderLane(), failureStampFor(), handleDragEnd(), readSelectionFromLocation(), RenameSessionDialog(), SessionResourcesDialog(), KnowledgeRootSelector(), root (+53 more)

### Community 24 - "agent-service.ts"
Cohesion: 0.04
Nodes (54): ActivePrompt, ActivityToolStart, ansiSequence, CopilotClientLike, DeliveryBoundary, ElicitationContext, ElicitationHandler, ElicitationReply (+46 more)

### Community 25 - "oracle-voice-worker.ts"
Cohesion: 0.06
Nodes (27): benchmarkGroup(), VoiceSttEngine, VoiceTtsEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage() (+19 more)

### Community 26 - "ManagerAgent"
Cohesion: 0.09
Nodes (11): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, uniqueManagerSessionRefs() (+3 more)

### Community 27 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 28 - "terminal-session.ts"
Cohesion: 0.05
Nodes (63): afterExit(), boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus() (+55 more)

### Community 29 - "oracle-voice-security.test.ts"
Cohesion: 0.04
Nodes (31): voiceBackend(), FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceStartUtterance, BlockingCancelEngine (+23 more)

### Community 30 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (29): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+21 more)

### Community 31 - "pwa.ts"
Cohesion: 0.06
Nodes (54): checkHubSignIn(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+46 more)

### Community 32 - "manager-agent.ts"
Cohesion: 0.07
Nodes (43): DreamerProgressEntry, DreamerProgressView, automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions, messagePriority() (+35 more)

### Community 33 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (48): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, deliveryFixture(), [root] (+40 more)

### Community 34 - "HubEvent"
Cohesion: 0.06
Nodes (28): ComputerManagerEvents, HubEventSource, PushSender, PushState, RFC-8030, Client, apps, directories (+20 more)

### Community 35 - ".recoverSdkSession"
Cohesion: 0.08
Nodes (38): activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength() (+30 more)

### Community 36 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (52): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+44 more)

### Community 37 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (35): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+27 more)

### Community 38 - "SessionService"
Cohesion: 0.07
Nodes (16): closeReason(), closeVoiceSocket(), registerNodeRoutes(), apps, directories, directory(), obstructUploads(), pairedFixture() (+8 more)

### Community 39 - "PushNotificationService"
Cohesion: 0.08
Nodes (22): brief(), OracleEventSource, PushNotificationService, directories, scoped(), RFC-8030, registerPushRoutes(), sessionMuteSchema (+14 more)

### Community 40 - "shared/settings-profile.ts"
Cohesion: 0.06
Nodes (48): profileStore(), AccentSetting, AppearanceSetting, appearanceSettings, DEFAULT_SESSION_PROVIDER, isRecord(), isSettingsDeviceId(), isSettingsProfileKey() (+40 more)

### Community 41 - "DreamerService"
Cohesion: 0.12
Nodes (13): boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), safeRunError(), unavailableSnapshot(), uniqueSessionRefs() (+5 more)

### Community 42 - "oracle-voice.ts"
Cohesion: 0.08
Nodes (40): exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), capabilities, closeServers, exactArrayBuffer(), sockets (+32 more)

### Community 43 - "active-sessions.ts"
Cohesion: 0.08
Nodes (43): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+35 more)

### Community 44 - "oracle-voice-coordinator.ts"
Cohesion: 0.06
Nodes (28): ManagerEventSource, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OracleVoiceBackendConnection, OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput (+20 more)

### Community 45 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (13): startAgentAfterClear(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand() (+5 more)

### Community 46 - "session-directory.ts"
Cohesion: 0.10
Nodes (36): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+28 more)

### Community 47 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 48 - ".sendInternal"
Cohesion: 0.11
Nodes (36): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerHoldsOtherText(), composerHoldsText(), composerText() (+28 more)

### Community 49 - "OracleDreamer.tsx"
Cohesion: 0.10
Nodes (38): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition, getDreamer() (+30 more)

### Community 50 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 51 - "dreamer-planner.ts"
Cohesion: 0.08
Nodes (39): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+31 more)

### Community 52 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (40): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+32 more)

### Community 53 - "node-routes.ts"
Cohesion: 0.06
Nodes (39): FileUploadError, registerFileUploadRoutes(), SessionParams, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+31 more)

### Community 54 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 55 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (38): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, deferred() (+30 more)

### Community 56 - "manager-agent.test.ts"
Cohesion: 0.07
Nodes (22): DreamerServiceOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers (+14 more)

### Community 57 - "ManagerStore"
Cohesion: 0.09
Nodes (11): openStore(), emptyState(), ManagerStore, open(), createManager(), createRealManager(), DeterministicManagerClient, deterministicManagerHub() (+3 more)

### Community 58 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (37): editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent() (+29 more)

### Community 59 - "OracleVoiceClient"
Cohesion: 0.15
Nodes (8): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError(), terminalCloseCode()

### Community 60 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 62 - "oracle-voice-routes.ts"
Cohesion: 0.09
Nodes (34): nodeVoiceCapabilities(), sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+26 more)

### Community 64 - "tmux-errors.integration.test.ts"
Cohesion: 0.08
Nodes (22): fixture(), managers, releases, remote, session(), ComputerRegistry, DurableRegisteredComputer, LegacyRegisteredComputer (+14 more)

### Community 65 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 66 - "settings-profile-store.ts"
Cohesion: 0.09
Nodes (18): WorkspaceFixtureState, SettingsProfileState, SettingsProfileStore, directories, store(), applySettingsChanges(), applySettingsImport(), SettingsProfileRecord (+10 more)

### Community 67 - "session-store-providers.test.ts"
Cohesion: 0.06
Nodes (27): ClaudeSdk, deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, disk (+19 more)

### Community 68 - "ManagerProactiveCoordinator"
Cohesion: 0.11
Nodes (13): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, SessionLifecycle, directories (+5 more)

### Community 69 - "FakeVoiceController"
Cohesion: 0.10
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 70 - "VoiceClientControl"
Cohesion: 0.13
Nodes (8): VoiceClientControl, captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 71 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 72 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 73 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 74 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 75 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isAlreadyExists(), isDisposition() (+29 more)

### Community 76 - "pipeline.test.tsx"
Cohesion: 0.11
Nodes (28): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+20 more)

### Community 77 - "dependencies"
Cohesion: 0.05
Nodes (37): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, ffprobe-static, @github/copilot-sdk, dependencies (+29 more)

### Community 78 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 79 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 80 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (31): ManagerStructuredMemorySearchIndex, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+23 more)

### Community 81 - "KnowledgeStore"
Cohesion: 0.12
Nodes (14): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+6 more)

### Community 82 - "capture.ts"
Cohesion: 0.07
Nodes (17): BufferedFrame, defaultAudioContext(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode (+9 more)

### Community 83 - "manager-store.ts"
Cohesion: 0.11
Nodes (18): JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), PersistedCursor, JournalDraft, JournalKind, ManagerState (+10 more)

### Community 84 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 85 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (26): isTerminalSessionInUsePrompt(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture() (+18 more)

### Community 86 - "ManagerStructuredMemoryStore"
Cohesion: 0.13
Nodes (12): benchmarkState(), now(), openFixture(), searchSamples(), initializeManagerStructuredMemory(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore (+4 more)

### Community 87 - "oracle-voice-child.test.ts"
Cohesion: 0.09
Nodes (12): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+4 more)

### Community 88 - "remote-voice-client.ts"
Cohesion: 0.16
Nodes (14): VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+6 more)

### Community 89 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (9): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+1 more)

### Community 90 - "client.test.ts"
Cohesion: 0.09
Nodes (9): OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse() (+1 more)

### Community 91 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 92 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 93 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 94 - "session-reply-durability.test.ts"
Cohesion: 0.12
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 95 - "VoiceCapabilities"
Cohesion: 0.12
Nodes (14): VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability (+6 more)

### Community 96 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (16): cancelManager(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability, empty (+8 more)

### Community 97 - "OracleVoiceCoordinator"
Cohesion: 0.15
Nodes (5): AudioCompletion, AudioGate, OracleVoiceCoordinator, resolvedAudioGate(), ActiveConversation

### Community 98 - "use-markdown-document.test.tsx"
Cohesion: 0.11
Nodes (12): DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), defaultDocumentRenderer(), DocumentRenderer, DocumentRendererContext, RendererWorker, synchronousRenderer (+4 more)

### Community 99 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 100 - ".toolHost"
Cohesion: 0.11
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 101 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 102 - "session-knowledge-routes.test.ts"
Cohesion: 0.08
Nodes (19): ServerRole, SessionMetadataLookup, directories, disk, gate(), gates, PublicSessionValue, runtimes (+11 more)

### Community 103 - "oracle-voice-config.ts"
Cohesion: 0.14
Nodes (22): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+14 more)

### Community 104 - "registerSessionKnowledgeRoutes"
Cohesion: 0.14
Nodes (21): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+13 more)

### Community 105 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 106 - "client.ts"
Cohesion: 0.09
Nodes (13): closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, OracleVoicePlayback, PendingHello (+5 more)

### Community 107 - "fake-voice.ts"
Cohesion: 0.09
Nodes (8): ActiveBackendSession, BrowserTestSessionService, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, execFileAsync, RealVoiceState

### Community 108 - "manager-structured-memory-search.ts"
Cohesion: 0.15
Nodes (21): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+13 more)

### Community 109 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 110 - "pipeline.ts"
Cohesion: 0.14
Nodes (21): holdingRenderer(), partlyHeldRenderer(), render, scope, documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform() (+13 more)

### Community 111 - "PromptCards.tsx"
Cohesion: 0.13
Nodes (15): PendingUserInput, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request, UserInputCard() (+7 more)

### Community 112 - "oracle-voice-segments.ts"
Cohesion: 0.16
Nodes (21): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+13 more)

### Community 113 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 114 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 115 - "use-oracle-attachments.ts"
Cohesion: 0.17
Nodes (19): codeExtensions, fileTypes, managerFileValidationError(), MAX_MANAGER_FILE_BYTES, MAX_MANAGER_TEXT_BYTES, textTypes, uploadManagerFile(), attachmentSize() (+11 more)

### Community 116 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 117 - "react"
Cohesion: 0.12
Nodes (10): react, SessionRetention, MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram(), drawing, MermaidDiagram() (+2 more)

### Community 118 - "agent-service.test.ts"
Cohesion: 0.14
Nodes (11): terminalFormSteps(), busyTerminal(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService(), services (+3 more)

### Community 119 - "dreamer-service.ts"
Cohesion: 0.19
Nodes (18): DreamerFollowUp, DreamerStoreSnapshot, OracleTaskFindingInput, DREAMER_PROGRESS_REFRESH_MS, DreamerPlan, DreamerPlanItemSource, DreamerProgressStatus, DreamerSettings (+10 more)

### Community 120 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 121 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 122 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 123 - "WorkspaceDialog"
Cohesion: 0.16
Nodes (19): executeCommand(), listWorkspace(), searchWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+11 more)

### Community 124 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 125 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 126 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 127 - "SessionKnowledgeBinding"
Cohesion: 0.18
Nodes (13): SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding() (+5 more)

### Community 128 - "markdown-navigation.ts"
Cohesion: 0.19
Nodes (18): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+10 more)

### Community 129 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 130 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 131 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 132 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 133 - "ManagerAttachment"
Cohesion: 0.24
Nodes (8): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), managerFileType(), ManagerAttachment

### Community 134 - ".withFormViewport"
Cohesion: 0.19
Nodes (14): FormReplyDeadlineError, hasClippedTerminalFormTabs(), hasTerminalFormQuestionReflowCandidate(), isTerminalLoading(), parseTerminalFormActiveField(), submitTerminalForm(), tabNames(), terminalBoxWrap() (+6 more)

### Community 135 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 136 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 137 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 138 - "NewSessionDialog"
Cohesion: 0.17
Nodes (18): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+10 more)

### Community 139 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (10): client(), delayQueueWrite(), disk, exec, gate(), holdQueueCommit(), NativeFixture, NativeRuntime (+2 more)

### Community 140 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 141 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 142 - ".correct"
Cohesion: 0.27
Nodes (6): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput

### Community 143 - ".confirmSpeech"
Cohesion: 0.25
Nodes (3): errorMessage(), OperationTimeoutError, withTimeout()

### Community 144 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 145 - "session-latency-benchmark.ts"
Cohesion: 0.23
Nodes (15): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+7 more)

### Community 146 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 147 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 148 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 149 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 151 - "use-oracle-settings.ts"
Cohesion: 0.24
Nodes (12): getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+4 more)

### Community 152 - "pending-echo.ts"
Cohesion: 0.24
Nodes (11): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, PendingEchoOwner, prunePendingEchoMap() (+3 more)

### Community 153 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 154 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 155 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 156 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 157 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 158 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 159 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 160 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 163 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 164 - "session-response-order.ts"
Cohesion: 0.29
Nodes (10): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+2 more)

### Community 165 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 166 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 167 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 168 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 169 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 170 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 171 - "SpeakableSegmenter"
Cohesion: 0.29
Nodes (3): SpeakableSegmenter, validateMessageId(), ./server/oracle-voice-segments.ts

### Community 172 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 173 - "askSession"
Cohesion: 0.29
Nodes (8): askSession(), askSideQuestion(), closeSideQuestion(), openSideQuestion(), sideQuestionKeyDown(), submitSideQuestion(), updateSideThread(), sideQuestionCommand()

### Community 174 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 175 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 176 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 179 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 180 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 181 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 182 - "sent-message.ts"
Cohesion: 0.50
Nodes (5): UserMessage, isLongSentMessage(), PauseFollowingContext, SentMessageContent(), thirteenLines

### Community 183 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 184 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 185 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 186 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 187 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 188 - "VoiceServerControl"
Cohesion: 0.40
Nodes (4): connect(), Inbox, rawBuffer(), VoiceServerControl

### Community 189 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 190 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1244 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1239 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2100 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SessionStore` connect `SessionStore` to `contracts.ts`, `.get`, `.recoverSdkSession`, `ManagerAttachment`, `AgentService`, `SessionDetail`, `CopilotSessionLike`, `session-store.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `contracts.ts` to `remote-voice-client.ts`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `ManagerStructuredMemoryStore` connect `ManagerStructuredMemoryStore` to `manager-structured-memory.ts`, `.correct`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1244 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.027502883856475018 - nodes in this community are weakly interconnected._
- **Should `contracts.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.024249349330286295 - nodes in this community are weakly interconnected._
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
- `docs/session-knowledge-api.md`
- `docs/session-retention.md`
- `docs/slash-command-feedback.md`
- `docs/superpowers/plans/2026-10-16-oracle-conversation-mode.md`
- `docs/superpowers/plans/2026-10-16-oracle-structured-memory.md`
- `docs/superpowers/plans/2026-10-20-copilot-sdk-cli-parity.md`
- `docs/superpowers/plans/2026-10-24-copilot-sdk-restart-recovery.md`
- `docs/superpowers/plans/2026-11-04-oracle-periodic-checks.md`
- `docs/superpowers/plans/2026-11-05-session-knowledge-api.md`
- `docs/superpowers/plans/2026-11-06-oracle-actionable-morning-plan.md`
- `docs/superpowers/plans/2026-11-07-dreamer-periodic-refresh.md`
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-17-oracle-proactive-lifecycle-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
- `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`
- `docs/superpowers/specs/2026-11-04-oracle-periodic-checks-design.md`
- `docs/superpowers/specs/2026-11-05-session-knowledge-api-design.md`
- `docs/superpowers/specs/2026-11-06-oracle-actionable-morning-plan-design.md`
- `docs/superpowers/specs/2026-11-07-dreamer-periodic-refresh-design.md`
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
