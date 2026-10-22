# Agentic Remote - Graphify code map

Snapshot: `9d6c03936e1e43117922bd452acc95375e41dd1b8615b54edd6b69e9b1fb1109`

Source checkout: `d2cbe16b0be4c2cae95892fb4ef772f07353a4a0`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 321 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 321 files · ~645,323 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4900 nodes · 13780 edges · 182 communities (148 shown, 18 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 894 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- api.ts
- App.tsx
- AgentService
- ClaudeAgentService
- SessionDetail
- contracts.ts
- ManagerAssistant.tsx
- agentic-remote-promotion-monitor
- session-store.ts
- sessionKey
- markdown-navigation.ts
- terminal-session.ts
- claude-agent-service.ts
- .sendAdmittedWithBackend
- ManagerAgent
- TmuxTerminalSessionController
- manager-structured-memory-validation.ts
- SessionService
- manager-tools.ts
- tmux-test-helpers.ts
- computer-manager.ts
- agent-service.ts
- workspace-fixtures.ts
- .sendInternal
- registerHubRoutes
- bundle
- ProviderSessionService
- UserInputReplyInput
- app.ts
- delegated-transcription-service.ts
- pwa.ts
- shell.ts
- lib.rs
- manager-context.ts
- agentic-remote-promotion-setup
- background-task-adapter.ts
- hub-routes.ts
- ManagerStore
- FakeSessionService
- knowledge-tree.ts
- agentic-remote-gate
- config.rs
- KnowledgeStore
- active-sessions.ts
- dependencies
- devDependencies
- CopilotClientLike
- manager-agent.ts
- terminal-session.test.ts
- agentic-remote
- PushNotificationService
- shared/settings-profile.ts
- ManagerStructuredMemoryStore
- manager-structured-memory.ts
- manager-agent.test.ts
- capture-workspace.ts
- HubEvent
- SessionOrderStore
- session-patch-browser.ts
- queued-provider-dispatch.test.ts
- terminal-startup-queue.test.ts
- push-notification-service.ts
- ComputerSummary
- tmux-errors.integration.test.ts
- ManagedSession
- SettingsProfileClient
- session-resource-providers.test.ts
- cli-canary.ts
- send-matrix.integration.test.ts
- src/settings-profile.ts
- scripts
- recovery-resend-durability.test.ts
- manager-structured-memory-search.ts
- recordValue
- SessionKnowledgeStore
- compilerOptions
- TerminalSessionController
- agent-service.test.ts
- manager-routes.ts
- transcription-service.ts
- node-routes.ts
- session-reply-durability.test.ts
- session-store-providers.test.ts
- settings-profile-store.ts
- session-clear-transcript.test.ts
- session-resource-clear.test.ts
- use-oracle-settings.ts
- full-gate.test.ts
- startup-phases.test.ts
- compilerOptions
- refusal-metrics.ts
- SessionKnowledgeBinding
- compilerOptions
- compilerOptions
- directory-browser.ts
- session-resource-routes.test.ts
- ManagerMemory
- session-knowledge-store.ts
- NewSessionDialog
- session-latency-benchmark.ts
- server/side-question.ts
- .startAdmitted
- submission-error.ts
- workspace-browser.ts
- ReaderWorkspace
- background-task-stop.test.ts
- promotion-monitor.test.ts
- server/session-patches.ts
- terminal-form-deadline.test.ts
- scripts
- desktop.json
- registerSessionKnowledgeRoutes
- SettingsProfileStore
- normalizeKnowledgeRelativePath
- theme-contrast.test.ts
- pending-echo.ts
- .oxlintrc.json
- settings-local.json
- session-knowledge-routes.test.ts
- background-task-tracker.ts
- .initialize
- recovery-seed-guards.test.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- eventString
- recordValue
- copilot-sdk-client.ts
- session-knowledge-routes.ts
- generate-pwa-icons.ts
- session-enqueue-clear.test.ts
- bridge.rs
- KnowledgePosition
- promotion-setup-execution.test.ts
- remote-node-client.test.ts
- session-knowledge-store.test.ts
- package.json
- SessionFileUpload
- ClientPresence
- release-publication.test.ts
- session-admission-lifecycle.test.ts
- session-patch-routes.test.ts
- UserInputFieldControl
- render-workspace-gifs.ts
- history-projection.test.ts
- settings-profile-routes.ts
- settings.ts
- composer-layout.test.ts
- manager-structured-memory-performance.test.ts
- MarkdownCodeBlock.tsx
- vite.config.ts
- push-routes.ts
- hasActiveBackgroundTasks
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
1. `SessionDetail` - 299 edges
2. `App()` - 273 edges
3. `AgentService` - 264 edges
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

## Communities (182 total, 18 thin omitted)

### Community 0 - "App"
Cohesion: 0.03
Nodes (142): message(), sendLikeTheApp(), isManagerEvent(), terminalSendOptions(), askSession(), recoverConversation(), restartSession(), resumeSession() (+134 more)

### Community 1 - "api.ts"
Cohesion: 0.03
Nodes (119): AddKnowledgeRootInput, PushSettings, ResolveManagerConfirmationInput, SendManagerMessageInput, addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelManager() (+111 more)

### Community 2 - "App.tsx"
Cohesion: 0.02
Nodes (112): ActivityStatus, addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage() (+104 more)

### Community 3 - "AgentService"
Cohesion: 0.05
Nodes (10): agentMode(), AgentService, foregroundTurnOpen(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isUncertainDelivery(), RuntimeConfigurationError, statusFromEvents() (+2 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (4): ClaudeAgentService, isMissingClaudeSessionError(), queueConflict(), assertSessionNotRetained()

### Community 5 - "SessionDetail"
Cohesion: 0.06
Nodes (13): probeService(), startupFifoFixture(), terminalService(), fixture(), observe(), canArchiveSession(), clearRecoverySeedFailure(), grantTerminalRecovery() (+5 more)

### Community 6 - "contracts.ts"
Cohesion: 0.04
Nodes (53): ClaudeAgentServiceEvents, DirectoryScope, directories, StoredNodeIdentity, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, ProviderSessionServiceEvents, DEFINITE_DISPATCH_REFUSALS (+45 more)

### Community 7 - "ManagerAssistant.tsx"
Cohesion: 0.05
Nodes (53): react, SessionRetention, SessionRetentionPatch, ManagerSessionRef, ManagerSnapshot, ManagerStatus, editQueuedManagerMessage(), removeQueuedManagerMessage() (+45 more)

### Community 8 - "agentic-remote-promotion-monitor"
Cohesion: 0.05
Nodes (77): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), base_url(), CANARY (+69 more)

### Community 9 - "session-store.ts"
Cohesion: 0.04
Nodes (60): fixture(), holdProbe(), fixtures, gate(), releases, fixture(), connect(), createStore() (+52 more)

### Community 10 - "sessionKey"
Cohesion: 0.06
Nodes (60): saveSessionOrderLane(), handleDragEnd(), readSelectionFromLocation(), RenameSessionDialog(), SessionResourcesDialog(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers() (+52 more)

### Community 11 - "markdown-navigation.ts"
Cohesion: 0.05
Nodes (57): PendingUserInput, UserInputField, UserInputFieldValue, executeCommand(), listWorkspace(), searchWorkspace(), ChangeDirectoryDialog(), browseDirectory() (+49 more)

### Community 12 - "terminal-session.ts"
Cohesion: 0.05
Nodes (60): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame() (+52 more)

### Community 13 - "claude-agent-service.ts"
Cohesion: 0.09
Nodes (47): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+39 more)

### Community 14 - ".sendAdmittedWithBackend"
Cohesion: 0.07
Nodes (21): terminalAnswerRefused(), acceptanceReceipt(), explicitlyRefused(), hasUncertainDelivery(), preparePrompt(), QueuedDelivery, terminalRefused(), accept() (+13 more)

### Community 15 - "ManagerAgent"
Cohesion: 0.10
Nodes (12): checkContent(), delay(), discover(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError (+4 more)

### Community 16 - "TmuxTerminalSessionController"
Cohesion: 0.08
Nodes (17): copilotCommand(), endProbeSession(), execFileAsync, formReplyExpired(), listTmuxSessions(), processAncestors(), processCommand(), safeWindowName() (+9 more)

### Community 17 - "manager-structured-memory-validation.ts"
Cohesion: 0.06
Nodes (53): appliedRequestSchema, auditSchema, boundedSearchQuery(), canonicalKeySchema, contentSchema, correctSchema, digestSchema, forgetSchema (+45 more)

### Community 18 - "SessionService"
Cohesion: 0.07
Nodes (11): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, readServiceResources(), readSessionMcpServers(), readSessionSkills() (+3 more)

### Community 19 - "manager-tools.ts"
Cohesion: 0.07
Nodes (29): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), structuredTools() (+21 more)

### Community 20 - "tmux-test-helpers.ts"
Cohesion: 0.08
Nodes (45): directories, execFileAsync, processExists(), procStatReads, tmuxSessions, waitForProcessExit(), startAgentAfterClear(), exec (+37 more)

### Community 21 - "computer-manager.ts"
Cohesion: 0.05
Nodes (15): RemoteResync, RemoteSessionListing, RemoteSessionRead, headerSafe(), RemoteNodeClient, ResourceRead, sameResourceOwner(), AudioTranscription (+7 more)

### Community 22 - "agent-service.ts"
Cohesion: 0.04
Nodes (49): AcceptedSdkReply, ActivePrompt, activityDuration(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+41 more)

### Community 23 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (40): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, accents (+32 more)

### Community 24 - ".sendInternal"
Cohesion: 0.12
Nodes (40): activeBottomFrame(), captureBeforeDeadline(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), composerHoldsText(), composerText() (+32 more)

### Community 25 - "registerHubRoutes"
Cohesion: 0.17
Nodes (4): ComputerManager, managedSession(), registerHubRoutes(), ManagedRemovedQueuedPrompt

### Community 26 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 28 - "UserInputReplyInput"
Cohesion: 0.10
Nodes (5): persistedFormAnswer(), TerminalFormContinuation, fixture(), TerminalFormReplyError, UserInputReplyInput

### Community 29 - "app.ts"
Cohesion: 0.08
Nodes (30): prefixes, session, trusted, untrusted, directories, buildApp(), BuildAppOptions, errorStatusCode() (+22 more)

### Community 30 - "delegated-transcription-service.ts"
Cohesion: 0.09
Nodes (16): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+8 more)

### Community 31 - "pwa.ts"
Cohesion: 0.10
Nodes (36): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle() (+28 more)

### Community 32 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 33 - "lib.rs"
Cohesion: 0.14
Nodes (33): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+25 more)

