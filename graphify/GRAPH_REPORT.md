# Agentic Remote - Graphify code map

Snapshot: `5fae8a596e661b98e6d18d4a3d1f61889a25b2700293e53c342c57d55ff43d2a`

Source checkout: `2246dcf56e229f9f76513c1cdab246aaca5b4ec0`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 230 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 230 files · ~467,554 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3500 nodes · 9877 edges · 133 communities (96 shown, 22 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 726 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App.tsx
- App
- api.ts
- SessionDetail
- ComputerManager
- computer-manager.ts
- app.ts
- SessionStore
- claude-agent-service.ts
- agentic-remote-promotion-monitor
- markdown-navigation.ts
- transcription-service.ts
- agent-service.ts
- queueConflict
- contracts.ts
- session-presentation.ts
- .get
- SessionService
- terminal-session.ts
- terminal-startup-queue.test.ts
- TmuxTerminalSessionController
- bundle
- pwa.ts
- ProviderSessionService
- workspace-fixtures.ts
- lib.rs
- shell.ts
- background-task-adapter.ts
- FakeSessionService
- config.rs
- knowledge-tree.ts
- hub-routes.ts
- .replyUserInputInternal
- devDependencies
- agentic-remote
- dependencies
- agentic-remote-promotion-setup
- session-store.ts
- tmux-errors.integration.test.ts
- CopilotSessionLike
- ReaderWorkspace
- scripts
- KnowledgeStore
- CopilotClientLike
- compilerOptions
- directory-browser.ts
- SessionKnowledgeStore
- .sendInternal
- SessionResources.tsx
- capture-workspace.ts
- session-knowledge-store.ts
- session-reply-durability.test.ts
- noTmuxServer
- PushNotificationService
- session-clear-transcript.test.ts
- session-resource-clear.test.ts
- compilerOptions
- session-enqueue-clear.test.ts
- session-store-providers.test.ts
- terminal-session.test.ts
- compilerOptions
- compilerOptions
- recordValue
- event-log.ts
- workspace-browser.ts
- normalizeKnowledgeRelativePath
- api.test.ts
- react
- session-knowledge-store.test.ts
- HubEvent
- NewSessionDialog
- queued-dispatch.test.ts
- recovery-resend-durability.test.ts
- session-resource-routes.test.ts
- background-task-stop.test.ts
- claude-agent-service.test.ts
- check-workspace-review-regressions.ts
- desktop.json
- registerSessionKnowledgeRoutes
- BackgroundTasksDialog.tsx
- package.json
- settings-local.json
- background-task-tracker.ts
- session-knowledge-routes.ts
- scripts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- session-resource-providers.test.ts
- .oxlintrc.json
- generate-pwa-icons.ts
- bridge.rs
- screenshot-stability.test.ts
- SessionFileUpload
- release-publication.test.ts
- settings.ts
- composer-layout.test.ts
- knowledge-restore.ts
- push-routes.ts
- hasRunningBackgroundAgent
- removeComputer
- promotion-setup-execution.test.ts
- terminal-send-uncertainty.test.ts
- version-policy.test.ts
- queued-commands.ts
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
2. `App()` - 247 edges
3. `AgentService` - 218 edges
4. `SessionStore` - 150 edges
5. `ClaudeAgentService` - 118 edges
6. `ComputerManager` - 80 edges
7. `registerHubRoutes()` - 75 edges
8. `SessionService` - 70 edges
9. `RemoteNodeClient` - 65 edges
10. `TmuxTerminalSessionController` - 57 edges

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

## Communities (133 total, 22 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.05
Nodes (7): agentMode(), AgentService, isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError, fixture(), httpBoundary()

### Community 1 - "App.tsx"
Cohesion: 0.02
Nodes (113): ActivityStatus, configureRuntime(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+105 more)

### Community 2 - "App"
Cohesion: 0.04
Nodes (123): saveSessionOrderLane(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession() (+115 more)

### Community 3 - "api.ts"
Cohesion: 0.03
Nodes (102): AddKnowledgeRootInput, PushSettings, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, parseSubmissionReceipt(), SubmissionReceipt, submissionReceiptFromError(), addKnowledgeRoot() (+94 more)

### Community 4 - "SessionDetail"
Cohesion: 0.05
Nodes (6): ClaudeAgentService, isMissingClaudeSessionError(), clearRecoverySeedFailure(), QueuedPrompt, RuntimeModelOption, SessionDetail

### Community 5 - "ComputerManager"
Cohesion: 0.06
Nodes (27): ComputerManager, managedSession(), fixture(), session(), RemoteSessionListing, sessionAtLeastAsNew(), RegisteredComputer, registerHubRoutes() (+19 more)

### Community 6 - "computer-manager.ts"
Cohesion: 0.04
Nodes (32): TerminalFormContinuation, RemoteResync, RemoteSessionRead, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, DEFINITE_DISPATCH_REFUSALS, headerSafe(), normalizeNodeUrl() (+24 more)

### Community 7 - "app.ts"
Cohesion: 0.04
Nodes (56): prefixes, session, trusted, untrusted, buildApp(), BuildAppOptions, errorStatusCode(), isAppleTouchIconProbe() (+48 more)

### Community 8 - "SessionStore"
Cohesion: 0.06
Nodes (31): fixture(), connect(), createStore(), deferred(), disk, enqueue(), fixture(), fixtures (+23 more)

### Community 9 - "claude-agent-service.ts"
Cohesion: 0.08
Nodes (51): AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+43 more)

### Community 10 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 11 - "markdown-navigation.ts"
Cohesion: 0.05
Nodes (56): UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), workspaceAbsolutePath() (+48 more)

