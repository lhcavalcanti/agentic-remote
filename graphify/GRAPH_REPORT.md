# Agentic Remote - Graphify code map

Snapshot: `48c8e68cca7149fa66325fd6463b286d0e468bf2396174689c38ea050d79e86d`

Source checkout: `073b0c2c0f322f1753b61344ce042600f0f2b763`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 116 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 116 files · ~235,674 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2199 nodes · 5674 edges · 103 communities (68 shown, 22 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 413 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App.tsx
- App
- ClaudeAgentService
- SessionStore
- AgentService
- api.ts
- agentic-remote-promotion-monitor
- ComputerManager
- RemoteNodeClient
- .get
- claude-agent-service.ts
- background-task-adapter.ts
- bundle
- lib.rs
- TmuxTerminalSessionController
- config.rs
- hub-routes.ts
- FakeSessionService
- pwa.ts
- WorkspaceDialog
- ProviderSessionService
- SessionService
- contracts.ts
- agent-service.ts
- devDependencies
- SessionDetail
- terminal-session.ts
- PushNotificationService
- session-store-providers.test.ts
- agentic-remote
- agentic-remote-promotion-setup
- agent-service.test.ts
- dependencies
- terminal-session.test.ts
- node-routes.ts
- scripts
- shell.ts
- recordValue
- knowledge-tree.ts
- compilerOptions
- transcription-service.ts
- active-sessions.ts
- NodeIdentityStore
- parseTerminalPermission
- workspace-browser.ts
- compilerOptions
- TerminalSessionController
- app.ts
- compilerOptions
- compilerOptions
- directory-browser.ts
- event-log.ts
- .oxlintrc.json
- delegated-transcription-service.ts
- NewSessionDialog
- desktop.json
- settings-local.json
- TranscriptionError
- shell-notifications.ts
- .replyUserInput
- background-task-tracker.ts
- promotion-monitor.test.ts
- scripts
- TranscriptionService
- bridge.rs
- package.json
- .readAfterWrites
- UserInputFieldControl
- settings.ts
- knowledge-restore.ts
- DirectoryListing
- SessionRuntimeInfo
- composer-layout.test.ts
- hub-routes.test.ts
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
- RuntimeConfigurationError
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 190 edges
2. `App()` - 152 edges
3. `AgentService` - 121 edges
4. `ClaudeAgentService` - 79 edges
5. `SessionStore` - 75 edges
6. `ComputerManager` - 64 edges
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
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `StoredSession` --inherits--> `SessionDetail`  [EXTRACTED]
  server/session-store.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (103 total, 22 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.03
Nodes (84): ActivityStatus, applyAccentIcon(), addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage() (+76 more)

### Community 1 - "App"
Cohesion: 0.06
Nodes (71): App(), answerUserInput(), appendComposerForKey(), appKeyDown(), attachedFiles(), audioDropped(), audioFileChanged(), clearSelectedConversation() (+63 more)

### Community 2 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (3): ClaudeAgentService, isMissingClaudeSessionError(), RuntimeModelOption

### Community 3 - "SessionStore"
Cohesion: 0.06
Nodes (26): activityDuration(), activityResultPreview(), cloneSession(), DiscoveredSession, disk, fixture(), fixtures, prompt() (+18 more)

### Community 5 - "api.ts"
Cohesion: 0.08
Nodes (55): AddKnowledgeRootInput, PushSettings, addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), deleteKnowledgeRoot(), deleteSession() (+47 more)

### Community 6 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (55): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+47 more)

### Community 7 - "ComputerManager"
Cohesion: 0.15
Nodes (7): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), ComputerSummary, ManagedSession

### Community 8 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (11): headerSafe(), RemoteNodeClient, RemoteNodeRedirectError, RemoteNodeRequestError, client(), servers, session, BackgroundTaskSnapshot (+3 more)

### Community 9 - ".get"
Cohesion: 0.11
Nodes (3): CopilotClientLike, isMissingSessionError(), removeCopilotSessionFiles()

### Community 10 - "claude-agent-service.ts"
Cohesion: 0.08
Nodes (24): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+16 more)

### Community 11 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (47): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+39 more)

### Community 12 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 13 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 14 - "TmuxTerminalSessionController"
Cohesion: 0.13
Nodes (11): findActiveCopilotProcesses(), copilotCommand(), execFileAsync, noTmuxServer(), processAncestors(), processCommand(), submitTerminalForm(), terminalChecklistState() (+3 more)

### Community 15 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 16 - "hub-routes.ts"
Cohesion: 0.07
Nodes (27): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+19 more)

### Community 18 - "pwa.ts"
Cohesion: 0.11
Nodes (33): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), testNotification() (+25 more)

