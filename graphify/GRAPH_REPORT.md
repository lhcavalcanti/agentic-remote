# Agentic Remote - Graphify code map

Snapshot: `e162a531330f26cbeaa7dcb878cbe61df8cd86fa964573622c740eb3c7f76909`

Source checkout: `ecc3d983e1658b9ce944694a2d2092321f1c61df`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 414 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 414 files · ~888,804 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7243 nodes · 20106 edges · 211 communities (174 shown, 21 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1059 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionStore
- api.ts
- App
- App.tsx
- SessionDetail
- agent-service.ts
- RemoteNodeClient
- claude-agent-service.ts
- ManagerAssistant.tsx
- terminal-session.ts
- manager-tools.ts
- app.ts
- multi-node.test.ts
- oracle-voice-child.ts
- agentic-remote-promotion-monitor
- hub-routes.ts
- ManagedSession
- oracle-voice-soak.ts
- ManagerAgent
- oracle-voice-coordinator.ts
- FakeVoiceEngine
- session-presentation.ts
- transcription-service.ts
- dreamer-service.ts
- ManagerStore
- VoiceClientControl
- oracle-task-store.ts
- terminal-session.test.ts
- OracleVoiceCoordinator
- oracle-voice-integration.test.ts
- client.ts
- ManagerMessage
- session-store-providers.test.ts
- CopilotClientLike
- TmuxTerminalSessionController
- workspace-fixtures.ts
- oracle-voice-routes.ts
- manager-structured-memory-validation.ts
- contracts.ts
- markdown-navigation.ts
- oracle-voice-worker.ts
- active-sessions.ts
- session-directory.ts
- oracle-voice-routes.test.ts
- TerminalSessionController
- session-knowledge-routes.test.ts
- fake-voice.ts
- OracleDreamer.tsx
- oracle-voice-benchmark.ts
- tmux-test-helpers.ts
- oracle-voice-session.ts
- dreamer-store.ts
- SessionService
- oracle-voice.ts
- agentic-remote
- manager-agent.ts
- dreamer-progress.ts
- bundle
- dreamer-planner.ts
- session-enqueue-clear.test.ts
- shared/settings-profile.ts
- DreamerStore
- pwa.ts
- VoicePlayback
- oracle-voice-config.ts
- normalizeKnowledgeRelativePath
- client.test.ts
- shell.ts
- lib.rs
- ManagerProactiveCoordinator
- agentic-remote-promotion-setup
- terminal-startup-queue.test.ts
- manager-agent.test.ts
- manager-proactive-inbox.ts
- FakeSessionService
- agentic-remote-gate
- config.rs
- src/settings-profile.ts
- dependencies
- devDependencies
- oracle-voice-child.test.ts
- oracle-voice-security.test.ts
- remote-voice-client.ts
- manager-structured-memory.ts
- manager-context.ts
- oracle-voice-segments.ts
- knowledge-tree.ts
- capture-workspace.ts
- SessionOrderStore
- session-patch-browser.ts
- VoiceCapabilities
- real-voice.ts
- SessionKnowledgeStore
- background-task-adapter.ts
- backgroundTasksFromEvents
- cli-canary.ts
- PushNotificationService
- scripts
- manager-structured-memory-search.ts
- push-notification-service.ts
- SettingsProfileClient
- session-resource-providers.test.ts
- SettingsProfileSnapshot
- compilerOptions
- recovery-resend-durability.test.ts
- ManagerStructuredMemoryStore
- ChatMessage
- isTerminalComposerFooter
- compilerOptions
- full-gate.test.ts
- startup-phases.test.ts
- .observe
- session-reply-durability.test.ts
- PromptCards.tsx
- compilerOptions
- ManagerProactiveInbox
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- dreamer-schedule.ts
- KnowledgeStore
- ManagerMemory
- promotion-monitor.test.ts
- session-knowledge-store.ts
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- .createSession
- .sendAdmittedMessage
- session-knowledge-routes.ts
- terminal-form-deadline.test.ts
- background-task-stop.test.ts
- knowledge-store.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- scripts
- registerSessionKnowledgeRoutes
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- manager-proactive-inbox.test.ts
- Pcm16Resampler
- background-task-tracker.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- DeferredSession
- HubEvent
- .initialize
- dataset
- generate-pwa-icons.ts
- ManagerProactiveInboxValidationError
- manager-structured-memory-performance.test.ts
- bridge.rs
- KnowledgePosition
- promotion-setup-execution.test.ts
- SessionAdmissions
- session-knowledge-store.test.ts
- vite.config.ts
- package.json
- backgroundHandoff
- dreamer-routes.ts
- recovery-context.ts
- release-publication.test.ts
- vad-assets.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- settings.ts
- .transport
- composer-layout.test.ts
- promotion-setup.test.ts
- push-routes.ts
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
2. `App()` - 301 edges
3. `AgentService` - 289 edges
4. `SessionStore` - 190 edges
5. `ClaudeAgentService` - 126 edges
6. `ManagedSession` - 123 edges
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

## Communities (211 total, 21 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (15): agentMode(), AgentService, isRuntimeReasoningEffort(), isTerminalNotReadyRefusal(), lifecycleRefusal(), permissionTitle(), sessionInUseConflictMessage(), suspendedRuntimeConflict() (+7 more)

### Community 1 - "SessionStore"
Cohesion: 0.02
Nodes (100): fixture(), holdProbe(), fixtures, gate(), releases, restart(), sdkPermissionEvents(), sdkRecoveryEvents() (+92 more)

### Community 2 - "api.ts"
Cohesion: 0.02
Nodes (147): SettingsChange, SettingsProfileKey, parseSubmissionReceipt(), activateSession(), addComputer(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask() (+139 more)

### Community 3 - "App"
Cohesion: 0.03
Nodes (158): terminalSendOptions(), submissionReceiptFromError(), askSession(), getSession(), readKnowledgeFile(), activeComposerPastes(), App(), adoptConversationReplacement() (+150 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (133): isManagerEvent(), alertNotification(), extension(), sessionFileValidationError(), supportedExtensions, supportsSessionFile(), AccentTheme, accentThemes (+125 more)

### Community 5 - "SessionDetail"
Cohesion: 0.04
Nodes (17): ClaudeAgentService, isMissingClaudeSessionError(), ownsDispatchRecovery(), preflight(), preparePrompt(), queueConflict(), QueuedDispatches, answer() (+9 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.04
Nodes (78): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+70 more)

### Community 7 - "RemoteNodeClient"
Cohesion: 0.03
Nodes (33): RemoteResync, RemoteSessionRead, ManagerHub, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, DEFINITE_DISPATCH_REFUSALS, normalizeNodeUrl(), REDIRECT_STATUSES (+25 more)

### Community 8 - "claude-agent-service.ts"
Cohesion: 0.05
Nodes (72): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+64 more)

### Community 9 - "ManagerAssistant.tsx"
Cohesion: 0.04
Nodes (70): react, editQueuedManagerMessage(), getManager(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage() (+62 more)

### Community 10 - "terminal-session.ts"
Cohesion: 0.05
Nodes (85): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed() (+77 more)

### Community 11 - "manager-tools.ts"
Cohesion: 0.04
Nodes (50): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+42 more)

### Community 12 - "app.ts"
Cohesion: 0.04
Nodes (61): prefixes, session, trusted, untrusted, apps, directories, buildApp(), BuildAppOptions (+53 more)

### Community 13 - "multi-node.test.ts"
Cohesion: 0.04
Nodes (19): directories, voiceControlQueues, voiceControlWaiters, ProviderSessionService, ProviderSessionServiceEvents, provider(), SessionKnowledgeBaseLocation, AgentProviderCapability (+11 more)

### Community 14 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (43): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+35 more)

### Community 15 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 16 - "hub-routes.ts"
Cohesion: 0.03
Nodes (71): ClientPresence, PRESENCE_TTL_MS, addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+63 more)

### Community 17 - "ManagedSession"
Cohesion: 0.09
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, FakeManager, createHub() (+5 more)

### Community 18 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 19 - "ManagerAgent"
Cohesion: 0.08
Nodes (12): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, uniqueManagerSessionRefs() (+4 more)

### Community 20 - "oracle-voice-coordinator.ts"
Cohesion: 0.04
Nodes (37): ManagerEventSource, ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError (+29 more)

### Community 21 - "FakeVoiceEngine"
Cohesion: 0.05
Nodes (31): voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngine, FakeVoiceEngineCall, FakeVoiceEngineFactory, identityKey(), isCancelled(), sameGeneration() (+23 more)

### Community 22 - "session-presentation.ts"
Cohesion: 0.06
Nodes (57): saveSessionOrderLane(), handleDragEnd(), SessionResourcesDialog(), KnowledgeRootSelector(), root, ProgressTime(), reorderSessionLaneWithHiddenFollowers(), SessionFilter (+49 more)

### Community 23 - "transcription-service.ts"
Cohesion: 0.05
Nodes (37): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, headerSafe() (+29 more)

### Community 24 - "dreamer-service.ts"
Cohesion: 0.09
Nodes (23): DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, DreamerProgressLimits, boundedText(), digest(), DreamerPlannerExecutionInput, DreamerService (+15 more)

### Community 25 - "ManagerStore"
Cohesion: 0.06
Nodes (24): DreamerProgressEntry, openStore(), JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), PersistedCursor, emptyState() (+16 more)

