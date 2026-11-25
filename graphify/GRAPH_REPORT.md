# Agentic Remote - Graphify code map

Snapshot: `852d70f0d2189eba59cf84a0b1a20c66021a0120cda12a00620924d12da79a8e`

Source checkout: `56aaf2ed551e5a304109da75bb97827dd22488f8`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 668 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 668 files · ~1,188,485 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9345 nodes · 26948 edges · 283 communities (238 shown, 27 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1338 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionDetail
- AppWorkspace
- contracts.ts
- api.ts
- App.tsx
- agent-service.ts
- ClaudeAgentService
- sessionKey
- sections.tsx
- SessionService
- app.ts
- ManagedSession
- terminal-session.ts
- claude-agent-service.ts
- manager-agent.ts
- session-store-providers.test.ts
- agentic-remote-promotion-monitor
- session-directory.ts
- oracle-voice-soak.ts
- hub-routes.ts
- node-routes.ts
- react
- oracle-voice-child.ts
- VoiceCapture
- BackgroundTask
- oracle-voice-integration.test.ts
- client.ts
- transcription-service.ts
- CopilotClientLike
- TmuxTerminalSessionController
- oracle-task-store.ts
- pwa.ts
- OracleVoiceCoordinator
- ManagerStore
- UserInputReplyInput
- FakeVoiceEngine
- oracle-voice-worker.ts
- ManagerAgent
- manager-structured-memory-validation.ts
- tmux-test-helpers.ts
- tmux-errors.integration.test.ts
- DreamerService
- createManagerTools
- real-voice.ts
- sampler.ts
- background-task-adapter.ts
- RemoteNodeClient
- oracle-voice.ts
- notification-center-service.ts
- fake-voice.ts
- oracle-voice-benchmark.ts
- oracle-voice-session.ts
- terminal-session.test.ts
- agentic-remote
- dreamer-store.ts
- OracleDreamer.tsx
- schedules.ts
- ComposerActions.tsx
- workspace-fixtures.ts
- manager.ts
- processes.ts
- ui-locks.pw.ts
- ManagerMessage
- SchedulerStore
- agentic-remote-gate
- dreamer-service.ts
- bundle
- recovery-resend-durability.test.ts
- ManagerAssistant.tsx
- setupWorkspaceFixture
- oracle-voice-coordinator.ts
- ResidentVoiceWorker
- shared/settings-profile.ts
- DreamerStore
- manager-proactive-inbox.ts
- VoicePlayback
- active-sessions.ts
- schedule-recurrence.ts
- lib.rs
- node:fs/promises
- normalizeKnowledgeRelativePath
- dependencies
- devDependencies
- oracle-voice-security.test.ts
- dreamer-planner.ts
- terminal-startup-queue.test.ts
- cleanDialogLine
- client.test.ts
- agentic-remote-promotion-setup
- host-telemetry.ts
- KnowledgeStore
- ComputerSummary
- config.rs
- FakeSessionService
- PushNotificationService
- knowledge-tree.ts
- src/settings-profile.ts
- BackgroundTasksDialog.tsx
- feature-flags.ts
- manager-context.ts
- ManagerClientDefaults
- manager-structured-memory.ts
- oracle-voice-routes.ts
- SchedulerDispatcher
- SessionKnowledgeStore
- withTimeout
- ManagerProactiveInbox
- manager-tools.ts
- oracle-voice-segments.ts
- remote-voice-client.ts
- session-launcher.ts
- manager-proactive-coordinator.ts
- oracle-voice-routes.test.ts
- send-matrix.integration.test.ts
- SessionOrderStore
- manager-routes.ts
- scheduler-dispatcher.ts
- ManagerAssistant.test.tsx
- session-patch-browser.ts
- transcript-test-helpers.ts
- notification-classifier.ts
- agent-service.test.ts
- capture-workspace.ts
- cli-canary.ts
- SettingsProfileSnapshot
- session-transcript.ts
- scripts
- shell.ts
- oracle-voice-config.ts
- DreamerProgress
- registerSessionKnowledgeRoutes
- .toolHost
- manager-uploads.ts
- manager-structured-memory-search.ts
- SettingsProfileClient
- background-task-stop.test.ts
- HostMonitorView.test.tsx
- ScheduleProposalCards.tsx
- compilerOptions
- transport.test.ts
- ManagerStructuredMemoryStore
- session-clear-transcript.test.ts
- renderer.ts
- response-compression.test.ts
- use-markdown-document.ts
- vite.config.ts
- oracle-voice-tickets.ts
- session-knowledge-store.ts
- ActivityDetails.tsx
- session-unread.pw.ts
- compilerOptions
- full-gate.test.ts
- oracle-status.test.ts
- NotificationStore
- session-reply-durability.test.ts
- PromptCards.tsx
- markdown-navigation.ts
- compilerOptions
- SessionStatus
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- agent-service-event-projection.test.ts
- HostTelemetrySampler
- manager-store.ts
- src/session-patches.ts
- dreamer-schedule.ts
- ManagerMemory
- promotion-monitor.test.ts
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- session-reorder.pw.ts
- scripts
- session-latency-benchmark.ts
- ScheduleRun
- closed-sessions.ts
- terminal-form-deadline.test.ts
- closed-session-sweeper.ts
- session-resource-routes.test.ts
- use-oracle-attachments.ts
- pipeline.ts
- package.json
- VoiceEngineEvent
- oracle-voice-assets.test.ts
- ShellNavigation.test.tsx
- check-workspace-review-regressions.ts
- fake-vad.ts
- desktop.json
- DeferredSession
- ChatMessage
- LargeSessionService
- ActivityRow.tsx
- theme-contrast.test.ts
- pending-echo.ts
- shell-notifications.ts
- .oxlintrc.json
- settings-local.json
- isRecord
- ScheduleNotificationService
- session-scope.ts
- Pcm16Resampler
- document-render.pw.ts
- recently-closed.pw.ts
- dreamer-routes.ts
- ActivityRow.test.tsx
- html-preview.ts
- sign-in-expired.pw.ts
- command-catalog-cache.test.ts
- manager-proactive-inbox.test.ts
- .initialize
- tmux-errors.test.ts
- DocumentHeading
- pipeline.test.tsx
- static-files.ts
- dataset
- generate-pwa-icons.ts
- agent-service-recovery.test.ts
- bridge.rs
- use-markdown-document.test.tsx
- history-projection.test.ts
- logs-cli.test.ts
- manager-structured-memory-performance.test.ts
- promotion-setup-execution.test.ts
- remote-node-client.test.ts
- schedule-notification-service.test.ts
- sent-message.ts
- SessionOriginBadge.test.tsx
- fixture-frontend.ts
- doctor-cli.test.ts
- manager-proactive-coordinator.test.ts
- release-publication.test.ts
- composer-layout.test.ts
- HostTelemetryClock
- session-order-routes.test.ts
- settings.ts
- .transport
- HostAlertMonitor
- usePanelWidth
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- push-routes.ts
- SessionKnowledgeLifecycle
- FakeRecorder
- storedProvider
- MermaidDiagram.tsx
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- @fastify/static
- ffprobe-static
- @github/copilot-sdk
- hast-util-to-jsx-runtime
- lucide-react
- mermaid
- pdfjs-dist
- react-dom
- remark-parse
- web-push
- ws
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `AppWorkspace()` - 355 edges
2. `SessionDetail` - 327 edges
3. `AgentService` - 318 edges
4. `SessionStore` - 218 edges
5. `ManagedSession` - 188 edges
6. `buildApp()` - 141 edges
7. `ClaudeAgentService` - 133 edges
8. `registerHubRoutes()` - 114 edges
9. `ComputerManager` - 107 edges
10. `ManagerAgent` - 101 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `handleDragEnd()` --indirect_call--> `computerOrder()`  [INFERRED]
  src/App.tsx → e2e/session-reorder.pw.ts
- `FakeVoiceState` --references--> `ManagerMessage`  [EXTRACTED]
  e2e/fixtures/fake-voice.ts → shared/manager.ts
- `instrument()` --indirect_call--> `document()`  [INFERRED]
  e2e/session-patch-browser.ts → server/skill-settings-jsonc.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (283 total, 27 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (12): agentMode(), AgentService, commandShortcut(), isTerminalNotReadyRefusal(), isUncertainDelivery(), RuntimeConfigurationError, sessionInUseQueueMessage(), terminalAnswerRefused() (+4 more)

### Community 1 - "SessionDetail"
Cohesion: 0.03
Nodes (89): fixture(), restart(), fixture(), createStore(), recoveryFixture(), claudeOwner(), fixture(), claudeFixture() (+81 more)

### Community 2 - "AppWorkspace"
Cohesion: 0.03
Nodes (174): isManagerEvent(), terminalSendOptions(), sessionFileValidationError(), askSession(), clearConversation(), closeSession(), recoverConversation(), removeQueuedPrompt() (+166 more)

### Community 3 - "contracts.ts"
Cohesion: 0.03
Nodes (110): activityDetailsUnavailable(), activityNotInLog(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), backgroundTaskNotFound(), listedBackgroundTask(), readBackgroundTaskFrom() (+102 more)

### Community 4 - "api.ts"
Cohesion: 0.02
Nodes (140): AddKnowledgeRootInput, PushSettings, SessionKnowledgeRootMutationInput, SettingsChange, SettingsUpdateResult, parseSubmissionReceipt(), submissionReceiptFromError(), TRANSCRIPT_WINDOW (+132 more)

### Community 5 - "App.tsx"
Cohesion: 0.03
Nodes (114): executeCommand(), listWorkspace(), searchWorkspace(), ActivityRowStates, composerChanged(), composerPasted(), persistComposerDrafts(), reconcileComposerAttachmentRows() (+106 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.03
Nodes (107): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+99 more)

### Community 7 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (29): ClaudeAgentService, ClaudeSdk, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services (+21 more)

### Community 8 - "sessionKey"
Cohesion: 0.03
Nodes (94): closedSessionExpiresAt(), listClosedSessions(), saveSessionOrderLane(), handleDragEnd(), foregroundHandoffTimeoutMs, Handoff, useForegroundHandoff(), KnowledgeRootSelector() (+86 more)

### Community 9 - "sections.tsx"
Cohesion: 0.04
Nodes (94): TurnContextInput, RuntimeModelOption, ManagerSessionClosePolicy, AppearanceSetting, NewSessionBackendSetting, OracleResponseStyle, SettingsProfileKey, activateSession() (+86 more)

### Community 10 - "SessionService"
Cohesion: 0.04
Nodes (11): BackgroundTaskUpdate, updateComputerForLaunchIdentity(), nodeVoiceCapabilities(), registerNodeRoutes(), VoiceBackend, owns(), ProviderSessionService, SessionService (+3 more)

### Community 11 - "app.ts"
Cohesion: 0.03
Nodes (67): buildApp(), BuildAppOptions, errorStatusCode(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), directories, runtimes (+59 more)

### Community 12 - "ManagedSession"
Cohesion: 0.08
Nodes (14): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, normalizeNodeUrl(), SessionLauncherOptions (+6 more)

### Community 13 - "terminal-session.ts"
Cohesion: 0.04
Nodes (83): composer(), processAdapter, BackgroundShellsEvidence, boxedComposerFrame(), busyRowStatus(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes (+75 more)

### Community 14 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (60): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+52 more)

### Community 15 - "manager-agent.ts"
Cohesion: 0.04
Nodes (52): applications, directories, releases, sockets, ComputerManagerEvents, ManagerAgentOptions, ManagerSdkEvent, ManagerSdkSessionConfig (+44 more)

### Community 16 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (39): CopilotSessionLike, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDelivery (+31 more)

### Community 17 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 18 - "session-directory.ts"
Cohesion: 0.06
Nodes (57): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+49 more)

### Community 19 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 20 - "hub-routes.ts"
Cohesion: 0.04
Nodes (61): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+53 more)

### Community 21 - "node-routes.ts"
Cohesion: 0.05
Nodes (54): FileUploadError, registerFileUploadRoutes(), SessionParams, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema (+46 more)

### Community 22 - "react"
Cohesion: 0.06
Nodes (58): react, scheduleProposalSummary(), ScheduleTarget, createOracleVoiceTicket(), getPushSettings(), listComputerSkills(), listDirectories(), request() (+50 more)

### Community 23 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (44): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, createVoiceWorker(), defaultSpawnPiper(), errorMessage() (+36 more)

### Community 24 - "VoiceCapture"
Cohesion: 0.06
Nodes (24): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, harness() (+16 more)

### Community 25 - "BackgroundTask"
Cohesion: 0.05
Nodes (37): backgroundTaskSnapshot(), BackgroundTaskTracker, cloneSnapshot(), taskFingerprint(), apps, directories, FakeManager, fixture() (+29 more)

### Community 26 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (35): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+27 more)

### Community 27 - "client.ts"
Cohesion: 0.08
Nodes (22): VoiceServerControl, captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord(), isTicket() (+14 more)

### Community 28 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 29 - "CopilotClientLike"
Cohesion: 0.04
Nodes (45): complete(), event(), sessionWithLog(), start(), CopilotClientLike, directories, fakeClient(), ForkRequest (+37 more)

### Community 30 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (22): terminalComposerUnreadable(), startAgentAfterClear(), afterExit(), awaitingRelaunch(), backgroundShellsAllow(), captureForReplacement(), capturePane(), copilotCommand() (+14 more)

### Community 31 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (45): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+37 more)

### Community 32 - "pwa.ts"
Cohesion: 0.06
Nodes (53): AppVersion, parseAppVersion(), HubHealth, deletePushSubscription(), getPushPublicKey(), savePushSubscription(), App(), applyPwaUpdate() (+45 more)

### Community 33 - "OracleVoiceCoordinator"
Cohesion: 0.09
Nodes (6): errorMessage(), OracleVoiceCoordinator, PendingFinalTurn, withTimeout(), VoiceTurnState, VoiceClientControl

### Community 34 - "ManagerStore"
Cohesion: 0.07
Nodes (15): fixture(), scheduledFixture(), session(), openStore(), sessionTask(), applySessionReplacement(), ManagerStore, registryKey() (+7 more)

### Community 35 - "UserInputReplyInput"
Cohesion: 0.06
Nodes (9): persistedFormAnswer(), removeCopilotSessionFiles(), sessionInUseConflictMessage(), TerminalFormContinuation, isTerminalSessionInUsePrompt(), TerminalFormReplyError, TerminalSessionController, PendingUserInput (+1 more)

### Community 36 - "FakeVoiceEngine"
Cohesion: 0.06
Nodes (26): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceSttEngine, VoiceTtsEngine, VoiceUtteranceAudioFrame (+18 more)

### Community 37 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (26): benchmarkGroup(), EnabledOracleVoiceConfig, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys() (+18 more)

### Community 38 - "ManagerAgent"
Cohesion: 0.09
Nodes (13): DreamerProgressView, automaticPayload(), checkContent(), delay(), errorMessage(), isNotFound(), isPending(), isQueued() (+5 more)

### Community 39 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 40 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (48): foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity(), SocketPlace, UnixSocket (+40 more)

### Community 41 - "tmux-errors.integration.test.ts"
Cohesion: 0.05
Nodes (34): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+26 more)

