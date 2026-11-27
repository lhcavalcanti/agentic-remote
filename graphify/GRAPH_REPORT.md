# Agentic Remote - Graphify code map

Snapshot: `475759e8f7373d9567afe4e3dd6d4803046316bc2088fbe7c84411a8d1938b62`

Source checkout: `468cff06459e4011a710204309d6cdff260cb7e7`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 688 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 688 files · ~1,229,473 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9584 nodes · 27732 edges · 276 communities (230 shown, 29 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1356 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- AppWorkspace
- api.ts
- SessionStore
- app.ts
- SessionDetail
- agent-service.ts
- contracts.ts
- App.tsx
- session-presentation.ts
- oracle-voice-child.ts
- terminal-session.ts
- hub-routes.ts
- oracle-voice.ts
- setupWorkspaceFixture
- controls.tsx
- ManagedSession
- claude-agent-service.ts
- agent-service.test.ts
- ManagerStore
- session-directory.ts
- OracleVoiceCoordinator
- oracle-voice-soak.ts
- manager-tools.ts
- ManagerAgent
- agentic-remote-promotion-monitor
- dreamer-store.ts
- HubEvent
- active-sessions.ts
- TmuxTerminalSessionController
- .takeInTranscript
- ManagerMessage
- oracle-voice-routes.test.ts
- RemoteNodeClient
- workspace-fixtures.ts
- transcription-service.ts
- oracle-voice-routes.ts
- oracle-voice-worker.ts
- oracle-voice-integration.test.ts
- schedule-recurrence.ts
- FakeVoiceEngine
- tmux-test-helpers.ts
- react
- ProviderSessionService
- manager-structured-memory-validation.ts
- queued-dispatch.test.ts
- oracle-task-store.ts
- UserInputReplyInput
- session-resource-clear.test.ts
- manager-agent.ts
- oracle-voice-benchmark.ts
- ui-locks.pw.ts
- DreamerService
- sampler.ts
- ComposerActions.tsx
- recovery-resend-durability.test.ts
- ScheduleRun
- SchedulerStore
- ManagerEvent
- oracle-voice-session.ts
- OracleDreamer.tsx
- RecentlyClosed.tsx
- ManagerAssistant.tsx
- agentic-remote
- dreamer-progress.ts
- SessionService
- SettingsProfileSnapshot
- terminal-session.test.ts
- OracleVoiceClient
- agentic-remote-gate
- bundle
- feature-flags.ts
- FakeVoiceController
- VoicePlayback
- manager.ts
- shell.ts
- lib.rs
- normalizeKnowledgeRelativePath
- PushNotificationService
- dependencies
- devDependencies
- dreamer-planner.ts
- VoiceCapture
- client.test.ts
- agentic-remote-promotion-setup
- oracle-voice-config.ts
- background-task-adapter.ts
- service.ts
- scheduler-dispatcher.ts
- config.rs
- manager-context.ts
- manager-proactive-inbox.ts
- tmux-errors.integration.test.ts
- knowledge-tree.ts
- capture.ts
- manager-structured-memory.ts
- ScheduleWorktreeService
- BackgroundTasksDialog.tsx
- session-prefetch.ts
- FakeSessionService
- SessionOrderStore
- sections.tsx
- shared/settings-profile.ts
- oracle-voice-segments.ts
- session-launcher.ts
- agent-service-event-projection.test.ts
- notification-classifier.ts
- send-matrix.integration.test.ts
- AgentProvider
- push-notification-service.ts
- session-patch-browser.ts
- dreamer-service.ts
- session-transcript.ts
- ManagerAssistant.test.tsx
- use-markdown-document.test.tsx
- notification-center-service.ts
- oracle-voice-security.test.ts
- VoiceCapabilities
- capture-workspace.ts
- cli-canary.ts
- scripts
- use-markdown-document.ts
- check-workspace-review-regressions.ts
- manager-structured-memory-search.ts
- session-category-routes.ts
- ActivityRow.test.tsx
- src/settings-profile.ts
- SettingsProfileClient
- HostMonitorView.test.tsx
- session-patches.test.ts
- session-categories.ts
- compilerOptions
- capture-workbench-review.ts
- ManagerStructuredMemoryStore
- oracle-voice-coordinator.test.ts
- pipeline.ts
- SessionCategoryStore
- NotificationRecord
- response-compression.test.ts
- SessionKnowledgeStore
- PromptCards.tsx
- vite.config.ts
- session-knowledge-store.ts
- use-oracle-attachments.ts
- pwa-update.pw.ts
- compilerOptions
- session-category-store.test.ts
- full-gate.test.ts
- oracle-status.test.ts
- HostTelemetrySampler
- ManagerProactiveInbox
- NotificationStore
- use-session-categories.ts
- session-reply-durability.test.ts
- session-store-providers.test.ts
- ActivityDetails.tsx
- markdown-navigation.ts
- compilerOptions
- .toolHost
- OnlineRecognizer
- host-telemetry.ts
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- client.ts
- dreamer-schedule.ts
- KnowledgeStore
- promotion-monitor.test.ts
- SessionPublications
- terminal-startup-queue.test.ts
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- session-latency-benchmark.ts
- session-knowledge-routes.ts
- .correct
- transport.test.ts
- knowledge-store.ts
- registerSessionKnowledgeRoutes
- closed-sessions.ts
- package.json
- terminal-form-deadline.test.ts
- oracle-voice-assets.test.ts
- ShellNavigation.test.tsx
- fake-vad.ts
- desktop.json
- DeferredSession
- boundedText
- background-task-stop.test.ts
- .observe
- NotificationCenterService
- LargeSessionService
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- ChatMessage
- dreamer-service.test.ts
- session-scope.ts
- background-tasks.ts
- Pcm16Resampler
- recently-closed.pw.ts
- manager-proactive-inbox.test.ts
- manager-structured-memory-store.ts
- server/session-patches.ts
- html-preview.ts
- sign-in-expired.pw.ts
- session-knowledge-store.test.ts
- static-files.ts
- dataset
- generate-pwa-icons.ts
- SessionStatus
- .initializeOnce
- notification-center.integration.test.ts
- bridge.rs
- dreamer-routes.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- sent-message.ts
- pipeline.test.tsx
- doctor-cli.test.ts
- release-publication.test.ts
- UserInputFieldControl
- OracleVoicePlayback
- session-list-collisions.test.ts
- composer-layout.test.ts
- HostTelemetryClock
- schedule-notification-service.test.ts
- session-order-routes.test.ts
- settings.ts
- DocumentViewControls.tsx
- ManagerProactiveInboxValidationError
- manager-tools.test.ts
- VoiceServerControl
- promotion-setup.test.ts
- HubEventSource
- FakeRecorder
- terminal-send-uncertainty.test.ts
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
1. `AppWorkspace()` - 394 edges
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
- `instrument()` --indirect_call--> `document()`  [INFERRED]
  e2e/session-patch-browser.ts → server/skill-settings-jsonc.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (276 total, 29 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (19): agentMode(), AgentService, terminalService(), isTerminalNotReadyRefusal(), restart(), removeCopilotSessionFiles(), RuntimeConfigurationError, sessionInUseQueueMessage() (+11 more)

### Community 1 - "AppWorkspace"
Cohesion: 0.03
Nodes (212): terminalSendOptions(), newSessionCategoryId(), sessionCategoryName(), sessionCategoryOf(), sessionFileValidationError(), submissionReceiptFromError(), askSession(), clearConversation() (+204 more)

### Community 2 - "api.ts"
Cohesion: 0.02
Nodes (163): AddKnowledgeRootInput, PushSettings, SessionKnowledgeRootMutationInput, SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), TRANSCRIPT_WINDOW (+155 more)

### Community 3 - "SessionStore"
Cohesion: 0.03
Nodes (102): complete(), event(), sessionWithLog(), start(), fixture(), fixture(), connect(), createStore() (+94 more)

### Community 4 - "app.ts"
Cohesion: 0.02
Nodes (107): buildApp(), BuildAppOptions, errorStatusCode(), applications, directories, fixture(), releases, scheduledFixture() (+99 more)

### Community 5 - "SessionDetail"
Cohesion: 0.04
Nodes (12): ClaudeAgentService, isMissingClaudeSessionError(), observe(), answer(), claudeQuestions(), claudeRequest(), copilotRequest(), assertSessionNotRetained() (+4 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.03
Nodes (128): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+120 more)

### Community 7 - "contracts.ts"
Cohesion: 0.03
Nodes (88): backgroundTaskNotFound(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), listedBackgroundTask(), readBackgroundTaskFrom(), taskFingerprint(), ClaudeAgentServiceEvents (+80 more)

### Community 8 - "App.tsx"
Cohesion: 0.02
Nodes (118): isManagerEvent(), ScheduleShellNotifier, turnEnded(), executeCommand(), listWorkspace(), searchWorkspace(), ActivityRowStates, sidebarResizeMove() (+110 more)

### Community 9 - "session-presentation.ts"
Cohesion: 0.03
Nodes (87): DEFAULT_SESSION_PROVIDER, KnowledgeRootSelector(), root, dragsRow, RowMouseSensor, RowTouchSensor, splitRowListeners(), useSessionListSensors() (+79 more)

### Community 10 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (49): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+41 more)

### Community 11 - "terminal-session.ts"
Cohesion: 0.04
Nodes (98): activeBottomFrame(), boxedComposerFrame(), captureBeforeDeadline(), captureTerminal(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes (+90 more)

### Community 12 - "hub-routes.ts"
Cohesion: 0.03
Nodes (91): activityDetailsUnavailable(), activityNotInLog(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), addComputerSchema, configureRuntimeSchema, createSessionSchema (+83 more)

### Community 13 - "oracle-voice.ts"
Cohesion: 0.04
Nodes (65): apps, directories, exactArrayBuffer(), rawDataBuffer(), receiveNodeVoiceMessage(), QueuedAudio, config, BrowserCaptureOptions (+57 more)

### Community 14 - "setupWorkspaceFixture"
Cohesion: 0.03
Nodes (51): desktop, devices, long, open(), phone, veryLong, bounds(), build() (+43 more)

### Community 15 - "controls.tsx"
Cohesion: 0.05
Nodes (83): RuntimeModelOption, scheduleProposalSummary(), ScheduleTarget, activateSession(), createSession(), getProviderRuntimeOptions(), listDirectories(), listHistory() (+75 more)

### Community 16 - "ManagedSession"
Cohesion: 0.07
Nodes (16): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, ManagerEventSource, registerHubRoutes(), SessionMuteCarrier (+8 more)

### Community 17 - "claude-agent-service.ts"
Cohesion: 0.05
Nodes (70): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+62 more)

### Community 18 - "agent-service.test.ts"
Cohesion: 0.03
Nodes (60): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+52 more)

