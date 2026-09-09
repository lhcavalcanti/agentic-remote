# Agentic Remote - Graphify code map

Snapshot: `4167435b0c4b5c733d49beb1754d7d5436c679316d0ceb9acc03e9c9a137bdf6`

Source checkout: `770cdf3b03b04dad894af5628891abe4137d143a`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 202 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 202 files · ~418,209 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3241 nodes · 9056 edges · 127 communities (95 shown, 19 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 659 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- SessionDetail
- App
- api.ts
- App.tsx
- ComputerManager
- claude-agent-service.ts
- ClaudeAgentService
- contracts.ts
- RemoteNodeClient
- queued-dispatch.test.ts
- agentic-remote-promotion-monitor
- session-resource-clear.test.ts
- transcription-service.ts
- session-presentation.ts
- pwa.ts
- terminal-session.test.ts
- app.ts
- agent-service.ts
- registerHubRoutes
- bundle
- ProviderSessionService
- FakeSessionService
- lib.rs
- TmuxTerminalSessionController
- shell.ts
- config.rs
- background-task-adapter.ts
- devDependencies
- workspace-browser.ts
- dependencies
- agentic-remote
- terminal-session.ts
- WorkspaceDialog
- .publicSession
- PushNotificationService
- agentic-remote-promotion-setup
- .handleSessionEvent
- computer-manager-metadata.test.ts
- .sendInternal
- hub-routes.ts
- scripts
- TerminalSessionController
- compilerOptions
- session-knowledge-store.ts
- active-sessions.ts
- capture-workspace.ts
- react
- session-clear-transcript.test.ts
- compilerOptions
- session-store-providers.test.ts
- compilerOptions
- compilerOptions
- directory-browser.ts
- recordValue
- event-log.ts
- use-session-knowledge-root.ts
- knowledgePathChain
- ReaderWorkspace
- workspace-fixtures.ts
- agent-service.test.ts
- recovery-resend-durability.test.ts
- session-reply-durability.test.ts
- session-resource-routes.test.ts
- tmux-errors.test.ts
- capture
- check-workspace-review-regressions.ts
- .configureRuntime
- background-task-stop.test.ts
- SessionKnowledgeStore
- PromptCards.tsx
- executeCommand
- KnowledgeRoot
- desktop.json
- registerSessionKnowledgeRoutes
- capture-workbench-review.ts
- package.json
- .oxlintrc.json
- settings-local.json
- DeferredSession
- session-response-order.ts
- background-task-tracker.ts
- promotion-monitor.test.ts
- scripts
- session-knowledge-routes.ts
- session-resource-transport.ts
- BackgroundTasksDialog.tsx
- session-store-durability.test.ts
- bridge.rs
- setupWorkspaceFixture
- screenshot-stability.test.ts
- KnowledgePosition
- WorkspaceFile
- session-knowledge-store.test.ts
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- removeComputer
- .discoverTerminalSessions
- terminal-send-uncertainty.test.ts
- MermaidDiagram.tsx
- version-policy.test.ts
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
1. `SessionDetail` - 259 edges
2. `App()` - 224 edges
3. `AgentService` - 202 edges
4. `SessionStore` - 139 edges
5. `ClaudeAgentService` - 117 edges
6. `ComputerManager` - 78 edges
7. `SessionService` - 69 edges
8. `RemoteNodeClient` - 64 edges
9. `registerHubRoutes()` - 58 edges
10. `ProviderSessionService` - 53 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (127 total, 19 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.06
Nodes (7): AgentService, isMissingSessionError(), isUncertainDelivery(), removeCopilotSessionFiles(), queueConflict(), TranscriptObservation, hasRunningBackgroundAgent()

### Community 1 - "SessionDetail"
Cohesion: 0.04
Nodes (38): fixture(), connect(), createStore(), fixture(), fixture(), fixture(), fixture(), fixture() (+30 more)

### Community 2 - "App"
Cohesion: 0.04
Nodes (118): deliveryUncertaintyFromError(), activeComposerPastes(), App(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession(), askAboutKnowledgeFile() (+110 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (102): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), cancelBackgroundTask(), cancelSession() (+94 more)

### Community 4 - "App.tsx"
Cohesion: 0.03
Nodes (91): accentIconUrl(), applyAccentIcon(), configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+83 more)

### Community 5 - "ComputerManager"
Cohesion: 0.06
Nodes (16): ComputerManager, managedSession(), RemoteSessionListing, RemoteSessionRead, sessionAtLeastAsNew(), SessionMetadataLookup, RegisteredComputer, ResourceRead (+8 more)

### Community 6 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (59): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+51 more)

### Community 7 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (6): ClaudeAgentService, isMissingClaudeSessionError(), answer(), claudeRequest(), copilotRequest(), RuntimeModelOption

### Community 8 - "contracts.ts"
Cohesion: 0.05
Nodes (34): ClaudeAgentServiceEvents, DirectoryScope, directories, routingFixture(), session(), temporaryDirectory(), ProviderSessionServiceEvents, provider() (+26 more)

### Community 9 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (27): RemoteResync, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, DEFINITE_DISPATCH_REFUSALS, headerSafe(), normalizeNodeUrl(), REDIRECT_STATUSES, RemoteNodeClient (+19 more)

### Community 10 - "queued-dispatch.test.ts"
Cohesion: 0.05
Nodes (35): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+27 more)

### Community 11 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 12 - "session-resource-clear.test.ts"
Cohesion: 0.04
Nodes (53): CopilotClientLike, ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), deferred(), disk (+45 more)

