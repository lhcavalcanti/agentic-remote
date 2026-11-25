# Agentic Remote - Graphify code map

Snapshot: `08dc8545103dda5e0f112359a0dac8c6ac47f90b06ffa3c2b0fa4bdd9464f0dc`

Source checkout: `e8870b690d30297cbdea7db1f852b1c726a09c6f`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 662 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 662 files · ~1,179,783 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9267 nodes · 26767 edges · 251 communities (208 shown, 25 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1329 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- workspace-fixtures.ts
- api.ts
- AppWorkspace
- host-telemetry.ts
- notification-classifier.ts
- schedules.ts
- SessionDetail
- SchedulerStore
- AgentService
- ClaudeAgentService
- sessionKey
- contracts.ts
- App.tsx
- terminal-session.ts
- SessionService
- computer-manager.ts
- manager-tools.ts
- app.ts
- ManagedSession
- client.ts
- claude-agent-service.ts
- agent-service.ts
- OracleVoiceCoordinator
- .publish
- sections.tsx
- oracle-voice-soak.ts
- transcription-service.ts
- agentic-remote-promotion-monitor
- dreamer-store.ts
- ManagerStore
- ManagerAgent
- oracle-voice-child.ts
- session-patch-browser.ts
- session-store-providers.test.ts
- hub-routes.ts
- VoiceCapture
- oracle-voice-integration.test.ts
- .sendAdmittedWithBackend
- node-routes.ts
- send-matrix.integration.test.ts
- RemoteNodeClient
- oracle-voice-session.ts
- session-store.ts
- CopilotClientLike
- manager-agent.ts
- dreamer-progress.ts
- oracle-task-store.ts
- manager-structured-memory-validation.ts
- tmux-test-helpers.ts
- background-task-adapter.ts
- tmux-errors.integration.test.ts
- DreamerService
- OracleDreamer.tsx
- oracle-voice.ts
- TmuxTerminalSessionController
- PreviewFeaturesSettings.test.tsx
- fake-voice.ts
- oracle-voice-benchmark.ts
- FakeVoiceEngine
- active-sessions.ts
- ManagerAssistant.tsx
- agentic-remote
- recovery-resend-durability.test.ts
- SessionStatus
- manager-proactive-coordinator.ts
- terminal-session.test.ts
- ComposerActions.tsx
- processes.ts
- normalizeKnowledgeRelativePath
- agentic-remote-gate
- PushNotificationService
- bundle
- agent-service-event-projection.test.ts
- VoicePlayback
- VoiceAudioFrame
- AppSettingsDialog.tsx
- shell.ts
- lib.rs
- oracle-voice-routes.test.ts
- session-launcher.ts
- dependencies
- devDependencies
- ChildVoiceEngine
- dreamer-planner.ts
- client.test.ts
- agentic-remote-promotion-setup
- workspace-browser.ts
- SessionOrderStore
- config.rs
- manager-agent.test.ts
- FakeSessionService
- knowledge-tree.ts
- session-directory.ts
- manager-proactive-inbox.ts
- oracle-voice-child.test.ts
- BackgroundTasksDialog.tsx
- session-response-order.ts
- shared/settings-profile.ts
- manager-context.ts
- oracle-voice-routes.ts
- remote-voice-client.ts
- closed-sessions.ts
- oracle-voice-worker.ts
- manager-structured-memory.ts
- oracle-voice-security.test.ts
- real-voice.ts
- preview-features.ts
- ManagerAttachment
- src/settings-profile.ts
- ManagerAssistant.test.tsx
- SessionKnowledgeStore
- ManagerSnapshot
- agent-service.test.ts
- cli-canary.ts
- ComputerSummary
- scripts
- use-markdown-document.test.tsx
- feature-flags.ts
- oracle-voice-config.ts
- manager-structured-memory-search.ts
- ActivityRow.test.tsx
- SettingsProfileClient
- use-markdown-document.ts
- HostMonitorView.test.tsx
- compilerOptions
- oracle-voice-segments.ts
- ManagerStructuredMemoryStore
- PromptCards.tsx
- EnabledOracleVoiceConfig
- vite.config.ts
- oracle-voice-tickets.ts
- isTerminalComposerFooter
- compilerOptions
- full-gate.test.ts
- refusal-metrics.ts
- session-reply-durability.test.ts
- ActivityDetails.tsx
- terminal-form-deadline.test.ts
- compilerOptions
- ManagerProactiveInbox
- OnlineRecognizer
- markdown-navigation.ts
- pipeline.ts
- MessageTime.tsx
- compilerOptions
- compilerOptions
- RuntimeModelOption
- dreamer-service.ts
- ManagerMemory
- DialogFrame.tsx
- dreamer-schedule.ts
- KnowledgeStore
- promotion-monitor.test.ts
- session-resource-clear.test.ts
- session-knowledge-store.ts
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- session-knowledge-routes.ts
- .correct
- ChatMessage
- knowledge-store.ts
- session-resource-routes.test.ts
- package.json
- VoiceEngineEvent
- registerSessionKnowledgeRoutes
- oracle-voice-assets.test.ts
- SessionAdmissions
- fake-vad.ts
- desktop.json
- LargeSessionService
- session-resource-providers.test.ts
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- .observe
- manager-proactive-inbox.test.ts
- session-scope.ts
- pipeline.test.tsx
- Pcm16Resampler
- copilot-sdk-client.ts
- dreamer-routes.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- DeferredSession
- isRecord
- server/side-question.ts
- use-oracle-attachments.ts
- static-files.ts
- dataset
- generate-pwa-icons.ts
- session-enqueue-clear.test.ts
- bridge.rs
- history-projection.test.ts
- logs-cli.test.ts
- ManagerProactiveInboxValidationError
- manager-structured-memory-performance.test.ts
- promotion-setup-execution.test.ts
- response-compression.ts
- session-knowledge-store.test.ts
- SkillsSettings.tsx
- sent-message.ts
- doctor-cli.test.ts
- release-publication.test.ts
- UserInputFieldControl
- composer-layout.test.ts
- settings.ts
- DocumentViewControls.tsx
- worker-handler.ts
- promotion-setup.test.ts
- FakeRecorder
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- PendingUserInputTracker
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
1. `AppWorkspace()` - 350 edges
2. `SessionDetail` - 327 edges
3. `AgentService` - 318 edges
4. `SessionStore` - 218 edges
5. `ManagedSession` - 181 edges
6. `buildApp()` - 141 edges
7. `ClaudeAgentService` - 133 edges
8. `registerHubRoutes()` - 114 edges
9. `ComputerManager` - 107 edges
10. `ManagerAgent` - 101 edges

## Surprising Connections (you probably didn't know these)
- `make()` --indirect_call--> `reader()`  [INFERRED]
  server/host-telemetry/transport.test.ts → shared/transcript-window.test.ts
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `FakeVoiceState` --references--> `ManagerMessage`  [EXTRACTED]
  e2e/fixtures/fake-voice.ts → shared/manager.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (251 total, 25 thin omitted)

### Community 0 - "workspace-fixtures.ts"
Cohesion: 0.02
Nodes (139): { values }, frame(), geometry, output, scratch, screenshot(), { values }, assertConversation() (+131 more)

### Community 1 - "api.ts"
Cohesion: 0.03
Nodes (159): SettingsChange, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, SubmissionReceipt, submissionReceiptFromError(), activityArgumentFormats (+151 more)

### Community 2 - "AppWorkspace"
Cohesion: 0.03
Nodes (162): terminalSendOptions(), sessionFileValidationError(), AppWorkspace(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applySession(), askAboutKnowledgeFile() (+154 more)

### Community 3 - "host-telemetry.ts"
Cohesion: 0.03
Nodes (116): prefixes, session, trusted, untrusted, BuildAppOptions, bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH (+108 more)

### Community 4 - "notification-classifier.ts"
Cohesion: 0.03
Nodes (98): computer, observe(), snapshot(), start, sustained(), ManagerEventSource, center(), directories (+90 more)

### Community 5 - "schedules.ts"
Cohesion: 0.03
Nodes (130): react, State, stateSchema, timestamp, CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES (+122 more)

### Community 6 - "SessionDetail"
Cohesion: 0.04
Nodes (49): fixture(), fixture(), connect(), createStore(), enqueue(), fixture(), recoveryFixture(), storeAt() (+41 more)

### Community 7 - "SchedulerStore"
Cohesion: 0.05
Nodes (50): enableSchedulerTools(), LaunchPrimitives, provenance(), recordScheduleProvenance(), ScheduleLauncherHost, ScheduleProvenance, scheduleSessionTitle(), SessionScheduleLauncher (+42 more)

### Community 8 - "AgentService"
Cohesion: 0.04
Nodes (6): AgentService, isRuntimeReasoningEffort(), isTerminalNotReadyRefusal(), RuntimeConfigurationError, queuedForPrompt(), isRetainedRefusal()

### Community 9 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (22): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services (+14 more)

### Community 10 - "sessionKey"
Cohesion: 0.03
Nodes (104): closedSessionExpiresAt(), SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, listClosedSessions(), cancelSelectedBackgroundTask(), changeSessionUnread(), deleteClosedSession() (+96 more)

### Community 11 - "contracts.ts"
Cohesion: 0.03
Nodes (75): backgroundTaskSnapshot(), BackgroundTaskTracker, cloneSnapshot(), taskFingerprint(), nextVoiceControl(), Client, apps, directories (+67 more)

### Community 12 - "App.tsx"
Cohesion: 0.03
Nodes (97): hasActiveBackgroundTasks(), hasForegroundTurn(), isManagerEvent(), turnEnded(), SettingsProfileKey, TRANSCRIPT_WINDOW, ActivityRowStates, attachmentId() (+89 more)

### Community 13 - "terminal-session.ts"
Cohesion: 0.05
Nodes (103): terminalComposerUnreadable(), activeBottomFrame(), afterExit(), backgroundShellsAllow(), BackgroundShellsEvidence, busyRowStatus(), captureBeforeDeadline(), captureForReplacement() (+95 more)

### Community 14 - "SessionService"
Cohesion: 0.04
Nodes (14): BackgroundTaskUpdate, updateComputerForLaunchIdentity(), closeReason(), closeVoiceSocket(), nodeVoiceCapabilities(), registerNodeRoutes(), owns(), ProviderSessionService (+6 more)

### Community 15 - "computer-manager.ts"
Cohesion: 0.04
Nodes (62): activityDetailsUnavailable(), activityNotInLog(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), backgroundTaskNotFound(), listedBackgroundTask(), readBackgroundTaskFrom() (+54 more)

### Community 16 - "manager-tools.ts"
Cohesion: 0.04
Nodes (50): DreamerMemoryMetadataRecord, uniqueManagerSessionRefs(), APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier (+42 more)

### Community 17 - "app.ts"
Cohesion: 0.04
Nodes (57): buildApp(), errorStatusCode(), applications, directories, fixture(), releases, scheduledFixture(), session() (+49 more)

### Community 18 - "ManagedSession"
Cohesion: 0.07
Nodes (14): ClientPresence, PRESENCE_TTL_MS, ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier (+6 more)

### Community 19 - "client.ts"
Cohesion: 0.05
Nodes (35): ORACLE_VOICE_CONNECTION_TIMEOUT_MS, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord() (+27 more)

### Community 20 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (65): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+57 more)

### Community 21 - "agent-service.ts"
Cohesion: 0.04
Nodes (87): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+79 more)

### Community 22 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (22): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+14 more)

### Community 23 - ".publish"
Cohesion: 0.06
Nodes (6): agentMode(), foregroundTurnOpen(), isForegroundLifecycleEvent(), removeCopilotSessionFiles(), markGeneratedPrompt(), TranscriptObservation

### Community 24 - "sections.tsx"
Cohesion: 0.05
Nodes (69): AppearanceSetting, activateSession(), getHubHealth(), listDirectories(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession(), shortcutKeys() (+61 more)

### Community 25 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 26 - "transcription-service.ts"
Cohesion: 0.04
Nodes (48): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, headerSafe() (+40 more)

### Community 27 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 28 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (43): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+35 more)

### Community 29 - "ManagerStore"
Cohesion: 0.05
Nodes (26): openStore(), JournalRecorder, sessionTask(), applySessionReplacement(), emptyState(), JournalDraft, JournalEntry, JournalKind (+18 more)

### Community 30 - "ManagerAgent"
Cohesion: 0.08
Nodes (13): checkContent(), delay(), errorMessage(), isNotFound(), isPending(), isQueued(), ManagerAgent, sameRuntime() (+5 more)

### Community 31 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (38): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+30 more)

### Community 32 - "session-patch-browser.ts"
Cohesion: 0.05
Nodes (57): pageFor(), advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading() (+49 more)

### Community 33 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (41): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), QueuedDelivery, terminalRefused() (+33 more)

### Community 34 - "hub-routes.ts"
Cohesion: 0.04
Nodes (60): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+52 more)

### Community 35 - "VoiceCapture"
Cohesion: 0.06
Nodes (23): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), CaptureControl, harness(), validateIdentity() (+15 more)

