# Agentic Remote - Graphify code map

Snapshot: `8914b91cd940f91edb2a7f8e6a8e8512878e8d3bd1bc57da18d7931f41990a2c`

Source checkout: `51d4a7b913b9d5e8745b09aa5ddca50a9e87df5d`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 726 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 726 files · ~1,269,872 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 10181 nodes · 29183 edges · 296 communities (251 shown, 28 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1372 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AppWorkspace
- api.ts
- SessionDetail
- AgentService
- ClaudeAgentService
- computer-manager.ts
- App.tsx
- oracle-voice-soak.ts
- session-presentation.ts
- oracle-voice-security.test.ts
- manager.ts
- terminal-session.ts
- agent-service.ts
- agent-service.test.ts
- .publish
- oracle-voice-worker.ts
- claude-agent-service.ts
- manager-tools.ts
- OracleVoiceCoordinator
- oracle-voice-session.ts
- oracle-voice.ts
- agentic-remote-promotion-monitor
- dreamer-store.ts
- ManagedSession
- oracle-voice-child.ts
- contracts.ts
- ManagerAgent
- controls.tsx
- hub-routes.ts
- RemoteNodeClient
- ManagerAssistant.tsx
- host-telemetry.ts
- setupWorkspaceFixture
- sampler.ts
- oracle-voice-integration.test.ts
- multi-node.test.ts
- BackgroundTaskSnapshot
- queued-dispatch.test.ts
- manager-store.ts
- oracle-task-store.ts
- notification-classifier.ts
- TmuxTerminalSessionController
- live-dictation-client.ts
- notification-center-service.ts
- SessionService
- ui-locks.pw.ts
- app.ts
- ProviderSessionService
- KnowledgeStore
- manager-structured-memory-validation.ts
- parakeet-worker.ts
- workspace-fixtures.ts
- session-knowledge-store.ts
- oracle-voice-benchmark.ts
- OracleDreamer.tsx
- ManagerStore
- server/skill-settings.ts
- session-directory.ts
- live-dictation-session.ts
- DreamerService
- manager-agent.ts
- send-matrix.integration.test.ts
- ScheduleRun
- tmux-test-helpers.ts
- background-task-adapter.ts
- SchedulerStore
- processes.ts
- session-reply-durability.test.ts
- fake-voice.ts
- agentic-remote
- dreamer-progress.ts
- ManagerMessage
- recovery-resend-durability.test.ts
- SettingsProfileSnapshot
- LocalTranscriptionService
- terminal-session.test.ts
- agentic-remote-gate
- use-live-dictation.ts
- bundle
- parakeet-child.ts
- transcription-service.ts
- schedule-recurrence.ts
- dictation-routes.test.ts
- ActivityDetails.tsx
- manager-proactive-inbox.ts
- shell.ts
- VoicePlayback
- ChatMessage
- scheduler-store.ts
- lib.rs
- PushNotificationService
- client.test.ts
- dependencies
- devDependencies
- SessionOrderStore
- agentic-remote-promotion-setup
- oracle-voice-config.ts
- UserInputReplyInput
- config.rs
- ManagerSnapshot
- tmux-errors.integration.test.ts
- response-compression.test.ts
- dictation-routes.ts
- pwa.ts
- ScheduleForm.tsx
- use-markdown-document.test.tsx
- live-dictation-host.test.ts
- manager-context.ts
- BackgroundTasksDialog.tsx
- knowledge-tree.ts
- session-prefetch.ts
- active-sessions.ts
- feature-flags.ts
- NodeIdentityStore
- dreamer-planner.ts
- manager-structured-memory.ts
- shared/settings-profile.ts
- oracle-voice-segments.ts
- sections.tsx
- manager-proactive-coordinator.ts
- pipeline.ts
- transcript-test-helpers.ts
- registerSessionKnowledgeRoutes
- server/session-patches.ts
- session-patch-browser.ts
- manager-structured-memory-search.ts
- ManagerStructuredMemoryStore
- ManagerProactiveInbox
- ManagerAttachment
- src/settings-profile.ts
- pwa-update.pw.ts
- schedule-proposals.ts
- capture-workspace.ts
- cli-canary.ts
- ComputerSummary
- startup-phases.test.ts
- scripts
- DialogFrame.tsx
- check-workspace-review-regressions.ts
- .toolHost
- SettingsProfileClient
- use-markdown-document.ts
- VoiceCapture
- background-task-stop.test.ts
- RuntimeModelOption
- dreamer-service.test.ts
- HostMonitorView.test.tsx
- dictation.ts
- session-categories.ts
- notification-center.ts
- compilerOptions
- oracle-voice-assets.test.ts
- react
- live-dictation-benchmark.ts
- live-dictation-session.test.ts
- real-voice.ts
- vite.config.ts
- DictationConnection
- SessionCategoryStore
- oracle-voice-tickets.ts
- session-store-providers.test.ts
- compilerOptions
- session-category-store.test.ts
- dreamer-service.ts
- full-gate.test.ts
- refusal-metrics.ts
- composer/types.ts
- PromptCards.tsx
- oracle-voice/capture.ts
- compilerOptions
- parakeet-transcription.ts
- agent-service-event-projection.test.ts
- oracle-status.test.ts
- session-category-routes.ts
- use-session-categories.ts
- OnlineRecognizer
- markdown-navigation.ts
- MessageTime.tsx
- compilerOptions
- compilerOptions
- SubmissionError
- transport.test.ts
- ManagerMemory
- .correct
- scheduler.test.ts
- session-transcript.ts
- use-session-knowledge-root.ts
- dreamer-schedule.ts
- promotion-monitor.test.ts
- terminal-startup-queue.test.ts
- usePreviewFeature
- BoundedQueue
- ReaderWorkspace
- session-reorder.pw.ts
- scripts
- session-latency-benchmark.ts
- ScheduleWorktreeService
- terminal-form-deadline.test.ts
- .observe
- closed-sessions.ts
- RuntimeStatus.tsx
- package.json
- dictation/capture.test.ts
- pending-echo.ts
- fake-vad.ts
- desktop.json
- DeferredSession
- theme-contrast.test.ts
- DictationStatus.tsx
- capture-workbench-review.ts
- .oxlintrc.json
- settings-local.json
- SessionLauncher
- session-resource-clear.test.ts
- session-scope.ts
- Pcm16Resampler
- RecentlyClosed.test.tsx
- copilot-sdk-client.ts
- html-preview.ts
- manager-automatic.ts
- recently-closed.pw.ts
- sign-in-expired.pw.ts
- transcription-benchmark.ts
- command-catalog-cache.test.ts
- manager-proactive-inbox.test.ts
- SessionAdmissions
- use-oracle-attachments.ts
- static-files.ts
- dataset
- generate-pwa-icons.ts
- manager-proactive-coordinator.test.ts
- bridge.rs
- VoiceCaptureOptions
- history-projection.test.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- session-provenance.test.ts
- sent-message.ts
- oracle-voice/capture.test.ts
- VoiceVadOptions
- doctor-cli.test.ts
- release-publication.test.ts
- UserInputFieldControl
- session-list-collisions.test.ts
- composer-layout.test.ts
- HostTelemetryClock
- settings.ts
- DocumentViewControls.tsx
- SessionOriginRunLink.tsx
- HostAlertMonitor
- transcription-app.test.ts
- use-foreground-handoff.ts
- usePanelWidth
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- SessionCategoryLifecycle
- copyText
- FakeRecorder
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- PcmCaptureProcessor
- .readBackgroundTasks
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
1. `AppWorkspace()` - 397 edges
2. `SessionDetail` - 328 edges
3. `AgentService` - 318 edges
4. `SessionStore` - 218 edges
5. `ManagedSession` - 190 edges
6. `buildApp()` - 158 edges
7. `ClaudeAgentService` - 133 edges
8. `registerHubRoutes()` - 117 edges
9. `ComputerManager` - 110 edges
10. `ManagerAgent` - 102 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `handleDragEnd()` --indirect_call--> `computerOrder()`  [INFERRED]
  src/App.tsx → e2e/session-reorder.pw.ts
- `instrument()` --indirect_call--> `document()`  [INFERRED]
  e2e/session-patch-browser.ts → server/skill-settings-jsonc.ts
- `DreamerStoreState` --references--> `DreamerSettings`  [EXTRACTED]
  server/dreamer-store.ts → shared/dreamer.ts
- `make()` --indirect_call--> `reader()`  [INFERRED]
  server/host-telemetry/transport.test.ts → shared/transcript-window.test.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (296 total, 28 thin omitted)

### Community 0 - "AppWorkspace"
Cohesion: 0.03
Nodes (206): terminalSendOptions(), newSessionCategoryId(), sessionCategoryName(), sessionCategoryOf(), sessionFileValidationError(), submissionReceiptFromError(), activateSession(), AppWorkspace() (+198 more)

### Community 1 - "api.ts"
Cohesion: 0.02
Nodes (165): SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), activityArgumentFormats, activityDetailStatuses, activityKinds, addComputer() (+157 more)

