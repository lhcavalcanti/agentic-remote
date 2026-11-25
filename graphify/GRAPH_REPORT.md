# Agentic Remote - Graphify code map

Snapshot: `cf08aad8f1a79ffc81ec42181293028cb114369333aff9af1f9991d61f65572e`

Source checkout: `e367648d1e4d640b167e293dd527267d51fd3572`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 668 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 668 files · ~1,187,508 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9343 nodes · 26942 edges · 278 communities (232 shown, 28 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1338 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionDetail
- AgentService
- AppWorkspace
- api.ts
- session-presentation.ts
- agent-service.ts
- multi-node.test.ts
- App.tsx
- contracts.ts
- terminal-session.ts
- oracle-voice.ts
- SessionService
- manager-tools.ts
- ManagedSession
- remote-node-client.ts
- client.ts
- computer-manager.ts
- session-store.ts
- .takeInTranscript
- oracle-voice-soak.ts
- oracle-voice-child.ts
- agentic-remote-promotion-monitor
- ManagerStore
- dreamer-store.ts
- shared/settings-profile.ts
- app.ts
- ManagerAgent
- terminal-session.test.ts
- hub-routes.ts
- VoiceCapture
- transcription-service.ts
- node-routes.ts
- CopilotSessionLike
- ChatMessage
- oracle-voice-integration.test.ts
- OracleVoiceCoordinator
- CopilotClientLike
- oracle-voice-engine.ts
- ManagerMessage
- pwa.ts
- manager-agent.ts
- manager-structured-memory-validation.ts
- tmux-test-helpers.ts
- src/settings-profile.ts
- oracle-voice-worker.ts
- oracle-task-store.ts
- sampler.ts
- feature-flags.ts
- fake-voice.ts
- oracle-voice-benchmark.ts
- SchedulerStore
- oracle-voice-routes.ts
- TmuxTerminalSessionController
- ManagerEvent
- TerminalSessionController
- agentic-remote
- DreamerService
- OracleDreamer.tsx
- tmux-errors.integration.test.ts
- ComposerActions.tsx
- processes.ts
- normalizeKnowledgeRelativePath
- schedules.ts
- agentic-remote-gate
- ui-scenes.ts
- dreamer-progress.ts
- setupWorkspaceFixture
- bundle
- service.ts
- ManagerAssistant.tsx
- workspace-fixtures.ts
- oracle-voice-coordinator.ts
- react
- dreamer-planner.ts
- ScheduleRun
- FakeVoiceEngine
- VoicePlayback
- shell.ts
- lib.rs
- schedule-recurrence.ts
- devDependencies
- oracle-voice-config.ts
- terminal-startup-queue.test.ts
- controls.tsx
- agentic-remote-promotion-setup
- SessionKnowledgeStore
- active-sessions.ts
- recovery-resend-durability.test.ts
- dreamer-service.ts
- manager-context.ts
- manager-agent.test.ts
- PushNotificationService
- oracle-voice-security.test.ts
- dependencies
- config.rs
- response-compression.test.ts
- oracle-voice-routes.test.ts
- KnowledgeStore
- BackgroundTasksDialog.tsx
- session-prefetch.ts
- manager-proactive-inbox.ts
- oracle-voice-child.test.ts
- EngineVoiceBackendSession
- knowledge-tree.ts
- manager-structured-memory.ts
- .sendInternal
- session-resource-providers.test.ts
- session-launcher.ts
- closed-sessions.ts
- manager-structured-memory-search.ts
- oracle-voice-segments.ts
- SessionOrderStore
- FakeSocket
- session-reply-durability.test.ts
- notification-center-service.ts
- session-patch-browser.ts
- agent-service.test.ts
- HubEvent
- ManagerAttachment
- ManagerAssistant.test.tsx
- use-markdown-document.test.tsx
- startup-phases.test.ts
- ManagerStructuredMemoryStore
- capture-workspace.ts
- session-directory.ts
- cli-canary.ts
- notification-classifier.ts
- sections.tsx
- scripts
- use-markdown-document.ts
- push-notification-service.ts
- session-transcript.ts
- HostMonitorView.test.tsx
- registerSessionKnowledgeRoutes
- ScheduleProposalCards.tsx
- compilerOptions
- RemoteVoiceClient
- scheduler-dispatcher.ts
- pipeline.ts
- background-task-adapter.ts
- session-store-providers.test.ts
- PromptCards.tsx
- vite.config.ts
- transport.test.ts
- host-telemetry.ts
- NotificationRecord
- session-unread.pw.ts
- workspace-browser.ts
- compilerOptions
- createBackgroundTaskProjector
- full-gate.test.ts
- .toolHost
- NotificationStore
- markdown-navigation.ts
- terminal-form-deadline.test.ts
- compilerOptions
- session-latency-benchmark.ts
- ManagerProactiveInbox
- schedule-notification-service.test.ts
- session-knowledge-store.ts
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- HostTelemetrySampler
- ManagerMemory
- .correct
- SessionPublications
- session-resource-routes.test.ts
- dreamer-schedule.ts
- oracle-status.test.ts
- promotion-monitor.test.ts
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- session-reorder.pw.ts
- scripts
- alerts.test.ts
- server/skill-settings.ts
- projection-test-helpers.ts
- SessionScheduleLauncher
- capture-workbench-review.ts
- background-task-stop.test.ts
- oracle-voice-assets.test.ts
- .snapshot
- check-workspace-review-regressions.ts
- fake-vad.ts
- desktop.json
- recordValue
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- dreamer-service.test.ts
- .observe
- manager-proactive-inbox.test.ts
- NotificationCenterService
- session-scope.ts
- Pcm16Resampler
- RecentlyClosed.test.tsx
- recently-closed.pw.ts
- use-oracle-attachments.ts
- html-preview.ts
- fixture-frontend.ts
- sign-in-expired.pw.ts
- DeferredSession
- command-catalog-cache.test.ts
- isRecord
- SessionAdmissions
- tmux-errors.test.ts
- static-files.ts
- dataset
- generate-pwa-icons.ts
- notification-center.integration.test.ts
- bridge.rs
- dreamer-routes.ts
- logs-cli.test.ts
- ManagerProactiveInboxValidationError
- promotion-setup-execution.test.ts
- SkillsSettings.tsx
- pipeline.test.tsx
- package.json
- doctor-cli.test.ts
- release-publication.test.ts
- SkillSettingsService
- UserInputFieldControl
- render-workspace-gifs.ts
- composer-layout.test.ts
- HostTelemetryClock
- session-order-routes.test.ts
- settings.ts
- DocumentViewControls.tsx
- skill-settings-jsonc.ts
- use-foreground-handoff.ts
- usePanelWidth
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- SessionKnowledgeLifecycle
- FakeRecorder
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- BackgroundTaskProjector
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- @dnd-kit/utilities
- fastify
- @fastify/multipart
- ffmpeg-static
- ffprobe-static
- @github/copilot-sdk
- lucide-react
- mermaid
- react-markdown
- @ricky0123/vad-web
- unified
- ws
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `AppWorkspace()` - 355 edges
2. `SessionDetail` - 327 edges
3. `AgentService` - 318 edges
4. `SessionStore` - 218 edges
5. `ManagedSession` - 188 edges
6. `buildApp()` - 141 edges
7. `ClaudeAgentService` - 133 edges
8. `registerHubRoutes()` - 114 edges
9. `ComputerManager` - 107 edges
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

## Communities (278 total, 28 thin omitted)

### Community 0 - "SessionDetail"
Cohesion: 0.03
Nodes (31): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), toolResultText(), claudeOwner(), storedProvider(), fixture(), observe() (+23 more)

