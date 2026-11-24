# Agentic Remote - Graphify code map

Snapshot: `065487debf135a5c68c448d9053960b814759c27e430c0b4e314703b742dc5b0`

Source checkout: `035a7fe16d528bd579e6b93618d63eb7e85b81eb`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 654 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 654 files · ~1,160,762 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9148 nodes · 26319 edges · 272 communities (225 shown, 29 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1315 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- AppWorkspace
- workspace-fixtures.ts
- SessionStore
- api.ts
- SessionDetail
- App.tsx
- agent-service.ts
- remote-node-client.ts
- react
- notification-classifier.ts
- agent-service.test.ts
- ManagerStore
- schedule-launcher.test.ts
- ManagedSession
- oracle-voice-session.ts
- computer-manager.ts
- .takeInTranscript
- manager-tools.ts
- contracts.ts
- oracle-voice-child.ts
- session-presentation.ts
- agentic-remote-promotion-monitor
- dreamer-store.ts
- oracle-voice-soak.ts
- ManagerAgent
- node-routes.ts
- FakeSessionService
- terminal-session.test.ts
- terminal-session.ts
- PushNotificationService
- oracle-voice-integration.test.ts
- oracle-voice-worker.ts
- transcription-service.ts
- schedules.ts
- .sendInternal
- oracle-voice-security.test.ts
- manager-agent.ts
- oracle-voice-routes.ts
- ManagerMessage
- tmux-errors.integration.test.ts
- manager-structured-memory-validation.ts
- tmux-test-helpers.ts
- session-reply-durability.test.ts
- UserInputReplyInput
- SessionService
- oracle-task-store.ts
- ProviderSessionService
- sampler.ts
- oracle-voice.ts
- TmuxTerminalSessionController
- oracle-voice-benchmark.ts
- DreamerService
- fake-voice.ts
- app.ts
- feature-flags.ts
- agentic-remote
- session-directory.ts
- ComputerSummary
- OracleDreamer.tsx
- processes.ts
- dreamer-progress.ts
- SchedulerStore
- ComposerActions.tsx
- ManagerAssistant.tsx
- OracleVoiceClient
- agentic-remote-gate
- server/skill-settings.ts
- bundle
- recovery-resend-durability.test.ts
- remote-voice-client.ts
- terminal-startup-queue.test.ts
- shell.ts
- VoicePlayback
- lib.rs
- hub-routes.ts
- VoiceClientControl
- schedule-recurrence.ts
- dependencies
- active-sessions.ts
- client.test.ts
- agentic-remote-promotion-setup
- KnowledgeStore
- manager-agent.test.ts
- SessionOrderStore
- ScheduleForm.tsx
- devDependencies
- config.rs
- dreamer-planner.ts
- knowledge-tree.ts
- manager-proactive-inbox.ts
- SessionKnowledgeStore
- RecentlyClosed.tsx
- capture.ts
- manager-structured-memory.ts
- EngineVoiceBackendSession
- manager-context.ts
- client.ts
- OracleVoiceCoordinator
- oracle-voice-segments.ts
- real-voice.ts
- host-telemetry.ts
- .toolHost
- oracle-voice-child.test.ts
- pwa.ts
- service.ts
- dreamer-service.ts
- ManagerAttachment
- startup-phases.test.ts
- shared/settings-profile.ts
- src/settings-profile.ts
- capture-workspace.ts
- cli-canary.ts
- scripts
- session-patch-browser.ts
- ChatMessage
- manager-structured-memory-search.ts
- SettingsProfileClient
- use-markdown-document.ts
- closed-sessions.ts
- HostMonitorView.test.tsx
- ManagerAssistant.test.tsx
- compilerOptions
- background-task-adapter.ts
- ManagerStructuredMemoryStore
- oracle-voice-coordinator.test.ts
- settings-profile-store.ts
- oracle-voice-config.ts
- session-knowledge-store.ts
- SettingsProfileSnapshot
- compilerOptions
- full-gate.test.ts
- oracle-voice-coordinator.ts
- refusal-metrics.ts
- response-compression.test.ts
- schedule-notification-service.test.ts
- ActivityDetails.tsx
- session-store-providers.test.ts
- ActivityRow.test.tsx
- compilerOptions
- transport.test.ts
- ManagerProactiveInbox
- OnlineRecognizer
- pipeline.ts
- NotificationPanel.tsx
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- normalizeKnowledgeRelativePath
- dreamer-schedule.ts
- oracle-status.test.ts
- promotion-monitor.test.ts
- use-session-knowledge-root.ts
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- session-latency-benchmark.ts
- VoiceTurnState
- server/session-patches.ts
- renderer.test.ts
- terminal-form-deadline.test.ts
- boundedText
- HostTelemetrySampler
- LargeSessionService
- session-resource-routes.test.ts
- use-markdown-document.test.tsx
- package.json
- registerSessionKnowledgeRoutes
- oracle-voice-assets.test.ts
- session-knowledge-routes.ts
- fake-vad.ts
- desktop.json
- DeferredSession
- recordValue
- background-task-stop.test.ts
- ActivityRow.tsx
- theme-contrast.test.ts
- OracleVoiceClientOptions
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- oracle-voice-engine-smoke.ts
- dreamer-service.test.ts
- .observe
- manager-proactive-inbox.test.ts
- Pcm16Resampler
- recently-closed.pw.ts
- background-task-tracker.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- pipeline.test.tsx
- RecentlyClosed.test.tsx
- settings-profile-routes.ts
- isRecord
- .initialize
- SessionAdmissions
- session-scope.ts
- tmux-errors.test.ts
- use-oracle-attachments.ts
- dataset
- generate-pwa-icons.ts
- file-upload-routes.ts
- manager-structured-memory-performance.test.ts
- session-unread-tracker.ts
- bridge.rs
- vite.config.ts
- dreamer-routes.ts
- logs-cli.test.ts
- ManagerProactiveInboxValidationError
- .drainAudio
- promotion-setup-execution.test.ts
- SkillsSettings.tsx
- voice-recorder.ts
- activity-details.test.ts
- doctor-cli.test.ts
- release-publication.test.ts
- UserInputFieldControl
- OracleVoicePlayback
- composer-layout.test.ts
- HostTelemetryClock
- .finishClose
- settings.ts
- background-task-adapter.test.ts
- VoiceServerControl
- recovery-context.ts
- session-provenance.ts
- use-foreground-handoff.ts
- MarkdownCodeBlock.tsx
- api-origin.test.ts
- dreamer-app.test.ts
- promotion-setup.test.ts
- FakeRecorder
- terminal-send-uncertainty.test.ts
- MermaidDiagram.tsx
- .readBackgroundTasks
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
- `FakeVoiceState` --references--> `ManagerMessage`  [EXTRACTED]
  e2e/fixtures/fake-voice.ts → shared/manager.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (272 total, 29 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (14): agentMode(), AgentService, isTerminalNotReadyRefusal(), normalizedTitle(), removeCopilotSessionFiles(), RuntimeConfigurationError, sessionInUseConflictMessage(), sessionInUseQueueMessage() (+6 more)

### Community 1 - "AppWorkspace"
Cohesion: 0.03
Nodes (190): terminalSendOptions(), sessionFileValidationError(), submissionReceiptFromError(), askSession(), cancelSession(), clearConversation(), closeSession(), getSession() (+182 more)

### Community 2 - "workspace-fixtures.ts"
Cohesion: 0.02
Nodes (117): { values }, frame(), geometry, output, pageFor(), scratch, screenshot(), { values } (+109 more)

### Community 3 - "SessionStore"
Cohesion: 0.02
Nodes (108): fixture(), holdProbe(), fixtures, gate(), releases, restart(), sdkPermissionEvents(), sdkRecoveryEvents() (+100 more)

### Community 4 - "api.ts"
Cohesion: 0.02
Nodes (147): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), activityArgumentFormats (+139 more)

### Community 5 - "SessionDetail"
Cohesion: 0.03
Nodes (32): ClaudeAgentService, isMissingClaudeSessionError(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt() (+24 more)

### Community 6 - "App.tsx"
Cohesion: 0.02
Nodes (130): isManagerEvent(), executeCommand(), fetchSettingsProfile(), importSettingsProfile(), listWorkspace(), saveSettingsChanges(), ActivityRowStates, App() (+122 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.03
Nodes (112): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+104 more)

### Community 8 - "remote-node-client.ts"
Cohesion: 0.03
Nodes (52): AgentServiceEvents, RemoteResync, RemoteSessionRead, DirectoryScope, ClaudeFakeSessionService, directories, routingFixture(), session() (+44 more)

### Community 9 - "react"
Cohesion: 0.04
Nodes (101): react, RuntimeModelOption, AppearanceSetting, NewSessionBackendSetting, activateSession(), addComputer(), configureRuntime(), createSession() (+93 more)

### Community 10 - "notification-classifier.ts"
Cohesion: 0.04
Nodes (67): WorkspaceFixture, ComputerManagerEvents, HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, computer, observe(), snapshot(), start (+59 more)

### Community 11 - "agent-service.test.ts"
Cohesion: 0.03
Nodes (62): CopilotClientLike, CopilotSessionLike, terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient (+54 more)

### Community 12 - "ManagerStore"
Cohesion: 0.04
Nodes (48): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, DreamerProgressEntry (+40 more)

### Community 13 - "schedule-launcher.test.ts"
Cohesion: 0.06
Nodes (43): enableSchedulerTools(), LaunchPrimitives, provenance(), ScheduleLauncherHost, ScheduleProvenance, scheduleSessionTitle(), SessionScheduleLauncher, directories (+35 more)

### Community 14 - "ManagedSession"
Cohesion: 0.07
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, ManagerEventSource, registerHubRoutes(), SessionMuteCarrier (+5 more)

### Community 15 - "oracle-voice-session.ts"
Cohesion: 0.04
Nodes (48): ActiveBackendSession, apps, directories, voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngineFactory, config, VoiceEngineEvent (+40 more)

### Community 16 - "computer-manager.ts"
Cohesion: 0.06
Nodes (68): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+60 more)

### Community 17 - ".takeInTranscript"
Cohesion: 0.05
Nodes (49): contextChangedInEvents(), createPendingUserInputTracker(), createStatusTracker(), at(), directories, finish(), launch(), projected() (+41 more)

### Community 18 - "manager-tools.ts"
Cohesion: 0.04
Nodes (48): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+40 more)

