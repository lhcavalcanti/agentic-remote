# Agentic Remote - Graphify code map

Snapshot: `abb9ad99800b8f405276e20344310601a81ebe4d71d3e2362fffc8756669cf51`

Source checkout: `b88daaa1040fb349cc0de75be2027b4ed8c3936c`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 205 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 205 files · ~427,323 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3267 nodes · 9163 edges · 130 communities (100 shown, 17 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 664 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App.tsx
- App
- background-task-adapter.ts
- SessionDetail
- App.test.tsx
- claude-agent-service.ts
- ClaudeAgentService
- .publish
- session-presentation.ts
- agent-service.ts
- AgentService
- agentic-remote-promotion-monitor
- RemoteNodeClient
- contracts.ts
- queueConflict
- .get
- tmux-errors.integration.test.ts
- api.ts
- WorkspaceDialog
- bundle
- FakeSessionService
- ComputerManager
- ProviderSessionService
- lib.rs
- terminal-session.ts
- TmuxTerminalSessionController
- shell.ts
- config.rs
- pwa.ts
- devDependencies
- SessionService
- dependencies
- agentic-remote
- hub-routes.ts
- session-knowledge-routes.test.ts
- terminal-startup-queue.test.ts
- knowledge-tree.ts
- agentic-remote-promotion-setup
- CopilotSessionLike
- .sendInternal
- scripts
- PushNotificationService
- transcription-service.ts
- compilerOptions
- ComputerSummary
- terminal-session.test.ts
- directory-browser.ts
- delegated-transcription-service.ts
- node-routes.ts
- capture-workspace.ts
- app.ts
- session-clear-transcript.test.ts
- session-store-providers.test.ts
- compilerOptions
- .discoverSessions
- session-resource-routes.test.ts
- session-store.ts
- SessionKnowledgeBinding
- PromptCards.tsx
- compilerOptions
- check-workspace-review-regressions.ts
- compilerOptions
- event-log.ts
- SessionKnowledgeStore
- workspace-browser.ts
- NodeIdentityStore
- session-reply-durability.test.ts
- recovery-resend-durability.test.ts
- ReaderWorkspace
- claude-recovery-admission.test.ts
- NewSessionDialog
- file-upload-routes.ts
- queued-dispatch.test.ts
- session-knowledge-store.ts
- workspace-fixtures.ts
- desktop.json
- CopilotClientLike
- session-resource-providers.test.ts
- capture-workbench-review.ts
- package.json
- settings-local.json
- registerSessionKnowledgeRoutes
- session-resource-clear.test.ts
- TranscriptionError
- promotion-monitor.test.ts
- scripts
- push-notification-service.ts
- session-knowledge-routes.ts
- .oxlintrc.json
- session-store-durability.test.ts
- session-enqueue-clear.test.ts
- bridge.rs
- setupWorkspaceFixture
- screenshot-stability.test.ts
- KnowledgePosition
- session-admission-lifecycle.test.ts
- session-knowledge-store.test.ts
- session-resource-transport.ts
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- MarkdownCodeBlock.tsx
- removeComputer
- SessionActions.tsx
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
1. `SessionDetail` - 262 edges
2. `App()` - 224 edges
3. `AgentService` - 206 edges
4. `SessionStore` - 139 edges
5. `ClaudeAgentService` - 117 edges
6. `ComputerManager` - 78 edges
7. `SessionService` - 69 edges
8. `RemoteNodeClient` - 64 edges
9. `registerHubRoutes()` - 58 edges
10. `TmuxTerminalSessionController` - 55 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `CreationRuntime` --references--> `RuntimeReasoningEffort`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (130 total, 17 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.03
Nodes (111): ActivityStatus, accentIconUrl(), applyAccentIcon(), configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage() (+103 more)

### Community 1 - "App"
Cohesion: 0.04
Nodes (121): deleteKnowledgeRoot(), replyPermission(), restartSession(), activeComposerPastes(), App(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot() (+113 more)

### Community 2 - "background-task-adapter.ts"
Cohesion: 0.05
Nodes (84): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), CopilotTaskInfo (+76 more)

### Community 3 - "SessionDetail"
Cohesion: 0.06
Nodes (22): fixture(), connect(), createStore(), fixture(), fixture(), fixture(), fixture(), fixture() (+14 more)

### Community 4 - "App.test.tsx"
Cohesion: 0.04
Nodes (74): addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), getProviderRuntimeOptions(), getPushSettings(), getRuntimeOptions(), getSession() (+66 more)

### Community 5 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (62): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+54 more)

### Community 6 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (6): ClaudeAgentService, isMissingClaudeSessionError(), answer(), claudeRequest(), copilotRequest(), RuntimeModelOption

### Community 7 - ".publish"
Cohesion: 0.06
Nodes (8): agentMode(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isMissingSessionError(), removeCopilotSessionFiles(), statusFromEvents(), TranscriptObservation, TerminalSessionController

### Community 8 - "session-presentation.ts"
Cohesion: 0.05
Nodes (62): plugins, oxc, react, typescript, SessionResourcesDialog(), KnowledgeRootChoice, KnowledgeRootChoices(), KnowledgeRootSession (+54 more)

### Community 9 - "agent-service.ts"
Cohesion: 0.05
Nodes (67): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+59 more)

### Community 10 - "AgentService"
Cohesion: 0.07
Nodes (6): AgentService, persistedFormAnswer(), RuntimeConfigurationError, httpBoundary(), TerminalFormReplyError, SessionStatus

### Community 11 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 12 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (13): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, client(), servers, session, NodeInfo (+5 more)

### Community 13 - "contracts.ts"
Cohesion: 0.09
Nodes (41): managers, releases, remote, RegistryState, directories, StoredNodeIdentity, ProviderSessionServiceEvents, DEFINITE_DISPATCH_REFUSALS (+33 more)

### Community 14 - "queueConflict"
Cohesion: 0.08
Nodes (23): acceptanceReceipt(), errorMessage(), ownsDispatchRecovery(), preflight(), preparePrompt(), queueConflict(), QueuedDelivery, QueuedDispatches (+15 more)

### Community 15 - ".get"
Cohesion: 0.10
Nodes (5): isUncertainDelivery(), explicitlyRefused(), hasUncertainDelivery(), terminalRefused(), deliveryUncertaintyFromError()

### Community 16 - "tmux-errors.integration.test.ts"
Cohesion: 0.08
Nodes (42): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+34 more)

