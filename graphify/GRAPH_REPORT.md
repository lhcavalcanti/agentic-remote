# Agentic Remote - Graphify code map

Snapshot: `67058509bd87abb2974c9798d9018256444e2400cb3f9bcbcc87cb2e732b8687`

Source checkout: `eb7d284850cb18e18a6fa765100d35692c91a49d`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 727 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 727 files · ~1,270,642 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 10188 nodes · 29195 edges · 289 communities (244 shown, 28 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1372 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionDetail
- AgentService
- AppWorkspace
- SessionStore
- api.ts
- oracle-voice-session.ts
- terminal-session.ts
- App.tsx
- agent-service.ts
- contracts.ts
- session-presentation.ts
- oracle-voice-child.ts
- oracle-voice-soak.ts
- VoiceClientControl
- CopilotClientLike
- ManagerStore
- ManagedSession
- client.ts
- claude-agent-service.ts
- manager-tools.ts
- app.ts
- schedule-launcher.ts
- BackgroundTask
- agentic-remote-promotion-monitor
- HubEvent
- ManagerAgent
- RemoteNodeClient
- manager.ts
- schedules.ts
- schedule-launcher.test.ts
- manager-agent.ts
- oracle-task-store.ts
- dreamer-service.ts
- AppSettingsDialog.tsx
- oracle-voice-worker.ts
- hub-routes.ts
- oracle-voice.ts
- notification-center.integration.test.ts
- oracle-voice-integration.test.ts
- dictation-routes.test.ts
- TmuxTerminalSessionController
- ProviderSessionService
- manager-structured-memory-validation.ts
- node-routes.ts
- ActivityDetails.tsx
- live-dictation-session.ts
- OracleDreamer.tsx
- sampler.ts
- parakeet-worker.ts
- ui-locks.pw.ts
- feature-flags.ts
- ComposerActions.tsx
- dreamer-planner.ts
- SessionService
- ManagerAssistant.tsx
- SettingsProfileSnapshot
- background-task-adapter.ts
- FakeVoiceEngine
- UserInputReplyInput
- LocalTranscriptionService
- send-matrix.integration.test.ts
- agentic-remote
- RecentlyClosed.tsx
- setupWorkspaceFixture
- oracle-voice-benchmark.ts
- parakeet-child.ts
- dreamer-progress.ts
- react
- AgentProvider
- use-live-dictation.ts
- SchedulerStore
- agentic-remote-gate
- processes.ts
- session-launcher.ts
- PushNotificationService
- bundle
- live-dictation-benchmark.ts
- shell.ts
- FakeVoiceController
- schedule-recurrence.ts
- lib.rs
- workspace-fixtures.ts
- FakeSessionService
- transcription-service.ts
- dependencies
- devDependencies
- active-sessions.ts
- terminal-startup-queue.test.ts
- manager-proactive-coordinator.ts
- manager-structured-memory.ts
- agentic-remote-promotion-setup
- oracle-voice-config.ts
- sections.tsx
- config.rs
- response-compression.test.ts
- dictation-routes.ts
- KnowledgeStore
- tmux-test-helpers.ts
- manager-proactive-inbox.ts
- knowledge-tree.ts
- pipeline.test.tsx
- session-prefetch.ts
- live-dictation-client.test.ts
- ManagerStructuredMemoryStore
- EngineVoiceBackendSession
- SessionKnowledgeStore
- manager-context.ts
- oracle-voice-security.test.ts
- controls.tsx
- shared/settings-profile.ts
- SessionOrderStore
- ChatMessage
- HostTelemetrySampler
- dreamer-store.ts
- service.ts
- ManagerAssistant.test.tsx
- VoicePlayback
- transcript-test-helpers.ts
- ManagerAttachment
- server/skill-settings.ts
- check-workspace-review-regressions.ts
- session-patch-browser.ts
- session-directory.ts
- tmux-errors.integration.test.ts
- capture-workspace.ts
- startup-phases.test.ts
- OracleVoiceCoordinator
- BackgroundTasksDialog.tsx
- dictation/capture.ts
- src/settings-profile.ts
- real-voice.ts
- cli-canary.ts
- manager-structured-memory-search.ts
- submission-error.ts
- live-dictation-client.ts
- session-transcript.ts
- scripts
- DreamerCapacityError
- dictation.ts
- session-categories.ts
- SettingsProfileClient
- background-task-stop.test.ts
- HostMonitorView.test.tsx
- .toolHost
- session-category-routes.ts
- compilerOptions
- RuntimeModelOption
- session-resource-providers.test.ts
- oracle-voice-assets.test.ts
- session-unread.pw.ts
- DictationConnection
- session-reply-durability.test.ts
- host-telemetry.ts
- vite.config.ts
- normalizeKnowledgeRelativePath
- ManagerProactiveInbox
- SessionCategoryStore
- oracle-voice-segments.ts
- session-knowledge-store.ts
- compilerOptions
- session-category-store.test.ts
- DreamerStore
- full-gate.test.ts
- oracle-status.test.ts
- .observe
- workspace-browser.ts
- session-store-providers.test.ts
- PromptCards.tsx
- markdown-navigation.ts
- compilerOptions
- agent-service-event-projection.test.ts
- alerts.test.ts
- live-dictation-session.test.ts
- session-clear-transcript.test.ts
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- DictationRelay
- ManagerMemory
- NotificationRecord
- dreamer-schedule.ts
- promotion-monitor.test.ts
- SessionResources.tsx
- use-markdown-document.test.tsx
- BoundedQueue
- ReaderWorkspace
- node:fs/promises
- scripts
- .confirmSpeech
- recovery-resend-durability.test.ts
- tmux-test-helpers.integration.test.ts
- use-session-knowledge-root.ts
- pipeline.ts
- renderer.test.ts
- terminal-form-deadline.test.ts
- session-latency-benchmark.ts
- registerSessionKnowledgeRoutes
- closed-sessions.ts
- package.json
- .handleBackendOutput
- session-knowledge-routes.ts
- fake-vad.ts
- desktop.json
- DeferredSession
- theme-contrast.test.ts
- DictationStatus.tsx
- pending-echo.ts
- session-categories.pw.ts
- .oxlintrc.json
- settings-local.json
- manager-proactive-inbox.test.ts
- session-scope.ts
- Pcm16Resampler
- document-render.pw.ts
- recently-closed.pw.ts
- VoiceTurnState
- html-preview.ts
- manager-automatic.ts
- sign-in-expired.pw.ts
- transcription-benchmark.ts
- dreamer-store.test.ts
- transport.test.ts
- use-oracle-attachments.ts
- dataset
- generate-pwa-icons.ts
- FakeSocket
- SpeakableSegmenter
- bridge.rs
- history-projection.test.ts
- HostSnapshot
- logs-cli.test.ts
- ManagerProactiveInboxValidationError
- promotion-setup-execution.test.ts
- session-category-routes.test.ts
- SkillsSettings.tsx
- DocumentHeading
- doctor-cli.test.ts
- release-publication.test.ts
- SkillSettingsService
- session-list-collisions.test.ts
- oracle-conversation-real.test.ts
- composer-layout.test.ts
- session-order-routes.test.ts
- SessionOriginBadge.tsx
- settings.ts
- manager-structured-memory-performance.test.ts
- refusal-metrics-routes.test.ts
- skill-settings-jsonc.ts
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
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
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (289 total, 28 thin omitted)

### Community 0 - "SessionDetail"
Cohesion: 0.03
Nodes (29): terminalAnswerRefused(), ClaudeAgentService, isMissingClaudeSessionError(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery() (+21 more)

### Community 1 - "AgentService"
Cohesion: 0.03
Nodes (34): agentMode(), AgentService, foregroundCompletedSince(), foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isRuntimeReasoningEffort(), isTerminalNotReadyRefusal() (+26 more)

### Community 2 - "AppWorkspace"
Cohesion: 0.03
Nodes (202): terminalSendOptions(), newSessionCategoryId(), sessionCategoryOf(), AppWorkspace(), adoptConversationReplacement(), announceCategory(), appendComposerForKey(), appKeyDown() (+194 more)

### Community 3 - "SessionStore"
Cohesion: 0.02
Nodes (116): storage(), complete(), event(), sessionWithLog(), start(), fixture(), restart(), fixture() (+108 more)

### Community 4 - "api.ts"
Cohesion: 0.02
Nodes (157): SettingsChange, SettingsProfileKey, SettingsUpdateResult, activityArgumentFormats, activityDetailStatuses, activityKinds, addComputer(), addKnowledgeRoot() (+149 more)

### Community 5 - "oracle-voice-session.ts"
Cohesion: 0.03
Nodes (99): ActiveBackendSession, installFakeBrowserVoice(), ScriptedUtterance, Window, ManagerEventSource, exactArrayBuffer(), nodeVoiceCapabilities(), rawDataBuffer() (+91 more)

### Community 6 - "terminal-session.ts"
Cohesion: 0.03
Nodes (143): sessionInUseConflictMessage(), sessionInUseQueueMessage(), terminalComposerUnreadable(), activeBottomFrame(), backgroundShellsAllow(), BackgroundShellsEvidence, boxedComposerFrame(), busyRowStatus() (+135 more)

### Community 7 - "App.tsx"
Cohesion: 0.02
Nodes (124): hasActiveBackgroundTasks(), hasForegroundTurn(), isManagerEvent(), extension(), MAX_SESSION_FILE_BYTES, sessionFileValidationError(), supportedExtensions, supportsSessionFile() (+116 more)

### Community 8 - "agent-service.ts"
Cohesion: 0.03
Nodes (115): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+107 more)

### Community 9 - "contracts.ts"
Cohesion: 0.03
Nodes (82): activityDetailsUnavailable(), activityNotInLog(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate (+74 more)

### Community 10 - "session-presentation.ts"
Cohesion: 0.03
Nodes (99): CategoryState, CollapsedCategoryShows, SessionCategory, DEFAULT_SESSION_PROVIDER, configureRuntime(), saveSessionOrderLane(), handleDragEnd(), stepSession() (+91 more)

### Community 11 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (55): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+47 more)

### Community 12 - "oracle-voice-soak.ts"
Cohesion: 0.04
Nodes (45): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+37 more)

### Community 13 - "VoiceClientControl"
Cohesion: 0.03
Nodes (34): VoiceClientControl, BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl (+26 more)

### Community 14 - "CopilotClientLike"
Cohesion: 0.02
Nodes (68): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+60 more)

