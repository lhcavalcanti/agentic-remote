# Agentic Remote - Graphify code map

Snapshot: `e671ade0cfdb6da833d4de6cb1e3ede17ccfbaffc4626f6f35561158508e0eae`

Source checkout: `55ae0d66d019c346e0fb673fea7990191075fde9`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 654 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 654 files · ~1,158,998 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9145 nodes · 26317 edges · 286 communities (235 shown, 33 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1316 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- AppWorkspace
- SessionStore
- SessionDetail
- contracts.ts
- App.tsx
- App.test.tsx
- ManagedSession
- agent-service.ts
- client.ts
- computer-manager.ts
- app.ts
- ManagerStore
- FakeVoiceEngine
- oracle-voice.ts
- terminal-session.ts
- schedule-launcher.test.ts
- OracleVoiceCoordinator
- oracle-voice-soak.ts
- AppSettingsDialog.tsx
- dreamer-store.ts
- agentic-remote-promotion-monitor
- node-routes.ts
- manager-tools.ts
- ManagerAgent
- notification-center-service.ts
- notification-classifier.ts
- oracle-voice-integration.test.ts
- session-presentation.ts
- RemoteNodeClient
- oracle-task-store.ts
- CopilotClientLike
- background-task-adapter.ts
- CopilotSessionLike
- recovery-resend-durability.test.ts
- manager-structured-memory-validation.ts
- TmuxTerminalSessionController
- hub-routes.ts
- api.ts
- session-knowledge-routes.test.ts
- sampler.ts
- tmux-test-helpers.ts
- VoicePlayback
- ProviderSessionService
- ui-locks.pw.ts
- DreamerService
- ScheduleRun
- SchedulerStore
- fake-voice.ts
- ManagerMessage
- .sendInternal
- OracleDreamer.tsx
- agentic-remote
- PreviewFeaturesSettings.test.tsx
- oracle-voice-session.ts
- ManagerAssistant.tsx
- workspace-fixtures.ts
- oracle-voice-benchmark.ts
- dreamer-progress.ts
- agentic-remote-gate
- PushNotificationService
- bundle
- request
- processes.ts
- normalizeKnowledgeRelativePath
- scheduler-store.ts
- setupWorkspaceFixture
- .takeInTranscript
- oracle-voice-child.ts
- ResidentVoiceWorker
- pwa.ts
- active-sessions.ts
- oracle-voice-security.test.ts
- terminal-session.test.ts
- shell.ts
- lib.rs
- schedule-recurrence.ts
- dependencies
- ChildVoiceEngine
- .discoverSessions
- background-task-stop.test.ts
- manager-agent.ts
- terminal-startup-queue.test.ts
- ManagerMemory
- manager-proactive-coordinator.ts
- agentic-remote-promotion-setup
- manager-proactive-inbox.ts
- SessionOrderStore
- knowledge-tree.ts
- devDependencies
- config.rs
- agent-service.test.ts
- oracle-voice-routes.ts
- tmux-errors.integration.test.ts
- manager-agent.test.ts
- RecentlyClosed.tsx
- manager.ts
- src/settings-profile.ts
- manager-context.ts
- BackgroundTasksDialog.tsx
- remote-voice-client.ts
- KnowledgeStore
- manager-structured-memory.ts
- FakeSessionService
- ScheduleWorktreeService
- markdown-navigation.ts
- ManagerSnapshot
- shared/settings-profile.ts
- dreamer-planner.ts
- oracle-voice-worker.ts
- oracle-voice-segments.ts
- send-matrix.integration.test.ts
- session-patch-browser.ts
- real-voice.ts
- ComposerActions.tsx
- host-telemetry.ts
- oracle-voice-routes.test.ts
- capture-workspace.ts
- schedules.ts
- pipeline.ts
- renderer.ts
- session-directory.ts
- HostTelemetrySampler
- cli-canary.ts
- .toolHost
- ManagerProactiveInbox
- scripts
- dreamer-service.test.ts
- manager-structured-memory-search.ts
- SettingsProfileClient
- .recoverSdkSession
- feature-flags.ts
- HostMonitorView.test.tsx
- transcription-service.ts
- sections.tsx
- use-markdown-document.ts
- compilerOptions
- react
- oracle-voice-config.ts
- ManagerStructuredMemoryStore
- ScheduleProposalCards.tsx
- delegated-transcription-service.ts
- VoiceCapture
- oracle-voice-tickets.ts
- SessionKnowledgeStore
- use-oracle-attachments.ts
- NotificationRecord
- compilerOptions
- dreamer-service.ts
- full-gate.test.ts
- service.ts
- response-compression.test.ts
- session-reply-durability.test.ts
- session-store-providers.test.ts
- PromptCards.tsx
- session-response-order.ts
- compilerOptions
- .replyUserInputInternal
- .createSession
- session-patches.test.ts
- SessionKnowledgeBinding
- OnlineRecognizer
- workspace-browser.ts
- preview-features.ts
- MessageTime.tsx
- compilerOptions
- compilerOptions
- oracle-status.test.ts
- file-upload-routes.ts
- promotion-monitor.test.ts
- session-knowledge-store.ts
- ActivityDetails.tsx
- BoundedQueue
- ReaderWorkspace
- session-unread.pw.ts
- scripts
- session-latency-benchmark.ts
- dreamer-schedule.ts
- session-knowledge-routes.ts
- SessionStatus
- .persist
- server/session-patches.ts
- server/skill-settings.ts
- terminal-form-deadline.test.ts
- closed-session-sweeper.ts
- registerSessionKnowledgeRoutes
- LargeSessionService
- session-resource-routes.test.ts
- composer/types.ts
- capture.ts
- check-workspace-review-regressions.ts
- manager-automatic.ts
- package.json
- server/side-question.ts
- oracle-voice-assets.test.ts
- VoiceWorkerParentMessage
- .snapshot
- use-oracle-settings.ts
- pending-echo.ts
- fake-vad.ts
- desktop.json
- session-resource-clear.test.ts
- session-resource-providers.test.ts
- ActivityRow.tsx
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- agent-service-event-projection.test.ts
- ChatMessage
- transport.test.ts
- TranscriptionError
- Pcm16Resampler
- document-render.pw.ts
- manager-proactive-inbox.test.ts
- ActivityRow.test.tsx
- html-preview.ts
- sign-in-expired.pw.ts
- command-catalog-cache.test.ts
- .initialize
- SessionAdmissions
- VoiceVadOptions
- dataset
- generate-pwa-icons.ts
- bridge.rs
- vite.config.ts
- history-projection.test.ts
- alerts.test.ts
- HostSnapshot
- logs-cli.test.ts
- manager-structured-memory-performance.test.ts
- promotion-setup-execution.test.ts
- SkillsSettings.tsx
- use-markdown-document.test.tsx
- VoiceCaptureOptions
- doctor-cli.test.ts
- release-publication.test.ts
- SkillSettingsService
- vad-assets.ts
- oracle-conversation-real.test.ts
- skill-settings-jsonc.ts
- composer-layout.test.ts
- settings.ts
- DocumentViewControls.tsx
- HostAlertMonitor
- HostTelemetryClock
- ManagerProactiveInboxValidationError
- VoiceSttEngine
- promotion-setup.test.ts
- copyText
- VoiceCaptureDependencies
- terminal-send-uncertainty.test.ts
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

## Communities (286 total, 33 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (14): agentMode(), AgentService, foregroundTurnOpen(), isForegroundCompletionEvent(), isTerminalNotReadyRefusal(), removeCopilotSessionFiles(), sessionInUseConflictMessage(), sessionInUseQueueMessage() (+6 more)

### Community 1 - "AppWorkspace"
Cohesion: 0.03
Nodes (183): askSession(), closeSession(), deleteKnowledgeRoot(), listClosedSessions(), replyPermission(), saveHiddenSessionVisibility(), saveSessionHidden(), saveSessionUnread() (+175 more)

### Community 2 - "SessionStore"
Cohesion: 0.03
Nodes (93): fixture(), restart(), directories, fakeClient(), fixture(), ForkRequest, forkSession(), services (+85 more)

### Community 3 - "SessionDetail"
Cohesion: 0.04
Nodes (14): ClaudeAgentService, isMissingClaudeSessionError(), observe(), answer(), claudeQuestions(), claudeRequest(), copilotRequest(), assertSessionNotRetained() (+6 more)

### Community 4 - "contracts.ts"
Cohesion: 0.03
Nodes (71): TerminalFormContinuation, ClaudeAgentServiceEvents, DirectoryScope, ClaudeFakeSessionService, directories, openNodeVoiceSocket(), routingFixture(), session() (+63 more)

### Community 5 - "App.tsx"
Cohesion: 0.03
Nodes (89): isManagerEvent(), ActivityRowStates, sidebarResizeMove(), sidebarTouchStart(), bindingMatches(), clampSidebarWidth(), clearStored(), clipboardImageExtensions (+81 more)

### Community 6 - "App.test.tsx"
Cohesion: 0.03
Nodes (92): addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), checkHubSignIn(), clearConversation(), configureRetention(), createOracleVoiceTicket() (+84 more)

