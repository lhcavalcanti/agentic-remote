# Agentic Remote - Graphify code map

Snapshot: `b568a9f1a125ce0e6e83152f686680e01422bb93da47369596b3f9e99033f111`

Source checkout: `8028ec3e5c46909a689c54ca594cbd12a793933d`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 134 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 134 files · ~296,470 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2493 nodes · 6687 edges · 126 communities (82 shown, 28 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 521 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- SessionDetail
- api.ts
- App.tsx
- agentic-remote-promotion-monitor
- AgentService
- .requireClient
- background-task-adapter.ts
- bundle
- TmuxTerminalSessionController
- lib.rs
- terminal-session.test.ts
- agent-service.ts
- RemoteNodeClient
- WorkspaceDialog
- config.rs
- pwa.ts
- PushNotificationService
- devDependencies
- .publish
- FakeSessionService
- contracts.ts
- ClaudeAgentService
- agentic-remote
- claude-agent-service.ts
- ProviderSessionService
- dependencies
- multi-node.test.ts
- terminal-session.ts
- agentic-remote-promotion-setup
- .sendAdmittedWithBackend
- session-service.ts
- delegated-transcription-service.ts
- knowledge-tree.ts
- .handleSessionEvent
- scripts
- shell.ts
- .get
- SessionService
- .create
- session-reply-durability.test.ts
- .sendInternal
- active-sessions.ts
- .syncTranscripts
- compilerOptions
- hub-routes.ts
- tmux-errors.integration.test.ts
- transcription-service.ts
- registerHubRoutes
- compilerOptions
- app.ts
- session-store-providers.test.ts
- compilerOptions
- compilerOptions
- .publish
- event-log.ts
- workspace-browser.ts
- BackgroundTaskSnapshot
- ComputerManager
- node-routes.ts
- session-store.ts
- recovery-resend-durability.test.ts
- capture
- CopilotSessionLike
- remote-node-client.ts
- NewSessionDialog
- desktop.json
- .oxlintrc.json
- settings-local.json
- TranscriptionError
- shell-notifications.ts
- CopilotClientLike
- file-upload-routes.ts
- promotion-monitor.test.ts
- scripts
- .dispatchAdmitted
- session-enqueue-clear.test.ts
- session-store-durability.test.ts
- bridge.rs
- package.json
- RuntimeModelOption
- claude-agent-service.test.ts
- session-admission-lifecycle.test.ts
- session-clear-transcript.test.ts
- SessionFileUpload
- SessionAdmissions
- UserInputFieldControl
- WorkspaceListing
- settings.ts
- knowledge-restore.ts
- SlashCommand
- release-publication.test.ts
- composer-layout.test.ts
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- MermaidDiagram.tsx
- MockWebSocket
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
1. `SessionDetail` - 230 edges
2. `AgentService` - 178 edges
3. `App()` - 162 edges
4. `SessionStore` - 121 edges
5. `ClaudeAgentService` - 100 edges
6. `ComputerManager` - 67 edges
7. `RemoteNodeClient` - 55 edges
8. `SessionService` - 54 edges
9. `registerHubRoutes()` - 50 edges
10. `TmuxTerminalSessionController` - 49 edges

## Surprising Connections (you probably didn't know these)
- `navigateMessageHistory()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `SdkQueueAdmission` --references--> `QueuedPrompt`  [EXTRACTED]
  server/session-store.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (126 total, 28 thin omitted)

### Community 0 - "App"
Cohesion: 0.05
Nodes (81): submissionReceiptFromError(), clearConversation(), transcribeAudio(), uploadSessionFile(), App(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot() (+73 more)

### Community 1 - "SessionDetail"
Cohesion: 0.08
Nodes (11): observe(), PendingMutation, SessionStore, acceptedStartupRecovery(), client(), exec, fixture(), ChatMessage (+3 more)

### Community 2 - "api.ts"
Cohesion: 0.06
Nodes (67): parseSubmissionReceipt(), cancelBackgroundTask(), cancelSession(), configureRuntime(), deleteKnowledgeRoot(), deletePushSubscription(), deleteSession(), getProviderRuntimeOptions() (+59 more)

### Community 3 - "App.tsx"
Cohesion: 0.04
Nodes (58): applyAccentIcon(), addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+50 more)

### Community 4 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 5 - "AgentService"
Cohesion: 0.09
Nodes (3): AgentService, fixture(), httpBoundary()

### Community 6 - ".requireClient"
Cohesion: 0.08
Nodes (3): managedSession(), ManagedSession, SessionListing

### Community 7 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (43): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+35 more)

### Community 8 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 9 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (13): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), terminalChecklistState() (+5 more)

### Community 10 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 11 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (32): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec, parseTerminalUpdateNotice() (+24 more)

### Community 12 - "agent-service.ts"
Cohesion: 0.06
Nodes (39): AcceptedSdkReply, ActivePrompt, ActivityToolStart, ansiSequence, commandShortcut(), DeliveryBoundary, ElicitationContext, ElicitationHandler (+31 more)

### Community 13 - "RemoteNodeClient"
Cohesion: 0.08
Nodes (7): headerSafe(), RemoteNodeClient, client(), servers, session, NodeInfo, WorkspaceFile

### Community 14 - "WorkspaceDialog"
Cohesion: 0.11
Nodes (35): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+27 more)

### Community 15 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 16 - "pwa.ts"
Cohesion: 0.11
Nodes (34): react, getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+26 more)

### Community 17 - "PushNotificationService"
Cohesion: 0.12
Nodes (11): brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, registerPushRoutes(), sessionMuteSchema (+3 more)

### Community 18 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 19 - ".publish"
Cohesion: 0.10
Nodes (4): agentMode(), removeCopilotSessionFiles(), RuntimeConfigurationError, terminalClearFixture()

### Community 20 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): CreationRuntime, FakeSessionService, ConfigureRuntimeInput, RuntimeReasoningEffort

### Community 21 - "contracts.ts"
Cohesion: 0.07
Nodes (28): ComputerManagerEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, ActivityStatus, AddComputerInput, AddKnowledgeRootInput, AgentMode (+20 more)

### Community 23 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 24 - "claude-agent-service.ts"
Cohesion: 0.11
Nodes (25): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+17 more)

### Community 26 - "dependencies"
Cohesion: 0.06
Nodes (31): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+23 more)

### Community 27 - "multi-node.test.ts"
Cohesion: 0.10
Nodes (8): ComputerRegistry, RegistryState, directories, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore, StoredNodeIdentity

### Community 28 - "terminal-session.ts"
Cohesion: 0.12
Nodes (30): COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasComposerAfter(), hasLiveTerminalComposer(), isTerminalChrome() (+22 more)

### Community 29 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 31 - "session-service.ts"
Cohesion: 0.11
Nodes (12): AgentServiceEvents, ClaudeAgentServiceEvents, DirectoryScope, ProviderSessionServiceEvents, RemoteNodeClientEvents, AgentProvider, DirectoryListing, ProviderRuntimeOptions (+4 more)

### Community 32 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (14): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+6 more)

### Community 33 - "knowledge-tree.ts"
Cohesion: 0.12
Nodes (25): WorkspaceEntry, addKnowledgeRoot(), listKnowledgeEntries(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+17 more)

### Community 34 - ".handleSessionEvent"
Cohesion: 0.17
Nodes (23): activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength() (+15 more)

### Community 35 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 36 - "shell.ts"
Cohesion: 0.15
Nodes (24): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+16 more)

### Community 38 - "SessionService"
Cohesion: 0.11
Nodes (3): registerNodeRoutes(), SessionService, AgentProviderCapability

### Community 39 - ".create"
Cohesion: 0.11
Nodes (20): fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures (+12 more)

### Community 40 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (16): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+8 more)

### Community 41 - ".sendInternal"
Cohesion: 0.22
Nodes (22): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), hasTerminalCommandPermissionQuestion() (+14 more)

### Community 42 - "active-sessions.ts"
Cohesion: 0.18
Nodes (24): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+16 more)

### Community 43 - ".syncTranscripts"
Cohesion: 0.10
Nodes (11): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), pendingUserInputFromEvents(), statusFromEvents(), terminalFormSteps(), DeferredSession, directories, CopilotTaskInfo (+3 more)

### Community 44 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 45 - "hub-routes.ts"
Cohesion: 0.09
Nodes (23): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+15 more)

### Community 46 - "tmux-errors.integration.test.ts"
Cohesion: 0.12
Nodes (19): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer(), noTmuxServer() (+11 more)

### Community 47 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 48 - "registerHubRoutes"
Cohesion: 0.16
Nodes (7): registerHubRoutes(), SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, createHub(), KnowledgeRoot

### Community 50 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 51 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+5 more)

### Community 52 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 53 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 54 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 56 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 57 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 58 - "BackgroundTaskSnapshot"
Cohesion: 0.20
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 59 - "ComputerManager"
Cohesion: 0.28
Nodes (4): ComputerManager, sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 60 - "node-routes.ts"
Cohesion: 0.11
Nodes (17): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, knowledgeFileQuerySchema (+9 more)

### Community 62 - "session-store.ts"
Cohesion: 0.12
Nodes (13): activityDuration(), activityResultPreview(), emptyRetirements, PendingChange, RecoveryResend, SdkQueueAdmission, SessionProjection, SessionReplacementCleanupError (+5 more)

### Community 63 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 64 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 65 - "CopilotSessionLike"
Cohesion: 0.15
Nodes (5): CopilotSessionLike, configurableModel(), FakeCopilotClient, startupFifoFixture(), CopilotTasksApi

### Community 66 - "remote-node-client.ts"
Cohesion: 0.19
Nodes (7): normalizeNodeUrl(), REDIRECT_STATUSES, RemoteNodeRedirectError, RemoteNodeRequestError, RemovedQueuedPrompt, SubmissionError, SubmissionReceipt

### Community 67 - "NewSessionDialog"
Cohesion: 0.22
Nodes (15): activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder(), computerProviders() (+7 more)

### Community 68 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 69 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 70 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 71 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 72 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 73 - "CopilotClientLike"
Cohesion: 0.17
Nodes (5): CopilotClientLike, holdProbe(), fixtures, gate(), releases

### Community 74 - "file-upload-routes.ts"
Cohesion: 0.24
Nodes (7): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), transcriptionMultipartOptions

### Community 75 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 76 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 79 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (10): disk, EnqueueCase, fixture(), fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet() (+2 more)

### Community 80 - "session-store-durability.test.ts"
Cohesion: 0.27
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 81 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 82 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 84 - "claude-agent-service.test.ts"
Cohesion: 0.25
Nodes (5): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle()

### Community 85 - "session-admission-lifecycle.test.ts"
Cohesion: 0.25
Nodes (6): deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases

### Community 86 - "session-clear-transcript.test.ts"
Cohesion: 0.25
Nodes (5): disk, fixtures, gate(), holdTurnWrite(), releases

### Community 89 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 91 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 92 - "knowledge-restore.ts"
Cohesion: 0.43
Nodes (3): KnowledgePosition, KnowledgeRestoreState, base

### Community 94 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 99 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **444 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+439 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 686 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `delegated-transcription-service.ts`, `SessionDetail`, `AgentService`, `SessionService`, `TranscriptionError`, `ComputerManager`, `file-upload-routes.ts`, `transcription-service.ts`, `registerHubRoutes`, `PushNotificationService`, `ClaudeAgentService`, `ProviderSessionService`, `multi-node.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `.get`, `AgentService`, `.create`, `.syncTranscripts`, `.drainSdkQueue`, `.discoverSessions`, `.publish`, `SessionFileUpload`, `session-store.ts`, `.sendAdmittedWithBackend`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `.handleSessionEvent`, `.get`, `SessionService`, `.syncTranscripts`, `.drainSdkQueue`, `.discoverSessions`, `.publish`, `SlashCommand`, `SessionFileUpload`, `BackgroundTaskSnapshot`, `.replyUserInputInternal`, `.sendAdmittedWithBackend`, `session-service.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _444 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.050200803212851405 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.07711711711711712 - nodes in this community are weakly interconnected._
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
