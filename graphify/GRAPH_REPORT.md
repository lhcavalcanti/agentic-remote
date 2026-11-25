# Agentic Remote - Graphify code map

Snapshot: `9f995a9f40cf7f393bbf0288af323a5d99008e1d9922639e5e643068c3134dd7`

Source checkout: `1229d8ab5cfaa7fd20a9d3bb6ab659c9ed43807e`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 681 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 681 files · ~1,208,375 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9488 nodes · 27353 edges · 285 communities (239 shown, 28 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1346 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- AppWorkspace
- SessionStore
- computer-manager.ts
- SessionDetail
- agent-service.ts
- App.test.tsx
- node-routes.ts
- App.tsx
- agent-service.test.ts
- session-presentation.ts
- HubEvent
- manager.ts
- .takeInTranscript
- claude-agent-service.ts
- ManagedSession
- manager-tools.ts
- background-task-adapter.ts
- contracts.ts
- VoiceAudioFrame
- session-launcher.ts
- agentic-remote-promotion-monitor
- dreamer-store.ts
- oracle-voice-child.ts
- terminal-session.ts
- ManagerAgent
- oracle-voice-soak.ts
- ManagerStore
- shared/settings-profile.ts
- client.ts
- ManagerAssistant.tsx
- schedules.ts
- OracleVoiceCoordinator
- terminal-session.test.ts
- oracle-voice-session.ts
- oracle-task-store.ts
- hub-routes.ts
- oracle-voice-integration.test.ts
- .sendInternal
- oracle-voice-worker.ts
- BackgroundTaskSnapshot
- queued-dispatch.test.ts
- manager-agent.ts
- FakeVoiceEngine
- tmux-test-helpers.ts
- AppSettingsDialog.tsx
- RemoteNodeClient
- manager-structured-memory-validation.ts
- session-directory.ts
- DreamerService
- OracleDreamer.tsx
- TmuxTerminalSessionController
- oracle-voice-benchmark.ts
- oracle-voice.ts
- src/settings-profile.ts
- feature-flags.ts
- ProviderSessionService
- RecentlyClosed.tsx
- agentic-remote
- SchedulerStore
- dreamer-progress.ts
- host-telemetry.ts
- server/skill-settings.ts
- schedule-launcher.ts
- ui-locks.pw.ts
- processes.ts
- agentic-remote-gate
- oracle-voice-coordinator.ts
- ScheduleRun
- bundle
- active-sessions.ts
- sampler.ts
- normalizeKnowledgeRelativePath
- FakeVoiceController
- request
- app.ts
- transcription-service.ts
- VoicePlayback
- workspace-fixtures.ts
- shell.ts
- lib.rs
- manager-proactive-coordinator.ts
- schedule-recurrence.ts
- client.test.ts
- dependencies
- devDependencies
- terminal-startup-queue.test.ts
- oracle-voice-security.test.ts
- ActivityRow.test.tsx
- agentic-remote-promotion-setup
- manager-agent.test.ts
- PushNotificationService
- config.rs
- react
- oracle-voice-child.test.ts
- knowledge-tree.ts
- session-prefetch.ts
- dreamer-service.ts
- manager-proactive-inbox.ts
- manager-structured-memory.ts
- session-transcript.ts
- session-resource-routes.test.ts
- ManagerEvent
- oracle-voice-routes.ts
- remote-voice-client.ts
- transport.test.ts
- controls.tsx
- .replyUserInputInternal
- EngineVoiceBackendSession
- markdown-navigation.ts
- setupWorkspaceFixture
- oracle-voice-segments.ts
- SessionOrderStore
- sections.tsx
- dreamer-planner.ts
- session-store.ts
- session-patch-browser.ts
- capture-workspace.ts
- notification-classifier.ts
- session-categories.ts
- use-oracle-conversation.test.tsx
- renderer.ts
- real-voice.ts
- cli-canary.ts
- ComputerSummary
- scripts
- oracle-voice-config.ts
- reader.ts
- manager-structured-memory-search.ts
- HostMonitorView.test.tsx
- use-markdown-document.ts
- compilerOptions
- ManagerStructuredMemoryStore
- session-knowledge-store.ts
- session-reply-durability.test.ts
- SessionStatus
- response-compression.test.ts
- SessionCategoryStore
- use-oracle-attachments.ts
- notification-center.ts
- vite.config.ts
- startup-phases.test.ts
- KnowledgeStore
- ManagerProactiveInbox
- notification-store.ts
- oracle-voice-tickets.ts
- refusal-metrics.ts
- compilerOptions
- full-gate.test.ts
- schedule-notification-service.test.ts
- PromptCards.tsx
- compilerOptions
- ORACLE_VOICE_SAMPLE_RATE
- registryKey
- SessionKnowledgeStore
- session-store-providers.test.ts
- OnlineRecognizer
- ActivityDetails.tsx
- pipeline.ts
- MessageTime.tsx
- compilerOptions
- compilerOptions
- RuntimeModelOption
- oracle-status.test.ts
- ManagerMemory
- NotificationStore
- dreamer-schedule.ts
- file-upload-routes.ts
- ManagerAttachment
- promotion-monitor.test.ts
- closed-sessions.ts
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- alerts.test.ts
- session-knowledge-routes.ts
- .persist
- session-reorder.pw.ts
- closed-session-sweeper.ts
- registerSessionKnowledgeRoutes
- NotificationCenterService
- recovery-resend-durability.test.ts
- session-category-routes.ts
- SessionKnowledgeBinding
- RuntimeStatus.tsx
- package.json
- session-unread.pw.ts
- terminal-form-deadline.test.ts
- session-latency-benchmark.ts
- oracle-voice-assets.test.ts
- oracle-voice-routes.test.ts
- SessionOriginBadge.test.tsx
- pipeline.test.tsx
- pending-echo.ts
- capture-workbench-review.ts
- check-workspace-review-regressions.ts
- fake-vad.ts
- desktop.json
- knowledge-store.ts
- LargeSessionService
- session-resource-clear.test.ts
- use-session-categories.ts
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- session-scope.ts
- Pcm16Resampler
- node:fs/promises
- document-render.pw.ts
- recently-closed.pw.ts
- session-categories.pw.ts
- ManagerProactiveInboxValidationError
- manager-proactive-inbox.test.ts
- .initialize
- html-preview.ts
- sign-in-expired.pw.ts
- command-catalog-cache.test.ts
- SessionAdmissions
- session-store-serialization.test.ts
- tmux-errors.test.ts
- static-files.ts
- dataset
- generate-pwa-icons.ts
- notification-center.integration.test.ts
- bridge.rs
- ComputersDialog.tsx
- transcribeAudio
- dreamer-routes.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- use-markdown-document.test.tsx
- doctor-cli.test.ts
- release-publication.test.ts
- session-list-collisions.test.ts
- composer-layout.test.ts
- HostTelemetryClock
- manager-structured-memory-performance.test.ts
- session-order-routes.test.ts
- settings.ts
- DocumentViewControls.tsx
- use-foreground-handoff.ts
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- HubEventSource
- session-category-store.test.ts
- appearance.ts
- FakeRecorder
- MemoryStorage
- terminal-send-uncertainty.test.ts
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
1. `AppWorkspace()` - 367 edges
2. `SessionDetail` - 328 edges
3. `AgentService` - 318 edges
4. `SessionStore` - 218 edges
5. `ManagedSession` - 190 edges
6. `buildApp()` - 143 edges
7. `ClaudeAgentService` - 133 edges
8. `registerHubRoutes()` - 116 edges
9. `ComputerManager` - 108 edges
10. `ManagerAgent` - 101 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `instrument()` --indirect_call--> `document()`  [INFERRED]
  e2e/session-patch-browser.ts → server/skill-settings-jsonc.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (285 total, 28 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (20): agentMode(), AgentService, commandShortcut(), isTerminalNotReadyRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, sessionInUseConflictMessage(), sessionInUseQueueMessage() (+12 more)

### Community 1 - "AppWorkspace"
Cohesion: 0.03
Nodes (183): newSessionCategoryId(), sessionCategoryOf(), closeSession(), listClosedSessions(), replyPermission(), saveHiddenSessionVisibility(), saveSessionHidden(), saveSessionUnread() (+175 more)

### Community 2 - "SessionStore"
Cohesion: 0.03
Nodes (69): storage(), fixture(), restart(), runtimeInfoMatches(), fixture(), connect(), createStore(), deferred() (+61 more)

### Community 3 - "computer-manager.ts"
Cohesion: 0.03
Nodes (46): activityDetailsUnavailable(), activityNotInLog(), refusal(), updateComputerForActivityDetails(), ClaudeAgentServiceEvents, RemoteSessionListing, ClaudeFakeSessionService, directories (+38 more)

### Community 4 - "SessionDetail"
Cohesion: 0.04
Nodes (32): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), PendingClaudeReply, cleanupFixtures(), directories, fixture(), queryHandle() (+24 more)

### Community 5 - "agent-service.ts"
Cohesion: 0.03
Nodes (110): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+102 more)

