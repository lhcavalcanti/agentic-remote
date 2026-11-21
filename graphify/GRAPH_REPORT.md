# Agentic Remote - Graphify code map

Snapshot: `44cfadfb93d47b265628ff0f8809eaad4109385b4d9a7198c2091ae04e80c6fb`

Source checkout: `edc3c9d1d59d2d253f4733833063f6fbc1cbf017`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 640 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 640 files · ~1,149,209 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 8998 nodes · 25988 edges · 253 communities (209 shown, 26 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1325 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionStore
- AppWorkspace
- agent-service.ts
- api.ts
- SessionDetail
- oracle-voice-session.ts
- App.tsx
- ManagerStore
- oracle-voice.ts
- terminal-session.ts
- manager-tools.ts
- contracts.ts
- multi-node.test.ts
- claude-agent-service.ts
- client.ts
- manager-proactive-inbox.ts
- workspace-fixtures.ts
- OracleVoiceCoordinator
- ManagedSession
- scheduler-store.ts
- manager-agent.ts
- manager.ts
- session-presentation.ts
- schedule-launcher.ts
- agentic-remote-promotion-monitor
- dreamer-store.ts
- host-telemetry.ts
- VoiceAudioFrame
- oracle-voice-soak.ts
- setupWorkspaceFixture
- sampler.ts
- CopilotSessionLike
- notification-center.ts
- app.ts
- AppSettingsDialog.tsx
- oracle-voice-integration.test.ts
- agent-service.test.ts
- RemoteNodeClient
- manager-structured-memory-validation.ts
- tmux-test-helpers.ts
- node-routes.ts
- PushNotificationService
- OracleDreamer.tsx
- ProviderSessionService
- background-task-adapter.ts
- SessionService
- TmuxTerminalSessionController
- oracle-task-store.ts
- SchedulerStore
- SettingsProfileSnapshot
- DreamerService
- src/settings-profile.ts
- fake-voice.ts
- react
- tmux-errors.integration.test.ts
- ScheduleForm.tsx
- agentic-remote
- FakeVoiceEngine
- dreamer-progress.ts
- server/skill-settings.ts
- terminal-session.test.ts
- ComposerActions.tsx
- oracle-voice-benchmark.ts
- session-directory.ts
- agentic-remote-gate
- recovery-resend-durability.test.ts
- ui-scenes.ts
- bundle
- ChildVoiceEngine
- processes.ts
- ManagerAssistant.tsx
- ResidentVoiceWorker
- composer-state.ts
- oracle-voice-child.ts
- VoicePlayback
- schedule-recurrence.ts
- active-sessions.ts
- session-resource-clear.test.ts
- terminal-startup-queue.test.ts
- manager-proactive-coordinator.ts
- lib.rs
- normalizeKnowledgeRelativePath
- dependencies
- client.test.ts
- agentic-remote-promotion-setup
- oracle-voice-config.ts
- manager-structured-memory.ts
- devDependencies
- config.rs
- KnowledgeStore
- hub-routes.ts
- transcription-service.ts
- .toolHost
- manager-structured-memory-search.ts
- knowledge-tree.ts
- manager-context.ts
- EngineVoiceBackendSession
- SessionKnowledgeStore
- shared/settings-profile.ts
- dreamer-planner.ts
- feature-flags.ts
- oracle-voice-security.test.ts
- dreamer-service.ts
- oracle-voice-segments.ts
- sections.tsx
- SessionOrderStore
- UserInputReplyInput
- ManagerAttachment
- pwa.ts
- use-markdown-document.test.tsx
- capture-workspace.ts
- ManagerAssistant.test.tsx
- agent-service-event-projection.test.ts
- send-matrix.integration.test.ts
- cli-canary.ts
- startup-phases.test.ts
- scripts
- SessionResources.tsx
- shell.ts
- session-patch-browser.ts
- dreamer-service.test.ts
- registerSessionKnowledgeRoutes
- oracle-voice-worker.ts
- use-markdown-document.ts
- HostMonitorView.test.tsx
- compilerOptions
- delegated-transcription-service.ts
- oracle-voice-coordinator.test.ts
- ScheduleProposalCards.tsx
- server/side-question.ts
- ManagerStructuredMemoryStore
- session-reply-durability.test.ts
- markdown-navigation.ts
- launch-identity.test.ts
- oracle-voice-tickets.ts
- session-knowledge-store.ts
- isTerminalComposerFooter
- compilerOptions
- full-gate.test.ts
- refusal-metrics.ts
- session-store-providers.test.ts
- session-patches.test.ts
- compilerOptions
- OnlineRecognizer
- pipeline.ts
- MessageTime.tsx
- compilerOptions
- compilerOptions
- oracle-status.test.ts
- ManagerMemory
- session-provenance.test.ts
- manager-runtime.ts
- dreamer-schedule.ts
- session-resource-routes.test.ts
- promotion-monitor.test.ts
- PromptCards.tsx
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- session-latency-benchmark.ts
- SessionStatus
- terminal-form-deadline.test.ts
- closed-session-sweeper.ts
- SessionAdmissions
- SessionOriginBadge.test.tsx
- package.json
- ChatMessage
- oracle-voice-assets.test.ts
- VoiceWorkerParentMessage
- pending-echo.ts
- fake-vad.ts
- desktop.json
- DeferredSession
- background-task-stop.test.ts
- theme-contrast.test.ts
- ShellNavigation.test.tsx
- shell-notifications.ts
- .oxlintrc.json
- settings-local.json
- .initialize
- session-scope.ts
- DialogFrame.tsx
- Pcm16Resampler
- BackgroundTask
- send-policy.test.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- ScheduleNotificationService
- tmux-errors.test.ts
- use-oracle-attachments.ts
- dataset
- generate-pwa-icons.ts
- bridge.rs
- pipeline.test.tsx
- vite.config.ts
- logs-cli.test.ts
- promotion-setup-execution.test.ts
- sent-message.ts
- session-response-order.ts
- doctor-cli.test.ts
- release-publication.test.ts
- closed-sessions.ts
- UserInputFieldControl
- oracle-conversation-real.test.ts
- session-order-routes.test.ts
- settings.ts
- composer-layout.test.ts
- HostTelemetryClock
- VoiceSttEngine
- usePanelWidth
- worker-handler.ts
- promotion-setup.test.ts
- SessionKnowledgeLifecycle
- FakeRecorder
- terminal-send-uncertainty.test.ts
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
1. `AppWorkspace()` - 352 edges
2. `SessionDetail` - 337 edges
3. `AgentService` - 312 edges
4. `SessionStore` - 213 edges
5. `ManagedSession` - 184 edges
6. `buildApp()` - 138 edges
7. `ClaudeAgentService` - 136 edges
8. `registerHubRoutes()` - 107 edges
9. `ComputerManager` - 106 edges
10. `ManagerAgent` - 101 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (253 total, 26 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (18): agentMode(), AgentService, isTerminalNotReadyRefusal(), lifecycleRefusal(), removeCopilotSessionFiles(), sessionInUseConflictMessage(), suspendedRuntimeConflict(), suspendRefused() (+10 more)

### Community 1 - "SessionStore"
Cohesion: 0.03
Nodes (96): storage(), terminalService(), fixture(), restart(), directories, fakeClient(), fixture(), ForkRequest (+88 more)

### Community 2 - "AppWorkspace"
Cohesion: 0.03
Nodes (158): terminalSendOptions(), activateSession(), AppWorkspace(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession() (+150 more)

### Community 3 - "agent-service.ts"
Cohesion: 0.03
Nodes (116): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+108 more)

### Community 4 - "api.ts"
Cohesion: 0.03
Nodes (138): SettingsChange, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionReceipt, submissionReceiptFromError(), addComputer(), addKnowledgeRoot() (+130 more)

### Community 5 - "SessionDetail"
Cohesion: 0.03
Nodes (23): ClaudeAgentService, isMissingClaudeSessionError(), observe(), copilotRequest(), claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred() (+15 more)

### Community 6 - "oracle-voice-session.ts"
Cohesion: 0.03
Nodes (62): ActiveBackendSession, BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample() (+54 more)

### Community 7 - "App.tsx"
Cohesion: 0.03
Nodes (106): isManagerEvent(), ScheduleShellNotifier, extension(), MAX_SESSION_FILE_BYTES, sessionFileValidationError(), supportedExtensions, supportsSessionFile(), SettingsProfileKey (+98 more)

### Community 8 - "ManagerStore"
Cohesion: 0.04
Nodes (48): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, ManagerSdkEvent (+40 more)

### Community 9 - "oracle-voice.ts"
Cohesion: 0.04
Nodes (83): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+75 more)

### Community 10 - "terminal-session.ts"
Cohesion: 0.05
Nodes (104): activeBottomFrame(), afterExit(), backgroundShellsAllow(), busyRowStatus(), captureBeforeDeadline(), captureForReplacement(), capturePane(), cleanDialogLine() (+96 more)

### Community 11 - "manager-tools.ts"
Cohesion: 0.03
Nodes (54): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), changeSuspension() (+46 more)

