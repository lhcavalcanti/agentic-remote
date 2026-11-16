# Agentic Remote - Graphify code map

Snapshot: `9e2da64b0685b7f980882059a559eb1f00f621dc725a9777736bc7f8c4b47e13`

Source checkout: `9e67e3f9c2151f08bd3c4bd5d9f58d24f71c98ce`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 457 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 457 files · ~952,254 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7651 nodes · 21206 edges · 239 communities (192 shown, 29 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1099 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- api.ts
- App.tsx
- multi-node.test.ts
- SessionDetail
- ClaudeAgentService
- oracle-voice-session.ts
- session-store.ts
- agent-service.ts
- sessionKey
- client.ts
- claude-agent-service.ts
- manager-tools.ts
- oracle-voice-soak.ts
- agent-service.test.ts
- oracle-voice-routes.test.ts
- manager.ts
- dreamer-store.ts
- agentic-remote-promotion-monitor
- terminal-session.ts
- OracleVoiceCoordinator
- manager-agent.ts
- ManagerAgent
- app.ts
- SessionService
- oracle-voice.ts
- registerHubRoutes
- transcription-service.ts
- PushNotificationService
- contracts.ts
- VoiceCapture
- manager-structured-memory-validation.ts
- oracle-voice-integration.test.ts
- tmux-test-helpers.ts
- active-sessions.ts
- hub-routes.ts
- .sendInternal
- session-knowledge-store.ts
- DreamerService
- oracle-task-store.ts
- session-knowledge-routes.test.ts
- OracleDreamer.tsx
- agentic-remote
- ProviderSessionService
- TmuxTerminalSessionController
- FakeVoiceController
- ManagerStore
- oracle-voice-benchmark.ts
- session-directory.ts
- dreamer-progress.ts
- agentic-remote-gate
- KnowledgeStore
- bundle
- server/side-question.ts
- FakeSessionService
- oracle-voice-child.ts
- ResidentVoiceWorker
- VoiceAudioFrame
- UserInputReplyInput
- pwa.ts
- FakeVoiceEngine
- ManagerAssistant.tsx
- ChildVoiceEngine
- client.test.ts
- shell.ts
- lib.rs
- ComputerSummary
- agentic-remote-promotion-setup
- workspace-fixtures.ts
- terminal-startup-queue.test.ts
- manager-proactive-inbox.ts
- dependencies
- devDependencies
- config.rs
- recovery-resend-durability.test.ts
- oracle-voice-child.test.ts
- setupWorkspaceFixture
- terminal-session.test.ts
- EngineVoiceBackendSession
- normalizeKnowledgeRelativePath
- dreamer-planner.ts
- manager-context.ts
- manager-store.ts
- manager-structured-memory.ts
- oracle-voice-security.test.ts
- oracle-voice-segments.ts
- SessionOrderStore
- capture-workspace.ts
- dreamer-service.ts
- VoicePlayback
- registerSessionKnowledgeRoutes
- ManagerAttachment
- shared/settings-profile.ts
- src/settings-profile.ts
- HubEvent
- ManagedSession
- ManagerStructuredMemoryStore
- send-matrix.integration.test.ts
- ManagerAssistant.test.tsx
- pipeline.ts
- renderer.ts
- session-patch-browser.ts
- background-task-adapter.ts
- backgroundTasksFromEvents
- cli-canary.ts
- scripts
- manager-structured-memory-search.ts
- oracle-voice-worker.ts
- use-markdown-document.ts
- compilerOptions
- closed-sessions.ts
- PromptCards.tsx
- SettingsProfileClient
- .discoverSessions
- oracle-voice-tickets.ts
- session-reply-durability.test.ts
- settings-profile-store.ts
- compilerOptions
- full-gate.test.ts
- .observe
- pipeline.test.tsx
- terminal-form-deadline.test.ts
- compilerOptions
- ManagerProactiveInbox
- session-store-providers.test.ts
- OnlineRecognizer
- markdown-navigation.ts
- hub-sign-in.ts
- MessageTime.tsx
- compilerOptions
- VoiceEngineSession
- compilerOptions
- session-resource-routes.test.ts
- .correct
- knowledge-tree.ts
- react
- ManagerMemory
- promotion-monitor.test.ts
- SettingsProfileSnapshot
- WorkspaceDialog
- BoundedQueue
- ReaderWorkspace
- VoiceBackendSession
- manager-automatic.ts
- session-latency-benchmark.ts
- dreamer-schedule.ts
- startup-phases.test.ts
- background-task-stop.test.ts
- queued-dispatch.test.ts
- server/session-patches.ts
- check-workspace-review-regressions.ts
- package.json
- scripts
- oracle-voice-assets.test.ts
- processAttachedFiles
- use-oracle-settings.ts
- pending-echo.ts
- fake-vad.ts
- desktop.json
- session-resource-clear.test.ts
- theme-contrast.test.ts
- settings-local.json
- dreamer-service.test.ts
- document-render.pw.ts
- background-task-tracker.ts
- manager-proactive-inbox.test.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- OracleVoiceClientDependencies
- sign-in-expired.pw.ts
- DeferredSession
- use-oracle-attachments.ts
- dataset
- .oxlintrc.json
- generate-pwa-icons.ts
- .createSession
- copilot-sdk-client.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- vite.config.ts
- dreamer-routes.ts
- promotion-setup-execution.test.ts
- SessionAdmissions
- sent-message.ts
- backgroundHandoff
- doctor-cli.test.ts
- logs-cli.test.ts
- recovery-context.ts
- release-publication.test.ts
- session-response-order.test.ts
- oracle-conversation-real.test.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- DocumentViewControls.tsx
- composer-layout.test.ts
- usePanelWidth
- promotion-setup.test.ts
- FakeRecorder
- FakeRecorder
- MockMediaRecorder
- version-policy.test.ts
- MockWebSocket
- MermaidDiagram.test.tsx
- tsconfig.json
- @fastify/multipart
- @fastify/static
- @fastify/websocket
- ffmpeg-static
- hast-util-to-jsx-runtime
- html-url-attributes
- lucide-react
- onnxruntime-web
- mermaid
- pdfjs-dist
- unified
- unist-util-visit
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 327 edges
2. `App()` - 321 edges
3. `AgentService` - 297 edges
4. `SessionStore` - 194 edges
5. `ManagedSession` - 137 edges
6. `ClaudeAgentService` - 130 edges
7. `registerHubRoutes()` - 99 edges
8. `ManagerAgent` - 98 edges
9. `buildApp()` - 96 edges
10. `ComputerManager` - 91 edges

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

## Communities (239 total, 29 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (25): agentMode(), AgentService, isTerminalNotReadyRefusal(), isUncertainDelivery(), lifecycleRefusal(), sessionInUseConflictMessage(), suspendedRuntimeConflict(), suspendRefused() (+17 more)

### Community 1 - "App"
Cohesion: 0.02
Nodes (185): isManagerEvent(), terminalSendOptions(), submissionReceiptFromError(), replyPermission(), saveHiddenSessionVisibility(), saveSessionHidden(), saveSessionVisibility(), activeComposerPastes() (+177 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (130): SessionKnowledgeBinding, SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), addKnowledgeRoot(), askSession(), bootstrapSessionOrder() (+122 more)

### Community 3 - "App.tsx"
Cohesion: 0.02
Nodes (120): addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+112 more)

