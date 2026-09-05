# Agentic Remote - Graphify code map

Snapshot: `28d390044afc00e60646cadfb422cd96bfb4fe63671ba18dd8d36e8e54264b5d`

Source checkout: `c28d321e37910c8c158a388c1f90efefdb4a9e5b`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 119 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 119 files · ~240,916 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2227 nodes · 5742 edges · 101 communities (70 shown, 18 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 418 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- contracts.ts
- AgentService
- App.tsx
- SessionDetail
- ClaudeAgentService
- agentic-remote-promotion-monitor
- api.ts
- hub-routes.ts
- background-task-adapter.ts
- bundle
- ComputerManager
- lib.rs
- RemoteNodeClient
- shell.ts
- PushNotificationService
- config.rs
- pwa.ts
- TmuxTerminalSessionController
- FakeSessionService
- ProviderSessionService
- devDependencies
- multi-node.test.ts
- SessionService
- WorkspaceDialog
- agent-service.ts
- dependencies
- tmux-errors.integration.test.ts
- agentic-remote
- agentic-remote-promotion-setup
- .get
- agent-service.test.ts
- terminal-session.test.ts
- parseTerminalPermission
- session-store-providers.test.ts
- terminal-session.ts
- scripts
- TerminalSessionController
- NewSessionDialog
- compilerOptions
- node-routes.ts
- transcription-service.ts
- knowledge-tree.ts
- .syncTranscripts
- tmux-errors.test.ts
- compilerOptions
- app.ts
- compilerOptions
- compilerOptions
- delegated-transcription-service.ts
- event-log.ts
- workspace-browser.ts
- directory-browser.ts
- BackgroundTaskSnapshot
- ComputerSummary
- desktop.json
- .oxlintrc.json
- settings-local.json
- TranscriptionService
- TranscriptionError
- promotion-monitor.test.ts
- scripts
- bridge.rs
- package.json
- session-store-durability.test.ts
- claude-agent-service.test.ts
- UserInputFieldControl
- settings.ts
- knowledge-restore.ts
- .reconcileRuntimeStatus
- composer-layout.test.ts
- removeComputer
- release-publication.test.ts
- MockMediaRecorder
- MermaidDiagram.tsx
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
1. `SessionDetail` - 189 edges
2. `App()` - 156 edges
3. `AgentService` - 123 edges
4. `ClaudeAgentService` - 81 edges
5. `SessionStore` - 76 edges
6. `ComputerManager` - 67 edges
7. `RemoteNodeClient` - 55 edges
8. `SessionService` - 53 edges
9. `registerHubRoutes()` - 50 edges
10. `FakeSessionService` - 43 edges

## Surprising Connections (you probably didn't know these)
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `KnowledgeFolderState` --references--> `WorkspaceListing`  [EXTRACTED]
  src/knowledge-tree.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `ActivityToolStart` --references--> `ActivityKind`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (101 total, 18 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (91): addKnowledgeRoot(), clearConversation(), deleteKnowledgeRoot(), readKnowledgeFile(), replyPermission(), restartSession(), transcribeAudio(), uploadSessionFile() (+83 more)

### Community 1 - "contracts.ts"
Cohesion: 0.04
Nodes (55): AgentServiceEvents, CreationRuntime, ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError() (+47 more)

### Community 2 - "AgentService"
Cohesion: 0.06
Nodes (6): AgentService, isMissingSessionError(), isRuntimeReasoningEffort(), permissionTitle(), removeCopilotSessionFiles(), RuntimeConfigurationError

### Community 3 - "App.tsx"
Cohesion: 0.04
Nodes (67): applyAccentIcon(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+59 more)

### Community 4 - "SessionDetail"
Cohesion: 0.07
Nodes (20): normalizedTitle(), activityDuration(), activityResultPreview(), cloneSession(), DiscoveredSession, PendingChange, PendingMutation, fixture() (+12 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.07
Nodes (3): ClaudeAgentService, isMissingClaudeSessionError(), RuntimeModelOption

### Community 6 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (55): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+47 more)

### Community 7 - "api.ts"
Cohesion: 0.08
Nodes (48): cancelBackgroundTask(), cancelSession(), configureRuntime(), deleteSession(), getPushSettings(), getRuntimeOptions(), getSession(), listBackgroundTasks() (+40 more)

### Community 8 - "hub-routes.ts"
Cohesion: 0.06
Nodes (29): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+21 more)

### Community 9 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (43): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+35 more)

### Community 10 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 11 - "ComputerManager"
Cohesion: 0.19
Nodes (5): ComputerManager, managedSession(), registerHubRoutes(), ManagedSession, SessionListing

### Community 12 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 13 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (8): headerSafe(), RemoteNodeClient, RemoteNodeRequestError, client(), servers, session, WorkspaceFile, WorkspaceListing

### Community 14 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 15 - "PushNotificationService"
Cohesion: 0.11
Nodes (13): ComputerManagerEvents, brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, registerPushRoutes() (+5 more)

### Community 16 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 17 - "pwa.ts"
Cohesion: 0.11
Nodes (34): react, deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+26 more)

### Community 18 - "TmuxTerminalSessionController"
Cohesion: 0.14
Nodes (9): capturePane(), copilotCommand(), execFileAsync, processCommand(), safeWindowName(), TmuxTerminalSessionController, PendingPermission, PendingUserInput (+1 more)

### Community 19 - "FakeSessionService"
Cohesion: 0.08
Nodes (3): FakeSessionService, safeUploadName(), SessionFileUpload

### Community 21 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 22 - "multi-node.test.ts"
Cohesion: 0.09
Nodes (9): ComputerRegistry, RegistryState, directories, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore, StoredNodeIdentity (+1 more)

### Community 24 - "WorkspaceDialog"
Cohesion: 0.13
Nodes (29): searchWorkspace(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), navigateDocument() (+21 more)

### Community 25 - "agent-service.ts"
Cohesion: 0.08
Nodes (31): ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, ansiSequence, ElicitationContext, ElicitationHandler, foregroundLifecycleEvents (+23 more)

### Community 26 - "dependencies"
Cohesion: 0.06
Nodes (31): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+23 more)