### Community 2 - "SessionDetail"
Cohesion: 0.03
Nodes (89): AcceptedSdkReply, fixture(), restart(), PendingClaudeReply, connect(), createStore(), enqueue(), fixture() (+81 more)

### Community 3 - "AgentService"
Cohesion: 0.03
Nodes (18): agentMode(), AgentService, createStatusTracker(), foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isRuntimeReasoningEffort(), lifecycleRefusal() (+10 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.03
Nodes (36): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services (+28 more)

### Community 5 - "computer-manager.ts"
Cohesion: 0.03
Nodes (109): activityDetailsUnavailable(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), AgentServiceEvents, isUncertainDelivery(), ClaudeAgentServiceEvents, ClaudeSdk (+101 more)

### Community 6 - "App.tsx"
Cohesion: 0.02
Nodes (119): isManagerEvent(), TRANSCRIPT_WINDOW, executeCommand(), listClosedSessions(), ActivityRowStates, sidebarResizeMove(), sidebarTouchStart(), bindingMatches() (+111 more)

### Community 7 - "oracle-voice-soak.ts"
Cohesion: 0.03
Nodes (56): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+48 more)

### Community 8 - "session-presentation.ts"
Cohesion: 0.03
Nodes (100): CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), SessionProvenance, DEFAULT_SESSION_PROVIDER, handleDragEnd(), KnowledgeRootSelector(), root, CloseSessionDialog() (+92 more)

### Community 9 - "oracle-voice-security.test.ts"
Cohesion: 0.03
Nodes (52): apps, directories, EnabledOracleVoiceConfig, FakeVoiceEngine, FakeVoiceEngineCall, FakeVoiceEngineFactory, identityKey(), isCancelled() (+44 more)

### Community 10 - "manager.ts"
Cohesion: 0.05
Nodes (41): ManagerClientDefaults, ManagerMessageRole, ManagerMessageState, ManagerSubmissionOptions, ManagerSubmissionSource, ResolveManagerConfirmationInput, ORACLE_VOICE_CONNECTION_TIMEOUT_MS, getOracleVoiceCapabilities() (+33 more)

### Community 11 - "terminal-session.ts"
Cohesion: 0.04
Nodes (100): activeBottomFrame(), afterExit(), BackgroundShellsEvidence, boxedComposerFrame(), busyRowStatus(), captureBeforeDeadline(), cleanDialogLine(), clearAutomaticStartupPrompts() (+92 more)