### Community 4 - "multi-node.test.ts"
Cohesion: 0.03
Nodes (45): ClaudeAgentServiceEvents, RemoteResync, RemoteSessionRead, DirectoryScope, directories, voiceControlQueues, voiceControlWaiters, AUDIO_FILENAME_HEADER (+37 more)

### Community 5 - "SessionDetail"
Cohesion: 0.05
Nodes (33): fixture(), recoveryFixture(), fixture(), fixture(), channels, directories, fixture(), observe() (+25 more)

### Community 6 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (21): ClaudeAgentService, isMissingClaudeSessionError(), claudeFixture(), answer(), claudeRequest(), copilotRequest(), claudeFixture(), ClaudeMcpRead (+13 more)

### Community 7 - "oracle-voice-session.ts"
Cohesion: 0.04
Nodes (78): ActiveBackendSession, FakeVoiceState, installFakeBrowserVoice(), ScriptedUtterance, Window, sendNodeVoiceOutput(), backendDisconnectFromError(), disconnectCause() (+70 more)

### Community 8 - "session-store.ts"
Cohesion: 0.03
Nodes (84): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), connect() (+76 more)

### Community 9 - "agent-service.ts"
Cohesion: 0.04
Nodes (83): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+75 more)

### Community 10 - "sessionKey"
Cohesion: 0.04
Nodes (84): closedSessionExpiresAt(), listClosedSessions(), cancelSelectedBackgroundTask(), deleteClosedSession(), handleDragEnd(), openSessionResources(), toggleSelectedSessionMute(), readSelectionFromLocation() (+76 more)

