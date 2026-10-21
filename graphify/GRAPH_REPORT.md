# Agentic Remote - Graphify code map

Snapshot: `2947fce085d754d0507380b610eaa0653516badadfec07130dab6d328b3bf77c`

Source checkout: `e1ee58869687c79514fa9c4b0e9beed0d2cafcf2`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 377 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 377 files · ~733,646 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 6303 nodes · 17301 edges · 219 communities (176 shown, 27 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 957 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionStore
- App
- api.ts
- App.tsx
- SessionDetail
- oracle-voice-child.ts
- oracle-voice-session.ts
- oracle-voice.ts
- computer-manager.ts
- oracle-voice-security.test.ts
- terminal-session.ts
- session-resources.ts
- OracleVoiceCoordinator
- agentic-remote-promotion-monitor
- oracle-voice-soak.ts
- OracleVoiceClient
- claude-agent-service.ts
- ManagerAgent
- ManagedSession
- oracle-voice-integration.test.ts
- CopilotSessionLike
- manager-tools.ts
- session-resource-clear.test.ts
- oracle-voice-worker.ts
- session-presentation.ts
- manager-agent.ts
- manager-structured-memory-validation.ts
- active-sessions.ts
- agent-service.ts
- VoiceAudioFrame
- FakeManager
- TmuxTerminalSessionController
- manager-context.ts
- ManagerAssistant.tsx
- markdown-navigation.ts
- CopilotClientLike
- terminal-startup-queue.test.ts
- session-knowledge-routes.test.ts
- agentic-remote
- bundle
- ProviderSessionService
- contracts.ts
- background-task-adapter.ts
- ManagerStore
- FakeSessionService
- SessionService
- TerminalSessionController
- pwa.ts
- shell.ts
- lib.rs
- oracle-voice-config.ts
- manager-structured-memory.ts
- agentic-remote-promotion-setup
- oracle-voice-routes.ts
- agentic-remote-gate
- config.rs
- .takeInTranscript
- shared/settings-profile.ts
- knowledge-tree.ts
- hub-routes.ts
- terminal-session.test.ts
- dependencies
- devDependencies
- app.ts
- SessionKnowledgeStore
- node-routes.ts
- VoiceSessionError
- workspace-fixtures.ts
- PushNotificationService
- client.test.ts
- AgentProvider
- SessionOrderStore
- .sendInternal
- real-voice.ts
- session-patch-browser.ts
- oracle-voice-benchmark.ts
- cli-canary.ts
- send-matrix.integration.test.ts
- scripts
- VoiceCapture
- delegated-transcription-service.ts
- manager-structured-memory-search.ts
- push-notification-service.ts
- VoicePlayback
- recordValue
- ManagerStructuredMemoryStore
- compilerOptions
- capture-workbench-review.ts
- ChatMessage
- KnowledgeStore
- ComputerSummary
- transcription-service.ts
- src/settings-profile.ts
- SettingsProfileClient
- normalizeKnowledgeRelativePath
- manager-routes.ts
- oracle-voice-tickets.ts
- session-reply-durability.test.ts
- capture-workspace.ts
- full-gate.test.ts
- startup-phases.test.ts
- session-knowledge-store.ts
- PromptCards.tsx
- terminal-form-deadline.test.ts
- compilerOptions
- agent-service.test.ts
- OnlineRecognizer
- compilerOptions
- compilerOptions
- server/side-question.ts
- event-log.ts
- ManagerMemory
- oracle-voice-segments.ts
- refusal-metrics.ts
- submission-error.ts
- session-store-providers.test.ts
- workspace-browser.ts
- react
- recovery-resend-durability.test.ts
- use-session-knowledge-root.ts
- BoundedQueue
- session-latency-benchmark.ts
- NewSessionDialog
- use-oracle-settings.ts
- ReaderWorkspace
- background-task-stop.test.ts
- promotion-monitor.test.ts
- server/session-patches.ts
- SettingsProfileStore
- Pcm16Resampler
- scripts
- DeferredSession
- registerSessionKnowledgeRoutes
- oracle-voice-assets.test.ts
- fake-vad.ts
- desktop.json
- recordValue
- TranscriptionError
- theme-contrast.test.ts
- BackgroundTasksDialog.tsx
- .oxlintrc.json
- settings-local.json
- SessionAdmissions
- session-response-order.ts
- background-task-tracker.ts
- .initialize
- html-preview.ts
- copilot-sdk-client.ts
- session-knowledge-routes.ts
- settings-profile.test.ts
- VoiceVadOptions
- dataset
- generate-pwa-icons.ts
- benchmarkFixture
- file-upload-routes.ts
- ManagerSdkClient
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- SpeakableSegmenter
- OracleVoiceClientDependencies
- promotion-setup-execution.test.ts
- VoiceCaptureOptions
- vite.config.ts
- package.json
- recovery-context.ts
- release-publication.test.ts
- oracle-conversation-real.test.ts
- render-workspace-gifs.ts
- oracle-voice-benchmark.test.ts
- HubEvent
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- .transport
- composer-layout.test.ts
- usePanelWidth
- MarkdownCodeBlock.tsx
- api-origin.test.ts
- promotion-setup.test.ts
- push-routes.ts
- removeComputer
- FakeRecorder
- useOracleConversation
- terminal-send-uncertainty.test.ts
- FakeSource
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
1. `SessionDetail` - 299 edges
2. `App()` - 269 edges
3. `AgentService` - 263 edges
4. `SessionStore` - 178 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 99 edges
7. `registerHubRoutes()` - 92 edges
8. `buildApp()` - 90 edges
9. `ComputerManager` - 87 edges
10. `ManagerAgent` - 82 edges

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

## Communities (219 total, 27 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (13): agentMode(), AgentService, foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), removeCopilotSessionFiles(), RuntimeConfigurationError, statusFromEvents() (+5 more)

### Community 1 - "SessionStore"
Cohesion: 0.03
Nodes (72): fixture(), restart(), fixture(), connect(), createStore(), enqueue(), fixture(), recoveryFixture() (+64 more)

### Community 2 - "App"
Cohesion: 0.04
Nodes (137): isManagerEvent(), alertNotification(), terminalSendOptions(), askSession(), restartSession(), setSessionNotificationsMuted(), activeComposerPastes(), App() (+129 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (118): SettingsChange, SettingsProfileKey, SettingsProfileValues, SettingsUpdateResult, parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder() (+110 more)

### Community 4 - "App.tsx"
Cohesion: 0.02
Nodes (111): AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+103 more)

### Community 5 - "SessionDetail"
Cohesion: 0.05
Nodes (20): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), toolResultText(), copilotRequest(), claudeFixture(), ClaudeMcpRead, copilotFixture() (+12 more)