### Community 17 - "api.ts"
Cohesion: 0.08
Nodes (41): TerminalFormContinuation, RemoteNodeRedirectError, RemoteNodeRequestError, AddKnowledgeRootInput, ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, PushSettings, SessionMcpServerSummary (+33 more)

### Community 18 - "WorkspaceDialog"
Cohesion: 0.08
Nodes (40): executeCommand(), listWorkspace(), searchWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+32 more)

### Community 19 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 20 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 21 - "ComputerManager"
Cohesion: 0.19
Nodes (6): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedSession, SessionListing

### Community 23 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 24 - "terminal-session.ts"
Cohesion: 0.09
Nodes (36): composer(), processAdapter, COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), FormViewport (+28 more)

### Community 25 - "TmuxTerminalSessionController"
Cohesion: 0.14
Nodes (9): copilotCommand(), execFileAsync, processAncestors(), processCommand(), submitTerminalForm(), tmuxTargetForPid(), TmuxTerminalSessionController, PendingPermission (+1 more)

### Community 26 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 27 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 28 - "pwa.ts"
Cohesion: 0.11
Nodes (34): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+26 more)

### Community 29 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 31 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 32 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 33 - "hub-routes.ts"
Cohesion: 0.07
Nodes (27): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+19 more)

### Community 34 - "session-knowledge-routes.test.ts"
Cohesion: 0.10
Nodes (16): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, KnowledgeState, KnowledgeStore, directories, disk, FakeManager (+8 more)

### Community 35 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (24): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), directories (+16 more)

### Community 36 - "knowledge-tree.ts"
Cohesion: 0.11
Nodes (28): WorkspaceEntry, listKnowledgeEntries(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+20 more)

### Community 37 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 38 - "CopilotSessionLike"
Cohesion: 0.08
Nodes (10): CopilotSessionLike, terminalFormSteps(), configurableModel(), DeferredSession, directories, FakeCopilotClient, services, startupFifoFixture() (+2 more)

### Community 39 - ".sendInternal"
Cohesion: 0.21
Nodes (22): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), hasTerminalCommandPermissionQuestion() (+14 more)

### Community 40 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 41 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 42 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 43 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 44 - "ComputerSummary"
Cohesion: 0.15
Nodes (5): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 45 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (19): listTmuxSessions(), parseTerminalUpdateNotice(), safeWindowName(), terminalChecklistState(), terminalFormCommitKeys(), bracketedTabPane, clearFixture(), desktopInstallPane (+11 more)

