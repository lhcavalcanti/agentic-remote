# Agentic Remote - Graphify code map

Snapshot: `de9f2e3414a5fc3040d1362f41729bd6f8164ab13e531a8c4772b65527c65653`

Source checkout: `a3b7f43e0b34b83af62aff2a75ecf6cd00637368`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 411 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 411 files · ~875,113 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7164 nodes · 19932 edges · 224 communities (181 shown, 27 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1055 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionDetail
- AgentService
- api.ts
- App
- contracts.ts
- App.tsx
- ClaudeAgentService
- oracle-voice-child.ts
- oracle-voice-session.ts
- manager-tools.ts
- claude-agent-service.ts
- oracle-voice.ts
- background-task-adapter.ts
- OracleVoiceClient
- agent-service.ts
- dreamer-store.ts
- terminal-session.ts
- oracle-voice-soak.ts
- agentic-remote-promotion-monitor
- ManagedSession
- SessionService
- ManagerAgent
- CopilotClientLike
- oracle-voice-worker.ts
- terminal-session.test.ts
- .sendAdmittedWithBackend
- PushNotificationService
- CopilotSessionLike
- oracle-voice-routes.ts
- FakeSessionService
- session-presentation.ts
- manager-structured-memory-validation.ts
- oracle-voice-coordinator.ts
- oracle-voice-integration.test.ts
- oracle-task-store.ts
- markdown-navigation.ts
- .recoverSdkSession
- FakeManager
- tmux-errors.integration.test.ts
- DreamerService
- TmuxTerminalSessionController
- app.ts
- HubEvent
- client.test.ts
- session-directory.ts
- oracle-voice-routes.test.ts
- ManagerStore
- ProviderSessionService
- agentic-remote
- oracle-voice-benchmark.ts
- .sendInternal
- ManagerProactiveCoordinator
- bundle
- active-sessions.ts
- manager.ts
- pwa.ts
- manager-agent.test.ts
- OracleVoiceCoordinator
- tmux-test-helpers.ts
- ManagerAssistant.tsx
- shell.ts
- lib.rs
- normalizeKnowledgeRelativePath
- manager-proactive-inbox.ts
- agentic-remote-promotion-setup
- manager-store.ts
- knowledge-tree.ts
- agentic-remote-gate
- config.rs
- KnowledgeStore
- oracle-voice-config.ts
- dreamer-service.ts
- DreamerProgress
- SessionKnowledgeStore
- dependencies
- devDependencies
- session-latency-benchmark.ts
- hub-routes.ts
- dreamer-planner.ts
- manager-structured-memory.ts
- EngineVoiceBackendSession
- manager-context.ts
- oracle-voice-security.test.ts
- oracle-voice-segments.ts
- VoicePlayback
- workspace-fixtures.ts
- dreamer-api.ts
- SessionOrderStore
- shared/settings-profile.ts
- session-patch-browser.ts
- session-reply-durability.test.ts
- src/settings-profile.ts
- real-voice.ts
- cli-canary.ts
- manager-agent.ts
- terminal-startup-queue.test.ts
- scripts
- manager-structured-memory-search.ts
- registerSessionKnowledgeRoutes
- transcription-service.ts
- ManagerAssistant.test.tsx
- compilerOptions
- ManagerStructuredMemoryStore
- OracleDreamer.tsx
- SettingsProfileClient
- agent-service.test.ts
- delegated-transcription-service.ts
- VoiceCapture
- capture-workspace.ts
- refusal-metrics.ts
- settings-profile-store.ts
- BackgroundTaskSnapshot
- full-gate.test.ts
- .toolHost
- session-knowledge-store.ts
- session-store-providers.test.ts
- compilerOptions
- .replyUserInputInternal
- ManagerProactiveInbox
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- .observe
- manager-runtime.ts
- dreamer-schedule.ts
- VoiceTurnState
- SettingsProfileStore
- BoundedQueue
- ReaderWorkspace
- file-upload-routes.ts
- startup-phases.test.ts
- terminal-form-deadline.test.ts
- promotion-monitor.test.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- NewSessionDialog
- use-oracle-settings.ts
- capture.ts
- scripts
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- .handleManagerEvent
- theme-contrast.test.ts
- pending-echo.ts
- capture-workbench-review.ts
- .oxlintrc.json
- settings-local.json
- dreamer-service.test.ts
- session-resource-clear.test.ts
- TranscriptionError
- Pcm16Resampler
- manager-proactive-inbox.test.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- setupWorkspaceFixture
- .initialize
- VoiceVadOptions
- dataset
- generate-pwa-icons.ts
- agent-service-recovery.test.ts
- ManagerProactiveInboxValidationError
- manager-structured-memory-performance.test.ts
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- dreamer-routes.ts
- promotion-setup-execution.test.ts
- remote-node-client.test.ts
- SessionAdmissions
- VoiceCaptureOptions
- vite.config.ts
- package.json
- release-publication.test.ts
- UserInputFieldControl
- vad-assets.ts
- oracle-conversation-real.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- usePanelWidth
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- SessionKnowledgeLifecycle
- removeComputer
- VoiceCaptureDependencies
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
1. `SessionDetail` - 310 edges
2. `App()` - 300 edges
3. `AgentService` - 288 edges
4. `SessionStore` - 190 edges
5. `ClaudeAgentService` - 126 edges
6. `ManagedSession` - 123 edges
7. `ManagerAgent` - 97 edges
8. `buildApp()` - 96 edges
9. `registerHubRoutes()` - 96 edges
10. `ComputerManager` - 89 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `pathRecordSchema` --calls--> `normalizeKnowledgeRelativePath()`  [EXTRACTED]
  server/session-knowledge-store.ts → shared/knowledge-path.ts
- `SessionKnowledgeEvents` --references--> `SessionKnowledgeBinding`  [EXTRACTED]
  server/session-knowledge-store.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (224 total, 27 thin omitted)

### Community 0 - "SessionDetail"
Cohesion: 0.03
Nodes (87): AcceptedSdkReply, fixture(), PendingClaudeReply, createStore(), recoveryFixture(), fixture(), claudeFixture(), copilotFixture() (+79 more)

### Community 1 - "AgentService"
Cohesion: 0.04
Nodes (10): agentMode(), AgentService, lifecycleRefusal(), restart(), removeCopilotSessionFiles(), RuntimeConfigurationError, suspendedRuntimeConflict(), suspendRefused() (+2 more)

### Community 2 - "api.ts"
Cohesion: 0.02
Nodes (140): SettingsChange, SettingsProfileKey, SettingsUpdateResult, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, SubmissionReceipt (+132 more)

### Community 3 - "App"
Cohesion: 0.03
Nodes (163): isManagerEvent(), alertNotification(), terminalSendOptions(), sessionFileValidationError(), askSession(), clearConversation(), getSession(), recoverConversation() (+155 more)

### Community 4 - "contracts.ts"
Cohesion: 0.03
Nodes (75): AgentServiceEvents, ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, directories, routingFixture() (+67 more)

### Community 5 - "App.tsx"
Cohesion: 0.02
Nodes (116): AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+108 more)

