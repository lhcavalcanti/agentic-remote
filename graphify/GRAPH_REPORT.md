# Agentic Remote - Graphify code map

Snapshot: `a648091f8751858da5ae0a08a29bb27328e7d62b30e59eca64b287c77aabb509`

Source checkout: `ff897b3cf5e585702e804e03929c80815048af4a`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 652 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 652 files · ~1,155,829 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9133 nodes · 26298 edges · 270 communities (223 shown, 29 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1314 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionStore
- AppWorkspace
- api.ts
- agent-service.ts
- SessionDetail
- App.tsx
- oracle-voice-child.ts
- contracts.ts
- terminal-session.ts
- computer-manager.ts
- ManagedSession
- session-directory.ts
- session-presentation.ts
- ManagerStore
- agent-service.test.ts
- oracle-voice-soak.ts
- app.ts
- oracle-voice-session.ts
- agentic-remote-promotion-monitor
- oracle-voice.ts
- manager-tools.ts
- ManagerAgent
- terminal-session.test.ts
- ManagerMessage
- notification-center-service.ts
- dreamer-service.ts
- transcription-service.ts
- oracle-voice-worker.ts
- oracle-task-store.ts
- AppSettingsDialog.tsx
- AgentProvider
- OracleVoiceCoordinator
- queued-dispatch.test.ts
- client.ts
- tmux-errors.integration.test.ts
- RemoteNodeClient
- oracle-voice-integration.test.ts
- manager-structured-memory-validation.ts
- tmux-test-helpers.ts
- setupWorkspaceFixture
- sampler.ts
- controls.tsx
- background-task-adapter.ts
- scheduler-store.ts
- session-knowledge-store.ts
- pipeline.ts
- ui-locks.pw.ts
- workspace-fixtures.ts
- ProviderSessionService
- oracle-voice-benchmark.ts
- SchedulerStore
- TmuxTerminalSessionController
- SessionService
- VoiceAudioFrame
- fake-voice.ts
- ScheduleRun
- OracleDreamer.tsx
- SettingsProfileSnapshot
- agentic-remote
- OracleVoiceClient
- manager-agent.ts
- dreamer-progress.ts
- host-telemetry.ts
- processes.ts
- DreamerService
- composer-state.ts
- oracle-voice-routes.test.ts
- agentic-remote-gate
- bundle
- node-routes.ts
- session-resource-clear.test.ts
- service.ts
- oracle-voice-coordinator.ts
- oracle-voice-routes.ts
- dreamer-planner.ts
- PushNotificationService
- shell.ts
- lib.rs
- schedule-recurrence.ts
- ScheduleForm.tsx
- ManagerAssistant.tsx
- dependencies
- terminal-startup-queue.test.ts
- hub-routes.ts
- VoiceCapture
- client.test.ts
- agentic-remote-promotion-setup
- active-sessions.ts
- manager-agent.test.ts
- FakeVoiceEngine
- SessionOrderStore
- devDependencies
- config.rs
- ManagerEvent
- manager-proactive-coordinator.ts
- oracle-voice-config.ts
- .takeInTranscript
- KnowledgeStore
- schedule-launcher.test.ts
- manager-proactive-inbox.ts
- FakeSessionService
- EngineVoiceBackendSession
- BackgroundTasksDialog.tsx
- schedule-proposals.ts
- pipeline.test.tsx
- transcript-test-helpers.ts
- manager-context.ts
- manager-structured-memory.ts
- .sendInternal
- ChatMessage
- ManagerClientDefaults
- node:fs/promises
- shared/settings-profile.ts
- oracle-voice-segments.ts
- real-voice.ts
- DreamerStore
- feature-flags.ts
- ScheduleWorktreeService
- schedules.ts
- PromptCards.tsx
- recovery-resend-durability.test.ts
- ManagerAttachment
- src/settings-profile.ts
- transport.test.ts
- startup-phases.test.ts
- scheduler-dispatcher.ts
- capture-workspace.ts
- session-patch-browser.ts
- react
- cli-canary.ts
- scripts
- background-task-stop.test.ts
- registerSessionKnowledgeRoutes
- manager-structured-memory-search.ts
- SettingsProfileClient
- agent-service-event-projection.test.ts
- .toolHost
- ManagerAssistant.test.tsx
- compilerOptions
- closed-sessions.ts
- ManagerStructuredMemoryStore
- document-render.pw.ts
- sections.tsx
- oracle-voice-tickets.ts
- NotificationPanel.tsx
- compilerOptions
- full-gate.test.ts
- session-reply-durability.test.ts
- session-store-providers.test.ts
- ActivityDetails.tsx
- ActivityRow.test.tsx
- knowledge-tree.ts
- markdown-navigation.ts
- RuntimeModelOption
- terminal-form-deadline.test.ts
- compilerOptions
- normalizeKnowledgeRelativePath
- ManagerProactiveInbox
- OnlineRecognizer
- usePreviewFeature
- MessageTime.tsx
- compilerOptions
- compilerOptions
- session-resource-routes.test.ts
- ManagerMemory
- server/session-patches.ts
- dreamer-schedule.ts
- oracle-status.test.ts
- promotion-monitor.test.ts
- use-session-knowledge-root.ts
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- session-latency-benchmark.ts
- HostTelemetrySampler
- session-unread.pw.ts
- composer/types.ts
- package.json
- oracle-voice-assets.test.ts
- SessionResources.tsx
- RuntimeStatus.tsx
- fake-vad.ts
- desktop.json
- DeferredSession
- dreamer-service.test.ts
- response-compression.test.ts
- LargeSessionService
- ActivityRow.tsx
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- dreamer-routes.ts
- .observe
- manager-proactive-inbox.test.ts
- session-scope.ts
- Pcm16Resampler
- html-preview.ts
- command-catalog-cache.test.ts
- isRecord
- .initialize
- ScheduleNotificationService
- SessionAdmissions
- tmux-errors.test.ts
- use-oracle-attachments.ts
- session-response-order.ts
- dataset
- generate-pwa-icons.ts
- .createSession
- session-unread-tracker.ts
- bridge.rs
- vite.config.ts
- history-projection.test.ts
- logs-cli.test.ts
- ManagerProactiveInboxValidationError
- manager-structured-memory-performance.test.ts
- promotion-setup-execution.test.ts
- response-compression.ts
- SkillsSettings.tsx
- voice-recorder.ts
- doctor-cli.test.ts
- release-publication.test.ts
- ComputersDialog.tsx
- composer-layout.test.ts
- HostTelemetryClock
- settings.ts
- DocumentViewControls.tsx
- usePanelWidth
- promotion-setup.test.ts
- SessionKnowledgeLifecycle
- FakeRecorder
- storedProvider
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
1. `AppWorkspace()` - 347 edges
2. `SessionDetail` - 325 edges
3. `AgentService` - 316 edges
4. `SessionStore` - 217 edges
5. `ManagedSession` - 178 edges
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
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (270 total, 29 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (15): agentMode(), AgentService, isUncertainDelivery(), permissionTitle(), persistedFormAnswer(), removeCopilotSessionFiles(), sessionInUseConflictMessage(), terminalAnswerRefused() (+7 more)

### Community 1 - "SessionStore"
Cohesion: 0.03
Nodes (84): fixture(), restart(), connect(), createStore(), enqueue(), fixture(), recoveryFixture(), claudeOwner() (+76 more)

### Community 2 - "AppWorkspace"
Cohesion: 0.03
Nodes (181): isManagerEvent(), terminalSendOptions(), sessionFileValidationError(), SettingsChange, SettingsProfileKey, SettingsUpdateResult, submissionReceiptFromError(), replyPermission() (+173 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (134): AddKnowledgeRootInput, PushSettings, SessionKnowledgeRootMutationInput, parseSubmissionReceipt(), activityArgumentFormats, activityDetailStatuses, activityKinds, addKnowledgeRoot() (+126 more)

### Community 4 - "agent-service.ts"
Cohesion: 0.03
Nodes (114): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+106 more)

### Community 5 - "SessionDetail"
Cohesion: 0.04
Nodes (10): ClaudeAgentService, isMissingClaudeSessionError(), preparePrompt(), queueConflict(), answer(), claudeRequest(), copilotRequest(), claudeFixture() (+2 more)

### Community 6 - "App.tsx"
Cohesion: 0.03
Nodes (96): executeCommand(), ActivityRowStates, browserStorage(), ChangeDirectoryDialog(), browseDirectory(), submit(), clearStored(), clipboardImageExtensions (+88 more)

### Community 7 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (56): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+48 more)

### Community 8 - "contracts.ts"
Cohesion: 0.03
Nodes (70): ClaudeAgentServiceEvents, DirectoryScope, ClaudeFakeSessionService, directories, openNodeVoiceSocket(), routingFixture(), session(), temporaryDirectory() (+62 more)

### Community 9 - "terminal-session.ts"
Cohesion: 0.04
Nodes (100): activeBottomFrame(), afterExit(), boxedComposerFrame(), captureBeforeDeadline(), captureTerminal(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS (+92 more)

### Community 10 - "computer-manager.ts"
Cohesion: 0.06
Nodes (69): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+61 more)

### Community 11 - "ManagedSession"
Cohesion: 0.07
Nodes (17): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, normalizeNodeUrl(), FakeManager (+9 more)

### Community 12 - "session-directory.ts"
Cohesion: 0.05
Nodes (64): instrument(), displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath() (+56 more)

### Community 13 - "session-presentation.ts"
Cohesion: 0.04
Nodes (74): closedSessionExpiresAt(), SessionInterruptionCause, SessionProvenance, handleDragEnd(), KnowledgeRootSelector(), root, readScheduleLink(), ScheduleLink (+66 more)

### Community 14 - "ManagerStore"
Cohesion: 0.05
Nodes (34): fixture(), scheduledFixture(), session(), capturePrompt(), openStore(), JournalRecorder, JournalRecorderOptions, Seen (+26 more)

### Community 15 - "agent-service.test.ts"
Cohesion: 0.03
Nodes (55): complete(), event(), sessionWithLog(), start(), CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures (+47 more)

### Community 16 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (35): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+27 more)

### Community 17 - "app.ts"
Cohesion: 0.04
Nodes (54): buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ServerRole, ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), directories (+46 more)

### Community 18 - "oracle-voice-session.ts"
Cohesion: 0.04
Nodes (55): apps, directories, voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngineCall, FakeVoiceEngineFactory, config, VoiceEngineEvent (+47 more)

### Community 19 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 20 - "oracle-voice.ts"
Cohesion: 0.06
Nodes (51): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError() (+43 more)

### Community 21 - "manager-tools.ts"
Cohesion: 0.05
Nodes (40): DreamerMemoryMetadataRecord, APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools() (+32 more)

### Community 22 - "ManagerAgent"
Cohesion: 0.08
Nodes (12): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, uniqueManagerSessionRefs() (+4 more)

### Community 23 - "terminal-session.test.ts"
Cohesion: 0.04
Nodes (64): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+56 more)

