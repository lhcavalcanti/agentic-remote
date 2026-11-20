# Agentic Remote - Graphify code map

Snapshot: `91c3318e5c6fbd7f1c6ff065a44b3aa682ce6745c57d5e34c33925cffb80e81f`

Source checkout: `56c04e437c59a284febe51a581cb761c061df96d`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 635 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 635 files · ~1,136,425 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 8901 nodes · 25734 edges · 260 communities (216 shown, 26 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1300 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionStore
- api.ts
- AppWorkspace
- SessionDetail
- terminal-session.ts
- contracts.ts
- manager-structured-memory.ts
- app.ts
- agent-service.ts
- sessionKey
- client.ts
- CopilotClientLike
- claude-agent-service.ts
- ManagerStore
- notification-center-service.ts
- manager-agent.ts
- App.tsx
- ManagedSession
- OracleVoiceCoordinator
- RemoteNodeClient
- agentic-remote-promotion-monitor
- ManagerMessage
- tmux-test-helpers.ts
- manager-tools.ts
- oracle-voice-soak.ts
- active-sessions.ts
- ManagerAgent
- oracle-voice-child.ts
- schedule-launcher.ts
- oracle-voice-integration.test.ts
- scheduler-store.ts
- shared/settings-profile.ts
- oracle-task-store.ts
- CopilotSessionLike
- oracle-voice-engine.ts
- transcription-service.ts
- TmuxTerminalSessionController
- VoiceAudioFrame
- dreamer-service.ts
- SessionService
- schedules.ts
- oracle-voice-worker.ts
- setupWorkspaceFixture
- manager-structured-memory-validation.ts
- SchedulerStore
- controls.tsx
- src/settings-profile.ts
- workspace-fixtures.ts
- DreamerService
- sampler.ts
- AgentProvider
- AppSettingsDialog.tsx
- oracle-voice-benchmark.ts
- OracleDreamer.tsx
- FakeVoiceEngine
- ProviderSessionService
- oracle-voice-session.ts
- agentic-remote
- session-directory.ts
- FakeSessionService
- server/skill-settings.ts
- dreamer-progress.ts
- send-matrix.integration.test.ts
- oracle-voice-routes.ts
- PushNotificationService
- agentic-remote-gate
- hub-routes.ts
- oracle-voice.ts
- bundle
- preview-features.ts
- ManagerAssistant.tsx
- ui-scenes.ts
- DreamerStore
- ResidentVoiceWorker
- shell.ts
- VoicePlayback
- FakeVoiceController
- react
- lib.rs
- manager-proactive-coordinator.ts
- node-routes.ts
- schedule-recurrence.ts
- dependencies
- oracle-voice-config.ts
- VoiceCapture
- client.test.ts
- agentic-remote-promotion-setup
- .cancel
- terminal-session.test.ts
- devDependencies
- config.rs
- agent-service.test.ts
- manager-proactive-inbox.ts
- normalizeKnowledgeRelativePath
- pipeline.test.tsx
- NodeIdentityStore
- oracle-voice-security.test.ts
- knowledge-tree.ts
- manager-context.ts
- oracle-voice-routes.test.ts
- markdown-navigation.ts
- remote-voice-client.ts
- oracle-voice-segments.ts
- sections.tsx
- ChatMessage
- SessionOrderStore
- background-task-adapter.ts
- dreamer-planner.ts
- Composer.tsx
- UserInputReplyInput
- ManagerAttachment
- session-patch-browser.ts
- capture-workspace.ts
- check-workspace-review-regressions.ts
- cli-canary.ts
- .toolHost
- scripts
- DialogFrame.tsx
- pipeline.ts
- use-markdown-document.test.tsx
- SessionKnowledgeStore
- host-telemetry.ts
- HostMonitorView.test.tsx
- usePreviewFeature
- PromptCards.tsx
- compilerOptions
- closed-sessions.ts
- ManagerAssistant.test.tsx
- transport.test.ts
- session-reply-durability.test.ts
- recovery-seed-guards.test.ts
- oracle-voice-tickets.ts
- compilerOptions
- full-gate.test.ts
- HostSnapshot
- service.ts
- .observe
- oracle-voice-coordinator.test.ts
- session-store-providers.test.ts
- session-response-order.ts
- compilerOptions
- KnowledgeStore
- ManagerProactiveInbox
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- background-task-stop.test.ts
- HostTelemetrySampler
- ManagerMemory
- session-knowledge-store.ts
- session-latency-benchmark.ts
- session-resource-routes.test.ts
- dreamer-schedule.ts
- oracle-status.test.ts
- promotion-monitor.test.ts
- terminal-startup-queue.test.ts
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- session-knowledge-routes.ts
- ScheduleWorktreeService
- backgroundTasksFromEvents
- knowledge-store.ts
- registerSessionKnowledgeRoutes
- ScheduleNotificationService
- server/session-patches.ts
- ComposerActions.tsx
- package.json
- terminal-form-deadline.test.ts
- manager-runtime.ts
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- pending-echo.ts
- SessionNavigation.test.tsx
- .oxlintrc.json
- settings-local.json
- recordValue
- background-task-tracker.ts
- dreamer-routes.ts
- dreamer-service.test.ts
- manager-proactive-inbox.test.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- SessionAdmissions
- use-oracle-attachments.ts
- dataset
- generate-pwa-icons.ts
- session-knowledge-routes.test.ts
- alerts.test.ts
- ManagerProactiveInboxValidationError
- session-unread-tracker.ts
- bridge.rs
- vite.config.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- session-knowledge-store.test.ts
- tmux-errors.test.ts
- SkillsSettings.tsx
- askSideQuestion
- sent-message.ts
- doctor-cli.test.ts
- release-publication.test.ts
- session-patch-routes.test.ts
- UserInputFieldControl
- history-projection.test.ts
- HostTelemetryClock
- session-order-routes.test.ts
- settings.ts
- DocumentViewControls.tsx
- .transport
- composer-layout.test.ts
- markdownComponentsFor
- usePanelWidth
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- hasActiveBackgroundTasks
- appearance.ts
- FakeRecorder
- FakeRecorder
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
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (260 total, 26 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (23): agentMode(), AgentService, isRuntimeReasoningEffort(), isTerminalNotReadyRefusal(), isUncertainDelivery(), lifecycleRefusal(), permissionTitle(), restart() (+15 more)

### Community 1 - "SessionStore"
Cohesion: 0.03
Nodes (95): fixture(), directories, fakeClient(), fixture(), ForkRequest, forkSession(), services, connect() (+87 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (147): SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), activateSession(), addKnowledgeRoot(), askSession(), bootstrapSessionOrder() (+139 more)

### Community 3 - "AppWorkspace"
Cohesion: 0.03
Nodes (152): terminalSendOptions(), sessionFileValidationError(), submissionReceiptFromError(), AppWorkspace(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applySession() (+144 more)

### Community 4 - "SessionDetail"
Cohesion: 0.03
Nodes (29): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services (+21 more)

### Community 5 - "terminal-session.ts"
Cohesion: 0.04
Nodes (120): activeBottomFrame(), afterExit(), backgroundShellsAllow(), boxedComposerFrame(), busyOnlyWithBackgroundShells(), busyRowStatus(), captureBeforeDeadline(), captureForReplacement() (+112 more)

### Community 6 - "contracts.ts"
Cohesion: 0.04
Nodes (94): AgentServiceEvents, ClaudeAgentServiceEvents, RemoteSessionListing, DirectoryScope, awaitTermination(), LaunchCreations, apps, directories (+86 more)

### Community 7 - "manager-structured-memory.ts"
Cohesion: 0.04
Nodes (74): DreamerMemoryMetadataRecord, capturePrompt(), benchmarkState(), now(), openFixture(), searchSamples(), initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime (+66 more)

### Community 8 - "app.ts"
Cohesion: 0.03
Nodes (72): apps, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName() (+64 more)

### Community 9 - "agent-service.ts"
Cohesion: 0.04
Nodes (81): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+73 more)

### Community 10 - "sessionKey"
Cohesion: 0.04
Nodes (83): CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), BackgroundTaskSnapshot, ComputerSummary, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, listClosedSessions() (+75 more)

### Community 11 - "client.ts"
Cohesion: 0.05
Nodes (38): ManagerClientDefaults, ORACLE_VOICE_CONNECTION_TIMEOUT_MS, VoiceCapabilities, VoiceServerControl, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError() (+30 more)

### Community 12 - "CopilotClientLike"
Cohesion: 0.02
Nodes (72): root, script, CopilotClientLike, ClaudeSdk, deferred(), disk, fixtures, holdClaimWrite() (+64 more)

### Community 13 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (65): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+57 more)

### Community 14 - "ManagerStore"
Cohesion: 0.05
Nodes (38): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+30 more)

