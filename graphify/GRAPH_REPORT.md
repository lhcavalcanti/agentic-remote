# Agentic Remote - Graphify code map

Snapshot: `375b53097cdd4daf56096312227a324f31994c15c655b6ba8f0ab8e7738c3cf9`

Source checkout: `228ecd22c8ab6cb9ad5e07c033693cdc1b505520`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 400 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 400 files · ~808,015 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6800 nodes · 18756 edges · 227 communities (183 shown, 28 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1010 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- SessionStore
- AgentService
- api.ts
- App.tsx
- agent-service.ts
- session-store-providers.test.ts
- ClaudeAgentService
- contracts.ts
- claude-agent-service.ts
- oracle-voice.ts
- oracle-voice-session.ts
- oracle-voice-child.ts
- oracle-voice-soak.ts
- agentic-remote-promotion-monitor
- ManagedSession
- manager-agent.ts
- terminal-session.ts
- ManagerAgent
- app.ts
- oracle-voice-integration.test.ts
- PushNotificationService
- manager-tools.ts
- sessionKey
- FakeVoiceEngine
- ManagerAssistant.tsx
- active-sessions.ts
- markdown-navigation.ts
- manager-structured-memory-validation.ts
- oracle-voice-worker.ts
- SessionDetail
- queued-dispatch.test.ts
- startup-phases.test.ts
- TmuxTerminalSessionController
- FakeManager
- RemoteNodeClient
- workspace-fixtures.ts
- oracle-voice-benchmark.ts
- ManagerStore
- .sendInternal
- agentic-remote
- session-knowledge-routes.test.ts
- manager-store.ts
- SessionService
- bundle
- ProviderSessionService
- OracleVoiceClient
- real-voice.ts
- pwa.ts
- OracleDreamer.tsx
- TerminalSessionController
- DreamerStore
- manager-proactive-inbox.ts
- tmux-test-helpers.ts
- shell.ts
- lib.rs
- FakeSessionService
- agentic-remote-promotion-setup
- agentic-remote-gate
- config.rs
- background-task-adapter.ts
- dreamer-store.ts
- hub-routes.ts
- oracle-voice-routes.ts
- dependencies
- devDependencies
- oracle-voice-child.test.ts
- oracle-voice-security.test.ts
- EngineVoiceBackendSession
- DreamerService
- SessionKnowledgeStore
- shared/settings-profile.ts
- dreamer-planner.ts
- manager-structured-memory.ts
- OracleVoiceCoordinator
- oracle-voice-segments.ts
- src/settings-profile.ts
- VoicePlayback
- node-routes.ts
- SessionOrderStore
- session-patch-browser.ts
- HubEvent
- react
- session-reply-durability.test.ts
- dreamer-service.ts
- terminal-startup-queue.test.ts
- settings-profile-store.ts
- terminal-session.test.ts
- use-oracle-conversation.test.tsx
- cli-canary.ts
- send-matrix.integration.test.ts
- scripts
- KnowledgeStore
- directory-browser.ts
- compilerOptions
- manager-routes.ts
- oracle-voice-coordinator.test.ts
- transcription-service.ts
- SettingsProfileClient
- .recoverSdkSession
- .toolHost
- ManagerStructuredMemoryStore
- manager-structured-memory-search.ts
- VoiceCapture
- capture-workspace.ts
- normalizeKnowledgeRelativePath
- ManagerProactiveInbox
- oracle-voice-tickets.ts
- full-gate.test.ts
- oracle-voice-coordinator.ts
- session-knowledge-store.ts
- knowledge-tree.ts
- compilerOptions
- recovery-resend-durability.test.ts
- OnlineRecognizer
- client.ts
- FakeSocket
- compilerOptions
- compilerOptions
- ManagerMemory
- .observe
- recordValue
- dreamer-schedule.ts
- use-session-knowledge-root.ts
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- .correct
- VoiceTurnState
- promotion-monitor.test.ts
- NewSessionDialog
- submission-error.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- capture.ts
- terminal-form-deadline.test.ts
- scripts
- DeferredSession
- background-task-stop.test.ts
- dreamer-service.test.ts
- registerSessionKnowledgeRoutes
- oracle-voice-assets.test.ts
- send-policy.test.ts
- use-oracle-settings.ts
- fake-vad.ts
- desktop.json
- TranscriptionService
- OracleVoiceClientDependencies
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- background-task-tracker.ts
- manager-structured-memory-performance.test.ts
- TranscriptionError
- session-response-order.ts
- Pcm16Resampler
- manager-proactive-inbox.test.ts
- .handleManagerEvent
- BackgroundTasksDialog.tsx
- html-preview.ts
- delegated-transcription-service.ts
- file-upload-routes.ts
- session-knowledge-routes.ts
- playback.ts
- VoiceVadOptions
- dataset
- generate-pwa-icons.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- transcribeAudio
- screenshot-stability.test.ts
- KnowledgePosition
- ManagerEvent
- promotion-setup-execution.test.ts
- VoiceCaptureOptions
- settings-profile.test.ts
- vite.config.ts
- package.json
- release-publication.test.ts
- UserInputFieldControl
- OracleVoicePlayback
- vad-assets.ts
- render-workspace-gifs.ts
- delegated-transcription-service.test.ts
- settings-profile-routes.ts
- settings.ts
- .transport
- composer-layout.test.ts
- SessionStatus
- .receive
- promotion-setup.test.ts
- FakeRecorder
- VoiceCaptureDependencies
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
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
2. `App()` - 296 edges
3. `AgentService` - 276 edges
4. `SessionStore` - 189 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 103 edges
7. `registerHubRoutes()` - 93 edges
8. `buildApp()` - 92 edges
9. `ComputerManager` - 87 edges
10. `ManagerAgent` - 83 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (227 total, 28 thin omitted)

### Community 0 - "App"
Cohesion: 0.03
Nodes (183): isManagerEvent(), askSession(), clearConversation(), listKnowledgeEntries(), readKnowledgeFile(), recoverConversation(), removeQueuedPrompt(), reorderQueuedPrompts() (+175 more)

### Community 1 - "SessionStore"
Cohesion: 0.03
Nodes (82): fixture(), restart(), fixture(), connect(), createStore(), deferred(), disk, enqueue() (+74 more)

### Community 2 - "AgentService"
Cohesion: 0.04
Nodes (9): agentMode(), AgentService, isTerminalNotReadyRefusal(), isUncertainDelivery(), RuntimeConfigurationError, suspendedRuntimeConflict(), queueConflict(), isRetainedRefusal() (+1 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (118): AddKnowledgeRootInput, ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, PushSettings, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, ResolveManagerConfirmationInput (+110 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (118): addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+110 more)

### Community 5 - "agent-service.ts"
Cohesion: 0.03
Nodes (97): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+89 more)

### Community 6 - "session-store-providers.test.ts"
Cohesion: 0.02
Nodes (75): CopilotClientLike, CopilotSessionLike, directories, fakeClient(), ForkRequest, forkSession(), services, terminalFormSteps() (+67 more)

### Community 7 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (27): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+19 more)

### Community 8 - "contracts.ts"
Cohesion: 0.04
Nodes (58): AgentServiceEvents, ClaudeAgentServiceEvents, ComputerManagerEvents, mapWithConcurrency(), RemoteResync, RemoteSessionListing, RemoteSessionRead, sessionAtLeastAsNew() (+50 more)

### Community 9 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (68): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+60 more)

### Community 10 - "oracle-voice.ts"
Cohesion: 0.05
Nodes (54): RegistryState, VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+46 more)