### Community 12 - "contracts.ts"
Cohesion: 0.03
Nodes (78): ServerRole, RemoteSessionListing, RemoteSessionRead, SessionMetadataLookup, LaunchCreations, StoredNodeIdentity, StoredNodeIdentityV1, DEFINITE_DISPATCH_REFUSALS (+70 more)

### Community 13 - "multi-node.test.ts"
Cohesion: 0.04
Nodes (29): ClaudeAgentServiceEvents, DirectoryScope, directories, FakeSessionService, routingFixture(), session(), temporaryDirectory(), voiceControlQueues (+21 more)

### Community 14 - "claude-agent-service.ts"
Cohesion: 0.05
Nodes (71): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+63 more)

### Community 15 - "client.ts"
Cohesion: 0.05
Nodes (35): ManagerClientDefaults, ORACLE_VOICE_CONNECTION_TIMEOUT_MS, captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord() (+27 more)

### Community 16 - "manager-proactive-inbox.ts"
Cohesion: 0.04
Nodes (60): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, emptyState(), eventId(), hasExactKeys(), isAlreadyExists() (+52 more)

### Community 17 - "workspace-fixtures.ts"
Cohesion: 0.03
Nodes (70): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+62 more)

### Community 18 - "OracleVoiceCoordinator"
Cohesion: 0.05
Nodes (27): ManagerEventSource, ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect() (+19 more)

