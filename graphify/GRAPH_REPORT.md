# Agentic Remote - Graphify code map

Snapshot: `308d4ffb6b6e9660515128f79ae8e555146399ed3c14ecbcde9ba92cbdc937aa`

Source checkout: `cc9baa26634397ab4f87f63d507efa2c297e6d4e`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 637 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 637 files · ~1,136,506 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 8909 nodes · 25716 edges · 264 communities (213 shown, 33 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1302 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionDetail
- SessionStore
- AppWorkspace
- api.ts
- ClaudeAgentService
- App.tsx
- react
- manager-structured-memory.ts
- agent-service.ts
- computer-manager.ts
- claude-agent-service.ts
- ManagerStore
- contracts.ts
- OracleVoiceCoordinator
- CopilotClientLike
- session-presentation.ts
- multi-node.test.ts
- client.ts
- ManagedSession
- terminal-session.ts
- KnowledgeStore
- agentic-remote-promotion-monitor
- oracle-voice-soak.ts
- manager-tools.ts
- dreamer-store.ts
- FakeVoiceEngine
- manager-agent.ts
- notification-center-service.ts
- hub-routes.ts
- oracle-voice-integration.test.ts
- ManagerAgent
- tmux-test-helpers.ts
- workspace-fixtures.ts
- oracle-task-store.ts
- schedule-launcher.ts
- queued-dispatch.test.ts
- schedule-launcher.test.ts
- SessionService
- RemoteNodeClient
- manager-structured-memory-validation.ts
- ProviderSessionService
- session-knowledge-store.ts
- scheduler-store.ts
- OracleDreamer.tsx
- TmuxTerminalSessionController
- manager-routes.ts
- DreamerService
- fake-voice.ts
- manager-proactive-coordinator.ts
- .sendAdmittedWithBackend
- oracle-voice-session.ts
- agentic-remote
- session-launcher.ts
- dreamer-progress.ts
- send-matrix.integration.test.ts
- sampler.ts
- VoiceAudioFrame
- SchedulerStore
- ComposerActions.tsx
- oracle-voice-routes.test.ts
- oracle-voice-benchmark.ts
- oracle-voice.ts
- markdown-navigation.ts
- agentic-remote-gate
- PushNotificationService
- ui-scenes.ts
- bundle
- TerminalSessionController
- feature-flags.ts
- terminal-session.test.ts
- processes.ts
- setupWorkspaceFixture
- active-sessions.ts
- oracle-voice-routes.ts
- ManagerAssistant.tsx
- app.ts
- manager-proactive-inbox.ts
- ScheduleForm.tsx
- VoicePlayback
- shell.ts
- lib.rs
- normalizeKnowledgeRelativePath
- client.test.ts
- dependencies
- ChildVoiceEngine
- SettingsProfileSnapshot
- schedule-recurrence.ts
- agentic-remote-promotion-setup
- session-latency-benchmark.ts
- shared/settings-profile.ts
- ResidentVoiceWorker
- transcription-service.ts
- devDependencies
- config.rs
- oracle-voice-child.test.ts
- oracle-voice-child.ts
- schedule-proposals.ts
- remote-voice-client.ts
- startup-phases.test.ts
- manager-agent.test.ts
- oracle-voice-worker.ts
- knowledge-tree.ts
- recovery-resend-durability.test.ts
- background-task-adapter.ts
- .sendInternal
- reader.ts
- session-patch-browser.ts
- real-voice.ts
- session-unread.pw.ts
- dreamer-planner.ts
- host-telemetry.ts
- ManagerProactiveInbox
- oracle-voice-security.test.ts
- push-notification-service.ts
- schedules.ts
- SessionOrderStore
- delegated-transcription-service.ts
- service.ts
- ManagerAttachment
- pwa.ts
- .toolHost
- ManagerProactiveCoordinator
- capture-workspace.ts
- cli-canary.ts
- src/settings-profile.ts
- scripts
- agent-service.test.ts
- dreamer-service.test.ts
- ManagerAssistant.test.tsx
- VoiceCapture
- session-directory.ts
- scheduler-dispatcher.ts
- compilerOptions
- oracle-voice-config.ts
- backgroundTasksFromEvents
- closed-sessions.ts
- dreamer-service.ts
- oracle-voice-segments.ts
- pipeline.ts
- use-markdown-document.ts
- SettingsProfileClient
- oracle-voice-tickets.ts
- refusal-metrics.ts
- session-response-order.ts
- HostMonitorView.test.tsx
- compilerOptions
- full-gate.test.ts
- transport.test.ts
- workspace-browser.ts
- session-reply-durability.test.ts
- PromptCards.tsx
- renderer.ts
- capture.ts
- compilerOptions
- session-store-providers.test.ts
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- oracle-status.test.ts
- ManagerMemory
- SubmissionError
- dreamer-schedule.ts
- promotion-monitor.test.ts
- terminal-startup-queue.test.ts
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- .observe
- manager-runtime.ts
- NotificationCenterService
- SkillSettingsService
- package.json
- terminal-form-deadline.test.ts
- background-task-stop.test.ts
- oracle-voice-assets.test.ts
- shared/skill-settings.ts
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- ShellNavigation.test.tsx
- pipeline.test.tsx
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- session-scope.ts
- Pcm16Resampler
- background-task-tracker.ts
- manager-proactive-inbox.test.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- sign-in-expired.pw.ts
- DeferredSession
- ScheduleNotificationService
- SessionAdmissions
- use-oracle-attachments.ts
- usePanelWidth
- dataset
- generate-pwa-icons.ts
- file-upload-routes.ts
- server/skill-settings.ts
- bridge.rs
- use-markdown-document.test.tsx
- VoiceCaptureOptions
- vite.config.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- tmux-errors.test.ts
- SkillsSettings.tsx
- sent-message.ts
- capture.test.ts
- VoiceVadOptions
- doctor-cli.test.ts
- release-publication.test.ts
- oracle-conversation-real.test.ts
- skill-settings-jsonc.ts
- history-projection.test.ts
- HostTelemetryClock
- settings.ts
- background-task-adapter.test.ts
- composer-layout.test.ts
- HostAlertMonitor
- VoiceSttEngine
- promotion-setup.test.ts
- FakeRecorder
- MemoryStorage
- storedProvider
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
2. `SessionDetail` - 341 edges
3. `AgentService` - 310 edges
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
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (264 total, 33 thin omitted)

### Community 0 - "SessionDetail"
Cohesion: 0.04
Nodes (10): agentMode(), AgentService, lifecycleRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, suspendedRuntimeConflict(), suspendRefused(), PendingClaudeReply (+2 more)

### Community 1 - "SessionStore"
Cohesion: 0.02
Nodes (98): storage(), fixture(), restart(), fixture(), connect(), createStore(), deferred(), disk (+90 more)

### Community 2 - "AppWorkspace"
Cohesion: 0.03
Nodes (179): terminalSendOptions(), sessionFileValidationError(), deleteSession(), getSession(), AppWorkspace(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown() (+171 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (143): SettingsChange, SettingsProfileKey, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), submissionReceiptFromError(), addComputer(), addKnowledgeRoot() (+135 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (31): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services (+23 more)

### Community 5 - "App.tsx"
Cohesion: 0.03
Nodes (93): isManagerEvent(), activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), sidebarResizeMove() (+85 more)

### Community 6 - "react"
Cohesion: 0.04
Nodes (95): react, RuntimeModelOption, AppearanceSetting, NewSessionBackendSetting, activateSession(), createSession(), getHubHealth(), getProviderRuntimeOptions() (+87 more)

### Community 7 - "manager-structured-memory.ts"
Cohesion: 0.04
Nodes (71): capturePrompt(), benchmarkState(), now(), openFixture(), searchSamples(), initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, authorityRank (+63 more)

### Community 8 - "agent-service.ts"
Cohesion: 0.04
Nodes (90): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+82 more)

### Community 9 - "computer-manager.ts"
Cohesion: 0.04
Nodes (69): RemoteSessionListing, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema (+61 more)

### Community 10 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (66): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, RemoteNodeRedirectError (+58 more)

### Community 11 - "ManagerStore"
Cohesion: 0.05
Nodes (34): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+26 more)

