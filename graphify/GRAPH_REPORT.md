# Agentic Remote - Graphify code map

Snapshot: `63a31a7d0d490b9de3dbd733acf5d14ffccdacd78b7c53abafbbae581f0fdf24`

Source checkout: `85fec2951dfe1aed153445acdb6ac362458da3cf`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 126 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 126 files · ~279,641 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2400 nodes · 6375 edges · 108 communities (72 shown, 23 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 462 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- contracts.ts
- App.tsx
- AgentService
- SessionDetail
- ClaudeAgentService
- App
- api.ts
- queueConflict
- sessionKey
- agentic-remote-promotion-monitor
- ComputerManager
- background-task-adapter.ts
- RemoteNodeClient
- bundle
- ProviderSessionService
- TmuxTerminalSessionController
- terminal-session.ts
- lib.rs
- shell.ts
- TerminalSessionController
- config.rs
- pwa.ts
- SessionService
- devDependencies
- agent-service.ts
- WorkspaceDialog
- dependencies
- node-routes.ts
- agentic-remote
- agentic-remote-promotion-setup
- FakeSessionService
- terminal-session.test.ts
- agent-service.test.ts
- session-store-providers.test.ts
- scripts
- .handleSessionEvent
- delegated-transcription-service.ts
- compilerOptions
- active-sessions.ts
- hub-routes.ts
- queued-dispatch.test.ts
- ComputerRegistry
- NewSessionDialog
- queued-provider-dispatch.test.ts
- PushNotificationService
- compilerOptions
- app.ts
- transcription-service.ts
- knowledge-tree.ts
- compilerOptions
- compilerOptions
- event-log.ts
- workspace-browser.ts
- push-notification-service.ts
- BackgroundTaskSnapshot
- directory-browser.ts
- TranscriptionError
- tmux-errors.test.ts
- capture
- file-upload-routes.ts
- desktop.json
- .send
- .oxlintrc.json
- settings-local.json
- promotion-monitor.test.ts
- scripts
- bridge.rs
- package.json
- KnowledgeStore
- SessionFileUpload
- knowledge-store.ts
- tmux-errors.integration.test.ts
- UserInputFieldControl
- knowledge-restore.ts
- settings.ts
- composer-layout.test.ts
- hub-routes.test.ts
- release-publication.test.ts
- MockMediaRecorder
- MermaidDiagram.tsx
- hostAllowed
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
1. `SessionDetail` - 205 edges
2. `App()` - 188 edges
3. `AgentService` - 133 edges
4. `ClaudeAgentService` - 89 edges
5. `SessionStore` - 85 edges
6. `ComputerManager` - 70 edges
7. `RemoteNodeClient` - 58 edges
8. `SessionService` - 57 edges
9. `registerHubRoutes()` - 53 edges
10. `FakeSessionService` - 47 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `KnowledgeFolderState` --references--> `WorkspaceListing`  [EXTRACTED]
  src/knowledge-tree.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (108 total, 23 thin omitted)

### Community 0 - "contracts.ts"
Cohesion: 0.04
Nodes (57): AgentServiceEvents, CreationRuntime, ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError() (+49 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (82): applyAccentIcon(), addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage() (+74 more)

### Community 2 - "AgentService"
Cohesion: 0.07
Nodes (3): AgentService, isMissingSessionError(), removeCopilotSessionFiles()

### Community 3 - "SessionDetail"
Cohesion: 0.06
Nodes (23): fixture(), claudeFixture(), copilotFixture(), seed(), activityDuration(), activityResultPreview(), cloneSession(), DiscoveredSession (+15 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (5): ClaudeAgentService, isMissingClaudeSessionError(), QueuedDispatchTarget, QueuedPromptDispatchResult, RuntimeModelOption

### Community 5 - "App"
Cohesion: 0.05
Nodes (65): addKnowledgeRoot(), deleteKnowledgeRoot(), App(), answerUserInput(), applyComputerSnapshot(), attachedFiles(), audioDropped(), audioFileChanged() (+57 more)

### Community 6 - "api.ts"
Cohesion: 0.08
Nodes (57): cancelBackgroundTask(), cancelSession(), clearConversation(), deleteSession(), dispatchQueuedPrompt(), getProviderRuntimeOptions(), getPushSettings(), getRuntimeOptions() (+49 more)

### Community 7 - "queueConflict"
Cohesion: 0.08
Nodes (18): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+10 more)

### Community 8 - "sessionKey"
Cohesion: 0.08
Nodes (58): activeComposerPastes(), appendComposerForKey(), appKeyDown(), applySession(), cancelQueuedPromptEdit(), checkEditedQueue(), composerChanged(), composerKeyDown() (+50 more)

### Community 9 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (55): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+47 more)

### Community 10 - "ComputerManager"
Cohesion: 0.15
Nodes (8): ComputerManager, managedSession(), sessionAtLeastAsNew(), registerHubRoutes(), ComputerSummary, ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 11 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (44): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+36 more)

### Community 12 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (10): headerSafe(), RemoteNodeClient, RemoteNodeRequestError, client(), servers, session, NodeInfo, RemovedQueuedPrompt (+2 more)

### Community 13 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 15 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (14): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), terminalChecklistState() (+6 more)

### Community 16 - "terminal-session.ts"
Cohesion: 0.13
Nodes (39): activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), findTerminalWrappedText(), hasComposerAfter(), hasLiveTerminalComposer() (+31 more)

