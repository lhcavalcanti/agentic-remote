# Agentic Remote - Graphify code map

Snapshot: `de0f05b51e5a4c699e27e77a893e114ef98ffaa469030bf1fca94b8a467131f2`

Source checkout: `177e7deff4bd4e5aefe26fcae1bd7c84844f25c5`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 666 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 666 files · ~1,184,261 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 9310 nodes · 26885 edges · 266 communities (218 shown, 30 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1337 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- agent-service.ts
- AppWorkspace
- api.ts
- SessionDetail
- SessionStore
- contracts.ts
- oracle-voice-session.ts
- ManagedSession
- oracle-voice-child.ts
- SessionService
- CopilotClientLike
- App.tsx
- RemoteNodeClient
- claude-agent-service.ts
- background-task-adapter.ts
- oracle-voice-security.test.ts
- session-directory.ts
- registerHubRoutes
- OracleVoiceCoordinator
- TmuxTerminalSessionController
- agentic-remote-promotion-monitor
- ManagerStore
- dreamer-store.ts
- ManagerAgent
- session-presentation.ts
- transcription-service.ts
- terminal-session.ts
- notification-center-service.ts
- oracle-voice-soak.ts
- manager.ts
- app.ts
- session-store-providers.test.ts
- oracle-voice-integration.test.ts
- oracle-voice-routes.ts
- node-routes.ts
- oracle-task-store.ts
- react
- session-store.ts
- manager-agent.ts
- oracle-voice.ts
- TerminalSessionController
- manager-structured-memory-validation.ts
- tmux-test-helpers.ts
- hub-routes.ts
- oracle-voice-worker.ts
- workspace-fixtures.ts
- setupWorkspaceFixture
- tmux-errors.integration.test.ts
- OracleDreamer.tsx
- DreamerService
- sampler.ts
- ui-scenes.ts
- SchedulerStore
- SettingsProfileSnapshot
- normalizeKnowledgeRelativePath
- agentic-remote
- ScheduleRun
- .sendInternal
- agent-service.test.ts
- dreamer-progress.ts
- client.ts
- AppSettingsDialog.tsx
- controls.tsx
- BackgroundTaskSnapshot
- processes.ts
- OracleVoiceClient
- agentic-remote-gate
- oracle-voice-benchmark.ts
- bundle
- ManagerAssistant.tsx
- FakeVoiceController
- ManagerSnapshot
- active-sessions.ts
- feature-flags.ts
- scheduler-store.ts
- VoicePlayback
- oracle-voice-config.ts
- FakeSessionService
- shell.ts
- lib.rs
- terminal-startup-queue.test.ts
- PushNotificationService
- schedule-recurrence.ts
- dependencies
- devDependencies
- VoiceCapture
- client.test.ts
- agentic-remote-promotion-setup
- SessionOrderStore
- config.rs
- shared/settings-profile.ts
- knowledge-tree.ts
- ScheduleForm.tsx
- session-prefetch.ts
- capture.ts
- manager-context.ts
- manager-proactive-inbox.ts
- BackgroundTasksDialog.tsx
- dreamer-planner.ts
- manager-structured-memory-search.ts
- manager-structured-memory.ts
- EngineVoiceBackendSession
- schedule-proposals.ts
- DialogFrame.tsx
- markdown-navigation.ts
- session-patch-browser.ts
- service.ts
- closed-sessions.ts
- oracle-voice-segments.ts
- send-matrix.integration.test.ts
- manager-proactive-coordinator.ts
- server/session-patches.ts
- manager-routes.ts
- remote-voice-client.ts
- sections.tsx
- use-markdown-document.ts
- ManagerStructuredMemoryStore
- SessionStatus
- schedules.ts
- session-transcript.ts
- capture-workspace.ts
- cli-canary.ts
- startup-phases.test.ts
- terminal-session.test.ts
- scripts
- ManagerAssistant.test.tsx
- SettingsProfileClient
- pipeline.ts
- dreamer-service.ts
- HostMonitorView.test.tsx
- src/settings-profile.ts
- compilerOptions
- session-unread.pw.ts
- host-telemetry.ts
- recovery-resend-durability.test.ts
- renderer.ts
- transport.test.ts
- session-patches.test.ts
- use-oracle-attachments.ts
- vite.config.ts
- KnowledgeStore
- ManagerProactiveInbox
- oracle-voice-tickets.ts
- session-knowledge-store.ts
- ActivityDetails.tsx
- compilerOptions
- full-gate.test.ts
- .toolHost
- .observe
- SessionKnowledgeStore
- session-reply-durability.test.ts
- compilerOptions
- server/side-question.ts
- OnlineRecognizer
- use-oracle-settings.ts
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- .correct
- dreamer-schedule.ts
- oracle-status.test.ts
- ManagerAttachment
- promotion-monitor.test.ts
- PromptCards.tsx
- BoundedQueue
- ReaderWorkspace
- manager-automatic.ts
- scripts
- session-latency-benchmark.ts
- alerts.test.ts
- session-knowledge-routes.ts
- manager-runtime.ts
- HostTelemetrySampler
- registerSessionKnowledgeRoutes
- session-resource-routes.test.ts
- RuntimeStatus.tsx
- package.json
- terminal-form-deadline.test.ts
- ChatMessage
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- knowledge-store.ts
- LargeSessionService
- ActivityRow.tsx
- theme-contrast.test.ts
- ShellNavigation.test.tsx
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- session-scope.ts
- Pcm16Resampler
- RecentlyClosed.test.tsx
- document-render.pw.ts
- dreamer-routes.ts
- dreamer-service.test.ts
- schedule-notification-service.ts
- ActivityRow.test.tsx
- html-preview.ts
- sign-in-expired.pw.ts
- manager-proactive-inbox.test.ts
- SessionAdmissions
- session-knowledge-store.test.ts
- tmux-errors.test.ts
- pipeline.test.tsx
- static-files.ts
- dataset
- generate-pwa-icons.ts
- remote.ts
- bridge.rs
- logs-cli.test.ts
- ManagerProactiveInboxValidationError
- promotion-setup-execution.test.ts
- SkillsSettings.tsx
- sent-message.ts
- voice-recorder.ts
- doctor-cli.test.ts
- manager-proactive-coordinator.test.ts
- release-publication.test.ts
- UserInputFieldControl
- OracleVoicePlayback
- composer-layout.test.ts
- HostTelemetryClock
- SessionOriginBadge.tsx
- settings.ts
- VoiceServerControl
- promotion-setup.test.ts
- FakeRecorder
- MockMediaRecorder
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
1. `AppWorkspace()` - 354 edges
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

## Communities (266 total, 30 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (19): agentMode(), AgentService, commandShortcut(), isTerminalNotReadyRefusal(), normalizedTitle(), removeCopilotSessionFiles(), RuntimeConfigurationError, sessionInUseQueueMessage() (+11 more)

### Community 1 - "agent-service.ts"
Cohesion: 0.02
Nodes (140): AcceptedSdkReply, ActivePrompt, activityDetailArguments(), activityDetailFromEvents(), activityDetailText(), activityDuration(), activityGroupIdFor(), activityKind() (+132 more)

### Community 2 - "AppWorkspace"
Cohesion: 0.03
Nodes (187): terminalSendOptions(), sessionFileValidationError(), submissionReceiptFromError(), askSession(), saveSessionHidden(), saveSessionUnread(), AppWorkspace(), adoptConversationReplacement() (+179 more)

### Community 3 - "api.ts"
Cohesion: 0.02
Nodes (169): AddKnowledgeRootInput, ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, PushSettings, SessionKnowledgeRootMutationInput, SessionMcpServerSummary, SessionSkillSummary, SettingsChange (+161 more)

### Community 4 - "SessionDetail"
Cohesion: 0.03
Nodes (25): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), PendingClaudeReply, toolResultText(), ownsDispatchRecovery(), preflight(), queueConflict() (+17 more)

