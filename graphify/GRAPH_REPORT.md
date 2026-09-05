# Agentic Remote - Graphify code map

Snapshot: `f51c29233c02df9e5ff7b4f688c68d86de9b5be419436a9c307e03b960e85301`

Source checkout: `848114bf112e1438d92ff47610bbd7e54ed86e86`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 129 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 129 files · ~220,992 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2209 nodes · 5597 edges · 104 communities (70 shown, 20 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 366 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- ClaudeAgentService
- App.tsx
- api.ts
- SessionDetail
- agentic-remote-promotion-monitor
- SessionStore
- background-task-adapter.ts
- workspace-fixtures.ts
- claude-agent-service.ts
- bundle
- lib.rs
- shell.ts
- AgentService
- ComputerManager
- WorkspaceDialog
- config.rs
- contracts.ts
- SessionService
- TmuxTerminalSessionController
- pwa.ts
- PushNotificationService
- devDependencies
- agent-service.ts
- ProviderSessionService
- dependencies
- agentic-remote-promotion-setup
- agent-service.test.ts
- terminal-session.ts
- agentic-remote
- react
- session-presentation.ts
- hub-routes.ts
- scripts
- TerminalSessionController
- node-routes.ts
- terminal-session.test.ts
- directory-browser.ts
- delegated-transcription-service.ts
- compilerOptions
- .handleSessionEvent
- BackgroundTaskSnapshot
- transcription-service.ts
- active-sessions.ts
- .publish
- .clearSerialized
- knowledge-tree.ts
- compilerOptions
- app.ts
- KnowledgeStore
- compilerOptions
- compilerOptions
- ComputerSummary
- NodeIdentityStore
- event-log.ts
- workspace-browser.ts
- NewSessionDialog
- capture
- desktop.json
- package.json
- settings-local.json
- .discoverSessions
- TranscriptionError
- background-task-tracker.ts
- scripts
- .recoverTerminalSessions
- promotion-monitor.test.ts
- composerTookPaste
- bridge.rs
- SessionNavigation.test.tsx
- UserInputFieldControl
- knowledge-restore.ts
- settings.ts
- composer-layout.test.ts
- transcription-routes.ts
- release-publication.test.ts
- MockMediaRecorder
- ActivityKind
- MockWebSocket
- MermaidDiagram.test.tsx
- tsconfig.json
- vite.config.ts
- @fastify/multipart
- lucide-react
- pdfjs-dist
- react
- web-push
- zod
- sw.js
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 182 edges
2. `App()` - 157 edges
3. `AgentService` - 111 edges
4. `ClaudeAgentService` - 77 edges
5. `ComputerManager` - 64 edges
6. `SessionStore` - 60 edges
7. `RemoteNodeClient` - 53 edges
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
- `StoredSession` --inherits--> `SessionDetail`  [EXTRACTED]
  server/session-store.ts → shared/contracts.ts
- `KnowledgeFolderState` --references--> `WorkspaceListing`  [EXTRACTED]
  src/knowledge-tree.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (104 total, 20 thin omitted)

### Community 0 - "App"
Cohesion: 0.05
Nodes (86): addKnowledgeRoot(), App(), answerUserInput(), appendComposerForKey(), appKeyDown(), askAboutKnowledgeFile(), attachedFiles(), audioDropped() (+78 more)

### Community 1 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (10): ClaudeAgentService, ClaudeSdk, isClaudeAuthenticationError(), isMissingClaudeSessionError(), directories, fixture(), queryHandle(), waitForIdle() (+2 more)

### Community 2 - "App.tsx"
Cohesion: 0.04
Nodes (66): ActivityStatus, UserInputField, UserInputFieldValue, applyAccentIcon(), addComputer(), configureRuntime(), removeComputer(), AccentTheme (+58 more)

### Community 3 - "api.ts"
Cohesion: 0.08
Nodes (53): cancelBackgroundTask(), cancelSession(), clearConversation(), deleteKnowledgeRoot(), deleteSession(), getProviderRuntimeOptions(), getPushSettings(), getRuntimeOptions() (+45 more)

### Community 4 - "SessionDetail"
Cohesion: 0.07
Nodes (3): FakeSessionService, RemoteNodeClient, SessionDetail

### Community 5 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (53): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+45 more)

### Community 6 - "SessionStore"
Cohesion: 0.08
Nodes (12): resolveDataDirectory(), activityDuration(), activityResultPreview(), DiscoveredSession, safeUploadName(), SessionStore, StoredSession, StoredState (+4 more)

### Community 7 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (47): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+39 more)

### Community 8 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (43): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+35 more)

### Community 9 - "claude-agent-service.ts"
Cohesion: 0.08
Nodes (21): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, PendingClaudeInput, PendingClaudePermission, directories (+13 more)

### Community 10 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 11 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 12 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 14 - "ComputerManager"
Cohesion: 0.20
Nodes (6): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedSession, SessionListing

### Community 15 - "WorkspaceDialog"
Cohesion: 0.10
Nodes (31): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+23 more)

### Community 16 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 17 - "contracts.ts"
Cohesion: 0.09
Nodes (27): ComputerManagerEvents, RemoteResync, RemoteSessionRead, RegistryState, StoredNodeIdentity, directories, headerSafe(), normalizeNodeUrl() (+19 more)

