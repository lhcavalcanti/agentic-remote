# Agentic Remote - Graphify code map

Snapshot: `2829b39b931f8b0d0e9e79a492268215c3a042faa0882bb95147cbe93adc069b`

Source checkout: `21f294403f98dcb6229d512ed9d902f551e7e424`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 415 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 415 files · ~895,328 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7265 nodes · 20172 edges · 214 communities (169 shown, 29 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1060 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionDetail
- App
- api.ts
- oracle-voice.ts
- App.tsx
- agent-service.ts
- computer-manager.ts
- ClaudeAgentService
- oracle-voice-child.ts
- oracle-voice-session.ts
- manager.ts
- CopilotClientLike
- background-task-adapter.ts
- OracleVoiceClient
- ManagerAgent
- claude-agent-service.ts
- ManagedSession
- agentic-remote-promotion-monitor
- dreamer-store.ts
- oracle-voice-soak.ts
- manager-agent.ts
- terminal-session.ts
- oracle-voice-integration.test.ts
- oracle-voice-worker.ts
- session-presentation.ts
- tmux-test-helpers.ts
- contracts.ts
- transcription-service.ts
- PushNotificationService
- workspace-fixtures.ts
- queued-dispatch.test.ts
- manager-structured-memory-validation.ts
- TmuxTerminalSessionController
- session-directory.ts
- app.ts
- markdown-navigation.ts
- multi-node.test.ts
- session-knowledge-routes.test.ts
- TerminalSessionController
- oracle-task-store.ts
- createManagerTools
- DreamerService
- SessionService
- .sendInternal
- shared/settings-profile.ts
- active-sessions.ts
- oracle-voice-benchmark.ts
- agentic-remote
- session-service.ts
- hub-routes.ts
- dreamer-progress.ts
- send-matrix.integration.test.ts
- agentic-remote-gate
- ProviderSessionService
- bundle
- FakeVoiceController
- oracle-voice-routes.ts
- manager-proactive-inbox.ts
- dreamer-planner.ts
- manager-agent.test.ts
- ManagerStore
- OracleDreamer.tsx
- normalizeKnowledgeRelativePath
- pwa.ts
- shell.ts
- lib.rs
- agentic-remote-promotion-setup
- manager-structured-memory.ts
- ManagerAssistant.tsx
- config.rs
- OracleVoiceCoordinator
- knowledge-tree.ts
- oracle-voice-config.ts
- dreamer-service.test.ts
- KnowledgeStore
- terminal-session.test.ts
- dependencies
- devDependencies
- ManagerMessage
- manager-context.ts
- SessionKnowledgeStore
- manager-structured-memory-search.ts
- EngineVoiceBackendSession
- dreamer-service.ts
- oracle-voice-segments.ts
- capture-workspace.ts
- recovery-resend-durability.test.ts
- ManagerProactiveCoordinator
- ManagerStructuredMemoryStore
- VoicePlayback
- real-voice.ts
- SessionOrderStore
- SettingsProfileClient
- settings-profile-store.ts
- fake-voice.ts
- manager-tools.ts
- session-patch-browser.ts
- cli-canary.ts
- scripts
- ChatMessage
- registerSessionKnowledgeRoutes
- .observe
- use-oracle-settings.ts
- compilerOptions
- session-reply-durability.test.ts
- ManagerAssistant.test.tsx
- capture.ts
- VoiceCapture
- ManagerProactiveInbox
- .confirmSpeech
- oracle-voice-tickets.ts
- session-store-providers.test.ts
- compilerOptions
- full-gate.test.ts
- session-knowledge-store.ts
- PromptCards.tsx
- compilerOptions
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- dreamer-schedule.ts
- promotion-monitor.test.ts
- terminal-startup-queue.test.ts
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- SettingsProfileStore
- server/session-patches.ts
- session-resource-routes.test.ts
- NewSessionDialog
- terminal-form-deadline.test.ts
- scripts
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- .recoverSdkSession
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- dreamer-routes.ts
- manager-proactive-inbox.test.ts
- VoiceTurnState
- Pcm16Resampler
- manager-tools.test.ts
- session-response-order.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- VoiceVadOptions
- dataset
- generate-pwa-icons.ts
- manager-proactive-coordinator.test.ts
- bridge.rs
- VoiceCaptureOptions
- DreamerMorningPlan
- KnowledgePosition
- OracleVoiceClientDependencies
- promotion-setup-execution.test.ts
- SessionAdmissions
- voice-recorder.ts
- vite.config.ts
- package.json
- recovery-context.ts
- release-publication.test.ts
- oracle-conversation-real.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- ManagerSdkClient
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- usePanelWidth
- MarkdownCodeBlock.tsx
- promotion-setup.test.ts
- SessionKnowledgeLifecycle
- removeComputer
- appearance.ts
- FakeRecorder
- VoiceCaptureDependencies
- .status
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
1. `SessionDetail` - 310 edges
2. `App()` - 302 edges
3. `AgentService` - 290 edges
4. `SessionStore` - 190 edges
5. `ClaudeAgentService` - 126 edges
6. `ManagedSession` - 124 edges
7. `ManagerAgent` - 98 edges
8. `buildApp()` - 96 edges
9. `registerHubRoutes()` - 96 edges
10. `ComputerManager` - 89 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (214 total, 29 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (14): AgentService, isTerminalNotReadyRefusal(), lifecycleRefusal(), sessionInUseConflictMessage(), suspendedRuntimeConflict(), suspendRefused(), queueConflict(), isTerminalAgentWorking() (+6 more)

### Community 1 - "SessionDetail"
Cohesion: 0.03
Nodes (79): connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite() (+71 more)

### Community 2 - "App"
Cohesion: 0.03
Nodes (163): isManagerEvent(), alertNotification(), terminalSendOptions(), sessionFileValidationError(), askSession(), recoverConversation(), activeComposerPastes(), App() (+155 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (120): httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionReceipt, submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask() (+112 more)

### Community 4 - "oracle-voice.ts"
Cohesion: 0.03
Nodes (78): AudioReservation, VoiceBackendDisconnectCause, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions, closeReason(), exactArrayBuffer() (+70 more)

### Community 5 - "App.tsx"
Cohesion: 0.02
Nodes (117): AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+109 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.03
Nodes (93): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, agentMode() (+85 more)

### Community 7 - "computer-manager.ts"
Cohesion: 0.03
Nodes (66): ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, SessionParams, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema (+58 more)

### Community 8 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (26): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services (+18 more)

### Community 9 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (55): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+47 more)

### Community 10 - "oracle-voice-session.ts"
Cohesion: 0.03
Nodes (54): voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngine, FakeVoiceEngineFactory, identityKey(), isCancelled(), sameGeneration(), config (+46 more)

### Community 11 - "manager.ts"
Cohesion: 0.03
Nodes (66): ManagerEventSource, confirmationSchema, defaultsSchema, editSchema, effort, ManagerEventSource, managerInputError(), messageParams (+58 more)

### Community 12 - "CopilotClientLike"
Cohesion: 0.03
Nodes (70): CopilotClientLike, CopilotSessionLike, foregroundTurnOpen(), directories, fakeClient(), fixture(), ForkRequest, forkSession() (+62 more)

### Community 13 - "background-task-adapter.ts"
Cohesion: 0.05
Nodes (74): DeferredSession, addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText() (+66 more)

### Community 14 - "OracleVoiceClient"
Cohesion: 0.06
Nodes (29): getOracleVoiceCapabilities(), captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord(), isTicket() (+21 more)

### Community 15 - "ManagerAgent"
Cohesion: 0.07
Nodes (18): automaticPayload(), checkContent(), delay(), discover(), errorMessage(), isNotFound(), isPending(), isQueued() (+10 more)

### Community 16 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (59): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+51 more)

### Community 17 - "ManagedSession"
Cohesion: 0.09
Nodes (15): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, ManagerProactiveCoordinatorOptions, normalizeNodeUrl() (+7 more)

### Community 18 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 19 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (45): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+37 more)

### Community 20 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 21 - "manager-agent.ts"
Cohesion: 0.04
Nodes (43): DreamerProgressEntry, ManagerHub, Rung, TURN_ACTIVITY, TurnContextInput, JournalRecorderOptions, Seen, PersistedCursor (+35 more)

### Community 22 - "terminal-session.ts"
Cohesion: 0.05
Nodes (65): composer(), processAdapter, boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText() (+57 more)

### Community 23 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (33): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+25 more)

### Community 24 - "oracle-voice-worker.ts"
Cohesion: 0.06
Nodes (28): benchmarkGroup(), VoiceEndUtterance, VoiceSttEngine, VoiceTtsEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine (+20 more)

### Community 25 - "session-presentation.ts"
Cohesion: 0.06
Nodes (55): react, saveSessionOrderLane(), handleDragEnd(), DialogFrame(), KnowledgeRootSelector(), root, drawDiagram(), drawing (+47 more)

### Community 26 - "tmux-test-helpers.ts"
Cohesion: 0.06
Nodes (54): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+46 more)

### Community 27 - "contracts.ts"
Cohesion: 0.04
Nodes (46): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), idleDaysSchema, mergeSessionRetention(), sessionRetentionPatchSchema (+38 more)

### Community 28 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+27 more)

### Community 29 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 30 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (44): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+36 more)

### Community 31 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (35): openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+27 more)

### Community 32 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 33 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (18): startAgentAfterClear(), afterExit(), awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, formReplyExpired(), listTmuxSessions() (+10 more)

### Community 34 - "session-directory.ts"
Cohesion: 0.08
Nodes (42): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, build(), trusted, directories, runtimes (+34 more)

### Community 35 - "app.ts"
Cohesion: 0.06
Nodes (39): prefixes, session, trusted, untrusted, apps, directories, buildApp(), errorStatusCode() (+31 more)

### Community 36 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (44): executeCommand(), listWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+36 more)

### Community 37 - "multi-node.test.ts"
Cohesion: 0.05
Nodes (10): directories, FakeSessionService, routingFixture(), session(), temporaryDirectory(), voiceControlQueues, voiceControlWaiters, AgentMode (+2 more)

### Community 38 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (30): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+22 more)

### Community 39 - "TerminalSessionController"
Cohesion: 0.07
Nodes (13): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, forgetSessionEvents(), boots, [directory, backend, resultPath, phase = 'idle'], fixtureRoot, TerminalFormReplyError (+5 more)

### Community 40 - "oracle-task-store.ts"
Cohesion: 0.09
Nodes (33): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+25 more)