### Community 19 - "contracts.ts"
Cohesion: 0.03
Nodes (60): awaitTermination(), LaunchCreations, apps, directories, directory(), runtime(), services, storeAt() (+52 more)

### Community 20 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (42): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+34 more)

### Community 21 - "session-presentation.ts"
Cohesion: 0.05
Nodes (67): SessionProvenance, saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, readScheduleLink(), ScheduleLink, scheduleNotificationLabel() (+59 more)

### Community 22 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 23 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (44): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+36 more)

### Community 24 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (33): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+25 more)

### Community 25 - "ManagerAgent"
Cohesion: 0.08
Nodes (12): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, uniqueManagerSessionRefs() (+4 more)

### Community 26 - "node-routes.ts"
Cohesion: 0.05
Nodes (52): activityDetailsUnavailable(), activityNotInLog(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason() (+44 more)

### Community 27 - "FakeSessionService"
Cohesion: 0.05
Nodes (29): FakeSessionService, BackgroundTask, BackgroundTaskProgressLine, BackgroundTaskSnapshot, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog() (+21 more)

### Community 28 - "terminal-session.test.ts"
Cohesion: 0.04
Nodes (62): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+54 more)

### Community 29 - "terminal-session.ts"
Cohesion: 0.05
Nodes (71): afterExit(), boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus(), composerHoldsOtherText() (+63 more)