### Community 19 - "ManagedSession"
Cohesion: 0.08
Nodes (17): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, updateComputerForLaunchIdentity(), TurnContextInput (+9 more)

### Community 20 - "scheduler-store.ts"
Cohesion: 0.05
Nodes (53): WorkspaceFixture, ComputerManagerEvents, computer, observe(), snapshot(), start, sustained(), center() (+45 more)

### Community 21 - "manager-agent.ts"
Cohesion: 0.06
Nodes (22): DreamerProgressView, automaticPayload(), checkContent(), delay(), discover(), errorMessage(), isNotFound(), isPending() (+14 more)

### Community 22 - "manager.ts"
Cohesion: 0.04
Nodes (35): FakeManager, FakeVoiceState, ProactiveManager, FakeAgent, confirmationSchema, defaultsSchema, editSchema, effort (+27 more)

### Community 23 - "session-presentation.ts"
Cohesion: 0.05
Nodes (69): hasActiveBackgroundTasks(), hasForegroundTurn(), hasRunningBackgroundAgent(), CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), BackgroundTaskSnapshot, KnowledgeRootSelector(), root (+61 more)

### Community 24 - "schedule-launcher.ts"
Cohesion: 0.07
Nodes (34): LaunchPrimitives, provenance(), recordScheduleProvenance(), ScheduleLauncherHost, ScheduleProvenance, scheduleSessionTitle(), SessionScheduleLauncher, session() (+26 more)

