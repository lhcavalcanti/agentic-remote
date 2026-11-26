# Agentic Remote - Graphify code map

Snapshot: `4cff2c717822f72815848e20a673f1411b42d01968a8297aa93b881ce6fc8673`

Source checkout: `850989204b6a9a942242ae42369430cc2fd6d621`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 686 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 686 files · ~1,225,345 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9570 nodes · 27671 edges · 269 communities (229 shown, 23 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1356 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionDetail
- AgentService
- terminal-session.ts
- api.ts
- AppWorkspace
- agent-service.ts
- notification-classifier.ts
- contracts.ts
- session-store.ts
- SchedulerStore
- App.tsx
- session-presentation.ts
- app.ts
- host-telemetry.ts
- registerHubRoutes
- BackgroundTaskSnapshot
- hub-routes.ts
- claude-agent-service.ts
- manager-tools.ts
- oracle-voice-soak.ts
- sampler.ts
- manager-store.ts
- dreamer-store.ts
- agentic-remote-promotion-monitor
- RemoteNodeClient
- ManagerAgent
- oracle-voice-child.ts
- manager-agent.ts
- oracle-voice-session.ts
- SessionService
- client.ts
- ManagerMessage
- queued-dispatch.test.ts
- oracle-voice-integration.test.ts
- FakeVoiceEngine
- OracleVoiceCoordinator
- ManagedSession
- transcription-service.ts
- VoiceAudioFrame
- ScheduleForm.tsx
- ui-locks.pw.ts
- setupWorkspaceFixture
- oracle-task-store.ts
- manager-structured-memory-validation.ts
- oracle-voice-worker.ts
- ProviderSessionService
- oracle-voice-coordinator.ts
- controls.tsx
- schedule-launcher.test.ts
- fake-voice.ts
- react
- oracle-voice-benchmark.ts
- UserInputReplyInput
- DreamerService
- workspace-fixtures.ts
- OracleDreamer.tsx
- agentic-remote
- ManagerAssistant.tsx
- node:fs/promises
- dreamer-progress.ts
- agent-service.test.ts
- PushNotificationService
- oracle-voice.ts
- AppSettingsDialog.tsx
- agentic-remote-gate
- processes.ts
- bundle
- RecentlyClosed.tsx
- manager-proactive-inbox.ts
- SettingsProfileSnapshot
- VoicePlayback
- oracle-voice-child.test.ts
- shell.ts
- lib.rs
- feature-flags.ts
- ManagerStore
- sections.tsx
- dependencies
- devDependencies
- shared/settings-profile.ts
- terminal-startup-queue.test.ts
- ActivityRow.test.tsx
- VoiceCapture
- client.test.ts
- agentic-remote-promotion-setup
- oracle-voice-config.ts
- schedules.ts
- config.rs
- FakeSessionService
- session-prefetch.ts
- remote-voice-client.ts
- oracle-voice-routes.ts
- BackgroundTasksDialog.tsx
- knowledge-tree.ts
- session-unread.pw.ts
- manager-structured-memory.ts
- EngineVoiceBackendSession
- markdown-navigation.ts
- send-matrix.integration.test.ts
- server/skill-settings.ts
- background-task-adapter.ts
- dreamer-planner.ts
- manager-agent.test.ts
- oracle-voice-segments.ts
- SessionOrderStore
- session-reply-durability.test.ts
- dreamer-service.ts
- schedule-recurrence.ts
- active-sessions.ts
- manager-proactive-coordinator.ts
- ManagerAttachment
- ManagerAssistant.test.tsx
- normalizeKnowledgeRelativePath
- schedule-proposals.ts
- src/settings-profile.ts
- capture-workspace.ts
- session-patch-browser.ts
- session-directory.ts
- cli-canary.ts
- tmux-test-helpers.integration.test.ts
- scripts
- pipeline.ts
- use-markdown-document.ts
- use-oracle-conversation.test.tsx
- manager-structured-memory-search.ts
- session-categories.ts
- SettingsProfileClient
- session-transcript.ts
- real-voice.ts
- HostMonitorView.test.tsx
- oracle-voice-security.test.ts
- session-clear-transcript.test.ts
- SessionResources.tsx
- compilerOptions
- .observe
- ManagerStructuredMemoryStore
- session-category-routes.ts
- tmux-errors.ts
- vite.config.ts
- SessionCategoryStore
- oracle-voice-tickets.ts
- session-store-providers.test.ts
- tmux-test-helpers.ts
- compilerOptions
- transcript-window.ts
- session-category-store.test.ts
- full-gate.test.ts
- eventually
- workspace-browser.ts
- compilerOptions
- KnowledgeStore
- ManagerProactiveInbox
- SessionKnowledgeStore
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- server/side-question.ts
- ManagerMemory
- session-knowledge-store.test.ts
- ActivityDetails.tsx
- dreamer-schedule.ts
- promotion-monitor.test.ts
- PromptCards.tsx
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- session-reorder.pw.ts
- knowledge-store.ts
- scripts
- session-latency-benchmark.ts
- background-task-stop.test.ts
- session-knowledge-routes.ts
- renderer.test.ts
- use-markdown-document.test.tsx
- session-knowledge-store.ts
- session-resource-routes.test.ts
- closed-sessions.ts
- RuntimeStatus.tsx
- package.json
- projection-test-helpers.ts
- registerSessionKnowledgeRoutes
- oracle-voice-assets.test.ts
- use-oracle-settings.ts
- capture-workbench-review.ts
- fake-vad.ts
- pwa-update.pw.ts
- desktop.json
- agent-service-event-projection.test.ts
- DeferredSession
- session-resource-clear.test.ts
- LargeSessionService
- theme-contrast.test.ts
- ShellNavigation.test.tsx
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- dreamer-service.test.ts
- boundedText
- dreamer-routes.ts
- manager-proactive-inbox.test.ts
- ScheduleNotificationService
- html-preview.ts
- sign-in-expired.pw.ts
- .initialize
- use-oracle-attachments.ts
- static-files.ts
- dataset
- generate-pwa-icons.ts
- session-knowledge-routes.test.ts
- manager-structured-memory-performance.test.ts
- bridge.rs
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- response-compression.ts
- SkillsSettings.tsx
- active-sessions.test.ts
- recordValue
- doctor-cli.test.ts
- manager-proactive-coordinator.test.ts
- release-publication.test.ts
- SkillSettingsService
- UserInputFieldControl
- KnowledgePosition
- session-list-collisions.test.ts
- composer-layout.test.ts
- session-order-routes.test.ts
- tmux-errors.integration.test.ts
- settings.ts
- DocumentViewControls.tsx
- skill-settings-jsonc.ts
- markdownComponentsFor
- promotion-setup.test.ts
- FakeRecorder
- MockMediaRecorder
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
1. `AppWorkspace()` - 394 edges
2. `SessionDetail` - 328 edges
3. `AgentService` - 318 edges
4. `SessionStore` - 218 edges
5. `ManagedSession` - 190 edges
6. `buildApp()` - 147 edges
7. `ClaudeAgentService` - 133 edges
8. `registerHubRoutes()` - 117 edges
9. `ComputerManager` - 108 edges
10. `ManagerAgent` - 101 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `handleDragEnd()` --indirect_call--> `computerOrder()`  [INFERRED]
  src/App.tsx → e2e/session-reorder.pw.ts
- `FakeVoiceState` --references--> `ManagerMessage`  [EXTRACTED]
  e2e/fixtures/fake-voice.ts → shared/manager.ts
- `instrument()` --indirect_call--> `document()`  [INFERRED]
  e2e/session-patch-browser.ts → server/skill-settings-jsonc.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (269 total, 23 thin omitted)

### Community 0 - "SessionDetail"
Cohesion: 0.02
Nodes (64): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services (+56 more)

### Community 1 - "AgentService"
Cohesion: 0.03
Nodes (17): agentMode(), AgentService, isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isTerminalNotReadyRefusal(), isUncertainDelivery(), recoveredPermissionTitle(), RuntimeConfigurationError (+9 more)

### Community 2 - "terminal-session.ts"
Cohesion: 0.02
Nodes (163): terminalComposerUnreadable(), execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe() (+155 more)

### Community 3 - "api.ts"
Cohesion: 0.02
Nodes (178): SessionKnowledgeBinding, SessionCategoryChange, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, submissionReceiptFromError(), activityArgumentFormats (+170 more)

### Community 4 - "AppWorkspace"
Cohesion: 0.03
Nodes (198): terminalSendOptions(), newSessionCategoryId(), sessionCategoryOf(), sessionFileValidationError(), AppWorkspace(), adoptConversationReplacement(), announceCategory(), appendComposerForKey() (+190 more)

### Community 5 - "agent-service.ts"
Cohesion: 0.02
Nodes (137): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+129 more)

