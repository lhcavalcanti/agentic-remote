# Agentic Remote - Graphify code map

Snapshot: `6a733153d27ee16f21e828ed0934e81e827a107ac0aec2a42d8347f23eb54373`

Source checkout: `f8a321f75c4441ed10c1fe80aac0174e1c82f626`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 652 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 652 files · ~1,159,615 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9150 nodes · 26330 edges · 266 communities (222 shown, 26 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1315 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionStore
- AppWorkspace
- SessionDetail
- oracle-voice-soak.ts
- oracle-voice-worker.ts
- terminal-session.ts
- App.test.tsx
- App.tsx
- ManagerMessage
- computer-manager.ts
- OracleVoiceCoordinator
- ManagedSession
- contracts.ts
- claude-agent-service.ts
- agent-service.ts
- pipeline.ts
- manager-agent.ts
- composer-state.ts
- app.ts
- shared/settings-profile.ts
- agentic-remote-promotion-monitor
- ManagerStore
- schedule-launcher.test.ts
- CopilotSessionLike
- sampler.ts
- terminal-session.test.ts
- ManagerAgent
- host-telemetry.ts
- oracle-task-store.ts
- RemoteNodeClient
- tmux-errors.integration.test.ts
- react
- oracle-voice-integration.test.ts
- multi-node.test.ts
- transcription-service.ts
- session-presentation.ts
- CopilotClientLike
- createManagerTools
- workspace-fixtures.ts
- setupWorkspaceFixture
- oracle-voice-benchmark.ts
- sections.tsx
- session-reply-durability.test.ts
- dreamer-service.ts
- oracle-voice-routes.ts
- controls.tsx
- background-task-adapter.ts
- manager-structured-memory-validation.ts
- tmux-test-helpers.ts
- ProviderSessionService
- TmuxTerminalSessionController
- src/settings-profile.ts
- session-knowledge-store.ts
- DreamerService
- ui-scenes.ts
- AgentProvider
- dreamer-store.ts
- FakeVoiceEngine
- oracle-voice.ts
- OracleDreamer.tsx
- SessionService
- agentic-remote
- active-sessions.ts
- dreamer-progress.ts
- ManagerEvent
- oracle-voice-session.ts
- transcript-test-helpers.ts
- schedules.ts
- markdown-navigation.ts
- SchedulerStore
- ManagerAssistant.tsx
- processes.ts
- ResidentVoiceWorker
- server/skill-settings.ts
- OracleVoiceClient
- agentic-remote-gate
- TerminalSessionController
- bundle
- DreamerStore
- VoicePlayback
- schedule-recurrence.ts
- ChildVoiceEngine
- shell.ts
- lib.rs
- hub-routes.ts
- client.test.ts
- dependencies
- terminal-startup-queue.test.ts
- VoiceCapture
- agentic-remote-promotion-setup
- SessionOrderStore
- ScheduleForm.tsx
- devDependencies
- config.rs
- KnowledgeStore
- response-compression.test.ts
- knowledge-tree.ts
- oracle-voice-config.ts
- PushNotificationService
- oracle-voice-security.test.ts
- capture.ts
- manager-context.ts
- manager-proactive-inbox.ts
- manager-agent.test.ts
- BackgroundTasksDialog.tsx
- client.ts
- remote-voice-client.ts
- startup-phases.test.ts
- manager-structured-memory.ts
- SchedulerDispatcher
- ChatMessage
- closed-sessions.ts
- scheduler-dispatcher.ts
- oracle-voice-segments.ts
- session-patch-browser.ts
- recovery-resend-durability.test.ts
- registerSessionKnowledgeRoutes
- ManagerAssistant.test.tsx
- ManagerAttachment
- capture-workspace.ts
- session-directory.ts
- pwa.ts
- cli-canary.ts
- manager-structured-memory-search.ts
- notification-center-service.ts
- scripts
- use-session-knowledge-root.ts
- ManagerStructuredMemoryStore
- notification-classifier.ts
- push-notification-service.ts
- ActivityRow.test.tsx
- PromptCards.tsx
- agent-service.test.ts
- HostMonitorView.test.tsx
- oracle-voice-coordinator.test.ts
- compilerOptions
- .takeInTranscript
- agent-service-event-projection.test.ts
- ActivityDetails.tsx
- InstrumentedRealEngine
- notification-store.ts
- isTerminalComposerFooter
- RecentlyClosed.tsx
- compilerOptions
- full-gate.test.ts
- NotificationStore
- schedule-notification-service.test.ts
- session-store-providers.test.ts
- compilerOptions
- .toolHost
- ManagerProactiveInbox
- OnlineRecognizer
- workspace-browser.ts
- MessageTime.tsx
- compilerOptions
- ScheduleRun
- compilerOptions
- ManagerMemory
- .correct
- dreamer-schedule.ts
- oracle-status.test.ts
- promotion-monitor.test.ts
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- session-latency-benchmark.ts
- BackgroundTaskSnapshot
- alerts.test.ts
- ScheduleWorktreeService
- server/session-patches.ts
- terminal-form-deadline.test.ts
- RuntimeStatus.tsx
- composer/types.ts
- ComposerActions.tsx
- package.json
- oracle-voice-assets.test.ts
- SessionAdmissions
- fake-vad.ts
- desktop.json
- background-task-stop.test.ts
- NotificationCenterService
- normalizeKnowledgeRelativePath
- theme-contrast.test.ts
- OracleVoiceClientOptions
- .oxlintrc.json
- settings-local.json
- .observe
- manager-proactive-inbox.test.ts
- session-scope.ts
- Pcm16Resampler
- schedule-proposal-presentation.ts
- document-render.pw.ts
- use-oracle-attachments.ts
- DialogFrame.tsx
- html-preview.ts
- sign-in-expired.pw.ts
- DeferredSession
- command-catalog-cache.test.ts
- isRecord
- server/side-question.ts
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- notification-center.integration.test.ts
- bridge.rs
- ComputersDialog.tsx
- transcribeAudio
- vite.config.ts
- dreamer-routes.ts
- history-projection.test.ts
- logs-cli.test.ts
- ManagerProactiveInboxValidationError
- promotion-setup-execution.test.ts
- SkillsSettings.tsx
- sent-message.ts
- doctor-cli.test.ts
- release-publication.test.ts
- OracleVoicePlayback
- composer-layout.test.ts
- HostTelemetryClock
- settings.ts
- use-foreground-handoff.ts
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- HubEventSource
- push-routes.ts
- .discoverTerminalSessions
- terminal-send-uncertainty.test.ts
- MermaidDiagram.tsx
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
1. `AppWorkspace()` - 347 edges
2. `SessionDetail` - 325 edges
3. `AgentService` - 316 edges
4. `SessionStore` - 217 edges
5. `ManagedSession` - 179 edges
6. `buildApp()` - 141 edges
7. `ClaudeAgentService` - 132 edges
8. `registerHubRoutes()` - 106 edges
9. `ComputerManager` - 105 edges
10. `ManagerAgent` - 101 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `instrument()` --indirect_call--> `document()`  [INFERRED]
  e2e/session-patch-browser.ts → server/skill-settings-jsonc.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (266 total, 26 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (16): agentMode(), AgentService, isRuntimeReasoningEffort(), isTerminalNotReadyRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, sessionInUseConflictMessage(), sessionInUseQueueMessage() (+8 more)

### Community 1 - "SessionStore"
Cohesion: 0.02
Nodes (94): fixture(), restart(), fixture(), connect(), createStore(), deferred(), disk, enqueue() (+86 more)

### Community 2 - "AppWorkspace"
Cohesion: 0.03
Nodes (144): askSession(), cancelBackgroundTask(), clearConversation(), closeSession(), configureRetention(), deleteKnowledgeRoot(), listClosedSessions(), listCommands() (+136 more)

### Community 3 - "SessionDetail"
Cohesion: 0.04
Nodes (28): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+20 more)

### Community 4 - "oracle-voice-soak.ts"
Cohesion: 0.03
Nodes (50): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+42 more)