### Community 24 - "ManagerMessage"
Cohesion: 0.04
Nodes (24): FakeManager, ProactiveManager, FakeAgent, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError() (+16 more)

### Community 25 - "notification-center-service.ts"
Cohesion: 0.06
Nodes (36): center(), directories, directory(), hub(), now, runtimes, trusted, NotificationCenterService (+28 more)

### Community 26 - "dreamer-service.ts"
Cohesion: 0.06
Nodes (55): DreamerHistoryEntry, planWithFingerprints(), publicSnapshot(), safeRunError(), assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS (+47 more)

### Community 27 - "transcription-service.ts"
Cohesion: 0.05
Nodes (37): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, headerSafe() (+29 more)

### Community 28 - "oracle-voice-worker.ts"
Cohesion: 0.06
Nodes (27): benchmarkGroup(), VoiceSttEngine, VoiceTtsEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage() (+19 more)

### Community 29 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (45): DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+37 more)

### Community 30 - "AppSettingsDialog.tsx"
Cohesion: 0.06
Nodes (56): parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), currentAppViewportGeometry(), changed() (+48 more)

### Community 31 - "AgentProvider"
Cohesion: 0.05
Nodes (39): awaitTermination(), LaunchCreations, apps, directories, directory(), runtime(), services, stores (+31 more)