### Community 12 - "contracts.ts"
Cohesion: 0.03
Nodes (70): make(), PersistedCursor, NotificationCursor, node(), Row, SessionPromptDelivery, apps, dataDirectory() (+62 more)

### Community 13 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (24): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+16 more)

### Community 14 - "CopilotClientLike"
Cohesion: 0.03
Nodes (59): root, script, CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases (+51 more)

### Community 15 - "session-presentation.ts"
Cohesion: 0.04
Nodes (76): CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, CloseSessionDialog(), RecentlyClosedCard() (+68 more)

### Community 16 - "multi-node.test.ts"
Cohesion: 0.04
Nodes (27): AgentServiceEvents, ClaudeAgentServiceEvents, DirectoryScope, directories, FakeSessionService, routingFixture(), session(), temporaryDirectory() (+19 more)

### Community 17 - "client.ts"
Cohesion: 0.06
Nodes (35): ManagerClientDefaults, VoiceCapabilities, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason(), isCapabilities() (+27 more)

### Community 18 - "ManagedSession"
Cohesion: 0.08
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, FakeManager (+5 more)

### Community 19 - "terminal-session.ts"
Cohesion: 0.04
Nodes (81): composer(), processAdapter, boxedComposerFrame(), busyRowStatus(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed() (+73 more)

### Community 20 - "KnowledgeStore"
Cohesion: 0.04
Nodes (53): SessionMetadataLookup, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState (+45 more)

### Community 21 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 22 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (35): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+27 more)

### Community 23 - "manager-tools.ts"
Cohesion: 0.05
Nodes (39): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), changeSuspension() (+31 more)

