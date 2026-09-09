# Agentic Remote - Graphify code map

Snapshot: `bf66fe1f1fccda45460b4ef1e924e9dd4cb59f78fdd8d833025fb2ac6e92c57f`

Source checkout: `e18188d4217cb4fb35483ae3847a6035a104e8e5`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 205 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 205 files · ~424,034 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3274 nodes · 9178 edges · 128 communities (94 shown, 21 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 675 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- App.tsx
- api.ts
- ClaudeAgentService
- claude-agent-service.ts
- contracts.ts
- SessionDetail
- SessionStore
- agent-service.ts
- agentic-remote-promotion-monitor
- app.ts
- session-presentation.ts
- .get
- .readAfterWrites
- queued-provider-dispatch.test.ts
- ComputerManager
- terminal-session.ts
- RemoteNodeClient
- SessionKnowledgeStore
- WorkspaceDialog
- terminal-session.test.ts
- bundle
- background-task-adapter.ts
- TmuxTerminalSessionController
- buildApp
- pwa.ts
- lib.rs
- SessionService
- ProviderSessionService
- workspace-fixtures.ts
- config.rs
- FakeSessionService
- shell.ts
- devDependencies
- session-enqueue-clear.test.ts
- dependencies
- agentic-remote
- hub-routes.ts
- session-resource-clear.test.ts
- node-routes.ts
- agentic-remote-promotion-setup
- knowledge-tree.ts
- CopilotSessionLike
- scripts
- computer-manager-metadata.test.ts
- session-knowledge-routes.ts
- compilerOptions
- active-sessions.ts
- BackgroundTaskSnapshot
- directory-browser.ts
- tmux-errors.integration.test.ts
- .discoverSessions
- session-store.ts
- session-store-providers.test.ts
- capture-workspace.ts
- session-clear-transcript.test.ts
- HubEvent
- compilerOptions
- PushNotificationService
- compilerOptions
- compilerOptions
- session-resource-routes.test.ts
- event-log.ts
- workspace-browser.ts
- CopilotClientLike
- ComputerSummary
- use-session-knowledge-root.ts
- ReaderWorkspace
- background-task-stop.test.ts
- queued-dispatch.test.ts
- recovery-resend-durability.test.ts
- session-reply-durability.test.ts
- PromptCards.tsx
- capture
- NewSessionDialog
- desktop.json
- recordValue
- capture-workbench-review.ts
- package.json
- .oxlintrc.json
- settings-local.json
- session-response-order.ts
- promotion-monitor.test.ts
- BackgroundTasksDialog.tsx
- scripts
- submission-error.ts
- DeferredSession
- bridge.rs
- screenshot-stability.test.ts
- remote-node-client.test.ts
- session-store-durability.test.ts
- composerHoldsText
- KnowledgeRootChoices.tsx
- KnowledgePosition
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- release-publication.test.ts
- MarkdownCodeBlock.tsx
- terminal-send-uncertainty.test.ts
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
1. `SessionDetail` - 269 edges
2. `App()` - 227 edges
3. `AgentService` - 204 edges
4. `SessionStore` - 144 edges
5. `ClaudeAgentService` - 118 edges
6. `ComputerManager` - 79 edges
7. `SessionService` - 70 edges
8. `RemoteNodeClient` - 65 edges
9. `registerHubRoutes()` - 59 edges
10. `ProviderSessionService` - 54 edges

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

## Communities (128 total, 21 thin omitted)

### Community 0 - "App"
Cohesion: 0.04
Nodes (133): submissionReceiptFromError(), replyPermission(), activeComposerPastes(), App(), adoptConversationReplacement(), answerUserInput(), appendComposerForKey(), appKeyDown() (+125 more)

### Community 1 - "App.tsx"
Cohesion: 0.03
Nodes (96): accentIconUrl(), applyAccentIcon(), addComputer(), configureRuntime(), removeComputer(), AccentTheme, accentThemes, activityKindFromMessage() (+88 more)

### Community 2 - "api.ts"
Cohesion: 0.05
Nodes (93): parseSubmissionReceipt(), addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), definiteDispatchRefusals, deleteKnowledgeRoot(), deletePushSubscription() (+85 more)

### Community 3 - "ClaudeAgentService"
Cohesion: 0.05
Nodes (7): ClaudeAgentService, isMissingClaudeSessionError(), claudeFixture(), copilotFixture(), directory(), seed(), RuntimeModelOption

### Community 4 - "claude-agent-service.ts"
Cohesion: 0.06
Nodes (61): ActiveClaudeQuery, AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput (+53 more)

### Community 5 - "contracts.ts"
Cohesion: 0.05
Nodes (52): RemoteResync, RemoteSessionRead, directories, routingFixture(), session(), temporaryDirectory(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER (+44 more)

### Community 6 - "SessionDetail"
Cohesion: 0.06
Nodes (5): AgentService, RuntimeConfigurationError, fixture(), httpBoundary(), SessionDetail

### Community 7 - "SessionStore"
Cohesion: 0.06
Nodes (25): fixture(), connect(), createStore(), enqueue(), fixture(), recoveryFixture(), fixture(), fixture() (+17 more)

### Community 8 - "agent-service.ts"
Cohesion: 0.06
Nodes (66): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+58 more)