### Community 34 - "manager-context.ts"
Cohesion: 0.10
Nodes (31): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_STRUCTURED_MEMORY_SYSTEM_PROMPT, MANAGER_SYSTEM_PROMPT, managerPrompt() (+23 more)

### Community 35 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 36 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (35): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotClientTaskInfo, CopilotClientTaskProgress, eventTask(), executionModeValue() (+27 more)

### Community 37 - "hub-routes.ts"
Cohesion: 0.06
Nodes (37): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+29 more)

### Community 38 - "ManagerStore"
Cohesion: 0.10
Nodes (6): openStore(), JournalRecorder, sessionTask(), emptyState(), ManagerStore, open()

### Community 39 - "FakeSessionService"
Cohesion: 0.08
Nodes (5): FakeSessionService, routingFixture(), session(), temporaryDirectory(), AgentMode

### Community 40 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (35): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+27 more)

### Community 41 - "agentic-remote-gate"
Cohesion: 0.12
Nodes (36): agentic-remote-gate script, assert_tree(), CLONE_BASE, conclude(), CONTEXT, die(), elapsed(), fail() (+28 more)

### Community 42 - "config.rs"
Cohesion: 0.11
Nodes (13): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+5 more)

### Community 43 - "KnowledgeStore"
Cohesion: 0.10
Nodes (13): WorkspaceFixtureState, SessionMuteCarrier, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), directories (+5 more)

