# Agentic Remote - Graphify code map

Snapshot: `a02cfca32aa4b379d044110b5bdef40d0dd83667781a655214f7f48376449f91`

Source checkout: `a65814ff83ed3ab5032fb768fc713ffe445d3791`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 682 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 682 files · ~1,218,215 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9521 nodes · 27508 edges · 276 communities (234 shown, 25 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1351 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AppWorkspace
- api.ts
- AgentService
- SessionStore
- agent-service.ts
- App.tsx
- computer-manager.ts
- session-presentation.ts
- contracts.ts
- ClaudeAgentService
- SessionService
- hub-routes.ts
- sections.tsx
- agent-service.test.ts
- ManagedSession
- client.ts
- schedules.ts
- claude-agent-service.ts
- oracle-voice-soak.ts
- SessionDetail
- OracleVoiceCoordinator
- terminal-session.ts
- HubEvent
- agentic-remote-promotion-monitor
- ManagerStore
- dreamer-store.ts
- manager-tools.ts
- ManagerAgent
- BackgroundTaskSnapshot
- oracle-voice-integration.test.ts
- VoiceCapture
- queued-dispatch.test.ts
- session-store-providers.test.ts
- manager-agent.ts
- fake-voice.ts
- KnowledgeStore
- transcription-service.ts
- oracle-voice-session.ts
- tmux-test-helpers.ts
- oracle-voice.ts
- schedule-recurrence.ts
- ui-locks.pw.ts
- app.ts
- multi-node.test.ts
- dreamer-service.ts
- oracle-task-store.ts
- notification-center.ts
- .sendAdmittedWithBackend
- manager-structured-memory-validation.ts
- terminal-session.test.ts
- oracle-voice-engine.ts
- oracle-voice-worker.ts
- session-directory.ts
- ManagerMessage
- OracleDreamer.tsx
- oracle-voice-benchmark.ts
- DreamerService
- oracle-voice-routes.ts
- SchedulerStore
- TmuxTerminalSessionController
- ScheduleForm.tsx
- background-task-adapter.ts
- oracle-voice-security.test.ts
- agentic-remote
- workspace-fixtures.ts
- ManagerEvent
- ComposerActions.tsx
- NewSessionDialog.tsx
- ScheduleRun
- dreamer-progress.ts
- processes.ts
- server/skill-settings.ts
- feature-flags.ts
- agentic-remote-gate
- bundle
- PushNotificationService
- ResidentVoiceWorker
- FakeSessionService
- oracle-voice-child.ts
- FakeVoiceEngine
- cleanDialogLine
- VoicePlayback
- terminal-startup-queue.test.ts
- shell.ts
- lib.rs
- dependencies
- devDependencies
- client.test.ts
- agentic-remote-promotion-setup
- oracle-voice-config.ts
- ManagerAssistant.tsx
- config.rs
- session-unread.pw.ts
- response-compression.test.ts
- host-telemetry.ts
- BackgroundTasksDialog.tsx
- manager-agent.test.ts
- manager-proactive-inbox.ts
- oracle-voice-child.test.ts
- session-prefetch.ts
- remote-voice-client.ts
- manager-structured-memory.ts
- oracle-voice-routes.test.ts
- session-patch-browser.ts
- shared/settings-profile.ts
- notification-center.integration.test.ts
- oracle-voice-segments.ts
- SessionOrderStore
- setupWorkspaceFixture
- active-sessions.ts
- ChatMessage
- session-launcher.ts
- knowledge-tree.ts
- sampler.ts
- manager-structured-memory-search.ts
- reader.ts
- ManagerAttachment
- session-categories.ts
- tmux-errors.ts
- src/settings-profile.ts
- ManagerAssistant.test.tsx
- startup-phases.test.ts
- session-resource-clear.test.ts
- capture-workspace.ts
- cli-canary.ts
- transport.test.ts
- settings-profile-store.ts
- session-transcript.ts
- scripts
- renderer.ts
- SettingsProfileClient
- use-session-knowledge-root.ts
- ConfigureRuntimeInput
- compilerOptions
- service.ts
- use-markdown-document.ts
- transcript-test-helpers.ts
- ManagerStructuredMemoryStore
- session-category-routes.ts
- markdown-navigation.ts
- vite.config.ts
- RuntimeReasoningEffort
- oracle-voice-tickets.ts
- refusal-metrics.ts
- session-reply-durability.test.ts
- HostMonitorView.test.tsx
- compilerOptions
- transcript-window.ts
- full-gate.test.ts
- SessionCategoryStore
- SessionKnowledgeStore
- ActivityDetails.tsx
- PromptCards.tsx
- pipeline.test.tsx
- compilerOptions
- .toolHost
- ManagerProactiveInbox
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- dreamer-schedule.ts
- promotion-monitor.test.ts
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- session-reorder.pw.ts
- scripts
- session-latency-benchmark.ts
- HostTelemetrySampler
- session-knowledge-store.ts
- closed-sessions.ts
- pipeline.ts
- background-task-stop.test.ts
- closed-session-sweeper.ts
- SettingsProfileSnapshot
- SessionOriginBadge.test.tsx
- package.json
- terminal-form-deadline.test.ts
- registerSessionKnowledgeRoutes
- oracle-voice-assets.test.ts
- session-knowledge-routes.ts
- check-workspace-review-regressions.ts
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- ShellNavigation.test.tsx
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- agent-service-event-projection.test.ts
- .observe
- manager-proactive-inbox.test.ts
- session-scope.ts
- Pcm16Resampler
- RecentlyClosed.test.tsx
- document-render.pw.ts
- recently-closed.pw.ts
- dreamer-routes.ts
- dreamer-service.test.ts
- .initialize
- use-session-categories.ts
- html-preview.ts
- sign-in-expired.pw.ts
- isRecord
- SessionAdmissions
- src/activity-details.ts
- ActivityRow.test.tsx
- use-oracle-attachments.ts
- static-files.ts
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- file-upload-routes.ts
- .persist
- bridge.rs
- history-projection.test.ts
- logs-cli.test.ts
- ManagerProactiveInboxValidationError
- promotion-setup-execution.test.ts
- session-category-routes.test.ts
- session-knowledge-store.test.ts
- sent-message.ts
- voice-recorder.ts
- doctor-cli.test.ts
- registerHostTelemetryRoutes
- manager-structured-memory-performance.test.ts
- release-publication.test.ts
- session-list-collisions.test.ts
- composer-layout.test.ts
- HostTelemetryClock
- manager-tools.test.ts
- settings.ts
- DocumentViewControls.tsx
- usePanelWidth
- api-origin.test.ts
- promotion-setup.test.ts
- session-category-store.test.ts
- copyText
- MockMediaRecorder
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
1. `AppWorkspace()` - 372 edges
2. `SessionDetail` - 328 edges
3. `AgentService` - 318 edges
4. `SessionStore` - 218 edges
5. `ManagedSession` - 190 edges
6. `buildApp()` - 147 edges
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

## Communities (276 total, 25 thin omitted)

### Community 0 - "AppWorkspace"
Cohesion: 0.03
Nodes (197): terminalSendOptions(), newSessionCategoryId(), sessionCategoryOf(), sessionFileValidationError(), deleteSession(), AppWorkspace(), adoptConversationReplacement(), announceCategory() (+189 more)

### Community 1 - "api.ts"
Cohesion: 0.02
Nodes (167): SettingsChange, SettingsProfileKey, SettingsUpdateResult, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, SubmissionReceipt (+159 more)

### Community 2 - "AgentService"
Cohesion: 0.04
Nodes (8): AgentService, terminalService(), removeCopilotSessionFiles(), httpBoundary(), isRetainedRefusal(), StartupPhases, hasActiveBackgroundTasks(), hasRunningBackgroundAgent()

### Community 3 - "SessionStore"
Cohesion: 0.03
Nodes (97): fixture(), restart(), directories, fakeClient(), fixture(), ForkRequest, forkSession(), services (+89 more)

### Community 4 - "agent-service.ts"
Cohesion: 0.03
Nodes (110): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+102 more)

