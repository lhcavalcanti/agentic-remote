# Agentic Remote - Graphify code map

Snapshot: `0e900d70154baff7628b45f965d23424461bcbcdb8f1b0bbe062594fd26a8ea0`

Source checkout: `e11d3854c17e83550a04118fc9974417947d4b03`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 415 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 415 files · ~893,573 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7257 nodes · 20148 edges · 214 communities (175 shown, 23 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1060 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- SessionDetail
- App.tsx
- api.ts
- oracle-voice-session.ts
- contracts.ts
- agent-service.ts
- oracle-voice-child.ts
- ClaudeAgentService
- oracle-voice.ts
- claude-agent-service.ts
- OracleVoiceCoordinator
- ManagerAgent
- ManagerMessage
- app.ts
- manager-tools.ts
- agentic-remote-promotion-monitor
- oracle-voice-soak.ts
- dreamer-store.ts
- ManagedSession
- session-presentation.ts
- TerminalSessionController
- oracle-voice-worker.ts
- terminal-session.ts
- PushNotificationService
- workspace-fixtures.ts
- transcription-service.ts
- queued-dispatch.test.ts
- oracle-voice-integration.test.ts
- TmuxTerminalSessionController
- session-directory.ts
- client.test.ts
- ManagerStore
- manager-agent.ts
- RemoteNodeClient
- dreamer-progress.ts
- manager-structured-memory-validation.ts
- session-reply-durability.test.ts
- session-knowledge-routes.test.ts
- oracle-task-store.ts
- ManagerEvent
- session-enqueue-clear.test.ts
- shared/settings-profile.ts
- DreamerService
- session-knowledge-store.ts
- oracle-voice-benchmark.ts
- FakeVoiceEngine
- SessionService
- markdown-navigation.ts
- CopilotClientLike
- agentic-remote
- ProviderSessionService
- terminal-session.test.ts
- bundle
- settings-profile-store.ts
- recovery-resend-durability.test.ts
- ManagerAssistant.tsx
- FakeVoiceController
- send-matrix.integration.test.ts
- tmux-test-helpers.ts
- pwa.ts
- active-sessions.ts
- FakeSessionService
- EngineVoiceBackendSession
- cleanDialogLine
- OracleDreamer.tsx
- shell.ts
- lib.rs
- oracle-voice-config.ts
- dreamer-planner.ts
- agentic-remote-promotion-setup
- manager-proactive-inbox.ts
- agentic-remote-gate
- config.rs
- manager-structured-memory.ts
- hub-routes.ts
- KnowledgeStore
- dependencies
- devDependencies
- manager-structured-memory-search.ts
- oracle-voice-security.test.ts
- knowledge-tree.ts
- node-routes.ts
- manager-context.ts
- background-task-adapter.ts
- capture-workspace.ts
- dreamer-service.ts
- SessionOrderStore
- session-patch-browser.ts
- cli-canary.ts
- scripts
- registerSessionKnowledgeRoutes
- noTmuxServer
- SettingsProfileClient
- VoiceCapture
- compilerOptions
- manager-tools.test.ts
- ManagerStructuredMemoryStore
- oracle-voice-coordinator.test.ts
- oracle-voice-segments.ts
- OracleVoiceClient
- normalizeKnowledgeRelativePath
- oracle-voice-tickets.ts
- session-patches.test.ts
- compilerOptions
- full-gate.test.ts
- ComputerSummary
- .observe
- session-store-providers.test.ts
- PromptCards.tsx
- capture.ts
- FakeSocket
- compilerOptions
- ManagerProactiveInbox
- OnlineRecognizer
- MessageTime.tsx
- client.ts
- compilerOptions
- compilerOptions
- event-log.ts
- terminal-startup-queue.test.ts
- ManagerAssistant
- OracleVoiceClientError
- backgroundTasksFromEvents
- dreamer-schedule.ts
- promotion-monitor.test.ts
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- background-task-stop.test.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- terminal-form-deadline.test.ts
- scripts
- oracle-voice-assets.test.ts
- NewSessionDialog
- OracleVoiceClientOptions
- fake-vad.ts
- desktop.json
- DeferredSession
- theme-contrast.test.ts
- OracleSettings.tsx
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- manager-proactive-inbox.test.ts
- use-oracle-conversation.test.tsx
- session-response-order.ts
- Pcm16Resampler
- background-task-tracker.ts
- .initialize
- ChatMessage
- BackgroundTasksDialog.tsx
- html-preview.ts
- dataset
- generate-pwa-icons.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- VoiceCaptureOptions
- DreamerMorningPlan
- dreamer-routes.ts
- promotion-setup-execution.test.ts
- capture.test.ts
- VoiceVadOptions
- voice-recorder.ts
- vite.config.ts
- KnowledgePosition
- package.json
- release-publication.test.ts
- OracleVoicePlayback
- render-workspace-gifs.ts
- backgroundHandoff
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- usePanelWidth
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- SessionKnowledgeLifecycle
- appearance.ts
- FakeRecorder
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
1. `SessionDetail` - 310 edges
2. `App()` - 302 edges
3. `AgentService` - 290 edges
4. `SessionStore` - 190 edges
5. `ClaudeAgentService` - 126 edges
6. `ManagedSession` - 124 edges
7. `ManagerAgent` - 98 edges
8. `buildApp()` - 96 edges
9. `registerHubRoutes()` - 96 edges
10. `ComputerManager` - 89 edges

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

## Communities (214 total, 23 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (14): agentMode(), AgentService, isRuntimeReasoningEffort(), isTerminalNotReadyRefusal(), lifecycleRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, sessionInUseConflictMessage() (+6 more)

### Community 1 - "App"
Cohesion: 0.03
Nodes (182): isManagerEvent(), alertNotification(), terminalSendOptions(), sessionFileValidationError(), submissionReceiptFromError(), replyPermission(), saveSessionVisibility(), activeComposerPastes() (+174 more)

### Community 2 - "SessionDetail"
Cohesion: 0.03
Nodes (74): fixture(), restart(), fixture(), createStore(), recoveryFixture(), fixture(), claudeFixture(), fixture() (+66 more)

### Community 3 - "App.tsx"
Cohesion: 0.02
Nodes (123): addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+115 more)

