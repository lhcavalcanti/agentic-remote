# Agentic Remote - Graphify code map

Snapshot: `c8540d51ac707ed3c0c7211d57003d1e2ac5e9e59dc49d5d27a94f673a584f6f`

Source checkout: `a0946709c5e0626cf6336e3ae9f0e107df2e45db`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 317 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 317 files · ~634,671 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4854 nodes · 13659 edges · 177 communities (143 shown, 18 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 891 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- api.ts
- App
- App.tsx
- ClaudeAgentService
- .get
- SessionDetail
- contracts.ts
- session-store.ts
- AgentService
- claude-agent-service.ts
- terminal-session.ts
- ManagerAssistant.tsx
- CopilotClientLike
- ManagedSession
- agentic-remote-promotion-monitor
- pwa.ts
- sessionKey
- manager-agent.ts
- manager-structured-memory-validation.ts
- RemoteNodeClient
- TmuxTerminalSessionController
- manager-tools.ts
- markdown-navigation.ts
- send-matrix.integration.test.ts
- agent-service.ts
- .drainNextTerminalPrompt
- background-task-adapter.ts
- bundle
- ProviderSessionService
- tmux-test-helpers.ts
- queued-provider-dispatch.test.ts
- workspace-fixtures.ts
- shell.ts
- lib.rs
- hub-routes.ts
- agentic-remote-promotion-setup
- SessionKnowledgeStore
- session-knowledge-routes.test.ts
- node-routes.ts
- SessionService
- knowledge-tree.ts
- agentic-remote-gate
- config.rs
- dependencies
- devDependencies
- app.ts
- FakeSessionService
- agentic-remote
- active-sessions.ts
- src/settings-profile.ts
- SessionOrderStore
- session-patch-browser.ts
- .handleSessionEvent
- push-notification-service.ts
- PushNotificationService
- ManagerAgent
- settings-profile-store.ts
- shared/settings-profile.ts
- cli-canary.ts
- manager-structured-memory.ts
- terminal-session.test.ts
- scripts
- ManagerMessage
- manager-structured-memory-search.ts
- noTmuxServer
- SettingsProfileClient
- ManagerStructuredMemoryStore
- .sendInternal
- compilerOptions
- KnowledgeStore
- ManagerStore
- manager-routes.ts
- transcription-service.ts
- capture-workspace.ts
- normalizeKnowledgeRelativePath
- session-clear-transcript.test.ts
- session-store-providers.test.ts
- isTerminalComposerFooter
- full-gate.test.ts
- startup-phases.test.ts
- .toolHost
- submission-error.ts
- PromptCards.tsx
- compilerOptions
- manager-context.ts
- session-patches.test.ts
- session-reply-durability.test.ts
- compilerOptions
- compilerOptions
- server/side-question.ts
- directory-browser.ts
- TranscriptionError
- ManagerMemory
- workspace-browser.ts
- session-knowledge-store.ts
- session-latency-benchmark.ts
- .runTurn
- use-session-knowledge-root.ts
- ReaderWorkspace
- background-task-stop.test.ts
- manager-store.ts
- queued-dispatch.test.ts
- recovery-resend-durability.test.ts
- refusal-metrics.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- scripts
- ManagerStructuredMemoryRuntime
- send-policy.test.ts
- terminal-form-deadline.test.ts
- desktop.json
- TranscriptionService
- JournalRecorder
- registerSessionKnowledgeRoutes
- theme-contrast.test.ts
- BackgroundTasksDialog.tsx
- capture-workbench-review.ts
- .oxlintrc.json
- settings-local.json
- DeferredSession
- promotion-monitor.test.ts
- background-task-tracker.ts
- delegated-transcription-service.ts
- html-preview.ts
- .initialize
- session-knowledge-routes.ts
- generate-pwa-icons.ts
- normalizeBackgroundTask
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- promotion-setup-execution.test.ts
- settings-profile.test.ts
- package.json
- release-publication.test.ts
- render-workspace-gifs.ts
- HubEvent
- history-projection.test.ts
- manager-structured-memory-performance.test.ts
- settings-profile-routes.ts
- settings.ts
- .transport
- composer-layout.test.ts
- recovery-context.ts
- MarkdownCodeBlock.tsx
- vite.config.ts
- .snapshot
- manager-structured-memory-intent.ts
- push-routes.ts
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
3. `AgentService` - 261 edges
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

## Communities (177 total, 18 thin omitted)

### Community 0 - "api.ts"
Cohesion: 0.03
Nodes (126): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask() (+118 more)

### Community 1 - "App"
Cohesion: 0.03
Nodes (134): askSession(), clearConversation(), recoverConversation(), reorderQueuedPrompts(), updateQueuedPrompt(), activeComposerPastes(), App(), adoptConversationReplacement() (+126 more)

### Community 2 - "App.tsx"
Cohesion: 0.02
Nodes (113): addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+105 more)

