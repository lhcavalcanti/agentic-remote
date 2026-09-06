# Agentic Remote - Graphify code map

Snapshot: `deb7a5c01eb76f20109b544dbecab4b6cb943b575ec9146a883431e4a9f3e416`

Source checkout: `f308c567a9b6c1c2604bf8db33b668ed6faa5e86`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 115 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 115 files · ~216,533 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2120 nodes · 5387 edges · 99 communities (64 shown, 21 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 364 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- background-task-adapter.ts
- ClaudeAgentService
- SessionDetail
- contracts.ts
- ComputerManager
- api.ts
- agentic-remote-promotion-monitor
- computer-manager.ts
- RemoteNodeClient
- shell.ts
- AgentService
- bundle
- lib.rs
- SessionService
- PushNotificationService
- config.rs
- hub-routes.ts
- agent-service.ts
- pwa.ts
- devDependencies
- TmuxTerminalSessionController
- ProviderSessionService
- multi-node.test.ts
- FakeSessionService
- WorkspaceDialog
- agentic-remote-promotion-setup
- dependencies
- agentic-remote
- .publish
- knowledge-tree.ts
- scripts
- terminal-session.test.ts
- terminal-session.ts
- delegated-transcription-service.ts
- transcription-service.ts
- compilerOptions
- NewSessionDialog
- active-sessions.ts
- compilerOptions
- app.ts
- compilerOptions
- compilerOptions
- event-log.ts
- workspace-browser.ts
- recordValue
- .fillUserInputForm
- TerminalSessionController
- agent-service.test.ts
- directory-browser.ts
- desktop.json
- settings-local.json
- CopilotSessionLike
- file-upload-routes.ts
- TranscriptionError
- scripts
- promotion-monitor.test.ts
- .oxlintrc.json
- bridge.rs
- package.json
- SessionFileUpload
- claude-agent-service.test.ts
- plugins
- CopilotClientLike
- UserInputFieldControl
- settings.ts
- composer-layout.test.ts
- .terminalContinuationState
- release-publication.test.ts
- MockMediaRecorder
- PendingPermission
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
10. `backgroundTasksFromEvents()` - 44 edges

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

## Communities (99 total, 21 thin omitted)

### Community 0 - "App"
Cohesion: 0.05
Nodes (84): deleteKnowledgeRoot(), App(), answerUserInput(), appendComposerForKey(), appKeyDown(), applyPwaUpdate(), attachedFiles(), audioDropped() (+76 more)

### Community 1 - "App.tsx"
Cohesion: 0.04
Nodes (73): applyAccentIcon(), addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage() (+65 more)

### Community 2 - "background-task-adapter.ts"
Cohesion: 0.07
Nodes (62): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+54 more)

### Community 3 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (3): ClaudeAgentService, isMissingClaudeSessionError(), RuntimeModelOption

### Community 4 - "SessionDetail"
Cohesion: 0.08
Nodes (13): activityDuration(), activityResultPreview(), cloneSession(), DiscoveredSession, SessionStore, StoredSession, StoredState, createStore() (+5 more)

### Community 5 - "contracts.ts"
Cohesion: 0.06
Nodes (37): AgentServiceEvents, CreationRuntime, ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError() (+29 more)

### Community 6 - "ComputerManager"
Cohesion: 0.13
Nodes (9): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, ComputerSummary, ManagedSession (+1 more)

### Community 7 - "api.ts"
Cohesion: 0.09
Nodes (50): AddKnowledgeRootInput, PushSettings, cancelBackgroundTask(), cancelSession(), clearConversation(), deleteSession(), getProviderRuntimeOptions(), getPushSettings() (+42 more)

### Community 8 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (53): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+45 more)

### Community 9 - "computer-manager.ts"
Cohesion: 0.05
Nodes (33): RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, FileUploadError, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema (+25 more)

### Community 10 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (11): BackgroundTaskUpdate, headerSafe(), RemoteNodeClient, RemoteNodeRedirectError, RemoteNodeRequestError, client(), servers, session (+3 more)

### Community 11 - "shell.ts"
Cohesion: 0.08
Nodes (38): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base, attentionCount(), bridge(), decodeSegment(), method() (+30 more)

### Community 12 - "AgentService"
Cohesion: 0.09
Nodes (3): AgentService, removeCopilotSessionFiles(), RuntimeConfigurationError

### Community 13 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 14 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 15 - "SessionService"
Cohesion: 0.09
Nodes (4): registerNodeRoutes(), SessionService, WorkspaceListing, KnowledgeFolderState

