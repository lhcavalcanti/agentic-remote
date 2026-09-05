# Agentic Remote - Graphify code map

Snapshot: `a24986b41e5b6b8d6f9c4fc77f8bace4c95c3fffb22b8eb967535d674c03169e`

Source checkout: `e05b28b12b7e31d0b192783a3ef4f77b25fce037`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 116 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 116 files · ~222,152 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2162 nodes · 5529 edges · 95 communities (65 shown, 16 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 393 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- contracts.ts
- ClaudeAgentService
- app.ts
- SessionStore
- App.tsx
- AgentService
- RemoteNodeClient
- agentic-remote-promotion-monitor
- App.test.tsx
- ComputerManager
- background-task-adapter.ts
- bundle
- pwa.ts
- hub-routes.ts
- lib.rs
- transcription-service.ts
- shell.ts
- agent-service.ts
- config.rs
- .publish
- WorkspaceDialog
- FakeSessionService
- TmuxTerminalSessionController
- SessionDetail
- ProviderSessionService
- workspace-browser.ts
- devDependencies
- PushNotificationService
- agentic-remote-promotion-setup
- terminal-session.ts
- dependencies
- agentic-remote
- multi-node.test.ts
- SessionService
- terminal-session.test.ts
- scripts
- session-store-providers.test.ts
- directory-browser.ts
- compilerOptions
- active-sessions.ts
- compilerOptions
- recordValue
- compilerOptions
- compilerOptions
- agent-service.test.ts
- event-log.ts
- NewSessionDialog
- TerminalSessionController
- capture
- knowledgePathChain
- desktop.json
- .send
- settings-local.json
- CopilotSessionLike
- background-task-tracker.ts
- scripts
- promotion-monitor.test.ts
- .oxlintrc.json
- bridge.rs
- deleteSession
- package.json
- claude-agent-service.test.ts
- plugins
- UserInputFieldControl
- knowledge-restore.ts
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
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

## Communities (95 total, 16 thin omitted)

### Community 0 - "App"
Cohesion: 0.05
Nodes (82): moveSessionToTmux(), replyPermission(), replyUserInput(), resumeSession(), setSessionNotificationsMuted(), suspendSession(), App(), answerUserInput() (+74 more)

### Community 1 - "contracts.ts"
Cohesion: 0.07
Nodes (47): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, PendingClaudeInput, PendingClaudePermission, ComputerManagerEvents (+39 more)

### Community 2 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (5): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), toolResultText(), RuntimeModelOption

### Community 3 - "app.ts"
Cohesion: 0.05
Nodes (44): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), ServerRole (+36 more)

### Community 4 - "SessionStore"
Cohesion: 0.06
Nodes (26): activityDuration(), activityResultPreview(), cloneSession(), DiscoveredSession, disk, fixture(), fixtures, prompt() (+18 more)

### Community 5 - "App.tsx"
Cohesion: 0.04
Nodes (53): ActivityStatus, applyAccentIcon(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+45 more)

### Community 6 - "AgentService"
Cohesion: 0.07
Nodes (6): agentMode(), AgentService, isMissingSessionError(), isRuntimeReasoningEffort(), RuntimeConfigurationError, forgetSessionEvents()

### Community 7 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (12): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, RemoteNodeRedirectError, RemoteNodeRequestError, client(), servers (+4 more)

### Community 8 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (53): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+45 more)

### Community 9 - "App.test.tsx"
Cohesion: 0.06
Nodes (42): cancelBackgroundTask(), cancelSession(), clearConversation(), configureRuntime(), getProviderRuntimeOptions(), getPushSettings(), getRuntimeOptions(), getSession() (+34 more)

### Community 10 - "ComputerManager"
Cohesion: 0.15
Nodes (7): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), ComputerSummary, ManagedSession

### Community 11 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (46): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+38 more)

### Community 12 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 13 - "pwa.ts"
Cohesion: 0.09
Nodes (37): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate() (+29 more)

### Community 14 - "hub-routes.ts"
Cohesion: 0.06
Nodes (28): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+20 more)

### Community 15 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 16 - "transcription-service.ts"
Cohesion: 0.08
Nodes (25): collect(), oversized(), CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync (+17 more)

### Community 17 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 18 - "agent-service.ts"
Cohesion: 0.07
Nodes (38): ActivePrompt, activityDuration(), activityGroupIdFor(), activityResult(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+30 more)

### Community 19 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 20 - ".publish"
Cohesion: 0.13
Nodes (3): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents()

### Community 21 - "WorkspaceDialog"
Cohesion: 0.11
Nodes (34): executeCommand(), listWorkspace(), readWorkspaceFile(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+26 more)