### Community 26 - "VoiceClientControl"
Cohesion: 0.07
Nodes (17): VoiceClientControl, BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), CaptureControl, harness() (+9 more)

### Community 27 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (44): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+36 more)

### Community 28 - "terminal-session.test.ts"
Cohesion: 0.05
Nodes (54): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+46 more)

### Community 29 - "OracleVoiceCoordinator"
Cohesion: 0.09
Nodes (5): errorMessage(), OracleVoiceCoordinator, PendingFinalTurn, withTimeout(), VoiceTurnState

### Community 30 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+23 more)

### Community 31 - "client.ts"
Cohesion: 0.09
Nodes (21): VoiceServerControl, captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord(), isTicket() (+13 more)

### Community 32 - "ManagerMessage"
Cohesion: 0.05
Nodes (24): FakeManager, apps, directories, ProactiveManager, FakeAgent, confirmationSchema, defaultsSchema, editSchema (+16 more)

### Community 33 - "session-store-providers.test.ts"
Cohesion: 0.05
Nodes (32): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), QueuedDelivery, terminalRefused() (+24 more)

### Community 34 - "CopilotClientLike"
Cohesion: 0.04
Nodes (35): CopilotClientLike, foregroundTurnOpen(), directories, fakeClient(), ForkRequest, forkSession(), services, terminalFormSteps() (+27 more)