### Community 44 - "active-sessions.ts"
Cohesion: 0.11
Nodes (32): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+24 more)

### Community 45 - "dependencies"
Cohesion: 0.06
Nodes (35): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+27 more)

### Community 46 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 47 - "CopilotClientLike"
Cohesion: 0.07
Nodes (16): CopilotClientLike, CopilotSessionLike, directories, fakeClient(), ForkRequest, forkSession(), services, FakeCopilotClient (+8 more)

### Community 48 - "manager-agent.ts"
Cohesion: 0.10
Nodes (22): ManagerEventSource, isPending(), isQueued(), ManagerAgentOptions, Rung, TURN_ACTIVITY, ManagerState, hasExplicitStructuredMemoryIntent() (+14 more)

### Community 49 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (28): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse(), pastedPlaceholderCount() (+20 more)

### Community 50 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 51 - "PushNotificationService"
Cohesion: 0.14
Nodes (5): HubEventSource, OracleEventSource, PushNotificationService, scoped(), registerPushRoutes()

### Community 52 - "shared/settings-profile.ts"
Cohesion: 0.09
Nodes (32): AccentSetting, appearanceSettings, applySettingsChanges(), isRecord(), isSettingsRevision(), NewSessionFoldersSetting, NewSessionRuntime, NewSessionRuntimesSetting (+24 more)

