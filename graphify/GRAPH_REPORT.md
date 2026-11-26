# Agentic Remote - Graphify code map

Snapshot: `18c969f5fd9a5d8a7fcc6c6d60a156ce276593472468a6695ada5a224cf648f6`

Source checkout: `1f02ebfed0660648e9d554091641c9a30ff7c150`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 685 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 685 files · ~1,223,315 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9555 nodes · 27628 edges · 279 communities (234 shown, 27 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1356 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- agent-service.ts
- AgentService
- AppWorkspace
- SessionDetail
- api.ts
- contracts.ts
- App.tsx
- manager.ts
- oracle-voice-child.ts
- SessionService
- terminal-session.ts
- react
- ClaudeAgentService
- .sendAdmittedWithBackend
- session-presentation.ts
- claude-agent-service.ts
- ManagedSession
- computer-manager.ts
- active-sessions.ts
- session-directory.ts
- RemoteNodeClient
- composer-state.ts
- oracle-voice-routes.test.ts
- manager-tools.ts
- multi-node.test.ts
- background-task-adapter.ts
- ChatMessage
- agentic-remote-promotion-monitor
- dreamer-store.ts
- VoiceAudioFrame
- oracle-voice-soak.ts
- setupWorkspaceFixture
- ManagerAgent
- TmuxTerminalSessionController
- app.ts
- oracle-voice-session.ts
- ManagerStore
- ui-locks.pw.ts
- FakeVoiceEngine
- oracle-voice-integration.test.ts
- .drainNextTerminalPrompt
- agent-service.test.ts
- SchedulerStore
- oracle-voice-worker.ts
- manager-structured-memory-validation.ts
- tmux-test-helpers.ts
- session-category-routes.test.ts
- oracle-task-store.ts
- manager-agent.ts
- sampler.ts
- TerminalSessionController
- HostTelemetrySampler
- oracle-voice.ts
- oracle-voice-benchmark.ts
- workspace-fixtures.ts
- ComposerActions.tsx
- client.test.ts
- BackgroundTaskSnapshot
- ManagerAssistant.tsx
- agentic-remote
- host-telemetry.ts
- hub-routes.ts
- notification-center.ts
- dreamer-progress.ts
- notification-classifier.ts
- PushNotificationService
- agentic-remote-gate
- DreamerService
- ScheduleRun
- OracleVoiceClient
- bundle
- session-launcher.ts
- dreamer-api.ts
- FakeVoiceController
- shared/settings-profile.ts
- dreamer-service.ts
- transcription-service.ts
- NotificationCenterService
- shell.ts
- VoicePlayback
- ScheduleForm.tsx
- lib.rs
- terminal-startup-queue.test.ts
- manager-agent.test.ts
- schedule-recurrence.ts
- dependencies
- devDependencies
- oracle-voice-config.ts
- manager-proactive-inbox.ts
- agentic-remote-promotion-setup
- manager-proactive-coordinator.ts
- dreamer-planner.ts
- ComputerSummary
- config.rs
- response-compression.test.ts
- oracle-voice-security.test.ts
- terminal-session.test.ts
- remote-voice-client.ts
- session-resource-routes.test.ts
- use-markdown-document.test.tsx
- manager-structured-memory.ts
- EngineVoiceBackendSession
- send-matrix.integration.test.ts
- schedule-proposals.ts
- BackgroundTasksDialog.tsx
- normalizeKnowledgeRelativePath
- oracle-voice-segments.ts
- SchedulerDispatcher
- SessionOrderStore
- pwa.ts
- preview-features.ts
- oracle-voice-coordinator.ts
- push-notification-service.ts
- ManagerAssistant.test.tsx
- session-patch-browser.ts
- session-store-providers.test.ts
- CopilotClientLike
- ManagerAttachment
- OracleVoiceCoordinator
- feature-flags.ts
- use-oracle-conversation.test.tsx
- capture-workspace.ts
- cli-canary.ts
- startup-phases.test.ts
- .toolHost
- session-categories.ts
- scripts
- use-markdown-document.ts
- check-workspace-review-regressions.ts
- manager-structured-memory-search.ts
- SettingsProfileClient
- session-transcript.ts
- compilerOptions
- .observe
- ManagerStructuredMemoryStore
- src/settings-profile.ts
- transport.test.ts
- session-category-routes.ts
- vite.config.ts
- KnowledgeStore
- SessionCategoryStore
- oracle-voice-tickets.ts
- isTerminalComposerFooter
- compilerOptions
- full-gate.test.ts
- session-reply-durability.test.ts
- tmux-errors.ts
- ActivityRow.test.tsx
- FakeSocket
- compilerOptions
- ManagerProactiveInbox
- schedule-notification-service.test.ts
- OnlineRecognizer
- knowledge-tree.ts
- client.ts
- markdown-navigation.ts
- pipeline.ts
- MessageTime.tsx
- compilerOptions
- node:fs/promises
- compilerOptions
- recovery-resend-durability.test.ts
- manager-runtime.ts
- ManagerMemory
- session-knowledge-store.ts
- ActivityDetails.tsx
- dreamer-schedule.ts
- oracle-status.test.ts
- promotion-monitor.test.ts
- SessionKnowledgeStore
- ActivityRow.tsx
- PromptCards.tsx
- BoundedQueue
- ReaderWorkspace
- session-reorder.pw.ts
- scripts
- session-latency-benchmark.ts
- file-upload-routes.ts
- session-knowledge-routes.ts
- VoiceTurnState
- closed-sessions.ts
- server/side-question.ts
- closed-session-sweeper.ts
- SettingsProfileSnapshot
- package.json
- registerSessionKnowledgeRoutes
- oracle-voice-assets.test.ts
- pending-echo.ts
- capture-workbench-review.ts
- fake-vad.ts
- desktop.json
- knowledge-store.ts
- use-session-categories.ts
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- dreamer-service.test.ts
- .confirmSpeech
- manager-automatic.ts
- OracleVoiceClientDependencies
- Pcm16Resampler
- recently-closed.pw.ts
- manager-proactive-inbox.test.ts
- html-preview.ts
- sign-in-expired.pw.ts
- settings-profile-routes.ts
- .initialize
- SessionAdmissions
- session-store-serialization.test.ts
- use-oracle-attachments.ts
- static-files.ts
- dataset
- generate-pwa-icons.ts
- claude-recovery-admission.test.ts
- manager-structured-memory-performance.test.ts
- .persist
- bridge.rs
- pipeline.test.tsx
- dreamer-routes.ts
- logs-cli.test.ts
- .drainAudio
- promotion-setup-execution.test.ts
- session-knowledge-store.test.ts
- session-store-durability.test.ts
- SkillsSettings.tsx
- doctor-cli.test.ts
- release-publication.test.ts
- UserInputFieldControl
- KnowledgePosition
- OracleVoicePlayback
- session-list-collisions.test.ts
- composer-layout.test.ts
- session-order-routes.test.ts
- settings.ts
- DocumentViewControls.tsx
- .transport
- ManagerProactiveInboxValidationError
- use-foreground-handoff.ts
- promotion-setup.test.ts
- session-category-store.test.ts
- MemoryStorage
- FakeRecorder
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
1. `AppWorkspace()` - 393 edges
2. `SessionDetail` - 328 edges
3. `AgentService` - 318 edges
4. `SessionStore` - 218 edges
5. `ManagedSession` - 190 edges
6. `buildApp()` - 145 edges
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

## Communities (279 total, 27 thin omitted)

### Community 0 - "agent-service.ts"
Cohesion: 0.02
Nodes (143): complete(), event(), sessionWithLog(), start(), AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents() (+135 more)

### Community 1 - "AgentService"
Cohesion: 0.04
Nodes (13): agentMode(), AgentService, foregroundTurnOpen(), isForegroundLifecycleEvent(), isUncertainDelivery(), persistedFormAnswer(), recoveredPermissionTitle(), busyTerminal() (+5 more)

### Community 2 - "AppWorkspace"
Cohesion: 0.02
Nodes (176): isManagerEvent(), newSessionCategoryId(), sessionCategoryName(), sessionCategoryOf(), sessionFileValidationError(), replyPermission(), saveHiddenSessionVisibility(), AppWorkspace() (+168 more)

### Community 3 - "SessionDetail"
Cohesion: 0.03
Nodes (58): fixture(), fixture(), isMissingClaudeSessionError(), createStore(), recoveryFixture(), claudeOwner(), directory(), runtime() (+50 more)

### Community 4 - "api.ts"
Cohesion: 0.03
Nodes (152): parseSubmissionReceipt(), activityArgumentFormats, activityDetailStatuses, activityKinds, addComputer(), addKnowledgeRoot(), askSession(), bootstrapSessionOrder() (+144 more)

### Community 5 - "contracts.ts"
Cohesion: 0.03
Nodes (104): TerminalFormContinuation, applications, directories, releases, sockets, ComputerManagerEvents, JournalRecorderOptions, Seen (+96 more)

### Community 6 - "App.tsx"
Cohesion: 0.03
Nodes (105): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, TRANSCRIPT_WINDOW, executeCommand(), ActivityRowStates, moveSessionToBrowsedFolder(), sidebarTouchStart() (+97 more)

### Community 7 - "manager.ts"
Cohesion: 0.03
Nodes (53): FakeManager, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, apps, directories, DreamerServiceOptions (+45 more)

### Community 8 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (55): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+47 more)

### Community 9 - "SessionService"
Cohesion: 0.03
Nodes (11): updateComputerForLaunchIdentity(), closeReason(), closeVoiceSocket(), registerNodeRoutes(), owns(), ProviderSessionService, SessionService, WorkspaceFile (+3 more)

### Community 10 - "terminal-session.ts"
Cohesion: 0.05
Nodes (101): terminalComposerUnreadable(), activeBottomFrame(), backgroundShellsAllow(), busyRowStatus(), captureBeforeDeadline(), captureForReplacement(), capturePane(), cleanDialogLine() (+93 more)

### Community 11 - "react"
Cohesion: 0.04
Nodes (89): react, RuntimeModelOption, AppearanceSetting, NewSessionBackendSetting, activateSession(), createSession(), getHubHealth(), getManager() (+81 more)

### Community 12 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (25): ClaudeAgentService, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), storedProvider() (+17 more)

### Community 13 - ".sendAdmittedWithBackend"
Cohesion: 0.04
Nodes (43): commandShortcut(), sessionInUseConflictMessage(), terminalAnswerRefused(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused() (+35 more)

### Community 14 - "session-presentation.ts"
Cohesion: 0.04
Nodes (81): DEFAULT_SESSION_PROVIDER, KnowledgeRootSelector(), root, dragsRow, RowMouseSensor, RowTouchSensor, splitRowListeners(), useSessionListSensors() (+73 more)

### Community 15 - "claude-agent-service.ts"
Cohesion: 0.05
Nodes (70): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+62 more)

### Community 16 - "ManagedSession"
Cohesion: 0.07
Nodes (16): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, ManagerEventSource, registerHubRoutes(), SessionMuteCarrier (+8 more)

### Community 17 - "computer-manager.ts"
Cohesion: 0.04
Nodes (66): activityDetailsUnavailable(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), RemoteSessionListing, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema (+58 more)

### Community 18 - "active-sessions.ts"
Cohesion: 0.05
Nodes (65): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+57 more)

