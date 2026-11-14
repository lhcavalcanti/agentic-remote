# Agentic Remote - Graphify code map

Snapshot: `5c51b8e1003468d645ffed4c16e71e1ac34c31929147a6046956cbfdbeb7b0e7`

Source checkout: `63538390f28613cddcb03e0be82822e28c82b1ee`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 447 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 447 files · ~928,567 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7527 nodes · 20861 edges · 237 communities (189 shown, 30 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1078 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- api.ts
- AgentService
- App.tsx
- App
- SessionDetail
- contracts.ts
- .get
- app.ts
- agent-service.ts
- ManagerAssistant.tsx
- ManagedSession
- ClaudeAgentService
- manager-agent.ts
- oracle-voice-soak.ts
- CopilotClientLike
- background-task-adapter.ts
- agentic-remote-promotion-monitor
- ManagerAgent
- session-store.ts
- dreamer-store.ts
- workspace-fixtures.ts
- oracle-voice-child.ts
- terminal-session.ts
- claude-agent-service.ts
- node-routes.ts
- sessionKey
- oracle-voice-coordinator.ts
- PushNotificationService
- fake-voice.ts
- submitMessage
- OracleVoiceCoordinator
- oracle-voice-integration.test.ts
- queued-dispatch.test.ts
- oracle-voice-worker.ts
- SessionService
- manager-structured-memory-validation.ts
- RemoteNodeClient
- tmux-test-helpers.ts
- active-sessions.ts
- manager-agent.test.ts
- TmuxTerminalSessionController
- session-knowledge-store.ts
- .sendInternal
- session-knowledge-routes.test.ts
- DreamerService
- shared/settings-profile.ts
- oracle-voice.ts
- OracleDreamer.tsx
- oracle-task-store.ts
- oracle-voice-benchmark.ts
- session-directory.ts
- FakeVoiceEngine
- oracle-voice-session.ts
- dreamer-progress.ts
- agentic-remote
- agentic-remote-gate
- ManagerStore
- bundle
- pwa.ts
- OracleVoiceClient
- capture-workspace.ts
- buildApp
- TerminalSessionController
- ResidentVoiceWorker
- ProviderSessionService
- hub-routes.ts
- ManagerAttachment
- VoicePlayback
- terminal-startup-queue.test.ts
- manager-proactive-inbox.ts
- FakeSessionService
- shell.ts
- lib.rs
- VoiceCapture
- agentic-remote-promotion-setup
- oracle-voice-engine.ts
- dreamer-planner.ts
- dependencies
- devDependencies
- config.rs
- real-voice.ts
- settings-profile-store.ts
- KnowledgeStore
- manager-structured-memory.ts
- capture.ts
- createManagerTools
- oracle-voice-routes.ts
- manager-context.ts
- SessionOrderStore
- client.test.ts
- manager-structured-memory-search.ts
- oracle-voice-segments.ts
- recovery-resend-durability.test.ts
- oracle-voice-security.test.ts
- dreamer-service.ts
- terminal-session.test.ts
- ManagerProactiveCoordinator
- send-matrix.integration.test.ts
- session-patch-browser.ts
- cli-canary.ts
- .observe
- ManagerStructuredMemoryStore
- manager-tools.ts
- knowledge-tree.ts
- scripts
- oracle-voice-config.ts
- registerSessionKnowledgeRoutes
- use-markdown-document.ts
- BackgroundTasksDialog.tsx
- compilerOptions
- manager-routes.ts
- VoiceClientControl
- session-reply-durability.test.ts
- SettingsProfileClient
- HubEvent
- ManagerProactiveInbox
- oracle-voice-tickets.ts
- renderer.ts
- compilerOptions
- full-gate.test.ts
- normalizeKnowledgeRelativePath
- session-store-providers.test.ts
- pipeline.ts
- compilerOptions
- BackgroundTaskSnapshot
- OnlineRecognizer
- client.ts
- markdown-navigation.ts
- MessageTime.tsx
- compilerOptions
- compilerOptions
- dreamer-schedule.ts
- ManagerMemory
- WorkspaceDialog
- capture
- SessionStatus
- promotion-monitor.test.ts
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- terminal-form-deadline.test.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- SessionResources.tsx
- package.json
- scripts
- manager-runtime.ts
- resolveSession
- oracle-voice-assets.test.ts
- use-oracle-settings.ts
- pipeline.test.tsx
- fake-vad.ts
- desktop.json
- NewSessionDialog
- theme-contrast.test.ts
- OracleVoiceClientOptions
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- session-resource-clear.test.ts
- send-policy.test.ts
- PromptCards.tsx
- Pcm16Resampler
- dreamer-service.test.ts
- ManagerStructuredMemoryRuntime
- manager-structured-memory-performance.test.ts
- ChatMessage
- session-response-order.ts
- html-preview.ts
- sign-in-expired.pw.ts
- DocumentHeading
- dataset
- generate-pwa-icons.ts
- bridge.rs
- use-markdown-document.test.tsx
- vite.config.ts
- KnowledgePosition
- dreamer-routes.ts
- promotion-setup-execution.test.ts
- SessionAdmissions
- OracleVoiceClientDependencies
- release-publication.test.ts
- UserInputFieldControl
- OracleVoicePlayback
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- whyCloseMustAsk
- MarkdownCodeBlock.tsx
- manager-tools.test.ts
- VoiceServerControl
- promotion-setup.test.ts
- SessionKnowledgeLifecycle
- settings-profile-routes.test.ts
- appearance.ts
- MemoryStorage
- FakeRecorder
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- .sendMessage
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
1. `App()` - 312 edges
2. `SessionDetail` - 310 edges
3. `AgentService` - 290 edges
4. `SessionStore` - 190 edges
5. `ClaudeAgentService` - 126 edges
6. `ManagedSession` - 125 edges
7. `registerHubRoutes()` - 98 edges
8. `ManagerAgent` - 98 edges
9. `buildApp()` - 96 edges
10. `ComputerManager` - 89 edges

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

## Communities (237 total, 30 thin omitted)

### Community 0 - "api.ts"
Cohesion: 0.03
Nodes (136): httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionReceipt, addComputer(), addKnowledgeRoot(), askSession(), bootstrapSessionOrder() (+128 more)

### Community 1 - "AgentService"
Cohesion: 0.04
Nodes (9): agentMode(), AgentService, removeCopilotSessionFiles(), RuntimeConfigurationError, suspendedRuntimeConflict(), copilot(), terminalClearFixture(), TranscriptObservation (+1 more)

### Community 2 - "App.tsx"
Cohesion: 0.02
Nodes (108): NewSessionBackendSetting, AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+100 more)

