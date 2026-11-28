# Agentic Remote - Graphify code map

Snapshot: `96fb4b0e50531a3a74e25052f69dff30cb313f63bd1287a114cf0042a4b58874`

Source checkout: `6e32c272673a33f558e7147846ecb5c21c4a2bfb`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 701 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 701 files · ~1,241,241 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9758 nodes · 28152 edges · 275 communities (230 shown, 28 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1368 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- AppWorkspace
- SessionDetail
- api.ts
- workspace-fixtures.ts
- session-presentation.ts
- App.tsx
- contracts.ts
- agent-service.ts
- ClaudeAgentService
- app.ts
- notification-classifier.ts
- oracle-voice-integration.test.ts
- ManagerStore
- manager-agent.ts
- sections.tsx
- ManagedSession
- claude-agent-service.ts
- ChatMessage
- HubEvent
- dreamer-store.ts
- OracleVoiceCoordinator
- react
- RemoteNodeClient
- agentic-remote-promotion-monitor
- terminal-session.ts
- fake-voice.ts
- oracle-voice-soak.ts
- client.ts
- schedules.ts
- VoiceClientControl
- node-routes.ts
- CopilotClientLike
- send-matrix.integration.test.ts
- CopilotSessionLike
- oracle-task-store.ts
- ManagerAssistant.tsx
- oracle-voice-benchmark.ts
- oracle-voice.ts
- TmuxTerminalSessionController
- ui-locks.pw.ts
- .sendInternal
- createManagerTools
- tmux-test-helpers.ts
- UserInputReplyInput
- OracleDreamer.tsx
- ProviderSessionService
- manager-structured-memory-validation.ts
- oracle-voice-engine.ts
- ScheduleRun
- schedule-launcher.test.ts
- oracle-voice-worker.ts
- session-categories.ts
- background-task-adapter.ts
- DreamerService
- sampler.ts
- manager.ts
- SessionService
- oracle-voice-session.ts
- agentic-remote
- LocalTranscriptionService
- SchedulerStore
- processes.ts
- ResidentVoiceWorker
- manager-proactive-coordinator.ts
- agentic-remote-gate
- active-sessions.ts
- parakeet-child.ts
- bundle
- transcription-service.ts
- dreamer-service.ts
- feature-flags.ts
- manager-proactive-inbox.ts
- terminal-session.test.ts
- hub-routes.ts
- FakeVoiceEngine
- shell.ts
- VoicePlayback
- VoiceAudioFrame
- oracle-voice-child.ts
- schedule-recurrence.ts
- lib.rs
- dependencies
- devDependencies
- oracle-voice-config.ts
- FakeSessionService
- SessionOrderStore
- ComposerActions.tsx
- client.test.ts
- agentic-remote-promotion-setup
- config.rs
- recovery-resend-durability.test.ts
- oracle-voice-routes.ts
- oracle-voice-child.test.ts
- KnowledgeStore
- manager-structured-memory.ts
- knowledge-tree.ts
- service.ts
- SessionKnowledgeStore
- BackgroundTasksDialog.tsx
- controls.tsx
- session-prefetch.ts
- .takeInTranscript
- session-category-routes.test.ts
- settings-profile-store.ts
- dreamer-planner.ts
- node:fs/promises
- session-patch-browser.ts
- agent-service-event-projection.test.ts
- closed-sessions.ts
- oracle-voice-segments.ts
- parakeet-worker.ts
- session-launcher.ts
- shared/settings-profile.ts
- ManagerClientDefaults
- host-telemetry.ts
- SettingsProfileClient
- session-store-providers.test.ts
- agent-service.test.ts
- session-reply-durability.test.ts
- manager-structured-memory-search.ts
- SessionStatus
- oracle-voice-security.test.ts
- ParakeetWorker
- transcript-window.ts
- oracle-voice-routes.test.ts
- capture-workspace.ts
- session-directory.ts
- cli-canary.ts
- SessionCategoryStore
- scripts
- pipeline.ts
- use-markdown-document.ts
- renderer.ts
- manager-routes.ts
- transcript-test-helpers.ts
- DreamerProgress
- ActivityRow.test.tsx
- session-transcript.ts
- use-session-knowledge-root.ts
- HostMonitorView.test.tsx
- .observe
- manager-uploads.ts
- src/settings-profile.ts
- compilerOptions
- oracle-voice-assets.test.ts
- transport.test.ts
- oracle-voice-coordinator.test.ts
- markdown-navigation.ts
- vite.config.ts
- ManagerStructuredMemoryStore
- manager-tools.ts
- oracle-voice-tickets.ts
- session-knowledge-store.ts
- ActivityDetails.tsx
- SessionOriginBadge.test.tsx
- BackgroundTaskSnapshot
- compilerOptions
- full-gate.test.ts
- compilerOptions
- normalizeKnowledgeRelativePath
- .toolHost
- ManagerProactiveInbox
- OnlineRecognizer
- workspace-browser.ts
- DialogFrame.tsx
- MessageTime.tsx
- compilerOptions
- compilerOptions
- oracle-status.test.ts
- ManagerMemory
- ScheduleProposalCards.tsx
- promotion-monitor.test.ts
- PromptCards.tsx
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- dreamer-schedule.ts
- SoakManager
- HostTelemetrySampler
- session-resource-routes.test.ts
- SkillSettingsService
- RuntimeStatus.tsx
- package.json
- registerSessionKnowledgeRoutes
- session-knowledge-routes.ts
- server/skill-settings.ts
- shared/skill-settings.ts
- use-oracle-attachments.ts
- settings-profile.test.ts
- fake-vad.ts
- desktop.json
- DeferredSession
- background-task-stop.test.ts
- session-resource-clear.test.ts
- parakeet-transcription.ts
- response-compression.test.ts
- LargeSessionService
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- Pcm16Resampler
- dreamer-routes.ts
- manager-proactive-inbox.test.ts
- html-preview.ts
- sign-in-expired.pw.ts
- command-catalog-cache.test.ts
- .initialize
- ScheduleNotificationService
- SessionAdmissions
- tmux-errors.test.ts
- dataset
- generate-pwa-icons.ts
- claude-recovery-admission.test.ts
- session-enqueue-clear.test.ts
- bridge.rs
- history-projection.test.ts
- logs-cli.test.ts
- manager-structured-memory-performance.test.ts
- promotion-setup-execution.test.ts
- response-compression.ts
- session-store-durability.test.ts
- sent-message.ts
- voice-recorder.ts
- doctor-cli.test.ts
- release-publication.test.ts
- UserInputFieldControl
- use-markdown-document.test.tsx
- session-list-collisions.test.ts
- composer-layout.test.ts
- HostTelemetryClock
- settings.ts
- DocumentViewControls.tsx
- refusal-metrics-routes.test.ts
- usePanelWidth
- manager-structured-memory-intent.ts
- promotion-setup.test.ts
- FakeRecorder
- MockMediaRecorder
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
1. `AppWorkspace()` - 394 edges
2. `SessionDetail` - 328 edges
3. `AgentService` - 318 edges
4. `SessionStore` - 218 edges
5. `ManagedSession` - 190 edges
6. `buildApp()` - 151 edges
7. `ClaudeAgentService` - 133 edges
8. `registerHubRoutes()` - 117 edges
9. `ComputerManager` - 108 edges
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

## Communities (275 total, 28 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (14): agentMode(), AgentService, isTerminalNotReadyRefusal(), normalizedTitle(), sessionInUseConflictMessage(), sessionInUseQueueMessage(), terminalAnswerRefused(), preparePrompt() (+6 more)

### Community 1 - "AppWorkspace"
Cohesion: 0.03
Nodes (207): terminalSendOptions(), newSessionCategoryId(), sessionCategoryOf(), sessionFileValidationError(), SettingsChange, SettingsProfileKey, SettingsUpdateResult, AppWorkspace() (+199 more)

### Community 2 - "SessionDetail"
Cohesion: 0.03
Nodes (88): fixture(), restart(), fixture(), createStore(), recoveryFixture(), storeAt(), fixture(), fixture() (+80 more)

### Community 3 - "api.ts"
Cohesion: 0.02
Nodes (172): httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionReceipt, submissionReceiptFromError(), activateSession(), activityArgumentFormats, activityDetailStatuses (+164 more)

### Community 4 - "workspace-fixtures.ts"
Cohesion: 0.02
Nodes (103): frame(), geometry, output, scratch, screenshot(), { values }, accents, Measurement (+95 more)

### Community 5 - "session-presentation.ts"
Cohesion: 0.03
Nodes (114): CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), DEFAULT_COLLAPSED_CATEGORY_SHOWS, DEFAULT_SESSION_PROVIDER, handleDragEnd(), startSessionCreation(), startSessionInCategory(), newLaunchId() (+106 more)

