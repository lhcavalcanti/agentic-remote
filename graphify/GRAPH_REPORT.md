# Agentic Remote - Graphify code map

Snapshot: `5da994a039b65ab5b17a73ef41165d12f8637b40b12331e73feeb55817722acb`

Source checkout: `fb5b76c73e912c009352006b6e57eed9f724beb7`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 231 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 231 files · ~463,377 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3483 nodes · 9820 edges · 144 communities (111 shown, 18 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 724 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- SessionDetail
- api.ts
- contracts.ts
- ClaudeAgentService
- claude-agent-service.ts
- background-task-adapter.ts
- AgentService
- .get
- agentic-remote-promotion-monitor
- agent-service.ts
- ComputerManager
- markdown-navigation.ts
- terminal-session.ts
- .readAfterWrites
- RemoteNodeClient
- TmuxTerminalSessionController
- bundle
- ProviderSessionService
- FakeSessionService
- lib.rs
- config.rs
- session-knowledge-routes.test.ts
- pwa.ts
- .drainNextTerminalPrompt
- SessionService
- devDependencies
- knowledge-tree.ts
- hub-routes.ts
- session-presentation.ts
- dependencies
- agentic-remote
- tmux-test-helpers.ts
- SessionKnowledgeStore
- tmux-errors.integration.test.ts
- agentic-remote-promotion-setup
- app.ts
- terminal-session.test.ts
- queued-provider-dispatch.test.ts
- session-resource-clear.test.ts
- SessionOrderStore
- CopilotSessionLike
- terminal-startup-queue.test.ts
- scripts
- shell.ts
- PushNotificationService
- session-resource-providers.test.ts
- compilerOptions
- transcription-service.ts
- session-store.ts
- CopilotClientLike
- normalizeKnowledgeRelativePath
- noTmuxServer
- capture-workspace.ts
- node-routes.ts
- session-clear-transcript.test.ts
- session-knowledge-store.ts
- compilerOptions
- BackgroundTaskSnapshot
- session-store-providers.test.ts
- NewSessionDialog
- compilerOptions
- check-workspace-review-regressions.ts
- KnowledgeStore
- session-enqueue-clear.test.ts
- compilerOptions
- workspace-browser.ts
- delegated-transcription-service.ts
- session-reply-durability.test.ts
- use-session-knowledge-root.ts
- react
- directory-browser.ts
- ReaderWorkspace
- recovery-resend-durability.test.ts
- SessionResources.tsx
- capture
- queued-dispatch.test.ts
- test-orchestration.test.ts
- shortPath
- workspace-fixtures.ts
- desktop.json
- registerSessionKnowledgeRoutes
- capture-workbench-review.ts
- package.json
- .oxlintrc.json
- settings-local.json
- TranscriptionService
- push-notification-service.ts
- TranscriptionError
- shell-notifications.ts
- scripts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- session-response-order.ts
- BackgroundTasksDialog.tsx
- html-preview.ts
- submission-error.ts
- session-knowledge-routes.ts
- setupWorkspaceFixture
- generate-pwa-icons.ts
- SessionFileUpload
- bridge.rs
- screenshot-stability.test.ts
- remote-node-client.test.ts
- session-admission-lifecycle.test.ts
- ResourceService
- KnowledgePosition
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- session-navigation-view.test.ts
- removeComputer
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
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
- `submit()` --indirect_call--> `provider()`  [INFERRED]
  src/App.tsx → server/provider-session-service.test.ts
- `composerKeyDown()` --indirect_call--> `composer()`  [INFERRED]
  src/App.tsx → server/terminal-send-uncertainty.test.ts
- `AcceptedSdkReply` --references--> `SessionDetail`  [EXTRACTED]
  server/agent-service.ts → shared/contracts.ts
- `PendingClaudeReply` --references--> `SessionDetail`  [EXTRACTED]
  server/claude-agent-service.ts → shared/contracts.ts
- `RemoteSessionListing` --references--> `ManagedSession`  [EXTRACTED]
  server/computer-manager.ts → shared/contracts.ts

## Import Cycles
- 4-file cycle: `server/computer-manager.ts -> server/remote-node-client.ts -> server/node-routes.ts -> server/file-upload-routes.ts -> server/computer-manager.ts`

## Communities (144 total, 18 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (133): submissionReceiptFromError(), terminalDraftConflictFromError(), deleteKnowledgeRoot(), moveSessionToTmux(), replyPermission(), replyUserInput(), restartSession(), saveSessionOrderLane() (+125 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (100): configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+92 more)

### Community 2 - "SessionDetail"
Cohesion: 0.05
Nodes (38): fixture(), connect(), createStore(), enqueue(), fixture(), recoveryFixture(), fixture(), claudeFixture() (+30 more)

### Community 3 - "api.ts"
Cohesion: 0.05
Nodes (88): parseSubmissionReceipt(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation(), definiteDispatchRefusals, deleteSession() (+80 more)

### Community 4 - "contracts.ts"
Cohesion: 0.04
Nodes (57): AgentServiceEvents, ClaudeAgentServiceEvents, RemoteResync, RemoteSessionListing, RemoteSessionRead, DirectoryScope, directories, AUDIO_FILENAME_HEADER (+49 more)

### Community 5 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (9): ClaudeAgentService, isMissingClaudeSessionError(), acceptanceReceipt(), answer(), claudeRequest(), copilotRequest(), QueuedPromptReservation, QueuedPromptDispatchResult (+1 more)

### Community 6 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (58): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+50 more)

### Community 7 - "background-task-adapter.ts"
Cohesion: 0.06
Nodes (67): DeferredSession, addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText() (+59 more)

### Community 8 - "AgentService"
Cohesion: 0.06
Nodes (9): AgentService, persistedFormAnswer(), RuntimeConfigurationError, TerminalFormContinuation, validateUserInputForm(), fixture(), TerminalFormReplyError, PendingUserInput (+1 more)

### Community 9 - ".get"
Cohesion: 0.08
Nodes (5): agentMode(), isMissingSessionError(), removeCopilotSessionFiles(), preparePrompt(), TranscriptObservation

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 11 - "agent-service.ts"
Cohesion: 0.06
Nodes (61): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, ansiSequence (+53 more)

### Community 12 - "ComputerManager"
Cohesion: 0.11
Nodes (11): ComputerManager, managedSession(), sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes(), SessionMuteCarrier, FakeManager, ComputerSummary (+3 more)

### Community 13 - "markdown-navigation.ts"
Cohesion: 0.06
Nodes (54): UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog() (+46 more)

### Community 14 - "terminal-session.ts"
Cohesion: 0.10
Nodes (50): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+42 more)

### Community 15 - ".readAfterWrites"
Cohesion: 0.10
Nodes (3): queueConflict(), QueuedDelivery, TerminalSessionController

### Community 16 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (6): RemoteNodeClient, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing, KnowledgeFolderState

### Community 17 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (12): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), processIsAlive(), safeWindowName(), submitTerminalForm() (+4 more)

### Community 18 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 20 - "FakeSessionService"
Cohesion: 0.07
Nodes (6): CreationRuntime, FakeSessionService, routingFixture(), session(), temporaryDirectory(), RuntimeReasoningEffort

### Community 21 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 22 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 23 - "session-knowledge-routes.test.ts"
Cohesion: 0.08
Nodes (19): ServerRole, fixture(), managers, releases, remote, session(), SessionMetadataLookup, ComputerRegistry (+11 more)

### Community 24 - "pwa.ts"
Cohesion: 0.11
Nodes (34): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate(), testNotification() (+26 more)

### Community 25 - ".drainNextTerminalPrompt"
Cohesion: 0.12
Nodes (3): isUncertainDelivery(), httpBoundary(), deliveryUncertaintyFromError()

### Community 27 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 28 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (32): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor(), knowledgeTreeKeyDown(), loadKnowledgeChain() (+24 more)

### Community 29 - "hub-routes.ts"
Cohesion: 0.07
Nodes (33): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+25 more)

