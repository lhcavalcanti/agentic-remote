# Agentic Remote - Graphify code map

Snapshot: `ce5799613c4d436ea22a3a216ab82e2b6b67281940e27564bfc5144096904000`

Source checkout: `5d702209cede042a7d091c9bb172642120ab1ec4`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 641 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 641 files · ~1,154,280 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9025 nodes · 26098 edges · 244 communities (201 shown, 25 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1329 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- AppWorkspace
- SessionDetail
- agent-service.ts
- api.ts
- ClaudeAgentService
- computer-manager.ts
- react
- oracle-voice-integration.test.ts
- workspace-fixtures.ts
- App.tsx
- oracle-voice-child.ts
- oracle-voice.ts
- ManagerStore
- agent-service.test.ts
- terminal-session.ts
- claude-agent-service.ts
- dreamer-store.ts
- ManagedSession
- notification-classifier.ts
- manager-tools.ts
- session-directory.ts
- oracle-voice-soak.ts
- schedule-launcher.ts
- app.ts
- shared/settings-profile.ts
- contracts.ts
- agentic-remote-promotion-monitor
- ManagerAgent
- schedules.ts
- session-presentation.ts
- session-store-providers.test.ts
- oracle-voice-routes.test.ts
- transcription-service.ts
- oracle-task-store.ts
- TmuxTerminalSessionController
- manager-agent.ts
- FakeVoiceEngine
- oracle-voice-worker.ts
- feature-flags.ts
- node-routes.ts
- tmux-test-helpers.ts
- fake-voice.ts
- session-reply-durability.test.ts
- sampler.ts
- manager-structured-memory-validation.ts
- pwa.ts
- KnowledgeStore
- notification-center.ts
- DreamerService
- ProviderSessionService
- ManagerMessage
- active-sessions.ts
- hub-routes.ts
- src/settings-profile.ts
- background-task-adapter.ts
- OracleDreamer.tsx
- SessionService
- oracle-voice-session.ts
- agentic-remote
- RuntimeReasoningEffort
- SchedulerStore
- ui-scenes.ts
- processes.ts
- dreamer-progress.ts
- ComposerActions.tsx
- ManagerAssistant.tsx
- markdown-navigation.ts
- OracleVoiceClient
- agentic-remote-gate
- oracle-voice-benchmark.ts
- bundle
- recovery-resend-durability.test.ts
- NodeIdentityStore
- FakeSessionService
- terminal-session.test.ts
- oracle-voice-config.ts
- VoicePlayback
- shell.ts
- lib.rs
- schedule-recurrence.ts
- VoiceCapture
- dependencies
- manager-proactive-inbox.ts
- PushNotificationService
- agentic-remote-promotion-setup
- SessionOrderStore
- devDependencies
- config.rs
- dreamer-service.ts
- knowledge-tree.ts
- ScheduleForm.tsx
- startup-phases.test.ts
- manager-structured-memory.ts
- host-telemetry.ts
- HostTelemetrySampler
- OracleVoiceCoordinator
- BackgroundTasksDialog.tsx
- .toolHost
- manager-context.ts
- oracle-voice-security.test.ts
- oracle-voice-segments.ts
- manager-proactive-coordinator.ts
- send-matrix.integration.test.ts
- manager-structured-memory-search.ts
- ManagerAttachment
- .sendInternal
- dreamer-planner.ts
- capture-workspace.ts
- cli-canary.ts
- ManagerStructuredMemoryStore
- scripts
- ManagerAssistant.test.tsx
- .observe
- capture.ts
- session-patch-browser.ts
- HostMonitorView.test.tsx
- SessionResources.tsx
- use-markdown-document.ts
- compilerOptions
- client.test.ts
- NotificationCenterService
- use-oracle-conversation.test.tsx
- ManagerProactiveInbox
- oracle-voice-tickets.ts
- compilerOptions
- full-gate.test.ts
- PromptCards.tsx
- client.ts
- session-patches.test.ts
- compilerOptions
- OnlineRecognizer
- SessionKnowledgeBinding
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- .correct
- session-knowledge-store.ts
- pipeline.ts
- session-latency-benchmark.ts
- projection-test-helpers.ts
- dreamer-schedule.ts
- oracle-status.test.ts
- promotion-monitor.test.ts
- terminal-startup-queue.test.ts
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- background-task-stop.test.ts
- VoiceTurnState
- terminal-form-deadline.test.ts
- closed-session-sweeper.ts
- registerSessionKnowledgeRoutes
- SessionAdmissions
- SessionKnowledgeStore
- server/session-patches.ts
- renderer.ts
- package.json
- oracle-voice-assets.test.ts
- session-knowledge-routes.ts
- session-resource-clear.test.ts
- fake-vad.ts
- desktop.json
- BackgroundTask
- registerHostTelemetryRoutes
- .handleManagerEvent
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- .recoverSdkSession
- transport.test.ts
- registerOracleVoiceRoutes
- session-scope.ts
- OracleVoiceClientDependencies
- Pcm16Resampler
- recently-closed.pw.ts
- ChatMessage
- manager-proactive-inbox.test.ts
- schedule-notification-service.ts
- html-preview.ts
- sign-in-expired.pw.ts
- tmux-errors.test.ts
- use-oracle-attachments.ts
- dataset
- generate-pwa-icons.ts
- manager-proactive-coordinator.test.ts
- .persist
- bridge.rs
- pipeline.test.tsx
- use-markdown-document.test.tsx
- vite.config.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- session-knowledge-store.test.ts
- sent-message.ts
- VoiceVadOptions
- doctor-cli.test.ts
- release-publication.test.ts
- closed-sessions.ts
- OracleVoicePlayback
- settings.ts
- composer-layout.test.ts
- HostTelemetryClock
- worker-handler.ts
- DocumentHeading
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
1. `AppWorkspace()` - 352 edges
2. `SessionDetail` - 342 edges
3. `AgentService` - 318 edges
4. `SessionStore` - 214 edges
5. `ManagedSession` - 184 edges
6. `buildApp()` - 138 edges
7. `ClaudeAgentService` - 136 edges
8. `registerHubRoutes()` - 107 edges
9. `ComputerManager` - 106 edges
10. `ManagerAgent` - 101 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `ClaudeAgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (244 total, 25 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (13): agentMode(), AgentService, commandShortcut(), isTerminalNotReadyRefusal(), lifecycleRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, stripAnsi() (+5 more)

### Community 1 - "AppWorkspace"
Cohesion: 0.03
Nodes (194): terminalSendOptions(), submissionReceiptFromError(), askSession(), cancelSession(), clearConversation(), closeSession(), getSession(), recoverConversation() (+186 more)

### Community 2 - "SessionDetail"
Cohesion: 0.03
Nodes (81): fixture(), restart(), createStore(), recoveryFixture(), storeAt(), storedProvider(), fixture(), fixture() (+73 more)

### Community 3 - "agent-service.ts"
Cohesion: 0.02
Nodes (150): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+142 more)

### Community 4 - "api.ts"
Cohesion: 0.02
Nodes (149): parseSubmissionReceipt(), addComputer(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), checkHubSignIn(), configureRetention(), createOracleVoiceTicket() (+141 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.03
Nodes (54): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+46 more)

### Community 6 - "computer-manager.ts"
Cohesion: 0.02
Nodes (76): BackgroundTaskUpdate, RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, ProviderSessionServiceEvents (+68 more)

### Community 7 - "react"
Cohesion: 0.03
Nodes (109): react, AppVersion, RuntimeModelOption, HubHealth, AppearanceSetting, NewSessionBackendSetting, activateSession(), configureRuntime() (+101 more)

### Community 8 - "oracle-voice-integration.test.ts"
Cohesion: 0.02
Nodes (69): ManagerEventSource, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OracleVoiceBackendConnection, OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput (+61 more)

### Community 9 - "workspace-fixtures.ts"
Cohesion: 0.02
Nodes (73): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+65 more)

### Community 10 - "App.tsx"
Cohesion: 0.03
Nodes (96): SessionParams, isManagerEvent(), extension(), MAX_SESSION_FILE_BYTES, sessionFileValidationError(), supportedExtensions, supportsSessionFile(), SettingsProfileKey (+88 more)

### Community 11 - "oracle-voice-child.ts"
Cohesion: 0.03
Nodes (59): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+51 more)

### Community 12 - "oracle-voice.ts"
Cohesion: 0.04
Nodes (77): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), availableCapabilities(), backendOutputBytes(), backendOutputRelay(), disconnectCause() (+69 more)

### Community 13 - "ManagerStore"
Cohesion: 0.04
Nodes (50): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, DreamerProgressEntry (+42 more)

### Community 14 - "agent-service.test.ts"
Cohesion: 0.03
Nodes (56): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+48 more)

### Community 15 - "terminal-session.ts"
Cohesion: 0.04
Nodes (95): activeBottomFrame(), afterExit(), BackgroundShellsEvidence, boxedComposerFrame(), busyRowStatus(), captureTerminal(), cleanDialogLine(), COMPOSER_PLACEHOLDERS (+87 more)

### Community 16 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (66): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+58 more)

### Community 17 - "dreamer-store.ts"
Cohesion: 0.05
Nodes (56): DreamerHistoryEntry, assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+48 more)

### Community 18 - "ManagedSession"
Cohesion: 0.08
Nodes (16): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, ManagerEventSource, registerHubRoutes(), SessionMuteCarrier (+8 more)

### Community 19 - "notification-classifier.ts"
Cohesion: 0.04
Nodes (62): ComputerManagerEvents, computer, observe(), snapshot(), start, sustained(), center(), directories (+54 more)

### Community 20 - "manager-tools.ts"
Cohesion: 0.04
Nodes (47): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), changeSuspension() (+39 more)

### Community 21 - "session-directory.ts"
Cohesion: 0.05
Nodes (60): instrument(), displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath() (+52 more)

### Community 22 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (36): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+28 more)

### Community 23 - "schedule-launcher.ts"
Cohesion: 0.07
Nodes (32): LaunchPrimitives, provenance(), ScheduleLauncherHost, ScheduleProvenance, scheduleSessionTitle(), SessionScheduleLauncher, NoopScheduleLauncher, ScheduleLauncher (+24 more)

### Community 24 - "app.ts"
Cohesion: 0.04
Nodes (55): apps, directories, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe(), transcriptionComputerName(), directories (+47 more)

### Community 25 - "shared/settings-profile.ts"
Cohesion: 0.05
Nodes (57): WorkspaceFixtureState, execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), directories (+49 more)

### Community 26 - "contracts.ts"
Cohesion: 0.03
Nodes (58): make(), node(), apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp() (+50 more)

### Community 27 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 28 - "ManagerAgent"
Cohesion: 0.08
Nodes (14): checkContent(), delay(), errorMessage(), isNotFound(), isPending(), isQueued(), ManagerAgent, sameRuntime() (+6 more)

### Community 29 - "schedules.ts"
Cohesion: 0.05
Nodes (62): headers, hub(), sender, SCHEDULE_RUN_LIMIT, State, stateSchema, timestamp, action (+54 more)

### Community 30 - "session-presentation.ts"
Cohesion: 0.05
Nodes (63): CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, CloseSessionDialog(), RecentlyClosedCard() (+55 more)

### Community 31 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (49): root, script, ClaudeSdk, connect(), deferred(), disk, enqueue(), fixture() (+41 more)

### Community 32 - "oracle-voice-routes.test.ts"
Cohesion: 0.04
Nodes (28): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+20 more)

### Community 33 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 34 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (45): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+37 more)

### Community 35 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (19): composer(), processAdapter, awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, FormReplyDeadlineError, listTmuxSessions() (+11 more)

### Community 36 - "manager-agent.ts"
Cohesion: 0.05
Nodes (35): DreamerProgressView, automaticPayload(), discover(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig (+27 more)

### Community 37 - "FakeVoiceEngine"
Cohesion: 0.06
Nodes (29): EnabledOracleVoiceConfig, FakeVoiceEngine, FakeVoiceEngineCall, FakeVoiceEngineFactory, identityKey(), isCancelled(), sameGeneration(), config (+21 more)

### Community 38 - "oracle-voice-worker.ts"
Cohesion: 0.07
Nodes (25): benchmarkGroup(), VoiceSttEngine, capabilityFromConfig(), ChildVoiceEngine, defaultDependencies(), errorMessage(), exactKeys(), isCancelledEvent() (+17 more)

### Community 39 - "feature-flags.ts"
Cohesion: 0.08
Nodes (40): hub(), SessionProvenance, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable() (+32 more)

### Community 40 - "node-routes.ts"
Cohesion: 0.06
Nodes (42): configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, exactArrayBuffer(), executeCommandSchema, knowledgeFileQuerySchema (+34 more)

### Community 41 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (50): startAgentAfterClear(), exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, Screens (+42 more)

### Community 42 - "fake-voice.ts"
Cohesion: 0.06
Nodes (14): ActiveBackendSession, beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, installFakeBrowserVoice(), ScriptedUtterance (+6 more)

### Community 43 - "session-reply-durability.test.ts"
Cohesion: 0.07
Nodes (28): isUncertainDelivery(), persistedFormAnswer(), terminalAnswerRefused(), TerminalFormContinuation, validateUserInputForm(), answer(), assistantFixture(), claudeFixture() (+20 more)

### Community 44 - "sampler.ts"
Cohesion: 0.07
Nodes (50): prefixes, session, trusted, untrusted, counter(), counterDelta(), CpuCounters, cpuUtilization() (+42 more)

### Community 45 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 46 - "pwa.ts"
Cohesion: 0.06
Nodes (47): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), App(), applyPwaUpdate(), changed(), frames, innermostDialogFrame() (+39 more)

### Community 47 - "KnowledgeStore"
Cohesion: 0.06
Nodes (25): ServerRole, ClientPresence, PRESENCE_TTL_MS, SessionMetadataLookup, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference (+17 more)

### Community 48 - "notification-center.ts"
Cohesion: 0.07
Nodes (35): booleanQuery, filters, params, cursorSchema, durableState(), emptyState(), identity, kind (+27 more)

### Community 49 - "DreamerService"
Cohesion: 0.10
Nodes (12): DreamerMemoryMetadata, projectDreamerMemory(), boundedText(), DreamerService, DreamerUnavailableError, publicSnapshot(), uniqueSessionRefs(), DreamerConflictError (+4 more)

### Community 50 - "ProviderSessionService"
Cohesion: 0.07
Nodes (3): updateComputerForLaunchIdentity(), owns(), ProviderSessionService

### Community 51 - "ManagerMessage"
Cohesion: 0.06
Nodes (20): FakeManager, FakeVoiceState, ProactiveManager, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError() (+12 more)

### Community 52 - "active-sessions.ts"
Cohesion: 0.08
Nodes (45): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+37 more)

### Community 53 - "hub-routes.ts"
Cohesion: 0.06
Nodes (50): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+42 more)

### Community 54 - "src/settings-profile.ts"
Cohesion: 0.08
Nodes (26): NewSessionRuntime, sameSettingValue(), SETTINGS_MAX_COMPUTERS, SettingsChange, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance (+18 more)

### Community 55 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (52): addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, copyTask() (+44 more)

### Community 56 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (44): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+36 more)

### Community 57 - "SessionService"
Cohesion: 0.07
Nodes (6): closeReason(), closeVoiceSocket(), nodeVoiceCapabilities(), registerNodeRoutes(), obstructUploads(), SessionService

### Community 58 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (16): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), QueuedOutput (+8 more)

### Community 59 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 60 - "RuntimeReasoningEffort"
Cohesion: 0.06
Nodes (27): CreationRuntime, awaitTermination(), LaunchCreations, apps, directories, directory(), runtime(), services (+19 more)

### Community 61 - "SchedulerStore"
Cohesion: 0.12
Nodes (8): fixture(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, ScheduleProposal, Schedule, ScheduleRunStatus

### Community 62 - "ui-scenes.ts"
Cohesion: 0.08
Nodes (30): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+22 more)

### Community 63 - "processes.ts"
Cohesion: 0.08
Nodes (27): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+19 more)

### Community 64 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 65 - "ComposerActions.tsx"
Cohesion: 0.08
Nodes (20): families, modelFamily, repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions(), ContextRing() (+12 more)

### Community 66 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (41): editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent() (+33 more)

### Community 67 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (39): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), MarkdownImage() (+31 more)

### Community 68 - "OracleVoiceClient"
Cohesion: 0.14
Nodes (8): captureClientError(), clientError(), closeError(), closeReason(), OracleVoiceClient, OracleVoiceClientError, playbackClientError(), terminalCloseCode()

### Community 69 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 70 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (38): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, deferred() (+30 more)

### Community 71 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 72 - "recovery-resend-durability.test.ts"
Cohesion: 0.07
Nodes (24): directories, disk, fixture(), gate(), gates, httpBoundary(), initialize(), PublicSessionValue (+16 more)

### Community 73 - "NodeIdentityStore"
Cohesion: 0.07
Nodes (22): connections, fixture(), managers, releases, remote, session(), ComputerRegistry, DurableRegisteredComputer (+14 more)

### Community 74 - "FakeSessionService"
Cohesion: 0.07
Nodes (3): FakeSessionService, ConfigureRuntimeInput, SideQuestionExchange

### Community 75 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (36): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+28 more)

### Community 76 - "oracle-voice-config.ts"
Cohesion: 0.08
Nodes (29): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+21 more)

### Community 77 - "VoicePlayback"
Cohesion: 0.10
Nodes (11): pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio(), validateGeneration() (+3 more)

### Community 78 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 79 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 80 - "schedule-recurrence.ts"
Cohesion: 0.11
Nodes (36): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+28 more)

### Community 81 - "VoiceCapture"
Cohesion: 0.13
Nodes (8): captureFailure(), defaultAudioContext(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 82 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 83 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (36): assertExactKeys(), DISPOSITIONS, emptyState(), hasExactKeys(), isEventKind(), isId(), isOrigin(), isPositiveSafeCounter() (+28 more)

### Community 84 - "PushNotificationService"
Cohesion: 0.12
Nodes (9): start(), OracleEventSource, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema (+1 more)

### Community 85 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 86 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 87 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 88 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 89 - "dreamer-service.ts"
Cohesion: 0.07
Nodes (24): DREAMER_MAX_ITEMS, DreamerMemoryMetadataRecord, DreamerPlanDraft, DreamerPlannerInput, dispatchSchema, parse(), planSchema, registerDreamerRoutes() (+16 more)

### Community 90 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+26 more)

### Community 91 - "ScheduleForm.tsx"
Cohesion: 0.12
Nodes (28): scheduleProposalSummary(), CLAUDE_SCHEDULE_UNAVAILABLE_REASON, scheduleProviderUnavailableReason(), ScheduleTarget, FolderPicker(), browse(), editableSchedule(), recurrenceSummary() (+20 more)

### Community 92 - "startup-phases.test.ts"
Cohesion: 0.08
Nodes (18): phases, port, app(), directories, headers, launcher, createStartupPhases(), silentStartupPhases (+10 more)

### Community 93 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (29): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+21 more)

### Community 94 - "host-telemetry.ts"
Cohesion: 0.10
Nodes (27): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HostRequest, HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError(), aggregate, DiskSpaceSchema, HOST_TELEMETRY_INVALID_CLOSE_CODE (+19 more)

### Community 95 - "HostTelemetrySampler"
Cohesion: 0.11
Nodes (6): HostTelemetrySampler, HostTelemetryService, HostTelemetryTarget, HostMinuteAggregate, HostSample, HostSnapshot

### Community 96 - "OracleVoiceCoordinator"
Cohesion: 0.14
Nodes (5): AudioCompletion, errorMessage(), OracleVoiceCoordinator, terminalStartupCloseCode(), ActiveConversation

### Community 97 - "BackgroundTasksDialog.tsx"
Cohesion: 0.12
Nodes (26): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+18 more)

### Community 98 - ".toolHost"
Cohesion: 0.09
Nodes (5): ManagerHub, PermissionReplyInput, RenameSessionInput, ManagerSessionClosePolicy, OracleSettingsState

### Community 99 - "manager-context.ts"
Cohesion: 0.13
Nodes (26): ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine(), followUpLine() (+18 more)

### Community 100 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (19): apps, config, configFixture(), connect(), createManager(), Inbox, issueTicket(), localRuntime() (+11 more)

### Community 101 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 102 - "manager-proactive-coordinator.ts"
Cohesion: 0.15
Nodes (8): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, SessionLifecycle, ManagerProactiveInboxEvent, ManagerProactiveOutcome

### Community 103 - "send-matrix.integration.test.ts"
Cohesion: 0.07
Nodes (27): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+19 more)

### Community 104 - "manager-structured-memory-search.ts"
Cohesion: 0.12
Nodes (24): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+16 more)

### Community 105 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 106 - ".sendInternal"
Cohesion: 0.17
Nodes (17): terminalComposerUnreadable(), backgroundShellsAllow(), captureBeforeDeadline(), captureForReplacement(), capturePane(), clearAutomaticStartupPrompts(), hasComposerAfter(), isTerminalAgentWorking() (+9 more)

### Community 107 - "dreamer-planner.ts"
Cohesion: 0.15
Nodes (25): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+17 more)

### Community 108 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 109 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 110 - "ManagerStructuredMemoryStore"
Cohesion: 0.14
Nodes (9): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open() (+1 more)

### Community 111 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 112 - "ManagerAssistant.test.tsx"
Cohesion: 0.08
Nodes (16): cancelManager(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability, empty (+8 more)

### Community 113 - ".observe"
Cohesion: 0.13
Nodes (12): canonicalHash(), cloneState(), eventId(), isDisposition(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError (+4 more)

### Community 114 - "capture.ts"
Cohesion: 0.10
Nodes (15): BufferedFrame, positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode, VoiceVad (+7 more)

### Community 115 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (23): advance(), connections, content(), FrameMeasurement, lastHeading(), message(), percentile(), port (+15 more)

### Community 116 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 117 - "SessionResources.tsx"
Cohesion: 0.10
Nodes (18): ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionSkillSummary, SessionResourcesDialog(), SessionResourcesView, isSessionResourceCommandName(), sessionResourceCommands (+10 more)

### Community 118 - "use-markdown-document.ts"
Cohesion: 0.16
Nodes (18): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+10 more)

### Community 119 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 120 - "client.test.ts"
Cohesion: 0.11
Nodes (6): capabilities, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse()

### Community 121 - "NotificationCenterService"
Cohesion: 0.17
Nodes (3): HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, NotificationCenterService

### Community 122 - "use-oracle-conversation.test.tsx"
Cohesion: 0.15
Nodes (12): getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversationState, availableCapability, defaults, FakeVoiceClient (+4 more)

### Community 123 - "ManagerProactiveInbox"
Cohesion: 0.20
Nodes (6): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 124 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 125 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 126 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 127 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 128 - "client.ts"
Cohesion: 0.12
Nodes (13): isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, OracleVoiceSocket, parseHello(), PendingHello (+5 more)

### Community 129 - "session-patches.test.ts"
Cohesion: 0.18
Nodes (8): Connection, Client, PatchSocket, Browser, seedOffset, HubResyncRequest, HubWireEvent, SessionPatchReceiver

### Community 130 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 131 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 132 - "SessionKnowledgeBinding"
Cohesion: 0.18
Nodes (13): SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding() (+5 more)

### Community 133 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 134 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 135 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 136 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 137 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 138 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (18): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+10 more)

### Community 139 - "pipeline.ts"
Cohesion: 0.18
Nodes (18): openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), documentOpening(), documentParts(), documentRenderEvents(), drawSteps() (+10 more)

### Community 140 - "session-latency-benchmark.ts"
Cohesion: 0.22
Nodes (17): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+9 more)

### Community 141 - "projection-test-helpers.ts"
Cohesion: 0.18
Nodes (14): sessionLog(), BackgroundTaskEventOptions, MAX_BACKGROUND_TASKS, MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH, lifecycleEvent(), subagentShell(), syntheticLog() (+6 more)

### Community 142 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 143 - "oracle-status.test.ts"
Cohesion: 0.19
Nodes (14): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+6 more)

### Community 144 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 145 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (10): client(), delayQueueWrite(), disk, exec, gate(), holdQueueCommit(), NativeFixture, NativeRuntime (+2 more)

### Community 146 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 147 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 148 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 149 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 150 - "background-task-stop.test.ts"
Cohesion: 0.19
Nodes (14): CopilotTaskInfo, CopilotTaskProgress, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell() (+6 more)

### Community 152 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 153 - "closed-session-sweeper.ts"
Cohesion: 0.17
Nodes (5): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS

### Community 154 - "registerSessionKnowledgeRoutes"
Cohesion: 0.26
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 155 - "SessionAdmissions"
Cohesion: 0.17
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 157 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 158 - "renderer.ts"
Cohesion: 0.19
Nodes (7): DocumentRenderEvent, createWorkerRenderer(), defaultDocumentRenderer(), RendererWorker, synchronousRenderer, FakeWorker, startWorkers()

### Community 159 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 160 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 161 - "session-knowledge-routes.ts"
Cohesion: 0.13
Nodes (10): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema, SessionKnowledgeLifecycle (+2 more)

### Community 162 - "session-resource-clear.test.ts"
Cohesion: 0.17
Nodes (12): apps, directories, directory(), pairedFixture(), providerFixture(), providers, seed(), sockets (+4 more)

### Community 163 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 164 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 165 - "BackgroundTask"
Cohesion: 0.24
Nodes (6): BackgroundTaskProjector, backgroundTaskSnapshot(), BackgroundTaskTracker, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 166 - "registerHostTelemetryRoutes"
Cohesion: 0.23
Nodes (8): HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, registerHostTelemetryRoutes(), HostTelemetrySocket

### Community 168 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 169 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 170 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 171 - ".recoverSdkSession"
Cohesion: 0.29
Nodes (3): foregroundTurnOpen(), isForegroundLifecycleEvent(), recoveredPermissionTitle()

### Community 172 - "transport.test.ts"
Cohesion: 0.18
Nodes (8): HOST_TELEMETRY_MAX_QUEUE_BYTES, HOST_TELEMETRY_MAX_QUEUE_MESSAGES, HOST_TELEMETRY_SEND_TIMEOUT_MS, HostSocket, empty, inventory, listen(), pair()

### Community 173 - "registerOracleVoiceRoutes"
Cohesion: 0.17
Nodes (8): AudioGate, resolvedAudioGate(), browserCloseCode(), closeReason(), isWebSocketUpgrade(), registerOracleVoiceRoutes(), startupCloseCode(), ticketClient()

### Community 174 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 175 - "OracleVoiceClientDependencies"
Cohesion: 0.19
Nodes (3): OracleVoiceClientDependencies, FakePlayback, VoicePlaybackOptions

### Community 176 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 177 - "recently-closed.pw.ts"
Cohesion: 0.23
Nodes (9): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), open(), row() (+1 more)

### Community 178 - "ChatMessage"
Cohesion: 0.21
Nodes (8): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, ChatMessage, Base

### Community 179 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxObservation, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 181 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 182 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 183 - "tmux-errors.test.ts"
Cohesion: 0.24
Nodes (9): containedServer(), directories, errno(), { execute }, files, links, listener(), places() (+1 more)

### Community 184 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 185 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 186 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 187 - "manager-proactive-coordinator.test.ts"
Cohesion: 0.22
Nodes (5): directories, FakeAgent, fixture(), managed(), ManagerProactiveInboxOptions

### Community 188 - ".persist"
Cohesion: 0.24
Nodes (3): SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, stateWithPaths()

### Community 189 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 190 - "pipeline.test.tsx"
Cohesion: 0.24
Nodes (7): documentUrlTransform(), components, drawn(), drawnPage(), fixtures, html(), today()

### Community 191 - "use-markdown-document.test.tsx"
Cohesion: 0.22
Nodes (4): DocumentRenderer, DocumentRendererContext, components, show()

### Community 192 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 193 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 194 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 195 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 196 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 198 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 199 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 200 - "closed-sessions.ts"
Cohesion: 0.39
Nodes (5): closedSessionContext(), excerpt(), isClosedSessionContext(), said(), ClosedSessionContext

### Community 202 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 203 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 205 - "worker-handler.ts"
Cohesion: 0.47
Nodes (4): render, scope, handleRenderRequest(), RenderRequest

### Community 206 - "DocumentHeading"
Cohesion: 0.33
Nodes (5): DrawStep, RenderedDocumentTree, MarkdownDocumentView, Progress, DocumentHeading

### Community 207 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1432 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1427 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2399 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionDetail`, `ClaudeAgentService`, `computer-manager.ts`, `ManagerStore`, `ManagedSession`, `session-directory.ts`, `oracle-voice-soak.ts`, `schedule-launcher.ts`, `shared/settings-profile.ts`, `ManagerAgent`, `SessionKnowledgeStore`, `transcription-service.ts`, `oracle-task-store.ts`, `manager-agent.ts`, `registerHostTelemetryRoutes`, `oracle-voice-worker.ts`, `node-routes.ts`, `feature-flags.ts`, `session-reply-durability.test.ts`, `KnowledgeStore`, `notification-center.ts`, `DreamerService`, `ProviderSessionService`, `ManagerMessage`, `schedule-notification-service.ts`, `SessionService`, `SchedulerStore`, `NodeIdentityStore`, `oracle-voice-config.ts`, `PushNotificationService`, `SessionOrderStore`, `dreamer-service.ts`, `HostTelemetrySampler`, `manager-proactive-coordinator.ts`, `cli-canary.ts`, `ManagerStructuredMemoryStore`, `NotificationCenterService`, `ManagerProactiveInbox`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `agent-service.ts`, `ClaudeAgentService`, `computer-manager.ts`, `session-reply-durability.test.ts`, `.recoverSdkSession`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `ClaudeAgentService` connect `ClaudeAgentService` to `SessionDetail`, `computer-manager.ts`, `react`, `session-reply-durability.test.ts`, `claude-agent-service.ts`, `session-directory.ts`, `SessionService`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1432 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03174501992031872 - nodes in this community are weakly interconnected._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.027465955097534044 - nodes in this community are weakly interconnected._
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