### Community 3 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (26): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), toolResultText(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery() (+18 more)

### Community 4 - ".get"
Cohesion: 0.05
Nodes (13): agentMode(), foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isMissingSessionError(), removeCopilotSessionFiles(), statusFromEvents(), terminalAnswerRefused() (+5 more)

### Community 5 - "SessionDetail"
Cohesion: 0.05
Nodes (12): PendingClaudeReply, observe(), canArchiveSession(), clearRecoverySeedFailure(), cloneSession(), grantTerminalRecovery(), ownsRecoverySeedFailure(), SessionReplacementCleanupError (+4 more)

### Community 6 - "contracts.ts"
Cohesion: 0.04
Nodes (64): ClaudeAgentServiceEvents, fixture(), managers, releases, remote, session(), RemoteResync, RemoteSessionListing (+56 more)

### Community 7 - "session-store.ts"
Cohesion: 0.03
Nodes (80): fixture(), holdProbe(), fixtures, gate(), releases, restart(), directories, fakeClient() (+72 more)

### Community 8 - "AgentService"
Cohesion: 0.05
Nodes (10): AgentService, isUncertainDelivery(), persistedFormAnswer(), RuntimeConfigurationError, TerminalFormContinuation, fixture(), TerminalFormReplyError, PendingUserInput (+2 more)

### Community 9 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (64): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, releases (+56 more)

### Community 10 - "terminal-session.ts"
Cohesion: 0.06
Nodes (71): activeBottomFrame(), captureBeforeDeadline(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), containsCopiedInteractiveFrame() (+63 more)

### Community 11 - "ManagerAssistant.tsx"
Cohesion: 0.05
Nodes (53): react, ManagerEvent, ManagerSessionRef, ManagerSnapshot, ManagerStatus, cancelManager(), editQueuedManagerMessage(), getManager() (+45 more)

### Community 12 - "CopilotClientLike"
Cohesion: 0.03
Nodes (46): CopilotClientLike, CopilotSessionLike, terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, probeService(), services (+38 more)

### Community 13 - "ManagedSession"
Cohesion: 0.10
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, TurnContextInput, createHub() (+5 more)

### Community 14 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (71): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+63 more)

### Community 15 - "pwa.ts"
Cohesion: 0.06
Nodes (58): directories, provider(), AppVersion, parseAppVersion(), activateSession(), createSession(), deletePushSubscription(), getProviderRuntimeOptions() (+50 more)

