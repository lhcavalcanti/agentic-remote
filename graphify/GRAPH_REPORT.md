# Agentic Remote - Graphify code map

Snapshot: `fd656a3ffce0d7eba9d70156ecc7ca43d25c10fe64cf74ed8bf315763d88bad3`

Source checkout: `65ca0381c16d55fbdc1e0f59451380850391fe62`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 653 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 653 files · ~1,168,754 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9171 nodes · 26487 edges · 265 communities (217 shown, 30 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1342 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionDetail
- api.ts
- AppWorkspace
- session-store.ts
- contracts.ts
- terminal-session.ts
- App.tsx
- session-presentation.ts
- agent-service.test.ts
- remote-node-client.ts
- agent-service.ts
- ManagerStore
- sections.tsx
- manager-tools.ts
- computer-manager.ts
- FakeVoiceEngine
- ManagedSession
- oracle-voice-soak.ts
- oracle-voice-integration.test.ts
- oracle-voice-child.ts
- agentic-remote-promotion-monitor
- ManagerAgent
- app.ts
- dreamer-store.ts
- terminal-session.test.ts
- setupWorkspaceFixture
- notification-classifier.ts
- oracle-voice-worker.ts
- SessionService
- transcription-service.ts
- session-reply-durability.test.ts
- tmux-errors.integration.test.ts
- manager-agent.ts
- notification-center.ts
- dreamer-progress.ts
- oracle-task-store.ts
- ProviderSessionService
- TmuxTerminalSessionController
- manager-structured-memory-validation.ts
- tmux-test-helpers.ts
- manager-proactive-coordinator.ts
- normalizeKnowledgeRelativePath
- node-routes.ts
- DreamerService
- session-directory.ts
- background-task-adapter.ts
- OracleDreamer.tsx
- SchedulerStore
- pipeline.ts
- workspace-fixtures.ts
- sampler.ts
- oracle-voice.ts
- oracle-voice-benchmark.ts
- CopilotClientLike
- queued-dispatch.test.ts
- fake-voice.ts
- oracle-voice-session.ts
- ScheduleRun
- agentic-remote
- ui-scenes.ts
- recovery-resend-durability.test.ts
- manager-agent.test.ts
- server/skill-settings.ts
- processes.ts
- composer-state.ts
- agentic-remote-gate
- hub-routes.ts
- OracleVoiceClient
- bundle
- oracle-voice-routes.ts
- ManagerAssistant.tsx
- PushNotificationService
- active-sessions.ts
- schedule-recurrence.ts
- ScheduleForm.tsx
- VoicePlayback
- shell.ts
- lib.rs
- shared/settings-profile.ts
- dependencies
- dreamer-planner.ts
- terminal-startup-queue.test.ts
- VoiceCapture
- client.test.ts
- agentic-remote-promotion-setup
- manager-context.ts
- manager-proactive-inbox.ts
- manager-structured-memory.ts
- SessionOrderStore
- devDependencies
- config.rs
- react
- FakeSessionService
- pipeline.test.tsx
- oracle-voice-security.test.ts
- ManagerEvent
- src/settings-profile.ts
- oracle-voice-routes.test.ts
- scheduler-store.ts
- BackgroundTasksDialog.tsx
- schedule-proposals.ts
- session-resource-clear.test.ts
- OracleVoiceCoordinator
- oracle-voice-child.test.ts
- oracle-voice-segments.ts
- remote-voice-client.ts
- real-voice.ts
- pwa.ts
- ManagerClientDefaults
- ChatMessage
- manager-structured-memory-search.ts
- ManagerAssistant.test.tsx
- SettingsProfileSnapshot
- SessionKnowledgeStore
- preview-features.ts
- capture-workspace.ts
- cli-canary.ts
- service.ts
- startup-phases.test.ts
- scripts
- check-workspace-review-regressions.ts
- session-patch-browser.ts
- feature-flags.ts
- ActivityRow.test.tsx
- SettingsProfileClient
- HostMonitorView.test.tsx
- ComputerSummary
- ManagerProactiveInbox
- ManagerStructuredMemoryStore
- ManagerAttachment
- oracle-voice-coordinator.test.ts
- compilerOptions
- closed-sessions.ts
- oracle-voice-config.ts
- remote.ts
- oracle-voice-coordinator.ts
- PromptCards.tsx
- transport.test.ts
- oracle-voice-tickets.ts
- session-store-providers.test.ts
- host-telemetry.ts
- markdown-navigation.ts
- compilerOptions
- full-gate.test.ts
- knowledge-tree.ts
- compilerOptions
- background-task-stop.test.ts
- schedule-notification-service.test.ts
- OnlineRecognizer
- isTerminalComposerFooter
- MessageTime.tsx
- compilerOptions
- compilerOptions
- dreamer-service.ts
- oracle-status.test.ts
- ManagerMemory
- ActivityDetails.tsx
- client.ts
- dreamer-schedule.ts
- KnowledgeStore
- SessionStatus
- promotion-monitor.test.ts
- session-knowledge-store.ts
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- session-latency-benchmark.ts
- session-knowledge-routes.ts
- capture-workbench-review.ts
- terminal-form-deadline.test.ts
- HostTelemetrySampler
- knowledge-store.ts
- .confirmSpeech
- server/session-patches.ts
- session-resource-routes.test.ts
- FakeManager
- package.json
- projection-test-helpers.ts
- registerSessionKnowledgeRoutes
- oracle-voice-assets.test.ts
- VoiceTurnState
- RuntimeStatus.tsx
- use-oracle-attachments.ts
- fake-vad.ts
- desktop.json
- DeferredSession
- LargeSessionService
- theme-contrast.test.ts
- PreviewFeaturesSettings.test.tsx
- .oxlintrc.json
- settings-local.json
- isRecord
- session-scope.ts
- Pcm16Resampler
- BackgroundTask
- dreamer-routes.ts
- ManagerProactiveInboxValidationError
- manager-proactive-inbox.test.ts
- manager-structured-memory-performance.test.ts
- DialogFrame.tsx
- html-preview.ts
- sign-in-expired.pw.ts
- ManagerStructuredMemoryRuntime
- SessionAdmissions
- tmux-errors.test.ts
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- bridge.rs
- vite.config.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- session-knowledge-store.test.ts
- sent-message.ts
- VoiceVadOptions
- doctor-cli.test.ts
- release-publication.test.ts
- UserInputFieldControl
- OracleVoicePlayback
- composer-layout.test.ts
- settings.ts
- DocumentViewControls.tsx
- HostTelemetryClock
- recovery-context.ts
- usePanelWidth
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- FakeRecorder
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
1. `AppWorkspace()` - 355 edges
2. `SessionDetail` - 345 edges
3. `AgentService` - 325 edges
4. `SessionStore` - 218 edges
5. `ManagedSession` - 184 edges
6. `buildApp()` - 141 edges
7. `ClaudeAgentService` - 136 edges
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

## Communities (265 total, 30 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (17): agentMode(), AgentService, commandShortcut(), isTerminalNotReadyRefusal(), lifecycleRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, sessionInUseConflictMessage() (+9 more)

### Community 1 - "SessionDetail"
Cohesion: 0.03
Nodes (34): storage(), ClaudeAgentService, isMissingClaudeSessionError(), claudeOwner(), errorMessage(), ownsDispatchRecovery(), preflight(), preparePrompt() (+26 more)

### Community 2 - "api.ts"
Cohesion: 0.02
Nodes (163): httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionReceipt, submissionReceiptFromError(), activityArgumentFormats, activityDetailStatuses, activityKinds (+155 more)

### Community 3 - "AppWorkspace"
Cohesion: 0.02
Nodes (187): isManagerEvent(), terminalSendOptions(), askSession(), closeSession(), deleteSession(), getSession(), listKnowledgeEntries(), readKnowledgeFile() (+179 more)

### Community 4 - "session-store.ts"
Cohesion: 0.02
Nodes (106): root, script, ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services (+98 more)

### Community 5 - "contracts.ts"
Cohesion: 0.03
Nodes (82): WorkspaceFixtureOptions, activityDetailsUnavailable(), activityNotInLog(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), ClaudeAgentServiceEvents, LaunchCreations (+74 more)

### Community 6 - "terminal-session.ts"
Cohesion: 0.04
Nodes (109): terminalComposerUnreadable(), activeBottomFrame(), afterExit(), backgroundShellsAllow(), BackgroundShellsEvidence, busyRowStatus(), captureBeforeDeadline(), captureForReplacement() (+101 more)

### Community 7 - "App.tsx"
Cohesion: 0.03
Nodes (95): extension(), MAX_SESSION_FILE_BYTES, sessionFileValidationError(), supportedExtensions, supportsSessionFile(), SettingsChange, SettingsProfileKey, SettingsProfileValues (+87 more)

### Community 8 - "session-presentation.ts"
Cohesion: 0.03
Nodes (88): hasActiveBackgroundTasks(), hasForegroundTurn(), hasRunningBackgroundAgent(), CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), saveSessionOrderLane(), handleDragEnd(), SessionResourcesDialog() (+80 more)

