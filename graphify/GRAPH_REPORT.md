# Agentic Remote - Graphify code map

Snapshot: `489ee316f21bdfa59c02f066653881164dbbf7b9b8b3407d13279d4656f8ac41`

Source checkout: `0804c890c70b297236ff9bd5063ee2344a427264`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 202 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 202 files · ~415,902 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3234 nodes · 9016 edges · 127 communities (92 shown, 22 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 651 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- app.ts
- ClaudeAgentService
- App.tsx
- App.test.tsx
- SessionDetail
- session-store.ts
- ComputerManager
- queueConflict
- sessionKey
- agentic-remote-promotion-monitor
- remote-node-client.ts
- agent-service.ts
- SessionService
- contracts.ts
- WorkspaceDialog
- bundle
- RemoteNodeClient
- TerminalSessionController
- pwa.ts
- ProviderSessionService
- background-task-adapter.ts
- lib.rs
- shell.ts
- workspace-fixtures.ts
- config.rs
- FakeSessionService
- TmuxTerminalSessionController
- devDependencies
- session-resources.ts
- tmux-errors.integration.test.ts
- dependencies
- agentic-remote
- agentic-remote-promotion-setup
- terminal-session.ts
- .sendInternal
- hub-routes.ts
- scripts
- terminal-startup-queue.test.ts
- computer-manager.ts
- session-reply-durability.test.ts
- react
- compilerOptions
- active-sessions.ts
- terminal-session.test.ts
- SessionMcpServersSnapshot
- capture-workspace.ts
- recordValue
- session-clear-transcript.test.ts
- session-store-providers.test.ts
- HubEvent
- compilerOptions
- PushNotificationService
- SessionKnowledgeStore
- SessionKnowledgeBinding
- knowledge-tree.ts
- compilerOptions
- compilerOptions
- event-log.ts
- workspace-browser.ts
- session-directory.ts
- KnowledgeStore
- recordValue
- SessionResources.tsx
- ReaderWorkspace
- agent-service.test.ts
- background-task-stop.test.ts
- NewSessionDialog
- recovery-resend-durability.test.ts
- tmux-errors.test.ts
- desktop.json
- submission-error.ts
- registerSessionKnowledgeRoutes
- session-resource-clear.test.ts
- BackgroundTasksDialog.tsx
- capture-workbench-review.ts
- package.json
- settings-local.json
- session-knowledge-routes.ts
- background-task-tracker.ts
- claude-agent-service.ts
- promotion-monitor.test.ts
- scripts
- session-knowledge-store.ts
- .oxlintrc.json
- DeferredSession
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- session-knowledge-store.test.ts
- session-resource-transport.ts
- deleteSession
- WorkspaceListing
- UserInputFieldControl
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
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

## Communities (127 total, 22 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.05
Nodes (8): agentMode(), AgentService, isMissingSessionError(), isUncertainDelivery(), removeCopilotSessionFiles(), RuntimeConfigurationError, fixture(), httpBoundary()

### Community 1 - "App"
Cohesion: 0.03
Nodes (138): listKnowledgeEntries(), moveSessionToTmux(), readKnowledgeFile(), reorderQueuedPrompts(), replyPermission(), replyUserInput(), restartSession(), setSessionNotificationsMuted() (+130 more)

### Community 2 - "app.ts"
Cohesion: 0.03
Nodes (61): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), collect() (+53 more)

### Community 3 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (23): ClaudeAgentService, ClaudeSdk, isMissingClaudeSessionError(), directories, fixture(), queryHandle(), waitForIdle(), preparePrompt() (+15 more)

### Community 4 - "App.tsx"
Cohesion: 0.03
Nodes (88): ActivityStatus, accentIconUrl(), applyAccentIcon(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+80 more)

### Community 5 - "App.test.tsx"
Cohesion: 0.04
Nodes (76): addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRuntime(), dispatchQueuedPrompt(), getPushSettings(), getRuntimeOptions() (+68 more)

### Community 6 - "SessionDetail"
Cohesion: 0.07
Nodes (9): observe(), SessionReplacementCleanupError, SessionStore, acceptedStartupRecovery(), fixture(), ChatMessage, QueuedPrompt, SessionDetail (+1 more)