### Community 5 - "SessionStore"
Cohesion: 0.03
Nodes (67): complete(), event(), sessionWithLog(), start(), fixture(), restart(), directories, fakeClient() (+59 more)

### Community 6 - "contracts.ts"
Cohesion: 0.04
Nodes (94): activityDetailsUnavailable(), activityNotInLog(), refusal(), toolCallIdSchema, updateComputerForActivityDetails(), ClaudeAgentServiceEvents, DirectoryScope, awaitTermination() (+86 more)

### Community 7 - "oracle-voice-session.ts"
Cohesion: 0.03
Nodes (58): ActiveBackendSession, BrowserTestSessionService, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, clockTicksPerSecond(), execFileAsync (+50 more)

### Community 8 - "ManagedSession"
Cohesion: 0.03
Nodes (61): RemoteSessionListing, TurnContextInput, APPROVE_WORDS, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools() (+53 more)

### Community 9 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (54): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+46 more)

### Community 10 - "SessionService"
Cohesion: 0.04
Nodes (7): updateComputerForLaunchIdentity(), registerNodeRoutes(), owns(), ProviderSessionService, SessionService, WorkspaceFile, WorkspaceListing

### Community 11 - "CopilotClientLike"
Cohesion: 0.03
Nodes (79): root, script, CopilotClientLike, ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle() (+71 more)

### Community 12 - "App.tsx"
Cohesion: 0.03
Nodes (79): isManagerEvent(), ActivityRowStates, sidebarResizeMove(), attachmentId(), bindingMatches(), clampSidebarWidth(), clearStored(), clipboardImageExtensions (+71 more)