### Community 53 - "ManagerStructuredMemoryStore"
Cohesion: 0.15
Nodes (10): capturePrompt(), initializeManagerStructuredMemory(), ManagerStructuredMemoryRuntime, digest(), ManagerStructuredMemoryReferenceError, ManagerStructuredMemoryStore, ManagerStructuredMemoryMutationResult, ManagerStructuredMemorySearchResult (+2 more)

### Community 54 - "manager-structured-memory.ts"
Cohesion: 0.08
Nodes (27): ManagerStructuredMemoryCapacityError, ManagerStructuredMemoryStoreOptions, openWithPolicyGlobal(), openWithPolicyRecord(), MANAGER_STRUCTURED_MEMORY_MAX_APPLIED_REQUESTS, MANAGER_STRUCTURED_MEMORY_MAX_AUDIT_ENTRIES, MANAGER_STRUCTURED_MEMORY_MAX_CONTENT_CHARS, MANAGER_STRUCTURED_MEMORY_MAX_KEY_CHARS (+19 more)

### Community 55 - "manager-agent.test.ts"
Cohesion: 0.08
Nodes (13): ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession, ManagerSdkSessionConfig, Behavior, computers, fail(), FakeClient (+5 more)

### Community 56 - "capture-workspace.ts"
Cohesion: 0.12
Nodes (26): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+18 more)

### Community 57 - "HubEvent"
Cohesion: 0.11
Nodes (16): WorkspaceFixture, ComputerManagerEvents, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, Client, Browser (+8 more)

### Community 58 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 59 - "session-patch-browser.ts"
Cohesion: 0.13
Nodes (27): advance(), Connection, connections, content(), FrameMeasurement, instrument(), lastHeading(), message() (+19 more)

### Community 60 - "queued-provider-dispatch.test.ts"
Cohesion: 0.09
Nodes (15): errorMessage(), ownsDispatchRecovery(), preflight(), QueuedDispatches, claudeFixture(), copilotFixture(), copilotSession(), fixtures (+7 more)

### Community 61 - "terminal-startup-queue.test.ts"
Cohesion: 0.14
Nodes (25): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+17 more)

