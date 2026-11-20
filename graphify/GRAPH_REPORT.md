# Agentic Remote - Graphify code map

Snapshot: `5b503b2cdd11c59521de99d29d7dedd24701a2c5c513b3854b81b8c4839de559`

Source checkout: `9bd04e9db9c372b640da1f279e9260d85df0118d`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 635 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 635 files · ~1,134,312 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 8891 nodes · 25711 edges · 271 communities (224 shown, 29 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1298 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AppWorkspace
- SessionStore
- api.ts
- App.tsx
- workspace-fixtures.ts
- agent-service.ts
- SessionDetail
- AgentService
- app.ts
- contracts.ts
- SessionService
- .get
- manager-tools.ts
- terminal-session.ts
- client.ts
- manager-agent.ts
- claude-agent-service.ts
- sessionKey
- ManagedSession
- session-store-providers.test.ts
- ManagerStore
- agentic-remote-promotion-monitor
- oracle-voice-child.ts
- host-telemetry.ts
- .handleSessionEvent
- background-task-adapter.ts
- dreamer-store.ts
- ManagerAgent
- AppSettingsDialog.tsx
- tmux-test-helpers.ts
- VoiceCapture
- .publishError
- RemoteNodeClient
- schedules.ts
- schedule-launcher.test.ts
- transcription-service.ts
- fake-voice.ts
- oracle-voice-engine.ts
- oracle-voice-soak.ts
- OracleVoiceCoordinator
- oracle-voice-integration.test.ts
- tmux-errors.integration.test.ts
- TmuxTerminalSessionController
- oracle-voice-coordinator.ts
- manager-structured-memory-validation.ts
- ManagerEvent
- oracle-voice-worker.ts
- oracle-voice.ts
- DreamerService
- oracle-task-store.ts
- node-routes.ts
- session-knowledge-store.ts
- oracle-voice-benchmark.ts
- OracleDreamer.tsx
- ScheduleRun
- shared/settings-profile.ts
- FakeVoiceEngine
- oracle-voice-session.ts
- SchedulerStore
- agentic-remote
- send-matrix.integration.test.ts
- hub-routes.ts
- dreamer-progress.ts
- scheduler-store.ts
- FakeSessionService
- TerminalSessionController
- dreamer-planner.ts
- agentic-remote-gate
- bundle
- pwa.ts
- processes.ts
- preview-features.ts
- shell.ts
- VoicePlayback
- oracle-voice-routes.ts
- lib.rs
- ManagerAssistant.tsx
- dependencies
- manager-context.ts
- manager-agent.test.ts
- manager-proactive-inbox.ts
- client.test.ts
- agentic-remote-promotion-setup
- KnowledgeStore
- oracle-voice-security.test.ts
- SessionOrderStore
- devDependencies
- config.rs
- oracle-voice-config.ts
- agent-service.test.ts
- PushNotificationService
- terminal-session.test.ts
- ScheduleForm.tsx
- react
- manager-structured-memory.ts
- knowledge-tree.ts
- manager-structured-memory-search.ts
- oracle-voice-child.test.ts
- use-markdown-document.ts
- VoiceClientControl
- oracle-voice-routes.test.ts
- active-sessions.ts
- oracle-voice-segments.ts
- push-notification-service.ts
- pipeline.ts
- notification-center-service.ts
- .sendInternal
- ManagerAssistant.test.tsx
- capture-workspace.ts
- ComputerSummary
- ManagerAttachment
- scheduler-dispatcher.ts
- notification-classifier.ts
- DialogFrame.tsx
- session-directory.ts
- cli-canary.ts
- scripts
- renderer.ts
- session-patch-browser.ts
- registerSessionKnowledgeRoutes
- SettingsProfileClient
- server/skill-settings.ts
- compilerOptions
- .replyUserInputInternal
- ManagerProactiveInbox
- session-reply-durability.test.ts
- src/settings-profile.ts
- HostTelemetrySampler
- reader.ts
- ManagerStructuredMemoryStore
- sections.tsx
- ChatMessage
- workspace-browser.ts
- normalizeKnowledgeRelativePath
- SessionStatus
- oracle-voice-tickets.ts
- NotificationRecord
- compilerOptions
- full-gate.test.ts
- session-response-order.ts
- markdown-navigation.ts
- compilerOptions
- dreamer-service.ts
- NotificationStore
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- SettingsProfileSnapshot
- dreamer-schedule.ts
- HostMonitorView.test.tsx
- NotificationCenterService
- promotion-monitor.test.ts
- terminal-startup-queue.test.ts
- SessionOriginBadge.test.tsx
- use-session-knowledge-root.ts
- BoundedQueue
- ReaderWorkspace
- settings-profile.test.ts
- manager-automatic.ts
- scripts
- session-latency-benchmark.ts
- parsers.ts
- session-resource-routes.test.ts
- terminal-form-deadline.test.ts
- SoakManager
- closed-session-sweeper.ts
- .persist
- recovery-resend-durability.test.ts
- server/session-patches.ts
- package.json
- session-resource-providers.test.ts
- oracle-voice-assets.test.ts
- RuntimeStatus.tsx
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- ShellNavigation.test.tsx
- SessionNavigation.test.tsx
- .oxlintrc.json
- settings-local.json
- .initialize
- Pcm16Resampler
- recently-closed.pw.ts
- dreamer-routes.ts
- sampler.ts
- manager-proactive-inbox.test.ts
- SessionAdmissions
- BackgroundTasksDialog.tsx
- html-preview.ts
- fixture-frontend.ts
- sign-in-expired.pw.ts
- ScheduleNotificationService
- use-oracle-attachments.ts
- dataset
- generate-pwa-icons.ts
- ManagerProactiveInboxValidationError
- notification-center.integration.test.ts
- bridge.rs
- remarkSafeBreaks
- vite.config.ts
- oracle-status.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- tmux-errors.test.ts
- SkillsSettings.tsx
- askSideQuestion
- sent-message.ts
- voice-recorder.ts
- doctor-cli.test.ts
- release-publication.test.ts
- session-admission-lifecycle.test.ts
- shared/skill-settings.ts
- closed-sessions.ts
- UserInputFieldControl
- KnowledgePosition
- skill-settings-jsonc.ts
- history-projection.test.ts
- HostTelemetryClock
- settings.ts
- DocumentViewControls.tsx
- useHostMonitor
- composer-layout.test.ts
- VoiceSttEngine
- recovery-context.ts
- session-provenance.ts
- hasActiveBackgroundTasks
- usePanelWidth
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- HubEventSource
- SessionKnowledgeLifecycle
- terminal-send-uncertainty.test.ts
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
2. `SessionDetail` - 337 edges
3. `AgentService` - 307 edges
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
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `pathRecordSchema` --calls--> `normalizeKnowledgeRelativePath()`  [EXTRACTED]
  server/session-knowledge-store.ts → shared/knowledge-path.ts
- `Publication` --references--> `ManagedSession`  [EXTRACTED]
  server/session-patches.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (271 total, 29 thin omitted)

### Community 0 - "AppWorkspace"
Cohesion: 0.03
Nodes (153): terminalSendOptions(), submissionReceiptFromError(), AppWorkspace(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applySession(), askAboutKnowledgeFile() (+145 more)

### Community 1 - "SessionStore"
Cohesion: 0.03
Nodes (83): fixture(), restart(), directories, fakeClient(), fixture(), ForkRequest, forkSession(), services (+75 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (137): AddKnowledgeRootInput, PushSettings, SessionKnowledgeRootMutationInput, SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), activateSession() (+129 more)

### Community 3 - "App.tsx"
Cohesion: 0.02
Nodes (120): ActivityStatus, isManagerEvent(), extension(), MAX_SESSION_FILE_BYTES, sessionFileValidationError(), supportedExtensions, supportsSessionFile(), turnEnded() (+112 more)

### Community 4 - "workspace-fixtures.ts"
Cohesion: 0.03
Nodes (82): { values }, frame(), geometry, output, pageFor(), scratch, screenshot(), { values } (+74 more)

### Community 5 - "agent-service.ts"
Cohesion: 0.02
Nodes (116): ActivePrompt, ActivityToolStart, ansiSequence, CopilotClientLike, DeliveryBoundary, ElicitationContext, ElicitationHandler, ElicitationReply (+108 more)

### Community 6 - "SessionDetail"
Cohesion: 0.03
Nodes (22): AcceptedSdkReply, ClaudeAgentService, isClaudeAuthenticationError(), PendingClaudeReply, cleanupFixtures(), directories, fixture(), queryHandle() (+14 more)

### Community 7 - "AgentService"
Cohesion: 0.04
Nodes (15): agentMode(), AgentService, isRuntimeReasoningEffort(), lifecycleRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, suspendedRuntimeConflict(), suspendRefused() (+7 more)

### Community 8 - "app.ts"
Cohesion: 0.03
Nodes (77): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+69 more)

### Community 9 - "contracts.ts"
Cohesion: 0.04
Nodes (77): AgentServiceEvents, ClaudeAgentServiceEvents, ComputerManagerEvents, RemoteSessionListing, DirectoryScope, directories, routingFixture(), session() (+69 more)

### Community 10 - "SessionService"
Cohesion: 0.04
Nodes (6): updateComputerForLaunchIdentity(), registerNodeRoutes(), ProviderSessionService, SessionService, WorkspaceFile, WorkspaceListing

### Community 11 - ".get"
Cohesion: 0.06
Nodes (11): commandShortcut(), permissionTitle(), sessionInUseConflictMessage(), TerminalActivationSupersededError, isMissingClaudeSessionError(), ownsDispatchRecovery(), preflight(), preparePrompt() (+3 more)

### Community 12 - "manager-tools.ts"
Cohesion: 0.04
Nodes (53): HOST_STATUS_MAX_LENGTH, computers, inventory, now, snapshot, APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS (+45 more)

### Community 13 - "terminal-session.ts"
Cohesion: 0.04
Nodes (96): activeBottomFrame(), BackgroundShellsEvidence, boxedComposerFrame(), captureBeforeDeadline(), captureTerminal(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS (+88 more)

### Community 14 - "client.ts"
Cohesion: 0.05
Nodes (36): VoiceCapabilities, VoiceServerControl, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason(), isCapabilities() (+28 more)

### Community 15 - "manager-agent.ts"
Cohesion: 0.03
Nodes (59): CreationRuntime, DreamerServiceOptions, automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung (+51 more)

### Community 16 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (67): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, RemoteNodeRedirectError (+59 more)

### Community 17 - "sessionKey"
Cohesion: 0.04
Nodes (78): closedSessionExpiresAt(), listClosedSessions(), cancelSelectedBackgroundTask(), changeSessionUnread(), deleteClosedSession(), handleDragEnd(), moveSelectedSessionToTmux(), requestSessionClose() (+70 more)

### Community 18 - "ManagedSession"
Cohesion: 0.08
Nodes (12): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, SessionLauncherOptions (+4 more)

### Community 19 - "session-store-providers.test.ts"
Cohesion: 0.03
Nodes (42): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), QueuedDelivery, QueuedDispatches (+34 more)

### Community 20 - "ManagerStore"
Cohesion: 0.05
Nodes (23): openStore(), JournalRecorder, JournalRecorderOptions, sessionTask(), applySessionReplacement(), emptyState(), JournalDraft, JournalEntry (+15 more)

### Community 21 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 22 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (41): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+33 more)

### Community 23 - "host-telemetry.ts"
Cohesion: 0.05
Nodes (49): HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, computer, observe(), snapshot(), start, sustained(), HOST_TELEMETRY_REMOTE_TIMEOUT_MS (+41 more)

### Community 24 - ".handleSessionEvent"
Cohesion: 0.06
Nodes (42): activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), backgroundShellsEvidence(), contextTextLength(), estimatedContextTokens(), eventAgentId() (+34 more)