### Community 24 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (42): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+34 more)

### Community 25 - "FakeVoiceEngine"
Cohesion: 0.05
Nodes (37): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, voiceBackend(), EnabledOracleVoiceConfig (+29 more)

### Community 26 - "manager-agent.ts"
Cohesion: 0.05
Nodes (57): DreamerProgressEntry, DreamerProgressView, automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkSessionConfig, messagePriority() (+49 more)

### Community 27 - "notification-center-service.ts"
Cohesion: 0.05
Nodes (48): center(), directories, directory(), hub(), now, runtimes, trusted, NotificationCursors (+40 more)

### Community 28 - "hub-routes.ts"
Cohesion: 0.04
Nodes (58): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+50 more)

### Community 29 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (33): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+25 more)

### Community 30 - "ManagerAgent"
Cohesion: 0.09
Nodes (13): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+5 more)

### Community 31 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (55): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, Screens, startCopilot() (+47 more)

### Community 32 - "workspace-fixtures.ts"
Cohesion: 0.04
Nodes (45): frame(), geometry, output, scratch, screenshot(), { values }, accents, Measurement (+37 more)

### Community 33 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (46): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+38 more)

### Community 34 - "schedule-launcher.ts"
Cohesion: 0.10
Nodes (16): LaunchPrimitives, provenance(), ScheduleLauncherHost, ScheduleProvenance, scheduleSessionTitle(), SessionScheduleLauncher, ScheduleLauncher, ScheduleLaunchRefusedError (+8 more)

### Community 35 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (31): openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+23 more)

### Community 36 - "schedule-launcher.test.ts"
Cohesion: 0.05
Nodes (37): connections, fixture(), managers, releases, remote, session(), ComputerRegistry, DurableRegisteredComputer (+29 more)

### Community 37 - "SessionService"
Cohesion: 0.06
Nodes (14): nodeVoiceCapabilities(), registerNodeRoutes(), apps, directories, directory(), obstructUploads(), pairedFixture(), providers (+6 more)

### Community 38 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (11): RemoteResync, RemoteSessionRead, RemoteNodeClient, client(), RemoteNodeCapabilityError, RemoteNodeTransportError, BackgroundTaskSnapshot, NodeInfo (+3 more)

### Community 39 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 41 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+22 more)

### Community 42 - "scheduler-store.ts"
Cohesion: 0.07
Nodes (39): ComputerManagerEvents, computer, observe(), snapshot(), start, sustained(), attentionClosed(), attentionSeed() (+31 more)

### Community 43 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (45): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+37 more)

