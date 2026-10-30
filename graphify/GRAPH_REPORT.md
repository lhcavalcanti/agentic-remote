# Agentic Remote - Graphify code map

Snapshot: `0d91678895affebb96d3015f4a141199e9778c78cfbce109717b5db57c1d0864`

Source checkout: `c7fbbedfc4eb44cb07fd14e9e4ee00f3286b0e1e`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 337 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 337 files · ~664,989 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 5123 nodes · 14381 edges · 178 communities (141 shown, 21 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 895 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionDetail
- App.tsx
- App
- api.ts
- AgentService
- .get
- contracts.ts
- background-task-adapter.ts
- ManagedSession
- claude-agent-service.ts
- agentic-remote-promotion-monitor
- ClaudeAgentService
- manager-agent.ts
- ManagerAssistant.tsx
- terminal-session.ts
- CopilotClientLike
- PushNotificationService
- CopilotSessionLike
- BackgroundTaskSnapshot
- manager-structured-memory-validation.ts
- manager-tools.ts
- markdown-navigation.ts
- workspace-fixtures.ts
- tmux-errors.integration.test.ts
- RemoteNodeClient
- TmuxTerminalSessionController
- agent-service.ts
- app.ts
- node-routes.ts
- pwa.ts
- bundle
- ProviderSessionService
- TerminalSessionController
- terminal-startup-queue.test.ts
- shell.ts
- lib.rs
- dreamer-store.ts
- DreamerStore
- ManagerAgent
- SessionService
- agentic-remote-promotion-setup
- hub-routes.ts
- FakeSessionService
- knowledge-tree.ts
- agentic-remote-gate
- config.rs
- manager-structured-memory-search.ts
- ManagerStructuredMemoryStore
- dependencies
- devDependencies
- active-sessions.ts
- agentic-remote
- manager-structured-memory.ts
- SessionKnowledgeStore
- .sendInternal
- terminal-session.test.ts
- dreamer-service.ts
- SessionOrderStore
- shared/settings-profile.ts
- session-patch-browser.ts
- .discoverSessions
- delegated-transcription-service.ts
- dreamer-planner.ts
- settings-profile-store.ts
- DreamerService
- src/settings-profile.ts
- capture-workspace.ts
- recordValue
- cli-canary.ts
- send-matrix.integration.test.ts
- scripts
- directory-browser.ts
- SettingsProfileClient
- OracleDreamer.tsx
- HubEvent
- KnowledgeStore
- compilerOptions
- ManagerMessage
- ManagerStore
- manager-context.ts
- JournalRecorder
- manager-routes.ts
- transcription-service.ts
- agent-service.test.ts
- session-knowledge-store.ts
- session-reply-durability.test.ts
- noTmuxServer
- full-gate.test.ts
- startup-phases.test.ts
- session-store-providers.test.ts
- PromptCards.tsx
- compilerOptions
- refusal-metrics.ts
- compilerOptions
- compilerOptions
- ManagerMemory
- workspace-browser.ts
- normalizeKnowledgeRelativePath
- dreamer-schedule.ts
- event-log.ts
- use-session-knowledge-root.ts
- session-latency-benchmark.ts
- NewSessionDialog
- .withFormViewport
- ReaderWorkspace
- terminal-form-deadline.test.ts
- promotion-monitor.test.ts
- recovery-resend-durability.test.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- scripts
- submission-error.ts
- desktop.json
- .runTurn
- registerSessionKnowledgeRoutes
- server/side-question.ts
- TranscriptionError
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- pending-echo.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- settings-profile.test.ts
- DeferredSession
- copilot-sdk-client.ts
- session-knowledge-routes.ts
- session-response-order.ts
- generate-pwa-icons.ts
- file-upload-routes.ts
- bridge.rs
- KnowledgePosition
- promotion-setup-execution.test.ts
- SessionAdmissions
- session-clear-transcript.test.ts
- package.json
- ClientPresence
- recovery-context.ts
- release-publication.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- .transport
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- vite.config.ts
- .discoverTerminalSessions
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- ffprobe-static
- lucide-react
- pdfjs-dist
- react
- remark-parse
- web-push
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 299 edges
2. `App()` - 273 edges
3. `AgentService` - 265 edges
4. `SessionStore` - 179 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 98 edges
7. `registerHubRoutes()` - 91 edges
8. `ComputerManager` - 86 edges
9. `buildApp()` - 73 edges
10. `ManagerAgent` - 73 edges

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

## Communities (178 total, 21 thin omitted)

### Community 0 - "SessionDetail"
Cohesion: 0.03
Nodes (72): fixture(), holdProbe(), fixtures, gate(), releases, restart(), connect(), createStore() (+64 more)

### Community 1 - "App.tsx"
Cohesion: 0.02
Nodes (121): addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+113 more)

