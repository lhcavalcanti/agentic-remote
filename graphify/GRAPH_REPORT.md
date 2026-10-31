# Agentic Remote - Graphify code map

Snapshot: `8dcd7ab4d9bde6181c3f6035d0dfab36fd93fa2359988b55239556ce8d86376f`

Source checkout: `caef5c711c85cd5630d72970c535ada0bb1353ac`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 397 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 397 files · ~788,765 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6659 nodes · 18393 edges · 222 communities (186 shown, 20 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 999 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionDetail
- api.ts
- App
- App.tsx
- ClaudeAgentService
- agent-service.ts
- contracts.ts
- claude-agent-service.ts
- terminal-session.ts
- agent-service.test.ts
- OracleVoiceCoordinator
- oracle-voice-soak.ts
- agentic-remote-promotion-monitor
- oracle-voice-child.ts
- ManagedSession
- ManagerAgent
- manager-tools.ts
- sessionKey
- fake-voice.ts
- oracle-voice-integration.test.ts
- manager-structured-memory-validation.ts
- queued-dispatch.test.ts
- session-reply-durability.test.ts
- tmux-test-helpers.ts
- tmux-errors.integration.test.ts
- RemoteNodeClient
- manager-store.ts
- oracle-voice-benchmark.ts
- manager-agent.ts
- dreamer-store.ts
- markdown-navigation.ts
- TmuxTerminalSessionController
- capture.ts
- pwa.ts
- agentic-remote
- OracleVoiceClient
- oracle-voice-routes.test.ts
- bundle
- ProviderSessionService
- FakeVoiceEngine
- ManagerAssistant.tsx
- SessionService
- VoicePlayback
- real-voice.ts
- client.test.ts
- shell.ts
- lib.rs
- oracle-voice-security.test.ts
- oracle-voice-engine.ts
- ChildVoiceEngine
- hub-routes.ts
- normalizeKnowledgeRelativePath
- VoiceCapture
- agentic-remote-promotion-setup
- terminal-session.test.ts
- knowledge-tree.ts
- agentic-remote-gate
- config.rs
- app.ts
- manager-agent.test.ts
- DreamerStore
- ManagerStore
- oracle-voice-routes.ts
- dependencies
- devDependencies
- active-sessions.ts
- oracle-voice-session.ts
- manager-structured-memory.ts
- FakeSessionService
- EngineVoiceBackendSession
- OracleDreamer.tsx
- client.ts
- manager-structured-memory-search.ts
- node-routes.ts
- oracle-voice-child.test.ts
- oracle-voice-segments.ts
- remote-voice-client.ts
- oracle-voice.ts
- workspace-fixtures.ts
- session-store-providers.test.ts
- DreamerService
- PushNotificationService
- terminal-startup-queue.test.ts
- backgroundTasksFromEvents
- session-enqueue-clear.test.ts
- dreamer-planner.ts
- oracle-voice-worker.ts
- VoiceAudioFrame
- SessionKnowledgeStore
- SessionOrderStore
- settings-profile-store.ts
- shared/settings-profile.ts
- ManagerStructuredMemoryStore
- session-patch-browser.ts
- KnowledgeStore
- cli-canary.ts
- send-matrix.integration.test.ts
- scripts
- directory-browser.ts
- push-notification-service.ts
- ManagerAssistant.test.tsx
- compilerOptions
- capture-workbench-review.ts
- ChatMessage
- oracle-voice-config.ts
- .toolHost
- oracle-voice-coordinator.test.ts
- transcription-service.ts
- src/settings-profile.ts
- SettingsProfileClient
- delegated-transcription-service.test.ts
- background-task-adapter.ts
- dreamer-service.ts
- oracle-voice-tickets.ts
- session-knowledge-store.ts
- isTerminalComposerFooter
- capture-workspace.ts
- full-gate.test.ts
- startup-phases.test.ts
- refusal-metrics.ts
- PromptCards.tsx
- compilerOptions
- OnlineRecognizer
- compilerOptions
- compilerOptions
- server/side-question.ts
- .correct
- workspace-browser.ts
- SettingsProfileSnapshot
- react
- TranscriptionError
- dreamer-schedule.ts
- ManagerMemory
- BoundedQueue
- ReaderWorkspace
- session-latency-benchmark.ts
- terminal-form-deadline.test.ts
- background-task-stop.test.ts
- promotion-monitor.test.ts
- recovery-resend-durability.test.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- use-oracle-settings.ts
- scripts
- oracle-voice-assets.test.ts
- SessionResources.tsx
- fake-vad.ts
- desktop.json
- registerSessionKnowledgeRoutes
- theme-contrast.test.ts
- BackgroundTasksDialog.tsx
- OracleVoiceClientOptions
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- submission-error.ts
- session-clear-transcript.test.ts
- session-knowledge-routes.ts
- background-task-tracker.ts
- html-preview.ts
- DeferredSession
- dataset
- generate-pwa-icons.ts
- copilot-sdk-client.ts
- dreamer-routes.ts
- bridge.rs
- screenshot-stability.test.ts
- promotion-setup-execution.test.ts
- remote-node-client.test.ts
- SessionAdmissions
- vite.config.ts
- KnowledgePosition
- package.json
- recovery-context.ts
- release-publication.test.ts
- OracleVoicePlayback
- render-workspace-gifs.ts
- backgroundHandoff
- HubEvent
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- VoiceServerControl
- MarkdownCodeBlock.tsx
- api-origin.test.ts
- dreamer-app.test.ts
- promotion-setup.test.ts
- push-routes.ts
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
2. `App()` - 277 edges
3. `AgentService` - 275 edges
4. `SessionStore` - 189 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 102 edges
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

## Communities (222 total, 20 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (12): agentMode(), AgentService, isTerminalNotReadyRefusal(), isUncertainDelivery(), removeCopilotSessionFiles(), suspendedRuntimeConflict(), terminalAnswerRefused(), queueConflict() (+4 more)

### Community 1 - "SessionDetail"
Cohesion: 0.03
Nodes (77): fixture(), restart(), fixture(), createStore(), recoveryFixture(), fixture(), fixture(), fixture() (+69 more)

### Community 2 - "api.ts"
Cohesion: 0.02
Nodes (143): SessionKnowledgeBinding, SettingsChange, SettingsProfileKey, SettingsProfileValues, SettingsUpdateResult, parseSubmissionReceipt(), submissionReceiptFromError(), addComputer() (+135 more)

### Community 3 - "App"
Cohesion: 0.03
Nodes (137): isManagerEvent(), alertNotification(), terminalSendOptions(), askSession(), recoverConversation(), restartSession(), uploadSessionFile(), activeComposerPastes() (+129 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (116): AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+108 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (24): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+16 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.04
Nodes (78): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+70 more)

### Community 7 - "contracts.ts"
Cohesion: 0.03
Nodes (59): directories, voiceControlQueues, voiceControlWaiters, ProviderSessionServiceEvents, provider(), DEFINITE_DISPATCH_REFUSALS, REDIRECT_STATUSES, RemoteNodeClientEvents (+51 more)

### Community 8 - "claude-agent-service.ts"
Cohesion: 0.05
Nodes (71): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+63 more)

