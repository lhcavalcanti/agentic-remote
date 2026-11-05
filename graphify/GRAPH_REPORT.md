# Agentic Remote - Graphify code map

Snapshot: `8dfbb7f08a4fde1a6a76ec0b57032bd230f4ff97da7328bee60820281aa0b748`

Source checkout: `0ce59a0a73c3d15ff7244a31c4a1bc780ecaffb7`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 401 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 401 files · ~808,648 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6804 nodes · 18783 edges · 221 communities (182 shown, 23 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1009 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- api.ts
- App.tsx
- SessionDetail
- .publish
- ClaudeAgentService
- app.ts
- multi-node.test.ts
- AgentService
- manager.ts
- claude-agent-service.ts
- contracts.ts
- CopilotClientLike
- oracle-voice-soak.ts
- oracle-voice-session.ts
- ManagedSession
- terminal-session.ts
- agentic-remote-promotion-monitor
- agent-service.ts
- SessionService
- VoiceCapture
- sessionKey
- RemoteNodeClient
- oracle-voice-coordinator.ts
- transcription-service.ts
- manager-tools.ts
- ManagerAgent
- oracle-voice-integration.test.ts
- ManagerStore
- oracle-voice-routes.test.ts
- manager-structured-memory-validation.ts
- terminal-startup-queue.test.ts
- FakeManager
- oracle-voice-benchmark.ts
- markdown-navigation.ts
- TmuxTerminalSessionController
- recovery-resend-durability.test.ts
- active-sessions.ts
- PushNotificationService
- oracle-voice.ts
- session-store.ts
- agentic-remote
- DreamerStore
- bundle
- dreamer-planner.ts
- ProviderSessionService
- client.test.ts
- pwa.ts
- SessionKnowledgeStore
- manager-agent.test.ts
- oracle-voice-child.ts
- ResidentVoiceWorker
- oracle-voice-routes.ts
- oracle-voice-security.test.ts
- .sendInternal
- shell.ts
- lib.rs
- ChildVoiceEngine
- dreamer-store.ts
- normalizeKnowledgeRelativePath
- agentic-remote-promotion-setup
- ManagerMessage
- oracle-voice-config.ts
- ManagerAssistant.tsx
- agentic-remote-gate
- config.rs
- manager-proactive-inbox.ts
- terminal-session.test.ts
- dependencies
- devDependencies
- manager-agent.ts
- .recoverSdkSession
- DreamerService
- hub-routes.ts
- oracle-voice-child.test.ts
- EngineVoiceBackendSession
- knowledge-tree.ts
- manager-structured-memory.ts
- VoiceClientControl
- real-voice.ts
- ManagerStructuredMemoryStore
- shared/settings-profile.ts
- VoicePlayback
- workspace-fixtures.ts
- SessionOrderStore
- session-patch-browser.ts
- background-task-adapter.ts
- session-reply-durability.test.ts
- .startAdmitted
- OracleVoiceCoordinator
- cli-canary.ts
- send-matrix.integration.test.ts
- OracleSettings.tsx
- src/settings-profile.ts
- scripts
- startup-phases.test.ts
- KnowledgeStore
- oracle-voice-worker.ts
- capture.ts
- react
- agent-service.test.ts
- manager-context.ts
- manager-structured-memory-search.ts
- settings-profile-store.ts
- ManagerAssistant.test.tsx
- compilerOptions
- .toolHost
- SettingsProfileClient
- capture-workspace.ts
- .observe
- oracle-voice-segments.ts
- oracle-voice-tickets.ts
- full-gate.test.ts
- session-store-providers.test.ts
- PromptCards.tsx
- compilerOptions
- ManagerProactiveInbox
- OnlineRecognizer
- OracleDreamer.tsx
- compilerOptions
- compilerOptions
- server/side-question.ts
- directory-browser.ts
- dreamer-service.ts
- event-log.ts
- ManagerStructuredMemoryRuntime
- workspace-browser.ts
- dreamer-schedule.ts
- ManagerMemory
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- .confirmSpeech
- session-knowledge-store.ts
- dreamer-api.ts
- terminal-form-deadline.test.ts
- backgroundTasksFromEvents
- background-task-stop.test.ts
- promotion-monitor.test.ts
- NewSessionDialog
- scripts
- oracle-voice-assets.test.ts
- .handleBackendOutput
- fake-vad.ts
- desktop.json
- manager-proactive-inbox.test.ts
- theme-contrast.test.ts
- pending-echo.ts
- capture-workbench-review.ts
- .oxlintrc.json
- settings-local.json
- SessionAdmissions
- registerSessionKnowledgeRoutes
- recordValue
- copilot-sdk-client.ts
- VoiceTurnState
- ChatMessage
- recovery-seed-guards.test.ts
- send-policy.test.ts
- session-response-order.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- setupWorkspaceFixture
- DeferredSession
- claude-recovery-admission.test.ts
- session-knowledge-routes.ts
- settings-profile.test.ts
- dataset
- generate-pwa-icons.ts
- dreamer-routes.ts
- ManagerProactiveInboxValidationError
- manager-structured-memory-performance.test.ts
- SpeakableSegmenter
- bridge.rs
- .transport
- screenshot-stability.test.ts
- promotion-setup-execution.test.ts
- vite.config.ts
- KnowledgePosition
- package.json
- release-publication.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- settings.ts
- composer-layout.test.ts
- usePanelWidth
- promotion-setup.test.ts
- .discoverTerminalSessions
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
- CopilotResourceClient
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
9. `ManagerAgent` - 90 edges
10. `ComputerManager` - 87 edges

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

## Communities (221 total, 23 thin omitted)

### Community 0 - "App"
Cohesion: 0.03
Nodes (148): isManagerEvent(), alertNotification(), terminalSendOptions(), submissionReceiptFromError(), deleteKnowledgeRoot(), moveSessionToTmux(), replyPermission(), replyUserInput() (+140 more)

### Community 1 - "api.ts"
Cohesion: 0.03
Nodes (114): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, SettingsChange, SettingsProfileKey, SettingsProfileValues, SettingsUpdateResult, parseSubmissionReceipt() (+106 more)

### Community 2 - "App.tsx"
Cohesion: 0.02
Nodes (114): addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+106 more)