### Community 2 - "App"
Cohesion: 0.04
Nodes (131): terminalSendOptions(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession() (+123 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (117): ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, addKnowledgeRoot(), askSession(), bootstrapSessionOrder() (+109 more)

### Community 4 - "AgentService"
Cohesion: 0.04
Nodes (11): agentMode(), AgentService, foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), removeCopilotSessionFiles(), RuntimeConfigurationError, statusFromEvents() (+3 more)

### Community 5 - ".get"
Cohesion: 0.06
Nodes (8): isTerminalNotReadyRefusal(), terminalAnswerRefused(), isMissingClaudeSessionError(), preparePrompt(), queueConflict(), isRetainedRefusal(), QueuedPromptReservation, QueuedPromptDispatchResult

### Community 6 - "contracts.ts"
Cohesion: 0.03
Nodes (62): AgentServiceEvents, ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, sessionAtLeastAsNew(), directories, AUDIO_FILENAME_HEADER (+54 more)

### Community 7 - "background-task-adapter.ts"
Cohesion: 0.05
Nodes (84): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), CopilotClientTaskInfo (+76 more)

### Community 8 - "ManagedSession"
Cohesion: 0.07
Nodes (14): ComputerManager, managedSession(), mapWithConcurrency(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, ManagerHub, FakeManager (+6 more)

### Community 9 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (62): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+54 more)

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 11 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (19): ClaudeAgentService, cleanupFixtures(), waitForIdle(), copilotRequest(), claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred() (+11 more)

### Community 12 - "manager-agent.ts"
Cohesion: 0.05
Nodes (53): ManagerEventSource, ManagerAgentOptions, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Rung, Behavior, computers (+45 more)

### Community 13 - "ManagerAssistant.tsx"
Cohesion: 0.05
Nodes (49): react, ManagerStatus, cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage() (+41 more)

### Community 14 - "terminal-session.ts"
Cohesion: 0.05
Nodes (68): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerHoldsOtherText() (+60 more)

### Community 15 - "CopilotClientLike"
Cohesion: 0.04
Nodes (50): CopilotClientLike, directories, fakeClient(), fixture(), ForkRequest, forkSession(), services, ClaudeSdk (+42 more)

### Community 16 - "PushNotificationService"
Cohesion: 0.07
Nodes (29): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+21 more)

### Community 17 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (32): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+24 more)

### Community 18 - "BackgroundTaskSnapshot"
Cohesion: 0.07
Nodes (51): BackgroundTaskSnapshot, saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView (+43 more)

### Community 19 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 20 - "manager-tools.ts"
Cohesion: 0.07
Nodes (30): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), steer() (+22 more)

### Community 21 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (46): executeCommand(), listWorkspace(), readWorkspaceFile(), searchWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink() (+38 more)

### Community 22 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (44): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+36 more)

### Community 23 - "tmux-errors.integration.test.ts"
Cohesion: 0.06
Nodes (31): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+23 more)

### Community 24 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (11): headerSafe(), RemoteNodeClient, client(), servers, session, NodeInfo, RemovedQueuedPrompt, WorkspaceFile (+3 more)

### Community 25 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (14): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, formReplyExpired(), listTmuxSessions(), processAncestors(), processCommand() (+6 more)

### Community 26 - "agent-service.ts"
Cohesion: 0.05
Nodes (46): AcceptedSdkReply, ActivePrompt, activityResult(), ActivityToolStart, ansiSequence, commandShortcut(), CreationRuntime, DeliveryBoundary (+38 more)

### Community 27 - "app.ts"
Cohesion: 0.07
Nodes (29): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+21 more)

### Community 28 - "node-routes.ts"
Cohesion: 0.05
Nodes (35): ActiveClaudeQuery, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, knowledgeFileQuerySchema (+27 more)

### Community 29 - "pwa.ts"
Cohesion: 0.09
Nodes (39): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart() (+31 more)

### Community 30 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 32 - "TerminalSessionController"
Cohesion: 0.10
Nodes (9): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, TerminalSessionController, PendingPermission, PendingUserInput, UserInputReplyInput (+1 more)

### Community 33 - "terminal-startup-queue.test.ts"
Cohesion: 0.11
Nodes (35): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, client(), disk (+27 more)

### Community 34 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 35 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 36 - "dreamer-store.ts"
Cohesion: 0.08
Nodes (32): DreamerHistoryEntry, assertInteger(), DREAMER_LEASE_MS, DREAMER_MAX_HISTORY, DREAMER_MAX_ITEMS, DREAMER_MAX_RUNS, DREAMER_MAX_STATE_BYTES, DREAMER_MAX_ZONES (+24 more)