### Community 11 - "client.ts"
Cohesion: 0.05
Nodes (36): ORACLE_VOICE_CONNECTION_TIMEOUT_MS, getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord() (+28 more)

### Community 12 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (69): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+61 more)

### Community 13 - "manager-tools.ts"
Cohesion: 0.04
Nodes (53): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), changeSuspension() (+45 more)

### Community 14 - "oracle-voice-soak.ts"
Cohesion: 0.04
Nodes (38): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+30 more)

### Community 15 - "agent-service.test.ts"
Cohesion: 0.03
Nodes (50): CopilotClientLike, CopilotSessionLike, terminalFormSteps(), busyTerminal(), closableService(), configurableModel(), directories, FakeCopilotClient (+42 more)

### Community 16 - "oracle-voice-routes.test.ts"
Cohesion: 0.04
Nodes (51): clockTicksPerSecond(), execFileAsync, GenerationMetrics, RealMetrics, WorkerProcessSample, buildConfig(), engine, integerEnvironment() (+43 more)

### Community 17 - "manager.ts"
Cohesion: 0.04
Nodes (36): FakeManager, apps, directories, ProactiveManager, FakeAgent, confirmationSchema, defaultsSchema, editSchema (+28 more)

### Community 18 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (46): validateDreamerTimeZone(), assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS (+38 more)

### Community 19 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 20 - "terminal-session.ts"
Cohesion: 0.05
Nodes (75): afterExit(), boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus() (+67 more)

### Community 21 - "OracleVoiceCoordinator"
Cohesion: 0.07
Nodes (15): ManagerEventSource, AudioCompletion, AudioGate, errorMessage(), OperationTimeoutError, OracleVoiceCoordinator, OracleVoiceCoordinatorOptions, PendingFinalTurn (+7 more)

### Community 22 - "manager-agent.ts"
Cohesion: 0.04
Nodes (41): DreamerProgressView, automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession (+33 more)

### Community 23 - "ManagerAgent"
Cohesion: 0.08
Nodes (14): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+6 more)

### Community 24 - "app.ts"
Cohesion: 0.05
Nodes (52): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), transcriptionComputerName() (+44 more)

### Community 25 - "SessionService"
Cohesion: 0.04
Nodes (29): closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+21 more)

### Community 26 - "oracle-voice.ts"
Cohesion: 0.07
Nodes (47): VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient (+39 more)

### Community 27 - "registerHubRoutes"
Cohesion: 0.10
Nodes (8): ComputerManager, managedSession(), mapWithConcurrency(), fixture(), session(), sessionAtLeastAsNew(), registerHubRoutes(), ManagedRemovedQueuedPrompt

