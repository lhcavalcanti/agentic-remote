# Agentic Remote - Graphify code map

Snapshot: `39484e108bcd37a3ee69669946633266f45e5b2a92233704a23984bcab226511`

Source checkout: `9d8d31cce3355e3b173926d3a7d7f34a07acaf05`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 643 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 643 files · ~1,153,936 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9050 nodes · 26121 edges · 277 communities (228 shown, 31 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1327 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionStore
- AppWorkspace
- api.ts
- agent-service.ts
- SessionDetail
- App.tsx
- contracts.ts
- terminal-session.ts
- workspace-fixtures.ts
- ManagerStore
- session-presentation.ts
- claude-agent-service.ts
- client.ts
- dreamer-store.ts
- sections.tsx
- OracleVoiceCoordinator
- ManagedSession
- manager-tools.ts
- ManagerAgent
- agentic-remote-promotion-monitor
- oracle-voice-child.ts
- session-store-providers.test.ts
- RemoteNodeClient
- oracle-voice-soak.ts
- VoiceCapture
- send-matrix.integration.test.ts
- oracle-voice-session.ts
- oracle-task-store.ts
- active-sessions.ts
- CopilotClientLike
- transcription-service.ts
- ManagerMessage
- oracle-voice-worker.ts
- oracle-voice-integration.test.ts
- manager-agent.ts
- node-routes.ts
- schedules.ts
- manager-structured-memory-validation.ts
- TmuxTerminalSessionController
- hub-routes.ts
- schedule-launcher.test.ts
- SchedulerStore
- SessionService
- oracle-voice.ts
- ProviderSessionService
- session-knowledge-routes.test.ts
- session-knowledge-store.ts
- fake-voice.ts
- ScheduleRun
- oracle-voice-benchmark.ts
- DreamerService
- FakeVoiceEngine
- OracleDreamer.tsx
- agentic-remote
- tmux-test-helpers.ts
- processes.ts
- terminal-session.test.ts
- server/skill-settings.ts
- ui-scenes.ts
- TerminalSessionController
- app.ts
- session-directory.ts
- agentic-remote-gate
- dreamer-progress.ts
- bundle
- session-resource-providers.test.ts
- ManagerAssistant.tsx
- shell.ts
- VoicePlayback
- ScheduleForm.tsx
- schedule-recurrence.ts
- lib.rs
- EnabledOracleVoiceConfig
- FakeSessionService
- pwa.ts
- dependencies
- client.test.ts
- agentic-remote-promotion-setup
- KnowledgeStore
- oracle-voice-routes.ts
- PushNotificationService
- SessionOrderStore
- devDependencies
- config.rs
- react
- manager-proactive-coordinator.ts
- preview-features.ts
- manager-agent.test.ts
- manager-proactive-inbox.ts
- shared/settings-profile.ts
- knowledge-tree.ts
- schedule-proposals.ts
- dreamer-service.ts
- manager-structured-memory.ts
- response-compression.test.ts
- isKnownTerminalFooterRow
- node:fs/promises
- manager-context.ts
- oracle-voice-security.test.ts
- markdown-navigation.ts
- pipeline.test.tsx
- reader.ts
- dreamer-planner.ts
- notification-center-service.ts
- registerSessionKnowledgeRoutes
- oracle-voice-child.test.ts
- remote-voice-client.ts
- use-markdown-document.test.tsx
- capture-workspace.ts
- transport.test.ts
- ManagerAttachment
- real-voice.ts
- ChatMessage
- sampler.ts
- startup-phases.test.ts
- cli-canary.ts
- src/settings-profile.ts
- scripts
- session-patch-browser.ts
- oracle-voice-config.ts
- agent-service.test.ts
- feature-flags.ts
- manager-structured-memory-search.ts
- SettingsProfileClient
- pipeline.ts
- PreviewFeaturesSettings.test.tsx
- HostMonitorView.test.tsx
- notification-classifier.ts
- push-notification-service.ts
- session-provenance.test.ts
- compilerOptions
- ManagerStructuredMemoryStore
- oracle-voice-coordinator.test.ts
- oracle-voice-segments.ts
- ManagerAssistant.test.tsx
- ManagerStructuredMemoryRuntime
- HubEvent
- service.ts
- normalizeKnowledgeRelativePath
- .toolHost
- ManagerProactiveInbox
- VoiceAudioFrame
- oracle-voice-tickets.ts
- host-telemetry.ts
- NotificationRecord
- compilerOptions
- full-gate.test.ts
- .observe
- session-reply-durability.test.ts
- PromptCards.tsx
- compilerOptions
- background-task-adapter.ts
- HostTelemetrySampler
- refusal-metrics.ts
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- DialogFrame.tsx
- oracle-status.test.ts
- NotificationStore
- promotion-monitor.test.ts
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- session-latency-benchmark.ts
- createBackgroundTaskProjector
- alerts.test.ts
- schedule-notification-service.test.ts
- SoakManager
- BackgroundTaskSnapshot
- closed-session-sweeper.ts
- dreamer-schedule.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- package.json
- VoiceEngineEvent
- background-task-stop.test.ts
- NotificationCenterService
- oracle-voice-assets.test.ts
- oracle-voice-routes.test.ts
- RuntimeStatus.tsx
- fake-vad.ts
- desktop.json
- boundedText
- session-clear-transcript.test.ts
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- Pcm16Resampler
- recently-closed.pw.ts
- manager-proactive-inbox.test.ts
- SettingsProfileSnapshot
- session-response-order.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- document-render.pw.ts
- sign-in-expired.pw.ts
- DeferredSession
- settings-profile-routes.ts
- .initialize
- SessionAdmissions
- use-oracle-attachments.ts
- dataset
- generate-pwa-icons.ts
- manager-structured-memory-performance.test.ts
- notification-center.integration.test.ts
- bridge.rs
- vite.config.ts
- backgroundHandoff
- dreamer-routes.ts
- logs-cli.test.ts
- ManagerProactiveInboxValidationError
- promotion-setup-execution.test.ts
- sent-message.ts
- doctor-cli.test.ts
- SpeakableSegmenter
- release-publication.test.ts
- closed-sessions.ts
- recordValue
- file-upload-routes.ts
- HostTelemetryClock
- settings.ts
- DocumentViewControls.tsx
- KnowledgePosition
- composer-layout.test.ts
- recovery-context.ts
- settings-profile-routes.test.ts
- hasActiveBackgroundTasks
- usePanelWidth
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- appearance.ts
- FakeRecorder
- FakeRecorder
- MockMediaRecorder
- BackgroundTaskProjector
- version-policy.test.ts
- MockWebSocket
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
2. `SessionDetail` - 345 edges
3. `AgentService` - 322 edges
4. `SessionStore` - 216 edges
5. `ManagedSession` - 184 edges
6. `buildApp()` - 141 edges
7. `ClaudeAgentService` - 136 edges
8. `registerHubRoutes()` - 107 edges
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
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (277 total, 31 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (30): agentMode(), AgentService, foregroundTurnOpen(), isTerminalNotReadyRefusal(), isUncertainDelivery(), lifecycleRefusal(), restart(), removeCopilotSessionFiles() (+22 more)

### Community 1 - "SessionStore"
Cohesion: 0.02
Nodes (113): storage(), fixture(), directories, fakeClient(), fixture(), ForkRequest, forkSession(), services (+105 more)

### Community 2 - "AppWorkspace"
Cohesion: 0.03
Nodes (176): terminalSendOptions(), sessionFileValidationError(), AppWorkspace(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession() (+168 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (156): SessionKnowledgeBinding, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionReceipt, submissionReceiptFromError(), addComputer(), addKnowledgeRoot() (+148 more)

### Community 4 - "agent-service.ts"
Cohesion: 0.03
Nodes (128): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+120 more)

### Community 5 - "SessionDetail"
Cohesion: 0.04
Nodes (15): runtimeInfoMatches(), ClaudeAgentService, isMissingClaudeSessionError(), toolResultText(), observe(), answer(), claudeRequest(), copilotRequest() (+7 more)

### Community 6 - "App.tsx"
Cohesion: 0.03
Nodes (108): isManagerEvent(), executeCommand(), listClosedSessions(), activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+100 more)

### Community 7 - "contracts.ts"
Cohesion: 0.03
Nodes (76): RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, directories, voiceControlQueues, voiceControlWaiters, ProviderSessionServiceEvents (+68 more)

### Community 8 - "terminal-session.ts"
Cohesion: 0.05
Nodes (92): terminalComposerUnreadable(), activeBottomFrame(), backgroundShellsAllow(), busyRowStatus(), captureBeforeDeadline(), captureForReplacement(), capturePane(), cleanDialogLine() (+84 more)

### Community 9 - "workspace-fixtures.ts"
Cohesion: 0.03
Nodes (62): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+54 more)

### Community 10 - "ManagerStore"
Cohesion: 0.04
Nodes (43): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, DreamerProgressEntry (+35 more)

### Community 11 - "session-presentation.ts"
Cohesion: 0.04
Nodes (80): CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), handleDragEnd(), SessionResourcesDialog(), KnowledgeRootSelector(), root, CloseSessionDialog(), RecentlyClosedCard() (+72 more)