### Community 30 - "PushNotificationService"
Cohesion: 0.06
Nodes (29): start(), brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState (+21 more)

### Community 31 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (34): QueuedAudio, apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback (+26 more)

### Community 32 - "oracle-voice-worker.ts"
Cohesion: 0.06
Nodes (27): benchmarkGroup(), VoiceSttEngine, VoiceTtsEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, ChildVoiceEngineDependencies (+19 more)

### Community 33 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 34 - "schedules.ts"
Cohesion: 0.06
Nodes (58): State, stateSchema, timestamp, action, create, existing, metadata, scheduleProposalInputSchema (+50 more)

### Community 35 - ".sendInternal"
Cohesion: 0.08
Nodes (54): activeBottomFrame(), backgroundShellsAllow(), busyRowStatus(), captureBeforeDeadline(), captureForReplacement(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts() (+46 more)

### Community 36 - "oracle-voice-security.test.ts"
Cohesion: 0.04
Nodes (30): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceStartUtterance, BlockingCancelEngine, RejectingNodeEngine (+22 more)

### Community 37 - "manager-agent.ts"
Cohesion: 0.05
Nodes (46): apps, directories, DreamerProgressView, automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions (+38 more)

### Community 38 - "oracle-voice-routes.ts"
Cohesion: 0.06
Nodes (48): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+40 more)

