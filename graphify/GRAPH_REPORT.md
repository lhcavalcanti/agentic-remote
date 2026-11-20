# Agentic Remote - Graphify code map

Snapshot: `5c2796100d992b5375e8578db2d1f6b54eb6eb24aa169cd1ce76543967b027d4`

Source checkout: `d17cb5e700a047c5a9b68239e2b7b9130a0034ce`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 637 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 637 files · ~1,136,899 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 8909 nodes · 25721 edges · 266 communities (218 shown, 30 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1302 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- AppWorkspace
- api.ts
- ClaudeAgentService
- SessionDetail
- App.tsx
- manager-structured-memory.ts
- agent-service.ts
- contracts.ts
- CopilotClientLike
- SessionService
- manager-agent.ts
- terminal-session.ts
- sections.tsx
- session-presentation.ts
- oracle-voice-routes.test.ts
- client.ts
- claude-agent-service.ts
- oracle-voice-soak.ts
- app.ts
- ManagedSession
- OracleVoiceCoordinator
- manager-tools.ts
- ManagerStore
- agentic-remote-promotion-monitor
- ManagerAgent
- dreamer-store.ts
- RemoteNodeClient
- oracle-voice.ts
- hub-routes.ts
- tmux-test-helpers.ts
- node-routes.ts
- workspace-fixtures.ts
- TmuxTerminalSessionController
- oracle-task-store.ts
- notification-center.ts
- transcription-service.ts
- oracle-voice-integration.test.ts
- sampler.ts
- manager-structured-memory-validation.ts
- session-store.ts
- session-reply-durability.test.ts
- schedule-launcher.test.ts
- TerminalSessionController
- active-sessions.ts
- VoiceAudioFrame
- manager-routes.ts
- ScheduleRun
- SchedulerStore
- OracleDreamer.tsx
- ManagerAssistant.tsx
- fake-voice.ts
- shared/settings-profile.ts
- oracle-voice-session.ts
- agentic-remote
- DreamerService
- AgentProvider
- session-knowledge-routes.test.ts
- FakeVoiceEngine
- ComposerActions.tsx
- dreamer-progress.ts
- send-matrix.integration.test.ts
- agentic-remote-gate
- react
- FakeSessionService
- ui-scenes.ts
- bundle
- alerts.test.ts
- processes.ts
- setupWorkspaceFixture
- ChildVoiceEngine
- dreamer-service.ts
- oracle-voice-security.test.ts
- normalizeKnowledgeRelativePath
- manager-proactive-inbox.ts
- ScheduleForm.tsx
- VoicePlayback
- shell.ts
- lib.rs
- ManagerAttachment
- dependencies
- agent-service.test.ts
- schedule-recurrence.ts
- pwa.ts
- markdown-navigation.ts
- client.test.ts
- agentic-remote-promotion-setup
- dreamer-planner.ts
- SessionOrderStore
- devDependencies
- config.rs
- PushNotificationService
- oracle-voice-child.ts
- terminal-session.test.ts
- src/settings-profile.ts
- ResidentVoiceWorker
- oracle-voice-child.test.ts
- knowledge-tree.ts
- remote-voice-client.ts
- scheduler-store.ts
- schedule-proposals.ts
- ManagerSnapshot
- HubEvent
- feature-flags.ts
- host-telemetry.ts
- oracle-voice-worker.ts
- schedules.ts
- session-patch-browser.ts
- session-unread.pw.ts
- ManagerProactiveInbox
- push-notification-service.ts
- oracle-voice-benchmark.ts
- ManagerProactiveCoordinator
- capture-workspace.ts
- session-directory.ts
- cli-canary.ts
- .toolHost
- scheduler-dispatcher.ts
- scripts
- SettingsProfileClient
- ManagerAssistant.test.tsx
- VoiceCapture
- background-task-adapter.ts
- session-resource-providers.test.ts
- manager-runtime.ts
- compilerOptions
- pipeline.ts
- use-markdown-document.ts
- SessionKnowledgeStore
- oracle-voice-segments.ts
- oracle-voice-tickets.ts
- session-knowledge-store.ts
- ChatMessage
- session-store-providers.test.ts
- server/skill-settings.ts
- isTerminalComposerFooter
- HostMonitorView.test.tsx
- compilerOptions
- full-gate.test.ts
- PromptCards.tsx
- renderer.ts
- capture.ts
- compilerOptions
- transport.test.ts
- OnlineRecognizer
- workspace-browser.ts
- MessageTime.tsx
- compilerOptions
- compilerOptions
- recordValue
- oracle-status.test.ts
- ManagerMemory
- schedule-notification-service.test.ts
- SettingsProfileSnapshot
- dreamer-schedule.ts
- HostTelemetrySampler
- KnowledgeStore
- promotion-monitor.test.ts
- terminal-startup-queue.test.ts
- BoundedQueue
- ReaderWorkspace
- scripts
- session-latency-benchmark.ts
- session-knowledge-routes.ts
- .observe
- terminal-form-deadline.test.ts
- closed-session-sweeper.ts
- knowledge-store.ts
- registerSessionKnowledgeRoutes
- package.json
- SubmissionError
- backgroundTasksFromEvents
- VoiceBackendSession
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- background-task-stop.test.ts
- shared/skill-settings.ts
- theme-contrast.test.ts
- ShellNavigation.test.tsx
- pipeline.test.tsx
- pending-echo.ts
- manager-automatic.ts
- .oxlintrc.json
- settings-local.json
- session-scope.ts
- BackgroundTasksDialog.tsx
- Pcm16Resampler
- background-task-tracker.ts
- dreamer-routes.ts
- manager-proactive-inbox.test.ts
- queued-provider-dispatch.test.ts
- html-preview.ts
- sign-in-expired.pw.ts
- benchmarkFixture
- DeferredSession
- SessionAdmissions
- session-knowledge-store.test.ts
- SessionOriginBadge.test.tsx
- dataset
- generate-pwa-icons.ts
- SpeakableSegmenter
- bridge.rs
- use-markdown-document.test.tsx
- VoiceCaptureOptions
- vite.config.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- sent-message.ts
- capture.test.ts
- VoiceVadOptions
- doctor-cli.test.ts
- recovery-context.ts
- release-publication.test.ts
- closed-sessions.ts
- oracle-conversation-real.test.ts
- skill-settings-jsonc.ts
- history-projection.test.ts
- HostTelemetryClock
- VoiceGenerationIdentity
- settings.ts
- .transport
- oracle-voice-benchmark.test.ts
- background-task-adapter.test.ts
- composer-layout.test.ts
- VoiceSttEngine
- refusal-metrics-routes.test.ts
- promotion-setup.test.ts
- storedProvider
- MockMediaRecorder
- skill-builtin-roots.ts
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
2. `SessionDetail` - 342 edges
3. `AgentService` - 311 edges
4. `SessionStore` - 209 edges
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
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (266 total, 30 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (17): agentMode(), AgentService, isRuntimeReasoningEffort(), isTerminalNotReadyRefusal(), lifecycleRefusal(), normalizedTitle(), permissionTitle(), restart() (+9 more)

### Community 1 - "AppWorkspace"
Cohesion: 0.03
Nodes (181): terminalSendOptions(), sessionFileValidationError(), AppWorkspace(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession() (+173 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (154): SettingsChange, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionReceipt, submissionReceiptFromError(), activateSession(), addComputer() (+146 more)

### Community 3 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (22): sessionInUseConflictMessage(), terminalAnswerRefused(), ClaudeAgentService, isClaudeAuthenticationError(), toolResultText(), errorMessage(), explicitlyRefused(), hasUncertainDelivery() (+14 more)

### Community 4 - "SessionDetail"
Cohesion: 0.04
Nodes (50): storage(), fixture(), isMissingClaudeSessionError(), connect(), createStore(), enqueue(), fixture(), recoveryFixture() (+42 more)

### Community 5 - "App.tsx"
Cohesion: 0.03
Nodes (97): isManagerEvent(), SettingsProfileKey, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+89 more)

### Community 6 - "manager-structured-memory.ts"
Cohesion: 0.04
Nodes (72): capturePrompt(), benchmarkState(), now(), openFixture(), searchSamples(), initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, authorityRank (+64 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.04
Nodes (83): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+75 more)

### Community 8 - "contracts.ts"
Cohesion: 0.04
Nodes (79): ClaudeAgentServiceEvents, RemoteSessionListing, DirectoryScope, awaitTermination(), LaunchCreations, apps, directories, directory() (+71 more)

### Community 9 - "CopilotClientLike"
Cohesion: 0.02
Nodes (80): root, script, CopilotClientLike, directories, fakeClient(), fixture(), ForkRequest, forkSession() (+72 more)

### Community 10 - "SessionService"
Cohesion: 0.04
Nodes (9): updateComputerForLaunchIdentity(), nodeVoiceCapabilities(), registerNodeRoutes(), ProviderSessionService, SessionService, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing (+1 more)

### Community 11 - "manager-agent.ts"
Cohesion: 0.04
Nodes (78): DreamerProgressEntry, DreamerProgressView, ManagerAgentOptions, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Rung, Behavior (+70 more)

### Community 12 - "terminal-session.ts"
Cohesion: 0.05
Nodes (91): terminalComposerUnreadable(), activeBottomFrame(), backgroundShellsAllow(), busyRowStatus(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts() (+83 more)

### Community 13 - "sections.tsx"
Cohesion: 0.04
Nodes (80): RuntimeModelOption, AppearanceSetting, NewSessionBackendSetting, getHubHealth(), getProviderRuntimeOptions(), shortcutKeys(), readStoredShortcuts(), AppShortcutBinding (+72 more)

### Community 14 - "session-presentation.ts"
Cohesion: 0.04
Nodes (79): hasActiveBackgroundTasks(), hasForegroundTurn(), CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), KnowledgeRootSelector(), root, CloseSessionDialog(), RecentlyClosedCard() (+71 more)

### Community 15 - "oracle-voice-routes.test.ts"
Cohesion: 0.04
Nodes (52): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+44 more)

### Community 16 - "client.ts"
Cohesion: 0.05
Nodes (37): ManagerClientDefaults, ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, VoiceCapabilities, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason() (+29 more)

### Community 17 - "claude-agent-service.ts"
Cohesion: 0.05
Nodes (67): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+59 more)

### Community 18 - "oracle-voice-soak.ts"
Cohesion: 0.04
Nodes (40): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+32 more)

