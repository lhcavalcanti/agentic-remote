# Agentic Remote - Graphify code map

Snapshot: `3f66d0d7f3a6fd048a65b685f7cdcf2314c2a2d5654249f19ce808a4216933d6`

Source checkout: `8cf85ee732c4062a42551644cb6cb2dee1836f84`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 399 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 399 files · ~811,613 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6819 nodes · 18797 edges · 227 communities (188 shown, 23 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1022 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionDetail
- api.ts
- App
- App.tsx
- session-store.ts
- contracts.ts
- agent-service.ts
- claude-agent-service.ts
- oracle-voice-soak.ts
- OracleVoiceCoordinator
- terminal-session.ts
- agentic-remote-promotion-monitor
- ManagedSession
- fake-voice.ts
- PushNotificationService
- ManagerAgent
- manager-tools.ts
- oracle-voice-integration.test.ts
- CopilotSessionLike
- workspace-fixtures.ts
- session-presentation.ts
- RemoteNodeClient
- manager-structured-memory-validation.ts
- session-knowledge-store.ts
- tmux-test-helpers.ts
- oracle-voice-benchmark.ts
- VoiceAudioFrame
- send-matrix.integration.test.ts
- TmuxTerminalSessionController
- FakeVoiceEngine
- SessionService
- oracle-voice-session.ts
- markdown-navigation.ts
- TerminalSessionController
- oracle-voice-routes.test.ts
- app.ts
- client.ts
- agentic-remote
- session-resource-clear.test.ts
- hub-routes.ts
- bundle
- ProviderSessionService
- OracleVoiceClient
- delegated-transcription-service.ts
- ResidentVoiceWorker
- ManagerStore
- FakeSessionService
- VoicePlayback
- pwa.ts
- OracleDreamer.tsx
- AgentProvider
- DreamerStore
- client.test.ts
- shell.ts
- lib.rs
- VoiceCapture
- agentic-remote-promotion-setup
- dreamer-service.ts
- dreamer-store.ts
- terminal-session.test.ts
- agentic-remote-gate
- config.rs
- manager.ts
- manager-proactive-inbox.ts
- oracle-voice-routes.ts
- ChildVoiceEngine
- knowledge-tree.ts
- DreamerService
- manager-agent.test.ts
- capture.ts
- dependencies
- devDependencies
- session-enqueue-clear.test.ts
- active-sessions.ts
- recovery-resend-durability.test.ts
- KnowledgeStore
- manager-agent.ts
- oracle-voice-child.test.ts
- oracle-voice-child.ts
- manager-structured-memory.ts
- session-store-providers.test.ts
- dreamer-planner.ts
- node-routes.ts
- oracle-voice-security.test.ts
- oracle-voice-segments.ts
- remote-voice-client.ts
- .sendInternal
- oracle-voice.ts
- session-reply-durability.test.ts
- manager-structured-memory-search.ts
- SessionOrderStore
- shared/settings-profile.ts
- oracle-voice-worker.ts
- real-voice.ts
- session-directory.ts
- computer-manager-metadata.test.ts
- background-task-adapter.ts
- backgroundTasksFromEvents
- cli-canary.ts
- ManagerStructuredMemoryStore
- scripts
- session-patch-browser.ts
- EnabledOracleVoiceConfig
- oracle-voice-config.ts
- src/settings-profile.ts
- SettingsProfileClient
- ChatMessage
- use-session-knowledge-root.ts
- compilerOptions
- settings-profile-store.ts
- transcription-service.ts
- .toolHost
- SettingsProfileSnapshot
- ManagerAssistant
- capture-workspace.ts
- ManagerStructuredMemoryRuntime
- .observe
- oracle-voice-tickets.ts
- refusal-metrics.ts
- ManagerAssistant.tsx
- agent-service.test.ts
- full-gate.test.ts
- PromptCards.tsx
- compilerOptions
- .startAdmitted
- normalizeKnowledgeRelativePath
- ManagerProactiveInbox
- OnlineRecognizer
- workspace-browser.ts
- ManagerAssistant.test.tsx
- compilerOptions
- compilerOptions
- .correct
- dreamer-schedule.ts
- ManagerMemory
- use-oracle-settings.ts
- BoundedQueue
- ReaderWorkspace
- server/session-patches.ts
- session-latency-benchmark.ts
- startup-phases.test.ts
- NewSessionDialog
- capture
- terminal-form-deadline.test.ts
- background-task-stop.test.ts
- promotion-monitor.test.ts
- session-resource-routes.test.ts
- scripts
- registerSessionKnowledgeRoutes
- JournalRecorder
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- manager-proactive-inbox.test.ts
- session-knowledge-routes.ts
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- session-response-order.ts
- Pcm16Resampler
- DeferredSession
- session-knowledge-routes.test.ts
- background-task-tracker.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- dataset
- generate-pwa-icons.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- screenshot-stability.test.ts
- file-upload-routes.ts
- promotion-setup-execution.test.ts
- remote-node-client.test.ts
- SessionAdmissions
- tmux-errors.test.ts
- voice-recorder.ts
- vite.config.ts
- package.json
- normalizeBackgroundTask
- recovery-context.ts
- release-publication.test.ts
- session-patch-routes.test.ts
- OracleVoicePlayback
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- VoiceSttEngine
- promotion-setup.test.ts
- FakeRecorder
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
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
2. `AgentService` - 278 edges
3. `App()` - 278 edges
4. `SessionStore` - 189 edges
5. `ClaudeAgentService` - 126 edges
6. `ManagedSession` - 103 edges
7. `registerHubRoutes()` - 95 edges
8. `buildApp()` - 92 edges
9. `ComputerManager` - 89 edges
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
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (227 total, 23 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (15): agentMode(), AgentService, commandShortcut(), isTerminalNotReadyRefusal(), isUncertainDelivery(), RuntimeConfigurationError, stripAnsi(), suspendedRuntimeConflict() (+7 more)

### Community 1 - "SessionDetail"
Cohesion: 0.03
Nodes (25): ClaudeAgentService, isMissingClaudeSessionError(), claudeFixture(), fixture(), channels, directories, fixture(), observe() (+17 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (126): ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionSkillSummary, SettingsChange, SettingsProfileKey, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals (+118 more)

### Community 3 - "App"
Cohesion: 0.03
Nodes (139): isManagerEvent(), alertNotification(), terminalSendOptions(), askSession(), deleteSession(), activeComposerPastes(), App(), adoptConversationReplacement() (+131 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (107): react, AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+99 more)

### Community 5 - "session-store.ts"
Cohesion: 0.02
Nodes (79): CopilotClientLike, fixture(), holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+71 more)

### Community 6 - "contracts.ts"
Cohesion: 0.04
Nodes (61): AgentServiceEvents, ClaudeAgentServiceEvents, ComputerManagerEvents, RemoteSessionListing, DirectoryScope, directories, voiceControlQueues, voiceControlWaiters (+53 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.04
Nodes (70): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+62 more)

### Community 8 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (66): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+58 more)

### Community 9 - "oracle-voice-soak.ts"
Cohesion: 0.04
Nodes (37): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+29 more)

### Community 10 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (22): ManagerEventSource, ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect() (+14 more)

### Community 11 - "terminal-session.ts"
Cohesion: 0.05
Nodes (75): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerRowText() (+67 more)

### Community 12 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 13 - "ManagedSession"
Cohesion: 0.10
Nodes (12): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, TurnContextInput, AddComputerInput (+4 more)

### Community 14 - "fake-voice.ts"
Cohesion: 0.05
Nodes (13): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice() (+5 more)

### Community 15 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 16 - "ManagerAgent"
Cohesion: 0.10
Nodes (9): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, withTimeout() (+1 more)

### Community 17 - "manager-tools.ts"
Cohesion: 0.06
Nodes (34): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), steer() (+26 more)

