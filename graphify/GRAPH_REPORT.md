# Agentic Remote - Graphify code map

Snapshot: `003fdd12cd7ec7b9fde8da60cb71ac0121b5d9a55bb2f2eb839de3abe2217b48`

Source checkout: `c6069a8d6ea4ee93d81919f7091ddf948f986a78`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 633 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 633 files · ~1,124,220 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 8864 nodes · 25615 edges · 276 communities (229 shown, 29 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1295 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AppWorkspace
- AgentService
- SessionStore
- api.ts
- ClaudeAgentService
- App.tsx
- computer-manager.ts
- sessionKey
- host-telemetry.ts
- multi-node.test.ts
- ManagerStore
- remote-node-client.ts
- manager-tools.ts
- registerHubRoutes
- OracleVoiceCoordinator
- dreamer-store.ts
- agentic-remote-promotion-monitor
- react
- CopilotSessionLike
- oracle-voice-child.ts
- terminal-session.ts
- oracle-voice-soak.ts
- ManagerAgent
- client.ts
- notification-center-service.ts
- VoiceAudioFrame
- AppSettingsDialog.tsx
- terminal-startup-queue.test.ts
- active-sessions.ts
- oracle-voice-integration.test.ts
- oracle-voice-security.test.ts
- fake-voice.ts
- oracle-task-store.ts
- CopilotClientLike
- manager.ts
- agent-service.ts
- RemoteNodeClient
- setupWorkspaceFixture
- ProviderSessionService
- oracle-voice-worker.ts
- .handleSessionEvent
- node-routes.ts
- manager-structured-memory-validation.ts
- SessionDetail
- ScheduleRun
- dreamer-service.ts
- manager-agent.ts
- TmuxTerminalSessionController
- session-knowledge-store.ts
- DreamerService
- notification-classifier.ts
- oracle-voice.ts
- contracts.ts
- oracle-voice-benchmark.ts
- hub-routes.ts
- FakeVoiceEngine
- SessionService
- PushNotificationService
- oracle-voice-session.ts
- OracleDreamer.tsx
- .sendInternal
- ManagerAssistant.tsx
- agentic-remote
- KnowledgeStore
- manager-proactive-coordinator.ts
- app.ts
- dreamer-progress.ts
- send-matrix.integration.test.ts
- SchedulerStore
- agentic-remote-gate
- processes.ts
- bundle
- server/skill-settings.ts
- shell.ts
- VoicePlayback
- schedule-recurrence.ts
- workspace-fixtures.ts
- delegated-transcription-service.ts
- oracle-voice-routes.ts
- ScheduleForm.tsx
- lib.rs
- ui-scenes.ts
- TerminalSessionController
- normalizeKnowledgeRelativePath
- dependencies
- oracle-voice-config.ts
- manager-agent.test.ts
- client.test.ts
- agentic-remote-promotion-setup
- SessionOrderStore
- devDependencies
- config.rs
- real-voice.ts
- ManagedSession
- shared/settings-profile.ts
- session-directory.ts
- NodeIdentityStore
- scheduler-store.ts
- manager-proactive-inbox.ts
- manager-structured-memory.ts
- remote-voice-client.ts
- schedule-proposals.ts
- oracle-voice-routes.test.ts
- oracle-voice-child.test.ts
- oracle-voice-segments.ts
- registerSessionKnowledgeRoutes
- pwa.ts
- capture-workspace.ts
- ManagerAttachment
- workspace-browser.ts
- terminal-session.test.ts
- ManagerAssistant.test.tsx
- check-workspace-review-regressions.ts
- use-oracle-conversation.test.tsx
- Composer.tsx
- session-patch-browser.ts
- cli-canary.ts
- scripts
- DialogFrame.tsx
- background-task-adapter.ts
- sampler.ts
- manager-structured-memory-search.ts
- transcription-service.ts
- session-provenance.test.ts
- use-markdown-document.ts
- compilerOptions
- agent-service.test.ts
- backgroundTasksFromEvents
- session-resource-providers.test.ts
- ManagerStructuredMemoryStore
- oracle-voice-coordinator.test.ts
- src/settings-profile.ts
- SettingsProfileClient
- capture-workbench-review.ts
- HubEvent
- startup-phases.test.ts
- session-reply-durability.test.ts
- oracle-voice-tickets.ts
- refusal-metrics.ts
- SettingsProfileSnapshot
- pipeline.ts
- compilerOptions
- full-gate.test.ts
- session-store-providers.test.ts
- compilerOptions
- ManagerProactiveInbox
- schedule-notification-service.test.ts
- OnlineRecognizer
- markdown-navigation.ts
- MessageTime.tsx
- compilerOptions
- VoiceBackendSession
- compilerOptions
- ManagerMemory
- session-latency-benchmark.ts
- dreamer-schedule.ts
- reader.ts
- HostMonitorView.test.tsx
- promotion-monitor.test.ts
- knowledge-tree.ts
- NotificationPanel.tsx
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- .sendAdmittedMessage
- HostTelemetrySampler
- terminal-form-deadline.test.ts
- parsers.test.ts
- closed-session-sweeper.ts
- renderer.ts
- package.json
- background-task-stop.test.ts
- oracle-voice-assets.test.ts
- session-resource-routes.test.ts
- RuntimeStatus.tsx
- use-markdown-document.test.tsx
- pipeline.test.tsx
- fake-vad.ts
- desktop.json
- recordValue
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- dreamer-service.test.ts
- .observe
- manager-proactive-inbox.test.ts
- BackgroundTasksDialog.tsx
- Pcm16Resampler
- pending-echo.ts
- background-task-tracker.ts
- copilot-sdk-client.ts
- dreamer-routes.ts
- ManagerStructuredMemoryRuntime
- ChatMessage
- recovery-seed-guards.test.ts
- SessionAdmissions
- html-preview.ts
- sign-in-expired.pw.ts
- .askSession
- DeferredSession
- settings-profile-routes.ts
- isRecord
- .initialize
- use-oracle-attachments.ts
- dataset
- generate-pwa-icons.ts
- agent-service-recovery.test.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- vite.config.ts
- logs-cli.test.ts
- manager-structured-memory-performance.test.ts
- promotion-setup-execution.test.ts
- SkillsSettings.tsx
- askSideQuestion
- sent-message.ts
- doctor-cli.test.ts
- release-publication.test.ts
- session-patch-routes.test.ts
- closed-sessions.ts
- UserInputFieldControl
- settings-profile.test.ts
- file-upload-routes.ts
- history-projection.test.ts
- HostTelemetryClock
- settings.ts
- DocumentViewControls.tsx
- useHostMonitor
- .transport
- composer-layout.test.ts
- HostAlertMonitor
- hasActiveBackgroundTasks
- worker-handler.ts
- dreamer-app.test.ts
- promotion-setup.test.ts
- FakeRecorder
- .discoverTerminalSessions
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- MermaidDiagram.tsx
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
- `instrument()` --indirect_call--> `document()`  [INFERRED]
  e2e/session-patch-browser.ts → server/skill-settings-jsonc.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (276 total, 29 thin omitted)

### Community 0 - "AppWorkspace"
Cohesion: 0.02
Nodes (218): isManagerEvent(), terminalSendOptions(), sessionFileValidationError(), turnEnded(), submissionReceiptFromError(), replyPermission(), saveHiddenSessionVisibility(), saveSessionVisibility() (+210 more)

### Community 1 - "AgentService"
Cohesion: 0.04
Nodes (11): agentMode(), AgentService, isRuntimeReasoningEffort(), lifecycleRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, suspendedRuntimeConflict(), suspendRefused() (+3 more)

### Community 2 - "SessionStore"
Cohesion: 0.02
Nodes (110): fixture(), restart(), directories, fakeClient(), fixture(), ForkRequest, forkSession(), services (+102 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (135): SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), activateSession(), addKnowledgeRoot(), askSession(), bootstrapSessionOrder() (+127 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (8): isTerminalNotReadyRefusal(), sessionInUseConflictMessage(), terminalAnswerRefused(), ClaudeAgentService, isMissingClaudeSessionError(), toolResultText(), queueConflict(), copilotRequest()

### Community 5 - "App.tsx"
Cohesion: 0.03
Nodes (91): executeCommand(), activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), moveSessionToBrowsedFolder() (+83 more)

### Community 6 - "computer-manager.ts"
Cohesion: 0.05
Nodes (78): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+70 more)

