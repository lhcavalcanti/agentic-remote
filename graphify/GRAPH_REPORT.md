# Agentic Remote - Graphify code map

Snapshot: `1213c7dbfeaea409be130176866b81fd54d2ee3ca2f56e1e0b1b3abf7d851396`

Source checkout: `98d7197c5a496322d765c21cda47794778777b29`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 379 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 379 files · ~741,943 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6351 nodes · 17461 edges · 219 communities (171 shown, 32 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 961 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- SessionStore
- api.ts
- App.tsx
- contracts.ts
- ClaudeAgentService
- agent-service.ts
- SessionDetail
- claude-agent-service.ts
- oracle-voice-session.ts
- agentic-remote-promotion-monitor
- terminal-session.ts
- oracle-voice-soak.ts
- CopilotSessionLike
- ManagedSession
- PushNotificationService
- oracle-voice-integration.test.ts
- fake-voice.ts
- ManagerAgent
- manager-tools.ts
- ManagerAssistant.tsx
- oracle-voice.ts
- manager-structured-memory-validation.ts
- session-presentation.ts
- session-reply-durability.test.ts
- send-matrix.integration.test.ts
- manager-context.ts
- workspace-fixtures.ts
- FakeVoiceEngine
- TmuxTerminalSessionController
- multi-node.test.ts
- markdown-navigation.ts
- oracle-voice-coordinator.ts
- oracle-voice-benchmark.ts
- tmux-test-helpers.ts
- agentic-remote
- app.ts
- manager-agent.ts
- OracleVoiceClient
- bundle
- active-sessions.ts
- hub-routes.ts
- session-service.ts
- ResidentVoiceWorker
- ProviderSessionService
- .sendInternal
- ManagerStore
- CopilotClientLike
- SessionService
- pwa.ts
- VoicePlayback
- shell.ts
- lib.rs
- manager.ts
- agentic-remote-promotion-setup
- AgentProvider
- agentic-remote-gate
- config.rs
- FakeSessionService
- ChildVoiceEngine
- knowledge-tree.ts
- dependencies
- devDependencies
- terminal-session.test.ts
- react
- oracle-voice-child.ts
- EngineVoiceBackendSession
- node-routes.ts
- oracle-voice-worker.ts
- SessionKnowledgeStore
- real-voice.ts
- shared/settings-profile.ts
- oracle-voice-security.test.ts
- manager-structured-memory.ts
- oracle-voice-routes.ts
- remote-voice-client.ts
- SessionOrderStore
- KnowledgeStore
- session-store-providers.test.ts
- HubEvent
- delegated-transcription-service.ts
- session-patch-browser.ts
- oracle-voice-child.test.ts
- backgroundTasksFromEvents
- cli-canary.ts
- manager-structured-memory-search.ts
- scripts
- directory-browser.ts
- manager-routes.ts
- VoiceCapture
- ManagerStructuredMemoryStore
- settings-profile-store.ts
- transcription-service.ts
- src/settings-profile.ts
- compilerOptions
- background-task-adapter.ts
- client.test.ts
- SettingsProfileClient
- .deleteSerialized
- capture-workspace.ts
- normalizeKnowledgeRelativePath
- VoiceWorkerParentMessage
- OracleVoiceCoordinator
- oracle-voice-segments.ts
- oracle-voice-tickets.ts
- session-resource-clear.test.ts
- full-gate.test.ts
- oracle-voice-config.ts
- session-knowledge-store.ts
- PromptCards.tsx
- capture.ts
- client.ts
- compilerOptions
- .confirmSpeech
- refusal-metrics.ts
- OnlineRecognizer
- compilerOptions
- compilerOptions
- ComputerSummary
- .correct
- workspace-browser.ts
- ManagerMemory
- NewSessionDialog
- use-session-knowledge-root.ts
- BoundedQueue
- session-latency-benchmark.ts
- use-oracle-settings.ts
- ReaderWorkspace
- RuntimeReasoningEffort
- terminal-form-deadline.test.ts
- background-task-stop.test.ts
- promotion-monitor.test.ts
- recovery-resend-durability.test.ts
- submission-error.ts
- server/session-patches.ts
- scripts
- manager-runtime.ts
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- OracleVoiceClientDependencies
- registerSessionKnowledgeRoutes
- SettingsProfileStore
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- VoiceTurnState
- TranscriptionError
- Pcm16Resampler
- DeferredSession
- background-task-tracker.ts
- BackgroundTasksDialog.tsx
- session-knowledge-routes.ts
- dataset
- generate-pwa-icons.ts
- file-upload-routes.ts
- SpeakableSegmenter
- bridge.rs
- VoiceCaptureOptions
- screenshot-stability.test.ts
- KnowledgePosition
- .drainAudio
- promotion-setup-execution.test.ts
- SessionAdmissions
- tmux-errors.test.ts
- capture.test.ts
- VoiceVadOptions
- vite.config.ts
- package.json
- normalizeBackgroundTask
- release-publication.test.ts
- oracle-conversation-real.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- OracleVoicePlayback
- composer-layout.test.ts
- .receive
- VoiceSttEngine
- recovery-context.ts
- promotion-setup.test.ts
- appearance.ts
- FakeRecorder
- MemoryStorage
- FakeRecorder
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
1. `SessionDetail` - 299 edges
2. `App()` - 273 edges
3. `AgentService` - 264 edges
4. `SessionStore` - 178 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 99 edges
7. `registerHubRoutes()` - 92 edges
8. `buildApp()` - 90 edges
9. `ComputerManager` - 87 edges
10. `ManagerAgent` - 82 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `FakeVoiceState` --references--> `ManagerMessage`  [EXTRACTED]
  e2e/fixtures/fake-voice.ts → shared/manager.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (219 total, 32 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (18): agentMode(), AgentService, commandShortcut(), isTerminalNotReadyRefusal(), isUncertainDelivery(), normalizedTitle(), removeCopilotSessionFiles(), stripAnsi() (+10 more)

### Community 1 - "App"
Cohesion: 0.03
Nodes (162): askSession(), cancelSession(), deleteKnowledgeRoot(), getSession(), moveSessionToTmux(), replyPermission(), replyUserInput(), resumeSession() (+154 more)

### Community 2 - "SessionStore"
Cohesion: 0.03
Nodes (98): fixture(), holdProbe(), fixtures, gate(), releases, restart(), directories, fakeClient() (+90 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (115): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelManager(), clearConversation() (+107 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (109): addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+101 more)

### Community 5 - "contracts.ts"
Cohesion: 0.03
Nodes (58): AgentServiceEvents, ServerRole, ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, SessionMetadataLookup, ProviderSessionServiceEvents (+50 more)

### Community 6 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (24): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+16 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.04
Nodes (77): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+69 more)

### Community 8 - "SessionDetail"
Cohesion: 0.05
Nodes (9): observe(), assertSessionNotRetained(), clearRecoverySeedFailure(), SdkQueueAdmission, TerminalQueueDispatch, acceptedStartupRecovery(), ConfigureRuntimeInput, QueuedPrompt (+1 more)

### Community 9 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (59): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+51 more)

### Community 10 - "oracle-voice-session.ts"
Cohesion: 0.04
Nodes (38): apps, directories, voiceBackend(), nodeVoiceCapabilities(), EnabledOracleVoiceConfig, FakeVoiceEngineFactory, VoiceEngineFactory, GatedVoiceEngineFactory (+30 more)

### Community 11 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 12 - "terminal-session.ts"
Cohesion: 0.04
Nodes (71): composer(), processAdapter, boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus() (+63 more)

### Community 13 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 14 - "CopilotSessionLike"
Cohesion: 0.04
Nodes (37): CopilotSessionLike, configurableModel(), FakeCopilotClient, probeService(), startupFifoFixture(), terminalService(), CopilotTasksApi, acceptanceReceipt() (+29 more)

### Community 15 - "ManagedSession"
Cohesion: 0.10
Nodes (11): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, normalizeNodeUrl() (+3 more)

### Community 16 - "PushNotificationService"
Cohesion: 0.06
Nodes (32): ManagerEventSource, trusted, brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender (+24 more)

### Community 17 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (35): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+27 more)

### Community 18 - "fake-voice.ts"
Cohesion: 0.05
Nodes (15): ActiveBackendSession, beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, FakeVoiceState (+7 more)

### Community 19 - "ManagerAgent"
Cohesion: 0.10
Nodes (12): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+4 more)

### Community 20 - "manager-tools.ts"
Cohesion: 0.06
Nodes (33): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), structuredTools() (+25 more)

