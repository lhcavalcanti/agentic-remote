# Agentic Remote - Graphify code map

Snapshot: `926641a0d468fb2861b842ea7f02b8babbad69582054dda99150435bab4252b2`

Source checkout: `3798bcbef4695985f93dffc2ebcb50d3363d936f`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 644 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 644 files · ~1,135,006 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 8958 nodes · 25860 edges · 269 communities (225 shown, 26 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1302 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- AppWorkspace
- api.ts
- SessionStore
- SessionDetail
- agent-service.ts
- contracts.ts
- App.tsx
- terminal-session.ts
- react
- claude-agent-service.ts
- ComputerSummary
- session-directory.ts
- hub-routes.ts
- ManagedSession
- manager-tools.ts
- ManagerStore
- oracle-voice-soak.ts
- OracleVoiceCoordinator
- oracle-voice.ts
- agentic-remote-promotion-monitor
- ManagerMessage
- app.ts
- dreamer-store.ts
- ManagerAgent
- workspace-fixtures.ts
- RemoteNodeClient
- VoiceCapture
- notification-classifier.ts
- client.ts
- CopilotSessionLike
- tmux-test-helpers.ts
- session-store-providers.test.ts
- transcription-service.ts
- TmuxTerminalSessionController
- schedule-launcher.test.ts
- oracle-task-store.ts
- oracle-voice-integration.test.ts
- oracle-voice-session.ts
- FakeVoiceEngine
- schedules.ts
- manager-structured-memory-validation.ts
- active-sessions.ts
- CopilotClientLike
- session-knowledge-routes.test.ts
- ProviderSessionService
- SessionService
- oracle-voice-worker.ts
- OracleDreamer.tsx
- DreamerService
- SchedulerStore
- manager-agent.ts
- oracle-voice-benchmark.ts
- setupWorkspaceFixture
- oracle-voice-config.ts
- agentic-remote
- TerminalSessionController
- shared/settings-profile.ts
- ScheduleRun
- ui-locks.pw.ts
- real-voice.ts
- dreamer-progress.ts
- AgentProvider
- send-matrix.integration.test.ts
- agentic-remote-gate
- bundle
- processes.ts
- ManagerAssistant.tsx
- oracle-voice-child.ts
- FakeVoiceController
- VoicePlayback
- oracle-voice-routes.ts
- ResidentVoiceWorker
- shell.ts
- lib.rs
- host-telemetry.ts
- scheduler-store.ts
- markdown-navigation.ts
- dependencies
- manager-proactive-coordinator.ts
- FakeSessionService
- terminal-session.test.ts
- schedule-recurrence.ts
- client.test.ts
- agentic-remote-promotion-setup
- ManagerEvent
- SessionOrderStore
- devDependencies
- config.rs
- manager-context.ts
- feature-flags.ts
- manager-agent.test.ts
- PushNotificationService
- oracle-voice-child.test.ts
- Composer.tsx
- manager-structured-memory.ts
- pipeline.test.tsx
- HostTelemetrySampler
- manager-proactive-inbox.ts
- manager-structured-memory-search.ts
- knowledge-tree.ts
- reader.ts
- NotificationCenterService
- schedule-proposals.ts
- recovery-resend-durability.test.ts
- VoiceCapabilities
- oracle-voice-segments.ts
- pwa.ts
- session-patch-browser.ts
- .discoverSessions
- backgroundTasksFromEvents
- oracle-voice-security.test.ts
- ScheduleWorktreeService
- capture-workspace.ts
- dreamer-planner.ts
- dreamer-service.ts
- sampler.ts
- normalizeKnowledgeRelativePath
- ManagerAssistant.test.tsx
- use-markdown-document.test.tsx
- cli-canary.ts
- HubEvent
- startup-phases.test.ts
- scripts
- pipeline.ts
- manager-uploads.ts
- SettingsProfileClient
- background-task-adapter.ts
- agent-service.test.ts
- HostMonitorView.test.tsx
- VoiceAudioFrame
- src/settings-profile.ts
- compilerOptions
- oracle-voice-coordinator.test.ts
- ManagerStructuredMemoryStore
- SettingsProfileSnapshot
- KnowledgeStore
- .toolHost
- oracle-voice-tickets.ts
- NotificationRecord
- compilerOptions
- full-gate.test.ts
- session-reply-durability.test.ts
- compilerOptions
- ManagerProactiveInbox
- session-patches.test.ts
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- session-knowledge-store.ts
- SessionKnowledgeStore
- session-provenance.test.ts
- SessionOriginBadge.test.tsx
- ActivityDetails.tsx
- session-latency-benchmark.ts
- oracle-status.test.ts
- ManagerMemory
- promotion-monitor.test.ts
- terminal-startup-queue.test.ts
- PromptCards.tsx
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- session-unread.pw.ts
- scripts
- session-knowledge-routes.ts
- SettingsProfileStore
- ActivityRow.tsx
- terminal-form-deadline.test.ts
- closed-session-sweeper.ts
- dreamer-schedule.ts
- package.json
- background-task-stop.test.ts
- registerSessionKnowledgeRoutes
- oracle-voice-assets.test.ts
- oracle-voice-routes.test.ts
- RuntimeStatus.tsx
- use-oracle-attachments.ts
- fake-vad.ts
- desktop.json
- registerHostTelemetryRoutes
- knowledge-store.ts
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- dreamer-service.test.ts
- .observe
- manager-proactive-inbox.test.ts
- .initialize
- session-resource-clear.test.ts
- BackgroundTasksDialog.tsx
- DialogFrame.tsx
- ShellNavigation.test.tsx
- Pcm16Resampler
- pending-echo.ts
- background-task-tracker.ts
- ChatMessage
- ActivityRow.test.tsx
- html-preview.ts
- sign-in-expired.pw.ts
- DeferredSession
- isRecord
- SessionAdmissions
- dataset
- generate-pwa-icons.ts
- normalizeBackgroundTask
- ManagerProactiveInboxValidationError
- .persist
- bridge.rs
- vite.config.ts
- dreamer-routes.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- session-knowledge-store.test.ts
- closed-sessions.ts
- SkillsSettings.tsx
- sent-message.ts
- doctor-cli.test.ts
- release-publication.test.ts
- UserInputFieldControl
- KnowledgePosition
- composer-layout.test.ts
- history-projection.test.ts
- HostTelemetryClock
- settings.ts
- DocumentViewControls.tsx
- use-foreground-handoff.ts
- usePanelWidth
- promotion-setup.test.ts
- FakeRecorder
- MockMediaRecorder
- MermaidDiagram.tsx
- version-policy.test.ts
- MockWebSocket
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
3. `AgentService` - 305 edges
4. `SessionStore` - 208 edges
5. `ManagedSession` - 184 edges
6. `buildApp()` - 138 edges
7. `ClaudeAgentService` - 135 edges
8. `registerHubRoutes()` - 108 edges
9. `ComputerManager` - 107 edges
10. `ManagerAgent` - 101 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (269 total, 26 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (14): agentMode(), AgentService, isTerminalNotReadyRefusal(), isUncertainDelivery(), lifecycleRefusal(), RuntimeConfigurationError, sessionInUseConflictMessage(), suspendedRuntimeConflict() (+6 more)

### Community 1 - "AppWorkspace"
Cohesion: 0.03
Nodes (185): terminalSendOptions(), sessionFileValidationError(), submissionReceiptFromError(), saveSessionUnread(), AppWorkspace(), adoptConversationReplacement(), answerUserInput(), appendComposerForKey() (+177 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (161): SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), activateSession(), activityArgumentFormats, activityDetailStatuses, activityKinds (+153 more)

### Community 3 - "SessionStore"
Cohesion: 0.03
Nodes (98): fixture(), restart(), directories, fakeClient(), fixture(), ForkRequest, forkSession(), services (+90 more)

### Community 4 - "SessionDetail"
Cohesion: 0.04
Nodes (13): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), toolResultText(), answer(), claudeRequest(), copilotRequest(), assertSessionNotRetained() (+5 more)

### Community 5 - "agent-service.ts"
Cohesion: 0.03
Nodes (100): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+92 more)