### Community 6 - "App.tsx"
Cohesion: 0.02
Nodes (119): isManagerEvent(), turnEnded(), TRANSCRIPT_WINDOW, executeCommand(), ActivityRowStates, sidebarResizeMove(), attachmentId(), bindingMatches() (+111 more)

### Community 7 - "contracts.ts"
Cohesion: 0.04
Nodes (94): readBackgroundTaskFrom(), ClaudeAgentServiceEvents, RemoteSessionListing, DirectoryScope, awaitTermination(), LaunchCreations, apps, directories (+86 more)

### Community 8 - "agent-service.ts"
Cohesion: 0.03
Nodes (107): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+99 more)

### Community 9 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (27): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+19 more)

### Community 10 - "app.ts"
Cohesion: 0.03
Nodes (71): RFC-9110, apps, directories, buildApp(), errorStatusCode(), ClientPresence, PRESENCE_TTL_MS, namesComputer() (+63 more)

### Community 11 - "notification-classifier.ts"
Cohesion: 0.04
Nodes (67): HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, computer, observe(), snapshot(), start, sustained(), center() (+59 more)

### Community 12 - "oracle-voice-integration.test.ts"
Cohesion: 0.03
Nodes (54): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+46 more)

### Community 13 - "ManagerStore"
Cohesion: 0.04
Nodes (43): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+35 more)

