# Agentic Remote - Graphify code map

Snapshot: `203eeb59257fa5ce10b90fce6e912c06eb11f4bb07047791be97aa49afa9287c`

Source checkout: `ff8eb49547484ff6ae4c2c7581744ade3e144db3`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 116 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 116 files · ~234,810 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2194 nodes · 5646 edges · 104 communities (71 shown, 20 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 412 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- SessionDetail
- App.tsx
- ClaudeAgentService
- api.ts
- agentic-remote-promotion-monitor
- .get
- RemoteNodeClient
- background-task-adapter.ts
- bundle
- SessionService
- pwa.ts
- claude-agent-service.ts
- lib.rs
- TmuxTerminalSessionController
- shell.ts
- contracts.ts
- config.rs
- WorkspaceDialog
- ProviderSessionService
- devDependencies
- FakeSessionService
- agent-service.ts
- delegated-transcription-service.ts
- terminal-session.test.ts
- agent-service.test.ts
- multi-node.test.ts
- agentic-remote
- agentic-remote-promotion-setup
- dependencies
- session-store-providers.test.ts
- parseTerminalPermission
- terminal-session.ts
- scripts
- node-routes.ts
- PushNotificationService
- .handleSessionEvent
- compilerOptions
- ManagedSession
- hub-routes.ts
- knowledge-tree.ts
- active-sessions.ts
- transcription-service.ts
- compilerOptions
- registerHubRoutes
- compilerOptions
- compilerOptions
- directory-browser.ts
- ComputerManager
- event-log.ts
- workspace-browser.ts
- app.ts
- BackgroundTaskSnapshot
- NewSessionDialog
- capture
- desktop.json
- .oxlintrc.json
- settings-local.json
- TranscriptionError
- promotion-monitor.test.ts
- scripts
- push-notification-service.ts
- bridge.rs
- package.json
- claude-agent-service.test.ts
- session-store-durability.test.ts
- UserInputFieldControl
- knowledge-restore.ts
- SessionFileUpload
- settings.ts
- .reconcileRuntimeStatus
- SessionRuntimeInfo
- react
- AgentProviderCapability
- composer-layout.test.ts
- removeComputer
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
1. `SessionDetail` - 190 edges
2. `App()` - 152 edges
3. `AgentService` - 121 edges
4. `ClaudeAgentService` - 79 edges
5. `SessionStore` - 72 edges
6. `ComputerManager` - 64 edges
7. `RemoteNodeClient` - 55 edges
8. `SessionService` - 52 edges
9. `registerHubRoutes()` - 46 edges
10. `FakeSessionService` - 43 edges

## Surprising Connections (you probably didn't know these)
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `SessionListing` --references--> `ManagedSession`  [EXTRACTED]
  src/api.ts → shared/contracts.ts
- `KnowledgeFolderState` --references--> `WorkspaceListing`  [EXTRACTED]
  src/knowledge-tree.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (104 total, 20 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.06
Nodes (5): agentMode(), AgentService, isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError

### Community 1 - "App"
Cohesion: 0.05
Nodes (80): addKnowledgeRoot(), clearConversation(), deleteKnowledgeRoot(), deleteSession(), readKnowledgeFile(), replyPermission(), restartSession(), App() (+72 more)

### Community 2 - "SessionDetail"
Cohesion: 0.07
Nodes (20): activityDuration(), activityResultPreview(), cloneSession(), DiscoveredSession, fixture(), PendingChange, PendingMutation, holdOtherWrite() (+12 more)

### Community 3 - "App.tsx"
Cohesion: 0.04
Nodes (60): applyAccentIcon(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+52 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.07
Nodes (3): ClaudeAgentService, isMissingClaudeSessionError(), RuntimeModelOption

### Community 5 - "api.ts"
Cohesion: 0.07
Nodes (53): AddKnowledgeRootInput, PushSettings, cancelBackgroundTask(), cancelSession(), configureRuntime(), getProviderRuntimeOptions(), getPushSettings(), getRuntimeOptions() (+45 more)

### Community 6 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (55): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+47 more)

### Community 7 - ".get"
Cohesion: 0.09
Nodes (4): isUncertainDelivery(), persistedFormAnswer(), validateUserInputForm(), TerminalSessionController

### Community 8 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (10): headerSafe(), RemoteNodeClient, RemoteNodeRedirectError, RemoteNodeRequestError, client(), servers, session, NodeInfo (+2 more)

### Community 9 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (43): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+35 more)

### Community 10 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 12 - "pwa.ts"
Cohesion: 0.09
Nodes (37): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate() (+29 more)

### Community 13 - "claude-agent-service.ts"
Cohesion: 0.09
Nodes (23): AgentServiceEvents, CreationRuntime, ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError() (+15 more)

### Community 14 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 15 - "TmuxTerminalSessionController"
Cohesion: 0.13
Nodes (9): copilotCommand(), execFileAsync, noTmuxServer(), processAncestors(), processCommand(), tmuxTargetForPid(), TmuxTerminalSessionController, PendingPermission (+1 more)

### Community 16 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 17 - "contracts.ts"
Cohesion: 0.08
Nodes (29): ComputerManagerEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, normalizeNodeUrl(), REDIRECT_STATUSES, ActivityStatus, AddComputerInput (+21 more)

### Community 18 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 19 - "WorkspaceDialog"
Cohesion: 0.11
Nodes (33): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+25 more)

### Community 21 - "devDependencies"
Cohesion: 0.06
Nodes (33): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+25 more)

### Community 23 - "agent-service.ts"
Cohesion: 0.08
Nodes (31): ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, ansiSequence, commandShortcut(), ElicitationContext, ElicitationHandler (+23 more)

### Community 24 - "delegated-transcription-service.ts"
Cohesion: 0.10
Nodes (15): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+7 more)

