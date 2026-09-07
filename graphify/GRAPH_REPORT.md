# Agentic Remote - Graphify code map

Snapshot: `f6dfc21d2552fb66e85f7f221d57951fcce551aaa10b26c547dc7fd9ad2529cd`

Source checkout: `e14e8706ee731a9ffc1ce4d5b5cec052c8dfe5fa`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 177 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 177 files · ~358,924 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2948 nodes · 7999 edges · 112 communities (81 shown, 18 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 537 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- AgentService
- api.ts
- SessionService
- background-task-adapter.ts
- SessionDetail
- session-presentation.ts
- ClaudeAgentService
- transcription-service.ts
- SessionKnowledgeStore
- RemoteNodeClient
- session-resources.ts
- terminal-session.ts
- agentic-remote-promotion-monitor
- contracts.ts
- .dispatchCommand
- session-store.ts
- app.ts
- ComputerManager
- bundle
- pwa.ts
- WorkspaceDialog
- lib.rs
- agent-service.ts
- TmuxTerminalSessionController
- shell.ts
- workspace-fixtures.ts
- config.rs
- FakeSessionService
- ProviderSessionService
- computer-manager.ts
- devDependencies
- claude-agent-service.ts
- dependencies
- tmux-errors.integration.test.ts
- queueConflict
- knowledge-tree.ts
- agentic-remote
- agentic-remote-promotion-setup
- terminal-session.test.ts
- hub-routes.ts
- scripts
- compilerOptions
- active-sessions.ts
- queued-dispatch.test.ts
- recordValue
- capture-workspace.ts
- session-resource-routes.test.ts
- HubEvent
- compilerOptions
- PushNotificationService
- session-store-providers.test.ts
- compilerOptions
- compilerOptions
- event-log.ts
- workspace-browser.ts
- NewSessionDialog
- agent-service.test.ts
- session-resource-clear.test.ts
- use-session-knowledge-root.ts
- ReaderWorkspace
- SessionSkillsSnapshot
- tmux-errors.test.ts
- capture
- desktop.json
- capture-workbench-review.ts
- package.json
- settings-local.json
- promotion-monitor.test.ts
- scripts
- .oxlintrc.json
- DeferredSession
- session-resource-transport.ts
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- SessionFileUpload
- UserInputFieldControl
- settings.ts
- commitSidebarWidth
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- release-publication.test.ts
- MockMediaRecorder
- MermaidDiagram.tsx
- SessionActions.tsx
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
1. `App()` - 215 edges
2. `SessionDetail` - 214 edges
3. `AgentService` - 142 edges
4. `ClaudeAgentService` - 99 edges
5. `SessionStore` - 91 edges
6. `ComputerManager` - 78 edges
7. `SessionService` - 68 edges
8. `RemoteNodeClient` - 64 edges
9. `registerHubRoutes()` - 58 edges
10. `registerNodeRoutes()` - 51 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `StoredSession` --inherits--> `SessionDetail`  [EXTRACTED]
  server/session-store.ts → shared/contracts.ts
- `copy()` --indirect_call--> `source()`  [INFERRED]
  src/MarkdownCodeBlock.tsx → server/session-resources.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (112 total, 18 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (120): replyPermission(), activeComposerPastes(), App(), answerUserInput(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession() (+112 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (105): accentIconUrl(), applyAccentIcon(), addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage() (+97 more)

### Community 2 - "AgentService"
Cohesion: 0.06
Nodes (8): agentMode(), AgentService, isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError, statusFromEvents()

### Community 3 - "api.ts"
Cohesion: 0.05
Nodes (85): addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), deleteKnowledgeRoot(), deleteSession(), dispatchQueuedPrompt(), getProviderRuntimeOptions() (+77 more)

### Community 4 - "SessionService"
Cohesion: 0.06
Nodes (14): managedSession(), registerHubRoutes(), SessionMuteCarrier, registerNodeRoutes(), tokenMatches(), isSessionResourceRoute(), ResourceRead, SessionService (+6 more)

### Community 5 - "background-task-adapter.ts"
Cohesion: 0.06
Nodes (70): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+62 more)

### Community 6 - "SessionDetail"
Cohesion: 0.06
Nodes (15): fixture(), claudeFixture(), copilotFixture(), seed(), copilotFixture(), cloneSession(), fixture(), fixture() (+7 more)

### Community 7 - "session-presentation.ts"
Cohesion: 0.05
Nodes (59): plugins, oxc, react, typescript, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, KnowledgeRootChoice (+51 more)

### Community 8 - "ClaudeAgentService"
Cohesion: 0.07
Nodes (3): ClaudeAgentService, isMissingClaudeSessionError(), RuntimeModelOption

### Community 9 - "transcription-service.ts"
Cohesion: 0.06
Nodes (35): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+27 more)

### Community 10 - "SessionKnowledgeStore"
Cohesion: 0.07
Nodes (32): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+24 more)

### Community 11 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (10): RemoteResync, headerSafe(), RemoteNodeClient, client(), servers, session, RemovedQueuedPrompt, WorkspaceFile (+2 more)

### Community 12 - "session-resources.ts"
Cohesion: 0.10
Nodes (43): ActiveClaudeQuery, claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills, count() (+35 more)

### Community 13 - "terminal-session.ts"
Cohesion: 0.10
Nodes (53): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText() (+45 more)

### Community 14 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (55): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+47 more)

### Community 15 - "contracts.ts"
Cohesion: 0.07
Nodes (36): ClaudeAgentServiceEvents, directories, ProviderSessionServiceEvents, provider(), DEFINITE_DISPATCH_REFUSALS, REDIRECT_STATUSES, RemoteNodeClientEvents, RemoteNodeRedirectError (+28 more)

