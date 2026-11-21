# Agentic Remote - Graphify code map

Snapshot: `2800bff45e60a8f531c787e251a8095c590856851b1775b2f192b000578f5752`

Source checkout: `0dd48db1ff2a21d1cb54d38dac973e953ee67887`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 652 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 652 files · ~1,164,887 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9148 nodes · 26418 edges · 275 communities (231 shown, 26 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1341 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- AppWorkspace
- api.ts
- SessionDetail
- ClaudeAgentService
- contracts.ts
- App.tsx
- terminal-session.ts
- session-store.ts
- agent-service.ts
- session-presentation.ts
- client.ts
- dreamer-store.ts
- manager-tools.ts
- claude-agent-service.ts
- ManagedSession
- OracleVoiceCoordinator
- sections.tsx
- ManagerAgent
- agentic-remote-promotion-monitor
- oracle-voice-soak.ts
- oracle-voice.ts
- oracle-voice-child.ts
- react
- agent-service.test.ts
- manager-agent.ts
- notification-classifier.ts
- RemoteNodeClient
- schedule-launcher.test.ts
- VoiceCapture
- ManagerMessage
- tmux-errors.integration.test.ts
- oracle-voice-integration.test.ts
- session-reply-durability.test.ts
- oracle-task-store.ts
- transcription-service.ts
- oracle-voice-routes.test.ts
- send-matrix.integration.test.ts
- schedules.ts
- workspace-fixtures.test.ts
- node-routes.ts
- TmuxTerminalSessionController
- FakeVoiceEngine
- AppSettingsDialog.tsx
- manager-structured-memory-validation.ts
- oracle-voice-worker.ts
- app.ts
- oracle-voice-session.ts
- ProviderSessionService
- background-task-adapter.ts
- DreamerService
- fake-voice.ts
- TerminalSessionController
- OracleDreamer.tsx
- oracle-voice-benchmark.ts
- SessionService
- agentic-remote
- tmux-test-helpers.ts
- server/skill-settings.ts
- manager-store.ts
- processes.ts
- SchedulerStore
- terminal-session.test.ts
- ComposerActions.tsx
- SettingsProfileSnapshot
- session-directory.ts
- hub-routes.ts
- agentic-remote-gate
- dreamer-service.ts
- manager-proactive-inbox.ts
- bundle
- PushNotificationService
- VoiceAudioFrame
- shared/settings-profile.ts
- ComputerSummary
- VoicePlayback
- ScheduleRun
- schedule-recurrence.ts
- shell.ts
- lib.rs
- ui-locks.pw.ts
- feature-flags.ts
- ManagerStore
- ManagerAssistant.tsx
- dependencies
- manager-structured-memory.ts
- client.test.ts
- agentic-remote-promotion-setup
- KnowledgeStore
- FakeSessionService
- SessionOrderStore
- devDependencies
- config.rs
- active-sessions.ts
- response-compression.test.ts
- knowledge-tree.ts
- session-launcher.ts
- oracle-voice-child.test.ts
- oracle-voice-security.test.ts
- recovery-resend-durability.test.ts
- manager-context.ts
- ManagerStructuredMemoryStore
- SessionKnowledgeStore
- setupWorkspaceFixture
- reader.ts
- oracle-voice-segments.ts
- real-voice.ts
- agent-service-event-projection.test.ts
- sampler.ts
- host-telemetry.ts
- remote-voice-client.ts
- dreamer-planner.ts
- capture-workspace.ts
- transcript-test-helpers.ts
- HostTelemetrySampler
- use-markdown-document.ts
- session-patch-browser.ts
- use-markdown-document.test.tsx
- oracle-voice-config.ts
- cli-canary.ts
- ActivityRow.test.tsx
- scripts
- ChatMessage
- DreamerProgress
- SettingsProfileClient
- HostMonitorView.test.tsx
- manager-structured-memory-search.ts
- DialogFrame.tsx
- compilerOptions
- workspace-fixtures.ts
- closed-sessions.ts
- ManagerProactiveCoordinator
- noTmuxServer
- ManagerAssistant.test.tsx
- startup-phases.test.ts
- PromptCards.tsx
- normalizeKnowledgeRelativePath
- ManagerProactiveInbox
- oracle-voice-tickets.ts
- refusal-metrics.ts
- oracle-status.test.ts
- compilerOptions
- full-gate.test.ts
- session-knowledge-store.ts
- session-store-providers.test.ts
- markdown-navigation.ts
- compilerOptions
- alerts.test.ts
- .observe
- session-resource-clear.test.ts
- OnlineRecognizer
- isTerminalComposerFooter
- ActivityDetails.tsx
- pipeline.ts
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- ManagerAttachment
- session-unread.pw.ts
- session-latency-benchmark.ts
- dreamer-schedule.ts
- promotion-monitor.test.ts
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- capture-workbench-review.ts
- service.ts
- registerSessionKnowledgeRoutes
- server/session-patches.ts
- session-resource-routes.test.ts
- use-oracle-attachments.ts
- check-workspace-review-regressions.ts
- package.json
- terminal-form-deadline.test.ts
- VoiceEngineEvent
- oracle-voice-assets.test.ts
- session-knowledge-routes.ts
- ShellNavigation.test.tsx
- fake-vad.ts
- desktop.json
- DeferredSession
- background-task-stop.test.ts
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- transport.test.ts
- session-scope.ts
- session-response-order.ts
- Pcm16Resampler
- document-render.pw.ts
- BackgroundTask
- dreamer-routes.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- recently-closed.pw.ts
- sign-in-expired.pw.ts
- settings-profile-routes.ts
- manager-proactive-inbox.test.ts
- ScheduleNotificationService
- SessionAdmissions
- SessionOriginBadge.test.tsx
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- file-upload-routes.ts
- SessionStatus
- bridge.rs
- ComputersDialog.tsx
- vite.config.ts
- history-projection.test.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- recovery-context.ts
- sent-message.ts
- pipeline.test.tsx
- voice-recorder.ts
- fixture-frontend.ts
- app-provenance.test.ts
- doctor-cli.test.ts
- manager-proactive-coordinator.test.ts
- manager-structured-memory-performance.test.ts
- release-publication.test.ts
- UserInputFieldControl
- KnowledgePosition
- composer-layout.test.ts
- HostTelemetryClock
- session-unread-tracker.ts
- settings.ts
- DocumentViewControls.tsx
- use-foreground-handoff.ts
- usePanelWidth
- worker-handler.ts
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- appearance.ts
- FakeRecorder
- MemoryStorage
- storedProvider
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
1. `AppWorkspace()` - 353 edges
2. `SessionDetail` - 345 edges
3. `AgentService` - 325 edges
4. `SessionStore` - 218 edges
5. `ManagedSession` - 184 edges
6. `buildApp()` - 141 edges
7. `ClaudeAgentService` - 136 edges
8. `registerHubRoutes()` - 108 edges
9. `ComputerManager` - 107 edges
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
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (275 total, 26 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (16): agentMode(), AgentService, foregroundCompletedSince(), foregroundTurnOpen(), isForegroundCompletionEvent(), isTerminalNotReadyRefusal(), lifecycleRefusal(), removeCopilotSessionFiles() (+8 more)

### Community 1 - "AppWorkspace"
Cohesion: 0.03
Nodes (178): terminalSendOptions(), sessionFileValidationError(), askSession(), deleteSession(), AppWorkspace(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown() (+170 more)

### Community 2 - "api.ts"
Cohesion: 0.02
Nodes (153): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, SettingsChange, SettingsProfileKey, SettingsUpdateResult, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals (+145 more)

### Community 3 - "SessionDetail"
Cohesion: 0.04
Nodes (46): isForegroundLifecycleEvent(), fixture(), restart(), fixture(), connect(), createStore(), fixture(), recoveryFixture() (+38 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (41): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+33 more)

### Community 5 - "contracts.ts"
Cohesion: 0.03
Nodes (87): AgentServiceEvents, ClaudeAgentServiceEvents, ComputerManagerEvents, RemoteResync, RemoteSessionListing, DirectoryScope, ClaudeFakeSessionService, directories (+79 more)

### Community 6 - "App.tsx"
Cohesion: 0.03
Nodes (113): isManagerEvent(), turnEnded(), executeCommand(), listClosedSessions(), listWorkspace(), renameSession(), searchWorkspace(), ActivityRowStates (+105 more)

### Community 7 - "terminal-session.ts"
Cohesion: 0.05
Nodes (104): terminalComposerUnreadable(), activeBottomFrame(), backgroundShellsAllow(), BackgroundShellsEvidence, busyRowStatus(), captureBeforeDeadline(), captureForReplacement(), capturePane() (+96 more)

### Community 8 - "session-store.ts"
Cohesion: 0.02
Nodes (83): complete(), event(), sessionWithLog(), start(), CopilotClientLike, holdProbe(), fixtures, gate() (+75 more)

### Community 9 - "agent-service.ts"
Cohesion: 0.03
Nodes (96): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+88 more)

### Community 10 - "session-presentation.ts"
Cohesion: 0.04
Nodes (75): hasActiveBackgroundTasks(), hasForegroundTurn(), CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root (+67 more)

### Community 11 - "client.ts"
Cohesion: 0.06
Nodes (36): ORACLE_VOICE_CONNECTION_TIMEOUT_MS, VoiceCapabilities, VoiceServerControl, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason() (+28 more)

### Community 12 - "dreamer-store.ts"
Cohesion: 0.05
Nodes (56): DreamerHistoryEntry, assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+48 more)

### Community 13 - "manager-tools.ts"
Cohesion: 0.04
Nodes (42): DreamerMemoryMetadataRecord, APPROVE_WORDS, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), changeSuspension() (+34 more)