### Community 9 - "agent-service.test.ts"
Cohesion: 0.04
Nodes (57): contextChangedInEvents(), CopilotSessionLike, createPendingUserInputTracker(), createStatusTracker(), at(), directories, finish(), launch() (+49 more)

### Community 10 - "remote-node-client.ts"
Cohesion: 0.03
Nodes (49): RemoteResync, RemoteSessionRead, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, DEFINITE_DISPATCH_REFUSALS, headerSafe(), REDIRECT_STATUSES, RemoteNodeClient (+41 more)

### Community 11 - "agent-service.ts"
Cohesion: 0.03
Nodes (94): complete(), event(), sessionWithLog(), start(), AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents() (+86 more)

### Community 12 - "ManagerStore"
Cohesion: 0.04
Nodes (44): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+36 more)

### Community 13 - "sections.tsx"
Cohesion: 0.04
Nodes (82): RuntimeModelOption, AppearanceSetting, DEFAULT_SESSION_PROVIDER, NewSessionBackendSetting, activateSession(), createSession(), getHubHealth(), getManager() (+74 more)

### Community 14 - "manager-tools.ts"
Cohesion: 0.04
Nodes (52): DreamerMemoryMetadataRecord, APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools() (+44 more)

### Community 15 - "computer-manager.ts"
Cohesion: 0.06
Nodes (70): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+62 more)

