# Agentic Remote - Graphify code map

Snapshot: `ac97e47870de42aa280f4a7946b6a04e02f42e35cf2f99c7314b762ea62cc932`

Source checkout: `0a63d4a51e411199afe509b60e86dc31cff95aa5`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 658 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 658 files · ~1,176,837 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9241 nodes · 26725 edges · 275 communities (226 shown, 31 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1329 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AppWorkspace
- manager-agent.ts
- SessionDetail
- SessionStore
- agent-service.ts
- api.ts
- oracle-voice-worker.ts
- contracts.ts
- AgentService
- app.ts
- oracle-voice.ts
- OracleVoiceCoordinator
- terminal-session.ts
- .publish
- react
- hub-routes.ts
- App.tsx
- SessionService
- workspace-fixtures.ts
- ManagedSession
- claude-agent-service.ts
- RemoteNodeClient
- oracle-voice-soak.ts
- transcription-service.ts
- agentic-remote-promotion-monitor
- oracle-voice-routes.test.ts
- session-presentation.ts
- dreamer-store.ts
- terminal-session.test.ts
- session-launcher.ts
- CopilotSessionLike
- oracle-voice-integration.test.ts
- ManagerAssistant.tsx
- schedule-launcher.test.ts
- TmuxTerminalSessionController
- manager-structured-memory-validation.ts
- SchedulerStore
- oracle-task-store.ts
- normalizeKnowledgeRelativePath
- pwa.ts
- ui-scenes.ts
- oracle-voice-benchmark.ts
- DreamerService
- recovery-resend-durability.test.ts
- CopilotClientLike
- agentic-remote
- OracleDreamer.tsx
- tmux-test-helpers.ts
- feature-flags.ts
- ManagerAgent
- ComposerActions.tsx
- dreamer-progress.ts
- notification-center.integration.test.ts
- notification-classifier.ts
- processes.ts
- agentic-remote-gate
- PushNotificationService
- OracleVoiceClient
- bundle
- ChildVoiceEngine
- manager-proactive-inbox.ts
- FakeSessionService
- FakeVoiceEngine
- fake-voice.ts
- createManagerTools
- shell.ts
- VoicePlayback
- shared/settings-profile.ts
- composer-state.ts
- lib.rs
- ManagerMessage
- dreamer-planner.ts
- EngineVoiceBackendSession
- schedule-recurrence.ts
- dependencies
- oracle-voice-config.ts
- terminal-startup-queue.test.ts
- capture.ts
- agentic-remote-promotion-setup
- UserInputReplyInput
- alerts.test.ts
- manager-structured-memory.ts
- oracle-voice-security.test.ts
- SessionOrderStore
- devDependencies
- config.rs
- active-sessions.ts
- dreamer-service.ts
- background-task-adapter.ts
- manager-context.ts
- host-telemetry.ts
- VoiceCapture
- BackgroundTasksDialog.tsx
- ScheduleForm.tsx
- HubEvent
- manager-structured-memory-search.ts
- schedule-proposals.ts
- closed-sessions.ts
- oracle-voice-segments.ts
- ManagerProactiveInbox
- ManagerStructuredMemoryStore
- SchedulerDispatcher
- agent-service-event-projection.test.ts
- push-notification-service.ts
- capture-workspace.ts
- sampler.ts
- .process
- manager-tools.ts
- ManagerAttachment
- use-markdown-document.test.tsx
- session-patch-browser.ts
- reader.ts
- ManagerProactiveCoordinator
- schedules.ts
- session-directory.ts
- cli-canary.ts
- ActivityRow.test.tsx
- session-response-order.ts
- scripts
- check-workspace-review-regressions.ts
- .toolHost
- server/skill-settings.ts
- SettingsProfileClient
- use-markdown-document.ts
- src/settings-profile.ts
- client.test.ts
- compilerOptions
- NotificationRecord
- session-resource-providers.test.ts
- manager-routes.ts
- tmux-errors.ts
- ActivityDetails.tsx
- session-patches.test.ts
- oracle-voice-tickets.ts
- client.ts
- markdown-navigation.ts
- HostMonitorView.test.tsx
- use-oracle-conversation.test.tsx
- compilerOptions
- ChatMessage
- full-gate.test.ts
- HostTelemetrySampler
- session-reply-durability.test.ts
- session-store-providers.test.ts
- knowledge-tree.ts
- pipeline.ts
- compilerOptions
- SessionStatus
- schedule-notification-service.test.ts
- OnlineRecognizer
- isTerminalComposerFooter
- workspace-browser.ts
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- session-knowledge-store.ts
- FakeVoiceBackend
- dreamer-schedule.ts
- oracle-status.test.ts
- KnowledgeStore
- promotion-monitor.test.ts
- SessionKnowledgeStore
- SettingsProfileSnapshot
- PromptCards.tsx
- BoundedQueue
- ReaderWorkspace
- settings-profile.test.ts
- manager-automatic.ts
- scripts
- session-knowledge-routes.ts
- SessionPublications
- OracleVoiceClientDependencies
- session-latency-benchmark.ts
- recordValue
- knowledge-store.ts
- SessionLauncher
- session-resource-routes.test.ts
- package.json
- terminal-form-deadline.test.ts
- registerSessionKnowledgeRoutes
- oracle-voice-assets.test.ts
- shared/skill-settings.ts
- fake-vad.ts
- desktop.json
- DeferredSession
- background-task-stop.test.ts
- ManagerSdkClient
- LargeSessionService
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- RecentlyClosed.test.tsx
- isRecord
- server/session-patches.ts
- session-scope.ts
- Pcm16Resampler
- recently-closed.pw.ts
- dreamer-service.test.ts
- manager-proactive-inbox.test.ts
- html-preview.ts
- sign-in-expired.pw.ts
- settings-profile-routes.ts
- SessionAdmissions
- use-oracle-attachments.ts
- dataset
- generate-pwa-icons.ts
- .persist
- bridge.rs
- pipeline.test.tsx
- vite.config.ts
- dreamer-routes.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- response-compression.ts
- session-knowledge-store.test.ts
- sent-message.ts
- voice-recorder.ts
- doctor-cli.test.ts
- ManagerSessionRef
- release-publication.test.ts
- UserInputFieldControl
- OracleVoicePlayback
- skill-settings-jsonc.ts
- composer-layout.test.ts
- registerHostTelemetryRoutes
- HostTelemetryClock
- settings.ts
- DocumentViewControls.tsx
- SessionOriginRunLink.tsx
- use-foreground-handoff.ts
- usePanelWidth
- worker-handler.ts
- api-origin.test.ts
- promotion-setup.test.ts
- FakeRecorder
- .status
- hub-health.ts
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
2. `SessionDetail` - 327 edges
3. `AgentService` - 318 edges
4. `SessionStore` - 218 edges
5. `ManagedSession` - 181 edges
6. `buildApp()` - 141 edges
7. `ClaudeAgentService` - 133 edges
8. `registerHubRoutes()` - 114 edges
9. `ComputerManager` - 107 edges
10. `ManagerAgent` - 101 edges

## Surprising Connections (you probably didn't know these)
- `make()` --indirect_call--> `reader()`  [INFERRED]
  server/host-telemetry/transport.test.ts → shared/transcript-window.test.ts
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `FakeVoiceState` --references--> `ManagerMessage`  [EXTRACTED]
  e2e/fixtures/fake-voice.ts → shared/manager.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (275 total, 31 thin omitted)

### Community 0 - "AppWorkspace"
Cohesion: 0.02
Nodes (198): isManagerEvent(), terminalSendOptions(), sessionFileValidationError(), SettingsChange, SettingsProfileKey, SettingsUpdateResult, askSession(), clearConversation() (+190 more)

### Community 1 - "manager-agent.ts"
Cohesion: 0.02
Nodes (99): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, DreamerMemoryMetadata (+91 more)

### Community 2 - "SessionDetail"
Cohesion: 0.03
Nodes (19): runtimeInfoMatches(), ClaudeAgentService, isMissingClaudeSessionError(), claudeOwner(), ownsDispatchRecovery(), preflight(), preparePrompt(), queueConflict() (+11 more)

### Community 3 - "SessionStore"
Cohesion: 0.03
Nodes (102): complete(), event(), sessionWithLog(), start(), fixture(), restart(), directories, fakeClient() (+94 more)

### Community 4 - "agent-service.ts"
Cohesion: 0.02
Nodes (127): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+119 more)

