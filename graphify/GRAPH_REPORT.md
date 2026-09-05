# Agentic Remote - Graphify code map

Snapshot: `8623355c2730d269dd2d11db2aca7429eb11955cdfab61fa327f00772e54eb63`

Source checkout: `2293526cd7e94bba448d7e366cdbb37792188d74`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 119 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 119 files · ~254,150 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2281 nodes · 5900 edges · 106 communities (70 shown, 23 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 423 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionDetail
- App
- AgentService
- App.tsx
- api.ts
- ClaudeAgentService
- agentic-remote-promotion-monitor
- claude-agent-service.ts
- background-task-adapter.ts
- bundle
- TmuxTerminalSessionController
- terminal-session.ts
- lib.rs
- contracts.ts
- agent-service.ts
- TerminalSessionController
- shell.ts
- ComputerManager
- PushNotificationService
- SessionService
- config.rs
- devDependencies
- pwa.ts
- ProviderSessionService
- RemoteNodeClient
- session-store-providers.test.ts
- FakeSessionService
- delegated-transcription-service.ts
- dependencies
- WorkspaceDialog
- agentic-remote
- agentic-remote-promotion-setup
- terminal-session.test.ts
- knowledge-tree.ts
- hub-routes.ts
- scripts
- node-routes.ts
- NewSessionDialog
- compilerOptions
- active-sessions.ts
- tmux-errors.integration.test.ts
- transcription-service.ts
- compilerOptions
- app.ts
- persistComposerDrafts
- compilerOptions
- compilerOptions
- ComputerRegistry
- event-log.ts
- KnowledgeStore
- react
- recordValue
- agent-service.test.ts
- ComputerSummary
- BackgroundTaskSnapshot
- directory-browser.ts
- workspace-browser.ts
- desktop.json
- .configureRuntime
- settings-local.json
- CopilotSessionLike
- TranscriptionError
- capture
- promotion-monitor.test.ts
- scripts
- composerTookPaste
- bridge.rs
- package.json
- DirectoryListing
- claude-agent-service.test.ts
- SessionFileUpload
- UserInputFieldControl
- knowledge-restore.ts
- WorkspaceFile
- settings.ts
- WorkspaceListing
- composer-layout.test.ts
- removeComputer
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
1. `SessionDetail` - 195 edges
2. `App()` - 173 edges
3. `AgentService` - 124 edges
4. `ClaudeAgentService` - 82 edges
5. `SessionStore` - 77 edges
6. `ComputerManager` - 68 edges
7. `RemoteNodeClient` - 56 edges
8. `SessionService` - 54 edges
9. `registerHubRoutes()` - 51 edges
10. `FakeSessionService` - 44 edges

## Surprising Connections (you probably didn't know these)
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `RemoteNodeClientEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/remote-node-client.ts → shared/contracts.ts
- `SessionListing` --references--> `ManagedSession`  [EXTRACTED]
  src/api.ts → shared/contracts.ts
- `KnowledgeFolderState` --references--> `WorkspaceListing`  [EXTRACTED]
  src/knowledge-tree.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (106 total, 23 thin omitted)

### Community 0 - "SessionDetail"
Cohesion: 0.05
Nodes (20): activityDuration(), activityResultPreview(), cloneSession(), DiscoveredSession, fixture(), PendingChange, PendingMutation, fixture() (+12 more)

### Community 1 - "App"
Cohesion: 0.05
Nodes (86): App(), answerUserInput(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession(), attachedFiles(), audioDropped() (+78 more)

### Community 2 - "AgentService"
Cohesion: 0.07
Nodes (3): AgentService, isMissingSessionError(), removeCopilotSessionFiles()

### Community 3 - "App.tsx"
Cohesion: 0.03
Nodes (71): applyAccentIcon(), configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+63 more)

### Community 4 - "api.ts"
Cohesion: 0.06
Nodes (61): AddKnowledgeRootInput, PushSettings, cancelBackgroundTask(), cancelSession(), clearConversation(), deleteKnowledgeRoot(), deletePushSubscription(), deleteSession() (+53 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.07
Nodes (3): ClaudeAgentService, isMissingClaudeSessionError(), RuntimeModelOption

### Community 6 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (55): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+47 more)

### Community 7 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (23): AgentServiceEvents, CreationRuntime, ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError() (+15 more)

### Community 8 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (43): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+35 more)

### Community 9 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 10 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (14): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), terminalChecklistState() (+6 more)

### Community 11 - "terminal-session.ts"
Cohesion: 0.13
Nodes (39): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), findTerminalWrappedText(), hasComposerAfter() (+31 more)

### Community 12 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 13 - "contracts.ts"
Cohesion: 0.07
Nodes (31): RemoteResync, RemoteSessionListing, RemoteSessionRead, RegistryState, StoredNodeIdentity, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, normalizeNodeUrl() (+23 more)

### Community 14 - "agent-service.ts"
Cohesion: 0.07
Nodes (39): ActivePrompt, activityDuration(), activityGroupIdFor(), activityResult(), ActivityToolStart, ansiSequence, commandShortcut(), ElicitationContext (+31 more)

### Community 16 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 17 - "ComputerManager"
Cohesion: 0.21
Nodes (4): ComputerManager, managedSession(), registerHubRoutes(), ManagedSession

### Community 18 - "PushNotificationService"
Cohesion: 0.11
Nodes (13): ComputerManagerEvents, brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, registerPushRoutes() (+5 more)

### Community 20 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 21 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 22 - "pwa.ts"
Cohesion: 0.12
Nodes (31): getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle(), mergeRuntimeModelOptions() (+23 more)

### Community 24 - "RemoteNodeClient"
Cohesion: 0.09
Nodes (7): headerSafe(), RemoteNodeClient, RemoteNodeRequestError, client(), servers, session, NodeInfo

### Community 25 - "session-store-providers.test.ts"
Cohesion: 0.07
Nodes (14): CopilotClientLike, disk, fixtures, prompt(), releases, session(), claude(), clearFixture() (+6 more)

### Community 27 - "delegated-transcription-service.ts"
Cohesion: 0.10
Nodes (15): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+7 more)

### Community 28 - "dependencies"
Cohesion: 0.06
Nodes (31): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+23 more)

### Community 29 - "WorkspaceDialog"
Cohesion: 0.14
Nodes (27): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), navigateDocument(), BreadcrumbSegment (+19 more)

### Community 30 - "agentic-remote"
Cohesion: 0.14
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 31 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 32 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (24): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), isTerminalAgentWorking(), paneShowsText(), parseTerminalUpdateNotice() (+16 more)

### Community 33 - "knowledge-tree.ts"
Cohesion: 0.11
Nodes (26): WorkspaceEntry, addKnowledgeRoot(), listKnowledgeEntries(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+18 more)

### Community 34 - "hub-routes.ts"
Cohesion: 0.08
Nodes (25): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+17 more)

### Community 35 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 36 - "node-routes.ts"
Cohesion: 0.10
Nodes (22): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), configureRuntimeSchema, createSessionSchema (+14 more)

### Community 37 - "NewSessionDialog"
Cohesion: 0.13
Nodes (25): activateSession(), createSession(), executeCommand(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory(), AddKnowledgeRootDialog() (+17 more)

### Community 38 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 39 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 40 - "tmux-errors.integration.test.ts"
Cohesion: 0.12
Nodes (19): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer(), noTmuxServer() (+11 more)

### Community 41 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 42 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 43 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+5 more)

### Community 44 - "persistComposerDrafts"
Cohesion: 0.16
Nodes (20): activeComposerPastes(), composerChanged(), composerPasted(), persistComposerDrafts(), collapsedPasteLabel(), composerPastesAfterRangeEdit(), expandComposerPastes(), hasComposerAcceptanceReceipt() (+12 more)

### Community 45 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 46 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 47 - "ComputerRegistry"
Cohesion: 0.17
Nodes (5): ComputerRegistry, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore

### Community 48 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 49 - "KnowledgeStore"
Cohesion: 0.17
Nodes (5): KnowledgeState, KnowledgeStore, directories, createHub(), KnowledgeRoot

### Community 50 - "react"
Cohesion: 0.12
Nodes (16): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+8 more)

### Community 51 - "recordValue"
Cohesion: 0.27
Nodes (15): activityKind(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError(), numberValue() (+7 more)

### Community 52 - "agent-service.test.ts"
Cohesion: 0.12
Nodes (7): terminalFormSteps(), DeferredSession, directories, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind, UserInputForm

### Community 53 - "ComputerSummary"
Cohesion: 0.20
Nodes (4): sessionAtLeastAsNew(), RegisteredComputer, AddComputerInput, ComputerSummary

### Community 54 - "BackgroundTaskSnapshot"
Cohesion: 0.20
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 55 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 56 - "workspace-browser.ts"
Cohesion: 0.26
Nodes (13): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+5 more)

### Community 57 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 58 - ".configureRuntime"
Cohesion: 0.20
Nodes (5): agentMode(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), RuntimeConfigurationError, statusFromEvents()

### Community 59 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 60 - "CopilotSessionLike"
Cohesion: 0.17
Nodes (3): CopilotSessionLike, FakeCopilotClient, CopilotTasksApi

### Community 61 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 62 - "capture"
Cohesion: 0.23
Nodes (12): shortcutKeys(), binding(), bindingLabel(), capturableCode(), isModifierCode(), keyLabel(), readStoredShortcuts(), sameBinding() (+4 more)

### Community 63 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 64 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 65 - "composerTookPaste"
Cohesion: 0.38
Nodes (10): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), pasteCouldCollapse(), pastedPlaceholderCount() (+2 more)

### Community 66 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 67 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 69 - "claude-agent-service.test.ts"
Cohesion: 0.25
Nodes (5): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle()

### Community 71 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 72 - "knowledge-restore.ts"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 74 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 77 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 79 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **409 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+404 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 630 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SessionService` connect `SessionService` to `DirectoryListing`, `claude-agent-service.ts`, `WorkspaceFile`, `WorkspaceListing`, `ProviderSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `DirectoryListing`, `SessionFileUpload`, `claude-agent-service.ts`, `WorkspaceFile`, `WorkspaceListing`, `contracts.ts`, `ComputerSummary`, `BackgroundTaskSnapshot`, `FakeSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `ClaudeAgentService`, `SessionFileUpload`, `TerminalSessionController`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _409 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.05293383270911361 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.054136874361593465 - nodes in this community are weakly interconnected._
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