### Community 15 - "notification-center-service.ts"
Cohesion: 0.05
Nodes (52): center(), directories, directory(), hub(), now, runtimes, trusted, NotificationCenterService (+44 more)

### Community 16 - "manager-agent.ts"
Cohesion: 0.04
Nodes (66): CreationRuntime, DreamerProgressView, automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkEvent (+58 more)

### Community 17 - "App.tsx"
Cohesion: 0.03
Nodes (77): isManagerEvent(), activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), sidebarResizeMove() (+69 more)

### Community 18 - "ManagedSession"
Cohesion: 0.08
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, SessionLauncherOptions, directories (+5 more)

### Community 19 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (23): ManagerEventSource, ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect() (+15 more)

### Community 20 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (21): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, requestBytes(), client(), servers, session (+13 more)

### Community 21 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 22 - "ManagerMessage"
Cohesion: 0.04
Nodes (25): FakeManager, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, ProactiveManager, FakeAgent, confirmationSchema (+17 more)

### Community 23 - "tmux-test-helpers.ts"
Cohesion: 0.05
Nodes (66): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+58 more)

### Community 24 - "manager-tools.ts"
Cohesion: 0.05
Nodes (38): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), changeSuspension() (+30 more)

### Community 25 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 26 - "active-sessions.ts"
Cohesion: 0.06
Nodes (53): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+45 more)

