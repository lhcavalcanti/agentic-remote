# Agentic Remote - Graphify code map

Snapshot: `850c65d90dcc46ce306bcbc7c14e3e244797b77933246e38f7a4ed413d7dbaee`

Source checkout: `bc892b24e3ec24b800deedd90e55b1c1a34af855`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 426 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 426 files · ~907,275 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7354 nodes · 20452 edges · 227 communities (187 shown, 22 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1070 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionStore
- AgentService
- api.ts
- App
- App.tsx
- agent-service.ts
- contracts.ts
- ClaudeAgentService
- client.ts
- manager-tools.ts
- claude-agent-service.ts
- oracle-voice-session.ts
- terminal-session.ts
- dreamer-store.ts
- agentic-remote-promotion-monitor
- VoiceAudioFrame
- ManagerAgent
- oracle-voice-soak.ts
- ManagedSession
- oracle-voice-routes.ts
- workspace-fixtures.ts
- CopilotClientLike
- oracle-voice-integration.test.ts
- manager-context.ts
- BackgroundTaskSnapshot
- SessionDetail
- ManagerAssistant.tsx
- manager.ts
- shared/settings-profile.ts
- app.ts
- TmuxTerminalSessionController
- active-sessions.ts
- manager-structured-memory-validation.ts
- tmux-test-helpers.ts
- fake-voice.ts
- markdown-navigation.ts
- oracle-task-store.ts
- SessionService
- manager-agent.ts
- session-knowledge-store.ts
- session-knowledge-routes.test.ts
- oracle-voice.ts
- RemoteNodeClient
- session-directory.ts
- oracle-voice-child.ts
- session-resource-clear.test.ts
- ManagerProactiveCoordinator
- dreamer-progress.ts
- DreamerService
- FakeVoiceEngine
- agentic-remote
- oracle-voice-benchmark.ts
- ProviderSessionService
- agentic-remote-gate
- ManagerStore
- bundle
- hub-routes.ts
- normalizeKnowledgeRelativePath
- FakeSessionService
- VoicePlayback
- .sendInternal
- OracleDreamer.tsx
- ChildVoiceEngine
- client.test.ts
- pwa.ts
- shell.ts
- lib.rs
- agentic-remote-promotion-setup
- oracle-voice-config.ts
- terminal-startup-queue.test.ts
- manager-proactive-inbox.ts
- transcription-service.ts
- config.rs
- manager-structured-memory.ts
- background-task-adapter.ts
- dreamer-service.ts
- KnowledgeStore
- dependencies
- devDependencies
- manager-structured-memory-search.ts
- ResidentVoiceWorker
- knowledge-tree.ts
- EngineVoiceBackendSession
- .createSession
- dreamer-planner.ts
- oracle-voice-security.test.ts
- OracleVoiceCoordinator
- remote-voice-client.ts
- capture-workspace.ts
- real-voice.ts
- queued-provider-dispatch.test.ts
- registerSessionKnowledgeRoutes
- node-routes.ts
- .discoverSessions
- push-notification-service.ts
- send-matrix.integration.test.ts
- SessionOrderStore
- react
- ManagerAttachment
- SettingsProfileSnapshot
- terminal-session.test.ts
- session-patch-browser.ts
- cli-canary.ts
- PushNotificationService
- scripts
- ChatMessage
- .toolHost
- compilerOptions
- ManagerSnapshot
- ManagerStructuredMemoryStore
- oracle-voice-worker.ts
- SettingsProfileClient
- delegated-transcription-service.ts
- oracle-voice-segments.ts
- oracle-voice-tickets.ts
- refusal-metrics.ts
- compilerOptions
- full-gate.test.ts
- startup-phases.test.ts
- .observe
- session-reply-durability.test.ts
- PromptCards.tsx
- compilerOptions
- ManagerProactiveInbox
- oracle-voice-child.test.ts
- session-store-providers.test.ts
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- VoiceTurnState
- recordValue
- dreamer-schedule.ts
- .handleManagerEvent
- promotion-monitor.test.ts
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- recovery-resend-durability.test.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- NewSessionDialog
- terminal-form-deadline.test.ts
- scripts
- DeferredSession
- background-task-stop.test.ts
- manager-runtime.ts
- ManagerEvent
- oracle-voice-assets.test.ts
- VoiceWorkerParentMessage
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- background-task-tracker.ts
- dreamer-service.test.ts
- manager-proactive-inbox.test.ts
- session-response-order.ts
- Pcm16Resampler
- pending-echo.ts
- .initialize
- BackgroundTasksDialog.tsx
- html-preview.ts
- sign-in-expired.pw.ts
- use-oracle-attachments.ts
- .transport
- dataset
- generate-pwa-icons.ts
- ManagerProactiveInboxValidationError
- SpeakableSegmenter
- bridge.rs
- DreamerMorningPlan
- HubEvent
- dreamer-routes.ts
- promotion-setup-execution.test.ts
- SessionAdmissions
- FakeRecorder
- vite.config.ts
- package.json
- recovery-context.ts
- release-publication.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- settings.ts
- composer-layout.test.ts
- VoiceSttEngine
- usePanelWidth
- promotion-setup.test.ts
- push-routes.ts
- appearance.ts
- FakeRecorder
- MemoryStorage
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- @fastify/multipart
- @fastify/static
- ffprobe-static
- lucide-react
- mermaid
- react-dom
- remark-parse
- web-push
- zod
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 310 edges
2. `App()` - 308 edges
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

## Communities (227 total, 22 thin omitted)

### Community 0 - "SessionStore"
Cohesion: 0.02
Nodes (98): fixture(), restart(), runtimeInfoMatches(), directories, fakeClient(), fixture(), ForkRequest, forkSession() (+90 more)

### Community 1 - "AgentService"
Cohesion: 0.04
Nodes (14): AgentService, isTerminalNotReadyRefusal(), isUncertainDelivery(), lifecycleRefusal(), sessionInUseConflictMessage(), suspendedRuntimeConflict(), suspendRefused(), terminalAnswerRefused() (+6 more)

### Community 2 - "api.ts"
Cohesion: 0.02
Nodes (136): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, SettingsChange, SettingsProfileKey, SettingsUpdateResult, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals (+128 more)

### Community 3 - "App"
Cohesion: 0.03
Nodes (158): terminalSendOptions(), askSession(), cancelSession(), clearConversation(), getSession(), recoverConversation(), reorderQueuedPrompts(), restartSession() (+150 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (134): isManagerEvent(), alertNotification(), extension(), MAX_SESSION_FILE_BYTES, sessionFileValidationError(), supportedExtensions, supportsSessionFile(), AccentTheme (+126 more)

### Community 5 - "agent-service.ts"
Cohesion: 0.03
Nodes (96): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+88 more)

### Community 6 - "contracts.ts"
Cohesion: 0.03
Nodes (75): AgentServiceEvents, ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, directories, voiceControlQueues (+67 more)

### Community 7 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (13): agentMode(), isRuntimeReasoningEffort(), permissionTitle(), ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), waitForIdle(), preparePrompt() (+5 more)

### Community 8 - "client.ts"
Cohesion: 0.05
Nodes (36): OracleVoiceBackendConnection, VoiceCapabilities, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason(), isCapabilities() (+28 more)

### Community 9 - "manager-tools.ts"
Cohesion: 0.04
Nodes (53): uniqueManagerSessionRefs(), APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools() (+45 more)

### Community 10 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (67): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+59 more)

### Community 11 - "oracle-voice-session.ts"
Cohesion: 0.04
Nodes (38): ActiveBackendSession, voiceBackend(), nodeVoiceCapabilities(), EnabledOracleVoiceConfig, FakeVoiceEngineFactory, config, VoiceEngineEvent, VoiceEngineFactory (+30 more)

### Community 12 - "terminal-session.ts"
Cohesion: 0.04
Nodes (75): composer(), processAdapter, boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus() (+67 more)

### Community 13 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (48): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+40 more)

### Community 14 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 15 - "VoiceAudioFrame"
Cohesion: 0.05
Nodes (28): BrowserCaptureOptions, AudioReservation, VoiceAudioFrame, VoiceClientControl, BufferedFrame, captureFailure(), defaultAudioContext(), permissionError() (+20 more)

### Community 16 - "ManagerAgent"
Cohesion: 0.08
Nodes (14): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), capturePrompt(), start() (+6 more)

