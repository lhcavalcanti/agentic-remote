# Agentic Remote - Graphify code map

Snapshot: `4f7442a7b488f7536c50ef7db4928a8d879fb00562a3ed2099ebb4b2835f83f2`

Source checkout: `218663027089ad2c3849e3b5677db8d04d9516a8`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 209 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 209 files · ~433,056 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3327 nodes · 9333 edges · 145 communities (109 shown, 23 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 696 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App.tsx
- AgentService
- App.test.tsx
- .readAfterWrites
- claude-agent-service.ts
- contracts.ts
- ClaudeAgentService
- App
- SessionStore
- agentic-remote-promotion-monitor
- sessionKey
- terminal-session.ts
- SessionDetail
- queueConflict
- BackgroundTaskSnapshot
- api.ts
- WorkspaceDialog
- SessionService
- terminal-session.test.ts
- agent-service.ts
- RemoteNodeClient
- TmuxTerminalSessionController
- ProviderSessionService
- FakeSessionService
- bundle
- lib.rs
- shell.ts
- background-task-adapter.ts
- config.rs
- ManagedSession
- pwa.ts
- devDependencies
- dependencies
- agentic-remote
- node-routes.ts
- agentic-remote-promotion-setup
- terminal-startup-queue.test.ts
- tmux-errors.integration.test.ts
- .get
- delegated-transcription-service.ts
- hub-routes.ts
- AgentProvider
- ComputerManager
- scripts
- recordValue
- PushNotificationService
- registerHubRoutes
- transcription-service.ts
- compilerOptions
- session-resource-clear.test.ts
- active-sessions.ts
- app.ts
- capture-workspace.ts
- CopilotSessionLike
- knowledge-tree.ts
- compilerOptions
- SessionKnowledgeBinding
- session-store.ts
- session-store-providers.test.ts
- compilerOptions
- compilerOptions
- recordValue
- session-knowledge-store.ts
- workspace-browser.ts
- session-reply-durability.test.ts
- claude-recovery-admission.test.ts
- directory-browser.ts
- SessionKnowledgeStore
- ReaderWorkspace
- workspace-fixtures.ts
- CopilotClientLike
- session-resource-providers.test.ts
- .requireComputer
- session-knowledge-routes.test.ts
- NewSessionDialog
- recovery-resend-durability.test.ts
- PromptCards.tsx
- capture
- check-workspace-review-regressions.ts
- background-task-stop.test.ts
- queued-dispatch.test.ts
- desktop.json
- BackgroundTasksDialog.tsx
- capture-workbench-review.ts
- package.json
- .oxlintrc.json
- settings-local.json
- background-task-tracker.ts
- push-notification-service.ts
- registerSessionKnowledgeRoutes
- TranscriptionError
- session-response-order.ts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- SessionAdmissions
- scripts
- session-knowledge-routes.ts
- session-store-durability.test.ts
- DeferredSession
- session-enqueue-clear.test.ts
- bridge.rs
- setupWorkspaceFixture
- screenshot-stability.test.ts
- KnowledgePosition
- session-admission-lifecycle.test.ts
- session-clear-transcript.test.ts
- .restore
- deleteKnowledgeRoot
- SessionFileUpload
- agent-service-recovery.test.ts
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- MarkdownCodeBlock.tsx
- .discoverTerminalSessions
- terminal-send-uncertainty.test.ts
- hasRunningBackgroundAgent
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
1. `SessionDetail` - 273 edges
2. `App()` - 227 edges
3. `AgentService` - 213 edges
4. `SessionStore` - 150 edges
5. `ClaudeAgentService` - 118 edges
6. `ComputerManager` - 79 edges
7. `SessionService` - 70 edges
8. `RemoteNodeClient` - 65 edges
9. `registerHubRoutes()` - 59 edges
10. `ProviderSessionService` - 54 edges

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

## Communities (145 total, 23 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.03
Nodes (89): ActivityStatus, accentIconUrl(), applyAccentIcon(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+81 more)

### Community 1 - "AgentService"
Cohesion: 0.05
Nodes (7): agentMode(), AgentService, isForegroundCompletionEvent(), isForegroundLifecycleEvent(), RuntimeConfigurationError, statusFromEvents(), fixture()

### Community 2 - "App.test.tsx"
Cohesion: 0.04
Nodes (71): addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRuntime(), dispatchQueuedPrompt(), getPushSettings(), getRuntimeOptions() (+63 more)

### Community 3 - ".readAfterWrites"
Cohesion: 0.07
Nodes (4): isUncertainDelivery(), httpBoundary(), TerminalSessionController, deliveryUncertaintyFromError()

### Community 4 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (61): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+53 more)

### Community 5 - "contracts.ts"
Cohesion: 0.06
Nodes (46): ComputerManagerEvents, managers, releases, remote, RemoteResync, RemoteSessionRead, RegistryState, DirectoryScope (+38 more)

### Community 6 - "ClaudeAgentService"
Cohesion: 0.06
Nodes (5): ClaudeAgentService, isMissingClaudeSessionError(), copilotRequest(), TranscriptObservation, RuntimeModelOption

### Community 7 - "App"
Cohesion: 0.04
Nodes (70): submissionReceiptFromError(), deleteSession(), listKnowledgeEntries(), readKnowledgeFile(), replyPermission(), App(), appKeyDown(), applyComputerSnapshot() (+62 more)

### Community 8 - "SessionStore"
Cohesion: 0.07
Nodes (26): fixture(), connect(), createStore(), fixture(), recoveryFixture(), fixture(), copilotFixture(), fixture() (+18 more)

### Community 9 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 10 - "sessionKey"
Cohesion: 0.07
Nodes (69): activeComposerPastes(), adoptConversationReplacement(), appendComposerForKey(), applySession(), askAboutKnowledgeFile(), clearSelectedConversation(), composerChanged(), composerPasted() (+61 more)

### Community 11 - "terminal-session.ts"
Cohesion: 0.10
Nodes (54): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText() (+46 more)

### Community 12 - "SessionDetail"
Cohesion: 0.09
Nodes (4): observe(), QueuedPromptReservation, QueuedPrompt, SessionDetail

### Community 13 - "queueConflict"
Cohesion: 0.08
Nodes (23): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), queueConflict() (+15 more)