### Community 7 - "session-store.ts"
Cohesion: 0.03
Nodes (61): CopilotClientLike, fixture(), holdProbe(), fixtures, gate(), releases, connect(), createStore() (+53 more)

### Community 8 - "ComputerManager"
Cohesion: 0.07
Nodes (11): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, createHub(), BackgroundTaskSnapshot (+3 more)

### Community 9 - "queueConflict"
Cohesion: 0.05
Nodes (36): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+28 more)

### Community 10 - "sessionKey"
Cohesion: 0.05
Nodes (58): created(), handleDragEnd(), openTasksForSession(), selectSession(), stepSession(), readSelectionFromLocation(), RenameSessionDialog(), KnowledgeRootChoice (+50 more)

### Community 11 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 12 - "remote-node-client.ts"
Cohesion: 0.07
Nodes (25): DirectoryScope, directories, routingFixture(), session(), temporaryDirectory(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, ProviderSessionServiceEvents (+17 more)

### Community 13 - "agent-service.ts"
Cohesion: 0.04
Nodes (51): AcceptedSdkReply, ActivePrompt, activityDuration(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+43 more)

### Community 14 - "SessionService"
Cohesion: 0.07
Nodes (32): supportsSessionFile(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, knowledgeFileQuerySchema (+24 more)

### Community 15 - "contracts.ts"
Cohesion: 0.07
Nodes (40): AddComputerInput, AddKnowledgeRootInput, BackgroundTaskAttachmentMode, BackgroundTaskExecutionMode, CreateSessionInput, DispatchQueuedPromptInput, ExecuteCommandInput, ManagedSessionMcpServersSnapshot (+32 more)

### Community 16 - "WorkspaceDialog"
Cohesion: 0.08
Nodes (40): executeCommand(), listWorkspace(), searchWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+32 more)

### Community 17 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 18 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (7): RemoteNodeClient, client(), servers, session, NodeInfo, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 19 - "TerminalSessionController"
Cohesion: 0.07
Nodes (5): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), TranscriptObservation, TerminalSessionController

### Community 20 - "pwa.ts"
Cohesion: 0.10
Nodes (36): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate() (+28 more)

### Community 22 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (39): attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), CopilotTaskInfo, CopilotTaskProgress, eventString() (+31 more)

### Community 23 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 24 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 25 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (31): pageFor(), accents, Measurement, originalDocument, output, report, save(), scratch (+23 more)

### Community 26 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 28 - "TmuxTerminalSessionController"
Cohesion: 0.15
Nodes (9): copilotCommand(), execFileAsync, processAncestors(), processCommand(), submitTerminalForm(), tmuxTargetForPid(), TmuxTerminalSessionController, PendingPermission (+1 more)

### Community 29 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 30 - "session-resources.ts"
Cohesion: 0.17
Nodes (31): claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills, count(), enrichClaudeSkills() (+23 more)

### Community 31 - "tmux-errors.integration.test.ts"
Cohesion: 0.09
Nodes (17): fixture(), managers, releases, remote, session(), ComputerRegistry, RegistryState, directories (+9 more)

### Community 32 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 33 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 34 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 35 - "terminal-session.ts"
Cohesion: 0.13
Nodes (29): COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasComposerAfter(), hasLiveTerminalComposer(), isTerminalChrome() (+21 more)

### Community 36 - ".sendInternal"
Cohesion: 0.19
Nodes (24): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), hasTerminalCommandPermissionQuestion() (+16 more)

### Community 37 - "hub-routes.ts"
Cohesion: 0.08
Nodes (26): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+18 more)

### Community 38 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 39 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (20): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec, deliveryFixture() (+12 more)

### Community 40 - "computer-manager.ts"
Cohesion: 0.11
Nodes (16): ServerRole, RemoteResync, RemoteSessionListing, RemoteSessionRead, SessionMetadataLookup, disk, FakeManager, fixtures (+8 more)

### Community 41 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (16): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+8 more)

### Community 42 - "react"
Cohesion: 0.10
Nodes (17): plugins, oxc, react, typescript, UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard() (+9 more)