### Community 6 - "notification-classifier.ts"
Cohesion: 0.03
Nodes (86): computer, observe(), snapshot(), start, sustained(), center(), directories, directory() (+78 more)

### Community 7 - "contracts.ts"
Cohesion: 0.03
Nodes (101): ClaudeAgentServiceEvents, DirectoryScope, awaitTermination(), LaunchCreations, apps, directories, directory(), runtime() (+93 more)

### Community 8 - "session-store.ts"
Cohesion: 0.02
Nodes (102): complete(), event(), sessionWithLog(), start(), CopilotClientLike, fixture(), holdProbe(), fixtures (+94 more)

### Community 9 - "SchedulerStore"
Cohesion: 0.05
Nodes (40): LaunchPrimitives, provenance(), ScheduleProvenance, scheduleSessionTitle(), SessionScheduleLauncher, fixture(), NoopScheduleLauncher, ScheduleLauncher (+32 more)

### Community 10 - "App.tsx"
Cohesion: 0.03
Nodes (107): isManagerEvent(), turnEnded(), TRANSCRIPT_WINDOW, ActivityRowStates, sidebarResizeMove(), attachmentId(), bindingMatches(), browserStorage() (+99 more)

### Community 11 - "session-presentation.ts"
Cohesion: 0.04
Nodes (87): SessionCategory, DEFAULT_SESSION_PROVIDER, handleDragEnd(), KnowledgeRootSelector(), root, dragsRow, RowMouseSensor, RowTouchSensor (+79 more)

