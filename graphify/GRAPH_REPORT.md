# Agentic Remote - Graphify code map

Snapshot: `39a48dfef8545dc0d2e285e47101196f1b5fcea4c7c9356642b347aed2f96744`

Source checkout: `03e952a2e458c729694d06d4cfe7658f44fb0ed8`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 230 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 230 files · ~469,885 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3521 nodes · 9985 edges · 157 communities (116 shown, 25 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 731 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- api.ts
- SessionDetail
- contracts.ts
- agent-service.ts
- session-resources.ts
- .get
- agentic-remote-promotion-monitor
- ComputerManager
- markdown-navigation.ts
- AgentService
- terminal-startup-queue.test.ts
- RemoteNodeClient
- .publish
- TmuxTerminalSessionController
- SessionService
- terminal-session.ts
- FakeSessionService
- bundle
- background-task-adapter.ts
- lib.rs
- ProviderSessionService
- pwa.ts
- shell.ts
- SessionKnowledgeStore
- queued-dispatch.test.ts
- config.rs
- hub-routes.ts
- knowledge-tree.ts
- devDependencies
- ClaudeAgentService
- agentic-remote
- dependencies
- agentic-remote-promotion-setup
- tmux-errors.integration.test.ts
- CopilotSessionLike
- session-knowledge-routes.test.ts
- SessionOrderStore
- node-routes.ts
- app.ts
- terminal-session.test.ts
- scripts
- KnowledgeStore
- PushNotificationService
- .replyUserInputInternal
- transcription-service.ts
- compilerOptions
- session-resource-clear.test.ts
- SessionNavigation.tsx
- CopilotClientLike
- NewSessionDialog
- capture-workspace.ts
- react
- delegated-transcription-service.ts
- .runQuery
- session-store-providers.test.ts
- session-presentation.ts
- session-clear-transcript.test.ts
- session-knowledge-store.ts
- compilerOptions
- session-enqueue-clear.test.ts
- session-store.ts
- compilerOptions
- check-workspace-review-regressions.ts
- compilerOptions
- event-log.ts
- workspace-browser.ts
- normalizeKnowledgeRelativePath
- .sendInternal
- recordValue
- directory-browser.ts
- submission-error.ts
- session-reply-durability.test.ts
- ReaderWorkspace
- .syncTranscripts
- background-task-stop.test.ts
- .dispatchAdmitted
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- session-resource-providers.test.ts
- queued-provider-dispatch.test.ts
- capture
- desktop.json
- registerSessionKnowledgeRoutes
- use-session-knowledge-root.ts
- BackgroundTasksDialog.tsx
- SessionResources.tsx
- capture-workbench-review.ts
- package.json
- workspace-fixtures.ts
- settings-local.json
- RuntimeModelOption
- push-notification-service.ts
- TranscriptionError
- session-response-order.ts
- scripts
- background-task-tracker.ts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- claude-agent-service.test.ts
- session-knowledge-routes.ts
- setupWorkspaceFixture
- node:fs/promises
- generate-pwa-icons.ts
- DeferredSession
- .replyUserInput
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- remote-node-client.test.ts
- tmux-errors.test.ts
- claude-recovery-admission.test.ts
- release-publication.test.ts
- SessionFileUpload
- transcription-routes.ts
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- session-navigation-view.test.ts
- removeComputer
- promotion-setup-execution.test.ts
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- version-policy.test.ts
- MockWebSocket
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
1. `SessionDetail` - 282 edges
2. `App()` - 248 edges
3. `AgentService` - 219 edges
4. `SessionStore` - 150 edges
5. `ClaudeAgentService` - 119 edges
6. `ComputerManager` - 81 edges
7. `registerHubRoutes()` - 75 edges
8. `SessionService` - 71 edges
9. `RemoteNodeClient` - 66 edges
10. `TmuxTerminalSessionController` - 60 edges

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

## Communities (157 total, 25 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (123): submissionReceiptFromError(), saveSessionOrderLane(), transcribeAudio(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown() (+115 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (98): ActivityStatus, configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+90 more)

### Community 2 - "api.ts"
Cohesion: 0.04
Nodes (99): AddKnowledgeRootInput, PushSettings, addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation(), definiteDispatchRefusals (+91 more)

### Community 3 - "SessionDetail"
Cohesion: 0.06
Nodes (30): fixture(), PendingClaudeReply, connect(), createStore(), fixture(), recoveryFixture(), fixture(), fixture() (+22 more)

### Community 4 - "contracts.ts"
Cohesion: 0.07
Nodes (58): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, fixture() (+50 more)

### Community 5 - "agent-service.ts"
Cohesion: 0.05
Nodes (69): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+61 more)

### Community 6 - "session-resources.ts"
Cohesion: 0.07
Nodes (50): ActiveClaudeQuery, releases, session, snapshot, claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills (+42 more)

### Community 7 - ".get"
Cohesion: 0.09
Nodes (4): isUncertainDelivery(), preparePrompt(), queueConflict(), deliveryUncertaintyFromError()

