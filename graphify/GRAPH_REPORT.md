# Agentic Remote - Graphify code map

Snapshot: `a09c388ec2d9bb0113b153642f24e20c3bcf766026c5cd3126d766e62aa55fc4`

Source checkout: `3c6afc64a23e7986ec0c5dd4779991d712a551bf`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 405 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 405 files · ~814,132 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6906 nodes · 19097 edges · 228 communities (185 shown, 27 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1015 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- contracts.ts
- SessionStore
- SessionDetail
- App.tsx
- api.ts
- agent-service.ts
- oracle-voice-routes.test.ts
- claude-agent-service.ts
- SessionService
- agent-service.test.ts
- oracle-voice-routes.ts
- oracle-voice-child.ts
- terminal-session.ts
- ManagedSession
- agentic-remote-promotion-monitor
- oracle-voice-soak.ts
- queueConflict
- ManagerAgent
- FakeVoiceEngine
- OracleVoiceCoordinator
- manager-tools.ts
- PushNotificationService
- transcription-service.ts
- manager-agent.ts
- oracle-voice-integration.test.ts
- session-presentation.ts
- oracle-voice-worker.ts
- oracle-task-store.ts
- manager-structured-memory-validation.ts
- FakeManager
- app.ts
- markdown-navigation.ts
- send-matrix.integration.test.ts
- workspace-fixtures.ts
- session-knowledge-routes.test.ts
- manager.ts
- oracle-voice-session.ts
- VoiceCapture
- oracle-voice.ts
- TmuxTerminalSessionController
- agentic-remote
- bundle
- dreamer-store.ts
- ProviderSessionService
- OracleVoiceClient
- session-resource-clear.test.ts
- hub-routes.ts
- ManagerStore
- recovery-resend-durability.test.ts
- DreamerStore
- pwa.ts
- active-sessions.ts
- DreamerService
- VoicePlayback
- oracle-voice-config.ts
- normalizeKnowledgeRelativePath
- tmux-test-helpers.ts
- shell.ts
- lib.rs
- ManagerSnapshot
- manager-proactive-inbox.ts
- agentic-remote-promotion-setup
- agentic-remote-gate
- config.rs
- FakeSessionService
- manager-structured-memory.ts
- terminal-session.test.ts
- ManagerAssistant.tsx
- dependencies
- devDependencies
- manager-structured-memory-search.ts
- oracle-voice-security.test.ts
- knowledge-tree.ts
- dreamer-planner.ts
- client.ts
- client.test.ts
- SessionKnowledgeStore
- oracle-voice-benchmark.ts
- manager-store.ts
- oracle-voice-child.test.ts
- react
- UserInputReplyInput
- remote-voice-client.ts
- SessionOrderStore
- HubEvent
- settings-profile-store.ts
- session-patch-browser.ts
- backgroundTasksFromEvents
- cli-canary.ts
- shared/settings-profile.ts
- scripts
- src/settings-profile.ts
- KnowledgeStore
- directory-browser.ts
- background-task-adapter.ts
- workspace-browser.ts
- compilerOptions
- .toolHost
- manager-context.ts
- SettingsProfileClient
- dreamer-service.ts
- ManagerStructuredMemoryStore
- capture-workspace.ts
- oracle-voice-segments.ts
- oracle-voice-tickets.ts
- isTerminalComposerFooter
- ManagerAssistant.test.tsx
- full-gate.test.ts
- startup-phases.test.ts
- session-reply-durability.test.ts
- .sendInternal
- PromptCards.tsx
- dreamer-api.ts
- compilerOptions
- session-store-providers.test.ts
- OnlineRecognizer
- compilerOptions
- compilerOptions
- ManagerMemory
- session-knowledge-store.ts
- dreamer-schedule.ts
- SettingsProfileStore
- BoundedQueue
- ReaderWorkspace
- ManagerProactiveInbox
- terminal-form-deadline.test.ts
- session-latency-benchmark.ts
- background-task-stop.test.ts
- promotion-monitor.test.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- NewSessionDialog
- scripts
- ManagerEvent
- oracle-voice-assets.test.ts
- pending-echo.ts
- fake-vad.ts
- desktop.json
- .persist
- manager-proactive-inbox.test.ts
- registerSessionKnowledgeRoutes
- theme-contrast.test.ts
- OracleVoiceClientOptions
- .oxlintrc.json
- settings-local.json
- .initialize
- submission-error.ts
- session-knowledge-routes.ts
- Pcm16Resampler
- DreamerMorningPlan
- background-task-tracker.ts
- session-response-order.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- benchmarkFixture
- normalizeBackgroundTask
- DeferredSession
- dreamer-routes.ts
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- ManagerProactiveInboxValidationError
- SpeakableSegmenter
- bridge.rs
- OracleDreamer.tsx
- screenshot-stability.test.ts
- KnowledgePosition
- promotion-setup-execution.test.ts
- remote-node-client.test.ts
- SessionAdmissions
- tmux-errors.test.ts
- VoiceVadOptions
- voice-recorder.ts
- vite.config.ts
- package.json
- ManagerProactiveInboxError
- OracleVoiceClientDependencies
- recovery-context.ts
- release-publication.test.ts
- OracleVoicePlayback
- vad-assets.ts
- oracle-conversation-real.test.ts
- render-workspace-gifs.ts
- ClientPresence
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- usePanelWidth
- promotion-setup.test.ts
- FakeRecorder
- VoiceCaptureDependencies
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- parseCliOptions
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
1. `SessionDetail` - 307 edges
2. `App()` - 278 edges
3. `AgentService` - 276 edges
4. `SessionStore` - 189 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 109 edges
7. `buildApp()` - 95 edges
8. `registerHubRoutes()` - 93 edges
9. `ComputerManager` - 87 edges
10. `ManagerAgent` - 86 edges

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

## Communities (228 total, 27 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.03
Nodes (17): agentMode(), AgentService, isTerminalNotReadyRefusal(), normalizedTitle(), removeCopilotSessionFiles(), RuntimeConfigurationError, suspendedRuntimeConflict(), terminalAnswerRefused() (+9 more)

### Community 1 - "App"
Cohesion: 0.03
Nodes (151): isManagerEvent(), alertNotification(), terminalSendOptions(), submissionReceiptFromError(), deleteKnowledgeRoot(), moveSessionToTmux(), replyPermission(), replyUserInput() (+143 more)

### Community 2 - "contracts.ts"
Cohesion: 0.03
Nodes (75): ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, sessionAtLeastAsNew(), directories, voiceControlQueues, voiceControlWaiters (+67 more)

### Community 3 - "SessionStore"
Cohesion: 0.03
Nodes (75): storage(), fixture(), restart(), fixture(), connect(), createStore(), deferred(), disk (+67 more)

### Community 4 - "SessionDetail"
Cohesion: 0.04
Nodes (26): ClaudeAgentService, isMissingClaudeSessionError(), PendingClaudeReply, toolResultText(), observe(), answer(), claudeRequest(), copilotRequest() (+18 more)

### Community 5 - "App.tsx"
Cohesion: 0.02
Nodes (119): addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+111 more)