### Community 25 - "background-task-adapter.ts"
Cohesion: 0.06
Nodes (75): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), CopilotClientTaskInfo (+67 more)

### Community 26 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (42): validateDreamerTimeZone(), assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+34 more)

### Community 27 - "ManagerAgent"
Cohesion: 0.08
Nodes (15): DreamerProgressView, checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime() (+7 more)

### Community 28 - "AppSettingsDialog.tsx"
Cohesion: 0.06
Nodes (66): RuntimeModelOption, NewSessionBackendSetting, getProviderRuntimeOptions(), listDirectories(), updateManagerSettings(), AddKnowledgeRootDialog(), browse(), shortcutKeys() (+58 more)

### Community 29 - "tmux-test-helpers.ts"
Cohesion: 0.06
Nodes (60): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), startAgentAfterClear(), exec (+52 more)

### Community 30 - "VoiceCapture"
Cohesion: 0.06
Nodes (24): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, harness() (+16 more)

### Community 31 - ".publishError"
Cohesion: 0.07
Nodes (5): isTerminalNotReadyRefusal(), normalizedTitle(), TerminalDiscoveryError, interruptionMessage(), isRetainedRefusal()

### Community 32 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (16): BackgroundTaskUpdate, RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, requestBytes(), client(), servers (+8 more)