### Community 15 - "ManagerStore"
Cohesion: 0.04
Nodes (40): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+32 more)

### Community 16 - "ManagedSession"
Cohesion: 0.07
Nodes (18): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), ManagerEventSource, registerHubRoutes(), SessionMuteCarrier, ManagerProactiveCoordinatorOptions (+10 more)

### Community 17 - "client.ts"
Cohesion: 0.05
Nodes (37): ManagerClientDefaults, VoiceServerControl, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason(), isCapabilities() (+29 more)

### Community 18 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (67): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+59 more)

### Community 19 - "manager-tools.ts"
Cohesion: 0.04
Nodes (48): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), categoryTools() (+40 more)

### Community 20 - "app.ts"
Cohesion: 0.04
Nodes (55): RFC-9110, root, serve(), work, apps, directories, buildApp(), BuildAppOptions (+47 more)

### Community 21 - "schedule-launcher.ts"
Cohesion: 0.07
Nodes (31): LaunchPrimitives, provenance(), ScheduleProvenance, scheduleSessionTitle(), SessionScheduleLauncher, NoopScheduleLauncher, ScheduleLauncher, ScheduleLaunchRefusedError (+23 more)

### Community 22 - "BackgroundTask"
Cohesion: 0.05
Nodes (46): nextVoiceControl(), Client, apps, directories, FakeManager, fixture(), trusted, changedInPlace() (+38 more)