### Community 11 - "oracle-voice-session.ts"
Cohesion: 0.04
Nodes (42): ActiveBackendSession, installFakeBrowserVoice(), ScriptedUtterance, Window, BuildAppOptions, voiceBackend(), EnabledOracleVoiceConfig, FakeVoiceEngineFactory (+34 more)

### Community 12 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (42): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), createVoiceWorker(), defaultSpawnPiper() (+34 more)

### Community 13 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 14 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 15 - "ManagedSession"
Cohesion: 0.09
Nodes (10): ClientPresence, PRESENCE_TTL_MS, ComputerManager, managedSession(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, ComputerSummary (+2 more)

### Community 16 - "manager-agent.ts"
Cohesion: 0.05
Nodes (40): ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Rung, Behavior, capturePrompt() (+32 more)

### Community 17 - "terminal-session.ts"
Cohesion: 0.05
Nodes (70): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerHoldsOtherText() (+62 more)

### Community 18 - "ManagerAgent"
Cohesion: 0.08
Nodes (15): FakeVoiceState, checkContent(), delay(), discover(), errorMessage(), isNotFound(), isPending(), isQueued() (+7 more)

### Community 19 - "app.ts"
Cohesion: 0.05
Nodes (55): buildConfig(), prefixes, session, trusted, untrusted, apps, directories, buildApp() (+47 more)

### Community 20 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (34): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+26 more)

### Community 21 - "PushNotificationService"
Cohesion: 0.07
Nodes (29): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+21 more)

