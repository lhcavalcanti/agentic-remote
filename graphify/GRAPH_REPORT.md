# Agentic Remote - Graphify code map

Snapshot: `b9732276799f36d7e7e7c8971b7a1cf61e3f22f2543ea811080ecd7609bcfe5a`

Source checkout: `47cb59ee0dede45f2d9282a0b294c3a8c20fc4f6`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 227 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 227 files · ~458,592 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3460 nodes · 9748 edges · 143 communities (110 shown, 19 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 722 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- api.ts
- App
- App.tsx
- ClaudeAgentService
- background-task-adapter.ts
- SessionStore
- session-resources.ts
- .readAfterWrites
- .get
- AgentService
- agentic-remote-promotion-monitor
- markdown-navigation.ts
- terminal-session.ts
- queued-dispatch.test.ts
- agent-service.ts
- SessionDetail
- contracts.ts
- RemoteNodeClient
- terminal-session.test.ts
- computer-manager.ts
- TmuxTerminalSessionController
- ManagedSession
- bundle
- lib.rs
- ProviderSessionService
- shell.ts
- SessionService
- pwa.ts
- config.rs
- hub-routes.ts
- knowledge-tree.ts
- claude-agent-service.ts
- devDependencies
- FakeSessionService
- dependencies
- agentic-remote
- node-routes.ts
- tmux-errors.integration.test.ts
- agentic-remote-promotion-setup
- terminal-startup-queue.test.ts
- agent-service.test.ts
- registerHubRoutes
- delegated-transcription-service.ts
- scripts
- PushNotificationService
- CopilotClientLike
- transcription-service.ts
- session-presentation.ts
- compilerOptions
- SessionOrderStore
- recordValue
- app.ts
- ComputerManager
- session-store-providers.test.ts
- noTmuxServer
- capture-workspace.ts
- session-clear-transcript.test.ts
- compilerOptions
- session-resource-routes.test.ts
- compilerOptions
- check-workspace-review-regressions.ts
- compilerOptions
- session-knowledge-store.ts
- SessionKnowledgeStore
- workspace-browser.ts
- NodeIdentityStore
- session-reply-durability.test.ts
- ReaderWorkspace
- recovery-resend-durability.test.ts
- capture
- SessionNavigation.test.tsx
- SessionResources.tsx
- workspace-fixtures.ts
- desktop.json
- normalizeKnowledgeRelativePath
- capture-workbench-review.ts
- package.json
- settings-local.json
- push-notification-service.ts
- registerSessionKnowledgeRoutes
- TranscriptionError
- listDirectories
- session-response-order.ts
- react
- scripts
- CopilotSessionLike
- session-knowledge-routes.test.ts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- session-resource-clear.test.ts
- html-preview.ts
- session-enqueue-clear.test.ts
- session-knowledge-routes.ts
- .oxlintrc.json
- generate-pwa-icons.ts
- .persist
- session-resource-transport.ts
- bridge.rs
- setupWorkspaceFixture
- screenshot-stability.test.ts
- node:fs/promises
- session-admission-lifecycle.test.ts
- session-knowledge-store.test.ts
- KnowledgePosition
- SessionFileUpload
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- MarkdownCodeBlock.tsx
- session-navigation-view.test.ts
- KnowledgeRootChoices.test.tsx
- RuntimeModelOption
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
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
2. `App()` - 241 edges
3. `AgentService` - 217 edges
4. `SessionStore` - 150 edges
5. `ClaudeAgentService` - 118 edges
6. `ComputerManager` - 80 edges
7. `registerHubRoutes()` - 74 edges
8. `SessionService` - 70 edges
9. `RemoteNodeClient` - 65 edges
10. `TmuxTerminalSessionController` - 56 edges

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

## Communities (143 total, 19 thin omitted)

### Community 0 - "api.ts"
Cohesion: 0.03
Nodes (125): parseSubmissionReceipt(), submissionReceiptFromError(), activateSession(), addComputer(), addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession() (+117 more)

### Community 1 - "App"
Cohesion: 0.04
Nodes (121): restartSession(), saveSessionOrderLane(), setSessionNotificationsMuted(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown() (+113 more)

### Community 2 - "App.tsx"
Cohesion: 0.03
Nodes (94): AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph(), activityStatusLabel() (+86 more)

### Community 3 - "ClaudeAgentService"
Cohesion: 0.04
Nodes (24): ClaudeAgentService, isMissingClaudeSessionError(), cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle() (+16 more)

### Community 4 - "background-task-adapter.ts"
Cohesion: 0.05
Nodes (82): addActivity(), attachmentModeValue(), backgroundHandoff(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), booleanValue(), boundedText(), errorValue() (+74 more)

### Community 5 - "SessionStore"
Cohesion: 0.05
Nodes (47): fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures (+39 more)

### Community 6 - "session-resources.ts"
Cohesion: 0.07
Nodes (55): ClaudeResources, releases, session, snapshot, claudeMcp(), claudeSkillNames(), copilotMcp, copilotSkills (+47 more)

### Community 7 - ".readAfterWrites"
Cohesion: 0.07
Nodes (5): isUncertainDelivery(), queueConflict(), TerminalSessionController, PendingUserInput, deliveryUncertaintyFromError()

### Community 8 - ".get"
Cohesion: 0.07
Nodes (7): agentMode(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isMissingSessionError(), removeCopilotSessionFiles(), statusFromEvents(), TranscriptObservation

### Community 9 - "AgentService"
Cohesion: 0.07
Nodes (10): AgentService, persistedFormAnswer(), RuntimeConfigurationError, TerminalFormContinuation, validateUserInputForm(), fixture(), httpBoundary(), DiscoveredSession (+2 more)

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 11 - "markdown-navigation.ts"
Cohesion: 0.06
Nodes (54): UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog() (+46 more)

### Community 12 - "terminal-session.ts"
Cohesion: 0.10
Nodes (57): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText() (+49 more)

### Community 13 - "queued-dispatch.test.ts"
Cohesion: 0.06
Nodes (29): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), QueuedDelivery (+21 more)

### Community 14 - "agent-service.ts"
Cohesion: 0.04
Nodes (49): AcceptedSdkReply, ActivePrompt, activityDuration(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+41 more)

### Community 15 - "SessionDetail"
Cohesion: 0.08
Nodes (3): observe(), QueuedPrompt, SessionDetail

### Community 16 - "contracts.ts"
Cohesion: 0.07
Nodes (27): ClaudeAgentServiceEvents, directories, ProviderSessionServiceEvents, provider(), RemoteNodeClientEvents, ActivityStatus, AddKnowledgeRootInput, AgentProvider (+19 more)

### Community 17 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (9): RemoteNodeClient, hasRunningBackgroundAgent(), BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing, KnowledgeFolderState (+1 more)

### Community 18 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (40): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), horizontalFormFixture() (+32 more)

### Community 19 - "computer-manager.ts"
Cohesion: 0.06
Nodes (30): managers, releases, remote, RemoteResync, RemoteSessionRead, RegistryState, StoredNodeIdentity, DEFINITE_DISPATCH_REFUSALS (+22 more)

### Community 20 - "TmuxTerminalSessionController"
Cohesion: 0.11
Nodes (14): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), processIsAlive(), safeWindowName(), submitTerminalForm() (+6 more)

### Community 21 - "ManagedSession"
Cohesion: 0.10
Nodes (4): managedSession(), RemoteSessionListing, ManagedSession, SessionListing

### Community 22 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 23 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 25 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 26 - "SessionService"
Cohesion: 0.08
Nodes (3): registerNodeRoutes(), SessionService, ManagedRemovedQueuedPrompt

### Community 27 - "pwa.ts"
Cohesion: 0.10
Nodes (35): deletePushSubscription(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+27 more)

### Community 28 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 29 - "hub-routes.ts"
Cohesion: 0.06
Nodes (36): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+28 more)