### Community 25 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 26 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (45): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+37 more)

### Community 27 - "host-telemetry.ts"
Cohesion: 0.05
Nodes (49): BuildAppOptions, ProcessScanContext, HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers (+41 more)

### Community 28 - "VoiceAudioFrame"
Cohesion: 0.05
Nodes (28): BrowserCaptureOptions, AudioReservation, VoiceAudioFrame, VoiceClientControl, BufferedFrame, captureFailure(), defaultAudioContext(), permissionError() (+20 more)

### Community 29 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 30 - "setupWorkspaceFixture"
Cohesion: 0.03
Nodes (38): desktop, devices, long, open(), phone, veryLong, bounds(), closedEarlier (+30 more)

### Community 31 - "sampler.ts"
Cohesion: 0.06
Nodes (52): prefixes, session, trusted, untrusted, counter(), counterDelta(), CpuCounters, cpuUtilization() (+44 more)

### Community 32 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (36): CopilotSessionLike, CopilotTasksApi, nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused() (+28 more)

### Community 33 - "notification-center.ts"
Cohesion: 0.06
Nodes (42): booleanQuery, filters, params, cursorSchema, durableState(), emptyState(), identity, kind (+34 more)

### Community 34 - "app.ts"
Cohesion: 0.05
Nodes (38): buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), directories, runtimes (+30 more)

### Community 35 - "AppSettingsDialog.tsx"
Cohesion: 0.07
Nodes (57): RuntimeModelOption, NewSessionBackendSetting, listDirectories(), AddKnowledgeRootDialog(), browse(), shortcutKeys(), readStoredShortcuts(), AppShortcutBinding (+49 more)

### Community 36 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+24 more)

### Community 37 - "agent-service.test.ts"
Cohesion: 0.04
Nodes (37): CopilotClientLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), terminalFormSteps() (+29 more)

### Community 38 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (14): RemoteResync, headerSafe(), RemoteNodeClient, requestBytes(), client(), servers, session, RemoteNodeTransportError (+6 more)

### Community 39 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 40 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (48): foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity(), SocketPlace, UnixSocket (+40 more)

### Community 41 - "node-routes.ts"
Cohesion: 0.07
Nodes (39): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+31 more)

### Community 42 - "PushNotificationService"
Cohesion: 0.07
Nodes (19): start(), brief(), HubEventSource, OracleEventSource, PushNotificationService, PushSender, PushState, directories (+11 more)

### Community 43 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (46): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+38 more)

### Community 45 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (54): addActivity(), attachmentModeValue(), backgroundHandoff(), booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, copyTask() (+46 more)

### Community 46 - "SessionService"
Cohesion: 0.07
Nodes (8): closeReason(), closeVoiceSocket(), nodeVoiceCapabilities(), registerNodeRoutes(), obstructUploads(), SessionService, WorkspaceListing, KnowledgeFolderState

### Community 47 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (14): startAgentAfterClear(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand() (+6 more)

### Community 48 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (33): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+25 more)

### Community 49 - "SchedulerStore"
Cohesion: 0.11
Nodes (9): fixture(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, retainedHistory(), ScheduleProposal, Schedule (+1 more)

### Community 50 - "SettingsProfileSnapshot"
Cohesion: 0.08
Nodes (29): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+21 more)

### Community 51 - "DreamerService"
Cohesion: 0.12
Nodes (9): DreamerMemoryMetadata, digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerSnapshot (+1 more)

### Community 52 - "src/settings-profile.ts"
Cohesion: 0.08
Nodes (25): NewSessionRuntime, sameSettingValue(), SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+17 more)

### Community 53 - "fake-voice.ts"
Cohesion: 0.08
Nodes (9): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, installFakeBrowserVoice(), ScriptedUtterance, startFixtureServer() (+1 more)