### Community 1 - "AgentService"
Cohesion: 0.04
Nodes (13): agentMode(), AgentService, commandShortcut(), isTerminalNotReadyRefusal(), normalizedTitle(), removeCopilotSessionFiles(), RuntimeConfigurationError, queueConflict() (+5 more)

### Community 2 - "AppWorkspace"
Cohesion: 0.03
Nodes (180): terminalSendOptions(), sessionFileValidationError(), AppWorkspace(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession() (+172 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (152): httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionReceipt, submissionReceiptFromError(), activityArgumentFormats, activityDetailStatuses, activityKinds (+144 more)

### Community 4 - "session-presentation.ts"
Cohesion: 0.03
Nodes (107): CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, activateSession(), getProviderRuntimeOptions(), handleDragEnd() (+99 more)

### Community 5 - "agent-service.ts"
Cohesion: 0.03
Nodes (110): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+102 more)

### Community 6 - "multi-node.test.ts"
Cohesion: 0.03
Nodes (41): activityNotInLog(), ClaudeAgentServiceEvents, DirectoryScope, ClaudeFakeSessionService, directories, FakeSessionService, routingFixture(), session() (+33 more)

### Community 7 - "App.tsx"
Cohesion: 0.03
Nodes (98): isManagerEvent(), TRANSCRIPT_WINDOW, executeCommand(), ActivityRowStates, moveSessionToBrowsedFolder(), sidebarResizeMove(), sidebarTouchStart(), bindingMatches() (+90 more)

### Community 8 - "contracts.ts"
Cohesion: 0.03
Nodes (72): backgroundTaskNotFound(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), listedBackgroundTask(), readBackgroundTaskFrom(), taskFingerprint() (+64 more)

### Community 9 - "terminal-session.ts"
Cohesion: 0.04
Nodes (100): activeBottomFrame(), afterExit(), boxedComposerFrame(), captureBeforeDeadline(), captureTerminal(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS (+92 more)

### Community 10 - "oracle-voice.ts"
Cohesion: 0.04
Nodes (78): ActiveBackendSession, sendNodeVoiceOutput(), QueuedAudio, SocketMessage, outputBytes(), playbackSequence(), sendBrowserOutput(), acquisitionCancelled() (+70 more)

### Community 11 - "SessionService"
Cohesion: 0.04
Nodes (14): updateComputerForLaunchIdentity(), closeReason(), closeVoiceSocket(), nodeVoiceCapabilities(), registerNodeRoutes(), owns(), ProviderSessionService, SessionService (+6 more)

### Community 12 - "manager-tools.ts"
Cohesion: 0.04
Nodes (51): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+43 more)

### Community 13 - "ManagedSession"
Cohesion: 0.07
Nodes (20): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, FakeManager (+12 more)

### Community 14 - "remote-node-client.ts"
Cohesion: 0.03
Nodes (53): RemoteResync, RemoteSessionRead, StoredNodeIdentity, StoredNodeIdentityV1, directories, DEFINITE_DISPATCH_REFUSALS, headerSafe(), normalizeNodeUrl() (+45 more)

### Community 15 - "client.ts"
Cohesion: 0.05
Nodes (36): VoiceCapabilities, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord() (+28 more)

### Community 16 - "computer-manager.ts"
Cohesion: 0.05
Nodes (69): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+61 more)

