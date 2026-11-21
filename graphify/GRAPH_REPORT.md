# Agentic Remote - Graphify code map

Snapshot: `f6db8688a19b0318563ab00afa26985047bb4369952b403b7065fb92b460dc43`

Source checkout: `7bcb94df6540ad45b23181efc3f158ae0b775589`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 640 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 640 files · ~1,143,463 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 8981 nodes · 25929 edges · 253 communities (206 shown, 27 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1321 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- contracts.ts
- AppWorkspace
- SessionStore
- agent-service.ts
- api.ts
- ComputerSummary
- AgentService
- App.tsx
- SchedulerStore
- SessionDetail
- ManagerAssistant.tsx
- OracleVoiceCoordinator
- agent-service.test.ts
- oracle-voice-child.ts
- react
- .readAfterWrites
- FakeVoiceEngine
- AppSettingsDialog.tsx
- app.ts
- manager-tools.ts
- workspace-fixtures.ts
- oracle-voice-benchmark.ts
- oracle-voice-soak.ts
- host-telemetry.ts
- session-presentation.ts
- registerHubRoutes
- agentic-remote-promotion-monitor
- schedule-recurrence.ts
- ManagerMessage
- oracle-voice.ts
- dreamer-service.ts
- ManagerAgent
- manager-agent.ts
- terminal-session.ts
- .sendInternal
- transcription-service.ts
- send-matrix.integration.test.ts
- oracle-voice-security.test.ts
- ManagerStore
- oracle-voice-integration.test.ts
- OracleDreamer.tsx
- TerminalSessionController
- hub-routes.ts
- tmux-test-helpers.ts
- oracle-voice-worker.ts
- .drainNextTerminalPrompt
- session-store-providers.test.ts
- manager-structured-memory-validation.ts
- active-sessions.ts
- fake-voice.ts
- ProviderSessionService
- session-resources.ts
- background-task-adapter.ts
- manager-agent.test.ts
- SessionService
- TmuxTerminalSessionController
- dreamer-store.ts
- session-knowledge-store.ts
- processes.ts
- DreamerService
- agentic-remote
- KnowledgeStore
- oracle-voice-session.ts
- ComposerActions.tsx
- dreamer-progress.ts
- OracleVoiceClient
- agentic-remote-gate
- bundle
- manager-proactive-coordinator.ts
- session-knowledge-routes.test.ts
- DreamerStore
- VoicePlayback
- shell.ts
- lib.rs
- dependencies
- server/skill-settings.ts
- manager-context.ts
- PushNotificationService
- agentic-remote-promotion-setup
- manager-proactive-inbox.ts
- FakeSessionService
- SessionOrderStore
- devDependencies
- config.rs
- manager-structured-memory.ts
- oracle-voice-routes.ts
- knowledge-tree.ts
- oracle-voice-routes.test.ts
- ManagerStructuredMemoryStore
- dreamer-planner.ts
- oracle-voice-segments.ts
- DialogFrame.tsx
- ui-scenes.ts
- setupWorkspaceFixture
- ManagedSession
- registerSessionKnowledgeRoutes
- shared/settings-profile.ts
- SessionKnowledgeBinding
- SettingsProfileSnapshot
- terminal-session.test.ts
- session-patch-browser.ts
- session-directory.ts
- manager-structured-memory-search.ts
- cli-canary.ts
- src/settings-profile.ts
- scripts
- use-markdown-document.ts
- SettingsProfileClient
- VoiceCapture
- claude-agent-service.ts
- compilerOptions
- ManagerProactiveInbox
- oracle-status.test.ts
- SessionSkillsSnapshot
- oracle-voice-tickets.ts
- session-reply-durability.test.ts
- client.ts
- HostMonitorView.test.tsx
- compilerOptions
- full-gate.test.ts
- parsers.ts
- workspace-browser.ts
- PromptCards.tsx
- capture.ts
- capture-workspace.ts
- compilerOptions
- session-resource-routes.test.ts
- AgentProvider
- ScheduleWorktreeService
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- HostTelemetrySampler
- reader.ts
- ManagerMemory
- projection-test-helpers.ts
- dreamer-schedule.ts
- promotion-monitor.test.ts
- session-patches.test.ts
- pipeline.ts
- BoundedQueue
- ReaderWorkspace
- session-unread.pw.ts
- scripts
- session-latency-benchmark.ts
- closed-session-sweeper.ts
- server/session-patches.ts
- SettingsProfileStore
- renderer.ts
- OracleVoiceClientDependencies
- package.json
- terminal-form-deadline.test.ts
- BackgroundTask
- oracle-voice-assets.test.ts
- SessionAdmissions
- VoiceCapabilities
- use-oracle-settings.ts
- fake-vad.ts
- desktop.json
- background-task-stop.test.ts
- sampler.ts
- theme-contrast.test.ts
- use-markdown-document.test.tsx
- OracleVoiceClientOptions
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- ChatMessage
- isRecord
- session-scope.ts
- Pcm16Resampler
- recently-closed.pw.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- document-render.pw.ts
- sign-in-expired.pw.ts
- DeferredSession
- settings-profile-routes.ts
- manager-proactive-inbox.test.ts
- ManagerUploads
- dataset
- generate-pwa-icons.ts
- manager-structured-memory-performance.test.ts
- session-resource-transport.ts
- session-unread-tracker.ts
- bridge.rs
- pipeline.test.tsx
- VoiceCaptureOptions
- vite.config.ts
- screenshot-stability.test.ts
- dreamer-routes.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- closed-sessions.ts
- capture.test.ts
- VoiceVadOptions
- fixture-frontend.ts
- doctor-cli.test.ts
- release-publication.test.ts
- .runIfDueInternal
- HostTelemetryClock
- SessionStatus
- ManagerProactiveInboxValidationError
- manager-uploads.ts
- SessionRetentionPatch
- settings.ts
- OracleVoicePlayback
- SessionFileUpload
- composer-layout.test.ts
- ManagerProactiveInboxError
- manager-files.ts
- use-foreground-handoff.ts
- worker-handler.ts
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
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
3. `AgentService` - 310 edges
4. `SessionStore` - 212 edges
5. `ManagedSession` - 184 edges
6. `buildApp()` - 138 edges
7. `ClaudeAgentService` - 136 edges
8. `registerHubRoutes()` - 107 edges
9. `ComputerManager` - 106 edges
10. `ManagerAgent` - 101 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts
- `ClaudeAgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (253 total, 27 thin omitted)

### Community 0 - "contracts.ts"
Cohesion: 0.02
Nodes (142): AgentServiceEvents, ComputerManagerEvents, connections, managers, releases, remote, RemoteResync, RemoteSessionRead (+134 more)

### Community 1 - "AppWorkspace"
Cohesion: 0.02
Nodes (206): message(), sendLikeTheApp(), terminalSendOptions(), askSession(), clearConversation(), closeSession(), moveSessionToTmux(), recoverConversation() (+198 more)

### Community 2 - "SessionStore"
Cohesion: 0.03
Nodes (95): storage(), fixture(), fixture(), connect(), createStore(), deferred(), disk, enqueue() (+87 more)

### Community 3 - "agent-service.ts"
Cohesion: 0.02
Nodes (138): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+130 more)

### Community 4 - "api.ts"
Cohesion: 0.02
Nodes (152): AddKnowledgeRootInput, PushSettings, SessionKnowledgeRootMutationInput, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, parseSubmissionReceipt(), submissionReceiptFromError() (+144 more)

### Community 5 - "ComputerSummary"
Cohesion: 0.03
Nodes (94): HOST_ALERT_POLL_INTERVAL_MS, computer, observe(), snapshot(), start, sustained(), center(), directories (+86 more)

### Community 6 - "AgentService"
Cohesion: 0.04
Nodes (12): agentMode(), AgentService, isForegroundLifecycleEvent(), lifecycleRefusal(), recoveredPermissionTitle(), restart(), RuntimeConfigurationError, suspendedRuntimeConflict() (+4 more)

### Community 7 - "App.tsx"
Cohesion: 0.03
Nodes (115): ActivityStatus, extension(), MAX_SESSION_FILE_BYTES, sessionFileValidationError(), supportedExtensions, supportsSessionFile(), executeCommand(), listWorkspace() (+107 more)

### Community 8 - "SchedulerStore"
Cohesion: 0.05
Nodes (49): enableSchedulerTools(), LaunchPrimitives, provenance(), recordScheduleProvenance(), ScheduleLauncherHost, ScheduleProvenance, scheduleSessionTitle(), SessionScheduleLauncher (+41 more)

### Community 9 - "SessionDetail"
Cohesion: 0.04
Nodes (25): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+17 more)

### Community 10 - "ManagerAssistant.tsx"
Cohesion: 0.03
Nodes (90): MANAGER_PROACTIVE_EVENT_KINDS, ProactivePromptEvent, proactivePromptEvents(), failed, finished, ManagerAttachment, cancelManager(), editQueuedManagerMessage() (+82 more)

### Community 11 - "OracleVoiceCoordinator"
Cohesion: 0.04
Nodes (39): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+31 more)

### Community 12 - "agent-service.test.ts"
Cohesion: 0.02
Nodes (78): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+70 more)

### Community 13 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (56): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+48 more)

### Community 14 - "react"
Cohesion: 0.04
Nodes (79): react, hub(), AppVersion, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue (+71 more)

### Community 15 - ".readAfterWrites"
Cohesion: 0.04
Nodes (40): commandShortcut(), isTerminalNotReadyRefusal(), sessionInUseConflictMessage(), stripAnsi(), nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt() (+32 more)

### Community 16 - "FakeVoiceEngine"
Cohesion: 0.03
Nodes (46): clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics, registerControlRoutes() (+38 more)

### Community 17 - "AppSettingsDialog.tsx"
Cohesion: 0.04
Nodes (95): RuntimeModelOption, AppearanceSetting, DEFAULT_SESSION_PROVIDER, NewSessionBackendSetting, activateSession(), configureRuntime(), createSession(), deletePushSubscription() (+87 more)

### Community 18 - "app.ts"
Cohesion: 0.03
Nodes (74): buildApp(), errorStatusCode(), isAppleTouchIconProbe(), PRESENCE_TTL_MS, transcriptionComputerName(), directories, runtimes, trusted (+66 more)

### Community 19 - "manager-tools.ts"
Cohesion: 0.04
Nodes (51): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), changeSuspension() (+43 more)

### Community 20 - "workspace-fixtures.ts"
Cohesion: 0.04
Nodes (79): frame(), geometry, output, scratch, screenshot(), { values }, accents, Measurement (+71 more)

### Community 21 - "oracle-voice-benchmark.ts"
Cohesion: 0.04
Nodes (68): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, buildConfig(), CliOptions, clockTicksPerSecond() (+60 more)

### Community 22 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (36): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+28 more)

### Community 23 - "host-telemetry.ts"
Cohesion: 0.04
Nodes (56): prefixes, session, trusted, untrusted, BuildAppOptions, ProcessScanContext, HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS (+48 more)

### Community 24 - "session-presentation.ts"
Cohesion: 0.04
Nodes (71): CLOSED_SESSION_RETENTION_DAYS, saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, CloseSessionDialog(), RecentlyClosedCard(), RecentlyClosedDialog() (+63 more)

### Community 25 - "registerHubRoutes"
Cohesion: 0.09
Nodes (10): ComputerManager, managedSession(), mapWithConcurrency(), fixture(), session(), sessionAtLeastAsNew(), registerHubRoutes(), updateComputerForLaunchIdentity() (+2 more)

### Community 26 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 27 - "schedule-recurrence.ts"
Cohesion: 0.05
Nodes (68): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+60 more)

### Community 28 - "ManagerMessage"
Cohesion: 0.04
Nodes (26): FakeManager, FakeVoiceState, ProactiveManager, FakeAgent, confirmationSchema, defaultsSchema, editSchema, effort (+18 more)

### Community 29 - "oracle-voice.ts"
Cohesion: 0.06
Nodes (49): VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+41 more)

### Community 30 - "dreamer-service.ts"
Cohesion: 0.06
Nodes (53): DreamerPlanDraft, DreamerPlannerInput, DreamerProgressLimits, apps, directories, setup(), DreamerFollowUp, DreamerPlannerExecutionInput (+45 more)

### Community 31 - "ManagerAgent"
Cohesion: 0.08
Nodes (10): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, uniqueManagerSessionRefs() (+2 more)

### Community 32 - "manager-agent.ts"
Cohesion: 0.04
Nodes (42): CreationRuntime, DreamerMemoryMetadataRecord, directories, enabledSettings(), automaticPayload(), discover(), isPending(), isQueued() (+34 more)

### Community 33 - "terminal-session.ts"
Cohesion: 0.05
Nodes (66): afterExit(), boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus() (+58 more)

### Community 34 - ".sendInternal"
Cohesion: 0.07
Nodes (56): activeBottomFrame(), backgroundShellsAllow(), busyRowStatus(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerHoldsOtherText() (+48 more)

### Community 35 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionMultipartOptions (+27 more)

### Community 36 - "send-matrix.integration.test.ts"
Cohesion: 0.04
Nodes (53): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+45 more)

### Community 37 - "oracle-voice-security.test.ts"
Cohesion: 0.04
Nodes (32): FakeVoiceEngineCall, SocketMessage, apps, config, configFixture(), connect(), createManager(), Inbox (+24 more)

### Community 38 - "ManagerStore"
Cohesion: 0.07
Nodes (23): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+15 more)

### Community 39 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+23 more)

### Community 40 - "OracleDreamer.tsx"
Cohesion: 0.07
Nodes (51): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, checkHubSignIn(), completeDreamerTask(), dispatchDreamerTask(), DreamerApiError (+43 more)

### Community 41 - "TerminalSessionController"
Cohesion: 0.05
Nodes (14): isUncertainDelivery(), PendingUserInputTracker, persistedFormAnswer(), removeCopilotSessionFiles(), terminalAnswerRefused(), TerminalFormContinuation, terminalFormSteps(), validateUserInputForm() (+6 more)

### Community 42 - "hub-routes.ts"
Cohesion: 0.05
Nodes (55): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+47 more)

### Community 43 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (49): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, Screens, startCopilot() (+41 more)

### Community 44 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (26): benchmarkGroup(), VoiceEngineSession, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys() (+18 more)

### Community 46 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (37): root, script, directories, disk, gate(), gates, initialize(), PublicSessionValue (+29 more)

### Community 47 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 48 - "active-sessions.ts"
Cohesion: 0.07
Nodes (49): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+41 more)

### Community 49 - "fake-voice.ts"
Cohesion: 0.06
Nodes (10): beginSpeech(), BrowserTestSessionService, endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, installFakeBrowserVoice(), ScriptedUtterance (+2 more)

### Community 51 - "session-resources.ts"
Cohesion: 0.11
Nodes (40): claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills, count(), enrichClaudeSkills() (+32 more)

### Community 52 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (53): addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, copyTask() (+45 more)

### Community 53 - "manager-agent.test.ts"
Cohesion: 0.06
Nodes (21): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+13 more)

### Community 54 - "SessionService"
Cohesion: 0.07
Nodes (7): closeReason(), closeVoiceSocket(), nodeVoiceCapabilities(), registerNodeRoutes(), obstructUploads(), SessionService, RemovedQueuedPrompt

### Community 55 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (14): startAgentAfterClear(), composer(), processAdapter, awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions() (+6 more)

### Community 56 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (45): DreamerHistoryEntry, assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES (+37 more)

### Community 57 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (28): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+20 more)

### Community 58 - "processes.ts"
Cohesion: 0.08
Nodes (27): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+19 more)

### Community 59 - "DreamerService"
Cohesion: 0.12
Nodes (10): boundedText(), digest(), DreamerService, DreamerUnavailableError, unavailableSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate, DreamerSnapshot (+2 more)

### Community 60 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 61 - "KnowledgeStore"
Cohesion: 0.08
Nodes (17): ClientPresence, SessionMuteCarrier, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions (+9 more)

### Community 62 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (16): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), QueuedOutput (+8 more)

### Community 63 - "ComposerActions.tsx"
Cohesion: 0.08
Nodes (20): families, modelFamily, repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions(), ContextRing() (+12 more)

### Community 64 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (18): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSource, keyOf() (+10 more)

### Community 65 - "OracleVoiceClient"
Cohesion: 0.14
Nodes (7): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, playbackClientError(), terminalCloseCode()

### Community 66 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 67 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 68 - "manager-proactive-coordinator.ts"
Cohesion: 0.10
Nodes (16): automaticTurns(), event(), batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions (+8 more)

### Community 69 - "session-knowledge-routes.test.ts"
Cohesion: 0.07
Nodes (19): ServerRole, SessionMetadataLookup, ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore, directories, disk (+11 more)

### Community 70 - "DreamerStore"
Cohesion: 0.14
Nodes (10): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, isMissing(), publicPlan() (+2 more)

### Community 71 - "VoicePlayback"
Cohesion: 0.10
Nodes (11): pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio(), validateGeneration() (+3 more)

### Community 72 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 73 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 74 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 75 - "server/skill-settings.ts"
Cohesion: 0.11
Nodes (24): instrument(), frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills(), Token, readBounded() (+16 more)

### Community 76 - "manager-context.ts"
Cohesion: 0.11
Nodes (32): DreamerProgressEntry, DreamerProgressSnapshot, DreamerProgressView, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines() (+24 more)

### Community 77 - "PushNotificationService"
Cohesion: 0.12
Nodes (9): start(), OracleEventSource, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema (+1 more)

### Community 78 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 79 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, eventId(), hasExactKeys(), isDisposition(), isEventKind() (+29 more)

### Community 81 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 82 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 83 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 84 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (30): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES (+22 more)

### Community 85 - "oracle-voice-routes.ts"
Cohesion: 0.11
Nodes (33): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+25 more)

### Community 86 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+26 more)

### Community 87 - "oracle-voice-routes.test.ts"
Cohesion: 0.08
Nodes (17): ActiveBackendSession, exactArrayBuffer(), rawDataBuffer(), receiveNodeVoiceMessage(), ObservedLocalVoiceBackend, openApps, openSockets, RouteManager (+9 more)

### Community 88 - "ManagerStructuredMemoryStore"
Cohesion: 0.16
Nodes (9): digest(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput (+1 more)

### Community 89 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (28): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+20 more)

### Community 90 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 91 - "DialogFrame.tsx"
Cohesion: 0.11
Nodes (22): changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame(), filterSentMessages() (+14 more)

### Community 92 - "ui-scenes.ts"
Cohesion: 0.11
Nodes (21): { values }, fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns, fixtureSchedules, ComposerPart, lockedScreenshot, message() (+13 more)

### Community 93 - "setupWorkspaceFixture"
Cohesion: 0.08
Nodes (14): desktop, devices, long, open(), phone, veryLong, devices, markedState() (+6 more)

### Community 94 - "ManagedSession"
Cohesion: 0.13
Nodes (6): RemoteSessionListing, ManagerHub, SessionLaunch, SessionLauncherOptions, SessionPromptTarget, ManagedSession

### Community 95 - "registerSessionKnowledgeRoutes"
Cohesion: 0.11
Nodes (22): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+14 more)

### Community 96 - "shared/settings-profile.ts"
Cohesion: 0.12
Nodes (28): SettingsProfileState, AccentSetting, appearanceSettings, isRecord(), isSettingsDeviceId(), isSettingsProfileKey(), isSettingsRevision(), newSessionBackendSettings (+20 more)

### Community 97 - "SessionKnowledgeBinding"
Cohesion: 0.11
Nodes (19): WorkspaceFixtureState, SessionKnowledgeEvents, SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), KnowledgePosition (+11 more)

### Community 98 - "SettingsProfileSnapshot"
Cohesion: 0.12
Nodes (14): applySettingsChanges(), applySettingsImport(), SettingsProfileSnapshot, SettingsRequestError, sizeChecked(), validateSettingsImport(), seedHubSettings(), hub() (+6 more)

### Community 99 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (22): parseTerminalUpdateNotice(), bracketedTabPane, clearFixture(), deliveryFixture(), desktopInstallPane, directories, downloadedUpdateFooter, execFileAsync (+14 more)

### Community 100 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (26): advance(), Connection, connections, content(), FrameMeasurement, lastHeading(), message(), open() (+18 more)

### Community 101 - "session-directory.ts"
Cohesion: 0.18
Nodes (21): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+13 more)

### Community 102 - "manager-structured-memory-search.ts"
Cohesion: 0.13
Nodes (23): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+15 more)

### Community 103 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 104 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (21): SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+13 more)

### Community 105 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 106 - "use-markdown-document.ts"
Cohesion: 0.15
Nodes (21): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+13 more)

### Community 107 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 108 - "VoiceCapture"
Cohesion: 0.21
Nodes (3): captureFailure(), harness(), VoiceCapture

### Community 109 - "claude-agent-service.ts"
Cohesion: 0.09
Nodes (13): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+5 more)

### Community 110 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 111 - "ManagerProactiveInbox"
Cohesion: 0.19
Nodes (6): ManagerProactiveInbox, ManagerProactiveInboxCapacityError, ManagerProactiveInboxPersistenceError, nowIso(), publicEvent(), openInbox()

### Community 112 - "oracle-status.test.ts"
Cohesion: 0.14
Nodes (18): oracleHostStatusFixture(), fixtureComputers, fixtureHostProcesses, fixtureHostSnapshot, bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number() (+10 more)

### Community 113 - "SessionSkillsSnapshot"
Cohesion: 0.13
Nodes (13): ActiveClaudeQuery, ClaudeResources, releases, session, snapshot, readServiceResources(), readSessionSkills(), ResourceReads (+5 more)

### Community 114 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 115 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (17): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+9 more)

### Community 116 - "client.ts"
Cohesion: 0.11
Nodes (15): ORACLE_VOICE_CONNECTION_TIMEOUT_MS, closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, OracleVoiceSocket (+7 more)

### Community 117 - "HostMonitorView.test.tsx"
Cohesion: 0.17
Nodes (18): HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics, snapshot, Socket, bytes() (+10 more)

### Community 118 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 119 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 120 - "parsers.ts"
Cohesion: 0.18
Nodes (18): counter(), counterDelta(), CpuCounters, DeviceByteCounters, DeviceCounters, deviceRates(), isWholeDisk(), MemoryReading (+10 more)

### Community 121 - "workspace-browser.ts"
Cohesion: 0.21
Nodes (17): validateKnowledgeRoot(), assertOpenedFilePath(), fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath() (+9 more)

### Community 122 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 123 - "capture.ts"
Cohesion: 0.13
Nodes (15): BufferedFrame, defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, validateIdentity(), VoiceCaptureError, VoiceCaptureErrorCode (+7 more)

### Community 124 - "capture-workspace.ts"
Cohesion: 0.22
Nodes (19): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+11 more)

### Community 125 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 126 - "session-resource-routes.test.ts"
Cohesion: 0.12
Nodes (10): node(), apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService (+2 more)

### Community 127 - "AgentProvider"
Cohesion: 0.14
Nodes (13): closable(), provider(), AgentProvider, SessionExecutionMode, TerminalSendPolicyInput, TerminalSendRequestOptions, booleans, combinations (+5 more)

### Community 128 - "ScheduleWorktreeService"
Cohesion: 0.27
Nodes (5): execute, failure(), missing(), ScheduleWorktreeService, ScheduleWorktreeRecord

### Community 129 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 130 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 131 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 132 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 133 - "HostTelemetrySampler"
Cohesion: 0.19
Nodes (4): cpuUtilization(), parseMeminfo(), HostTelemetrySampler, HostSample

### Community 134 - "reader.ts"
Cohesion: 0.17
Nodes (14): detectWsl(), parseDataMount(), createLinuxHostTelemetryReader(), errorCode(), HostTelemetryProcFile, hostTelemetryProcFiles, HostTelemetryReaderOptions, HostTelemetryReading (+6 more)

### Community 135 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 136 - "projection-test-helpers.ts"
Cohesion: 0.18
Nodes (14): sessionLog(), BackgroundTaskEventOptions, MAX_BACKGROUND_TASKS, MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH, lifecycleEvent(), subagentShell(), syntheticLog() (+6 more)

### Community 137 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 138 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 139 - "session-patches.test.ts"
Cohesion: 0.20
Nodes (6): Client, Browser, seedOffset, HubResyncRequest, HubWireEvent, SessionPatchReceiver

### Community 140 - "pipeline.ts"
Cohesion: 0.19
Nodes (17): holdingRenderer(), partlyHeldRenderer(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform(), drawSteps(), growable (+9 more)

### Community 141 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 142 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 143 - "session-unread.pw.ts"
Cohesion: 0.13
Nodes (9): bounds(), devices, edgeState(), open(), screenshot(), unreadState(), BACKGROUND_SESSION_ID, fixtureBackgroundTasks (+1 more)

### Community 144 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 145 - "session-latency-benchmark.ts"
Cohesion: 0.21
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 146 - "closed-session-sweeper.ts"
Cohesion: 0.17
Nodes (5): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS

### Community 147 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 148 - "SettingsProfileStore"
Cohesion: 0.17
Nodes (8): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileStore, directories, store()

### Community 149 - "renderer.ts"
Cohesion: 0.19
Nodes (7): DocumentRenderEvent, createWorkerRenderer(), defaultDocumentRenderer(), RendererWorker, synchronousRenderer, FakeWorker, startWorkers()

### Community 150 - "OracleVoiceClientDependencies"
Cohesion: 0.16
Nodes (4): pageFor(), OracleVoiceClientDependencies, FakePlayback, VoicePlaybackOptions

### Community 151 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 152 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 153 - "BackgroundTask"
Cohesion: 0.22
Nodes (7): BackgroundTaskProjector, backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 154 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 155 - "SessionAdmissions"
Cohesion: 0.18
Nodes (3): Admission, ExclusiveAdmission, SessionAdmissions

### Community 156 - "VoiceCapabilities"
Cohesion: 0.23
Nodes (11): VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability, defaults (+3 more)

### Community 157 - "use-oracle-settings.ts"
Cohesion: 0.24
Nodes (12): getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+4 more)

### Community 158 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 159 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 160 - "background-task-stop.test.ts"
Cohesion: 0.25
Nodes (11): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started(), stopAcknowledgement() (+3 more)

### Community 161 - "sampler.ts"
Cohesion: 0.16
Nodes (13): HostTelemetryReader, HOST_TELEMETRY_ACTIVE_INTERVAL_MS, HOST_TELEMETRY_IDLE_INTERVAL_MS, HOST_TELEMETRY_SAMPLE_TIMEOUT_MS, HostTelemetrySamplerOptions, HostTelemetrySamplerStatus, MetricAccumulator, MinuteAccumulator (+5 more)

### Community 162 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 163 - "use-markdown-document.test.tsx"
Cohesion: 0.16
Nodes (6): drawnInParts(), RenderedDocumentTree, DocumentRenderer, DocumentRendererContext, components, show()

### Community 164 - "OracleVoiceClientOptions"
Cohesion: 0.23
Nodes (3): OracleVoiceClientOptions, FakeVoiceClient, transcript()

### Community 165 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 166 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 167 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 168 - "ChatMessage"
Cohesion: 0.19
Nodes (9): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, ChatMessage, PendingEchoOwner (+1 more)

### Community 169 - "isRecord"
Cohesion: 0.24
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 170 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 171 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 172 - "recently-closed.pw.ts"
Cohesion: 0.23
Nodes (9): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), open(), row() (+1 more)

### Community 173 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 174 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 176 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 178 - "settings-profile-routes.ts"
Cohesion: 0.25
Nodes (8): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 179 - "manager-proactive-inbox.test.ts"
Cohesion: 0.22
Nodes (6): fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 180 - "ManagerUploads"
Cohesion: 0.44
Nodes (4): failure(), ManagerUploads, managerFileType(), managerFileValidationError()

### Community 181 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 182 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 183 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.27
Nodes (7): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemorySearchResult, searchWorkspace(), submitSearch()

### Community 184 - "session-resource-transport.ts"
Cohesion: 0.31
Nodes (8): CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 185 - "session-unread-tracker.ts"
Cohesion: 0.29
Nodes (5): FinishedSession, SessionUnreadTracker, finished(), SessionTurnState, turnEnded()

### Community 186 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 187 - "pipeline.test.tsx"
Cohesion: 0.27
Nodes (7): components, drawn(), drawnPage(), fixtures, html(), today(), rehypeDocumentHeadings()

### Community 189 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 190 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 191 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 192 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 193 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 194 - "closed-sessions.ts"
Cohesion: 0.36
Nodes (6): closedSessionContext(), closedSessionExpiresAt(), excerpt(), isClosedSessionContext(), said(), ClosedSessionContext

### Community 195 - "capture.test.ts"
Cohesion: 0.22
Nodes (3): CaptureControl, VoiceCaptureDependencies, VoiceVad

### Community 197 - "fixture-frontend.ts"
Cohesion: 0.32
Nodes (4): captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend()

### Community 198 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 199 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 200 - ".runIfDueInternal"
Cohesion: 0.33
Nodes (5): planWithFingerprints(), publicSnapshot(), safeRunError(), DreamerRunClaim, dreamerRunKey()

### Community 202 - "SessionStatus"
Cohesion: 0.29
Nodes (7): Seen, ManagerProactiveInboxObservation, PersistedCursor, NotificationCursor, Row, SdkRestartRecovery, SessionStatus

### Community 203 - "ManagerProactiveInboxValidationError"
Cohesion: 0.38
Nodes (5): emptyState(), ManagerProactiveInboxValidationError, requireId(), validateLimit(), validateOptions()

### Community 204 - "manager-uploads.ts"
Cohesion: 0.43
Nodes (4): referenceId, storedFile, safeUploadName(), writePrivateUpload()

### Community 205 - "SessionRetentionPatch"
Cohesion: 0.43
Nodes (3): SessionRetention, SessionRetentionPatch, SessionRetentionSettings()

### Community 206 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 209 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 210 - "ManagerProactiveInboxError"
Cohesion: 0.33
Nodes (3): ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError

### Community 211 - "manager-files.ts"
Cohesion: 0.33
Nodes (5): codeExtensions, fileTypes, MAX_MANAGER_FILE_BYTES, MAX_MANAGER_TEXT_BYTES, textTypes

### Community 212 - "use-foreground-handoff.ts"
Cohesion: 0.47
Nodes (3): foregroundHandoffTimeoutMs, Handoff, useForegroundHandoff()

### Community 213 - "worker-handler.ts"
Cohesion: 0.47
Nodes (4): render, scope, handleRenderRequest(), RenderRequest

### Community 214 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 215 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1429 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1424 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2395 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `ScheduleWorktreeService`, `contracts.ts`, `SessionStore`, `HostTelemetrySampler`, `AgentService`, `ComputerSummary`, `SchedulerStore`, `SessionDetail`, `react`, `SettingsProfileStore`, `oracle-voice-benchmark.ts`, `oracle-voice-soak.ts`, `host-telemetry.ts`, `registerHubRoutes`, `ManagerMessage`, `dreamer-service.ts`, `ManagerAgent`, `manager-agent.ts`, `transcription-service.ts`, `ManagerStore`, `oracle-voice-worker.ts`, `ProviderSessionService`, `manager-agent.test.ts`, `SessionService`, `session-knowledge-store.ts`, `DreamerService`, `KnowledgeStore`, `dreamer-routes.ts`, `manager-proactive-coordinator.ts`, `session-knowledge-routes.test.ts`, `server/skill-settings.ts`, `PushNotificationService`, `SessionOrderStore`, `ManagerStructuredMemoryStore`, `cli-canary.ts`, `ManagerProactiveInbox`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `manager-agent.ts`, `TerminalSessionController`, `agent-service.test.ts`, `claude-agent-service.ts`, `.drainNextTerminalPrompt`, `SessionSkillsSnapshot`, `ProviderSessionService`, `session-resources.ts`, `registerHubRoutes`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `agent-service.ts`, `TerminalSessionController`, `.drainNextTerminalPrompt`, `claude-agent-service.ts`, `.readAfterWrites`, `SessionFileUpload`, `SessionSkillsSnapshot`, `session-resources.ts`, `session-resource-routes.test.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1429 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `contracts.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.01857194374323837 - nodes in this community are weakly interconnected._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.02498962224989622 - nodes in this community are weakly interconnected._
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
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-refresh-attachment-chromium-linux.png`
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
