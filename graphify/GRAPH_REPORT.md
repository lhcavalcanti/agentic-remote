# Agentic Remote - Graphify code map

Snapshot: `a113ab3faa5df1b478e70a899665e1c663f2c1991f5045c3f3b6b000ebf04d54`

Source checkout: `525a4507aa0177c8a1bf5aa3c93657129e68f0fa`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 662 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 662 files · ~1,173,315 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9244 nodes · 26681 edges · 261 communities (217 shown, 26 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1328 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionDetail
- SessionStore
- api.ts
- AppWorkspace
- App.tsx
- schedules.ts
- manager-agent.ts
- agent-service.ts
- oracle-voice-soak.ts
- dreamer-service.ts
- notification-classifier.ts
- terminal-session.ts
- ClaudeAgentService
- contracts.ts
- ManagedSession
- .takeInTranscript
- ManagerStore
- registerHubRoutes
- hub-routes.ts
- ManagerAgent
- sections.tsx
- AppSettingsDialog.tsx
- claude-agent-service.ts
- session-presentation.ts
- oracle-voice-child.ts
- OracleVoiceCoordinator
- agentic-remote-promotion-monitor
- oracle-voice-integration.test.ts
- PushNotificationService
- RemoteNodeClient
- shared/settings-profile.ts
- app.ts
- session-store-providers.test.ts
- FakeVoiceEngine
- queued-dispatch.test.ts
- transcription-service.ts
- SessionService
- TerminalSessionController
- tmux-test-helpers.ts
- oracle-voice.ts
- oracle-voice-benchmark.ts
- ui-scenes.ts
- manager-structured-memory-validation.ts
- workspace-fixtures.ts
- ProviderSessionService
- src/settings-profile.ts
- oracle-voice-worker.ts
- sampler.ts
- DreamerService
- background-task-adapter.ts
- dreamer-store.ts
- oracle-voice-session.ts
- OracleDreamer.tsx
- setupWorkspaceFixture
- TmuxTerminalSessionController
- tmux-errors.integration.test.ts
- terminal-session.test.ts
- agentic-remote
- CopilotClientLike
- OracleVoiceClient
- session-directory.ts
- ComposerActions.tsx
- normalizeKnowledgeRelativePath
- agentic-remote-gate
- server/skill-settings.ts
- bundle
- agent-service.test.ts
- FakeSessionService
- client.ts
- processes.ts
- terminal-startup-queue.test.ts
- VoicePlayback
- remote-voice-client.ts
- FakeVoiceController
- active-sessions.ts
- oracle-voice-config.ts
- DreamerStore
- shell.ts
- lib.rs
- recovery-resend-durability.test.ts
- oracle-voice-routes.ts
- ManagerAssistant.tsx
- client.test.ts
- dependencies
- SchedulerStore
- agentic-remote-promotion-setup
- SessionOrderStore
- capture.ts
- devDependencies
- config.rs
- knowledge-tree.ts
- dreamer-planner.ts
- manager-context.ts
- manager-proactive-inbox.ts
- oracle-voice-child.test.ts
- VoiceCapture
- manager-structured-memory.ts
- ScheduleWorktreeService
- ActivityDetails.tsx
- SchedulerDispatcher
- session-prefetch.ts
- closed-sessions.ts
- oracle-voice-security.test.ts
- scheduler-dispatcher.ts
- send-matrix.integration.test.ts
- markdown-navigation.ts
- real-voice.ts
- VoiceAudioFrame
- ManagerProactiveCoordinator
- ManagerAttachment
- pipeline.ts
- capture-workspace.ts
- ChatMessage
- oracle-voice-coordinator.test.ts
- ManagerAssistant.test.tsx
- use-markdown-document.test.tsx
- cli-canary.ts
- service.ts
- startup-phases.test.ts
- session-launcher.ts
- scripts
- session-patch-browser.ts
- manager-structured-memory-search.ts
- session-response-order.ts
- use-markdown-document.ts
- controls.tsx
- compilerOptions
- ManagerStructuredMemoryStore
- oracle-voice-segments.ts
- session-clear-transcript.test.ts
- DreamerProgress
- remote.ts
- tmux-errors.ts
- ManagerProactiveInbox
- oracle-voice-tickets.ts
- SessionKnowledgeStore
- HostMonitorView.test.tsx
- session-patches.test.ts
- compilerOptions
- full-gate.test.ts
- .observe
- refusal-metrics.ts
- session-reply-durability.test.ts
- PromptCards.tsx
- host-telemetry.ts
- compilerOptions
- transcript-window.ts
- OnlineRecognizer
- ActivityRow.test.tsx
- BackgroundTasksDialog.tsx
- MessageTime.tsx
- compilerOptions
- compilerOptions
- RuntimeModelOption
- oracle-status.test.ts
- ManagerMemory
- server/session-patches.ts
- dreamer-schedule.ts
- KnowledgeStore
- scheduler-store.ts
- promotion-monitor.test.ts
- ScheduleRun
- NotificationPanel.tsx
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- session-latency-benchmark.ts
- session-knowledge-routes.ts
- session-knowledge-store.ts
- terminal-form-deadline.test.ts
- transport.test.ts
- BackgroundTask
- HostTelemetrySampler
- knowledge-store.ts
- session-resource-routes.test.ts
- package.json
- session-unread.pw.ts
- registerSessionKnowledgeRoutes
- oracle-voice-assets.test.ts
- BackgroundTasksDialog.test.tsx
- fake-vad.ts
- desktop.json
- DeferredSession
- background-task-stop.test.ts
- LargeSessionService
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- manager-proactive-inbox.test.ts
- schedule-launcher.test.ts
- ScheduleNotificationService
- Pcm16Resampler
- use-oracle-attachments.ts
- html-preview.ts
- document-render.pw.ts
- sign-in-expired.pw.ts
- .initialize
- dataset
- generate-pwa-icons.ts
- .persist
- session-unread-tracker.ts
- bridge.rs
- transcribeAudio
- vite.config.ts
- logs-cli.test.ts
- ManagerProactiveInboxValidationError
- manager-structured-memory-performance.test.ts
- promotion-setup-execution.test.ts
- response-compression.ts
- session-knowledge-store.test.ts
- doctor-cli.test.ts
- release-publication.test.ts
- composer-layout.test.ts
- HostTelemetryClock
- settings.ts
- DocumentViewControls.tsx
- background-task-adapter.test.ts
- usePanelWidth
- worker-handler.ts
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- copyText
- MemoryStorage
- terminal-send-uncertainty.test.ts
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
1. `AppWorkspace()` - 355 edges
2. `SessionDetail` - 327 edges
3. `AgentService` - 317 edges
4. `SessionStore` - 218 edges
5. `ManagedSession` - 188 edges
6. `buildApp()` - 141 edges
7. `ClaudeAgentService` - 133 edges
8. `registerHubRoutes()` - 111 edges
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

## Communities (261 total, 26 thin omitted)

### Community 0 - "SessionDetail"
Cohesion: 0.03
Nodes (17): agentMode(), AgentService, isTerminalNotReadyRefusal(), permissionTitle(), RuntimeConfigurationError, runtimeInfoMatches(), PendingClaudeReply, preparePrompt() (+9 more)

### Community 1 - "SessionStore"
Cohesion: 0.02
Nodes (104): complete(), event(), sessionWithLog(), start(), fixture(), restart(), directories, fakeClient() (+96 more)

### Community 2 - "api.ts"
Cohesion: 0.02
Nodes (158): AddKnowledgeRootInput, PushSettings, SessionKnowledgeRootMutationInput, ResolveManagerConfirmationInput, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionReceipt (+150 more)

### Community 3 - "AppWorkspace"
Cohesion: 0.03
Nodes (176): isManagerEvent(), askSession(), clearConversation(), closeSession(), deleteSession(), recoverConversation(), removeQueuedPrompt(), reorderQueuedPrompts() (+168 more)

### Community 4 - "App.tsx"
Cohesion: 0.03
Nodes (115): hasActiveBackgroundTasks(), hasForegroundTurn(), extension(), MAX_SESSION_FILE_BYTES, sessionFileValidationError(), supportedExtensions, supportsSessionFile(), listClosedSessions() (+107 more)

### Community 5 - "schedules.ts"
Cohesion: 0.03
Nodes (117): react, CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField() (+109 more)

### Community 6 - "manager-agent.ts"
Cohesion: 0.03
Nodes (85): FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, DreamerProgressView, automaticPayload(), discover(), isPending() (+77 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.03
Nodes (112): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+104 more)

### Community 8 - "oracle-voice-soak.ts"
Cohesion: 0.03
Nodes (50): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+42 more)

