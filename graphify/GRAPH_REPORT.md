# Agentic Remote - Graphify code map

Snapshot: `b292919758e7fe67c34d7d9b376920c655e5988ab4a27d3dee6df27b01088814`

Source checkout: `5643e0ed972078cd045e98e3fdcb5afc2ef653a1`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 202 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 202 files · ~417,281 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3238 nodes · 9039 edges · 137 communities (98 shown, 25 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 656 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- api.ts
- SessionDetail
- ComputerManager
- agent-service.ts
- agentic-remote-promotion-monitor
- background-task-adapter.ts
- transcription-service.ts
- session-presentation.ts
- multi-node.test.ts
- app.ts
- .publish
- AgentService
- .get
- TerminalSessionController
- terminal-session.test.ts
- RemoteNodeClient
- bundle
- pwa.ts
- TmuxTerminalSessionController
- lib.rs
- active-sessions.ts
- computer-manager.ts
- shell.ts
- config.rs
- contracts.ts
- session-store.ts
- ProviderSessionService
- devDependencies
- agent-service.test.ts
- terminal-session.ts
- queued-provider-dispatch.test.ts
- ClaudeAgentService
- session-resources.ts
- FakeSessionService
- dependencies
- agentic-remote
- claude-agent-service.ts
- WorkspaceDialog
- registerNodeRoutes
- knowledge-tree.ts
- agentic-remote-promotion-setup
- .sendInternal
- session-resource-clear.test.ts
- computer-manager-metadata.test.ts
- hub-routes.ts
- SessionResources.tsx
- scripts
- session-resource-providers.test.ts
- compilerOptions
- session-reply-durability.test.ts
- PushNotificationService
- session-knowledge-store.ts
- capture-workspace.ts
- BackgroundTasksDialog.tsx
- session-clear-transcript.test.ts
- NewSessionDialog
- compilerOptions
- compilerOptions
- compilerOptions
- directory-browser.ts
- .publish
- event-log.ts
- session-store-providers.test.ts
- session-admission-lifecycle.test.ts
- HubEvent
- workspace-browser.ts
- ReaderWorkspace
- workspace-fixtures.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- check-workspace-review-regressions.ts
- .dispatchAdmitted
- session-knowledge-store.test.ts
- desktop.json
- ResourceReads
- RuntimeModelOption
- queued-dispatch.test.ts
- capture-workbench-review.ts
- package.json
- .oxlintrc.json
- settings-local.json
- QueuedDispatches
- registerSessionKnowledgeRoutes
- promotion-monitor.test.ts
- scripts
- submission-error.ts
- session-knowledge-routes.ts
- KnowledgeRoot
- session-enqueue-clear.test.ts
- SessionKnowledgeStore
- session-resource-transport.ts
- bridge.rs
- setupWorkspaceFixture
- screenshot-stability.test.ts
- KnowledgePosition
- BackgroundTaskSnapshot
- DocumentViewControls.tsx
- UserInputFieldControl
- WorkspaceListing
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- MarkdownCodeBlock.tsx
- removeComputer
- .discoverTerminalSessions
- MockMediaRecorder
- MermaidDiagram.tsx
- version-policy.test.ts
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
1. `SessionDetail` - 259 edges
2. `App()` - 224 edges
3. `AgentService` - 199 edges
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

## Communities (137 total, 25 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (136): submissionReceiptFromError(), deleteKnowledgeRoot(), moveSessionToTmux(), replyPermission(), replyUserInput(), restartSession(), setSessionNotificationsMuted(), activeComposerPastes() (+128 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (107): react, accentIconUrl(), applyAccentIcon(), configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage() (+99 more)

### Community 2 - "api.ts"
Cohesion: 0.04
Nodes (89): parseSubmissionReceipt(), addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), deleteSession(), dispatchQueuedPrompt(), getProviderRuntimeOptions() (+81 more)

### Community 3 - "SessionDetail"
Cohesion: 0.06
Nodes (27): fixture(), connect(), createStore(), fixture(), fixture(), claudeFixture(), copilotFixture(), seed() (+19 more)

### Community 4 - "ComputerManager"
Cohesion: 0.08
Nodes (7): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, SessionService, ComputerSummary, ManagedRemovedQueuedPrompt

### Community 5 - "agent-service.ts"
Cohesion: 0.06
Nodes (64): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+56 more)

### Community 6 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 7 - "background-task-adapter.ts"
Cohesion: 0.08
Nodes (63): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+55 more)

### Community 8 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 9 - "session-presentation.ts"
Cohesion: 0.07
Nodes (45): KnowledgeRootChoice, KnowledgeRootChoices(), KnowledgeRootSession, KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, computers (+37 more)

### Community 10 - "multi-node.test.ts"
Cohesion: 0.07
Nodes (17): DirectoryScope, directories, routingFixture(), session(), temporaryDirectory(), ProviderSessionServiceEvents, provider(), RemoteNodeClientEvents (+9 more)