### Community 13 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (30): RemoteResync, RemoteSessionRead, RemoteNodeClient, requestBytes(), client(), servers, session, RemoteNodeCapabilityError (+22 more)

### Community 14 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (64): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, RemoteNodeRedirectError (+56 more)

### Community 15 - "background-task-adapter.ts"
Cohesion: 0.05
Nodes (76): DeferredSession, addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskProjector, booleanValue(), boundedText(), CopilotClientTaskInfo (+68 more)

### Community 16 - "oracle-voice-security.test.ts"
Cohesion: 0.03
Nodes (43): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceStartUtterance, VoiceSttEngine, VoiceTtsEngine (+35 more)

### Community 17 - "session-directory.ts"
Cohesion: 0.05
Nodes (63): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+55 more)

### Community 18 - "registerHubRoutes"
Cohesion: 0.08
Nodes (11): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, ManagerEventSource, registerHubRoutes(), SessionMuteCarrier (+3 more)

### Community 19 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (21): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+13 more)

### Community 20 - "TmuxTerminalSessionController"
Cohesion: 0.06
Nodes (42): startAgentAfterClear(), terminal(), exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec (+34 more)

### Community 21 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 22 - "ManagerStore"
Cohesion: 0.05
Nodes (28): applications, directories, fixture(), releases, scheduledFixture(), session(), sockets, openStore() (+20 more)

### Community 23 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (44): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+36 more)

### Community 24 - "ManagerAgent"
Cohesion: 0.08
Nodes (13): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+5 more)

### Community 25 - "session-presentation.ts"
Cohesion: 0.05
Nodes (68): CLOSED_SESSION_RETENTION_DAYS, closedSessionExpiresAt(), saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, CloseSessionDialog(), noPrompts (+60 more)

### Community 26 - "transcription-service.ts"
Cohesion: 0.05
Nodes (46): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+38 more)

### Community 27 - "terminal-session.ts"
Cohesion: 0.05
Nodes (72): BackgroundShellsEvidence, boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus() (+64 more)

### Community 28 - "notification-center-service.ts"
Cohesion: 0.06
Nodes (39): center(), directories, directory(), hub(), now, runtimes, start(), trusted (+31 more)

### Community 29 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (32): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+24 more)

### Community 30 - "manager.ts"
Cohesion: 0.06
Nodes (50): ComputerManagerEvents, attentionClosed(), attentionSeed(), classifyHostNotification(), classifyHubNotification(), classifyOracleNotification(), classifyScheduleNotification(), HOST_ALERT_MEMORY_DURATION_MS (+42 more)

### Community 31 - "app.ts"
Cohesion: 0.05
Nodes (49): buildApp(), errorStatusCode(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), directories, runtimes, trusted (+41 more)

### Community 32 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (36): CopilotSessionLike, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), QueuedDelivery, QueuedDispatchTarget, terminalRefused() (+28 more)

### Community 33 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (36): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+28 more)

### Community 34 - "oracle-voice-routes.ts"
Cohesion: 0.05
Nodes (47): nodeVoiceCapabilities(), sendNodeVoiceOutput(), OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, OracleVoiceManager, capabilities, confirm() (+39 more)

### Community 35 - "node-routes.ts"
Cohesion: 0.06
Nodes (47): FileUploadError, registerFileUploadRoutes(), SessionParams, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema (+39 more)

### Community 36 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (45): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+37 more)

### Community 37 - "react"
Cohesion: 0.05
Nodes (31): react, listClosedSessions(), AttachmentStrip(), Composer(), composerSteeringUnavailableReason(), filterSentMessages(), SentHistoryContext, ComposerActions() (+23 more)

### Community 38 - "session-store.ts"
Cohesion: 0.05
Nodes (44): idleDaysSchema, mergeSessionRetention(), sessionRetentionPatchSchema, sessionRetentionSchema, cloneSessionWindow(), emptyRetirements, encode(), isSameInterruption() (+36 more)

### Community 39 - "manager-agent.ts"
Cohesion: 0.05
Nodes (36): DreamerProgressView, automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession (+28 more)

### Community 40 - "oracle-voice.ts"
Cohesion: 0.07
Nodes (45): exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions (+37 more)

### Community 41 - "TerminalSessionController"
Cohesion: 0.04
Nodes (23): holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), sessionInUseConflictMessage(), fixtures (+15 more)

### Community 42 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 43 - "tmux-test-helpers.ts"
Cohesion: 0.07
Nodes (48): foreignSocketPlace(), noTmuxServer(), processGone(), procVisible(), samePlace(), socketIdentity(), SocketPlace, UnixSocket (+40 more)

### Community 44 - "hub-routes.ts"
Cohesion: 0.04
Nodes (53): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+45 more)

### Community 45 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (24): benchmarkGroup(), ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent() (+16 more)

### Community 46 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (46): frame(), geometry, output, scratch, screenshot(), { values }, accents, Measurement (+38 more)