### Community 17 - "session-store.ts"
Cohesion: 0.03
Nodes (70): complete(), event(), sessionWithLog(), start(), fixtures, recoverAndSeed(), recoveryFixture(), releases (+62 more)

### Community 18 - ".takeInTranscript"
Cohesion: 0.04
Nodes (42): contextChangedInEvents(), createPendingUserInputTracker(), createStatusTracker(), at(), directories, finish(), launch(), projected() (+34 more)

### Community 19 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (36): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+28 more)

### Community 20 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (43): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+35 more)

### Community 21 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 22 - "ManagerStore"
Cohesion: 0.06
Nodes (29): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+21 more)

### Community 23 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (42): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+34 more)

### Community 24 - "shared/settings-profile.ts"
Cohesion: 0.05
Nodes (53): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), profileStore(), updateSchema (+45 more)

### Community 25 - "app.ts"
Cohesion: 0.05
Nodes (49): apps, directories, buildApp(), errorStatusCode(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), directories (+41 more)

### Community 26 - "ManagerAgent"
Cohesion: 0.08
Nodes (14): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+6 more)

### Community 27 - "terminal-session.test.ts"
Cohesion: 0.04
Nodes (64): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+56 more)

### Community 28 - "hub-routes.ts"
Cohesion: 0.04
Nodes (61): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+53 more)

### Community 29 - "VoiceCapture"
Cohesion: 0.06
Nodes (24): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, harness() (+16 more)

### Community 30 - "transcription-service.ts"
Cohesion: 0.05
Nodes (40): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, FileUploadError (+32 more)

### Community 31 - "node-routes.ts"
Cohesion: 0.05
Nodes (47): activityDetailsUnavailable(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema (+39 more)

### Community 32 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (39): CopilotSessionLike, CopilotTasksApi, openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery() (+31 more)

### Community 33 - "ChatMessage"
Cohesion: 0.06
Nodes (50): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, TOOL_CALL_ID_PATTERN (+42 more)

### Community 34 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+24 more)

### Community 35 - "OracleVoiceCoordinator"
Cohesion: 0.09
Nodes (6): errorMessage(), OracleVoiceBackendConnection, OracleVoiceCoordinator, PendingFinalTurn, withTimeout(), VoiceTurnState

### Community 36 - "CopilotClientLike"
Cohesion: 0.04
Nodes (49): CopilotClientLike, ClaudeSdk, connect(), createStore(), deferred(), disk, enqueue(), fixture() (+41 more)

### Community 37 - "oracle-voice-engine.ts"
Cohesion: 0.05
Nodes (21): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+13 more)

### Community 38 - "ManagerMessage"
Cohesion: 0.06
Nodes (22): FakeManager, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams (+14 more)

### Community 39 - "pwa.ts"
Cohesion: 0.06
Nodes (49): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), changed(), frames, innermostDialogFrame(), listeners (+41 more)

### Community 40 - "manager-agent.ts"
Cohesion: 0.06
Nodes (40): automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung, TURN_ACTIVITY, MANAGER_SCHEDULER_SYSTEM_PROMPT (+32 more)

