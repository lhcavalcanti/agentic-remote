# Agentic Remote - Graphify code map

Snapshot: `9b0e1ed236faa6b291d03837296375c830863cc0e3843f6b68f19dc31d8f2afd`

Source checkout: `cae285714f1ec7912903c70ad9d93529c73f05a5`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 633 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 633 files · ~1,128,877 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 8877 nodes · 25648 edges · 264 communities (211 shown, 34 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1296 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AppWorkspace
- AgentService
- api.ts
- SessionStore
- react
- App.tsx
- oracle-voice.ts
- SessionDetail
- agent-service.ts
- remote-node-client.ts
- oracle-voice-worker.ts
- oracle-voice-child.ts
- sections.tsx
- manager-structured-memory.ts
- terminal-session.ts
- multi-node.test.ts
- OracleVoiceCoordinator
- manager.ts
- ManagedSession
- background-task-adapter.ts
- manager-tools.ts
- computer-manager.ts
- ManagerAgent
- agentic-remote-promotion-monitor
- dreamer-store.ts
- oracle-voice-soak.ts
- contracts.ts
- session-store-providers.test.ts
- ManagerAssistant.tsx
- VoiceCapture
- oracle-task-store.ts
- dreamer-service.ts
- queued-dispatch.test.ts
- tmux-errors.integration.test.ts
- manager-agent.ts
- node-routes.ts
- oracle-voice-integration.test.ts
- .handleSessionEvent
- manager-structured-memory-validation.ts
- tmux-test-helpers.ts
- SessionService
- sampler.ts
- TmuxTerminalSessionController
- FakeManager
- active-sessions.ts
- ProviderSessionService
- oracle-voice-routes.test.ts
- DreamerService
- ScheduleRun
- FakeVoiceEngine
- schedules.ts
- pwa.ts
- TerminalSessionController
- client.test.ts
- agentic-remote
- session-directory.ts
- app.ts
- processes.ts
- send-matrix.integration.test.ts
- AgentProvider
- server/skill-settings.ts
- .replyUserInputInternal
- manager-store.ts
- dreamer-progress.ts
- hub-routes.ts
- SchedulerStore
- agentic-remote-gate
- bundle
- delegated-transcription-service.ts
- agent-service.test.ts
- ScheduleForm.tsx
- workspace-fixtures.ts
- Composer.tsx
- dreamer-planner.ts
- ManagerStore
- shell.ts
- lib.rs
- ui-scenes.ts
- normalizeKnowledgeRelativePath
- ManagerAttachment
- dependencies
- shared/settings-profile.ts
- agentic-remote-promotion-setup
- manager-routes.ts
- oracle-voice-config.ts
- manager-agent.test.ts
- PushNotificationService
- SessionOrderStore
- devDependencies
- config.rs
- manager-proactive-inbox.ts
- notification-store.ts
- oracle-voice-security.test.ts
- setupWorkspaceFixture
- EngineVoiceBackendSession
- schedule-recurrence.ts
- ManagerSnapshot
- VoicePlayback
- transport.test.ts
- scheduler-dispatcher.ts
- terminal-session.test.ts
- SettingsProfileClient
- capture-workspace.ts
- manager-proactive-coordinator.ts
- notification-center.ts
- oracle-voice-benchmark.ts
- service.ts
- cli-canary.ts
- settings-profile-store.ts
- scripts
- session-patch-browser.ts
- dreamer-service.test.ts
- notification-classifier.ts
- push-notification-service.ts
- .sendInternal
- ChatMessage
- notification-center-service.ts
- src/settings-profile.ts
- use-markdown-document.ts
- compilerOptions
- closed-sessions.ts
- session-reply-durability.test.ts
- transcription-service.ts
- ScheduleProposalCards.tsx
- host-telemetry.ts
- .discoverSessions
- .toolHost
- SessionKnowledgeStore
- startup-phases.test.ts
- oracle-voice-segments.ts
- oracle-voice-tickets.ts
- session-knowledge-store.ts
- pipeline.ts
- HostMonitorView.test.tsx
- compilerOptions
- full-gate.test.ts
- .observe
- compilerOptions
- HubEvent
- ManagerProactiveInbox
- OnlineRecognizer
- markdown-navigation.ts
- MessageTime.tsx
- compilerOptions
- oracle-status.test.ts
- compilerOptions
- ManagerMemory
- refusal-metrics.ts
- session-latency-benchmark.ts
- dreamer-schedule.ts
- KnowledgeStore
- promotion-monitor.test.ts
- terminal-startup-queue.test.ts
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- session-unread.pw.ts
- scripts
- session-knowledge-routes.ts
- session-resource-routes.test.ts
- terminal-form-deadline.test.ts
- manager-runtime.ts
- HostTelemetrySampler
- knowledge-store.ts
- registerSessionKnowledgeRoutes
- server/session-patches.ts
- renderer.ts
- package.json
- alerts.test.ts
- oracle-voice-assets.test.ts
- use-markdown-document.test.tsx
- pipeline.test.tsx
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- Pcm16Resampler
- document-render.pw.ts
- recently-closed.pw.ts
- dreamer-routes.ts
- manager-proactive-inbox.test.ts
- SessionAdmissions
- BackgroundTasksDialog.tsx
- html-preview.ts
- sign-in-expired.pw.ts
- benchmarkFixture
- session-knowledge-store.test.ts
- session-store-serialization.test.ts
- dataset
- generate-pwa-icons.ts
- feature-flags.ts
- ManagerProactiveInboxValidationError
- notification-center.integration.test.ts
- SpeakableSegmenter
- ScheduleNotificationService
- bridge.rs
- vite.config.ts
- WorkspaceFixtureOptions
- oracle-voice-benchmark.test.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- sent-message.ts
- doctor-cli.test.ts
- recovery-context.ts
- release-publication.test.ts
- UserInputFieldControl
- settings-profile.test.ts
- oracle-conversation-real.test.ts
- history-projection.test.ts
- HostTelemetryClock
- ProactiveManager
- PreviewFeaturesSettings.test.tsx
- settings.ts
- DocumentViewControls.tsx
- .transport
- WorkspaceFixtureState
- composer-layout.test.ts
- worker-handler.ts
- api-origin.test.ts
- promotion-setup.test.ts
- FakeRecorder
- FakeRecorder
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
- TerminalActivationSupersededError
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `AppWorkspace()` - 350 edges
2. `SessionDetail` - 337 edges
3. `AgentService` - 304 edges
4. `SessionStore` - 208 edges
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
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `DreamerStoreState` --references--> `DreamerSettings`  [EXTRACTED]
  server/dreamer-store.ts → shared/dreamer.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (264 total, 34 thin omitted)

### Community 0 - "AppWorkspace"
Cohesion: 0.02
Nodes (227): isManagerEvent(), terminalSendOptions(), submissionReceiptFromError(), listClosedSessions(), replyPermission(), saveHiddenSessionVisibility(), saveSessionVisibility(), AppWorkspace() (+219 more)

### Community 1 - "AgentService"
Cohesion: 0.04
Nodes (14): agentMode(), AgentService, isTerminalNotReadyRefusal(), lifecycleRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, sessionInUseConflictMessage(), suspendedRuntimeConflict() (+6 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (148): SettingsChange, SettingsProfileKey, SettingsUpdateResult, addKnowledgeRoot(), askSession(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession() (+140 more)

### Community 3 - "SessionStore"
Cohesion: 0.03
Nodes (60): fixture(), restart(), fixture(), connect(), createStore(), deferred(), disk, enqueue() (+52 more)

### Community 4 - "react"
Cohesion: 0.03
Nodes (109): react, hasActiveBackgroundTasks(), hasForegroundTurn(), CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), SessionProvenance, effectivePreviewFeatures(), isPreviewAvailable() (+101 more)

### Community 5 - "App.tsx"
Cohesion: 0.03
Nodes (112): extension(), MAX_SESSION_FILE_BYTES, sessionFileValidationError(), supportedExtensions, supportsSessionFile(), executeCommand(), activityKindFromMessage(), ActivityMessage() (+104 more)

### Community 6 - "oracle-voice.ts"
Cohesion: 0.04
Nodes (96): apps, directories, sendNodeVoiceOutput(), config, limits(), outputBytes(), ActiveConversation, availableCapabilities() (+88 more)

### Community 7 - "SessionDetail"
Cohesion: 0.04
Nodes (19): ClaudeAgentService, isMissingClaudeSessionError(), preparePrompt(), queueConflict(), claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred() (+11 more)

### Community 8 - "agent-service.ts"
Cohesion: 0.02
Nodes (105): AcceptedSdkReply, ActivePrompt, ActivityToolStart, ansiSequence, commandShortcut(), CopilotClientLike, DeliveryBoundary, ElicitationContext (+97 more)

### Community 9 - "remote-node-client.ts"
Cohesion: 0.03
Nodes (57): RemoteResync, RemoteSessionRead, DEFINITE_DISPATCH_REFUSALS, headerSafe(), REDIRECT_STATUSES, RemoteNodeClient, requestBytes(), client() (+49 more)

### Community 10 - "oracle-voice-worker.ts"
Cohesion: 0.03
Nodes (45): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+37 more)

### Community 11 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (56): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+48 more)

### Community 12 - "sections.tsx"
Cohesion: 0.04
Nodes (93): RuntimeModelOption, previewFeatureCatalogue, AppearanceSetting, NewSessionBackendSetting, activateSession(), addComputer(), getManager(), getProviderRuntimeOptions() (+85 more)

### Community 13 - "manager-structured-memory.ts"
Cohesion: 0.04
Nodes (70): benchmarkState(), now(), openFixture(), searchSamples(), initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, authorityRank, compareRanked() (+62 more)

### Community 14 - "terminal-session.ts"
Cohesion: 0.04
Nodes (100): activeBottomFrame(), afterExit(), boxedComposerFrame(), captureBeforeDeadline(), captureTerminal(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS (+92 more)

### Community 15 - "multi-node.test.ts"
Cohesion: 0.03
Nodes (34): AgentServiceEvents, BuildAppOptions, ClaudeAgentServiceEvents, DirectoryScope, directories, FakeSessionService, openNodeVoiceSocket(), routingFixture() (+26 more)

### Community 16 - "OracleVoiceCoordinator"
Cohesion: 0.05
Nodes (32): ManagerEventSource, ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect() (+24 more)

### Community 17 - "manager.ts"
Cohesion: 0.05
Nodes (40): ManagerClientDefaults, ManagerMessageRole, ManagerMessageState, ManagerSubmissionSource, ResolveManagerConfirmationInput, ORACLE_VOICE_CONNECTION_TIMEOUT_MS, getOracleVoiceCapabilities(), captureClientError() (+32 more)

### Community 18 - "ManagedSession"
Cohesion: 0.07
Nodes (18): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, ManagerProactiveCoordinatorOptions (+10 more)

### Community 19 - "background-task-adapter.ts"
Cohesion: 0.05
Nodes (77): DeferredSession, addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText() (+69 more)

### Community 20 - "manager-tools.ts"
Cohesion: 0.04
Nodes (48): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), changeSuspension() (+40 more)

### Community 21 - "computer-manager.ts"
Cohesion: 0.06
Nodes (64): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+56 more)