### Community 23 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 24 - "HubEvent"
Cohesion: 0.06
Nodes (51): ComputerManagerEvents, NotificationRecorder, attentionClosed(), attentionSeed(), classifyHostNotification(), classifyHubNotification(), classifyOracleNotification(), classifyScheduleNotification() (+43 more)

### Community 25 - "ManagerAgent"
Cohesion: 0.07
Nodes (16): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), capturePrompt() (+8 more)

### Community 26 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (18): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, requestBytes(), client(), servers, session (+10 more)

### Community 27 - "manager.ts"
Cohesion: 0.05
Nodes (31): FakeManager, FakeVoiceState, ProactiveManager, FakeAgent, confirmationSchema, defaultsSchema, editSchema, effort (+23 more)

### Community 28 - "schedules.ts"
Cohesion: 0.05
Nodes (61): proposalInput, State, stateSchema, timestamp, action, create, existing, metadata (+53 more)

### Community 29 - "schedule-launcher.test.ts"
Cohesion: 0.04
Nodes (43): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+35 more)

### Community 30 - "manager-agent.ts"
Cohesion: 0.05
Nodes (38): DreamerProgressSnapshot, DreamerProgressView, automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent (+30 more)

### Community 31 - "oracle-task-store.ts"
Cohesion: 0.06
Nodes (48): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+40 more)

### Community 32 - "dreamer-service.ts"
Cohesion: 0.09
Nodes (26): boundedText(), digest(), DreamerFollowUp, DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), safeRunError() (+18 more)

### Community 33 - "AppSettingsDialog.tsx"
Cohesion: 0.06
Nodes (60): NewSessionBackendSetting, activateSession(), createSession(), deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), listHistory(), savePushSubscription() (+52 more)

### Community 34 - "oracle-voice-worker.ts"
Cohesion: 0.06
Nodes (26): benchmarkGroup(), VoiceEngineSession, VoiceSttEngine, VoiceTtsEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine (+18 more)

### Community 35 - "hub-routes.ts"
Cohesion: 0.04
Nodes (56): ClientPresence, PRESENCE_TTL_MS, addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+48 more)

### Community 36 - "oracle-voice.ts"
Cohesion: 0.06
Nodes (51): sendNodeVoiceOutput(), outputBytes(), backendOutputBytes(), VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities (+43 more)

### Community 37 - "notification-center.integration.test.ts"
Cohesion: 0.06
Nodes (31): center(), directories, directory(), hub(), now, runtimes, trusted, NotificationCenterService (+23 more)

### Community 38 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (29): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+21 more)

### Community 39 - "dictation-routes.test.ts"
Cohesion: 0.05
Nodes (32): FAKE_CLOCK_SECONDS, FakeDictationEngine, FakeDictationState, registerFakeDictationControls(), apps, connect(), FakeEngine, open() (+24 more)

### Community 40 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (16): afterExit(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, FormReplyDeadlineError, listTmuxSessions(), processAncestors() (+8 more)

### Community 41 - "ProviderSessionService"
Cohesion: 0.06
Nodes (3): updateComputerForLaunchIdentity(), owns(), ProviderSessionService

### Community 42 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 43 - "node-routes.ts"
Cohesion: 0.06
Nodes (42): closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+34 more)

### Community 44 - "ActivityDetails.tsx"
Cohesion: 0.07
Nodes (42): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, TOOL_CALL_ID_PATTERN, toolCallIdFromActivityId(), ActivityStatus, activityDetailFailure, detailKey(), formatBytes(), keep() (+34 more)

### Community 45 - "live-dictation-session.ts"
Cohesion: 0.07
Nodes (18): DecodedTokens, joinWords(), normalizeWord(), fixture, TimedWord, WordAgreement, wordsFromTokens(), AudioChunk (+10 more)

### Community 46 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (47): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DREAMER_PROGRESS_REFRESH_MS, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError (+39 more)

### Community 47 - "sampler.ts"
Cohesion: 0.08
Nodes (45): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+37 more)