### Community 16 - "FakeVoiceEngine"
Cohesion: 0.04
Nodes (40): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, apps, directories (+32 more)

### Community 17 - "ManagedSession"
Cohesion: 0.08
Nodes (14): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, normalizeNodeUrl(), SessionLauncherOptions (+6 more)

### Community 18 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (36): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+28 more)

### Community 19 - "oracle-voice-integration.test.ts"
Cohesion: 0.03
Nodes (45): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+37 more)

### Community 20 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (42): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+34 more)

### Community 21 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 22 - "ManagerAgent"
Cohesion: 0.07
Nodes (14): FakeVoiceState, checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+6 more)

### Community 23 - "app.ts"
Cohesion: 0.04
Nodes (54): buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), directories, runtimes (+46 more)

### Community 24 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (43): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+35 more)

### Community 25 - "terminal-session.test.ts"
Cohesion: 0.04
Nodes (63): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+55 more)

### Community 26 - "setupWorkspaceFixture"
Cohesion: 0.04
Nodes (35): desktop, devices, long, open(), phone, veryLong, bounds(), closedEarlier (+27 more)

### Community 27 - "notification-classifier.ts"
Cohesion: 0.06
Nodes (40): ComputerManagerEvents, HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, computer, observe(), snapshot(), start, sustained() (+32 more)

### Community 28 - "oracle-voice-worker.ts"
Cohesion: 0.06
Nodes (28): benchmarkGroup(), VoiceSttEngine, VoiceTtsEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, defaultDependencies() (+20 more)

