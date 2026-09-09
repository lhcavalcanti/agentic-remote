# Agentic Remote - Graphify code map

Snapshot: `12ab8087242584ba9c942763d01ae3e85d0c5230997b043b57448dcf47950b1b`

Source checkout: `46a4d04ab8af27effc6ade29d2fa5d72e45cb321`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 204 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 204 files · ~424,984 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3261 nodes · 9128 edges · 141 communities (108 shown, 20 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 660 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- SessionDetail
- api.ts
- App.tsx
- AgentService
- SessionStore
- agentic-remote-promotion-monitor
- session-resources.ts
- session-presentation.ts
- contracts.ts
- terminal-session.ts
- agent-service.ts
- .get
- terminal-session.test.ts
- SessionService
- RemoteNodeClient
- .clearSerialized
- claude-agent-service.ts
- ComputerManager
- bundle
- SessionKnowledgeStore
- TmuxTerminalSessionController
- FakeSessionService
- ProviderSessionService
- lib.rs
- shell.ts
- background-task-adapter.ts
- config.rs
- PushNotificationService
- pwa.ts
- devDependencies
- dependencies
- agentic-remote
- session-knowledge-routes.test.ts
- WorkspaceDialog
- hub-routes.ts
- agentic-remote-promotion-setup
- TerminalSessionController
- delegated-transcription-service.ts
- sessionKey
- ComputerSummary
- scripts
- directory-browser.ts
- CopilotSessionLike
- tmux-errors.integration.test.ts
- session-knowledge-routes.ts
- compilerOptions
- BackgroundTasksDialog.tsx
- transcription-service.ts
- active-sessions.ts
- NewSessionDialog
- recordValue
- app.ts
- capture-workspace.ts
- node-routes.ts
- knowledge-tree.ts
- compilerOptions
- compilerOptions
- compilerOptions
- NodeIdentityStore
- recordValue
- event-log.ts
- workspace-browser.ts
- PromptCards.tsx
- session-reply-durability.test.ts
- claude-recovery-admission.test.ts
- session-admission-lifecycle.test.ts
- session-store-providers.test.ts
- ReaderWorkspace
- workspace-fixtures.ts
- agent-service.test.ts
- background-task-stop.test.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- check-workspace-review-regressions.ts
- queued-dispatch.test.ts
- desktop.json
- queued-provider-dispatch.test.ts
- capture-workbench-review.ts
- package.json
- .oxlintrc.json
- settings-local.json
- session-resource-clear.test.ts
- TranscriptionError
- CopilotClientLike
- promotion-monitor.test.ts
- SessionAdmissions
- session-store.ts
- scripts
- submission-error.ts
- session-resource-providers.test.ts
- DeferredSession
- file-upload-routes.ts
- session-enqueue-clear.test.ts
- composerHoldsText
- bridge.rs
- setupWorkspaceFixture
- screenshot-stability.test.ts
- session-resource-transport.ts
- session-store-durability.test.ts
- KnowledgeRootChoices.tsx
- KnowledgePosition
- DocumentViewControls.tsx
- SessionFileUpload
- settings.ts
- toolActivityContent
- composer-layout.test.ts
- release-publication.test.ts
- MarkdownCodeBlock.tsx
- removeComputer
- .discoverTerminalSessions
- terminal-send-uncertainty.test.ts
- hasRunningBackgroundAgent
- MockMediaRecorder
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
1. `SessionDetail` - 260 edges
2. `App()` - 224 edges
3. `AgentService` - 204 edges
4. `SessionStore` - 139 edges
5. `ClaudeAgentService` - 117 edges
6. `ComputerManager` - 78 edges
7. `SessionService` - 69 edges
8. `RemoteNodeClient` - 64 edges
9. `registerHubRoutes()` - 58 edges
10. `TmuxTerminalSessionController` - 55 edges

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

## Communities (141 total, 20 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (133): deleteSession(), listKnowledgeEntries(), readKnowledgeFile(), reorderQueuedPrompts(), transcribeAudio(), uploadSessionFile(), activeComposerPastes(), App() (+125 more)

### Community 1 - "SessionDetail"
Cohesion: 0.04
Nodes (11): ClaudeAgentService, isMissingClaudeSessionError(), preparePrompt(), claudeFixture(), answer(), claudeRequest(), copilotRequest(), QueuedPromptReservation (+3 more)

### Community 2 - "api.ts"
Cohesion: 0.04
Nodes (104): parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), definiteDispatchRefusals, deleteKnowledgeRoot() (+96 more)

### Community 3 - "App.tsx"
Cohesion: 0.03
Nodes (97): accentIconUrl(), applyAccentIcon(), configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation() (+89 more)

### Community 4 - "AgentService"
Cohesion: 0.06
Nodes (4): AgentService, RuntimeConfigurationError, fixture(), httpBoundary()

### Community 5 - "SessionStore"
Cohesion: 0.06
Nodes (27): fixture(), connect(), createStore(), enqueue(), fixture(), fixture(), fixture(), fixture() (+19 more)

