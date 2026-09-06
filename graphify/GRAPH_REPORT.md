# Agentic Remote - Graphify code map

Snapshot: `1bcbdd2c13eade014a3c1401ec439d13920ac92a37c8d9239cd230e63bcb97c2`

Source checkout: `c310964c3416310a282cbbd772ab9df433040460`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 161 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 161 files · ~311,730 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2698 nodes · 7111 edges · 111 communities (81 shown, 17 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 482 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- api.ts
- App.tsx
- AgentService
- contracts.ts
- SessionDetail
- ClaudeAgentService
- ComputerManager
- agentic-remote-promotion-monitor
- RemoteNodeClient
- session-presentation.ts
- background-task-adapter.ts
- react
- bundle
- TmuxTerminalSessionController
- terminal-session.ts
- session-knowledge-routes.test.ts
- pwa.ts
- WorkspaceDialog
- lib.rs
- agent-service.ts
- ProviderSessionService
- shell.ts
- SessionService
- config.rs
- devDependencies
- .dispatchCommand
- dependencies
- computer-manager-metadata.test.ts
- node-routes.ts
- FakeSessionService
- agentic-remote
- agentic-remote-promotion-setup
- terminal-session.test.ts
- hub-routes.ts
- scripts
- PushNotificationService
- app.ts
- compilerOptions
- active-sessions.ts
- transcription-service.ts
- .replyUserInput
- queued-dispatch.ts
- queued-provider-dispatch.test.ts
- tmux-errors.integration.test.ts
- capture-workbench-review.ts
- capture-workspace.ts
- NewSessionDialog
- queued-dispatch.test.ts
- CopilotSessionLike
- workspace-browser.ts
- compilerOptions
- recordValue
- agent-service.test.ts
- compilerOptions
- compilerOptions
- event-log.ts
- session-store-providers.test.ts
- delegated-transcription-service.ts
- knowledge-tree.ts
- workspace-fixtures.ts
- directory-browser.ts
- capture
- desktop.json
- SessionKnowledgeStore
- package.json
- settings-local.json
- BackgroundTaskSnapshot
- registerSessionKnowledgeRoutes
- session-knowledge-store.ts
- TranscriptionError
- promotion-monitor.test.ts
- SessionKnowledgeBinding
- scripts
- push-notification-service.ts
- session-knowledge-routes.ts
- composerTookPaste
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- session-knowledge-store.test.ts
- SessionFileUpload
- UserInputFieldControl
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
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
1. `SessionDetail` - 207 edges
2. `App()` - 204 edges
3. `AgentService` - 133 edges
4. `ClaudeAgentService` - 89 edges
5. `SessionStore` - 85 edges
6. `ComputerManager` - 75 edges
7. `RemoteNodeClient` - 59 edges
8. `SessionService` - 59 edges
9. `registerHubRoutes()` - 54 edges
10. `ManagedSession` - 48 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts
- `SessionKnowledgeEvents` --references--> `SessionKnowledgeBinding`  [EXTRACTED]
  server/session-knowledge-store.ts → shared/contracts.ts
- `WorkspaceFixtureState` --references--> `ManagedSession`  [EXTRACTED]
  e2e/workspace-fixtures.ts → shared/contracts.ts
- `WorkspaceFixtureState` --references--> `SessionKnowledgeBinding`  [EXTRACTED]
  e2e/workspace-fixtures.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (111 total, 17 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (126): clearConversation(), listKnowledgeEntries(), readKnowledgeFile(), reorderQueuedPrompts(), restartSession(), transcribeAudio(), updateQueuedPrompt(), uploadSessionFile() (+118 more)

### Community 1 - "api.ts"
Cohesion: 0.04
Nodes (84): addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), configureRuntime(), deleteKnowledgeRoot(), deleteSession(), dispatchQueuedPrompt(), getProviderRuntimeOptions() (+76 more)

### Community 2 - "App.tsx"
Cohesion: 0.03
Nodes (85): accentIconUrl(), applyAccentIcon(), addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage() (+77 more)

### Community 3 - "AgentService"
Cohesion: 0.06
Nodes (3): AgentService, isMissingSessionError(), removeCopilotSessionFiles()

### Community 4 - "contracts.ts"
Cohesion: 0.05
Nodes (58): AgentServiceEvents, CreationRuntime, ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError() (+50 more)

### Community 5 - "SessionDetail"
Cohesion: 0.06
Nodes (26): fixture(), activityDuration(), activityResultPreview(), cloneSession(), DiscoveredSession, disk, fixture(), fixtures (+18 more)

### Community 6 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (5): ClaudeAgentService, isMissingClaudeSessionError(), preparePrompt(), queueConflict(), RuntimeModelOption

### Community 7 - "ComputerManager"
Cohesion: 0.12
Nodes (10): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), AddComputerInput, ComputerSummary, ManagedRemovedQueuedPrompt (+2 more)

### Community 8 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (55): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+47 more)

### Community 9 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (11): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, RemoteNodeRequestError, client(), servers, session (+3 more)

### Community 10 - "session-presentation.ts"
Cohesion: 0.08
Nodes (41): KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, computers, first, grouped, hidden (+33 more)

### Community 11 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (44): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+36 more)

### Community 12 - "react"
Cohesion: 0.05
Nodes (27): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+19 more)

### Community 13 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 14 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (14): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), terminalChecklistState() (+6 more)

### Community 15 - "terminal-session.ts"
Cohesion: 0.13
Nodes (39): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), findTerminalWrappedText(), hasComposerAfter() (+31 more)

### Community 16 - "session-knowledge-routes.test.ts"
Cohesion: 0.07
Nodes (21): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, disk (+13 more)