### Community 5 - "api.ts"
Cohesion: 0.02
Nodes (153): AddKnowledgeRootInput, ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, PushSettings, SessionKnowledgeRootMutationInput, SessionMcpServerSummary, SessionSkillSummary, ResolveManagerConfirmationInput (+145 more)

### Community 6 - "oracle-voice-worker.ts"
Cohesion: 0.03
Nodes (84): voiceBackend(), ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker() (+76 more)

### Community 7 - "contracts.ts"
Cohesion: 0.03
Nodes (100): backgroundTaskNotFound(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), listedBackgroundTask(), readBackgroundTaskFrom(), taskFingerprint() (+92 more)

### Community 8 - "AgentService"
Cohesion: 0.03
Nodes (31): agentMode(), AgentService, terminalService(), foregroundTurnOpen(), isMissingSessionError(), lifecycleRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError (+23 more)

### Community 9 - "app.ts"
Cohesion: 0.02
Nodes (90): buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe(), ClaudeSdk, ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName() (+82 more)

### Community 10 - "oracle-voice.ts"
Cohesion: 0.04
Nodes (92): apps, directories, sendNodeVoiceOutput(), limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes() (+84 more)

### Community 11 - "OracleVoiceCoordinator"
Cohesion: 0.04
Nodes (39): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+31 more)

