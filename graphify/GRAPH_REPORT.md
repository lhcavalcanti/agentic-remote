# Agentic Remote - Graphify code map

Snapshot: `56b26a12b99cb27f37190a4f049a23c5423e04fd8b080660f223117a21b5cf39`

Source checkout: `f8a2fd3887fcd20f0c37da9f83d98edcc5fc14d5`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 126 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 126 files · ~276,398 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2397 nodes · 6354 edges · 106 communities (69 shown, 24 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 462 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- RemoteNodeClient
- App.tsx
- App
- transcription-service.ts
- api.ts
- SessionDetail
- ClaudeAgentService
- agentic-remote-promotion-monitor
- submitMessage
- app.ts
- queued-provider-dispatch.test.ts
- background-task-adapter.ts
- ComputerManager
- bundle
- TmuxTerminalSessionController
- lib.rs
- shell.ts
- claude-agent-service.ts
- ProviderSessionService
- config.rs
- pwa.ts
- .dispatchCommand
- FakeSessionService
- agent-service.ts
- queueConflict
- PushNotificationService
- contracts.ts
- SessionService
- devDependencies
- WorkspaceDialog
- dependencies
- agentic-remote
- agentic-remote-promotion-setup
- terminal-session.test.ts
- hub-routes.ts
- terminal-session.ts
- session-store-providers.test.ts
- node-routes.ts
- scripts
- tmux-errors.integration.test.ts
- parseTerminalPermission
- compilerOptions
- queued-dispatch.test.ts
- active-sessions.ts
- NewSessionDialog
- compilerOptions
- CopilotSessionLike
- agent-service.test.ts
- compilerOptions
- compilerOptions
- .handleSessionEvent
- directory-browser.ts
- event-log.ts
- workspace-browser.ts
- knowledge-tree.ts
- tmux-errors.test.ts
- capture
- desktop.json
- .oxlintrc.json
- settings-local.json
- session-store.ts
- promotion-monitor.test.ts
- scripts
- .readAfterWrites
- bridge.rs
- package.json
- SessionFileUpload
- UserInputFieldControl
- WorkspaceListing
- settings.ts
- knowledge-restore.ts
- AgentProviderCapability
- .terminalContinuationState
- composer-layout.test.ts
- WorkspaceFile
- release-publication.test.ts
- MockMediaRecorder
- MermaidDiagram.tsx
- MockWebSocket
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
1. `SessionDetail` - 205 edges
2. `App()` - 186 edges
3. `AgentService` - 133 edges
4. `ClaudeAgentService` - 89 edges
5. `SessionStore` - 85 edges
6. `ComputerManager` - 70 edges
7. `RemoteNodeClient` - 58 edges
8. `SessionService` - 57 edges
9. `registerHubRoutes()` - 53 edges
10. `FakeSessionService` - 47 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `StoredSession` --inherits--> `SessionDetail`  [EXTRACTED]
  server/session-store.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (106 total, 24 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.07
Nodes (3): AgentService, isMissingSessionError(), removeCopilotSessionFiles()

### Community 1 - "RemoteNodeClient"
Cohesion: 0.04
Nodes (26): ComputerManagerEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, sessionAtLeastAsNew(), RegisteredComputer, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+18 more)

### Community 2 - "App.tsx"
Cohesion: 0.03
Nodes (68): applyAccentIcon(), addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage() (+60 more)

### Community 3 - "App"
Cohesion: 0.05
Nodes (78): addKnowledgeRoot(), deleteKnowledgeRoot(), App(), answerUserInput(), appendComposerForKey(), applyComputerSnapshot(), attachedFiles(), audioDropped() (+70 more)

### Community 4 - "transcription-service.ts"
Cohesion: 0.05
Nodes (37): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+29 more)

### Community 5 - "api.ts"
Cohesion: 0.08
Nodes (57): cancelBackgroundTask(), cancelSession(), clearConversation(), deleteSession(), dispatchQueuedPrompt(), getProviderRuntimeOptions(), getPushSettings(), getRuntimeOptions() (+49 more)

### Community 6 - "SessionDetail"
Cohesion: 0.09
Nodes (4): cloneSession(), SessionStore, QueuedPrompt, SessionDetail

### Community 7 - "ClaudeAgentService"
Cohesion: 0.07
Nodes (4): ClaudeAgentService, isMissingClaudeSessionError(), waitForIdle(), RuntimeModelOption

### Community 8 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (55): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+47 more)

### Community 9 - "submitMessage"
Cohesion: 0.07
Nodes (57): activeComposerPastes(), appKeyDown(), applySession(), cancelQueuedPromptEdit(), clearSelectedConversation(), composerChanged(), composerKeyDown(), composerPasted() (+49 more)

### Community 10 - "app.ts"
Cohesion: 0.07
Nodes (23): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+15 more)

### Community 11 - "queued-provider-dispatch.test.ts"
Cohesion: 0.06
Nodes (16): CopilotClientLike, claudeFixture(), copilotFixture(), copilotSession(), fixtures, gate(), originalQueue, pause() (+8 more)

### Community 12 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (44): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+36 more)

### Community 13 - "ComputerManager"
Cohesion: 0.18
Nodes (6): ComputerManager, managedSession(), registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 14 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 15 - "TmuxTerminalSessionController"
Cohesion: 0.13
Nodes (11): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), tmuxTargetForPid() (+3 more)