### Community 12 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (69): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+61 more)

### Community 13 - "client.ts"
Cohesion: 0.06
Nodes (36): ManagerClientDefaults, VoiceCapabilities, VoiceServerControl, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason() (+28 more)

### Community 14 - "dreamer-store.ts"
Cohesion: 0.05
Nodes (55): DreamerHistoryEntry, validateDreamerTimeZone(), assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS (+47 more)

### Community 15 - "sections.tsx"
Cohesion: 0.05
Nodes (71): AppearanceSetting, NewSessionBackendSetting, activateSession(), getHubHealth(), listComputerSkills(), listDirectories(), toggleComputerSkill(), AddKnowledgeRootDialog() (+63 more)

### Community 16 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (22): ManagerEventSource, ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect() (+14 more)

### Community 17 - "ManagedSession"
Cohesion: 0.09
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), ManagerProactiveCoordinatorOptions, FakeManager (+5 more)

### Community 18 - "manager-tools.ts"
Cohesion: 0.05
Nodes (44): APPROVE_WORDS, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), changeSuspension(), closeCapReached() (+36 more)

### Community 19 - "ManagerAgent"
Cohesion: 0.06
Nodes (19): DreamerProgressView, automaticPayload(), checkContent(), delay(), discover(), errorMessage(), isNotFound(), isPending() (+11 more)