### Community 6 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 7 - "session-resources.ts"
Cohesion: 0.09
Nodes (44): ClaudeResources, claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills, copilotWorkspaceMcp, CopilotWorkspaceSkills, count() (+36 more)

### Community 8 - "session-presentation.ts"
Cohesion: 0.07
Nodes (43): react, DialogFrame(), KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, attentionRank, computerTone() (+35 more)

### Community 9 - "contracts.ts"
Cohesion: 0.05
Nodes (39): managers, releases, remote, RemoteResync, RemoteSessionRead, RegistryState, StoredNodeIdentity, AUDIO_FILENAME_HEADER (+31 more)

### Community 10 - "terminal-session.ts"
Cohesion: 0.10
Nodes (49): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+41 more)

### Community 11 - "agent-service.ts"
Cohesion: 0.04
Nodes (46): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut() (+38 more)

### Community 12 - ".get"
Cohesion: 0.10
Nodes (6): isUncertainDelivery(), ownsDispatchRecovery(), preflight(), queueConflict(), QueuedDispatches, PendingMutation

### Community 13 - "terminal-session.test.ts"
Cohesion: 0.07
Nodes (38): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), directories (+30 more)

### Community 14 - "SessionService"
Cohesion: 0.08
Nodes (9): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, readServiceResources(), ResourceReads, resourceRequestHandler() (+1 more)

### Community 15 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (8): headerSafe(), RemoteNodeClient, BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing, WorkspaceFileIcon()

### Community 16 - ".clearSerialized"
Cohesion: 0.09
Nodes (5): agentMode(), isMissingSessionError(), removeCopilotSessionFiles(), TranscriptObservation, SessionRuntimeInfo

### Community 17 - "claude-agent-service.ts"
Cohesion: 0.08
Nodes (24): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+16 more)

### Community 18 - "ComputerManager"
Cohesion: 0.18
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 19 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 20 - "SessionKnowledgeStore"
Cohesion: 0.09
Nodes (20): bindingKey(), bindingSchema, Identity, recoverySchema, RootCatalog, rootSchema, SessionKnowledgeConflictError, SessionKnowledgeEvents (+12 more)

### Community 21 - "TmuxTerminalSessionController"
Cohesion: 0.13
Nodes (10): copilotCommand(), execFileAsync, processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), tmuxTargetForPid(), TmuxTerminalSessionController (+2 more)

### Community 22 - "FakeSessionService"
Cohesion: 0.07
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 24 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 25 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 26 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (37): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotTaskInfo, CopilotTaskProgress, errorValue(), eventTask() (+29 more)

### Community 27 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 28 - "PushNotificationService"
Cohesion: 0.12
Nodes (11): brief(), HubEventSource, PushNotificationService, PushSender, PushState, directories, registerPushRoutes(), sessionMuteSchema (+3 more)

### Community 29 - "pwa.ts"
Cohesion: 0.11
Nodes (32): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), toggle() (+24 more)

### Community 30 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 31 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 32 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 33 - "session-knowledge-routes.test.ts"
Cohesion: 0.09
Nodes (18): WorkspaceFixtureState, ServerRole, ComputerManagerEvents, SessionMetadataLookup, KnowledgeState, KnowledgeStore, directories, disk (+10 more)

### Community 34 - "WorkspaceDialog"
Cohesion: 0.13
Nodes (29): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog(), moveHere(), navigateDocument() (+21 more)

### Community 35 - "hub-routes.ts"
Cohesion: 0.07
Nodes (27): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+19 more)

### Community 36 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 37 - "TerminalSessionController"
Cohesion: 0.11
Nodes (5): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), TerminalSessionController, SessionStatus

### Community 38 - "delegated-transcription-service.ts"
Cohesion: 0.12
Nodes (14): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+6 more)

### Community 39 - "sessionKey"
Cohesion: 0.12
Nodes (23): SessionKnowledgeBinding, getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), cancelSelectedBackgroundTask(), created(), handleDragEnd() (+15 more)

### Community 40 - "ComputerSummary"
Cohesion: 0.12
Nodes (10): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary, computers, first, grouped (+2 more)

### Community 41 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 42 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 43 - "CopilotSessionLike"
Cohesion: 0.13
Nodes (14): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), QueuedDelivery, QueuedDispatchTarget (+6 more)

### Community 44 - "tmux-errors.integration.test.ts"
Cohesion: 0.11
Nodes (21): listTmuxSessions(), execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer() (+13 more)

### Community 45 - "session-knowledge-routes.ts"
Cohesion: 0.13
Nodes (17): Lineage, registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+9 more)

### Community 46 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 47 - "BackgroundTasksDialog.tsx"
Cohesion: 0.14
Nodes (15): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskCard(), BackgroundTasksDialog() (+7 more)

### Community 48 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 49 - "active-sessions.ts"
Cohesion: 0.20
Nodes (22): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+14 more)