### Community 6 - "contracts.ts"
Cohesion: 0.03
Nodes (81): WorkspaceFixtureOptions, activityDetailsUnavailable(), activityNotInLog(), refusal(), updateComputerForActivityDetails(), ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing (+73 more)

### Community 7 - "App.tsx"
Cohesion: 0.03
Nodes (89): hasActiveBackgroundTasks(), hasForegroundTurn(), hasRunningBackgroundAgent(), isManagerEvent(), listClosedSessions(), renameSession(), sidebarResizeMove(), sidebarTouchStart() (+81 more)

### Community 8 - "terminal-session.ts"
Cohesion: 0.04
Nodes (104): composer(), processAdapter, activeBottomFrame(), afterExit(), boxedComposerFrame(), captureBeforeDeadline(), captureTerminal(), cleanDialogLine() (+96 more)

### Community 9 - "react"
Cohesion: 0.05
Nodes (78): react, RuntimeModelOption, AppearanceSetting, NewSessionBackendSetting, addComputer(), getHubHealth(), removeComputer(), updateManagerSettings() (+70 more)

### Community 10 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (67): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+59 more)

### Community 11 - "ComputerSummary"
Cohesion: 0.04
Nodes (75): CLOSED_SESSION_RETENTION_DAYS, ComputerSummary, saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, CloseSessionDialog(), RecentlyClosedCard() (+67 more)

