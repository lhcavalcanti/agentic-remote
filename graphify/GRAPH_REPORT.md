# Agentic Remote - Graphify code map

Snapshot: `e859e0fc80ab1d85eae8e7544dfccbf95356189683ad986401c90986807cfd3a`

Source checkout: `2302d04674ff7b1466418f2ba4c8de52555b454e`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 628 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 628 files · ~1,107,583 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 8803 nodes · 25412 edges · 251 communities (209 shown, 24 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1277 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionDetail
- AppWorkspace
- AgentService
- ClaudeAgentService
- contracts.ts
- App.tsx
- HubEvent
- agent-service.ts
- oracle-voice-child.ts
- sessionKey
- ManagedSession
- schedules.ts
- app.ts
- RemoteNodeClient
- sections.tsx
- oracle-voice.ts
- manager-tools.ts
- App.test.tsx
- oracle-voice-soak.ts
- OracleVoiceCoordinator
- AppSettingsDialog.tsx
- CopilotClientLike
- agentic-remote-promotion-monitor
- ManagerAgent
- claude-agent-service.ts
- manager-store.ts
- dreamer-store.ts
- terminal-session.ts
- oracle-voice-integration.test.ts
- alerts.test.ts
- oracle-voice-routes.test.ts
- ScheduleRun
- CopilotSessionLike
- oracle-voice-session.ts
- oracle-voice-routes.ts
- request
- oracle-voice-worker.ts
- SessionService
- terminal-session.test.ts
- ManagerMessage
- manager-agent.ts
- react
- workspace-fixtures.ts
- transcription-service.ts
- manager-structured-memory-validation.ts
- active-sessions.ts
- FakeVoiceEngine
- node-routes.ts
- TmuxTerminalSessionController
- SettingsProfileSnapshot
- session-directory.ts
- ManagerEvent
- hub-routes.ts
- DreamerService
- oracle-task-store.ts
- session-knowledge-store.ts
- server/skill-settings.ts
- .sendInternal
- setupWorkspaceFixture
- fake-voice.ts
- oracle-voice-benchmark.ts
- ProviderSessionService
- tmux-test-helpers.ts
- processes.ts
- ManagerStore
- ManagerAssistant.tsx
- OracleDreamer.tsx
- agentic-remote
- manager-agent.test.ts
- SchedulerStore
- src/settings-profile.ts
- session-knowledge-routes.test.ts
- markdown-navigation.ts
- TerminalSessionController
- dreamer-progress.ts
- controls.tsx
- agentic-remote-gate
- FakeSessionService
- bundle
- PushNotificationService
- OracleVoiceClient
- shell.ts
- lib.rs
- terminal-startup-queue.test.ts
- dependencies
- oracle-voice-config.ts
- dreamer-planner.ts
- VoiceCapture
- agentic-remote-promotion-setup
- ui-scenes.ts
- devDependencies
- config.rs
- knowledge-tree.ts
- ManagerAssistant.test.tsx
- KnowledgeStore
- capture.ts
- dreamer-service.ts
- manager-proactive-inbox.ts
- manager-context.ts
- shared/settings-profile.ts
- manager-structured-memory.ts
- oracle-voice-security.test.ts
- .sendAdmittedWithBackend
- oracle-voice-segments.ts
- SessionOrderStore
- client.ts
- client.test.ts
- registerSessionKnowledgeRoutes
- capture-workspace.ts
- ManagerAttachment
- VoicePlayback
- session-patch-browser.ts
- backgroundTasksFromEvents
- cli-canary.ts
- manager-structured-memory-search.ts
- scripts
- use-markdown-document.ts
- sampler.ts
- ManagerStructuredMemoryStore
- agent-service.test.ts
- background-task-adapter.ts
- reader.ts
- HostMonitorView.test.tsx
- compilerOptions
- NotificationStore
- oracle-voice-coordinator.test.ts
- session-reply-durability.test.ts
- HostTelemetrySampler
- .toolHost
- host-telemetry.ts
- session-patches.test.ts
- compilerOptions
- full-gate.test.ts
- session-store-providers.test.ts
- compilerOptions
- ManagerProactiveInbox
- session-resource-clear.test.ts
- OnlineRecognizer
- SessionKnowledgeBinding
- MessageTime.tsx
- compilerOptions
- compilerOptions
- oracle-status.test.ts
- .correct
- use-oracle-conversation.test.tsx
- dreamer-schedule.ts
- ManagerMemory
- promotion-monitor.test.ts
- pipeline.ts
- BoundedQueue
- ReaderWorkspace
- scripts
- session-latency-benchmark.ts
- session-resource-routes.test.ts
- SessionLauncher
- terminal-form-deadline.test.ts
- parsers.test.ts
- background-task-stop.test.ts
- closed-session-sweeper.ts
- normalizeKnowledgeRelativePath
- server/session-patches.ts
- renderer.ts
- package.json
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- use-markdown-document.test.tsx
- pending-echo.ts
- manager-automatic.ts
- .oxlintrc.json
- settings-local.json
- dreamer-service.test.ts
- .observe
- manager-proactive-inbox.test.ts
- Pcm16Resampler
- background-task-tracker.ts
- recovery-seed-guards.test.ts
- send-policy.test.ts
- use-oracle-attachments.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- sign-in-expired.pw.ts
- normalizeBackgroundTask
- DeferredSession
- isRecord
- SessionAdmissions
- dataset
- generate-pwa-icons.ts
- agent-service-recovery.test.ts
- ManagerProactiveInboxValidationError
- ChatMessage
- bridge.rs
- transcribeAudio
- pipeline.test.tsx
- vite.config.ts
- .askSession
- dreamer-routes.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- remote-node-client.test.ts
- doctor-cli.test.ts
- release-publication.test.ts
- UserInputFieldControl
- KnowledgePosition
- OracleVoiceClientDependencies
- OracleVoicePlayback
- history-projection.test.ts
- SessionRetentionPatch
- settings.ts
- composer-layout.test.ts
- VoiceServerControl
- worker-handler.ts
- promotion-setup.test.ts
- appearance.ts
- terminal-send-uncertainty.test.ts
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
1. `AppWorkspace()` - 344 edges
2. `SessionDetail` - 337 edges
3. `AgentService` - 303 edges
4. `SessionStore` - 207 edges
5. `ManagedSession` - 182 edges
6. `buildApp()` - 138 edges
7. `ClaudeAgentService` - 136 edges
8. `ComputerManager` - 106 edges
9. `registerHubRoutes()` - 104 edges
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
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (251 total, 24 thin omitted)

### Community 0 - "SessionDetail"
Cohesion: 0.02
Nodes (97): fixture(), restart(), runtimeInfoMatches(), fixture(), connect(), createStore(), deferred(), disk (+89 more)

### Community 1 - "AppWorkspace"
Cohesion: 0.02
Nodes (195): message(), sendLikeTheApp(), isManagerEvent(), terminalSendOptions(), activateSession(), askSession(), cancelBackgroundTask(), clearConversation() (+187 more)

### Community 2 - "AgentService"
Cohesion: 0.04
Nodes (10): agentMode(), AgentService, isRuntimeReasoningEffort(), lifecycleRefusal(), permissionTitle(), RuntimeConfigurationError, suspendedRuntimeConflict(), suspendRefused() (+2 more)

### Community 3 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (31): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services (+23 more)

### Community 4 - "contracts.ts"
Cohesion: 0.04
Nodes (110): ClaudeSdk, RemoteSessionListing, awaitTermination(), LaunchCreations, apps, directories, directory(), runtime() (+102 more)

### Community 5 - "App.tsx"
Cohesion: 0.03
Nodes (115): ActivityStatus, UserInputField, UserInputFieldValue, fetchSettingsProfile(), importSettingsProfile(), renameSession(), saveSettingsChanges(), activityKindFromMessage() (+107 more)

### Community 6 - "HubEvent"
Cohesion: 0.04
Nodes (75): WorkspaceFixtureOptions, ComputerManagerEvents, center(), directories, directory(), hub(), now, runtimes (+67 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.04
Nodes (83): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+75 more)

### Community 8 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (54): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+46 more)

### Community 9 - "sessionKey"
Cohesion: 0.04
Nodes (85): CLOSED_SESSION_RETENTION_DAYS, closedSessionContext(), closedSessionExpiresAt(), excerpt(), isClosedSessionContext(), said(), ClosedSessionContext, listClosedSessions() (+77 more)

### Community 10 - "ManagedSession"
Cohesion: 0.07
Nodes (19): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, FakeManager (+11 more)

### Community 11 - "schedules.ts"
Cohesion: 0.04
Nodes (89): State, stateSchema, timestamp, CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression() (+81 more)

### Community 12 - "app.ts"
Cohesion: 0.04
Nodes (67): buildApp(), errorStatusCode(), isAppleTouchIconProbe(), transcriptionComputerName(), directories, runtimes, trusted, FileUploadError (+59 more)

### Community 13 - "RemoteNodeClient"
Cohesion: 0.03
Nodes (20): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, requestBytes(), RemoteNodeCapabilityError, RemoteNodeRequestError, RemoteNodeTransportError (+12 more)

### Community 14 - "sections.tsx"
Cohesion: 0.05
Nodes (61): hub(), AppVersion, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable() (+53 more)

### Community 15 - "oracle-voice.ts"
Cohesion: 0.05
Nodes (58): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, closeReason() (+50 more)

### Community 16 - "manager-tools.ts"
Cohesion: 0.04
Nodes (45): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), changeSuspension() (+37 more)