### Community 12 - "terminal-session.ts"
Cohesion: 0.05
Nodes (105): terminalComposerUnreadable(), activeBottomFrame(), backgroundShellsAllow(), BackgroundShellsEvidence, busyRowStatus(), captureBeforeDeadline(), captureForReplacement(), capturePane() (+97 more)

### Community 13 - ".publish"
Cohesion: 0.04
Nodes (11): commandShortcut(), DeliveryBoundary, isTerminalNotReadyRefusal(), normalizedTitle(), RecoveryResendClaim, sessionInUseConflictMessage(), sessionInUseQueueMessage(), terminalAnswerRefused() (+3 more)

### Community 14 - "react"
Cohesion: 0.04
Nodes (89): react, RuntimeModelOption, AppearanceSetting, NewSessionBackendSetting, activateSession(), createSession(), getHubHealth(), getManager() (+81 more)

### Community 15 - "hub-routes.ts"
Cohesion: 0.03
Nodes (98): activityDetailsUnavailable(), activityNotInLog(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), FileUploadError, registerFileUploadRoutes(), SessionParams (+90 more)

### Community 16 - "App.tsx"
Cohesion: 0.03
Nodes (86): hasActiveBackgroundTasks(), hasForegroundTurn(), executeCommand(), listWorkspace(), searchWorkspace(), ActivityRowStates, sidebarTouchStart(), ChangeDirectoryDialog() (+78 more)

### Community 17 - "SessionService"
Cohesion: 0.04
Nodes (8): closeReason(), closeVoiceSocket(), registerNodeRoutes(), owns(), ProviderSessionService, node(), SessionService, WorkspaceFile

### Community 18 - "workspace-fixtures.ts"
Cohesion: 0.03
Nodes (56): frame(), geometry, output, scratch, screenshot(), { values }, desktop, devices (+48 more)

### Community 19 - "ManagedSession"
Cohesion: 0.08
Nodes (14): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, updateComputerForLaunchIdentity(), FakeManager (+6 more)

### Community 20 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (66): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+58 more)

### Community 21 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (23): RemoteResync, RemoteSessionRead, RemoteNodeClient, client(), servers, session, RemoteNodeCapabilityError, RemoteNodeRequestError (+15 more)

### Community 22 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (35): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+27 more)

### Community 23 - "transcription-service.ts"
Cohesion: 0.04
Nodes (49): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, headerSafe() (+41 more)

### Community 24 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 25 - "oracle-voice-routes.test.ts"
Cohesion: 0.04
Nodes (35): clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics, registerControlRoutes() (+27 more)

### Community 26 - "session-presentation.ts"
Cohesion: 0.05
Nodes (67): CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), KnowledgeRootSelector(), root, CloseSessionDialog(), noPrompts, RecentlyClosedCard(), RecentlyClosedDialog() (+59 more)

### Community 27 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (40): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+32 more)

### Community 28 - "terminal-session.test.ts"
Cohesion: 0.04
Nodes (61): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+53 more)

### Community 29 - "session-launcher.ts"
Cohesion: 0.04
Nodes (41): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+33 more)

### Community 30 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (31): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), QueuedDelivery, QueuedDispatches (+23 more)

### Community 31 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+24 more)

### Community 32 - "ManagerAssistant.tsx"
Cohesion: 0.05
Nodes (51): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget() (+43 more)

### Community 33 - "schedule-launcher.test.ts"
Cohesion: 0.07
Nodes (38): enableSchedulerTools(), LaunchPrimitives, provenance(), ScheduleLauncherHost, ScheduleProvenance, scheduleSessionTitle(), SessionScheduleLauncher, directories (+30 more)

