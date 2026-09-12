# Agentic Remote - Graphify code map

Snapshot: `f35d4a2c32d36ce7863020fa038dec8b7212fb177f4567a24fb4d420a4726a6c`

Source checkout: `634092613d1281cd9b1014a327dc8f25b5f77289`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 223 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 223 files · ~453,095 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3438 nodes · 9709 edges · 152 communities (107 shown, 31 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 719 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- api.ts
- contracts.ts
- ClaudeAgentService
- claude-agent-service.ts
- SessionStore
- agentic-remote-promotion-monitor
- session-presentation.ts
- terminal-session.ts
- AgentService
- markdown-navigation.ts
- CopilotSessionLike
- agent-service.ts
- RemoteNodeClient
- ComputerManager
- bundle
- SessionService
- TmuxTerminalSessionController
- hub-routes.ts
- SessionDetail
- lib.rs
- ProviderSessionService
- shell.ts
- terminal-startup-queue.test.ts
- background-task-adapter.ts
- config.rs
- pwa.ts
- SessionKnowledgeStore
- .sendAdmittedWithBackend
- devDependencies
- .create
- dependencies
- agentic-remote
- node-routes.ts
- knowledge-tree.ts
- .get
- agentic-remote-promotion-setup
- tmux-errors.integration.test.ts
- app.ts
- remote-node-client.ts
- session-store.ts
- .syncTranscripts
- session-resource-clear.test.ts
- session-reply-durability.test.ts
- delegated-transcription-service.ts
- scripts
- .replyUserInputInternal
- KnowledgeStore
- PushNotificationService
- .readAfterWrites
- compilerOptions
- BackgroundTasksDialog.tsx
- queued-provider-dispatch.test.ts
- noTmuxServer
- transcription-service.ts
- ComputerSummary
- capture-workspace.ts
- session-knowledge-routes.ts
- session-store-providers.test.ts
- NewSessionDialog
- terminal-session.test.ts
- compilerOptions
- .startAdmitted
- AgentProvider
- compilerOptions
- check-workspace-review-regressions.ts
- compilerOptions
- directory-browser.ts
- recordValue
- event-log.ts
- use-session-knowledge-root.ts
- .deleteSerialized
- session-resource-providers.test.ts
- session-knowledge-store.ts
- workspace-browser.ts
- ReaderWorkspace
- agent-service.test.ts
- background-task-stop.test.ts
- recovery-resend-durability.test.ts
- capture
- registerSessionKnowledgeRoutes
- desktop.json
- capture-workbench-review.ts
- package.json
- workspace-fixtures.ts
- .oxlintrc.json
- settings-local.json
- push-notification-service.ts
- TranscriptionError
- session-response-order.ts
- promotion-monitor.test.ts
- recovery-seed-guards.test.ts
- html-preview.ts
- scripts
- setupWorkspaceFixture
- session-knowledge-store.test.ts
- .drainNextTerminalPrompt
- DeferredSession
- ComputerRegistry
- session-enqueue-clear.test.ts
- session-resource-transport.ts
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- NodeIdentityStore
- session-clear-transcript.test.ts
- session-store-durability.test.ts
- SessionFileUpload
- SessionAdmissions
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- MarkdownCodeBlock.tsx
- session-navigation-view.test.ts
- .reconcileRuntimeStatus
- SessionKnowledgeLifecycle
- KnowledgeRootChoices.test.tsx
- .discoverTerminalSessions
- terminal-send-uncertainty.test.ts
- MockMediaRecorder
- MermaidDiagram.tsx
- SessionMuteCarrier
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
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 276 edges
2. `App()` - 235 edges
3. `AgentService` - 217 edges
4. `SessionStore` - 150 edges
5. `ClaudeAgentService` - 118 edges
6. `ComputerManager` - 79 edges
7. `SessionService` - 70 edges
8. `RemoteNodeClient` - 65 edges
9. `registerHubRoutes()` - 63 edges
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

## Communities (152 total, 31 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (120): activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown(), applyComputerSnapshot(), applySession(), askAboutKnowledgeFile() (+112 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (99): accentIconUrl(), applyAccentIcon(), addComputer(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage() (+91 more)

### Community 2 - "api.ts"
Cohesion: 0.04
Nodes (104): parseSubmissionReceipt(), submissionReceiptFromError(), addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRuntime(), definiteDispatchRefusals (+96 more)

### Community 3 - "contracts.ts"
Cohesion: 0.04
Nodes (57): ServerRole, ClaudeAgentServiceEvents, managers, releases, remote, RemoteResync, RemoteSessionRead, SessionMetadataLookup (+49 more)

### Community 4 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (8): ClaudeAgentService, isClaudeAuthenticationError(), isMissingClaudeSessionError(), waitForIdle(), toolResultText(), QueuedPromptReservation, TranscriptObservation, RuntimeModelOption

### Community 5 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (56): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+48 more)

### Community 6 - "SessionStore"
Cohesion: 0.06
Nodes (10): fixture(), observe(), archivedMessage(), clearRecoverySeedFailure(), cloneSession(), ownsRecoverySeedFailure(), SessionStore, acceptedStartupRecovery() (+2 more)

### Community 7 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 8 - "session-presentation.ts"
Cohesion: 0.06
Nodes (52): react, SessionKnowledgeSourceInput, DialogFrame(), FolderRows(), KnowledgeLocationChoice(), KnowledgeRootChoice, KnowledgeRootChoices(), KnowledgeRootSession (+44 more)

### Community 9 - "terminal-session.ts"
Cohesion: 0.09
Nodes (56): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, composerHoldsOtherText(), composerHoldsText(), composerText() (+48 more)

### Community 10 - "AgentService"
Cohesion: 0.07
Nodes (4): AgentService, RuntimeConfigurationError, fixture(), httpBoundary()

### Community 11 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (50): UserInputField, UserInputFieldValue, followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage(), missingDocumentFragment(), WorkspaceDialog() (+42 more)

### Community 12 - "CopilotSessionLike"
Cohesion: 0.07
Nodes (26): CopilotSessionLike, CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight() (+18 more)

### Community 13 - "agent-service.ts"
Cohesion: 0.05
Nodes (47): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), ActivityToolStart, agentMode(), AgentServiceEvents, ansiSequence (+39 more)