### Community 6 - "App.test.tsx"
Cohesion: 0.03
Nodes (111): addKnowledgeRoot(), askSession(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), checkHubSignIn(), clearConversation(), configureRetention() (+103 more)

### Community 7 - "node-routes.ts"
Cohesion: 0.03
Nodes (89): toolCallIdSchema, ClaudeSdk, HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers (+81 more)

### Community 8 - "App.tsx"
Cohesion: 0.03
Nodes (88): isManagerEvent(), NewSessionBackendSetting, ActivityRowStates, sidebarResizeMove(), bindingMatches(), clampSidebarWidth(), clearStored(), clipboardImageExtensions (+80 more)

### Community 9 - "agent-service.test.ts"
Cohesion: 0.03
Nodes (68): complete(), event(), sessionWithLog(), start(), CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures (+60 more)

### Community 10 - "session-presentation.ts"
Cohesion: 0.04
Nodes (79): computerOrder(), SessionInterruptionCause, saveSessionOrderLane(), handleDragEnd(), stepSession(), KnowledgeRootSelector(), root, dragsRow (+71 more)

### Community 11 - "HubEvent"
Cohesion: 0.04
Nodes (59): ComputerManagerEvents, nextVoiceControl(), apps, directories, FakeManager, fixture(), trusted, changedInPlace() (+51 more)

