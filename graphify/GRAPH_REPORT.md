# Agentic Remote - Graphify code map

Snapshot: `5bf3169b7055d67993663ff972019017313c3813c8ae2e1724d5c784d7489ead`

Source checkout: `40d429f6dd145f6eca3cfacd958e1a96c19587b3`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 315 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 315 files · ~626,705 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4798 nodes · 13562 edges · 177 communities (142 shown, 19 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 891 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App.tsx
- App
- session-store.ts
- contracts.ts
- claude-agent-service.ts
- ClaudeAgentService
- api.ts
- terminal-session.ts
- CopilotSessionLike
- SessionStore
- ManagedSession
- .get
- agentic-remote-promotion-monitor
- app.ts
- BackgroundTaskSnapshot
- PushNotificationService
- transcription-service.ts
- ManagerAgent
- RemoteNodeClient
- submitMessage
- App.test.tsx
- manager-agent.ts
- manager-tools.ts
- manager-structured-memory-validation.ts
- markdown-navigation.ts
- tmux-test-helpers.ts
- ManagerStore
- TmuxTerminalSessionController
- agent-service.ts
- SessionDetail
- pwa.ts
- .sendInternal
- bundle
- ProviderSessionService
- lib.rs
- SessionService
- shell.ts
- manager.ts
- agentic-remote-promotion-setup
- config.rs
- FakeSessionService
- active-sessions.ts
- session-resource-providers.test.ts
- hub-routes.ts
- dependencies
- devDependencies
- agentic-remote
- node-routes.ts
- manager-structured-memory.ts
- UserInputReplyInput
- SessionOrderStore
- shared/settings-profile.ts
- terminal-startup-queue.test.ts
- session-knowledge-routes.test.ts
- terminal-session.test.ts
- session-patch-browser.ts
- KnowledgeStore
- cli-canary.ts
- send-matrix.integration.test.ts
- scripts
- background-task-adapter.ts
- manager-context.ts
- manager-structured-memory-search.ts
- SessionKnowledgeStore
- settings-profile-store.ts
- src/settings-profile.ts
- SettingsProfileClient
- recordValue
- compilerOptions
- ChatMessage
- .toolHost
- ManagerAssistant.tsx
- ManagerAssistant
- normalizeKnowledgeRelativePath
- ManagerStructuredMemoryStore
- session-reply-durability.test.ts
- capture-workspace.ts
- use-oracle-settings.ts
- startup-phases.test.ts
- session-store-providers.test.ts
- PromptCards.tsx
- knowledge-tree.ts
- compilerOptions
- compilerOptions
- compilerOptions
- directory-browser.ts
- backgroundTasksFromEvents
- ManagerMemory
- workspace-browser.ts
- SessionKnowledgeBinding
- terminal-form-deadline.test.ts
- agent-service.test.ts
- session-clear-transcript.test.ts
- session-knowledge-store.ts
- session-latency-benchmark.ts
- server/side-question.ts
- ReaderWorkspace
- workspace-fixtures.ts
- recovery-resend-durability.test.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- NewSessionDialog
- check-workspace-review-regressions.ts
- scripts
- recordValue
- background-task-stop.test.ts
- desktop.json
- registerSessionKnowledgeRoutes
- theme-contrast.test.ts
- capture-workbench-review.ts
- .oxlintrc.json
- settings-local.json
- background-task-tracker.ts
- promotion-monitor.test.ts
- session-resource-clear.test.ts
- recovery-seed-guards.test.ts
- session-retention.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- .initialize
- session-knowledge-routes.ts
- settings-profile.test.ts
- setupWorkspaceFixture
- generate-pwa-icons.ts
- DeferredSession
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- manager-structured-memory-performance.test.ts
- promotion-setup-execution.test.ts
- session-knowledge-store.test.ts
- voice-recorder.ts
- package.json
- recovery-context.ts
- release-publication.test.ts
- tmux-errors.integration.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- .transport
- composer-layout.test.ts
- usePanelWidth
- MarkdownCodeBlock.tsx
- vite.config.ts
- FakeRecorder
- terminal-send-uncertainty.test.ts
- MermaidDiagram.tsx
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

## Communities (177 total, 19 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (12): agentMode(), AgentService, foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError (+4 more)

### Community 1 - "App.tsx"
Cohesion: 0.02
Nodes (107): configureRuntime(), getRuntimeOptions(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+99 more)

### Community 2 - "App"
Cohesion: 0.03
Nodes (121): isManagerEvent(), alertNotification(), askSession(), cancelBackgroundTask(), clearConversation(), configureRetention(), listCommands(), listKnowledgeEntries() (+113 more)

### Community 3 - "session-store.ts"
Cohesion: 0.03
Nodes (81): CopilotClientLike, fixture(), holdProbe(), fixtures, gate(), releases, restart(), directories (+73 more)

### Community 4 - "contracts.ts"
Cohesion: 0.04
Nodes (70): ClaudeAgentServiceEvents, ComputerManagerEvents, managers, releases, remote, RemoteSessionListing, RegistryState, DirectoryScope (+62 more)

### Community 5 - "claude-agent-service.ts"
Cohesion: 0.05
Nodes (67): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+59 more)