### Community 14 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (7): RemoteNodeClient, BackgroundTaskSnapshot, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing, WorkspaceFileIcon()

### Community 15 - "ComputerManager"
Cohesion: 0.17
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 16 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 18 - "TmuxTerminalSessionController"
Cohesion: 0.13
Nodes (10): copilotCommand(), execFileAsync, processAncestors(), processCommand(), submitTerminalForm(), terminalChecklistState(), terminalFormCommitKeys(), tmuxTargetForPid() (+2 more)

### Community 19 - "hub-routes.ts"
Cohesion: 0.08
Nodes (38): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+30 more)

### Community 20 - "SessionDetail"
Cohesion: 0.10
Nodes (6): FakeSessionService, Admission, ExclusiveAdmission, PendingQueueAdmission, RuntimeReasoningEffort, SessionDetail

### Community 21 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 23 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 24 - "terminal-startup-queue.test.ts"
Cohesion: 0.11
Nodes (30): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), exec, formFixture(), horizontalFormFixture() (+22 more)

### Community 25 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (37): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotTaskInfo, CopilotTaskProgress, errorValue(), eventTask() (+29 more)

### Community 26 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 27 - "pwa.ts"
Cohesion: 0.11
Nodes (33): deletePushSubscription(), getProviderRuntimeOptions(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog(), checkForUpdate() (+25 more)

### Community 28 - "SessionKnowledgeStore"
Cohesion: 0.12
Nodes (8): WorkspaceFixtureState, parseState(), RootCatalog, SessionKnowledgeEvents, SessionKnowledgePersistenceError, SessionKnowledgeRecoveryError, SessionKnowledgeStore, SessionKnowledgeBinding

### Community 30 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 31 - ".create"
Cohesion: 0.09
Nodes (26): fixture(), ClaudeSdk, connect(), createStore(), deferred(), disk, enqueue(), fixture() (+18 more)

### Community 32 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 33 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 34 - "node-routes.ts"
Cohesion: 0.07
Nodes (28): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+20 more)

### Community 35 - "knowledge-tree.ts"
Cohesion: 0.10
Nodes (29): WorkspaceEntry, listKnowledgeEntries(), listSessionKnowledgeEntries(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown() (+21 more)

### Community 37 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 38 - "tmux-errors.integration.test.ts"
Cohesion: 0.14
Nodes (28): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+20 more)