### Community 17 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 18 - "ManagedSession"
Cohesion: 0.10
Nodes (14): ComputerManager, managedSession(), mapWithConcurrency(), fixture(), session(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier (+6 more)

### Community 19 - "oracle-voice-routes.ts"
Cohesion: 0.05
Nodes (56): sendNodeVoiceOutput(), AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OracleVoiceBackendConnector, OracleVoiceBackendDisconnect (+48 more)

### Community 20 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (47): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+39 more)

### Community 21 - "CopilotClientLike"
Cohesion: 0.03
Nodes (40): CopilotClientLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), terminalFormSteps() (+32 more)

### Community 22 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+24 more)

### Community 23 - "manager-context.ts"
Cohesion: 0.06
Nodes (43): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+35 more)

### Community 24 - "BackgroundTaskSnapshot"
Cohesion: 0.06
Nodes (52): hasRunningBackgroundAgent(), BackgroundTaskSnapshot, saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter (+44 more)

### Community 25 - "SessionDetail"
Cohesion: 0.08
Nodes (13): persistedFormAnswer(), TerminalFormContinuation, fixture(), Admission, ExclusiveAdmission, PendingQueueAdmission, answer(), claudeRequest() (+5 more)

### Community 26 - "ManagerAssistant.tsx"
Cohesion: 0.05
Nodes (50): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline() (+42 more)