### Community 27 - "ManagerAgent"
Cohesion: 0.08
Nodes (11): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, uniqueManagerSessionRefs() (+3 more)

### Community 28 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (47): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, createVoiceWorker(), defaultSpawnPiper(), errorMessage() (+39 more)

### Community 29 - "schedule-launcher.ts"
Cohesion: 0.08
Nodes (28): LaunchPrimitives, provenance(), ScheduleLauncherHost, ScheduleProvenance, scheduleSessionTitle(), SessionScheduleLauncher, NoopScheduleLauncher, ScheduleLauncher (+20 more)

### Community 30 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (34): ManagerSdkClient, apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+26 more)

### Community 31 - "scheduler-store.ts"
Cohesion: 0.06
Nodes (49): ComputerManagerEvents, attentionClosed(), attentionSeed(), classifyHubNotification(), classifyOracleNotification(), classifyScheduleNotification(), HOST_ALERT_MEMORY_DURATION_MS, notificationIdentity() (+41 more)

### Community 32 - "shared/settings-profile.ts"
Cohesion: 0.06
Nodes (53): WorkspaceFixtureState, execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), directories (+45 more)

### Community 33 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (46): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+38 more)

### Community 34 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (34): CopilotSessionLike, CopilotTasksApi, nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused() (+26 more)

### Community 35 - "oracle-voice-engine.ts"
Cohesion: 0.05
Nodes (22): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+14 more)

### Community 36 - "transcription-service.ts"
Cohesion: 0.06
Nodes (34): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionMultipartOptions (+26 more)

### Community 37 - "TmuxTerminalSessionController"
Cohesion: 0.07
Nodes (19): startAgentAfterClear(), composer(), processAdapter, awaitingRelaunch(), copilotCommand(), DownloadedUpdateCell, endProbeSession(), execFileAsync (+11 more)

### Community 38 - "VoiceAudioFrame"
Cohesion: 0.04
Nodes (30): BrowserCaptureOptions, SocketMessage, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, ORACLE_VOICE_SAMPLE_RATE, VoiceAudioFrame (+22 more)

### Community 39 - "dreamer-service.ts"
Cohesion: 0.06
Nodes (53): DreamerHistoryEntry, DreamerPlanDraft, DreamerPlannerInput, DreamerPlannerExecutionInput, safeRunError(), unavailableSnapshot(), assertInteger(), DREAMER_LEASE_MS (+45 more)

### Community 40 - "SessionService"
Cohesion: 0.06
Nodes (7): nodeVoiceCapabilities(), registerNodeRoutes(), SessionService, WorkspaceFile, WorkspaceListing, KnowledgeFolderState, WorkspaceFileIcon()

### Community 41 - "schedules.ts"
Cohesion: 0.06
Nodes (53): action, create, existing, metadata, scheduleProposalInputSchema, ScheduleProposalsChanged, scheduleProposalSchema, update (+45 more)