### Community 21 - "ManagerAssistant.tsx"
Cohesion: 0.06
Nodes (47): ManagerSessionRef, ManagerStatus, editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage() (+39 more)

### Community 22 - "oracle-voice.ts"
Cohesion: 0.07
Nodes (46): sendNodeVoiceOutput(), config, outputBytes(), backendOutputBytes(), VoiceFinalTranscript, VoiceFrameAcceptance, VoiceTurnPhase, VoiceTurnStateOptions (+38 more)

### Community 23 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 24 - "session-presentation.ts"
Cohesion: 0.07
Nodes (47): KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, computers, first, grouped, hidden (+39 more)

### Community 25 - "session-reply-durability.test.ts"
Cohesion: 0.07
Nodes (26): persistedFormAnswer(), terminalAnswerRefused(), TerminalFormContinuation, validateUserInputForm(), answer(), assistantFixture(), claudeFixture(), claudeQuestions() (+18 more)

### Community 26 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (46): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+38 more)

### Community 27 - "manager-context.ts"
Cohesion: 0.08
Nodes (34): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+26 more)

### Community 28 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (40): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+32 more)

### Community 29 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (25): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine (+17 more)

### Community 30 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (14): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+6 more)

### Community 31 - "multi-node.test.ts"
Cohesion: 0.06
Nodes (23): fixture(), managers, releases, remote, session(), ComputerRegistry, RegistryState, directories (+15 more)

