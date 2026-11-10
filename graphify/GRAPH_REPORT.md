# Agentic Remote - Graphify code map

Snapshot: `e90309431ec849e9ca3457ca1dca11fb96178819ed6cfc5b269e0e324abc2881`

Source checkout: `5e9078577ba1d79abf65fac3e425df1265e8d66b`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 415 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 415 files · ~892,044 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7251 nodes · 20128 edges · 225 communities (185 shown, 24 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1059 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- .get
- App.tsx
- api.ts
- SessionDetail
- AgentService
- app.ts
- App
- session-store.ts
- agent-service.ts
- multi-node.test.ts
- computer-manager.ts
- ClaudeAgentService
- manager-tools.ts
- terminal-session.ts
- oracle-voice-security.test.ts
- OracleVoiceCoordinator
- oracle-voice-child.ts
- sessionKey
- ManagedSession
- oracle-voice-soak.ts
- agentic-remote-promotion-monitor
- claude-agent-service.ts
- dreamer-store.ts
- ManagerAgent
- transcription-service.ts
- oracle-voice-integration.test.ts
- client.ts
- workspace-fixtures.ts
- oracle-voice-worker.ts
- session-reply-durability.test.ts
- agent-service.test.ts
- ManagerAssistant.tsx
- ManagerMessage
- BackgroundTaskSnapshot
- tmux-test-helpers.ts
- oracle-task-store.ts
- ManagerStore
- manager-structured-memory-validation.ts
- active-sessions.ts
- SessionService
- session-knowledge-store.ts
- contracts.ts
- oracle-voice.ts
- TmuxTerminalSessionController
- markdown-navigation.ts
- OracleDreamer.tsx
- dreamer-progress.ts
- ManagerProactiveCoordinator
- oracle-voice-routes.ts
- session-directory.ts
- agentic-remote
- dreamer-planner.ts
- send-matrix.integration.test.ts
- oracle-voice-benchmark.ts
- hub-routes.ts
- real-voice.ts
- bundle
- ProviderSessionService
- session-patch-routes.test.ts
- manager-context.ts
- DreamerService
- pwa.ts
- FakeVoiceController
- VoicePlayback
- shared/settings-profile.ts
- oracle-voice-config.ts
- client.test.ts
- shell.ts
- lib.rs
- agentic-remote-promotion-setup
- node-routes.ts
- manager-proactive-inbox.ts
- agentic-remote-gate
- config.rs
- fake-voice.ts
- KnowledgeStore
- manager-structured-memory.ts
- dependencies
- devDependencies
- EngineVoiceBackendSession
- session-resource-clear.test.ts
- dreamer-service.ts
- manager-agent.test.ts
- oracle-voice-child.test.ts
- oracle-voice-coordinator.test.ts
- oracle-voice-segments.ts
- PushNotificationService
- capture-workspace.ts
- registerSessionKnowledgeRoutes
- VoiceClientControl
- manager-agent.ts
- backgroundTasksFromEvents
- push-notification-service.ts
- SessionOrderStore
- terminal-session.test.ts
- ManagerClientDefaults
- manager-structured-memory-search.ts
- .sendInternal
- session-patch-browser.ts
- cli-canary.ts
- VoiceAudioFrame
- scripts
- SettingsProfileClient
- VoiceCapture
- .toolHost
- compilerOptions
- src/settings-profile.ts
- ChatMessage
- background-task-adapter.ts
- session-store-providers.test.ts
- startup-phases.test.ts
- ManagerStructuredMemoryStore
- compilerOptions
- full-gate.test.ts
- .observe
- knowledge-tree.ts
- capture.ts
- compilerOptions
- react
- normalizeKnowledgeRelativePath
- ManagerProactiveInbox
- SettingsProfileSnapshot
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- terminal-startup-queue.test.ts
- dreamer-schedule.ts
- ManagerMemory
- promotion-monitor.test.ts
- use-oracle-settings.ts
- BoundedQueue
- ReaderWorkspace
- settings-profile.test.ts
- session-latency-benchmark.ts
- use-session-knowledge-root.ts
- background-task-stop.test.ts
- recovery-resend-durability.test.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- NewSessionDialog
- capture
- terminal-form-deadline.test.ts
- scripts
- oracle-voice-assets.test.ts
- queued-provider-dispatch.test.ts
- fake-vad.ts
- desktop.json
- manager-proactive-inbox.test.ts
- session-clear-transcript.test.ts
- theme-contrast.test.ts
- BackgroundTasksDialog.tsx
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- PromptCards.tsx
- session-response-order.ts
- Pcm16Resampler
- background-task-tracker.ts
- dreamer-routes.ts
- dreamer-service.test.ts
- .initialize
- recovery-seed-guards.test.ts
- html-preview.ts
- DeferredSession
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- VoiceCaptureOptions
- manager-structured-memory-performance.test.ts
- promotion-setup-execution.test.ts
- SessionAdmissions
- capture.test.ts
- VoiceVadOptions
- vite.config.ts
- KnowledgePosition
- package.json
- recovery-context.ts
- release-publication.test.ts
- UserInputFieldControl
- render-workspace-gifs.ts
- backgroundHandoff
- HubEvent
- history-projection.test.ts
- settings.ts
- composer-layout.test.ts
- usePanelWidth
- promotion-setup.test.ts
- removeComputer
- FakeRecorder
- terminal-send-uncertainty.test.ts
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
3. `AgentService` - 289 edges
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
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (225 total, 24 thin omitted)

### Community 0 - ".get"
Cohesion: 0.04
Nodes (19): agentMode(), isTerminalNotReadyRefusal(), isUncertainDelivery(), sessionInUseConflictMessage(), terminalAnswerRefused(), ownsDispatchRecovery(), preflight(), preparePrompt() (+11 more)

### Community 1 - "App.tsx"
Cohesion: 0.02
Nodes (109): configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+101 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (113): SettingsChange, SettingsProfileKey, SettingsProfileValues, SettingsUpdateResult, parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder() (+105 more)

### Community 3 - "SessionDetail"
Cohesion: 0.05
Nodes (24): normalizedTitle(), fixture(), channels, directories, fixture(), observe(), canArchiveSession(), directories (+16 more)

### Community 4 - "AgentService"
Cohesion: 0.04
Nodes (15): AgentService, lifecycleRefusal(), restart(), removeCopilotSessionFiles(), RuntimeConfigurationError, suspendedRuntimeConflict(), suspendRefused(), forgetSessionEvents() (+7 more)

### Community 5 - "app.ts"
Cohesion: 0.03
Nodes (74): prefixes, session, trusted, untrusted, apps, directories, buildApp(), BuildAppOptions (+66 more)

### Community 6 - "App"
Cohesion: 0.03
Nodes (103): isManagerEvent(), alertNotification(), terminalSendOptions(), sessionFileValidationError(), askSession(), listKnowledgeEntries(), readKnowledgeFile(), replyPermission() (+95 more)

### Community 7 - "session-store.ts"
Cohesion: 0.02
Nodes (81): CopilotClientLike, fixture(), holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+73 more)