### Community 54 - "react"
Cohesion: 0.06
Nodes (33): react, getManager(), listClosedSessions(), listComputerSkills(), toggleComputerSkill(), updateManagerSettings(), foregroundHandoffTimeoutMs, Handoff (+25 more)

### Community 55 - "tmux-errors.integration.test.ts"
Cohesion: 0.06
Nodes (27): connections, fixture(), managers, releases, remote, session(), ComputerRegistry, DurableRegisteredComputer (+19 more)

### Community 56 - "ScheduleForm.tsx"
Cohesion: 0.08
Nodes (37): proposalInput, action, create, existing, metadata, ScheduleProposalInput, scheduleProposalInputSchema, ScheduleProposalsChanged (+29 more)

### Community 57 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 58 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (21): FakeVoiceEngine, sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine, playbackSequence(), Runtime (+13 more)

### Community 59 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (21): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+13 more)

### Community 60 - "server/skill-settings.ts"
Cohesion: 0.09
Nodes (29): instrument(), builtinSkillDirectories(), newestStableFirst(), frontmatterFields(), frontmatterReason(), document(), parseSkillSettings(), replaceDisabledSkills() (+21 more)

### Community 61 - "terminal-session.test.ts"
Cohesion: 0.07
Nodes (36): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, Screens, startCopilot() (+28 more)

### Community 62 - "ComposerActions.tsx"
Cohesion: 0.08
Nodes (20): families, modelFamily, repositoryModels, AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), ComposerActions(), ContextRing() (+12 more)

### Community 63 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (39): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, deferred() (+31 more)

### Community 64 - "session-directory.ts"
Cohesion: 0.11
Nodes (36): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+28 more)

### Community 65 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 66 - "recovery-resend-durability.test.ts"
Cohesion: 0.05
Nodes (31): root, script, directories, disk, gate(), gates, initialize(), PublicSessionValue (+23 more)

### Community 67 - "ui-scenes.ts"
Cohesion: 0.08
Nodes (27): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+19 more)

### Community 68 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 69 - "ChildVoiceEngine"
Cohesion: 0.11
Nodes (12): benchmarkGroup(), capabilityFromConfig(), ChildVoiceEngine, errorMessage(), isCancelledEvent(), matchesCancelled(), matchesSynthesis(), matchesUtterance() (+4 more)

### Community 70 - "processes.ts"
Cohesion: 0.09
Nodes (26): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+18 more)

### Community 71 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (36): editQueuedManagerMessage(), resetManager(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), canTakeFocus() (+28 more)

### Community 72 - "ResidentVoiceWorker"
Cohesion: 0.12
Nodes (9): combinedTranscript(), matchesCancelled(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceGenerationIdentity, VoiceSynthesisRequest, ActiveSynthesisIdentity (+1 more)

### Community 73 - "composer-state.ts"
Cohesion: 0.10
Nodes (38): composerChanged(), composerPasted(), persistComposerDrafts(), composerReadFailureMessage(), readComposerDrafts(), readLegacyComposerDrafts(), writeQueuedEditOwners(), activeComposerPastes() (+30 more)

### Community 74 - "oracle-voice-child.ts"
Cohesion: 0.07
Nodes (31): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, createVoiceWorker(), defaultSpawnPiper(), errorMessage() (+23 more)

### Community 75 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 76 - "schedule-recurrence.ts"
Cohesion: 0.10
Nodes (38): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+30 more)

### Community 77 - "active-sessions.ts"
Cohesion: 0.10
Nodes (31): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+23 more)

### Community 78 - "session-resource-clear.test.ts"
Cohesion: 0.07
Nodes (28): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), disk (+20 more)

### Community 79 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (31): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+23 more)

### Community 80 - "manager-proactive-coordinator.ts"
Cohesion: 0.11
Nodes (14): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, SessionLifecycle, directories (+6 more)

