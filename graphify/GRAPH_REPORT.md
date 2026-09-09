# Agentic Remote - Graphify code map

Snapshot: `1bd22582a460da4eacd124324961a3229e1a1366e181797fddd737ae0f91209a`

Source checkout: `2d0c448559c2aeef674cfafbbe5d77b62a2af30e`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 211 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 211 files · ~427,415 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3318 nodes · 9179 edges · 150 communities (109 shown, 28 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 661 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- SessionStore
- contracts.ts
- claude-agent-service.ts
- .sendAdmittedWithBackend
- agentic-remote-promotion-monitor
- SessionDetail
- .publish
- background-task-adapter.ts
- submitMessage
- terminal-session.ts
- App.test.tsx
- session-presentation.ts
- tmux-errors.integration.test.ts
- RemoteNodeClient
- TmuxTerminalSessionController
- .get
- session-store.ts
- ComputerManager
- reproduce-ui-findings.tsx
- bundle
- agent-service.ts
- .syncTranscripts
- FakeSessionService
- WorkspaceDialog
- lib.rs
- SessionService
- pwa.ts
- config.rs
- ProviderSessionService
- PushNotificationService
- api.ts
- session-knowledge-routes.test.ts
- app.ts
- devDependencies
- ClaudeAgentService
- dependencies
- agentic-remote
- hub-routes.ts
- agentic-remote-promotion-setup
- terminal-startup-queue.test.ts
- scripts
- shell.ts
- react
- session-resource-providers.test.ts
- session-reply-durability.test.ts
- terminal-session.test.ts
- compilerOptions
- transcription-service.ts
- capture-workspace.ts
- check-workspace-review-regressions.ts
- delegated-transcription-service.ts
- measure-performance.mjs
- node-routes.ts
- knowledge-tree.ts
- compilerOptions
- session-resource-routes.test.ts
- ComputerSummary
- session-store-providers.test.ts
- compilerOptions
- compilerOptions
- directory-browser.ts
- agent-service.test.ts
- NodeIdentityStore
- event-log.ts
- SessionKnowledgeStore
- workspace-browser.ts
- SessionKnowledgeBinding
- .dispatchAdmitted
- api.test.ts
- .publish
- NewSessionDialog
- recovery-resend-durability.test.ts
- capture
- reproduce-provider-findings.mts
- background-task-stop.test.ts
- queued-provider-dispatch.test.ts
- session-knowledge-store.ts
- measure-node-delay.mjs
- desktop.json
- submission-error.ts
- registerSessionKnowledgeRoutes
- capture-workbench-review.ts
- package.json
- workspace-fixtures.ts
- settings-local.json
- .runQuery
- session-resource-clear.test.ts
- TranscriptionError
- BackgroundTasksDialog.tsx
- shell-notifications.ts
- background-task-tracker.ts
- ResourceReads
- promotion-monitor.test.ts
- session-resource-transport.ts
- setupWorkspaceFixture
- scripts
- session-enqueue-clear.test.ts
- session-knowledge-routes.ts
- .oxlintrc.json
- DeferredSession
- session-admission-lifecycle.test.ts
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- remote-node-client.test.ts
- session-clear-transcript.test.ts
- session-knowledge-store.test.ts
- session-store-durability.test.ts
- SessionAdmissions
- settings.ts
- toolActivityContent
- composer-layout.test.ts
- release-publication.test.ts
- session-navigation-view.test.ts
- removeComputer
- reproduce-findings.mjs
- terminal-send-uncertainty.test.ts
- hasRunningBackgroundAgent
- ui-reproduction.config.mts
- version-policy.test.ts
- queued-commands.ts
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
- TerminalDiscoveryError
- StaleQueuedPromptReservationError
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 262 edges
2. `App()` - 225 edges
3. `AgentService` - 204 edges
4. `SessionStore` - 140 edges
5. `ClaudeAgentService` - 119 edges
6. `ComputerManager` - 78 edges
7. `SessionService` - 69 edges
8. `RemoteNodeClient` - 64 edges
9. `registerHubRoutes()` - 58 edges
10. `ManagedSession` - 54 edges

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

## Communities (150 total, 28 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (110): cancelBackgroundTask(), clearConversation(), deleteKnowledgeRoot(), deleteSession(), getPushSettings(), listBackgroundTasks(), listCommands(), listKnowledgeEntries() (+102 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (90): ActivityStatus, accentIconUrl(), applyAccentIcon(), configureRuntime(), getRuntimeOptions(), AccentTheme, accentThemes, activityKindFromMessage() (+82 more)

### Community 2 - "SessionStore"
Cohesion: 0.05
Nodes (27): fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures (+19 more)

### Community 3 - "contracts.ts"
Cohesion: 0.06
Nodes (47): ClaudeAgentServiceEvents, managers, releases, remote, RemoteResync, RemoteSessionRead, RegistryState, DirectoryScope (+39 more)

### Community 4 - "claude-agent-service.ts"
Cohesion: 0.08
Nodes (52): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply, Admission (+44 more)

### Community 5 - ".sendAdmittedWithBackend"
Cohesion: 0.06
Nodes (21): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+13 more)

