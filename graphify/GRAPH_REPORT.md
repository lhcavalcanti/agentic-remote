# Agentic Remote - Graphify code map

Snapshot: `dc929933c095e0e5b27feee36cf38363a2a278c5601ead3f5925fe47db835e90`

Source checkout: `4441d9cdd6df3a0cbeee94d5d2e222562a447d85`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 640 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 640 files · ~1,143,955 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 8986 nodes · 25938 edges · 258 communities (215 shown, 25 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1321 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionStore
- agent-service.ts
- AppWorkspace
- SessionDetail
- oracle-voice-child.ts
- oracle-voice.ts
- App.tsx
- OracleVoiceCoordinator
- workspace-fixtures.ts
- manager-tools.ts
- session-presentation.ts
- App.test.tsx
- contracts.ts
- claude-agent-service.ts
- terminal-session.ts
- ManagerStore
- ManagedSession
- VoiceCapture
- agentic-remote-promotion-monitor
- ManagerAgent
- session-store-providers.test.ts
- oracle-voice-soak.ts
- oracle-voice-integration.test.ts
- ScheduleRun
- shared/settings-profile.ts
- remote-node-client.ts
- PushNotificationService
- AppSettingsDialog.tsx
- CopilotClientLike
- session-knowledge-store.ts
- manager-agent.ts
- notification-classifier.ts
- tmux-test-helpers.ts
- api.ts
- hub-routes.ts
- oracle-voice-worker.ts
- oracle-task-store.ts
- send-matrix.integration.test.ts
- RemoteNodeClient
- fake-voice.ts
- oracle-voice-routes.test.ts
- active-sessions.ts
- dreamer-service.ts
- request
- oracle-voice-benchmark.ts
- session-reply-durability.test.ts
- node-routes.ts
- manager-structured-memory-validation.ts
- src/settings-profile.ts
- KnowledgeStore
- ProviderSessionService
- DreamerService
- sampler.ts
- TmuxTerminalSessionController
- ui-scenes.ts
- SchedulerStore
- OracleDreamer.tsx
- agentic-remote
- server/skill-settings.ts
- session-directory.ts
- dreamer-progress.ts
- feature-flags.ts
- SessionService
- schedules.ts
- ManagerAssistant.tsx
- agentic-remote-gate
- bundle
- NodeIdentityStore
- processes.ts
- OracleVoiceClient
- background-task-adapter.ts
- VoicePlayback
- manager-routes.ts
- FakeSessionService
- .sendInternal
- pwa.ts
- shell.ts
- lib.rs
- recovery-resend-durability.test.ts
- DreamerStore
- schedule-recurrence.ts
- pipeline.ts
- dependencies
- oracle-voice-config.ts
- manager-proactive-coordinator.ts
- agentic-remote-promotion-setup
- dreamer-planner.ts
- SessionOrderStore
- devDependencies
- config.rs
- terminal-session.test.ts
- knowledge-tree.ts
- manager-proactive-inbox.ts
- manager-structured-memory.ts
- oracle-voice-security.test.ts
- sections.tsx
- pipeline.test.tsx
- NotificationCenterService
- manager-context.ts
- client.test.ts
- EngineVoiceBackendSession
- markdown-navigation.ts
- FakeVoiceEngine
- ComposerActions.tsx
- buildApp
- registerSessionKnowledgeRoutes
- ManagerClientDefaults
- agent-service.test.ts
- startup-phases.test.ts
- app.ts
- dreamer-service.test.ts
- capture-workspace.ts
- real-voice.ts
- cli-canary.ts
- service.ts
- scripts
- session-patch-browser.ts
- manager-structured-memory-search.ts
- HostMonitorView.test.tsx
- ComputerSummary
- RemoteVoiceClient
- session-provenance.test.ts
- compilerOptions
- oracle-voice-segments.ts
- transcription-service.ts
- ScheduleProposalCards.tsx
- ManagerAssistant.test.tsx
- HubEvent
- remote.ts
- PromptCards.tsx
- use-oracle-attachments.ts
- oracle-voice-tickets.ts
- refusal-metrics.ts
- host-telemetry.ts
- react
- compilerOptions
- full-gate.test.ts
- ManagerStructuredMemoryStore
- client.ts
- session-patches.test.ts
- compilerOptions
- delegated-transcription-service.ts
- ManagerProactiveInbox
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- server/side-question.ts
- ManagerMemory
- use-oracle-settings.ts
- DialogFrame.tsx
- oracle-status.test.ts
- ManagerAttachment
- promotion-monitor.test.ts
- BoundedQueue
- ReaderWorkspace
- scripts
- session-latency-benchmark.ts
- transport.test.ts
- dreamer-schedule.ts
- .persist
- BackgroundTask
- closed-session-sweeper.ts
- manager-runtime.ts
- HostTelemetrySampler
- package.json
- terminal-form-deadline.test.ts
- projection-test-helpers.ts
- oracle-voice-assets.test.ts
- SessionAdmissions
- session-resource-routes.test.ts
- RuntimeStatus.tsx
- fake-vad.ts
- desktop.json
- background-task-stop.test.ts
- session-resource-clear.test.ts
- theme-contrast.test.ts
- pending-echo.ts
- settings-local.json
- ChatMessage
- session-scope.ts
- TranscriptionError
- session-response-order.ts
- use-markdown-document.test.tsx
- recently-closed.pw.ts
- manager-proactive-inbox.test.ts
- .initialize
- session-retention.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- manager-automatic.ts
- sign-in-expired.pw.ts
- DeferredSession
- recordValue
- dataset
- .oxlintrc.json
- generate-pwa-icons.ts
- ManagerStructuredMemoryRuntime
- manager-structured-memory-performance.test.ts
- session-unread-tracker.ts
- bridge.rs
- transcribeAudio
- vite.config.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- sent-message.ts
- doctor-cli.test.ts
- ManagerProactiveInboxError
- release-publication.test.ts
- closed-sessions.ts
- UserInputFieldControl
- HostTelemetryClock
- settings.ts
- OracleVoiceClientDependencies
- OracleVoicePlayback
- composer-layout.test.ts
- HostAlertMonitor
- ManagerProactiveInboxValidationError
- usePanelWidth
- promotion-setup.test.ts
- listWorkspace
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
1. `AppWorkspace()` - 350 edges
2. `SessionDetail` - 337 edges
3. `AgentService` - 310 edges
4. `SessionStore` - 212 edges
5. `ManagedSession` - 184 edges
6. `buildApp()` - 138 edges
7. `ClaudeAgentService` - 136 edges
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
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (258 total, 25 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (17): agentMode(), AgentService, commandShortcut(), isTerminalNotReadyRefusal(), lifecycleRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, sessionInUseConflictMessage() (+9 more)

### Community 1 - "SessionStore"
Cohesion: 0.03
Nodes (96): storage(), fixture(), restart(), fixture(), connect(), createStore(), deferred(), disk (+88 more)

### Community 2 - "agent-service.ts"
Cohesion: 0.03
Nodes (125): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+117 more)

### Community 3 - "AppWorkspace"
Cohesion: 0.03
Nodes (159): message(), sendLikeTheApp(), terminalSendOptions(), closeSession(), deleteSession(), executeCommand(), saveSessionHidden(), saveSessionUnread() (+151 more)

### Community 4 - "SessionDetail"
Cohesion: 0.03
Nodes (26): ClaudeAgentService, isMissingClaudeSessionError(), ownsDispatchRecovery(), QueuedDispatches, unknownClaim(), observe(), claudeFixture(), ClaudeMcpRead (+18 more)

### Community 5 - "oracle-voice-child.ts"
Cohesion: 0.03
Nodes (65): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+57 more)