### Community 41 - "createManagerTools"
Cohesion: 0.07
Nodes (19): busyReason(), createManagerTools(), closeCapReached(), define(), deliver(), proactiveSessionAllowed(), requireComputer(), resolveSession() (+11 more)

### Community 42 - "DreamerService"
Cohesion: 0.12
Nodes (8): digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerSnapshot, OracleTaskAttempt

### Community 43 - "SessionService"
Cohesion: 0.08
Nodes (7): closeReason(), closeVoiceSocket(), registerNodeRoutes(), readServiceResources(), readSessionMcpServers(), readSessionSkills(), SessionService

### Community 44 - ".sendInternal"
Cohesion: 0.10
Nodes (40): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerHoldsText(), composerText(), containsCopiedInteractiveFrame() (+32 more)

### Community 45 - "shared/settings-profile.ts"
Cohesion: 0.07
Nodes (47): AccentSetting, AppearanceSetting, appearanceSettings, isRecord(), isSettingsDeviceId(), isSettingsRevision(), NewSessionBackendSetting, newSessionBackendSettings (+39 more)

### Community 46 - "active-sessions.ts"
Cohesion: 0.08
Nodes (42): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+34 more)

### Community 47 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (40): benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, buildConfig(), CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest (+32 more)

### Community 48 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 49 - "session-service.ts"
Cohesion: 0.07
Nodes (22): DirectoryScope, phases, port, ProviderSessionServiceEvents, provider(), createStartupPhases(), silentStartupPhases, startManagedServer() (+14 more)