### Community 25 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (26): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), isTerminalAgentWorking(), parseTerminalUpdateNotice(), submitTerminalForm() (+18 more)

### Community 26 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (10): CopilotSessionLike, terminalFormSteps(), DeferredSession, directories, FakeCopilotClient, CopilotTaskInfo, CopilotTaskProgress, CopilotTasksApi (+2 more)

### Community 27 - "multi-node.test.ts"
Cohesion: 0.10
Nodes (8): ComputerRegistry, RegistryState, directories, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore, StoredNodeIdentity

### Community 28 - "agentic-remote"
Cohesion: 0.14
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 29 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 30 - "dependencies"
Cohesion: 0.07
Nodes (29): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+21 more)

### Community 31 - "session-store-providers.test.ts"
Cohesion: 0.09
Nodes (11): CopilotClientLike, claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures (+3 more)

### Community 32 - "parseTerminalPermission"
Cohesion: 0.19
Nodes (26): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), findTerminalWrappedText(), hasTerminalCommandPermissionQuestion(), isTerminalDesktopInstallPrompt() (+18 more)

### Community 33 - "terminal-session.ts"
Cohesion: 0.14
Nodes (26): COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasComposerAfter(), hasLiveTerminalComposer(), isTerminalChrome() (+18 more)

### Community 34 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 35 - "node-routes.ts"
Cohesion: 0.09
Nodes (23): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+15 more)

### Community 36 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 37 - ".handleSessionEvent"
Cohesion: 0.20
Nodes (21): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isRuntimeReasoningEffort() (+13 more)

### Community 38 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 40 - "hub-routes.ts"
Cohesion: 0.09
Nodes (23): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+15 more)

### Community 41 - "knowledge-tree.ts"
Cohesion: 0.14
Nodes (21): WorkspaceEntry, listKnowledgeEntries(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder(), openKnowledgeFolder(), toggleKnowledgeFolder(), collapseKnowledgeFolder() (+13 more)

### Community 42 - "active-sessions.ts"
Cohesion: 0.20
Nodes (22): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+14 more)

### Community 43 - "transcription-service.ts"
Cohesion: 0.11
Nodes (17): CommandOptions, CommandResult, CommandRunner, defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic, genericMimeTypes (+9 more)

### Community 44 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 45 - "registerHubRoutes"
Cohesion: 0.18
Nodes (6): registerHubRoutes(), SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, KnowledgeRoot

### Community 46 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 47 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 48 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 49 - "ComputerManager"
Cohesion: 0.26
Nodes (4): ComputerManager, sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 50 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 51 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 52 - "app.ts"
Cohesion: 0.17
Nodes (12): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), ServerRole, transcriptionComputerName() (+4 more)

### Community 53 - "BackgroundTaskSnapshot"
Cohesion: 0.20
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 54 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+8 more)

### Community 55 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 56 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 57 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 58 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 59 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 60 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 61 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 62 - "push-notification-service.ts"
Cohesion: 0.18
Nodes (8): brief(), PushSender, PushState, directories, sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 63 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 64 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 65 - "claude-agent-service.test.ts"
Cohesion: 0.25
Nodes (5): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle()

### Community 66 - "session-store-durability.test.ts"
Cohesion: 0.29
Nodes (5): disk, fixtures, prompt(), releases, session()

### Community 67 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 68 - "knowledge-restore.ts"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 70 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 71 - ".reconcileRuntimeStatus"
Cohesion: 0.47
Nodes (3): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents()

### Community 72 - "SessionRuntimeInfo"
Cohesion: 0.40
Nodes (4): listTmuxSessions(), safeWindowName(), ownedStartupFixture(), SessionRuntimeInfo

### Community 73 - "react"
Cohesion: 0.50
Nodes (4): react, drawDiagram(), drawing, MermaidDiagram()

### Community 76 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 78 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **388 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+383 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 606 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `.handleSessionEvent`, `SessionFileUpload`, `.get`, `.reconcileRuntimeStatus`, `AgentProviderCapability`, `directory-browser.ts`, `session-store-providers.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `ManagedSession`, `RemoteNodeClient`, `AgentProviderCapability`, `claude-agent-service.ts`, `ComputerManager`, `ProviderSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `ClaudeAgentService`, `SessionFileUpload`, `.get`, `session-store-providers.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _388 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.06094627105052125 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.050543637966500146 - nodes in this community are weakly interconnected._
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
