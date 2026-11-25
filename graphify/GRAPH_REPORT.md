# Agentic Remote - Graphify code map

Snapshot: `57d74fb15a48b263c69bdea0dc5fd11052ad8aa772a897bd7382a53ca1ed3827`

Source checkout: `cadfc5407ba0fcf61872bfb7e9cbf7d73bba4d55`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 666 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 666 files · ~1,183,577 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9307 nodes · 26876 edges · 288 communities (229 shown, 41 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1336 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AppWorkspace
- AgentService
- api.ts
- contracts.ts
- SessionDetail
- SessionStore
- react
- session-presentation.ts
- terminal-session.ts
- App.tsx
- claude-agent-service.ts
- client.ts
- schedules.ts
- agent-service.ts
- app.ts
- ManagedSession
- session-directory.ts
- manager-tools.ts
- VoiceCapture
- OracleVoiceCoordinator
- RemoteNodeClient
- agentic-remote-promotion-monitor
- KnowledgeStore
- workspace-fixtures.test.ts
- hub-routes.ts
- ManagerAgent
- workspace-fixtures.ts
- ManagerStore
- oracle-voice.ts
- SessionService
- oracle-voice-soak.ts
- CopilotSessionLike
- CopilotClientLike
- oracle-task-store.ts
- oracle-voice-integration.test.ts
- ManagerMessage
- manager-agent.ts
- HubEvent
- node-routes.ts
- session-store.ts
- TmuxTerminalSessionController
- .get
- DreamerService
- ProviderSessionService
- manager-structured-memory-validation.ts
- tmux-test-helpers.ts
- schedule-recurrence.ts
- sampler.ts
- session-knowledge-store.ts
- oracle-voice-worker.ts
- ui-scenes.ts
- EnabledOracleVoiceConfig
- background-task-adapter.ts
- ScheduleRun
- oracle-voice-benchmark.ts
- notification-classifier.ts
- fake-voice.ts
- dreamer-store.ts
- FakeVoiceEngine
- OracleDreamer.tsx
- ManagerAssistant.tsx
- transcript-window.ts
- agentic-remote
- send-matrix.integration.test.ts
- oracle-voice-session.ts
- session-knowledge-routes.test.ts
- normalizeKnowledgeRelativePath
- ComposerActions.tsx
- active-sessions.ts
- BackgroundTaskSnapshot
- dreamer-progress.ts
- agentic-remote-gate
- transcript-test-helpers.ts
- dreamer-service.ts
- SchedulerStore
- composer-state.ts
- bundle
- processes.ts
- oracle-voice-routes.ts
- ResidentVoiceWorker
- UserInputReplyInput
- agent-service-event-projection.test.ts
- VoicePlayback
- DreamerStore
- shell.ts
- lib.rs
- manager.ts
- oracle-voice-child.ts
- ScheduleForm.tsx
- client.test.ts
- agentic-remote-promotion-setup
- FakeSessionService
- oracle-voice-security.test.ts
- devDependencies
- config.rs
- shared/settings-profile.ts
- feature-flags.ts
- terminal-session.test.ts
- .takeInTranscript
- manager-proactive-inbox.ts
- terminal-startup-queue.test.ts
- manager-context.ts
- oracle-voice-child.test.ts
- BackgroundTasksDialog.tsx
- session-prefetch.ts
- oracle-voice-routes.test.ts
- VoiceAudioFrame
- controls.tsx
- service.ts
- closed-sessions.ts
- manager-structured-memory.ts
- SettingsProfileClient
- oracle-voice-segments.ts
- VoiceClientControl
- SessionOrderStore
- session-launcher.ts
- ManagerAssistant.test.tsx
- DialogFrame.tsx
- session-patch-browser.ts
- ManagerAttachment
- use-markdown-document.ts
- recovery-resend-durability.test.ts
- manager-proactive-coordinator.ts
- SessionStatus
- ManagerStructuredMemoryStore
- use-markdown-document.test.tsx
- capture-workspace.ts
- check-workspace-review-regressions.ts
- cli-canary.ts
- scripts
- agent-service.test.ts
- manager-structured-memory-search.ts
- isTerminalComposerFooter
- knowledge-tree.ts
- HostMonitorView.test.tsx
- session-response-order.ts
- compilerOptions
- oracle-voice-config.ts
- settings-profile.test.ts
- transcription-service.ts
- transport.test.ts
- PromptCards.tsx
- vite.config.ts
- delegated-transcription-service.ts
- ManagerProactiveInbox
- oracle-voice-tickets.ts
- session-patches.test.ts
- session-store-providers.test.ts
- ActivityDetails.tsx
- host-telemetry.ts
- src/settings-profile.ts
- compilerOptions
- full-gate.test.ts
- .toolHost
- .observe
- session-reply-durability.test.ts
- markdown-navigation.ts
- oracle-status.test.ts
- terminal-form-deadline.test.ts
- compilerOptions
- OnlineRecognizer
- pipeline.ts
- MessageTime.tsx
- compilerOptions
- settings-profile-store.ts
- compilerOptions
- ManagerMemory
- .correct
- dreamer-schedule.ts
- promotion-monitor.test.ts
- schedule-notification-service.test.ts
- BoundedQueue
- ReaderWorkspace
- scripts
- session-latency-benchmark.ts
- file-upload-routes.ts
- SoakManager
- HostTelemetrySampler
- session-resource-routes.test.ts
- capture-workbench-review.ts
- package.json
- VoiceEngineEvent
- oracle-voice-assets.test.ts
- SessionAdmissions
- fake-vad.ts
- desktop.json
- DeferredSession
- ChatMessage
- LargeSessionService
- TranscriptionError
- ActivityRow.tsx
- manager-automatic.ts
- theme-contrast.test.ts
- ShellNavigation.test.tsx
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- dreamer-service.test.ts
- startup-phases.ts
- recently-closed.pw.ts
- copilot-sdk-client.ts
- dreamer-routes.ts
- manager-proactive-inbox.test.ts
- recovery-seed-guards.test.ts
- ActivityRow.test.tsx
- html-preview.ts
- sign-in-expired.pw.ts
- command-catalog-cache.test.ts
- session-scope.ts
- server/side-question.ts
- tmux-errors.test.ts
- use-oracle-attachments.ts
- dataset
- generate-pwa-icons.ts
- agent-service-recovery.test.ts
- bridge.rs
- dependencies
- logs-cli.test.ts
- ManagerProactiveInboxValidationError
- promotion-setup-execution.test.ts
- response-compression.ts
- SkillsSettings.tsx
- sent-message.ts
- pipeline.test.tsx
- app-provenance.test.ts
- doctor-cli.test.ts
- release-publication.test.ts
- UserInputFieldControl
- composer-layout.test.ts
- HostTelemetryClock
- settings.ts
- DocumentViewControls.tsx
- use-foreground-handoff.ts
- worker-handler.ts
- promotion-setup.test.ts
- FakeRecorder
- .discoverTerminalSessions
- MockMediaRecorder
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- @dnd-kit/core
- @dnd-kit/sortable
- @dnd-kit/utilities
- fastify
- @fastify/multipart
- @fastify/static
- @fastify/websocket
- ffmpeg-static
- ffprobe-static
- html-url-attributes
- lucide-react
- onnxruntime-web
- mermaid
- pdfjs-dist
- react
- react-dom
- remark-gfm
- remark-parse
- remark-rehype
- @ricky0123/vad-web
- sherpa-onnx-node
- unified
- unist-util-visit
- web-push
- ws
- zod
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `AppWorkspace()` - 354 edges
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

## Communities (288 total, 41 thin omitted)

### Community 0 - "AppWorkspace"
Cohesion: 0.02
Nodes (188): terminalSendOptions(), sessionFileValidationError(), SettingsChange, SettingsProfileKey, submissionReceiptFromError(), listClosedSessions(), replyPermission(), saveHiddenSessionVisibility() (+180 more)

### Community 1 - "AgentService"
Cohesion: 0.04
Nodes (9): AgentService, isTerminalNotReadyRefusal(), sessionInUseConflictMessage(), terminalAnswerRefused(), recoverAndSeed(), queueConflict(), isRetainedRefusal(), hasRunningBackgroundAgent() (+1 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (148): parseSubmissionReceipt(), activityArgumentFormats, activityDetailStatuses, activityKinds, addComputer(), addKnowledgeRoot(), askSession(), bootstrapSessionOrder() (+140 more)

### Community 3 - "contracts.ts"
Cohesion: 0.03
Nodes (96): activityDetailsUnavailable(), activityNotInLog(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), readBackgroundTaskFrom(), ClaudeAgentServiceEvents, RemoteSessionListing (+88 more)

### Community 4 - "SessionDetail"
Cohesion: 0.04
Nodes (28): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+20 more)

### Community 5 - "SessionStore"
Cohesion: 0.04
Nodes (46): fixture(), restart(), connect(), createStore(), enqueue(), fixture(), recoveryFixture(), storeAt() (+38 more)

### Community 6 - "react"
Cohesion: 0.04
Nodes (86): react, AppVersion, parseAppVersion(), RuntimeModelOption, HubHealth, AppearanceSetting, NewSessionBackendSetting, activateSession() (+78 more)

### Community 7 - "session-presentation.ts"
Cohesion: 0.03
Nodes (88): CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), SessionProvenance, handleDragEnd(), KnowledgeRootSelector(), root, readScheduleLink(), ScheduleLink (+80 more)

