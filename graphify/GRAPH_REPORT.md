# Agentic Remote - Graphify code map

Snapshot: `c747d63a0c7727d8b6a6e80608b435b41420812a6ae44f49630308c202dbe64a`

Source checkout: `533add2c84db6a40a7004f3b002d655809247d20`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 662 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 662 files · ~1,179,349 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9264 nodes · 26762 edges · 271 communities (224 shown, 28 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1329 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionDetail
- AppWorkspace
- api.ts
- ClaudeAgentService
- App.tsx
- computer-manager.ts
- agent-service.ts
- oracle-voice-child.ts
- react
- schedules.ts
- hub-routes.ts
- contracts.ts
- .takeInTranscript
- ManagedSession
- sessionKey
- manager-tools.ts
- agent-service.test.ts
- background-task-adapter.ts
- schedule-launcher.ts
- notification-classifier.ts
- terminal-session.ts
- agentic-remote-promotion-monitor
- fake-voice.ts
- dreamer-store.ts
- recovery-resend-durability.test.ts
- oracle-voice-session.ts
- ManagerAgent
- oracle-voice-soak.ts
- shared/settings-profile.ts
- RemoteNodeClient
- oracle-voice-integration.test.ts
- oracle-voice.ts
- session-resources.ts
- TmuxTerminalSessionController
- ChatMessage
- oracle-task-store.ts
- FakeVoiceEngine
- workspace-fixtures.ts
- setupWorkspaceFixture
- queued-dispatch.test.ts
- oracle-voice-routes.ts
- oracle-voice-worker.ts
- ManagerStore
- ui-scenes.ts
- ProviderSessionService
- manager-structured-memory-validation.ts
- tmux-test-helpers.ts
- controls.tsx
- sampler.ts
- manager-agent.ts
- app.ts
- DreamerService
- OracleDreamer.tsx
- AppSettingsDialog.tsx
- src/settings-profile.ts
- transcript-window.ts
- notification-center.ts
- SchedulerStore
- agentic-remote
- ComposerActions.tsx
- dreamer-progress.ts
- terminal-session.test.ts
- oracle-voice-benchmark.ts
- manager-store.ts
- processes.ts
- OracleVoiceClient
- agentic-remote-gate
- SessionService
- composer-state.ts
- bundle
- transcription-service.ts
- FakeSessionService
- cleanDialogLine
- terminal-startup-queue.test.ts
- PushNotificationService
- TerminalSessionController
- VoicePlayback
- shell.ts
- lib.rs
- active-sessions.ts
- dependencies
- ManagerSnapshot
- VoiceCapture
- client.test.ts
- agentic-remote-promotion-setup
- oracle-voice-config.ts
- tmux-errors.integration.test.ts
- AgentProvider
- manager-agent.test.ts
- ManagerAssistant.tsx
- devDependencies
- config.rs
- manager-proactive-inbox.ts
- OracleVoiceCoordinator
- KnowledgeStore
- BackgroundTasksDialog.tsx
- capture.ts
- session-launcher.ts
- ScheduleForm.tsx
- manager-context.ts
- manager-structured-memory.ts
- NotificationCenterService
- VoiceClientControl
- SessionKnowledgeStore
- closed-sessions.ts
- dreamer-planner.ts
- client.ts
- manager-proactive-coordinator.ts
- send-matrix.integration.test.ts
- SessionOrderStore
- ManagerAssistant.test.tsx
- session-patch-browser.ts
- host-telemetry.ts
- ManagerAttachment
- startup-phases.test.ts
- ManagerProactiveInbox
- use-markdown-document.ts
- capture-workspace.ts
- real-voice.ts
- UserInputReplyInput
- cli-canary.ts
- scripts
- service.ts
- .toolHost
- manager-structured-memory-search.ts
- session-response-order.ts
- session-directory.ts
- manager-routes.ts
- compilerOptions
- delegated-transcription-service.ts
- ManagerStructuredMemoryStore
- oracle-voice-coordinator.test.ts
- vite.config.ts
- normalizeKnowledgeRelativePath
- oracle-voice-segments.ts
- oracle-voice-tickets.ts
- session-knowledge-store.ts
- session-store-providers.test.ts
- HostMonitorView.test.tsx
- compilerOptions
- full-gate.test.ts
- oracle-voice-coordinator.ts
- response-compression.test.ts
- workspace-browser.ts
- session-reply-durability.test.ts
- PromptCards.tsx
- compilerOptions
- dreamer-service.ts
- schedule-notification-service.test.ts
- OnlineRecognizer
- knowledge-tree.ts
- MessageTime.tsx
- compilerOptions
- compilerOptions
- oracle-status.test.ts
- ManagerMemory
- refusal-metrics.ts
- use-session-knowledge-root.ts
- dreamer-schedule.ts
- SessionStatus
- promotion-monitor.test.ts
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- ScheduleWorktreeService
- pipeline.ts
- terminal-form-deadline.test.ts
- session-latency-benchmark.ts
- transport.test.ts
- HostTelemetrySampler
- registerSessionKnowledgeRoutes
- .confirmSpeech
- LargeSessionService
- SkillSettingsService
- renderer.ts
- package.json
- registerHostTelemetryRoutes
- oracle-voice-assets.test.ts
- session-knowledge-routes.ts
- shared/skill-settings.ts
- fake-vad.ts
- desktop.json
- theme-contrast.test.ts
- OracleVoiceClientOptions
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- dreamer-service.test.ts
- isRecord
- VoiceTurnState
- session-scope.ts
- Pcm16Resampler
- manager-proactive-inbox.test.ts
- html-preview.ts
- use-markdown-document.test.tsx
- RecentlyClosed.test.tsx
- sign-in-expired.pw.ts
- dreamer-routes.ts
- .initialize
- SessionAdmissions
- tmux-errors.test.ts
- use-oracle-attachments.ts
- static-files.ts
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- SpeakableSegmenter
- server/skill-settings.ts
- bridge.rs
- pipeline.test.tsx
- logs-cli.test.ts
- ManagerProactiveInboxValidationError
- manager-structured-memory-performance.test.ts
- promotion-setup-execution.test.ts
- documentRenderEvents
- voice-recorder.ts
- doctor-cli.test.ts
- release-publication.test.ts
- OracleVoicePlayback
- skill-settings-jsonc.ts
- composer-layout.test.ts
- HostTelemetryClock
- session-order-routes.test.ts
- settings.ts
- HostAlertMonitor
- VoiceServerControl
- usePanelWidth
- MarkdownCodeBlock.tsx
- dreamer-app.test.ts
- promotion-setup.test.ts
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
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `FakeVoiceState` --references--> `ManagerMessage`  [EXTRACTED]
  e2e/fixtures/fake-voice.ts → shared/manager.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (271 total, 28 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (11): agentMode(), AgentService, commandShortcut(), isTerminalNotReadyRefusal(), RuntimeConfigurationError, sessionInUseConflictMessage(), queuedForPrompt(), httpBoundary() (+3 more)

### Community 1 - "SessionDetail"
Cohesion: 0.03
Nodes (84): storage(), fixture(), restart(), fixture(), connect(), createStore(), enqueue(), fixture() (+76 more)

### Community 2 - "AppWorkspace"
Cohesion: 0.02
Nodes (180): isManagerEvent(), terminalSendOptions(), SettingsChange, SettingsProfileKey, SettingsUpdateResult, submissionReceiptFromError(), replyPermission(), saveHiddenSessionVisibility() (+172 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (155): ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionSkillSummary, parseSubmissionReceipt(), activateSession(), activityArgumentFormats, activityDetailStatuses (+147 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.03
Nodes (52): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentService, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), isMissingClaudeSessionError() (+44 more)

### Community 5 - "App.tsx"
Cohesion: 0.03
Nodes (113): extension(), MAX_SESSION_FILE_BYTES, sessionFileValidationError(), supportedExtensions, supportsSessionFile(), TRANSCRIPT_WINDOW, executeCommand(), ActivityRowStates (+105 more)

### Community 6 - "computer-manager.ts"
Cohesion: 0.04
Nodes (79): WorkspaceFixtureOptions, connections, fixture(), managers, releases, remote, session(), RemoteSessionListing (+71 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.03
Nodes (97): activityNotInLog(), AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor() (+89 more)

### Community 8 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (54): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+46 more)

### Community 9 - "react"
Cohesion: 0.04
Nodes (74): react, hub(), AppVersion, SessionProvenance, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags (+66 more)

### Community 10 - "schedules.ts"
Cohesion: 0.04
Nodes (95): headers, hub(), sender, SCHEDULE_RUN_LIMIT, State, stateSchema, timestamp, CronField (+87 more)

### Community 11 - "hub-routes.ts"
Cohesion: 0.03
Nodes (97): activityDetailsUnavailable(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema (+89 more)

### Community 12 - "contracts.ts"
Cohesion: 0.04
Nodes (66): Connection, backgroundTaskNotFound(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), listedBackgroundTask(), readBackgroundTaskFrom() (+58 more)

### Community 13 - ".takeInTranscript"
Cohesion: 0.05
Nodes (46): contextChangedInEvents(), at(), directories, finish(), launch(), projected(), services, sessionLog() (+38 more)

### Community 14 - "ManagedSession"
Cohesion: 0.07
Nodes (14): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), ManagerEventSource, registerHubRoutes(), SessionMuteCarrier, FakeManager (+6 more)

### Community 15 - "sessionKey"
Cohesion: 0.04
Nodes (77): closedSessionExpiresAt(), listClosedSessions(), cancelSelectedBackgroundTask(), changeSessionUnread(), handleDragEnd(), toggleSelectedSessionMute(), toggleSessionUnread(), foregroundHandoffTimeoutMs (+69 more)

### Community 16 - "manager-tools.ts"
Cohesion: 0.04
Nodes (46): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+38 more)

### Community 17 - "agent-service.test.ts"
Cohesion: 0.03
Nodes (52): complete(), event(), sessionWithLog(), start(), CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures (+44 more)

### Community 18 - "background-task-adapter.ts"
Cohesion: 0.06
Nodes (73): DeferredSession, addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress (+65 more)

### Community 19 - "schedule-launcher.ts"
Cohesion: 0.07
Nodes (34): enableSchedulerTools(), LaunchPrimitives, provenance(), recordScheduleProvenance(), ScheduleLauncherHost, ScheduleProvenance, scheduleSessionTitle(), SessionScheduleLauncher (+26 more)

### Community 20 - "notification-classifier.ts"
Cohesion: 0.05
Nodes (59): ComputerManagerEvents, HOST_ALERT_POLL_INTERVAL_MS, computer, observe(), snapshot(), start, sustained(), center() (+51 more)

### Community 21 - "terminal-session.ts"
Cohesion: 0.05
Nodes (78): composer(), processAdapter, afterExit(), boxedComposerFrame(), busyRowStatus(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes (+70 more)

### Community 22 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 23 - "fake-voice.ts"
Cohesion: 0.04
Nodes (24): ActiveBackendSession, beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice() (+16 more)

### Community 24 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (45): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+37 more)

### Community 25 - "recovery-resend-durability.test.ts"
Cohesion: 0.03
Nodes (64): root, script, ClaudeSdk, deferred(), disk, fixtures, holdClaimWrite(), releases (+56 more)

### Community 26 - "oracle-voice-session.ts"
Cohesion: 0.04
Nodes (42): apps, directories, BuildAppOptions, voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngineFactory, config, VoiceEngineFactory (+34 more)

### Community 27 - "ManagerAgent"
Cohesion: 0.08
Nodes (14): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+6 more)

### Community 28 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (33): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+25 more)

### Community 29 - "shared/settings-profile.ts"
Cohesion: 0.06
Nodes (53): WorkspaceFixtureState, execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), profileStore() (+45 more)

### Community 30 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (18): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, requestBytes(), client(), servers, session (+10 more)

### Community 31 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (39): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+31 more)

### Community 32 - "oracle-voice.ts"
Cohesion: 0.07
Nodes (48): VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient (+40 more)

### Community 33 - "session-resources.ts"
Cohesion: 0.08
Nodes (48): ClaudeResources, releases, session, snapshot, claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills (+40 more)

### Community 34 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (24): terminalComposerUnreadable(), startAgentAfterClear(), awaitingRelaunch(), backgroundShellsAllow(), captureForReplacement(), capturePane(), copilotCommand(), endProbeSession() (+16 more)

### Community 35 - "ChatMessage"
Cohesion: 0.06
Nodes (49): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, toolCallIdFromActivityId() (+41 more)

### Community 36 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (44): DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+36 more)

### Community 37 - "FakeVoiceEngine"
Cohesion: 0.05
Nodes (26): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceSttEngine, VoiceTtsEngine, VoiceUtteranceAudioFrame (+18 more)

### Community 38 - "workspace-fixtures.ts"
Cohesion: 0.04
Nodes (44): frame(), geometry, output, scratch, screenshot(), { values }, accents, Measurement (+36 more)

### Community 39 - "setupWorkspaceFixture"
Cohesion: 0.04
Nodes (34): desktop, devices, long, open(), phone, veryLong, bounds(), closedEarlier (+26 more)

### Community 40 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (32): nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), QueuedDelivery (+24 more)

### Community 41 - "oracle-voice-routes.ts"
Cohesion: 0.06
Nodes (45): nodeVoiceCapabilities(), sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes() (+37 more)

### Community 42 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (26): benchmarkGroup(), VoiceEngineSession, VoiceGenerationIdentity, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage() (+18 more)

### Community 43 - "ManagerStore"
Cohesion: 0.07
Nodes (11): openStore(), emptyState(), ManagerStore, open(), createManager(), StoredManager, createManager(), SecurityManager (+3 more)

### Community 44 - "ui-scenes.ts"
Cohesion: 0.06
Nodes (36): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+28 more)

### Community 45 - "ProviderSessionService"
Cohesion: 0.06
Nodes (3): updateComputerForLaunchIdentity(), owns(), ProviderSessionService

### Community 46 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 47 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (48): foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity(), SocketPlace, UnixSocket (+40 more)

### Community 48 - "controls.tsx"
Cohesion: 0.08
Nodes (50): AppearanceSetting, NewSessionBackendSetting, listDirectories(), AddKnowledgeRootDialog(), browse(), shortcutKeys(), readStoredShortcuts(), AppShortcutBinding (+42 more)

### Community 49 - "sampler.ts"
Cohesion: 0.07
Nodes (48): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+40 more)

