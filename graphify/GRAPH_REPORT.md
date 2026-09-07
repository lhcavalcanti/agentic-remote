# Agentic Remote - Graphify code map

Snapshot: `b5ac7a2850da994771f7a3897124316474f7aeecf6980b57adcfcebc0fba7624`

Source checkout: `9a981e4f2441e604b4203e09115c8366198cc685`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 136 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 136 files · ~309,471 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2519 nodes · 6754 edges · 115 communities (74 shown, 28 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 521 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- background-task-adapter.ts
- SessionDetail
- ClaudeAgentService
- App.tsx
- agentic-remote-promotion-monitor
- api.ts
- contracts.ts
- transcription-service.ts
- RemoteNodeClient
- agent-service.ts
- bundle
- terminal-session.ts
- AgentService
- .create
- pwa.ts
- lib.rs
- app.ts
- shell.ts
- ComputerManager
- PushNotificationService
- TmuxTerminalSessionController
- config.rs
- .sendAdmittedWithBackend
- ProviderSessionService
- devDependencies
- agentic-remote
- SessionService
- agent-service.test.ts
- claude-agent-service.ts
- WorkspaceDialog
- dependencies
- agentic-remote-promotion-setup
- computer-manager.ts
- .syncTranscripts
- FakeSessionService
- hub-routes.ts
- session-store.ts
- scripts
- terminal-startup-queue.test.ts
- session-reply-durability.test.ts
- tmux-errors.integration.test.ts
- directory-browser.ts
- compilerOptions
- active-sessions.ts
- terminal-session.test.ts
- NewSessionDialog
- .publish
- .handleSessionEvent
- .get
- .clearSerialized
- session-enqueue-clear.test.ts
- ComputerRegistry
- node-routes.ts
- session-store-providers.test.ts
- compilerOptions
- knowledge-tree.ts
- compilerOptions
- compilerOptions
- event-log.ts
- .oxlintrc.json
- remote-node-client.ts
- session-clear-transcript.test.ts
- .replyUserInputInternal
- recovery-resend-durability.test.ts
- tmux-errors.test.ts
- capture
- desktop.json
- settings-local.json
- composerHoldsText
- CopilotClientLike
- promotion-monitor.test.ts
- session-response-order.ts
- scripts
- bridge.rs
- package.json
- SessionFileUpload
- UserInputFieldControl
- knowledge-restore.ts
- settings.ts
- SlashCommand
- release-publication.test.ts
- AgentProviderCapability
- composer-layout.test.ts
- removeComputer
- RemovedQueuedPrompt
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
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
1. `SessionDetail` - 231 edges
2. `AgentService` - 179 edges
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
- `ClaudeAgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (115 total, 28 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (88): addKnowledgeRoot(), deleteKnowledgeRoot(), replyPermission(), App(), answerUserInput(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot() (+80 more)

### Community 1 - "background-task-adapter.ts"
Cohesion: 0.07
Nodes (68): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+60 more)

### Community 2 - "SessionDetail"
Cohesion: 0.08
Nodes (7): observe(), SessionStore, stopOwnedServer(), ChatMessage, QueuedPrompt, SessionDetail, SessionStatus

### Community 3 - "ClaudeAgentService"
Cohesion: 0.07
Nodes (3): ClaudeAgentService, isMissingClaudeSessionError(), RuntimeModelOption

### Community 4 - "App.tsx"
Cohesion: 0.04
Nodes (59): applyAccentIcon(), configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+51 more)

### Community 5 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 6 - "api.ts"
Cohesion: 0.08
Nodes (52): parseSubmissionReceipt(), SubmissionError, submissionReceiptFromError(), cancelBackgroundTask(), cancelSession(), clearConversation(), deleteSession(), getProviderRuntimeOptions() (+44 more)

### Community 7 - "contracts.ts"
Cohesion: 0.06
Nodes (30): AgentServiceEvents, CreationRuntime, directories, ProviderSessionServiceEvents, ActivityStatus, AddKnowledgeRootInput, AgentMode, AgentProvider (+22 more)

### Community 8 - "transcription-service.ts"
Cohesion: 0.07
Nodes (29): collect(), oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload, CommandOptions, CommandResult (+21 more)

### Community 9 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (8): BackgroundTaskUpdate, RemoteResync, headerSafe(), RemoteNodeClient, BackgroundTaskSnapshot, NodeInfo, WorkspaceFile, WorkspaceListing

### Community 10 - "agent-service.ts"
Cohesion: 0.05
Nodes (44): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, ansiSequence, commandShortcut(), DeliveryBoundary (+36 more)

### Community 11 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 12 - "terminal-session.ts"
Cohesion: 0.12
Nodes (40): activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), hasComposerAfter() (+32 more)

### Community 13 - "AgentService"
Cohesion: 0.09
Nodes (4): AgentService, removeCopilotSessionFiles(), RuntimeConfigurationError, httpBoundary()

### Community 14 - ".create"
Cohesion: 0.07
Nodes (30): fixture(), ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), connect(), createStore() (+22 more)

### Community 15 - "pwa.ts"
Cohesion: 0.10
Nodes (36): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart() (+28 more)

### Community 16 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 17 - "app.ts"
Cohesion: 0.08
Nodes (23): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), ServerRole (+15 more)

### Community 18 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 19 - "ComputerManager"
Cohesion: 0.21
Nodes (4): ComputerManager, managedSession(), registerHubRoutes(), ManagedSession

### Community 20 - "PushNotificationService"
Cohesion: 0.11
Nodes (13): ComputerManagerEvents, brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, registerPushRoutes() (+5 more)

### Community 21 - "TmuxTerminalSessionController"
Cohesion: 0.14
Nodes (8): copilotCommand(), execFileAsync, processAncestors(), processCommand(), submitTerminalForm(), tmuxTargetForPid(), TmuxTerminalSessionController, PendingUserInput

### Community 22 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 23 - ".sendAdmittedWithBackend"
Cohesion: 0.12
Nodes (4): isUncertainDelivery(), isTerminalAgentWorking(), isTerminalSessionInUsePrompt(), TerminalSessionController

### Community 25 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 26 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 28 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (12): CopilotSessionLike, terminalFormSteps(), configurableModel(), DeferredSession, directories, FakeCopilotClient, startupFifoFixture(), CopilotTaskInfo (+4 more)

### Community 29 - "claude-agent-service.ts"
Cohesion: 0.11
Nodes (26): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+18 more)

### Community 30 - "WorkspaceDialog"
Cohesion: 0.13
Nodes (28): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), navigateDocument(), submitSearch() (+20 more)

### Community 31 - "dependencies"
Cohesion: 0.06
Nodes (31): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+23 more)

### Community 32 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 33 - "computer-manager.ts"
Cohesion: 0.11
Nodes (13): RemoteSessionListing, RemoteSessionRead, sessionAtLeastAsNew(), RegisteredComputer, normalizeNodeUrl(), AddComputerInput, ComputerSummary, CreateSessionInput (+5 more)

### Community 36 - "hub-routes.ts"
Cohesion: 0.08
Nodes (24): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+16 more)

### Community 37 - "session-store.ts"
Cohesion: 0.08
Nodes (19): activityDuration(), activityResultPreview(), cloneSession(), DiscoveredSession, emptyRetirements, PendingChange, PendingMutation, QueuedPromptReservation (+11 more)

### Community 38 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 39 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (20): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec, deliveryFixture() (+12 more)

### Community 40 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (16): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+8 more)

### Community 41 - "tmux-errors.integration.test.ts"
Cohesion: 0.13
Nodes (11): KnowledgeState, KnowledgeStore, directories, createHub(), execFileAsync, headers, ignoreMissing(), removeFixture() (+3 more)

### Community 42 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 43 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 44 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 45 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (19): listTmuxSessions(), parseTerminalUpdateNotice(), safeWindowName(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), desktopInstallPane (+11 more)

### Community 46 - "NewSessionDialog"
Cohesion: 0.13
Nodes (24): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+16 more)

### Community 48 - ".handleSessionEvent"
Cohesion: 0.25
Nodes (17): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+9 more)

### Community 51 - "session-enqueue-clear.test.ts"
Cohesion: 0.14
Nodes (17): disk, EnqueueCase, fixture(), fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet() (+9 more)

### Community 52 - "ComputerRegistry"
Cohesion: 0.15
Nodes (6): ComputerRegistry, RegistryState, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore

### Community 53 - "node-routes.ts"
Cohesion: 0.10
Nodes (19): MAX_SESSION_FILE_BYTES, StoredNodeIdentity, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema (+11 more)

### Community 54 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+2 more)

### Community 55 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 56 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (17): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+9 more)

### Community 57 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 58 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 59 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 60 - ".oxlintrc.json"
Cohesion: 0.12
Nodes (16): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+8 more)

### Community 61 - "remote-node-client.ts"
Cohesion: 0.16
Nodes (10): REDIRECT_STATUSES, RemoteNodeClientEvents, RemoteNodeRedirectError, RemoteNodeRequestError, client(), servers, session, SubmissionReceipt (+2 more)

### Community 62 - "session-clear-transcript.test.ts"
Cohesion: 0.14
Nodes (6): SessionAdmissions, disk, fixtures, gate(), holdTurnWrite(), releases

### Community 63 - ".replyUserInputInternal"
Cohesion: 0.15
Nodes (3): persistedFormAnswer(), validateUserInputForm(), PendingPermission

### Community 64 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 65 - "tmux-errors.test.ts"
Cohesion: 0.17
Nodes (12): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+4 more)

### Community 66 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 67 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 68 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 69 - "composerHoldsText"
Cohesion: 0.27
Nodes (12): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText() (+4 more)

### Community 70 - "CopilotClientLike"
Cohesion: 0.17
Nodes (5): CopilotClientLike, holdProbe(), fixtures, gate(), releases

### Community 71 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 72 - "session-response-order.ts"
Cohesion: 0.29
Nodes (10): sortSessions(), upsertSessionSnapshot(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+2 more)

### Community 73 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 74 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 75 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 77 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 78 - "knowledge-restore.ts"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 79 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 81 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 84 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **446 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+441 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 690 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `computer-manager.ts`, `contracts.ts`, `directory-browser.ts`, `SessionFileUpload`, `SlashCommand`, `RemovedQueuedPrompt`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `.syncTranscripts`, `ClaudeAgentService`, `session-store.ts`, `SessionFileUpload`, `.create`, `.publish`, `.get`, `.clearSerialized`, `.sendAdmittedWithBackend`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `.syncTranscripts`, `contracts.ts`, `directory-browser.ts`, `agent-service.ts`, `SessionFileUpload`, `.publish`, `.handleSessionEvent`, `.get`, `.clearSerialized`, `SlashCommand`, `AgentProviderCapability`, `.sendAdmittedWithBackend`, `.replyUserInputInternal`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _446 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04493284493284493 - nodes in this community are weakly interconnected._
- **Should `background-task-adapter.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06848425835767608 - nodes in this community are weakly interconnected._
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