### Community 28 - "transcription-service.ts"
Cohesion: 0.05
Nodes (36): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+28 more)

### Community 29 - "PushNotificationService"
Cohesion: 0.07
Nodes (29): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+21 more)

### Community 30 - "contracts.ts"
Cohesion: 0.04
Nodes (48): closable(), provider(), idleDaysSchema, mergeSessionRetention(), sessionRetentionPatchSchema, sessionRetentionSchema, ActivityStatus, AddKnowledgeRootInput (+40 more)

### Community 31 - "VoiceCapture"
Cohesion: 0.07
Nodes (13): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, VoiceVadOptions, FakeCapture (+5 more)

### Community 32 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 33 - "oracle-voice-integration.test.ts"
Cohesion: 0.05
Nodes (28): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+20 more)

### Community 34 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (47): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, [root], assertSameIdentity() (+39 more)

### Community 35 - "active-sessions.ts"
Cohesion: 0.07
Nodes (50): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+42 more)

### Community 36 - "hub-routes.ts"
Cohesion: 0.04
Nodes (43): ClientPresence, PRESENCE_TTL_MS, addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+35 more)

### Community 37 - ".sendInternal"
Cohesion: 0.10
Nodes (41): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+33 more)

### Community 38 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (29): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+21 more)

### Community 39 - "DreamerService"
Cohesion: 0.12
Nodes (10): DreamerMemoryMetadata, boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs() (+2 more)

### Community 40 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (33): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+25 more)

### Community 41 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (28): ServerRole, managers, releases, remote, SessionMetadataLookup, ComputerRegistry, DurableRegisteredComputer, LegacyRegisteredComputer (+20 more)

### Community 42 - "OracleDreamer.tsx"
Cohesion: 0.08
Nodes (43): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+35 more)

### Community 43 - "agentic-remote"
Cohesion: 0.10
Nodes (45): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), diagnostic_node() (+37 more)

### Community 45 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (12): startAgentAfterClear(), composer(), processAdapter, awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, processAncestors() (+4 more)

### Community 46 - "FakeVoiceController"
Cohesion: 0.07
Nodes (7): beginSpeech(), BrowserTestSessionService, endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 47 - "ManagerStore"
Cohesion: 0.08
Nodes (11): openStore(), emptyState(), ManagerStore, open(), createManager(), createRealManager(), DeterministicManagerClient, deterministicManagerHub() (+3 more)

### Community 48 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (39): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, deferred() (+31 more)

### Community 49 - "session-directory.ts"
Cohesion: 0.11
Nodes (36): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), assertOpenedDirectory(), assertOpenedDirectoryPath(), assertSafeResolvedKnowledgePath() (+28 more)

### Community 50 - "dreamer-progress.ts"
Cohesion: 0.09
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 51 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 52 - "KnowledgeStore"
Cohesion: 0.09
Nodes (20): WorkspaceFixtureState, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState (+12 more)

### Community 53 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 54 - "server/side-question.ts"
Cohesion: 0.08
Nodes (12): removeCopilotSessionFiles(), forgetSessionEvents(), SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt() (+4 more)

### Community 55 - "FakeSessionService"
Cohesion: 0.07
Nodes (5): FakeSessionService, routingFixture(), session(), temporaryDirectory(), AgentMode

### Community 56 - "oracle-voice-child.ts"
Cohesion: 0.07
Nodes (35): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, defaultSpawnPiper(), errorMessage(), float32ToPcm16() (+27 more)