### Community 9 - "dreamer-service.ts"
Cohesion: 0.03
Nodes (78): DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply (+70 more)

### Community 10 - "notification-classifier.ts"
Cohesion: 0.04
Nodes (68): HOST_ALERT_POLL_INTERVAL_MS, computer, observe(), snapshot(), start, sustained(), center(), directories (+60 more)

### Community 11 - "terminal-session.ts"
Cohesion: 0.04
Nodes (104): activeBottomFrame(), afterExit(), BackgroundShellsEvidence, boxedComposerFrame(), busyRowStatus(), captureBeforeDeadline(), captureTerminal(), cleanDialogLine() (+96 more)

### Community 12 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (24): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), cleanupFixtures(), waitForIdle(), toolResultText(), answer(), claudeRequest() (+16 more)

### Community 13 - "contracts.ts"
Cohesion: 0.04
Nodes (82): ClaudeAgentServiceEvents, ComputerManagerEvents, RemoteSessionListing, DirectoryScope, withSessionCreateBoundary(), directories, voiceControlQueues, voiceControlWaiters (+74 more)

### Community 14 - "ManagedSession"
Cohesion: 0.04
Nodes (46): DreamerMemoryMetadataRecord, ManagerHub, APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier (+38 more)

### Community 15 - ".takeInTranscript"
Cohesion: 0.04
Nodes (50): backgroundShellsEvidence(), contextChangedInEvents(), createPendingUserInputTracker(), createStatusTracker(), at(), directories, finish(), launch() (+42 more)