### Community 8 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 9 - "ComputerManager"
Cohesion: 0.11
Nodes (9): ComputerManager, managedSession(), RemoteSessionListing, sessionAtLeastAsNew(), registerHubRoutes(), SessionMuteCarrier, ComputerSummary, ManagedRemovedQueuedPrompt (+1 more)

### Community 10 - "markdown-navigation.ts"
Cohesion: 0.06
Nodes (54): UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog() (+46 more)

### Community 11 - "AgentService"
Cohesion: 0.07
Nodes (5): agentMode(), AgentService, RuntimeConfigurationError, fixture(), httpBoundary()

### Community 12 - "terminal-startup-queue.test.ts"
Cohesion: 0.07
Nodes (41): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), horizontalFormFixture() (+33 more)

### Community 13 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (7): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, NodeInfo, WorkspaceFile, WorkspaceListing

### Community 14 - ".publish"
Cohesion: 0.08
Nodes (4): isMissingSessionError(), removeCopilotSessionFiles(), TerminalSessionController, SessionRuntimeInfo

### Community 15 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (14): copilotCommand(), execFileAsync, formViewportTimeout(), listTmuxSessions(), processAncestors(), processCommand(), processIsAlive(), safeWindowName() (+6 more)

### Community 16 - "SessionService"
Cohesion: 0.08
Nodes (3): registerNodeRoutes(), isSessionResourceRoute(), SessionService

### Community 17 - "terminal-session.ts"
Cohesion: 0.11
Nodes (46): activeBottomFrame(), boxedComposerFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFrameText(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity() (+38 more)

### Community 18 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 19 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 20 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (39): attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), CopilotTaskInfo, CopilotTaskProgress, eventString() (+31 more)

### Community 21 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 23 - "pwa.ts"
Cohesion: 0.10
Nodes (36): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+28 more)

### Community 24 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 25 - "SessionKnowledgeStore"
Cohesion: 0.11
Nodes (14): WorkspaceFixtureState, bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeEvents, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture() (+6 more)

### Community 26 - "queued-dispatch.test.ts"
Cohesion: 0.08
Nodes (20): errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDelivery, QueuedDispatches, QueuedDispatchTarget (+12 more)

### Community 27 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 28 - "hub-routes.ts"
Cohesion: 0.06
Nodes (36): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+28 more)

### Community 29 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (33): WorkspaceEntry, listKnowledgeEntries(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+25 more)

### Community 30 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 32 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 33 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 34 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (30): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+22 more)

### Community 35 - "tmux-errors.integration.test.ts"
Cohesion: 0.13
Nodes (30): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+22 more)

### Community 36 - "CopilotSessionLike"
Cohesion: 0.10
Nodes (13): CopilotSessionLike, terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), CopilotTasksApi (+5 more)

### Community 37 - "session-knowledge-routes.test.ts"
Cohesion: 0.10
Nodes (12): SessionMetadataLookup, ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore, disk, FakeManager, fixtures (+4 more)

### Community 38 - "SessionOrderStore"
Cohesion: 0.16
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 39 - "node-routes.ts"
Cohesion: 0.08
Nodes (26): MAX_SESSION_FILE_BYTES, SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema (+18 more)

### Community 40 - "app.ts"
Cohesion: 0.12
Nodes (18): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+10 more)

### Community 41 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (22): composerHoldsOtherText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), pasteCouldCollapse(), pastedPlaceholderCount() (+14 more)

### Community 42 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 43 - "KnowledgeStore"
Cohesion: 0.17
Nodes (7): KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 44 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 45 - ".replyUserInputInternal"
Cohesion: 0.17
Nodes (6): persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), TerminalFormReplyError, PendingUserInput, UserInputReplyInput

### Community 46 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 47 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 48 - "session-resource-clear.test.ts"
Cohesion: 0.11
Nodes (20): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+12 more)

### Community 49 - "SessionNavigation.tsx"
Cohesion: 0.13
Nodes (19): SessionFilter, sessionNavigationView, matchesSessionSearch(), sessionPresentation, SessionSort, sessionSortFrom(), taskSnapshot(), PendingSessionCreation (+11 more)

### Community 50 - "CopilotClientLike"
Cohesion: 0.09
Nodes (11): CopilotClientLike, holdProbe(), fixtures, gate(), releases, fixtures, recoverAndSeed(), releases (+3 more)

### Community 51 - "NewSessionDialog"
Cohesion: 0.14
Nodes (23): provider(), activateSession(), createSession(), executeCommand(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory() (+15 more)

### Community 52 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 53 - "react"
Cohesion: 0.10
Nodes (17): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+9 more)

### Community 54 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (11): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+3 more)

### Community 55 - ".runQuery"
Cohesion: 0.13
Nodes (4): isClaudeAuthenticationError(), isMissingClaudeSessionError(), cleanupFixtures(), toolResultText()

### Community 56 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 57 - "session-presentation.ts"
Cohesion: 0.15
Nodes (18): KnowledgeRootSelector(), root, attentionRank, computerTone(), executionModeName(), recentFirst(), sessionActivityTime(), sessionDay (+10 more)