### Community 5 - "oracle-voice-worker.ts"
Cohesion: 0.03
Nodes (75): clockTicksPerSecond(), execFileAsync, GenerationMetrics, RealMetrics, WorkerProcessSample, apps, directories, voiceBackend() (+67 more)

### Community 6 - "terminal-session.ts"
Cohesion: 0.05
Nodes (104): terminalComposerUnreadable(), activeBottomFrame(), afterExit(), backgroundShellsAllow(), busyRowStatus(), captureBeforeDeadline(), captureForReplacement(), capturePane() (+96 more)

### Community 7 - "App.test.tsx"
Cohesion: 0.03
Nodes (88): addKnowledgeRoot(), bootstrapSessionOrder(), cancelSession(), checkHubSignIn(), createOracleVoiceTicket(), dispatchQueuedPrompt(), fetchSessionOrder(), fetchSettingsProfile() (+80 more)

### Community 8 - "App.tsx"
Cohesion: 0.03
Nodes (84): hasActiveBackgroundTasks(), hasForegroundTurn(), isManagerEvent(), renameSession(), ActivityRowStates, sidebarTouchStart(), bindingMatches(), clearStored() (+76 more)

### Community 9 - "ManagerMessage"
Cohesion: 0.04
Nodes (29): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice() (+21 more)

### Community 10 - "computer-manager.ts"
Cohesion: 0.04
Nodes (74): activityDetailsUnavailable(), activityNotInLog(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), ClaudeAgentServiceEvents, ClaudeSdk, RemoteSessionListing (+66 more)