### Community 12 - "agent-service.ts"
Cohesion: 0.04
Nodes (91): ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind(), activityResult() (+83 more)

### Community 13 - "agent-service.test.ts"
Cohesion: 0.03
Nodes (64): complete(), event(), sessionWithLog(), start(), CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures (+56 more)

### Community 14 - ".publish"
Cohesion: 0.06
Nodes (18): commandShortcut(), isTerminalNotReadyRefusal(), sessionInUseConflictMessage(), sessionInUseQueueMessage(), terminalAnswerRefused(), terminalComposerUnreadable(), isRetainedRefusal(), composerHoldsText() (+10 more)

### Community 15 - "oracle-voice-worker.ts"
Cohesion: 0.04
Nodes (45): benchmarkGroup(), createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream (+37 more)

### Community 16 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (67): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, CopilotResourceClient, CopilotResourceMethod (+59 more)

### Community 17 - "manager-tools.ts"
Cohesion: 0.04
Nodes (48): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), categoryTools() (+40 more)

### Community 18 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (23): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+15 more)

### Community 19 - "oracle-voice-session.ts"
Cohesion: 0.06
Nodes (47): nodeVoiceCapabilities(), sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes() (+39 more)

### Community 20 - "oracle-voice.ts"
Cohesion: 0.05
Nodes (56): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, closeReason() (+48 more)

### Community 21 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 22 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (45): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+37 more)

### Community 23 - "ManagedSession"
Cohesion: 0.09
Nodes (12): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), SessionLaunch, SessionLauncherOptions, SessionPromptTarget, ManagedRemovedQueuedPrompt (+4 more)

### Community 24 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (37): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+29 more)

### Community 25 - "contracts.ts"
Cohesion: 0.04
Nodes (52): closable(), provider(), SessionKnowledgeBaseLocation, apps, dataDirectory(), directories, pairedFixture(), releases (+44 more)

### Community 26 - "ManagerAgent"
Cohesion: 0.08
Nodes (11): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+3 more)

### Community 27 - "controls.tsx"
Cohesion: 0.06
Nodes (66): AppearanceSetting, NewSessionBackendSetting, createSession(), getProviderRuntimeOptions(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+58 more)

### Community 28 - "hub-routes.ts"
Cohesion: 0.04
Nodes (59): ClientPresence, PRESENCE_TTL_MS, addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+51 more)

### Community 29 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (18): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, requestBytes(), client(), servers, session (+10 more)

### Community 30 - "ManagerAssistant.tsx"
Cohesion: 0.05
Nodes (57): proactivePromptEvents(), cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage() (+49 more)

### Community 31 - "host-telemetry.ts"
Cohesion: 0.05
Nodes (44): HOST_ALERT_POLL_INTERVAL_MS, HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions (+36 more)

### Community 32 - "setupWorkspaceFixture"
Cohesion: 0.04
Nodes (37): desktop, devices, long, open(), phone, veryLong, open(), bounds() (+29 more)

### Community 33 - "sampler.ts"
Cohesion: 0.07
Nodes (46): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+38 more)

### Community 34 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (34): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+26 more)

### Community 35 - "multi-node.test.ts"
Cohesion: 0.04
Nodes (17): WorkspaceFixtureOptions, activityNotInLog(), CreationRuntime, ClaudeFakeSessionService, directories, FakeSessionService, routingFixture(), session() (+9 more)

### Community 36 - "BackgroundTaskSnapshot"
Cohesion: 0.06
Nodes (36): backgroundTaskNotFound(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), listedBackgroundTask(), readBackgroundTaskFrom(), taskFingerprint() (+28 more)

### Community 37 - "queued-dispatch.test.ts"
Cohesion: 0.04
Nodes (32): nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), QueuedDelivery (+24 more)

### Community 38 - "manager-store.ts"
Cohesion: 0.06
Nodes (40): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, session() (+32 more)

### Community 39 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (45): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+37 more)

### Community 40 - "notification-classifier.ts"
Cohesion: 0.06
Nodes (47): computer, observe(), snapshot(), start, sustained(), attentionClosed(), attentionSeed(), classifyHostNotification() (+39 more)

### Community 41 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (18): awaitingRelaunch(), backgroundShellsAllow(), captureForReplacement(), capturePane(), captureTerminal(), composerText(), copilotCommand(), endProbeSession() (+10 more)

### Community 42 - "live-dictation-client.ts"
Cohesion: 0.06
Nodes (26): DICTATION_CLIENT_TIMEOUT_MS, DICTATION_LIMITS, DictationClientMessage, createPcmCapture(), defaultDeps(), DICTATION_FRAME_SAMPLES, PageVisibility, PCM_CAPTURE_PROCESSOR (+18 more)

### Community 43 - "notification-center-service.ts"
Cohesion: 0.06
Nodes (31): center(), directories, directory(), hub(), now, runtimes, trusted, NotificationCenterService (+23 more)

### Community 44 - "SessionService"
Cohesion: 0.06
Nodes (12): ActiveClaudeQuery, closeReason(), closeVoiceSocket(), registerNodeRoutes(), releases, session, snapshot, readServiceResources() (+4 more)

### Community 45 - "ui-locks.pw.ts"
Cohesion: 0.05
Nodes (36): { values }, fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns, fixtureSchedules, chromeBudget, chromeTargets, ComposerPart (+28 more)

### Community 46 - "app.ts"
Cohesion: 0.06
Nodes (39): buildApp(), errorStatusCode(), namesComputer(), transcriptionComputerName(), directories, runtimes, trusted, FileUploadError (+31 more)

### Community 47 - "ProviderSessionService"
Cohesion: 0.06
Nodes (4): updateComputerForLaunchIdentity(), owns(), ProviderSessionService, SessionReadOptions

