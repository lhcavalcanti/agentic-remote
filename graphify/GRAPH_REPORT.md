# Agentic Remote - Graphify code map

Snapshot: `6f02ea26076080a6e4bf4fa9e865a36f3c54eadd69a7e6139c2b455d5e7ae5bd`

Source checkout: `0118e8ab86677c6e6f64d97067cca2555ae5a16a`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 193 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 193 files · ~410,484 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3206 nodes · 8932 edges · 137 communities (100 shown, 23 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 652 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- api.ts
- App.tsx
- claude-agent-service.ts
- SessionDetail
- background-task-adapter.ts
- contracts.ts
- agent-service.ts
- ComputerManager
- agentic-remote-promotion-monitor
- AgentService
- RemoteNodeClient
- terminal-session.ts
- .get
- .readAfterWrites
- tmux-errors.integration.test.ts
- ProviderSessionService
- bundle
- FakeSessionService
- TmuxTerminalSessionController
- WorkspaceDialog
- lib.rs
- shell.ts
- pwa.ts
- config.rs
- queued-provider-dispatch.test.ts
- terminal-session.test.ts
- ClaudeAgentService
- SessionService
- devDependencies
- .create
- dependencies
- agentic-remote
- knowledge-tree.ts
- agentic-remote-promotion-setup
- agent-service.test.ts
- terminal-startup-queue.test.ts
- CopilotClientLike
- session-knowledge-routes.test.ts
- hub-routes.ts
- session-presentation.ts
- scripts
- PushNotificationService
- session-reply-durability.test.ts
- session-resource-providers.test.ts
- transcription-service.ts
- compilerOptions
- QueuedDispatches
- delegated-transcription-service.ts
- .publish
- session-resource-clear.test.ts
- NewSessionDialog
- capture-workspace.ts
- .discoverSessions
- node-routes.ts
- session-clear-transcript.test.ts
- session-knowledge-store.ts
- compilerOptions
- session-store-providers.test.ts
- compilerOptions
- check-workspace-review-regressions.ts
- compilerOptions
- TerminalSessionController
- directory-browser.ts
- app.ts
- SessionKnowledgeStore
- workspace-browser.ts
- react
- use-session-knowledge-root.ts
- ReaderWorkspace
- KnowledgeStore
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- SessionResources.tsx
- capture
- file-upload-routes.ts
- workspace-fixtures.ts
- desktop.json
- .clearSerialized
- queued-dispatch.test.ts
- registerSessionKnowledgeRoutes
- shortPath
- capture-workbench-review.ts
- package.json
- settings-local.json
- TranscriptionError
- promotion-monitor.test.ts
- SessionNavigation.test.tsx
- scripts
- push-notification-service.ts
- session-knowledge-routes.ts
- composerHoldsText
- .runQuery
- bridge.rs
- setupWorkspaceFixture
- screenshot-stability.test.ts
- KnowledgePosition
- remote-node-client.test.ts
- UserInputFieldControl
- agent-service-recovery.test.ts
- SubmissionError
- session-knowledge-store.test.ts
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- MarkdownCodeBlock.tsx
- session-navigation-view.test.ts
- removeComputer
- .discoverTerminalSessions
- MermaidDiagram.tsx
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
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 255 edges
2. `App()` - 218 edges
3. `AgentService` - 198 edges
4. `SessionStore` - 136 edges
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

## Communities (137 total, 23 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (115): activeComposerPastes(), App(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession(), askAboutKnowledgeFile(), attachedFiles() (+107 more)

### Community 1 - "api.ts"
Cohesion: 0.04
Nodes (102): parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), deleteKnowledgeRoot(), deleteSession() (+94 more)

### Community 2 - "App.tsx"
Cohesion: 0.03
Nodes (95): accentIconUrl(), applyAccentIcon(), configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+87 more)

### Community 3 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (57): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+49 more)

### Community 4 - "SessionDetail"
Cohesion: 0.06
Nodes (24): channels, directories, observe(), activityDuration(), activityResultPreview(), cloneSession(), emptyRetirements, PendingChange (+16 more)

