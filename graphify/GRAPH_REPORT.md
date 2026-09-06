# Agentic Remote - Graphify code map

Snapshot: `dfb233f1b63d80ad93b9db223710ffa97022e0f118aba3598e02a0d8cde2d772`

Source checkout: `e46a29b329f8d4b7b0203df8b5863191894782eb`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 123 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 123 files · ~242,072 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2293 nodes · 5969 edges · 107 communities (68 shown, 25 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 448 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- terminal-session.ts
- App
- App.tsx
- api.ts
- SessionStore
- agentic-remote-promotion-monitor
- AgentService
- RemoteNodeClient
- session-store.ts
- background-task-adapter.ts
- contracts.ts
- bundle
- .publish
- lib.rs
- SessionDetail
- shell.ts
- ComputerManager
- PushNotificationService
- config.rs
- SessionService
- multi-node.test.ts
- agent-service.ts
- devDependencies
- .syncTranscripts
- pwa.ts
- ClaudeAgentService
- FakeSessionService
- ProviderSessionService
- agentic-remote-promotion-setup
- WorkspaceDialog
- dependencies
- agentic-remote
- scripts
- directory-browser.ts
- node-routes.ts
- NewSessionDialog
- knowledge-tree.ts
- .handleSessionEvent
- compilerOptions
- claude-agent-service.ts
- hub-routes.ts
- transcription-service.ts
- active-sessions.ts
- session-store-providers.test.ts
- compilerOptions
- BackgroundTaskSnapshot
- app.ts
- compilerOptions
- compilerOptions
- .publish
- NodeIdentityStore
- delegated-transcription-service.ts
- event-log.ts
- KnowledgeStore
- session-reply-durability.test.ts
- workspace-browser.ts
- .oxlintrc.json
- agent-service.test.ts
- ComputerSummary
- capture
- desktop.json
- settings-local.json
- CopilotSessionLike
- .dispatchAdmitted
- TranscriptionError
- scripts
- TranscriptionService
- promotion-monitor.test.ts
- RuntimeModelOption
- claude-agent-service.test.ts
- bridge.rs
- package.json
- SessionFileUpload
- SessionAdmissions
- UserInputFieldControl
- settings.ts
- knowledge-restore.ts
- .replyUserInput
- composer-layout.test.ts
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
1. `SessionDetail` - 216 edges
2. `App()` - 152 edges
3. `AgentService` - 144 edges
4. `SessionStore` - 102 edges
5. `ClaudeAgentService` - 98 edges
6. `ComputerManager` - 64 edges
7. `RemoteNodeClient` - 55 edges
8. `SessionService` - 52 edges
9. `registerHubRoutes()` - 46 edges
10. `ProviderSessionService` - 45 edges

## Surprising Connections (you probably didn't know these)
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `ClaudeAgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `RemoteNodeClientEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/remote-node-client.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (107 total, 25 thin omitted)

### Community 0 - "terminal-session.ts"
Cohesion: 0.05
Nodes (77): findActiveCopilotProcesses(), directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec (+69 more)

### Community 1 - "App"
Cohesion: 0.05
Nodes (79): clearConversation(), replyPermission(), restartSession(), transcribeAudio(), uploadSessionFile(), App(), appendComposerForKey(), appKeyDown() (+71 more)

### Community 2 - "App.tsx"
Cohesion: 0.04
Nodes (59): applyAccentIcon(), addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+51 more)

### Community 3 - "api.ts"
Cohesion: 0.07
Nodes (56): cancelBackgroundTask(), cancelSession(), configureRuntime(), deleteKnowledgeRoot(), deletePushSubscription(), deleteSession(), getProviderRuntimeOptions(), getPushSettings() (+48 more)

### Community 4 - "SessionStore"
Cohesion: 0.08
Nodes (20): connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite() (+12 more)

### Community 5 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (53): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+45 more)

### Community 7 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (11): headerSafe(), RemoteNodeClient, RemoteNodeRedirectError, RemoteNodeRequestError, client(), servers, session, NodeInfo (+3 more)

### Community 8 - "session-store.ts"
Cohesion: 0.05
Nodes (34): deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, disk, fixtures (+26 more)

### Community 9 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (43): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+35 more)

### Community 10 - "contracts.ts"
Cohesion: 0.06
Nodes (35): RemoteResync, RemoteSessionListing, RemoteSessionRead, RegistryState, StoredNodeIdentity, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, normalizeNodeUrl() (+27 more)

### Community 11 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 12 - ".publish"
Cohesion: 0.11
Nodes (4): agentMode(), CopilotClientLike, isMissingSessionError(), removeCopilotSessionFiles()

### Community 13 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 14 - "SessionDetail"
Cohesion: 0.10
Nodes (3): observe(), QueuedPrompt, SessionDetail

### Community 15 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 16 - "ComputerManager"
Cohesion: 0.21
Nodes (5): ComputerManager, managedSession(), registerHubRoutes(), ManagedSession, SessionListing

### Community 17 - "PushNotificationService"
Cohesion: 0.11
Nodes (13): ComputerManagerEvents, brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, registerPushRoutes() (+5 more)

