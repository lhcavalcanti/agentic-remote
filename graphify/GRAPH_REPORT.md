# Agentic Remote - Graphify code map

Snapshot: `68ccd05bf139c7c478e1596f0b9f854d684860b4cf13545b8871f4103d9944cb`

Source checkout: `4c01723b5ed88105e9a2422cf8dbd61672f873af`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 146 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 146 files · ~293,177 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2540 nodes · 6664 edges · 104 communities (72 shown, 19 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 466 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- App.tsx
- RemoteNodeClient
- SessionDetail
- api.ts
- contracts.ts
- ClaudeAgentService
- queued-dispatch.test.ts
- agentic-remote-promotion-monitor
- ComputerManager
- hub-routes.ts
- react
- background-task-adapter.ts
- bundle
- lib.rs
- FakeSessionService
- WorkspaceDialog
- pwa.ts
- ProviderSessionService
- shell.ts
- config.rs
- agent-service.ts
- TmuxTerminalSessionController
- SessionService
- devDependencies
- workspace-fixtures.ts
- dependencies
- knowledge-tree.ts
- tmux-errors.integration.test.ts
- .get
- agentic-remote
- agentic-remote-promotion-setup
- terminal-session.test.ts
- agent-service.test.ts
- app.ts
- parseTerminalPermission
- session-presentation.ts
- session-store-providers.test.ts
- terminal-session.ts
- scripts
- delegated-transcription-service.ts
- compilerOptions
- .handleSessionEvent
- queued-provider-dispatch.test.ts
- transcription-service.ts
- node-routes.ts
- tmux-errors.test.ts
- compilerOptions
- PushNotificationService
- compilerOptions
- compilerOptions
- event-log.ts
- workspace-browser.ts
- ComputerRegistry
- directory-browser.ts
- NewSessionDialog
- HubEvent
- capture
- desktop.json
- package.json
- settings-local.json
- TranscriptionError
- background-task-tracker.ts
- promotion-monitor.test.ts
- scripts
- phone
- bridge.rs
- SessionNavigation.test.tsx
- screenshot-stability.test.ts
- SessionFileUpload
- UserInputFieldControl
- knowledge-restore.ts
- WorkspaceFile
- settings.ts
- composer-layout.test.ts
- push-routes.ts
- release-publication.test.ts
- MockMediaRecorder
- MermaidDiagram.test.tsx
- tsconfig.json
- vite.config.ts
- @fastify/multipart
- @github/copilot-sdk
- lucide-react
- pdfjs-dist
- react-markdown
- ws
- zod
- sw.js
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 205 edges
2. `App()` - 192 edges
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
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (104 total, 19 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (12): agentMode(), AgentService, CopilotClientLike, isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isMissingSessionError(), persistedFormAnswer(), removeCopilotSessionFiles() (+4 more)

### Community 1 - "App"
Cohesion: 0.04
Nodes (119): cancelSession(), clearConversation(), getSession(), moveSessionToTmux(), removeQueuedPrompt(), reorderQueuedPrompts(), replyPermission(), replyUserInput() (+111 more)

### Community 2 - "App.tsx"
Cohesion: 0.04
Nodes (73): accentIconUrl(), applyAccentIcon(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+65 more)

### Community 3 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (27): RemoteResync, RemoteSessionListing, RemoteSessionRead, sessionAtLeastAsNew(), RegisteredComputer, RegistryState, StoredNodeIdentity, DEFINITE_DISPATCH_REFUSALS (+19 more)

### Community 4 - "SessionDetail"
Cohesion: 0.07
Nodes (20): fixture(), activityDuration(), activityResultPreview(), cloneSession(), DiscoveredSession, fixture(), PendingChange, fixture() (+12 more)

### Community 5 - "api.ts"
Cohesion: 0.05
Nodes (67): addComputer(), cancelBackgroundTask(), configureRuntime(), deleteKnowledgeRoot(), deletePushSubscription(), deleteSession(), dispatchQueuedPrompt(), executeCommand() (+59 more)

### Community 6 - "contracts.ts"
Cohesion: 0.05
Nodes (43): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+35 more)

### Community 7 - "ClaudeAgentService"
Cohesion: 0.07
Nodes (4): ClaudeAgentService, isMissingClaudeSessionError(), queueConflict(), RuntimeModelOption

### Community 8 - "queued-dispatch.test.ts"
Cohesion: 0.06
Nodes (27): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+19 more)

### Community 9 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (55): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+47 more)

### Community 10 - "ComputerManager"
Cohesion: 0.13
Nodes (9): ComputerManager, managedSession(), registerHubRoutes(), SessionMuteCarrier, createHub(), ComputerSummary, ManagedRemovedQueuedPrompt, ManagedSession (+1 more)

### Community 11 - "hub-routes.ts"
Cohesion: 0.06
Nodes (32): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+24 more)

### Community 12 - "react"
Cohesion: 0.05
Nodes (27): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+19 more)