### Community 4 - "api.ts"
Cohesion: 0.03
Nodes (121): SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), addKnowledgeRoot(), askSession(), bootstrapSessionOrder(), cancelBackgroundTask() (+113 more)

### Community 5 - "oracle-voice-session.ts"
Cohesion: 0.03
Nodes (60): ActiveBackendSession, BrowserTestSessionService, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, clockTicksPerSecond(), execFileAsync (+52 more)

### Community 6 - "contracts.ts"
Cohesion: 0.03
Nodes (80): ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, phases, port, directories (+72 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.04
Nodes (90): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+82 more)

### Community 8 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (53): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+45 more)

### Community 9 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (24): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+16 more)

### Community 10 - "oracle-voice.ts"
Cohesion: 0.05
Nodes (81): sendNodeVoiceOutput(), limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode() (+73 more)

### Community 11 - "claude-agent-service.ts"
Cohesion: 0.05
Nodes (72): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+64 more)

### Community 12 - "OracleVoiceCoordinator"
Cohesion: 0.05
Nodes (28): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+20 more)

### Community 13 - "ManagerAgent"
Cohesion: 0.06
Nodes (20): DreamerProgressView, automaticPayload(), checkContent(), delay(), discover(), errorMessage(), isNotFound(), isPending() (+12 more)

### Community 14 - "ManagerMessage"
Cohesion: 0.04
Nodes (39): FakeManager, apps, directories, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError() (+31 more)

### Community 15 - "app.ts"
Cohesion: 0.04
Nodes (53): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+45 more)

### Community 16 - "manager-tools.ts"
Cohesion: 0.05
Nodes (44): APPROVE_WORDS, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached(), define() (+36 more)

### Community 17 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 18 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 19 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (42): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+34 more)

### Community 20 - "ManagedSession"
Cohesion: 0.09
Nodes (12): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, normalizeNodeUrl(), createHub() (+4 more)

### Community 21 - "session-presentation.ts"
Cohesion: 0.05
Nodes (58): react, DialogFrame(), KnowledgeRootSelector(), root, drawDiagram(), drawing, MermaidDiagram(), SessionFilter (+50 more)

### Community 22 - "TerminalSessionController"
Cohesion: 0.03
Nodes (36): CopilotSessionLike, foregroundTurnOpen(), holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+28 more)

### Community 23 - "oracle-voice-worker.ts"
Cohesion: 0.06
Nodes (29): benchmarkGroup(), VoiceEndUtterance, VoiceStartUtterance, VoiceSttEngine, VoiceTtsEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig() (+21 more)