### Community 57 - "ResidentVoiceWorker"
Cohesion: 0.12
Nodes (9): combinedTranscript(), matchesCancelled(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceGenerationIdentity, VoiceSynthesisRequest, ActiveSynthesisIdentity (+1 more)

### Community 58 - "VoiceAudioFrame"
Cohesion: 0.06
Nodes (25): QueuedAudio, BrowserCaptureOptions, AudioReservation, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, ORACLE_VOICE_SAMPLE_RATE (+17 more)

### Community 59 - "UserInputReplyInput"
Cohesion: 0.10
Nodes (3): persistedFormAnswer(), validateUserInputForm(), UserInputReplyInput

### Community 60 - "pwa.ts"
Cohesion: 0.09
Nodes (38): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), retryHubCopilotModels() (+30 more)

### Community 61 - "FakeVoiceEngine"
Cohesion: 0.08
Nodes (15): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+7 more)

### Community 62 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (33): resetManager(), phoneEnterCreatesNewline(), ActivityRow, applyEvent(), canTakeFocus(), ConfirmationCard, conversationStateLabel(), ManagerAssistant() (+25 more)

### Community 63 - "ChildVoiceEngine"
Cohesion: 0.12
Nodes (8): benchmarkGroup(), ChildVoiceEngine, errorMessage(), matchesCancelled(), matchesSynthesis(), matchesUtterance(), rememberCancellation(), VoiceChildProcess

### Community 64 - "client.test.ts"
Cohesion: 0.07
Nodes (14): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse() (+6 more)

### Community 65 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 66 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 67 - "ComputerSummary"
Cohesion: 0.12
Nodes (13): DreamerServiceOptions, batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, SessionLifecycle (+5 more)

### Community 68 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 69 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (27): frame(), geometry, output, scratch, screenshot(), { values }, documents, FIXTURE_NOW (+19 more)

### Community 70 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (28): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+20 more)

### Community 71 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), DISPOSITIONS, eventId(), hasExactKeys(), isAlreadyExists(), isDisposition(), isEventKind() (+29 more)

### Community 72 - "dependencies"
Cohesion: 0.05
Nodes (37): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, ffprobe-static, @github/copilot-sdk, dependencies (+29 more)

### Community 73 - "devDependencies"
Cohesion: 0.05
Nodes (37): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+29 more)

### Community 74 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 75 - "recovery-resend-durability.test.ts"
Cohesion: 0.06
Nodes (27): holdProbe(), fixtures, gate(), releases, restart(), sdkPermissionEvents(), sdkRecoveryEvents(), directories (+19 more)

### Community 76 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (14): createVoiceWorker(), PiperProcess, childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream (+6 more)

### Community 77 - "setupWorkspaceFixture"
Cohesion: 0.08
Nodes (22): desktop, devices, long, open(), phone, veryLong, bounds(), closedEarlier (+14 more)

### Community 78 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (25): parseTerminalUpdateNotice(), safeWindowName(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), deliveryFixture(), desktopInstallPane, directories (+17 more)

### Community 79 - "EngineVoiceBackendSession"
Cohesion: 0.18
Nodes (5): asSessionError(), disconnectCause(), EngineVoiceBackendSession, sameUtterance(), VoiceSessionError

### Community 80 - "normalizeKnowledgeRelativePath"
Cohesion: 0.11
Nodes (31): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), activateSession(), createSession() (+23 more)

### Community 81 - "dreamer-planner.ts"
Cohesion: 0.11
Nodes (30): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+22 more)

### Community 82 - "manager-context.ts"
Cohesion: 0.12
Nodes (27): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+19 more)

### Community 83 - "manager-store.ts"
Cohesion: 0.11
Nodes (18): JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), ManagerProactiveInboxObservation, PersistedCursor, JournalDraft, JournalEntry (+10 more)

### Community 84 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (28): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+20 more)

### Community 85 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (20): FakeVoiceEngineCall, SocketMessage, apps, config, configFixture(), connect(), Inbox, issueTicket() (+12 more)

### Community 86 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 87 - "SessionOrderStore"
Cohesion: 0.14
Nodes (13): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+5 more)