### Community 30 - "session-presentation.ts"
Cohesion: 0.11
Nodes (28): SessionFilter, sessionNavigationView, attentionRank, computerTone(), matchesSessionSearch(), recentFirst(), sessionDay, sessionPresentation (+20 more)

### Community 31 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 32 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 33 - "tmux-test-helpers.ts"
Cohesion: 0.13
Nodes (26): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), horizontalFormFixture() (+18 more)

### Community 34 - "SessionKnowledgeStore"
Cohesion: 0.13
Nodes (10): bindingKey(), SessionKnowledgeConflictError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, disk, fixture(), fixtures, releases (+2 more)

### Community 35 - "tmux-errors.integration.test.ts"
Cohesion: 0.13
Nodes (30): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+22 more)

### Community 36 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 37 - "app.ts"
Cohesion: 0.11
Nodes (20): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+12 more)

### Community 38 - "terminal-session.test.ts"
Cohesion: 0.10
Nodes (27): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice() (+19 more)

### Community 39 - "queued-provider-dispatch.test.ts"
Cohesion: 0.10
Nodes (15): errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), QueuedDispatches, terminalRefused(), copilotSession() (+7 more)

### Community 40 - "session-resource-clear.test.ts"
Cohesion: 0.08
Nodes (23): ClaudeSdk, cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), deferred() (+15 more)