### Community 41 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 42 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (48): foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity(), SocketPlace, UnixSocket (+40 more)

### Community 43 - "src/settings-profile.ts"
Cohesion: 0.07
Nodes (29): NewSessionRuntime, sameSettingValue(), SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, SettingsUpdateResult (+21 more)

### Community 44 - "oracle-voice-worker.ts"
Cohesion: 0.09
Nodes (23): benchmarkGroup(), capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent(), isEnabledConfig(), isNonEmptyString() (+15 more)

### Community 45 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (33): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+25 more)

### Community 46 - "sampler.ts"
Cohesion: 0.08
Nodes (45): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+37 more)

### Community 47 - "feature-flags.ts"
Cohesion: 0.10
Nodes (34): SessionProvenance, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable(), parseFeatureFlag() (+26 more)

### Community 48 - "fake-voice.ts"
Cohesion: 0.07
Nodes (10): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance (+2 more)

### Community 49 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 50 - "SchedulerStore"
Cohesion: 0.12
Nodes (10): enableSchedulerTools(), fixture(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, retainedHistory(), ScheduleProposal (+2 more)

### Community 51 - "oracle-voice-routes.ts"
Cohesion: 0.07
Nodes (40): limits(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode(), closeReason(), disconnectCause() (+32 more)

### Community 52 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (16): startAgentAfterClear(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand() (+8 more)

### Community 53 - "ManagerEvent"
Cohesion: 0.08
Nodes (17): apps, directories, batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions (+9 more)

### Community 54 - "TerminalSessionController"
Cohesion: 0.07
Nodes (10): isUncertainDelivery(), persistedFormAnswer(), sessionInUseConflictMessage(), terminalAnswerRefused(), validateUserInputForm(), boots, [directory, backend, resultPath, phase = 'idle'], fixtureRoot (+2 more)

### Community 55 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 56 - "DreamerService"
Cohesion: 0.13
Nodes (11): boundedText(), digest(), DreamerService, DreamerUnavailableError, unavailableSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate, DreamerSnapshot (+3 more)

### Community 57 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (40): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition, getDreamer() (+32 more)

### Community 58 - "tmux-errors.integration.test.ts"
Cohesion: 0.06
Nodes (28): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+20 more)

### Community 59 - "ComposerActions.tsx"
Cohesion: 0.08
Nodes (21): families, modelFamily, shortModelName(), repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions() (+13 more)

### Community 60 - "processes.ts"
Cohesion: 0.08
Nodes (27): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+19 more)

### Community 61 - "normalizeKnowledgeRelativePath"
Cohesion: 0.08
Nodes (37): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+29 more)

### Community 62 - "schedules.ts"
Cohesion: 0.07
Nodes (39): proposalInput, State, stateSchema, timestamp, action, create, existing, metadata (+31 more)

### Community 63 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 64 - "ui-scenes.ts"
Cohesion: 0.08
Nodes (30): { values }, fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns, fixtureSchedules, ComposerPart, expectTouchTargets(), lockedScreenshot (+22 more)

### Community 65 - "dreamer-progress.ts"
Cohesion: 0.09
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, DreamerProgressSource (+11 more)

### Community 66 - "setupWorkspaceFixture"
Cohesion: 0.06
Nodes (17): desktop, devices, long, open(), phone, veryLong, devices, markedState() (+9 more)

### Community 67 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 68 - "service.ts"
Cohesion: 0.08
Nodes (23): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, HostRequest (+15 more)

### Community 69 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (36): editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), sendManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), canTakeFocus() (+28 more)

### Community 70 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (26): LongFrame, oracleHostStatusFixture(), CONTEXT_EXAMPLE, documents, fixtureArguments(), fixtureComputers, fixtureEndpoints, fixtureHostHistory (+18 more)

### Community 71 - "oracle-voice-coordinator.ts"
Cohesion: 0.07
Nodes (25): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnector (+17 more)

### Community 72 - "react"
Cohesion: 0.10
Nodes (31): react, scheduleProposalSummary(), ScheduleRecurrence, ScheduleTarget, drawDiagram(), drawing, MermaidDiagram(), FolderPicker() (+23 more)

### Community 73 - "dreamer-planner.ts"
Cohesion: 0.09
Nodes (35): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+27 more)

### Community 74 - "ScheduleRun"
Cohesion: 0.15
Nodes (7): session(), ScheduleLauncher, SchedulerDispatcher, registerSchedulerRoutes(), holdsSlot(), isInFlight(), ScheduleRun

### Community 75 - "FakeVoiceEngine"
Cohesion: 0.08
Nodes (15): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+7 more)

### Community 76 - "VoicePlayback"
Cohesion: 0.10
Nodes (11): pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio(), validateGeneration() (+3 more)