### Community 5 - "background-task-adapter.ts"
Cohesion: 0.06
Nodes (72): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+64 more)

### Community 6 - "contracts.ts"
Cohesion: 0.06
Nodes (51): ClaudeAgentServiceEvents, fixture(), managers, releases, remote, session(), RemoteSessionListing, RegistryState (+43 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.06
Nodes (69): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+61 more)

### Community 8 - "ComputerManager"
Cohesion: 0.10
Nodes (12): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, FakeManager, AddComputerInput (+4 more)

### Community 9 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 10 - "AgentService"
Cohesion: 0.06
Nodes (4): AgentService, RuntimeConfigurationError, fixture(), httpBoundary()

### Community 11 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (10): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing (+2 more)

### Community 12 - "terminal-session.ts"
Cohesion: 0.10
Nodes (45): composer(), processAdapter, activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame() (+37 more)

### Community 13 - ".get"
Cohesion: 0.11
Nodes (4): agentMode(), isMissingSessionError(), removeCopilotSessionFiles(), TranscriptObservation

### Community 14 - ".readAfterWrites"
Cohesion: 0.11
Nodes (4): isUncertainDelivery(), preparePrompt(), queueConflict(), QueuedPromptReservation

### Community 15 - "tmux-errors.integration.test.ts"
Cohesion: 0.08
Nodes (42): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+34 more)

### Community 17 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 18 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 19 - "TmuxTerminalSessionController"
Cohesion: 0.13
Nodes (12): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), tmuxTargetForPid() (+4 more)

### Community 20 - "WorkspaceDialog"
Cohesion: 0.10
Nodes (33): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+25 more)

### Community 21 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 22 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 23 - "pwa.ts"
Cohesion: 0.10
Nodes (35): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+27 more)

### Community 24 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 25 - "queued-provider-dispatch.test.ts"
Cohesion: 0.08
Nodes (20): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), QueuedDelivery, QueuedDispatchTarget (+12 more)

### Community 26 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (30): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec, parseTerminalUpdateNotice() (+22 more)

### Community 29 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 30 - ".create"
Cohesion: 0.09
Nodes (27): fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures (+19 more)

### Community 31 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 32 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 33 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (29): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown() (+21 more)

### Community 34 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 35 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (11): terminalFormSteps(), configurableModel(), DeferredSession, directories, FakeCopilotClient, services, startupFifoFixture(), CopilotTaskInfo (+3 more)

### Community 36 - "terminal-startup-queue.test.ts"
Cohesion: 0.14
Nodes (25): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+17 more)

### Community 37 - "CopilotClientLike"
Cohesion: 0.09
Nodes (18): CopilotClientLike, deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, disk (+10 more)

### Community 38 - "session-knowledge-routes.test.ts"
Cohesion: 0.10
Nodes (12): ServerRole, SessionMetadataLookup, ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore, disk, fixtures (+4 more)

### Community 39 - "hub-routes.ts"
Cohesion: 0.08
Nodes (27): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+19 more)

### Community 40 - "session-presentation.ts"
Cohesion: 0.16
Nodes (23): SessionFilter, sessionNavigationView, attentionRank, computerTone(), executionModeName(), matchesSessionSearch(), providerName(), recentFirst() (+15 more)

### Community 41 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 42 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 43 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (15): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+7 more)

### Community 44 - "session-resource-providers.test.ts"
Cohesion: 0.11
Nodes (18): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), claudeFixture(), ClaudeMcpRead, copilotFixture() (+10 more)

### Community 45 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 46 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 47 - "QueuedDispatches"
Cohesion: 0.13
Nodes (6): ownsDispatchRecovery(), preflight(), QueuedDispatches, claudeFixture(), seed(), PendingMutation

### Community 48 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (11): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+3 more)

### Community 50 - "session-resource-clear.test.ts"
Cohesion: 0.12
Nodes (19): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+11 more)

### Community 51 - "NewSessionDialog"
Cohesion: 0.15
Nodes (22): activateSession(), createSession(), executeCommand(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory(), AddKnowledgeRootDialog() (+14 more)

### Community 52 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 54 - "node-routes.ts"
Cohesion: 0.10
Nodes (20): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+12 more)