### Community 13 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 14 - "session-presentation.ts"
Cohesion: 0.08
Nodes (42): KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, computers, first, grouped, hidden (+34 more)

### Community 15 - "pwa.ts"
Cohesion: 0.08
Nodes (45): directories, AppVersion, parseAppVersion(), activateSession(), createSession(), deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey() (+37 more)

### Community 16 - "terminal-session.test.ts"
Cohesion: 0.07
Nodes (39): findActiveCopilotSessions(), directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec (+31 more)

### Community 17 - "app.ts"
Cohesion: 0.06
Nodes (36): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), transcriptionComputerName(), FileUploadError (+28 more)

### Community 18 - "agent-service.ts"
Cohesion: 0.05
Nodes (42): AcceptedSdkReply, ActivePrompt, ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime, DeliveryBoundary (+34 more)

### Community 19 - "registerHubRoutes"
Cohesion: 0.07
Nodes (25): ServerRole, ComputerManagerEvents, registerHubRoutes(), SessionMuteCarrier, KnowledgeStore, directories, PushSender, PushState (+17 more)

### Community 20 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 23 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 24 - "TmuxTerminalSessionController"
Cohesion: 0.14
Nodes (10): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), tmuxTargetForPid() (+2 more)

### Community 25 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 26 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 27 - "background-task-adapter.ts"
Cohesion: 0.14
Nodes (34): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), errorValue(), eventTask(), executionModeValue(), isLiveTaskStatus() (+26 more)

### Community 28 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 29 - "workspace-browser.ts"
Cohesion: 0.10
Nodes (27): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+19 more)

### Community 30 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 31 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 32 - "terminal-session.ts"
Cohesion: 0.11
Nodes (32): COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasComposerAfter(), hasLiveTerminalComposer(), isTerminalChrome() (+24 more)

### Community 33 - "WorkspaceDialog"
Cohesion: 0.13
Nodes (29): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+21 more)

### Community 35 - "PushNotificationService"
Cohesion: 0.14
Nodes (8): brief(), HubEventSource, PushNotificationService, registerPushRoutes(), sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 36 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 37 - ".handleSessionEvent"
Cohesion: 0.16
Nodes (25): activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength() (+17 more)

### Community 38 - "computer-manager-metadata.test.ts"
Cohesion: 0.11
Nodes (12): BuildAppOptions, fixture(), managers, releases, remote, session(), ComputerRegistry, RegistryState (+4 more)

### Community 39 - ".sendInternal"
Cohesion: 0.19
Nodes (24): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), hasTerminalCommandPermissionQuestion() (+16 more)

### Community 40 - "hub-routes.ts"
Cohesion: 0.08
Nodes (26): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+18 more)