### Community 18 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+23 more)

### Community 19 - "CopilotSessionLike"
Cohesion: 0.06
Nodes (33): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+25 more)

### Community 20 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (45): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+37 more)

### Community 21 - "session-presentation.ts"
Cohesion: 0.07
Nodes (50): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+42 more)

### Community 22 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (13): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, RemoteNodeCapabilityError, RemoteNodeRedirectError, RemoteNodeRequestError, RemoteNodeTransportError (+5 more)

### Community 23 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 24 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (31): WorkspaceFixtureState, bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState (+23 more)

### Community 25 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (44): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+36 more)

### Community 26 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (42): execFileAsync, RealVoiceState, benchmarkFixture(), benchmarkGroup(), BenchmarkMetric, BenchmarkProfile, buildConfig(), CliOptions (+34 more)

### Community 27 - "VoiceAudioFrame"
Cohesion: 0.05
Nodes (28): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, QueuedAudio, capabilities, confirm(), control(), defaults (+20 more)

### Community 28 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (46): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+38 more)

### Community 29 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (13): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+5 more)

### Community 30 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (24): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+16 more)

### Community 31 - "SessionService"
Cohesion: 0.07
Nodes (4): registerNodeRoutes(), SessionService, WorkspaceListing, KnowledgeFolderState