### Community 22 - "manager-tools.ts"
Cohesion: 0.06
Nodes (35): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), steer() (+27 more)

### Community 23 - "sessionKey"
Cohesion: 0.07
Nodes (54): BackgroundTaskSnapshot, saveSessionOrderLane(), handleDragEnd(), RenameSessionDialog(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter (+46 more)

### Community 24 - "FakeVoiceEngine"
Cohesion: 0.05
Nodes (26): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceSttEngine, VoiceTtsEngine, VoiceUtteranceAudioFrame (+18 more)

### Community 25 - "ManagerAssistant.tsx"
Cohesion: 0.06
Nodes (47): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline() (+39 more)

### Community 26 - "active-sessions.ts"
Cohesion: 0.06
Nodes (51): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+43 more)

### Community 27 - "markdown-navigation.ts"
Cohesion: 0.06
Nodes (49): UserInputField, UserInputFieldValue, executeCommand(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), submit(), followMarkdownLink(), KnowledgeReader() (+41 more)

### Community 28 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 29 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (25): benchmarkGroup(), ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent() (+17 more)

### Community 30 - "SessionDetail"
Cohesion: 0.08
Nodes (10): persistedFormAnswer(), terminalAnswerRefused(), TerminalFormContinuation, validateUserInputForm(), Admission, ExclusiveAdmission, PendingQueueAdmission, TerminalFormReplyError (+2 more)

### Community 31 - "queued-dispatch.test.ts"
Cohesion: 0.06
Nodes (27): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDelivery, QueuedDispatches (+19 more)

### Community 32 - "startup-phases.test.ts"
Cohesion: 0.05
Nodes (33): phases, port, directories, runtimes, start(), trusted, SessionAdmissions, createStartupPhases() (+25 more)

### Community 33 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (18): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, formReplyExpired(), parseTerminalUpdateNotice(), processAncestors(), processCommand() (+10 more)

### Community 34 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 35 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (10): headerSafe(), RemoteNodeClient, client(), servers, session, NodeInfo, WorkspaceFile, WorkspaceListing (+2 more)

### Community 36 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (40): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+32 more)

### Community 37 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (41): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 38 - "ManagerStore"
Cohesion: 0.07
Nodes (13): openStore(), emptyState(), ManagerStore, messageSource(), storedMessage(), open(), FakeManager, createManager() (+5 more)

### Community 39 - ".sendInternal"
Cohesion: 0.13
Nodes (37): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+29 more)

### Community 40 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 41 - "session-knowledge-routes.test.ts"
Cohesion: 0.06
Nodes (24): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+16 more)

### Community 42 - "manager-store.ts"
Cohesion: 0.10
Nodes (29): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+21 more)

### Community 43 - "SessionService"
Cohesion: 0.08
Nodes (4): nodeVoiceCapabilities(), registerNodeRoutes(), isSessionResourceRoute(), SessionService

### Community 44 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 46 - "OracleVoiceClient"
Cohesion: 0.16
Nodes (6): captureClientError(), clientError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError()

### Community 47 - "real-voice.ts"
Cohesion: 0.08
Nodes (18): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+10 more)

### Community 48 - "pwa.ts"
Cohesion: 0.09
Nodes (38): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+30 more)

