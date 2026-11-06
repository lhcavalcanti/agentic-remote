# Agentic Remote - Graphify code map

Snapshot: `3ffbea6ff07da14d7e4abdc1744b211d0463b91c1068bbf57f5fb0eb5e537a83`

Source checkout: `51e02d59149d9086b7d7e0d5cc755d10ef63a307`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 407 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 407 files · ~830,965 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6966 nodes · 19316 edges · 211 communities (171 shown, 24 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1020 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionDetail
- App
- api.ts
- App.tsx
- oracle-voice.ts
- oracle-voice-child.ts
- ClaudeAgentService
- agent-service.ts
- agent-service.test.ts
- oracle-voice-routes.test.ts
- claude-agent-service.ts
- ManagerAssistant.tsx
- contracts.ts
- oracle-voice-routes.ts
- terminal-session.ts
- oracle-voice-integration.test.ts
- dreamer-store.ts
- agentic-remote-promotion-monitor
- oracle-voice-soak.ts
- OracleVoiceClient
- ManagedSession
- manager-tools.ts
- ManagerAgent
- VoiceCapture
- queued-dispatch.test.ts
- FakeVoiceEngine
- oracle-task-store.ts
- hub-routes.ts
- session-presentation.ts
- oracle-voice-worker.ts
- manager-structured-memory-validation.ts
- session-knowledge-store.ts
- markdown-navigation.ts
- session-knowledge-routes.test.ts
- FakeManager
- send-matrix.integration.test.ts
- ManagerStore
- workspace-fixtures.ts
- TmuxTerminalSessionController
- active-sessions.ts
- RemoteNodeClient
- OracleDreamer.tsx
- tmux-test-helpers.ts
- oracle-voice-session.ts
- DreamerService
- agentic-remote
- oracle-voice-benchmark.ts
- session-patch-browser.ts
- bundle
- ProviderSessionService
- pwa.ts
- manager-agent.ts
- SessionService
- OracleVoiceCoordinator
- shell.ts
- lib.rs
- oracle-voice-config.ts
- terminal-session.test.ts
- agentic-remote-promotion-setup
- delegated-transcription-service.ts
- manager-agent.test.ts
- manager-proactive-inbox.ts
- manager-structured-memory.ts
- agentic-remote-gate
- config.rs
- dreamer-planner.ts
- dreamer-service.ts
- oracle-voice-security.test.ts
- ManagerMessage
- react
- ManagerStructuredMemoryStore
- dependencies
- devDependencies
- VoiceClientControl
- app.ts
- FakeSessionService
- manager-structured-memory-search.ts
- node-routes.ts
- shared/settings-profile.ts
- oracle-voice-segments.ts
- .sendInternal
- src/settings-profile.ts
- capture-workspace.ts
- UserInputReplyInput
- VoicePlayback
- SessionOrderStore
- backgroundTasksFromEvents
- settings-profile-store.ts
- KnowledgeStore
- background-task-stop.test.ts
- cli-canary.ts
- OracleSettings.tsx
- push-notification-service.ts
- PushNotificationService
- scripts
- directory-browser.ts
- manager-context.ts
- session-knowledge-routes.ts
- compilerOptions
- .discoverSessions
- transcription-service.ts
- SettingsProfileClient
- background-task-adapter.ts
- manager-proactive-coordinator.ts
- startup-phases.test.ts
- ChatMessage
- oracle-voice-tickets.ts
- submission-error.ts
- full-gate.test.ts
- session-reply-durability.test.ts
- PromptCards.tsx
- knowledge-tree.ts
- compilerOptions
- server/side-question.ts
- .toolHost
- .observe
- ManagerProactiveInbox
- session-store-providers.test.ts
- OnlineRecognizer
- compilerOptions
- compilerOptions
- ManagerMemory
- SessionStatus
- workspace-browser.ts
- dreamer-schedule.ts
- file-upload-routes.ts
- VoiceTurnState
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- manager-runtime.ts
- NewSessionDialog
- refusal-metrics.ts
- terminal-form-deadline.test.ts
- promotion-monitor.test.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- scripts
- oracle-voice-assets.test.ts
- pending-echo.ts
- fake-vad.ts
- desktop.json
- manager-proactive-inbox.test.ts
- .handleManagerEvent
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- session-resource-clear.test.ts
- dreamer-routes.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- DeferredSession
- HubEvent
- dataset
- generate-pwa-icons.ts
- claude-recovery-admission.test.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- KnowledgePosition
- promotion-setup-execution.test.ts
- remote-node-client.test.ts
- SessionAdmissions
- settings-profile.test.ts
- vite.config.ts
- package.json
- SessionFileUpload
- release-publication.test.ts
- oracle-conversation-real.test.ts
- render-workspace-gifs.ts
- backgroundHandoff
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- .transport
- composer-layout.test.ts
- recovery-context.ts
- promotion-setup.test.ts
- push-routes.ts
- terminal-send-uncertainty.test.ts
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
1. `SessionDetail` - 309 edges
2. `AgentService` - 280 edges
3. `App()` - 278 edges
4. `SessionStore` - 189 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 109 edges
7. `buildApp()` - 95 edges
8. `ManagerAgent` - 95 edges
9. `registerHubRoutes()` - 93 edges
10. `ComputerManager` - 87 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (211 total, 24 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (14): agentMode(), AgentService, commandShortcut(), isTerminalNotReadyRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, stripAnsi(), suspendedRuntimeConflict() (+6 more)

### Community 1 - "SessionDetail"
Cohesion: 0.03
Nodes (78): fixture(), restart(), createStore(), recoveryFixture(), fixture(), fixture(), fixture(), fixture() (+70 more)

### Community 2 - "App"
Cohesion: 0.03
Nodes (160): listKnowledgeEntries(), readKnowledgeFile(), recoverConversation(), removeQueuedPrompt(), restartSession(), setSessionNotificationsMuted(), uploadSessionFile(), activeComposerPastes() (+152 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (128): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, addKnowledgeRoot(), askSession(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelManager() (+120 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (116): addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+108 more)

### Community 5 - "oracle-voice.ts"
Cohesion: 0.03
Nodes (80): AudioReservation, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities, closeServers, exactArrayBuffer() (+72 more)

### Community 6 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (54): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+46 more)

### Community 7 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (28): ClaudeAgentService, ClaudeSdk, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services (+20 more)

### Community 8 - "agent-service.ts"
Cohesion: 0.04
Nodes (78): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+70 more)

### Community 9 - "agent-service.test.ts"
Cohesion: 0.02
Nodes (66): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+58 more)

### Community 10 - "oracle-voice-routes.test.ts"
Cohesion: 0.03
Nodes (38): ActiveBackendSession, BrowserTestSessionService, installFakeBrowserVoice(), ScriptedUtterance, Window, clockTicksPerSecond(), execFileAsync, GenerationMetrics (+30 more)

### Community 11 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (69): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+61 more)

### Community 12 - "ManagerAssistant.tsx"
Cohesion: 0.04
Nodes (65): ManagerStatus, editQueuedManagerMessage(), getManager(), getOracleVoiceCapabilities(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage() (+57 more)

### Community 13 - "contracts.ts"
Cohesion: 0.04
Nodes (48): ClaudeAgentServiceEvents, directories, voiceControlQueues, voiceControlWaiters, ProviderSessionServiceEvents, DEFINITE_DISPATCH_REFUSALS, REDIRECT_STATUSES, RemoteNodeClientEvents (+40 more)

### Community 14 - "oracle-voice-routes.ts"
Cohesion: 0.04
Nodes (60): ManagerEventSource, ManagerEventSource, nodeVoiceCapabilities(), sendNodeVoiceOutput(), backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OracleVoiceBackendConnection (+52 more)

### Community 15 - "terminal-session.ts"
Cohesion: 0.05
Nodes (75): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerRowText() (+67 more)

### Community 16 - "oracle-voice-integration.test.ts"
Cohesion: 0.03
Nodes (35): FakeManager, apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+27 more)

### Community 17 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (44): validateDreamerTimeZone(), assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+36 more)

### Community 18 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 19 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 20 - "OracleVoiceClient"
Cohesion: 0.07
Nodes (19): captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceClient (+11 more)

### Community 21 - "ManagedSession"
Cohesion: 0.10
Nodes (14): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, TurnContextInput, ManagerProactiveCoordinatorOptions (+6 more)

### Community 22 - "manager-tools.ts"
Cohesion: 0.05
Nodes (41): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), proactiveSessionAllowed(), requireComputer(), resolveSession() (+33 more)

### Community 23 - "ManagerAgent"
Cohesion: 0.09
Nodes (11): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+3 more)