### Community 19 - "ManagerStore"
Cohesion: 0.05
Nodes (28): openStore(), JournalRecorder, JournalRecorderOptions, sessionTask(), applySessionReplacement(), emptyState(), JournalDraft, JournalEntry (+20 more)

### Community 20 - "session-directory.ts"
Cohesion: 0.06
Nodes (61): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+53 more)

### Community 21 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (20): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+12 more)

### Community 22 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 23 - "manager-tools.ts"
Cohesion: 0.05
Nodes (42): APPROVE_WORDS, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), categoryTools(), closeCapReached() (+34 more)

### Community 24 - "ManagerAgent"
Cohesion: 0.07
Nodes (16): DreamerProgressView, automaticPayload(), checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime() (+8 more)

### Community 25 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 26 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (44): publicSnapshot(), assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+36 more)

### Community 27 - "HubEvent"
Cohesion: 0.04
Nodes (45): ServerRole, ComputerManagerEvents, connections, fixture(), managers, releases, remote, session() (+37 more)

### Community 28 - "active-sessions.ts"
Cohesion: 0.06
Nodes (53): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+45 more)

### Community 29 - "TmuxTerminalSessionController"
Cohesion: 0.07
Nodes (26): terminalComposerUnreadable(), startAgentAfterClear(), afterExit(), awaitingRelaunch(), backgroundShellsAllow(), captureForReplacement(), capturePane(), copilotCommand() (+18 more)