### Community 9 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 10 - "app.ts"
Cohesion: 0.06
Nodes (38): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+30 more)

### Community 11 - "session-presentation.ts"
Cohesion: 0.06
Nodes (48): react, DialogFrame(), KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, computers, first (+40 more)

### Community 12 - ".get"
Cohesion: 0.09
Nodes (7): agentMode(), isForegroundCompletionEvent(), isForegroundLifecycleEvent(), isMissingSessionError(), removeCopilotSessionFiles(), statusFromEvents(), TranscriptObservation

### Community 13 - ".readAfterWrites"
Cohesion: 0.08
Nodes (4): isUncertainDelivery(), queueConflict(), TerminalSessionController, deliveryUncertaintyFromError()

### Community 14 - "queued-provider-dispatch.test.ts"
Cohesion: 0.07
Nodes (23): acceptanceReceipt(), errorMessage(), explicitlyRefused(), hasUncertainDelivery(), ownsDispatchRecovery(), preflight(), preparePrompt(), QueuedDelivery (+15 more)

### Community 15 - "ComputerManager"
Cohesion: 0.16
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 16 - "terminal-session.ts"
Cohesion: 0.11
Nodes (44): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+36 more)

### Community 17 - "RemoteNodeClient"
Cohesion: 0.07
Nodes (7): headerSafe(), RemoteNodeClient, NodeInfo, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing, KnowledgeFolderState

### Community 18 - "SessionKnowledgeStore"
Cohesion: 0.09
Nodes (21): bindingKey(), bindingSchema, Identity, recoverySchema, RootCatalog, rootSchema, SessionKnowledgeConflictError, SessionKnowledgeEvents (+13 more)

### Community 19 - "WorkspaceDialog"
Cohesion: 0.09
Nodes (38): executeCommand(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage() (+30 more)

### Community 20 - "terminal-session.test.ts"
Cohesion: 0.08
Nodes (36): directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec, parseTerminalUpdateNotice() (+28 more)

### Community 21 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 22 - "background-task-adapter.ts"
Cohesion: 0.12
Nodes (42): addActivity(), attachmentModeValue(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotTaskInfo, CopilotTaskProgress, errorValue() (+34 more)

### Community 23 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (14): copilotCommand(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand(), safeWindowName(), submitTerminalForm(), terminalChecklistState() (+6 more)

### Community 24 - "buildApp"
Cohesion: 0.07
Nodes (24): WorkspaceFixtureState, prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), ServerRole (+16 more)

### Community 25 - "pwa.ts"
Cohesion: 0.10
Nodes (35): directories, AppVersion, parseAppVersion(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart(), AppSettingsDialog() (+27 more)

### Community 26 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 29 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (31): pageFor(), accents, Measurement, originalDocument, output, report, save(), scratch (+23 more)

### Community 30 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 32 - "shell.ts"
Cohesion: 0.10
Nodes (31): bridge(), decodeSegment(), method(), key(), label(), NotifiableSession, notificationState(), requestId() (+23 more)

### Community 33 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 34 - "session-enqueue-clear.test.ts"
Cohesion: 0.07
Nodes (25): ClaudeSdk, directories, fixture(), queryHandle(), waitForIdle(), deferred(), disk, fixtures (+17 more)

### Community 35 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 36 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 37 - "hub-routes.ts"
Cohesion: 0.07
Nodes (28): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+20 more)

### Community 38 - "session-resource-clear.test.ts"
Cohesion: 0.08
Nodes (28): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+20 more)

### Community 39 - "node-routes.ts"
Cohesion: 0.08
Nodes (26): FileUploadError, MAX_SESSION_FILE_BYTES, registerFileUploadRoutes(), SessionParams, supportedExtensions, supportsSessionFile(), configureRuntimeSchema, createSessionSchema (+18 more)

### Community 40 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 41 - "knowledge-tree.ts"
Cohesion: 0.11
Nodes (27): WorkspaceEntry, applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeTreeKeyDown(), loadKnowledgeChain(), loadKnowledgeFolder() (+19 more)

### Community 42 - "CopilotSessionLike"
Cohesion: 0.10
Nodes (12): CopilotSessionLike, terminalFormSteps(), configurableModel(), directories, FakeCopilotClient, services, startupFifoFixture(), CopilotTasksApi (+4 more)

### Community 43 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 44 - "computer-manager-metadata.test.ts"
Cohesion: 0.12
Nodes (9): managers, releases, remote, ComputerRegistry, RegistryState, directories, remoteSnapshotFixture(), NodeIdentityStore (+1 more)