### Community 6 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 7 - "SessionDetail"
Cohesion: 0.07
Nodes (4): AgentService, fixture(), httpBoundary(), SessionDetail

### Community 8 - ".publish"
Cohesion: 0.07
Nodes (5): agentMode(), CopilotClientLike, isMissingSessionError(), isRuntimeReasoningEffort(), removeCopilotSessionFiles()

### Community 9 - "background-task-adapter.ts"
Cohesion: 0.11
Nodes (53): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+45 more)

### Community 10 - "submitMessage"
Cohesion: 0.08
Nodes (55): activeComposerPastes(), appendComposerForKey(), askAboutKnowledgeFile(), cancelQueuedPromptEdit(), composerBeforeInput(), composerChanged(), composerCut(), composerKeyDown() (+47 more)

### Community 11 - "terminal-session.ts"
Cohesion: 0.12
Nodes (46): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerHoldsText(), composerText(), containsCopiedInteractiveFrame() (+38 more)

### Community 12 - "App.test.tsx"
Cohesion: 0.06
Nodes (36): addKnowledgeRoot(), cancelSession(), getSession(), listComputers(), listKnowledgeRoots(), listSessionListing(), listSessions(), renameSession() (+28 more)

### Community 13 - "session-presentation.ts"
Cohesion: 0.09
Nodes (38): KnowledgeRootChoices(), KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, attentionRank, computerTone(), executionModeName() (+30 more)

### Community 14 - "tmux-errors.integration.test.ts"
Cohesion: 0.09
Nodes (41): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+33 more)

### Community 15 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (6): headerSafe(), RemoteNodeClient, BackgroundTaskSnapshot, NodeInfo, WorkspaceFile, WorkspaceListing

### Community 16 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (13): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), processIsAlive(), safeWindowName(), submitTerminalForm() (+5 more)

### Community 17 - ".get"
Cohesion: 0.13
Nodes (3): isUncertainDelivery(), cloneSession(), deliveryUncertaintyFromError()

### Community 18 - "session-store.ts"
Cohesion: 0.05
Nodes (27): holdProbe(), fixtures, gate(), releases, deferred(), disk, fixtures, holdWrite() (+19 more)

### Community 19 - "ComputerManager"
Cohesion: 0.18
Nodes (6): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedSession, SessionListing

### Community 20 - "reproduce-ui-findings.tsx"
Cohesion: 0.06
Nodes (23): Socket, UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), UserInputCard(), UserInputFieldControl(), chooseOption() (+15 more)

### Community 21 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 22 - "agent-service.ts"
Cohesion: 0.05
Nodes (42): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+34 more)

### Community 23 - ".syncTranscripts"
Cohesion: 0.11
Nodes (22): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isForegroundCompletionEvent() (+14 more)

