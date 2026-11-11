# Agentic Remote - Graphify code map

Snapshot: `e913fd5c8eb2032105b27fc6a441b14ecb75e3f5cac5420a4b8c288e4ad645db`

Source checkout: `bcf7bc7153332e8936a0bed0dda90d16ba5e95bd`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 422 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 422 files · ~902,260 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 7314 nodes · 20338 edges · 224 communities (178 shown, 30 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 1063 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionStore
- App
- api.ts
- contracts.ts
- App.tsx
- SessionDetail
- agent-service.ts
- oracle-voice-session.ts
- oracle-voice-worker.ts
- manager-tools.ts
- claude-agent-service.ts
- KnowledgeStore
- terminal-session.ts
- agentic-remote-promotion-monitor
- ManagerAgent
- dreamer-store.ts
- oracle-voice-child.ts
- oracle-voice-soak.ts
- workspace-fixtures.ts
- ManagedSession
- oracle-voice.ts
- VoiceClientControl
- CopilotClientLike
- app.ts
- oracle-voice-integration.test.ts
- oracle-voice-routes.ts
- terminal-session.test.ts
- CopilotSessionLike
- transcription-service.ts
- ManagerAssistant.tsx
- manager-context.ts
- oracle-task-store.ts
- ManagerMessage
- shared/settings-profile.ts
- SessionService
- session-presentation.ts
- manager-structured-memory-validation.ts
- TmuxTerminalSessionController
- session-knowledge-store.ts
- markdown-navigation.ts
- DreamerService
- session-directory.ts
- tmux-errors.integration.test.ts
- FakeVoiceEngine
- tmux-test-helpers.ts
- active-sessions.ts
- hub-routes.ts
- ManagerStore
- .backend
- session-latency-benchmark.ts
- agentic-remote
- UserInputReplyInput
- agentic-remote-gate
- FakeSessionService
- ProviderSessionService
- bundle
- OracleDreamer.tsx
- node-routes.ts
- .sendInternal
- OracleVoiceClient
- OracleVoiceCoordinator
- client.test.ts
- pwa.ts
- manager-agent.ts
- FakeVoiceController
- background-task-adapter.ts
- shell.ts
- lib.rs
- normalizeKnowledgeRelativePath
- ManagerProactiveCoordinator
- agentic-remote-promotion-setup
- manager-proactive-inbox.ts
- config.rs
- DreamerProgress
- terminal-startup-queue.test.ts
- knowledge-tree.ts
- dependencies
- devDependencies
- real-voice.ts
- dreamer-planner.ts
- ManagerEvent
- manager-structured-memory.ts
- EngineVoiceBackendSession
- oracle-voice-security.test.ts
- manager-agent.test.ts
- ManagerAttachment
- VoicePlayback
- AgentProvider
- SessionOrderStore
- session-patch-browser.ts
- oracle-voice-benchmark.ts
- dreamer-service.ts
- use-oracle-conversation.test.tsx
- cli-canary.ts
- manager-structured-memory-search.ts
- PushNotificationService
- scripts
- PromptCards.tsx
- use-oracle-settings.ts
- react
- SettingsProfileSnapshot
- compilerOptions
- ManagerStructuredMemoryStore
- SettingsProfileClient
- agent-service.test.ts
- startup-phases.test.ts
- oracle-voice-segments.ts
- oracle-voice-tickets.ts
- client.ts
- compilerOptions
- full-gate.test.ts
- .observe
- session-reply-durability.test.ts
- session-store-providers.test.ts
- compilerOptions
- .toolHost
- ManagerProactiveInbox
- OnlineRecognizer
- MessageTime.tsx
- compilerOptions
- compilerOptions
- ManagerMemory
- dreamer-schedule.ts
- promotion-monitor.test.ts
- BoundedQueue
- ReaderWorkspace
- terminal-form-deadline.test.ts
- recovery-resend-durability.test.ts
- server/session-patches.ts
- NewSessionDialog
- scripts
- DeferredSession
- background-task-stop.test.ts
- oracle-voice-assets.test.ts
- VoiceTurnState
- fake-vad.ts
- desktop.json
- recordValue
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- background-task-tracker.ts
- dreamer-service.test.ts
- manager-proactive-inbox.test.ts
- .finishClose
- Pcm16Resampler
- recovery-seed-guards.test.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- benchmarkFixture
- .initialize
- phone
- dataset
- generate-pwa-icons.ts
- ManagerProactiveInboxValidationError
- SpeakableSegmenter
- bridge.rs
- DreamerMorningPlan
- screenshot-stability.test.ts
- KnowledgePosition
- dreamer-routes.ts
- promotion-setup-execution.test.ts
- remote-node-client.test.ts
- SessionAdmissions
- vite.config.ts
- package.json
- OracleVoiceClientDependencies
- release-publication.test.ts
- UserInputFieldControl
- OracleVoicePlayback
- oracle-conversation-real.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- ManagerSdkClient
- manager-runtime.ts
- manager-structured-memory-performance.test.ts
- settings.ts
- .transport
- oracle-voice-benchmark.test.ts
- composer-layout.test.ts
- useOracleAttachments
- promotion-setup.test.ts
- HubEventSource
- push-routes.ts
- removeComputer
- appearance.ts
- FakeRecorder
- MemoryStorage
- terminal-send-uncertainty.test.ts
- OracleVoiceBackendConnection
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
- OperationTimeoutError
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 310 edges
2. `App()` - 303 edges
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
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (224 total, 30 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (16): agentMode(), AgentService, isRuntimeReasoningEffort(), isTerminalNotReadyRefusal(), lifecycleRefusal(), removeCopilotSessionFiles(), RuntimeConfigurationError, sessionInUseConflictMessage() (+8 more)

### Community 1 - "SessionStore"
Cohesion: 0.03
Nodes (98): storage(), fixture(), holdProbe(), fixtures, gate(), releases, restart(), sdkPermissionEvents() (+90 more)

### Community 2 - "App"
Cohesion: 0.03
Nodes (158): terminalSendOptions(), sessionFileValidationError(), submissionReceiptFromError(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown() (+150 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (136): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, SettingsChange, SettingsProfileKey, SettingsProfileValues, SettingsUpdateResult, parseSubmissionReceipt() (+128 more)

### Community 4 - "contracts.ts"
Cohesion: 0.03
Nodes (73): AgentServiceEvents, ComputerManagerEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, directories, voiceControlQueues (+65 more)

### Community 5 - "App.tsx"
Cohesion: 0.02
Nodes (128): isManagerEvent(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+120 more)

### Community 6 - "SessionDetail"
Cohesion: 0.04
Nodes (14): ClaudeAgentService, isMissingClaudeSessionError(), answer(), claudeRequest(), copilotRequest(), assertSessionNotRetained(), clearRecoverySeedFailure(), grantTerminalRecovery() (+6 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.03
Nodes (97): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+89 more)

### Community 8 - "oracle-voice-session.ts"
Cohesion: 0.03
Nodes (50): ActiveBackendSession, installFakeBrowserVoice(), ScriptedUtterance, Window, engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment() (+42 more)

### Community 9 - "oracle-voice-worker.ts"
Cohesion: 0.04
Nodes (48): benchmarkGroup(), createVoiceWorker(), childHarness(), config, FakeChildProcess, fakeSherpa(), FakeSherpaStream, initialize() (+40 more)

### Community 10 - "manager-tools.ts"
Cohesion: 0.04
Nodes (50): APPROVE_WORDS, AUTONOMOUS_CLOSE_LIMIT, BUSY_STATUS, busyReason(), computerField, ContextTier, createManagerTools(), closeCapReached() (+42 more)

### Community 11 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (64): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+56 more)

### Community 12 - "KnowledgeStore"
Cohesion: 0.04
Nodes (50): ServerRole, SessionMetadataLookup, committedRevision(), KnowledgeConfinementClaim, KnowledgeRootConfinementConflictError, KnowledgeRootReference, KnowledgeRootReservation, KnowledgeRootReservationOptions (+42 more)

### Community 13 - "terminal-session.ts"
Cohesion: 0.05
Nodes (76): afterExit(), boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus(), composerRowText() (+68 more)

### Community 14 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (80): agentic-remote-promotion-monitor script, acquire_test_lock(), ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url() (+72 more)

### Community 15 - "ManagerAgent"
Cohesion: 0.07
Nodes (15): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, ManagerSdkSession, sameRuntime() (+7 more)

### Community 16 - "dreamer-store.ts"
Cohesion: 0.06
Nodes (44): assertInteger(), assertUniqueJsonKeys(), clone(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES (+36 more)

### Community 17 - "oracle-voice-child.ts"
Cohesion: 0.05
Nodes (35): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, combinedTranscript(), defaultSpawnPiper(), errorMessage() (+27 more)

### Community 18 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 19 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (54): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, audit (+46 more)

### Community 20 - "ManagedSession"
Cohesion: 0.10
Nodes (10): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), registerHubRoutes(), AddComputerInput, ComputerSummary, ManagedRemovedQueuedPrompt (+2 more)

### Community 21 - "oracle-voice.ts"
Cohesion: 0.07
Nodes (48): VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), remoteSocketError(), RemoteVoiceClient (+40 more)

### Community 22 - "VoiceClientControl"
Cohesion: 0.06
Nodes (25): VoiceClientControl, BufferedFrame, captureFailure(), defaultAudioContext(), permissionError(), positiveLimit(), QueuedAudio, CaptureControl (+17 more)

### Community 23 - "CopilotClientLike"
Cohesion: 0.03
Nodes (55): CopilotClientLike, ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+47 more)

### Community 24 - "app.ts"
Cohesion: 0.05
Nodes (57): buildConfig(), prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode() (+49 more)

### Community 25 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (35): apps, availableBackend(), BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions (+27 more)

### Community 26 - "oracle-voice-routes.ts"
Cohesion: 0.05
Nodes (52): ManagerEventSource, sendNodeVoiceOutput(), backendDisconnectFromError(), disconnectCause(), isBackendDisconnect(), OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput (+44 more)

### Community 27 - "terminal-session.test.ts"
Cohesion: 0.04
Nodes (59): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+51 more)

### Community 28 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (36): CopilotSessionLike, CopilotTasksApi, nextVoiceControl(), openNodeVoiceSocket(), waitForEvent(), acceptanceReceipt(), errorMessage(), explicitlyRefused() (+28 more)

### Community 29 - "transcription-service.ts"
Cohesion: 0.05
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+28 more)