### Community 20 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 21 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (35): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+27 more)

### Community 22 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (39): CopilotSessionLike, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), QueuedDelivery, QueuedDispatches, terminalRefused() (+31 more)

### Community 23 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (18): headerSafe(), RemoteNodeClient, requestBytes(), client(), servers, session, RemoteNodeCapabilityError, RemoteNodeRedirectError (+10 more)

### Community 24 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (38): ActiveBackendSession, childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, delay(), errorText(), GatedStartupRaceObservation (+30 more)

### Community 25 - "VoiceCapture"
Cohesion: 0.06
Nodes (24): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, harness() (+16 more)

### Community 26 - "send-matrix.integration.test.ts"
Cohesion: 0.04
Nodes (57): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+49 more)

### Community 27 - "oracle-voice-session.ts"
Cohesion: 0.07
Nodes (27): apps, directories, playbackSequence(), acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), createVoiceBackendSession() (+19 more)

### Community 28 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (45): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+37 more)

### Community 29 - "active-sessions.ts"
Cohesion: 0.06
Nodes (56): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+48 more)

### Community 30 - "CopilotClientLike"
Cohesion: 0.03
Nodes (44): CopilotClientLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), at() (+36 more)

### Community 31 - "transcription-service.ts"
Cohesion: 0.06
Nodes (34): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionMultipartOptions (+26 more)

### Community 32 - "ManagerMessage"
Cohesion: 0.05
Nodes (23): FakeManager, ProactiveManager, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent (+15 more)

### Community 33 - "oracle-voice-worker.ts"
Cohesion: 0.07
Nodes (31): benchmarkGroup(), VoiceWorkerOptions, VoiceEndUtterance, VoiceGenerationIdentity, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine (+23 more)

### Community 34 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+23 more)

### Community 35 - "manager-agent.ts"
Cohesion: 0.05
Nodes (40): apps, directories, ManagerAgentOptions, messagePriority(), Rung, TURN_ACTIVITY, TurnContextInput, hasExplicitStructuredMemoryIntent() (+32 more)