### Community 7 - "ManagedSession"
Cohesion: 0.06
Nodes (23): ClientPresence, PRESENCE_TTL_MS, ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier (+15 more)

### Community 8 - "agent-service.ts"
Cohesion: 0.04
Nodes (96): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+88 more)

### Community 9 - "client.ts"
Cohesion: 0.05
Nodes (36): VoiceCapabilities, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord() (+28 more)

### Community 10 - "computer-manager.ts"
Cohesion: 0.05
Nodes (72): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+64 more)

### Community 11 - "app.ts"
Cohesion: 0.03
Nodes (67): buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe(), transcriptionComputerName(), directories, runtimes, trusted (+59 more)

### Community 12 - "ManagerStore"
Cohesion: 0.05
Nodes (39): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+31 more)

### Community 13 - "FakeVoiceEngine"
Cohesion: 0.03
Nodes (42): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, apps, directories (+34 more)

### Community 14 - "oracle-voice.ts"
Cohesion: 0.04
Nodes (54): config, FakeSherpaStream, QueuedAudio, AudioReservation, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions (+46 more)

### Community 15 - "terminal-session.ts"
Cohesion: 0.04
Nodes (86): afterExit(), boxedComposerFrame(), busyRowStatus(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus() (+78 more)

### Community 16 - "schedule-launcher.test.ts"
Cohesion: 0.04
Nodes (59): ClaudeSdk, awaitTermination(), LaunchCreations, apps, directories, directory(), runtime(), services (+51 more)

### Community 17 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (22): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+14 more)

### Community 18 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (36): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+28 more)

### Community 19 - "AppSettingsDialog.tsx"
Cohesion: 0.05
Nodes (73): activateSession(), createSession(), getProviderRuntimeOptions(), listDirectories(), listHistory(), sendTestPushNotification(), AddKnowledgeRootDialog(), browse() (+65 more)

### Community 20 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (46): validateDreamerTimeZone(), assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+38 more)

### Community 21 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 22 - "node-routes.ts"
Cohesion: 0.04
Nodes (36): activityDetailsUnavailable(), activityNotInLog(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), closeReason(), closeVoiceSocket(), configureRuntimeSchema (+28 more)

### Community 23 - "manager-tools.ts"
Cohesion: 0.05
Nodes (38): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+30 more)