### Community 33 - "schedules.ts"
Cohesion: 0.06
Nodes (61): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+53 more)

### Community 34 - "schedule-launcher.test.ts"
Cohesion: 0.05
Nodes (40): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, withSessionCreateBoundary() (+32 more)

### Community 35 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionMultipartOptions (+27 more)

### Community 36 - "fake-voice.ts"
Cohesion: 0.05
Nodes (11): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice() (+3 more)

### Community 37 - "oracle-voice-engine.ts"
Cohesion: 0.05
Nodes (22): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+14 more)

### Community 38 - "oracle-voice-soak.ts"
Cohesion: 0.07
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, delay(), errorText(), GatedStartupRaceObservation, LifecycleCycleObservation (+26 more)

### Community 39 - "OracleVoiceCoordinator"
Cohesion: 0.09
Nodes (5): errorMessage(), OracleVoiceCoordinator, PendingFinalTurn, withTimeout(), VoiceTurnState

### Community 40 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+24 more)

### Community 41 - "tmux-errors.integration.test.ts"
Cohesion: 0.05
Nodes (38): stopActiveCopilotSession(), ServerRole, connections, fixture(), managers, releases, remote, session() (+30 more)

### Community 42 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (17): afterExit(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, FormReplyDeadlineError, listTmuxSessions(), processAncestors() (+9 more)