### Community 36 - "node-routes.ts"
Cohesion: 0.06
Nodes (43): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema (+35 more)

### Community 37 - "schedules.ts"
Cohesion: 0.06
Nodes (46): ScheduleAttentionSession, NoopScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS, SchedulerDispatcherOptions, ScheduleStopAcknowledgement, ScheduleTargetUnavailableError (+38 more)

### Community 38 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 39 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (16): composer(), processAdapter, afterExit(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions() (+8 more)

### Community 40 - "hub-routes.ts"
Cohesion: 0.04
Nodes (45): ClientPresence, PRESENCE_TTL_MS, addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+37 more)

### Community 41 - "schedule-launcher.test.ts"
Cohesion: 0.05
Nodes (33): updateComputerForLaunchIdentity(), LaunchPrimitives, ScheduleLauncherHost, ScheduleProvenance, scheduleSessionTitle(), directories, dispatchers, folderTrustPermission (+25 more)

### Community 42 - "SchedulerStore"
Cohesion: 0.11
Nodes (10): enableSchedulerTools(), fixture(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, retainedHistory(), ScheduleProposal (+2 more)

### Community 43 - "SessionService"
Cohesion: 0.07
Nodes (5): nodeVoiceCapabilities(), registerNodeRoutes(), SessionService, WorkspaceListing, KnowledgeFolderState

### Community 44 - "oracle-voice.ts"
Cohesion: 0.07
Nodes (42): VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, capabilities, closeServers, exactArrayBuffer(), sockets (+34 more)

### Community 46 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (30): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+22 more)

### Community 47 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (29): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+21 more)

### Community 48 - "fake-voice.ts"
Cohesion: 0.07
Nodes (10): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance (+2 more)

### Community 49 - "ScheduleRun"
Cohesion: 0.13
Nodes (11): provenance(), SessionScheduleLauncher, session(), ScheduleLauncher, ScheduleLaunchRefusedError, SchedulerDispatcher, ScheduleReconciliation, registerSchedulerRoutes() (+3 more)

### Community 50 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 51 - "DreamerService"
Cohesion: 0.12
Nodes (9): boundedText(), digest(), DreamerService, DreamerUnavailableError, uniqueSessionRefs(), DreamerCompletionCandidate, DreamerSnapshot, OracleTaskAttempt (+1 more)

### Community 52 - "FakeVoiceEngine"
Cohesion: 0.06
Nodes (18): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceSttEngine, VoiceTtsEngine, VoiceUtteranceAudioFrame (+10 more)

### Community 53 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (41): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition (+33 more)

### Community 54 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 55 - "tmux-test-helpers.ts"
Cohesion: 0.09
Nodes (39): [root], assertSameIdentity(), createIsolatedTmuxRoot(), execFileAsync, abandoned, abandonFixture(), creatorCommand(), execute (+31 more)

### Community 56 - "processes.ts"
Cohesion: 0.08
Nodes (27): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture, processStatFixture() (+19 more)

### Community 57 - "terminal-session.test.ts"
Cohesion: 0.07
Nodes (37): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, Screens, startCopilot() (+29 more)

### Community 58 - "server/skill-settings.ts"
Cohesion: 0.09
Nodes (29): instrument(), builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills() (+21 more)

### Community 59 - "ui-scenes.ts"
Cohesion: 0.08
Nodes (30): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), oracleHostStatusFixture(), fixtureNotifications, fixtureScheduleProposals (+22 more)

### Community 60 - "TerminalSessionController"
Cohesion: 0.08
Nodes (5): persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, TerminalSessionController, UserInputReplyInput

### Community 61 - "app.ts"
Cohesion: 0.07
Nodes (33): buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe(), transcriptionComputerName(), directories, runtimes, trusted (+25 more)

### Community 62 - "session-directory.ts"
Cohesion: 0.11
Nodes (36): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+28 more)

### Community 63 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 64 - "dreamer-progress.ts"
Cohesion: 0.09
Nodes (19): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot, DreamerProgressSource (+11 more)

### Community 65 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 66 - "session-resource-providers.test.ts"
Cohesion: 0.06
Nodes (36): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), deferred() (+28 more)

### Community 67 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (36): editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), canTakeFocus() (+28 more)

