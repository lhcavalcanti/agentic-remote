# Agentic Remote - Graphify code map

Snapshot: `ee82a1c4577fc96f46b45c0891d8635484f2dad1541df330a711f22cd536e7d9`

Source checkout: `39a70eb4309093318a0d072243958172110ca446`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 202 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 202 files · ~416,189 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3234 nodes · 9017 edges · 143 communities (109 shown, 21 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 651 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App.tsx
- SessionDetail
- app.ts
- ClaudeAgentService
- App
- App.test.tsx
- contracts.ts
- SessionService
- sessionKey
- .get
- agentic-remote-promotion-monitor
- ComputerManager
- AgentService
- .publish
- RemoteNodeClient
- WorkspaceDialog
- agent-service.ts
- bundle
- pwa.ts
- ProviderSessionService
- tmux-errors.integration.test.ts
- background-task-adapter.ts
- lib.rs
- workspace-fixtures.ts
- config.rs
- session-resources.ts
- FakeSessionService
- TmuxTerminalSessionController
- devDependencies
- dependencies
- agentic-remote
- agentic-remote-promotion-setup
- terminal-session.ts
- .syncTranscripts
- .sendInternal
- hub-routes.ts
- scripts
- shell.ts
- terminal-startup-queue.test.ts
- recordValue
- compilerOptions
- active-sessions.ts
- SessionKnowledgeStore
- terminal-session.test.ts
- NodeIdentityStore
- capture-workspace.ts
- HubEvent
- compilerOptions
- SessionMcpServersSnapshot
- CopilotSessionLike
- PushNotificationService
- knowledge-tree.ts
- SessionNavigation.tsx
- compilerOptions
- compilerOptions
- claude-agent-service.ts
- event-log.ts
- workspace-browser.ts
- react
- session-directory.ts
- use-session-knowledge-root.ts
- recordValue
- session-admission-lifecycle.test.ts
- session-reply-durability.test.ts
- session-store-providers.test.ts
- ReaderWorkspace
- claude-recovery-admission.test.ts
- agent-service.test.ts
- background-task-stop.test.ts
- NewSessionDialog
- queued-provider-dispatch.test.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- tmux-errors.test.ts
- shortPath
- queued-dispatch.ts
- desktop.json
- queued-dispatch.test.ts
- submission-error.ts
- session-store.ts
- BackgroundTasksDialog.tsx
- capture-workbench-review.ts
- package.json
- settings-local.json
- registerSessionKnowledgeRoutes
- session-resource-clear.test.ts
- session-resource-providers.test.ts
- shell-notifications.ts
- CopilotClientLike
- background-task-tracker.ts
- promotion-monitor.test.ts
- session-knowledge-store.ts
- session-resource-transport.ts
- listSessionMcpServers
- scripts
- session-knowledge-routes.ts
- session-presentation.ts
- DeferredSession
- session-enqueue-clear.test.ts
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- session-clear-transcript.test.ts
- session-knowledge-store.test.ts
- KnowledgeRootChoices.tsx
- SessionAdmissions
- SessionResources.tsx
- UserInputFieldControl
- PromptCards.tsx
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- session-navigation-view.test.ts
- removeComputer
- .discoverTerminalSessions
- terminal-send-uncertainty.test.ts
- hasRunningBackgroundAgent
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- vite.config.ts
- @fastify/multipart
- @github/copilot-sdk
- lucide-react
- pdfjs-dist
- react-markdown
- ws
- zod
- sw.js
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 255 edges
2. `App()` - 224 edges
3. `AgentService` - 198 edges
4. `SessionStore` - 136 edges
5. `ClaudeAgentService` - 117 edges
6. `ComputerManager` - 78 edges
7. `SessionService` - 69 edges
8. `RemoteNodeClient` - 64 edges
9. `registerHubRoutes()` - 58 edges
10. `ProviderSessionService` - 53 edges

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

## Communities (143 total, 21 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.03
Nodes (97): ActivityStatus, accentIconUrl(), applyAccentIcon(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+89 more)

### Community 1 - "SessionDetail"
Cohesion: 0.06
Nodes (29): fixture(), connect(), createStore(), enqueue(), fixture(), fixture(), fixture(), fixture() (+21 more)

### Community 2 - "app.ts"
Cohesion: 0.04
Nodes (53): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), collect() (+45 more)