### Community 49 - "OracleDreamer.tsx"
Cohesion: 0.10
Nodes (31): DreamerPlanItem, DreamerPlanItemSource, DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, getDreamer(), request(), saveDreamerSettings() (+23 more)

### Community 50 - "TerminalSessionController"
Cohesion: 0.06
Nodes (16): holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), removeCopilotSessionFiles(), bootLegacy() (+8 more)

### Community 51 - "DreamerStore"
Cohesion: 0.13
Nodes (10): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, isMissing(), publicPlan() (+2 more)

### Community 52 - "manager-proactive-inbox.ts"
Cohesion: 0.07
Nodes (39): assertExactKeys(), canonicalHash(), cloneState(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isDisposition() (+31 more)

### Community 53 - "tmux-test-helpers.ts"
Cohesion: 0.12
Nodes (31): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, assertSameIdentity(), createIsolatedTmuxRoot() (+23 more)

### Community 54 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 55 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 56 - "FakeSessionService"
Cohesion: 0.07
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 57 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 58 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 59 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 60 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (34): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, eventString(), eventTask() (+26 more)

### Community 61 - "dreamer-store.ts"
Cohesion: 0.09
Nodes (32): DreamerHistoryEntry, assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_STAGING_PREFIX (+24 more)

### Community 62 - "hub-routes.ts"
Cohesion: 0.07
Nodes (35): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+27 more)

### Community 63 - "oracle-voice-routes.ts"
Cohesion: 0.12
Nodes (32): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode() (+24 more)

### Community 64 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 65 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 66 - "oracle-voice-child.test.ts"
Cohesion: 0.08
Nodes (12): childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize(), InProcessVoiceChild (+4 more)

### Community 67 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (20): VoiceStartUtterance, SocketMessage, apps, BlockingEngine, config, configFixture(), connect(), Inbox (+12 more)

### Community 68 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 69 - "DreamerService"
Cohesion: 0.18
Nodes (6): activeDreamerMemoryIds(), DreamerMemoryMetadata, DreamerService, publicSnapshot(), DreamerCompletionCandidate, DreamerSnapshot

### Community 70 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 71 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (31): AccentSetting, appearanceSettings, applySettingsChanges(), isRecord(), isSettingsRevision(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting (+23 more)

### Community 72 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (28): activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem(), digest() (+20 more)

### Community 73 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (27): ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_QUERY_CHARS (+19 more)

### Community 74 - "OracleVoiceCoordinator"
Cohesion: 0.15
Nodes (4): errorMessage(), OracleVoiceCoordinator, terminalStartupCloseCode(), ActiveConversation

### Community 75 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 76 - "src/settings-profile.ts"
Cohesion: 0.09
Nodes (24): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, statuslineItems (+16 more)

### Community 77 - "VoicePlayback"
Cohesion: 0.13
Nodes (6): pcm16ToFloat(), SegmentDrain, FakeSource, harness(), validateGeneration(), VoicePlayback

### Community 78 - "node-routes.ts"
Cohesion: 0.08
Nodes (27): closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, exactArrayBuffer() (+19 more)

### Community 79 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 80 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 81 - "HubEvent"
Cohesion: 0.12
Nodes (14): WorkspaceFixture, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, Client, Browser, seedOffset (+6 more)

### Community 82 - "react"
Cohesion: 0.09
Nodes (14): react, SessionRetention, SessionRetentionPatch, DocumentViewControls(), actions, outline, DocumentHeading, MarkdownCodeBlock() (+6 more)

### Community 83 - "session-reply-durability.test.ts"
Cohesion: 0.12
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 84 - "dreamer-service.ts"
Cohesion: 0.10
Nodes (24): DreamerPlanDraft, DreamerPlannerInput, parse(), planSchema, registerDreamerRoutes(), settingsSchema, apps, directories (+16 more)

### Community 85 - "terminal-startup-queue.test.ts"
Cohesion: 0.14
Nodes (25): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+17 more)

### Community 86 - "settings-profile-store.ts"
Cohesion: 0.13
Nodes (17): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+9 more)

### Community 87 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (22): paneEvidenceCount(), paneShowsText(), terminalFormCommitKeys(), bracketedTabPane, deliveryFixture(), desktopInstallPane, directories, downloadedUpdateFooter (+14 more)

