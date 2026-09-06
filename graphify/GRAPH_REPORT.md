# Agentic Remote - Graphify code map

Snapshot: `dab16533585ed6b0a357c204b48bd64d599d10b0ac967fa5647278c49db97d7a`

Source checkout: `55958918f6fcf558e9336accae803a646e4a58fa`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 119 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 119 files · ~257,631 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2281 nodes · 5918 edges · 99 communities (68 shown, 18 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 421 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- contracts.ts
- App.tsx
- SessionDetail
- App
- SessionStore
- api.ts
- agentic-remote-promotion-monitor
- submitMessage
- RemoteNodeClient
- .get
- background-task-adapter.ts
- bundle
- lib.rs
- ComputerManager
- PushNotificationService
- workspace-browser.ts
- config.rs
- TmuxTerminalSessionController
- SessionService
- pwa.ts
- devDependencies
- agent-service.ts
- delegated-transcription-service.ts
- ProviderSessionService
- WorkspaceDialog
- dependencies
- tmux-errors.integration.test.ts
- agentic-remote
- agentic-remote-promotion-setup
- session-store-providers.test.ts
- terminal-session.test.ts
- FakeSessionService
- parseTerminalPermission
- terminal-session.ts
- scripts
- shell.ts
- directory-browser.ts
- node-routes.ts
- compilerOptions
- .handleSessionEvent
- hub-routes.ts
- transcription-service.ts
- KnowledgeStore
- NewSessionDialog
- ComputerSummary
- tmux-errors.test.ts
- compilerOptions
- app.ts
- compilerOptions
- compilerOptions
- ComputerRegistry
- event-log.ts
- react
- agent-service.test.ts
- BackgroundTaskSnapshot
- capture
- desktop.json
- settings-local.json
- CopilotSessionLike
- TranscriptionError
- shell-notifications.ts
- promotion-monitor.test.ts
- scripts
- .syncTranscripts
- bridge.rs
- package.json
- UserInputFieldControl
- knowledge-restore.ts
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- MockMediaRecorder
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
2. `App()` - 172 edges
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
- `StoredSession` --inherits--> `SessionDetail`  [EXTRACTED]
  server/session-store.ts → shared/contracts.ts
- `SessionListing` --references--> `ManagedSession`  [EXTRACTED]
  src/api.ts → shared/contracts.ts
- `KnowledgeFolderState` --references--> `WorkspaceListing`  [EXTRACTED]
  src/knowledge-tree.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (99 total, 18 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.06
Nodes (6): agentMode(), AgentService, CopilotClientLike, isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError

### Community 1 - "contracts.ts"
Cohesion: 0.04
Nodes (55): AgentServiceEvents, CreationRuntime, ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError() (+47 more)

### Community 2 - "App.tsx"
Cohesion: 0.03
Nodes (82): applyAccentIcon(), addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage() (+74 more)

### Community 3 - "SessionDetail"
Cohesion: 0.07
Nodes (4): ClaudeAgentService, isMissingClaudeSessionError(), RuntimeModelOption, SessionDetail

### Community 4 - "App"
Cohesion: 0.05
Nodes (73): deleteKnowledgeRoot(), App(), answerUserInput(), appKeyDown(), applyComputerSnapshot(), attachedFiles(), audioDropped(), audioFileChanged() (+65 more)

### Community 5 - "SessionStore"
Cohesion: 0.05
Nodes (23): activityDuration(), activityResultPreview(), cloneSession(), DiscoveredSession, disk, fixture(), fixtures, prompt() (+15 more)

### Community 6 - "api.ts"
Cohesion: 0.08
Nodes (54): activateSession(), addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), createSession(), deletePushSubscription(), deleteSession() (+46 more)

### Community 7 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (55): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+47 more)

### Community 8 - "submitMessage"
Cohesion: 0.10
Nodes (50): activeComposerPastes(), appendComposerForKey(), clearSelectedConversation(), composerChanged(), composerPasted(), durableComposerDraft(), focusComposer(), forgetRestoredDraft() (+42 more)

### Community 9 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (9): headerSafe(), RemoteNodeClient, RemoteNodeRequestError, client(), servers, session, NodeInfo, WorkspaceFile (+1 more)

### Community 10 - ".get"
Cohesion: 0.09
Nodes (5): persistedFormAnswer(), terminalFormSteps(), validateUserInputForm(), isTerminalAgentWorking(), TerminalSessionController

### Community 11 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (43): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+35 more)

### Community 12 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 13 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 14 - "ComputerManager"
Cohesion: 0.20
Nodes (4): ComputerManager, managedSession(), registerHubRoutes(), ManagedSession

### Community 15 - "PushNotificationService"
Cohesion: 0.11
Nodes (13): ComputerManagerEvents, brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, registerPushRoutes() (+5 more)

### Community 16 - "workspace-browser.ts"
Cohesion: 0.09
Nodes (32): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+24 more)