### Community 42 - "DreamerService"
Cohesion: 0.11
Nodes (14): boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), dreamerRunKey() (+6 more)

### Community 43 - "createManagerTools"
Cohesion: 0.07
Nodes (18): busyReason(), createManagerTools(), closeCapReached(), define(), proactiveSessionAllowed(), requireComputer(), resolveSession(), scheduleTools() (+10 more)

### Community 44 - "real-voice.ts"
Cohesion: 0.06
Nodes (18): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+10 more)

### Community 45 - "sampler.ts"
Cohesion: 0.08
Nodes (45): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+37 more)

### Community 46 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (54): addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTasksApi (+46 more)

### Community 47 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (12): RemoteResync, RemoteSessionRead, HOST_ALERT_POLL_INTERVAL_MS, HostTelemetryTarget, OracleVoiceRouteOptions, headerSafe(), RemoteNodeClient, requestBytes() (+4 more)

### Community 48 - "oracle-voice.ts"
Cohesion: 0.07
Nodes (42): config, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities, closeServers, exactArrayBuffer() (+34 more)

### Community 49 - "notification-center-service.ts"
Cohesion: 0.07
Nodes (34): center(), directories, directory(), hub(), now, runtimes, trusted, NotificationCenterService (+26 more)

### Community 50 - "fake-voice.ts"
Cohesion: 0.07
Nodes (11): ActiveBackendSession, beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice() (+3 more)