### Community 39 - "ManagerMessage"
Cohesion: 0.05
Nodes (21): FakeManager, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams (+13 more)

### Community 40 - "tmux-errors.integration.test.ts"
Cohesion: 0.05
Nodes (36): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+28 more)

### Community 41 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 42 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (48): foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity(), SocketPlace, UnixSocket (+40 more)

### Community 43 - "session-reply-durability.test.ts"
Cohesion: 0.05
Nodes (45): root, script, ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services (+37 more)

### Community 44 - "UserInputReplyInput"
Cohesion: 0.07
Nodes (10): isUncertainDelivery(), PendingUserInputTracker, persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, TerminalSessionController, ConfigureRuntimeInput, PendingUserInput (+2 more)

### Community 45 - "SessionService"
Cohesion: 0.07
Nodes (11): ActiveClaudeQuery, nodeVoiceCapabilities(), registerNodeRoutes(), releases, session, snapshot, obstructUploads(), readServiceResources() (+3 more)

### Community 46 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (36): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+28 more)

### Community 47 - "ProviderSessionService"
Cohesion: 0.07
Nodes (3): updateComputerForLaunchIdentity(), owns(), ProviderSessionService

### Community 48 - "sampler.ts"
Cohesion: 0.08
Nodes (47): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+39 more)

### Community 49 - "oracle-voice.ts"
Cohesion: 0.07
Nodes (43): VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities, closeServers, exactArrayBuffer(), sockets (+35 more)

### Community 50 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (15): isSessionScopeLauncher(), sessionLaunchCommand(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors() (+7 more)

### Community 51 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (41): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 52 - "DreamerService"
Cohesion: 0.12
Nodes (9): digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate, DreamerSnapshot (+1 more)

### Community 53 - "fake-voice.ts"
Cohesion: 0.07
Nodes (10): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance (+2 more)

### Community 54 - "app.ts"
Cohesion: 0.07
Nodes (29): buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), recordScheduleProposals(), build() (+21 more)

### Community 55 - "feature-flags.ts"
Cohesion: 0.11
Nodes (32): hub(), AppVersion, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable() (+24 more)

### Community 56 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 57 - "session-directory.ts"
Cohesion: 0.10
Nodes (38): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+30 more)

### Community 58 - "ComputerSummary"
Cohesion: 0.09
Nodes (16): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, ProactiveManager, directories (+8 more)

### Community 59 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (39): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition, getDreamer() (+31 more)

### Community 60 - "processes.ts"
Cohesion: 0.08
Nodes (27): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessStat, expectProc(), ProcessFixture, processStatFixture() (+19 more)

### Community 61 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, DreamerProgressSource (+11 more)

### Community 62 - "SchedulerStore"
Cohesion: 0.13
Nodes (5): deferUnboundWorktree(), failure(), SchedulerStore, ScheduleProposal, Schedule

### Community 63 - "ComposerActions.tsx"
Cohesion: 0.08
Nodes (20): families, modelFamily, repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions(), ContextRing() (+12 more)