### Community 12 - "manager.ts"
Cohesion: 0.04
Nodes (41): FakeManager, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, apps, directories, ProactiveManager (+33 more)

### Community 13 - ".takeInTranscript"
Cohesion: 0.05
Nodes (52): backgroundShellsEvidence(), contextChangedInEvents(), createPendingUserInputTracker(), createStatusTracker(), at(), directories, finish(), launch() (+44 more)

### Community 14 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (64): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, releases (+56 more)

### Community 15 - "ManagedSession"
Cohesion: 0.08
Nodes (12): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, updateComputerForLaunchIdentity(), normalizeNodeUrl() (+4 more)

### Community 16 - "manager-tools.ts"
Cohesion: 0.04
Nodes (46): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+38 more)

### Community 17 - "background-task-adapter.ts"
Cohesion: 0.06
Nodes (73): DeferredSession, addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress (+65 more)

### Community 18 - "contracts.ts"
Cohesion: 0.04
Nodes (72): idleDaysSchema, mergeSessionRetention(), sessionRetentionPatchSchema, sessionRetentionSchema, ActivityDetailArguments, ActivityDetailText, AddKnowledgeRootInput, BackgroundTaskAttachmentMode (+64 more)

### Community 19 - "VoiceAudioFrame"
Cohesion: 0.05
Nodes (32): QueuedAudio, BrowserCaptureOptions, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, VoiceAudioFrame, VoiceClientControl (+24 more)

### Community 20 - "session-launcher.ts"
Cohesion: 0.03
Nodes (45): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+37 more)

### Community 21 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 22 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (43): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+35 more)

### Community 23 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (40): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+32 more)

### Community 24 - "terminal-session.ts"
Cohesion: 0.05
Nodes (76): BackgroundShellsEvidence, boxedComposerFrame(), busyRowStatus(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText() (+68 more)

### Community 25 - "ManagerAgent"
Cohesion: 0.07
Nodes (14): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), capturePrompt() (+6 more)

### Community 26 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 27 - "ManagerStore"
Cohesion: 0.05
Nodes (31): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+23 more)

### Community 28 - "shared/settings-profile.ts"
Cohesion: 0.06
Nodes (53): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), profileStore(), updateSchema (+45 more)

### Community 29 - "client.ts"
Cohesion: 0.08
Nodes (22): ORACLE_VOICE_CONNECTION_TIMEOUT_MS, captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord(), isTicket() (+14 more)

### Community 30 - "ManagerAssistant.tsx"
Cohesion: 0.05
Nodes (55): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline() (+47 more)

### Community 31 - "schedules.ts"
Cohesion: 0.06
Nodes (59): State, stateSchema, timestamp, action, create, existing, metadata, scheduleProposalInputSchema (+51 more)

### Community 32 - "OracleVoiceCoordinator"
Cohesion: 0.09
Nodes (6): errorMessage(), OracleVoiceBackendConnection, OracleVoiceCoordinator, PendingFinalTurn, withTimeout(), VoiceTurnState

### Community 33 - "terminal-session.test.ts"
Cohesion: 0.05
Nodes (55): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+47 more)

### Community 34 - "oracle-voice-session.ts"
Cohesion: 0.04
Nodes (28): apps, directories, voiceBackend(), FakeVoiceEngineFactory, VoiceEngineFactory, GatedVoiceEngineFactory, ObservedLocalVoiceBackend, RouteVoiceBackend (+20 more)

### Community 35 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (44): DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+36 more)

### Community 36 - "hub-routes.ts"
Cohesion: 0.04
Nodes (55): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+47 more)

### Community 37 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+23 more)

### Community 38 - ".sendInternal"
Cohesion: 0.08
Nodes (47): activeBottomFrame(), backgroundShellsAllow(), captureBeforeDeadline(), captureForReplacement(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerHoldsText() (+39 more)

### Community 39 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (27): benchmarkGroup(), EnabledOracleVoiceConfig, VoiceEngineSession, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage() (+19 more)

### Community 40 - "BackgroundTaskSnapshot"
Cohesion: 0.06
Nodes (40): backgroundTaskNotFound(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), listedBackgroundTask(), readBackgroundTaskFrom(), taskFingerprint() (+32 more)

### Community 41 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (33): openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), QueuedDelivery, QueuedDispatchTarget (+25 more)

### Community 42 - "manager-agent.ts"
Cohesion: 0.06
Nodes (43): DreamerProgressEntry, DreamerProgressView, automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung (+35 more)

### Community 43 - "FakeVoiceEngine"
Cohesion: 0.06
Nodes (26): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceSttEngine, VoiceTtsEngine, VoiceUtteranceAudioFrame (+18 more)

### Community 44 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (50): directories, Screens, foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity() (+42 more)

### Community 45 - "AppSettingsDialog.tsx"
Cohesion: 0.07
Nodes (55): activateSession(), createSession(), deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), listDirectories(), listHistory(), savePushSubscription() (+47 more)