### Community 16 - "ManagerStore"
Cohesion: 0.04
Nodes (43): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+35 more)

### Community 17 - "registerHubRoutes"
Cohesion: 0.06
Nodes (17): ClientPresence, PRESENCE_TTL_MS, ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, ManagerEventSource (+9 more)

### Community 18 - "hub-routes.ts"
Cohesion: 0.03
Nodes (87): activityDetailsUnavailable(), activityNotInLog(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), BuildAppOptions, addComputerSchema, configureRuntimeSchema (+79 more)

### Community 19 - "ManagerAgent"
Cohesion: 0.06
Nodes (14): FakeManager, checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), capturePrompt() (+6 more)

### Community 20 - "sections.tsx"
Cohesion: 0.05
Nodes (61): hub(), AppVersion, SessionProvenance, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue (+53 more)

### Community 21 - "AppSettingsDialog.tsx"
Cohesion: 0.04
Nodes (83): DEFAULT_SESSION_PROVIDER, activateSession(), configureRuntime(), createSession(), deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), getRuntimeOptions() (+75 more)

### Community 22 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (66): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, awaitTermination() (+58 more)

### Community 23 - "session-presentation.ts"
Cohesion: 0.04
Nodes (76): closedSessionExpiresAt(), SessionInterruptionCause, KnowledgeRootSelector(), root, CloseSessionDialog(), noPrompts, RecentlyClosedCard(), act() (+68 more)

### Community 24 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (46): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+38 more)

### Community 25 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (20): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+12 more)

### Community 26 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 27 - "oracle-voice-integration.test.ts"
Cohesion: 0.03
Nodes (34): ManagerSdkClient, apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+26 more)

### Community 28 - "PushNotificationService"
Cohesion: 0.06
Nodes (30): start(), NotificationRecorder, brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender (+22 more)

### Community 29 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (17): WorkspaceFixtureOptions, RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, requestBytes(), client(), servers (+9 more)

### Community 30 - "shared/settings-profile.ts"
Cohesion: 0.06
Nodes (52): WorkspaceFixtureState, execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), profileStore() (+44 more)

### Community 31 - "app.ts"
Cohesion: 0.04
Nodes (46): apps, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ServerRole, SessionMetadataLookup, transcriptionComputerName() (+38 more)

### Community 32 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (51): root, script, ClaudeSdk, directories, fixture(), queryHandle(), services, deferred() (+43 more)