### Community 47 - "setupWorkspaceFixture"
Cohesion: 0.05
Nodes (25): desktop, devices, long, open(), phone, veryLong, bounds(), closedEarlier (+17 more)

### Community 48 - "tmux-errors.integration.test.ts"
Cohesion: 0.05
Nodes (32): ServerRole, connections, fixture(), managers, releases, remote, session(), SessionMetadataLookup (+24 more)

### Community 49 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (45): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+37 more)

### Community 50 - "DreamerService"
Cohesion: 0.11
Nodes (11): boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate (+3 more)

### Community 51 - "sampler.ts"
Cohesion: 0.08
Nodes (45): counter(), counterDelta(), CpuCounters, cpuUtilization(), detectWsl(), DeviceByteCounters, DeviceCounters, deviceRates() (+37 more)

### Community 52 - "ui-scenes.ts"
Cohesion: 0.07
Nodes (33): { values }, captureOutputDirectory(), fixtureFrontendBuildCommand, fixtureFrontendDist, startFixtureFrontend(), fixtureNotifications, fixtureScheduleProposals, fixtureScheduleRuns (+25 more)

### Community 53 - "SchedulerStore"
Cohesion: 0.11
Nodes (8): fixture(), deferUnboundWorktree(), failure(), occurrenceKey(), SchedulerStore, ScheduleProposal, Schedule, ScheduleRunStatus

### Community 54 - "SettingsProfileSnapshot"
Cohesion: 0.07
Nodes (26): WorkspaceFixtureState, directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore (+18 more)

### Community 55 - "normalizeKnowledgeRelativePath"
Cohesion: 0.08
Nodes (39): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), SessionKnowledgeBinding, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+31 more)

### Community 56 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 57 - "ScheduleRun"
Cohesion: 0.14
Nodes (11): provenance(), SessionScheduleLauncher, session(), ScheduleLaunchRefusedError, SchedulerDispatcher, ScheduleReconciliation, registerSchedulerRoutes(), holdsSlot() (+3 more)

### Community 58 - ".sendInternal"
Cohesion: 0.11
Nodes (38): activeBottomFrame(), backgroundShellsAllow(), busyRowStatus(), captureBeforeDeadline(), captureForReplacement(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts() (+30 more)

### Community 59 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (19): isUncertainDelivery(), persistedFormAnswer(), terminalFormSteps(), closableService(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration (+11 more)

### Community 60 - "dreamer-progress.ts"
Cohesion: 0.08
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressEntry, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 61 - "client.ts"
Cohesion: 0.07
Nodes (27): ManagerClientDefaults, VoiceCapabilities, getOracleVoiceCapabilities(), closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture (+19 more)

### Community 62 - "AppSettingsDialog.tsx"
Cohesion: 0.09
Nodes (42): parseAppVersion(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), currentAppViewportGeometry() (+34 more)

### Community 63 - "controls.tsx"
Cohesion: 0.10
Nodes (38): NewSessionBackendSetting, createSession(), listHistory(), shortcutKeys(), readStoredShortcuts(), AppShortcutBinding, binding(), bindingLabel() (+30 more)

### Community 64 - "BackgroundTaskSnapshot"
Cohesion: 0.08
Nodes (26): backgroundTaskNotFound(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), listedBackgroundTask(), readBackgroundTaskFrom(), taskFingerprint() (+18 more)

### Community 65 - "processes.ts"
Cohesion: 0.09
Nodes (27): createProcessProcReader(), isUnavailableProcess(), parseProcessParameters(), parseProcessStat(), ProcessProcReader, ProcessStat, expectProc(), ProcessFixture (+19 more)

### Community 66 - "OracleVoiceClient"
Cohesion: 0.14
Nodes (8): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError(), terminalCloseCode()

### Community 67 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 68 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (38): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, deferred() (+30 more)

### Community 69 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 70 - "ManagerAssistant.tsx"
Cohesion: 0.08
Nodes (38): editQueuedManagerMessage(), removeQueuedManagerMessage(), retryManagerMessage(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), boundWidth(), canTakeFocus() (+30 more)

### Community 71 - "FakeVoiceController"
Cohesion: 0.09
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 72 - "ManagerSnapshot"
Cohesion: 0.06
Nodes (7): FakeManager, ProactiveManager, FakeManager, StoredManager, SecurityManager, ManagerSnapshot, ManagerSubmissionOptions

### Community 73 - "active-sessions.ts"
Cohesion: 0.09
Nodes (33): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+25 more)

### Community 74 - "feature-flags.ts"
Cohesion: 0.13
Nodes (29): hub(), defaultHubFeatureFlags, effectivePreviewFeatures(), HubFeatureFlag, HubFeatureFlags, hubFlagCatalogue, isPreviewAvailable(), parseFeatureFlag() (+21 more)