### Community 19 - "session-directory.ts"
Cohesion: 0.05
Nodes (63): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+55 more)

### Community 20 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (38): RemoteResync, RemoteSessionRead, HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers (+30 more)

### Community 21 - "composer-state.ts"
Cohesion: 0.05
Nodes (82): terminalSendOptions(), SettingsChange, SettingsProfileKey, SettingsUpdateResult, submissionReceiptFromError(), applySession(), attachmentsInContent(), cancelQueuedPromptEdit() (+74 more)

### Community 22 - "oracle-voice-routes.test.ts"
Cohesion: 0.03
Nodes (35): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+27 more)

### Community 23 - "manager-tools.ts"
Cohesion: 0.04
Nodes (46): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), categoryTools() (+38 more)

### Community 24 - "multi-node.test.ts"
Cohesion: 0.04
Nodes (27): WorkspaceFixtureOptions, activityNotInLog(), DirectoryScope, ClaudeFakeSessionService, directories, FakeSessionService, routingFixture(), session() (+19 more)

### Community 25 - "background-task-adapter.ts"
Cohesion: 0.06
Nodes (73): DeferredSession, addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress (+65 more)

### Community 26 - "ChatMessage"
Cohesion: 0.05
Nodes (44): nextVoiceControl(), BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, Client, changedInPlace(), diffMessages() (+36 more)