### Community 5 - "App.tsx"
Cohesion: 0.02
Nodes (108): react, hasForegroundTurn(), isManagerEvent(), notificationAllowed(), ScheduleShellNotifier, turnEnded(), executeCommand(), listClosedSessions() (+100 more)

### Community 6 - "computer-manager.ts"
Cohesion: 0.03
Nodes (59): RemoteResync, RemoteSessionListing, RemoteSessionRead, withSessionCreateBoundary(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, DEFINITE_DISPATCH_REFUSALS, headerSafe() (+51 more)

### Community 7 - "session-presentation.ts"
Cohesion: 0.03
Nodes (97): CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, DEFAULT_SESSION_PROVIDER, saveSessionOrderLane(), handleDragEnd() (+89 more)

### Community 8 - "contracts.ts"
Cohesion: 0.03
Nodes (81): WorkspaceFixtureOptions, AgentServiceEvents, ClaudeAgentServiceEvents, apps, directories, directory(), runtime(), services (+73 more)

### Community 9 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (16): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+8 more)

### Community 10 - "SessionService"
Cohesion: 0.04
Nodes (8): updateComputerForLaunchIdentity(), nodeVoiceCapabilities(), registerNodeRoutes(), owns(), ProviderSessionService, SessionService, WorkspaceFile, WorkspaceFileIcon()

### Community 11 - "hub-routes.ts"
Cohesion: 0.03
Nodes (98): activityDetailsUnavailable(), activityNotInLog(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), addComputerSchema, configureRuntimeSchema, createSessionSchema (+90 more)

### Community 12 - "sections.tsx"
Cohesion: 0.04
Nodes (84): parseAppVersion(), RuntimeModelOption, AppearanceSetting, NewSessionBackendSetting, deletePushSubscription(), getPushPublicKey(), savePushSubscription(), App() (+76 more)

### Community 13 - "agent-service.test.ts"
Cohesion: 0.03
Nodes (57): complete(), event(), sessionWithLog(), start(), CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures (+49 more)

### Community 14 - "ManagedSession"
Cohesion: 0.07
Nodes (16): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), ManagerEventSource, registerHubRoutes(), SessionMuteCarrier, FakeManager (+8 more)