### Community 32 - "OracleVoiceCoordinator"
Cohesion: 0.09
Nodes (6): errorMessage(), OracleVoiceCoordinator, PendingFinalTurn, withTimeout(), VoiceTurnState, VoiceClientControl

### Community 33 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (31): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDelivery, QueuedDispatches (+23 more)

### Community 34 - "client.ts"
Cohesion: 0.05
Nodes (24): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, OracleVoicePlayback (+16 more)

### Community 35 - "tmux-errors.integration.test.ts"
Cohesion: 0.05
Nodes (37): connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+29 more)

### Community 36 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (15): RemoteResync, RemoteSessionRead, RemoteNodeClient, client(), servers, session, RemoteNodeCapabilityError, SkillSettingsTarget (+7 more)

### Community 37 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+23 more)

### Community 38 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 39 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (48): foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity(), SocketPlace, UnixSocket (+40 more)

### Community 40 - "setupWorkspaceFixture"
Cohesion: 0.05
Nodes (29): pageFor(), desktop, devices, long, open(), phone, veryLong, bounds() (+21 more)

### Community 41 - "sampler.ts"
Cohesion: 0.08
Nodes (45): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+37 more)

### Community 42 - "controls.tsx"
Cohesion: 0.07
Nodes (50): DEFAULT_SESSION_PROVIDER, NewSessionBackendSetting, activateSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+42 more)