### Community 30 - ".takeInTranscript"
Cohesion: 0.06
Nodes (34): contextChangedInEvents(), createPendingUserInputTracker(), createStatusTracker(), foregroundCompletedSince(), foregroundTurnOpen(), isEmptyResponseNotice(), isForegroundCompletionEvent(), isForegroundLifecycleEvent() (+26 more)

### Community 31 - "ManagerMessage"
Cohesion: 0.05
Nodes (27): FakeManager, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, confirmationSchema, defaultsSchema, editSchema (+19 more)

### Community 32 - "oracle-voice-routes.test.ts"
Cohesion: 0.04
Nodes (31): ActiveBackendSession, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+23 more)

### Community 33 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (16): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, requestBytes(), client(), servers, session (+8 more)

### Community 34 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (59): oracleHostStatusFixture(), CONTEXT_EXAMPLE, documents, fixtureArguments(), fixtureComputers, fixtureEndpoints, fixtureHostHistory, fixtureHostProcesses (+51 more)

### Community 35 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 36 - "oracle-voice-routes.ts"
Cohesion: 0.06
Nodes (49): nodeVoiceCapabilities(), sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes() (+41 more)

### Community 37 - "oracle-voice-worker.ts"
Cohesion: 0.07
Nodes (32): EnabledOracleVoiceConfig, VoiceEndUtterance, VoiceEngineEvent, VoiceStartUtterance, BlockingEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig() (+24 more)