### Community 12 - "session-directory.ts"
Cohesion: 0.05
Nodes (64): instrument(), displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath() (+56 more)

### Community 13 - "hub-routes.ts"
Cohesion: 0.03
Nodes (83): toolCallIdSchema, FileUploadError, registerFileUploadRoutes(), SessionParams, addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema (+75 more)

### Community 14 - "ManagedSession"
Cohesion: 0.08
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, normalizeNodeUrl(), SessionLauncherOptions (+5 more)

### Community 15 - "manager-tools.ts"
Cohesion: 0.04
Nodes (45): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), changeSuspension() (+37 more)

### Community 16 - "ManagerStore"
Cohesion: 0.05
Nodes (31): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+23 more)

### Community 17 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (37): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+29 more)

### Community 18 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (19): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+11 more)

### Community 19 - "oracle-voice.ts"
Cohesion: 0.06
Nodes (56): VoiceBackendOutput, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, closeReason(), exactArrayBuffer(), rawDataBuffer() (+48 more)

### Community 20 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 21 - "ManagerMessage"
Cohesion: 0.04
Nodes (32): FakeManager, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, apps, directories, DreamerServiceOptions (+24 more)

### Community 22 - "app.ts"
Cohesion: 0.04
Nodes (51): apps, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName() (+43 more)

### Community 23 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (43): validateDreamerTimeZone(), assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+35 more)

### Community 24 - "ManagerAgent"
Cohesion: 0.08
Nodes (14): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+6 more)

### Community 25 - "workspace-fixtures.ts"
Cohesion: 0.04
Nodes (55): frame(), geometry, output, scratch, screenshot(), { values }, accents, Measurement (+47 more)

### Community 26 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (18): headerSafe(), RemoteNodeClient, requestBytes(), client(), servers, session, RemoteNodeCapabilityError, RemoteNodeRequestError (+10 more)

### Community 27 - "VoiceCapture"
Cohesion: 0.06
Nodes (24): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, harness() (+16 more)

### Community 28 - "notification-classifier.ts"
Cohesion: 0.05
Nodes (57): HOST_ALERT_POLL_INTERVAL_MS, computer, observe(), snapshot(), start, sustained(), center(), directories (+49 more)

### Community 29 - "client.ts"
Cohesion: 0.08
Nodes (25): SocketMessage, connect(), Inbox, rawBuffer(), VoiceServerControl, captureClientError(), clientError(), closeError() (+17 more)

### Community 30 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (31): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+23 more)

### Community 31 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (53): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+45 more)

### Community 32 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (42): root, script, deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases (+34 more)

### Community 33 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+27 more)

### Community 34 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (17): startAgentAfterClear(), awaitingRelaunch(), capturePane(), copilotCommand(), execFileAsync, isTerminalAgentWorking(), isTerminalOverlay(), isTerminalVisiblyIdle() (+9 more)