### Community 6 - "api.ts"
Cohesion: 0.03
Nodes (113): SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), addKnowledgeRoot(), askSession(), bootstrapSessionOrder(), cancelBackgroundTask() (+105 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.04
Nodes (76): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+68 more)

### Community 8 - "oracle-voice-routes.test.ts"
Cohesion: 0.03
Nodes (37): ActiveBackendSession, BrowserTestSessionService, installFakeBrowserVoice(), ScriptedUtterance, Window, clockTicksPerSecond(), execFileAsync, GenerationMetrics (+29 more)

### Community 9 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (65): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, releases (+57 more)

### Community 10 - "SessionService"
Cohesion: 0.04
Nodes (43): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), closeReason(), closeVoiceSocket() (+35 more)

### Community 11 - "agent-service.test.ts"
Cohesion: 0.03
Nodes (50): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+42 more)

### Community 12 - "oracle-voice-routes.ts"
Cohesion: 0.04
Nodes (63): sendNodeVoiceOutput(), AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OracleVoiceBackendConnection, OracleVoiceBackendConnector (+55 more)

### Community 13 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (42): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+34 more)

### Community 14 - "terminal-session.ts"
Cohesion: 0.06
Nodes (73): activeBottomFrame(), captureBeforeDeadline(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), containsCopiedInteractiveFrame() (+65 more)