### Community 24 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 25 - "WorkspaceDialog"
Cohesion: 0.10
Nodes (38): executeCommand(), listWorkspace(), readWorkspaceFile(), searchWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit() (+30 more)

### Community 26 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 27 - "SessionService"
Cohesion: 0.09
Nodes (3): registerNodeRoutes(), isSessionResourceRoute(), SessionService

### Community 28 - "pwa.ts"
Cohesion: 0.10
Nodes (35): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+27 more)

### Community 29 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 31 - "PushNotificationService"
Cohesion: 0.12
Nodes (11): brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, registerPushRoutes(), sessionMuteSchema (+3 more)

### Community 32 - "api.ts"
Cohesion: 0.10
Nodes (32): AddKnowledgeRootInput, ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, PushSettings, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, UpdateSessionKnowledgeRootInput (+24 more)

### Community 33 - "session-knowledge-routes.test.ts"
Cohesion: 0.08
Nodes (20): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, KnowledgeState, KnowledgeStore, directories, disk, FakeManager (+12 more)

### Community 34 - "app.ts"
Cohesion: 0.10
Nodes (21): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), transcriptionComputerName() (+13 more)

### Community 35 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 37 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 38 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 39 - "hub-routes.ts"
Cohesion: 0.07
Nodes (27): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+19 more)

### Community 40 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 41 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (23): findActiveCopilotSessions(), directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec (+15 more)

### Community 42 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 43 - "shell.ts"
Cohesion: 0.15
Nodes (24): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+16 more)

### Community 44 - "react"
Cohesion: 0.09
Nodes (14): plugins, oxc, react, typescript, DocumentViewControls(), actions, outline, DocumentHeading (+6 more)

### Community 45 - "session-resource-providers.test.ts"
Cohesion: 0.11
Nodes (18): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), claudeFixture(), ClaudeMcpRead, copilotFixture() (+10 more)

### Community 46 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (15): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+7 more)

### Community 47 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (22): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse(), pastedPlaceholderCount() (+14 more)

### Community 48 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 49 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 50 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 51 - "check-workspace-review-regressions.ts"
Cohesion: 0.12
Nodes (17): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+9 more)

### Community 52 - "delegated-transcription-service.ts"
Cohesion: 0.14
Nodes (11): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload (+3 more)

### Community 53 - "measure-performance.mjs"
Cohesion: 0.16
Nodes (16): content, eventLogCase(), fixture, fixtureService(), measure(), previousEnvironment, root, rounded() (+8 more)

### Community 54 - "node-routes.ts"
Cohesion: 0.10
Nodes (20): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+12 more)

### Community 55 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 56 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 57 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 58 - "ComputerSummary"
Cohesion: 0.18
Nodes (5): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 59 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 60 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 61 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 62 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 63 - "agent-service.test.ts"
Cohesion: 0.13
Nodes (10): terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), CopilotTaskInfo, CopilotTaskProgress (+2 more)

### Community 64 - "NodeIdentityStore"
Cohesion: 0.17
Nodes (5): BuildAppOptions, ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 65 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 67 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 68 - "SessionKnowledgeBinding"
Cohesion: 0.20
Nodes (13): SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding() (+5 more)

### Community 70 - "api.test.ts"
Cohesion: 0.20
Nodes (15): dispatchQueuedPrompt(), isQueuedDispatchResult(), sendMessage(), failWith(), sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence() (+7 more)

### Community 72 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+8 more)

### Community 73 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 74 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 75 - "reproduce-provider-findings.mts"
Cohesion: 0.19
Nodes (4): claudeFixture(), copilotFixture(), MemoryStore, reports

### Community 76 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 77 - "queued-provider-dispatch.test.ts"
Cohesion: 0.15
Nodes (8): claudeFixture(), copilotSession(), fixtures, gate(), originalQueue, pause(), releases, seed()