### Community 43 - "oracle-voice-coordinator.ts"
Cohesion: 0.05
Nodes (34): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnection (+26 more)

### Community 44 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 45 - "ManagerEvent"
Cohesion: 0.07
Nodes (17): ManagerEventSource, batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, ProactiveManager (+9 more)

### Community 46 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (25): benchmarkGroup(), ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent() (+17 more)

### Community 47 - "oracle-voice.ts"
Cohesion: 0.07
Nodes (43): apps, directories, sendNodeVoiceOutput(), outputBytes(), backendOutputBytes(), DEFAULT_VOICE_BACKEND_LIMITS, capabilities, closeServers (+35 more)

### Community 48 - "DreamerService"
Cohesion: 0.10
Nodes (14): activeDreamerMemoryIds(), DreamerMemoryMetadata, digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), safeRunError(), unavailableSnapshot() (+6 more)

### Community 49 - "oracle-task-store.ts"
Cohesion: 0.08
Nodes (39): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+31 more)

### Community 50 - "node-routes.ts"
Cohesion: 0.07
Nodes (41): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema (+33 more)

### Community 51 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+22 more)

### Community 52 - "oracle-voice-benchmark.ts"
Cohesion: 0.06
Nodes (42): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, buildConfig(), CliOptions, clockTicksPerSecond() (+34 more)

### Community 53 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (43): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+35 more)

### Community 54 - "ScheduleRun"
Cohesion: 0.13
Nodes (11): provenance(), SessionScheduleLauncher, session(), ScheduleLauncher, ScheduleLaunchRefusedError, SchedulerDispatcher, ScheduleReconciliation, registerSchedulerRoutes() (+3 more)

### Community 55 - "shared/settings-profile.ts"
Cohesion: 0.07
Nodes (45): WorkspaceFixtureState, execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema (+37 more)

### Community 56 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (22): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+14 more)

### Community 57 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (17): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), createVoiceBackendSession(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled() (+9 more)

### Community 58 - "SchedulerStore"
Cohesion: 0.12
Nodes (7): fixture(), deferUnboundWorktree(), failure(), SchedulerStore, ScheduleProposal, Schedule, ScheduleRunStatus