### Community 42 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (24): benchmarkGroup(), VoiceTtsEngine, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent(), isEnabledConfig() (+16 more)

### Community 43 - "setupWorkspaceFixture"
Cohesion: 0.04
Nodes (30): pageFor(), desktop, devices, long, open(), phone, veryLong, bounds() (+22 more)

### Community 44 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (52): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+44 more)

### Community 45 - "SchedulerStore"
Cohesion: 0.10
Nodes (13): enableSchedulerTools(), fixture(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, createInput(), fixture() (+5 more)

### Community 46 - "controls.tsx"
Cohesion: 0.08
Nodes (49): NewSessionBackendSetting, listDirectories(), AddKnowledgeRootDialog(), browse(), shortcutKeys(), readStoredShortcuts(), AppShortcutBinding, binding() (+41 more)

### Community 47 - "src/settings-profile.ts"
Cohesion: 0.08
Nodes (26): sameSettingValue(), SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileSnapshot, SettingsProfileValues, statuslineItems, CachedProfile, defaultRetryDelaysMs (+18 more)

### Community 48 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (38): frame(), geometry, output, scratch, screenshot(), { values }, oracleHostStatusFixture(), bounds() (+30 more)

### Community 49 - "DreamerService"
Cohesion: 0.12
Nodes (10): DreamerMemoryMetadata, boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs() (+2 more)

### Community 50 - "sampler.ts"
Cohesion: 0.08
Nodes (45): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+37 more)

### Community 51 - "AgentProvider"
Cohesion: 0.06
Nodes (29): updateComputerForLaunchIdentity(), closable(), provider(), delay(), requireFolderTrust(), sameFolder(), SessionFolderTrustPolicy, SessionLaunch (+21 more)

### Community 52 - "AppSettingsDialog.tsx"
Cohesion: 0.08
Nodes (46): getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), currentAppViewportGeometry(), snapshot, gatewayRefused() (+38 more)

### Community 53 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 54 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (43): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+35 more)

### Community 55 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (23): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+15 more)

### Community 57 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (16): acquisitionCancelled(), ActiveUtterance, asSessionError(), AudioReservation, capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled() (+8 more)

### Community 58 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 59 - "session-directory.ts"
Cohesion: 0.10
Nodes (36): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+28 more)

### Community 60 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 61 - "server/skill-settings.ts"
Cohesion: 0.09
Nodes (29): instrument(), builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills() (+21 more)

### Community 62 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 63 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (40): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+32 more)

### Community 64 - "oracle-voice-routes.ts"
Cohesion: 0.08
Nodes (36): sendNodeVoiceOutput(), OracleVoiceBackendConnector, OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes() (+28 more)

### Community 65 - "PushNotificationService"
Cohesion: 0.10
Nodes (12): start(), NotificationRecorder, OracleEventSource, PushNotificationService, directories, scoped(), RFC-8030, registerPushRoutes() (+4 more)

### Community 66 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 67 - "hub-routes.ts"
Cohesion: 0.06
Nodes (42): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+34 more)

### Community 68 - "oracle-voice.ts"
Cohesion: 0.09
Nodes (35): capabilities, closeServers, exactArrayBuffer(), sockets, startFields, VoiceNode, decodeVoiceAudioFrame(), encodeVoiceAudioFrame() (+27 more)

### Community 69 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 70 - "preview-features.ts"
Cohesion: 0.11
Nodes (28): hub(), AppVersion, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable() (+20 more)

### Community 71 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (36): editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), canTakeFocus() (+28 more)

### Community 72 - "ui-scenes.ts"
Cohesion: 0.09
Nodes (27): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+19 more)

### Community 73 - "DreamerStore"
Cohesion: 0.13
Nodes (11): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, emptyState(), isMissing() (+3 more)

### Community 74 - "ResidentVoiceWorker"
Cohesion: 0.13
Nodes (9): combinedTranscript(), matchesCancelled(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceGenerationIdentity, VoiceSynthesisRequest, ActiveSynthesisIdentity (+1 more)

### Community 75 - "shell.ts"
Cohesion: 0.09
Nodes (35): ScheduleShellNotifier, attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label() (+27 more)

### Community 76 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 77 - "FakeVoiceController"
Cohesion: 0.09
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 78 - "react"
Cohesion: 0.11
Nodes (30): react, scheduleProposalSummary(), CLAUDE_SCHEDULE_UNAVAILABLE_REASON, ScheduleTarget, drawDiagram(), drawing, MermaidDiagram(), FolderPicker() (+22 more)

### Community 79 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 80 - "manager-proactive-coordinator.ts"
Cohesion: 0.11
Nodes (14): DreamerServiceOptions, batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, SessionLifecycle (+6 more)

### Community 81 - "node-routes.ts"
Cohesion: 0.06
Nodes (36): FileUploadError, registerFileUploadRoutes(), SessionParams, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema (+28 more)

### Community 82 - "schedule-recurrence.ts"
Cohesion: 0.11
Nodes (36): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+28 more)