### Community 11 - "app.ts"
Cohesion: 0.07
Nodes (29): buildApp(), errorStatusCode(), ServerRole, transcriptionComputerName(), registerFileUploadRoutes(), registerHubRoutes(), SessionMuteCarrier, port (+21 more)

### Community 12 - ".publish"
Cohesion: 0.10
Nodes (5): agentMode(), isMissingSessionError(), removeCopilotSessionFiles(), preparePrompt(), hasRunningBackgroundAgent()

### Community 13 - "AgentService"
Cohesion: 0.08
Nodes (5): AgentService, isUncertainDelivery(), RuntimeConfigurationError, fixture(), httpBoundary()

### Community 14 - ".get"
Cohesion: 0.11
Nodes (4): explicitlyRefused(), hasUncertainDelivery(), queueConflict(), terminalRefused()

### Community 15 - "TerminalSessionController"
Cohesion: 0.06
Nodes (9): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), persistedFormAnswer(), statusFromEvents(), terminalFormSteps(), validateUserInputForm(), TranscriptObservation, TerminalSessionController (+1 more)

### Community 16 - "terminal-session.test.ts"
Cohesion: 0.07
Nodes (37): findActiveCopilotProcesses(), directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec (+29 more)

### Community 17 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (7): RemoteResync, headerSafe(), RemoteNodeClient, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceSearchResponse

### Community 18 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 19 - "pwa.ts"
Cohesion: 0.10
Nodes (36): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart() (+28 more)

### Community 20 - "TmuxTerminalSessionController"
Cohesion: 0.13
Nodes (11): copilotCommand(), execFileAsync, processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), tmuxTargetForPid(), TmuxTerminalSessionController (+3 more)

### Community 21 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 22 - "active-sessions.ts"
Cohesion: 0.10
Nodes (35): ActiveProcess, execFileAsync, findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+27 more)

### Community 23 - "computer-manager.ts"
Cohesion: 0.07
Nodes (22): RemoteSessionListing, RemoteSessionRead, SessionMetadataLookup, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, DEFINITE_DISPATCH_REFUSALS, normalizeNodeUrl(), REDIRECT_STATUSES (+14 more)

### Community 24 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 25 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 26 - "contracts.ts"
Cohesion: 0.06
Nodes (32): prefixes, session, trusted, untrusted, ActivityStatus, AddKnowledgeRootInput, AgentMode, BackgroundTaskAttachmentMode (+24 more)

### Community 27 - "session-store.ts"
Cohesion: 0.06
Nodes (26): holdProbe(), fixtures, gate(), releases, deferred(), disk, enqueue(), fixtures (+18 more)

### Community 29 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 30 - "agent-service.test.ts"
Cohesion: 0.07
Nodes (12): CopilotClientLike, configurableModel(), DeferredSession, directories, FakeCopilotClient, services, startupFifoFixture(), CopilotTaskInfo (+4 more)

### Community 31 - "terminal-session.ts"
Cohesion: 0.10
Nodes (32): composer(), processAdapter, COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasComposerAfter() (+24 more)

### Community 32 - "queued-provider-dispatch.test.ts"
Cohesion: 0.09
Nodes (16): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), QueuedDelivery, QueuedDispatchTarget, accept(), copilotSession(), fixtures (+8 more)

### Community 34 - "session-resources.ts"
Cohesion: 0.17
Nodes (30): claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills, count(), enrichClaudeSkills() (+22 more)

### Community 36 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 37 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 38 - "claude-agent-service.ts"
Cohesion: 0.11
Nodes (17): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+9 more)

### Community 39 - "WorkspaceDialog"
Cohesion: 0.13
Nodes (29): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+21 more)

### Community 40 - "registerNodeRoutes"
Cohesion: 0.08
Nodes (26): FileUploadError, MAX_SESSION_FILE_BYTES, SessionParams, supportedExtensions, supportsSessionFile(), configureRuntimeSchema, createSessionSchema, directoryQuerySchema (+18 more)

### Community 41 - "knowledge-tree.ts"
Cohesion: 0.11
Nodes (28): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+20 more)

### Community 42 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 43 - ".sendInternal"
Cohesion: 0.19
Nodes (24): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText(), hasTerminalCommandPermissionQuestion() (+16 more)

### Community 44 - "session-resource-clear.test.ts"
Cohesion: 0.10
Nodes (14): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+6 more)

### Community 45 - "computer-manager-metadata.test.ts"
Cohesion: 0.12
Nodes (11): BuildAppOptions, fixture(), managers, releases, remote, session(), ComputerRegistry, RegistryState (+3 more)

### Community 46 - "hub-routes.ts"
Cohesion: 0.08
Nodes (26): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+18 more)