### Community 16 - "sessionKey"
Cohesion: 0.07
Nodes (53): saveSessionOrderLane(), handleDragEnd(), RenameSessionDialog(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView (+45 more)

### Community 17 - "manager-agent.ts"
Cohesion: 0.06
Nodes (43): ManagerAgentOptions, ManagerSdkEvent, ManagerSdkSessionConfig, Rung, Behavior, computers, fail(), FakeClient (+35 more)

### Community 18 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 19 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (12): RemoteNodeClient, client(), servers, session, BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt, WorkspaceFile (+4 more)

### Community 20 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (18): startAgentAfterClear(), composer(), processAdapter, copilotCommand(), endProbeSession(), execFileAsync, formReplyExpired(), parseTerminalUpdateNotice() (+10 more)

### Community 21 - "manager-tools.ts"
Cohesion: 0.07
Nodes (28): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), structuredTools() (+20 more)

### Community 22 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (44): executeCommand(), listWorkspace(), readWorkspaceFile(), searchWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit() (+36 more)

### Community 23 - "send-matrix.integration.test.ts"
Cohesion: 0.06
Nodes (45): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+37 more)

### Community 24 - "agent-service.ts"
Cohesion: 0.04
Nodes (44): AcceptedSdkReply, ActivePrompt, activityDuration(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+36 more)

### Community 25 - ".drainNextTerminalPrompt"
Cohesion: 0.09
Nodes (3): httpBoundary(), isRetainedRefusal(), StartupPhases

### Community 26 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (46): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), CopilotClientTaskInfo (+38 more)

### Community 27 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 29 - "tmux-test-helpers.ts"
Cohesion: 0.12
Nodes (35): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+27 more)

### Community 30 - "queued-provider-dispatch.test.ts"
Cohesion: 0.07
Nodes (29): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), claudeFixture() (+21 more)

### Community 31 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (31): pageFor(), accents, Measurement, originalDocument, output, report, save(), scratch (+23 more)

### Community 32 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 33 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 34 - "hub-routes.ts"
Cohesion: 0.06
Nodes (36): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+28 more)

### Community 35 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 36 - "SessionKnowledgeStore"
Cohesion: 0.11
Nodes (14): WorkspaceFixtureState, bindingKey(), RootCatalog, SessionKnowledgeConflictError, SessionKnowledgeEvents, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateWithPaths() (+6 more)

### Community 37 - "session-knowledge-routes.test.ts"
Cohesion: 0.07
Nodes (18): ServerRole, SessionMetadataLookup, ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore, disk, FakeManager (+10 more)

### Community 38 - "node-routes.ts"
Cohesion: 0.06
Nodes (32): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), configureRuntimeSchema, createSessionSchema (+24 more)

### Community 40 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (35): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+27 more)

### Community 41 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 42 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 43 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+27 more)

### Community 44 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 45 - "app.ts"
Cohesion: 0.09
Nodes (20): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), ClientPresence (+12 more)

### Community 46 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 47 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 48 - "active-sessions.ts"
Cohesion: 0.13
Nodes (31): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+23 more)

### Community 49 - "src/settings-profile.ts"
Cohesion: 0.09
Nodes (25): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, settingsProfileKeys, SettingsProfileValues, SettingsUpdateResult (+17 more)

### Community 50 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 51 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 52 - ".handleSessionEvent"
Cohesion: 0.17
Nodes (25): activityGroupIdFor(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent() (+17 more)

### Community 53 - "push-notification-service.ts"
Cohesion: 0.13
Nodes (19): brief(), OracleEventSource, PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030 (+11 more)

### Community 54 - "PushNotificationService"
Cohesion: 0.18
Nodes (5): PushNotificationService, scoped(), registerPushRoutes(), NotificationCategory, NotificationPayload

### Community 55 - "ManagerAgent"
Cohesion: 0.20
Nodes (5): discover(), ManagerAgent, sameRuntime(), withTimeout(), ManagerSkillSummary

### Community 56 - "settings-profile-store.ts"
Cohesion: 0.13
Nodes (17): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+9 more)

### Community 57 - "shared/settings-profile.ts"
Cohesion: 0.11
Nodes (26): AccentSetting, appearanceSettings, isRecord(), isSettingsRevision(), NewSessionFoldersSetting, NewSessionRuntimesSetting, oneOf(), oracleResponseStyles (+18 more)