### Community 29 - "SessionService"
Cohesion: 0.05
Nodes (17): closeReason(), closeVoiceSocket(), registerNodeRoutes(), apps, directories, hookApp(), jsonText(), largeCall (+9 more)

### Community 30 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 31 - "session-reply-durability.test.ts"
Cohesion: 0.06
Nodes (29): isUncertainDelivery(), PendingUserInputTracker, persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), answer(), assistantFixture(), claudeFixture() (+21 more)

### Community 32 - "tmux-errors.integration.test.ts"
Cohesion: 0.04
Nodes (39): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+31 more)

### Community 33 - "manager-agent.ts"
Cohesion: 0.05
Nodes (40): automaticPayload(), discover(), isPending(), isQueued(), messagePriority(), Rung, TURN_ACTIVITY, confirmationSchema (+32 more)

### Community 34 - "notification-center.ts"
Cohesion: 0.06
Nodes (38): booleanQuery, filters, params, cursorSchema, durableState(), emptyState(), identity, kind (+30 more)

### Community 35 - "dreamer-progress.ts"
Cohesion: 0.06
Nodes (22): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+14 more)

### Community 36 - "oracle-task-store.ts"
Cohesion: 0.08
Nodes (39): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+31 more)

### Community 37 - "ProviderSessionService"
Cohesion: 0.06
Nodes (3): updateComputerForLaunchIdentity(), owns(), ProviderSessionService

### Community 38 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (16): startAgentAfterClear(), composer(), processAdapter, awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions() (+8 more)

### Community 39 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 40 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (48): foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity(), SocketPlace, UnixSocket (+40 more)

### Community 41 - "manager-proactive-coordinator.ts"
Cohesion: 0.07
Nodes (16): DreamerServiceOptions, batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ProactiveManager, SessionLifecycle (+8 more)

### Community 42 - "normalizeKnowledgeRelativePath"
Cohesion: 0.07
Nodes (42): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), SessionKnowledgeBinding, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+34 more)

### Community 43 - "node-routes.ts"
Cohesion: 0.07
Nodes (40): configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, knowledgeFileQuerySchema, knowledgeQuerySchema (+32 more)

### Community 44 - "DreamerService"
Cohesion: 0.11
Nodes (16): boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), safeRunError(), unavailableSnapshot() (+8 more)

### Community 45 - "session-directory.ts"
Cohesion: 0.09
Nodes (38): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath() (+30 more)

### Community 46 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (54): addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, copyTask() (+46 more)

### Community 47 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (45): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+37 more)

### Community 48 - "SchedulerStore"
Cohesion: 0.11
Nodes (10): enableSchedulerTools(), fixture(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, retainedHistory(), ScheduleProposal (+2 more)

### Community 49 - "pipeline.ts"
Cohesion: 0.07
Nodes (36): openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), render, scope, documentOpening(), documentParts() (+28 more)

### Community 50 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (47): oracleHostStatusFixture(), CONTEXT_EXAMPLE, documents, fixtureArguments(), fixtureComputers, fixtureEndpoints, fixtureHostHistory, fixtureHostProcesses (+39 more)

### Community 51 - "sampler.ts"
Cohesion: 0.08
Nodes (45): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+37 more)

### Community 52 - "oracle-voice.ts"
Cohesion: 0.08
Nodes (41): VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities, closeServers, exactArrayBuffer(), sockets (+33 more)

### Community 53 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (41): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 54 - "CopilotClientLike"
Cohesion: 0.04
Nodes (32): CopilotClientLike, at(), Catalog, deferred(), fixture(), fixtures, listed(), releases (+24 more)

### Community 55 - "queued-dispatch.test.ts"
Cohesion: 0.06
Nodes (26): acceptanceReceipt(), explicitlyRefused(), hasUncertainDelivery(), QueuedDelivery, terminalRefused(), accept(), deferred(), disk (+18 more)

### Community 56 - "fake-voice.ts"
Cohesion: 0.07
Nodes (10): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, installFakeBrowserVoice(), ScriptedUtterance, startFixtureServer() (+2 more)