### Community 3 - "App"
Cohesion: 0.03
Nodes (123): isManagerEvent(), sessionFileValidationError(), replyPermission(), saveHiddenSessionVisibility(), saveSessionHidden(), saveSessionVisibility(), App(), adoptConversationReplacement() (+115 more)

### Community 4 - "SessionDetail"
Cohesion: 0.04
Nodes (18): fixture(), channels, directories, fixture(), observe(), canArchiveSession(), directories, fixture() (+10 more)

### Community 5 - "contracts.ts"
Cohesion: 0.03
Nodes (68): ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, directories, voiceControlQueues, voiceControlWaiters (+60 more)

### Community 6 - ".get"
Cohesion: 0.05
Nodes (15): isTerminalNotReadyRefusal(), isUncertainDelivery(), lifecycleRefusal(), sessionInUseConflictMessage(), suspendRefused(), terminalAnswerRefused(), ownsDispatchRecovery(), preflight() (+7 more)

### Community 7 - "app.ts"
Cohesion: 0.03
Nodes (64): BuildAppOptions, ClientPresence, PRESENCE_TTL_MS, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf() (+56 more)

### Community 8 - "agent-service.ts"
Cohesion: 0.04
Nodes (88): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+80 more)

### Community 9 - "ManagerAssistant.tsx"
Cohesion: 0.03
Nodes (85): automaticTurns(), event(), react, formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents() (+77 more)

### Community 10 - "ManagedSession"
Cohesion: 0.07
Nodes (14): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, ManagerHub, ManagerProactiveCoordinatorOptions (+6 more)

### Community 11 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (25): ClaudeAgentService, ClaudeSdk, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services (+17 more)

### Community 12 - "manager-agent.ts"
Cohesion: 0.04
Nodes (58): apps, directories, DreamerProgressView, DreamerServiceOptions, ManagerEventSource, automaticPayload(), discover(), isPending() (+50 more)

### Community 13 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (36): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+28 more)

### Community 14 - "CopilotClientLike"
Cohesion: 0.03
Nodes (55): CopilotClientLike, CopilotSessionLike, foregroundTurnOpen(), directories, fakeClient(), fixture(), ForkRequest, forkSession() (+47 more)