### Community 14 - "manager-agent.ts"
Cohesion: 0.06
Nodes (31): DreamerProgressView, automaticPayload(), checkContent(), delay(), discover(), errorMessage(), isNotFound(), isPending() (+23 more)

### Community 15 - "sections.tsx"
Cohesion: 0.04
Nodes (77): parseAppVersion(), AppearanceSetting, NewSessionBackendSetting, deletePushSubscription(), getHubHealth(), getManager(), getPushPublicKey(), savePushSubscription() (+69 more)

### Community 16 - "ManagedSession"
Cohesion: 0.07
Nodes (17): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, ManagerProactiveCoordinatorOptions (+9 more)

### Community 17 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (67): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+59 more)

### Community 18 - "ChatMessage"
Cohesion: 0.04
Nodes (52): TranscriptBuilder, nextVoiceControl(), BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, Client, apps (+44 more)

### Community 19 - "HubEvent"
Cohesion: 0.05
Nodes (34): ComputerManagerEvents, ManagerEventSource, ProactiveManager, start(), NotificationRecorder, brief(), HubEventSource, OracleEventSource (+26 more)

### Community 20 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (49): validateDreamerTimeZone(), assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+41 more)

### Community 21 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (19): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+11 more)

### Community 22 - "react"
Cohesion: 0.05
Nodes (60): react, scheduleProposalSummary(), ScheduleRecurrence, ScheduleTarget, getProviderRuntimeOptions(), listClosedSessions(), listDirectories(), AddKnowledgeRootDialog() (+52 more)

### Community 23 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (18): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, requestBytes(), client(), servers, session (+10 more)

### Community 24 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 25 - "terminal-session.ts"
Cohesion: 0.04
Nodes (73): composer(), processAdapter, boxedComposerFrame(), busyRowStatus(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText() (+65 more)

### Community 26 - "fake-voice.ts"
Cohesion: 0.04
Nodes (15): beginSpeech(), BrowserTestSessionService, endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, FakeVoiceState (+7 more)

### Community 27 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (39): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+31 more)

### Community 28 - "client.ts"
Cohesion: 0.07
Nodes (26): SocketMessage, connect(), Inbox, rawBuffer(), VoiceServerControl, captureClientError(), clientError(), closeError() (+18 more)

### Community 29 - "schedules.ts"
Cohesion: 0.05
Nodes (58): input(), now, run(), NoopScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS, SchedulerDispatcherOptions (+50 more)

### Community 30 - "VoiceClientControl"
Cohesion: 0.06
Nodes (25): VoiceClientControl, BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl (+17 more)

### Community 31 - "node-routes.ts"
Cohesion: 0.05
Nodes (52): activityDetailsUnavailable(), activityNotInLog(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), FileUploadError, registerFileUploadRoutes(), SessionParams (+44 more)

### Community 32 - "CopilotClientLike"
Cohesion: 0.03
Nodes (43): complete(), event(), sessionWithLog(), start(), CopilotClientLike, holdProbe(), fixtures, gate() (+35 more)

### Community 33 - "send-matrix.integration.test.ts"
Cohesion: 0.04
Nodes (55): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+47 more)

### Community 34 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (34): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+26 more)

### Community 35 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (45): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+37 more)

### Community 36 - "ManagerAssistant.tsx"
Cohesion: 0.05
Nodes (50): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline() (+42 more)

### Community 37 - "oracle-voice-benchmark.ts"
Cohesion: 0.06
Nodes (50): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+42 more)

### Community 38 - "oracle-voice.ts"
Cohesion: 0.06
Nodes (47): playbackSequence(), beginUtterance(), config, control(), limits, measuredPlaybackEvents(), VoiceFinalTranscript, VoiceFrameAcceptance (+39 more)

### Community 39 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (24): startAgentAfterClear(), afterExit(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, formReplyExpired(), listTmuxSessions() (+16 more)

### Community 40 - "ui-locks.pw.ts"
Cohesion: 0.05
Nodes (39): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+31 more)

