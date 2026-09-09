# Agentic Remote - Graphify code map

Snapshot: `dceaa885b687dde1bf3680324c0b18c870033aeeca38753e9e40cb6c1f4add17`

Source checkout: `5d58cecae512394601cb52f23fd79ca87eceb81c`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 205 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 205 files · ~427,459 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3282 nodes · 9213 edges · 136 communities (98 shown, 24 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 682 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App
- api.ts
- App.tsx
- AgentService
- SessionDetail
- queued-dispatch.test.ts
- claude-agent-service.ts
- contracts.ts
- agentic-remote-promotion-monitor
- session-presentation.ts
- transcription-service.ts
- .get
- session-store.ts
- terminal-session.ts
- ComputerManager
- RemoteNodeClient
- agent-service.ts
- WorkspaceDialog
- bundle
- FakeSessionService
- TmuxTerminalSessionController
- SessionService
- ProviderSessionService
- lib.rs
- workspace-fixtures.ts
- background-task-adapter.ts
- config.rs
- ClaudeAgentService
- shell.ts
- pwa.ts
- devDependencies
- node-routes.ts
- dependencies
- agentic-remote
- hub-routes.ts
- session-knowledge-routes.test.ts
- app.ts
- agentic-remote-promotion-setup
- TerminalSessionController
- terminal-startup-queue.test.ts
- .publishError
- ComputerSummary
- scripts
- session-reply-durability.test.ts
- session-resource-clear.test.ts
- compilerOptions
- BackgroundTasksDialog.tsx
- .runQuery
- active-sessions.ts
- directory-browser.ts
- tmux-errors.integration.test.ts
- session-clear-transcript.test.ts
- terminal-session.test.ts
- capture-workspace.ts
- recordValue
- knowledge-tree.ts
- HubEvent
- compilerOptions
- PushNotificationService
- session-store-providers.test.ts
- compilerOptions
- compilerOptions
- recordValue
- event-log.ts
- workspace-browser.ts
- NodeIdentityStore
- session-enqueue-clear.test.ts
- use-session-knowledge-root.ts
- ReaderWorkspace
- background-task-stop.test.ts
- session-resource-providers.test.ts
- recovery-resend-durability.test.ts
- SessionKnowledgeStore
- session-resource-routes.test.ts
- PromptCards.tsx
- session-response-order.ts
- session-knowledge-store.ts
- desktop.json
- registerSessionKnowledgeRoutes
- capture-workbench-review.ts
- package.json
- .oxlintrc.json
- settings-local.json
- promotion-monitor.test.ts
- scripts
- submission-error.ts
- session-knowledge-routes.ts
- session-store-durability.test.ts
- DeferredSession
- RuntimeModelOption
- bridge.rs
- screenshot-stability.test.ts
- KnowledgePosition
- remote-node-client.test.ts
- composerHoldsText
- listDirectories
- .restore
- SessionFileUpload
- recovery-context.ts
- session-knowledge-store.test.ts
- settings.ts
- toolActivityContent
- agent-service.test.ts
- composer-layout.test.ts
- release-publication.test.ts
- MarkdownCodeBlock.tsx
- removeComputer
- hasRunningBackgroundAgent
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
1. `SessionDetail` - 272 edges
2. `App()` - 227 edges
3. `AgentService` - 207 edges
4. `SessionStore` - 147 edges
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

## Communities (136 total, 24 thin omitted)

### Community 0 - "App"
Cohesion: 0.03
Nodes (151): deleteSession(), listKnowledgeEntries(), moveSessionToTmux(), readKnowledgeFile(), removeQueuedPrompt(), restartSession(), transcribeAudio(), uploadSessionFile() (+143 more)

### Community 1 - "api.ts"
Cohesion: 0.04
Nodes (105): parseSubmissionReceipt(), submissionReceiptFromError(), activateSession(), addKnowledgeRoot(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRuntime() (+97 more)

### Community 2 - "App.tsx"
Cohesion: 0.03
Nodes (94): accentIconUrl(), applyAccentIcon(), AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage() (+86 more)

### Community 3 - "AgentService"
Cohesion: 0.05
Nodes (7): agentMode(), AgentService, isMissingSessionError(), removeCopilotSessionFiles(), RuntimeConfigurationError, fixture(), TranscriptObservation

### Community 4 - "SessionDetail"
Cohesion: 0.06
Nodes (25): fixture(), connect(), createStore(), fixture(), recoveryFixture(), fixture(), claudeFixture(), copilotFixture() (+17 more)

### Community 5 - "queued-dispatch.test.ts"
Cohesion: 0.04
Nodes (36): CopilotSessionLike, configurableModel(), FakeCopilotClient, startupFifoFixture(), CopilotTasksApi, acceptanceReceipt(), errorMessage(), explicitlyRefused() (+28 more)

### Community 6 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (55): AuthStatusRunner, ClaudeAgentServiceEvents, ClaudeQuestion, ClaudeResources, execFileAsync, PendingClaudeInput, PendingClaudePermission, PendingClaudeReply (+47 more)

### Community 7 - "contracts.ts"
Cohesion: 0.07
Nodes (51): managers, releases, remote, RegistryState, directories, StoredNodeIdentity, ProviderSessionServiceEvents, provider() (+43 more)

### Community 8 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (67): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+59 more)

### Community 9 - "session-presentation.ts"
Cohesion: 0.06
Nodes (48): react, DialogFrame(), KnowledgeRootSelector(), root, SessionFilter, sessionNavigationView, computers, first (+40 more)

### Community 10 - "transcription-service.ts"
Cohesion: 0.06
Nodes (34): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+26 more)

### Community 11 - ".get"
Cohesion: 0.11
Nodes (4): isUncertainDelivery(), queueConflict(), isTerminalAgentWorking(), deliveryUncertaintyFromError()

### Community 12 - "session-store.ts"
Cohesion: 0.04
Nodes (34): CopilotClientLike, holdProbe(), fixtures, gate(), releases, deferred(), disk, enqueue() (+26 more)

### Community 13 - "terminal-session.ts"
Cohesion: 0.10
Nodes (46): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), COMPOSER_PLACEHOLDERS, containsCopiedInteractiveFrame(), desktopInstallPromptIdentity(), findTerminalWrappedText() (+38 more)