### Community 27 - "manager.ts"
Cohesion: 0.05
Nodes (41): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+33 more)

### Community 28 - "shared/settings-profile.ts"
Cohesion: 0.06
Nodes (55): AccentSetting, AppearanceSetting, appearanceSettings, applySettingsChanges(), applySettingsImport(), DEFAULT_SESSION_PROVIDER, isRecord(), isSettingsDeviceId() (+47 more)

### Community 29 - "app.ts"
Cohesion: 0.05
Nodes (35): prefixes, session, trusted, untrusted, apps, directories, buildApp(), BuildAppOptions (+27 more)

### Community 30 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (23): startAgentAfterClear(), afterExit(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, parseTerminalUpdateNotice(), processAncestors() (+15 more)

### Community 31 - "active-sessions.ts"
Cohesion: 0.06
Nodes (50): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+42 more)

### Community 32 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 33 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (47): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, [root], assertSameIdentity() (+39 more)

### Community 34 - "fake-voice.ts"
Cohesion: 0.06
Nodes (12): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance (+4 more)

### Community 35 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (44): executeCommand(), listWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+36 more)

### Community 36 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (35): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+27 more)

### Community 37 - "SessionService"
Cohesion: 0.07
Nodes (8): closeReason(), closeVoiceSocket(), registerNodeRoutes(), SessionService, WorkspaceFile, WorkspaceListing, KnowledgeFolderState, WorkspaceFileIcon()

### Community 38 - "manager-agent.ts"
Cohesion: 0.06
Nodes (31): DreamerProgressView, DreamerServiceOptions, automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient (+23 more)

### Community 39 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (29): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+21 more)

### Community 40 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (28): ServerRole, managers, releases, remote, SessionMetadataLookup, ComputerRegistry, DurableRegisteredComputer, LegacyRegisteredComputer (+20 more)

### Community 41 - "oracle-voice.ts"
Cohesion: 0.08
Nodes (40): VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities, closeServers, exactArrayBuffer(), sockets (+32 more)

### Community 42 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (12): headerSafe(), normalizeNodeUrl(), RemoteNodeClient, requestBytes(), client(), servers, session, AddComputerInput (+4 more)

### Community 43 - "session-directory.ts"
Cohesion: 0.10
Nodes (38): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+30 more)

### Community 44 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (39): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), float32ToPcm16() (+31 more)

### Community 45 - "session-resource-clear.test.ts"
Cohesion: 0.06
Nodes (41): ClaudeSdk, directories, fixture(), queryHandle(), services, disk, EnqueueCase, fixture() (+33 more)

### Community 46 - "ManagerProactiveCoordinator"
Cohesion: 0.09
Nodes (18): apps, directories, batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions (+10 more)

### Community 47 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 48 - "DreamerService"
Cohesion: 0.14
Nodes (7): digest(), DreamerService, DreamerUnavailableError, uniqueSessionRefs(), DreamerCompletionCandidate, DreamerSnapshot, OracleTaskAttempt

### Community 49 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (20): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine, playbackSequence() (+12 more)

### Community 50 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 51 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (39): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, deferred() (+31 more)

### Community 53 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 54 - "ManagerStore"
Cohesion: 0.09
Nodes (9): openStore(), emptyState(), ManagerStore, open(), createManager(), StoredManager, createManager(), SecurityManager (+1 more)

### Community 55 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 56 - "hub-routes.ts"
Cohesion: 0.06
Nodes (40): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+32 more)

### Community 57 - "normalizeKnowledgeRelativePath"
Cohesion: 0.09
Nodes (31): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), SessionKnowledgeBinding, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+23 more)

### Community 58 - "FakeSessionService"
Cohesion: 0.07
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 59 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 60 - ".sendInternal"
Cohesion: 0.14
Nodes (34): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), composerHoldsText(), composerText() (+26 more)

### Community 61 - "OracleDreamer.tsx"
Cohesion: 0.10
Nodes (31): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition (+23 more)

