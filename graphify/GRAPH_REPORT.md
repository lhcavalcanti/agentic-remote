# Agentic Remote - Graphify code map

Snapshot: `4f33fcdeadab627c9c808d900656a76d3bbc9596f1ec6ba1532da0c502aa920e`

Source checkout: `68ab52951fcb12c4e38bc388742a0b7ea2d55c22`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 123 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 123 files · ~262,778 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2350 nodes · 6192 edges · 115 communities (74 shown, 27 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 462 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- agentic-remote-promotion-monitor
- background-task-adapter.ts
- AgentService
- SessionDetail
- api.ts
- claude-agent-service.ts
- contracts.ts
- bundle
- .get
- lib.rs
- .publish
- RemoteNodeClient
- shell.ts
- TmuxTerminalSessionController
- agent-service.ts
- config.rs
- ComputerManager
- pwa.ts
- PushNotificationService
- ProviderSessionService
- terminal-session.test.ts
- terminal-session.ts
- devDependencies
- .create
- agentic-remote
- agent-service.test.ts
- SessionService
- WorkspaceDialog
- agentic-remote-promotion-setup
- ClaudeAgentService
- FakeSessionService
- dependencies
- delegated-transcription-service.ts
- node-routes.ts
- scripts
- .handleSessionEvent
- directory-browser.ts
- knowledge-tree.ts
- compilerOptions
- hub-routes.ts
- transcription-service.ts
- NewSessionDialog
- active-sessions.ts
- .syncTranscripts
- workspace-browser.ts
- compilerOptions
- app.ts
- session-store-providers.test.ts
- compilerOptions
- session-admission-lifecycle.test.ts
- compilerOptions
- ComputerSummary
- NodeIdentityStore
- event-log.ts
- KnowledgeStore
- .publish
- session-store.ts
- .sendInternal
- capture
- session-reply-durability.test.ts
- desktop.json
- RuntimeModelOption
- recovery-resend-durability.test.ts
- .oxlintrc.json
- settings-local.json
- TranscriptionError
- .runQuery
- promotion-monitor.test.ts
- scripts
- bridge.rs
- package.json
- .replyUserInput
- claude-agent-service.test.ts
- SessionFileUpload
- composerTookPaste
- UserInputFieldControl
- WorkspaceListing
- settings.ts
- knowledge-restore.ts
- session-admissions.ts
- AgentProviderCapability
- composer-layout.test.ts
- SessionRuntimeInfo
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
1. `SessionDetail` - 218 edges
2. `App()` - 154 edges
3. `AgentService` - 151 edges
4. `SessionStore` - 97 edges
5. `ClaudeAgentService` - 96 edges
6. `ComputerManager` - 64 edges
7. `RemoteNodeClient` - 55 edges
8. `SessionService` - 52 edges
9. `registerHubRoutes()` - 46 edges
10. `TmuxTerminalSessionController` - 44 edges

## Surprising Connections (you probably didn't know these)
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `RemoteNodeClientEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/remote-node-client.ts → shared/contracts.ts
- `SdkQueueAdmission` --references--> `QueuedPrompt`  [EXTRACTED]
  server/session-store.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (115 total, 27 thin omitted)

### Community 0 - "App"
Cohesion: 0.05
Nodes (81): deleteKnowledgeRoot(), App(), answerUserInput(), appendComposerForKey(), appKeyDown(), attachedFiles(), audioDropped(), audioFileChanged() (+73 more)

### Community 1 - "App.tsx"
Cohesion: 0.04
Nodes (61): applyAccentIcon(), addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage() (+53 more)

### Community 2 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 3 - "background-task-adapter.ts"
Cohesion: 0.09
Nodes (50): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+42 more)

### Community 4 - "AgentService"
Cohesion: 0.08
Nodes (3): AgentService, RuntimeConfigurationError, fixture()

### Community 5 - "SessionDetail"
Cohesion: 0.09
Nodes (7): observe(), cloneSession(), SessionStore, ChatMessage, QueuedPrompt, SessionDetail, SessionStatus

### Community 6 - "api.ts"
Cohesion: 0.08
Nodes (52): parseSubmissionReceipt(), SubmissionError, submissionReceiptFromError(), cancelBackgroundTask(), cancelSession(), clearConversation(), deletePushSubscription(), deleteSession() (+44 more)

### Community 7 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (24): AgentServiceEvents, CreationRuntime, ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError() (+16 more)

### Community 8 - "contracts.ts"
Cohesion: 0.06
Nodes (38): ComputerManagerEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, RegistryState, StoredNodeIdentity, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+30 more)

### Community 9 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 11 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 12 - ".publish"
Cohesion: 0.11
Nodes (4): agentMode(), CopilotClientLike, isMissingSessionError(), removeCopilotSessionFiles()

### Community 13 - "RemoteNodeClient"
Cohesion: 0.08
Nodes (7): headerSafe(), RemoteNodeClient, client(), servers, session, NodeInfo, WorkspaceFile

### Community 14 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 15 - "TmuxTerminalSessionController"
Cohesion: 0.14
Nodes (11): findActiveCopilotProcesses(), copilotCommand(), execFileAsync, noTmuxServer(), processAncestors(), processCommand(), submitTerminalForm(), terminalChecklistState() (+3 more)

### Community 16 - "agent-service.ts"
Cohesion: 0.06
Nodes (38): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, ansiSequence, commandShortcut(), DeliveryBoundary (+30 more)

### Community 17 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 18 - "ComputerManager"
Cohesion: 0.21
Nodes (5): ComputerManager, managedSession(), registerHubRoutes(), ManagedSession, SessionListing

### Community 19 - "pwa.ts"
Cohesion: 0.11
Nodes (33): react, getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), testNotification() (+25 more)

### Community 20 - "PushNotificationService"
Cohesion: 0.12
Nodes (11): brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, registerPushRoutes(), sessionMuteSchema (+3 more)

### Community 22 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (28): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec, parseTerminalUpdateNotice() (+20 more)

### Community 23 - "terminal-session.ts"
Cohesion: 0.14
Nodes (33): activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), hasComposerAfter() (+25 more)

### Community 24 - "devDependencies"
Cohesion: 0.06
Nodes (33): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+25 more)

### Community 25 - ".create"
Cohesion: 0.10
Nodes (11): fixture(), channels, directories, fixture(), fixture(), isSessionIdList(), PendingMutation, fixture() (+3 more)

### Community 26 - "agentic-remote"
Cohesion: 0.14
Nodes (29): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+21 more)

### Community 27 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (12): CopilotSessionLike, terminalFormSteps(), configurableModel(), DeferredSession, directories, FakeCopilotClient, startupFifoFixture(), CopilotTaskInfo (+4 more)

### Community 29 - "WorkspaceDialog"
Cohesion: 0.14
Nodes (27): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), navigateDocument(), submitSearch() (+19 more)

### Community 30 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 33 - "dependencies"
Cohesion: 0.07
Nodes (29): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+21 more)

### Community 34 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (14): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+6 more)

### Community 35 - "node-routes.ts"
Cohesion: 0.09
Nodes (22): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), configureRuntimeSchema, createSessionSchema (+14 more)

### Community 36 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 37 - ".handleSessionEvent"
Cohesion: 0.19
Nodes (22): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isRuntimeReasoningEffort() (+14 more)

### Community 38 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 39 - "knowledge-tree.ts"
Cohesion: 0.13
Nodes (23): addKnowledgeRoot(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder(), openKnowledgeFile() (+15 more)

### Community 40 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 41 - "hub-routes.ts"
Cohesion: 0.09
Nodes (23): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+15 more)

### Community 42 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 43 - "NewSessionDialog"
Cohesion: 0.13
Nodes (24): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+16 more)

### Community 44 - "active-sessions.ts"
Cohesion: 0.19
Nodes (22): ActiveProcess, execFileAsync, findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+14 more)

### Community 45 - ".syncTranscripts"
Cohesion: 0.14
Nodes (5): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), PendingPermission, PendingUserInput

### Community 46 - "workspace-browser.ts"
Cohesion: 0.19
Nodes (17): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+9 more)

### Community 47 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 48 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+5 more)

### Community 49 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 50 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 51 - "session-admission-lifecycle.test.ts"
Cohesion: 0.13
Nodes (13): deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, disk, fixture() (+5 more)

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

### Community 56 - "KnowledgeStore"
Cohesion: 0.16
Nodes (5): SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, KnowledgeRoot

### Community 58 - "session-store.ts"
Cohesion: 0.12
Nodes (13): activityDuration(), activityResultPreview(), emptyRetirements, PendingChange, RecoveryResend, SdkQueueAdmission, SessionProjection, SessionReplacementCleanupError (+5 more)

### Community 59 - ".sendInternal"
Cohesion: 0.26
Nodes (12): capturePane(), composerHoldsText(), composerText(), hasLiveTerminalComposer(), isTerminalAgentWorking(), isTerminalOverlay(), isTerminalSessionInUsePrompt(), parseTerminalFormPrompt() (+4 more)

### Community 60 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 61 - "session-reply-durability.test.ts"
Cohesion: 0.22
Nodes (11): assistantFixture(), claudeFixture(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, fixtures, holdCompletion() (+3 more)

### Community 62 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 64 - "recovery-resend-durability.test.ts"
Cohesion: 0.15
Nodes (10): directories, disk, gate(), gates, initialize(), runtimes, sdkFixture(), SendKind (+2 more)

### Community 65 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 66 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 67 - "TranscriptionError"
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

### Community 72 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 73 - ".replyUserInput"
Cohesion: 0.39
Nodes (4): answer(), claudeQuestions(), claudeRequest(), copilotRequest()

### Community 74 - "claude-agent-service.test.ts"
Cohesion: 0.25
Nodes (5): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle()

### Community 76 - "composerTookPaste"
Cohesion: 0.39
Nodes (8): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse(), pastedPlaceholderCount(), qualifyingPasteCount()

### Community 77 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 79 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 80 - "knowledge-restore.ts"
Cohesion: 0.43
Nodes (3): KnowledgePosition, KnowledgeRestoreState, base

### Community 85 - "SessionRuntimeInfo"
Cohesion: 0.50
Nodes (3): listTmuxSessions(), safeWindowName(), SessionRuntimeInfo

### Community 87 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

### Community 89 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **410 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+405 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 637 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SessionService` connect `SessionService` to `directory-browser.ts`, `claude-agent-service.ts`, `RemoteNodeClient`, `WorkspaceListing`, `AgentProviderCapability`, `ComputerSummary`, `ProviderSessionService`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `findActiveCopilotProcesses()` connect `TmuxTerminalSessionController` to `active-sessions.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _410 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.05134825014343087 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.04033485540334855 - nodes in this community are weakly interconnected._
- **Should `agentic-remote-promotion-monitor` be split into smaller, more focused modules?**
  _Cohesion score 0.059676044330775786 - nodes in this community are weakly interconnected._
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