### Community 32 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (40): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+32 more)

### Community 33 - "oracle-voice-coordinator.ts"
Cohesion: 0.06
Nodes (25): ManagerEventSource, backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OracleVoiceBackendConnection, OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput (+17 more)

### Community 34 - "oracle-voice-benchmark.ts"
Cohesion: 0.08
Nodes (41): benchmarkFixture(), benchmarkGroup(), BenchmarkMetric, BenchmarkProfile, buildConfig(), CliOptions, clockTicksPerSecond(), CorpusFixture (+33 more)

### Community 35 - "tmux-test-helpers.ts"
Cohesion: 0.10
Nodes (38): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, deliveryFixture(), noTmuxServer() (+30 more)

### Community 36 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 37 - "app.ts"
Cohesion: 0.07
Nodes (25): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+17 more)

### Community 38 - "manager-agent.ts"
Cohesion: 0.06
Nodes (21): isPending(), isQueued(), ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Rung, Behavior (+13 more)

### Community 39 - "OracleVoiceClient"
Cohesion: 0.15
Nodes (7): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, playbackClientError(), terminalCloseCode()

### Community 40 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 41 - "active-sessions.ts"
Cohesion: 0.09
Nodes (39): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+31 more)

### Community 42 - "hub-routes.ts"
Cohesion: 0.06
Nodes (41): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+33 more)

### Community 43 - "session-service.ts"
Cohesion: 0.07
Nodes (18): phases, port, safeUploadName(), createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord (+10 more)

### Community 44 - "ResidentVoiceWorker"
Cohesion: 0.12
Nodes (9): combinedTranscript(), float32ToPcm16(), matchesCancelled(), pcm16ToFloat32(), readBoundedText(), ResidentVoiceWorker, SherpaRecognizer, SherpaStream (+1 more)

### Community 46 - ".sendInternal"
Cohesion: 0.13
Nodes (33): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), composerHoldsText(), composerText() (+25 more)