### Community 44 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (15): startAgentAfterClear(), afterExit(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors() (+7 more)

### Community 45 - "manager-routes.ts"
Cohesion: 0.06
Nodes (33): CreationRuntime, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams (+25 more)

### Community 46 - "DreamerService"
Cohesion: 0.12
Nodes (10): DreamerMemoryMetadata, digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate (+2 more)

### Community 47 - "fake-voice.ts"
Cohesion: 0.07
Nodes (11): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance (+3 more)

### Community 48 - "manager-proactive-coordinator.ts"
Cohesion: 0.05
Nodes (11): FakeManager, ComputerGenerations, ManagerProactiveCoordinatorOptions, ProactiveManager, SessionLifecycle, directories, FakeAgent, FakeManager (+3 more)

### Community 49 - ".sendAdmittedWithBackend"
Cohesion: 0.09
Nodes (13): commandShortcut(), isTerminalNotReadyRefusal(), sessionInUseConflictMessage(), sessionInUseQueueMessage(), stripAnsi(), terminalAnswerRefused(), terminalComposerUnreadable(), isRetainedRefusal() (+5 more)

### Community 50 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (17): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), QueuedOutput (+9 more)

### Community 51 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 52 - "session-launcher.ts"
Cohesion: 0.06
Nodes (27): ClaudeSdk, awaitTermination(), LaunchCreations, apps, directories, directory(), runtime(), services (+19 more)

### Community 53 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 54 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (42): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+34 more)

### Community 55 - "sampler.ts"
Cohesion: 0.08
Nodes (31): counter(), counterDelta(), CpuCounters, cpuUtilization(), DeviceByteCounters, DeviceCounters, deviceRates(), isWholeDisk() (+23 more)

### Community 56 - "VoiceAudioFrame"
Cohesion: 0.05
Nodes (20): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, QueuedAudio, capabilities, confirm(), control(), defaults (+12 more)

### Community 57 - "SchedulerStore"
Cohesion: 0.13
Nodes (7): fixture(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, ScheduleProposal, Schedule

### Community 58 - "ComposerActions.tsx"
Cohesion: 0.08
Nodes (20): families, modelFamily, repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions(), ContextRing() (+12 more)

### Community 59 - "oracle-voice-routes.test.ts"
Cohesion: 0.05
Nodes (17): exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), GatedVoiceEngineFactory, ObservedLocalVoiceBackend, openApps, openSockets (+9 more)

### Community 60 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (39): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, deferred() (+31 more)

### Community 61 - "oracle-voice.ts"
Cohesion: 0.09
Nodes (36): capabilities, closeServers, exactArrayBuffer(), sockets, startFields, VoiceNode, decodeVoiceAudioFrame(), encodeVoiceAudioFrame() (+28 more)

### Community 62 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (38): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), MarkdownImage() (+30 more)

### Community 63 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 64 - "PushNotificationService"
Cohesion: 0.10
Nodes (10): start(), NotificationRecorder, HubEventSource, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema (+2 more)

### Community 65 - "ui-scenes.ts"
Cohesion: 0.08
Nodes (27): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+19 more)

### Community 66 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 67 - "TerminalSessionController"
Cohesion: 0.08
Nodes (9): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), TerminalFormReplyError, TerminalSessionController, PendingUserInput, UserInputReplyInput (+1 more)

### Community 68 - "feature-flags.ts"
Cohesion: 0.11
Nodes (30): hub(), defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, hubFlagCatalogue, isPreviewAvailable(), parseFeatureFlag(), PreviewFeature (+22 more)

### Community 69 - "terminal-session.test.ts"
Cohesion: 0.07
Nodes (36): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+28 more)

### Community 70 - "processes.ts"
Cohesion: 0.09
Nodes (26): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+18 more)

### Community 71 - "setupWorkspaceFixture"
Cohesion: 0.06
Nodes (23): desktop, devices, long, open(), phone, veryLong, bounds(), closedEarlier (+15 more)

### Community 72 - "active-sessions.ts"
Cohesion: 0.10
Nodes (31): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+23 more)

### Community 73 - "oracle-voice-routes.ts"
Cohesion: 0.10
Nodes (34): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+26 more)

