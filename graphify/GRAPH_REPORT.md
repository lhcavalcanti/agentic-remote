# Agentic Remote - Graphify code map

Snapshot: `2ca7ff9bca2c12c4cf45c389ed00a1af4179119222fa1326d243151698dd29a5`

Source checkout: `323a66f7b2ff2bec05392b9bc32402272fbebfe8`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 407 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 407 files · ~842,187 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7017 nodes · 19459 edges · 237 communities (195 shown, 26 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1033 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionStore
- SessionDetail
- App.tsx
- App
- agent-service.ts
- App.test.tsx
- computer-manager.ts
- OracleVoiceCoordinator
- workspace-fixtures.ts
- terminal-session.ts
- agentic-remote-promotion-monitor
- oracle-voice-soak.ts
- claude-agent-service.ts
- oracle-voice.ts
- sessionKey
- manager-tools.ts
- ManagedSession
- ManagerAgent
- CopilotSessionLike
- oracle-voice-integration.test.ts
- contracts.ts
- EnabledOracleVoiceConfig
- CopilotClientLike
- SessionService
- oracle-task-store.ts
- session-presentation.ts
- hub-routes.ts
- markdown-navigation.ts
- manager-structured-memory-validation.ts
- active-sessions.ts
- FakeManager
- send-matrix.integration.test.ts
- session-knowledge-store.ts
- KnowledgeStore
- FakeVoiceEngine
- VoiceCapture
- OracleDreamer.tsx
- manager.ts
- RemoteNodeClient
- oracle-voice-routes.test.ts
- TmuxTerminalSessionController
- agentic-remote
- session-patch-browser.ts
- ManagerSnapshot
- ProviderSessionService
- OracleVoiceClient
- tmux-test-helpers.ts
- bundle
- session-directory.ts
- DreamerService
- background-task-adapter.ts
- DreamerStore
- VoicePlayback
- pwa.ts
- oracle-voice-config.ts
- ManagerAssistant.tsx
- dreamer-store.ts
- ManagerStore
- client.test.ts
- shell.ts
- lib.rs
- ChildVoiceEngine
- .sendAdmittedWithBackend
- manager-agent.test.ts
- manager-proactive-inbox.ts
- terminal-session.test.ts
- agentic-remote-promotion-setup
- transcription-service.ts
- agentic-remote-gate
- config.rs
- app.ts
- dreamer-service.ts
- FakeSessionService
- ResidentVoiceWorker
- .sendInternal
- dependencies
- devDependencies
- NodeIdentityStore
- oracle-voice-child.test.ts
- EngineVoiceBackendSession
- manager-store.ts
- node-routes.ts
- dreamer-planner.ts
- oracle-voice-child.ts
- shared/settings-profile.ts
- UserInputReplyInput
- src/settings-profile.ts
- registerSessionKnowledgeRoutes
- manager-structured-memory-search.ts
- ChatMessage
- oracle-voice-security.test.ts
- SessionOrderStore
- manager-structured-memory.ts
- push-notification-service.ts
- oracle-voice-benchmark.ts
- delegated-transcription-service.ts
- manager-agent.ts
- ManagerStructuredMemoryStore
- manager-routes.ts
- settings-profile-store.ts
- cli-canary.ts
- oracle-voice-worker.ts
- oracle-voice-routes.ts
- PushNotificationService
- RemoteVoiceClient
- scripts
- client.ts
- oracle-voice-coordinator.test.ts
- compilerOptions
- ManagerAssistant.test.tsx
- SettingsProfileClient
- manager-context.ts
- oracle-voice-segments.ts
- oracle-voice-tickets.ts
- refusal-metrics.ts
- full-gate.test.ts
- startup-phases.test.ts
- session-reply-durability.test.ts
- PromptCards.tsx
- knowledge-tree.ts
- compilerOptions
- ManagerProactiveInbox
- manager-structured-memory-store.ts
- session-store-providers.test.ts
- OnlineRecognizer
- compilerOptions
- compilerOptions
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- agent-service.test.ts
- .toolHost
- ManagerMemory
- .observe
- submission-error.ts
- dreamer-schedule.ts
- use-session-knowledge-root.ts
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- capture
- background-task-stop.test.ts
- promotion-monitor.test.ts
- NewSessionDialog
- terminal-form-deadline.test.ts
- scripts
- react
- DeferredSession
- manager-runtime.ts
- oracle-voice-assets.test.ts
- OracleVoiceClientOptions
- fake-vad.ts
- desktop.json
- recordValue
- session-resource-providers.test.ts
- theme-contrast.test.ts
- BackgroundTasksDialog.tsx
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- session-clear-transcript.test.ts
- use-oracle-conversation.test.tsx
- Pcm16Resampler
- background-task-tracker.ts
- manager-proactive-inbox.test.ts
- recovery-seed-guards.test.ts
- send-policy.test.ts
- html-preview.ts
- benchmarkFixture
- HubEvent
- ManagerStructuredMemoryRuntime
- dataset
- generate-pwa-icons.ts
- file-upload-routes.ts
- ManagerProactiveInboxValidationError
- SpeakableSegmenter
- bridge.rs
- screenshot-stability.test.ts
- dreamer-routes.ts
- promotion-setup-execution.test.ts
- SessionAdmissions
- VoiceVadOptions
- settings-profile.test.ts
- vite.config.ts
- package.json
- release-publication.test.ts
- session-patch-routes.test.ts
- vad-assets.ts
- oracle-conversation-real.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- VoiceGenerationIdentity
- settings-profile-routes.ts
- settings.ts
- .transport
- oracle-voice-benchmark.test.ts
- composer-layout.test.ts
- VoiceSttEngine
- usePanelWidth
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- push-routes.ts
- VoiceCaptureDependencies
- VoiceTtsEngine
- terminal-send-uncertainty.test.ts
- .readBackgroundTasks
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- @fastify/static
- ffprobe-static
- lucide-react
- mermaid
- react-dom
- react-markdown
- remark-parse
- web-push
- zod
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 309 edges
2. `AgentService` - 282 edges
3. `App()` - 278 edges
4. `SessionStore` - 189 edges
5. `ClaudeAgentService` - 126 edges
6. `ManagedSession` - 110 edges
7. `ManagerAgent` - 96 edges
8. `buildApp()` - 95 edges
9. `registerHubRoutes()` - 95 edges
10. `ComputerManager` - 89 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `FakeVoiceState` --references--> `ManagerMessage`  [EXTRACTED]
  e2e/fixtures/fake-voice.ts → shared/manager.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (237 total, 26 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (9): agentMode(), AgentService, removeCopilotSessionFiles(), RuntimeConfigurationError, suspendedRuntimeConflict(), queueConflict(), isRetainedRefusal(), TranscriptObservation (+1 more)

### Community 1 - "SessionStore"
Cohesion: 0.03
Nodes (93): fixture(), holdProbe(), fixtures, gate(), releases, restart(), sdkPermissionEvents(), sdkRecoveryEvents() (+85 more)

### Community 2 - "SessionDetail"
Cohesion: 0.04
Nodes (13): ClaudeAgentService, isMissingClaudeSessionError(), observe(), answer(), claudeRequest(), copilotRequest(), assertSessionNotRetained(), clearRecoverySeedFailure() (+5 more)

### Community 3 - "App.tsx"
Cohesion: 0.02
Nodes (104): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, ActivityStatus, SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH, SIDE_QUESTION_EARLIER_LIMIT, SIDE_QUESTION_MAX_LENGTH, addComputer() (+96 more)

### Community 4 - "App"
Cohesion: 0.03
Nodes (102): askSession(), deleteKnowledgeRoot(), deleteSession(), listKnowledgeEntries(), moveSessionToTmux(), readKnowledgeFile(), recoverConversation(), replyPermission() (+94 more)

### Community 5 - "agent-service.ts"
Cohesion: 0.04
Nodes (81): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+73 more)

### Community 6 - "App.test.tsx"
Cohesion: 0.03
Nodes (82): addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), configureRetention(), createOracleVoiceTicket(), dispatchQueuedPrompt(), fetchSessionOrder() (+74 more)