### Community 35 - "schedule-launcher.test.ts"
Cohesion: 0.05
Nodes (41): ClaudeSdk, awaitTermination(), LaunchCreations, apps, directories, directory(), runtime(), services (+33 more)

### Community 36 - "oracle-task-store.ts"
Cohesion: 0.08
Nodes (43): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+35 more)

### Community 37 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): ManagerSdkClient, apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+23 more)

### Community 38 - "oracle-voice-session.ts"
Cohesion: 0.08
Nodes (21): ActiveBackendSession, RouteVoiceBackend, acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), CreateVoiceBackendSessionOptions, disconnectCause() (+13 more)

### Community 39 - "FakeVoiceEngine"
Cohesion: 0.06
Nodes (26): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceSttEngine, VoiceTtsEngine, VoiceUtteranceAudioFrame, BlockingCancelEngine (+18 more)

### Community 40 - "schedules.ts"
Cohesion: 0.07
Nodes (48): scheduleProposalSummary(), CLAUDE_SCHEDULE_UNAVAILABLE_REASON, cronExpression, DEFAULT_SCHEDULE_TIMEZONE, identifier, SCHEDULE_ABANDONED_REASON, SCHEDULE_MIN_SPACING_MINUTES, SCHEDULE_PROMPT_MAX_LENGTH (+40 more)

### Community 41 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 42 - "active-sessions.ts"
Cohesion: 0.07
Nodes (46): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+38 more)

### Community 43 - "CopilotClientLike"
Cohesion: 0.04
Nodes (38): complete(), event(), start(), CopilotClientLike, holdProbe(), fixtures, gate(), releases (+30 more)

### Community 44 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (32): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+24 more)

### Community 46 - "SessionService"
Cohesion: 0.06
Nodes (5): nodeVoiceCapabilities(), registerNodeRoutes(), SessionService, WorkspaceFile, WorkspaceFileIcon()

### Community 47 - "oracle-voice-worker.ts"
Cohesion: 0.09
Nodes (23): benchmarkGroup(), ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent() (+15 more)

### Community 48 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (45): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+37 more)

### Community 49 - "DreamerService"
Cohesion: 0.11
Nodes (13): DreamerMemoryMetadata, projectDreamerMemory(), boundedText(), DreamerService, DreamerUnavailableError, unavailableSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate (+5 more)

### Community 50 - "SchedulerStore"
Cohesion: 0.11
Nodes (8): fixture(), session(), deferUnboundWorktree(), failure(), SchedulerStore, ScheduleProposal, Schedule, ScheduleRunStatus

### Community 51 - "manager-agent.ts"
Cohesion: 0.06
Nodes (33): automaticPayload(), isPending(), isQueued(), messagePriority(), Rung, TURN_ACTIVITY, efforts, managerRuntimeSettings (+25 more)

### Community 52 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 53 - "setupWorkspaceFixture"
Cohesion: 0.05
Nodes (24): desktop, devices, long, open(), phone, veryLong, bounds(), closedEarlier (+16 more)

### Community 54 - "oracle-voice-config.ts"
Cohesion: 0.07
Nodes (33): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+25 more)

### Community 55 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 56 - "TerminalSessionController"
Cohesion: 0.08
Nodes (8): persistedFormAnswer(), removeCopilotSessionFiles(), TerminalFormContinuation, forgetSessionEvents(), TerminalFormReplyError, TerminalSessionController, PendingUserInput, UserInputReplyInput

### Community 57 - "shared/settings-profile.ts"
Cohesion: 0.08
Nodes (42): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+34 more)

### Community 58 - "ScheduleRun"
Cohesion: 0.15
Nodes (10): provenance(), SessionScheduleLauncher, ScheduleLauncher, ScheduleLaunchRefusedError, SchedulerDispatcher, ScheduleReconciliation, registerSchedulerRoutes(), holdsSlot() (+2 more)

### Community 59 - "ui-locks.pw.ts"
Cohesion: 0.08
Nodes (30): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+22 more)

### Community 60 - "real-voice.ts"
Cohesion: 0.06
Nodes (15): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+7 more)

### Community 61 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 62 - "AgentProvider"
Cohesion: 0.06
Nodes (33): make(), Seen, PersistedCursor, NotificationCursor, node(), Row, apps, dataDirectory() (+25 more)