### Community 55 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 56 - "session-knowledge-store.ts"
Cohesion: 0.14
Nodes (15): WorkspaceFixtureState, bindingKey(), bindingSchema, Identity, recoverySchema, RootCatalog, rootSchema, SessionKnowledgeConflictError (+7 more)

### Community 57 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 58 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 59 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 60 - "check-workspace-review-regressions.ts"
Cohesion: 0.13
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 61 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 63 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 64 - "app.ts"
Cohesion: 0.16
Nodes (12): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), transcriptionComputerName() (+4 more)

### Community 66 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 67 - "react"
Cohesion: 0.12
Nodes (14): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+6 more)

### Community 68 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 69 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 70 - "KnowledgeStore"
Cohesion: 0.22
Nodes (5): KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 71 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 72 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 73 - "SessionResources.tsx"
Cohesion: 0.13
Nodes (11): SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, Catalog, CatalogResult, SessionResources(), sourceLabels, statusLabels (+3 more)

### Community 74 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 75 - "file-upload-routes.ts"
Cohesion: 0.20
Nodes (8): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), registerTranscriptionRoutes(), transcriptionMultipartOptions

### Community 76 - "workspace-fixtures.ts"
Cohesion: 0.15
Nodes (13): BACKGROUND_SESSION_ID, documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels (+5 more)

### Community 77 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 79 - "queued-dispatch.test.ts"
Cohesion: 0.15
Nodes (7): deferred(), disk, fixtures, holdWrite(), prompt(), releases, target

### Community 80 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 81 - "shortPath"
Cohesion: 0.19
Nodes (10): KnowledgeRootChoice, KnowledgeRootChoices(), KnowledgeRootSession, actions, computers, root, session, KnowledgeRootSelector() (+2 more)

### Community 82 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 83 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 84 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 85 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 86 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 87 - "SessionNavigation.test.tsx"
Cohesion: 0.17
Nodes (10): SessionSort, actions, backgroundTasks, computers, NavigationHarness(), offline, question, session (+2 more)

### Community 88 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 90 - "push-notification-service.ts"
Cohesion: 0.18
Nodes (8): brief(), PushSender, PushState, directories, sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 91 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 92 - "composerHoldsText"
Cohesion: 0.33
Nodes (11): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse() (+3 more)

### Community 94 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 95 - "setupWorkspaceFixture"
Cohesion: 0.25
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 96 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 97 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 98 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 99 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 100 - "agent-service-recovery.test.ts"
Cohesion: 0.29
Nodes (4): holdProbe(), fixtures, gate(), releases

### Community 101 - "SubmissionError"
Cohesion: 0.48
Nodes (3): RemoteNodeRequestError, SubmissionError, SubmissionReceipt

### Community 102 - "session-knowledge-store.test.ts"
Cohesion: 0.33
Nodes (5): disk, fixture(), fixtures, releases, root()

### Community 103 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 104 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 105 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 106 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 107 - "session-navigation-view.test.ts"
Cohesion: 0.33
Nodes (5): computers, first, grouped, hidden, last

### Community 108 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 111 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **604 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+599 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 914 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `claude-agent-service.ts`, `SessionDetail`, `agent-service.ts`, `.get`, `.readAfterWrites`, `QueuedDispatches`, `.discoverTerminalSessions`, `ProviderSessionService`, `.discoverSessions`, `.acknowledgeFailedPrompt`, `TerminalSessionController`, `directory-browser.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `ComputerManager`, `claude-agent-service.ts`, `contracts.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `ClaudeAgentService` connect `ClaudeAgentService` to `claude-agent-service.ts`, `SessionDetail`, `session-reply-durability.test.ts`, `session-resource-providers.test.ts`, `.clearSerialized`, `.readAfterWrites`, `QueuedDispatches`, `.publish`, `SessionService`, `.runQuery`, `directory-browser.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _604 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04393939393939394 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03703176185728529 - nodes in this community are weakly interconnected._
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