### Community 48 - "parakeet-worker.ts"
Cohesion: 0.08
Nodes (23): abortError(), ChildHandle, DecodeRequest, errorMessage(), PARAKEET_MAX_WINDOW_SECONDS, ParakeetChildProcess, ParakeetUnavailableError, ParakeetWorker (+15 more)

### Community 49 - "ui-locks.pw.ts"
Cohesion: 0.06
Nodes (38): { values }, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns, fixtureSchedules, chromeBudget, chromeTargets (+30 more)

### Community 50 - "feature-flags.ts"
Cohesion: 0.10
Nodes (34): hub(), defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable(), parseFeatureFlag() (+26 more)

### Community 51 - "ComposerActions.tsx"
Cohesion: 0.07
Nodes (27): families, modelFamily, shortModelName(), repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions() (+19 more)

### Community 52 - "dreamer-planner.ts"
Cohesion: 0.06
Nodes (36): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+28 more)

### Community 53 - "SessionService"
Cohesion: 0.07
Nodes (5): registerNodeRoutes(), obstructUploads(), SessionService, WorkspaceListing, KnowledgeFolderState

### Community 54 - "ManagerAssistant.tsx"
Cohesion: 0.07
Nodes (46): proactivePromptEvents(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), phoneEnterCreatesNewline(), ActivityRow (+38 more)

### Community 55 - "SettingsProfileSnapshot"
Cohesion: 0.08
Nodes (27): WorkspaceFixtureState, directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore (+19 more)

### Community 56 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (51): addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, copyTask() (+43 more)

### Community 57 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (22): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+14 more)

### Community 58 - "UserInputReplyInput"
Cohesion: 0.07
Nodes (10): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), formReplyExpired(), TerminalFormReplyError, TerminalSessionController, PendingUserInput (+2 more)

### Community 59 - "LocalTranscriptionService"
Cohesion: 0.08
Nodes (21): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+13 more)

### Community 60 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (43): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+35 more)

### Community 61 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 62 - "RecentlyClosed.tsx"
Cohesion: 0.06
Nodes (35): closedSessionExpiresAt(), changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame() (+27 more)

### Community 63 - "setupWorkspaceFixture"
Cohesion: 0.05
Nodes (23): desktop, devices, long, open(), phone, veryLong, devices, markedState() (+15 more)

### Community 64 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (41): editsFor(), benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, buildConfig(), CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 65 - "parakeet-child.ts"
Cohesion: 0.08
Nodes (32): createParakeetChild(), decodeResult(), errorMessage(), finiteNumbers(), hasCreateAsync(), normalizeParakeetSherpaModule(), PARAKEET_MODEL_FILES, ParakeetChild (+24 more)

### Community 66 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressEntry, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest (+12 more)

### Community 67 - "react"
Cohesion: 0.09
Nodes (34): react, CLAUDE_SCHEDULE_UNAVAILABLE_REASON, scheduleProviderUnavailableReason(), ScheduleTarget, FeatureEvent, listeners, publishFeatureEvent(), subscribeFeatureEvents() (+26 more)

### Community 68 - "AgentProvider"
Cohesion: 0.06
Nodes (30): Seen, PersistedCursor, NotificationCursor, Row, apps, dataDirectory(), directories, pairedFixture() (+22 more)

### Community 69 - "use-live-dictation.ts"
Cohesion: 0.09
Nodes (25): DictationCapabilities, beginSpan(), cancelSpan(), changedRange(), clamp(), DictationSpan, insertedText(), paragraphSeparator() (+17 more)

### Community 70 - "SchedulerStore"
Cohesion: 0.13
Nodes (7): fixture(), deferUnboundWorktree(), failure(), SchedulerStore, ScheduleProposal, Schedule, ScheduleRunStatus

### Community 71 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 72 - "processes.ts"
Cohesion: 0.08
Nodes (25): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessStat, expectProc(), ProcessFixture, processStatFixture() (+17 more)

### Community 73 - "session-launcher.ts"
Cohesion: 0.07
Nodes (26): ClaudeSdk, awaitTermination(), LaunchCreations, apps, directories, directory(), runtime(), services (+18 more)

### Community 74 - "PushNotificationService"
Cohesion: 0.10
Nodes (11): start(), HubEventSource, OracleEventSource, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema (+3 more)

### Community 75 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 76 - "live-dictation-benchmark.ts"
Cohesion: 0.08
Nodes (27): batchText(), Clip, dictate(), fixtureDirectory, listen(), main(), median(), NoSessions (+19 more)

### Community 77 - "shell.ts"
Cohesion: 0.09
Nodes (35): ScheduleShellNotifier, attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label() (+27 more)

### Community 78 - "FakeVoiceController"
Cohesion: 0.09
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 79 - "schedule-recurrence.ts"
Cohesion: 0.10
Nodes (37): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+29 more)

### Community 80 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 81 - "workspace-fixtures.ts"
Cohesion: 0.07
Nodes (24): oracleHostStatusFixture(), devices, BACKGROUND_SESSION_ID, documents, FIXTURE_NOW, fixtureArguments(), fixtureComputers, fixtureEndpoints (+16 more)

### Community 83 - "transcription-service.ts"
Cohesion: 0.07
Nodes (27): ParakeetDecoder, TRANSCRIPTION_TIMEOUT_MS, TranscriptionEngineConfig, CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner() (+19 more)