### Community 14 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (65): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+57 more)

### Community 15 - "ManagedSession"
Cohesion: 0.08
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, updateComputerForLaunchIdentity(), normalizeNodeUrl() (+5 more)

### Community 16 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (23): ManagerEventSource, ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect() (+15 more)

### Community 17 - "sections.tsx"
Cohesion: 0.04
Nodes (68): RuntimeModelOption, AppearanceSetting, NewSessionBackendSetting, configureRuntime(), getManager(), getRuntimeOptions(), updateManagerSettings(), validateSessionDirectory() (+60 more)

### Community 18 - "ManagerAgent"
Cohesion: 0.07
Nodes (20): DreamerProgressView, automaticPayload(), checkContent(), delay(), discover(), errorMessage(), isNotFound(), isPending() (+12 more)

### Community 19 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 20 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (36): ActiveBackendSession, childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText() (+28 more)

### Community 21 - "oracle-voice.ts"
Cohesion: 0.06
Nodes (67): sendNodeVoiceOutput(), limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode() (+59 more)

### Community 22 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (40): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+32 more)

### Community 23 - "react"
Cohesion: 0.06
Nodes (58): react, scheduleProposalSummary(), CLAUDE_SCHEDULE_UNAVAILABLE_REASON, ScheduleRecurrence, ScheduleTarget, getProviderRuntimeOptions(), listComputerSkills(), listDirectories() (+50 more)