### Community 58 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 59 - "manager-structured-memory.ts"
Cohesion: 0.09
Nodes (23): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_QUERY_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_RECORDS, MANAGER_STRUCTURED_MEMORY_MAX_REQUEST_ID_CHARS (+15 more)

### Community 60 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (21): terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, deliveryFixture(), desktopInstallPane, directories, downloadedUpdateFooter, execFileAsync (+13 more)

### Community 61 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 62 - "ManagerMessage"
Cohesion: 0.17
Nodes (5): checkContent(), errorMessage(), isNotFound(), ManagerMessage, ManagerStructuredMemoryScope

### Community 63 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 64 - "noTmuxServer"
Cohesion: 0.11
Nodes (16): listTmuxSessions(), noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files (+8 more)

### Community 65 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 66 - "ManagerStructuredMemoryStore"
Cohesion: 0.21
Nodes (7): capturePrompt(), digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemorySearchResult, ManagerStructuredMemoryState

### Community 67 - ".sendInternal"
Cohesion: 0.18
Nodes (18): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), isTerminalAgentWorking(), isTerminalOverlay(), isTerminalSessionInUsePrompt() (+10 more)

### Community 68 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 69 - "KnowledgeStore"
Cohesion: 0.19
Nodes (6): KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 70 - "ManagerStore"
Cohesion: 0.15
Nodes (4): openStore(), emptyState(), ManagerStore, open()

### Community 71 - "manager-routes.ts"
Cohesion: 0.12
Nodes (14): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+6 more)

### Community 72 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 73 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 74 - "normalizeKnowledgeRelativePath"
Cohesion: 0.17
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), pathRecordSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+10 more)

### Community 75 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 76 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+3 more)

### Community 77 - "isTerminalComposerFooter"
Cohesion: 0.13
Nodes (20): boxedComposerFrame(), captureTerminal(), composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame(), DownloadedUpdateCell, downloadedUpdateFooterBlock() (+12 more)

### Community 78 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 79 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 81 - "submission-error.ts"
Cohesion: 0.15
Nodes (11): directories, runtimes, start(), trusted, RemoteNodeRedirectError, RemoteNodeRequestError, RetainedSessionError, httpDeliveryUncertain() (+3 more)

### Community 82 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 83 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 84 - "manager-context.ts"
Cohesion: 0.19
Nodes (16): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, managerPrompt(), oneLine() (+8 more)

### Community 85 - "session-patches.test.ts"
Cohesion: 0.17
Nodes (7): Client, Browser, seedOffset, HubResyncRequest, HubWireEvent, Base, SessionPatchReceiver

### Community 86 - "session-reply-durability.test.ts"
Cohesion: 0.16
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 87 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 88 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 89 - "server/side-question.ts"
Cohesion: 0.20
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 90 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 91 - "TranscriptionError"
Cohesion: 0.19
Nodes (8): collect(), oversized(), statusCodeOf(), AudioUpload, LocalTranscriptionService, supportsAudioUpload(), fixture(), TranscriptionError

### Community 92 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 93 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 94 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (16): bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema, PersistedBinding (+8 more)

### Community 95 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 96 - ".runTurn"
Cohesion: 0.12
Nodes (4): delay(), ManagerSdkClient, ManagerSdkSession, TurnError

### Community 97 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 98 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 99 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 100 - "manager-store.ts"
Cohesion: 0.19
Nodes (12): JournalRecorderOptions, Seen, sessionTask(), JournalDraft, JournalEntry, JournalKind, ManagerRegistry, ManagerStoreOptions (+4 more)

### Community 101 - "queued-dispatch.test.ts"
Cohesion: 0.14
Nodes (9): accept(), deferred(), disk, fixture(), fixtures, holdWrite(), prompt(), releases (+1 more)