### Community 12 - "app.ts"
Cohesion: 0.03
Nodes (67): buildApp(), errorStatusCode(), transcriptionComputerName(), directories, runtimes, trusted, FileUploadError, registerFileUploadRoutes() (+59 more)

### Community 13 - "host-telemetry.ts"
Cohesion: 0.04
Nodes (67): BuildAppOptions, HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus() (+59 more)

### Community 14 - "registerHubRoutes"
Cohesion: 0.06
Nodes (18): ClientPresence, PRESENCE_TTL_MS, ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, ManagerEventSource (+10 more)

### Community 15 - "BackgroundTaskSnapshot"
Cohesion: 0.04
Nodes (54): Connection, WorkspaceFixtureOptions, backgroundTaskNotFound(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), listedBackgroundTask(), readBackgroundTaskFrom() (+46 more)

### Community 16 - "hub-routes.ts"
Cohesion: 0.03
Nodes (87): activityDetailsUnavailable(), activityNotInLog(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), addComputerSchema, configureRuntimeSchema, createSessionSchema (+79 more)

### Community 17 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (64): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+56 more)

### Community 18 - "manager-tools.ts"
Cohesion: 0.04
Nodes (46): uniqueManagerSessionRefs(), APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools() (+38 more)

### Community 19 - "oracle-voice-soak.ts"
Cohesion: 0.04
Nodes (38): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+30 more)

### Community 20 - "sampler.ts"
Cohesion: 0.05
Nodes (56): prefixes, session, trusted, untrusted, counter(), counterDelta(), CpuCounters, cpuUtilization() (+48 more)

### Community 21 - "manager-store.ts"
Cohesion: 0.04
Nodes (50): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, ComputerManagerEvents (+42 more)

### Community 22 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (47): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+39 more)

### Community 23 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 24 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (18): RemoteResync, RemoteSessionRead, RemoteNodeClient, client(), servers, session, RemoteNodeCapabilityError, RemoteNodeRequestError (+10 more)

### Community 25 - "ManagerAgent"
Cohesion: 0.07
Nodes (17): automaticPayload(), checkContent(), delay(), discover(), errorMessage(), isNotFound(), isPending(), isQueued() (+9 more)

### Community 26 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (37): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+29 more)

### Community 27 - "manager-agent.ts"
Cohesion: 0.06
Nodes (58): DreamerProgressEntry, DreamerProgressView, ManagerAgentOptions, Rung, TURN_ACTIVITY, ago(), attentionRank(), buildTurnContext() (+50 more)

### Community 28 - "oracle-voice-session.ts"
Cohesion: 0.04
Nodes (33): apps, directories, nodeVoiceCapabilities(), EnabledOracleVoiceConfig, FakeVoiceEngineFactory, config, VoiceEngineFactory, GatedVoiceEngineFactory (+25 more)

### Community 29 - "SessionService"
Cohesion: 0.05
Nodes (17): registerNodeRoutes(), apps, directories, hookApp(), jsonText(), largeCall, largeCallOutput, largeFile (+9 more)

### Community 30 - "client.ts"
Cohesion: 0.08
Nodes (21): captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture (+13 more)

### Community 31 - "ManagerMessage"
Cohesion: 0.05
Nodes (24): FakeManager, ProactiveManager, FakeAgent, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError() (+16 more)

### Community 32 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (38): openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+30 more)