### Community 6 - "oracle-voice.ts"
Cohesion: 0.04
Nodes (99): ActiveBackendSession, apps, directories, sendNodeVoiceOutput(), config, limits(), outputBytes(), playbackSequence() (+91 more)

### Community 7 - "App.tsx"
Cohesion: 0.03
Nodes (105): ActivityStatus, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), composerChanged() (+97 more)

### Community 8 - "OracleVoiceCoordinator"
Cohesion: 0.04
Nodes (41): ManagerEventSource, ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect() (+33 more)

### Community 9 - "workspace-fixtures.ts"
Cohesion: 0.03
Nodes (72): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+64 more)

### Community 10 - "manager-tools.ts"
Cohesion: 0.04
Nodes (52): DreamerMemoryMetadataRecord, APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools() (+44 more)

### Community 11 - "session-presentation.ts"
Cohesion: 0.04
Nodes (84): CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), BackgroundTaskSnapshot, SessionProvenance, listClosedSessions(), saveSessionOrderLane(), handleDragEnd(), stepSession() (+76 more)

### Community 12 - "App.test.tsx"
Cohesion: 0.03
Nodes (88): addKnowledgeRoot(), askSession(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRetention(), createOracleVoiceTicket() (+80 more)

### Community 13 - "contracts.ts"
Cohesion: 0.04
Nodes (57): AgentServiceEvents, CreationRuntime, ClaudeAgentServiceEvents, RemoteResync, RemoteSessionRead, DirectoryScope, directories, voiceControlQueues (+49 more)

### Community 14 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (69): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+61 more)

### Community 15 - "terminal-session.ts"
Cohesion: 0.04
Nodes (82): boxedComposerFrame(), busyRowStatus(), captureBeforeDeadline(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus() (+74 more)

### Community 16 - "ManagerStore"
Cohesion: 0.05
Nodes (36): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+28 more)

### Community 17 - "ManagedSession"
Cohesion: 0.08
Nodes (15): ComputerManager, managedSession(), mapWithConcurrency(), fixture(), session(), RemoteSessionListing, sessionAtLeastAsNew(), registerHubRoutes() (+7 more)

### Community 18 - "VoiceCapture"
Cohesion: 0.05
Nodes (29): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, harness() (+21 more)

### Community 19 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 20 - "ManagerAgent"
Cohesion: 0.08
Nodes (15): DreamerProgressView, checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime() (+7 more)

### Community 21 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (42): CopilotSessionLike, CopilotTasksApi, nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused() (+34 more)

### Community 22 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 23 - "oracle-voice-integration.test.ts"
Cohesion: 0.03
Nodes (35): apps, BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+27 more)