### Community 83 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 84 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (28): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+20 more)

### Community 85 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 86 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 87 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 88 - ".cancel"
Cohesion: 0.09
Nodes (6): removeCopilotSessionFiles(), forgetSessionEvents(), sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout()

### Community 89 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (29): isTerminalSessionInUsePrompt(), reportOnce(), reportUnrecognisedComposer(), reportUnrecognisedComposerParts(), reportUnrecognisedFooter(), submitTerminalForm(), terminalChecklistState(), terminalFormCommitKeys() (+21 more)

### Community 90 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 91 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 92 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (16): terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), DeferredSession, directories, FakeCopilotClient, normalSdkSessionConfiguration (+8 more)

### Community 93 - "manager-proactive-inbox.ts"
Cohesion: 0.09
Nodes (36): assertExactKeys(), canonicalHash(), DISPOSITIONS, eventId(), hasExactKeys(), isAlreadyExists(), isDisposition(), isEventKind() (+28 more)

### Community 94 - "normalizeKnowledgeRelativePath"
Cohesion: 0.10
Nodes (27): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), SessionKnowledgeBinding, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+19 more)

### Community 95 - "pipeline.test.tsx"
Cohesion: 0.11
Nodes (26): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+18 more)

### Community 96 - "NodeIdentityStore"
Cohesion: 0.09
Nodes (16): connections, fixture(), managers, releases, remote, session(), ComputerRegistry, DurableRegisteredComputer (+8 more)

### Community 97 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (21): FakeVoiceEngineCall, VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), connect(), createManager() (+13 more)

### Community 98 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+24 more)

### Community 99 - "manager-context.ts"
Cohesion: 0.12
Nodes (27): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+19 more)

### Community 100 - "oracle-voice-routes.test.ts"
Cohesion: 0.08
Nodes (17): exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), ObservedLocalVoiceBackend, openApps, openSockets, RouteManager (+9 more)

### Community 101 - "markdown-navigation.ts"
Cohesion: 0.12
Nodes (30): followMarkdownLink(), KnowledgeReader(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument(), BreadcrumbSegment (+22 more)

### Community 102 - "remote-voice-client.ts"
Cohesion: 0.15
Nodes (14): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError() (+6 more)

### Community 103 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 104 - "sections.tsx"
Cohesion: 0.11
Nodes (21): AppearanceSetting, getHubHealth(), SettingScope(), HealthCard(), HealthDetails(), accentThemes, appearanceOptions, notificationScopeOptions (+13 more)

### Community 105 - "ChatMessage"
Cohesion: 0.11
Nodes (17): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp(), Client, Browser (+9 more)

### Community 106 - "SessionOrderStore"
Cohesion: 0.16
Nodes (12): orderStore(), carried(), laneFrom(), retire(), sameLane(), sessionOrderKey(), SessionOrderState, SessionOrderStore (+4 more)

### Community 107 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (27): addActivity(), attachmentModeValue(), BackgroundTaskEventOptions, booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, eventTask() (+19 more)

### Community 108 - "dreamer-planner.ts"
Cohesion: 0.14
Nodes (27): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+19 more)

### Community 109 - "Composer.tsx"
Cohesion: 0.14
Nodes (14): families, modelFamily, repositoryModels, AttachmentStrip(), Composer(), QueuedPromptList(), RuntimeStatus(), session (+6 more)

### Community 110 - "UserInputReplyInput"
Cohesion: 0.16
Nodes (6): persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, PendingPermission, PendingUserInput, UserInputReplyInput

### Community 111 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 112 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (26): advance(), Connection, connections, content(), FrameMeasurement, lastHeading(), message(), open() (+18 more)

### Community 113 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 114 - "check-workspace-review-regressions.ts"
Cohesion: 0.08
Nodes (14): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+6 more)

