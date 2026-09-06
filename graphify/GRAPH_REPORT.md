# Agentic Remote - Graphify code map

Snapshot: `475446491e079c82e9313031aa39aabfb2fa11b90242c0d5a78bfd286b2c3ebf`

Source checkout: `c027f62f61e221d9323ed6e3f000f9e552120627`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 119 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 119 files · ~249,120 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2259 nodes · 5866 edges · 100 communities (65 shown, 22 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 435 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- AgentService
- ComputerManager
- ClaudeAgentService
- App.tsx
- transcription-service.ts
- contracts.ts
- agentic-remote-promotion-monitor
- api.ts
- registerHubRoutes
- SessionDetail
- RemoteNodeClient
- background-task-adapter.ts
- terminal-session.ts
- agent-service.ts
- bundle
- pwa.ts
- app.ts
- lib.rs
- .publish
- session-store.ts
- multi-node.test.ts
- config.rs
- TmuxTerminalSessionController
- sessionKey
- FakeSessionService
- ProviderSessionService
- devDependencies
- WorkspaceDialog
- .get
- PushNotificationService
- dependencies
- agent-service.test.ts
- session-store-providers.test.ts
- agentic-remote
- agentic-remote-promotion-setup
- terminal-session.test.ts
- scripts
- shell.ts
- .handleSessionEvent
- compilerOptions
- active-sessions.ts
- .create
- knowledge-tree.ts
- tmux-errors.test.ts
- compilerOptions
- AgentProvider
- compilerOptions
- compilerOptions
- event-log.ts
- workspace-browser.ts
- directory-browser.ts
- capture
- desktop.json
- .oxlintrc.json
- settings-local.json
- shell-notifications.ts
- background-task-tracker.ts
- promotion-monitor.test.ts
- scripts
- composerTookPaste
- bridge.rs
- package.json
- DirectoryListing
- WorkspaceListing
- UserInputFieldControl
- settings.ts
- knowledge-restore.ts
- composer-layout.test.ts
- removeComputer
- release-publication.test.ts
- MockMediaRecorder
- MermaidDiagram.tsx
- MockWebSocket
- MermaidDiagram.test.tsx
- tsconfig.json
- vite.config.ts
- ffmpeg-static
- lucide-react
- mermaid
- pdfjs-dist
- react-markdown
- remark-gfm
- ws
- zod
- sw.js
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 192 edges
2. `App()` - 156 edges
3. `AgentService` - 129 edges
4. `SessionStore` - 83 edges
5. `ClaudeAgentService` - 81 edges
6. `ComputerManager` - 67 edges
7. `RemoteNodeClient` - 55 edges
8. `SessionService` - 53 edges
9. `registerHubRoutes()` - 50 edges
10. `FakeSessionService` - 43 edges

## Surprising Connections (you probably didn't know these)
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts
- `StoredSession` --inherits--> `SessionDetail`  [EXTRACTED]
  server/session-store.ts → shared/contracts.ts
- `ActivityToolStart` --references--> `ActivityKind`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (100 total, 22 thin omitted)

### Community 0 - "App"
Cohesion: 0.05
Nodes (75): addKnowledgeRoot(), deleteKnowledgeRoot(), App(), answerUserInput(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), attachedFiles() (+67 more)

### Community 1 - "AgentService"
Cohesion: 0.05
Nodes (9): agentMode(), AgentService, isForegroundCompletionEvent(), isForegroundLifecycleEvent(), persistedFormAnswer(), RuntimeConfigurationError, statusFromEvents(), validateUserInputForm() (+1 more)

### Community 2 - "ComputerManager"
Cohesion: 0.07
Nodes (13): ComputerManager, managedSession(), RemoteSessionListing, RemoteSessionRead, sessionAtLeastAsNew(), RegisteredComputer, SessionService, ComputerSummary (+5 more)

### Community 3 - "ClaudeAgentService"
Cohesion: 0.07
Nodes (3): ClaudeAgentService, isMissingClaudeSessionError(), RuntimeModelOption

### Community 4 - "App.tsx"
Cohesion: 0.04
Nodes (56): applyAccentIcon(), configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+48 more)

### Community 5 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 6 - "contracts.ts"
Cohesion: 0.06
Nodes (34): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+26 more)

### Community 7 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (55): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+47 more)

### Community 8 - "api.ts"
Cohesion: 0.09
Nodes (49): cancelBackgroundTask(), cancelSession(), clearConversation(), deletePushSubscription(), deleteSession(), getProviderRuntimeOptions(), getPushSettings(), getRuntimeOptions() (+41 more)

### Community 9 - "registerHubRoutes"
Cohesion: 0.06
Nodes (36): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+28 more)

### Community 10 - "SessionDetail"
Cohesion: 0.11
Nodes (5): SessionStore, ChatMessage, QueuedPrompt, SessionDetail, SessionStatus

