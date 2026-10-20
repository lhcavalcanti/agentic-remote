# Agentic Remote - Graphify code map

Snapshot: `37b086a1b8cee70d3701e3688e83d67739af232a77d5b19fbeb7264904a63679`

Source checkout: `e5b8ede28581a93f69c2e20de9c560e9b5c4139b`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 319 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 319 files · ~641,239 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4881 nodes · 13729 edges · 180 communities (145 shown, 19 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 893 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- api.ts
- App
- .get
- SessionStore
- App.tsx
- SessionDetail
- contracts.ts
- AgentService
- computer-manager.ts
- agentic-remote-promotion-monitor
- .create
- ManagedSession
- CopilotSessionLike
- claude-agent-service.ts
- PushNotificationService
- terminal-session.ts
- workspace-fixtures.ts
- SessionService
- TmuxTerminalSessionController
- manager-tools.ts
- manager-structured-memory-validation.ts
- BackgroundTaskSnapshot
- ManagerAgent
- active-sessions.ts
- agent-service.ts
- .sendInternal
- markdown-navigation.ts
- pwa.ts
- RemoteNodeClient
- bundle
- ProviderSessionService
- background-task-adapter.ts
- manager-agent.ts
- manager-context.ts
- tmux-test-helpers.ts
- shell.ts
- lib.rs
- app.ts
- ManagerStore
- agentic-remote-promotion-setup
- hub-routes.ts
- knowledge-tree.ts
- agentic-remote-gate
- config.rs
- FakeSessionService
- manager-structured-memory.ts
- dependencies
- devDependencies
- shared/settings-profile.ts
- agentic-remote
- .discoverSessions
- manager-agent.test.ts
- SessionKnowledgeStore
- terminal-startup-queue.test.ts
- UserInputReplyInput
- SessionOrderStore
- terminal-session.test.ts
- ManagerAssistant.tsx
- send-matrix.integration.test.ts
- SettingsProfileClient
- cli-canary.ts
- scripts
- session-patch-browser.ts
- recordValue
- ManagerStructuredMemoryStore
- manager-structured-memory-search.ts
- compilerOptions
- ChatMessage
- KnowledgeStore
- delegated-transcription-service.ts
- session-knowledge-store.ts
- transcription-service.ts
- src/settings-profile.ts
- .toolHost
- manager-routes.ts
- session-resource-clear.test.ts
- capture-workspace.ts
- use-oracle-settings.ts
- startup-phases.test.ts
- session-clear-transcript.test.ts
- session-reply-durability.test.ts
- settings-profile-store.ts
- full-gate.test.ts
- session-store-providers.test.ts
- PromptCards.tsx
- compilerOptions
- agent-service.test.ts
- refusal-metrics.ts
- compilerOptions
- compilerOptions
- directory-browser.ts
- ManagerMemory
- workspace-browser.ts
- normalizeKnowledgeRelativePath
- capture
- react
- NewSessionDialog
- use-session-knowledge-root.ts
- server/session-patches.ts
- session-latency-benchmark.ts
- recovery-resend-durability.test.ts
- ReaderWorkspace
- background-task-stop.test.ts
- promotion-monitor.test.ts
- submission-error.ts
- terminal-form-deadline.test.ts
- scripts
- DeferredSession
- file-upload-routes.ts
- ManagerAssistant
- desktop.json
- recordValue
- registerSessionKnowledgeRoutes
- theme-contrast.test.ts
- BackgroundTasksDialog.tsx
- .oxlintrc.json
- settings-local.json
- CopilotClientLike
- TranscriptionError
- session-response-order.ts
- background-task-tracker.ts
- manager-structured-memory-performance.test.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- session-knowledge-routes.ts
- server/side-question.ts
- generate-pwa-icons.ts
- bridge.rs
- screenshot-stability.test.ts
- claude-agent-service.test.ts
- copilot-sdk-client.ts
- ManagerStructuredMemoryRuntime
- promotion-setup-execution.test.ts
- settings-profile.test.ts
- package.json
- SessionFileUpload
- recovery-context.ts
- release-publication.test.ts
- requestVoid
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- .transport
- composer-layout.test.ts
- usePanelWidth
- MarkdownCodeBlock.tsx
- vite.config.ts
- hasActiveBackgroundTasks
- FakeRecorder
- terminal-send-uncertainty.test.ts
- .readBackgroundTasks
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
2. `App()` - 269 edges
3. `AgentService` - 263 edges
4. `SessionStore` - 178 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 98 edges
7. `registerHubRoutes()` - 91 edges
8. `ComputerManager` - 86 edges
9. `SessionService` - 73 edges
10. `ManagerAgent` - 72 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (180 total, 19 thin omitted)

### Community 0 - "api.ts"
Cohesion: 0.03
Nodes (125): AddKnowledgeRootInput, ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, PushSettings, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, addKnowledgeRoot() (+117 more)

### Community 1 - "App"
Cohesion: 0.04
Nodes (134): isManagerEvent(), terminalSendOptions(), askSession(), deleteSession(), saveSessionOrderLane(), activeComposerPastes(), App(), adoptConversationReplacement() (+126 more)

### Community 2 - ".get"
Cohesion: 0.05
Nodes (8): agentMode(), isUncertainDelivery(), queueConflict(), isRetainedRefusal(), QueuedPromptReservation, TranscriptObservation, TerminalSessionController, deliveryUncertaintyFromError()

### Community 3 - "SessionStore"
Cohesion: 0.04
Nodes (46): fixture(), channels, directories, fixture(), observe(), canArchiveSession(), idleDaysSchema, mergeSessionRetention() (+38 more)

### Community 4 - "App.tsx"
Cohesion: 0.03
Nodes (98): ActivityStatus, AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+90 more)