### Community 19 - "app.ts"
Cohesion: 0.04
Nodes (58): buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe(), ClaudeSdk, ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName() (+50 more)

### Community 20 - "ManagedSession"
Cohesion: 0.08
Nodes (14): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, FakeManager, SessionLauncherOptions (+6 more)

### Community 21 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (22): ManagerEventSource, ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect() (+14 more)

### Community 22 - "manager-tools.ts"
Cohesion: 0.04
Nodes (44): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), changeSuspension() (+36 more)

### Community 23 - "ManagerStore"
Cohesion: 0.05
Nodes (19): openStore(), JournalRecorder, recordScheduleProposals(), sessionTask(), proposalInput, emptyState(), ManagerStore, messageSource() (+11 more)

### Community 24 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 25 - "ManagerAgent"
Cohesion: 0.07
Nodes (17): automaticPayload(), checkContent(), delay(), discover(), errorMessage(), isNotFound(), isPending(), isQueued() (+9 more)

### Community 26 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (42): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+34 more)

### Community 27 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (16): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, requestBytes(), client(), servers, session (+8 more)

### Community 28 - "oracle-voice.ts"
Cohesion: 0.06
Nodes (63): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+55 more)

### Community 29 - "hub-routes.ts"
Cohesion: 0.04
Nodes (57): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+49 more)