### Community 33 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (33): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+25 more)

### Community 34 - "FakeVoiceEngine"
Cohesion: 0.05
Nodes (29): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceStartUtterance, VoiceSttEngine, VoiceTtsEngine (+21 more)

### Community 35 - "OracleVoiceCoordinator"
Cohesion: 0.09
Nodes (6): errorMessage(), OracleVoiceCoordinator, PendingFinalTurn, withTimeout(), VoiceTurnState, VoiceClientControl

### Community 36 - "ManagedSession"
Cohesion: 0.06
Nodes (23): RemoteSessionListing, ManagerHub, delay(), requireFolderTrust(), sameFolder(), SessionFolderTrustPolicy, SessionLaunch, SessionLauncher (+15 more)

### Community 37 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, headerSafe() (+27 more)

### Community 38 - "VoiceAudioFrame"
Cohesion: 0.04
Nodes (30): BrowserCaptureOptions, AudioReservation, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, ORACLE_VOICE_SAMPLE_RATE, VoiceAudioFrame (+22 more)

### Community 39 - "ScheduleForm.tsx"
Cohesion: 0.07
Nodes (43): nextOccurrences(), ScheduleRecurrence, ScheduleTarget, FeatureEvent, listeners, publishFeatureEvent(), subscribeFeatureEvents(), notificationGroups() (+35 more)

### Community 40 - "ui-locks.pw.ts"
Cohesion: 0.05
Nodes (39): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+31 more)

### Community 41 - "setupWorkspaceFixture"
Cohesion: 0.05
Nodes (27): desktop, devices, long, open(), phone, veryLong, bounds(), closedEarlier (+19 more)

### Community 42 - "oracle-task-store.ts"
Cohesion: 0.08
Nodes (39): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+31 more)

### Community 43 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 44 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (24): benchmarkGroup(), VoiceEndUtterance, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent(), isEnabledConfig() (+16 more)

### Community 46 - "oracle-voice-coordinator.ts"
Cohesion: 0.05
Nodes (33): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnection (+25 more)

### Community 47 - "controls.tsx"
Cohesion: 0.08
Nodes (48): RuntimeModelOption, activateSession(), createSession(), getProviderRuntimeOptions(), reopenInterruptedSession(), shortcutKeys(), startSessionCreation(), startSessionInCategory() (+40 more)

### Community 48 - "schedule-launcher.test.ts"
Cohesion: 0.05
Nodes (32): connections, fixture(), managers, releases, remote, session(), ComputerRegistry, DurableRegisteredComputer (+24 more)

### Community 49 - "fake-voice.ts"
Cohesion: 0.07
Nodes (10): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance (+2 more)

### Community 50 - "react"
Cohesion: 0.06
Nodes (25): react, listClosedSessions(), AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions(), startingAttachmentReason, ContextRing() (+17 more)

### Community 51 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 52 - "UserInputReplyInput"
Cohesion: 0.07
Nodes (8): persistedFormAnswer(), removeCopilotSessionFiles(), TerminalFormContinuation, validateUserInputForm(), formReplyExpired(), TerminalFormReplyError, TerminalSessionController, UserInputReplyInput

### Community 53 - "DreamerService"
Cohesion: 0.12
Nodes (12): DreamerMemoryMetadata, projectDreamerMemory(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), dreamerRunKey() (+4 more)

### Community 54 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (34): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+26 more)

### Community 55 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (41): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+33 more)

### Community 56 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 57 - "ManagerAssistant.tsx"
Cohesion: 0.07
Nodes (42): editQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), ActivityRow, applyEvent(), boundWidth(), canTakeFocus() (+34 more)

### Community 58 - "node:fs/promises"
Cohesion: 0.05
Nodes (37): root, script, deferred(), disk, enqueue(), fixture(), fixtures, holdAdmissionWrite() (+29 more)

### Community 59 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, DreamerProgressSource (+11 more)

### Community 60 - "agent-service.test.ts"
Cohesion: 0.06
Nodes (27): CopilotSessionLike, foregroundTurnOpen(), terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient (+19 more)

### Community 61 - "PushNotificationService"
Cohesion: 0.10
Nodes (11): start(), HubEventSource, PushNotificationService, directories, scoped(), RFC-8030, registerPushRoutes(), sessionMuteSchema (+3 more)

### Community 62 - "oracle-voice.ts"
Cohesion: 0.09
Nodes (36): capabilities, closeServers, exactArrayBuffer(), sockets, startFields, VoiceNode, decodeVoiceAudioFrame(), encodeVoiceAudioFrame() (+28 more)

