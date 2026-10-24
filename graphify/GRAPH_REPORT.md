# Agentic Remote - Graphify code map

Snapshot: `6004b015f5ad8ecfc9a8a1bf1814b6e975417127c0e0f7e816a88a03d98a1f3b`

Source checkout: `8389eadccf38dcbbe47648bada1460fdbb6d3cf3`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 321 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 321 files · ~653,754 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4934 nodes · 13946 edges · 177 communities (144 shown, 17 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 923 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- api.ts
- App.tsx
- SessionDetail
- session-store.ts
- ClaudeAgentService
- contracts.ts
- claude-agent-service.ts
- agentic-remote-promotion-monitor
- ManagedSession
- terminal-session.ts
- PushNotificationService
- manager-tools.ts
- ManagerAgent
- BackgroundTaskSnapshot
- markdown-navigation.ts
- ManagerStore
- manager-structured-memory-validation.ts
- .sendAdmittedWithBackend
- RemoteNodeClient
- send-matrix.integration.test.ts
- tmux-test-helpers.ts
- TmuxTerminalSessionController
- .sendInternal
- agent-service.ts
- session-resource-clear.test.ts
- workspace-fixtures.ts
- node-routes.ts
- session-knowledge-routes.test.ts
- bundle
- ProviderSessionService
- FakeSessionService
- pwa.ts
- manager-agent.ts
- SessionService
- shell.ts
- lib.rs
- delegated-transcription-service.ts
- agentic-remote-promotion-setup
- CopilotSessionLike
- hub-routes.ts
- agentic-remote-gate
- config.rs
- UserInputReplyInput
- app.ts
- manager-structured-memory.ts
- dependencies
- devDependencies
- background-task-adapter.ts
- agentic-remote
- active-sessions.ts
- terminal-session.test.ts
- manager-agent.test.ts
- SessionKnowledgeStore
- SessionOrderStore
- recordValue
- AgentProvider
- settings-profile-store.ts
- shared/settings-profile.ts
- session-patch-browser.ts
- cli-canary.ts
- ManagerAssistant.tsx
- scripts
- HubEvent
- manager-structured-memory-search.ts
- ManagerStructuredMemoryStore
- SettingsProfileClient
- KnowledgeStore
- src/settings-profile.ts
- compilerOptions
- agent-service.test.ts
- manager-routes.ts
- transcription-service.ts
- manager-context.ts
- .toolHost
- capture-workspace.ts
- session-clear-transcript.test.ts
- session-knowledge-store.ts
- session-store-providers.test.ts
- full-gate.test.ts
- PromptCards.tsx
- ManagerAssistant
- terminal-form-deadline.test.ts
- compilerOptions
- submission-error.ts
- session-reply-durability.test.ts
- knowledge-tree.ts
- compilerOptions
- compilerOptions
- directory-browser.ts
- refusal-metrics.ts
- workspace-browser.ts
- normalizeKnowledgeRelativePath
- SettingsProfileSnapshot
- react
- use-oracle-settings.ts
- ManagerMemory
- use-session-knowledge-root.ts
- session-latency-benchmark.ts
- startup-phases.test.ts
- ReaderWorkspace
- backgroundTasksFromEvents
- background-task-stop.test.ts
- promotion-monitor.test.ts
- queued-dispatch.test.ts
- recovery-resend-durability.test.ts
- server/session-patches.ts
- NewSessionDialog
- scripts
- queued-provider-dispatch.test.ts
- check-workspace-review-regressions.ts
- desktop.json
- registerSessionKnowledgeRoutes
- theme-contrast.test.ts
- BackgroundTasksDialog.tsx
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- DeferredSession
- background-task-tracker.ts
- file-upload-routes.ts
- manager-structured-memory-performance.test.ts
- session-response-order.ts
- html-preview.ts
- copilot-sdk-client.ts
- session-knowledge-routes.ts
- server/side-question.ts
- node:fs/promises
- generate-pwa-icons.ts
- ManagerStructuredMemoryRuntime
- bridge.rs
- screenshot-stability.test.ts
- recordValue
- promotion-setup-execution.test.ts
- tmux-errors.test.ts
- package.json
- recovery-context.ts
- release-publication.test.ts
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- vite.config.ts
- removeComputer
- FakeRecorder
- terminal-send-uncertainty.test.ts
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
1. `SessionDetail` - 306 edges
2. `AgentService` - 274 edges
3. `App()` - 273 edges
4. `SessionStore` - 188 edges
5. `ClaudeAgentService` - 124 edges
6. `ManagedSession` - 98 edges
7. `registerHubRoutes()` - 91 edges
8. `ComputerManager` - 86 edges
9. `ManagerAgent` - 73 edges
10. `SessionService` - 73 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (177 total, 17 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (15): agentMode(), AgentService, isForegroundCompletionEvent(), isForegroundLifecycleEvent(), restart(), removeCopilotSessionFiles(), RuntimeConfigurationError, fixture() (+7 more)

### Community 1 - "App"
Cohesion: 0.03
Nodes (161): isManagerEvent(), alertNotification(), terminalSendOptions(), askSession(), clearConversation(), listKnowledgeEntries(), readKnowledgeFile(), recoverConversation() (+153 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (117): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), submissionReceiptFromError() (+109 more)

### Community 3 - "App.tsx"
Cohesion: 0.03
Nodes (112): configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+104 more)

### Community 4 - "SessionDetail"
Cohesion: 0.05
Nodes (12): isMissingClaudeSessionError(), fixture(), observe(), canArchiveSession(), clearRecoverySeedFailure(), grantTerminalRecovery(), ownsRecoverySeedFailure(), SessionReplacementCleanupError (+4 more)

### Community 5 - "session-store.ts"
Cohesion: 0.03
Nodes (82): CopilotClientLike, fixture(), holdProbe(), fixtures, gate(), releases, sdkPermissionEvents(), sdkRecoveryEvents() (+74 more)

### Community 6 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (18): ClaudeAgentService, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt() (+10 more)

### Community 7 - "contracts.ts"
Cohesion: 0.04
Nodes (53): AgentServiceEvents, ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, directories, AUDIO_FILENAME_HEADER (+45 more)

### Community 8 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (61): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+53 more)

### Community 9 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 10 - "ManagedSession"
Cohesion: 0.09
Nodes (13): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, FakeManager (+5 more)

### Community 11 - "terminal-session.ts"
Cohesion: 0.05
Nodes (62): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame() (+54 more)

### Community 12 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 13 - "manager-tools.ts"
Cohesion: 0.07
Nodes (32): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), steer() (+24 more)