### Community 68 - "shell.ts"
Cohesion: 0.09
Nodes (35): ScheduleShellNotifier, attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label() (+27 more)

### Community 69 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 70 - "ScheduleForm.tsx"
Cohesion: 0.10
Nodes (32): scheduleProposalSummary(), CLAUDE_SCHEDULE_UNAVAILABLE_REASON, scheduleProviderUnavailableReason(), ScheduleTarget, getProviderRuntimeOptions(), FolderPicker(), browse(), editableSchedule() (+24 more)

### Community 71 - "schedule-recurrence.ts"
Cohesion: 0.10
Nodes (37): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+29 more)

### Community 72 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 73 - "EnabledOracleVoiceConfig"
Cohesion: 0.06
Nodes (11): ControlledSoakEngine, voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngineFactory, config, VoiceEngineSession, GatedVoiceEngineFactory, CreateVoiceBackendSessionOptions (+3 more)

### Community 74 - "FakeSessionService"
Cohesion: 0.07
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 75 - "pwa.ts"
Cohesion: 0.10
Nodes (36): parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), currentAppViewportGeometry(), activatePwaUpdate() (+28 more)

### Community 76 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 77 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 78 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 79 - "KnowledgeStore"
Cohesion: 0.11
Nodes (15): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+7 more)

### Community 80 - "oracle-voice-routes.ts"
Cohesion: 0.11
Nodes (33): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+25 more)

### Community 81 - "PushNotificationService"
Cohesion: 0.13
Nodes (9): start(), PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema (+1 more)

### Community 82 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 83 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 84 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 85 - "react"
Cohesion: 0.10
Nodes (16): react, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions(), ContextRing(), QueuedPromptList(), SendControl() (+8 more)

### Community 86 - "manager-proactive-coordinator.ts"
Cohesion: 0.12
Nodes (10): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, SessionLifecycle, directories, FakeAgent (+2 more)

### Community 87 - "preview-features.ts"
Cohesion: 0.12
Nodes (20): SessionProvenance, ClientFeature, railEntries(), readScheduleLink(), ScheduleLink, scheduleNotificationLabel(), PreviewFeaturesContext, usePreviewFeature() (+12 more)

### Community 88 - "manager-agent.test.ts"
Cohesion: 0.09
Nodes (17): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+9 more)

### Community 89 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (35): assertExactKeys(), canonicalHash(), DISPOSITIONS, eventId(), hasExactKeys(), isDisposition(), isEventKind(), isId() (+27 more)

### Community 90 - "shared/settings-profile.ts"
Cohesion: 0.11
Nodes (32): AccentSetting, appearanceSettings, applySettingsImport(), DEFAULT_SESSION_PROVIDER, isRecord(), isSettingsDeviceId(), isSettingsProfileKey(), isSettingsRevision() (+24 more)

### Community 91 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+24 more)

### Community 92 - "schedule-proposals.ts"
Cohesion: 0.11
Nodes (30): action, create, existing, metadata, scheduleProposalInputSchema, ScheduleProposalsChanged, scheduleProposalSchema, update (+22 more)

### Community 93 - "dreamer-service.ts"
Cohesion: 0.09
Nodes (20): DREAMER_MAX_ITEMS, DreamerMemoryMetadata, DreamerMemoryMetadataRecord, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), DreamerProgressLimits, dreamerScheduleDecision (+12 more)

### Community 94 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 95 - "response-compression.test.ts"
Cohesion: 0.08
Nodes (18): acceptsGzip(), eligible(), fastify, FastifyContextConfig, gzipAsync, header(), registerResponseCompression(), apps (+10 more)

### Community 96 - "isKnownTerminalFooterRow"
Cohesion: 0.08
Nodes (32): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), CopilotBusyRow, cursorComposerFrame(), DownloadedUpdateCell (+24 more)

### Community 97 - "node:fs/promises"
Cohesion: 0.07
Nodes (23): root, script, question(), execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand() (+15 more)

### Community 98 - "manager-context.ts"
Cohesion: 0.13
Nodes (26): ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine(), followUpLine() (+18 more)

### Community 99 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (19): VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), connect(), Inbox, issueTicket() (+11 more)