### Community 3 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (6): ClaudeAgentService, isMissingClaudeSessionError(), copilotRequest(), claudeFixture(), QueuedPromptReservation, RuntimeModelOption

### Community 4 - "App"
Cohesion: 0.04
Nodes (84): deleteKnowledgeRoot(), deleteSession(), listKnowledgeEntries(), moveSessionToTmux(), readKnowledgeFile(), replyPermission(), replyUserInput(), requestVoid() (+76 more)

### Community 5 - "App.test.tsx"
Cohesion: 0.04
Nodes (72): addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRuntime(), dispatchQueuedPrompt(), getPushSettings(), getRuntimeOptions() (+64 more)

### Community 6 - "contracts.ts"
Cohesion: 0.07
Nodes (60): managers, releases, remote, RegistryState, DirectoryScope, directories, StoredNodeIdentity, ProviderSessionServiceEvents (+52 more)

### Community 7 - "SessionService"
Cohesion: 0.04
Nodes (33): MAX_SESSION_FILE_BYTES, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+25 more)

### Community 8 - "sessionKey"
Cohesion: 0.06
Nodes (71): removeQueuedPrompt(), reorderQueuedPrompts(), setSessionNotificationsMuted(), activeComposerPastes(), appendComposerForKey(), applySession(), askAboutKnowledgeFile(), cancelQueuedPromptEdit() (+63 more)

### Community 9 - ".get"
Cohesion: 0.07
Nodes (4): isUncertainDelivery(), queueConflict(), TerminalSessionController, acceptedStartupRecovery()

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 11 - "ComputerManager"
Cohesion: 0.11
Nodes (11): ComputerManager, managedSession(), fixture(), session(), RemoteSessionListing, sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes() (+3 more)

### Community 12 - "AgentService"
Cohesion: 0.07
Nodes (6): AgentService, RuntimeConfigurationError, fixture(), httpBoundary(), copilotFixture(), SessionStatus

### Community 13 - ".publish"
Cohesion: 0.09
Nodes (4): agentMode(), isMissingSessionError(), removeCopilotSessionFiles(), preparePrompt()

### Community 14 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (10): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, client(), servers, session, NodeInfo (+2 more)

### Community 15 - "WorkspaceDialog"
Cohesion: 0.08
Nodes (40): executeCommand(), listWorkspace(), searchWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+32 more)

### Community 16 - "agent-service.ts"
Cohesion: 0.05
Nodes (44): AcceptedSdkReply, ActivePrompt, activityResult(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+36 more)

### Community 17 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 18 - "pwa.ts"
Cohesion: 0.09
Nodes (38): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification() (+30 more)

### Community 20 - "tmux-errors.integration.test.ts"
Cohesion: 0.07
Nodes (23): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, disk (+15 more)

### Community 21 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (39): attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), CopilotTaskInfo, CopilotTaskProgress, eventString() (+31 more)

### Community 22 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 23 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (31): pageFor(), accents, Measurement, originalDocument, output, report, save(), scratch (+23 more)

### Community 24 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 25 - "session-resources.ts"
Cohesion: 0.15
Nodes (32): claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills, count(), enrichClaudeSkills() (+24 more)

### Community 27 - "TmuxTerminalSessionController"
Cohesion: 0.15
Nodes (9): copilotCommand(), execFileAsync, processAncestors(), processCommand(), submitTerminalForm(), tmuxTargetForPid(), TmuxTerminalSessionController, PendingPermission (+1 more)

### Community 28 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 29 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 30 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 31 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 32 - "terminal-session.ts"
Cohesion: 0.13
Nodes (29): COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasComposerAfter(), hasLiveTerminalComposer(), isTerminalChrome() (+21 more)

### Community 33 - ".syncTranscripts"
Cohesion: 0.11
Nodes (5): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), cloneSession(), TranscriptObservation

### Community 34 - ".sendInternal"
Cohesion: 0.19
Nodes (24): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), hasTerminalCommandPermissionQuestion() (+16 more)

### Community 35 - "hub-routes.ts"
Cohesion: 0.08
Nodes (26): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+18 more)

### Community 36 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 37 - "shell.ts"
Cohesion: 0.15
Nodes (24): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+16 more)

