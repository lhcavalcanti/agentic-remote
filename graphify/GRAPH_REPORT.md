# Agentic Remote - Graphify code map

Snapshot: `f957e0e4954a567f886b4e4f43a6ab51156e5c2704eee3fbb2d7c40bc470ad55`

Source checkout: `d3e9706286dce3881ea8e8f57b338c62b832e49f`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 658 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 658 files · ~1,169,379 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9201 nodes · 26570 edges · 262 communities (213 shown, 31 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1323 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- AppWorkspace
- api.ts
- SessionStore
- oracle-voice-session.ts
- SessionDetail
- OracleVoiceCoordinator
- App.tsx
- oracle-voice-child.ts
- oracle-voice.ts
- terminal-session.ts
- SessionService
- agent-service.ts
- claude-agent-service.ts
- client.ts
- ManagedSession
- sessionKey
- sections.tsx
- contracts.ts
- manager.ts
- ManagerStore
- manager-tools.ts
- workspace-fixtures.ts
- RemoteNodeClient
- oracle-voice-soak.ts
- agentic-remote-promotion-monitor
- dreamer-store.ts
- app.ts
- shared/settings-profile.ts
- ManagerAgent
- ChatMessage
- host-telemetry.ts
- oracle-voice-worker.ts
- AppSettingsDialog.tsx
- react
- node-routes.ts
- sampler.ts
- CopilotSessionLike
- transcription-service.ts
- computer-manager.ts
- active-sessions.ts
- oracle-task-store.ts
- oracle-voice-integration.test.ts
- setupWorkspaceFixture
- CopilotClientLike
- manager-agent.ts
- oracle-voice-benchmark.ts
- multi-node.test.ts
- session-store-providers.test.ts
- manager-structured-memory-validation.ts
- src/settings-profile.ts
- UserInputReplyInput
- session-directory.ts
- session-knowledge-routes.test.ts
- TmuxTerminalSessionController
- session-knowledge-store.ts
- fake-voice.ts
- background-task-adapter.ts
- DreamerService
- OracleDreamer.tsx
- agentic-remote
- processes.ts
- tmux-test-helpers.ts
- SchedulerStore
- ComposerActions.tsx
- dreamer-progress.ts
- terminal-session.test.ts
- agentic-remote-gate
- server/skill-settings.ts
- bundle
- request
- session-resource-clear.test.ts
- VoicePlayback
- terminal-startup-queue.test.ts
- PushNotificationService
- notification-store.ts
- shell.ts
- lib.rs
- schedule-recurrence.ts
- ManagerAssistant.tsx
- dependencies
- manager-proactive-coordinator.ts
- agentic-remote-promotion-setup
- hub-routes.ts
- KnowledgeStore
- SessionOrderStore
- devDependencies
- config.rs
- transcript-test-helpers.ts
- manager-agent.test.ts
- schedule-proposals.ts
- response-compression.test.ts
- .takeInTranscript
- schedule-notifications.integration.test.ts
- oracle-voice-config.ts
- schedules.ts
- BackgroundTasksDialog.tsx
- manager-proactive-inbox.ts
- manager-structured-memory.ts
- EngineVoiceBackendSession
- use-markdown-document.test.tsx
- closed-sessions.ts
- dreamer-planner.ts
- SchedulerDispatcher
- client.test.ts
- agent-service.test.ts
- notification-classifier.ts
- send-matrix.integration.test.ts
- markdown-navigation.ts
- background-task-stop.test.ts
- push-notification-service.ts
- pipeline.ts
- capture-workspace.ts
- session-latency-benchmark.ts
- ManagerAttachment
- session-patch-browser.ts
- startup-phases.test.ts
- real-voice.ts
- schedule-launcher.ts
- cli-canary.ts
- HubEvent
- notification-center.ts
- scripts
- use-session-knowledge-root.ts
- registerSessionKnowledgeRoutes
- manager-structured-memory-search.ts
- use-markdown-document.ts
- HostMonitorView.test.tsx
- compilerOptions
- ManagerStructuredMemoryStore
- oracle-voice-segments.ts
- ManagerAssistant.test.tsx
- session-response-order.ts
- oracle-voice-tickets.ts
- isTerminalComposerFooter
- capture.ts
- compilerOptions
- .discoverSessions
- full-gate.test.ts
- normalizeKnowledgeRelativePath
- session-reply-durability.test.ts
- knowledge-tree.ts
- compilerOptions
- dreamer-service.ts
- .toolHost
- ManagerProactiveInbox
- schedule-notification-service.test.ts
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- server/session-patches.ts
- agent-service-event-projection.test.ts
- dreamer-schedule.ts
- HostSnapshot
- oracle-status.test.ts
- promotion-monitor.test.ts
- PromptCards.tsx
- BoundedQueue
- ReaderWorkspace
- session-unread.pw.ts
- scripts
- terminal-form-deadline.test.ts
- SessionStatus
- NotificationCenterService
- session-resource-routes.test.ts
- VoiceCapture
- capture-workbench-review.ts
- package.json
- oracle-voice-assets.test.ts
- SessionAdmissions
- pending-echo.ts
- fake-vad.ts
- desktop.json
- DeferredSession
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- dreamer-service.test.ts
- .observe
- session-scope.ts
- manager-automatic.ts
- captureFailure
- Pcm16Resampler
- document-render.pw.ts
- copilot-sdk-client.ts
- manager-proactive-inbox.test.ts
- use-oracle-attachments.ts
- html-preview.ts
- command-catalog-cache.test.ts
- dreamer-routes.ts
- isRecord
- .initialize
- server/side-question.ts
- dataset
- generate-pwa-icons.ts
- notification-center.integration.test.ts
- bridge.rs
- transcribeAudio
- vite.config.ts
- history-projection.test.ts
- logs-cli.test.ts
- ManagerProactiveInboxValidationError
- manager-structured-memory-performance.test.ts
- promotion-setup-execution.test.ts
- SkillsSettings.tsx
- VoiceVadOptions
- fixture-frontend.ts
- doctor-cli.test.ts
- release-publication.test.ts
- UserInputFieldControl
- vad-assets.ts
- composer-layout.test.ts
- HostTelemetryClock
- settings.ts
- DocumentViewControls.tsx
- VoiceCaptureOptions
- OracleVoiceClientDependencies
- usePanelWidth
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- SessionKnowledgeLifecycle
- markdownComponentsFor
- FakeRecorder
- MemoryStorage
- .discoverTerminalSessions
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
1. `AppWorkspace()` - 349 edges
2. `SessionDetail` - 327 edges
3. `AgentService` - 317 edges
4. `SessionStore` - 218 edges
5. `ManagedSession` - 181 edges
6. `buildApp()` - 141 edges
7. `ClaudeAgentService` - 133 edges
8. `registerHubRoutes()` - 111 edges
9. `ComputerManager` - 106 edges
10. `ManagerAgent` - 101 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `FakeVoiceState` --references--> `ManagerMessage`  [EXTRACTED]
  e2e/fixtures/fake-voice.ts → shared/manager.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `ClaudeAgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (262 total, 31 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (16): agentMode(), AgentService, isTerminalNotReadyRefusal(), sessionInUseConflictMessage(), sessionInUseQueueMessage(), terminalAnswerRefused(), terminalComposerUnreadable(), preparePrompt() (+8 more)

### Community 1 - "AppWorkspace"
Cohesion: 0.03
Nodes (175): isManagerEvent(), askSession(), clearConversation(), closeSession(), readKnowledgeFile(), recoverConversation(), removeQueuedPrompt(), reorderQueuedPrompts() (+167 more)

### Community 2 - "api.ts"
Cohesion: 0.02
Nodes (155): AddComputerInput, AddKnowledgeRootInput, ManagedQueuedPromptDispatchResult, PushSettings, SessionKnowledgeRootMutationInput, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary (+147 more)

### Community 3 - "SessionStore"
Cohesion: 0.03
Nodes (101): fixture(), restart(), fixture(), connect(), createStore(), deferred(), disk, enqueue() (+93 more)

### Community 4 - "oracle-voice-session.ts"
Cohesion: 0.02
Nodes (79): apps, directories, voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngine, FakeVoiceEngineCall, FakeVoiceEngineFactory, identityKey() (+71 more)

### Community 5 - "SessionDetail"
Cohesion: 0.04
Nodes (25): ClaudeAgentService, isMissingClaudeSessionError(), observe(), answer(), claudeRequest(), copilotRequest(), claudeFixture(), ClaudeMcpRead (+17 more)

### Community 6 - "OracleVoiceCoordinator"
Cohesion: 0.04
Nodes (41): ManagerEventSource, ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect() (+33 more)

### Community 7 - "App.tsx"
Cohesion: 0.03
Nodes (100): hasActiveBackgroundTasks(), hasForegroundTurn(), extension(), MAX_SESSION_FILE_BYTES, sessionFileValidationError(), supportedExtensions, supportsSessionFile(), ActivityRowStates (+92 more)

### Community 8 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (56): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+48 more)

### Community 9 - "oracle-voice.ts"
Cohesion: 0.04
Nodes (83): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+75 more)

### Community 10 - "terminal-session.ts"
Cohesion: 0.04
Nodes (104): activeBottomFrame(), afterExit(), backgroundShellsAllow(), BackgroundShellsEvidence, busyRowStatus(), captureBeforeDeadline(), captureForReplacement(), capturePane() (+96 more)

### Community 11 - "SessionService"
Cohesion: 0.03
Nodes (13): BackgroundTaskUpdate, closeReason(), closeVoiceSocket(), nodeVoiceCapabilities(), registerNodeRoutes(), owns(), ProviderSessionService, obstructUploads() (+5 more)

### Community 12 - "agent-service.ts"
Cohesion: 0.04
Nodes (91): activityNotInLog(), AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor() (+83 more)

### Community 13 - "claude-agent-service.ts"
Cohesion: 0.05
Nodes (70): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+62 more)

### Community 14 - "client.ts"
Cohesion: 0.05
Nodes (36): ManagerClientDefaults, ORACLE_VOICE_CONNECTION_TIMEOUT_MS, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason(), isCapabilities() (+28 more)

### Community 15 - "ManagedSession"
Cohesion: 0.07
Nodes (20): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, normalizeNodeUrl(), FakeManager (+12 more)

### Community 16 - "sessionKey"
Cohesion: 0.04
Nodes (82): CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), listClosedSessions(), saveSessionOrderLane(), saveSessionUnread(), changeSessionUnread(), handleDragEnd(), toggleSessionUnread() (+74 more)

### Community 17 - "sections.tsx"
Cohesion: 0.04
Nodes (74): RuntimeModelOption, DEFAULT_SESSION_PROVIDER, NewSessionBackendSetting, configureRuntime(), getManager(), getRuntimeOptions(), updateManagerSettings(), validateSessionDirectory() (+66 more)

### Community 18 - "contracts.ts"
Cohesion: 0.04
Nodes (57): RuntimeConfigurationError, updateComputerForLaunchIdentity(), withSessionCreateBoundary(), closable(), provider(), delay(), requireFolderTrust(), sameFolder() (+49 more)

### Community 19 - "manager.ts"
Cohesion: 0.04
Nodes (36): FakeManager, automaticTurns(), event(), apps, directories, ProactiveManager, FakeAgent, confirmationSchema (+28 more)

### Community 20 - "ManagerStore"
Cohesion: 0.05
Nodes (32): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, capturePrompt() (+24 more)

### Community 21 - "manager-tools.ts"
Cohesion: 0.04
Nodes (45): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+37 more)

### Community 22 - "workspace-fixtures.ts"
Cohesion: 0.04
Nodes (62): { values }, accents, Measurement, originalDocument, output, report, save(), scratch (+54 more)

### Community 23 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (33): RemoteResync, RemoteSessionRead, subscribeRemoteHost(), connect(), headerSafe(), RemoteNodeClient, requestBytes(), client() (+25 more)

### Community 24 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 25 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 26 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (45): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+37 more)

### Community 27 - "app.ts"
Cohesion: 0.04
Nodes (51): buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), directories, runtimes (+43 more)

### Community 28 - "shared/settings-profile.ts"
Cohesion: 0.05
Nodes (56): WorkspaceFixtureState, execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), directories (+48 more)

### Community 29 - "ManagerAgent"
Cohesion: 0.07
Nodes (13): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, uniqueManagerSessionRefs() (+5 more)

### Community 30 - "ChatMessage"
Cohesion: 0.05
Nodes (54): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, toolCallIdFromActivityId() (+46 more)

### Community 31 - "host-telemetry.ts"
Cohesion: 0.05
Nodes (51): prefixes, session, trusted, untrusted, BuildAppOptions, ProcessScanContext, HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS (+43 more)

### Community 32 - "oracle-voice-worker.ts"
Cohesion: 0.06
Nodes (29): benchmarkGroup(), buildConfig(), VoiceEngineSession, VoiceSttEngine, VoiceTtsEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig() (+21 more)

### Community 33 - "AppSettingsDialog.tsx"
Cohesion: 0.06
Nodes (61): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), App(), applyPwaUpdate(), sidebarTouchStart() (+53 more)

### Community 34 - "react"
Cohesion: 0.08
Nodes (44): react, hub(), AppVersion, SessionProvenance, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags (+36 more)

### Community 35 - "node-routes.ts"
Cohesion: 0.05
Nodes (51): toolCallIdSchema, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+43 more)

### Community 36 - "sampler.ts"
Cohesion: 0.07
Nodes (47): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+39 more)

### Community 37 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (34): CopilotSessionLike, nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery() (+26 more)

### Community 38 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+27 more)

### Community 39 - "computer-manager.ts"
Cohesion: 0.07
Nodes (38): activityDetailsUnavailable(), refusal(), updateComputerForActivityDetails(), AgentServiceEvents, RemoteSessionListing, ProviderSessionServiceEvents, DEFINITE_DISPATCH_REFUSALS, REDIRECT_STATUSES (+30 more)

### Community 40 - "active-sessions.ts"
Cohesion: 0.06
Nodes (55): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+47 more)

### Community 41 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (44): DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+36 more)

### Community 42 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+24 more)

### Community 43 - "setupWorkspaceFixture"
Cohesion: 0.04
Nodes (30): desktop, devices, long, open(), phone, veryLong, bounds(), closedEarlier (+22 more)

### Community 44 - "CopilotClientLike"
Cohesion: 0.04
Nodes (32): complete(), event(), sessionWithLog(), start(), CopilotClientLike, holdProbe(), fixtures, gate() (+24 more)

### Community 45 - "manager-agent.ts"
Cohesion: 0.06
Nodes (45): DreamerProgressEntry, DreamerProgressView, automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions, messagePriority() (+37 more)

### Community 46 - "oracle-voice-benchmark.ts"
Cohesion: 0.06
Nodes (43): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+35 more)

### Community 47 - "multi-node.test.ts"
Cohesion: 0.05
Nodes (10): ClaudeFakeSessionService, directories, FakeSessionService, routingFixture(), session(), temporaryDirectory(), voiceControlQueues, voiceControlWaiters (+2 more)

### Community 48 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (37): root, script, directories, disk, fixture(), gate(), gates, httpBoundary() (+29 more)

### Community 49 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 50 - "src/settings-profile.ts"
Cohesion: 0.07
Nodes (30): AppearanceSetting, NewSessionRuntime, sameSettingValue(), SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues (+22 more)

### Community 51 - "UserInputReplyInput"
Cohesion: 0.06
Nodes (10): isUncertainDelivery(), persistedFormAnswer(), removeCopilotSessionFiles(), TerminalFormContinuation, TerminalFormReplyError, TerminalSessionController, ConfigureRuntimeInput, PendingUserInput (+2 more)

### Community 52 - "session-directory.ts"
Cohesion: 0.08
Nodes (40): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath() (+32 more)

### Community 53 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (31): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+23 more)

### Community 54 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (16): startAgentAfterClear(), composer(), processAdapter, awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions() (+8 more)

### Community 55 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+22 more)

### Community 56 - "fake-voice.ts"
Cohesion: 0.07
Nodes (13): ActiveBackendSession, beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice() (+5 more)

### Community 57 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (52): addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, copyTask() (+44 more)

### Community 58 - "DreamerService"
Cohesion: 0.12
Nodes (10): DreamerMemoryMetadata, boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs() (+2 more)

### Community 59 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (45): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+37 more)

### Community 60 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 61 - "processes.ts"
Cohesion: 0.08
Nodes (28): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+20 more)

### Community 62 - "tmux-test-helpers.ts"
Cohesion: 0.09
Nodes (39): [root], assertSameIdentity(), createIsolatedTmuxRoot(), execFileAsync, abandoned, abandonFixture(), creatorCommand(), execute (+31 more)

### Community 63 - "SchedulerStore"
Cohesion: 0.13
Nodes (7): fixture(), deferUnboundWorktree(), failure(), SchedulerStore, ScheduleProposal, Schedule, ScheduleRunStatus

### Community 64 - "ComposerActions.tsx"
Cohesion: 0.08
Nodes (21): families, modelFamily, shortModelName(), repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions() (+13 more)

### Community 65 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, DreamerProgressSource (+11 more)

### Community 66 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (36): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, Screens, startCopilot() (+28 more)

### Community 67 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 68 - "server/skill-settings.ts"
Cohesion: 0.10
Nodes (27): instrument(), frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills(), Token, readBounded() (+19 more)

### Community 69 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 70 - "request"
Cohesion: 0.11
Nodes (33): scheduleProposalSummary(), validateRecurrence(), CLAUDE_SCHEDULE_UNAVAILABLE_REASON, scheduleProviderUnavailableReason(), ScheduleTarget, listDirectories(), request(), AddKnowledgeRootDialog() (+25 more)

### Community 71 - "session-resource-clear.test.ts"
Cohesion: 0.06
Nodes (33): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), deferred() (+25 more)

### Community 72 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 73 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (31): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+23 more)

### Community 74 - "PushNotificationService"
Cohesion: 0.11
Nodes (10): start(), NotificationRecorder, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema (+2 more)

### Community 75 - "notification-store.ts"
Cohesion: 0.09
Nodes (23): booleanQuery, filters, params, cursorSchema, durableState(), emptyState(), identity, kind (+15 more)

### Community 76 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 77 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 78 - "schedule-recurrence.ts"
Cohesion: 0.09
Nodes (36): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+28 more)

### Community 79 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (34): cancelManager(), editQueuedManagerMessage(), resetManager(), sendManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), canTakeFocus() (+26 more)

### Community 80 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 81 - "manager-proactive-coordinator.ts"
Cohesion: 0.12
Nodes (13): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, SessionLifecycle, directories (+5 more)

### Community 82 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 83 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 84 - "KnowledgeStore"
Cohesion: 0.11
Nodes (15): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+7 more)

### Community 85 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 86 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 87 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 88 - "transcript-test-helpers.ts"
Cohesion: 0.12
Nodes (22): contextChangedInEvents(), createPendingUserInputTracker(), foregroundCompletedSince(), isEmptyResponseNotice(), pendingUserInputFromEvents(), PendingUserInputTracker, runtimeInfoFromEvents(), RuntimeTracker (+14 more)

### Community 89 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (18): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail(), FakeClient (+10 more)

### Community 90 - "schedule-proposals.ts"
Cohesion: 0.10
Nodes (31): proposalInput, action, create, existing, metadata, ScheduleProposalInput, scheduleProposalInputSchema, ScheduleProposalsChanged (+23 more)

### Community 91 - "response-compression.test.ts"
Cohesion: 0.07
Nodes (20): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), apps (+12 more)

### Community 92 - ".takeInTranscript"
Cohesion: 0.13
Nodes (6): foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), messagesFromHistory(), statusFromEvents(), TranscriptObservation

### Community 93 - "schedule-notifications.integration.test.ts"
Cohesion: 0.08
Nodes (21): enableSchedulerTools(), classifyScheduleNotification(), headers, sender, NoopScheduleLauncher, ScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS (+13 more)

### Community 94 - "oracle-voice-config.ts"
Cohesion: 0.10
Nodes (24): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger(), canonicalPath() (+16 more)

### Community 95 - "schedules.ts"
Cohesion: 0.10
Nodes (29): State, stateSchema, timestamp, DEFAULT_SCHEDULE_TIMEZONE, identifier, SCHEDULE_PROMPT_MAX_LENGTH, scheduleAbandonSchema, scheduleActionSchema (+21 more)

### Community 96 - "BackgroundTasksDialog.tsx"
Cohesion: 0.12
Nodes (27): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+19 more)

### Community 97 - "manager-proactive-inbox.ts"
Cohesion: 0.09
Nodes (33): assertExactKeys(), cloneState(), DISPOSITIONS, hasExactKeys(), isDisposition(), isEventKind(), isId(), isOrigin() (+25 more)

### Community 98 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 99 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 100 - "use-markdown-document.test.tsx"
Cohesion: 0.09
Nodes (16): render, scope, DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), defaultDocumentRenderer(), DocumentRenderer, DocumentRendererContext (+8 more)

### Community 101 - "closed-sessions.ts"
Cohesion: 0.09
Nodes (19): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, recordClosure(), blockParents, CLOSED_SESSION_RETENTION_MS, closedCapitals() (+11 more)

### Community 102 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (30): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+22 more)

### Community 103 - "SchedulerDispatcher"
Cohesion: 0.19
Nodes (5): session(), SchedulerDispatcher, registerSchedulerRoutes(), holdsSlot(), isInFlight()

### Community 104 - "client.test.ts"
Cohesion: 0.08
Nodes (10): ORACLE_VOICE_PROTOCOL, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 105 - "agent-service.test.ts"
Cohesion: 0.11
Nodes (15): terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+7 more)

### Community 106 - "notification-classifier.ts"
Cohesion: 0.14
Nodes (25): computer, observe(), snapshot(), start, sustained(), attentionClosed(), attentionSeed(), classifyHostNotification() (+17 more)

### Community 107 - "send-matrix.integration.test.ts"
Cohesion: 0.07
Nodes (28): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+20 more)

### Community 108 - "markdown-navigation.ts"
Cohesion: 0.13
Nodes (28): followMarkdownLink(), KnowledgeReader(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), navigateDocument(), BreadcrumbSegment, breadcrumbSegments() (+20 more)

### Community 109 - "background-task-stop.test.ts"
Cohesion: 0.12
Nodes (20): projected(), BackgroundTaskProjector, backgroundTasksFromEvents(), completed(), handoff(), launched(), nativeStart(), readExit() (+12 more)

### Community 110 - "push-notification-service.ts"
Cohesion: 0.11
Nodes (20): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+12 more)

### Community 111 - "pipeline.ts"
Cohesion: 0.12
Nodes (25): partlyHeldRenderer(), documentJsx(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform(), drawSteps(), growable (+17 more)

### Community 112 - "capture-workspace.ts"
Cohesion: 0.13
Nodes (24): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+16 more)

### Community 113 - "session-latency-benchmark.ts"
Cohesion: 0.11
Nodes (24): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+16 more)

### Community 114 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 115 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (26): advance(), Connection, connections, content(), FrameMeasurement, lastHeading(), message(), open() (+18 more)

### Community 116 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (17): phases, port, app(), directories, headers, launcher, createStartupPhases(), silentStartupPhases (+9 more)

### Community 117 - "real-voice.ts"
Cohesion: 0.13
Nodes (11): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+3 more)

### Community 118 - "schedule-launcher.ts"
Cohesion: 0.19
Nodes (13): WorkspaceFixtureOptions, LaunchPrimitives, provenance(), recordScheduleProvenance(), ScheduleProvenance, scheduleSessionTitle(), SessionScheduleLauncher, ScheduleLaunchRefusedError (+5 more)

### Community 119 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 120 - "HubEvent"
Cohesion: 0.12
Nodes (9): ComputerManagerEvents, HubEventSource, Client, Browser, seedOffset, HubEvent, HubResyncRequest, HubWireEvent (+1 more)

### Community 121 - "notification-center.ts"
Cohesion: 0.15
Nodes (19): defaultNotificationKindPreference, NotificationKind, NotificationKindPreference, NotificationRecord, NotificationSeverity, FeatureEvent, listeners, publishFeatureEvent() (+11 more)

### Community 122 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 123 - "use-session-knowledge-root.ts"
Cohesion: 0.12
Nodes (16): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base (+8 more)

### Community 124 - "registerSessionKnowledgeRoutes"
Cohesion: 0.14
Nodes (21): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+13 more)

### Community 125 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 126 - "use-markdown-document.ts"
Cohesion: 0.14
Nodes (20): build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing(), Level (+12 more)

### Community 127 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 128 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 129 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 130 - "oracle-voice-segments.ts"
Cohesion: 0.14
Nodes (22): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+14 more)

### Community 131 - "ManagerAssistant.test.tsx"
Cohesion: 0.09
Nodes (15): removeQueuedManagerMessage(), resolveManagerConfirmation(), retryManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+7 more)

### Community 132 - "session-response-order.ts"
Cohesion: 0.16
Nodes (17): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+9 more)

### Community 133 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 134 - "isTerminalComposerFooter"
Cohesion: 0.13
Nodes (20): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+12 more)

### Community 135 - "capture.ts"
Cohesion: 0.12
Nodes (11): BufferedFrame, defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies (+3 more)

### Community 136 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 138 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 139 - "normalizeKnowledgeRelativePath"
Cohesion: 0.19
Nodes (17): knowledgeFileSchema, knowledgeRelativePathSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath() (+9 more)

### Community 140 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 141 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 142 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 143 - "dreamer-service.ts"
Cohesion: 0.18
Nodes (18): DreamerPlanDraft, DreamerPlannerInput, DreamerProgressLimits, DreamerPlannerExecutionInput, DreamerServiceOptions, safeRunError(), unavailableSnapshot(), DreamerStoreSnapshot (+10 more)

### Community 145 - "ManagerProactiveInbox"
Cohesion: 0.22
Nodes (4): ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, nowIso(), openInbox()

### Community 146 - "schedule-notification-service.test.ts"
Cohesion: 0.18
Nodes (6): ScheduleNotificationService, input(), now, run(), ScheduleRunNotification, SchedulerChanged

### Community 147 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 148 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 149 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 150 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 151 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 152 - "server/session-patches.ts"
Cohesion: 0.20
Nodes (9): changedInPlace(), diffMessages(), Publication, sameField(), sameMessage(), sessionKey(), SessionPublications, SessionUpserted (+1 more)

### Community 153 - "agent-service-event-projection.test.ts"
Cohesion: 0.16
Nodes (15): at(), directories, finish(), launch(), services, sessionLog(), syncSessionTranscript(), terminalService() (+7 more)

### Community 154 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 155 - "HostSnapshot"
Cohesion: 0.16
Nodes (5): HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, HostTelemetryTarget, HostSnapshot, HostTelemetryEndReason

### Community 156 - "oracle-status.test.ts"
Cohesion: 0.19
Nodes (14): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+6 more)

### Community 157 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 158 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (13): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+5 more)

### Community 159 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 160 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 161 - "session-unread.pw.ts"
Cohesion: 0.13
Nodes (9): bounds(), devices, edgeState(), open(), screenshot(), unreadState(), BACKGROUND_SESSION_ID, fixtureBackgroundTasks (+1 more)

### Community 162 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 163 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 164 - "SessionStatus"
Cohesion: 0.17
Nodes (11): Seen, PersistedCursor, NotificationCursor, Row, SdkRestartRecovery, FinishedSession, SessionUnreadTracker, finished() (+3 more)

### Community 166 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 168 - "capture-workbench-review.ts"
Cohesion: 0.14
Nodes (11): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, fixtureSessions (+3 more)

### Community 169 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 170 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 171 - "SessionAdmissions"
Cohesion: 0.17
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 172 - "pending-echo.ts"
Cohesion: 0.24
Nodes (11): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, PendingEchoOwner, prunePendingEchoMap() (+3 more)

### Community 173 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 174 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 175 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 176 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 177 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 178 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 179 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 180 - ".observe"
Cohesion: 0.21
Nodes (7): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId()

### Community 181 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 182 - "manager-automatic.ts"
Cohesion: 0.23
Nodes (10): MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed, finished, AutomaticTurn, automaticTurnSummary (+2 more)

### Community 184 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 186 - "copilot-sdk-client.ts"
Cohesion: 0.29
Nodes (9): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkMissingSessionRetirement, CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic() (+1 more)

### Community 187 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxObservation, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 188 - "use-oracle-attachments.ts"
Cohesion: 0.35
Nodes (11): removeManagerFile(), uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake() (+3 more)

### Community 189 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 190 - "command-catalog-cache.test.ts"
Cohesion: 0.25
Nodes (9): at(), Catalog, deferred(), fixture(), fixtures, listed(), releases, runtime() (+1 more)

### Community 191 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (9): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+1 more)

### Community 192 - "isRecord"
Cohesion: 0.29
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 193 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 194 - "server/side-question.ts"
Cohesion: 0.27
Nodes (8): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), sideQuestionPrompt(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH, SIDE_QUESTION_EARLIER_LIMIT, SIDE_QUESTION_MAX_LENGTH

### Community 195 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 196 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 197 - "notification-center.integration.test.ts"
Cohesion: 0.22
Nodes (7): center(), directories, directory(), hub(), now, runtimes, trusted

### Community 198 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 199 - "transcribeAudio"
Cohesion: 0.29
Nodes (4): transcribeAudio(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 200 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 201 - "history-projection.test.ts"
Cohesion: 0.31
Nodes (7): eventsFor(), groupedEventsFor(), ModelMessage, questionEventsFor(), random(), seedOffset, terminalTypes

### Community 202 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 203 - "ManagerProactiveInboxValidationError"
Cohesion: 0.28
Nodes (6): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions()

### Community 204 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.31
Nodes (6): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult

### Community 205 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 206 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 208 - "fixture-frontend.ts"
Cohesion: 0.32
Nodes (4): captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend()

### Community 209 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 210 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 211 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 212 - "vad-assets.ts"
Cohesion: 0.32
Nodes (7): browserBaseUrl(), directory(), localAssetUrl(), ORACLE_VOICE_ONNX_WASM_BASE_PATH, ORACLE_VOICE_VAD_ASSETS, ORACLE_VOICE_VAD_BASE_PATH, sharedAssetDirectory()

### Community 213 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 215 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 216 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 219 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 220 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 221 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 223 - "markdownComponentsFor"
Cohesion: 0.70
Nodes (5): codeFenceProps(), fencedSource(), flatChildren(), markdownComponentsFor(), mermaidFencedSource()

## Knowledge Gaps
- **1465 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1460 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2461 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionStore`, `oracle-voice-session.ts`, `SessionDetail`, `SessionService`, `ManagedSession`, `ManagerProactiveInbox`, `schedule-notification-service.test.ts`, `manager.ts`, `ManagerStore`, `HostSnapshot`, `shared/settings-profile.ts`, `ManagerAgent`, `host-telemetry.ts`, `oracle-voice-worker.ts`, `react`, `node-routes.ts`, `sampler.ts`, `NotificationCenterService`, `transcription-service.ts`, `oracle-task-store.ts`, `UserInputReplyInput`, `session-knowledge-routes.test.ts`, `session-knowledge-store.ts`, `DreamerService`, `dreamer-routes.ts`, `SchedulerStore`, `server/skill-settings.ts`, `PushNotificationService`, `notification-store.ts`, `manager-proactive-coordinator.ts`, `KnowledgeStore`, `SessionOrderStore`, `response-compression.test.ts`, `schedule-notifications.integration.test.ts`, `oracle-voice-config.ts`, `SchedulerDispatcher`, `schedule-launcher.ts`, `cli-canary.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `.discoverTerminalSessions`, `CopilotSessionLike`, `computer-manager.ts`, `.discoverSessions`, `agent-service.test.ts`, `CopilotClientLike`, `claude-agent-service.ts`, `agent-service.ts`, `multi-node.test.ts`, `contracts.ts`, `UserInputReplyInput`, `session-directory.ts`, `background-task-adapter.ts`, `.takeInTranscript`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `SessionDetail`, `computer-manager.ts`, `.discoverSessions`, `multi-node.test.ts`, `UserInputReplyInput`, `.takeInTranscript`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1465 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.038506636649312885 - nodes in this community are weakly interconnected._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.025258846285129137 - nodes in this community are weakly interconnected._
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