### Community 30 - "ManagerAssistant.tsx"
Cohesion: 0.05
Nodes (51): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline() (+43 more)

### Community 31 - "manager-context.ts"
Cohesion: 0.07
Nodes (44): DreamerProgressEntry, ago(), attentionRank(), buildTurnContext(), cachedReply(), changeLines(), clock(), closedLine() (+36 more)

### Community 32 - "oracle-task-store.ts"
Cohesion: 0.07
Nodes (45): setup(), DreamerFollowUp, attemptId(), BeginOracleTaskAttemptInput, ConfirmOracleTaskCompletionInput, isId(), isMissing(), isText() (+37 more)

### Community 33 - "ManagerMessage"
Cohesion: 0.05
Nodes (25): FakeManager, FakeVoiceState, apps, directories, ProactiveManager, FakeAgent, confirmationSchema, defaultsSchema (+17 more)

### Community 34 - "shared/settings-profile.ts"
Cohesion: 0.06
Nodes (55): WorkspaceFixtureState, SettingsProfileState, AccentSetting, AppearanceSetting, appearanceSettings, applySettingsChanges(), applySettingsImport(), DEFAULT_SESSION_PROVIDER (+47 more)

### Community 35 - "SessionService"
Cohesion: 0.06
Nodes (13): ActiveClaudeQuery, nodeVoiceCapabilities(), registerNodeRoutes(), releases, session, snapshot, obstructUploads(), readServiceResources() (+5 more)

