# Agentic Remote - Graphify code map

Snapshot: `35110df5263f5a5fce4743d965efe8c92d781cc70166f74f6786ce477d8dbf0b`

Source checkout: `a86689af9b15db84b8e0e42e7f3055bc434c302c`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 200 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 200 files · ~411,759 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3218 nodes · 8978 edges · 131 communities (95 shown, 23 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 652 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- api.ts
- App.tsx
- App
- contracts.ts
- SessionStore
- ClaudeAgentService
- claude-agent-service.ts
- agentic-remote-promotion-monitor
- transcription-service.ts
- submitMessage
- SessionService
- SessionDetail
- RemoteNodeClient
- app.ts
- agent-service.ts
- sessionKey
- AgentService
- ComputerManager
- terminal-session.ts
- SessionKnowledgeStore
- .publish
- bundle
- terminal-session.test.ts
- .readAfterWrites
- pwa.ts
- ProviderSessionService
- TmuxTerminalSessionController
- lib.rs
- WorkspaceDialog
- shell.ts
- workspace-fixtures.ts
- background-task-adapter.ts
- config.rs
- FakeSessionService
- devDependencies
- dependencies
- agentic-remote
- hub-routes.ts
- session-knowledge-routes.test.ts
- CopilotSessionLike
- agentic-remote-promotion-setup
- computer-manager-metadata.test.ts
- session-admission-lifecycle.test.ts
- session-store.ts
- scripts
- .get
- ComputerSummary
- session-reply-durability.test.ts
- session-knowledge-routes.ts
- compilerOptions
- active-sessions.ts
- .drainNextTerminalPrompt
- NewSessionDialog
- tmux-errors.integration.test.ts
- .handleSessionEvent
- recovery-resend-durability.test.ts
- session-resource-clear.test.ts
- capture-workspace.ts
- HubEvent
- compilerOptions
- PushNotificationService
- session-store-providers.test.ts
- compilerOptions
- compilerOptions
- recordValue
- event-log.ts
- workspace-browser.ts
- session-enqueue-clear.test.ts
- directory-browser.ts
- use-session-knowledge-root.ts
- ReaderWorkspace
- agent-service.test.ts
- background-task-stop.test.ts
- session-resource-routes.test.ts
- knowledge-tree.ts
- react
- CopilotClientLike
- PromptCards.tsx
- desktop.json
- queued-dispatch.test.ts
- queued-provider-dispatch.test.ts
- capture-workbench-review.ts
- package.json
- .oxlintrc.json
- settings-local.json
- session-resource-providers.test.ts
- background-task-tracker.ts
- promotion-monitor.test.ts
- SessionAdmissions
- BackgroundTasksDialog.tsx
- scripts
- DeferredSession
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- DirectoryListing
- composerHoldsText
- KnowledgeRootChoices.tsx
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- SessionRuntimeInfo
- removeComputer
- .discoverTerminalSessions
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
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
2. `App()` - 219 edges
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

## Communities (131 total, 23 thin omitted)

### Community 0 - "api.ts"
Cohesion: 0.03
Nodes (108): AddKnowledgeRootInput, ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, PushSettings, SessionMcpServerSummary, SessionSkillSummary, parseSubmissionReceipt(), submissionReceiptFromError() (+100 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (99): ActivityStatus, accentIconUrl(), applyAccentIcon(), configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage() (+91 more)

### Community 2 - "App"
Cohesion: 0.04
Nodes (85): deleteSession(), listKnowledgeEntries(), readKnowledgeFile(), replyPermission(), resumeSession(), setSessionNotificationsMuted(), suspendSession(), App() (+77 more)

### Community 3 - "contracts.ts"
Cohesion: 0.05
Nodes (49): ClaudeAgentServiceEvents, RemoteResync, RemoteSessionRead, directories, routingFixture(), session(), temporaryDirectory(), AUDIO_FILENAME_HEADER (+41 more)

### Community 4 - "SessionStore"
Cohesion: 0.07
Nodes (28): fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures (+20 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.07
Nodes (5): ClaudeAgentService, isMissingClaudeSessionError(), claudeFixture(), QueuedPromptReservation, RuntimeModelOption

### Community 6 - "claude-agent-service.ts"
Cohesion: 0.08
Nodes (50): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+42 more)

### Community 7 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 8 - "transcription-service.ts"
Cohesion: 0.06
Nodes (32): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload (+24 more)

### Community 9 - "submitMessage"
Cohesion: 0.08
Nodes (56): reorderQueuedPrompts(), activeComposerPastes(), appendComposerForKey(), applySession(), askAboutKnowledgeFile(), composerChanged(), composerPasted(), durableComposerDraft() (+48 more)

### Community 10 - "SessionService"
Cohesion: 0.07
Nodes (11): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, readServiceResources(), readSessionMcpServers(), readSessionSkills() (+3 more)

### Community 11 - "SessionDetail"
Cohesion: 0.07
Nodes (5): observe(), ChatMessage, QueuedPrompt, SessionDetail, SessionStatus

### Community 12 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (11): RemoteNodeClient, client(), servers, session, BackgroundTaskSnapshot, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing (+3 more)

### Community 13 - "app.ts"
Cohesion: 0.06
Nodes (38): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), transcriptionComputerName() (+30 more)

### Community 14 - "agent-service.ts"
Cohesion: 0.05
Nodes (48): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+40 more)

