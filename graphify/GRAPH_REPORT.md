# Agentic Remote - Graphify code map

Snapshot: `7796217d7951822128ec275984253f7dc82eea802f48ebeb18d02706a738fe8f`

Source checkout: `44d42137bc467fe086e1bc1034c94615aa4c7007`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 116 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 116 files · ~238,425 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2210 nodes · 5724 edges · 103 communities (70 shown, 20 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 423 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionDetail
- AgentService
- App
- contracts.ts
- App.tsx
- api.ts
- agentic-remote-promotion-monitor
- SessionStore
- computer-manager.ts
- ComputerManager
- .get
- background-task-adapter.ts
- RemoteNodeClient
- bundle
- pwa.ts
- lib.rs
- shell.ts
- SessionService
- config.rs
- session-store-providers.test.ts
- devDependencies
- agent-service.ts
- ProviderSessionService
- agent-service.test.ts
- multi-node.test.ts
- agentic-remote
- agentic-remote-promotion-setup
- terminal-session.test.ts
- delegated-transcription-service.ts
- WorkspaceDialog
- dependencies
- TmuxTerminalSessionController
- knowledge-tree.ts
- FakeSessionService
- terminal-session.ts
- parseTerminalPermission
- scripts
- NewSessionDialog
- .handleSessionEvent
- compilerOptions
- hub-routes.ts
- transcription-service.ts
- active-sessions.ts
- PushNotificationService
- compilerOptions
- compilerOptions
- compilerOptions
- event-log.ts
- workspace-browser.ts
- .oxlintrc.json
- push-notification-service.ts
- .syncTranscripts
- BackgroundTaskSnapshot
- directory-browser.ts
- app.ts
- capture
- session-store.ts
- desktop.json
- KnowledgeStore
- settings-local.json
- .fillUserInputForm
- TranscriptionError
- promotion-monitor.test.ts
- scripts
- bridge.rs
- package.json
- session-store-durability.test.ts
- DirectoryListing
- SessionFileUpload
- UserInputFieldControl
- knowledge-restore.ts
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
1. `SessionDetail` - 192 edges
2. `App()` - 152 edges
3. `AgentService` - 124 edges
4. `ClaudeAgentService` - 79 edges
5. `SessionStore` - 78 edges
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
- `KnowledgeFolderState` --references--> `WorkspaceListing`  [EXTRACTED]
  src/knowledge-tree.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (103 total, 20 thin omitted)

### Community 0 - "SessionDetail"
Cohesion: 0.06
Nodes (6): ClaudeAgentService, isMissingClaudeSessionError(), ChatMessage, RuntimeModelOption, SessionDetail, SessionStatus

### Community 1 - "AgentService"
Cohesion: 0.07
Nodes (5): agentMode(), AgentService, isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError

### Community 2 - "App"
Cohesion: 0.06
Nodes (74): clearConversation(), deleteSession(), replyPermission(), restartSession(), App(), appendComposerForKey(), appKeyDown(), attachedFiles() (+66 more)

### Community 3 - "contracts.ts"
Cohesion: 0.05
Nodes (40): AgentServiceEvents, CreationRuntime, ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError() (+32 more)

### Community 4 - "App.tsx"
Cohesion: 0.04
Nodes (54): applyAccentIcon(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+46 more)

### Community 5 - "api.ts"
Cohesion: 0.08
Nodes (52): cancelBackgroundTask(), cancelSession(), configureRuntime(), deleteKnowledgeRoot(), getPushSettings(), getRuntimeOptions(), getSession(), listBackgroundTasks() (+44 more)

### Community 6 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (55): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+47 more)

### Community 7 - "SessionStore"
Cohesion: 0.09
Nodes (10): cloneSession(), fixture(), isSessionIdList(), PendingMutation, fixture(), terminalClearFixture(), SessionStore, createStore() (+2 more)

### Community 8 - "computer-manager.ts"
Cohesion: 0.05
Nodes (37): RemoteResync, RemoteSessionListing, RemoteSessionRead, FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions (+29 more)

### Community 9 - "ComputerManager"
Cohesion: 0.14
Nodes (8): ComputerManager, managedSession(), sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, ComputerSummary, ManagedSession, SessionListing

### Community 10 - ".get"
Cohesion: 0.10
Nodes (5): isUncertainDelivery(), persistedFormAnswer(), validateUserInputForm(), isTerminalAgentWorking(), TerminalSessionController

### Community 11 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (43): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+35 more)

### Community 12 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (8): RegisteredComputer, headerSafe(), RemoteNodeClient, client(), servers, session, NodeInfo, WorkspaceListing

### Community 13 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 14 - "pwa.ts"
Cohesion: 0.09
Nodes (38): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification() (+30 more)

### Community 15 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 16 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 17 - "SessionService"
Cohesion: 0.09
Nodes (3): registerNodeRoutes(), SessionService, WorkspaceFile

### Community 18 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 19 - "session-store-providers.test.ts"
Cohesion: 0.06
Nodes (15): CopilotClientLike, ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), claude(), clearFixture() (+7 more)

### Community 20 - "devDependencies"
Cohesion: 0.06
Nodes (33): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+25 more)