### Community 7 - "computer-manager.ts"
Cohesion: 0.04
Nodes (41): ClaudeAgentServiceEvents, RemoteResync, RemoteSessionRead, DirectoryScope, directories, voiceControlQueues, voiceControlWaiters, ProviderSessionServiceEvents (+33 more)

### Community 8 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (21): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+13 more)

### Community 9 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (67): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, assertConversation() (+59 more)

### Community 10 - "terminal-session.ts"
Cohesion: 0.05
Nodes (75): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerRowText() (+67 more)

### Community 11 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 12 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 13 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (57): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+49 more)

### Community 14 - "oracle-voice.ts"
Cohesion: 0.06
Nodes (62): sendNodeVoiceOutput(), QueuedAudio, SocketMessage, outputBytes(), sendBrowserOutput(), ActiveUtterance, AudioReservation, outputBytes() (+54 more)

### Community 15 - "sessionKey"
Cohesion: 0.06
Nodes (77): message(), sendLikeTheApp(), terminalSendOptions(), clearConversation(), removeQueuedPrompt(), reorderQueuedPrompts(), activeComposerPastes(), appendComposerForKey() (+69 more)

### Community 16 - "manager-tools.ts"
Cohesion: 0.06
Nodes (40): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), proactiveSessionAllowed(), requireComputer(), resolveSession() (+32 more)