### Community 6 - "oracle-voice-child.ts"
Cohesion: 0.04
Nodes (53): ActiveNativeSynthesis, ActivePiperSynthesis, ActiveSynthesis, ActiveSynthesisIdentity, ActiveUtterance, createVoiceWorker(), defaultSpawnPiper(), errorMessage() (+45 more)

### Community 7 - "oracle-voice-session.ts"
Cohesion: 0.03
Nodes (45): ActiveBackendSession, installFakeBrowserVoice(), ScriptedUtterance, Window, BuildAppOptions, voiceBackend(), nodeVoiceCapabilities(), EnabledOracleVoiceConfig (+37 more)

### Community 8 - "oracle-voice.ts"
Cohesion: 0.05
Nodes (59): VoiceBackendDisconnectCause, closeReason(), exactArrayBuffer(), rawDataBuffer(), REDIRECT_STATUSES, remoteSocketCloseError(), RemoteVoiceClient, RemoteVoiceClientOptions (+51 more)

### Community 9 - "computer-manager.ts"
Cohesion: 0.04
Nodes (31): mapWithConcurrency(), RemoteResync, RemoteSessionListing, RemoteSessionRead, RegisteredComputer, DEFINITE_DISPATCH_REFUSALS, headerSafe(), normalizeNodeUrl() (+23 more)