### Community 27 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 28 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (45): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+37 more)

### Community 29 - "VoiceAudioFrame"
Cohesion: 0.05
Nodes (29): QueuedAudio, BrowserCaptureOptions, AudioReservation, VoiceAudioFrame, VoiceClientControl, BufferedFrame, captureFailure(), defaultAudioContext() (+21 more)

### Community 30 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 31 - "setupWorkspaceFixture"
Cohesion: 0.04
Nodes (37): desktop, devices, long, open(), phone, veryLong, bounds(), build() (+29 more)

### Community 32 - "ManagerAgent"
Cohesion: 0.08
Nodes (14): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+6 more)

### Community 33 - "TmuxTerminalSessionController"
Cohesion: 0.06
Nodes (30): startAgentAfterClear(), exec, startCopilot(), composer(), processAdapter, afterExit(), awaitingRelaunch(), copilotCommand() (+22 more)

### Community 34 - "app.ts"
Cohesion: 0.05
Nodes (46): buildApp(), BuildAppOptions, errorStatusCode(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), directories, runtimes (+38 more)

### Community 35 - "oracle-voice-session.ts"
Cohesion: 0.06
Nodes (51): apps, directories, nodeVoiceCapabilities(), sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation (+43 more)

### Community 36 - "ManagerStore"
Cohesion: 0.07
Nodes (15): fixture(), scheduledFixture(), session(), openStore(), JournalRecorder, sessionTask(), applySessionReplacement(), emptyState() (+7 more)