### Community 36 - "session-presentation.ts"
Cohesion: 0.07
Nodes (50): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+42 more)

### Community 37 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 38 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (14): awaitingRelaunch(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+6 more)

### Community 39 - "session-knowledge-store.ts"
Cohesion: 0.07
Nodes (30): bindingKey(), bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor() (+22 more)

### Community 40 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (43): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+35 more)

### Community 41 - "DreamerService"
Cohesion: 0.12
Nodes (10): boundedText(), digest(), DreamerService, DreamerUnavailableError, planWithFingerprints(), publicSnapshot(), uniqueSessionRefs(), DreamerCompletionCandidate (+2 more)

### Community 42 - "session-directory.ts"
Cohesion: 0.09
Nodes (38): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, build(), trusted, allowedRoots(), assertOpenedDirectory() (+30 more)

### Community 43 - "tmux-errors.integration.test.ts"
Cohesion: 0.06
Nodes (28): fixture(), managers, releases, remote, session(), ComputerRegistry, DurableRegisteredComputer, LegacyRegisteredComputer (+20 more)

### Community 44 - "FakeVoiceEngine"
Cohesion: 0.07
Nodes (23): FakeVoiceEngine, identityKey(), isCancelled(), sameGeneration(), VoiceUtteranceAudioFrame, BlockingCancelEngine, RejectingNodeEngine, SlowNodeEngine (+15 more)