### Community 8 - "terminal-session.ts"
Cohesion: 0.05
Nodes (100): terminalComposerUnreadable(), activeBottomFrame(), afterExit(), backgroundShellsAllow(), busyRowStatus(), captureBeforeDeadline(), captureForReplacement(), capturePane() (+92 more)

### Community 9 - "App.tsx"
Cohesion: 0.03
Nodes (81): hasActiveBackgroundTasks(), hasForegroundTurn(), isManagerEvent(), TRANSCRIPT_WINDOW, executeCommand(), ActivityRowStates, moveSessionToBrowsedFolder(), browserStorage() (+73 more)

### Community 10 - "claude-agent-service.ts"
Cohesion: 0.05
Nodes (73): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, ClaudeSdk, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+65 more)

### Community 11 - "client.ts"
Cohesion: 0.05
Nodes (36): ManagerClientDefaults, ORACLE_VOICE_CONNECTION_TIMEOUT_MS, VoiceServerControl, captureClientError(), clientError(), closeError(), closeReason(), isCapabilities() (+28 more)

### Community 12 - "schedules.ts"
Cohesion: 0.04
Nodes (78): JournalRecorderOptions, recordScheduleProposals(), Seen, sessionTask(), proposalInput, classifyScheduleNotification(), LaunchPrimitives, recordScheduleProvenance() (+70 more)

