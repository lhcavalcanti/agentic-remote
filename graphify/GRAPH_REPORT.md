# Agentic Remote - Graphify code map

Snapshot: `7d918d21e98098f654ea00103fab7e3d789065316cac4597a50106c04d96e2be`

Source checkout: `3f9cf7faf70018d220608bcffe47014aecad1eb8`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 407 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 407 files · ~855,652 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7053 nodes · 19606 edges · 215 communities (174 shown, 25 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1033 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionDetail
- AgentService
- App
- api.ts
- App.tsx
- ClaudeAgentService
- .readAfterWrites
- contracts.ts
- agent-service.ts
- CopilotClientLike
- manager-tools.ts
- oracle-voice-session.ts
- claude-agent-service.ts
- computer-manager.ts
- node-routes.ts
- oracle-voice-child.ts
- oracle-voice-soak.ts
- agentic-remote-promotion-monitor
- ManagedSession
- ManagerAgent
- session-presentation.ts
- terminal-session.ts
- manager-agent.ts
- oracle-voice-integration.test.ts
- workspace-fixtures.ts
- PushNotificationService
- oracle-task-store.ts
- transcription-service.ts
- active-sessions.ts
- oracle-voice-routes.ts
- oracle-voice-worker.ts
- queued-dispatch.test.ts
- session-latency-benchmark.ts
- manager-structured-memory-validation.ts
- oracle-voice.ts
- markdown-navigation.ts
- FakeManager
- session-knowledge-store.ts
- ManagerAssistant.tsx
- session-knowledge-routes.test.ts
- dreamer-service.ts
- send-matrix.integration.test.ts
- SessionService
- manager-store.ts
- dreamer-store.ts
- oracle-voice-benchmark.ts
- session-directory.ts
- session-resource-clear.test.ts
- TmuxTerminalSessionController
- app.ts
- ManagerSnapshot
- DreamerService
- agentic-remote
- ProviderSessionService
- OracleVoiceClient
- manager.ts
- bundle
- hub-routes.ts
- ManagerStore
- DreamerStore
- VoicePlayback
- pwa.ts
- client.test.ts
- shell.ts
- lib.rs
- FakeSessionService
- VoiceCapture
- agentic-remote-promotion-setup
- manager-proactive-inbox.ts
- manager-structured-memory.ts
- agentic-remote-gate
- config.rs
- KnowledgeStore
- cleanDialogLine
- capture.ts
- dependencies
- devDependencies
- tmux-test-helpers.ts
- knowledge-tree.ts
- real-voice.ts
- oracle-voice-child.test.ts
- EngineVoiceBackendSession
- refusal-metrics.ts
- OracleDreamer.tsx
- ManagerStructuredMemoryStore
- oracle-voice-segments.ts
- remote-voice-client.ts
- OracleVoiceCoordinator
- registerSessionKnowledgeRoutes
- oracle-voice-security.test.ts
- SessionOrderStore
- .sendInternal
- ManagerClientDefaults
- shared/settings-profile.ts
- session-patch-browser.ts
- terminal-session.test.ts
- src/settings-profile.ts
- capture-workspace.ts
- backgroundTasksFromEvents
- cli-canary.ts
- manager-structured-memory-search.ts
- scripts
- client.ts
- background-task-adapter.ts
- oracle-voice-coordinator.ts
- manager-routes.ts
- settings-profile-store.ts
- compilerOptions
- oracle-voice-coordinator.test.ts
- SettingsProfileClient
- oracle-voice-config.ts
- normalizeKnowledgeRelativePath
- full-gate.test.ts
- startup-phases.test.ts
- .toolHost
- session-reply-durability.test.ts
- session-store-providers.test.ts
- PromptCards.tsx
- compilerOptions
- ManagerProactiveInbox
- OnlineRecognizer
- sessionKey
- compilerOptions
- compilerOptions
- SettingsProfileSnapshot
- react
- dreamer-schedule.ts
- ManagerMemory
- BoundedQueue
- ReaderWorkspace
- .observe
- VoiceClientControl
- terminal-form-deadline.test.ts
- promotion-monitor.test.ts
- server/session-patches.ts
- scripts
- background-task-stop.test.ts
- manager-runtime.ts
- oracle-voice-assets.test.ts
- BackgroundTasksDialog.tsx
- NewSessionDialog
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- DreamerMorningPlan
- .oxlintrc.json
- settings-local.json
- oracle-voice-engine-smoke.ts
- session-response-order.ts
- Pcm16Resampler
- background-task-tracker.ts
- dreamer-routes.ts
- manager-proactive-inbox.test.ts
- VoiceTurnState
- html-preview.ts
- normalizeBackgroundTask
- DeferredSession
- dataset
- generate-pwa-icons.ts
- file-upload-routes.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- ManagerStructuredMemoryRuntime
- promotion-setup-execution.test.ts
- SessionAdmissions
- session-store-durability.test.ts
- vite.config.ts
- package.json
- manager-structured-memory-performance.test.ts
- release-publication.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- .receive
- VoiceServerControl
- usePanelWidth
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- removeComputer
- FakeRecorder
- .createEvent
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
1. `SessionDetail` - 309 edges
2. `AgentService` - 283 edges
3. `App()` - 278 edges
4. `SessionStore` - 190 edges
5. `ClaudeAgentService` - 126 edges
6. `ManagedSession` - 112 edges
7. `ManagerAgent` - 100 edges
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

## Communities (215 total, 25 thin omitted)

### Community 0 - "SessionDetail"
Cohesion: 0.03
Nodes (83): storage(), fixture(), restart(), fixture(), connect(), createStore(), deferred(), disk (+75 more)

### Community 1 - "AgentService"
Cohesion: 0.03
Nodes (20): AgentService, foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isUncertainDelivery(), lifecycleRefusal(), persistedFormAnswer(), RuntimeConfigurationError (+12 more)

### Community 2 - "App"
Cohesion: 0.03
Nodes (145): isManagerEvent(), alertNotification(), terminalSendOptions(), askSession(), clearConversation(), recoverConversation(), removeQueuedPrompt(), reorderQueuedPrompts() (+137 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (114): SettingsChange, SettingsProfileKey, SettingsProfileValues, SettingsUpdateResult, parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder() (+106 more)

### Community 4 - "App.tsx"
Cohesion: 0.03
Nodes (107): AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+99 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (16): agentMode(), ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services (+8 more)

### Community 6 - ".readAfterWrites"
Cohesion: 0.05
Nodes (8): commandShortcut(), isTerminalNotReadyRefusal(), removeCopilotSessionFiles(), stripAnsi(), terminalAnswerRefused(), isRetainedRefusal(), StartupPhases, TerminalSessionController

### Community 7 - "contracts.ts"
Cohesion: 0.03
Nodes (61): ClaudeAgentServiceEvents, directories, voiceControlQueues, voiceControlWaiters, ProviderSessionServiceEvents, provider(), RemoteNodeClientEvents, apps (+53 more)

### Community 8 - "agent-service.ts"
Cohesion: 0.04
Nodes (79): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+71 more)

### Community 9 - "CopilotClientLike"
Cohesion: 0.03
Nodes (61): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+53 more)

