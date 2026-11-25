# Agentic Remote - Graphify code map

Snapshot: `bbd968045a60385d9c07596017281b4c836dce9f28350ed2fa8b8d0401567fae`

Source checkout: `cfb8f0060fe91c9ed9247b9b995d7fb8de1b7609`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 679 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 679 files · ~1,204,699 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9454 nodes · 27291 edges · 262 communities (219 shown, 25 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1345 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionDetail
- api.ts
- AppWorkspace
- agent-service.ts
- oracle-voice-worker.ts
- ClaudeAgentService
- contracts.ts
- App.tsx
- terminal-session.ts
- OracleVoiceCoordinator
- app.ts
- notification-classifier.ts
- SessionService
- schedules.ts
- session-presentation.ts
- ManagedSession
- sections.tsx
- schedule-launcher.test.ts
- hub-routes.ts
- manager.ts
- manager-agent.ts
- manager-tools.ts
- oracle-voice.ts
- oracle-voice-soak.ts
- agentic-remote-promotion-monitor
- ManagerStore
- dreamer-store.ts
- session-store-providers.test.ts
- oracle-voice-benchmark.ts
- session-reply-durability.test.ts
- react
- claude-agent-service.ts
- BackgroundTaskSnapshot
- computer-manager.ts
- tmux-test-helpers.ts
- transcription-service.ts
- send-matrix.integration.test.ts
- oracle-task-store.ts
- oracle-voice-session.ts
- oracle-voice-integration.test.ts
- CopilotClientLike
- multi-node.test.ts
- RemoteNodeClient
- TmuxTerminalSessionController
- manager-structured-memory-validation.ts
- ResidentVoiceWorker
- ui-locks.pw.ts
- SchedulerStore
- sampler.ts
- ManagerAssistant.tsx
- fake-voice.ts
- FakeVoiceEngine
- OracleDreamer.tsx
- agentic-remote
- workspace-fixtures.ts
- controls.tsx
- dreamer-planner.ts
- normalizeKnowledgeRelativePath
- OracleVoiceClient
- UserInputReplyInput
- agentic-remote-gate
- ChildVoiceEngine
- dreamer-progress.ts
- DreamerService
- session-launcher.ts
- bundle
- dreamer-service.ts
- processes.ts
- AppSettingsDialog.tsx
- recovery-resend-durability.test.ts
- terminal-session.test.ts
- oracle-voice-security.test.ts
- VoicePlayback
- manager-structured-memory.ts
- ScheduleForm.tsx
- shell.ts
- lib.rs
- remote-voice-client.ts
- dependencies
- devDependencies
- server/session-patches.ts
- DialogFrame.tsx
- VoiceCapture
- client.test.ts
- agentic-remote-promotion-setup
- ChatMessage
- manager-proactive-coordinator.ts
- config.rs
- manager-agent.test.ts
- response-compression.test.ts
- background-task-adapter.ts
- ManagerStructuredMemoryStore
- knowledge-tree.ts
- ManagerAssistant.test.tsx
- pipeline.test.tsx
- capture.ts
- session-prefetch.ts
- setupWorkspaceFixture
- manager-proactive-inbox.ts
- manager-structured-memory-search.ts
- ScheduleWorktreeService
- BackgroundTasksDialog.tsx
- session-unread.pw.ts
- active-sessions.ts
- shared/settings-profile.ts
- manager-context.ts
- use-markdown-document.test.tsx
- oracle-voice-segments.ts
- SessionOrderStore
- ManagerClientDefaults
- session-patch-browser.ts
- HubEvent
- agent-service.test.ts
- session-categories.ts
- src/settings-profile.ts
- capture-workspace.ts
- session-directory.ts
- cli-canary.ts
- startup-phases.test.ts
- ActivityRow.test.tsx
- session-transcript.ts
- scripts
- .toolHost
- SettingsProfileClient
- HostMonitorView.test.tsx
- PromptCards.tsx
- compilerOptions
- settings-profile-store.ts
- SessionKnowledgeStore
- tmux-errors.ts
- host-telemetry.ts
- vite.config.ts
- transport.test.ts
- HostSnapshot
- oracle-voice-tickets.ts
- session-knowledge-store.ts
- use-oracle-attachments.ts
- compilerOptions
- session-category-store.test.ts
- full-gate.test.ts
- service.ts
- SessionCategoryStore
- ActivityDetails.tsx
- markdown-navigation.ts
- compilerOptions
- background-task-stop.test.ts
- ManagerProactiveInbox
- schedule-notification-service.test.ts
- OnlineRecognizer
- server/skill-settings.ts
- workspace-browser.ts
- MessageTime.tsx
- compilerOptions
- SELECTED_SESSION_ID
- oracle-status.test.ts
- compilerOptions
- HostTelemetrySampler
- ManagerMemory
- use-oracle-settings.ts
- dreamer-schedule.ts
- KnowledgeStore
- promotion-monitor.test.ts
- BoundedQueue
- client.ts
- ReaderWorkspace
- scripts
- session-knowledge-routes.ts
- ManagerAttachment
- SkillSettingsService
- SettingsProfileSnapshot
- pipeline.ts
- terminal-form-deadline.test.ts
- knowledge-store.ts
- registerSessionKnowledgeRoutes
- session-category-routes.ts
- package.json
- projection-test-helpers.ts
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- recordValue
- manager-runtime.ts
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- dreamer-routes.ts
- .observe
- closed-sessions.ts
- use-session-categories.ts
- Pcm16Resampler
- pending-echo.ts
- document-render.pw.ts
- manager-proactive-inbox.test.ts
- html-preview.ts
- manager-automatic.ts
- sign-in-expired.pw.ts
- DeferredSession
- command-catalog-cache.test.ts
- isRecord
- SessionAdmissions
- session-knowledge-store.test.ts
- static-files.ts
- dataset
- generate-pwa-icons.ts
- bridge.rs
- logs-cli.test.ts
- ManagerProactiveInboxValidationError
- promotion-setup-execution.test.ts
- SkillsSettings.tsx
- sent-message.ts
- doctor-cli.test.ts
- release-publication.test.ts
- UserInputFieldControl
- OracleVoicePlayback
- session-list-collisions.test.ts
- normalizeBackgroundTask
- composer-layout.test.ts
- HostTelemetryClock
- session-order-routes.test.ts
- settings.ts
- DocumentViewControls.tsx
- refusal-metrics-routes.test.ts
- skill-settings-jsonc.ts
- promotion-setup.test.ts
- MemoryStorage
- skill-builtin-roots.ts
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
1. `AppWorkspace()` - 366 edges
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

## Communities (262 total, 25 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (20): agentMode(), AgentService, commandShortcut(), isMissingSessionError(), isTerminalNotReadyRefusal(), normalizedTitle(), removeCopilotSessionFiles(), RuntimeConfigurationError (+12 more)

### Community 1 - "SessionDetail"
Cohesion: 0.03
Nodes (94): fixture(), restart(), fixture(), connect(), createStore(), enqueue(), fixture(), recoveryFixture() (+86 more)

### Community 2 - "api.ts"
Cohesion: 0.02
Nodes (159): SettingsChange, SettingsProfileKey, SettingsUpdateResult, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionReceipt, TRANSCRIPT_WINDOW (+151 more)

### Community 3 - "AppWorkspace"
Cohesion: 0.03
Nodes (175): terminalSendOptions(), newSessionCategoryId(), sessionCategoryOf(), submissionReceiptFromError(), askSession(), deleteSession(), getSession(), saveSessionHidden() (+167 more)

### Community 4 - "agent-service.ts"
Cohesion: 0.03
Nodes (120): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+112 more)