### Community 17 - "App.test.tsx"
Cohesion: 0.03
Nodes (66): addKnowledgeRoot(), bootstrapSessionOrder(), cancelSession(), fetchSessionOrder(), getSession(), listComputers(), listKnowledgeEntries(), listKnowledgeRoots() (+58 more)

### Community 18 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (36): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+28 more)

### Community 19 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (20): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+12 more)

### Community 20 - "AppSettingsDialog.tsx"
Cohesion: 0.05
Nodes (72): addComputer(), checkHubSignIn(), deleteKnowledgeRoot(), deletePushSubscription(), dispatchQueuedPrompt(), getPushPublicKey(), HUB_SNAPSHOT_TIMEOUT_MS, isQueuedDispatchResult() (+64 more)

### Community 21 - "CopilotClientLike"
Cohesion: 0.03
Nodes (58): root, script, CopilotClientLike, directories, fakeClient(), ForkRequest, forkSession(), services (+50 more)

### Community 22 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 23 - "ManagerAgent"
Cohesion: 0.07
Nodes (15): checkContent(), delay(), errorMessage(), isNotFound(), isPending(), isQueued(), ManagerAgent, sameRuntime() (+7 more)

### Community 24 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (58): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+50 more)

### Community 25 - "manager-store.ts"
Cohesion: 0.04
Nodes (53): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, JournalRecorder (+45 more)

