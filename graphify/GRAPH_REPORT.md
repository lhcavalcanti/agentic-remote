# Agentic Remote - Graphify code map

Snapshot: `405aefbc495a5918b504cf994272d04f6261b082ce155a6e61407d9b5a18d081`

Source checkout: `325968b08b0e55fab3a7721d67227c61d619362b`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 312 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 312 files · ~628,481 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4800 nodes · 13532 edges · 172 communities (134 shown, 22 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 885 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- api.ts
- App.tsx
- ClaudeAgentService
- SessionDetail
- session-store.ts
- contracts.ts
- claude-agent-service.ts
- ManagedSession
- terminal-session.ts
- session-presentation.ts
- agentic-remote-promotion-monitor
- transcription-service.ts
- FakeSessionService
- app.ts
- PushNotificationService
- ManagerAgent
- RemoteNodeClient
- manager-tools.ts
- manager-structured-memory-validation.ts
- CopilotSessionLike
- manager-agent.ts
- markdown-navigation.ts
- TmuxTerminalSessionController
- agent-service.ts
- ManagerStore
- session-latency-benchmark.ts
- bundle
- queued-provider-dispatch.test.ts
- ProviderSessionService
- .sendInternal
- pwa.ts
- SessionService
- shell.ts
- lib.rs
- workspace-fixtures.ts
- agentic-remote-promotion-setup
- hub-routes.ts
- knowledge-tree.ts
- config.rs
- TerminalSessionController
- SessionKnowledgeStore
- devDependencies
- agentic-remote
- active-sessions.ts
- tmux-test-helpers.ts
- dependencies
- agentic-remote-gate
- node-routes.ts
- UserInputReplyInput
- terminal-session.test.ts
- shared/settings-profile.ts
- manager-structured-memory.ts
- session-patch-browser.ts
- session-reply-durability.test.ts
- tmux-errors.integration.test.ts
- background-task-adapter.ts
- cli-canary.ts
- terminal-startup-queue.test.ts
- ManagerAssistant.tsx
- scripts
- session-patch-routes.test.ts
- manager-structured-memory-search.ts
- src/settings-profile.ts
- .handleSessionEvent
- ManagerMessage
- ManagerStructuredMemoryStore
- session-resource-clear.test.ts
- compilerOptions
- .toolHost
- SettingsProfileClient
- KnowledgeStore
- manager-context.ts
- capture-workspace.ts
- startup-phases.test.ts
- session-clear-transcript.test.ts
- session-store-providers.test.ts
- use-oracle-settings.ts
- session-knowledge-store.ts
- settings-profile-store.ts
- PromptCards.tsx
- ManagerAssistant
- compilerOptions
- full-gate.test.ts
- compilerOptions
- compilerOptions
- server/side-question.ts
- agent-service.test.ts
- recordValue
- ManagerMemory
- .correct
- workspace-browser.ts
- normalizeKnowledgeRelativePath
- SettingsProfileSnapshot
- react
- backgroundTasksFromEvents
- directory-browser.ts
- use-session-knowledge-root.ts
- ReaderWorkspace
- recovery-resend-durability.test.ts
- submission-error.ts
- server/session-patches.ts
- session-resource-routes.test.ts
- NewSessionDialog
- terminal-form-deadline.test.ts
- background-task-stop.test.ts
- BackgroundTasksDialog.tsx
- capture-workbench-review.ts
- desktop.json
- registerSessionKnowledgeRoutes
- theme-contrast.test.ts
- .oxlintrc.json
- settings-local.json
- promotion-monitor.test.ts
- session-response-order.ts
- scripts
- background-task-tracker.ts
- session-retention.ts
- html-preview.ts
- session-knowledge-routes.ts
- generate-pwa-icons.ts
- DeferredSession
- bridge.rs
- screenshot-stability.test.ts
- promotion-setup-execution.test.ts
- KnowledgePosition
- package.json
- release-publication.test.ts
- render-workspace-gifs.ts
- StartupPhases
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- refusal-metrics-routes.test.ts
- MarkdownCodeBlock.tsx
- removeComputer
- FakeRecorder
- .discoverTerminalSessions
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- vite.config.ts
- fastify
- ffmpeg-static
- ffprobe-static
- @github/copilot-sdk
- pdfjs-dist
- web-push
- ws
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 299 edges
2. `App()` - 268 edges
3. `AgentService` - 259 edges
4. `SessionStore` - 176 edges
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

## Communities (172 total, 22 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (14): agentMode(), AgentService, isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError, statusFromEvents() (+6 more)

### Community 1 - "App"
Cohesion: 0.04
Nodes (136): isManagerEvent(), alertNotification(), askSession(), deleteSession(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey() (+128 more)

### Community 2 - "api.ts"
Cohesion: 0.03
Nodes (117): SettingsChange, SettingsProfileKey, SettingsUpdateResult, parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask() (+109 more)

### Community 3 - "App.tsx"
Cohesion: 0.03
Nodes (108): AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+100 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (8): terminalAnswerRefused(), ClaudeAgentService, isMissingClaudeSessionError(), ownsDispatchRecovery(), preflight(), queueConflict(), QueuedDispatches, stopOwnedServer()

### Community 5 - "SessionDetail"
Cohesion: 0.05
Nodes (23): fixture(), fixture(), channels, directories, fixture(), observe(), canArchiveSession(), directories (+15 more)

### Community 6 - "session-store.ts"
Cohesion: 0.03
Nodes (76): CopilotClientLike, fixture(), holdProbe(), fixtures, gate(), releases, restart(), directories (+68 more)

### Community 7 - "contracts.ts"
Cohesion: 0.04
Nodes (66): ClaudeAgentServiceEvents, ComputerManagerEvents, fixture(), managers, releases, remote, session(), RemoteSessionListing (+58 more)

### Community 8 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (67): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+59 more)

### Community 9 - "ManagedSession"
Cohesion: 0.08
Nodes (19): ComputerManager, managedSession(), mapWithConcurrency(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, TurnContextInput (+11 more)

### Community 10 - "terminal-session.ts"
Cohesion: 0.05
Nodes (73): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFocusWitnessed(), composerFrameText(), composerHasFocus(), composerHoldsOtherText() (+65 more)

### Community 11 - "session-presentation.ts"
Cohesion: 0.05
Nodes (62): SessionExecutionMode, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root (+54 more)

### Community 12 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (71): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+63 more)

### Community 13 - "transcription-service.ts"
Cohesion: 0.05
Nodes (37): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, headerSafe() (+29 more)

### Community 14 - "FakeSessionService"
Cohesion: 0.05
Nodes (13): FakeSessionService, directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey() (+5 more)

### Community 15 - "app.ts"
Cohesion: 0.05
Nodes (42): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+34 more)

### Community 16 - "PushNotificationService"
Cohesion: 0.07
Nodes (28): brief(), HubEventSource, OracleEventSource, PushNotificationService, PushPolicy, PushSender, PushState, directories (+20 more)

### Community 17 - "ManagerAgent"
Cohesion: 0.09
Nodes (13): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, ManagerSdkSession, sameRuntime(), capturePrompt() (+5 more)

### Community 18 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (13): RemoteResync, RemoteSessionRead, RemoteNodeClient, client(), servers, session, NodeInfo, RemovedQueuedPrompt (+5 more)

### Community 19 - "manager-tools.ts"
Cohesion: 0.06
Nodes (30): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), structuredTools() (+22 more)

### Community 20 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 21 - "CopilotSessionLike"
Cohesion: 0.06
Nodes (24): CopilotSessionLike, foregroundTurnOpen(), CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), preparePrompt() (+16 more)