### Community 13 - "agent-service.ts"
Cohesion: 0.04
Nodes (91): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+83 more)

### Community 14 - "app.ts"
Cohesion: 0.04
Nodes (62): RFC-9110, buildApp(), BuildAppOptions, errorStatusCode(), directories, runtimes, trusted, hub() (+54 more)

### Community 15 - "ManagedSession"
Cohesion: 0.08
Nodes (15): ComputerManager, managedSession(), sessionAtLeastAsNew(), ManagerEventSource, registerHubRoutes(), ManagerProactiveCoordinatorOptions, FakeManager, SessionLauncherOptions (+7 more)

### Community 16 - "session-directory.ts"
Cohesion: 0.05
Nodes (62): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+54 more)

### Community 17 - "manager-tools.ts"
Cohesion: 0.04
Nodes (45): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+37 more)

### Community 18 - "VoiceCapture"
Cohesion: 0.05
Nodes (28): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), CaptureControl, harness(), validateIdentity() (+20 more)

### Community 19 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (19): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+11 more)

### Community 20 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (30): RemoteResync, RemoteSessionRead, HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers (+22 more)

### Community 21 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 22 - "KnowledgeStore"
Cohesion: 0.05
Nodes (47): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+39 more)

### Community 23 - "workspace-fixtures.test.ts"
Cohesion: 0.05
Nodes (40): WorkspaceFixtureOptions, enableSchedulerTools(), center(), directories, directory(), hub(), now, runtimes (+32 more)

### Community 24 - "hub-routes.ts"
Cohesion: 0.03
Nodes (59): ClientPresence, PRESENCE_TTL_MS, addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+51 more)

### Community 25 - "ManagerAgent"
Cohesion: 0.08
Nodes (13): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+5 more)

### Community 26 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (43): desktop, devices, long, open(), phone, veryLong, devices, markedState() (+35 more)

### Community 27 - "ManagerStore"
Cohesion: 0.06
Nodes (22): openStore(), JournalRecorder, SessionLifecycle, ManagerProactiveInboxObservation, applySessionReplacement(), emptyState(), JournalDraft, JournalEntry (+14 more)

### Community 28 - "oracle-voice.ts"
Cohesion: 0.05
Nodes (53): apps, directories, playbackSequence(), createVoiceBackendSession(), DEFAULT_VOICE_BACKEND_LIMITS, beginUtterance(), config, control() (+45 more)

### Community 29 - "SessionService"
Cohesion: 0.05
Nodes (17): registerNodeRoutes(), apps, directories, hookApp(), jsonText(), largeCall, largeCallOutput, largeFile (+9 more)

### Community 30 - "oracle-voice-soak.ts"
Cohesion: 0.06
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, delay(), errorText(), GatedStartupRaceObservation, LifecycleCycleObservation (+26 more)

### Community 31 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (35): CopilotSessionLike, CopilotTasksApi, nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused() (+27 more)

### Community 32 - "CopilotClientLike"
Cohesion: 0.04
Nodes (47): root, script, complete(), event(), sessionWithLog(), start(), CopilotClientLike, deferred() (+39 more)

### Community 33 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (45): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+37 more)

### Community 34 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+24 more)

### Community 35 - "ManagerMessage"
Cohesion: 0.05
Nodes (24): FakeManager, FakeVoiceState, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent (+16 more)