### Community 41 - "SessionOrderStore"
Cohesion: 0.16
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 42 - "CopilotSessionLike"
Cohesion: 0.10
Nodes (12): CopilotSessionLike, terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), CopilotTasksApi (+4 more)

### Community 43 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (23): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+15 more)

### Community 44 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 45 - "shell.ts"
Cohesion: 0.15
Nodes (24): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), onShellDeepLink(), onShellNotificationReply(), openShellSettings() (+16 more)

### Community 46 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 47 - "session-resource-providers.test.ts"
Cohesion: 0.12
Nodes (21): claudeFixture(), ClaudeMcpRead, deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures, Mcp (+13 more)

### Community 48 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 49 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 50 - "session-store.ts"
Cohesion: 0.09
Nodes (18): PendingTerminalQueueSettlement, TerminalDiscoveryError, activityDuration(), activityResultPreview(), archivedMessage(), DiscoveredSession, emptyRetirements, PendingChange (+10 more)

### Community 51 - "CopilotClientLike"
Cohesion: 0.09
Nodes (11): CopilotClientLike, holdProbe(), fixtures, gate(), releases, fixtures, recoverAndSeed(), releases (+3 more)

### Community 52 - "normalizeKnowledgeRelativePath"
Cohesion: 0.17
Nodes (18): knowledgeFileSchema, knowledgeRelativePathSchema, scopedKnowledgePath(), pathRecordSchema, joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath() (+10 more)

### Community 53 - "noTmuxServer"
Cohesion: 0.12
Nodes (14): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+6 more)

### Community 54 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 55 - "node-routes.ts"
Cohesion: 0.10
Nodes (20): configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, knowledgeFileQuerySchema, knowledgeQuerySchema (+12 more)

### Community 56 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 57 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (19): bindingSchema, Identity, PathRecord, pathRecordKey(), PathState, pathStateFor(), pathStateSchema, PersistedBinding (+11 more)

### Community 58 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 59 - "BackgroundTaskSnapshot"
Cohesion: 0.17
Nodes (9): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), hasActiveBackgroundTasks(), hasRunningBackgroundAgent(), BackgroundTask (+1 more)

### Community 60 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, releases, sdkSession() (+1 more)

### Community 61 - "NewSessionDialog"
Cohesion: 0.16
Nodes (20): activateSession(), createSession(), executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder() (+12 more)

### Community 62 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 63 - "check-workspace-review-regressions.ts"
Cohesion: 0.13
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 64 - "KnowledgeStore"
Cohesion: 0.18
Nodes (7): WorkspaceFixtureState, KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 65 - "session-enqueue-clear.test.ts"
Cohesion: 0.13
Nodes (15): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+7 more)