### Community 88 - "use-oracle-conversation.test.tsx"
Cohesion: 0.12
Nodes (13): getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability, defaults (+5 more)

### Community 89 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 90 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (23): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+15 more)

### Community 91 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 92 - "KnowledgeStore"
Cohesion: 0.17
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 93 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 94 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 95 - "manager-routes.ts"
Cohesion: 0.12
Nodes (14): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+6 more)

### Community 96 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 97 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 98 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 99 - ".recoverSdkSession"
Cohesion: 0.17
Nodes (5): foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), recoveredPermissionTitle(), statusFromEvents()

### Community 100 - ".toolHost"
Cohesion: 0.13
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 101 - "ManagerStructuredMemoryStore"
Cohesion: 0.17
Nodes (7): initializeManagerStructuredMemory(), isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryState

### Community 102 - "manager-structured-memory-search.ts"
Cohesion: 0.15
Nodes (19): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext, ManagerStructuredMemorySearchIndex, normalizedText() (+11 more)

### Community 104 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 105 - "normalizeKnowledgeRelativePath"
Cohesion: 0.17
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), pathRecordSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+10 more)

### Community 106 - "ManagerProactiveInbox"
Cohesion: 0.20
Nodes (6): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

### Community 107 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 108 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 109 - "oracle-voice-coordinator.ts"
Cohesion: 0.10
Nodes (15): AudioCompletion, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OperationTimeoutError, OracleVoiceBackendConnection, PendingFinalTurn, QueuedAudio (+7 more)

### Community 110 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema, PersistedBinding (+11 more)

### Community 111 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 112 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 113 - "recovery-resend-durability.test.ts"
Cohesion: 0.12
Nodes (14): directories, disk, fixture(), gate(), gates, httpBoundary(), initialize(), PublicSessionValue (+6 more)

### Community 114 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 115 - "client.ts"
Cohesion: 0.13
Nodes (14): closeError(), closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, PendingHello (+6 more)

### Community 116 - "FakeSocket"
Cohesion: 0.12
Nodes (6): OracleVoiceSocket, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse()

### Community 117 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 118 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 119 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 120 - ".observe"
Cohesion: 0.19
Nodes (7): ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 121 - "recordValue"
Cohesion: 0.18
Nodes (18): attachmentModeValue(), backgroundHandoff(), booleanValue(), errorValue(), notificationKind(), parsedValue(), rawTailText(), recordValue() (+10 more)

### Community 122 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 123 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 124 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 125 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 126 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 127 - ".correct"
Cohesion: 0.27
Nodes (6): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput

### Community 129 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 130 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): provider(), activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession() (+8 more)

### Community 131 - "submission-error.ts"
Cohesion: 0.23
Nodes (9): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, SubmissionReceipt, submissionReceiptFromError() (+1 more)

### Community 132 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 133 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 134 - "capture.ts"
Cohesion: 0.17
Nodes (10): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, validateIdentity(), VoiceCaptureError (+2 more)

### Community 135 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 136 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 137 - "DeferredSession"
Cohesion: 0.15
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 138 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 139 - "dreamer-service.test.ts"
Cohesion: 0.13
Nodes (7): DreamerMemoryMetadataRecord, directories, DREAMER_MAX_ZONES, DREAMER_STATE_VERSION, dreamerRunKey(), directories, plan

### Community 140 - "registerSessionKnowledgeRoutes"
Cohesion: 0.27
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 141 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 142 - "send-policy.test.ts"
Cohesion: 0.16
Nodes (13): message(), sendLikeTheApp(), SessionExecutionMode, terminalSendOptions(), TerminalSendPolicyInput, TerminalSendRequestOptions, booleans, combinations (+5 more)

### Community 143 - "use-oracle-settings.ts"
Cohesion: 0.24
Nodes (12): getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+4 more)

### Community 144 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 145 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 146 - "TranscriptionService"
Cohesion: 0.20
Nodes (6): DelegatedTranscriptionOptions, registerTranscriptionRoutes(), transcriptionMultipartOptions, AudioUpload, TranscriptionService, AudioTranscription