### Community 15 - "sessionKey"
Cohesion: 0.09
Nodes (40): RenameSessionDialog(), KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, stepVisibleSession(), attentionRank, computerTone() (+32 more)

### Community 16 - "AgentService"
Cohesion: 0.08
Nodes (4): AgentService, removeCopilotSessionFiles(), RuntimeConfigurationError, hasRunningBackgroundAgent()

### Community 17 - "ComputerManager"
Cohesion: 0.16
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 18 - "terminal-session.ts"
Cohesion: 0.11
Nodes (46): activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), hasComposerAfter() (+38 more)

### Community 19 - "SessionKnowledgeStore"
Cohesion: 0.09
Nodes (21): bindingKey(), bindingSchema, Identity, recoverySchema, RootCatalog, rootSchema, SessionKnowledgeConflictError, SessionKnowledgeEvents (+13 more)

### Community 20 - ".publish"
Cohesion: 0.08
Nodes (6): agentMode(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), TranscriptObservation, TerminalSessionController

### Community 21 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 22 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (35): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec, isTerminalAgentWorking() (+27 more)

### Community 23 - ".readAfterWrites"
Cohesion: 0.11
Nodes (5): preparePrompt(), queueConflict(), QueuedDelivery, accept(), unknownClaim()

### Community 24 - "pwa.ts"
Cohesion: 0.10
Nodes (36): directories, AppVersion, parseAppVersion(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart() (+28 more)

### Community 26 - "TmuxTerminalSessionController"
Cohesion: 0.13
Nodes (9): capturePane(), copilotCommand(), execFileAsync, processAncestors(), processCommand(), tmuxTargetForPid(), TmuxTerminalSessionController, PendingPermission (+1 more)

### Community 27 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 28 - "WorkspaceDialog"
Cohesion: 0.10
Nodes (32): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), navigateDocument(), submitSearch() (+24 more)

### Community 29 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 30 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (31): pageFor(), accents, Measurement, originalDocument, output, report, save(), scratch (+23 more)

### Community 31 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (37): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotTaskInfo, CopilotTaskProgress, errorValue(), eventTask() (+29 more)

### Community 32 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 34 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 35 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 36 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 37 - "hub-routes.ts"
Cohesion: 0.07
Nodes (27): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+19 more)

### Community 38 - "session-knowledge-routes.test.ts"
Cohesion: 0.10
Nodes (16): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, KnowledgeState, KnowledgeStore, directories, disk, FakeManager (+8 more)

### Community 39 - "CopilotSessionLike"
Cohesion: 0.11
Nodes (13): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+5 more)

### Community 40 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 41 - "computer-manager-metadata.test.ts"
Cohesion: 0.11
Nodes (10): managers, releases, remote, ComputerRegistry, RegistryState, directories, remoteSnapshotFixture(), NodeIdentityStore (+2 more)

### Community 42 - "session-admission-lifecycle.test.ts"
Cohesion: 0.08
Nodes (17): deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, disk, fixtures (+9 more)

### Community 43 - "session-store.ts"
Cohesion: 0.08
Nodes (19): holdProbe(), fixtures, gate(), releases, channels, directories, activityDuration(), activityResultPreview() (+11 more)

### Community 44 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 46 - "ComputerSummary"
Cohesion: 0.13
Nodes (10): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary, computers, first, grouped (+2 more)

### Community 47 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (15): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+7 more)

### Community 48 - "session-knowledge-routes.ts"
Cohesion: 0.13
Nodes (17): Lineage, registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+9 more)