### Community 26 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (41): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+33 more)

### Community 27 - "terminal-session.ts"
Cohesion: 0.05
Nodes (69): afterExit(), boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus(), composerHoldsOtherText() (+61 more)

### Community 28 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (36): QueuedAudio, apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback (+28 more)

### Community 29 - "alerts.test.ts"
Cohesion: 0.05
Nodes (37): BuildAppOptions, HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, computer, observe(), snapshot(), start, sustained() (+29 more)

### Community 30 - "oracle-voice-routes.test.ts"
Cohesion: 0.05
Nodes (27): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+19 more)

### Community 31 - "ScheduleRun"
Cohesion: 0.09
Nodes (23): provenance(), SessionScheduleLauncher, NoopScheduleLauncher, ScheduleLauncher, ScheduleLaunchRefusedError, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS (+15 more)

### Community 32 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (33): CopilotSessionLike, CopilotTasksApi, nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused() (+25 more)

### Community 33 - "oracle-voice-session.ts"
Cohesion: 0.07
Nodes (24): exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), ObservedLocalVoiceBackend, RouteVoiceBackend, acquisitionCancelled(), ActiveUtterance (+16 more)

### Community 34 - "oracle-voice-routes.ts"
Cohesion: 0.06
Nodes (49): nodeVoiceCapabilities(), sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes() (+41 more)

### Community 35 - "request"
Cohesion: 0.07
Nodes (51): scheduleProposalSummary(), ScheduleTarget, createOracleVoiceTicket(), getProviderRuntimeOptions(), getPushSettings(), listBackgroundTasks(), listDirectories(), request() (+43 more)

