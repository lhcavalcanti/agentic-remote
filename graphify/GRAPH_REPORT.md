# Agentic Remote - Graphify code map

Snapshot: `6791dd5cf4c44ab167aa967bccff9096818a85adec3a3227c6c7a599d0e081bf`

Source checkout: `2b54723fadd7b41b9bcca12fbbfb9974f016e6b4`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 633 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 633 files · ~1,126,832 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 8872 nodes · 25627 edges · 272 communities (226 shown, 27 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1295 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionStore
- AppWorkspace
- api.ts
- SessionDetail
- App.tsx
- contracts.ts
- agent-service.ts
- computer-manager.ts
- app.ts
- notification-classifier.ts
- ManagerStore
- session-store-providers.test.ts
- RemoteNodeClient
- manager-tools.ts
- ManagedSession
- VoiceCapture
- dreamer-store.ts
- agentic-remote-promotion-monitor
- sampler.ts
- oracle-voice-child.ts
- oracle-voice-session.ts
- oracle-voice-soak.ts
- ManagerAgent
- shared/settings-profile.ts
- active-sessions.ts
- PushNotificationService
- terminal-session.ts
- tmux-test-helpers.ts
- ManagerMessage
- host-telemetry.ts
- client.ts
- schedules.ts
- schedule-launcher.test.ts
- oracle-voice-integration.test.ts
- transcription-service.ts
- OracleVoiceCoordinator
- session-presentation.ts
- react
- FakeVoiceEngine
- manager-structured-memory-validation.ts
- node-routes.ts
- agent-service.test.ts
- ProviderSessionService
- oracle-voice-worker.ts
- SchedulerStore
- .sendInternal
- DreamerService
- oracle-task-store.ts
- SessionService
- ScheduleRun
- fake-voice.ts
- oracle-voice-benchmark.ts
- TerminalSessionController
- src/settings-profile.ts
- OracleDreamer.tsx
- TmuxTerminalSessionController
- agentic-remote
- session-launcher.ts
- dreamer-progress.ts
- controls.tsx
- send-matrix.integration.test.ts
- oracle-voice.ts
- agentic-remote-gate
- VoiceAudioFrame
- bundle
- dreamer-planner.ts
- oracle-voice-coordinator.ts
- manager-agent.ts
- oracle-voice-config.ts
- session-resource-clear.test.ts
- FakeSessionService
- Composer.tsx
- VoicePlayback
- hub-routes.ts
- shell.ts
- lib.rs
- manager-proactive-coordinator.ts
- sections.tsx
- schedule-recurrence.ts
- dependencies
- client.test.ts
- agentic-remote-promotion-setup
- manager-agent.test.ts
- oracle-voice-child.test.ts
- ManagerAssistant.tsx
- devDependencies
- config.rs
- node:fs/promises
- oracle-voice-security.test.ts
- knowledge-tree.ts
- KnowledgeStore
- manager-proactive-inbox.ts
- manager-structured-memory.ts
- ManagerClientDefaults
- oracle-voice-routes.ts
- DialogFrame.tsx
- manager-context.ts
- oracle-voice-routes.test.ts
- SessionKnowledgeStore
- EngineVoiceBackendSession
- setupWorkspaceFixture
- oracle-voice-segments.ts
- pwa.ts
- dreamer-service.ts
- preview-features.ts
- normalizeKnowledgeRelativePath
- SessionOrderStore
- terminal-session.test.ts
- ui-scenes.ts
- backgroundTasksFromEvents
- schedule-notifications.integration.test.ts
- ManagerAssistant.test.tsx
- SessionNavigation.tsx
- capture-workspace.ts
- ManagerAttachment
- .toolHost
- use-markdown-document.ts
- session-directory.ts
- cli-canary.ts
- scripts
- SessionResources.tsx
- session-patch-browser.ts
- registerSessionKnowledgeRoutes
- manager-structured-memory-search.ts
- background-task-adapter.ts
- compilerOptions
- ManagerProactiveInbox
- HostSnapshot
- ManagerStructuredMemoryStore
- NotificationStore
- oracle-voice-tickets.ts
- session-knowledge-store.ts
- session-response-order.ts
- workspace-fixtures.ts
- session-patches.test.ts
- compilerOptions
- full-gate.test.ts
- session-reply-durability.test.ts
- PromptCards.tsx
- pipeline.ts
- compilerOptions
- OnlineRecognizer
- workspace-browser.ts
- markdown-navigation.ts
- MessageTime.tsx
- compilerOptions
- oracle-status.test.ts
- compilerOptions
- ManagerMemory
- server/side-question.ts
- recovery-resend-durability.test.ts
- dreamer-schedule.ts
- manager-structured-memory-store.ts
- promotion-monitor.test.ts
- terminal-startup-queue.test.ts
- BoundedQueue
- ReaderWorkspace
- scripts
- session-latency-benchmark.ts
- session-resource-routes.test.ts
- server/skill-settings.ts
- renderer.test.ts
- capture-workbench-review.ts
- session-unread.pw.ts
- terminal-form-deadline.test.ts
- closed-session-sweeper.ts
- server/session-patches.ts
- use-markdown-document.test.tsx
- check-workspace-review-regressions.ts
- package.json
- background-task-stop.test.ts
- oracle-voice-assets.test.ts
- .snapshot
- use-oracle-settings.ts
- SessionNavigation.test.tsx
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- .observe
- BackgroundTasksDialog.tsx
- manager-automatic.ts
- ShellNavigation.test.tsx
- document-render.pw.ts
- recently-closed.pw.ts
- background-task-tracker.ts
- manager-proactive-inbox.test.ts
- .initialize
- ChatMessage
- html-preview.ts
- sign-in-expired.pw.ts
- DeferredSession
- ScheduleNotificationService
- SessionAdmissions
- use-oracle-attachments.ts
- dataset
- generate-pwa-icons.ts
- normalizeBackgroundTask
- copilot-sdk-client.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- pipeline.test.tsx
- vite.config.ts
- WorkspaceFixtureOptions
- dreamer-routes.ts
- logs-cli.test.ts
- SessionStatus
- promotion-setup-execution.test.ts
- tmux-errors.test.ts
- closed-sessions.ts
- SkillsSettings.tsx
- DocumentHeading
- sent-message.ts
- voice-recorder.ts
- fixture-frontend.ts
- doctor-cli.test.ts
- release-publication.test.ts
- SkillSettingsService
- skill-settings-jsonc.ts
- history-projection.test.ts
- session-order-routes.test.ts
- session-unread-tracker.ts
- settings.ts
- composer-layout.test.ts
- .initializeOnce
- use-foreground-handoff.ts
- usePanelWidth
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- SessionKnowledgeLifecycle
- MemoryStorage
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
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
2. `SessionDetail` - 337 edges
3. `AgentService` - 303 edges
4. `SessionStore` - 207 edges
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

## Communities (272 total, 27 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (18): agentMode(), AgentService, commandShortcut(), isTerminalNotReadyRefusal(), lifecycleRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, sessionInUseConflictMessage() (+10 more)

### Community 1 - "SessionStore"
Cohesion: 0.02
Nodes (108): fixture(), holdProbe(), fixtures, gate(), releases, restart(), sdkPermissionEvents(), sdkRecoveryEvents() (+100 more)

### Community 2 - "AppWorkspace"
Cohesion: 0.03
Nodes (167): terminalSendOptions(), sessionFileValidationError(), submissionReceiptFromError(), activateSession(), AppWorkspace(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown() (+159 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (129): SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), addKnowledgeRoot(), askSession(), bootstrapSessionOrder(), cancelBackgroundTask() (+121 more)

### Community 4 - "SessionDetail"
Cohesion: 0.04
Nodes (15): ClaudeAgentService, isMissingClaudeSessionError(), observe(), answer(), claudeQuestions(), claudeRequest(), copilotRequest(), assertSessionNotRetained() (+7 more)

### Community 5 - "App.tsx"
Cohesion: 0.02
Nodes (114): isManagerEvent(), turnEnded(), executeCommand(), listWorkspace(), activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+106 more)

### Community 6 - "contracts.ts"
Cohesion: 0.03
Nodes (76): ClaudeAgentServiceEvents, DirectoryScope, directories, voiceControlQueues, voiceControlWaiters, ProviderSessionServiceEvents, closable(), provider() (+68 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.04
Nodes (81): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+73 more)

### Community 8 - "computer-manager.ts"
Cohesion: 0.05
Nodes (77): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+69 more)