### Community 35 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (18): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, FormReplyDeadlineError, listTmuxSessions(), parseTerminalFormActiveField(), processAncestors() (+10 more)

### Community 36 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (43): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+35 more)

### Community 37 - "oracle-voice-routes.ts"
Cohesion: 0.07
Nodes (47): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+39 more)

### Community 38 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 39 - "contracts.ts"
Cohesion: 0.05
Nodes (41): idleDaysSchema, mergeSessionRetention(), sessionRetentionPatchSchema, sessionRetentionSchema, ActivityStatus, AddKnowledgeRootInput, AgentMode, AgentProvider (+33 more)

### Community 40 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (45): executeCommand(), listWorkspace(), readWorkspaceFile(), searchWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink() (+37 more)

### Community 41 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (24): benchmarkGroup(), ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent() (+16 more)

### Community 42 - "active-sessions.ts"
Cohesion: 0.07
Nodes (49): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+41 more)

### Community 43 - "session-directory.ts"
Cohesion: 0.08
Nodes (40): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath() (+32 more)

### Community 44 - "oracle-voice-routes.test.ts"
Cohesion: 0.05
Nodes (18): VoiceEngineSession, GatedVoiceEngineFactory, ObservedLocalVoiceBackend, openApps, openSockets, RouteManager, RouteVoiceBackend, runtime() (+10 more)

### Community 45 - "TerminalSessionController"
Cohesion: 0.07
Nodes (10): isUncertainDelivery(), persistedFormAnswer(), removeCopilotSessionFiles(), TerminalFormContinuation, TerminalFormReplyError, TerminalSessionController, PendingUserInput, SessionRuntimeInfo (+2 more)

### Community 46 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (30): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+22 more)

### Community 47 - "fake-voice.ts"
Cohesion: 0.07
Nodes (10): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance (+2 more)

### Community 48 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (43): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+35 more)

### Community 49 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 50 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (41): directories, exec, [root], assertSameIdentity(), createIsolatedTmuxRoot(), execFileAsync, abandoned, abandonFixture() (+33 more)