### Community 46 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (14): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, requestBytes(), client(), servers, session (+6 more)

### Community 47 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 48 - "session-directory.ts"
Cohesion: 0.09
Nodes (38): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath() (+30 more)

### Community 49 - "DreamerService"
Cohesion: 0.11
Nodes (12): DreamerMemoryMetadata, setup(), boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), uniqueSessionRefs() (+4 more)

### Community 50 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (46): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+38 more)

### Community 51 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (19): startAgentAfterClear(), afterExit(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, formReplyExpired(), listTmuxSessions() (+11 more)

### Community 52 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 53 - "oracle-voice.ts"
Cohesion: 0.08
Nodes (40): exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), capabilities, closeServers, exactArrayBuffer(), sockets (+32 more)

### Community 54 - "src/settings-profile.ts"
Cohesion: 0.09
Nodes (25): NewSessionRuntime, sameSettingValue(), SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, statuslineItems (+17 more)

### Community 55 - "feature-flags.ts"
Cohesion: 0.10
Nodes (32): hub(), AppVersion, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable() (+24 more)

### Community 57 - "RecentlyClosed.tsx"
Cohesion: 0.06
Nodes (36): session(), changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame() (+28 more)

### Community 58 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 59 - "SchedulerStore"
Cohesion: 0.13
Nodes (9): enableSchedulerTools(), fixture(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, ScheduleProposal, Schedule (+1 more)

### Community 60 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, DreamerProgressSource (+11 more)

### Community 61 - "host-telemetry.ts"
Cohesion: 0.08
Nodes (29): HostRequest, HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError(), HostTelemetryTarget, aggregate, DiskSpaceSchema, HOST_TELEMETRY_CAPABILITY_VERSION (+21 more)

### Community 62 - "server/skill-settings.ts"
Cohesion: 0.09
Nodes (28): builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills(), Token (+20 more)

### Community 63 - "schedule-launcher.ts"
Cohesion: 0.09
Nodes (27): LaunchPrimitives, provenance(), recordScheduleProvenance(), ScheduleLauncherHost, ScheduleProvenance, scheduleSessionTitle(), SessionScheduleLauncher, NoopScheduleLauncher (+19 more)

### Community 64 - "ui-locks.pw.ts"
Cohesion: 0.08
Nodes (30): { values }, fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns, fixtureSchedules, ComposerPart, expectTouchTargets(), lockedScreenshot (+22 more)

### Community 65 - "processes.ts"
Cohesion: 0.08
Nodes (26): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessStat, expectProc(), ProcessFixture, processStatFixture() (+18 more)

### Community 66 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 67 - "oracle-voice-coordinator.ts"
Cohesion: 0.06
Nodes (26): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnector (+18 more)

### Community 68 - "ScheduleRun"
Cohesion: 0.14
Nodes (7): WorkspaceFixtureOptions, session(), SchedulerDispatcher, registerSchedulerRoutes(), holdsSlot(), isInFlight(), ScheduleRun

### Community 69 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 70 - "active-sessions.ts"
Cohesion: 0.10
Nodes (37): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+29 more)

### Community 71 - "sampler.ts"
Cohesion: 0.09
Nodes (28): counter(), counterDelta(), CpuCounters, cpuUtilization(), DeviceByteCounters, DeviceCounters, deviceRates(), isWholeDisk() (+20 more)

### Community 72 - "normalizeKnowledgeRelativePath"
Cohesion: 0.08
Nodes (32): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+24 more)

### Community 73 - "FakeVoiceController"
Cohesion: 0.09
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 74 - "request"
Cohesion: 0.10
Nodes (33): scheduleProposalSummary(), CLAUDE_SCHEDULE_UNAVAILABLE_REASON, scheduleProviderUnavailableReason(), ScheduleTarget, request(), FeatureEvent, listeners, publishFeatureEvent() (+25 more)

### Community 75 - "app.ts"
Cohesion: 0.08
Nodes (23): buildApp(), errorStatusCode(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), directories, runtimes, trusted (+15 more)

### Community 76 - "transcription-service.ts"
Cohesion: 0.08
Nodes (26): collect(), oversized(), statusCodeOf(), CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner() (+18 more)

### Community 77 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 78 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (27): oracleHostStatusFixture(), BACKGROUND_SESSION_ID, documents, FIXTURE_NOW, fixtureArguments(), fixtureComputers, fixtureEndpoints, fixtureHostHistory (+19 more)

### Community 79 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 80 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 81 - "manager-proactive-coordinator.ts"
Cohesion: 0.11
Nodes (13): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, SessionLifecycle, directories (+5 more)

### Community 82 - "schedule-recurrence.ts"
Cohesion: 0.11
Nodes (36): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+28 more)

### Community 83 - "client.test.ts"
Cohesion: 0.07
Nodes (11): HUB_SIGN_IN_EXPIRED_MESSAGE, OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 84 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 85 - "devDependencies"
Cohesion: 0.05
Nodes (39): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+31 more)