### Community 9 - "app.ts"
Cohesion: 0.03
Nodes (69): buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), directories, runtimes (+61 more)

### Community 10 - "notification-classifier.ts"
Cohesion: 0.04
Nodes (66): ComputerManagerEvents, HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, computer, observe(), snapshot(), start, sustained() (+58 more)

### Community 11 - "ManagerStore"
Cohesion: 0.05
Nodes (41): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+33 more)

### Community 12 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (46): CopilotSessionLike, CopilotTasksApi, nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused() (+38 more)

### Community 13 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (26): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, RemoteNodeClient (+18 more)

### Community 14 - "manager-tools.ts"
Cohesion: 0.04
Nodes (46): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), changeSuspension() (+38 more)

### Community 15 - "ManagedSession"
Cohesion: 0.08
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, FakeManager, createHub() (+5 more)

### Community 16 - "VoiceCapture"
Cohesion: 0.05
Nodes (29): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, harness() (+21 more)

### Community 17 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (48): DreamerHistoryEntry, assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+40 more)

### Community 18 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 19 - "sampler.ts"
Cohesion: 0.05
Nodes (50): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+42 more)

### Community 20 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (43): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+35 more)

### Community 21 - "oracle-voice-session.ts"
Cohesion: 0.04
Nodes (36): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+28 more)