### Community 7 - "sessionKey"
Cohesion: 0.04
Nodes (89): CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), BackgroundTaskSnapshot, listClosedSessions(), cancelSelectedBackgroundTask(), changeSessionUnread(), deleteClosedSession(), handleDragEnd() (+81 more)

### Community 8 - "host-telemetry.ts"
Cohesion: 0.04
Nodes (68): BuildAppOptions, HOST_ALERT_POLL_INTERVAL_MS, bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner() (+60 more)

### Community 9 - "multi-node.test.ts"
Cohesion: 0.03
Nodes (40): AgentServiceEvents, ClaudeAgentServiceEvents, directories, FakeSessionService, routingFixture(), session(), temporaryDirectory(), voiceControlQueues (+32 more)

### Community 10 - "ManagerStore"
Cohesion: 0.04
Nodes (37): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+29 more)

### Community 11 - "remote-node-client.ts"
Cohesion: 0.04
Nodes (61): ClaudeSdk, awaitTermination(), LaunchCreations, apps, directories, directory(), runtime(), services (+53 more)

### Community 12 - "manager-tools.ts"
Cohesion: 0.04
Nodes (47): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), changeSuspension() (+39 more)

### Community 13 - "registerHubRoutes"
Cohesion: 0.08
Nodes (11): ComputerManager, managedSession(), mapWithConcurrency(), fixture(), session(), sessionAtLeastAsNew(), registerHubRoutes(), createHub() (+3 more)