### Community 43 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (54): addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, copyTask() (+46 more)

### Community 44 - "scheduler-store.ts"
Cohesion: 0.07
Nodes (41): ComputerManagerEvents, computer, observe(), snapshot(), start, sustained(), attentionClosed(), attentionSeed() (+33 more)

### Community 45 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+22 more)

### Community 46 - "pipeline.ts"
Cohesion: 0.07
Nodes (37): openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), render, scope, documentOpening(), documentParts() (+29 more)

### Community 47 - "ui-locks.pw.ts"
Cohesion: 0.06
Nodes (36): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+28 more)

### Community 48 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (43): frame(), geometry, output, scratch, screenshot(), { values }, accents, Measurement (+35 more)

### Community 50 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (41): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 51 - "SchedulerStore"
Cohesion: 0.12
Nodes (11): enableSchedulerTools(), fixture(), deferUnboundWorktree(), failure(), isInFlight(), occurrenceKey(), SchedulerStore, retainedHistory() (+3 more)

### Community 52 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (16): startAgentAfterClear(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand() (+8 more)

### Community 53 - "SessionService"
Cohesion: 0.07
Nodes (6): registerNodeRoutes(), execute, git(), node(), SessionService, SCHEDULE_WORKTREE_VERSION

### Community 54 - "VoiceAudioFrame"
Cohesion: 0.05
Nodes (24): SocketInbox, AudioReservation, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, VoiceAudioFrame, BufferedFrame (+16 more)

### Community 55 - "fake-voice.ts"
Cohesion: 0.08
Nodes (10): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance (+2 more)

### Community 56 - "ScheduleRun"
Cohesion: 0.14
Nodes (8): provenance(), SessionScheduleLauncher, session(), ScheduleLaunchRefusedError, SchedulerDispatcher, ScheduleReconciliation, registerSchedulerRoutes(), ScheduleRun

### Community 57 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (41): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition (+33 more)

### Community 58 - "SettingsProfileSnapshot"
Cohesion: 0.08
Nodes (25): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+17 more)

### Community 59 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 60 - "OracleVoiceClient"
Cohesion: 0.13
Nodes (9): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError(), responseMessage() (+1 more)

### Community 61 - "manager-agent.ts"
Cohesion: 0.06
Nodes (33): DreamerProgressView, automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung (+25 more)

### Community 62 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 63 - "host-telemetry.ts"
Cohesion: 0.08
Nodes (39): MinuteAccumulator, aggregate, DiskSpaceSchema, HostHistorySchema, HostInfoSchema, HostMetric, HostMetricAggregate, HostMetricAggregateSchema (+31 more)

### Community 64 - "processes.ts"
Cohesion: 0.08
Nodes (27): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+19 more)

### Community 65 - "DreamerService"
Cohesion: 0.14
Nodes (9): boundedText(), digest(), DreamerService, DreamerUnavailableError, unavailableSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate, DreamerSnapshot (+1 more)

### Community 66 - "composer-state.ts"
Cohesion: 0.09
Nodes (42): composerChanged(), composerPasted(), migrateSessionState(), moveComposerDraft(), moveKnowledgePosition(), persistComposerDrafts(), restoreComposerSubmission(), composerReadFailureMessage() (+34 more)