### Community 59 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 60 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (43): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+35 more)

### Community 61 - "hub-routes.ts"
Cohesion: 0.05
Nodes (44): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+36 more)

### Community 62 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 63 - "scheduler-store.ts"
Cohesion: 0.08
Nodes (38): proposalInput, State, stateSchema, timestamp, action, create, existing, metadata (+30 more)

### Community 65 - "TerminalSessionController"
Cohesion: 0.05
Nodes (20): holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), fixtures, releases (+12 more)

### Community 66 - "dreamer-planner.ts"
Cohesion: 0.07
Nodes (32): activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem(), digest() (+24 more)

### Community 67 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 68 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 69 - "pwa.ts"
Cohesion: 0.09
Nodes (37): parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), snapshot, gatewayRefused(), HUB_SIGN_IN_EXPIRED_MESSAGE (+29 more)

### Community 70 - "processes.ts"
Cohesion: 0.09
Nodes (26): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+18 more)

### Community 71 - "preview-features.ts"
Cohesion: 0.12
Nodes (29): hub(), AppVersion, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable() (+21 more)

### Community 72 - "shell.ts"
Cohesion: 0.09
Nodes (35): ScheduleShellNotifier, attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label() (+27 more)

### Community 73 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 74 - "oracle-voice-routes.ts"
Cohesion: 0.10
Nodes (31): nodeVoiceCapabilities(), OracleVoiceManager, limits(), ActiveConversation, availableCapabilities(), backendOutputRelay(), browserCloseCode(), closeReason() (+23 more)

### Community 75 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 76 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (34): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), canTakeFocus() (+26 more)

### Community 77 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 78 - "manager-context.ts"
Cohesion: 0.11
Nodes (31): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+23 more)

### Community 79 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (18): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+10 more)

### Community 80 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (38): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, eventId(), hasExactKeys(), isDisposition(), isEventKind() (+30 more)

### Community 81 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 82 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 83 - "KnowledgeStore"
Cohesion: 0.11
Nodes (15): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+7 more)

### Community 84 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (22): FakeVoiceEngineCall, VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), connect(), createManager() (+14 more)

### Community 85 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 86 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 87 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 88 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (26): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger(), canonicalPath() (+18 more)

### Community 89 - "agent-service.test.ts"
Cohesion: 0.09
Nodes (16): terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), DeferredSession, directories, FakeCopilotClient, normalSdkSessionConfiguration (+8 more)

### Community 90 - "PushNotificationService"
Cohesion: 0.13
Nodes (8): start(), PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 91 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (31): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse(), pastedPlaceholderCount() (+23 more)

### Community 92 - "ScheduleForm.tsx"
Cohesion: 0.12
Nodes (27): scheduleProposalSummary(), scheduleProviderUnavailableReason(), ScheduleTarget, FolderPicker(), browse(), editableSchedule(), recurrenceSummary(), runDuration() (+19 more)

### Community 93 - "react"
Cohesion: 0.10
Nodes (16): react, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions(), ContextRing(), QueuedPromptList(), SendControl() (+8 more)

### Community 94 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (30): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+22 more)

### Community 95 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (33): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+25 more)

### Community 96 - "manager-structured-memory-search.ts"
Cohesion: 0.10
Nodes (28): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+20 more)

### Community 97 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 98 - "use-markdown-document.ts"
Cohesion: 0.11
Nodes (23): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+15 more)

### Community 99 - "VoiceClientControl"
Cohesion: 0.15
Nodes (16): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError() (+8 more)

### Community 100 - "oracle-voice-routes.test.ts"
Cohesion: 0.08
Nodes (16): exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), ObservedLocalVoiceBackend, openApps, openSockets, RouteManager (+8 more)

### Community 101 - "active-sessions.ts"
Cohesion: 0.13
Nodes (24): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+16 more)

### Community 102 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 103 - "push-notification-service.ts"
Cohesion: 0.10
Nodes (21): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+13 more)

### Community 104 - "pipeline.ts"
Cohesion: 0.11
Nodes (27): holdingRenderer(), openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), documentOpening(), documentParts(), documentRenderEvents() (+19 more)