### Community 11 - "OracleVoiceCoordinator"
Cohesion: 0.05
Nodes (28): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+20 more)

### Community 12 - "ManagedSession"
Cohesion: 0.07
Nodes (20): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, normalizeNodeUrl(), FakeManager (+12 more)

### Community 13 - "contracts.ts"
Cohesion: 0.04
Nodes (76): ActivityDetailArguments, ActivityDetailText, AddKnowledgeRootInput, AudioTranscription, BackgroundTaskAttachmentMode, BackgroundTaskExecutionMode, CreateSessionInput, DispatchQueuedPromptInput (+68 more)

### Community 14 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (66): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+58 more)

### Community 15 - "agent-service.ts"
Cohesion: 0.04
Nodes (86): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+78 more)

### Community 16 - "pipeline.ts"
Cohesion: 0.05
Nodes (60): partlyHeldRenderer(), documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing (+52 more)

### Community 17 - "manager-agent.ts"
Cohesion: 0.04
Nodes (68): automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkSessionConfig, messagePriority(), Rung (+60 more)

### Community 18 - "composer-state.ts"
Cohesion: 0.06
Nodes (81): updateQueuedPrompt(), appendComposerForKey(), askToStopBackgroundTask(), attachmentsInContent(), cancelQueuedPromptEdit(), composerBeforeInput(), composerChanged(), composerCut() (+73 more)

### Community 19 - "app.ts"
Cohesion: 0.04
Nodes (58): buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), directories, runtimes (+50 more)

### Community 20 - "shared/settings-profile.ts"
Cohesion: 0.05
Nodes (57): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), directories, fakeManager() (+49 more)

### Community 21 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 22 - "ManagerStore"
Cohesion: 0.05
Nodes (21): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+13 more)

### Community 23 - "schedule-launcher.test.ts"
Cohesion: 0.04
Nodes (48): TerminalFormContinuation, RemoteNodeRedirectError, RemoteNodeRequestError, LaunchPrimitives, recordScheduleProvenance(), ScheduleLauncherHost, ScheduleProvenance, scheduleSessionTitle() (+40 more)

### Community 24 - "CopilotSessionLike"
Cohesion: 0.04
Nodes (37): CopilotSessionLike, nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery() (+29 more)

### Community 25 - "sampler.ts"
Cohesion: 0.06
Nodes (51): prefixes, session, trusted, untrusted, counter(), counterDelta(), CpuCounters, cpuUtilization() (+43 more)

### Community 26 - "terminal-session.test.ts"
Cohesion: 0.04
Nodes (64): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+56 more)

### Community 27 - "ManagerAgent"
Cohesion: 0.08
Nodes (9): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, uniqueManagerSessionRefs() (+1 more)

### Community 28 - "host-telemetry.ts"
Cohesion: 0.05
Nodes (45): BuildAppOptions, ProcessScanContext, HostRequest, registerHostTelemetryRoutes(), HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError(), HostTelemetryService (+37 more)

### Community 29 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (49): apps, directories, setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId() (+41 more)

### Community 30 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (18): RemoteResync, RemoteSessionRead, subscribeRemoteHost(), connect(), headerSafe(), RemoteNodeClient, requestBytes(), client() (+10 more)

### Community 31 - "tmux-errors.integration.test.ts"
Cohesion: 0.04
Nodes (42): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+34 more)

### Community 32 - "react"
Cohesion: 0.08
Nodes (45): react, SessionProvenance, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable() (+37 more)

### Community 33 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+24 more)

### Community 34 - "multi-node.test.ts"
Cohesion: 0.04
Nodes (12): ClaudeFakeSessionService, directories, FakeSessionService, routingFixture(), session(), temporaryDirectory(), voiceControlQueues, voiceControlWaiters (+4 more)

### Community 35 - "transcription-service.ts"
Cohesion: 0.06
Nodes (34): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionMultipartOptions (+26 more)

### Community 36 - "session-presentation.ts"
Cohesion: 0.06
Nodes (54): SessionInterruptionCause, KnowledgeRootSelector(), root, ProgressTime(), HiddenSessions, noHiddenSessions, noUnreadSessions, SessionFilter (+46 more)

### Community 37 - "CopilotClientLike"
Cohesion: 0.04
Nodes (43): complete(), event(), sessionWithLog(), start(), CopilotClientLike, holdProbe(), fixtures, gate() (+35 more)

### Community 38 - "createManagerTools"
Cohesion: 0.06
Nodes (22): busyReason(), createManagerTools(), closeCapReached(), define(), proactiveSessionAllowed(), requireComputer(), resolveSession(), scheduleTools() (+14 more)

### Community 39 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (44): frame(), geometry, output, scratch, screenshot(), { values }, accents, Measurement (+36 more)