### Community 100 - "markdown-navigation.ts"
Cohesion: 0.11
Nodes (26): MarkdownImage(), html(), today(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText() (+18 more)

### Community 101 - "pipeline.test.tsx"
Cohesion: 0.12
Nodes (24): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+16 more)

### Community 102 - "reader.ts"
Cohesion: 0.12
Nodes (24): prefixes, session, trusted, untrusted, detectWsl(), parseDataMount(), createLinuxHostTelemetryReader(), errorCode() (+16 more)

### Community 103 - "dreamer-planner.ts"
Cohesion: 0.13
Nodes (29): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+21 more)

### Community 104 - "notification-center-service.ts"
Cohesion: 0.09
Nodes (26): NotificationCursors, booleanQuery, filters, params, cursorSchema, durableState(), emptyState(), identity (+18 more)

### Community 105 - "registerSessionKnowledgeRoutes"
Cohesion: 0.11
Nodes (22): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+14 more)

### Community 106 - "oracle-voice-child.test.ts"
Cohesion: 0.09
Nodes (11): childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize(), InProcessVoiceChild (+3 more)

### Community 107 - "remote-voice-client.ts"
Cohesion: 0.17
Nodes (13): VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+5 more)

### Community 108 - "use-markdown-document.test.tsx"
Cohesion: 0.10
Nodes (14): drawnInParts(), DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), defaultDocumentRenderer(), DocumentRenderer, DocumentRendererContext, RendererWorker (+6 more)

### Community 109 - "capture-workspace.ts"
Cohesion: 0.13
Nodes (24): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+16 more)

### Community 110 - "transport.test.ts"
Cohesion: 0.10
Nodes (17): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, HOST_TELEMETRY_MAX_QUEUE_BYTES (+9 more)

### Community 111 - "ManagerAttachment"
Cohesion: 0.15
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 112 - "real-voice.ts"
Cohesion: 0.12
Nodes (11): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+3 more)

### Community 113 - "ChatMessage"
Cohesion: 0.12
Nodes (13): Connection, TranscriptBuilder, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset, StoredSession (+5 more)

### Community 114 - "sampler.ts"
Cohesion: 0.11
Nodes (26): counter(), counterDelta(), CpuCounters, cpuUtilization(), DeviceByteCounters, DeviceCounters, deviceRates(), isWholeDisk() (+18 more)

### Community 115 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (17): phases, port, app(), directories, headers, launcher, createStartupPhases(), silentStartupPhases (+9 more)

### Community 116 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 117 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (21): NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, SettingsUpdateResult, statuslineItems (+13 more)

### Community 118 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 119 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (24): advance(), connections, content(), FrameMeasurement, lastHeading(), message(), open(), percentile() (+16 more)

### Community 120 - "oracle-voice-config.ts"
Cohesion: 0.14
Nodes (22): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+14 more)

### Community 121 - "agent-service.test.ts"
Cohesion: 0.14
Nodes (15): terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+7 more)

### Community 122 - "feature-flags.ts"
Cohesion: 0.17
Nodes (19): hub(), AppVersion, defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable() (+11 more)

### Community 123 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 124 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 125 - "pipeline.ts"
Cohesion: 0.13
Nodes (23): openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), render, scope, documentOpening(), documentParts() (+15 more)

### Community 126 - "PreviewFeaturesSettings.test.tsx"
Cohesion: 0.12
Nodes (12): WorkspaceFixtureState, SettingsProfileState, applySettingsChanges(), SettingsProfileRecord, clients, EffectiveState(), hub(), SchedulerDraft() (+4 more)

### Community 127 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 128 - "notification-classifier.ts"
Cohesion: 0.18
Nodes (19): attentionClosed(), attentionSeed(), classifyHostNotification(), classifyHubNotification(), classifyOracleNotification(), classifyScheduleNotification(), HOST_ALERT_MEMORY_DURATION_MS, notificationIdentity() (+11 more)

### Community 129 - "push-notification-service.ts"
Cohesion: 0.13
Nodes (18): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+10 more)

### Community 130 - "session-provenance.test.ts"
Cohesion: 0.13
Nodes (14): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, isSession(), SessionIdentity (+6 more)

### Community 131 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 132 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 133 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 134 - "oracle-voice-segments.ts"
Cohesion: 0.14
Nodes (22): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+14 more)