### Community 22 - "ManagerAgent"
Cohesion: 0.07
Nodes (17): FakeVoiceState, checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime() (+9 more)

### Community 23 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 24 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (45): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+37 more)

### Community 25 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 26 - "contracts.ts"
Cohesion: 0.04
Nodes (51): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), PersistedCursor, NotificationCursor, Row (+43 more)

### Community 27 - "session-store-providers.test.ts"
Cohesion: 0.03
Nodes (53): root, script, ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services (+45 more)

### Community 28 - "ManagerAssistant.tsx"
Cohesion: 0.05
Nodes (58): MANAGER_REMOVED_ATTACHMENTS_REASON, cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage() (+50 more)

### Community 29 - "VoiceCapture"
Cohesion: 0.06
Nodes (24): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, harness() (+16 more)

### Community 30 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (45): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+37 more)

### Community 31 - "dreamer-service.ts"
Cohesion: 0.07
Nodes (54): boundedText(), safeRunError(), unavailableSnapshot(), DreamerStoreSnapshot, DREAMER_PROGRESS_REFRESH_MS, DreamerCompletionCandidate, DreamerPlan, DreamerPlanItemSource (+46 more)

### Community 32 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (28): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDelivery, QueuedDispatches (+20 more)

### Community 33 - "tmux-errors.integration.test.ts"
Cohesion: 0.05
Nodes (37): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+29 more)