### Community 64 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (40): editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), sendManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), boundWidth() (+32 more)

### Community 65 - "OracleVoiceClient"
Cohesion: 0.14
Nodes (8): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError(), terminalCloseCode()

### Community 66 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 67 - "server/skill-settings.ts"
Cohesion: 0.10
Nodes (27): instrument(), frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills(), Token, readBounded() (+19 more)

### Community 68 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 69 - "recovery-resend-durability.test.ts"
Cohesion: 0.06
Nodes (26): directories, disk, fixture(), gate(), gates, httpBoundary(), initialize(), PublicSessionValue (+18 more)

### Community 70 - "remote-voice-client.ts"
Cohesion: 0.11
Nodes (19): VoiceBackendDisconnectCause, VoiceBackendOutput, RemoteNodeRedirectError, RemoteNodeRequestError, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES (+11 more)

### Community 71 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (32): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+24 more)

### Community 72 - "shell.ts"
Cohesion: 0.09
Nodes (35): ScheduleShellNotifier, attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label() (+27 more)

### Community 73 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 74 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 75 - "hub-routes.ts"
Cohesion: 0.06
Nodes (39): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+31 more)

### Community 76 - "VoiceClientControl"
Cohesion: 0.13
Nodes (8): VoiceClientControl, captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 77 - "schedule-recurrence.ts"
Cohesion: 0.11
Nodes (36): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+28 more)

### Community 78 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 79 - "active-sessions.ts"
Cohesion: 0.11
Nodes (32): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+24 more)

### Community 80 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 81 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 82 - "KnowledgeStore"
Cohesion: 0.11
Nodes (15): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+7 more)

### Community 83 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (18): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+10 more)

### Community 84 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 85 - "ScheduleForm.tsx"
Cohesion: 0.12
Nodes (28): scheduleProposalSummary(), CLAUDE_SCHEDULE_UNAVAILABLE_REASON, scheduleProviderUnavailableReason(), ScheduleTarget, FolderPicker(), browse(), editableSchedule(), recurrenceSummary() (+20 more)

### Community 86 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 87 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 88 - "dreamer-planner.ts"
Cohesion: 0.11
Nodes (33): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+25 more)

### Community 89 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (33): WorkspaceEntry, readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+25 more)

### Community 90 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (34): assertExactKeys(), cloneState(), DISPOSITIONS, hasExactKeys(), isDisposition(), isEventKind(), isId(), isOrigin() (+26 more)

### Community 91 - "SessionKnowledgeStore"
Cohesion: 0.12
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 92 - "RecentlyClosed.tsx"
Cohesion: 0.09
Nodes (27): closedSessionExpiresAt(), changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame() (+19 more)

### Community 93 - "capture.ts"
Cohesion: 0.07
Nodes (16): BufferedFrame, defaultAudioContext(), positiveLimit(), CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode, VoiceVad (+8 more)

### Community 94 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 95 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 96 - "manager-context.ts"
Cohesion: 0.13
Nodes (26): ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine(), followUpLine() (+18 more)

### Community 97 - "client.ts"
Cohesion: 0.10
Nodes (23): VoiceCapabilities, getOracleVoiceCapabilities(), closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode (+15 more)

### Community 99 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 100 - "real-voice.ts"
Cohesion: 0.11
Nodes (13): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+5 more)

### Community 101 - "host-telemetry.ts"
Cohesion: 0.09
Nodes (25): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, aggregate (+17 more)

### Community 102 - ".toolHost"
Cohesion: 0.09
Nodes (7): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation, PermissionReplyInput, RenameSessionInput, SendMessageInput

### Community 103 - "oracle-voice-child.test.ts"
Cohesion: 0.10
Nodes (11): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+3 more)

### Community 104 - "pwa.ts"
Cohesion: 0.13
Nodes (28): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), activatePwaUpdate(), activePushSubscription(), applicationServerKey(), checkForPwaUpdate() (+20 more)

### Community 105 - "service.ts"
Cohesion: 0.12
Nodes (13): BuildAppOptions, ProcessScanContext, HostRequest, HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError(), HostTelemetryService, HostTelemetryTarget (+5 more)