### Community 81 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 82 - "normalizeKnowledgeRelativePath"
Cohesion: 0.09
Nodes (30): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+22 more)

### Community 83 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 84 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 85 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 86 - "oracle-voice-config.ts"
Cohesion: 0.09
Nodes (27): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+19 more)

### Community 87 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (29): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+21 more)

### Community 88 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 89 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 90 - "KnowledgeStore"
Cohesion: 0.11
Nodes (15): WorkspaceFixtureState, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState (+7 more)

### Community 91 - "hub-routes.ts"
Cohesion: 0.06
Nodes (36): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+28 more)

### Community 92 - "transcription-service.ts"
Cohesion: 0.09
Nodes (22): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+14 more)

### Community 93 - ".toolHost"
Cohesion: 0.08
Nodes (5): ManagerHub, ManagerSdkClient, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 94 - "manager-structured-memory-search.ts"
Cohesion: 0.10
Nodes (28): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+20 more)

### Community 95 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+24 more)

### Community 96 - "manager-context.ts"
Cohesion: 0.13
Nodes (27): ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine(), followUpLine() (+19 more)

### Community 97 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 98 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 99 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (29): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+21 more)

### Community 100 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (30): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+22 more)

### Community 101 - "feature-flags.ts"
Cohesion: 0.15
Nodes (24): hub(), defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable(), parseFeatureFlag() (+16 more)

### Community 102 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (19): VoiceStartUtterance, apps, BlockingEngine, config, configFixture(), connect(), Inbox, issueTicket() (+11 more)

### Community 103 - "dreamer-service.ts"
Cohesion: 0.11
Nodes (29): DreamerPlanDraft, DreamerPlannerInput, boundedText(), DreamerFollowUp, DreamerPlannerExecutionInput, safeRunError(), unavailableSnapshot(), DreamerStoreSnapshot (+21 more)

### Community 104 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 105 - "sections.tsx"
Cohesion: 0.12
Nodes (19): PushPolicy, AppVersion, HubHealth, NotificationScope, AppearanceSetting, getHubHealth(), SettingScope(), HealthCard() (+11 more)

### Community 106 - "SessionOrderStore"
Cohesion: 0.16
Nodes (12): orderStore(), carried(), laneFrom(), retire(), sameLane(), sessionOrderKey(), SessionOrderState, SessionOrderStore (+4 more)

### Community 107 - "UserInputReplyInput"
Cohesion: 0.16
Nodes (6): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, UserInputReplyInput, deliveryUncertaintyFromError()

### Community 108 - "ManagerAttachment"
Cohesion: 0.14
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 109 - "pwa.ts"
Cohesion: 0.14
Nodes (26): getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), activatePwaUpdate(), activePushSubscription(), applicationServerKey(), checkForPwaUpdate(), clearPushNotifications() (+18 more)

### Community 110 - "use-markdown-document.test.tsx"
Cohesion: 0.10
Nodes (13): DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), defaultDocumentRenderer(), DocumentRenderer, DocumentRendererContext, RendererWorker, synchronousRenderer (+5 more)

### Community 111 - "capture-workspace.ts"
Cohesion: 0.13
Nodes (24): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+16 more)

### Community 112 - "ManagerAssistant.test.tsx"
Cohesion: 0.07
Nodes (16): cancelManager(), removeQueuedManagerMessage(), resolveManagerConfirmation(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+8 more)

### Community 113 - "agent-service-event-projection.test.ts"
Cohesion: 0.10
Nodes (22): at(), directories, finish(), launch(), projected(), services, sessionLog(), syncSessionTranscript() (+14 more)

### Community 114 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (24): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+16 more)

### Community 115 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 116 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (16): phases, port, app(), directories, headers, launcher, createStartupPhases(), startManagedServer() (+8 more)

### Community 117 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 118 - "SessionResources.tsx"
Cohesion: 0.12
Nodes (22): isMcpSummary(), isRecord(), isSkillSummary(), listSessionMcpServers(), listSessionSkills(), optionalBoolean(), optionalCount(), optionalText() (+14 more)