### Community 37 - "ui-locks.pw.ts"
Cohesion: 0.05
Nodes (41): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+33 more)

### Community 38 - "FakeVoiceEngine"
Cohesion: 0.05
Nodes (28): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), config, VoiceSttEngine, VoiceTtsEngine (+20 more)

### Community 39 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+24 more)

### Community 40 - ".drainNextTerminalPrompt"
Cohesion: 0.08
Nodes (6): isTerminalNotReadyRefusal(), normalizedTitle(), sessionInUseQueueMessage(), isRetainedRefusal(), StartupPhases, TerminalSendOptions

### Community 41 - "agent-service.test.ts"
Cohesion: 0.05
Nodes (41): CopilotSessionLike, directories, fakeClient(), ForkRequest, forkSession(), services, terminalFormSteps(), closableService() (+33 more)

### Community 42 - "SchedulerStore"
Cohesion: 0.10
Nodes (15): fixture(), deferUnboundWorktree(), failure(), isInFlight(), occurrenceKey(), SchedulerStore, State, stateSchema (+7 more)

### Community 43 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (26): benchmarkGroup(), EnabledOracleVoiceConfig, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, ChildVoiceEngineDependencies, errorMessage() (+18 more)

### Community 44 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 45 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (47): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, Screens, [root], assertSameIdentity() (+39 more)

### Community 46 - "session-category-routes.test.ts"
Cohesion: 0.05
Nodes (32): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+24 more)

### Community 47 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (35): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+27 more)

### Community 48 - "manager-agent.ts"
Cohesion: 0.08
Nodes (41): DreamerProgressEntry, DreamerProgressView, automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung (+33 more)

### Community 49 - "sampler.ts"
Cohesion: 0.08
Nodes (45): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+37 more)

### Community 50 - "TerminalSessionController"
Cohesion: 0.04
Nodes (22): holdProbe(), fixtures, gate(), releases, restart(), sdkPermissionEvents(), sdkRecoveryEvents(), removeCopilotSessionFiles() (+14 more)

### Community 51 - "HostTelemetrySampler"
Cohesion: 0.07
Nodes (19): prefixes, session, trusted, untrusted, HostRequest, HostTelemetryClock, HostTelemetrySampler, HOST_PROCESSES_INTERVAL_MS (+11 more)

### Community 52 - "oracle-voice.ts"
Cohesion: 0.07
Nodes (41): VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities, closeServers, exactArrayBuffer(), sockets (+33 more)

### Community 53 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (41): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 54 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (46): oracleHostStatusFixture(), CONTEXT_EXAMPLE, documents, fixtureArguments(), fixtureComputers, fixtureEndpoints, fixtureHostHistory, fixtureHostProcesses (+38 more)

### Community 55 - "ComposerActions.tsx"
Cohesion: 0.07
Nodes (24): families, modelFamily, shortModelName(), repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions() (+16 more)

### Community 56 - "client.test.ts"
Cohesion: 0.06
Nodes (34): closedSessionExpiresAt(), changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame() (+26 more)

### Community 57 - "BackgroundTaskSnapshot"
Cohesion: 0.07
Nodes (29): backgroundTaskNotFound(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), listedBackgroundTask(), readBackgroundTaskFrom(), taskFingerprint() (+21 more)

### Community 58 - "ManagerAssistant.tsx"
Cohesion: 0.07
Nodes (42): cancelManager(), editQueuedManagerMessage(), resetManager(), sendManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), boundWidth() (+34 more)

### Community 59 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 60 - "host-telemetry.ts"
Cohesion: 0.07
Nodes (41): MinuteAccumulator, aggregate, DiskSpaceSchema, HOST_TELEMETRY_CAPABILITY_VERSION, HOST_TELEMETRY_INVALID_CLOSE_CODE, HostHistorySchema, HostInfoSchema, HostMetric (+33 more)

### Community 61 - "hub-routes.ts"
Cohesion: 0.05
Nodes (45): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+37 more)

### Community 62 - "notification-center.ts"
Cohesion: 0.07
Nodes (36): booleanQuery, filters, params, cursorSchema, durableState(), identity, kind, NOTIFICATION_LIMIT (+28 more)

### Community 63 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 64 - "notification-classifier.ts"
Cohesion: 0.09
Nodes (35): HOST_ALERT_POLL_INTERVAL_MS, computer, observe(), snapshot(), start, sustained(), center(), directories (+27 more)

### Community 65 - "PushNotificationService"
Cohesion: 0.10
Nodes (11): start(), NotificationRecorder, HubEventSource, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema (+3 more)

### Community 66 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 67 - "DreamerService"
Cohesion: 0.14
Nodes (6): activeDreamerMemoryIds(), DreamerService, DreamerUnavailableError, publicSnapshot(), uniqueSessionRefs(), DreamerSnapshot