### Community 63 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (40): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+32 more)

### Community 64 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 65 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 66 - "processes.ts"
Cohesion: 0.09
Nodes (27): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+19 more)

### Community 67 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (36): editQueuedManagerMessage(), resetManager(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), canTakeFocus() (+28 more)

### Community 68 - "oracle-voice-child.ts"
Cohesion: 0.07
Nodes (35): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), float32ToPcm16() (+27 more)

### Community 69 - "FakeVoiceController"
Cohesion: 0.09
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 70 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 71 - "oracle-voice-routes.ts"
Cohesion: 0.10
Nodes (33): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+25 more)

### Community 72 - "ResidentVoiceWorker"
Cohesion: 0.13
Nodes (7): combinedTranscript(), matchesCancelled(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceGenerationIdentity, VoiceSynthesisRequest

### Community 73 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 74 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 75 - "host-telemetry.ts"
Cohesion: 0.08
Nodes (28): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HostRequest, HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError(), HostTelemetryTarget, HOST_TELEMETRY_MAX_QUEUE_BYTES, HOST_TELEMETRY_MAX_QUEUE_MESSAGES (+20 more)

### Community 76 - "scheduler-store.ts"
Cohesion: 0.08
Nodes (26): enableSchedulerTools(), headers, hub(), sender, NoopScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS (+18 more)

### Community 77 - "markdown-navigation.ts"
Cohesion: 0.10
Nodes (36): codeFenceProps(), fencedSource(), flatChildren(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), mermaidFencedSource() (+28 more)

### Community 78 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 79 - "manager-proactive-coordinator.ts"
Cohesion: 0.12
Nodes (12): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, SessionLifecycle, directories (+4 more)

### Community 81 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (33): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+25 more)

### Community 82 - "schedule-recurrence.ts"
Cohesion: 0.11
Nodes (35): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+27 more)

### Community 83 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 84 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 85 - "ManagerEvent"
Cohesion: 0.09
Nodes (23): ManagerEventSource, NotificationRecorder, brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories (+15 more)

### Community 86 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 87 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 88 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 89 - "manager-context.ts"
Cohesion: 0.11
Nodes (29): DreamerProgressEntry, DreamerProgressView, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock() (+21 more)

### Community 90 - "feature-flags.ts"
Cohesion: 0.13
Nodes (26): hub(), AppVersion, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable() (+18 more)

### Community 91 - "manager-agent.test.ts"
Cohesion: 0.09
Nodes (20): ManagerAgentOptions, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+12 more)

### Community 92 - "PushNotificationService"
Cohesion: 0.13
Nodes (8): start(), PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 93 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (14): createVoiceWorker(), PiperProcess, childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream (+6 more)

### Community 94 - "Composer.tsx"
Cohesion: 0.10
Nodes (16): AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), filterSentMessages(), SentHistoryContext, ComposerActions(), ContextRing(), QueuedPromptList() (+8 more)

### Community 95 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (30): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+22 more)

### Community 96 - "pipeline.test.tsx"
Cohesion: 0.11
Nodes (26): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+18 more)

### Community 97 - "HostTelemetrySampler"
Cohesion: 0.10
Nodes (11): BuildAppOptions, ProcessScanContext, HostTelemetrySampler, HostTelemetryService, empty, inventory, listen(), pair() (+3 more)

### Community 98 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (34): assertExactKeys(), cloneState(), DISPOSITIONS, hasExactKeys(), isDisposition(), isEventKind(), isId(), isOrigin() (+26 more)

### Community 99 - "manager-structured-memory-search.ts"
Cohesion: 0.10
Nodes (28): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+20 more)

### Community 100 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+24 more)

### Community 101 - "reader.ts"
Cohesion: 0.11
Nodes (26): prefixes, session, trusted, untrusted, detectWsl(), parseDataMount(), createLinuxHostTelemetryReader(), errorCode() (+18 more)

### Community 102 - "NotificationCenterService"
Cohesion: 0.14
Nodes (6): NotificationCenterService, emptyState(), matchesNotification(), NotificationStore, setup(), NotificationFilter

