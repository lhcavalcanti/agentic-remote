# Agentic Remote - Graphify code map

Snapshot: `aa4cc1fe9d17fcf52b11807fbad4b70e0ebecf69e7a4543c62b86bcf028c6df1`

Source checkout: `91949afa4eb2e95f35a053118e055569b8226544`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 666 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 666 files · ~1,185,238 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9312 nodes · 26891 edges · 282 communities (238 shown, 26 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1337 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionStore
- AppWorkspace
- AgentService
- api.ts
- ClaudeAgentService
- agent-service.ts
- SessionService
- hub-routes.ts
- App.tsx
- contracts.ts
- client.ts
- ManagedSession
- claude-agent-service.ts
- oracle-voice-routes.test.ts
- manager-tools.ts
- active-sessions.ts
- agentic-remote-promotion-monitor
- shared/settings-profile.ts
- terminal-session.ts
- oracle-voice-soak.ts
- dreamer-store.ts
- ManagerAgent
- OracleVoiceCoordinator
- oracle-voice-child.ts
- session-presentation.ts
- terminal-session.test.ts
- VoiceCapture
- oracle-voice-worker.ts
- CopilotSessionLike
- RemoteNodeClient
- workspace-fixtures.ts
- tmux-test-helpers.ts
- ManagerMessage
- manager-agent.ts
- multi-node.test.ts
- oracle-voice-integration.test.ts
- oracle-task-store.ts
- session-store-providers.test.ts
- .sendInternal
- manager-store.ts
- ui-locks.pw.ts
- DreamerService
- manager-structured-memory-validation.ts
- sampler.ts
- CopilotClientLike
- ManagerStore
- react
- background-task-adapter.ts
- oracle-voice.ts
- oracle-voice-routes.ts
- SchedulerStore
- TmuxTerminalSessionController
- oracle-voice-benchmark.ts
- setupWorkspaceFixture
- schedule-launcher.ts
- scheduler-store.ts
- notification-center.ts
- OracleDreamer.tsx
- src/settings-profile.ts
- controls.tsx
- agentic-remote
- BackgroundTaskSnapshot
- session-service.ts
- session-knowledge-routes.test.ts
- ComposerActions.tsx
- TerminalSessionController
- oracle-voice-session.ts
- ManagerAssistant.tsx
- SessionDetail
- dreamer-progress.ts
- RecentlyClosed.tsx
- agentic-remote-gate
- app.ts
- bundle
- oracle-voice-engine.ts
- feature-flags.ts
- manager.ts
- FakeVoiceEngine
- VoicePlayback
- normalizeKnowledgeRelativePath
- manager-proactive-inbox.ts
- shell.ts
- lib.rs
- schedule-recurrence.ts
- ScheduleForm.tsx
- pipeline.test.tsx
- dependencies
- devDependencies
- terminal-startup-queue.test.ts
- server/session-patches.ts
- client.test.ts
- agentic-remote-promotion-setup
- buildApp
- manager-agent.test.ts
- SessionOrderStore
- config.rs
- dreamer-planner.ts
- PushNotificationService
- oracle-voice-security.test.ts
- manager-structured-memory.ts
- BackgroundTasksDialog.tsx
- real-voice.ts
- dreamer-service.ts
- NotificationCenterService
- ScheduleWorktreeService
- session-launcher.ts
- knowledge-tree.ts
- session-prefetch.ts
- markdown-navigation.ts
- recovery-resend-durability.test.ts
- closed-sessions.ts
- session-resource-clear.test.ts
- schedule-proposals.ts
- host-telemetry.ts
- ManagerStructuredMemoryStore
- oracle-voice-segments.ts
- pwa.ts
- transcript-test-helpers.ts
- manager-proactive-coordinator.ts
- oracle-voice-child.test.ts
- remote-voice-client.ts
- SchedulerDispatcher
- SessionResources.tsx
- manager-structured-memory-search.ts
- ManagerAttachment
- schedules.ts
- session-patch-browser.ts
- capture-workspace.ts
- cli-canary.ts
- service.ts
- session-transcript.ts
- scripts
- use-markdown-document.test.tsx
- check-workspace-review-regressions.ts
- session-directory.ts
- server/skill-settings.ts
- ManagerAssistant.test.tsx
- compilerOptions
- oracle-voice-config.ts
- transport.test.ts
- .toolHost
- .observe
- oracle-voice-coordinator.test.ts
- transcription-service.ts
- agent-service.test.ts
- session-patches.test.ts
- session-reply-durability.test.ts
- PromptCards.tsx
- pipeline.ts
- vite.config.ts
- ManagerProactiveInbox
- oracle-voice-tickets.ts
- HostMonitorView.test.tsx
- compilerOptions
- full-gate.test.ts
- compilerOptions
- OnlineRecognizer
- workspace-browser.ts
- ActivityDetails.tsx
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- .correct
- session-knowledge-store.ts
- delegated-transcription-service.ts
- dreamer-schedule.ts
- oracle-status.test.ts
- KnowledgeStore
- promotion-monitor.test.ts
- SessionKnowledgeStore
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- session-latency-benchmark.ts
- projection-test-helpers.ts
- alerts.test.ts
- session-knowledge-routes.ts
- ScheduleNotificationService
- terminal-form-deadline.test.ts
- background-task-stop.test.ts
- manager-runtime.ts
- HostTelemetrySampler
- knowledge-store.ts
- session-resource-routes.test.ts
- SessionOriginBadge.test.tsx
- package.json
- registerSessionKnowledgeRoutes
- oracle-voice-assets.test.ts
- pending-echo.ts
- fake-vad.ts
- desktop.json
- agent-service-event-projection.test.ts
- DeferredSession
- response-compression.test.ts
- LargeSessionService
- shared/skill-settings.ts
- ActivityRow.tsx
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- TranscriptionService
- dreamer-routes.ts
- session-scope.ts
- TranscriptionError
- Pcm16Resampler
- ChatMessage
- ActivityRow.test.tsx
- html-preview.ts
- sign-in-expired.pw.ts
- manager-proactive-inbox.test.ts
- SessionAdmissions
- tmux-errors.test.ts
- use-oracle-attachments.ts
- dataset
- generate-pwa-icons.ts
- app-build.test.ts
- notification-center.integration.test.ts
- .persist
- bridge.rs
- history-projection.test.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- response-compression.ts
- session-knowledge-store.test.ts
- SkillsSettings.tsx
- sent-message.ts
- voice-recorder.ts
- doctor-cli.test.ts
- manager-proactive-coordinator.test.ts
- release-publication.test.ts
- UserInputFieldControl
- skill-settings-jsonc.ts
- composer-layout.test.ts
- settings.ts
- DocumentViewControls.tsx
- HostTelemetryClock
- refusal-metrics-routes.test.ts
- MarkdownCodeBlock.tsx
- api-origin.test.ts
- promotion-setup.test.ts
- FakeRecorder
- MemoryStorage
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
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `make()` --indirect_call--> `reader()`  [INFERRED]
  server/host-telemetry/transport.test.ts → shared/transcript-window.test.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (282 total, 26 thin omitted)

### Community 0 - "SessionStore"
Cohesion: 0.02
Nodes (95): fixture(), restart(), fixture(), connect(), createStore(), enqueue(), fixture(), recoveryFixture() (+87 more)

### Community 1 - "AppWorkspace"
Cohesion: 0.03
Nodes (177): terminalSendOptions(), AppWorkspace(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession(), askAboutKnowledgeFile() (+169 more)

### Community 2 - "AgentService"
Cohesion: 0.04
Nodes (8): agentMode(), AgentService, isTerminalNotReadyRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, queuedBehindTurn(), queuedForPrompt(), TranscriptObservation

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (153): SettingsChange, SettingsProfileKey, SettingsUpdateResult, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), submissionReceiptFromError(), activateSession() (+145 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (21): isUncertainDelivery(), terminalAnswerRefused(), ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle() (+13 more)

### Community 5 - "agent-service.ts"
Cohesion: 0.03
Nodes (90): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+82 more)

### Community 6 - "SessionService"
Cohesion: 0.04
Nodes (15): updateComputerForLaunchIdentity(), nodeVoiceCapabilities(), registerNodeRoutes(), tokenMatches(), owns(), ProviderSessionService, obstructUploads(), isSessionResourceRoute() (+7 more)

### Community 7 - "hub-routes.ts"
Cohesion: 0.02
Nodes (87): ClientPresence, PRESENCE_TTL_MS, FileUploadError, registerFileUploadRoutes(), SessionParams, addComputerSchema, configureRuntimeSchema, createSessionSchema (+79 more)

### Community 8 - "App.tsx"
Cohesion: 0.03
Nodes (86): isManagerEvent(), extension(), sessionFileValidationError(), supportedExtensions, supportsSessionFile(), TRANSCRIPT_WINDOW, ActivityRowStates, sidebarResizeMove() (+78 more)

### Community 9 - "contracts.ts"
Cohesion: 0.03
Nodes (74): RemoteResync, RemoteSessionListing, RemoteSessionRead, awaitTermination(), LaunchCreations, apps, directories, directory() (+66 more)

### Community 10 - "client.ts"
Cohesion: 0.05
Nodes (36): ManagerClientDefaults, VoiceCapabilities, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason(), isCapabilities() (+28 more)

### Community 11 - "ManagedSession"
Cohesion: 0.07
Nodes (16): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), ManagerEventSource, registerHubRoutes(), SessionMuteCarrier, ManagerProactiveCoordinatorOptions (+8 more)