### Community 36 - "manager-agent.ts"
Cohesion: 0.05
Nodes (38): DreamerProgressView, automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession (+30 more)

### Community 37 - "HubEvent"
Cohesion: 0.07
Nodes (23): ComputerManagerEvents, start(), NotificationRecorder, brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy (+15 more)

### Community 38 - "node-routes.ts"
Cohesion: 0.06
Nodes (44): AUDIO_FILENAME_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+36 more)

### Community 39 - "session-store.ts"
Cohesion: 0.04
Nodes (48): boots, [directory, backend, resultPath, phase = 'idle'], fixtureRoot, activityDuration(), activityResultPreview(), archivedMessage(), cloneSessionWindow(), disk (+40 more)

### Community 40 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (19): isSessionScopeLauncher(), sessionLaunchCommand(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, FormReplyDeadlineError, listTmuxSessions() (+11 more)

### Community 41 - ".get"
Cohesion: 0.07
Nodes (7): agentMode(), isRuntimeReasoningEffort(), removeCopilotSessionFiles(), RuntimeConfigurationError, storedProvider(), SideQuestionError, withSideQuestionTimeout()

### Community 42 - "DreamerService"
Cohesion: 0.10
Nodes (14): DreamerMemoryMetadata, boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs() (+6 more)

### Community 43 - "ProviderSessionService"
Cohesion: 0.07
Nodes (4): updateComputerForLaunchIdentity(), owns(), ProviderSessionService, SessionReadOptions

### Community 44 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 45 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (48): foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity(), SocketPlace, UnixSocket (+40 more)

### Community 46 - "schedule-recurrence.ts"
Cohesion: 0.07
Nodes (52): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+44 more)

### Community 47 - "sampler.ts"
Cohesion: 0.08
Nodes (45): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+37 more)

### Community 48 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+22 more)

### Community 49 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (23): benchmarkGroup(), VoiceEndUtterance, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent(), isEnabledConfig() (+15 more)

### Community 50 - "ui-scenes.ts"
Cohesion: 0.06
Nodes (36): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+28 more)

### Community 51 - "EnabledOracleVoiceConfig"
Cohesion: 0.06
Nodes (19): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+11 more)

### Community 52 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (53): addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, copyTask() (+45 more)

### Community 53 - "ScheduleRun"
Cohesion: 0.12
Nodes (8): provenance(), scheduleSessionTitle(), SessionScheduleLauncher, session(), ScheduleLaunchRefusedError, SchedulerDispatcher, registerSchedulerRoutes(), ScheduleRun

### Community 54 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (41): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 55 - "notification-classifier.ts"
Cohesion: 0.08
Nodes (35): HostAlertMonitor, computer, observe(), snapshot(), start, sustained(), attentionClosed(), attentionSeed() (+27 more)

### Community 56 - "fake-voice.ts"
Cohesion: 0.07
Nodes (9): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, installFakeBrowserVoice(), ScriptedUtterance, startFixtureServer() (+1 more)

### Community 57 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (44): DreamerHistoryEntry, assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES (+36 more)

### Community 58 - "FakeVoiceEngine"
Cohesion: 0.06
Nodes (18): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceSttEngine, VoiceTtsEngine, VoiceUtteranceAudioFrame (+10 more)

### Community 59 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (41): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition (+33 more)

### Community 60 - "ManagerAssistant.tsx"
Cohesion: 0.07
Nodes (43): MANAGER_REMOVED_ATTACHMENTS_REASON, editQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), sendManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent() (+35 more)

### Community 61 - "transcript-window.ts"
Cohesion: 0.09
Nodes (25): changedInPlace(), diffMessages(), Publication, sameField(), sameMessage(), sameOrder(), sessionKey(), SessionPublications (+17 more)

### Community 62 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 63 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (43): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+35 more)

### Community 64 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (16): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), QueuedOutput (+8 more)

### Community 65 - "session-knowledge-routes.test.ts"
Cohesion: 0.06
Nodes (26): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+18 more)

### Community 66 - "normalizeKnowledgeRelativePath"
Cohesion: 0.07
Nodes (36): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+28 more)

### Community 67 - "ComposerActions.tsx"
Cohesion: 0.08
Nodes (21): families, modelFamily, shortModelName(), repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions() (+13 more)

### Community 68 - "active-sessions.ts"
Cohesion: 0.08
Nodes (37): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+29 more)

### Community 69 - "BackgroundTaskSnapshot"
Cohesion: 0.07
Nodes (24): backgroundTaskNotFound(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), listedBackgroundTask(), taskFingerprint(), apps (+16 more)