### Community 40 - "setupWorkspaceFixture"
Cohesion: 0.05
Nodes (33): desktop, devices, long, open(), phone, veryLong, bounds(), closedEarlier (+25 more)

### Community 41 - "oracle-voice-benchmark.ts"
Cohesion: 0.06
Nodes (45): execFileAsync, RealVoiceState, benchmarkFixture(), benchmarkGroup(), BenchmarkMetric, BenchmarkProfile, buildConfig(), CliOptions (+37 more)

### Community 42 - "sections.tsx"
Cohesion: 0.07
Nodes (43): AppVersion, HubHealth, AppearanceSetting, NewSessionBackendSetting, getHubHealth(), updateManagerSettings(), ShortcutBinding, ShortcutId (+35 more)

### Community 43 - "session-reply-durability.test.ts"
Cohesion: 0.04
Nodes (44): root, script, deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases (+36 more)

### Community 44 - "dreamer-service.ts"
Cohesion: 0.07
Nodes (41): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+33 more)

### Community 45 - "oracle-voice-routes.ts"
Cohesion: 0.07
Nodes (47): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+39 more)

### Community 46 - "controls.tsx"
Cohesion: 0.07
Nodes (52): RuntimeModelOption, DEFAULT_SESSION_PROVIDER, activateSession(), configureRuntime(), createSession(), getRuntimeOptions(), listDirectories(), listHistory() (+44 more)

### Community 47 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (57): addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo (+49 more)

### Community 48 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 49 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (48): foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity(), SocketPlace, UnixSocket (+40 more)

### Community 50 - "ProviderSessionService"
Cohesion: 0.06
Nodes (3): updateComputerForLaunchIdentity(), owns(), ProviderSessionService

### Community 51 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (15): awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, FormReplyDeadlineError, listTmuxSessions(), processAncestors(), processCommand() (+7 more)

### Community 52 - "src/settings-profile.ts"
Cohesion: 0.07
Nodes (29): NewSessionRuntime, sameSettingValue(), SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, SettingsUpdateResult (+21 more)

### Community 53 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+22 more)

### Community 54 - "DreamerService"
Cohesion: 0.11
Nodes (12): projectDreamerMemory(), boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), safeRunError() (+4 more)

### Community 55 - "ui-scenes.ts"
Cohesion: 0.07
Nodes (34): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+26 more)

### Community 56 - "AgentProvider"
Cohesion: 0.05
Nodes (35): ComputerManagerEvents, Seen, PersistedCursor, NotificationCursor, closable(), provider(), Row, apps (+27 more)

### Community 57 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (45): DreamerHistoryEntry, assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES (+37 more)

### Community 58 - "FakeVoiceEngine"
Cohesion: 0.06
Nodes (23): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine, playbackSequence() (+15 more)

### Community 59 - "oracle-voice.ts"
Cohesion: 0.08
Nodes (41): exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), capabilities, closeServers, exactArrayBuffer(), sockets (+33 more)

### Community 60 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (43): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+35 more)

### Community 61 - "SessionService"
Cohesion: 0.07
Nodes (5): closeReason(), closeVoiceSocket(), nodeVoiceCapabilities(), registerNodeRoutes(), SessionService

### Community 62 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 63 - "active-sessions.ts"
Cohesion: 0.08
Nodes (41): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+33 more)

### Community 64 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSource, keyOf() (+11 more)

### Community 65 - "ManagerEvent"
Cohesion: 0.08
Nodes (14): ManagerEventSource, batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, ProactiveManager (+6 more)

### Community 66 - "oracle-voice-session.ts"
Cohesion: 0.12
Nodes (16): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), createVoiceBackendSession(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled() (+8 more)

### Community 67 - "transcript-test-helpers.ts"
Cohesion: 0.09
Nodes (27): backgroundShellsEvidence(), contextChangedInEvents(), createPendingUserInputTracker(), createStatusTracker(), isEmptyResponseNotice(), isLiveTask(), pendingUserInputFromEvents(), PendingUserInputTracker (+19 more)

### Community 68 - "schedules.ts"
Cohesion: 0.07
Nodes (39): proposalInput, State, stateSchema, timestamp, action, create, existing, metadata (+31 more)

### Community 69 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (40): executeCommand(), listWorkspace(), searchWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+32 more)

### Community 70 - "SchedulerStore"
Cohesion: 0.13
Nodes (7): fixture(), deferUnboundWorktree(), failure(), SchedulerStore, ScheduleProposal, Schedule, ScheduleRunStatus

### Community 71 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (41): editQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent() (+33 more)

### Community 72 - "processes.ts"
Cohesion: 0.09
Nodes (26): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+18 more)