### Community 14 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (21): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+13 more)

### Community 15 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (48): publicSnapshot(), assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+40 more)

### Community 16 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 17 - "react"
Cohesion: 0.07
Nodes (51): react, SessionProvenance, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable() (+43 more)

### Community 18 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (35): CopilotSessionLike, isClaudeAuthenticationError(), nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused() (+27 more)

### Community 19 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (39): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+31 more)

### Community 20 - "terminal-session.ts"
Cohesion: 0.05
Nodes (76): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerHoldsOtherText() (+68 more)

### Community 21 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 22 - "ManagerAgent"
Cohesion: 0.08
Nodes (14): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+6 more)

### Community 23 - "client.ts"
Cohesion: 0.07
Nodes (26): SocketMessage, connect(), Inbox, ORACLE_VOICE_CONNECTION_TIMEOUT_MS, VoiceServerControl, captureClientError(), clientError(), closeError() (+18 more)

### Community 24 - "notification-center-service.ts"
Cohesion: 0.06
Nodes (38): center(), directories, directory(), hub(), now, runtimes, trusted, NotificationCenterService (+30 more)

### Community 25 - "VoiceAudioFrame"
Cohesion: 0.06
Nodes (25): VoiceAudioFrame, BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl (+17 more)

### Community 26 - "AppSettingsDialog.tsx"
Cohesion: 0.06
Nodes (63): RuntimeModelOption, NotificationScope, AppearanceSetting, NewSessionBackendSetting, getProviderRuntimeOptions(), shortcutKeys(), readStoredShortcuts(), AppShortcutBinding (+55 more)

### Community 27 - "terminal-startup-queue.test.ts"
Cohesion: 0.06
Nodes (55): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, client(), delayQueueWrite() (+47 more)

### Community 28 - "active-sessions.ts"
Cohesion: 0.06
Nodes (54): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+46 more)

### Community 29 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+24 more)

### Community 30 - "oracle-voice-security.test.ts"
Cohesion: 0.04
Nodes (32): voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngineCall, FakeVoiceEngineFactory, config, VoiceEndUtterance, VoiceEngineEvent, VoiceEngineFactory (+24 more)

### Community 31 - "fake-voice.ts"
Cohesion: 0.05
Nodes (11): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice() (+3 more)

### Community 32 - "oracle-task-store.ts"
Cohesion: 0.08
Nodes (43): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+35 more)

### Community 33 - "CopilotClientLike"
Cohesion: 0.04
Nodes (43): root, script, CopilotClientLike, fixtures, recoverAndSeed(), releases, directories, disk (+35 more)

### Community 34 - "manager.ts"
Cohesion: 0.05
Nodes (43): CreationRuntime, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams (+35 more)

### Community 35 - "agent-service.ts"
Cohesion: 0.04
Nodes (55): AcceptedSdkReply, ActivePrompt, ActivityToolStart, ansiSequence, commandShortcut(), DeliveryBoundary, ElicitationContext, ElicitationHandler (+47 more)