### Community 68 - "ScheduleRun"
Cohesion: 0.10
Nodes (22): provenance(), SessionScheduleLauncher, NoopScheduleLauncher, ScheduleLauncher, ScheduleLaunchRefusedError, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS (+14 more)

### Community 69 - "OracleVoiceClient"
Cohesion: 0.15
Nodes (7): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, playbackClientError(), terminalCloseCode()

### Community 70 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 71 - "session-launcher.ts"
Cohesion: 0.07
Nodes (23): awaitTermination(), LaunchCreations, apps, directories, services, stores, withSessionCreateBoundary(), delay() (+15 more)

### Community 72 - "dreamer-api.ts"
Cohesion: 0.09
Nodes (37): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition, getDreamer() (+29 more)

### Community 73 - "FakeVoiceController"
Cohesion: 0.09
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 74 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (37): WorkspaceFixtureState, SettingsProfileState, AccentSetting, appearanceSettings, applySettingsChanges(), applySettingsImport(), isRecord(), isSettingsDeviceId() (+29 more)

### Community 75 - "dreamer-service.ts"
Cohesion: 0.09
Nodes (33): DreamerPlanDraft, DreamerPlannerInput, boundedText(), digest(), DreamerFollowUp, DreamerPlannerExecutionInput, planWithFingerprints(), safeRunError() (+25 more)

### Community 76 - "transcription-service.ts"
Cohesion: 0.08
Nodes (26): collect(), oversized(), statusCodeOf(), CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner() (+18 more)

### Community 77 - "NotificationCenterService"
Cohesion: 0.10
Nodes (8): HostAlertMonitor, NotificationCenterService, emptyState(), matchesNotification(), NotificationStore, setup(), NotificationFilter, NotificationKindPreferences

### Community 78 - "shell.ts"
Cohesion: 0.09
Nodes (35): ScheduleShellNotifier, attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label() (+27 more)

### Community 79 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 80 - "ScheduleForm.tsx"
Cohesion: 0.10
Nodes (32): scheduleProposalSummary(), CLAUDE_SCHEDULE_UNAVAILABLE_REASON, scheduleProviderUnavailableReason(), ScheduleTarget, listDirectories(), AddKnowledgeRootDialog(), browse(), FolderPicker() (+24 more)

### Community 81 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 82 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (30): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+22 more)

### Community 83 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (19): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+11 more)

### Community 84 - "schedule-recurrence.ts"
Cohesion: 0.11
Nodes (36): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+28 more)

### Community 85 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 86 - "devDependencies"
Cohesion: 0.05
Nodes (39): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+31 more)

### Community 87 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (27): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+19 more)

### Community 88 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (38): assertExactKeys(), canonicalHash(), DISPOSITIONS, eventId(), hasExactKeys(), isAlreadyExists(), isEventKind(), isId() (+30 more)

### Community 89 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 90 - "manager-proactive-coordinator.ts"
Cohesion: 0.12
Nodes (13): automaticTurns(), event(), batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions (+5 more)

### Community 91 - "dreamer-planner.ts"
Cohesion: 0.10
Nodes (34): activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem(), digest() (+26 more)

### Community 92 - "ComputerSummary"
Cohesion: 0.09
Nodes (26): ComputerSummary, browserConnection, ConnectionHints, connectionSparesData(), IdleScheduler, PASSIVE_READS_SINCE, PREFETCH_PASS_BYTES, PREFETCH_SIDEBAR_ROWS (+18 more)

### Community 93 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 94 - "response-compression.test.ts"
Cohesion: 0.07
Nodes (20): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), apps (+12 more)

### Community 95 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (20): SocketMessage, apps, config, configFixture(), connect(), createManager(), Inbox, issueTicket() (+12 more)

### Community 96 - "terminal-session.test.ts"
Cohesion: 0.07
Nodes (27): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+19 more)

### Community 97 - "remote-voice-client.ts"
Cohesion: 0.14
Nodes (15): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, RemoteNodeRedirectError, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES (+7 more)

### Community 98 - "session-resource-routes.test.ts"
Cohesion: 0.08
Nodes (16): DelegatedTranscriptionOptions, DelegatedTranscriptionService, hubComputer, workstation, apps, dataDirectory(), directories, pairedFixture() (+8 more)

### Community 99 - "use-markdown-document.test.tsx"
Cohesion: 0.09
Nodes (17): render, scope, DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), defaultDocumentRenderer(), DocumentRenderer, DocumentRendererContext (+9 more)

### Community 100 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 101 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 102 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (29): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+21 more)

### Community 103 - "schedule-proposals.ts"
Cohesion: 0.11
Nodes (29): action, create, existing, metadata, scheduleProposalInputSchema, ScheduleProposalsChanged, scheduleProposalSchema, update (+21 more)