### Community 3 - "SessionDetail"
Cohesion: 0.05
Nodes (37): fixture(), recoveryFixture(), fixture(), claudeFixture(), copilotFixture(), seed(), fixture(), fixture() (+29 more)

### Community 4 - ".publish"
Cohesion: 0.05
Nodes (9): agentMode(), isTerminalNotReadyRefusal(), removeCopilotSessionFiles(), suspendedRuntimeConflict(), terminalAnswerRefused(), isRetainedRefusal(), TerminalSessionController, hasActiveBackgroundTasks() (+1 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (20): ClaudeAgentService, isMissingClaudeSessionError(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+12 more)

### Community 6 - "app.ts"
Cohesion: 0.03
Nodes (72): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+64 more)

### Community 7 - "multi-node.test.ts"
Cohesion: 0.03
Nodes (40): TerminalFormContinuation, DirectoryScope, directories, FakeSessionService, nextVoiceControl(), routingFixture(), session(), temporaryDirectory() (+32 more)

### Community 8 - "AgentService"
Cohesion: 0.05
Nodes (9): AgentService, isUncertainDelivery(), persistedFormAnswer(), restart(), RuntimeConfigurationError, fixture(), httpBoundary(), TerminalFormReplyError (+1 more)

### Community 9 - "manager.ts"
Cohesion: 0.05
Nodes (42): ManagerClientDefaults, ManagerConfirmation, ManagerMessageRole, ManagerMessageState, ManagerSubmissionSource, ResolveManagerConfirmationInput, SendManagerMessageInput, VoiceCapabilities (+34 more)

### Community 10 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (70): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+62 more)

### Community 11 - "contracts.ts"
Cohesion: 0.03
Nodes (53): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), ComputerManagerEvents, HubEventSource, PushPolicy (+45 more)

### Community 12 - "CopilotClientLike"
Cohesion: 0.03
Nodes (68): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+60 more)

### Community 13 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (36): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+28 more)

### Community 14 - "oracle-voice-session.ts"
Cohesion: 0.05
Nodes (46): apps, directories, EnabledOracleVoiceConfig, FakeVoiceEngine, FakeVoiceEngineFactory, identityKey(), isCancelled(), sameGeneration() (+38 more)