### Community 10 - "manager-tools.ts"
Cohesion: 0.04
Nodes (52): uniqueManagerSessionRefs(), APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools() (+44 more)

### Community 11 - "oracle-voice-session.ts"
Cohesion: 0.04
Nodes (47): apps, directories, voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngine, FakeVoiceEngineFactory, identityKey(), isCancelled() (+39 more)

### Community 12 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (65): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+57 more)

### Community 13 - "computer-manager.ts"
Cohesion: 0.04
Nodes (37): RemoteResync, RemoteSessionListing, RemoteSessionRead, sessionAtLeastAsNew(), DirectoryScope, DEFINITE_DISPATCH_REFUSALS, headerSafe(), normalizeNodeUrl() (+29 more)

### Community 14 - "node-routes.ts"
Cohesion: 0.03
Nodes (54): ActiveBackendSession, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, execFileAsync, RealVoiceState, AUDIO_FILENAME_HEADER (+46 more)

### Community 15 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (42): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+34 more)

### Community 16 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 17 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 18 - "ManagedSession"
Cohesion: 0.09
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), registerHubRoutes(), SessionMuteCarrier, TurnContextInput, ManagerProactiveCoordinatorOptions, FakeManager (+5 more)

### Community 19 - "ManagerAgent"
Cohesion: 0.08
Nodes (11): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, withTimeout() (+3 more)