### Community 45 - "session-knowledge-routes.ts"
Cohesion: 0.13
Nodes (17): Lineage, registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+9 more)

### Community 46 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 47 - "active-sessions.ts"
Cohesion: 0.19
Nodes (23): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+15 more)

### Community 48 - "BackgroundTaskSnapshot"
Cohesion: 0.16
Nodes (8): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), hasRunningBackgroundAgent(), BackgroundTask, BackgroundTaskSnapshot

### Community 49 - "directory-browser.ts"
Cohesion: 0.18
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 50 - "tmux-errors.integration.test.ts"
Cohesion: 0.12
Nodes (19): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), stopOwnedServer(), noTmuxServer() (+11 more)

### Community 52 - "session-store.ts"
Cohesion: 0.10
Nodes (18): PendingTerminalQueueSettlement, resolveDataDirectory(), activityDuration(), activityResultPreview(), archivedMessage(), DiscoveredSession, emptyRetirements, PendingChange (+10 more)

### Community 53 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (11): claude(), clearFixture(), copilot(), disk, event(), fixture(), fixtures, holdOtherWrite() (+3 more)

### Community 54 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 55 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 56 - "HubEvent"
Cohesion: 0.12
Nodes (12): WorkspaceFixture, ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, sessionMuteSchema (+4 more)

### Community 57 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 59 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 60 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 61 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 62 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 63 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 64 - "CopilotClientLike"
Cohesion: 0.11
Nodes (7): CopilotClientLike, holdProbe(), fixtures, gate(), releases, fixtures, CopilotResourceClient

### Community 65 - "ComputerSummary"
Cohesion: 0.20
Nodes (5): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary

### Community 66 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 67 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 68 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 69 - "queued-dispatch.test.ts"
Cohesion: 0.14
Nodes (9): accept(), deferred(), disk, fixture(), fixtures, holdWrite(), prompt(), releases (+1 more)

### Community 70 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 71 - "session-reply-durability.test.ts"
Cohesion: 0.19
Nodes (12): answer(), assistantFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotRequest(), copilotRunFixture(), disk (+4 more)

### Community 72 - "PromptCards.tsx"
Cohesion: 0.22
Nodes (15): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), StaleInteractionRecoveryCard(), UserInputCard(), UserInputFieldControl(), chooseOption() (+7 more)

### Community 73 - "capture"
Cohesion: 0.18
Nodes (15): releaseRecording(), shortcutKeys(), startRecording(), stopRecording(), binding(), bindingLabel(), capturableCode(), isModifierCode() (+7 more)

### Community 74 - "NewSessionDialog"
Cohesion: 0.22
Nodes (15): activateSession(), createSession(), listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder(), computerProviders() (+7 more)

### Community 75 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 76 - "recordValue"
Cohesion: 0.23
Nodes (14): backgroundHandoff(), booleanValue(), notificationKind(), parsedValue(), rawTailText(), recordValue(), shellExitFromValue(), shellIdFromFooter() (+6 more)

### Community 77 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 78 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 79 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 80 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 81 - "session-response-order.ts"
Cohesion: 0.27
Nodes (11): sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence(), projectSessionResponse(), rememberSessionResponse(), responseSequences (+3 more)

### Community 82 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 83 - "BackgroundTasksDialog.tsx"
Cohesion: 0.27
Nodes (9): BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel(), taskIsActive(), taskStatusLabel() (+1 more)

### Community 84 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 85 - "submission-error.ts"
Cohesion: 0.31
Nodes (6): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, SubmissionError, SubmissionReceipt

### Community 87 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 88 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 89 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 90 - "session-store-durability.test.ts"
Cohesion: 0.31
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 91 - "composerHoldsText"
Cohesion: 0.42
Nodes (9): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), pasteCouldCollapse(), pastedPlaceholderCount(), qualifyingPasteCount() (+1 more)

### Community 92 - "KnowledgeRootChoices.tsx"
Cohesion: 0.25
Nodes (7): KnowledgeRootChoice, KnowledgeRootChoices(), KnowledgeRootSession, actions, computers, root, session

### Community 93 - "KnowledgePosition"
Cohesion: 0.36
Nodes (4): WorkspaceFixtureOptions, KnowledgePosition, KnowledgeRestoreState, base

### Community 94 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 95 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 96 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 97 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 98 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 102 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **619 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+614 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 932 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `SessionDetail` to `claude-agent-service.ts`, `contracts.ts`, `agent-service.ts`, `.get`, `.readAfterWrites`, `queued-provider-dispatch.test.ts`, `BackgroundTaskSnapshot`, `directory-browser.ts`, `.discoverSessions`, `session-resource-routes.test.ts`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `connect()` connect `SessionStore` to `ClaudeAgentService`, `ProviderSessionService`, `.get`, `SessionDetail`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `directory-browser.ts`, `claude-agent-service.ts`, `contracts.ts`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _619 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03628401626524867 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.028375286041189933 - nodes in this community are weakly interconnected._
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