### Community 41 - ".sendInternal"
Cohesion: 0.10
Nodes (50): terminalComposerUnreadable(), activeBottomFrame(), backgroundShellsAllow(), captureBeforeDeadline(), captureForReplacement(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts() (+42 more)

### Community 42 - "createManagerTools"
Cohesion: 0.07
Nodes (19): busyReason(), createManagerTools(), categoryTools(), closeCapReached(), define(), proactiveSessionAllowed(), requireComputer(), resolveSession() (+11 more)

### Community 43 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (48): foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity(), SocketPlace, UnixSocket (+40 more)

### Community 44 - "UserInputReplyInput"
Cohesion: 0.06
Nodes (10): isUncertainDelivery(), PendingUserInputTracker, persistedFormAnswer(), removeCopilotSessionFiles(), TerminalFormContinuation, TerminalFormReplyError, TerminalSessionController, PendingUserInput (+2 more)

### Community 45 - "OracleDreamer.tsx"
Cohesion: 0.07
Nodes (49): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DREAMER_PROGRESS_REFRESH_MS, DreamerPlanItem, DreamerPlanItemSource, DreamerProgressStatus, DreamerTaskCompletionProvenance (+41 more)

### Community 46 - "ProviderSessionService"
Cohesion: 0.06
Nodes (3): updateComputerForLaunchIdentity(), owns(), ProviderSessionService

### Community 47 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 48 - "oracle-voice-engine.ts"
Cohesion: 0.06
Nodes (21): clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics, registerControlRoutes() (+13 more)

### Community 49 - "ScheduleRun"
Cohesion: 0.12
Nodes (12): provenance(), SessionScheduleLauncher, session(), ScheduleLauncher, ScheduleLaunchRefusedError, SchedulerDispatcher, ScheduleReconciliation, registerSchedulerRoutes() (+4 more)

### Community 50 - "schedule-launcher.test.ts"
Cohesion: 0.05
Nodes (34): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+26 more)

### Community 51 - "oracle-voice-worker.ts"
Cohesion: 0.09
Nodes (22): benchmarkGroup(), capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent(), isEnabledConfig(), isNonEmptyString() (+14 more)

### Community 52 - "session-categories.ts"
Cohesion: 0.08
Nodes (46): claudeModels, computers, copilotModels, enableSchedulerTools(), interfere(), CategoryState, Fields, isRecord() (+38 more)

### Community 53 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (53): addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, copyTask() (+45 more)

### Community 54 - "DreamerService"
Cohesion: 0.12
Nodes (10): activeDreamerMemoryIds(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate (+2 more)

### Community 55 - "sampler.ts"
Cohesion: 0.08
Nodes (45): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+37 more)

### Community 56 - "manager.ts"
Cohesion: 0.07
Nodes (40): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+32 more)

### Community 57 - "SessionService"
Cohesion: 0.07
Nodes (8): closeReason(), closeVoiceSocket(), registerNodeRoutes(), execute, git(), node(), SessionService, SCHEDULE_WORKTREE_VERSION

### Community 58 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (18): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), createVoiceBackendSession(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled() (+10 more)

### Community 59 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 60 - "LocalTranscriptionService"
Cohesion: 0.09
Nodes (18): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, ParakeetSpeechEngine (+10 more)

### Community 61 - "SchedulerStore"
Cohesion: 0.12
Nodes (8): fixture(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, retainedHistory(), ScheduleProposal, Schedule

### Community 62 - "processes.ts"
Cohesion: 0.08
Nodes (27): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+19 more)

### Community 63 - "ResidentVoiceWorker"
Cohesion: 0.10
Nodes (12): combinedTranscript(), matchesCancelled(), pcm16ToFloat32(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, waitForActivePiperExit(), waitForPiperExit() (+4 more)

### Community 64 - "manager-proactive-coordinator.ts"
Cohesion: 0.09
Nodes (12): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, SessionLifecycle, directories, FakeAgent (+4 more)

### Community 65 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 66 - "active-sessions.ts"
Cohesion: 0.09
Nodes (37): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+29 more)

### Community 67 - "parakeet-child.ts"
Cohesion: 0.08
Nodes (30): createParakeetChild(), decodeResult(), errorMessage(), finiteNumbers(), hasCreateAsync(), normalizeParakeetSherpaModule(), PARAKEET_MODEL_FILES, ParakeetChild (+22 more)

### Community 68 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 69 - "transcription-service.ts"
Cohesion: 0.06
Nodes (31): ParakeetDecoder, TRANSCRIPTION_TIMEOUT_MS, TranscriptionEngineConfig, accessible(), CommandOptions, CommandResult, CommandRunner, configuredThreads() (+23 more)