### Community 15 - "background-task-adapter.ts"
Cohesion: 0.06
Nodes (71): DeferredSession, addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText() (+63 more)

### Community 16 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 17 - "ManagerAgent"
Cohesion: 0.08
Nodes (12): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, uniqueManagerSessionRefs() (+4 more)

### Community 18 - "session-store.ts"
Cohesion: 0.04
Nodes (62): connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite() (+54 more)

### Community 19 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (41): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+33 more)

### Community 20 - "workspace-fixtures.ts"
Cohesion: 0.04
Nodes (50): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+42 more)

### Community 21 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (47): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, createVoiceWorker(), defaultSpawnPiper(), errorMessage() (+39 more)

### Community 22 - "terminal-session.ts"
Cohesion: 0.05
Nodes (70): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus(), composerHoldsOtherText(), composerHoldsText() (+62 more)

### Community 23 - "claude-agent-service.ts"
Cohesion: 0.08
Nodes (55): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+47 more)

### Community 24 - "node-routes.ts"
Cohesion: 0.04
Nodes (48): ActiveBackendSession, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema (+40 more)

### Community 25 - "sessionKey"
Cohesion: 0.06
Nodes (60): saveSessionOrderLane(), handleDragEnd(), openSessionResources(), RenameSessionDialog(), SessionResourcesDialog(), KnowledgeRootSelector(), root, HiddenSessions (+52 more)

### Community 26 - "oracle-voice-coordinator.ts"
Cohesion: 0.04
Nodes (37): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnection (+29 more)

### Community 27 - "PushNotificationService"
Cohesion: 0.07
Nodes (29): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+21 more)

### Community 28 - "fake-voice.ts"
Cohesion: 0.05
Nodes (11): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice() (+3 more)

### Community 29 - "submitMessage"
Cohesion: 0.07
Nodes (65): submissionReceiptFromError(), activeComposerPastes(), appendComposerForKey(), applySession(), attachmentsInContent(), cancelQueuedPromptEdit(), composerChanged(), composerKeyDown() (+57 more)

### Community 30 - "OracleVoiceCoordinator"
Cohesion: 0.09
Nodes (5): errorMessage(), OracleVoiceCoordinator, PendingFinalTurn, withTimeout(), VoiceTurnState

### Community 31 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+23 more)

### Community 32 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (35): nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), preparePrompt() (+27 more)

### Community 33 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (24): benchmarkGroup(), VoiceTtsEngine, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent(), isEnabledConfig() (+16 more)

### Community 34 - "SessionService"
Cohesion: 0.06
Nodes (12): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, isSessionResourceRoute(), readServiceResources(), readSessionMcpServers() (+4 more)

### Community 35 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 36 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (12): RemoteNodeClient, client(), servers, session, RemoteNodeCapabilityError, RemoteNodeTransportError, NodeInfo, RemovedQueuedPrompt (+4 more)

### Community 37 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (47): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, [root], assertSameIdentity() (+39 more)

### Community 38 - "active-sessions.ts"
Cohesion: 0.07
Nodes (49): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+41 more)

### Community 39 - "manager-agent.test.ts"
Cohesion: 0.06
Nodes (25): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail(), FakeClient (+17 more)

### Community 40 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (16): startAgentAfterClear(), afterExit(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, formReplyExpired(), listTmuxSessions() (+8 more)

### Community 41 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+22 more)

### Community 42 - ".sendInternal"
Cohesion: 0.10
Nodes (44): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity() (+36 more)

### Community 43 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (30): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+22 more)

### Community 44 - "DreamerService"
Cohesion: 0.11
Nodes (15): boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), safeRunError(), unavailableSnapshot(), uniqueSessionRefs() (+7 more)

### Community 45 - "shared/settings-profile.ts"
Cohesion: 0.07
Nodes (49): AccentSetting, AppearanceSetting, appearanceSettings, applySettingsChanges(), isRecord(), isSettingsRevision(), newSessionBackendSettings, NewSessionFoldersSetting (+41 more)

### Community 46 - "oracle-voice.ts"
Cohesion: 0.08
Nodes (39): apps, directories, capabilities, closeServers, exactArrayBuffer(), sockets, startFields, VoiceNode (+31 more)

### Community 47 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (44): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+36 more)

### Community 48 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (33): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+25 more)