### Community 12 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (67): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+59 more)

### Community 13 - "oracle-voice-routes.test.ts"
Cohesion: 0.04
Nodes (28): ActiveBackendSession, beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, installFakeBrowserVoice(), ScriptedUtterance (+20 more)

### Community 14 - "manager-tools.ts"
Cohesion: 0.04
Nodes (47): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+39 more)

### Community 15 - "active-sessions.ts"
Cohesion: 0.05
Nodes (58): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+50 more)

### Community 16 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 17 - "shared/settings-profile.ts"
Cohesion: 0.05
Nodes (57): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), directories, fakeManager() (+49 more)

### Community 18 - "terminal-session.ts"
Cohesion: 0.04
Nodes (77): afterExit(), BackgroundShellsEvidence, boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText() (+69 more)

### Community 19 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 20 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (42): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+34 more)

### Community 21 - "ManagerAgent"
Cohesion: 0.07
Nodes (13): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), capturePrompt() (+5 more)

### Community 22 - "OracleVoiceCoordinator"
Cohesion: 0.07
Nodes (18): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+10 more)

### Community 23 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (36): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+28 more)

### Community 24 - "session-presentation.ts"
Cohesion: 0.05
Nodes (63): listClosedSessions(), handleDragEnd(), stepSession(), foregroundHandoffTimeoutMs, Handoff, useForegroundHandoff(), KnowledgeRootSelector(), root (+55 more)