### Community 8 - "agent-service.ts"
Cohesion: 0.04
Nodes (80): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+72 more)

### Community 9 - "multi-node.test.ts"
Cohesion: 0.03
Nodes (36): AgentServiceEvents, CreationRuntime, directories, FakeSessionService, routingFixture(), session(), temporaryDirectory(), voiceControlQueues (+28 more)

### Community 10 - "computer-manager.ts"
Cohesion: 0.03
Nodes (43): ServerRole, RemoteResync, RemoteSessionListing, RemoteSessionRead, SessionMetadataLookup, DirectoryScope, DEFINITE_DISPATCH_REFUSALS, normalizeNodeUrl() (+35 more)

### Community 11 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (18): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), toolResultText(), claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred() (+10 more)

### Community 12 - "manager-tools.ts"
Cohesion: 0.04
Nodes (53): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+45 more)

### Community 13 - "terminal-session.ts"
Cohesion: 0.05
Nodes (92): activeBottomFrame(), boxedComposerFrame(), captureTerminal(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed() (+84 more)

### Community 14 - "oracle-voice-security.test.ts"
Cohesion: 0.04
Nodes (46): voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngine, FakeVoiceEngineCall, FakeVoiceEngineFactory, identityKey(), isCancelled(), sameGeneration() (+38 more)

### Community 15 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (20): ManagerEventSource, ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect() (+12 more)

### Community 16 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (42): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+34 more)

### Community 17 - "sessionKey"
Cohesion: 0.06
Nodes (86): activeComposerPastes(), adoptConversationReplacement(), appendComposerForKey(), applySession(), askAboutKnowledgeFile(), attachmentsInContent(), cancelQueuedPromptEdit(), clearSelectedConversation() (+78 more)

### Community 18 - "ManagedSession"
Cohesion: 0.09
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, TurnContextInput (+5 more)

### Community 19 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 20 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 21 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (59): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+51 more)

### Community 22 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (42): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+34 more)

### Community 23 - "ManagerAgent"
Cohesion: 0.08
Nodes (11): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, ManagerSdkSession, sameRuntime(), TurnError (+3 more)

### Community 24 - "transcription-service.ts"
Cohesion: 0.05
Nodes (37): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, headerSafe() (+29 more)

### Community 25 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+24 more)

### Community 26 - "client.ts"
Cohesion: 0.09
Nodes (21): ORACLE_VOICE_CONNECTION_TIMEOUT_MS, captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord(), isTicket() (+13 more)

### Community 27 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (42): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+34 more)

### Community 28 - "oracle-voice-worker.ts"
Cohesion: 0.07
Nodes (26): benchmarkGroup(), VoiceTtsEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys() (+18 more)

### Community 29 - "session-reply-durability.test.ts"
Cohesion: 0.07
Nodes (27): persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest() (+19 more)

### Community 30 - "agent-service.test.ts"
Cohesion: 0.05
Nodes (36): CopilotSessionLike, terminalFormSteps(), busyTerminal(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+28 more)

### Community 31 - "ManagerAssistant.tsx"
Cohesion: 0.06
Nodes (45): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline() (+37 more)

### Community 32 - "ManagerMessage"
Cohesion: 0.06
Nodes (22): FakeManager, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams (+14 more)

### Community 33 - "BackgroundTaskSnapshot"
Cohesion: 0.07
Nodes (46): BackgroundTaskSnapshot, KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, computers, first, grouped (+38 more)

### Community 34 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (48): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, deliveryFixture(), [root] (+40 more)

### Community 35 - "oracle-task-store.ts"
Cohesion: 0.08
Nodes (38): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+30 more)