### Community 20 - "session-presentation.ts"
Cohesion: 0.05
Nodes (57): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers() (+49 more)

### Community 21 - "terminal-session.ts"
Cohesion: 0.05
Nodes (63): composer(), processAdapter, boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText() (+55 more)

### Community 22 - "manager-agent.ts"
Cohesion: 0.05
Nodes (38): automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession (+30 more)

### Community 23 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+24 more)

### Community 24 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (50): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+42 more)

### Community 25 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 26 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (44): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+36 more)

### Community 27 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+27 more)

### Community 28 - "active-sessions.ts"
Cohesion: 0.06
Nodes (51): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+43 more)

### Community 29 - "oracle-voice-routes.ts"
Cohesion: 0.06
Nodes (47): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode() (+39 more)

### Community 30 - "oracle-voice-worker.ts"
Cohesion: 0.07
Nodes (26): VoiceEngineSession, VoiceTtsEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys() (+18 more)

### Community 31 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (32): openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+24 more)

### Community 32 - "session-latency-benchmark.ts"
Cohesion: 0.06
Nodes (41): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+33 more)

### Community 33 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 34 - "oracle-voice.ts"
Cohesion: 0.07
Nodes (45): QueuedAudio, SocketMessage, AudioReservation, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities (+37 more)

### Community 35 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (45): executeCommand(), listWorkspace(), readWorkspaceFile(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink() (+37 more)

### Community 36 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 37 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): WorkspaceFixtureState, bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor() (+22 more)

### Community 38 - "ManagerAssistant.tsx"
Cohesion: 0.06
Nodes (41): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline() (+33 more)

### Community 39 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (30): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+22 more)

### Community 40 - "dreamer-service.ts"
Cohesion: 0.07
Nodes (45): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+37 more)

### Community 41 - "send-matrix.integration.test.ts"
Cohesion: 0.05
Nodes (47): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+39 more)

### Community 42 - "SessionService"
Cohesion: 0.07
Nodes (8): nodeVoiceCapabilities(), registerNodeRoutes(), obstructUploads(), SessionService, WorkspaceFile, WorkspaceListing, KnowledgeFolderState, WorkspaceFileIcon()

### Community 43 - "manager-store.ts"
Cohesion: 0.08
Nodes (34): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+26 more)

### Community 44 - "dreamer-store.ts"
Cohesion: 0.07
Nodes (43): DreamerHistoryEntry, assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES (+35 more)

### Community 45 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (40): benchmarkFixture(), benchmarkGroup(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest (+32 more)

### Community 46 - "session-directory.ts"
Cohesion: 0.10
Nodes (36): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+28 more)

### Community 47 - "session-resource-clear.test.ts"
Cohesion: 0.06
Nodes (41): ClaudeSdk, deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, disk (+33 more)

### Community 48 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (13): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+5 more)

### Community 49 - "app.ts"
Cohesion: 0.07
Nodes (29): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+21 more)

### Community 50 - "ManagerSnapshot"
Cohesion: 0.08
Nodes (14): ComputerManagerEvents, batchMessageId(), isTerminal(), ManagerProactiveCoordinator, ProactiveManager, directories, FakeAgent, fixture() (+6 more)

### Community 51 - "DreamerService"
Cohesion: 0.14
Nodes (9): digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate, DreamerSnapshot (+1 more)

### Community 52 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 54 - "OracleVoiceClient"
Cohesion: 0.15
Nodes (8): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError(), terminalCloseCode()

### Community 55 - "manager.ts"
Cohesion: 0.08
Nodes (33): ManagerState, ManagerAutomaticContext, ManagerCheckCadenceMinutes, managerCheckCadences, ManagerMessageRole, ManagerMessageState, ManagerProactiveSettings, ManagerProactiveSnapshot (+25 more)

### Community 56 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 57 - "hub-routes.ts"
Cohesion: 0.06
Nodes (41): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+33 more)

### Community 58 - "ManagerStore"
Cohesion: 0.08
Nodes (7): openStore(), emptyState(), ManagerStore, open(), StoredManager, SecurityManager, ManagerSubmissionOptions