### Community 50 - "manager-agent.ts"
Cohesion: 0.06
Nodes (41): DreamerProgressView, automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung, TURN_ACTIVITY (+33 more)

### Community 51 - "app.ts"
Cohesion: 0.06
Nodes (34): buildApp(), errorStatusCode(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), FileUploadError, registerFileUploadRoutes(), SessionParams (+26 more)

### Community 52 - "DreamerService"
Cohesion: 0.12
Nodes (10): DreamerMemoryMetadata, boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs() (+2 more)

### Community 53 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (44): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+36 more)

### Community 54 - "AppSettingsDialog.tsx"
Cohesion: 0.08
Nodes (46): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), currentAppViewportGeometry(), changed(), frames (+38 more)

### Community 55 - "src/settings-profile.ts"
Cohesion: 0.08
Nodes (25): NewSessionRuntime, sameSettingValue(), SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+17 more)

### Community 56 - "transcript-window.ts"
Cohesion: 0.09
Nodes (25): changedInPlace(), diffMessages(), Publication, sameField(), sameMessage(), sameOrder(), sessionKey(), SessionPublications (+17 more)

### Community 57 - "notification-center.ts"
Cohesion: 0.07
Nodes (38): booleanQuery, filters, params, cursorSchema, durableState(), identity, kind, NOTIFICATION_LIMIT (+30 more)