### Community 5 - "oracle-voice-worker.ts"
Cohesion: 0.03
Nodes (82): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+74 more)

### Community 6 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (33): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+25 more)

### Community 7 - "contracts.ts"
Cohesion: 0.03
Nodes (95): ClaudeAgentServiceEvents, ClaudeResources, DirectoryScope, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, ProviderSessionServiceEvents, closable(), provider() (+87 more)

### Community 8 - "App.tsx"
Cohesion: 0.03
Nodes (123): isManagerEvent(), extension(), MAX_SESSION_FILE_BYTES, sessionFileValidationError(), supportedExtensions, supportsSessionFile(), executeCommand(), listWorkspace() (+115 more)

### Community 9 - "terminal-session.ts"
Cohesion: 0.04
Nodes (120): composer(), processAdapter, activeBottomFrame(), afterExit(), backgroundShellsAllow(), boxedComposerFrame(), busyRowStatus(), captureBeforeDeadline() (+112 more)

### Community 10 - "OracleVoiceCoordinator"
Cohesion: 0.04
Nodes (42): ManagerEventSource, ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect() (+34 more)

### Community 11 - "app.ts"
Cohesion: 0.03
Nodes (68): buildApp(), errorStatusCode(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), directories, runtimes, trusted (+60 more)