### Community 36 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (34): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+26 more)

### Community 37 - ".sendAdmittedWithBackend"
Cohesion: 0.06
Nodes (11): isUncertainDelivery(), persistedFormAnswer(), sessionInUseConflictMessage(), sessionInUseQueueMessage(), terminalAnswerRefused(), isTerminalSessionInUseConflict(), isTerminalSessionInUsePrompt(), TerminalSessionController (+3 more)

### Community 38 - "node-routes.ts"
Cohesion: 0.05
Nodes (50): FileUploadError, registerFileUploadRoutes(), SessionParams, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+42 more)

### Community 39 - "send-matrix.integration.test.ts"
Cohesion: 0.04
Nodes (56): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+48 more)

### Community 40 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (16): RemoteResync, RemoteSessionRead, RemoteNodeClient, client(), servers, session, RemoteNodeCapabilityError, RemoteNodeRequestError (+8 more)

### Community 41 - "oracle-voice-session.ts"
Cohesion: 0.07
Nodes (27): apps, directories, playbackSequence(), acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), createVoiceBackendSession() (+19 more)

### Community 42 - "session-store.ts"
Cohesion: 0.04
Nodes (53): deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, idleDaysSchema, mergeSessionRetention() (+45 more)

### Community 43 - "CopilotClientLike"
Cohesion: 0.04
Nodes (37): complete(), event(), sessionWithLog(), start(), CopilotClientLike, directories, fakeClient(), ForkRequest (+29 more)