### Community 30 - "tmux-test-helpers.ts"
Cohesion: 0.06
Nodes (55): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+47 more)

### Community 31 - "node-routes.ts"
Cohesion: 0.05
Nodes (48): FileUploadError, registerFileUploadRoutes(), SessionParams, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema (+40 more)

### Community 32 - "workspace-fixtures.ts"
Cohesion: 0.04
Nodes (45): frame(), geometry, output, scratch, screenshot(), { values }, accents, Measurement (+37 more)

### Community 33 - "TmuxTerminalSessionController"
Cohesion: 0.07
Nodes (22): findActiveCopilotProcesses(), startAgentAfterClear(), adapter, composer(), processAdapter, afterExit(), awaitingRelaunch(), copilotCommand() (+14 more)

### Community 34 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (46): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+38 more)

### Community 35 - "notification-center.ts"
Cohesion: 0.06
Nodes (39): booleanQuery, filters, params, registerNotificationRoutes(), cursorSchema, durableState(), emptyState(), identity (+31 more)

### Community 36 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+27 more)

### Community 37 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+24 more)

### Community 38 - "sampler.ts"
Cohesion: 0.07
Nodes (52): prefixes, session, trusted, untrusted, counter(), counterDelta(), CpuCounters, cpuUtilization() (+44 more)