### Community 15 - "ManagedSession"
Cohesion: 0.09
Nodes (16): ComputerManager, managedSession(), mapWithConcurrency(), RemoteSessionListing, sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier (+8 more)

### Community 16 - "terminal-session.ts"
Cohesion: 0.05
Nodes (73): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerRowText() (+65 more)

### Community 17 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 18 - "agent-service.ts"
Cohesion: 0.05
Nodes (73): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+65 more)

### Community 19 - "SessionService"
Cohesion: 0.05
Nodes (32): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), closeReason(), closeVoiceSocket() (+24 more)

### Community 20 - "VoiceCapture"
Cohesion: 0.06
Nodes (16): defaultDependencies(), captureFailure(), defaultAudioContext(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions (+8 more)

### Community 21 - "sessionKey"
Cohesion: 0.06
Nodes (59): saveSessionOrderLane(), cancelSelectedBackgroundTask(), handleDragEnd(), openSessionResources(), toggleSelectedSessionMute(), readSelectionFromLocation(), RenameSessionDialog(), SessionResourcesDialog() (+51 more)

### Community 22 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (20): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, client(), servers, session, CreateSessionInput (+12 more)

### Community 23 - "oracle-voice-coordinator.ts"
Cohesion: 0.05
Nodes (34): ManagerEventSource, ManagerEventSource, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OracleVoiceBackendConnection, OracleVoiceBackendConnector, OracleVoiceBackendDisconnect (+26 more)

### Community 24 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionMultipartOptions (+27 more)

### Community 25 - "manager-tools.ts"
Cohesion: 0.06
Nodes (35): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), steer() (+27 more)

### Community 26 - "ManagerAgent"
Cohesion: 0.10
Nodes (10): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, TurnError, withTimeout() (+2 more)

### Community 27 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (29): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+21 more)

### Community 28 - "ManagerStore"
Cohesion: 0.06
Nodes (24): openStore(), JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), PersistedCursor, emptyState(), JournalDraft (+16 more)

### Community 29 - "oracle-voice-routes.test.ts"
Cohesion: 0.04
Nodes (23): ActiveBackendSession, installFakeBrowserVoice(), ScriptedUtterance, Window, exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage() (+15 more)

### Community 30 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (52): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+44 more)

### Community 31 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (43): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+35 more)

### Community 32 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 33 - "oracle-voice-benchmark.ts"
Cohesion: 0.06
Nodes (41): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 34 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (42): executeCommand(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage() (+34 more)

### Community 35 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (16): startAgentAfterClear(), composer(), processAdapter, copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors() (+8 more)

### Community 36 - "recovery-resend-durability.test.ts"
Cohesion: 0.04
Nodes (34): build(), trusted, accept(), deferred(), disk, fixtures, holdWrite(), prompt() (+26 more)

### Community 37 - "active-sessions.ts"
Cohesion: 0.08
Nodes (44): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+36 more)

### Community 38 - "PushNotificationService"
Cohesion: 0.09
Nodes (20): brief(), OracleEventSource, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema (+12 more)

### Community 39 - "oracle-voice.ts"
Cohesion: 0.09
Nodes (37): capabilities, closeServers, exactArrayBuffer(), sockets, startFields, VoiceNode, decodeVoiceAudioFrame(), encodeVoiceAudioFrame() (+29 more)

### Community 40 - "session-store.ts"
Cohesion: 0.05
Nodes (34): idleDaysSchema, mergeSessionRetention(), sessionRetentionPatchSchema, sessionRetentionSchema, activityDuration(), activityResultPreview(), archivedMessage(), emptyRetirements (+26 more)

### Community 41 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 42 - "DreamerStore"
Cohesion: 0.12
Nodes (14): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, isMissing(), publicPlan() (+6 more)

### Community 43 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 44 - "dreamer-planner.ts"
Cohesion: 0.08
Nodes (36): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+28 more)

### Community 46 - "client.test.ts"
Cohesion: 0.07
Nodes (15): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+7 more)

### Community 47 - "pwa.ts"
Cohesion: 0.09
Nodes (38): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), retryHubCopilotModels() (+30 more)