### Community 43 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 44 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 45 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (19): listTmuxSessions(), parseTerminalUpdateNotice(), safeWindowName(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), desktopInstallPane (+11 more)

### Community 46 - "SessionMcpServersSnapshot"
Cohesion: 0.16
Nodes (9): ClaudeResources, isResourceMethodUnavailable(), mcpSnapshot(), safeResourceError(), unavailableMcp(), unavailableSkills(), SessionMcpServersSnapshot, SessionResourceSnapshot (+1 more)

### Community 47 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 48 - "recordValue"
Cohesion: 0.24
Nodes (18): activityGroupIdFor(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent() (+10 more)

### Community 49 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 50 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+2 more)

### Community 51 - "HubEvent"
Cohesion: 0.12
Nodes (12): WorkspaceFixture, ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, sessionMuteSchema (+4 more)

### Community 52 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 55 - "SessionKnowledgeBinding"
Cohesion: 0.18
Nodes (14): SessionKnowledgeEvents, SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey() (+6 more)

### Community 56 - "knowledge-tree.ts"
Cohesion: 0.18
Nodes (17): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+9 more)

### Community 57 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 58 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 59 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 60 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 61 - "session-directory.ts"
Cohesion: 0.21
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 62 - "KnowledgeStore"
Cohesion: 0.20
Nodes (6): WorkspaceFixtureState, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 63 - "recordValue"
Cohesion: 0.20
Nodes (17): addActivity(), boundedText(), errorValue(), notificationKind(), parsedValue(), recordValue(), shellExitFromValue(), shellIdFromFooter() (+9 more)

### Community 64 - "SessionResources.tsx"
Cohesion: 0.15
Nodes (12): SessionResourceSource, SessionResourcesDialog(), SessionResourcesView, isSessionResourceCommandName(), sessionResourceCommand(), sessionResourceCommands, sessionResourceOwner(), SessionResourceTab (+4 more)

### Community 65 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 66 - "agent-service.test.ts"
Cohesion: 0.15
Nodes (7): terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), UserInputForm

### Community 67 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 68 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): provider(), activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+8 more)

### Community 69 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 70 - "tmux-errors.test.ts"
Cohesion: 0.17
Nodes (12): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+4 more)

### Community 71 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 72 - "submission-error.ts"
Cohesion: 0.25
Nodes (9): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, SubmissionReceipt, submissionReceiptFromError() (+1 more)

### Community 73 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 74 - "session-resource-clear.test.ts"
Cohesion: 0.19
Nodes (13): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+5 more)

### Community 75 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 76 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 77 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 78 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 79 - "session-knowledge-routes.ts"
Cohesion: 0.15
Nodes (7): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema, SessionKnowledgeConflictError

### Community 80 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 81 - "claude-agent-service.ts"
Cohesion: 0.17
Nodes (11): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+3 more)

### Community 82 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 83 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 84 - "session-knowledge-store.ts"
Cohesion: 0.18
Nodes (9): bindingSchema, Identity, recoverySchema, RootCatalog, rootSchema, SessionKnowledgePersistenceError, State, stateSchema (+1 more)

### Community 85 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 87 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 88 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 89 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 90 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeRecoveryError, disk, fixture(), fixtures, releases, root()

### Community 91 - "session-resource-transport.ts"
Cohesion: 0.36
Nodes (7): readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 92 - "deleteSession"
Cohesion: 0.28
Nodes (9): addComputer(), deleteKnowledgeRoot(), deleteSession(), removeComputer(), requestVoid(), removeRoot(), ComputersDialog(), remove() (+1 more)

### Community 94 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 95 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 96 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 97 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

## Knowledge Gaps
- **611 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+606 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 921 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `.discoverTerminalSessions`, `SessionDetail`, `session-store.ts`, `queueConflict`, `remote-node-client.ts`, `SessionMcpServersSnapshot`, `recordValue`, `TerminalSessionController`, `session-directory.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `computer-manager.ts`, `remote-node-client.ts`, `SessionMcpServersSnapshot`, `contracts.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `ClaudeAgentService`, `session-store.ts`, `SessionMcpServersSnapshot`, `TerminalSessionController`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _611 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.050596026490066226 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.033022533022533024 - nodes in this community are weakly interconnected._
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