### Community 51 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 52 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (17): acquisitionCancelled(), ActiveUtterance, asSessionError(), AudioReservation, capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled() (+9 more)

### Community 53 - "terminal-session.test.ts"
Cohesion: 0.07
Nodes (38): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, Screens, startCopilot() (+30 more)

### Community 54 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 55 - "dreamer-store.ts"
Cohesion: 0.07
Nodes (42): DreamerHistoryEntry, assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES (+34 more)

### Community 56 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (40): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition, getDreamer() (+32 more)

### Community 57 - "schedules.ts"
Cohesion: 0.07
Nodes (41): ScheduleAttentionSession, State, stateSchema, timestamp, action, create, existing, metadata (+33 more)

### Community 58 - "ComposerActions.tsx"
Cohesion: 0.08
Nodes (21): families, modelFamily, shortModelName(), repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions() (+13 more)

### Community 59 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (36): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, oracleHostStatusFixture() (+28 more)

### Community 60 - "manager.ts"
Cohesion: 0.07
Nodes (30): ManagerEventSource, NotificationRecorder, brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories (+22 more)

### Community 61 - "processes.ts"
Cohesion: 0.09
Nodes (28): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+20 more)

### Community 62 - "ui-locks.pw.ts"
Cohesion: 0.08
Nodes (30): { values }, fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns, fixtureSchedules, ComposerPart, expectTouchTargets(), lockedScreenshot (+22 more)