### Community 36 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (17): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, requestBytes(), client(), servers, session (+9 more)

### Community 37 - "setupWorkspaceFixture"
Cohesion: 0.04
Nodes (30): desktop, devices, long, open(), phone, veryLong, bounds(), closedEarlier (+22 more)

### Community 38 - "ProviderSessionService"
Cohesion: 0.06
Nodes (3): updateComputerForLaunchIdentity(), ProviderSessionService, AgentProviderCapability

### Community 39 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (24): benchmarkGroup(), VoiceTtsEngine, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent(), isEnabledConfig() (+16 more)

### Community 40 - ".handleSessionEvent"
Cohesion: 0.08
Nodes (34): activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength() (+26 more)

### Community 41 - "node-routes.ts"
Cohesion: 0.06
Nodes (39): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+31 more)

### Community 42 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 43 - "SessionDetail"
Cohesion: 0.07
Nodes (8): observe(), directories, now, assertSessionNotRetained(), clearRecoverySeedFailure(), ownsRecoverySeedFailure(), QueuedPrompt, SessionDetail

### Community 44 - "ScheduleRun"
Cohesion: 0.12
Nodes (12): provenance(), SessionScheduleLauncher, session(), ScheduleLauncher, ScheduleLaunchRefusedError, SchedulerDispatcher, ScheduleReconciliation, registerSchedulerRoutes() (+4 more)

### Community 45 - "dreamer-service.ts"
Cohesion: 0.07
Nodes (46): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+38 more)

### Community 46 - "manager-agent.ts"
Cohesion: 0.07
Nodes (44): DreamerProgressEntry, DreamerProgressView, automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung (+36 more)

### Community 47 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (15): startAgentAfterClear(), afterExit(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors() (+7 more)

### Community 48 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+22 more)

### Community 49 - "DreamerService"
Cohesion: 0.11
Nodes (15): boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), safeRunError(), unavailableSnapshot(), uniqueSessionRefs() (+7 more)

### Community 50 - "notification-classifier.ts"
Cohesion: 0.08
Nodes (40): computer, observe(), snapshot(), start, sustained(), attentionClosed(), attentionSeed(), classifyHostNotification() (+32 more)

### Community 51 - "oracle-voice.ts"
Cohesion: 0.08
Nodes (41): VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities, closeServers, exactArrayBuffer(), sockets (+33 more)

### Community 52 - "contracts.ts"
Cohesion: 0.05
Nodes (39): TerminalFormContinuation, ActivityStatus, AddKnowledgeRootInput, BackgroundTaskAttachmentMode, BackgroundTaskExecutionMode, DispatchQueuedPromptInput, ExecuteCommandInput, MessageRole (+31 more)

### Community 53 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 54 - "hub-routes.ts"
Cohesion: 0.05
Nodes (41): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+33 more)

### Community 55 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (23): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+15 more)

### Community 56 - "SessionService"
Cohesion: 0.07
Nodes (5): closeReason(), closeVoiceSocket(), nodeVoiceCapabilities(), registerNodeRoutes(), SessionService

### Community 57 - "PushNotificationService"
Cohesion: 0.08
Nodes (14): start(), NotificationRecorder, HubEventSource, OracleEventSource, PushNotificationService, directories, scoped(), RFC-8030 (+6 more)

### Community 58 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (18): acquisitionCancelled(), ActiveUtterance, asSessionError(), AudioReservation, capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled() (+10 more)

### Community 59 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (42): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition (+34 more)

### Community 60 - ".sendInternal"
Cohesion: 0.10
Nodes (40): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+32 more)

### Community 61 - "ManagerAssistant.tsx"
Cohesion: 0.07
Nodes (42): editQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), boundWidth() (+34 more)

### Community 62 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 63 - "KnowledgeStore"
Cohesion: 0.08
Nodes (23): ServerRole, SessionMetadataLookup, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions (+15 more)

### Community 64 - "manager-proactive-coordinator.ts"
Cohesion: 0.08
Nodes (14): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, ProactiveManager, SessionLifecycle (+6 more)

### Community 65 - "app.ts"
Cohesion: 0.07
Nodes (29): apps, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName() (+21 more)