### Community 24 - "VoiceCapture"
Cohesion: 0.06
Nodes (14): defaultDependencies(), captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureOptions, VoiceVadOptions, OracleVoiceClientDependencies (+6 more)

### Community 25 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (32): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDelivery, QueuedDispatches (+24 more)

### Community 26 - "FakeVoiceEngine"
Cohesion: 0.05
Nodes (27): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), config, VoiceSttEngine, VoiceTtsEngine (+19 more)

### Community 27 - "oracle-task-store.ts"
Cohesion: 0.08
Nodes (41): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+33 more)

### Community 28 - "hub-routes.ts"
Cohesion: 0.05
Nodes (55): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+47 more)

### Community 29 - "session-presentation.ts"
Cohesion: 0.07
Nodes (50): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+42 more)

### Community 30 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (26): benchmarkGroup(), VoiceGenerationIdentity, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys() (+18 more)

### Community 31 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 32 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (32): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+24 more)

### Community 33 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (44): executeCommand(), listWorkspace(), readWorkspaceFile(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+36 more)

### Community 34 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (30): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+22 more)

### Community 35 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 36 - "send-matrix.integration.test.ts"
Cohesion: 0.05
Nodes (46): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+38 more)

### Community 37 - "ManagerStore"
Cohesion: 0.07
Nodes (19): openStore(), JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), emptyState(), JournalDraft, JournalEntry (+11 more)