### Community 75 - "scheduler-store.ts"
Cohesion: 0.07
Nodes (26): headers, hub(), sender, NoopScheduleLauncher, ScheduleLauncher, SCHEDULER_CONCURRENCY, SCHEDULER_LATE_MS, SCHEDULER_POLL_MS (+18 more)

### Community 76 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 77 - "oracle-voice-config.ts"
Cohesion: 0.08
Nodes (29): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+21 more)

### Community 79 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 80 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 81 - "terminal-startup-queue.test.ts"
Cohesion: 0.08
Nodes (30): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAppendedEvents() (+22 more)

### Community 82 - "PushNotificationService"
Cohesion: 0.12
Nodes (9): NotificationRecorder, brief(), PushNotificationService, scoped(), registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema (+1 more)

### Community 83 - "schedule-recurrence.ts"
Cohesion: 0.09
Nodes (36): CronField, cronMatchesDate(), DAY_NAMES, MONTH_NAMES, parseCronExpression(), ParsedCronExpression, parseField(), actualSpacingError() (+28 more)

### Community 84 - "dependencies"
Cohesion: 0.05
Nodes (39): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+31 more)

### Community 85 - "devDependencies"
Cohesion: 0.05
Nodes (39): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+31 more)

### Community 86 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 87 - "client.test.ts"
Cohesion: 0.07
Nodes (10): OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 88 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 89 - "SessionOrderStore"
Cohesion: 0.12
Nodes (18): directories, fakeManager(), hub(), orderStore(), settled(), until(), upserted(), carried() (+10 more)

### Community 90 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 91 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (33): execute, resolveHubDisplayName(), deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, AccentSetting (+25 more)

### Community 92 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+26 more)

### Community 93 - "ScheduleForm.tsx"
Cohesion: 0.12
Nodes (27): scheduleProposalSummary(), validateRecurrence(), ScheduleTarget, FolderPicker(), browse(), editableSchedule(), recurrenceSummary(), runDuration() (+19 more)

### Community 94 - "session-prefetch.ts"
Cohesion: 0.09
Nodes (25): browserConnection, ConnectionHints, connectionSparesData(), IdleScheduler, PASSIVE_READS_SINCE, PREFETCH_PASS_BYTES, PREFETCH_SIDEBAR_ROWS, prefetchCandidates() (+17 more)

### Community 95 - "capture.ts"
Cohesion: 0.07
Nodes (17): BufferedFrame, defaultAudioContext(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode (+9 more)

### Community 96 - "manager-context.ts"
Cohesion: 0.12
Nodes (28): ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine(), followUpLine() (+20 more)

### Community 97 - "manager-proactive-inbox.ts"
Cohesion: 0.09
Nodes (34): assertExactKeys(), canonicalHash(), DISPOSITIONS, eventId(), hasExactKeys(), isDisposition(), isEventKind(), isId() (+26 more)

### Community 98 - "BackgroundTasksDialog.tsx"
Cohesion: 0.11
Nodes (28): BackgroundTaskProgressLine, BackgroundTaskDetails(), BackgroundTaskList(), BackgroundTaskRow(), BackgroundTasksDialog(), elapsedPrefix(), messageDateTimeFormatter, messageTimeFormatter (+20 more)

### Community 99 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (30): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+22 more)

### Community 100 - "manager-structured-memory-search.ts"
Cohesion: 0.11
Nodes (27): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+19 more)

### Community 101 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (29): ManagerStructuredMemorySearchIndex, isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+21 more)

### Community 102 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 103 - "schedule-proposals.ts"
Cohesion: 0.12
Nodes (29): action, create, existing, metadata, scheduleProposalInputSchema, ScheduleProposalsChanged, scheduleProposalSchema, update (+21 more)

### Community 104 - "DialogFrame.tsx"
Cohesion: 0.11
Nodes (24): changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame(), FeatureEvent (+16 more)

### Community 105 - "markdown-navigation.ts"
Cohesion: 0.12
Nodes (29): followMarkdownLink(), KnowledgeReader(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument(), BreadcrumbSegment (+21 more)

### Community 106 - "session-patch-browser.ts"
Cohesion: 0.11
Nodes (29): pageFor(), advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading() (+21 more)

### Community 107 - "service.ts"
Cohesion: 0.10
Nodes (15): prefixes, session, trusted, untrusted, HostRequest, HOST_PROCESSES_INTERVAL_MS, HOST_TELEMETRY_MAX_VIEWERS, hostTelemetryError() (+7 more)

### Community 108 - "closed-sessions.ts"
Cohesion: 0.09
Nodes (18): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, blockParents, CLOSED_SESSION_RETENTION_MS, closedCapitals(), closedSessionContext() (+10 more)

### Community 109 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 110 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (27): message(), BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained (+19 more)

### Community 111 - "manager-proactive-coordinator.ts"
Cohesion: 0.16
Nodes (9): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, SessionLifecycle, ManagerProactiveInboxEvent (+1 more)

### Community 112 - "server/session-patches.ts"
Cohesion: 0.13
Nodes (15): changedInPlace(), diffMessages(), Publication, PublishedTask, sameField(), sameMessage(), sameOrder(), sessionKey() (+7 more)

### Community 113 - "manager-routes.ts"
Cohesion: 0.10
Nodes (19): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+11 more)

