# Agentic Remote - Graphify code map

Snapshot: `7e82290e023917659d6b305713088e57eab54971e3eff7faa7e6a0d100cc7cab`

Source checkout: `fbdca145585933cc1a13422f37a037d76d167749`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 209 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 209 files · ~430,093 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3293 nodes · 9224 edges · 134 communities (98 shown, 23 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 671 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- App.tsx
- session-resource-clear.test.ts
- SessionStore
- SessionDetail
- App.test.tsx
- session-presentation.ts
- contracts.ts
- agentic-remote-promotion-monitor
- session-store.ts
- session-resources.ts
- markdown-navigation.ts
- .sendAdmittedWithBackend
- RemoteNodeClient
- terminal-session.ts
- agent-service.ts
- session-reply-durability.test.ts
- bundle
- TmuxTerminalSessionController
- FakeSessionService
- SessionService
- lib.rs
- terminal-startup-queue.test.ts
- shell.ts
- background-task-adapter.ts
- registerHubRoutes
- config.rs
- ProviderSessionService
- claude-agent-service.ts
- workspace-browser.ts
- pwa.ts
- devDependencies
- dependencies
- agentic-remote
- hub-routes.ts
- session-knowledge-routes.test.ts
- delegated-transcription-service.ts
- remote-node-client.ts
- agentic-remote-promotion-setup
- ComputerManager
- node-routes.ts
- terminal-session.test.ts
- scripts
- PushNotificationService
- .handleSessionEvent
- tmux-errors.integration.test.ts
- compilerOptions
- active-sessions.ts
- directory-browser.ts
- BackgroundTasksDialog.tsx
- transcription-service.ts
- NewSessionDialog
- noTmuxServer
- capture-workspace.ts
- session-resource-routes.test.ts
- app.ts
- session-store-providers.test.ts
- compilerOptions
- compilerOptions
- check-workspace-review-regressions.ts
- compilerOptions
- recordValue
- event-log.ts
- SessionKnowledgeStore
- SessionKnowledgeBinding
- ReaderWorkspace
- background-task-stop.test.ts
- recovery-resend-durability.test.ts
- knowledgePathChain
- session-knowledge-store.ts
- workspace-fixtures.ts
- desktop.json
- registerSessionKnowledgeRoutes
- capture-workbench-review.ts
- package.json
- settings-local.json
- push-notification-service.ts
- TranscriptionError
- session-response-order.ts
- .acknowledgeFailedPrompt
- promotion-monitor.test.ts
- SessionAdmissions
- scripts
- session-knowledge-routes.ts
- .oxlintrc.json
- DeferredSession
- session-resource-transport.ts
- bridge.rs
- setupWorkspaceFixture
- screenshot-stability.test.ts
- KnowledgePosition
- agent-service.test.ts
- session-knowledge-store.test.ts
- deleteSession
- DocumentViewControls.tsx
- SessionFileUpload
- settings.ts
- toolActivityContent
- composer-layout.test.ts
- release-publication.test.ts
- MarkdownCodeBlock.tsx
- session-resource-cancellation.test.ts
- SessionRuntimeInfo
- .discoverTerminalSessions
- terminal-send-uncertainty.test.ts
- SessionActions.tsx
- ActivityKind
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

## Communities (134 total, 23 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.04
Nodes (14): agentMode(), AgentService, isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError, statusFromEvents(), acceptanceReceipt(), preparePrompt() (+6 more)

### Community 1 - "App"
Cohesion: 0.04
Nodes (122): replyPermission(), activeComposerPastes(), App(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession(), askAboutKnowledgeFile() (+114 more)

### Community 2 - "App.tsx"
Cohesion: 0.03
Nodes (102): ActivityStatus, accentIconUrl(), applyAccentIcon(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+94 more)

### Community 3 - "session-resource-clear.test.ts"
Cohesion: 0.03
Nodes (71): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, FakeCopilotClient, CopilotTasksApi (+63 more)

### Community 4 - "SessionStore"
Cohesion: 0.05
Nodes (29): fixture(), connect(), createStore(), enqueue(), fixture(), fixture(), claudeFixture(), copilotFixture() (+21 more)

### Community 5 - "SessionDetail"
Cohesion: 0.06
Nodes (6): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), toolResultText(), RuntimeModelOption, SessionDetail

### Community 6 - "App.test.tsx"
Cohesion: 0.04
Nodes (74): addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRuntime(), dispatchQueuedPrompt(), getPushSettings(), getRuntimeOptions() (+66 more)

### Community 7 - "session-presentation.ts"
Cohesion: 0.05
Nodes (60): plugins, oxc, react, typescript, KnowledgeRootChoice, KnowledgeRootChoices(), KnowledgeRootSession, actions (+52 more)

### Community 8 - "contracts.ts"
Cohesion: 0.05
Nodes (56): managers, releases, remote, RemoteResync, RemoteSessionRead, RegistryState, StoredNodeIdentity, ResourceRead (+48 more)

### Community 9 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 10 - "session-store.ts"
Cohesion: 0.05
Nodes (39): errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), queueConflict(), QueuedDispatches, QueuedDispatchTarget (+31 more)