### Community 39 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 40 - "session-store.ts"
Cohesion: 0.04
Nodes (46): nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), idleDaysSchema, mergeSessionRetention(), sessionRetentionPatchSchema, sessionRetentionSchema, activityDuration() (+38 more)

### Community 41 - "session-reply-durability.test.ts"
Cohesion: 0.07
Nodes (27): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), answer(), assistantFixture(), claudeFixture(), claudeQuestions() (+19 more)

### Community 42 - "schedule-launcher.test.ts"
Cohesion: 0.06
Nodes (35): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, LaunchPrimitives (+27 more)

### Community 43 - "TerminalSessionController"
Cohesion: 0.04
Nodes (22): holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), fixtures, recoverAndSeed() (+14 more)

### Community 44 - "active-sessions.ts"
Cohesion: 0.08
Nodes (43): ActiveProcess, execFileAsync, findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+35 more)

### Community 45 - "VoiceAudioFrame"
Cohesion: 0.05
Nodes (27): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, QueuedAudio, capabilities, confirm(), control(), defaults (+19 more)

### Community 46 - "manager-routes.ts"
Cohesion: 0.06
Nodes (32): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+24 more)

### Community 47 - "ScheduleRun"
Cohesion: 0.13
Nodes (10): provenance(), SessionScheduleLauncher, ScheduleLauncher, ScheduleLaunchRefusedError, SchedulerDispatcher, ScheduleReconciliation, registerSchedulerRoutes(), holdsSlot() (+2 more)

### Community 48 - "SchedulerStore"
Cohesion: 0.11
Nodes (9): fixture(), session(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, ScheduleProposal, Schedule (+1 more)

### Community 49 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (41): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition (+33 more)

### Community 50 - "ManagerAssistant.tsx"
Cohesion: 0.07
Nodes (46): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), ActivityRow (+38 more)

### Community 51 - "fake-voice.ts"
Cohesion: 0.08
Nodes (10): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance (+2 more)

### Community 52 - "shared/settings-profile.ts"
Cohesion: 0.08
Nodes (44): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SettingsProfileState (+36 more)

### Community 53 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (17): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), outputBytes() (+9 more)

### Community 54 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 55 - "DreamerService"
Cohesion: 0.13
Nodes (7): digest(), DreamerService, DreamerUnavailableError, uniqueSessionRefs(), DreamerCompletionCandidate, DreamerSnapshot, OracleTaskAttempt

### Community 56 - "AgentProvider"
Cohesion: 0.06
Nodes (32): make(), PersistedCursor, NotificationCursor, node(), Row, apps, dataDirectory(), directories (+24 more)

### Community 57 - "session-knowledge-routes.test.ts"
Cohesion: 0.06
Nodes (26): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+18 more)

### Community 58 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (21): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine, playbackSequence() (+13 more)

### Community 59 - "ComposerActions.tsx"
Cohesion: 0.08
Nodes (20): families, modelFamily, repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions(), ContextRing() (+12 more)

### Community 60 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, DreamerProgressSource (+11 more)

### Community 61 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (40): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+32 more)

### Community 62 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 63 - "react"
Cohesion: 0.06
Nodes (25): react, listClosedSessions(), listComputerSkills(), toggleComputerSkill(), transcribeAudio(), foregroundHandoffTimeoutMs, Handoff, useForegroundHandoff() (+17 more)

### Community 64 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 65 - "ui-scenes.ts"
Cohesion: 0.08
Nodes (27): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+19 more)

### Community 66 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 67 - "alerts.test.ts"
Cohesion: 0.08
Nodes (19): HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, computer, observe(), snapshot(), start, sustained(), HostRequest (+11 more)

### Community 68 - "processes.ts"
Cohesion: 0.09
Nodes (26): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+18 more)

### Community 69 - "setupWorkspaceFixture"
Cohesion: 0.06
Nodes (23): desktop, devices, long, open(), phone, veryLong, bounds(), closedEarlier (+15 more)

### Community 70 - "ChildVoiceEngine"
Cohesion: 0.11
Nodes (12): benchmarkGroup(), VoiceEndUtterance, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), isCancelledEvent(), matchesCancelled(), matchesUtterance() (+4 more)