### Community 84 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 85 - "devDependencies"
Cohesion: 0.05
Nodes (39): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+31 more)

### Community 86 - "active-sessions.ts"
Cohesion: 0.11
Nodes (32): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+24 more)

### Community 87 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (29): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+21 more)

### Community 88 - "manager-proactive-coordinator.ts"
Cohesion: 0.12
Nodes (12): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, SessionLifecycle, directories, fixture() (+4 more)

### Community 89 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (32): ManagerStructuredMemorySearchIndex, ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES (+24 more)

### Community 90 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 91 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (27): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger(), canonicalPath() (+19 more)

### Community 92 - "sections.tsx"
Cohesion: 0.12
Nodes (22): AppVersion, HubHealth, AppearanceSetting, getHubHealth(), CollapsedCategoriesSetting(), SettingScope(), HealthCard(), accentThemes (+14 more)

### Community 93 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 94 - "response-compression.test.ts"
Cohesion: 0.07
Nodes (20): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), apps (+12 more)

### Community 95 - "dictation-routes.ts"
Cohesion: 0.09
Nodes (23): DictationComputers, DictationRouteOptions, DictationTarget, outdatedReason(), registerDictationRoutes(), RelayContext, RelayPhase, statusCodeOf() (+15 more)

### Community 96 - "KnowledgeStore"
Cohesion: 0.12
Nodes (14): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+6 more)

### Community 97 - "tmux-test-helpers.ts"
Cohesion: 0.13
Nodes (28): directories, Screens, [root], assertSameIdentity(), createIsolatedTmuxRoot(), execFileAsync, isolatedTmuxEnv(), lifelines (+20 more)

### Community 98 - "manager-proactive-inbox.ts"
Cohesion: 0.09
Nodes (34): assertExactKeys(), canonicalHash(), DISPOSITIONS, eventId(), hasExactKeys(), isDisposition(), isEventKind(), isId() (+26 more)

### Community 99 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+24 more)

### Community 100 - "pipeline.test.tsx"
Cohesion: 0.11
Nodes (26): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+18 more)

### Community 101 - "session-prefetch.ts"
Cohesion: 0.10
Nodes (23): browserConnection, ConnectionHints, connectionSparesData(), IdleScheduler, PASSIVE_READS_SINCE, PREFETCH_PASS_BYTES, PREFETCH_SIDEBAR_ROWS, readsPassively() (+15 more)

### Community 102 - "live-dictation-client.test.ts"
Cohesion: 0.08
Nodes (11): Inbox, rawText(), DictationServerMessage, PcmCapture, ClientDeps, DictationSocket, fetchDictationCapabilities(), FakeCapture (+3 more)

### Community 103 - "ManagerStructuredMemoryStore"
Cohesion: 0.16
Nodes (9): initializeManagerStructuredMemory(), digest(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMutationResult (+1 more)

### Community 104 - "EngineVoiceBackendSession"
Cohesion: 0.18
Nodes (5): asSessionError(), disconnectCause(), EngineVoiceBackendSession, outputBytes(), sameUtterance()

### Community 105 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 106 - "manager-context.ts"
Cohesion: 0.13
Nodes (26): ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine(), followUpLine() (+18 more)

### Community 107 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (19): FakeVoiceEngineCall, apps, config, configFixture(), connect(), Inbox, issueTicket(), localRuntime() (+11 more)

### Community 108 - "controls.tsx"
Cohesion: 0.12
Nodes (30): listDirectories(), AddKnowledgeRootDialog(), browse(), shortcutKeys(), readStoredShortcuts(), AppShortcutBinding, binding(), bindingLabel() (+22 more)

### Community 109 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (28): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+20 more)

### Community 110 - "SessionOrderStore"
Cohesion: 0.15
Nodes (13): stores(), orderStore(), carried(), laneFrom(), retire(), sameLane(), sessionOrderKey(), SessionOrderState (+5 more)

### Community 111 - "ChatMessage"
Cohesion: 0.13
Nodes (19): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, storedTranscript(), ChatMessage, carriedBefore(), pageTranscript() (+11 more)

### Community 112 - "HostTelemetrySampler"
Cohesion: 0.09
Nodes (10): prefixes, session, trusted, untrusted, HostTelemetryClock, HostTelemetrySampler, HostTelemetryService, defaultDependencies() (+2 more)

### Community 113 - "dreamer-store.ts"
Cohesion: 0.10
Nodes (27): DreamerHistoryEntry, assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_STAGING_PREFIX (+19 more)

### Community 114 - "service.ts"
Cohesion: 0.11
Nodes (19): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, HostRequest (+11 more)

### Community 115 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (17): cancelManager(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability, empty (+9 more)

### Community 116 - "VoicePlayback"
Cohesion: 0.13
Nodes (6): pcm16ToFloat(), SegmentDrain, FakeSource, harness(), validateGeneration(), VoicePlayback

### Community 117 - "transcript-test-helpers.ts"
Cohesion: 0.14
Nodes (17): contextChangedInEvents(), createPendingUserInputTracker(), isEmptyResponseNotice(), pendingUserInputFromEvents(), PendingUserInputTracker, runtimeInfoFromEvents(), RuntimeTracker, SessionEventProjection (+9 more)

### Community 118 - "ManagerAttachment"
Cohesion: 0.14
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 119 - "server/skill-settings.ts"
Cohesion: 0.15
Nodes (18): frontmatterFields(), frontmatterReason(), readBounded(), revision(), registerSkillSettingsRoutes(), SkillSettingsTarget, scalar(), settingsObject() (+10 more)

### Community 120 - "check-workspace-review-regressions.ts"
Cohesion: 0.08
Nodes (23): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+15 more)