### Community 103 - "schedule-proposals.ts"
Cohesion: 0.11
Nodes (29): action, create, existing, metadata, scheduleProposalInputSchema, ScheduleProposalsChanged, scheduleProposalSchema, update (+21 more)

### Community 104 - "recovery-resend-durability.test.ts"
Cohesion: 0.09
Nodes (18): directories, disk, fixture(), gate(), gates, httpBoundary(), initialize(), PublicSessionValue (+10 more)

### Community 105 - "VoiceCapabilities"
Cohesion: 0.10
Nodes (15): OracleVoiceBackendConnection, VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState (+7 more)

### Community 106 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 107 - "pwa.ts"
Cohesion: 0.12
Nodes (28): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), activatePwaUpdate(), activePushSubscription(), applicationServerKey(), checkForPwaUpdate() (+20 more)

### Community 108 - "session-patch-browser.ts"
Cohesion: 0.11
Nodes (28): pageFor(), advance(), Connection, connections, content(), FrameMeasurement, lastHeading(), message() (+20 more)

### Community 109 - ".discoverSessions"
Cohesion: 0.11
Nodes (8): normalizedTitle(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), StartupPhases

### Community 110 - "backgroundTasksFromEvents"
Cohesion: 0.17
Nodes (30): addActivity(), backgroundHandoff(), backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue(), eventString(), eventTask() (+22 more)

### Community 111 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (16): FakeVoiceEngineCall, apps, config, configFixture(), createManager(), issueTicket(), localRuntime(), otherAllowed (+8 more)

### Community 112 - "ScheduleWorktreeService"
Cohesion: 0.17
Nodes (13): execute, failure(), missing(), ScheduleWorktreeService, execute, git(), folder, SCHEDULE_WORKTREE_VERSION (+5 more)

### Community 113 - "capture-workspace.ts"
Cohesion: 0.13
Nodes (24): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+16 more)

### Community 114 - "dreamer-planner.ts"
Cohesion: 0.14
Nodes (26): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+18 more)

### Community 115 - "dreamer-service.ts"
Cohesion: 0.12
Nodes (23): DREAMER_MAX_ITEMS, DreamerPlanDraft, DreamerPlannerInput, projectDreamerRegistry(), projectRegistryEntry(), dreamerScheduleDecision, digest(), DreamerPlannerExecutionInput (+15 more)

### Community 116 - "sampler.ts"
Cohesion: 0.12
Nodes (24): counter(), counterDelta(), CpuCounters, cpuUtilization(), DeviceByteCounters, DeviceCounters, deviceRates(), isWholeDisk() (+16 more)

### Community 117 - "normalizeKnowledgeRelativePath"
Cohesion: 0.13
Nodes (25): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+17 more)

### Community 118 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (16): cancelManager(), removeQueuedManagerMessage(), resolveManagerConfirmation(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+8 more)

### Community 119 - "use-markdown-document.test.tsx"
Cohesion: 0.10
Nodes (13): DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), defaultDocumentRenderer(), DocumentRenderer, DocumentRendererContext, RendererWorker, synchronousRenderer (+5 more)

### Community 120 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 121 - "HubEvent"
Cohesion: 0.13
Nodes (8): ComputerManagerEvents, HubEventSource, ScheduleNotificationService, input(), now, run(), HubEvent, ScheduleRunNotification

### Community 122 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (16): phases, port, app(), directories, headers, launcher, createStartupPhases(), startManagedServer() (+8 more)

### Community 123 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 124 - "pipeline.ts"
Cohesion: 0.13
Nodes (24): holdingRenderer(), openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), render, scope, documentOpening() (+16 more)

### Community 125 - "manager-uploads.ts"
Cohesion: 0.15
Nodes (13): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+5 more)

### Community 126 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 127 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (23): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus() (+15 more)

### Community 128 - "agent-service.test.ts"
Cohesion: 0.13
Nodes (14): terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+6 more)

### Community 129 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 130 - "VoiceAudioFrame"
Cohesion: 0.10
Nodes (7): QueuedAudio, BrowserCaptureOptions, rawBuffer(), SocketInbox, AudioReservation, VoiceAudioFrame, OracleVoicePlayback