### Community 50 - "hub-routes.ts"
Cohesion: 0.05
Nodes (39): ClientPresence, PRESENCE_TTL_MS, addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+31 more)

### Community 51 - "dreamer-progress.ts"
Cohesion: 0.09
Nodes (20): DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgress, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply, DreamerProgressRequest, DreamerProgressSnapshot (+12 more)

### Community 52 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (40): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+32 more)

### Community 53 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 55 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 56 - "FakeVoiceController"
Cohesion: 0.09
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 57 - "oracle-voice-routes.ts"
Cohesion: 0.09
Nodes (35): BuildAppOptions, nodeVoiceCapabilities(), sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), availableCapabilities(), backendOutputBytes() (+27 more)

### Community 58 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (39): assertExactKeys(), canonicalHash(), DISPOSITIONS, emptyState(), EVENT_KINDS, eventId(), hasExactKeys(), isDisposition() (+31 more)

### Community 59 - "dreamer-planner.ts"
Cohesion: 0.09
Nodes (36): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+28 more)

### Community 60 - "manager-agent.test.ts"
Cohesion: 0.09
Nodes (23): ManagerAgentOptions, ManagerSdkEvent, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail(), FakeClient (+15 more)

### Community 61 - "ManagerStore"
Cohesion: 0.08
Nodes (8): openStore(), emptyState(), ManagerStore, messageSource(), storedMessage(), open(), createManager(), StoredManager

### Community 62 - "OracleDreamer.tsx"
Cohesion: 0.10
Nodes (31): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, DreamerTaskDisposition (+23 more)

### Community 63 - "normalizeKnowledgeRelativePath"
Cohesion: 0.09
Nodes (30): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+22 more)