### Community 58 - "SchedulerStore"
Cohesion: 0.12
Nodes (7): deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, ScheduleProposal, Schedule, ScheduleRunStatus

### Community 59 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 60 - "ComposerActions.tsx"
Cohesion: 0.08
Nodes (21): families, modelFamily, shortModelName(), repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions() (+13 more)

### Community 61 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, DreamerProgressSource (+11 more)

### Community 62 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (37): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, Screens, startCopilot() (+29 more)

### Community 63 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (39): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, deferred() (+31 more)

### Community 64 - "manager-store.ts"
Cohesion: 0.09
Nodes (24): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, JournalRecorder (+16 more)

### Community 65 - "processes.ts"
Cohesion: 0.09
Nodes (27): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+19 more)

### Community 66 - "OracleVoiceClient"
Cohesion: 0.14
Nodes (8): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError(), terminalCloseCode()

### Community 67 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 68 - "SessionService"
Cohesion: 0.08
Nodes (3): registerNodeRoutes(), node(), SessionService

### Community 69 - "composer-state.ts"
Cohesion: 0.10
Nodes (40): composerChanged(), composerPasted(), moveComposerDraft(), persistComposerDrafts(), restoreComposerSubmission(), composerReadFailureMessage(), readComposerDrafts(), readLegacyComposerDrafts() (+32 more)