### Community 14 - "BackgroundTaskSnapshot"
Cohesion: 0.08
Nodes (38): BackgroundTaskSnapshot, KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, attentionRank, computerTone(), executionModeName() (+30 more)

### Community 15 - "api.ts"
Cohesion: 0.08
Nodes (40): RemoteNodeRedirectError, RemoteNodeRequestError, AddKnowledgeRootInput, ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, PushSettings, SessionMcpServerSummary, SessionResourceSource (+32 more)

### Community 16 - "WorkspaceDialog"
Cohesion: 0.08
Nodes (42): executeCommand(), listWorkspace(), readWorkspaceFile(), searchWorkspace(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), browseDirectory(), submit() (+34 more)

### Community 18 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (38): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec, parseTerminalUpdateNotice() (+30 more)

### Community 19 - "agent-service.ts"
Cohesion: 0.05
Nodes (45): AcceptedSdkReply, ActivePrompt, activityResult(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+37 more)

### Community 20 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (10): RemoteNodeClient, client(), servers, session, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing (+2 more)

### Community 21 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (13): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), processIsAlive(), safeWindowName(), submitTerminalForm() (+5 more)

### Community 23 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 24 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 25 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 26 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 27 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (37): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotTaskInfo, CopilotTaskProgress, errorValue(), eventTask() (+29 more)

### Community 28 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 29 - "ManagedSession"
Cohesion: 0.08
Nodes (9): managedSession(), RemoteSessionListing, ManagedSession, SessionListing, computers, first, grouped, hidden (+1 more)

### Community 30 - "pwa.ts"
Cohesion: 0.11
Nodes (33): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+25 more)

### Community 31 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 32 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 33 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 34 - "node-routes.ts"
Cohesion: 0.07
Nodes (28): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+20 more)

### Community 35 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 36 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (26): findActiveCopilotSessions(), appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs (+18 more)

### Community 37 - "tmux-errors.integration.test.ts"
Cohesion: 0.09
Nodes (21): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer(), noTmuxServer() (+13 more)

### Community 39 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (13): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+5 more)

### Community 40 - "hub-routes.ts"
Cohesion: 0.08
Nodes (27): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+19 more)

### Community 41 - "AgentProvider"
Cohesion: 0.09
Nodes (10): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+2 more)

### Community 42 - "ComputerManager"
Cohesion: 0.15
Nodes (8): ComputerManager, fixture(), session(), sessionAtLeastAsNew(), ComputerRegistry, RegisteredComputer, directories, remoteSnapshotFixture()

### Community 43 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 44 - "recordValue"
Cohesion: 0.17
Nodes (23): activityDuration(), activityGroupIdFor(), activityKind(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isActivityGroupKind() (+15 more)

### Community 45 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 46 - "registerHubRoutes"
Cohesion: 0.15
Nodes (9): WorkspaceFixtureState, registerHubRoutes(), SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, fixture(), createHub() (+1 more)

### Community 47 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 48 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 49 - "session-resource-clear.test.ts"
Cohesion: 0.11
Nodes (20): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+12 more)

### Community 50 - "active-sessions.ts"
Cohesion: 0.20
Nodes (22): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+14 more)