### Community 17 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 18 - "TmuxTerminalSessionController"
Cohesion: 0.14
Nodes (9): capturePane(), copilotCommand(), execFileAsync, processCommand(), safeWindowName(), TmuxTerminalSessionController, PendingPermission, PendingUserInput (+1 more)

### Community 20 - "pwa.ts"
Cohesion: 0.11
Nodes (32): getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), testNotification(), toggle() (+24 more)

### Community 21 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 22 - "agent-service.ts"
Cohesion: 0.08
Nodes (32): ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, ansiSequence, commandShortcut(), ElicitationContext, ElicitationHandler (+24 more)

### Community 23 - "delegated-transcription-service.ts"
Cohesion: 0.10
Nodes (15): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+7 more)

### Community 25 - "WorkspaceDialog"
Cohesion: 0.13
Nodes (28): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), navigateDocument(), submitSearch() (+20 more)

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

### Community 30 - "session-store-providers.test.ts"
Cohesion: 0.08
Nodes (14): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), claude(), clearFixture(), copilot() (+6 more)

### Community 31 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (23): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), paneShowsText(), parseTerminalUpdateNotice(), bracketedTabPane (+15 more)

### Community 33 - "parseTerminalPermission"
Cohesion: 0.20
Nodes (25): activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), findTerminalWrappedText(), hasComposerAfter(), hasTerminalCommandPermissionQuestion(), isTerminalDesktopInstallPrompt() (+17 more)

### Community 34 - "terminal-session.ts"
Cohesion: 0.14
Nodes (26): COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasLiveTerminalComposer(), isTerminalChrome(), normaliseOutputLine() (+18 more)

### Community 35 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 36 - "shell.ts"
Cohesion: 0.15
Nodes (24): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+16 more)

### Community 37 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 38 - "node-routes.ts"
Cohesion: 0.09
Nodes (23): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+15 more)

### Community 39 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 40 - ".handleSessionEvent"
Cohesion: 0.21
Nodes (20): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+12 more)

### Community 41 - "hub-routes.ts"
Cohesion: 0.09
Nodes (23): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+15 more)

### Community 42 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 43 - "KnowledgeStore"
Cohesion: 0.14
Nodes (6): SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, createHub(), KnowledgeRoot

### Community 44 - "NewSessionDialog"
Cohesion: 0.14
Nodes (22): executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory() (+14 more)

### Community 45 - "ComputerSummary"
Cohesion: 0.15
Nodes (4): sessionAtLeastAsNew(), RegisteredComputer, AgentProviderCapability, ComputerSummary

### Community 46 - "tmux-errors.test.ts"
Cohesion: 0.14
Nodes (16): listTmuxSessions(), processAncestors(), tmuxTargetForPid(), noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories (+8 more)

### Community 47 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 48 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+5 more)

### Community 49 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 50 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 51 - "ComputerRegistry"
Cohesion: 0.17
Nodes (5): ComputerRegistry, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore

### Community 52 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 53 - "react"
Cohesion: 0.12
Nodes (16): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+8 more)

### Community 54 - "agent-service.test.ts"
Cohesion: 0.13
Nodes (6): DeferredSession, directories, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind, UserInputForm

### Community 55 - "BackgroundTaskSnapshot"
Cohesion: 0.20
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 56 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 57 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 58 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 59 - "CopilotSessionLike"
Cohesion: 0.17
Nodes (3): CopilotSessionLike, FakeCopilotClient, CopilotTasksApi

### Community 60 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 61 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 62 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 63 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 64 - ".syncTranscripts"
Cohesion: 0.25
Nodes (3): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents()

### Community 65 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 66 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 67 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 68 - "knowledge-restore.ts"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 69 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 72 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **407 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+402 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 627 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `copilot()` connect `session-store-providers.test.ts` to `AgentService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `.syncTranscripts`, `contracts.ts`, `directory-browser.ts`, `SessionStore`, `.handleSessionEvent`, `.get`, `ComputerSummary`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `.syncTranscripts`, `contracts.ts`, `SessionDetail`, `.get`, `session-store-providers.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _407 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.05616161616161616 - nodes in this community are weakly interconnected._
- **Should `contracts.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.042777155655095184 - nodes in this community are weakly interconnected._
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