### Community 34 - "TmuxTerminalSessionController"
Cohesion: 0.07
Nodes (21): startAgentAfterClear(), composer(), processAdapter, afterExit(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync (+13 more)

### Community 35 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 36 - "SchedulerStore"
Cohesion: 0.10
Nodes (14): deferUnboundWorktree(), failure(), isInFlight(), occurrenceKey(), SchedulerStore, State, stateSchema, timestamp (+6 more)

### Community 37 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (35): apps, directories, setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing() (+27 more)

### Community 38 - "normalizeKnowledgeRelativePath"
Cohesion: 0.06
Nodes (41): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+33 more)

### Community 39 - "pwa.ts"
Cohesion: 0.07
Nodes (46): checkHubSignIn(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), App(), applyPwaUpdate(), changed(), frames (+38 more)

### Community 40 - "ui-scenes.ts"
Cohesion: 0.06
Nodes (35): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), oracleHostStatusFixture(), fixtureNotifications, fixtureScheduleProposals (+27 more)

### Community 41 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 42 - "DreamerService"
Cohesion: 0.12
Nodes (12): projectDreamerMemory(), boundedText(), digest(), DreamerService, DreamerUnavailableError, unavailableSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate (+4 more)

### Community 43 - "recovery-resend-durability.test.ts"
Cohesion: 0.05
Nodes (37): root, script, directories, disk, fixture(), gate(), gates, initialize() (+29 more)

### Community 44 - "CopilotClientLike"
Cohesion: 0.04
Nodes (31): CopilotClientLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), at() (+23 more)

### Community 45 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 46 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (40): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition (+32 more)

### Community 47 - "tmux-test-helpers.ts"
Cohesion: 0.09
Nodes (39): [root], assertSameIdentity(), createIsolatedTmuxRoot(), execFileAsync, abandoned, abandonFixture(), creatorCommand(), execute (+31 more)

### Community 48 - "feature-flags.ts"
Cohesion: 0.11
Nodes (30): hub(), defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable(), parseFeatureFlag() (+22 more)

### Community 49 - "ManagerAgent"
Cohesion: 0.11
Nodes (9): discover(), errorMessage(), isNotFound(), isPending(), isQueued(), ManagerAgent, sameRuntime(), withTimeout() (+1 more)

### Community 50 - "ComposerActions.tsx"
Cohesion: 0.08
Nodes (21): families, modelFamily, shortModelName(), repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions() (+13 more)

### Community 51 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 52 - "notification-center.integration.test.ts"
Cohesion: 0.09
Nodes (15): center(), directories, directory(), hub(), now, runtimes, trusted, NotificationCenterService (+7 more)

### Community 53 - "notification-classifier.ts"
Cohesion: 0.08
Nodes (39): attentionClosed(), attentionSeed(), classifyHostNotification(), classifyHubNotification(), classifyOracleNotification(), classifyScheduleNotification(), HOST_ALERT_MEMORY_DURATION_MS, notificationIdentity() (+31 more)

### Community 54 - "processes.ts"
Cohesion: 0.09
Nodes (27): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+19 more)

### Community 55 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 56 - "PushNotificationService"
Cohesion: 0.10
Nodes (10): start(), NotificationRecorder, HubEventSource, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema (+2 more)

### Community 57 - "OracleVoiceClient"
Cohesion: 0.15
Nodes (7): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, playbackClientError(), terminalCloseCode()

### Community 58 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 59 - "ChildVoiceEngine"
Cohesion: 0.11
Nodes (12): benchmarkGroup(), capabilityFromConfig(), ChildVoiceEngine, errorMessage(), isCancelledEvent(), matchesCancelled(), matchesSynthesis(), matchesUtterance() (+4 more)

### Community 60 - "manager-proactive-inbox.ts"
Cohesion: 0.07
Nodes (41): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, emptyState(), eventId(), hasExactKeys(), isDisposition() (+33 more)

### Community 62 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (15): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceSttEngine, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+7 more)

### Community 63 - "fake-voice.ts"
Cohesion: 0.08
Nodes (11): ActiveBackendSession, beginSpeech(), BrowserTestSessionService, endSpeech(), expectOk(), FakeVoiceController, FakeVoiceState, installFakeBrowserVoice() (+3 more)

