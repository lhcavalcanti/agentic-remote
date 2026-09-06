# Agentic Remote - Graphify code map

Snapshot: `044416b8f45e3d0b6f180a44b8beabb5c08015011542f60fdcf1a8844b04eadf`

Source checkout: `4d21df0f5127b1c756b40af644ca68358b2ccea1`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 161 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 161 files · ~314,258 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2699 nodes · 7113 edges · 123 communities (88 shown, 21 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 483 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- AgentService
- api.ts
- SessionDetail
- ClaudeAgentService
- agentic-remote-promotion-monitor
- .get
- background-task-adapter.ts
- session-store-providers.test.ts
- contracts.ts
- bundle
- ComputerManager
- RemoteNodeClient
- TmuxTerminalSessionController
- SessionService
- agent-service.ts
- WorkspaceDialog
- lib.rs
- claude-agent-service.ts
- shell.ts
- config.rs
- pwa.ts
- session-knowledge-routes.test.ts
- ProviderSessionService
- devDependencies
- queued-dispatch.test.ts
- dependencies
- FakeSessionService
- multi-node.test.ts
- node-routes.ts
- agentic-remote
- agentic-remote-promotion-setup
- terminal-session.ts
- terminal-session.test.ts
- delegated-transcription-service.ts
- knowledge-tree.ts
- hub-routes.ts
- scripts
- parseTerminalPermission
- transcription-service.ts
- compilerOptions
- active-sessions.ts
- agent-service.test.ts
- tmux-errors.integration.test.ts
- capture-workspace.ts
- workspace-fixtures.ts
- CopilotSessionLike
- PushNotificationService
- workspace-browser.ts
- compilerOptions
- recordValue
- ComputerSummary
- NewSessionDialog
- compilerOptions
- compilerOptions
- directory-browser.ts
- app.ts
- event-log.ts
- SessionKnowledgeStore
- CopilotClientLike
- BackgroundTaskSnapshot
- ReaderWorkspace
- capture-workbench-review.ts
- TerminalSessionController
- session-knowledge-store.test.ts
- desktop.json
- push-notification-service.ts
- registerSessionKnowledgeRoutes
- capture
- package.json
- settings-local.json
- session-knowledge-routes.ts
- TranscriptionError
- shortPath
- react
- promotion-monitor.test.ts
- SessionNavigation.tsx
- scripts
- session-knowledge-store.ts
- SessionNavigation.test.tsx
- use-session-knowledge-root.ts
- .oxlintrc.json
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- KnowledgeRootChoices.tsx
- session-presentation.ts
- SessionFileUpload
- UserInputFieldControl
- settings.ts
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- session-navigation-view.test.ts
- release-publication.test.ts
- MockMediaRecorder
- MockWebSocket
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
1. `SessionDetail` - 207 edges
2. `App()` - 204 edges
3. `AgentService` - 133 edges
4. `ClaudeAgentService` - 89 edges
5. `SessionStore` - 85 edges
6. `ComputerManager` - 75 edges
7. `RemoteNodeClient` - 59 edges
8. `SessionService` - 59 edges
9. `registerHubRoutes()` - 54 edges
10. `ManagedSession` - 48 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `SessionKnowledgeEvents` --references--> `SessionKnowledgeBinding`  [EXTRACTED]
  server/session-knowledge-store.ts → shared/contracts.ts
- `WorkspaceFixtureState` --references--> `ManagedSession`  [EXTRACTED]
  e2e/workspace-fixtures.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (123 total, 21 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (115): replyPermission(), activeComposerPastes(), App(), answerUserInput(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession() (+107 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (92): ActivityStatus, UserInputField, UserInputFieldValue, accentIconUrl(), applyAccentIcon(), addComputer(), configureRuntime(), removeComputer() (+84 more)

### Community 2 - "AgentService"
Cohesion: 0.05
Nodes (5): agentMode(), AgentService, isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError

### Community 3 - "api.ts"
Cohesion: 0.06
Nodes (72): addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), deleteKnowledgeRoot(), deleteSession(), dispatchQueuedPrompt(), getProviderRuntimeOptions() (+64 more)

### Community 4 - "SessionDetail"
Cohesion: 0.07
Nodes (18): isMissingClaudeSessionError(), toolResultText(), activityDuration(), activityResultPreview(), cloneSession(), DiscoveredSession, PendingChange, SessionProjection (+10 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (7): ClaudeAgentService, ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), RuntimeModelOption

### Community 6 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (55): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+47 more)

### Community 7 - ".get"
Cohesion: 0.11
Nodes (6): isClaudeAuthenticationError(), preparePrompt(), queueConflict(), QueuedDelivery, QueuedDispatchTarget, isTerminalAgentWorking()

### Community 8 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (47): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+39 more)

### Community 9 - "session-store-providers.test.ts"
Cohesion: 0.06
Nodes (26): fixture(), claudeFixture(), copilotFixture(), copilotSession(), fixtures, gate(), originalQueue, pause() (+18 more)

### Community 10 - "contracts.ts"
Cohesion: 0.07
Nodes (35): ClaudeAgentServiceEvents, ComputerManagerEvents, managers, releases, remote, RemoteResync, RemoteSessionRead, StoredNodeIdentity (+27 more)

### Community 11 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 12 - "ComputerManager"
Cohesion: 0.18
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 13 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (9): RemoteNodeClient, client(), servers, session, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing (+1 more)

### Community 14 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (14): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), terminalChecklistState() (+6 more)

### Community 16 - "agent-service.ts"
Cohesion: 0.06
Nodes (39): ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+31 more)

### Community 17 - "WorkspaceDialog"
Cohesion: 0.10
Nodes (33): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+25 more)

### Community 18 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 19 - "claude-agent-service.ts"
Cohesion: 0.09
Nodes (18): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, execFileAsync, PendingClaudeInput, PendingClaudePermission, DirectoryScope, provider() (+10 more)

### Community 20 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 21 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 22 - "pwa.ts"
Cohesion: 0.11
Nodes (33): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), testNotification() (+25 more)