### Community 22 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (35): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+27 more)

### Community 23 - "ManagerAgent"
Cohesion: 0.07
Nodes (13): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), capturePrompt(), TurnError (+5 more)

### Community 24 - "shared/settings-profile.ts"
Cohesion: 0.05
Nodes (55): WorkspaceFixtureState, execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), directories (+47 more)

### Community 25 - "active-sessions.ts"
Cohesion: 0.06
Nodes (53): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+45 more)

### Community 26 - "PushNotificationService"
Cohesion: 0.06
Nodes (30): ManagerEventSource, start(), NotificationRecorder, brief(), HubEventSource, OracleEventSource, PushNotificationService, PushSender (+22 more)

### Community 27 - "terminal-session.ts"
Cohesion: 0.05
Nodes (72): afterExit(), boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus(), composerHoldsOtherText() (+64 more)

### Community 28 - "tmux-test-helpers.ts"
Cohesion: 0.06
Nodes (61): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), startAgentAfterClear(), exec (+53 more)

### Community 29 - "ManagerMessage"
Cohesion: 0.05
Nodes (28): FakeManager, apps, directories, DreamerServiceOptions, ProactiveManager, FakeAgent, confirmationSchema, defaultsSchema (+20 more)

### Community 30 - "host-telemetry.ts"
Cohesion: 0.05
Nodes (47): prefixes, session, trusted, untrusted, BuildAppOptions, ProcessScanContext, HostRequest, registerHostTelemetryRoutes() (+39 more)

### Community 31 - "client.ts"
Cohesion: 0.08
Nodes (22): VoiceServerControl, captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord(), isTicket() (+14 more)

### Community 32 - "schedules.ts"
Cohesion: 0.06
Nodes (61): State, stateSchema, timestamp, action, create, existing, metadata, ScheduleProposalInput (+53 more)

### Community 33 - "schedule-launcher.test.ts"
Cohesion: 0.04
Nodes (43): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+35 more)

### Community 34 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+24 more)

### Community 35 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+27 more)

### Community 36 - "OracleVoiceCoordinator"
Cohesion: 0.09
Nodes (6): errorMessage(), OracleVoiceCoordinator, PendingFinalTurn, withTimeout(), VoiceTurnState, VoiceClientControl

### Community 37 - "session-presentation.ts"
Cohesion: 0.05
Nodes (53): closedSessionExpiresAt(), SessionInterruptionCause, listClosedSessions(), saveSessionOrderLane(), handleDragEnd(), stepSession(), Composer(), KnowledgeRootSelector() (+45 more)