### Community 25 - "terminal-session.test.ts"
Cohesion: 0.04
Nodes (63): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+55 more)

### Community 26 - "VoiceCapture"
Cohesion: 0.06
Nodes (24): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, harness() (+16 more)

### Community 27 - "oracle-voice-worker.ts"
Cohesion: 0.06
Nodes (36): benchmarkGroup(), VoiceWorkerOptions, VoiceEndUtterance, VoiceStartUtterance, VoiceUtteranceAudioFrame, BlockingEngine, BlockingEngine, ActiveSynthesisIdentity (+28 more)

### Community 28 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (33): CopilotSessionLike, CopilotTasksApi, openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery() (+25 more)

### Community 29 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (22): RemoteNodeClient, client(), servers, session, RemoteNodeCapabilityError, RemoteNodeTransportError, AgentProvider, NodeInfo (+14 more)

### Community 30 - "workspace-fixtures.ts"
Cohesion: 0.04
Nodes (48): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, oracleHostStatusFixture() (+40 more)

### Community 31 - "tmux-test-helpers.ts"
Cohesion: 0.06
Nodes (54): foreignSocketPlace(), execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), noTmuxServer() (+46 more)

### Community 32 - "ManagerMessage"
Cohesion: 0.05
Nodes (24): FakeManager, FakeVoiceState, ProactiveManager, FakeAgent, confirmationSchema, defaultsSchema, editSchema, effort (+16 more)

### Community 33 - "manager-agent.ts"
Cohesion: 0.06
Nodes (49): CreationRuntime, DreamerProgressEntry, DreamerProgressView, automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, messagePriority() (+41 more)

### Community 34 - "multi-node.test.ts"
Cohesion: 0.04
Nodes (17): activityDetailsUnavailable(), activityNotInLog(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), ClaudeFakeSessionService, directories, FakeSessionService (+9 more)

### Community 35 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+23 more)

### Community 36 - "oracle-task-store.ts"
Cohesion: 0.08
Nodes (41): DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+33 more)

### Community 37 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (40): root, script, ClaudeSdk, deferred(), disk, fixtures, holdClaimWrite(), releases (+32 more)

### Community 38 - ".sendInternal"
Cohesion: 0.09
Nodes (50): terminalComposerUnreadable(), activeBottomFrame(), backgroundShellsAllow(), busyRowStatus(), captureBeforeDeadline(), captureForReplacement(), capturePane(), cleanDialogLine() (+42 more)

### Community 39 - "manager-store.ts"
Cohesion: 0.06
Nodes (35): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, JournalRecorder (+27 more)

### Community 40 - "ui-locks.pw.ts"
Cohesion: 0.06
Nodes (36): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+28 more)

### Community 41 - "DreamerService"
Cohesion: 0.10
Nodes (15): activeDreamerMemoryIds(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), safeRunError(), uniqueSessionRefs() (+7 more)

### Community 42 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 43 - "sampler.ts"
Cohesion: 0.07
Nodes (48): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+40 more)

### Community 44 - "CopilotClientLike"
Cohesion: 0.04
Nodes (37): complete(), event(), sessionWithLog(), start(), CopilotClientLike, directories, fakeClient(), ForkRequest (+29 more)

### Community 45 - "ManagerStore"
Cohesion: 0.07
Nodes (12): openStore(), recordScheduleProposals(), emptyState(), ManagerStore, open(), createManager(), StoredManager, createManager() (+4 more)