### Community 44 - "manager-agent.ts"
Cohesion: 0.05
Nodes (41): DreamerProgressView, automaticPayload(), discover(), ManagerAgentOptions, messagePriority(), Rung, TURN_ACTIVITY, MANAGER_SCHEDULER_SYSTEM_PROMPT (+33 more)

### Community 45 - "dreamer-progress.ts"
Cohesion: 0.06
Nodes (22): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+14 more)

### Community 46 - "oracle-task-store.ts"
Cohesion: 0.08
Nodes (39): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+31 more)

### Community 47 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 48 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (48): foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity(), SocketPlace, UnixSocket (+40 more)

### Community 49 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (56): addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo (+48 more)

### Community 50 - "tmux-errors.integration.test.ts"
Cohesion: 0.05
Nodes (34): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+26 more)

### Community 51 - "DreamerService"
Cohesion: 0.11
Nodes (16): boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), safeRunError(), unavailableSnapshot() (+8 more)

### Community 52 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (45): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+37 more)

### Community 53 - "oracle-voice.ts"
Cohesion: 0.08
Nodes (42): VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities, closeServers, exactArrayBuffer(), sockets (+34 more)

### Community 54 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (15): startAgentAfterClear(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand() (+7 more)

### Community 55 - "PreviewFeaturesSettings.test.tsx"
Cohesion: 0.07
Nodes (28): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+20 more)

