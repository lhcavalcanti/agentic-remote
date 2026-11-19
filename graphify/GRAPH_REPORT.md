# Agentic Remote - Graphify code map

Snapshot: `996705c1a555bc8f2c5753e97bd5815725d952d17d3f72d519f90c8656ac2e77`

Source checkout: `db5e567f66b765abd91340ad759d3baaae74c211`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 634 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 634 files · ~1,126,480 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 8870 nodes · 25628 edges · 249 communities (208 shown, 23 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1295 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- api.ts
- AppWorkspace
- SessionStore
- SessionDetail
- App.tsx
- sections.tsx
- workspace-fixtures.ts
- agent-service.ts
- ManagedSession
- computer-manager.ts
- client.ts
- claude-agent-service.ts
- schedules.ts
- contracts.ts
- manager-agent.ts
- react
- session-presentation.ts
- ManagerStore
- agentic-remote-promotion-monitor
- ManagerAgent
- dreamer-store.ts
- terminal-session.ts
- oracle-voice-soak.ts
- manager-tools.ts
- oracle-voice-child.ts
- CopilotSessionLike
- app.ts
- VoiceCapture
- CopilotClientLike
- preview-features.ts
- oracle-voice-engine.ts
- tmux-test-helpers.ts
- RemoteNodeClient
- transcription-service.ts
- oracle-voice-integration.test.ts
- transport.test.ts
- OracleVoiceCoordinator
- oracle-voice-routes.ts
- ManagerMessage
- oracle-voice-coordinator.ts
- oracle-voice-worker.ts
- manager-structured-memory-validation.ts
- DreamerService
- oracle-task-store.ts
- ProviderSessionService
- recovery-resend-durability.test.ts
- ManagerEvent
- sampler.ts
- ScheduleRun
- .sendInternal
- active-sessions.ts
- session-knowledge-routes.test.ts
- fake-voice.ts
- OracleDreamer.tsx
- SchedulerStore
- session-knowledge-store.ts
- oracle-voice-benchmark.ts
- FakeVoiceEngine
- SessionService
- oracle-voice-session.ts
- agentic-remote
- host-telemetry.ts
- session-directory.ts
- TmuxTerminalSessionController
- VoiceClientControl
- dreamer-progress.ts
- hub-routes.ts
- processes.ts
- send-matrix.integration.test.ts
- agentic-remote-gate
- server/skill-settings.ts
- session-patch-browser.ts
- bundle
- KnowledgeStore
- ResidentVoiceWorker
- shell.ts
- VoicePlayback
- schedule-recurrence.ts
- lib.rs
- capture-workspace.ts
- oracle-voice-config.ts
- session-latency-benchmark.ts
- dependencies
- session-launcher.ts
- ManagerAssistant.tsx
- client.test.ts
- agentic-remote-promotion-setup
- SessionOrderStore
- devDependencies
- config.rs
- PushNotificationService
- scheduler-dispatcher.ts
- notification-classifier.ts
- oracle-voice-routes.test.ts
- manager-proactive-inbox.ts
- UserInputReplyInput
- manager-context.ts
- manager-structured-memory.ts
- oracle-voice-security.test.ts
- HubEvent
- shared/settings-profile.ts
- dreamer-planner.ts
- startup-phases.test.ts
- push-notification-service.ts
- ui-scenes.ts
- manager-structured-memory-search.ts
- oracle-voice-segments.ts
- knowledge-tree.ts
- oracle-voice.ts
- registerSessionKnowledgeRoutes
- background-task-adapter.ts
- terminal-session.test.ts
- SettingsProfileSnapshot
- ManagerAttachment
- notification-center-service.ts
- ManagerStructuredMemoryStore
- backgroundTasksFromEvents
- cli-canary.ts
- dreamer-service.ts
- src/settings-profile.ts
- scripts
- use-markdown-document.ts
- SettingsProfileClient
- ManagerAssistant.test.tsx
- compilerOptions
- ScheduleProposalCards.tsx
- agent-service.test.ts
- NotificationCenterService
- HostTelemetrySampler
- session-reply-durability.test.ts
- NotificationRecord
- normalizeKnowledgeRelativePath
- compilerOptions
- full-gate.test.ts
- session-store-providers.test.ts
- PromptCards.tsx
- compilerOptions
- ManagerProactiveInbox
- NotificationStore
- ScheduleWorktreeService
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- oracle-status.test.ts
- ManagerMemory
- .correct
- dreamer-schedule.ts
- promotion-monitor.test.ts
- terminal-startup-queue.test.ts
- pipeline.ts
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- session-resource-routes.test.ts
- terminal-form-deadline.test.ts
- background-task-stop.test.ts
- closed-session-sweeper.ts
- renderer.ts
- package.json
- .askSession
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- DeferredSession
- session-resource-providers.test.ts
- theme-contrast.test.ts
- use-markdown-document.test.tsx
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- dreamer-service.test.ts
- .observe
- manager-proactive-inbox.test.ts
- Pcm16Resampler
- background-task-tracker.ts
- recovery-seed-guards.test.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- sign-in-expired.pw.ts
- isRecord
- SessionAdmissions
- use-oracle-attachments.ts
- settings-profile.test.ts
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- ManagerProactiveInboxValidationError
- notification-center.integration.test.ts
- bridge.rs
- pipeline.test.tsx
- vite.config.ts
- dreamer-routes.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- SkillsSettings.tsx
- sent-message.ts
- voice-recorder.ts
- doctor-cli.test.ts
- recovery-context.ts
- release-publication.test.ts
- history-projection.test.ts
- settings.ts
- .transport
- composer-layout.test.ts
- usePanelWidth
- worker-handler.ts
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- FakeRecorder
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- @fastify/static
- ffprobe-static
- hast-util-to-jsx-runtime
- html-url-attributes
- lucide-react
- onnxruntime-web
- mermaid
- react
- remark-gfm
- remark-rehype
- zod
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `AppWorkspace()` - 350 edges
2. `SessionDetail` - 337 edges
3. `AgentService` - 303 edges
4. `SessionStore` - 207 edges
5. `ManagedSession` - 184 edges
6. `buildApp()` - 138 edges
7. `ClaudeAgentService` - 135 edges
8. `registerHubRoutes()` - 107 edges
9. `ComputerManager` - 106 edges
10. `ManagerAgent` - 101 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `FakeVoiceState` --references--> `ManagerMessage`  [EXTRACTED]
  e2e/fixtures/fake-voice.ts → shared/manager.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (249 total, 23 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (14): agentMode(), AgentService, isTerminalNotReadyRefusal(), lifecycleRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, sessionInUseConflictMessage(), suspendedRuntimeConflict() (+6 more)

### Community 1 - "api.ts"
Cohesion: 0.02
Nodes (173): SessionKnowledgeBinding, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt() (+165 more)

### Community 2 - "AppWorkspace"
Cohesion: 0.03
Nodes (184): terminalSendOptions(), sessionFileValidationError(), submissionReceiptFromError(), AppWorkspace(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot() (+176 more)

### Community 3 - "SessionStore"
Cohesion: 0.02
Nodes (95): normalizedTitle(), fixture(), restart(), fixture(), connect(), createStore(), enqueue(), fixture() (+87 more)

### Community 4 - "SessionDetail"
Cohesion: 0.03
Nodes (14): ClaudeAgentService, isMissingClaudeSessionError(), FakeSessionService, preparePrompt(), observe(), copilotRequest(), assertSessionNotRetained(), clearRecoverySeedFailure() (+6 more)

### Community 5 - "App.tsx"
Cohesion: 0.02
Nodes (130): isManagerEvent(), executeCommand(), activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+122 more)

### Community 6 - "sections.tsx"
Cohesion: 0.03
Nodes (112): RuntimeModelOption, AppearanceSetting, NewSessionBackendSetting, activateSession(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), updateManagerSettings() (+104 more)

### Community 7 - "workspace-fixtures.ts"
Cohesion: 0.03
Nodes (77): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+69 more)

### Community 8 - "agent-service.ts"
Cohesion: 0.04
Nodes (82): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+74 more)