### Community 6 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (24): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+16 more)

### Community 7 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (54): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+46 more)

### Community 8 - "oracle-voice-session.ts"
Cohesion: 0.04
Nodes (53): apps, directories, voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngine, FakeVoiceEngineFactory, identityKey(), isCancelled() (+45 more)

### Community 9 - "manager-tools.ts"
Cohesion: 0.04
Nodes (51): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+43 more)

### Community 10 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (65): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+57 more)

### Community 11 - "oracle-voice.ts"
Cohesion: 0.05
Nodes (57): VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient (+49 more)

### Community 12 - "background-task-adapter.ts"
Cohesion: 0.05
Nodes (75): DeferredSession, addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText() (+67 more)

### Community 13 - "OracleVoiceClient"
Cohesion: 0.06
Nodes (29): getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord(), isTicket() (+21 more)

### Community 14 - "agent-service.ts"
Cohesion: 0.03
Nodes (73): ActivePrompt, ActivityToolStart, ansiSequence, commandShortcut(), DeliveryBoundary, ElicitationContext, ElicitationHandler, foregroundLifecycleEvents (+65 more)

### Community 15 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (48): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+40 more)

### Community 16 - "terminal-session.ts"
Cohesion: 0.04
Nodes (77): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus(), composerHoldsOtherText(), composerRowText() (+69 more)

### Community 17 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 18 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 19 - "ManagedSession"
Cohesion: 0.09
Nodes (12): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, FakeManager, createHub() (+4 more)

### Community 20 - "SessionService"
Cohesion: 0.04
Nodes (34): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema (+26 more)

### Community 21 - "ManagerAgent"
Cohesion: 0.08
Nodes (13): FakeVoiceState, checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+5 more)