### Community 67 - "oracle-voice-routes.test.ts"
Cohesion: 0.05
Nodes (17): exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), GatedVoiceEngineFactory, ObservedLocalVoiceBackend, openApps, openSockets (+9 more)

### Community 68 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 69 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 70 - "node-routes.ts"
Cohesion: 0.06
Nodes (40): activityDetailsUnavailable(), activityNotInLog(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), SessionParams, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+32 more)

### Community 71 - "session-resource-clear.test.ts"
Cohesion: 0.06
Nodes (37): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), deferred() (+29 more)

### Community 72 - "service.ts"
Cohesion: 0.08
Nodes (23): HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers (+15 more)

### Community 73 - "oracle-voice-coordinator.ts"
Cohesion: 0.07
Nodes (25): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnector (+17 more)

### Community 74 - "oracle-voice-routes.ts"
Cohesion: 0.09
Nodes (33): nodeVoiceCapabilities(), sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes() (+25 more)

### Community 75 - "dreamer-planner.ts"
Cohesion: 0.09
Nodes (35): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+27 more)

### Community 76 - "PushNotificationService"
Cohesion: 0.11
Nodes (9): start(), HubEventSource, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema (+1 more)

### Community 77 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 78 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 79 - "schedule-recurrence.ts"
Cohesion: 0.11
Nodes (36): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+28 more)

### Community 80 - "ScheduleForm.tsx"
Cohesion: 0.11
Nodes (29): scheduleProposalSummary(), ScheduleTarget, SubmissionError, FolderPicker(), browse(), editableSchedule(), recurrenceSummary(), runDuration() (+21 more)

### Community 81 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (34): editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), sendManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), canTakeFocus() (+26 more)

### Community 82 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 83 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (29): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+21 more)

### Community 84 - "hub-routes.ts"
Cohesion: 0.06
Nodes (38): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+30 more)

### Community 85 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 86 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 87 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 88 - "active-sessions.ts"
Cohesion: 0.11
Nodes (30): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+22 more)

### Community 89 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (19): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail(), FakeClient (+11 more)

### Community 90 - "FakeVoiceEngine"
Cohesion: 0.08
Nodes (14): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine, Runtime (+6 more)

### Community 91 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 92 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 93 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 94 - "ManagerEvent"
Cohesion: 0.09
Nodes (22): ManagerEventSource, NotificationRecorder, OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030 (+14 more)

### Community 95 - "manager-proactive-coordinator.ts"
Cohesion: 0.12
Nodes (11): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, SessionLifecycle, directories (+3 more)

### Community 96 - "oracle-voice-config.ts"
Cohesion: 0.10
Nodes (25): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+17 more)

### Community 97 - ".takeInTranscript"
Cohesion: 0.11
Nodes (10): createStatusTracker(), foregroundCompletedSince(), foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), messagesFromHistory(), recoveredPermissionTitle(), statusFromEvents() (+2 more)

### Community 98 - "KnowledgeStore"
Cohesion: 0.12
Nodes (14): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+6 more)

### Community 99 - "schedule-launcher.test.ts"
Cohesion: 0.08
Nodes (25): applications, directories, releases, sockets, RemoteNodeTransportError, LaunchPrimitives, recordScheduleProvenance(), ScheduleLauncherHost (+17 more)

### Community 100 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (34): assertExactKeys(), cloneState(), DISPOSITIONS, hasExactKeys(), isDisposition(), isEventKind(), isId(), isOrigin() (+26 more)

### Community 102 - "EngineVoiceBackendSession"
Cohesion: 0.18
Nodes (5): asSessionError(), disconnectCause(), EngineVoiceBackendSession, sameUtterance(), VoiceSessionError

### Community 103 - "BackgroundTasksDialog.tsx"
Cohesion: 0.12
Nodes (27): BackgroundTask, BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter (+19 more)

### Community 104 - "schedule-proposals.ts"
Cohesion: 0.11
Nodes (30): action, create, existing, metadata, scheduleProposalInputSchema, ScheduleProposalsChanged, scheduleProposalSchema, update (+22 more)

### Community 105 - "pipeline.test.tsx"
Cohesion: 0.12
Nodes (25): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+17 more)