### Community 64 - "pwa.ts"
Cohesion: 0.10
Nodes (36): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle() (+28 more)

### Community 65 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 66 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 67 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 68 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (31): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+23 more)

### Community 69 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (29): editQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), phoneEnterCreatesNewline(), applyEvent(), canTakeFocus(), conversationStateLabel(), ManagerAssistant() (+21 more)

### Community 70 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 71 - "OracleVoiceCoordinator"
Cohesion: 0.12
Nodes (6): AudioCompletion, AudioGate, OracleVoiceCoordinator, resolvedAudioGate(), terminalStartupCloseCode(), ActiveConversation

### Community 72 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 73 - "oracle-voice-config.ts"
Cohesion: 0.10
Nodes (25): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger(), canonicalPath() (+17 more)

### Community 74 - "dreamer-service.test.ts"
Cohesion: 0.08
Nodes (18): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession() (+10 more)

### Community 75 - "KnowledgeStore"
Cohesion: 0.12
Nodes (14): committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions, KnowledgeState, KnowledgeStore (+6 more)

### Community 76 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (30): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse(), pastedPlaceholderCount() (+22 more)

### Community 77 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 78 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 79 - "ManagerMessage"
Cohesion: 0.10
Nodes (6): FakeManager, FakeVoiceState, ProactiveManager, ManagerRouteAgent, registerManagerRoutes(), ManagerMessage

### Community 80 - "manager-context.ts"
Cohesion: 0.12
Nodes (27): DreamerProgressView, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+19 more)

### Community 81 - "SessionKnowledgeStore"
Cohesion: 0.12
Nodes (11): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateWithPaths(), disk, fixture(), fixtures (+3 more)

### Community 82 - "manager-structured-memory-search.ts"
Cohesion: 0.11
Nodes (27): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+19 more)

### Community 83 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 84 - "dreamer-service.ts"
Cohesion: 0.11
Nodes (29): DreamerPlanDraft, DreamerPlannerInput, boundedText(), DreamerFollowUp, DreamerPlannerExecutionInput, safeRunError(), unavailableSnapshot(), DreamerStoreSnapshot (+21 more)

### Community 85 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 86 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 87 - "recovery-resend-durability.test.ts"
Cohesion: 0.08
Nodes (22): fixture(), holdProbe(), fixtures, gate(), releases, restart(), sdkPermissionEvents(), sdkRecoveryEvents() (+14 more)

### Community 88 - "ManagerProactiveCoordinator"
Cohesion: 0.16
Nodes (7): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveInboxEvent, ManagerProactiveOutcome

### Community 89 - "ManagerStructuredMemoryStore"
Cohesion: 0.18
Nodes (8): digest(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState

### Community 90 - "VoicePlayback"
Cohesion: 0.13
Nodes (6): pcm16ToFloat(), SegmentDrain, FakeSource, harness(), validateGeneration(), VoicePlayback

### Community 91 - "real-voice.ts"
Cohesion: 0.11
Nodes (12): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+4 more)

### Community 92 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 93 - "SettingsProfileClient"
Cohesion: 0.16
Nodes (7): sameSettingValue(), SettingsProfileSnapshot, errorText(), isRefusal(), samePending(), SettingsProfileClient, SettingsProfileTransport

### Community 94 - "settings-profile-store.ts"
Cohesion: 0.12
Nodes (15): WorkspaceFixtureState, SettingsProfileState, applySettingsChanges(), applySettingsImport(), isSettingsProfileKey(), SettingsProfileRecord, SettingsRequestError, sizeChecked() (+7 more)

### Community 95 - "fake-voice.ts"
Cohesion: 0.10
Nodes (13): ActiveBackendSession, installFakeBrowserVoice(), ScriptedUtterance, Window, exactArrayBuffer(), rawDataBuffer(), receiveNodeVoiceMessage(), RouteVoiceBackend (+5 more)

### Community 96 - "manager-tools.ts"
Cohesion: 0.08
Nodes (25): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, computerField, ContextTier, trustFolder(), CreationRefusal, DECLINE_WORDS (+17 more)

### Community 97 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 98 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 99 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 100 - "ChatMessage"
Cohesion: 0.14
Nodes (12): Connection, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset, StoredSession, ChatMessage (+4 more)

### Community 101 - "registerSessionKnowledgeRoutes"
Cohesion: 0.14
Nodes (21): errorStatusCode(), knowledgeBaseName(), Lineage, pathUpdateSchema, registerSessionKnowledgeRoutes(), finalizeLifecycleBinding(), generationFor(), knownPredecessors() (+13 more)

### Community 102 - ".observe"
Cohesion: 0.14
Nodes (11): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso() (+3 more)