### Community 105 - "notification-center-service.ts"
Cohesion: 0.10
Nodes (24): NotificationCursors, booleanQuery, filters, params, cursorSchema, durableState(), identity, kind (+16 more)

### Community 106 - ".sendInternal"
Cohesion: 0.15
Nodes (21): backgroundShellsAllow(), busyOnlyWithBackgroundShells(), busyRowStatus(), captureForReplacement(), capturePane(), composerHoldsText(), composerText(), hasComposerAfter() (+13 more)

### Community 107 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (17): resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+9 more)

### Community 108 - "capture-workspace.ts"
Cohesion: 0.13
Nodes (24): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+16 more)

### Community 109 - "ComputerSummary"
Cohesion: 0.11
Nodes (5): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation, ComputerSummary

### Community 110 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 111 - "scheduler-dispatcher.ts"
Cohesion: 0.11
Nodes (18): enableSchedulerTools(), NoopScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS, SchedulerDispatcherOptions, ScheduleStopAcknowledgement, ScheduleTargetUnavailableError (+10 more)

### Community 112 - "notification-classifier.ts"
Cohesion: 0.16
Nodes (21): attentionClosed(), attentionSeed(), classifyHostNotification(), classifyHubNotification(), classifyOracleNotification(), classifyScheduleNotification(), HOST_ALERT_COOLDOWN_MS, HOST_ALERT_MEMORY_DURATION_MS (+13 more)

### Community 113 - "DialogFrame.tsx"
Cohesion: 0.12
Nodes (20): addComputer(), changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame() (+12 more)

### Community 114 - "session-directory.ts"
Cohesion: 0.19
Nodes (19): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+11 more)

### Community 115 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 116 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 117 - "renderer.ts"
Cohesion: 0.11
Nodes (14): render, scope, DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), defaultDocumentRenderer(), DocumentRenderer, RendererWorker (+6 more)

### Community 118 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (24): advance(), connections, content(), FrameMeasurement, lastHeading(), message(), open(), percentile() (+16 more)

### Community 119 - "registerSessionKnowledgeRoutes"
Cohesion: 0.14
Nodes (21): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+13 more)

### Community 120 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 121 - "server/skill-settings.ts"
Cohesion: 0.17
Nodes (15): frontmatterFields(), frontmatterReason(), readBounded(), revision(), applications, directories, fixture(), scalar() (+7 more)

### Community 122 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 123 - ".replyUserInputInternal"
Cohesion: 0.18
Nodes (5): isUncertainDelivery(), persistedFormAnswer(), terminalAnswerRefused(), validateUserInputForm(), TerminalFormReplyError

### Community 124 - "ManagerProactiveInbox"
Cohesion: 0.17
Nodes (8): ManagerProactiveInbox, ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, nowIso(), openInbox()

### Community 125 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 126 - "src/settings-profile.ts"
Cohesion: 0.12
Nodes (19): SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey, CachedProfile (+11 more)

### Community 127 - "HostTelemetrySampler"
Cohesion: 0.15
Nodes (5): cpuUtilization(), parseMeminfo(), HostTelemetrySampler, HostMinuteAggregate, HostSample

### Community 128 - "reader.ts"
Cohesion: 0.15
Nodes (17): detectWsl(), parseDataMount(), createLinuxHostTelemetryReader(), errorCode(), HostTelemetryProcFile, hostTelemetryProcFiles, HostTelemetryReaderOptions, HostTelemetryReading (+9 more)

### Community 129 - "ManagerStructuredMemoryStore"
Cohesion: 0.24
Nodes (5): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState

### Community 130 - "sections.tsx"
Cohesion: 0.14
Nodes (15): AppearanceSetting, SettingScope(), accentThemes, appearanceOptions, notificationScopeOptions, navigableSettingsSections, schedulerSettingsSection, SettingsSection (+7 more)

### Community 131 - "ChatMessage"
Cohesion: 0.15
Nodes (12): Connection, Client, PatchSocket, Browser, seedOffset, session(), StoredSession, ChatMessage (+4 more)

### Community 132 - "workspace-browser.ts"
Cohesion: 0.20
Nodes (17): validateKnowledgeRoot(), assertOpenedFilePath(), fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath() (+9 more)

