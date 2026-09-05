# Agentic Remote - Graphify code map

Snapshot: `707fd5026f235344306dfeaf795eb1e82a96aa5140415b51b84a0f28f83d6244`

Source checkout: `7c981e83362caa1fb08e051543ea20c04c5fbd39`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 116 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 116 files · ~220,983 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2157 nodes · 5500 edges · 96 communities (64 shown, 18 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 392 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- contracts.ts
- App
- AgentService
- transcription-service.ts
- App.tsx
- ComputerManager
- api.ts
- ClaudeAgentService
- agentic-remote-promotion-monitor
- SessionDetail
- app.ts
- RemoteNodeClient
- background-task-adapter.ts
- bundle
- SessionStore
- SessionService
- lib.rs
- workspace-browser.ts
- shell.ts
- config.rs
- hub-routes.ts
- PushNotificationService
- pwa.ts
- agent-service.ts
- devDependencies
- terminal-session.ts
- ProviderSessionService
- agent-service.test.ts
- TmuxTerminalSessionController
- agentic-remote-promotion-setup
- WorkspaceDialog
- dependencies
- agentic-remote
- .ensureLoaded
- FakeSessionService
- session-store-providers.test.ts
- scripts
- NewSessionDialog
- terminal-session.test.ts
- compilerOptions
- active-sessions.ts
- NodeIdentityStore
- compilerOptions
- compilerOptions
- compilerOptions
- directory-browser.ts
- event-log.ts
- .oxlintrc.json
- recordValue
- TerminalSessionController
- BackgroundTaskSnapshot
- capture
- desktop.json
- settings-local.json
- session-store.ts
- scripts
- promotion-monitor.test.ts
- composerTookPaste
- bridge.rs
- package.json
- UserInputFieldControl
- knowledge-restore.ts
- SessionFileUpload
- settings.ts
- composer-layout.test.ts
- SessionRuntimeInfo
- removeComputer
- release-publication.test.ts
- MockMediaRecorder
- MockWebSocket
- MermaidDiagram.test.tsx
- tsconfig.json
- vite.config.ts
- @fastify/static
- lucide-react
- pdfjs-dist
- react-markdown
- remark-gfm
- web-push
- zod
- sw.js
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 189 edges
2. `App()` - 152 edges
3. `AgentService` - 118 edges
4. `ClaudeAgentService` - 79 edges
5. `SessionStore` - 72 edges
6. `ComputerManager` - 64 edges
7. `RemoteNodeClient` - 55 edges
8. `SessionService` - 52 edges
9. `registerHubRoutes()` - 46 edges
10. `FakeSessionService` - 43 edges

## Surprising Connections (you probably didn't know these)
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `StoredSession` --inherits--> `SessionDetail`  [EXTRACTED]
  server/session-store.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `ActivityToolStart` --references--> `ActivityKind`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (96 total, 18 thin omitted)

### Community 0 - "contracts.ts"
Cohesion: 0.04
Nodes (54): AgentServiceEvents, CreationRuntime, ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError() (+46 more)

### Community 1 - "App"
Cohesion: 0.05
Nodes (82): addKnowledgeRoot(), clearConversation(), replyPermission(), restartSession(), resumeSession(), suspendSession(), App(), appendComposerForKey() (+74 more)

### Community 2 - "AgentService"
Cohesion: 0.08
Nodes (6): agentMode(), AgentService, isForegroundCompletionEvent(), isForegroundLifecycleEvent(), RuntimeConfigurationError, statusFromEvents()

### Community 3 - "transcription-service.ts"
Cohesion: 0.05
Nodes (36): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+28 more)

### Community 4 - "App.tsx"
Cohesion: 0.04
Nodes (53): applyAccentIcon(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+45 more)

### Community 5 - "ComputerManager"
Cohesion: 0.11
Nodes (11): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, normalizeNodeUrl(), AddComputerInput (+3 more)

### Community 6 - "api.ts"
Cohesion: 0.07
Nodes (56): AddKnowledgeRootInput, PushSettings, cancelBackgroundTask(), cancelSession(), configureRuntime(), deleteKnowledgeRoot(), deleteSession(), getPushSettings() (+48 more)

### Community 7 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (7): ClaudeAgentService, ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), RuntimeModelOption

### Community 8 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (53): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+45 more)

### Community 9 - "SessionDetail"
Cohesion: 0.10
Nodes (5): isMissingClaudeSessionError(), ChatMessage, QueuedPrompt, SessionDetail, SessionStatus

### Community 10 - "app.ts"
Cohesion: 0.06
Nodes (36): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+28 more)

### Community 11 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (11): headerSafe(), RemoteNodeClient, RemoteNodeRedirectError, RemoteNodeRequestError, client(), servers, session, NodeInfo (+3 more)

### Community 12 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (43): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+35 more)

### Community 13 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 14 - "SessionStore"
Cohesion: 0.10
Nodes (8): cloneSession(), fixture(), PendingMutation, fixture(), terminalClearFixture(), SessionStore, createStore(), temporaryDirectories

### Community 15 - "SessionService"
Cohesion: 0.09
Nodes (3): registerNodeRoutes(), SessionService, AgentProviderCapability