### Community 48 - "KnowledgeStore"
Cohesion: 0.06
Nodes (29): ServerRole, SessionMetadataLookup, SessionMuteCarrier, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation (+21 more)

### Community 49 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 50 - "parakeet-worker.ts"
Cohesion: 0.08
Nodes (23): abortError(), ChildHandle, DecodeRequest, errorMessage(), PARAKEET_MAX_WINDOW_SECONDS, ParakeetChildProcess, ParakeetUnavailableError, ParakeetWorker (+15 more)

### Community 51 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (50): oracleHostStatusFixture(), CONTEXT_EXAMPLE, documents, fixtureArguments(), fixtureComputers, fixtureEndpoints, fixtureHostHistory, fixtureHostProcesses (+42 more)

### Community 52 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+22 more)

### Community 53 - "oracle-voice-benchmark.ts"
Cohesion: 0.06
Nodes (43): execFileAsync, RealVoiceState, editsFor(), benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond() (+35 more)

### Community 54 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (45): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+37 more)

### Community 55 - "ManagerStore"
Cohesion: 0.07
Nodes (9): openStore(), emptyState(), ManagerStore, open(), createManager(), StoredManager, createManager(), SecurityManager (+1 more)

### Community 56 - "server/skill-settings.ts"
Cohesion: 0.08
Nodes (35): builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills(), Token (+27 more)

### Community 57 - "session-directory.ts"
Cohesion: 0.09
Nodes (38): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath() (+30 more)

### Community 58 - "live-dictation-session.ts"
Cohesion: 0.07
Nodes (16): DecodedTokens, joinWords(), normalizeWord(), fixture, TimedWord, WordAgreement, wordsFromTokens(), AudioChunk (+8 more)

### Community 59 - "DreamerService"
Cohesion: 0.12
Nodes (9): DreamerMemoryMetadata, digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerSnapshot (+1 more)

### Community 60 - "manager-agent.ts"
Cohesion: 0.06
Nodes (29): DreamerProgressView, automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession (+21 more)

### Community 61 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (47): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+39 more)

### Community 62 - "ScheduleRun"
Cohesion: 0.13
Nodes (12): provenance(), SessionScheduleLauncher, session(), ScheduleLauncher, ScheduleLaunchRefusedError, SchedulerDispatcher, ScheduleReconciliation, registerSchedulerRoutes() (+4 more)

### Community 63 - "tmux-test-helpers.ts"
Cohesion: 0.09
Nodes (45): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, Screens, startCopilot() (+37 more)

### Community 64 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (51): addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, copyTask() (+43 more)

### Community 65 - "SchedulerStore"
Cohesion: 0.11
Nodes (8): fixture(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, ScheduleProposal, Schedule, ScheduleRunStatus

### Community 66 - "processes.ts"
Cohesion: 0.08
Nodes (27): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+19 more)

### Community 67 - "session-reply-durability.test.ts"
Cohesion: 0.06
Nodes (35): root, script, deferred(), disk, fixtures, holdClaimWrite(), releases, disk (+27 more)

### Community 68 - "fake-voice.ts"
Cohesion: 0.08
Nodes (9): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, installFakeBrowserVoice(), ScriptedUtterance, startFixtureServer() (+1 more)

### Community 69 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 70 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (21): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressEntry, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest (+13 more)

### Community 71 - "ManagerMessage"
Cohesion: 0.07
Nodes (21): FakeManager, FakeVoiceState, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent (+13 more)

### Community 72 - "recovery-resend-durability.test.ts"
Cohesion: 0.06
Nodes (18): normalizedTitle(), TerminalDiscoveryError, directories, disk, fixture(), gate(), gates, httpBoundary() (+10 more)

### Community 73 - "SettingsProfileSnapshot"
Cohesion: 0.09
Nodes (22): WorkspaceFixtureState, profileStore(), SettingsProfileState, SettingsProfileStore, directories, store(), applySettingsChanges(), applySettingsImport() (+14 more)

### Community 74 - "LocalTranscriptionService"
Cohesion: 0.09
Nodes (17): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+9 more)

### Community 75 - "terminal-session.test.ts"
Cohesion: 0.07
Nodes (36): composerHoldsOtherText(), composerTookPaste(), listTmuxSessions(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse() (+28 more)

### Community 76 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 77 - "use-live-dictation.ts"
Cohesion: 0.09
Nodes (25): DictationCapabilities, beginSpan(), cancelSpan(), changedRange(), clamp(), DictationSpan, insertedText(), paragraphSeparator() (+17 more)

### Community 78 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 79 - "parakeet-child.ts"
Cohesion: 0.09
Nodes (29): createParakeetChild(), decodeResult(), errorMessage(), finiteNumbers(), hasCreateAsync(), normalizeParakeetSherpaModule(), PARAKEET_MODEL_FILES, ParakeetChild (+21 more)

### Community 80 - "transcription-service.ts"
Cohesion: 0.06
Nodes (31): ParakeetDecoder, TRANSCRIPTION_TIMEOUT_MS, TranscriptionEngineConfig, accessible(), CommandOptions, CommandResult, CommandRunner, configuredThreads() (+23 more)

### Community 81 - "schedule-recurrence.ts"
Cohesion: 0.09
Nodes (39): SCHEDULER_CONCURRENCY, SCHEDULER_POLL_MS, SchedulerDispatcherOptions, CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression() (+31 more)

### Community 82 - "dictation-routes.test.ts"
Cohesion: 0.06
Nodes (21): apps, connect(), Inbox, open(), other, pair(), rawText(), requestJson() (+13 more)

### Community 83 - "ActivityDetails.tsx"
Cohesion: 0.10
Nodes (32): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, TOOL_CALL_ID_PATTERN, toolCallIdFromActivityId(), ActivityStatus, activityDetailFailure, detailKey(), formatBytes(), keep() (+24 more)

### Community 84 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (39): assertExactKeys(), cloneState(), DISPOSITIONS, emptyState(), hasExactKeys(), isAlreadyExists(), isDisposition(), isEventKind() (+31 more)

### Community 85 - "shell.ts"
Cohesion: 0.09
Nodes (35): ScheduleShellNotifier, attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label() (+27 more)

### Community 86 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 87 - "ChatMessage"
Cohesion: 0.09
Nodes (27): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, count, sessionReadOptions() (+19 more)

### Community 88 - "scheduler-store.ts"
Cohesion: 0.08
Nodes (18): ComputerManagerEvents, classifyScheduleNotification(), HubEventSource, ScheduleNotificationService, input(), now, run(), headers (+10 more)

### Community 89 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 90 - "PushNotificationService"
Cohesion: 0.12
Nodes (9): start(), NotificationRecorder, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema (+1 more)

### Community 91 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 92 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 93 - "devDependencies"
Cohesion: 0.05
Nodes (39): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+31 more)