### Community 14 - "ComputerManager"
Cohesion: 0.16
Nodes (7): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedRemovedQueuedPrompt, ManagedSession, SessionListing

### Community 15 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (6): RemoteResync, RemoteSessionRead, headerSafe(), RemoteNodeClient, NodeInfo, RemovedQueuedPrompt

### Community 16 - "agent-service.ts"
Cohesion: 0.05
Nodes (44): AcceptedSdkReply, ActivePrompt, activityDuration(), ActivityToolStart, AgentServiceEvents, ansiSequence, commandShortcut(), CreationRuntime (+36 more)

### Community 17 - "WorkspaceDialog"
Cohesion: 0.09
Nodes (38): executeCommand(), searchWorkspace(), ChangeDirectoryDialog(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor(), MarkdownImage() (+30 more)

### Community 18 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 19 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 20 - "TmuxTerminalSessionController"
Cohesion: 0.12
Nodes (13): composer(), processAdapter, copilotCommand(), execFileAsync, processAncestors(), processCommand(), submitTerminalForm(), terminalChecklistState() (+5 more)

### Community 23 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 24 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (31): pageFor(), accents, Measurement, originalDocument, output, report, save(), scratch (+23 more)

### Community 25 - "background-task-adapter.ts"
Cohesion: 0.13
Nodes (37): addActivity(), BackgroundTaskEventOptions, backgroundTasksFromEvents(), boundedText(), CopilotTaskInfo, CopilotTaskProgress, errorValue(), eventTask() (+29 more)

### Community 26 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 28 - "shell.ts"
Cohesion: 0.10
Nodes (31): bridge(), decodeSegment(), method(), key(), label(), NotifiableSession, notificationState(), requestId() (+23 more)

### Community 29 - "pwa.ts"
Cohesion: 0.11
Nodes (30): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), checkForUpdate() (+22 more)

### Community 30 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 31 - "node-routes.ts"
Cohesion: 0.06
Nodes (28): ActiveClaudeQuery, AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema (+20 more)

### Community 32 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, fastify, @fastify/static, @fastify/websocket, ffmpeg-static (+25 more)

### Community 33 - "agentic-remote"
Cohesion: 0.14
Nodes (30): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+22 more)

### Community 34 - "hub-routes.ts"
Cohesion: 0.07
Nodes (28): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+20 more)

### Community 35 - "session-knowledge-routes.test.ts"
Cohesion: 0.10
Nodes (16): WorkspaceFixtureState, ServerRole, SessionMetadataLookup, KnowledgeState, KnowledgeStore, directories, disk, FakeManager (+8 more)

### Community 36 - "app.ts"
Cohesion: 0.11
Nodes (18): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), transcriptionComputerName(), FileUploadError (+10 more)

### Community 37 - "agentic-remote-promotion-setup"
Cohesion: 0.13
Nodes (28): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), enable_monitor(), EXAMPLE_PROFILE, init_profile() (+20 more)