### Community 12 - "notification-classifier.ts"
Cohesion: 0.04
Nodes (68): WorkspaceFixtureOptions, HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, computer, observe(), snapshot(), start, sustained() (+60 more)

### Community 13 - "SessionService"
Cohesion: 0.03
Nodes (14): nodeVoiceCapabilities(), registerNodeRoutes(), owns(), ProviderSessionService, obstructUploads(), readServiceResources(), readSessionSkills(), sameResourceOwner() (+6 more)

### Community 14 - "schedules.ts"
Cohesion: 0.04
Nodes (96): proposalInput, State, stateSchema, timestamp, CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES (+88 more)

### Community 15 - "session-presentation.ts"
Cohesion: 0.03
Nodes (89): session(), CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), KnowledgeRootSelector(), root, CloseSessionDialog(), noPrompts, RecentlyClosedCard() (+81 more)

### Community 16 - "ManagedSession"
Cohesion: 0.07
Nodes (19): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, normalizeNodeUrl(), SessionLauncherOptions (+11 more)

### Community 17 - "sections.tsx"
Cohesion: 0.05
Nodes (64): hub(), AppVersion, SessionProvenance, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue (+56 more)

### Community 18 - "schedule-launcher.test.ts"
Cohesion: 0.06
Nodes (46): LaunchPrimitives, provenance(), recordScheduleProvenance(), ScheduleLauncherHost, ScheduleProvenance, scheduleSessionTitle(), SessionScheduleLauncher, directories (+38 more)

### Community 19 - "hub-routes.ts"
Cohesion: 0.03
Nodes (88): activityDetailsUnavailable(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema (+80 more)

### Community 20 - "manager.ts"
Cohesion: 0.03
Nodes (40): FakeManager, ProactiveManager, FakeAgent, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError() (+32 more)

### Community 21 - "manager-agent.ts"
Cohesion: 0.06
Nodes (24): DreamerProgressView, automaticPayload(), checkContent(), delay(), discover(), errorMessage(), isNotFound(), isPending() (+16 more)

### Community 22 - "manager-tools.ts"
Cohesion: 0.04
Nodes (46): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+38 more)

### Community 23 - "oracle-voice.ts"
Cohesion: 0.05
Nodes (71): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+63 more)

### Community 24 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (35): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+27 more)

### Community 25 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 26 - "ManagerStore"
Cohesion: 0.06
Nodes (28): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+20 more)

### Community 27 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (45): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+37 more)

### Community 28 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (42): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), QueuedDelivery, QueuedDispatchTarget (+34 more)

### Community 29 - "oracle-voice-benchmark.ts"
Cohesion: 0.05
Nodes (62): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, buildConfig(), CliOptions, clockTicksPerSecond() (+54 more)

### Community 30 - "session-reply-durability.test.ts"
Cohesion: 0.04
Nodes (57): root, script, ClaudeSdk, deferred(), disk, fixtures, holdClaimWrite(), releases (+49 more)

### Community 31 - "react"
Cohesion: 0.05
Nodes (37): react, families, modelFamily, shortModelName(), repositoryModels, listClosedSessions(), AttachmentStrip(), Composer() (+29 more)

### Community 32 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (51): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+43 more)

### Community 33 - "BackgroundTaskSnapshot"
Cohesion: 0.05
Nodes (39): backgroundTaskNotFound(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), listedBackgroundTask(), readBackgroundTaskFrom(), taskFingerprint() (+31 more)

### Community 34 - "computer-manager.ts"
Cohesion: 0.04
Nodes (45): ServerRole, connections, fixture(), managers, releases, remote, session(), RemoteSessionListing (+37 more)

### Community 35 - "tmux-test-helpers.ts"
Cohesion: 0.06
Nodes (55): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+47 more)

### Community 36 - "transcription-service.ts"
Cohesion: 0.05
Nodes (37): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, headerSafe() (+29 more)

### Community 37 - "send-matrix.integration.test.ts"
Cohesion: 0.04
Nodes (56): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+48 more)

### Community 38 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (45): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+37 more)

### Community 39 - "oracle-voice-session.ts"
Cohesion: 0.07
Nodes (24): exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), ObservedLocalVoiceBackend, RouteVoiceBackend, acquisitionCancelled(), ActiveUtterance (+16 more)