### Community 15 - "ManagedSession"
Cohesion: 0.09
Nodes (16): ComputerManager, managedSession(), mapWithConcurrency(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, FakeManager, directories (+8 more)

### Community 16 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 17 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 18 - "queueConflict"
Cohesion: 0.05
Nodes (34): isClaudeAuthenticationError(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt() (+26 more)

### Community 19 - "ManagerAgent"
Cohesion: 0.09
Nodes (14): FakeVoiceState, checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), capturePrompt() (+6 more)

### Community 20 - "FakeVoiceEngine"
Cohesion: 0.05
Nodes (29): voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngine, FakeVoiceEngineCall, FakeVoiceEngineFactory, identityKey(), isCancelled(), sameGeneration() (+21 more)

### Community 21 - "OracleVoiceCoordinator"
Cohesion: 0.08
Nodes (7): errorMessage(), OperationTimeoutError, OracleVoiceCoordinator, OracleVoiceCoordinatorOptions, PendingFinalTurn, withTimeout(), VoiceTurnState

### Community 22 - "manager-tools.ts"
Cohesion: 0.06
Nodes (36): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), steer() (+28 more)

### Community 23 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 24 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 25 - "manager-agent.ts"
Cohesion: 0.05
Nodes (30): DreamerMemoryMetadataRecord, DreamerServiceOptions, directories, automaticPayload(), discover(), isPending(), isQueued(), ManagerAgentOptions (+22 more)

### Community 26 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (28): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+20 more)

### Community 27 - "session-presentation.ts"
Cohesion: 0.07
Nodes (50): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+42 more)

### Community 28 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (26): benchmarkGroup(), VoiceGenerationIdentity, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, ChildVoiceEngineDependencies, errorMessage() (+18 more)

### Community 29 - "oracle-task-store.ts"
Cohesion: 0.08
Nodes (38): setup(), attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText(), isTimestamp() (+30 more)

### Community 30 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 31 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 32 - "app.ts"
Cohesion: 0.06
Nodes (37): prefixes, session, trusted, untrusted, apps, directories, buildApp(), errorStatusCode() (+29 more)

### Community 33 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (42): executeCommand(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage() (+34 more)

### Community 34 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (46): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+38 more)

### Community 35 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (40): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+32 more)

### Community 36 - "session-knowledge-routes.test.ts"
Cohesion: 0.05
Nodes (29): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+21 more)

### Community 37 - "manager.ts"
Cohesion: 0.06
Nodes (33): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+25 more)

### Community 38 - "oracle-voice-session.ts"
Cohesion: 0.11
Nodes (17): acquisitionCancelled(), ActiveUtterance, asSessionError(), capabilityFromConfig(), createVoiceBackendSession(), disconnectCause(), EngineVoiceBackendSession, isAcquisitionCancelled() (+9 more)

### Community 39 - "VoiceCapture"
Cohesion: 0.10
Nodes (14): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, harness() (+6 more)

### Community 40 - "oracle-voice.ts"
Cohesion: 0.09
Nodes (38): capabilities, closeServers, exactArrayBuffer(), sockets, startFields, VoiceNode, decodeVoiceAudioFrame(), encodeVoiceAudioFrame() (+30 more)

### Community 41 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (13): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+5 more)

### Community 42 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 43 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 44 - "dreamer-store.ts"
Cohesion: 0.08
Nodes (37): DreamerHistoryEntry, assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES (+29 more)

### Community 46 - "OracleVoiceClient"
Cohesion: 0.15
Nodes (7): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, playbackClientError(), terminalCloseCode()

### Community 47 - "session-resource-clear.test.ts"
Cohesion: 0.06
Nodes (34): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), deferred() (+26 more)

### Community 48 - "hub-routes.ts"
Cohesion: 0.06
Nodes (40): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+32 more)

### Community 49 - "ManagerStore"
Cohesion: 0.08
Nodes (11): openStore(), emptyState(), ManagerStore, open(), createManager(), createRealManager(), DeterministicManagerClient, deterministicManagerHub() (+3 more)

### Community 50 - "recovery-resend-durability.test.ts"
Cohesion: 0.06
Nodes (26): build(), trusted, directories, disk, fixture(), gate(), gates, httpBoundary() (+18 more)

### Community 51 - "DreamerStore"
Cohesion: 0.13
Nodes (11): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, emptyState(), isMissing() (+3 more)

### Community 52 - "pwa.ts"
Cohesion: 0.09
Nodes (38): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), retryHubCopilotModels() (+30 more)