### Community 36 - "ManagerStore"
Cohesion: 0.06
Nodes (24): openStore(), JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), ManagerProactiveCoordinatorOptions, PersistedCursor, emptyState() (+16 more)

### Community 37 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 38 - "active-sessions.ts"
Cohesion: 0.07
Nodes (49): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+41 more)

### Community 39 - "SessionService"
Cohesion: 0.06
Nodes (14): ActiveClaudeQuery, nodeVoiceCapabilities(), registerNodeRoutes(), releases, session, snapshot, readServiceResources(), readSessionSkills() (+6 more)

### Community 40 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+22 more)

### Community 41 - "contracts.ts"
Cohesion: 0.05
Nodes (40): idleDaysSchema, mergeSessionRetention(), sessionRetentionPatchSchema, sessionRetentionSchema, directories, fakeManager(), hub(), local (+32 more)

### Community 42 - "oracle-voice.ts"
Cohesion: 0.08
Nodes (44): sendNodeVoiceOutput(), limits(), outputBytes(), backendOutputBytes(), sendBrowserOutput(), shutdownBackendOutput(), outputBytes(), capabilities (+36 more)

### Community 43 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (16): startAgentAfterClear(), captureBeforeDeadline(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand() (+8 more)

### Community 44 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (41): executeCommand(), listWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+33 more)

### Community 45 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (40): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition, getDreamer() (+32 more)

### Community 46 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (21): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+13 more)

### Community 47 - "ManagerProactiveCoordinator"
Cohesion: 0.09
Nodes (13): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ProactiveManager, directories, FakeAgent (+5 more)

### Community 48 - "oracle-voice-routes.ts"
Cohesion: 0.08
Nodes (36): OracleVoiceManager, ActiveConversation, availableCapabilities(), backendOutputRelay(), browserCloseCode(), closeReason(), disconnectCause(), errorMessage() (+28 more)

### Community 49 - "session-directory.ts"
Cohesion: 0.11
Nodes (36): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+28 more)

### Community 50 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 51 - "dreamer-planner.ts"
Cohesion: 0.08
Nodes (39): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+31 more)

### Community 52 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (40): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+32 more)

### Community 53 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (38): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, deferred() (+30 more)

### Community 54 - "hub-routes.ts"
Cohesion: 0.06
Nodes (42): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+34 more)

### Community 55 - "real-voice.ts"
Cohesion: 0.07
Nodes (14): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+6 more)

### Community 56 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 58 - "session-patch-routes.test.ts"
Cohesion: 0.07
Nodes (21): fixture(), managers, releases, remote, session(), ComputerRegistry, DurableRegisteredComputer, LegacyRegisteredComputer (+13 more)

### Community 59 - "manager-context.ts"
Cohesion: 0.10
Nodes (31): DreamerProgressEntry, DreamerProgressView, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock() (+23 more)