### Community 38 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+24 more)

### Community 39 - "schedule-recurrence.ts"
Cohesion: 0.07
Nodes (59): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+51 more)

### Community 40 - "FakeVoiceEngine"
Cohesion: 0.05
Nodes (26): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceSttEngine, VoiceTtsEngine, VoiceUtteranceAudioFrame (+18 more)

### Community 41 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (51): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+43 more)

### Community 42 - "react"
Cohesion: 0.06
Nodes (46): react, parseAppVersion(), getPushPublicKey(), listClosedSessions(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), foregroundHandoffTimeoutMs (+38 more)

### Community 43 - "ProviderSessionService"
Cohesion: 0.06
Nodes (3): updateComputerForLaunchIdentity(), owns(), ProviderSessionService

### Community 44 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 45 - "queued-dispatch.test.ts"
Cohesion: 0.06
Nodes (28): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDelivery, QueuedDispatches (+20 more)

### Community 46 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (36): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+28 more)

### Community 47 - "UserInputReplyInput"
Cohesion: 0.06
Nodes (10): isUncertainDelivery(), PendingUserInputTracker, persistedFormAnswer(), sessionInUseConflictMessage(), TerminalFormContinuation, validateUserInputForm(), TerminalFormReplyError, TerminalSessionController (+2 more)

### Community 48 - "session-resource-clear.test.ts"
Cohesion: 0.05
Nodes (44): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), disk (+36 more)

### Community 49 - "manager-agent.ts"
Cohesion: 0.06
Nodes (32): discover(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig (+24 more)

### Community 50 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (42): execFileAsync, RealVoiceState, benchmarkFixture(), benchmarkGroup(), BenchmarkMetric, BenchmarkProfile, buildConfig(), CliOptions (+34 more)

### Community 51 - "ui-locks.pw.ts"
Cohesion: 0.06
Nodes (36): { values }, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns, fixtureSchedules, chromeBudget, chromeTargets (+28 more)

### Community 52 - "DreamerService"
Cohesion: 0.11
Nodes (14): boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), safeRunError(), unavailableSnapshot(), uniqueSessionRefs() (+6 more)

### Community 53 - "sampler.ts"
Cohesion: 0.08
Nodes (45): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+37 more)

### Community 54 - "ComposerActions.tsx"
Cohesion: 0.07
Nodes (25): families, modelFamily, shortModelName(), repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions() (+17 more)

### Community 55 - "recovery-resend-durability.test.ts"
Cohesion: 0.04
Nodes (29): root, script, directories, disk, gate(), gates, initialize(), PublicSessionValue (+21 more)

### Community 56 - "ScheduleRun"
Cohesion: 0.13
Nodes (11): provenance(), SessionScheduleLauncher, session(), ScheduleLauncher, ScheduleLaunchRefusedError, SchedulerDispatcher, ScheduleReconciliation, registerSchedulerRoutes() (+3 more)

### Community 57 - "SchedulerStore"
Cohesion: 0.11
Nodes (8): fixture(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, ScheduleProposal, Schedule, ScheduleRunStatus

### Community 58 - "ManagerEvent"
Cohesion: 0.08
Nodes (17): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, ProactiveManager, SessionLifecycle (+9 more)

### Community 59 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (17): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), createVoiceBackendSession(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled() (+9 more)

### Community 60 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (41): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition (+33 more)

### Community 61 - "RecentlyClosed.tsx"
Cohesion: 0.06
Nodes (37): CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames() (+29 more)

### Community 62 - "ManagerAssistant.tsx"
Cohesion: 0.07
Nodes (42): cancelManager(), editQueuedManagerMessage(), resetManager(), sendManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), boundWidth() (+34 more)

### Community 63 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 64 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, DreamerProgressSource (+11 more)

### Community 66 - "SettingsProfileSnapshot"
Cohesion: 0.09
Nodes (22): profileStore(), SettingsProfileStore, directories, store(), applySettingsChanges(), applySettingsImport(), isSettingsDeviceId(), isSettingsProfileKey() (+14 more)

### Community 67 - "terminal-session.test.ts"
Cohesion: 0.07
Nodes (40): busyRowStatus(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), idleButForBackgroundShells(), isTerminalSessionInUsePrompt(), occurrences() (+32 more)