### Community 11 - "session-resources.ts"
Cohesion: 0.10
Nodes (41): ActiveClaudeQuery, claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills, count() (+33 more)

### Community 12 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (47): UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog() (+39 more)

### Community 13 - ".sendAdmittedWithBackend"
Cohesion: 0.09
Nodes (3): QueuedDelivery, isTerminalAgentWorking(), TerminalSessionController

### Community 14 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (7): RemoteNodeClient, hasRunningBackgroundAgent(), BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing

### Community 15 - "terminal-session.ts"
Cohesion: 0.12
Nodes (43): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+35 more)

### Community 16 - "agent-service.ts"
Cohesion: 0.05
Nodes (42): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+34 more)

### Community 17 - "session-reply-durability.test.ts"
Cohesion: 0.09
Nodes (22): persistedFormAnswer(), TerminalFormContinuation, answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture() (+14 more)

### Community 18 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 19 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (12): copilotCommand(), execFileAsync, parseTerminalFormActiveField(), processAncestors(), processCommand(), processIsAlive(), submitTerminalForm(), terminalBoxWrap() (+4 more)

### Community 20 - "FakeSessionService"
Cohesion: 0.07
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 22 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 23 - "terminal-startup-queue.test.ts"
Cohesion: 0.10
Nodes (31): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), directories (+23 more)

### Community 24 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 25 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (37): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotTaskInfo, CopilotTaskProgress, errorValue(), eventTask() (+29 more)

### Community 26 - "registerHubRoutes"
Cohesion: 0.17
Nodes (5): managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedSession, SessionListing

### Community 27 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 29 - "claude-agent-service.ts"
Cohesion: 0.11
Nodes (20): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+12 more)

### Community 30 - "workspace-browser.ts"
Cohesion: 0.10
Nodes (29): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+21 more)

### Community 31 - "pwa.ts"
Cohesion: 0.11
Nodes (33): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+25 more)

### Community 32 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 33 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 34 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 35 - "hub-routes.ts"
Cohesion: 0.07
Nodes (28): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+20 more)

### Community 36 - "session-knowledge-routes.test.ts"
Cohesion: 0.10
Nodes (16): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, KnowledgeState, KnowledgeStore, directories, disk, FakeManager (+8 more)

### Community 37 - "delegated-transcription-service.ts"
Cohesion: 0.10
Nodes (14): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+6 more)

### Community 38 - "remote-node-client.ts"
Cohesion: 0.11
Nodes (20): DEFINITE_DISPATCH_REFUSALS, headerSafe(), normalizeNodeUrl(), REDIRECT_STATUSES, RemoteNodeClientEvents, client(), servers, session (+12 more)

### Community 39 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 40 - "ComputerManager"
Cohesion: 0.16
Nodes (6): ComputerManager, fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 41 - "node-routes.ts"
Cohesion: 0.08
Nodes (26): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+18 more)

### Community 42 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (26): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+18 more)

### Community 43 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 44 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 45 - ".handleSessionEvent"
Cohesion: 0.20
Nodes (20): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+12 more)

### Community 46 - "tmux-errors.integration.test.ts"
Cohesion: 0.13
Nodes (10): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore, execFileAsync, headers, ignoreMissing(), removeFixture() (+2 more)