### Community 62 - "ChildVoiceEngine"
Cohesion: 0.12
Nodes (8): benchmarkGroup(), ChildVoiceEngine, errorMessage(), matchesCancelled(), matchesSynthesis(), matchesUtterance(), rememberCancellation(), VoiceChildProcess

### Community 63 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 64 - "pwa.ts"
Cohesion: 0.10
Nodes (36): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle() (+28 more)

### Community 65 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 66 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 67 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 68 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (27): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+19 more)

### Community 69 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (28): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+20 more)

### Community 70 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isAlreadyExists(), isDisposition() (+29 more)

### Community 71 - "transcription-service.ts"
Cohesion: 0.09
Nodes (23): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+15 more)

### Community 72 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 73 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (31): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+23 more)

### Community 74 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (34): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, eventString(), eventTask() (+26 more)

### Community 75 - "dreamer-service.ts"
Cohesion: 0.10
Nodes (29): DREAMER_MAX_ITEMS, DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), projectDreamerRegistry(), projectRegistryEntry(), boundedText() (+21 more)

### Community 76 - "KnowledgeStore"
Cohesion: 0.12
Nodes (14): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+6 more)

### Community 77 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/websocket, ffmpeg-static, @github/copilot-sdk (+27 more)

### Community 78 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 79 - "manager-structured-memory-search.ts"
Cohesion: 0.10
Nodes (28): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+20 more)

### Community 80 - "ResidentVoiceWorker"
Cohesion: 0.16
Nodes (4): combinedTranscript(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream

### Community 81 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+24 more)

### Community 82 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 83 - ".createSession"
Cohesion: 0.09
Nodes (8): removeCopilotSessionFiles(), RuntimeConfigurationError, forgetSessionEvents(), httpBoundary(), sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout()

### Community 84 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (30): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+22 more)

### Community 85 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (20): FakeVoiceEngineCall, SocketMessage, apps, config, configFixture(), connect(), Inbox, issueTicket() (+12 more)

### Community 87 - "remote-voice-client.ts"
Cohesion: 0.16
Nodes (14): VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+6 more)

### Community 88 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 89 - "real-voice.ts"
Cohesion: 0.10
Nodes (12): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+4 more)

### Community 90 - "queued-provider-dispatch.test.ts"
Cohesion: 0.08
Nodes (15): nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), errorMessage(), ownsDispatchRecovery(), preflight(), QueuedDispatches, copilotSession() (+7 more)

### Community 91 - "registerSessionKnowledgeRoutes"
Cohesion: 0.11
Nodes (22): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+14 more)

### Community 92 - "node-routes.ts"
Cohesion: 0.07
Nodes (30): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, exactArrayBuffer() (+22 more)

### Community 93 - ".discoverSessions"
Cohesion: 0.11
Nodes (4): normalizedTitle(), TerminalDiscoveryError, DiscoveredSession, StartupPhases

### Community 94 - "push-notification-service.ts"
Cohesion: 0.12
Nodes (20): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+12 more)

### Community 95 - "send-matrix.integration.test.ts"
Cohesion: 0.07
Nodes (25): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+17 more)

### Community 96 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 97 - "react"
Cohesion: 0.11
Nodes (18): react, transcribeAudio(), changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames() (+10 more)

### Community 98 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 99 - "SettingsProfileSnapshot"
Cohesion: 0.11
Nodes (16): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), directories, fakeManager(), hub(), local (+8 more)

### Community 100 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (23): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse(), pastedPlaceholderCount(), qualifyingPasteCount() (+15 more)

### Community 101 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 102 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 103 - "PushNotificationService"
Cohesion: 0.20
Nodes (3): PushNotificationService, scoped(), registerPushRoutes()

### Community 104 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 105 - "ChatMessage"
Cohesion: 0.14
Nodes (12): Connection, Client, PatchSocket, Browser, seedOffset, StoredSession, ChatMessage, HubResyncRequest (+4 more)

### Community 106 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 107 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 108 - "ManagerSnapshot"
Cohesion: 0.11
Nodes (3): FakeManager, FakeManager, ManagerSnapshot

### Community 109 - "ManagerStructuredMemoryStore"
Cohesion: 0.22
Nodes (5): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState

### Community 110 - "oracle-voice-worker.ts"
Cohesion: 0.13
Nodes (19): matchesCancelled(), VoiceGenerationIdentity, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), exactKeys(), isCancelledEvent(), isEnabledConfig() (+11 more)

### Community 111 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 112 - "delegated-transcription-service.ts"
Cohesion: 0.14
Nodes (11): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload (+3 more)

### Community 113 - "oracle-voice-segments.ts"
Cohesion: 0.16
Nodes (21): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+13 more)