### Community 12 - "transcription-service.ts"
Cohesion: 0.06
Nodes (36): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+28 more)

### Community 13 - "agent-service.ts"
Cohesion: 0.06
Nodes (63): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+55 more)

### Community 14 - "queueConflict"
Cohesion: 0.06
Nodes (24): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), queueConflict() (+16 more)

### Community 15 - "contracts.ts"
Cohesion: 0.07
Nodes (33): ClaudeAgentServiceEvents, directories, routingFixture(), session(), temporaryDirectory(), ProviderSessionServiceEvents, RemoteNodeClientEvents, AgentProvider (+25 more)

### Community 16 - "session-presentation.ts"
Cohesion: 0.07
Nodes (44): KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, computers, first, grouped, hidden (+36 more)

### Community 17 - ".get"
Cohesion: 0.09
Nodes (3): isUncertainDelivery(), TerminalSessionController, deliveryUncertaintyFromError()

### Community 18 - "SessionService"
Cohesion: 0.07
Nodes (8): ActiveClaudeQuery, registerNodeRoutes(), releases, session, snapshot, ResourceReads, resourceRequestHandler(), SessionService

### Community 19 - "terminal-session.ts"
Cohesion: 0.10
Nodes (47): activeBottomFrame(), boxedComposerFrame(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerFrameText(), containsCopiedInteractiveFrame(), desktopInstallPromptIdentity() (+39 more)

### Community 20 - "terminal-startup-queue.test.ts"
Cohesion: 0.09
Nodes (36): findActiveCopilotSessions(), directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture() (+28 more)

### Community 21 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (13): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), terminalChecklistState() (+5 more)

### Community 22 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 23 - "pwa.ts"
Cohesion: 0.09
Nodes (38): directories, AppVersion, parseAppVersion(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), sendTestPushNotification(), applyPwaUpdate() (+30 more)

### Community 25 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (31): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, createWorkspaceFixtureState() (+23 more)

### Community 26 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 27 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 28 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (37): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotTaskInfo, CopilotTaskProgress, errorValue(), eventTask() (+29 more)

### Community 30 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 31 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (35): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+27 more)

### Community 32 - "hub-routes.ts"
Cohesion: 0.06
Nodes (36): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+28 more)

### Community 33 - ".replyUserInputInternal"
Cohesion: 0.10
Nodes (7): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), persistedFormAnswer(), statusFromEvents(), TranscriptObservation, PendingUserInput, SessionStatus

### Community 34 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 35 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 36 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 37 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (30): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+22 more)

### Community 38 - "session-store.ts"
Cohesion: 0.07
Nodes (24): PendingTerminalQueueSettlement, TerminalDiscoveryError, BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief, activityDuration(), activityResultPreview() (+16 more)

### Community 39 - "tmux-errors.integration.test.ts"
Cohesion: 0.14
Nodes (29): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+21 more)

### Community 40 - "CopilotSessionLike"
Cohesion: 0.08
Nodes (10): CopilotSessionLike, terminalFormSteps(), configurableModel(), DeferredSession, directories, FakeCopilotClient, services, startupFifoFixture() (+2 more)

### Community 41 - "ReaderWorkspace"
Cohesion: 0.10
Nodes (16): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview() (+8 more)

### Community 42 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 43 - "KnowledgeStore"
Cohesion: 0.18
Nodes (7): WorkspaceFixtureState, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, fixture(), KnowledgeRoot

### Community 44 - "CopilotClientLike"
Cohesion: 0.08
Nodes (12): CopilotClientLike, holdProbe(), fixtures, gate(), releases, fixtures, recoverAndSeed(), releases (+4 more)

### Community 45 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 46 - "directory-browser.ts"
Cohesion: 0.18
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 47 - "SessionKnowledgeStore"
Cohesion: 0.20
Nodes (4): bindingKey(), SessionKnowledgeRecoveryError, SessionKnowledgeStore, SessionKnowledgeBinding

### Community 48 - ".sendInternal"
Cohesion: 0.20
Nodes (16): capturePane(), composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), isTerminalAgentWorking(), isTerminalOverlay(), isTerminalSessionInUsePrompt() (+8 more)

