# Agentic Remote - Graphify code map

Snapshot: `03cd69533ea7abff5fd25dfa285485187152815546bddf66d73c6a01038ef2f0`

Source checkout: `a208bc0430578a49a67b5cd19246249bda655de6`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 113 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 113 files · ~211,192 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2094 nodes · 5334 edges · 107 communities (67 shown, 25 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 364 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- terminal-session.ts
- App
- App.tsx
- ClaudeAgentService
- api.ts
- SessionDetail
- agentic-remote-promotion-monitor
- background-task-adapter.ts
- bundle
- lib.rs
- contracts.ts
- SessionService
- PushNotificationService
- config.rs
- RemoteNodeClient
- pwa.ts
- devDependencies
- claude-agent-service.ts
- ProviderSessionService
- WorkspaceDialog
- registerHubRoutes
- agentic-remote-promotion-setup
- delegated-transcription-service.ts
- dependencies
- agentic-remote
- agent-service.ts
- AgentService
- FakeSessionService
- knowledge-tree.ts
- shell.ts
- scripts
- compilerOptions
- hub-routes.ts
- transcription-service.ts
- active-sessions.ts
- .ensureLoaded
- compilerOptions
- app.ts
- ComputerManager
- compilerOptions
- compilerOptions
- .handleSessionEvent
- .publish
- NodeIdentityStore
- event-log.ts
- node-routes.ts
- KnowledgeStore
- workspace-browser.ts
- .oxlintrc.json
- agent-service.test.ts
- BackgroundTaskSnapshot
- directory-browser.ts
- CopilotSessionLike
- multi-node.test.ts
- NewSessionDialog
- capture
- desktop.json
- settings-local.json
- TerminalSessionController
- TranscriptionError
- shell-notifications.ts
- scripts
- .syncTranscripts
- file-upload-routes.ts
- promotion-monitor.test.ts
- messagesFromHistory
- bridge.rs
- package.json
- .configureRuntime
- DirectoryListing
- claude-agent-service.test.ts
- UserInputFieldControl
- SessionFileUpload
- WorkspaceListing
- settings.ts
- knowledge-restore.ts
- AgentProviderCapability
- composer-layout.test.ts
- release-publication.test.ts
- MockMediaRecorder
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
7. `RemoteNodeClient` - 53 edges
8. `SessionService` - 52 edges
9. `registerHubRoutes()` - 46 edges
10. `FakeSessionService` - 43 edges

## Surprising Connections (you probably didn't know these)
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `RemoteNodeClientEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/remote-node-client.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `ActivityToolStart` --references--> `ActivityKind`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (107 total, 25 thin omitted)

### Community 0 - "terminal-session.ts"
Cohesion: 0.05
Nodes (74): findActiveCopilotProcesses(), directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), capturePane(), cleanDialogLine() (+66 more)

### Community 1 - "App"
Cohesion: 0.05
Nodes (77): clearConversation(), moveSessionToTmux(), replyPermission(), restartSession(), transcribeAudio(), uploadSessionFile(), App(), appendComposerForKey() (+69 more)

### Community 2 - "App.tsx"
Cohesion: 0.04
Nodes (64): applyAccentIcon(), addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+56 more)

### Community 3 - "ClaudeAgentService"
Cohesion: 0.07
Nodes (3): ClaudeAgentService, isMissingClaudeSessionError(), RuntimeModelOption

### Community 4 - "api.ts"
Cohesion: 0.07
Nodes (59): cancelBackgroundTask(), cancelSession(), configureRuntime(), deleteKnowledgeRoot(), deletePushSubscription(), deleteSession(), executeCommand(), getProviderRuntimeOptions() (+51 more)

### Community 5 - "SessionDetail"
Cohesion: 0.09
Nodes (12): activityDuration(), activityResultPreview(), cloneSession(), SessionStore, StoredSession, StoredState, createStore(), temporaryDirectories (+4 more)

### Community 6 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (53): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+45 more)

### Community 7 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (43): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+35 more)

### Community 8 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 9 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 10 - "contracts.ts"
Cohesion: 0.07
Nodes (30): RemoteResync, RemoteSessionListing, RemoteSessionRead, RegistryState, StoredNodeIdentity, normalizeNodeUrl(), RemoteNodeClientEvents, ActivityStatus (+22 more)

### Community 12 - "PushNotificationService"
Cohesion: 0.11
Nodes (13): ComputerManagerEvents, brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, registerPushRoutes() (+5 more)

### Community 13 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 14 - "RemoteNodeClient"
Cohesion: 0.08
Nodes (5): headerSafe(), RemoteNodeClient, RemoteNodeRequestError, NodeInfo, WorkspaceFile

### Community 15 - "pwa.ts"
Cohesion: 0.12
Nodes (31): getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle(), mergeRuntimeModelOptions() (+23 more)

### Community 16 - "devDependencies"
Cohesion: 0.06
Nodes (33): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+25 more)

### Community 17 - "claude-agent-service.ts"
Cohesion: 0.11
Nodes (20): AgentServiceEvents, CreationRuntime, ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError() (+12 more)

### Community 19 - "WorkspaceDialog"
Cohesion: 0.13
Nodes (28): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+20 more)

### Community 20 - "registerHubRoutes"
Cohesion: 0.23
Nodes (4): managedSession(), registerHubRoutes(), ManagedSession, SessionListing

### Community 21 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 22 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (15): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+7 more)

### Community 23 - "dependencies"
Cohesion: 0.07
Nodes (29): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+21 more)

### Community 24 - "agentic-remote"
Cohesion: 0.15
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 25 - "agent-service.ts"
Cohesion: 0.08
Nodes (27): ActivePrompt, activityGroupIdFor(), ActivityToolStart, ansiSequence, commandShortcut(), ElicitationContext, ElicitationHandler, foregroundLifecycleEvents (+19 more)

### Community 28 - "knowledge-tree.ts"
Cohesion: 0.12
Nodes (25): WorkspaceEntry, addKnowledgeRoot(), listKnowledgeEntries(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+17 more)

### Community 29 - "shell.ts"
Cohesion: 0.15
Nodes (25): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+17 more)

### Community 30 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 31 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 32 - "hub-routes.ts"
Cohesion: 0.09
Nodes (23): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+15 more)

### Community 33 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 34 - "active-sessions.ts"
Cohesion: 0.19
Nodes (22): ActiveProcess, execFileAsync, findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+14 more)

### Community 37 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 38 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+5 more)

### Community 39 - "ComputerManager"
Cohesion: 0.26
Nodes (4): ComputerManager, sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 40 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 41 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 42 - ".handleSessionEvent"
Cohesion: 0.26
Nodes (15): activityKind(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isRuntimeReasoningEffort(), isUnsupportedBackgroundTaskError() (+7 more)

### Community 44 - "NodeIdentityStore"
Cohesion: 0.17
Nodes (5): ComputerRegistry, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore

### Community 45 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 46 - "node-routes.ts"
Cohesion: 0.11
Nodes (18): MAX_SESSION_FILE_BYTES, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema (+10 more)

### Community 47 - "KnowledgeStore"
Cohesion: 0.16
Nodes (5): SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, KnowledgeRoot

### Community 48 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 49 - ".oxlintrc.json"
Cohesion: 0.12
Nodes (16): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+8 more)

### Community 50 - "agent-service.test.ts"
Cohesion: 0.13
Nodes (7): terminalFormSteps(), DeferredSession, directories, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind, UserInputForm

### Community 51 - "BackgroundTaskSnapshot"
Cohesion: 0.20
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 52 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 53 - "CopilotSessionLike"
Cohesion: 0.13
Nodes (3): CopilotSessionLike, FakeCopilotClient, CopilotTasksApi

### Community 54 - "multi-node.test.ts"
Cohesion: 0.12
Nodes (3): directories, ConfigureRuntimeInput, SlashCommand

### Community 55 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+8 more)

### Community 56 - "capture"
Cohesion: 0.20
Nodes (14): releaseRecording(), shortcutKeys(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode(), keyLabel() (+6 more)

### Community 57 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 58 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 59 - "TerminalSessionController"
Cohesion: 0.19
Nodes (3): persistedFormAnswer(), validateUserInputForm(), TerminalSessionController

### Community 60 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 62 - "shell-notifications.ts"
Cohesion: 0.29
Nodes (9): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+1 more)

### Community 63 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 64 - ".syncTranscripts"
Cohesion: 0.25
Nodes (3): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents()

### Community 65 - "file-upload-routes.ts"
Cohesion: 0.25
Nodes (5): FileUploadError, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile()

### Community 66 - "promotion-monitor.test.ts"
Cohesion: 0.31
Nodes (9): advanceMain(), calls(), Fixture, fixtures, git(), monitor(), remoteScripts(), run (+1 more)

### Community 67 - "messagesFromHistory"
Cohesion: 0.24
Nodes (10): activityDuration(), activityResult(), messagesFromHistory(), previewText(), readableMcpServerName(), readableToolName(), sameToolLabel(), stripAnsi() (+2 more)

### Community 68 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 69 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 72 - "claude-agent-service.test.ts"
Cohesion: 0.25
Nodes (5): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle()

### Community 73 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 76 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 77 - "knowledge-restore.ts"
Cohesion: 0.43
Nodes (3): KnowledgePosition, KnowledgeRestoreState, base

### Community 81 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **375 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+370 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 574 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `DirectoryListing`, `contracts.ts`, `WorkspaceListing`, `SessionFileUpload`, `claude-agent-service.ts`, `BackgroundTaskSnapshot`, `multi-node.test.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `file-upload-routes.ts`, `DirectoryListing`, `WorkspaceListing`, `AgentProviderCapability`, `RemoteNodeClient`, `claude-agent-service.ts`, `ProviderSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `.syncTranscripts`, `.get`, `.ensureLoaded`, `SessionDetail`, `.configureRuntime`, `DirectoryListing`, `.handleSessionEvent`, `.publish`, `SessionFileUpload`, `AgentProviderCapability`, `CopilotSessionLike`, `TerminalSessionController`, `.publishError`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _375 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `terminal-session.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05293040293040293 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.05284810126582278 - nodes in this community are weakly interconnected._
## Non-code inventory (not semantically extracted)

- `.github/copilot-instructions.md`
- `.github/dependabot.yml`
- `.github/skills/agentic-remote-navigation/SKILL.md`
- `.github/skills/frontend-design/LICENSE.txt`
- `.github/skills/frontend-design/SKILL.md`
- `.github/skills/frontend-design/SOURCE.md`
- `.github/skills/frontend-design/references/agentic-remote.md`
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
