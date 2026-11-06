# Agentic Remote - Graphify code map

Snapshot: `58b86d52c9780064528faf4ec513cd1d9512db53c2f61369c847fe311d874fed`

Source checkout: `433712f263f74dcaf563b74561f57e948e4fac48`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 400 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 400 files · ~810,077 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6803 nodes · 18766 edges · 223 communities (182 shown, 25 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1011 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App.tsx
- api.ts
- App
- SessionDetail
- SessionStore
- AgentService
- ManagerAssistant.tsx
- session-store.ts
- claude-agent-service.ts
- queueConflict
- OracleVoiceCoordinator
- contracts.ts
- agent-service.ts
- .get
- oracle-voice-child.ts
- agentic-remote-promotion-monitor
- multi-node.test.ts
- .sendAdmittedWithBackend
- oracle-voice-soak.ts
- ManagedSession
- ManagerAgent
- oracle-voice-integration.test.ts
- PushNotificationService
- fake-voice.ts
- manager-tools.ts
- terminal-session.ts
- SessionService
- VoiceClientControl
- client.ts
- session-presentation.ts
- manager-structured-memory-validation.ts
- FakeVoiceEngine
- oracle-voice-session.ts
- oracle-voice-worker.ts
- RemoteNodeClient
- manager-store.ts
- tmux-test-helpers.ts
- markdown-navigation.ts
- send-matrix.integration.test.ts
- manager-agent.ts
- oracle-voice-benchmark.ts
- VoiceAudioFrame
- normalizeKnowledgeRelativePath
- TmuxTerminalSessionController
- workspace-fixtures.ts
- agentic-remote
- real-voice.ts
- oracle-voice-routes.ts
- pwa.ts
- bundle
- ProviderSessionService
- hub-routes.ts
- app.ts
- VoicePlayback
- OracleDreamer.tsx
- ResidentVoiceWorker
- shell.ts
- lib.rs
- agentic-remote-promotion-setup
- manager.ts
- agentic-remote-gate
- config.rs
- dreamer-store.ts
- DreamerStore
- knowledge-tree.ts
- manager-proactive-inbox.ts
- cleanDialogLine
- dependencies
- devDependencies
- active-sessions.ts
- AgentProvider
- terminal-session.test.ts
- EngineVoiceBackendSession
- ManagerStore
- manager-structured-memory.ts
- session-resource-clear.test.ts
- oracle-voice.ts
- client.test.ts
- capture-workspace.ts
- SessionOrderStore
- ReaderWorkspace
- background-task-adapter.ts
- delegated-transcription-service.ts
- oracle-voice-security.test.ts
- settings-profile-store.ts
- shared/settings-profile.ts
- backgroundTasksFromEvents
- dreamer-planner.ts
- ManagerStructuredMemoryStore
- use-oracle-conversation.test.tsx
- session-patch-browser.ts
- HubEvent
- KnowledgeStore
- cli-canary.ts
- scripts
- oracle-voice-config.ts
- directory-browser.ts
- dreamer-service.ts
- DreamerService
- manager-structured-memory-search.ts
- SessionKnowledgeStore
- SettingsProfileClient
- transcription-service.ts
- src/settings-profile.ts
- compilerOptions
- oracle-voice-routes.test.ts
- oracle-voice-segments.ts
- ManagerProactiveInbox
- capture.ts
- agent-service.test.ts
- startup-phases.test.ts
- oracle-voice-tickets.ts
- .sendInternal
- full-gate.test.ts
- session-reply-durability.test.ts
- PromptCards.tsx
- VoiceCapture
- compilerOptions
- session-store-providers.test.ts
- OnlineRecognizer
- compilerOptions
- compilerOptions
- dreamer.ts
- .correct
- refusal-metrics.ts
- session-knowledge-store.ts
- workspace-browser.ts
- SettingsProfileSnapshot
- dreamer-schedule.ts
- .toolHost
- ManagerMemory
- BoundedQueue
- session-latency-benchmark.ts
- terminal-form-deadline.test.ts
- SoakManager
- background-task-stop.test.ts
- NodeIdentityStore
- promotion-monitor.test.ts
- recovery-resend-durability.test.ts
- server/session-patches.ts
- scripts
- VoiceEngineEvent
- oracle-voice-assets.test.ts
- pending-echo.ts
- check-workspace-review-regressions.ts
- fake-vad.ts
- desktop.json
- DeferredSession
- manager-proactive-inbox.test.ts
- registerSessionKnowledgeRoutes
- theme-contrast.test.ts
- BackgroundTasksDialog.tsx
- VoiceCaptureOptions
- .oxlintrc.json
- settings-local.json
- .observe
- TranscriptionError
- Pcm16Resampler
- background-task-tracker.ts
- dreamer-routes.ts
- session-knowledge-routes.ts
- session-response-order.ts
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- ManagerProactiveInboxValidationError
- bridge.rs
- promotion-setup-execution.test.ts
- remote-node-client.test.ts
- SessionAdmissions
- session-knowledge-store.test.ts
- tmux-errors.test.ts
- VoiceVadOptions
- vite.config.ts
- package.json
- isRecord
- SpeakableSegmenter
- OracleVoiceClientDependencies
- recovery-context.ts
- release-publication.test.ts
- vad-assets.ts
- render-workspace-gifs.ts
- file-upload-routes.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- api-origin.test.ts
- dreamer-app.test.ts
- promotion-setup.test.ts
- terminal-send-uncertainty.test.ts
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
2. `App()` - 297 edges
3. `AgentService` - 276 edges
4. `SessionStore` - 189 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 103 edges
7. `registerHubRoutes()` - 93 edges
8. `buildApp()` - 92 edges
9. `ComputerManager` - 87 edges
10. `ManagerAgent` - 83 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `FakeVoiceState` --references--> `ManagerMessage`  [EXTRACTED]
  e2e/fixtures/fake-voice.ts → shared/manager.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (223 total, 25 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.02
Nodes (142): isManagerEvent(), alertNotification(), addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage() (+134 more)

### Community 1 - "api.ts"
Cohesion: 0.03
Nodes (132): ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, SettingsChange, SettingsProfileKey, SettingsUpdateResult (+124 more)

### Community 2 - "App"
Cohesion: 0.04
Nodes (149): terminalSendOptions(), sessionFileValidationError(), submissionReceiptFromError(), askSession(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey() (+141 more)

### Community 3 - "SessionDetail"
Cohesion: 0.04
Nodes (28): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services (+20 more)

### Community 4 - "SessionStore"
Cohesion: 0.04
Nodes (47): fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures (+39 more)

### Community 5 - "AgentService"
Cohesion: 0.04
Nodes (13): AgentService, normalizedTitle(), restart(), removeCopilotSessionFiles(), RuntimeConfigurationError, suspendedRuntimeConflict(), fixture(), httpBoundary() (+5 more)

### Community 6 - "ManagerAssistant.tsx"
Cohesion: 0.04
Nodes (70): react, cancelManager(), editQueuedManagerMessage(), getManager(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage() (+62 more)

### Community 7 - "session-store.ts"
Cohesion: 0.02
Nodes (64): CopilotClientLike, holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents(), directories (+56 more)

### Community 8 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (64): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+56 more)

### Community 9 - "queueConflict"
Cohesion: 0.05
Nodes (37): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+29 more)

### Community 10 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (21): ManagerEventSource, ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect() (+13 more)

### Community 11 - "contracts.ts"
Cohesion: 0.03
Nodes (64): ServerRole, ClaudeAgentServiceEvents, managers, releases, remote, RemoteResync, RemoteSessionListing, RemoteSessionRead (+56 more)

### Community 12 - "agent-service.ts"
Cohesion: 0.05
Nodes (72): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+64 more)

### Community 13 - ".get"
Cohesion: 0.07
Nodes (7): agentMode(), foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), recoveredPermissionTitle(), statusFromEvents(), TranscriptObservation

### Community 14 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (48): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, createVoiceWorker(), defaultSpawnPiper(), errorMessage() (+40 more)

### Community 15 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 16 - "multi-node.test.ts"
Cohesion: 0.04
Nodes (19): directories, FakeSessionService, routingFixture(), session(), temporaryDirectory(), voiceControlQueues, voiceControlWaiters, provider() (+11 more)

### Community 17 - ".sendAdmittedWithBackend"
Cohesion: 0.06
Nodes (13): commandShortcut(), isTerminalNotReadyRefusal(), isUncertainDelivery(), persistedFormAnswer(), stripAnsi(), terminalAnswerRefused(), TerminalFormContinuation, isRetainedRefusal() (+5 more)

### Community 18 - "oracle-voice-soak.ts"
Cohesion: 0.06
Nodes (35): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+27 more)