### Community 49 - "SessionResources.tsx"
Cohesion: 0.14
Nodes (19): isMcpSummary(), isRecord(), isSkillSummary(), listSessionMcpServers(), listSessionSkills(), optionalBoolean(), optionalCount(), optionalText() (+11 more)

### Community 50 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 51 - "session-knowledge-store.ts"
Cohesion: 0.10
Nodes (20): bindingSchema, Identity, PathRecord, pathRecordKey(), pathRecordSchema, PathState, pathStateFor(), pathStateSchema (+12 more)

### Community 52 - "session-reply-durability.test.ts"
Cohesion: 0.16
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+10 more)

### Community 53 - "noTmuxServer"
Cohesion: 0.12
Nodes (14): noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files, links (+6 more)

### Community 55 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 56 - "session-resource-clear.test.ts"
Cohesion: 0.12
Nodes (18): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+10 more)

### Community 57 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 58 - "session-enqueue-clear.test.ts"
Cohesion: 0.13
Nodes (16): ClaudeSdk, deferred(), disk, enqueue(), fixtures, holdAdmissionWrite(), releases, disk (+8 more)

### Community 59 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 60 - "terminal-session.test.ts"
Cohesion: 0.12
Nodes (16): paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), bracketedTabPane, clearFixture(), desktopInstallPane, directories, execFileAsync (+8 more)

### Community 61 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 62 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 63 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 64 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 65 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 66 - "normalizeKnowledgeRelativePath"
Cohesion: 0.22
Nodes (15): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), scopedKnowledgeRoot(), KnowledgeRootChoice (+7 more)

### Community 67 - "api.test.ts"
Cohesion: 0.18
Nodes (16): HUB_SNAPSHOT_TIMEOUT_MS, sendMessage(), failWith(), transcribeAudio(), uploadSessionFile(), sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts() (+8 more)

### Community 68 - "react"
Cohesion: 0.13
Nodes (11): plugins, oxc, react, typescript, MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram() (+3 more)

### Community 69 - "session-knowledge-store.test.ts"
Cohesion: 0.15
Nodes (12): disk, fixture(), fixtures, releases, root(), disk, fixture(), fixtures (+4 more)

### Community 70 - "HubEvent"
Cohesion: 0.15
Nodes (10): WorkspaceFixture, ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, RFC-8030 (+2 more)

### Community 71 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+8 more)

### Community 72 - "queued-dispatch.test.ts"
Cohesion: 0.14
Nodes (9): accept(), deferred(), disk, fixture(), fixtures, holdWrite(), prompt(), releases (+1 more)

### Community 73 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 74 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 75 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 76 - "claude-agent-service.test.ts"
Cohesion: 0.17
Nodes (10): cleanupFixtures(), directories, fixture(), queryHandle(), services, waitForIdle(), claudeFixture(), copilotFixture() (+2 more)

### Community 77 - "check-workspace-review-regressions.ts"
Cohesion: 0.15
Nodes (11): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+3 more)

### Community 78 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 79 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 80 - "BackgroundTasksDialog.tsx"
Cohesion: 0.23
Nodes (10): DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive() (+2 more)

### Community 81 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 82 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 83 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (7): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask

### Community 84 - "session-knowledge-routes.ts"
Cohesion: 0.15
Nodes (7): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema, SessionKnowledgeConflictError

### Community 85 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 86 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 87 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 88 - "session-resource-providers.test.ts"
Cohesion: 0.20
Nodes (10): ClaudeMcpRead, deferred(), DiscoveredMcp, DiscoveredSkills, fixtures, Mcp, pause(), releases (+2 more)

### Community 89 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 90 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 91 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 92 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 94 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 95 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 96 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 97 - "knowledge-restore.ts"
Cohesion: 0.47
Nodes (3): knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 98 - "push-routes.ts"
Cohesion: 0.40
Nodes (4): sessionMuteSchema, subscriptionSchema, testNotificationSchema, unsubscribeSchema

### Community 100 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

## Knowledge Gaps
- **663 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+658 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1002 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `.replyUserInputInternal`, `SessionDetail`, `session-store.ts`, `SessionStore`, `claude-agent-service.ts`, `agent-service.ts`, `queueConflict`, `directory-browser.ts`, `contracts.ts`, `.get`, `SessionFileUpload`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `computer-manager.ts` to `ComputerManager`, `claude-agent-service.ts`, `directory-browser.ts`, `contracts.ts`, `SessionFileUpload`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `ClaudeAgentService` connect `SessionDetail` to `.replyUserInputInternal`, `claude-agent-service.ts`, `claude-agent-service.test.ts`, `directory-browser.ts`, `queueConflict`, `contracts.ts`, `SessionService`, `SessionFileUpload`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _663 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.050082918739635156 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.024897240164415736 - nodes in this community are weakly interconnected._
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