### Community 135 - "ManagerAssistant.test.tsx"
Cohesion: 0.09
Nodes (15): cancelManager(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+7 more)

### Community 136 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.14
Nodes (14): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+6 more)

### Community 137 - "HubEvent"
Cohesion: 0.12
Nodes (9): ComputerManagerEvents, NotificationRecorder, HubEventSource, FinishedSession, SessionUnreadTracker, finished(), HubEvent, SessionTurnState (+1 more)

### Community 138 - "service.ts"
Cohesion: 0.16
Nodes (9): HostRequest, registerHostTelemetryRoutes(), HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError(), HostTelemetryTarget, HostTelemetrySocket, HOST_TELEMETRY_INVALID_CODE (+1 more)

### Community 139 - "normalizeKnowledgeRelativePath"
Cohesion: 0.18
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+10 more)

### Community 141 - "ManagerProactiveInbox"
Cohesion: 0.20
Nodes (6): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 142 - "VoiceAudioFrame"
Cohesion: 0.10
Nodes (10): exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), QueuedAudio, BrowserCaptureOptions, SocketMessage, AudioReservation (+2 more)

### Community 143 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 144 - "host-telemetry.ts"
Cohesion: 0.13
Nodes (19): aggregate, DiskSpaceSchema, HOST_TELEMETRY_CAPABILITY_VERSION, HOST_TELEMETRY_INVALID_CLOSE_CODE, HostHistorySchema, HostInfoSchema, HostMetricAggregate, HostMetricAggregateSchema (+11 more)

### Community 145 - "NotificationRecord"
Cohesion: 0.19
Nodes (15): NotificationRecord, FeatureEvent, listeners, publishFeatureEvent(), subscribeFeatureEvents(), NotificationGroup, notificationGroups(), NotificationTab (+7 more)

### Community 146 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 147 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 148 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 149 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 150 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 151 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 152 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (17): CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, CopilotTasksApi, isBackgroundTaskInfo(), isBackgroundTaskProgress(), MAX_BACKGROUND_TASKS (+9 more)

### Community 153 - "HostTelemetrySampler"
Cohesion: 0.19
Nodes (3): HostTelemetrySampler, HostMinuteAggregate, HostSample

### Community 154 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (14): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+6 more)

### Community 155 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 156 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 157 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 158 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 159 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 160 - "DialogFrame.tsx"
Cohesion: 0.18
Nodes (14): changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame(), filterSentMessages() (+6 more)

### Community 161 - "oracle-status.test.ts"
Cohesion: 0.19
Nodes (14): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+6 more)

### Community 162 - "NotificationStore"
Cohesion: 0.25
Nodes (4): matchesNotification(), NotificationStore, setup(), NotificationFilter

### Community 163 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 164 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 165 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 166 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 167 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 168 - "session-latency-benchmark.ts"
Cohesion: 0.21
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 169 - "createBackgroundTaskProjector"
Cohesion: 0.18
Nodes (17): copyTask(), createBackgroundTaskProjector(), endsForegroundTurn(), eventString(), isLiveTaskStatus(), isOlderExecution(), isShellObserverTool(), isShellStopTool() (+9 more)

### Community 170 - "alerts.test.ts"
Cohesion: 0.15
Nodes (8): HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, computer, observe(), snapshot(), start, sustained(), HOST_ALERT_COOLDOWN_MS

### Community 171 - "schedule-notification-service.test.ts"
Cohesion: 0.19
Nodes (4): ScheduleNotificationService, input(), now, run()

### Community 173 - "BackgroundTaskSnapshot"
Cohesion: 0.22
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 174 - "closed-session-sweeper.ts"
Cohesion: 0.17
Nodes (5): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS

### Community 175 - "dreamer-schedule.ts"
Cohesion: 0.24
Nodes (14): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), DreamerScheduleReason, exactCandidates() (+6 more)

### Community 176 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 177 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 178 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 179 - "VoiceEngineEvent"
Cohesion: 0.18
Nodes (7): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, VoiceEngineEvent

### Community 180 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot(), started() (+4 more)

### Community 182 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 183 - "oracle-voice-routes.test.ts"
Cohesion: 0.15
Nodes (8): openApps, openSockets, RouteManager, runtime(), testRoot(), testRoots, trusted, voiceConfig