### Community 94 - "SessionOrderStore"
Cohesion: 0.12
Nodes (19): stores(), directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted() (+11 more)

### Community 95 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 96 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (27): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+19 more)

### Community 97 - "UserInputReplyInput"
Cohesion: 0.12
Nodes (7): persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), formReplyExpired(), TerminalFormReplyError, PendingUserInput, UserInputReplyInput

### Community 98 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 99 - "ManagerSnapshot"
Cohesion: 0.08
Nodes (14): ProactiveManager, OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults (+6 more)

### Community 100 - "tmux-errors.integration.test.ts"
Cohesion: 0.08
Nodes (28): foreignSocketPlace(), execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), noTmuxServer() (+20 more)

### Community 101 - "response-compression.test.ts"
Cohesion: 0.07
Nodes (20): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), apps (+12 more)

### Community 102 - "dictation-routes.ts"
Cohesion: 0.13
Nodes (16): DictationComputers, DictationRelay, DictationRouteOptions, DictationTarget, outdatedReason(), registerDictationRoutes(), RelayContext, RelayPhase (+8 more)

### Community 103 - "pwa.ts"
Cohesion: 0.11
Nodes (31): parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), activatePwaUpdate(), activePushSubscription(), applicationServerKey() (+23 more)

### Community 104 - "ScheduleForm.tsx"
Cohesion: 0.13
Nodes (26): scheduleProposalSummary(), scheduleProviderUnavailableReason(), ScheduleTarget, FolderPicker(), browse(), editableSchedule(), recurrenceSummary(), runDuration() (+18 more)

### Community 105 - "use-markdown-document.test.tsx"
Cohesion: 0.08
Nodes (17): drawnInParts(), render, scope, DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), DocumentRenderer, DocumentRendererContext (+9 more)

### Community 106 - "live-dictation-host.test.ts"
Cohesion: 0.10
Nodes (16): FAKE_CLOCK_SECONDS, FakeDictationEngine, FakeDictationState, registerFakeDictationControls(), FakeEngine, spoken(), LiveDictationEngineState, LiveDictationHost (+8 more)

### Community 107 - "manager-context.ts"
Cohesion: 0.12
Nodes (28): ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine(), followUpLine() (+20 more)

### Community 108 - "BackgroundTasksDialog.tsx"
Cohesion: 0.11
Nodes (28): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+20 more)

### Community 109 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+24 more)

### Community 110 - "session-prefetch.ts"
Cohesion: 0.10
Nodes (23): browserConnection, ConnectionHints, connectionSparesData(), IdleScheduler, PASSIVE_READS_SINCE, PREFETCH_PASS_BYTES, PREFETCH_SIDEBAR_ROWS, readsPassively() (+15 more)

### Community 111 - "active-sessions.ts"
Cohesion: 0.13
Nodes (31): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+23 more)

### Community 112 - "feature-flags.ts"
Cohesion: 0.15
Nodes (23): hub(), defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable(), PreviewFeature (+15 more)

### Community 113 - "NodeIdentityStore"
Cohesion: 0.09
Nodes (14): connections, managers, releases, remote, ComputerRegistry, LegacyRegisteredComputer, LegacyRegistryState, RegistryState (+6 more)

### Community 114 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (30): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+22 more)

### Community 115 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (28): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+20 more)

### Community 116 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (28): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+20 more)

### Community 117 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 118 - "sections.tsx"
Cohesion: 0.14
Nodes (17): AppVersion, HubHealth, getHubHealth(), CollapsedCategoriesSetting(), SettingScope(), HealthCard(), accentThemes, appearanceOptions (+9 more)

### Community 119 - "manager-proactive-coordinator.ts"
Cohesion: 0.15
Nodes (8): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, SessionLifecycle, ManagerProactiveInboxEvent, ManagerProactiveOutcome

### Community 120 - "pipeline.ts"
Cohesion: 0.12
Nodes (27): openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform() (+19 more)

### Community 121 - "transcript-test-helpers.ts"
Cohesion: 0.14
Nodes (17): contextChangedInEvents(), createPendingUserInputTracker(), foregroundCompletedSince(), pendingUserInputFromEvents(), PendingUserInputTracker, runtimeInfoFromEvents(), RuntimeTracker, SessionEventProjection (+9 more)

### Community 122 - "registerSessionKnowledgeRoutes"
Cohesion: 0.11
Nodes (22): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+14 more)

### Community 123 - "server/session-patches.ts"
Cohesion: 0.13
Nodes (14): changedInPlace(), diffMessages(), Publication, PublishedTask, sameField(), sameMessage(), sameOrder(), sessionKey() (+6 more)