### Community 38 - "TerminalSessionController"
Cohesion: 0.10
Nodes (5): isForegroundCompletionEvent(), isForegroundLifecycleEvent(), statusFromEvents(), TerminalSessionController, SessionStatus

### Community 39 - "terminal-startup-queue.test.ts"
Cohesion: 0.13
Nodes (23): findActiveCopilotSessions(), directories, execFileAsync, processExists(), tmuxSessions, waitForProcessExit(), directories, exec (+15 more)

### Community 41 - "ComputerSummary"
Cohesion: 0.12
Nodes (12): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, ComputerSummary, KnowledgeRootChoice, KnowledgeRootChoices(), KnowledgeRootSession (+4 more)

### Community 42 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 43 - "session-reply-durability.test.ts"
Cohesion: 0.14
Nodes (15): answer(), assistantFixture(), claudeFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRequest() (+7 more)

### Community 44 - "session-resource-clear.test.ts"
Cohesion: 0.11
Nodes (21): apps, directories, directory(), obstructUploads(), pairedFixture(), providerFixture(), providers, seed() (+13 more)

### Community 45 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 46 - "BackgroundTasksDialog.tsx"
Cohesion: 0.14
Nodes (15): backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint(), BackgroundTask, BackgroundTaskCard(), BackgroundTasksDialog() (+7 more)

### Community 47 - ".runQuery"
Cohesion: 0.12
Nodes (4): isClaudeAuthenticationError(), isMissingClaudeSessionError(), waitForIdle(), toolResultText()

### Community 48 - "active-sessions.ts"
Cohesion: 0.20
Nodes (22): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates(), isCopilotProcess() (+14 more)

### Community 49 - "directory-browser.ts"
Cohesion: 0.19
Nodes (12): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+4 more)

### Community 50 - "tmux-errors.integration.test.ts"
Cohesion: 0.13
Nodes (18): execFileAsync, headers, ignoreMissing(), removeFixture(), seedSession(), sessionLog(), noTmuxServer(), processGone() (+10 more)

### Community 51 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (10): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixture(), fixtures, gate() (+2 more)

### Community 52 - "terminal-session.test.ts"
Cohesion: 0.11
Nodes (17): listTmuxSessions(), parseTerminalUpdateNotice(), safeWindowName(), bracketedTabPane, clearFixture(), desktopInstallPane, directories, execFileAsync (+9 more)

### Community 53 - "capture-workspace.ts"
Cohesion: 0.20
Nodes (20): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+12 more)

### Community 54 - "recordValue"
Cohesion: 0.24
Nodes (18): activityGroupIdFor(), activityKind(), activityResult(), contextTextLength(), estimatedContextTokens(), eventAgentId(), eventContextLength(), isBackgroundTaskEvent() (+10 more)

### Community 55 - "knowledge-tree.ts"
Cohesion: 0.17
Nodes (18): WorkspaceEntry, knowledgeTreeKeyDown(), toggleKnowledgeFolder(), collapseKnowledgeFolder(), expandKnowledgeFolder(), knowledgeAncestors(), KnowledgeCrumb, knowledgeCrumbs() (+10 more)

### Community 56 - "HubEvent"
Cohesion: 0.12
Nodes (12): WorkspaceFixture, ComputerManagerEvents, brief(), HubEventSource, PushSender, PushState, directories, sessionMuteSchema (+4 more)

### Community 57 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 59 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 60 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 61 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 62 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 63 - "event-log.ts"
Cohesion: 0.21
Nodes (17): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+9 more)

### Community 64 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 65 - "NodeIdentityStore"
Cohesion: 0.18
Nodes (4): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore

### Community 66 - "session-enqueue-clear.test.ts"
Cohesion: 0.15
Nodes (13): ClaudeSdk, directories, fixture(), queryHandle(), disk, EnqueueCase, fixtures, gate() (+5 more)

### Community 67 - "use-session-knowledge-root.ts"
Cohesion: 0.21
Nodes (12): getSessionKnowledgeRoot(), requestSessionKnowledgeRoot(), SessionKnowledgeRequestError, updateSessionKnowledgeRoot(), binding, bindingKey(), knowledgePositionForBinding(), SessionIdentity (+4 more)

### Community 68 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 69 - "background-task-stop.test.ts"
Cohesion: 0.21
Nodes (13): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), snapshot() (+5 more)

### Community 70 - "session-resource-providers.test.ts"
Cohesion: 0.18
Nodes (13): claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures (+5 more)

### Community 71 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 73 - "session-resource-routes.test.ts"
Cohesion: 0.16
Nodes (8): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription

### Community 74 - "PromptCards.tsx"
Cohesion: 0.22
Nodes (15): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), StaleInteractionRecoveryCard(), UserInputCard(), UserInputFieldControl(), chooseOption() (+7 more)

### Community 75 - "session-response-order.ts"
Cohesion: 0.20
Nodes (14): recoverConversation(), adoptConversationReplacement(), recoverSelectedConversation(), sortSessions(), upsertSessionSnapshot(), carrySnapshotTranscripts(), currentSessionEventSequence(), nextSessionEventSequence() (+6 more)

### Community 76 - "session-knowledge-store.ts"
Cohesion: 0.15
Nodes (12): bindingSchema, Identity, recoverySchema, RootCatalog, rootSchema, SessionKnowledgeConflictError, SessionKnowledgeEvents, State (+4 more)

### Community 77 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 78 - "registerSessionKnowledgeRoutes"
Cohesion: 0.30
Nodes (11): registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession(), recordReplacement() (+3 more)

### Community 79 - "capture-workbench-review.ts"
Cohesion: 0.17
Nodes (10): frame(), geometry, output, scratch, screenshot(), { values }, fixtureSessions, IDLE_SESSION_ID (+2 more)

### Community 80 - "package.json"
Cohesion: 0.15
Nodes (11): directory, { values }, workflows, name, packageManager, pnpm, onlyBuiltDependencies, private (+3 more)

### Community 81 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): ignorePatterns, plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/** (+4 more)

### Community 82 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 83 - "promotion-monitor.test.ts"
Cohesion: 0.30
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 84 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, check, dev, dev:server, dev:web, lint, start (+3 more)

### Community 86 - "submission-error.ts"
Cohesion: 0.31
Nodes (6): RemoteNodeRedirectError, RemoteNodeRequestError, httpDeliveryUncertain(), legacyDefinitiveHttpRefusals, SubmissionError, SubmissionReceipt

### Community 87 - "session-knowledge-routes.ts"
Cohesion: 0.18
Nodes (6): Lineage, RegistrationGeneration, ReplacementEvidence, SessionKnowledgeLifecycle, sessionParams, updateSchema

### Community 88 - "session-store-durability.test.ts"
Cohesion: 0.27
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 91 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 92 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 93 - "KnowledgePosition"
Cohesion: 0.33
Nodes (5): WorkspaceFixtureOptions, KnowledgePosition, knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 94 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 95 - "composerHoldsText"
Cohesion: 0.42
Nodes (9): composerHoldsOtherText(), composerHoldsText(), composerText(), composerTookPaste(), occurrences(), pasteCouldCollapse(), pastedPlaceholderCount(), qualifyingPasteCount() (+1 more)

### Community 96 - "listDirectories"
Cohesion: 0.33
Nodes (9): listDirectories(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse(), moveSessionToBrowsedFolder(), DefaultSessionFolderControl(), browse(), chooseFolder() (+1 more)

### Community 99 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 100 - "session-knowledge-store.test.ts"
Cohesion: 0.33
Nodes (5): disk, fixture(), fixtures, releases, root()

### Community 101 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 102 - "toolActivityContent"
Cohesion: 0.40
Nodes (6): previewText(), readableMcpServerName(), readableToolName(), sameToolLabel(), stripAnsi(), toolActivityContent()

### Community 103 - "agent-service.test.ts"
Cohesion: 0.33
Nodes (4): terminalFormSteps(), directories, services, UserInputForm

### Community 104 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 105 - "release-publication.test.ts"
Cohesion: 0.40
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 106 - "MarkdownCodeBlock.tsx"
Cohesion: 0.40
Nodes (3): MarkdownCodeBlock(), copy(), originalClipboard

### Community 107 - "removeComputer"
Cohesion: 0.60
Nodes (5): addComputer(), removeComputer(), ComputersDialog(), remove(), submit()

### Community 110 - "MermaidDiagram.tsx"
Cohesion: 0.67
Nodes (3): drawDiagram(), drawing, MermaidDiagram()

## Knowledge Gaps
- **620 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+615 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 933 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RemoteNodeClient` connect `RemoteNodeClient` to `directory-browser.ts`, `SessionFileUpload`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `SessionService` connect `SessionService` to `claude-agent-service.ts`, `contracts.ts`, `ComputerManager`, `directory-browser.ts`, `ProviderSessionService`, `node-routes.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Why does `ComputerManager` connect `ComputerManager` to `NodeIdentityStore`, `ComputerSummary`, `claude-agent-service.ts`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _620 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03152049648864935 - nodes in this community are weakly interconnected._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03567493112947658 - nodes in this community are weakly interconnected._
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