### Community 46 - "react"
Cohesion: 0.08
Nodes (36): WorkspaceFixtureState, react, RuntimeModelOption, AppearanceSetting, getHubHealth(), getManager(), updateManagerSettings(), effortFrom() (+28 more)

### Community 47 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (53): addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, copyTask() (+45 more)

### Community 48 - "oracle-voice.ts"
Cohesion: 0.08
Nodes (41): VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities, closeServers, exactArrayBuffer(), sockets (+33 more)

### Community 49 - "oracle-voice-routes.ts"
Cohesion: 0.07
Nodes (44): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), playbackSequence(), ActiveConversation, availableCapabilities(), backendOutputBytes() (+36 more)

### Community 50 - "SchedulerStore"
Cohesion: 0.11
Nodes (8): enableSchedulerTools(), fixture(), failure(), occurrenceKey(), SchedulerStore, retainedHistory(), ScheduleProposal, Schedule

### Community 51 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (13): awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+5 more)

### Community 52 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 53 - "setupWorkspaceFixture"
Cohesion: 0.05
Nodes (25): desktop, devices, long, open(), phone, veryLong, bounds(), closedEarlier (+17 more)

### Community 54 - "schedule-launcher.ts"
Cohesion: 0.09
Nodes (27): LaunchPrimitives, provenance(), recordScheduleProvenance(), ScheduleLauncherHost, ScheduleProvenance, scheduleSessionTitle(), SessionScheduleLauncher, NoopScheduleLauncher (+19 more)

### Community 55 - "scheduler-store.ts"
Cohesion: 0.08
Nodes (36): ComputerManagerEvents, attentionClosed(), attentionSeed(), classifyHostNotification(), classifyHubNotification(), classifyOracleNotification(), classifyScheduleNotification(), HOST_ALERT_MEMORY_DURATION_MS (+28 more)

### Community 56 - "notification-center.ts"
Cohesion: 0.07
Nodes (38): booleanQuery, filters, params, registerNotificationRoutes(), cursorSchema, durableState(), identity, kind (+30 more)

### Community 57 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (40): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition (+32 more)

### Community 58 - "src/settings-profile.ts"
Cohesion: 0.09
Nodes (24): sameSettingValue(), SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+16 more)

### Community 59 - "controls.tsx"
Cohesion: 0.09
Nodes (42): shortcutKeys(), readStoredShortcuts(), AppShortcutBinding, binding(), bindingLabel(), capturableCode(), capturableCodes, isModifierCode() (+34 more)

### Community 60 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 61 - "BackgroundTaskSnapshot"
Cohesion: 0.07
Nodes (27): backgroundTaskNotFound(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), listedBackgroundTask(), readBackgroundTaskFrom(), taskFingerprint(), apps (+19 more)

### Community 62 - "session-service.ts"
Cohesion: 0.08
Nodes (24): AgentServiceEvents, ClaudeAgentServiceEvents, DirectoryScope, ProviderSessionServiceEvents, closable(), provider(), RemoteNodeClientEvents, SessionKnowledgeBaseLocation (+16 more)

### Community 63 - "session-knowledge-routes.test.ts"
Cohesion: 0.06
Nodes (26): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+18 more)

### Community 64 - "ComposerActions.tsx"
Cohesion: 0.08
Nodes (21): families, modelFamily, shortModelName(), repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions() (+13 more)

### Community 65 - "TerminalSessionController"
Cohesion: 0.05
Nodes (14): holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), sessionInUseConflictMessage(), sessionInUseQueueMessage() (+6 more)

### Community 66 - "oracle-voice-session.ts"
Cohesion: 0.12
Nodes (15): acquisitionCancelled(), ActiveUtterance, asSessionError(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), QueuedOutput, sameUtterance() (+7 more)

### Community 67 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (41): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), phoneEnterCreatesNewline(), ActivityRow, applyEvent() (+33 more)

### Community 68 - "SessionDetail"
Cohesion: 0.10
Nodes (9): persistedFormAnswer(), TerminalFormContinuation, Admission, ExclusiveAdmission, PendingQueueAdmission, TerminalFormReplyError, PendingUserInput, SessionDetail (+1 more)

### Community 69 - "dreamer-progress.ts"
Cohesion: 0.09
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, DreamerProgressSource (+11 more)

### Community 70 - "RecentlyClosed.tsx"
Cohesion: 0.07
Nodes (35): closedSessionExpiresAt(), changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame() (+27 more)

### Community 71 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 72 - "app.ts"
Cohesion: 0.07
Nodes (27): RFC-9110, BuildAppOptions, ProcessScanContext, phases, port, OracleVoiceConfig, resolveDataDirectory(), app() (+19 more)

### Community 73 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 74 - "oracle-voice-engine.ts"
Cohesion: 0.07
Nodes (16): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, voiceBackend(), EnabledOracleVoiceConfig (+8 more)