### Community 49 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 50 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 52 - "NewSessionDialog"
Cohesion: 0.13
Nodes (24): provider(), activateSession(), createSession(), executeCommand(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory() (+16 more)

### Community 53 - "tmux-errors.integration.test.ts"
Cohesion: 0.12
Nodes (19): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer(), noTmuxServer() (+11 more)

### Community 54 - ".handleSessionEvent"
Cohesion: 0.23
Nodes (18): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+10 more)

### Community 55 - "recovery-resend-durability.test.ts"
Cohesion: 0.11
Nodes (14): directories, disk, fixture(), gate(), gates, httpBoundary(), initialize(), PublicSessionValue (+6 more)

### Community 56 - "session-resource-clear.test.ts"
Cohesion: 0.13
Nodes (20): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+12 more)

### Community 57 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 58 - "HubEvent"
Cohesion: 0.12
Nodes (12): WorkspaceFixture, ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, sessionMuteSchema (+4 more)

### Community 59 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 61 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 62 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 63 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 64 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 65 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 66 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 67 - "session-enqueue-clear.test.ts"
Cohesion: 0.14
Nodes (14): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), disk, EnqueueCase, fixtures (+6 more)

### Community 68 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 69 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 70 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 71 - "agent-service.test.ts"
Cohesion: 0.15
Nodes (7): terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), UserInputForm

### Community 72 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 73 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 74 - "knowledge-tree.ts"
Cohesion: 0.19
Nodes (13): WorkspaceEntry, collapseKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs(), KnowledgeEntryRow, KnowledgeFolders, knowledgeRootPath (+5 more)

### Community 75 - "react"
Cohesion: 0.16
Nodes (8): react, MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram(), drawing, MermaidDiagram(), SessionActions()

### Community 77 - "PromptCards.tsx"
Cohesion: 0.24
Nodes (14): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), UserInputCard(), UserInputFieldControl(), chooseOption(), handleMenuKeyDown() (+6 more)

### Community 78 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 79 - "queued-dispatch.test.ts"
Cohesion: 0.15
Nodes (7): deferred(), disk, fixtures, holdWrite(), prompt(), releases, target

### Community 80 - "queued-provider-dispatch.test.ts"
Cohesion: 0.16
Nodes (8): claudeFixture(), copilotSession(), fixtures, gate(), originalQueue, pause(), releases, seed()

### Community 81 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 82 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 83 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 84 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 85 - "session-resource-providers.test.ts"
Cohesion: 0.19
Nodes (12): ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures, Mcp (+4 more)

### Community 86 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 87 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 88 - "SessionAdmissions"
Cohesion: 0.20
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 89 - "BackgroundTasksDialog.tsx"
Cohesion: 0.26
Nodes (8): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, taskDurationLabel(), taskStatusLabel(), orderTasksForReading()

### Community 90 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 92 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 93 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 94 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 96 - "composerHoldsText"
Cohesion: 0.42
Nodes (9): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), pasteCouldCollapse(), pastedPlaceholderCount(), qualifyingPasteCount() (+1 more)

### Community 97 - "KnowledgeRootChoices.tsx"
Cohesion: 0.25
Nodes (7): KnowledgeRootChoice, KnowledgeRootChoices(), KnowledgeRootSession, actions, computers, root, session

### Community 98 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 99 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 100 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 101 - "SessionRuntimeInfo"
Cohesion: 0.40
Nodes (4): listTmuxSessions(), safeWindowName(), ownedStartupFixture(), SessionRuntimeInfo

### Community 102 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **606 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+601 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 915 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `contracts.ts`, `claude-agent-service.ts`, `CopilotSessionLike`, `.discoverTerminalSessions`, `CopilotClientLike`, `.get`, `.drainNextTerminalPrompt`, `.publish`, `recovery-resend-durability.test.ts`, `.handleSessionEvent`, `.readAfterWrites`, `DirectoryListing`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `contracts.ts`, `claude-agent-service.ts`, `computer-manager-metadata.test.ts`, `ComputerManager`, `DirectoryListing`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `ClaudeAgentService` connect `ClaudeAgentService` to `contracts.ts`, `claude-agent-service.ts`, `CopilotSessionLike`, `SessionService`, `SessionDetail`, `session-reply-durability.test.ts`, `DirectoryListing`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _606 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03449568803899512 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.02908545727136432 - nodes in this community are weakly interconnected._
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