### Community 38 - "react"
Cohesion: 0.07
Nodes (45): react, scheduleProposalSummary(), CLAUDE_SCHEDULE_UNAVAILABLE_REASON, scheduleProviderUnavailableReason(), ScheduleTarget, FeatureEvent, listeners, publishFeatureEvent() (+37 more)

### Community 39 - "FakeVoiceEngine"
Cohesion: 0.06
Nodes (25): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceSttEngine, VoiceTtsEngine, VoiceUtteranceAudioFrame (+17 more)

### Community 40 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 41 - "node-routes.ts"
Cohesion: 0.06
Nodes (41): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, exactArrayBuffer() (+33 more)

### Community 42 - "agent-service.test.ts"
Cohesion: 0.05
Nodes (31): CopilotClientLike, terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration (+23 more)

### Community 44 - "oracle-voice-worker.ts"
Cohesion: 0.09
Nodes (23): benchmarkGroup(), capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent(), isEnabledConfig(), isNonEmptyString() (+15 more)

### Community 45 - "SchedulerStore"
Cohesion: 0.11
Nodes (10): enableSchedulerTools(), fixture(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, retainedHistory(), ScheduleProposal (+2 more)

### Community 46 - ".sendInternal"
Cohesion: 0.10
Nodes (42): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity() (+34 more)

### Community 47 - "DreamerService"
Cohesion: 0.12
Nodes (10): DreamerMemoryMetadata, boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs() (+2 more)

### Community 48 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (33): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+25 more)

### Community 49 - "SessionService"
Cohesion: 0.07
Nodes (6): closeReason(), closeVoiceSocket(), registerNodeRoutes(), SessionService, WorkspaceFile, WorkspaceFileIcon()

### Community 50 - "ScheduleRun"
Cohesion: 0.12
Nodes (12): provenance(), scheduleSessionTitle(), SessionScheduleLauncher, session(), ScheduleLauncher, ScheduleLaunchRefusedError, SchedulerDispatcher, ScheduleReconciliation (+4 more)

### Community 51 - "fake-voice.ts"
Cohesion: 0.07
Nodes (10): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance (+2 more)

### Community 52 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (41): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 53 - "TerminalSessionController"
Cohesion: 0.07
Nodes (9): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, forgetSessionEvents(), TerminalFormReplyError, TerminalSessionController, PendingUserInput, UserInputReplyInput (+1 more)

### Community 54 - "src/settings-profile.ts"
Cohesion: 0.08
Nodes (25): NewSessionRuntime, sameSettingValue(), SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+17 more)

### Community 55 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (43): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+35 more)

### Community 56 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (13): awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+5 more)

### Community 57 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 58 - "session-launcher.ts"
Cohesion: 0.06
Nodes (26): ClaudeSdk, awaitTermination(), LaunchCreations, apps, directories, directory(), runtime(), services (+18 more)

### Community 59 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 60 - "controls.tsx"
Cohesion: 0.08
Nodes (42): getProviderRuntimeOptions(), shortcutKeys(), readStoredShortcuts(), AppShortcutBinding, binding(), bindingLabel(), capturableCode(), capturableCodes (+34 more)

### Community 61 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (40): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+32 more)

### Community 62 - "oracle-voice.ts"
Cohesion: 0.09
Nodes (36): capabilities, closeServers, exactArrayBuffer(), sockets, startFields, VoiceNode, decodeVoiceAudioFrame(), encodeVoiceAudioFrame() (+28 more)

### Community 63 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 64 - "VoiceAudioFrame"
Cohesion: 0.10
Nodes (23): ActiveBackendSession, QueuedAudio, SocketMessage, AudioReservation, VoiceBackendDisconnectCause, VoiceBackendOutput, VoiceFinalTranscript, VoiceFrameAcceptance (+15 more)

### Community 65 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 66 - "dreamer-planner.ts"
Cohesion: 0.08
Nodes (30): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+22 more)

### Community 67 - "oracle-voice-coordinator.ts"
Cohesion: 0.06
Nodes (26): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnector (+18 more)

### Community 68 - "manager-agent.ts"
Cohesion: 0.07
Nodes (28): DreamerProgressView, automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung (+20 more)

### Community 69 - "oracle-voice-config.ts"
Cohesion: 0.08
Nodes (29): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+21 more)