### Community 75 - "feature-flags.ts"
Cohesion: 0.12
Nodes (27): defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable(), PreviewFeature, previewFeatureCatalogue (+19 more)

### Community 76 - "manager.ts"
Cohesion: 0.08
Nodes (27): NotificationRecorder, trusted, brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories (+19 more)

### Community 77 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (15): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceSttEngine, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+7 more)

### Community 78 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 79 - "normalizeKnowledgeRelativePath"
Cohesion: 0.09
Nodes (33): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+25 more)

### Community 80 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (38): assertExactKeys(), canonicalHash(), DISPOSITIONS, emptyState(), eventId(), hasExactKeys(), isDisposition(), isEventKind() (+30 more)

### Community 81 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 82 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 83 - "schedule-recurrence.ts"
Cohesion: 0.11
Nodes (36): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+28 more)

### Community 84 - "ScheduleForm.tsx"
Cohesion: 0.11
Nodes (30): scheduleProposalSummary(), CLAUDE_SCHEDULE_UNAVAILABLE_REASON, scheduleProviderUnavailableReason(), ScheduleTarget, getProviderRuntimeOptions(), FolderPicker(), browse(), editableSchedule() (+22 more)

### Community 85 - "pipeline.test.tsx"
Cohesion: 0.10
Nodes (30): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+22 more)

### Community 86 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 87 - "devDependencies"
Cohesion: 0.05
Nodes (39): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+31 more)

### Community 88 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (29): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+21 more)

### Community 89 - "server/session-patches.ts"
Cohesion: 0.10
Nodes (21): changedInPlace(), diffMessages(), Publication, sameField(), sameMessage(), sameOrder(), sessionKey(), SessionPublications (+13 more)

### Community 90 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 91 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 92 - "buildApp"
Cohesion: 0.08
Nodes (27): buildApp(), errorStatusCode(), directories, runtimes, trusted, hub(), build(), trusted (+19 more)

### Community 93 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (19): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail(), FakeClient (+11 more)

### Community 94 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 95 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 96 - "dreamer-planner.ts"
Cohesion: 0.10
Nodes (33): activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem(), digest() (+25 more)

### Community 97 - "PushNotificationService"
Cohesion: 0.13
Nodes (8): start(), PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 98 - "oracle-voice-security.test.ts"
Cohesion: 0.06
Nodes (21): OracleVoiceBackendConnection, QueuedAudio, FakeVoiceEngineCall, BrowserCaptureOptions, SocketMessage, apps, config, configFixture() (+13 more)

### Community 99 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (30): ManagerStructuredMemorySearchIndex, isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES (+22 more)

### Community 100 - "BackgroundTasksDialog.tsx"
Cohesion: 0.11
Nodes (28): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+20 more)

### Community 101 - "real-voice.ts"
Cohesion: 0.09
Nodes (13): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+5 more)

### Community 102 - "dreamer-service.ts"
Cohesion: 0.09
Nodes (23): DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, DreamerProgressLimits, boundedText(), DreamerPlannerExecutionInput, DreamerServiceOptions, directories (+15 more)

### Community 103 - "NotificationCenterService"
Cohesion: 0.13
Nodes (7): NotificationCenterService, emptyState(), matchesNotification(), NotificationStore, setup(), NotificationFilter, NotificationKindPreferences

### Community 104 - "ScheduleWorktreeService"
Cohesion: 0.14
Nodes (15): configuredScheduleWorktreeRoots(), execute, failure(), missing(), ScheduleWorktreeService, execute, git(), node() (+7 more)

### Community 105 - "session-launcher.ts"
Cohesion: 0.09
Nodes (17): delay(), requireFolderTrust(), sameFolder(), SessionFolderTrustPolicy, SessionLaunch, SessionLauncher, SessionLauncherHost, SessionLauncherOptions (+9 more)

### Community 106 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+24 more)

### Community 107 - "session-prefetch.ts"
Cohesion: 0.10
Nodes (23): browserConnection, ConnectionHints, connectionSparesData(), IdleScheduler, PASSIVE_READS_SINCE, PREFETCH_PASS_BYTES, PREFETCH_SIDEBAR_ROWS, readsPassively() (+15 more)

