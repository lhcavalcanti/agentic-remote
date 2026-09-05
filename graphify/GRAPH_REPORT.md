# Agentic Remote - Graphify code map

Snapshot: `208c93655bf78cc00ce6fa3821c53c509bdfa5da85d4e62ee57e13bf80555ae5`

Source checkout: `b12e1c7ce2bed96db1f8a0d21321163371922268`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 154 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 154 files · ~305,944 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2677 nodes · 7204 edges · 107 communities (76 shown, 18 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 509 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- SessionDetail
- AgentService
- SessionStore
- api.ts
- BackgroundTaskSnapshot
- agentic-remote-promotion-monitor
- RemoteNodeClient
- workspace-fixtures.ts
- computer-manager.ts
- session-resources.ts
- react
- .dispatchCommand
- background-task-adapter.ts
- bundle
- ComputerManager
- session-store-providers.test.ts
- queueConflict
- lib.rs
- SessionService
- TmuxTerminalSessionController
- WorkspaceDialog
- shell.ts
- config.rs
- FakeSessionService
- ProviderSessionService
- agent-service.ts
- contracts.ts
- pwa.ts
- devDependencies
- tmux-errors.integration.test.ts
- dependencies
- terminal-session.ts
- node-routes.ts
- agentic-remote
- agentic-remote-promotion-setup
- terminal-session.test.ts
- knowledge-tree.ts
- hub-routes.ts
- delegated-transcription-service.ts
- scripts
- directory-browser.ts
- .handleSessionEvent
- app.ts
- compilerOptions
- active-sessions.ts
- transcription-service.ts
- parseTerminalPermission
- PushNotificationService
- compilerOptions
- CopilotSessionLike
- agent-service.test.ts
- NewSessionDialog
- compilerOptions
- HubEvent
- compilerOptions
- session-resource-routes.test.ts
- event-log.ts
- workspace-browser.ts
- ComputerSummary
- ComputerRegistry
- tmux-errors.test.ts
- desktop.json
- claude-agent-service.ts
- capture
- package.json
- settings-local.json
- TranscriptionError
- promotion-monitor.test.ts
- scripts
- bridge.rs
- SessionFileUpload
- UserInputFieldControl
- knowledge-restore.ts
- settings.ts
- commitSidebarWidth
- composer-layout.test.ts
- SessionRuntimeInfo
- release-publication.test.ts
- MockMediaRecorder
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
1. `SessionDetail` - 209 edges
2. `App()` - 197 edges
3. `AgentService` - 138 edges
4. `ClaudeAgentService` - 95 edges
5. `SessionStore` - 89 edges
6. `ComputerManager` - 73 edges
7. `SessionService` - 64 edges
8. `RemoteNodeClient` - 63 edges
9. `registerHubRoutes()` - 56 edges
10. `registerNodeRoutes()` - 51 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `StoredSession` --inherits--> `SessionDetail`  [EXTRACTED]
  server/session-store.ts → shared/contracts.ts
- `copy()` --indirect_call--> `source()`  [INFERRED]
  src/MarkdownCodeBlock.tsx → server/session-resources.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (107 total, 18 thin omitted)

### Community 0 - "App"
Cohesion: 0.05
Nodes (109): deleteKnowledgeRoot(), activeComposerPastes(), App(), answerUserInput(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession() (+101 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (86): accentIconUrl(), applyAccentIcon(), addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage() (+78 more)

### Community 2 - "SessionDetail"
Cohesion: 0.05
Nodes (7): ClaudeAgentService, isMissingClaudeSessionError(), ChatMessage, QueuedPrompt, RuntimeModelOption, SessionDetail, SessionStatus

### Community 3 - "AgentService"
Cohesion: 0.06
Nodes (8): agentMode(), AgentService, isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError, statusFromEvents()

### Community 4 - "SessionStore"
Cohesion: 0.04
Nodes (41): CopilotClientLike, ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), fixture(), claudeFixture() (+33 more)

### Community 5 - "api.ts"
Cohesion: 0.06
Nodes (78): addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), deleteSession(), dispatchQueuedPrompt(), getProviderRuntimeOptions(), getPushSettings() (+70 more)

### Community 6 - "BackgroundTaskSnapshot"
Cohesion: 0.07
Nodes (40): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot, attentionRank (+32 more)

### Community 7 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (55): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+47 more)

### Community 8 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (11): RemoteNodeClient, RemoteNodeRequestError, client(), servers, session, NodeInfo, RemovedQueuedPrompt, WorkspaceFile (+3 more)

### Community 9 - "workspace-fixtures.ts"
Cohesion: 0.06
Nodes (47): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+39 more)

### Community 10 - "computer-manager.ts"
Cohesion: 0.08
Nodes (27): ClaudeAgentServiceEvents, RemoteResync, RemoteSessionRead, RegistryState, directories, StoredNodeIdentity, ProviderSessionServiceEvents, provider() (+19 more)

### Community 11 - "session-resources.ts"
Cohesion: 0.12
Nodes (37): claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills, count(), enrichClaudeSkills() (+29 more)

### Community 12 - "react"
Cohesion: 0.05
Nodes (28): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+20 more)

### Community 13 - ".dispatchCommand"
Cohesion: 0.08
Nodes (6): persistedFormAnswer(), validateUserInputForm(), QueuedDelivery, accept(), unknownClaim(), TerminalSessionController