### Community 24 - "ScheduleRun"
Cohesion: 0.07
Nodes (27): provenance(), SessionScheduleLauncher, session(), NoopScheduleLauncher, ScheduleLauncher, ScheduleLaunchRefusedError, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS (+19 more)

### Community 25 - "shared/settings-profile.ts"
Cohesion: 0.05
Nodes (53): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), profileStore(), updateSchema (+45 more)

### Community 26 - "remote-node-client.ts"
Cohesion: 0.05
Nodes (55): ClaudeSdk, awaitTermination(), LaunchCreations, apps, directories, directory(), runtime(), services (+47 more)

### Community 27 - "PushNotificationService"
Cohesion: 0.06
Nodes (30): start(), NotificationRecorder, brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender (+22 more)

### Community 28 - "AppSettingsDialog.tsx"
Cohesion: 0.05
Nodes (69): DEFAULT_SESSION_PROVIDER, activateSession(), createSession(), getProviderRuntimeOptions(), listDirectories(), listHistory(), sendTestPushNotification(), validateSessionDirectory() (+61 more)

### Community 29 - "CopilotClientLike"
Cohesion: 0.03
Nodes (49): CopilotClientLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), directories (+41 more)

### Community 30 - "session-knowledge-store.ts"
Cohesion: 0.05
Nodes (41): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema (+33 more)

### Community 31 - "manager-agent.ts"
Cohesion: 0.04
Nodes (44): automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig (+36 more)

### Community 32 - "notification-classifier.ts"
Cohesion: 0.05
Nodes (57): HOST_ALERT_POLL_INTERVAL_MS, computer, observe(), snapshot(), start, sustained(), center(), directories (+49 more)

### Community 33 - "tmux-test-helpers.ts"
Cohesion: 0.06
Nodes (55): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+47 more)

### Community 34 - "api.ts"
Cohesion: 0.05
Nodes (58): AddKnowledgeRootInput, ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, PushSettings, SessionKnowledgeRootMutationInput, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary (+50 more)

### Community 35 - "hub-routes.ts"
Cohesion: 0.04
Nodes (59): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+51 more)