### Community 10 - "oracle-voice-security.test.ts"
Cohesion: 0.04
Nodes (44): FakeVoiceEngine, FakeVoiceEngineCall, identityKey(), isCancelled(), sameGeneration(), VoiceStartUtterance, VoiceSttEngine, VoiceTtsEngine (+36 more)

### Community 11 - "terminal-session.ts"
Cohesion: 0.05
Nodes (82): activeBottomFrame(), boxedComposerFrame(), cleanDialogLine(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus() (+74 more)

### Community 12 - "session-resources.ts"
Cohesion: 0.07
Nodes (55): ClaudeResources, releases, session, snapshot, CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport() (+47 more)

### Community 13 - "OracleVoiceCoordinator"
Cohesion: 0.06
Nodes (21): ManagerEventSource, AudioCompletion, AudioGate, backendDisconnectFromError(), disconnectCause(), errorMessage(), isBackendDisconnect(), OperationTimeoutError (+13 more)

### Community 14 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 15 - "oracle-voice-soak.ts"
Cohesion: 0.05
Nodes (34): childCleanupPassed(), childPids(), connectSoakSocket(), ControlledAcquisitionGate, ControlledSoakEngine, delay(), errorText(), GatedStartupRaceObservation (+26 more)

### Community 16 - "OracleVoiceClient"
Cohesion: 0.06
Nodes (23): captureClientError(), clientError(), closeError(), closeReason(), isCapabilities(), isRecord(), isTicket(), OracleVoiceClient (+15 more)

### Community 17 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (39): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+31 more)

### Community 18 - "ManagerAgent"
Cohesion: 0.08
Nodes (14): FakeVoiceState, checkContent(), delay(), discover(), errorMessage(), isNotFound(), isPending(), isQueued() (+6 more)

### Community 19 - "ManagedSession"
Cohesion: 0.10
Nodes (10): ComputerManager, managedSession(), sessionAtLeastAsNew(), ManagerEventSource, registerHubRoutes(), SessionMuteCarrier, createHub(), ManagedRemovedQueuedPrompt (+2 more)

### Community 20 - "oracle-voice-integration.test.ts"
Cohesion: 0.04
Nodes (33): apps, BrowserCapture, BrowserCaptureOptions, BrowserClient, BrowserClientConstructor, BrowserPlayback, BrowserPlaybackOptions, BrowserSocket (+25 more)

### Community 21 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (34): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+26 more)

### Community 22 - "manager-tools.ts"
Cohesion: 0.06
Nodes (34): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), structuredTools() (+26 more)

### Community 23 - "session-resource-clear.test.ts"
Cohesion: 0.04
Nodes (48): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), deferred() (+40 more)

### Community 24 - "oracle-voice-worker.ts"
Cohesion: 0.08
Nodes (26): benchmarkGroup(), VoiceEngineSession, ActiveSynthesisIdentity, ActiveUtteranceIdentity, capabilityFromConfig(), ChildVoiceEngine, errorMessage(), exactKeys() (+18 more)

### Community 25 - "session-presentation.ts"
Cohesion: 0.07
Nodes (50): saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView, computers (+42 more)

### Community 26 - "manager-agent.ts"
Cohesion: 0.06
Nodes (36): ManagerAgentOptions, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Rung, Behavior, capturePrompt(), computers (+28 more)

### Community 27 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 28 - "active-sessions.ts"
Cohesion: 0.07
Nodes (49): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+41 more)

### Community 29 - "agent-service.ts"
Cohesion: 0.04
Nodes (51): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+43 more)

### Community 30 - "VoiceAudioFrame"
Cohesion: 0.05
Nodes (30): OracleVoiceBackendConnector, OracleVoiceBackendDisconnect, OracleVoiceBackendOutput, capabilities, confirm(), control(), defaults, FakeBackend (+22 more)