### Community 62 - "push-notification-service.ts"
Cohesion: 0.13
Nodes (20): brief(), PushPolicy, PushSender, PushState, directories, RFC-8030, RFC-8030, alertNotification() (+12 more)

### Community 63 - "ComputerSummary"
Cohesion: 0.12
Nodes (11): mapWithConcurrency(), fixture(), managers, releases, remote, session(), sessionAtLeastAsNew(), RegisteredComputer (+3 more)

### Community 64 - "tmux-errors.integration.test.ts"
Cohesion: 0.12
Nodes (12): ComputerRegistry, RegistryState, directories, remoteSnapshotFixture(), NodeIdentityStore, execFileAsync, headers, ignoreMissing() (+4 more)

### Community 65 - "ManagedSession"
Cohesion: 0.13
Nodes (7): ManagerHub, CreateSessionInput, ManagedSession, actions, computers, root, session

### Community 66 - "SettingsProfileClient"
Cohesion: 0.18
Nodes (5): SettingsProfileSnapshot, errorText(), isRefusal(), SettingsProfileClient, SettingsProfileTransport

### Community 67 - "session-resource-providers.test.ts"
Cohesion: 0.10
Nodes (21): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), claudeFixture() (+13 more)

### Community 68 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 69 - "send-matrix.integration.test.ts"
Cohesion: 0.08
Nodes (23): BUSY, busyWithoutComposer, CLEAR_REFUSED, client(), dialogs, Draft, drained, exec (+15 more)

### Community 70 - "src/settings-profile.ts"
Cohesion: 0.11
Nodes (21): AppearanceSetting, SETTINGS_MAX_COMPUTERS, SettingsChange, SettingsProfileKey, SettingsProfileValues, SettingsUpdateResult, Appearance, appearanceFrom() (+13 more)

### Community 71 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 72 - "recovery-resend-durability.test.ts"
Cohesion: 0.09
Nodes (19): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+11 more)

### Community 73 - "manager-structured-memory-search.ts"
Cohesion: 0.14
Nodes (22): authorityRank, compareRanked(), createStructuredMemorySearchIndex(), escapedJson(), formatStructuredMemoryContext(), IndexedRecord, indexRecord(), ManagerStructuredMemoryFormattedContext (+14 more)

### Community 74 - "recordValue"
Cohesion: 0.18
Nodes (22): activityGroupIdFor(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent() (+14 more)

### Community 75 - "SessionKnowledgeStore"
Cohesion: 0.17
Nodes (5): bindingKey(), SessionKnowledgeRecoveryError, SessionKnowledgeStore, stateWithPaths(), UpdateSessionKnowledgeRootInput

### Community 76 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 78 - "agent-service.test.ts"
Cohesion: 0.10
Nodes (11): terminalFormSteps(), cliDiscovery, configurableModel(), DeferredSession, directories, services, CopilotTaskInfo, CopilotTaskProgress (+3 more)

### Community 79 - "manager-routes.ts"
Cohesion: 0.12
Nodes (14): confirmationSchema, defaultsSchema, editSchema, effort, managerInputError(), ManagerRouteAgent, messageParams, registerManagerRoutes() (+6 more)

### Community 80 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 81 - "node-routes.ts"
Cohesion: 0.09
Nodes (22): configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, knowledgeFileQuerySchema, knowledgeQuerySchema (+14 more)

### Community 82 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (19): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+11 more)

### Community 83 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+3 more)

### Community 84 - "settings-profile-store.ts"
Cohesion: 0.15
Nodes (11): SettingsProfileState, applySettingsImport(), isSettingsProfileKey(), SettingsProfileRecord, validateSettingsImport(), seedHubSettings(), resolveAppearance(), settingsProfileCacheKey (+3 more)

### Community 85 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 86 - "session-resource-clear.test.ts"
Cohesion: 0.13
Nodes (19): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+11 more)