### Community 36 - "oracle-voice-worker.ts"
Cohesion: 0.06
Nodes (25): benchmarkGroup(), VoiceEngineSession, VoiceSttEngine, VoiceTtsEngine, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys() (+17 more)

### Community 37 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (45): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+37 more)

### Community 38 - "send-matrix.integration.test.ts"
Cohesion: 0.04
Nodes (53): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+45 more)

### Community 39 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (14): headerSafe(), RemoteNodeClient, requestBytes(), client(), servers, session, RemoteNodeCapabilityError, AudioTranscription (+6 more)

### Community 40 - "fake-voice.ts"
Cohesion: 0.05
Nodes (11): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice() (+3 more)

### Community 41 - "oracle-voice-routes.test.ts"
Cohesion: 0.04
Nodes (25): voiceBackend(), exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), OracleVoiceManager, FakeVoiceEngineFactory, availableBackend() (+17 more)

### Community 42 - "active-sessions.ts"
Cohesion: 0.06
Nodes (51): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+43 more)

### Community 43 - "dreamer-service.ts"
Cohesion: 0.06
Nodes (53): DreamerHistoryEntry, validateDreamerTimeZone(), boundedText(), safeRunError(), unavailableSnapshot(), assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY (+45 more)

### Community 44 - "request"
Cohesion: 0.08
Nodes (45): NotificationRecord, scheduleProposalSummary(), CLAUDE_SCHEDULE_UNAVAILABLE_REASON, scheduleProviderUnavailableReason(), ScheduleTarget, getPushSettings(), request(), FeatureEvent (+37 more)

### Community 45 - "oracle-voice-benchmark.ts"
Cohesion: 0.06
Nodes (42): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+34 more)

### Community 46 - "session-reply-durability.test.ts"
Cohesion: 0.07
Nodes (26): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest() (+18 more)

### Community 47 - "node-routes.ts"
Cohesion: 0.06
Nodes (39): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+31 more)

### Community 48 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 49 - "src/settings-profile.ts"
Cohesion: 0.07
Nodes (29): NewSessionRuntime, sameSettingValue(), SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, SettingsUpdateResult (+21 more)

### Community 50 - "KnowledgeStore"
Cohesion: 0.07
Nodes (28): ServerRole, SessionMetadataLookup, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions (+20 more)

### Community 52 - "DreamerService"
Cohesion: 0.12
Nodes (10): activeDreamerMemoryIds(), DreamerMemoryMetadata, digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs() (+2 more)

### Community 53 - "sampler.ts"
Cohesion: 0.08
Nodes (45): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+37 more)

### Community 54 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (18): startAgentAfterClear(), composer(), processAdapter, afterExit(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync (+10 more)

### Community 55 - "ui-scenes.ts"
Cohesion: 0.07
Nodes (29): root, script, { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications (+21 more)

### Community 56 - "SchedulerStore"
Cohesion: 0.12
Nodes (10): enableSchedulerTools(), fixture(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, retainedHistory(), ScheduleProposal (+2 more)

### Community 57 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (40): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition, getDreamer() (+32 more)

### Community 58 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 59 - "server/skill-settings.ts"
Cohesion: 0.09
Nodes (29): instrument(), builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills() (+21 more)

### Community 60 - "session-directory.ts"
Cohesion: 0.11
Nodes (36): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+28 more)

### Community 61 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 62 - "feature-flags.ts"
Cohesion: 0.11
Nodes (30): defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable(), parseFeatureFlag(), PreviewFeature (+22 more)

### Community 63 - "SessionService"
Cohesion: 0.08
Nodes (6): closeReason(), closeVoiceSocket(), nodeVoiceCapabilities(), registerNodeRoutes(), obstructUploads(), SessionService

### Community 64 - "schedules.ts"
Cohesion: 0.07
Nodes (40): State, stateSchema, timestamp, action, create, existing, metadata, ScheduleProposalInput (+32 more)

### Community 65 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (39): proactivePromptEvents(), cancelManager(), editQueuedManagerMessage(), resetManager(), sendManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent() (+31 more)

### Community 66 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 67 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 68 - "NodeIdentityStore"
Cohesion: 0.07
Nodes (21): connections, managers, releases, remote, ComputerRegistry, DurableRegisteredComputer, LegacyRegisteredComputer, LegacyRegistryState (+13 more)

### Community 69 - "processes.ts"
Cohesion: 0.09
Nodes (26): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+18 more)