### Community 31 - "FakeManager"
Cohesion: 0.06
Nodes (7): beginSpeech(), endSpeech(), expectOk(), FakeManager, FakeVoiceBackend, FakeVoiceController, startFixtureServer()

### Community 32 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (14): copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), processIsAlive(), safeWindowName() (+6 more)

### Community 33 - "manager-context.ts"
Cohesion: 0.08
Nodes (33): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, managerPrompt(), oneLine() (+25 more)

### Community 34 - "ManagerAssistant.tsx"
Cohesion: 0.07
Nodes (37): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), phoneEnterCreatesNewline() (+29 more)

### Community 35 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (41): executeCommand(), listWorkspace(), readWorkspaceFile(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+33 more)

### Community 36 - "CopilotClientLike"
Cohesion: 0.04
Nodes (29): CopilotClientLike, holdProbe(), fixtures, gate(), releases, directories, fakeClient(), ForkRequest (+21 more)

### Community 37 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (38): startAgentAfterClear(), exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, client() (+30 more)

### Community 38 - "session-knowledge-routes.test.ts"
Cohesion: 0.06
Nodes (25): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+17 more)

### Community 39 - "agentic-remote"
Cohesion: 0.10
Nodes (42): agentic-remote script, activate_voice_profile(), append_preserved_voice_configuration(), COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die() (+34 more)

### Community 40 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 42 - "contracts.ts"
Cohesion: 0.06
Nodes (33): directories, fakeManager(), hub(), local, ActivityStatus, AddKnowledgeRootInput, BackgroundTaskAttachmentMode, BackgroundTaskExecutionMode (+25 more)

### Community 43 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (41): addActivity(), attachmentModeValue(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, eventString() (+33 more)

### Community 44 - "ManagerStore"
Cohesion: 0.08
Nodes (9): openStore(), emptyState(), ManagerStore, open(), FakeManager, StoredManager, createManager(), SecurityManager (+1 more)

### Community 45 - "FakeSessionService"
Cohesion: 0.07
Nodes (6): FakeSessionService, routingFixture(), session(), temporaryDirectory(), AgentMode, SideQuestionExchange

### Community 46 - "SessionService"
Cohesion: 0.09
Nodes (3): registerNodeRoutes(), isSessionResourceRoute(), SessionService

### Community 47 - "TerminalSessionController"
Cohesion: 0.09
Nodes (5): isUncertainDelivery(), persistedFormAnswer(), TerminalSessionController, UserInputReplyInput, deliveryUncertaintyFromError()

### Community 48 - "pwa.ts"
Cohesion: 0.10
Nodes (36): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle() (+28 more)

### Community 49 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 50 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 51 - "oracle-voice-config.ts"
Cohesion: 0.08
Nodes (27): buildConfig(), engine, integerEnvironment(), smokeEventLogLine(), requiredEnvironment(), voiceConfigFromEnvironment(), wave, boundedInteger() (+19 more)

### Community 52 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (30): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord() (+22 more)

### Community 53 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 54 - "oracle-voice-routes.ts"
Cohesion: 0.11
Nodes (34): sendNodeVoiceOutput(), OracleVoiceManager, limits(), outputBytes(), ActiveConversation, availableCapabilities(), backendOutputBytes(), backendOutputRelay() (+26 more)

### Community 55 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 56 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 58 - "shared/settings-profile.ts"
Cohesion: 0.11
Nodes (33): SettingsProfileState, AccentSetting, appearanceSettings, applySettingsImport(), isRecord(), isSettingsDeviceId(), isSettingsProfileKey(), isSettingsRevision() (+25 more)

### Community 59 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 60 - "hub-routes.ts"
Cohesion: 0.07
Nodes (35): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+27 more)

### Community 61 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (30): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse(), pastedPlaceholderCount() (+22 more)

### Community 62 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+27 more)

### Community 63 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 64 - "app.ts"
Cohesion: 0.10
Nodes (20): apps, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence, PRESENCE_TTL_MS, transcriptionComputerName() (+12 more)