### Community 17 - "ManagedSession"
Cohesion: 0.11
Nodes (11): ComputerManager, managedSession(), mapWithConcurrency(), RemoteSessionListing, sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), TurnContextInput (+3 more)

### Community 18 - "ManagerAgent"
Cohesion: 0.09
Nodes (11): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, TurnError, uniqueManagerSessionRefs() (+3 more)

### Community 19 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (33): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+25 more)

### Community 20 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+24 more)

### Community 21 - "contracts.ts"
Cohesion: 0.05
Nodes (54): AddKnowledgeRootInput, BackgroundTaskAttachmentMode, BackgroundTaskExecutionMode, CreateSessionInput, DispatchQueuedPromptInput, ManagedQueuedPromptDispatchResult, ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot (+46 more)

### Community 22 - "EnabledOracleVoiceConfig"
Cohesion: 0.05
Nodes (26): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+18 more)

### Community 23 - "CopilotClientLike"
Cohesion: 0.04
Nodes (45): CopilotClientLike, ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+37 more)

### Community 24 - "SessionService"
Cohesion: 0.06
Nodes (12): ActiveClaudeQuery, nodeVoiceCapabilities(), registerNodeRoutes(), releases, session, snapshot, readServiceResources(), readSessionSkills() (+4 more)

### Community 25 - "oracle-task-store.ts"
Cohesion: 0.08
Nodes (40): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+32 more)

### Community 26 - "session-presentation.ts"
Cohesion: 0.07
Nodes (50): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+42 more)

### Community 27 - "hub-routes.ts"
Cohesion: 0.05
Nodes (53): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+45 more)

### Community 28 - "markdown-navigation.ts"
Cohesion: 0.06
Nodes (47): executeCommand(), listWorkspace(), readWorkspaceFile(), searchWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit() (+39 more)

### Community 29 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 30 - "active-sessions.ts"
Cohesion: 0.07
Nodes (46): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+38 more)

### Community 31 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 32 - "send-matrix.integration.test.ts"
Cohesion: 0.05
Nodes (46): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+38 more)

### Community 33 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+22 more)

### Community 34 - "KnowledgeStore"
Cohesion: 0.07
Nodes (24): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, SessionMuteCarrier, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference (+16 more)

### Community 35 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (24): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine (+16 more)

### Community 36 - "VoiceCapture"
Cohesion: 0.09
Nodes (15): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, harness() (+7 more)

