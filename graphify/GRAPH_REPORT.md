# Agentic Remote - Graphify code map

Snapshot: `acf5bee635595bcff458c7c547f9aff4103592073802d0db9d64ec4cf6b3fb7d`

Source checkout: `0eeb2f8ba04008dc796d0c7789354c3fd96f015f`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 118 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 118 files · ~229,963 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2208 nodes · 5700 edges · 111 communities (75 shown, 20 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 413 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- SessionDetail
- ClaudeAgentService
- AgentService
- agentic-remote-promotion-monitor
- api.ts
- background-task-adapter.ts
- RemoteNodeClient
- bundle
- contracts.ts
- lib.rs
- .publish
- SessionService
- config.rs
- agent-service.ts
- pwa.ts
- session-store.ts
- claude-agent-service.ts
- PushNotificationService
- TmuxTerminalSessionController
- devDependencies
- terminal-session.ts
- ProviderSessionService
- WorkspaceDialog
- FakeSessionService
- agentic-remote-promotion-setup
- session-store-providers.test.ts
- ManagedSession
- dependencies
- agentic-remote
- terminal-session.test.ts
- knowledge-tree.ts
- scripts
- shell.ts
- node-routes.ts
- TerminalSessionController
- transcription-service.ts
- compilerOptions
- hub-routes.ts
- active-sessions.ts
- NewSessionDialog
- compilerOptions
- .handleSessionEvent
- app.ts
- session-reply-durability.test.ts
- registerHubRoutes
- compilerOptions
- compilerOptions
- directory-browser.ts
- ComputerManager
- NodeIdentityStore
- event-log.ts
- workspace-browser.ts
- agent-service.test.ts
- delegated-transcription-service.ts
- BackgroundTaskSnapshot
- capture
- .configureRuntime
- desktop.json
- .oxlintrc.json
- settings-local.json
- CopilotSessionLike
- .sendInternal
- TranscriptionError
- shell-notifications.ts
- TranscriptionService
- scripts
- multi-node.test.ts
- promotion-monitor.test.ts
- bridge.rs
- package.json
- .syncTranscripts
- UserInputFieldControl
- settings.ts
- knowledge-restore.ts
- toolActivityContent
- composer-layout.test.ts
- removeComputer
- release-publication.test.ts
- MockMediaRecorder
- MermaidDiagram.tsx
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
1. `SessionDetail` - 202 edges
2. `App()` - 152 edges
3. `AgentService` - 128 edges
4. `ClaudeAgentService` - 86 edges
5. `SessionStore` - 82 edges
6. `ComputerManager` - 64 edges
7. `RemoteNodeClient` - 55 edges
8. `SessionService` - 52 edges
9. `registerHubRoutes()` - 46 edges
10. `FakeSessionService` - 43 edges

## Surprising Connections (you probably didn't know these)
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `StoredSession` --inherits--> `SessionDetail`  [EXTRACTED]
  server/session-store.ts → shared/contracts.ts
- `ActivityToolStart` --references--> `ActivityKind`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (111 total, 20 thin omitted)

### Community 0 - "App"
Cohesion: 0.05
Nodes (75): deleteKnowledgeRoot(), App(), answerUserInput(), appendComposerForKey(), appKeyDown(), attachedFiles(), audioDropped(), audioFileChanged() (+67 more)

### Community 1 - "App.tsx"
Cohesion: 0.04
Nodes (62): applyAccentIcon(), configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+54 more)

### Community 2 - "SessionDetail"
Cohesion: 0.08
Nodes (11): PendingClaudeReply, toolResultText(), cloneSession(), holdOtherWrite(), SessionReplacementCleanupError, SessionStore, ChatMessage, QueuedPrompt (+3 more)

### Community 3 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (5): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), QueuedPromptReservation, RuntimeModelOption

### Community 4 - "AgentService"
Cohesion: 0.08
Nodes (3): AgentService, commandShortcut(), isTerminalAgentWorking()