### Community 6 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (7): ClaudeAgentService, isMissingClaudeSessionError(), waitForIdle(), copilotRequest(), assertSessionNotRetained(), StartupPhases, QueuedPromptDispatchResult

### Community 7 - "api.ts"
Cohesion: 0.05
Nodes (75): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), submissionReceiptFromError() (+67 more)

### Community 8 - "terminal-session.ts"
Cohesion: 0.05
Nodes (72): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerHoldsOtherText() (+64 more)

### Community 9 - "CopilotSessionLike"
Cohesion: 0.05
Nodes (35): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+27 more)

### Community 10 - "SessionStore"
Cohesion: 0.07
Nodes (5): providerFixture(), canArchiveSession(), SessionStore, createStore(), temporaryDirectories

### Community 11 - "ManagedSession"
Cohesion: 0.09
Nodes (15): ComputerManager, managedSession(), fixture(), session(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, TurnContextInput (+7 more)

### Community 12 - ".get"
Cohesion: 0.07
Nodes (6): terminalAnswerRefused(), queueConflict(), fixture(), isRetainedRefusal(), TerminalSessionController, PendingPermission

### Community 13 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (71): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+63 more)

### Community 14 - "app.ts"
Cohesion: 0.05
Nodes (47): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+39 more)

### Community 15 - "BackgroundTaskSnapshot"
Cohesion: 0.06
Nodes (52): react, hasActiveBackgroundTasks(), hasRunningBackgroundAgent(), BackgroundTaskSnapshot, DialogFrame(), KnowledgeRootSelector(), root, SessionFilter (+44 more)

### Community 16 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 17 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 18 - "ManagerAgent"
Cohesion: 0.08
Nodes (13): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, ManagerSdkSession, sameRuntime(), capturePrompt() (+5 more)

### Community 19 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (15): mapWithConcurrency(), RemoteResync, RemoteSessionRead, RegisteredComputer, headerSafe(), RemoteNodeClient, client(), servers (+7 more)

### Community 20 - "submitMessage"
Cohesion: 0.07
Nodes (61): terminalSendOptions(), updateQueuedPrompt(), activeComposerPastes(), appendComposerForKey(), cancelQueuedPromptEdit(), composerChanged(), composerKeyDown(), composerPasted() (+53 more)

### Community 21 - "App.test.tsx"
Cohesion: 0.04
Nodes (40): addKnowledgeRoot(), cancelSession(), getSession(), listComputers(), listKnowledgeRoots(), listSessionListing(), listSessions(), renameSession() (+32 more)

### Community 22 - "manager-agent.ts"
Cohesion: 0.05
Nodes (30): ManagerEventSource, discover(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSessionConfig (+22 more)

### Community 23 - "manager-tools.ts"
Cohesion: 0.06
Nodes (30): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), structuredTools() (+22 more)

### Community 24 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 25 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (45): executeCommand(), listWorkspace(), searchWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+37 more)

### Community 26 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (44): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+36 more)

### Community 27 - "ManagerStore"
Cohesion: 0.07
Nodes (18): openStore(), JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), emptyState(), JournalDraft, JournalEntry (+10 more)

### Community 28 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (14): question(), fixture(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand() (+6 more)