### Community 34 - "manager-agent.ts"
Cohesion: 0.06
Nodes (45): DreamerProgressEntry, DreamerProgressView, automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung (+37 more)

### Community 35 - "node-routes.ts"
Cohesion: 0.06
Nodes (41): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+33 more)

### Community 36 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (29): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+21 more)

### Community 37 - ".handleSessionEvent"
Cohesion: 0.08
Nodes (40): activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength() (+32 more)

### Community 38 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 39 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (47): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, [root], assertSameIdentity() (+39 more)

### Community 40 - "SessionService"
Cohesion: 0.07
Nodes (10): closeReason(), closeVoiceSocket(), registerNodeRoutes(), releases, session, snapshot, readServiceResources(), readSessionSkills() (+2 more)

### Community 41 - "sampler.ts"
Cohesion: 0.08
Nodes (48): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+40 more)

### Community 42 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (14): startAgentAfterClear(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, isTerminalSessionInUsePrompt(), isTerminalVisiblyIdle(), processAncestors() (+6 more)

### Community 43 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 44 - "active-sessions.ts"
Cohesion: 0.07
Nodes (45): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+37 more)

### Community 46 - "oracle-voice-routes.test.ts"
Cohesion: 0.05
Nodes (24): ActiveBackendSession, installFakeBrowserVoice(), ScriptedUtterance, Window, exactArrayBuffer(), nodeVoiceCapabilities(), rawDataBuffer(), receiveNodeVoiceMessage() (+16 more)