### Community 70 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 71 - "transcription-service.ts"
Cohesion: 0.07
Nodes (24): registerTranscriptionRoutes(), transcriptionMultipartOptions, CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync (+16 more)

### Community 72 - "FakeSessionService"
Cohesion: 0.06
Nodes (5): ClaudeFakeSessionService, FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 73 - "cleanDialogLine"
Cohesion: 0.11
Nodes (38): activeBottomFrame(), captureBeforeDeadline(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+30 more)

### Community 74 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (32): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+24 more)

### Community 75 - "PushNotificationService"
Cohesion: 0.11
Nodes (9): start(), HubEventSource, PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema (+1 more)

### Community 76 - "TerminalSessionController"
Cohesion: 0.05
Nodes (13): removeCopilotSessionFiles(), bootLegacy(), directories, execute, pending, releases, SeedState, services (+5 more)

### Community 77 - "VoicePlayback"
Cohesion: 0.10
Nodes (11): pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio(), validateGeneration() (+3 more)

### Community 78 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 79 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 80 - "active-sessions.ts"
Cohesion: 0.10
Nodes (32): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+24 more)

### Community 81 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 82 - "ManagerSnapshot"
Cohesion: 0.06
Nodes (11): FakeManager, apps, directories, ProactiveManager, directories, FakeAgent, fixture(), managed() (+3 more)