### Community 87 - "use-oracle-settings.ts"
Cohesion: 0.16
Nodes (13): RuntimeModelOption, getManager(), updateManagerSettings(), effortFrom(), efforts, OracleModelSettings(), OracleSettingsStatus(), HarnessProps (+5 more)

### Community 88 - "full-gate.test.ts"
Cohesion: 0.12
Nodes (11): Fixture, fixtures, gate(), git(), gitEnv, operatorEnv, Result, run (+3 more)

### Community 89 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (12): phases, port, createStartupPhases(), startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address, directories (+4 more)

### Community 90 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 91 - "refusal-metrics.ts"
Cohesion: 0.15
Nodes (16): countsAsRefusal(), DEFAULT_MAX_REFUSAL_KEYS, httpRefusalReason(), keyId(), notedReasons, noteRefusalReason(), overflowId, reasonCodeFromChain() (+8 more)

### Community 92 - "SessionKnowledgeBinding"
Cohesion: 0.18
Nodes (14): SessionKnowledgeEvents, SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey() (+6 more)

### Community 93 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 94 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 95 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 96 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 97 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 98 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (17): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+9 more)

### Community 99 - "NewSessionDialog"
Cohesion: 0.17
Nodes (18): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+10 more)

### Community 100 - "session-latency-benchmark.ts"
Cohesion: 0.24
Nodes (16): count, historyEvents(), message(), normal(), now(), Pending, percentile(), projection() (+8 more)

### Community 101 - "server/side-question.ts"
Cohesion: 0.22
Nodes (10): SIDE_QUESTION_CLEANUP_MS, SIDE_QUESTION_RUNTIME_IDLE_MS, SIDE_QUESTION_TIMEOUT_MS, sideQuestionBoundary(), SideQuestionError, sideQuestionPrompt(), withSideQuestionTimeout(), SIDE_QUESTION_EARLIER_ANSWER_MAX_LENGTH (+2 more)

### Community 102 - ".startAdmitted"
Cohesion: 0.20
Nodes (3): restart(), httpBoundary(), StartupPhases

### Community 103 - "submission-error.ts"
Cohesion: 0.21
Nodes (10): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, SubmissionReceipt, submissionReceiptFromError() (+2 more)

### Community 104 - "workspace-browser.ts"
Cohesion: 0.26
Nodes (13): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+5 more)

### Community 105 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 106 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 107 - "promotion-monitor.test.ts"
Cohesion: 0.28
Nodes (14): addDownstream(), advanceMain(), calls(), canaryRuns(), Fixture, fixtures, git(), healthyReleaseFixture() (+6 more)

### Community 108 - "server/session-patches.ts"
Cohesion: 0.22
Nodes (7): diffMessages(), Publication, sameMessage(), sessionKey(), SessionPublications, SessionUpserted, SessionMessagesPatch

### Community 109 - "terminal-form-deadline.test.ts"
Cohesion: 0.16
Nodes (11): question(), actions, clippedPane(), closedPane, commitKeys, committed, fixture(), openPane() (+3 more)

### Community 110 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+7 more)

### Community 111 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 112 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 113 - "SettingsProfileStore"
Cohesion: 0.23
Nodes (5): profileStore(), SettingsProfileStore, directories, store(), isSettingsDeviceId()

### Community 114 - "normalizeKnowledgeRelativePath"
Cohesion: 0.35
Nodes (11): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+3 more)

### Community 115 - "theme-contrast.test.ts"
Cohesion: 0.19
Nodes (12): accentSettings, accentTokens(), block(), contrast(), graphite, hex(), light, lightForeground (+4 more)

### Community 116 - "pending-echo.ts"
Cohesion: 0.26
Nodes (10): createPendingEcho(), nextPendingEchoDeadline(), normalize(), pairEchoes(), PENDING_ECHO_SETTLED_MS, PendingEcho, prunePendingEchoMap(), retainPendingEchoes() (+2 more)

### Community 117 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 118 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 119 - "session-knowledge-routes.test.ts"
Cohesion: 0.18
Nodes (9): ServerRole, SessionMetadataLookup, disk, FakeManager, fixtures, gate(), holdWrite(), releases (+1 more)