### Community 38 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (20): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec, deliveryFixture() (+12 more)

### Community 39 - "recordValue"
Cohesion: 0.17
Nodes (23): activityDuration(), activityGroupIdFor(), activityKind(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isActivityGroupKind() (+15 more)

### Community 40 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 41 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 42 - "SessionKnowledgeStore"
Cohesion: 0.19
Nodes (4): bindingKey(), SessionKnowledgeRecoveryError, SessionKnowledgeStore, SessionKnowledgeBinding

### Community 43 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (19): listTmuxSessions(), parseTerminalUpdateNotice(), safeWindowName(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), desktopInstallPane (+11 more)

### Community 44 - "NodeIdentityStore"
Cohesion: 0.14
Nodes (7): ComputerRegistry, directories, remoteSnapshotFixture(), routingFixture(), session(), temporaryDirectory(), NodeIdentityStore

### Community 45 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 46 - "HubEvent"
Cohesion: 0.12
Nodes (12): WorkspaceFixture, ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, sessionMuteSchema (+4 more)

### Community 47 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 48 - "SessionMcpServersSnapshot"
Cohesion: 0.17
Nodes (9): ClaudeResources, isResourceMethodUnavailable(), safeResourceError(), sanitizeMcpSnapshot(), unavailableMcp(), unavailableSkills(), SessionMcpServersSnapshot, SessionResourceSnapshot (+1 more)

### Community 49 - "CopilotSessionLike"
Cohesion: 0.16
Nodes (9): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), QueuedDelivery, accept(), unknownClaim(), queuedSdkPrompt(), disposals (+1 more)

### Community 51 - "knowledge-tree.ts"
Cohesion: 0.18
Nodes (17): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+9 more)

### Community 52 - "SessionNavigation.tsx"
Cohesion: 0.15
Nodes (15): SessionFilter, sessionNavigationView, SessionSort, sessionSortFrom(), SessionActions, SessionNavigation(), actions, backgroundTasks (+7 more)

### Community 53 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 54 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 55 - "claude-agent-service.ts"
Cohesion: 0.11
Nodes (15): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+7 more)

### Community 56 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 57 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 58 - "react"
Cohesion: 0.12
Nodes (16): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+8 more)

### Community 59 - "session-directory.ts"
Cohesion: 0.21
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 60 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 61 - "recordValue"
Cohesion: 0.20
Nodes (17): addActivity(), boundedText(), errorValue(), notificationKind(), parsedValue(), recordValue(), shellExitFromValue(), shellIdFromFooter() (+9 more)

### Community 62 - "session-admission-lifecycle.test.ts"
Cohesion: 0.13
Nodes (11): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), deferred(), disk, enqueue() (+3 more)

### Community 63 - "session-reply-durability.test.ts"
Cohesion: 0.18
Nodes (13): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotRunFixture(), disk (+5 more)

### Community 64 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (6): claude(), disk, event(), fixtures, releases, sdkSession()

### Community 65 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 66 - "claude-recovery-admission.test.ts"
Cohesion: 0.14
Nodes (11): deferred(), disk, fixtures, holdClaimWrite(), releases, disk, fixtures, prompt() (+3 more)

### Community 67 - "agent-service.test.ts"
Cohesion: 0.15
Nodes (7): terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), UserInputForm

### Community 68 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 69 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): provider(), activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+8 more)

### Community 70 - "queued-provider-dispatch.test.ts"
Cohesion: 0.16
Nodes (9): claudeFixture(), copilotFixture(), copilotSession(), fixtures, gate(), originalQueue, pause(), releases (+1 more)

### Community 71 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 72 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 73 - "tmux-errors.test.ts"
Cohesion: 0.17
Nodes (12): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+4 more)

### Community 74 - "shortPath"
Cohesion: 0.21
Nodes (12): KnowledgeRootSelector(), root, executionModeName(), matchesSessionSearch(), providerName(), sessionActivityTime(), sessionPresentation, shortPath() (+4 more)

### Community 75 - "queued-dispatch.ts"
Cohesion: 0.24
Nodes (9): errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDispatches, QueuedDispatchTarget, terminalRefused() (+1 more)

### Community 76 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 77 - "queued-dispatch.test.ts"
Cohesion: 0.15
Nodes (7): deferred(), disk, fixtures, holdWrite(), prompt(), releases, target