### Community 106 - "transcript-test-helpers.ts"
Cohesion: 0.12
Nodes (19): contextChangedInEvents(), createPendingUserInputTracker(), isEmptyResponseNotice(), pendingUserInputFromEvents(), PendingUserInputTracker, runtimeInfoFromEvents(), RuntimeTracker, SessionEventProjection (+11 more)

### Community 107 - "manager-context.ts"
Cohesion: 0.13
Nodes (27): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+19 more)

### Community 108 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 109 - ".sendInternal"
Cohesion: 0.14
Nodes (23): terminalComposerUnreadable(), backgroundShellsAllow(), busyRowStatus(), captureForReplacement(), capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText() (+15 more)

### Community 110 - "ChatMessage"
Cohesion: 0.10
Nodes (16): TranscriptBuilder, nextVoiceControl(), BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, Client, Browser (+8 more)

### Community 111 - "ManagerClientDefaults"
Cohesion: 0.10
Nodes (16): OracleVoiceBackendConnection, ManagerClientDefaults, VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation (+8 more)

### Community 112 - "node:fs/promises"
Cohesion: 0.08
Nodes (23): root, script, disk, fixtures, gate(), holdTurnWrite(), releases, disk (+15 more)

### Community 113 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (28): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+20 more)

### Community 114 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 115 - "real-voice.ts"
Cohesion: 0.11
Nodes (13): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+5 more)

### Community 116 - "DreamerStore"
Cohesion: 0.17
Nodes (6): assertUniqueJsonKeys(), clone(), DreamerRecoveryError, DreamerStore, isMissing(), publicPlan()

### Community 117 - "feature-flags.ts"
Cohesion: 0.17
Nodes (21): hub(), AppVersion, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable() (+13 more)

### Community 118 - "ScheduleWorktreeService"
Cohesion: 0.16
Nodes (12): RemoteNodeRequestError, execute, failure(), missing(), ScheduleWorktreeService, launchIdentitySchema, folder, scheduleWorktreeCleanupSchema (+4 more)

### Community 119 - "schedules.ts"
Cohesion: 0.10
Nodes (28): CLAUDE_SCHEDULE_UNAVAILABLE_REASON, cronExpression, DEFAULT_SCHEDULE_TIMEZONE, identifier, SCHEDULE_ABANDONED_REASON, SCHEDULE_MIN_SPACING_MINUTES, SCHEDULE_PROMPT_MAX_LENGTH, scheduleAbandonSchema (+20 more)

### Community 120 - "PromptCards.tsx"
Cohesion: 0.11
Nodes (24): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+16 more)

### Community 121 - "recovery-resend-durability.test.ts"
Cohesion: 0.08
Nodes (15): terminalService(), directories, disk, gate(), gates, httpBoundary(), initialize(), PublicSessionValue (+7 more)

### Community 122 - "ManagerAttachment"
Cohesion: 0.14
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 123 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (24): isSettingsDeviceId(), isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance (+16 more)

### Community 124 - "transport.test.ts"
Cohesion: 0.11
Nodes (15): prefixes, session, trusted, untrusted, BuildAppOptions, ProcessScanContext, registerHostTelemetryRoutes(), HostTelemetryService (+7 more)

### Community 125 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (17): phases, port, app(), directories, headers, launcher, createStartupPhases(), silentStartupPhases (+9 more)

### Community 126 - "scheduler-dispatcher.ts"
Cohesion: 0.11
Nodes (17): NoopScheduleLauncher, ScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS, SchedulerDispatcherOptions, ScheduleStopAcknowledgement, ScheduleTargetUnavailableError (+9 more)

### Community 127 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 128 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (25): advance(), Connection, connections, content(), FrameMeasurement, lastHeading(), message(), open() (+17 more)

### Community 129 - "react"
Cohesion: 0.11
Nodes (13): react, composerSteeringUnavailableReason(), ComposerActions(), ContextRing(), SendControl(), TriggerProps, MarkdownCodeBlock(), copy() (+5 more)

### Community 130 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 131 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 132 - "background-task-stop.test.ts"
Cohesion: 0.14
Nodes (17): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot(), started() (+9 more)

### Community 133 - "registerSessionKnowledgeRoutes"
Cohesion: 0.14
Nodes (21): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+13 more)

### Community 134 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 135 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 136 - "agent-service-event-projection.test.ts"
Cohesion: 0.12
Nodes (19): at(), directories, finish(), launch(), projected(), services, sessionLog(), syncSessionTranscript() (+11 more)

