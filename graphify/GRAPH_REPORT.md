# Agentic Remote - Graphify code map

Snapshot: `acf1dde7b55463c5d07ebc2771ed3e9b22d8fc80167b0503811c65dac9c5b1de`

Source checkout: `b12e1c7ce2bed96db1f8a0d21321163371922268`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 160 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 160 files · ~308,878 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2681 nodes · 7058 edges · 113 communities (80 shown, 20 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 479 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App.tsx
- SessionDetail
- App
- ClaudeAgentService
- api.ts
- session-presentation.ts
- submitMessage
- agentic-remote-promotion-monitor
- SessionKnowledgeStore
- background-task-adapter.ts
- queueConflict
- claude-agent-service.ts
- ProviderSessionService
- bundle
- RemoteNodeClient
- registerHubRoutes
- pwa.ts
- contracts.ts
- agent-service.ts
- WorkspaceDialog
- lib.rs
- workspace-browser.ts
- shell.ts
- SessionService
- config.rs
- TmuxTerminalSessionController
- devDependencies
- PushNotificationService
- FakeSessionService
- dependencies
- queued-provider-dispatch.test.ts
- hub-routes.ts
- tmux-errors.integration.test.ts
- agentic-remote
- agentic-remote-promotion-setup
- terminal-session.test.ts
- app.ts
- parseTerminalPermission
- terminal-session.ts
- scripts
- delegated-transcription-service.ts
- directory-browser.ts
- compilerOptions
- transcription-service.ts
- queued-dispatch.test.ts
- capture-workspace.ts
- .handleSessionEvent
- workspace-fixtures.ts
- CopilotSessionLike
- node-routes.ts
- tmux-errors.test.ts
- compilerOptions
- NewSessionDialog
- compilerOptions
- KnowledgeStore
- compilerOptions
- ComputerManager
- event-log.ts
- session-store-providers.test.ts
- SessionKnowledgeBinding
- NodeIdentityStore
- ReaderWorkspace
- capture-workbench-review.ts
- BackgroundTaskSnapshot
- desktop.json
- agent-service.test.ts
- capture
- package.json
- .oxlintrc.json
- settings-local.json
- TranscriptionError
- promotion-monitor.test.ts
- scripts
- .readAfterWrites
- DeferredSession
- session-knowledge-routes.test.ts
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- .replyUserInput
- UserInputFieldControl
- settings.ts
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- release-publication.test.ts
- MockMediaRecorder
- MockWebSocket
- MermaidDiagram.test.tsx
- tsconfig.json
- vite.config.ts
- @fastify/multipart
- @github/copilot-sdk
- lucide-react
- pdfjs-dist
- react-markdown
- ws
- zod
- sw.js
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 206 edges
2. `App()` - 204 edges
3. `AgentService` - 133 edges
4. `ClaudeAgentService` - 89 edges
5. `SessionStore` - 85 edges
6. `ComputerManager` - 72 edges
7. `RemoteNodeClient` - 58 edges
8. `SessionService` - 58 edges
9. `registerHubRoutes()` - 54 edges
10. `FakeSessionService` - 47 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `SessionKnowledgeEvents` --references--> `SessionKnowledgeBinding`  [EXTRACTED]
  server/session-knowledge-store.ts → shared/contracts.ts
- `KnowledgeFolderState` --references--> `WorkspaceListing`  [EXTRACTED]
  src/knowledge-tree.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (113 total, 20 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.05
Nodes (4): AgentService, CopilotClientLike, isMissingSessionError(), removeCopilotSessionFiles()

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (80): ActivityStatus, UserInputField, UserInputFieldValue, accentIconUrl(), applyAccentIcon(), addComputer(), configureRuntime(), removeComputer() (+72 more)

### Community 2 - "SessionDetail"
Cohesion: 0.06
Nodes (23): fixture(), activityDuration(), activityResultPreview(), cloneSession(), DiscoveredSession, fixture(), PendingChange, PendingMutation (+15 more)

### Community 3 - "App"
Cohesion: 0.05
Nodes (78): App(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applyRootChoice(), askAboutKnowledgeFile(), attachedFiles(), audioDropped() (+70 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (9): ClaudeAgentService, ClaudeSdk, isMissingClaudeSessionError(), directories, fixture(), queryHandle(), waitForIdle(), toolResultText() (+1 more)

### Community 5 - "api.ts"
Cohesion: 0.06
Nodes (68): addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), deleteKnowledgeRoot(), deleteSession(), dispatchQueuedPrompt(), getProviderRuntimeOptions() (+60 more)

### Community 6 - "session-presentation.ts"
Cohesion: 0.06
Nodes (51): react, ComputerSummary, KnowledgeRootChoices(), actions, computers, root, session, KnowledgeRootSelector() (+43 more)

### Community 7 - "submitMessage"
Cohesion: 0.07
Nodes (61): activeComposerPastes(), answerUserInput(), applySession(), clearSelectedConversation(), closeSelectedSession(), composerChanged(), composerPasted(), durableComposerDraft() (+53 more)

### Community 8 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (55): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+47 more)

### Community 9 - "SessionKnowledgeStore"
Cohesion: 0.07
Nodes (30): key(), registerSessionKnowledgeRoutes(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+22 more)

### Community 10 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (47): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+39 more)

### Community 11 - "queueConflict"
Cohesion: 0.10
Nodes (7): isClaudeAuthenticationError(), preparePrompt(), queueConflict(), QueuedDelivery, QueuedDispatchTarget, isTerminalAgentWorking(), TerminalSessionController

### Community 12 - "claude-agent-service.ts"
Cohesion: 0.08
Nodes (22): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, PendingClaudeInput, PendingClaudePermission, directories (+14 more)

### Community 14 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 15 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (9): RemoteNodeClient, RemoteNodeRequestError, client(), servers, session, NodeInfo, RemovedQueuedPrompt, WorkspaceFile (+1 more)

### Community 16 - "registerHubRoutes"
Cohesion: 0.15
Nodes (6): managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 17 - "pwa.ts"
Cohesion: 0.10
Nodes (36): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart() (+28 more)

### Community 18 - "contracts.ts"
Cohesion: 0.08
Nodes (29): ComputerManagerEvents, RemoteResync, RemoteSessionRead, RegistryState, StoredNodeIdentity, directories, DEFINITE_DISPATCH_REFUSALS, headerSafe() (+21 more)

### Community 19 - "agent-service.ts"
Cohesion: 0.07
Nodes (39): ActivePrompt, activityDuration(), activityGroupIdFor(), activityResult(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+31 more)

### Community 20 - "WorkspaceDialog"
Cohesion: 0.10
Nodes (33): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+25 more)

### Community 21 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 22 - "workspace-browser.ts"
Cohesion: 0.09
Nodes (33): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+25 more)

### Community 23 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 25 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 26 - "TmuxTerminalSessionController"
Cohesion: 0.14
Nodes (9): capturePane(), copilotCommand(), execFileAsync, processCommand(), safeWindowName(), TmuxTerminalSessionController, PendingPermission, PendingUserInput (+1 more)

### Community 27 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 28 - "PushNotificationService"
Cohesion: 0.13
Nodes (10): brief(), HubEventSource, PushNotificationService, PushSender, PushState, registerPushRoutes(), sessionMuteSchema, subscriptionSchema (+2 more)

### Community 29 - "FakeSessionService"
Cohesion: 0.09
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 30 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 31 - "queued-provider-dispatch.test.ts"
Cohesion: 0.10
Nodes (17): errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDispatches, terminalRefused(), claudeFixture() (+9 more)

### Community 32 - "hub-routes.ts"
Cohesion: 0.07
Nodes (27): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+19 more)