### Community 37 - "OracleDreamer.tsx"
Cohesion: 0.09
Nodes (43): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+35 more)

### Community 38 - "manager.ts"
Cohesion: 0.07
Nodes (34): CreationRuntime, sameRuntime(), RuntimeReasoningEffort, isManagerEvent(), ManagerAutomaticContext, ManagerCheckCadenceMinutes, managerCheckCadences, ManagerConfirmation (+26 more)

### Community 39 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (10): headerSafe(), RemoteNodeClient, client(), servers, session, AudioTranscription, NodeInfo, RemovedQueuedPrompt (+2 more)

### Community 40 - "oracle-voice-routes.test.ts"
Cohesion: 0.05
Nodes (21): ActiveBackendSession, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, OracleVoiceManager, OracleVoiceRouteOptions, ObservedLocalVoiceBackend (+13 more)

### Community 41 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (12): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+4 more)

### Community 42 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 43 - "session-patch-browser.ts"
Cohesion: 0.08
Nodes (34): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+26 more)

### Community 44 - "ManagerSnapshot"
Cohesion: 0.08
Nodes (13): batchMessageId(), isTerminal(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, ProactiveManager, directories, FakeAgent, fixture() (+5 more)

### Community 46 - "OracleVoiceClient"
Cohesion: 0.15
Nodes (8): VoiceServerControl, captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, playbackClientError(), terminalCloseCode()

### Community 47 - "tmux-test-helpers.ts"
Cohesion: 0.11
Nodes (36): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+28 more)

### Community 48 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 49 - "session-directory.ts"
Cohesion: 0.12
Nodes (34): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+26 more)

### Community 50 - "DreamerService"
Cohesion: 0.14
Nodes (11): projectDreamerMemory(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), dreamerRunKey(), DreamerCompletionCandidate (+3 more)

### Community 51 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (41): addActivity(), attachmentModeValue(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, eventString() (+33 more)

### Community 52 - "DreamerStore"
Cohesion: 0.13
Nodes (11): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, emptyState(), isMissing() (+3 more)

### Community 53 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 54 - "pwa.ts"
Cohesion: 0.09
Nodes (38): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+30 more)

### Community 55 - "oracle-voice-config.ts"
Cohesion: 0.08
Nodes (28): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+20 more)

### Community 56 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (33): ManagerStatus, editQueuedManagerMessage(), getManager(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), phoneEnterCreatesNewline(), applyEvent() (+25 more)

### Community 57 - "dreamer-store.ts"
Cohesion: 0.07
Nodes (33): assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES, DREAMER_STAGING_PREFIX (+25 more)

### Community 58 - "ManagerStore"
Cohesion: 0.09
Nodes (8): openStore(), emptyState(), ManagerStore, open(), createManager(), StoredManager, createManager(), SecurityManager

### Community 59 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 60 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 61 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 62 - "ChildVoiceEngine"
Cohesion: 0.13
Nodes (8): benchmarkGroup(), ChildVoiceEngine, errorMessage(), matchesCancelled(), matchesSynthesis(), matchesUtterance(), rememberCancellation(), VoiceChildProcess

### Community 63 - ".sendAdmittedWithBackend"
Cohesion: 0.08
Nodes (6): commandShortcut(), isTerminalNotReadyRefusal(), stripAnsi(), terminalAnswerRefused(), TerminalSessionController, PendingPermission

### Community 64 - "manager-agent.test.ts"
Cohesion: 0.07
Nodes (15): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail(), FakeClient (+7 more)

### Community 65 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (38): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isAlreadyExists() (+30 more)

### Community 66 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (32): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+24 more)

### Community 67 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 68 - "transcription-service.ts"
Cohesion: 0.09
Nodes (23): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+15 more)

### Community 69 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 70 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 71 - "app.ts"
Cohesion: 0.08
Nodes (21): prefixes, session, trusted, untrusted, apps, directories, buildApp(), errorStatusCode() (+13 more)