### Community 57 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (17): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), QueuedOutput (+9 more)

### Community 58 - "ScheduleRun"
Cohesion: 0.14
Nodes (10): provenance(), SessionScheduleLauncher, ScheduleLauncher, ScheduleLaunchRefusedError, SchedulerDispatcher, ScheduleReconciliation, registerSchedulerRoutes(), holdsSlot() (+2 more)

### Community 59 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 60 - "ui-scenes.ts"
Cohesion: 0.07
Nodes (31): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+23 more)

### Community 61 - "recovery-resend-durability.test.ts"
Cohesion: 0.06
Nodes (32): fixture(), holdProbe(), fixtures, gate(), releases, restart(), sdkPermissionEvents(), sdkRecoveryEvents() (+24 more)

### Community 62 - "manager-agent.test.ts"
Cohesion: 0.07
Nodes (21): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+13 more)

### Community 63 - "server/skill-settings.ts"
Cohesion: 0.09
Nodes (29): instrument(), builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills() (+21 more)

### Community 64 - "processes.ts"
Cohesion: 0.09
Nodes (27): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+19 more)

### Community 65 - "composer-state.ts"
Cohesion: 0.10
Nodes (41): composerChanged(), composerPasted(), focusComposer(), insertComposerNewline(), persistComposerDrafts(), composerReadFailureMessage(), readComposerDrafts(), readLegacyComposerDrafts() (+33 more)

### Community 66 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 67 - "hub-routes.ts"
Cohesion: 0.06
Nodes (42): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+34 more)

### Community 68 - "OracleVoiceClient"
Cohesion: 0.15
Nodes (7): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, playbackClientError(), terminalCloseCode()

### Community 69 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 70 - "oracle-voice-routes.ts"
Cohesion: 0.09
Nodes (34): nodeVoiceCapabilities(), sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes() (+26 more)

### Community 71 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (36): editQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), sendManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), canTakeFocus() (+28 more)

### Community 72 - "PushNotificationService"
Cohesion: 0.11
Nodes (9): start(), HubEventSource, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema (+1 more)

### Community 73 - "active-sessions.ts"
Cohesion: 0.10
Nodes (33): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+25 more)

### Community 74 - "schedule-recurrence.ts"
Cohesion: 0.10
Nodes (37): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+29 more)

### Community 75 - "ScheduleForm.tsx"
Cohesion: 0.11
Nodes (30): CLAUDE_SCHEDULE_UNAVAILABLE_REASON, scheduleProviderUnavailableReason(), ScheduleTarget, FeatureEvent, listeners, subscribeFeatureEvents(), FolderPicker(), browse() (+22 more)

### Community 76 - "VoicePlayback"
Cohesion: 0.10
Nodes (11): pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio(), validateGeneration() (+3 more)

### Community 77 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 78 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 79 - "shared/settings-profile.ts"
Cohesion: 0.08
Nodes (35): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+27 more)

### Community 80 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 81 - "dreamer-planner.ts"
Cohesion: 0.10
Nodes (32): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+24 more)

### Community 82 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (29): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+21 more)

### Community 83 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 84 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 85 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 86 - "manager-context.ts"
Cohesion: 0.11
Nodes (31): DreamerProgressEntry, DreamerProgressView, ManagerAgentOptions, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines() (+23 more)

### Community 87 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, eventId(), hasExactKeys(), isDisposition(), isEventKind() (+29 more)

### Community 88 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (31): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+23 more)

### Community 89 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 90 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 91 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 92 - "react"
Cohesion: 0.10
Nodes (16): react, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions(), ContextRing(), QueuedPromptList(), SendControl() (+8 more)

### Community 94 - "pipeline.test.tsx"
Cohesion: 0.11
Nodes (27): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+19 more)

### Community 95 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (22): FakeVoiceEngineCall, VoiceStartUtterance, SocketMessage, apps, BlockingEngine, config, configFixture(), connect() (+14 more)