### Community 115 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 116 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 117 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 118 - "DialogFrame.tsx"
Cohesion: 0.12
Nodes (19): addComputer(), changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame() (+11 more)

### Community 119 - "pipeline.ts"
Cohesion: 0.13
Nodes (24): holdingRenderer(), openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), render, scope, documentOpening() (+16 more)

### Community 120 - "use-markdown-document.test.tsx"
Cohesion: 0.11
Nodes (11): DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), DocumentRenderer, DocumentRendererContext, RendererWorker, synchronousRenderer, FakeWorker (+3 more)

### Community 121 - "SessionKnowledgeStore"
Cohesion: 0.16
Nodes (6): bindingKey(), RootCatalog, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateSchema, UpdateSessionKnowledgeRootInput

### Community 122 - "host-telemetry.ts"
Cohesion: 0.12
Nodes (21): fixtureScheduleRuns, fixtureSchedules, aggregate, DiskSpaceSchema, HOST_TELEMETRY_CAPABILITY_VERSION, HOST_TELEMETRY_INVALID_CLOSE_CODE, HostHistorySchema, HostInfoSchema (+13 more)

### Community 123 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 124 - "usePreviewFeature"
Cohesion: 0.16
Nodes (15): SessionProvenance, readScheduleLink(), ScheduleLink, scheduleNotificationLabel(), usePreviewFeature(), clients, EffectiveState(), SchedulerDraft() (+7 more)

### Community 125 - "PromptCards.tsx"
Cohesion: 0.11
Nodes (18): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+10 more)

### Community 126 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 127 - "closed-sessions.ts"
Cohesion: 0.12
Nodes (10): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS, closedSessionContext(), excerpt(), isClosedSessionContext() (+2 more)

### Community 128 - "ManagerAssistant.test.tsx"
Cohesion: 0.09
Nodes (15): cancelManager(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+7 more)

### Community 129 - "transport.test.ts"
Cohesion: 0.11
Nodes (14): prefixes, session, trusted, untrusted, BuildAppOptions, ProcessScanContext, HostTelemetryService, readingFixture() (+6 more)

### Community 130 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+10 more)

### Community 131 - "recovery-seed-guards.test.ts"
Cohesion: 0.10
Nodes (14): holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), bootLegacy(), directories (+6 more)

### Community 132 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 133 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 134 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 135 - "HostSnapshot"
Cohesion: 0.14
Nodes (13): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, HOST_TELEMETRY_MAX_QUEUE_BYTES (+5 more)

### Community 136 - "service.ts"
Cohesion: 0.17
Nodes (9): HostRequest, registerHostTelemetryRoutes(), HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError(), HostTelemetryTarget, HostTelemetrySocket, HOST_TELEMETRY_INVALID_CODE (+1 more)

### Community 137 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 138 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.13
Nodes (10): OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend, Harness (+2 more)

### Community 139 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 140 - "session-response-order.ts"
Cohesion: 0.15
Nodes (19): applyComputerSnapshot(), checkComputerConnections(), computerAdded(), computerRemoved(), discardUnpairedComputers(), forgetComputerKnowledge(), liftUnpairedTombstones(), tombstoneUnpairedSession() (+11 more)

### Community 141 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 142 - "KnowledgeStore"
Cohesion: 0.24
Nodes (3): KnowledgeStore, FakeManager, fixture()

### Community 143 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

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

### Community 148 - "background-task-stop.test.ts"
Cohesion: 0.16
Nodes (16): CopilotTaskInfo, CopilotTaskProgress, MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit() (+8 more)

### Community 149 - "HostTelemetrySampler"
Cohesion: 0.20
Nodes (3): HostTelemetrySampler, HostMinuteAggregate, HostSample

### Community 150 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 151 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (17): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+9 more)

### Community 152 - "session-latency-benchmark.ts"
Cohesion: 0.22
Nodes (17): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+9 more)

### Community 153 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 154 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 155 - "oracle-status.test.ts"
Cohesion: 0.19
Nodes (14): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+6 more)

### Community 156 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 157 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (10): client(), delayQueueWrite(), disk, exec, gate(), holdQueueCommit(), NativeFixture, NativeRuntime (+2 more)

### Community 158 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 159 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 160 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 161 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 162 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 163 - "ScheduleWorktreeService"
Cohesion: 0.35
Nodes (5): execute, failure(), missing(), ScheduleWorktreeService, ScheduleWorktreeRecord