### Community 9 - "ManagedSession"
Cohesion: 0.06
Nodes (18): ComputerManager, managedSession(), mapWithConcurrency(), RemoteSessionListing, sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier (+10 more)

### Community 10 - "computer-manager.ts"
Cohesion: 0.03
Nodes (77): FileUploadError, registerFileUploadRoutes(), SessionParams, withSessionCreateBoundary(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema (+69 more)

### Community 11 - "client.ts"
Cohesion: 0.05
Nodes (37): ORACLE_VOICE_CONNECTION_TIMEOUT_MS, VoiceCapabilities, VoiceServerControl, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason() (+29 more)

### Community 12 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (69): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+61 more)

### Community 13 - "schedules.ts"
Cohesion: 0.04
Nodes (78): proposalInput, LaunchPrimitives, ScheduleLauncherHost, ScheduleProvenance, State, stateSchema, timestamp, action (+70 more)

### Community 14 - "contracts.ts"
Cohesion: 0.04
Nodes (57): AgentServiceEvents, DirectoryScope, directories, routingFixture(), session(), temporaryDirectory(), voiceControlQueues, voiceControlWaiters (+49 more)

### Community 15 - "manager-agent.ts"
Cohesion: 0.04
Nodes (56): DreamerProgressView, automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent (+48 more)

### Community 16 - "react"
Cohesion: 0.04
Nodes (50): react, families, modelFamily, repositoryModels, addComputer(), changed(), frames, innermostDialogFrame() (+42 more)

### Community 17 - "session-presentation.ts"
Cohesion: 0.04
Nodes (72): CLOSED_SESSION_RETENTION_DAYS, closedSessionContext(), closedSessionExpiresAt(), excerpt(), isClosedSessionContext(), said(), BackgroundTaskSnapshot, ClosedSessionContext (+64 more)

### Community 18 - "ManagerStore"
Cohesion: 0.05
Nodes (29): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+21 more)