### Community 47 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 48 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 49 - "directory-browser.ts"
Cohesion: 0.18
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 50 - "BackgroundTasksDialog.tsx"
Cohesion: 0.14
Nodes (15): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskCard(), BackgroundTasksDialog() (+7 more)

### Community 51 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 52 - "NewSessionDialog"
Cohesion: 0.14
Nodes (23): provider(), activateSession(), createSession(), executeCommand(), listDirectories(), listWorkspace(), validateSessionDirectory(), AddKnowledgeRootDialog() (+15 more)

### Community 53 - "noTmuxServer"
Cohesion: 0.11
Nodes (14): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+6 more)

### Community 54 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 55 - "session-resource-routes.test.ts"
Cohesion: 0.12
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 56 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), transcriptionComputerName() (+5 more)

### Community 57 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 58 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 59 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 60 - "check-workspace-review-regressions.ts"
Cohesion: 0.13
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 61 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 62 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 63 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 65 - "SessionKnowledgeBinding"
Cohesion: 0.20
Nodes (13): SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding() (+5 more)

### Community 66 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 67 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 68 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 69 - "knowledgePathChain"
Cohesion: 0.19
Nodes (16): listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+8 more)

### Community 70 - "session-knowledge-store.ts"
Cohesion: 0.14
Nodes (11): bindingSchema, Identity, recoverySchema, RootCatalog, rootSchema, SessionKnowledgeEvents, SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError (+3 more)

### Community 71 - "workspace-fixtures.ts"
Cohesion: 0.15
Nodes (13): BACKGROUND_SESSION_ID, documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels (+5 more)

### Community 72 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 73 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 74 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 75 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 76 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 77 - "push-notification-service.ts"
Cohesion: 0.15
Nodes (10): brief(), PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 78 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 79 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 81 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 82 - "SessionAdmissions"
Cohesion: 0.20
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 83 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 84 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 85 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 87 - "session-resource-transport.ts"
Cohesion: 0.31
Nodes (8): CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

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

### Community 92 - "agent-service.test.ts"
Cohesion: 0.25
Nodes (6): terminalFormSteps(), configurableModel(), directories, services, startupFifoFixture(), UserInputForm

### Community 93 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 94 - "deleteSession"
Cohesion: 0.28
Nodes (9): addComputer(), deleteKnowledgeRoot(), deleteSession(), removeComputer(), requestVoid(), removeRoot(), ComputersDialog(), remove() (+1 more)

### Community 95 - "DocumentViewControls.tsx"
Cohesion: 0.29
Nodes (4): DocumentViewControls(), actions, outline, DocumentHeading

### Community 97 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 98 - "toolActivityContent"
Cohesion: 0.40
Nodes (6): previewText(), readableMcpServerName(), readableToolName(), sameToolLabel(), stripAnsi(), toolActivityContent()

### Community 99 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 100 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 101 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 102 - "session-resource-cancellation.test.ts"
Cohesion: 0.40
Nodes (3): releases, session, snapshot

### Community 103 - "SessionRuntimeInfo"
Cohesion: 0.50
Nodes (3): listTmuxSessions(), safeWindowName(), SessionRuntimeInfo

## Knowledge Gaps
- **623 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+618 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 939 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionKnowledgeStore`, `session-knowledge-routes.test.ts`, `delegated-transcription-service.ts`, `SessionDetail`, `SessionStore`, `ComputerManager`, `node-routes.ts`, `PushNotificationService`, `tmux-errors.integration.test.ts`, `TranscriptionError`, `.acknowledgeFailedPrompt`, `transcription-service.ts`, `SessionService`, `registerHubRoutes`, `ProviderSessionService`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `SessionFileUpload`, `SessionStore`, `contracts.ts`, `.discoverTerminalSessions`, `session-store.ts`, `session-resources.ts`, `.sendAdmittedWithBackend`, `.handleSessionEvent`, `.acknowledgeFailedPrompt`, `session-reply-durability.test.ts`, `directory-browser.ts`, `session-resource-routes.test.ts`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `SessionFileUpload`, `remote-node-client.ts`, `contracts.ts`, `ComputerManager`, `directory-browser.ts`, `session-reply-durability.test.ts`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _623 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.043026418026418024 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04072342519685039 - nodes in this community are weakly interconnected._
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