### Community 64 - "createManagerTools"
Cohesion: 0.09
Nodes (6): busyReason(), createManagerTools(), closeCapReached(), requireComputer(), whyCloseMustAsk(), ManagerToolHost

### Community 65 - "shell.ts"
Cohesion: 0.09
Nodes (35): ScheduleShellNotifier, attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label() (+27 more)

### Community 66 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 67 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (37): WorkspaceFixtureState, SettingsProfileState, AccentSetting, appearanceSettings, applySettingsChanges(), applySettingsImport(), DEFAULT_SESSION_PROVIDER, isRecord() (+29 more)

### Community 68 - "composer-state.ts"
Cohesion: 0.10
Nodes (36): composerChanged(), composerPasted(), persistComposerDrafts(), composerReadFailureMessage(), readComposerDrafts(), readLegacyComposerDrafts(), writeQueuedEditOwners(), activeComposerPastes() (+28 more)

### Community 69 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 70 - "ManagerMessage"
Cohesion: 0.08
Nodes (7): FakeManager, ProactiveManager, FakeManager, createManager(), StoredManager, ManagerMessage, ManagerSnapshot

### Community 71 - "dreamer-planner.ts"
Cohesion: 0.09
Nodes (35): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+27 more)

### Community 72 - "EngineVoiceBackendSession"
Cohesion: 0.15
Nodes (8): acquisitionCancelled(), asSessionError(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled(), VoiceBackendAcquisitionCancelled, VoiceSessionError, waitForAcquisition()

### Community 73 - "schedule-recurrence.ts"
Cohesion: 0.11
Nodes (36): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+28 more)

### Community 74 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 75 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (28): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+20 more)

### Community 76 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (29): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+21 more)

### Community 77 - "capture.ts"
Cohesion: 0.07
Nodes (19): BufferedFrame, defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies (+11 more)

### Community 78 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 79 - "UserInputReplyInput"
Cohesion: 0.11
Nodes (8): isUncertainDelivery(), PendingUserInputTracker, persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, PendingUserInput, UserInputReplyInput, deliveryUncertaintyFromError()

### Community 80 - "alerts.test.ts"
Cohesion: 0.09
Nodes (17): HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, computer, observe(), snapshot(), start, sustained(), HostRequest (+9 more)

### Community 81 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (31): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+23 more)

### Community 82 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (22): FakeVoiceEngineCall, SocketMessage, apps, BlockingEngine, config, configFixture(), connect(), createManager() (+14 more)

### Community 83 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 84 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 85 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 86 - "active-sessions.ts"
Cohesion: 0.11
Nodes (31): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+23 more)

### Community 87 - "dreamer-service.ts"
Cohesion: 0.09
Nodes (30): DreamerPlanDraft, DreamerPlannerInput, DreamerFollowUp, DreamerPlannerExecutionInput, planWithFingerprints(), publicSnapshot(), safeRunError(), DreamerCoverageIncrement (+22 more)

### Community 88 - "background-task-adapter.ts"
Cohesion: 0.15
Nodes (35): addActivity(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, copyTask(), createBackgroundTaskProjector(), endsForegroundTurn(), errorValue() (+27 more)

### Community 89 - "manager-context.ts"
Cohesion: 0.11
Nodes (29): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+21 more)

### Community 90 - "host-telemetry.ts"
Cohesion: 0.08
Nodes (30): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, HOST_TELEMETRY_MAX_QUEUE_BYTES (+22 more)

### Community 91 - "VoiceCapture"
Cohesion: 0.14
Nodes (5): captureFailure(), harness(), VoiceCapture, VoiceCaptureOptions, FakeCapture

### Community 92 - "BackgroundTasksDialog.tsx"
Cohesion: 0.11
Nodes (28): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+20 more)

### Community 93 - "ScheduleForm.tsx"
Cohesion: 0.13
Nodes (25): scheduleProposalSummary(), ScheduleTarget, FolderPicker(), browse(), editableSchedule(), recurrenceSummary(), runDuration(), scheduleError() (+17 more)

### Community 94 - "HubEvent"
Cohesion: 0.10
Nodes (22): ComputerManagerEvents, running, apps, directories, FakeManager, fixture(), trusted, FinishedSession (+14 more)

### Community 95 - "manager-structured-memory-search.ts"
Cohesion: 0.11
Nodes (27): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+19 more)

### Community 96 - "schedule-proposals.ts"
Cohesion: 0.11
Nodes (29): action, create, existing, metadata, scheduleProposalInputSchema, ScheduleProposalsChanged, scheduleProposalSchema, update (+21 more)