### Community 133 - "normalizeKnowledgeRelativePath"
Cohesion: 0.18
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+10 more)

### Community 134 - "SessionStatus"
Cohesion: 0.11
Nodes (19): Seen, ManagerProactiveInboxObservation, PersistedCursor, NotificationCursor, Row, SdkRestartRecovery, SessionExecutionMode, SessionStatus (+11 more)

### Community 135 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 136 - "NotificationRecord"
Cohesion: 0.19
Nodes (15): NotificationRecord, FeatureEvent, listeners, publishFeatureEvent(), subscribeFeatureEvents(), NotificationGroup, notificationGroups(), NotificationTab (+7 more)

### Community 137 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 138 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 139 - "session-response-order.ts"
Cohesion: 0.15
Nodes (19): applyComputerSnapshot(), checkComputerConnections(), computerAdded(), computerRemoved(), discardUnpairedComputers(), forgetComputerKnowledge(), liftUnpairedTombstones(), tombstoneUnpairedSession() (+11 more)

### Community 140 - "markdown-navigation.ts"
Cohesion: 0.18
Nodes (19): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+11 more)

### Community 141 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 142 - "dreamer-service.ts"
Cohesion: 0.16
Nodes (18): DreamerPlanDraft, DreamerPlannerInput, boundedText(), DreamerPlannerExecutionInput, DreamerCoverageIncrement, DreamerPlanWithFingerprints, DreamerStoreSnapshot, DreamerStoreState (+10 more)

### Community 143 - "NotificationStore"
Cohesion: 0.21
Nodes (5): emptyState(), matchesNotification(), NotificationStore, setup(), NotificationFilter

### Community 144 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

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

### Community 149 - "SettingsProfileSnapshot"
Cohesion: 0.18
Nodes (9): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileStore, directories, store() (+1 more)

### Community 150 - "dreamer-schedule.ts"
Cohesion: 0.23
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 151 - "HostMonitorView.test.tsx"
Cohesion: 0.19
Nodes (14): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+6 more)

### Community 153 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 154 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (10): client(), delayQueueWrite(), disk, exec, gate(), holdQueueCommit(), NativeFixture, NativeRuntime (+2 more)

### Community 155 - "SessionOriginBadge.test.tsx"
Cohesion: 0.21
Nodes (11): SessionProvenance, readScheduleLink(), ScheduleLink, scheduleNotificationLabel(), sessionOriginDescription(), icons, labels, SessionOriginBadge() (+3 more)

### Community 156 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 157 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 158 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 159 - "settings-profile.test.ts"
Cohesion: 0.16
Nodes (5): settingsProfileCacheKey, SettingsProfileTransport, cached(), FakeHub, MemoryStorage

### Community 160 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 161 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 162 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 163 - "parsers.ts"
Cohesion: 0.21
Nodes (15): counter(), counterDelta(), CpuCounters, DeviceByteCounters, DeviceCounters, deviceRates(), isWholeDisk(), MemoryReading (+7 more)

### Community 164 - "session-resource-routes.test.ts"
Cohesion: 0.15
Nodes (9): node(), apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService (+1 more)

### Community 165 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 167 - "closed-session-sweeper.ts"
Cohesion: 0.17
Nodes (5): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS

### Community 168 - ".persist"
Cohesion: 0.21
Nodes (3): isAlreadyExists(), isMissing(), ManagerProactiveInboxRecoveryError

### Community 169 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 170 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 171 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 172 - "session-resource-providers.test.ts"
Cohesion: 0.20
Nodes (13): claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures (+5 more)

### Community 173 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 174 - "RuntimeStatus.tsx"
Cohesion: 0.27
Nodes (8): families, modelFamily, repositoryModels, RuntimeStatus(), session, glyphs, ModelFamilyIcon(), RuntimeModelName()

### Community 175 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 176 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 177 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 178 - "ShellNavigation.test.tsx"
Cohesion: 0.32
Nodes (6): ClientFeature, railEntries(), initials(), useDisplayName(), DisplayNameSetting(), ShellNavigation()