### Community 24 - "ManagerAgent"
Cohesion: 0.08
Nodes (12): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, uniqueManagerSessionRefs() (+4 more)

### Community 25 - "notification-center-service.ts"
Cohesion: 0.05
Nodes (38): HOST_ALERT_POLL_INTERVAL_MS, center(), directories, directory(), hub(), now, runtimes, trusted (+30 more)

### Community 26 - "notification-classifier.ts"
Cohesion: 0.06
Nodes (47): ComputerManagerEvents, attentionClosed(), attentionSeed(), classifyHostNotification(), classifyHubNotification(), classifyOracleNotification(), classifyScheduleNotification(), HOST_ALERT_MEMORY_DURATION_MS (+39 more)

### Community 27 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+24 more)

### Community 28 - "session-presentation.ts"
Cohesion: 0.05
Nodes (61): SessionInterruptionCause, SessionProvenance, saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, readScheduleLink(), ScheduleLink (+53 more)

### Community 29 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (19): WorkspaceFixtureOptions, RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, requestBytes(), client(), servers (+11 more)

### Community 30 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (45): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+37 more)

### Community 31 - "CopilotClientLike"
Cohesion: 0.03
Nodes (27): complete(), event(), sessionWithLog(), start(), CopilotClientLike, holdProbe(), fixtures, gate() (+19 more)

### Community 32 - "background-task-adapter.ts"
Cohesion: 0.09
Nodes (62): addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo (+54 more)

### Community 33 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (30): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+22 more)

### Community 34 - "recovery-resend-durability.test.ts"
Cohesion: 0.04
Nodes (42): root, script, directories, disk, fixture(), gate(), gates, httpBoundary() (+34 more)

### Community 35 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 36 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (17): isSessionScopeLauncher(), sessionLaunchCommand(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors() (+9 more)

### Community 37 - "hub-routes.ts"
Cohesion: 0.04
Nodes (48): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+40 more)

### Community 38 - "api.ts"
Cohesion: 0.06
Nodes (48): AddKnowledgeRootInput, ManagedQueuedPromptDispatchResult, PushSettings, SessionKnowledgeRootMutationInput, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, activityArgumentFormats (+40 more)

### Community 39 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (31): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+23 more)

### Community 40 - "sampler.ts"
Cohesion: 0.08
Nodes (45): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+37 more)

### Community 41 - "tmux-test-helpers.ts"
Cohesion: 0.09
Nodes (46): startAgentAfterClear(), exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, Screens (+38 more)

### Community 42 - "VoicePlayback"
Cohesion: 0.07
Nodes (15): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, OracleVoiceClientDependencies, FakePlayback, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource (+7 more)

### Community 44 - "ui-locks.pw.ts"
Cohesion: 0.07
Nodes (34): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+26 more)

### Community 45 - "DreamerService"
Cohesion: 0.12
Nodes (9): DreamerMemoryMetadata, digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerSnapshot (+1 more)

### Community 46 - "ScheduleRun"
Cohesion: 0.13
Nodes (11): provenance(), SessionScheduleLauncher, session(), ScheduleLauncher, ScheduleLaunchRefusedError, SchedulerDispatcher, ScheduleReconciliation, registerSchedulerRoutes() (+3 more)