### Community 70 - "session-resource-clear.test.ts"
Cohesion: 0.06
Nodes (31): cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), apps, directories (+23 more)

### Community 71 - "FakeSessionService"
Cohesion: 0.07
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 72 - "Composer.tsx"
Cohesion: 0.09
Nodes (19): families, modelFamily, repositoryModels, AttachmentStrip(), composerSteeringUnavailableReason(), ComposerActions(), ContextRing(), QueuedPromptList() (+11 more)

### Community 73 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 74 - "hub-routes.ts"
Cohesion: 0.06
Nodes (39): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+31 more)

### Community 75 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 76 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 77 - "manager-proactive-coordinator.ts"
Cohesion: 0.11
Nodes (13): automaticTurns(), event(), batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions (+5 more)

### Community 78 - "sections.tsx"
Cohesion: 0.10
Nodes (27): PushPolicy, NotificationScope, AppearanceSetting, NewSessionBackendSetting, getHubHealth(), scrollSettingsTo(), settingsTakeoverEvents, HealthCard() (+19 more)

### Community 79 - "schedule-recurrence.ts"
Cohesion: 0.11
Nodes (36): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+28 more)

### Community 80 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 81 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 82 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 83 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (19): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail(), FakeClient (+11 more)

### Community 84 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (14): createVoiceWorker(), PiperProcess, childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream (+6 more)

### Community 85 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (33): cancelManager(), editQueuedManagerMessage(), resetManager(), sendManagerMessage(), ActivityRow, applyEvent(), canTakeFocus(), ConfirmationCard (+25 more)

### Community 86 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 87 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 88 - "node:fs/promises"
Cohesion: 0.07
Nodes (26): root, script, deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases (+18 more)

### Community 89 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (21): VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), connect(), createManager(), Inbox (+13 more)

### Community 90 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+26 more)

### Community 91 - "KnowledgeStore"
Cohesion: 0.12
Nodes (14): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+6 more)

### Community 92 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (35): assertExactKeys(), cloneState(), DISPOSITIONS, hasExactKeys(), isDisposition(), isEventKind(), isId(), isOrigin() (+27 more)

### Community 93 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (25): initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_QUERY_CHARS (+17 more)

### Community 94 - "ManagerClientDefaults"
Cohesion: 0.10
Nodes (17): ManagerState, OracleVoiceBackendConnection, ManagerClientDefaults, VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState (+9 more)

### Community 95 - "oracle-voice-routes.ts"
Cohesion: 0.12
Nodes (31): sendNodeVoiceOutput(), limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode() (+23 more)

### Community 96 - "DialogFrame.tsx"
Cohesion: 0.09
Nodes (26): addComputer(), configureRuntime(), changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames() (+18 more)

### Community 97 - "manager-context.ts"
Cohesion: 0.13
Nodes (27): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+19 more)

### Community 98 - "oracle-voice-routes.test.ts"
Cohesion: 0.07
Nodes (13): nodeVoiceCapabilities(), ObservedLocalVoiceBackend, openApps, openSockets, RouteManager, RouteVoiceBackend, runtime(), testRoot() (+5 more)

### Community 99 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 100 - "EngineVoiceBackendSession"
Cohesion: 0.20
Nodes (3): asSessionError(), EngineVoiceBackendSession, VoiceSessionError

### Community 101 - "setupWorkspaceFixture"
Cohesion: 0.08
Nodes (15): desktop, devices, long, open(), phone, veryLong, devices, markedState() (+7 more)

### Community 102 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 103 - "pwa.ts"
Cohesion: 0.12
Nodes (28): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), App(), applyPwaUpdate(), activatePwaUpdate(), activePushSubscription(), applicationServerKey() (+20 more)

### Community 104 - "dreamer-service.ts"
Cohesion: 0.12
Nodes (28): DreamerPlanDraft, DreamerPlannerInput, DreamerFollowUp, DreamerPlannerExecutionInput, safeRunError(), unavailableSnapshot(), DreamerStoreSnapshot, OracleTaskFindingInput (+20 more)

### Community 105 - "preview-features.ts"
Cohesion: 0.15
Nodes (21): hub(), AppVersion, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable() (+13 more)