### Community 14 - "ManagerAgent"
Cohesion: 0.10
Nodes (11): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+3 more)

### Community 15 - "BackgroundTaskSnapshot"
Cohesion: 0.07
Nodes (48): BackgroundTaskSnapshot, KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, computers, first, grouped (+40 more)

### Community 16 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (46): executeCommand(), listWorkspace(), searchWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink() (+38 more)

### Community 17 - "ManagerStore"
Cohesion: 0.07
Nodes (21): openStore(), TurnContextInput, JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), emptyState(), JournalDraft (+13 more)

### Community 18 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (52): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+44 more)

### Community 19 - ".sendAdmittedWithBackend"
Cohesion: 0.06
Nodes (8): isTerminalNotReadyRefusal(), isUncertainDelivery(), terminalAnswerRefused(), TerminalSessionController, hasActiveBackgroundTasks(), hasRunningBackgroundAgent(), PendingPermission, deliveryUncertaintyFromError()

### Community 20 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (13): headerSafe(), RemoteNodeClient, client(), servers, session, NodeInfo, RemovedQueuedPrompt, WorkspaceFile (+5 more)

### Community 21 - "send-matrix.integration.test.ts"
Cohesion: 0.05
Nodes (47): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+39 more)

### Community 22 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (43): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), exec, formFixture() (+35 more)

