# Agentic Remote - Graphify code map

Snapshot: `399b9fe26c90278458e78ff8add60db7f56c857df472802dad343eb62123357c`

Source checkout: `fcf0a26ade02bc2efd7eb1b0fbf47bb227448c5e`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 131 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 131 files · ~283,247 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2440 nodes · 6531 edges · 107 communities (72 shown, 22 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 505 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- SessionDetail
- App.tsx
- AgentService
- App
- ClaudeAgentService
- agentic-remote-promotion-monitor
- transcription-service.ts
- session-store-providers.test.ts
- api.ts
- terminal-session.ts
- .get
- claude-agent-service.ts
- agent-service.ts
- .sendAdmittedWithBackend
- background-task-adapter.ts
- bundle
- RemoteNodeClient
- lib.rs
- TmuxTerminalSessionController
- shell.ts
- config.rs
- SessionService
- PushNotificationService
- pwa.ts
- contracts.ts
- ComputerManager
- remote-node-client.ts
- agentic-remote
- devDependencies
- agent-service.test.ts
- FakeSessionService
- ProviderSessionService
- multi-node.test.ts
- WorkspaceDialog
- agentic-remote-promotion-setup
- app.ts
- dependencies
- knowledge-tree.ts
- terminal-startup-queue.test.ts
- terminal-session.test.ts
- scripts
- directory-browser.ts
- compilerOptions
- hub-routes.ts
- NewSessionDialog
- active-sessions.ts
- compilerOptions
- compilerOptions
- compilerOptions
- event-log.ts
- KnowledgeStore
- workspace-browser.ts
- .oxlintrc.json
- recordValue
- ComputerSummary
- session-reply-durability.test.ts
- recovery-resend-durability.test.ts
- desktop.json
- .replyUserInputInternal
- settings-local.json
- promotion-monitor.test.ts
- SessionAdmissions
- scripts
- background-task-tracker.ts
- session-store-durability.test.ts
- session-enqueue-clear.test.ts
- bridge.rs
- package.json
- session-clear-transcript.test.ts
- SessionFileUpload
- session-response-order.test.ts
- UserInputFieldControl
- knowledge-restore.ts
- settings.ts
- SlashCommand
- removeComputer
- release-publication.test.ts
- composer-layout.test.ts
- WorkspaceListing
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
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
1. `SessionDetail` - 230 edges
2. `AgentService` - 170 edges
3. `App()` - 158 edges
4. `SessionStore` - 116 edges
5. `ClaudeAgentService` - 100 edges
6. `ComputerManager` - 64 edges
7. `RemoteNodeClient` - 55 edges
8. `SessionService` - 53 edges
9. `TmuxTerminalSessionController` - 47 edges
10. `registerHubRoutes()` - 46 edges

## Surprising Connections (you probably didn't know these)
- `navigateMessageHistory()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `SessionListing` --references--> `ManagedSession`  [EXTRACTED]
  src/api.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (107 total, 22 thin omitted)

### Community 0 - "SessionDetail"
Cohesion: 0.05
Nodes (25): channels, directories, observe(), activityDuration(), activityResultPreview(), cloneSession(), DiscoveredSession, emptyRetirements (+17 more)

### Community 1 - "App.tsx"
Cohesion: 0.04
Nodes (71): applyAccentIcon(), configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+63 more)

### Community 2 - "AgentService"
Cohesion: 0.06
Nodes (4): AgentService, RuntimeConfigurationError, fixture(), httpBoundary()

### Community 3 - "App"
Cohesion: 0.05
Nodes (79): deleteKnowledgeRoot(), replyPermission(), App(), answerUserInput(), appendComposerForKey(), appKeyDown(), attachedFiles(), audioDropped() (+71 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.07
Nodes (5): ClaudeAgentService, isMissingClaudeSessionError(), copilotRequest(), QueuedPromptReservation, RuntimeModelOption

### Community 5 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 6 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 7 - "session-store-providers.test.ts"
Cohesion: 0.04
Nodes (38): CopilotClientLike, ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), connect(), createStore() (+30 more)

### Community 8 - "api.ts"
Cohesion: 0.08
Nodes (54): parseSubmissionReceipt(), SubmissionError, submissionReceiptFromError(), cancelBackgroundTask(), cancelSession(), clearConversation(), deleteSession(), getProviderRuntimeOptions() (+46 more)

### Community 9 - "terminal-session.ts"
Cohesion: 0.11
Nodes (45): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+37 more)

### Community 10 - ".get"
Cohesion: 0.12
Nodes (4): agentMode(), isMissingSessionError(), removeCopilotSessionFiles(), TranscriptObservation

### Community 11 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (23): AgentServiceEvents, CreationRuntime, ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError() (+15 more)

### Community 12 - "agent-service.ts"
Cohesion: 0.06
Nodes (44): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityResult(), ActivityToolStart, ansiSequence, commandShortcut() (+36 more)

### Community 13 - ".sendAdmittedWithBackend"
Cohesion: 0.09
Nodes (5): isUncertainDelivery(), isTerminalAgentWorking(), TerminalSessionController, PendingPermission, PendingUserInput

### Community 14 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (44): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+36 more)

### Community 15 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 16 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (6): BackgroundTaskUpdate, headerSafe(), RemoteNodeClient, BackgroundTaskSnapshot, NodeInfo, WorkspaceFile

### Community 17 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 18 - "TmuxTerminalSessionController"
Cohesion: 0.13
Nodes (11): copilotCommand(), execFileAsync, listTmuxSessions(), noTmuxServer(), processAncestors(), processCommand(), processIsAlive(), safeWindowName() (+3 more)

### Community 19 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 20 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 22 - "PushNotificationService"
Cohesion: 0.12
Nodes (11): brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, registerPushRoutes(), sessionMuteSchema (+3 more)

### Community 23 - "pwa.ts"
Cohesion: 0.11
Nodes (33): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), testNotification() (+25 more)

### Community 24 - "contracts.ts"
Cohesion: 0.07
Nodes (29): ComputerManagerEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, normalizeNodeUrl(), ActivityStatus, AddComputerInput, AddKnowledgeRootInput (+21 more)

### Community 25 - "ComputerManager"
Cohesion: 0.23
Nodes (4): ComputerManager, managedSession(), registerHubRoutes(), ManagedSession

### Community 26 - "remote-node-client.ts"
Cohesion: 0.07
Nodes (26): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, knowledgeFileQuerySchema (+18 more)

### Community 27 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 28 - "devDependencies"
Cohesion: 0.06
Nodes (33): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+25 more)

### Community 29 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (12): CopilotSessionLike, terminalFormSteps(), configurableModel(), DeferredSession, directories, FakeCopilotClient, startupFifoFixture(), CopilotTaskInfo (+4 more)

### Community 32 - "multi-node.test.ts"
Cohesion: 0.10
Nodes (9): BuildAppOptions, ComputerRegistry, RegistryState, directories, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore (+1 more)

### Community 33 - "WorkspaceDialog"
Cohesion: 0.14
Nodes (27): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), navigateDocument(), submitSearch() (+19 more)

### Community 34 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 35 - "app.ts"
Cohesion: 0.11
Nodes (19): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+11 more)

### Community 36 - "dependencies"
Cohesion: 0.07
Nodes (29): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+21 more)

### Community 37 - "knowledge-tree.ts"
Cohesion: 0.11
Nodes (26): WorkspaceEntry, addKnowledgeRoot(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+18 more)

### Community 38 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (23): findActiveCopilotSessions(), directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec (+15 more)

### Community 39 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (24): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+16 more)

### Community 40 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 41 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 42 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 43 - "hub-routes.ts"
Cohesion: 0.09
Nodes (23): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+15 more)

### Community 44 - "NewSessionDialog"
Cohesion: 0.13
Nodes (24): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+16 more)

### Community 45 - "active-sessions.ts"
Cohesion: 0.21
Nodes (21): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+13 more)

### Community 46 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 47 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 48 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 49 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 50 - "KnowledgeStore"
Cohesion: 0.16
Nodes (5): SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, KnowledgeRoot

### Community 51 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 52 - ".oxlintrc.json"
Cohesion: 0.12
Nodes (16): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+8 more)

### Community 53 - "recordValue"
Cohesion: 0.27
Nodes (15): activityKind(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError(), numberValue() (+7 more)

### Community 54 - "ComputerSummary"
Cohesion: 0.21
Nodes (3): sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 55 - "session-reply-durability.test.ts"
Cohesion: 0.18
Nodes (14): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+6 more)

### Community 56 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 57 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 58 - ".replyUserInputInternal"
Cohesion: 0.21
Nodes (3): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents()

### Community 59 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 60 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 61 - "SessionAdmissions"
Cohesion: 0.20
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 62 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 63 - "background-task-tracker.ts"
Cohesion: 0.35
Nodes (5): backgroundTaskSnapshot(), BackgroundTaskTracker, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 64 - "session-store-durability.test.ts"
Cohesion: 0.27
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 65 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 66 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 67 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 68 - "session-clear-transcript.test.ts"
Cohesion: 0.25
Nodes (5): disk, fixtures, gate(), holdTurnWrite(), releases

### Community 70 - "session-response-order.test.ts"
Cohesion: 0.32
Nodes (7): sortSessions(), upsertSessionSnapshot(), nextSessionEventSequence(), projectSessionResponse(), sessionResponseStartedAt(), failure, session

### Community 71 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 72 - "knowledge-restore.ts"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 73 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 75 - "removeComputer"
Cohesion: 0.47
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 76 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

## Knowledge Gaps
- **431 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+426 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 666 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `multi-node.test.ts`, `SessionDetail`, `AgentService`, `ClaudeAgentService`, `transcription-service.ts`, `KnowledgeStore`, `SessionService`, `PushNotificationService`, `ComputerManager`, `ProviderSessionService`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `SessionFileUpload`, `directory-browser.ts`, `SlashCommand`, `.get`, `claude-agent-service.ts`, `.sendAdmittedWithBackend`, `recordValue`, `.replyUserInputInternal`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `ClaudeAgentService`, `SessionFileUpload`, `session-store-providers.test.ts`, `.get`, `.sendAdmittedWithBackend`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _431 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.05393939393939394 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.037292025243832475 - nodes in this community are weakly interconnected._
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
- `docs/sdk-architecture-roadmap.md`
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