### Community 45 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (41): directories, exec, [root], assertSameIdentity(), createIsolatedTmuxRoot(), execFileAsync, abandoned, abandonFixture() (+33 more)

### Community 46 - "active-sessions.ts"
Cohesion: 0.08
Nodes (43): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+35 more)

### Community 47 - "hub-routes.ts"
Cohesion: 0.05
Nodes (38): ClientPresence, PRESENCE_TTL_MS, addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+30 more)

### Community 48 - "ManagerStore"
Cohesion: 0.08
Nodes (13): openStore(), emptyState(), ManagerStore, open(), createManager(), createRealManager(), DeterministicManagerClient, deterministicManagerHub() (+5 more)

### Community 49 - ".backend"
Cohesion: 0.08
Nodes (3): cloneSession(), TranscriptObservation, StartupPhases

### Community 50 - "session-latency-benchmark.ts"
Cohesion: 0.08
Nodes (31): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+23 more)

### Community 51 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 52 - "UserInputReplyInput"
Cohesion: 0.10
Nodes (8): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isUncertainDelivery(), persistedFormAnswer(), statusFromEvents(), validateUserInputForm(), UserInputReplyInput, deliveryUncertaintyFromError()

### Community 53 - "agentic-remote-gate"
Cohesion: 0.11
Nodes (44): agentic-remote-gate script, assert_tree(), bindable_host_dir(), browser_counts(), BROWSER_LIBS_DIR, BROWSERS_DIR, CLONE_BASE, conclude() (+36 more)

### Community 54 - "FakeSessionService"
Cohesion: 0.06
Nodes (5): FakeSessionService, routingFixture(), session(), temporaryDirectory(), AgentMode

### Community 56 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 57 - "OracleDreamer.tsx"
Cohesion: 0.10
Nodes (34): DreamerPreviousItem, DreamerStoredPlanItem, DreamerPersistedPlan, DreamerPlanItem, completeDreamerTask(), dispatchDreamerTask(), DreamerApiError, DreamerPlanEdit (+26 more)

### Community 58 - "node-routes.ts"
Cohesion: 0.06
Nodes (39): FileUploadError, registerFileUploadRoutes(), SessionParams, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema (+31 more)

### Community 59 - ".sendInternal"
Cohesion: 0.13
Nodes (36): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), composerHoldsOtherText(), composerHoldsText() (+28 more)

### Community 60 - "OracleVoiceClient"
Cohesion: 0.16
Nodes (7): captureClientError(), clientError(), closeError(), OracleVoiceClient, OracleVoiceClientError, playbackClientError(), terminalCloseCode()

### Community 61 - "OracleVoiceCoordinator"
Cohesion: 0.14
Nodes (5): errorMessage(), OracleVoiceCoordinator, resolvedAudioGate(), withTimeout(), ActiveConversation