### Community 47 - "SchedulerStore"
Cohesion: 0.11
Nodes (8): fixture(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, ScheduleProposal, Schedule, ScheduleRunStatus

### Community 48 - "fake-voice.ts"
Cohesion: 0.07
Nodes (9): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, installFakeBrowserVoice(), ScriptedUtterance, startFixtureServer() (+1 more)

### Community 49 - "ManagerMessage"
Cohesion: 0.06
Nodes (19): FakeManager, FakeVoiceState, ProactiveManager, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError() (+11 more)

### Community 50 - ".sendInternal"
Cohesion: 0.11
Nodes (40): terminalComposerUnreadable(), activeBottomFrame(), backgroundShellsAllow(), captureBeforeDeadline(), captureForReplacement(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts() (+32 more)

### Community 51 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (42): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+34 more)

### Community 52 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 53 - "PreviewFeaturesSettings.test.tsx"
Cohesion: 0.08
Nodes (25): WorkspaceFixtureState, profileStore(), SettingsProfileState, SettingsProfileStore, directories, store(), applySettingsChanges(), applySettingsImport() (+17 more)

### Community 54 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (16): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), QueuedOutput (+8 more)

### Community 55 - "ManagerAssistant.tsx"
Cohesion: 0.07
Nodes (43): ManagerStatus, editQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline(), ActivityRow (+35 more)

### Community 56 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (34): frame(), geometry, output, scratch, screenshot(), { values }, oracleHostStatusFixture(), documents (+26 more)

### Community 57 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (39): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, deferred() (+31 more)

### Community 58 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, DreamerProgressSource (+11 more)

### Community 59 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 60 - "PushNotificationService"
Cohesion: 0.10
Nodes (10): start(), NotificationRecorder, HubEventSource, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema (+2 more)

### Community 61 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 62 - "request"
Cohesion: 0.10
Nodes (32): RuntimeModelOption, scheduleProposalSummary(), CLAUDE_SCHEDULE_UNAVAILABLE_REASON, scheduleProviderUnavailableReason(), ScheduleTarget, request(), FolderPicker(), browse() (+24 more)

### Community 63 - "processes.ts"
Cohesion: 0.09
Nodes (27): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+19 more)

### Community 64 - "normalizeKnowledgeRelativePath"
Cohesion: 0.08
Nodes (32): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+24 more)

### Community 65 - "scheduler-store.ts"
Cohesion: 0.07
Nodes (32): enableSchedulerTools(), NoopScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS, SchedulerDispatcherOptions, ScheduleStopAcknowledgement, ScheduleTargetUnavailableError (+24 more)

### Community 66 - "setupWorkspaceFixture"
Cohesion: 0.06
Nodes (23): desktop, devices, long, open(), phone, veryLong, bounds(), closedEarlier (+15 more)

### Community 67 - ".takeInTranscript"
Cohesion: 0.11
Nodes (22): backgroundShellsEvidence(), contextChangedInEvents(), createPendingUserInputTracker(), foregroundCompletedSince(), isLiveTask(), messagesFromHistory(), pendingUserInputFromEvents(), PendingUserInputTracker (+14 more)

### Community 68 - "oracle-voice-child.ts"
Cohesion: 0.07
Nodes (31): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, createVoiceWorker(), defaultSpawnPiper(), errorMessage() (+23 more)

### Community 69 - "ResidentVoiceWorker"
Cohesion: 0.13
Nodes (8): combinedTranscript(), matchesCancelled(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceGenerationIdentity, ActiveSynthesisIdentity, ActiveUtteranceIdentity

### Community 70 - "pwa.ts"
Cohesion: 0.10
Nodes (35): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), snapshot, gatewayRefused(), HUB_SIGN_IN_EXPIRED_MESSAGE, hubFetch() (+27 more)

### Community 71 - "active-sessions.ts"
Cohesion: 0.10
Nodes (31): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+23 more)

### Community 72 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (23): VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), connect(), createManager(), Inbox (+15 more)

### Community 73 - "terminal-session.test.ts"
Cohesion: 0.07
Nodes (31): execFileAsync, ProbeRun, SESSION_SCOPE, sessionScopeAvailable, sessionScopeProbe(), adapter, scope, parseTerminalUpdateNotice() (+23 more)

### Community 74 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 75 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 76 - "schedule-recurrence.ts"
Cohesion: 0.11
Nodes (36): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+28 more)

### Community 77 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 78 - "ChildVoiceEngine"
Cohesion: 0.13
Nodes (6): benchmarkGroup(), ChildVoiceEngine, errorMessage(), matchesSynthesis(), matchesUtterance(), VoiceChildProcess

### Community 79 - ".discoverSessions"
Cohesion: 0.09
Nodes (10): cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), cloneSession(), StartupPhases (+2 more)

### Community 80 - "background-task-stop.test.ts"
Cohesion: 0.10
Nodes (25): BackgroundTaskEventOptions, BackgroundTaskProjector, backgroundTasksFromEvents(), completed(), handoff(), launched(), nativeStart(), readExit() (+17 more)

### Community 81 - "manager-agent.ts"
Cohesion: 0.07
Nodes (26): DreamerProgressView, automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung (+18 more)