### Community 33 - "FakeVoiceEngine"
Cohesion: 0.05
Nodes (29): voiceBackend(), FakeVoiceEngine, FakeVoiceEngineFactory, identityKey(), isCancelled(), sameGeneration(), config, VoiceSttEngine (+21 more)

### Community 34 - "queued-dispatch.test.ts"
Cohesion: 0.04
Nodes (33): nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery() (+25 more)

### Community 35 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 36 - "SessionService"
Cohesion: 0.05
Nodes (14): registerNodeRoutes(), apps, directories, hookApp(), jsonText(), largeCall, largeCallOutput, largeFile (+6 more)

### Community 37 - "TerminalSessionController"
Cohesion: 0.05
Nodes (17): isUncertainDelivery(), PendingUserInputTracker, persistedFormAnswer(), removeCopilotSessionFiles(), terminalAnswerRefused(), TerminalFormContinuation, validateUserInputForm(), fixtures (+9 more)

### Community 38 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (50): startAgentAfterClear(), exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, Screens (+42 more)

### Community 39 - "oracle-voice.ts"
Cohesion: 0.06
Nodes (46): exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), sendBrowserOutput(), VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase (+38 more)

### Community 40 - "oracle-voice-benchmark.ts"
Cohesion: 0.06
Nodes (42): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+34 more)

### Community 41 - "ui-scenes.ts"
Cohesion: 0.06
Nodes (36): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+28 more)

### Community 42 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 43 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (48): frame(), geometry, output, scratch, screenshot(), { values }, accents, Measurement (+40 more)

### Community 44 - "ProviderSessionService"
Cohesion: 0.07
Nodes (3): updateComputerForLaunchIdentity(), owns(), ProviderSessionService

### Community 45 - "src/settings-profile.ts"
Cohesion: 0.08
Nodes (28): NewSessionRuntime, sameSettingValue(), SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, statuslineItems (+20 more)

### Community 46 - "oracle-voice-worker.ts"
Cohesion: 0.09
Nodes (23): benchmarkGroup(), capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent(), isEnabledConfig(), isNonEmptyString() (+15 more)

### Community 47 - "sampler.ts"
Cohesion: 0.08
Nodes (47): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+39 more)

### Community 48 - "DreamerService"
Cohesion: 0.11
Nodes (13): boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), safeRunError(), unavailableSnapshot() (+5 more)

### Community 49 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (53): addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTasksApi (+45 more)

### Community 50 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (45): DreamerHistoryEntry, assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES (+37 more)

### Community 51 - "oracle-voice-session.ts"
Cohesion: 0.10
Nodes (19): sendNodeVoiceOutput(), backendOutputBytes(), acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession (+11 more)

### Community 52 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (43): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition, getDreamer() (+35 more)

### Community 53 - "setupWorkspaceFixture"
Cohesion: 0.05
Nodes (25): pageFor(), desktop, devices, long, open(), phone, veryLong, bounds() (+17 more)

### Community 54 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (13): awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, processAncestors(), processCommand(), safeWindowName(), clearFixture() (+5 more)

### Community 55 - "tmux-errors.integration.test.ts"
Cohesion: 0.06
Nodes (28): connections, fixture(), managers, releases, remote, session(), ComputerRegistry, DurableRegisteredComputer (+20 more)

### Community 56 - "terminal-session.test.ts"
Cohesion: 0.06
Nodes (40): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+32 more)

### Community 57 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 58 - "CopilotClientLike"
Cohesion: 0.06
Nodes (27): CopilotClientLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), at() (+19 more)

### Community 59 - "OracleVoiceClient"
Cohesion: 0.13
Nodes (9): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError(), responseMessage() (+1 more)

### Community 60 - "session-directory.ts"
Cohesion: 0.10
Nodes (36): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+28 more)

### Community 61 - "ComposerActions.tsx"
Cohesion: 0.08
Nodes (21): families, modelFamily, shortModelName(), repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions() (+13 more)

### Community 62 - "normalizeKnowledgeRelativePath"
Cohesion: 0.08
Nodes (33): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+25 more)

### Community 63 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 64 - "server/skill-settings.ts"
Cohesion: 0.09
Nodes (28): instrument(), builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills() (+20 more)

### Community 65 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 66 - "agent-service.test.ts"
Cohesion: 0.07
Nodes (26): CopilotSessionLike, terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration (+18 more)