### Community 78 - "session-knowledge-store.ts"
Cohesion: 0.14
Nodes (11): bindingSchema, Identity, recoverySchema, RootCatalog, rootSchema, SessionKnowledgeEvents, SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError (+3 more)

### Community 79 - "measure-node-delay.mjs"
Cohesion: 0.15
Nodes (6): FixtureService, node, providers, root, session, sockets

### Community 80 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 81 - "submission-error.ts"
Cohesion: 0.25
Nodes (9): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionError, SubmissionReceipt, submissionReceiptFromError() (+1 more)

### Community 82 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 83 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 84 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 85 - "workspace-fixtures.ts"
Cohesion: 0.17
Nodes (12): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels, runtime (+4 more)

### Community 86 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 88 - "session-resource-clear.test.ts"
Cohesion: 0.21
Nodes (12): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+4 more)

### Community 89 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 90 - "BackgroundTasksDialog.tsx"
Cohesion: 0.26
Nodes (10): BackgroundTask, BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 91 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 92 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 93 - "ResourceReads"
Cohesion: 0.21
Nodes (6): ActiveClaudeQuery, releases, session, snapshot, ResourceReads, resourceRequestHandler()

### Community 94 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 95 - "session-resource-transport.ts"
Cohesion: 0.24
Nodes (9): CopilotResourceClient, CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write() (+1 more)

### Community 96 - "setupWorkspaceFixture"
Cohesion: 0.18
Nodes (8): { chromium }, gitDirectory, require, root, pageFor(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture()

### Community 97 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 98 - "session-enqueue-clear.test.ts"
Cohesion: 0.25
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 99 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 100 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 102 - "session-admission-lifecycle.test.ts"
Cohesion: 0.24
Nodes (7): deferred(), disk, enqueue(), fixture(), fixtures, holdAdmissionWrite(), releases

### Community 103 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 104 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 105 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 106 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 107 - "session-clear-transcript.test.ts"
Cohesion: 0.25
Nodes (5): disk, fixtures, gate(), holdTurnWrite(), releases

### Community 108 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 109 - "session-store-durability.test.ts"
Cohesion: 0.31
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 111 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 112 - "toolActivityContent"
Cohesion: 0.40
Nodes (6): previewText(), readableMcpServerName(), readableToolName(), sameToolLabel(), stripAnsi(), toolActivityContent()

### Community 113 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 114 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 115 - "session-navigation-view.test.ts"
Cohesion: 0.33
Nodes (5): computers, first, grouped, hidden, last

### Community 116 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **631 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+626 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 967 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SessionStore` connect `SessionStore` to `claude-agent-service.ts`, `.sendAdmittedWithBackend`, `SessionDetail`, `.publish`, `.get`, `session-store.ts`, `.syncTranscripts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `contracts.ts`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `SessionDetail` to `SessionStore`, `claude-agent-service.ts`, `.sendAdmittedWithBackend`, `.publish`, `.get`, `session-store.ts`, `.syncTranscripts`, `session-resource-routes.test.ts`, `directory-browser.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _631 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03523238380809595 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.02980074061012167 - nodes in this community are weakly interconnected._
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
- `docs/README.md`
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
- `docs/performance.md`
- `docs/provider-compatibility.md`
- `docs/reviews/2026-09-09/code-and-issues.md`
- `docs/reviews/2026-09-09/node-delay-baseline.json`
- `docs/reviews/2026-09-09/performance-baseline.json`
- `docs/reviews/2026-09-09/performance-repeat.json`
- `docs/reviews/2026-09-09/platform-gap-reproduction.json`
- `docs/reviews/2026-09-09/provider-gap-reproduction.json`
- `docs/reviews/2026-09-09/validation.json`
- `docs/sdk-architecture-roadmap.md`
- `docs/slash-command-feedback.md`
- `docs/specs/functional-requirements.md`
- `docs/specs/machine-setup.md`
- `docs/specs/ui-ux.md`
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