### Community 36 - "oracle-voice-worker.ts"
Cohesion: 0.07
Nodes (26): benchmarkGroup(), VoiceEngineSession, VoiceTtsEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage() (+18 more)

### Community 37 - "SessionService"
Cohesion: 0.06
Nodes (12): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, readServiceResources(), readSessionMcpServers(), readSessionSkills() (+4 more)

### Community 38 - "terminal-session.test.ts"
Cohesion: 0.05
Nodes (54): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+46 more)

### Community 39 - "ManagerMessage"
Cohesion: 0.06
Nodes (24): FakeManager, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams (+16 more)

### Community 40 - "manager-agent.ts"
Cohesion: 0.06
Nodes (42): DreamerProgressView, automaticPayload(), discover(), ManagerAgentOptions, messagePriority(), Rung, TURN_ACTIVITY, TurnContextInput (+34 more)

### Community 41 - "react"
Cohesion: 0.06
Nodes (31): react, families, modelFamily, repositoryModels, AttachmentStrip(), composerSteeringUnavailableReason(), ComposerActions(), ContextRing() (+23 more)

### Community 42 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (41): frame(), geometry, output, scratch, screenshot(), { values }, accents, Measurement (+33 more)

### Community 43 - "transcription-service.ts"
Cohesion: 0.06
Nodes (33): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload (+25 more)

### Community 44 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 45 - "active-sessions.ts"
Cohesion: 0.07
Nodes (50): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+42 more)

### Community 46 - "FakeVoiceEngine"
Cohesion: 0.06
Nodes (26): apps, directories, FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine (+18 more)

### Community 47 - "node-routes.ts"
Cohesion: 0.07
Nodes (41): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema (+33 more)

### Community 48 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (13): awaitingRelaunch(), capturePane(), copilotCommand(), endProbeSession(), execFileAsync, processAncestors(), processCommand(), safeWindowName() (+5 more)

### Community 49 - "SettingsProfileSnapshot"
Cohesion: 0.07
Nodes (33): WorkspaceFixtureState, directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore (+25 more)

### Community 50 - "session-directory.ts"
Cohesion: 0.09
Nodes (38): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath() (+30 more)

### Community 51 - "ManagerEvent"
Cohesion: 0.07
Nodes (19): apps, directories, DreamerServiceOptions, ManagerEventSource, batchMessageId(), ComputerGenerations, isTerminal(), lifecycles() (+11 more)

### Community 52 - "hub-routes.ts"
Cohesion: 0.05
Nodes (45): ClientPresence, PRESENCE_TTL_MS, addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+37 more)

### Community 53 - "DreamerService"
Cohesion: 0.12
Nodes (10): DreamerMemoryMetadata, digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate (+2 more)

### Community 54 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (33): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+25 more)

### Community 55 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (29): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+21 more)

### Community 56 - "server/skill-settings.ts"
Cohesion: 0.08
Nodes (34): builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills(), Token (+26 more)

### Community 57 - ".sendInternal"
Cohesion: 0.10
Nodes (43): activeBottomFrame(), captureBeforeDeadline(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), composerHoldsText(), composerText(), containsCopiedInteractiveFrame() (+35 more)

### Community 58 - "setupWorkspaceFixture"
Cohesion: 0.05
Nodes (27): pageFor(), desktop, devices, long, open(), phone, veryLong, bounds() (+19 more)

### Community 59 - "fake-voice.ts"
Cohesion: 0.07
Nodes (10): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance (+2 more)

### Community 60 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 62 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (41): directories, exec, [root], assertSameIdentity(), createIsolatedTmuxRoot(), execFileAsync, abandoned, abandonFixture() (+33 more)

### Community 63 - "processes.ts"
Cohesion: 0.08
Nodes (28): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+20 more)

### Community 64 - "ManagerStore"
Cohesion: 0.08
Nodes (10): openStore(), applySessionReplacement(), emptyState(), ManagerStore, messageSource(), projectProvenance(), registryKey(), storedMessage() (+2 more)

### Community 65 - "ManagerAssistant.tsx"
Cohesion: 0.07
Nodes (45): editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent() (+37 more)