### Community 29 - "agent-service.ts"
Cohesion: 0.05
Nodes (45): AcceptedSdkReply, ActivePrompt, activityResult(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+37 more)

### Community 30 - "SessionDetail"
Cohesion: 0.09
Nodes (5): observe(), grantTerminalRecovery(), holdOtherWrite(), QueuedPrompt, SessionDetail

### Community 31 - "pwa.ts"
Cohesion: 0.08
Nodes (41): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate() (+33 more)

### Community 32 - ".sendInternal"
Cohesion: 0.11
Nodes (37): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+29 more)

### Community 33 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 35 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 37 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 38 - "manager.ts"
Cohesion: 0.09
Nodes (28): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+20 more)

### Community 39 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 40 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 42 - "active-sessions.ts"
Cohesion: 0.11
Nodes (32): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+24 more)

### Community 43 - "session-resource-providers.test.ts"
Cohesion: 0.08
Nodes (29): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, disk, EnqueueCase (+21 more)

### Community 44 - "hub-routes.ts"
Cohesion: 0.07
Nodes (35): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+27 more)

### Community 45 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+27 more)

### Community 46 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 47 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 48 - "node-routes.ts"
Cohesion: 0.07
Nodes (28): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), configureRuntimeSchema, createSessionSchema (+20 more)

### Community 49 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (27): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, open(), openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS (+19 more)

### Community 50 - "UserInputReplyInput"
Cohesion: 0.16
Nodes (9): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), formReplyExpired(), TerminalFormReplyError, PendingUserInput, UserInputReplyInput (+1 more)

### Community 51 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 52 - "shared/settings-profile.ts"
Cohesion: 0.11
Nodes (27): AccentSetting, appearanceSettings, applySettingsChanges(), isRecord(), isSettingsRevision(), NewSessionFoldersSetting, NewSessionRuntimesSetting, oneOf() (+19 more)

### Community 53 - "terminal-startup-queue.test.ts"
Cohesion: 0.14
Nodes (25): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+17 more)

### Community 54 - "session-knowledge-routes.test.ts"
Cohesion: 0.10
Nodes (12): ServerRole, SessionMetadataLookup, ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore, disk, fixtures (+4 more)

### Community 55 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (22): parseTerminalUpdateNotice(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), desktopInstallPane, directories, downloadedUpdateFooter (+14 more)

### Community 56 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 57 - "KnowledgeStore"
Cohesion: 0.16
Nodes (8): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 58 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 59 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (23): BUSY, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec, Expected (+15 more)

### Community 60 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 61 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (23): attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, booleanValue(), CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress (+15 more)

### Community 62 - "manager-context.ts"
Cohesion: 0.14
Nodes (18): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+10 more)

### Community 63 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 64 - "SessionKnowledgeStore"
Cohesion: 0.16
Nodes (6): bindingKey(), RootCatalog, SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateSchema, stateWithPaths()

### Community 65 - "settings-profile-store.ts"
Cohesion: 0.14
Nodes (16): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+8 more)

### Community 66 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (21): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+13 more)

### Community 67 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 68 - "recordValue"
Cohesion: 0.18
Nodes (22): activityDuration(), activityGroupIdFor(), activityKind(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isActivityGroupKind() (+14 more)

### Community 69 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 70 - "ChatMessage"
Cohesion: 0.15
Nodes (11): Connection, Client, PatchSocket, Browser, seedOffset, StoredSession, ChatMessage, HubResyncRequest (+3 more)

### Community 71 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, PermissionReplyInput, RenameSessionInput, SendMessageInput

### Community 72 - "ManagerAssistant.tsx"
Cohesion: 0.13
Nodes (14): ManagerSessionRef, removeQueuedManagerMessage(), resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), startOver() (+6 more)

### Community 73 - "ManagerAssistant"
Cohesion: 0.13
Nodes (20): cancelManager(), editQueuedManagerMessage(), phoneEnterCreatesNewline(), applyEvent(), canTakeFocus(), ManagerAssistant(), act(), announce() (+12 more)

### Community 74 - "normalizeKnowledgeRelativePath"
Cohesion: 0.17
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), pathRecordSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+10 more)

### Community 75 - "ManagerStructuredMemoryStore"
Cohesion: 0.26
Nodes (5): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryState

### Community 76 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+10 more)

### Community 77 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 78 - "use-oracle-settings.ts"
Cohesion: 0.16
Nodes (13): RuntimeModelOption, getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+5 more)

### Community 79 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 80 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+2 more)

### Community 81 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 82 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 83 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 84 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 85 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 86 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 87 - "backgroundTasksFromEvents"
Cohesion: 0.16
Nodes (19): backgroundTasksFromEvents(), eventString(), eventTask(), executionModeValue(), isLiveTaskStatus(), isOlderExecution(), isShellObserverTool(), isShellStopTool() (+11 more)

### Community 88 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 89 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 90 - "SessionKnowledgeBinding"
Cohesion: 0.20
Nodes (13): SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding() (+5 more)

### Community 91 - "terminal-form-deadline.test.ts"
Cohesion: 0.12
Nodes (12): build(), trusted, actions, clippedPane(), closedPane, commitKeys, committed, openPane() (+4 more)

### Community 92 - "agent-service.test.ts"
Cohesion: 0.16
Nodes (10): terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, probeService(), services, startupFifoFixture(), terminalService() (+2 more)

### Community 93 - "session-clear-transcript.test.ts"
Cohesion: 0.13
Nodes (6): SessionAdmissions, disk, fixtures, gate(), holdTurnWrite(), releases

### Community 94 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (16): bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema, PersistedBinding (+8 more)

### Community 95 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 96 - "server/side-question.ts"
Cohesion: 0.22
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 97 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 98 - "workspace-fixtures.ts"
Cohesion: 0.16
Nodes (14): CONTEXT_EXAMPLE, documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureKnowledgeRoots (+6 more)

### Community 99 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 100 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 101 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 102 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder(), reopenInterruptedSession() (+8 more)

### Community 103 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 104 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 105 - "recordValue"
Cohesion: 0.24
Nodes (15): addActivity(), boundedText(), errorValue(), parsedValue(), recordValue(), shellExitFromValue(), shellIdFromValue(), shellTask() (+7 more)

### Community 106 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 107 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 108 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 109 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 110 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 111 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 112 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 113 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (7): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 114 - "promotion-monitor.test.ts"
Cohesion: 0.27
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 115 - "session-resource-clear.test.ts"
Cohesion: 0.17
Nodes (12): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+4 more)

### Community 116 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 117 - "session-retention.ts"
Cohesion: 0.23
Nodes (7): idleDaysSchema, mergeSessionRetention(), sessionRetentionPatchSchema, sessionRetentionSchema, SessionRetention, SessionRetentionPatch, SessionRetentionSettings()

### Community 118 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 119 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 120 - ".initialize"
Cohesion: 0.27
Nodes (3): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError

### Community 121 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 122 - "settings-profile.test.ts"
Cohesion: 0.20
Nodes (4): settingsProfileCacheKey, SettingsProfileTransport, cached(), MemoryStorage

### Community 123 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 124 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 126 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 127 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 128 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 129 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.31
Nodes (6): benchmarkState(), now(), openFixture(), searchSamples(), MANAGER_STRUCTURED_MEMORY_MAX_STORE_BYTES, ManagerStructuredMemorySearchResult

### Community 130 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 131 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 132 - "voice-recorder.ts"
Cohesion: 0.28
Nodes (3): recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 133 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 134 - "recovery-context.ts"
Cohesion: 0.32
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, message(), sendLikeTheApp()

### Community 135 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 136 - "tmux-errors.integration.test.ts"
Cohesion: 0.36
Nodes (7): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer()

### Community 137 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 138 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 139 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 140 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 142 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 143 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 144 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 145 - "vite.config.ts"
Cohesion: 0.33
Nodes (4): canaryTests, packageVersion, slowTests, tmuxTests

### Community 149 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **897 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+892 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1364 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TmuxTerminalSessionController` connect `TmuxTerminalSessionController` to `.sendInternal`, `active-sessions.ts`, `.get`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `composerFocusWitnessed()` connect `terminal-session.ts` to `TmuxTerminalSessionController`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _897 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.04403992953611274 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.024806201550387597 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03125 - nodes in this community are weakly interconnected._
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