### Community 62 - "client.test.ts"
Cohesion: 0.07
Nodes (15): ORACLE_VOICE_MAX_PLAYABLE_SEGMENT_SECONDS, ORACLE_VOICE_PROTOCOL, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode() (+7 more)

### Community 63 - "pwa.ts"
Cohesion: 0.09
Nodes (38): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+30 more)

### Community 64 - "manager-agent.ts"
Cohesion: 0.08
Nodes (31): DreamerProgressView, automaticPayload(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkSessionConfig, messagePriority(), Rung (+23 more)

### Community 65 - "FakeVoiceController"
Cohesion: 0.10
Nodes (6): beginSpeech(), endSpeech(), expectOk(), FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 66 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (38): addActivity(), attachmentModeValue(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, eventString() (+30 more)

### Community 67 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 68 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 69 - "normalizeKnowledgeRelativePath"
Cohesion: 0.10
Nodes (30): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath() (+22 more)

### Community 70 - "ManagerProactiveCoordinator"
Cohesion: 0.11
Nodes (12): batchMessageId(), ComputerGenerations, isTerminal(), lifecycles(), ManagerProactiveCoordinator, ManagerProactiveCoordinatorOptions, SessionLifecycle, directories (+4 more)

### Community 71 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 72 - "manager-proactive-inbox.ts"
Cohesion: 0.08
Nodes (37): assertExactKeys(), canonicalHash(), DISPOSITIONS, EVENT_KINDS, eventId(), hasExactKeys(), isAlreadyExists(), isDisposition() (+29 more)

### Community 73 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 74 - "DreamerProgress"
Cohesion: 0.11
Nodes (11): DreamerProgress, DreamerProgressSource, keyOf(), notOlder(), progressExcerpt(), Detail, FakeSource, setup() (+3 more)

### Community 75 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (27): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+19 more)

### Community 76 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 77 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 78 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 79 - "real-voice.ts"
Cohesion: 0.09
Nodes (12): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+4 more)

### Community 80 - "dreamer-planner.ts"
Cohesion: 0.11
Nodes (30): activeDreamerMemoryIds(), activeMemoryRecord(), addCountedCoverage(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), carrySessionItem() (+22 more)

### Community 81 - "ManagerEvent"
Cohesion: 0.11
Nodes (22): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+14 more)

### Community 82 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (28): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+20 more)

### Community 83 - "EngineVoiceBackendSession"
Cohesion: 0.19
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 84 - "oracle-voice-security.test.ts"
Cohesion: 0.08
Nodes (20): FakeVoiceEngineCall, SocketMessage, apps, config, configFixture(), connect(), Inbox, issueTicket() (+12 more)

### Community 85 - "manager-agent.test.ts"
Cohesion: 0.10
Nodes (17): ManagerSdkEvent, Behavior, capturePrompt(), computers, fail(), FakeClient, FakeSdk, FakeSession (+9 more)

### Community 86 - "ManagerAttachment"
Cohesion: 0.14
Nodes (19): failure(), ManagerUploads, referenceId, storedFile, safeUploadName(), writePrivateUpload(), codeExtensions, fileTypes (+11 more)

### Community 87 - "VoicePlayback"
Cohesion: 0.13
Nodes (6): pcm16ToFloat(), SegmentDrain, FakeSource, harness(), validateGeneration(), VoicePlayback

### Community 88 - "AgentProvider"
Cohesion: 0.09
Nodes (19): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+11 more)

### Community 89 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 90 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 91 - "oracle-voice-benchmark.ts"
Cohesion: 0.11
Nodes (26): BenchmarkMetric, BenchmarkProfile, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, derived(), execFileAsync (+18 more)

### Community 92 - "dreamer-service.ts"
Cohesion: 0.11
Nodes (26): DreamerMemoryMetadata, DreamerPlanDraft, DreamerPlannerInput, DEFAULT_DREAMER_PROGRESS_LIMITS, DreamerProgressLimits, DreamerProgressOptions, DreamerProgressRefresh, DreamerProgressReply (+18 more)