### Community 17 - "pwa.ts"
Cohesion: 0.10
Nodes (35): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart() (+27 more)

### Community 18 - "WorkspaceDialog"
Cohesion: 0.10
Nodes (33): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+25 more)

### Community 19 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 20 - "agent-service.ts"
Cohesion: 0.06
Nodes (38): ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, ansiSequence, commandShortcut(), ElicitationContext, ElicitationHandler (+30 more)

### Community 22 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 24 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 25 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 26 - ".dispatchCommand"
Cohesion: 0.13
Nodes (3): QueuedDelivery, isTerminalAgentWorking(), TerminalSessionController

### Community 27 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 28 - "computer-manager-metadata.test.ts"
Cohesion: 0.10
Nodes (13): fixture(), managers, releases, remote, session(), ComputerRegistry, directories, remoteSnapshotFixture() (+5 more)

### Community 29 - "node-routes.ts"
Cohesion: 0.08
Nodes (26): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+18 more)

### Community 31 - "agentic-remote"
Cohesion: 0.14
Nodes (27): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+19 more)

### Community 32 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 33 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (22): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), parseTerminalUpdateNotice(), bracketedTabPane, deliveryFixture() (+14 more)

### Community 34 - "hub-routes.ts"
Cohesion: 0.08
Nodes (26): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+18 more)

### Community 35 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 36 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 37 - "app.ts"
Cohesion: 0.13
Nodes (14): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), DelegatedTranscriptionOptions (+6 more)

### Community 38 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 39 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 40 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 41 - ".replyUserInput"
Cohesion: 0.10
Nodes (5): agentMode(), persistedFormAnswer(), RuntimeConfigurationError, statusFromEvents(), validateUserInputForm()

### Community 42 - "queued-dispatch.ts"
Cohesion: 0.16
Nodes (11): errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDispatches, QueuedDispatchTarget, terminalRefused() (+3 more)

### Community 43 - "queued-provider-dispatch.test.ts"
Cohesion: 0.11
Nodes (14): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), claudeFixture(), copilotFixture(), copilotSession() (+6 more)

### Community 44 - "tmux-errors.integration.test.ts"
Cohesion: 0.13
Nodes (18): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), noTmuxServer(), processGone() (+10 more)

### Community 45 - "capture-workbench-review.ts"
Cohesion: 0.11
Nodes (17): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, createWorkspaceFixtureState() (+9 more)

### Community 46 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 47 - "NewSessionDialog"
Cohesion: 0.15
Nodes (22): activateSession(), createSession(), executeCommand(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory(), AddKnowledgeRootDialog() (+14 more)

### Community 48 - "queued-dispatch.test.ts"
Cohesion: 0.10
Nodes (9): CopilotClientLike, accept(), deferred(), disk, fixtures, holdWrite(), prompt(), releases (+1 more)

### Community 49 - "CopilotSessionLike"
Cohesion: 0.13
Nodes (7): CopilotSessionLike, FakeCopilotClient, CopilotTasksApi, acceptanceReceipt(), queuedSdkPrompt(), disposals, fixture()

### Community 50 - "workspace-browser.ts"
Cohesion: 0.19
Nodes (17): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+9 more)

### Community 51 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 52 - "recordValue"
Cohesion: 0.25
Nodes (17): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+9 more)

### Community 53 - "agent-service.test.ts"
Cohesion: 0.12
Nodes (8): terminalFormSteps(), DeferredSession, directories, services, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind, UserInputForm

### Community 54 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 55 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 56 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 57 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (8): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession()

### Community 58 - "delegated-transcription-service.ts"
Cohesion: 0.16
Nodes (9): collect(), DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload, MAX_AUDIO_BYTES (+1 more)

### Community 59 - "knowledge-tree.ts"
Cohesion: 0.20
Nodes (15): knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs(), KnowledgeFolders (+7 more)

### Community 60 - "workspace-fixtures.ts"
Cohesion: 0.12
Nodes (16): CONTEXT_EXAMPLE, documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeFiles, fixtureKnowledgeListings, fixtureKnowledgePositions (+8 more)

### Community 61 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 62 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 63 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 65 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 66 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 67 - "BackgroundTaskSnapshot"
Cohesion: 0.29
Nodes (7): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskSnapshot

### Community 68 - "registerSessionKnowledgeRoutes"
Cohesion: 0.33
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 69 - "session-knowledge-store.ts"
Cohesion: 0.15
Nodes (11): bindingSchema, Identity, recoverySchema, RootCatalog, rootSchema, SessionKnowledgeEvents, SessionKnowledgePersistenceError, State (+3 more)

### Community 70 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 71 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 72 - "SessionKnowledgeBinding"
Cohesion: 0.32
Nodes (3): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeBinding

### Community 73 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 74 - "push-notification-service.ts"
Cohesion: 0.18
Nodes (8): brief(), PushSender, PushState, directories, sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 75 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 76 - "composerTookPaste"
Cohesion: 0.33
Nodes (11): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse() (+3 more)

### Community 77 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 78 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 79 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 80 - "session-knowledge-store.test.ts"
Cohesion: 0.29
Nodes (5): disk, fixture(), fixtures, releases, root()

### Community 82 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 83 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 84 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 86 - "release-publication.test.ts"
Cohesion: 0.67
Nodes (3): directories, exec, publicationFixture()

## Knowledge Gaps
- **512 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+507 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 780 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `SessionFileUpload`, `contracts.ts`, `ComputerManager`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `SessionFileUpload`, `.dispatchCommand`, `AgentService`, `ClaudeAgentService`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionKnowledgeStore` connect `SessionKnowledgeStore` to `SessionKnowledgeBinding`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _512 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03722842043452731 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.039194139194139194 - nodes in this community are weakly interconnected._
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