### Community 27 - "tmux-errors.integration.test.ts"
Cohesion: 0.14
Nodes (29): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+21 more)

### Community 28 - "agentic-remote"
Cohesion: 0.14
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 29 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 30 - ".get"
Cohesion: 0.16
Nodes (3): commandShortcut(), stripAnsi(), isTerminalAgentWorking()

### Community 31 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (9): CopilotSessionLike, DeferredSession, directories, FakeCopilotClient, CopilotTaskInfo, CopilotTaskProgress, CopilotTasksApi, BackgroundTaskKind (+1 more)

### Community 32 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (23): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), paneShowsText(), parseTerminalUpdateNotice(), bracketedTabPane (+15 more)

### Community 33 - "parseTerminalPermission"
Cohesion: 0.20
Nodes (25): activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), findTerminalWrappedText(), hasComposerAfter(), hasTerminalCommandPermissionQuestion(), isTerminalDesktopInstallPrompt() (+17 more)

### Community 34 - "session-store-providers.test.ts"
Cohesion: 0.09
Nodes (9): CopilotClientLike, claude(), clearFixture(), copilot(), disk, event(), fixtures, releases (+1 more)

### Community 35 - "terminal-session.ts"
Cohesion: 0.14
Nodes (26): COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasLiveTerminalComposer(), isTerminalChrome(), normaliseOutputLine() (+18 more)

### Community 36 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 37 - "TerminalSessionController"
Cohesion: 0.10
Nodes (6): agentMode(), persistedFormAnswer(), terminalFormSteps(), validateUserInputForm(), TerminalSessionController, ConfigureRuntimeInput

### Community 38 - "NewSessionDialog"
Cohesion: 0.12
Nodes (26): activateSession(), createSession(), executeCommand(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory(), AddKnowledgeRootDialog() (+18 more)

### Community 39 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 40 - "node-routes.ts"
Cohesion: 0.10
Nodes (21): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), configureRuntimeSchema, createSessionSchema (+13 more)

### Community 41 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 42 - "knowledge-tree.ts"
Cohesion: 0.14
Nodes (21): WorkspaceEntry, listKnowledgeEntries(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder(), openKnowledgeFolder(), toggleKnowledgeFolder(), collapseKnowledgeFolder() (+13 more)

### Community 43 - ".syncTranscripts"
Cohesion: 0.25
Nodes (16): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+8 more)

### Community 44 - "tmux-errors.test.ts"
Cohesion: 0.14
Nodes (16): listTmuxSessions(), processAncestors(), tmuxTargetForPid(), noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories (+8 more)

### Community 45 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 46 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+5 more)

### Community 47 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 48 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 49 - "delegated-transcription-service.ts"
Cohesion: 0.16
Nodes (10): collect(), DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload, MAX_AUDIO_BYTES (+2 more)

### Community 50 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 51 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 52 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 53 - "BackgroundTaskSnapshot"
Cohesion: 0.22
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 55 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 56 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 57 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 58 - "TranscriptionService"
Cohesion: 0.22
Nodes (5): BuildAppOptions, DelegatedTranscriptionOptions, registerTranscriptionRoutes(), transcriptionMultipartOptions, TranscriptionService

### Community 59 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 60 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 61 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 62 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 63 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 64 - "session-store-durability.test.ts"
Cohesion: 0.28
Nodes (6): disk, fixture(), fixtures, prompt(), releases, session()

### Community 65 - "claude-agent-service.test.ts"
Cohesion: 0.25
Nodes (5): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle()

### Community 66 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 67 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 68 - "knowledge-restore.ts"
Cohesion: 0.43
Nodes (3): KnowledgePosition, KnowledgeRestoreState, base

### Community 69 - ".reconcileRuntimeStatus"
Cohesion: 0.60
Nodes (3): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents()

### Community 71 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 73 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

### Community 75 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **397 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+392 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 616 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `copilot()` connect `session-store-providers.test.ts` to `AgentService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `contracts.ts`, `session-store-providers.test.ts`, `SessionDetail`, `TerminalSessionController`, `.reconcileRuntimeStatus`, `.syncTranscripts`, `FakeSessionService`, `.get`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `session-store-providers.test.ts`, `ClaudeAgentService`, `FakeSessionService`, `.get`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _397 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04438343628460307 - nodes in this community are weakly interconnected._
- **Should `contracts.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.042044911610129 - nodes in this community are weakly interconnected._
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