### Community 67 - "FakeSessionService"
Cohesion: 0.06
Nodes (5): ClaudeFakeSessionService, FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 68 - "client.ts"
Cohesion: 0.08
Nodes (25): VoiceCapabilities, getOracleVoiceCapabilities(), closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode (+17 more)

### Community 69 - "processes.ts"
Cohesion: 0.10
Nodes (26): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+18 more)

### Community 70 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (32): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+24 more)

### Community 71 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 72 - "remote-voice-client.ts"
Cohesion: 0.11
Nodes (17): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, RemoteNodeRedirectError, RemoteNodeRequestError, closeReason(), exactArrayBuffer(), rawDataBuffer() (+9 more)

### Community 73 - "FakeVoiceController"
Cohesion: 0.09
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 74 - "active-sessions.ts"
Cohesion: 0.10
Nodes (31): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+23 more)

### Community 75 - "oracle-voice-config.ts"
Cohesion: 0.08
Nodes (29): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+21 more)

### Community 76 - "DreamerStore"
Cohesion: 0.14
Nodes (10): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, isMissing(), publicPlan() (+2 more)

### Community 77 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 78 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 79 - "recovery-resend-durability.test.ts"
Cohesion: 0.08
Nodes (16): normalizedTitle(), directories, disk, fixture(), gate(), gates, httpBoundary(), initialize() (+8 more)

### Community 80 - "oracle-voice-routes.ts"
Cohesion: 0.09
Nodes (30): nodeVoiceCapabilities(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputRelay(), browserCloseCode() (+22 more)

### Community 81 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (34): editQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), sendManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), canTakeFocus() (+26 more)

### Community 82 - "client.test.ts"
Cohesion: 0.07
Nodes (11): HUB_SIGN_IN_EXPIRED_MESSAGE, OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 83 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 84 - "SchedulerStore"
Cohesion: 0.16
Nodes (5): failure(), SchedulerStore, ScheduleProposal, Schedule, ScheduleRunStatus

### Community 85 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 86 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 87 - "capture.ts"
Cohesion: 0.07
Nodes (18): BufferedFrame, defaultAudioContext(), permissionError(), positiveLimit(), CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureError (+10 more)

### Community 88 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 89 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 90 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+26 more)

### Community 91 - "dreamer-planner.ts"
Cohesion: 0.11
Nodes (32): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+24 more)

### Community 92 - "manager-context.ts"
Cohesion: 0.12
Nodes (28): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+20 more)

### Community 93 - "manager-proactive-inbox.ts"
Cohesion: 0.09
Nodes (34): assertExactKeys(), canonicalHash(), DISPOSITIONS, eventId(), hasExactKeys(), isDisposition(), isEventKind(), isId() (+26 more)

### Community 94 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 95 - "VoiceCapture"
Cohesion: 0.15
Nodes (5): captureFailure(), harness(), VoiceCapture, VoiceCaptureOptions, FakeCapture

### Community 96 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 97 - "ScheduleWorktreeService"
Cohesion: 0.14
Nodes (14): execute, failure(), missing(), ScheduleWorktreeService, execute, git(), node(), folder (+6 more)

### Community 98 - "ActivityDetails.tsx"
Cohesion: 0.13
Nodes (28): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, TOOL_CALL_ID_PATTERN, toolCallIdFromActivityId(), activityDetailFailure, detailKey(), formatBytes(), keep(), kept (+20 more)

### Community 99 - "SchedulerDispatcher"
Cohesion: 0.19
Nodes (4): SchedulerDispatcher, registerSchedulerRoutes(), holdsSlot(), isInFlight()

### Community 100 - "session-prefetch.ts"
Cohesion: 0.09
Nodes (21): browserConnection(), ConnectionHints, connectionSparesData(), holdsTranscript(), IdleScheduler, PREFETCH_PASS_BYTES, PREFETCH_SIDEBAR_ROWS, prefetchCandidates() (+13 more)

### Community 101 - "closed-sessions.ts"
Cohesion: 0.09
Nodes (18): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, blockParents, CLOSED_SESSION_RETENTION_MS, closedCapitals(), closedSessionContext() (+10 more)

### Community 102 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (16): FakeVoiceEngineCall, apps, config, configFixture(), createManager(), issueTicket(), localRuntime(), otherAllowed (+8 more)