### Community 66 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (41): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition, getDreamer() (+33 more)

### Community 67 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 68 - "manager-agent.test.ts"
Cohesion: 0.07
Nodes (23): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+15 more)

### Community 69 - "SchedulerStore"
Cohesion: 0.12
Nodes (10): enableSchedulerTools(), fixture(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, retainedHistory(), ScheduleProposal (+2 more)

### Community 70 - "src/settings-profile.ts"
Cohesion: 0.09
Nodes (22): NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, statuslineItems, CachedProfile (+14 more)

### Community 71 - "session-knowledge-routes.test.ts"
Cohesion: 0.06
Nodes (26): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+18 more)

### Community 72 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (40): executeCommand(), listWorkspace(), searchWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+32 more)

### Community 73 - "TerminalSessionController"
Cohesion: 0.08
Nodes (10): isUncertainDelivery(), persistedFormAnswer(), removeCopilotSessionFiles(), TerminalFormContinuation, validateUserInputForm(), TerminalFormReplyError, TerminalSessionController, PendingPermission (+2 more)

### Community 74 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 75 - "controls.tsx"
Cohesion: 0.08
Nodes (41): AppearanceSetting, validateSessionDirectory(), moveSessionToBrowsedFolder(), shortcutKeys(), readStoredShortcuts(), AppShortcutBinding, binding(), bindingLabel() (+33 more)

### Community 76 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 77 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 78 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 79 - "PushNotificationService"
Cohesion: 0.10
Nodes (10): start(), HubEventSource, OracleEventSource, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema (+2 more)

### Community 80 - "OracleVoiceClient"
Cohesion: 0.15
Nodes (7): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, playbackClientError(), terminalCloseCode()

### Community 81 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 82 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 83 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (30): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+22 more)

### Community 84 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 85 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (28): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+20 more)

### Community 86 - "dreamer-planner.ts"
Cohesion: 0.10
Nodes (35): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+27 more)

### Community 87 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 88 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 89 - "ui-scenes.ts"
Cohesion: 0.10
Nodes (22): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+14 more)

### Community 90 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 91 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 92 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+26 more)

### Community 93 - "ManagerAssistant.test.tsx"
Cohesion: 0.06
Nodes (21): cancelManager(), getOracleVoiceCapabilities(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+13 more)

### Community 94 - "KnowledgeStore"
Cohesion: 0.12
Nodes (14): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+6 more)

### Community 95 - "capture.ts"
Cohesion: 0.07
Nodes (17): BufferedFrame, defaultAudioContext(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode (+9 more)

### Community 96 - "dreamer-service.ts"
Cohesion: 0.10
Nodes (32): DreamerPlanDraft, DreamerPlannerInput, boundedText(), DreamerFollowUp, DreamerPlannerExecutionInput, safeRunError(), unavailableSnapshot(), DreamerCoverageIncrement (+24 more)

### Community 97 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (34): assertExactKeys(), cloneState(), DISPOSITIONS, hasExactKeys(), isDisposition(), isEventKind(), isId(), isOrigin() (+26 more)

### Community 98 - "manager-context.ts"
Cohesion: 0.13
Nodes (27): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+19 more)

### Community 99 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (29): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+21 more)

### Community 100 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (28): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+20 more)

### Community 101 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (19): FakeVoiceEngineCall, VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), createManager(), issueTicket() (+11 more)

### Community 102 - ".sendAdmittedWithBackend"
Cohesion: 0.11
Nodes (12): commandShortcut(), isTerminalNotReadyRefusal(), sessionInUseConflictMessage(), stripAnsi(), terminalAnswerRefused(), isTerminalAgentWorking(), isTerminalOverlay(), isTerminalSessionInUsePrompt() (+4 more)

### Community 103 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 104 - "SessionOrderStore"
Cohesion: 0.14
Nodes (13): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+5 more)

### Community 105 - "client.ts"
Cohesion: 0.08
Nodes (21): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, parseHello() (+13 more)

### Community 106 - "client.test.ts"
Cohesion: 0.09
Nodes (10): HUB_SIGN_IN_EXPIRED_MESSAGE, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 107 - "registerSessionKnowledgeRoutes"
Cohesion: 0.11
Nodes (22): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+14 more)