### Community 56 - "fake-voice.ts"
Cohesion: 0.07
Nodes (10): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance (+2 more)

### Community 57 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 58 - "FakeVoiceEngine"
Cohesion: 0.06
Nodes (19): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceSttEngine, VoiceTtsEngine, VoiceUtteranceAudioFrame (+11 more)

### Community 59 - "active-sessions.ts"
Cohesion: 0.08
Nodes (40): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+32 more)

### Community 60 - "ManagerAssistant.tsx"
Cohesion: 0.07
Nodes (42): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), boundWidth() (+34 more)

### Community 61 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 62 - "recovery-resend-durability.test.ts"
Cohesion: 0.06
Nodes (38): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+30 more)

### Community 63 - "SessionStatus"
Cohesion: 0.09
Nodes (31): backgroundShellsEvidence(), contextChangedInEvents(), createPendingUserInputTracker(), createStatusTracker(), foregroundCompletedSince(), isEmptyResponseNotice(), isForegroundCompletionEvent(), isLiveTask() (+23 more)

### Community 64 - "manager-proactive-coordinator.ts"
Cohesion: 0.09
Nodes (15): DreamerServiceOptions, batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, ProactiveManager (+7 more)

### Community 65 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (37): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, Screens, startCopilot() (+29 more)

### Community 66 - "ComposerActions.tsx"
Cohesion: 0.08
Nodes (21): families, modelFamily, shortModelName(), repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions() (+13 more)