### Community 108 - "markdown-navigation.ts"
Cohesion: 0.12
Nodes (30): followMarkdownLink(), KnowledgeReader(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument(), submitSearch() (+22 more)

### Community 109 - "recovery-resend-durability.test.ts"
Cohesion: 0.09
Nodes (18): directories, disk, fixture(), gate(), gates, httpBoundary(), initialize(), PublicSessionValue (+10 more)

### Community 110 - "closed-sessions.ts"
Cohesion: 0.09
Nodes (19): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, blockParents, CLOSED_SESSION_RETENTION_DAYS, CLOSED_SESSION_RETENTION_MS, closedCapitals() (+11 more)

### Community 111 - "session-resource-clear.test.ts"
Cohesion: 0.08
Nodes (25): apps, directories, directory(), pairedFixture(), providerFixture(), providers, seed(), sockets (+17 more)

### Community 112 - "schedule-proposals.ts"
Cohesion: 0.12
Nodes (28): action, create, existing, metadata, scheduleProposalInputSchema, ScheduleProposalsChanged, scheduleProposalSchema, update (+20 more)

### Community 113 - "host-telemetry.ts"
Cohesion: 0.09
Nodes (27): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, aggregate (+19 more)

### Community 114 - "ManagerStructuredMemoryStore"
Cohesion: 0.12
Nodes (10): benchmarkState(), now(), openFixture(), searchSamples(), initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore (+2 more)

### Community 115 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 116 - "pwa.ts"
Cohesion: 0.12
Nodes (28): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), activatePwaUpdate(), activePushSubscription(), applicationServerKey(), checkForPwaUpdate() (+20 more)

### Community 117 - "transcript-test-helpers.ts"
Cohesion: 0.13
Nodes (18): contextChangedInEvents(), createPendingUserInputTracker(), foregroundCompletedSince(), isEmptyResponseNotice(), messagesFromHistory(), pendingUserInputFromEvents(), PendingUserInputTracker, runtimeInfoFromEvents() (+10 more)

### Community 118 - "manager-proactive-coordinator.ts"
Cohesion: 0.15
Nodes (8): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, SessionLifecycle, ManagerProactiveInboxEvent, ManagerProactiveOutcome

### Community 119 - "oracle-voice-child.test.ts"
Cohesion: 0.09
Nodes (11): childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize(), InProcessVoiceChild (+3 more)

### Community 120 - "remote-voice-client.ts"
Cohesion: 0.17
Nodes (13): VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+5 more)

### Community 121 - "SchedulerDispatcher"
Cohesion: 0.22
Nodes (4): SchedulerDispatcher, registerSchedulerRoutes(), holdsSlot(), isInFlight()

### Community 122 - "SessionResources.tsx"
Cohesion: 0.11
Nodes (25): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, isActivityDetail(), isActivityText(), isMcpSummary(), isRecord(), isSkillSummary() (+17 more)

### Community 123 - "manager-structured-memory-search.ts"
Cohesion: 0.12
Nodes (24): DreamerMemoryMetadataRecord, authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord() (+16 more)

### Community 124 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 125 - "schedules.ts"
Cohesion: 0.11
Nodes (26): cronExpression, DEFAULT_SCHEDULE_TIMEZONE, identifier, SCHEDULE_MIN_SPACING_MINUTES, SCHEDULE_PROMPT_MAX_LENGTH, scheduleAbandonSchema, scheduleActionSchema, scheduleArchivedSchema (+18 more)

### Community 126 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (26): advance(), Connection, connections, content(), FrameMeasurement, lastHeading(), message(), open() (+18 more)

### Community 127 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 128 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 129 - "service.ts"
Cohesion: 0.13
Nodes (11): HostRequest, HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError(), HostTelemetryService, HostTelemetryTarget, HOST_TELEMETRY_INVALID_CODE, HostMinuteAggregate (+3 more)

### Community 130 - "session-transcript.ts"
Cohesion: 0.14
Nodes (21): TRANSCRIPT_CARRIED_LIMIT, sortSessions(), upsertSessionSnapshot(), prefetchCandidates(), carrySnapshotTranscripts(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+13 more)

### Community 131 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 132 - "use-markdown-document.test.tsx"
Cohesion: 0.11
Nodes (11): DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), DocumentRenderer, DocumentRendererContext, RendererWorker, synchronousRenderer, FakeWorker (+3 more)

### Community 133 - "check-workspace-review-regressions.ts"
Cohesion: 0.08
Nodes (13): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+5 more)

### Community 134 - "session-directory.ts"
Cohesion: 0.21
Nodes (20): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+12 more)

### Community 135 - "server/skill-settings.ts"
Cohesion: 0.16
Nodes (16): builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), readBounded(), revision(), applications, directories (+8 more)

### Community 136 - "ManagerAssistant.test.tsx"
Cohesion: 0.09
Nodes (16): retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability, empty (+8 more)

### Community 137 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 138 - "oracle-voice-config.ts"
Cohesion: 0.15
Nodes (20): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+12 more)

### Community 139 - "transport.test.ts"
Cohesion: 0.13
Nodes (13): registerHostTelemetryRoutes(), HOST_TELEMETRY_MAX_QUEUE_BYTES, HOST_TELEMETRY_MAX_QUEUE_MESSAGES, HOST_TELEMETRY_SEND_TIMEOUT_MS, HostSocket, HostTelemetrySocket, readingFixture(), empty (+5 more)