### Community 68 - "OracleVoiceClient"
Cohesion: 0.14
Nodes (8): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError(), terminalCloseCode()

### Community 69 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 70 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 71 - "feature-flags.ts"
Cohesion: 0.11
Nodes (29): hub(), AppVersion, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable() (+21 more)

### Community 72 - "FakeVoiceController"
Cohesion: 0.09
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 73 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 74 - "manager.ts"
Cohesion: 0.08
Nodes (29): apps, directories, build(), trusted, ManagerState, trusted, RuntimeReasoningEffort, MANAGER_REMOVED_ATTACHMENTS_REASON (+21 more)

### Community 75 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 76 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 77 - "normalizeKnowledgeRelativePath"
Cohesion: 0.09
Nodes (30): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+22 more)

### Community 78 - "PushNotificationService"
Cohesion: 0.12
Nodes (9): start(), NotificationRecorder, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema (+1 more)

### Community 79 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 80 - "devDependencies"
Cohesion: 0.05
Nodes (39): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+31 more)

### Community 81 - "dreamer-planner.ts"
Cohesion: 0.10
Nodes (33): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+25 more)

### Community 82 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 83 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 84 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 85 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (27): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger(), canonicalPath() (+19 more)

### Community 86 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (37): attachmentModeValue(), backgroundHandoff(), booleanValue(), CopilotClientTaskInfo, CopilotClientTaskProgress, copyTask(), createBackgroundTaskProjector(), endsForegroundTurn() (+29 more)

### Community 87 - "service.ts"
Cohesion: 0.09
Nodes (21): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, HostRequest (+13 more)

### Community 88 - "scheduler-dispatcher.ts"
Cohesion: 0.09
Nodes (19): ScheduleNotificationService, NoopScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS, SchedulerDispatcherOptions, ScheduleStopAcknowledgement, ScheduleTargetUnavailableError (+11 more)

### Community 89 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 90 - "manager-context.ts"
Cohesion: 0.11
Nodes (30): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+22 more)

### Community 91 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (36): assertExactKeys(), cloneState(), DISPOSITIONS, hasExactKeys(), isDisposition(), isEventKind(), isId(), isOrigin() (+28 more)

### Community 92 - "tmux-errors.integration.test.ts"
Cohesion: 0.08
Nodes (29): foreignSocketPlace(), execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer() (+21 more)

### Community 93 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (33): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+25 more)

### Community 94 - "capture.ts"
Cohesion: 0.07
Nodes (17): BufferedFrame, defaultAudioContext(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode (+9 more)

### Community 95 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (26): efforts, managerRuntimeSettings, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_QUERY_CHARS (+18 more)

### Community 96 - "ScheduleWorktreeService"
Cohesion: 0.14
Nodes (15): RemoteNodeRequestError, execute, failure(), missing(), ScheduleWorktreeService, execute, git(), node() (+7 more)

### Community 97 - "BackgroundTasksDialog.tsx"
Cohesion: 0.11
Nodes (28): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+20 more)

### Community 98 - "session-prefetch.ts"
Cohesion: 0.10
Nodes (23): browserConnection, ConnectionHints, connectionSparesData(), IdleScheduler, PASSIVE_READS_SINCE, PREFETCH_PASS_BYTES, PREFETCH_SIDEBAR_ROWS, readsPassively() (+15 more)

### Community 100 - "SessionOrderStore"
Cohesion: 0.15
Nodes (14): categories(), stores(), orderStore(), carried(), laneFrom(), retire(), sameLane(), sessionOrderKey() (+6 more)

### Community 101 - "sections.tsx"
Cohesion: 0.13
Nodes (20): AppearanceSetting, NewSessionBackendSetting, getHubHealth(), PreviewFeaturesSettings(), CollapsedCategoriesSetting(), SettingScope(), HealthCard(), accentThemes (+12 more)

### Community 102 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (28): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+20 more)

### Community 103 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 104 - "session-launcher.ts"
Cohesion: 0.10
Nodes (16): delay(), requireFolderTrust(), sameFolder(), SessionFolderTrustPolicy, SessionLaunch, SessionLauncher, SessionLauncherHost, SessionLaunchInput (+8 more)

### Community 105 - "agent-service-event-projection.test.ts"
Cohesion: 0.10
Nodes (23): at(), directories, finish(), launch(), projected(), services, sessionLog(), syncSessionTranscript() (+15 more)

### Community 106 - "notification-classifier.ts"
Cohesion: 0.13
Nodes (25): computer, observe(), snapshot(), start, sustained(), attentionClosed(), attentionSeed(), classifyHostNotification() (+17 more)