### Community 9 - "terminal-session.ts"
Cohesion: 0.05
Nodes (82): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed() (+74 more)

### Community 10 - "agent-service.test.ts"
Cohesion: 0.03
Nodes (58): CopilotClientLike, CopilotSessionLike, normalizedTitle(), holdProbe(), fixtures, gate(), releases, sdkPermissionEvents() (+50 more)

### Community 11 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (22): ManagerEventSource, ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect() (+14 more)

### Community 12 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 13 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 14 - "oracle-voice-child.ts"
Cohesion: 0.06
Nodes (34): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+26 more)

### Community 15 - "ManagedSession"
Cohesion: 0.10
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, normalizeNodeUrl(), FakeManager (+5 more)

### Community 16 - "ManagerAgent"
Cohesion: 0.08
Nodes (15): checkContent(), delay(), discover(), errorMessage(), isNotFound(), isPending(), isQueued(), ManagerAgent (+7 more)

### Community 17 - "manager-tools.ts"
Cohesion: 0.06
Nodes (35): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), steer() (+27 more)

### Community 18 - "sessionKey"
Cohesion: 0.06
Nodes (55): saveSessionOrderLane(), failureStampFor(), handleDragEnd(), readSelectionFromLocation(), RenameSessionDialog(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers() (+47 more)

### Community 19 - "fake-voice.ts"
Cohesion: 0.06
Nodes (11): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, FakeVoiceState, installFakeBrowserVoice() (+3 more)

### Community 20 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (31): apps, availableBackend(), BrowserCapture, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+23 more)

### Community 21 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 22 - "queued-dispatch.test.ts"
Cohesion: 0.06
Nodes (30): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), QueuedDelivery (+22 more)

