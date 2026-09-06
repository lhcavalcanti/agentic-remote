# Agentic Remote - Graphify code map

Snapshot: `c95bdaf37b912fd121903ebc2b97cf5d88cd70c8cedb0e9fa30794f2861b0472`

Source checkout: `5ddeae7bde3a75bc88e73c6e6611eea70ad34af8`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 159 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 159 files · ~313,662 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2729 nodes · 7366 edges · 110 communities (78 shown, 19 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 516 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- AgentService
- api.ts
- SessionDetail
- app.ts
- claude-agent-service.ts
- SessionStore
- contracts.ts
- agent-service.ts
- agentic-remote-promotion-monitor
- RemoteNodeClient
- queueConflict
- queued-dispatch.test.ts
- background-task-adapter.ts
- ComputerManager
- bundle
- terminal-session.ts
- TmuxTerminalSessionController
- pwa.ts
- lib.rs
- .dispatchCommand
- ProviderSessionService
- WorkspaceDialog
- shell.ts
- FakeSessionService
- config.rs
- SessionService
- devDependencies
- workspace-fixtures.ts
- dependencies
- hub-routes.ts
- agentic-remote
- agentic-remote-promotion-setup
- knowledge-tree.ts
- session-store-providers.test.ts
- tmux-errors.integration.test.ts
- node-routes.ts
- terminal-session.test.ts
- scripts
- session-presentation.ts
- active-sessions.ts
- compilerOptions
- session-resource-clear.test.ts
- agent-service.test.ts
- KnowledgeStore
- session-resource-providers.test.ts
- ComputerSummary
- NewSessionDialog
- compilerOptions
- PushNotificationService
- compilerOptions
- compilerOptions
- directory-browser.ts
- event-log.ts
- workspace-browser.ts
- react
- ReaderWorkspace
- session-resource-routes.test.ts
- tmux-errors.test.ts
- SessionResources.tsx
- capture
- HubEvent
- desktop.json
- package.json
- settings-local.json
- background-task-tracker.ts
- promotion-monitor.test.ts
- scripts
- composerTookPaste
- SessionNavigation.test.tsx
- phone
- bridge.rs
- screenshot-stability.test.ts
- SessionFileUpload
- UserInputFieldControl
- knowledge-restore.ts
- settings.ts
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- push-routes.ts
- rules
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
1. `SessionDetail` - 212 edges
2. `App()` - 198 edges
3. `AgentService` - 142 edges
4. `ClaudeAgentService` - 99 edges
5. `SessionStore` - 91 edges
6. `ComputerManager` - 73 edges
7. `SessionService` - 66 edges
8. `RemoteNodeClient` - 63 edges
9. `registerHubRoutes()` - 57 edges
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

## Communities (110 total, 19 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (112): deleteKnowledgeRoot(), replyPermission(), activeComposerPastes(), App(), answerUserInput(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot() (+104 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (93): ActivityStatus, accentIconUrl(), applyAccentIcon(), addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes (+85 more)

### Community 2 - "AgentService"
Cohesion: 0.06
Nodes (6): agentMode(), AgentService, isMissingSessionError(), pendingUserInputFromEvents(), removeCopilotSessionFiles(), RuntimeConfigurationError

### Community 3 - "api.ts"
Cohesion: 0.06
Nodes (80): AddKnowledgeRootInput, PushSettings, addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), deleteSession(), dispatchQueuedPrompt() (+72 more)

### Community 4 - "SessionDetail"
Cohesion: 0.06
Nodes (7): ClaudeAgentService, isMissingClaudeSessionError(), toolResultText(), RuntimeModelOption, SessionDetail, SessionStatus, SessionSummary

### Community 5 - "app.ts"
Cohesion: 0.05
Nodes (47): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), ServerRole (+39 more)

### Community 6 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (55): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, releases (+47 more)

### Community 7 - "SessionStore"
Cohesion: 0.06
Nodes (23): fixture(), claudeFixture(), copilotFixture(), seed(), providerFixture(), copilotFixture(), activityDuration(), activityResultPreview() (+15 more)

### Community 8 - "contracts.ts"
Cohesion: 0.07
Nodes (43): ClaudeAgentServiceEvents, RemoteResync, RemoteSessionRead, DirectoryScope, directories, routingFixture(), session(), temporaryDirectory() (+35 more)

### Community 9 - "agent-service.ts"
Cohesion: 0.06
Nodes (59): ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents, ansiSequence (+51 more)

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (55): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+47 more)

### Community 11 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (12): headerSafe(), RemoteNodeClient, client(), servers, session, RemoteNodeRedirectError, RemoteNodeRequestError, BackgroundTaskSnapshot (+4 more)

### Community 12 - "queueConflict"
Cohesion: 0.09
Nodes (19): isClaudeAuthenticationError(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt() (+11 more)

### Community 13 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (17): CopilotClientLike, CopilotSessionLike, FakeCopilotClient, CopilotTasksApi, deferred(), disk, fixtures, holdWrite() (+9 more)

### Community 14 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (46): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+38 more)

### Community 15 - "ComputerManager"
Cohesion: 0.18
Nodes (6): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession

### Community 16 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 17 - "terminal-session.ts"
Cohesion: 0.13
Nodes (40): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), findTerminalWrappedText(), hasComposerAfter() (+32 more)

### Community 18 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (14): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), terminalChecklistState() (+6 more)