### Community 47 - "ManagerStore"
Cohesion: 0.08
Nodes (10): openStore(), emptyState(), ManagerStore, messageSource(), storedMessage(), open(), createManager(), StoredManager (+2 more)

### Community 48 - "CopilotClientLike"
Cohesion: 0.05
Nodes (22): CopilotClientLike, fixtures, recoverAndSeed(), releases, CopilotSdkMissingSessionRetirement, bootLegacy(), directories, execute (+14 more)

### Community 50 - "pwa.ts"
Cohesion: 0.10
Nodes (36): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle() (+28 more)

### Community 51 - "VoicePlayback"
Cohesion: 0.10
Nodes (11): pcm16ToFloat(), ScheduledSource, SegmentDrain, audio(), FakeSource, harness(), splitAudio(), validateGeneration() (+3 more)

### Community 52 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 53 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 54 - "manager.ts"
Cohesion: 0.08
Nodes (23): AgentMode, isManagerEvent(), MANAGER_MESSAGE_MAX_LENGTH, ManagerClientDefaults, ManagerConfirmation, ManagerMessageRole, ManagerMessageState, ManagerSubmissionSource (+15 more)

### Community 55 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 56 - "AgentProvider"
Cohesion: 0.07
Nodes (23): message(), sendLikeTheApp(), apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp() (+15 more)

### Community 57 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 58 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 60 - "ChildVoiceEngine"
Cohesion: 0.13
Nodes (7): ChildVoiceEngine, errorMessage(), matchesCancelled(), matchesSynthesis(), matchesUtterance(), rememberCancellation(), VoiceChildProcess

### Community 61 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 62 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 63 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 64 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (29): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse(), pastedPlaceholderCount() (+21 more)

### Community 65 - "react"
Cohesion: 0.09
Nodes (19): react, SessionRetention, SessionRetentionPatch, blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP (+11 more)

### Community 66 - "oracle-voice-child.ts"
Cohesion: 0.09
Nodes (27): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, createVoiceWorker(), defaultSpawnPiper(), errorMessage() (+19 more)

### Community 67 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 68 - "node-routes.ts"
Cohesion: 0.07
Nodes (30): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema (+22 more)

### Community 69 - "oracle-voice-worker.ts"
Cohesion: 0.09
Nodes (25): VoiceEndUtterance, VoiceGenerationIdentity, VoiceStartUtterance, VoiceTtsEngine, BlockingEngine, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig() (+17 more)

### Community 70 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 71 - "real-voice.ts"
Cohesion: 0.10
Nodes (13): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+5 more)

### Community 72 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (29): AccentSetting, AppearanceSetting, appearanceSettings, applySettingsChanges(), isRecord(), NewSessionFoldersSetting, NewSessionRuntimesSetting, oneOf() (+21 more)

### Community 73 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (19): SocketMessage, apps, config, configFixture(), connect(), Inbox, issueTicket(), localRuntime() (+11 more)

### Community 74 - "manager-structured-memory.ts"
Cohesion: 0.09
Nodes (25): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+17 more)

### Community 75 - "oracle-voice-routes.ts"
Cohesion: 0.14
Nodes (26): limits(), availableCapabilities(), backendOutputRelay(), browserCloseCode(), closeReason(), disconnectCause(), errorMessage(), exactArrayBuffer() (+18 more)

### Community 76 - "remote-voice-client.ts"
Cohesion: 0.18
Nodes (12): VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient (+4 more)

### Community 77 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 78 - "KnowledgeStore"
Cohesion: 0.14
Nodes (9): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, FakeManager, fixture(), createHub() (+1 more)

### Community 79 - "session-store-providers.test.ts"
Cohesion: 0.08
Nodes (11): RuntimeConfigurationError, claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite() (+3 more)

### Community 80 - "HubEvent"
Cohesion: 0.12
Nodes (15): Connection, WorkspaceFixture, ComputerManagerEvents, Client, PatchSocket, Browser, seedOffset, StoredSession (+7 more)

### Community 81 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (13): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+5 more)