### Community 86 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (29): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+21 more)

### Community 87 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (23): VoiceStartUtterance, SocketMessage, apps, BlockingEngine, config, configFixture(), connect(), createManager() (+15 more)

### Community 88 - "ActivityRow.test.tsx"
Cohesion: 0.10
Nodes (26): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, TOOL_CALL_ID_PATTERN, toolCallIdFromActivityId(), ActivityStatus, activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+18 more)

### Community 89 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 90 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (19): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail(), FakeClient (+11 more)

### Community 91 - "PushNotificationService"
Cohesion: 0.13
Nodes (9): start(), PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema (+1 more)

### Community 92 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 93 - "react"
Cohesion: 0.10
Nodes (16): react, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions(), ContextRing(), QueuedPromptList(), SendControl() (+8 more)

### Community 94 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (14): createVoiceWorker(), PiperProcess, childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream (+6 more)

### Community 95 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+26 more)

### Community 96 - "session-prefetch.ts"
Cohesion: 0.09
Nodes (25): browserConnection, ConnectionHints, connectionSparesData(), IdleScheduler, PASSIVE_READS_SINCE, PREFETCH_PASS_BYTES, PREFETCH_SIDEBAR_ROWS, prefetchCandidates() (+17 more)

### Community 97 - "dreamer-service.ts"
Cohesion: 0.08
Nodes (24): DREAMER_MAX_ITEMS, DreamerMemoryMetadataRecord, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), DreamerProgressLimits, DreamerPlannerExecutionInput, DreamerServiceOptions (+16 more)

### Community 98 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (35): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, eventId(), hasExactKeys(), isDisposition(), isEventKind() (+27 more)

### Community 99 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (29): initializeManagerStructuredMemory(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+21 more)

### Community 100 - "session-transcript.ts"
Cohesion: 0.10
Nodes (30): TRANSCRIPT_CARRIED_LIMIT, applyComputerSnapshot(), computerAdded(), computerRemoved(), discardUnpairedComputers(), forgetComputerKnowledge(), liftUnpairedTombstones(), tombstoneUnpairedSession() (+22 more)

### Community 101 - "session-resource-routes.test.ts"
Cohesion: 0.08
Nodes (16): DelegatedTranscriptionOptions, DelegatedTranscriptionService, hubComputer, workstation, apps, dataDirectory(), directories, pairedFixture() (+8 more)

### Community 102 - "ManagerEvent"
Cohesion: 0.09
Nodes (23): ManagerEventSource, NotificationRecorder, trusted, brief(), OracleEventSource, PushPolicy, PushSender, PushState (+15 more)

### Community 103 - "oracle-voice-routes.ts"
Cohesion: 0.12
Nodes (31): sendNodeVoiceOutput(), limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode() (+23 more)

### Community 104 - "remote-voice-client.ts"
Cohesion: 0.15
Nodes (15): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError() (+7 more)

### Community 105 - "transport.test.ts"
Cohesion: 0.09
Nodes (20): prefixes, session, trusted, untrusted, BuildAppOptions, ProcessScanContext, registerHostTelemetryRoutes(), HostTelemetryService (+12 more)

### Community 106 - "controls.tsx"
Cohesion: 0.12
Nodes (30): shortcutKeys(), readStoredShortcuts(), AppShortcutBinding, binding(), bindingLabel(), capturableCode(), capturableCodes, isModifierCode() (+22 more)

### Community 107 - ".replyUserInputInternal"
Cohesion: 0.12
Nodes (8): isUncertainDelivery(), PendingUserInputTracker, persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), TerminalFormReplyError, PendingUserInput, deliveryUncertaintyFromError()

### Community 108 - "EngineVoiceBackendSession"
Cohesion: 0.20
Nodes (3): asSessionError(), EngineVoiceBackendSession, VoiceSessionError

### Community 109 - "markdown-navigation.ts"
Cohesion: 0.12
Nodes (29): followMarkdownLink(), KnowledgeReader(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), navigateDocument(), BreadcrumbSegment, breadcrumbSegments() (+21 more)

### Community 110 - "setupWorkspaceFixture"
Cohesion: 0.08
Nodes (15): desktop, devices, long, open(), phone, veryLong, devices, markedState() (+7 more)

### Community 111 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 112 - "SessionOrderStore"
Cohesion: 0.15
Nodes (13): stores(), orderStore(), carried(), laneFrom(), retire(), sameLane(), sessionOrderKey(), SessionOrderState (+5 more)

### Community 113 - "sections.tsx"
Cohesion: 0.12
Nodes (20): AppearanceSetting, getHubHealth(), listComputerSkills(), toggleComputerSkill(), PreviewFeaturesSettings(), HealthCard(), accentThemes, appearanceOptions (+12 more)

### Community 114 - "dreamer-planner.ts"
Cohesion: 0.13
Nodes (28): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+20 more)

### Community 115 - "session-store.ts"
Cohesion: 0.08
Nodes (29): activityDuration(), activityResultPreview(), cloneSessionWindow(), emptyRetirements, freezeCommitted(), freezeDeep(), interruptionMessage(), isSameInterruption() (+21 more)