### Community 24 - "agent-service.test.ts"
Cohesion: 0.04
Nodes (41): CopilotSessionLike, terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration (+33 more)

### Community 25 - "manager-agent.ts"
Cohesion: 0.04
Nodes (44): ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Rung, Behavior, computers (+36 more)

### Community 26 - "notification-classifier.ts"
Cohesion: 0.06
Nodes (52): center(), directories, directory(), hub(), now, runtimes, trusted, NotificationRecorder (+44 more)

### Community 27 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (19): RemoteSessionRead, headerSafe(), RemoteNodeClient, requestBytes(), client(), servers, session, RemoteNodeCapabilityError (+11 more)

### Community 28 - "schedule-launcher.test.ts"
Cohesion: 0.05
Nodes (47): LaunchPrimitives, provenance(), recordScheduleProvenance(), ScheduleLauncherHost, ScheduleProvenance, scheduleSessionTitle(), SessionScheduleLauncher, directories (+39 more)

### Community 29 - "VoiceCapture"
Cohesion: 0.06
Nodes (23): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), CaptureControl, harness(), validateIdentity() (+15 more)

### Community 30 - "ManagerMessage"
Cohesion: 0.05
Nodes (29): FakeManager, FakeAgent, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent (+21 more)

### Community 31 - "tmux-errors.integration.test.ts"
Cohesion: 0.04
Nodes (43): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+35 more)

### Community 32 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (34): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+26 more)

### Community 33 - "session-reply-durability.test.ts"
Cohesion: 0.04
Nodes (52): root, script, ClaudeSdk, deferred(), disk, enqueue(), fixtures, holdClaimWrite() (+44 more)

### Community 34 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (47): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+39 more)

### Community 35 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 36 - "oracle-voice-routes.test.ts"
Cohesion: 0.04
Nodes (24): voiceBackend(), exactArrayBuffer(), nodeVoiceCapabilities(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), EnabledOracleVoiceConfig, FakeVoiceEngineFactory (+16 more)

