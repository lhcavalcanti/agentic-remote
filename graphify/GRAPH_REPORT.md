# Agentic Remote - Graphify code map

Snapshot: `d32c873d4e5159b8e305d6c9d5ee12d2b394cbd640d8f8f0150dbd1705a1ca8a`

Source checkout: `091b8aac04a6a252136bf0359425f0450a0199b0`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 155 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 155 files · ~306,775 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2682 nodes · 7219 edges · 114 communities (80 shown, 21 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 509 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App.tsx
- ComputerManager
- App
- app.ts
- SessionStore
- api.ts
- contracts.ts
- ClaudeAgentService
- pwa.ts
- agentic-remote-promotion-monitor
- session-resources.ts
- SessionDetail
- computer-manager.ts
- background-task-adapter.ts
- tmux-errors.integration.test.ts
- bundle
- TmuxTerminalSessionController
- terminal-session.ts
- ProviderSessionService
- lib.rs
- RemoteNodeClient
- FakeSessionService
- config.rs
- agent-service.ts
- devDependencies
- workspace-fixtures.ts
- queued-dispatch.test.ts
- workspace-browser.ts
- dependencies
- agentic-remote
- agentic-remote-promotion-setup
- session-presentation.ts
- terminal-session.test.ts
- hub-routes.ts
- scripts
- SessionResources.tsx
- .handleSessionEvent
- compilerOptions
- active-sessions.ts
- agent-service.test.ts
- CopilotSessionLike
- compilerOptions
- session-resource-providers.test.ts
- PushNotificationService
- session-store-providers.test.ts
- compilerOptions
- compilerOptions
- event-log.ts
- markdown-navigation.ts
- directory-browser.ts
- ReaderWorkspace
- tmux-errors.test.ts
- HubEvent
- NewSessionDialog
- desktop.json
- knowledgePathChain
- persistComposerDrafts
- capture
- WorkspaceDialog
- package.json
- settings-local.json
- shell-notifications.ts
- react
- background-task-tracker.ts
- promotion-monitor.test.ts
- scripts
- composerTookPaste
- phone
- .oxlintrc.json
- bridge.rs
- SessionNavigation.test.tsx
- screenshot-stability.test.ts
- DirectoryListing
- ResourceService
- UserInputFieldControl
- DocumentViewControls.tsx
- knowledge-restore.ts
- .providerRuntimeOptions
- WorkspaceListing
- WorkspaceFile
- settings.ts
- commitSidebarWidth
- composer-layout.test.ts
- executeCommand
- push-routes.ts
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
1. `SessionDetail` - 209 edges
2. `App()` - 197 edges
3. `AgentService` - 138 edges
4. `ClaudeAgentService` - 95 edges
5. `SessionStore` - 89 edges
6. `ComputerManager` - 73 edges
7. `SessionService` - 64 edges
8. `RemoteNodeClient` - 63 edges
9. `registerHubRoutes()` - 56 edges
10. `registerNodeRoutes()` - 51 edges

## Surprising Connections (you probably didn't know these)
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts
- `StoredSession` --inherits--> `SessionDetail`  [EXTRACTED]
  server/session-store.ts → shared/contracts.ts
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (114 total, 21 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.05
Nodes (10): agentMode(), AgentService, isMissingSessionError(), persistedFormAnswer(), removeCopilotSessionFiles(), validateUserInputForm(), preparePrompt(), queueConflict() (+2 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (89): ActivityStatus, UserInputField, UserInputFieldValue, accentIconUrl(), applyAccentIcon(), addComputer(), configureRuntime(), removeComputer() (+81 more)

### Community 2 - "ComputerManager"
Cohesion: 0.06
Nodes (23): ComputerManager, managedSession(), RemoteSessionListing, RemoteSessionRead, sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier (+15 more)

### Community 3 - "App"
Cohesion: 0.06
Nodes (95): activeComposerPastes(), App(), answerUserInput(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession(), askAboutKnowledgeFile() (+87 more)

### Community 4 - "app.ts"
Cohesion: 0.04
Nodes (50): prefixes, session, trusted, untrusted, directories, buildApp(), BuildAppOptions, errorStatusCode() (+42 more)

### Community 5 - "SessionStore"
Cohesion: 0.04
Nodes (37): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), preflight(), fixture(), claudeFixture() (+29 more)

### Community 6 - "api.ts"
Cohesion: 0.06
Nodes (71): AddKnowledgeRootInput, PushSettings, addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), deleteKnowledgeRoot(), deleteSession() (+63 more)

### Community 7 - "contracts.ts"
Cohesion: 0.05
Nodes (38): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission (+30 more)

### Community 8 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (5): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), toolResultText(), RuntimeModelOption

### Community 9 - "pwa.ts"
Cohesion: 0.06
Nodes (57): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), testNotification() (+49 more)

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (55): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+47 more)