### Community 67 - "processes.ts"
Cohesion: 0.09
Nodes (26): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+18 more)

### Community 68 - "normalizeKnowledgeRelativePath"
Cohesion: 0.08
Nodes (31): SessionKnowledgeBinding, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), getSessionKnowledgeRoot() (+23 more)

### Community 69 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 70 - "PushNotificationService"
Cohesion: 0.10
Nodes (10): start(), NotificationRecorder, HubEventSource, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema (+2 more)

### Community 71 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 72 - "agent-service-event-projection.test.ts"
Cohesion: 0.08
Nodes (33): at(), directories, finish(), launch(), projected(), services, sessionLog(), syncSessionTranscript() (+25 more)

### Community 73 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 74 - "VoiceAudioFrame"
Cohesion: 0.07
Nodes (18): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, QueuedAudio, capabilities, confirm(), control(), defaults (+10 more)

### Community 75 - "AppSettingsDialog.tsx"
Cohesion: 0.10
Nodes (36): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), currentAppViewportGeometry(), activatePwaUpdate(), activePushSubscription() (+28 more)

### Community 76 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 77 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 78 - "oracle-voice-routes.test.ts"
Cohesion: 0.07
Nodes (18): ActiveBackendSession, OracleVoiceManager, OracleVoiceRouteOptions, ObservedLocalVoiceBackend, openApps, openSockets, RouteManager, RouteVoiceBackend (+10 more)

### Community 79 - "session-launcher.ts"
Cohesion: 0.07
Nodes (28): ClaudeSdk, awaitTermination(), LaunchCreations, apps, directories, directory(), runtime(), services (+20 more)

### Community 80 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 81 - "devDependencies"
Cohesion: 0.05
Nodes (39): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+31 more)

### Community 82 - "ChildVoiceEngine"
Cohesion: 0.13
Nodes (8): benchmarkGroup(), ChildVoiceEngine, errorMessage(), matchesCancelled(), matchesSynthesis(), matchesUtterance(), rememberCancellation(), VoiceChildProcess

### Community 83 - "dreamer-planner.ts"
Cohesion: 0.10
Nodes (32): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+24 more)

### Community 84 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 85 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 86 - "workspace-browser.ts"
Cohesion: 0.09
Nodes (26): root, script, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), directories, runtimes (+18 more)

### Community 87 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 88 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 89 - "manager-agent.test.ts"
Cohesion: 0.09
Nodes (19): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+11 more)

### Community 91 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (33): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+25 more)

### Community 92 - "session-directory.ts"
Cohesion: 0.14
Nodes (22): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath() (+14 more)

### Community 93 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (34): assertExactKeys(), cloneState(), DISPOSITIONS, hasExactKeys(), isDisposition(), isEventKind(), isId(), isOrigin() (+26 more)

### Community 94 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 95 - "BackgroundTasksDialog.tsx"
Cohesion: 0.11
Nodes (28): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+20 more)

### Community 96 - "session-response-order.ts"
Cohesion: 0.10
Nodes (29): TRANSCRIPT_CARRIED_LIMIT, applyComputerSnapshot(), checkComputerConnections(), computerAdded(), computerRemoved(), discardUnpairedComputers(), forgetComputerKnowledge(), liftUnpairedTombstones() (+21 more)

### Community 97 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (30): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+22 more)

### Community 98 - "manager-context.ts"
Cohesion: 0.13
Nodes (27): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+19 more)

### Community 99 - "oracle-voice-routes.ts"
Cohesion: 0.13
Nodes (30): sendNodeVoiceOutput(), limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode() (+22 more)

### Community 100 - "remote-voice-client.ts"
Cohesion: 0.15
Nodes (15): VoiceBackendDisconnectCause, VoiceBackendOutput, RemoteNodeRedirectError, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError() (+7 more)

### Community 101 - "closed-sessions.ts"
Cohesion: 0.09
Nodes (18): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, blockParents, CLOSED_SESSION_RETENTION_MS, closedCapitals(), closedSessionContext() (+10 more)

### Community 102 - "oracle-voice-worker.ts"
Cohesion: 0.09
Nodes (23): HostTelemetryClock, VoiceEndUtterance, VoiceStartUtterance, BlockingEngine, capabilityFromConfig(), defaultDependencies(), exactKeys(), isCancelledEvent() (+15 more)