### Community 140 - ".toolHost"
Cohesion: 0.13
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 141 - ".observe"
Cohesion: 0.14
Nodes (10): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso() (+2 more)

### Community 142 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 143 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 144 - "agent-service.test.ts"
Cohesion: 0.15
Nodes (13): terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+5 more)

### Community 145 - "session-patches.test.ts"
Cohesion: 0.16
Nodes (10): nextVoiceControl(), Client, Browser, seedOffset, HubResyncRequest, HubTasksResyncRequest, HubWireEvent, applyTaskPatch() (+2 more)

### Community 146 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+10 more)

### Community 147 - "PromptCards.tsx"
Cohesion: 0.13
Nodes (16): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+8 more)

### Community 148 - "pipeline.ts"
Cohesion: 0.15
Nodes (20): partlyHeldRenderer(), render, scope, documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform(), drawSteps() (+12 more)

### Community 149 - "vite.config.ts"
Cohesion: 0.12
Nodes (12): brotliAsync, compress(), gzipAsync, precompressDirectory(), PrecompressedFile, directories, canaryTests, oracleVoiceAssetNames (+4 more)

### Community 150 - "ManagerProactiveInbox"
Cohesion: 0.20
Nodes (6): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 151 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 152 - "HostMonitorView.test.tsx"
Cohesion: 0.17
Nodes (18): HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics, snapshot, Socket, bytes() (+10 more)

### Community 153 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 154 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 155 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 156 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 157 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (16): assertOpenedFilePath(), fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath() (+8 more)

### Community 158 - "ActivityDetails.tsx"
Cohesion: 0.21
Nodes (16): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, activityDetailFailure, detailKey(), formatBytes(), keep(), kept, keptActivityDetail(), loadActivityDetail() (+8 more)

### Community 159 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 160 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 161 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 162 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 163 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 164 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (18): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+10 more)

### Community 165 - "delegated-transcription-service.ts"
Cohesion: 0.15
Nodes (9): collect(), DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName(), MAX_AUDIO_BYTES (+1 more)

### Community 166 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 167 - "oracle-status.test.ts"
Cohesion: 0.19
Nodes (14): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+6 more)

### Community 169 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 170 - "SessionKnowledgeStore"
Cohesion: 0.26
Nodes (3): bindingKey(), SessionKnowledgeStore, SessionKnowledgeBinding

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

### Community 176 - "projection-test-helpers.ts"
Cohesion: 0.19
Nodes (13): sessionLog(), BackgroundTaskEventOptions, MAX_BACKGROUND_TASKS, MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH, lifecycleEvent(), subagentShell(), syntheticLog() (+5 more)

### Community 177 - "alerts.test.ts"
Cohesion: 0.15
Nodes (8): HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, computer, observe(), snapshot(), start, sustained(), HOST_ALERT_COOLDOWN_MS

### Community 178 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 179 - "ScheduleNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, ScheduleNotificationService, ScheduleRunNotification

### Community 180 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 181 - "background-task-stop.test.ts"
Cohesion: 0.22
Nodes (13): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot(), started() (+5 more)

### Community 182 - "manager-runtime.ts"
Cohesion: 0.23
Nodes (12): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+4 more)

### Community 184 - "knowledge-store.ts"
Cohesion: 0.14
Nodes (11): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, parseMetadata(), PersistedKnowledgeState (+3 more)

### Community 185 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 186 - "SessionOriginBadge.test.tsx"
Cohesion: 0.24
Nodes (10): SessionProvenance, readScheduleLink(), ScheduleLink, scheduleNotificationLabel(), sessionOriginDescription(), icons, labels, SessionOriginBadge() (+2 more)

### Community 187 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 188 - "registerSessionKnowledgeRoutes"
Cohesion: 0.29
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 189 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 190 - "pending-echo.ts"
Cohesion: 0.24
Nodes (11): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, PendingEchoOwner, prunePendingEchoMap() (+3 more)

### Community 191 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 192 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 193 - "agent-service-event-projection.test.ts"
Cohesion: 0.21
Nodes (10): at(), directories, finish(), launch(), projected(), services, syncSessionTranscript(), terminalService() (+2 more)

### Community 194 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 195 - "response-compression.test.ts"
Cohesion: 0.15
Nodes (11): apps, directories, hookApp(), jsonText(), largeCall, largeCallOutput, largeFile, runtime() (+3 more)

### Community 197 - "shared/skill-settings.ts"
Cohesion: 0.22
Nodes (8): registerSkillSettingsRoutes(), SkillSettingsTarget, SKILL_SETTINGS_CAPABILITY, skillFrontmatterNameSchema, skillNameSchema, skillSettingsSchema, SkillToggle, skillToggleSchema

### Community 198 - "ActivityRow.tsx"
Cohesion: 0.33
Nodes (11): toolCallIdFromActivityId(), activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), compactActivityText(), formatActivityDuration() (+3 more)