### Community 107 - "send-matrix.integration.test.ts"
Cohesion: 0.07
Nodes (27): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+19 more)

### Community 108 - "AgentProvider"
Cohesion: 0.09
Nodes (19): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+11 more)

### Community 109 - "push-notification-service.ts"
Cohesion: 0.11
Nodes (19): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+11 more)

### Community 110 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 111 - "dreamer-service.ts"
Cohesion: 0.13
Nodes (25): DREAMER_MAX_ITEMS, DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, DreamerProgressLimits, DreamerFollowUp, DreamerPlannerExecutionInput, DreamerServiceOptions (+17 more)

### Community 112 - "session-transcript.ts"
Cohesion: 0.13
Nodes (23): TRANSCRIPT_CARRIED_LIMIT, sortSessions(), upsertSessionSnapshot(), prefetchCandidates(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse() (+15 more)

### Community 113 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (16): removeQueuedManagerMessage(), resolveManagerConfirmation(), retryManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+8 more)

### Community 114 - "use-markdown-document.test.tsx"
Cohesion: 0.10
Nodes (13): drawnInParts(), DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), DocumentRenderer, DocumentRendererContext, RendererWorker, synchronousRenderer (+5 more)

### Community 115 - "notification-center-service.ts"
Cohesion: 0.10
Nodes (22): booleanQuery, filters, params, cursorSchema, durableState(), identity, kind, NOTIFICATION_LIMIT (+14 more)

### Community 116 - "oracle-voice-security.test.ts"
Cohesion: 0.09
Nodes (15): apps, config, configFixture(), createManager(), issueTicket(), localRuntime(), otherAllowed, requestJson() (+7 more)

### Community 117 - "VoiceCapabilities"
Cohesion: 0.12
Nodes (13): VoiceCapabilities, OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability, defaults (+5 more)

### Community 118 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 119 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 120 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 121 - "use-markdown-document.ts"
Cohesion: 0.15
Nodes (20): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+12 more)

### Community 122 - "check-workspace-review-regressions.ts"
Cohesion: 0.08
Nodes (13): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+5 more)

### Community 123 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 124 - "session-category-routes.ts"
Cohesion: 0.10
Nodes (18): createSchema, deleteSchema, keys(), listedInSessionOrder(), moveSchema, name, paramsSchema, parse() (+10 more)

### Community 125 - "ActivityRow.test.tsx"
Cohesion: 0.15
Nodes (18): toolCallIdFromActivityId(), ActivityStatus, activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), compactActivityText() (+10 more)

### Community 126 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (21): NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+13 more)

### Community 127 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 128 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 129 - "session-patches.test.ts"
Cohesion: 0.14
Nodes (12): nextVoiceControl(), Client, Browser, seedOffset, BackgroundTasksPatch, HubResyncRequest, HubTasksResyncRequest, HubWireEvent (+4 more)

### Community 130 - "session-categories.ts"
Cohesion: 0.18
Nodes (21): Fields, isRecord(), parseState(), validName(), applySessionCategoryChange(), clamp(), existing(), isCollapsedCategoryShows() (+13 more)

### Community 131 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 132 - "capture-workbench-review.ts"
Cohesion: 0.10
Nodes (16): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, fixtureSessions (+8 more)

### Community 133 - "ManagerStructuredMemoryStore"
Cohesion: 0.16
Nodes (9): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMetadataSnapshot (+1 more)

### Community 134 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 135 - "pipeline.ts"
Cohesion: 0.14
Nodes (21): partlyHeldRenderer(), render, scope, documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform(), drawSteps() (+13 more)

### Community 136 - "SessionCategoryStore"
Cohesion: 0.23
Nodes (7): enableSchedulerTools(), members(), key(), refused(), remember(), SessionCategoryStore, SessionCategoriesSnapshot

### Community 137 - "NotificationRecord"
Cohesion: 0.17
Nodes (16): NotificationState, NotificationRecord, FeatureEvent, listeners, publishFeatureEvent(), subscribeFeatureEvents(), NotificationGroup, notificationGroups() (+8 more)

### Community 138 - "response-compression.test.ts"
Cohesion: 0.13
Nodes (19): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), apps (+11 more)

### Community 139 - "SessionKnowledgeStore"
Cohesion: 0.21
Nodes (3): bindingKey(), SessionKnowledgeStore, SessionKnowledgeBinding

### Community 140 - "PromptCards.tsx"
Cohesion: 0.13
Nodes (16): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+8 more)