### Community 114 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 115 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 116 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 117 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 118 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 119 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 120 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 121 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 122 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 123 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 124 - "oracle-voice-child.test.ts"
Cohesion: 0.12
Nodes (7): createVoiceWorker(), childHarness(), config, FakePiperProcess, fakeSherpa(), FakeSherpaStream, ChildVoiceEngineDependencies

### Community 125 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession() (+1 more)

### Community 126 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 127 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 128 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 129 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 130 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 131 - "VoiceTurnState"
Cohesion: 0.18
Nodes (3): errorMessage(), PendingFinalTurn, VoiceTurnState

### Community 132 - "recordValue"
Cohesion: 0.18
Nodes (18): attachmentModeValue(), backgroundHandoff(), booleanValue(), errorValue(), notificationKind(), parsedValue(), rawTailText(), recordValue() (+10 more)

### Community 133 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 135 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 136 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 137 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 138 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 139 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 140 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 141 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 142 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession() (+8 more)

### Community 143 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 144 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 145 - "DeferredSession"
Cohesion: 0.15
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 146 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 147 - "manager-runtime.ts"
Cohesion: 0.24
Nodes (11): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+3 more)

### Community 148 - "ManagerEvent"
Cohesion: 0.16
Nodes (5): ManagerEventSource, ProactiveManager, ManagerEventSource, trusted, ManagerEvent

### Community 149 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 150 - "VoiceWorkerParentMessage"
Cohesion: 0.19
Nodes (6): FakeChildProcess, initialize(), InProcessVoiceChild, parentHarness(), VoiceWorker, VoiceWorkerParentMessage

### Community 151 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 152 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 153 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 154 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 155 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 156 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (7): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 157 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 158 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 159 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 160 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 161 - "pending-echo.ts"
Cohesion: 0.28
Nodes (9): nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes(), sameText() (+1 more)

### Community 162 - ".initialize"
Cohesion: 0.24
Nodes (4): initializeManagerStructuredMemory(), isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 163 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 164 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 165 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 166 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 167 - ".transport"
Cohesion: 0.33
Nodes (4): WorkspaceFixtureState, SettingsProfileState, SettingsProfileRecord, FakeHub

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

### Community 173 - "DreamerMorningPlan"
Cohesion: 0.38
Nodes (10): DreamerMorningPlan(), confirmCompletion(), confirmTaskCompletion(), dispatchTask(), disposition(), edit(), investigate(), move() (+2 more)

### Community 174 - "HubEvent"
Cohesion: 0.25
Nodes (4): WorkspaceFixture, ComputerManagerEvents, HubEventSource, HubEvent

### Community 175 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 176 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 178 - "FakeRecorder"
Cohesion: 0.22
Nodes (4): drawDiagram(), drawing, MermaidDiagram(), FakeRecorder

### Community 179 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 180 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 181 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 182 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 183 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 184 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 185 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 186 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 188 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 189 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 190 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 191 - "appearance.ts"
Cohesion: 0.50
Nodes (3): Appearance, appearanceFrom(), appearanceStorageKey

## Knowledge Gaps
- **1224 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1219 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2054 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `SessionStore`, `AgentService`, `ClaudeAgentService`, `oracle-voice-session.ts`, `ManagerAgent`, `ManagedSession`, `manager-runtime.ts`, `manager-context.ts`, `manager.ts`, `.initialize`, `oracle-task-store.ts`, `SessionService`, `manager-agent.ts`, `session-knowledge-store.ts`, `session-knowledge-routes.test.ts`, `ManagerProactiveCoordinator`, `dreamer-routes.ts`, `DreamerService`, `ProviderSessionService`, `ManagerStore`, `ChildVoiceEngine`, `oracle-voice-config.ts`, `transcription-service.ts`, `KnowledgeStore`, `SessionOrderStore`, `SettingsProfileSnapshot`, `cli-canary.ts`, `PushNotificationService`, `ManagerStructuredMemoryStore`, `delegated-transcription-service.ts`, `refusal-metrics.ts`, `ManagerProactiveInbox`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `agent-service.ts`, `contracts.ts`, `ClaudeAgentService`, `claude-agent-service.ts`, `session-directory.ts`, `.createSession`, `SessionDetail`, `queued-provider-dispatch.test.ts`, `.discoverSessions`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `agent-service.ts`, `contracts.ts`, `ClaudeAgentService`, `session-resource-clear.test.ts`, `SessionDetail`, `.discoverSessions`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1224 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.02394197207678883 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.04247943595769683 - nodes in this community are weakly interconnected._
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