### Community 114 - "remote-voice-client.ts"
Cohesion: 0.17
Nodes (12): VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient (+4 more)

### Community 115 - "sections.tsx"
Cohesion: 0.12
Nodes (18): AppVersion, HubHealth, AppearanceSetting, getHubHealth(), SettingScope(), HealthCard(), accentThemes, appearanceOptions (+10 more)

### Community 116 - "use-markdown-document.ts"
Cohesion: 0.14
Nodes (22): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+14 more)

### Community 117 - "ManagerStructuredMemoryStore"
Cohesion: 0.14
Nodes (8): capturePrompt(), initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryStatus

### Community 118 - "SessionStatus"
Cohesion: 0.10
Nodes (21): Seen, PersistedCursor, NotificationCursor, Row, SdkRestartRecovery, FinishedSession, SessionUnreadTracker, finished() (+13 more)

### Community 119 - "schedules.ts"
Cohesion: 0.11
Nodes (25): DEFAULT_SCHEDULE_TIMEZONE, identifier, SCHEDULE_PROMPT_MAX_LENGTH, scheduleAbandonSchema, scheduleActionSchema, scheduleArchivedSchema, scheduleCreateSchema, scheduleEnabledSchema (+17 more)

### Community 120 - "session-transcript.ts"
Cohesion: 0.13
Nodes (22): TRANSCRIPT_CARRIED_LIMIT, sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse() (+14 more)

### Community 121 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 122 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 123 - "startup-phases.test.ts"
Cohesion: 0.10
Nodes (16): phases, port, app(), directories, headers, launcher, createStartupPhases(), startManagedServer() (+8 more)

### Community 124 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (22): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse(), pastedPlaceholderCount(), qualifyingPasteCount() (+14 more)

### Community 125 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 126 - "ManagerAssistant.test.tsx"
Cohesion: 0.08
Nodes (18): cancelManager(), resetManager(), resolveManagerConfirmation(), sendManagerMessage(), sessionLinkTarget(), startOver(), OracleButton(), OracleControl (+10 more)

### Community 127 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 128 - "pipeline.ts"
Cohesion: 0.12
Nodes (18): partlyHeldRenderer(), documentParts(), documentUrlTransform(), drawSteps(), growable, htmlBlocks, isDiagram(), processor (+10 more)

### Community 129 - "dreamer-service.ts"
Cohesion: 0.13
Nodes (22): DREAMER_MAX_ITEMS, DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), DreamerProgressLimits, DreamerPlannerExecutionInput, DreamerServiceOptions (+14 more)

### Community 130 - "HostMonitorView.test.tsx"
Cohesion: 0.14
Nodes (21): MinuteAccumulator, HostMetric, hostMetricNames, HostComputerView(), HostMonitorView(), Sparkline(), computer, metrics (+13 more)

### Community 131 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (20): NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+12 more)

### Community 132 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 133 - "session-unread.pw.ts"
Cohesion: 0.11
Nodes (12): bounds(), devices, edgeState(), open(), screenshot(), unreadState(), fixtureBackgroundTasks, WorkspaceFixtureOptions (+4 more)

### Community 134 - "host-telemetry.ts"
Cohesion: 0.13
Nodes (20): fixtureScheduleRuns, fixtureSchedules, aggregate, DiskSpaceSchema, HostHistorySchema, HostInfoSchema, HostMetricAggregate, HostMetricAggregateSchema (+12 more)

### Community 135 - "recovery-resend-durability.test.ts"
Cohesion: 0.11
Nodes (15): directories, disk, fixture(), gate(), gates, httpBoundary(), initialize(), PublicSessionValue (+7 more)

### Community 136 - "renderer.ts"
Cohesion: 0.14
Nodes (13): render, scope, DocumentRenderEvent, documentRenderEvents(), createWorkerRenderer(), defaultDocumentRenderer(), DocumentRendererContext, RendererWorker (+5 more)

### Community 137 - "transport.test.ts"
Cohesion: 0.13
Nodes (13): registerHostTelemetryRoutes(), HOST_TELEMETRY_MAX_QUEUE_BYTES, HOST_TELEMETRY_MAX_QUEUE_MESSAGES, HOST_TELEMETRY_SEND_TIMEOUT_MS, HostSocket, HostTelemetrySocket, readingFixture(), empty (+5 more)