### Community 49 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 50 - "session-directory.ts"
Cohesion: 0.09
Nodes (40): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, directories, runtimes, start(), trusted (+32 more)

### Community 51 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (23): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+15 more)

### Community 52 - "oracle-voice-session.ts"
Cohesion: 0.12
Nodes (16): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), outputBytes() (+8 more)

### Community 53 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 54 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 55 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 56 - "ManagerStore"
Cohesion: 0.09
Nodes (9): openStore(), emptyState(), ManagerStore, open(), createManager(), StoredManager, createManager(), SecurityManager (+1 more)

### Community 57 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 58 - "pwa.ts"
Cohesion: 0.09
Nodes (39): AppVersion, parseAppVersion(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+31 more)

### Community 59 - "OracleVoiceClient"
Cohesion: 0.15
Nodes (7): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, playbackClientError(), terminalCloseCode()

### Community 60 - "capture-workspace.ts"
Cohesion: 0.07
Nodes (28): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+20 more)

### Community 61 - "buildApp"
Cohesion: 0.07
Nodes (30): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), directories (+22 more)

### Community 62 - "TerminalSessionController"
Cohesion: 0.10
Nodes (7): persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, TerminalSessionController, PendingPermission, PendingUserInput, UserInputReplyInput

### Community 63 - "ResidentVoiceWorker"
Cohesion: 0.12
Nodes (9): combinedTranscript(), matchesCancelled(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceGenerationIdentity, VoiceSynthesisRequest, ActiveSynthesisIdentity (+1 more)

### Community 65 - "hub-routes.ts"
Cohesion: 0.06
Nodes (40): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+32 more)

### Community 66 - "ManagerAttachment"
Cohesion: 0.11
Nodes (28): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+20 more)

### Community 67 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 68 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (30): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+22 more)

### Community 69 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), DISPOSITIONS, emptyState(), hasExactKeys(), isDisposition(), isEventKind(), isId(), isOrigin() (+29 more)

### Community 70 - "FakeSessionService"
Cohesion: 0.07
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 71 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 72 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 73 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 74 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 75 - "oracle-voice-engine.ts"
Cohesion: 0.08
Nodes (13): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, EnabledOracleVoiceConfig, FakeVoiceEngineFactory (+5 more)

### Community 76 - "dreamer-planner.ts"
Cohesion: 0.10
Nodes (31): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+23 more)

### Community 77 - "dependencies"
Cohesion: 0.05
Nodes (37): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, ffprobe-static, @github/copilot-sdk, dependencies (+29 more)

### Community 78 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 79 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 80 - "real-voice.ts"
Cohesion: 0.08
Nodes (14): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+6 more)

### Community 81 - "settings-profile-store.ts"
Cohesion: 0.11
Nodes (17): WorkspaceFixtureState, profileStore(), SettingsProfileState, SettingsProfileStore, directories, store(), applySettingsImport(), isSettingsDeviceId() (+9 more)

### Community 82 - "KnowledgeStore"
Cohesion: 0.12
Nodes (14): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+6 more)

### Community 83 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (29): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+21 more)

### Community 84 - "capture.ts"
Cohesion: 0.07
Nodes (17): BufferedFrame, defaultAudioContext(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode (+9 more)

### Community 85 - "createManagerTools"
Cohesion: 0.10
Nodes (3): createManagerTools(), closeCapReached(), ManagerToolHost

### Community 86 - "oracle-voice-routes.ts"
Cohesion: 0.13
Nodes (30): sendNodeVoiceOutput(), limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode() (+22 more)

### Community 87 - "manager-context.ts"
Cohesion: 0.13
Nodes (26): ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine(), followUpLine() (+18 more)

### Community 88 - "SessionOrderStore"
Cohesion: 0.14
Nodes (13): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+5 more)

### Community 89 - "client.test.ts"
Cohesion: 0.08
Nodes (10): HUB_SIGN_IN_EXPIRED_MESSAGE, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 90 - "manager-structured-memory-search.ts"
Cohesion: 0.11
Nodes (26): DreamerMemoryMetadataRecord, authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord() (+18 more)

### Community 91 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 92 - "recovery-resend-durability.test.ts"
Cohesion: 0.08
Nodes (22): fixture(), holdProbe(), fixtures, gate(), releases, restart(), sdkPermissionEvents(), sdkRecoveryEvents() (+14 more)

### Community 93 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (18): FakeVoiceEngineCall, VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), issueTicket(), localRuntime() (+10 more)