### Community 5 - "SessionDetail"
Cohesion: 0.05
Nodes (18): ClaudeAgentService, isMissingClaudeSessionError(), copilotRequest(), claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred(), directory() (+10 more)

### Community 6 - "contracts.ts"
Cohesion: 0.03
Nodes (52): ClaudeAgentServiceEvents, DirectoryScope, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, ProviderSessionServiceEvents, DEFINITE_DISPATCH_REFUSALS, REDIRECT_STATUSES, RemoteNodeClientEvents (+44 more)

### Community 7 - "AgentService"
Cohesion: 0.05
Nodes (9): AgentService, foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), removeCopilotSessionFiles(), RuntimeConfigurationError, statusFromEvents(), SideQuestionError (+1 more)

### Community 8 - "computer-manager.ts"
Cohesion: 0.04
Nodes (44): ComputerManagerEvents, fixture(), managers, releases, remote, session(), RemoteSessionListing, SessionMetadataLookup (+36 more)

### Community 9 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 10 - ".create"
Cohesion: 0.04
Nodes (59): fixture(), holdProbe(), fixtures, gate(), releases, restart(), directories, fakeClient() (+51 more)

### Community 11 - "ManagedSession"
Cohesion: 0.10
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), TurnContextInput, normalizeNodeUrl() (+5 more)

### Community 12 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (35): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+27 more)

### Community 13 - "claude-agent-service.ts"
Cohesion: 0.08
Nodes (53): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+45 more)

### Community 14 - "PushNotificationService"
Cohesion: 0.07
Nodes (29): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+21 more)

### Community 15 - "terminal-session.ts"
Cohesion: 0.05
Nodes (59): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerRowText() (+51 more)

### Community 16 - "workspace-fixtures.ts"
Cohesion: 0.05
Nodes (46): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+38 more)

### Community 17 - "SessionService"
Cohesion: 0.05
Nodes (24): configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, knowledgeFileQuerySchema, knowledgeQuerySchema (+16 more)

### Community 18 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (22): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, formReplyExpired(), parseTerminalUpdateNotice(), processAncestors(), processCommand() (+14 more)

### Community 19 - "manager-tools.ts"
Cohesion: 0.07
Nodes (30): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), structuredTools() (+22 more)

### Community 20 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 21 - "BackgroundTaskSnapshot"
Cohesion: 0.07
Nodes (46): BackgroundTaskSnapshot, SessionExecutionMode, KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, computers, first (+38 more)

### Community 22 - "ManagerAgent"
Cohesion: 0.10
Nodes (11): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, TurnError, withTimeout() (+3 more)

### Community 23 - "active-sessions.ts"
Cohesion: 0.07
Nodes (43): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+35 more)

### Community 24 - "agent-service.ts"
Cohesion: 0.04
Nodes (48): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+40 more)

### Community 25 - ".sendInternal"
Cohesion: 0.11
Nodes (40): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+32 more)

### Community 26 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (40): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+32 more)

### Community 27 - "pwa.ts"
Cohesion: 0.08
Nodes (41): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate() (+33 more)

### Community 28 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (8): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing

### Community 29 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 31 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (41): addActivity(), attachmentModeValue(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, eventString() (+33 more)

### Community 32 - "manager-agent.ts"
Cohesion: 0.09
Nodes (27): ManagerEventSource, isPending(), isQueued(), ManagerAgentOptions, Rung, sameRuntime(), TURN_ACTIVITY, JournalKind (+19 more)

### Community 33 - "manager-context.ts"
Cohesion: 0.08
Nodes (33): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+25 more)

### Community 34 - "tmux-test-helpers.ts"
Cohesion: 0.12
Nodes (31): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, assertSameIdentity(), createIsolatedTmuxRoot() (+23 more)