### Community 60 - "DreamerService"
Cohesion: 0.15
Nodes (10): DreamerService, DreamerUnavailableError, publicSnapshot(), safeRunError(), unavailableSnapshot(), DreamerRunClaim, dreamerRunKey(), DreamerSnapshot (+2 more)

### Community 61 - "pwa.ts"
Cohesion: 0.09
Nodes (38): AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+30 more)

### Community 62 - "FakeVoiceController"
Cohesion: 0.09
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 63 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 64 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (37): WorkspaceFixtureState, SettingsProfileState, AccentSetting, appearanceSettings, applySettingsChanges(), applySettingsImport(), DEFAULT_SESSION_PROVIDER, isRecord() (+29 more)

### Community 65 - "oracle-voice-config.ts"
Cohesion: 0.08
Nodes (29): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+21 more)

### Community 66 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 67 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 68 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 69 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 70 - "node-routes.ts"
Cohesion: 0.07
Nodes (34): FileUploadError, registerFileUploadRoutes(), SessionParams, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema (+26 more)

### Community 71 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isDisposition(), isEventKind() (+29 more)

### Community 72 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 73 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 74 - "fake-voice.ts"
Cohesion: 0.07
Nodes (15): ActiveBackendSession, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, execFileAsync, RealVoiceState, exactArrayBuffer() (+7 more)

### Community 75 - "KnowledgeStore"
Cohesion: 0.12
Nodes (14): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+6 more)

### Community 76 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (30): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+22 more)

### Community 77 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 78 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 79 - "EngineVoiceBackendSession"
Cohesion: 0.18
Nodes (5): asSessionError(), disconnectCause(), EngineVoiceBackendSession, sameUtterance(), VoiceSessionError

### Community 80 - "session-resource-clear.test.ts"
Cohesion: 0.08
Nodes (29): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), disk (+21 more)

### Community 81 - "dreamer-service.ts"
Cohesion: 0.12
Nodes (21): boundedText(), digest(), DreamerFollowUp, planWithFingerprints(), uniqueSessionRefs(), DreamerStoreSnapshot, DreamerStoreState, DREAMER_PROGRESS_REFRESH_MS (+13 more)

### Community 82 - "manager-agent.test.ts"
Cohesion: 0.10
Nodes (16): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail(), FakeClient (+8 more)

### Community 83 - "oracle-voice-child.test.ts"
Cohesion: 0.09
Nodes (12): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+4 more)

### Community 84 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.08
Nodes (17): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+9 more)

### Community 85 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 86 - "PushNotificationService"
Cohesion: 0.16
Nodes (7): PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 87 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 88 - "registerSessionKnowledgeRoutes"
Cohesion: 0.11
Nodes (22): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+14 more)

### Community 89 - "VoiceClientControl"
Cohesion: 0.17
Nodes (14): VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+6 more)

### Community 90 - "manager-agent.ts"
Cohesion: 0.09
Nodes (22): automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung, TURN_ACTIVITY (+14 more)

### Community 91 - "backgroundTasksFromEvents"
Cohesion: 0.14
Nodes (30): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventString(), eventTask(), executionModeValue(), isOlderExecution() (+22 more)

### Community 92 - "push-notification-service.ts"
Cohesion: 0.12
Nodes (20): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+12 more)

### Community 93 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 94 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (23): paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), bracketedTabPane, clearFixture(), desktopInstallPane, directories, downloadedUpdateFooter (+15 more)

### Community 95 - "ManagerClientDefaults"
Cohesion: 0.12
Nodes (15): ManagerClientDefaults, VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState (+7 more)

### Community 96 - "manager-structured-memory-search.ts"
Cohesion: 0.12
Nodes (24): DreamerMemoryMetadataRecord, authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord() (+16 more)

### Community 97 - ".sendInternal"
Cohesion: 0.16
Nodes (18): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), isTerminalAgentWorking(), isTerminalOverlay(), isTerminalVisiblyIdle() (+10 more)

### Community 98 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 99 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 100 - "VoiceAudioFrame"
Cohesion: 0.08
Nodes (10): OracleVoiceBackendConnection, QueuedAudio, BrowserCaptureOptions, AudioReservation, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions (+2 more)

### Community 101 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 102 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 103 - "VoiceCapture"
Cohesion: 0.21
Nodes (3): captureFailure(), harness(), VoiceCapture

### Community 104 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 105 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 106 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (19): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+11 more)

### Community 107 - "ChatMessage"
Cohesion: 0.16
Nodes (10): Connection, Client, PatchSocket, Browser, seedOffset, ChatMessage, HubResyncRequest, HubWireEvent (+2 more)