### Community 74 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (35): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), ActivityRow, applyEvent(), canTakeFocus(), ConfirmationCard (+27 more)

### Community 75 - "app.ts"
Cohesion: 0.07
Nodes (23): apps, directories, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe(), ServerRole, ClientPresence (+15 more)

### Community 76 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (38): assertExactKeys(), cloneState(), DISPOSITIONS, emptyState(), hasExactKeys(), isDisposition(), isEventKind(), isId() (+30 more)

### Community 77 - "ScheduleForm.tsx"
Cohesion: 0.10
Nodes (31): scheduleProposalSummary(), ScheduleRecurrence, ScheduleTarget, FeatureEvent, listeners, publishFeatureEvent(), subscribeFeatureEvents(), FolderPicker() (+23 more)

### Community 78 - "VoicePlayback"
Cohesion: 0.10
Nodes (11): pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio(), validateGeneration() (+3 more)

### Community 79 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 80 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 81 - "normalizeKnowledgeRelativePath"
Cohesion: 0.09
Nodes (30): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+22 more)

### Community 82 - "client.test.ts"
Cohesion: 0.07
Nodes (11): ORACLE_VOICE_PROTOCOL, OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 83 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 84 - "ChildVoiceEngine"
Cohesion: 0.13
Nodes (8): benchmarkGroup(), ChildVoiceEngine, errorMessage(), matchesCancelled(), matchesSynthesis(), matchesUtterance(), rememberCancellation(), VoiceChildProcess

### Community 85 - "SettingsProfileSnapshot"
Cohesion: 0.11
Nodes (18): profileStore(), SettingsProfileState, SettingsProfileStore, directories, store(), applySettingsChanges(), applySettingsImport(), isSettingsProfileKey() (+10 more)

### Community 86 - "schedule-recurrence.ts"
Cohesion: 0.11
Nodes (35): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+27 more)

### Community 87 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 88 - "session-latency-benchmark.ts"
Cohesion: 0.10
Nodes (25): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+17 more)

### Community 89 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (34): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+26 more)

### Community 90 - "ResidentVoiceWorker"
Cohesion: 0.14
Nodes (5): combinedTranscript(), matchesCancelled(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream

### Community 91 - "transcription-service.ts"
Cohesion: 0.09
Nodes (23): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+15 more)

### Community 92 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 93 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 94 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (14): createVoiceWorker(), PiperProcess, childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream (+6 more)

### Community 95 - "oracle-voice-child.ts"
Cohesion: 0.08
Nodes (28): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), float32ToPcm16() (+20 more)

### Community 96 - "schedule-proposals.ts"
Cohesion: 0.11
Nodes (30): action, create, existing, metadata, scheduleProposalInputSchema, ScheduleProposalsChanged, scheduleProposalSchema, update (+22 more)

### Community 97 - "remote-voice-client.ts"
Cohesion: 0.14
Nodes (15): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError() (+7 more)

### Community 98 - "startup-phases.test.ts"
Cohesion: 0.08
Nodes (18): phases, port, app(), directories, headers, launcher, createStartupPhases(), silentStartupPhases (+10 more)

### Community 99 - "manager-agent.test.ts"
Cohesion: 0.09
Nodes (16): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, Behavior, computers, fail(), FakeClient, FakeSdk (+8 more)

### Community 100 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (26): VoiceEndUtterance, VoiceGenerationIdentity, VoiceStartUtterance, VoiceSynthesisRequest, VoiceTtsEngine, BlockingEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity (+18 more)

### Community 101 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (31): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+23 more)

### Community 102 - "recovery-resend-durability.test.ts"
Cohesion: 0.09
Nodes (18): directories, disk, fixture(), gate(), gates, httpBoundary(), initialize(), PublicSessionValue (+10 more)

### Community 103 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (32): attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, booleanValue(), CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress (+24 more)

