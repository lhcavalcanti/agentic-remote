# Agentic Remote - Graphify code map

Snapshot: `c6de74b0013dbce2abd09bbfe4a87264ec6b6069bcffa70f79750210f0a95f20`

Source checkout: `b60519fdcf5ed40b229d0bdd55ee11ce120df2e4`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 227 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 227 files · ~461,762 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3469 nodes · 9794 edges · 144 communities (109 shown, 21 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 724 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- api.ts
- SessionDetail
- App.tsx
- SessionStore
- agentic-remote-promotion-monitor
- agent-service.ts
- claude-agent-service.ts
- queued-provider-dispatch.test.ts
- SessionService
- terminal-session.ts
- markdown-navigation.ts
- ComputerManager
- RemoteNodeClient
- hub-routes.ts
- BackgroundTaskSnapshot
- contracts.ts
- TmuxTerminalSessionController
- pwa.ts
- bundle
- session-knowledge-routes.test.ts
- CopilotSessionLike
- ProviderSessionService
- lib.rs
- multi-node.test.ts
- shell.ts
- config.rs
- .clearSerialized
- knowledge-tree.ts
- devDependencies
- .replyUserInputInternal
- dependencies
- agentic-remote
- background-task-adapter.ts
- SessionKnowledgeStore
- tmux-test-helpers.ts
- FakeSessionService
- tmux-errors.integration.test.ts
- app.ts
- agentic-remote-promotion-setup
- terminal-startup-queue.test.ts
- terminal-session.test.ts
- session-store.ts
- computer-manager-metadata.test.ts
- scripts
- delegated-transcription-service.ts
- PushNotificationService
- remote-node-client.ts
- directory-browser.ts
- compilerOptions
- .sendAdmittedWithBackend
- SessionOrderStore
- session-resource-clear.test.ts
- transcription-service.ts
- node-routes.ts
- noTmuxServer
- capture-workspace.ts
- session-clear-transcript.test.ts
- session-knowledge-store.ts
- compilerOptions
- session-enqueue-clear.test.ts
- ComputerSummary
- session-reply-durability.test.ts
- session-store-providers.test.ts
- compilerOptions
- check-workspace-review-regressions.ts
- compilerOptions
- session-resource-routes.test.ts
- recordValue
- workspace-browser.ts
- session-admission-lifecycle.test.ts
- background-task-stop.test.ts
- NewSessionDialog
- recovery-resend-durability.test.ts
- queued-dispatch.test.ts
- workspace-fixtures.ts
- desktop.json
- registerSessionKnowledgeRoutes
- PromptCards.tsx
- capture
- BackgroundTasksDialog.tsx
- capture-workbench-review.ts
- package.json
- settings-local.json
- DeferredSession
- push-notification-service.ts
- session-resource-providers.test.ts
- TranscriptionError
- session-response-order.ts
- react
- scripts
- background-task-tracker.ts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- session-knowledge-routes.ts
- .oxlintrc.json
- generate-pwa-icons.ts
- bridge.rs
- setupWorkspaceFixture
- screenshot-stability.test.ts
- KnowledgePosition
- ReaderWorkspace
- SessionFileUpload
- UserInputFieldControl
- ReaderWorkspace.test.tsx
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- MarkdownCodeBlock.tsx
- session-navigation-view.test.ts
- hasRunningBackgroundAgent
- removeComputer
- terminal-send-uncertainty.test.ts
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- vite.config.ts
- fastify
- @github/copilot-sdk
- lucide-react
- pdfjs-dist
- react-dom
- ws
- zod
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 276 edges
2. `App()` - 245 edges
3. `AgentService` - 218 edges
4. `SessionStore` - 150 edges
5. `ClaudeAgentService` - 118 edges
6. `ComputerManager` - 80 edges
7. `registerHubRoutes()` - 74 edges
8. `SessionService` - 70 edges
9. `RemoteNodeClient` - 65 edges
10. `TmuxTerminalSessionController` - 57 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `BackgroundTaskUpdate` --references--> `BackgroundTaskSnapshot`  [EXTRACTED]
  server/background-task-tracker.ts → shared/contracts.ts
- `ClaudeAgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (144 total, 21 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.06
Nodes (6): AgentService, isUncertainDelivery(), queueConflict(), fixture(), httpBoundary(), deliveryUncertaintyFromError()

### Community 1 - "App"
Cohesion: 0.04
Nodes (122): activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession(), askAboutKnowledgeFile() (+114 more)

### Community 2 - "api.ts"
Cohesion: 0.04
Nodes (106): addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation(), definiteDispatchRefusals, deleteKnowledgeRoot(), deleteSession() (+98 more)

### Community 3 - "SessionDetail"
Cohesion: 0.04
Nodes (9): ClaudeAgentService, isMissingClaudeSessionError(), observe(), copilotRequest(), clearRecoverySeedFailure(), TranscriptObservation, QueuedPrompt, RuntimeModelOption (+1 more)

### Community 4 - "App.tsx"
Cohesion: 0.03
Nodes (101): configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+93 more)

### Community 5 - "SessionStore"
Cohesion: 0.06
Nodes (35): fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures (+27 more)

### Community 6 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.06
Nodes (61): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+53 more)

### Community 8 - "claude-agent-service.ts"
Cohesion: 0.09
Nodes (48): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+40 more)

### Community 9 - "queued-provider-dispatch.test.ts"
Cohesion: 0.06
Nodes (22): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), QueuedDelivery (+14 more)

### Community 10 - "SessionService"
Cohesion: 0.07
Nodes (12): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, readServiceResources(), readSessionMcpServers(), readSessionSkills() (+4 more)

### Community 11 - "terminal-session.ts"
Cohesion: 0.11
Nodes (50): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerHoldsText(), composerText(), containsCopiedInteractiveFrame() (+42 more)

### Community 12 - "markdown-navigation.ts"
Cohesion: 0.08
Nodes (42): executeCommand(), listWorkspace(), searchWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader() (+34 more)

### Community 13 - "ComputerManager"
Cohesion: 0.16
Nodes (5): ComputerManager, managedSession(), registerHubRoutes(), ResourceRead, ManagedSession

### Community 14 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (7): RemoteResync, headerSafe(), RemoteNodeClient, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing

### Community 15 - "hub-routes.ts"
Cohesion: 0.06
Nodes (47): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+39 more)

### Community 16 - "BackgroundTaskSnapshot"
Cohesion: 0.09
Nodes (39): BackgroundTaskSnapshot, KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, attentionRank, computerTone(), executionModeName() (+31 more)

### Community 17 - "contracts.ts"
Cohesion: 0.06
Nodes (42): RemoteSessionListing, RemoteSessionRead, ActivityStatus, AddComputerInput, AddKnowledgeRootInput, AgentMode, AudioTranscription, BackgroundTaskAttachmentMode (+34 more)

### Community 18 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (12): copilotCommand(), execFileAsync, formViewportTimeout(), listTmuxSessions(), processAncestors(), processCommand(), processIsAlive(), safeWindowName() (+4 more)

### Community 19 - "pwa.ts"
Cohesion: 0.09
Nodes (39): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate() (+31 more)

### Community 20 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 21 - "session-knowledge-routes.test.ts"
Cohesion: 0.07
Nodes (21): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, StoredNodeIdentity (+13 more)

### Community 22 - "CopilotSessionLike"
Cohesion: 0.06
Nodes (20): CopilotClientLike, CopilotSessionLike, holdProbe(), fixtures, gate(), releases, terminalFormSteps(), configurableModel() (+12 more)

### Community 24 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 25 - "multi-node.test.ts"
Cohesion: 0.09
Nodes (16): AgentServiceEvents, CreationRuntime, directories, routingFixture(), session(), temporaryDirectory(), ProviderSessionServiceEvents, AgentProvider (+8 more)

### Community 26 - "shell.ts"
Cohesion: 0.10
Nodes (33): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+25 more)

### Community 27 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 28 - ".clearSerialized"
Cohesion: 0.09
Nodes (4): agentMode(), isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError

### Community 29 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+26 more)

### Community 30 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 31 - ".replyUserInputInternal"
Cohesion: 0.11
Nodes (9): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), persistedFormAnswer(), statusFromEvents(), TerminalFormContinuation, TerminalFormReplyError, PendingUserInput, SessionStatus (+1 more)

### Community 32 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 33 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 34 - "background-task-adapter.ts"
Cohesion: 0.16
Nodes (31): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), errorValue(), eventTask(), executionModeValue(), isLiveTaskStatus() (+23 more)

### Community 35 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 36 - "tmux-test-helpers.ts"
Cohesion: 0.14
Nodes (25): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), horizontalFormFixture() (+17 more)

### Community 38 - "tmux-errors.integration.test.ts"
Cohesion: 0.14
Nodes (29): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+21 more)

### Community 39 - "app.ts"
Cohesion: 0.11
Nodes (20): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), transcriptionComputerName() (+12 more)

### Community 40 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 41 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (26): findActiveCopilotSessions(), appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs (+18 more)

### Community 42 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (25): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse(), pastedPlaceholderCount() (+17 more)

### Community 43 - "session-store.ts"
Cohesion: 0.08
Nodes (20): PendingTerminalQueueSettlement, TerminalDiscoveryError, activityDuration(), activityResultPreview(), archivedMessage(), DiscoveredSession, emptyRetirements, PendingChange (+12 more)

### Community 44 - "computer-manager-metadata.test.ts"
Cohesion: 0.12
Nodes (10): fixture(), managers, releases, remote, session(), ComputerRegistry, RegistryState, directories (+2 more)

### Community 45 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 46 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (12): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+4 more)

### Community 47 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 48 - "remote-node-client.ts"
Cohesion: 0.13
Nodes (16): DEFINITE_DISPATCH_REFUSALS, REDIRECT_STATUSES, RemoteNodeClientEvents, client(), servers, session, RemoteNodeRedirectError, RemoteNodeRequestError (+8 more)

### Community 49 - "directory-browser.ts"
Cohesion: 0.17
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 50 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 52 - "SessionOrderStore"
Cohesion: 0.20
Nodes (9): orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState, SessionOrderStore, directories, store() (+1 more)

### Community 53 - "session-resource-clear.test.ts"
Cohesion: 0.11
Nodes (20): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+12 more)

### Community 54 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 55 - "node-routes.ts"
Cohesion: 0.09
Nodes (22): AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema (+14 more)

### Community 56 - "noTmuxServer"
Cohesion: 0.11
Nodes (14): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+6 more)

### Community 57 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 58 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 59 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema, PersistedBinding (+11 more)

### Community 60 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 61 - "session-enqueue-clear.test.ts"
Cohesion: 0.13
Nodes (16): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), disk (+8 more)

### Community 62 - "ComputerSummary"
Cohesion: 0.15
Nodes (8): sessionAtLeastAsNew(), RegisteredComputer, normalizeNodeUrl(), ComputerSummary, actions, computers, root, session

### Community 63 - "session-reply-durability.test.ts"
Cohesion: 0.17
Nodes (16): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture() (+8 more)

### Community 64 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 65 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 66 - "check-workspace-review-regressions.ts"
Cohesion: 0.13
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 67 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 68 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 69 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 70 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 71 - "session-admission-lifecycle.test.ts"
Cohesion: 0.12
Nodes (12): deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, disk, fixtures (+4 more)

### Community 72 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 73 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+8 more)

### Community 74 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 75 - "queued-dispatch.test.ts"
Cohesion: 0.14
Nodes (8): accept(), deferred(), disk, fixtures, holdWrite(), prompt(), releases, target

### Community 76 - "workspace-fixtures.ts"
Cohesion: 0.15
Nodes (13): BACKGROUND_SESSION_ID, documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels (+5 more)

### Community 77 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 78 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 79 - "PromptCards.tsx"
Cohesion: 0.19
Nodes (12): PendingPermission, UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question (+4 more)

### Community 80 - "capture"
Cohesion: 0.22
Nodes (13): shortcutKeys(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode(), keyLabel(), readStoredShortcuts() (+5 more)

### Community 81 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 82 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 83 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 84 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 85 - "DeferredSession"
Cohesion: 0.17
Nodes (4): DeferredSession, CopilotTaskInfo, CopilotTaskProgress, BackgroundTaskKind

### Community 86 - "push-notification-service.ts"
Cohesion: 0.15
Nodes (10): brief(), PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 87 - "session-resource-providers.test.ts"
Cohesion: 0.22
Nodes (12): claudeFixture(), ClaudeMcpRead, deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures, Mcp (+4 more)

### Community 88 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 89 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 90 - "react"
Cohesion: 0.20
Nodes (8): plugins, oxc, react, typescript, drawDiagram(), drawing, MermaidDiagram(), SessionActions()

### Community 91 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 92 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 93 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 94 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 95 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 96 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 97 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 98 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 99 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 100 - "setupWorkspaceFixture"
Cohesion: 0.25
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 101 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 102 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 103 - "ReaderWorkspace"
Cohesion: 0.36
Nodes (7): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth()

### Community 105 - "UserInputFieldControl"
Cohesion: 0.57
Nodes (8): UserInputFieldControl(), chooseOption(), handleMenuKeyDown(), handleMultiSelectKeyDown(), handleTriggerKeyDown(), moveOption(), optionDirection(), toggleOption()

### Community 107 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 108 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 109 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 110 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 111 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 112 - "session-navigation-view.test.ts"
Cohesion: 0.33
Nodes (5): computers, first, grouped, hidden, last

### Community 114 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **660 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+655 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 993 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `session-resource-routes.test.ts`, `agent-service.ts`, `claude-agent-service.ts`, `queued-provider-dispatch.test.ts`, `SessionFileUpload`, `session-store.ts`, `directory-browser.ts`, `.sendAdmittedWithBackend`, `.clearSerialized`, `.replyUserInputInternal`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `SessionDetail`, `SessionFileUpload`, `queued-provider-dispatch.test.ts`, `session-store.ts`, `.clearSerialized`, `.replyUserInputInternal`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `app.ts` to `AgentService`, `SessionDetail`, `SessionKnowledgeStore`, `SessionStore`, `SessionService`, `computer-manager-metadata.test.ts`, `ComputerManager`, `delegated-transcription-service.ts`, `PushNotificationService`, `pwa.ts`, `SessionOrderStore`, `session-knowledge-routes.test.ts`, `transcription-service.ts`, `ProviderSessionService`, `TranscriptionError`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _660 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.056495301271420675 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04150268336314848 - nodes in this community are weakly interconnected._
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
- `public/fonts/MonaSans.woff2`
- `public/fonts/OFL.txt`
- `public/icon.svg`
- `public/icons/icon-192.png`
- `public/icons/icon-512-maskable.png`
- `public/icons/icon-512.png`
- `public/icons/relay-icon-1024.png`
- `public/icons/relay-icon-192.png`
- `public/icons/relay-icon-512.png`
- `public/manifest.webmanifest`
- `shell/README.md`
- `shell/index.html`
- `shell/src/settings.css`
- `src/index.css`