### Community 77 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 78 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 79 - "schedule-recurrence.ts"
Cohesion: 0.10
Nodes (36): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+28 more)

### Community 80 - "devDependencies"
Cohesion: 0.05
Nodes (39): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+31 more)

### Community 81 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (28): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+20 more)

### Community 82 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (29): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+21 more)

### Community 83 - "controls.tsx"
Cohesion: 0.11
Nodes (32): shortcutKeys(), readStoredShortcuts(), AppShortcutBinding, binding(), bindingLabel(), capturableCode(), capturableCodes, isModifierCode() (+24 more)

### Community 84 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 85 - "SessionKnowledgeStore"
Cohesion: 0.11
Nodes (13): WorkspaceFixtureState, bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeEvents, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateWithPaths(), disk (+5 more)

### Community 86 - "active-sessions.ts"
Cohesion: 0.11
Nodes (30): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+22 more)

### Community 87 - "recovery-resend-durability.test.ts"
Cohesion: 0.06
Nodes (28): fixture(), holdProbe(), fixtures, gate(), releases, restart(), sdkPermissionEvents(), sdkRecoveryEvents() (+20 more)

### Community 88 - "dreamer-service.ts"
Cohesion: 0.09
Nodes (32): DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, DreamerProgressLimits, DreamerFollowUp, DreamerPlannerExecutionInput, DreamerServiceOptions, planWithFingerprints() (+24 more)

### Community 89 - "manager-context.ts"
Cohesion: 0.11
Nodes (30): DreamerProgressEntry, DreamerProgressView, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock() (+22 more)

### Community 90 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (17): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+9 more)

### Community 91 - "PushNotificationService"
Cohesion: 0.13
Nodes (9): start(), PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema (+1 more)

### Community 92 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (22): FakeVoiceEngineCall, VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), connect(), createManager() (+14 more)

### Community 93 - "dependencies"
Cohesion: 0.05
Nodes (37): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @fastify/static, @fastify/websocket, hast-util-to-jsx-runtime, html-url-attributes, onnxruntime-web (+29 more)

### Community 94 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 95 - "response-compression.test.ts"
Cohesion: 0.07
Nodes (20): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), apps (+12 more)

### Community 96 - "oracle-voice-routes.test.ts"
Cohesion: 0.07
Nodes (16): OracleVoiceManager, OracleVoiceRouteOptions, ObservedLocalVoiceBackend, openApps, openSockets, RouteManager, RouteVoiceBackend, runtime() (+8 more)

### Community 97 - "KnowledgeStore"
Cohesion: 0.12
Nodes (14): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+6 more)

### Community 98 - "BackgroundTasksDialog.tsx"
Cohesion: 0.11
Nodes (28): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+20 more)

### Community 99 - "session-prefetch.ts"
Cohesion: 0.10
Nodes (24): browserConnection, ConnectionHints, connectionSparesData(), IdleScheduler, PASSIVE_READS_SINCE, PREFETCH_PASS_BYTES, PREFETCH_SIDEBAR_ROWS, prefetchCandidates() (+16 more)

### Community 100 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (34): assertExactKeys(), cloneState(), DISPOSITIONS, hasExactKeys(), isDisposition(), isEventKind(), isId(), isOrigin() (+26 more)

### Community 101 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 102 - "EngineVoiceBackendSession"
Cohesion: 0.18
Nodes (5): asSessionError(), disconnectCause(), EngineVoiceBackendSession, sameUtterance(), VoiceSessionError

### Community 103 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+24 more)

### Community 104 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (29): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+21 more)

### Community 105 - ".sendInternal"
Cohesion: 0.14
Nodes (23): terminalComposerUnreadable(), backgroundShellsAllow(), busyRowStatus(), captureForReplacement(), capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText() (+15 more)

### Community 106 - "session-resource-providers.test.ts"
Cohesion: 0.09
Nodes (20): cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), claudeFixture(), ClaudeMcpRead (+12 more)

### Community 107 - "session-launcher.ts"
Cohesion: 0.09
Nodes (21): awaitTermination(), LaunchCreations, apps, directories, directory(), runtime(), services, stores (+13 more)

### Community 108 - "closed-sessions.ts"
Cohesion: 0.09
Nodes (18): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, blockParents, CLOSED_SESSION_RETENTION_MS, closedCapitals(), closedSessionContext() (+10 more)

### Community 109 - "manager-structured-memory-search.ts"
Cohesion: 0.11
Nodes (26): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+18 more)

### Community 110 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 111 - "SessionOrderStore"
Cohesion: 0.16
Nodes (12): orderStore(), carried(), laneFrom(), retire(), sameLane(), sessionOrderKey(), SessionOrderState, SessionOrderStore (+4 more)