### Community 116 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 117 - "capture-workspace.ts"
Cohesion: 0.14
Nodes (23): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+15 more)

### Community 118 - "notification-classifier.ts"
Cohesion: 0.16
Nodes (20): attentionClosed(), attentionSeed(), classifyHostNotification(), classifyHubNotification(), classifyOracleNotification(), HOST_ALERT_MEMORY_DURATION_MS, NotificationCursors, notificationIdentity() (+12 more)

### Community 119 - "session-categories.ts"
Cohesion: 0.16
Nodes (24): CategoryState, Fields, isRecord(), parseState(), validName(), applySessionCategoryChange(), clamp(), existing() (+16 more)

### Community 120 - "use-oracle-conversation.test.tsx"
Cohesion: 0.12
Nodes (13): getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability, defaults (+5 more)

### Community 121 - "renderer.ts"
Cohesion: 0.11
Nodes (15): render, scope, DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), defaultDocumentRenderer(), DocumentRenderer, DocumentRendererContext (+7 more)

### Community 122 - "real-voice.ts"
Cohesion: 0.13
Nodes (11): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+3 more)

### Community 123 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 124 - "ComputerSummary"
Cohesion: 0.12
Nodes (5): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation, ComputerSummary

### Community 125 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 126 - "oracle-voice-config.ts"
Cohesion: 0.14
Nodes (22): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+14 more)

### Community 127 - "reader.ts"
Cohesion: 0.15
Nodes (19): detectWsl(), parseDataMount(), createLinuxHostTelemetryReader(), errorCode(), HostTelemetryProcFile, hostTelemetryProcFiles, HostTelemetryReaderOptions, HostTelemetryReading (+11 more)

### Community 128 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 129 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 130 - "use-markdown-document.ts"
Cohesion: 0.16
Nodes (19): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+11 more)

### Community 131 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 132 - "ManagerStructuredMemoryStore"
Cohesion: 0.22
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMetadataSnapshot, ManagerStructuredMemoryMutationResult, ManagerStructuredMemorySearchResult, ManagerStructuredMemoryState

### Community 133 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+12 more)

### Community 134 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 135 - "SessionStatus"
Cohesion: 0.11
Nodes (21): Seen, ManagerProactiveInboxObservation, PersistedCursor, NotificationCursor, message(), Row, sendLikeTheApp(), SdkRestartRecovery (+13 more)

### Community 136 - "response-compression.test.ts"
Cohesion: 0.13
Nodes (19): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), apps (+11 more)

### Community 137 - "SessionCategoryStore"
Cohesion: 0.23
Nodes (8): registerSessionCategoryRoutes(), SessionCategoryRouteOptions, members(), key(), refused(), remember(), SessionCategoryStore, SessionCategoriesSnapshot

### Community 138 - "use-oracle-attachments.ts"
Cohesion: 0.17
Nodes (20): codeExtensions, fileTypes, managerFileValidationError(), MAX_MANAGER_FILE_BYTES, MAX_MANAGER_TEXT_BYTES, textTypes, removeManagerFile(), uploadManagerFile() (+12 more)

### Community 139 - "notification-center.ts"
Cohesion: 0.18
Nodes (16): defaultNotificationKindPreference, NotificationKind, NotificationKindPreference, NotificationRecord, NotificationsChanged, NotificationSeverity, NotificationGroup, notificationGroups() (+8 more)

### Community 140 - "vite.config.ts"
Cohesion: 0.12
Nodes (12): brotliAsync, compress(), gzipAsync, precompressDirectory(), PrecompressedFile, directories, canaryTests, oracleVoiceAssetNames (+4 more)

### Community 141 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (13): phases, port, app(), createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address (+5 more)

### Community 142 - "KnowledgeStore"
Cohesion: 0.21
Nodes (5): KnowledgeStore, parseMetadata(), readOptional(), fixture(), createHub()

### Community 143 - "ManagerProactiveInbox"
Cohesion: 0.19
Nodes (8): ManagerProactiveInbox, ManagerProactiveInboxCapacityError, ManagerProactiveInboxScopeError, namespaceId(), nowIso(), publicEvent(), openInbox(), validateLimit()

### Community 144 - "notification-store.ts"
Cohesion: 0.11
Nodes (18): booleanQuery, filters, params, cursorSchema, durableState(), emptyState(), identity, kind (+10 more)

### Community 145 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 146 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 147 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 148 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 149 - "schedule-notification-service.test.ts"
Cohesion: 0.18
Nodes (7): classifyScheduleNotification(), ScheduleNotificationService, input(), now, run(), ScheduleRunNotification, SchedulerChanged

### Community 150 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 151 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 152 - "ORACLE_VOICE_SAMPLE_RATE"
Cohesion: 0.13
Nodes (9): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, config, VoiceEngineEvent (+1 more)

### Community 153 - "registryKey"
Cohesion: 0.20
Nodes (4): JournalRecorder, sessionTask(), applySessionReplacement(), registryKey()