### Community 24 - "terminal-session.ts"
Cohesion: 0.05
Nodes (64): composer(), processAdapter, boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText() (+56 more)

### Community 25 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 26 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (44): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+36 more)

### Community 27 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, oversized(), statusCodeOf(), hubComputer, workstation, headerSafe(), registerTranscriptionRoutes() (+28 more)

### Community 28 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (35): nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery() (+27 more)

### Community 29 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+23 more)

### Community 30 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (22): startAgentAfterClear(), afterExit(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, formReplyExpired(), parseTerminalUpdateNotice() (+14 more)

### Community 31 - "session-directory.ts"
Cohesion: 0.07
Nodes (42): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, eventsFor(), ModelMessage, random(), seedOffset (+34 more)

### Community 32 - "client.test.ts"
Cohesion: 0.06
Nodes (17): defaultDependencies(), ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, OracleVoiceClientDependencies, capabilities, FakePlayback, pcm16ToFloat(), ScheduledSource, SegmentDrain (+9 more)

### Community 33 - "ManagerStore"
Cohesion: 0.06
Nodes (25): DreamerProgressEntry, openStore(), TurnContextInput, JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), PersistedCursor (+17 more)

### Community 34 - "manager-agent.ts"
Cohesion: 0.06
Nodes (31): ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Rung, Behavior, capturePrompt() (+23 more)

### Community 35 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (13): RemoteNodeClient, client(), servers, session, RemoteNodeCapabilityError, RemoteNodeTransportError, BackgroundTaskSnapshot, NodeInfo (+5 more)

### Community 36 - "dreamer-progress.ts"
Cohesion: 0.06
Nodes (23): DreamerMemoryMetadataRecord, DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest (+15 more)

### Community 37 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 38 - "session-reply-durability.test.ts"
Cohesion: 0.07
Nodes (27): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), answer(), assistantFixture(), claudeFixture(), claudeQuestions() (+19 more)

### Community 39 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (31): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+23 more)

### Community 40 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (36): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+28 more)

### Community 41 - "ManagerEvent"
Cohesion: 0.07
Nodes (19): DreamerServiceOptions, ManagerEventSource, batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions (+11 more)

### Community 42 - "session-enqueue-clear.test.ts"
Cohesion: 0.05
Nodes (41): ClaudeSdk, connect(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite() (+33 more)

### Community 43 - "shared/settings-profile.ts"
Cohesion: 0.06
Nodes (49): AccentSetting, AppearanceSetting, appearanceSettings, DEFAULT_SESSION_PROVIDER, isRecord(), isSettingsDeviceId(), isSettingsProfileKey(), isSettingsRevision() (+41 more)

### Community 44 - "DreamerService"
Cohesion: 0.12
Nodes (10): DreamerMemoryMetadata, digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate (+2 more)

### Community 45 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (29): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema (+21 more)

### Community 46 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, deferred() (+32 more)

### Community 47 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (23): voiceBackend(), FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine (+15 more)

### Community 48 - "SessionService"
Cohesion: 0.08
Nodes (6): nodeVoiceCapabilities(), registerNodeRoutes(), readServiceResources(), SessionService, WorkspaceListing, KnowledgeFolderState

### Community 49 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (39): executeCommand(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage() (+31 more)

### Community 50 - "CopilotClientLike"
Cohesion: 0.06
Nodes (21): CopilotClientLike, normalizedTitle(), directories, fakeClient(), ForkRequest, forkSession(), services, apps (+13 more)

### Community 51 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 53 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (33): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), isTerminalAgentWorking(), isTerminalOverlay(), isTerminalVisiblyIdle() (+25 more)

### Community 54 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 55 - "settings-profile-store.ts"
Cohesion: 0.08
Nodes (20): WorkspaceFixtureState, directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore (+12 more)

### Community 56 - "recovery-resend-durability.test.ts"
Cohesion: 0.07
Nodes (24): directories, disk, fixture(), gate(), gates, httpBoundary(), initialize(), PublicSessionValue (+16 more)

### Community 57 - "ManagerAssistant.tsx"
Cohesion: 0.06
Nodes (30): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget() (+22 more)

### Community 58 - "FakeVoiceController"
Cohesion: 0.09
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 59 - "send-matrix.integration.test.ts"
Cohesion: 0.07
Nodes (35): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+27 more)