### Community 33 - "tmux-errors.integration.test.ts"
Cohesion: 0.14
Nodes (29): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+21 more)

### Community 34 - "agentic-remote"
Cohesion: 0.14
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 35 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 36 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (23): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), paneShowsText(), parseTerminalUpdateNotice(), bracketedTabPane (+15 more)

### Community 37 - "app.ts"
Cohesion: 0.12
Nodes (18): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), ServerRole, transcriptionComputerName() (+10 more)

### Community 38 - "parseTerminalPermission"
Cohesion: 0.20
Nodes (25): activeBottomFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), findTerminalWrappedText(), hasComposerAfter(), hasTerminalCommandPermissionQuestion(), isTerminalDesktopInstallPrompt() (+17 more)

### Community 39 - "terminal-session.ts"
Cohesion: 0.14
Nodes (26): COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasLiveTerminalComposer(), isTerminalChrome(), normaliseOutputLine() (+18 more)

### Community 40 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 41 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (12): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+4 more)

### Community 42 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 43 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 44 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 45 - "queued-dispatch.test.ts"
Cohesion: 0.09
Nodes (13): accept(), deferred(), disk, fixtures, holdWrite(), prompt(), releases, target (+5 more)

### Community 46 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 47 - ".handleSessionEvent"
Cohesion: 0.22
Nodes (18): activityKind(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError(), numberValue() (+10 more)

### Community 48 - "workspace-fixtures.ts"
Cohesion: 0.11
Nodes (18): pageFor(), CONTEXT_EXAMPLE, createWorkspaceFixtureState(), documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureBaseUrl(), fixtureEndpoints (+10 more)

### Community 49 - "CopilotSessionLike"
Cohesion: 0.13
Nodes (7): CopilotSessionLike, FakeCopilotClient, CopilotTasksApi, acceptanceReceipt(), queuedSdkPrompt(), disposals, fixture()

### Community 50 - "node-routes.ts"
Cohesion: 0.10
Nodes (20): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+12 more)