### Community 53 - "active-sessions.ts"
Cohesion: 0.10
Nodes (37): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+29 more)

### Community 54 - "DreamerService"
Cohesion: 0.15
Nodes (10): digest(), DreamerService, DreamerUnavailableError, uniqueSessionRefs(), DreamerCompletionCandidate, DreamerSnapshot, hasDreamerSessionIdentity(), isDreamerSessionItem() (+2 more)

### Community 55 - "VoicePlayback"
Cohesion: 0.10
Nodes (11): pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio(), validateGeneration() (+3 more)

### Community 56 - "oracle-voice-config.ts"
Cohesion: 0.08
Nodes (28): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+20 more)

### Community 57 - "normalizeKnowledgeRelativePath"
Cohesion: 0.10
Nodes (30): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), SessionKnowledgeBinding, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+22 more)

### Community 58 - "tmux-test-helpers.ts"
Cohesion: 0.11
Nodes (31): directories, exec, noTmuxServer(), processGone(), procVisible(), socketIdentity(), UnixSocket, unixSockets() (+23 more)

### Community 59 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 60 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 61 - "ManagerSnapshot"
Cohesion: 0.10
Nodes (13): batchMessageId(), isTerminal(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, oneLine(), directories, FakeAgent, fixture() (+5 more)

### Community 62 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isDisposition() (+29 more)

### Community 63 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 64 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 65 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 66 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 67 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (30): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+22 more)

### Community 68 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (29): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), parseTerminalUpdateNotice(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane (+21 more)

### Community 69 - "ManagerAssistant.tsx"
Cohesion: 0.10
Nodes (28): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), phoneEnterCreatesNewline(), applyEvent(), canTakeFocus(), conversationStateLabel() (+20 more)

### Community 70 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 71 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 72 - "manager-structured-memory-search.ts"
Cohesion: 0.10
Nodes (28): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+20 more)

### Community 73 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (21): VoiceStartUtterance, SocketMessage, apps, BlockingEngine, config, configFixture(), connect(), Inbox (+13 more)

### Community 74 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+24 more)

### Community 75 - "dreamer-planner.ts"
Cohesion: 0.11
Nodes (29): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+21 more)

### Community 76 - "client.ts"
Cohesion: 0.10
Nodes (24): VoiceCapabilities, getOracleVoiceCapabilities(), closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode (+16 more)

### Community 77 - "client.test.ts"
Cohesion: 0.08
Nodes (10): OracleVoiceSocket, capabilities, FakeCapture, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+2 more)

### Community 78 - "SessionKnowledgeStore"
Cohesion: 0.12
Nodes (11): bindingKey(), RootCatalog, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateSchema, disk, fixture(), fixtures (+3 more)

### Community 79 - "oracle-voice-benchmark.ts"
Cohesion: 0.10
Nodes (27): BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, derived(), execFileAsync (+19 more)

### Community 80 - "manager-store.ts"
Cohesion: 0.12
Nodes (16): JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), PersistedCursor, JournalDraft, JournalEntry, JournalKind (+8 more)

### Community 81 - "oracle-voice-child.test.ts"
Cohesion: 0.10
Nodes (11): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+3 more)

### Community 82 - "react"
Cohesion: 0.10
Nodes (19): react, getManager(), updateManagerSettings(), DialogFrame(), MarkdownCodeBlock(), originalClipboard, drawDiagram(), drawing (+11 more)

### Community 83 - "UserInputReplyInput"
Cohesion: 0.16
Nodes (7): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, PendingUserInput, UserInputReplyInput, deliveryUncertaintyFromError()

### Community 84 - "remote-voice-client.ts"
Cohesion: 0.17
Nodes (12): VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient (+4 more)

### Community 85 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 86 - "HubEvent"
Cohesion: 0.12
Nodes (15): Connection, WorkspaceFixture, ComputerManagerEvents, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset (+7 more)

### Community 87 - "settings-profile-store.ts"
Cohesion: 0.12
Nodes (15): SettingsProfileState, applySettingsChanges(), applySettingsImport(), isSettingsProfileKey(), sameSettingValue(), SettingsProfileRecord, SettingsRequestError, sizeChecked() (+7 more)