### Community 65 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 66 - "node-routes.ts"
Cohesion: 0.07
Nodes (29): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, closeReason(), closeVoiceSocket(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema (+21 more)

### Community 67 - "VoiceSessionError"
Cohesion: 0.20
Nodes (4): asSessionError(), disconnectCause(), EngineVoiceBackendSession, VoiceSessionError

### Community 68 - "workspace-fixtures.ts"
Cohesion: 0.09
Nodes (26): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+18 more)

### Community 69 - "PushNotificationService"
Cohesion: 0.16
Nodes (6): OracleEventSource, PushNotificationService, scoped(), registerPushRoutes(), NotificationCategory, NotificationPayload

### Community 70 - "client.test.ts"
Cohesion: 0.09
Nodes (9): OracleVoiceSocket, capabilities, FakePlayback, FakeScheduler, FakeSocket, harness(), isBrowserClientCloseCode(), jsonResponse() (+1 more)

### Community 71 - "AgentProvider"
Cohesion: 0.09
Nodes (19): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+11 more)

### Community 72 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 73 - ".sendInternal"
Cohesion: 0.15
Nodes (19): captureBeforeDeadline(), capturePane(), captureTerminal(), clearAutomaticStartupPrompts(), composerHoldsText(), composerText(), hasComposerAfter(), isTerminalAgentWorking() (+11 more)

### Community 74 - "real-voice.ts"
Cohesion: 0.12
Nodes (11): BrowserTestSessionService, clockTicksPerSecond(), execFileAsync, GenerationMetrics, InstrumentedRealEngine, processExists(), readWorkerProcessSample(), RealMetrics (+3 more)

### Community 75 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 76 - "oracle-voice-benchmark.ts"
Cohesion: 0.11
Nodes (24): BenchmarkMetric, CliOptions, clockTicksPerSecond(), CorpusFixture, CorpusManifest, derived(), execFileAsync, formatBenchmarkMarkdown() (+16 more)

### Community 77 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 78 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (23): BUSY, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec, Expected (+15 more)

### Community 79 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 80 - "VoiceCapture"
Cohesion: 0.21
Nodes (5): captureFailure(), defaultAudioContext(), permissionError(), VoiceCapture, VoiceCaptureError

### Community 81 - "delegated-transcription-service.ts"
Cohesion: 0.12
Nodes (12): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+4 more)

### Community 82 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 83 - "push-notification-service.ts"
Cohesion: 0.14
Nodes (17): brief(), PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030, notificationAllowed() (+9 more)

### Community 84 - "VoicePlayback"
Cohesion: 0.16
Nodes (5): pcm16ToFloat(), SegmentDrain, harness(), validateGeneration(), VoicePlayback

### Community 85 - "recordValue"
Cohesion: 0.20
Nodes (20): activityKind(), activityResult(), ActivityToolStart, contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent() (+12 more)

### Community 86 - "ManagerStructuredMemoryStore"
Cohesion: 0.21
Nodes (7): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

### Community 87 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 88 - "capture-workbench-review.ts"
Cohesion: 0.11
Nodes (16): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, createWorkspaceFixtureState() (+8 more)

### Community 89 - "ChatMessage"
Cohesion: 0.15
Nodes (11): Connection, nextVoiceControl(), Client, PatchSocket, Browser, seedOffset, ChatMessage, HubResyncRequest (+3 more)

### Community 90 - "KnowledgeStore"
Cohesion: 0.18
Nodes (7): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 91 - "ComputerSummary"
Cohesion: 0.13
Nodes (5): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation, ComputerSummary

### Community 92 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 93 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (19): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+11 more)

### Community 94 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 95 - "normalizeKnowledgeRelativePath"
Cohesion: 0.17
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), pathRecordSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+10 more)

### Community 96 - "manager-routes.ts"
Cohesion: 0.13
Nodes (14): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+6 more)