### Community 32 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (17): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), outputBytes() (+9 more)

### Community 33 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (40): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+32 more)

### Community 34 - "TerminalSessionController"
Cohesion: 0.08
Nodes (8): persistedFormAnswer(), removeCopilotSessionFiles(), TerminalFormContinuation, TerminalFormReplyError, TerminalSessionController, ConfigureRuntimeInput, PendingUserInput, UserInputReplyInput

### Community 35 - "oracle-voice-routes.test.ts"
Cohesion: 0.05
Nodes (17): ActiveBackendSession, nodeVoiceCapabilities(), GatedVoiceEngineFactory, ObservedLocalVoiceBackend, openApps, openSockets, RouteManager, RouteVoiceBackend (+9 more)

### Community 36 - "app.ts"
Cohesion: 0.06
Nodes (29): prefixes, session, trusted, untrusted, apps, directories, buildApp(), BuildAppOptions (+21 more)

### Community 37 - "client.ts"
Cohesion: 0.07
Nodes (26): VoiceCapabilities, closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, OracleVoiceClientOptions (+18 more)

### Community 38 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 39 - "session-resource-clear.test.ts"
Cohesion: 0.05
Nodes (39): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), deferred() (+31 more)

### Community 40 - "hub-routes.ts"
Cohesion: 0.06
Nodes (42): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+34 more)

### Community 41 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 43 - "OracleVoiceClient"
Cohesion: 0.15
Nodes (7): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, playbackClientError(), terminalCloseCode()

### Community 44 - "delegated-transcription-service.ts"
Cohesion: 0.09
Nodes (18): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+10 more)

### Community 45 - "ResidentVoiceWorker"
Cohesion: 0.12
Nodes (10): combinedTranscript(), matchesCancelled(), pcm16ToFloat32(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceGenerationIdentity, VoiceSynthesisRequest (+2 more)

### Community 46 - "ManagerStore"
Cohesion: 0.08
Nodes (9): openStore(), emptyState(), ManagerStore, messageSource(), storedMessage(), open(), createManager(), StoredManager (+1 more)

### Community 47 - "FakeSessionService"
Cohesion: 0.07
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 48 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 49 - "pwa.ts"
Cohesion: 0.09
Nodes (38): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+30 more)

### Community 50 - "OracleDreamer.tsx"
Cohesion: 0.10
Nodes (32): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, getDreamer() (+24 more)

### Community 51 - "AgentProvider"
Cohesion: 0.09
Nodes (29): CreationRuntime, JournalRecorderOptions, Seen, PersistedCursor, JournalDraft, JournalEntry, JournalKind, ManagerState (+21 more)

### Community 52 - "DreamerStore"
Cohesion: 0.14
Nodes (9): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, isMissing(), toPersistedPlan() (+1 more)