### Community 11 - "session-resources.ts"
Cohesion: 0.10
Nodes (40): RemoteNodeRedirectError, RemoteNodeRequestError, claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills (+32 more)

### Community 12 - "SessionDetail"
Cohesion: 0.08
Nodes (7): ownsDispatchRecovery(), QueuedDispatches, ChatMessage, QueuedPrompt, SessionDetail, SessionStatus, SessionSummary

### Community 13 - "computer-manager.ts"
Cohesion: 0.06
Nodes (36): RemoteResync, FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER (+28 more)

### Community 14 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (47): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+39 more)

### Community 15 - "tmux-errors.integration.test.ts"
Cohesion: 0.07
Nodes (18): stopActiveCopilotSession(), ComputerRegistry, RegistryState, directories, KnowledgeState, KnowledgeStore, directories, remoteSnapshotFixture() (+10 more)

### Community 16 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 17 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (14): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), terminalChecklistState() (+6 more)

### Community 18 - "terminal-session.ts"
Cohesion: 0.13
Nodes (39): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), findTerminalWrappedText(), hasComposerAfter() (+31 more)

### Community 20 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 21 - "RemoteNodeClient"
Cohesion: 0.08
Nodes (8): headerSafe(), RemoteNodeClient, client(), servers, session, BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt

### Community 23 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 24 - "agent-service.ts"
Cohesion: 0.06
Nodes (36): ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+28 more)

### Community 25 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 26 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (32): audit, frames, outputDir, phase, runtimeDir, { values }, BACKGROUND_SESSION_ID, CONTEXT_EXAMPLE (+24 more)

### Community 27 - "queued-dispatch.test.ts"
Cohesion: 0.09
Nodes (15): errorMessage(), explicitlyRefused(), hasUncertainDelivery(), QueuedDelivery, terminalRefused(), accept(), deferred(), disk (+7 more)

### Community 28 - "workspace-browser.ts"
Cohesion: 0.10
Nodes (28): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+20 more)

### Community 29 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 30 - "agentic-remote"
Cohesion: 0.14
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 31 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 32 - "session-presentation.ts"
Cohesion: 0.15
Nodes (25): attentionRank, computerTone(), executionModeName(), matchesSessionSearch(), providerName(), recentFirst(), sessionActivityTime(), sessionDay (+17 more)

### Community 33 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (22): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), parseTerminalUpdateNotice(), bracketedTabPane, deliveryFixture() (+14 more)

### Community 34 - "hub-routes.ts"
Cohesion: 0.08
Nodes (27): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+19 more)

### Community 35 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 36 - "SessionResources.tsx"
Cohesion: 0.12
Nodes (22): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, isMcpSummary(), isRecord(), isSkillSummary(), listSessionMcpServers(), listSessionSkills() (+14 more)

### Community 37 - ".handleSessionEvent"
Cohesion: 0.21
Nodes (21): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+13 more)

### Community 38 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 39 - "active-sessions.ts"
Cohesion: 0.18
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 40 - "agent-service.test.ts"
Cohesion: 0.10
Nodes (11): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), terminalFormSteps(), DeferredSession, directories, services, CopilotTaskInfo (+3 more)

### Community 41 - "CopilotSessionLike"
Cohesion: 0.13
Nodes (7): CopilotSessionLike, FakeCopilotClient, CopilotTasksApi, acceptanceReceipt(), queuedSdkPrompt(), disposals, fixture()