### Community 73 - "ResidentVoiceWorker"
Cohesion: 0.11
Nodes (11): combinedTranscript(), errorMessage(), float32ToPcm16(), matchesCancelled(), pcm16ToFloat32(), readBoundedText(), ResidentVoiceWorker, sherpaProfile() (+3 more)

### Community 74 - "server/skill-settings.ts"
Cohesion: 0.10
Nodes (28): builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills(), Token (+20 more)

### Community 75 - "OracleVoiceClient"
Cohesion: 0.14
Nodes (8): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError(), terminalCloseCode()

### Community 76 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 77 - "TerminalSessionController"
Cohesion: 0.08
Nodes (6): isUncertainDelivery(), persistedFormAnswer(), TerminalFormReplyError, TerminalSessionController, PendingUserInput, deliveryUncertaintyFromError()

### Community 78 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 79 - "DreamerStore"
Cohesion: 0.13
Nodes (11): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, emptyState(), isMissing() (+3 more)

### Community 80 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 81 - "schedule-recurrence.ts"
Cohesion: 0.10
Nodes (38): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+30 more)

### Community 82 - "ChildVoiceEngine"
Cohesion: 0.11
Nodes (11): capabilityFromConfig(), ChildVoiceEngine, errorMessage(), isCancelledEvent(), matchesCancelled(), matchesSynthesis(), matchesUtterance(), minimalWorkerEnvironment() (+3 more)

### Community 83 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 84 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 85 - "hub-routes.ts"
Cohesion: 0.06
Nodes (39): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+31 more)

### Community 86 - "client.test.ts"
Cohesion: 0.07
Nodes (11): HUB_SIGN_IN_EXPIRED_MESSAGE, OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 87 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 88 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (29): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+21 more)

### Community 89 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 90 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 91 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 92 - "ScheduleForm.tsx"
Cohesion: 0.12
Nodes (29): scheduleProposalSummary(), CLAUDE_SCHEDULE_UNAVAILABLE_REASON, scheduleProviderUnavailableReason(), ScheduleTarget, getProviderRuntimeOptions(), FolderPicker(), browse(), editableSchedule() (+21 more)

### Community 93 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 94 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 95 - "KnowledgeStore"
Cohesion: 0.11
Nodes (15): WorkspaceFixtureState, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState (+7 more)

### Community 96 - "response-compression.test.ts"
Cohesion: 0.07
Nodes (20): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), apps (+12 more)

### Community 97 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+26 more)

### Community 98 - "oracle-voice-config.ts"
Cohesion: 0.10
Nodes (25): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger(), canonicalPath() (+17 more)

### Community 99 - "PushNotificationService"
Cohesion: 0.14
Nodes (6): start(), NotificationRecorder, PushNotificationService, scoped(), registerPushRoutes(), hub()

### Community 100 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (20): SocketMessage, apps, config, configFixture(), connect(), createManager(), Inbox, issueTicket() (+12 more)

### Community 101 - "capture.ts"
Cohesion: 0.07
Nodes (17): BufferedFrame, defaultAudioContext(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode (+9 more)

### Community 102 - "manager-context.ts"
Cohesion: 0.12
Nodes (28): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+20 more)

### Community 103 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (34): assertExactKeys(), cloneState(), DISPOSITIONS, hasExactKeys(), isDisposition(), isEventKind(), isId(), isOrigin() (+26 more)

### Community 104 - "manager-agent.test.ts"
Cohesion: 0.09
Nodes (16): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, Behavior, capturePrompt(), computers, fail(), FakeClient (+8 more)

### Community 105 - "BackgroundTasksDialog.tsx"
Cohesion: 0.12
Nodes (27): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+19 more)

### Community 106 - "client.ts"
Cohesion: 0.09
Nodes (24): ORACLE_VOICE_CONNECTION_TIMEOUT_MS, VoiceCapabilities, getOracleVoiceCapabilities(), closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture (+16 more)

### Community 107 - "remote-voice-client.ts"
Cohesion: 0.15
Nodes (14): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError() (+6 more)

### Community 108 - "startup-phases.test.ts"
Cohesion: 0.08
Nodes (18): phases, port, app(), directories, headers, launcher, createStartupPhases(), silentStartupPhases (+10 more)

### Community 109 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (28): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+20 more)

### Community 110 - "SchedulerDispatcher"
Cohesion: 0.19
Nodes (5): session(), SchedulerDispatcher, registerSchedulerRoutes(), holdsSlot(), isInFlight()

### Community 111 - "ChatMessage"
Cohesion: 0.10
Nodes (15): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, Client, Browser, seedOffset (+7 more)

### Community 112 - "closed-sessions.ts"
Cohesion: 0.09
Nodes (18): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, blockParents, CLOSED_SESSION_RETENTION_MS, closedCapitals(), closedSessionContext() (+10 more)