### Community 103 - "use-oracle-settings.ts"
Cohesion: 0.13
Nodes (15): ManagerSessionBackend, ManagerSessionClosePolicy, getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings() (+7 more)

### Community 104 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 105 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+11 more)

### Community 106 - "ManagerAssistant.test.tsx"
Cohesion: 0.09
Nodes (15): cancelManager(), removeQueuedManagerMessage(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator (+7 more)

### Community 107 - "capture.ts"
Cohesion: 0.11
Nodes (16): BufferedFrame, defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, validateIdentity(), VoiceCaptureError, VoiceCaptureErrorCode (+8 more)

### Community 109 - "ManagerProactiveInbox"
Cohesion: 0.20
Nodes (6): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 110 - ".confirmSpeech"
Cohesion: 0.19
Nodes (3): errorMessage(), OperationTimeoutError, withTimeout()

### Community 111 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 112 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+3 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 114 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 115 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+11 more)

### Community 116 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 117 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 118 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 119 - "MessageTime.tsx"
Cohesion: 0.17
Nodes (17): calendarDay(), calendarKey(), dayFields, dayTime, full, messageTimeParts(), time, yearFields (+9 more)

### Community 120 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 121 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 122 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 123 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 124 - "promotion-monitor.test.ts"
Cohesion: 0.24
Nodes (15): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+7 more)

### Community 125 - "terminal-startup-queue.test.ts"
Cohesion: 0.12
Nodes (10): client(), delayQueueWrite(), disk, exec, gate(), holdQueueCommit(), NativeFixture, NativeRuntime (+2 more)

### Community 126 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 127 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 128 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 129 - "SettingsProfileStore"
Cohesion: 0.18
Nodes (8): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileStore, directories, store()

### Community 130 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 131 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 132 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession() (+8 more)

### Community 133 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 134 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 135 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 136 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 137 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 139 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 140 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 141 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 142 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 143 - "dreamer-routes.ts"
Cohesion: 0.18
Nodes (11): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema (+3 more)

### Community 144 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, fsHooks, ReadGate, readState(), statePath(), TestState, writeState(), SessionOrigin

### Community 146 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 147 - "manager-tools.test.ts"
Cohesion: 0.18
Nodes (6): ManagerTool, ManagerToolActivity, claudeModels, computers, copilotModels, RuntimeModelOption

### Community 148 - "session-response-order.ts"
Cohesion: 0.29
Nodes (10): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+2 more)

### Community 149 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 150 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 152 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 153 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 154 - "manager-proactive-coordinator.test.ts"
Cohesion: 0.22
Nodes (5): directories, FakeAgent, fixture(), managed(), ManagerProactiveInboxOptions

### Community 155 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 157 - "DreamerMorningPlan"
Cohesion: 0.38
Nodes (10): DreamerMorningPlan(), confirmCompletion(), confirmTaskCompletion(), dispatchTask(), disposition(), edit(), investigate(), move() (+2 more)

### Community 158 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 160 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 162 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 163 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 164 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 165 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 166 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 168 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 169 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 171 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 172 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 173 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 174 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 175 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 176 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 178 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 179 - "appearance.ts"
Cohesion: 0.50
Nodes (3): Appearance, appearanceFrom(), appearanceStorageKey

## Knowledge Gaps
- **1204 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1199 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2024 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionDetail`, `SettingsProfileStore`, `ClaudeAgentService`, `oracle-voice-session.ts`, `dreamer-routes.ts`, `ManagerAgent`, `ManagedSession`, `oracle-voice-worker.ts`, `transcription-service.ts`, `PushNotificationService`, `session-knowledge-routes.test.ts`, `TerminalSessionController`, `oracle-task-store.ts`, `DreamerService`, `SessionService`, `hub-routes.ts`, `ProviderSessionService`, `.status`, `manager-agent.test.ts`, `ManagerStore`, `oracle-voice-config.ts`, `dreamer-service.test.ts`, `KnowledgeStore`, `ManagerMessage`, `SessionKnowledgeStore`, `ManagerProactiveCoordinator`, `SessionOrderStore`, `cli-canary.ts`, `ManagerProactiveInbox`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `session-directory.ts`, `agent-service.ts`, `TerminalSessionController`, `.recoverSdkSession`, `background-task-adapter.ts`, `claude-agent-service.ts`, `session-service.ts`, `recovery-resend-durability.test.ts`, `queued-dispatch.test.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `agent-service.ts`, `TerminalSessionController`, `.recoverSdkSession`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1204 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03774815539521422 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.02849269771286856 - nodes in this community are weakly interconnected._
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