### Community 97 - "closed-sessions.ts"
Cohesion: 0.09
Nodes (18): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, blockParents, CLOSED_SESSION_RETENTION_MS, closedCapitals(), closedSessionContext() (+10 more)

### Community 98 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 99 - "ManagerProactiveInbox"
Cohesion: 0.14
Nodes (10): ManagerProactiveInbox, ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, nowIso(), publicEvent() (+2 more)

### Community 100 - "ManagerStructuredMemoryStore"
Cohesion: 0.18
Nodes (8): digest(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState

### Community 101 - "SchedulerDispatcher"
Cohesion: 0.20
Nodes (3): SchedulerDispatcher, registerSchedulerRoutes(), holdsSlot()

### Community 102 - "agent-service-event-projection.test.ts"
Cohesion: 0.10
Nodes (22): at(), directories, finish(), launch(), projected(), services, sessionLog(), syncSessionTranscript() (+14 more)

### Community 103 - "push-notification-service.ts"
Cohesion: 0.11
Nodes (19): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+11 more)

### Community 104 - "capture-workspace.ts"
Cohesion: 0.13
Nodes (24): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+16 more)

### Community 105 - "sampler.ts"
Cohesion: 0.12
Nodes (24): counter(), counterDelta(), cpuUtilization(), DeviceByteCounters, deviceRates(), isWholeDisk(), MemoryReading, nonnegative() (+16 more)

### Community 106 - ".process"
Cohesion: 0.12
Nodes (5): automaticPayload(), checkContent(), messagePriority(), uniqueManagerSessionRefs(), ManagerStatus

### Community 107 - "manager-tools.ts"
Cohesion: 0.08
Nodes (27): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, computerField, ContextTier, define(), scheduleTools(), structuredTools() (+19 more)

### Community 108 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 109 - "use-markdown-document.test.tsx"
Cohesion: 0.10
Nodes (13): DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), defaultDocumentRenderer(), DocumentRenderer, DocumentRendererContext, RendererWorker, synchronousRenderer (+5 more)

### Community 110 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (26): advance(), Connection, connections, content(), FrameMeasurement, lastHeading(), message(), open() (+18 more)

### Community 111 - "reader.ts"
Cohesion: 0.14
Nodes (21): detectWsl(), parseDataMount(), createLinuxHostTelemetryReader(), errorCode(), HostTelemetryProcFile, hostTelemetryProcFiles, HostTelemetryReader, HostTelemetryReaderOptions (+13 more)

### Community 112 - "ManagerProactiveCoordinator"
Cohesion: 0.17
Nodes (6): batchMessageId(), isTerminal(), lifecycles(), ManagerProactiveCoordinator, fixture(), managed()

### Community 113 - "schedules.ts"
Cohesion: 0.11
Nodes (25): cronExpression, DEFAULT_SCHEDULE_TIMEZONE, identifier, SCHEDULE_ABANDONED_REASON, SCHEDULE_MIN_SPACING_MINUTES, SCHEDULE_PROMPT_MAX_LENGTH, scheduleAbandonSchema, scheduleActionSchema (+17 more)

### Community 114 - "session-directory.ts"
Cohesion: 0.18
Nodes (20): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+12 more)

### Community 115 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 116 - "ActivityRow.test.tsx"
Cohesion: 0.14
Nodes (19): toolCallIdFromActivityId(), ActivityStatus, activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), compactActivityText() (+11 more)

### Community 117 - "session-response-order.ts"
Cohesion: 0.14
Nodes (21): TRANSCRIPT_CARRIED_LIMIT, sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse() (+13 more)

### Community 118 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 119 - "check-workspace-review-regressions.ts"
Cohesion: 0.08
Nodes (13): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+5 more)

### Community 120 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 121 - "server/skill-settings.ts"
Cohesion: 0.16
Nodes (16): builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), readBounded(), revision(), applications, directories (+8 more)

### Community 122 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 123 - "use-markdown-document.ts"
Cohesion: 0.16
Nodes (19): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+11 more)

### Community 124 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (20): NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+12 more)

### Community 125 - "client.test.ts"
Cohesion: 0.10
Nodes (7): HUB_SIGN_IN_EXPIRED_MESSAGE, capabilities, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse()

### Community 126 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 127 - "NotificationRecord"
Cohesion: 0.16
Nodes (17): WorkspaceFixtureOptions, NotificationState, NotificationRecord, FeatureEvent, listeners, publishFeatureEvent(), subscribeFeatureEvents(), NotificationGroup (+9 more)