### Community 35 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 36 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 37 - "app.ts"
Cohesion: 0.08
Nodes (24): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+16 more)

### Community 38 - "ManagerStore"
Cohesion: 0.10
Nodes (7): openStore(), JournalRecorder, sessionTask(), emptyState(), ManagerStore, registryKey(), open()

### Community 39 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 40 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 41 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (35): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+27 more)

### Community 42 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 43 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 44 - "FakeSessionService"
Cohesion: 0.08
Nodes (3): FakeSessionService, ConfigureRuntimeInput, SideQuestionExchange

### Community 45 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (29): ManagerStructuredMemorySearchIndex, ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES (+21 more)

### Community 46 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+27 more)

### Community 47 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 48 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (33): AccentSetting, appearanceSettings, applySettingsChanges(), isRecord(), isSettingsRevision(), NewSessionFoldersSetting, NewSessionRuntime, NewSessionRuntimesSetting (+25 more)

### Community 49 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 50 - ".discoverSessions"
Cohesion: 0.12
Nodes (3): httpBoundary(), cloneSession(), StartupPhases

### Community 51 - "manager-agent.test.ts"
Cohesion: 0.09
Nodes (14): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+6 more)

### Community 52 - "SessionKnowledgeStore"
Cohesion: 0.14
Nodes (9): bindingKey(), SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases, root() (+1 more)

### Community 53 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (26): findActiveCopilotSessions(), appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs (+18 more)

### Community 54 - "UserInputReplyInput"
Cohesion: 0.15
Nodes (6): persistedFormAnswer(), terminalAnswerRefused(), TerminalFormContinuation, TerminalFormReplyError, PendingUserInput, UserInputReplyInput

### Community 55 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 56 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (25): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse() (+17 more)

### Community 57 - "ManagerAssistant.tsx"
Cohesion: 0.10
Nodes (19): ManagerSessionRef, cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage() (+11 more)

### Community 58 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (23): BUSY, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec, Expected (+15 more)

### Community 59 - "SettingsProfileClient"
Cohesion: 0.18
Nodes (5): SettingsProfileSnapshot, errorText(), isRefusal(), SettingsProfileClient, SettingsProfileTransport

### Community 60 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 61 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 62 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (24): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+16 more)

### Community 63 - "recordValue"
Cohesion: 0.20
Nodes (22): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isMissingSessionError() (+14 more)

### Community 64 - "ManagerStructuredMemoryStore"
Cohesion: 0.22
Nodes (6): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemorySearchResult, ManagerStructuredMemoryState

### Community 65 - "manager-structured-memory-search.ts"
Cohesion: 0.15
Nodes (21): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+13 more)

### Community 66 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 67 - "ChatMessage"
Cohesion: 0.15
Nodes (11): Connection, Client, PatchSocket, Browser, seedOffset, StoredSession, ChatMessage, HubResyncRequest (+3 more)

### Community 68 - "KnowledgeStore"
Cohesion: 0.17
Nodes (7): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 69 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (12): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload (+4 more)

### Community 70 - "session-knowledge-store.ts"
Cohesion: 0.09
Nodes (21): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+13 more)

### Community 71 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 72 - "src/settings-profile.ts"
Cohesion: 0.12
Nodes (19): AppearanceSetting, SettingsChange, SettingsProfileKey, SettingsProfileValues, Appearance, appearanceFrom(), appearanceStorageKey, CachedProfile (+11 more)

### Community 73 - ".toolHost"
Cohesion: 0.13
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 74 - "manager-routes.ts"
Cohesion: 0.13
Nodes (14): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+6 more)

### Community 75 - "session-resource-clear.test.ts"
Cohesion: 0.13
Nodes (20): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+12 more)

### Community 76 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 77 - "use-oracle-settings.ts"
Cohesion: 0.15
Nodes (14): RuntimeModelOption, getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus() (+6 more)

### Community 78 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (13): phases, port, createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address (+5 more)

### Community 79 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 80 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+10 more)

### Community 81 - "settings-profile-store.ts"
Cohesion: 0.17
Nodes (12): profileStore(), SettingsProfileState, SettingsProfileStore, directories, store(), applySettingsImport(), isSettingsDeviceId(), isSettingsProfileKey() (+4 more)

### Community 82 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 83 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+2 more)

### Community 84 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 85 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 86 - "agent-service.test.ts"
Cohesion: 0.14
Nodes (11): terminalFormSteps(), cliDiscovery, configurableModel(), directories, FakeCopilotClient, probeService(), services, startupFifoFixture() (+3 more)

### Community 87 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 88 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 89 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 90 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 91 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 92 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 93 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 94 - "capture"
Cohesion: 0.15
Nodes (18): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+10 more)