### Community 15 - "client.ts"
Cohesion: 0.05
Nodes (35): VoiceCapabilities, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord() (+27 more)

### Community 16 - "schedules.ts"
Cohesion: 0.04
Nodes (72): proposalInput, LaunchPrimitives, ScheduleLauncherHost, ScheduleProvenance, scheduleSessionTitle(), directories, dispatchers, folderTrustPermission (+64 more)

### Community 17 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (66): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+58 more)

### Community 18 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (36): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+28 more)

### Community 19 - "SessionDetail"
Cohesion: 0.06
Nodes (20): isUncertainDelivery(), persistedFormAnswer(), runtimeInfoMatches(), TerminalFormContinuation, queuedForPrompt(), queueConflict(), observe(), assertSessionNotRetained() (+12 more)

### Community 20 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (20): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+12 more)

### Community 21 - "terminal-session.ts"
Cohesion: 0.04
Nodes (78): composer(), processAdapter, boxedComposerFrame(), busyRowStatus(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed() (+70 more)

### Community 22 - "HubEvent"
Cohesion: 0.05
Nodes (51): ComputerManagerEvents, computer, observe(), snapshot(), start, sustained(), NotificationRecorder, attentionClosed() (+43 more)

### Community 23 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 24 - "ManagerStore"
Cohesion: 0.06
Nodes (27): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+19 more)

### Community 25 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (45): validateDreamerTimeZone(), assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+37 more)

### Community 26 - "manager-tools.ts"
Cohesion: 0.05
Nodes (43): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), categoryTools() (+35 more)

### Community 27 - "ManagerAgent"
Cohesion: 0.07
Nodes (16): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), capturePrompt() (+8 more)

### Community 28 - "BackgroundTaskSnapshot"
Cohesion: 0.05
Nodes (38): backgroundTaskNotFound(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), listedBackgroundTask(), readBackgroundTaskFrom(), taskFingerprint(), apps (+30 more)

### Community 29 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (34): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+26 more)

### Community 30 - "VoiceCapture"
Cohesion: 0.06
Nodes (24): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, harness() (+16 more)

### Community 31 - "queued-dispatch.test.ts"
Cohesion: 0.04
Nodes (34): nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery() (+26 more)

### Community 32 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (45): root, script, ClaudeSdk, directories, disk, fixture(), gate(), gates (+37 more)

### Community 33 - "manager-agent.ts"
Cohesion: 0.06
Nodes (51): DreamerProgressEntry, DreamerProgressView, automaticPayload(), isPending(), isQueued(), messagePriority(), Rung, TURN_ACTIVITY (+43 more)

### Community 34 - "fake-voice.ts"
Cohesion: 0.05
Nodes (14): beginSpeech(), BrowserTestSessionService, endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice() (+6 more)

### Community 35 - "KnowledgeStore"
Cohesion: 0.05
Nodes (39): ServerRole, SessionMetadataLookup, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions (+31 more)

### Community 36 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionMultipartOptions (+27 more)

### Community 37 - "oracle-voice-session.ts"
Cohesion: 0.08
Nodes (26): apps, directories, playbackSequence(), acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), createVoiceBackendSession() (+18 more)

### Community 38 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (51): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+43 more)