### Community 63 - "AppSettingsDialog.tsx"
Cohesion: 0.09
Nodes (40): parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), currentAppViewportGeometry(), activatePwaUpdate() (+32 more)

### Community 64 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 65 - "processes.ts"
Cohesion: 0.09
Nodes (25): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+17 more)

### Community 66 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 67 - "RecentlyClosed.tsx"
Cohesion: 0.07
Nodes (32): CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames() (+24 more)

### Community 68 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (40): assertExactKeys(), canonicalHash(), DISPOSITIONS, emptyState(), eventId(), hasExactKeys(), isAlreadyExists(), isDisposition() (+32 more)

### Community 69 - "SettingsProfileSnapshot"
Cohesion: 0.09
Nodes (20): profileStore(), SettingsProfileState, SettingsProfileStore, directories, store(), applySettingsChanges(), applySettingsImport(), isSettingsDeviceId() (+12 more)

### Community 70 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 71 - "oracle-voice-child.test.ts"
Cohesion: 0.07
Nodes (19): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+11 more)

### Community 72 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 73 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 74 - "feature-flags.ts"
Cohesion: 0.13
Nodes (29): hub(), defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable(), parseFeatureFlag() (+21 more)

### Community 75 - "ManagerStore"
Cohesion: 0.11
Nodes (7): openStore(), emptyState(), ManagerStore, messageSource(), storedMessage(), open(), registry()

### Community 76 - "sections.tsx"
Cohesion: 0.10
Nodes (25): PushPolicy, AppVersion, HubHealth, NotificationScope, AppearanceSetting, NewSessionBackendSetting, getHubHealth(), SettingScope() (+17 more)

### Community 77 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 78 - "devDependencies"
Cohesion: 0.05
Nodes (39): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+31 more)

### Community 79 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (34): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+26 more)

### Community 80 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (29): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+21 more)

### Community 81 - "ActivityRow.test.tsx"
Cohesion: 0.10
Nodes (26): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, TOOL_CALL_ID_PATTERN, toolCallIdFromActivityId(), ActivityStatus, activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+18 more)

### Community 82 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 83 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 84 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 85 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (27): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+19 more)

### Community 86 - "schedules.ts"
Cohesion: 0.08
Nodes (33): CronField, DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), cronExpression, DEFAULT_SCHEDULE_TIMEZONE (+25 more)

### Community 87 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 89 - "session-prefetch.ts"
Cohesion: 0.10
Nodes (24): browserConnection, ConnectionHints, connectionSparesData(), IdleScheduler, PASSIVE_READS_SINCE, PREFETCH_PASS_BYTES, PREFETCH_SIDEBAR_ROWS, PrefetchSkips (+16 more)

### Community 90 - "remote-voice-client.ts"
Cohesion: 0.14
Nodes (16): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError() (+8 more)

### Community 91 - "oracle-voice-routes.ts"
Cohesion: 0.12
Nodes (31): sendNodeVoiceOutput(), limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode() (+23 more)

### Community 92 - "BackgroundTasksDialog.tsx"
Cohesion: 0.11
Nodes (28): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+20 more)

### Community 93 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+24 more)

### Community 94 - "session-unread.pw.ts"
Cohesion: 0.08
Nodes (21): bounds(), build(), categorizedState(), devices, drag(), middle(), open(), Point (+13 more)

### Community 95 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 96 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 97 - "markdown-navigation.ts"
Cohesion: 0.12
Nodes (30): followMarkdownLink(), KnowledgeReader(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument(), BreadcrumbSegment (+22 more)

### Community 98 - "send-matrix.integration.test.ts"
Cohesion: 0.07
Nodes (28): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+20 more)

### Community 99 - "server/skill-settings.ts"
Cohesion: 0.14
Nodes (20): builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), readBounded(), revision(), registerSkillSettingsRoutes(), SkillSettingsTarget (+12 more)

### Community 100 - "background-task-adapter.ts"
Cohesion: 0.15
Nodes (31): attachmentModeValue(), backgroundHandoff(), booleanValue(), CopilotClientTaskInfo, CopilotClientTaskProgress, copyTask(), createBackgroundTaskProjector(), endsForegroundTurn() (+23 more)

### Community 101 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (29): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+21 more)

### Community 102 - "manager-agent.test.ts"
Cohesion: 0.10
Nodes (16): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail(), FakeClient (+8 more)

### Community 103 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 104 - "SessionOrderStore"
Cohesion: 0.15
Nodes (13): stores(), orderStore(), carried(), laneFrom(), retire(), sameLane(), sessionOrderKey(), SessionOrderState (+5 more)