### Community 106 - "normalizeKnowledgeRelativePath"
Cohesion: 0.12
Nodes (27): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+19 more)

### Community 107 - "SessionOrderStore"
Cohesion: 0.16
Nodes (12): orderStore(), carried(), laneFrom(), retire(), sameLane(), sessionOrderKey(), SessionOrderState, SessionOrderStore (+4 more)

### Community 108 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (24): isTerminalSessionInUsePrompt(), parseTerminalUpdateNotice(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), desktopInstallPane, directories (+16 more)

### Community 109 - "ui-scenes.ts"
Cohesion: 0.13
Nodes (18): { values }, fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns, fixtureSchedules, open(), Recorder, assertNoHorizontalOverflow() (+10 more)

### Community 110 - "backgroundTasksFromEvents"
Cohesion: 0.17
Nodes (30): addActivity(), backgroundHandoff(), backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue(), eventString(), eventTask() (+22 more)

### Community 111 - "schedule-notifications.integration.test.ts"
Cohesion: 0.09
Nodes (20): headers, hub(), sender, NoopScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS, SchedulerDispatcherOptions (+12 more)

### Community 112 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (17): removeQueuedManagerMessage(), resolveManagerConfirmation(), retryManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+9 more)

### Community 113 - "SessionNavigation.tsx"
Cohesion: 0.14
Nodes (20): readScheduleLink(), ScheduleLink, scheduleNotificationLabel(), ProgressTime(), PreviewFeaturesContext, usePreviewFeature(), sessionOriginDescription(), sessionActivityTime() (+12 more)

### Community 114 - "capture-workspace.ts"
Cohesion: 0.13
Nodes (24): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+16 more)

### Community 115 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 116 - ".toolHost"
Cohesion: 0.11
Nodes (4): ManagerHub, PermissionReplyInput, RenameSessionInput, SendMessageInput

### Community 117 - "use-markdown-document.ts"
Cohesion: 0.14
Nodes (21): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+13 more)

### Community 118 - "session-directory.ts"
Cohesion: 0.18
Nodes (20): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+12 more)

### Community 119 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 120 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 121 - "SessionResources.tsx"
Cohesion: 0.12
Nodes (22): isMcpSummary(), isRecord(), isSkillSummary(), listSessionMcpServers(), listSessionSkills(), optionalBoolean(), optionalCount(), optionalText() (+14 more)

### Community 122 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (24): advance(), connections, content(), FrameMeasurement, lastHeading(), message(), open(), percentile() (+16 more)

### Community 123 - "registerSessionKnowledgeRoutes"
Cohesion: 0.14
Nodes (21): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+13 more)

### Community 124 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 125 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (23): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus() (+15 more)

### Community 126 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 127 - "ManagerProactiveInbox"
Cohesion: 0.18
Nodes (5): isAlreadyExists(), ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, nowIso(), openInbox()

### Community 128 - "HostSnapshot"
Cohesion: 0.17
Nodes (19): HostSnapshot, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics, snapshot, Socket (+11 more)

### Community 129 - "ManagerStructuredMemoryStore"
Cohesion: 0.25
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 130 - "NotificationStore"
Cohesion: 0.17
Nodes (5): emptyState(), matchesNotification(), NotificationStore, setup(), NotificationFilter

### Community 131 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 132 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 133 - "session-response-order.ts"
Cohesion: 0.15
Nodes (20): applyComputerSnapshot(), checkComputerConnections(), computerAdded(), computerRemoved(), discardUnpairedComputers(), forgetComputerKnowledge(), liftUnpairedTombstones(), tombstoneUnpairedSession() (+12 more)

### Community 134 - "workspace-fixtures.ts"
Cohesion: 0.13
Nodes (17): documents, fixtureComputers, fixtureEndpoints, fixtureHostHistory, fixtureHostProcesses, fixtureHostSnapshot, fixtureKnowledgeListings, fixtureKnowledgePositions (+9 more)

### Community 135 - "session-patches.test.ts"
Cohesion: 0.17
Nodes (9): Connection, Client, PatchSocket, Browser, seedOffset, session(), HubResyncRequest, HubWireEvent (+1 more)