### Community 19 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 20 - "ManagerAgent"
Cohesion: 0.07
Nodes (13): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), capturePrompt(), TurnError (+5 more)

### Community 21 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (44): publicSnapshot(), assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+36 more)

### Community 22 - "terminal-session.ts"
Cohesion: 0.05
Nodes (75): afterExit(), boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus(), composerHoldsOtherText() (+67 more)

### Community 23 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (33): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+25 more)

### Community 24 - "manager-tools.ts"
Cohesion: 0.05
Nodes (38): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), changeSuspension() (+30 more)

### Community 25 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (47): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, createVoiceWorker(), defaultSpawnPiper(), errorMessage() (+39 more)

### Community 26 - "CopilotSessionLike"
Cohesion: 0.04
Nodes (36): CopilotSessionLike, CopilotTasksApi, nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused() (+28 more)

### Community 27 - "app.ts"
Cohesion: 0.04
Nodes (51): apps, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName() (+43 more)

### Community 28 - "VoiceCapture"
Cohesion: 0.06
Nodes (24): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, harness() (+16 more)

### Community 29 - "CopilotClientLike"
Cohesion: 0.03
Nodes (50): CopilotClientLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), directories (+42 more)

### Community 30 - "preview-features.ts"
Cohesion: 0.07
Nodes (45): hub(), AppVersion, SessionProvenance, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue (+37 more)

### Community 31 - "oracle-voice-engine.ts"
Cohesion: 0.05
Nodes (23): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+15 more)

### Community 32 - "tmux-test-helpers.ts"
Cohesion: 0.06
Nodes (54): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), startAgentAfterClear(), exec (+46 more)