### Community 124 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 125 - "manager-structured-memory-search.ts"
Cohesion: 0.12
Nodes (24): DreamerMemoryMetadataRecord, authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord() (+16 more)

### Community 126 - "ManagerStructuredMemoryStore"
Cohesion: 0.13
Nodes (11): capturePrompt(), benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore (+3 more)

### Community 127 - "ManagerProactiveInbox"
Cohesion: 0.16
Nodes (6): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxRecoveryError, nowIso(), openInbox()

### Community 128 - "ManagerAttachment"
Cohesion: 0.15
Nodes (16): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+8 more)

### Community 129 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (24): isSettingsDeviceId(), isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance (+16 more)

### Community 130 - "pwa-update.pw.ts"
Cohesion: 0.09
Nodes (13): captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), installFakeDictationCapture(), BrowserTestSessionService, desktop, open() (+5 more)

### Community 131 - "schedule-proposals.ts"
Cohesion: 0.13
Nodes (24): action, create, existing, metadata, scheduleProposalInputSchema, ScheduleProposalsChanged, scheduleProposalSchema, update (+16 more)

### Community 132 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 133 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 134 - "ComputerSummary"
Cohesion: 0.11
Nodes (16): mapWithConcurrency(), fixture(), session(), sessionAtLeastAsNew(), DurableRegisteredComputer, RegisteredComputer, TurnContextInput, ManagerProactiveCoordinatorOptions (+8 more)

### Community 135 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (16): phases, port, app(), directories, headers, launcher, createStartupPhases(), startManagedServer() (+8 more)

### Community 136 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 137 - "DialogFrame.tsx"
Cohesion: 0.12
Nodes (18): changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame(), filterSentMessages() (+10 more)

### Community 138 - "check-workspace-review-regressions.ts"
Cohesion: 0.08
Nodes (13): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+5 more)

### Community 139 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 140 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 141 - "use-markdown-document.ts"
Cohesion: 0.16
Nodes (20): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+12 more)

### Community 142 - "VoiceCapture"
Cohesion: 0.21
Nodes (3): captureFailure(), harness(), VoiceCapture

### Community 143 - "background-task-stop.test.ts"
Cohesion: 0.14
Nodes (17): BackgroundTaskEventOptions, BackgroundTaskProjector, backgroundTasksFromEvents(), completed(), handoff(), launched(), nativeStart(), readExit() (+9 more)

### Community 144 - "RuntimeModelOption"
Cohesion: 0.13
Nodes (15): RuntimeModelOption, ManagerSessionClosePolicy, getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings() (+7 more)

### Community 145 - "dreamer-service.test.ts"
Cohesion: 0.09
Nodes (13): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+5 more)

### Community 146 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 147 - "dictation.ts"
Cohesion: 0.16
Nodes (21): ConnectionContext, DEFAULT_LIMITS, exactArrayBuffer(), LiveDictationHostLimits, LiveDictationHostOptions, Phase, LiveDictationOptions, boundedText() (+13 more)

### Community 148 - "session-categories.ts"
Cohesion: 0.18
Nodes (21): Fields, isRecord(), parseState(), validName(), applySessionCategoryChange(), clamp(), existing(), isCollapsedCategoryShows() (+13 more)

### Community 149 - "notification-center.ts"
Cohesion: 0.17
Nodes (17): NotificationKindPreference, NotificationRecord, NotificationSeverity, FeatureEvent, listeners, publishFeatureEvent(), subscribeFeatureEvents(), NotificationGroup (+9 more)

### Community 150 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 151 - "oracle-voice-assets.test.ts"
Cohesion: 0.14
Nodes (20): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+12 more)

### Community 152 - "react"
Cohesion: 0.14
Nodes (12): react, composerSteeringUnavailableReason(), ComposerActions(), dictationSendReason, startingAttachmentReason, ContextRing(), SendControl(), TriggerProps (+4 more)

### Community 153 - "live-dictation-benchmark.ts"
Cohesion: 0.15
Nodes (15): Clip, dictate(), fixtureDirectory, listen(), main(), median(), NoSessions, repository (+7 more)

### Community 154 - "live-dictation-session.test.ts"
Cohesion: 0.13
Nodes (13): DictationLimitError, LiveDecodeOptions, LiveDecoder, LiveDictationUpdate, contextDecoder(), decoded(), DecoderCall, feeder() (+5 more)

### Community 155 - "real-voice.ts"
Cohesion: 0.16
Nodes (10): clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics, registerControlRoutes() (+2 more)

### Community 156 - "vite.config.ts"
Cohesion: 0.12
Nodes (12): brotliAsync, compress(), gzipAsync, precompressDirectory(), PrecompressedFile, directories, canaryTests, oracleVoiceAssetNames (+4 more)

### Community 157 - "DictationConnection"
Cohesion: 0.25
Nodes (4): DictationConnection, elapsed(), errorMessage(), DictationFinalReason

### Community 158 - "SessionCategoryStore"
Cohesion: 0.26
Nodes (6): categories(), key(), refused(), remember(), SessionCategoryStore, SessionCategoriesSnapshot

### Community 159 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 160 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+3 more)

### Community 161 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 162 - "session-category-store.test.ts"
Cohesion: 0.12
Nodes (8): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, directories, folder(), store(), CLOSED_SESSION_RETENTION_MS

### Community 163 - "dreamer-service.ts"
Cohesion: 0.17
Nodes (19): DreamerPlanDraft, DreamerPlannerInput, boundedText(), DreamerPlannerExecutionInput, DreamerServiceOptions, safeRunError(), unavailableSnapshot(), DreamerStoreSnapshot (+11 more)

### Community 164 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 165 - "refusal-metrics.ts"
Cohesion: 0.16
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+7 more)