### Community 105 - "session-reply-durability.test.ts"
Cohesion: 0.11
Nodes (20): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+12 more)

### Community 106 - "dreamer-service.ts"
Cohesion: 0.12
Nodes (23): DreamerPlanDraft, DreamerPlannerInput, DreamerProgressLimits, boundedText(), DreamerFollowUp, DreamerPlannerExecutionInput, DreamerServiceOptions, safeRunError() (+15 more)

### Community 107 - "schedule-recurrence.ts"
Cohesion: 0.13
Nodes (29): cronMatchesDate(), actualSpacingError(), addCalendarYears(), assertDate(), assertLimit(), assertTimezone(), Calendar, calendarFor() (+21 more)

### Community 108 - "active-sessions.ts"
Cohesion: 0.14
Nodes (25): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+17 more)

### Community 109 - "manager-proactive-coordinator.ts"
Cohesion: 0.16
Nodes (8): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, SessionLifecycle, ManagerProactiveInboxEvent

### Community 110 - "ManagerAttachment"
Cohesion: 0.14
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 111 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (17): cancelManager(), removeQueuedManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+9 more)

### Community 112 - "normalizeKnowledgeRelativePath"
Cohesion: 0.13
Nodes (25): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+17 more)

### Community 113 - "schedule-proposals.ts"
Cohesion: 0.13
Nodes (25): action, create, existing, metadata, scheduleProposalInputSchema, ScheduleProposalsChanged, scheduleProposalSchema, update (+17 more)

### Community 114 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (23): NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, SettingsUpdateResult, statuslineItems (+15 more)

### Community 115 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 116 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 117 - "session-directory.ts"
Cohesion: 0.19
Nodes (19): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+11 more)

### Community 118 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 119 - "tmux-test-helpers.integration.test.ts"
Cohesion: 0.11
Nodes (19): createIsolatedTmuxRoot(), abandoned, abandonFixture(), creatorCommand(), execute, expectRetired(), fixture(), isRetired() (+11 more)

### Community 120 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 121 - "pipeline.ts"
Cohesion: 0.13
Nodes (23): partlyHeldRenderer(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform(), drawSteps(), growable, htmlBlocks (+15 more)

### Community 122 - "use-markdown-document.ts"
Cohesion: 0.15
Nodes (20): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+12 more)

### Community 123 - "use-oracle-conversation.test.tsx"
Cohesion: 0.12
Nodes (12): OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability, defaults, FakeVoiceClient (+4 more)

### Community 124 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 125 - "session-categories.ts"
Cohesion: 0.18
Nodes (22): CategoryState, Fields, isRecord(), parseState(), validName(), applySessionCategoryChange(), clamp(), existing() (+14 more)

### Community 126 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 127 - "session-transcript.ts"
Cohesion: 0.14
Nodes (20): TRANSCRIPT_CARRIED_LIMIT, sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+12 more)

### Community 128 - "real-voice.ts"
Cohesion: 0.14
Nodes (12): clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics, registerControlRoutes() (+4 more)

### Community 129 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 130 - "oracle-voice-security.test.ts"
Cohesion: 0.10
Nodes (14): apps, config, configFixture(), createManager(), issueTicket(), localRuntime(), otherAllowed, requestJson() (+6 more)

### Community 131 - "session-clear-transcript.test.ts"
Cohesion: 0.10
Nodes (10): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixture(), fixtures, gate() (+2 more)

### Community 132 - "SessionResources.tsx"
Cohesion: 0.14
Nodes (21): isActivityDetail(), isActivityText(), isMcpSummary(), isRecord(), isSkillSummary(), listSessionMcpServers(), listSessionSkills(), optionalBoolean() (+13 more)

### Community 133 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 134 - ".observe"
Cohesion: 0.14
Nodes (10): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso() (+2 more)

### Community 135 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 136 - "session-category-routes.ts"
Cohesion: 0.11
Nodes (15): createSchema, deleteSchema, keys(), listedInSessionOrder(), moveSchema, name, paramsSchema, parse() (+7 more)

### Community 137 - "tmux-errors.ts"
Cohesion: 0.13
Nodes (20): listTmuxSessions(), foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity(), SocketPlace (+12 more)

### Community 138 - "vite.config.ts"
Cohesion: 0.12
Nodes (12): brotliAsync, compress(), gzipAsync, precompressDirectory(), PrecompressedFile, directories, canaryTests, oracleVoiceAssetNames (+4 more)