### Community 38 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (41): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+33 more)

### Community 39 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (13): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+5 more)

### Community 40 - "active-sessions.ts"
Cohesion: 0.08
Nodes (44): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+36 more)

### Community 41 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (9): RemoteResync, RemoteSessionRead, RemoteNodeClient, BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing (+1 more)

### Community 42 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (42): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+34 more)

### Community 43 - "tmux-test-helpers.ts"
Cohesion: 0.09
Nodes (38): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+30 more)

### Community 44 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (15): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), QueuedOutput (+7 more)

### Community 45 - "DreamerService"
Cohesion: 0.13
Nodes (14): digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), safeRunError(), unavailableSnapshot(), uniqueSessionRefs(), DreamerRunClaim (+6 more)

### Community 46 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 47 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (39): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, deferred() (+31 more)

### Community 48 - "session-patch-browser.ts"
Cohesion: 0.08
Nodes (34): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+26 more)

### Community 49 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 51 - "pwa.ts"
Cohesion: 0.09
Nodes (38): AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+30 more)

### Community 52 - "manager-agent.ts"
Cohesion: 0.09
Nodes (29): automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung, SCHEDULE_RETRY_DELAYS_MS, TURN_ACTIVITY (+21 more)

### Community 54 - "OracleVoiceCoordinator"
Cohesion: 0.11
Nodes (6): AudioCompletion, AudioGate, OracleVoiceCoordinator, resolvedAudioGate(), terminalStartupCloseCode(), ActiveConversation

### Community 55 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 56 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 57 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (27): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+19 more)

### Community 58 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (32): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+24 more)

### Community 59 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 60 - "delegated-transcription-service.ts"
Cohesion: 0.09
Nodes (16): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+8 more)

### Community 61 - "manager-agent.test.ts"
Cohesion: 0.07
Nodes (15): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+7 more)

### Community 62 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isAlreadyExists(), isDisposition() (+29 more)

### Community 63 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (31): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+23 more)

### Community 64 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 65 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 66 - "dreamer-planner.ts"
Cohesion: 0.10
Nodes (30): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+22 more)

### Community 67 - "dreamer-service.ts"
Cohesion: 0.09
Nodes (22): DreamerMemoryMetadata, DreamerMemoryMetadataRecord, DreamerPlanDraft, DreamerPlannerInput, boundedText(), DreamerPlannerExecutionInput, DreamerServiceOptions, directories (+14 more)

### Community 68 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (22): VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), connect(), createManager(), Inbox (+14 more)

