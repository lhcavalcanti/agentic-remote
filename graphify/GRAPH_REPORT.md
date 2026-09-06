# Agentic Remote - Graphify code map

Snapshot: `e57f7847a3f9337d0984795eb9d636a436c9b79be1cf171026cbcdcc13c93561`

Source checkout: `fe74a367817fa94d1b43723b33fdc0d238594c6d`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 130 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 130 files · ~281,792 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2432 nodes · 6499 edges · 113 communities (76 shown, 23 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 503 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- ComputerManager
- App
- ClaudeAgentService
- agentic-remote-promotion-monitor
- SessionDetail
- App.tsx
- api.ts
- claude-agent-service.ts
- RemoteNodeClient
- contracts.ts
- TmuxTerminalSessionController
- terminal-session.ts
- AgentService
- background-task-adapter.ts
- bundle
- lib.rs
- .readAfterWrites
- claude-recovery-admission.test.ts
- agent-service.ts
- .publish
- config.rs
- pwa.ts
- PushNotificationService
- agentic-remote
- devDependencies
- ProviderSessionService
- agent-service.test.ts
- multi-node.test.ts
- WorkspaceDialog
- agentic-remote-promotion-setup
- delegated-transcription-service.ts
- dependencies
- FakeSessionService
- knowledge-tree.ts
- scripts
- shell.ts
- terminal-startup-queue.test.ts
- .handleSessionEvent
- node-routes.ts
- session-reply-durability.test.ts
- compilerOptions
- hub-routes.ts
- NewSessionDialog
- active-sessions.ts
- session-enqueue-clear.test.ts
- session-store.ts
- session-store-providers.test.ts
- terminal-session.test.ts
- compilerOptions
- app.ts
- transcription-service.ts
- compilerOptions
- compilerOptions
- directory-browser.ts
- BackgroundTaskSnapshot
- event-log.ts
- workspace-browser.ts
- session-clear-transcript.test.ts
- TranscriptionError
- .syncTranscripts
- recovery-resend-durability.test.ts
- capture
- desktop.json
- .get
- KnowledgeStore
- .oxlintrc.json
- settings-local.json
- .replyUserInputInternal
- shell-notifications.ts
- promotion-monitor.test.ts
- scripts
- composerHoldsText
- bridge.rs
- package.json
- SessionFileUpload
- .persist
- UserInputFieldControl
- .providerRuntimeOptions
- settings.ts
- knowledge-restore.ts
- release-publication.test.ts
- composer-layout.test.ts
- RuntimeOptions
- removeComputer
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
1. `SessionDetail` - 227 edges
2. `AgentService` - 167 edges
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
- `RemoteNodeClientEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/remote-node-client.ts → shared/contracts.ts
- `SdkQueueAdmission` --references--> `QueuedPrompt`  [EXTRACTED]
  server/session-store.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (113 total, 23 thin omitted)

### Community 0 - "ComputerManager"
Cohesion: 0.07
Nodes (10): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, registerNodeRoutes(), SessionService (+2 more)

### Community 1 - "App"
Cohesion: 0.05
Nodes (82): deleteKnowledgeRoot(), replyPermission(), App(), answerUserInput(), appendComposerForKey(), appKeyDown(), attachedFiles(), audioDropped() (+74 more)

### Community 2 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (4): ClaudeAgentService, isMissingClaudeSessionError(), QueuedPromptReservation, RuntimeModelOption

### Community 3 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 4 - "SessionDetail"
Cohesion: 0.09
Nodes (7): observe(), cloneSession(), SessionStore, ChatMessage, QueuedPrompt, SessionDetail, SessionStatus

### Community 5 - "App.tsx"
Cohesion: 0.04
Nodes (56): applyAccentIcon(), configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+48 more)

### Community 6 - "api.ts"
Cohesion: 0.08
Nodes (58): parseSubmissionReceipt(), submissionReceiptFromError(), cancelBackgroundTask(), cancelSession(), clearConversation(), deletePushSubscription(), deleteSession(), getProviderRuntimeOptions() (+50 more)

### Community 7 - "claude-agent-service.ts"
Cohesion: 0.05
Nodes (28): AgentServiceEvents, CreationRuntime, ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError() (+20 more)

### Community 8 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (10): RemoteResync, headerSafe(), RemoteNodeClient, client(), servers, session, NodeInfo, WorkspaceFile (+2 more)

### Community 9 - "contracts.ts"
Cohesion: 0.06
Nodes (36): ComputerManagerEvents, RemoteSessionListing, RemoteSessionRead, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, normalizeNodeUrl(), REDIRECT_STATUSES, RemoteNodeClientEvents (+28 more)

### Community 10 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (15): findActiveCopilotProcesses(), composer(), processAdapter, copilotCommand(), execFileAsync, listTmuxSessions(), noTmuxServer(), processAncestors() (+7 more)

### Community 11 - "terminal-session.ts"
Cohesion: 0.13
Nodes (40): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+32 more)

### Community 12 - "AgentService"
Cohesion: 0.09
Nodes (3): AgentService, fixture(), httpBoundary()

### Community 13 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (43): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+35 more)

### Community 14 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 15 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 16 - ".readAfterWrites"
Cohesion: 0.10
Nodes (3): isUncertainDelivery(), TerminalSessionController, PendingPermission

### Community 17 - "claude-recovery-admission.test.ts"
Cohesion: 0.07
Nodes (29): connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures, holdClaimWrite() (+21 more)

### Community 18 - "agent-service.ts"
Cohesion: 0.06
Nodes (38): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, ansiSequence, commandShortcut(), DeliveryBoundary (+30 more)

### Community 19 - ".publish"
Cohesion: 0.11
Nodes (4): agentMode(), CopilotClientLike, isMissingSessionError(), removeCopilotSessionFiles()

### Community 20 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 21 - "pwa.ts"
Cohesion: 0.11
Nodes (33): react, getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), testNotification() (+25 more)

### Community 22 - "PushNotificationService"
Cohesion: 0.12
Nodes (11): brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, registerPushRoutes(), sessionMuteSchema (+3 more)

### Community 23 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 24 - "devDependencies"
Cohesion: 0.06
Nodes (33): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+25 more)

### Community 26 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (12): CopilotSessionLike, terminalFormSteps(), configurableModel(), DeferredSession, directories, FakeCopilotClient, startupFifoFixture(), CopilotTaskInfo (+4 more)

### Community 27 - "multi-node.test.ts"
Cohesion: 0.10
Nodes (8): ComputerRegistry, RegistryState, directories, directories, remoteSnapshotFixture(), temporaryDirectory(), NodeIdentityStore, StoredNodeIdentity

### Community 28 - "WorkspaceDialog"
Cohesion: 0.14
Nodes (27): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), navigateDocument(), submitSearch() (+19 more)

### Community 29 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 30 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (15): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+7 more)

### Community 31 - "dependencies"
Cohesion: 0.07
Nodes (29): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/websocket, ffmpeg-static (+21 more)

### Community 33 - "knowledge-tree.ts"
Cohesion: 0.12
Nodes (25): WorkspaceEntry, addKnowledgeRoot(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+17 more)

### Community 34 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 35 - "shell.ts"
Cohesion: 0.15
Nodes (24): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+16 more)

### Community 36 - "terminal-startup-queue.test.ts"
Cohesion: 0.14
Nodes (21): findActiveCopilotSessions(), directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec (+13 more)

### Community 37 - ".handleSessionEvent"
Cohesion: 0.19
Nodes (21): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isRuntimeReasoningEffort() (+13 more)

### Community 38 - "node-routes.ts"
Cohesion: 0.10
Nodes (21): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), configureRuntimeSchema, createSessionSchema (+13 more)

### Community 39 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (16): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+8 more)

### Community 40 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 41 - "hub-routes.ts"
Cohesion: 0.09
Nodes (23): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, executeCommandSchema, hostAllowed(), isLoopbackHost() (+15 more)

### Community 42 - "NewSessionDialog"
Cohesion: 0.13
Nodes (24): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+16 more)

### Community 43 - "active-sessions.ts"
Cohesion: 0.22
Nodes (20): ActiveProcess, execFileAsync, findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess(), isDescendantOf() (+12 more)

### Community 44 - "session-enqueue-clear.test.ts"
Cohesion: 0.13
Nodes (15): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), disk, EnqueueCase, fixture() (+7 more)

### Community 45 - "session-store.ts"
Cohesion: 0.10
Nodes (16): activityDuration(), activityResultPreview(), DiscoveredSession, emptyRetirements, PendingChange, RecoveryResend, SdkQueueAdmission, SessionProjection (+8 more)

### Community 46 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, releases (+2 more)

### Community 47 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (17): parseTerminalUpdateNotice(), submitTerminalForm(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), desktopInstallPane, directories (+9 more)

### Community 48 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 49 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+5 more)

### Community 50 - "transcription-service.ts"
Cohesion: 0.12
Nodes (16): CommandOptions, CommandResult, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic, genericMimeTypes (+8 more)

### Community 51 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 52 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 53 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 54 - "BackgroundTaskSnapshot"
Cohesion: 0.18
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 55 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 56 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 58 - "session-clear-transcript.test.ts"
Cohesion: 0.14
Nodes (6): SessionAdmissions, disk, fixtures, gate(), holdTurnWrite(), releases

### Community 59 - "TranscriptionError"
Cohesion: 0.21
Nodes (6): CommandRunner, LocalTranscriptionService, MAX_AUDIO_DURATION_SECONDS, directories, fixture(), TranscriptionError

### Community 60 - ".syncTranscripts"
Cohesion: 0.17
Nodes (4): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), TranscriptObservation

### Community 61 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 62 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 63 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 65 - "KnowledgeStore"
Cohesion: 0.23
Nodes (4): KnowledgeState, KnowledgeStore, directories, KnowledgeRoot

### Community 66 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 67 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 69 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 70 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 71 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 72 - "composerHoldsText"
Cohesion: 0.33
Nodes (11): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse() (+3 more)

### Community 73 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 74 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 77 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 79 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 80 - "knowledge-restore.ts"
Cohesion: 0.43
Nodes (3): KnowledgePosition, KnowledgeRestoreState, base

### Community 81 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 84 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 87 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **431 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+426 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 666 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ClaudeAgentService` connect `ClaudeAgentService` to `ComputerManager`, `claude-agent-service.ts`, `session-reply-durability.test.ts`, `SessionFileUpload`, `session-enqueue-clear.test.ts`, `directory-browser.ts`, `BackgroundTaskSnapshot`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `ComputerManager` to `claude-agent-service.ts`, `RemoteNodeClient`, `contracts.ts`, `RuntimeOptions`, `BackgroundTaskSnapshot`, `ProviderSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _431 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ComputerManager` be split into smaller, more focused modules?**
  _Cohesion score 0.07003475006682705 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.048179271708683476 - nodes in this community are weakly interconnected._
- **Should `ClaudeAgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.06430745814307458 - nodes in this community are weakly interconnected._
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