### Community 48 - "SessionKnowledgeStore"
Cohesion: 0.10
Nodes (15): WorkspaceFixtureState, bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeEvents, SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateSchema (+7 more)

### Community 49 - "manager-agent.test.ts"
Cohesion: 0.07
Nodes (16): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+8 more)

### Community 50 - "oracle-voice-child.ts"
Cohesion: 0.07
Nodes (33): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), float32ToPcm16() (+25 more)

### Community 51 - "ResidentVoiceWorker"
Cohesion: 0.13
Nodes (7): combinedTranscript(), matchesCancelled(), pcm16ToFloat32(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceSynthesisRequest

### Community 52 - "oracle-voice-routes.ts"
Cohesion: 0.10
Nodes (31): nodeVoiceCapabilities(), sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+23 more)

### Community 53 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (23): FakeVoiceEngineCall, VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), connect(), createManager() (+15 more)

### Community 54 - ".sendInternal"
Cohesion: 0.13
Nodes (29): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerHoldsText(), composerText(), containsCopiedInteractiveFrame() (+21 more)

### Community 55 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 56 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 57 - "ChildVoiceEngine"
Cohesion: 0.12
Nodes (10): benchmarkGroup(), capabilityFromConfig(), ChildVoiceEngine, errorMessage(), isCancelledEvent(), matchesSynthesis(), matchesUtterance(), minimalWorkerEnvironment() (+2 more)

### Community 58 - "dreamer-store.ts"
Cohesion: 0.08
Nodes (33): DreamerHistoryEntry, assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES (+25 more)

### Community 59 - "normalizeKnowledgeRelativePath"
Cohesion: 0.10
Nodes (30): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+22 more)

### Community 60 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 61 - "ManagerMessage"
Cohesion: 0.08
Nodes (19): FakeVoiceState, confirmationSchema, defaultsSchema, editSchema, effort, managerCadence, managerInputError(), ManagerRouteAgent (+11 more)

### Community 62 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (27): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+19 more)

### Community 63 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (30): editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), phoneEnterCreatesNewline(), applyEvent(), canTakeFocus(), conversationStateLabel() (+22 more)

### Community 64 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 65 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 66 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (36): assertExactKeys(), DISPOSITIONS, EVENT_KINDS, hasExactKeys(), isAlreadyExists(), isDisposition(), isEventKind(), isId() (+28 more)

### Community 67 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (30): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse(), pastedPlaceholderCount() (+22 more)

### Community 68 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 69 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 70 - "manager-agent.ts"
Cohesion: 0.12
Nodes (18): isPending(), isQueued(), ManagerAgentOptions, Rung, sameRuntime(), SCHEDULE_RETRY_DELAYS_MS, TURN_ACTIVITY, deferManagerCheckUntilAllowed() (+10 more)

### Community 71 - ".recoverSdkSession"
Cohesion: 0.11
Nodes (5): foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), TranscriptObservation

### Community 72 - "DreamerService"
Cohesion: 0.16
Nodes (10): setup(), DreamerService, safeRunError(), unavailableSnapshot(), DreamerRunClaim, DreamerCompletionCandidate, DreamerPlanItemSource, DreamerSnapshot (+2 more)

### Community 73 - "hub-routes.ts"
Cohesion: 0.07
Nodes (34): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+26 more)

### Community 74 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 75 - "EngineVoiceBackendSession"
Cohesion: 0.18
Nodes (5): asSessionError(), disconnectCause(), EngineVoiceBackendSession, sameUtterance(), VoiceSessionError

### Community 76 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+24 more)

### Community 77 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (29): ManagerStructuredMemorySearchIndex, ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_QUERY_CHARS (+21 more)

### Community 78 - "VoiceClientControl"
Cohesion: 0.16
Nodes (15): VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+7 more)

### Community 79 - "real-voice.ts"
Cohesion: 0.10
Nodes (12): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+4 more)