### Community 37 - "send-matrix.integration.test.ts"
Cohesion: 0.04
Nodes (53): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+45 more)

### Community 38 - "schedules.ts"
Cohesion: 0.06
Nodes (57): State, stateSchema, timestamp, action, create, existing, metadata, ScheduleProposalInput (+49 more)

### Community 39 - "workspace-fixtures.test.ts"
Cohesion: 0.06
Nodes (31): WorkspaceFixtureOptions, NotificationCenterService, booleanQuery, filters, params, cursorSchema, durableState(), emptyState() (+23 more)

### Community 40 - "node-routes.ts"
Cohesion: 0.06
Nodes (43): activityDetailsUnavailable(), activityNotInLog(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), AUDIO_FILENAME_HEADER, closeReason(), closeVoiceSocket() (+35 more)

### Community 41 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (19): startAgentAfterClear(), composer(), processAdapter, afterExit(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync (+11 more)

### Community 42 - "FakeVoiceEngine"
Cohesion: 0.06
Nodes (25): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceSttEngine, VoiceTtsEngine, VoiceUtteranceAudioFrame, BlockingCancelEngine (+17 more)

### Community 43 - "AppSettingsDialog.tsx"
Cohesion: 0.07
Nodes (52): parseAppVersion(), DEFAULT_SESSION_PROVIDER, activateSession(), createSession(), getPushPublicKey(), listHistory(), savePushSubscription(), sendTestPushNotification() (+44 more)

### Community 44 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 45 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (25): benchmarkGroup(), VoiceGenerationIdentity, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys() (+17 more)

### Community 46 - "app.ts"
Cohesion: 0.06
Nodes (33): buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), directories (+25 more)

### Community 47 - "oracle-voice-session.ts"
Cohesion: 0.09
Nodes (19): apps, directories, acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), DEFAULT_VOICE_BACKEND_LIMITS, disconnectCause() (+11 more)

### Community 49 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (53): addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, copyTask() (+45 more)

### Community 50 - "DreamerService"
Cohesion: 0.12
Nodes (10): activeDreamerMemoryIds(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate (+2 more)

### Community 51 - "fake-voice.ts"
Cohesion: 0.07
Nodes (10): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance (+2 more)

### Community 52 - "TerminalSessionController"
Cohesion: 0.07
Nodes (8): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, TerminalSessionController, PendingUserInput, UserInputReplyInput, deliveryUncertaintyFromError()

### Community 53 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (44): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+36 more)

### Community 54 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 55 - "SessionService"
Cohesion: 0.07
Nodes (5): registerNodeRoutes(), obstructUploads(), SessionService, WorkspaceFile, WorkspaceFileIcon()

### Community 56 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 57 - "tmux-test-helpers.ts"
Cohesion: 0.09
Nodes (39): [root], assertSameIdentity(), createIsolatedTmuxRoot(), execFileAsync, abandoned, abandonFixture(), creatorCommand(), execute (+31 more)

### Community 58 - "server/skill-settings.ts"
Cohesion: 0.09
Nodes (29): instrument(), builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills() (+21 more)

### Community 59 - "manager-store.ts"
Cohesion: 0.08
Nodes (25): JournalRecorder, JournalRecorderOptions, sessionTask(), proposalInput, applySessionReplacement(), JournalDraft, JournalEntry, JournalKind (+17 more)

### Community 60 - "processes.ts"
Cohesion: 0.09
Nodes (27): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+19 more)

### Community 61 - "SchedulerStore"
Cohesion: 0.13
Nodes (7): fixture(), deferUnboundWorktree(), failure(), SchedulerStore, ScheduleProposal, Schedule, ScheduleRunStatus

### Community 62 - "terminal-session.test.ts"
Cohesion: 0.07
Nodes (37): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, Screens, startCopilot() (+29 more)

### Community 63 - "ComposerActions.tsx"
Cohesion: 0.08
Nodes (20): families, modelFamily, repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions(), ContextRing() (+12 more)

### Community 64 - "SettingsProfileSnapshot"
Cohesion: 0.09
Nodes (24): WorkspaceFixtureState, directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore (+16 more)

### Community 65 - "session-directory.ts"
Cohesion: 0.11
Nodes (36): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+28 more)