### Community 82 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 83 - "oracle-voice-child.test.ts"
Cohesion: 0.09
Nodes (10): engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, config, FakeSherpaStream (+2 more)

### Community 84 - "backgroundTasksFromEvents"
Cohesion: 0.19
Nodes (27): addActivity(), backgroundHandoff(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventString(), eventTask(), lastForegroundCompletionAt() (+19 more)

### Community 85 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 86 - "manager-structured-memory-search.ts"
Cohesion: 0.13
Nodes (23): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+15 more)

### Community 87 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 88 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 89 - "manager-routes.ts"
Cohesion: 0.11
Nodes (15): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+7 more)

### Community 90 - "VoiceCapture"
Cohesion: 0.21
Nodes (3): captureFailure(), harness(), VoiceCapture

### Community 91 - "ManagerStructuredMemoryStore"
Cohesion: 0.15
Nodes (9): capturePrompt(), benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore (+1 more)

### Community 92 - "settings-profile-store.ts"
Cohesion: 0.16
Nodes (11): SettingsProfileState, applySettingsImport(), isSettingsProfileKey(), SettingsProfileRecord, SettingsProfileSnapshot, validateSettingsImport(), seedHubSettings(), resolveAppearance() (+3 more)

### Community 93 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 94 - "src/settings-profile.ts"
Cohesion: 0.13
Nodes (21): isSettingsDeviceId(), isSettingsRevision(), SettingsChange, SettingsProfileKey, SettingsProfileValues, SettingsUpdateResult, statuslineItems, CachedProfile (+13 more)

### Community 95 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 96 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (22): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus() (+14 more)

### Community 97 - "client.test.ts"
Cohesion: 0.11
Nodes (6): capabilities, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse()

### Community 98 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 99 - ".deleteSerialized"
Cohesion: 0.14
Nodes (4): sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout()

### Community 100 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 101 - "normalizeKnowledgeRelativePath"
Cohesion: 0.17
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), pathRecordSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+10 more)

### Community 102 - "VoiceWorkerParentMessage"
Cohesion: 0.12
Nodes (9): childHarness(), FakeChildProcess, FakePiperProcess, fakeSherpa(), initialize(), InProcessVoiceChild, parentHarness(), VoiceWorker (+1 more)

### Community 103 - "OracleVoiceCoordinator"
Cohesion: 0.19
Nodes (3): OracleVoiceCoordinator, terminalStartupCloseCode(), ActiveConversation

### Community 104 - "oracle-voice-segments.ts"
Cohesion: 0.16
Nodes (21): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+13 more)

### Community 105 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 106 - "session-resource-clear.test.ts"
Cohesion: 0.12
Nodes (19): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+11 more)

### Community 107 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 108 - "oracle-voice-config.ts"
Cohesion: 0.18
Nodes (17): boundedInteger(), canonicalPath(), ExternalPiperVoiceConfig, isInside(), isRecord(), nonNegativeInteger(), optionalValue(), parseInteger() (+9 more)

### Community 109 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema, PersistedBinding (+11 more)

### Community 110 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 111 - "capture.ts"
Cohesion: 0.13
Nodes (15): BufferedFrame, defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, validateIdentity(), VoiceCaptureError, VoiceCaptureErrorCode (+7 more)

### Community 112 - "client.ts"
Cohesion: 0.12
Nodes (14): closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, OracleVoiceSocket, parseHello() (+6 more)

### Community 113 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 114 - ".confirmSpeech"
Cohesion: 0.18
Nodes (3): errorMessage(), OperationTimeoutError, withTimeout()

### Community 115 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 116 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 117 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 118 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 120 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 121 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 122 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 123 - "NewSessionDialog"
Cohesion: 0.17
Nodes (18): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+10 more)

### Community 124 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 125 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 126 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 127 - "use-oracle-settings.ts"
Cohesion: 0.21
Nodes (12): getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps, models (+4 more)