### Community 40 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+24 more)

### Community 41 - "CopilotClientLike"
Cohesion: 0.04
Nodes (37): complete(), event(), sessionWithLog(), start(), CopilotClientLike, holdProbe(), fixtures, gate() (+29 more)

### Community 42 - "multi-node.test.ts"
Cohesion: 0.05
Nodes (11): activityNotInLog(), ClaudeFakeSessionService, directories, FakeSessionService, routingFixture(), session(), temporaryDirectory(), voiceControlQueues (+3 more)

### Community 43 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (13): RemoteResync, RemoteSessionRead, RemoteNodeClient, client(), servers, session, RemoteNodeCapabilityError, RemoteNodeTransportError (+5 more)

### Community 44 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (18): startAgentAfterClear(), isSessionScopeLauncher(), sessionLaunchCommand(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, processAncestors() (+10 more)

### Community 45 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (52): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+44 more)

### Community 46 - "ResidentVoiceWorker"
Cohesion: 0.08
Nodes (15): combinedTranscript(), errorMessage(), float32ToPcm16(), matchesCancelled(), pcm16ToFloat32(), PiperProcess, readBoundedText(), ResidentVoiceWorker (+7 more)

### Community 47 - "ui-locks.pw.ts"
Cohesion: 0.06
Nodes (36): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+28 more)

### Community 48 - "SchedulerStore"
Cohesion: 0.11
Nodes (11): enableSchedulerTools(), fixture(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, fixture(), retainedHistory() (+3 more)

### Community 49 - "sampler.ts"
Cohesion: 0.08
Nodes (45): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+37 more)

### Community 50 - "ManagerAssistant.tsx"
Cohesion: 0.07
Nodes (45): proactivePromptEvents(), editQueuedManagerMessage(), resetManager(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), AutomaticTurn, boundWidth() (+37 more)

### Community 51 - "fake-voice.ts"
Cohesion: 0.07
Nodes (10): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance (+2 more)

### Community 52 - "FakeVoiceEngine"
Cohesion: 0.06
Nodes (23): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine, playbackSequence() (+15 more)

### Community 53 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (41): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition, getDreamer() (+33 more)

### Community 54 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 55 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (40): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+32 more)

### Community 56 - "controls.tsx"
Cohesion: 0.08
Nodes (45): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession() (+37 more)

### Community 57 - "dreamer-planner.ts"
Cohesion: 0.08
Nodes (40): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+32 more)

### Community 58 - "normalizeKnowledgeRelativePath"
Cohesion: 0.08
Nodes (34): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+26 more)

### Community 59 - "OracleVoiceClient"
Cohesion: 0.14
Nodes (9): VoiceServerControl, captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError() (+1 more)

### Community 60 - "UserInputReplyInput"
Cohesion: 0.10
Nodes (10): isUncertainDelivery(), PendingUserInputTracker, persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), TerminalFormReplyError, PendingUserInput, UserInputReplyInput (+2 more)

### Community 61 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 62 - "ChildVoiceEngine"
Cohesion: 0.10
Nodes (12): benchmarkGroup(), capabilityFromConfig(), ChildVoiceEngine, errorMessage(), isCancelledEvent(), matchesCancelled(), matchesSynthesis(), matchesUtterance() (+4 more)

### Community 63 - "dreamer-progress.ts"
Cohesion: 0.09
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, DreamerProgressSource (+11 more)

### Community 64 - "DreamerService"
Cohesion: 0.14
Nodes (8): boundedText(), DreamerService, DreamerUnavailableError, uniqueSessionRefs(), DreamerSnapshot, hasDreamerSessionIdentity(), isDreamerSessionItem(), OracleTaskAttempt

### Community 65 - "session-launcher.ts"
Cohesion: 0.07
Nodes (26): awaitTermination(), LaunchCreations, apps, directories, directory(), runtime(), services, stores (+18 more)

### Community 66 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 67 - "dreamer-service.ts"
Cohesion: 0.07
Nodes (22): DreamerMemoryMetadata, DreamerProgressLimits, digest(), DreamerServiceOptions, planWithFingerprints(), publicSnapshot(), safeRunError(), directories (+14 more)

### Community 68 - "processes.ts"
Cohesion: 0.09
Nodes (26): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+18 more)

### Community 69 - "AppSettingsDialog.tsx"
Cohesion: 0.09
Nodes (38): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), App(), applyPwaUpdate(), sidebarTouchStart(), currentAppViewportGeometry(), activatePwaUpdate() (+30 more)