### Community 59 - "DreamerStore"
Cohesion: 0.13
Nodes (11): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, emptyState(), isMissing() (+3 more)

### Community 60 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 61 - "pwa.ts"
Cohesion: 0.09
Nodes (38): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+30 more)

### Community 62 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 63 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 64 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 65 - "FakeSessionService"
Cohesion: 0.07
Nodes (5): FakeSessionService, routingFixture(), session(), temporaryDirectory(), ConfigureRuntimeInput

### Community 66 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 67 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 68 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), cloneState(), DISPOSITIONS, EVENT_KINDS, hasExactKeys(), isAlreadyExists(), isDisposition(), isEventKind() (+29 more)

### Community 69 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (31): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+23 more)

### Community 70 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 71 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 72 - "KnowledgeStore"
Cohesion: 0.12
Nodes (14): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+6 more)

### Community 73 - "cleanDialogLine"
Cohesion: 0.14
Nodes (31): activeBottomFrame(), captureBeforeDeadline(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), FormReplyDeadlineError (+23 more)

### Community 74 - "capture.ts"
Cohesion: 0.07
Nodes (17): BufferedFrame, defaultAudioContext(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode (+9 more)

### Community 75 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 76 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 77 - "tmux-test-helpers.ts"
Cohesion: 0.15
Nodes (30): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, deliveryFixture(), assertSameIdentity() (+22 more)

### Community 78 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+24 more)

### Community 79 - "real-voice.ts"
Cohesion: 0.09
Nodes (12): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+4 more)

### Community 80 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (12): childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize(), InProcessVoiceChild (+4 more)

### Community 81 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 82 - "refusal-metrics.ts"
Cohesion: 0.11
Nodes (22): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+14 more)

### Community 83 - "OracleDreamer.tsx"
Cohesion: 0.13
Nodes (25): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition, getDreamer() (+17 more)

### Community 84 - "ManagerStructuredMemoryStore"
Cohesion: 0.17
Nodes (9): capturePrompt(), digest(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMutationResult (+1 more)

### Community 85 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 86 - "remote-voice-client.ts"
Cohesion: 0.16
Nodes (14): VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+6 more)

### Community 87 - "OracleVoiceCoordinator"
Cohesion: 0.15
Nodes (3): OracleVoiceCoordinator, terminalStartupCloseCode(), ActiveConversation

### Community 88 - "registerSessionKnowledgeRoutes"
Cohesion: 0.11
Nodes (22): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+14 more)

### Community 89 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (18): FakeVoiceEngineCall, VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), createManager(), issueTicket() (+10 more)

### Community 90 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 91 - ".sendInternal"
Cohesion: 0.14
Nodes (20): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), isTerminalAgentWorking(), isTerminalLoading(), isTerminalOverlay() (+12 more)

### Community 92 - "ManagerClientDefaults"
Cohesion: 0.12
Nodes (15): ManagerClientDefaults, VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState (+7 more)

### Community 93 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (28): AccentSetting, appearanceSettings, applySettingsChanges(), DEFAULT_SESSION_PROVIDER, isRecord(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting (+20 more)

### Community 94 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 95 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (21): parseTerminalUpdateNotice(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), desktopInstallPane, directories, downloadedUpdateFooter, execFileAsync (+13 more)

### Community 96 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (23): AppearanceSetting, isSettingsDeviceId(), isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, statuslineItems, Appearance (+15 more)

### Community 97 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 98 - "backgroundTasksFromEvents"
Cohesion: 0.19
Nodes (27): addActivity(), backgroundHandoff(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventString(), eventTask(), lastForegroundCompletionAt() (+19 more)

### Community 99 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 100 - "manager-structured-memory-search.ts"
Cohesion: 0.13
Nodes (23): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+15 more)

### Community 101 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 102 - "client.ts"
Cohesion: 0.09
Nodes (13): closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, OracleVoicePlayback, PendingHello (+5 more)

### Community 103 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (23): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isLiveTaskStatus(), isOlderExecution(), isShellObserverTool() (+15 more)

### Community 104 - "oracle-voice-coordinator.ts"
Cohesion: 0.10
Nodes (15): ManagerEventSource, ManagerEventSource, AudioCompletion, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+7 more)