### Community 63 - "ManagerMessage"
Cohesion: 0.07
Nodes (8): FakeManager, ProactiveManager, FakeAgent, FakeManager, StoredManager, SecurityManager, ManagerMessage, ManagerSnapshot

### Community 64 - "SchedulerStore"
Cohesion: 0.13
Nodes (7): deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, ScheduleProposal, Schedule, ScheduleRunStatus

### Community 65 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 66 - "dreamer-service.ts"
Cohesion: 0.07
Nodes (26): DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgressEntry, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh (+18 more)

### Community 67 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 68 - "recovery-resend-durability.test.ts"
Cohesion: 0.07
Nodes (25): terminalService(), directories, disk, fixture(), gate(), gates, httpBoundary(), initialize() (+17 more)

### Community 69 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (36): editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), sendManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), canTakeFocus() (+28 more)

### Community 70 - "setupWorkspaceFixture"
Cohesion: 0.06
Nodes (17): desktop, devices, long, open(), phone, veryLong, devices, markedState() (+9 more)

### Community 71 - "oracle-voice-coordinator.ts"
Cohesion: 0.07
Nodes (25): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnector (+17 more)

### Community 72 - "ResidentVoiceWorker"
Cohesion: 0.12
Nodes (10): combinedTranscript(), float32ToPcm16(), matchesCancelled(), pcm16ToFloat32(), readBoundedText(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream (+2 more)

### Community 73 - "shared/settings-profile.ts"
Cohesion: 0.08
Nodes (37): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+29 more)