### Community 104 - "BackgroundTasksDialog.tsx"
Cohesion: 0.12
Nodes (27): BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableNote() (+19 more)

### Community 105 - "normalizeKnowledgeRelativePath"
Cohesion: 0.11
Nodes (25): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+17 more)

### Community 106 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 107 - "SchedulerDispatcher"
Cohesion: 0.19
Nodes (4): session(), SchedulerDispatcher, registerSchedulerRoutes(), holdsSlot()

### Community 108 - "SessionOrderStore"
Cohesion: 0.15
Nodes (13): stores(), orderStore(), carried(), laneFrom(), retire(), sameLane(), sessionOrderKey(), SessionOrderState (+5 more)

### Community 109 - "pwa.ts"
Cohesion: 0.12
Nodes (28): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), activatePwaUpdate(), activePushSubscription(), applicationServerKey(), checkForPwaUpdate() (+20 more)

### Community 110 - "preview-features.ts"
Cohesion: 0.15
Nodes (17): ClientFeature, railEntries(), readScheduleLink(), ScheduleLink, scheduleNotificationLabel(), PreviewFeaturesContext, usePreviewFeature(), usePreviewFeatures() (+9 more)

### Community 111 - "oracle-voice-coordinator.ts"
Cohesion: 0.09
Nodes (19): ManagerEventSource, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnector (+11 more)

### Community 112 - "push-notification-service.ts"
Cohesion: 0.11
Nodes (19): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+11 more)

### Community 113 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (17): removeQueuedManagerMessage(), resolveManagerConfirmation(), retryManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+9 more)

### Community 114 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 115 - "session-store-providers.test.ts"
Cohesion: 0.09
Nodes (11): RuntimeConfigurationError, claude(), clearFixture(), copilot(), disk, event(), fixtures, releases (+3 more)

### Community 116 - "CopilotClientLike"
Cohesion: 0.08
Nodes (23): CopilotClientLike, ClaudeSdk, disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue() (+15 more)

### Community 117 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 119 - "feature-flags.ts"
Cohesion: 0.16
Nodes (19): hub(), AppVersion, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable() (+11 more)

### Community 120 - "use-oracle-conversation.test.tsx"
Cohesion: 0.12
Nodes (13): getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability, defaults (+5 more)

### Community 121 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 122 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 123 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (16): phases, port, app(), directories, headers, launcher, createStartupPhases(), startManagedServer() (+8 more)

### Community 124 - ".toolHost"
Cohesion: 0.11
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 125 - "session-categories.ts"
Cohesion: 0.16
Nodes (23): CategoryState, Fields, isRecord(), parseState(), validName(), applySessionCategoryChange(), clamp(), existing() (+15 more)

### Community 126 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 127 - "use-markdown-document.ts"
Cohesion: 0.15
Nodes (20): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+12 more)

### Community 128 - "check-workspace-review-regressions.ts"
Cohesion: 0.08
Nodes (13): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+5 more)

### Community 129 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 130 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 131 - "session-transcript.ts"
Cohesion: 0.15
Nodes (19): TRANSCRIPT_CARRIED_LIMIT, sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), projectSessionResponse(), responseSequences, sessionResponseStartedAt(), failure (+11 more)

### Community 132 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 133 - ".observe"
Cohesion: 0.14
Nodes (10): cloneState(), isDisposition(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId() (+2 more)

### Community 134 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 135 - "src/settings-profile.ts"
Cohesion: 0.12
Nodes (19): SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey, CachedProfile (+11 more)

### Community 136 - "transport.test.ts"
Cohesion: 0.13
Nodes (13): registerHostTelemetryRoutes(), HOST_TELEMETRY_MAX_QUEUE_BYTES, HOST_TELEMETRY_MAX_QUEUE_MESSAGES, HOST_TELEMETRY_SEND_TIMEOUT_MS, HostSocket, HostTelemetrySocket, readingFixture(), empty (+5 more)

### Community 137 - "session-category-routes.ts"
Cohesion: 0.11
Nodes (15): createSchema, deleteSchema, keys(), listedInSessionOrder(), moveSchema, name, paramsSchema, parse() (+7 more)

### Community 138 - "vite.config.ts"
Cohesion: 0.12
Nodes (12): brotliAsync, compress(), gzipAsync, precompressDirectory(), PrecompressedFile, directories, canaryTests, oracleVoiceAssetNames (+4 more)

### Community 139 - "KnowledgeStore"
Cohesion: 0.21
Nodes (5): KnowledgeStore, parseMetadata(), readOptional(), fixture(), createHub()

### Community 140 - "SessionCategoryStore"
Cohesion: 0.24
Nodes (7): categories(), enableSchedulerTools(), key(), refused(), remember(), SessionCategoryStore, SessionCategoriesSnapshot

### Community 141 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 142 - "isTerminalComposerFooter"
Cohesion: 0.13
Nodes (20): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+12 more)