### Community 103 - "scheduler-dispatcher.ts"
Cohesion: 0.09
Nodes (19): enableSchedulerTools(), NoopScheduleLauncher, ScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS, SchedulerDispatcherOptions, ScheduleStopAcknowledgement (+11 more)

### Community 104 - "send-matrix.integration.test.ts"
Cohesion: 0.07
Nodes (28): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+20 more)

### Community 105 - "markdown-navigation.ts"
Cohesion: 0.13
Nodes (28): followMarkdownLink(), KnowledgeReader(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), navigateDocument(), BreadcrumbSegment, breadcrumbSegments() (+20 more)

### Community 106 - "real-voice.ts"
Cohesion: 0.11
Nodes (13): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+5 more)

### Community 107 - "VoiceAudioFrame"
Cohesion: 0.08
Nodes (12): QueuedAudio, BrowserCaptureOptions, SocketInbox, SocketMessage, connect(), Inbox, rawBuffer(), AudioReservation (+4 more)

### Community 108 - "ManagerProactiveCoordinator"
Cohesion: 0.16
Nodes (7): batchMessageId(), isTerminal(), lifecycles(), ManagerProactiveCoordinator, fixture(), managed(), ManagerProactiveInboxEvent

### Community 109 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 110 - "pipeline.ts"
Cohesion: 0.12
Nodes (25): partlyHeldRenderer(), emptyDrawing, documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform(), drawSteps(), growable (+17 more)

### Community 111 - "capture-workspace.ts"
Cohesion: 0.14
Nodes (23): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+15 more)

### Community 112 - "ChatMessage"
Cohesion: 0.11
Nodes (20): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, ChatMessage, TranscriptWindow (+12 more)

### Community 113 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.10
Nodes (12): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+4 more)

### Community 114 - "ManagerAssistant.test.tsx"
Cohesion: 0.08
Nodes (15): removeQueuedManagerMessage(), retryManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability, empty (+7 more)

### Community 115 - "use-markdown-document.test.tsx"
Cohesion: 0.11
Nodes (12): DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), defaultDocumentRenderer(), DocumentRenderer, DocumentRendererContext, RendererWorker, synchronousRenderer (+4 more)

### Community 116 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 117 - "service.ts"
Cohesion: 0.13
Nodes (11): HostRequest, HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError(), HostTelemetryService, HostTelemetryTarget, HOST_TELEMETRY_INVALID_CODE, HostMinuteAggregate (+3 more)

### Community 118 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (16): phases, port, app(), directories, headers, launcher, createStartupPhases(), startManagedServer() (+8 more)

### Community 119 - "session-launcher.ts"
Cohesion: 0.11
Nodes (11): delay(), requireFolderTrust(), sameFolder(), SessionFolderTrustPolicy, SessionLauncher, SessionLauncherHost, SessionLaunchPreparationError, SessionPermissionPolicy (+3 more)

### Community 120 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 121 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (24): advance(), connections, content(), FrameMeasurement, lastHeading(), message(), open(), percentile() (+16 more)

### Community 122 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 123 - "session-response-order.ts"
Cohesion: 0.14
Nodes (20): TRANSCRIPT_CARRIED_LIMIT, sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+12 more)

### Community 124 - "use-markdown-document.ts"
Cohesion: 0.16
Nodes (19): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), finishDrawing(), Level (+11 more)

### Community 125 - "controls.tsx"
Cohesion: 0.17
Nodes (22): shortcutKeys(), readStoredShortcuts(), AppShortcutBinding, binding(), bindingLabel(), capturableCode(), capturableCodes, isModifierCode() (+14 more)

### Community 126 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 127 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 128 - "oracle-voice-segments.ts"
Cohesion: 0.14
Nodes (22): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+14 more)

### Community 129 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 130 - "DreamerProgress"
Cohesion: 0.19
Nodes (6): DreamerProgress, keyOf(), notOlder(), setup(), timeOf(), withTimeout()

### Community 131 - "remote.ts"
Cohesion: 0.13
Nodes (14): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, registerHostTelemetryRoutes() (+6 more)

### Community 132 - "tmux-errors.ts"
Cohesion: 0.13
Nodes (20): listTmuxSessions(), foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity(), SocketPlace (+12 more)