### Community 71 - "dreamer-service.ts"
Cohesion: 0.08
Nodes (28): DreamerMemoryMetadata, DreamerMemoryMetadataRecord, DreamerPlanDraft, DreamerPlannerInput, DreamerProgressLimits, boundedText(), DreamerPlannerExecutionInput, DreamerServiceOptions (+20 more)

### Community 72 - "oracle-voice-security.test.ts"
Cohesion: 0.06
Nodes (24): apps, directories, FakeVoiceEngineCall, SocketMessage, apps, config, configFixture(), connect() (+16 more)

### Community 73 - "normalizeKnowledgeRelativePath"
Cohesion: 0.09
Nodes (32): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+24 more)

### Community 74 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (38): assertExactKeys(), cloneState(), DISPOSITIONS, emptyState(), hasExactKeys(), isDisposition(), isEventKind(), isId() (+30 more)

### Community 75 - "ScheduleForm.tsx"
Cohesion: 0.10
Nodes (31): scheduleProposalSummary(), ScheduleRecurrence, ScheduleTarget, FeatureEvent, listeners, publishFeatureEvent(), subscribeFeatureEvents(), FolderPicker() (+23 more)

### Community 76 - "VoicePlayback"
Cohesion: 0.10
Nodes (11): pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio(), validateGeneration() (+3 more)

### Community 77 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 78 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 79 - "ManagerAttachment"
Cohesion: 0.11
Nodes (27): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+19 more)

### Community 80 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 81 - "agent-service.test.ts"
Cohesion: 0.09
Nodes (19): CopilotSessionLike, terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration (+11 more)

### Community 82 - "schedule-recurrence.ts"
Cohesion: 0.11
Nodes (35): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+27 more)

### Community 83 - "pwa.ts"
Cohesion: 0.10
Nodes (33): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), gatewayRefused(), HUB_SIGN_IN_EXPIRED_MESSAGE, hubSignInExpired(), HubSignInExpiredError (+25 more)

### Community 84 - "markdown-navigation.ts"
Cohesion: 0.10
Nodes (35): executeCommand(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), MarkdownImage(), missingDocumentFragment() (+27 more)

### Community 85 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 86 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 87 - "dreamer-planner.ts"
Cohesion: 0.10
Nodes (34): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+26 more)

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

### Community 92 - "oracle-voice-child.ts"
Cohesion: 0.08
Nodes (29): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), float32ToPcm16() (+21 more)

### Community 93 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (30): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse(), pastedPlaceholderCount(), qualifyingPasteCount() (+22 more)

### Community 94 - "src/settings-profile.ts"
Cohesion: 0.08
Nodes (24): NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+16 more)

### Community 95 - "ResidentVoiceWorker"
Cohesion: 0.16
Nodes (4): combinedTranscript(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream

### Community 96 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 97 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+24 more)

### Community 98 - "remote-voice-client.ts"
Cohesion: 0.14
Nodes (15): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError() (+7 more)

### Community 99 - "scheduler-store.ts"
Cohesion: 0.13
Nodes (26): attentionClosed(), attentionSeed(), classifyHostNotification(), classifyHubNotification(), classifyOracleNotification(), classifyScheduleNotification(), HOST_ALERT_MEMORY_DURATION_MS, NotificationCursors (+18 more)

### Community 100 - "schedule-proposals.ts"
Cohesion: 0.11
Nodes (30): action, create, existing, metadata, scheduleProposalInputSchema, ScheduleProposalsChanged, scheduleProposalSchema, update (+22 more)

### Community 101 - "ManagerSnapshot"
Cohesion: 0.07
Nodes (5): FakeManager, ProactiveManager, FakeAgent, FakeManager, ManagerSnapshot

### Community 102 - "HubEvent"
Cohesion: 0.10
Nodes (13): ComputerManagerEvents, center(), directories, directory(), hub(), now, runtimes, trusted (+5 more)

### Community 103 - "feature-flags.ts"
Cohesion: 0.15
Nodes (24): hub(), defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, hubFlagCatalogue, isPreviewAvailable(), parseFeatureFlag(), PreviewFeature (+16 more)

### Community 104 - "host-telemetry.ts"
Cohesion: 0.09
Nodes (26): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, aggregate (+18 more)

### Community 105 - "oracle-voice-worker.ts"
Cohesion: 0.09
Nodes (21): VoiceStartUtterance, VoiceSynthesisRequest, VoiceTtsEngine, VoiceUtteranceAudioFrame, BlockingEngine, BlockingEngine, exactKeys(), isEnabledConfig() (+13 more)

### Community 106 - "schedules.ts"
Cohesion: 0.09
Nodes (28): CLAUDE_SCHEDULE_UNAVAILABLE_REASON, cronExpression, DEFAULT_SCHEDULE_TIMEZONE, identifier, SCHEDULE_ABANDONED_REASON, SCHEDULE_MIN_SPACING_MINUTES, SCHEDULE_PROMPT_MAX_LENGTH, scheduleAbandonSchema (+20 more)

### Community 107 - "session-patch-browser.ts"
Cohesion: 0.11
Nodes (28): pageFor(), advance(), Connection, connections, content(), FrameMeasurement, lastHeading(), message() (+20 more)

### Community 108 - "session-unread.pw.ts"
Cohesion: 0.08
Nodes (15): devices, bounds(), devices, edgeState(), open(), screenshot(), unreadState(), BACKGROUND_SESSION_ID (+7 more)

### Community 109 - "ManagerProactiveInbox"
Cohesion: 0.15
Nodes (8): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxRecoveryError, nowIso(), openInbox()

### Community 110 - "push-notification-service.ts"
Cohesion: 0.11
Nodes (20): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+12 more)