### Community 166 - "composer/types.ts"
Cohesion: 0.17
Nodes (10): AttachmentStrip(), Composer(), HeldMessageList(), QueuedPromptList(), SlashCommandMenu(), ComposerAttachment, ComposerDictation, ComposerProps (+2 more)

### Community 167 - "PromptCards.tsx"
Cohesion: 0.14
Nodes (14): initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request, UserInputCard(), userInputFieldHasValue() (+6 more)

### Community 168 - "oracle-voice/capture.ts"
Cohesion: 0.13
Nodes (15): BufferedFrame, defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, validateIdentity(), VoiceCaptureError, VoiceCaptureErrorCode (+7 more)

### Community 169 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 170 - "parakeet-transcription.ts"
Cohesion: 0.16
Nodes (12): batchText(), joinChunkTexts(), meanSquare(), PARAKEET_TRANSCRIPTION_TIMEOUT_MS, ParakeetSpeechEngine, pcm16WavToFloat32(), splitForDecode(), directories (+4 more)

### Community 171 - "agent-service-event-projection.test.ts"
Cohesion: 0.14
Nodes (17): at(), directories, finish(), launch(), projected(), services, sessionLog(), syncSessionTranscript() (+9 more)

### Community 172 - "oracle-status.test.ts"
Cohesion: 0.17
Nodes (16): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+8 more)

### Community 173 - "session-category-routes.ts"
Cohesion: 0.13
Nodes (16): createSchema, deleteSchema, keys(), listedInSessionOrder(), moveSchema, name, paramsSchema, parse() (+8 more)

### Community 174 - "use-session-categories.ts"
Cohesion: 0.18
Nodes (17): CategoryState, CollapsedCategoryShows, DEFAULT_COLLAPSED_CATEGORY_SHOWS, SessionCategory, SessionCategoryChange, fetchSessionCategories(), saveCollapsedCategoryShows(), saveSessionCategoryChange() (+9 more)

### Community 175 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 176 - "markdown-navigation.ts"
Cohesion: 0.19
Nodes (18): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+10 more)

### Community 177 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 178 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 179 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 180 - "SubmissionError"
Cohesion: 0.22
Nodes (4): SubmissionError, startDelayedEditReload(), choose(), commit()

### Community 181 - "transport.test.ts"
Cohesion: 0.13
Nodes (14): prefixes, session, trusted, untrusted, BuildAppOptions, HostTelemetryService, readingFixture(), empty (+6 more)

### Community 182 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 183 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 184 - "scheduler.test.ts"
Cohesion: 0.13
Nodes (11): NoopScheduleLauncher, SCHEDULER_LATE_MS, ScheduleStopAcknowledgement, ScheduleTargetUnavailableError, createInput(), directories, dispatchers, fixture() (+3 more)

### Community 185 - "session-transcript.ts"
Cohesion: 0.17
Nodes (15): TRANSCRIPT_CARRIED_LIMIT, sortSessions(), upsertSessionSnapshot(), prefetchCandidates(), carrySnapshotTranscripts(), holdsTranscript(), isRunning(), laterCopy() (+7 more)

### Community 186 - "use-session-knowledge-root.ts"
Cohesion: 0.15
Nodes (11): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base, bindingKey(), knowledgePositionForBinding(), SessionIdentity, first (+3 more)

### Community 187 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 188 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 189 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (10): client(), delayQueueWrite(), disk, exec, gate(), holdQueueCommit(), NativeFixture, NativeRuntime (+2 more)

### Community 190 - "usePreviewFeature"
Cohesion: 0.24
Nodes (10): ClientFeature, railEntries(), usePreviewFeature(), usePreviewFeatures(), EffectiveState(), SchedulerDraft(), initials(), useDisplayName() (+2 more)

### Community 191 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 192 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 193 - "session-reorder.pw.ts"
Cohesion: 0.13
Nodes (9): center(), computerOrder(), desktop, dropOnto(), longListState(), open(), phone, Point (+1 more)

### Community 194 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 195 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 196 - "ScheduleWorktreeService"
Cohesion: 0.35
Nodes (5): execute, failure(), missing(), ScheduleWorktreeService, ScheduleWorktreeRecord

### Community 197 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 198 - ".observe"
Cohesion: 0.16
Nodes (9): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), publicEvent() (+1 more)

### Community 199 - "closed-sessions.ts"
Cohesion: 0.20
Nodes (13): blockParents, closedCapitals(), closedSessionContext(), excerpt(), head(), htmlElements, htmlText(), isClosedSessionContext() (+5 more)

### Community 200 - "RuntimeStatus.tsx"
Cohesion: 0.27
Nodes (9): families, modelFamily, shortModelName(), repositoryModels, RuntimeStatus(), session, glyphs, ModelFamilyIcon() (+1 more)

### Community 201 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 202 - "dictation/capture.test.ts"
Cohesion: 0.16
Nodes (6): CaptureDeps, AudioWorkletProcessor, FakeContext, FakeNode, FakeTrack, setup()

### Community 203 - "pending-echo.ts"
Cohesion: 0.24
Nodes (11): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, PendingEchoOwner, prunePendingEchoMap() (+3 more)

### Community 204 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 205 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 206 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 207 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 208 - "DictationStatus.tsx"
Cohesion: 0.20
Nodes (7): ActiveDictationStatus, DictationStatus(), dictationStatusLabel(), LiveDictationStatus, recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 209 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, fixtureSessions (+2 more)

### Community 210 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 211 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 212 - "SessionLauncher"
Cohesion: 0.19
Nodes (4): delay(), sameFolder(), SessionLauncher, trustedFolderOf()

### Community 213 - "session-resource-clear.test.ts"
Cohesion: 0.21
Nodes (12): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+4 more)

