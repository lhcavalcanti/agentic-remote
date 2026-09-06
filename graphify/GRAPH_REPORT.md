# Agentic Remote - Graphify code map

Snapshot: `841b5b9edbba024531c2876f16bcd5484af170b820a6fff869e52d3bd89e9daf`

Source checkout: `bbec1f00cfb40fc25521f2ac4eeb115ddae796bb`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 158 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 158 files · ~311,823 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2714 nodes · 7315 edges · 109 communities (79 shown, 17 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 509 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App.tsx
- App
- api.ts
- SessionDetail
- session-store-providers.test.ts
- ClaudeAgentService
- contracts.ts
- queueConflict
- RemoteNodeClient
- transcription-service.ts
- agentic-remote-promotion-monitor
- session-resources.ts
- background-task-adapter.ts
- bundle
- ComputerManager
- ProviderSessionService
- TmuxTerminalSessionController
- lib.rs
- FakeSessionService
- shell.ts
- pwa.ts
- WorkspaceDialog
- config.rs
- agent-service.ts
- SessionService
- devDependencies
- workspace-fixtures.ts
- computer-manager.ts
- app.ts
- ComputerRegistry
- dependencies
- hub-routes.ts
- terminal-session.ts
- knowledge-tree.ts
- agentic-remote
- agentic-remote-promotion-setup
- tmux-errors.integration.test.ts
- session-presentation.ts
- terminal-session.test.ts
- .handleSessionEvent
- agent-service.test.ts
- scripts
- parseTerminalPermission
- queued-dispatch.test.ts
- compilerOptions
- active-sessions.ts
- react
- node-routes.ts
- TerminalSessionController
- compilerOptions
- PushNotificationService
- compilerOptions
- compilerOptions
- event-log.ts
- workspace-browser.ts
- directory-browser.ts
- ReaderWorkspace
- NewSessionDialog
- session-resource-routes.test.ts
- tmux-errors.test.ts
- HubEvent
- desktop.json
- package.json
- .oxlintrc.json
- settings-local.json
- background-task-tracker.ts
- ResourceReads
- promotion-monitor.test.ts
- session-resource-transport.ts
- scripts
- phone
- bridge.rs
- SessionNavigation.test.tsx
- screenshot-stability.test.ts
- SessionFileUpload
- UserInputFieldControl
- knowledge-restore.ts
- settings.ts
- composer-layout.test.ts
- removeComputer
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
1. `SessionDetail` - 210 edges
2. `App()` - 198 edges
3. `AgentService` - 140 edges
4. `ClaudeAgentService` - 97 edges
5. `SessionStore` - 89 edges
6. `ComputerManager` - 73 edges
7. `SessionService` - 65 edges
8. `RemoteNodeClient` - 63 edges
9. `registerHubRoutes()` - 57 edges
10. `registerNodeRoutes()` - 51 edges

## Surprising Connections (you probably didn't know these)
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `copy()` --indirect_call--> `source()`  [INFERRED]
  src/MarkdownCodeBlock.tsx → server/session-resources.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (109 total, 17 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.06
Nodes (6): agentMode(), AgentService, isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError, statusFromEvents()

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (99): accentIconUrl(), applyAccentIcon(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+91 more)

### Community 2 - "App"
Cohesion: 0.05
Nodes (110): deleteSession(), replyPermission(), activeComposerPastes(), App(), answerUserInput(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot() (+102 more)

### Community 3 - "api.ts"
Cohesion: 0.04
Nodes (88): ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionSkillSummary, cancelBackgroundTask(), cancelSession(), clearConversation(), configureRuntime() (+80 more)

### Community 4 - "SessionDetail"
Cohesion: 0.06
Nodes (16): activityDuration(), activityResultPreview(), cloneSession(), PendingChange, PendingMutation, SessionProjection, SessionStore, StoredSession (+8 more)

### Community 5 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (37): CopilotClientLike, ClaudeSdk, directories, fixture(), queryHandle(), claudeFixture(), copilotFixture(), copilotSession() (+29 more)

### Community 6 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (5): ClaudeAgentService, isMissingClaudeSessionError(), waitForIdle(), toolResultText(), RuntimeModelOption

### Community 7 - "contracts.ts"
Cohesion: 0.06
Nodes (44): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, directories (+36 more)

### Community 8 - "queueConflict"
Cohesion: 0.09
Nodes (21): CopilotSessionLike, CopilotTasksApi, isClaudeAuthenticationError(), acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery() (+13 more)

### Community 9 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (12): RemoteNodeClient, client(), servers, session, RemoteNodeRedirectError, RemoteNodeRequestError, BackgroundTaskSnapshot, NodeInfo (+4 more)

### Community 10 - "transcription-service.ts"
Cohesion: 0.06
Nodes (34): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+26 more)

### Community 11 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (55): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+47 more)

### Community 12 - "session-resources.ts"
Cohesion: 0.12
Nodes (39): claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills, count(), enrichClaudeSkills() (+31 more)

### Community 13 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (44): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+36 more)

### Community 14 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 15 - "ComputerManager"
Cohesion: 0.18
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 17 - "TmuxTerminalSessionController"
Cohesion: 0.13
Nodes (12): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), tmuxTargetForPid() (+4 more)

### Community 18 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 19 - "FakeSessionService"
Cohesion: 0.07
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 20 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 21 - "pwa.ts"
Cohesion: 0.10
Nodes (35): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+27 more)

### Community 22 - "WorkspaceDialog"
Cohesion: 0.11
Nodes (35): executeCommand(), listWorkspace(), readWorkspaceFile(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+27 more)