### Community 46 - "directory-browser.ts"
Cohesion: 0.19
Nodes (12): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+4 more)

### Community 47 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (11): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+3 more)

### Community 48 - "node-routes.ts"
Cohesion: 0.09
Nodes (21): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+13 more)

### Community 49 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 50 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), transcriptionComputerName() (+5 more)

### Community 51 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 52 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 53 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 55 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 56 - "session-store.ts"
Cohesion: 0.10
Nodes (17): PendingTerminalQueueSettlement, activityDuration(), activityResultPreview(), DiscoveredSession, emptyRetirements, PendingChange, RecoveryResend, safeUploadName() (+9 more)

### Community 57 - "SessionKnowledgeBinding"
Cohesion: 0.18
Nodes (14): SessionKnowledgeEvents, SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey() (+6 more)

### Community 58 - "PromptCards.tsx"
Cohesion: 0.17
Nodes (18): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), question, request, UserInputCard() (+10 more)

### Community 59 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 60 - "check-workspace-review-regressions.ts"
Cohesion: 0.13
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 61 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 62 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 63 - "SessionKnowledgeStore"
Cohesion: 0.22
Nodes (4): bindingKey(), RootCatalog, SessionKnowledgeStore, stateSchema

### Community 64 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 65 - "NodeIdentityStore"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 66 - "session-reply-durability.test.ts"
Cohesion: 0.18
Nodes (14): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, fallbackFormFixture() (+6 more)

### Community 67 - "recovery-resend-durability.test.ts"
Cohesion: 0.14
Nodes (13): directories, disk, fixture(), gate(), gates, initialize(), PublicSessionValue, runtimes (+5 more)

### Community 68 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 69 - "claude-recovery-admission.test.ts"
Cohesion: 0.14
Nodes (11): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), deferred(), disk, enqueue() (+3 more)

### Community 70 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+8 more)

### Community 71 - "file-upload-routes.ts"
Cohesion: 0.20
Nodes (8): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), registerTranscriptionRoutes(), transcriptionMultipartOptions

### Community 72 - "queued-dispatch.test.ts"
Cohesion: 0.14
Nodes (8): accept(), deferred(), disk, fixtures, holdWrite(), prompt(), releases, target

### Community 73 - "session-knowledge-store.ts"
Cohesion: 0.16
Nodes (8): bindingSchema, Identity, recoverySchema, rootSchema, SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, State, StoredBinding

### Community 74 - "workspace-fixtures.ts"
Cohesion: 0.15
Nodes (13): BACKGROUND_SESSION_ID, documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels (+5 more)

### Community 75 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 76 - "CopilotClientLike"
Cohesion: 0.14
Nodes (6): CopilotClientLike, holdProbe(), fixtures, gate(), releases, CopilotResourceClient

### Community 77 - "session-resource-providers.test.ts"
Cohesion: 0.20
Nodes (13): claudeFixture(), ClaudeMcpRead, deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures, Mcp (+5 more)

### Community 78 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 79 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 80 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 81 - "registerSessionKnowledgeRoutes"
Cohesion: 0.33
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 82 - "session-resource-clear.test.ts"
Cohesion: 0.21
Nodes (12): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+4 more)

### Community 83 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 84 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 85 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 86 - "push-notification-service.ts"
Cohesion: 0.18
Nodes (8): brief(), PushSender, PushState, directories, sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 87 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 88 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 89 - "session-store-durability.test.ts"
Cohesion: 0.27
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 90 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 91 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 92 - "setupWorkspaceFixture"
Cohesion: 0.25
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 93 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 94 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 95 - "session-admission-lifecycle.test.ts"
Cohesion: 0.25
Nodes (6): deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases

### Community 96 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 97 - "session-resource-transport.ts"
Cohesion: 0.36
Nodes (7): readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 98 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 99 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 100 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 101 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 102 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **616 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+611 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 927 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `claude-agent-service.ts`, `directory-browser.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `claude-agent-service.ts`, `RemoteNodeClient`, `ComputerSummary`, `directory-browser.ts`, `ProviderSessionService`, `session-resource-routes.test.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `ClaudeAgentService`, `.publish`, `AgentService`, `queueConflict`, `.get`, `.discoverSessions`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _616 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.025314922480620155 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04174478190226222 - nodes in this community are weakly interconnected._
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