### Community 33 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (15): RemoteResync, RemoteSessionRead, RemoteNodeClient, client(), servers, session, RemoteNodeCapabilityError, RemoteNodeTransportError (+7 more)

### Community 34 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+27 more)

### Community 35 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+24 more)

### Community 36 - "transport.test.ts"
Cohesion: 0.06
Nodes (36): prefixes, session, trusted, untrusted, BuildAppOptions, ProcessScanContext, HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS (+28 more)

### Community 37 - "OracleVoiceCoordinator"
Cohesion: 0.09
Nodes (5): errorMessage(), OracleVoiceCoordinator, PendingFinalTurn, withTimeout(), VoiceTurnState

### Community 38 - "oracle-voice-routes.ts"
Cohesion: 0.06
Nodes (47): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+39 more)

### Community 39 - "ManagerMessage"
Cohesion: 0.06
Nodes (23): FakeManager, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams (+15 more)

### Community 40 - "oracle-voice-coordinator.ts"
Cohesion: 0.05
Nodes (34): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnection (+26 more)

### Community 41 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (23): benchmarkGroup(), VoiceTtsEngine, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent(), isEnabledConfig() (+15 more)

### Community 42 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 43 - "DreamerService"
Cohesion: 0.11
Nodes (13): activeDreamerMemoryIds(), DreamerMemoryMetadata, digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), safeRunError(), unavailableSnapshot() (+5 more)

### Community 44 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (36): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+28 more)

### Community 46 - "recovery-resend-durability.test.ts"
Cohesion: 0.04
Nodes (39): root, script, directories, disk, fixture(), gate(), gates, initialize() (+31 more)

### Community 47 - "ManagerEvent"
Cohesion: 0.07
Nodes (19): apps, directories, DreamerServiceOptions, ManagerEventSource, batchMessageId(), ComputerGenerations, isTerminal(), lifecycles() (+11 more)

### Community 48 - "sampler.ts"
Cohesion: 0.08
Nodes (45): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+37 more)

### Community 49 - "ScheduleRun"
Cohesion: 0.12
Nodes (12): provenance(), recordScheduleProvenance(), scheduleSessionTitle(), SessionScheduleLauncher, session(), ScheduleLaunchRefusedError, SchedulerDispatcher, ScheduleReconciliation (+4 more)

### Community 50 - ".sendInternal"
Cohesion: 0.10
Nodes (41): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity() (+33 more)

### Community 51 - "active-sessions.ts"
Cohesion: 0.08
Nodes (44): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+36 more)

### Community 52 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (30): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+22 more)

### Community 53 - "fake-voice.ts"
Cohesion: 0.07
Nodes (10): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance (+2 more)

### Community 54 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (44): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+36 more)

### Community 55 - "SchedulerStore"
Cohesion: 0.11
Nodes (9): enableSchedulerTools(), fixture(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, retainedHistory(), ScheduleProposal (+1 more)

### Community 56 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (28): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema (+20 more)

### Community 57 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 58 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (23): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+15 more)

### Community 59 - "SessionService"
Cohesion: 0.07
Nodes (5): closeReason(), closeVoiceSocket(), nodeVoiceCapabilities(), registerNodeRoutes(), SessionService

### Community 60 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (18): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), outputBytes() (+10 more)

### Community 61 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 62 - "host-telemetry.ts"
Cohesion: 0.07
Nodes (41): fixtureScheduleRuns, fixtureSchedules, MinuteAccumulator, aggregate, DiskSpaceSchema, HostHistorySchema, HostInfoSchema, HostMetric (+33 more)

### Community 63 - "session-directory.ts"
Cohesion: 0.10
Nodes (38): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+30 more)

### Community 64 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (11): awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, processAncestors(), processCommand(), safeWindowName(), tmuxSessionExists() (+3 more)

### Community 65 - "VoiceClientControl"
Cohesion: 0.09
Nodes (22): VoiceBackendDisconnectCause, VoiceBackendOutput, RemoteNodeRedirectError, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError() (+14 more)