### Community 137 - ".toolHost"
Cohesion: 0.13
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 138 - "ManagerAssistant.test.tsx"
Cohesion: 0.09
Nodes (16): cancelManager(), resolveManagerConfirmation(), retryManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+8 more)

### Community 139 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 140 - "closed-sessions.ts"
Cohesion: 0.12
Nodes (10): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS, closedSessionContext(), excerpt(), isClosedSessionContext() (+2 more)

### Community 141 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 142 - "document-render.pw.ts"
Cohesion: 0.08
Nodes (6): LongFrame, desktop, Layout, layouts, phone, KNOWLEDGE_FILE_PATH

### Community 143 - "sections.tsx"
Cohesion: 0.17
Nodes (13): AppearanceSetting, getHubHealth(), SettingScope(), HealthCard(), accentThemes, appearanceOptions, notificationScopeOptions, navigableSettingsSections (+5 more)

### Community 144 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 145 - "NotificationPanel.tsx"
Cohesion: 0.17
Nodes (15): FeatureEvent, listeners, publishFeatureEvent(), subscribeFeatureEvents(), NotificationGroup, notificationGroups(), NotificationTab, kindIcon() (+7 more)

### Community 146 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 147 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 148 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 149 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 150 - "ActivityDetails.tsx"
Cohesion: 0.20
Nodes (17): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, activityDetailFailure, detailKey(), formatBytes(), keep(), kept, keptActivityDetail(), loadActivityDetail() (+9 more)

### Community 151 - "ActivityRow.test.tsx"
Cohesion: 0.14
Nodes (12): ActivityStatus, ActivityRow, bashDetail(), output, raw, runningDetail(), text(), UserMessage (+4 more)

### Community 152 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 153 - "markdown-navigation.ts"
Cohesion: 0.18
Nodes (19): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+11 more)

### Community 154 - "RuntimeModelOption"
Cohesion: 0.17
Nodes (14): WorkspaceFixtureState, RuntimeModelOption, getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings() (+6 more)

### Community 155 - "terminal-form-deadline.test.ts"
Cohesion: 0.12
Nodes (15): TerminalFormContinuation, question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture() (+7 more)

### Community 156 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 157 - "normalizeKnowledgeRelativePath"
Cohesion: 0.21
Nodes (16): knowledgeFileSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot() (+8 more)

### Community 158 - "ManagerProactiveInbox"
Cohesion: 0.22
Nodes (4): ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, nowIso(), openInbox()

### Community 159 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 160 - "usePreviewFeature"
Cohesion: 0.21
Nodes (11): ClientFeature, railEntries(), usePreviewFeature(), usePreviewFeatures(), EffectiveState(), SchedulerDraft(), initials(), useDisplayName() (+3 more)

### Community 161 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 162 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 163 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 164 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 165 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 166 - "server/session-patches.ts"
Cohesion: 0.19
Nodes (9): publish(), diffMessages(), Publication, sameField(), sameMessage(), sessionKey(), SessionPublications, SessionUpserted (+1 more)

### Community 167 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 168 - "oracle-status.test.ts"
Cohesion: 0.19
Nodes (14): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+6 more)

### Community 169 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 170 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

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

### Community 176 - "HostTelemetrySampler"
Cohesion: 0.20
Nodes (3): HostTelemetrySampler, HostMinuteAggregate, HostSample

### Community 177 - "session-unread.pw.ts"
Cohesion: 0.14
Nodes (8): bounds(), devices, edgeState(), screenshot(), unreadState(), fixtureBackgroundTasks, OFFLINE_SESSION_ID, PENDING_SESSION_ID

### Community 178 - "composer/types.ts"
Cohesion: 0.23
Nodes (6): AttachmentStrip(), Composer(), QueuedPromptList(), SlashCommandMenu(), ComposerAttachment, ComposerProps

### Community 179 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 180 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 181 - "SessionResources.tsx"
Cohesion: 0.14
Nodes (11): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, openSessionResources(), SessionResourcesDialog(), sessionResourceOwner(), Catalog, CatalogResult (+3 more)

### Community 182 - "RuntimeStatus.tsx"
Cohesion: 0.27
Nodes (8): families, modelFamily, repositoryModels, RuntimeStatus(), session, glyphs, ModelFamilyIcon(), RuntimeModelName()