### Community 19 - "ManagedSession"
Cohesion: 0.10
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), fixture(), session(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier (+5 more)

### Community 20 - "ManagerAgent"
Cohesion: 0.09
Nodes (13): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+5 more)

### Community 21 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (32): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+24 more)

### Community 22 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 23 - "fake-voice.ts"
Cohesion: 0.05
Nodes (11): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice() (+3 more)

### Community 24 - "manager-tools.ts"
Cohesion: 0.06
Nodes (35): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), steer() (+27 more)

### Community 25 - "terminal-session.ts"
Cohesion: 0.05
Nodes (61): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerRowText() (+53 more)

### Community 26 - "SessionService"
Cohesion: 0.05
Nodes (26): closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+18 more)

### Community 27 - "VoiceClientControl"
Cohesion: 0.07
Nodes (29): RegisteredComputer, RegistryState, directories, VoiceBackendDisconnectCause, RemoteNodeRedirectError, RemoteNodeRequestError, closeReason(), exactArrayBuffer() (+21 more)

### Community 28 - "client.ts"
Cohesion: 0.09
Nodes (21): ORACLE_VOICE_CONNECTION_TIMEOUT_MS, captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord(), isTicket() (+13 more)

### Community 29 - "session-presentation.ts"
Cohesion: 0.07
Nodes (50): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+42 more)