### Community 66 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 67 - "hub-routes.ts"
Cohesion: 0.05
Nodes (44): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+36 more)

### Community 68 - "processes.ts"
Cohesion: 0.09
Nodes (26): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+18 more)

### Community 69 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (40): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+32 more)

### Community 70 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 71 - "server/skill-settings.ts"
Cohesion: 0.10
Nodes (27): instrument(), frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills(), Token, readBounded() (+19 more)

### Community 72 - "session-patch-browser.ts"
Cohesion: 0.08
Nodes (33): advance(), Connection, connections, content(), FrameMeasurement, lastHeading(), message(), open() (+25 more)

### Community 73 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 74 - "KnowledgeStore"
Cohesion: 0.09
Nodes (19): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+11 more)

### Community 75 - "ResidentVoiceWorker"
Cohesion: 0.13
Nodes (9): combinedTranscript(), matchesCancelled(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceGenerationIdentity, VoiceSynthesisRequest, ActiveSynthesisIdentity (+1 more)

### Community 76 - "shell.ts"
Cohesion: 0.09
Nodes (35): ScheduleShellNotifier, attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label() (+27 more)

### Community 77 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 78 - "schedule-recurrence.ts"
Cohesion: 0.10
Nodes (37): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+29 more)

### Community 79 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 80 - "capture-workspace.ts"
Cohesion: 0.08
Nodes (25): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+17 more)

### Community 81 - "oracle-voice-config.ts"
Cohesion: 0.08
Nodes (29): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+21 more)

### Community 82 - "session-latency-benchmark.ts"
Cohesion: 0.10
Nodes (27): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+19 more)

### Community 83 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 84 - "session-launcher.ts"
Cohesion: 0.08
Nodes (21): delay(), requireFolderTrust(), sameFolder(), SessionFolderTrustPolicy, SessionLaunch, SessionLauncher, SessionLauncherHost, SessionLauncherOptions (+13 more)

### Community 85 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (33): editQueuedManagerMessage(), resetManager(), retryManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), canTakeFocus(), ConfirmationCard (+25 more)

### Community 86 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 87 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 88 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 89 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 90 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 91 - "PushNotificationService"
Cohesion: 0.13
Nodes (8): start(), PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 92 - "scheduler-dispatcher.ts"
Cohesion: 0.09
Nodes (19): ScheduleNotificationService, NoopScheduleLauncher, ScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS, SchedulerDispatcherOptions, ScheduleStopAcknowledgement (+11 more)

### Community 93 - "notification-classifier.ts"
Cohesion: 0.12
Nodes (26): computer, observe(), snapshot(), start, sustained(), attentionClosed(), attentionSeed(), classifyHostNotification() (+18 more)

### Community 94 - "oracle-voice-routes.test.ts"
Cohesion: 0.07
Nodes (17): ActiveBackendSession, exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), ObservedLocalVoiceBackend, openApps, openSockets (+9 more)

### Community 95 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (34): assertExactKeys(), cloneState(), DISPOSITIONS, hasExactKeys(), isDisposition(), isEventKind(), isId(), isOrigin() (+26 more)

### Community 96 - "UserInputReplyInput"
Cohesion: 0.13
Nodes (9): isUncertainDelivery(), persistedFormAnswer(), terminalAnswerRefused(), TerminalFormContinuation, validateUserInputForm(), TerminalFormReplyError, PendingUserInput, UserInputReplyInput (+1 more)

### Community 97 - "manager-context.ts"
Cohesion: 0.13
Nodes (27): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+19 more)

### Community 98 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (29): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+21 more)

### Community 99 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (20): FakeVoiceEngineCall, VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), connect(), Inbox (+12 more)

### Community 100 - "HubEvent"
Cohesion: 0.08
Nodes (19): ComputerManagerEvents, Seen, PersistedCursor, NotificationRecorder, NotificationCursor, HubEventSource, headers, hub() (+11 more)

