# Agentic Remote - Graphify code map

Snapshot: `3c41e8ac6a0b5a46e477b71c22be2777b49c6a964194421d20849dacc2993779`

Source checkout: `34158d1d167c484b408c579db00ed6bbfe82961d`; working-tree contents are hashed in `metadata.json`. Check freshness by content, not by comparing HEAD.

Run `python3 graphify/manage.py check` before querying and `python3 graphify/manage.py update` after source changes.

All 266 tracked code files in scope have source nodes. Parsing, resolution, community labels, and queries are local; no model or external API is used. Imports can point to external package identifiers rather than local files.

Documentation, styles, images, and other non-code files are inventoried but **not semantically extracted**. Runtime routing and dynamic behavior must still be confirmed in source.


## Corpus Check
- 266 files · ~546,366 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4112 nodes · 11657 edges · 150 communities (114 shown, 21 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 801 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AgentService
- App
- App.tsx
- SessionDetail
- SessionStore
- App.test.tsx
- session-store.ts
- agent-service.ts
- claude-agent-service.ts
- contracts.ts
- CopilotSessionLike
- session-knowledge-store.ts
- agentic-remote-promotion-monitor
- terminal-session.ts
- manager-agent.ts
- session-presentation.ts
- TmuxTerminalSessionController
- ManagerAgent
- markdown-navigation.ts
- hub-routes.ts
- manager-tools.ts
- ManagedSession
- RemoteNodeClient
- api.ts
- tmux-test-helpers.ts
- FakeSessionService
- bundle
- manager-store.ts
- TerminalSessionController
- ProviderSessionService
- workspace-fixtures.ts
- pwa.ts
- lib.rs
- .sendInternal
- shell.ts
- SessionService
- agentic-remote-promotion-setup
- config.rs
- session-knowledge-routes.test.ts
- knowledge-tree.ts
- devDependencies
- agentic-remote
- dependencies
- active-sessions.ts
- normalizeKnowledgeRelativePath
- SessionOrderStore
- terminal-startup-queue.test.ts
- node-routes.ts
- terminal-session.test.ts
- background-task-adapter.ts
- cli-canary.ts
- scripts
- app.ts
- tmux-errors.integration.test.ts
- ManagerStore
- compilerOptions
- directory-browser.ts
- transcription-service.ts
- ManagerAssistant.tsx
- .createSession
- ManagerMessage
- capture-workspace.ts
- delegated-transcription-service.ts
- ComputerSummary
- startup-phases.test.ts
- PushNotificationService
- session-resource-clear.test.ts
- ManagerAssistant
- HubEvent
- session-clear-transcript.test.ts
- PromptCards.tsx
- compilerOptions
- session-store-providers.test.ts
- compilerOptions
- compilerOptions
- session-resource-routes.test.ts
- recordValue
- .toolHost
- ManagerMemory
- session-reply-durability.test.ts
- workspace-browser.ts
- backgroundTasksFromEvents
- ReaderWorkspace
- OracleSettings.tsx
- NewSessionDialog
- recovery-resend-durability.test.ts
- background-task-stop.test.ts
- BackgroundTasksDialog.tsx
- check-workspace-review-regressions.ts
- terminal-form-deadline.test.ts
- react
- desktop.json
- session-resource-providers.test.ts
- TranscriptionError
- settings-local.json
- promotion-monitor.test.ts
- scripts
- background-task-tracker.ts
- html-preview.ts
- .oxlintrc.json
- generate-pwa-icons.ts
- DeferredSession
- bridge.rs
- screenshot-stability.test.ts
- promotion-setup-execution.test.ts
- remote-node-client.test.ts
- session-store-durability.test.ts
- tmux-errors.test.ts
- deleteSession
- package.json
- release-publication.test.ts
- render-workspace-gifs.ts
- transcription-routes.ts
- recovery-context.ts
- settings.ts
- composer-layout.test.ts
- knowledge-restore.ts
- usePanelWidth
- KnowledgeRootChoices.test.tsx
- FakeRecorder
- terminal-send-uncertainty.test.ts
- version-policy.test.ts
- MermaidDiagram.test.tsx
- tsconfig.json
- vite.config.ts
- fastify
- ffmpeg-static
- ffprobe-static
- @github/copilot-sdk
- pdfjs-dist
- web-push
- ws
- sw.js
- recovery-question-styles.test.ts
- agentic-remote-shell

## God Nodes (most connected - your core abstractions)
1. `SessionDetail` - 276 edges
2. `App()` - 259 edges
3. `AgentService` - 235 edges
4. `SessionStore` - 162 edges
5. `ClaudeAgentService` - 120 edges
6. `ManagedSession` - 91 edges
7. `ComputerManager` - 82 edges
8. `registerHubRoutes()` - 78 edges
9. `SessionService` - 71 edges
10. `TmuxTerminalSessionController` - 67 edges

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

## Communities (150 total, 21 thin omitted)

### Community 0 - "AgentService"
Cohesion: 0.05
Nodes (11): agentMode(), AgentService, isMissingSessionError(), isUncertainDelivery(), queueConflict(), fixture(), TranscriptObservation, isTerminalAgentWorking() (+3 more)

### Community 1 - "App"
Cohesion: 0.04
Nodes (134): askSession(), replyPermission(), saveSessionVisibility(), activeComposerPastes(), App(), adoptConversationReplacement(), appendComposerForKey(), appKeyDown() (+126 more)

### Community 2 - "App.tsx"
Cohesion: 0.02
Nodes (115): ActivityStatus, AccentTheme, accentThemes, activityKindFromMessage(), ActivityMessage(), activityPresentation(), activityStatusFromMessage(), activityStatusGlyph() (+107 more)

### Community 3 - "SessionDetail"
Cohesion: 0.05
Nodes (5): ClaudeAgentService, isMissingClaudeSessionError(), observe(), copilotRequest(), SessionDetail

### Community 4 - "SessionStore"
Cohesion: 0.05
Nodes (35): normalizedTitle(), fixture(), holdProbe(), fixtures, gate(), releases, restart(), fixture() (+27 more)

### Community 5 - "App.test.tsx"
Cohesion: 0.03
Nodes (86): addKnowledgeRoot(), bootstrapSessionOrder(), cancelBackgroundTask(), cancelSession(), clearConversation(), configureRuntime(), dispatchQueuedPrompt(), fetchSessionOrder() (+78 more)

### Community 6 - "session-store.ts"
Cohesion: 0.03
Nodes (72): CopilotClientLike, directories, fakeClient(), ForkRequest, forkSession(), services, ClaudeSdk, cleanupFixtures() (+64 more)

### Community 7 - "agent-service.ts"
Cohesion: 0.05
Nodes (74): AcceptedSdkReply, ActivePrompt, activityDuration(), activityGroupIdFor(), activityKind(), activityResult(), ActivityToolStart, AgentServiceEvents (+66 more)

### Community 8 - "claude-agent-service.ts"
Cohesion: 0.07
Nodes (56): ActiveClaudeQuery, AuthStatusRunner, ClaudeQuestion, ClaudeResources, execFileAsync, isClaudeAuthenticationError(), PendingClaudeInput, PendingClaudePermission (+48 more)

### Community 9 - "contracts.ts"
Cohesion: 0.06
Nodes (52): ClaudeAgentServiceEvents, managers, releases, remote, RemoteResync, RemoteSessionRead, RegistryState, directories (+44 more)

### Community 10 - "CopilotSessionLike"
Cohesion: 0.04
Nodes (37): CopilotSessionLike, configurableModel(), FakeCopilotClient, probeService(), startupFifoFixture(), terminalService(), CopilotTasksApi, acceptanceReceipt() (+29 more)

### Community 11 - "session-knowledge-store.ts"
Cohesion: 0.05
Nodes (46): Lineage, registerSessionKnowledgeRoutes(), generationFor(), knownPredecessors(), knownSessionGuard(), markRemoved(), reconcileReplacement(), reconcileSession() (+38 more)

### Community 12 - "agentic-remote-promotion-monitor"
Cohesion: 0.06
Nodes (71): agentic-remote-promotion-monitor script, ALLOWED_ORIGINS, ALLOWED_ROOTS, assert_clean(), assert_disposable(), assert_repository(), canonical_path(), cleanup_validation_worktree() (+63 more)

### Community 13 - "terminal-session.ts"
Cohesion: 0.06
Nodes (63): boxedComposerFrame(), captureTerminal(), COMPOSER_PLACEHOLDERS, composerFocusedPanes, composerFrameText(), composerHasFocus(), composerRowText(), cursorComposerFrame() (+55 more)

### Community 14 - "manager-agent.ts"
Cohesion: 0.05
Nodes (35): ManagerEventSource, discover(), isPending(), isQueued(), ManagerAgentOptions, ManagerSdkClient, ManagerSdkEvent, ManagerSdkSession (+27 more)

### Community 15 - "session-presentation.ts"
Cohesion: 0.06
Nodes (52): SessionExecutionMode, saveSessionOrderLane(), handleDragEnd(), KnowledgeRootSelector(), root, reorderSessionLaneWithHiddenFollowers(), SessionFilter, sessionNavigationView (+44 more)

### Community 16 - "TmuxTerminalSessionController"
Cohesion: 0.09
Nodes (17): question(), fixture(), copilotCommand(), endProbeSession(), execFileAsync, listTmuxSessions(), processAncestors(), processCommand() (+9 more)

### Community 17 - "ManagerAgent"
Cohesion: 0.10
Nodes (10): checkContent(), delay(), errorMessage(), isNotFound(), ManagerAgent, sameRuntime(), TurnError, withTimeout() (+2 more)

### Community 18 - "markdown-navigation.ts"
Cohesion: 0.07
Nodes (43): executeCommand(), listWorkspace(), ChangeDirectoryDialog(), browseDirectory(), submit(), followMarkdownLink(), KnowledgeReader(), markdownComponentsFor() (+35 more)

### Community 19 - "hub-routes.ts"
Cohesion: 0.05
Nodes (46): addComputerSchema, configureRuntimeSchema, createSessionSchema, directoryQuerySchema, directoryValidationSchema, discardQueuedDispatchSchema, executeCommandSchema, hostAllowed() (+38 more)

### Community 20 - "manager-tools.ts"
Cohesion: 0.07
Nodes (25): APPROVE_WORDS, computerField, createManagerTools(), define(), deliver(), requireComputer(), resolveSession(), trustFolder() (+17 more)

### Community 21 - "ManagedSession"
Cohesion: 0.16
Nodes (6): ComputerManager, managedSession(), RemoteSessionListing, registerHubRoutes(), ManagedSession, SessionListing

### Community 22 - "RemoteNodeClient"
Cohesion: 0.06
Nodes (7): headerSafe(), RemoteNodeClient, hasActiveBackgroundTasks(), BackgroundTaskSnapshot, RemovedQueuedPrompt, WorkspaceFile, WorkspaceListing

### Community 23 - "api.ts"
Cohesion: 0.08
Nodes (38): RemoteNodeRedirectError, RemoteNodeRequestError, ManagedSessionMcpServersSnapshot, ManagedSessionSkillsSnapshot, SessionMcpServerSummary, SessionResourceSource, SessionSkillSummary, httpDeliveryUncertain() (+30 more)

### Community 24 - "tmux-test-helpers.ts"
Cohesion: 0.10
Nodes (37): exec, formFixture(), horizontalFormFixture(), textFieldFormFixture(), directories, exec, noTmuxServer(), processGone() (+29 more)

### Community 25 - "FakeSessionService"
Cohesion: 0.06
Nodes (4): FakeSessionService, routingFixture(), session(), temporaryDirectory()

### Community 26 - "bundle"
Cohesion: 0.05
Nodes (43): agentic, app, appimage, deb, desktop, dmg, icons/128x128@2x.png, icons/128x128.png (+35 more)

### Community 27 - "manager-store.ts"
Cohesion: 0.10
Nodes (27): ago(), attentionRank(), buildTurnContext(), changeLines(), clock(), MANAGER_SYSTEM_PROMPT, managerPrompt(), oneLine() (+19 more)

### Community 28 - "TerminalSessionController"
Cohesion: 0.09
Nodes (9): persistedFormAnswer(), removeCopilotSessionFiles(), TerminalFormContinuation, validateUserInputForm(), formReplyExpired(), TerminalFormReplyError, TerminalSessionController, PendingUserInput (+1 more)

### Community 30 - "workspace-fixtures.ts"
Cohesion: 0.08
Nodes (32): frame(), geometry, output, pageFor(), scratch, screenshot(), { values }, createWorkspaceFixtureState() (+24 more)

### Community 31 - "pwa.ts"
Cohesion: 0.10
Nodes (36): directories, AppVersion, parseAppVersion(), deletePushSubscription(), getPushPublicKey(), savePushSubscription(), applyPwaUpdate(), sidebarTouchStart() (+28 more)

### Community 32 - "lib.rs"
Cohesion: 0.14
Nodes (34): AppHandle, HubConfig, IntoIterator, Item, Mutex, bridge_ready(), build_tray(), config_dir() (+26 more)

### Community 33 - ".sendInternal"
Cohesion: 0.13
Nodes (34): activeBottomFrame(), capturePane(), cleanDialogLine(), clearAutomaticStartupPrompts(), composerFocusWitnessed(), composerHoldsOtherText(), composerHoldsText(), composerText() (+26 more)

### Community 34 - "shell.ts"
Cohesion: 0.10
Nodes (34): attentionCount(), bridge(), decodeSegment(), method(), nativeShell(), key(), label(), NotifiableSession (+26 more)

### Community 36 - "agentic-remote-promotion-setup"
Cohesion: 0.12
Nodes (35): agentic-remote-promotion-setup script, CONFIG_DIR, create_runtime_worktree(), die(), disable_monitor(), disarm_timer(), enable_monitor(), EXAMPLE_PROFILE (+27 more)

### Community 37 - "config.rs"
Cohesion: 0.11
Nodes (14): Duration, Fn, Path, HubConfig, normalize_origin(), normalize_url(), reachable(), Option (+6 more)

### Community 38 - "session-knowledge-routes.test.ts"
Cohesion: 0.10
Nodes (16): ServerRole, SessionMetadataLookup, KnowledgeRootReservation, KnowledgeState, KnowledgeStore, directories, disk, FakeManager (+8 more)

### Community 39 - "knowledge-tree.ts"
Cohesion: 0.09
Nodes (35): WorkspaceEntry, listKnowledgeEntries(), readKnowledgeFile(), applyRootChoice(), cancelKnowledgeRestore(), collapseKnowledgeTree(), createRoot(), knowledgeBasePathFor() (+27 more)

### Community 40 - "devDependencies"
Cohesion: 0.06
Nodes (35): concurrently, jsdom, oxlint, devDependencies, concurrently, jsdom, oxlint, @playwright/test (+27 more)

### Community 41 - "agentic-remote"
Cohesion: 0.13
Nodes (31): agentic-remote script, COMMAND_LINK, CONFIG_DIR, config_value(), derived_origins(), die(), enable_linger(), ENV_FILE (+23 more)

### Community 42 - "dependencies"
Cohesion: 0.06
Nodes (33): @anthropic-ai/claude-agent-sdk, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, @fastify/multipart, @fastify/static, @fastify/websocket, lucide-react (+25 more)

### Community 43 - "active-sessions.ts"
Cohesion: 0.14
Nodes (29): ActiveProcess, execFileAsync, findActiveCopilotProcesses(), findActiveCopilotSessions(), findActiveProcesses(), getBootTimeMs(), getClockTicks(), groupLockCandidates() (+21 more)

### Community 44 - "normalizeKnowledgeRelativePath"
Cohesion: 0.13
Nodes (23): joinKnowledgeRelativePath(), knowledgeAbsolutePath(), knowledgeRelativePathFromAbsolute(), normalizeKnowledgeRelativePath(), rebaseKnowledgeRelativePath(), slashPath(), getSessionKnowledgeRoot(), requestSessionKnowledgeRoot() (+15 more)

### Community 45 - "SessionOrderStore"
Cohesion: 0.15
Nodes (12): directories, fakeManager(), hub(), orderStore(), laneFrom(), sameLane(), sessionOrderKey(), SessionOrderState (+4 more)

### Community 46 - "terminal-startup-queue.test.ts"
Cohesion: 0.14
Nodes (25): appendLines(), cacheKey(), copilotHome(), eventLogPath(), forgetSessionEvents(), ParsedLog, parsedLogs, readAt() (+17 more)

### Community 47 - "node-routes.ts"
Cohesion: 0.07
Nodes (27): MAX_SESSION_FILE_BYTES, SessionParams, supportedExtensions, supportsSessionFile(), AUDIO_FILENAME_HEADER, AUDIO_TYPE_HEADER, configureRuntimeSchema, createSessionSchema (+19 more)

### Community 48 - "terminal-session.test.ts"
Cohesion: 0.09
Nodes (22): paneEvidenceCount(), paneShowsText(), parseTerminalUpdateNotice(), terminalFormCommitKeys(), bracketedTabPane, deliveryFixture(), desktopInstallPane, directories (+14 more)

### Community 49 - "background-task-adapter.ts"
Cohesion: 0.10
Nodes (24): BackgroundTaskEventOptions, CopilotClientTaskInfo, CopilotClientTaskProgress, CopilotTaskInfo, CopilotTaskProgress, isBackgroundTaskInfo(), isBackgroundTaskProgress(), isLiveTaskStatus() (+16 more)

### Community 50 - "cli-canary.ts"
Cohesion: 0.14
Nodes (10): CliCanary, CliCanaryDependencies, CliCanaryResult, CliCanaryState, cliCanaryStateFile(), createCliCanary(), execFileAsync, readCopilotVersion() (+2 more)

### Community 51 - "scripts"
Cohesion: 0.07
Nodes (26): dependencies, @tauri-apps/api, description, devDependencies, @tauri-apps/cli, typescript, vite, typescript (+18 more)

### Community 52 - "app.ts"
Cohesion: 0.13
Nodes (18): prefixes, session, trusted, untrusted, buildApp(), errorStatusCode(), isAppleTouchIconProbe(), transcriptionComputerName() (+10 more)

### Community 53 - "tmux-errors.integration.test.ts"
Cohesion: 0.12
Nodes (11): ComputerRegistry, directories, remoteSnapshotFixture(), NodeIdentityStore, execFileAsync, headers, ignoreMissing(), removeFixture() (+3 more)

### Community 54 - "ManagerStore"
Cohesion: 0.14
Nodes (4): openStore(), emptyState(), ManagerStore, open()

### Community 55 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+16 more)

### Community 56 - "directory-browser.ts"
Cohesion: 0.18
Nodes (13): DirectoryScope, displayPath(), listHomeDirectories(), resolveRequestedPath(), directories, allowedRoots(), homeDirectory(), isWithin() (+5 more)

### Community 57 - "transcription-service.ts"
Cohesion: 0.11
Nodes (19): CommandOptions, CommandResult, CommandRunner, configuredThreads(), defaultCommandRunner(), execFileAsync, ffmpegStatic, ffprobeStatic (+11 more)

### Community 58 - "ManagerAssistant.tsx"
Cohesion: 0.13
Nodes (14): ManagerSessionRef, ManagerSnapshot, resetManager(), resolveManagerConfirmation(), retryManagerMessage(), sendManagerMessage(), sessionLinkTarget(), startOver() (+6 more)

### Community 59 - ".createSession"
Cohesion: 0.13
Nodes (3): RuntimeConfigurationError, SideQuestionError, withSideQuestionTimeout()

### Community 60 - "ManagerMessage"
Cohesion: 0.15
Nodes (11): confirmationSchema, defaultsSchema, editSchema, effort, ManagerRouteAgent, messageParams, registerManagerRoutes(), sendSchema (+3 more)

### Community 61 - "capture-workspace.ts"
Cohesion: 0.19
Nodes (21): assertConversation(), assertLayout(), audit, capture(), desktop(), documentHeading(), expect, frames (+13 more)

### Community 62 - "delegated-transcription-service.ts"
Cohesion: 0.13
Nodes (11): BuildAppOptions, collect(), DelegatedTranscriptionOptions, DelegatedTranscriptionService, oversized(), statusCodeOf(), hubComputer, workstation (+3 more)

### Community 63 - "ComputerSummary"
Cohesion: 0.16
Nodes (6): fixture(), session(), sessionAtLeastAsNew(), RegisteredComputer, TurnContextInput, ComputerSummary

### Community 64 - "startup-phases.test.ts"
Cohesion: 0.12
Nodes (13): phases, port, createStartupPhases(), silentStartupPhases, startManagedServer(), StartupPhaseEvent, StartupPhaseRecord, address (+5 more)

### Community 65 - "PushNotificationService"
Cohesion: 0.25
Nodes (3): brief(), PushNotificationService, registerPushRoutes()

### Community 66 - "session-resource-clear.test.ts"
Cohesion: 0.12
Nodes (19): apps, directories, directory(), obstructUploads(), pairedFixture(), providers, seed(), sockets (+11 more)

### Community 67 - "ManagerAssistant"
Cohesion: 0.13
Nodes (19): cancelManager(), editQueuedManagerMessage(), removeQueuedManagerMessage(), phoneEnterCreatesNewline(), applyEvent(), canTakeFocus(), ManagerAssistant(), act() (+11 more)

### Community 68 - "HubEvent"
Cohesion: 0.11
Nodes (13): WorkspaceFixture, ComputerManagerEvents, HubEventSource, PushSender, PushState, directories, RFC-8030, RFC-8030 (+5 more)

### Community 69 - "session-clear-transcript.test.ts"
Cohesion: 0.11
Nodes (9): Admission, ExclusiveAdmission, PendingQueueAdmission, SessionAdmissions, disk, fixtures, gate(), holdTurnWrite() (+1 more)

### Community 70 - "PromptCards.tsx"
Cohesion: 0.16
Nodes (19): UserInputField, UserInputFieldValue, initialUserInputValues(), PermissionCard(), singleParagraphQuestionHeading(), StaleInteractionRecoveryCard(), question, request (+11 more)

### Community 71 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2022, compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+11 more)

### Community 72 - "session-store-providers.test.ts"
Cohesion: 0.12
Nodes (9): claude(), clearFixture(), copilot(), disk, event(), fixtures, holdOtherWrite(), releases (+1 more)

### Community 73 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 74 - "compilerOptions"
Cohesion: 0.11
Nodes (18): server, compilerOptions, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noUnusedLocals (+10 more)

### Community 75 - "session-resource-routes.test.ts"
Cohesion: 0.13
Nodes (9): apps, dataDirectory(), directories, pairedFixture(), releases, rememberApp(), ResourceService, transcription (+1 more)

### Community 76 - "recordValue"
Cohesion: 0.18
Nodes (19): attachmentModeValue(), backgroundHandoff(), booleanValue(), eventString(), lastForegroundCompletionAt(), normalizedToolName(), notificationKind(), parsedValue() (+11 more)

### Community 78 - "ManagerMemory"
Cohesion: 0.20
Nodes (5): MANAGER_MEMORY_INDEX, ManagerMemory, ManagerMemoryEntry, ManagerMemoryError, ManagerMemoryLimits

### Community 79 - "session-reply-durability.test.ts"
Cohesion: 0.17
Nodes (15): answer(), assistantFixture(), claudeQuestions(), claudeRequest(), claudeRunFixture(), copilotFixture(), copilotRunFixture(), disk (+7 more)

### Community 80 - "workspace-browser.ts"
Cohesion: 0.22
Nodes (15): fileKind(), imageMimeTypes, isWithin(), listWorkspace(), readWorkspaceFile(), relativePath(), resolveWorkspacePath(), searchableExtensions (+7 more)

### Community 81 - "backgroundTasksFromEvents"
Cohesion: 0.27
Nodes (17): addActivity(), backgroundTasksFromEvents(), boundedText(), errorValue(), eventTask(), executionModeValue(), isTerminalTaskStatus(), mergeShellRefresh() (+9 more)

### Community 82 - "ReaderWorkspace"
Cohesion: 0.16
Nodes (8): ReaderWorkspace(), commitWidth(), resizeEnd(), resizeKeyDown(), resizeMove(), readWidth(), storeWidth(), disconnect

### Community 83 - "OracleSettings.tsx"
Cohesion: 0.21
Nodes (11): RuntimeModelOption, getManager(), updateManagerSettings(), setup(), effortFrom(), efforts, OracleSettings(), save() (+3 more)

### Community 84 - "NewSessionDialog"
Cohesion: 0.20
Nodes (16): provider(), activateSession(), createSession(), listDirectories(), listHistory(), validateSessionDirectory(), AddKnowledgeRootDialog(), browse() (+8 more)

### Community 85 - "recovery-resend-durability.test.ts"
Cohesion: 0.13
Nodes (12): directories, disk, gate(), gates, initialize(), PublicSessionValue, runtimes, sdkFixture() (+4 more)

### Community 86 - "background-task-stop.test.ts"
Cohesion: 0.23
Nodes (12): MAX_BACKGROUND_TASKS, completed(), handoff(), launched(), nativeStart(), readExit(), reportedShell(), started() (+4 more)

### Community 87 - "BackgroundTasksDialog.tsx"
Cohesion: 0.22
Nodes (11): BackgroundTask, DialogFrame(), BackgroundTaskCard(), BackgroundTasksDialog(), messageDateTimeFormatter, messageTimeFormatter, stopUnavailableReason(), taskDurationLabel() (+3 more)

### Community 88 - "check-workspace-review-regressions.ts"
Cohesion: 0.15
Nodes (11): accents, Measurement, originalDocument, output, report, save(), scratch, screenshot() (+3 more)

### Community 89 - "terminal-form-deadline.test.ts"
Cohesion: 0.15
Nodes (10): actions, clippedPane(), closedPane, commitKeys, committed, openPane(), Phase, tmux (+2 more)

### Community 90 - "react"
Cohesion: 0.16
Nodes (10): plugins, oxc, react, typescript, MarkdownCodeBlock(), copy(), originalClipboard, drawDiagram() (+2 more)

### Community 91 - "desktop.json"
Cohesion: 0.14
Nodes (13): global-shortcut:default, linux, macOS, windows, description, identifier, main, settings (+5 more)

### Community 92 - "session-resource-providers.test.ts"
Cohesion: 0.22
Nodes (13): claudeFixture(), ClaudeMcpRead, copilotFixture(), deferred(), directory(), DiscoveredMcp, DiscoveredSkills, fixtures (+5 more)

### Community 93 - "TranscriptionError"
Cohesion: 0.26
Nodes (4): LocalTranscriptionService, sha256(), fixture(), TranscriptionError

### Community 94 - "settings-local.json"
Cohesion: 0.15
Nodes (12): allow-hub-config, allow-open-settings, allow-save-hub-config, core:default, description, identifier, main, settings (+4 more)

### Community 95 - "promotion-monitor.test.ts"
Cohesion: 0.27
Nodes (10): advanceMain(), calls(), Fixture, fixtures, git(), healthyReleaseFixture(), monitor(), remoteScripts() (+2 more)

### Community 96 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, dev, dev:server, dev:web, icons:pwa, lint (+4 more)

### Community 97 - "background-task-tracker.ts"
Cohesion: 0.27
Nodes (6): snapshot(), backgroundTaskSnapshot(), BackgroundTaskTracker, BackgroundTaskUpdate, cloneSnapshot(), taskFingerprint()

### Community 98 - "html-preview.ts"
Cohesion: 0.29
Nodes (8): blockedAttributes, blockedElements, createHtmlPreviewDocument(), disabledControls, HTML_PREVIEW_CSP, isAllowedDataSource(), sanitizeTree(), HtmlPreview()

### Community 99 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): ignorePatterns, rules, react/only-export-components, react/rules-of-hooks, $schema, graphify/.cache/**, graphify/vendor/**, graphify/.venv/** (+1 more)

### Community 100 - "generate-pwa-icons.ts"
Cohesion: 0.27
Nodes (6): legacyAppleTouchIcons, renderIcon(), root, manifestIconSizes, root, appIconSvg()

### Community 102 - "bridge.rs"
Cohesion: 0.31
Nodes (7): deep_link_subscription_reports_readiness(), emit(), identity_cannot_break_out_of_the_script(), json_string(), String, script(), script_defines_the_bridge_and_carries_identity()

### Community 103 - "screenshot-stability.test.ts"
Cohesion: 0.25
Nodes (5): ScreenshotPair, screenshotsAreClose(), bitmaps, FixtureBitmap, FixtureCanvas

### Community 104 - "promotion-setup-execution.test.ts"
Cohesion: 0.25
Nodes (4): Context, fixtures, run, setup()

### Community 105 - "remote-node-client.test.ts"
Cohesion: 0.28
Nodes (5): client(), servers, session, TERMINAL_REQUEST_TIMEOUT_MS, TERMINAL_STARTUP_TIMEOUT_MS

### Community 106 - "session-store-durability.test.ts"
Cohesion: 0.31
Nodes (7): disk, fixture(), fixtures, prompt(), ready(), releases, session()

### Community 107 - "tmux-errors.test.ts"
Cohesion: 0.25
Nodes (6): directories, { execute }, files, links, listener(), server()

### Community 108 - "deleteSession"
Cohesion: 0.28
Nodes (9): addComputer(), deleteKnowledgeRoot(), deleteSession(), removeComputer(), requestVoid(), removeRoot(), ComputersDialog(), remove() (+1 more)

### Community 109 - "package.json"
Cohesion: 0.25
Nodes (7): engines, node, name, packageManager, private, type, version

### Community 110 - "release-publication.test.ts"
Cohesion: 0.29
Nodes (4): directories, exec, publicationFixture(), PublicationSyncEvent

### Community 111 - "render-workspace-gifs.ts"
Cohesion: 0.29
Nodes (6): directory, { values }, workflows, pnpm, onlyBuiltDependencies, ffmpeg-static

### Community 113 - "recovery-context.ts"
Cohesion: 0.38
Nodes (4): BriefMessage, buildRecoveryBrief(), formattedLength(), RecoveryBrief

### Community 114 - "settings.ts"
Cohesion: 0.38
Nodes (4): HubConfig, load(), showError(), showUnreachableNotice()

### Community 115 - "composer-layout.test.ts"
Cohesion: 0.53
Nodes (3): atRule(), composerPointerBlock(), pointerLayout()

### Community 116 - "knowledge-restore.ts"
Cohesion: 0.47
Nodes (3): knowledgeRestoreAction, KnowledgeRestoreState, base

### Community 117 - "usePanelWidth"
Cohesion: 0.47
Nodes (6): boundWidth(), readWidth(), storeWidth(), usePanelWidth(), commit(), finish()

### Community 118 - "KnowledgeRootChoices.test.tsx"
Cohesion: 0.40
Nodes (4): actions, computers, root, session

## Knowledge Gaps
- **735 isolated node(s):** `$schema`, `graphify/vendor/**`, `graphify/.venv/**`, `graphify/.cache/**`, `typescript` (+730 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1136 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AgentService` connect `AgentService` to `SessionDetail`, `SessionStore`, `agent-service.ts`, `claude-agent-service.ts`, `CopilotSessionLike`, `session-resource-routes.test.ts`, `background-task-adapter.ts`, `directory-browser.ts`, `.createSession`, `TerminalSessionController`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `SessionStore` connect `SessionStore` to `AgentService`, `SessionDetail`, `TerminalSessionController`, `session-store.ts`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `backgroundTasksFromEvents()` connect `backgroundTasksFromEvents` to `background-task-adapter.ts`, `recordValue`?**
  _High betweenness centrality (0.000) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `App()` (e.g. with `readAccentTheme()` and `readDefaultRuntimeSettings()`) actually correct?**
  _`App()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `graphify/vendor/**`, `graphify/.venv/**` to the rest of the system?**
  _735 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AgentService` be split into smaller, more focused modules?**
  _Cohesion score 0.047437888198757765 - nodes in this community are weakly interconnected._
- **Should `App` be split into smaller, more focused modules?**
  _Cohesion score 0.03725901508340825 - nodes in this community are weakly interconnected._
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
- `docs/design/session-manager.md`
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