### Community 30 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (34): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+26 more)

### Community 31 - "claude-agent-service.ts"
Cohesion: 0.11
Nodes (23): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+15 more)

### Community 32 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 33 - "FakeSessionService"
Cohesion: 0.08
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 34 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 35 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 36 - "node-routes.ts"
Cohesion: 0.08
Nodes (27): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+19 more)

### Community 37 - "tmux-errors.integration.test.ts"
Cohesion: 0.14
Nodes (29): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+21 more)

### Community 38 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 39 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (26): findActiveCopilotSessions(), appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs (+18 more)

### Community 40 - "agent-service.test.ts"
Cohesion: 0.08
Nodes (11): terminalFormSteps(), configurableModel(), DeferredSession, directories, FakeCopilotClient, services, startupFifoFixture(), CopilotTaskInfo (+3 more)

### Community 41 - "registerHubRoutes"
Cohesion: 0.13
Nodes (11): WorkspaceFixtureState, registerHubRoutes(), SessionMuteCarrier, KnowledgeState, KnowledgeStore, directories, fixture(), directories (+3 more)

### Community 42 - "delegated-transcription-service.ts"
Cohesion: 0.11
Nodes (13): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+5 more)

### Community 43 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 44 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 45 - "CopilotClientLike"
Cohesion: 0.08
Nodes (12): CopilotClientLike, holdProbe(), fixtures, gate(), releases, fixtures, recoverAndSeed(), releases (+4 more)

### Community 46 - "transcription-service.ts"
Cohesion: 0.10
Nodes (20): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+12 more)

### Community 47 - "session-presentation.ts"
Cohesion: 0.15
Nodes (21): attentionRank, computerTone(), executionModeName(), recentFirst(), sessionActivityTime(), sessionDay, SessionSort, sessionSortFrom() (+13 more)

### Community 48 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 49 - "SessionOrderStore"
Cohesion: 0.20
Nodes (9): orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState, SessionOrderStore, directories, store() (+1 more)