### Community 101 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (29): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+21 more)

### Community 102 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (29): activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem(), digest() (+21 more)

### Community 103 - "startup-phases.test.ts"
Cohesion: 0.08
Nodes (18): phases, port, app(), directories, headers, launcher, createStartupPhases(), silentStartupPhases (+10 more)

### Community 104 - "push-notification-service.ts"
Cohesion: 0.09
Nodes (22): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+14 more)

### Community 105 - "ui-scenes.ts"
Cohesion: 0.12
Nodes (20): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+12 more)

### Community 106 - "manager-structured-memory-search.ts"
Cohesion: 0.11
Nodes (26): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+18 more)

### Community 107 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 108 - "knowledge-tree.ts"
Cohesion: 0.11
Nodes (29): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+21 more)

### Community 109 - "oracle-voice.ts"
Cohesion: 0.16
Nodes (29): decodeVoiceAudioFrame(), encodeVoiceAudioFrame(), hasExactKeys(), hasOnlyKeys(), hasRequiredKeys(), isBoundedTrimmedString(), isControlBase(), isFiniteNumber() (+21 more)

### Community 110 - "registerSessionKnowledgeRoutes"
Cohesion: 0.11
Nodes (22): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+14 more)

### Community 111 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (27): attachmentModeValue(), BackgroundTaskEventOptions, booleanValue(), CopilotClientTaskInfo, CopilotClientTaskProgress, executionModeValue(), isBackgroundTaskInfo(), isBackgroundTaskProgress() (+19 more)

### Community 112 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (24): parseTerminalUpdateNotice(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), deliveryFixture(), desktopInstallPane, directories (+16 more)

### Community 113 - "SettingsProfileSnapshot"
Cohesion: 0.14
Nodes (18): WorkspaceFixtureState, profileStore(), SettingsProfileState, SettingsProfileStore, directories, store(), applySettingsChanges(), applySettingsImport() (+10 more)

### Community 114 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 115 - "notification-center-service.ts"
Cohesion: 0.10
Nodes (23): NotificationCursors, booleanQuery, filters, params, cursorSchema, identity, kind, NOTIFICATION_LIMIT (+15 more)

### Community 116 - "ManagerStructuredMemoryStore"
Cohesion: 0.13
Nodes (8): initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMode, ManagerStructuredMemoryStatus

### Community 117 - "backgroundTasksFromEvents"
Cohesion: 0.19
Nodes (27): addActivity(), backgroundHandoff(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventString(), eventTask(), lastForegroundCompletionAt() (+19 more)

### Community 118 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 119 - "dreamer-service.ts"
Cohesion: 0.14
Nodes (24): DreamerPlanDraft, DreamerPlannerInput, boundedText(), DreamerFollowUp, DreamerPlannerExecutionInput, DreamerStoreSnapshot, DreamerStoreState, OracleTaskFindingInput (+16 more)

### Community 120 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (22): isSettingsRevision(), SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+14 more)

### Community 121 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 122 - "use-markdown-document.ts"
Cohesion: 0.15
Nodes (21): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+13 more)

### Community 123 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 124 - "ManagerAssistant.test.tsx"
Cohesion: 0.09
Nodes (16): cancelManager(), removeQueuedManagerMessage(), resolveManagerConfirmation(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator (+8 more)

### Community 125 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 126 - "ScheduleProposalCards.tsx"
Cohesion: 0.17
Nodes (20): getSchedule(), listScheduleProposals(), resolveScheduleProposal(), days, labels, proposalChanges(), proposalConsequence(), proposalSchedule (+12 more)

### Community 127 - "agent-service.test.ts"
Cohesion: 0.14
Nodes (14): terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+6 more)

### Community 128 - "NotificationCenterService"
Cohesion: 0.17
Nodes (3): HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, NotificationCenterService

### Community 129 - "HostTelemetrySampler"
Cohesion: 0.14
Nodes (5): HostTelemetryClock, HostTelemetrySampler, defaultDependencies(), HostMinuteAggregate, HostSample