### Community 72 - "dreamer-service.ts"
Cohesion: 0.09
Nodes (23): DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, apps, directories, boundedText(), DreamerPlannerExecutionInput, DreamerServiceOptions (+15 more)

### Community 73 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 74 - "ResidentVoiceWorker"
Cohesion: 0.14
Nodes (6): combinedTranscript(), pcm16ToFloat32(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceSynthesisRequest

### Community 75 - ".sendInternal"
Cohesion: 0.15
Nodes (26): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+18 more)

### Community 76 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 77 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 78 - "NodeIdentityStore"
Cohesion: 0.09
Nodes (16): fixture(), managers, releases, remote, session(), ComputerRegistry, DurableRegisteredComputer, LegacyRegisteredComputer (+8 more)

### Community 79 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (13): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+5 more)

### Community 80 - "EngineVoiceBackendSession"
Cohesion: 0.18
Nodes (5): asSessionError(), disconnectCause(), EngineVoiceBackendSession, sameUtterance(), VoiceSessionError

### Community 81 - "manager-store.ts"
Cohesion: 0.11
Nodes (18): JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), ManagerProactiveInboxObservation, PersistedCursor, JournalDraft, JournalEntry (+10 more)

### Community 82 - "node-routes.ts"
Cohesion: 0.07
Nodes (32): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema (+24 more)

### Community 83 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (29): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+21 more)

### Community 84 - "oracle-voice-child.ts"
Cohesion: 0.09
Nodes (26): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), float32ToPcm16() (+18 more)

### Community 85 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (31): AccentSetting, appearanceSettings, applySettingsChanges(), isRecord(), isSettingsRevision(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting (+23 more)

### Community 86 - "UserInputReplyInput"
Cohesion: 0.15
Nodes (7): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, PendingUserInput, UserInputReplyInput, deliveryUncertaintyFromError()

### Community 87 - "src/settings-profile.ts"
Cohesion: 0.09
Nodes (24): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, statuslineItems (+16 more)

### Community 88 - "registerSessionKnowledgeRoutes"
Cohesion: 0.11
Nodes (22): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+14 more)

### Community 89 - "manager-structured-memory-search.ts"
Cohesion: 0.11
Nodes (25): DreamerMemoryMetadataRecord, authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord() (+17 more)

### Community 90 - "ChatMessage"
Cohesion: 0.11
Nodes (15): nextVoiceControl(), BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, Client, Browser, seedOffset (+7 more)

### Community 91 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (17): apps, config, configFixture(), connect(), Inbox, issueTicket(), localRuntime(), otherAllowed (+9 more)

### Community 92 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 93 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (26): openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_QUERY_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_RECORDS (+18 more)

### Community 94 - "push-notification-service.ts"
Cohesion: 0.13
Nodes (20): trusted, brief(), OracleEventSource, PushPolicy, PushSender, PushState, RFC-8030, alertNotification() (+12 more)

### Community 95 - "oracle-voice-benchmark.ts"
Cohesion: 0.11
Nodes (25): BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, derived(), execFileAsync (+17 more)

### Community 96 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (13): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+5 more)

### Community 97 - "manager-agent.ts"
Cohesion: 0.13
Nodes (19): automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, messagePriority(), Rung, SCHEDULE_RETRY_DELAYS_MS, TURN_ACTIVITY (+11 more)

### Community 98 - "ManagerStructuredMemoryStore"
Cohesion: 0.15
Nodes (10): capturePrompt(), benchmarkState(), now(), openFixture(), searchSamples(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore (+2 more)

### Community 99 - "manager-routes.ts"
Cohesion: 0.10
Nodes (19): confirmationSchema, defaultsSchema, editSchema, effort, managerCadence, managerInputError(), ManagerRouteAgent, messageParams (+11 more)

### Community 100 - "settings-profile-store.ts"
Cohesion: 0.13
Nodes (17): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+9 more)