### Community 23 - "session-knowledge-routes.test.ts"
Cohesion: 0.08
Nodes (17): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, disk (+9 more)

### Community 25 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 26 - "queued-dispatch.test.ts"
Cohesion: 0.08
Nodes (17): errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDispatches, terminalRefused(), accept() (+9 more)

### Community 27 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 29 - "multi-node.test.ts"
Cohesion: 0.10
Nodes (9): ComputerRegistry, RegistryState, directories, directories, remoteSnapshotFixture(), routingFixture(), session(), temporaryDirectory() (+1 more)

### Community 30 - "node-routes.ts"
Cohesion: 0.08
Nodes (26): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+18 more)

### Community 31 - "agentic-remote"
Cohesion: 0.14
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 32 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 33 - "terminal-session.ts"
Cohesion: 0.13
Nodes (28): COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasLiveTerminalComposer(), isTerminalChrome(), normaliseOutputLine() (+20 more)

### Community 34 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (22): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), parseTerminalUpdateNotice(), bracketedTabPane, deliveryFixture() (+14 more)

### Community 35 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (13): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+5 more)

### Community 36 - "knowledge-tree.ts"
Cohesion: 0.12
Nodes (25): applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder(), openKnowledgeFile() (+17 more)

### Community 37 - "hub-routes.ts"
Cohesion: 0.08
Nodes (26): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+18 more)

### Community 38 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 39 - "parseTerminalPermission"
Cohesion: 0.22
Nodes (23): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), findTerminalWrappedText(), hasComposerAfter(), hasTerminalCommandPermissionQuestion() (+15 more)

### Community 40 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 41 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 42 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 43 - "agent-service.test.ts"
Cohesion: 0.10
Nodes (11): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), terminalFormSteps(), DeferredSession, directories, services, CopilotTaskInfo (+3 more)

### Community 44 - "tmux-errors.integration.test.ts"
Cohesion: 0.12
Nodes (19): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer(), noTmuxServer() (+11 more)

### Community 45 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 46 - "workspace-fixtures.ts"
Cohesion: 0.11
Nodes (18): pageFor(), CONTEXT_EXAMPLE, createWorkspaceFixtureState(), documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureBaseUrl(), fixtureEndpoints (+10 more)

### Community 47 - "CopilotSessionLike"
Cohesion: 0.13
Nodes (7): CopilotSessionLike, FakeCopilotClient, CopilotTasksApi, acceptanceReceipt(), queuedSdkPrompt(), disposals, fixture()

### Community 49 - "workspace-browser.ts"
Cohesion: 0.19
Nodes (17): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+9 more)

### Community 50 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 51 - "recordValue"
Cohesion: 0.25
Nodes (17): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+9 more)

