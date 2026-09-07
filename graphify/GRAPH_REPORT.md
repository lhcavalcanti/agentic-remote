# Agentic Remote - Graphify code map

Snapshot: `39319c49a1ad635219b238f0506b464e47de173f3b3d0b1dcc8b383a9d92e42f`

Source checkout: `649da6e92fda202094f6d9607990ffe8ed890d87`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 115 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 115 files · ~224,190 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2125 nodes · 5399 edges · 103 communities (67 shown, 22 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 364 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- terminal-session.ts
- App
- App.tsx
- ClaudeAgentService
- background-task-adapter.ts
- SessionDetail
- agentic-remote-promotion-monitor
- api.ts
- AgentService
- .get
- bundle
- claude-agent-service.ts
- lib.rs
- RemoteNodeClient
- shell.ts
- PushNotificationService
- config.rs
- SessionService
- pwa.ts
- ProviderSessionService
- agent-service.ts
- contracts.ts
- ManagedSession
- FakeSessionService
- devDependencies
- multi-node.test.ts
- WorkspaceDialog
- agentic-remote-promotion-setup
- dependencies
- agentic-remote
- knowledge-tree.ts
- scripts
- directory-browser.ts
- compilerOptions
- hub-routes.ts
- remote-node-client.ts
- transcription-service.ts
- NewSessionDialog
- active-sessions.ts
- .handleSessionEvent
- compilerOptions
- registerHubRoutes
- compilerOptions
- compilerOptions
- delegated-transcription-service.ts
- event-log.ts
- workspace-browser.ts
- app.ts
- agent-service.test.ts
- BackgroundTaskSnapshot
- capture
- desktop.json
- ComputerManager
- .oxlintrc.json
- settings-local.json
- TerminalSessionController
- CopilotSessionLike
- TranscriptionError
- .discoverSessions
- scripts
- TranscriptionService
- promotion-monitor.test.ts
- file-upload-routes.ts
- bridge.rs
- package.json
- claude-agent-service.test.ts
- WorkspaceListing
- UserInputFieldControl
- SessionFileUpload
- settings.ts
- knowledge-restore.ts
- api-origin.test.ts
- composer-layout.test.ts
- release-publication.test.ts
- MockMediaRecorder
- MermaidDiagram.tsx
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
10. `backgroundTasksFromEvents()` - 45 edges

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

## Communities (103 total, 22 thin omitted)

### Community 0 - "terminal-session.ts"
Cohesion: 0.05
Nodes (73): findActiveCopilotProcesses(), directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), capturePane(), cleanDialogLine() (+65 more)

### Community 1 - "App"
Cohesion: 0.05
Nodes (81): deleteKnowledgeRoot(), App(), answerUserInput(), appendComposerForKey(), appKeyDown(), applyPwaUpdate(), attachedFiles(), audioDropped() (+73 more)

### Community 2 - "App.tsx"
Cohesion: 0.04
Nodes (62): applyAccentIcon(), addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage() (+54 more)

### Community 3 - "ClaudeAgentService"
Cohesion: 0.07
Nodes (3): ClaudeAgentService, isMissingClaudeSessionError(), RuntimeModelOption

### Community 4 - "background-task-adapter.ts"
Cohesion: 0.08
Nodes (63): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+55 more)

### Community 5 - "SessionDetail"
Cohesion: 0.09
Nodes (10): activityDuration(), activityResultPreview(), cloneSession(), SessionStore, createStore(), temporaryDirectories, ChatMessage, QueuedPrompt (+2 more)

### Community 6 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (53): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+45 more)

### Community 7 - "api.ts"
Cohesion: 0.10
Nodes (48): cancelBackgroundTask(), cancelSession(), clearConversation(), deleteSession(), getProviderRuntimeOptions(), getPushSettings(), getRuntimeOptions(), getSession() (+40 more)

### Community 8 - "AgentService"
Cohesion: 0.08
Nodes (5): AgentService, isForegroundCompletionEvent(), isForegroundLifecycleEvent(), RuntimeConfigurationError, statusFromEvents()

### Community 9 - ".get"
Cohesion: 0.14
Nodes (3): agentMode(), isMissingSessionError(), removeCopilotSessionFiles()

### Community 10 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 11 - "claude-agent-service.ts"
Cohesion: 0.08
Nodes (23): AgentServiceEvents, CreationRuntime, ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError() (+15 more)

### Community 12 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 13 - "RemoteNodeClient"
Cohesion: 0.08
Nodes (7): headerSafe(), RemoteNodeClient, client(), servers, session, NodeInfo, WorkspaceFile

### Community 14 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 15 - "PushNotificationService"
Cohesion: 0.11
Nodes (13): ComputerManagerEvents, brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, registerPushRoutes() (+5 more)

### Community 16 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 18 - "pwa.ts"
Cohesion: 0.11
Nodes (32): react, deletePushSubscription(), getPushPublicKey(), savePushSubscription(), AppSettingsDialog(), checkForUpdate(), testNotification(), toggle() (+24 more)