### Community 66 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 67 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 68 - "delegated-transcription-service.ts"
Cohesion: 0.16
Nodes (9): collect(), DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, AudioUpload, MAX_AUDIO_BYTES (+1 more)

### Community 69 - "session-reply-durability.test.ts"
Cohesion: 0.18
Nodes (14): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, fallbackFormFixture() (+6 more)

### Community 70 - "use-session-knowledge-root.ts"
Cohesion: 0.19
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 71 - "react"
Cohesion: 0.14
Nodes (9): react, DialogFrame(), MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram(), drawing, MermaidDiagram() (+1 more)

### Community 72 - "directory-browser.ts"
Cohesion: 0.28
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 73 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 74 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 75 - "SessionResources.tsx"
Cohesion: 0.14
Nodes (12): ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, Catalog, CatalogResult, sourceLabels (+4 more)

### Community 76 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 77 - "queued-dispatch.test.ts"
Cohesion: 0.14
Nodes (8): accept(), deferred(), disk, fixtures, holdWrite(), prompt(), releases, target

### Community 78 - "test-orchestration.test.ts"
Cohesion: 0.22
Nodes (10): ignoredDirectories, MachineAccess, MachineAccessClassification, machineAccessTestFiles, machineAccessTestManifest, machineAccessTestProject, parallelSafeTestProject, parallelTestExclude (+2 more)

### Community 79 - "shortPath"
Cohesion: 0.21
Nodes (11): KnowledgeRootSelector(), root, executionModeName(), providerName(), sessionActivityTime(), shortPath(), session, tasks (+3 more)

### Community 80 - "workspace-fixtures.ts"
Cohesion: 0.15
Nodes (13): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureComputers, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels (+5 more)

### Community 81 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 82 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

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

### Community 87 - "TranscriptionService"
Cohesion: 0.22
Nodes (5): BuildAppOptions, DelegatedTranscriptionOptions, registerTranscriptionRoutes(), transcriptionMultipartOptions, TranscriptionService

### Community 88 - "push-notification-service.ts"
Cohesion: 0.15
Nodes (10): brief(), PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 89 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 90 - "shell-notifications.ts"
Cohesion: 0.26
Nodes (10): key(), label(), NotifiableSession, notificationState(), requestId(), SessionNotificationState, ShellNotificationContext, shellNotifications() (+2 more)

### Community 91 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 92 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 93 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 94 - "session-response-order.ts"
Cohesion: 0.29
Nodes (10): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences, sessionResponseStartedAt() (+2 more)

### Community 95 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 96 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 97 - "submission-error.ts"
Cohesion: 0.31
Nodes (6): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, SubmissionError, SubmissionReceipt

### Community 98 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 99 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 100 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 102 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 103 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 104 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 105 - "session-admission-lifecycle.test.ts"
Cohesion: 0.25
Nodes (6): deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases

### Community 106 - "ResourceService"
Cohesion: 0.25
Nodes (4): dataDirectory(), pairedFixture(), rememberApp(), ResourceService

### Community 107 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 108 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 109 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 110 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 111 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 112 - "session-navigation-view.test.ts"
Cohesion: 0.33
Nodes (5): computers, first, grouped, hidden, last

### Community 113 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **662 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+657 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 997 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `contracts.ts`, `SessionFileUpload`, `claude-agent-service.ts`, `queued-provider-dispatch.test.ts`, `.get`, `agent-service.ts`, `.readAfterWrites`, `session-store.ts`, `.drainNextTerminalPrompt`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `copilot()` connect `session-store-providers.test.ts` to `AgentService`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionDetail` to `SessionFileUpload`, `claude-agent-service.ts`, `AgentService`, `.get`, `.readAfterWrites`, `.drainNextTerminalPrompt`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _662 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03657548125633232 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.027114647804302977 - nodes in this community are weakly interconnected._
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