### Community 23 - "session-reply-durability.test.ts"
Cohesion: 0.07
Nodes (25): persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest() (+17 more)

### Community 24 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (43): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+35 more)

### Community 25 - "tmux-errors.integration.test.ts"
Cohesion: 0.05
Nodes (31): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+23 more)

### Community 26 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (11): RemoteResync, RemoteSessionRead, RegisteredComputer, headerSafe(), RemoteNodeClient, BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt (+3 more)

### Community 27 - "manager-store.ts"
Cohesion: 0.08
Nodes (37): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+29 more)

### Community 28 - "oracle-voice-benchmark.ts"
Cohesion: 0.07
Nodes (41): execFileAsync, RealVoiceState, benchmarkFixture(), BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 29 - "manager-agent.ts"
Cohesion: 0.07
Nodes (33): ManagerAgentOptions, Rung, TURN_ACTIVITY, confirmationSchema, defaultsSchema, editSchema, effort, managerInputError() (+25 more)

### Community 30 - "dreamer-store.ts"
Cohesion: 0.07
Nodes (41): DreamerHistoryEntry, assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES (+33 more)

### Community 31 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (40): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+32 more)

### Community 32 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (13): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+5 more)

### Community 33 - "capture.ts"
Cohesion: 0.06
Nodes (22): BufferedFrame, defaultAudioContext(), positiveLimit(), QueuedAudio, CaptureControl, validateIdentity(), VoiceCaptureDependencies, VoiceCaptureErrorCode (+14 more)

### Community 34 - "pwa.ts"
Cohesion: 0.08
Nodes (42): AppVersion, parseAppVersion(), deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate() (+34 more)

### Community 35 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 36 - "OracleVoiceClient"
Cohesion: 0.14
Nodes (8): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, parseHello(), playbackClientError(), terminalCloseCode()

### Community 37 - "oracle-voice-routes.test.ts"
Cohesion: 0.06
Nodes (20): ActiveBackendSession, voiceBackend(), nodeVoiceCapabilities(), OracleVoiceManager, OracleVoiceRouteOptions, ObservedLocalVoiceBackend, openApps, openSockets (+12 more)

### Community 38 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 40 - "FakeVoiceEngine"
Cohesion: 0.08
Nodes (16): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+8 more)

### Community 41 - "ManagerAssistant.tsx"
Cohesion: 0.09
Nodes (34): cancelManager(), editQueuedManagerMessage(), resetManager(), sendManagerMessage(), phoneEnterCreatesNewline(), applyEvent(), boundWidth(), canTakeFocus() (+26 more)

### Community 42 - "SessionService"
Cohesion: 0.09
Nodes (3): registerNodeRoutes(), isSessionResourceRoute(), SessionService

### Community 43 - "VoicePlayback"
Cohesion: 0.10
Nodes (11): pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio(), validateGeneration() (+3 more)

### Community 44 - "real-voice.ts"
Cohesion: 0.08
Nodes (14): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+6 more)

### Community 45 - "client.test.ts"
Cohesion: 0.07
Nodes (11): defaultDependencies(), OracleVoiceClientDependencies, OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness() (+3 more)

### Community 46 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 47 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 48 - "oracle-voice-security.test.ts"
Cohesion: 0.07
Nodes (18): FakeManager, FakeVoiceEngineCall, apps, config, configFixture(), createManager(), issueTicket(), localRuntime() (+10 more)

### Community 49 - "oracle-voice-engine.ts"
Cohesion: 0.08
Nodes (13): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, EnabledOracleVoiceConfig, FakeVoiceEngineFactory (+5 more)

### Community 50 - "ChildVoiceEngine"
Cohesion: 0.13
Nodes (8): benchmarkGroup(), ChildVoiceEngine, errorMessage(), matchesCancelled(), matchesSynthesis(), matchesUtterance(), rememberCancellation(), VoiceChildProcess

### Community 51 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 52 - "normalizeKnowledgeRelativePath"
Cohesion: 0.09
Nodes (35): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+27 more)