### Community 96 - "ManagerEvent"
Cohesion: 0.10
Nodes (22): ManagerEventSource, brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030 (+14 more)

### Community 97 - "src/settings-profile.ts"
Cohesion: 0.08
Nodes (23): NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey, CachedProfile (+15 more)

### Community 98 - "oracle-voice-routes.test.ts"
Cohesion: 0.08
Nodes (16): ActiveBackendSession, exactArrayBuffer(), rawDataBuffer(), receiveNodeVoiceMessage(), ObservedLocalVoiceBackend, openApps, openSockets, RouteManager (+8 more)

### Community 99 - "scheduler-store.ts"
Cohesion: 0.09
Nodes (22): headers, hub(), sender, NoopScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS, SchedulerDispatcherOptions (+14 more)

### Community 100 - "BackgroundTasksDialog.tsx"
Cohesion: 0.12
Nodes (26): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+18 more)

### Community 101 - "schedule-proposals.ts"
Cohesion: 0.12
Nodes (30): action, create, existing, metadata, ScheduleProposalInput, scheduleProposalInputSchema, ScheduleProposalsChanged, scheduleProposalSchema (+22 more)

### Community 102 - "session-resource-clear.test.ts"
Cohesion: 0.08
Nodes (26): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+18 more)

### Community 104 - "oracle-voice-child.test.ts"
Cohesion: 0.09
Nodes (12): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+4 more)

### Community 105 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 106 - "remote-voice-client.ts"
Cohesion: 0.16
Nodes (14): VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+6 more)

### Community 107 - "real-voice.ts"
Cohesion: 0.11
Nodes (13): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+5 more)

### Community 108 - "pwa.ts"
Cohesion: 0.12
Nodes (28): parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), App(), applyPwaUpdate(), activatePwaUpdate(), activePushSubscription() (+20 more)

### Community 109 - "ManagerClientDefaults"
Cohesion: 0.12
Nodes (15): ManagerClientDefaults, VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState (+7 more)

### Community 110 - "ChatMessage"
Cohesion: 0.11
Nodes (14): Connection, TranscriptBuilder, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset, StoredSession (+6 more)

### Community 111 - "manager-structured-memory-search.ts"
Cohesion: 0.12
Nodes (24): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+16 more)

### Community 112 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (16): cancelManager(), removeQueuedManagerMessage(), retryManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+8 more)

### Community 113 - "SettingsProfileSnapshot"
Cohesion: 0.13
Nodes (17): WorkspaceFixtureState, directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore (+9 more)

### Community 114 - "SessionKnowledgeStore"
Cohesion: 0.14
Nodes (6): bindingKey(), SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateWithPaths(), UpdateSessionKnowledgeRootInput

### Community 115 - "preview-features.ts"
Cohesion: 0.17
Nodes (14): ClientFeature, railEntries(), readScheduleLink(), ScheduleLink, scheduleNotificationLabel(), PreviewFeaturesContext, usePreviewFeature(), usePreviewFeatures() (+6 more)

### Community 116 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 117 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 118 - "service.ts"
Cohesion: 0.13
Nodes (11): HostRequest, HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError(), HostTelemetryService, HostTelemetryTarget, HOST_TELEMETRY_INVALID_CODE, HostMinuteAggregate (+3 more)

### Community 119 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (16): phases, port, app(), directories, headers, launcher, createStartupPhases(), startManagedServer() (+8 more)

### Community 120 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 121 - "check-workspace-review-regressions.ts"
Cohesion: 0.08
Nodes (13): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+5 more)

### Community 122 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (24): advance(), connections, content(), FrameMeasurement, lastHeading(), message(), open(), percentile() (+16 more)

### Community 123 - "feature-flags.ts"
Cohesion: 0.17
Nodes (19): hub(), AppVersion, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable() (+11 more)

### Community 124 - "ActivityRow.test.tsx"
Cohesion: 0.15
Nodes (18): toolCallIdFromActivityId(), ActivityStatus, activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), compactActivityText() (+10 more)