### Community 70 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): mapWithConcurrency(), DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 71 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 72 - "transcript-test-helpers.ts"
Cohesion: 0.09
Nodes (27): contextChangedInEvents(), createPendingUserInputTracker(), foregroundCompletedSince(), isEmptyResponseNotice(), messagesFromHistory(), pendingUserInputFromEvents(), PendingUserInputTracker, runtimeInfoFromEvents() (+19 more)

### Community 73 - "dreamer-service.ts"
Cohesion: 0.09
Nodes (40): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+32 more)

### Community 74 - "SchedulerStore"
Cohesion: 0.14
Nodes (6): fixture(), failure(), SchedulerStore, ScheduleProposal, Schedule, ScheduleRunStatus

### Community 75 - "composer-state.ts"
Cohesion: 0.10
Nodes (40): composerChanged(), composerPasted(), moveComposerDraft(), persistComposerDrafts(), restoreComposerSubmission(), composerReadFailureMessage(), readComposerDrafts(), readLegacyComposerDrafts() (+32 more)

### Community 76 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 77 - "processes.ts"
Cohesion: 0.09
Nodes (26): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+18 more)

### Community 78 - "oracle-voice-routes.ts"
Cohesion: 0.09
Nodes (35): nodeVoiceCapabilities(), sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes() (+27 more)

### Community 79 - "ResidentVoiceWorker"
Cohesion: 0.12
Nodes (10): combinedTranscript(), matchesCancelled(), pcm16ToFloat32(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceGenerationIdentity, VoiceSynthesisRequest (+2 more)

### Community 80 - "UserInputReplyInput"
Cohesion: 0.09
Nodes (5): isUncertainDelivery(), persistedFormAnswer(), TerminalSessionController, UserInputReplyInput, deliveryUncertaintyFromError()

### Community 81 - "agent-service-event-projection.test.ts"
Cohesion: 0.08
Nodes (33): at(), directories, finish(), launch(), projected(), services, sessionLog(), syncSessionTranscript() (+25 more)

### Community 82 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 83 - "DreamerStore"
Cohesion: 0.14
Nodes (10): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, isMissing(), publicPlan() (+2 more)

### Community 84 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 85 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 86 - "manager.ts"
Cohesion: 0.07
Nodes (15): automaticTurns(), event(), ProactiveManager, directories, FakeAgent, fixture(), managed(), FakeManager (+7 more)

### Community 87 - "oracle-voice-child.ts"
Cohesion: 0.07
Nodes (32): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), float32ToPcm16() (+24 more)

### Community 88 - "ScheduleForm.tsx"
Cohesion: 0.11
Nodes (30): CLAUDE_SCHEDULE_UNAVAILABLE_REASON, scheduleProviderUnavailableReason(), ScheduleTarget, FeatureEvent, listeners, subscribeFeatureEvents(), FolderPicker(), browse() (+22 more)

### Community 89 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 90 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 92 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (21): VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), connect(), createManager(), Inbox (+13 more)

### Community 93 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 94 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 95 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (33): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+25 more)

### Community 96 - "feature-flags.ts"
Cohesion: 0.14
Nodes (27): defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable(), parseFeatureFlag(), PreviewFeature (+19 more)

### Community 97 - "terminal-session.test.ts"
Cohesion: 0.07
Nodes (30): message(), sendLikeTheApp(), isTerminalSessionInUsePrompt(), isTerminalVisiblyIdle(), parseTerminalUpdateNotice(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane (+22 more)

### Community 98 - ".takeInTranscript"
Cohesion: 0.12
Nodes (6): foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), markGeneratedPrompt(), TranscriptObservation

### Community 99 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (35): assertExactKeys(), canonicalHash(), DISPOSITIONS, eventId(), hasExactKeys(), isDisposition(), isEventKind(), isId() (+27 more)

### Community 100 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (24): findActiveCopilotSessions(), startAgentAfterClear(), exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec (+16 more)

### Community 101 - "manager-context.ts"
Cohesion: 0.12
Nodes (28): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+20 more)

### Community 102 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 103 - "BackgroundTasksDialog.tsx"
Cohesion: 0.11
Nodes (28): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+20 more)

### Community 104 - "session-prefetch.ts"
Cohesion: 0.10
Nodes (23): browserConnection, ConnectionHints, connectionSparesData(), IdleScheduler, PASSIVE_READS_SINCE, PREFETCH_PASS_BYTES, PREFETCH_SIDEBAR_ROWS, readsPassively() (+15 more)

### Community 105 - "oracle-voice-routes.test.ts"
Cohesion: 0.08
Nodes (17): ActiveBackendSession, exactArrayBuffer(), rawDataBuffer(), receiveNodeVoiceMessage(), ObservedLocalVoiceBackend, openApps, openSockets, RouteManager (+9 more)