### Community 23 - "TmuxTerminalSessionController"
Cohesion: 0.14
Nodes (11): copilotCommand(), execFileAsync, listTmuxSessions(), noTmuxServer(), processAncestors(), processCommand(), safeWindowName(), tmuxTargetForPid() (+3 more)

### Community 24 - "SessionDetail"
Cohesion: 0.10
Nodes (5): ChatMessage, QueuedPrompt, SessionDetail, SessionStatus, SessionSummary

### Community 26 - "workspace-browser.ts"
Cohesion: 0.10
Nodes (28): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+20 more)

### Community 27 - "devDependencies"
Cohesion: 0.06
Nodes (33): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+25 more)

### Community 28 - "PushNotificationService"
Cohesion: 0.14
Nodes (8): brief(), HubEventSource, PushNotificationService, registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 29 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 30 - "terminal-session.ts"
Cohesion: 0.14
Nodes (27): cleanDialogLine(), COMPOSER_PLACEHOLDERS, isTerminalChrome(), isTerminalOverlay(), normaliseOutputLine(), parseTerminalFolderTrust(), parseTerminalFormActiveField(), parseTerminalFormPrompt() (+19 more)

### Community 31 - "dependencies"
Cohesion: 0.07
Nodes (29): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+21 more)

### Community 32 - "agentic-remote"
Cohesion: 0.15
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 33 - "multi-node.test.ts"
Cohesion: 0.11
Nodes (7): ComputerRegistry, RegistryState, directories, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore

### Community 35 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (24): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), isTerminalAgentWorking(), paneShowsText(), parseTerminalUpdateNotice() (+16 more)

### Community 36 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 37 - "session-store-providers.test.ts"
Cohesion: 0.09
Nodes (9): CopilotClientLike, claude(), clearFixture(), copilot(), disk, event(), fixtures, releases (+1 more)

### Community 38 - "directory-browser.ts"
Cohesion: 0.18
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 39 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 40 - "active-sessions.ts"
Cohesion: 0.20
Nodes (22): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+14 more)

### Community 42 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 43 - "recordValue"
Cohesion: 0.22
Nodes (18): activityKind(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError(), numberValue() (+10 more)

### Community 44 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 45 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 46 - "agent-service.test.ts"
Cohesion: 0.12
Nodes (7): terminalFormSteps(), DeferredSession, directories, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind, UserInputForm

### Community 47 - "event-log.ts"
Cohesion: 0.22
Nodes (16): appendLines(), cacheKey(), copilotHome(), eventLogPath(), ParsedLog, parsedLogs, readAt(), readSessionEvents() (+8 more)

### Community 48 - "NewSessionDialog"
Cohesion: 0.18
Nodes (18): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), computerProviders() (+10 more)

### Community 49 - "TerminalSessionController"
Cohesion: 0.15
Nodes (5): persistedFormAnswer(), removeCopilotSessionFiles(), validateUserInputForm(), TerminalSessionController, SessionRuntimeInfo

### Community 50 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 51 - "knowledgePathChain"
Cohesion: 0.19
Nodes (15): addKnowledgeRoot(), listKnowledgeEntries(), readKnowledgeFile(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+7 more)

### Community 52 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 53 - ".send"
Cohesion: 0.26
Nodes (12): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), isTerminalSessionInUsePrompt(), occurrences(), paneEvidenceCount() (+4 more)

### Community 54 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 55 - "CopilotSessionLike"
Cohesion: 0.17
Nodes (3): CopilotSessionLike, FakeCopilotClient, CopilotTasksApi

### Community 56 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

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

### Community 61 - "deleteSession"
Cohesion: 0.24
Nodes (10): addComputer(), deleteKnowledgeRoot(), deleteSession(), removeComputer(), requestVoid(), responseError(), removeRoot(), ComputersDialog() (+2 more)

### Community 62 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 63 - "claude-agent-service.test.ts"
Cohesion: 0.25
Nodes (5): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle()

### Community 64 - "plugins"
Cohesion: 0.29
Nodes (7): plugins, oxc, react, typescript, drawDiagram(), drawing, MermaidDiagram()

### Community 65 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 66 - "knowledge-restore.ts"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 67 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 70 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **387 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+382 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 601 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `contracts.ts`, `directory-browser.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `directory-browser.ts`, `contracts.ts`, `ProviderSessionService`, `RemoteNodeClient`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionStore`, `session-store-providers.test.ts`, `directory-browser.ts`, `.get`, `recordValue`, `TerminalSessionController`, `.publish`, `SessionDetail`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _387 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.05070028011204482 - nodes in this community are weakly interconnected._
- **Should `contracts.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06631578947368422 - nodes in this community are weakly interconnected._
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