### Community 128 - "session-resource-providers.test.ts"
Cohesion: 0.12
Nodes (19): cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), claudeFixture(), ClaudeMcpRead (+11 more)

### Community 129 - "manager-routes.ts"
Cohesion: 0.12
Nodes (14): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+6 more)

### Community 130 - "tmux-errors.ts"
Cohesion: 0.13
Nodes (20): listTmuxSessions(), foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity(), SocketPlace (+12 more)

### Community 131 - "ActivityDetails.tsx"
Cohesion: 0.16
Nodes (20): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, TOOL_CALL_ID_PATTERN, ActivityDetailArguments, ActivityDetailText, activityDetailFailure, detailKey(), formatBytes(), keep() (+12 more)

### Community 132 - "session-patches.test.ts"
Cohesion: 0.16
Nodes (10): nextVoiceControl(), Client, Browser, seedOffset, HubResyncRequest, HubTasksResyncRequest, HubWireEvent, applyTaskPatch() (+2 more)

### Community 133 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 134 - "client.ts"
Cohesion: 0.12
Nodes (15): ORACLE_VOICE_CONNECTION_TIMEOUT_MS, closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, OracleVoiceSocket (+7 more)

### Community 135 - "markdown-navigation.ts"
Cohesion: 0.17
Nodes (20): MarkdownImage(), navigateDocument(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource() (+12 more)

### Community 136 - "HostMonitorView.test.tsx"
Cohesion: 0.17
Nodes (18): HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics, snapshot, Socket, bytes() (+10 more)

### Community 137 - "use-oracle-conversation.test.tsx"
Cohesion: 0.15
Nodes (9): OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversationState, availableCapability, defaults, FakeVoiceClient, transcript() (+1 more)

### Community 138 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 139 - "ChatMessage"
Cohesion: 0.13
Nodes (14): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, ChatMessage, carriedBefore() (+6 more)

### Community 140 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 141 - "HostTelemetrySampler"
Cohesion: 0.15
Nodes (5): CpuCounters, DeviceCounters, HostTelemetrySampler, HostMinuteAggregate, HostSample

### Community 142 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 143 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 144 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 145 - "pipeline.ts"
Cohesion: 0.16
Nodes (20): openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform() (+12 more)

### Community 146 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 147 - "SessionStatus"
Cohesion: 0.12
Nodes (18): Seen, ManagerProactiveInboxObservation, PersistedCursor, NotificationCursor, Row, SdkRestartRecovery, SessionExecutionMode, SessionStatus (+10 more)

### Community 148 - "schedule-notification-service.test.ts"
Cohesion: 0.18
Nodes (6): ScheduleNotificationService, input(), now, run(), ScheduleRunNotification, SchedulerChanged

### Community 149 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 150 - "isTerminalComposerFooter"
Cohesion: 0.15
Nodes (18): boxedComposerFrame(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock(), flatComposerFrame() (+10 more)

### Community 151 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (16): assertOpenedFilePath(), fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath() (+8 more)

### Community 152 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 153 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 154 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 155 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 156 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (18): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+10 more)

### Community 158 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 159 - "oracle-status.test.ts"
Cohesion: 0.19
Nodes (14): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+6 more)

### Community 161 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 162 - "SessionKnowledgeStore"
Cohesion: 0.26
Nodes (3): bindingKey(), SessionKnowledgeStore, SessionKnowledgeBinding

### Community 163 - "SettingsProfileSnapshot"
Cohesion: 0.18
Nodes (9): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileStore, directories, store() (+1 more)

### Community 164 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (13): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+5 more)

### Community 165 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 166 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 167 - "settings-profile.test.ts"
Cohesion: 0.16
Nodes (5): settingsProfileCacheKey, SettingsProfileTransport, cached(), FakeHub, MemoryStorage

### Community 168 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 169 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 170 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 172 - "OracleVoiceClientDependencies"
Cohesion: 0.15
Nodes (5): pageFor(), submit(), OracleVoiceClientDependencies, FakePlayback, VoicePlaybackOptions

### Community 173 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (15): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+7 more)

### Community 174 - "recordValue"
Cohesion: 0.21
Nodes (16): attachmentModeValue(), backgroundHandoff(), booleanValue(), notificationKind(), parsedValue(), rawTailText(), recordValue(), shellExitFromValue() (+8 more)

### Community 175 - "knowledge-store.ts"
Cohesion: 0.14
Nodes (11): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, parseMetadata(), PersistedKnowledgeState (+3 more)

### Community 176 - "SessionLauncher"
Cohesion: 0.16
Nodes (5): delay(), requireFolderTrust(), sameFolder(), SessionLauncher, trustedFolderOf()

### Community 177 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 178 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 179 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 180 - "registerSessionKnowledgeRoutes"
Cohesion: 0.29
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 181 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 182 - "shared/skill-settings.ts"
Cohesion: 0.20
Nodes (8): registerSkillSettingsRoutes(), SkillSettingsTarget, SKILL_SETTINGS_CAPABILITY, skillFrontmatterNameSchema, skillNameSchema, skillSettingsSchema, SkillToggle, skillToggleSchema

### Community 183 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 184 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 185 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 186 - "background-task-stop.test.ts"
Cohesion: 0.25
Nodes (11): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started(), stopAcknowledgement() (+3 more)

### Community 187 - "ManagerSdkClient"
Cohesion: 0.14
Nodes (3): delay(), ManagerSdkClient, TurnError

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

### Community 193 - "RecentlyClosed.test.tsx"
Cohesion: 0.18
Nodes (9): session(), act(), audit(), closed, computers, now, observeResizes(), session() (+1 more)

### Community 194 - "isRecord"
Cohesion: 0.24
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 195 - "server/session-patches.ts"
Cohesion: 0.19
Nodes (12): changedInPlace(), diffMessages(), Publication, PublishedTask, sameField(), sameMessage(), SessionTasksUpdated, SessionUpserted (+4 more)

### Community 196 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 197 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 198 - "recently-closed.pw.ts"
Cohesion: 0.23
Nodes (9): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), open(), row() (+1 more)