### Community 66 - "hub-routes.ts"
Cohesion: 0.06
Nodes (43): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+35 more)

### Community 67 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 68 - "dreamer-service.ts"
Cohesion: 0.07
Nodes (26): DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply (+18 more)

### Community 69 - "manager-proactive-inbox.ts"
Cohesion: 0.07
Nodes (41): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, emptyState(), eventId(), hasExactKeys(), isDisposition() (+33 more)

### Community 70 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 71 - "PushNotificationService"
Cohesion: 0.10
Nodes (10): start(), HubEventSource, OracleEventSource, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema (+2 more)

### Community 72 - "VoiceAudioFrame"
Cohesion: 0.06
Nodes (21): OracleVoiceBackendConnection, OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, QueuedAudio, capabilities, confirm(), control() (+13 more)

### Community 73 - "shared/settings-profile.ts"
Cohesion: 0.08
Nodes (40): AccentSetting, appearanceSettings, isRecord(), isSettingsDeviceId(), isSettingsRevision(), newSessionBackendSettings, NewSessionFoldersSetting, oneOf() (+32 more)

### Community 74 - "ComputerSummary"
Cohesion: 0.07
Nodes (12): ManagerHub, batchMessageId(), ComputerGenerations, ManagerProactiveCoordinatorOptions, ProactiveManager, SessionLifecycle, ManagerProactiveInboxEvent, ManagerRegistry (+4 more)

### Community 75 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 76 - "ScheduleRun"
Cohesion: 0.16
Nodes (6): ScheduleLauncher, SchedulerDispatcher, registerSchedulerRoutes(), holdsSlot(), isInFlight(), ScheduleRun

### Community 77 - "schedule-recurrence.ts"
Cohesion: 0.10
Nodes (37): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+29 more)

### Community 78 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 79 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 80 - "ui-locks.pw.ts"
Cohesion: 0.09
Nodes (26): { values }, fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns, fixtureSchedules, ComposerPart, lockedScreenshot, message() (+18 more)

### Community 81 - "feature-flags.ts"
Cohesion: 0.12
Nodes (27): hub(), AppVersion, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable() (+19 more)

### Community 82 - "ManagerStore"
Cohesion: 0.11
Nodes (4): openStore(), emptyState(), ManagerStore, open()

### Community 83 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (34): editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), canTakeFocus() (+26 more)

### Community 84 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 85 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (32): ManagerStructuredMemorySearchIndex, ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES (+24 more)

### Community 86 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 87 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 88 - "KnowledgeStore"
Cohesion: 0.11
Nodes (15): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+7 more)

### Community 90 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 91 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 92 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 93 - "active-sessions.ts"
Cohesion: 0.11
Nodes (31): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+23 more)

### Community 94 - "response-compression.test.ts"
Cohesion: 0.07
Nodes (20): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), apps (+12 more)

### Community 95 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 96 - "session-launcher.ts"
Cohesion: 0.08
Nodes (24): awaitTermination(), LaunchCreations, apps, directories, directory(), runtime(), services, stores (+16 more)

### Community 97 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 98 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (21): FakeVoiceEngineCall, VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), connect(), createManager() (+13 more)

### Community 99 - "recovery-resend-durability.test.ts"
Cohesion: 0.09
Nodes (19): terminalService(), directories, disk, fixture(), gate(), gates, httpBoundary(), initialize() (+11 more)

### Community 100 - "manager-context.ts"
Cohesion: 0.13
Nodes (27): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+19 more)

### Community 101 - "ManagerStructuredMemoryStore"
Cohesion: 0.16
Nodes (9): capturePrompt(), digest(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMutationResult (+1 more)

### Community 102 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 103 - "setupWorkspaceFixture"
Cohesion: 0.08
Nodes (14): desktop, devices, long, open(), phone, veryLong, open(), devices (+6 more)

### Community 104 - "reader.ts"
Cohesion: 0.12
Nodes (24): prefixes, session, trusted, untrusted, detectWsl(), parseDataMount(), createLinuxHostTelemetryReader(), errorCode() (+16 more)

### Community 105 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 106 - "real-voice.ts"
Cohesion: 0.11
Nodes (13): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+5 more)

### Community 107 - "agent-service-event-projection.test.ts"
Cohesion: 0.11
Nodes (23): at(), directories, finish(), launch(), projected(), services, sessionLog(), syncSessionTranscript() (+15 more)