### Community 47 - "SessionResources.tsx"
Cohesion: 0.12
Nodes (23): ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionSkillSummary, isMcpSummary(), isRecord(), isSkillSummary(), listSessionMcpServers() (+15 more)

### Community 48 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 49 - "session-resource-providers.test.ts"
Cohesion: 0.11
Nodes (18): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), claudeFixture(), ClaudeMcpRead, copilotFixture() (+10 more)

### Community 50 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 51 - "session-reply-durability.test.ts"
Cohesion: 0.15
Nodes (15): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+7 more)

### Community 52 - "PushNotificationService"
Cohesion: 0.25
Nodes (3): brief(), PushNotificationService, registerPushRoutes()

### Community 53 - "session-knowledge-store.ts"
Cohesion: 0.16
Nodes (13): bindingKey(), bindingSchema, Identity, recoverySchema, RootCatalog, rootSchema, SessionKnowledgeConflictError, SessionKnowledgeEvents (+5 more)

### Community 54 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 55 - "BackgroundTasksDialog.tsx"
Cohesion: 0.17
Nodes (12): backgroundTaskSnapshot(), BackgroundTaskTracker, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter (+4 more)

### Community 56 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 57 - "NewSessionDialog"
Cohesion: 0.16
Nodes (21): activateSession(), createSession(), executeCommand(), listDirectories(), listWorkspace(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+13 more)

### Community 58 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 59 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 60 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 61 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 63 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 64 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (8): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession()

### Community 65 - "session-admission-lifecycle.test.ts"
Cohesion: 0.12
Nodes (12): deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, disk, fixtures (+4 more)

### Community 66 - "HubEvent"
Cohesion: 0.14
Nodes (10): ComputerManagerEvents, HubEventSource, PushSender, PushState, directories, sessionMuteSchema, subscriptionSchema, testNotificationSchema (+2 more)

### Community 67 - "workspace-browser.ts"
Cohesion: 0.26
Nodes (13): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+5 more)

### Community 68 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 69 - "workspace-fixtures.ts"
Cohesion: 0.16
Nodes (14): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureComputers, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureKnowledgeRoots (+6 more)

### Community 70 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 71 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 72 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 74 - "session-knowledge-store.test.ts"
Cohesion: 0.17
Nodes (7): SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, disk, fixture(), fixtures, releases, root()

### Community 75 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 76 - "ResourceReads"
Cohesion: 0.19
Nodes (8): ActiveClaudeQuery, releases, session, snapshot, readServiceResources(), ResourceReads, resourceRequestHandler(), sameResourceOwner()

### Community 78 - "queued-dispatch.test.ts"
Cohesion: 0.15
Nodes (7): deferred(), disk, fixtures, holdWrite(), prompt(), releases, target

### Community 79 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 80 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 81 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 82 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 84 - "QueuedDispatches"
Cohesion: 0.19
Nodes (6): errorMessage(), ownsDispatchRecovery(), preflight(), QueuedDispatches, PendingMutation, stopOwnedServer()

### Community 85 - "registerSessionKnowledgeRoutes"
Cohesion: 0.33
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 86 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 87 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 88 - "submission-error.ts"
Cohesion: 0.31
Nodes (6): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, SubmissionError, SubmissionReceipt

### Community 89 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 90 - "KnowledgeRoot"
Cohesion: 0.20
Nodes (7): WorkspaceFixtureState, KnowledgeState, KnowledgeRoot, actions, computers, root, session

### Community 91 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 93 - "session-resource-transport.ts"
Cohesion: 0.31
Nodes (8): CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

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

### Community 99 - "DocumentViewControls.tsx"
Cohesion: 0.29
Nodes (4): DocumentViewControls(), actions, outline, DocumentHeading

### Community 100 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 102 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 103 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 104 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 105 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 106 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 110 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **612 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+607 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 922 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `BackgroundTaskSnapshot`, `FakeSessionService`, `claude-agent-service.ts`, `multi-node.test.ts`, `session-resource-clear.test.ts`, `computer-manager.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ComputerManager` connect `ComputerManager` to `BackgroundTaskSnapshot`, `FakeSessionService`, `WorkspaceListing`, `claude-agent-service.ts`, `multi-node.test.ts`, `session-resource-clear.test.ts`, `computer-manager-metadata.test.ts`, `RemoteNodeClient`, `computer-manager.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `ComputerManager` to `BackgroundTaskSnapshot`, `FakeSessionService`, `WorkspaceListing`, `claude-agent-service.ts`, `registerNodeRoutes`, `multi-node.test.ts`, `ResourceReads`, `session-resource-clear.test.ts`, `RemoteNodeClient`, `computer-manager.ts`, `ProviderSessionService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _612 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03546099290780142 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.02587954680977937 - nodes in this community are weakly interconnected._
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