### Community 69 - "ManagerMessage"
Cohesion: 0.08
Nodes (19): FakeVoiceState, ProactiveManager, confirmationSchema, defaultsSchema, editSchema, effort, managerCadence, managerInputError() (+11 more)

### Community 70 - "react"
Cohesion: 0.08
Nodes (21): react, SessionRetention, SessionRetentionPatch, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), updateSessionKnowledgeRoot(), MarkdownCodeBlock(), copy() (+13 more)

### Community 71 - "ManagerStructuredMemoryStore"
Cohesion: 0.14
Nodes (10): initializeManagerStructuredMemory(), digest(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMutationResult (+2 more)

### Community 72 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 73 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 74 - "VoiceClientControl"
Cohesion: 0.14
Nodes (15): BrowserCaptureOptions, VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError() (+7 more)

### Community 75 - "app.ts"
Cohesion: 0.09
Nodes (19): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence (+11 more)

### Community 76 - "FakeSessionService"
Cohesion: 0.09
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 77 - "manager-structured-memory-search.ts"
Cohesion: 0.11
Nodes (27): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+19 more)

### Community 78 - "node-routes.ts"
Cohesion: 0.07
Nodes (30): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema (+22 more)

### Community 79 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (31): AccentSetting, appearanceSettings, applySettingsChanges(), isRecord(), isSettingsRevision(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting (+23 more)

### Community 80 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 81 - ".sendInternal"
Cohesion: 0.18
Nodes (26): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+18 more)

### Community 82 - "src/settings-profile.ts"
Cohesion: 0.09
Nodes (24): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, statuslineItems (+16 more)

### Community 83 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 84 - "UserInputReplyInput"
Cohesion: 0.15
Nodes (7): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, PendingUserInput, UserInputReplyInput, deliveryUncertaintyFromError()

### Community 85 - "VoicePlayback"
Cohesion: 0.13
Nodes (6): pcm16ToFloat(), SegmentDrain, FakeSource, harness(), validateGeneration(), VoicePlayback

### Community 86 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 87 - "backgroundTasksFromEvents"
Cohesion: 0.18
Nodes (28): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventString(), eventTask(), executionModeValue(), lastForegroundCompletionAt() (+20 more)

### Community 88 - "settings-profile-store.ts"
Cohesion: 0.13
Nodes (17): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+9 more)

### Community 89 - "KnowledgeStore"
Cohesion: 0.16
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 90 - "background-task-stop.test.ts"
Cohesion: 0.13
Nodes (18): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot(), started() (+10 more)

### Community 91 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 92 - "OracleSettings.tsx"
Cohesion: 0.12
Nodes (20): ManagerState, ManagerCheckCadenceMinutes, ManagerProactiveSettings, ManagerProactiveSnapshot, updateManagerSettings(), checkCadences, editableProactive(), effortFrom() (+12 more)

### Community 93 - "push-notification-service.ts"
Cohesion: 0.14
Nodes (19): brief(), OracleEventSource, PushPolicy, PushSender, PushState, RFC-8030, alertNotification(), notificationAllowed() (+11 more)

### Community 94 - "PushNotificationService"
Cohesion: 0.20
Nodes (3): PushNotificationService, scoped(), registerPushRoutes()

### Community 95 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 96 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 97 - "manager-context.ts"
Cohesion: 0.15
Nodes (18): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+10 more)

### Community 98 - "session-knowledge-routes.ts"
Cohesion: 0.13
Nodes (17): Lineage, registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+9 more)

### Community 99 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 100 - ".discoverSessions"
Cohesion: 0.16
Nodes (3): normalizedTitle(), httpBoundary(), StartupPhases

### Community 101 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 102 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 103 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (21): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isLiveTaskStatus(), isOlderExecution(), isShellObserverTool() (+13 more)

### Community 104 - "manager-proactive-coordinator.ts"
Cohesion: 0.20
Nodes (5): batchMessageId(), isTerminal(), ManagerProactiveCoordinator, oneLine(), ManagerProactiveInboxEvent

### Community 105 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (13): phases, port, createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address (+5 more)

### Community 106 - "ChatMessage"
Cohesion: 0.16
Nodes (9): nextVoiceControl(), Client, Browser, seedOffset, ChatMessage, HubResyncRequest, HubWireEvent, Base (+1 more)