### Community 103 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (27): ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_QUERY_CHARS (+19 more)

### Community 104 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (19): SocketMessage, apps, config, configFixture(), connect(), createManager(), Inbox, issueTicket() (+11 more)

### Community 105 - "real-voice.ts"
Cohesion: 0.11
Nodes (12): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+4 more)

### Community 106 - "preview-features.ts"
Cohesion: 0.16
Nodes (16): SessionProvenance, ClientFeature, railEntries(), readScheduleLink(), ScheduleLink, scheduleNotificationLabel(), PreviewFeaturesContext, usePreviewFeature() (+8 more)

### Community 107 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 108 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (24): isSettingsDeviceId(), isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance (+16 more)

### Community 109 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (16): resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+8 more)

### Community 110 - "SessionKnowledgeStore"
Cohesion: 0.14
Nodes (6): bindingKey(), SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateWithPaths(), UpdateSessionKnowledgeRootInput

### Community 111 - "ManagerSnapshot"
Cohesion: 0.09
Nodes (3): FakeManager, FakeManager, ManagerSnapshot

### Community 112 - "agent-service.test.ts"
Cohesion: 0.13
Nodes (16): terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+8 more)

### Community 113 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 114 - "ComputerSummary"
Cohesion: 0.12
Nodes (5): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation, ComputerSummary

### Community 115 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 116 - "use-markdown-document.test.tsx"
Cohesion: 0.11
Nodes (11): DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), DocumentRenderer, DocumentRendererContext, RendererWorker, synchronousRenderer, FakeWorker (+3 more)

### Community 117 - "feature-flags.ts"
Cohesion: 0.17
Nodes (19): WorkspaceFixtureState, hub(), AppVersion, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue (+11 more)

### Community 118 - "oracle-voice-config.ts"
Cohesion: 0.14
Nodes (22): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+14 more)

### Community 119 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 120 - "ActivityRow.test.tsx"
Cohesion: 0.15
Nodes (18): toolCallIdFromActivityId(), ActivityStatus, activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), compactActivityText() (+10 more)

### Community 121 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 122 - "use-markdown-document.ts"
Cohesion: 0.15
Nodes (20): build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing(), Level (+12 more)

### Community 123 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 124 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 125 - "oracle-voice-segments.ts"
Cohesion: 0.14
Nodes (22): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+14 more)

### Community 126 - "ManagerStructuredMemoryStore"
Cohesion: 0.17
Nodes (7): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryState, ManagerStructuredMemoryStatus

### Community 127 - "PromptCards.tsx"
Cohesion: 0.13
Nodes (16): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+8 more)

### Community 128 - "EnabledOracleVoiceConfig"
Cohesion: 0.11
Nodes (6): voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngineFactory, config, GatedVoiceEngineFactory, VoiceBackendCapability

### Community 129 - "vite.config.ts"
Cohesion: 0.12
Nodes (12): brotliAsync, compress(), gzipAsync, precompressDirectory(), PrecompressedFile, directories, canaryTests, oracleVoiceAssetNames (+4 more)

### Community 130 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 131 - "isTerminalComposerFooter"
Cohesion: 0.13
Nodes (20): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+12 more)

### Community 132 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 133 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 134 - "refusal-metrics.ts"
Cohesion: 0.16
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+7 more)

### Community 135 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 136 - "ActivityDetails.tsx"
Cohesion: 0.20
Nodes (17): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, activityDetailFailure, detailKey(), formatBytes(), keep(), kept, keptActivityDetail(), loadActivityDetail() (+9 more)

### Community 137 - "terminal-form-deadline.test.ts"
Cohesion: 0.12
Nodes (15): TerminalFormContinuation, question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture() (+7 more)

### Community 138 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 139 - "ManagerProactiveInbox"
Cohesion: 0.22
Nodes (4): ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, nowIso(), openInbox()

### Community 140 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 141 - "markdown-navigation.ts"
Cohesion: 0.19
Nodes (18): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+10 more)

### Community 142 - "pipeline.ts"
Cohesion: 0.17
Nodes (19): openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform() (+11 more)

### Community 143 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 144 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 145 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 146 - "RuntimeModelOption"
Cohesion: 0.18
Nodes (13): RuntimeModelOption, getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus() (+5 more)