### Community 125 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 126 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 127 - "ComputerSummary"
Cohesion: 0.13
Nodes (3): ManagerHub, ManagerProactiveCoordinatorOptions, ComputerSummary

### Community 128 - "ManagerProactiveInbox"
Cohesion: 0.18
Nodes (7): ManagerProactiveInbox, ManagerProactiveInboxCapacityError, ManagerProactiveInboxPersistenceError, nowIso(), publicEvent(), openInbox(), validateLimit()

### Community 129 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (5): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState

### Community 130 - "ManagerAttachment"
Cohesion: 0.17
Nodes (14): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+6 more)

### Community 131 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.11
Nodes (12): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+4 more)

### Community 132 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 133 - "closed-sessions.ts"
Cohesion: 0.12
Nodes (10): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS, closedSessionContext(), excerpt(), isClosedSessionContext() (+2 more)

### Community 134 - "oracle-voice-config.ts"
Cohesion: 0.16
Nodes (19): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+11 more)

### Community 135 - "remote.ts"
Cohesion: 0.13
Nodes (13): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, registerHostTelemetryRoutes() (+5 more)

### Community 136 - "oracle-voice-coordinator.ts"
Cohesion: 0.10
Nodes (15): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnection (+7 more)

### Community 137 - "PromptCards.tsx"
Cohesion: 0.13
Nodes (16): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+8 more)

### Community 138 - "transport.test.ts"
Cohesion: 0.10
Nodes (13): prefixes, session, trusted, untrusted, readingFixture(), empty, inventory, listen() (+5 more)

### Community 139 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 140 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+3 more)

### Community 141 - "host-telemetry.ts"
Cohesion: 0.13
Nodes (19): aggregate, DiskSpaceSchema, HOST_TELEMETRY_CAPABILITY_VERSION, HOST_TELEMETRY_INVALID_CLOSE_CODE, HostHistorySchema, HostInfoSchema, HostMetricAggregate, HostMetricAggregateSchema (+11 more)

### Community 142 - "markdown-navigation.ts"
Cohesion: 0.17
Nodes (20): MarkdownImage(), BreadcrumbSegment, breadcrumbSegments(), DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource() (+12 more)

### Community 143 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 144 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 145 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 146 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 147 - "background-task-stop.test.ts"
Cohesion: 0.17
Nodes (15): BackgroundTaskProjector, backgroundTasksFromEvents(), completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell() (+7 more)

### Community 148 - "schedule-notification-service.test.ts"
Cohesion: 0.18
Nodes (6): ScheduleNotificationService, input(), now, run(), ScheduleRunNotification, SchedulerChanged

### Community 149 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 150 - "isTerminalComposerFooter"
Cohesion: 0.15
Nodes (18): boxedComposerFrame(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock(), flatComposerFrame() (+10 more)

### Community 151 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 152 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 153 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 154 - "dreamer-service.ts"
Cohesion: 0.20
Nodes (16): DreamerPlanDraft, DreamerFollowUp, DreamerPlannerExecutionInput, DreamerStoreSnapshot, DREAMER_PROGRESS_REFRESH_MS, DreamerPlan, DreamerPlanItemSource, DreamerProgressStatus (+8 more)

### Community 155 - "oracle-status.test.ts"
Cohesion: 0.18
Nodes (15): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+7 more)

### Community 156 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 157 - "ActivityDetails.tsx"
Cohesion: 0.22
Nodes (16): activityDetailFailure, detailKey(), formatBytes(), keep(), kept, keptActivityDetail(), loadActivityDetail(), peekActivityDetail() (+8 more)

### Community 158 - "client.ts"
Cohesion: 0.14
Nodes (13): closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, parseHello(), PendingHello (+5 more)

### Community 159 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 161 - "SessionStatus"
Cohesion: 0.15
Nodes (13): Seen, ManagerProactiveInboxObservation, PersistedCursor, NotificationCursor, Row, SdkRestartRecovery, FinishedSession, SessionUnreadTracker (+5 more)

### Community 162 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 163 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (17): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+9 more)