### Community 66 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, DreamerProgressSource (+11 more)

### Community 67 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (40): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+32 more)

### Community 68 - "SchedulerStore"
Cohesion: 0.13
Nodes (7): fixture(), deferUnboundWorktree(), failure(), SchedulerStore, ScheduleProposal, Schedule, ScheduleRunStatus

### Community 69 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 70 - "processes.ts"
Cohesion: 0.08
Nodes (25): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessStat, expectProc(), ProcessFixture, processStatFixture() (+17 more)

### Community 71 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 72 - "server/skill-settings.ts"
Cohesion: 0.10
Nodes (25): frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills(), Token, readBounded(), revision() (+17 more)

### Community 73 - "shell.ts"
Cohesion: 0.09
Nodes (35): ScheduleShellNotifier, attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label() (+27 more)

### Community 74 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 75 - "schedule-recurrence.ts"
Cohesion: 0.10
Nodes (38): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+30 more)

### Community 76 - "workspace-fixtures.ts"
Cohesion: 0.09
Nodes (36): oracleHostStatusFixture(), documents, fixtureBackgroundTasks, fixtureComputers, fixtureEndpoints, fixtureHostHistory, fixtureHostProcesses, fixtureHostSnapshot (+28 more)

### Community 77 - "delegated-transcription-service.ts"
Cohesion: 0.09
Nodes (15): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+7 more)

### Community 78 - "oracle-voice-routes.ts"
Cohesion: 0.10
Nodes (33): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+25 more)

### Community 79 - "ScheduleForm.tsx"
Cohesion: 0.10
Nodes (30): scheduleProposalSummary(), CLAUDE_SCHEDULE_UNAVAILABLE_REASON, ScheduleTarget, FeatureEvent, listeners, publishFeatureEvent(), FolderPicker(), browse() (+22 more)

### Community 80 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 81 - "ui-scenes.ts"
Cohesion: 0.09
Nodes (24): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+16 more)

### Community 82 - "TerminalSessionController"
Cohesion: 0.09
Nodes (3): persistedFormAnswer(), TerminalFormReplyError, TerminalSessionController

### Community 83 - "normalizeKnowledgeRelativePath"
Cohesion: 0.09
Nodes (32): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+24 more)

### Community 84 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 85 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (28): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+20 more)

### Community 86 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (18): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+10 more)

### Community 87 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 88 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 89 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 90 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 91 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 92 - "real-voice.ts"
Cohesion: 0.08
Nodes (14): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+6 more)

### Community 93 - "ManagedSession"
Cohesion: 0.10
Nodes (10): RemoteSessionListing, ManagerHub, SessionLaunch, SessionLauncherOptions, SessionPromptTarget, ManagedSession, SessionListing, closed (+2 more)

### Community 94 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (33): WorkspaceFixtureState, SettingsProfileState, AccentSetting, appearanceSettings, applySettingsChanges(), applySettingsImport(), DEFAULT_SESSION_PROVIDER, isRecord() (+25 more)

### Community 95 - "session-directory.ts"
Cohesion: 0.13
Nodes (23): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath() (+15 more)

### Community 96 - "NodeIdentityStore"
Cohesion: 0.09
Nodes (16): connections, managers, releases, remote, ComputerRegistry, DurableRegisteredComputer, LegacyRegisteredComputer, LegacyRegistryState (+8 more)

### Community 97 - "scheduler-store.ts"
Cohesion: 0.08
Nodes (24): enableSchedulerTools(), NoopScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS, SchedulerDispatcherOptions, ScheduleStopAcknowledgement, ScheduleTargetUnavailableError (+16 more)

### Community 98 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (34): assertExactKeys(), cloneState(), DISPOSITIONS, hasExactKeys(), isDisposition(), isEventKind(), isId(), isOrigin() (+26 more)

### Community 99 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 100 - "remote-voice-client.ts"
Cohesion: 0.16
Nodes (14): VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+6 more)

### Community 101 - "schedule-proposals.ts"
Cohesion: 0.12
Nodes (28): action, create, existing, metadata, scheduleProposalInputSchema, ScheduleProposalsChanged, scheduleProposalSchema, update (+20 more)