### Community 179 - "SessionNavigation.test.tsx"
Cohesion: 0.18
Nodes (12): actions, backgroundTasks, computers, hiddenVisibility, NavigationHarness(), offline, question, session (+4 more)

### Community 180 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 181 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 182 - ".initialize"
Cohesion: 0.22
Nodes (5): initializeManagerStructuredMemory(), isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, open()

### Community 183 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 184 - "recently-closed.pw.ts"
Cohesion: 0.23
Nodes (9): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), open(), row() (+1 more)

### Community 185 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 186 - "sampler.ts"
Cohesion: 0.18
Nodes (11): HostTelemetryReader, HOST_TELEMETRY_ACTIVE_INTERVAL_MS, HOST_TELEMETRY_IDLE_INTERVAL_MS, HOST_TELEMETRY_SAMPLE_TIMEOUT_MS, HostTelemetrySamplerOptions, HostTelemetrySamplerStatus, MetricAccumulator, SamplingAttempt (+3 more)

### Community 187 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 189 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 190 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 191 - "fixture-frontend.ts"
Cohesion: 0.24
Nodes (6): root, script, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend()

### Community 192 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 194 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 195 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 196 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 197 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 198 - "notification-center.integration.test.ts"
Cohesion: 0.22
Nodes (7): center(), directories, directory(), hub(), now, runtimes, trusted

### Community 199 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 200 - "remarkSafeBreaks"
Cohesion: 0.29
Nodes (5): remarkSafeBreaks(), markdown(), SideQuestionEntry, SideQuestionPanel(), SideThread

### Community 201 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 202 - "oracle-status.ts"
Cohesion: 0.50
Nodes (8): bytes(), HOST_STATUS_MAX_COMPUTERS, number(), oracleHostStatus(), owner(), processes(), summary(), text()

### Community 203 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 204 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 205 - "tmux-errors.test.ts"
Cohesion: 0.25
Nodes (6): directories, { execute }, files, links, listener(), server()

### Community 206 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 207 - "askSideQuestion"
Cohesion: 0.33
Nodes (7): askSideQuestion(), closeSideQuestion(), openSideQuestion(), sideQuestionKeyDown(), submitSideQuestion(), updateSideThread(), sideQuestionCommand()

### Community 208 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 209 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 210 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 211 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 212 - "session-admission-lifecycle.test.ts"
Cohesion: 0.29
Nodes (6): deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases

### Community 213 - "shared/skill-settings.ts"
Cohesion: 0.32
Nodes (5): SKILL_SETTINGS_CAPABILITY, skillFrontmatterNameSchema, skillNameSchema, skillSettingsSchema, skillToggleSchema

### Community 214 - "closed-sessions.ts"
Cohesion: 0.39
Nodes (5): closedSessionContext(), excerpt(), isClosedSessionContext(), said(), ClosedSessionContext

### Community 215 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 216 - "KnowledgePosition"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 217 - "skill-settings-jsonc.ts"
Cohesion: 0.48
Nodes (5): instrument(), document(), parseSkillSettings(), replaceDisabledSkills(), Token

### Community 218 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 220 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 221 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 222 - "useHostMonitor"
Cohesion: 0.52
Nodes (7): incompatibilityMessage(), useHostMonitor(), accept(), connect(), poll(), reconnect(), requireUpdate()

### Community 223 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 225 - "recovery-context.ts"
Cohesion: 0.47
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 226 - "session-provenance.ts"
Cohesion: 0.47
Nodes (5): isSession(), SessionIdentity, sessionProvenanceProjection(), project(), reply()

### Community 227 - "hasActiveBackgroundTasks"
Cohesion: 0.60
Nodes (3): hasActiveBackgroundTasks(), hasForegroundTurn(), hasRunningBackgroundAgent()

### Community 228 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 229 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 230 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1420 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1415 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2377 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `TerminalSessionController`, `SessionStore`, `SessionDetail`, `.get`, `claude-agent-service.ts`, `session-directory.ts`, `session-store-providers.test.ts`, `.handleSessionEvent`, `.replyUserInputInternal`, `.publishError`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `backgroundShellsEvidence()` connect `.handleSessionEvent` to `background-task-adapter.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1420 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.033908087439578675 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.02810285805270281 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.02907071696880614 - nodes in this community are weakly interconnected._
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