### Community 37 - "DreamerStore"
Cohesion: 0.13
Nodes (10): clone(), DreamerCapacityError, DreamerConflictError, DreamerRecoveryError, DreamerStore, emptyState(), isMissing(), publicPlan() (+2 more)

### Community 38 - "ManagerAgent"
Cohesion: 0.13
Nodes (7): discover(), isPending(), isQueued(), ManagerAgent, sameRuntime(), withTimeout(), ManagerSkillSummary

### Community 40 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 41 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 42 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 43 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (35): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+27 more)

### Community 44 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 45 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 46 - "manager-structured-memory-search.ts"
Cohesion: 0.10
Nodes (29): DreamerMemoryMetadataRecord, benchmarkState(), now(), openFixture(), searchSamples(), authorityRank, compareRanked(), createStructuredMemorySearchIndex() (+21 more)

### Community 47 - "ManagerStructuredMemoryStore"
Cohesion: 0.14
Nodes (11): capturePrompt(), digest(), isMissing(), ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, open(), ManagerStructuredMemoryCorrectInput (+3 more)

### Community 48 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+27 more)

### Community 49 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 50 - "active-sessions.ts"
Cohesion: 0.12
Nodes (31): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+23 more)

### Community 51 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 52 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (26): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+18 more)

### Community 53 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 54 - ".sendInternal"
Cohesion: 0.17
Nodes (26): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+18 more)

### Community 55 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (24): parseTerminalUpdateNotice(), submitTerminalForm(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), deliveryFixture(), desktopInstallPane (+16 more)

### Community 56 - "dreamer-service.ts"
Cohesion: 0.09
Nodes (22): DREAMER_MAX_ITEMS, DreamerPlanDraft, DreamerPlannerInput, projectDreamerMemory(), parse(), planSchema, registerDreamerRoutes(), settingsSchema (+14 more)

### Community 57 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 58 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (28): AccentSetting, appearanceSettings, isRecord(), isSettingsRevision(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting, NewSessionRuntimesSetting (+20 more)

### Community 59 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 60 - ".discoverSessions"
Cohesion: 0.12
Nodes (4): httpBoundary(), StartupPhases, hasActiveBackgroundTasks(), hasRunningBackgroundAgent()

### Community 61 - "delegated-transcription-service.ts"
Cohesion: 0.12
Nodes (14): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+6 more)

### Community 62 - "dreamer-planner.ts"
Cohesion: 0.13
Nodes (25): activeDreamerMemoryIds(), activeMemoryRecord(), addCoverage(), candidateForMemory(), candidateForSession(), carryItem(), digest(), DREAMER_DEFAULT_STALE_AFTER_MS (+17 more)

### Community 63 - "settings-profile-store.ts"
Cohesion: 0.13
Nodes (18): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+10 more)

### Community 64 - "DreamerService"
Cohesion: 0.22
Nodes (5): DreamerMemoryMetadata, setup(), DreamerService, publicSnapshot(), DreamerSnapshot

### Community 65 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (23): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, statuslineItems (+15 more)

### Community 66 - "capture-workspace.ts"
Cohesion: 0.15
Nodes (22): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+14 more)

### Community 67 - "recordValue"
Cohesion: 0.16
Nodes (24): activityDuration(), activityGroupIdFor(), activityKind(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isActivityGroupKind() (+16 more)

### Community 68 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 69 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (23): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+15 more)

### Community 70 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 71 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 72 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 73 - "OracleDreamer.tsx"
Cohesion: 0.17
Nodes (19): DreamerApiError, DreamerPlanEdit, DreamerSettingsEdit, getDreamer(), request(), saveDreamerSettings(), snapshot, updateDreamerPlan() (+11 more)

### Community 74 - "HubEvent"
Cohesion: 0.14
Nodes (12): WorkspaceFixture, ComputerManagerEvents, Client, Browser, seedOffset, StoredSession, ChatMessage, HubEvent (+4 more)

### Community 75 - "KnowledgeStore"
Cohesion: 0.18
Nodes (7): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 76 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 77 - "ManagerMessage"
Cohesion: 0.19
Nodes (4): checkContent(), errorMessage(), isNotFound(), ManagerMessage

### Community 78 - "ManagerStore"
Cohesion: 0.15
Nodes (4): openStore(), emptyState(), ManagerStore, open()

### Community 79 - "manager-context.ts"
Cohesion: 0.16
Nodes (20): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+12 more)

### Community 80 - "JournalRecorder"
Cohesion: 0.15
Nodes (9): JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), RegistryEntry, registryKey(), Row, SessionStatus (+1 more)