### Community 70 - "dreamer-service.ts"
Cohesion: 0.07
Nodes (25): DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply (+17 more)

### Community 71 - "feature-flags.ts"
Cohesion: 0.11
Nodes (31): hub(), AppVersion, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable() (+23 more)

### Community 72 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (40): assertExactKeys(), canonicalHash(), DISPOSITIONS, emptyState(), eventId(), hasExactKeys(), isAlreadyExists(), isEventKind() (+32 more)

### Community 73 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (33): message(), sendLikeTheApp(), exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec (+25 more)

### Community 74 - "hub-routes.ts"
Cohesion: 0.05
Nodes (40): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+32 more)

### Community 75 - "FakeVoiceEngine"
Cohesion: 0.08
Nodes (16): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+8 more)

### Community 76 - "shell.ts"
Cohesion: 0.09
Nodes (35): ScheduleShellNotifier, attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label() (+27 more)

### Community 77 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 78 - "VoiceAudioFrame"
Cohesion: 0.11
Nodes (19): ActiveBackendSession, QueuedAudio, BrowserCaptureOptions, AudioReservation, VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer() (+11 more)

### Community 79 - "oracle-voice-child.ts"
Cohesion: 0.07
Nodes (34): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), float32ToPcm16() (+26 more)

### Community 80 - "schedule-recurrence.ts"
Cohesion: 0.10
Nodes (37): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+29 more)

### Community 81 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 82 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 83 - "devDependencies"
Cohesion: 0.05
Nodes (39): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+31 more)

### Community 84 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (28): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+20 more)

### Community 86 - "SessionOrderStore"
Cohesion: 0.12
Nodes (19): stores(), directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted() (+11 more)

### Community 87 - "ComposerActions.tsx"
Cohesion: 0.09
Nodes (17): AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), filterSentMessages(), SentHistoryContext, ComposerActions(), startingAttachmentReason, ContextRing() (+9 more)

### Community 88 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 89 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 90 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 91 - "recovery-resend-durability.test.ts"
Cohesion: 0.08
Nodes (30): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+22 more)

### Community 92 - "oracle-voice-routes.ts"
Cohesion: 0.11
Nodes (32): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+24 more)

### Community 93 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (14): createVoiceWorker(), PiperProcess, childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream (+6 more)

### Community 94 - "KnowledgeStore"
Cohesion: 0.12
Nodes (14): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+6 more)

### Community 95 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (30): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+22 more)

### Community 96 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (33): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+25 more)

### Community 97 - "service.ts"
Cohesion: 0.10
Nodes (17): prefixes, session, trusted, untrusted, BuildAppOptions, ProcessScanContext, HostRequest, HOST_PROCESSES_INTERVAL_MS (+9 more)

### Community 98 - "SessionKnowledgeStore"
Cohesion: 0.12
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 99 - "BackgroundTasksDialog.tsx"
Cohesion: 0.11
Nodes (28): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+20 more)

### Community 100 - "controls.tsx"
Cohesion: 0.12
Nodes (31): shortcutKeys(), readStoredShortcuts(), AppShortcutBinding, binding(), bindingLabel(), capturableCode(), capturableCodes, isModifierCode() (+23 more)

### Community 101 - "session-prefetch.ts"
Cohesion: 0.10
Nodes (23): browserConnection, ConnectionHints, connectionSparesData(), IdleScheduler, PASSIVE_READS_SINCE, PREFETCH_PASS_BYTES, PREFETCH_SIDEBAR_ROWS, readsPassively() (+15 more)

### Community 102 - ".takeInTranscript"
Cohesion: 0.11
Nodes (9): createStatusTracker(), foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), messagesFromHistory(), recoveredPermissionTitle(), statusFromEvents(), StatusTracker (+1 more)

### Community 103 - "session-category-routes.test.ts"
Cohesion: 0.07
Nodes (23): createSchema, deleteSchema, keys(), listedInSessionOrder(), moveSchema, name, paramsSchema, parse() (+15 more)

### Community 104 - "settings-profile-store.ts"
Cohesion: 0.11
Nodes (22): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileStore, directories, store() (+14 more)

### Community 105 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (29): activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem(), digest() (+21 more)

### Community 106 - "node:fs/promises"
Cohesion: 0.07
Nodes (22): root, script, question(), execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand() (+14 more)

### Community 107 - "session-patch-browser.ts"
Cohesion: 0.11
Nodes (29): pageFor(), advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading() (+21 more)

### Community 108 - "agent-service-event-projection.test.ts"
Cohesion: 0.10
Nodes (24): at(), directories, finish(), launch(), projected(), services, sessionLog(), syncSessionTranscript() (+16 more)