### Community 120 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 121 - ".initialize"
Cohesion: 0.24
Nodes (4): isMissing(), ManagerStructuredMemoryPersistenceError, ManagerStructuredMemoryRecoveryError, open()

### Community 122 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 123 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 124 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 125 - "eventString"
Cohesion: 0.24
Nodes (11): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), rawTailText(), shellStopAcknowledged() (+3 more)

### Community 126 - "recordValue"
Cohesion: 0.27
Nodes (11): errorValue(), notificationKind(), parsedValue(), recordValue(), shellIdFromFooter(), shellIdFromValue(), shellTaskOutput(), stringValue() (+3 more)

### Community 127 - "copilot-sdk-client.ts"
Cohesion: 0.31
Nodes (8): COPILOT_SDK_SESSION_DISCOVERY, copilotSdkClientOptions(), CopilotSdkMissingSessionRetirement, CopilotSdkRuntimeDiagnostic, CopilotSdkRuntimeDiagnosticClient, createCopilotSdkClient(), readCopilotSdkRuntimeDiagnostic(), retireMissingCopilotSdkSession()

### Community 128 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 129 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 130 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 131 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 132 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 133 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 134 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 135 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 136 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 139 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 140 - "session-admission-lifecycle.test.ts"
Cohesion: 0.29
Nodes (6): deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases

### Community 141 - "session-patch-routes.test.ts"
Cohesion: 0.29
Nodes (5): apps, directories, FakeManager, fixture(), trusted

### Community 142 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 143 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 144 - "history-projection.test.ts"
Cohesion: 0.33
Nodes (5): eventsFor(), ModelMessage, random(), seedOffset, terminalTypes

### Community 145 - "settings-profile-routes.ts"
Cohesion: 0.33
Nodes (6): deviceId, importSchema, parse(), registerSettingsProfileRoutes(), updateSchema, SETTINGS_DEVICE_ID_MAX_LENGTH

### Community 146 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 147 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 148 - "manager-structured-memory-performance.test.ts"
Cohesion: 0.53
Nodes (4): benchmarkState(), now(), openFixture(), searchSamples()

### Community 149 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 150 - "vite.config.ts"
Cohesion: 0.33
Nodes (4): canaryTests, packageVersion, slowTests, tmuxTests

### Community 151 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

## Knowledge Gaps
- **907 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+902 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1396 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `ClaudeAgentService`, `SessionDetail`, `ClientPresence`, `.sendAdmittedWithBackend`, `ManagerAgent`, `SessionService`, `registerHubRoutes`, `ProviderSessionService`, `delegated-transcription-service.ts`, `ManagerStore`, `KnowledgeStore`, `PushNotificationService`, `ManagerStructuredMemoryStore`, `SessionOrderStore`, `tmux-errors.integration.test.ts`, `cli-canary.ts`, `SessionKnowledgeStore`, `manager-routes.ts`, `transcription-service.ts`, `refusal-metrics.ts`, `submission-error.ts`, `SettingsProfileStore`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `computer-manager.ts` to `ManagedSession`, `contracts.ts`, `SessionFileUpload`, `claude-agent-service.ts`, `UserInputReplyInput`, `ComputerSummary`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `session-resource-routes.test.ts`, `ClaudeAgentService`, `server/side-question.ts`, `SessionDetail`, `.startAdmitted`, `background-task-adapter.ts`, `SessionFileUpload`, `recordValue`, `TerminalSessionController`, `.sendAdmittedWithBackend`, `queued-provider-dispatch.test.ts`, `claude-agent-service.ts`, `UserInputReplyInput`, `directory-browser.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `App()` (e.g. with `createSettingsProfileClient()` and `prefersLightNow()`) actually correct?**
  _`App()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _907 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03128267689090276 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.027969348659003832 - nodes in this community are weakly interconnected._
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