### Community 21 - "agent-service.ts"
Cohesion: 0.08
Nodes (31): ActivePrompt, activityDuration(), activityGroupIdFor(), ansiSequence, commandShortcut(), ElicitationContext, ElicitationHandler, foregroundLifecycleEvents (+23 more)

### Community 23 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (10): CopilotSessionLike, terminalFormSteps(), DeferredSession, directories, FakeCopilotClient, CopilotTaskInfo, CopilotTaskProgress, CopilotTasksApi (+2 more)

### Community 24 - "multi-node.test.ts"
Cohesion: 0.10
Nodes (8): ComputerRegistry, RegistryState, directories, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore, StoredNodeIdentity

### Community 25 - "agentic-remote"
Cohesion: 0.14
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 26 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 27 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (25): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), parseTerminalUpdateNotice(), bracketedTabPane, clearFixture() (+17 more)

### Community 28 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (14): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+6 more)

### Community 29 - "WorkspaceDialog"
Cohesion: 0.14
Nodes (26): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), navigateDocument(), BreadcrumbSegment (+18 more)

### Community 30 - "dependencies"
Cohesion: 0.07
Nodes (29): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+21 more)

### Community 31 - "TmuxTerminalSessionController"
Cohesion: 0.18
Nodes (6): copilotCommand(), execFileAsync, processCommand(), TmuxTerminalSessionController, PendingPermission, PendingUserInput

### Community 32 - "knowledge-tree.ts"
Cohesion: 0.11
Nodes (26): WorkspaceEntry, addKnowledgeRoot(), listKnowledgeEntries(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+18 more)

### Community 34 - "terminal-session.ts"
Cohesion: 0.15
Nodes (26): capturePane(), COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasLiveTerminalComposer(), isTerminalChrome() (+18 more)

### Community 35 - "parseTerminalPermission"
Cohesion: 0.19
Nodes (25): activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), findTerminalWrappedText(), hasComposerAfter(), hasTerminalCommandPermissionQuestion(), isTerminalDesktopInstallPrompt() (+17 more)

### Community 36 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 37 - "NewSessionDialog"
Cohesion: 0.12
Nodes (26): activateSession(), createSession(), executeCommand(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory(), AddKnowledgeRootDialog() (+18 more)

### Community 38 - ".handleSessionEvent"
Cohesion: 0.20
Nodes (21): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isRuntimeReasoningEffort() (+13 more)

### Community 39 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 40 - "hub-routes.ts"
Cohesion: 0.09
Nodes (23): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+15 more)

### Community 41 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 42 - "active-sessions.ts"
Cohesion: 0.21
Nodes (21): ActiveProcess, execFileAsync, findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+13 more)

### Community 44 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 45 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 46 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 47 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 48 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 49 - ".oxlintrc.json"
Cohesion: 0.12
Nodes (16): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+8 more)

### Community 50 - "push-notification-service.ts"
Cohesion: 0.13
Nodes (11): ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, sessionMuteSchema, subscriptionSchema (+3 more)

### Community 51 - ".syncTranscripts"
Cohesion: 0.15
Nodes (3): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents()

### Community 52 - "BackgroundTaskSnapshot"
Cohesion: 0.20
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 53 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 54 - "app.ts"
Cohesion: 0.18
Nodes (11): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), ServerRole, transcriptionComputerName() (+3 more)

### Community 55 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 56 - "session-store.ts"
Cohesion: 0.13
Nodes (13): ActivityToolStart, activityDuration(), activityResultPreview(), DiscoveredSession, emptyRetirements, PendingChange, SessionProjection, SessionReplacementCleanupError (+5 more)

### Community 57 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 58 - "KnowledgeStore"
Cohesion: 0.23
Nodes (4): KnowledgeState, KnowledgeStore, directories, KnowledgeRoot

### Community 59 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 60 - ".fillUserInputForm"
Cohesion: 0.22
Nodes (7): findActiveCopilotProcesses(), noTmuxServer(), processAncestors(), submitTerminalForm(), terminalChecklistState(), terminalFormCommitKeys(), tmuxTargetForPid()

### Community 61 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 62 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 63 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 64 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 65 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 66 - "session-store-durability.test.ts"
Cohesion: 0.25
Nodes (6): disk, fixtures, prompt(), ready(), releases, session()

### Community 69 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 70 - "knowledge-restore.ts"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 71 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 73 - "SessionRuntimeInfo"
Cohesion: 0.50
Nodes (3): listTmuxSessions(), safeWindowName(), SessionRuntimeInfo

### Community 74 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 76 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **390 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+385 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 608 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `DirectoryListing`, `contracts.ts`, `SessionFileUpload`, `computer-manager.ts`, `SessionService`, `BackgroundTaskSnapshot`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `DirectoryListing`, `contracts.ts`, `SessionFileUpload`, `RemoteNodeClient`, `ProviderSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `SessionDetail`, `AgentService`, `SessionFileUpload`, `.get`, `.syncTranscripts`, `session-store-providers.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _390 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.055900621118012424 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.06935057302380253 - nodes in this community are weakly interconnected._
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