### Community 83 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 84 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 85 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 86 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (26): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+18 more)

### Community 87 - "tmux-errors.integration.test.ts"
Cohesion: 0.08
Nodes (19): ServerRole, SessionMetadataLookup, ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore, directories, disk (+11 more)

### Community 88 - "AgentProvider"
Cohesion: 0.07
Nodes (22): closable(), provider(), apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp() (+14 more)

### Community 89 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (17): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+9 more)

### Community 90 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (33): cancelManager(), editQueuedManagerMessage(), resetManager(), retryManagerMessage(), ActivityRow, applyEvent(), canTakeFocus(), ConfirmationCard (+25 more)

### Community 91 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 92 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 93 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (36): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, eventId(), hasExactKeys(), isDisposition(), isEventKind() (+28 more)

### Community 94 - "OracleVoiceCoordinator"
Cohesion: 0.12
Nodes (4): AudioCompletion, AudioGate, OracleVoiceCoordinator, resolvedAudioGate()

### Community 95 - "KnowledgeStore"
Cohesion: 0.12
Nodes (14): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+6 more)

### Community 96 - "BackgroundTasksDialog.tsx"
Cohesion: 0.11
Nodes (28): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+20 more)

### Community 97 - "capture.ts"
Cohesion: 0.07
Nodes (17): BufferedFrame, defaultAudioContext(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode (+9 more)

### Community 98 - "session-launcher.ts"
Cohesion: 0.09
Nodes (19): delay(), requireFolderTrust(), sameFolder(), SessionFolderTrustPolicy, SessionLaunch, SessionLauncher, SessionLauncherHost, SessionLaunchInput (+11 more)

### Community 99 - "ScheduleForm.tsx"
Cohesion: 0.13
Nodes (25): scheduleProposalSummary(), ScheduleTarget, FolderPicker(), browse(), editableSchedule(), recurrenceSummary(), runDuration(), scheduleError() (+17 more)

### Community 100 - "manager-context.ts"
Cohesion: 0.13
Nodes (27): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+19 more)

### Community 101 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 102 - "NotificationCenterService"
Cohesion: 0.14
Nodes (6): NotificationCenterService, emptyState(), matchesNotification(), NotificationStore, setup(), NotificationFilter

### Community 103 - "VoiceClientControl"
Cohesion: 0.19
Nodes (4): asSessionError(), EngineVoiceBackendSession, VoiceSessionError, VoiceClientControl