### Community 143 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 144 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 145 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 146 - "tmux-errors.ts"
Cohesion: 0.14
Nodes (18): foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity(), SocketPlace, containedServer() (+10 more)

### Community 147 - "ActivityRow.test.tsx"
Cohesion: 0.14
Nodes (12): ActivityStatus, ActivityRow, bashDetail(), output, raw, runningDetail(), text(), UserMessage (+4 more)

### Community 148 - "FakeSocket"
Cohesion: 0.11
Nodes (6): OracleVoiceSocket, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse()

### Community 149 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 150 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 151 - "schedule-notification-service.test.ts"
Cohesion: 0.18
Nodes (6): ScheduleNotificationService, input(), now, run(), ScheduleRunNotification, SchedulerChanged

### Community 152 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 153 - "knowledge-tree.ts"
Cohesion: 0.18
Nodes (17): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+9 more)

### Community 154 - "client.ts"
Cohesion: 0.13
Nodes (15): ORACLE_VOICE_CONNECTION_TIMEOUT_MS, VoiceCapabilities, closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode (+7 more)

### Community 155 - "markdown-navigation.ts"
Cohesion: 0.19
Nodes (18): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+10 more)

### Community 156 - "pipeline.ts"
Cohesion: 0.17
Nodes (19): openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform() (+11 more)

### Community 157 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 158 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 159 - "node:fs/promises"
Cohesion: 0.12
Nodes (13): root, script, question(), actions, clippedPane(), closedPane, commitKeys, committed (+5 more)

### Community 160 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 161 - "recovery-resend-durability.test.ts"
Cohesion: 0.12
Nodes (14): directories, disk, fixture(), gate(), gates, httpBoundary(), initialize(), PublicSessionValue (+6 more)

### Community 162 - "manager-runtime.ts"
Cohesion: 0.17
Nodes (13): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkMissingSessionRetirement, CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic() (+5 more)

### Community 163 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 164 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (18): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+10 more)

### Community 165 - "ActivityDetails.tsx"
Cohesion: 0.22
Nodes (16): activityDetailFailure, detailKey(), formatBytes(), keep(), kept, keptActivityDetail(), loadActivityDetail(), peekActivityDetail() (+8 more)

### Community 166 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 167 - "oracle-status.test.ts"
Cohesion: 0.19
Nodes (14): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+6 more)

### Community 168 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 169 - "SessionKnowledgeStore"
Cohesion: 0.26
Nodes (3): bindingKey(), SessionKnowledgeStore, SessionKnowledgeBinding

### Community 170 - "ActivityRow.tsx"
Cohesion: 0.23
Nodes (14): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, TOOL_CALL_ID_PATTERN, toolCallIdFromActivityId(), activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+6 more)

### Community 171 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (13): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+5 more)

### Community 172 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 173 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 174 - "session-reorder.pw.ts"
Cohesion: 0.13
Nodes (9): center(), computerOrder(), desktop, dropOnto(), longListState(), open(), phone, Point (+1 more)

### Community 175 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 176 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 177 - "file-upload-routes.ts"
Cohesion: 0.19
Nodes (9): FileUploadError, registerFileUploadRoutes(), SessionParams, registerTranscriptionRoutes(), transcriptionMultipartOptions, extension(), MAX_SESSION_FILE_BYTES, supportedExtensions (+1 more)

### Community 178 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 180 - "closed-sessions.ts"
Cohesion: 0.18
Nodes (14): blockParents, CLOSED_SESSION_RETENTION_DAYS, closedCapitals(), closedSessionContext(), excerpt(), head(), htmlElements, htmlText() (+6 more)

### Community 181 - "server/side-question.ts"
Cohesion: 0.23
Nodes (7): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout()

### Community 182 - "closed-session-sweeper.ts"
Cohesion: 0.17
Nodes (5): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS

### Community 183 - "SettingsProfileSnapshot"
Cohesion: 0.21
Nodes (6): profileStore(), SettingsProfileStore, directories, store(), SettingsProfileSnapshot, SettingsProfileTransport

### Community 184 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 185 - "registerSessionKnowledgeRoutes"
Cohesion: 0.29
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 186 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 187 - "pending-echo.ts"
Cohesion: 0.24
Nodes (11): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, PendingEchoOwner, prunePendingEchoMap() (+3 more)

### Community 188 - "capture-workbench-review.ts"
Cohesion: 0.15
Nodes (10): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, fixtureSessions (+2 more)

### Community 189 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 190 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 191 - "knowledge-store.ts"
Cohesion: 0.16
Nodes (9): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, PersistedKnowledgeState, directories (+1 more)