### Community 22 - "CopilotClientLike"
Cohesion: 0.03
Nodes (49): CopilotClientLike, directories, fakeClient(), ForkRequest, forkSession(), services, ClaudeSdk, connect() (+41 more)

### Community 23 - "oracle-voice-worker.ts"
Cohesion: 0.06
Nodes (27): benchmarkGroup(), VoiceSttEngine, VoiceTtsEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage() (+19 more)

### Community 24 - "terminal-session.test.ts"
Cohesion: 0.04
Nodes (57): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+49 more)

### Community 25 - ".sendAdmittedWithBackend"
Cohesion: 0.07
Nodes (7): isTerminalNotReadyRefusal(), sessionInUseConflictMessage(), terminalAnswerRefused(), queueConflict(), isRetainedRefusal(), isTerminalSessionInUsePrompt(), TerminalSessionController

### Community 26 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 27 - "CopilotSessionLike"
Cohesion: 0.06
Nodes (32): CopilotSessionLike, openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery() (+24 more)

### Community 28 - "oracle-voice-routes.ts"
Cohesion: 0.06
Nodes (48): BuildAppOptions, nodeVoiceCapabilities(), sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), availableCapabilities(), backendOutputBytes() (+40 more)

### Community 29 - "FakeSessionService"
Cohesion: 0.05
Nodes (15): CreationRuntime, FakeSessionService, AgentMode, AgentProvider, RuntimeReasoningEffort, SessionExecutionMode, TerminalSendPolicyInput, TerminalSendRequestOptions (+7 more)

### Community 30 - "session-presentation.ts"
Cohesion: 0.06
Nodes (51): react, hasActiveBackgroundTasks(), saveSessionOrderLane(), handleDragEnd(), DialogFrame(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers() (+43 more)

### Community 31 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 32 - "oracle-voice-coordinator.ts"
Cohesion: 0.05
Nodes (31): ManagerEventSource, ManagerEventSource, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OracleVoiceBackendConnection, OracleVoiceBackendConnector, OracleVoiceBackendDisconnect (+23 more)

### Community 33 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (27): apps, BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+19 more)

### Community 34 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (36): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+28 more)

### Community 35 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (44): executeCommand(), listWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+36 more)

### Community 36 - ".recoverSdkSession"
Cohesion: 0.08
Nodes (37): activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength() (+29 more)

### Community 37 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 38 - "tmux-errors.integration.test.ts"
Cohesion: 0.06
Nodes (31): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+23 more)

### Community 39 - "DreamerService"
Cohesion: 0.12
Nodes (9): digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate, DreamerSnapshot (+1 more)

### Community 40 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (12): copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm() (+4 more)

### Community 41 - "app.ts"
Cohesion: 0.06
Nodes (29): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence (+21 more)

### Community 42 - "HubEvent"
Cohesion: 0.07
Nodes (25): ComputerManagerEvents, nextVoiceControl(), Client, apps, directories, FakeManager, fixture(), trusted (+17 more)

### Community 43 - "client.test.ts"
Cohesion: 0.05
Nodes (17): defaultDependencies(), ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket (+9 more)

### Community 44 - "session-directory.ts"
Cohesion: 0.10
Nodes (36): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+28 more)

### Community 45 - "oracle-voice-routes.test.ts"
Cohesion: 0.06
Nodes (21): ActiveBackendSession, installFakeBrowserVoice(), ScriptedUtterance, Window, receiveNodeVoiceMessage(), ObservedLocalVoiceBackend, openApps, openSockets (+13 more)

### Community 46 - "ManagerStore"
Cohesion: 0.07
Nodes (13): openStore(), emptyState(), ManagerStore, open(), FakeManager, createManager(), createRealManager(), DeterministicManagerClient (+5 more)

### Community 48 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 49 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (39): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, deferred() (+31 more)

### Community 50 - ".sendInternal"
Cohesion: 0.12
Nodes (35): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), composerHoldsText(), composerText() (+27 more)

### Community 51 - "ManagerProactiveCoordinator"
Cohesion: 0.09
Nodes (14): apps, directories, batchMessageId(), isTerminal(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, ProactiveManager, directories (+6 more)

### Community 52 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 53 - "active-sessions.ts"
Cohesion: 0.09
Nodes (37): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+29 more)

### Community 54 - "manager.ts"
Cohesion: 0.07
Nodes (24): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+16 more)

### Community 55 - "pwa.ts"
Cohesion: 0.09
Nodes (38): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+30 more)

### Community 56 - "manager-agent.test.ts"
Cohesion: 0.07
Nodes (19): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+11 more)