### Community 104 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 105 - "closed-sessions.ts"
Cohesion: 0.09
Nodes (19): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, recordClosure(), blockParents, CLOSED_SESSION_RETENTION_MS, closedCapitals() (+11 more)

### Community 106 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (30): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+22 more)

### Community 107 - "client.ts"
Cohesion: 0.10
Nodes (23): VoiceCapabilities, getOracleVoiceCapabilities(), closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode (+15 more)

### Community 108 - "manager-proactive-coordinator.ts"
Cohesion: 0.16
Nodes (9): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, SessionLifecycle, ManagerProactiveInboxEvent (+1 more)

### Community 109 - "send-matrix.integration.test.ts"
Cohesion: 0.07
Nodes (27): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+19 more)

### Community 110 - "SessionOrderStore"
Cohesion: 0.16
Nodes (12): orderStore(), carried(), laneFrom(), retire(), sameLane(), sessionOrderKey(), SessionOrderState, SessionOrderStore (+4 more)

### Community 111 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (17): removeQueuedManagerMessage(), resolveManagerConfirmation(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+9 more)

### Community 112 - "session-patch-browser.ts"
Cohesion: 0.12
Nodes (26): pageFor(), advance(), connections, content(), FrameMeasurement, lastHeading(), message(), open() (+18 more)

### Community 113 - "host-telemetry.ts"
Cohesion: 0.10
Nodes (24): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_MAX_QUEUE_BYTES, HOST_TELEMETRY_MAX_QUEUE_MESSAGES, HOST_TELEMETRY_SEND_TIMEOUT_MS, HostSocket, aggregate, DiskSpaceSchema, HOST_TELEMETRY_CAPABILITY_VERSION (+16 more)

### Community 114 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 115 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (17): phases, port, app(), directories, headers, launcher, createStartupPhases(), silentStartupPhases (+9 more)

### Community 116 - "ManagerProactiveInbox"
Cohesion: 0.16
Nodes (8): ManagerProactiveInbox, ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, nowIso(), openInbox()

### Community 117 - "use-markdown-document.ts"
Cohesion: 0.14
Nodes (21): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+13 more)

### Community 118 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 119 - "real-voice.ts"
Cohesion: 0.13
Nodes (11): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+3 more)

### Community 120 - "UserInputReplyInput"
Cohesion: 0.17
Nodes (8): isUncertainDelivery(), persistedFormAnswer(), terminalAnswerRefused(), TerminalFormContinuation, validateUserInputForm(), TerminalFormReplyError, UserInputReplyInput, deliveryUncertaintyFromError()

### Community 121 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 122 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 123 - "service.ts"
Cohesion: 0.14
Nodes (11): HostRequest, HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError(), HostTelemetryService, HostTelemetryTarget, HOST_TELEMETRY_INVALID_CODE, HostMinuteAggregate (+3 more)

### Community 124 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 125 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 126 - "session-response-order.ts"
Cohesion: 0.14
Nodes (20): TRANSCRIPT_CARRIED_LIMIT, sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+12 more)

### Community 127 - "session-directory.ts"
Cohesion: 0.17
Nodes (18): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+10 more)

### Community 128 - "manager-routes.ts"
Cohesion: 0.12
Nodes (15): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+7 more)

### Community 129 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 130 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (12): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload (+4 more)

### Community 131 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 132 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 133 - "vite.config.ts"
Cohesion: 0.12
Nodes (12): brotliAsync, compress(), gzipAsync, precompressDirectory(), PrecompressedFile, directories, canaryTests, oracleVoiceAssetNames (+4 more)

### Community 134 - "normalizeKnowledgeRelativePath"
Cohesion: 0.18
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+10 more)

### Community 135 - "oracle-voice-segments.ts"
Cohesion: 0.16
Nodes (21): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+13 more)

### Community 136 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 137 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 138 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+3 more)

### Community 139 - "HostMonitorView.test.tsx"
Cohesion: 0.17
Nodes (18): HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics, snapshot, Socket, bytes() (+10 more)

### Community 140 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 141 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 142 - "oracle-voice-coordinator.ts"
Cohesion: 0.11
Nodes (14): ManagerEventSource, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnection, OracleVoiceCoordinatorOptions (+6 more)

