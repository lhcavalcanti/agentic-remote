# Agentic Remote - Graphify code map

Snapshot: `24b0567d8533b78f59df4eff45f2da31020dedfb6d279e9a5822784089ae5f9e`

Source checkout: `15e4f315413884f4114b42531d06306943636e98`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 115 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 115 files · ~213,665 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2114 nodes · 5372 edges · 97 communities (63 shown, 20 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 364 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- ComputerManager
- App
- AgentService
- background-task-adapter.ts
- ClaudeAgentService
- App.tsx
- SessionDetail
- transcription-service.ts
- agentic-remote-promotion-monitor
- api.ts
- RemoteNodeClient
- contracts.ts
- bundle
- agent-service.ts
- lib.rs
- TerminalSessionController
- claude-agent-service.ts
- config.rs
- pwa.ts
- shell.ts
- PushNotificationService
- devDependencies
- app.ts
- TmuxTerminalSessionController
- ProviderSessionService
- WorkspaceDialog
- multi-node.test.ts
- FakeSessionService
- agentic-remote-promotion-setup
- dependencies
- agentic-remote
- knowledge-tree.ts
- terminal-session.test.ts
- scripts
- node-routes.ts
- terminal-session.ts
- compilerOptions
- hub-routes.ts
- NewSessionDialog
- active-sessions.ts
- .get
- compilerOptions
- .handleSessionEvent
- compilerOptions
- compilerOptions
- directory-browser.ts
- event-log.ts
- workspace-browser.ts
- agent-service.test.ts
- .fillUserInputForm
- capture
- desktop.json
- .oxlintrc.json
- settings-local.json
- CopilotSessionLike
- scripts
- promotion-monitor.test.ts
- bridge.rs
- package.json
- claude-agent-service.test.ts
- UserInputFieldControl
- settings.ts
- knowledge-restore.ts
- composer-layout.test.ts
- removeComputer
- release-publication.test.ts
- MockMediaRecorder
- MermaidDiagram.tsx
- PendingPermission
- PendingUserInput
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
1. `SessionDetail` - 182 edges
2. `App()` - 152 edges
3. `AgentService` - 111 edges
4. `ClaudeAgentService` - 77 edges
5. `ComputerManager` - 64 edges
6. `SessionStore` - 60 edges
7. `RemoteNodeClient` - 55 edges
8. `SessionService` - 52 edges
9. `registerHubRoutes()` - 46 edges
10. `FakeSessionService` - 43 edges

## Surprising Connections (you probably didn't know these)
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts
- `ActivityToolStart` --references--> `ActivityKind`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `ClaudeAgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (97 total, 20 thin omitted)

### Community 0 - "ComputerManager"
Cohesion: 0.07
Nodes (12): ComputerManager, managedSession(), RemoteSessionListing, sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, registerNodeRoutes() (+4 more)

### Community 1 - "App"
Cohesion: 0.05
Nodes (83): replyPermission(), App(), answerUserInput(), appendComposerForKey(), appKeyDown(), attachedFiles(), audioDropped(), audioFileChanged() (+75 more)

### Community 2 - "AgentService"
Cohesion: 0.08
Nodes (5): AgentService, isForegroundCompletionEvent(), isForegroundLifecycleEvent(), RuntimeConfigurationError, statusFromEvents()

### Community 3 - "background-task-adapter.ts"
Cohesion: 0.08
Nodes (61): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+53 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.07
Nodes (3): ClaudeAgentService, isMissingClaudeSessionError(), RuntimeModelOption

### Community 5 - "App.tsx"
Cohesion: 0.04
Nodes (56): applyAccentIcon(), configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+48 more)

### Community 6 - "SessionDetail"
Cohesion: 0.07
Nodes (15): resolveDataDirectory(), activityDuration(), activityResultPreview(), cloneSession(), DiscoveredSession, safeUploadName(), SessionStore, StoredSession (+7 more)

### Community 7 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+27 more)

### Community 8 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (53): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+45 more)

### Community 9 - "api.ts"
Cohesion: 0.09
Nodes (49): cancelBackgroundTask(), cancelSession(), clearConversation(), deleteKnowledgeRoot(), deleteSession(), getProviderRuntimeOptions(), getPushSettings(), getRuntimeOptions() (+41 more)

### Community 10 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (11): RemoteNodeClient, RemoteNodeRedirectError, RemoteNodeRequestError, client(), servers, session, BackgroundTaskSnapshot, NodeInfo (+3 more)

### Community 11 - "contracts.ts"
Cohesion: 0.07
Nodes (28): ComputerManagerEvents, RemoteResync, RemoteSessionRead, directories, headerSafe(), normalizeNodeUrl(), REDIRECT_STATUSES, ActivityStatus (+20 more)

### Community 12 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 13 - "agent-service.ts"
Cohesion: 0.06
Nodes (41): ActivePrompt, activityDuration(), activityGroupIdFor(), activityResult(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+33 more)

### Community 14 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 15 - "TerminalSessionController"
Cohesion: 0.07
Nodes (7): agentMode(), CopilotClientLike, isMissingSessionError(), persistedFormAnswer(), removeCopilotSessionFiles(), validateUserInputForm(), TerminalSessionController

### Community 16 - "claude-agent-service.ts"
Cohesion: 0.09
Nodes (21): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+13 more)

### Community 17 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 18 - "pwa.ts"
Cohesion: 0.11
Nodes (34): react, deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+26 more)

### Community 19 - "shell.ts"
Cohesion: 0.10
Nodes (31): bridge(), decodeSegment(), method(), key(), label(), NotifiableSession, notificationState(), requestId() (+23 more)

### Community 20 - "PushNotificationService"
Cohesion: 0.13
Nodes (10): brief(), HubEventSource, PushNotificationService, PushSender, PushState, registerPushRoutes(), sessionMuteSchema, subscriptionSchema (+2 more)

### Community 21 - "devDependencies"
Cohesion: 0.06
Nodes (33): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+25 more)

### Community 22 - "app.ts"
Cohesion: 0.10
Nodes (17): prefixes, session, trusted, untrusted, directories, buildApp(), BuildAppOptions, errorStatusCode() (+9 more)

### Community 23 - "TmuxTerminalSessionController"
Cohesion: 0.17
Nodes (10): copilotCommand(), execFileAsync, listTmuxSessions(), noTmuxServer(), processAncestors(), processCommand(), safeWindowName(), tmuxTargetForPid() (+2 more)

### Community 25 - "WorkspaceDialog"
Cohesion: 0.13
Nodes (28): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+20 more)

### Community 26 - "multi-node.test.ts"
Cohesion: 0.10
Nodes (8): ComputerRegistry, RegistryState, directories, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore, StoredNodeIdentity

### Community 28 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 29 - "dependencies"
Cohesion: 0.07
Nodes (29): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+21 more)

### Community 30 - "agentic-remote"
Cohesion: 0.15
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 31 - "knowledge-tree.ts"
Cohesion: 0.12
Nodes (25): WorkspaceEntry, addKnowledgeRoot(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+17 more)

### Community 32 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (24): findActiveCopilotProcesses(), directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), isTerminalAgentWorking(), paneShowsText() (+16 more)

### Community 33 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 34 - "node-routes.ts"
Cohesion: 0.09
Nodes (23): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+15 more)

### Community 35 - "terminal-session.ts"
Cohesion: 0.15
Nodes (23): capturePane(), COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), isTerminalChrome(), isTerminalSessionInUsePrompt() (+15 more)

### Community 36 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 37 - "hub-routes.ts"
Cohesion: 0.09
Nodes (23): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+15 more)

### Community 38 - "NewSessionDialog"
Cohesion: 0.14
Nodes (23): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+15 more)

### Community 39 - "active-sessions.ts"
Cohesion: 0.21
Nodes (21): ActiveProcess, execFileAsync, findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+13 more)

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 42 - ".handleSessionEvent"
Cohesion: 0.26
Nodes (16): activityKind(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isRuntimeReasoningEffort(), isUnsupportedBackgroundTaskError() (+8 more)

### Community 43 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 44 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 45 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 46 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 47 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 48 - "agent-service.test.ts"
Cohesion: 0.13
Nodes (7): terminalFormSteps(), DeferredSession, directories, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind, UserInputForm

### Community 49 - ".fillUserInputForm"
Cohesion: 0.21
Nodes (15): cleanDialogLine(), parseTerminalFolderTrust(), parseTerminalFormActiveField(), parseTerminalFormPrompt(), parseTerminalPermission(), parseTerminalSessionInUse(), parseTerminalUserInput(), submitTerminalForm() (+7 more)

### Community 50 - "capture"
Cohesion: 0.20
Nodes (14): releaseRecording(), shortcutKeys(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode(), keyLabel() (+6 more)

### Community 51 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 52 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 53 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 54 - "CopilotSessionLike"
Cohesion: 0.17
Nodes (3): CopilotSessionLike, FakeCopilotClient, CopilotTasksApi

### Community 55 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 56 - "promotion-monitor.test.ts"
Cohesion: 0.31
Nodes (9): advanceMain(), calls(), Fixture, fixtures, git(), monitor(), remoteScripts(), run (+1 more)

### Community 57 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 58 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 59 - "claude-agent-service.test.ts"
Cohesion: 0.25
Nodes (5): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle()

### Community 60 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 61 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 62 - "knowledge-restore.ts"
Cohesion: 0.43
Nodes (3): KnowledgePosition, KnowledgeRestoreState, base

### Community 64 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 67 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

### Community 69 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **380 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+375 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 583 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `contracts.ts`, `claude-agent-service.ts`, `FakeSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `ComputerManager` to `ProviderSessionService`, `claude-agent-service.ts`, `.start`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `.get`, `.handleSessionEvent`, `directory-browser.ts`, `TerminalSessionController`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _380 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ComputerManager` be split into smaller, more focused modules?**
  _Cohesion score 0.0665842094413523 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.048700410396716826 - nodes in this community are weakly interconnected._
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
