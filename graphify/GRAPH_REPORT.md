# Agentic Remote - Graphify code map

Snapshot: `124bfc855a19d252769146c1935d81a601a54de744da2503c77912d9a722697d`

Source checkout: `29109d27d29d9f401f7af3fa07bca150a52d1d38`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 118 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 118 files · ~231,384 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2214 nodes · 5717 edges · 101 communities (67 shown, 20 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 414 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- terminal-session.ts
- App
- ClaudeAgentService
- App.tsx
- AgentService
- SessionDetail
- App.test.tsx
- agentic-remote-promotion-monitor
- pwa.ts
- session-store-providers.test.ts
- background-task-adapter.ts
- SessionService
- bundle
- lib.rs
- config.rs
- ProviderSessionService
- WorkspaceDialog
- .publish
- PushNotificationService
- workspace-browser.ts
- agent-service.ts
- contracts.ts
- devDependencies
- claude-agent-service.ts
- RemoteNodeClient
- agentic-remote-promotion-setup
- FakeSessionService
- dependencies
- agentic-remote
- TerminalSessionController
- .readAfterWrites
- scripts
- shell.ts
- ManagedSession
- node-routes.ts
- directory-browser.ts
- delegated-transcription-service.ts
- compilerOptions
- hub-routes.ts
- transcription-service.ts
- AppSettingsDialog
- active-sessions.ts
- recordValue
- compilerOptions
- ComputerManager
- registerHubRoutes
- compilerOptions
- compilerOptions
- NodeIdentityStore
- event-log.ts
- agent-service.test.ts
- app.ts
- BackgroundTaskSnapshot
- remote-node-client.ts
- capture
- knowledgePathChain
- desktop.json
- settings-local.json
- CopilotSessionLike
- multi-node.test.ts
- TranscriptionError
- shell-notifications.ts
- messagesFromHistory
- scripts
- promotion-monitor.test.ts
- bridge.rs
- package.json
- UserInputFieldControl
- knowledge-restore.ts
- SessionFileUpload
- settings.ts
- composer-layout.test.ts
- transcription-routes.ts
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
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `RemoteNodeClientEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/remote-node-client.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (101 total, 20 thin omitted)

### Community 0 - "terminal-session.ts"
Cohesion: 0.05
Nodes (77): findActiveCopilotProcesses(), directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec (+69 more)

### Community 1 - "App"
Cohesion: 0.05
Nodes (82): clearConversation(), deleteKnowledgeRoot(), moveSessionToTmux(), replyPermission(), replyUserInput(), restartSession(), App(), answerUserInput() (+74 more)

### Community 2 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (10): ClaudeAgentService, ClaudeSdk, isClaudeAuthenticationError(), isMissingClaudeSessionError(), directories, fixture(), queryHandle(), waitForIdle() (+2 more)

### Community 3 - "App.tsx"
Cohesion: 0.04
Nodes (58): ActivityStatus, applyAccentIcon(), addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage() (+50 more)

### Community 4 - "AgentService"
Cohesion: 0.07
Nodes (4): agentMode(), AgentService, isMissingSessionError(), RuntimeConfigurationError

### Community 5 - "SessionDetail"
Cohesion: 0.08
Nodes (20): activityDuration(), activityResultPreview(), cloneSession(), DiscoveredSession, emptyRetirements, PendingChange, QueuedPromptReservation, SessionProjection (+12 more)

### Community 6 - "App.test.tsx"
Cohesion: 0.06
Nodes (49): cancelBackgroundTask(), cancelSession(), configureRuntime(), deleteSession(), getPushSettings(), getRuntimeOptions(), getSession(), listBackgroundTasks() (+41 more)

### Community 7 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (53): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+45 more)

### Community 8 - "pwa.ts"
Cohesion: 0.06
Nodes (45): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+37 more)

### Community 9 - "session-store-providers.test.ts"
Cohesion: 0.06
Nodes (32): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+24 more)

### Community 10 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (46): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+38 more)

### Community 12 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 13 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 14 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 16 - "WorkspaceDialog"
Cohesion: 0.11
Nodes (33): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+25 more)

### Community 18 - "PushNotificationService"
Cohesion: 0.13
Nodes (10): brief(), HubEventSource, PushNotificationService, PushSender, PushState, registerPushRoutes(), sessionMuteSchema, subscriptionSchema (+2 more)

### Community 19 - "workspace-browser.ts"
Cohesion: 0.10
Nodes (28): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+20 more)

### Community 20 - "agent-service.ts"
Cohesion: 0.06
Nodes (33): AcceptedSdkReply, ActivePrompt, ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime, ElicitationContext (+25 more)

### Community 21 - "contracts.ts"
Cohesion: 0.10
Nodes (22): ComputerManagerEvents, RemoteResync, RemoteSessionRead, StoredNodeIdentity, directories, AddComputerInput, AddKnowledgeRootInput, BackgroundTaskAttachmentMode (+14 more)

### Community 22 - "devDependencies"
Cohesion: 0.06
Nodes (33): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+25 more)

### Community 23 - "claude-agent-service.ts"
Cohesion: 0.11
Nodes (17): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+9 more)

### Community 24 - "RemoteNodeClient"
Cohesion: 0.10
Nodes (4): RemoteNodeClient, NodeInfo, WorkspaceFile, WorkspaceListing

### Community 26 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 28 - "dependencies"
Cohesion: 0.07
Nodes (29): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+21 more)

### Community 29 - "agentic-remote"
Cohesion: 0.15
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 30 - "TerminalSessionController"
Cohesion: 0.11
Nodes (4): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), TerminalSessionController

### Community 31 - ".readAfterWrites"
Cohesion: 0.13
Nodes (4): isSessionIdList(), PendingMutation, fixture(), terminalClearFixture()

### Community 32 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 33 - "shell.ts"
Cohesion: 0.15
Nodes (24): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+16 more)

### Community 34 - "ManagedSession"
Cohesion: 0.10
Nodes (4): managedSession(), RemoteSessionListing, ManagedSession, SessionListing

### Community 35 - "node-routes.ts"
Cohesion: 0.09
Nodes (23): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+15 more)

### Community 36 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 37 - "delegated-transcription-service.ts"
Cohesion: 0.12
Nodes (12): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+4 more)

### Community 38 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 39 - "hub-routes.ts"
Cohesion: 0.09
Nodes (23): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+15 more)

### Community 40 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 41 - "AppSettingsDialog"
Cohesion: 0.13
Nodes (24): activateSession(), createSession(), getProviderRuntimeOptions(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+16 more)

### Community 42 - "active-sessions.ts"
Cohesion: 0.21
Nodes (21): ActiveProcess, execFileAsync, findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+13 more)

### Community 43 - "recordValue"
Cohesion: 0.20
Nodes (19): activityKind(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isRuntimeReasoningEffort(), isUnsupportedBackgroundTaskError() (+11 more)

### Community 44 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 45 - "ComputerManager"
Cohesion: 0.26
Nodes (4): ComputerManager, sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 46 - "registerHubRoutes"
Cohesion: 0.18
Nodes (6): registerHubRoutes(), SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, KnowledgeRoot

### Community 47 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 48 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 49 - "NodeIdentityStore"
Cohesion: 0.17
Nodes (5): ComputerRegistry, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore

### Community 50 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 51 - "agent-service.test.ts"
Cohesion: 0.12
Nodes (7): terminalFormSteps(), DeferredSession, directories, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind, UserInputForm

### Community 52 - "app.ts"
Cohesion: 0.17
Nodes (11): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), ServerRole, transcriptionComputerName() (+3 more)

### Community 53 - "BackgroundTaskSnapshot"
Cohesion: 0.20
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 54 - "remote-node-client.ts"
Cohesion: 0.13
Nodes (10): headerSafe(), normalizeNodeUrl(), REDIRECT_STATUSES, RemoteNodeClientEvents, RemoteNodeRedirectError, RemoteNodeRequestError, client(), servers (+2 more)

### Community 55 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 56 - "knowledgePathChain"
Cohesion: 0.19
Nodes (15): addKnowledgeRoot(), listKnowledgeEntries(), readKnowledgeFile(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+7 more)

### Community 57 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 58 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 59 - "CopilotSessionLike"
Cohesion: 0.17
Nodes (3): CopilotSessionLike, FakeCopilotClient, CopilotTasksApi

### Community 60 - "multi-node.test.ts"
Cohesion: 0.15
Nodes (3): RegistryState, directories, WorkspaceSearchResponse

### Community 61 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 62 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 63 - "messagesFromHistory"
Cohesion: 0.20
Nodes (12): activityDuration(), activityGroupIdFor(), activityResult(), isActivityGroupKind(), messagesFromHistory(), previewText(), readableMcpServerName(), readableToolName() (+4 more)

### Community 64 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 65 - "promotion-monitor.test.ts"
Cohesion: 0.31
Nodes (9): advanceMain(), calls(), Fixture, fixtures, git(), monitor(), remoteScripts(), run (+1 more)

### Community 66 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 67 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 68 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 69 - "knowledge-restore.ts"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 71 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 75 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **394 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+389 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 610 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `copilotFixture()` connect `session-store-providers.test.ts` to `AgentService`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `directory-browser.ts`, `SessionDetail`, `SessionFileUpload`, `recordValue`, `.publish`, `claude-agent-service.ts`, `.get`, `TerminalSessionController`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `directory-browser.ts`, `SessionFileUpload`, `contracts.ts`, `BackgroundTaskSnapshot`, `claude-agent-service.ts`, `remote-node-client.ts`, `FakeSessionService`, `multi-node.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _394 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `terminal-session.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05126945126945127 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.049019607843137254 - nodes in this community are weakly interconnected._
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