### Community 104 - ".sendInternal"
Cohesion: 0.16
Nodes (26): activeBottomFrame(), backgroundShellsAllow(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity() (+18 more)

### Community 105 - "reader.ts"
Cohesion: 0.12
Nodes (24): prefixes, session, trusted, untrusted, detectWsl(), parseDataMount(), createLinuxHostTelemetryReader(), errorCode() (+16 more)

### Community 106 - "session-patch-browser.ts"
Cohesion: 0.11
Nodes (28): pageFor(), advance(), Connection, connections, content(), FrameMeasurement, lastHeading(), message() (+20 more)

### Community 107 - "real-voice.ts"
Cohesion: 0.11
Nodes (13): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+5 more)

### Community 108 - "session-unread.pw.ts"
Cohesion: 0.08
Nodes (15): devices, bounds(), devices, edgeState(), open(), screenshot(), unreadState(), BACKGROUND_SESSION_ID (+7 more)

### Community 109 - "dreamer-planner.ts"
Cohesion: 0.13
Nodes (28): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+20 more)

### Community 110 - "host-telemetry.ts"
Cohesion: 0.09
Nodes (26): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, aggregate (+18 more)

### Community 111 - "ManagerProactiveInbox"
Cohesion: 0.15
Nodes (8): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxRecoveryError, nowIso(), openInbox()

### Community 112 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (18): FakeVoiceEngineCall, apps, config, configFixture(), connect(), Inbox, issueTicket(), localRuntime() (+10 more)

### Community 113 - "push-notification-service.ts"
Cohesion: 0.11
Nodes (20): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+12 more)

### Community 114 - "schedules.ts"
Cohesion: 0.10
Nodes (28): scheduleWorktreeInputSchema, CLAUDE_SCHEDULE_UNAVAILABLE_REASON, cronExpression, DEFAULT_SCHEDULE_TIMEZONE, identifier, SCHEDULE_MIN_SPACING_MINUTES, SCHEDULE_PROMPT_MAX_LENGTH, scheduleAbandonSchema (+20 more)

### Community 115 - "SessionOrderStore"
Cohesion: 0.16
Nodes (12): orderStore(), carried(), laneFrom(), retire(), sameLane(), sessionOrderKey(), SessionOrderState, SessionOrderStore (+4 more)

### Community 116 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (13): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+5 more)

### Community 117 - "service.ts"
Cohesion: 0.12
Nodes (12): HOST_ALERT_POLL_INTERVAL_MS, HostRequest, HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError(), HostTelemetryService, HostTelemetryTarget, HOST_TELEMETRY_INVALID_CODE (+4 more)

### Community 118 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 119 - "pwa.ts"
Cohesion: 0.13
Nodes (27): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), App(), applyPwaUpdate(), activatePwaUpdate(), activePushSubscription(), applicationServerKey() (+19 more)

### Community 120 - ".toolHost"
Cohesion: 0.11
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 121 - "ManagerProactiveCoordinator"
Cohesion: 0.17
Nodes (6): batchMessageId(), isTerminal(), lifecycles(), ManagerProactiveCoordinator, fixture(), managed()

### Community 122 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 123 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 124 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (22): NewSessionRuntime, sameSettingValue(), SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+14 more)

### Community 125 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 126 - "agent-service.test.ts"
Cohesion: 0.14
Nodes (16): terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+8 more)

### Community 127 - "dreamer-service.test.ts"
Cohesion: 0.08
Nodes (14): DreamerMemoryMetadataRecord, dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema (+6 more)

### Community 128 - "ManagerAssistant.test.tsx"
Cohesion: 0.09
Nodes (17): getManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator (+9 more)

### Community 129 - "VoiceCapture"
Cohesion: 0.21
Nodes (3): captureFailure(), harness(), VoiceCapture

### Community 130 - "session-directory.ts"
Cohesion: 0.17
Nodes (18): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+10 more)

### Community 131 - "scheduler-dispatcher.ts"
Cohesion: 0.12
Nodes (16): enableSchedulerTools(), NoopScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS, SchedulerDispatcherOptions, ScheduleStopAcknowledgement, ScheduleTargetUnavailableError (+8 more)

### Community 132 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 133 - "oracle-voice-config.ts"
Cohesion: 0.16
Nodes (20): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+12 more)

### Community 134 - "backgroundTasksFromEvents"
Cohesion: 0.18
Nodes (24): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventTask(), executionModeValue(), isOlderExecution(), isShellObserverTool() (+16 more)