### Community 108 - "capture-workspace.ts"
Cohesion: 0.13
Nodes (24): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+16 more)

### Community 109 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 110 - "VoicePlayback"
Cohesion: 0.14
Nodes (4): FakeSource, harness(), validateGeneration(), VoicePlayback

### Community 111 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 112 - "backgroundTasksFromEvents"
Cohesion: 0.19
Nodes (27): addActivity(), backgroundHandoff(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventString(), eventTask(), lastForegroundCompletionAt() (+19 more)

### Community 113 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 114 - "manager-structured-memory-search.ts"
Cohesion: 0.13
Nodes (23): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+15 more)

### Community 115 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 116 - "use-markdown-document.ts"
Cohesion: 0.15
Nodes (21): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+13 more)

### Community 117 - "sampler.ts"
Cohesion: 0.12
Nodes (24): counter(), counterDelta(), CpuCounters, cpuUtilization(), DeviceByteCounters, DeviceCounters, deviceRates(), isWholeDisk() (+16 more)

### Community 118 - "ManagerStructuredMemoryStore"
Cohesion: 0.15
Nodes (8): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open()

### Community 119 - "agent-service.test.ts"
Cohesion: 0.13
Nodes (14): terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+6 more)

### Community 120 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (23): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isLiveTaskStatus(), isOlderExecution(), isShellObserverTool() (+15 more)

### Community 121 - "reader.ts"
Cohesion: 0.12
Nodes (16): detectWsl(), parseDataMount(), createLinuxHostTelemetryReader(), errorCode(), HostTelemetryProcFile, HostTelemetryReader, HostTelemetryReaderOptions, HostTelemetryReading (+8 more)

### Community 122 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 123 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 124 - "NotificationStore"
Cohesion: 0.16
Nodes (6): durableState(), emptyState(), matchesNotification(), NotificationStore, setup(), NotificationFilter

### Community 125 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 126 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 127 - "HostTelemetrySampler"
Cohesion: 0.16
Nodes (3): HostTelemetrySampler, HostMinuteAggregate, HostSample

### Community 129 - "host-telemetry.ts"
Cohesion: 0.13
Nodes (19): aggregate, DiskSpaceSchema, HOST_TELEMETRY_CAPABILITY_VERSION, HOST_TELEMETRY_INVALID_CLOSE_CODE, HostHistorySchema, HostInfoSchema, HostMetricAggregate, HostMetricAggregateSchema (+11 more)

### Community 130 - "session-patches.test.ts"
Cohesion: 0.17
Nodes (9): Connection, Client, PatchSocket, Browser, seedOffset, session(), HubResyncRequest, HubWireEvent (+1 more)

### Community 131 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 132 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 133 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 134 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 135 - "ManagerProactiveInbox"
Cohesion: 0.22
Nodes (4): ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, nowIso(), openInbox()

### Community 136 - "session-resource-clear.test.ts"
Cohesion: 0.13
Nodes (13): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+5 more)

### Community 137 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 138 - "SessionKnowledgeBinding"
Cohesion: 0.18
Nodes (13): SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding() (+5 more)

### Community 139 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 140 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 141 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 142 - "oracle-status.test.ts"
Cohesion: 0.18
Nodes (15): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+7 more)

### Community 143 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 144 - "use-oracle-conversation.test.tsx"
Cohesion: 0.17
Nodes (7): OracleVoiceClientOptions, OracleVoiceUiState, availableCapability, defaults, FakeVoiceClient, transcript(), voiceClientConstructor