### Community 106 - "dreamer-service.ts"
Cohesion: 0.11
Nodes (28): DREAMER_MAX_ITEMS, DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), DreamerProgressLimits, boundedText(), DreamerFollowUp (+20 more)

### Community 107 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 108 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (17): phases, port, app(), directories, headers, launcher, createStartupPhases(), silentStartupPhases (+9 more)

### Community 109 - "shared/settings-profile.ts"
Cohesion: 0.11
Nodes (26): AccentSetting, appearanceSettings, applySettingsChanges(), DEFAULT_SESSION_PROVIDER, isRecord(), newSessionBackendSettings, NewSessionFoldersSetting, oneOf() (+18 more)

### Community 110 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (23): isSettingsDeviceId(), isSettingsRevision(), SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+15 more)

### Community 111 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 112 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 113 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 114 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (24): advance(), connections, content(), FrameMeasurement, lastHeading(), message(), open(), percentile() (+16 more)

### Community 115 - "ChatMessage"
Cohesion: 0.12
Nodes (13): Connection, TranscriptBuilder, Client, PatchSocket, Browser, seedOffset, StoredSession, ChatMessage (+5 more)

### Community 116 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 117 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 118 - "use-markdown-document.ts"
Cohesion: 0.15
Nodes (20): build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing(), Level (+12 more)

### Community 119 - "closed-sessions.ts"
Cohesion: 0.11
Nodes (11): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, recordClosure(), CLOSED_SESSION_RETENTION_MS, closedSessionContext(), excerpt() (+3 more)

### Community 120 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 121 - "ManagerAssistant.test.tsx"
Cohesion: 0.09
Nodes (16): cancelManager(), resolveManagerConfirmation(), retryManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+8 more)

### Community 122 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 123 - "background-task-adapter.ts"
Cohesion: 0.17
Nodes (23): CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTasksApi, copyTask(), createBackgroundTaskProjector(), endsForegroundTurn(), eventString(), isLiveTaskStatus() (+15 more)

### Community 124 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 125 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 126 - "settings-profile-store.ts"
Cohesion: 0.15
Nodes (11): WorkspaceFixtureState, SettingsProfileState, applySettingsImport(), isSettingsProfileKey(), SettingsProfileRecord, validateSettingsImport(), seedHubSettings(), settingsProfileCacheKey (+3 more)

### Community 127 - "oracle-voice-config.ts"
Cohesion: 0.16
Nodes (19): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+11 more)

### Community 128 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 129 - "SettingsProfileSnapshot"
Cohesion: 0.15
Nodes (10): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileStore, directories, store() (+2 more)

### Community 130 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 131 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 132 - "oracle-voice-coordinator.ts"
Cohesion: 0.11
Nodes (13): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceCoordinatorOptions (+5 more)

### Community 133 - "refusal-metrics.ts"
Cohesion: 0.16
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+7 more)

### Community 134 - "response-compression.test.ts"
Cohesion: 0.14
Nodes (18): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), apps (+10 more)

### Community 135 - "schedule-notification-service.test.ts"
Cohesion: 0.17
Nodes (7): ScheduleNotificationService, input(), now, run(), ScheduleRunNotification, SchedulerChanged, ScheduleRunStatus

### Community 136 - "ActivityDetails.tsx"
Cohesion: 0.20
Nodes (17): ActivityDetail, activityDetailFailure, detailKey(), formatBytes(), keep(), kept, keptActivityDetail(), loadActivityDetail() (+9 more)

### Community 137 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 138 - "ActivityRow.test.tsx"
Cohesion: 0.14
Nodes (12): ActivityStatus, ActivityRow, bashDetail(), output, raw, runningDetail(), text(), UserMessage (+4 more)

### Community 139 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 140 - "transport.test.ts"
Cohesion: 0.15
Nodes (10): registerHostTelemetryRoutes(), HOST_TELEMETRY_MAX_QUEUE_BYTES, HOST_TELEMETRY_MAX_QUEUE_MESSAGES, HOST_TELEMETRY_SEND_TIMEOUT_MS, HostSocket, HostTelemetrySocket, empty, inventory (+2 more)