### Community 50 - "NewSessionDialog"
Cohesion: 0.14
Nodes (23): activateSession(), createSession(), executeCommand(), getProviderRuntimeOptions(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory() (+15 more)

### Community 51 - "recordValue"
Cohesion: 0.22
Nodes (19): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isUnsupportedBackgroundTaskError() (+11 more)

### Community 52 - "app.ts"
Cohesion: 0.14
Nodes (14): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), transcriptionComputerName() (+6 more)

### Community 53 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 54 - "node-routes.ts"
Cohesion: 0.10
Nodes (20): AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, knowledgeFileQuerySchema (+12 more)

### Community 55 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 56 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 57 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 58 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 59 - "NodeIdentityStore"
Cohesion: 0.17
Nodes (5): BuildAppOptions, ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 60 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 61 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 62 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 63 - "PromptCards.tsx"
Cohesion: 0.18
Nodes (17): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), question, request, UserInputCard(), UserInputFieldControl() (+9 more)

### Community 64 - "session-reply-durability.test.ts"
Cohesion: 0.19
Nodes (14): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, fixture() (+6 more)

### Community 65 - "claude-recovery-admission.test.ts"
Cohesion: 0.13
Nodes (10): deferred(), disk, fixtures, holdClaimWrite(), releases, disk, fixtures, gate() (+2 more)

### Community 66 - "session-admission-lifecycle.test.ts"
Cohesion: 0.13
Nodes (11): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), deferred(), disk, enqueue() (+3 more)

### Community 67 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (6): claude(), disk, event(), fixtures, releases, sdkSession()

### Community 68 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 69 - "workspace-fixtures.ts"
Cohesion: 0.16
Nodes (14): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureComputers, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureKnowledgeRoots (+6 more)

### Community 70 - "agent-service.test.ts"
Cohesion: 0.15
Nodes (7): terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), UserInputForm

### Community 71 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 72 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 73 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 74 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 75 - "queued-dispatch.test.ts"
Cohesion: 0.15
Nodes (8): deferred(), disk, fixture(), fixtures, holdWrite(), prompt(), releases, target

### Community 76 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 77 - "queued-provider-dispatch.test.ts"
Cohesion: 0.18
Nodes (8): copilotFixture(), copilotSession(), fixtures, gate(), originalQueue, pause(), releases, seed()

### Community 78 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 79 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 80 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 81 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 82 - "session-resource-clear.test.ts"
Cohesion: 0.21
Nodes (12): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+4 more)

### Community 83 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 84 - "CopilotClientLike"
Cohesion: 0.17
Nodes (5): CopilotClientLike, holdProbe(), fixtures, gate(), releases

### Community 85 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 86 - "SessionAdmissions"
Cohesion: 0.20
Nodes (4): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions

### Community 87 - "session-store.ts"
Cohesion: 0.17
Nodes (11): activityDuration(), activityResultPreview(), emptyRetirements, PendingChange, RecoveryResend, SdkQueueAdmission, SessionProjection, StoredSession (+3 more)

### Community 88 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 89 - "submission-error.ts"
Cohesion: 0.31
Nodes (6): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, SubmissionError, SubmissionReceipt

### Community 90 - "session-resource-providers.test.ts"
Cohesion: 0.20
Nodes (10): ClaudeMcpRead, deferred(), DiscoveredMcp, DiscoveredSkills, fixtures, Mcp, pause(), releases (+2 more)

### Community 92 - "file-upload-routes.ts"
Cohesion: 0.29
Nodes (6): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile()

### Community 93 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 94 - "composerHoldsText"
Cohesion: 0.36
Nodes (10): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), pasteCouldCollapse() (+2 more)

### Community 95 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 96 - "setupWorkspaceFixture"
Cohesion: 0.25
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 97 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 98 - "session-resource-transport.ts"
Cohesion: 0.36
Nodes (7): readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 99 - "session-store-durability.test.ts"
Cohesion: 0.31
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 100 - "KnowledgeRootChoices.tsx"
Cohesion: 0.25
Nodes (7): KnowledgeRootChoice, KnowledgeRootChoices(), KnowledgeRootSession, actions, computers, root, session

### Community 101 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 102 - "DocumentViewControls.tsx"
Cohesion: 0.29
Nodes (4): DocumentViewControls(), actions, outline, DocumentHeading

### Community 104 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 105 - "toolActivityContent"
Cohesion: 0.40
Nodes (6): previewText(), readableMcpServerName(), readableToolName(), sameToolLabel(), stripAnsi(), toolActivityContent()

### Community 106 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 107 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 108 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 109 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 115 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **617 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+612 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 928 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `SessionFileUpload`, `session-resources.ts`, `contracts.ts`, `directory-browser.ts`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `session-resources.ts`, `ComputerSummary`, `directory-browser.ts`, `RemoteNodeClient`, `claude-agent-service.ts`, `ComputerManager`, `ProviderSessionService`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `SessionDetail`, `AgentService`, `TerminalSessionController`, `SessionFileUpload`, `.get`, `.clearSerialized`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _617 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03513710770514024 - nodes in this community are weakly interconnected._
- **Should `SessionDetail` be split into smaller, more focused modules?**
  _Cohesion score 0.044516129032258066 - nodes in this community are weakly interconnected._
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