### Community 102 - "oracle-voice-routes.test.ts"
Cohesion: 0.08
Nodes (12): FakeManager, createManager(), StoredManager, openApps, openSockets, RouteManager, runtime(), testRoot() (+4 more)

### Community 103 - "oracle-voice-child.test.ts"
Cohesion: 0.09
Nodes (12): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+4 more)

### Community 104 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 105 - "registerSessionKnowledgeRoutes"
Cohesion: 0.11
Nodes (22): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+14 more)

### Community 106 - "pwa.ts"
Cohesion: 0.14
Nodes (26): getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), activatePwaUpdate(), activePushSubscription(), applicationServerKey(), checkForPwaUpdate(), clearPushNotifications() (+18 more)

### Community 107 - "capture-workspace.ts"
Cohesion: 0.13
Nodes (24): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+16 more)

### Community 108 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 109 - "workspace-browser.ts"
Cohesion: 0.13
Nodes (23): directories, runtimes, start(), trusted, validateKnowledgeRoot(), assertOpenedFilePath(), fileKind(), imageMimeTypes (+15 more)

### Community 110 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (23): isTerminalVisiblyIdle(), parseTerminalUpdateNotice(), terminalFormCommitKeys(), bracketedTabPane, deliveryFixture(), desktopInstallPane, directories, downloadedUpdateFooter (+15 more)

### Community 111 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (16): cancelManager(), removeQueuedManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+8 more)

### Community 112 - "check-workspace-review-regressions.ts"
Cohesion: 0.07
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 113 - "use-oracle-conversation.test.tsx"
Cohesion: 0.12
Nodes (13): getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability, defaults (+5 more)

### Community 114 - "Composer.tsx"
Cohesion: 0.13
Nodes (12): AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions(), ContextRing(), QueuedPromptList(), SendControl(), TriggerProps (+4 more)

### Community 115 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 116 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 117 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 118 - "DialogFrame.tsx"
Cohesion: 0.12
Nodes (20): addComputer(), changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame() (+12 more)

### Community 119 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (23): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, CopilotTasksApi, isBackgroundTaskInfo(), isBackgroundTaskProgress() (+15 more)

### Community 120 - "sampler.ts"
Cohesion: 0.12
Nodes (24): counter(), counterDelta(), CpuCounters, cpuUtilization(), DeviceByteCounters, DeviceCounters, deviceRates(), isWholeDisk() (+16 more)

### Community 121 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 122 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 123 - "session-provenance.test.ts"
Cohesion: 0.13
Nodes (14): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, isSession(), SessionIdentity (+6 more)

### Community 124 - "use-markdown-document.ts"
Cohesion: 0.16
Nodes (19): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+11 more)

### Community 125 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 126 - "agent-service.test.ts"
Cohesion: 0.13
Nodes (13): terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+5 more)

### Community 127 - "backgroundTasksFromEvents"
Cohesion: 0.18
Nodes (24): addActivity(), attachmentModeValue(), backgroundTasksFromEvents(), boundedText(), eventString(), eventTask(), executionModeValue(), isOlderExecution() (+16 more)

### Community 128 - "session-resource-providers.test.ts"
Cohesion: 0.11
Nodes (18): cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), claudeFixture(), ClaudeMcpRead (+10 more)

### Community 129 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 130 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 131 - "src/settings-profile.ts"
Cohesion: 0.12
Nodes (21): isSettingsDeviceId(), isSettingsRevision(), NewSessionRuntime, sameSettingValue(), SETTINGS_MAX_COMPUTERS, settingsProfileKeys, statuslineItems, CachedProfile (+13 more)

### Community 132 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 133 - "capture-workbench-review.ts"
Cohesion: 0.10
Nodes (15): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, fixtureSessions (+7 more)

### Community 134 - "HubEvent"
Cohesion: 0.15
Nodes (11): Connection, ComputerManagerEvents, Client, PatchSocket, Browser, seedOffset, session(), HubEvent (+3 more)

### Community 135 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (15): phases, port, app(), directories, headers, launcher, createStartupPhases(), startManagedServer() (+7 more)

### Community 136 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+10 more)

### Community 137 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 138 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 139 - "SettingsProfileSnapshot"
Cohesion: 0.15
Nodes (10): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileStore, directories, store() (+2 more)