### Community 23 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 24 - "agent-service.ts"
Cohesion: 0.07
Nodes (34): ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+26 more)

### Community 26 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 27 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (32): audit, frames, outputDir, phase, runtimeDir, { values }, BACKGROUND_SESSION_ID, CONTEXT_EXAMPLE (+24 more)

### Community 28 - "computer-manager.ts"
Cohesion: 0.09
Nodes (18): RemoteResync, RemoteSessionRead, RegistryState, DirectoryScope, AUDIO_FILENAME_HEADER, DEFINITE_DISPATCH_REFUSALS, headerSafe(), normalizeNodeUrl() (+10 more)

### Community 29 - "app.ts"
Cohesion: 0.10
Nodes (21): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+13 more)

### Community 30 - "ComputerRegistry"
Cohesion: 0.10
Nodes (7): sessionAtLeastAsNew(), ComputerRegistry, RegisteredComputer, directories, remoteSnapshotFixture(), NodeIdentityStore, ComputerSummary

### Community 31 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 32 - "hub-routes.ts"
Cohesion: 0.07
Nodes (27): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+19 more)

### Community 33 - "terminal-session.ts"
Cohesion: 0.12
Nodes (30): COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasComposerAfter(), hasLiveTerminalComposer(), isTerminalChrome() (+22 more)

### Community 34 - "knowledge-tree.ts"
Cohesion: 0.11
Nodes (28): WorkspaceEntry, addKnowledgeRoot(), listKnowledgeEntries(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+20 more)

### Community 35 - "agentic-remote"
Cohesion: 0.14
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 36 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 37 - "tmux-errors.integration.test.ts"
Cohesion: 0.11
Nodes (15): stopActiveCopilotSession(), KnowledgeState, KnowledgeStore, directories, createHub(), execFileAsync, headers, ignoreMissing() (+7 more)

### Community 38 - "session-presentation.ts"
Cohesion: 0.15
Nodes (25): attentionRank, computerTone(), executionModeName(), matchesSessionSearch(), providerName(), recentFirst(), sessionActivityTime(), sessionDay (+17 more)

### Community 39 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (22): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), terminalFormCommitKeys(), bracketedTabPane, deliveryFixture() (+14 more)

### Community 40 - ".handleSessionEvent"
Cohesion: 0.19
Nodes (22): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isRuntimeReasoningEffort() (+14 more)

### Community 41 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (8): DeferredSession, directories, FakeCopilotClient, services, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind, UserInputForm

### Community 42 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 43 - "parseTerminalPermission"
Cohesion: 0.22
Nodes (23): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), findTerminalWrappedText(), hasTerminalCommandPermissionQuestion(), isTerminalDesktopInstallPrompt() (+15 more)

### Community 44 - "queued-dispatch.test.ts"
Cohesion: 0.09
Nodes (15): accept(), deferred(), disk, fixture(), fixtures, holdWrite(), prompt(), releases (+7 more)

### Community 45 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 46 - "active-sessions.ts"
Cohesion: 0.18
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 47 - "react"
Cohesion: 0.10
Nodes (12): react, DocumentViewControls(), actions, outline, DocumentHeading, MarkdownCodeBlock(), copy(), originalClipboard (+4 more)

### Community 48 - "node-routes.ts"
Cohesion: 0.09
Nodes (21): StoredNodeIdentity, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+13 more)

### Community 49 - "TerminalSessionController"
Cohesion: 0.11
Nodes (4): persistedFormAnswer(), terminalFormSteps(), validateUserInputForm(), TerminalSessionController

### Community 50 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 52 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 53 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 54 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 55 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 56 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 57 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 58 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+8 more)

### Community 59 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 60 - "tmux-errors.test.ts"
Cohesion: 0.17
Nodes (12): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+4 more)

### Community 61 - "HubEvent"
Cohesion: 0.17
Nodes (8): WorkspaceFixture, ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, HubEvent

### Community 62 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 63 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 64 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 65 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 66 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 67 - "ResourceReads"
Cohesion: 0.21
Nodes (6): ActiveClaudeQuery, releases, session, snapshot, ResourceReads, resourceRequestHandler()

### Community 68 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 69 - "session-resource-transport.ts"
Cohesion: 0.24
Nodes (9): CopilotResourceClient, CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write() (+1 more)

### Community 70 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 71 - "phone"
Cohesion: 0.47
Nodes (10): assertConversation(), assertLayout(), capture(), desktop(), documentHeading(), expect, openGuide(), phone() (+2 more)

### Community 72 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 73 - "SessionNavigation.test.tsx"
Cohesion: 0.20
Nodes (8): actions, backgroundTasks, computers, offline, question, session, sessionsByComputer, worker

### Community 74 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

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

### Community 80 - "removeComputer"
Cohesion: 0.47
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 81 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 83 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **506 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+501 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 770 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `session-store-providers.test.ts`, `contracts.ts`, `queueConflict`, `.handleSessionEvent`, `SessionFileUpload`, `session-resources.ts`, `TerminalSessionController`, `computer-manager.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionDetail`, `tmux-errors.integration.test.ts`, `ClaudeAgentService`, `transcription-service.ts`, `ComputerManager`, `ProviderSessionService`, `PushNotificationService`, `SessionService`, `ComputerRegistry`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `SessionFileUpload`, `session-resources.ts`, `session-store-providers.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _506 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.0555301296720061 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.02745995423340961 - nodes in this community are weakly interconnected._
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