### Community 39 - "oracle-voice.ts"
Cohesion: 0.06
Nodes (45): QueuedAudio, BrowserCaptureOptions, AudioReservation, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities (+37 more)

### Community 40 - "schedule-recurrence.ts"
Cohesion: 0.07
Nodes (55): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+47 more)

### Community 41 - "ui-locks.pw.ts"
Cohesion: 0.05
Nodes (39): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+31 more)

### Community 42 - "app.ts"
Cohesion: 0.06
Nodes (34): buildApp(), BuildAppOptions, errorStatusCode(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), directories, runtimes (+26 more)

### Community 43 - "multi-node.test.ts"
Cohesion: 0.05
Nodes (31): connections, fixture(), managers, releases, remote, session(), ComputerRegistry, DurableRegisteredComputer (+23 more)

### Community 44 - "dreamer-service.ts"
Cohesion: 0.07
Nodes (50): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+42 more)

### Community 45 - "oracle-task-store.ts"
Cohesion: 0.08
Nodes (39): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+31 more)

### Community 46 - "notification-center.ts"
Cohesion: 0.06
Nodes (35): booleanQuery, filters, params, cursorSchema, durableState(), emptyState(), identity, kind (+27 more)

### Community 47 - ".sendAdmittedWithBackend"
Cohesion: 0.07
Nodes (20): isTerminalNotReadyRefusal(), sessionInUseConflictMessage(), sessionInUseQueueMessage(), terminalAnswerRefused(), terminalComposerUnreadable(), backgroundShellsAllow(), captureForReplacement(), capturePane() (+12 more)

### Community 48 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 49 - "terminal-session.test.ts"
Cohesion: 0.04
Nodes (49): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+41 more)

### Community 50 - "oracle-voice-engine.ts"
Cohesion: 0.06
Nodes (21): clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics, registerControlRoutes() (+13 more)

### Community 51 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (24): benchmarkGroup(), ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent() (+16 more)

### Community 52 - "session-directory.ts"
Cohesion: 0.08
Nodes (40): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath() (+32 more)

### Community 53 - "ManagerMessage"
Cohesion: 0.06
Nodes (21): FakeManager, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams (+13 more)

### Community 54 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (45): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+37 more)

### Community 55 - "oracle-voice-benchmark.ts"
Cohesion: 0.06
Nodes (42): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, buildConfig(), CliOptions, clockTicksPerSecond() (+34 more)

### Community 56 - "DreamerService"
Cohesion: 0.11
Nodes (14): boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), safeRunError(), unavailableSnapshot(), uniqueSessionRefs() (+6 more)

### Community 57 - "oracle-voice-routes.ts"
Cohesion: 0.07
Nodes (40): sendNodeVoiceOutput(), OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, OracleVoiceManager, FakeBackend, Harness, limits() (+32 more)

### Community 58 - "SchedulerStore"
Cohesion: 0.11
Nodes (9): fixture(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, retainedHistory(), ScheduleProposal, Schedule (+1 more)

### Community 59 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (18): startAgentAfterClear(), afterExit(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, formReplyExpired(), listTmuxSessions() (+10 more)

### Community 60 - "ScheduleForm.tsx"
Cohesion: 0.08
Nodes (40): scheduleProposalSummary(), ScheduleTarget, getProviderRuntimeOptions(), listDirectories(), AddKnowledgeRootDialog(), browse(), FeatureEvent, listeners (+32 more)

### Community 61 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (51): addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, copyTask() (+43 more)

### Community 62 - "oracle-voice-security.test.ts"
Cohesion: 0.05
Nodes (28): ManagerState, capabilities, confirm(), control(), defaults, startControl(), SocketMessage, apps (+20 more)

### Community 63 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 64 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (33): frame(), geometry, output, scratch, screenshot(), { values }, oracleHostStatusFixture(), CONTEXT_EXAMPLE (+25 more)

### Community 65 - "ManagerEvent"
Cohesion: 0.08
Nodes (15): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, ProactiveManager, SessionLifecycle (+7 more)

### Community 66 - "ComposerActions.tsx"
Cohesion: 0.08
Nodes (21): families, modelFamily, shortModelName(), repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions() (+13 more)

### Community 67 - "NewSessionDialog.tsx"
Cohesion: 0.08
Nodes (39): activateSession(), configureRuntime(), createSession(), getRuntimeOptions(), listHistory(), reopenInterruptedSession(), sessionCreationFailed(), startSessionInCategory() (+31 more)

### Community 68 - "ScheduleRun"
Cohesion: 0.15
Nodes (9): provenance(), SessionScheduleLauncher, ScheduleLaunchRefusedError, SchedulerDispatcher, ScheduleReconciliation, registerSchedulerRoutes(), holdsSlot(), isInFlight() (+1 more)

### Community 69 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, DreamerProgressSource (+11 more)

### Community 70 - "processes.ts"
Cohesion: 0.09
Nodes (26): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+18 more)