### Community 183 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 184 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 185 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 186 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (4): DreamerServiceOptions, directories, enabledSettings(), ManagerInternalSubmission

### Community 187 - "response-compression.test.ts"
Cohesion: 0.15
Nodes (11): apps, directories, hookApp(), jsonText(), largeCall, largeCallOutput, largeFile, runtime() (+3 more)

### Community 189 - "ActivityRow.tsx"
Cohesion: 0.33
Nodes (11): toolCallIdFromActivityId(), activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), compactActivityText(), formatActivityDuration() (+3 more)

### Community 190 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 191 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 192 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 193 - "dreamer-routes.ts"
Cohesion: 0.19
Nodes (11): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+3 more)

### Community 194 - ".observe"
Cohesion: 0.21
Nodes (7): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId()

### Community 195 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 196 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 197 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 198 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 199 - "command-catalog-cache.test.ts"
Cohesion: 0.25
Nodes (9): at(), Catalog, deferred(), fixture(), fixtures, listed(), releases, runtime() (+1 more)

### Community 200 - "isRecord"
Cohesion: 0.29
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 201 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 204 - "tmux-errors.test.ts"
Cohesion: 0.24
Nodes (9): containedServer(), directories, errno(), { execute }, files, links, listener(), places() (+1 more)

### Community 205 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 206 - "session-response-order.ts"
Cohesion: 0.31
Nodes (9): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt(), failure (+1 more)

### Community 207 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 208 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 210 - "session-unread-tracker.ts"
Cohesion: 0.29
Nodes (5): FinishedSession, SessionUnreadTracker, finished(), SessionTurnState, turnEnded()

### Community 211 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 212 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 213 - "history-projection.test.ts"
Cohesion: 0.31
Nodes (7): eventsFor(), groupedEventsFor(), ModelMessage, questionEventsFor(), random(), seedOffset, terminalTypes

### Community 214 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 215 - "ManagerProactiveInboxValidationError"
Cohesion: 0.28
Nodes (6): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions()

### Community 216 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.31
Nodes (6): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult

### Community 217 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 218 - "response-compression.ts"
Cohesion: 0.42
Nodes (8): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), varyOnAcceptEncoding()

### Community 219 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 220 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 221 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 222 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 223 - "ComputersDialog.tsx"
Cohesion: 0.32
Nodes (5): addComputer(), ComputersBody(), remove(), ComputersBodyProps, computer

### Community 224 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 226 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 227 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 228 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 229 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1459 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1454 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2450 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionStore`, `cli-canary.ts`, `SessionDetail`, `ManagedSession`, `session-directory.ts`, `ManagerStore`, `oracle-voice-session.ts`, `ManagerAgent`, `ManagerMessage`, `notification-center-service.ts`, `transcription-service.ts`, `oracle-voice-worker.ts`, `oracle-task-store.ts`, `ManagerProactiveInbox`, `AppSettingsDialog.tsx`, `tmux-errors.integration.test.ts`, `session-knowledge-store.ts`, `HostTelemetrySampler`, `ProviderSessionService`, `SchedulerStore`, `SessionService`, `ScheduleRun`, `SettingsProfileSnapshot`, `dreamer-routes.ts`, `DreamerService`, `service.ts`, `ScheduleNotificationService`, `PushNotificationService`, `manager-agent.test.ts`, `response-compression.ts`, `SessionOrderStore`, `manager-proactive-coordinator.ts`, `oracle-voice-config.ts`, `KnowledgeStore`, `feature-flags.ts`, `ScheduleWorktreeService`, `transport.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `.takeInTranscript`, `queued-dispatch.test.ts`, `agent-service.ts`, `SessionDetail`, `session-resource-routes.test.ts`, `contracts.ts`, `storedProvider`, `computer-manager.ts`, `background-task-adapter.ts`, `session-directory.ts`, `.createSession`, `recovery-resend-durability.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `TmuxTerminalSessionController` connect `TmuxTerminalSessionController` to `AgentService`, `processes.ts`, `terminal-session.ts`, `.sendInternal`, `terminal-session.test.ts`, `active-sessions.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1459 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03213372664700098 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.02719361856417694 - nodes in this community are weakly interconnected._
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