### Community 94 - "dreamer-service.ts"
Cohesion: 0.12
Nodes (25): DreamerPlanDraft, DreamerPlannerInput, DreamerFollowUp, DreamerPlannerExecutionInput, DreamerCoverageIncrement, DreamerPlanWithFingerprints, DreamerStoreSnapshot, DreamerStoreState (+17 more)

### Community 95 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (23): parseTerminalUpdateNotice(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), deliveryFixture(), desktopInstallPane, directories, downloadedUpdateFooter (+15 more)

### Community 96 - "ManagerProactiveCoordinator"
Cohesion: 0.17
Nodes (6): batchMessageId(), isTerminal(), lifecycles(), ManagerProactiveCoordinator, fixture(), managed()

### Community 97 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (24): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+16 more)

### Community 98 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 99 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 100 - ".observe"
Cohesion: 0.13
Nodes (13): canonicalHash(), cloneState(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError (+5 more)

### Community 101 - "ManagerStructuredMemoryStore"
Cohesion: 0.21
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 102 - "manager-tools.ts"
Cohesion: 0.08
Nodes (26): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, computerField, ContextTier, trustFolder(), CreationRefusal, DECLINE_WORDS (+18 more)

### Community 103 - "knowledge-tree.ts"
Cohesion: 0.13
Nodes (24): WorkspaceEntry, cancelKnowledgeRestore(), collapseKnowledgeTree(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder(), openKnowledgeFolder(), refreshKnowledgeFolder() (+16 more)

### Community 104 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 105 - "oracle-voice-config.ts"
Cohesion: 0.14
Nodes (22): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+14 more)

### Community 106 - "registerSessionKnowledgeRoutes"
Cohesion: 0.14
Nodes (21): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+13 more)

### Community 107 - "use-markdown-document.ts"
Cohesion: 0.15
Nodes (19): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+11 more)

### Community 108 - "BackgroundTasksDialog.tsx"
Cohesion: 0.14
Nodes (19): changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame(), BackgroundTaskCard() (+11 more)

### Community 109 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 110 - "manager-routes.ts"
Cohesion: 0.12
Nodes (15): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+7 more)

### Community 111 - "VoiceClientControl"
Cohesion: 0.22
Nodes (9): closeReason(), exactArrayBuffer(), rawDataBuffer(), remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient, RemoteVoiceDisconnectError, sendSocket() (+1 more)

### Community 112 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+11 more)

### Community 113 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 114 - "HubEvent"
Cohesion: 0.15
Nodes (10): Connection, ComputerManagerEvents, Client, PatchSocket, Browser, seedOffset, HubEvent, HubResyncRequest (+2 more)

### Community 115 - "ManagerProactiveInbox"
Cohesion: 0.20
Nodes (6): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 116 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 117 - "renderer.ts"
Cohesion: 0.14
Nodes (11): render, scope, DocumentRenderEvent, createWorkerRenderer(), defaultDocumentRenderer(), RendererWorker, synchronousRenderer, FakeWorker (+3 more)

### Community 118 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 119 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 120 - "normalizeKnowledgeRelativePath"
Cohesion: 0.19
Nodes (17): knowledgeFileSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath() (+9 more)

### Community 121 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), disk, event(), fixture(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 122 - "pipeline.ts"
Cohesion: 0.16
Nodes (20): holdingRenderer(), openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), documentOpening(), documentParts(), documentRenderEvents() (+12 more)

### Community 123 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 124 - "BackgroundTaskSnapshot"
Cohesion: 0.17
Nodes (8): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), hasRunningBackgroundAgent(), BackgroundTask, BackgroundTaskSnapshot

### Community 125 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 126 - "client.ts"
Cohesion: 0.13
Nodes (14): ORACLE_VOICE_CONNECTION_TIMEOUT_MS, closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, parseHello() (+6 more)

### Community 127 - "markdown-navigation.ts"
Cohesion: 0.19
Nodes (18): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+10 more)

### Community 128 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 129 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 130 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 131 - "dreamer-schedule.ts"
Cohesion: 0.23
Nodes (17): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+9 more)

### Community 132 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 133 - "WorkspaceDialog"
Cohesion: 0.17
Nodes (17): executeCommand(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), missingDocumentFragment() (+9 more)