### Community 97 - "oracle-voice-tickets.ts"
Cohesion: 0.15
Nodes (14): ConsumedVoiceTicket, DEFAULT_MAX_VOICE_TICKETS, DEFAULT_VOICE_TICKET_TTL_MS, IssuedVoiceTicket, normalizeAddress(), normalizeClient(), normalizeOrigin(), requirePositiveInteger() (+6 more)

### Community 98 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+10 more)

### Community 99 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 100 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 101 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 102 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema, PersistedBinding (+11 more)

### Community 103 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 104 - "terminal-form-deadline.test.ts"
Cohesion: 0.12
Nodes (15): TerminalFormContinuation, question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture() (+7 more)

### Community 105 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 106 - "agent-service.test.ts"
Cohesion: 0.14
Nodes (11): terminalFormSteps(), cliDiscovery, configurableModel(), directories, FakeCopilotClient, probeService(), services, startupFifoFixture() (+3 more)

### Community 107 - "OnlineRecognizer"
Cohesion: 0.10
Nodes (7): GeneratedAudio, OfflineTts, OfflineTtsConfig, OnlineRecognizer, OnlineRecognizerConfig, OnlineStream, sherpa-onnx-node

### Community 108 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 109 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 110 - "server/side-question.ts"
Cohesion: 0.20
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 111 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 112 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 113 - "oracle-voice-segments.ts"
Cohesion: 0.18
Nodes (18): alignCandidateSequences(), AlignmentCost, CandidateAlignment, candidateSubstitutionCost(), capSegment(), collectProseBlocks(), EmittedCandidate, extractSpeakableSegments() (+10 more)

### Community 114 - "refusal-metrics.ts"
Cohesion: 0.16
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+7 more)

### Community 115 - "submission-error.ts"
Cohesion: 0.17
Nodes (10): directories, runtimes, start(), trusted, RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals (+2 more)

### Community 116 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (8): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession()

### Community 117 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 118 - "react"
Cohesion: 0.14
Nodes (8): react, drawDiagram(), drawing, MermaidDiagram(), SessionActions(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 119 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (14): directories, disk, fixture(), gate(), gates, httpBoundary(), initialize(), PublicSessionValue (+6 more)

### Community 120 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 121 - "BoundedQueue"
Cohesion: 0.16
Nodes (7): abortReason(), BoundedQueue, QueueEntry, QueueWaiter, removeAbortListener(), VoiceQueueClearedError, VoiceQueueOverflowError

### Community 122 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 123 - "NewSessionDialog"
Cohesion: 0.18
Nodes (17): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+9 more)

### Community 124 - "use-oracle-settings.ts"
Cohesion: 0.21
Nodes (12): getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps, models (+4 more)

### Community 125 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 126 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 127 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 128 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 129 - "SettingsProfileStore"
Cohesion: 0.19
Nodes (6): profileStore(), SettingsProfileStore, directories, store(), SettingsProfileSnapshot, SettingsProfileTransport

### Community 130 - "Pcm16Resampler"
Cohesion: 0.19
Nodes (7): positiveLimit(), validateIdentity(), floatSampleToPcm16(), floatToPcm16(), Pcm16Resampler, validateSampleRate(), validateSamples()

### Community 131 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 132 - "DeferredSession"
Cohesion: 0.15
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 133 - "registerSessionKnowledgeRoutes"
Cohesion: 0.27
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 134 - "oracle-voice-assets.test.ts"
Cohesion: 0.23
Nodes (13): archiveMetadata(), Asset, createArchive(), createBoundaryArchive(), exec, fixtures, installerFixture(), Profile (+5 more)

### Community 135 - "fake-vad.ts"
Cohesion: 0.14
Nodes (3): FakeVadOptions, FakeVadWindow, MicVAD

### Community 136 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 137 - "recordValue"
Cohesion: 0.22
Nodes (14): backgroundHandoff(), booleanValue(), errorValue(), notificationKind(), parsedValue(), rawTailText(), recordValue(), shellIdFromFooter() (+6 more)

### Community 138 - "TranscriptionError"
Cohesion: 0.26
Nodes (4): LocalTranscriptionService, sha256(), fixture(), TranscriptionError