### Community 133 - "ManagerProactiveInbox"
Cohesion: 0.20
Nodes (6): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 134 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 135 - "SessionKnowledgeStore"
Cohesion: 0.19
Nodes (6): bindingKey(), SessionKnowledgeEvents, SessionKnowledgeStore, stateSchema, SessionKnowledgeBinding, SessionKnowledgeRequestError

### Community 136 - "HostMonitorView.test.tsx"
Cohesion: 0.17
Nodes (18): HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics, snapshot, Socket, bytes() (+10 more)

### Community 137 - "session-patches.test.ts"
Cohesion: 0.17
Nodes (8): Connection, Client, PatchSocket, Browser, seedOffset, HubResyncRequest, HubWireEvent, SessionPatchReceiver

### Community 138 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 139 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 140 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 141 - "refusal-metrics.ts"
Cohesion: 0.16
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+7 more)

### Community 142 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 143 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 144 - "host-telemetry.ts"
Cohesion: 0.12
Nodes (18): aggregate, DiskSpaceSchema, HOST_TELEMETRY_CAPABILITY_VERSION, HOST_TELEMETRY_LIVE_WINDOW_MS, HostHistorySchema, HostInfoSchema, HostMetricAggregate, HostMetricAggregateSchema (+10 more)

### Community 145 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 146 - "transcript-window.ts"
Cohesion: 0.22
Nodes (11): carriedBefore(), pageTranscript(), pageWholeSession(), row(), transcriptMoved(), transcriptOf(), TranscriptPage, TranscriptPageQuery (+3 more)

### Community 147 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 148 - "ActivityRow.test.tsx"
Cohesion: 0.15
Nodes (11): ActivityStatus, bashDetail(), output, raw, runningDetail(), text(), UserMessage, PauseFollowingContext (+3 more)

### Community 149 - "BackgroundTasksDialog.tsx"
Cohesion: 0.18
Nodes (16): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableNote() (+8 more)

### Community 150 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 151 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 152 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 153 - "RuntimeModelOption"
Cohesion: 0.18
Nodes (13): RuntimeModelOption, getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus() (+5 more)

### Community 154 - "oracle-status.test.ts"
Cohesion: 0.18
Nodes (15): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+7 more)

### Community 155 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 156 - "server/session-patches.ts"
Cohesion: 0.20
Nodes (9): changedInPlace(), diffMessages(), Publication, sameField(), sameMessage(), sessionKey(), SessionPublications, SessionUpserted (+1 more)

### Community 157 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 159 - "scheduler-store.ts"
Cohesion: 0.12
Nodes (11): ScheduleAttentionSession, deferUnboundWorktree(), State, stateSchema, timestamp, ScheduleProposalInput, scheduleProposalInputSchema, ScheduleProposalsChanged (+3 more)

### Community 160 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 161 - "ScheduleRun"
Cohesion: 0.33
Nodes (6): provenance(), SessionScheduleLauncher, ScheduleLaunchRefusedError, ScheduleReconciliation, scheduleProviderUnavailableReason(), ScheduleRun

### Community 162 - "NotificationPanel.tsx"
Cohesion: 0.22
Nodes (12): FeatureEvent, listeners, publishFeatureEvent(), subscribeFeatureEvents(), NotificationGroup, notificationGroups(), NotificationTab, kindIcon() (+4 more)

### Community 163 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 164 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 165 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 166 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 167 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 168 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 169 - "session-knowledge-store.ts"
Cohesion: 0.13
Nodes (16): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+8 more)

### Community 170 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 171 - "transport.test.ts"
Cohesion: 0.14
Nodes (11): prefixes, session, trusted, untrusted, readingFixture(), empty, inventory, listen() (+3 more)

### Community 172 - "BackgroundTask"
Cohesion: 0.20
Nodes (8): BackgroundTaskProjector, snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 174 - "knowledge-store.ts"
Cohesion: 0.14
Nodes (11): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, parseMetadata(), PersistedKnowledgeState (+3 more)

### Community 175 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 176 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 177 - "session-unread.pw.ts"
Cohesion: 0.15
Nodes (7): bounds(), devices, edgeState(), open(), screenshot(), unreadState(), fixtureBackgroundTasks