### Community 39 - "app.ts"
Cohesion: 0.10
Nodes (18): isUncertainDelivery(), prefixes, session, trusted, untrusted, directories, buildApp(), errorStatusCode() (+10 more)

### Community 40 - "remote-node-client.ts"
Cohesion: 0.10
Nodes (17): DEFINITE_DISPATCH_REFUSALS, headerSafe(), REDIRECT_STATUSES, client(), servers, session, RemoteNodeRedirectError, RemoteNodeRequestError (+9 more)

### Community 41 - "session-store.ts"
Cohesion: 0.07
Nodes (21): channels, directories, activityDuration(), activityResultPreview(), emptyRetirements, PendingChange, PendingMutation, RecoveryResend (+13 more)

### Community 42 - ".syncTranscripts"
Cohesion: 0.17
Nodes (21): activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent(), isRuntimeReasoningEffort() (+13 more)

### Community 43 - "session-resource-clear.test.ts"
Cohesion: 0.08
Nodes (20): CopilotClientLike, holdProbe(), fixtures, gate(), releases, boots, [directory, backend, resultPath, phase = 'idle'], fixtureRoot (+12 more)

### Community 44 - "session-reply-durability.test.ts"
Cohesion: 0.13
Nodes (18): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+10 more)

### Community 45 - "delegated-transcription-service.ts"
Cohesion: 0.12
Nodes (13): collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation, registerTranscriptionRoutes() (+5 more)

### Community 46 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 47 - ".replyUserInputInternal"
Cohesion: 0.16
Nodes (6): persistedFormAnswer(), TerminalFormContinuation, validateUserInputForm(), TerminalFormReplyError, PendingUserInput, UserInputReplyInput

### Community 48 - "KnowledgeStore"
Cohesion: 0.16
Nodes (6): KnowledgeState, KnowledgeStore, directories, fixture(), createHub(), KnowledgeRoot

### Community 49 - "PushNotificationService"
Cohesion: 0.19
Nodes (3): HubEventSource, PushNotificationService, registerPushRoutes()

### Community 51 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 52 - "BackgroundTasksDialog.tsx"
Cohesion: 0.14
Nodes (15): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskCard(), BackgroundTasksDialog() (+7 more)

### Community 53 - "queued-provider-dispatch.test.ts"
Cohesion: 0.10
Nodes (13): directories, fixture(), queryHandle(), services, claudeFixture(), copilotFixture(), copilotSession(), fixtures (+5 more)

### Community 54 - "noTmuxServer"
Cohesion: 0.12
Nodes (16): listTmuxSessions(), noTmuxServer(), processGone(), procVisible(), socketIdentity(), directories, { execute }, files (+8 more)

### Community 55 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 56 - "ComputerSummary"
Cohesion: 0.15
Nodes (6): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, FakeManager, ComputerSummary

### Community 57 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 58 - "session-knowledge-routes.ts"
Cohesion: 0.14
Nodes (19): normalizeSessionKnowledgePath(), rebaseKnowledgeFile(), rebaseKnowledgeListing(), rebasePath(), scopedKnowledgePath(), sourceComputerName(), sourcePath(), joinOwnedPath() (+11 more)

### Community 59 - "session-store-providers.test.ts"
Cohesion: 0.11
Nodes (10): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+2 more)

### Community 60 - "NewSessionDialog"
Cohesion: 0.15
Nodes (22): activateSession(), createSession(), executeCommand(), listDirectories(), listHistory(), listWorkspace(), validateSessionDirectory(), AddKnowledgeRootDialog() (+14 more)

### Community 61 - "terminal-session.test.ts"
Cohesion: 0.12
Nodes (16): parseTerminalUpdateNotice(), safeWindowName(), bracketedTabPane, clearFixture(), deliveryFixture(), desktopInstallPane, directories, execFileAsync (+8 more)

### Community 62 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 64 - "AgentProvider"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 65 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 66 - "check-workspace-review-regressions.ts"
Cohesion: 0.13
Nodes (15): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+7 more)

### Community 67 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 68 - "directory-browser.ts"
Cohesion: 0.23
Nodes (11): displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin(), SessionDirectoryError (+3 more)

### Community 69 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 70 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 71 - "use-session-knowledge-root.ts"
Cohesion: 0.20
Nodes (13): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+5 more)