### Community 19 - "pwa.ts"
Cohesion: 0.10
Nodes (36): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart() (+28 more)

### Community 20 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 21 - ".dispatchCommand"
Cohesion: 0.09
Nodes (5): persistedFormAnswer(), terminalFormSteps(), validateUserInputForm(), isTerminalAgentWorking(), TerminalSessionController

### Community 23 - "WorkspaceDialog"
Cohesion: 0.10
Nodes (32): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), navigateDocument(), submitSearch() (+24 more)

### Community 24 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 26 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 28 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 29 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (32): audit, frames, outputDir, phase, runtimeDir, { values }, BACKGROUND_SESSION_ID, CONTEXT_EXAMPLE (+24 more)

### Community 30 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 31 - "hub-routes.ts"
Cohesion: 0.07
Nodes (28): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+20 more)

### Community 32 - "agentic-remote"
Cohesion: 0.14
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 33 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 34 - "knowledge-tree.ts"
Cohesion: 0.11
Nodes (27): WorkspaceEntry, cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder(), openKnowledgeFile() (+19 more)

### Community 35 - "session-store-providers.test.ts"
Cohesion: 0.08
Nodes (14): disk, fixtures, prompt(), releases, session(), claude(), clearFixture(), copilot() (+6 more)

### Community 36 - "tmux-errors.integration.test.ts"
Cohesion: 0.11
Nodes (12): ComputerRegistry, RegistryState, directories, remoteSnapshotFixture(), NodeIdentityStore, StoredNodeIdentity, execFileAsync, headers (+4 more)

### Community 37 - "node-routes.ts"
Cohesion: 0.09
Nodes (24): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), configureRuntimeSchema, createSessionSchema (+16 more)

### Community 38 - "terminal-session.test.ts"
Cohesion: 0.12
Nodes (21): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), bracketedTabPane, deliveryFixture(), directories (+13 more)

### Community 39 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 40 - "session-presentation.ts"
Cohesion: 0.17
Nodes (23): attentionRank, computerTone(), executionModeName(), matchesSessionSearch(), providerName(), recentFirst(), sessionActivityTime(), sessionDay (+15 more)

### Community 41 - "active-sessions.ts"
Cohesion: 0.18
Nodes (24): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+16 more)

### Community 42 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 43 - "session-resource-clear.test.ts"
Cohesion: 0.11
Nodes (20): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+12 more)

### Community 44 - "agent-service.test.ts"
Cohesion: 0.10
Nodes (10): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), DeferredSession, directories, services, CopilotTaskInfo, CopilotTaskProgress (+2 more)

### Community 45 - "KnowledgeStore"
Cohesion: 0.13
Nodes (7): KnowledgeState, KnowledgeStore, directories, createHub(), KnowledgeRoot, KnowledgeRootSelector(), roots

### Community 46 - "session-resource-providers.test.ts"
Cohesion: 0.12
Nodes (17): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), claudeFixture(), ClaudeMcpRead, deferred() (+9 more)

### Community 47 - "ComputerSummary"
Cohesion: 0.18
Nodes (3): sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 48 - "NewSessionDialog"
Cohesion: 0.15
Nodes (21): provider(), activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+13 more)

### Community 49 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 51 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 52 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 53 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 54 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 55 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 56 - "react"
Cohesion: 0.12
Nodes (13): ignorePatterns, plugins, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/**, oxc, react (+5 more)

### Community 57 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 58 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 59 - "tmux-errors.test.ts"
Cohesion: 0.17
Nodes (12): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+4 more)

### Community 60 - "SessionResources.tsx"
Cohesion: 0.13
Nodes (11): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, Catalog, CatalogResult, SessionResources(), sourceLabels, statusLabels (+3 more)

### Community 61 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 62 - "HubEvent"
Cohesion: 0.17
Nodes (8): WorkspaceFixture, ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, HubEvent

### Community 63 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 64 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 65 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 66 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 67 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 68 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 69 - "composerTookPaste"
Cohesion: 0.33
Nodes (11): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse() (+3 more)

### Community 70 - "SessionNavigation.test.tsx"
Cohesion: 0.18
Nodes (9): SessionSort, actions, backgroundTasks, computers, offline, question, session, sessionsByComputer (+1 more)

### Community 71 - "phone"
Cohesion: 0.47
Nodes (10): assertConversation(), assertLayout(), capture(), desktop(), documentHeading(), expect, openGuide(), phone() (+2 more)

### Community 72 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 73 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 75 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 76 - "knowledge-restore.ts"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 77 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 78 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 79 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 80 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 81 - "rules"
Cohesion: 0.50
Nodes (4): rules, react/only-export-components, react/rules-of-hooks, warn

### Community 83 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **512 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+507 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 776 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionDetail`, `node-routes.ts`, `tmux-errors.integration.test.ts`, `SessionStore`, `KnowledgeStore`, `ComputerManager`, `PushNotificationService`, `pwa.ts`, `ProviderSessionService`, `SessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `session-store-providers.test.ts`, `SessionDetail`, `claude-agent-service.ts`, `SessionFileUpload`, `queueConflict`, `.dispatchCommand`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `claude-agent-service.ts`, `SessionStore`, `agent-service.ts`, `SessionFileUpload`, `queueConflict`, `queued-dispatch.test.ts`, `agent-service.test.ts`, `.dispatchCommand`, `directory-browser.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _512 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04422788605697151 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.02871219843696908 - nodes in this community are weakly interconnected._
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