### Community 70 - "recovery-resend-durability.test.ts"
Cohesion: 0.07
Nodes (26): at(), directories, finish(), launch(), projected(), services, syncSessionTranscript(), terminalService() (+18 more)

### Community 71 - "terminal-session.test.ts"
Cohesion: 0.06
Nodes (33): execFileAsync, ProbeRun, SESSION_SCOPE, sessionScopeAvailable, sessionScopeProbe(), adapter, scope, isTerminalVisiblyIdle() (+25 more)

### Community 72 - "oracle-voice-security.test.ts"
Cohesion: 0.06
Nodes (23): apps, directories, FakeVoiceEngineCall, apps, BlockingEngine, config, configFixture(), connect() (+15 more)

### Community 73 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 74 - "manager-structured-memory.ts"
Cohesion: 0.06
Nodes (34): ManagerStructuredMemorySearchIndex, isMissing(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS (+26 more)

### Community 75 - "ScheduleForm.tsx"
Cohesion: 0.11
Nodes (31): scheduleProposalSummary(), validateRecurrence(), CLAUDE_SCHEDULE_UNAVAILABLE_REASON, scheduleProviderUnavailableReason(), ScheduleTarget, getProviderRuntimeOptions(), FolderPicker(), browse() (+23 more)

### Community 76 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 77 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 78 - "remote-voice-client.ts"
Cohesion: 0.12
Nodes (17): ActiveBackendSession, VoiceBackendDisconnectCause, VoiceBackendOutput, RemoteNodeRedirectError, RemoteNodeRequestError, closeReason(), exactArrayBuffer(), rawDataBuffer() (+9 more)

### Community 79 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 80 - "devDependencies"
Cohesion: 0.05
Nodes (39): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+31 more)

### Community 81 - "server/session-patches.ts"
Cohesion: 0.10
Nodes (21): changedInPlace(), diffMessages(), Publication, PublishedTask, sameField(), sameMessage(), sameOrder(), sessionKey() (+13 more)

### Community 82 - "DialogFrame.tsx"
Cohesion: 0.09
Nodes (26): changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame(), FeatureEvent (+18 more)

### Community 83 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 84 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 85 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 86 - "ChatMessage"
Cohesion: 0.08
Nodes (27): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+19 more)

### Community 87 - "manager-proactive-coordinator.ts"
Cohesion: 0.12
Nodes (11): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, SessionLifecycle, directories, fixture() (+3 more)

### Community 88 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 89 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (18): ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail() (+10 more)

### Community 90 - "response-compression.test.ts"
Cohesion: 0.07
Nodes (20): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), apps (+12 more)

### Community 91 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (35): addActivity(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, copyTask(), createBackgroundTaskProjector() (+27 more)

### Community 92 - "ManagerStructuredMemoryStore"
Cohesion: 0.15
Nodes (10): capturePrompt(), initializeManagerStructuredMemory(), digest(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMutationResult (+2 more)

### Community 93 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (33): WorkspaceEntry, readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+25 more)

### Community 94 - "ManagerAssistant.test.tsx"
Cohesion: 0.06
Nodes (19): cancelManager(), removeQueuedManagerMessage(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl (+11 more)

### Community 95 - "pipeline.test.tsx"
Cohesion: 0.11
Nodes (26): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+18 more)

### Community 96 - "capture.ts"
Cohesion: 0.07
Nodes (17): BufferedFrame, defaultAudioContext(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode (+9 more)

### Community 97 - "session-prefetch.ts"
Cohesion: 0.10
Nodes (23): browserConnection, ConnectionHints, connectionSparesData(), IdleScheduler, PASSIVE_READS_SINCE, PREFETCH_PASS_BYTES, PREFETCH_SIDEBAR_ROWS, readsPassively() (+15 more)

### Community 98 - "setupWorkspaceFixture"
Cohesion: 0.09
Nodes (17): open(), bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), open() (+9 more)

### Community 99 - "manager-proactive-inbox.ts"
Cohesion: 0.09
Nodes (33): assertExactKeys(), cloneState(), DISPOSITIONS, hasExactKeys(), isDisposition(), isEventKind(), isId(), isOrigin() (+25 more)

### Community 100 - "manager-structured-memory-search.ts"
Cohesion: 0.11
Nodes (27): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+19 more)