### Community 109 - "closed-sessions.ts"
Cohesion: 0.09
Nodes (18): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, blockParents, CLOSED_SESSION_RETENTION_MS, closedCapitals(), closedSessionContext() (+10 more)

### Community 110 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 111 - "parakeet-worker.ts"
Cohesion: 0.09
Nodes (20): ChildHandle, DecodeRequest, PARAKEET_MAX_WINDOW_SECONDS, ParakeetChildProcess, ParakeetDecodeOptions, ParakeetTimeoutError, ParakeetWorkerDependencies, ParakeetWorkerOptions (+12 more)

### Community 112 - "session-launcher.ts"
Cohesion: 0.09
Nodes (14): delay(), requireFolderTrust(), sameFolder(), SessionFolderTrustPolicy, SessionLaunch, SessionLauncher, SessionLauncherHost, SessionLauncherOptions (+6 more)

### Community 113 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (27): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+19 more)

### Community 114 - "ManagerClientDefaults"
Cohesion: 0.11
Nodes (15): ManagerClientDefaults, VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState (+7 more)

### Community 115 - "host-telemetry.ts"
Cohesion: 0.09
Nodes (25): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, aggregate (+17 more)

### Community 116 - "SettingsProfileClient"
Cohesion: 0.16
Nodes (7): sameSettingValue(), SettingsProfileSnapshot, errorText(), isRefusal(), samePending(), SettingsProfileClient, SettingsProfileTransport

### Community 117 - "session-store-providers.test.ts"
Cohesion: 0.09
Nodes (11): RuntimeConfigurationError, claude(), clearFixture(), copilot(), disk, event(), fixtures, releases (+3 more)

### Community 118 - "agent-service.test.ts"
Cohesion: 0.13
Nodes (17): terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+9 more)

### Community 119 - "session-reply-durability.test.ts"
Cohesion: 0.12
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 120 - "manager-structured-memory-search.ts"
Cohesion: 0.12
Nodes (24): DreamerMemoryMetadataRecord, authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord() (+16 more)

### Community 121 - "SessionStatus"
Cohesion: 0.09
Nodes (22): Seen, ManagerProactiveInboxObservation, PersistedCursor, NotificationCursor, Row, SdkRestartRecovery, FinishedSession, SessionUnreadTracker (+14 more)

### Community 122 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (15): FakeVoiceEngineCall, apps, config, configFixture(), createManager(), issueTicket(), localRuntime(), otherAllowed (+7 more)

### Community 123 - "ParakeetWorker"
Cohesion: 0.19
Nodes (5): main(), abortError(), errorMessage(), ParakeetUnavailableError, ParakeetWorker

### Community 124 - "transcript-window.ts"
Cohesion: 0.14
Nodes (18): storedTranscript(), count, sessionReadOptions(), transcriptPageQuerySchema, transcriptWindowParam(), windowQuerySchema, carriedBefore(), pageTranscript() (+10 more)

### Community 125 - "oracle-voice-routes.test.ts"
Cohesion: 0.08
Nodes (11): nodeVoiceCapabilities(), openApps, openSockets, RouteManager, RouteVoiceBackend, runtime(), testRoot(), testRoots (+3 more)

### Community 126 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 127 - "session-directory.ts"
Cohesion: 0.18
Nodes (20): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+12 more)

### Community 128 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 129 - "SessionCategoryStore"
Cohesion: 0.19
Nodes (9): categories(), key(), refused(), remember(), SessionCategoryStore, directories, folder(), store() (+1 more)

### Community 130 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 131 - "pipeline.ts"
Cohesion: 0.13
Nodes (23): partlyHeldRenderer(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform(), drawSteps(), growable, htmlBlocks (+15 more)

### Community 132 - "use-markdown-document.ts"
Cohesion: 0.15
Nodes (21): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+13 more)

### Community 133 - "renderer.ts"
Cohesion: 0.11
Nodes (14): render, scope, DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), DocumentRenderer, DocumentRendererContext, RendererWorker (+6 more)

### Community 134 - "manager-routes.ts"
Cohesion: 0.11
Nodes (15): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+7 more)

### Community 135 - "transcript-test-helpers.ts"
Cohesion: 0.16
Nodes (16): contextChangedInEvents(), createPendingUserInputTracker(), foregroundCompletedSince(), isEmptyResponseNotice(), pendingUserInputFromEvents(), runtimeInfoFromEvents(), RuntimeTracker, SessionEventProjection (+8 more)

### Community 136 - "DreamerProgress"
Cohesion: 0.16
Nodes (6): DreamerProgress, keyOf(), notOlder(), setup(), timeOf(), withTimeout()

### Community 137 - "ActivityRow.test.tsx"
Cohesion: 0.15
Nodes (18): toolCallIdFromActivityId(), ActivityStatus, activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), compactActivityText() (+10 more)