### Community 14 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (43): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+35 more)

### Community 15 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 16 - "ComputerManager"
Cohesion: 0.18
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 17 - "session-store-providers.test.ts"
Cohesion: 0.05
Nodes (21): deferred(), disk, fixtures, holdWrite(), prompt(), releases, target, disk (+13 more)

### Community 18 - "queueConflict"
Cohesion: 0.11
Nodes (13): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), queueConflict() (+5 more)

### Community 19 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 21 - "TmuxTerminalSessionController"
Cohesion: 0.13
Nodes (12): capturePane(), copilotCommand(), execFileAsync, processAncestors(), processCommand(), submitTerminalForm(), terminalChecklistState(), terminalFormCommitKeys() (+4 more)

### Community 22 - "WorkspaceDialog"
Cohesion: 0.10
Nodes (33): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+25 more)

### Community 23 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 24 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 25 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 27 - "agent-service.ts"
Cohesion: 0.07
Nodes (35): ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+27 more)

### Community 28 - "contracts.ts"
Cohesion: 0.07
Nodes (32): ActivityStatus, AddKnowledgeRootInput, AgentMode, BackgroundTaskAttachmentMode, BackgroundTaskExecutionMode, BackgroundTaskProgress, BackgroundTaskProgressLine, BackgroundTaskStatus (+24 more)

### Community 29 - "pwa.ts"
Cohesion: 0.11
Nodes (33): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), testNotification() (+25 more)

### Community 30 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 31 - "tmux-errors.integration.test.ts"
Cohesion: 0.09
Nodes (16): stopActiveCopilotSession(), SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, createHub(), execFileAsync, headers (+8 more)

### Community 32 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 33 - "terminal-session.ts"
Cohesion: 0.12
Nodes (29): COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasComposerAfter(), isTerminalAgentWorking(), normaliseOutputLine() (+21 more)

### Community 34 - "node-routes.ts"
Cohesion: 0.08
Nodes (26): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+18 more)

### Community 35 - "agentic-remote"
Cohesion: 0.14
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 36 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 37 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (23): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), paneShowsText(), parseTerminalUpdateNotice(), bracketedTabPane (+15 more)

### Community 38 - "knowledge-tree.ts"
Cohesion: 0.12
Nodes (26): WorkspaceEntry, cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder(), openKnowledgeFile() (+18 more)

### Community 39 - "hub-routes.ts"
Cohesion: 0.08
Nodes (27): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+19 more)

### Community 40 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (14): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+6 more)

### Community 41 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 42 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 43 - ".handleSessionEvent"
Cohesion: 0.20
Nodes (21): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isRuntimeReasoningEffort() (+13 more)

### Community 44 - "app.ts"
Cohesion: 0.13
Nodes (15): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+7 more)

### Community 45 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 46 - "active-sessions.ts"
Cohesion: 0.18
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 47 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 48 - "parseTerminalPermission"
Cohesion: 0.28
Nodes (20): activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), findTerminalWrappedText(), hasLiveTerminalComposer(), hasTerminalCommandPermissionQuestion(), isTerminalChrome() (+12 more)

### Community 50 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 51 - "CopilotSessionLike"
Cohesion: 0.13
Nodes (6): CopilotSessionLike, FakeCopilotClient, CopilotTasksApi, queuedSdkPrompt(), disposals, fixture()

### Community 52 - "agent-service.test.ts"
Cohesion: 0.12
Nodes (8): terminalFormSteps(), DeferredSession, directories, services, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind, UserInputForm

### Community 53 - "NewSessionDialog"
Cohesion: 0.16
Nodes (20): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+12 more)

### Community 54 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 55 - "HubEvent"
Cohesion: 0.12
Nodes (12): WorkspaceFixture, ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, sessionMuteSchema (+4 more)

### Community 56 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 57 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, ResourceService, transcription, AgentProviderCapability

### Community 58 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 59 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 60 - "ComputerSummary"
Cohesion: 0.21
Nodes (3): sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 61 - "ComputerRegistry"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 62 - "tmux-errors.test.ts"
Cohesion: 0.17
Nodes (12): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+4 more)

### Community 63 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 64 - "claude-agent-service.ts"
Cohesion: 0.18
Nodes (12): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+4 more)

### Community 65 - "capture"
Cohesion: 0.22
Nodes (13): shortcutKeys(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode(), keyLabel(), readStoredShortcuts() (+5 more)

### Community 66 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 67 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 68 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 69 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 70 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 71 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 73 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 74 - "knowledge-restore.ts"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 75 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 76 - "commitSidebarWidth"
Cohesion: 0.29
Nodes (7): commitSidebarWidth(), sidebarResizeEnd(), sidebarResizeKeyDown(), sidebarResizeMove(), clampSidebarWidth(), readStoredSidebarWidth(), writeStored()

### Community 77 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 78 - "SessionRuntimeInfo"
Cohesion: 0.50
Nodes (3): listTmuxSessions(), safeWindowName(), SessionRuntimeInfo

### Community 80 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **499 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+494 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 757 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `delegated-transcription-service.ts`, `computer-manager.ts`, `SessionFileUpload`, `directory-browser.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `PushNotificationService` connect `PushNotificationService` to `HubEvent`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _499 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04519595448798989 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.03108910891089109 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.05322953923837576 - nodes in this community are weakly interconnected._
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