### Community 139 - "SessionCategoryStore"
Cohesion: 0.24
Nodes (7): categories(), enableSchedulerTools(), key(), refused(), remember(), SessionCategoryStore, SessionCategoriesSnapshot

### Community 140 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 141 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+3 more)

### Community 142 - "tmux-test-helpers.ts"
Cohesion: 0.24
Nodes (20): [root], assertSameIdentity(), execFileAsync, isolatedTmuxEnv(), lifelines, ownedServerPid(), ownedServers, parsePid() (+12 more)

### Community 143 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 144 - "transcript-window.ts"
Cohesion: 0.21
Nodes (11): carriedBefore(), pageTranscript(), pageWholeSession(), row(), transcriptMoved(), transcriptOf(), TranscriptPage, TranscriptPageQuery (+3 more)

### Community 145 - "session-category-store.test.ts"
Cohesion: 0.12
Nodes (8): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, directories, folder(), store(), CLOSED_SESSION_RETENTION_MS

### Community 146 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 147 - "eventually"
Cohesion: 0.19
Nodes (18): startAgentAfterClear(), exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, Screens (+10 more)

### Community 148 - "workspace-browser.ts"
Cohesion: 0.21
Nodes (17): validateKnowledgeRoot(), assertOpenedFilePath(), fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath() (+9 more)

### Community 149 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 150 - "KnowledgeStore"
Cohesion: 0.24
Nodes (3): KnowledgeStore, FakeManager, fixture()

### Community 151 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 152 - "SessionKnowledgeStore"
Cohesion: 0.20
Nodes (5): bindingKey(), RootCatalog, SessionKnowledgeStore, stateSchema, UpdateSessionKnowledgeRootInput

### Community 153 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 154 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 155 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 156 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 157 - "server/side-question.ts"
Cohesion: 0.20
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 158 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 159 - "session-knowledge-store.test.ts"
Cohesion: 0.13
Nodes (9): SessionKnowledgeConflictError, SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, stateWithPaths(), disk, fixture(), fixtures, releases (+1 more)

### Community 160 - "ActivityDetails.tsx"
Cohesion: 0.22
Nodes (16): activityDetailFailure, detailKey(), formatBytes(), keep(), kept, keptActivityDetail(), loadActivityDetail(), peekActivityDetail() (+8 more)

### Community 161 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 162 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 163 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (13): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+5 more)

### Community 164 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 165 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 166 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 167 - "session-reorder.pw.ts"
Cohesion: 0.13
Nodes (9): center(), computerOrder(), desktop, dropOnto(), longListState(), open(), phone, Point (+1 more)

### Community 168 - "knowledge-store.ts"
Cohesion: 0.13
Nodes (12): WorkspaceFixtureState, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, parseMetadata() (+4 more)

### Community 169 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 170 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 171 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (14): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot(), started() (+6 more)

### Community 172 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 173 - "renderer.test.ts"
Cohesion: 0.16
Nodes (8): render, scope, createWorkerRenderer(), RendererWorker, FakeWorker, startWorkers(), handleRenderRequest(), RenderRequest

### Community 174 - "use-markdown-document.test.tsx"
Cohesion: 0.16
Nodes (8): DocumentRenderEvent, RenderedDocumentTree, DocumentRenderer, DocumentRendererContext, synchronousRenderer, components, Reader(), show()

### Community 175 - "session-knowledge-store.ts"
Cohesion: 0.14
Nodes (15): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+7 more)

### Community 176 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 177 - "closed-sessions.ts"
Cohesion: 0.20
Nodes (13): blockParents, closedCapitals(), closedSessionContext(), excerpt(), head(), htmlElements, htmlText(), isClosedSessionContext() (+5 more)

### Community 178 - "RuntimeStatus.tsx"
Cohesion: 0.27
Nodes (9): families, modelFamily, shortModelName(), repositoryModels, RuntimeStatus(), session, glyphs, ModelFamilyIcon() (+1 more)

### Community 179 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 180 - "projection-test-helpers.ts"
Cohesion: 0.17
Nodes (11): sessionLog(), BackgroundTaskEventOptions, MAX_BACKGROUND_TASKS, MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH, lifecycleEvent(), subagentShell(), syntheticLog() (+3 more)

### Community 181 - "registerSessionKnowledgeRoutes"
Cohesion: 0.29
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 182 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 183 - "use-oracle-settings.ts"
Cohesion: 0.24
Nodes (12): getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+4 more)

### Community 184 - "capture-workbench-review.ts"
Cohesion: 0.15
Nodes (10): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, fixtureSessions (+2 more)