### Community 113 - "scheduler-dispatcher.ts"
Cohesion: 0.09
Nodes (19): enableSchedulerTools(), NoopScheduleLauncher, ScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS, SchedulerDispatcherOptions, ScheduleStopAcknowledgement (+11 more)

### Community 114 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 115 - "session-patch-browser.ts"
Cohesion: 0.11
Nodes (28): pageFor(), advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading() (+20 more)

### Community 116 - "recovery-resend-durability.test.ts"
Cohesion: 0.09
Nodes (16): directories, disk, fixture(), gate(), gates, httpBoundary(), initialize(), PublicSessionValue (+8 more)

### Community 117 - "registerSessionKnowledgeRoutes"
Cohesion: 0.11
Nodes (22): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+14 more)

### Community 118 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (18): cancelManager(), getManager(), removeQueuedManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+10 more)

### Community 119 - "ManagerAttachment"
Cohesion: 0.14
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 120 - "capture-workspace.ts"
Cohesion: 0.13
Nodes (24): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+16 more)

### Community 121 - "session-directory.ts"
Cohesion: 0.19
Nodes (20): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+12 more)

### Community 122 - "pwa.ts"
Cohesion: 0.13
Nodes (24): parseAppVersion(), getPushPublicKey(), savePushSubscription(), App(), applyPwaUpdate(), activatePwaUpdate(), applicationServerKey(), checkForPwaUpdate() (+16 more)

### Community 123 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 124 - "manager-structured-memory-search.ts"
Cohesion: 0.13
Nodes (23): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+15 more)

### Community 125 - "notification-center-service.ts"
Cohesion: 0.15
Nodes (19): defaultNotificationKindPreference, NotificationKind, NotificationKindPreference, NotificationKindPreferences, NotificationRecord, NotificationsChanged, NotificationSeverity, FeatureEvent (+11 more)

### Community 126 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 127 - "use-session-knowledge-root.ts"
Cohesion: 0.12
Nodes (16): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base (+8 more)

### Community 128 - "ManagerStructuredMemoryStore"
Cohesion: 0.15
Nodes (8): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open()

### Community 129 - "notification-classifier.ts"
Cohesion: 0.17
Nodes (19): attentionClosed(), attentionSeed(), classifyHostNotification(), classifyHubNotification(), classifyOracleNotification(), HOST_ALERT_MEMORY_DURATION_MS, notificationIdentity(), record() (+11 more)

### Community 130 - "push-notification-service.ts"
Cohesion: 0.12
Nodes (19): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+11 more)

### Community 131 - "ActivityRow.test.tsx"
Cohesion: 0.15
Nodes (18): toolCallIdFromActivityId(), ActivityStatus, activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), compactActivityText() (+10 more)

### Community 132 - "PromptCards.tsx"
Cohesion: 0.13
Nodes (21): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+13 more)

### Community 133 - "agent-service.test.ts"
Cohesion: 0.14
Nodes (14): terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+6 more)

### Community 134 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 135 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.11
Nodes (12): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+4 more)

### Community 136 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 137 - ".takeInTranscript"
Cohesion: 0.17
Nodes (5): foregroundCompletedSince(), foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), messagesFromHistory()

### Community 138 - "agent-service-event-projection.test.ts"
Cohesion: 0.12
Nodes (19): at(), directories, finish(), launch(), projected(), services, sessionLog(), syncSessionTranscript() (+11 more)

### Community 139 - "ActivityDetails.tsx"
Cohesion: 0.17
Nodes (19): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, TOOL_CALL_ID_PATTERN, activityDetailFailure, detailKey(), formatBytes(), keep(), kept, keptActivityDetail() (+11 more)

### Community 140 - "InstrumentedRealEngine"
Cohesion: 0.14
Nodes (6): BrowserTestSessionService, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), registerControlRoutes(), startServer()

### Community 141 - "notification-store.ts"
Cohesion: 0.11
Nodes (18): NotificationCursors, booleanQuery, filters, params, cursorSchema, durableState(), identity, kind (+10 more)

### Community 142 - "isTerminalComposerFooter"
Cohesion: 0.13
Nodes (20): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+12 more)

### Community 143 - "RecentlyClosed.tsx"
Cohesion: 0.13
Nodes (17): closedSessionExpiresAt(), CloseSessionDialog(), noPrompts, RecentlyClosedCard(), act(), RecentlyClosedDialog(), relative(), relativeTime (+9 more)

### Community 144 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 145 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 146 - "NotificationStore"
Cohesion: 0.20
Nodes (5): emptyState(), matchesNotification(), NotificationStore, setup(), NotificationFilter

### Community 147 - "schedule-notification-service.test.ts"
Cohesion: 0.18
Nodes (7): classifyScheduleNotification(), ScheduleNotificationService, input(), now, run(), ScheduleRunNotification, SchedulerChanged