### Community 74 - "DreamerStore"
Cohesion: 0.13
Nodes (11): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, isMissing(), publicPlan() (+3 more)

### Community 75 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (39): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, emptyState(), eventId(), hasExactKeys(), isDisposition() (+31 more)

### Community 76 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 77 - "active-sessions.ts"
Cohesion: 0.10
Nodes (33): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+25 more)

### Community 78 - "schedule-recurrence.ts"
Cohesion: 0.10
Nodes (37): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+29 more)

### Community 79 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 80 - "node:fs/promises"
Cohesion: 0.06
Nodes (31): root, script, connect(), deferred(), disk, enqueue(), fixture(), fixtures (+23 more)

### Community 81 - "normalizeKnowledgeRelativePath"
Cohesion: 0.09
Nodes (30): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+22 more)

### Community 82 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 83 - "devDependencies"
Cohesion: 0.05
Nodes (39): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+31 more)

### Community 84 - "oracle-voice-security.test.ts"
Cohesion: 0.06
Nodes (22): apps, directories, VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), connect() (+14 more)

### Community 85 - "dreamer-planner.ts"
Cohesion: 0.10
Nodes (34): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+26 more)

### Community 86 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (29): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+21 more)

### Community 87 - "cleanDialogLine"
Cohesion: 0.13
Nodes (34): activeBottomFrame(), captureBeforeDeadline(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), FormReplyDeadlineError (+26 more)

### Community 88 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 89 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 90 - "host-telemetry.ts"
Cohesion: 0.09
Nodes (24): HostRequest, HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError(), aggregate, DiskSpaceSchema, HOST_TELEMETRY_INVALID_CLOSE_CODE, HOST_TELEMETRY_INVALID_CODE (+16 more)

### Community 91 - "KnowledgeStore"
Cohesion: 0.11
Nodes (15): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+7 more)

### Community 92 - "ComputerSummary"
Cohesion: 0.09
Nodes (26): ComputerSummary, browserConnection, ConnectionHints, connectionSparesData(), IdleScheduler, PASSIVE_READS_SINCE, PREFETCH_PASS_BYTES, PREFETCH_SIDEBAR_ROWS (+18 more)

### Community 93 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 95 - "PushNotificationService"
Cohesion: 0.13
Nodes (5): start(), HubEventSource, PushNotificationService, scoped(), registerPushRoutes()

### Community 96 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+26 more)

### Community 97 - "src/settings-profile.ts"
Cohesion: 0.08
Nodes (24): NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+16 more)

### Community 98 - "BackgroundTasksDialog.tsx"
Cohesion: 0.11
Nodes (28): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+20 more)

### Community 99 - "feature-flags.ts"
Cohesion: 0.15
Nodes (24): WorkspaceFixtureState, hub(), defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable() (+16 more)

### Community 100 - "manager-context.ts"
Cohesion: 0.12
Nodes (27): ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine(), followUpLine() (+19 more)

### Community 101 - "ManagerClientDefaults"
Cohesion: 0.10
Nodes (17): ManagerState, OracleVoiceBackendConnection, ManagerClientDefaults, VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState (+9 more)

### Community 102 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 103 - "oracle-voice-routes.ts"
Cohesion: 0.13
Nodes (30): sendNodeVoiceOutput(), limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode() (+22 more)

### Community 104 - "SchedulerDispatcher"
Cohesion: 0.18
Nodes (4): SchedulerDispatcher, registerSchedulerRoutes(), holdsSlot(), isInFlight()

### Community 105 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 106 - "withTimeout"
Cohesion: 0.12
Nodes (6): discover(), ManagerSdkClient, ManagerSdkSession, sameRuntime(), withTimeout(), ManagerSkillSummary

### Community 107 - "ManagerProactiveInbox"
Cohesion: 0.14
Nodes (11): ManagerProactiveInbox, ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso() (+3 more)

### Community 108 - "manager-tools.ts"
Cohesion: 0.07
Nodes (27): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, computerField, ContextTier, CreationRefusal, DECLINE_WORDS, describeField() (+19 more)

### Community 109 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 110 - "remote-voice-client.ts"
Cohesion: 0.16
Nodes (14): VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+6 more)