### Community 5 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (53): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+45 more)

### Community 6 - "api.ts"
Cohesion: 0.10
Nodes (48): cancelBackgroundTask(), cancelSession(), clearConversation(), deleteSession(), getProviderRuntimeOptions(), getPushSettings(), getRuntimeOptions(), getSession() (+40 more)

### Community 7 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (46): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+38 more)

### Community 8 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (10): RemoteNodeClient, RemoteNodeRedirectError, RemoteNodeRequestError, client(), servers, session, NodeInfo, WorkspaceFile (+2 more)

### Community 9 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 10 - "contracts.ts"
Cohesion: 0.07
Nodes (28): ComputerManagerEvents, RemoteResync, RemoteSessionRead, RegistryState, StoredNodeIdentity, directories, headerSafe(), normalizeNodeUrl() (+20 more)

### Community 11 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 12 - ".publish"
Cohesion: 0.11
Nodes (5): CopilotClientLike, isMissingSessionError(), isRuntimeReasoningEffort(), permissionTitle(), removeCopilotSessionFiles()

### Community 14 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 15 - "agent-service.ts"
Cohesion: 0.06
Nodes (37): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, CreationRuntime (+29 more)

### Community 16 - "pwa.ts"
Cohesion: 0.11
Nodes (33): react, deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), AppSettingsDialog(), checkForUpdate(), testNotification() (+25 more)

### Community 17 - "session-store.ts"
Cohesion: 0.07
Nodes (22): activityDuration(), activityResultPreview(), DiscoveredSession, disk, fixture(), fixtures, prompt(), ready() (+14 more)

### Community 18 - "claude-agent-service.ts"
Cohesion: 0.10
Nodes (19): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, PendingClaudeInput, PendingClaudePermission, DirectoryScope (+11 more)

### Community 19 - "PushNotificationService"
Cohesion: 0.13
Nodes (10): brief(), HubEventSource, PushNotificationService, PushSender, PushState, registerPushRoutes(), sessionMuteSchema, subscriptionSchema (+2 more)

### Community 20 - "TmuxTerminalSessionController"
Cohesion: 0.15
Nodes (12): copilotCommand(), execFileAsync, listTmuxSessions(), noTmuxServer(), processAncestors(), processCommand(), safeWindowName(), tmuxTargetForPid() (+4 more)

### Community 21 - "devDependencies"
Cohesion: 0.06
Nodes (33): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+25 more)

### Community 22 - "terminal-session.ts"
Cohesion: 0.13
Nodes (30): cleanDialogLine(), COMPOSER_PLACEHOLDERS, isTerminalChrome(), isTerminalSessionInUsePrompt(), normaliseOutputLine(), paneEvidenceCount(), paneShowsText(), parseTerminalFolderTrust() (+22 more)

### Community 24 - "WorkspaceDialog"
Cohesion: 0.13
Nodes (28): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+20 more)

### Community 26 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 27 - "session-store-providers.test.ts"
Cohesion: 0.08
Nodes (15): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), claude(), clearFixture(), copilot() (+7 more)

### Community 28 - "ManagedSession"
Cohesion: 0.10
Nodes (5): managedSession(), RemoteSessionListing, sessionAtLeastAsNew(), ManagedSession, SessionListing

### Community 29 - "dependencies"
Cohesion: 0.07
Nodes (29): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+21 more)

### Community 30 - "agentic-remote"
Cohesion: 0.15
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 31 - "terminal-session.test.ts"
Cohesion: 0.12
Nodes (24): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec, parseTerminalUpdateNotice() (+16 more)

### Community 32 - "knowledge-tree.ts"
Cohesion: 0.12
Nodes (25): WorkspaceEntry, addKnowledgeRoot(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+17 more)

### Community 33 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 34 - "shell.ts"
Cohesion: 0.15
Nodes (24): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+16 more)