### Community 70 - "OracleVoiceClient"
Cohesion: 0.15
Nodes (6): clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, playbackClientError(), terminalCloseCode()

### Community 71 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (42): addActivity(), attachmentModeValue(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, copyTask(), createBackgroundTaskProjector() (+34 more)

### Community 72 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 73 - "manager-routes.ts"
Cohesion: 0.07
Nodes (18): ProactiveManager, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams (+10 more)

### Community 74 - "FakeSessionService"
Cohesion: 0.07
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 75 - ".sendInternal"
Cohesion: 0.14
Nodes (31): activeBottomFrame(), backgroundShellsAllow(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), composerHoldsText(), composerText() (+23 more)

### Community 76 - "pwa.ts"
Cohesion: 0.10
Nodes (35): checkHubSignIn(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), App(), applyPwaUpdate(), gatewayRefused(), hubFetch() (+27 more)

### Community 77 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 78 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 79 - "recovery-resend-durability.test.ts"
Cohesion: 0.07
Nodes (21): cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), directories, disk (+13 more)

### Community 80 - "DreamerStore"
Cohesion: 0.14
Nodes (10): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, isMissing(), publicPlan() (+2 more)

### Community 81 - "schedule-recurrence.ts"
Cohesion: 0.11
Nodes (36): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+28 more)

### Community 82 - "pipeline.ts"
Cohesion: 0.09
Nodes (27): partlyHeldRenderer(), render, scope, documentParts(), DocumentRenderEvent, documentRenderEvents(), documentUrlTransform(), drawSteps() (+19 more)

### Community 83 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 84 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (28): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+20 more)

### Community 85 - "manager-proactive-coordinator.ts"
Cohesion: 0.12
Nodes (13): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, SessionLifecycle, directories (+5 more)

### Community 86 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 87 - "dreamer-planner.ts"
Cohesion: 0.10
Nodes (34): activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem(), digest() (+26 more)

### Community 88 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 89 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 90 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 91 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (31): composerHoldsOtherText(), composerTookPaste(), isTerminalSessionInUsePrompt(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse(), pastedPlaceholderCount() (+23 more)

### Community 92 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+26 more)

### Community 93 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (35): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, eventId(), hasExactKeys(), isDisposition(), isEventKind() (+27 more)

### Community 94 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (30): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+22 more)

### Community 95 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (20): SocketMessage, apps, config, configFixture(), connect(), createManager(), Inbox, issueTicket() (+12 more)

### Community 96 - "sections.tsx"
Cohesion: 0.11
Nodes (22): AppVersion, parseAppVersion(), HubHealth, AppearanceSetting, NewSessionBackendSetting, OracleResponseStyle, getHubHealth(), HealthCard() (+14 more)

### Community 97 - "pipeline.test.tsx"
Cohesion: 0.11
Nodes (27): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+19 more)

### Community 98 - "NotificationCenterService"
Cohesion: 0.13
Nodes (7): NotificationCenterService, durableState(), emptyState(), matchesNotification(), NotificationStore, setup(), NotificationFilter

### Community 99 - "manager-context.ts"
Cohesion: 0.13
Nodes (27): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+19 more)

### Community 100 - "client.test.ts"
Cohesion: 0.08
Nodes (10): HUB_SIGN_IN_EXPIRED_MESSAGE, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 101 - "EngineVoiceBackendSession"
Cohesion: 0.20
Nodes (3): asSessionError(), EngineVoiceBackendSession, VoiceSessionError

### Community 102 - "markdown-navigation.ts"
Cohesion: 0.12
Nodes (29): followMarkdownLink(), KnowledgeReader(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), navigateDocument(), BreadcrumbSegment, breadcrumbSegments() (+21 more)

### Community 103 - "FakeVoiceEngine"
Cohesion: 0.10
Nodes (11): FakeVoiceEngine, sameGeneration(), BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine, BlockingStartEngine, BlockingSynthesisEngine, FinalizingEngine (+3 more)