### Community 138 - "session-patches.test.ts"
Cohesion: 0.16
Nodes (10): nextVoiceControl(), Client, Browser, seedOffset, HubResyncRequest, HubTasksResyncRequest, HubWireEvent, applyTaskPatch() (+2 more)

### Community 139 - "use-oracle-attachments.ts"
Cohesion: 0.17
Nodes (20): codeExtensions, fileTypes, managerFileValidationError(), MAX_MANAGER_FILE_BYTES, MAX_MANAGER_TEXT_BYTES, textTypes, removeManagerFile(), uploadManagerFile() (+12 more)

### Community 140 - "vite.config.ts"
Cohesion: 0.12
Nodes (12): brotliAsync, compress(), gzipAsync, precompressDirectory(), PrecompressedFile, directories, canaryTests, oracleVoiceAssetNames (+4 more)

### Community 141 - "KnowledgeStore"
Cohesion: 0.21
Nodes (5): KnowledgeStore, parseMetadata(), readOptional(), fixture(), createHub()

### Community 142 - "ManagerProactiveInbox"
Cohesion: 0.20
Nodes (6): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 143 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 144 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 145 - "ActivityDetails.tsx"
Cohesion: 0.18
Nodes (18): ACTIVITY_DETAIL_TEXT_LIMIT_BYTES, TOOL_CALL_ID_PATTERN, activityDetailFailure, detailKey(), formatBytes(), keep(), kept, keptActivityDetail() (+10 more)

### Community 146 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 147 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 149 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 151 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 152 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 153 - "server/side-question.ts"
Cohesion: 0.18
Nodes (7): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout()

### Community 154 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 155 - "use-oracle-settings.ts"
Cohesion: 0.16
Nodes (13): getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+5 more)

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

### Community 160 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 161 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 162 - "oracle-status.test.ts"
Cohesion: 0.19
Nodes (14): bytes(), HOST_STATUS_MAX_COMPUTERS, HOST_STATUS_MAX_LENGTH, number(), oracleHostStatus(), owner(), processes(), summary() (+6 more)

### Community 163 - "ManagerAttachment"
Cohesion: 0.25
Nodes (8): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), managerFileType(), ManagerAttachment

### Community 164 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 165 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (13): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+5 more)

### Community 166 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 167 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 168 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 169 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+9 more)

### Community 170 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 171 - "alerts.test.ts"
Cohesion: 0.15
Nodes (8): HOST_ALERT_POLL_INTERVAL_MS, HostAlertMonitor, computer, observe(), snapshot(), start, sustained(), HOST_ALERT_COOLDOWN_MS

### Community 172 - "session-knowledge-routes.ts"
Cohesion: 0.12
Nodes (11): KnowledgeRootConfinementConflictError, errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, RegistrationGeneration, ReplacementEvidence, rootUpdateSchema (+3 more)

### Community 173 - "manager-runtime.ts"
Cohesion: 0.23
Nodes (12): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+4 more)

### Community 175 - "registerSessionKnowledgeRoutes"
Cohesion: 0.26
Nodes (12): registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+4 more)

### Community 176 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 177 - "RuntimeStatus.tsx"
Cohesion: 0.27
Nodes (9): families, modelFamily, shortModelName(), repositoryModels, RuntimeStatus(), session, glyphs, ModelFamilyIcon() (+1 more)

### Community 178 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 179 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 180 - "ChatMessage"
Cohesion: 0.16
Nodes (11): TranscriptBuilder, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, ChatMessage, TranscriptWindow (+3 more)

### Community 181 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 182 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 183 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 184 - "knowledge-store.ts"
Cohesion: 0.16
Nodes (9): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, PersistedKnowledgeState, directories (+1 more)

### Community 186 - "ActivityRow.tsx"
Cohesion: 0.33
Nodes (11): toolCallIdFromActivityId(), activityKindFromMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel(), compactActivityText(), formatActivityDuration() (+3 more)

### Community 187 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 188 - "ShellNavigation.test.tsx"
Cohesion: 0.32
Nodes (6): ClientFeature, railEntries(), initials(), useDisplayName(), DisplayNameSetting(), ShellNavigation()

### Community 189 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 190 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 191 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 192 - "session-scope.ts"
Cohesion: 0.19
Nodes (9): execFileAsync, isSessionScopeLauncher(), ProbeRun, SESSION_SCOPE, sessionLaunchCommand(), sessionScopeAvailable, sessionScopeProbe(), adapter (+1 more)

### Community 193 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 194 - "RecentlyClosed.test.tsx"
Cohesion: 0.19
Nodes (9): act(), audit(), closed, computers, now, observeResizes(), Row(), session() (+1 more)

### Community 196 - "dreamer-routes.ts"
Cohesion: 0.20
Nodes (10): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+2 more)