### Community 111 - "oracle-voice-benchmark.ts"
Cohesion: 0.11
Nodes (26): BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, derived(), execFileAsync (+18 more)

### Community 112 - "ManagerProactiveCoordinator"
Cohesion: 0.17
Nodes (6): batchMessageId(), isTerminal(), lifecycles(), ManagerProactiveCoordinator, fixture(), managed()

### Community 113 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 114 - "session-directory.ts"
Cohesion: 0.18
Nodes (20): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+12 more)

### Community 115 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 116 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 117 - "scheduler-dispatcher.ts"
Cohesion: 0.11
Nodes (18): enableSchedulerTools(), NoopScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS, SchedulerDispatcherOptions, ScheduleStopAcknowledgement, ScheduleTargetUnavailableError (+10 more)

### Community 118 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 119 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 120 - "ManagerAssistant.test.tsx"
Cohesion: 0.08
Nodes (13): sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability, empty, FakeRecorder, measure() (+5 more)

### Community 121 - "VoiceCapture"
Cohesion: 0.21
Nodes (3): captureFailure(), harness(), VoiceCapture

### Community 122 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (24): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus() (+16 more)

### Community 123 - "session-resource-providers.test.ts"
Cohesion: 0.11
Nodes (19): cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), claudeFixture(), ClaudeMcpRead (+11 more)

### Community 124 - "manager-runtime.ts"
Cohesion: 0.12
Nodes (13): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+5 more)

### Community 125 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 126 - "pipeline.ts"
Cohesion: 0.13
Nodes (21): holdingRenderer(), openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), render, scope, documentOpening() (+13 more)

### Community 127 - "use-markdown-document.ts"
Cohesion: 0.15
Nodes (18): build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing(), Level (+10 more)

### Community 128 - "SessionKnowledgeStore"
Cohesion: 0.21
Nodes (3): bindingKey(), SessionKnowledgeStore, SessionKnowledgeBinding

### Community 129 - "oracle-voice-segments.ts"
Cohesion: 0.16
Nodes (21): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+13 more)

### Community 130 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 131 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 132 - "ChatMessage"
Cohesion: 0.16
Nodes (10): Client, Browser, seedOffset, session(), StoredSession, ChatMessage, HubResyncRequest, HubWireEvent (+2 more)

### Community 133 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+3 more)

### Community 134 - "server/skill-settings.ts"
Cohesion: 0.19
Nodes (13): frontmatterFields(), frontmatterReason(), readBounded(), revision(), applications, directories, fixture(), scalar() (+5 more)

### Community 135 - "isTerminalComposerFooter"
Cohesion: 0.13
Nodes (20): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+12 more)

### Community 136 - "HostMonitorView.test.tsx"
Cohesion: 0.17
Nodes (18): HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics, snapshot, Socket, bytes() (+10 more)

### Community 137 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 138 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 139 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 140 - "renderer.ts"
Cohesion: 0.14
Nodes (10): DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), defaultDocumentRenderer(), DocumentRenderer, RendererWorker, synchronousRenderer, FakeWorker (+2 more)