### Community 155 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession() (+1 more)

### Community 156 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 157 - "ActivityDetails.tsx"
Cohesion: 0.21
Nodes (17): activityDetailFailure, detailKey(), formatBytes(), keep(), kept, keptActivityDetail(), loadActivityDetail(), peekActivityDetail() (+9 more)

### Community 158 - "pipeline.ts"
Cohesion: 0.17
Nodes (19): openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform() (+11 more)

### Community 159 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 160 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 161 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 162 - "RuntimeModelOption"
Cohesion: 0.18
Nodes (13): RuntimeModelOption, getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus() (+5 more)

### Community 163 - "oracle-status.test.ts"
Cohesion: 0.18
Nodes (15): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+7 more)

### Community 164 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 165 - "NotificationStore"
Cohesion: 0.24
Nodes (4): matchesNotification(), NotificationStore, setup(), NotificationFilter

### Community 166 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 167 - "file-upload-routes.ts"
Cohesion: 0.18
Nodes (10): FileUploadError, registerFileUploadRoutes(), SessionParams, registerTranscriptionRoutes(), transcriptionMultipartOptions, extension(), MAX_SESSION_FILE_BYTES, sessionFileValidationError() (+2 more)

### Community 168 - "ManagerAttachment"
Cohesion: 0.25
Nodes (8): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), managerFileType(), ManagerAttachment

### Community 169 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 170 - "closed-sessions.ts"
Cohesion: 0.18
Nodes (15): blockParents, CLOSED_SESSION_RETENTION_DAYS, closedCapitals(), closedSessionContext(), closedSessionExpiresAt(), excerpt(), head(), htmlElements (+7 more)

### Community 171 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 172 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 173 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 174 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 175 - "alerts.test.ts"
Cohesion: 0.15
Nodes (8): HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, computer, observe(), snapshot(), start, sustained(), HOST_ALERT_COOLDOWN_MS

### Community 176 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 177 - ".persist"
Cohesion: 0.21
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 178 - "session-reorder.pw.ts"
Cohesion: 0.14
Nodes (8): center(), desktop, dropOnto(), longListState(), open(), phone, Point, studioLane()

### Community 179 - "closed-session-sweeper.ts"
Cohesion: 0.17
Nodes (5): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS

### Community 180 - "registerSessionKnowledgeRoutes"
Cohesion: 0.26
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 182 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 183 - "session-category-routes.ts"
Cohesion: 0.12
Nodes (11): createSchema, deleteSchema, keys(), moveSchema, name, paramsSchema, parse(), revision (+3 more)

### Community 184 - "SessionKnowledgeBinding"
Cohesion: 0.16
Nodes (10): SessionKnowledgeConflictError, SessionKnowledgeEvents, disk, fixture(), fixtures, releases, root(), SessionKnowledgeBinding (+2 more)

### Community 185 - "RuntimeStatus.tsx"
Cohesion: 0.27
Nodes (9): families, modelFamily, shortModelName(), repositoryModels, RuntimeStatus(), session, glyphs, ModelFamilyIcon() (+1 more)

### Community 186 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 187 - "session-unread.pw.ts"
Cohesion: 0.15
Nodes (7): bounds(), devices, edgeState(), open(), screenshot(), unreadState(), fixtureBackgroundTasks

### Community 188 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 189 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (14): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+6 more)

### Community 190 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 191 - "oracle-voice-routes.test.ts"
Cohesion: 0.15
Nodes (8): openApps, openSockets, RouteManager, runtime(), testRoot(), testRoots, trusted, voiceConfig

### Community 192 - "SessionOriginBadge.test.tsx"
Cohesion: 0.27
Nodes (9): SessionProvenance, readScheduleLink(), ScheduleLink, scheduleNotificationLabel(), sessionOriginDescription(), icons, labels, SessionOriginBadge() (+1 more)

### Community 193 - "pipeline.test.tsx"
Cohesion: 0.19
Nodes (9): components, drawn(), drawnPage(), fixtures, html(), today(), wholePage(), remarkSafeBreaks() (+1 more)

### Community 194 - "pending-echo.ts"
Cohesion: 0.24
Nodes (11): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, PendingEchoOwner, prunePendingEchoMap() (+3 more)

### Community 195 - "capture-workbench-review.ts"
Cohesion: 0.15
Nodes (10): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, fixtureSessions (+2 more)

### Community 196 - "check-workspace-review-regressions.ts"
Cohesion: 0.15
Nodes (11): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+3 more)

### Community 197 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 198 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 199 - "knowledge-store.ts"
Cohesion: 0.16
Nodes (9): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, PersistedKnowledgeState, directories (+1 more)

### Community 201 - "session-resource-clear.test.ts"
Cohesion: 0.19
Nodes (12): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+4 more)

### Community 202 - "use-session-categories.ts"
Cohesion: 0.24
Nodes (11): SessionCategoryChange, fetchSessionCategories(), saveSessionCategoryChange(), sessionRefs(), message(), nothing, SessionCategoriesState, commit() (+3 more)