### Community 23 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (13): startAgentAfterClear(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), processIsAlive() (+5 more)

### Community 24 - ".sendInternal"
Cohesion: 0.12
Nodes (40): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), composerHoldsText(), composerText() (+32 more)

### Community 25 - "agent-service.ts"
Cohesion: 0.04
Nodes (44): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, ansiSequence, commandShortcut(), DeliveryBoundary (+36 more)

### Community 26 - "session-resource-clear.test.ts"
Cohesion: 0.06
Nodes (34): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), apps (+26 more)

### Community 27 - "workspace-fixtures.ts"
Cohesion: 0.07
Nodes (34): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, createWorkspaceFixtureState() (+26 more)

### Community 28 - "node-routes.ts"
Cohesion: 0.05
Nodes (35): ActiveClaudeQuery, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, knowledgeFileQuerySchema (+27 more)

### Community 29 - "session-knowledge-routes.test.ts"
Cohesion: 0.06
Nodes (24): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+16 more)

### Community 30 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 32 - "FakeSessionService"
Cohesion: 0.07
Nodes (5): FakeSessionService, routingFixture(), session(), temporaryDirectory(), AgentMode

### Community 33 - "pwa.ts"
Cohesion: 0.09
Nodes (38): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+30 more)

### Community 34 - "manager-agent.ts"
Cohesion: 0.08
Nodes (25): CreationRuntime, ManagerEventSource, isPending(), isQueued(), ManagerAgentOptions, Rung, TURN_ACTIVITY, ManagerState (+17 more)

### Community 36 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 37 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 38 - "delegated-transcription-service.ts"
Cohesion: 0.10
Nodes (15): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload (+7 more)

### Community 39 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 40 - "CopilotSessionLike"
Cohesion: 0.07
Nodes (19): CopilotSessionLike, foregroundTurnOpen(), directories, fakeClient(), ForkRequest, forkSession(), services, CopilotTasksApi (+11 more)

### Community 41 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 42 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 43 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 44 - "UserInputReplyInput"
Cohesion: 0.12
Nodes (6): persistedFormAnswer(), answer(), claudeRequest(), copilotRequest(), PendingUserInput, UserInputReplyInput

### Community 45 - "app.ts"
Cohesion: 0.09
Nodes (23): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+15 more)

### Community 46 - "manager-structured-memory.ts"
Cohesion: 0.07
Nodes (30): ManagerStructuredMemorySearchIndex, ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES (+22 more)

### Community 47 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+27 more)

### Community 48 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 49 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (32): addActivity(), attachmentModeValue(), BackgroundTaskEventOptions, booleanValue(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, eventTask() (+24 more)

### Community 50 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 51 - "active-sessions.ts"
Cohesion: 0.13
Nodes (32): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+24 more)

### Community 52 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (29): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse(), pastedPlaceholderCount() (+21 more)

### Community 53 - "manager-agent.test.ts"
Cohesion: 0.09
Nodes (14): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, capturePrompt(), computers, fail() (+6 more)

### Community 54 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 55 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 56 - "recordValue"
Cohesion: 0.17
Nodes (25): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isMissingSessionError() (+17 more)

### Community 57 - "AgentProvider"
Cohesion: 0.09
Nodes (19): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+11 more)

### Community 58 - "settings-profile-store.ts"
Cohesion: 0.12
Nodes (17): directories, fakeManager(), hub(), local, profileStore(), SettingsProfileState, SettingsProfileStore, directories (+9 more)

### Community 59 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (28): AccentSetting, appearanceSettings, isRecord(), isSettingsDeviceId(), isSettingsRevision(), NewSessionBackendSetting, newSessionBackendSettings, NewSessionFoldersSetting (+20 more)