### Community 93 - "use-oracle-conversation.test.tsx"
Cohesion: 0.12
Nodes (13): getOracleVoiceCapabilities(), OracleVoiceClientOptions, OracleVoiceTranscriptEvent, OracleVoiceUiState, OracleConversation, OracleConversationState, availableCapability, defaults (+5 more)

### Community 94 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 95 - "manager-structured-memory-search.ts"
Cohesion: 0.13
Nodes (23): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+15 more)

### Community 96 - "PushNotificationService"
Cohesion: 0.20
Nodes (3): PushNotificationService, scoped(), registerPushRoutes()

### Community 97 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 98 - "PromptCards.tsx"
Cohesion: 0.12
Nodes (18): TerminalFormContinuation, RemoteNodeRequestError, PendingUserInput, UserInputField, UserInputFieldValue, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, SubmissionError (+10 more)

### Community 99 - "use-oracle-settings.ts"
Cohesion: 0.12
Nodes (15): RuntimeModelOption, ManagerSessionClosePolicy, getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings() (+7 more)

### Community 100 - "react"
Cohesion: 0.11
Nodes (12): react, transcribeAudio(), MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram(), drawing, MermaidDiagram() (+4 more)

### Community 101 - "SettingsProfileSnapshot"
Cohesion: 0.12
Nodes (13): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), profileStore(), updateSchema, SettingsProfileStore, directories (+5 more)

### Community 102 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 103 - "ManagerStructuredMemoryStore"
Cohesion: 0.23
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 104 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 105 - "agent-service.test.ts"
Cohesion: 0.13
Nodes (13): foregroundTurnOpen(), terminalFormSteps(), busyTerminal(), configurableModel(), directories, FakeCopilotClient, normalSdkSessionConfiguration, probeService() (+5 more)

### Community 106 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (13): phases, port, createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address (+5 more)

### Community 107 - "oracle-voice-segments.ts"
Cohesion: 0.16
Nodes (21): alignCandidateRanges(), alignCandidateSequences(), alignSmallCandidateRanges(), CandidateAlignment, candidatePrefixScores(), candidateSubstitutionCost(), capSegment(), collectProseBlocks() (+13 more)

### Community 108 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 109 - "client.ts"
Cohesion: 0.12
Nodes (14): closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceCapture, OracleVoiceClientErrorCode, OracleVoiceSocket, parseHello() (+6 more)

### Community 110 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM.Iterable, e2e, playwright.config.ts, compilerOptions, lib, module, moduleResolution, noEmit (+12 more)

### Community 111 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 112 - ".observe"
Cohesion: 0.17
Nodes (8): cloneState(), ManagerProactiveInboxCapacityError, ManagerProactiveInboxError, ManagerProactiveInboxPersistenceError, ManagerProactiveInboxReferenceError, ManagerProactiveInboxScopeError, namespaceId(), nowIso()

### Community 113 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 114 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 115 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 117 - "ManagerProactiveInbox"
Cohesion: 0.23
Nodes (4): isMissing(), ManagerProactiveInbox, ManagerProactiveInboxRecoveryError, openInbox()

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

### Community 125 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 126 - "ReaderWorkspace"
Cohesion: 0.15
Nodes (9): READER_WIDTH_MIN, ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth() (+1 more)

### Community 127 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 128 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, httpBoundary(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 129 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 130 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession() (+8 more)

### Community 131 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 132 - "DeferredSession"
Cohesion: 0.15
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 133 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 134 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 136 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 137 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 138 - "recordValue"
Cohesion: 0.22
Nodes (14): backgroundHandoff(), booleanValue(), errorValue(), notificationKind(), parsedValue(), rawTailText(), recordValue(), shellIdFromFooter() (+6 more)

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

### Community 143 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (7): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 144 - "dreamer-service.test.ts"
Cohesion: 0.15
Nodes (3): DreamerMemoryMetadataRecord, directories, enabledSettings()