### Community 30 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 31 - "FakeVoiceEngine"
Cohesion: 0.05
Nodes (22): EnabledOracleVoiceConfig, FakeVoiceEngine, FakeVoiceEngineCall, FakeVoiceEngineFactory, identityKey(), isCancelled(), sameGeneration(), config (+14 more)

### Community 32 - "oracle-voice-session.ts"
Cohesion: 0.05
Nodes (36): ActiveBackendSession, apps, directories, exactArrayBuffer(), rawDataBuffer(), rawDataByteLength(), receiveNodeVoiceMessage(), playbackSequence() (+28 more)

### Community 33 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (24): benchmarkGroup(), ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys(), isCancelledEvent() (+16 more)

### Community 34 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (10): normalizeNodeUrl(), RemoteNodeClient, AddComputerInput, BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing (+2 more)

### Community 35 - "manager-store.ts"
Cohesion: 0.07
Nodes (37): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+29 more)

### Community 36 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (44): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+36 more)

### Community 37 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (43): executeCommand(), readWorkspaceFile(), searchWorkspace(), ChangeDirectoryDialog(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+35 more)

### Community 38 - "send-matrix.integration.test.ts"
Cohesion: 0.05
Nodes (47): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+39 more)

### Community 39 - "manager-agent.ts"
Cohesion: 0.06
Nodes (25): isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Rung (+17 more)

### Community 40 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (40): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+32 more)

### Community 41 - "VoiceAudioFrame"
Cohesion: 0.05
Nodes (25): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, QueuedAudio, capabilities, confirm(), control(), defaults (+17 more)

### Community 42 - "normalizeKnowledgeRelativePath"
Cohesion: 0.08
Nodes (39): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), SessionKnowledgeBinding, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+31 more)

### Community 43 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (13): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+5 more)