### Community 80 - "ManagerStructuredMemoryStore"
Cohesion: 0.18
Nodes (8): digest(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState

### Community 81 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (29): AccentSetting, appearanceSettings, applySettingsImport(), isRecord(), isSettingsProfileKey(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting (+21 more)

### Community 82 - "VoicePlayback"
Cohesion: 0.13
Nodes (6): pcm16ToFloat(), SegmentDrain, FakeSource, harness(), validateGeneration(), VoicePlayback

### Community 83 - "workspace-fixtures.ts"
Cohesion: 0.09
Nodes (25): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+17 more)

### Community 84 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 85 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 86 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (27): addActivity(), attachmentModeValue(), BackgroundTaskEventOptions, booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, eventTask() (+19 more)

### Community 87 - "session-reply-durability.test.ts"
Cohesion: 0.12
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 88 - ".startAdmitted"
Cohesion: 0.12
Nodes (7): cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), StartupPhases

### Community 89 - "OracleVoiceCoordinator"
Cohesion: 0.15
Nodes (5): AudioCompletion, AudioGate, OracleVoiceCoordinator, resolvedAudioGate(), ActiveConversation

### Community 90 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 91 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (23): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+15 more)

### Community 92 - "OracleSettings.tsx"
Cohesion: 0.12
Nodes (20): ManagerCheckCadenceMinutes, ManagerProactiveSettings, ManagerProactiveSnapshot, getManager(), updateManagerSettings(), checkCadences, editableProactive(), effortFrom() (+12 more)

### Community 93 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (22): AppearanceSetting, isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, statuslineItems, Appearance, appearanceFrom() (+14 more)

### Community 94 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 95 - "startup-phases.test.ts"
Cohesion: 0.09
Nodes (17): ClaudeAgentServiceEvents, phases, port, ProviderSessionServiceEvents, RemoteNodeClientEvents, createStartupPhases(), silentStartupPhases, startManagedServer() (+9 more)

### Community 96 - "KnowledgeStore"
Cohesion: 0.17
Nodes (7): KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 97 - "oracle-voice-worker.ts"
Cohesion: 0.11
Nodes (16): VoiceGenerationIdentity, VoiceSttEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, exactKeys(), isEnabledConfig(), isNonEmptyString(), isRecord() (+8 more)

### Community 98 - "capture.ts"
Cohesion: 0.10
Nodes (15): BufferedFrame, positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode, VoiceVad (+7 more)

### Community 99 - "react"
Cohesion: 0.11
Nodes (12): react, transcribeAudio(), MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram(), drawing, MermaidDiagram() (+4 more)

### Community 100 - "agent-service.test.ts"
Cohesion: 0.11
Nodes (15): terminalFormSteps(), busyTerminal(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService(), services (+7 more)

### Community 101 - "manager-context.ts"
Cohesion: 0.15
Nodes (18): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+10 more)

### Community 102 - "manager-structured-memory-search.ts"
Cohesion: 0.15
Nodes (21): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+13 more)

### Community 103 - "settings-profile-store.ts"
Cohesion: 0.14
Nodes (14): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), profileStore(), updateSchema, SettingsProfileState, SettingsProfileStore (+6 more)

### Community 104 - "ManagerAssistant.test.tsx"
Cohesion: 0.08
Nodes (13): cancelManager(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+5 more)

### Community 105 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 106 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 107 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 108 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 109 - ".observe"
Cohesion: 0.16
Nodes (10): canonicalHash(), cloneState(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError (+2 more)

### Community 110 - "oracle-voice-segments.ts"
Cohesion: 0.16
Nodes (21): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+13 more)

### Community 111 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 112 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 113 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+2 more)

### Community 114 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 115 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 116 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 117 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 118 - "OracleDreamer.tsx"
Cohesion: 0.19
Nodes (17): authoritativeRefresh, AuthoritativeRefreshRequest, coordinatedAuthoritativeRefresh, dispatchAuthoritativeRefresh(), DreamerMorningPlan(), confirmCompletion(), disposition(), edit() (+9 more)

### Community 119 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 120 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 121 - "server/side-question.ts"
Cohesion: 0.20
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 122 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 123 - "dreamer-service.ts"
Cohesion: 0.15
Nodes (12): DreamerPlanDraft, digest(), DreamerPlannerExecutionInput, DreamerServiceOptions, planWithFingerprints(), publicSnapshot(), directories, DreamerCoverageIncrement (+4 more)

