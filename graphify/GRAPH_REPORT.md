# Agentic Remote - Graphify code map

Snapshot: `040bbf06a0e6739be4be2cff45ae3d7d35babc805e62c3921ec78c360b2901a4`

Source checkout: `ae77cfab473a3ee8be349e6b6f34632b80644971`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 117 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 117 files · ~228,836 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2199 nodes · 5664 edges · 105 communities (67 shown, 24 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 415 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- ComputerManager
- App.tsx
- App
- contracts.ts
- ClaudeAgentService
- api.ts
- agentic-remote-promotion-monitor
- SessionStore
- SessionDetail
- background-task-adapter.ts
- bundle
- FakeSessionService
- pwa.ts
- lib.rs
- agent-service.ts
- config.rs
- SessionService
- PushNotificationService
- WorkspaceDialog
- TmuxTerminalSessionController
- devDependencies
- app.ts
- ProviderSessionService
- terminal-session.ts
- agent-service.test.ts
- agentic-remote-promotion-setup
- AgentService
- dependencies
- agentic-remote
- .get
- claude-agent-service.ts
- knowledge-tree.ts
- scripts
- shell.ts
- terminal-session.test.ts
- .publish
- session-store.ts
- compilerOptions
- .clearSerialized
- session-store-providers.test.ts
- transcription-service.ts
- active-sessions.ts
- NodeIdentityStore
- delegated-transcription-service.ts
- .handleSessionEvent
- compilerOptions
- compilerOptions
- compilerOptions
- session-reply-durability.test.ts
- event-log.ts
- workspace-browser.ts
- .oxlintrc.json
- TerminalSessionController
- NewSessionDialog
- node-routes.ts
- desktop.json
- settings-local.json
- TranscriptionError
- shell-notifications.ts
- .syncTranscripts
- composerTookPaste
- scripts
- background-task-tracker.ts
- promotion-monitor.test.ts
- session-store-durability.test.ts
- bridge.rs
- package.json
- claude-agent-service.test.ts
- UserInputFieldControl
- SessionFileUpload
- WorkspaceListing
- settings.ts
- knowledge-restore.ts
- WorkspaceFile
- AgentProviderCapability
- composer-layout.test.ts
- release-publication.test.ts
- MockMediaRecorder
- PendingUserInput
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
1. `SessionDetail` - 200 edges
2. `App()` - 152 edges
3. `AgentService` - 128 edges
4. `ClaudeAgentService` - 86 edges
5. `SessionStore` - 80 edges
6. `ComputerManager` - 64 edges
7. `RemoteNodeClient` - 55 edges
8. `SessionService` - 52 edges
9. `registerHubRoutes()` - 46 edges
10. `FakeSessionService` - 43 edges

## Surprising Connections (you probably didn't know these)
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `StoredSession` --inherits--> `SessionDetail`  [EXTRACTED]
  server/session-store.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (105 total, 24 thin omitted)

### Community 0 - "ComputerManager"
Cohesion: 0.06
Nodes (37): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema (+29 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (82): applyAccentIcon(), addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage() (+74 more)

### Community 2 - "App"
Cohesion: 0.06
Nodes (72): App(), answerUserInput(), appendComposerForKey(), appKeyDown(), attachedFiles(), audioDropped(), audioFileChanged(), clearSelectedConversation() (+64 more)

### Community 3 - "contracts.ts"
Cohesion: 0.06
Nodes (47): AgentServiceEvents, ClaudeAgentServiceEvents, ComputerManagerEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, directories (+39 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (5): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), holdOtherWrite(), RuntimeModelOption

### Community 5 - "api.ts"
Cohesion: 0.08
Nodes (53): addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), deleteKnowledgeRoot(), deleteSession(), getProviderRuntimeOptions(), getPushSettings() (+45 more)

### Community 6 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (53): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+45 more)

### Community 7 - "SessionStore"
Cohesion: 0.10
Nodes (5): cloneSession(), SessionStore, ChatMessage, QueuedPrompt, SessionStatus

### Community 8 - "SessionDetail"
Cohesion: 0.07
Nodes (9): headerSafe(), RemoteNodeClient, RemoteNodeRedirectError, RemoteNodeRequestError, client(), servers, session, NodeInfo (+1 more)

### Community 9 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (43): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+35 more)

### Community 10 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 11 - "FakeSessionService"
Cohesion: 0.07
Nodes (6): CreationRuntime, BackgroundTaskUpdate, FakeSessionService, AgentProvider, BackgroundTaskSnapshot, RuntimeReasoningEffort

### Community 12 - "pwa.ts"
Cohesion: 0.10
Nodes (36): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart() (+28 more)

### Community 13 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 14 - "agent-service.ts"
Cohesion: 0.06
Nodes (38): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, ansiSequence, commandShortcut(), ElicitationContext (+30 more)

### Community 15 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 17 - "PushNotificationService"
Cohesion: 0.12
Nodes (11): brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, registerPushRoutes(), sessionMuteSchema (+3 more)

### Community 18 - "WorkspaceDialog"
Cohesion: 0.11
Nodes (33): executeCommand(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage() (+25 more)

### Community 19 - "TmuxTerminalSessionController"
Cohesion: 0.16
Nodes (10): copilotCommand(), execFileAsync, listTmuxSessions(), noTmuxServer(), processAncestors(), processCommand(), safeWindowName(), tmuxTargetForPid() (+2 more)

### Community 20 - "devDependencies"
Cohesion: 0.06
Nodes (33): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+25 more)

### Community 21 - "app.ts"
Cohesion: 0.10
Nodes (19): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), ServerRole, DelegatedTranscriptionService (+11 more)