### Community 138 - "session-transcript.ts"
Cohesion: 0.14
Nodes (20): TRANSCRIPT_CARRIED_LIMIT, sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+12 more)

### Community 139 - "use-session-knowledge-root.ts"
Cohesion: 0.13
Nodes (16): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base (+8 more)

### Community 140 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 141 - ".observe"
Cohesion: 0.14
Nodes (11): cloneState(), isDisposition(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId() (+3 more)

### Community 142 - "manager-uploads.ts"
Cohesion: 0.16
Nodes (13): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+5 more)

### Community 143 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (20): NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+12 more)

### Community 144 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 145 - "oracle-voice-assets.test.ts"
Cohesion: 0.14
Nodes (20): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+12 more)

### Community 146 - "transport.test.ts"
Cohesion: 0.13
Nodes (13): registerHostTelemetryRoutes(), HOST_TELEMETRY_MAX_QUEUE_BYTES, HOST_TELEMETRY_MAX_QUEUE_MESSAGES, HOST_TELEMETRY_SEND_TIMEOUT_MS, HostSocket, HostTelemetrySocket, readingFixture(), empty (+5 more)

### Community 147 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.13
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 148 - "markdown-navigation.ts"
Cohesion: 0.17
Nodes (21): MarkdownImage(), BreadcrumbSegment, breadcrumbSegments(), DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource() (+13 more)

### Community 149 - "vite.config.ts"
Cohesion: 0.12
Nodes (12): brotliAsync, compress(), gzipAsync, precompressDirectory(), PrecompressedFile, directories, canaryTests, oracleVoiceAssetNames (+4 more)

### Community 150 - "ManagerStructuredMemoryStore"
Cohesion: 0.26
Nodes (5): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState

### Community 151 - "manager-tools.ts"
Cohesion: 0.09
Nodes (21): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, computerField, ContextTier, CreationRefusal, DECLINE_WORDS, describeField() (+13 more)

### Community 152 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 153 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 154 - "ActivityDetails.tsx"
Cohesion: 0.18
Nodes (18): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, TOOL_CALL_ID_PATTERN, activityDetailFailure, detailKey(), formatBytes(), keep(), kept, keptActivityDetail() (+10 more)

### Community 155 - "SessionOriginBadge.test.tsx"
Cohesion: 0.18
Nodes (11): ClientFeature, railEntries(), PreviewFeaturesContext, initials(), useDisplayName(), DisplayNameSetting(), ShellNavigation(), sessionOriginDescription() (+3 more)

### Community 156 - "BackgroundTaskSnapshot"
Cohesion: 0.15
Nodes (9): WorkspaceFixtureOptions, backgroundTaskNotFound(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), listedBackgroundTask(), taskFingerprint() (+1 more)

### Community 157 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 158 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 159 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 160 - "normalizeKnowledgeRelativePath"
Cohesion: 0.21
Nodes (16): knowledgeFileSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot() (+8 more)

### Community 162 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 163 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 164 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (16): assertOpenedFilePath(), fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath() (+8 more)

### Community 165 - "DialogFrame.tsx"
Cohesion: 0.16
Nodes (13): changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame(), subscribeHubSignIn() (+5 more)

### Community 166 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 167 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 168 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 169 - "oracle-status.test.ts"
Cohesion: 0.18
Nodes (15): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+7 more)

### Community 170 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 171 - "ScheduleProposalCards.tsx"
Cohesion: 0.22
Nodes (16): getSchedule(), listScheduleProposals(), resolveScheduleProposal(), days, labels, proposalChanges(), proposalConsequence(), proposalSchedule (+8 more)

### Community 172 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 173 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (13): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+5 more)

### Community 174 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 175 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 176 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 177 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 178 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (15): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+7 more)

### Community 181 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 182 - "SkillSettingsService"
Cohesion: 0.23
Nodes (8): readBounded(), revision(), applications, directories, fixture(), settingsObject(), SkillSettingsError, SkillSettingsService

### Community 183 - "RuntimeStatus.tsx"
Cohesion: 0.27
Nodes (9): families, modelFamily, shortModelName(), repositoryModels, RuntimeStatus(), session, glyphs, ModelFamilyIcon() (+1 more)

### Community 184 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 185 - "registerSessionKnowledgeRoutes"
Cohesion: 0.29
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 186 - "session-knowledge-routes.ts"
Cohesion: 0.13
Nodes (10): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema, SessionKnowledgeLifecycle (+2 more)

### Community 187 - "server/skill-settings.ts"
Cohesion: 0.24
Nodes (11): builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills(), Token (+3 more)