### Community 53 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 54 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 55 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 56 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 57 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 58 - "dreamer-service.ts"
Cohesion: 0.09
Nodes (27): DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), projectDreamerRegistry(), projectRegistryEntry(), digest(), DreamerPlannerExecutionInput (+19 more)

### Community 59 - "dreamer-store.ts"
Cohesion: 0.08
Nodes (31): assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES, DREAMER_STAGING_PREFIX (+23 more)

### Community 60 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (32): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+24 more)

### Community 61 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 62 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 63 - "manager.ts"
Cohesion: 0.08
Nodes (25): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+17 more)

### Community 64 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (36): assertExactKeys(), DISPOSITIONS, EVENT_KINDS, hasExactKeys(), isAlreadyExists(), isDisposition(), isEventKind(), isId() (+28 more)

### Community 65 - "oracle-voice-routes.ts"
Cohesion: 0.11
Nodes (32): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+24 more)

### Community 66 - "ChildVoiceEngine"
Cohesion: 0.14
Nodes (7): ChildVoiceEngine, errorMessage(), matchesCancelled(), matchesSynthesis(), matchesUtterance(), rememberCancellation(), VoiceChildProcess

### Community 67 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 68 - "DreamerService"
Cohesion: 0.15
Nodes (11): parse(), planSchema, registerDreamerRoutes(), settingsSchema, apps, directories, setup(), DreamerService (+3 more)

### Community 69 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (14): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+6 more)

### Community 70 - "capture.ts"
Cohesion: 0.07
Nodes (17): ORACLE_VOICE_SAMPLE_RATE, BufferedFrame, defaultAudioContext(), positiveLimit(), CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode (+9 more)

### Community 71 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 72 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 73 - "session-enqueue-clear.test.ts"
Cohesion: 0.08
Nodes (26): Admission, ExclusiveAdmission, PendingQueueAdmission, disk, fixture(), fixtures, gate(), holdTurnWrite() (+18 more)

### Community 74 - "active-sessions.ts"
Cohesion: 0.12
Nodes (32): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+24 more)

### Community 75 - "recovery-resend-durability.test.ts"
Cohesion: 0.08
Nodes (19): restart(), directories, disk, fixture(), gate(), gates, httpBoundary(), initialize() (+11 more)

### Community 76 - "KnowledgeStore"
Cohesion: 0.12
Nodes (13): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+5 more)

### Community 77 - "manager-agent.ts"
Cohesion: 0.10
Nodes (27): discover(), isPending(), isQueued(), ManagerAgentOptions, Rung, TURN_ACTIVITY, ago(), attentionRank() (+19 more)

### Community 78 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 79 - "oracle-voice-child.ts"
Cohesion: 0.08
Nodes (26): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), float32ToPcm16() (+18 more)

### Community 80 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (28): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+20 more)

### Community 81 - "session-store-providers.test.ts"
Cohesion: 0.08
Nodes (12): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+4 more)

### Community 82 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (27): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+19 more)

### Community 83 - "node-routes.ts"
Cohesion: 0.07
Nodes (31): MAX_SESSION_FILE_BYTES, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+23 more)

### Community 84 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (19): FakeVoiceEngineCall, apps, config, configFixture(), connect(), createManager(), Inbox, issueTicket() (+11 more)

### Community 85 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 86 - "remote-voice-client.ts"
Cohesion: 0.16
Nodes (14): VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+6 more)

### Community 87 - ".sendInternal"
Cohesion: 0.18
Nodes (26): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+18 more)

### Community 88 - "oracle-voice.ts"
Cohesion: 0.16
Nodes (28): decodeVoiceAudioFrame(), encodeVoiceAudioFrame(), hasExactKeys(), hasOnlyKeys(), hasRequiredKeys(), isBoundedTrimmedString(), isControlBase(), isFiniteNumber() (+20 more)

### Community 89 - "session-reply-durability.test.ts"
Cohesion: 0.12
Nodes (20): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+12 more)