### Community 164 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 165 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 166 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 167 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 168 - "session-latency-benchmark.ts"
Cohesion: 0.21
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 169 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 170 - "capture-workbench-review.ts"
Cohesion: 0.13
Nodes (12): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, fixtureSessions (+4 more)

### Community 171 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 173 - "knowledge-store.ts"
Cohesion: 0.14
Nodes (11): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, parseMetadata(), PersistedKnowledgeState (+3 more)

### Community 175 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 176 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 178 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 179 - "projection-test-helpers.ts"
Cohesion: 0.17
Nodes (11): sessionLog(), BackgroundTaskEventOptions, MAX_BACKGROUND_TASKS, MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH, lifecycleEvent(), subagentShell(), syntheticLog() (+3 more)

### Community 180 - "registerSessionKnowledgeRoutes"
Cohesion: 0.29
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 181 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 183 - "RuntimeStatus.tsx"
Cohesion: 0.27
Nodes (8): families, modelFamily, repositoryModels, RuntimeStatus(), session, glyphs, ModelFamilyIcon(), RuntimeModelName()

### Community 184 - "use-oracle-attachments.ts"
Cohesion: 0.26
Nodes (13): uploadManagerFile(), attachmentSize(), OracleAttachmentChips(), OracleMessageAttachments(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments() (+5 more)

### Community 185 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 186 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 187 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 189 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 190 - "PreviewFeaturesSettings.test.tsx"
Cohesion: 0.22
Nodes (6): applySettingsChanges(), clients, EffectiveState(), hub(), SchedulerDraft(), FakeHub

### Community 191 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 192 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 193 - "isRecord"
Cohesion: 0.24
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 194 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 195 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 196 - "BackgroundTask"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 197 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 198 - "ManagerProactiveInboxValidationError"
Cohesion: 0.20
Nodes (7): emptyState(), ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, ManagerProactiveInboxValidationError, requireId(), validateOptions()

### Community 199 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 200 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.23
Nodes (7): benchmarkState(), now(), openFixture(), searchSamples(), isMissing(), ManagerStructuredMemoryRecoveryError, open()

### Community 201 - "DialogFrame.tsx"
Cohesion: 0.30
Nodes (9): changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame(), subscribeHubSignIn() (+1 more)

### Community 202 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 203 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 204 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.24
Nodes (4): initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, ManagerStructuredMemoryMode, ManagerStructuredMemoryStatus

### Community 206 - "tmux-errors.test.ts"
Cohesion: 0.24
Nodes (9): containedServer(), directories, errno(), { execute }, files, links, listener(), places() (+1 more)

### Community 207 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 208 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 209 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 210 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 211 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 212 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 213 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 214 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 215 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 217 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 218 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 219 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 221 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 222 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 223 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 225 - "recovery-context.ts"
Cohesion: 0.47
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 226 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 227 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 228 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1460 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1455 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2452 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `contracts.ts`, `agent-service.test.ts`, `agent-service.ts`, `session-directory.ts`, `computer-manager.ts`, `CopilotClientLike`, `queued-dispatch.test.ts`, `recovery-resend-durability.test.ts`, `session-reply-durability.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `start()` connect `manager-agent.test.ts` to `ManagerStore`, `ManagerAgent`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ManagerAgent` connect `ManagerAgent` to `contracts.ts`, `ManagerStructuredMemoryRuntime`, `ManagerStore`, `manager-tools.ts`, `FakeVoiceEngine`, `manager-context.ts`, `ComputerSummary`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `AppWorkspace()` (e.g. with `drawerIsOverlay()` and `prefersLightNow()`) actually correct?**
  _`AppWorkspace()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1460 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.029271796713657178 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.02960738039047415 - nodes in this community are weakly interconnected._
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
- `e2e/ui-locks.pw.ts-snapshots/desktop-session-actions-busy-chromium-linux.png`
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
- `e2e/ui-locks.pw.ts-snapshots/foldable-session-actions-busy-chromium-linux.png`
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
- `e2e/ui-locks.pw.ts-snapshots/phone-session-actions-busy-chromium-linux.png`
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