### Community 143 - "response-compression.test.ts"
Cohesion: 0.14
Nodes (18): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), apps (+10 more)

### Community 144 - "workspace-browser.ts"
Cohesion: 0.21
Nodes (17): validateKnowledgeRoot(), assertOpenedFilePath(), fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath() (+9 more)

### Community 145 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 146 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 147 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 148 - "dreamer-service.ts"
Cohesion: 0.18
Nodes (18): DreamerPlanDraft, DreamerPlannerInput, DreamerProgressLimits, DreamerPlannerExecutionInput, DreamerServiceOptions, safeRunError(), unavailableSnapshot(), DreamerStoreSnapshot (+10 more)

### Community 149 - "schedule-notification-service.test.ts"
Cohesion: 0.18
Nodes (6): ScheduleNotificationService, input(), now, run(), ScheduleRunNotification, SchedulerChanged

### Community 150 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 151 - "knowledge-tree.ts"
Cohesion: 0.18
Nodes (17): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+9 more)

### Community 152 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 153 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 154 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 155 - "oracle-status.test.ts"
Cohesion: 0.18
Nodes (15): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+7 more)

### Community 156 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 157 - "refusal-metrics.ts"
Cohesion: 0.16
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+7 more)

### Community 158 - "use-session-knowledge-root.ts"
Cohesion: 0.15
Nodes (11): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base, bindingKey(), knowledgePositionForBinding(), SessionIdentity, first (+3 more)

### Community 159 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 160 - "SessionStatus"
Cohesion: 0.15
Nodes (13): Seen, ManagerProactiveInboxObservation, PersistedCursor, NotificationCursor, Row, SdkRestartRecovery, FinishedSession, SessionUnreadTracker (+5 more)

### Community 161 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 162 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 163 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 164 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 165 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 166 - "ScheduleWorktreeService"
Cohesion: 0.35
Nodes (5): execute, failure(), missing(), ScheduleWorktreeService, ScheduleWorktreeRecord

### Community 167 - "pipeline.ts"
Cohesion: 0.18
Nodes (16): openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), documentParts(), documentUrlTransform(), drawSteps(), growable (+8 more)

### Community 168 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 169 - "session-latency-benchmark.ts"
Cohesion: 0.23
Nodes (15): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+7 more)

### Community 170 - "transport.test.ts"
Cohesion: 0.14
Nodes (11): prefixes, session, trusted, untrusted, readingFixture(), empty, inventory, listen() (+3 more)

### Community 172 - "registerSessionKnowledgeRoutes"
Cohesion: 0.26
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 175 - "SkillSettingsService"
Cohesion: 0.23
Nodes (8): readBounded(), revision(), applications, directories, fixture(), settingsObject(), SkillSettingsError, SkillSettingsService

### Community 176 - "renderer.ts"
Cohesion: 0.19
Nodes (7): DocumentRenderEvent, createWorkerRenderer(), defaultDocumentRenderer(), RendererWorker, synchronousRenderer, FakeWorker, startWorkers()

### Community 177 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 178 - "registerHostTelemetryRoutes"
Cohesion: 0.21
Nodes (8): HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, registerHostTelemetryRoutes(), HostTelemetrySocket

### Community 179 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 180 - "session-knowledge-routes.ts"
Cohesion: 0.13
Nodes (10): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema, SessionKnowledgeLifecycle (+2 more)

### Community 181 - "shared/skill-settings.ts"
Cohesion: 0.23
Nodes (9): registerSkillSettingsRoutes(), SkillSettingsTarget, SKILL_SETTINGS_CAPABILITY, skillFrontmatterNameSchema, skillNameSchema, skillSettingsSchema, SkillSettingsSnapshot, SkillToggle (+1 more)

### Community 182 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 183 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 184 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 185 - "OracleVoiceClientOptions"
Cohesion: 0.23
Nodes (3): OracleVoiceClientOptions, FakeVoiceClient, transcript()

### Community 186 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 187 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 188 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 189 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 190 - "isRecord"
Cohesion: 0.24
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 192 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 193 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 194 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 195 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 196 - "use-markdown-document.test.tsx"
Cohesion: 0.18
Nodes (5): RenderedDocumentTree, DocumentRenderer, DocumentRendererContext, components, show()