### Community 121 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 122 - "session-directory.ts"
Cohesion: 0.16
Nodes (21): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+13 more)

### Community 123 - "tmux-errors.integration.test.ts"
Cohesion: 0.10
Nodes (25): foreignSocketPlace(), execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer() (+17 more)

### Community 124 - "capture-workspace.ts"
Cohesion: 0.14
Nodes (23): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+15 more)

### Community 125 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (17): phases, port, app(), directories, headers, launcher, createStartupPhases(), silentStartupPhases (+9 more)

### Community 126 - "OracleVoiceCoordinator"
Cohesion: 0.15
Nodes (5): AudioCompletion, AudioGate, OracleVoiceCoordinator, resolvedAudioGate(), ActiveConversation

### Community 127 - "BackgroundTasksDialog.tsx"
Cohesion: 0.14
Nodes (23): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+15 more)

### Community 128 - "dictation/capture.ts"
Cohesion: 0.09
Nodes (14): DICTATION_LIMITS, CaptureDeps, createPcmCapture(), defaultDeps(), DICTATION_FRAME_SAMPLES, PageVisibility, PCM_CAPTURE_PROCESSOR, PcmCaptureError (+6 more)

### Community 129 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (23): isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+15 more)

### Community 130 - "real-voice.ts"
Cohesion: 0.13
Nodes (11): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+3 more)

### Community 131 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 132 - "manager-structured-memory-search.ts"
Cohesion: 0.13
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 133 - "submission-error.ts"
Cohesion: 0.12
Nodes (21): DEFAULT_COLLAPSED_CATEGORY_SHOWS, SessionCategoryChange, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, SubmissionReceipt, submissionReceiptFromError() (+13 more)

### Community 134 - "live-dictation-client.ts"
Cohesion: 0.17
Nodes (11): DICTATION_CLIENT_FINAL_TIMEOUT_MS, DICTATION_CLIENT_READY_TIMEOUT_MS, DictationClientMessage, cancelled(), ClientState, DictationClientError, DictationTextState, errorMessage() (+3 more)

### Community 135 - "session-transcript.ts"
Cohesion: 0.14
Nodes (21): TRANSCRIPT_CARRIED_LIMIT, sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+13 more)

### Community 136 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 137 - "DreamerCapacityError"
Cohesion: 0.14
Nodes (12): clone(), DreamerCapacityError, DreamerConflictError, escapeRegExp(), mergeCoverageIncrements(), publicPlan(), sameCompletionEvidence(), sameIds() (+4 more)

### Community 138 - "dictation.ts"
Cohesion: 0.15
Nodes (22): ConnectionContext, DEFAULT_LIMITS, DICTATION_CLOSE_CODES, exactArrayBuffer(), LiveDictationHostLimits, LiveDictationHostOptions, Phase, LiveDictationOptions (+14 more)

### Community 139 - "session-categories.ts"
Cohesion: 0.18
Nodes (22): Fields, isRecord(), parseState(), validName(), applySessionCategoryChange(), clamp(), existing(), isCollapsedCategoryShows() (+14 more)

### Community 140 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 141 - "background-task-stop.test.ts"
Cohesion: 0.14
Nodes (17): BackgroundTaskEventOptions, BackgroundTaskProjector, backgroundTasksFromEvents(), completed(), handoff(), launched(), nativeStart(), readExit() (+9 more)

### Community 142 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 143 - ".toolHost"
Cohesion: 0.13
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 144 - "session-category-routes.ts"
Cohesion: 0.10
Nodes (17): createSchema, deleteSchema, keys(), listedInSessionOrder(), moveSchema, name, paramsSchema, parse() (+9 more)

### Community 145 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 146 - "RuntimeModelOption"
Cohesion: 0.13
Nodes (14): RuntimeModelOption, getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus() (+6 more)

### Community 147 - "session-resource-providers.test.ts"
Cohesion: 0.11
Nodes (19): cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), claudeFixture(), ClaudeMcpRead (+11 more)

### Community 148 - "oracle-voice-assets.test.ts"
Cohesion: 0.14
Nodes (20): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+12 more)

### Community 149 - "session-unread.pw.ts"
Cohesion: 0.11
Nodes (11): bounds(), devices, edgeState(), open(), screenshot(), unreadState(), fixtureBackgroundTasks, WorkspaceFixtureOptions (+3 more)

### Community 150 - "DictationConnection"
Cohesion: 0.24
Nodes (5): DictationConnection, elapsed(), errorMessage(), rawBuffer(), DictationFinalReason

### Community 151 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+10 more)

### Community 152 - "host-telemetry.ts"
Cohesion: 0.14
Nodes (18): aggregate, DiskSpaceSchema, HostHistorySchema, HostInfoSchema, HostMetricAggregate, HostMetricAggregateSchema, HostMetrics, HostMetricsSchema (+10 more)

### Community 153 - "vite.config.ts"
Cohesion: 0.12
Nodes (12): brotliAsync, compress(), gzipAsync, precompressDirectory(), PrecompressedFile, directories, canaryTests, oracleVoiceAssetNames (+4 more)