### Community 200 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 201 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 202 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 203 - "settings-profile-routes.ts"
Cohesion: 0.25
Nodes (8): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 205 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 206 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 207 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 208 - ".persist"
Cohesion: 0.24
Nodes (3): SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, stateWithPaths()

### Community 209 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 210 - "pipeline.test.tsx"
Cohesion: 0.27
Nodes (7): components, drawn(), drawnPage(), fixtures, html(), today(), rehypeDocumentHeadings()

### Community 211 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 212 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 213 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 214 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 215 - "response-compression.ts"
Cohesion: 0.42
Nodes (8): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), varyOnAcceptEncoding()

### Community 216 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 217 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 218 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 219 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 220 - "ManagerSessionRef"
Cohesion: 0.36
Nodes (5): proactiveSessionAllowed(), resolveSession(), taskSessionAllowed(), ReconcileOracleTaskAttemptInput, ManagerSessionRef

### Community 221 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 222 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 224 - "skill-settings-jsonc.ts"
Cohesion: 0.48
Nodes (5): instrument(), document(), parseSkillSettings(), replaceDisabledSkills(), Token

### Community 225 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 228 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 229 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 230 - "SessionOriginRunLink.tsx"
Cohesion: 0.52
Nodes (4): readScheduleLink(), ScheduleLink, scheduleNotificationLabel(), SessionOriginRunLink()

### Community 231 - "use-foreground-handoff.ts"
Cohesion: 0.47
Nodes (3): foregroundHandoffTimeoutMs, Handoff, useForegroundHandoff()

### Community 232 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 233 - "worker-handler.ts"
Cohesion: 0.47
Nodes (4): render, scope, handleRenderRequest(), RenderRequest

### Community 234 - "api-origin.test.ts"
Cohesion: 0.40
Nodes (4): prefixes, session, trusted, untrusted

### Community 235 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1469 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1464 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2465 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `SessionStore`, `agent-service.ts`, `contracts.ts`, `recovery-resend-durability.test.ts`, `.publish`, `UserInputReplyInput`, `hub-routes.ts`, `session-directory.ts`, `claude-agent-service.ts`, `CopilotSessionLike`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `SessionDetail`, `agent-service.ts`, `AgentService`, `.publish`, `UserInputReplyInput`, `hub-routes.ts`, `CopilotSessionLike`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `TmuxTerminalSessionController` connect `TmuxTerminalSessionController` to `tmux-errors.ts`, `terminal-session.ts`, `.publish`, `active-sessions.ts`, `terminal-session.test.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1469 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.02378610390771707 - nodes in this community are weakly interconnected._
- **Should `manager-agent.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.02458366375892149 - nodes in this community are weakly interconnected._
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