### Community 184 - "RuntimeStatus.tsx"
Cohesion: 0.27
Nodes (8): families, modelFamily, repositoryModels, RuntimeStatus(), session, glyphs, ModelFamilyIcon(), RuntimeModelName()

### Community 185 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 186 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 187 - "boundedText"
Cohesion: 0.24
Nodes (14): addActivity(), boundedText(), eventTask(), executionModeValue(), normalizeBackgroundTask(), numberValue(), progressValue(), shellExitFromValue() (+6 more)

### Community 188 - "session-clear-transcript.test.ts"
Cohesion: 0.15
Nodes (8): Admission, ExclusiveAdmission, PendingQueueAdmission, disk, fixtures, gate(), holdTurnWrite(), releases

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

### Community 193 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 194 - "recently-closed.pw.ts"
Cohesion: 0.23
Nodes (9): bounds(), closedEarlier, closeFromRow(), devices, drawer(), expectUsable(), open(), row() (+1 more)

### Community 195 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 196 - "SettingsProfileSnapshot"
Cohesion: 0.27
Nodes (4): SettingsProfileStore, directories, store(), SettingsProfileSnapshot

### Community 197 - "session-response-order.ts"
Cohesion: 0.29
Nodes (10): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+2 more)

### Community 198 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 199 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 201 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 203 - "settings-profile-routes.ts"
Cohesion: 0.25
Nodes (8): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 204 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 206 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 207 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 208 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 209 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.27
Nodes (7): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult, submitSearch()

### Community 210 - "notification-center.integration.test.ts"
Cohesion: 0.22
Nodes (7): center(), directories, directory(), hub(), now, runtimes, trusted

### Community 211 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 212 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 213 - "backgroundHandoff"
Cohesion: 0.28
Nodes (9): attachmentModeValue(), backgroundHandoff(), booleanValue(), rawTailText(), shellIdFromFooter(), shellIdFromValue(), shellStopAcknowledged(), shellTaskMode() (+1 more)

### Community 214 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 215 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 216 - "ManagerProactiveInboxValidationError"
Cohesion: 0.28
Nodes (6): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions()

### Community 217 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 218 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 219 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 221 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 222 - "closed-sessions.ts"
Cohesion: 0.39
Nodes (5): closedSessionContext(), excerpt(), isClosedSessionContext(), said(), ClosedSessionContext

### Community 223 - "recordValue"
Cohesion: 0.43
Nodes (7): errorValue(), notificationKind(), parsedValue(), recordValue(), shellTaskOutput(), taskInfoListFromValue(), textFromValue()

### Community 224 - "file-upload-routes.ts"
Cohesion: 0.43
Nodes (5): SessionParams, extension(), MAX_SESSION_FILE_BYTES, supportedExtensions, supportsSessionFile()

### Community 226 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 227 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 228 - "KnowledgePosition"
Cohesion: 0.43
Nodes (3): KnowledgePosition, KnowledgeRestoreState, base

### Community 229 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 230 - "recovery-context.ts"
Cohesion: 0.47
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 231 - "settings-profile-routes.test.ts"
Cohesion: 0.40
Nodes (5): directories, fakeManager(), hub(), local, profileStore()

### Community 232 - "hasActiveBackgroundTasks"
Cohesion: 0.60
Nodes (3): hasActiveBackgroundTasks(), hasForegroundTurn(), hasRunningBackgroundAgent()

### Community 233 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

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
- **1443 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1438 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2418 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `agent-service.ts`, `SessionDetail`, `claude-agent-service.ts`, `TerminalSessionController`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `agent-service.ts`, `SessionDetail`, `contracts.ts`, `claude-agent-service.ts`, `session-store-providers.test.ts`, `background-task-adapter.ts`, `TerminalSessionController`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `AgentService`, `contracts.ts`, `claude-agent-service.ts`, `ProviderSessionService`, `ManagedSession`, `RemoteNodeClient`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1443 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.027642031927424003 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.02255384912585724 - nodes in this community are weakly interconnected._
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
- `e2e/ui-locks.pw.ts-snapshots/scheduler-abandon-desktop-chromium-linux.png`
- `e2e/ui-locks.pw.ts-snapshots/scheduler-abandon-phone-chromium-linux.png`
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