### Community 52 - "ComputerSummary"
Cohesion: 0.18
Nodes (5): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 53 - "NewSessionDialog"
Cohesion: 0.16
Nodes (20): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+12 more)

### Community 54 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 55 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 56 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 57 - "app.ts"
Cohesion: 0.16
Nodes (12): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), transcriptionComputerName() (+4 more)

### Community 58 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 59 - "SessionKnowledgeStore"
Cohesion: 0.26
Nodes (3): bindingKey(), SessionKnowledgeStore, SessionKnowledgeBinding

### Community 61 - "BackgroundTaskSnapshot"
Cohesion: 0.20
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 62 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 63 - "capture-workbench-review.ts"
Cohesion: 0.13
Nodes (13): frame(), geometry, output, scratch, screenshot(), { values }, fixtureKnowledgeRoots, fixtureSessions (+5 more)

### Community 64 - "TerminalSessionController"
Cohesion: 0.15
Nodes (3): persistedFormAnswer(), validateUserInputForm(), TerminalSessionController

### Community 65 - "session-knowledge-store.test.ts"
Cohesion: 0.17
Nodes (7): SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, disk, fixture(), fixtures, releases, root()

### Community 66 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 67 - "push-notification-service.ts"
Cohesion: 0.14
Nodes (8): brief(), HubEventSource, PushSender, PushState, sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 68 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 69 - "capture"
Cohesion: 0.22
Nodes (13): shortcutKeys(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode(), keyLabel(), readStoredShortcuts() (+5 more)

### Community 70 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 71 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 72 - "session-knowledge-routes.ts"
Cohesion: 0.15
Nodes (7): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema, SessionKnowledgeConflictError

### Community 73 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 74 - "shortPath"
Cohesion: 0.26
Nodes (10): KnowledgeRootSelector(), root, executionModeName(), matchesSessionSearch(), providerName(), sessionActivityTime(), shortPath(), session (+2 more)

### Community 75 - "react"
Cohesion: 0.20
Nodes (8): plugins, oxc, react, typescript, drawDiagram(), drawing, MermaidDiagram(), SessionActions()

### Community 76 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 77 - "SessionNavigation.tsx"
Cohesion: 0.30
Nodes (9): SessionFilter, sessionNavigationView, computerTone(), sessionPresentation, sessionSortFrom(), taskSnapshot(), SessionActions, SessionNavigation() (+1 more)

### Community 78 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 79 - "session-knowledge-store.ts"
Cohesion: 0.18
Nodes (10): bindingSchema, Identity, recoverySchema, RootCatalog, rootSchema, SessionKnowledgeEvents, State, stateSchema (+2 more)

### Community 80 - "SessionNavigation.test.tsx"
Cohesion: 0.18
Nodes (9): actions, backgroundTasks, computers, NavigationHarness(), offline, question, session, sessionsByComputer (+1 more)

### Community 81 - "use-session-knowledge-root.ts"
Cohesion: 0.24
Nodes (7): bindingKey(), knowledgePositionForBinding(), SessionIdentity, first, root, second, useSessionKnowledgeRoot()

### Community 82 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 83 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 84 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 85 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 86 - "KnowledgeRootChoices.tsx"
Cohesion: 0.25
Nodes (7): KnowledgeRootChoice, KnowledgeRootChoices(), KnowledgeRootSession, actions, computers, root, session

### Community 87 - "session-presentation.ts"
Cohesion: 0.25
Nodes (8): attentionRank, recentFirst(), sessionDay, SessionSort, SessionState, sessionTime, sortSessionView(), stateLabels

### Community 89 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 90 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 91 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 93 - "session-navigation-view.test.ts"
Cohesion: 0.33
Nodes (5): computers, first, grouped, hidden, last

### Community 95 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **512 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+507 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 782 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `App()` connect `App` to `App.tsx`, `api.ts`, `knowledge-tree.ts`, `capture`, `shortPath`, `SessionNavigation.tsx`, `use-session-knowledge-root.ts`, `shell.ts`, `NewSessionDialog`, `pwa.ts`, `KnowledgePosition`, `session-presentation.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `contracts.ts`, `claude-agent-service.ts`, `SessionFileUpload`, `FakeSessionService`, `BackgroundTaskSnapshot`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `ClaudeAgentService`, `.get`, `session-store-providers.test.ts`, `SessionFileUpload`, `queued-dispatch.test.ts`, `CopilotClientLike`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _512 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.040633608815427 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.028383523710626513 - nodes in this community are weakly interconnected._
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