### Community 154 - "normalizeKnowledgeRelativePath"
Cohesion: 0.18
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+10 more)

### Community 155 - "ManagerProactiveInbox"
Cohesion: 0.20
Nodes (6): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 156 - "SessionCategoryStore"
Cohesion: 0.26
Nodes (6): categories(), key(), refused(), remember(), SessionCategoryStore, SessionCategoriesSnapshot

### Community 157 - "oracle-voice-segments.ts"
Cohesion: 0.16
Nodes (21): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+13 more)

### Community 158 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 159 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 160 - "session-category-store.test.ts"
Cohesion: 0.12
Nodes (8): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, directories, folder(), store(), CLOSED_SESSION_RETENTION_MS

### Community 161 - "DreamerStore"
Cohesion: 0.24
Nodes (4): assertUniqueJsonKeys(), DreamerRecoveryError, DreamerStore, isMissing()

### Community 162 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 163 - "oracle-status.test.ts"
Cohesion: 0.16
Nodes (16): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+8 more)

### Community 164 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 165 - "workspace-browser.ts"
Cohesion: 0.21
Nodes (17): validateKnowledgeRoot(), assertOpenedFilePath(), fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath() (+9 more)

### Community 166 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 167 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 168 - "markdown-navigation.ts"
Cohesion: 0.18
Nodes (19): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+11 more)

### Community 169 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 170 - "agent-service-event-projection.test.ts"
Cohesion: 0.14
Nodes (17): at(), directories, finish(), launch(), projected(), services, sessionLog(), syncSessionTranscript() (+9 more)

### Community 171 - "alerts.test.ts"
Cohesion: 0.14
Nodes (9): HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, computer, observe(), snapshot(), start, sustained(), HostTelemetryTarget (+1 more)

### Community 172 - "live-dictation-session.test.ts"
Cohesion: 0.16
Nodes (11): LiveDecodeOptions, LiveDecoder, contextDecoder(), decoded(), DecoderCall, feeder(), Reply, scriptDecoder() (+3 more)

### Community 173 - "session-clear-transcript.test.ts"
Cohesion: 0.13
Nodes (6): SessionAdmissions, disk, fixtures, gate(), holdTurnWrite(), releases

### Community 174 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 175 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 176 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 177 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 178 - "DictationRelay"
Cohesion: 0.27
Nodes (4): DictationRelay, sendableCloseCode(), closeReason(), DictationErrorCode

### Community 179 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 180 - "NotificationRecord"
Cohesion: 0.22
Nodes (13): NotificationState, NotificationRecord, NotificationGroup, notificationGroups(), NotificationTab, kindIcon(), NotificationPanel(), Inbox() (+5 more)

### Community 181 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 182 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 183 - "SessionResources.tsx"
Cohesion: 0.12
Nodes (13): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, SessionResourcesDialog(), sessionResourceOwner(), Catalog, CatalogResult, SessionResources() (+5 more)

### Community 184 - "use-markdown-document.test.tsx"
Cohesion: 0.16
Nodes (8): drawnInParts(), DocumentRenderEvent, RenderedDocumentTree, DocumentRenderer, DocumentRendererContext, synchronousRenderer, components, show()

### Community 185 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 186 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 187 - "node:fs/promises"
Cohesion: 0.16
Nodes (10): root, script, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, installFakeDictationCapture(), desktop, open() (+2 more)

### Community 188 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 189 - ".confirmSpeech"
Cohesion: 0.25
Nodes (3): errorMessage(), OperationTimeoutError, withTimeout()

### Community 190 - "recovery-resend-durability.test.ts"
Cohesion: 0.14
Nodes (13): directories, disk, fixture(), gate(), gates, initialize(), PublicSessionValue, runtimes (+5 more)

### Community 191 - "tmux-test-helpers.integration.test.ts"
Cohesion: 0.17
Nodes (13): abandoned, abandonFixture(), creatorCommand(), execute, expectRetired(), fixture(), isRetired(), processState() (+5 more)

### Community 192 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (11): getSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity, first (+3 more)

### Community 193 - "pipeline.ts"
Cohesion: 0.21
Nodes (16): partlyHeldRenderer(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform(), drawSteps(), growable, htmlBlocks (+8 more)

### Community 194 - "renderer.test.ts"
Cohesion: 0.16
Nodes (8): render, scope, createWorkerRenderer(), RendererWorker, FakeWorker, startWorkers(), handleRenderRequest(), RenderRequest

### Community 195 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 196 - "session-latency-benchmark.ts"
Cohesion: 0.23
Nodes (15): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+7 more)

### Community 197 - "registerSessionKnowledgeRoutes"
Cohesion: 0.26
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 198 - "closed-sessions.ts"
Cohesion: 0.20
Nodes (13): blockParents, closedCapitals(), closedSessionContext(), excerpt(), head(), htmlElements, htmlText(), isClosedSessionContext() (+5 more)

### Community 199 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 201 - "session-knowledge-routes.ts"
Cohesion: 0.13
Nodes (10): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema, SessionKnowledgeLifecycle (+2 more)