### Community 119 - "shell.ts"
Cohesion: 0.15
Nodes (24): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+16 more)

### Community 120 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (24): advance(), connections, content(), FrameMeasurement, lastHeading(), message(), open(), percentile() (+16 more)

### Community 121 - "dreamer-service.test.ts"
Cohesion: 0.08
Nodes (14): DreamerMemoryMetadataRecord, dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema (+6 more)

### Community 122 - "registerSessionKnowledgeRoutes"
Cohesion: 0.14
Nodes (21): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+13 more)

### Community 123 - "oracle-voice-worker.ts"
Cohesion: 0.11
Nodes (20): VoiceWorkerOptions, VoiceEndUtterance, VoiceTtsEngine, ChildVoiceEngineDependencies, defaultDependencies(), exactKeys(), isEnabledConfig(), isNonEmptyString() (+12 more)

### Community 124 - "use-markdown-document.ts"
Cohesion: 0.15
Nodes (20): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+12 more)

### Community 125 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 126 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 127 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (12): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload (+4 more)

### Community 128 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 129 - "ScheduleProposalCards.tsx"
Cohesion: 0.17
Nodes (20): getSchedule(), listScheduleProposals(), resolveScheduleProposal(), days, labels, proposalChanges(), proposalConsequence(), proposalSchedule (+12 more)

### Community 130 - "server/side-question.ts"
Cohesion: 0.16
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 131 - "ManagerStructuredMemoryStore"
Cohesion: 0.25
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 132 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+10 more)

### Community 133 - "markdown-navigation.ts"
Cohesion: 0.16
Nodes (21): followMarkdownLink(), MarkdownImage(), BreadcrumbSegment, breadcrumbSegments(), DocumentLink, headingSlug(), headingText(), inlineText() (+13 more)

### Community 134 - "launch-identity.test.ts"
Cohesion: 0.11
Nodes (10): RuntimeConfigurationError, awaitTermination(), apps, directories, directory(), runtime(), services, storedProvider() (+2 more)

### Community 135 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 136 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 137 - "isTerminalComposerFooter"
Cohesion: 0.13
Nodes (20): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+12 more)

### Community 138 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 139 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 140 - "refusal-metrics.ts"
Cohesion: 0.16
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+7 more)

### Community 141 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 142 - "session-patches.test.ts"
Cohesion: 0.18
Nodes (8): Connection, Client, PatchSocket, Browser, seedOffset, HubResyncRequest, HubWireEvent, SessionPatchReceiver

### Community 143 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 144 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 145 - "pipeline.ts"
Cohesion: 0.17
Nodes (19): openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), documentOpening(), documentParts(), documentRenderEvents(), documentUrlTransform() (+11 more)

### Community 146 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 147 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 148 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 149 - "oracle-status.test.ts"
Cohesion: 0.18
Nodes (15): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+7 more)

### Community 150 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 151 - "session-provenance.test.ts"
Cohesion: 0.18
Nodes (9): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, directories, session (+1 more)

### Community 152 - "manager-runtime.ts"
Cohesion: 0.19
Nodes (13): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkMissingSessionRetirement, CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic() (+5 more)

### Community 153 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 154 - "session-resource-routes.test.ts"
Cohesion: 0.14
Nodes (10): make(), node(), apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp() (+2 more)

### Community 155 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 156 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (13): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+5 more)

### Community 157 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 158 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 159 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 160 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 161 - "session-latency-benchmark.ts"
Cohesion: 0.21
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 162 - "SessionStatus"
Cohesion: 0.16
Nodes (12): DreamerProgressEntry, Seen, PersistedCursor, NotificationCursor, Row, SdkRestartRecovery, FinishedSession, SessionUnreadTracker (+4 more)

### Community 163 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 164 - "closed-session-sweeper.ts"
Cohesion: 0.17
Nodes (5): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS

### Community 165 - "SessionAdmissions"
Cohesion: 0.17
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 166 - "SessionOriginBadge.test.tsx"
Cohesion: 0.24
Nodes (10): SessionProvenance, readScheduleLink(), ScheduleLink, scheduleNotificationLabel(), sessionOriginDescription(), icons, labels, SessionOriginBadge() (+2 more)

### Community 167 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 168 - "ChatMessage"
Cohesion: 0.16
Nodes (11): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp(), StoredSession (+3 more)

### Community 169 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 170 - "VoiceWorkerParentMessage"
Cohesion: 0.19
Nodes (6): FakeChildProcess, initialize(), InProcessVoiceChild, parentHarness(), VoiceWorker, VoiceWorkerParentMessage

### Community 171 - "pending-echo.ts"
Cohesion: 0.24
Nodes (11): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, PendingEchoOwner, prunePendingEchoMap() (+3 more)

### Community 172 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 173 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 174 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 175 - "background-task-stop.test.ts"
Cohesion: 0.25
Nodes (11): completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started(), stopAcknowledgement() (+3 more)

### Community 176 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 177 - "ShellNavigation.test.tsx"
Cohesion: 0.32
Nodes (6): ClientFeature, railEntries(), initials(), useDisplayName(), DisplayNameSetting(), ShellNavigation()

### Community 178 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 179 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 180 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 181 - ".initialize"
Cohesion: 0.22
Nodes (5): initializeManagerStructuredMemory(), isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, open()

### Community 182 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 183 - "DialogFrame.tsx"
Cohesion: 0.28
Nodes (10): changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame(), hubSignInExpired() (+2 more)

### Community 184 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 185 - "BackgroundTask"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 186 - "send-policy.test.ts"
Cohesion: 0.20
Nodes (10): SessionExecutionMode, TerminalSendPolicyInput, TerminalSendRequestOptions, booleans, combinations, executionModes, providers, replacing (+2 more)

### Community 187 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 188 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 190 - "tmux-errors.test.ts"
Cohesion: 0.24
Nodes (9): containedServer(), directories, errno(), { execute }, files, links, listener(), places() (+1 more)

### Community 191 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 192 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 193 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 194 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 195 - "pipeline.test.tsx"
Cohesion: 0.27
Nodes (7): components, drawn(), drawnPage(), fixtures, html(), today(), rehypeDocumentHeadings()

### Community 196 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 197 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 198 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 199 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 200 - "session-response-order.ts"
Cohesion: 0.39
Nodes (7): carrySnapshotTranscripts(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt(), failure, session

### Community 201 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 202 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 203 - "closed-sessions.ts"
Cohesion: 0.39
Nodes (5): closedSessionContext(), excerpt(), isClosedSessionContext(), said(), ClosedSessionContext

### Community 204 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 206 - "session-order-routes.test.ts"
Cohesion: 0.43
Nodes (6): directories, fakeManager(), hub(), settled(), until(), upserted()

### Community 207 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 208 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 211 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 212 - "worker-handler.ts"
Cohesion: 0.47
Nodes (4): render, scope, handleRenderRequest(), RenderRequest

### Community 213 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1430 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1425 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2397 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SessionService` connect `SessionService` to `AgentService`, `RemoteNodeClient`, `UserInputReplyInput`, `ProviderSessionService`, `multi-node.test.ts`, `claude-agent-service.ts`, `session-resource-clear.test.ts`, `ManagedSession`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `agent-service.ts`, `SessionDetail`, `launch-identity.test.ts`, `UserInputReplyInput`, `ManagerAttachment`, `multi-node.test.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SchedulerStore` connect `SchedulerStore` to `schedule-launcher.ts`, `scheduler-store.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `AppWorkspace()` (e.g. with `drawerIsOverlay()` and `prefersLightNow()`) actually correct?**
  _`AppWorkspace()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1430 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.031180619041400025 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.026721911967813608 - nodes in this community are weakly interconnected._
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