### Community 60 - "tmux-test-helpers.ts"
Cohesion: 0.11
Nodes (35): [root], assertSameIdentity(), createIsolatedTmuxRoot(), execFileAsync, abandoned, abandonFixture(), creatorCommand(), execute (+27 more)

### Community 61 - "pwa.ts"
Cohesion: 0.09
Nodes (37): getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), retryHubCopilotModels(), testNotification() (+29 more)

### Community 62 - "active-sessions.ts"
Cohesion: 0.10
Nodes (36): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+28 more)

### Community 63 - "FakeSessionService"
Cohesion: 0.07
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 64 - "EngineVoiceBackendSession"
Cohesion: 0.15
Nodes (8): exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 65 - "cleanDialogLine"
Cohesion: 0.12
Nodes (34): activeBottomFrame(), captureBeforeDeadline(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), FormReplyDeadlineError (+26 more)

### Community 66 - "OracleDreamer.tsx"
Cohesion: 0.11
Nodes (30): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition, getDreamer() (+22 more)

### Community 67 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 68 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 69 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (28): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+20 more)

### Community 70 - "dreamer-planner.ts"
Cohesion: 0.10
Nodes (35): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+27 more)

### Community 71 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 72 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isAlreadyExists(), isDisposition() (+29 more)

### Community 73 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 74 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 75 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (31): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+23 more)

### Community 76 - "hub-routes.ts"
Cohesion: 0.07
Nodes (35): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+27 more)

### Community 77 - "KnowledgeStore"
Cohesion: 0.12
Nodes (14): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+6 more)

### Community 78 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 79 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 80 - "manager-structured-memory-search.ts"
Cohesion: 0.10
Nodes (28): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+20 more)

### Community 81 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (21): FakeVoiceEngineCall, SocketMessage, apps, BlockingEngine, config, configFixture(), connect(), Inbox (+13 more)

### Community 82 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+24 more)

### Community 83 - "node-routes.ts"
Cohesion: 0.07
Nodes (31): SessionParams, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+23 more)

### Community 84 - "manager-context.ts"
Cohesion: 0.13
Nodes (26): ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine(), followUpLine() (+18 more)

### Community 85 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (30): addActivity(), BackgroundTaskEventOptions, boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, errorValue(), MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH (+22 more)

### Community 86 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 87 - "dreamer-service.ts"
Cohesion: 0.11
Nodes (27): DreamerPlanDraft, DreamerPlannerInput, boundedText(), DreamerFollowUp, DreamerPlannerExecutionInput, safeRunError(), unavailableSnapshot(), DreamerCoverageIncrement (+19 more)

### Community 88 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 89 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 90 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 91 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 92 - "registerSessionKnowledgeRoutes"
Cohesion: 0.14
Nodes (21): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+13 more)

### Community 93 - "noTmuxServer"
Cohesion: 0.11
Nodes (18): listTmuxSessions(), noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files (+10 more)

### Community 94 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 95 - "VoiceCapture"
Cohesion: 0.21
Nodes (3): captureFailure(), harness(), VoiceCapture

### Community 96 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 97 - "manager-tools.test.ts"
Cohesion: 0.14
Nodes (8): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits, claudeModels, computers, copilotModels

### Community 98 - "ManagerStructuredMemoryStore"
Cohesion: 0.22
Nodes (5): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState

### Community 99 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 100 - "oracle-voice-segments.ts"
Cohesion: 0.14
Nodes (22): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+14 more)

### Community 101 - "OracleVoiceClient"
Cohesion: 0.18
Nodes (3): closeReason(), OracleVoiceClient, playbackClientError()

### Community 102 - "normalizeKnowledgeRelativePath"
Cohesion: 0.17
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), pathRecordSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+10 more)

### Community 103 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 104 - "session-patches.test.ts"
Cohesion: 0.17
Nodes (8): Connection, Client, PatchSocket, Browser, seedOffset, HubResyncRequest, HubWireEvent, SessionPatchReceiver

### Community 105 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 106 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 108 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 109 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession() (+2 more)

### Community 110 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 111 - "capture.ts"
Cohesion: 0.13
Nodes (15): BufferedFrame, defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, validateIdentity(), VoiceCaptureError, VoiceCaptureErrorCode (+7 more)