### Community 104 - "ComposerActions.tsx"
Cohesion: 0.11
Nodes (12): AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions(), ContextRing(), QueuedPromptList(), SendControl(), TriggerProps (+4 more)

### Community 105 - "buildApp"
Cohesion: 0.07
Nodes (18): buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence, PRESENCE_TTL_MS, directories, runtimes, trusted (+10 more)

### Community 106 - "registerSessionKnowledgeRoutes"
Cohesion: 0.11
Nodes (22): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+14 more)

### Community 107 - "ManagerClientDefaults"
Cohesion: 0.11
Nodes (15): ManagerState, ManagerClientDefaults, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState (+7 more)

### Community 108 - "agent-service.test.ts"
Cohesion: 0.11
Nodes (18): terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+10 more)

### Community 109 - "startup-phases.test.ts"
Cohesion: 0.09
Nodes (17): phases, port, app(), directories, headers, launcher, createStartupPhases(), silentStartupPhases (+9 more)

### Community 110 - "app.ts"
Cohesion: 0.13
Nodes (15): BuildAppOptions, FileUploadError, registerFileUploadRoutes(), SessionParams, ProcessScanContext, VoiceEngineFactory, resolveDataDirectory(), registerTranscriptionRoutes() (+7 more)

### Community 111 - "dreamer-service.test.ts"
Cohesion: 0.08
Nodes (15): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+7 more)

### Community 112 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 113 - "real-voice.ts"
Cohesion: 0.13
Nodes (11): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+3 more)

### Community 114 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 115 - "service.ts"
Cohesion: 0.13
Nodes (11): HostRequest, HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError(), HostTelemetryService, HostTelemetryTarget, HOST_TELEMETRY_INVALID_CODE, HostMinuteAggregate (+3 more)

### Community 116 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 117 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (24): advance(), connections, content(), FrameMeasurement, lastHeading(), message(), open(), percentile() (+16 more)

### Community 118 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 119 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 120 - "ComputerSummary"
Cohesion: 0.13
Nodes (3): ManagerHub, TurnContextInput, ComputerSummary

### Community 121 - "RemoteVoiceClient"
Cohesion: 0.21
Nodes (9): closeReason(), exactArrayBuffer(), rawDataBuffer(), remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient, RemoteVoiceClientOptions, RemoteVoiceDisconnectError (+1 more)

### Community 122 - "session-provenance.test.ts"
Cohesion: 0.13
Nodes (14): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, isSession(), SessionIdentity (+6 more)

### Community 123 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 124 - "oracle-voice-segments.ts"
Cohesion: 0.14
Nodes (22): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+14 more)

### Community 125 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 126 - "ScheduleProposalCards.tsx"
Cohesion: 0.17
Nodes (20): getSchedule(), listScheduleProposals(), resolveScheduleProposal(), days, labels, proposalChanges(), proposalConsequence(), proposalSchedule (+12 more)

### Community 127 - "ManagerAssistant.test.tsx"
Cohesion: 0.09
Nodes (15): removeQueuedManagerMessage(), resolveManagerConfirmation(), retryManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, conversationCapability, empty (+7 more)

### Community 128 - "HubEvent"
Cohesion: 0.16
Nodes (8): ComputerManagerEvents, ScheduleNotificationService, input(), now, run(), HubEvent, ScheduleRunNotification, SchedulerChanged

### Community 129 - "remote.ts"
Cohesion: 0.13
Nodes (14): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, registerHostTelemetryRoutes() (+6 more)

### Community 130 - "PromptCards.tsx"
Cohesion: 0.13
Nodes (16): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+8 more)

### Community 131 - "use-oracle-attachments.ts"
Cohesion: 0.17
Nodes (20): codeExtensions, fileTypes, managerFileValidationError(), MAX_MANAGER_FILE_BYTES, MAX_MANAGER_TEXT_BYTES, textTypes, removeManagerFile(), uploadManagerFile() (+12 more)