### Community 53 - "VoiceCapture"
Cohesion: 0.13
Nodes (7): captureFailure(), permissionError(), harness(), VoiceCapture, VoiceCaptureError, VoiceCaptureOptions, FakeCapture

### Community 54 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 55 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (32): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+24 more)

### Community 56 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (35): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+27 more)

### Community 57 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 58 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 59 - "app.ts"
Cohesion: 0.09
Nodes (22): buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName(), FileUploadError, MAX_SESSION_FILE_BYTES (+14 more)

### Community 60 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (16): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+8 more)

### Community 61 - "DreamerStore"
Cohesion: 0.14
Nodes (9): assertUniqueJsonKeys(), clone(), DreamerCapacityError, DreamerRecoveryError, DreamerStore, isMissing(), publicPlan(), toPersistedPlan() (+1 more)

### Community 62 - "ManagerStore"
Cohesion: 0.10
Nodes (6): openStore(), emptyState(), ManagerStore, open(), createManager(), StoredManager

### Community 63 - "oracle-voice-routes.ts"
Cohesion: 0.12
Nodes (32): sendNodeVoiceOutput(), limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay(), browserCloseCode() (+24 more)

### Community 64 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 65 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 66 - "active-sessions.ts"
Cohesion: 0.12
Nodes (30): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+22 more)

### Community 67 - "oracle-voice-session.ts"
Cohesion: 0.08
Nodes (25): apps, directories, playbackSequence(), acquisitionCancelled(), ActiveUtterance, capabilityFromConfig(), createVoiceBackendSession(), DEFAULT_VOICE_BACKEND_LIMITS (+17 more)

### Community 68 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (29): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+21 more)

### Community 69 - "FakeSessionService"
Cohesion: 0.09
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 70 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 71 - "OracleDreamer.tsx"
Cohesion: 0.12
Nodes (25): DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, getDreamer(), request(), saveDreamerSettings(), snapshot, updateDreamerPlan() (+17 more)

### Community 72 - "client.ts"
Cohesion: 0.10
Nodes (23): VoiceCapabilities, getOracleVoiceCapabilities(), closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode (+15 more)

### Community 73 - "manager-structured-memory-search.ts"
Cohesion: 0.11
Nodes (26): benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson() (+18 more)

### Community 74 - "node-routes.ts"
Cohesion: 0.07
Nodes (29): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema (+21 more)

### Community 75 - "oracle-voice-child.test.ts"
Cohesion: 0.09
Nodes (12): createVoiceWorker(), childHarness(), config, FakeChildProcess, FakePiperProcess, fakeSherpa(), FakeSherpaStream, initialize() (+4 more)

### Community 76 - "oracle-voice-segments.ts"
Cohesion: 0.11
Nodes (24): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+16 more)

### Community 77 - "remote-voice-client.ts"
Cohesion: 0.16
Nodes (14): VoiceBackendDisconnectCause, VoiceBackendOutput, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError() (+6 more)

### Community 78 - "oracle-voice.ts"
Cohesion: 0.16
Nodes (29): decodeVoiceAudioFrame(), encodeVoiceAudioFrame(), hasExactKeys(), hasOnlyKeys(), hasRequiredKeys(), isBoundedTrimmedString(), isControlBase(), isFiniteNumber() (+21 more)

### Community 79 - "workspace-fixtures.ts"
Cohesion: 0.09
Nodes (26): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+18 more)

### Community 80 - "session-store-providers.test.ts"
Cohesion: 0.08
Nodes (10): RuntimeConfigurationError, claude(), clearFixture(), copilot(), disk, event(), fixtures, releases (+2 more)

### Community 81 - "DreamerService"
Cohesion: 0.20
Nodes (5): DreamerMemoryMetadata, setup(), DreamerService, publicSnapshot(), DreamerSnapshot

### Community 82 - "PushNotificationService"
Cohesion: 0.16
Nodes (6): OracleEventSource, PushNotificationService, scoped(), registerPushRoutes(), NotificationCategory, NotificationPayload

### Community 83 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (26): findActiveCopilotSessions(), appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs (+18 more)

### Community 84 - "backgroundTasksFromEvents"
Cohesion: 0.14
Nodes (30): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventString(), eventTask(), executionModeValue(), isOlderExecution() (+22 more)