### Community 108 - "sampler.ts"
Cohesion: 0.11
Nodes (26): counter(), counterDelta(), CpuCounters, cpuUtilization(), DeviceByteCounters, DeviceCounters, deviceRates(), isWholeDisk() (+18 more)

### Community 109 - "host-telemetry.ts"
Cohesion: 0.09
Nodes (26): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, aggregate (+18 more)

### Community 110 - "remote-voice-client.ts"
Cohesion: 0.17
Nodes (13): VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+5 more)

### Community 111 - "dreamer-planner.ts"
Cohesion: 0.13
Nodes (26): activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem(), digest() (+18 more)

### Community 112 - "capture-workspace.ts"
Cohesion: 0.13
Nodes (24): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+16 more)

### Community 113 - "transcript-test-helpers.ts"
Cohesion: 0.14
Nodes (16): contextChangedInEvents(), isEmptyResponseNotice(), messagesFromHistory(), pendingUserInputFromEvents(), PendingUserInputTracker, runtimeInfoFromEvents(), RuntimeTracker, SessionEventProjection (+8 more)

### Community 114 - "HostTelemetrySampler"
Cohesion: 0.12
Nodes (7): HostTelemetrySampler, HostTelemetryService, make(), HostMinuteAggregate, HostSample, HostSnapshot, HostTelemetryEndReason

### Community 115 - "use-markdown-document.ts"
Cohesion: 0.14
Nodes (22): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+14 more)

### Community 116 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (26): advance(), Connection, connections, content(), FrameMeasurement, lastHeading(), message(), open() (+18 more)

### Community 117 - "use-markdown-document.test.tsx"
Cohesion: 0.11
Nodes (12): DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), defaultDocumentRenderer(), DocumentRenderer, DocumentRendererContext, RendererWorker, synchronousRenderer (+4 more)

### Community 118 - "oracle-voice-config.ts"
Cohesion: 0.13
Nodes (23): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+15 more)

### Community 119 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 120 - "ActivityRow.test.tsx"
Cohesion: 0.14
Nodes (19): toolCallIdFromActivityId(), ActivityStatus, activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), compactActivityText() (+11 more)

### Community 121 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 122 - "ChatMessage"
Cohesion: 0.13
Nodes (11): TranscriptBuilder, nextVoiceControl(), Client, Browser, seedOffset, StoredSession, ChatMessage, HubResyncRequest (+3 more)

### Community 123 - "DreamerProgress"
Cohesion: 0.16
Nodes (6): DreamerProgress, keyOf(), notOlder(), setup(), timeOf(), withTimeout()

### Community 124 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 125 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 126 - "manager-structured-memory-search.ts"
Cohesion: 0.15
Nodes (21): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+13 more)

### Community 127 - "DialogFrame.tsx"
Cohesion: 0.14
Nodes (18): changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame(), filterSentMessages() (+10 more)

### Community 128 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 129 - "workspace-fixtures.ts"
Cohesion: 0.11
Nodes (17): documents, FIXTURE_NOW, fixtureArguments(), fixtureComputers, fixtureEndpoints, fixtureHostHistory, fixtureHostProcesses, fixtureHostSnapshot (+9 more)

### Community 130 - "closed-sessions.ts"
Cohesion: 0.12
Nodes (10): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS, closedSessionContext(), excerpt(), isClosedSessionContext() (+2 more)

### Community 131 - "ManagerProactiveCoordinator"
Cohesion: 0.22
Nodes (3): isTerminal(), lifecycles(), ManagerProactiveCoordinator

### Community 132 - "noTmuxServer"
Cohesion: 0.13
Nodes (20): listTmuxSessions(), foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity(), SocketPlace (+12 more)

### Community 133 - "ManagerAssistant.test.tsx"
Cohesion: 0.09
Nodes (15): cancelManager(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+7 more)

### Community 134 - "startup-phases.test.ts"
Cohesion: 0.11
Nodes (14): phases, port, app(), createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord (+6 more)

### Community 135 - "PromptCards.tsx"
Cohesion: 0.13
Nodes (16): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+8 more)

### Community 136 - "normalizeKnowledgeRelativePath"
Cohesion: 0.17
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), pathRecordSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+10 more)

### Community 137 - "ManagerProactiveInbox"
Cohesion: 0.20
Nodes (6): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 138 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 139 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 140 - "oracle-status.test.ts"
Cohesion: 0.16
Nodes (16): oracleHostStatusFixture(), bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes() (+8 more)