### Community 82 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (29): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+21 more)

### Community 83 - "ManagerMemory"
Cohesion: 0.10
Nodes (14): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits, failure(), ManagerUploads, referenceId (+6 more)

### Community 84 - "manager-proactive-coordinator.ts"
Cohesion: 0.11
Nodes (12): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, SessionLifecycle, directories (+4 more)

### Community 85 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 86 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, eventId(), hasExactKeys(), isDisposition(), isEventKind() (+29 more)

### Community 87 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 88 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (35): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+27 more)

### Community 89 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 90 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 91 - "agent-service.test.ts"
Cohesion: 0.09
Nodes (16): terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), DeferredSession, directories, FakeCopilotClient, normalSdkSessionConfiguration (+8 more)

### Community 92 - "oracle-voice-routes.ts"
Cohesion: 0.11
Nodes (33): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+25 more)

### Community 93 - "tmux-errors.integration.test.ts"
Cohesion: 0.08
Nodes (29): foreignSocketPlace(), execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer() (+21 more)

### Community 94 - "manager-agent.test.ts"
Cohesion: 0.09
Nodes (18): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+10 more)

### Community 95 - "RecentlyClosed.tsx"
Cohesion: 0.09
Nodes (26): CLOSED_SESSION_RETENTION_DAYS, closedSessionContext(), closedSessionExpiresAt(), excerpt(), isClosedSessionContext(), said(), ClosedSessionContext, markdownPlainText() (+18 more)

### Community 96 - "manager.ts"
Cohesion: 0.06
Nodes (22): MANAGER_MESSAGE_MAX_LENGTH, MANAGER_REMOVED_ATTACHMENTS_REASON, ManagerMessageRole, ManagerMessageState, ManagerSessionRef, ManagerSubmissionSource, ResolveManagerConfirmationInput, cancelManager() (+14 more)

### Community 97 - "src/settings-profile.ts"
Cohesion: 0.08
Nodes (28): isSettingsDeviceId(), isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues (+20 more)

### Community 98 - "manager-context.ts"
Cohesion: 0.12
Nodes (28): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+20 more)

### Community 99 - "BackgroundTasksDialog.tsx"
Cohesion: 0.12
Nodes (27): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+19 more)

### Community 100 - "remote-voice-client.ts"
Cohesion: 0.14
Nodes (15): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError() (+7 more)

### Community 101 - "KnowledgeStore"
Cohesion: 0.13
Nodes (13): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore, parseMetadata() (+5 more)

### Community 102 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 104 - "ScheduleWorktreeService"
Cohesion: 0.14
Nodes (14): execute, failure(), missing(), ScheduleWorktreeService, execute, git(), node(), folder (+6 more)

### Community 105 - "markdown-navigation.ts"
Cohesion: 0.12
Nodes (30): searchWorkspace(), followMarkdownLink(), KnowledgeReader(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), navigateDocument(), submitSearch() (+22 more)

### Community 106 - "ManagerSnapshot"
Cohesion: 0.09
Nodes (13): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+5 more)

### Community 107 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (29): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+21 more)

### Community 108 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (30): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+22 more)

### Community 109 - "oracle-voice-worker.ts"
Cohesion: 0.09
Nodes (27): VoiceWorkerOptions, VoiceEndUtterance, VoiceSynthesisRequest, VoiceTtsEngine, capabilityFromConfig(), ChildVoiceEngineDependencies, defaultDependencies(), exactKeys() (+19 more)

### Community 110 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 111 - "send-matrix.integration.test.ts"
Cohesion: 0.07
Nodes (28): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+20 more)

### Community 112 - "session-patch-browser.ts"
Cohesion: 0.11
Nodes (28): pageFor(), advance(), Connection, connections, content(), FrameMeasurement, lastHeading(), message() (+20 more)

### Community 113 - "real-voice.ts"
Cohesion: 0.11
Nodes (13): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+5 more)

### Community 114 - "ComposerActions.tsx"
Cohesion: 0.12
Nodes (14): families, modelFamily, repositoryModels, composerSteeringUnavailableReason(), ComposerActions(), ContextRing(), RuntimeStatus(), session (+6 more)

### Community 115 - "host-telemetry.ts"
Cohesion: 0.09
Nodes (25): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, aggregate (+17 more)

### Community 116 - "oracle-voice-routes.test.ts"
Cohesion: 0.09
Nodes (15): exactArrayBuffer(), rawDataBuffer(), receiveNodeVoiceMessage(), ObservedLocalVoiceBackend, openApps, openSockets, RouteManager, RouteVoiceBackend (+7 more)

### Community 117 - "capture-workspace.ts"
Cohesion: 0.13
Nodes (24): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+16 more)

### Community 118 - "schedules.ts"
Cohesion: 0.11
Nodes (25): cronExpression, DEFAULT_SCHEDULE_TIMEZONE, identifier, SCHEDULE_MIN_SPACING_MINUTES, SCHEDULE_PROMPT_MAX_LENGTH, scheduleAbandonSchema, scheduleActionSchema, scheduleArchivedSchema (+17 more)