### Community 17 - "lib.rs"
Cohesion: 0.14
Nodes (35): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+27 more)

### Community 18 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 19 - "TerminalSessionController"
Cohesion: 0.07
Nodes (8): agentMode(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), persistedFormAnswer(), RuntimeConfigurationError, statusFromEvents(), validateUserInputForm(), TerminalSessionController

### Community 20 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 21 - "pwa.ts"
Cohesion: 0.11
Nodes (34): react, deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+26 more)

### Community 23 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 24 - "agent-service.ts"
Cohesion: 0.07
Nodes (32): ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, ansiSequence, commandShortcut(), ElicitationContext, ElicitationHandler (+24 more)

### Community 25 - "WorkspaceDialog"
Cohesion: 0.12
Nodes (29): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+21 more)

### Community 26 - "dependencies"
Cohesion: 0.06
Nodes (31): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/multipart, @fastify/static, @fastify/websocket (+23 more)

### Community 27 - "node-routes.ts"
Cohesion: 0.08
Nodes (22): NodeIdentityStore, StoredNodeIdentity, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema (+14 more)

### Community 28 - "agentic-remote"
Cohesion: 0.14
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 29 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 31 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (22): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), parseTerminalUpdateNotice(), bracketedTabPane, deliveryFixture() (+14 more)

### Community 32 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (9): terminalFormSteps(), DeferredSession, directories, FakeCopilotClient, services, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind (+1 more)

### Community 33 - "session-store-providers.test.ts"
Cohesion: 0.09
Nodes (9): CopilotClientLike, claude(), clearFixture(), copilot(), disk, event(), fixtures, releases (+1 more)

### Community 34 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 35 - ".handleSessionEvent"
Cohesion: 0.20
Nodes (21): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isRuntimeReasoningEffort() (+13 more)

### Community 36 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (13): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+5 more)

### Community 37 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 38 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 39 - "hub-routes.ts"
Cohesion: 0.08
Nodes (23): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, knowledgeFileSchema (+15 more)

### Community 40 - "queued-dispatch.test.ts"
Cohesion: 0.09
Nodes (13): accept(), deferred(), disk, fixtures, holdWrite(), prompt(), releases, target (+5 more)

### Community 41 - "ComputerRegistry"
Cohesion: 0.14
Nodes (7): ComputerRegistry, RegisteredComputer, RegistryState, directories, remoteSnapshotFixture(), normalizeNodeUrl(), AddComputerInput

### Community 42 - "NewSessionDialog"
Cohesion: 0.14
Nodes (23): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+15 more)

### Community 43 - "queued-provider-dispatch.test.ts"
Cohesion: 0.10
Nodes (11): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), copilotSession(), fixtures, gate() (+3 more)

### Community 45 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 46 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+5 more)

### Community 47 - "transcription-service.ts"
Cohesion: 0.12
Nodes (16): CommandOptions, CommandResult, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic, genericMimeTypes (+8 more)

### Community 48 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (17): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+9 more)

### Community 49 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 50 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 51 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 52 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 53 - "push-notification-service.ts"
Cohesion: 0.13
Nodes (11): ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, sessionMuteSchema, subscriptionSchema (+3 more)

### Community 54 - "BackgroundTaskSnapshot"
Cohesion: 0.20
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 55 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 56 - "TranscriptionError"
Cohesion: 0.21
Nodes (6): CommandRunner, LocalTranscriptionService, MAX_AUDIO_DURATION_SECONDS, directories, fixture(), TranscriptionError

### Community 57 - "tmux-errors.test.ts"
Cohesion: 0.17
Nodes (12): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+4 more)

### Community 58 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 59 - "file-upload-routes.ts"
Cohesion: 0.20
Nodes (8): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), registerTranscriptionRoutes(), transcriptionMultipartOptions

### Community 60 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 61 - ".send"
Cohesion: 0.26
Nodes (12): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText() (+4 more)

### Community 62 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 63 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 64 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 65 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 66 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 67 - "package.json"
Cohesion: 0.22
Nodes (8): name, packageManager, pnpm, onlyBuiltDependencies, private, type, version, ffmpeg-static

### Community 70 - "knowledge-store.ts"
Cohesion: 0.29
Nodes (3): KnowledgeState, directories, KnowledgeRoot

### Community 71 - "tmux-errors.integration.test.ts"
Cohesion: 0.36
Nodes (7): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer()

### Community 72 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 73 - "knowledge-restore.ts"
Cohesion: 0.39
Nodes (4): KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 74 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 78 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

### Community 80 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

### Community 81 - "hostAllowed"
Cohesion: 1.00
Nodes (3): hostAllowed(), isLoopbackHost(), originAllowed()

## Knowledge Gaps
- **427 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+422 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 659 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `contracts.ts`, `ComputerRegistry`, `SessionFileUpload`, `BackgroundTaskSnapshot`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ComputerManager` connect `ComputerManager` to `contracts.ts`, `ComputerRegistry`, `node-routes.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `ClaudeAgentService` connect `ClaudeAgentService` to `contracts.ts`, `SessionDetail`, `SessionFileUpload`, `queueConflict`, `queued-provider-dispatch.test.ts`, `ProviderSessionService`, `SessionService`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _427 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `contracts.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03920792079207921 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.03202687569988802 - nodes in this community are weakly interconnected._
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