### Community 192 - "use-session-categories.ts"
Cohesion: 0.24
Nodes (11): SessionCategoryChange, fetchSessionCategories(), saveSessionCategoryChange(), sessionRefs(), message(), nothing, SessionCategoriesState, commit() (+3 more)

### Community 193 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 194 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 195 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 196 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 198 - "manager-automatic.ts"
Cohesion: 0.23
Nodes (10): MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed, finished, AutomaticTurn, automaticTurnSummary (+2 more)

### Community 199 - "OracleVoiceClientDependencies"
Cohesion: 0.19
Nodes (3): OracleVoiceClientDependencies, FakePlayback, VoicePlaybackOptions

### Community 200 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 201 - "recently-closed.pw.ts"
Cohesion: 0.23
Nodes (9): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), open(), row() (+1 more)

### Community 202 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 203 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 204 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 205 - "settings-profile-routes.ts"
Cohesion: 0.25
Nodes (8): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 206 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 208 - "session-store-serialization.test.ts"
Cohesion: 0.22
Nodes (6): encode(), directories, seedOffset, serializeSessions(), serializeState(), serializeStateChunks()

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

### Community 213 - "claude-recovery-admission.test.ts"
Cohesion: 0.27
Nodes (8): connect(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite(), releases

### Community 214 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.27
Nodes (7): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult, submitSearch()

### Community 215 - ".persist"
Cohesion: 0.24
Nodes (3): SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, stateWithPaths()

### Community 216 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 217 - "pipeline.test.tsx"
Cohesion: 0.27
Nodes (7): components, drawn(), drawnPage(), fixtures, html(), today(), rehypeDocumentHeadings()

### Community 218 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 219 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 221 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 222 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 223 - "session-store-durability.test.ts"
Cohesion: 0.31
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 224 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 225 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 226 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 227 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 228 - "KnowledgePosition"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 230 - "session-list-collisions.test.ts"
Cohesion: 0.32
Nodes (4): kind(), sessionListCollisions(), Args, layout

### Community 231 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 232 - "session-order-routes.test.ts"
Cohesion: 0.43
Nodes (6): directories, fakeManager(), hub(), settled(), until(), upserted()

### Community 233 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 234 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 236 - "ManagerProactiveInboxValidationError"
Cohesion: 0.40
Nodes (4): emptyState(), ManagerProactiveInboxValidationError, validateLimit(), validateOptions()

### Community 237 - "use-foreground-handoff.ts"
Cohesion: 0.47
Nodes (3): foregroundHandoffTimeoutMs, Handoff, useForegroundHandoff()

### Community 238 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 239 - "session-category-store.test.ts"
Cohesion: 0.50
Nodes (3): directories, folder(), store()

### Community 244 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **1523 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1518 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2569 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `agent-service.ts`, `recovery-resend-durability.test.ts`, `SessionDetail`, `.drainNextTerminalPrompt`, `ClaudeAgentService`, `.sendAdmittedWithBackend`, `claude-agent-service.ts`, `TerminalSessionController`, `session-store-providers.test.ts`, `session-directory.ts`, `server/side-question.ts`, `multi-node.test.ts`, `BackgroundTaskSnapshot`, `ChatMessage`, `background-task-adapter.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionDetail`, `contracts.ts`, `manager.ts`, `transport.test.ts`, `SessionService`, `session-category-routes.ts`, `KnowledgeStore`, `ClaudeAgentService`, `SessionCategoryStore`, `ManagedSession`, `computer-manager.ts`, `session-directory.ts`, `ManagerProactiveInbox`, `oracle-voice-routes.test.ts`, `schedule-notification-service.test.ts`, `ManagerAgent`, `manager-runtime.ts`, `ManagerStore`, `SessionKnowledgeStore`, `SchedulerStore`, `oracle-voice-worker.ts`, `session-category-routes.test.ts`, `oracle-task-store.ts`, `file-upload-routes.ts`, `HostTelemetrySampler`, `SettingsProfileSnapshot`, `PushNotificationService`, `DreamerService`, `ScheduleRun`, `transcription-service.ts`, `NotificationCenterService`, `static-files.ts`, `oracle-voice-config.ts`, `manager-proactive-coordinator.ts`, `dreamer-routes.ts`, `response-compression.test.ts`, `session-resource-routes.test.ts`, `SchedulerDispatcher`, `SessionOrderStore`, `cli-canary.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `.drainNextTerminalPrompt`, `ClaudeAgentService`, `.sendAdmittedWithBackend`, `claude-agent-service.ts`, `ChatMessage`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `AppWorkspace()` (e.g. with `submitMessage()` and `prefersLightNow()`) actually correct?**
  _`AppWorkspace()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1523 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `agent-service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.023267721014904996 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03645563797366454 - nodes in this community are weakly interconnected._
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