### Community 139 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 140 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 141 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 142 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 143 - "SessionAdmissions"
Cohesion: 0.18
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 144 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 145 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 146 - ".initialize"
Cohesion: 0.24
Nodes (4): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, open()

### Community 147 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 148 - "copilot-sdk-client.ts"
Cohesion: 0.31
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, copilotSdkClientOptions(), CopilotSdkMissingSessionRetirement, CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 149 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 150 - "settings-profile.test.ts"
Cohesion: 0.20
Nodes (6): applySettingsChanges(), sameSettingValue(), samePending(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 152 - "dataset"
Cohesion: 0.20
Nodes (9): dataset, authors, datasetUrl, license, licenseUrl, name, paperUrl, fixtures (+1 more)

### Community 153 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 154 - "benchmarkFixture"
Cohesion: 0.29
Nodes (8): benchmarkFixture(), deferred(), maybeMeasured(), measured(), measureSttPass(), measureTts(), missing(), readProcessSample()

### Community 155 - "file-upload-routes.ts"
Cohesion: 0.29
Nodes (6): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile()

### Community 157 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 158 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 159 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 160 - "SpeakableSegmenter"
Cohesion: 0.31
Nodes (3): firstTtsSegment(), SpeakableSegmenter, validateMessageId()

### Community 162 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 164 - "vite.config.ts"
Cohesion: 0.22
Nodes (5): canaryTests, oracleVoiceAssetNames, packageVersion, slowTests, tmuxTests

### Community 165 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 166 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 167 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 169 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 170 - "oracle-voice-benchmark.test.ts"
Cohesion: 0.33
Nodes (5): BenchmarkProfile, normalizeTranscript(), VoiceBenchmarkReport, wordErrorRate(), OracleVoiceSttProfile

### Community 171 - "HubEvent"
Cohesion: 0.33
Nodes (3): ComputerManagerEvents, HubEventSource, HubEvent

### Community 172 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 173 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 174 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 176 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 177 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 178 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 179 - "api-origin.test.ts"
Cohesion: 0.40
Nodes (4): prefixes, session, trusted, untrusted

### Community 180 - "promotion-setup.test.ts"
Cohesion: 0.60
Nodes (4): exec, fixtures, setupFixture(), shellFunction()

### Community 181 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 182 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 184 - "useOracleConversation"
Cohesion: 0.50
Nodes (3): OracleConversation, renderConversation(), useOracleConversation()

## Knowledge Gaps
- **1052 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+1047 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1786 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionStore`, `SettingsProfileStore`, `SessionDetail`, `oracle-voice-session.ts`, `TranscriptionError`, `ManagerAgent`, `ManagedSession`, `oracle-voice-worker.ts`, `manager-agent.ts`, `file-upload-routes.ts`, `manager-context.ts`, `session-knowledge-routes.test.ts`, `ProviderSessionService`, `ManagerStore`, `SessionService`, `TerminalSessionController`, `oracle-voice-config.ts`, `SessionKnowledgeStore`, `PushNotificationService`, `SessionOrderStore`, `cli-canary.ts`, `delegated-transcription-service.ts`, `ManagerStructuredMemoryStore`, `KnowledgeStore`, `transcription-service.ts`, `manager-routes.ts`, `refusal-metrics.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `SessionDetail`, `session-resources.ts`, `TerminalSessionController`, `CopilotSessionLike`, `recordValue`, `session-resource-clear.test.ts`, `.takeInTranscript`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `SessionDetail`, `session-resources.ts`, `server/side-question.ts`, `TerminalSessionController`, `claude-agent-service.ts`, `CopilotSessionLike`, `recordValue`, `.takeInTranscript`, `.readBackgroundTasks`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _1052 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.03952339436210404 - nodes in this community are weakly interconnected._
- **Should `SessionStore` be split into smaller, more focused modules?**
  _Cohesion score 0.028514399771884802 - nodes in this community are weakly interconnected._
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