### Community 148 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 149 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 151 - "ManagerProactiveInbox"
Cohesion: 0.22
Nodes (4): ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, nowIso(), openInbox()

### Community 152 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 153 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (16): assertOpenedFilePath(), fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath() (+8 more)

### Community 154 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 155 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 156 - "ScheduleRun"
Cohesion: 0.30
Nodes (6): WorkspaceFixtureOptions, provenance(), SessionScheduleLauncher, ScheduleLaunchRefusedError, ScheduleReconciliation, ScheduleRun

### Community 157 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 158 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 159 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 160 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 161 - "oracle-status.test.ts"
Cohesion: 0.19
Nodes (14): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+6 more)

### Community 162 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 163 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 164 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 165 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 166 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 167 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 168 - "BackgroundTaskSnapshot"
Cohesion: 0.20
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 169 - "alerts.test.ts"
Cohesion: 0.15
Nodes (8): HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, computer, observe(), snapshot(), start, sustained(), HOST_ALERT_COOLDOWN_MS

### Community 170 - "ScheduleWorktreeService"
Cohesion: 0.35
Nodes (5): execute, failure(), missing(), ScheduleWorktreeService, ScheduleWorktreeRecord

### Community 171 - "server/session-patches.ts"
Cohesion: 0.21
Nodes (8): diffMessages(), Publication, sameField(), sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 172 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 173 - "RuntimeStatus.tsx"
Cohesion: 0.27
Nodes (9): families, modelFamily, shortModelName(), repositoryModels, RuntimeStatus(), session, glyphs, ModelFamilyIcon() (+1 more)

### Community 174 - "composer/types.ts"
Cohesion: 0.23
Nodes (6): AttachmentStrip(), Composer(), QueuedPromptList(), SlashCommandMenu(), ComposerAttachment, ComposerProps

### Community 175 - "ComposerActions.tsx"
Cohesion: 0.20
Nodes (6): composerSteeringUnavailableReason(), ComposerActions(), ContextRing(), SendControl(), TriggerProps, SessionActions()

### Community 176 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 177 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 178 - "SessionAdmissions"
Cohesion: 0.17
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 179 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 180 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 181 - "background-task-stop.test.ts"
Cohesion: 0.25
Nodes (11): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started(), stopAcknowledgement() (+3 more)

### Community 183 - "normalizeKnowledgeRelativePath"
Cohesion: 0.35
Nodes (11): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+3 more)

### Community 184 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 185 - "OracleVoiceClientOptions"
Cohesion: 0.23
Nodes (3): OracleVoiceClientOptions, FakeVoiceClient, transcript()

### Community 186 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 187 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 188 - ".observe"
Cohesion: 0.21
Nodes (7): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId()

### Community 189 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 190 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 191 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 192 - "schedule-proposal-presentation.ts"
Cohesion: 0.27
Nodes (11): days, labels, proposalChanges(), proposalConsequence(), proposalSchedule, proposalTiming(), recurrenceLabel(), valueLabel() (+3 more)

### Community 194 - "use-oracle-attachments.ts"
Cohesion: 0.35
Nodes (11): removeManagerFile(), uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake() (+3 more)

### Community 195 - "DialogFrame.tsx"
Cohesion: 0.30
Nodes (9): changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame(), subscribeHubSignIn() (+1 more)

### Community 196 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 197 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 199 - "command-catalog-cache.test.ts"
Cohesion: 0.25
Nodes (9): at(), Catalog, deferred(), fixture(), fixtures, listed(), releases, runtime() (+1 more)