### Community 106 - "VoiceAudioFrame"
Cohesion: 0.08
Nodes (17): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, QueuedAudio, capabilities, confirm(), control(), defaults (+9 more)

### Community 107 - "controls.tsx"
Cohesion: 0.12
Nodes (30): shortcutKeys(), readStoredShortcuts(), AppShortcutBinding, binding(), bindingLabel(), capturableCode(), capturableCodes, isModifierCode() (+22 more)

### Community 108 - "service.ts"
Cohesion: 0.10
Nodes (16): prefixes, session, trusted, untrusted, HOST_ALERT_POLL_INTERVAL_MS, HostRequest, HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS (+8 more)

### Community 109 - "closed-sessions.ts"
Cohesion: 0.09
Nodes (19): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, recordClosure(), blockParents, CLOSED_SESSION_RETENTION_MS, closedCapitals() (+11 more)

### Community 110 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (28): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+20 more)

### Community 111 - "SettingsProfileClient"
Cohesion: 0.14
Nodes (9): sameSettingValue(), SettingsProfileSnapshot, errorText(), isRefusal(), newDeviceId(), samePending(), SettingsCacheStorage, SettingsProfileClient (+1 more)

### Community 112 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 113 - "VoiceClientControl"
Cohesion: 0.17
Nodes (15): VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+7 more)

### Community 114 - "SessionOrderStore"
Cohesion: 0.16
Nodes (12): orderStore(), carried(), laneFrom(), retire(), sameLane(), sessionOrderKey(), SessionOrderState, SessionOrderStore (+4 more)

### Community 115 - "session-launcher.ts"
Cohesion: 0.10
Nodes (13): delay(), requireFolderTrust(), sameFolder(), SessionFolderTrustPolicy, SessionLaunch, SessionLauncher, SessionLauncherHost, SessionLaunchPreparationError (+5 more)

### Community 116 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (17): cancelManager(), removeQueuedManagerMessage(), retryManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+9 more)

### Community 117 - "DialogFrame.tsx"
Cohesion: 0.12
Nodes (21): changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame(), publishFeatureEvent() (+13 more)

### Community 118 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 119 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 120 - "use-markdown-document.ts"
Cohesion: 0.14
Nodes (22): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+14 more)

### Community 121 - "recovery-resend-durability.test.ts"
Cohesion: 0.09
Nodes (20): directories, fakeClient(), fixture(), ForkRequest, forkSession(), services, directories, disk (+12 more)

### Community 122 - "manager-proactive-coordinator.ts"
Cohesion: 0.18
Nodes (6): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveOutcome

### Community 123 - "SessionStatus"
Cohesion: 0.10
Nodes (21): PersistedCursor, NotificationCursor, Row, SdkRestartRecovery, FinishedSession, SessionUnreadTracker, finished(), SessionExecutionMode (+13 more)

### Community 124 - "ManagerStructuredMemoryStore"
Cohesion: 0.13
Nodes (10): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open() (+2 more)

### Community 125 - "use-markdown-document.test.tsx"
Cohesion: 0.11
Nodes (12): DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), defaultDocumentRenderer(), DocumentRenderer, DocumentRendererContext, RendererWorker, synchronousRenderer (+4 more)

### Community 126 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 127 - "check-workspace-review-regressions.ts"
Cohesion: 0.08
Nodes (14): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+6 more)

### Community 128 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 129 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 130 - "agent-service.test.ts"
Cohesion: 0.14
Nodes (17): terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+9 more)

### Community 131 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 132 - "isTerminalComposerFooter"
Cohesion: 0.10
Nodes (22): composer(), processAdapter, boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame() (+14 more)

### Community 133 - "knowledge-tree.ts"
Cohesion: 0.14
Nodes (23): WorkspaceEntry, cancelKnowledgeRestore(), collapseKnowledgeTree(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder(), openKnowledgeFolder(), refreshKnowledgeFolder() (+15 more)

### Community 134 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 135 - "session-response-order.ts"
Cohesion: 0.15
Nodes (19): TRANSCRIPT_CARRIED_LIMIT, sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+11 more)

### Community 136 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 137 - "oracle-voice-config.ts"
Cohesion: 0.15
Nodes (20): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+12 more)

### Community 138 - "settings-profile.test.ts"
Cohesion: 0.13
Nodes (11): applySettingsChanges(), applySettingsImport(), SettingsRequestError, sizeChecked(), validateSettingsImport(), seedHubSettings(), hub(), settingsProfileCacheKey (+3 more)

### Community 139 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 140 - "transport.test.ts"
Cohesion: 0.13
Nodes (13): registerHostTelemetryRoutes(), HOST_TELEMETRY_MAX_QUEUE_BYTES, HOST_TELEMETRY_MAX_QUEUE_MESSAGES, HOST_TELEMETRY_SEND_TIMEOUT_MS, HostSocket, HostTelemetrySocket, readingFixture(), empty (+5 more)