### Community 135 - "closed-sessions.ts"
Cohesion: 0.12
Nodes (10): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS, closedSessionContext(), excerpt(), isClosedSessionContext() (+2 more)

### Community 136 - "dreamer-service.ts"
Cohesion: 0.13
Nodes (22): DREAMER_MAX_ITEMS, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), boundedText(), DreamerPlannerExecutionInput, DreamerServiceOptions, safeRunError() (+14 more)

### Community 137 - "oracle-voice-segments.ts"
Cohesion: 0.14
Nodes (22): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+14 more)

### Community 138 - "pipeline.ts"
Cohesion: 0.13
Nodes (21): holdingRenderer(), openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), render, scope, documentOpening() (+13 more)

### Community 139 - "use-markdown-document.ts"
Cohesion: 0.15
Nodes (18): build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing(), Level (+10 more)

### Community 140 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 141 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 142 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 143 - "session-response-order.ts"
Cohesion: 0.15
Nodes (20): applyComputerSnapshot(), checkComputerConnections(), computerAdded(), computerRemoved(), discardUnpairedComputers(), forgetComputerKnowledge(), liftUnpairedTombstones(), tombstoneUnpairedSession() (+12 more)

### Community 144 - "HostMonitorView.test.tsx"
Cohesion: 0.17
Nodes (18): HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics, snapshot, Socket, bytes() (+10 more)

### Community 145 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 146 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 147 - "transport.test.ts"
Cohesion: 0.14
Nodes (10): registerHostTelemetryRoutes(), HOST_TELEMETRY_MAX_QUEUE_BYTES, HOST_TELEMETRY_MAX_QUEUE_MESSAGES, HOST_TELEMETRY_SEND_TIMEOUT_MS, HostSocket, HostTelemetrySocket, empty, inventory (+2 more)

### Community 148 - "workspace-browser.ts"
Cohesion: 0.21
Nodes (17): validateKnowledgeRoot(), assertOpenedFilePath(), fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath() (+9 more)

### Community 149 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer, fallbackFormFixture() (+8 more)

### Community 150 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 151 - "renderer.ts"
Cohesion: 0.14
Nodes (10): DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), defaultDocumentRenderer(), DocumentRenderer, RendererWorker, synchronousRenderer, FakeWorker (+2 more)

### Community 152 - "capture.ts"
Cohesion: 0.13
Nodes (15): BufferedFrame, defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, validateIdentity(), VoiceCaptureError, VoiceCaptureErrorCode (+7 more)

### Community 153 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 154 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession() (+1 more)

### Community 155 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 156 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 157 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 158 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 159 - "oracle-status.test.ts"
Cohesion: 0.18
Nodes (15): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+7 more)

### Community 160 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 162 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 163 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 164 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (10): client(), delayQueueWrite(), disk, exec, gate(), holdQueueCommit(), NativeFixture, NativeRuntime (+2 more)

### Community 165 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 166 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 167 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 168 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 169 - ".observe"
Cohesion: 0.15
Nodes (10): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), publicEvent() (+2 more)

### Community 170 - "manager-runtime.ts"
Cohesion: 0.23
Nodes (12): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+4 more)

### Community 172 - "SkillSettingsService"
Cohesion: 0.23
Nodes (8): readBounded(), revision(), applications, directories, fixture(), settingsObject(), SkillSettingsError, SkillSettingsService

### Community 173 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 174 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 175 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot(), started() (+4 more)

### Community 176 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 177 - "shared/skill-settings.ts"
Cohesion: 0.23
Nodes (9): registerSkillSettingsRoutes(), SkillSettingsTarget, SKILL_SETTINGS_CAPABILITY, skillFrontmatterNameSchema, skillNameSchema, skillSettingsSchema, SkillSettingsSnapshot, SkillToggle (+1 more)

### Community 178 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 179 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 180 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 181 - "ShellNavigation.test.tsx"
Cohesion: 0.32
Nodes (6): ClientFeature, railEntries(), initials(), useDisplayName(), DisplayNameSetting(), ShellNavigation()