### Community 19 - "TmuxTerminalSessionController"
Cohesion: 0.15
Nodes (11): capturePane(), copilotCommand(), execFileAsync, listTmuxSessions(), noTmuxServer(), processAncestors(), processCommand(), safeWindowName() (+3 more)

### Community 20 - "pwa.ts"
Cohesion: 0.11
Nodes (33): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), testNotification() (+25 more)

### Community 21 - "PushNotificationService"
Cohesion: 0.13
Nodes (10): brief(), HubEventSource, PushNotificationService, PushSender, PushState, registerPushRoutes(), sessionMuteSchema, subscriptionSchema (+2 more)

### Community 22 - "devDependencies"
Cohesion: 0.06
Nodes (33): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+25 more)

### Community 23 - "agent-service.ts"
Cohesion: 0.07
Nodes (32): ActivePrompt, activityDuration(), activityGroupIdFor(), AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime, ElicitationContext (+24 more)

### Community 25 - "dependencies"
Cohesion: 0.06
Nodes (31): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+23 more)

### Community 26 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 27 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (10): CopilotSessionLike, terminalFormSteps(), DeferredSession, directories, FakeCopilotClient, CopilotTaskInfo, CopilotTaskProgress, CopilotTasksApi (+2 more)

### Community 28 - "terminal-session.ts"
Cohesion: 0.14
Nodes (28): cleanDialogLine(), COMPOSER_PLACEHOLDERS, isTerminalChrome(), isTerminalOverlay(), isTerminalSessionInUsePrompt(), normaliseOutputLine(), parseTerminalFolderTrust(), parseTerminalFormActiveField() (+20 more)

### Community 29 - "agentic-remote"
Cohesion: 0.15
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 30 - "react"
Cohesion: 0.08
Nodes (19): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+11 more)

### Community 31 - "session-presentation.ts"
Cohesion: 0.16
Nodes (24): attentionRank, computerTone(), executionModeName(), matchesSessionSearch(), providerName(), recentFirst(), sessionActivityTime(), sessionDay (+16 more)

### Community 32 - "hub-routes.ts"
Cohesion: 0.08
Nodes (24): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+16 more)

### Community 33 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 34 - "TerminalSessionController"
Cohesion: 0.10
Nodes (5): persistedFormAnswer(), validateUserInputForm(), TerminalSessionController, PendingPermission, PendingUserInput

### Community 35 - "node-routes.ts"
Cohesion: 0.09
Nodes (23): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+15 more)

### Community 36 - "terminal-session.test.ts"
Cohesion: 0.12
Nodes (22): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), isTerminalAgentWorking(), parseTerminalUpdateNotice(), bracketedTabPane (+14 more)

### Community 37 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 38 - "delegated-transcription-service.ts"
Cohesion: 0.12
Nodes (12): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+4 more)

### Community 39 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 40 - ".handleSessionEvent"
Cohesion: 0.21
Nodes (20): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+12 more)

### Community 41 - "BackgroundTaskSnapshot"
Cohesion: 0.10
Nodes (4): RemoteNodeRequestError, BackgroundTaskSnapshot, WorkspaceFile, WorkspaceListing

### Community 42 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 43 - "active-sessions.ts"
Cohesion: 0.20
Nodes (22): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+14 more)

### Community 44 - ".publish"
Cohesion: 0.19
Nodes (4): agentMode(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents()

### Community 45 - ".clearSerialized"
Cohesion: 0.17
Nodes (3): CopilotClientLike, isMissingSessionError(), removeCopilotSessionFiles()

### Community 46 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 47 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 49 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+5 more)

### Community 50 - "KnowledgeStore"
Cohesion: 0.15
Nodes (6): KnowledgeState, KnowledgeStore, directories, KnowledgeRoot, KnowledgeRootSelector(), roots

### Community 51 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 52 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 53 - "ComputerSummary"
Cohesion: 0.19
Nodes (3): sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 54 - "NodeIdentityStore"
Cohesion: 0.17
Nodes (5): ComputerRegistry, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore

### Community 55 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 56 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 57 - "NewSessionDialog"
Cohesion: 0.17
Nodes (19): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), ChangeDirectoryDialog() (+11 more)

### Community 58 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 59 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 60 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 61 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 63 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 64 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 65 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 67 - "promotion-monitor.test.ts"
Cohesion: 0.31
Nodes (9): advanceMain(), calls(), Fixture, fixtures, git(), monitor(), remoteScripts(), run (+1 more)

### Community 68 - "composerTookPaste"
Cohesion: 0.33
Nodes (11): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse() (+3 more)

### Community 69 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 70 - "SessionNavigation.test.tsx"
Cohesion: 0.20
Nodes (8): actions, backgroundTasks, computers, offline, question, session, sessionsByComputer, worker

### Community 71 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 72 - "knowledge-restore.ts"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 73 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 74 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 77 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **418 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+413 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 627 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `SessionDetail` to `BackgroundTaskSnapshot`, `directory-browser.ts`, `claude-agent-service.ts`, `contracts.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `ClaudeAgentService`, `.recoverTerminalSessions`, `.publish`, `.clearSerialized`, `ActivityKind`, `.get`, `.discoverSessions`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `qualifyingPasteCount()` connect `composerTookPaste` to `TmuxTerminalSessionController`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _418 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04893882646691636 - nodes in this community are weakly interconnected._
- **Should `ClaudeAgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.05209274314965372 - nodes in this community are weakly interconnected._
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