### Community 199 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 200 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 201 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 202 - "TranscriptionService"
Cohesion: 0.22
Nodes (5): DelegatedTranscriptionOptions, registerTranscriptionRoutes(), transcriptionMultipartOptions, AudioUpload, TranscriptionService

### Community 203 - "dreamer-routes.ts"
Cohesion: 0.19
Nodes (11): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+3 more)

### Community 204 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 205 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 206 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 207 - "ChatMessage"
Cohesion: 0.21
Nodes (8): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, ChatMessage, ActivityRowProps

### Community 208 - "ActivityRow.test.tsx"
Cohesion: 0.20
Nodes (7): ActivityStatus, ActivityRow, bashDetail(), output, raw, runningDetail(), text()

### Community 209 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 210 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 211 - "manager-proactive-inbox.test.ts"
Cohesion: 0.22
Nodes (6): fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 213 - "tmux-errors.test.ts"
Cohesion: 0.24
Nodes (9): containedServer(), directories, errno(), { execute }, files, links, listener(), places() (+1 more)

### Community 214 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 215 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 216 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 217 - "app-build.test.ts"
Cohesion: 0.27
Nodes (5): apps, directories, AppVersion, parseAppVersion(), HubHealth

### Community 218 - "notification-center.integration.test.ts"
Cohesion: 0.22
Nodes (7): center(), directories, directory(), hub(), now, runtimes, trusted

### Community 219 - ".persist"
Cohesion: 0.24
Nodes (3): SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, stateWithPaths()

### Community 220 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 221 - "history-projection.test.ts"
Cohesion: 0.31
Nodes (7): eventsFor(), groupedEventsFor(), ModelMessage, questionEventsFor(), random(), seedOffset, terminalTypes

### Community 222 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 223 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 224 - "response-compression.ts"
Cohesion: 0.42
Nodes (8): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), varyOnAcceptEncoding()

### Community 225 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 226 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 227 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 228 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 229 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 230 - "manager-proactive-coordinator.test.ts"
Cohesion: 0.29
Nodes (4): directories, fixture(), managed(), ManagerProactiveInboxOptions

### Community 231 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 232 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 233 - "skill-settings-jsonc.ts"
Cohesion: 0.48
Nodes (5): instrument(), document(), parseSkillSettings(), replaceDisabledSkills(), Token

### Community 234 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 235 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 236 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 238 - "refusal-metrics-routes.test.ts"
Cohesion: 0.33
Nodes (4): directories, runtimes, start(), trusted

### Community 239 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 240 - "api-origin.test.ts"
Cohesion: 0.40
Nodes (4): prefixes, session, trusted, untrusted

### Community 241 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 247 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **1484 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1479 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2491 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `buildApp` to `cli-canary.ts`, `service.ts`, `AgentService`, `SessionStore`, `ClaudeAgentService`, `SessionService`, `hub-routes.ts`, `server/skill-settings.ts`, `oracle-voice-config.ts`, `ManagedSession`, `transport.test.ts`, `transcription-service.ts`, `shared/settings-profile.ts`, `ManagerAgent`, `ManagerProactiveInbox`, `oracle-voice-worker.ts`, `ManagerMessage`, `oracle-task-store.ts`, `delegated-transcription-service.ts`, `manager-store.ts`, `KnowledgeStore`, `DreamerService`, `SessionKnowledgeStore`, `ManagerStore`, `alerts.test.ts`, `SchedulerStore`, `ScheduleNotificationService`, `manager-runtime.ts`, `HostTelemetrySampler`, `notification-center.ts`, `schedule-launcher.ts`, `session-knowledge-routes.test.ts`, `shared/skill-settings.ts`, `app.ts`, `oracle-voice-engine.ts`, `dreamer-routes.ts`, `TranscriptionService`, `TranscriptionError`, `server/session-patches.ts`, `app-build.test.ts`, `manager-agent.test.ts`, `SessionOrderStore`, `response-compression.ts`, `PushNotificationService`, `NotificationCenterService`, `ScheduleWorktreeService`, `ManagerStructuredMemoryStore`, `manager-proactive-coordinator.ts`, `SchedulerDispatcher`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `TerminalSessionController`, `ClaudeAgentService`, `agent-service.ts`, `SessionDetail`, `contracts.ts`, `claude-agent-service.ts`, `recovery-resend-durability.test.ts`, `CopilotSessionLike`, `BackgroundTaskSnapshot`, `session-service.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `ClaudeAgentService`, `SessionDetail`, `agent-service.ts`, `hub-routes.ts`, `session-store-providers.test.ts`, `contracts.ts`, `claude-agent-service.ts`, `CopilotSessionLike`, `session-service.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1484 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.024858121101261666 - nodes in this community are weakly interconnected._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.030972719757508954 - nodes in this community are weakly interconnected._
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