### Community 47 - "DreamerService"
Cohesion: 0.12
Nodes (9): DreamerMemoryMetadata, digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerSnapshot (+1 more)

### Community 48 - "ScheduleRun"
Cohesion: 0.13
Nodes (11): provenance(), SessionScheduleLauncher, session(), ScheduleLaunchRefusedError, SchedulerDispatcher, ScheduleReconciliation, registerSchedulerRoutes(), deferUnboundWorktree() (+3 more)

### Community 49 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (24): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+16 more)

### Community 50 - "schedules.ts"
Cohesion: 0.07
Nodes (43): proposalInput, State, stateSchema, timestamp, parseCronExpression(), action, create, existing (+35 more)

### Community 51 - "pwa.ts"
Cohesion: 0.08
Nodes (42): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), changed(), frames, innermostDialogFrame(), listeners (+34 more)

### Community 52 - "TerminalSessionController"
Cohesion: 0.04
Nodes (21): holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), fixtures, recoverAndSeed() (+13 more)

### Community 53 - "client.test.ts"
Cohesion: 0.05
Nodes (16): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+8 more)

### Community 54 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 55 - "session-directory.ts"
Cohesion: 0.10
Nodes (37): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+29 more)

### Community 56 - "app.ts"
Cohesion: 0.07
Nodes (31): buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), directories, runtimes (+23 more)

### Community 57 - "processes.ts"
Cohesion: 0.08
Nodes (27): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessStat, expectProc(), ProcessFixture, processStatFixture() (+19 more)

### Community 58 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (41): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+33 more)

### Community 59 - "AgentProvider"
Cohesion: 0.07
Nodes (27): CreationRuntime, delay(), requireFolderTrust(), sameFolder(), SessionFolderTrustPolicy, SessionLaunch, SessionLauncher, SessionLaunchInput (+19 more)

### Community 60 - "server/skill-settings.ts"
Cohesion: 0.09
Nodes (28): instrument(), builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills() (+20 more)

### Community 61 - ".replyUserInputInternal"
Cohesion: 0.08
Nodes (16): isUncertainDelivery(), persistedFormAnswer(), directories, disk, fixture(), gate(), gates, initialize() (+8 more)