### Community 102 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 103 - "refusal-metrics.ts"
Cohesion: 0.19
Nodes (14): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+6 more)

### Community 104 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 105 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 106 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 107 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.17
Nodes (8): initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, ManagerStructuredMemoryMode, ManagerStructuredMemoryStatus

### Community 108 - "send-policy.test.ts"
Cohesion: 0.16
Nodes (13): message(), sendLikeTheApp(), SessionExecutionMode, terminalSendOptions(), TerminalSendPolicyInput, TerminalSendRequestOptions, booleans, combinations (+5 more)

### Community 109 - "terminal-form-deadline.test.ts"
Cohesion: 0.18
Nodes (10): actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane(), Phase (+2 more)

### Community 110 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 111 - "TranscriptionService"
Cohesion: 0.19
Nodes (5): BuildAppOptions, DelegatedTranscriptionService, registerTranscriptionRoutes(), transcriptionMultipartOptions, TranscriptionService

### Community 113 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 114 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 115 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 116 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 117 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 118 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 119 - "DeferredSession"
Cohesion: 0.17
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 120 - "promotion-monitor.test.ts"
Cohesion: 0.27
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 121 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 122 - "delegated-transcription-service.ts"
Cohesion: 0.20
Nodes (6): DelegatedTranscriptionOptions, hubComputer, workstation, headerSafe(), MAX_AUDIO_BYTES, AudioTranscription

### Community 123 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 124 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 125 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 126 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 127 - "normalizeBackgroundTask"
Cohesion: 0.22
Nodes (8): isBackgroundTaskInfo(), isBackgroundTaskProgress(), MAX_TASK_ACTIVITY_LINES, MAX_TASK_TEXT_LENGTH, normalizeBackgroundTask(), numberValue(), progressValue(), statusValue()

### Community 128 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 129 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 130 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 131 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 132 - "settings-profile.test.ts"
Cohesion: 0.25
Nodes (4): resolveAppearance(), settingsProfileCacheKey, cached(), MemoryStorage

### Community 133 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 134 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 135 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 136 - "HubEvent"
Cohesion: 0.33
Nodes (3): ComputerManagerEvents, HubEventSource, HubEvent

### Community 137 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 138 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.43
Nodes (5): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES

### Community 139 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 140 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 142 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 143 - "recovery-context.ts"
Cohesion: 0.47
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 144 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 145 - "vite.config.ts"
Cohesion: 0.33
Nodes (4): canaryTests, packageVersion, slowTests, tmuxTests

### Community 147 - "manager-structured-memory-intent.ts"
Cohesion: 0.50
Nodes (3): hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 148 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

## Knowledge Gaps
- **902 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+897 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1385 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `ClaudeAgentService`, `.get`, `SessionDetail`, `contracts.ts`, `claude-agent-service.ts`, `.handleSessionEvent`, `agent-service.ts`, `server/side-question.ts`, `directory-browser.ts`, `.drainNextTerminalPrompt`, `normalizeBackgroundTask`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `ClaudeAgentService`, `SessionDetail`, `AgentService`, `ManagedSession`, `pwa.ts`, `ProviderSessionService`, `SessionKnowledgeStore`, `session-knowledge-routes.test.ts`, `node-routes.ts`, `SessionService`, `SessionOrderStore`, `PushNotificationService`, `ManagerAgent`, `settings-profile-store.ts`, `cli-canary.ts`, `ManagerStructuredMemoryStore`, `KnowledgeStore`, `ManagerStore`, `manager-routes.ts`, `transcription-service.ts`, `TranscriptionError`, `refusal-metrics.ts`, `ManagerStructuredMemoryRuntime`, `TranscriptionService`, `JournalRecorder`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `claude-agent-service.ts`, `delegated-transcription-service.ts`, `contracts.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _902 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.026141600335148722 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03350815850815851 - nodes in this community are weakly interconnected._
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
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
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