### Community 141 - "vite.config.ts"
Cohesion: 0.12
Nodes (12): brotliAsync, compress(), gzipAsync, precompressDirectory(), PrecompressedFile, directories, canaryTests, oracleVoiceAssetNames (+4 more)

### Community 142 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 143 - "use-oracle-attachments.ts"
Cohesion: 0.17
Nodes (19): codeExtensions, fileTypes, managerFileValidationError(), MAX_MANAGER_FILE_BYTES, MAX_MANAGER_TEXT_BYTES, textTypes, uploadManagerFile(), attachmentSize() (+11 more)

### Community 144 - "pwa-update.pw.ts"
Cohesion: 0.11
Nodes (7): captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, BrowserTestSessionService, root, serve(), work

### Community 145 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 146 - "session-category-store.test.ts"
Cohesion: 0.12
Nodes (8): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, directories, folder(), store(), CLOSED_SESSION_RETENTION_MS

### Community 147 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 148 - "oracle-status.test.ts"
Cohesion: 0.16
Nodes (15): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+7 more)

### Community 149 - "HostTelemetrySampler"
Cohesion: 0.18
Nodes (3): HostTelemetrySampler, HostMinuteAggregate, HostSample

### Community 150 - "ManagerProactiveInbox"
Cohesion: 0.20
Nodes (4): ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, nowIso(), openInbox()

### Community 151 - "NotificationStore"
Cohesion: 0.20
Nodes (5): emptyState(), matchesNotification(), NotificationStore, setup(), NotificationFilter

### Community 152 - "use-session-categories.ts"
Cohesion: 0.16
Nodes (18): CategoryState, CollapsedCategoryShows, DEFAULT_COLLAPSED_CATEGORY_SHOWS, SessionCategory, fetchSessionCategories(), saveCollapsedCategoryShows(), saveSessionCategoryChange(), sessionRefs() (+10 more)

### Community 153 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer, fallbackFormFixture() (+8 more)

### Community 154 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 155 - "ActivityDetails.tsx"
Cohesion: 0.20
Nodes (17): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, activityDetailFailure, detailKey(), formatBytes(), keep(), kept, keptActivityDetail(), loadActivityDetail() (+9 more)

### Community 156 - "markdown-navigation.ts"
Cohesion: 0.18
Nodes (19): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+11 more)

### Community 157 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 159 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 160 - "host-telemetry.ts"
Cohesion: 0.14
Nodes (17): aggregate, DiskSpaceSchema, HostHistorySchema, HostInfoSchema, HostMetricAggregate, HostMetricAggregateSchema, HostMetrics, HostMetricsSchema (+9 more)

### Community 161 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 162 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 163 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 164 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 165 - "client.ts"
Cohesion: 0.13
Nodes (13): ORACLE_VOICE_CONNECTION_TIMEOUT_MS, closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, PendingHello (+5 more)

### Community 166 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 168 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 169 - "SessionPublications"
Cohesion: 0.25
Nodes (3): sameOrder(), sessionKey(), SessionPublications

### Community 170 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (10): client(), delayQueueWrite(), disk, exec, gate(), holdQueueCommit(), NativeFixture, NativeRuntime (+2 more)

### Community 171 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 172 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 173 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 174 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 175 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 176 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 177 - ".correct"
Cohesion: 0.31
Nodes (6): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 178 - "transport.test.ts"
Cohesion: 0.14
Nodes (11): prefixes, session, trusted, untrusted, readingFixture(), empty, inventory, listen() (+3 more)

### Community 179 - "knowledge-store.ts"
Cohesion: 0.14
Nodes (11): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, parseMetadata(), PersistedKnowledgeState (+3 more)

### Community 180 - "registerSessionKnowledgeRoutes"
Cohesion: 0.26
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 181 - "closed-sessions.ts"
Cohesion: 0.20
Nodes (13): blockParents, closedCapitals(), closedSessionContext(), excerpt(), head(), htmlElements, htmlText(), isClosedSessionContext() (+5 more)

### Community 182 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 183 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 184 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 185 - "ShellNavigation.test.tsx"
Cohesion: 0.30
Nodes (7): ClientFeature, railEntries(), usePreviewFeatures(), initials(), useDisplayName(), DisplayNameSetting(), ShellNavigation()

### Community 186 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 187 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 188 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 189 - "boundedText"
Cohesion: 0.22
Nodes (14): addActivity(), boundedText(), errorValue(), eventTask(), executionModeValue(), normalizeBackgroundTask(), numberValue(), progressValue() (+6 more)