### Community 19 - "WorkspaceDialog"
Cohesion: 0.11
Nodes (33): executeCommand(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage() (+25 more)

### Community 21 - "SessionService"
Cohesion: 0.11
Nodes (3): registerNodeRoutes(), SessionService, AgentProviderCapability

### Community 22 - "contracts.ts"
Cohesion: 0.08
Nodes (24): ComputerManagerEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, StoredNodeIdentity, PushSender, PushState, directories (+16 more)

### Community 23 - "agent-service.ts"
Cohesion: 0.07
Nodes (32): ActivePrompt, activityResult(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime, ElicitationContext (+24 more)

### Community 24 - "devDependencies"
Cohesion: 0.06
Nodes (33): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+25 more)

### Community 25 - "SessionDetail"
Cohesion: 0.12
Nodes (4): holdOtherWrite(), ChatMessage, SessionDetail, SessionStatus

### Community 26 - "terminal-session.ts"
Cohesion: 0.11
Nodes (32): COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasComposerAfter(), hasLiveTerminalComposer(), isTerminalChrome() (+24 more)

### Community 27 - "PushNotificationService"
Cohesion: 0.14
Nodes (8): brief(), HubEventSource, PushNotificationService, registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 28 - "session-store-providers.test.ts"
Cohesion: 0.07
Nodes (13): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), claude(), clearFixture(), copilot() (+5 more)

### Community 29 - "agentic-remote"
Cohesion: 0.14
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 30 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 31 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (9): CopilotSessionLike, DeferredSession, directories, FakeCopilotClient, CopilotTaskInfo, CopilotTaskProgress, CopilotTasksApi, BackgroundTaskKind (+1 more)

### Community 32 - "dependencies"
Cohesion: 0.07
Nodes (29): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+21 more)

### Community 33 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (24): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), paneShowsText(), parseTerminalUpdateNotice(), bracketedTabPane (+16 more)

### Community 34 - "node-routes.ts"
Cohesion: 0.09
Nodes (23): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+15 more)

### Community 35 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 36 - "shell.ts"
Cohesion: 0.15
Nodes (24): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+16 more)

### Community 37 - "recordValue"
Cohesion: 0.16
Nodes (24): activityDuration(), activityGroupIdFor(), activityKind(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isActivityGroupKind() (+16 more)

### Community 38 - "knowledge-tree.ts"
Cohesion: 0.13
Nodes (23): cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder(), openKnowledgeFile(), openKnowledgeFolder() (+15 more)

### Community 39 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 40 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 41 - "active-sessions.ts"
Cohesion: 0.21
Nodes (21): ActiveProcess, execFileAsync, findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+13 more)

### Community 42 - "NodeIdentityStore"
Cohesion: 0.15
Nodes (6): ComputerRegistry, RegistryState, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore

### Community 43 - "parseTerminalPermission"
Cohesion: 0.29
Nodes (19): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), findTerminalWrappedText(), hasTerminalCommandPermissionQuestion(), isTerminalDesktopInstallPrompt() (+11 more)

### Community 44 - "workspace-browser.ts"
Cohesion: 0.19
Nodes (17): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+9 more)

### Community 45 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 46 - "TerminalSessionController"
Cohesion: 0.13
Nodes (4): isTerminalAgentWorking(), TerminalSessionController, PendingPermission, PendingUserInput

### Community 47 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+5 more)

### Community 48 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 49 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 50 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 51 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 52 - ".oxlintrc.json"
Cohesion: 0.12
Nodes (16): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+8 more)

### Community 53 - "delegated-transcription-service.ts"
Cohesion: 0.16
Nodes (9): collect(), DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload, MAX_AUDIO_BYTES (+1 more)

### Community 54 - "NewSessionDialog"
Cohesion: 0.19
Nodes (17): activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), computerProviders(), DefaultSessionFolderControl() (+9 more)

### Community 55 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 56 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 57 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 58 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 59 - ".replyUserInput"
Cohesion: 0.20
Nodes (6): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), persistedFormAnswer(), statusFromEvents(), terminalFormSteps(), validateUserInputForm()

### Community 60 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 61 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 62 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 63 - "TranscriptionService"
Cohesion: 0.27
Nodes (5): BuildAppOptions, DelegatedTranscriptionOptions, registerTranscriptionRoutes(), transcriptionMultipartOptions, TranscriptionService

### Community 64 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 65 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 67 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 68 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 69 - "knowledge-restore.ts"
Cohesion: 0.43
Nodes (3): KnowledgePosition, KnowledgeRestoreState, base

### Community 71 - "SessionRuntimeInfo"
Cohesion: 0.40
Nodes (4): listTmuxSessions(), safeWindowName(), ownedStartupFixture(), SessionRuntimeInfo

### Community 75 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **389 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+384 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 607 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `.readAfterWrites`, `SessionStore`, `recordValue`, `.get`, `TerminalSessionController`, `directory-browser.ts`, `SessionService`, `agent-service.ts`, `SessionDetail`, `.replyUserInput`, `session-store-providers.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `RemoteNodeClient`, `claude-agent-service.ts`, `ProviderSessionService`, `DirectoryListing`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `ClaudeAgentService`, `.readAfterWrites`, `AgentService`, `.get`, `SessionDetail`, `session-store-providers.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _389 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.03157216494845361 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.06219918548685672 - nodes in this community are weakly interconnected._
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