### Community 141 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 142 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 143 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema, PersistedBinding (+11 more)

### Community 144 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 145 - "markdown-navigation.ts"
Cohesion: 0.18
Nodes (19): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+11 more)

### Community 146 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 147 - "alerts.test.ts"
Cohesion: 0.14
Nodes (9): HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, computer, observe(), snapshot(), start, sustained(), HostTelemetryTarget (+1 more)

### Community 148 - ".observe"
Cohesion: 0.18
Nodes (7): ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 149 - "session-resource-clear.test.ts"
Cohesion: 0.13
Nodes (13): apps, directories, directory(), pairedFixture(), providerFixture(), providers, seed(), sockets (+5 more)

### Community 150 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 151 - "isTerminalComposerFooter"
Cohesion: 0.15
Nodes (18): boxedComposerFrame(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock(), flatComposerFrame() (+10 more)

### Community 152 - "ActivityDetails.tsx"
Cohesion: 0.21
Nodes (16): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, activityDetailFailure, detailKey(), formatBytes(), keep(), kept, keptActivityDetail(), loadActivityDetail() (+8 more)

### Community 153 - "pipeline.ts"
Cohesion: 0.17
Nodes (19): openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform() (+11 more)

### Community 154 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 155 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 156 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 157 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 158 - "ManagerAttachment"
Cohesion: 0.25
Nodes (9): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), managerFileType(), managerFileValidationError() (+1 more)

### Community 159 - "session-unread.pw.ts"
Cohesion: 0.12
Nodes (10): bounds(), devices, edgeState(), open(), screenshot(), unreadState(), BACKGROUND_SESSION_ID, fixtureBackgroundTasks (+2 more)

### Community 160 - "session-latency-benchmark.ts"
Cohesion: 0.22
Nodes (17): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+9 more)

### Community 161 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 162 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 163 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 164 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 165 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 166 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 167 - "capture-workbench-review.ts"
Cohesion: 0.13
Nodes (12): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, fixtureKnowledgeRoots (+4 more)

### Community 168 - "service.ts"
Cohesion: 0.23
Nodes (7): HostRequest, registerHostTelemetryRoutes(), HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError(), HostTelemetrySocket, HOST_TELEMETRY_INVALID_CODE

### Community 169 - "registerSessionKnowledgeRoutes"
Cohesion: 0.26
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 170 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 171 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 172 - "use-oracle-attachments.ts"
Cohesion: 0.25
Nodes (14): removeManagerFile(), uploadManagerFile(), attachmentSize(), OracleAttachmentChips(), OracleMessageAttachments(), DraftAttachment, hasBlockingAttachments(), uploadedReferences() (+6 more)

### Community 173 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 174 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 175 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 176 - "VoiceEngineEvent"
Cohesion: 0.18
Nodes (7): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, VoiceEngineEvent

### Community 177 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 178 - "session-knowledge-routes.ts"
Cohesion: 0.13
Nodes (10): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema, SessionKnowledgeLifecycle (+2 more)

### Community 179 - "ShellNavigation.test.tsx"
Cohesion: 0.30
Nodes (7): ClientFeature, railEntries(), usePreviewFeatures(), initials(), useDisplayName(), DisplayNameSetting(), ShellNavigation()

### Community 180 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 181 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 182 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 183 - "background-task-stop.test.ts"
Cohesion: 0.25
Nodes (11): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started(), stopAcknowledgement() (+3 more)

### Community 184 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 185 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 186 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 187 - "transport.test.ts"
Cohesion: 0.18
Nodes (8): HOST_TELEMETRY_MAX_QUEUE_BYTES, HOST_TELEMETRY_MAX_QUEUE_MESSAGES, HOST_TELEMETRY_SEND_TIMEOUT_MS, HostSocket, empty, inventory, listen(), pair()

### Community 188 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 189 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 190 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 192 - "BackgroundTask"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 193 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 194 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 195 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 196 - "recently-closed.pw.ts"
Cohesion: 0.24
Nodes (8): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), row(), sessions()

### Community 197 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 198 - "settings-profile-routes.ts"
Cohesion: 0.25
Nodes (8): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 199 - "manager-proactive-inbox.test.ts"
Cohesion: 0.22
Nodes (6): fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 202 - "SessionOriginBadge.test.tsx"
Cohesion: 0.35
Nodes (6): readScheduleLink(), ScheduleLink, scheduleNotificationLabel(), preview(), SessionOriginRunLink(), SubagentCount()