### Community 111 - "session-launcher.ts"
Cohesion: 0.10
Nodes (16): delay(), requireFolderTrust(), sameFolder(), SessionFolderTrustPolicy, SessionLaunch, SessionLauncher, SessionLauncherHost, SessionLaunchInput (+8 more)

### Community 112 - "manager-proactive-coordinator.ts"
Cohesion: 0.16
Nodes (9): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, SessionLifecycle, ManagerProactiveInboxEvent (+1 more)

### Community 113 - "oracle-voice-routes.test.ts"
Cohesion: 0.08
Nodes (14): OracleVoiceManager, ObservedLocalVoiceBackend, openApps, openSockets, RouteManager, RouteVoiceBackend, runtime(), testRoot() (+6 more)

### Community 114 - "send-matrix.integration.test.ts"
Cohesion: 0.07
Nodes (27): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+19 more)

### Community 115 - "SessionOrderStore"
Cohesion: 0.16
Nodes (12): orderStore(), carried(), laneFrom(), retire(), sameLane(), sessionOrderKey(), SessionOrderState, SessionOrderStore (+4 more)

### Community 116 - "manager-routes.ts"
Cohesion: 0.10
Nodes (17): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+9 more)

### Community 117 - "scheduler-dispatcher.ts"
Cohesion: 0.10
Nodes (18): enableSchedulerTools(), NoopScheduleLauncher, ScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS, SchedulerDispatcherOptions, ScheduleStopAcknowledgement (+10 more)

### Community 118 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (17): cancelManager(), resolveManagerConfirmation(), retryManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+9 more)

### Community 119 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 120 - "transcript-test-helpers.ts"
Cohesion: 0.15
Nodes (17): contextChangedInEvents(), createPendingUserInputTracker(), isEmptyResponseNotice(), pendingUserInputFromEvents(), PendingUserInputTracker, runtimeInfoFromEvents(), RuntimeTracker, SessionEventProjection (+9 more)

### Community 121 - "notification-classifier.ts"
Cohesion: 0.14
Nodes (24): computer, observe(), snapshot(), start, sustained(), attentionClosed(), attentionSeed(), classifyHostNotification() (+16 more)

### Community 122 - "agent-service.test.ts"
Cohesion: 0.12
Nodes (16): foregroundTurnOpen(), terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration (+8 more)

### Community 123 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 124 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 125 - "SettingsProfileSnapshot"
Cohesion: 0.14
Nodes (16): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+8 more)

### Community 126 - "session-transcript.ts"
Cohesion: 0.14
Nodes (21): TRANSCRIPT_CARRIED_LIMIT, sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+13 more)

### Community 127 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 128 - "shell.ts"
Cohesion: 0.15
Nodes (24): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+16 more)

### Community 129 - "oracle-voice-config.ts"
Cohesion: 0.14
Nodes (22): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+14 more)

### Community 130 - "DreamerProgress"
Cohesion: 0.16
Nodes (6): DreamerProgress, keyOf(), notOlder(), setup(), timeOf(), withTimeout()

### Community 131 - "registerSessionKnowledgeRoutes"
Cohesion: 0.14
Nodes (21): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+13 more)

### Community 132 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 133 - "manager-uploads.ts"
Cohesion: 0.15
Nodes (13): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+5 more)

### Community 134 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 135 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 136 - "background-task-stop.test.ts"
Cohesion: 0.14
Nodes (17): BackgroundTaskEventOptions, BackgroundTaskProjector, backgroundTasksFromEvents(), completed(), handoff(), launched(), nativeStart(), readExit() (+9 more)

### Community 137 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 138 - "ScheduleProposalCards.tsx"
Cohesion: 0.17
Nodes (22): nextOccurrences(), scheduleProviderUnavailableReason(), getSchedule(), listScheduleProposals(), resolveScheduleProposal(), days, labels, proposalChanges() (+14 more)

### Community 139 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 140 - "transport.test.ts"
Cohesion: 0.13
Nodes (13): registerHostTelemetryRoutes(), HOST_TELEMETRY_MAX_QUEUE_BYTES, HOST_TELEMETRY_MAX_QUEUE_MESSAGES, HOST_TELEMETRY_SEND_TIMEOUT_MS, HostSocket, HostTelemetrySocket, readingFixture(), empty (+5 more)

### Community 141 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 142 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 143 - "renderer.ts"
Cohesion: 0.14
Nodes (13): render, scope, DocumentRenderEvent, documentRenderEvents(), createWorkerRenderer(), defaultDocumentRenderer(), DocumentRendererContext, RendererWorker (+5 more)

### Community 144 - "response-compression.test.ts"
Cohesion: 0.13
Nodes (19): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), apps (+11 more)

### Community 145 - "use-markdown-document.ts"
Cohesion: 0.18
Nodes (16): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), finishDrawing(), Level (+8 more)