### Community 62 - "manager-store.ts"
Cohesion: 0.09
Nodes (24): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, JournalRecorder (+16 more)

### Community 63 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, DreamerProgressSource (+11 more)

### Community 64 - "hub-routes.ts"
Cohesion: 0.05
Nodes (43): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+35 more)

### Community 65 - "SchedulerStore"
Cohesion: 0.14
Nodes (5): fixture(), failure(), SchedulerStore, ScheduleProposal, Schedule

### Community 66 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 67 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 68 - "delegated-transcription-service.ts"
Cohesion: 0.09
Nodes (17): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+9 more)

### Community 69 - "agent-service.test.ts"
Cohesion: 0.07
Nodes (24): CopilotSessionLike, directories, fakeClient(), ForkRequest, forkSession(), services, terminalFormSteps(), busyTerminal() (+16 more)

### Community 70 - "ScheduleForm.tsx"
Cohesion: 0.11
Nodes (32): scheduleProposalSummary(), nextOccurrences(), next(), now, validateRecurrence(), scheduleProviderUnavailableReason(), ScheduleRecurrence, ScheduleTarget (+24 more)

### Community 71 - "workspace-fixtures.ts"
Cohesion: 0.07
Nodes (34): frame(), geometry, output, scratch, screenshot(), { values }, accents, Measurement (+26 more)

### Community 72 - "Composer.tsx"
Cohesion: 0.09
Nodes (19): families, modelFamily, repositoryModels, AttachmentStrip(), composerSteeringUnavailableReason(), ComposerActions(), ContextRing(), QueuedPromptList() (+11 more)

### Community 73 - "dreamer-planner.ts"
Cohesion: 0.09
Nodes (37): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+29 more)

### Community 74 - "ManagerStore"
Cohesion: 0.10
Nodes (8): openStore(), emptyState(), ManagerStore, open(), createRealManager(), DeterministicManagerClient, deterministicManagerHub(), registry()

### Community 75 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 76 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 77 - "ui-scenes.ts"
Cohesion: 0.09
Nodes (24): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+16 more)

### Community 78 - "normalizeKnowledgeRelativePath"
Cohesion: 0.09
Nodes (32): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+24 more)

### Community 79 - "ManagerAttachment"
Cohesion: 0.11
Nodes (27): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+19 more)

### Community 80 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 81 - "shared/settings-profile.ts"
Cohesion: 0.08
Nodes (33): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+25 more)

### Community 82 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 83 - "manager-routes.ts"
Cohesion: 0.08
Nodes (18): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+10 more)

### Community 84 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (27): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger(), canonicalPath() (+19 more)

### Community 85 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (18): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+10 more)

### Community 86 - "PushNotificationService"
Cohesion: 0.13
Nodes (9): start(), PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema (+1 more)

### Community 87 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 88 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 89 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 90 - "manager-proactive-inbox.ts"
Cohesion: 0.09
Nodes (36): assertExactKeys(), canonicalHash(), DISPOSITIONS, eventId(), hasExactKeys(), isAlreadyExists(), isDisposition(), isEventKind() (+28 more)

### Community 91 - "notification-store.ts"
Cohesion: 0.10
Nodes (19): NotificationCursors, cursorSchema, durableState(), emptyState(), identity, kind, matchesNotification(), NOTIFICATION_LIMIT (+11 more)

### Community 92 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (21): FakeVoiceEngineCall, SocketMessage, apps, config, configFixture(), connect(), createManager(), Inbox (+13 more)

### Community 93 - "setupWorkspaceFixture"
Cohesion: 0.07
Nodes (16): pageFor(), desktop, devices, long, open(), phone, veryLong, devices (+8 more)

### Community 94 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 95 - "schedule-recurrence.ts"
Cohesion: 0.11
Nodes (31): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, ParsedCronExpression, parseField(), actualSpacingError(), addCalendarYears() (+23 more)

### Community 96 - "ManagerSnapshot"
Cohesion: 0.09
Nodes (13): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+5 more)

### Community 97 - "VoicePlayback"
Cohesion: 0.13
Nodes (6): pcm16ToFloat(), SegmentDrain, FakeSource, harness(), validateGeneration(), VoicePlayback