### Community 16 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 17 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 18 - "claude-agent-service.ts"
Cohesion: 0.10
Nodes (24): AgentServiceEvents, ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+16 more)

### Community 20 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 21 - "pwa.ts"
Cohesion: 0.11
Nodes (34): react, deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+26 more)

### Community 22 - ".dispatchCommand"
Cohesion: 0.10
Nodes (6): commandShortcut(), persistedFormAnswer(), validateUserInputForm(), isTerminalAgentWorking(), TerminalSessionController, PendingPermission

### Community 24 - "agent-service.ts"
Cohesion: 0.08
Nodes (35): ActivePrompt, activityDuration(), activityGroupIdFor(), activityResult(), ansiSequence, CreationRuntime, ElicitationContext, ElicitationHandler (+27 more)

### Community 25 - "queueConflict"
Cohesion: 0.14
Nodes (14): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), queueConflict() (+6 more)

### Community 26 - "PushNotificationService"
Cohesion: 0.12
Nodes (11): brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, registerPushRoutes(), sessionMuteSchema (+3 more)

### Community 27 - "contracts.ts"
Cohesion: 0.08
Nodes (27): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), ActivityStatus, AddKnowledgeRootInput, AgentMode (+19 more)

### Community 29 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 30 - "WorkspaceDialog"
Cohesion: 0.12
Nodes (29): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+21 more)

### Community 31 - "dependencies"
Cohesion: 0.06
Nodes (31): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+23 more)

### Community 32 - "agentic-remote"
Cohesion: 0.14
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 33 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 34 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (24): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), parseTerminalUpdateNotice(), terminalChecklistState(), terminalFormCommitKeys() (+16 more)

### Community 35 - "hub-routes.ts"
Cohesion: 0.07
Nodes (27): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+19 more)

### Community 36 - "terminal-session.ts"
Cohesion: 0.12
Nodes (29): COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasComposerAfter(), isTerminalChrome(), normaliseOutputLine() (+21 more)

### Community 37 - "session-store-providers.test.ts"
Cohesion: 0.09
Nodes (13): ClaudeSdk, directories, fixture(), queryHandle(), claude(), clearFixture(), copilot(), disk (+5 more)

### Community 38 - "node-routes.ts"
Cohesion: 0.09
Nodes (24): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), configureRuntimeSchema, createSessionSchema (+16 more)

### Community 39 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 40 - "tmux-errors.integration.test.ts"
Cohesion: 0.13
Nodes (11): KnowledgeState, KnowledgeStore, directories, createHub(), execFileAsync, headers, ignoreMissing(), removeFixture() (+3 more)

### Community 41 - "parseTerminalPermission"
Cohesion: 0.23
Nodes (22): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), findTerminalWrappedText(), hasLiveTerminalComposer(), hasTerminalCommandPermissionQuestion() (+14 more)

### Community 42 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 43 - "queued-dispatch.test.ts"
Cohesion: 0.09
Nodes (14): accept(), deferred(), disk, fixture(), fixtures, holdWrite(), prompt(), releases (+6 more)

### Community 44 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 45 - "NewSessionDialog"
Cohesion: 0.14
Nodes (23): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+15 more)

### Community 46 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 47 - "CopilotSessionLike"
Cohesion: 0.13
Nodes (6): CopilotSessionLike, FakeCopilotClient, CopilotTasksApi, queuedSdkPrompt(), disposals, fixture()

### Community 48 - "agent-service.test.ts"
Cohesion: 0.12
Nodes (8): terminalFormSteps(), DeferredSession, directories, services, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind, UserInputForm

### Community 49 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 50 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 51 - ".handleSessionEvent"
Cohesion: 0.28
Nodes (15): activityKind(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError(), numberValue() (+7 more)

### Community 52 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 53 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 54 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 55 - "knowledge-tree.ts"
Cohesion: 0.21
Nodes (14): knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs(), KnowledgeFolders (+6 more)

### Community 56 - "tmux-errors.test.ts"
Cohesion: 0.17
Nodes (12): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+4 more)

### Community 57 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 58 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 59 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 60 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 61 - "session-store.ts"
Cohesion: 0.17
Nodes (11): ActivityToolStart, activityDuration(), activityResultPreview(), DiscoveredSession, PendingChange, SessionProjection, StoredSession, StoredState (+3 more)

### Community 62 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 63 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 65 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 66 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 68 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 70 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 71 - "knowledge-restore.ts"
Cohesion: 0.43
Nodes (3): KnowledgePosition, KnowledgeRestoreState, base

### Community 73 - ".terminalContinuationState"
Cohesion: 0.50
Nodes (4): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), SessionStatus

### Community 77 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

### Community 79 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **427 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+422 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 659 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `claude-agent-service.ts`, `SessionFileUpload`, `WorkspaceListing`, `FakeSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ComputerManager` connect `ComputerManager` to `RemoteNodeClient`, `app.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `ClaudeAgentService` connect `ClaudeAgentService` to `SessionFileUpload`, `SessionDetail`, `AgentProviderCapability`, `queued-provider-dispatch.test.ts`, `claude-agent-service.ts`, `directory-browser.ts`, `queueConflict`, `SessionService`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _427 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.06920326864147089 - nodes in this community are weakly interconnected._
- **Should `RemoteNodeClient` be split into smaller, more focused modules?**
  _Cohesion score 0.043491037320011756 - nodes in this community are weakly interconnected._
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