### Community 146 - "vite.config.ts"
Cohesion: 0.12
Nodes (12): brotliAsync, compress(), gzipAsync, precompressDirectory(), PrecompressedFile, directories, canaryTests, oracleVoiceAssetNames (+4 more)

### Community 147 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 148 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 149 - "ActivityDetails.tsx"
Cohesion: 0.18
Nodes (18): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, TOOL_CALL_ID_PATTERN, activityDetailFailure, detailKey(), formatBytes(), keep(), kept, keptActivityDetail() (+10 more)

### Community 150 - "session-unread.pw.ts"
Cohesion: 0.12
Nodes (12): bounds(), devices, edgeState(), open(), screenshot(), unreadState(), BACKGROUND_SESSION_ID, fixtureBackgroundTasks (+4 more)

### Community 151 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 152 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 153 - "oracle-status.test.ts"
Cohesion: 0.16
Nodes (15): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+7 more)

### Community 154 - "NotificationStore"
Cohesion: 0.20
Nodes (4): matchesNotification(), NotificationStore, setup(), NotificationFilter

### Community 155 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 156 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 157 - "markdown-navigation.ts"
Cohesion: 0.18
Nodes (19): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+11 more)

### Community 158 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 159 - "SessionStatus"
Cohesion: 0.12
Nodes (18): Seen, ManagerProactiveInboxObservation, PersistedCursor, NotificationCursor, Row, SdkRestartRecovery, SessionExecutionMode, SessionStatus (+10 more)

### Community 160 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 161 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 162 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 163 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 164 - "agent-service-event-projection.test.ts"
Cohesion: 0.13
Nodes (16): at(), directories, finish(), launch(), projected(), services, sessionLog(), syncSessionTranscript() (+8 more)

### Community 165 - "HostTelemetrySampler"
Cohesion: 0.16
Nodes (6): prefixes, session, trusted, untrusted, HostTelemetrySampler, HostSample

### Community 166 - "manager-store.ts"
Cohesion: 0.15
Nodes (15): emptyState(), JournalKind, ManagerStoreOptions, messageSource(), projectProvenance(), ProvenanceListener, storedMessage(), isSession() (+7 more)

### Community 167 - "src/session-patches.ts"
Cohesion: 0.19
Nodes (9): nextVoiceControl(), Client, Browser, HubResyncRequest, HubTasksResyncRequest, HubWireEvent, applyTaskPatch(), SessionPatchReceiver (+1 more)

### Community 168 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 169 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 170 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 171 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 172 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 173 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 174 - "session-reorder.pw.ts"
Cohesion: 0.13
Nodes (9): center(), computerOrder(), desktop, dropOnto(), longListState(), open(), phone, Point (+1 more)

### Community 175 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 176 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 177 - "ScheduleRun"
Cohesion: 0.36
Nodes (5): provenance(), SessionScheduleLauncher, ScheduleLaunchRefusedError, ScheduleReconciliation, ScheduleRun

### Community 178 - "closed-sessions.ts"
Cohesion: 0.18
Nodes (14): blockParents, CLOSED_SESSION_RETENTION_DAYS, closedCapitals(), closedSessionContext(), excerpt(), head(), htmlElements, htmlText() (+6 more)

### Community 179 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 180 - "closed-session-sweeper.ts"
Cohesion: 0.17
Nodes (5): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS

### Community 181 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 182 - "use-oracle-attachments.ts"
Cohesion: 0.25
Nodes (14): removeManagerFile(), uploadManagerFile(), attachmentSize(), OracleAttachmentChips(), OracleMessageAttachments(), DraftAttachment, hasBlockingAttachments(), uploadedReferences() (+6 more)

### Community 183 - "pipeline.ts"
Cohesion: 0.19
Nodes (15): partlyHeldRenderer(), documentParts(), documentUrlTransform(), drawSteps(), growable, htmlBlocks, isDiagram(), processor (+7 more)

### Community 184 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 185 - "VoiceEngineEvent"
Cohesion: 0.18
Nodes (7): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, VoiceEngineEvent

### Community 186 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 187 - "ShellNavigation.test.tsx"
Cohesion: 0.29
Nodes (7): ClientFeature, railEntries(), PreviewFeaturesContext, initials(), useDisplayName(), DisplayNameSetting(), ShellNavigation()

### Community 188 - "check-workspace-review-regressions.ts"
Cohesion: 0.15
Nodes (11): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+3 more)

### Community 189 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 190 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 191 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 192 - "ChatMessage"
Cohesion: 0.18
Nodes (10): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, ChatMessage, TranscriptWindow (+2 more)

### Community 194 - "ActivityRow.tsx"
Cohesion: 0.33
Nodes (11): toolCallIdFromActivityId(), activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), compactActivityText(), formatActivityDuration() (+3 more)

### Community 195 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 196 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 197 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 198 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 199 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 200 - "isRecord"
Cohesion: 0.24
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 202 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 203 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 205 - "recently-closed.pw.ts"
Cohesion: 0.23
Nodes (9): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), open(), row() (+1 more)