### Community 98 - "transport.test.ts"
Cohesion: 0.10
Nodes (18): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, registerHostTelemetryRoutes() (+10 more)

### Community 99 - "scheduler-dispatcher.ts"
Cohesion: 0.10
Nodes (19): NoopScheduleLauncher, ScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS, SchedulerDispatcherOptions, ScheduleStopAcknowledgement, ScheduleTargetUnavailableError (+11 more)

### Community 100 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (25): paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), deliveryFixture() (+17 more)

### Community 101 - "SettingsProfileClient"
Cohesion: 0.16
Nodes (8): sameSettingValue(), SettingsProfileSnapshot, errorText(), isRefusal(), newDeviceId(), samePending(), SettingsProfileClient, SettingsProfileTransport

### Community 102 - "capture-workspace.ts"
Cohesion: 0.13
Nodes (24): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+16 more)

### Community 103 - "manager-proactive-coordinator.ts"
Cohesion: 0.17
Nodes (7): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, SessionLifecycle, ManagerProactiveInboxEvent

### Community 104 - "notification-center.ts"
Cohesion: 0.14
Nodes (21): defaultNotificationKindPreference, NotificationKind, NotificationKindPreference, notificationKinds, NotificationRecord, NotificationsChanged, NotificationSeverity, FeatureEvent (+13 more)

### Community 105 - "oracle-voice-benchmark.ts"
Cohesion: 0.11
Nodes (25): BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, derived(), execFileAsync (+17 more)

### Community 106 - "service.ts"
Cohesion: 0.12
Nodes (12): HostRequest, HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError(), HostTelemetryService, HostTelemetryTarget, make(), HOST_TELEMETRY_INVALID_CODE (+4 more)

### Community 107 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 108 - "settings-profile-store.ts"
Cohesion: 0.14
Nodes (17): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+9 more)

### Community 109 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 110 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (24): advance(), connections, content(), FrameMeasurement, lastHeading(), message(), open(), percentile() (+16 more)

### Community 111 - "dreamer-service.test.ts"
Cohesion: 0.09
Nodes (11): DreamerMemoryMetadataRecord, DreamerProgressLimits, DreamerServiceOptions, directories, enabledSettings(), directories, FakeAgent, fixture() (+3 more)

### Community 112 - "notification-classifier.ts"
Cohesion: 0.17
Nodes (19): attentionClosed(), attentionSeed(), classifyHostNotification(), classifyHubNotification(), classifyOracleNotification(), HOST_ALERT_MEMORY_DURATION_MS, notificationIdentity(), record() (+11 more)

### Community 113 - "push-notification-service.ts"
Cohesion: 0.12
Nodes (19): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+11 more)

### Community 114 - ".sendInternal"
Cohesion: 0.16
Nodes (18): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), idleButForBackgroundShells(), isBackgroundShellsRow(), isTerminalAgentWorking() (+10 more)

### Community 115 - "ChatMessage"
Cohesion: 0.14
Nodes (13): Connection, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset, session(), StoredSession (+5 more)

### Community 116 - "notification-center-service.ts"
Cohesion: 0.14
Nodes (7): HOST_ALERT_POLL_INTERVAL_MS, NotificationCenterService, NotificationRecorder, booleanQuery, filters, params, NotificationKindPreferences

### Community 117 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (19): NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+11 more)

### Community 118 - "use-markdown-document.ts"
Cohesion: 0.16
Nodes (19): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+11 more)

### Community 119 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 120 - "closed-sessions.ts"
Cohesion: 0.12
Nodes (10): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS, closedSessionContext(), excerpt(), isClosedSessionContext() (+2 more)

### Community 121 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 122 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 123 - "ScheduleProposalCards.tsx"
Cohesion: 0.17
Nodes (20): getSchedule(), listScheduleProposals(), resolveScheduleProposal(), days, labels, proposalChanges(), proposalConsequence(), proposalSchedule (+12 more)