### Community 44 - "workspace-fixtures.ts"
Cohesion: 0.07
Nodes (33): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, createWorkspaceFixtureState() (+25 more)

### Community 45 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 46 - "real-voice.ts"
Cohesion: 0.07
Nodes (16): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+8 more)

### Community 47 - "oracle-voice-routes.ts"
Cohesion: 0.09
Nodes (34): nodeVoiceCapabilities(), sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes() (+26 more)

### Community 48 - "pwa.ts"
Cohesion: 0.09
Nodes (40): AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart() (+32 more)

### Community 49 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 51 - "hub-routes.ts"
Cohesion: 0.06
Nodes (40): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+32 more)

### Community 52 - "app.ts"
Cohesion: 0.08
Nodes (25): buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), FileUploadError (+17 more)

### Community 53 - "VoicePlayback"
Cohesion: 0.09
Nodes (12): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio() (+4 more)

### Community 54 - "OracleDreamer.tsx"
Cohesion: 0.10
Nodes (32): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, getDreamer() (+24 more)

### Community 55 - "ResidentVoiceWorker"
Cohesion: 0.14
Nodes (8): combinedTranscript(), matchesCancelled(), pcm16ToFloat32(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream, VoiceGenerationIdentity, VoiceSynthesisRequest

### Community 56 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 57 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 58 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 59 - "manager.ts"
Cohesion: 0.09
Nodes (26): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+18 more)

### Community 60 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 61 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 62 - "dreamer-store.ts"
Cohesion: 0.09
Nodes (31): assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES, DREAMER_STAGING_PREFIX (+23 more)

### Community 63 - "DreamerStore"
Cohesion: 0.14
Nodes (9): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerRecoveryError, DreamerStore, isMissing(), publicPlan(), toPersistedPlan() (+1 more)

### Community 64 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 65 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (35): assertExactKeys(), DISPOSITIONS, EVENT_KINDS, hasExactKeys(), isDisposition(), isEventKind(), isId(), isOrigin() (+27 more)

### Community 66 - "cleanDialogLine"
Cohesion: 0.14
Nodes (31): activeBottomFrame(), captureBeforeDeadline(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), FormReplyDeadlineError (+23 more)

### Community 67 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 68 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 69 - "active-sessions.ts"
Cohesion: 0.12
Nodes (32): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+24 more)

### Community 70 - "AgentProvider"
Cohesion: 0.08
Nodes (20): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+12 more)

### Community 71 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (29): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse(), pastedPlaceholderCount() (+21 more)

### Community 72 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 73 - "ManagerStore"
Cohesion: 0.11
Nodes (6): openStore(), emptyState(), ManagerStore, open(), createManager(), StoredManager

### Community 74 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (28): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+20 more)

### Community 75 - "session-resource-clear.test.ts"
Cohesion: 0.08
Nodes (28): ClaudeSdk, deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, disk (+20 more)

### Community 76 - "oracle-voice.ts"
Cohesion: 0.16
Nodes (29): decodeVoiceAudioFrame(), encodeVoiceAudioFrame(), hasExactKeys(), hasOnlyKeys(), hasRequiredKeys(), isBoundedTrimmedString(), isControlBase(), isFiniteNumber() (+21 more)

### Community 77 - "client.test.ts"
Cohesion: 0.09
Nodes (9): OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse() (+1 more)

### Community 78 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 79 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 80 - "ReaderWorkspace"
Cohesion: 0.10
Nodes (17): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview() (+9 more)

### Community 81 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (26): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus(), isOlderExecution(), isShellObserverTool() (+18 more)

### Community 82 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (12): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+4 more)

### Community 83 - "oracle-voice-security.test.ts"
Cohesion: 0.09
Nodes (15): apps, config, configFixture(), createManager(), issueTicket(), localRuntime(), otherAllowed, requestJson() (+7 more)

### Community 84 - "settings-profile-store.ts"
Cohesion: 0.12
Nodes (17): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+9 more)

### Community 85 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (28): AccentSetting, appearanceSettings, isRecord(), isSettingsDeviceId(), isSettingsRevision(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting (+20 more)