### Community 101 - "ScheduleWorktreeService"
Cohesion: 0.14
Nodes (14): execute, failure(), missing(), ScheduleWorktreeService, execute, git(), node(), folder (+6 more)

### Community 102 - "BackgroundTasksDialog.tsx"
Cohesion: 0.12
Nodes (27): BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableNote() (+19 more)

### Community 103 - "session-unread.pw.ts"
Cohesion: 0.08
Nodes (20): bounds(), build(), categorizedState(), devices, drag(), open(), studio(), bounds() (+12 more)

### Community 104 - "active-sessions.ts"
Cohesion: 0.13
Nodes (25): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+17 more)

### Community 105 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (29): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+21 more)

### Community 106 - "manager-context.ts"
Cohesion: 0.13
Nodes (26): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+18 more)

### Community 107 - "use-markdown-document.test.tsx"
Cohesion: 0.09
Nodes (15): render, scope, DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), DocumentRenderer, DocumentRendererContext, RendererWorker (+7 more)

### Community 108 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 109 - "SessionOrderStore"
Cohesion: 0.15
Nodes (13): stores(), orderStore(), carried(), laneFrom(), retire(), sameLane(), sessionOrderKey(), SessionOrderState (+5 more)

### Community 110 - "ManagerClientDefaults"
Cohesion: 0.12
Nodes (15): ManagerClientDefaults, VoiceCapabilities, getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState (+7 more)

### Community 111 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 112 - "HubEvent"
Cohesion: 0.10
Nodes (17): ComputerManagerEvents, JournalRecorderOptions, Seen, sessionTask(), PersistedCursor, NotificationCursor, HubEventSource, Row (+9 more)

### Community 113 - "agent-service.test.ts"
Cohesion: 0.13
Nodes (16): terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+8 more)

### Community 114 - "session-categories.ts"
Cohesion: 0.16
Nodes (24): CategoryState, Fields, isRecord(), parseState(), refused(), validName(), applySessionCategoryChange(), clamp() (+16 more)

### Community 115 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (23): isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+15 more)

### Community 116 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 117 - "session-directory.ts"
Cohesion: 0.18
Nodes (20): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+12 more)

### Community 118 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 119 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (16): phases, port, app(), directories, headers, launcher, createStartupPhases(), startManagedServer() (+8 more)

### Community 120 - "ActivityRow.test.tsx"
Cohesion: 0.14
Nodes (19): toolCallIdFromActivityId(), ActivityStatus, activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), compactActivityText() (+11 more)

### Community 121 - "session-transcript.ts"
Cohesion: 0.14
Nodes (21): TRANSCRIPT_CARRIED_LIMIT, sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+13 more)

### Community 122 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 123 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 124 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 125 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 126 - "PromptCards.tsx"
Cohesion: 0.11
Nodes (18): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+10 more)

### Community 127 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 128 - "settings-profile-store.ts"
Cohesion: 0.17
Nodes (13): SettingsProfileState, applySettingsChanges(), applySettingsImport(), isSettingsProfileKey(), SettingsProfileRecord, SettingsRequestError, sizeChecked(), validateSettingsChanges() (+5 more)

### Community 129 - "SessionKnowledgeStore"
Cohesion: 0.21
Nodes (3): bindingKey(), SessionKnowledgeStore, SessionKnowledgeBinding

### Community 130 - "tmux-errors.ts"
Cohesion: 0.13
Nodes (20): listTmuxSessions(), foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity(), SocketPlace (+12 more)

### Community 131 - "host-telemetry.ts"
Cohesion: 0.14
Nodes (18): aggregate, DiskSpaceSchema, HostHistorySchema, HostInfoSchema, HostMetricAggregate, HostMetricAggregateSchema, HostMetrics, HostMetricsSchema (+10 more)

### Community 132 - "vite.config.ts"
Cohesion: 0.12
Nodes (12): brotliAsync, compress(), gzipAsync, precompressDirectory(), PrecompressedFile, directories, canaryTests, oracleVoiceAssetNames (+4 more)

### Community 133 - "transport.test.ts"
Cohesion: 0.12
Nodes (14): prefixes, session, trusted, untrusted, BuildAppOptions, ProcessScanContext, HostTelemetryService, readingFixture() (+6 more)

### Community 134 - "HostSnapshot"
Cohesion: 0.13
Nodes (14): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, HOST_TELEMETRY_MAX_QUEUE_BYTES (+6 more)