### Community 51 - "tmux-errors.test.ts"
Cohesion: 0.14
Nodes (16): listTmuxSessions(), processAncestors(), tmuxTargetForPid(), noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories (+8 more)

### Community 52 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 53 - "NewSessionDialog"
Cohesion: 0.16
Nodes (20): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+12 more)

### Community 54 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 55 - "KnowledgeStore"
Cohesion: 0.18
Nodes (7): WorkspaceFixtureState, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 56 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 57 - "ComputerManager"
Cohesion: 0.25
Nodes (3): ComputerManager, sessionAtLeastAsNew(), RegisteredComputer

### Community 58 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 59 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (8): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession()

### Community 60 - "SessionKnowledgeBinding"
Cohesion: 0.19
Nodes (13): SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding() (+5 more)

### Community 61 - "NodeIdentityStore"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 62 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 63 - "capture-workbench-review.ts"
Cohesion: 0.13
Nodes (13): frame(), geometry, output, scratch, screenshot(), { values }, fixtureKnowledgeRoots, fixtureSessions (+5 more)

### Community 64 - "BackgroundTaskSnapshot"
Cohesion: 0.22
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 65 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 66 - "agent-service.test.ts"
Cohesion: 0.16
Nodes (10): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), terminalFormSteps(), directories, services, CopilotTaskInfo, CopilotTaskProgress (+2 more)

### Community 67 - "capture"
Cohesion: 0.22
Nodes (13): shortcutKeys(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode(), keyLabel(), readStoredShortcuts() (+5 more)

### Community 68 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 69 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 70 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 71 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 72 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 73 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 76 - "session-knowledge-routes.test.ts"
Cohesion: 0.22
Nodes (7): disk, FakeManager, fixtures, gate(), holdWrite(), releases, trusted

### Community 77 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 78 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 79 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 81 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 82 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 83 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 86 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **505 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+500 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 772 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionDetail`, `ClaudeAgentService`, `TranscriptionError`, `delegated-transcription-service.ts`, `SessionKnowledgeStore`, `transcription-service.ts`, `ProviderSessionService`, `registerHubRoutes`, `pwa.ts`, `KnowledgeStore`, `SessionService`, `ComputerManager`, `PushNotificationService`, `NodeIdentityStore`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `agent-service.test.ts`, `SessionDetail`, `.readAfterWrites`, `queueConflict`, `directory-browser.ts`, `ProviderSessionService`, `.handleSessionEvent`, `.replyUserInput`, `queued-provider-dispatch.test.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `BackgroundTaskSnapshot`, `contracts.ts`, `claude-agent-service.ts`, `directory-browser.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _505 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.05389025389025389 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.02886002886002886 - nodes in this community are weakly interconnected._
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
- `docs/design/agent-workspace.md`
- `docs/mockups/activity-view.html`
- `docs/mockups/brand-logo.html`
- `docs/native-shell.md`
- `docs/provider-compatibility.md`
- `docs/slash-command-feedback.md`
- `index.html`
- `public/apple-touch-icon-precomposed.png`
- `public/apple-touch-icon.png`
- `public/fonts/MonaSans.woff2`
- `public/fonts/OFL.txt`
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