### Community 140 - "pipeline.ts"
Cohesion: 0.15
Nodes (21): holdingRenderer(), openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), documentOpening(), documentParts(), documentRenderEvents() (+13 more)

### Community 141 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 142 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 143 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 144 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 145 - "ManagerProactiveInbox"
Cohesion: 0.22
Nodes (4): ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, nowIso(), openInbox()

### Community 146 - "schedule-notification-service.test.ts"
Cohesion: 0.18
Nodes (6): ScheduleNotificationService, input(), now, run(), ScheduleRunNotification, SchedulerChanged

### Community 147 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 148 - "markdown-navigation.ts"
Cohesion: 0.19
Nodes (18): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+10 more)

### Community 149 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 150 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 151 - "VoiceBackendSession"
Cohesion: 0.13
Nodes (9): ActiveBackendSession, exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), ObservedLocalVoiceBackend, RouteVoiceBackend, VoiceBackendSession (+1 more)

### Community 152 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 153 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 154 - "session-latency-benchmark.ts"
Cohesion: 0.22
Nodes (17): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+9 more)

### Community 155 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 156 - "reader.ts"
Cohesion: 0.17
Nodes (14): detectWsl(), parseDataMount(), createLinuxHostTelemetryReader(), errorCode(), HostTelemetryProcFile, HostTelemetryReader, HostTelemetryReaderOptions, HostTelemetryReading (+6 more)

### Community 157 - "HostMonitorView.test.tsx"
Cohesion: 0.19
Nodes (14): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+6 more)

### Community 158 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 159 - "knowledge-tree.ts"
Cohesion: 0.20
Nodes (15): knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs(), KnowledgeFolders (+7 more)

### Community 160 - "NotificationPanel.tsx"
Cohesion: 0.21
Nodes (12): subscribeFeatureEvents(), NotificationGroup, notificationGroups(), NotificationTab, kindIcon(), NotificationPanel(), Inbox(), scheduleNotificationLabel() (+4 more)

### Community 161 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 162 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 163 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 164 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 167 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 168 - "parsers.test.ts"
Cohesion: 0.20
Nodes (12): prefixes, session, trusted, untrusted, hostTelemetryProcFiles, cpuFixture, diskstatsFixture, hostInfoFixture (+4 more)

### Community 169 - "closed-session-sweeper.ts"
Cohesion: 0.17
Nodes (5): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS

### Community 170 - "renderer.ts"
Cohesion: 0.18
Nodes (7): createWorkerRenderer(), defaultDocumentRenderer(), DocumentRendererContext, RendererWorker, synchronousRenderer, FakeWorker, startWorkers()

### Community 171 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 172 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 173 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 174 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 175 - "RuntimeStatus.tsx"
Cohesion: 0.27
Nodes (8): families, modelFamily, repositoryModels, RuntimeStatus(), session, glyphs, ModelFamilyIcon(), RuntimeModelName()

### Community 176 - "use-markdown-document.test.tsx"
Cohesion: 0.16
Nodes (7): drawnInParts(), DocumentRenderEvent, RenderedDocumentTree, DocumentRenderer, components, Reader(), show()

### Community 177 - "pipeline.test.tsx"
Cohesion: 0.20
Nodes (9): components, drawn(), drawnPage(), fixtures, html(), today(), rehypeDocumentHeadings(), remarkSafeBreaks() (+1 more)

### Community 178 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 179 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 180 - "recordValue"
Cohesion: 0.22
Nodes (14): backgroundHandoff(), booleanValue(), errorValue(), notificationKind(), parsedValue(), rawTailText(), recordValue(), shellIdFromFooter() (+6 more)

### Community 181 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 182 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 183 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 184 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 185 - ".observe"
Cohesion: 0.21
Nodes (7): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId()

### Community 186 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 187 - "BackgroundTasksDialog.tsx"
Cohesion: 0.26
Nodes (10): BackgroundTask, BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 188 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 189 - "pending-echo.ts"
Cohesion: 0.28
Nodes (9): nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes(), sameText() (+1 more)

### Community 190 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 191 - "copilot-sdk-client.ts"
Cohesion: 0.29
Nodes (9): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkMissingSessionRetirement, CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic() (+1 more)

### Community 192 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 193 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.23
Nodes (5): efforts, managerRuntimeSettings, ManagerStructuredMemoryRuntime, ManagerStructuredMemoryMode, ManagerStructuredMemoryStatus