### Community 81 - "manager-routes.ts"
Cohesion: 0.12
Nodes (14): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+6 more)

### Community 82 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 83 - "agent-service.test.ts"
Cohesion: 0.13
Nodes (12): terminalFormSteps(), busyTerminal(), cliDiscovery, configurableModel(), directories, FakeCopilotClient, probeService(), services (+4 more)

### Community 84 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 85 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+10 more)

### Community 86 - "noTmuxServer"
Cohesion: 0.12
Nodes (14): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+6 more)

### Community 87 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 88 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 89 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+2 more)

### Community 90 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 91 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 92 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 93 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 94 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 95 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 96 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 97 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 98 - "dreamer-schedule.ts"
Cohesion: 0.25
Nodes (16): assertTimeZone(), DREAMER_CATCHUP_END_HOUR, DREAMER_RUN_HOUR, dreamerLocalDate(), dreamerLocalParts, dreamerScheduledAt(), dreamerScheduleDecision, DreamerScheduleReason (+8 more)

### Community 99 - "event-log.ts"
Cohesion: 0.22
Nodes (16): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+8 more)

### Community 100 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 101 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 102 - "NewSessionDialog"
Cohesion: 0.18
Nodes (17): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+9 more)

### Community 103 - ".withFormViewport"
Cohesion: 0.21
Nodes (14): FormReplyDeadlineError, hasClippedTerminalFormFooter(), hasClippedTerminalFormTabs(), hasTerminalFormQuestionReflowCandidate(), isTerminalLoading(), parseTerminalFormActiveField(), tabNames(), terminalBoxWrap() (+6 more)

### Community 104 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 105 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (12): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+4 more)

### Community 106 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 107 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 108 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 109 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 110 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 111 - "submission-error.ts"
Cohesion: 0.24
Nodes (8): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, SubmissionReceipt, submissionReceiptFromError()

### Community 112 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 113 - ".runTurn"
Cohesion: 0.14
Nodes (3): delay(), ManagerSdkClient, TurnError

### Community 114 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 115 - "server/side-question.ts"
Cohesion: 0.23
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 116 - "TranscriptionError"
Cohesion: 0.26
Nodes (4): LocalTranscriptionService, sha256(), fixture(), TranscriptionError

### Community 117 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 118 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 119 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 120 - "pending-echo.ts"
Cohesion: 0.28
Nodes (9): nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes(), sameText() (+1 more)

### Community 121 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 122 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 123 - "settings-profile.test.ts"
Cohesion: 0.18
Nodes (5): resolveAppearance(), settingsProfileCacheKey, SettingsProfileTransport, cached(), MemoryStorage

### Community 125 - "copilot-sdk-client.ts"
Cohesion: 0.31
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, copilotSdkClientOptions(), CopilotSdkMissingSessionRetirement, CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 126 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 127 - "session-response-order.ts"
Cohesion: 0.33
Nodes (9): carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt(), failure (+1 more)

### Community 128 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 129 - "file-upload-routes.ts"
Cohesion: 0.29
Nodes (6): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile()

### Community 130 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 131 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 132 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 134 - "session-clear-transcript.test.ts"
Cohesion: 0.25
Nodes (5): disk, fixtures, gate(), holdTurnWrite(), releases

### Community 135 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 137 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 138 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 139 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 140 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 141 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 142 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 144 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 145 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 146 - "vite.config.ts"
Cohesion: 0.33
Nodes (4): canaryTests, packageVersion, slowTests, tmuxTests

## Knowledge Gaps
- **945 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+940 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1451 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SessionService` connect `SessionService` to `contracts.ts`, `directory-browser.ts`, `claude-agent-service.ts`, `.discoverSessions`, `RemoteNodeClient`, `node-routes.ts`, `ProviderSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `composerFocusWitnessed()` connect `terminal-session.ts` to `TmuxTerminalSessionController`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _945 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.03185414516683867 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.021756021756021756 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.037758465687743485 - nodes in this community are weakly interconnected._
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
- `docs/design/oracle-dreamer.md`
- `docs/design/session-manager.md`
- `docs/design/settings-profile.md`
- `docs/mockups/activity-view.html`
- `docs/mockups/brand-logo.html`
- `docs/native-shell.md`
- `docs/provider-compatibility.md`
- `docs/sdk-architecture-roadmap.md`
- `docs/session-retention.md`
- `docs/slash-command-feedback.md`
- `docs/superpowers/plans/2026-10-16-oracle-structured-memory.md`
- `docs/superpowers/plans/2026-10-20-copilot-sdk-cli-parity.md`
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
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