### Community 58 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 59 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+11 more)

### Community 60 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 61 - "session-enqueue-clear.test.ts"
Cohesion: 0.13
Nodes (16): ClaudeSdk, deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, disk (+8 more)

### Community 62 - "session-store.ts"
Cohesion: 0.11
Nodes (16): activityDuration(), activityResultPreview(), archivedMessage(), DiscoveredSession, emptyRetirements, PendingChange, RecoveryResend, RecoverySeed (+8 more)

### Community 63 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 64 - "check-workspace-review-regressions.ts"
Cohesion: 0.13
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 65 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 66 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 67 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 68 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 69 - ".sendInternal"
Cohesion: 0.30
Nodes (13): capturePane(), captureTerminalCursor(), composerHoldsText(), composerText(), isTerminalAgentWorking(), isTerminalOverlay(), isTerminalSessionInUsePrompt(), losslessComposerText() (+5 more)

### Community 70 - "recordValue"
Cohesion: 0.20
Nodes (17): addActivity(), boundedText(), errorValue(), notificationKind(), parsedValue(), recordValue(), shellExitFromValue(), shellIdFromFooter() (+9 more)

### Community 71 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 72 - "submission-error.ts"
Cohesion: 0.21
Nodes (11): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), parseTerminalDraftRecovery(), SubmissionError, SubmissionReceipt (+3 more)

### Community 73 - "session-reply-durability.test.ts"
Cohesion: 0.20
Nodes (13): assistantFixture(), claudeFixture(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, fallbackFormFixture(), fixtures (+5 more)

### Community 74 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 75 - ".syncTranscripts"
Cohesion: 0.18
Nodes (5): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), TranscriptObservation, SessionStatus

### Community 76 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 78 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 79 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 81 - "session-resource-providers.test.ts"
Cohesion: 0.20
Nodes (13): claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures (+5 more)

### Community 82 - "queued-provider-dispatch.test.ts"
Cohesion: 0.17
Nodes (9): claudeFixture(), copilotFixture(), copilotSession(), fixtures, gate(), originalQueue, pause(), releases (+1 more)

### Community 83 - "capture"
Cohesion: 0.20
Nodes (14): releaseRecording(), shortcutKeys(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode(), keyLabel() (+6 more)

### Community 84 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 85 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 86 - "use-session-knowledge-root.ts"
Cohesion: 0.23
Nodes (10): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), updateSessionKnowledgeRoot(), bindingKey(), knowledgePositionForBinding(), SessionIdentity, first, root (+2 more)

### Community 87 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 88 - "SessionResources.tsx"
Cohesion: 0.16
Nodes (9): providerName(), Catalog, CatalogResult, SessionResources(), sourceLabels, statusLabels, mcp, session (+1 more)

### Community 89 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 90 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 91 - "workspace-fixtures.ts"
Cohesion: 0.17
Nodes (12): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels, runtime (+4 more)

### Community 92 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 94 - "push-notification-service.ts"
Cohesion: 0.15
Nodes (10): brief(), PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 95 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 96 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 97 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 98 - "background-task-tracker.ts"
Cohesion: 0.30
Nodes (6): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 99 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 100 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 101 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 102 - "claude-agent-service.test.ts"
Cohesion: 0.20
Nodes (5): directories, fixture(), queryHandle(), services, waitForIdle()

### Community 103 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 104 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 105 - "node:fs/promises"
Cohesion: 0.27
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 106 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 108 - ".replyUserInput"
Cohesion: 0.33
Nodes (4): answer(), claudeQuestions(), claudeRequest(), copilotRequest()

### Community 109 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 110 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 111 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 112 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 113 - "tmux-errors.test.ts"
Cohesion: 0.25
Nodes (6): directories, { execute }, files, links, listener(), server()

### Community 114 - "claude-recovery-admission.test.ts"
Cohesion: 0.29
Nodes (6): deferred(), disk, enqueue(), fixtures, holdClaimWrite(), releases

### Community 115 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 118 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 119 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 120 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 121 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 122 - "session-navigation-view.test.ts"
Cohesion: 0.33
Nodes (5): computers, first, grouped, hidden, last

### Community 123 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **665 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+660 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1003 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `contracts.ts`, `agent-service.ts`, `session-resources.ts`, `.get`, `.syncTranscripts`, `.replyUserInputInternal`, `.publish`, `.discoverSessions`, `SessionFileUpload`, `queued-dispatch.test.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `fixture()` connect `SessionDetail` to `event-log.ts`, `tmux-errors.integration.test.ts`, `AgentService`, `terminal-startup-queue.test.ts`, `TmuxTerminalSessionController`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `session-resources.ts`, `.get`, `.syncTranscripts`, `AgentService`, `.replyUserInputInternal`, `.dispatchAdmitted`, `.publish`, `.discoverSessions`, `SessionFileUpload`, `session-store-providers.test.ts`, `session-store.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _665 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04086905460951262 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.02776506483600305 - nodes in this community are weakly interconnected._
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