### Community 105 - "manager-routes.ts"
Cohesion: 0.11
Nodes (16): confirmationSchema, defaultsSchema, editSchema, effort, managerCadence, managerInputError(), ManagerRouteAgent, messageParams (+8 more)

### Community 106 - "settings-profile-store.ts"
Cohesion: 0.14
Nodes (14): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+6 more)

### Community 107 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 108 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 109 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 110 - "oracle-voice-config.ts"
Cohesion: 0.16
Nodes (19): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+11 more)

### Community 111 - "normalizeKnowledgeRelativePath"
Cohesion: 0.17
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), pathRecordSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+10 more)

### Community 112 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 113 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 115 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 116 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+2 more)

### Community 117 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 118 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 119 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 120 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 121 - "sessionKey"
Cohesion: 0.17
Nodes (15): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), readSelectionFromLocation(), RenameSessionDialog(), binding, sessionKey() (+7 more)

### Community 122 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 123 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 124 - "SettingsProfileSnapshot"
Cohesion: 0.17
Nodes (6): SettingsProfileSnapshot, settingsProfileCacheKey, SettingsProfileTransport, cached(), FakeHub, MemoryStorage

### Community 125 - "react"
Cohesion: 0.14
Nodes (8): react, drawDiagram(), drawing, MermaidDiagram(), SessionActions(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 126 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 127 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 128 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 129 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 130 - ".observe"
Cohesion: 0.21
Nodes (6): ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, nowIso()

### Community 132 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 133 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 134 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 135 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 136 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 137 - "manager-runtime.ts"
Cohesion: 0.24
Nodes (11): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+3 more)

### Community 138 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 139 - "BackgroundTasksDialog.tsx"
Cohesion: 0.22
Nodes (11): BackgroundTask, DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel() (+3 more)

### Community 140 - "NewSessionDialog"
Cohesion: 0.22
Nodes (15): activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession(), computerProviders() (+7 more)

### Community 141 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 142 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 143 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 144 - "DreamerMorningPlan"
Cohesion: 0.25
Nodes (13): DreamerMorningPlan(), confirmCompletion(), confirmTaskCompletion(), dispatchTask(), disposition(), edit(), investigate(), move() (+5 more)

### Community 145 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 146 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 147 - "oracle-voice-engine-smoke.ts"
Cohesion: 0.21
Nodes (6): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave

### Community 148 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 149 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 150 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 151 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 152 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 154 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 155 - "normalizeBackgroundTask"
Cohesion: 0.22
Nodes (10): attachmentModeValue(), booleanValue(), executionModeValue(), isBackgroundTaskInfo(), isBackgroundTaskProgress(), normalizeBackgroundTask(), numberValue(), progressValue() (+2 more)

### Community 157 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 158 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 159 - "file-upload-routes.ts"
Cohesion: 0.29
Nodes (6): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile()

### Community 160 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 161 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 163 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 165 - "session-store-durability.test.ts"
Cohesion: 0.31
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 166 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 167 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 168 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.36
Nodes (5): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemorySearchResult

### Community 169 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 170 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 171 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 172 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 173 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 174 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 176 - "VoiceServerControl"
Cohesion: 0.40
Nodes (4): connect(), Inbox, rawBuffer(), VoiceServerControl

### Community 177 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 178 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 179 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 180 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 183 - ".createEvent"
Cohesion: 0.67
Nodes (3): canonicalHash(), eventId(), namespaceId()

## Knowledge Gaps
- **1165 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1160 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1957 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `ClaudeAgentService`, `.readAfterWrites`, `contracts.ts`, `agent-service.ts`, `CopilotClientLike`, `claude-agent-service.ts`, `session-directory.ts`, `normalizeBackgroundTask`, `queued-dispatch.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `ClaudeAgentService`, `.readAfterWrites`, `agent-service.ts`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `backgroundTasksFromEvents()` connect `backgroundTasksFromEvents` to `normalizeBackgroundTask`, `background-task-adapter.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1165 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.029177574171029667 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.0346749226006192 - nodes in this community are weakly interconnected._
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
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-17-oracle-proactive-lifecycle-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
- `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`
- `docs/superpowers/specs/2026-11-04-oracle-periodic-checks-design.md`
- `docs/superpowers/specs/2026-11-05-session-knowledge-api-design.md`
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