### Community 88 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 89 - "dreamer-service.ts"
Cohesion: 0.12
Nodes (28): DreamerPlanDraft, DreamerPlannerInput, DreamerFollowUp, DreamerPlannerExecutionInput, safeRunError(), unavailableSnapshot(), DreamerStoreSnapshot, OracleTaskFindingInput (+20 more)

### Community 90 - "VoicePlayback"
Cohesion: 0.13
Nodes (6): pcm16ToFloat(), SegmentDrain, FakeSource, harness(), validateGeneration(), VoicePlayback

### Community 91 - "registerSessionKnowledgeRoutes"
Cohesion: 0.11
Nodes (22): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+14 more)

### Community 92 - "ManagerAttachment"
Cohesion: 0.14
Nodes (17): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+9 more)

### Community 93 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (28): AccentSetting, appearanceSettings, applySettingsChanges(), DEFAULT_SESSION_PROVIDER, isRecord(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting (+20 more)

### Community 94 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (24): AppearanceSetting, isSettingsRevision(), NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance (+16 more)

### Community 95 - "HubEvent"
Cohesion: 0.12
Nodes (14): Connection, WorkspaceFixture, ComputerManagerEvents, Client, PatchSocket, Browser, seedOffset, StoredSession (+6 more)

### Community 96 - "ManagedSession"
Cohesion: 0.14
Nodes (5): RemoteSessionListing, ManagerHub, FakeManager, ManagedSession, SessionListing

### Community 97 - "ManagerStructuredMemoryStore"
Cohesion: 0.13
Nodes (10): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open() (+2 more)

### Community 98 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (24): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+16 more)

### Community 99 - "ManagerAssistant.test.tsx"
Cohesion: 0.08
Nodes (19): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton() (+11 more)

### Community 100 - "pipeline.ts"
Cohesion: 0.12
Nodes (22): holdingRenderer(), openKnowledgeReadme(), openSessionReadme(), partlyHeldRenderer(), render(), documentOpening(), documentParts(), documentRenderEvents() (+14 more)

### Community 101 - "renderer.ts"
Cohesion: 0.11
Nodes (15): render, scope, DocumentRenderEvent, RenderedDocumentTree, createWorkerRenderer(), defaultDocumentRenderer(), DocumentRenderer, DocumentRendererContext (+7 more)

### Community 102 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 103 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (25): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus() (+17 more)

### Community 104 - "backgroundTasksFromEvents"
Cohesion: 0.19
Nodes (27): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventString(), eventTask(), executionModeValue(), lastForegroundCompletionAt() (+19 more)

### Community 105 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 106 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 107 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 108 - "oracle-voice-worker.ts"
Cohesion: 0.10
Nodes (16): VoiceSttEngine, VoiceTtsEngine, capabilityFromConfig(), exactKeys(), isCancelledEvent(), isEnabledConfig(), isNonEmptyString(), isRecord() (+8 more)

### Community 109 - "use-markdown-document.ts"
Cohesion: 0.16
Nodes (19): documentJsx(), build(), childrenOf(), DocumentDrawing, drawStep(), elementsFor(), emptyDrawing, finishDrawing() (+11 more)

### Community 110 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 111 - "closed-sessions.ts"
Cohesion: 0.12
Nodes (10): CLOSED_SESSION_SWEEP_INTERVAL_MS, ClosedSessionOwner, ClosedSessionSweeper, now, CLOSED_SESSION_RETENTION_MS, closedSessionContext(), excerpt(), isClosedSessionContext() (+2 more)

### Community 112 - "PromptCards.tsx"
Cohesion: 0.13
Nodes (20): PendingUserInput, UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question (+12 more)

### Community 113 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 115 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 116 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (17): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+9 more)

### Community 117 - "settings-profile-store.ts"
Cohesion: 0.16
Nodes (10): SettingsProfileState, applySettingsImport(), isSettingsProfileKey(), SettingsProfileRecord, validateSettingsImport(), seedHubSettings(), settingsProfileCacheKey, cached() (+2 more)