### Community 16 - ".dispatchCommand"
Cohesion: 0.07
Nodes (9): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), QueuedDelivery, queuedSdkPrompt(), disposals, fixture(), TerminalSessionController (+1 more)

### Community 17 - "session-store.ts"
Cohesion: 0.05
Nodes (33): CopilotClientLike, ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), copilotSession(), fixtures (+25 more)

### Community 18 - "app.ts"
Cohesion: 0.06
Nodes (36): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), transcriptionComputerName(), FileUploadError (+28 more)

### Community 19 - "ComputerManager"
Cohesion: 0.09
Nodes (16): ComputerManager, fixture(), managers, releases, remote, session(), sessionAtLeastAsNew(), ComputerRegistry (+8 more)

### Community 20 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 21 - "pwa.ts"
Cohesion: 0.10
Nodes (36): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart() (+28 more)

### Community 22 - "WorkspaceDialog"
Cohesion: 0.10
Nodes (33): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+25 more)

### Community 23 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 24 - "agent-service.ts"
Cohesion: 0.06
Nodes (37): ActivePrompt, activityResult(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime, ElicitationContext (+29 more)

### Community 25 - "TmuxTerminalSessionController"
Cohesion: 0.14
Nodes (10): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), tmuxTargetForPid(), TmuxTerminalSessionController (+2 more)

### Community 26 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 27 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (31): pageFor(), accents, Measurement, originalDocument, output, report, save(), scratch (+23 more)

### Community 28 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 29 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 31 - "computer-manager.ts"
Cohesion: 0.07
Nodes (24): ServerRole, RemoteSessionListing, RemoteSessionRead, SessionMetadataLookup, normalizeNodeUrl(), Lineage, RegistrationGeneration, ReplacementEvidence (+16 more)

### Community 32 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 33 - "claude-agent-service.ts"
Cohesion: 0.12
Nodes (20): AuthStatusRunner, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, toolResultText(), DirectoryScope (+12 more)

### Community 34 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 35 - "tmux-errors.integration.test.ts"
Cohesion: 0.10
Nodes (18): WorkspaceFixtureState, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), execFileAsync, headers (+10 more)

### Community 36 - "queueConflict"
Cohesion: 0.15
Nodes (13): errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), queueConflict(), QueuedDispatches (+5 more)

### Community 37 - "knowledge-tree.ts"
Cohesion: 0.11
Nodes (28): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+20 more)

### Community 38 - "agentic-remote"
Cohesion: 0.14
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 39 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 40 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (24): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), parseTerminalUpdateNotice(), terminalChecklistState(), terminalFormCommitKeys() (+16 more)

### Community 41 - "hub-routes.ts"
Cohesion: 0.08
Nodes (26): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+18 more)

### Community 42 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 43 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 44 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 45 - "queued-dispatch.test.ts"
Cohesion: 0.09
Nodes (13): accept(), deferred(), disk, fixtures, holdWrite(), prompt(), releases, target (+5 more)

### Community 46 - "recordValue"
Cohesion: 0.20
Nodes (20): activityDuration(), activityGroupIdFor(), activityKind(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isActivityGroupKind() (+12 more)

### Community 47 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 48 - "session-resource-routes.test.ts"
Cohesion: 0.12
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 49 - "HubEvent"
Cohesion: 0.12
Nodes (12): WorkspaceFixture, ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, sessionMuteSchema (+4 more)

### Community 50 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 52 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 53 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 54 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 55 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 56 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 57 - "NewSessionDialog"
Cohesion: 0.17
Nodes (19): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), ChangeDirectoryDialog() (+11 more)

### Community 58 - "agent-service.test.ts"
Cohesion: 0.12
Nodes (8): terminalFormSteps(), directories, FakeCopilotClient, services, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind, UserInputForm

### Community 59 - "session-resource-clear.test.ts"
Cohesion: 0.15
Nodes (12): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+4 more)

### Community 60 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 61 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 62 - "SessionSkillsSnapshot"
Cohesion: 0.17
Nodes (7): ClaudeResources, releases, session, snapshot, readSessionSkills(), unavailableSkills(), SessionSkillsSnapshot

### Community 63 - "tmux-errors.test.ts"
Cohesion: 0.17
Nodes (12): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+4 more)

### Community 64 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 65 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 66 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 67 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 68 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 69 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 70 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 71 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 73 - "session-resource-transport.ts"
Cohesion: 0.31
Nodes (8): CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 74 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 75 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 76 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 78 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 79 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 80 - "commitSidebarWidth"
Cohesion: 0.29
Nodes (7): commitSidebarWidth(), sidebarResizeEnd(), sidebarResizeKeyDown(), sidebarResizeMove(), clampSidebarWidth(), readStoredSidebarWidth(), writeStored()

### Community 81 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 82 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 84 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

### Community 86 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **559 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+554 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 848 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `tmux-errors.integration.test.ts`, `SessionService`, `SessionDetail`, `ClaudeAgentService`, `transcription-service.ts`, `SessionKnowledgeStore`, `ComputerManager`, `PushNotificationService`, `pwa.ts`, `ProviderSessionService`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `claude-agent-service.ts`, `queueConflict`, `background-task-adapter.ts`, `SessionDetail`, `session-resources.ts`, `terminal-session.ts`, `recordValue`, `SessionFileUpload`, `.dispatchCommand`, `session-resource-routes.test.ts`, `SessionSkillsSnapshot`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `providerFixture()` connect `session-resource-clear.test.ts` to `AgentService`, `SessionService`, `SessionDetail`, `ClaudeAgentService`, `ProviderSessionService`, `computer-manager.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _559 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04406349206349206 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.02692256430761029 - nodes in this community are weakly interconnected._
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