### Community 134 - "capture"
Cohesion: 0.16
Nodes (18): releaseRecording(), shortcutKeys(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode(), keyLabel() (+10 more)

### Community 135 - "SessionStatus"
Cohesion: 0.12
Nodes (13): DreamerProgressEntry, ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, PersistedCursor, fsHooks, ReadGate, readState(), statePath() (+5 more)

### Community 136 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 137 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 138 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 139 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 140 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 141 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 142 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 143 - "SessionResources.tsx"
Cohesion: 0.14
Nodes (12): ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, Catalog, CatalogResult, sourceLabels (+4 more)

### Community 144 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 145 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 146 - "manager-runtime.ts"
Cohesion: 0.24
Nodes (11): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+3 more)

### Community 147 - "resolveSession"
Cohesion: 0.18
Nodes (10): define(), proactiveSessionAllowed(), requireComputer(), resolveSession(), structuredTools(), taskSessionAllowed(), errorMessage(), failure() (+2 more)

### Community 148 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 149 - "use-oracle-settings.ts"
Cohesion: 0.24
Nodes (12): getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+4 more)

### Community 150 - "pipeline.test.tsx"
Cohesion: 0.20
Nodes (9): components, drawn(), drawnPage(), fixtures, html(), today(), rehypeDocumentHeadings(), remarkSafeBreaks() (+1 more)

### Community 151 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 152 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 153 - "NewSessionDialog"
Cohesion: 0.22
Nodes (14): provider(), activateSession(), listDirectories(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession(), computerProviders(), DefaultSessionFolderControl() (+6 more)

### Community 154 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 155 - "OracleVoiceClientOptions"
Cohesion: 0.23
Nodes (3): OracleVoiceClientOptions, FakeVoiceClient, transcript()

### Community 156 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 157 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 158 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 159 - "session-resource-clear.test.ts"
Cohesion: 0.21
Nodes (12): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+4 more)

### Community 160 - "send-policy.test.ts"
Cohesion: 0.19
Nodes (11): SessionExecutionMode, terminalSendOptions(), TerminalSendPolicyInput, TerminalSendRequestOptions, booleans, combinations, executionModes, providers (+3 more)

### Community 161 - "PromptCards.tsx"
Cohesion: 0.21
Nodes (11): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+3 more)

### Community 162 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 164 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.23
Nodes (5): capturePrompt(), initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, ManagerStructuredMemoryMode, ManagerStructuredMemoryStatus

### Community 165 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.23
Nodes (7): benchmarkState(), now(), openFixture(), searchSamples(), isMissing(), ManagerStructuredMemoryRecoveryError, open()

### Community 166 - "ChatMessage"
Cohesion: 0.21
Nodes (10): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp(), StoredSession, ChatMessage (+2 more)

### Community 167 - "session-response-order.ts"
Cohesion: 0.29
Nodes (10): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+2 more)

### Community 168 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 169 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 170 - "DocumentHeading"
Cohesion: 0.20
Nodes (6): DocumentViewControls(), actions, outline, RenderedDocumentTree, MarkdownDocumentView, DocumentHeading

### Community 171 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 172 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 173 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 174 - "use-markdown-document.test.tsx"
Cohesion: 0.22
Nodes (4): DocumentRenderer, DocumentRendererContext, components, show()

### Community 175 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 176 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 177 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 178 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 181 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 182 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 184 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 185 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 186 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 187 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 189 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 190 - "manager-tools.test.ts"
Cohesion: 0.40
Nodes (3): claudeModels, computers, copilotModels

### Community 191 - "VoiceServerControl"
Cohesion: 0.50
Nodes (4): SocketMessage, connect(), Inbox, VoiceServerControl

### Community 192 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 194 - "settings-profile-routes.test.ts"
Cohesion: 0.50
Nodes (4): directories, fakeManager(), hub(), local

### Community 195 - "appearance.ts"
Cohesion: 0.50
Nodes (3): Appearance, appearanceFrom(), appearanceStorageKey

## Knowledge Gaps
- **1255 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1250 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2117 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `contracts.ts`, `app.ts`, `session-knowledge-routes.test.ts`, `VoiceClientControl`, `claude-agent-service.ts`, `TerminalSessionController`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `ManagerStructuredMemoryStore` connect `ManagerStructuredMemoryStore` to `manager-structured-memory-search.ts`, `ManagerStructuredMemoryRuntime`, `manager-structured-memory-performance.test.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1255 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.028623585250091274 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.04115472979722305 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.02295567544694806 - nodes in this community are weakly interconnected._
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