### Community 23 - "terminal-session.ts"
Cohesion: 0.13
Nodes (28): cleanDialogLine(), COMPOSER_PLACEHOLDERS, isTerminalChrome(), isTerminalSessionInUsePrompt(), normaliseOutputLine(), parseTerminalFolderTrust(), parseTerminalFormActiveField(), parseTerminalFormPrompt() (+20 more)

### Community 24 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (10): CopilotSessionLike, terminalFormSteps(), DeferredSession, directories, FakeCopilotClient, CopilotTaskInfo, CopilotTaskProgress, CopilotTasksApi (+2 more)

### Community 25 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 26 - "AgentService"
Cohesion: 0.12
Nodes (3): agentMode(), AgentService, RuntimeConfigurationError

### Community 27 - "dependencies"
Cohesion: 0.07
Nodes (29): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+21 more)

### Community 28 - "agentic-remote"
Cohesion: 0.15
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 30 - "claude-agent-service.ts"
Cohesion: 0.14
Nodes (19): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply, toolResultText() (+11 more)

### Community 31 - "knowledge-tree.ts"
Cohesion: 0.12
Nodes (24): WorkspaceEntry, cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder(), openKnowledgeFile() (+16 more)

### Community 32 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 33 - "shell.ts"
Cohesion: 0.15
Nodes (24): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+16 more)

### Community 34 - "terminal-session.test.ts"
Cohesion: 0.12
Nodes (23): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), isTerminalAgentWorking(), parseTerminalUpdateNotice(), bracketedTabPane (+15 more)

### Community 36 - "session-store.ts"
Cohesion: 0.10
Nodes (15): activityDuration(), activityResultPreview(), DiscoveredSession, emptyRetirements, isSessionIdList(), PendingChange, PendingMutation, SessionProjection (+7 more)

### Community 37 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 39 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+2 more)

### Community 40 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 41 - "active-sessions.ts"
Cohesion: 0.20
Nodes (22): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+14 more)

### Community 42 - "NodeIdentityStore"
Cohesion: 0.14
Nodes (7): BuildAppOptions, ComputerRegistry, RegistryState, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore

### Community 43 - "delegated-transcription-service.ts"
Cohesion: 0.14
Nodes (11): collect(), DelegatedTranscriptionOptions, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload, MAX_AUDIO_BYTES (+3 more)

### Community 44 - ".handleSessionEvent"
Cohesion: 0.26
Nodes (17): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+9 more)

### Community 45 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 47 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 48 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 49 - "session-reply-durability.test.ts"
Cohesion: 0.17
Nodes (10): answer(), claudeFixture(), claudeQuestions(), claudeRequest(), copilotFixture(), copilotRequest(), disk, fixture() (+2 more)

### Community 50 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 51 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 52 - ".oxlintrc.json"
Cohesion: 0.12
Nodes (16): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+8 more)

### Community 53 - "TerminalSessionController"
Cohesion: 0.17
Nodes (3): persistedFormAnswer(), validateUserInputForm(), TerminalSessionController

### Community 54 - "NewSessionDialog"
Cohesion: 0.19
Nodes (17): activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), computerProviders(), DefaultSessionFolderControl() (+9 more)

### Community 55 - "node-routes.ts"
Cohesion: 0.12
Nodes (15): configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, knowledgeFileQuerySchema, knowledgeQuerySchema, permissionReplySchema (+7 more)

### Community 56 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 57 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 58 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 59 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 60 - ".syncTranscripts"
Cohesion: 0.23
Nodes (3): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents()

### Community 61 - "composerTookPaste"
Cohesion: 0.29
Nodes (12): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText() (+4 more)

### Community 62 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 63 - "background-task-tracker.ts"
Cohesion: 0.35
Nodes (5): backgroundTaskSnapshot(), BackgroundTaskTracker, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 64 - "promotion-monitor.test.ts"
Cohesion: 0.31
Nodes (9): advanceMain(), calls(), Fixture, fixtures, git(), monitor(), remoteScripts(), run (+1 more)

### Community 65 - "session-store-durability.test.ts"
Cohesion: 0.27
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 66 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 67 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 68 - "claude-agent-service.test.ts"
Cohesion: 0.25
Nodes (5): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle()

### Community 69 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 72 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 73 - "knowledge-restore.ts"
Cohesion: 0.43
Nodes (3): KnowledgePosition, KnowledgeRestoreState, base

### Community 78 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **392 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+387 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 608 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `SessionDetail` to `ComputerManager`, `contracts.ts`, `SessionFileUpload`, `WorkspaceListing`, `WorkspaceFile`, `FakeSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `contracts.ts`, `WorkspaceListing`, `WorkspaceFile`, `AgentProviderCapability`, `ProviderSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `.publish`, `session-store.ts`, `ClaudeAgentService`, `SessionFileUpload`, `session-store-providers.test.ts`, `.clearSerialized`, `.suspendClaimedSession`, `agent-service.ts`, `TerminalSessionController`, `.syncTranscripts`, `.get`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _392 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ComputerManager` be split into smaller, more focused modules?**
  _Cohesion score 0.05584158415841584 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.03202687569988802 - nodes in this community are weakly interconnected._
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