### Community 22 - "manager-agent.ts"
Cohesion: 0.06
Nodes (34): ManagerEventSource, discover(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSessionConfig (+26 more)

### Community 23 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (44): executeCommand(), listWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+36 more)

### Community 24 - "TmuxTerminalSessionController"
Cohesion: 0.10
Nodes (15): copilotCommand(), endProbeSession(), execFileAsync, formReplyExpired(), listTmuxSessions(), processAncestors(), processCommand(), processIsAlive() (+7 more)

### Community 25 - "agent-service.ts"
Cohesion: 0.05
Nodes (48): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+40 more)

### Community 26 - "ManagerStore"
Cohesion: 0.08
Nodes (17): openStore(), JournalRecorder, JournalRecorderOptions, Seen, sessionTask(), emptyState(), JournalDraft, JournalEntry (+9 more)

### Community 27 - "session-latency-benchmark.ts"
Cohesion: 0.08
Nodes (29): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+21 more)

### Community 28 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 29 - "queued-provider-dispatch.test.ts"
Cohesion: 0.07
Nodes (30): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), claudeFixture() (+22 more)

### Community 31 - ".sendInternal"
Cohesion: 0.13
Nodes (32): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), FormReplyDeadlineError (+24 more)

### Community 32 - "pwa.ts"
Cohesion: 0.10
Nodes (37): getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), retryHubCopilotModels() (+29 more)