### Community 60 - "session-patch-browser.ts"
Cohesion: 0.14
Nodes (25): advance(), connections, content(), FrameMeasurement, instrument(), lastHeading(), message(), open() (+17 more)

### Community 61 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 62 - "ManagerAssistant.tsx"
Cohesion: 0.12
Nodes (17): ManagerStatus, removeQueuedManagerMessage(), resolveManagerConfirmation(), retryManagerMessage(), sessionLinkTarget(), boundWidth(), OracleButton(), OracleControl (+9 more)

### Community 63 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 64 - "HubEvent"
Cohesion: 0.14
Nodes (13): Connection, WorkspaceFixture, ComputerManagerEvents, Client, PatchSocket, Browser, seedOffset, ChatMessage (+5 more)

### Community 65 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 66 - "ManagerStructuredMemoryStore"
Cohesion: 0.22
Nodes (6): digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemorySearchResult, ManagerStructuredMemoryState

### Community 67 - "SettingsProfileClient"
Cohesion: 0.19
Nodes (5): sameSettingValue(), errorText(), isRefusal(), samePending(), SettingsProfileClient

### Community 68 - "KnowledgeStore"
Cohesion: 0.18
Nodes (7): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 69 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (20): AppearanceSetting, NewSessionRuntime, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom(), appearanceStorageKey (+12 more)

### Community 70 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 71 - "agent-service.test.ts"
Cohesion: 0.12
Nodes (15): terminalFormSteps(), busyTerminal(), cliDiscovery, configurableModel(), directories, FakeCopilotClient, probeService(), services (+7 more)

### Community 72 - "manager-routes.ts"
Cohesion: 0.12
Nodes (14): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+6 more)

### Community 73 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 74 - "manager-context.ts"
Cohesion: 0.17
Nodes (17): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+9 more)

### Community 75 - ".toolHost"
Cohesion: 0.13
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 76 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 77 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 78 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 79 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+3 more)

### Community 80 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 81 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 82 - "ManagerAssistant"
Cohesion: 0.14
Nodes (19): editQueuedManagerMessage(), applyEvent(), canTakeFocus(), ManagerAssistant(), act(), announce(), cancelEdit(), onEditKeyDown() (+11 more)

### Community 83 - "terminal-form-deadline.test.ts"
Cohesion: 0.12
Nodes (15): TerminalFormContinuation, question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture() (+7 more)

### Community 84 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 85 - "submission-error.ts"
Cohesion: 0.16
Nodes (11): BuildAppOptions, directories, runtimes, start(), trusted, RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain() (+3 more)

### Community 86 - "session-reply-durability.test.ts"
Cohesion: 0.16
Nodes (16): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, emptyComposer (+8 more)

### Community 87 - "knowledge-tree.ts"
Cohesion: 0.18
Nodes (17): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+9 more)

### Community 88 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 89 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 90 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 91 - "refusal-metrics.ts"
Cohesion: 0.16
Nodes (15): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, overflowId, reasonCodeFromChain(), REFUSAL_OVERFLOW (+7 more)

### Community 92 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 93 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 94 - "SettingsProfileSnapshot"
Cohesion: 0.17
Nodes (6): SettingsProfileSnapshot, settingsProfileCacheKey, SettingsProfileTransport, cached(), FakeHub, MemoryStorage

### Community 95 - "react"
Cohesion: 0.14
Nodes (8): react, drawDiagram(), drawing, MermaidDiagram(), SessionActions(), recordingDuration(), FakeRecorder, useVoiceRecorder()

### Community 96 - "use-oracle-settings.ts"
Cohesion: 0.20
Nodes (12): RuntimeModelOption, getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+4 more)

### Community 97 - "ManagerMemory"
Cohesion: 0.22
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 98 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 99 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 100 - "startup-phases.test.ts"
Cohesion: 0.13
Nodes (11): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseRecord, address, directories, recorder() (+3 more)