### Community 118 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 119 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 120 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 121 - "pipeline.test.tsx"
Cohesion: 0.14
Nodes (13): components, drawn(), drawnPage(), fixtures, html(), today(), wholePage(), rehypeDocumentHeadings() (+5 more)

### Community 122 - "terminal-form-deadline.test.ts"
Cohesion: 0.12
Nodes (15): TerminalFormContinuation, question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture() (+7 more)

### Community 123 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 124 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 125 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession() (+1 more)

### Community 126 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 127 - "markdown-navigation.ts"
Cohesion: 0.19
Nodes (18): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+10 more)

### Community 128 - "hub-sign-in.ts"
Cohesion: 0.17
Nodes (15): changed(), frames, innermostDialogFrame(), listeners, openDialogFrame(), subscribeDialogFrames(), DialogFrame(), snapshot (+7 more)

### Community 129 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 130 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 131 - "VoiceEngineSession"
Cohesion: 0.18
Nodes (6): InstrumentedRealEngine, processExists(), readWorkerProcessSample(), registerControlRoutes(), startServer(), VoiceEngineSession

### Community 132 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 133 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 134 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 135 - "knowledge-tree.ts"
Cohesion: 0.19
Nodes (16): knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs(), KnowledgeFolders (+8 more)

### Community 136 - "react"
Cohesion: 0.13
Nodes (11): plugins, oxc, react, typescript, MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram() (+3 more)

### Community 137 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 138 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 139 - "SettingsProfileSnapshot"
Cohesion: 0.18
Nodes (7): profileStore(), SettingsProfileStore, directories, store(), isSettingsDeviceId(), SettingsProfileSnapshot, SettingsProfileTransport

### Community 140 - "WorkspaceDialog"
Cohesion: 0.18
Nodes (16): executeCommand(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), missingDocumentFragment(), workspaceAbsolutePath() (+8 more)

### Community 141 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 142 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 143 - "VoiceBackendSession"
Cohesion: 0.14
Nodes (6): exactArrayBuffer(), rawDataBuffer(), receiveNodeVoiceMessage(), ObservedLocalVoiceBackend, RouteVoiceBackend, VoiceBackendSession

### Community 144 - "manager-automatic.ts"
Cohesion: 0.19
Nodes (13): automaticTurns(), event(), formatProactivePrompt(), MANAGER_PROACTIVE_EVENT_KINDS, ManagerProactiveEventKind, ProactivePromptEvent, proactivePromptEvents(), failed (+5 more)

### Community 145 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 146 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (15): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+7 more)

### Community 147 - "startup-phases.test.ts"
Cohesion: 0.13
Nodes (11): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseRecord, address, directories, recorder() (+3 more)

### Community 148 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 149 - "queued-dispatch.test.ts"
Cohesion: 0.14
Nodes (9): accept(), deferred(), disk, fixture(), fixtures, holdWrite(), prompt(), releases (+1 more)

### Community 150 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 151 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 152 - "package.json"
Cohesion: 0.13
Nodes (13): directory, { values }, workflows, engines, node, name, packageManager, pnpm (+5 more)

### Community 153 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 154 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 155 - "processAttachedFiles"
Cohesion: 0.19
Nodes (14): extension(), MAX_SESSION_FILE_BYTES, sessionFileValidationError(), supportedExtensions, supportsSessionFile(), attachedFiles(), audioDropped(), audioFileChanged() (+6 more)

### Community 156 - "use-oracle-settings.ts"
Cohesion: 0.24
Nodes (12): getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+4 more)

### Community 157 - "pending-echo.ts"
Cohesion: 0.24
Nodes (11): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, PendingEchoOwner, prunePendingEchoMap() (+3 more)

### Community 158 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 159 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 160 - "session-resource-clear.test.ts"
Cohesion: 0.19
Nodes (13): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+5 more)

