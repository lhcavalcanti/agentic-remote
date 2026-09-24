# Agentic Remote - Graphify code map

Snapshot: `4875c849fbb5e2c070b1c62e22e93ce1fcdf385e796d1fc3fcc4ac154036dbfa`

Source checkout: `c3fce4f85331366337112cd0436848fa0ae8a0a2`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 230 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 230 files · ~466,146 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3497 nodes · 9850 edges · 144 communities (110 shown, 19 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 723 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- api.ts
- ClaudeAgentService
- SessionStore
- AgentService
- session-resources.ts
- SessionService
- background-task-adapter.ts
- agent-service.ts
- contracts.ts
- agentic-remote-promotion-monitor
- markdown-navigation.ts
- .readAfterWrites
- SessionDetail
- RemoteNodeClient
- hub-routes.ts
- queued-dispatch.test.ts
- tmux-errors.integration.test.ts
- terminal-session.test.ts
- terminal-session.ts
- TmuxTerminalSessionController
- ProviderSessionService
- FakeSessionService
- bundle
- claude-agent-service.ts
- lib.rs
- shell.ts
- config.rs
- session-knowledge-routes.test.ts
- pwa.ts
- workspace-browser.ts
- devDependencies
- agentic-remote
- dependencies
- .get
- node-routes.ts
- registerHubRoutes
- agentic-remote-promotion-setup
- terminal-startup-queue.test.ts
- ComputerManager
- delegated-transcription-service.ts
- .sendInternal
- scripts
- PushNotificationService
- transcription-service.ts
- compilerOptions
- SessionNavigation.tsx
- react
- NewSessionDialog
- session-presentation.ts
- capture-workspace.ts
- app.ts
- knowledgePathChain
- compilerOptions
- session-resource-routes.test.ts
- CopilotSessionLike
- BackgroundTaskSnapshot
- compilerOptions
- compilerOptions
- NodeIdentityStore
- session-knowledge-store.ts
- SessionKnowledgeStore
- use-session-knowledge-root.ts
- claude-recovery-admission.test.ts
- session-clear-transcript.test.ts
- session-reply-durability.test.ts
- session-store-providers.test.ts
- ReaderWorkspace
- workspace-fixtures.ts
- CopilotClientLike
- recovery-resend-durability.test.ts
- session-store.ts
- capture
- check-workspace-review-regressions.ts
- desktop.json
- BackgroundTasksDialog.tsx
- SessionResources.tsx
- capture-workbench-review.ts
- package.json
- settings-local.json
- push-notification-service.ts
- registerSessionKnowledgeRoutes
- TranscriptionError
- session-response-order.ts
- scripts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- session-resource-clear.test.ts
- html-preview.ts
- submission-error.ts
- session-knowledge-routes.ts
- session-resource-providers.test.ts
- session-resource-transport.ts
- setupWorkspaceFixture
- session-knowledge-store.test.ts
- generate-pwa-icons.ts
- DeferredSession
- session-enqueue-clear.test.ts
- .persist
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- ChatMessage
- session-store-durability.test.ts
- release-publication.test.ts
- SessionFileUpload
- agent-service-recovery.test.ts
- settings.ts
- composer-layout.test.ts
- MarkdownCodeBlock.tsx
- session-navigation-view.test.ts
- removeComputer
- promotion-setup-execution.test.ts
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
1. `SessionDetail` - 275 edges
2. `App()` - 245 edges
3. `AgentService` - 217 edges
4. `SessionStore` - 150 edges
5. `ClaudeAgentService` - 118 edges
6. `ComputerManager` - 80 edges
7. `registerHubRoutes()` - 74 edges
8. `SessionService` - 70 edges
9. `RemoteNodeClient` - 65 edges
10. `TmuxTerminalSessionController` - 59 edges

## Surprising Connections (you probably didn't know these)
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `AgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `ClaudeAgentServiceEvents` --references--> `ServerEvent`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (144 total, 19 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (116): terminalDraftConflictFromError(), saveSessionOrderLane(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot() (+108 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (102): ActivityStatus, configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+94 more)

### Community 2 - "api.ts"
Cohesion: 0.04
Nodes (101): AddKnowledgeRootInput, PushSettings, parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession() (+93 more)

### Community 3 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (18): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+10 more)

### Community 4 - "SessionStore"
Cohesion: 0.05
Nodes (30): fixture(), connect(), createStore(), enqueue(), fixture(), recoveryFixture(), fixture(), claudeFixture() (+22 more)

### Community 5 - "AgentService"
Cohesion: 0.06
Nodes (6): agentMode(), AgentService, isMissingSessionError(), RuntimeConfigurationError, fixture(), httpBoundary()

### Community 6 - "session-resources.ts"
Cohesion: 0.07
Nodes (56): ActiveClaudeQuery, ClaudeResources, releases, session, snapshot, claudeMcp(), claudeSkillNames(), copilotMcp (+48 more)

### Community 7 - "SessionService"
Cohesion: 0.07
Nodes (8): managedSession(), RemoteSessionListing, SessionMetadataLookup, registerNodeRoutes(), SessionService, ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 8 - "background-task-adapter.ts"
Cohesion: 0.07
Nodes (69): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), CopilotTaskInfo (+61 more)

### Community 9 - "agent-service.ts"
Cohesion: 0.05
Nodes (67): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+59 more)

### Community 10 - "contracts.ts"
Cohesion: 0.07
Nodes (50): CreationRuntime, ComputerManagerEvents, managers, releases, remote, RegistryState, directories, StoredNodeIdentity (+42 more)

### Community 11 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 12 - "markdown-navigation.ts"
Cohesion: 0.06
Nodes (54): followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), workspaceAbsolutePath(), WorkspaceDialog(), moveHere() (+46 more)

### Community 13 - ".readAfterWrites"
Cohesion: 0.08
Nodes (4): isUncertainDelivery(), queueConflict(), TerminalSessionController, deliveryUncertaintyFromError()

### Community 14 - "SessionDetail"
Cohesion: 0.08
Nodes (5): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), SessionDetail, SessionStatus

### Community 15 - "RemoteNodeClient"
Cohesion: 0.05
Nodes (11): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, client(), servers, session, NodeInfo (+3 more)

### Community 16 - "hub-routes.ts"
Cohesion: 0.06
Nodes (50): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+42 more)

### Community 17 - "queued-dispatch.test.ts"
Cohesion: 0.06
Nodes (29): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), QueuedDelivery (+21 more)

### Community 18 - "tmux-errors.integration.test.ts"
Cohesion: 0.07
Nodes (43): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+35 more)

### Community 19 - "terminal-session.test.ts"
Cohesion: 0.07
Nodes (42): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), horizontalFormFixture() (+34 more)

### Community 20 - "terminal-session.ts"
Cohesion: 0.10
Nodes (45): activeBottomFrame(), boxedComposerFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFrameText(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity() (+37 more)

### Community 21 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (13): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), terminalChecklistState() (+5 more)

### Community 23 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 24 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 25 - "claude-agent-service.ts"
Cohesion: 0.09
Nodes (26): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+18 more)

### Community 26 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 27 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 28 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 29 - "session-knowledge-routes.test.ts"
Cohesion: 0.10
Nodes (15): WorkspaceFixtureState, ServerRole, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, disk, FakeManager (+7 more)

### Community 30 - "pwa.ts"
Cohesion: 0.11
Nodes (34): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+26 more)

### Community 31 - "workspace-browser.ts"
Cohesion: 0.10
Nodes (29): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+21 more)

### Community 32 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 33 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 34 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 35 - ".get"
Cohesion: 0.13
Nodes (4): removeCopilotSessionFiles(), clearFixture(), copilot(), terminalClearFixture()

### Community 36 - "node-routes.ts"
Cohesion: 0.07
Nodes (28): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+20 more)

### Community 37 - "registerHubRoutes"
Cohesion: 0.15
Nodes (14): registerHubRoutes(), SessionMuteCarrier, directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane() (+6 more)

### Community 38 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (30): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+22 more)

### Community 39 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (26): findActiveCopilotSessions(), appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs (+18 more)

### Community 40 - "ComputerManager"
Cohesion: 0.16
Nodes (7): ComputerManager, fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, createHub(), ComputerSummary

### Community 41 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (13): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, transcriptionComputerName() (+5 more)

### Community 42 - ".sendInternal"
Cohesion: 0.17
Nodes (20): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), hasComposerAfter(), hasLiveTerminalComposer(), isTerminalAgentWorking() (+12 more)

### Community 43 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 44 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 45 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 46 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 47 - "SessionNavigation.tsx"
Cohesion: 0.13
Nodes (19): SessionFilter, sessionNavigationView, matchesSessionSearch(), sessionPresentation, SessionSort, sessionSortFrom(), taskSnapshot(), PendingSessionCreation (+11 more)

### Community 48 - "react"
Cohesion: 0.10
Nodes (17): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+9 more)

### Community 49 - "NewSessionDialog"
Cohesion: 0.14
Nodes (22): provider(), activateSession(), createSession(), executeCommand(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory() (+14 more)

### Community 50 - "session-presentation.ts"
Cohesion: 0.15
Nodes (18): KnowledgeRootSelector(), root, attentionRank, computerTone(), executionModeName(), recentFirst(), sessionActivityTime(), sessionDay (+10 more)

### Community 51 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 52 - "app.ts"
Cohesion: 0.15
Nodes (13): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+5 more)

### Community 53 - "knowledgePathChain"
Cohesion: 0.15
Nodes (21): listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown() (+13 more)

### Community 54 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 55 - "session-resource-routes.test.ts"
Cohesion: 0.12
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 56 - "CopilotSessionLike"
Cohesion: 0.13
Nodes (8): CopilotSessionLike, terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), CopilotTasksApi

### Community 57 - "BackgroundTaskSnapshot"
Cohesion: 0.17
Nodes (9): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), hasActiveBackgroundTasks(), hasRunningBackgroundAgent(), BackgroundTask (+1 more)

### Community 58 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 59 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 60 - "NodeIdentityStore"
Cohesion: 0.17
Nodes (5): BuildAppOptions, ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 61 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (18): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+10 more)

### Community 62 - "SessionKnowledgeStore"
Cohesion: 0.26
Nodes (3): bindingKey(), SessionKnowledgeStore, SessionKnowledgeBinding

### Community 63 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 64 - "claude-recovery-admission.test.ts"
Cohesion: 0.13
Nodes (12): ClaudeSdk, deferred(), disk, fixtures, holdClaimWrite(), releases, deferred(), disk (+4 more)

### Community 65 - "session-clear-transcript.test.ts"
Cohesion: 0.14
Nodes (6): SessionAdmissions, disk, fixtures, gate(), holdTurnWrite(), releases

### Community 66 - "session-reply-durability.test.ts"
Cohesion: 0.19
Nodes (13): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, fixtures (+5 more)

### Community 67 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (6): claude(), disk, event(), fixtures, releases, sdkSession()

### Community 68 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 69 - "workspace-fixtures.ts"
Cohesion: 0.16
Nodes (14): CONTEXT_EXAMPLE, documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureKnowledgeRoots (+6 more)

### Community 70 - "CopilotClientLike"
Cohesion: 0.12
Nodes (7): CopilotClientLike, fixtures, recoverAndSeed(), releases, boots, [directory, backend, resultPath, phase = 'idle'], fixtureRoot

### Community 71 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 72 - "session-store.ts"
Cohesion: 0.12
Nodes (14): activityDuration(), activityResultPreview(), archivedMessage(), DiscoveredSession, emptyRetirements, PendingChange, PendingMutation, RecoveryResend (+6 more)

### Community 73 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 74 - "check-workspace-review-regressions.ts"
Cohesion: 0.14
Nodes (12): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+4 more)

### Community 75 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 76 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 77 - "SessionResources.tsx"
Cohesion: 0.16
Nodes (9): providerName(), Catalog, CatalogResult, SessionResources(), sourceLabels, statusLabels, mcp, session (+1 more)

### Community 78 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 79 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 80 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 81 - "push-notification-service.ts"
Cohesion: 0.15
Nodes (10): brief(), PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 82 - "registerSessionKnowledgeRoutes"
Cohesion: 0.33
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 83 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 84 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 85 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 86 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 87 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 88 - "session-resource-clear.test.ts"
Cohesion: 0.18
Nodes (11): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+3 more)

### Community 89 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 90 - "submission-error.ts"
Cohesion: 0.31
Nodes (6): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, SubmissionError, SubmissionReceipt

### Community 91 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 92 - "session-resource-providers.test.ts"
Cohesion: 0.20
Nodes (10): ClaudeMcpRead, deferred(), DiscoveredMcp, DiscoveredSkills, fixtures, Mcp, pause(), releases (+2 more)

### Community 93 - "session-resource-transport.ts"
Cohesion: 0.27
Nodes (8): CopilotResourceClient, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 94 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 95 - "session-knowledge-store.test.ts"
Cohesion: 0.22
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 96 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 98 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 99 - ".persist"
Cohesion: 0.24
Nodes (3): SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, stateWithPaths()

### Community 100 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 101 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 102 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 103 - "ChatMessage"
Cohesion: 0.31
Nodes (6): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, StoredSession, ChatMessage

### Community 104 - "session-store-durability.test.ts"
Cohesion: 0.31
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 105 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 107 - "agent-service-recovery.test.ts"
Cohesion: 0.29
Nodes (4): holdProbe(), fixtures, gate(), releases

### Community 108 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 109 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 110 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 111 - "session-navigation-view.test.ts"
Cohesion: 0.33
Nodes (5): computers, first, grouped, hidden, last

### Community 112 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **662 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+657 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1001 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `.get`, `SessionStore`, `ClaudeAgentService`, `session-resources.ts`, `agent-service.ts`, `SessionFileUpload`, `.readAfterWrites`, `SessionDetail`, `queued-dispatch.test.ts`, `session-resource-routes.test.ts`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `ClaudeAgentService` connect `ClaudeAgentService` to `.get`, `SessionStore`, `session-resources.ts`, `SessionService`, `contracts.ts`, `SessionFileUpload`, `.readAfterWrites`, `queued-dispatch.test.ts`, `session-resource-routes.test.ts`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `.get`, `ClaudeAgentService`, `AgentService`, `SessionFileUpload`, `.readAfterWrites`, `SessionDetail`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _662 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.042486231313926044 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.027773821392963964 - nodes in this community are weakly interconnected._
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