### Community 42 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 43 - "session-resource-providers.test.ts"
Cohesion: 0.14
Nodes (13): CopilotClientLike, claudeFixture(), copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures (+5 more)

### Community 45 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 46 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 47 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 48 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 49 - "markdown-navigation.ts"
Cohesion: 0.20
Nodes (17): MarkdownImage(), BreadcrumbSegment, DocumentLink, headingSlug(), headingText(), inlineText(), isExternalSource(), MarkdownNode (+9 more)

### Community 50 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 51 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 52 - "tmux-errors.test.ts"
Cohesion: 0.17
Nodes (12): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+4 more)

### Community 53 - "HubEvent"
Cohesion: 0.17
Nodes (8): WorkspaceFixture, ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, HubEvent

### Community 54 - "NewSessionDialog"
Cohesion: 0.22
Nodes (15): provider(), activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), computerProviders() (+7 more)

### Community 55 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 56 - "knowledgePathChain"
Cohesion: 0.22
Nodes (14): cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder(), openKnowledgeFile(), openKnowledgeFolder() (+6 more)

### Community 57 - "persistComposerDrafts"
Cohesion: 0.21
Nodes (14): persistComposerDrafts(), hasComposerAcceptanceReceipt(), prependComposerContent(), queuedEditOwners(), readComposerAcceptanceReceipts(), readComposerDrafts(), readDefaultSessionFolders(), readLegacyComposerDrafts() (+6 more)

### Community 58 - "capture"
Cohesion: 0.22
Nodes (13): shortcutKeys(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode(), keyLabel(), readStoredShortcuts() (+5 more)

### Community 59 - "WorkspaceDialog"
Cohesion: 0.23
Nodes (12): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument(), submitSearch() (+4 more)

### Community 60 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 61 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 62 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 63 - "react"
Cohesion: 0.20
Nodes (8): plugins, oxc, react, typescript, drawDiagram(), drawing, MermaidDiagram(), SessionActions()

### Community 64 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 65 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 66 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 67 - "composerTookPaste"
Cohesion: 0.33
Nodes (11): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse() (+3 more)

### Community 68 - "phone"
Cohesion: 0.47
Nodes (10): assertConversation(), assertLayout(), capture(), desktop(), documentHeading(), expect, openGuide(), phone() (+2 more)

### Community 69 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 70 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 71 - "SessionNavigation.test.tsx"
Cohesion: 0.20
Nodes (8): actions, backgroundTasks, computers, offline, question, session, sessionsByComputer, worker

### Community 72 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 74 - "ResourceService"
Cohesion: 0.29
Nodes (3): dataDirectory(), pairedFixture(), ResourceService

### Community 75 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 76 - "DocumentViewControls.tsx"
Cohesion: 0.29
Nodes (4): DocumentViewControls(), actions, outline, DocumentHeading

### Community 77 - "knowledge-restore.ts"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 81 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 82 - "commitSidebarWidth"
Cohesion: 0.29
Nodes (7): commitSidebarWidth(), sidebarResizeEnd(), sidebarResizeKeyDown(), sidebarResizeMove(), clampSidebarWidth(), readStoredSidebarWidth(), writeStored()

### Community 83 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 84 - "executeCommand"
Cohesion: 0.47
Nodes (6): executeCommand(), ChangeDirectoryDialog(), browseDirectory(), submit(), workspaceAbsolutePath(), workspaceFilePrompt()

### Community 85 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 87 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **500 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+495 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 760 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `ComputerManager`, `contracts.ts`, `DirectoryListing`, `computer-manager.ts`, `WorkspaceListing`, `WorkspaceFile`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `App()` connect `App` to `session-presentation.ts`, `App.tsx`, `api.ts`, `pwa.ts`, `knowledge-restore.ts`, `commitSidebarWidth`, `executeCommand`, `NewSessionDialog`, `knowledgePathChain`, `persistComposerDrafts`, `capture`, `workspace-browser.ts`, `shell-notifications.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `ClaudeAgentService`, `session-resources.ts`, `SessionDetail`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _500 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.04920728126834997 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.026626697231528832 - nodes in this community are weakly interconnected._
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