### Community 34 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 35 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 36 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (30): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+22 more)

### Community 37 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 38 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 39 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (35): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+27 more)

### Community 40 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 41 - "TerminalSessionController"
Cohesion: 0.08
Nodes (6): boots, [directory, backend, resultPath, phase = 'idle'], fixtureRoot, isTerminalAgentWorking(), isTerminalVisiblyIdle(), TerminalSessionController

### Community 42 - "SessionKnowledgeStore"
Cohesion: 0.12
Nodes (12): WorkspaceFixtureState, bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeEvents, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture() (+4 more)

### Community 43 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 44 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 45 - "active-sessions.ts"
Cohesion: 0.12
Nodes (31): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+23 more)

### Community 46 - "tmux-test-helpers.ts"
Cohesion: 0.16
Nodes (29): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, assertSameIdentity(), createIsolatedTmuxRoot() (+21 more)

### Community 47 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, lucide-react (+25 more)

### Community 48 - "agentic-remote-gate"
Cohesion: 0.13
Nodes (32): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+24 more)

### Community 49 - "node-routes.ts"
Cohesion: 0.07
Nodes (30): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+22 more)

### Community 50 - "UserInputReplyInput"
Cohesion: 0.14
Nodes (7): isUncertainDelivery(), persistedFormAnswer(), TerminalFormContinuation, TerminalFormReplyError, PendingUserInput, UserInputReplyInput, deliveryUncertaintyFromError()

### Community 51 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (23): parseTerminalUpdateNotice(), submitTerminalForm(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), deliveryFixture(), desktopInstallPane (+15 more)

### Community 52 - "shared/settings-profile.ts"
Cohesion: 0.10
Nodes (29): AccentSetting, appearanceSettings, applySettingsChanges(), isRecord(), isSettingsRevision(), NewSessionFoldersSetting, NewSessionRuntimesSetting, oneOf() (+21 more)

### Community 53 - "manager-structured-memory.ts"
Cohesion: 0.09
Nodes (25): isMissing(), ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+17 more)

### Community 54 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 55 - "session-reply-durability.test.ts"
Cohesion: 0.12
Nodes (20): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+12 more)

### Community 56 - "tmux-errors.integration.test.ts"
Cohesion: 0.10
Nodes (20): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), noTmuxServer(), processGone() (+12 more)

### Community 57 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (24): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus() (+16 more)

### Community 58 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 59 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (23): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+15 more)

### Community 60 - "ManagerAssistant.tsx"
Cohesion: 0.11
Nodes (17): ManagerSessionRef, removeQueuedManagerMessage(), retryManagerMessage(), sessionLinkTarget(), boundWidth(), OracleButton(), OracleControl, OracleIndicator (+9 more)

### Community 61 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 62 - "session-patch-routes.test.ts"
Cohesion: 0.11
Nodes (9): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore, apps, directories, FakeManager, fixture() (+1 more)

### Community 63 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 64 - "src/settings-profile.ts"
Cohesion: 0.10
Nodes (21): AppearanceSetting, NewSessionRuntime, SETTINGS_MAX_COMPUTERS, settingsProfileKeys, SettingsProfileValues, statuslineItems, Appearance, appearanceFrom() (+13 more)

### Community 65 - ".handleSessionEvent"
Cohesion: 0.21
Nodes (19): activityKind(), activityResult(), ActivityToolStart, contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent() (+11 more)

### Community 66 - "ManagerMessage"
Cohesion: 0.13
Nodes (15): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+7 more)