### Community 101 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 102 - "oracle-voice-worker.ts"
Cohesion: 0.11
Nodes (23): VoiceWorkerOptions, VoiceEndUtterance, VoiceStartUtterance, BlockingEngine, capabilityFromConfig(), exactKeys(), isCancelledEvent(), isEnabledConfig() (+15 more)

### Community 103 - "oracle-voice-routes.ts"
Cohesion: 0.14
Nodes (24): limits(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode(), closeReason(), disconnectCause() (+16 more)

### Community 104 - "PushNotificationService"
Cohesion: 0.20
Nodes (3): PushNotificationService, scoped(), registerPushRoutes()

### Community 105 - "RemoteVoiceClient"
Cohesion: 0.19
Nodes (10): closeReason(), exactArrayBuffer(), rawDataBuffer(), remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient, RemoteVoiceClientOptions, RemoteVoiceDisconnectError (+2 more)

### Community 106 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 107 - "client.ts"
Cohesion: 0.09
Nodes (14): closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, OracleVoicePlayback, parseHello() (+6 more)

### Community 108 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.11
Nodes (12): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+4 more)

### Community 109 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 110 - "ManagerAssistant.test.tsx"
Cohesion: 0.09
Nodes (12): cancelManager(), removeQueuedManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, conversationCapability, empty (+4 more)

### Community 111 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 112 - "manager-context.ts"
Cohesion: 0.17
Nodes (18): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+10 more)

### Community 113 - "oracle-voice-segments.ts"
Cohesion: 0.16
Nodes (21): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+13 more)

### Community 114 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 115 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 116 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 117 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 118 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 119 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 120 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 121 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 122 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 123 - "manager-structured-memory-store.ts"
Cohesion: 0.21
Nodes (8): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStoreOptions, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput

### Community 124 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 125 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 126 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 127 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 128 - "recovery-resend-durability.test.ts"
Cohesion: 0.12
Nodes (14): directories, disk, fixture(), gate(), gates, httpBoundary(), initialize(), PublicSessionValue (+6 more)

### Community 129 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 130 - "agent-service.test.ts"
Cohesion: 0.16
Nodes (12): terminalFormSteps(), busyTerminal(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService(), services (+4 more)

### Community 132 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 133 - ".observe"
Cohesion: 0.19
Nodes (7): ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 134 - "submission-error.ts"
Cohesion: 0.14
Nodes (13): BuildAppOptions, directories, runtimes, start(), trusted, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt() (+5 more)

### Community 135 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 136 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 137 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 138 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 139 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 140 - "capture"
Cohesion: 0.18
Nodes (16): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+8 more)

### Community 141 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 142 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 143 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): provider(), activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession() (+8 more)

### Community 144 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane(), Phase (+3 more)

### Community 145 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 146 - "react"
Cohesion: 0.19
Nodes (8): react, transcribeAudio(), drawDiagram(), drawing, MermaidDiagram(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 147 - "DeferredSession"
Cohesion: 0.15
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 148 - "manager-runtime.ts"
Cohesion: 0.24
Nodes (11): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+3 more)

### Community 149 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 150 - "OracleVoiceClientOptions"
Cohesion: 0.21
Nodes (4): OracleVoiceClientOptions, OracleVoiceUiState, FakeVoiceClient, transcript()

### Community 151 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 152 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 153 - "recordValue"
Cohesion: 0.22
Nodes (14): backgroundHandoff(), booleanValue(), errorValue(), notificationKind(), parsedValue(), rawTailText(), recordValue(), shellIdFromFooter() (+6 more)

### Community 154 - "session-resource-providers.test.ts"
Cohesion: 0.22
Nodes (13): claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures (+5 more)

### Community 155 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 156 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 157 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 158 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 159 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 160 - "session-clear-transcript.test.ts"
Cohesion: 0.17
Nodes (8): Admission, ExclusiveAdmission, PendingQueueAdmission, disk, fixtures, gate(), holdTurnWrite(), releases

### Community 161 - "use-oracle-conversation.test.tsx"
Cohesion: 0.24
Nodes (9): getOracleVoiceCapabilities(), OracleVoiceTranscriptEvent, OracleConversation, OracleConversationState, availableCapability, defaults, renderConversation(), voiceClientConstructor (+1 more)