### Community 136 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 137 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 138 - "session-reply-durability.test.ts"
Cohesion: 0.16
Nodes (16): assistantFixture(), claudeFixture(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer, fallbackFormFixture() (+8 more)

### Community 139 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 140 - "pipeline.ts"
Cohesion: 0.16
Nodes (20): holdingRenderer(), openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), documentOpening(), documentParts(), documentRenderEvents() (+12 more)

### Community 141 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 142 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 143 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (16): assertOpenedFilePath(), fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath() (+8 more)

### Community 144 - "markdown-navigation.ts"
Cohesion: 0.19
Nodes (18): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+10 more)

### Community 145 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 146 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 147 - "oracle-status.test.ts"
Cohesion: 0.18
Nodes (15): oracleHostStatusFixture(), bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes() (+7 more)

### Community 148 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 149 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 150 - "server/side-question.ts"
Cohesion: 0.20
Nodes (7): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout()

### Community 151 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (13): directories, disk, fixture(), gate(), gates, initialize(), PublicSessionValue, runtimes (+5 more)

### Community 152 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 153 - "manager-structured-memory-store.ts"
Cohesion: 0.14
Nodes (12): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_RECORDS (+4 more)

### Community 154 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 155 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (10): client(), delayQueueWrite(), disk, exec, gate(), holdQueueCommit(), NativeFixture, NativeRuntime (+2 more)

### Community 156 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 157 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 158 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 159 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 160 - "session-resource-routes.test.ts"
Cohesion: 0.15
Nodes (9): node(), apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService (+1 more)

### Community 161 - "server/skill-settings.ts"
Cohesion: 0.19
Nodes (12): builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), scalar(), skillFrontmatter(), SkillRoot, SKILL_SETTINGS_CAPABILITY (+4 more)

### Community 162 - "renderer.test.ts"
Cohesion: 0.16
Nodes (8): render, scope, createWorkerRenderer(), RendererWorker, FakeWorker, startWorkers(), handleRenderRequest(), RenderRequest

### Community 163 - "capture-workbench-review.ts"
Cohesion: 0.13
Nodes (12): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, fixtureSessions (+4 more)

### Community 164 - "session-unread.pw.ts"
Cohesion: 0.14
Nodes (8): bounds(), devices, edgeState(), screenshot(), unreadState(), BACKGROUND_SESSION_ID, fixtureBackgroundTasks, SUSPENDED_SESSION_ID

### Community 165 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 166 - "closed-session-sweeper.ts"
Cohesion: 0.17
Nodes (5): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS

### Community 167 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 168 - "use-markdown-document.test.tsx"
Cohesion: 0.17
Nodes (7): DocumentRenderEvent, RenderedDocumentTree, DocumentRenderer, DocumentRendererContext, synchronousRenderer, components, show()

### Community 169 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 170 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 171 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 172 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 173 - ".snapshot"
Cohesion: 0.30
Nodes (8): readBounded(), revision(), registerSkillSettingsRoutes(), SkillSettingsTarget, settingsObject(), SkillSettingsError, SkillSettingsSnapshot, SkillToggle

### Community 174 - "use-oracle-settings.ts"
Cohesion: 0.24
Nodes (12): getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+4 more)

### Community 175 - "SessionNavigation.test.tsx"
Cohesion: 0.16
Nodes (13): SessionSort, actions, backgroundTasks, computers, hiddenVisibility, NavigationHarness(), offline, question (+5 more)

### Community 176 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 177 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 178 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 179 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 180 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 181 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 182 - ".observe"
Cohesion: 0.21
Nodes (7): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId()

### Community 183 - "BackgroundTasksDialog.tsx"
Cohesion: 0.26
Nodes (10): BackgroundTask, BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 184 - "manager-automatic.ts"
Cohesion: 0.23
Nodes (10): MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed, finished, AutomaticTurn, automaticTurnSummary (+2 more)

### Community 185 - "ShellNavigation.test.tsx"
Cohesion: 0.35
Nodes (6): ClientFeature, railEntries(), initials(), useDisplayName(), DisplayNameSetting(), ShellNavigation()

### Community 187 - "recently-closed.pw.ts"
Cohesion: 0.23
Nodes (9): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), open(), row() (+1 more)