### Community 202 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 203 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 204 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 205 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 206 - "DictationStatus.tsx"
Cohesion: 0.20
Nodes (7): ActiveDictationStatus, DictationStatus(), dictationStatusLabel(), LiveDictationStatus, recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 207 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 208 - "session-categories.pw.ts"
Cohesion: 0.21
Nodes (9): bounds(), build(), categorizedState(), devices, drag(), middle(), open(), Point (+1 more)

### Community 209 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 210 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 211 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 212 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 213 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 215 - "recently-closed.pw.ts"
Cohesion: 0.23
Nodes (9): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), open(), row() (+1 more)

### Community 217 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 218 - "manager-automatic.ts"
Cohesion: 0.25
Nodes (8): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, failed, finished

### Community 219 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 220 - "transcription-benchmark.ts"
Cohesion: 0.25
Nodes (10): ClipResult, Engine, firstSeconds(), Fixture, fixtureDirectory, main(), report(), repository (+2 more)

### Community 221 - "dreamer-store.test.ts"
Cohesion: 0.18
Nodes (8): DREAMER_MAX_ZONES, DREAMER_STATE_VERSION, DreamerStoreSnapshot, DreamerStoreState, directories, plan, DreamerPlan, DreamerSettings

### Community 222 - "transport.test.ts"
Cohesion: 0.22
Nodes (7): readingFixture(), empty, inventory, listen(), make(), pair(), reader()

### Community 223 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 224 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 225 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 227 - "SpeakableSegmenter"
Cohesion: 0.29
Nodes (3): SpeakableSegmenter, validateMessageId(), ./server/oracle-voice-segments.ts

### Community 228 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 229 - "history-projection.test.ts"
Cohesion: 0.31
Nodes (7): eventsFor(), groupedEventsFor(), ModelMessage, questionEventsFor(), random(), seedOffset, terminalTypes

### Community 231 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 232 - "ManagerProactiveInboxValidationError"
Cohesion: 0.28
Nodes (6): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions()

### Community 233 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 234 - "session-category-routes.test.ts"
Cohesion: 0.25
Nodes (6): directories, fakeManager(), host, hub(), members(), startHub()

### Community 235 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 236 - "DocumentHeading"
Cohesion: 0.25
Nodes (5): DocumentViewControls(), actions, outline, MarkdownDocumentView, DocumentHeading

### Community 237 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 238 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 239 - "SkillSettingsService"
Cohesion: 0.29
Nodes (4): applications, directories, fixture(), SkillSettingsService

### Community 240 - "session-list-collisions.test.ts"
Cohesion: 0.32
Nodes (4): kind(), sessionListCollisions(), Args, layout

### Community 242 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 243 - "session-order-routes.test.ts"
Cohesion: 0.43
Nodes (6): directories, fakeManager(), hub(), settled(), until(), upserted()

### Community 244 - "SessionOriginBadge.tsx"
Cohesion: 0.43
Nodes (5): SessionProvenance, sessionOriginDescription(), icons, labels, SessionOriginBadge()

### Community 245 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 246 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.53
Nodes (4): benchmarkState(), now(), openFixture(), searchSamples()

### Community 247 - "refusal-metrics-routes.test.ts"
Cohesion: 0.33
Nodes (4): directories, runtimes, start(), trusted

### Community 248 - "skill-settings-jsonc.ts"
Cohesion: 0.60
Nodes (4): document(), parseSkillSettings(), replaceDisabledSkills(), Token

### Community 249 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 250 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1600 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1595 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2757 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `SessionDetail`, `AgentService`, `cli-canary.ts`, `SessionStore`, `oracle-voice-soak.ts`, `ManagerStore`, `ManagedSession`, `session-category-routes.ts`, `oracle-voice-assets.test.ts`, `schedule-launcher.ts`, `HubEvent`, `ManagerAgent`, `ManagerProactiveInbox`, `manager.ts`, `schedule-launcher.test.ts`, `manager-agent.ts`, `oracle-task-store.ts`, `dreamer-service.ts`, `SessionCategoryStore`, `oracle-voice-worker.ts`, `hub-routes.ts`, `notification-center.integration.test.ts`, `dictation-routes.test.ts`, `ProviderSessionService`, `alerts.test.ts`, `node-routes.ts`, `parakeet-worker.ts`, `feature-flags.ts`, `SessionService`, `SettingsProfileSnapshot`, `UserInputReplyInput`, `LocalTranscriptionService`, `SchedulerStore`, `PushNotificationService`, `transcription-service.ts`, `manager-proactive-coordinator.ts`, `oracle-voice-config.ts`, `response-compression.test.ts`, `dictation-routes.ts`, `KnowledgeStore`, `ManagerStructuredMemoryStore`, `SessionKnowledgeStore`, `SessionOrderStore`, `SkillSettingsService`, `HostTelemetrySampler`, `service.ts`, `server/skill-settings.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `SessionStore`, `session-directory.ts`, `terminal-session.ts`, `agent-service.ts`, `contracts.ts`, `ChatMessage`, `claude-agent-service.ts`, `UserInputReplyInput`, `.readBackgroundTasks`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `SessionDetail`, `AgentService`, `agent-service.ts`, `contracts.ts`, `ChatMessage`, `ManagerAttachment`, `UserInputReplyInput`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `AppWorkspace()` (e.g. with `submitMessage()` and `prefersLightNow()`) actually correct?**
  _`AppWorkspace()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1600 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.027882982891471855 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.02738095238095238 - nodes in this community are weakly interconnected._
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