### Community 50 - "recordValue"
Cohesion: 0.22
Nodes (19): activityGroupIdFor(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent() (+11 more)

### Community 51 - "app.ts"
Cohesion: 0.14
Nodes (14): prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode(), isAppleTouchIconProbe() (+6 more)

### Community 52 - "ComputerManager"
Cohesion: 0.23
Nodes (6): ComputerManager, fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 53 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+3 more)

### Community 54 - "noTmuxServer"
Cohesion: 0.12
Nodes (14): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+6 more)

### Community 55 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 56 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 57 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 58 - "session-resource-routes.test.ts"
Cohesion: 0.12
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 59 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 60 - "check-workspace-review-regressions.ts"
Cohesion: 0.13
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 61 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 62 - "session-knowledge-store.ts"
Cohesion: 0.12
Nodes (18): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+10 more)

### Community 63 - "SessionKnowledgeStore"
Cohesion: 0.24
Nodes (3): bindingKey(), SessionKnowledgeStore, SessionKnowledgeBinding

### Community 64 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 65 - "NodeIdentityStore"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 66 - "session-reply-durability.test.ts"
Cohesion: 0.18
Nodes (14): assistantFixture(), claudeFixture(), claudeQuestions(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk, fallbackFormFixture() (+6 more)

### Community 67 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 68 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 69 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 70 - "SessionNavigation.test.tsx"
Cohesion: 0.17
Nodes (13): SessionFilter, sessionNavigationView, matchesSessionSearch(), sessionPresentation, actions, backgroundTasks, computers, NavigationHarness() (+5 more)

### Community 71 - "SessionResources.tsx"
Cohesion: 0.17
Nodes (9): KnowledgeRootSelector(), root, providerName(), shortPath(), Catalog, CatalogResult, SessionResources(), sourceLabels (+1 more)

### Community 72 - "workspace-fixtures.ts"
Cohesion: 0.15
Nodes (13): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels, PERMISSION_SESSION_ID (+5 more)

### Community 73 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 74 - "normalizeKnowledgeRelativePath"
Cohesion: 0.35
Nodes (11): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+3 more)

### Community 75 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 76 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 77 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 78 - "push-notification-service.ts"
Cohesion: 0.15
Nodes (10): brief(), PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 79 - "registerSessionKnowledgeRoutes"
Cohesion: 0.33
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 80 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 81 - "listDirectories"
Cohesion: 0.23
Nodes (13): executeCommand(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder(), ChangeDirectoryDialog(), submit() (+5 more)

### Community 82 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 83 - "react"
Cohesion: 0.20
Nodes (8): plugins, oxc, react, typescript, drawDiagram(), drawing, MermaidDiagram(), SessionActions()

### Community 84 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 85 - "CopilotSessionLike"
Cohesion: 0.24
Nodes (5): CopilotSessionLike, CopilotTasksApi, queuedSdkPrompt(), disposals, fixture()

### Community 86 - "session-knowledge-routes.test.ts"
Cohesion: 0.18
Nodes (9): ServerRole, SessionMetadataLookup, disk, FakeManager, fixtures, gate(), holdWrite(), releases (+1 more)

### Community 87 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 88 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 89 - "session-resource-clear.test.ts"
Cohesion: 0.18
Nodes (11): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+3 more)

### Community 90 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 91 - "session-enqueue-clear.test.ts"
Cohesion: 0.25
Nodes (10): ClaudeSdk, disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet() (+2 more)

### Community 92 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 93 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 94 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 95 - ".persist"
Cohesion: 0.24
Nodes (3): SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, stateWithPaths()

### Community 96 - "session-resource-transport.ts"
Cohesion: 0.31
Nodes (8): CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 97 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 98 - "setupWorkspaceFixture"
Cohesion: 0.25
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 99 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 100 - "node:fs/promises"
Cohesion: 0.25
Nodes (6): disk, fixtures, prompt(), ready(), releases, session()

### Community 101 - "session-admission-lifecycle.test.ts"
Cohesion: 0.25
Nodes (6): deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases

### Community 102 - "session-knowledge-store.test.ts"
Cohesion: 0.25
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 103 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 105 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 106 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 107 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 108 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 109 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 110 - "session-navigation-view.test.ts"
Cohesion: 0.33
Nodes (5): computers, first, grouped, hidden, last

### Community 111 - "KnowledgeRootChoices.test.tsx"
Cohesion: 0.40
Nodes (4): actions, computers, root, session

## Knowledge Gaps
- **660 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+655 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 992 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `fixture()` connect `SessionStore` to `AgentService`, `session-enqueue-clear.test.ts`, `ClaudeAgentService`, `SessionDetail`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `AgentService` connect `AgentService` to `session-resources.ts`, `.readAfterWrites`, `.get`, `SessionFileUpload`, `queued-dispatch.test.ts`, `SessionDetail`, `recordValue`, `session-resource-routes.test.ts`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `session-resources.ts`, `.readAfterWrites`, `.get`, `AgentService`, `SessionFileUpload`, `queued-dispatch.test.ts`, `SessionDetail`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _660 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03161627105289077 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.04009205426356589 - nodes in this community are weakly interconnected._
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