### Community 51 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (16): acquisitionCancelled(), ActiveUtterance, asSessionError(), AudioReservation, capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled() (+8 more)

### Community 52 - "dreamer-store.ts"
Cohesion: 0.07
Nodes (42): DreamerHistoryEntry, assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES (+34 more)

### Community 53 - "SessionService"
Cohesion: 0.08
Nodes (5): closeReason(), closeVoiceSocket(), nodeVoiceCapabilities(), registerNodeRoutes(), SessionService

### Community 54 - "oracle-voice.ts"
Cohesion: 0.09
Nodes (37): capabilities, closeServers, exactArrayBuffer(), sockets, startFields, VoiceNode, decodeVoiceAudioFrame(), encodeVoiceAudioFrame() (+29 more)

### Community 55 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 56 - "manager-agent.ts"
Cohesion: 0.08
Nodes (32): DreamerProgressView, automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung (+24 more)

### Community 57 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, DreamerProgressSource (+11 more)

### Community 58 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 59 - "dreamer-planner.ts"
Cohesion: 0.08
Nodes (30): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+22 more)

### Community 60 - "session-enqueue-clear.test.ts"
Cohesion: 0.06
Nodes (31): deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, Admission, ExclusiveAdmission (+23 more)

### Community 61 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (38): WorkspaceFixtureState, SettingsProfileState, AccentSetting, appearanceSettings, applySettingsChanges(), applySettingsImport(), DEFAULT_SESSION_PROVIDER, isRecord() (+30 more)

### Community 62 - "DreamerStore"
Cohesion: 0.13
Nodes (11): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, emptyState(), isMissing() (+3 more)

### Community 63 - "pwa.ts"
Cohesion: 0.09
Nodes (37): AppVersion, parseAppVersion(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+29 more)

### Community 64 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 65 - "oracle-voice-config.ts"
Cohesion: 0.08
Nodes (29): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+21 more)

### Community 66 - "normalizeKnowledgeRelativePath"
Cohesion: 0.10
Nodes (31): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), SessionKnowledgeBinding, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+23 more)

### Community 67 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 68 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 69 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 70 - "ManagerProactiveCoordinator"
Cohesion: 0.12
Nodes (12): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, SessionLifecycle, directories (+4 more)

### Community 71 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 72 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (28): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+20 more)

### Community 73 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (19): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+11 more)

### Community 74 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isAlreadyExists(), isDisposition() (+29 more)

### Community 75 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 76 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 77 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 78 - "src/settings-profile.ts"
Cohesion: 0.08
Nodes (25): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+17 more)

### Community 79 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 80 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 81 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 82 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (19): apps, config, configFixture(), connect(), createManager(), Inbox, issueTicket(), localRuntime() (+11 more)

### Community 83 - "remote-voice-client.ts"
Cohesion: 0.14
Nodes (15): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError() (+7 more)

### Community 84 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 85 - "manager-context.ts"
Cohesion: 0.13
Nodes (26): ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine(), followUpLine() (+18 more)

### Community 86 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 87 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (29): listKnowledgeEntries(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+21 more)

### Community 88 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 89 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 90 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 91 - "VoiceCapabilities"
Cohesion: 0.12
Nodes (14): VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability (+6 more)

### Community 92 - "real-voice.ts"
Cohesion: 0.12
Nodes (11): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+3 more)

### Community 93 - "SessionKnowledgeStore"
Cohesion: 0.14
Nodes (6): bindingKey(), SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateWithPaths(), UpdateSessionKnowledgeRootInput

### Community 94 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (25): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus() (+17 more)

### Community 95 - "backgroundTasksFromEvents"
Cohesion: 0.19
Nodes (27): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventString(), eventTask(), executionModeValue(), lastForegroundCompletionAt() (+19 more)

### Community 96 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 97 - "PushNotificationService"
Cohesion: 0.20
Nodes (3): PushNotificationService, scoped(), registerPushRoutes()

### Community 98 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 99 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 100 - "push-notification-service.ts"
Cohesion: 0.14
Nodes (18): brief(), OracleEventSource, PushPolicy, PushSender, PushState, RFC-8030, notificationAllowed(), notificationBrief() (+10 more)

### Community 101 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 102 - "session-resource-providers.test.ts"
Cohesion: 0.11
Nodes (19): cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), claudeFixture(), ClaudeMcpRead (+11 more)