### Community 182 - "pipeline.test.tsx"
Cohesion: 0.20
Nodes (10): documentJsx(), documentUrlTransform(), components, drawn(), drawnPage(), fixtures, html(), today() (+2 more)

### Community 183 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 184 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 185 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 186 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 187 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 188 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 189 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 190 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 191 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 192 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 196 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 197 - "usePanelWidth"
Cohesion: 0.20
Nodes (7): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish(), FakeRecorder

### Community 198 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 199 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 200 - "file-upload-routes.ts"
Cohesion: 0.31
Nodes (7): FileUploadError, registerFileUploadRoutes(), SessionParams, extension(), MAX_SESSION_FILE_BYTES, supportedExtensions, supportsSessionFile()

### Community 201 - "server/skill-settings.ts"
Cohesion: 0.36
Nodes (8): isWithin(), builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), scalar(), skillFrontmatter(), SkillRoot

### Community 202 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 203 - "use-markdown-document.test.tsx"
Cohesion: 0.27
Nodes (5): renderDocumentTree(), components, eventsFor(), Reader(), useMarkdownDocument()

### Community 205 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 206 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 207 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 208 - "tmux-errors.test.ts"
Cohesion: 0.25
Nodes (6): directories, { execute }, files, links, listener(), server()

### Community 209 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 210 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 211 - "capture.test.ts"
Cohesion: 0.22
Nodes (3): CaptureControl, VoiceCaptureDependencies, VoiceVad

### Community 213 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 214 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 216 - "skill-settings-jsonc.ts"
Cohesion: 0.48
Nodes (5): instrument(), document(), parseSkillSettings(), replaceDisabledSkills(), Token

### Community 217 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 219 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 220 - "background-task-adapter.test.ts"
Cohesion: 0.40
Nodes (5): MAX_BACKGROUND_TASKS, MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH, lifecycleEvent(), subagentShell()

### Community 221 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 224 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1427 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1422 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2387 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `SessionDetail`, `SessionStore`, `scheduler-dispatcher.ts`, `ClaudeAgentService`, `oracle-voice-config.ts`, `manager-structured-memory.ts`, `computer-manager.ts`, `ManagerStore`, `refusal-metrics.ts`, `ManagedSession`, `transport.test.ts`, `KnowledgeStore`, `notification-center-service.ts`, `hub-routes.ts`, `oracle-voice-integration.test.ts`, `ManagerAgent`, `oracle-task-store.ts`, `schedule-launcher.ts`, `SubmissionError`, `schedule-launcher.test.ts`, `SessionService`, `ProviderSessionService`, `session-knowledge-store.ts`, `manager-runtime.ts`, `NotificationCenterService`, `SkillSettingsService`, `manager-routes.ts`, `DreamerService`, `shared/skill-settings.ts`, `sampler.ts`, `SchedulerStore`, `PushNotificationService`, `ScheduleNotificationService`, `TerminalSessionController`, `feature-flags.ts`, `file-upload-routes.ts`, `ChildVoiceEngine`, `SettingsProfileSnapshot`, `transcription-service.ts`, `HostAlertMonitor`, `manager-agent.test.ts`, `ManagerProactiveInbox`, `SessionOrderStore`, `delegated-transcription-service.ts`, `service.ts`, `ManagerProactiveCoordinator`, `cli-canary.ts`, `dreamer-service.test.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `AgentService` connect `SessionDetail` to `SubmissionError`, `session-directory.ts`, `TerminalSessionController`, `queued-dispatch.test.ts`, `storedProvider`, `recovery-resend-durability.test.ts`, `SessionStore`, `agent-service.ts`, `claude-agent-service.ts`, `multi-node.test.ts`, `.sendAdmittedWithBackend`, `agent-service.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `registerHubRoutes()` connect `ManagedSession` to `oracle-voice-routes.ts`, `claude-agent-service.ts`, `app.ts`, `NotificationCenterService`, `computer-manager.ts`, `refusal-metrics.ts`, `contracts.ts`, `multi-node.test.ts`, `normalizeKnowledgeRelativePath`, `SessionOrderStore`, `KnowledgeStore`, `shared/settings-profile.ts`, `hub-routes.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1427 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.038645564961354434 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.024142808369506902 - nodes in this community are weakly interconnected._
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