### Community 188 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 189 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 190 - ".initialize"
Cohesion: 0.24
Nodes (4): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, open()

### Community 191 - "ChatMessage"
Cohesion: 0.21
Nodes (10): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp(), StoredSession, ChatMessage (+2 more)

### Community 192 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 193 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 197 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 198 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 199 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 200 - "normalizeBackgroundTask"
Cohesion: 0.24
Nodes (9): attachmentModeValue(), MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH, normalizeBackgroundTask(), numberValue(), progressValue(), statusValue(), lifecycleEvent() (+1 more)

### Community 201 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 202 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 203 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 204 - "pipeline.test.tsx"
Cohesion: 0.27
Nodes (7): components, drawn(), drawnPage(), fixtures, html(), today(), rehypeDocumentHeadings()

### Community 205 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 206 - "WorkspaceFixtureOptions"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 207 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 208 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 209 - "SessionStatus"
Cohesion: 0.25
Nodes (8): Seen, ManagerProactiveInboxObservation, PersistedCursor, NotificationCursor, Row, SdkRestartRecovery, SessionStatus, SessionTurnState

### Community 210 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 211 - "tmux-errors.test.ts"
Cohesion: 0.25
Nodes (6): directories, { execute }, files, links, listener(), server()

### Community 212 - "closed-sessions.ts"
Cohesion: 0.33
Nodes (6): CLOSED_SESSION_RETENTION_DAYS, closedSessionContext(), excerpt(), isClosedSessionContext(), said(), ClosedSessionContext

### Community 213 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 214 - "DocumentHeading"
Cohesion: 0.25
Nodes (5): DocumentViewControls(), actions, outline, MarkdownDocumentView, DocumentHeading

### Community 215 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 216 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 217 - "fixture-frontend.ts"
Cohesion: 0.32
Nodes (4): captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend()

### Community 218 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 219 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 220 - "SkillSettingsService"
Cohesion: 0.29
Nodes (4): applications, directories, fixture(), SkillSettingsService

### Community 221 - "skill-settings-jsonc.ts"
Cohesion: 0.48
Nodes (5): instrument(), document(), parseSkillSettings(), replaceDisabledSkills(), Token

### Community 222 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 223 - "session-order-routes.test.ts"
Cohesion: 0.43
Nodes (6): directories, fakeManager(), hub(), settled(), until(), upserted()

### Community 224 - "session-unread-tracker.ts"
Cohesion: 0.38
Nodes (3): FinishedSession, SessionUnreadTracker, finished()

### Community 225 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 226 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 228 - "use-foreground-handoff.ts"
Cohesion: 0.47
Nodes (3): foregroundHandoffTimeoutMs, Handoff, useForegroundHandoff()

### Community 229 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 230 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 232 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1420 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1415 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2377 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionStore`, `NotificationStore`, `SessionDetail`, `notification-classifier.ts`, `ManagerStore`, `ManagedSession`, `sampler.ts`, `oracle-voice-session.ts`, `ManagerAgent`, `shared/settings-profile.ts`, `PushNotificationService`, `ManagerMessage`, `host-telemetry.ts`, `schedule-launcher.test.ts`, `transcription-service.ts`, `node-routes.ts`, `ProviderSessionService`, `oracle-voice-worker.ts`, `SchedulerStore`, `.snapshot`, `DreamerService`, `oracle-task-store.ts`, `SessionService`, `ScheduleRun`, `TerminalSessionController`, `ScheduleNotificationService`, `oracle-voice-config.ts`, `manager-proactive-coordinator.ts`, `dreamer-routes.ts`, `manager-agent.test.ts`, `KnowledgeStore`, `SkillSettingsService`, `manager-structured-memory.ts`, `SessionKnowledgeStore`, `SessionOrderStore`, `cli-canary.ts`, `ManagerProactiveInbox`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `VoiceAudioFrame`, `schedule-launcher.test.ts`, `contracts.ts`, `computer-manager.ts`, `SessionService`, `.toolHost`, `TerminalSessionController`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `SessionDetail`, `agent-service.ts`, `session-store-providers.test.ts`, `TerminalSessionController`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1420 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.034334763948497854 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.022705979608707634 - nodes in this community are weakly interconnected._
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