### Community 103 - "SettingsProfileSnapshot"
Cohesion: 0.12
Nodes (15): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), directories, fakeManager(), hub(), local (+7 more)

### Community 104 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 105 - "recovery-resend-durability.test.ts"
Cohesion: 0.11
Nodes (15): directories, disk, fixture(), gate(), gates, httpBoundary(), initialize(), PublicSessionValue (+7 more)

### Community 106 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 107 - "ChatMessage"
Cohesion: 0.15
Nodes (10): Client, Browser, seedOffset, StoredSession, ChatMessage, HubResyncRequest, HubWireEvent, PendingEchoOwner (+2 more)

### Community 108 - "isTerminalComposerFooter"
Cohesion: 0.13
Nodes (20): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+12 more)

### Community 109 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 110 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 111 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 112 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 113 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

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

### Community 118 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 119 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 120 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 121 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 123 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 124 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 125 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (17): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+9 more)

### Community 126 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 127 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 128 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 129 - ".createSession"
Cohesion: 0.19
Nodes (5): RuntimeConfigurationError, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout()

### Community 130 - ".sendAdmittedMessage"
Cohesion: 0.26
Nodes (3): DeliveryBoundary, RecoveryResendClaim, SubmissionError

### Community 131 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 132 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 133 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 134 - "knowledge-store.ts"
Cohesion: 0.14
Nodes (11): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, parseMetadata(), PersistedKnowledgeState (+3 more)

### Community 135 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 136 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 137 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 138 - "registerSessionKnowledgeRoutes"
Cohesion: 0.29
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 139 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 140 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 141 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 142 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

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

### Community 147 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 148 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 149 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 150 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 152 - "HubEvent"
Cohesion: 0.20
Nodes (5): ComputerManagerEvents, HubEventSource, directories, RFC-8030, HubEvent

### Community 153 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 154 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 155 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 156 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 157 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.27
Nodes (7): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult, submitSearch()

### Community 158 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 159 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 160 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 162 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 163 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 164 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 165 - "backgroundHandoff"
Cohesion: 0.32
Nodes (8): attachmentModeValue(), backgroundHandoff(), booleanValue(), rawTailText(), shellIdFromFooter(), shellStopAcknowledged(), shellTaskMode(), toolTelemetryProperties()

### Community 166 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (7): dispatchSchema, parse(), planSchema, settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 167 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 168 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 169 - "vad-assets.ts"
Cohesion: 0.32
Nodes (7): browserBaseUrl(), directory(), localAssetUrl(), ORACLE_VOICE_ONNX_WASM_BASE_PATH, ORACLE_VOICE_VAD_ASSETS, ORACLE_VOICE_VAD_BASE_PATH, sharedAssetDirectory()

### Community 170 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 171 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 172 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 174 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 175 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 176 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 180 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **1202 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1197 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2016 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionStore`, `SessionDetail`, `multi-node.test.ts`, `hub-routes.ts`, `ManagedSession`, `ManagerAgent`, `transcription-service.ts`, `dreamer-service.ts`, `ManagerStore`, `oracle-task-store.ts`, `ManagerMessage`, `oracle-voice-worker.ts`, `oracle-voice-routes.test.ts`, `TerminalSessionController`, `session-knowledge-routes.test.ts`, `SessionService`, `pwa.ts`, `oracle-voice-config.ts`, `ManagerProactiveCoordinator`, `manager-agent.test.ts`, `SessionOrderStore`, `SessionKnowledgeStore`, `cli-canary.ts`, `PushNotificationService`, `SettingsProfileSnapshot`, `ManagerProactiveInbox`, `KnowledgeStore`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `.createSession`, `.sendAdmittedMessage`, `session-store-providers.test.ts`, `SessionStore`, `SessionDetail`, `agent-service.ts`, `claude-agent-service.ts`, `recovery-resend-durability.test.ts`, `session-directory.ts`, `TerminalSessionController`, `multi-node.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ManagerAgent` connect `ManagerAgent` to `ManagerMessage`, `RemoteNodeClient`, `manager-agent.test.ts`, `manager-tools.ts`, `app.ts`, `FakeVoiceEngine`, `manager-agent.ts`, `ManagerStore`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1202 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03710223425863236 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.024761904761904763 - nodes in this community are weakly interconnected._
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