### Community 141 - "capture.ts"
Cohesion: 0.13
Nodes (15): BufferedFrame, defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, validateIdentity(), VoiceCaptureError, VoiceCaptureErrorCode (+7 more)

### Community 142 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 143 - "transport.test.ts"
Cohesion: 0.15
Nodes (10): registerHostTelemetryRoutes(), HOST_TELEMETRY_MAX_QUEUE_BYTES, HOST_TELEMETRY_MAX_QUEUE_MESSAGES, HOST_TELEMETRY_SEND_TIMEOUT_MS, HostSocket, HostTelemetrySocket, empty, inventory (+2 more)

### Community 144 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 145 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (16): assertOpenedFilePath(), fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath() (+8 more)

### Community 146 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 147 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 148 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 149 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 150 - "oracle-status.test.ts"
Cohesion: 0.18
Nodes (15): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+7 more)

### Community 151 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 152 - "schedule-notification-service.test.ts"
Cohesion: 0.19
Nodes (5): ScheduleNotificationService, input(), now, run(), ScheduleRunNotification

### Community 153 - "SettingsProfileSnapshot"
Cohesion: 0.18
Nodes (9): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileStore, directories, store() (+1 more)

### Community 154 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 155 - "HostTelemetrySampler"
Cohesion: 0.20
Nodes (3): parseMeminfo(), HostTelemetrySampler, HostSample

### Community 157 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 158 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (10): client(), delayQueueWrite(), disk, exec, gate(), holdQueueCommit(), NativeFixture, NativeRuntime (+2 more)

### Community 159 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 160 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 161 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 162 - "session-latency-benchmark.ts"
Cohesion: 0.21
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 163 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 164 - ".observe"
Cohesion: 0.15
Nodes (10): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), publicEvent() (+2 more)

### Community 165 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 166 - "closed-session-sweeper.ts"
Cohesion: 0.17
Nodes (5): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS

### Community 167 - "knowledge-store.ts"
Cohesion: 0.14
Nodes (11): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, parseMetadata(), PersistedKnowledgeState (+3 more)

### Community 168 - "registerSessionKnowledgeRoutes"
Cohesion: 0.26
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 169 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 171 - "backgroundTasksFromEvents"
Cohesion: 0.32
Nodes (15): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventTask(), executionModeValue(), normalizeBackgroundTask(), numberValue() (+7 more)

### Community 172 - "VoiceBackendSession"
Cohesion: 0.16
Nodes (6): exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), RouteVoiceBackend, VoiceBackendSession

### Community 173 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 174 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 175 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 176 - "background-task-stop.test.ts"
Cohesion: 0.25
Nodes (11): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started(), stopAcknowledgement() (+3 more)

### Community 177 - "shared/skill-settings.ts"
Cohesion: 0.23
Nodes (8): registerSkillSettingsRoutes(), SKILL_SETTINGS_CAPABILITY, skillFrontmatterNameSchema, skillNameSchema, skillSettingsSchema, SkillSettingsSnapshot, SkillToggle, skillToggleSchema

### Community 178 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 179 - "ShellNavigation.test.tsx"
Cohesion: 0.32
Nodes (6): ClientFeature, railEntries(), initials(), useDisplayName(), DisplayNameSetting(), ShellNavigation()

### Community 180 - "pipeline.test.tsx"
Cohesion: 0.20
Nodes (10): documentJsx(), documentUrlTransform(), components, drawn(), drawnPage(), fixtures, html(), today() (+2 more)

### Community 181 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 182 - "manager-automatic.ts"
Cohesion: 0.24
Nodes (9): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+1 more)

### Community 183 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 184 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 185 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 186 - "BackgroundTasksDialog.tsx"
Cohesion: 0.26
Nodes (10): BackgroundTask, BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 187 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 188 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 189 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 190 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 191 - "queued-provider-dispatch.test.ts"
Cohesion: 0.18
Nodes (6): copilotSession(), fixtures, gate(), originalQueue, pause(), releases

### Community 192 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 193 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 194 - "benchmarkFixture"
Cohesion: 0.25
Nodes (9): benchmarkFixture(), deferred(), firstTtsSegment(), maybeMeasured(), measured(), measureSttPass(), measureTts(), missing() (+1 more)

### Community 197 - "session-knowledge-store.test.ts"
Cohesion: 0.20
Nodes (7): SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, disk, fixture(), fixtures, releases, root()