### Community 132 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 133 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 134 - "host-telemetry.ts"
Cohesion: 0.13
Nodes (19): aggregate, DiskSpaceSchema, HOST_TELEMETRY_CAPABILITY_VERSION, HostHistorySchema, HostInfoSchema, HostMetricAggregate, HostMetricAggregateSchema, HostMetrics (+11 more)

### Community 135 - "react"
Cohesion: 0.11
Nodes (13): plugins, oxc, react, typescript, DocumentViewControls(), actions, outline, MarkdownCodeBlock() (+5 more)

### Community 136 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 137 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 138 - "ManagerStructuredMemoryStore"
Cohesion: 0.28
Nodes (5): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState

### Community 139 - "client.ts"
Cohesion: 0.12
Nodes (15): ORACLE_VOICE_CONNECTION_TIMEOUT_MS, captureClientError(), closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode (+7 more)

### Community 140 - "session-patches.test.ts"
Cohesion: 0.18
Nodes (8): Connection, Client, PatchSocket, Browser, seedOffset, HubResyncRequest, HubWireEvent, SessionPatchReceiver

### Community 141 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 142 - "delegated-transcription-service.ts"
Cohesion: 0.14
Nodes (11): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+3 more)

### Community 143 - "ManagerProactiveInbox"
Cohesion: 0.22
Nodes (7): ManagerProactiveInbox, ManagerProactiveInboxCapacityError, namespaceId(), nowIso(), publicEvent(), openInbox(), validateLimit()

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

### Community 148 - "server/side-question.ts"
Cohesion: 0.19
Nodes (7): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout()

### Community 149 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 150 - "use-oracle-settings.ts"
Cohesion: 0.18
Nodes (13): getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+5 more)

### Community 151 - "DialogFrame.tsx"
Cohesion: 0.18
Nodes (14): changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame(), filterSentMessages() (+6 more)

### Community 152 - "oracle-status.test.ts"
Cohesion: 0.19
Nodes (14): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+6 more)

### Community 153 - "ManagerAttachment"
Cohesion: 0.25
Nodes (8): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), managerFileType(), ManagerAttachment

### Community 154 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 155 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 156 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 157 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 158 - "session-latency-benchmark.ts"
Cohesion: 0.21
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 159 - "transport.test.ts"
Cohesion: 0.13
Nodes (11): prefixes, session, trusted, untrusted, readingFixture(), empty, inventory, listen() (+3 more)

### Community 160 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (15): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+7 more)

### Community 161 - ".persist"
Cohesion: 0.21
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 162 - "BackgroundTask"
Cohesion: 0.20
Nodes (8): BackgroundTaskProjector, snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 163 - "closed-session-sweeper.ts"
Cohesion: 0.17
Nodes (5): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS

### Community 164 - "manager-runtime.ts"
Cohesion: 0.23
Nodes (12): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+4 more)

### Community 166 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 167 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 168 - "projection-test-helpers.ts"
Cohesion: 0.23
Nodes (11): BackgroundTaskEventOptions, MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH, lifecycleEvent(), subagentShell(), syntheticLog(), checkedBackgroundTasks(), chunkings() (+3 more)

### Community 169 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 170 - "SessionAdmissions"
Cohesion: 0.18
Nodes (3): Admission, ExclusiveAdmission, SessionAdmissions

### Community 171 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 172 - "RuntimeStatus.tsx"
Cohesion: 0.27
Nodes (8): families, modelFamily, repositoryModels, RuntimeStatus(), session, glyphs, ModelFamilyIcon(), RuntimeModelName()

### Community 173 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 174 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 175 - "background-task-stop.test.ts"
Cohesion: 0.25
Nodes (11): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started(), stopAcknowledgement() (+3 more)

### Community 176 - "session-resource-clear.test.ts"
Cohesion: 0.19
Nodes (11): apps, directories, directory(), pairedFixture(), providerFixture(), providers, seed(), sockets (+3 more)

### Community 177 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 178 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 179 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 180 - "ChatMessage"
Cohesion: 0.19
Nodes (9): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, ChatMessage, PendingEchoOwner (+1 more)

### Community 181 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 182 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 183 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 184 - "use-markdown-document.test.tsx"
Cohesion: 0.18
Nodes (6): drawnInParts(), DocumentRenderer, DocumentRendererContext, components, Reader(), show()