### Community 78 - "submission-error.ts"
Cohesion: 0.25
Nodes (9): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, SubmissionReceipt, submissionReceiptFromError() (+1 more)

### Community 79 - "session-store.ts"
Cohesion: 0.14
Nodes (12): activityDuration(), activityResultPreview(), emptyRetirements, PendingChange, PendingMutation, RecoveryResend, SdkQueueAdmission, SessionProjection (+4 more)

### Community 80 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 81 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 82 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 83 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 84 - "registerSessionKnowledgeRoutes"
Cohesion: 0.33
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 85 - "session-resource-clear.test.ts"
Cohesion: 0.21
Nodes (12): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+4 more)

### Community 86 - "session-resource-providers.test.ts"
Cohesion: 0.19
Nodes (12): ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures, Mcp (+4 more)

### Community 87 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 88 - "CopilotClientLike"
Cohesion: 0.17
Nodes (5): CopilotClientLike, holdProbe(), fixtures, gate(), releases

### Community 89 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 90 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 91 - "session-knowledge-store.ts"
Cohesion: 0.17
Nodes (10): bindingSchema, Identity, recoverySchema, RootCatalog, rootSchema, SessionKnowledgeEvents, SessionKnowledgePersistenceError, State (+2 more)

### Community 92 - "session-resource-transport.ts"
Cohesion: 0.24
Nodes (9): CopilotResourceClient, CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write() (+1 more)

### Community 93 - "listSessionMcpServers"
Cohesion: 0.32
Nodes (12): isMcpSummary(), isRecord(), isSkillSummary(), listSessionMcpServers(), listSessionSkills(), optionalBoolean(), optionalCount(), optionalText() (+4 more)

### Community 94 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 95 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 96 - "session-presentation.ts"
Cohesion: 0.24
Nodes (10): attentionRank, computerTone(), recentFirst(), sessionDay, SessionState, sessionTime, sortSessionView(), stateLabels (+2 more)

### Community 98 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 99 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 100 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 101 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 102 - "session-clear-transcript.test.ts"
Cohesion: 0.25
Nodes (5): disk, fixtures, gate(), holdTurnWrite(), releases

### Community 103 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 104 - "KnowledgeRootChoices.tsx"
Cohesion: 0.25
Nodes (7): KnowledgeRootChoice, KnowledgeRootChoices(), KnowledgeRootSession, actions, computers, root, session

### Community 106 - "SessionResources.tsx"
Cohesion: 0.25
Nodes (5): SessionResourceSource, Catalog, CatalogResult, sourceLabels, statusLabels

### Community 107 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 108 - "PromptCards.tsx"
Cohesion: 0.38
Nodes (6): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), UserInputCard(), userInputFieldHasValue()

### Community 109 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 110 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 111 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 112 - "session-navigation-view.test.ts"
Cohesion: 0.33
Nodes (5): computers, first, grouped, hidden, last

### Community 113 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **611 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+606 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 921 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `.syncTranscripts`, `contracts.ts`, `recordValue`, `.get`, `queued-dispatch.ts`, `.publish`, `SessionMcpServersSnapshot`, `.discoverTerminalSessions`, `session-directory.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `SessionMcpServersSnapshot`, `ComputerManager`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `.syncTranscripts`, `ClaudeAgentService`, `.get`, `AgentService`, `.publish`, `SessionMcpServersSnapshot`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _611 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.027030812324929973 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.05504950495049505 - nodes in this community are weakly interconnected._
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
- `docs/mockups/activity-view.html`
- `docs/mockups/brand-logo.html`
- `docs/native-shell.md`
- `docs/provider-compatibility.md`
- `docs/sdk-architecture-roadmap.md`
- `docs/slash-command-feedback.md`
- `index.html`
- `public/apple-touch-icon-precomposed.png`
- `public/apple-touch-icon.png`
- `public/fonts/MonaSans.woff2`
- `public/fonts/OFL.txt`
- `public/icon.svg`
- `public/icons/apple-touch-icon.png`
- `public/icons/icon-192.png`
- `public/icons/icon-512-maskable.png`
- `public/icons/icon-512.png`
- `public/manifest.webmanifest`
- `shell/README.md`
- `shell/index.html`
- `shell/src/settings.css`
- `src/index.css`