### Community 145 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 146 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 147 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 148 - "pipeline.ts"
Cohesion: 0.19
Nodes (17): holdingRenderer(), partlyHeldRenderer(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform(), drawSteps(), growable (+9 more)

### Community 149 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 150 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 151 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 152 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 153 - "session-resource-routes.test.ts"
Cohesion: 0.15
Nodes (9): node(), apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService (+1 more)

### Community 154 - "SessionLauncher"
Cohesion: 0.15
Nodes (6): delay(), requireFolderTrust(), sameFolder(), SessionLauncher, SessionLaunchPreparationError, trustedFolderOf()

### Community 155 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 156 - "parsers.test.ts"
Cohesion: 0.20
Nodes (12): prefixes, session, trusted, untrusted, hostTelemetryProcFiles, cpuFixture, diskstatsFixture, hostInfoFixture (+4 more)

### Community 157 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 158 - "closed-session-sweeper.ts"
Cohesion: 0.17
Nodes (5): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS

### Community 159 - "normalizeKnowledgeRelativePath"
Cohesion: 0.28
Nodes (13): knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath() (+5 more)

### Community 160 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 161 - "renderer.ts"
Cohesion: 0.19
Nodes (7): DocumentRenderEvent, createWorkerRenderer(), defaultDocumentRenderer(), RendererWorker, synchronousRenderer, FakeWorker, startWorkers()

### Community 162 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 163 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 164 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 165 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 166 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 167 - "use-markdown-document.test.tsx"
Cohesion: 0.16
Nodes (6): drawnInParts(), RenderedDocumentTree, DocumentRenderer, DocumentRendererContext, components, show()

### Community 168 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 169 - "manager-automatic.ts"
Cohesion: 0.24
Nodes (9): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+1 more)

### Community 170 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 171 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 172 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 173 - ".observe"
Cohesion: 0.21
Nodes (7): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId()

### Community 174 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 175 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 176 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 177 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 178 - "send-policy.test.ts"
Cohesion: 0.20
Nodes (10): SessionExecutionMode, TerminalSendPolicyInput, TerminalSendRequestOptions, booleans, combinations, executionModes, providers, replacing (+2 more)

### Community 179 - "use-oracle-attachments.ts"
Cohesion: 0.35
Nodes (11): removeManagerFile(), uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake() (+3 more)

### Community 180 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 181 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 182 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 183 - "normalizeBackgroundTask"
Cohesion: 0.22
Nodes (10): attachmentModeValue(), booleanValue(), executionModeValue(), isBackgroundTaskInfo(), isBackgroundTaskProgress(), normalizeBackgroundTask(), numberValue(), progressValue() (+2 more)

### Community 185 - "isRecord"
Cohesion: 0.29
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 187 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 188 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 189 - "agent-service-recovery.test.ts"
Cohesion: 0.22
Nodes (6): holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents()

### Community 190 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 191 - "ChatMessage"
Cohesion: 0.27
Nodes (8): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, ChatMessage, PendingEchoOwner, Base

### Community 192 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 193 - "transcribeAudio"
Cohesion: 0.29
Nodes (4): transcribeAudio(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 194 - "pipeline.test.tsx"
Cohesion: 0.27
Nodes (7): components, drawn(), drawnPage(), fixtures, html(), today(), rehypeDocumentHeadings()

### Community 195 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 196 - ".askSession"
Cohesion: 0.42
Nodes (4): sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout()

### Community 197 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 198 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 199 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 200 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 201 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 202 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 203 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 204 - "KnowledgePosition"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 207 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 208 - "SessionRetentionPatch"
Cohesion: 0.43
Nodes (3): SessionRetention, SessionRetentionPatch, SessionRetentionSettings()

### Community 209 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 210 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 211 - "VoiceServerControl"
Cohesion: 0.40
Nodes (4): connect(), Inbox, rawBuffer(), VoiceServerControl

### Community 212 - "worker-handler.ts"
Cohesion: 0.47
Nodes (4): render, scope, handleRenderRequest(), RenderRequest

### Community 213 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 214 - "appearance.ts"
Cohesion: 0.50
Nodes (3): Appearance, appearanceFrom(), appearanceStorageKey

## Knowledge Gaps
- **1417 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1412 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2366 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `fixture()` connect `CopilotClientLike` to `SessionDetail`, `AgentService`, `ClaudeAgentService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `CopilotSessionLike`, `SessionDetail`, `ClaudeAgentService`, `.askSession`, `contracts.ts`, `.sendAdmittedWithBackend`, `agent-service.ts`, `TerminalSessionController`, `session-directory.ts`, `normalizeBackgroundTask`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `CopilotSessionLike`, `AgentService`, `ClaudeAgentService`, `agent-service.ts`, `TerminalSessionController`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1417 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.02361111111111111 - nodes in this community are weakly interconnected._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.024436002063693073 - nodes in this community are weakly interconnected._
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
