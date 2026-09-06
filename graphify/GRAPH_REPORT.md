# Agentic Remote - Graphify code map

Snapshot: `ad196a893bfdf8f6ffe74bb8d27394d610f9d7f4c53173e729d79a3f85ad6bb3`

Source checkout: `5ea2fa97f646c90b010ebeedf4986c7dd304c47b`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 126 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 126 files · ~248,197 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2319 nodes · 6078 edges · 117 communities (71 shown, 31 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 465 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- ComputerManager
- App
- contracts.ts
- SessionDetail
- App.tsx
- api.ts
- agentic-remote-promotion-monitor
- background-task-adapter.ts
- bundle
- AgentService
- hub-routes.ts
- agent-service.ts
- lib.rs
- TmuxTerminalSessionController
- shell.ts
- .publish
- config.rs
- SessionStore
- WorkspaceDialog
- .get
- PushNotificationService
- pwa.ts
- devDependencies
- ProviderSessionService
- agentic-remote-promotion-setup
- agent-service.test.ts
- dependencies
- agentic-remote
- ClaudeAgentService
- terminal-session.ts
- scripts
- node-routes.ts
- terminal-session.test.ts
- terminal-startup-queue.test.ts
- .handleSessionEvent
- transcription-service.ts
- compilerOptions
- delegated-transcription-service.ts
- active-sessions.ts
- TerminalSessionController
- CopilotClientLike
- session-store.ts
- session-store-providers.test.ts
- compilerOptions
- app.ts
- compilerOptions
- session-clear-transcript.test.ts
- compilerOptions
- directory-browser.ts
- NodeIdentityStore
- event-log.ts
- workspace-browser.ts
- knowledge-tree.ts
- .oxlintrc.json
- claude-recovery-admission.test.ts
- .create
- .runQuery
- session-admission-lifecycle.test.ts
- session-reply-durability.test.ts
- NewSessionDialog
- capture
- desktop.json
- settings-local.json
- .publish
- TranscriptionError
- background-task-tracker.ts
- scripts
- RuntimeModelOption
- promotion-monitor.test.ts
- session-enqueue-clear.test.ts
- bridge.rs
- package.json
- .replyUserInput
- WorkspaceListing
- SessionAdmissions
- .persist
- UserInputFieldControl
- knowledge-restore.ts
- .clearSerialized
- WorkspaceFile
- transcription-routes.ts
- settings.ts
- BackgroundTaskSnapshot
- .isRetiredSession
- .saveUpload
- composer-layout.test.ts
- removeComputer
- release-publication.test.ts
- terminal-send-uncertainty.test.ts
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
1. `SessionDetail` - 217 edges
2. `App()` - 152 edges
3. `AgentService` - 150 edges
4. `SessionStore` - 107 edges
5. `ClaudeAgentService` - 100 edges
6. `ComputerManager` - 64 edges
7. `RemoteNodeClient` - 55 edges
8. `SessionService` - 52 edges
9. `registerHubRoutes()` - 46 edges
10. `ProviderSessionService` - 45 edges

## Surprising Connections (you probably didn't know these)
- `navigateMessageHistory()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (117 total, 31 thin omitted)

### Community 0 - "ComputerManager"
Cohesion: 0.08
Nodes (13): ComputerManager, managedSession(), RemoteSessionListing, RemoteSessionRead, sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), registerNodeRoutes() (+5 more)

### Community 1 - "App"
Cohesion: 0.05
Nodes (82): addKnowledgeRoot(), clearConversation(), listKnowledgeEntries(), readKnowledgeFile(), replyPermission(), restartSession(), App(), appendComposerForKey() (+74 more)

### Community 2 - "contracts.ts"
Cohesion: 0.06
Nodes (47): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+39 more)

### Community 3 - "SessionDetail"
Cohesion: 0.04
Nodes (14): RemoteResync, FakeSessionService, headerSafe(), RemoteNodeClient, RemoteNodeRedirectError, RemoteNodeRequestError, client(), servers (+6 more)

### Community 4 - "App.tsx"
Cohesion: 0.04
Nodes (59): applyAccentIcon(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+51 more)

### Community 5 - "api.ts"
Cohesion: 0.07
Nodes (56): cancelBackgroundTask(), cancelSession(), configureRuntime(), deleteKnowledgeRoot(), deletePushSubscription(), deleteSession(), getProviderRuntimeOptions(), getPushSettings() (+48 more)

### Community 6 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (53): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+45 more)

### Community 7 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (46): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+38 more)

### Community 8 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 9 - "AgentService"
Cohesion: 0.08
Nodes (3): AgentService, removeCopilotSessionFiles(), RuntimeConfigurationError

### Community 10 - "hub-routes.ts"
Cohesion: 0.06
Nodes (29): BuildAppOptions, addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed() (+21 more)

### Community 11 - "agent-service.ts"
Cohesion: 0.06
Nodes (40): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+32 more)

### Community 12 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 13 - "TmuxTerminalSessionController"
Cohesion: 0.13
Nodes (12): copilotCommand(), execFileAsync, listTmuxSessions(), noTmuxServer(), parseTerminalUserInput(), processAncestors(), processCommand(), safeWindowName() (+4 more)

### Community 14 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 15 - ".publish"
Cohesion: 0.11
Nodes (5): agentMode(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), TranscriptObservation

### Community 16 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 17 - "SessionStore"
Cohesion: 0.11
Nodes (5): observe(), SessionStore, ChatMessage, QueuedPrompt, SessionStatus

### Community 18 - "WorkspaceDialog"
Cohesion: 0.11
Nodes (33): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+25 more)

### Community 20 - "PushNotificationService"
Cohesion: 0.13
Nodes (10): brief(), HubEventSource, PushNotificationService, PushSender, PushState, registerPushRoutes(), sessionMuteSchema, subscriptionSchema (+2 more)

### Community 21 - "pwa.ts"
Cohesion: 0.12
Nodes (31): getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle(), mergeRuntimeModelOptions() (+23 more)

### Community 22 - "devDependencies"
Cohesion: 0.06
Nodes (33): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+25 more)

### Community 24 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 25 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (9): CopilotSessionLike, DeferredSession, directories, FakeCopilotClient, CopilotTaskInfo, CopilotTaskProgress, CopilotTasksApi, BackgroundTaskKind (+1 more)

### Community 26 - "dependencies"
Cohesion: 0.07
Nodes (29): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+21 more)

### Community 27 - "agentic-remote"
Cohesion: 0.15
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 29 - "terminal-session.ts"
Cohesion: 0.15
Nodes (25): cleanDialogLine(), COMPOSER_PLACEHOLDERS, isTerminalChrome(), normaliseOutputLine(), parseTerminalFolderTrust(), parseTerminalFormActiveField(), parseTerminalFormPrompt(), parseTerminalPermission() (+17 more)

### Community 30 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 31 - "node-routes.ts"
Cohesion: 0.09
Nodes (23): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+15 more)

### Community 32 - "terminal-session.test.ts"
Cohesion: 0.12
Nodes (24): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), isTerminalAgentWorking(), occurrences(), paneEvidenceCount() (+16 more)

### Community 33 - "terminal-startup-queue.test.ts"
Cohesion: 0.15
Nodes (20): findActiveCopilotSessions(), directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec (+12 more)

### Community 34 - ".handleSessionEvent"
Cohesion: 0.20
Nodes (21): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isRuntimeReasoningEffort() (+13 more)

### Community 35 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 36 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 37 - "delegated-transcription-service.ts"
Cohesion: 0.14
Nodes (11): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload (+3 more)

### Community 38 - "active-sessions.ts"
Cohesion: 0.21
Nodes (21): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+13 more)

### Community 39 - "TerminalSessionController"
Cohesion: 0.12
Nodes (5): persistedFormAnswer(), terminalFormSteps(), validateUserInputForm(), TerminalSessionController, PendingPermission

### Community 41 - "session-store.ts"
Cohesion: 0.10
Nodes (16): channels, directories, fixture(), activityDuration(), activityResultPreview(), DiscoveredSession, emptyRetirements, PendingChange (+8 more)

### Community 42 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+2 more)

### Community 43 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 44 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+5 more)

### Community 45 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 46 - "session-clear-transcript.test.ts"
Cohesion: 0.13
Nodes (13): disk, fixture(), fixtures, gate(), holdTurnWrite(), releases, disk, fixture() (+5 more)

### Community 47 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 48 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 49 - "NodeIdentityStore"
Cohesion: 0.17
Nodes (5): ComputerRegistry, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore

### Community 50 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 51 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 52 - "knowledge-tree.ts"
Cohesion: 0.18
Nodes (16): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+8 more)

### Community 53 - ".oxlintrc.json"
Cohesion: 0.12
Nodes (16): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+8 more)

### Community 55 - "claude-recovery-admission.test.ts"
Cohesion: 0.16
Nodes (12): connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite() (+4 more)

### Community 56 - ".create"
Cohesion: 0.21
Nodes (3): fixture(), isSessionIdList(), holdOtherWrite()

### Community 58 - "session-admission-lifecycle.test.ts"
Cohesion: 0.15
Nodes (10): ClaudeSdk, directories, fixture(), queryHandle(), deferred(), disk, fixture(), fixtures (+2 more)

### Community 59 - "session-reply-durability.test.ts"
Cohesion: 0.20
Nodes (12): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, fixtures (+4 more)

### Community 60 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+8 more)

### Community 61 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 62 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 63 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 65 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 66 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 67 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 69 - "promotion-monitor.test.ts"
Cohesion: 0.31
Nodes (9): advanceMain(), calls(), Fixture, fixtures, git(), monitor(), remoteScripts(), run (+1 more)

### Community 70 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (10): disk, EnqueueCase, fixture(), fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet() (+2 more)

### Community 72 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 73 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 74 - ".replyUserInput"
Cohesion: 0.39
Nodes (3): answer(), claudeRequest(), copilotRequest()

### Community 78 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 79 - "knowledge-restore.ts"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 83 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 88 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 90 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **415 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+410 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 642 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SessionService` connect `ComputerManager` to `contracts.ts`, `SessionDetail`, `WorkspaceListing`, `WorkspaceFile`, `BackgroundTaskSnapshot`, `ProviderSessionService`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `.publish`, `.resumeQueued`, `session-store.ts`, `agent-service.ts`, `.persist`, `.publish`, `.get`, `.isRetiredSession`, `.saveUpload`, `claude-recovery-admission.test.ts`, `.create`, `.runQuery`, `.publishError`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _415 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ComputerManager` be split into smaller, more focused modules?**
  _Cohesion score 0.07647058823529412 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04985994397759104 - nodes in this community are weakly interconnected._
- **Should `contracts.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05823293172690763 - nodes in this community are weakly interconnected._
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