### Community 141 - "ManagerProactiveInbox"
Cohesion: 0.22
Nodes (4): ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, nowIso(), openInbox()

### Community 142 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 143 - "pipeline.ts"
Cohesion: 0.17
Nodes (19): openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform() (+11 more)

### Community 144 - "NotificationPanel.tsx"
Cohesion: 0.19
Nodes (13): FeatureEvent, listeners, publishFeatureEvent(), subscribeFeatureEvents(), notificationGroups(), NotificationTab, kindIcon(), NotificationPanel() (+5 more)

### Community 145 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 146 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 147 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 148 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 149 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 150 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 151 - "oracle-status.test.ts"
Cohesion: 0.19
Nodes (14): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+6 more)

### Community 152 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 153 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 154 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 155 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 156 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 157 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 158 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 160 - "server/session-patches.ts"
Cohesion: 0.21
Nodes (8): diffMessages(), Publication, sameField(), sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 161 - "renderer.test.ts"
Cohesion: 0.16
Nodes (8): render, scope, createWorkerRenderer(), RendererWorker, FakeWorker, startWorkers(), handleRenderRequest(), RenderRequest

### Community 162 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 163 - "boundedText"
Cohesion: 0.21
Nodes (16): addActivity(), attachmentModeValue(), booleanValue(), boundedText(), eventTask(), executionModeValue(), normalizeBackgroundTask(), numberValue() (+8 more)

### Community 166 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 167 - "use-markdown-document.test.tsx"
Cohesion: 0.17
Nodes (7): DocumentRenderEvent, RenderedDocumentTree, DocumentRenderer, DocumentRendererContext, synchronousRenderer, components, show()

### Community 168 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 169 - "registerSessionKnowledgeRoutes"
Cohesion: 0.29
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 170 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 171 - "session-knowledge-routes.ts"
Cohesion: 0.13
Nodes (10): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema, SessionKnowledgeLifecycle (+2 more)

### Community 172 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 173 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 174 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 175 - "recordValue"
Cohesion: 0.23
Nodes (14): backgroundHandoff(), errorValue(), notificationKind(), parsedValue(), rawTailText(), recordValue(), shellIdFromFooter(), shellIdFromValue() (+6 more)

### Community 176 - "background-task-stop.test.ts"
Cohesion: 0.25
Nodes (11): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started(), stopAcknowledgement() (+3 more)

### Community 177 - "ActivityRow.tsx"
Cohesion: 0.33
Nodes (11): toolCallIdFromActivityId(), activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), compactActivityText(), formatActivityDuration() (+3 more)

### Community 178 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 179 - "OracleVoiceClientOptions"
Cohesion: 0.23
Nodes (3): OracleVoiceClientOptions, FakeVoiceClient, transcript()

### Community 180 - "pending-echo.ts"
Cohesion: 0.25
Nodes (10): nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, PendingEchoOwner, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 181 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 182 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 183 - "oracle-voice-engine-smoke.ts"
Cohesion: 0.21
Nodes (6): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave

### Community 184 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 185 - ".observe"
Cohesion: 0.21
Nodes (7): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId()

### Community 186 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 187 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 188 - "recently-closed.pw.ts"
Cohesion: 0.23
Nodes (9): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), open(), row() (+1 more)

### Community 189 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 190 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 191 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 192 - "pipeline.test.tsx"
Cohesion: 0.23
Nodes (8): documentJsx(), components, drawn(), drawnPage(), fixtures, html(), today(), wholePage()

### Community 193 - "RecentlyClosed.test.tsx"
Cohesion: 0.20
Nodes (8): act(), audit(), closed, computers, now, observeResizes(), session(), windowWide()

### Community 194 - "settings-profile-routes.ts"
Cohesion: 0.25
Nodes (8): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 195 - "isRecord"
Cohesion: 0.29
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 196 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 198 - "session-scope.ts"
Cohesion: 0.20
Nodes (7): execFileAsync, ProbeRun, SESSION_SCOPE, sessionScopeAvailable, sessionScopeProbe(), adapter, scope