### Community 203 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 204 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 205 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 206 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 207 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 208 - "node:fs/promises"
Cohesion: 0.21
Nodes (6): root, script, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend()

### Community 210 - "recently-closed.pw.ts"
Cohesion: 0.23
Nodes (9): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), open(), row() (+1 more)

### Community 211 - "session-categories.pw.ts"
Cohesion: 0.21
Nodes (8): bounds(), build(), categorizedState(), devices, drag(), open(), studio(), WorkspaceFixtureState

### Community 212 - "ManagerProactiveInboxValidationError"
Cohesion: 0.20
Nodes (7): emptyState(), ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxValidationError, requireId(), validateOptions()

### Community 213 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 214 - ".initialize"
Cohesion: 0.24
Nodes (4): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, open()

### Community 215 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 216 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 217 - "command-catalog-cache.test.ts"
Cohesion: 0.25
Nodes (9): at(), Catalog, deferred(), fixture(), fixtures, listed(), releases, runtime() (+1 more)

### Community 219 - "session-store-serialization.test.ts"
Cohesion: 0.22
Nodes (6): encode(), directories, seedOffset, serializeSessions(), serializeState(), serializeStateChunks()

### Community 220 - "tmux-errors.test.ts"
Cohesion: 0.24
Nodes (9): containedServer(), directories, errno(), { execute }, files, links, listener(), places() (+1 more)

### Community 221 - "static-files.ts"
Cohesion: 0.27
Nodes (6): RFC-9110, AcceptedEncodings, FILE_HEADERS, isApiPath(), isAppleTouchIconProbe(), registerStaticFiles()

### Community 222 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 223 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 224 - "notification-center.integration.test.ts"
Cohesion: 0.22
Nodes (7): center(), directories, directory(), hub(), now, runtimes, trusted

### Community 225 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 226 - "ComputersDialog.tsx"
Cohesion: 0.31
Nodes (7): addComputer(), removeComputer(), ComputersBody(), remove(), submit(), ComputersBodyProps, computer

### Community 227 - "transcribeAudio"
Cohesion: 0.29
Nodes (4): transcribeAudio(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 228 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 229 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 230 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 231 - "use-markdown-document.test.tsx"
Cohesion: 0.25
Nodes (3): drawnInParts(), components, Reader()

### Community 232 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 233 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 234 - "session-list-collisions.test.ts"
Cohesion: 0.32
Nodes (4): kind(), sessionListCollisions(), Args, layout

### Community 235 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 237 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.43
Nodes (5): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES

### Community 238 - "session-order-routes.test.ts"
Cohesion: 0.43
Nodes (6): directories, fakeManager(), hub(), settled(), until(), upserted()

### Community 239 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 240 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 241 - "use-foreground-handoff.ts"
Cohesion: 0.47
Nodes (3): foregroundHandoffTimeoutMs, Handoff, useForegroundHandoff()

### Community 242 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 243 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 245 - "session-category-store.test.ts"
Cohesion: 0.50
Nodes (3): directories, folder(), store()

### Community 246 - "appearance.ts"
Cohesion: 0.50
Nodes (3): Appearance, appearanceFrom(), appearanceStorageKey

## Knowledge Gaps
- **1515 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1510 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2556 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `runSoak()` connect `oracle-voice-soak.ts` to `oracle-voice-session.ts`, `app.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionStore`, `computer-manager.ts`, `SessionDetail`, `node-routes.ts`, `response-compression.test.ts`, `SessionCategoryStore`, `manager.ts`, `KnowledgeStore`, `ManagedSession`, `ManagerProactiveInbox`, `refusal-metrics.ts`, `session-launcher.ts`, `schedule-notification-service.test.ts`, `registryKey`, `ManagerAgent`, `ManagerStore`, `SessionKnowledgeStore`, `shared/settings-profile.ts`, `oracle-voice-session.ts`, `oracle-task-store.ts`, `hub-routes.ts`, `NotificationStore`, `file-upload-routes.ts`, `oracle-voice-worker.ts`, `manager-agent.ts`, `alerts.test.ts`, `DreamerService`, `NotificationCenterService`, `feature-flags.ts`, `ProviderSessionService`, `SchedulerStore`, `server/skill-settings.ts`, `schedule-launcher.ts`, `ScheduleRun`, `sampler.ts`, `transcription-service.ts`, `manager-proactive-coordinator.ts`, `manager-agent.test.ts`, `PushNotificationService`, `static-files.ts`, `manager-structured-memory.ts`, `dreamer-routes.ts`, `session-resource-routes.test.ts`, `transport.test.ts`, `.replyUserInputInternal`, `SessionOrderStore`, `cli-canary.ts`, `oracle-voice-config.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `computer-manager.ts`, `SessionDetail`, `agent-service.ts`, `BackgroundTaskSnapshot`, `queued-dispatch.test.ts`, `.replyUserInputInternal`, `HubEvent`, `.takeInTranscript`, `claude-agent-service.ts`, `session-directory.ts`, `background-task-adapter.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1515 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.027450980392156862 - nodes in this community are weakly interconnected._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.029277547044044505 - nodes in this community are weakly interconnected._
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