### Community 73 - "session-resource-providers.test.ts"
Cohesion: 0.18
Nodes (14): cleanupFixtures(), claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills (+6 more)

### Community 74 - "session-knowledge-store.ts"
Cohesion: 0.14
Nodes (16): bindingKey(), bindingSchema, catalogRecoverySchema, Identity, legacyBindingSchema, legacyStateSchema, LegacyUpdate, PreparedLocation (+8 more)

### Community 75 - "workspace-browser.ts"
Cohesion: 0.23
Nodes (14): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+6 more)

### Community 76 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 77 - "agent-service.test.ts"
Cohesion: 0.15
Nodes (7): terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), UserInputForm

### Community 78 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 79 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 80 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 81 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (13): sourceComputerId(), registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+5 more)

### Community 82 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 83 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 84 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 85 - "workspace-fixtures.ts"
Cohesion: 0.17
Nodes (12): documents, FIXTURE_NOW, fixtureBackgroundTasks, fixtureEndpoints, fixtureKnowledgeListings, fixtureKnowledgePositions, fixtureModels, runtime (+4 more)

### Community 86 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 87 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 88 - "push-notification-service.ts"
Cohesion: 0.15
Nodes (10): brief(), PushSender, PushState, directories, RFC-8030, RFC-8030, sessionMuteSchema, subscriptionSchema (+2 more)

### Community 89 - "TranscriptionError"
Cohesion: 0.29
Nodes (3): LocalTranscriptionService, fixture(), TranscriptionError

### Community 90 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 91 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 92 - "recovery-seed-guards.test.ts"
Cohesion: 0.18
Nodes (8): bootLegacy(), directories, execute, pending, releases, SeedState, services, stores

### Community 93 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 94 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 95 - "setupWorkspaceFixture"
Cohesion: 0.24
Nodes (6): pageFor(), createWorkspaceFixtureState(), fixtureBaseUrl(), fixtureValue(), setupWorkspaceFixture(), fixtureApi()

### Community 96 - "session-knowledge-store.test.ts"
Cohesion: 0.22
Nodes (6): SessionKnowledgeConflictError, disk, fixture(), fixtures, releases, root()

### Community 99 - "ComputerRegistry"
Cohesion: 0.31
Nodes (3): ComputerRegistry, directories, remoteSnapshotFixture()

### Community 100 - "session-enqueue-clear.test.ts"
Cohesion: 0.29
Nodes (9): disk, EnqueueCase, fixtures, gate(), holdEnqueue(), joinedEnqueue(), quiet(), releases (+1 more)

### Community 101 - "session-resource-transport.ts"
Cohesion: 0.31
Nodes (8): CopilotResourceMethod, readClaudeMcp(), readCopilotResource(), copilotTransport(), disposals, Frame, write(), unavailable()

### Community 102 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 103 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 104 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 106 - "session-clear-transcript.test.ts"
Cohesion: 0.25
Nodes (5): disk, fixtures, gate(), holdTurnWrite(), releases

### Community 107 - "session-store-durability.test.ts"
Cohesion: 0.31
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 110 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 111 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 112 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 113 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 114 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 115 - "session-navigation-view.test.ts"
Cohesion: 0.33
Nodes (5): computers, first, grouped, hidden, last

### Community 116 - ".reconcileRuntimeStatus"
Cohesion: 0.60
Nodes (3): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents()

### Community 118 - "KnowledgeRootChoices.test.tsx"
Cohesion: 0.40
Nodes (4): actions, computers, root, session

### Community 123 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **652 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+647 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 980 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `AgentProvider`, `contracts.ts`, `remote-node-client.ts`, `SessionFileUpload`, `ComputerSummary`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `ClaudeAgentService`, `.get`, `.deleteSerialized`, `session-store.ts`, `AgentService`, `.syncTranscripts`, `SessionFileUpload`, `agent-service.ts`, `.replyUserInputInternal`, `.readAfterWrites`, `.startAdmitted`, `session-store-providers.test.ts`, `.sendAdmittedWithBackend`, `.create`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `contracts.ts`, `claude-agent-service.ts`, `ProviderSessionService`, `RemoteNodeClient`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _652 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.041215551181102365 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.026170798898071626 - nodes in this community are weakly interconnected._
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