### Community 112 - "FakeSocket"
Cohesion: 0.11
Nodes (6): OracleVoiceSocket, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse()

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 114 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 115 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 116 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 117 - "client.ts"
Cohesion: 0.14
Nodes (14): closeError(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, parseHello(), PendingHello (+6 more)

### Community 118 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 119 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 120 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 121 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (11): client(), delayQueueWrite(), discoveredOwner(), disk, exec, gate(), holdQueueCommit(), NativeFixture (+3 more)

### Community 122 - "ManagerAssistant"
Cohesion: 0.18
Nodes (15): phoneEnterCreatesNewline(), applyEvent(), canTakeFocus(), ManagerAssistant(), act(), announce(), cancelEdit(), onEditKeyDown() (+7 more)

### Community 123 - "OracleVoiceClientError"
Cohesion: 0.29
Nodes (3): captureClientError(), clientError(), OracleVoiceClientError

### Community 124 - "backgroundTasksFromEvents"
Cohesion: 0.18
Nodes (18): backgroundTasksFromEvents(), eventString(), eventTask(), executionModeValue(), isLiveTaskStatus(), isOlderExecution(), isShellObserverTool(), isShellStopTool() (+10 more)

### Community 125 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 126 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 127 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 128 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 129 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 130 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 131 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 132 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 133 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 134 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 135 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 136 - "NewSessionDialog"
Cohesion: 0.21
Nodes (15): activateSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder(), reopenInterruptedSession(), computerProviders() (+7 more)

### Community 137 - "OracleVoiceClientOptions"
Cohesion: 0.21
Nodes (4): OracleVoiceClientOptions, OracleVoiceUiState, FakeVoiceClient, transcript()

### Community 138 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 139 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 140 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 141 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 142 - "OracleSettings.tsx"
Cohesion: 0.21
Nodes (12): getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+4 more)

### Community 143 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 144 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 145 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 146 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 147 - "use-oracle-conversation.test.tsx"
Cohesion: 0.24
Nodes (9): getOracleVoiceCapabilities(), OracleVoiceTranscriptEvent, OracleConversation, OracleConversationState, availableCapability, defaults, renderConversation(), voiceClientConstructor (+1 more)

### Community 148 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 149 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 150 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 151 - ".initialize"
Cohesion: 0.24
Nodes (4): initializeManagerStructuredMemory(), isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 152 - "ChatMessage"
Cohesion: 0.21
Nodes (10): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp(), StoredSession, ChatMessage (+2 more)

### Community 153 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 154 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 155 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 156 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 157 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 158 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 160 - "DreamerMorningPlan"
Cohesion: 0.38
Nodes (10): DreamerMorningPlan(), confirmCompletion(), confirmTaskCompletion(), dispatchTask(), disposition(), edit(), investigate(), move() (+2 more)

### Community 161 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 162 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 163 - "capture.test.ts"
Cohesion: 0.22
Nodes (3): CaptureControl, VoiceCaptureDependencies, VoiceVad

### Community 165 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 166 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 167 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 168 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 169 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 171 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 172 - "backgroundHandoff"
Cohesion: 0.38
Nodes (7): attachmentModeValue(), backgroundHandoff(), booleanValue(), rawTailText(), shellStopAcknowledged(), shellTaskMode(), toolTelemetryProperties()

### Community 173 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 174 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 175 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 176 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 177 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 178 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 180 - "appearance.ts"
Cohesion: 0.50
Nodes (3): Appearance, appearanceFrom(), appearanceStorageKey

## Knowledge Gaps
- **1204 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1199 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2021 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `session-reply-durability.test.ts`, `agent-service.ts`, `contracts.ts`, `claude-agent-service.ts`, `CopilotClientLike`, `TerminalSessionController`, `recovery-resend-durability.test.ts`, `queued-dispatch.test.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `session-reply-durability.test.ts`, `agent-service.ts`, `ClaudeAgentService`, `claude-agent-service.ts`, `CopilotClientLike`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `App()` connect `App` to `OracleDreamer.tsx`, `App.tsx`, `api.ts`, `shell.ts`, `session-reply-durability.test.ts`, `normalizeKnowledgeRelativePath`, `NewSessionDialog`, `agent-service.ts`, `session-patches.test.ts`, `pending-echo.ts`, `markdown-navigation.ts`, `knowledge-tree.ts`, `session-response-order.ts`, `session-presentation.ts`, `PushNotificationService`, `ManagerAssistant`, `pwa.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1204 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.0380952380952381 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.02717001928906035 - nodes in this community are weakly interconnected._
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