### Community 57 - "OracleVoiceCoordinator"
Cohesion: 0.11
Nodes (6): AudioCompletion, AudioGate, OracleVoiceCoordinator, resolvedAudioGate(), terminalStartupCloseCode(), ActiveConversation

### Community 58 - "tmux-test-helpers.ts"
Cohesion: 0.11
Nodes (31): directories, exec, noTmuxServer(), processGone(), procVisible(), socketIdentity(), UnixSocket, unixSockets() (+23 more)

### Community 59 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (30): editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), retryManagerMessage(), phoneEnterCreatesNewline(), applyEvent(), canTakeFocus(), conversationStateLabel() (+22 more)

### Community 60 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 61 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 62 - "normalizeKnowledgeRelativePath"
Cohesion: 0.10
Nodes (30): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+22 more)

### Community 63 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (38): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isAlreadyExists() (+30 more)

### Community 64 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 65 - "manager-store.ts"
Cohesion: 0.09
Nodes (22): DreamerProgressEntry, JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), ManagerProactiveInboxObservation, PersistedCursor, JournalDraft (+14 more)

### Community 66 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (35): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+27 more)

### Community 67 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 68 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 69 - "KnowledgeStore"
Cohesion: 0.11
Nodes (15): WorkspaceFixtureState, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState (+7 more)

### Community 70 - "oracle-voice-config.ts"
Cohesion: 0.10
Nodes (25): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+17 more)

### Community 71 - "dreamer-service.ts"
Cohesion: 0.09
Nodes (32): DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply (+24 more)

### Community 72 - "DreamerProgress"
Cohesion: 0.11
Nodes (11): DreamerProgress, DreamerProgressSource, keyOf(), notOlder(), progressExcerpt(), Detail, FakeSource, setup() (+3 more)

### Community 73 - "SessionKnowledgeStore"
Cohesion: 0.12
Nodes (11): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateWithPaths(), disk, fixture(), fixtures (+3 more)

### Community 74 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 75 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 76 - "session-latency-benchmark.ts"
Cohesion: 0.10
Nodes (19): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+11 more)

### Community 77 - "hub-routes.ts"
Cohesion: 0.07
Nodes (34): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+26 more)

### Community 78 - "dreamer-planner.ts"
Cohesion: 0.11
Nodes (30): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+22 more)

### Community 79 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 80 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 81 - "manager-context.ts"
Cohesion: 0.13
Nodes (26): ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine(), followUpLine() (+18 more)

### Community 82 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (19): FakeVoiceEngineCall, VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), connect(), Inbox (+11 more)

### Community 83 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 84 - "VoicePlayback"
Cohesion: 0.13
Nodes (6): pcm16ToFloat(), SegmentDrain, FakeSource, harness(), validateGeneration(), VoicePlayback

### Community 85 - "workspace-fixtures.ts"
Cohesion: 0.09
Nodes (25): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+17 more)

### Community 86 - "dreamer-api.ts"
Cohesion: 0.11
Nodes (23): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+15 more)

### Community 87 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 88 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (28): AccentSetting, appearanceSettings, applySettingsChanges(), DEFAULT_SESSION_PROVIDER, isRecord(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting (+20 more)

### Community 89 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 90 - "session-reply-durability.test.ts"
Cohesion: 0.12
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 91 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (24): AppearanceSetting, isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance (+16 more)

### Community 92 - "real-voice.ts"
Cohesion: 0.12
Nodes (11): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+3 more)

### Community 93 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 94 - "manager-agent.ts"
Cohesion: 0.10
Nodes (18): DreamerProgressView, automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung (+10 more)

### Community 95 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (22): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+14 more)

### Community 96 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 97 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 98 - "registerSessionKnowledgeRoutes"
Cohesion: 0.14
Nodes (21): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+13 more)

### Community 99 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 100 - "ManagerAssistant.test.tsx"
Cohesion: 0.08
Nodes (13): cancelManager(), resolveManagerConfirmation(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+5 more)

### Community 101 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 102 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 103 - "OracleDreamer.tsx"
Cohesion: 0.16
Nodes (21): getDreamer(), authoritativeRefresh, AuthoritativeRefreshRequest, coordinatedAuthoritativeRefresh, dispatchAuthoritativeRefresh(), DreamerMorningPlan(), confirmCompletion(), confirmTaskCompletion() (+13 more)