### Community 130 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+10 more)

### Community 131 - "NotificationRecord"
Cohesion: 0.18
Nodes (16): NotificationRecord, FeatureEvent, listeners, publishFeatureEvent(), subscribeFeatureEvents(), NotificationGroup, notificationGroups(), NotificationTab (+8 more)

### Community 132 - "normalizeKnowledgeRelativePath"
Cohesion: 0.17
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), pathRecordSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+10 more)

### Community 133 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 134 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 135 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 136 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 137 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 138 - "ManagerProactiveInbox"
Cohesion: 0.22
Nodes (4): ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, nowIso(), openInbox()

### Community 139 - "NotificationStore"
Cohesion: 0.21
Nodes (6): durableState(), emptyState(), matchesNotification(), NotificationStore, setup(), NotificationFilter

### Community 140 - "ScheduleWorktreeService"
Cohesion: 0.28
Nodes (4): failure(), missing(), ScheduleWorktreeService, ScheduleWorktreeRecord

### Community 141 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 142 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 143 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 144 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 145 - "oracle-status.test.ts"
Cohesion: 0.18
Nodes (15): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+7 more)

### Community 146 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 147 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 148 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 149 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 150 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (10): client(), delayQueueWrite(), disk, exec, gate(), holdQueueCommit(), NativeFixture, NativeRuntime (+2 more)