### Community 206 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 207 - "ActivityRow.test.tsx"
Cohesion: 0.20
Nodes (7): ActivityStatus, ActivityRow, bashDetail(), output, raw, runningDetail(), text()

### Community 208 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 209 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 210 - "command-catalog-cache.test.ts"
Cohesion: 0.25
Nodes (9): at(), Catalog, deferred(), fixture(), fixtures, listed(), releases, runtime() (+1 more)

### Community 211 - "manager-proactive-inbox.test.ts"
Cohesion: 0.22
Nodes (6): fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 212 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 213 - "tmux-errors.test.ts"
Cohesion: 0.24
Nodes (9): containedServer(), directories, errno(), { execute }, files, links, listener(), places() (+1 more)

### Community 214 - "DocumentHeading"
Cohesion: 0.20
Nodes (6): DocumentViewControls(), actions, outline, RenderedDocumentTree, MarkdownDocumentView, DocumentHeading

### Community 215 - "pipeline.test.tsx"
Cohesion: 0.22
Nodes (8): emptyDrawing, documentOpening(), components, drawn(), drawnPage(), fixtures, html(), today()

### Community 216 - "static-files.ts"
Cohesion: 0.27
Nodes (6): RFC-9110, AcceptedEncodings, FILE_HEADERS, isApiPath(), isAppleTouchIconProbe(), registerStaticFiles()

### Community 217 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 218 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 219 - "agent-service-recovery.test.ts"
Cohesion: 0.22
Nodes (6): holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents()

### Community 220 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 221 - "use-markdown-document.test.tsx"
Cohesion: 0.22
Nodes (4): DocumentRenderer, components, Reader(), show()

### Community 222 - "history-projection.test.ts"
Cohesion: 0.31
Nodes (7): eventsFor(), groupedEventsFor(), ModelMessage, questionEventsFor(), random(), seedOffset, terminalTypes

### Community 223 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 224 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.31
Nodes (6): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult

### Community 225 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 226 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 227 - "schedule-notification-service.test.ts"
Cohesion: 0.28
Nodes (4): input(), now, run(), SchedulerChanged

### Community 228 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 229 - "SessionOriginBadge.test.tsx"
Cohesion: 0.44
Nodes (5): readScheduleLink(), ScheduleLink, scheduleNotificationLabel(), preview(), SessionOriginRunLink()

### Community 230 - "fixture-frontend.ts"
Cohesion: 0.32
Nodes (4): captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend()

### Community 231 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 232 - "manager-proactive-coordinator.test.ts"
Cohesion: 0.29
Nodes (4): directories, fixture(), managed(), ManagerProactiveInboxOptions

### Community 233 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 234 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 236 - "session-order-routes.test.ts"
Cohesion: 0.43
Nodes (6): directories, fakeManager(), hub(), settled(), until(), upserted()

### Community 237 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 240 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 241 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 242 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 243 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 248 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **1490 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1485 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2512 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `oracle-voice-config.ts`, `SessionDetail`, `ClaudeAgentService`, `SessionService`, `ManagedSession`, `transport.test.ts`, `manager-agent.ts`, `response-compression.test.ts`, `node-routes.ts`, `NotificationStore`, `transcription-service.ts`, `oracle-task-store.ts`, `pwa.ts`, `ManagerStore`, `HostTelemetrySampler`, `ManagerAgent`, `oracle-voice-worker.ts`, `manager-store.ts`, `tmux-errors.integration.test.ts`, `DreamerService`, `real-voice.ts`, `notification-center-service.ts`, `ScheduleRun`, `SchedulerStore`, `ScheduleNotificationService`, `dreamer-routes.ts`, `static-files.ts`, `KnowledgeStore`, `PushNotificationService`, `feature-flags.ts`, `SchedulerDispatcher`, `SessionKnowledgeStore`, `ManagerProactiveInbox`, `HostAlertMonitor`, `manager-proactive-coordinator.ts`, `SessionOrderStore`, `manager-routes.ts`, `scheduler-dispatcher.ts`, `cli-canary.ts`, `SettingsProfileSnapshot`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `UserInputReplyInput`, `recovery-resend-durability.test.ts`, `contracts.ts`, `agent-service.ts`, `ClaudeAgentService`, `claude-agent-service.ts`, `background-task-adapter.ts`, `session-store-providers.test.ts`, `session-directory.ts`, `hub-routes.ts`, `storedProvider`, `agent-service.test.ts`, `CopilotClientLike`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `TmuxTerminalSessionController` connect `TmuxTerminalSessionController` to `UserInputReplyInput`, `active-sessions.ts`, `terminal-session.test.ts`, `cleanDialogLine`, `processes.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1490 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.0365296803652968 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.02680882804615857 - nodes in this community are weakly interconnected._
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