### Community 95 - "react"
Cohesion: 0.14
Nodes (8): react, drawDiagram(), drawing, MermaidDiagram(), SessionActions(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 96 - "NewSessionDialog"
Cohesion: 0.17
Nodes (18): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+10 more)

### Community 97 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 98 - "server/session-patches.ts"
Cohesion: 0.20
Nodes (8): publish(), diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 99 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 100 - "recovery-resend-durability.test.ts"
Cohesion: 0.14
Nodes (13): directories, disk, fixture(), gate(), gates, initialize(), PublicSessionValue, runtimes (+5 more)

### Community 101 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 102 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 103 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 104 - "submission-error.ts"
Cohesion: 0.22
Nodes (9): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, SubmissionReceipt, submissionReceiptFromError() (+1 more)

### Community 105 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 106 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 107 - "DeferredSession"
Cohesion: 0.15
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 108 - "file-upload-routes.ts"
Cohesion: 0.20
Nodes (8): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), registerTranscriptionRoutes(), transcriptionMultipartOptions

### Community 109 - "ManagerAssistant"
Cohesion: 0.23
Nodes (13): applyEvent(), canTakeFocus(), ManagerAssistant(), act(), announce(), cancelEdit(), onEditKeyDown(), onKeyDown() (+5 more)

### Community 110 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 111 - "recordValue"
Cohesion: 0.22
Nodes (14): backgroundHandoff(), booleanValue(), errorValue(), notificationKind(), parsedValue(), rawTailText(), recordValue(), shellIdFromFooter() (+6 more)

### Community 112 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 113 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 114 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 115 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 116 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 117 - "CopilotClientLike"
Cohesion: 0.15
Nodes (6): CopilotClientLike, CopilotSdkMissingSessionRetirement, boots, [directory, backend, resultPath, phase = 'idle'], fixtureRoot, CopilotResourceClient

### Community 118 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 119 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 120 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 121 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.23
Nodes (7): benchmarkState(), now(), openFixture(), searchSamples(), isMissing(), ManagerStructuredMemoryRecoveryError, open()

### Community 122 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 123 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 124 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 125 - "server/side-question.ts"
Cohesion: 0.27
Nodes (8): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), sideQuestionPrompt(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH, SIDE_QUESTION_EARLIER_LIMIT, SIDE_QUESTION_MAX_LENGTH

### Community 126 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 127 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 128 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 129 - "claude-agent-service.test.ts"
Cohesion: 0.25
Nodes (6): cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle()

### Community 130 - "copilot-sdk-client.ts"
Cohesion: 0.42
Nodes (7): COPILOT_SDK_SESSION_DISCOVERY, copilotSdkClientOptions(), CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 131 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.28
Nodes (3): initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, ManagerStructuredMemoryStatus

### Community 132 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 133 - "settings-profile.test.ts"
Cohesion: 0.25
Nodes (4): resolveAppearance(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 134 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 136 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 137 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 138 - "requestVoid"
Cohesion: 0.32
Nodes (8): addComputer(), deleteKnowledgeRoot(), removeComputer(), requestVoid(), removeRoot(), ComputersDialog(), remove(), submit()

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

### Community 145 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 146 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 147 - "vite.config.ts"
Cohesion: 0.33
Nodes (4): canaryTests, packageVersion, slowTests, tmuxTests

## Knowledge Gaps
- **906 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+901 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1392 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `.get`, `SessionStore`, `contracts.ts`, `SessionFileUpload`, `CopilotSessionLike`, `claude-agent-service.ts`, `.discoverSessions`, `UserInputReplyInput`, `agent-service.ts`, `directory-browser.ts`, `.readBackgroundTasks`, `recordValue`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `.get`, `ManagerStructuredMemoryRuntime`, `SessionStore`, `SessionDetail`, `AgentService`, `computer-manager.ts`, `ManagedSession`, `PushNotificationService`, `SessionService`, `ManagerAgent`, `pwa.ts`, `ProviderSessionService`, `ManagerStore`, `SessionKnowledgeStore`, `SessionOrderStore`, `cli-canary.ts`, `KnowledgeStore`, `delegated-transcription-service.ts`, `transcription-service.ts`, `manager-routes.ts`, `settings-profile-store.ts`, `refusal-metrics.ts`, `submission-error.ts`, `file-upload-routes.ts`, `TranscriptionError`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `.get`, `SessionDetail`, `AgentService`, `SessionFileUpload`, `.create`, `CopilotSessionLike`, `.discoverSessions`, `UserInputReplyInput`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _906 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.026831785345717233 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.036048458583669854 - nodes in this community are weakly interconnected._
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
- `src/index.css`