### Community 161 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 162 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 163 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 165 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 166 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 167 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 168 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 169 - "OracleVoiceClientDependencies"
Cohesion: 0.22
Nodes (3): pageFor(), defaultDependencies(), OracleVoiceClientDependencies

### Community 170 - "sign-in-expired.pw.ts"
Cohesion: 0.18
Nodes (4): desktop, Layout, layouts, phone

### Community 172 - "use-oracle-attachments.ts"
Cohesion: 0.36
Nodes (10): uploadManagerFile(), DraftAttachment, hasBlockingAttachments(), uploadedReferences(), useOracleAttachments(), drain(), intake(), remove() (+2 more)

### Community 173 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 174 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 175 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 177 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 178 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 179 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 180 - "vite.config.ts"
Cohesion: 0.20
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 181 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 182 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 184 - "sent-message.ts"
Cohesion: 0.42
Nodes (5): UserMessage, PauseFollowingContext, sentMessageLength, SentMessageContent(), thirteenLines

### Community 185 - "backgroundHandoff"
Cohesion: 0.32
Nodes (8): attachmentModeValue(), backgroundHandoff(), booleanValue(), rawTailText(), shellIdFromFooter(), shellStopAcknowledged(), shellTaskMode(), toolTelemetryProperties()

### Community 186 - "doctor-cli.test.ts"
Cohesion: 0.32
Nodes (6): Check, checks(), exec, fixture(), fixtures, manifest

### Community 187 - "logs-cli.test.ts"
Cohesion: 0.29
Nodes (6): epoch, exec, Explanation, fixture(), Log, roots

### Community 188 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 189 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 190 - "session-response-order.test.ts"
Cohesion: 0.32
Nodes (7): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), projectSessionResponse(), sessionResponseStartedAt(), failure, session

### Community 192 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 193 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 194 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 195 - "DocumentViewControls.tsx"
Cohesion: 0.33
Nodes (3): DocumentViewControls(), actions, outline

### Community 196 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 197 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 198 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1271 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1266 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2149 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionDetail`, `ClaudeAgentService`, `SettingsProfileSnapshot`, `oracle-voice-soak.ts`, `oracle-voice-routes.test.ts`, `manager.ts`, `manager-agent.ts`, `ManagerAgent`, `SessionService`, `registerHubRoutes`, `transcription-service.ts`, `PushNotificationService`, `hub-routes.ts`, `session-knowledge-store.ts`, `DreamerService`, `oracle-task-store.ts`, `session-knowledge-routes.test.ts`, `ProviderSessionService`, `ManagerStore`, `KnowledgeStore`, `dreamer-routes.ts`, `ChildVoiceEngine`, `ComputerSummary`, `manager-store.ts`, `SessionOrderStore`, `ManagerStructuredMemoryStore`, `cli-canary.ts`, `ManagerProactiveInbox`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `runSoak()` connect `oracle-voice-soak.ts` to `app.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `multi-node.test.ts`, `SessionDetail`, `session-resource-routes.test.ts`, `agent-service.ts`, `recovery-resend-durability.test.ts`, `claude-agent-service.ts`, `.createSession`, `.discoverSessions`, `server/side-question.ts`, `UserInputReplyInput`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1271 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.0380041011619959 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.024594453165881738 - nodes in this community are weakly interconnected._
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
- `docs/superpowers/plans/2026-11-07-dreamer-periodic-refresh.md`
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-17-oracle-proactive-lifecycle-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
- `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`
- `docs/superpowers/specs/2026-11-04-oracle-periodic-checks-design.md`
- `docs/superpowers/specs/2026-11-05-session-knowledge-api-design.md`
- `docs/superpowers/specs/2026-11-06-oracle-actionable-morning-plan-design.md`
- `docs/superpowers/specs/2026-11-07-dreamer-periodic-refresh-design.md`
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