### Community 131 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (20): NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+12 more)

### Community 132 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 133 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 134 - "ManagerStructuredMemoryStore"
Cohesion: 0.24
Nodes (5): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState

### Community 135 - "SettingsProfileSnapshot"
Cohesion: 0.14
Nodes (9): WorkspaceFixtureState, SettingsProfileState, SettingsProfileRecord, SettingsProfileSnapshot, settingsProfileCacheKey, SettingsProfileTransport, cached(), FakeHub (+1 more)

### Community 136 - "KnowledgeStore"
Cohesion: 0.21
Nodes (5): KnowledgeStore, parseMetadata(), readOptional(), fixture(), createHub()

### Community 138 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 139 - "NotificationRecord"
Cohesion: 0.19
Nodes (15): NotificationRecord, FeatureEvent, listeners, publishFeatureEvent(), subscribeFeatureEvents(), NotificationGroup, notificationGroups(), NotificationTab (+7 more)

### Community 140 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 141 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 142 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 143 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 144 - "ManagerProactiveInbox"
Cohesion: 0.22
Nodes (4): ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, nowIso(), openInbox()

### Community 145 - "session-patches.test.ts"
Cohesion: 0.17
Nodes (8): nextVoiceControl(), Client, Browser, seedOffset, session(), HubResyncRequest, HubWireEvent, SessionPatchReceiver

### Community 146 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 147 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 148 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 149 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 150 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (18): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+10 more)

### Community 151 - "SessionKnowledgeStore"
Cohesion: 0.24
Nodes (3): bindingKey(), SessionKnowledgeStore, SessionKnowledgeBinding

### Community 152 - "session-provenance.test.ts"
Cohesion: 0.18
Nodes (9): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, directories, session (+1 more)

### Community 153 - "SessionOriginBadge.test.tsx"
Cohesion: 0.19
Nodes (12): SessionProvenance, readScheduleLink(), ScheduleLink, scheduleNotificationLabel(), PreviewFeaturesContext, sessionOriginDescription(), icons, labels (+4 more)

### Community 154 - "ActivityDetails.tsx"
Cohesion: 0.22
Nodes (16): activityDetailFailure, detailKey(), formatBytes(), keep(), kept, keptActivityDetail(), loadActivityDetail(), peekActivityDetail() (+8 more)

### Community 155 - "session-latency-benchmark.ts"
Cohesion: 0.22
Nodes (17): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+9 more)

### Community 156 - "oracle-status.test.ts"
Cohesion: 0.19
Nodes (14): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+6 more)

### Community 157 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 158 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 159 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (10): client(), delayQueueWrite(), disk, exec, gate(), holdQueueCommit(), NativeFixture, NativeRuntime (+2 more)

### Community 160 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (13): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+5 more)

### Community 161 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 162 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 163 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 164 - "session-unread.pw.ts"
Cohesion: 0.13
Nodes (9): bounds(), devices, edgeState(), open(), screenshot(), unreadState(), BACKGROUND_SESSION_ID, fixtureBackgroundTasks (+1 more)

### Community 165 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 166 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 167 - "SettingsProfileStore"
Cohesion: 0.18
Nodes (8): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileStore, directories, store()

### Community 168 - "ActivityRow.tsx"
Cohesion: 0.25
Nodes (13): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, TOOL_CALL_ID_PATTERN, toolCallIdFromActivityId(), activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+5 more)

### Community 169 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 170 - "closed-session-sweeper.ts"
Cohesion: 0.17
Nodes (5): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS

### Community 171 - "dreamer-schedule.ts"
Cohesion: 0.24
Nodes (14): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), DreamerScheduleReason, exactCandidates() (+6 more)

### Community 172 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 173 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 174 - "registerSessionKnowledgeRoutes"
Cohesion: 0.29
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 175 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 176 - "oracle-voice-routes.test.ts"
Cohesion: 0.15
Nodes (8): openApps, openSockets, RouteManager, runtime(), testRoot(), testRoots, trusted, voiceConfig

### Community 177 - "RuntimeStatus.tsx"
Cohesion: 0.27
Nodes (8): families, modelFamily, repositoryModels, RuntimeStatus(), session, glyphs, ModelFamilyIcon(), RuntimeModelName()