### Community 104 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 105 - "agent-service.test.ts"
Cohesion: 0.12
Nodes (12): foregroundTurnOpen(), terminalFormSteps(), busyTerminal(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+4 more)

### Community 106 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (11): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+3 more)

### Community 108 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 109 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 110 - "settings-profile-store.ts"
Cohesion: 0.16
Nodes (10): SettingsProfileState, applySettingsImport(), isSettingsProfileKey(), SettingsProfileRecord, validateSettingsImport(), seedHubSettings(), settingsProfileCacheKey, cached() (+2 more)

### Community 111 - "BackgroundTaskSnapshot"
Cohesion: 0.16
Nodes (8): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), hasRunningBackgroundAgent(), BackgroundTask, BackgroundTaskSnapshot

### Community 112 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 114 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+11 more)

### Community 115 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+2 more)

### Community 116 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 117 - ".replyUserInputInternal"
Cohesion: 0.23
Nodes (4): isUncertainDelivery(), persistedFormAnswer(), TerminalFormReplyError, deliveryUncertaintyFromError()

### Community 118 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 119 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 120 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 121 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 122 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 123 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 124 - ".observe"
Cohesion: 0.19
Nodes (7): ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 125 - "manager-runtime.ts"
Cohesion: 0.19
Nodes (13): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkMissingSessionRetirement, CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic() (+5 more)

### Community 126 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 127 - "VoiceTurnState"
Cohesion: 0.18
Nodes (3): errorMessage(), PendingFinalTurn, VoiceTurnState

### Community 128 - "SettingsProfileStore"
Cohesion: 0.18
Nodes (7): profileStore(), SettingsProfileStore, directories, store(), isSettingsDeviceId(), SettingsProfileSnapshot, SettingsProfileTransport

### Community 129 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 130 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 131 - "file-upload-routes.ts"
Cohesion: 0.19
Nodes (9): FileUploadError, registerFileUploadRoutes(), SessionParams, registerTranscriptionRoutes(), transcriptionMultipartOptions, extension(), MAX_SESSION_FILE_BYTES, supportedExtensions (+1 more)

### Community 132 - "startup-phases.test.ts"
Cohesion: 0.13
Nodes (11): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseRecord, address, directories, recorder() (+3 more)

### Community 133 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 134 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 135 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 136 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 137 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession() (+8 more)

### Community 138 - "use-oracle-settings.ts"
Cohesion: 0.22
Nodes (13): getManager(), updateManagerSettings(), act(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus() (+5 more)

### Community 139 - "capture.ts"
Cohesion: 0.17
Nodes (10): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, validateIdentity(), VoiceCaptureError (+2 more)

### Community 140 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 141 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 142 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 143 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 145 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 146 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 147 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 148 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 149 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 150 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 151 - "session-resource-clear.test.ts"
Cohesion: 0.17
Nodes (12): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+4 more)

### Community 152 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 153 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 154 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 155 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 156 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 157 - "setupWorkspaceFixture"
Cohesion: 0.22
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 158 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 160 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 161 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 162 - "agent-service-recovery.test.ts"
Cohesion: 0.24
Nodes (7): fixture(), holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents()

### Community 163 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 164 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.27
Nodes (7): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult, submitSearch()

### Community 165 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 166 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 167 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 168 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 169 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 170 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 173 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 174 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 175 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 176 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 177 - "vad-assets.ts"
Cohesion: 0.32
Nodes (7): browserBaseUrl(), directory(), localAssetUrl(), ORACLE_VOICE_ONNX_WASM_BASE_PATH, ORACLE_VOICE_VAD_ASSETS, ORACLE_VOICE_VAD_BASE_PATH, sharedAssetDirectory()

### Community 179 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 180 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 181 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 182 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 183 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 184 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 185 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 186 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 188 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 193 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **1181 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1176 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1984 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `.recoverSdkSession`, `contracts.ts`, `agent-service.test.ts`, `claude-agent-service.ts`, `session-latency-benchmark.ts`, `session-directory.ts`, `background-task-adapter.ts`, `.replyUserInputInternal`, `.sendAdmittedWithBackend`, `CopilotSessionLike`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `.recoverSdkSession`, `ClaudeAgentService`, `claude-agent-service.ts`, `.replyUserInputInternal`, `.sendAdmittedWithBackend`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `OracleVoiceClient` connect `OracleVoiceClient` to `client.test.ts`, `oracle-voice.ts`, `oracle-voice-routes.test.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1181 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.02763819095477387 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.04019480519480519 - nodes in this community are weakly interconnected._
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