### Community 16 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 17 - "workspace-browser.ts"
Cohesion: 0.09
Nodes (33): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+25 more)

### Community 18 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 19 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 20 - "hub-routes.ts"
Cohesion: 0.07
Nodes (27): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+19 more)

### Community 21 - "PushNotificationService"
Cohesion: 0.12
Nodes (11): brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, registerPushRoutes(), sessionMuteSchema (+3 more)

### Community 22 - "pwa.ts"
Cohesion: 0.11
Nodes (33): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+25 more)

### Community 23 - "agent-service.ts"
Cohesion: 0.08
Nodes (35): ActivePrompt, activityDuration(), activityGroupIdFor(), activityResult(), ansiSequence, commandShortcut(), ElicitationContext, ElicitationHandler (+27 more)

### Community 24 - "devDependencies"
Cohesion: 0.06
Nodes (33): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+25 more)

### Community 25 - "terminal-session.ts"
Cohesion: 0.13
Nodes (28): cleanDialogLine(), COMPOSER_PLACEHOLDERS, isTerminalAgentWorking(), isTerminalChrome(), isTerminalOverlay(), isTerminalSessionInUsePrompt(), normaliseOutputLine(), parseTerminalFolderTrust() (+20 more)

### Community 27 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (10): CopilotSessionLike, terminalFormSteps(), DeferredSession, directories, FakeCopilotClient, CopilotTaskInfo, CopilotTaskProgress, CopilotTasksApi (+2 more)

### Community 28 - "TmuxTerminalSessionController"
Cohesion: 0.18
Nodes (8): capturePane(), copilotCommand(), execFileAsync, noTmuxServer(), processAncestors(), processCommand(), tmuxTargetForPid(), TmuxTerminalSessionController

### Community 29 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 30 - "WorkspaceDialog"
Cohesion: 0.14
Nodes (26): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), navigateDocument(), BreadcrumbSegment (+18 more)

### Community 31 - "dependencies"
Cohesion: 0.07
Nodes (29): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+21 more)

### Community 32 - "agentic-remote"
Cohesion: 0.15
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 33 - ".ensureLoaded"
Cohesion: 0.10
Nodes (3): CopilotClientLike, isMissingSessionError(), removeCopilotSessionFiles()

### Community 35 - "session-store-providers.test.ts"
Cohesion: 0.08
Nodes (14): disk, fixtures, prompt(), releases, session(), claude(), clearFixture(), copilot() (+6 more)

### Community 36 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 38 - "NewSessionDialog"
Cohesion: 0.12
Nodes (26): activateSession(), createSession(), executeCommand(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory(), AddKnowledgeRootDialog() (+18 more)

### Community 39 - "terminal-session.test.ts"
Cohesion: 0.13
Nodes (22): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), parseTerminalUpdateNotice(), bracketedTabPane, clearFixture() (+14 more)

### Community 40 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 41 - "active-sessions.ts"
Cohesion: 0.20
Nodes (22): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+14 more)

### Community 42 - "NodeIdentityStore"
Cohesion: 0.15
Nodes (6): ComputerRegistry, RegistryState, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore

### Community 43 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 44 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 45 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 46 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 47 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 48 - ".oxlintrc.json"
Cohesion: 0.12
Nodes (16): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+8 more)

### Community 49 - "recordValue"
Cohesion: 0.27
Nodes (15): activityKind(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError(), numberValue() (+7 more)

### Community 50 - "TerminalSessionController"
Cohesion: 0.14
Nodes (5): persistedFormAnswer(), validateUserInputForm(), TerminalSessionController, PendingPermission, PendingUserInput

### Community 51 - "BackgroundTaskSnapshot"
Cohesion: 0.20
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 52 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 53 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 54 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 55 - "session-store.ts"
Cohesion: 0.15
Nodes (11): ActivityToolStart, activityDuration(), activityResultPreview(), DiscoveredSession, PendingChange, SessionProjection, SessionReplacementCleanupError, StoredSession (+3 more)

### Community 56 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 57 - "promotion-monitor.test.ts"
Cohesion: 0.31
Nodes (9): advanceMain(), calls(), Fixture, fixtures, git(), monitor(), remoteScripts(), run (+1 more)

### Community 58 - "composerTookPaste"
Cohesion: 0.33
Nodes (11): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse() (+3 more)

### Community 59 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 60 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 61 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 62 - "knowledge-restore.ts"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 64 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 66 - "SessionRuntimeInfo"
Cohesion: 0.50
Nodes (3): listTmuxSessions(), safeWindowName(), SessionRuntimeInfo

### Community 67 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 69 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **386 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+381 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 600 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `contracts.ts`, `BackgroundTaskSnapshot`, `ComputerManager`, `SessionFileUpload`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `contracts.ts`, `ProviderSessionService`, `RemoteNodeClient`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `.ensureLoaded`, `.get`, `SessionDetail`, `SessionStore`, `directory-browser.ts`, `SessionService`, `recordValue`, `TerminalSessionController`, `terminal-session.ts`, `SessionFileUpload`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _386 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `contracts.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.04488078541374474 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.050140056022408966 - nodes in this community are weakly interconnected._
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