### Community 119 - "pipeline.ts"
Cohesion: 0.13
Nodes (24): partlyHeldRenderer(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform(), drawSteps(), growable, htmlBlocks (+16 more)

### Community 120 - "renderer.ts"
Cohesion: 0.11
Nodes (15): render, scope, DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), defaultDocumentRenderer(), DocumentRenderer, DocumentRendererContext (+7 more)

### Community 121 - "session-directory.ts"
Cohesion: 0.18
Nodes (20): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+12 more)

### Community 122 - "HostTelemetrySampler"
Cohesion: 0.12
Nodes (10): prefixes, session, trusted, untrusted, HostTelemetrySampler, HostTelemetryService, readingFixture(), make() (+2 more)

### Community 123 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 124 - ".toolHost"
Cohesion: 0.11
Nodes (4): ManagerHub, CreateSessionInput, PermissionReplyInput, RenameSessionInput

### Community 125 - "ManagerProactiveInbox"
Cohesion: 0.15
Nodes (10): ManagerProactiveInbox, ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, nowIso(), publicEvent() (+2 more)

### Community 126 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 127 - "dreamer-service.test.ts"
Cohesion: 0.08
Nodes (14): DreamerMemoryMetadataRecord, dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema (+6 more)

### Community 128 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 129 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 131 - "feature-flags.ts"
Cohesion: 0.18
Nodes (18): hub(), AppVersion, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable() (+10 more)

### Community 132 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 133 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 134 - "sections.tsx"
Cohesion: 0.15
Nodes (15): AppearanceSetting, NewSessionBackendSetting, getHubHealth(), PreviewFeaturesSettings(), SettingScope(), HealthCard(), accentThemes, appearanceOptions (+7 more)

### Community 135 - "use-markdown-document.ts"
Cohesion: 0.16
Nodes (19): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+11 more)

### Community 136 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 137 - "react"
Cohesion: 0.13
Nodes (13): react, transcribeAudio(), UserMessage, drawDiagram(), drawing, MermaidDiagram(), PauseFollowingContext, sentMessageLength (+5 more)

### Community 138 - "oracle-voice-config.ts"
Cohesion: 0.15
Nodes (20): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+12 more)

### Community 139 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 140 - "ScheduleProposalCards.tsx"
Cohesion: 0.17
Nodes (20): getSchedule(), listScheduleProposals(), resolveScheduleProposal(), days, labels, proposalChanges(), proposalConsequence(), proposalSchedule (+12 more)

### Community 141 - "delegated-transcription-service.ts"
Cohesion: 0.14
Nodes (11): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload (+3 more)

### Community 143 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 144 - "SessionKnowledgeStore"
Cohesion: 0.16
Nodes (7): SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases, root()

### Community 145 - "use-oracle-attachments.ts"
Cohesion: 0.18
Nodes (19): codeExtensions, fileTypes, managerFileValidationError(), MAX_MANAGER_FILE_BYTES, MAX_MANAGER_TEXT_BYTES, textTypes, removeManagerFile(), uploadManagerFile() (+11 more)

### Community 146 - "NotificationRecord"
Cohesion: 0.19
Nodes (15): NotificationRecord, FeatureEvent, listeners, publishFeatureEvent(), subscribeFeatureEvents(), NotificationGroup, notificationGroups(), NotificationTab (+7 more)

### Community 147 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 148 - "dreamer-service.ts"
Cohesion: 0.17
Nodes (19): DreamerPlanDraft, DreamerPlannerInput, DreamerProgressLimits, boundedText(), DreamerPlannerExecutionInput, DreamerServiceOptions, safeRunError(), unavailableSnapshot() (+11 more)

### Community 149 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 150 - "service.ts"
Cohesion: 0.17
Nodes (9): HostRequest, registerHostTelemetryRoutes(), HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError(), HostTelemetryTarget, HostTelemetrySocket, HOST_TELEMETRY_INVALID_CODE (+1 more)

### Community 151 - "response-compression.test.ts"
Cohesion: 0.14
Nodes (18): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), apps (+10 more)