### Community 214 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 215 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 216 - "RecentlyClosed.test.tsx"
Cohesion: 0.19
Nodes (9): act(), audit(), closed, computers, now, observeResizes(), Row(), session() (+1 more)

### Community 217 - "copilot-sdk-client.ts"
Cohesion: 0.29
Nodes (9): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkMissingSessionRetirement, CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic() (+1 more)

### Community 218 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 219 - "manager-automatic.ts"
Cohesion: 0.25
Nodes (8): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, failed, finished

### Community 220 - "recently-closed.pw.ts"
Cohesion: 0.24
Nodes (8): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), row(), sessions()

### Community 221 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 222 - "transcription-benchmark.ts"
Cohesion: 0.25
Nodes (10): ClipResult, Engine, firstSeconds(), Fixture, fixtureDirectory, main(), report(), repository (+2 more)

### Community 223 - "command-catalog-cache.test.ts"
Cohesion: 0.25
Nodes (9): at(), Catalog, deferred(), fixture(), fixtures, listed(), releases, runtime() (+1 more)

### Community 224 - "manager-proactive-inbox.test.ts"
Cohesion: 0.22
Nodes (6): fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 226 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 227 - "static-files.ts"
Cohesion: 0.27
Nodes (6): RFC-9110, AcceptedEncodings, FILE_HEADERS, isApiPath(), isAppleTouchIconProbe(), registerStaticFiles()

### Community 228 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 229 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 230 - "manager-proactive-coordinator.test.ts"
Cohesion: 0.22
Nodes (5): directories, FakeAgent, fixture(), managed(), ManagerProactiveInboxOptions

### Community 231 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 233 - "history-projection.test.ts"
Cohesion: 0.31
Nodes (7): eventsFor(), groupedEventsFor(), ModelMessage, questionEventsFor(), random(), seedOffset, terminalTypes

### Community 234 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 235 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 236 - "session-provenance.test.ts"
Cohesion: 0.31
Nodes (7): isSession(), SessionIdentity, sessionProvenanceProjection(), project(), reply(), directories, session

### Community 237 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 238 - "oracle-voice/capture.test.ts"
Cohesion: 0.22
Nodes (3): CaptureControl, VoiceCaptureDependencies, VoiceVad

### Community 240 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 241 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 242 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 243 - "session-list-collisions.test.ts"
Cohesion: 0.32
Nodes (4): kind(), sessionListCollisions(), Args, layout

### Community 244 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 246 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 247 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 248 - "SessionOriginRunLink.tsx"
Cohesion: 0.52
Nodes (4): readScheduleLink(), ScheduleLink, scheduleNotificationLabel(), SessionOriginRunLink()

### Community 250 - "transcription-app.test.ts"
Cohesion: 0.40
Nodes (3): convertedWave(), directories, fakeMediaTools()

### Community 251 - "use-foreground-handoff.ts"
Cohesion: 0.47
Nodes (3): foregroundHandoffTimeoutMs, Handoff, useForegroundHandoff()

### Community 252 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 253 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 254 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 256 - "copyText"
Cohesion: 0.60
Nodes (4): CopyTextButton(), copy(), copyText(), copyWithSelection()

## Knowledge Gaps
- **1599 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1594 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2754 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `SessionDetail`, `AgentService`, `ClaudeAgentService`, `cli-canary.ts`, `computer-manager.ts`, `oracle-voice-soak.ts`, `oracle-voice-worker.ts`, `dreamer-service.test.ts`, `ManagedSession`, `oracle-voice-assets.test.ts`, `ManagerAgent`, `hub-routes.ts`, `SessionCategoryStore`, `host-telemetry.ts`, `sampler.ts`, `refusal-metrics.ts`, `manager-store.ts`, `oracle-task-store.ts`, `notification-center-service.ts`, `SessionService`, `session-category-routes.ts`, `ProviderSessionService`, `KnowledgeStore`, `parakeet-worker.ts`, `session-knowledge-store.ts`, `transport.test.ts`, `ManagerStore`, `scheduler.test.ts`, `server/skill-settings.ts`, `DreamerService`, `ScheduleRun`, `SchedulerStore`, `ScheduleWorktreeService`, `ManagerMessage`, `SettingsProfileSnapshot`, `LocalTranscriptionService`, `transcription-service.ts`, `scheduler-store.ts`, `PushNotificationService`, `SessionOrderStore`, `oracle-voice-config.ts`, `static-files.ts`, `response-compression.test.ts`, `dictation-routes.ts`, `pwa.ts`, `live-dictation-host.test.ts`, `session-provenance.test.ts`, `NodeIdentityStore`, `manager-proactive-coordinator.ts`, `HostAlertMonitor`, `ManagerProactiveInbox`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `UserInputReplyInput`, `SessionDetail`, `multi-node.test.ts`, `ClaudeAgentService`, `queued-dispatch.test.ts`, `BackgroundTaskSnapshot`, `.readBackgroundTasks`, `recovery-resend-durability.test.ts`, `agent-service.ts`, `agent-service.test.ts`, `.publish`, `claude-agent-service.ts`, `SubmissionError`, `ChatMessage`, `session-directory.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `ManagerAttachment`, `UserInputReplyInput`, `AgentService`, `ClaudeAgentService`, `queued-dispatch.test.ts`, `multi-node.test.ts`, `recovery-resend-durability.test.ts`, `.publish`, `SubmissionError`, `ChatMessage`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `AppWorkspace()` (e.g. with `submitMessage()` and `prefersLightNow()`) actually correct?**
  _`AppWorkspace()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1599 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.02686396804043863 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.023723194861701026 - nodes in this community are weakly interconnected._
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
- `docs/design/live-dictation.md`
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
- `fixtures/voice/parakeet-result-pt-BR-short.json`