### Community 88 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 89 - "backgroundTasksFromEvents"
Cohesion: 0.19
Nodes (27): addActivity(), backgroundHandoff(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventString(), eventTask(), lastForegroundCompletionAt() (+19 more)

### Community 90 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 91 - "shared/settings-profile.ts"
Cohesion: 0.11
Nodes (26): AccentSetting, appearanceSettings, isRecord(), isSettingsRevision(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting, NewSessionRuntimesSetting (+18 more)

### Community 92 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 93 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (21): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+13 more)

### Community 94 - "KnowledgeStore"
Cohesion: 0.18
Nodes (7): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 95 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 96 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (23): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isLiveTaskStatus(), isOlderExecution(), isShellObserverTool() (+15 more)

### Community 97 - "workspace-browser.ts"
Cohesion: 0.15
Nodes (19): directories, runtimes, start(), trusted, fileKind(), imageMimeTypes, isWithin(), listWorkspace() (+11 more)

### Community 98 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 99 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 100 - "manager-context.ts"
Cohesion: 0.16
Nodes (20): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+12 more)

### Community 101 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 102 - "dreamer-service.ts"
Cohesion: 0.13
Nodes (17): DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), projectDreamerRegistry(), projectRegistryEntry(), boundedText(), DreamerPlannerExecutionInput (+9 more)

### Community 103 - "ManagerStructuredMemoryStore"
Cohesion: 0.24
Nodes (5): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState

### Community 104 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 105 - "oracle-voice-segments.ts"
Cohesion: 0.16
Nodes (21): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+13 more)

### Community 106 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 107 - "isTerminalComposerFooter"
Cohesion: 0.13
Nodes (20): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+12 more)

### Community 108 - "ManagerAssistant.test.tsx"
Cohesion: 0.10
Nodes (14): resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), act(), OracleButton(), OracleControl, OracleIndicator (+6 more)

### Community 109 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 110 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 111 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 112 - ".sendInternal"
Cohesion: 0.17
Nodes (14): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), isTerminalLoading(), occurrences(), paneEvidenceCount() (+6 more)

### Community 113 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 114 - "dreamer-api.ts"
Cohesion: 0.18
Nodes (15): completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerSettingsEdit, DreamerTaskCompletion, DreamerTaskDispatch, getDreamer(), request() (+7 more)

### Community 115 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 116 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 117 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 118 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 119 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 120 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 121 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (17): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+9 more)

### Community 122 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 123 - "SettingsProfileStore"
Cohesion: 0.18
Nodes (7): profileStore(), SettingsProfileStore, directories, store(), isSettingsDeviceId(), SettingsProfileSnapshot, SettingsProfileTransport

### Community 124 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 125 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 126 - "ManagerProactiveInbox"
Cohesion: 0.25
Nodes (4): ManagerProactiveInbox, ManagerProactiveInboxCapacityError, nowIso(), openInbox()

### Community 127 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 128 - "session-latency-benchmark.ts"
Cohesion: 0.23
Nodes (15): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+7 more)

### Community 129 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 130 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 131 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 132 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 133 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder(), reopenInterruptedSession() (+8 more)

### Community 134 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 135 - "ManagerEvent"
Cohesion: 0.16
Nodes (5): ManagerEventSource, ProactiveManager, ManagerEventSource, trusted, ManagerEvent

### Community 136 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 137 - "pending-echo.ts"
Cohesion: 0.24
Nodes (11): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, PendingEchoOwner, prunePendingEchoMap() (+3 more)

### Community 138 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 139 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 140 - ".persist"
Cohesion: 0.23
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 141 - "manager-proactive-inbox.test.ts"
Cohesion: 0.16
Nodes (9): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState() (+1 more)

### Community 142 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 143 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 144 - "OracleVoiceClientOptions"
Cohesion: 0.23
Nodes (3): OracleVoiceClientOptions, FakeVoiceClient, transcript()

### Community 145 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 146 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 147 - ".initialize"
Cohesion: 0.22
Nodes (5): initializeManagerStructuredMemory(), isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, open()

### Community 148 - "submission-error.ts"
Cohesion: 0.28
Nodes (6): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, SubmissionError, SubmissionReceipt

### Community 149 - "session-knowledge-routes.ts"
Cohesion: 0.15
Nodes (7): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema, SessionKnowledgeConflictError

### Community 150 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 151 - "DreamerMorningPlan"
Cohesion: 0.27
Nodes (12): DreamerMorningPlan(), confirmCompletion(), confirmTaskCompletion(), dispatchTask(), disposition(), edit(), investigate(), move() (+4 more)