### Community 151 - "pipeline.ts"
Cohesion: 0.19
Nodes (17): holdingRenderer(), partlyHeldRenderer(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform(), drawSteps(), growable (+9 more)

### Community 152 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 153 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 154 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 155 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 156 - "session-resource-routes.test.ts"
Cohesion: 0.15
Nodes (9): node(), apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService (+1 more)

### Community 157 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 158 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 159 - "closed-session-sweeper.ts"
Cohesion: 0.17
Nodes (5): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS

### Community 160 - "renderer.ts"
Cohesion: 0.19
Nodes (7): DocumentRenderEvent, createWorkerRenderer(), defaultDocumentRenderer(), RendererWorker, synchronousRenderer, FakeWorker, startWorkers()

### Community 161 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 162 - ".askSession"
Cohesion: 0.24
Nodes (4): sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout()

### Community 163 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 164 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 165 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 166 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 167 - "session-resource-providers.test.ts"
Cohesion: 0.22
Nodes (13): claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures (+5 more)

### Community 168 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 169 - "use-markdown-document.test.tsx"
Cohesion: 0.16
Nodes (6): drawnInParts(), RenderedDocumentTree, DocumentRenderer, DocumentRendererContext, components, show()

### Community 170 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 171 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 172 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 173 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 174 - ".observe"
Cohesion: 0.21
Nodes (7): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId()

### Community 175 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 176 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 177 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 178 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 179 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 180 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 181 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 182 - "isRecord"
Cohesion: 0.29
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 184 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 185 - "settings-profile.test.ts"
Cohesion: 0.20
Nodes (4): settingsProfileCacheKey, SettingsProfileTransport, cached(), MemoryStorage

### Community 186 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 187 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 188 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 189 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 190 - "notification-center.integration.test.ts"
Cohesion: 0.22
Nodes (7): center(), directories, directory(), hub(), now, runtimes, trusted

### Community 191 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 192 - "pipeline.test.tsx"
Cohesion: 0.27
Nodes (7): components, drawn(), drawnPage(), fixtures, html(), today(), rehypeDocumentHeadings()

### Community 193 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 194 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 195 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 196 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 197 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 198 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 199 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 200 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 201 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 202 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 203 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 204 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 206 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 207 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 208 - "worker-handler.ts"
Cohesion: 0.47
Nodes (4): render, scope, handleRenderRequest(), RenderRequest

### Community 209 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 210 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1420 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1415 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2377 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `UserInputReplyInput`, `VoiceClientControl`, `SessionDetail`, `server/skill-settings.ts`, `ManagedSession`, `computer-manager.ts`, `ScheduleWorktreeService`, `claude-agent-service.ts`, `contracts.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `UserInputReplyInput`, `SessionDetail`, `agent-service.ts`, `contracts.ts`, `recovery-resend-durability.test.ts`, `CopilotSessionLike`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `composerFocusWitnessed()` connect `.sendInternal` to `TmuxTerminalSessionController`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1420 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.033321312657771364 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.02201783723522854 - nodes in this community are weakly interconnected._
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
- `docs/design/client-features.md`
- `docs/design/composer-input.md`
- `docs/design/host-monitor.md`
- `docs/design/host-telemetry.md`
- `docs/design/launch-identity.md`
- `docs/design/notification-center.md`
- `docs/design/oracle-conversation-mode.md`
- `docs/design/oracle-dreamer.md`
- `docs/design/oracle-durable-ux.md`
- `docs/design/oracle-proactive-inbox.md`
- `docs/design/scheduler.md`
- `docs/design/session-manager.md`
- `docs/design/session-provenance.md`
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
- `e2e/ui-locks.pw.ts-snapshots/desktop-app-settings-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-busy-queue-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-button-row-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-delivery-menu-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-delivery-unavailable-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-family-claude-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-family-openai-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-sent-messages-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-session-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-session-setup-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-status-busy-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-computers-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-conversation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-desktop-rail-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-host-monitor-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-host-processes-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-new-session-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-notification-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-oracle-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-oracle-schedule-approval-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-preview-features-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-runtime-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-form-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-name-conflict-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-stale-link-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-unpaired-target-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-session-list-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-session-origin-run-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-session-origin-tasks-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-session-origin-tasks-short-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-session-origins-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-session-subagents-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-settings-health-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-settings-health-search-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-settings-invalid-skill-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-settings-navigation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-settings-remote-machines-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-settings-search-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-settings-skill-confirmation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-settings-skills-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-app-settings-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-busy-queue-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-button-row-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-delivery-menu-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-delivery-unavailable-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-family-claude-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-family-openai-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-sent-messages-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-session-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-session-setup-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-status-busy-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-computers-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-conversation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-desktop-rail-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-host-monitor-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-host-processes-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-new-session-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-notification-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-oracle-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-oracle-schedule-approval-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-preview-features-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-runtime-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-form-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-name-conflict-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-stale-link-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-unpaired-target-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-session-list-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-session-origin-run-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-session-origin-tasks-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-session-origin-tasks-short-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-session-origins-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-session-subagents-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-settings-health-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-settings-health-search-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-settings-invalid-skill-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-settings-navigation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-settings-remote-machines-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-settings-search-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-settings-skill-confirmation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-settings-skills-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-app-settings-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-busy-queue-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-button-row-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-delivery-menu-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-delivery-unavailable-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-family-claude-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-family-openai-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-sent-messages-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-session-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-session-setup-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-status-busy-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-computers-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-conversation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-desktop-rail-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-host-monitor-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-host-processes-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-new-session-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-notification-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-oracle-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-oracle-schedule-approval-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-preview-features-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-runtime-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-form-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-name-conflict-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-stale-link-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-unpaired-target-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-session-list-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-session-origin-run-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-session-origin-tasks-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-session-origin-tasks-short-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-session-origins-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-session-subagents-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-settings-health-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-settings-health-search-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-settings-invalid-skill-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-settings-navigation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-settings-remote-machines-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-settings-search-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-settings-skill-confirmation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-settings-skills-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/scheduler-abandon-desktop-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/scheduler-abandon-phone-chromium-linux.png`
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
- `src/host-monitor/host-monitor.css`
- `src/index.css`
- `src/notifications/notifications.css`
- `src/rail/rail.css`
- `src/schedule-proposals.css`
- `src/scheduler/scheduler.css`
- `src/settings/README.md`
- `config/oracle-voice-profiles.json`