### Community 112 - "FakeSocket"
Cohesion: 0.08
Nodes (8): OracleVoiceClientDependencies, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse(), VoicePlaybackOptions

### Community 113 - "session-reply-durability.test.ts"
Cohesion: 0.12
Nodes (20): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+12 more)

### Community 114 - "notification-center-service.ts"
Cohesion: 0.10
Nodes (24): NotificationCursors, booleanQuery, filters, params, cursorSchema, durableState(), identity, kind (+16 more)

### Community 115 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 116 - "agent-service.test.ts"
Cohesion: 0.13
Nodes (16): terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+8 more)

### Community 117 - "HubEvent"
Cohesion: 0.09
Nodes (16): ComputerManagerEvents, Seen, PersistedCursor, NotificationRecorder, NotificationCursor, HubEventSource, Row, SdkRestartRecovery (+8 more)

### Community 118 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 119 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (16): cancelManager(), resolveManagerConfirmation(), retryManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+8 more)

### Community 120 - "use-markdown-document.test.tsx"
Cohesion: 0.10
Nodes (13): drawnInParts(), DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), DocumentRenderer, DocumentRendererContext, RendererWorker, synchronousRenderer (+5 more)

### Community 121 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (17): phases, port, app(), directories, headers, launcher, createStartupPhases(), silentStartupPhases (+9 more)

### Community 122 - "ManagerStructuredMemoryStore"
Cohesion: 0.13
Nodes (8): initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMode, ManagerStructuredMemoryStatus

### Community 123 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 124 - "session-directory.ts"
Cohesion: 0.18
Nodes (20): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+12 more)

### Community 125 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 126 - "notification-classifier.ts"
Cohesion: 0.17
Nodes (20): attentionClosed(), attentionSeed(), classifyHostNotification(), classifyHubNotification(), classifyOracleNotification(), classifyScheduleNotification(), HOST_ALERT_MEMORY_DURATION_MS, notificationIdentity() (+12 more)

### Community 127 - "sections.tsx"
Cohesion: 0.13
Nodes (17): AppearanceSetting, NewSessionBackendSetting, getHubHealth(), SettingScope(), HealthCard(), accentThemes, appearanceOptions, notificationScopeOptions (+9 more)

### Community 128 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 129 - "use-markdown-document.ts"
Cohesion: 0.15
Nodes (20): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+12 more)

### Community 130 - "push-notification-service.ts"
Cohesion: 0.12
Nodes (19): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+11 more)

### Community 131 - "session-transcript.ts"
Cohesion: 0.14
Nodes (20): TRANSCRIPT_CARRIED_LIMIT, sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+12 more)

### Community 132 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 133 - "registerSessionKnowledgeRoutes"
Cohesion: 0.14
Nodes (21): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+13 more)

### Community 134 - "ScheduleProposalCards.tsx"
Cohesion: 0.17
Nodes (21): nextOccurrences(), getSchedule(), listScheduleProposals(), resolveScheduleProposal(), days, labels, proposalChanges(), proposalConsequence() (+13 more)

### Community 135 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 136 - "RemoteVoiceClient"
Cohesion: 0.20
Nodes (9): RemoteNodeRedirectError, closeReason(), exactArrayBuffer(), rawDataBuffer(), remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient, RemoteVoiceClientOptions (+1 more)

### Community 137 - "scheduler-dispatcher.ts"
Cohesion: 0.12
Nodes (16): NoopScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS, SchedulerDispatcherOptions, ScheduleStopAcknowledgement, ScheduleTargetUnavailableError, SCHEDULE_RUN_LIMIT (+8 more)

### Community 138 - "pipeline.ts"
Cohesion: 0.14
Nodes (21): partlyHeldRenderer(), render, scope, documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform(), drawSteps() (+13 more)

### Community 139 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (21): CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, copyTask(), isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus() (+13 more)

### Community 140 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (12): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+4 more)

### Community 141 - "PromptCards.tsx"
Cohesion: 0.13
Nodes (16): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+8 more)

### Community 142 - "vite.config.ts"
Cohesion: 0.12
Nodes (12): brotliAsync, compress(), gzipAsync, precompressDirectory(), PrecompressedFile, directories, canaryTests, oracleVoiceAssetNames (+4 more)

### Community 143 - "transport.test.ts"
Cohesion: 0.12
Nodes (14): prefixes, session, trusted, untrusted, BuildAppOptions, ProcessScanContext, HostTelemetryService, readingFixture() (+6 more)

### Community 144 - "host-telemetry.ts"
Cohesion: 0.13
Nodes (19): aggregate, DiskSpaceSchema, HOST_TELEMETRY_CAPABILITY_VERSION, HostHistorySchema, HostInfoSchema, HostMetricAggregate, HostMetricAggregateSchema, HostMetrics (+11 more)