### Community 198 - "SessionOriginBadge.test.tsx"
Cohesion: 0.35
Nodes (6): readScheduleLink(), ScheduleLink, scheduleNotificationLabel(), preview(), SessionOriginRunLink(), SubagentCount()

### Community 199 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 200 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 201 - "SpeakableSegmenter"
Cohesion: 0.29
Nodes (3): SpeakableSegmenter, validateMessageId(), ./server/oracle-voice-segments.ts

### Community 202 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 203 - "use-markdown-document.test.tsx"
Cohesion: 0.27
Nodes (5): renderDocumentTree(), components, eventsFor(), Reader(), useMarkdownDocument()

### Community 205 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 206 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 207 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 208 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 209 - "capture.test.ts"
Cohesion: 0.22
Nodes (3): CaptureControl, VoiceCaptureDependencies, VoiceVad

### Community 211 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 212 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 213 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 214 - "closed-sessions.ts"
Cohesion: 0.39
Nodes (5): closedSessionContext(), excerpt(), isClosedSessionContext(), said(), ClosedSessionContext

### Community 216 - "skill-settings-jsonc.ts"
Cohesion: 0.48
Nodes (5): instrument(), document(), parseSkillSettings(), replaceDisabledSkills(), Token

### Community 217 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 219 - "VoiceGenerationIdentity"
Cohesion: 0.43
Nodes (4): matchesCancelled(), VoiceGenerationIdentity, ActiveSynthesisIdentity, ActiveUtteranceIdentity

### Community 220 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 222 - "oracle-voice-benchmark.test.ts"
Cohesion: 0.47
Nodes (4): normalizeTranscript(), parsePcm16Wave(), verifyCorpus(), wordErrorRate()

### Community 223 - "background-task-adapter.test.ts"
Cohesion: 0.40
Nodes (5): MAX_BACKGROUND_TASKS, MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH, lifecycleEvent(), subagentShell()

### Community 224 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 226 - "refusal-metrics-routes.test.ts"
Cohesion: 0.33
Nodes (4): directories, runtimes, start(), trusted

### Community 227 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1426 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1421 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2386 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionKnowledgeStore`, `ClaudeAgentService`, `SessionDetail`, `manager-structured-memory.ts`, `server/skill-settings.ts`, `SessionService`, `manager-agent.ts`, `transport.test.ts`, `oracle-voice-routes.test.ts`, `oracle-voice-soak.ts`, `ManagedSession`, `ManagerStore`, `schedule-notification-service.test.ts`, `ManagerAgent`, `SettingsProfileSnapshot`, `HostTelemetrySampler`, `KnowledgeStore`, `hub-routes.ts`, `node-routes.ts`, `oracle-task-store.ts`, `notification-center.ts`, `transcription-service.ts`, `session-reply-durability.test.ts`, `manager-routes.ts`, `ScheduleRun`, `SchedulerStore`, `shared/skill-settings.ts`, `DreamerService`, `session-knowledge-routes.test.ts`, `dreamer-routes.ts`, `alerts.test.ts`, `ChildVoiceEngine`, `oracle-voice-security.test.ts`, `SessionOrderStore`, `PushNotificationService`, `HubEvent`, `feature-flags.ts`, `ManagerProactiveInbox`, `ManagerProactiveCoordinator`, `cli-canary.ts`, `scheduler-dispatcher.ts`, `manager-runtime.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `ClaudeAgentService`, `SessionDetail`, `storedProvider`, `agent-service.ts`, `contracts.ts`, `session-reply-durability.test.ts`, `SubmissionError`, `TerminalSessionController`, `claude-agent-service.ts`, `session-directory.ts`, `agent-service.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `registerHubRoutes()` connect `ManagedSession` to `notification-center.ts`, `HubEvent`, `knowledge-store.ts`, `contracts.ts`, `normalizeKnowledgeRelativePath`, `registerSessionKnowledgeRoutes`, `oracle-voice.ts`, `claude-agent-service.ts`, `app.ts`, `shared/settings-profile.ts`, `OracleVoiceCoordinator`, `SessionOrderStore`, `AgentProvider`, `KnowledgeStore`, `hub-routes.ts`, `node-routes.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1426 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.0338409475465313 - nodes in this community are weakly interconnected._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.030193615907901622 - nodes in this community are weakly interconnected._
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