### Community 51 - "app.ts"
Cohesion: 0.14
Nodes (14): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), ServerRole (+6 more)

### Community 52 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 53 - "CopilotSessionLike"
Cohesion: 0.12
Nodes (9): CopilotSessionLike, terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), CopilotTasksApi (+1 more)

### Community 54 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 55 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 56 - "SessionKnowledgeBinding"
Cohesion: 0.18
Nodes (14): react, SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey() (+6 more)

### Community 57 - "session-store.ts"
Cohesion: 0.10
Nodes (16): activityDuration(), activityResultPreview(), archivedMessage(), emptyRetirements, PendingChange, PendingMutation, RecoveryResend, RecoverySeed (+8 more)

### Community 58 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 59 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 60 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 61 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 62 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (15): bindingSchema, Identity, recoverySchema, RootCatalog, rootSchema, SessionKnowledgeConflictError, SessionKnowledgeEvents, State (+7 more)

### Community 63 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 64 - "session-reply-durability.test.ts"
Cohesion: 0.18
Nodes (14): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+6 more)

### Community 65 - "claude-recovery-admission.test.ts"
Cohesion: 0.13
Nodes (12): ClaudeSdk, directories, fixture(), queryHandle(), services, waitForIdle(), deferred(), disk (+4 more)

### Community 66 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 68 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 69 - "workspace-fixtures.ts"
Cohesion: 0.16
Nodes (14): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureComputers, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureKnowledgeRoots (+6 more)

### Community 70 - "CopilotClientLike"
Cohesion: 0.12
Nodes (7): CopilotClientLike, fixtures, recoverAndSeed(), releases, boots, [directory, backend, resultPath, phase = 'idle'], fixtureRoot

### Community 71 - "session-resource-providers.test.ts"
Cohesion: 0.19
Nodes (14): cleanupFixtures(), claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills (+6 more)

### Community 72 - ".requireComputer"
Cohesion: 0.16
Nodes (6): FakeManager, ComputerSummary, actions, computers, root, session

### Community 73 - "session-knowledge-routes.test.ts"
Cohesion: 0.17
Nodes (8): SessionMetadataLookup, NodeIdentityStore, disk, fixtures, gate(), holdWrite(), releases, trusted

### Community 74 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+8 more)

### Community 75 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 76 - "PromptCards.tsx"
Cohesion: 0.22
Nodes (15): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), StaleInteractionRecoveryCard(), UserInputCard(), UserInputFieldControl(), chooseOption() (+7 more)

### Community 77 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 78 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 79 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 80 - "queued-dispatch.test.ts"
Cohesion: 0.14
Nodes (8): accept(), deferred(), disk, fixtures, holdWrite(), prompt(), releases, target

### Community 81 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 82 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 83 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 84 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 85 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 86 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 87 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (7): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 88 - "push-notification-service.ts"
Cohesion: 0.15
Nodes (10): brief(), PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 89 - "registerSessionKnowledgeRoutes"
Cohesion: 0.33
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 90 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 91 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 92 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 93 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 94 - "SessionAdmissions"
Cohesion: 0.20
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 95 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 96 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 97 - "session-store-durability.test.ts"
Cohesion: 0.27
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 99 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 100 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 101 - "setupWorkspaceFixture"
Cohesion: 0.25
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 102 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 103 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 104 - "session-admission-lifecycle.test.ts"
Cohesion: 0.25
Nodes (6): deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases

### Community 105 - "session-clear-transcript.test.ts"
Cohesion: 0.25
Nodes (5): disk, fixtures, gate(), holdTurnWrite(), releases

### Community 107 - "deleteKnowledgeRoot"
Cohesion: 0.32
Nodes (8): addComputer(), deleteKnowledgeRoot(), removeComputer(), requestVoid(), removeRoot(), ComputersDialog(), remove(), submit()

### Community 109 - "agent-service-recovery.test.ts"
Cohesion: 0.29
Nodes (4): holdProbe(), fixtures, gate(), releases

### Community 110 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 111 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 112 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 113 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 114 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 119 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **637 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+632 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 958 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ComputerManager` connect `ComputerManager` to `.requireComputer`, `SessionService`, `claude-agent-service.ts`, `ManagedSession`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `AgentProvider`, `SessionFileUpload`, `contracts.ts`, `BackgroundTaskSnapshot`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `.readAfterWrites`, `claude-agent-service.ts`, `contracts.ts`, `.get`, `AgentProvider`, `SessionDetail`, `recordValue`, `queueConflict`, `SessionFileUpload`, `.discoverTerminalSessions`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _637 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.028882093102276588 - nodes in this community are weakly interconnected._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.0547008547008547 - nodes in this community are weakly interconnected._
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