### Community 85 - "session-enqueue-clear.test.ts"
Cohesion: 0.09
Nodes (25): ClaudeSdk, connect(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite() (+17 more)

### Community 86 - "dreamer-planner.ts"
Cohesion: 0.12
Nodes (26): activeDreamerMemoryIds(), activeMemoryRecord(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), digest(), DREAMER_DEFAULT_STALE_AFTER_MS (+18 more)

### Community 87 - "oracle-voice-worker.ts"
Cohesion: 0.10
Nodes (26): VoiceWorkerOptions, VoiceEndUtterance, VoiceGenerationIdentity, VoiceStartUtterance, BlockingEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig() (+18 more)

### Community 88 - "VoiceAudioFrame"
Cohesion: 0.08
Nodes (16): QueuedAudio, BrowserCaptureOptions, SocketMessage, AudioReservation, VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions (+8 more)

### Community 89 - "SessionKnowledgeStore"
Cohesion: 0.14
Nodes (8): bindingKey(), SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases, root()

### Community 90 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 91 - "settings-profile-store.ts"
Cohesion: 0.13
Nodes (19): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+11 more)

### Community 92 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (27): AccentSetting, appearanceSettings, applySettingsChanges(), isRecord(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting, NewSessionRuntimesSetting (+19 more)

### Community 93 - "ManagerStructuredMemoryStore"
Cohesion: 0.13
Nodes (8): initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryMode, ManagerStructuredMemoryStatus

### Community 94 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 95 - "KnowledgeStore"
Cohesion: 0.16
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 96 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 97 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (23): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+15 more)

### Community 98 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 99 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 100 - "push-notification-service.ts"
Cohesion: 0.14
Nodes (17): brief(), PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030, notificationAllowed() (+9 more)

### Community 101 - "ManagerAssistant.test.tsx"
Cohesion: 0.08
Nodes (13): removeQueuedManagerMessage(), resolveManagerConfirmation(), retryManagerMessage(), sessionLinkTarget(), OracleButton(), OracleControl, OracleIndicator, conversationCapability (+5 more)

### Community 102 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 103 - "capture-workbench-review.ts"
Cohesion: 0.11
Nodes (16): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, createWorkspaceFixtureState() (+8 more)

### Community 104 - "ChatMessage"
Cohesion: 0.15
Nodes (11): Connection, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset, ChatMessage, HubResyncRequest (+3 more)

### Community 105 - "oracle-voice-config.ts"
Cohesion: 0.15
Nodes (20): buildConfig(), boundedInteger(), canonicalPath(), espeakDataDirectory(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger() (+12 more)

### Community 106 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 107 - "oracle-voice-coordinator.test.ts"
Cohesion: 0.12
Nodes (11): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+3 more)

### Community 108 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 109 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (19): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+11 more)

### Community 110 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 111 - "delegated-transcription-service.test.ts"
Cohesion: 0.11
Nodes (9): BuildAppOptions, DelegatedTranscriptionOptions, DelegatedTranscriptionService, hubComputer, workstation, registerTranscriptionRoutes(), transcriptionMultipartOptions, MAX_AUDIO_BYTES (+1 more)

### Community 112 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (21): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isLiveTaskStatus(), isTerminalTaskStatus(), MAX_TASK_ACTIVITY_LINES (+13 more)

### Community 113 - "dreamer-service.ts"
Cohesion: 0.11
Nodes (15): DREAMER_MAX_ITEMS, DreamerMemoryMetadataRecord, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), digest(), DreamerPlannerExecutionInput, DreamerServiceOptions (+7 more)

### Community 114 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 115 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 116 - "isTerminalComposerFooter"
Cohesion: 0.13
Nodes (20): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+12 more)

### Community 117 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 118 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 119 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 120 - "refusal-metrics.ts"
Cohesion: 0.16
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+7 more)

### Community 121 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 122 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 123 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 124 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 125 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 126 - "server/side-question.ts"
Cohesion: 0.19
Nodes (7): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout()

### Community 127 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 128 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 129 - "SettingsProfileSnapshot"
Cohesion: 0.17
Nodes (6): SettingsProfileSnapshot, settingsProfileCacheKey, SettingsProfileTransport, cached(), FakeHub, MemoryStorage