### Community 67 - "ManagerStructuredMemoryStore"
Cohesion: 0.15
Nodes (9): benchmarkState(), now(), openFixture(), searchSamples(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, ManagerStructuredMemoryStore, open() (+1 more)

### Community 68 - "session-resource-clear.test.ts"
Cohesion: 0.09
Nodes (20): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores (+12 more)

### Community 69 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 70 - ".toolHost"
Cohesion: 0.12
Nodes (4): ManagerHub, hasExplicitStructuredMemoryIntent(), memoryObject, StructuredMemoryMutationOperation

### Community 71 - "SettingsProfileClient"
Cohesion: 0.21
Nodes (3): errorText(), isRefusal(), SettingsProfileClient

### Community 72 - "KnowledgeStore"
Cohesion: 0.19
Nodes (6): KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 73 - "manager-context.ts"
Cohesion: 0.17
Nodes (17): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+9 more)

### Community 74 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 75 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (13): phases, port, createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address (+5 more)

### Community 76 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 77 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+3 more)

### Community 78 - "use-oracle-settings.ts"
Cohesion: 0.16
Nodes (13): RuntimeModelOption, getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+5 more)

### Community 79 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+11 more)

### Community 80 - "settings-profile-store.ts"
Cohesion: 0.18
Nodes (11): profileStore(), SettingsProfileState, SettingsProfileStore, directories, store(), applySettingsImport(), isSettingsDeviceId(), isSettingsProfileKey() (+3 more)

### Community 81 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 82 - "ManagerAssistant"
Cohesion: 0.14
Nodes (19): editQueuedManagerMessage(), resolveManagerConfirmation(), applyEvent(), canTakeFocus(), ManagerAssistant(), act(), announce(), cancelEdit() (+11 more)

### Community 83 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 84 - "full-gate.test.ts"
Cohesion: 0.13
Nodes (10): Fixture, fixtures, gate(), git(), gitEnv, Result, run, start() (+2 more)

### Community 85 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 86 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 87 - "server/side-question.ts"
Cohesion: 0.20
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 88 - "agent-service.test.ts"
Cohesion: 0.15
Nodes (10): terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, probeService(), services, startupFifoFixture(), terminalService() (+2 more)

### Community 89 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 90 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 91 - ".correct"
Cohesion: 0.26
Nodes (7): digest(), ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryCorrectInput, ManagerStructuredMemoryMutationResult, ManagerStructuredMemoryRememberInput, ManagerStructuredMemoryState

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

### Community 96 - "backgroundTasksFromEvents"
Cohesion: 0.27
Nodes (17): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventTask(), executionModeValue(), isTerminalTaskStatus(), mergeShellRefresh() (+9 more)

### Community 97 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 98 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 99 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 100 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 101 - "submission-error.ts"
Cohesion: 0.21
Nodes (8): REFUSAL_OVERFLOW, RemoteNodeRedirectError, RemoteNodeRequestError, RetainedSessionError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, SubmissionError, SubmissionReceipt

### Community 102 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 103 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 104 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), reopenInterruptedSession() (+8 more)

### Community 105 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 106 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 107 - "BackgroundTasksDialog.tsx"
Cohesion: 0.22
Nodes (11): BackgroundTask, DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel() (+3 more)

### Community 108 - "capture-workbench-review.ts"
Cohesion: 0.15
Nodes (11): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, fixtureSessions (+3 more)

### Community 109 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 110 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 111 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 112 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 113 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 114 - "promotion-monitor.test.ts"
Cohesion: 0.27
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 115 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 116 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 117 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 118 - "session-retention.ts"
Cohesion: 0.23
Nodes (7): idleDaysSchema, mergeSessionRetention(), sessionRetentionPatchSchema, sessionRetentionSchema, SessionRetention, SessionRetentionPatch, SessionRetentionSettings()

### Community 119 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 120 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 121 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 123 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 124 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 125 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 126 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 127 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 128 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 129 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 131 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 132 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 133 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 134 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 135 - "refusal-metrics-routes.test.ts"
Cohesion: 0.33
Nodes (4): directories, runtimes, start(), trusted

### Community 136 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 137 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **869 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+864 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1351 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ManagerAgent` connect `ManagerAgent` to `.toolHost`, `manager-context.ts`, `app.ts`, `manager-tools.ts`, `manager-agent.ts`, `ManagerStore`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `contracts.ts`, `claude-agent-service.ts`, `ManagedSession`, `transcription-service.ts`, `UserInputReplyInput`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `TmuxTerminalSessionController` connect `TmuxTerminalSessionController` to `TerminalSessionController`, `terminal-session.test.ts`, `active-sessions.ts`, `.sendInternal`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _869 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.041407867494824016 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.035440613026819924 - nodes in this community are weakly interconnected._
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