### Community 203 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 204 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 205 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 206 - "file-upload-routes.ts"
Cohesion: 0.31
Nodes (7): FileUploadError, registerFileUploadRoutes(), SessionParams, extension(), MAX_SESSION_FILE_BYTES, supportedExtensions, supportsSessionFile()

### Community 207 - "SessionStatus"
Cohesion: 0.22
Nodes (9): Seen, ManagerProactiveInboxObservation, PersistedCursor, NotificationCursor, Row, SdkRestartRecovery, SessionStatus, SessionTurnState (+1 more)

### Community 208 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 209 - "ComputersDialog.tsx"
Cohesion: 0.31
Nodes (7): addComputer(), removeComputer(), ComputersBody(), remove(), submit(), ComputersBodyProps, computer

### Community 210 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 211 - "history-projection.test.ts"
Cohesion: 0.31
Nodes (7): eventsFor(), groupedEventsFor(), ModelMessage, questionEventsFor(), random(), seedOffset, terminalTypes

### Community 212 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 213 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 214 - "recovery-context.ts"
Cohesion: 0.28
Nodes (7): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp(), pasteWarnings()

### Community 215 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 216 - "pipeline.test.tsx"
Cohesion: 0.28
Nodes (6): components, drawn(), drawnPage(), fixtures, html(), today()

### Community 217 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 218 - "fixture-frontend.ts"
Cohesion: 0.32
Nodes (4): captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend()

### Community 219 - "app-provenance.test.ts"
Cohesion: 0.36
Nodes (7): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets

### Community 220 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 221 - "manager-proactive-coordinator.test.ts"
Cohesion: 0.29
Nodes (4): directories, fixture(), managed(), ManagerProactiveInboxOptions

### Community 222 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.36
Nodes (5): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemorySearchResult

### Community 223 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 224 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 225 - "KnowledgePosition"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 226 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 228 - "session-unread-tracker.ts"
Cohesion: 0.38
Nodes (3): FinishedSession, SessionUnreadTracker, finished()

### Community 229 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 230 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 231 - "use-foreground-handoff.ts"
Cohesion: 0.47
Nodes (3): foregroundHandoffTimeoutMs, Handoff, useForegroundHandoff()

### Community 232 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 233 - "worker-handler.ts"
Cohesion: 0.47
Nodes (4): render, scope, handleRenderRequest(), RenderRequest

### Community 234 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 235 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 236 - "appearance.ts"
Cohesion: 0.50
Nodes (3): Appearance, appearanceFrom(), appearanceStorageKey

## Knowledge Gaps
- **1458 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1453 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2447 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `ClaudeAgentService`, `contracts.ts`, `session-store.ts`, `agent-service.ts`, `storedProvider`, `TerminalSessionController`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `contracts.ts`, `claude-agent-service.ts`, `ManagedSession`, `ProviderSessionService`, `TerminalSessionController`, `session-resource-clear.test.ts`, `RemoteNodeClient`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `recovery-resend-durability.test.ts`, `contracts.ts`, `ClaudeAgentService`, `node-routes.ts`, `agent-service.ts`, `claude-agent-service.ts`, `storedProvider`, `background-task-adapter.ts`, `TerminalSessionController`, `agent-service.test.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `AppWorkspace()` (e.g. with `drawerIsOverlay()` and `prefersLightNow()`) actually correct?**
  _`AppWorkspace()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1458 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.032127465064646726 - nodes in this community are weakly interconnected._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.03081369982547993 - nodes in this community are weakly interconnected._
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
- `e2e/ui-locks.pw.ts-snapshots/desktop-conversation-tool-rows-chromium-linux.png`
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
- `e2e/ui-locks.pw.ts-snapshots/desktop-session-actions-busy-chromium-linux.png`
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
- `e2e/ui-locks.pw.ts-snapshots/foldable-conversation-tool-rows-chromium-linux.png`
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
- `e2e/ui-locks.pw.ts-snapshots/foldable-session-actions-busy-chromium-linux.png`
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
- `e2e/ui-locks.pw.ts-snapshots/phone-conversation-tool-rows-chromium-linux.png`
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
- `e2e/ui-locks.pw.ts-snapshots/phone-session-actions-busy-chromium-linux.png`
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