### Community 130 - "react"
Cohesion: 0.14
Nodes (8): react, drawDiagram(), drawing, MermaidDiagram(), SessionActions(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 131 - "TranscriptionError"
Cohesion: 0.20
Nodes (7): collect(), oversized(), statusCodeOf(), LocalTranscriptionService, supportsAudioUpload(), fixture(), TranscriptionError

### Community 132 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 133 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 134 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 135 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 136 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 137 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 138 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 139 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 140 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 141 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 142 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 143 - "use-oracle-settings.ts"
Cohesion: 0.22
Nodes (13): getManager(), updateManagerSettings(), act(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus() (+5 more)

### Community 144 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 145 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 146 - "SessionResources.tsx"
Cohesion: 0.14
Nodes (11): ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, Catalog, CatalogResult, sourceLabels, statusLabels (+3 more)

### Community 147 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 148 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 149 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 150 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 151 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 152 - "OracleVoiceClientOptions"
Cohesion: 0.23
Nodes (3): OracleVoiceClientOptions, FakeVoiceClient, transcript()

### Community 153 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 154 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 155 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 156 - "submission-error.ts"
Cohesion: 0.18
Nodes (8): directories, runtimes, start(), trusted, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, SubmissionError, SubmissionReceipt

### Community 157 - "session-clear-transcript.test.ts"
Cohesion: 0.17
Nodes (8): Admission, ExclusiveAdmission, PendingQueueAdmission, disk, fixtures, gate(), holdTurnWrite(), releases

### Community 158 - "session-knowledge-routes.ts"
Cohesion: 0.15
Nodes (7): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema, SessionKnowledgeConflictError

### Community 159 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 160 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 162 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 163 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 164 - "copilot-sdk-client.ts"
Cohesion: 0.38
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, COPILOT_SDK_SESSION_INTERACTION, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 165 - "dreamer-routes.ts"
Cohesion: 0.27
Nodes (7): parse(), planSchema, registerDreamerRoutes(), settingsSchema, apps, directories, DreamerUnavailableError

### Community 166 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 167 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 168 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 169 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 171 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 172 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 173 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 174 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 175 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 177 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 178 - "backgroundHandoff"
Cohesion: 0.38
Nodes (7): attachmentModeValue(), backgroundHandoff(), booleanValue(), rawTailText(), shellStopAcknowledged(), shellTaskMode(), toolTelemetryProperties()

### Community 179 - "HubEvent"
Cohesion: 0.33
Nodes (3): ComputerManagerEvents, HubEventSource, HubEvent

### Community 180 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 181 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 182 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 183 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 184 - "VoiceServerControl"
Cohesion: 0.40
Nodes (4): connect(), Inbox, rawBuffer(), VoiceServerControl

### Community 185 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 186 - "api-origin.test.ts"
Cohesion: 0.40
Nodes (4): prefixes, session, trusted, untrusted

### Community 187 - "dreamer-app.test.ts"
Cohesion: 0.40
Nodes (3): directories, runtimes, trusted

### Community 188 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 189 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

## Knowledge Gaps
- **1098 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1093 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1859 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `directory-browser.ts`, `agent-service.ts`, `contracts.ts`, `claude-agent-service.ts`, `agent-service.test.ts`, `session-store-providers.test.ts`, `queued-dispatch.test.ts`, `session-reply-durability.test.ts`, `server/side-question.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionDetail`, `TranscriptionError`, `ClaudeAgentService`, `ManagedSession`, `ManagerAgent`, `tmux-errors.integration.test.ts`, `manager-store.ts`, `manager-agent.ts`, `pwa.ts`, `dreamer-routes.ts`, `oracle-voice-routes.test.ts`, `ProviderSessionService`, `SessionService`, `ChildVoiceEngine`, `ManagerStore`, `DreamerService`, `PushNotificationService`, `SessionKnowledgeStore`, `SessionOrderStore`, `settings-profile-store.ts`, `ManagerStructuredMemoryStore`, `KnowledgeStore`, `cli-canary.ts`, `oracle-voice-config.ts`, `transcription-service.ts`, `delegated-transcription-service.test.ts`, `refusal-metrics.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `claude-agent-service.ts`, `agent-service.ts`, `session-reply-durability.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1098 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.0372887418402933 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.028417285401420866 - nodes in this community are weakly interconnected._
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