### Community 135 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 136 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 137 - "use-oracle-attachments.ts"
Cohesion: 0.17
Nodes (19): codeExtensions, fileTypes, managerFileValidationError(), MAX_MANAGER_FILE_BYTES, MAX_MANAGER_TEXT_BYTES, textTypes, uploadManagerFile(), attachmentSize() (+11 more)

### Community 138 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 139 - "session-category-store.test.ts"
Cohesion: 0.12
Nodes (8): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, directories, folder(), store(), CLOSED_SESSION_RETENTION_MS

### Community 140 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 141 - "service.ts"
Cohesion: 0.17
Nodes (9): HostRequest, registerHostTelemetryRoutes(), HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError(), HostTelemetryTarget, HostTelemetrySocket, HOST_TELEMETRY_INVALID_CODE (+1 more)

### Community 142 - "SessionCategoryStore"
Cohesion: 0.27
Nodes (6): registerSessionCategoryRoutes(), SessionCategoryRouteOptions, key(), remember(), SessionCategoryStore, SessionCategoriesSnapshot

### Community 143 - "ActivityDetails.tsx"
Cohesion: 0.20
Nodes (17): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, activityDetailFailure, detailKey(), formatBytes(), keep(), kept, keptActivityDetail(), loadActivityDetail() (+9 more)

### Community 144 - "markdown-navigation.ts"
Cohesion: 0.18
Nodes (19): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+11 more)

### Community 145 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 146 - "background-task-stop.test.ts"
Cohesion: 0.17
Nodes (15): BackgroundTaskProjector, backgroundTasksFromEvents(), completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell() (+7 more)

### Community 147 - "ManagerProactiveInbox"
Cohesion: 0.22
Nodes (4): ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, nowIso(), openInbox()

### Community 148 - "schedule-notification-service.test.ts"
Cohesion: 0.18
Nodes (6): ScheduleNotificationService, input(), now, run(), ScheduleRunNotification, SchedulerChanged

### Community 149 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 150 - "server/skill-settings.ts"
Cohesion: 0.19
Nodes (13): frontmatterFields(), frontmatterReason(), registerSkillSettingsRoutes(), SkillSettingsTarget, scalar(), skillFrontmatter(), SkillRoot, skillFrontmatterNameSchema (+5 more)

### Community 151 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (16): assertOpenedFilePath(), fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath() (+8 more)

### Community 152 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 153 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 154 - "SELECTED_SESSION_ID"
Cohesion: 0.12
Nodes (7): desktop, devices, long, phone, veryLong, FIXTURE_NOW, SELECTED_SESSION_ID

### Community 155 - "oracle-status.test.ts"
Cohesion: 0.18
Nodes (15): oracleHostStatusFixture(), bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes() (+7 more)

### Community 156 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 157 - "HostTelemetrySampler"
Cohesion: 0.20
Nodes (3): HostTelemetrySampler, HostMinuteAggregate, HostSample

### Community 158 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 159 - "use-oracle-settings.ts"
Cohesion: 0.18
Nodes (13): getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+5 more)

### Community 160 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 162 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 163 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 164 - "client.ts"
Cohesion: 0.14
Nodes (12): closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, PendingHello, RECONNECT_DELAYS_MS (+4 more)

### Community 165 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 166 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 167 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 168 - "ManagerAttachment"
Cohesion: 0.26
Nodes (7): failure(), ManagerUploads, referenceId, storedFile, writePrivateUpload(), managerFileType(), ManagerAttachment

### Community 169 - "SkillSettingsService"
Cohesion: 0.21
Nodes (8): readBounded(), revision(), applications, directories, fixture(), settingsObject(), SkillSettingsError, SkillSettingsService

### Community 170 - "SettingsProfileSnapshot"
Cohesion: 0.19
Nodes (7): profileStore(), SettingsProfileStore, directories, store(), isSettingsDeviceId(), SettingsProfileSnapshot, SettingsProfileTransport