### Community 124 - "host-telemetry.ts"
Cohesion: 0.13
Nodes (19): aggregate, DiskSpaceSchema, HOST_TELEMETRY_LIVE_WINDOW_MS, HostHistorySchema, HostInfoSchema, HostMetricAggregate, HostMetricAggregateSchema, HostMetrics (+11 more)

### Community 127 - "SessionKnowledgeStore"
Cohesion: 0.21
Nodes (3): bindingKey(), SessionKnowledgeStore, SessionKnowledgeBinding

### Community 128 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (14): phases, port, app(), directories, headers, launcher, createStartupPhases(), StartupPhaseRecord (+6 more)

### Community 129 - "oracle-voice-segments.ts"
Cohesion: 0.16
Nodes (21): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+13 more)

### Community 130 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 131 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 132 - "pipeline.ts"
Cohesion: 0.15
Nodes (21): holdingRenderer(), openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), documentOpening(), documentParts(), documentRenderEvents() (+13 more)

### Community 133 - "HostMonitorView.test.tsx"
Cohesion: 0.17
Nodes (18): HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics, snapshot, Socket, bytes() (+10 more)

### Community 134 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 135 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 136 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 137 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 138 - "HubEvent"
Cohesion: 0.14
Nodes (9): ComputerManagerEvents, classifyScheduleNotification(), HubEventSource, input(), now, run(), HubEvent, ScheduleRunNotification (+1 more)

### Community 139 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 140 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 141 - "markdown-navigation.ts"
Cohesion: 0.19
Nodes (18): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+10 more)

### Community 142 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 143 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 144 - "oracle-status.test.ts"
Cohesion: 0.18
Nodes (15): oracleHostStatusFixture(), bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes() (+7 more)

### Community 145 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 146 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 147 - "refusal-metrics.ts"
Cohesion: 0.16
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+7 more)

### Community 148 - "session-latency-benchmark.ts"
Cohesion: 0.22
Nodes (17): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+9 more)

### Community 149 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 151 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 152 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (10): client(), delayQueueWrite(), disk, exec, gate(), holdQueueCommit(), NativeFixture, NativeRuntime (+2 more)

### Community 153 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 154 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 155 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 156 - "session-unread.pw.ts"
Cohesion: 0.13
Nodes (9): bounds(), devices, edgeState(), open(), screenshot(), unreadState(), BACKGROUND_SESSION_ID, fixtureBackgroundTasks (+1 more)

### Community 157 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 158 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 159 - "session-resource-routes.test.ts"
Cohesion: 0.15
Nodes (9): node(), apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService (+1 more)

### Community 160 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 161 - "manager-runtime.ts"
Cohesion: 0.22
Nodes (11): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+3 more)

### Community 163 - "knowledge-store.ts"
Cohesion: 0.14
Nodes (11): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, parseMetadata(), PersistedKnowledgeState (+3 more)

### Community 164 - "registerSessionKnowledgeRoutes"
Cohesion: 0.26
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 165 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 166 - "renderer.ts"
Cohesion: 0.18
Nodes (7): createWorkerRenderer(), defaultDocumentRenderer(), DocumentRendererContext, RendererWorker, synchronousRenderer, FakeWorker, startWorkers()

### Community 167 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 168 - "alerts.test.ts"
Cohesion: 0.17
Nodes (7): HostAlertMonitor, computer, observe(), snapshot(), start, sustained(), HOST_ALERT_COOLDOWN_MS

### Community 169 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 170 - "use-markdown-document.test.tsx"
Cohesion: 0.16
Nodes (7): drawnInParts(), DocumentRenderEvent, RenderedDocumentTree, DocumentRenderer, components, Reader(), show()

### Community 171 - "pipeline.test.tsx"
Cohesion: 0.20
Nodes (9): components, drawn(), drawnPage(), fixtures, html(), today(), rehypeDocumentHeadings(), remarkSafeBreaks() (+1 more)

### Community 172 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 173 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 174 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 175 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 176 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 177 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 178 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 180 - "recently-closed.pw.ts"
Cohesion: 0.23
Nodes (9): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), open(), row() (+1 more)

### Community 181 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 182 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 184 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 185 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 186 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 187 - "benchmarkFixture"
Cohesion: 0.25
Nodes (9): benchmarkFixture(), deferred(), firstTtsSegment(), maybeMeasured(), measured(), measureSttPass(), measureTts(), missing() (+1 more)