### Community 124 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 125 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.15
Nodes (9): efforts, managerRuntimeSettings, initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, ManagerStructuredMemoryMode (+1 more)

### Community 126 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 127 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 128 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 129 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 130 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 131 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 132 - ".confirmSpeech"
Cohesion: 0.25
Nodes (3): errorMessage(), OperationTimeoutError, withTimeout()

### Community 133 - "session-knowledge-store.ts"
Cohesion: 0.13
Nodes (16): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+8 more)

### Community 134 - "dreamer-api.ts"
Cohesion: 0.20
Nodes (11): DreamerApiError, DreamerSettingsEdit, getDreamer(), request(), saveDreamerSettings(), snapshot, updateDreamerPlan(), completionCandidate (+3 more)

### Community 135 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 136 - "backgroundTasksFromEvents"
Cohesion: 0.19
Nodes (16): backgroundTasksFromEvents(), eventString(), isLiveTaskStatus(), isOlderExecution(), isShellObserverTool(), isShellStopTool(), isShellTool(), isTerminalTaskStatus() (+8 more)

### Community 137 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 138 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 139 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder(), reopenInterruptedSession() (+8 more)

### Community 140 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 141 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 143 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 144 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 145 - "manager-proactive-inbox.test.ts"
Cohesion: 0.16
Nodes (9): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState() (+1 more)

### Community 146 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 147 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 148 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 149 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 150 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 151 - "SessionAdmissions"
Cohesion: 0.18
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 152 - "registerSessionKnowledgeRoutes"
Cohesion: 0.33
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 153 - "recordValue"
Cohesion: 0.27
Nodes (12): backgroundHandoff(), errorValue(), notificationKind(), parsedValue(), rawTailText(), recordValue(), shellStopAcknowledged(), shellTaskOutput() (+4 more)

### Community 154 - "copilot-sdk-client.ts"
Cohesion: 0.29
Nodes (9): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkMissingSessionRetirement, CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic() (+1 more)

### Community 156 - "ChatMessage"
Cohesion: 0.21
Nodes (10): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp(), StoredSession, ChatMessage (+2 more)

### Community 157 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 158 - "send-policy.test.ts"
Cohesion: 0.20
Nodes (10): SessionExecutionMode, TerminalSendPolicyInput, TerminalSendRequestOptions, booleans, combinations, executionModes, providers, replacing (+2 more)

### Community 159 - "session-response-order.ts"
Cohesion: 0.29
Nodes (10): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+2 more)

### Community 160 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 161 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 162 - "setupWorkspaceFixture"
Cohesion: 0.22
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 164 - "claude-recovery-admission.test.ts"
Cohesion: 0.25
Nodes (9): connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite() (+1 more)

### Community 165 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 166 - "settings-profile.test.ts"
Cohesion: 0.20
Nodes (6): applySettingsChanges(), sameSettingValue(), samePending(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 167 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 168 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 169 - "dreamer-routes.ts"
Cohesion: 0.27
Nodes (7): parse(), planSchema, registerDreamerRoutes(), settingsSchema, apps, directories, DreamerUnavailableError

### Community 170 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 171 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.27
Nodes (7): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult, submitSearch()

### Community 172 - "SpeakableSegmenter"
Cohesion: 0.29
Nodes (3): SpeakableSegmenter, validateMessageId(), ./server/oracle-voice-segments.ts

### Community 173 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 175 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 176 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 177 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 178 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 179 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 180 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 181 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 182 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 183 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 184 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 185 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 186 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1126 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1121 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1902 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `.publish`, `ClaudeAgentService`, `.recoverSdkSession`, `multi-node.test.ts`, `claude-agent-service.ts`, `agent-service.ts`, `.startAdmitted`, `server/side-question.ts`, `directory-browser.ts`, `.discoverTerminalSessions`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `.publish`, `ClaudeAgentService`, `.recoverSdkSession`, `AgentService`, `session-store.ts`, `claude-agent-service.ts`, `.startAdmitted`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ManagerToolHost` connect `manager-tools.ts` to `ManagerMemory`, `ManagerStructuredMemoryStore`, `dreamer-planner.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.0296702410707087 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.032417346500644054 - nodes in this community are weakly interconnected._
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