### Community 71 - "server/skill-settings.ts"
Cohesion: 0.10
Nodes (28): builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills(), Token (+20 more)

### Community 72 - "feature-flags.ts"
Cohesion: 0.11
Nodes (33): AppVersion, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable(), parseFeatureFlag() (+25 more)

### Community 73 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 74 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 75 - "PushNotificationService"
Cohesion: 0.10
Nodes (10): start(), HubEventSource, OracleEventSource, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema (+2 more)

### Community 76 - "ResidentVoiceWorker"
Cohesion: 0.12
Nodes (10): combinedTranscript(), float32ToPcm16(), matchesCancelled(), pcm16ToFloat32(), readBoundedText(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream (+2 more)

### Community 77 - "FakeSessionService"
Cohesion: 0.07
Nodes (3): FakeSessionService, SideQuestionExchange, SlashCommand

### Community 78 - "oracle-voice-child.ts"
Cohesion: 0.07
Nodes (33): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), normalizeSherpaModule() (+25 more)

### Community 79 - "FakeVoiceEngine"
Cohesion: 0.08
Nodes (16): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+8 more)

### Community 80 - "cleanDialogLine"
Cohesion: 0.11
Nodes (35): activeBottomFrame(), captureBeforeDeadline(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), FormReplyDeadlineError (+27 more)

### Community 81 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 82 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (31): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+23 more)

### Community 83 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 84 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 85 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 86 - "devDependencies"
Cohesion: 0.05
Nodes (39): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+31 more)

### Community 87 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 88 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 89 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (27): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger(), canonicalPath() (+19 more)

### Community 90 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (33): editQueuedManagerMessage(), resetManager(), retryManagerMessage(), sendManagerMessage(), ActivityRow, applyEvent(), canTakeFocus(), ConfirmationCard (+25 more)

### Community 91 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 92 - "session-unread.pw.ts"
Cohesion: 0.08
Nodes (24): bounds(), build(), categorizedState(), devices, drag(), middle(), open(), Point (+16 more)

### Community 93 - "response-compression.test.ts"
Cohesion: 0.07
Nodes (20): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), apps (+12 more)

### Community 94 - "host-telemetry.ts"
Cohesion: 0.08
Nodes (30): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, HOST_TELEMETRY_MAX_QUEUE_BYTES (+22 more)

### Community 95 - "BackgroundTasksDialog.tsx"
Cohesion: 0.11
Nodes (28): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+20 more)

### Community 96 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (17): ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail() (+9 more)

### Community 97 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (34): assertExactKeys(), cloneState(), DISPOSITIONS, hasExactKeys(), isDisposition(), isEventKind(), isId(), isOrigin() (+26 more)

### Community 98 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 99 - "session-prefetch.ts"
Cohesion: 0.10
Nodes (23): browserConnection, ConnectionHints, connectionSparesData(), IdleScheduler, PASSIVE_READS_SINCE, PREFETCH_PASS_BYTES, PREFETCH_SIDEBAR_ROWS, readsPassively() (+15 more)

### Community 100 - "remote-voice-client.ts"
Cohesion: 0.14
Nodes (15): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError() (+7 more)

### Community 101 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+20 more)

### Community 102 - "oracle-voice-routes.test.ts"
Cohesion: 0.08
Nodes (17): exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), ObservedLocalVoiceBackend, openApps, openSockets, RouteManager (+9 more)

### Community 103 - "session-patch-browser.ts"
Cohesion: 0.11
Nodes (29): pageFor(), advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading() (+21 more)

### Community 104 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (28): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+20 more)

### Community 105 - "notification-center.integration.test.ts"
Cohesion: 0.11
Nodes (10): HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, center(), directories, directory(), hub(), now, runtimes (+2 more)

### Community 106 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 107 - "SessionOrderStore"
Cohesion: 0.15
Nodes (13): stores(), orderStore(), carried(), laneFrom(), retire(), sameLane(), sessionOrderKey(), SessionOrderState (+5 more)

### Community 108 - "setupWorkspaceFixture"
Cohesion: 0.08
Nodes (14): desktop, devices, long, open(), phone, veryLong, devices, markedState() (+6 more)

### Community 109 - "active-sessions.ts"
Cohesion: 0.14
Nodes (26): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+18 more)