### Community 16 - "PushNotificationService"
Cohesion: 0.11
Nodes (13): ComputerManagerEvents, brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, registerPushRoutes() (+5 more)

### Community 17 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 18 - "hub-routes.ts"
Cohesion: 0.07
Nodes (27): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+19 more)

### Community 19 - "agent-service.ts"
Cohesion: 0.08
Nodes (35): ActivePrompt, activityDuration(), activityGroupIdFor(), activityResult(), ActivityToolStart, ansiSequence, commandShortcut(), ElicitationContext (+27 more)

### Community 20 - "pwa.ts"
Cohesion: 0.12
Nodes (31): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), AppSettingsDialog(), checkForUpdate(), testNotification(), toggle(), mergeRuntimeModelOptions() (+23 more)

### Community 21 - "devDependencies"
Cohesion: 0.06
Nodes (33): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+25 more)

### Community 22 - "TmuxTerminalSessionController"
Cohesion: 0.17
Nodes (10): copilotCommand(), execFileAsync, listTmuxSessions(), noTmuxServer(), processAncestors(), processCommand(), safeWindowName(), tmuxTargetForPid() (+2 more)

### Community 24 - "multi-node.test.ts"
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

### Community 32 - "knowledge-tree.ts"
Cohesion: 0.12
Nodes (25): WorkspaceEntry, addKnowledgeRoot(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+17 more)

### Community 33 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 34 - "terminal-session.test.ts"
Cohesion: 0.12
Nodes (23): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), isTerminalAgentWorking(), paneShowsText(), parseTerminalUpdateNotice() (+15 more)

### Community 35 - "terminal-session.ts"
Cohesion: 0.15
Nodes (23): capturePane(), COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), isTerminalChrome(), isTerminalSessionInUsePrompt() (+15 more)

### Community 36 - "delegated-transcription-service.ts"
Cohesion: 0.12
Nodes (12): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+4 more)

### Community 37 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 38 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 39 - "NewSessionDialog"
Cohesion: 0.13
Nodes (24): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+16 more)

### Community 40 - "active-sessions.ts"
Cohesion: 0.20
Nodes (22): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+14 more)

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 42 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+5 more)

### Community 43 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 44 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 45 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 46 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 47 - "recordValue"
Cohesion: 0.27
Nodes (15): activityKind(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError(), numberValue() (+7 more)

### Community 48 - ".fillUserInputForm"
Cohesion: 0.20
Nodes (16): cleanDialogLine(), isTerminalOverlay(), parseTerminalFolderTrust(), parseTerminalFormActiveField(), parseTerminalFormPrompt(), parseTerminalPermission(), parseTerminalSessionInUse(), parseTerminalUserInput() (+8 more)

### Community 49 - "TerminalSessionController"
Cohesion: 0.15
Nodes (4): persistedFormAnswer(), validateUserInputForm(), TerminalSessionController, PendingUserInput

### Community 50 - "agent-service.test.ts"
Cohesion: 0.13
Nodes (7): terminalFormSteps(), DeferredSession, directories, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind, UserInputForm

### Community 51 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 52 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 53 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 54 - "CopilotSessionLike"
Cohesion: 0.17
Nodes (3): CopilotSessionLike, FakeCopilotClient, CopilotTasksApi

### Community 55 - "file-upload-routes.ts"
Cohesion: 0.23
Nodes (7): MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), registerTranscriptionRoutes(), transcriptionMultipartOptions

### Community 56 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 57 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 58 - "promotion-monitor.test.ts"
Cohesion: 0.31
Nodes (9): advanceMain(), calls(), Fixture, fixtures, git(), monitor(), remoteScripts(), run (+1 more)

### Community 59 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 60 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 61 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 63 - "claude-agent-service.test.ts"
Cohesion: 0.25
Nodes (5): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle()

### Community 64 - "plugins"
Cohesion: 0.29
Nodes (7): plugins, oxc, react, typescript, drawDiagram(), drawing, MermaidDiagram()

### Community 66 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 67 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 70 - ".terminalContinuationState"
Cohesion: 0.67
Nodes (3): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents()

### Community 71 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **380 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+375 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 585 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `computer-manager.ts`, `contracts.ts`, `SessionFileUpload`, `SessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `CopilotClientLike`, `SessionDetail`, `contracts.ts`, `.terminalContinuationState`, `computer-manager.ts`, `recordValue`, `TerminalSessionController`, `SessionFileUpload`, `.publish`, `.get`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `contracts.ts`, `computer-manager.ts`, `RemoteNodeClient`, `ProviderSessionService`, `SessionFileUpload`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _380 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04838278535151029 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.036662106703146374 - nodes in this community are weakly interconnected._
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
