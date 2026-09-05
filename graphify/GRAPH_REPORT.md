# Agentic Remote - Graphify code map

Snapshot: `7eb7afe4c4a7139fa9bc98e81957c3b194c56e43bd72e444a9f4aab6043166cd`

Source checkout: `53e17244591b8ff0149ea78308f083045d185064`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 145 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 145 files · ~292,292 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2535 nodes · 6657 edges · 111 communities (77 shown, 21 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 466 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- AgentService
- ClaudeAgentService
- contracts.ts
- api.ts
- agent-service.ts
- agentic-remote-promotion-monitor
- SessionDetail
- queueConflict
- SessionService
- background-task-adapter.ts
- react
- bundle
- terminal-session.ts
- FakeSessionService
- ProviderSessionService
- TmuxTerminalSessionController
- lib.rs
- RemoteNodeClient
- WorkspaceDialog
- .get
- shell.ts
- config.rs
- pwa.ts
- devDependencies
- workspace-fixtures.ts
- queued-provider-dispatch.test.ts
- dependencies
- claude-agent-service.ts
- agentic-remote
- agentic-remote-promotion-setup
- knowledge-tree.ts
- ManagedSession
- terminal-session.test.ts
- session-store-providers.test.ts
- session-presentation.ts
- hub-routes.ts
- scripts
- delegated-transcription-service.ts
- compilerOptions
- active-sessions.ts
- tmux-errors.integration.test.ts
- transcription-service.ts
- registerHubRoutes
- app.ts
- ComputerManager
- node-routes.ts
- NewSessionDialog
- compilerOptions
- session-store.ts
- PushNotificationService
- compilerOptions
- compilerOptions
- BackgroundTaskSnapshot
- event-log.ts
- ComputerRegistry
- workspace-browser.ts
- HubEvent
- queued-dispatch.test.ts
- desktop.json
- capture
- package.json
- settings-local.json
- composerTookPaste
- TranscriptionError
- file-upload-routes.ts
- promotion-monitor.test.ts
- scripts
- phone
- DeferredSession
- bridge.rs
- SessionNavigation.test.tsx
- screenshot-stability.test.ts
- session-store-durability.test.ts
- FakeCopilotClient
- UserInputFieldControl
- knowledge-restore.ts
- settings.ts
- composer-layout.test.ts
- push-routes.ts
- .providerRuntimeOptions
- release-publication.test.ts
- MockMediaRecorder
- KnowledgeRootSelector.tsx
- MockWebSocket
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
7. `SessionService` - 57 edges
8. `RemoteNodeClient` - 56 edges
9. `registerHubRoutes()` - 53 edges
10. `FakeSessionService` - 47 edges

## Surprising Connections (you probably didn't know these)
- `StoredSession` --inherits--> `SessionDetail`  [EXTRACTED]
  server/session-store.ts → shared/contracts.ts
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `KnowledgeFolderState` --references--> `WorkspaceListing`  [EXTRACTED]
  src/knowledge-tree.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (111 total, 21 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (113): deleteKnowledgeRoot(), activeComposerPastes(), App(), answerUserInput(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession() (+105 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (84): ActivityStatus, accentIconUrl(), applyAccentIcon(), addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes (+76 more)

### Community 2 - "AgentService"
Cohesion: 0.07
Nodes (4): agentMode(), AgentService, isMissingSessionError(), removeCopilotSessionFiles()

### Community 3 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (4): ClaudeAgentService, isMissingClaudeSessionError(), QueuedDispatchTarget, RuntimeModelOption

### Community 4 - "contracts.ts"
Cohesion: 0.06
Nodes (45): AgentServiceEvents, CreationRuntime, ClaudeAgentServiceEvents, RemoteResync, RemoteSessionRead, RegistryState, directories, StoredNodeIdentity (+37 more)

### Community 5 - "api.ts"
Cohesion: 0.07
Nodes (63): AddKnowledgeRootInput, PushSettings, addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), deleteSession(), dispatchQueuedPrompt() (+55 more)

### Community 6 - "agent-service.ts"
Cohesion: 0.06
Nodes (62): ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence, commandShortcut() (+54 more)

### Community 7 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (55): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+47 more)

### Community 8 - "SessionDetail"
Cohesion: 0.09
Nodes (6): cloneSession(), SessionStore, createStore(), temporaryDirectories, QueuedPrompt, SessionDetail

### Community 9 - "queueConflict"
Cohesion: 0.08
Nodes (19): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+11 more)

### Community 11 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (47): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+39 more)

### Community 12 - "react"
Cohesion: 0.05
Nodes (27): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+19 more)

### Community 13 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 14 - "terminal-session.ts"
Cohesion: 0.13
Nodes (40): activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), findTerminalWrappedText(), hasComposerAfter(), hasLiveTerminalComposer() (+32 more)

### Community 15 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 17 - "TmuxTerminalSessionController"
Cohesion: 0.13
Nodes (12): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), terminalChecklistState() (+4 more)

### Community 18 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 19 - "RemoteNodeClient"
Cohesion: 0.08
Nodes (6): RemoteNodeClient, RemoteNodeRequestError, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing

### Community 20 - "WorkspaceDialog"
Cohesion: 0.10
Nodes (33): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+25 more)