### Community 110 - "ChatMessage"
Cohesion: 0.10
Nodes (19): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, Client, Browser, StoredSession (+11 more)

### Community 111 - "session-launcher.ts"
Cohesion: 0.10
Nodes (15): delay(), requireFolderTrust(), sameFolder(), SessionFolderTrustPolicy, SessionLaunch, SessionLauncher, SessionLauncherHost, SessionLaunchInput (+7 more)

### Community 112 - "knowledge-tree.ts"
Cohesion: 0.11
Nodes (28): applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+20 more)

### Community 113 - "sampler.ts"
Cohesion: 0.11
Nodes (28): counter(), counterDelta(), CpuCounters, cpuUtilization(), DeviceByteCounters, DeviceCounters, deviceRates(), isWholeDisk() (+20 more)

### Community 114 - "manager-structured-memory-search.ts"
Cohesion: 0.12
Nodes (24): DreamerMemoryMetadataRecord, authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord() (+16 more)

### Community 115 - "reader.ts"
Cohesion: 0.13
Nodes (22): detectWsl(), parseDataMount(), createLinuxHostTelemetryReader(), errorCode(), HostTelemetryProcFile, hostTelemetryProcFiles, HostTelemetryReaderOptions, HostTelemetryReading (+14 more)

### Community 116 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 117 - "session-categories.ts"
Cohesion: 0.16
Nodes (25): CategoryState, Fields, isRecord(), parseState(), validName(), applySessionCategoryChange(), clamp(), existing() (+17 more)

### Community 118 - "tmux-errors.ts"
Cohesion: 0.10
Nodes (22): foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity(), SocketPlace, containedServer() (+14 more)

### Community 119 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (24): isSettingsDeviceId(), isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance (+16 more)

### Community 120 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (16): cancelManager(), removeQueuedManagerMessage(), resolveManagerConfirmation(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+8 more)

### Community 121 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (17): phases, port, app(), directories, headers, launcher, createStartupPhases(), silentStartupPhases (+9 more)

### Community 122 - "session-resource-clear.test.ts"
Cohesion: 0.10
Nodes (26): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+18 more)

### Community 123 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 124 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 125 - "transport.test.ts"
Cohesion: 0.12
Nodes (19): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+11 more)

### Community 126 - "settings-profile-store.ts"
Cohesion: 0.14
Nodes (13): applySettingsChanges(), applySettingsImport(), isSettingsProfileKey(), SettingsRequestError, sizeChecked(), validateSettingsChanges(), validateSettingsImport(), seedHubSettings() (+5 more)

### Community 127 - "session-transcript.ts"
Cohesion: 0.14
Nodes (21): TRANSCRIPT_CARRIED_LIMIT, sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+13 more)

### Community 128 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 129 - "renderer.ts"
Cohesion: 0.11
Nodes (14): render, scope, DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), DocumentRenderer, DocumentRendererContext, RendererWorker (+6 more)

### Community 130 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 131 - "use-session-knowledge-root.ts"
Cohesion: 0.13
Nodes (16): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base (+8 more)

### Community 132 - "ConfigureRuntimeInput"
Cohesion: 0.12
Nodes (7): agentMode(), RuntimeConfigurationError, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), ConfigureRuntimeInput

### Community 133 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 134 - "service.ts"
Cohesion: 0.14
Nodes (10): HostRequest, HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError(), HostTelemetryTarget, HOST_TELEMETRY_INVALID_CODE, HostMinuteAggregate, HostProcesses (+2 more)

### Community 135 - "use-markdown-document.ts"
Cohesion: 0.13
Nodes (15): DocumentDrawing, drawnInParts(), isDrawnInParts(), DrawStep, defaultDocumentRenderer(), Drawn, MarkdownDocumentView, nothing (+7 more)

### Community 136 - "transcript-test-helpers.ts"
Cohesion: 0.17
Nodes (18): sessionLog(), BackgroundTaskEventOptions, MAX_BACKGROUND_TASKS, MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH, lifecycleEvent(), subagentShell(), syntheticLog() (+10 more)

### Community 137 - "ManagerStructuredMemoryStore"
Cohesion: 0.25
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 138 - "session-category-routes.ts"
Cohesion: 0.11
Nodes (15): createSchema, deleteSchema, keys(), listedInSessionOrder(), moveSchema, name, paramsSchema, parse() (+7 more)