### Community 13 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (43): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+35 more)

### Community 14 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 15 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 16 - "FakeSessionService"
Cohesion: 0.07
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 17 - "WorkspaceDialog"
Cohesion: 0.10
Nodes (33): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+25 more)

### Community 18 - "pwa.ts"
Cohesion: 0.10
Nodes (34): directories, AppVersion, parseAppVersion(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+26 more)

### Community 20 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 21 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 22 - "agent-service.ts"
Cohesion: 0.07
Nodes (36): ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+28 more)

### Community 23 - "TmuxTerminalSessionController"
Cohesion: 0.14
Nodes (9): capturePane(), copilotCommand(), execFileAsync, processCommand(), safeWindowName(), TmuxTerminalSessionController, PendingPermission, PendingUserInput (+1 more)

### Community 25 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 26 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (32): audit, frames, outputDir, phase, runtimeDir, { values }, BACKGROUND_SESSION_ID, CONTEXT_EXAMPLE (+24 more)

### Community 27 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 28 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (30): WorkspaceEntry, addKnowledgeRoot(), listKnowledgeEntries(), readKnowledgeFile(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown() (+22 more)

### Community 29 - "tmux-errors.integration.test.ts"
Cohesion: 0.14
Nodes (29): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+21 more)

### Community 31 - "agentic-remote"
Cohesion: 0.14
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 32 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 33 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (23): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), paneShowsText(), parseTerminalUpdateNotice(), bracketedTabPane (+15 more)

### Community 34 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (9): terminalFormSteps(), DeferredSession, directories, FakeCopilotClient, services, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind (+1 more)

### Community 35 - "app.ts"
Cohesion: 0.12
Nodes (18): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), ServerRole, transcriptionComputerName() (+10 more)

### Community 36 - "parseTerminalPermission"
Cohesion: 0.20
Nodes (25): activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), findTerminalWrappedText(), hasComposerAfter(), hasTerminalCommandPermissionQuestion(), isTerminalDesktopInstallPrompt() (+17 more)

### Community 37 - "session-presentation.ts"
Cohesion: 0.16
Nodes (24): attentionRank, computerTone(), executionModeName(), matchesSessionSearch(), providerName(), recentFirst(), sessionActivityTime(), sessionDay (+16 more)

### Community 38 - "session-store-providers.test.ts"
Cohesion: 0.09
Nodes (13): disk, fixtures, prompt(), releases, session(), claude(), clearFixture(), copilot() (+5 more)

### Community 39 - "terminal-session.ts"
Cohesion: 0.14
Nodes (26): COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasLiveTerminalComposer(), isTerminalChrome(), normaliseOutputLine() (+18 more)

### Community 40 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 41 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (12): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+4 more)

### Community 42 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 43 - ".handleSessionEvent"
Cohesion: 0.21
Nodes (20): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+12 more)

### Community 44 - "queued-provider-dispatch.test.ts"
Cohesion: 0.10
Nodes (14): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), claudeFixture(), copilotFixture(), copilotSession() (+6 more)

### Community 45 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 46 - "node-routes.ts"
Cohesion: 0.10
Nodes (20): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+12 more)

### Community 47 - "tmux-errors.test.ts"
Cohesion: 0.14
Nodes (16): listTmuxSessions(), processAncestors(), tmuxTargetForPid(), noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories (+8 more)

### Community 48 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 50 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 51 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 52 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 53 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 54 - "ComputerRegistry"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 55 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 56 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+8 more)

### Community 57 - "HubEvent"
Cohesion: 0.17
Nodes (8): WorkspaceFixture, ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, HubEvent

### Community 58 - "capture"
Cohesion: 0.20
Nodes (14): releaseRecording(), shortcutKeys(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode(), keyLabel() (+6 more)

### Community 59 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 60 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 61 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 62 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 63 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 64 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 65 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 66 - "phone"
Cohesion: 0.47
Nodes (10): assertConversation(), assertLayout(), capture(), desktop(), documentHeading(), expect, openGuide(), phone() (+2 more)

### Community 67 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 68 - "SessionNavigation.test.tsx"
Cohesion: 0.20
Nodes (8): actions, backgroundTasks, computers, offline, question, session, sessionsByComputer, worker

### Community 69 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 71 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 72 - "knowledge-restore.ts"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 74 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 75 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 76 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 78 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **474 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+469 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 725 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `SessionFileUpload`, `.get`, `ClaudeAgentService`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `qualifyingPasteCount()` connect `terminal-session.ts` to `tmux-errors.test.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `LocalTranscriptionService` connect `TranscriptionError` to `delegated-transcription-service.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _474 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.04251632680261229 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04051712648274024 - nodes in this community are weakly interconnected._
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
- `docs/design/agent-workspace.md`
- `docs/mockups/activity-view.html`
- `docs/mockups/brand-logo.html`
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