### Community 145 - "NotificationRecord"
Cohesion: 0.19
Nodes (15): NotificationRecord, FeatureEvent, listeners, publishFeatureEvent(), subscribeFeatureEvents(), NotificationGroup, notificationGroups(), NotificationTab (+7 more)

### Community 146 - "session-unread.pw.ts"
Cohesion: 0.12
Nodes (12): bounds(), devices, edgeState(), open(), screenshot(), unreadState(), BACKGROUND_SESSION_ID, fixtureBackgroundTasks (+4 more)

### Community 147 - "workspace-browser.ts"
Cohesion: 0.20
Nodes (16): assertOpenedFilePath(), fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath() (+8 more)

### Community 148 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 149 - "createBackgroundTaskProjector"
Cohesion: 0.22
Nodes (21): addActivity(), attachmentModeValue(), boundedText(), createBackgroundTaskProjector(), endsForegroundTurn(), eventString(), eventTask(), executionModeValue() (+13 more)

### Community 150 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 152 - "NotificationStore"
Cohesion: 0.20
Nodes (5): emptyState(), matchesNotification(), NotificationStore, setup(), NotificationFilter

### Community 153 - "markdown-navigation.ts"
Cohesion: 0.18
Nodes (19): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+11 more)

### Community 154 - "terminal-form-deadline.test.ts"
Cohesion: 0.12
Nodes (15): TerminalFormContinuation, question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture() (+7 more)

### Community 155 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 156 - "session-latency-benchmark.ts"
Cohesion: 0.18
Nodes (17): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+9 more)

### Community 157 - "ManagerProactiveInbox"
Cohesion: 0.22
Nodes (4): ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, nowIso(), openInbox()

### Community 158 - "schedule-notification-service.test.ts"
Cohesion: 0.18
Nodes (6): ScheduleNotificationService, input(), now, run(), ScheduleRunNotification, SchedulerChanged

### Community 159 - "session-knowledge-store.ts"
Cohesion: 0.11
Nodes (18): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+10 more)

### Community 160 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 161 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 162 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 163 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 164 - "HostTelemetrySampler"
Cohesion: 0.20
Nodes (3): HostTelemetrySampler, HostMinuteAggregate, HostSample

### Community 165 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 166 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 167 - "SessionPublications"
Cohesion: 0.23
Nodes (4): sameOrder(), sessionKey(), SessionPublications, taskFingerprint()

### Community 168 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 169 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 170 - "oracle-status.test.ts"
Cohesion: 0.19
Nodes (14): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+6 more)

### Community 171 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 172 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 173 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 174 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 175 - "session-reorder.pw.ts"
Cohesion: 0.13
Nodes (9): center(), computerOrder(), desktop, dropOnto(), longListState(), open(), phone, Point (+1 more)

### Community 176 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 177 - "alerts.test.ts"
Cohesion: 0.15
Nodes (8): HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, computer, observe(), snapshot(), start, sustained(), HOST_ALERT_COOLDOWN_MS

### Community 178 - "server/skill-settings.ts"
Cohesion: 0.19
Nodes (12): builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), scalar(), skillFrontmatter(), SkillRoot, SKILL_SETTINGS_CAPABILITY (+4 more)

### Community 179 - "projection-test-helpers.ts"
Cohesion: 0.21
Nodes (12): BackgroundTaskEventOptions, MAX_BACKGROUND_TASKS, MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH, lifecycleEvent(), subagentShell(), syntheticLog(), checkedBackgroundTasks() (+4 more)

### Community 180 - "SessionScheduleLauncher"
Cohesion: 0.29
Nodes (6): provenance(), recordScheduleProvenance(), SessionScheduleLauncher, ScheduleLaunchRefusedError, ScheduleReconciliation, scheduleProviderUnavailableReason()

### Community 181 - "capture-workbench-review.ts"
Cohesion: 0.14
Nodes (11): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, fixtureSessions (+3 more)

### Community 182 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot(), started() (+4 more)

### Community 183 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 184 - ".snapshot"
Cohesion: 0.30
Nodes (8): readBounded(), revision(), registerSkillSettingsRoutes(), SkillSettingsTarget, settingsObject(), SkillSettingsError, SkillSettingsSnapshot, SkillToggle

### Community 185 - "check-workspace-review-regressions.ts"
Cohesion: 0.15
Nodes (11): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+3 more)

### Community 186 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 187 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 188 - "recordValue"
Cohesion: 0.22
Nodes (14): backgroundHandoff(), booleanValue(), errorValue(), notificationKind(), parsedValue(), rawTailText(), recordValue(), shellIdFromFooter() (+6 more)