### Community 188 - "shared/skill-settings.ts"
Cohesion: 0.23
Nodes (9): registerSkillSettingsRoutes(), SkillSettingsTarget, SKILL_SETTINGS_CAPABILITY, skillFrontmatterNameSchema, skillNameSchema, skillSettingsSchema, SkillSettingsSnapshot, SkillToggle (+1 more)

### Community 189 - "use-oracle-attachments.ts"
Cohesion: 0.26
Nodes (13): uploadManagerFile(), attachmentSize(), OracleAttachmentChips(), OracleMessageAttachments(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments() (+5 more)

### Community 190 - "settings-profile.test.ts"
Cohesion: 0.20
Nodes (4): settingsProfileCacheKey, cached(), FakeHub, MemoryStorage

### Community 191 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 192 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 193 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 194 - "background-task-stop.test.ts"
Cohesion: 0.25
Nodes (11): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started(), stopAcknowledgement() (+3 more)

### Community 195 - "session-resource-clear.test.ts"
Cohesion: 0.15
Nodes (13): ClaudeSdk, apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed() (+5 more)

### Community 196 - "parakeet-transcription.ts"
Cohesion: 0.22
Nodes (9): joinChunkTexts(), meanSquare(), PARAKEET_TRANSCRIPTION_TIMEOUT_MS, pcm16WavToFloat32(), splitForDecode(), directories, wave(), wavFile() (+1 more)

### Community 197 - "response-compression.test.ts"
Cohesion: 0.15
Nodes (11): apps, directories, hookApp(), jsonText(), largeCall, largeCallOutput, largeFile, runtime() (+3 more)

### Community 199 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 200 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 201 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 202 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 203 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 204 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 205 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 206 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 207 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 208 - "command-catalog-cache.test.ts"
Cohesion: 0.25
Nodes (9): at(), Catalog, deferred(), fixture(), fixtures, listed(), releases, runtime() (+1 more)

### Community 209 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 212 - "tmux-errors.test.ts"
Cohesion: 0.24
Nodes (9): containedServer(), directories, errno(), { execute }, files, links, listener(), places() (+1 more)

### Community 213 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 214 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 215 - "claude-recovery-admission.test.ts"
Cohesion: 0.27
Nodes (8): connect(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite(), releases

### Community 216 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 217 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 218 - "history-projection.test.ts"
Cohesion: 0.31
Nodes (7): eventsFor(), groupedEventsFor(), ModelMessage, questionEventsFor(), random(), seedOffset, terminalTypes

### Community 219 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 220 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.31
Nodes (6): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult

### Community 221 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 222 - "response-compression.ts"
Cohesion: 0.42
Nodes (8): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), varyOnAcceptEncoding()

### Community 223 - "session-store-durability.test.ts"
Cohesion: 0.31
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 224 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 225 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 226 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 227 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 228 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 230 - "session-list-collisions.test.ts"
Cohesion: 0.32
Nodes (4): kind(), sessionListCollisions(), Args, layout

### Community 231 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 233 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 234 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 235 - "refusal-metrics-routes.test.ts"
Cohesion: 0.33
Nodes (4): directories, runtimes, start(), trusted

### Community 236 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 237 - "manager-structured-memory-intent.ts"
Cohesion: 0.50
Nodes (3): hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 238 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1550 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1545 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2620 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `CopilotClientLike`, `CopilotSessionLike`, `SessionDetail`, `.takeInTranscript`, `contracts.ts`, `agent-service.ts`, `ClaudeAgentService`, `UserInputReplyInput`, `transcript-window.ts`, `claude-agent-service.ts`, `session-store-providers.test.ts`, `agent-service.test.ts`, `recovery-resend-durability.test.ts`, `BackgroundTaskSnapshot`, `session-directory.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `.takeInTranscript`, `contracts.ts`, `ClaudeAgentService`, `UserInputReplyInput`, `manager-uploads.ts`, `transcript-window.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `AgentService`, `SessionDetail`, `contracts.ts`, `ProviderSessionService`, `ManagedSession`, `claude-agent-service.ts`, `ChatMessage`, `RemoteNodeClient`, `transcript-window.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `AppWorkspace()` (e.g. with `submitMessage()` and `prefersLightNow()`) actually correct?**
  _`AppWorkspace()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1550 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.035595238095238096 - nodes in this community are weakly interconnected._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.026663434735183615 - nodes in this community are weakly interconnected._
## Non-code inventory (not semantically extracted)

- `.github/CODEOWNERS`
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
- `e2e/ui-locks.pw.ts-snapshots/desktop-session-categories-chromium-linux.png`
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
- `e2e/ui-locks.pw.ts-snapshots/foldable-session-categories-chromium-linux.png`
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
- `e2e/ui-locks.pw.ts-snapshots/phone-session-categories-chromium-linux.png`
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