### Community 178 - "use-oracle-attachments.ts"
Cohesion: 0.26
Nodes (13): uploadManagerFile(), attachmentSize(), OracleAttachmentChips(), OracleMessageAttachments(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments() (+5 more)

### Community 179 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 180 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 181 - "registerHostTelemetryRoutes"
Cohesion: 0.23
Nodes (8): HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, registerHostTelemetryRoutes(), HostTelemetrySocket

### Community 182 - "knowledge-store.ts"
Cohesion: 0.16
Nodes (9): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, PersistedKnowledgeState, directories (+1 more)

### Community 183 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 184 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 185 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 186 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 187 - ".observe"
Cohesion: 0.21
Nodes (7): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId()

### Community 188 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 189 - ".initialize"
Cohesion: 0.22
Nodes (5): initializeManagerStructuredMemory(), isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, open()

### Community 190 - "session-resource-clear.test.ts"
Cohesion: 0.17
Nodes (12): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+4 more)

### Community 191 - "BackgroundTasksDialog.tsx"
Cohesion: 0.26
Nodes (10): BackgroundTask, BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 192 - "DialogFrame.tsx"
Cohesion: 0.28
Nodes (10): changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame(), hubSignInExpired() (+2 more)

### Community 193 - "ShellNavigation.test.tsx"
Cohesion: 0.31
Nodes (6): ClientFeature, railEntries(), initials(), useDisplayName(), DisplayNameSetting(), ShellNavigation()

### Community 194 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 195 - "pending-echo.ts"
Cohesion: 0.28
Nodes (9): nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes(), sameText() (+1 more)

### Community 196 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 197 - "ChatMessage"
Cohesion: 0.21
Nodes (10): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp(), StoredSession, ChatMessage (+2 more)

### Community 198 - "ActivityRow.test.tsx"
Cohesion: 0.20
Nodes (7): ActivityStatus, ActivityRow, bashDetail(), output, raw, runningDetail(), text()

### Community 199 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 200 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 202 - "isRecord"
Cohesion: 0.29
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 204 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 205 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 206 - "normalizeBackgroundTask"
Cohesion: 0.24
Nodes (9): attachmentModeValue(), MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH, normalizeBackgroundTask(), numberValue(), progressValue(), statusValue(), lifecycleEvent() (+1 more)

### Community 207 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 208 - ".persist"
Cohesion: 0.24
Nodes (3): SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, stateWithPaths()

### Community 209 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 210 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 211 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 212 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 213 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 214 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 215 - "closed-sessions.ts"
Cohesion: 0.36
Nodes (6): closedSessionContext(), closedSessionExpiresAt(), excerpt(), isClosedSessionContext(), said(), ClosedSessionContext

### Community 216 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 217 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 218 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 219 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 220 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 221 - "KnowledgePosition"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 222 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 223 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 225 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 226 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 227 - "use-foreground-handoff.ts"
Cohesion: 0.47
Nodes (3): foregroundHandoffTimeoutMs, Handoff, useForegroundHandoff()

### Community 228 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 229 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 233 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **1432 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1427 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2398 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `copilotFixture()` connect `session-reply-durability.test.ts` to `AgentService`, `SessionStore`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `agent-service.ts`, `contracts.ts`, `recovery-resend-durability.test.ts`, `claude-agent-service.ts`, `session-directory.ts`, `.discoverSessions`, `TerminalSessionController`, `CopilotSessionLike`, `background-task-adapter.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ComputerManager` connect `ManagedSession` to `claude-agent-service.ts`, `session-knowledge-routes.test.ts`, `contracts.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1432 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03611683432311235 - nodes in this community are weakly interconnected._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.02923709456372773 - nodes in this community are weakly interconnected._
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
- `e2e/ui-locks.pw.ts-snapshots/desktop-conversation-tool-rows-chromium-linux.png`
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
- `e2e/ui-locks.pw.ts-snapshots/foldable-conversation-tool-rows-chromium-linux.png`
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
- `e2e/ui-locks.pw.ts-snapshots/phone-conversation-tool-rows-chromium-linux.png`
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