### Community 41 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 42 - "TerminalSessionController"
Cohesion: 0.09
Nodes (7): holdProbe(), fixtures, gate(), releases, TerminalSessionController, PendingPermission, PendingUserInput

### Community 43 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 44 - "session-knowledge-store.ts"
Cohesion: 0.14
Nodes (13): bindingKey(), bindingSchema, Identity, recoverySchema, RootCatalog, rootSchema, SessionKnowledgeConflictError, SessionKnowledgeEvents (+5 more)

### Community 45 - "active-sessions.ts"
Cohesion: 0.20
Nodes (22): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+14 more)

### Community 46 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 47 - "react"
Cohesion: 0.11
Nodes (10): react, DialogFrame(), DocumentViewControls(), actions, outline, DocumentHeading, MarkdownCodeBlock(), copy() (+2 more)

### Community 48 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 49 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 50 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 51 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 52 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 53 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 54 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 55 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 56 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 57 - "knowledgePathChain"
Cohesion: 0.18
Nodes (17): listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+9 more)

### Community 58 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 59 - "workspace-fixtures.ts"
Cohesion: 0.16
Nodes (14): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureComputers, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureKnowledgeRoots (+6 more)

### Community 60 - "agent-service.test.ts"
Cohesion: 0.15
Nodes (7): terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), UserInputForm

### Community 61 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 62 - "session-reply-durability.test.ts"
Cohesion: 0.20
Nodes (12): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, fixtures (+4 more)

### Community 63 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 64 - "tmux-errors.test.ts"
Cohesion: 0.17
Nodes (12): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+4 more)

### Community 65 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 66 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 67 - ".configureRuntime"
Cohesion: 0.18
Nodes (5): agentMode(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), RuntimeConfigurationError, statusFromEvents()

### Community 68 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 69 - "SessionKnowledgeStore"
Cohesion: 0.24
Nodes (3): SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, SessionKnowledgeStore

### Community 70 - "PromptCards.tsx"
Cohesion: 0.24
Nodes (14): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), UserInputCard(), UserInputFieldControl(), chooseOption(), handleMenuKeyDown() (+6 more)

### Community 71 - "executeCommand"
Cohesion: 0.20
Nodes (15): executeCommand(), listDirectories(), listWorkspace(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog() (+7 more)

### Community 72 - "KnowledgeRoot"
Cohesion: 0.16
Nodes (10): WorkspaceFixtureState, KnowledgeState, KnowledgeRoot, KnowledgeRootChoice, KnowledgeRootChoices(), KnowledgeRootSession, actions, computers (+2 more)

### Community 73 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 74 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 75 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 76 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 77 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 78 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 79 - "DeferredSession"
Cohesion: 0.17
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 80 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 81 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 82 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 83 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 84 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 85 - "session-resource-transport.ts"
Cohesion: 0.27
Nodes (8): CopilotResourceClient, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 86 - "BackgroundTasksDialog.tsx"
Cohesion: 0.29
Nodes (8): BackgroundTask, BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, taskDurationLabel(), taskStatusLabel(), orderTasksForReading()

### Community 87 - "session-store-durability.test.ts"
Cohesion: 0.27
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 88 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 89 - "setupWorkspaceFixture"
Cohesion: 0.25
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 90 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 91 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 93 - "session-knowledge-store.test.ts"
Cohesion: 0.33
Nodes (5): disk, fixture(), fixtures, releases, root()

### Community 94 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 95 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 96 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 97 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 101 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **612 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+607 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 922 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `.publicSession`, `.discoverTerminalSessions`, `.configureRuntime`, `.handleSessionEvent`, `claude-agent-service.ts`, `queued-dispatch.test.ts`, `TerminalSessionController`, `directory-browser.ts`, `ProviderSessionService`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `contracts.ts`, `WorkspaceFile`, `ComputerManager`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `AgentService`, `.publicSession`, `ClaudeAgentService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _612 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.05515587529976019 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.0421998031496063 - nodes in this community are weakly interconnected._
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
- `docs/sdk-architecture-roadmap.md`
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