### Community 20 - "agent-service.ts"
Cohesion: 0.08
Nodes (34): ActivePrompt, activityDuration(), activityGroupIdFor(), activityResult(), ActivityToolStart, ansiSequence, commandShortcut(), ElicitationContext (+26 more)

### Community 21 - "contracts.ts"
Cohesion: 0.07
Nodes (27): RemoteResync, RemoteSessionListing, RemoteSessionRead, normalizeNodeUrl(), ActivityStatus, AddComputerInput, AddKnowledgeRootInput, AgentMode (+19 more)

### Community 22 - "ManagedSession"
Cohesion: 0.11
Nodes (4): managedSession(), ComputerSummary, ManagedSession, SessionListing

### Community 24 - "devDependencies"
Cohesion: 0.06
Nodes (33): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+25 more)

### Community 25 - "multi-node.test.ts"
Cohesion: 0.10
Nodes (8): ComputerRegistry, RegistryState, directories, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore, StoredNodeIdentity

### Community 26 - "WorkspaceDialog"
Cohesion: 0.14
Nodes (27): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), navigateDocument(), submitSearch() (+19 more)

### Community 27 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 28 - "dependencies"
Cohesion: 0.07
Nodes (29): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+21 more)

### Community 29 - "agentic-remote"
Cohesion: 0.15
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 30 - "knowledge-tree.ts"
Cohesion: 0.12
Nodes (25): WorkspaceEntry, addKnowledgeRoot(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+17 more)

### Community 31 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 32 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 33 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 34 - "hub-routes.ts"
Cohesion: 0.09
Nodes (23): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+15 more)

### Community 35 - "remote-node-client.ts"
Cohesion: 0.09
Nodes (20): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, knowledgeFileQuerySchema (+12 more)

### Community 36 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 37 - "NewSessionDialog"
Cohesion: 0.13
Nodes (24): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+16 more)

### Community 38 - "active-sessions.ts"
Cohesion: 0.19
Nodes (22): ActiveProcess, execFileAsync, findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+14 more)

### Community 39 - ".handleSessionEvent"
Cohesion: 0.21
Nodes (19): activityKind(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isRuntimeReasoningEffort(), isUnsupportedBackgroundTaskError() (+11 more)

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 42 - "registerHubRoutes"
Cohesion: 0.18
Nodes (6): registerHubRoutes(), SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, KnowledgeRoot

### Community 43 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 44 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 45 - "delegated-transcription-service.ts"
Cohesion: 0.16
Nodes (10): collect(), DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload, MAX_AUDIO_BYTES (+2 more)

### Community 46 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 47 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 48 - "app.ts"
Cohesion: 0.18
Nodes (11): directories, buildApp(), errorStatusCode(), ServerRole, transcriptionComputerName(), port, resolveDataDirectory(), StoredSession (+3 more)

### Community 49 - "agent-service.test.ts"
Cohesion: 0.13
Nodes (7): terminalFormSteps(), DeferredSession, directories, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind, UserInputForm

### Community 50 - "BackgroundTaskSnapshot"
Cohesion: 0.20
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 51 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 52 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 53 - "ComputerManager"
Cohesion: 0.34
Nodes (3): ComputerManager, sessionAtLeastAsNew(), RegisteredComputer

### Community 54 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 55 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 57 - "CopilotSessionLike"
Cohesion: 0.17
Nodes (3): CopilotSessionLike, FakeCopilotClient, CopilotTasksApi

### Community 58 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 60 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 61 - "TranscriptionService"
Cohesion: 0.25
Nodes (5): BuildAppOptions, DelegatedTranscriptionOptions, registerTranscriptionRoutes(), transcriptionMultipartOptions, TranscriptionService

### Community 62 - "promotion-monitor.test.ts"
Cohesion: 0.31
Nodes (9): advanceMain(), calls(), Fixture, fixtures, git(), monitor(), remoteScripts(), run (+1 more)

### Community 63 - "file-upload-routes.ts"
Cohesion: 0.29
Nodes (6): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile()

### Community 64 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 65 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 66 - "claude-agent-service.test.ts"
Cohesion: 0.29
Nodes (5): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle()

### Community 68 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 70 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 71 - "knowledge-restore.ts"
Cohesion: 0.43
Nodes (3): KnowledgePosition, KnowledgeRestoreState, base

### Community 72 - "api-origin.test.ts"
Cohesion: 0.40
Nodes (4): prefixes, session, trusted, untrusted

### Community 75 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

### Community 77 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **380 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+375 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 584 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `directory-browser.ts`, `SessionFileUpload`, `claude-agent-service.ts`, `BackgroundTaskSnapshot`, `contracts.ts`, `FakeSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `directory-browser.ts`, `WorkspaceListing`, `claude-agent-service.ts`, `RemoteNodeClient`, `ProviderSessionService`, `ManagedSession`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `directory-browser.ts`, `SessionDetail`, `SessionFileUpload`, `.handleSessionEvent`, `.dispatchCommand`, `.get`, `claude-agent-service.ts`, `TerminalSessionController`, `.discoverSessions`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _380 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `terminal-session.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05175202156334232 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04991394148020654 - nodes in this community are weakly interconnected._
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