### Community 139 - "markdown-navigation.ts"
Cohesion: 0.16
Nodes (21): MarkdownImage(), navigateDocument(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource() (+13 more)

### Community 140 - "vite.config.ts"
Cohesion: 0.12
Nodes (12): brotliAsync, compress(), gzipAsync, precompressDirectory(), PrecompressedFile, directories, canaryTests, oracleVoiceAssetNames (+4 more)

### Community 141 - "RuntimeReasoningEffort"
Cohesion: 0.15
Nodes (15): CreationRuntime, RuntimeReasoningEffort, getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings() (+7 more)

### Community 142 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 143 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 144 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (17): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+9 more)

### Community 145 - "HostMonitorView.test.tsx"
Cohesion: 0.17
Nodes (18): HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics, snapshot, Socket, bytes() (+10 more)

### Community 146 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 147 - "transcript-window.ts"
Cohesion: 0.20
Nodes (12): storedTranscript(), carriedBefore(), pageTranscript(), pageWholeSession(), row(), transcriptMoved(), transcriptOf(), TranscriptPage (+4 more)

### Community 148 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 149 - "SessionCategoryStore"
Cohesion: 0.26
Nodes (6): categories(), key(), refused(), remember(), SessionCategoryStore, SessionCategoriesSnapshot

### Community 150 - "SessionKnowledgeStore"
Cohesion: 0.20
Nodes (5): bindingKey(), SessionKnowledgeEvents, SessionKnowledgeStore, stateSchema, SessionKnowledgeBinding

### Community 151 - "ActivityDetails.tsx"
Cohesion: 0.22
Nodes (16): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, TOOL_CALL_ID_PATTERN, toolCallIdFromActivityId(), ActivityStatus, formatBytes(), activityKindFromMessage(), activityPresentation(), activityStatusFromMessage() (+8 more)

### Community 152 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 153 - "pipeline.test.tsx"
Cohesion: 0.17
Nodes (15): documentJsx(), build(), childrenOf(), drawStep(), elementsFor(), emptyDrawing, finishDrawing(), Level (+7 more)

### Community 154 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 156 - "ManagerProactiveInbox"
Cohesion: 0.22
Nodes (4): ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, nowIso(), openInbox()

### Community 157 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 158 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 159 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 160 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 161 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 162 - "dreamer-schedule.ts"
Cohesion: 0.23
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 163 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 164 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 165 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 166 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 167 - "session-reorder.pw.ts"
Cohesion: 0.13
Nodes (9): center(), computerOrder(), desktop, dropOnto(), longListState(), open(), phone, Point (+1 more)

### Community 168 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 169 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 171 - "session-knowledge-store.ts"
Cohesion: 0.13
Nodes (16): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+8 more)

### Community 172 - "closed-sessions.ts"
Cohesion: 0.18
Nodes (14): recordClosure(), blockParents, closedCapitals(), closedSessionContext(), excerpt(), head(), htmlElements, htmlText() (+6 more)

### Community 173 - "pipeline.ts"
Cohesion: 0.21
Nodes (16): partlyHeldRenderer(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform(), drawSteps(), growable, htmlBlocks (+8 more)

### Community 174 - "background-task-stop.test.ts"
Cohesion: 0.22
Nodes (13): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot(), started() (+5 more)

### Community 175 - "closed-session-sweeper.ts"
Cohesion: 0.17
Nodes (5): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS

### Community 176 - "SettingsProfileSnapshot"
Cohesion: 0.21
Nodes (6): profileStore(), SettingsProfileStore, directories, store(), SettingsProfileSnapshot, SettingsProfileTransport

### Community 177 - "SessionOriginBadge.test.tsx"
Cohesion: 0.24
Nodes (10): SessionProvenance, readScheduleLink(), ScheduleLink, scheduleNotificationLabel(), sessionOriginDescription(), icons, labels, SessionOriginBadge() (+2 more)

### Community 178 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 179 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 180 - "registerSessionKnowledgeRoutes"
Cohesion: 0.29
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 181 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 182 - "session-knowledge-routes.ts"
Cohesion: 0.13
Nodes (10): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema, SessionKnowledgeLifecycle (+2 more)

### Community 183 - "check-workspace-review-regressions.ts"
Cohesion: 0.15
Nodes (11): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+3 more)

### Community 184 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 185 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 186 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 187 - "ShellNavigation.test.tsx"
Cohesion: 0.32
Nodes (6): ClientFeature, railEntries(), initials(), useDisplayName(), DisplayNameSetting(), ShellNavigation()

### Community 188 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 189 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 190 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 191 - "agent-service-event-projection.test.ts"
Cohesion: 0.21
Nodes (9): at(), directories, finish(), launch(), projected(), services, syncSessionTranscript(), BackgroundTaskProjector (+1 more)