### Community 178 - "registerSessionKnowledgeRoutes"
Cohesion: 0.29
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 179 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 180 - "BackgroundTasksDialog.test.tsx"
Cohesion: 0.27
Nodes (11): BackgroundTasksDialog(), ago(), NOW, SheetProps, task(), BackgroundTasksStatus(), backgroundTaskCountLabel(), backgroundTaskCounts (+3 more)

### Community 181 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 182 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 183 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 184 - "background-task-stop.test.ts"
Cohesion: 0.25
Nodes (11): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started(), stopAcknowledgement() (+3 more)

### Community 186 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 187 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 188 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 189 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 190 - "schedule-launcher.test.ts"
Cohesion: 0.17
Nodes (12): ScheduleLauncherHost, scheduleSessionTitle(), directories, dispatchers, fixture(), folderTrustPermission, managers, permission (+4 more)

### Community 192 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 193 - "use-oracle-attachments.ts"
Cohesion: 0.35
Nodes (11): removeManagerFile(), uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake() (+3 more)

### Community 194 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 196 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 197 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 198 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 199 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 200 - ".persist"
Cohesion: 0.24
Nodes (3): SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, stateWithPaths()

### Community 201 - "session-unread-tracker.ts"
Cohesion: 0.29
Nodes (5): FinishedSession, SessionUnreadTracker, finished(), SessionTurnState, turnEnded()

### Community 202 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 203 - "transcribeAudio"
Cohesion: 0.29
Nodes (4): transcribeAudio(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 204 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 205 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 206 - "ManagerProactiveInboxValidationError"
Cohesion: 0.28
Nodes (6): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions()

### Community 207 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.31
Nodes (6): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult

### Community 208 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 209 - "response-compression.ts"
Cohesion: 0.42
Nodes (8): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), varyOnAcceptEncoding()

### Community 210 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 211 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 212 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 213 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 215 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 216 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 217 - "background-task-adapter.test.ts"
Cohesion: 0.40
Nodes (5): MAX_BACKGROUND_TASKS, MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH, lifecycleEvent(), subagentShell()

### Community 218 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 219 - "worker-handler.ts"
Cohesion: 0.47
Nodes (4): render, scope, handleRenderRequest(), RenderRequest

### Community 220 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 221 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 222 - "copyText"
Cohesion: 0.60
Nodes (4): CopyTextButton(), copy(), copyText(), copyWithSelection()

## Knowledge Gaps
- **1473 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1468 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2473 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `SessionDetail`, `SessionStore`, `remote.ts`, `ManagerProactiveInbox`, `manager-agent.ts`, `SessionKnowledgeStore`, `oracle-voice-soak.ts`, `dreamer-service.ts`, `notification-classifier.ts`, `ClaudeAgentService`, `refusal-metrics.ts`, `ManagerStore`, `registerHubRoutes`, `ManagerAgent`, `sections.tsx`, `PushNotificationService`, `KnowledgeStore`, `shared/settings-profile.ts`, `ScheduleRun`, `transcription-service.ts`, `SessionService`, `TerminalSessionController`, `ProviderSessionService`, `HostTelemetrySampler`, `oracle-voice-worker.ts`, `DreamerService`, `tmux-errors.integration.test.ts`, `ScheduleNotificationService`, `server/skill-settings.ts`, `oracle-voice-config.ts`, `response-compression.ts`, `SchedulerStore`, `SessionOrderStore`, `ScheduleWorktreeService`, `SchedulerDispatcher`, `scheduler-dispatcher.ts`, `ManagerProactiveCoordinator`, `cli-canary.ts`, `service.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `AgentService` connect `SessionDetail` to `SessionStore`, `queued-dispatch.test.ts`, `.readBackgroundTasks`, `agent-service.test.ts`, `TerminalSessionController`, `agent-service.ts`, `.takeInTranscript`, `recovery-resend-durability.test.ts`, `hub-routes.ts`, `transcript-window.ts`, `claude-agent-service.ts`, `CopilotClientLike`, `session-directory.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `providerFixture()` connect `session-store-providers.test.ts` to `SessionDetail`, `SessionStore`, `SessionService`, `ClaudeAgentService`, `recovery-resend-durability.test.ts`, `registerHubRoutes`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1473 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.03370404380505391 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.024292965917331398 - nodes in this community are weakly interconnected._
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