### Community 147 - "OracleVoiceClientDependencies"
Cohesion: 0.19
Nodes (4): defaultDependencies(), OracleVoiceClientDependencies, FakePlayback, VoicePlaybackOptions

### Community 148 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 149 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 150 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 151 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 152 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (7): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 153 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.21
Nodes (10): benchmarkState(), now(), openFixture(), searchSamples(), escapedJson(), formatStructuredMemoryContext(), promptRecord(), ManagerStructuredMemorySearchResult (+2 more)

### Community 154 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 155 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 156 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 157 - "manager-proactive-inbox.test.ts"
Cohesion: 0.20
Nodes (7): ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 159 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 160 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 161 - "delegated-transcription-service.ts"
Cohesion: 0.25
Nodes (6): collect(), DelegatedTranscriptionService, oversized(), statusCodeOf(), transcriptionComputerName(), supportsAudioUpload()

### Community 162 - "file-upload-routes.ts"
Cohesion: 0.29
Nodes (8): FileUploadError, registerFileUploadRoutes(), SessionParams, extension(), MAX_SESSION_FILE_BYTES, sessionFileValidationError(), supportedExtensions, supportsSessionFile()

### Community 163 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 164 - "playback.ts"
Cohesion: 0.24
Nodes (6): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, ScheduledSource, audio(), splitAudio(), VoicePlaybackQueueError, VoicePlaybackSequenceError

### Community 166 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 167 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 168 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 169 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 170 - "transcribeAudio"
Cohesion: 0.29
Nodes (4): transcribeAudio(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 171 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 172 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 173 - "ManagerEvent"
Cohesion: 0.28
Nodes (4): ManagerEventSource, ManagerEventSource, OracleVoiceCoordinatorOptions, ManagerEvent

### Community 174 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 176 - "settings-profile.test.ts"
Cohesion: 0.25
Nodes (4): resolveAppearance(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 177 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 178 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 179 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 180 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 182 - "vad-assets.ts"
Cohesion: 0.32
Nodes (7): browserBaseUrl(), directory(), localAssetUrl(), ORACLE_VOICE_ONNX_WASM_BASE_PATH, ORACLE_VOICE_VAD_ASSETS, ORACLE_VOICE_VAD_BASE_PATH, sharedAssetDirectory()

### Community 183 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 184 - "delegated-transcription-service.test.ts"
Cohesion: 0.29
Nodes (3): hubComputer, workstation, MAX_AUDIO_BYTES

### Community 185 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 186 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 188 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 189 - "SessionStatus"
Cohesion: 0.33
Nodes (6): Seen, PersistedCursor, Row, SdkRestartRecovery, SessionStatus, PendingEchoOwner

### Community 191 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1125 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1120 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1897 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `.recoverSdkSession`, `agent-service.ts`, `contracts.ts`, `claude-agent-service.ts`, `recovery-resend-durability.test.ts`, `TerminalSessionController`, `directory-browser.ts`, `SessionDetail`, `queued-dispatch.test.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `.recoverSdkSession`, `agent-service.ts`, `ClaudeAgentService`, `contracts.ts`, `SessionDetail`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `SessionStore`, `AgentService`, `ClaudeAgentService`, `oracle-voice-session.ts`, `ManagedSession`, `manager-agent.ts`, `ManagerAgent`, `TranscriptionService`, `PushNotificationService`, `TranscriptionError`, `oracle-voice-worker.ts`, `delegated-transcription-service.ts`, `file-upload-routes.ts`, `ManagerStore`, `session-knowledge-routes.test.ts`, `manager-store.ts`, `SessionService`, `ProviderSessionService`, `DreamerService`, `SessionKnowledgeStore`, `SessionOrderStore`, `dreamer-service.ts`, `settings-profile-store.ts`, `cli-canary.ts`, `KnowledgeStore`, `manager-routes.ts`, `transcription-service.ts`, `ManagerStructuredMemoryStore`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1125 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.025313039723661484 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.02550821498189919 - nodes in this community are weakly interconnected._
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
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-17-oracle-proactive-lifecycle-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
- `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`
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