### Community 18 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 20 - "multi-node.test.ts"
Cohesion: 0.09
Nodes (12): AgentServiceEvents, CreationRuntime, directories, ProviderSessionServiceEvents, AgentProvider, ProviderRuntimeOptions, RuntimeOptions, RuntimeReasoningEffort (+4 more)

### Community 21 - "agent-service.ts"
Cohesion: 0.07
Nodes (35): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, ansiSequence, commandShortcut(), ElicitationContext (+27 more)

### Community 22 - "devDependencies"
Cohesion: 0.06
Nodes (33): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+25 more)

### Community 23 - ".syncTranscripts"
Cohesion: 0.09
Nodes (7): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), persistedFormAnswer(), statusFromEvents(), validateUserInputForm(), TerminalSessionController, SessionStatus

### Community 24 - "pwa.ts"
Cohesion: 0.13
Nodes (29): getPushPublicKey(), savePushSubscription(), AppSettingsDialog(), checkForUpdate(), toggle(), mergeRuntimeModelOptions(), sameRuntimeSelection(), activatePwaUpdate() (+21 more)

### Community 28 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 29 - "WorkspaceDialog"
Cohesion: 0.14
Nodes (26): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), navigateDocument(), BreadcrumbSegment (+18 more)

### Community 30 - "dependencies"
Cohesion: 0.07
Nodes (29): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+21 more)

### Community 31 - "agentic-remote"
Cohesion: 0.15
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 32 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 34 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 35 - "node-routes.ts"
Cohesion: 0.10
Nodes (21): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), configureRuntimeSchema, createSessionSchema (+13 more)

### Community 36 - "NewSessionDialog"
Cohesion: 0.12
Nodes (26): activateSession(), createSession(), executeCommand(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory(), AddKnowledgeRootDialog() (+18 more)

### Community 37 - "knowledge-tree.ts"
Cohesion: 0.13
Nodes (23): addKnowledgeRoot(), listKnowledgeEntries(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+15 more)

### Community 38 - ".handleSessionEvent"
Cohesion: 0.20
Nodes (21): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isRuntimeReasoningEffort() (+13 more)

### Community 39 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 40 - "claude-agent-service.ts"
Cohesion: 0.09
Nodes (15): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+7 more)

### Community 41 - "hub-routes.ts"
Cohesion: 0.09
Nodes (23): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+15 more)

### Community 42 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 43 - "active-sessions.ts"
Cohesion: 0.21
Nodes (21): ActiveProcess, execFileAsync, findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+13 more)

### Community 44 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 45 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 46 - "BackgroundTaskSnapshot"
Cohesion: 0.19
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 47 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+5 more)

### Community 48 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 49 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 51 - "NodeIdentityStore"
Cohesion: 0.17
Nodes (5): ComputerRegistry, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore

### Community 52 - "delegated-transcription-service.ts"
Cohesion: 0.16
Nodes (10): collect(), DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload, MAX_AUDIO_BYTES (+2 more)

### Community 53 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 54 - "KnowledgeStore"
Cohesion: 0.16
Nodes (5): SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, KnowledgeRoot

### Community 55 - "session-reply-durability.test.ts"
Cohesion: 0.18
Nodes (15): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+7 more)

### Community 56 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 57 - ".oxlintrc.json"
Cohesion: 0.12
Nodes (16): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+8 more)

### Community 58 - "agent-service.test.ts"
Cohesion: 0.12
Nodes (7): terminalFormSteps(), DeferredSession, directories, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind, UserInputForm

### Community 59 - "ComputerSummary"
Cohesion: 0.23
Nodes (3): sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 60 - "capture"
Cohesion: 0.20
Nodes (14): releaseRecording(), shortcutKeys(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode(), keyLabel() (+6 more)

### Community 61 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 62 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 63 - "CopilotSessionLike"
Cohesion: 0.17
Nodes (3): CopilotSessionLike, FakeCopilotClient, CopilotTasksApi

### Community 65 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 66 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 67 - "TranscriptionService"
Cohesion: 0.25
Nodes (5): BuildAppOptions, DelegatedTranscriptionOptions, registerTranscriptionRoutes(), transcriptionMultipartOptions, TranscriptionService

### Community 68 - "promotion-monitor.test.ts"
Cohesion: 0.31
Nodes (9): advanceMain(), calls(), Fixture, fixtures, git(), monitor(), remoteScripts(), run (+1 more)

### Community 70 - "claude-agent-service.test.ts"
Cohesion: 0.22
Nodes (5): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle()

### Community 71 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 72 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 75 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 76 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 77 - "knowledge-restore.ts"
Cohesion: 0.43
Nodes (3): KnowledgePosition, KnowledgeRestoreState, base

### Community 81 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **407 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+402 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 632 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `directory-browser.ts`, `claude-agent-service.ts`, `SessionFileUpload`, `contracts.ts`, `multi-node.test.ts`, `FakeSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ComputerManager` connect `ComputerManager` to `SessionService`, `NodeIdentityStore`, `directory-browser.ts`, `ComputerSummary`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `FakeSessionService` connect `FakeSessionService` to `directory-browser.ts`, `RemoteNodeClient`, `SessionFileUpload`, `BackgroundTaskSnapshot`, `SessionService`, `multi-node.test.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _407 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `terminal-session.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05126945126945127 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.050888286660644384 - nodes in this community are weakly interconnected._
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