### Community 199 - "ActivityRow.test.tsx"
Cohesion: 0.20
Nodes (7): ActivityStatus, ActivityRow, bashDetail(), output, raw, runningDetail(), text()

### Community 200 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 201 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 202 - "manager-proactive-inbox.test.ts"
Cohesion: 0.22
Nodes (6): fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 204 - "session-knowledge-store.test.ts"
Cohesion: 0.20
Nodes (7): SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, disk, fixture(), fixtures, releases, root()

### Community 205 - "tmux-errors.test.ts"
Cohesion: 0.24
Nodes (9): containedServer(), directories, errno(), { execute }, files, links, listener(), places() (+1 more)

### Community 206 - "pipeline.test.tsx"
Cohesion: 0.24
Nodes (8): documentOpening(), components, drawn(), drawnPage(), fixtures, html(), today(), rehypeDocumentHeadings()

### Community 207 - "static-files.ts"
Cohesion: 0.27
Nodes (6): RFC-9110, AcceptedEncodings, FILE_HEADERS, isApiPath(), isAppleTouchIconProbe(), registerStaticFiles()

### Community 208 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 209 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 210 - "remote.ts"
Cohesion: 0.27
Nodes (8): HOST_TELEMETRY_REMOTE_TIMEOUT_MS, HOST_TELEMETRY_STALE_STREAM_MS, subscribeRemoteHost(), connect(), empty, servers, subscriptions, HOST_TELEMETRY_INVALID_CLOSE_CODE

### Community 211 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 212 - "logs-cli.test.ts"
Cohesion: 0.28
Nodes (8): epoch, exec, Explanation, fixture(), journalLine(), journalRecord(), Log, roots

### Community 213 - "ManagerProactiveInboxValidationError"
Cohesion: 0.28
Nodes (6): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions()

### Community 214 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 215 - "SkillsSettings.tsx"
Cohesion: 0.39
Nodes (7): listComputerSkills(), toggleComputerSkill(), ComputerSkills(), save(), SkillsSettings(), computers, snapshot

### Community 216 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 217 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 218 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 219 - "manager-proactive-coordinator.test.ts"
Cohesion: 0.29
Nodes (4): directories, fixture(), managed(), ManagerProactiveInboxOptions

### Community 220 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 221 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 223 - "composer-layout.test.ts"
Cohesion: 0.48
Nodes (4): atRule(), coarsePointerBlock(), composerPointerBlock(), pointerLayout()

### Community 225 - "SessionOriginBadge.tsx"
Cohesion: 0.43
Nodes (5): SessionProvenance, sessionOriginDescription(), icons, labels, SessionOriginBadge()

### Community 226 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 227 - "VoiceServerControl"
Cohesion: 0.40
Nodes (4): connect(), Inbox, rawBuffer(), VoiceServerControl

### Community 228 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1484 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1479 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2490 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionDetail`, `SessionStore`, `oracle-voice-session.ts`, `transport.test.ts`, `SessionService`, `KnowledgeStore`, `ManagerProactiveInbox`, `session-directory.ts`, `registerHubRoutes`, `ManagerStore`, `SessionKnowledgeStore`, `ManagerAgent`, `transcription-service.ts`, `notification-center-service.ts`, `node-routes.ts`, `oracle-task-store.ts`, `manager-agent.ts`, `alerts.test.ts`, `hub-routes.ts`, `manager-runtime.ts`, `HostTelemetrySampler`, `oracle-voice-worker.ts`, `tmux-errors.integration.test.ts`, `DreamerService`, `SchedulerStore`, `SettingsProfileSnapshot`, `ScheduleRun`, `agent-service.test.ts`, `AppSettingsDialog.tsx`, `dreamer-routes.ts`, `schedule-notification-service.ts`, `feature-flags.ts`, `scheduler-store.ts`, `oracle-voice-config.ts`, `static-files.ts`, `PushNotificationService`, `SessionOrderStore`, `service.ts`, `manager-proactive-coordinator.ts`, `manager-routes.ts`, `ManagerStructuredMemoryStore`, `cli-canary.ts`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `session-store-providers.test.ts`, `agent-service.ts`, `BackgroundTaskSnapshot`, `SessionDetail`, `SessionStore`, `session-store.ts`, `recovery-resend-durability.test.ts`, `TerminalSessionController`, `claude-agent-service.ts`, `session-directory.ts`, `server/side-question.ts`, `agent-service.test.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `AppWorkspace()` (e.g. with `prefersLightNow()` and `readOraclePlacement()`) actually correct?**
  _`AppWorkspace()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1484 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03093172387778197 - nodes in this community are weakly interconnected._
- **Should `agent-service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.022429459588713535 - nodes in this community are weakly interconnected._
- **Should `AppWorkspace` be split into smaller, more focused modules?**
  _Cohesion score 0.02870646766169154 - nodes in this community are weakly interconnected._
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