### Community 197 - "RecentlyClosed.test.tsx"
Cohesion: 0.20
Nodes (8): act(), audit(), closed, computers, now, observeResizes(), session(), windowWide()

### Community 198 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 199 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (9): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+1 more)

### Community 200 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 202 - "tmux-errors.test.ts"
Cohesion: 0.24
Nodes (9): containedServer(), directories, errno(), { execute }, files, links, listener(), places() (+1 more)

### Community 203 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 204 - "static-files.ts"
Cohesion: 0.27
Nodes (6): RFC-9110, AcceptedEncodings, FILE_HEADERS, isApiPath(), isAppleTouchIconProbe(), registerStaticFiles()

### Community 205 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 206 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 207 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 208 - "SpeakableSegmenter"
Cohesion: 0.29
Nodes (3): SpeakableSegmenter, validateMessageId(), ./server/oracle-voice-segments.ts

### Community 209 - "server/skill-settings.ts"
Cohesion: 0.36
Nodes (8): isWithin(), builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), scalar(), skillFrontmatter(), SkillRoot

### Community 210 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 211 - "pipeline.test.tsx"
Cohesion: 0.27
Nodes (7): components, drawn(), drawnPage(), fixtures, html(), today(), rehypeDocumentHeadings()

### Community 212 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 213 - "ManagerProactiveInboxValidationError"
Cohesion: 0.28
Nodes (6): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions()

### Community 214 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.31
Nodes (6): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult

### Community 215 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 216 - "documentRenderEvents"
Cohesion: 0.31
Nodes (7): render, scope, documentOpening(), documentRenderEvents(), sameNode(), handleRenderRequest(), RenderRequest

### Community 217 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 218 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 219 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 221 - "skill-settings-jsonc.ts"
Cohesion: 0.48
Nodes (5): instrument(), document(), parseSkillSettings(), replaceDisabledSkills(), Token

### Community 222 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 224 - "session-order-routes.test.ts"
Cohesion: 0.43
Nodes (6): directories, fakeManager(), hub(), settled(), until(), upserted()

### Community 225 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 227 - "VoiceServerControl"
Cohesion: 0.40
Nodes (4): connect(), Inbox, rawBuffer(), VoiceServerControl

### Community 228 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 229 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 231 - "dreamer-app.test.ts"
Cohesion: 0.40
Nodes (3): directories, runtimes, trusted

### Community 232 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1474 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1469 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2476 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `manager-routes.ts`, `delegated-transcription-service.ts`, `SessionDetail`, `ClaudeAgentService`, `hub-routes.ts`, `ManagedSession`, `response-compression.test.ts`, `schedule-launcher.ts`, `schedule-notification-service.test.ts`, `oracle-voice-session.ts`, `ManagerAgent`, `refusal-metrics.ts`, `shared/settings-profile.ts`, `oracle-task-store.ts`, `ScheduleWorktreeService`, `oracle-voice-worker.ts`, `HostTelemetrySampler`, `ManagerStore`, `ProviderSessionService`, `SkillSettingsService`, `registerHostTelemetryRoutes`, `DreamerService`, `shared/skill-settings.ts`, `SchedulerStore`, `manager-store.ts`, `SessionService`, `dreamer-routes.ts`, `transcription-service.ts`, `PushNotificationService`, `static-files.ts`, `oracle-voice-config.ts`, `tmux-errors.integration.test.ts`, `KnowledgeStore`, `HostAlertMonitor`, `NotificationCenterService`, `SessionKnowledgeStore`, `manager-proactive-coordinator.ts`, `SessionOrderStore`, `ManagerProactiveInbox`, `UserInputReplyInput`, `cli-canary.ts`, `service.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ClaudeAgentService` connect `ClaudeAgentService` to `session-resources.ts`, `SessionDetail`, `SessionService`, `storedProvider`, `transcript-window.ts`, `session-directory.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `session-resources.ts`, `ClaudeAgentService`, `queued-dispatch.test.ts`, `storedProvider`, `.takeInTranscript`, `UserInputReplyInput`, `transcript-window.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1474 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.034869240348692404 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.029482643695841665 - nodes in this community are weakly interconnected._
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