### Community 90 - "manager-structured-memory-search.ts"
Cohesion: 0.11
Nodes (25): DreamerMemoryMetadataRecord, authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord() (+17 more)

### Community 91 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 92 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (28): AccentSetting, appearanceSettings, isRecord(), isSettingsRevision(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting, NewSessionRuntimesSetting (+20 more)

### Community 93 - "oracle-voice-worker.ts"
Cohesion: 0.10
Nodes (23): VoiceWorkerOptions, VoiceEndUtterance, VoiceStartUtterance, VoiceTtsEngine, BlockingEngine, capabilityFromConfig(), exactKeys(), isCancelledEvent() (+15 more)

### Community 94 - "real-voice.ts"
Cohesion: 0.12
Nodes (11): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+3 more)

### Community 95 - "session-directory.ts"
Cohesion: 0.19
Nodes (20): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+12 more)

### Community 96 - "computer-manager-metadata.test.ts"
Cohesion: 0.11
Nodes (11): fixture(), managers, releases, remote, session(), ComputerRegistry, RegistryState, directories (+3 more)

### Community 97 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (25): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus() (+17 more)

### Community 98 - "backgroundTasksFromEvents"
Cohesion: 0.19
Nodes (27): addActivity(), backgroundHandoff(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventString(), eventTask(), lastForegroundCompletionAt() (+19 more)

### Community 99 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 100 - "ManagerStructuredMemoryStore"
Cohesion: 0.14
Nodes (9): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open() (+1 more)

### Community 101 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 102 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (24): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+16 more)

### Community 103 - "EnabledOracleVoiceConfig"
Cohesion: 0.10
Nodes (12): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, voiceBackend(), EnabledOracleVoiceConfig (+4 more)

### Community 104 - "oracle-voice-config.ts"
Cohesion: 0.14
Nodes (22): boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger(), optionalValue() (+14 more)

### Community 105 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (21): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+13 more)

### Community 106 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 107 - "ChatMessage"
Cohesion: 0.14
Nodes (12): Connection, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset, StoredSession, ChatMessage (+4 more)

### Community 108 - "use-session-knowledge-root.ts"
Cohesion: 0.12
Nodes (20): addComputer(), deleteKnowledgeRoot(), getSessionKnowledgeRoot(), removeComputer(), requestSessionKnowledgeRoot(), requestVoid(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot() (+12 more)

### Community 109 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 110 - "settings-profile-store.ts"
Cohesion: 0.14
Nodes (14): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+6 more)

### Community 111 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 112 - ".toolHost"
Cohesion: 0.13
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 113 - "SettingsProfileSnapshot"
Cohesion: 0.15
Nodes (9): applySettingsImport(), SettingsProfileSnapshot, validateSettingsImport(), seedHubSettings(), settingsProfileCacheKey, SettingsProfileTransport, cached(), FakeHub (+1 more)

### Community 114 - "ManagerAssistant"
Cohesion: 0.13
Nodes (20): cancelManager(), editQueuedManagerMessage(), retryManagerMessage(), applyEvent(), conversationStateLabel(), ManagerAssistant(), act(), announce() (+12 more)

### Community 115 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 116 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.15
Nodes (14): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+6 more)