### Community 190 - "background-task-stop.test.ts"
Cohesion: 0.25
Nodes (11): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started(), stopAcknowledgement() (+3 more)

### Community 191 - ".observe"
Cohesion: 0.19
Nodes (8): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), publicEvent()

### Community 194 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 195 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 196 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 197 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 198 - "ChatMessage"
Cohesion: 0.19
Nodes (9): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, ChatMessage, TranscriptWindow (+1 more)

### Community 199 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 200 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 201 - "background-tasks.ts"
Cohesion: 0.32
Nodes (10): BACKGROUND_TASK_TAIL, hasActiveBackgroundTasks(), hasForegroundTurn(), head(), isLowSurrogate(), latestActivity(), summarizeBackgroundTask(), summarizeProgress() (+2 more)

### Community 202 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 203 - "recently-closed.pw.ts"
Cohesion: 0.23
Nodes (9): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), open(), row() (+1 more)

### Community 204 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 205 - "manager-structured-memory-store.ts"
Cohesion: 0.17
Nodes (8): ManagerStructuredMemorySearchIndex, isMissing(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_RECORDS, MANAGER_STRUCTURED_MEMORY_MAX_TOMBSTONES

### Community 206 - "server/session-patches.ts"
Cohesion: 0.21
Nodes (11): changedInPlace(), diffMessages(), Publication, PublishedTask, sameField(), sameMessage(), SessionTasksUpdated, SessionUpserted (+3 more)

### Community 207 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 208 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 209 - "session-knowledge-store.test.ts"
Cohesion: 0.20
Nodes (7): SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, disk, fixture(), fixtures, releases, root()

### Community 210 - "static-files.ts"
Cohesion: 0.27
Nodes (6): RFC-9110, AcceptedEncodings, FILE_HEADERS, isApiPath(), isAppleTouchIconProbe(), registerStaticFiles()

### Community 211 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 212 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 213 - "SessionStatus"
Cohesion: 0.22
Nodes (9): Seen, ManagerProactiveInboxObservation, PersistedCursor, NotificationCursor, Row, SdkRestartRecovery, SessionStatus, SessionTurnState (+1 more)

### Community 214 - ".initializeOnce"
Cohesion: 0.29
Nodes (3): isAlreadyExists(), isMissing(), ManagerProactiveInboxRecoveryError

### Community 215 - "notification-center.integration.test.ts"
Cohesion: 0.22
Nodes (7): center(), directories, directory(), hub(), now, runtimes, trusted

### Community 216 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 217 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 218 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 219 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 220 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 221 - "pipeline.test.tsx"
Cohesion: 0.28
Nodes (6): components, drawn(), drawnPage(), fixtures, html(), today()

### Community 222 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 223 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 224 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 226 - "session-list-collisions.test.ts"
Cohesion: 0.32
Nodes (4): kind(), sessionListCollisions(), Args, layout

### Community 227 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 229 - "schedule-notification-service.test.ts"
Cohesion: 0.33
Nodes (3): input(), now, run()

### Community 230 - "session-order-routes.test.ts"
Cohesion: 0.43
Nodes (6): directories, fakeManager(), hub(), settled(), until(), upserted()

### Community 231 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 232 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 233 - "ManagerProactiveInboxValidationError"
Cohesion: 0.40
Nodes (4): emptyState(), ManagerProactiveInboxValidationError, validateLimit(), validateOptions()

### Community 234 - "manager-tools.test.ts"
Cohesion: 0.33
Nodes (4): claudeModels, computers, copilotModels, interfere()

### Community 235 - "VoiceServerControl"
Cohesion: 0.40
Nodes (4): connect(), Inbox, rawBuffer(), VoiceServerControl

### Community 236 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 242 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **1529 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1524 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2579 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `start()` connect `ManagerAgent` to `manager-agent.ts`, `ManagerStore`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ManagerAgent` connect `ManagerAgent` to `FakeVoiceEngine`, `manager.ts`, `manager-agent.ts`, `ManagerStore`, `manager-tools.ts`, `manager-context.ts`, `manager-structured-memory-search.ts`, `.toolHost`, `ManagerMessage`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ManagerToolHost` connect `manager-tools.ts` to `ManagerMemory`, `ManagerStructuredMemoryStore`, `SchedulerStore`, `ManagerEvent`, `session-category-routes.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `AppWorkspace()` (e.g. with `submitMessage()` and `prefersLightNow()`) actually correct?**
  _`AppWorkspace()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1529 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.031901800751392664 - nodes in this community are weakly interconnected._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.02596390004288332 - nodes in this community are weakly interconnected._
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