### Community 11 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (11): RemoteResync, headerSafe(), RemoteNodeClient, RemoteNodeRedirectError, RemoteNodeRequestError, client(), servers, session (+3 more)

### Community 12 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (46): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+38 more)

### Community 13 - "terminal-session.ts"
Cohesion: 0.12
Nodes (43): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), findTerminalWrappedText(), hasComposerAfter() (+35 more)

### Community 14 - "agent-service.ts"
Cohesion: 0.05
Nodes (42): ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+34 more)

### Community 15 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 16 - "pwa.ts"
Cohesion: 0.09
Nodes (36): react, directories, AppVersion, parseAppVersion(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart() (+28 more)

### Community 17 - "app.ts"
Cohesion: 0.07
Nodes (33): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), ServerRole, transcriptionComputerName() (+25 more)

### Community 18 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 19 - ".publish"
Cohesion: 0.12
Nodes (3): CopilotClientLike, isMissingSessionError(), removeCopilotSessionFiles()

### Community 20 - "session-store.ts"
Cohesion: 0.06
Nodes (24): resolveDataDirectory(), activityDuration(), activityResultPreview(), disk, fixture(), fixtures, prompt(), ready() (+16 more)

### Community 21 - "multi-node.test.ts"
Cohesion: 0.08
Nodes (14): BuildAppOptions, ComputerManagerEvents, ComputerRegistry, RegistryState, directories, directories, remoteSnapshotFixture(), temporaryDirectory() (+6 more)

### Community 22 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 23 - "TmuxTerminalSessionController"
Cohesion: 0.14
Nodes (9): copilotCommand(), execFileAsync, processCommand(), safeWindowName(), ownedStartupFixture(), TmuxTerminalSessionController, PendingPermission, PendingUserInput (+1 more)

### Community 24 - "sessionKey"
Cohesion: 0.08
Nodes (38): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), closeSelectedSession() (+30 more)

### Community 27 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 28 - "WorkspaceDialog"
Cohesion: 0.12
Nodes (29): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+21 more)

### Community 30 - "PushNotificationService"
Cohesion: 0.14
Nodes (8): brief(), HubEventSource, PushNotificationService, registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 31 - "dependencies"
Cohesion: 0.06
Nodes (31): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+23 more)

### Community 32 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (10): CopilotSessionLike, terminalFormSteps(), DeferredSession, directories, FakeCopilotClient, CopilotTaskInfo, CopilotTaskProgress, CopilotTasksApi (+2 more)

### Community 33 - "session-store-providers.test.ts"
Cohesion: 0.08
Nodes (16): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), claude(), clearFixture(), copilot() (+8 more)

### Community 34 - "agentic-remote"
Cohesion: 0.14
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 35 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 36 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (24): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), isTerminalAgentWorking(), parseTerminalUpdateNotice(), bracketedTabPane (+16 more)

### Community 37 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 38 - "shell.ts"
Cohesion: 0.15
Nodes (24): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+16 more)

### Community 39 - ".handleSessionEvent"
Cohesion: 0.20
Nodes (20): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+12 more)

### Community 40 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 41 - "active-sessions.ts"
Cohesion: 0.20
Nodes (22): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+14 more)

### Community 43 - "knowledge-tree.ts"
Cohesion: 0.16
Nodes (19): WorkspaceEntry, knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder(), openKnowledgeFolder(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder() (+11 more)

### Community 44 - "tmux-errors.test.ts"
Cohesion: 0.14
Nodes (16): listTmuxSessions(), processAncestors(), tmuxTargetForPid(), noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories (+8 more)

### Community 45 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 46 - "AgentProvider"
Cohesion: 0.16
Nodes (4): AgentProvider, ProviderRuntimeOptions, RuntimeOptions, RuntimeReasoningEffort

### Community 47 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 48 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 49 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 50 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 51 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 52 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 53 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 54 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 55 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 56 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 57 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 58 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 59 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 60 - "composerTookPaste"
Cohesion: 0.33
Nodes (11): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse() (+3 more)

### Community 61 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 62 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 65 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 66 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 67 - "knowledge-restore.ts"
Cohesion: 0.43
Nodes (3): KnowledgePosition, KnowledgeRestoreState, base

### Community 69 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 71 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

### Community 73 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **400 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+395 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 622 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `contracts.ts`, `.handleSessionEvent`, `SessionDetail`, `.create`, `agent-service.ts`, `.publish`, `.get`, `DirectoryListing`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `WorkspaceListing`, `ComputerManager`, `contracts.ts`, `AgentProvider`, `DirectoryListing`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `ComputerManager` to `WorkspaceListing`, `contracts.ts`, `RemoteNodeClient`, `AgentProvider`, `ProviderSessionService`, `DirectoryListing`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _400 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.05028305028305028 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.05261261261261261 - nodes in this community are weakly interconnected._
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
- `docs/mockups/activity-view.html`
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