### Community 185 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 186 - "pwa-update.pw.ts"
Cohesion: 0.15
Nodes (4): BrowserTestSessionService, root, serve(), work

### Community 187 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 188 - "agent-service-event-projection.test.ts"
Cohesion: 0.21
Nodes (10): at(), directories, finish(), launch(), projected(), services, syncSessionTranscript(), terminalService() (+2 more)

### Community 189 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 190 - "session-resource-clear.test.ts"
Cohesion: 0.15
Nodes (13): ClaudeSdk, apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed() (+5 more)

### Community 192 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 193 - "ShellNavigation.test.tsx"
Cohesion: 0.32
Nodes (6): ClientFeature, railEntries(), initials(), useDisplayName(), DisplayNameSetting(), ShellNavigation()

### Community 194 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 195 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 196 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 197 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 198 - "boundedText"
Cohesion: 0.27
Nodes (12): addActivity(), boundedText(), eventTask(), normalizeBackgroundTask(), numberValue(), progressValue(), shellExitFromValue(), shellTask() (+4 more)

### Community 199 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 200 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxObservation, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 202 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 203 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 204 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 205 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 206 - "static-files.ts"
Cohesion: 0.27
Nodes (6): RFC-9110, AcceptedEncodings, FILE_HEADERS, isApiPath(), isAppleTouchIconProbe(), registerStaticFiles()

### Community 207 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 208 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 209 - "session-knowledge-routes.test.ts"
Cohesion: 0.22
Nodes (8): ServerRole, SessionMetadataLookup, disk, fixtures, gate(), holdWrite(), releases, trusted

### Community 210 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.27
Nodes (7): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult, submitSearch()

### Community 211 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 212 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 213 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 214 - "response-compression.ts"
Cohesion: 0.42
Nodes (8): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), varyOnAcceptEncoding()

### Community 215 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 216 - "active-sessions.test.ts"
Cohesion: 0.29
Nodes (6): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit()

### Community 217 - "recordValue"
Cohesion: 0.39
Nodes (8): errorValue(), notificationKind(), parsedValue(), recordValue(), shellTaskOutput(), taskInfoFromValue(), taskInfoListFromValue(), textFromValue()

### Community 218 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 219 - "manager-proactive-coordinator.test.ts"
Cohesion: 0.29
Nodes (4): directories, fixture(), managed(), ManagerProactiveInboxOptions

### Community 220 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 221 - "SkillSettingsService"
Cohesion: 0.29
Nodes (4): applications, directories, fixture(), SkillSettingsService

### Community 222 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 223 - "KnowledgePosition"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 224 - "session-list-collisions.test.ts"
Cohesion: 0.32
Nodes (4): kind(), sessionListCollisions(), Args, layout

### Community 225 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 226 - "session-order-routes.test.ts"
Cohesion: 0.43
Nodes (6): directories, fakeManager(), hub(), settled(), until(), upserted()

### Community 227 - "tmux-errors.integration.test.ts"
Cohesion: 0.43
Nodes (6): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog()

### Community 228 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 229 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 230 - "skill-settings-jsonc.ts"
Cohesion: 0.60
Nodes (4): document(), parseSkillSettings(), replaceDisabledSkills(), Token

### Community 231 - "markdownComponentsFor"
Cohesion: 0.53
Nodes (6): codeFenceProps(), fencedSource(), flatChildren(), markdownComponentsFor(), mermaidFencedSource(), drawnInParts()

### Community 232 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1526 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1521 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2576 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `registerHubRoutes()` connect `registerHubRoutes` to `notification-classifier.ts`, `contracts.ts`, `knowledge-store.ts`, `session-category-routes.ts`, `SessionOrderStore`, `app.ts`, `BackgroundTaskSnapshot`, `hub-routes.ts`, `claude-agent-service.ts`, `normalizeKnowledgeRelativePath`, `shared/settings-profile.ts`, `transcript-window.ts`, `registerSessionKnowledgeRoutes`, `KnowledgeStore`, `manager-store.ts`, `oracle-voice-routes.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `start()` connect `manager-agent.test.ts` to `ManagerAgent`, `manager-store.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ManagerAgent` connect `ManagerAgent` to `FakeVoiceEngine`, `ManagedSession`, `manager-agent.test.ts`, `ManagerStore`, `app.ts`, `manager-tools.ts`, `manager-store.ts`, `manager-agent.ts`, `ManagerMessage`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `AppWorkspace()` (e.g. with `submitMessage()` and `prefersLightNow()`) actually correct?**
  _`AppWorkspace()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1526 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.021660649819494584 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03412863070539419 - nodes in this community are weakly interconnected._
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