### Community 107 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 108 - "submission-error.ts"
Cohesion: 0.15
Nodes (13): directories, runtimes, start(), trusted, RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals (+5 more)

### Community 109 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 110 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 111 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 112 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 114 - "server/side-question.ts"
Cohesion: 0.18
Nodes (7): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout()

### Community 115 - ".toolHost"
Cohesion: 0.14
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 116 - ".observe"
Cohesion: 0.18
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 117 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 118 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession() (+1 more)

### Community 119 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 120 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 121 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 122 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 123 - "SessionStatus"
Cohesion: 0.13
Nodes (17): PersistedCursor, message(), Row, sendLikeTheApp(), SdkRestartRecovery, SessionExecutionMode, SessionStatus, terminalSendOptions() (+9 more)

### Community 124 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 125 - "dreamer-schedule.ts"
Cohesion: 0.23
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 126 - "file-upload-routes.ts"
Cohesion: 0.16
Nodes (10): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), registerTranscriptionRoutes(), transcriptionMultipartOptions (+2 more)

### Community 127 - "VoiceTurnState"
Cohesion: 0.18
Nodes (3): errorMessage(), PendingFinalTurn, VoiceTurnState

### Community 128 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 129 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 130 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 131 - "manager-runtime.ts"
Cohesion: 0.21
Nodes (12): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+4 more)

### Community 132 - "NewSessionDialog"
Cohesion: 0.18
Nodes (17): provider(), activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+9 more)

### Community 133 - "refusal-metrics.ts"
Cohesion: 0.18
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+7 more)

### Community 134 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 135 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 136 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 137 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 138 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 139 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 140 - "pending-echo.ts"
Cohesion: 0.24
Nodes (11): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, PendingEchoOwner, prunePendingEchoMap() (+3 more)

### Community 141 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 142 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 143 - "manager-proactive-inbox.test.ts"
Cohesion: 0.16
Nodes (9): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState() (+1 more)

### Community 145 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 146 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 147 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 148 - "session-resource-clear.test.ts"
Cohesion: 0.21
Nodes (12): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+4 more)

### Community 149 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 150 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 151 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 153 - "HubEvent"
Cohesion: 0.20
Nodes (5): ComputerManagerEvents, HubEventSource, directories, RFC-8030, HubEvent

### Community 154 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 155 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 156 - "claude-recovery-admission.test.ts"
Cohesion: 0.27
Nodes (8): connect(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite(), releases

### Community 157 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 158 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 159 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 160 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 161 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 163 - "settings-profile.test.ts"
Cohesion: 0.25
Nodes (4): resolveAppearance(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 164 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 165 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 167 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 169 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 170 - "backgroundHandoff"
Cohesion: 0.38
Nodes (7): attachmentModeValue(), backgroundHandoff(), booleanValue(), rawTailText(), shellStopAcknowledged(), shellTaskMode(), toolTelemetryProperties()

### Community 171 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 172 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 173 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 175 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 176 - "recovery-context.ts"
Cohesion: 0.47
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 177 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 178 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

## Knowledge Gaps
- **1151 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1146 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1938 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `directory-browser.ts`, `.discoverSessions`, `SessionFileUpload`, `agent-service.ts`, `claude-agent-service.ts`, `contracts.ts`, `server/side-question.ts`, `UserInputReplyInput`, `queued-dispatch.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `.discoverSessions`, `SessionFileUpload`, `ClaudeAgentService`, `agent-service.ts`, `claude-agent-service.ts`, `UserInputReplyInput`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ClaudeAgentService` connect `ClaudeAgentService` to `AgentService`, `SessionDetail`, `directory-browser.ts`, `.discoverSessions`, `SessionFileUpload`, `claude-agent-service.ts`, `contracts.ts`, `UserInputReplyInput`, `SessionService`, `queued-dispatch.test.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1151 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.0340968771462045 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.030303030303030304 - nodes in this community are weakly interconnected._
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
- `docs/superpowers/plans/2026-11-06-oracle-actionable-morning-plan.md`
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-17-oracle-proactive-lifecycle-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
- `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`
- `docs/superpowers/specs/2026-11-04-oracle-periodic-checks-design.md`
- `docs/superpowers/specs/2026-11-06-oracle-actionable-morning-plan-design.md`
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