### Community 141 - "PromptCards.tsx"
Cohesion: 0.13
Nodes (16): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+8 more)

### Community 142 - "vite.config.ts"
Cohesion: 0.12
Nodes (12): brotliAsync, compress(), gzipAsync, precompressDirectory(), PrecompressedFile, directories, canaryTests, oracleVoiceAssetNames (+4 more)

### Community 143 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (11): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+3 more)

### Community 144 - "ManagerProactiveInbox"
Cohesion: 0.20
Nodes (6): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 145 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 146 - "session-patches.test.ts"
Cohesion: 0.17
Nodes (9): Client, Browser, seedOffset, HubResyncRequest, HubTasksResyncRequest, HubWireEvent, applyTaskPatch(), SessionPatchReceiver (+1 more)

### Community 147 - "session-store-providers.test.ts"
Cohesion: 0.10
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 148 - "ActivityDetails.tsx"
Cohesion: 0.18
Nodes (18): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, TOOL_CALL_ID_PATTERN, activityDetailFailure, detailKey(), formatBytes(), keep(), kept, keptActivityDetail() (+10 more)

### Community 149 - "host-telemetry.ts"
Cohesion: 0.13
Nodes (19): aggregate, DiskSpaceSchema, HOST_TELEMETRY_CAPABILITY_VERSION, HOST_TELEMETRY_INVALID_CLOSE_CODE, HostHistorySchema, HostInfoSchema, HostMetricAggregate, HostMetricAggregateSchema (+11 more)

### Community 150 - "src/settings-profile.ts"
Cohesion: 0.13
Nodes (18): NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+10 more)

### Community 151 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 152 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 154 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 155 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 156 - "markdown-navigation.ts"
Cohesion: 0.18
Nodes (19): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+11 more)

### Community 157 - "oracle-status.test.ts"
Cohesion: 0.17
Nodes (16): oracleHostStatusFixture(), bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes() (+8 more)

### Community 158 - "terminal-form-deadline.test.ts"
Cohesion: 0.12
Nodes (15): TerminalFormContinuation, question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture() (+7 more)

### Community 159 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 160 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 161 - "pipeline.ts"
Cohesion: 0.17
Nodes (19): openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform() (+11 more)

### Community 162 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 163 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 164 - "settings-profile-store.ts"
Cohesion: 0.18
Nodes (10): WorkspaceFixtureState, profileStore(), SettingsProfileState, SettingsProfileStore, directories, store(), isSettingsDeviceId(), isSettingsProfileKey() (+2 more)

### Community 165 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 166 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 167 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 168 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 169 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 170 - "schedule-notification-service.test.ts"
Cohesion: 0.20
Nodes (5): ScheduleNotificationService, input(), now, run(), ScheduleRunNotification

### Community 171 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 172 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 173 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 174 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 175 - "file-upload-routes.ts"
Cohesion: 0.19
Nodes (9): FileUploadError, registerFileUploadRoutes(), SessionParams, registerTranscriptionRoutes(), transcriptionMultipartOptions, extension(), MAX_SESSION_FILE_BYTES, supportedExtensions (+1 more)

### Community 178 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 179 - "capture-workbench-review.ts"
Cohesion: 0.14
Nodes (11): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, fixtureKnowledgeRoots (+3 more)

### Community 180 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 181 - "VoiceEngineEvent"
Cohesion: 0.18
Nodes (7): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, VoiceEngineEvent

### Community 182 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 183 - "SessionAdmissions"
Cohesion: 0.17
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 184 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 185 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 186 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 187 - "ChatMessage"
Cohesion: 0.18
Nodes (10): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, ChatMessage, TranscriptWindow (+2 more)

### Community 189 - "TranscriptionError"
Cohesion: 0.26
Nodes (4): LocalTranscriptionService, sha256(), fixture(), TranscriptionError

### Community 190 - "ActivityRow.tsx"
Cohesion: 0.33
Nodes (11): toolCallIdFromActivityId(), activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), compactActivityText(), formatActivityDuration() (+3 more)

### Community 191 - "manager-automatic.ts"
Cohesion: 0.22
Nodes (11): formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed, finished, AutomaticTurn (+3 more)

### Community 192 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 193 - "ShellNavigation.test.tsx"
Cohesion: 0.32
Nodes (7): ClientFeature, railEntries(), usePreviewFeatures(), initials(), useDisplayName(), DisplayNameSetting(), ShellNavigation()

### Community 194 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 195 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 196 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 197 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 198 - "startup-phases.ts"
Cohesion: 0.19
Nodes (4): silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhases

### Community 199 - "recently-closed.pw.ts"
Cohesion: 0.23
Nodes (9): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), open(), row() (+1 more)

### Community 200 - "copilot-sdk-client.ts"
Cohesion: 0.29
Nodes (9): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkMissingSessionRetirement, CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic() (+1 more)

### Community 201 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 202 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 203 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 204 - "ActivityRow.test.tsx"
Cohesion: 0.20
Nodes (7): ActivityStatus, ActivityRow, bashDetail(), output, raw, runningDetail(), text()

### Community 205 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 206 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 207 - "command-catalog-cache.test.ts"
Cohesion: 0.25
Nodes (9): at(), Catalog, deferred(), fixture(), fixtures, listed(), releases, runtime() (+1 more)

### Community 208 - "session-scope.ts"
Cohesion: 0.20
Nodes (7): execFileAsync, ProbeRun, SESSION_SCOPE, sessionScopeAvailable, sessionScopeProbe(), adapter, scope

### Community 209 - "server/side-question.ts"
Cohesion: 0.27
Nodes (8): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), sideQuestionPrompt(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH, SIDE_QUESTION_EARLIER_LIMIT, SIDE_QUESTION_MAX_LENGTH

### Community 210 - "tmux-errors.test.ts"
Cohesion: 0.24
Nodes (9): containedServer(), directories, errno(), { execute }, files, links, listener(), places() (+1 more)

### Community 211 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 212 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 213 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 214 - "agent-service-recovery.test.ts"
Cohesion: 0.22
Nodes (6): holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents()

### Community 215 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 216 - "dependencies"
Cohesion: 0.22
Nodes (9): @anthropic-ai/claude-agent-sdk, @github/copilot-sdk, hast-util-to-jsx-runtime, dependencies, @anthropic-ai/claude-agent-sdk, @github/copilot-sdk, hast-util-to-jsx-runtime, react-markdown (+1 more)

### Community 217 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 218 - "ManagerProactiveInboxValidationError"
Cohesion: 0.28
Nodes (6): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions()

### Community 219 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 220 - "response-compression.ts"
Cohesion: 0.42
Nodes (8): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), varyOnAcceptEncoding()

### Community 221 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 222 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 223 - "pipeline.test.tsx"
Cohesion: 0.28
Nodes (6): components, drawn(), drawnPage(), fixtures, html(), today()

### Community 224 - "app-provenance.test.ts"
Cohesion: 0.36
Nodes (7): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets

### Community 225 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 226 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 227 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 228 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 230 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 231 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 232 - "use-foreground-handoff.ts"
Cohesion: 0.47
Nodes (3): foregroundHandoffTimeoutMs, Handoff, useForegroundHandoff()

### Community 233 - "worker-handler.ts"
Cohesion: 0.47
Nodes (4): render, scope, handleRenderRequest(), RenderRequest

### Community 234 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1483 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1478 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2489 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `.takeInTranscript`, `contracts.ts`, `SessionDetail`, `SessionStore`, `BackgroundTaskSnapshot`, `.get`, `claude-agent-service.ts`, `.discoverTerminalSessions`, `agent-service.ts`, `UserInputReplyInput`, `session-directory.ts`, `background-task-adapter.ts`, `recovery-resend-durability.test.ts`, `transcript-window.ts`, `CopilotSessionLike`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `cli-canary.ts`, `AgentService`, `SessionDetail`, `SessionStore`, `react`, `oracle-voice-config.ts`, `transcription-service.ts`, `transport.test.ts`, `schedules.ts`, `ManagedSession`, `delegated-transcription-service.ts`, `ManagerProactiveInbox`, `session-directory.ts`, `KnowledgeStore`, `workspace-fixtures.test.ts`, `hub-routes.ts`, `ManagerAgent`, `ManagerStore`, `SessionService`, `oracle-voice-soak.ts`, `oracle-task-store.ts`, `ManagerMessage`, `manager-agent.ts`, `HubEvent`, `node-routes.ts`, `settings-profile-store.ts`, `DreamerService`, `ProviderSessionService`, `schedule-notification-service.test.ts`, `file-upload-routes.ts`, `session-knowledge-store.ts`, `HostTelemetrySampler`, `oracle-voice-worker.ts`, `ScheduleRun`, `notification-classifier.ts`, `TranscriptionError`, `session-knowledge-routes.test.ts`, `dreamer-routes.ts`, `SchedulerStore`, `UserInputReplyInput`, `response-compression.ts`, `feature-flags.ts`, `service.ts`, `SessionOrderStore`, `manager-proactive-coordinator.ts`, `ManagerStructuredMemoryStore`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1483 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.024925373134328358 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.04042303172737955 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.02875816993464052 - nodes in this community are weakly interconnected._
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