### Community 108 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (21): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isLiveTaskStatus(), isTerminalTaskStatus(), MAX_TASK_ACTIVITY_LINES (+13 more)

### Community 109 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (12): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+4 more)

### Community 110 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (13): phases, port, createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address (+5 more)

### Community 111 - "ManagerStructuredMemoryStore"
Cohesion: 0.26
Nodes (5): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState

### Community 112 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 113 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 114 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 115 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 116 - "capture.ts"
Cohesion: 0.13
Nodes (15): BufferedFrame, defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, validateIdentity(), VoiceCaptureError, VoiceCaptureErrorCode (+7 more)

### Community 117 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 118 - "react"
Cohesion: 0.13
Nodes (10): react, MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram(), drawing, MermaidDiagram(), recordingDuration() (+2 more)

### Community 119 - "normalizeKnowledgeRelativePath"
Cohesion: 0.21
Nodes (16): knowledgeRelativePathSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot() (+8 more)

### Community 120 - "ManagerProactiveInbox"
Cohesion: 0.22
Nodes (4): isAlreadyExists(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 121 - "SettingsProfileSnapshot"
Cohesion: 0.16
Nodes (11): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), profileStore(), updateSchema, SettingsProfileStore, directories (+3 more)

### Community 122 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 123 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 124 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 125 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 126 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (11): client(), delayQueueWrite(), discoveredOwner(), disk, exec, gate(), holdQueueCommit(), NativeFixture (+3 more)

### Community 127 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 128 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 129 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 130 - "use-oracle-settings.ts"
Cohesion: 0.19
Nodes (12): getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps, models (+4 more)

### Community 131 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 132 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 133 - "settings-profile.test.ts"
Cohesion: 0.16
Nodes (5): settingsProfileCacheKey, SettingsProfileTransport, cached(), FakeHub, MemoryStorage

### Community 134 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 135 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 136 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 137 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 138 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 139 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 140 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession() (+8 more)

### Community 141 - "capture"
Cohesion: 0.19
Nodes (15): releaseRecording(), shortcutKeys(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode(), keyLabel() (+7 more)

### Community 142 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 143 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 144 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 145 - "queued-provider-dispatch.test.ts"
Cohesion: 0.17
Nodes (9): claudeFixture(), copilotFixture(), copilotSession(), fixtures, gate(), originalQueue, pause(), releases (+1 more)

### Community 146 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 147 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 148 - "manager-proactive-inbox.test.ts"
Cohesion: 0.16
Nodes (9): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState() (+1 more)

### Community 149 - "session-clear-transcript.test.ts"
Cohesion: 0.16
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, disk, fixture(), fixtures, gate(), holdTurnWrite() (+1 more)

### Community 150 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 151 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 152 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 153 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 154 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 155 - "PromptCards.tsx"
Cohesion: 0.21
Nodes (11): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+3 more)

### Community 156 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 157 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 158 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 159 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 161 - ".initialize"
Cohesion: 0.24
Nodes (4): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, open()

### Community 162 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 163 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 165 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 166 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 167 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 168 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 169 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 171 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.31
Nodes (6): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemorySearchResult, submitSearch()

### Community 172 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 174 - "capture.test.ts"
Cohesion: 0.22
Nodes (3): CaptureControl, VoiceCaptureDependencies, VoiceVad

### Community 176 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 177 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 178 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 179 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 180 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 181 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 182 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 183 - "backgroundHandoff"
Cohesion: 0.38
Nodes (7): attachmentModeValue(), backgroundHandoff(), booleanValue(), rawTailText(), shellStopAcknowledged(), shellTaskMode(), toolTelemetryProperties()

### Community 184 - "HubEvent"
Cohesion: 0.33
Nodes (3): ComputerManagerEvents, HubEventSource, HubEvent

### Community 185 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 186 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 187 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 188 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 189 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 190 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **1204 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1199 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2021 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `.get`, `SessionDetail`, `agent-service.ts`, `multi-node.test.ts`, `computer-manager.ts`, `claude-agent-service.ts`, `session-reply-durability.test.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `.get`, `AgentService`, `session-store.ts`, `agent-service.ts`, `claude-agent-service.ts`, `session-reply-durability.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `copilot()` connect `session-store-providers.test.ts` to `AgentService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1204 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `.get` be split into smaller, more focused modules?**
  _Cohesion score 0.04409171075837742 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.023790820334418136 - nodes in this community are weakly interconnected._
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