### Community 128 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 129 - "RuntimeReasoningEffort"
Cohesion: 0.19
Nodes (8): CreationRuntime, ManagerAgentOptions, ManagerState, RuntimeReasoningEffort, ManagerSettings, ManagerSettingsSnapshot, UpdateManagerSettingsInput, NewSessionRuntime

### Community 130 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 131 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 132 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 133 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 134 - "submission-error.ts"
Cohesion: 0.23
Nodes (9): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, SubmissionReceipt, submissionReceiptFromError() (+1 more)

### Community 135 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 136 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 137 - "manager-runtime.ts"
Cohesion: 0.24
Nodes (11): COPILOT_SDK_SESSION_DISCOVERY, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession(), createManagerSdkClient() (+3 more)

### Community 138 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 139 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 140 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 141 - "OracleVoiceClientDependencies"
Cohesion: 0.19
Nodes (4): defaultDependencies(), OracleVoiceClientDependencies, FakePlayback, VoicePlaybackOptions

### Community 142 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 143 - "SettingsProfileStore"
Cohesion: 0.21
Nodes (8): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileStore, directories, store()

### Community 144 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 145 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 146 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 147 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 149 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 150 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 152 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 153 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 154 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 155 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 156 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 157 - "file-upload-routes.ts"
Cohesion: 0.29
Nodes (6): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile()

### Community 158 - "SpeakableSegmenter"
Cohesion: 0.29
Nodes (3): SpeakableSegmenter, validateMessageId(), ./server/oracle-voice-segments.ts

### Community 159 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 161 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 162 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 164 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 166 - "tmux-errors.test.ts"
Cohesion: 0.25
Nodes (6): directories, { execute }, files, links, listener(), server()

### Community 167 - "capture.test.ts"
Cohesion: 0.22
Nodes (3): CaptureControl, VoiceCaptureDependencies, VoiceVad

### Community 169 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 170 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 171 - "normalizeBackgroundTask"
Cohesion: 0.32
Nodes (8): attachmentModeValue(), booleanValue(), executionModeValue(), normalizeBackgroundTask(), numberValue(), progressValue(), shellTaskMode(), statusValue()

### Community 172 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 174 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 175 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 176 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 177 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 179 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 182 - "recovery-context.ts"
Cohesion: 0.47
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 183 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 184 - "appearance.ts"
Cohesion: 0.50
Nodes (3): Appearance, appearanceFrom(), appearanceStorageKey

## Knowledge Gaps
- **1054 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1049 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1791 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionStore`, `ClaudeAgentService`, `manager-runtime.ts`, `oracle-voice-session.ts`, `ManagedSession`, `PushNotificationService`, `SettingsProfileStore`, `ManagerAgent`, `TranscriptionError`, `manager-context.ts`, `file-upload-routes.ts`, `multi-node.test.ts`, `ProviderSessionService`, `ManagerStore`, `SessionService`, `ChildVoiceEngine`, `SessionKnowledgeStore`, `SessionOrderStore`, `KnowledgeStore`, `delegated-transcription-service.ts`, `cli-canary.ts`, `manager-routes.ts`, `transcription-service.ts`, `oracle-voice-config.ts`, `refusal-metrics.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `.deleteSerialized`, `agent-service.ts`, `SessionDetail`, `claude-agent-service.ts`, `session-service.ts`, `CopilotSessionLike`, `session-store-providers.test.ts`, `directory-browser.ts`, `session-reply-durability.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `registerHubRoutes()` connect `ManagedSession` to `node-routes.ts`, `app.ts`, `normalizeKnowledgeRelativePath`, `SessionKnowledgeStore`, `server/session-patches.ts`, `claude-agent-service.ts`, `hub-routes.ts`, `oracle-voice-routes.ts`, `SessionOrderStore`, `KnowledgeStore`, `registerSessionKnowledgeRoutes`, `PushNotificationService`, `settings-profile-routes.ts`, `refusal-metrics.ts`, `directory-browser.ts`, `AgentProvider`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1054 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.037671915487343034 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.02876376988984088 - nodes in this community are weakly interconnected._
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
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
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
- `src/index.css`
- `config/oracle-voice-profiles.json`