### Community 152 - "session-reply-durability.test.ts"
Cohesion: 0.16
Nodes (16): assistantFixture(), claudeFixture(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer, fallbackFormFixture() (+8 more)

### Community 153 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 154 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 155 - "session-response-order.ts"
Cohesion: 0.16
Nodes (19): applyComputerSnapshot(), computerAdded(), computerRemoved(), discardUnpairedComputers(), forgetComputerKnowledge(), liftUnpairedTombstones(), tombstoneUnpairedSession(), sortSessions() (+11 more)

### Community 156 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 157 - ".replyUserInputInternal"
Cohesion: 0.21
Nodes (3): isUncertainDelivery(), persistedFormAnswer(), TerminalFormReplyError

### Community 158 - ".createSession"
Cohesion: 0.15
Nodes (4): isRuntimeReasoningEffort(), RuntimeConfigurationError, SideQuestionError, withSideQuestionTimeout()

### Community 159 - "session-patches.test.ts"
Cohesion: 0.17
Nodes (7): nextVoiceControl(), Client, Browser, seedOffset, HubResyncRequest, HubWireEvent, SessionPatchReceiver

### Community 160 - "SessionKnowledgeBinding"
Cohesion: 0.15
Nodes (9): bindingKey(), RootCatalog, SessionKnowledgeConflictError, SessionKnowledgeEvents, stateSchema, SessionKnowledgeBinding, UpdateSessionKnowledgeRootInput, SessionKnowledgeRequestError (+1 more)

### Community 161 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 162 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (16): assertOpenedFilePath(), fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath() (+8 more)

### Community 163 - "preview-features.ts"
Cohesion: 0.24
Nodes (10): ClientFeature, railEntries(), PreviewFeaturesContext, usePreviewFeature(), usePreviewFeatures(), initials(), useDisplayName(), DisplayNameSetting() (+2 more)

### Community 164 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 165 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 166 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 167 - "oracle-status.test.ts"
Cohesion: 0.18
Nodes (15): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+7 more)

### Community 168 - "file-upload-routes.ts"
Cohesion: 0.18
Nodes (10): FileUploadError, registerFileUploadRoutes(), SessionParams, registerTranscriptionRoutes(), transcriptionMultipartOptions, extension(), MAX_SESSION_FILE_BYTES, sessionFileValidationError() (+2 more)

### Community 169 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 170 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (16): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+8 more)

### Community 171 - "ActivityDetails.tsx"
Cohesion: 0.23
Nodes (15): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, TOOL_CALL_ID_PATTERN, activityDetailFailure, detailKey(), formatBytes(), keep(), kept, keptActivityDetail() (+7 more)

### Community 172 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 173 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 174 - "session-unread.pw.ts"
Cohesion: 0.13
Nodes (9): bounds(), devices, edgeState(), open(), screenshot(), unreadState(), BACKGROUND_SESSION_ID, fixtureBackgroundTasks (+1 more)

### Community 175 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 176 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 177 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (15): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+7 more)

### Community 178 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 179 - "SessionStatus"
Cohesion: 0.16
Nodes (12): Seen, ManagerProactiveInboxObservation, PersistedCursor, NotificationCursor, Row, SdkRestartRecovery, FinishedSession, SessionUnreadTracker (+4 more)

### Community 180 - ".persist"
Cohesion: 0.21
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 181 - "server/session-patches.ts"
Cohesion: 0.21
Nodes (8): diffMessages(), Publication, sameField(), sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 182 - "server/skill-settings.ts"
Cohesion: 0.19
Nodes (12): builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), scalar(), skillFrontmatter(), SkillRoot, SKILL_SETTINGS_CAPABILITY (+4 more)

### Community 183 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 184 - "closed-session-sweeper.ts"
Cohesion: 0.17
Nodes (5): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS

### Community 185 - "registerSessionKnowledgeRoutes"
Cohesion: 0.26
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 187 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 188 - "composer/types.ts"
Cohesion: 0.23
Nodes (6): AttachmentStrip(), Composer(), QueuedPromptList(), SlashCommandMenu(), ComposerAttachment, ComposerProps

### Community 189 - "capture.ts"
Cohesion: 0.17
Nodes (10): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, validateIdentity(), VoiceCaptureError (+2 more)

### Community 190 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 191 - "manager-automatic.ts"
Cohesion: 0.22
Nodes (11): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+3 more)

### Community 192 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 193 - "server/side-question.ts"
Cohesion: 0.17
Nodes (10): TerminalDiscoveryError, DiscoveredSession, SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), sideQuestionPrompt(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 194 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 195 - "VoiceWorkerParentMessage"
Cohesion: 0.19
Nodes (6): FakeChildProcess, initialize(), InProcessVoiceChild, parentHarness(), VoiceWorker, VoiceWorkerParentMessage

### Community 196 - ".snapshot"
Cohesion: 0.30
Nodes (8): readBounded(), revision(), registerSkillSettingsRoutes(), SkillSettingsTarget, settingsObject(), SkillSettingsError, SkillSettingsSnapshot, SkillToggle

### Community 197 - "use-oracle-settings.ts"
Cohesion: 0.24
Nodes (12): getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+4 more)

### Community 198 - "pending-echo.ts"
Cohesion: 0.24
Nodes (11): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, PendingEchoOwner, prunePendingEchoMap() (+3 more)

### Community 199 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 200 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 201 - "session-resource-clear.test.ts"
Cohesion: 0.19
Nodes (11): apps, directories, directory(), pairedFixture(), providerFixture(), providers, seed(), sockets (+3 more)

### Community 202 - "session-resource-providers.test.ts"
Cohesion: 0.22
Nodes (13): claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures (+5 more)

### Community 203 - "ActivityRow.tsx"
Cohesion: 0.33
Nodes (11): toolCallIdFromActivityId(), activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), compactActivityText(), formatActivityDuration() (+3 more)