### Community 164 - "backgroundTasksFromEvents"
Cohesion: 0.19
Nodes (16): backgroundTasksFromEvents(), eventString(), isLiveTaskStatus(), isOlderExecution(), isShellObserverTool(), isShellStopTool(), isShellTool(), isTerminalTaskStatus() (+8 more)

### Community 165 - "knowledge-store.ts"
Cohesion: 0.14
Nodes (11): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, parseMetadata(), PersistedKnowledgeState (+3 more)

### Community 166 - "registerSessionKnowledgeRoutes"
Cohesion: 0.26
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 167 - "ScheduleNotificationService"
Cohesion: 0.21
Nodes (3): HubEventSource, ScheduleNotificationService, ScheduleRunNotification

### Community 168 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 169 - "ComposerActions.tsx"
Cohesion: 0.20
Nodes (6): composerSteeringUnavailableReason(), ComposerActions(), ContextRing(), SendControl(), TriggerProps, SessionActions()

### Community 170 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 171 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane(), Phase (+3 more)

### Community 172 - "manager-runtime.ts"
Cohesion: 0.24
Nodes (11): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+3 more)

### Community 173 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 174 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 175 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 176 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 177 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 178 - "SessionNavigation.test.tsx"
Cohesion: 0.18
Nodes (12): actions, backgroundTasks, computers, hiddenVisibility, NavigationHarness(), offline, question, session (+4 more)

### Community 179 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 180 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 181 - "recordValue"
Cohesion: 0.24
Nodes (13): backgroundHandoff(), errorValue(), notificationKind(), parsedValue(), rawTailText(), recordValue(), shellIdFromFooter(), shellIdFromValue() (+5 more)

### Community 182 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 183 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 185 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 186 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 187 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 189 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 190 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 191 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 192 - "session-knowledge-routes.test.ts"
Cohesion: 0.22
Nodes (8): ServerRole, SessionMetadataLookup, disk, fixtures, gate(), holdWrite(), releases, trusted

### Community 193 - "alerts.test.ts"
Cohesion: 0.27
Nodes (7): computer, observe(), snapshot(), start, sustained(), classifyHostNotification(), HOST_ALERT_COOLDOWN_MS

### Community 194 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 195 - "session-unread-tracker.ts"
Cohesion: 0.29
Nodes (5): FinishedSession, SessionUnreadTracker, finished(), SessionTurnState, turnEnded()

### Community 196 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 197 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 198 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 199 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 200 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 201 - "tmux-errors.test.ts"
Cohesion: 0.25
Nodes (6): directories, { execute }, files, links, listener(), server()

### Community 202 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 203 - "askSideQuestion"
Cohesion: 0.33
Nodes (7): askSideQuestion(), closeSideQuestion(), openSideQuestion(), sideQuestionKeyDown(), submitSideQuestion(), updateSideThread(), sideQuestionCommand()

### Community 204 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 205 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 206 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 207 - "session-patch-routes.test.ts"
Cohesion: 0.29
Nodes (5): apps, directories, FakeManager, fixture(), trusted

### Community 208 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 209 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 211 - "session-order-routes.test.ts"
Cohesion: 0.43
Nodes (6): directories, fakeManager(), hub(), settled(), until(), upserted()

### Community 212 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 213 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 215 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 216 - "markdownComponentsFor"
Cohesion: 0.53
Nodes (6): codeFenceProps(), fencedSource(), flatChildren(), markdownComponentsFor(), mermaidFencedSource(), drawnInParts()

### Community 217 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 218 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 219 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 221 - "appearance.ts"
Cohesion: 0.50
Nodes (3): Appearance, appearanceFrom(), appearanceStorageKey

## Knowledge Gaps
- **1421 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1416 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2379 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `NodeIdentityStore`, `remote-voice-client.ts`, `contracts.ts`, `SessionService`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `CopilotSessionLike`, `SessionDetail`, `contracts.ts`, `agent-service.ts`, `claude-agent-service.ts`, `UserInputReplyInput`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `ComputerManager` connect `ManagedSession` to `NodeIdentityStore`, `claude-agent-service.ts`, `contracts.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1421 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03232122117139539 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.025779578971068334 - nodes in this community are weakly interconnected._
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
- `e2e/ui-locks.pw.ts-snapshots/desktop-composer-refresh-attachment-chromium-linux.png`
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