### Community 188 - "session-knowledge-store.test.ts"
Cohesion: 0.20
Nodes (7): SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, disk, fixture(), fixtures, releases, root()

### Community 189 - "session-store-serialization.test.ts"
Cohesion: 0.22
Nodes (6): encode(), directories, seedOffset, serializeSessions(), serializeState(), serializeStateChunks()

### Community 190 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 191 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 192 - "feature-flags.ts"
Cohesion: 0.38
Nodes (7): hub(), defaultHubFeatureFlags, HubFeatureFlag, hubFlagCatalogue, parseFeatureFlag(), previewFeatureNames, readHubFeatureFlags()

### Community 193 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 194 - "notification-center.integration.test.ts"
Cohesion: 0.22
Nodes (7): center(), directories, directory(), hub(), now, runtimes, trusted

### Community 195 - "SpeakableSegmenter"
Cohesion: 0.29
Nodes (3): SpeakableSegmenter, validateMessageId(), ./server/oracle-voice-segments.ts

### Community 197 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 198 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 199 - "WorkspaceFixtureOptions"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 200 - "oracle-voice-benchmark.test.ts"
Cohesion: 0.28
Nodes (6): benchmarkGroup(), buildConfig(), normalizeTranscript(), parsePcm16Wave(), verifyCorpus(), wordErrorRate()

### Community 201 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 202 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 203 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 204 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 205 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 206 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 207 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 208 - "settings-profile.test.ts"
Cohesion: 0.29
Nodes (3): settingsProfileCacheKey, cached(), MemoryStorage

### Community 210 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 213 - "PreviewFeaturesSettings.test.tsx"
Cohesion: 0.33
Nodes (5): applySettingsChanges(), clients, EffectiveState(), hub(), SchedulerDraft()

### Community 214 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 215 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 217 - "WorkspaceFixtureState"
Cohesion: 0.53
Nodes (4): WorkspaceFixtureState, AppVersion, HubFeatureFlags, HubHealth

### Community 218 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 219 - "worker-handler.ts"
Cohesion: 0.47
Nodes (4): render, scope, handleRenderRequest(), RenderRequest

### Community 221 - "api-origin.test.ts"
Cohesion: 0.40
Nodes (4): prefixes, session, trusted, untrusted

### Community 222 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 228 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **1420 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1415 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2377 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionStore`, `SessionDetail`, `agent-service.ts`, `oracle-voice-worker.ts`, `ManagerProactiveInbox`, `manager-structured-memory.ts`, `ManagedSession`, `refusal-metrics.ts`, `KnowledgeStore`, `ManagerAgent`, `oracle-task-store.ts`, `tmux-errors.integration.test.ts`, `HostTelemetrySampler`, `manager-runtime.ts`, `node-routes.ts`, `alerts.test.ts`, `SessionService`, `ProviderSessionService`, `DreamerService`, `ScheduleRun`, `dreamer-routes.ts`, `server/skill-settings.ts`, `manager-store.ts`, `hub-routes.ts`, `SchedulerStore`, `feature-flags.ts`, `delegated-transcription-service.ts`, `ScheduleNotificationService`, `ManagerStore`, `manager-routes.ts`, `oracle-voice-config.ts`, `PushNotificationService`, `SessionOrderStore`, `notification-store.ts`, `transport.test.ts`, `manager-proactive-coordinator.ts`, `service.ts`, `cli-canary.ts`, `settings-profile-store.ts`, `notification-center-service.ts`, `transcription-service.ts`, `SessionKnowledgeStore`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `queued-dispatch.test.ts`, `AgentService`, `.handleSessionEvent`, `SessionDetail`, `.discoverSessions`, `session-store-providers.test.ts`, `.replyUserInputInternal`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `ManagerToolHost` connect `manager-tools.ts` to `SchedulerStore`, `manager-agent.ts`, `service.ts`, `manager-structured-memory.ts`, `ManagerMemory`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1420 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.022330162585171693 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03541752365281777 - nodes in this community are weakly interconnected._
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