### Community 171 - "pipeline.ts"
Cohesion: 0.21
Nodes (16): partlyHeldRenderer(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform(), drawSteps(), growable, htmlBlocks (+8 more)

### Community 172 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 173 - "knowledge-store.ts"
Cohesion: 0.14
Nodes (11): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, parseMetadata(), PersistedKnowledgeState (+3 more)

### Community 174 - "registerSessionKnowledgeRoutes"
Cohesion: 0.26
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 175 - "session-category-routes.ts"
Cohesion: 0.12
Nodes (11): createSchema, deleteSchema, keys(), moveSchema, name, paramsSchema, parse(), revision (+3 more)

### Community 176 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 177 - "projection-test-helpers.ts"
Cohesion: 0.17
Nodes (11): sessionLog(), BackgroundTaskEventOptions, MAX_BACKGROUND_TASKS, MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH, lifecycleEvent(), subagentShell(), syntheticLog() (+3 more)

### Community 178 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 179 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 180 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 181 - "recordValue"
Cohesion: 0.23
Nodes (14): backgroundHandoff(), booleanValue(), notificationKind(), parsedValue(), rawTailText(), recordValue(), shellExitFromValue(), shellIdFromFooter() (+6 more)

### Community 182 - "manager-runtime.ts"
Cohesion: 0.25
Nodes (10): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+2 more)

### Community 183 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 184 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 185 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 186 - "dreamer-routes.ts"
Cohesion: 0.18
Nodes (11): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+3 more)

### Community 187 - ".observe"
Cohesion: 0.21
Nodes (7): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId()

### Community 188 - "closed-sessions.ts"
Cohesion: 0.24
Nodes (12): blockParents, closedCapitals(), closedSessionContext(), excerpt(), head(), htmlElements, htmlText(), markdown (+4 more)

### Community 189 - "use-session-categories.ts"
Cohesion: 0.24
Nodes (10): SessionCategoryChange, saveSessionCategoryChange(), sessionRefs(), message(), nothing, SessionCategoriesState, commit(), lab (+2 more)

### Community 190 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 191 - "pending-echo.ts"
Cohesion: 0.28
Nodes (9): nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes(), sameText() (+1 more)

### Community 193 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 194 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 195 - "manager-automatic.ts"
Cohesion: 0.25
Nodes (8): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, failed, finished

### Community 196 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 198 - "command-catalog-cache.test.ts"
Cohesion: 0.25
Nodes (9): at(), Catalog, deferred(), fixture(), fixtures, listed(), releases, runtime() (+1 more)

### Community 199 - "isRecord"
Cohesion: 0.29
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 201 - "session-knowledge-store.test.ts"
Cohesion: 0.20
Nodes (7): SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, disk, fixture(), fixtures, releases, root()

### Community 202 - "static-files.ts"
Cohesion: 0.27
Nodes (6): RFC-9110, AcceptedEncodings, FILE_HEADERS, isApiPath(), isAppleTouchIconProbe(), registerStaticFiles()

### Community 203 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 204 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 205 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 206 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 207 - "ManagerProactiveInboxValidationError"
Cohesion: 0.28
Nodes (6): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions()

### Community 208 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 209 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 210 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 211 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 212 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 213 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 215 - "session-list-collisions.test.ts"
Cohesion: 0.32
Nodes (4): kind(), sessionListCollisions(), Args, layout

### Community 216 - "normalizeBackgroundTask"
Cohesion: 0.38
Nodes (7): attachmentModeValue(), executionModeValue(), normalizeBackgroundTask(), numberValue(), progressValue(), shellTaskMode(), statusValue()

### Community 217 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 219 - "session-order-routes.test.ts"
Cohesion: 0.43
Nodes (6): directories, fakeManager(), hub(), settled(), until(), upserted()

### Community 220 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 221 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 222 - "refusal-metrics-routes.test.ts"
Cohesion: 0.33
Nodes (4): directories, runtimes, start(), trusted

### Community 223 - "skill-settings-jsonc.ts"
Cohesion: 0.60
Nodes (4): document(), parseSkillSettings(), replaceDisabledSkills(), Token

### Community 224 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1509 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1504 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2535 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `claude-agent-service.ts`, `agent-service.ts`, `ClaudeAgentService`, `session-store-providers.test.ts`, `hub-routes.ts`, `UserInputReplyInput`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `claude-agent-service.ts`, `BackgroundTaskSnapshot`, `computer-manager.ts`, `transcription-service.ts`, `ScheduleWorktreeService`, `contracts.ts`, `SkillSettingsService`, `multi-node.test.ts`, `SessionService`, `remote-voice-client.ts`, `hub-routes.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `claude-agent-service.ts`, `BackgroundTaskSnapshot`, `ClaudeAgentService`, `contracts.ts`, `multi-node.test.ts`, `RemoteNodeClient`, `ManagedSession`, `hub-routes.ts`, `session-reply-durability.test.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1509 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.029114227907136244 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.02709469730841456 - nodes in this community are weakly interconnected._
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