### Community 145 - "manager-proactive-inbox.test.ts"
Cohesion: 0.18
Nodes (8): ManagerProactiveInboxObservation, ManagerProactiveInboxOptions, fsHooks, ReadGate, readState(), statePath(), TestState, writeState()

### Community 146 - ".finishClose"
Cohesion: 0.21
Nodes (3): AudioCompletion, AudioGate, terminalStartupCloseCode()

### Community 147 - "Pcm16Resampler"
Cohesion: 0.26
Nodes (5): floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 148 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 149 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 150 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 151 - "benchmarkFixture"
Cohesion: 0.25
Nodes (9): benchmarkFixture(), deferred(), firstTtsSegment(), maybeMeasured(), measured(), measureSttPass(), measureTts(), missing() (+1 more)

### Community 152 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 153 - "phone"
Cohesion: 0.49
Nodes (10): assertConversation(), assertLayout(), capture(), desktop(), documentHeading(), expect, openGuide(), phone() (+2 more)

### Community 154 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 155 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 156 - "ManagerProactiveInboxValidationError"
Cohesion: 0.24
Nodes (7): emptyState(), ManagerProactiveInboxValidationError, publicEvent(), requireId(), validateLimit(), validateOptions(), rejectBeforeHello()

### Community 157 - "SpeakableSegmenter"
Cohesion: 0.29
Nodes (3): SpeakableSegmenter, validateMessageId(), ./server/oracle-voice-segments.ts

### Community 158 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 159 - "DreamerMorningPlan"
Cohesion: 0.38
Nodes (10): DreamerMorningPlan(), confirmCompletion(), confirmTaskCompletion(), dispatchTask(), disposition(), edit(), investigate(), move() (+2 more)

### Community 160 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 161 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 162 - "dreamer-routes.ts"
Cohesion: 0.25
Nodes (8): dispatchSchema, parse(), planSchema, registerDreamerRoutes(), settingsSchema, taskCompletionSchema, taskDispositionSchema, taskParamsSchema

### Community 163 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 164 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 166 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 167 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 169 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 170 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 173 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 174 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 176 - "manager-runtime.ts"
Cohesion: 0.38
Nodes (4): createManagerSdkClient(), efforts, managerRuntimeSettings, ManagerStructuredMemoryMode

### Community 177 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.43
Nodes (5): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES

### Community 178 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 180 - "oracle-voice-benchmark.test.ts"
Cohesion: 0.47
Nodes (4): normalizeTranscript(), parsePcm16Wave(), verifyCorpus(), wordErrorRate()

### Community 181 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 182 - "useOracleAttachments"
Cohesion: 0.73
Nodes (6): useOracleAttachments(), drain(), intake(), remove(), retry(), update()

### Community 183 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 185 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 186 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 187 - "appearance.ts"
Cohesion: 0.50
Nodes (3): Appearance, appearanceFrom(), appearanceStorageKey

## Knowledge Gaps
- **1210 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1205 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2032 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionStore`, `SessionDetail`, `oracle-voice-session.ts`, `oracle-voice-worker.ts`, `KnowledgeStore`, `ManagerAgent`, `ManagedSession`, `transcription-service.ts`, `manager-context.ts`, `oracle-task-store.ts`, `ManagerMessage`, `dreamer-routes.ts`, `SessionService`, `session-knowledge-store.ts`, `DreamerService`, `tmux-errors.integration.test.ts`, `hub-routes.ts`, `manager-runtime.ts`, `ManagerStore`, `UserInputReplyInput`, `ProviderSessionService`, `node-routes.ts`, `ManagerProactiveCoordinator`, `manager-agent.test.ts`, `SessionOrderStore`, `cli-canary.ts`, `PushNotificationService`, `SettingsProfileSnapshot`, `ManagerProactiveInbox`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `contracts.ts`, `agent-service.ts`, `session-directory.ts`, `claude-agent-service.ts`, `.backend`, `UserInputReplyInput`, `CopilotSessionLike`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `contracts.ts`, `SessionDetail`, `agent-service.ts`, `.backend`, `UserInputReplyInput`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1210 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03624464003610923 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.026019389791844882 - nodes in this community are weakly interconnected._
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