### Community 86 - "backgroundTasksFromEvents"
Cohesion: 0.18
Nodes (28): addActivity(), attachmentModeValue(), backgroundHandoff(), backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue(), eventString() (+20 more)

### Community 87 - "dreamer-planner.ts"
Cohesion: 0.15
Nodes (24): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+16 more)

### Community 88 - "ManagerStructuredMemoryStore"
Cohesion: 0.13
Nodes (10): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open() (+2 more)

### Community 89 - "use-oracle-conversation.test.tsx"
Cohesion: 0.12
Nodes (13): getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability, defaults (+5 more)

### Community 90 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 91 - "HubEvent"
Cohesion: 0.13
Nodes (14): Connection, WorkspaceFixture, ComputerManagerEvents, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset (+6 more)

### Community 92 - "KnowledgeStore"
Cohesion: 0.16
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 93 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 94 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 95 - "oracle-voice-config.ts"
Cohesion: 0.14
Nodes (22): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+14 more)

### Community 96 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 97 - "dreamer-service.ts"
Cohesion: 0.10
Nodes (17): DreamerMemoryMetadata, DreamerMemoryMetadataRecord, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), projectDreamerRegistry(), projectRegistryEntry(), digest() (+9 more)

### Community 98 - "DreamerService"
Cohesion: 0.22
Nodes (5): DreamerService, publicSnapshot(), DreamerRunClaim, dreamerRunKey(), DreamerSnapshot

### Community 99 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 100 - "SessionKnowledgeStore"
Cohesion: 0.16
Nodes (6): bindingKey(), SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateSchema, stateWithPaths(), UpdateSessionKnowledgeRootInput

### Community 101 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 102 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 103 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (20): AppearanceSetting, NewSessionRuntime, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+12 more)

### Community 104 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 105 - "oracle-voice-routes.test.ts"
Cohesion: 0.11
Nodes (10): FakeManager, openApps, openSockets, RouteManager, runtime(), testRoot(), testRoots, trusted (+2 more)

### Community 106 - "oracle-voice-segments.ts"
Cohesion: 0.14
Nodes (22): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+14 more)

### Community 107 - "ManagerProactiveInbox"
Cohesion: 0.19
Nodes (5): cloneState(), ManagerProactiveInbox, ManagerProactiveInboxPersistenceError, nowIso(), openInbox()

### Community 108 - "capture.ts"
Cohesion: 0.12
Nodes (12): BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity() (+4 more)

### Community 109 - "agent-service.test.ts"
Cohesion: 0.13
Nodes (12): terminalFormSteps(), busyTerminal(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService(), services (+4 more)

### Community 110 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (13): phases, port, createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address (+5 more)

### Community 111 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 112 - ".sendInternal"
Cohesion: 0.19
Nodes (12): capturePane(), composerHoldsText(), composerText(), isTerminalAgentWorking(), isTerminalLoading(), isTerminalOverlay(), isTerminalSessionInUsePrompt(), isTerminalVisiblyIdle() (+4 more)

### Community 113 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 114 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 115 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 117 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 118 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 119 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 120 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 121 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 122 - "dreamer.ts"
Cohesion: 0.17
Nodes (11): DreamerHistoryEntry, DreamerConflictError, DreamerHistoryEntry, sameCompletionEvidence(), sameIds(), DreamerCompletionCandidate, DreamerPlanItemSource, DreamerPlanItemStatus (+3 more)

### Community 123 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 124 - "refusal-metrics.ts"
Cohesion: 0.16
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+7 more)

### Community 125 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (17): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+9 more)

### Community 126 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 127 - "SettingsProfileSnapshot"
Cohesion: 0.17
Nodes (6): SettingsProfileSnapshot, settingsProfileCacheKey, SettingsProfileTransport, cached(), FakeHub, MemoryStorage

### Community 128 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 130 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 131 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 132 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 133 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 135 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 136 - "NodeIdentityStore"
Cohesion: 0.22
Nodes (3): ComputerRegistry, remoteSnapshotFixture(), NodeIdentityStore