### Community 101 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 102 - "backgroundTasksFromEvents"
Cohesion: 0.19
Nodes (16): backgroundTasksFromEvents(), eventString(), isLiveTaskStatus(), isOlderExecution(), isShellObserverTool(), isShellStopTool(), isShellTool(), isTerminalTaskStatus() (+8 more)

### Community 103 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 104 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 105 - "queued-dispatch.test.ts"
Cohesion: 0.14
Nodes (9): accept(), deferred(), disk, fixture(), fixtures, holdWrite(), prompt(), releases (+1 more)

### Community 106 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 107 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 108 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession() (+8 more)

### Community 109 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 110 - "queued-provider-dispatch.test.ts"
Cohesion: 0.17
Nodes (9): claudeFixture(), copilotFixture(), copilotSession(), fixtures, gate(), originalQueue, pause(), releases (+1 more)

### Community 111 - "check-workspace-review-regressions.ts"
Cohesion: 0.15
Nodes (11): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+3 more)

### Community 112 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 113 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 114 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 115 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 116 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 117 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 118 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 120 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 121 - "file-upload-routes.ts"
Cohesion: 0.24
Nodes (7): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), transcriptionMultipartOptions

### Community 122 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.23
Nodes (7): benchmarkState(), now(), openFixture(), searchSamples(), isMissing(), ManagerStructuredMemoryRecoveryError, open()

### Community 123 - "session-response-order.ts"
Cohesion: 0.29
Nodes (10): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+2 more)

### Community 124 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 125 - "copilot-sdk-client.ts"
Cohesion: 0.31
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, copilotSdkClientOptions(), CopilotSdkMissingSessionRetirement, CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 126 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 127 - "server/side-question.ts"
Cohesion: 0.27
Nodes (8): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), sideQuestionPrompt(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH, SIDE_QUESTION_EARLIER_LIMIT, SIDE_QUESTION_MAX_LENGTH

### Community 128 - "node:fs/promises"
Cohesion: 0.27
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 129 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 130 - "ManagerStructuredMemoryRuntime"
Cohesion: 0.27
Nodes (4): initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, ManagerStructuredMemoryMode, ManagerStructuredMemoryStatus

### Community 131 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 132 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 133 - "recordValue"
Cohesion: 0.36
Nodes (9): backgroundHandoff(), errorValue(), notificationKind(), rawTailText(), recordValue(), shellStopAcknowledged(), shellTaskOutput(), textFromValue() (+1 more)

### Community 134 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 135 - "tmux-errors.test.ts"
Cohesion: 0.25
Nodes (6): directories, { execute }, files, links, listener(), server()

### Community 136 - "package.json"
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

### Community 143 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 144 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 145 - "vite.config.ts"
Cohesion: 0.33
Nodes (4): canaryTests, packageVersion, slowTests, tmuxTests

### Community 146 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **909 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+904 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1397 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `copilot()` connect `session-store-providers.test.ts` to `AgentService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `ClaudeAgentService`, `contracts.ts`, `CopilotSessionLike`, `claude-agent-service.ts`, `UserInputReplyInput`, `background-task-adapter.ts`, `.sendAdmittedWithBackend`, `recordValue`, `directory-browser.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `TmuxTerminalSessionController` connect `TmuxTerminalSessionController` to `.sendAdmittedWithBackend`, `.sendInternal`, `active-sessions.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _909 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.0389165210377739 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.028899768801849586 - nodes in this community are weakly interconnected._
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
- `docs/superpowers/plans/2026-10-24-copilot-sdk-restart-recovery.md`
- `docs/superpowers/specs/2026-10-16-oracle-structured-memory-design.md`
- `docs/superpowers/specs/2026-10-20-copilot-sdk-cli-parity-design.md`
- `docs/superpowers/specs/2026-10-24-copilot-sdk-restart-recovery-design.md`
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