### Community 147 - "dreamer-service.ts"
Cohesion: 0.20
Nodes (16): DreamerPlanDraft, DreamerFollowUp, DreamerPlannerExecutionInput, DreamerStoreSnapshot, DREAMER_PROGRESS_REFRESH_MS, DreamerPlan, DreamerPlanItemSource, DreamerProgressStatus (+8 more)

### Community 148 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 149 - "DialogFrame.tsx"
Cohesion: 0.18
Nodes (14): changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame(), filterSentMessages() (+6 more)

### Community 150 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 152 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 153 - "session-resource-clear.test.ts"
Cohesion: 0.15
Nodes (13): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+5 more)

### Community 154 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (17): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+9 more)

### Community 155 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 156 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 157 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 158 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 159 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 160 - ".correct"
Cohesion: 0.27
Nodes (6): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput

### Community 161 - "ChatMessage"
Cohesion: 0.15
Nodes (11): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, ChatMessage, TranscriptWindow (+3 more)

### Community 162 - "knowledge-store.ts"
Cohesion: 0.14
Nodes (11): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, parseMetadata(), PersistedKnowledgeState (+3 more)

### Community 163 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 164 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 165 - "VoiceEngineEvent"
Cohesion: 0.18
Nodes (7): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, VoiceEngineEvent

### Community 166 - "registerSessionKnowledgeRoutes"
Cohesion: 0.29
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 167 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 168 - "SessionAdmissions"
Cohesion: 0.17
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 169 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 170 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 172 - "session-resource-providers.test.ts"
Cohesion: 0.22
Nodes (13): claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures (+5 more)

### Community 173 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 174 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 175 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 176 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 177 - ".observe"
Cohesion: 0.21
Nodes (7): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId()

### Community 178 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 179 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 180 - "pipeline.test.tsx"
Cohesion: 0.22
Nodes (9): documentJsx(), components, drawn(), drawnPage(), fixtures, html(), today(), wholePage() (+1 more)

### Community 181 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 182 - "copilot-sdk-client.ts"
Cohesion: 0.29
Nodes (9): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkMissingSessionRetirement, CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic() (+1 more)

### Community 183 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 184 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 185 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 187 - "isRecord"
Cohesion: 0.29
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 188 - "server/side-question.ts"
Cohesion: 0.27
Nodes (8): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), sideQuestionPrompt(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH, SIDE_QUESTION_EARLIER_LIMIT, SIDE_QUESTION_MAX_LENGTH

### Community 189 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 190 - "static-files.ts"
Cohesion: 0.27
Nodes (6): RFC-9110, AcceptedEncodings, FILE_HEADERS, isApiPath(), isAppleTouchIconProbe(), registerStaticFiles()

### Community 191 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 192 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 193 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 194 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 195 - "history-projection.test.ts"
Cohesion: 0.31
Nodes (7): eventsFor(), groupedEventsFor(), ModelMessage, questionEventsFor(), random(), seedOffset, terminalTypes

### Community 196 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 197 - "ManagerProactiveInboxValidationError"
Cohesion: 0.28
Nodes (6): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions()

### Community 198 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.31
Nodes (6): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemorySearchResult, submitSearch()

### Community 199 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 200 - "response-compression.ts"
Cohesion: 0.42
Nodes (8): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), varyOnAcceptEncoding()

### Community 201 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 202 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 203 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 204 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 205 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 206 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 207 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 208 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 209 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 210 - "worker-handler.ts"
Cohesion: 0.47
Nodes (4): render, scope, handleRenderRequest(), RenderRequest

### Community 211 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1475 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1470 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2477 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `session-store-providers.test.ts`, `hub-routes.ts`, `.sendAdmittedWithBackend`, `SessionDetail`, `ClaudeAgentService`, `CopilotClientLike`, `computer-manager.ts`, `background-task-adapter.ts`, `claude-agent-service.ts`, `agent-service.ts`, `.publish`, `session-directory.ts`, `recovery-resend-durability.test.ts`, `SessionStatus`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `ManagerToolHost` connect `manager-tools.ts` to `ManagerMemory`, `SchedulerStore`, `ManagerStructuredMemoryStore`, `manager-agent.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `hub-routes.ts`, `RemoteNodeClient`, `contracts.ts`, `session-launcher.ts`, `computer-manager.ts`, `ManagedSession`, `claude-agent-service.ts`, `session-resource-clear.test.ts`, `session-directory.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1475 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `workspace-fixtures.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.017376231344861118 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.025896887621762888 - nodes in this community are weakly interconnected._
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