### Community 21 - ".get"
Cohesion: 0.11
Nodes (3): persistedFormAnswer(), validateUserInputForm(), TerminalSessionController

### Community 22 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 23 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 24 - "pwa.ts"
Cohesion: 0.11
Nodes (33): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), testNotification() (+25 more)

### Community 25 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 26 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (32): audit, frames, outputDir, phase, runtimeDir, { values }, BACKGROUND_SESSION_ID, CONTEXT_EXAMPLE (+24 more)

### Community 27 - "queued-provider-dispatch.test.ts"
Cohesion: 0.08
Nodes (13): CopilotClientLike, fixture(), claudeFixture(), copilotFixture(), copilotSession(), fixtures, gate(), originalQueue (+5 more)

### Community 28 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 29 - "claude-agent-service.ts"
Cohesion: 0.12
Nodes (21): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, toolResultText() (+13 more)

### Community 30 - "agentic-remote"
Cohesion: 0.14
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 31 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 32 - "knowledge-tree.ts"
Cohesion: 0.11
Nodes (27): WorkspaceEntry, cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder(), openKnowledgeFile() (+19 more)

### Community 33 - "ManagedSession"
Cohesion: 0.10
Nodes (5): managedSession(), RemoteSessionListing, sessionAtLeastAsNew(), ManagedSession, SessionListing

### Community 34 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (22): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), parseTerminalUpdateNotice(), bracketedTabPane, deliveryFixture() (+14 more)

### Community 35 - "session-store-providers.test.ts"
Cohesion: 0.08
Nodes (14): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), claude(), clearFixture(), copilot() (+6 more)

### Community 36 - "session-presentation.ts"
Cohesion: 0.16
Nodes (24): attentionRank, computerTone(), executionModeName(), matchesSessionSearch(), providerName(), recentFirst(), sessionActivityTime(), sessionDay (+16 more)

### Community 37 - "hub-routes.ts"
Cohesion: 0.08
Nodes (26): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+18 more)

### Community 38 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 39 - "delegated-transcription-service.ts"
Cohesion: 0.12
Nodes (12): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+4 more)

### Community 40 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 41 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 42 - "tmux-errors.integration.test.ts"
Cohesion: 0.12
Nodes (19): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer(), noTmuxServer() (+11 more)

### Community 43 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 44 - "registerHubRoutes"
Cohesion: 0.16
Nodes (7): registerHubRoutes(), SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, createHub(), KnowledgeRoot

### Community 45 - "app.ts"
Cohesion: 0.14
Nodes (14): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+6 more)

### Community 46 - "ComputerManager"
Cohesion: 0.20
Nodes (4): ComputerManager, RegisteredComputer, ComputerSummary, ManagedRemovedQueuedPrompt

### Community 47 - "node-routes.ts"
Cohesion: 0.10
Nodes (20): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+12 more)

### Community 48 - "NewSessionDialog"
Cohesion: 0.15
Nodes (21): provider(), activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+13 more)

### Community 49 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 50 - "session-store.ts"
Cohesion: 0.13
Nodes (13): activityDuration(), activityResultPreview(), DiscoveredSession, PendingChange, safeUploadName(), SessionProjection, StoredSession, StoredState (+5 more)

### Community 52 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 53 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 54 - "BackgroundTaskSnapshot"
Cohesion: 0.20
Nodes (8): isUnsupportedBackgroundTaskError(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 55 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 56 - "ComputerRegistry"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 57 - "workspace-browser.ts"
Cohesion: 0.26
Nodes (13): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+5 more)

### Community 58 - "HubEvent"
Cohesion: 0.17
Nodes (8): WorkspaceFixture, ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, HubEvent

### Community 59 - "queued-dispatch.test.ts"
Cohesion: 0.14
Nodes (8): accept(), deferred(), disk, fixtures, holdWrite(), prompt(), releases, target

### Community 60 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 61 - "capture"
Cohesion: 0.22
Nodes (13): shortcutKeys(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode(), keyLabel(), readStoredShortcuts() (+5 more)

### Community 62 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 63 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 64 - "composerTookPaste"
Cohesion: 0.26
Nodes (12): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText() (+4 more)

### Community 65 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 66 - "file-upload-routes.ts"
Cohesion: 0.24
Nodes (7): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), transcriptionMultipartOptions

### Community 67 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 68 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 69 - "phone"
Cohesion: 0.47
Nodes (10): assertConversation(), assertLayout(), capture(), desktop(), documentHeading(), expect, openGuide(), phone() (+2 more)

### Community 71 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 72 - "SessionNavigation.test.tsx"
Cohesion: 0.20
Nodes (8): actions, backgroundTasks, computers, offline, question, session, sessionsByComputer, worker

### Community 73 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 74 - "session-store-durability.test.ts"
Cohesion: 0.29
Nodes (5): disk, fixtures, prompt(), releases, session()

### Community 76 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 77 - "knowledge-restore.ts"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 78 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 79 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 80 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 83 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **472 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+467 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 722 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `ClaudeAgentService`, `session-store.ts`, `.get`, `queued-provider-dispatch.test.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `TmuxTerminalSessionController` connect `TmuxTerminalSessionController` to `composerTookPaste`, `active-sessions.ts`, `.get`, `terminal-session.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _472 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.042735042735042736 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.031348621922996 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.06820987654320988 - nodes in this community are weakly interconnected._
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