### Community 35 - "node-routes.ts"
Cohesion: 0.09
Nodes (23): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+15 more)

### Community 36 - "TerminalSessionController"
Cohesion: 0.10
Nodes (3): persistedFormAnswer(), validateUserInputForm(), TerminalSessionController

### Community 37 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 38 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 39 - "hub-routes.ts"
Cohesion: 0.09
Nodes (23): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+15 more)

### Community 40 - "active-sessions.ts"
Cohesion: 0.20
Nodes (22): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+14 more)

### Community 41 - "NewSessionDialog"
Cohesion: 0.14
Nodes (23): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+15 more)

### Community 42 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 43 - ".handleSessionEvent"
Cohesion: 0.26
Nodes (15): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+7 more)

### Community 44 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+5 more)

### Community 45 - "session-reply-durability.test.ts"
Cohesion: 0.16
Nodes (10): answer(), claudeFixture(), claudeQuestions(), claudeRequest(), copilotFixture(), copilotRequest(), disk, fixture() (+2 more)

### Community 46 - "registerHubRoutes"
Cohesion: 0.18
Nodes (6): registerHubRoutes(), SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, KnowledgeRoot

### Community 47 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 48 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 49 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 50 - "ComputerManager"
Cohesion: 0.26
Nodes (3): ComputerManager, RegisteredComputer, ComputerSummary

### Community 51 - "NodeIdentityStore"
Cohesion: 0.17
Nodes (5): ComputerRegistry, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore

### Community 52 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 53 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 54 - "agent-service.test.ts"
Cohesion: 0.12
Nodes (7): terminalFormSteps(), DeferredSession, directories, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind, UserInputForm

### Community 55 - "delegated-transcription-service.ts"
Cohesion: 0.16
Nodes (9): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload (+1 more)

### Community 56 - "BackgroundTaskSnapshot"
Cohesion: 0.20
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 57 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 59 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 60 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 61 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 62 - "CopilotSessionLike"
Cohesion: 0.17
Nodes (3): CopilotSessionLike, FakeCopilotClient, CopilotTasksApi

### Community 63 - ".sendInternal"
Cohesion: 0.28
Nodes (9): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), isTerminalOverlay(), occurrences(), pastedPlaceholderCount() (+1 more)

### Community 64 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 65 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 66 - "TranscriptionService"
Cohesion: 0.24
Nodes (4): BuildAppOptions, registerTranscriptionRoutes(), transcriptionMultipartOptions, TranscriptionService

### Community 67 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 69 - "promotion-monitor.test.ts"
Cohesion: 0.31
Nodes (9): advanceMain(), calls(), Fixture, fixtures, git(), monitor(), remoteScripts(), run (+1 more)

### Community 70 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 71 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 72 - ".syncTranscripts"
Cohesion: 0.31
Nodes (4): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), pendingUserInputFromEvents(), statusFromEvents()

### Community 73 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 74 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 75 - "knowledge-restore.ts"
Cohesion: 0.43
Nodes (3): KnowledgePosition, KnowledgeRestoreState, base

### Community 76 - "toolActivityContent"
Cohesion: 0.40
Nodes (6): previewText(), readableMcpServerName(), readableToolName(), sameToolLabel(), stripAnsi(), toolActivityContent()

### Community 78 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 81 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

### Community 83 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **394 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+389 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 610 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `multi-node.test.ts`, `contracts.ts`, `claude-agent-service.ts`, `BackgroundTaskSnapshot`, `FakeSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `.createSession`, `.restartSession`, `.start`, `claude-agent-service.ts`, `ComputerManager`, `ProviderSessionService`, `ManagedSession`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `ClaudeAgentService`, `AgentService`, `.syncTranscripts`, `.publish`, `session-store.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _394 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.053946053946053944 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.039614957423176604 - nodes in this community are weakly interconnected._
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