### Community 189 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 190 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 191 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 192 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 193 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 194 - ".observe"
Cohesion: 0.21
Nodes (7): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId()

### Community 195 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 197 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 198 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 199 - "RecentlyClosed.test.tsx"
Cohesion: 0.19
Nodes (9): act(), audit(), closed, computers, now, observeResizes(), Row(), session() (+1 more)

### Community 200 - "recently-closed.pw.ts"
Cohesion: 0.23
Nodes (9): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), open(), row() (+1 more)

### Community 201 - "use-oracle-attachments.ts"
Cohesion: 0.35
Nodes (11): removeManagerFile(), uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake() (+3 more)

### Community 202 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 203 - "fixture-frontend.ts"
Cohesion: 0.24
Nodes (6): root, script, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend()

### Community 204 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 206 - "command-catalog-cache.test.ts"
Cohesion: 0.25
Nodes (9): at(), Catalog, deferred(), fixture(), fixtures, listed(), releases, runtime() (+1 more)

### Community 207 - "isRecord"
Cohesion: 0.29
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 209 - "tmux-errors.test.ts"
Cohesion: 0.24
Nodes (9): containedServer(), directories, errno(), { execute }, files, links, listener(), places() (+1 more)

### Community 210 - "static-files.ts"
Cohesion: 0.27
Nodes (6): RFC-9110, AcceptedEncodings, FILE_HEADERS, isApiPath(), isAppleTouchIconProbe(), registerStaticFiles()

### Community 211 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 212 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 213 - "notification-center.integration.test.ts"
Cohesion: 0.22
Nodes (7): center(), directories, directory(), hub(), now, runtimes, trusted

### Community 214 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 215 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 216 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 217 - "ManagerProactiveInboxValidationError"
Cohesion: 0.28
Nodes (6): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions()

### Community 218 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 219 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 220 - "pipeline.test.tsx"
Cohesion: 0.28
Nodes (6): components, drawn(), drawnPage(), fixtures, html(), today()

### Community 221 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 222 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 223 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 224 - "SkillSettingsService"
Cohesion: 0.29
Nodes (4): applications, directories, fixture(), SkillSettingsService

### Community 225 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 226 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 227 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 229 - "session-order-routes.test.ts"
Cohesion: 0.43
Nodes (6): directories, fakeManager(), hub(), settled(), until(), upserted()

### Community 230 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 231 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 232 - "skill-settings-jsonc.ts"
Cohesion: 0.60
Nodes (4): document(), parseSkillSettings(), replaceDisabledSkills(), Token

### Community 233 - "use-foreground-handoff.ts"
Cohesion: 0.47
Nodes (3): foregroundHandoffTimeoutMs, Handoff, useForegroundHandoff()

### Community 234 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 235 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 236 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1490 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1485 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2511 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `SessionDetail`, `AgentService`, `SessionService`, `ManagedSession`, `transport.test.ts`, `oracle-voice-soak.ts`, `ManagerStore`, `NotificationStore`, `shared/settings-profile.ts`, `ManagerAgent`, `hub-routes.ts`, `ManagerProactiveInbox`, `transcription-service.ts`, `schedule-notification-service.test.ts`, `node-routes.ts`, `HostTelemetrySampler`, `ManagerMessage`, `oracle-voice-worker.ts`, `oracle-task-store.ts`, `feature-flags.ts`, `alerts.test.ts`, `SchedulerStore`, `SessionScheduleLauncher`, `ManagerEvent`, `TerminalSessionController`, `DreamerService`, `.snapshot`, `tmux-errors.integration.test.ts`, `service.ts`, `NotificationCenterService`, `ScheduleRun`, `oracle-voice-config.ts`, `static-files.ts`, `SessionKnowledgeStore`, `dreamer-routes.ts`, `PushNotificationService`, `response-compression.test.ts`, `SkillSettingsService`, `KnowledgeStore`, `SessionOrderStore`, `ManagerStructuredMemoryStore`, `cli-canary.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `remote-node-client.ts` to `service.ts`, `multi-node.test.ts`, `RemoteVoiceClient`, `contracts.ts`, `SessionService`, `ManagedSession`, `computer-manager.ts`, `hub-routes.ts`, `node-routes.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `CopilotSessionLike`, `SessionDetail`, `agent-service.ts`, `multi-node.test.ts`, `contracts.ts`, `SessionService`, `background-task-adapter.ts`, `hub-routes.ts`, `computer-manager.ts`, `session-latency-benchmark.ts`, `.takeInTranscript`, `agent-service.test.ts`, `TerminalSessionController`, `recovery-resend-durability.test.ts`, `session-directory.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1490 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.028804589342705935 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.0365296803652968 - nodes in this community are weakly interconnected._
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