### Community 200 - "isRecord"
Cohesion: 0.29
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 201 - "server/side-question.ts"
Cohesion: 0.27
Nodes (8): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), sideQuestionPrompt(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH, SIDE_QUESTION_EARLIER_LIMIT, SIDE_QUESTION_MAX_LENGTH

### Community 202 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 203 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 204 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 205 - "notification-center.integration.test.ts"
Cohesion: 0.22
Nodes (7): center(), directories, directory(), hub(), now, runtimes, trusted

### Community 206 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 207 - "ComputersDialog.tsx"
Cohesion: 0.31
Nodes (7): addComputer(), removeComputer(), ComputersBody(), remove(), submit(), ComputersBodyProps, computer

### Community 208 - "transcribeAudio"
Cohesion: 0.29
Nodes (4): transcribeAudio(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 209 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 210 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 211 - "history-projection.test.ts"
Cohesion: 0.31
Nodes (7): eventsFor(), groupedEventsFor(), ModelMessage, questionEventsFor(), random(), seedOffset, terminalTypes

### Community 212 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 213 - "ManagerProactiveInboxValidationError"
Cohesion: 0.28
Nodes (6): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions()

### Community 214 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 215 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 216 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 217 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 218 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 220 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 222 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 223 - "use-foreground-handoff.ts"
Cohesion: 0.47
Nodes (3): foregroundHandoffTimeoutMs, Handoff, useForegroundHandoff()

### Community 224 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 225 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 227 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 231 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **1463 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1458 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2455 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `ManagerStructuredMemoryStore`, `SessionStore`, `SessionDetail`, `oracle-voice-soak.ts`, `ManagerMessage`, `ManagedSession`, `NotificationStore`, `schedule-notification-service.test.ts`, `shared/settings-profile.ts`, `ManagerStore`, `ManagerProactiveInbox`, `sampler.ts`, `ManagerAgent`, `host-telemetry.ts`, `oracle-task-store.ts`, `ScheduleRun`, `tmux-errors.integration.test.ts`, `react`, `transcription-service.ts`, `alerts.test.ts`, `ScheduleWorktreeService`, `dreamer-service.ts`, `ProviderSessionService`, `session-knowledge-store.ts`, `DreamerService`, `NotificationCenterService`, `SessionService`, `ManagerEvent`, `SchedulerStore`, `server/skill-settings.ts`, `TerminalSessionController`, `dreamer-routes.ts`, `ChildVoiceEngine`, `SessionOrderStore`, `KnowledgeStore`, `response-compression.test.ts`, `oracle-voice-config.ts`, `PushNotificationService`, `SchedulerDispatcher`, `scheduler-dispatcher.ts`, `pwa.ts`, `cli-canary.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `multi-node.test.ts`, `transcript-test-helpers.ts`, `.discoverTerminalSessions`, `.takeInTranscript`, `TerminalSessionController`, `claude-agent-service.ts`, `agent-service.ts`, `background-task-adapter.ts`, `recovery-resend-durability.test.ts`, `CopilotSessionLike`, `session-directory.ts`, `AgentProvider`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `multi-node.test.ts`, `SessionDetail`, `.takeInTranscript`, `TerminalSessionController`, `ManagerAttachment`, `CopilotSessionLike`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1463 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.0330461298443428 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.024920312952767313 - nodes in this community are weakly interconnected._
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
- `e2e/ui-locks.pw.ts-snapshots/desktop-background-tasks-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-background-tasks-expanded-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-background-tasks-light-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-background-tasks-sheet-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-background-tasks-sheet-light-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-busy-queue-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-busy-queue-light-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-button-row-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-delivery-menu-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-delivery-unavailable-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-family-claude-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-family-openai-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-recording-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-refresh-attachment-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-sent-messages-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-session-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-session-setup-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-status-busy-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-computers-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-conversation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-conversation-tool-rows-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-desktop-rail-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-host-monitor-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-host-processes-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-new-session-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-notification-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-oracle-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-oracle-schedule-approval-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-preview-features-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-recently-closed-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-recently-closed-expanded-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-runtime-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-form-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-name-conflict-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-stale-link-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-scheduler-unpaired-target-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/desktop-session-actions-chromium-linux.png`
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
- `e2e/ui-locks.pw.ts-snapshots/foldable-background-tasks-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-background-tasks-expanded-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-background-tasks-light-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-background-tasks-sheet-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-background-tasks-sheet-light-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-busy-queue-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-composer-busy-queue-light-chromium-linux.png`
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
- `e2e/ui-locks.pw.ts-snapshots/foldable-conversation-tool-rows-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-desktop-rail-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-host-monitor-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-host-processes-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-new-session-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-notification-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-oracle-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-oracle-schedule-approval-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-preview-features-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-recently-closed-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-recently-closed-expanded-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-runtime-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-form-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-name-conflict-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-stale-link-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-scheduler-unpaired-target-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/foldable-session-actions-chromium-linux.png`
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
- `e2e/ui-locks.pw.ts-snapshots/phone-background-tasks-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-background-tasks-expanded-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-background-tasks-light-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-background-tasks-sheet-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-background-tasks-sheet-light-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-busy-queue-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-busy-queue-light-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-button-row-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-delivery-menu-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-delivery-unavailable-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-family-claude-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-family-openai-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-recording-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-sent-messages-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-session-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-session-setup-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-composer-status-busy-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-computers-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-conversation-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-conversation-tool-rows-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-desktop-rail-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-host-monitor-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-host-processes-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-new-session-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-notification-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-oracle-panel-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-oracle-schedule-approval-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-preview-features-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-recently-closed-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-recently-closed-expanded-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-runtime-dialog-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-form-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-name-conflict-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-stale-link-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-scheduler-unpaired-target-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/phone-session-actions-chromium-linux.png`
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
- `e2e/ui-locks.pw.ts-snapshots/tool-call-details-desktop-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/tool-call-details-foldable-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/tool-call-details-phone-chromium-linux.png`
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