### Community 117 - ".observe"
Cohesion: 0.16
Nodes (10): canonicalHash(), cloneState(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError (+2 more)

### Community 118 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 119 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 120 - "ManagerAssistant.tsx"
Cohesion: 0.13
Nodes (17): ManagerSessionRef, ManagerStatus, sessionLinkTarget(), boundWidth(), canTakeFocus(), ORACLE_CONVERSATION_WIDTH_MIN, ORACLE_PANEL_WIDTH_MIN, OracleIndicator (+9 more)

### Community 121 - "agent-service.test.ts"
Cohesion: 0.14
Nodes (12): terminalFormSteps(), busyTerminal(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService(), services (+4 more)

### Community 122 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 123 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 124 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 125 - ".startAdmitted"
Cohesion: 0.17
Nodes (3): normalizedTitle(), cloneSession(), StartupPhases

### Community 126 - "normalizeKnowledgeRelativePath"
Cohesion: 0.21
Nodes (16): knowledgeRelativePathSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot() (+8 more)

### Community 127 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 128 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 129 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (16): assertOpenedFilePath(), fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath() (+8 more)

### Community 130 - "ManagerAssistant.test.tsx"
Cohesion: 0.10
Nodes (13): removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), sendManagerMessage(), startOver(), OracleButton(), OracleControl, conversationCapability (+5 more)

### Community 131 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 132 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 133 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 134 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 135 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 136 - "use-oracle-settings.ts"
Cohesion: 0.19
Nodes (12): getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps, models (+4 more)

### Community 137 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 138 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 139 - "server/session-patches.ts"
Cohesion: 0.20
Nodes (8): publish(), diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 140 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 141 - "startup-phases.test.ts"
Cohesion: 0.13
Nodes (11): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseRecord, address, directories, recorder() (+3 more)

### Community 142 - "NewSessionDialog"
Cohesion: 0.18
Nodes (17): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+9 more)

### Community 143 - "capture"
Cohesion: 0.18
Nodes (16): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+8 more)

### Community 144 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 145 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 146 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 147 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 148 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 149 - "registerSessionKnowledgeRoutes"
Cohesion: 0.27
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 150 - "JournalRecorder"
Cohesion: 0.27
Nodes (3): JournalRecorder, sessionTask(), registryKey()

### Community 151 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 152 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 153 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 154 - "manager-proactive-inbox.test.ts"
Cohesion: 0.16
Nodes (9): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState() (+1 more)

### Community 155 - "session-knowledge-routes.ts"
Cohesion: 0.14
Nodes (9): knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema, SessionKnowledgeLifecycle, sessionParams (+1 more)

### Community 156 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 157 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 158 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 159 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 160 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 161 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 163 - "session-knowledge-routes.test.ts"
Cohesion: 0.18
Nodes (9): ServerRole, SessionMetadataLookup, disk, FakeManager, fixtures, gate(), holdWrite(), releases (+1 more)

### Community 164 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 165 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 166 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 167 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 168 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 169 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 170 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 171 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 172 - "file-upload-routes.ts"
Cohesion: 0.33
Nodes (5): FileUploadError, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile()

### Community 173 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 174 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 176 - "tmux-errors.test.ts"
Cohesion: 0.25
Nodes (6): directories, { execute }, files, links, listener(), server()

### Community 177 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 178 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 179 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 180 - "normalizeBackgroundTask"
Cohesion: 0.32
Nodes (8): attachmentModeValue(), booleanValue(), executionModeValue(), normalizeBackgroundTask(), numberValue(), progressValue(), shellTaskMode(), statusValue()

### Community 181 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 182 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 183 - "session-patch-routes.test.ts"
Cohesion: 0.29
Nodes (5): apps, directories, FakeManager, fixture(), trusted

### Community 185 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 186 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 187 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 188 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 189 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 191 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 196 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **1132 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1127 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1912 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `TerminalSessionController`, `contracts.ts`, `agent-service.ts`, `claude-agent-service.ts`, `recovery-resend-durability.test.ts`, `CopilotSessionLike`, `.startAdmitted`, `session-directory.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `TerminalSessionController`, `session-store.ts`, `contracts.ts`, `agent-service.ts`, `session-store-providers.test.ts`, `.startAdmitted`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `TerminalSessionController`, `contracts.ts`, `claude-agent-service.ts`, `ManagedSession`, `remote-voice-client.ts`, `SessionService`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1132 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.037793038124556005 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.034389639019013506 - nodes in this community are weakly interconnected._
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
- `docs/superpowers/plans/2026-11-05-session-knowledge-api.md`
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-17-oracle-proactive-lifecycle-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
- `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`
- `docs/superpowers/specs/2026-11-05-session-knowledge-api-design.md`
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