### Community 185 - "recently-closed.pw.ts"
Cohesion: 0.23
Nodes (9): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), open(), row() (+1 more)

### Community 186 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxObservation, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 187 - ".initialize"
Cohesion: 0.24
Nodes (4): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, open()

### Community 188 - "session-retention.ts"
Cohesion: 0.23
Nodes (7): idleDaysSchema, mergeSessionRetention(), sessionRetentionPatchSchema, sessionRetentionSchema, SessionRetention, SessionRetentionPatch, SessionRetentionSettings()

### Community 189 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 190 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 191 - "manager-automatic.ts"
Cohesion: 0.25
Nodes (8): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, failed, finished

### Community 192 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 194 - "recordValue"
Cohesion: 0.29
Nodes (11): backgroundHandoff(), notificationKind(), parsedValue(), rawTailText(), recordValue(), shellIdFromFooter(), shellIdFromValue(), shellStopAcknowledged() (+3 more)

### Community 195 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 196 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 197 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 198 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.24
Nodes (3): initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, ManagerStructuredMemoryStatus

### Community 199 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.27
Nodes (7): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemorySearchResult, searchWorkspace(), submitSearch()

### Community 200 - "session-unread-tracker.ts"
Cohesion: 0.29
Nodes (5): FinishedSession, SessionUnreadTracker, finished(), SessionTurnState, turnEnded()

### Community 201 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 202 - "transcribeAudio"
Cohesion: 0.29
Nodes (4): transcribeAudio(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 203 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 204 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 205 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 206 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 207 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 208 - "ManagerProactiveInboxError"
Cohesion: 0.25
Nodes (4): ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError

### Community 209 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 210 - "closed-sessions.ts"
Cohesion: 0.39
Nodes (5): closedSessionContext(), excerpt(), isClosedSessionContext(), said(), ClosedSessionContext

### Community 211 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 213 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 216 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 218 - "ManagerProactiveInboxValidationError"
Cohesion: 0.47
Nodes (4): emptyState(), ManagerProactiveInboxValidationError, requireId(), validateOptions()

### Community 219 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 220 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 221 - "listWorkspace"
Cohesion: 0.60
Nodes (5): listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), workspaceAbsolutePath()

## Knowledge Gaps
- **1430 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1425 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2395 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `buildApp` to `AgentService`, `remote.ts`, `HubEvent`, `SessionStore`, `SessionDetail`, `refusal-metrics.ts`, `agent-service.ts`, `delegated-transcription-service.ts`, `ManagerProactiveInbox`, `ManagerStore`, `ManagedSession`, `ManagerAgent`, `ScheduleRun`, `shared/settings-profile.ts`, `PushNotificationService`, `session-knowledge-store.ts`, `manager-agent.ts`, `notification-classifier.ts`, `manager-runtime.ts`, `HostTelemetrySampler`, `oracle-task-store.ts`, `oracle-voice-worker.ts`, `oracle-voice-routes.test.ts`, `session-reply-durability.test.ts`, `node-routes.ts`, `KnowledgeStore`, `ProviderSessionService`, `DreamerService`, `TranscriptionError`, `SchedulerStore`, `server/skill-settings.ts`, `feature-flags.ts`, `SessionService`, `NodeIdentityStore`, `ManagerStructuredMemoryRuntime`, `manager-routes.ts`, `oracle-voice-config.ts`, `manager-proactive-coordinator.ts`, `SessionOrderStore`, `HostAlertMonitor`, `sections.tsx`, `NotificationCenterService`, `app.ts`, `dreamer-service.test.ts`, `cli-canary.ts`, `service.ts`, `session-provenance.test.ts`, `transcription-service.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `agent-service.ts`, `SessionDetail`, `contracts.ts`, `session-reply-durability.test.ts`, `recovery-resend-durability.test.ts`, `claude-agent-service.ts`, `server/side-question.ts`, `session-store-providers.test.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `ManagerStore` connect `ManagerStore` to `manager-routes.ts`, `ManagerAttachment`, `ManagerMemory`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1430 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03188105117565698 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.02532891329120481 - nodes in this community are weakly interconnected._
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