### Community 204 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 205 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 206 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 207 - "agent-service-event-projection.test.ts"
Cohesion: 0.22
Nodes (11): at(), directories, finish(), launch(), projected(), services, sessionLog(), syncSessionTranscript() (+3 more)

### Community 208 - "ChatMessage"
Cohesion: 0.19
Nodes (9): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, ChatMessage, ActivityRowProps (+1 more)

### Community 209 - "transport.test.ts"
Cohesion: 0.18
Nodes (8): HOST_TELEMETRY_MAX_QUEUE_BYTES, HOST_TELEMETRY_MAX_QUEUE_MESSAGES, HOST_TELEMETRY_SEND_TIMEOUT_MS, HostSocket, empty, inventory, listen(), pair()

### Community 210 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 211 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 213 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 214 - "ActivityRow.test.tsx"
Cohesion: 0.20
Nodes (7): ActivityStatus, ActivityRow, bashDetail(), output, raw, runningDetail(), text()

### Community 215 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 216 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 217 - "command-catalog-cache.test.ts"
Cohesion: 0.25
Nodes (9): at(), Catalog, deferred(), fixture(), fixtures, listed(), releases, runtime() (+1 more)

### Community 218 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 221 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 222 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 223 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 224 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 225 - "history-projection.test.ts"
Cohesion: 0.31
Nodes (7): eventsFor(), groupedEventsFor(), ModelMessage, questionEventsFor(), random(), seedOffset, terminalTypes

### Community 226 - "alerts.test.ts"
Cohesion: 0.28
Nodes (6): computer, observe(), snapshot(), start, sustained(), HOST_ALERT_COOLDOWN_MS

### Community 228 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 229 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.31
Nodes (6): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult

### Community 230 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 231 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 232 - "use-markdown-document.test.tsx"
Cohesion: 0.25
Nodes (3): drawnInParts(), components, Reader()

### Community 234 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 235 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 236 - "SkillSettingsService"
Cohesion: 0.29
Nodes (4): applications, directories, fixture(), SkillSettingsService

### Community 237 - "vad-assets.ts"
Cohesion: 0.32
Nodes (7): browserBaseUrl(), directory(), localAssetUrl(), ORACLE_VOICE_ONNX_WASM_BASE_PATH, ORACLE_VOICE_VAD_ASSETS, ORACLE_VOICE_VAD_BASE_PATH, sharedAssetDirectory()

### Community 239 - "skill-settings-jsonc.ts"
Cohesion: 0.48
Nodes (5): instrument(), document(), parseSkillSettings(), replaceDisabledSkills(), Token

### Community 240 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 241 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 242 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 245 - "ManagerProactiveInboxValidationError"
Cohesion: 0.47
Nodes (4): emptyState(), ManagerProactiveInboxValidationError, requireId(), validateOptions()

### Community 247 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 248 - "copyText"
Cohesion: 0.60
Nodes (4): CopyTextButton(), copy(), copyText(), copyWithSelection()

## Knowledge Gaps
- **1460 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1455 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2452 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionStore`, `SessionDetail`, `feature-flags.ts`, `transcription-service.ts`, `ManagedSession`, `oracle-voice-config.ts`, `ManagerStore`, `delegated-transcription-service.ts`, `SessionKnowledgeStore`, `schedule-launcher.test.ts`, `oracle-voice-soak.ts`, `service.ts`, `node-routes.ts`, `ManagerAgent`, `notification-center-service.ts`, `response-compression.test.ts`, `notification-classifier.ts`, `oracle-task-store.ts`, `session-knowledge-routes.test.ts`, `file-upload-routes.ts`, `ProviderSessionService`, `DreamerService`, `ScheduleRun`, `SchedulerStore`, `ManagerMessage`, `PreviewFeaturesSettings.test.tsx`, `PushNotificationService`, `scheduler-store.ts`, `.snapshot`, `ChildVoiceEngine`, `TranscriptionError`, `manager-proactive-coordinator.ts`, `SessionOrderStore`, `KnowledgeStore`, `ScheduleWorktreeService`, `SkillSettingsService`, `HostAlertMonitor`, `HostTelemetrySampler`, `cli-canary.ts`, `ManagerProactiveInbox`, `dreamer-service.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `background-task-adapter.ts`, `CopilotSessionLike`, `.recoverSdkSession`, `SessionStore`, `server/side-question.ts`, `.takeInTranscript`, `recovery-resend-durability.test.ts`, `SessionDetail`, `agent-service.ts`, `contracts.ts`, `computer-manager.ts`, `.discoverSessions`, `session-directory.ts`, `agent-service.test.ts`, `.replyUserInputInternal`, `.createSession`, `CopilotClientLike`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `.recoverSdkSession`, `SessionDetail`, `contracts.ts`, `.discoverSessions`, `ManagerMemory`, `.replyUserInputInternal`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1460 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03799745513579922 - nodes in this community are weakly interconnected._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.028093449739062575 - nodes in this community are weakly interconnected._
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