### Community 152 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 153 - "session-response-order.ts"
Cohesion: 0.29
Nodes (10): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+2 more)

### Community 154 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 155 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 156 - "benchmarkFixture"
Cohesion: 0.25
Nodes (9): benchmarkFixture(), deferred(), firstTtsSegment(), maybeMeasured(), measured(), measureSttPass(), measureTts(), missing() (+1 more)

### Community 157 - "normalizeBackgroundTask"
Cohesion: 0.22
Nodes (10): attachmentModeValue(), booleanValue(), executionModeValue(), isBackgroundTaskInfo(), isBackgroundTaskProgress(), normalizeBackgroundTask(), numberValue(), progressValue() (+2 more)

### Community 159 - "dreamer-routes.ts"
Cohesion: 0.22
Nodes (9): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskParamsSchema, apps (+1 more)

### Community 160 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 161 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 162 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 163 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 164 - "SpeakableSegmenter"
Cohesion: 0.29
Nodes (3): SpeakableSegmenter, validateMessageId(), ./server/oracle-voice-segments.ts

### Community 165 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 166 - "OracleDreamer.tsx"
Cohesion: 0.36
Nodes (8): authoritativeRefresh, AuthoritativeRefreshRequest, coordinatedAuthoritativeRefresh, dispatchAuthoritativeRefresh(), DreamerRefreshOwner(), requestCoordinatedAuthoritativeRefresh(), settleAuthoritativeRefresh(), waitUntilAuthoritativeRefresh()

### Community 167 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 168 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 169 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 170 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 172 - "tmux-errors.test.ts"
Cohesion: 0.25
Nodes (6): directories, { execute }, files, links, listener(), server()

### Community 174 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 175 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 176 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 177 - "ManagerProactiveInboxError"
Cohesion: 0.25
Nodes (4): ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError

### Community 179 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 180 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 182 - "vad-assets.ts"
Cohesion: 0.32
Nodes (7): browserBaseUrl(), directory(), localAssetUrl(), ORACLE_VOICE_ONNX_WASM_BASE_PATH, ORACLE_VOICE_VAD_ASSETS, ORACLE_VOICE_VAD_BASE_PATH, sharedAssetDirectory()

### Community 184 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 186 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 187 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 188 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 189 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 190 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 191 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 198 - "parseCliOptions"
Cohesion: 1.00
Nodes (3): parseCliOptions(), resolvedOption(), usage()

## Knowledge Gaps
- **1141 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1136 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1922 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `contracts.ts`, `SessionStore`, `agent-service.ts`, `claude-agent-service.ts`, `queueConflict`, `recovery-resend-durability.test.ts`, `UserInputReplyInput`, `normalizeBackgroundTask`, `directory-browser.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionStore`, `SessionDetail`, `SessionService`, `ManagedSession`, `ManagerAgent`, `.initialize`, `PushNotificationService`, `transcription-service.ts`, `manager-agent.ts`, `oracle-voice-worker.ts`, `oracle-task-store.ts`, `dreamer-routes.ts`, `session-knowledge-routes.test.ts`, `manager.ts`, `ProviderSessionService`, `ManagerStore`, `DreamerService`, `oracle-voice-config.ts`, `ClientPresence`, `ManagerSnapshot`, `SessionKnowledgeStore`, `manager-store.ts`, `UserInputReplyInput`, `SessionOrderStore`, `cli-canary.ts`, `KnowledgeStore`, `ManagerStructuredMemoryStore`, `SettingsProfileStore`, `ManagerProactiveInbox`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `SessionDetail`, `agent-service.ts`, `queueConflict`, `UserInputReplyInput`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1141 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03365079365079365 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.031055900621118012 - nodes in this community are weakly interconnected._
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
- `docs/session-retention.md`
- `docs/slash-command-feedback.md`
- `docs/superpowers/plans/2026-10-16-oracle-conversation-mode.md`
- `docs/superpowers/plans/2026-10-16-oracle-structured-memory.md`
- `docs/superpowers/plans/2026-10-20-copilot-sdk-cli-parity.md`
- `docs/superpowers/plans/2026-10-24-copilot-sdk-restart-recovery.md`
- `docs/superpowers/plans/2026-11-06-oracle-actionable-morning-plan.md`
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-17-oracle-proactive-lifecycle-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
- `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`
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