### Community 194 - "ChatMessage"
Cohesion: 0.21
Nodes (10): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp(), StoredSession, ChatMessage (+2 more)

### Community 195 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 197 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 198 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 201 - "settings-profile-routes.ts"
Cohesion: 0.25
Nodes (8): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 202 - "isRecord"
Cohesion: 0.29
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 203 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 204 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 205 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 206 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 207 - "agent-service-recovery.test.ts"
Cohesion: 0.22
Nodes (6): holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents()

### Community 208 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 209 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 210 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 211 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 212 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.31
Nodes (6): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult

### Community 213 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 214 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 215 - "askSideQuestion"
Cohesion: 0.33
Nodes (7): askSideQuestion(), closeSideQuestion(), openSideQuestion(), sideQuestionKeyDown(), submitSideQuestion(), updateSideThread(), sideQuestionCommand()

### Community 216 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 217 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 218 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 219 - "session-patch-routes.test.ts"
Cohesion: 0.29
Nodes (5): apps, directories, FakeManager, fixture(), trusted

### Community 220 - "closed-sessions.ts"
Cohesion: 0.39
Nodes (5): closedSessionContext(), excerpt(), isClosedSessionContext(), said(), ClosedSessionContext

### Community 221 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 222 - "settings-profile.test.ts"
Cohesion: 0.29
Nodes (3): settingsProfileCacheKey, cached(), MemoryStorage

### Community 223 - "file-upload-routes.ts"
Cohesion: 0.43
Nodes (5): SessionParams, extension(), MAX_SESSION_FILE_BYTES, supportedExtensions, supportsSessionFile()

### Community 224 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 226 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 227 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 228 - "useHostMonitor"
Cohesion: 0.52
Nodes (7): incompatibilityMessage(), useHostMonitor(), accept(), connect(), poll(), reconnect(), requireUpdate()

### Community 230 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 232 - "hasActiveBackgroundTasks"
Cohesion: 0.60
Nodes (3): hasActiveBackgroundTasks(), hasForegroundTurn(), hasRunningBackgroundAgent()

### Community 233 - "worker-handler.ts"
Cohesion: 0.47
Nodes (4): render, scope, handleRenderRequest(), RenderRequest

### Community 234 - "dreamer-app.test.ts"
Cohesion: 0.40
Nodes (3): directories, runtimes, trusted

### Community 235 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 241 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **1421 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1416 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2375 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionStore`, `ClaudeAgentService`, `host-telemetry.ts`, `ManagerStore`, `refusal-metrics.ts`, `SettingsProfileSnapshot`, `registerHubRoutes`, `remote-node-client.ts`, `ManagerProactiveInbox`, `schedule-notification-service.test.ts`, `ManagerAgent`, `notification-center-service.ts`, `oracle-voice-security.test.ts`, `oracle-task-store.ts`, `manager.ts`, `HostTelemetrySampler`, `oracle-voice-worker.ts`, `ProviderSessionService`, `node-routes.ts`, `ScheduleRun`, `session-knowledge-store.ts`, `DreamerService`, `SessionService`, `PushNotificationService`, `KnowledgeStore`, `dreamer-routes.ts`, `manager-proactive-coordinator.ts`, `ManagerStructuredMemoryRuntime`, `SchedulerStore`, `server/skill-settings.ts`, `delegated-transcription-service.ts`, `oracle-voice-config.ts`, `manager-agent.test.ts`, `SessionOrderStore`, `NodeIdentityStore`, `scheduler-store.ts`, `HostAlertMonitor`, `cli-canary.ts`, `transcription-service.ts`, `session-provenance.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `NodeIdentityStore`, `remote-voice-client.ts`, `computer-manager.ts`, `host-telemetry.ts`, `node-routes.ts`, `multi-node.test.ts`, `remote-node-client.ts`, `server/skill-settings.ts`, `registerHubRoutes`, `contracts.ts`, `session-directory.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `ClaudeAgentService`, `.sendAdmittedMessage`, `computer-manager.ts`, `.handleSessionEvent`, `SessionDetail`, `CopilotSessionLike`, `TerminalSessionController`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1421 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.021422076741225676 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.037663159105284345 - nodes in this community are weakly interconnected._
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