### Community 192 - ".observe"
Cohesion: 0.21
Nodes (7): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId()

### Community 193 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 194 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 195 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 196 - "RecentlyClosed.test.tsx"
Cohesion: 0.19
Nodes (9): act(), audit(), closed, computers, now, observeResizes(), Row(), session() (+1 more)

### Community 198 - "recently-closed.pw.ts"
Cohesion: 0.23
Nodes (9): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), open(), row() (+1 more)

### Community 199 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 201 - ".initialize"
Cohesion: 0.24
Nodes (4): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, open()

### Community 202 - "use-session-categories.ts"
Cohesion: 0.27
Nodes (9): fetchSessionCategories(), saveSessionCategoryChange(), sessionRefs(), message(), nothing, commit(), lab, loaded() (+1 more)

### Community 203 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 204 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 205 - "isRecord"
Cohesion: 0.29
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 207 - "src/activity-details.ts"
Cohesion: 0.33
Nodes (10): activityDetailFailure, detailKey(), keep(), kept, keptActivityDetail(), loadActivityDetail(), peekActivityDetail(), reading (+2 more)

### Community 208 - "ActivityRow.test.tsx"
Cohesion: 0.22
Nodes (6): ActivityRow, bashDetail(), output, raw, runningDetail(), text()

### Community 209 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 210 - "static-files.ts"
Cohesion: 0.27
Nodes (6): RFC-9110, AcceptedEncodings, FILE_HEADERS, isApiPath(), isAppleTouchIconProbe(), registerStaticFiles()

### Community 211 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 212 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 213 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 214 - "file-upload-routes.ts"
Cohesion: 0.31
Nodes (7): FileUploadError, registerFileUploadRoutes(), SessionParams, extension(), MAX_SESSION_FILE_BYTES, supportedExtensions, supportsSessionFile()

### Community 215 - ".persist"
Cohesion: 0.24
Nodes (3): SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, stateWithPaths()

### Community 216 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 217 - "history-projection.test.ts"
Cohesion: 0.31
Nodes (7): eventsFor(), groupedEventsFor(), ModelMessage, questionEventsFor(), random(), seedOffset, terminalTypes

### Community 218 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 219 - "ManagerProactiveInboxValidationError"
Cohesion: 0.28
Nodes (6): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions()

### Community 220 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 221 - "session-category-routes.test.ts"
Cohesion: 0.25
Nodes (6): directories, fakeManager(), host, hub(), members(), startHub()

### Community 222 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 223 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 224 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 225 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 227 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.36
Nodes (5): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemorySearchResult

### Community 228 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 229 - "session-list-collisions.test.ts"
Cohesion: 0.32
Nodes (4): kind(), sessionListCollisions(), Args, layout

### Community 230 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 232 - "manager-tools.test.ts"
Cohesion: 0.29
Nodes (5): claudeModels, computers, copilotModels, enableSchedulerTools(), interfere()

### Community 233 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 234 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 235 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 236 - "api-origin.test.ts"
Cohesion: 0.40
Nodes (4): prefixes, session, trusted, untrusted

### Community 237 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 238 - "session-category-store.test.ts"
Cohesion: 0.50
Nodes (3): directories, folder(), store()

### Community 239 - "copyText"
Cohesion: 0.60
Nodes (4): CopyTextButton(), copy(), copyText(), copyWithSelection()

### Community 242 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **1522 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1517 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2568 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionStore`, `ConfigureRuntimeInput`, `agent-service.ts`, `contracts.ts`, `ClaudeAgentService`, `FakeSessionService`, `.sendAdmittedWithBackend`, `claude-agent-service.ts`, `SessionDetail`, `session-directory.ts`, `transcript-window.ts`, `BackgroundTaskSnapshot`, `queued-dispatch.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `session-store-providers.test.ts`, `AgentService`, `agent-service.ts`, `contracts.ts`, `ClaudeAgentService`, `.sendAdmittedWithBackend`, `SessionDetail`, `transcript-window.ts`, `queued-dispatch.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ClaudeAgentService` connect `ClaudeAgentService` to `SessionStore`, `agent-service.ts`, `contracts.ts`, `SessionService`, `sections.tsx`, `FakeSessionService`, `claude-agent-service.ts`, `SessionDetail`, `session-directory.ts`, `transcript-window.ts`, `queued-dispatch.test.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1522 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.027523353839143314 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.022944752841660056 - nodes in this community are weakly interconnected._
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