### Community 137 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 138 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 139 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 140 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 141 - "VoiceEngineEvent"
Cohesion: 0.18
Nodes (7): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, VoiceEngineEvent

### Community 142 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 143 - "pending-echo.ts"
Cohesion: 0.24
Nodes (11): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, PendingEchoOwner, prunePendingEchoMap() (+3 more)

### Community 144 - "check-workspace-review-regressions.ts"
Cohesion: 0.15
Nodes (11): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+3 more)

### Community 145 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 146 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 147 - "DeferredSession"
Cohesion: 0.16
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 148 - "manager-proactive-inbox.test.ts"
Cohesion: 0.16
Nodes (9): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState() (+1 more)

### Community 149 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 150 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 151 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 153 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 154 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 155 - ".observe"
Cohesion: 0.21
Nodes (7): canonicalHash(), eventId(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId()

### Community 156 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 157 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 158 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 159 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): parse(), planSchema, registerDreamerRoutes(), settingsSchema, apps, directories, setup(), DreamerUnavailableError

### Community 160 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 161 - "session-response-order.ts"
Cohesion: 0.33
Nodes (9): carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt(), failure (+1 more)

### Community 162 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 163 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 164 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 165 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 166 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 167 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 168 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 170 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 171 - "tmux-errors.test.ts"
Cohesion: 0.25
Nodes (6): directories, { execute }, files, links, listener(), server()

### Community 173 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 174 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 175 - "isRecord"
Cohesion: 0.39
Nodes (4): isAlreadyExists(), isMissing(), isRecord(), ManagerProactiveInboxRecoveryError

### Community 178 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 179 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 180 - "vad-assets.ts"
Cohesion: 0.32
Nodes (7): browserBaseUrl(), directory(), localAssetUrl(), ORACLE_VOICE_ONNX_WASM_BASE_PATH, ORACLE_VOICE_VAD_ASSETS, ORACLE_VOICE_VAD_BASE_PATH, sharedAssetDirectory()

### Community 181 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 182 - "file-upload-routes.ts"
Cohesion: 0.43
Nodes (5): SessionParams, extension(), MAX_SESSION_FILE_BYTES, supportedExtensions, supportsSessionFile()

### Community 183 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 184 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 185 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 186 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 187 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 188 - "api-origin.test.ts"
Cohesion: 0.40
Nodes (4): prefixes, session, trusted, untrusted

### Community 189 - "dreamer-app.test.ts"
Cohesion: 0.40
Nodes (3): directories, runtimes, trusted

### Community 190 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

## Knowledge Gaps
- **1125 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1120 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1897 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `directory-browser.ts`, `SessionDetail`, `claude-agent-service.ts`, `queueConflict`, `agent-service.ts`, `.get`, `multi-node.test.ts`, `.sendAdmittedWithBackend`, `background-task-adapter.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `SessionDetail`, `AgentService`, `session-store.ts`, `claude-agent-service.ts`, `queueConflict`, `.get`, `multi-node.test.ts`, `.sendAdmittedWithBackend`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `SessionDetail`, `SessionStore`, `AgentService`, `NodeIdentityStore`, `.sendAdmittedWithBackend`, `oracle-voice-soak.ts`, `ManagedSession`, `ManagerAgent`, `PushNotificationService`, `SessionService`, `TranscriptionError`, `dreamer-routes.ts`, `oracle-voice-worker.ts`, `manager-store.ts`, `manager-agent.ts`, `pwa.ts`, `ProviderSessionService`, `manager.ts`, `ManagerStore`, `SessionOrderStore`, `delegated-transcription-service.ts`, `settings-profile-store.ts`, `ManagerStructuredMemoryStore`, `KnowledgeStore`, `cli-canary.ts`, `oracle-voice-config.ts`, `DreamerService`, `SessionKnowledgeStore`, `transcription-service.ts`, `refusal-metrics.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1125 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.01869295363271267 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.026669851126502667 - nodes in this community are weakly interconnected._
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