### Community 162 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 163 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 164 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 165 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 166 - "send-policy.test.ts"
Cohesion: 0.20
Nodes (10): SessionExecutionMode, TerminalSendPolicyInput, TerminalSendRequestOptions, booleans, combinations, executionModes, providers, replacing (+2 more)

### Community 167 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 168 - "benchmarkFixture"
Cohesion: 0.25
Nodes (9): benchmarkFixture(), deferred(), firstTtsSegment(), maybeMeasured(), measured(), measureSttPass(), measureTts(), missing() (+1 more)

### Community 169 - "HubEvent"
Cohesion: 0.20
Nodes (5): ComputerManagerEvents, HubEventSource, directories, RFC-8030, HubEvent

### Community 170 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.24
Nodes (4): initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, ManagerStructuredMemoryMode, ManagerStructuredMemoryStatus

### Community 171 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 172 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 173 - "file-upload-routes.ts"
Cohesion: 0.29
Nodes (6): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile()

### Community 174 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 175 - "SpeakableSegmenter"
Cohesion: 0.29
Nodes (3): SpeakableSegmenter, validateMessageId(), ./server/oracle-voice-segments.ts

### Community 176 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 177 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 178 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 179 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 182 - "settings-profile.test.ts"
Cohesion: 0.25
Nodes (4): resolveAppearance(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 183 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 184 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 185 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 186 - "session-patch-routes.test.ts"
Cohesion: 0.29
Nodes (5): apps, directories, FakeManager, fixture(), trusted

### Community 187 - "vad-assets.ts"
Cohesion: 0.32
Nodes (7): browserBaseUrl(), directory(), localAssetUrl(), ORACLE_VOICE_ONNX_WASM_BASE_PATH, ORACLE_VOICE_VAD_ASSETS, ORACLE_VOICE_VAD_BASE_PATH, sharedAssetDirectory()

### Community 189 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 190 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 191 - "VoiceGenerationIdentity"
Cohesion: 0.43
Nodes (4): matchesCancelled(), VoiceGenerationIdentity, ActiveSynthesisIdentity, ActiveUtteranceIdentity

### Community 192 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 193 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 195 - "oracle-voice-benchmark.test.ts"
Cohesion: 0.47
Nodes (4): normalizeTranscript(), parsePcm16Wave(), verifyCorpus(), wordErrorRate()

### Community 196 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 198 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 199 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 200 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 201 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

## Knowledge Gaps
- **1161 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1156 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1957 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `recovery-resend-durability.test.ts`, `session-resource-routes.test.ts`, `SessionDetail`, `SessionStore`, `agent-service.ts`, `computer-manager.ts`, `claude-agent-service.ts`, `.readBackgroundTasks`, `CopilotSessionLike`, `UserInputReplyInput`, `.sendAdmittedWithBackend`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `SessionDetail`, `agent-service.ts`, `claude-agent-service.ts`, `UserInputReplyInput`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `registerOracleVoiceRoutes()` connect `oracle-voice-routes.ts` to `OracleVoiceCoordinator`, `oracle-voice-tickets.ts`, `oracle-voice.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1161 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03653674780732611 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.026212590299277607 - nodes in this community are weakly interconnected._
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
- `docs/design/oracle-conversation-mode.md`
- `docs/design/oracle-dreamer.md`
- `docs/design/oracle-durable-ux.md`
- `docs/design/oracle-proactive-inbox.md`
- `docs/design/session-manager.md`
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
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-17-oracle-proactive-lifecycle-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
- `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`
- `docs/superpowers/specs/2026-11-04-oracle-periodic-checks-design.md`
- `docs/superpowers/specs/2026-11-05-session-knowledge-api-design.md`
- `docs/superpowers/specs/2026-11-06-oracle-actionable-morning-plan-design.md`
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
- `src/index.css`
- `config/oracle-voice-profiles.json`