### Community 199 - "tmux-errors.test.ts"
Cohesion: 0.24
Nodes (9): containedServer(), directories, errno(), { execute }, files, links, listener(), places() (+1 more)

### Community 200 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 201 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 202 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 203 - "file-upload-routes.ts"
Cohesion: 0.31
Nodes (7): FileUploadError, registerFileUploadRoutes(), SessionParams, extension(), MAX_SESSION_FILE_BYTES, supportedExtensions, supportsSessionFile()

### Community 204 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.27
Nodes (7): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult, submitSearch()

### Community 205 - "session-unread-tracker.ts"
Cohesion: 0.29
Nodes (5): FinishedSession, SessionUnreadTracker, finished(), SessionTurnState, turnEnded()

### Community 206 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 207 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 208 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 209 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 210 - "ManagerProactiveInboxValidationError"
Cohesion: 0.28
Nodes (6): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions()

### Community 212 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 213 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 214 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 215 - "activity-details.test.ts"
Cohesion: 0.43
Nodes (5): complete(), event(), sessionWithLog(), start(), ACTIVITY_DETAIL_TEXT_LIMIT_BYTES

### Community 216 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 217 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 218 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 220 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 223 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 224 - "background-task-adapter.test.ts"
Cohesion: 0.40
Nodes (5): MAX_BACKGROUND_TASKS, MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH, lifecycleEvent(), subagentShell()

### Community 225 - "VoiceServerControl"
Cohesion: 0.40
Nodes (4): connect(), Inbox, rawBuffer(), VoiceServerControl

### Community 226 - "recovery-context.ts"
Cohesion: 0.47
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 227 - "session-provenance.ts"
Cohesion: 0.47
Nodes (5): isSession(), SessionIdentity, sessionProvenanceProjection(), project(), reply()

### Community 228 - "use-foreground-handoff.ts"
Cohesion: 0.47
Nodes (3): foregroundHandoffTimeoutMs, Handoff, useForegroundHandoff()

### Community 229 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 230 - "api-origin.test.ts"
Cohesion: 0.40
Nodes (4): prefixes, session, trusted, untrusted

### Community 231 - "dreamer-app.test.ts"
Cohesion: 0.40
Nodes (3): directories, runtimes, trusted

### Community 232 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 236 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **1464 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1459 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2456 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SettingsProfileSnapshot`, `SessionStore`, `SessionDetail`, `refusal-metrics.ts`, `response-compression.test.ts`, `schedule-notification-service.test.ts`, `notification-classifier.ts`, `transport.test.ts`, `ManagerStore`, `ManagedSession`, `ManagerProactiveInbox`, `oracle-voice-session.ts`, `schedule-launcher.test.ts`, `ManagerAgent`, `node-routes.ts`, `PushNotificationService`, `oracle-voice-worker.ts`, `transcription-service.ts`, `HostTelemetrySampler`, `ManagerMessage`, `tmux-errors.integration.test.ts`, `UserInputReplyInput`, `SessionService`, `oracle-task-store.ts`, `ProviderSessionService`, `DreamerService`, `feature-flags.ts`, `ComputerSummary`, `SchedulerStore`, `server/skill-settings.ts`, `file-upload-routes.ts`, `dreamer-routes.ts`, `KnowledgeStore`, `SessionOrderStore`, `SessionKnowledgeStore`, `session-provenance.ts`, `service.ts`, `cli-canary.ts`, `oracle-voice-config.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `recovery-resend-durability.test.ts`, `SessionDetail`, `agent-service.ts`, `remote-node-client.ts`, `agent-service.test.ts`, `UserInputReplyInput`, `.readBackgroundTasks`, `computer-manager.ts`, `.takeInTranscript`, `node-routes.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `SessionDetail`, `remote-node-client.ts`, `UserInputReplyInput`, `.takeInTranscript`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1464 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03332618179217622 - nodes in this community are weakly interconnected._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.028397565922920892 - nodes in this community are weakly interconnected._
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
